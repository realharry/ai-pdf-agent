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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PDF_DETECTED') {
    console.log('PDF detected in tab:', sender.tab?.id);
    // Could enable extension icon or show notification
  }
  
  if (request.type === 'GET_PDF_DATA') {
    // Forward message to content script to get PDF data
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'EXTRACT_PDF_DATA' })
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Will respond asynchronously
    }
  }
});

export {};