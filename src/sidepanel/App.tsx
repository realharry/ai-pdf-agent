import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PDFProcessor } from '@/lib/pdf-operations';
import { SidePanelState } from '@/types';
import { downloadFile, generateFilename, formatFileSize } from '@/lib/utils';
import { FileText, Download, Scissors, Trash2, ArrowUpDown } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SidePanelState>({
    currentPDF: null,
    isLoading: false,
    error: null,
    operations: []
  });

  const [selectedPages, setSelectedPages] = useState<string>('');
  const [reorderPages, setReorderPages] = useState<string>('');

  useEffect(() => {
    checkForPDF();
  }, []);

  const checkForPDF = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_PDF' });
      
      if (response.isPDF && response.url) {
        await loadPDF();
      } else {
        setState(prev => ({
          ...prev,
          error: 'No PDF found on this page. Please navigate to a PDF file.',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check for PDF',
        isLoading: false
      }));
    }
  };

  const loadPDF = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_PDF_DATA' });
      
      if (response.success && response.data) {
        const arrayBuffer = new Uint8Array(response.data).buffer;
        const pdfDocument = await PDFProcessor.loadPDFDocument(arrayBuffer);
        
        setState(prev => ({
          ...prev,
          currentPDF: pdfDocument,
          isLoading: false
        }));
      } else {
        throw new Error(response.error || 'Failed to load PDF data');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load PDF',
        isLoading: false
      }));
    }
  };

  const parsePageNumbers = (input: string): number[] => {
    if (!input.trim()) return [];
    
    const ranges = input.split(',').map(s => s.trim());
    const pages: number[] = [];
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i > 0 && i <= (state.currentPDF?.pages.length || 0)) {
              pages.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(range, 10);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= (state.currentPDF?.pages.length || 0)) {
          pages.push(pageNum);
        }
      }
    }
    
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const handleSplitPDF = async () => {
    if (!state.currentPDF || !selectedPages.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const pages = parsePageNumbers(selectedPages);
      if (pages.length === 0) {
        throw new Error('Please enter valid page numbers');
      }
      
      const results = await PDFProcessor.splitPDF(state.currentPDF.data, [pages]);
      
      if (results[0].success && results[0].data) {
        const filename = generateFilename('split', 'pages');
        downloadFile(results[0].data, filename);
      } else {
        throw new Error(results[0].error || 'Failed to split PDF');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to split PDF'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeletePages = async () => {
    if (!state.currentPDF || !selectedPages.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const pages = parsePageNumbers(selectedPages);
      if (pages.length === 0) {
        throw new Error('Please enter valid page numbers to delete');
      }
      
      const result = await PDFProcessor.deletePages(state.currentPDF.data, pages);
      
      if (result.success && result.data) {
        const filename = generateFilename('modified', 'deleted_pages');
        downloadFile(result.data, filename);
      } else {
        throw new Error(result.error || 'Failed to delete pages');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete pages'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleReorderPages = async () => {
    if (!state.currentPDF || !reorderPages.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const pages = parsePageNumbers(reorderPages);
      if (pages.length === 0) {
        throw new Error('Please enter valid page order');
      }
      
      const result = await PDFProcessor.reorderPages(state.currentPDF.data, pages);
      
      if (result.success && result.data) {
        const filename = generateFilename('reordered', 'pages');
        downloadFile(result.data, filename);
      } else {
        throw new Error(result.error || 'Failed to reorder pages');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reorder pages'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleExtractPages = async () => {
    if (!state.currentPDF || !selectedPages.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const pages = parsePageNumbers(selectedPages);
      if (pages.length === 0) {
        throw new Error('Please enter valid page numbers to extract');
      }
      
      const result = await PDFProcessor.extractPages(state.currentPDF.data, pages);
      
      if (result.success && result.data) {
        const filename = generateFilename('extracted', 'pages');
        downloadFile(result.data, filename);
      } else {
        throw new Error(result.error || 'Failed to extract pages');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to extract pages'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{state.error}</p>
            <Button onClick={checkForPDF} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state.currentPDF) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No PDF Found</CardTitle>
            <CardDescription>
              Please navigate to a PDF file to use the PDF manipulation tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkForPDF} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Check for PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            PDF Document
          </CardTitle>
          <CardDescription>
            {state.currentPDF.pages.length} pages • {formatFileSize(state.currentPDF.data.byteLength)}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scissors className="mr-2 h-5 w-5" />
            Split & Extract Pages
          </CardTitle>
          <CardDescription>
            Enter page numbers (e.g., "1,3,5-8") to split or extract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pages">Page Numbers</Label>
            <Input
              id="pages"
              value={selectedPages}
              onChange={(e) => setSelectedPages(e.target.value)}
              placeholder="1,3,5-8"
              className="mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSplitPDF} className="flex-1">
              <Scissors className="mr-2 h-4 w-4" />
              Split
            </Button>
            <Button onClick={handleExtractPages} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Extract
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash2 className="mr-2 h-5 w-5" />
            Delete Pages
          </CardTitle>
          <CardDescription>
            Remove specific pages from the PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDeletePages} variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected Pages
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpDown className="mr-2 h-5 w-5" />
            Reorder Pages
          </CardTitle>
          <CardDescription>
            Specify the new order of pages (e.g., "3,1,2,4-6")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reorder">New Page Order</Label>
            <Input
              id="reorder"
              value={reorderPages}
              onChange={(e) => setReorderPages(e.target.value)}
              placeholder="3,1,2,4-6"
              className="mt-1"
            />
          </div>
          <Button onClick={handleReorderPages} className="w-full">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Reorder Pages
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;