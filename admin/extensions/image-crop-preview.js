/*
 * Visual image crop/zoom field for Sveltia CMS.
 * Stores { x: 0-100, y: 0-100, zoom: 1-3 } and previews the sibling image field.
 */
(function () {
  var CMS = window.CMS;
  var React = window.React;
  var register = CMS && (CMS.registerFieldType || CMS.registerWidget);

  if (!CMS || !React || !register) {
    return;
  }

  var h = React.createElement;

  function clamp(value, min, max) {
    var number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function getConfigValue(field, key, fallback) {
    if (!field) return fallback;
    if (typeof field.get === 'function') return field.get(key) || fallback;
    return field[key] || fallback;
  }

  function getIn(value, path) {
    if (!value) return undefined;
    if (typeof value.getIn === 'function') return value.getIn(path);
    return path.reduce(function (acc, key) {
      return acc && acc[key];
    }, value);
  }

  function parseCrop(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return {
        x: clamp(value.x, 0, 100),
        y: clamp(value.y, 0, 100),
        zoom: clamp(value.zoom || 1, 1, 3)
      };
    }

    if (typeof value === 'string') {
      var match = value.trim().match(/^(\d{1,3}),(\d{1,3})(?:,(\d{1,3}))?/);
      if (match) {
        return {
          x: clamp(match[1], 0, 100),
          y: clamp(match[2], 0, 100),
          zoom: clamp((Number(match[3]) || 100) / 100, 1, 3)
        };
      }
    }

    return { x: 50, y: 50, zoom: 1 };
  }

  function getAssetUrl(props, rawUrl) {
    if (!rawUrl) return '';
    if (props && typeof props.getAsset === 'function') {
      return props.getAsset(rawUrl);
    }
    return rawUrl;
  }

  class ImageCropControl extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        dragging: false,
        startX: 0,
        startY: 0,
        startCrop: parseCrop(props.value)
      };
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.setCrop = this.setCrop.bind(this);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.value !== this.props.value && !this.state.dragging) {
        this.setState({ startCrop: parseCrop(this.props.value) });
      }
    }

    getCrop() {
      return parseCrop(this.props.value);
    }

    getImageUrl() {
      var imageField = getConfigValue(this.props.field, 'image_field', '');
      var rawValue = imageField ? getIn(this.props.entry, ['data', imageField]) : '';
      return getAssetUrl(this.props, rawValue);
    }

    setCrop(nextCrop) {
      var crop = {
        x: Math.round(clamp(nextCrop.x, 0, 100)),
        y: Math.round(clamp(nextCrop.y, 0, 100)),
        zoom: Math.round(clamp(nextCrop.zoom, 1, 3) * 100) / 100
      };
      this.props.onChange(crop);
    }

    onPointerDown(event) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      this.setState({
        dragging: true,
        startX: event.clientX,
        startY: event.clientY,
        startCrop: this.getCrop()
      });
    }

    onPointerMove(event) {
      if (!this.state.dragging) return;
      var rect = event.currentTarget.getBoundingClientRect();
      var dx = ((event.clientX - this.state.startX) / Math.max(1, rect.width)) * 100;
      var dy = ((event.clientY - this.state.startY) / Math.max(1, rect.height)) * 100;
      this.setCrop({
        x: this.state.startCrop.x - dx,
        y: this.state.startCrop.y - dy,
        zoom: this.state.startCrop.zoom
      });
    }

    onPointerUp(event) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      this.setState({ dragging: false });
    }

    render() {
      var crop = this.getCrop();
      var imageUrl = this.getImageUrl();
      var aspectRatio = getConfigValue(this.props.field, 'aspect_ratio', '1 / 1');
      var position = crop.x + '% ' + crop.y + '%';

      return h('div', { className: 'sr-cms-crop' }, [
        h('div', {
          key: 'frame',
          className: 'sr-cms-crop__frame',
          style: { aspectRatio: aspectRatio },
          onPointerDown: this.onPointerDown,
          onPointerMove: this.onPointerMove,
          onPointerUp: this.onPointerUp
        }, imageUrl
          ? h('img', {
              alt: '',
              draggable: false,
              src: imageUrl,
              style: {
                objectPosition: position,
                transform: 'scale(' + crop.zoom + ')',
                transformOrigin: position
              }
            })
          : h('span', null, 'Choose the image first, then drag here to crop.')),
        h('label', { key: 'zoom', className: 'sr-cms-crop__control' }, [
          h('span', { key: 'label' }, 'Zoom ' + crop.zoom.toFixed(2) + 'x'),
          h('input', {
            key: 'input',
            type: 'range',
            min: '1',
            max: '3',
            step: '0.05',
            value: crop.zoom,
            onChange: function (event) {
              this.setCrop({ x: crop.x, y: crop.y, zoom: event.target.value });
            }.bind(this)
          })
        ]),
        h('div', { key: 'numbers', className: 'sr-cms-crop__numbers' }, [
          h('label', { key: 'x' }, ['X', h('input', { type: 'number', min: 0, max: 100, value: crop.x, onChange: function (event) { this.setCrop({ x: event.target.value, y: crop.y, zoom: crop.zoom }); }.bind(this) })]),
          h('label', { key: 'y' }, ['Y', h('input', { type: 'number', min: 0, max: 100, value: crop.y, onChange: function (event) { this.setCrop({ x: crop.x, y: event.target.value, zoom: crop.zoom }); }.bind(this) })])
        ])
      ]);
    }
  }

  register.call(CMS, 'image_crop', ImageCropControl);

  var style = document.createElement('style');
  style.textContent = [
    '.sr-cms-crop{display:grid;gap:12px;max-width:520px}',
    '.sr-cms-crop__frame{position:relative;overflow:hidden;background:#111;border:2px solid #111;border-radius:8px;cursor:grab;touch-action:none}',
    '.sr-cms-crop__frame:active{cursor:grabbing}',
    '.sr-cms-crop__frame img{width:100%;height:100%;object-fit:cover;display:block;user-select:none;transition:filter .15s ease}',
    '.sr-cms-crop__frame span{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:600 13px/1.4 system-ui;padding:20px;text-align:center}',
    '.sr-cms-crop__control{display:grid;gap:6px;font:600 13px/1.3 system-ui;color:#111}',
    '.sr-cms-crop__control input{width:100%}',
    '.sr-cms-crop__numbers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
    '.sr-cms-crop__numbers label{display:grid;gap:4px;font:600 12px system-ui;color:#444}',
    '.sr-cms-crop__numbers input{width:100%;box-sizing:border-box}'
  ].join('\n');
  document.head.appendChild(style);
})();

/*
 * Fallback for Sveltia builds without custom field globals:
 * add a compact visual preview beside built-in crop object fields when possible.
 */
(function () {
  function installFallbackStyles() {
    if (document.getElementById('sr-cms-crop-fallback-styles')) return;
    var style = document.createElement('style');
    style.id = 'sr-cms-crop-fallback-styles';
    style.textContent = [
      '.sr-cms-crop{display:grid;gap:12px;max-width:520px;margin:0 0 16px}',
      '.sr-cms-crop__title{font:700 13px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#333}',
      '.sr-cms-crop__frame{position:relative;overflow:hidden;background:#111;border:2px solid #111;border-radius:8px;cursor:grab;touch-action:none;min-height:160px}',
      '.sr-cms-crop__frame:active{cursor:grabbing}',
      '.sr-cms-crop__frame::before{content:"";position:absolute;inset:14%;z-index:2;border:2px solid rgba(255,255,255,.92);box-shadow:0 0 0 999px rgba(0,0,0,.22);pointer-events:none}',
      '.sr-cms-crop__frame::after{content:"";position:absolute;inset:0;z-index:3;background:linear-gradient(90deg,transparent calc(33.333% - 1px),rgba(255,255,255,.42) calc(33.333% - 1px),rgba(255,255,255,.42) calc(33.333% + 1px),transparent calc(33.333% + 1px),transparent calc(66.666% - 1px),rgba(255,255,255,.42) calc(66.666% - 1px),rgba(255,255,255,.42) calc(66.666% + 1px),transparent calc(66.666% + 1px)),linear-gradient(0deg,transparent calc(33.333% - 1px),rgba(255,255,255,.42) calc(33.333% - 1px),rgba(255,255,255,.42) calc(33.333% + 1px),transparent calc(33.333% + 1px),transparent calc(66.666% - 1px),rgba(255,255,255,.42) calc(66.666% - 1px),rgba(255,255,255,.42) calc(66.666% + 1px),transparent calc(66.666% + 1px));pointer-events:none}',
      '.sr-cms-crop__frame img{width:100%;height:100%;object-fit:cover;display:block;user-select:none;transition:transform .12s ease,filter .15s ease;will-change:transform}',
      '.sr-cms-crop__frame span{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:700 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:20px;text-align:center;z-index:4;background:rgba(0,0,0,.72)}',
      '.sr-cms-crop__frame:not(.is-empty) span{display:none}',
      '.sr-cms-crop__control{display:grid;gap:6px;font:600 13px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111}',
      '.sr-cms-crop__control strong{font-weight:800}',
      '.sr-cms-crop__control input{width:100%}',
      '.sr-cms-crop__numbers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
      '.sr-cms-crop__numbers label{display:grid;gap:4px;font:600 12px system-ui;color:#444}',
      '.sr-cms-crop__numbers input{width:100%;box-sizing:border-box}'
    ].join('\n');
    document.head.appendChild(style);
  }

  installFallbackStyles();

  function clamp(value, min, max, fallback) {
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function getInputText(input) {
    if (!input) return '';
    var label = input.closest('label');
    var labelledBy = input.getAttribute('aria-labelledby');
    var labelledNode = labelledBy && document.getElementById(labelledBy);
    return [
      input.name || '',
      input.id || '',
      input.getAttribute('aria-label') || '',
      label ? label.textContent || '' : '',
      labelledNode ? labelledNode.textContent || '' : ''
    ].join(' ');
  }

  function getCropFromInputs(scope) {
    var inputs = Array.from(scope.querySelectorAll('input[type="number"]'));
    var x = inputs.find(function (input) { return /(^|[.[_-])x\]?$/.test(input.name || '') || /horizontal|focal point.*x|\bx\b/i.test(getInputText(input)); });
    var y = inputs.find(function (input) { return /(^|[.[_-])y\]?$/.test(input.name || '') || /vertical|focal point.*y|\by\b/i.test(getInputText(input)); });
    var zoom = inputs.find(function (input) { return /zoom/i.test(getInputText(input)); });
    return {
      xInput: x,
      yInput: y,
      zoomInput: zoom,
      x: clamp(x && x.value, 0, 100, 50),
      y: clamp(y && y.value, 0, 100, 50),
      zoom: clamp(zoom && zoom.value, 1, 3, 1)
    };
  }

  function dispatchValue(input, value) {
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function extractImageUrl(node) {
    if (!node) return '';

    var image = Array.from(node.querySelectorAll('img')).find(function (img) {
      return !img.closest('.sr-cms-crop--native') && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(img.currentSrc || img.src || '');
    });
    if (image) return image.currentSrc || image.src || '';

    var imageInput = Array.from(node.querySelectorAll('input[type="text"], input[type="url"], input:not([type])')).find(function (input) {
      return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(input.value || '');
    });
    if (imageInput) return imageInput.value;

    var textMatch = (node.textContent || '').match(/(?:https?:\/\/|\/)[^\s"'<>]+\.(?:png|jpe?g|webp|gif|svg)(?:\?[^\s"'<>]*)?/i);
    return textMatch ? textMatch[0] : '';
  }

  function findLikelyImageUrl(scope) {
    for (var node = scope.previousElementSibling; node; node = node.previousElementSibling) {
      var siblingUrl = extractImageUrl(node);
      if (siblingUrl) return siblingUrl;
    }

    var container = scope.parentElement;
    for (var depth = 0; container && depth < 7; depth += 1, container = container.parentElement) {
      var url = extractImageUrl(container);
      if (url) return url;
    }
    return '';
  }

  function getFieldTitle(scope) {
    var text = (scope.textContent || '').replace(/\s+/g, ' ').trim();
    var match = text.match(/([A-Z][A-Za-z0-9\s-]+ Crop Position)/);
    return match ? match[1] : 'Image crop';
  }

  function inferAspectRatio(scope) {
    var title = getFieldTitle(scope).toLowerCase();
    if (/portrait/.test(title)) return '9 / 11';
    if (/wide|browser|video|hero/.test(title)) return '16 / 9';
    if (/polaroid|shot|detail/.test(title)) return '4 / 5';
    return '4 / 3';
  }

  function updatePreview(scope) {
    var crop = getCropFromInputs(scope);
    var frame = scope.querySelector('[data-sr-crop-preview-frame]');
    var image = scope.querySelector('[data-sr-crop-preview-image]');
    var zoomRange = scope.querySelector('[data-sr-crop-preview-zoom]');
    var zoomValue = scope.querySelector('[data-sr-crop-preview-zoom-value]');
    if (!frame || !image) return;

    var position = crop.x + '% ' + crop.y + '%';
    image.style.objectPosition = position;
    image.style.transformOrigin = position;
    image.style.transform = 'scale(' + crop.zoom + ')';
    if (zoomRange && Number(zoomRange.value) !== crop.zoom) {
      zoomRange.value = crop.zoom;
    }
    if (zoomValue) {
      zoomValue.textContent = crop.zoom.toFixed(2) + 'x';
    }

    var url = findLikelyImageUrl(scope);
    if (url && image.getAttribute('src') !== url) {
      image.setAttribute('src', url);
      frame.classList.remove('is-empty');
    } else if (!url) {
      image.removeAttribute('src');
      frame.classList.add('is-empty');
    }
  }

  function findCropScope(input) {
    for (var node = input && input.parentElement; node && node !== document.body; node = node.parentElement) {
      if (node.dataset && node.dataset.srCropEnhanced === 'true') return null;
      if (node.querySelector('.sr-cms-crop--native')) return null;

      var crop = getCropFromInputs(node);
      if (!crop.xInput || !crop.yInput || !crop.zoomInput) continue;

      var numberCount = node.querySelectorAll('input[type="number"]').length;
      var text = node.textContent || '';
      if (numberCount <= 4 && /crop position|horizontal focal point|vertical focal point/i.test(text)) {
        return node;
      }
    }
    return null;
  }

  function enhanceCropObject(scope) {
    if (!scope || scope.dataset.srCropEnhanced === 'true') return;
    var crop = getCropFromInputs(scope);
    if (!crop.xInput || !crop.yInput || !crop.zoomInput) return;

    scope.dataset.srCropEnhanced = 'true';
    var preview = document.createElement('div');
    preview.className = 'sr-cms-crop sr-cms-crop--native';
    preview.innerHTML = [
      '<div class="sr-cms-crop__title">Drag to choose the visible area</div>',
      '<div class="sr-cms-crop__frame is-empty" style="aspect-ratio:' + inferAspectRatio(scope) + '" data-sr-crop-preview-frame>',
      '<img alt="" draggable="false" data-sr-crop-preview-image>',
      '<span>Select or save an image URL first, then drag here to crop.</span>',
      '</div>',
      '<label class="sr-cms-crop__control sr-cms-crop__control--range">',
      '<span>Zoom <strong data-sr-crop-preview-zoom-value>1.00x</strong></span>',
      '<input type="range" min="1" max="3" step="0.05" data-sr-crop-preview-zoom>',
      '</label>'
    ].join('');
    scope.insertBefore(preview, scope.firstChild);

    var frame = preview.querySelector('[data-sr-crop-preview-frame]');
    var zoomRange = preview.querySelector('[data-sr-crop-preview-zoom]');
    frame.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      frame.setPointerCapture(event.pointerId);
      var startX = event.clientX;
      var startY = event.clientY;
      var startCrop = getCropFromInputs(scope);

      function move(moveEvent) {
        var rect = frame.getBoundingClientRect();
        dispatchValue(startCrop.xInput, Math.round(clamp(startCrop.x - ((moveEvent.clientX - startX) / Math.max(1, rect.width)) * 100, 0, 100, 50)));
        dispatchValue(startCrop.yInput, Math.round(clamp(startCrop.y - ((moveEvent.clientY - startY) / Math.max(1, rect.height)) * 100, 0, 100, 50)));
        updatePreview(scope);
      }

      function up(upEvent) {
        frame.releasePointerCapture(upEvent.pointerId);
        frame.removeEventListener('pointermove', move);
        frame.removeEventListener('pointerup', up);
      }

      frame.addEventListener('pointermove', move);
      frame.addEventListener('pointerup', up);
    });

    [crop.xInput, crop.yInput, crop.zoomInput].forEach(function (input) {
      if (input) input.addEventListener('input', function () { updatePreview(scope); });
    });
    if (zoomRange) {
      zoomRange.addEventListener('input', function (event) {
        var current = getCropFromInputs(scope);
        dispatchValue(current.zoomInput, Number(event.target.value).toFixed(2));
        updatePreview(scope);
      });
    }
    updatePreview(scope);
  }

  function scan() {
    var scopes = [];
    Array.from(document.querySelectorAll('input[type="number"]')).forEach(function (input) {
      if (!/zoom/i.test(getInputText(input))) return;
      var scope = findCropScope(input);
      if (scope && scopes.indexOf(scope) === -1) scopes.push(scope);
    });
    scopes.forEach(enhanceCropObject);
  }

  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  scan();
})();
