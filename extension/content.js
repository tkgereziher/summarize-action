// Prevent duplicate injection
if (window.SummarizeActionInjected) {
  // If already injected, we just return (logic handled by messages)
} else {
  window.SummarizeActionInjected = true;

  // Create host and shadow DOM
  const host = document.createElement('div');
  host.id = 'summarize-action-host';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  // Add styles
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('content.css');
  shadow.appendChild(styleLink);

  // Create UI Structure
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="header">
        <h2 class="title">Summarize & Action</h2>
        <button class="close-btn">&times;</button>
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
  const contentDiv = overlay.querySelector('#result-content');

  // Close logic
  function closeModal() {
    overlay.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Listen for messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SHOW_MODAL') {
      // Reset State
      contentDiv.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <span>Summarizing selection...</span>
        </div>
      `;
      overlay.classList.add('open');

      // Request summary from background (which calls server)
      chrome.runtime.sendMessage({
        action: 'FETCH_SUMMARY',
        text: request.text
      }, (response) => {
        if (chrome.runtime.lastError) {
          contentDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        if (response && response.error) {
          contentDiv.textContent = 'Error: ' + response.error;
          return;
        }
        renderSummary(response.data);
      });
    }
  });

  function renderSummary(data) {
    if (!data) return;
    
    // Clear loading
    contentDiv.innerHTML = '';

    // Helper to append sections
    const appendSection = (title, content, type = 'text') => {
      const section = document.createElement('div');
      section.className = 'summary-section';
      
      const header = document.createElement('strong');
      header.textContent = title;
      section.appendChild(header);

      if (type === 'text') {
        const div = document.createElement('div');
        div.textContent = content;
        section.appendChild(div);
      } else if (type === 'list') {
        const ul = document.createElement('ul');
        (content || []).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        section.appendChild(ul);
      } else if (type === 'ordered') {
        const ol = document.createElement('ol');
        (content || []).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          ol.appendChild(li);
        });
        section.appendChild(ol);
      }
      contentDiv.appendChild(section);
    };

    if (data.tl_dr) appendSection('TL;DR', data.tl_dr);
    if (data.bullets) appendSection('Key Points', data.bullets, 'list');
    if (data.actions) appendSection('Actions', data.actions, 'ordered');
  }
}
