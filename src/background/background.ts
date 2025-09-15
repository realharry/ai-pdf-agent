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
  
  if (request.type === 'GET_PDF_DATA') {
    // Forward message to content script to get PDF data
    // Get the active tab since the message comes from sidepanel
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs[0]?.id) {
          return chrome.tabs.sendMessage(tabs[0].id, { type: 'EXTRACT_PDF_DATA' });
        } else {
          throw new Error('No active tab found');
        }
      })
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

export {};