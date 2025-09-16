import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFDocumentType, PDFPageInfo, OperationResult } from '../types';

// Configure pdf.js worker to use bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');

// Helper function to create a proper ArrayBuffer from Uint8Array
function createArrayBuffer(uint8Array: Uint8Array): ArrayBuffer {
  // Create a new ArrayBuffer and copy the data to prevent detached buffer issues
  const arrayBuffer = new ArrayBuffer(uint8Array.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(uint8Array);
  return arrayBuffer;
}

// Helper function to ensure we have a valid ArrayBuffer
function ensureValidArrayBuffer(data: ArrayBuffer): ArrayBuffer {
  try {
    // Try to access the byteLength to check if the buffer is detached
    const length = data.byteLength;
    if (length === 0) {
      throw new Error('Empty ArrayBuffer');
    }
    
    // Create a fresh copy to ensure it's not detached
    const uint8Array = new Uint8Array(data);
    const newBuffer = new ArrayBuffer(uint8Array.length);
    const newView = new Uint8Array(newBuffer);
    newView.set(uint8Array);
    return newBuffer;
  } catch (error) {
    // If the buffer is detached or there's an error, we can't recover it
    throw new Error('ArrayBuffer is detached and cannot be used');
  }
}

export class PDFProcessor {
  
  static async loadPDFDocument(data: Uint8Array): Promise<PDFDocumentType> {
    try {
      // Create a temporary ArrayBuffer only for PDF.js library usage
      const tempArrayBuffer = new ArrayBuffer(data.length);
      const tempView = new Uint8Array(tempArrayBuffer);
      tempView.set(data);
      
      const loadingTask = pdfjsLib.getDocument({ data: tempArrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      const pages: PDFPageInfo[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        pages.push({
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
          rotation: viewport.rotation
        });
      }
      
      return {
        pages,
        data: data, // Store the original Uint8Array data
        filename: 'document.pdf'
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF document');
    }
  }
  
  static async splitPDFIntoPages(data: ArrayBuffer): Promise<OperationResult[]> {
    try {
      const validData = ensureValidArrayBuffer(data);
      const pdfDoc = await PDFDocument.load(validData);
      const totalPages = pdfDoc.getPageCount();
      const results: OperationResult[] = [];
      
      // Create one PDF for each page
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageIndex]);
        newDoc.addPage(copiedPage);
        
        const pdfBytes = await newDoc.save();
        results.push({
          success: true,
          data: createArrayBuffer(pdfBytes),
          filename: `page_${pageIndex + 1}.pdf`
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error splitting PDF into pages:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Failed to split PDF into pages'
      }];
    }
  }
  
  static async splitPDF(data: ArrayBuffer, pageRanges: number[][]): Promise<OperationResult[]> {
    try {
      const validData = ensureValidArrayBuffer(data);
      const pdfDoc = await PDFDocument.load(validData);
      const results: OperationResult[] = [];
      
      for (let i = 0; i < pageRanges.length; i++) {
        const range = pageRanges[i];
        const newDoc = await PDFDocument.create();
        
        for (const pageNum of range) {
          if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
            const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
            newDoc.addPage(copiedPage);
          }
        }
        
        const pdfBytes = await newDoc.save();
        results.push({
          success: true,
          data: createArrayBuffer(pdfBytes),
          filename: `split_part_${i + 1}.pdf`
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Failed to split PDF'
      }];
    }
  }
  
  static async deletePages(data: ArrayBuffer, pagesToDelete: number[]): Promise<OperationResult> {
    try {
      const validData = ensureValidArrayBuffer(data);
      const pdfDoc = await PDFDocument.load(validData);
      const totalPages = pdfDoc.getPageCount();
      
      // Sort in descending order to avoid index issues when removing
      const sortedPages = pagesToDelete.sort((a, b) => b - a);
      
      for (const pageNum of sortedPages) {
        if (pageNum > 0 && pageNum <= totalPages) {
          pdfDoc.removePage(pageNum - 1);
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      return {
        success: true,
        data: createArrayBuffer(pdfBytes),
        filename: 'pages_deleted.pdf'
      };
    } catch (error) {
      console.error('Error deleting pages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete pages'
      };
    }
  }
  
  static async reorderPages(data: ArrayBuffer, newOrder: number[]): Promise<OperationResult> {
    try {
      const validData = ensureValidArrayBuffer(data);
      const pdfDoc = await PDFDocument.load(validData);
      const newDoc = await PDFDocument.create();
      
      for (const pageNum of newOrder) {
        if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
          const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
          newDoc.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newDoc.save();
      return {
        success: true,
        data: createArrayBuffer(pdfBytes),
        filename: 'reordered.pdf'
      };
    } catch (error) {
      console.error('Error reordering pages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder pages'
      };
    }
  }
  
  static async mergePDFs(documents: ArrayBuffer[]): Promise<OperationResult> {
    try {
      const mergedDoc = await PDFDocument.create();
      
      for (const data of documents) {
        const validData = ensureValidArrayBuffer(data);
        const pdfDoc = await PDFDocument.load(validData);
        const pageCount = pdfDoc.getPageCount();
        const pageIndices = Array.from(Array(pageCount).keys());
        
        const copiedPages = await mergedDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => mergedDoc.addPage(page));
      }
      
      const pdfBytes = await mergedDoc.save();
      return {
        success: true,
        data: createArrayBuffer(pdfBytes),
        filename: 'merged.pdf'
      };
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge PDFs'
      };
    }
  }
  
  static async extractPages(data: ArrayBuffer, pageNumbers: number[]): Promise<OperationResult> {
    try {
      const validData = ensureValidArrayBuffer(data);
      const pdfDoc = await PDFDocument.load(validData);
      const newDoc = await PDFDocument.create();
      
      for (const pageNum of pageNumbers) {
        if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
          const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNum - 1]);
          newDoc.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newDoc.save();
      return {
        success: true,
        data: createArrayBuffer(pdfBytes),
        filename: 'extracted_pages.pdf'
      };
    } catch (error) {
      console.error('Error extracting pages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract pages'
      };
    }
  }
}