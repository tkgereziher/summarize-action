// Runs in MV3 service worker context
// Opens a welcome tab when the extension is first installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === 'install') {
      // Open a welcome page on fresh install
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    } else if (details.reason === 'update') {
      // Optionally open changelog on update for major versions:
      // const previous = details.previousVersion || 'unknown';
      // chrome.tabs.create({ url: chrome.runtime.getURL('changelog.html') });
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

// Handle context menu click (sends message to content/popup to populate selection)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-selection') {
    // Open popup by opening a new tab with the extension popup? (Not allowed)
    // Instead, send a message to the content script to copy the selection or
    // open a new tab with a lightweight in-extension page that runs summarize.
    // Here we open the popup-like page in a tab:
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    // You can also store the selected text and the popup will pick it up from the page
    // via content script or via messaging. For now, opening popup page is simplest.
  }
});