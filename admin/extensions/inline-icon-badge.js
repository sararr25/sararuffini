/*
 * Editor component for inserting inline icon badges into HTML-enabled copy fields.
 */
(function () {
  var CMS = window.CMS;
  if (!CMS || typeof CMS.registerEditorComponent !== 'function') {
    return;
  }

  var icons = window.SaraCmsMaterialIcons || [
    'movie', 'flash_on', 'travel_explore', 'photo_camera', 'headphones', 'star', 'auto_awesome'
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function badgeClass(style) {
    var base = 'inline-flex items-center align-middle mx-1 border border-black dark:border-white rounded px-1';
    if (style === 'dark') {
      return base + ' bg-black text-white dark:bg-white dark:text-black font-bold';
    }
    return base + ' font-bold';
  }

  CMS.registerEditorComponent({
    id: 'inline-icon-badge',
    label: 'Inline Icon Badge',
    icon: 'new_label',
    mode: 'dialog',
    summary: '{{label}}',
    fields: [
      {
        label: 'Icon',
        name: 'icon',
        widget: 'select',
        options: icons.map(function (icon) {
          return { label: icon, value: icon };
        })
      },
      { label: 'Label', name: 'label', widget: 'string' },
      {
        label: 'Style',
        name: 'style',
        widget: 'select',
        default: 'outline',
        options: [
          { label: 'Outline', value: 'outline' },
          { label: 'Dark Badge', value: 'dark' }
        ]
      }
    ],
    pattern: /<span class="inline-flex items-center align-middle mx-1 border border-black dark:border-white rounded px-1(?<styleClass>[^"]*)">\s*<span class="material-symbols-outlined text-sm mr-1">(?<icon>[^<]+)<\/span>\s*(?<label>[^<]+)\s*<\/span>/,
    fromBlock: function (match) {
      return {
        icon: match.groups && match.groups.icon ? match.groups.icon.trim() : '',
        label: match.groups && match.groups.label ? match.groups.label.trim() : '',
        style: match.groups && /bg-black/.test(match.groups.styleClass || '') ? 'dark' : 'outline'
      };
    },
    toBlock: function (data) {
      var icon = icons.indexOf(data.icon) === -1 ? icons[0] : data.icon;
      return '<span class="' + badgeClass(data.style) + '"><span class="material-symbols-outlined text-sm mr-1">' + icon + '</span> ' + escapeHtml(data.label) + '</span>';
    },
    toPreview: function (data) {
      var icon = icons.indexOf(data.icon) === -1 ? icons[0] : data.icon;
      return '<span class="' + badgeClass(data.style) + '"><span class="material-symbols-outlined text-sm mr-1">' + icon + '</span> ' + escapeHtml(data.label) + '</span>';
    }
  });
})();

/*
 * Fallback for Sveltia builds without registerEditorComponent:
 * add a small insert form beside About intro HTML textareas.
 */
(function () {
  var icons = window.SaraCmsMaterialIcons || ['movie', 'flash_on', 'photo_camera', 'headphones'];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function badgeHtml(icon, label, style) {
    var className = 'inline-flex items-center align-middle mx-1 border border-black dark:border-white rounded px-1 font-bold';
    if (style === 'dark') {
      className = 'inline-flex items-center align-middle mx-1 border border-black dark:border-white rounded px-1 bg-black text-white dark:bg-white dark:text-black font-bold';
    }
    return '<span class="' + className + '"><span class="material-symbols-outlined text-sm mr-1">' + icon + '</span> ' + escapeHtml(label) + '</span>';
  }

  function insertAtCursor(textarea, text) {
    var start = textarea.selectionStart || 0;
    var end = textarea.selectionEnd || 0;
    textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function enhanceTextarea(textarea) {
    if (!textarea || textarea.dataset.srBadgeEnhanced === 'true') return;
    var name = textarea.getAttribute('name') || '';
    var labelText = textarea.closest('label, div, section')?.textContent || '';
    if (!/intro_paragraph_[12]_html/.test(name) && !/Intro Paragraph [12]/i.test(labelText)) return;

    textarea.dataset.srBadgeEnhanced = 'true';

    var panel = document.createElement('div');
    panel.className = 'sr-cms-badge-insert';

    var iconSelect = document.createElement('select');
    icons.forEach(function (icon) {
      var option = document.createElement('option');
      option.value = icon;
      option.textContent = icon;
      iconSelect.appendChild(option);
    });

    var labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Badge label';

    var styleSelect = document.createElement('select');
    [
      ['outline', 'Outline'],
      ['dark', 'Dark badge']
    ].forEach(function (entry) {
      var option = document.createElement('option');
      option.value = entry[0];
      option.textContent = entry[1];
      styleSelect.appendChild(option);
    });

    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Insert icon badge';
    button.addEventListener('click', function () {
      if (!labelInput.value.trim()) return;
      insertAtCursor(textarea, badgeHtml(iconSelect.value, labelInput.value.trim(), styleSelect.value));
      labelInput.value = '';
    });

    panel.appendChild(iconSelect);
    panel.appendChild(labelInput);
    panel.appendChild(styleSelect);
    panel.appendChild(button);
    textarea.insertAdjacentElement('beforebegin', panel);
  }

  function scan() {
    document.querySelectorAll('textarea').forEach(enhanceTextarea);
  }

  var style = document.createElement('style');
  style.textContent = [
    '.sr-cms-badge-insert{display:grid;grid-template-columns:minmax(120px,1fr) minmax(140px,1.2fr) minmax(120px,1fr) auto;gap:8px;margin:8px 0;padding:10px;border:1px solid #d4d4d4;border-radius:8px;background:#fafafa}',
    '.sr-cms-badge-insert select,.sr-cms-badge-insert input{min-width:0;border:1px solid #c7c7c7;border-radius:6px;padding:7px 8px;font:500 13px system-ui}',
    '.sr-cms-badge-insert button{border:0;border-radius:6px;background:#111;color:#fff;padding:7px 10px;font:700 12px system-ui;cursor:pointer}',
    '@media (max-width:700px){.sr-cms-badge-insert{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(style);

  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  scan();
})();
