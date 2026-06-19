/*
 * Visual crop editor for Sveltia CMS – v7
 * Adds an "Edit crop" button on every image field that has a matching
 * *_crop_position object (x / y / zoom sub-fields) in the CMS config.
 *
 * Debug badge appears bottom-right corner — red while scanning, green when active.
 * F12 console shows [CropWidget] prefixed logs.
 */
(function () {
  'use strict';

  var enhancedInputs = new WeakSet();
  var activeEditor   = null;
  var totalEnhanced  = 0;

  function log() {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[CropWidget]'].concat(args));
  }

  /* ── tiny utilities ──────────────────────────────────────────── */

  function clamp(v, lo, hi, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
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
    var t = (title || '').toLowerCase();
    if (/portrait|profile|avatar|polaroid|detail/.test(t)) return '4 / 5';
    if (/logo|journey|seo|og/.test(t))                     return '1 / 1';
    if (/hero|wide|browser|shot|media/.test(t))            return '16 / 9';
    return '4 / 3';
  }

  function isExcludedType(inp) {
    var t = (inp.getAttribute('type') || 'text').toLowerCase();
    return ['button', 'checkbox', 'file', 'image', 'radio', 'reset', 'submit'].indexOf(t) !== -1;
  }

  /* ── debug badge ─────────────────────────────────────────────── */

  function setBadge(text, ok) {
    var b = document.getElementById('sr-crop-badge');
    if (!b) {
      b = document.createElement('div');
      b.id = 'sr-crop-badge';
      b.style.cssText =
        'position:fixed;bottom:8px;right:8px;z-index:2147483647;' +
        'padding:4px 9px;border-radius:4px;font:11px/1.4 monospace;' +
        'color:#fff;pointer-events:none;transition:opacity .4s';
      document.body.appendChild(b);
    }
    clearTimeout(b._t);
    b.style.opacity = '0.9';
    b.style.display = '';
    b.style.background = ok ? '#16a34a' : '#b91c1c';
    b.textContent = '[Crop] ' + text;
    if (ok) {
      b._t = setTimeout(function () { b.style.opacity = '0'; }, 5000);
    }
  }

  /* ── label detection ──────────────────────────────────────────── */

  /*
   * Returns true if `input` is labeled by text matching `pattern`.
   *
   * Covers all common Svelte/CMS patterns:
   *   (a) aria-label / aria-labelledby
   *   (b) sibling label → <label>text</label>  <input>
   *   (c) wrapping label → <label>text <input></label>
   *   (d) ancestor-sibling header → <header>text</header> <div><input></div>
   */
  function isLabeledWith(input, pattern) {
    /* (a) aria */
    if (pattern.test(input.getAttribute('aria-label') || '')) return true;
    var lbId = input.getAttribute('aria-labelledby');
    if (lbId) {
      var lbEl = document.getElementById(lbId);
      if (lbEl && pattern.test(normalizeText(lbEl.textContent))) return true;
    }

    /* (b/c/d) walk up the DOM */
    for (var el = input.parentElement, depth = 0;
         el && depth < 10;
         el = el.parentElement, depth++) {

      var ch = Array.from(el.children);
      for (var i = 0; i < ch.length; i++) {
        var child = ch[i];

        if (!child.contains(input)) {
          /* Sibling branch: no risk of including the input value → check full text */
          if (pattern.test(normalizeText(child.textContent))) return true;
        } else {
          /*
           * This child IS an ancestor of the input (e.g. a <label> wrapping <input>).
           * Extract only the non-input text parts so we match "Horizontal focal point"
           * without being polluted by the numeric input value.
           */
          var parts = Array.from(child.childNodes).filter(function (n) {
            if (n.nodeType === Node.TEXT_NODE) return true;
            if (n.nodeType === Node.ELEMENT_NODE) return !n.contains(input) && n !== input;
            return false;
          }).map(function (n) { return n.textContent; });
          if (parts.length && pattern.test(normalizeText(parts.join(' ')))) return true;
        }
      }

      /* Don't climb into sections that contain 15+ inputs — too far up */
      if (el.querySelectorAll('input').length > 15) break;
    }
    return false;
  }

  /* ── find an input inside `container` by label ──────────────── */

  function findInputByLabel(container, pattern) {
    return Array.from(container.querySelectorAll('input')).find(function (inp) {
      if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return false;
      if (isExcludedType(inp)) return false;
      return isLabeledWith(inp, pattern);
    });
  }

  /* ── text-node fallback: find "Horizontal focal point" by scanning text ── */

  /*
   * If isLabeledWith fails (unusual DOM nesting), we walk ALL text nodes
   * looking for "horizontal focal point" text and then find the nearest
   * single numeric input in the same field container.
   */
  function findHfpByText() {
    var results  = [];
    var seenInps = new WeakSet();

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (!/horizontal focal point/i.test(node.textContent)) continue;
      var labelEl = node.parentElement;
      if (!labelEl) continue;
      if (labelEl.closest('.sr-crop-modal') || labelEl.closest('.sr-crop-storage')) continue;

      /* Walk up from the text's parent to find a container with exactly 1 relevant input */
      for (var el = labelEl; el && el !== document.body; el = el.parentElement) {
        var inputs = Array.from(el.querySelectorAll('input')).filter(function (inp) {
          if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return false;
          if (enhancedInputs.has(inp) || seenInps.has(inp)) return false;
          return !isExcludedType(inp);
        });
        if (inputs.length === 1) {
          seenInps.add(inputs[0]);
          results.push(inputs[0]);
          break;
        }
        if (inputs.length > 1) break; /* overshot */
        /* 0 inputs at this level → keep climbing */
      }
    }
    return results;
  }

  /* ── smallest container that holds all three crop inputs ────── */

  function findCropContainer(xInput) {
    for (var el = xInput.parentElement; el && el !== document.body; el = el.parentElement) {
      if (findInputByLabel(el, /vertical focal point/i) &&
          findInputByLabel(el, /\bzoom\b/i)) {
        return el;
      }
    }
    return null;
  }

  /* ── image URL from a DOM subtree ─────────────────────────── */

  function extractImageUrl(node) {
    if (!node) return '';
    var inps = Array.from(node.querySelectorAll('input[type="text"],input[type="url"],input:not([type])'));
    for (var i = 0; i < inps.length; i++) {
      if (/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(inps[i].value || '')) {
        return normalizeAssetUrl(inps[i].value);
      }
    }
    var imgs = Array.from(node.querySelectorAll('img'));
    for (var j = 0; j < imgs.length; j++) {
      var img = imgs[j];
      if (img.closest('.sr-crop-modal') || img.closest('.sr-crop-storage')) continue;
      var src = img.getAttribute('src') || img.currentSrc || img.src || '';
      if (src && !/^data:/.test(src) && !/\.svg(\?.*)?$/i.test(src)) return normalizeAssetUrl(src);
    }
    var m = (node.textContent || '').match(
      /(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|avif)(?:\?[^\s"'<>]*)?/i
    );
    if (m) return normalizeAssetUrl(m[0]);
    return '';
  }

  /* ── find the image field that precedes cropContainer ───────── */

  function findImageField(cropContainer) {
    var ancestors = new Set();
    for (var a = cropContainer; a && a !== document.body; a = a.parentElement) {
      ancestors.add(a);
    }

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

    if (!candidates.length) { log('findImageField: no candidates'); return null; }

    var nearest = candidates[candidates.length - 1];
    log('findImageField: nearest =', nearest.tagName, nearest.getAttribute('src') || nearest.value || '');

    /* Walk UP from `nearest` until we find a node whose SIBLING is in `ancestors` */
    for (var node = nearest; node && node !== document.body; node = node.parentElement) {
      var parent = node.parentElement;
      if (!parent) break;
      var found = Array.from(parent.children).some(function (s) {
        return s !== node && ancestors.has(s);
      });
      if (found) { log('findImageField: imageField =', node.tagName, node.className || ''); return node; }
    }
    return nearest.parentElement || nearest;
  }

  /* ── find the entire crop-position section to hide ──────────── */

  function findSectionToHide(cropContainer, imageField) {
    /*
     * Strategy 1 (most reliable):
     * cropContainer's ancestor that is a direct SIBLING of imageField
     * (and comes after it in the DOM).
     */
    if (imageField) {
      var par = imageField.parentElement;
      if (par) {
        var sibs   = Array.from(par.children);
        var imgIdx = sibs.indexOf(imageField);
        if (imgIdx >= 0) {
          for (var a = cropContainer; a && a !== document.body; a = a.parentElement) {
            var idx = sibs.indexOf(a);
            if (idx > imgIdx) return a;
          }
        }
      }
    }

    /*
     * Strategy 2 (fallback):
     * Walk up from cropContainer looking for a container that has a SIBLING CHILD
     * containing "Crop Position" text (the field header / label).
     */
    for (var el = cropContainer.parentElement; el && el !== document.body; el = el.parentElement) {
      var hasCropHeading = Array.from(el.children).some(function (child) {
        if (child.contains(cropContainer)) return false;
        var text = normalizeText(child.textContent);
        return /crop position/i.test(text) && text.length < 120;
      });
      if (hasCropHeading) return el;

      /* Also stop if a sibling of el is an image field */
      if (!imageField) {
        var imgSib = Array.from(el.parentElement ? el.parentElement.children : []).find(function (s) {
          return s !== el && extractImageUrl(s);
        });
        if (imgSib) return el;
      }
    }

    return cropContainer;
  }

  /* ── crop title helpers ─────────────────────────────────────── */

  function getCropTitle(cropContainer) {
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

  /* ── "Edit crop" trigger button ─────────────────────────────── */

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

    /* Try to overlay the button on the image thumbnail */
    var thumb = null;
    Array.from(imageFieldEl.querySelectorAll('img')).forEach(function (img) {
      if (thumb) return;
      var src = img.getAttribute('src') || img.currentSrc || '';
      if (src && !/^data:/.test(src) && !/\.svg(\?.*)?$/i.test(src)) thumb = img;
    });

    if (thumb) {
      var wrapper = thumb.parentElement || imageFieldEl;
      if (window.getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';
      trigger.classList.add('sr-crop-trigger--overlay');
      wrapper.appendChild(trigger);
    } else {
      imageFieldEl.appendChild(trigger);
    }
  }

  /* ── modal ──────────────────────────────────────────────────── */

  function closeEditor() {
    if (!activeEditor) return;
    if (activeEditor.resizeObserver) activeEditor.resizeObserver.disconnect();
    activeEditor.overlay.remove();
    activeEditor = null;
    document.documentElement.classList.remove('sr-crop-modal-open');
  }

  function openEditor(record) {
    closeEditor();

    var imageUrl = extractImageUrl(record.imageField);
    var draft = {
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
          '<div class="sr-crop-modal__stage', (hasImage ? '' : ' is-empty'), '">',
            '<img class="sr-crop-modal__backdrop" alt="" draggable="false"',
                 (hasImage ? ' src="' + imageUrl.replace(/"/g, '&quot;') + '"' : ''), '>',
            '<div class="sr-crop-modal__frame" style="aspect-ratio:', record.aspectRatio,
                 '" tabindex="0" role="application" aria-label="Drag the image to choose the visible crop">',
              '<img class="sr-crop-modal__preview" alt="" draggable="false"',
                   (hasImage ? ' src="' + imageUrl.replace(/"/g, '&quot;') + '"' : ''), '>',
            '</div>',
            '<span>Select an image first.</span>',
          '</div>',
          '<div class="sr-crop-modal__zoom">',
            '<button type="button" data-sr-zoom-out>&minus;</button>',
            '<label><span>Zoom <strong data-sr-zoom-val></strong></span>',
              '<input type="range" min="1" max="3" step="0.05"></label>',
            '<button type="button" data-sr-zoom-in>&plus;</button>',
          '</div>',
          '<p class="sr-crop-modal__hint"><span data-sr-position></span> &nbsp;&bull;&nbsp; Drag to reposition &nbsp;&bull;&nbsp; Scroll to zoom</p>',
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

    var stage   = overlay.querySelector('.sr-crop-modal__stage');
    var frame   = overlay.querySelector('.sr-crop-modal__frame');
    var img     = frame.querySelector('.sr-crop-modal__preview');
    var backdrop = stage.querySelector('.sr-crop-modal__backdrop');
    var range   = overlay.querySelector('input[type="range"]');
    var zoomVal = overlay.querySelector('[data-sr-zoom-val]');
    var positionVal = overlay.querySelector('[data-sr-position]');

    function fitCropFrame() {
      var parts = String(record.aspectRatio).split('/');
      var ratio = clamp(Number(parts[0]) / Number(parts[1]), 0.25, 4, 4 / 3);
      var rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var width = rect.width * 0.78;
      var height = width / ratio;
      var maxHeight = rect.height * 0.78;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
      frame.style.width = Math.round(width) + 'px';
      frame.style.height = Math.round(height) + 'px';
    }

    function render() {
      img.style.objectFit       = 'cover';
      img.style.objectPosition  = draft.x + '% ' + draft.y + '%';
      img.style.transformOrigin = draft.x + '% ' + draft.y + '%';
      img.style.transform       = 'scale(' + draft.zoom + ')';
      range.value               = String(draft.zoom);
      zoomVal.textContent       = draft.zoom.toFixed(2) + '×';
      positionVal.textContent   = 'Position ' + Math.round(draft.x) + '% · ' + Math.round(draft.y) + '%';
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

    frame.addEventListener('keydown', function (e) {
      if (!hasImage || !/^Arrow/.test(e.key)) return;
      e.preventDefault();
      var step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft')  draft.x = clamp(draft.x - step, 0, 100, 50);
      if (e.key === 'ArrowRight') draft.x = clamp(draft.x + step, 0, 100, 50);
      if (e.key === 'ArrowUp')    draft.y = clamp(draft.y - step, 0, 100, 50);
      if (e.key === 'ArrowDown')  draft.y = clamp(draft.y + step, 0, 100, 50);
      render();
    });

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

    var resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(fitCropFrame) : null;
    if (resizeObserver) resizeObserver.observe(stage);
    activeEditor = { overlay: overlay, record: record, resizeObserver: resizeObserver };
    if (hasImage) {
      var applyImageRatio = function () {
        var naturalRatio = backdrop.naturalWidth / Math.max(1, backdrop.naturalHeight);
        stage.style.aspectRatio = String(clamp(naturalRatio, 0.72, 1.8, 4 / 3));
        fitCropFrame();
      };
      backdrop.addEventListener('load', applyImageRatio);
      if (backdrop.complete) applyImageRatio();
    }
    requestAnimationFrame(fitCropFrame);
    render();
    overlay.querySelector('.sr-crop-modal__close').focus();
  }

  /* ── main scan ──────────────────────────────────────────────── */

  function scan() {
    var allInputs = Array.from(document.querySelectorAll('input'));

    /* Method 1 – start from <input> elements, walk up to find labels */
    var hfpInputs = allInputs.filter(function (inp) {
      if (inp.closest('.sr-crop-modal') || inp.closest('.sr-crop-storage')) return false;
      if (enhancedInputs.has(inp)) return false;
      if (isExcludedType(inp)) return false;
      return isLabeledWith(inp, /horizontal focal point/i);
    });

    /* Method 2 – scan text nodes for the label text, then locate nearby inputs */
    if (!hfpInputs.length) {
      hfpInputs = findHfpByText();
      if (hfpInputs.length) log('text-node fallback found', hfpInputs.length, 'HFP input(s)');
    }

    log('scan: hfpInputs =', hfpInputs.length, ' / total inputs =', allInputs.length);

    if (!hfpInputs.length) {
      setBadge('running – waiting for crop fields…', false);
      return;
    }

    hfpInputs.forEach(function (xInp) {
      var cropContainer = findCropContainer(xInp);
      if (!cropContainer) { log('no crop container for', xInp); return; }

      var yInp    = findInputByLabel(cropContainer, /vertical focal point/i);
      var zoomInp = findInputByLabel(cropContainer, /\bzoom\b/i);
      if (!yInp || !zoomInp) { log('missing y or zoom input inside cropContainer'); return; }
      if (enhancedInputs.has(zoomInp)) return; /* already enhanced */

      var imageField = findImageField(cropContainer);
      if (!imageField) { log('no image field found for cropContainer'); return; }

      var cropTitle  = getCropTitle(cropContainer);
      var imageTitle = getImageTitle(cropTitle);
      log('enhancing:', JSON.stringify(imageTitle));

      var section = findSectionToHide(cropContainer, imageField);
      section.classList.add('sr-crop-storage');
      section.setAttribute('aria-hidden', 'true');

      enhancedInputs.add(xInp);
      enhancedInputs.add(yInp);
      enhancedInputs.add(zoomInp);
      totalEnhanced++;

      placeTrigger(imageField, {
        xInput:      xInp,
        yInput:      yInp,
        zoomInput:   zoomInp,
        imageField:  imageField,
        imageTitle:  imageTitle,
        aspectRatio: inferAspectRatio(imageTitle)
      });
    });

    if (totalEnhanced > 0) setBadge(totalEnhanced + ' crop editor(s) active', true);
  }

  /* ── styles ──────────────────────────────────────────────────── */

  function installStyles() {
    if (document.getElementById('sr-crop-editor-styles')) return;
    var style = document.createElement('style');
    style.id  = 'sr-crop-editor-styles';
    style.textContent = [
      '.sr-crop-storage{display:none!important}',

      '.sr-crop-trigger{display:inline-flex;align-items:center;gap:6px;min-height:36px;' +
        'margin:10px 0 0 0;padding:6px 14px;border:1px solid #aeb3b7;border-radius:4px;' +
        'background:#fff;color:#202124;font:600 13px/1 system-ui,-apple-system,sans-serif;' +
        'cursor:pointer;white-space:nowrap}',
      '.sr-crop-trigger:hover{background:#f1f3f4;border-color:#666}',
      '.sr-crop-trigger svg{flex-shrink:0;opacity:.7}',
      '.sr-crop-trigger--overlay{position:absolute;top:8px;right:8px;z-index:10;margin:0;' +
        'background:rgba(255,255,255,.9);box-shadow:0 1px 6px rgba(0,0,0,.2);' +
        'border-color:transparent;backdrop-filter:blur(4px)}',
      '.sr-crop-trigger--overlay:hover{background:#fff;border-color:#aaa}',

      '.sr-crop-modal-open{overflow:hidden}',
      '.sr-crop-modal{position:fixed;inset:0;z-index:2147483646;display:grid;' +
        'place-items:center;padding:20px;background:rgba(15,16,18,.65);' +
        'font-family:system-ui,-apple-system,sans-serif}',
      '.sr-crop-modal__panel{display:grid;grid-template-rows:auto 1fr auto;' +
        'width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);' +
        'overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.3)}',
      '.sr-crop-modal__header{display:flex;align-items:center;justify-content:space-between;' +
        'gap:16px;padding:16px 20px;border-bottom:1px solid #e8e8e8}',
      '.sr-crop-modal__header>div{display:grid;gap:2px}',
      '.sr-crop-modal__header strong{font-size:17px;color:#111}',
      '.sr-crop-modal__header span{color:#666;font-size:13px}',
      '.sr-crop-modal__close{width:34px;height:34px;padding:0;border:0;border-radius:50%;' +
        'background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#444}',
      '.sr-crop-modal__close:hover{background:#f0f0f0}',
      '.sr-crop-modal__body{display:grid;gap:16px;overflow:auto;padding:20px}',
      '.sr-crop-modal__stage{position:relative;display:grid;place-items:center;justify-self:center;' +
        'width:min(100%,680px);max-height:58vh;overflow:hidden;aspect-ratio:4/3;' +
        'border:2px solid #171717;border-radius:8px;background:#171717}',
      '.sr-crop-modal__backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
        'filter:brightness(.46);user-select:none;pointer-events:none}',
      '.sr-crop-modal__frame{position:relative;z-index:2;overflow:hidden;border:3px solid #fff;' +
        'border-radius:2px;background:#111;cursor:grab;touch-action:none;' +
        'box-shadow:0 0 0 999px rgba(10,10,10,.18),0 4px 24px rgba(0,0,0,.28);outline:none}',
      '.sr-crop-modal__frame:focus-visible{box-shadow:0 0 0 3px #1683ff,0 0 0 999px rgba(10,10,10,.18)}',
      '.sr-crop-modal__frame:active{cursor:grabbing}',
      '.sr-crop-modal__frame::after{content:"";position:absolute;inset:0;z-index:2;' +
        'pointer-events:none;' +
        'background:linear-gradient(90deg,' +
          'transparent calc(33.333% - .5px),' +
          'rgba(255,255,255,.3) calc(33.333% - .5px),' +
          'rgba(255,255,255,.3) calc(33.333% + .5px),' +
          'transparent calc(33.333% + .5px),' +
          'transparent calc(66.667% - .5px),' +
          'rgba(255,255,255,.3) calc(66.667% - .5px),' +
          'rgba(255,255,255,.3) calc(66.667% + .5px),' +
          'transparent calc(66.667% + .5px)),' +
        'linear-gradient(0deg,' +
          'transparent calc(33.333% - .5px),' +
          'rgba(255,255,255,.3) calc(33.333% - .5px),' +
          'rgba(255,255,255,.3) calc(33.333% + .5px),' +
          'transparent calc(33.333% + .5px),' +
          'transparent calc(66.667% - .5px),' +
          'rgba(255,255,255,.3) calc(66.667% - .5px),' +
          'rgba(255,255,255,.3) calc(66.667% + .5px),' +
          'transparent calc(66.667% + .5px))}',
      '.sr-crop-modal__preview{display:block;width:100%;height:100%;' +
        'object-fit:cover;user-select:none;will-change:transform}',
      '.sr-crop-modal__stage>span{display:none;position:absolute;inset:0;z-index:4;' +
        'place-items:center;padding:24px;color:#fff;text-align:center;font-size:15px}',
      '.sr-crop-modal__stage.is-empty>span{display:grid}',
      '.sr-crop-modal__stage.is-empty .sr-crop-modal__frame{display:none}',
      '.sr-crop-modal__zoom{display:grid;grid-template-columns:38px 1fr 38px;align-items:end;gap:10px}',
      '.sr-crop-modal__zoom label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#333}',
      '.sr-crop-modal__zoom input[type="range"]{width:100%;margin:0;accent-color:#111}',
      '.sr-crop-modal__zoom button{width:38px;height:38px;border:1px solid #ccc;' +
        'border-radius:4px;background:#fff;font-size:20px;cursor:pointer}',
      '.sr-crop-modal__zoom button:hover{background:#f0f0f0}',
      '.sr-crop-modal__hint{margin:0;font-size:12px;color:#888;text-align:center}',
      '.sr-crop-modal__footer{display:flex;align-items:center;justify-content:space-between;' +
        'gap:12px;padding:14px 20px;border-top:1px solid #e8e8e8}',
      '.sr-crop-modal__footer>div{display:flex;gap:8px}',
      '.sr-crop-modal__footer button{min-height:38px;padding:7px 16px;border:1px solid #bbb;' +
        'border-radius:5px;background:#fff;font-weight:600;font-size:13px;cursor:pointer;color:#111}',
      '.sr-crop-modal__footer button:hover{background:#f5f5f5}',
      '.sr-crop-modal__save{border-color:#111!important;background:#111!important;color:#fff!important}',
      '.sr-crop-modal__save:hover{background:#333!important;border-color:#333!important}',
      '@media(max-width:600px){' +
        '.sr-crop-modal{padding:0}' +
        '.sr-crop-modal__panel{width:100vw;max-height:100dvh;border-radius:0}' +
        '.sr-crop-modal__body,.sr-crop-modal__header,.sr-crop-modal__footer{padding:12px 14px}' +
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── bootstrap ───────────────────────────────────────────────── */

  installStyles();
  setBadge('v5 loaded', false);

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

  /* Retry every second for the first 40 s — catches async CMS rendering */
  var retries = 0;
  var retryTimer = setInterval(function () {
    scan();
    if (++retries >= 40) clearInterval(retryTimer);
  }, 1000);

  window.addEventListener('load', scan);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeEditor) closeEditor();
  });

  scan();
})();
