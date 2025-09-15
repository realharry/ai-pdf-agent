// Content script for AI PDF Agent Chrome extension

let pdfUrl: string | null = null;

// Check if current page is a PDF
function isPDFPage(): boolean {
  return document.contentType === 'application/pdf' || 
         location.pathname.toLowerCase().endsWith('.pdf') ||
         document.querySelector('embed[type="application/pdf"]') !== null;
}

// Get PDF URL from current page
function getPDFUrl(): string | null {
  if (document.contentType === 'application/pdf') {
    return location.href;
  }
  
  const pdfEmbed = document.querySelector('embed[type="application/pdf"]') as HTMLEmbedElement;
  if (pdfEmbed && pdfEmbed.src) {
    return pdfEmbed.src;
  }
  
  const pdfObject = document.querySelector('object[type="application/pdf"]') as HTMLObjectElement;
  if (pdfObject && pdfObject.data) {
    return pdfObject.data;
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
  console.log('Content script received message:', request.type);
  
  if (request.type === 'EXTRACT_PDF_DATA') {
    if (pdfUrl) {
      fetchPDFData(pdfUrl)
        .then(arrayBuffer => {
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
      sendResponse({
        success: false,
        error: 'No PDF found on this page'
      });
    }
    return true; // Will respond asynchronously
  }
  
  if (request.type === 'CHECK_PDF') {
    // Re-check for PDF in case it wasn't detected initially
    if (!pdfUrl) {
      pdfUrl = getPDFUrl();
    }
    const isPDF = isPDFPage();
    console.log('CHECK_PDF response:', { isPDF, url: pdfUrl });
    sendResponse({
      isPDF: isPDF,
      url: pdfUrl
    });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};