export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PDFDocument {
  pages: PDFPageInfo[];
  data: Uint8Array; // Store as Uint8Array to prevent ArrayBuffer detachment
  url?: string;
  filename?: string;
}

export interface PDFOperation {
  type: 'split' | 'delete' | 'reorder' | 'append' | 'extract';
  pages?: number[];
  targetPage?: number;
  sourceDocument?: PDFDocument;
}

export interface OperationResult {
  success: boolean;
  data?: ArrayBuffer;
  filename?: string;
  error?: string;
}

export interface SidePanelState {
  currentPDF: PDFDocument | null;
  isLoading: boolean;
  error: string | null;
  operations: PDFOperation[];
}