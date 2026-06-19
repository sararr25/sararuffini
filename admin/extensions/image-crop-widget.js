/*
 * Visual crop editor for Sveltia CMS.
 * Opens F12 console to see [CropWidget] debug logs.
 */
(function () {
  var enhancedInputs = new WeakSet();
  var activeEditor   = null;

  function log() {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[CropWidget]'].concat(args));
  }

  /* ── tiny utilities ─────────────────────────────────────────────────── */

  function clamp(v, min, max, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }

  function normalizeText(v) {
    return String(v || '').replace(/\s+/g, ' ').trim();
  }

  function setNativeValue(input, value) {
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (d && d.set) d.set.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function normalizeAssetUrl(url) {
    if (!url) return '';
    try { return new URL(url, window.location.origin).href; }
    catch (e) { return url; }
  }

  function isBefore(a, b) {
    return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  function inferAspectRatio(title) {
    var t = title.toLowerCase();
    if (/portrait|profile|avatar/.test(t))       return '4 / 5';
    if (/polaroid|detail/.test(t))               return '4 / 5';
    if (/logo|journey|seo|og.?image/.test(t))    return '1 / 1';
    if (/hero|wide|browser|shot|media/.test(t))  return '16 / 9';
    return '4 / 3';
  }

  /* ── label detection ────────────────────────────────────────────────── */

  /*
   * Returns true if `input` appears to be labeled with text matching `pattern`.
   * Checks: aria-label, aria-labelledby, then walks up to 6 ancestor levels
   * inspecting direct-child text.
   */
  function isLabeledWith(input, pattern) {
    // aria-label
    if (pattern.test(input.getAttribute('aria-label') || '')) return true;

    // aria-labelledby
    var lbId = input.getAttribute('aria-labelledby');
    if (lbId) {
      var lbEl = document.getElementById(lbId);
      if (lbEl && pattern.test(normalizeText(lbEl.textContent))) return true;
    }

    // Walk up, checking direct children at each level
    for (var el = input.parentElement, depth = 0;
         el && depth < 6;
         el = el.parentElement, depth++) {
      var ch = Array.from(el.children);
      for (var i = 0; i < ch.length; i++) {
        // Only look at elements that do NOT contain the input itself
        if (!ch[i].contains(input) && pattern.test(normalizeText(ch[i].textContent))) {
          return true;
        }
      }
    }
    return false;
  }

  /* ── find an input inside `container` whose label matches `pattern` ─── */

  function findInputByLabel(container, pattern) {
    return Array.from(container.querySelectorAll('input')).find(function (inp) {
      if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return false;
      var type = (inp.getAttribute('type') || 'text').toLowerCase();
      if (['button','checkbox','file','image','radio','reset','submit'].indexOf(type) !== -1) return false;
      return isLabeledWith(inp, pattern);
    });
  }

  /* ── find the smallest container holding all three crop inputs ───────── */

  function findCropContainer(xInput) {
    for (var el = xInput.parentElement; el && el !== document.body; el = el.parentElement) {
      if (findInputByLabel(el, /vertical focal point/i) &&
          findInputByLabel(el, /\bzoom\b/i)) {
        return el;
      }
    }
    return null;
  }

  /* ── image URL extraction ───────────────────────────────────────────── */

  function extractImageUrl(node) {
    if (!node) return '';

    // text/url input with image extension
    var inps = Array.from(node.querySelectorAll('input[type="text"],input[type="url"],input:not([type])'));
    for (var i = 0; i < inps.length; i++) {
      if (/\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(inps[i].value || '')) {
        return normalizeAssetUrl(inps[i].value);
      }
    }

    // <img> (skip modals, data-URIs, and SVG icon files)
    var imgs = Array.from(node.querySelectorAll('img'));
    for (var j = 0; j < imgs.length; j++) {
      var img = imgs[j];
      if (img.closest('.sr-crop-modal') || img.closest('.sr-crop-storage')) continue;
      var src = img.getAttribute('src') || img.currentSrc || img.src || '';
      if (src && !/^data:/.test(src) && !/\.svg(\?.*)?$/i.test(src)) {
        return normalizeAssetUrl(src);
      }
    }

    // path anywhere in text content
    var m = (node.textContent || '').match(
      /(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?[^\s"'<>]*)?/i
    );
    if (m) return normalizeAssetUrl(m[0]);

    return '';
  }

  /* ── find the image field that precedes cropContainer ───────────────── */

  function findImageField(cropContainer) {
    // Build a set of cropContainer's ancestor chain
    var ancestors = new Set();
    for (var a = cropContainer; a && a !== document.body; a = a.parentElement) {
      ancestors.add(a);
    }

    // Collect candidates: <img> tags and path text-inputs that precede cropContainer
    var candidates = [];

    Array.from(document.querySelectorAll('img')).forEach(function (img) {
      if (img.closest('.sr-crop-modal') || img.closest('.sr-crop-storage')) return;
      var src = img.getAttribute('src') || img.currentSrc || '';
      if (!src || /^data:/.test(src) || /\.svg(\?.*)?$/i.test(src)) return;
      if (isBefore(img, cropContainer)) candidates.push(img);
    });

    Array.from(document.querySelectorAll('input[type="text"],input:not([type])')).forEach(function (inp) {
      if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return;
      if (ancestors.has(inp)) return;
      if (/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(inp.value || '') &&
          isBefore(inp, cropContainer)) {
        candidates.push(inp);
      }
    });

    if (!candidates.length) {
      log('findImageField: no candidates found before cropContainer');
      return null;
    }

    // nearest candidate = last one (document order = natural order)
    var nearest = candidates[candidates.length - 1];
    log('findImageField: nearest candidate', nearest.tagName,
        nearest.getAttribute('src') || nearest.value || '');

    // Walk UP from `nearest` until we find a node whose SIBLING is in `ancestors`
    // — that node is at the same DOM level as cropContainer's ancestor
    for (var node = nearest; node && node !== document.body; node = node.parentElement) {
      var parent = node.parentElement;
      if (!parent) break;
      var siblings = Array.from(parent.children);
      var found = siblings.some(function (s) { return s !== node && ancestors.has(s); });
      if (found) {
        log('findImageField: returning', node.tagName, node.className || '');
        return node;
      }
    }

    log('findImageField: fallback to nearest.parentElement');
    return nearest.parentElement || nearest;
  }

  /* ── crop-section title ─────────────────────────────────────────────── */

  function getCropTitle(cropContainer) {
    // Look in cropContainer and its ancestors for text ending in "Crop Position"
    for (var el = cropContainer; el && el !== document.body; el = el.parentElement) {
      var found = Array.from(el.querySelectorAll('*'))
        .map(function (n) { return normalizeText(n.textContent); })
        .filter(function (t) { return /crop position$/i.test(t) && t.length < 120; })
        .sort(function (a, b) { return a.length - b.length; });
      if (found.length) return found[0];
    }
    return 'Image Crop Position';
  }

  function getImageTitle(cropTitle) {
    return normalizeText(
      cropTitle.replace(/\s+crop position$/i, '').replace(/^add\s+/i, '')
    );
  }

  /* ── find what to hide (section that contains crop inputs + its label) ─ */

  function findSectionToHide(cropContainer) {
    // Walk UP until we find a container that has a "Crop Position" heading
    // that is NOT inside the cropContainer itself
    for (var el = cropContainer.parentElement; el && el !== document.body; el = el.parentElement) {
      var hasCropHeading = Array.from(el.children).some(function (child) {
        return !child.contains(cropContainer) &&
               /crop position/i.test(normalizeText(child.textContent)) &&
               normalizeText(child.textContent).length < 120;
      });
      if (hasCropHeading) return el;
      // Don't go too far: if this container has a sibling that is the image field, stop
      var imgSibling = Array.from(el.parentElement ? el.parentElement.children : []).find(function (s) {
        return s !== el && extractImageUrl(s);
      });
      if (imgSibling) return el; // this is the crop field — hide it
    }
    return cropContainer;
  }

  /* ── button placement ───────────────────────────────────────────────── */

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

    // Try to overlay on the image thumbnail
    var thumb = null;
    Array.from(imageFieldEl.querySelectorAll('img')).forEach(function (img) {
      if (thumb) return;
      var src = img.getAttribute('src') || img.currentSrc || '';
      if (src && !/^data:/.test(src) && !/\.svg(\?.*)?$/i.test(src)) thumb = img;
    });

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

  /* ── modal ──────────────────────────────────────────────────────────── */

  function closeEditor() {
    if (!activeEditor) return;
    activeEditor.overlay.remove();
    activeEditor = null;
    document.documentElement.classList.remove('sr-crop-modal-open');
  }

  function openEditor(record) {
    closeEditor();

    var imageUrl = extractImageUrl(record.imageField);
    var draft    = {
      x:    clamp(record.xInput.value,    0, 100, 50),
      y:    clamp(record.yInput.value,    0, 100, 50),
      zoom: clamp(record.zoomInput.value, 1,   3,  1)
    };
    var hasImage = !!imageUrl;

    var overlay = document.createElement('div');
    overlay.className = 'sr-crop-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

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
            '<button type="button" data-sr-zoom-out>&minus;</button>',
            '<label><span>Zoom <strong data-sr-zoom-val></strong></span>',
              '<input type="range" min="1" max="3" step="0.05"></label>',
            '<button type="button" data-sr-zoom-in>&plus;</button>',
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
      img.style.objectFit      = 'cover';
      img.style.objectPosition = draft.x + '% ' + draft.y + '%';
      img.style.transformOrigin = draft.x + '% ' + draft.y + '%';
      img.style.transform      = 'scale(' + draft.zoom + ')';
      range.value              = String(draft.zoom);
      zoomVal.textContent      = draft.zoom.toFixed(2) + '×';
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
        frame.removeEventListener('pointerup',   onStop);
        frame.removeEventListener('pointercancel', onStop);
      }
      frame.addEventListener('pointermove', onMove);
      frame.addEventListener('pointerup',   onStop);
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

  /* ── main scan ──────────────────────────────────────────────────────── */

  function scan() {
    var allInputs = Array.from(document.querySelectorAll('input'));
    var hfpInputs = allInputs.filter(function (inp) {
      if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return false;
      if (enhancedInputs.has(inp)) return false;
      var type = (inp.getAttribute('type') || 'text').toLowerCase();
      if (['button','checkbox','file','image','radio','reset','submit'].indexOf(type) !== -1) return false;
      return isLabeledWith(inp, /horizontal focal point/i);
    });

    log('scan: found', hfpInputs.length, '"horizontal focal point" input(s)');

    hfpInputs.forEach(function (xInp) {
      var cropContainer = findCropContainer(xInp);
      if (!cropContainer) { log('scan: no crop container for', xInp); return; }

      var yInp    = findInputByLabel(cropContainer, /vertical focal point/i);
      var zoomInp = findInputByLabel(cropContainer, /\bzoom\b/i);
      if (!yInp || !zoomInp) { log('scan: missing y or zoom inside container'); return; }
      if (enhancedInputs.has(zoomInp)) return;

      var imageField = findImageField(cropContainer);
      if (!imageField) { log('scan: no image field found'); return; }

      var cropTitle  = getCropTitle(cropContainer);
      var imageTitle = getImageTitle(cropTitle);
      log('scan: enhancing', JSON.stringify(imageTitle));

      var section = findSectionToHide(cropContainer);
      section.classList.add('sr-crop-storage');
      section.setAttribute('aria-hidden', 'true');

      enhancedInputs.add(xInp);
      enhancedInputs.add(yInp);
      enhancedInputs.add(zoomInp);

      placeTrigger(imageField, {
        xInput:      xInp,
        yInput:      yInp,
        zoomInput:   zoomInp,
        imageField:  imageField,
        imageTitle:  imageTitle,
        aspectRatio: inferAspectRatio(imageTitle)
      });
    });
  }

  /* ── styles ─────────────────────────────────────────────────────────── */

  function installStyles() {
    if (document.getElementById('sr-crop-editor-styles')) return;
    var style = document.createElement('style');
    style.id  = 'sr-crop-editor-styles';
    style.textContent = [
      '.sr-crop-storage{display:none!important}',

      '.sr-crop-trigger{display:inline-flex;align-items:center;gap:6px;min-height:36px;margin:10px 0 0 0;padding:6px 14px;border:1px solid #aeb3b7;border-radius:4px;background:#fff;color:#202124;font:600 13px/1 system-ui,-apple-system,sans-serif;cursor:pointer;white-space:nowrap}',
      '.sr-crop-trigger:hover{background:#f1f3f4;border-color:#666}',
      '.sr-crop-trigger svg{flex-shrink:0;opacity:.7}',
      '.sr-crop-trigger--overlay{position:absolute;top:8px;right:8px;z-index:10;margin:0;background:rgba(255,255,255,.9);box-shadow:0 1px 6px rgba(0,0,0,.2);border-color:transparent;backdrop-filter:blur(4px)}',
      '.sr-crop-trigger--overlay:hover{background:#fff;border-color:#aaa}',

      '.sr-crop-modal-open{overflow:hidden}',
      '.sr-crop-modal{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:20px;background:rgba(15,16,18,.65);font-family:system-ui,-apple-system,sans-serif}',
      '.sr-crop-modal__panel{display:grid;grid-template-rows:auto 1fr auto;width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.3)}',
      '.sr-crop-modal__header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid #e8e8e8}',
      '.sr-crop-modal__header>div{display:grid;gap:2px}',
      '.sr-crop-modal__header strong{font-size:17px;color:#111}',
      '.sr-crop-modal__header span{color:#666;font-size:13px}',
      '.sr-crop-modal__close{width:34px;height:34px;padding:0;border:0;border-radius:50%;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#444}',
      '.sr-crop-modal__close:hover{background:#f0f0f0}',
      '.sr-crop-modal__body{display:grid;gap:16px;overflow:auto;padding:20px}',
      '.sr-crop-modal__frame{position:relative;justify-self:center;width:min(100%,620px);max-height:58vh;overflow:hidden;border:2px solid #1a1a1a;border-radius:6px;background:#111;cursor:grab;touch-action:none}',
      '.sr-crop-modal__frame:active{cursor:grabbing}',
      '.sr-crop-modal__frame::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,transparent calc(33.333% - .5px),rgba(255,255,255,.3) calc(33.333% - .5px),rgba(255,255,255,.3) calc(33.333% + .5px),transparent calc(33.333% + .5px),transparent calc(66.667% - .5px),rgba(255,255,255,.3) calc(66.667% - .5px),rgba(255,255,255,.3) calc(66.667% + .5px),transparent calc(66.667% + .5px)),linear-gradient(0deg,transparent calc(33.333% - .5px),rgba(255,255,255,.3) calc(33.333% - .5px),rgba(255,255,255,.3) calc(33.333% + .5px),transparent calc(33.333% + .5px),transparent calc(66.667% - .5px),rgba(255,255,255,.3) calc(66.667% - .5px),rgba(255,255,255,.3) calc(66.667% + .5px),transparent calc(66.667% + .5px))}',
      '.sr-crop-modal__frame img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;will-change:transform}',
      '.sr-crop-modal__frame span{display:none;position:absolute;inset:0;place-items:center;padding:24px;color:#fff;text-align:center;font-size:15px}',
      '.sr-crop-modal__frame.is-empty span{display:grid}',
      '.sr-crop-modal__zoom{display:grid;grid-template-columns:38px 1fr 38px;align-items:end;gap:10px}',
      '.sr-crop-modal__zoom label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#333}',
      '.sr-crop-modal__zoom input[type="range"]{width:100%;margin:0;accent-color:#111}',
      '.sr-crop-modal__zoom button{width:38px;height:38px;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:20px;cursor:pointer}',
      '.sr-crop-modal__zoom button:hover{background:#f0f0f0}',
      '.sr-crop-modal__hint{margin:0;font-size:12px;color:#888;text-align:center}',
      '.sr-crop-modal__footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-top:1px solid #e8e8e8}',
      '.sr-crop-modal__footer>div{display:flex;gap:8px}',
      '.sr-crop-modal__footer button{min-height:38px;padding:7px 16px;border:1px solid #bbb;border-radius:5px;background:#fff;font-weight:600;font-size:13px;cursor:pointer;color:#111}',
      '.sr-crop-modal__footer button:hover{background:#f5f5f5}',
      '.sr-crop-modal__save{border-color:#111!important;background:#111!important;color:#fff!important}',
      '.sr-crop-modal__save:hover{background:#333!important;border-color:#333!important}',
      '@media(max-width:600px){.sr-crop-modal{padding:0}.sr-crop-modal__panel{width:100vw;max-height:100dvh;border-radius:0}.sr-crop-modal__body,.sr-crop-modal__header,.sr-crop-modal__footer{padding:12px 14px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── bootstrap ──────────────────────────────────────────────────────── */

  installStyles();

  // Debounced scan — waits 400ms after last DOM mutation
  var scanTimer;
  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 400);
  }

  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) { scheduleScan(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Periodic retry for the first 20 seconds (catches async value updates)
  var retries = 0;
  var retryTimer = setInterval(function () {
    scan();
    if (++retries >= 20) clearInterval(retryTimer);
  }, 1000);

  window.addEventListener('load', scan);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeEditor) closeEditor();
  });

  scan();
})();
