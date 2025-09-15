import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFDocumentType, PDFPageInfo, OperationResult } from '../types';

// Configure pdf.js worker to use bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');

export class PDFProcessor {
  
  static async loadPDFDocument(data: ArrayBuffer): Promise<PDFDocumentType> {
    try {
      const loadingTask = pdfjsLib.getDocument({ data });
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
        data,
        filename: 'document.pdf'
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF document');
    }
  }
  
  static async splitPDF(data: ArrayBuffer, pageRanges: number[][]): Promise<OperationResult[]> {
    try {
      const pdfDoc = await PDFDocument.load(data);
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
          data: pdfBytes.buffer.slice(0) as ArrayBuffer,
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
      const pdfDoc = await PDFDocument.load(data);
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
        data: pdfBytes.buffer.slice(0) as ArrayBuffer,
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
      const pdfDoc = await PDFDocument.load(data);
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
        data: pdfBytes.buffer.slice(0) as ArrayBuffer,
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
        const pdfDoc = await PDFDocument.load(data);
        const pageCount = pdfDoc.getPageCount();
        const pageIndices = Array.from(Array(pageCount).keys());
        
        const copiedPages = await mergedDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => mergedDoc.addPage(page));
      }
      
      const pdfBytes = await mergedDoc.save();
      return {
        success: true,
        data: pdfBytes.buffer.slice(0) as ArrayBuffer,
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
      const pdfDoc = await PDFDocument.load(data);
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
        data: pdfBytes.buffer.slice(0) as ArrayBuffer,
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