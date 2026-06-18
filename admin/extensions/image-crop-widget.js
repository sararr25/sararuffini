/*
 * Visual crop editor for Sveltia CMS.
 */
(function () {
  var enhancedInputs = new WeakSet();
  var activeEditor = null;

  function clamp(v, min, max, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }

  function normalizeText(v) {
    return String(v || '').replace(/\s+/g, ' ').trim();
  }

  function setNativeValue(input, value) {
    if (!input) return;
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (d && d.set) d.set.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function normalizeAssetUrl(url) {
    if (!url) return '';
    try { return new URL(url, window.location.origin).href; }
    catch (e) { return url; }
  }

  function isBefore(node, ref) {
    return !!(node.compareDocumentPosition(ref) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  /* ── Numeric input detection ─────────────────────────────────────────── */

  function isNumericInput(input) {
    if (!input || input.disabled) return false;
    var type = (input.getAttribute('type') || 'text').toLowerCase();
    if (['button','checkbox','file','hidden','image','radio','range','reset','submit'].indexOf(type) !== -1) return false;
    return type === 'number' ||
           input.getAttribute('role') === 'spinbutton' ||
           /^-?\d+(\.\d+)?$/.test(input.value || '');
  }

  /* ── Image URL extraction ──────────────────────────────────────────────
     Finds a real photo URL inside a DOM node.
     Does NOT rely on naturalWidth (image may not be loaded yet).           */

  function extractImageUrl(node) {
    if (!node) return '';

    // 1. text/url input whose value is an image path
    var inputs = Array.from(node.querySelectorAll('input[type="text"],input[type="url"],input:not([type])'));
    for (var i = 0; i < inputs.length; i++) {
      if (/\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(inputs[i].value || '')) {
        return normalizeAssetUrl(inputs[i].value);
      }
    }

    // 2. <img> tag – exclude our own modal and data-URI icons / SVG icons
    var imgs = Array.from(node.querySelectorAll('img'));
    for (var j = 0; j < imgs.length; j++) {
      var img = imgs[j];
      if (img.closest('.sr-crop-modal') || img.closest('.sr-crop-storage')) continue;
      var src = img.currentSrc || img.getAttribute('src') || '';
      if (!src) continue;
      if (/^data:/.test(src)) continue;           // base64 icon
      if (/\.svg(\?.*)?$/i.test(src)) continue;   // SVG icon file
      return normalizeAssetUrl(src);
    }

    // 3. path text anywhere in the node
    var m = (node.textContent || '').match(
      /(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?[^\s"'<>]*)?/i
    );
    if (m) return normalizeAssetUrl(m[0]);

    return '';
  }

  /* ── Label context for a numeric input ──────────────────────────────── */

  function getInputLabel(input, boundary) {
    var parts = [input.name || '', input.id || '',
                 input.getAttribute('aria-label') || ''];
    var lbid = input.getAttribute('aria-labelledby');
    if (lbid) {
      var lel = document.getElementById(lbid);
      if (lel) parts.push(lel.textContent || '');
    }
    for (var node = input.parentElement;
         node && node !== boundary && node !== document.body;
         node = node.parentElement) {
      Array.from(node.childNodes).forEach(function (c) {
        if (c.nodeType === Node.TEXT_NODE) parts.push(c.textContent);
      });
      Array.from(node.querySelectorAll('label,span,legend')).forEach(function (el) {
        if (!el.contains(input)) parts.push(el.textContent || '');
      });
    }
    return normalizeText(parts.join(' '));
  }

  /* ── Crop inputs (x, y, zoom) ───────────────────────────────────────── */

  function getCropInputs(scope) {
    var inputs = Array.from(scope.querySelectorAll('input')).filter(isNumericInput);

    function find(re) {
      return inputs.find(function (i) { return re.test(getInputLabel(i, scope)); });
    }

    var xInput    = find(/horizontal focal point|focal[^a-z]*x\b|\bx[^a-z]*focal/i);
    var yInput    = find(/vertical focal point|focal[^a-z]*y\b|\by[^a-z]*focal/i);
    var zoomInput = find(/\bzoom\b/i);

    if (!xInput || !yInput || !zoomInput ||
        new Set([xInput, yInput, zoomInput]).size !== 3) {
      xInput = inputs[0]; yInput = inputs[1]; zoomInput = inputs[2];
    }
    return { xInput: xInput, yInput: yInput, zoomInput: zoomInput };
  }

  function readCrop(record) {
    return {
      x:    clamp(record.xInput.value,    0, 100, 50),
      y:    clamp(record.yInput.value,    0, 100, 50),
      zoom: clamp(record.zoomInput.value, 1,   3,  1)
    };
  }

  /* ── Crop-scope title / image title ─────────────────────────────────── */

  function getCropTitle(scope) {
    // Walk UP outside the scope too – the outer field label is often not inside scope
    var searchRoot = scope.parentElement || scope;
    var candidates = Array.from(searchRoot.querySelectorAll(
      'label,legend,h1,h2,h3,h4,h5,h6,p,span,div'
    ))
      .map(function (n) { return normalizeText(n.textContent); })
      .filter(function (t) { return /crop position$/i.test(t) && t.length < 120; })
      .sort(function (a, b) { return a.length - b.length; });
    return candidates.length ? candidates[0] : 'Image Crop Position';
  }

  function getImageTitle(cropTitle) {
    return normalizeText(
      cropTitle
        .replace(/\s+crop position$/i, '')
        .replace(/^add\s+/i, '')          // strip "Add " prefix Sveltia prepends
    );
  }

  /* ── Aspect-ratio inference ──────────────────────────────────────────── */

  function inferAspectRatio(title) {
    var t = title.toLowerCase();
    if (/portrait|profile|avatar/.test(t))      return '4 / 5';
    if (/polaroid|detail/.test(t))              return '4 / 5';
    if (/logo|journey|seo|og.?image/.test(t))   return '1 / 1';
    if (/hero|wide|browser|shot|media/.test(t)) return '16 / 9';
    return '4 / 3';
  }

  /* ── Find image field ──────────────────────────────────────────────────
     Strategy: walk up from scope, at each level find the direct child that
     is an ancestor-of-or-is scope, then check preceding siblings for an
     image.  This handles any nesting depth.                                */

  function findImageField(scope, _imageTitle) {
    for (var ancestor = scope;
         ancestor && ancestor !== document.body;
         ancestor = ancestor.parentElement) {

      var parent = ancestor.parentElement;
      if (!parent || parent === document.body) continue;

      var children = Array.from(parent.children);

      // Find which direct child of parent IS or CONTAINS scope
      var anchor = null;
      for (var k = 0; k < children.length; k++) {
        if (children[k] === ancestor) { anchor = children[k]; break; }
      }
      if (!anchor) continue;

      var idx = children.indexOf(anchor);

      // Check every preceding sibling for image content
      for (var j = idx - 1; j >= 0; j--) {
        if (extractImageUrl(children[j])) return children[j];
      }
    }

    return null;
  }

  /* ── Find crop scopes ───────────────────────────────────────────────── */

  function findCropScopes() {
    var candidates = Array.from(document.querySelectorAll(
      'fieldset,[role="group"],section,article,div'
    )).filter(function (node) {
      if (node.classList.contains('sr-crop-storage')) return false;
      var text = normalizeText(node.textContent);
      if (!/crop position/i.test(text)) return false;
      if (!/focal point/i.test(text))   return false;
      if (!/\bzoom\b/i.test(text))      return false;
      var n = Array.from(node.querySelectorAll('input')).filter(isNumericInput).length;
      return n >= 3 && n <= 6;
    });

    // Keep outermost: remove candidates that are contained within another candidate
    return candidates.filter(function (c) {
      return !candidates.some(function (o) { return o !== c && o.contains(c); });
    });
  }

  /* ── Button placement ───────────────────────────────────────────────── */

  function placeTrigger(imageFieldEl, record) {
    if (imageFieldEl.querySelector('[data-sr-crop-trigger]')) return;

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sr-crop-trigger';
    trigger.dataset.srCropTrigger = 'true';
    trigger.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
      '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
      ' Edit crop';
    trigger.addEventListener('click', function () { openEditor(record); });

    // Try to overlay on the thumbnail
    var thumb = null;
    var imgs = Array.from(imageFieldEl.querySelectorAll('img'));
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].currentSrc || imgs[i].getAttribute('src') || '';
      if (src && !/^data:/.test(src) && !/\.svg(\?.*)?$/i.test(src)) {
        thumb = imgs[i];
        break;
      }
    }

    if (thumb) {
      var wrapper = thumb.parentElement || imageFieldEl;
      if (window.getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }
      trigger.classList.add('sr-crop-trigger--overlay');
      wrapper.appendChild(trigger);
    } else {
      imageFieldEl.appendChild(trigger);
    }
  }

  /* ── Modal ──────────────────────────────────────────────────────────── */

  function closeEditor() {
    if (!activeEditor) return;
    activeEditor.overlay.remove();
    activeEditor = null;
    document.documentElement.classList.remove('sr-crop-modal-open');
  }

  function openEditor(record) {
    closeEditor();

    var imageUrl = extractImageUrl(record.imageField);
    var draft    = readCrop(record);
    var hasImage = !!imageUrl;

    var overlay = document.createElement('div');
    overlay.className = 'sr-crop-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Crop ' + record.imageTitle);

    overlay.innerHTML = [
      '<div class="sr-crop-modal__panel">',
        '<div class="sr-crop-modal__header">',
          '<div><strong>Edit crop</strong><span>', record.imageTitle, '</span></div>',
          '<button type="button" class="sr-crop-modal__close" aria-label="Close">&times;</button>',
        '</div>',
        '<div class="sr-crop-modal__body">',
          '<div class="sr-crop-modal__frame', (hasImage ? '' : ' is-empty'),
               '" style="aspect-ratio:', record.aspectRatio, '">',
            '<img alt="" draggable="false"',
                 (hasImage ? ' src="' + imageUrl.replace(/"/g, '&quot;') + '"' : ''), '>',
            '<span>Select an image before cropping.</span>',
          '</div>',
          '<div class="sr-crop-modal__zoom">',
            '<button type="button" data-sr-zoom-out aria-label="Zoom out">&minus;</button>',
            '<label><span>Zoom <strong data-sr-zoom-val></strong></span>',
              '<input type="range" min="1" max="3" step="0.05"></label>',
            '<button type="button" data-sr-zoom-in aria-label="Zoom in">&plus;</button>',
          '</div>',
          '<p class="sr-crop-modal__hint">Drag to reposition &nbsp;&bull;&nbsp; Scroll to zoom</p>',
        '</div>',
        '<div class="sr-crop-modal__footer">',
          '<button type="button" class="sr-crop-modal__reset">Reset</button>',
          '<div>',
            '<button type="button" class="sr-crop-modal__cancel">Cancel</button>',
            '<button type="button" class="sr-crop-modal__save">Save crop</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.documentElement.classList.add('sr-crop-modal-open');

    var frame   = overlay.querySelector('.sr-crop-modal__frame');
    var img     = frame.querySelector('img');
    var range   = overlay.querySelector('input[type="range"]');
    var zoomVal = overlay.querySelector('[data-sr-zoom-val]');

    function render() {
      var x = draft.x, y = draft.y, z = draft.zoom;
      img.style.objectFit      = 'cover';
      img.style.objectPosition = x + '% ' + y + '%';
      img.style.transformOrigin = x + '% ' + y + '%';
      img.style.transform      = 'scale(' + z + ')';
      range.value              = String(z);
      zoomVal.textContent      = z.toFixed(2) + '×';
    }

    function setZoom(v) {
      draft.zoom = Math.round(clamp(v, 1, 3, draft.zoom) * 100) / 100;
      render();
    }

    frame.addEventListener('pointerdown', function (e) {
      if (!hasImage) return;
      e.preventDefault();
      frame.setPointerCapture(e.pointerId);
      var x0 = e.clientX, y0 = e.clientY, cx = draft.x, cy = draft.y;

      function onMove(me) {
        var rect = frame.getBoundingClientRect();
        var sens = 100 / Math.max(1, draft.zoom);
        draft.x = clamp(cx - (me.clientX - x0) / rect.width  * sens, 0, 100, 50);
        draft.y = clamp(cy - (me.clientY - y0) / rect.height * sens, 0, 100, 50);
        render();
      }
      function onStop(se) {
        if (frame.hasPointerCapture(se.pointerId)) frame.releasePointerCapture(se.pointerId);
        frame.removeEventListener('pointermove', onMove);
        frame.removeEventListener('pointerup', onStop);
        frame.removeEventListener('pointercancel', onStop);
      }
      frame.addEventListener('pointermove', onMove);
      frame.addEventListener('pointerup', onStop);
      frame.addEventListener('pointercancel', onStop);
    });

    frame.addEventListener('wheel', function (e) {
      if (!hasImage) return;
      e.preventDefault();
      setZoom(draft.zoom - e.deltaY * 0.002);
    }, { passive: false });

    range.addEventListener('input', function (e) { setZoom(e.target.value); });
    overlay.querySelector('[data-sr-zoom-out]').addEventListener('click', function () { setZoom(draft.zoom - 0.1); });
    overlay.querySelector('[data-sr-zoom-in]').addEventListener('click',  function () { setZoom(draft.zoom + 0.1); });

    overlay.querySelector('.sr-crop-modal__reset').addEventListener('click', function () {
      draft = { x: 50, y: 50, zoom: 1 };
      render();
    });
    overlay.querySelector('.sr-crop-modal__save').addEventListener('click', function () {
      setNativeValue(record.xInput,    Math.round(draft.x));
      setNativeValue(record.yInput,    Math.round(draft.y));
      setNativeValue(record.zoomInput, draft.zoom.toFixed(2));
      closeEditor();
    });
    overlay.querySelector('.sr-crop-modal__cancel').addEventListener('click', closeEditor);
    overlay.querySelector('.sr-crop-modal__close').addEventListener('click',  closeEditor);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeEditor(); });

    activeEditor = { overlay: overlay, record: record };
    render();
    overlay.querySelector('.sr-crop-modal__close').focus();
  }

  /* ── Enhance a crop scope ───────────────────────────────────────────── */

  function enhanceScope(scope) {
    var inputs = getCropInputs(scope);
    if (!inputs.xInput || !inputs.yInput || !inputs.zoomInput) return;
    if (enhancedInputs.has(inputs.zoomInput)) return;

    var cropTitle  = getCropTitle(scope);
    var imageTitle = getImageTitle(cropTitle);
    var imageField = findImageField(scope, imageTitle);
    if (!imageField) return;

    scope.classList.add('sr-crop-storage');
    scope.setAttribute('aria-hidden', 'true');
    enhancedInputs.add(inputs.xInput);
    enhancedInputs.add(inputs.yInput);
    enhancedInputs.add(inputs.zoomInput);

    var record = {
      scope:       scope,
      imageField:  imageField,
      imageTitle:  imageTitle,
      aspectRatio: inferAspectRatio(imageTitle),
      xInput:      inputs.xInput,
      yInput:      inputs.yInput,
      zoomInput:   inputs.zoomInput
    };

    placeTrigger(imageField, record);
  }

  function scan() {
    findCropScopes().forEach(enhanceScope);
  }

  /* ── Styles ─────────────────────────────────────────────────────────── */

  function installStyles() {
    if (document.getElementById('sr-crop-editor-styles')) return;
    var style = document.createElement('style');
    style.id  = 'sr-crop-editor-styles';
    style.textContent = [
      '.sr-crop-storage{display:none!important}',

      '.sr-crop-trigger{display:inline-flex;align-items:center;gap:6px;min-height:36px;margin:10px 0 0 0;padding:6px 14px;border:1px solid #aeb3b7;border-radius:4px;background:#fff;color:#202124;font:600 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;white-space:nowrap}',
      '.sr-crop-trigger:hover{background:#f1f3f4;border-color:#666}',
      '.sr-crop-trigger svg{flex-shrink:0;opacity:.75}',

      '.sr-crop-trigger--overlay{position:absolute;top:8px;right:8px;z-index:10;margin:0;background:rgba(255,255,255,.92);box-shadow:0 1px 6px rgba(0,0,0,.22);border-color:transparent;backdrop-filter:blur(4px)}',
      '.sr-crop-trigger--overlay:hover{background:#fff;border-color:#aaa}',

      '.sr-crop-modal-open{overflow:hidden}',
      '.sr-crop-modal{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:20px;background:rgba(15,16,18,.65);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',

      '.sr-crop-modal__panel{display:grid;grid-template-rows:auto minmax(0,1fr) auto;width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.32)}',

      '.sr-crop-modal__header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid #e8e8e8}',
      '.sr-crop-modal__header>div{display:grid;gap:2px}',
      '.sr-crop-modal__header strong{font-size:17px;color:#111}',
      '.sr-crop-modal__header span{color:#666;font-size:13px}',
      '.sr-crop-modal__close{width:34px;height:34px;padding:0;border:0;border-radius:50%;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#444}',
      '.sr-crop-modal__close:hover{background:#f0f0f0}',

      '.sr-crop-modal__body{display:grid;gap:16px;overflow:auto;padding:20px}',

      '.sr-crop-modal__frame{position:relative;justify-self:center;width:min(100%,620px);max-height:58vh;overflow:hidden;border:2px solid #1a1a1a;border-radius:6px;background:#111;cursor:grab;touch-action:none}',
      '.sr-crop-modal__frame:active{cursor:grabbing}',
      '.sr-crop-modal__frame::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,transparent calc(33.333% - .5px),rgba(255,255,255,.35) calc(33.333% - .5px),rgba(255,255,255,.35) calc(33.333% + .5px),transparent calc(33.333% + .5px),transparent calc(66.667% - .5px),rgba(255,255,255,.35) calc(66.667% - .5px),rgba(255,255,255,.35) calc(66.667% + .5px),transparent calc(66.667% + .5px)),linear-gradient(0deg,transparent calc(33.333% - .5px),rgba(255,255,255,.35) calc(33.333% - .5px),rgba(255,255,255,.35) calc(33.333% + .5px),transparent calc(33.333% + .5px),transparent calc(66.667% - .5px),rgba(255,255,255,.35) calc(66.667% - .5px),rgba(255,255,255,.35) calc(66.667% + .5px),transparent calc(66.667% + .5px))}',
      '.sr-crop-modal__frame img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;will-change:transform}',
      '.sr-crop-modal__frame span{display:none;position:absolute;inset:0;place-items:center;padding:24px;color:#fff;text-align:center;font-size:15px}',
      '.sr-crop-modal__frame.is-empty span{display:grid}',

      '.sr-crop-modal__zoom{display:grid;grid-template-columns:38px minmax(0,1fr) 38px;align-items:end;gap:10px}',
      '.sr-crop-modal__zoom label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#333}',
      '.sr-crop-modal__zoom input[type="range"]{width:100%;margin:0;accent-color:#111}',
      '.sr-crop-modal__zoom button{width:38px;height:38px;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:20px;cursor:pointer;color:#222}',
      '.sr-crop-modal__zoom button:hover{background:#f0f0f0}',

      '.sr-crop-modal__hint{margin:0;font-size:12px;color:#888;text-align:center}',

      '.sr-crop-modal__footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-top:1px solid #e8e8e8}',
      '.sr-crop-modal__footer>div{display:flex;gap:8px}',
      '.sr-crop-modal__footer button{min-height:38px;padding:7px 16px;border:1px solid #bbb;border-radius:5px;background:#fff;font-weight:600;font-size:13px;cursor:pointer;color:#111}',
      '.sr-crop-modal__footer button:hover{background:#f5f5f5}',
      '.sr-crop-modal__save{border-color:#111!important;background:#111!important;color:#fff!important}',
      '.sr-crop-modal__save:hover{background:#333!important;border-color:#333!important}',
      '.sr-crop-modal__reset{color:#555!important}',

      '@media(max-width:600px){.sr-crop-modal{padding:0}.sr-crop-modal__panel{width:100vw;max-height:100dvh;min-height:100dvh;border-radius:0}.sr-crop-modal__body{padding:14px}.sr-crop-modal__header,.sr-crop-modal__footer{padding:12px 14px}.sr-crop-modal__footer{flex-wrap:wrap}.sr-crop-modal__footer>div{flex:1;display:grid;grid-template-columns:1fr 1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Bootstrap ──────────────────────────────────────────────────────── */

  installStyles();

  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) { scan(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('load', scan);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeEditor) closeEditor();
  });

  scan();
})();
