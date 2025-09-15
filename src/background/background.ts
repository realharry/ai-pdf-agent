// Background script for AI PDF Agent Chrome extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI PDF Agent extension installed');
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Error opening side panel:', error);
    }
  }
});

// Listen for messages from content script and sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PDF_DETECTED') {
    console.log('PDF detected in tab:', sender.tab?.id);
    // Could enable extension icon or show notification
  }
  
  if (request.type === 'CHECK_PDF') {
    // Forward message to content script to check for PDF
    // Get the active tab since the message comes from sidepanel
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async tabs => {
        if (!tabs[0]?.id) {
          throw new Error('No active tab found');
        }
        
        const tab = tabs[0];
        const tabId = tab.id!; // We already checked that tab.id exists
        console.log('Sending CHECK_PDF to tab:', tabId, 'URL:', tab.url);
        
        // Check if the tab URL is a PDF file
        if (tab.url && tab.url.toLowerCase().endsWith('.pdf')) {
          console.log('Tab URL is a PDF file');
          return { isPDF: true, url: tab.url };
        }
        
        try {
          // First, try to inject the content script if it's not already there
          // This helps with cases where the content script wasn't injected properly
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          });
          console.log('Content script injected successfully');
        } catch (injectionError) {
          // Content script might already be injected, or injection failed
          console.log('Content script injection result:', injectionError);
        }
        
        // Now try to send the message
        return chrome.tabs.sendMessage(tabId, { type: 'CHECK_PDF' });
      })
      .then(response => {
        console.log('CHECK_PDF response:', response);
        sendResponse(response);
      })
      .catch(error => {
        console.error('CHECK_PDF error:', error);
        sendResponse({ error: error.message, isPDF: false, url: null });
      });
    return true; // Will respond asynchronously
  }
  
  if (request.type === 'GET_PDF_DATA') {
    // Forward message to content script to get PDF data
    // Get the active tab since the message comes from sidepanel
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async tabs => {
        if (!tabs[0]?.id) {
          throw new Error('No active tab found');
        }
        
        const tab = tabs[0];
        const tabId = tab.id!; // We already checked that tab.id exists
        console.log('Sending EXTRACT_PDF_DATA to tab:', tabId);
        
        try {
          // Try to inject the content script if it's not already there
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          });
          console.log('Content script injected for PDF data extraction');
        } catch (injectionError) {
          console.log('Content script injection result:', injectionError);
        }
        
        return chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_PDF_DATA' });
      })
      .then(response => {
        console.log('GET_PDF_DATA response received');
        sendResponse(response);
      })
      .catch(error => {
        console.error('GET_PDF_DATA error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

export {};