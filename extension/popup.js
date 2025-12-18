const inputEl = document.getElementById('input');
const outEl = document.getElementById('output');
const loadEl = document.getElementById('loading');

async function pasteSelection() {
  // Try to get the page selection via scripting
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
    outEl.innerHTML = `<strong>TL;DR</strong><div>${data.tl_dr}</div>
      <strong>Key points</strong><ul>${(data.bullets||[]).map(b=>`<li>${b}</li>`).join('')}</ul>
      <strong>Actions</strong><ol>${(data.actions||[]).map(a=>`<li>${a}</li>`).join('')}</ol>`;
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