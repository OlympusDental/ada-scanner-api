(function () {
  // ============================================
  // AUTO-FIXES — run silently in the background
  // ============================================

  // Fix 1: Add lang attribute to <html> if missing
  if (!document.documentElement.getAttribute('lang')) {
    document.documentElement.setAttribute('lang', 'en');
  }

  // Fix 2: Add alt text to images missing it
  document.querySelectorAll('img:not([alt])').forEach(img => {
    const src = img.getAttribute('src') || '';
    const name = src.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');
    img.setAttribute('alt', name || 'Image');
  });

  // Fix 3: Add aria-label to inputs missing labels
  document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
    const type = input.getAttribute('type') || 'text';
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;
    const placeholder = input.getAttribute('placeholder');
    const name = input.getAttribute('name');
    if (placeholder) {
      input.setAttribute('aria-label', placeholder);
    } else if (name) {
      input.setAttribute('aria-label', name.replace(/[-_]/g, ' '));
    } else {
      input.setAttribute('aria-label', type + ' field');
    }
  });

  // Fix 4: Add title to iframes missing it
  document.querySelectorAll('iframe:not([title])').forEach(iframe => {
    iframe.setAttribute('title', 'Embedded content');
  });

  // Fix 5: Add accessible name to empty buttons
  document.querySelectorAll('button').forEach(btn => {
    if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
      btn.setAttribute('aria-label', 'Button');
    }
  });

  // Fix 6: Add skip to main content link
  if (!document.querySelector('[href="#main-content"], [href="#main"]')) {
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.textContent = 'Skip to main content';
    skip.setAttribute('style', `
      position: absolute;
      top: -40px;
      left: 0;
      background: #4D0E6B;
      color: white;
      padding: 8px 16px;
      z-index: 9999;
      font-size: 14px;
      text-decoration: none;
      border-radius: 0 0 4px 0;
      transition: top 0.2s;
    `);
    skip.addEventListener('focus', () => skip.style.top = '0');
    skip.addEventListener('blur', () => skip.style.top = '-40px');
    document.body.insertBefore(skip, document.body.firstChild);

    // Add id to main content if missing
    const main = document.querySelector('main, [role="main"], #content, .content');
    if (main && !main.id) main.id = 'main-content';
  }

  // Fix 7: Ensure page has a title
  if (!document.title || document.title.trim() === '') {
    document.title = document.querySelector('h1')?.textContent || 'Page';
  }

  // ============================================
  // ACCESSIBILITY WIDGET
  // ============================================

  const widgetStyles = `
    #ada-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 52px;
      height: 52px;
      background: #4D0E6B;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #ada-widget-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #ada-widget-panel {
      position: fixed;
      bottom: 88px;
      right: 24px;
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 99998;
      display: none;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    #ada-widget-panel.open {
      display: block;
    }
    #ada-widget-header {
      background: #4D0E6B;
      color: white;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: bold;
    }
    #ada-widget-body {
      padding: 16px;
    }
    .ada-control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .ada-control label {
      font-size: 14px;
      color: #333;
    }
    .ada-control-btns {
      display: flex;
      gap: 6px;
    }
    .ada-control-btns button {
      background: #f0e6f6;
      border: 1px solid #4D0E6B;
      color: #4D0E6B;
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 13px;
    }
    .ada-control-btns button:hover {
      background: #4D0E6B;
      color: white;
    }
    .ada-toggle {
      position: relative;
      width: 40px;
      height: 22px;
    }
    .ada-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .ada-toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #ccc;
      border-radius: 22px;
      transition: 0.3s;
    }
    .ada-toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    .ada-toggle input:checked + .ada-toggle-slider {
      background: #4D0E6B;
    }
    .ada-toggle input:checked + .ada-toggle-slider:before {
      transform: translateX(18px);
    }
    .ada-reset {
      width: 100%;
      padding: 10px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: #555;
      margin-top: 4px;
    }
    .ada-reset:hover {
      background: #eee;
    }
  `;

  // Inject styles
  const styleTag = document.createElement('style');
  styleTag.textContent = widgetStyles;
  document.head.appendChild(styleTag);

  // Create widget button
  const btn = document.createElement('button');
  btn.id = 'ada-widget-btn';
  btn.setAttribute('aria-label', 'Accessibility options');
  btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 5h2l1 4 3-1 .5 2-3.5 1 .5 5h-2l-.5-4-.5 4h-2l.5-5-3.5-1L7 11l3 1 1-4z"/>
  </svg>`;
  document.body.appendChild(btn);

  // Create widget panel
  const panel = document.createElement('div');
  panel.id = 'ada-widget-panel';
  panel.innerHTML = `
    <div id="ada-widget-header">♿ Accessibility Options</div>
    <div id="ada-widget-body">
      <div class="ada-control">
        <label>Text Size</label>
        <div class="ada-control-btns">
          <button onclick="adaTextSize(-1)">A-</button>
          <button onclick="adaTextSize(1)">A+</button>
        </div>
      </div>
      <div class="ada-control">
        <label>High Contrast</label>
        <label class="ada-toggle">
          <input type="checkbox" onchange="adaContrast(this.checked)" id="ada-contrast-toggle"/>
          <span class="ada-toggle-slider"></span>
        </label>
      </div>
      <div class="ada-control">
        <label>Grayscale</label>
        <label class="ada-toggle">
          <input type="checkbox" onchange="adaGrayscale(this.checked)" id="ada-grayscale-toggle"/>
          <span class="ada-toggle-slider"></span>
        </label>
      </div>
      <div class="ada-control">
        <label>Highlight Links</label>
        <label class="ada-toggle">
          <input type="checkbox" onchange="adaHighlightLinks(this.checked)" id="ada-links-toggle"/>
          <span class="ada-toggle-slider"></span>
        </label>
      </div>
      <div class="ada-control">
        <label>Large Cursor</label>
        <label class="ada-toggle">
          <input type="checkbox" onchange="adaLargeCursor(this.checked)" id="ada-cursor-toggle"/>
          <span class="ada-toggle-slider"></span>
        </label>
      </div>
      <button class="ada-reset" onclick="adaReset()">↺ Reset All Settings</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Toggle panel
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  // Close panel when clicking outside
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('open');
    }
  });

  // ============================================
  // WIDGET CONTROLS
  // ============================================

  let currentFontSize = 100;

  window.adaTextSize = function(direction) {
    currentFontSize = Math.min(150, Math.max(80, currentFontSize + direction * 10));
    document.body.style.fontSize = currentFontSize + '%';
  };

  window.adaContrast = function(enabled) {
    if (enabled) {
      document.body.style.filter = (document.body.style.filter || '') + ' contrast(150%)';
    } else {
      document.body.style.filter = document.body.style.filter.replace(/contrast\([^)]+\)/, '');
    }
  };

  window.adaGrayscale = function(enabled) {
    if (enabled) {
      document.body.style.filter = (document.body.style.filter || '') + ' grayscale(100%)';
    } else {
      document.body.style.filter = document.body.style.filter.replace(/grayscale\([^)]+\)/, '');
    }
  };

  window.adaHighlightLinks = function(enabled) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.style.outline = enabled ? '2px solid #4D0E6B' : '';
      link.style.backgroundColor = enabled ? '#f9f4fc' : '';
    });
  };

  window.adaLargeCursor = function(enabled) {
    document.body.style.cursor = enabled ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Cpath d=\'M5 2l20 12-8 2-4 8z\' fill=\'black\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E") 5 2, auto' : '';
  };

  window.adaReset = function() {
    currentFontSize = 100;
    document.body.style.fontSize = '';
    document.body.style.filter = '';
    document.body.style.cursor = '';
    document.querySelectorAll('a').forEach(link => {
      link.style.outline = '';
      link.style.backgroundColor = '';
    });
    document.getElementById('ada-contrast-toggle').checked = false;
    document.getElementById('ada-grayscale-toggle').checked = false;
    document.getElementById('ada-links-toggle').checked = false;
    document.getElementById('ada-cursor-toggle').checked = false;
  };

})();
