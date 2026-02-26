import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportPlan } from '../ExportPlan.js';
import type { IPlanRepository } from '../../../domain/ports/IPlanRepository.js';
import type { IDocumentExporter } from '../../../domain/ports/IDocumentExporter.js';
import type { VideoPlan } from '../../../domain/entities/VideoPlan.js';
import type { ExportResult } from '../../../../../shared/types/export.js';

describe('ExportPlan', () => {
  let planRepo: IPlanRepository;
  let documentExporter: IDocumentExporter;
  let useCase: ExportPlan;

  const userId = 'user-uuid-1';
  const planId = 'plan-uuid-1';

  const mockPlan: VideoPlan = {
    id: planId,
    title: 'Brain Hacks 101',
    markdown: '# Plan\n\nDetailed plan content here...',
    niche: 'psychology',
    createdAt: new Date('2026-01-15'),
  };

  const mockPdfResult: ExportResult = {
    buffer: Buffer.from('mock-pdf-content'),
    filename: 'brain-hacks-101.pdf',
    contentType: 'application/pdf',
  };

  const mockDocxResult: ExportResult = {
    buffer: Buffer.from('mock-docx-content'),
    filename: 'brain-hacks-101.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  beforeEach(() => {
    planRepo = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockPlan),
      delete: vi.fn(),
      countAll: vi.fn().mockResolvedValue(0),
    };

    documentExporter = {
      export: vi.fn().mockResolvedValue(mockPdfResult),
    };

    useCase = new ExportPlan(planRepo, documentExporter);
  });

  it('should fetch plan by id scoped to user', async () => {
    await useCase.execute(planId, 'pdf', userId);

    expect(planRepo.findById).toHaveBeenCalledWith(planId, userId);
  });

  it('should call documentExporter.export with plan data for PDF', async () => {
    await useCase.execute(planId, 'pdf', userId);

    expect(documentExporter.export).toHaveBeenCalledWith(
      mockPlan.markdown,
      mockPlan.title,
      mockPlan.niche,
      'pdf',
      expect.any(String),
    );
  });

  it('should call documentExporter.export with plan data for DOCX', async () => {
    (documentExporter.export as ReturnType<typeof vi.fn>).mockResolvedValue(mockDocxResult);

    const result = await useCase.execute(planId, 'docx', userId);

    expect(documentExporter.export).toHaveBeenCalledWith(
      mockPlan.markdown,
      mockPlan.title,
      mockPlan.niche,
      'docx',
      expect.any(String),
    );
    expect(result).toEqual(mockDocxResult);
  });

  it('should return ExportResult with buffer, filename, and contentType', async () => {
    const result = await useCase.execute(planId, 'pdf', userId);

    expect(result).toEqual(mockPdfResult);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.filename).toBe('brain-hacks-101.pdf');
    expect(result.contentType).toBe('application/pdf');
  });

  it('should throw "Plan not found" when plan does not exist', async () => {
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(useCase.execute(planId, 'pdf', userId)).rejects.toThrow('Plan not found');
  });

  it('should propagate errors from documentExporter', async () => {
    (documentExporter.export as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Export failed'),
    );

    await expect(useCase.execute(planId, 'pdf', userId)).rejects.toThrow('Export failed');
  });

  it('should handle plan with string createdAt', async () => {
    const planWithStringDate: VideoPlan = {
      ...mockPlan,
      createdAt: '2026-01-15T00:00:00.000Z' as unknown as Date,
    };
    (planRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(planWithStringDate);

    await useCase.execute(planId, 'pdf', userId);

    expect(documentExporter.export).toHaveBeenCalledWith(
      mockPlan.markdown,
      mockPlan.title,
      mockPlan.niche,
      'pdf',
      '2026-01-15T00:00:00.000Z',
    );
  });
});
