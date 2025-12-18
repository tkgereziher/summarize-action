const inputEl = document.getElementById('input');
const outEl = document.getElementById('output');
const loadEl = document.getElementById('loading');

async function pasteSelection() {
  // 1. Check if we have pending text from the background script
  const { pendingText } = await chrome.storage.local.get('pendingText');
  if (pendingText) {
    inputEl.value = pendingText;
    // Clear it so it doesn't persist forever
    await chrome.storage.local.remove('pendingText');
    return;
  }

  // 2. Fallback: Try to get the page selection via scripting (mostly for dev/debug or if opened manually)
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // If the active tab is this popup itself (common if opened in new tab), executeScript will fail or get nothing meaningful
    if (tab.url.startsWith('chrome-extension://')) return;

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    const text = results?.[0]?.result || '';
    if (text) inputEl.value = text;
  } catch (e) {
    // ignore
  }
}

async function summarize() {
  const text = inputEl.value.trim();
  if (!text) return alert('Please paste or select some text first.');

  loadEl.style.display = 'block';
  outEl.style.display = 'none';
  try {
    // Replace with your backend endpoint
    const res = await fetch('http://localhost:3000/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    
    // Clear previous content
    outEl.innerHTML = '';

    // TL;DR
    const tldrHeader = document.createElement('strong');
    tldrHeader.textContent = 'TL;DR';
    const tldrDiv = document.createElement('div');
    tldrDiv.textContent = data.tl_dr;
    outEl.appendChild(tldrHeader);
    outEl.appendChild(tldrDiv);

    // Key points
    if (data.bullets && data.bullets.length) {
      const bulletHeader = document.createElement('strong');
      bulletHeader.textContent = 'Key points';
      const bulletList = document.createElement('ul');
      data.bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        bulletList.appendChild(li);
      });
      outEl.appendChild(bulletHeader);
      outEl.appendChild(bulletList);
    }

    // Actions
    if (data.actions && data.actions.length) {
      const actionHeader = document.createElement('strong');
      actionHeader.textContent = 'Actions';
      const actionList = document.createElement('ol');
      data.actions.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a;
        actionList.appendChild(li);
      });
      outEl.appendChild(actionHeader);
      outEl.appendChild(actionList);
    }

    outEl.style.display = 'block';

    // save to local history
    const history = (await chrome.storage.local.get('history')).history || [];
    history.unshift({ text, summary: data, ts: Date.now() });
    await chrome.storage.local.set({ history: history.slice(0, 100) });

  } catch (err) {
    outEl.innerText = 'Error summarizing: ' + (err.message || err);
    outEl.style.display = 'block';
  } finally {
    loadEl.style.display = 'none';
  }
}

document.getElementById('summarize').addEventListener('click', summarize);

pasteSelection();

(async function showFirstRun() {
  const { seenOnboard } = await chrome.storage.local.get(['seenOnboard']);
  if (!seenOnboard) {
    // create a small banner at the top of popup
    const banner = document.createElement('div');
    banner.style = 'background:#e8f0fe;padding:8px;border-radius:6px;margin-bottom:8px;font-size:13px';
    banner.innerHTML = '<strong>Welcome!</strong> Select text on a page and click "Summarize". <button id="dismissOnboard" style="margin-left:8px">Got it</button>';
    document.body.insertBefore(banner, document.body.firstChild);
    document.getElementById('dismissOnboard').addEventListener('click', async () => {
      banner.remove();
      await chrome.storage.local.set({ seenOnboard: true });
    });
  }
})();