// Content script for AI PDF Agent Chrome extension

let pdfUrl: string | null = null;

// Check if current page is a PDF
function isPDFPage(): boolean {
  // Check MIME type
  if (document.contentType === 'application/pdf') {
    return true;
  }
  
  // Check URL extension
  if (location.pathname.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  
  // Check for PDF embeds/objects
  if (document.querySelector('embed[type="application/pdf"]') !== null) {
    return true;
  }
  
  if (document.querySelector('object[type="application/pdf"]') !== null) {
    return true;
  }
  
  // Check for Chrome's PDF viewer
  if (document.querySelector('embed[id="plugin"]') && location.href.includes('.pdf')) {
    return true;
  }
  
  // Check for PDF.js viewer
  if (document.querySelector('#viewer') && document.querySelector('.page')) {
    return true;
  }
  
  // Additional check for Chrome PDF viewer - look for specific PDF viewer elements
  if (document.documentElement.innerHTML.includes('application/pdf') || 
      document.querySelector('chrome-pdf-viewer')) {
    return true;
  }
  
  return false;
}

// Get PDF URL from current page
function getPDFUrl(): string | null {
  // Direct PDF in browser
  if (document.contentType === 'application/pdf') {
    return location.href;
  }
  
  // Check for embedded PDFs
  const pdfEmbed = document.querySelector('embed[type="application/pdf"]') as HTMLEmbedElement;
  if (pdfEmbed && pdfEmbed.src) {
    return pdfEmbed.src;
  }
  
  const pdfObject = document.querySelector('object[type="application/pdf"]') as HTMLObjectElement;
  if (pdfObject && pdfObject.data) {
    return pdfObject.data;
  }
  
  // Chrome PDF viewer
  const chromePluginEmbed = document.querySelector('embed[id="plugin"]') as HTMLEmbedElement;
  if (chromePluginEmbed && chromePluginEmbed.src && chromePluginEmbed.src.endsWith('.pdf')) {
    return chromePluginEmbed.src;
  }
  
  // If URL ends with .pdf, use current URL
  if (location.pathname.toLowerCase().endsWith('.pdf')) {
    return location.href;
  }
  
  // Check for chrome-pdf-viewer element (newer Chrome versions)
  const chromePdfViewer = document.querySelector('chrome-pdf-viewer');
  if (chromePdfViewer) {
    return location.href;
  }
  
  return null;
}

// Fetch PDF data as ArrayBuffer
async function fetchPDFData(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error fetching PDF:', error);
    throw error;
  }
}

// Initialize content script
function init() {
  console.log('Content script initializing on:', location.href);
  if (isPDFPage()) {
    pdfUrl = getPDFUrl();
    console.log('PDF detected:', pdfUrl);
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'PDF_DETECTED',
      url: pdfUrl
    });
  } else {
    console.log('No PDF detected on this page');
  }
}

// Listen for messages from background/side panel
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Content script received message:', request.type, 'at URL:', location.href);
  
  if (request.type === 'EXTRACT_PDF_DATA') {
    if (pdfUrl) {
      fetchPDFData(pdfUrl)
        .then(arrayBuffer => {
          console.log('Successfully fetched PDF data, size:', arrayBuffer.byteLength);
          sendResponse({
            success: true,
            data: Array.from(new Uint8Array(arrayBuffer)),
            url: pdfUrl
          });
        })
        .catch(error => {
          console.error('Error fetching PDF data:', error);
          sendResponse({
            success: false,
            error: error.message
          });
        });
    } else {
      console.log('No PDF URL available for data extraction');
      sendResponse({
        success: false,
        error: 'No PDF found on this page'
      });
    }
    return true; // Will respond asynchronously
  }
  
  if (request.type === 'CHECK_PDF') {
    // Re-check for PDF in case it wasn't detected initially
    const wasPDFDetected = !!pdfUrl;
    
    // Force re-check PDF detection
    const currentIsPDF = isPDFPage();
    const currentPDFUrl = getPDFUrl();
    
    // Update our internal state
    if (currentIsPDF && currentPDFUrl) {
      pdfUrl = currentPDFUrl;
    }
    
    console.log('CHECK_PDF response:', { 
      wasPDFDetected, 
      currentIsPDF, 
      url: pdfUrl,
      documentType: document.contentType,
      pathname: location.pathname 
    });
    
    sendResponse({
      isPDF: currentIsPDF,
      url: pdfUrl
    });
    
    return false; // Respond synchronously
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};