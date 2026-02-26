import type { ExportFormat, ExportResult } from '@neurotube/shared/export';

/** Port for exporting documents to different file formats */
export interface IDocumentExporter {
  /**
   * Export markdown content to the specified format
   * @param markdown - Markdown content to export
   * @param title - Document title (used in header and filename)
   * @param niche - Content niche (psychology/ambient)
   * @param format - Target format (pdf or docx)
   * @param createdAt - Optional creation date for metadata
   */
  export(
    markdown: string,
    title: string,
    niche: string,
    format: ExportFormat,
    createdAt?: string,
  ): Promise<ExportResult>;
}
