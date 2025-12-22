// Runs in MV3 service worker context
// Opens a welcome tab when the extension is first installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === 'install') {
      // Open a welcome page ONLY on fresh install
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }

    // Create a handy context menu to start summarizing if desired
    chrome.contextMenus.create({
      id: 'summarize-selection',
      title: 'Summarize selection with Summarize & Action',
      contexts: ['selection']
    });
  } catch (err) {
    console.error('onInstalled handler error', err);
  }
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-selection') {
    if (tab.id) {
      // Send message to content script to show modal
      chrome.tabs.sendMessage(tab.id, { 
        action: 'SHOW_MODAL', 
        text: info.selectionText 
      }).catch(err => {
        // If content script is not ready (e.g. restricted page or not loaded), 
        // we might fail. In a robust app, we'd inject programmatically here as fallback.
        console.warn('Could not send message to tab:', err);
      });
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FETCH_SUMMARY') {
    // Perform fetch here to avoid CORS in content script
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: request.text })
        });
        const data = await res.json();
        sendResponse({ data });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }
});