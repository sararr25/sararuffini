/*
 * Visual crop editor for Sveltia CMS.
 * Keeps the native { x, y, zoom } object fields as hidden storage and exposes
 * one Edit crop button beside the matching image field.
 *
 * Sveltia CMS does not currently implement CMS.registerWidget/registerFieldType.
 * This standalone module therefore enhances the existing fields without
 * changing the CMS schema.
 */
(function () {
  var enhancedInputs = new WeakSet();
  var activeEditor = null;

  function clamp(value, min, max, fallback) {
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function isNumericInput(input) {
    if (!input || input.disabled) return false;
    var type = (input.getAttribute('type') || 'text').toLowerCase();
    if (['button', 'checkbox', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].indexOf(type) !== -1) {
      return false;
    }
    return type === 'number' || input.getAttribute('role') === 'spinbutton' || /^-?\d+(?:\.\d+)?$/.test(input.value || '');
  }

  function getInputContext(input, boundary) {
    var parts = [
      input.name || '',
      input.id || '',
      input.getAttribute('aria-label') || ''
    ];
    var labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy) {
      var labelledNode = document.getElementById(labelledBy);
      if (labelledNode) parts.push(labelledNode.textContent || '');
    }

    for (var node = input.parentElement; node && node !== boundary && node !== document.body; node = node.parentElement) {
      parts.push(node.textContent || '');
      var numericCount = Array.from(node.querySelectorAll('input')).filter(isNumericInput).length;
      if (numericCount === 1 && /horizontal focal point|vertical focal point|zoom/i.test(parts.join(' '))) break;
    }
    return normalizeText(parts.join(' '));
  }

  function getCropInputs(scope) {
    var inputs = Array.from(scope.querySelectorAll('input')).filter(isNumericInput);
    var xInput = inputs.find(function (input) {
      return /horizontal focal point|(^|[.[_-])x\]?$|\bfocal.*\bx\b/i.test(getInputContext(input, scope));
    });
    var yInput = inputs.find(function (input) {
      return /vertical focal point|(^|[.[_-])y\]?$|\bfocal.*\by\b/i.test(getInputContext(input, scope));
    });
    var zoomInput = inputs.find(function (input) {
      return /zoom/i.test(getInputContext(input, scope));
    });

    if (!xInput || !yInput || !zoomInput || new Set([xInput, yInput, zoomInput]).size !== 3) {
      xInput = inputs[0];
      yInput = inputs[1];
      zoomInput = inputs[2];
    }

    return {
      xInput: xInput,
      yInput: yInput,
      zoomInput: zoomInput
    };
  }

  function readCrop(record) {
    return {
      x: clamp(record.xInput.value, 0, 100, 50),
      y: clamp(record.yInput.value, 0, 100, 50),
      zoom: clamp(record.zoomInput.value, 1, 3, 1)
    };
  }

  function setNativeValue(input, value) {
    if (!input) return;
    var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, String(value));
    } else {
      input.value = String(value);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function normalizeAssetUrl(url) {
    if (!url) return '';
    try {
      return new URL(url, window.location.origin).href;
    } catch (error) {
      return url;
    }
  }

  function extractImageUrl(node) {
    if (!node) return '';

    var textInput = Array.from(node.querySelectorAll('input[type="text"], input[type="url"], input:not([type])')).find(function (input) {
      return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(input.value || '');
    });
    if (textInput) return normalizeAssetUrl(textInput.value);

    var pathMatch = (node.textContent || '').match(/(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|avif|svg)(?:\?[^\s"'<>]*)?/i);
    if (pathMatch) return normalizeAssetUrl(pathMatch[0]);

    var image = Array.from(node.querySelectorAll('img')).find(function (img) {
      return !img.closest('.sr-crop-modal') && !!(img.currentSrc || img.src);
    });
    return image ? normalizeAssetUrl(image.currentSrc || image.src) : '';
  }

  function getCropTitle(scope) {
    var candidates = Array.from(scope.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6, p, span, div'))
      .map(function (node) {
        return { node: node, text: normalizeText(node.textContent) };
      })
      .filter(function (item) {
        return /crop position$/i.test(item.text) && item.text.length < 120;
      })
      .sort(function (a, b) {
        return a.text.length - b.text.length;
      });
    return candidates.length ? candidates[0].text : 'Image Crop Position';
  }

  function getImageTitle(cropTitle) {
    return normalizeText(cropTitle.replace(/\s+crop position$/i, ''));
  }

  function isBefore(node, reference) {
    return !!(node.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  function findImageField(scope, imageTitle) {
    var labels = Array.from(document.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6, p, span, div'))
      .filter(function (node) {
        var ownText = normalizeText(Array.from(node.childNodes).filter(function (child) {
          return child.nodeType === Node.TEXT_NODE;
        }).map(function (child) {
          return child.textContent;
        }).join(' '));
        return isBefore(node, scope) && (ownText === imageTitle || normalizeText(node.textContent) === imageTitle);
      })
      .reverse();

    for (var index = 0; index < labels.length; index += 1) {
      for (var node = labels[index]; node && node !== document.body; node = node.parentElement) {
        if (node.contains(scope)) break;
        if (extractImageUrl(node)) return node;
        if (node.querySelectorAll('label, legend, h1, h2, h3, h4, h5, h6').length > 3) break;
      }
    }
    return null;
  }

  function inferAspectRatio(title) {
    var normalized = title.toLowerCase();
    if (/portrait|profile|avatar/.test(normalized)) return '4 / 5';
    if (/polaroid|detail/.test(normalized)) return '4 / 5';
    if (/logo|journey|seo|og image/.test(normalized)) return '1 / 1';
    if (/hero|wide|browser|video|shot|media/.test(normalized)) return '16 / 9';
    return '4 / 3';
  }

  function findCropScopes() {
    var candidates = Array.from(document.querySelectorAll('fieldset, [role="group"], section, article, div')).filter(function (node) {
      if (node.classList.contains('sr-crop-storage')) return false;
      var text = normalizeText(node.textContent);
      if (!/crop position/i.test(text) || !/horizontal focal point/i.test(text) || !/vertical focal point/i.test(text) || !/zoom/i.test(text)) {
        return false;
      }
      var inputs = Array.from(node.querySelectorAll('input')).filter(isNumericInput);
      return inputs.length >= 3 && inputs.length <= 4;
    });

    return candidates.filter(function (candidate) {
      return !candidates.some(function (other) {
        return other !== candidate && candidate.contains(other);
      });
    });
  }

  function closeEditor() {
    if (!activeEditor) return;
    activeEditor.overlay.remove();
    activeEditor = null;
    document.documentElement.classList.remove('sr-crop-modal-open');
  }

  function openEditor(record) {
    closeEditor();

    var imageUrl = extractImageUrl(record.imageField);
    var draft = readCrop(record);
    var overlay = document.createElement('div');
    overlay.className = 'sr-crop-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Crop ' + record.imageTitle);
    overlay.innerHTML = [
      '<div class="sr-crop-modal__panel">',
      '<div class="sr-crop-modal__header">',
      '<div><strong>Crop image</strong><span>' + record.imageTitle + '</span></div>',
      '<button type="button" class="sr-crop-modal__close" aria-label="Close crop editor">&times;</button>',
      '</div>',
      '<div class="sr-crop-modal__body">',
      '<div class="sr-crop-modal__frame' + (imageUrl ? '' : ' is-empty') + '" style="aspect-ratio:' + record.aspectRatio + '">',
      '<img alt="" draggable="false"' + (imageUrl ? ' src="' + imageUrl.replace(/"/g, '&quot;') + '"' : '') + '>',
      '<span>Select an image before cropping.</span>',
      '</div>',
      '<div class="sr-crop-modal__zoom">',
      '<button type="button" data-crop-zoom-out aria-label="Zoom out">&minus;</button>',
      '<label><span>Zoom <strong data-crop-zoom-value></strong></span><input type="range" min="1" max="3" step="0.05"></label>',
      '<button type="button" data-crop-zoom-in aria-label="Zoom in">&plus;</button>',
      '</div>',
      '</div>',
      '<div class="sr-crop-modal__footer">',
      '<button type="button" class="sr-crop-modal__reset">Reset</button>',
      '<div><button type="button" class="sr-crop-modal__cancel">Cancel</button><button type="button" class="sr-crop-modal__save">Confirm</button></div>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    document.documentElement.classList.add('sr-crop-modal-open');

    var frame = overlay.querySelector('.sr-crop-modal__frame');
    var image = frame.querySelector('img');
    var range = overlay.querySelector('input[type="range"]');
    var zoomValue = overlay.querySelector('[data-crop-zoom-value]');

    function renderDraft() {
      var position = draft.x + '% ' + draft.y + '%';
      image.style.objectPosition = position;
      image.style.transformOrigin = position;
      image.style.transform = 'scale(' + draft.zoom + ')';
      range.value = String(draft.zoom);
      zoomValue.textContent = draft.zoom.toFixed(2) + 'x';
    }

    function setZoom(value) {
      draft.zoom = Math.round(clamp(value, 1, 3, draft.zoom) * 100) / 100;
      renderDraft();
    }

    var pointers = new Map();
    var gesture = null;

    function pointerDistance() {
      var points = Array.from(pointers.values());
      if (points.length < 2) return 0;
      return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    }

    frame.addEventListener('pointerdown', function (event) {
      if (!imageUrl) return;
      event.preventDefault();
      frame.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      gesture = {
        startX: event.clientX,
        startY: event.clientY,
        startDistance: pointerDistance(),
        startCrop: { x: draft.x, y: draft.y, zoom: draft.zoom }
      };
    });

    frame.addEventListener('pointermove', function (event) {
      if (!pointers.has(event.pointerId) || !gesture) return;
      event.preventDefault();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size >= 2) {
        var distance = pointerDistance();
        if (!gesture.startDistance) {
          gesture.startDistance = distance;
          gesture.startCrop.zoom = draft.zoom;
        }
        setZoom(gesture.startCrop.zoom * (distance / Math.max(1, gesture.startDistance)));
        return;
      }

      var rect = frame.getBoundingClientRect();
      draft.x = clamp(gesture.startCrop.x - ((event.clientX - gesture.startX) / Math.max(1, rect.width)) * 100, 0, 100, 50);
      draft.y = clamp(gesture.startCrop.y - ((event.clientY - gesture.startY) / Math.max(1, rect.height)) * 100, 0, 100, 50);
      draft.zoom = gesture.startCrop.zoom;
      renderDraft();
    });

    function stopPointer(event) {
      pointers.delete(event.pointerId);
      if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
      if (!pointers.size) {
        gesture = null;
        return;
      }
      var remaining = Array.from(pointers.values())[0];
      gesture = {
        startX: remaining.x,
        startY: remaining.y,
        startDistance: 0,
        startCrop: { x: draft.x, y: draft.y, zoom: draft.zoom }
      };
    }

    frame.addEventListener('pointerup', stopPointer);
    frame.addEventListener('pointercancel', stopPointer);
    frame.addEventListener('wheel', function (event) {
      if (!imageUrl) return;
      event.preventDefault();
      setZoom(draft.zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    }, { passive: false });

    range.addEventListener('input', function (event) {
      setZoom(event.target.value);
    });
    overlay.querySelector('[data-crop-zoom-out]').addEventListener('click', function () {
      setZoom(draft.zoom - 0.1);
    });
    overlay.querySelector('[data-crop-zoom-in]').addEventListener('click', function () {
      setZoom(draft.zoom + 0.1);
    });
    overlay.querySelector('.sr-crop-modal__reset').addEventListener('click', function () {
      draft = { x: 50, y: 50, zoom: 1 };
      renderDraft();
    });
    overlay.querySelector('.sr-crop-modal__save').addEventListener('click', function () {
      setNativeValue(record.xInput, Math.round(draft.x));
      setNativeValue(record.yInput, Math.round(draft.y));
      setNativeValue(record.zoomInput, draft.zoom.toFixed(2));
      closeEditor();
    });
    overlay.querySelector('.sr-crop-modal__cancel').addEventListener('click', closeEditor);
    overlay.querySelector('.sr-crop-modal__close').addEventListener('click', closeEditor);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeEditor();
    });

    activeEditor = { overlay: overlay, record: record };
    renderDraft();
    overlay.querySelector('.sr-crop-modal__close').focus();
  }

  function enhanceScope(scope) {
    var inputs = getCropInputs(scope);
    if (!inputs.xInput || !inputs.yInput || !inputs.zoomInput) return;
    if (enhancedInputs.has(inputs.zoomInput)) return;

    var cropTitle = getCropTitle(scope);
    var imageTitle = getImageTitle(cropTitle);
    var imageField = findImageField(scope, imageTitle);
    if (!imageField) return;

    var existingTrigger = imageField.querySelector('[data-sr-crop-trigger]');
    scope.classList.add('sr-crop-storage');
    scope.setAttribute('aria-hidden', 'true');
    enhancedInputs.add(inputs.xInput);
    enhancedInputs.add(inputs.yInput);
    enhancedInputs.add(inputs.zoomInput);
    if (existingTrigger) return;

    var record = {
      scope: scope,
      imageField: imageField,
      imageTitle: imageTitle,
      aspectRatio: inferAspectRatio(imageTitle),
      xInput: inputs.xInput,
      yInput: inputs.yInput,
      zoomInput: inputs.zoomInput
    };
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sr-crop-trigger';
    trigger.dataset.srCropTrigger = 'true';
    trigger.textContent = 'Edit crop';
    trigger.addEventListener('click', function () {
      openEditor(record);
    });
    imageField.appendChild(trigger);
  }

  function scan() {
    findCropScopes().forEach(enhanceScope);
  }

  function installStyles() {
    if (document.getElementById('sr-crop-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'sr-crop-editor-styles';
    style.textContent = [
      '.sr-crop-storage{display:none!important}',
      '.sr-crop-trigger{display:inline-flex;align-items:center;justify-content:center;min-height:38px;margin:10px 0 0 10px;padding:7px 16px;border:1px solid #aeb3b7;border-radius:4px;background:#fff;color:#202124;font:600 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}',
      '.sr-crop-trigger:hover{background:#f1f3f4;border-color:#777}',
      '.sr-crop-modal-open{overflow:hidden}',
      '.sr-crop-modal{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:20px;background:rgba(20,21,22,.62);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '.sr-crop-modal__panel{display:grid;grid-template-rows:auto minmax(0,1fr) auto;width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:hidden;border-radius:8px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.28)}',
      '.sr-crop-modal__header,.sr-crop-modal__footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px}',
      '.sr-crop-modal__header{border-bottom:1px solid #ddd}',
      '.sr-crop-modal__header>div{display:grid;gap:2px}',
      '.sr-crop-modal__header strong{font-size:18px}',
      '.sr-crop-modal__header span{color:#62676b;font-size:13px}',
      '.sr-crop-modal__close{width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;font-size:28px;line-height:1;cursor:pointer}',
      '.sr-crop-modal__close:hover{background:#eee}',
      '.sr-crop-modal__body{display:grid;gap:18px;overflow:auto;padding:20px}',
      '.sr-crop-modal__frame{position:relative;justify-self:center;width:min(100%,620px);max-height:60vh;overflow:hidden;border:2px solid #111;border-radius:6px;background:#111;cursor:grab;touch-action:none}',
      '.sr-crop-modal__frame:active{cursor:grabbing}',
      '.sr-crop-modal__frame::after{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,transparent calc(33.333% - 1px),rgba(255,255,255,.5) calc(33.333% - 1px),rgba(255,255,255,.5) calc(33.333% + 1px),transparent calc(33.333% + 1px),transparent calc(66.666% - 1px),rgba(255,255,255,.5) calc(66.666% - 1px),rgba(255,255,255,.5) calc(66.666% + 1px),transparent calc(66.666% + 1px)),linear-gradient(0deg,transparent calc(33.333% - 1px),rgba(255,255,255,.5) calc(33.333% - 1px),rgba(255,255,255,.5) calc(33.333% + 1px),transparent calc(33.333% + 1px),transparent calc(66.666% - 1px),rgba(255,255,255,.5) calc(66.666% - 1px),rgba(255,255,255,.5) calc(66.666% + 1px),transparent calc(66.666% + 1px));pointer-events:none}',
      '.sr-crop-modal__frame img{display:block;width:100%;height:100%;object-fit:cover;user-select:none;will-change:transform}',
      '.sr-crop-modal__frame span{display:none;position:absolute;inset:0;place-items:center;padding:24px;color:#fff;text-align:center}',
      '.sr-crop-modal__frame.is-empty span{display:grid}',
      '.sr-crop-modal__zoom{display:grid;grid-template-columns:38px minmax(0,1fr) 38px;align-items:end;gap:10px}',
      '.sr-crop-modal__zoom label{display:grid;gap:7px;font-size:13px;font-weight:600}',
      '.sr-crop-modal__zoom input{width:100%;margin:0}',
      '.sr-crop-modal__zoom button{width:38px;height:38px;border:1px solid #bbb;border-radius:4px;background:#fff;font-size:22px;cursor:pointer}',
      '.sr-crop-modal__footer{border-top:1px solid #ddd}',
      '.sr-crop-modal__footer>div{display:flex;gap:10px}',
      '.sr-crop-modal__footer button{min-height:40px;padding:8px 16px;border:1px solid #aaa;border-radius:4px;background:#fff;font-weight:700;cursor:pointer}',
      '.sr-crop-modal__footer .sr-crop-modal__save{border-color:#111;background:#111;color:#fff}',
      '@media(max-width:600px){.sr-crop-modal{padding:0}.sr-crop-modal__panel{width:100vw;max-height:100vh;min-height:100vh;border-radius:0}.sr-crop-modal__body{padding:14px}.sr-crop-modal__header,.sr-crop-modal__footer{padding:14px}.sr-crop-modal__footer{align-items:stretch}.sr-crop-modal__footer>div{display:grid;grid-template-columns:1fr 1fr;flex:1}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  installStyles();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && activeEditor) closeEditor();
  });
  scan();
})();
