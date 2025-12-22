// Prevent duplicate injection
if (window.SummarizeActionInjected) {
  // If already injected, we just return (logic handled by messages)
} else {
  window.SummarizeActionInjected = true;

  let shadow, overlay, contentDiv, lastRequestText;

  function initUI() {
    if (overlay) return;

    // Create host and shadow DOM
    const host = document.createElement('div');
    host.id = 'summarize-action-host';
    document.body.appendChild(host);
    shadow = host.attachShadow({ mode: 'open' });

    // Add styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content.css');
    shadow.appendChild(styleLink);

    // Create UI Structure
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="header">
          <h2 class="title">Summarize & Action</h2>
          <button class="close-btn" title="Close">&times;</button>
        </div>
        <div class="content" id="result-content">
          <div class="loading">
            <div class="spinner"></div>
            <span>Summarizing selection...</span>
          </div>
        </div>
      </div>
    `;
    shadow.appendChild(overlay);

    // References
    const closeBtn = overlay.querySelector('.close-btn');
    contentDiv = overlay.querySelector('#result-content');

    // Close logic
    function closeModal() {
      overlay.classList.remove('open');
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function fetchAndRender(text) {
    lastRequestText = text;
    // Reset State to loading
    contentDiv.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Summarizing selection...</span>
      </div>
    `;

    chrome.runtime.sendMessage({
      action: 'FETCH_SUMMARY',
      text: text
    }, (response) => {
      if (chrome.runtime.lastError) {
        showError('Communication Error: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.error) {
        showError(response.error);
        return;
      }
      renderSummary(response.data);
    });
  }

  function showError(msg) {
    contentDiv.innerHTML = `
      <div class="error-container">
        <div class="error-msg">Error: ${msg}</div>
        <button class="retry-btn">Retry</button>
      </div>
    `;
    contentDiv.querySelector('.retry-btn').addEventListener('click', () => {
      fetchAndRender(lastRequestText);
    });
  }

  // Listen for messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SHOW_MODAL' && request.text) {
      initUI();
      overlay.classList.add('open');
      fetchAndRender(request.text);
    }
  });

  function renderSummary(data) {
    if (!data) {
      showError('No data received from server');
      return;
    }
    
    // Clear loading
    contentDiv.innerHTML = '';

    // Helper to append sections
    const appendSection = (title, content, type = 'text') => {
      if (!content || (Array.isArray(content) && content.length === 0)) return;

      const section = document.createElement('div');
      section.className = 'summary-section';
      
      const header = document.createElement('strong');
      header.textContent = title;
      section.appendChild(header);

      if (type === 'text') {
        const div = document.createElement('div');
        div.textContent = content;
        section.appendChild(div);
      } else if (type === 'list' || type === 'ordered') {
        const tag = type === 'list' ? 'ul' : 'ol';
        const list = document.createElement(tag);
        (Array.isArray(content) ? content : [content]).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
        section.appendChild(list);
      }
      contentDiv.appendChild(section);
    };

    if (data.tl_dr) appendSection('TL;DR', data.tl_dr);
    if (data.bullets) appendSection('Key Points', data.bullets, 'list');
    if (data.actions) appendSection('Actions', data.actions, 'ordered');

    if (contentDiv.innerHTML === '') {
      contentDiv.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Could not generate summary format.</div>';
    }
  }
}
