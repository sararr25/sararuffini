/*
 * Visual crop editor for Sveltia CMS.
 * Stores crop data in hidden { x, y, zoom } object fields.
 * Adds an "Edit crop" overlay button on each image thumbnail.
 */
(function () {
  var enhancedInputs = new WeakSet();
  var activeEditor = null;

  /* ── Utilities ─────────────────────────────────────────────────────────── */

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

  /* ── Numeric input detection ────────────────────────────────────────────── */

  function isNumericInput(input) {
    if (!input || input.disabled) return false;
    var type = (input.getAttribute('type') || 'text').toLowerCase();
    if (['button','checkbox','file','hidden','image','radio','range','reset','submit'].indexOf(type) !== -1) return false;
    return type === 'number' ||
           input.getAttribute('role') === 'spinbutton' ||
           /^-?\d+(\.\d+)?$/.test(input.value || '');
  }

  /* ── Label resolution for an input ─────────────────────────────────────── */

  function getInputLabel(input, boundary) {
    var parts = [input.name || '', input.id || ''];

    var aria = input.getAttribute('aria-label');
    if (aria) parts.push(aria);

    var labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy) {
      var labelEl = document.getElementById(labelledBy);
      if (labelEl) parts.push(labelEl.textContent || '');
    }

    for (var node = input.parentElement; node && node !== boundary && node !== document.body; node = node.parentElement) {
      // Direct text nodes only (avoid pulling in sibling inputs' values)
      var directText = Array.from(node.childNodes)
        .filter(function (c) { return c.nodeType === Node.TEXT_NODE; })
        .map(function (c) { return c.textContent; })
        .join(' ');
      if (directText.trim()) parts.push(directText);

      // Nearby label / span elements that don't wrap the input
      Array.from(node.querySelectorAll('label, span, legend')).forEach(function (el) {
        if (!el.contains(input)) parts.push(el.textContent || '');
      });

      // Stop when we've collected enough context
      var numericCount = Array.from(node.querySelectorAll('input')).filter(isNumericInput).length;
      if (numericCount === 1 && /horizontal focal point|vertical focal point|zoom/i.test(parts.join(' '))) break;
    }
    return normalizeText(parts.join(' '));
  }

  /* ── Crop input resolution (x, y, zoom) ────────────────────────────────── */

  function getCropInputs(scope) {
    var inputs = Array.from(scope.querySelectorAll('input')).filter(isNumericInput);

    function find(pattern) {
      return inputs.find(function (i) { return pattern.test(getInputLabel(i, scope)); });
    }

    var xInput    = find(/horizontal focal point|focal[^a-z]*x\b|\bx[^a-z]*focal/i);
    var yInput    = find(/vertical focal point|focal[^a-z]*y\b|\by[^a-z]*focal/i);
    var zoomInput = find(/\bzoom\b/i);

    if (!xInput || !yInput || !zoomInput || new Set([xInput, yInput, zoomInput]).size !== 3) {
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

  /* ── Image URL extraction ───────────────────────────────────────────────── */

  function extractImageUrl(node) {
    if (!node) return '';

    // 1. Text / URL input whose value is an image path
    var textInput = Array.from(node.querySelectorAll(
      'input[type="text"], input[type="url"], input:not([type])'
    )).find(function (i) {
      return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(i.value || '');
    });
    if (textInput) return normalizeAssetUrl(textInput.value);

    // 2. Visible <img> tag (skip our own modal and tiny SVG icons)
    var img = Array.from(node.querySelectorAll('img')).find(function (i) {
      if (i.closest('.sr-crop-modal')) return false;
      var src = i.currentSrc || i.src || '';
      if (!src || /^data:image\/svg/i.test(src)) return false;
      return (i.naturalWidth || i.width || 0) > 30;
    });
    if (img) return normalizeAssetUrl(img.currentSrc || img.src);

    // 3. Path match anywhere in textContent
    var m = (node.textContent || '').match(
      /(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?[^\s"'<>]*)?/i
    );
    if (m) return normalizeAssetUrl(m[0]);

    return '';
  }

  /* ── Aspect ratio inference ─────────────────────────────────────────────── */

  function inferAspectRatio(title) {
    var t = title.toLowerCase();
    if (/portrait|profile|avatar/.test(t))     return '4 / 5';
    if (/polaroid|detail/.test(t))              return '4 / 5';
    if (/logo|journey|seo|og.?image/.test(t))  return '1 / 1';
    if (/hero|wide|browser|shot|media/.test(t)) return '16 / 9';
    return '4 / 3';
  }

  /* ── Crop-scope title helpers ───────────────────────────────────────────── */

  function getCropTitle(scope) {
    var candidates = Array.from(scope.querySelectorAll(
      'label, legend, h1, h2, h3, h4, h5, h6, p, span, div'
    ))
      .map(function (n) { return { node: n, text: normalizeText(n.textContent) }; })
      .filter(function (item) { return /crop position$/i.test(item.text) && item.text.length < 120; })
      .sort(function (a, b) { return a.text.length - b.text.length; });
    return candidates.length ? candidates[0].text : 'Image Crop Position';
  }

  function getImageTitle(cropTitle) {
    return normalizeText(cropTitle.replace(/\s+crop position$/i, ''));
  }

  function isBefore(node, reference) {
    return !!(node.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  /* ── Image-field finder ─────────────────────────────────────────────────── */

  function labelMatchesTitle(node, imageTitle) {
    // Own text nodes only (no child element text)
    var ownText = normalizeText(
      Array.from(node.childNodes)
        .filter(function (c) { return c.nodeType === Node.TEXT_NODE; })
        .map(function (c) { return c.textContent; })
        .join(' ')
    );
    var fullText = normalizeText(node.textContent);

    // Strip trailing required markers (* or similar) before comparing
    function stripped(s) { return s.replace(/\s*[\*   ]+\s*$/, '').trim(); }

    return stripped(ownText) === imageTitle ||
           stripped(fullText) === imageTitle ||
           ownText === imageTitle ||
           fullText === imageTitle;
  }

  function findImageField(scope, imageTitle) {
    // Strategy 1: find a label/heading matching imageTitle, walk UP to image container
    var matchingLabels = Array.from(document.querySelectorAll(
      'label, legend, h1, h2, h3, h4, h5, h6, p, span, div'
    ))
      .filter(function (node) {
        return isBefore(node, scope) &&
               !scope.contains(node) &&
               !node.contains(scope) &&
               labelMatchesTitle(node, imageTitle);
      })
      .reverse();

    for (var i = 0; i < matchingLabels.length; i++) {
      for (var node = matchingLabels[i].parentElement; node && node !== document.body; node = node.parentElement) {
        if (node.contains(scope)) break;
        if (extractImageUrl(node)) return node;
        // Don't walk too far up (avoid catching unrelated sections)
        if (node.querySelectorAll('label, legend').length > 4) break;
      }
    }

    // Strategy 2: sibling-based — nearest preceding sibling that contains an image
    for (var parent = scope.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      var children = Array.from(parent.children);
      var idx = children.indexOf(scope);
      if (idx === -1) continue;
      for (var j = idx - 1; j >= 0; j--) {
        if (extractImageUrl(children[j])) return children[j];
      }
    }

    // Strategy 3: label-based but accept container even with no image yet
    // (e.g. new entry where image hasn't been uploaded yet)
    for (var k = 0; k < matchingLabels.length; k++) {
      for (var anc = matchingLabels[k].parentElement; anc && anc !== document.body; anc = anc.parentElement) {
        if (anc.contains(scope)) break;
        var hasFileInput = anc.querySelector('input[type="file"]');
        var hasUploadBtn = Array.from(anc.querySelectorAll('button')).some(function (b) {
          return /select|upload|browse|choose|pick/i.test(b.textContent);
        });
        if (hasFileInput || hasUploadBtn) return anc;
        if (anc.querySelectorAll('label, legend').length > 4) break;
      }
    }

    return null;
  }

  /* ── Scope scanner ──────────────────────────────────────────────────────── */

  function findCropScopes() {
    var candidates = Array.from(document.querySelectorAll(
      'fieldset, [role="group"], section, article, div'
    )).filter(function (node) {
      if (node.classList.contains('sr-crop-storage')) return false;
      var text = normalizeText(node.textContent);
      if (!/crop position/i.test(text))  return false;
      if (!/focal point/i.test(text))    return false;
      if (!/\bzoom\b/i.test(text))       return false;
      var inputs = Array.from(node.querySelectorAll('input')).filter(isNumericInput);
      return inputs.length >= 3 && inputs.length <= 6;
    });

    // Keep only the innermost (smallest) candidates
    return candidates.filter(function (c) {
      return !candidates.some(function (o) { return o !== c && c.contains(o); });
    });
  }

  /* ── Button placement ───────────────────────────────────────────────────── */

  function placeTrigger(imageFieldEl, record) {
    if (imageFieldEl.querySelector('[data-sr-crop-trigger]')) return;

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sr-crop-trigger';
    trigger.dataset.srCropTrigger = 'true';
    trigger.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit crop';
    trigger.addEventListener('click', function () { openEditor(record); });

    // Try to overlay on the thumbnail image itself
    var thumb = Array.from(imageFieldEl.querySelectorAll('img')).find(function (i) {
      return !i.closest('.sr-crop-modal');
    });
    if (thumb) {
      var thumbParent = thumb.parentElement || imageFieldEl;
      if (window.getComputedStyle(thumbParent).position === 'static') {
        thumbParent.style.position = 'relative';
      }
      trigger.classList.add('sr-crop-trigger--overlay');
      thumbParent.appendChild(trigger);
    } else {
      // No thumbnail yet — place below the field; the MutationObserver will re-scan when one appears
      imageFieldEl.appendChild(trigger);
    }
  }

  /* ── Modal editor ───────────────────────────────────────────────────────── */

  function closeEditor() {
    if (!activeEditor) return;
    activeEditor.overlay.remove();
    activeEditor = null;
    document.documentElement.classList.remove('sr-crop-modal-open');
  }

  function openEditor(record) {
    closeEditor();

    // Always re-read the image URL at open time (user may have changed the image)
    var imageUrl = extractImageUrl(record.imageField);
    var draft = readCrop(record);
    var hasImage = !!imageUrl;

    var overlay = document.createElement('div');
    overlay.className = 'sr-crop-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Crop ' + record.imageTitle);

    overlay.innerHTML = [
      '<div class="sr-crop-modal__panel">',
        '<div class="sr-crop-modal__header">',
          '<div><strong>Edit crop</strong><span>' + record.imageTitle + '</span></div>',
          '<button type="button" class="sr-crop-modal__close" aria-label="Close">&times;</button>',
        '</div>',
        '<div class="sr-crop-modal__body">',
          '<div class="sr-crop-modal__frame' + (hasImage ? '' : ' is-empty') + '" style="aspect-ratio:' + record.aspectRatio + '">',
            '<img alt="" draggable="false"' + (hasImage ? ' src="' + imageUrl.replace(/"/g, '&quot;') + '"' : '') + '>',
            '<span>Select an image before cropping.</span>',
          '</div>',
          '<div class="sr-crop-modal__zoom">',
            '<button type="button" data-sr-zoom-out aria-label="Zoom out">&minus;</button>',
            '<label><span>Zoom <strong data-sr-zoom-val></strong></span><input type="range" min="1" max="3" step="0.05"></label>',
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

    // Drag to pan — sensitivity scales with zoom so it stays proportional
    frame.addEventListener('pointerdown', function (e) {
      if (!hasImage) return;
      e.preventDefault();
      frame.setPointerCapture(e.pointerId);
      var x0 = e.clientX, y0 = e.clientY;
      var cx = draft.x, cy = draft.y;

      function onMove(me) {
        var rect = frame.getBoundingClientRect();
        // Full frame width corresponds to (100 / zoom) percent of crop range
        var sens = 100 / Math.max(1, draft.zoom);
        draft.x = clamp(cx - (me.clientX - x0) / rect.width  * sens, 0, 100, 50);
        draft.y = clamp(cy - (me.clientY - y0) / rect.height * sens, 0, 100, 50);
        render();
      }

      function onStop(se) {
        if (frame.hasPointerCapture(se.pointerId)) frame.releasePointerCapture(se.pointerId);
        frame.removeEventListener('pointermove', onMove);
        frame.removeEventListener('pointerup',   onStop);
        frame.removeEventListener('pointercancel', onStop);
      }

      frame.addEventListener('pointermove', onMove);
      frame.addEventListener('pointerup',   onStop);
      frame.addEventListener('pointercancel', onStop);
    });

    // Scroll to zoom
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

  /* ── Enhance a single crop scope ────────────────────────────────────────── */

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

  /* ── Styles ─────────────────────────────────────────────────────────────── */

  function installStyles() {
    if (document.getElementById('sr-crop-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'sr-crop-editor-styles';
    style.textContent = [
      /* Hide the raw x/y/zoom number fields */
      '.sr-crop-storage{display:none!important}',

      /* "Edit crop" button — default (below field) */
      '.sr-crop-trigger{',
        'display:inline-flex;align-items:center;gap:6px;',
        'min-height:36px;margin:10px 0 0 0;padding:6px 14px;',
        'border:1px solid #aeb3b7;border-radius:4px;',
        'background:#fff;color:#202124;',
        'font:600 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'cursor:pointer;white-space:nowrap;',
      '}',
      '.sr-crop-trigger:hover{background:#f1f3f4;border-color:#666}',
      '.sr-crop-trigger svg{flex-shrink:0;opacity:.75}',

      /* Overlay variant — sits on top of the thumbnail */
      '.sr-crop-trigger--overlay{',
        'position:absolute;top:8px;right:8px;',
        'z-index:10;margin:0;',
        'background:rgba(255,255,255,.92);',
        'box-shadow:0 1px 6px rgba(0,0,0,.22);',
        'border-color:transparent;',
        'backdrop-filter:blur(4px);',
      '}',
      '.sr-crop-trigger--overlay:hover{background:#fff;border-color:#aaa}',

      /* Modal backdrop */
      '.sr-crop-modal-open{overflow:hidden}',
      '.sr-crop-modal{',
        'position:fixed;inset:0;z-index:2147483646;',
        'display:grid;place-items:center;padding:20px;',
        'background:rgba(15,16,18,.65);',
        'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      '}',

      /* Panel */
      '.sr-crop-modal__panel{',
        'display:grid;grid-template-rows:auto minmax(0,1fr) auto;',
        'width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);',
        'overflow:hidden;border-radius:10px;',
        'background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.32);',
      '}',

      /* Header */
      '.sr-crop-modal__header{',
        'display:flex;align-items:center;justify-content:space-between;gap:16px;',
        'padding:16px 20px;border-bottom:1px solid #e8e8e8;',
      '}',
      '.sr-crop-modal__header>div{display:grid;gap:2px}',
      '.sr-crop-modal__header strong{font-size:17px;color:#111}',
      '.sr-crop-modal__header span{color:#666;font-size:13px}',
      '.sr-crop-modal__close{',
        'width:34px;height:34px;padding:0;border:0;border-radius:50%;',
        'background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#444;',
      '}',
      '.sr-crop-modal__close:hover{background:#f0f0f0}',

      /* Body */
      '.sr-crop-modal__body{display:grid;gap:16px;overflow:auto;padding:20px}',

      /* Crop frame */
      '.sr-crop-modal__frame{',
        'position:relative;justify-self:center;',
        'width:min(100%,620px);max-height:58vh;overflow:hidden;',
        'border:2px solid #1a1a1a;border-radius:6px;background:#111;',
        'cursor:grab;touch-action:none;',
      '}',
      '.sr-crop-modal__frame:active{cursor:grabbing}',

      /* Rule-of-thirds grid overlay */
      '.sr-crop-modal__frame::after{',
        'content:"";position:absolute;inset:0;z-index:2;pointer-events:none;',
        'background:',
          'linear-gradient(90deg,',
            'transparent calc(33.333% - .5px),rgba(255,255,255,.4) calc(33.333% - .5px),rgba(255,255,255,.4) calc(33.333% + .5px),transparent calc(33.333% + .5px),',
            'transparent calc(66.667% - .5px),rgba(255,255,255,.4) calc(66.667% - .5px),rgba(255,255,255,.4) calc(66.667% + .5px),transparent calc(66.667% + .5px)',
          '),',
          'linear-gradient(0deg,',
            'transparent calc(33.333% - .5px),rgba(255,255,255,.4) calc(33.333% - .5px),rgba(255,255,255,.4) calc(33.333% + .5px),transparent calc(33.333% + .5px),',
            'transparent calc(66.667% - .5px),rgba(255,255,255,.4) calc(66.667% - .5px),rgba(255,255,255,.4) calc(66.667% + .5px),transparent calc(66.667% + .5px)',
          ');',
      '}',

      '.sr-crop-modal__frame img{',
        'display:block;width:100%;height:100%;',
        'object-fit:cover;user-select:none;will-change:transform;',
      '}',
      '.sr-crop-modal__frame span{',
        'display:none;position:absolute;inset:0;',
        'place-items:center;padding:24px;',
        'color:#fff;text-align:center;font-size:15px;',
      '}',
      '.sr-crop-modal__frame.is-empty span{display:grid}',

      /* Zoom controls */
      '.sr-crop-modal__zoom{',
        'display:grid;grid-template-columns:38px minmax(0,1fr) 38px;',
        'align-items:end;gap:10px;',
      '}',
      '.sr-crop-modal__zoom label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#333}',
      '.sr-crop-modal__zoom input[type="range"]{width:100%;margin:0;accent-color:#111}',
      '.sr-crop-modal__zoom button{',
        'width:38px;height:38px;border:1px solid #ccc;border-radius:4px;',
        'background:#fff;font-size:20px;cursor:pointer;color:#222;',
      '}',
      '.sr-crop-modal__zoom button:hover{background:#f0f0f0}',

      /* Hint */
      '.sr-crop-modal__hint{margin:0;font-size:12px;color:#888;text-align:center}',

      /* Footer */
      '.sr-crop-modal__footer{',
        'display:flex;align-items:center;justify-content:space-between;gap:12px;',
        'padding:14px 20px;border-top:1px solid #e8e8e8;',
      '}',
      '.sr-crop-modal__footer>div{display:flex;gap:8px}',
      '.sr-crop-modal__footer button{',
        'min-height:38px;padding:7px 16px;',
        'border:1px solid #bbb;border-radius:5px;',
        'background:#fff;font-weight:600;font-size:13px;cursor:pointer;color:#111;',
      '}',
      '.sr-crop-modal__footer button:hover{background:#f5f5f5}',
      '.sr-crop-modal__save{border-color:#111!important;background:#111!important;color:#fff!important}',
      '.sr-crop-modal__save:hover{background:#333!important;border-color:#333!important}',
      '.sr-crop-modal__reset{color:#555!important}',

      /* Mobile */
      '@media(max-width:600px){',
        '.sr-crop-modal{padding:0}',
        '.sr-crop-modal__panel{width:100vw;max-height:100dvh;min-height:100dvh;border-radius:0}',
        '.sr-crop-modal__body{padding:14px}',
        '.sr-crop-modal__header,.sr-crop-modal__footer{padding:12px 14px}',
        '.sr-crop-modal__footer{flex-wrap:wrap}',
        '.sr-crop-modal__footer>div{flex:1;display:grid;grid-template-columns:1fr 1fr}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Bootstrap ──────────────────────────────────────────────────────────── */

  installStyles();

  // Re-scan whenever the CMS mutates the DOM (navigation, list items added, images uploaded)
  new MutationObserver(function (mutations) {
    var relevant = mutations.some(function (m) {
      return m.addedNodes.length > 0 || m.type === 'attributes';
    });
    if (relevant) scan();
  }).observe(document.body, { childList: true, subtree: true, attributes: false });

  window.addEventListener('load', scan);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeEditor) closeEditor();
  });

  scan();
})();
