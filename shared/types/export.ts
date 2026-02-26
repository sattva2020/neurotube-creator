/** Supported export formats for video plans */
export type ExportFormat = 'pdf' | 'docx';

/** Result of exporting a document */
export interface ExportResult {
  /** Binary content of the exported file */
  buffer: Buffer;
  /** Suggested filename (e.g. "my-plan.pdf") */
  filename: string;
  /** MIME content type for HTTP response */
  contentType: string;
}
