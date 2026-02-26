import PDFDocument from 'pdfkit';
import MarkdownIt from 'markdown-it';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import type { IDocumentExporter } from '../../domain/ports/IDocumentExporter.js';
import type { ExportFormat, ExportResult } from '../../../../shared/types/export.js';
import { createLogger } from '../logger.js';

const logger = createLogger('DocumentExporter');

const md = new MarkdownIt();

// ---------------------------------------------------------------------------
// Markdown parsing helpers
// ---------------------------------------------------------------------------

interface MdBlock {
  type: 'heading' | 'paragraph' | 'list-item' | 'code' | 'hr';
  level?: number; // heading level 1-6
  text: string;
  bold?: boolean;
}

/**
 * Parse markdown string into simplified block structure
 * for document rendering (strips HTML, keeps semantic structure).
 */
function parseMarkdown(markdown: string): MdBlock[] {
  const tokens = md.parse(markdown, {});
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.replace('h', ''), 10);
      const inline = tokens[i + 1];
      const text = inline?.children?.map((c) => c.content).join('') ?? inline?.content ?? '';
      blocks.push({ type: 'heading', level, text });
      i += 3; // heading_open, inline, heading_close
      continue;
    }

    if (token.type === 'paragraph_open') {
      const inline = tokens[i + 1];
      const text = inline?.children?.map((c) => c.content).join('') ?? inline?.content ?? '';
      if (text.trim()) {
        blocks.push({ type: 'paragraph', text });
      }
      i += 3; // paragraph_open, inline, paragraph_close
      continue;
    }

    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      i++;
      continue;
    }

    if (token.type === 'list_item_open') {
      // Next meaningful token is paragraph_open → inline → paragraph_close → list_item_close
      if (tokens[i + 1]?.type === 'paragraph_open') {
        const inline = tokens[i + 2];
        const text = inline?.children?.map((c) => c.content).join('') ?? inline?.content ?? '';
        blocks.push({ type: 'list-item', text });
        i += 5; // list_item_open, paragraph_open, inline, paragraph_close, list_item_close
        continue;
      }
      i++;
      continue;
    }

    if (token.type === 'fence' || token.type === 'code_block') {
      blocks.push({ type: 'code', text: token.content });
      i++;
      continue;
    }

    if (token.type === 'hr') {
      blocks.push({ type: 'hr', text: '' });
      i++;
      continue;
    }

    i++;
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Slugify helper for filenames
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

async function generatePdf(
  markdown: string,
  title: string,
  niche: string,
  createdAt?: string,
): Promise<Buffer> {
  logger.debug('generatePdf: starting', { title, niche });

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: title,
        Author: 'NeuroTube Creator',
        Subject: `Video Plan — ${niche}`,
      },
    });

    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {
      logger.debug('generatePdf: complete', { chunks: chunks.length });
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', (err: Error) => {
      logger.error('generatePdf: error', { error: err.message });
      reject(err);
    });

    // --- Header ---
    doc.fontSize(22).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#666666');
    const meta = [`Niche: ${niche}`];
    if (createdAt) meta.push(`Created: ${new Date(createdAt).toLocaleDateString('en-US')}`);
    doc.text(meta.join('  |  '), { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(1);

    // --- Content ---
    const blocks = parseMarkdown(markdown);
    logger.debug('generatePdf: parsed blocks', { count: blocks.length });

    for (const block of blocks) {
      switch (block.type) {
        case 'heading': {
          const sizes: Record<number, number> = { 1: 18, 2: 16, 3: 14, 4: 12, 5: 11, 6: 10 };
          doc.moveDown(0.6);
          doc.fontSize(sizes[block.level ?? 2] ?? 14).font('Helvetica-Bold');
          doc.text(block.text);
          doc.moveDown(0.3);
          break;
        }
        case 'paragraph':
          doc.fontSize(11).font('Helvetica').text(block.text, { lineGap: 3 });
          doc.moveDown(0.4);
          break;
        case 'list-item':
          doc.fontSize(11).font('Helvetica').text(`  •  ${block.text}`, { lineGap: 3, indent: 10 });
          doc.moveDown(0.2);
          break;
        case 'code':
          doc.moveDown(0.2);
          doc.fontSize(9).font('Courier').fillColor('#333333');
          doc.text(block.text, { lineGap: 2 });
          doc.fillColor('#000000');
          doc.moveDown(0.3);
          break;
        case 'hr':
          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
          doc.moveDown(0.5);
          break;
      }
    }

    doc.end();
  });
}

// ---------------------------------------------------------------------------
// DOCX generation
// ---------------------------------------------------------------------------

async function generateDocx(
  markdown: string,
  title: string,
  niche: string,
  createdAt?: string,
): Promise<Buffer> {
  logger.debug('generateDocx: starting', { title, niche });

  const blocks = parseMarkdown(markdown);
  logger.debug('generateDocx: parsed blocks', { count: blocks.length });

  const children: Paragraph[] = [];

  // --- Header ---
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 44, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
  );

  const metaParts = [`Niche: ${niche}`];
  if (createdAt) metaParts.push(`Created: ${new Date(createdAt).toLocaleDateString('en-US')}`);
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: metaParts.join('  |  '), size: 20, color: '666666', font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // Separator
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      },
      spacing: { after: 300 },
    }),
  );

  // --- Content ---
  const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        children.push(
          new Paragraph({
            children: [new TextRun({ text: block.text, bold: true })],
            heading: headingMap[block.level ?? 2] ?? HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
        );
        break;
      case 'paragraph':
        children.push(
          new Paragraph({
            children: [new TextRun({ text: block.text, size: 22, font: 'Calibri' })],
            spacing: { after: 160 },
          }),
        );
        break;
      case 'list-item':
        children.push(
          new Paragraph({
            children: [new TextRun({ text: block.text, size: 22, font: 'Calibri' })],
            bullet: { level: 0 },
            spacing: { after: 80 },
          }),
        );
        break;
      case 'code':
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.text, size: 18, font: 'Courier New', color: '333333' }),
            ],
            spacing: { before: 100, after: 100 },
          }),
        );
        break;
      case 'hr':
        children.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
            spacing: { before: 200, after: 200 },
          }),
        );
        break;
    }
  }

  const doc = new Document({
    sections: [{ children }],
    creator: 'NeuroTube Creator',
    title,
    description: `Video Plan — ${niche}`,
  });

  const buffer = await Packer.toBuffer(doc);
  logger.debug('generateDocx: complete', { bytes: buffer.byteLength });
  return Buffer.from(buffer);
}

// ---------------------------------------------------------------------------
// IDocumentExporter implementation
// ---------------------------------------------------------------------------

export class DocumentExporter implements IDocumentExporter {
  constructor() {
    logger.info('DocumentExporter initialized');
  }

  async export(
    markdown: string,
    title: string,
    niche: string,
    format: ExportFormat,
    createdAt?: string,
  ): Promise<ExportResult> {
    logger.info('export: starting', { format, title, niche });

    const slug = slugify(title) || 'plan';

    if (format === 'pdf') {
      const buffer = await generatePdf(markdown, title, niche, createdAt);
      logger.info('export: PDF generated', { bytes: buffer.byteLength });
      return {
        buffer,
        filename: `${slug}.pdf`,
        contentType: 'application/pdf',
      };
    }

    if (format === 'docx') {
      const buffer = await generateDocx(markdown, title, niche, createdAt);
      logger.info('export: DOCX generated', { bytes: buffer.byteLength });
      return {
        buffer,
        filename: `${slug}.docx`,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }

    logger.error('export: unsupported format', { format });
    throw new Error(`Unsupported export format: ${format}`);
  }
}
