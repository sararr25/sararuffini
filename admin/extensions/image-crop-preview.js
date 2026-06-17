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
  function clamp(value, min, max, fallback) {
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function getCropFromInputs(scope) {
    var inputs = Array.from(scope.querySelectorAll('input[type="number"]'));
    var x = inputs.find(function (input) { return /(^|[.[_-])x\]?$/.test(input.name || '') || /horizontal/i.test(input.closest('label')?.textContent || ''); });
    var y = inputs.find(function (input) { return /(^|[.[_-])y\]?$/.test(input.name || '') || /vertical/i.test(input.closest('label')?.textContent || ''); });
    var zoom = inputs.find(function (input) { return /zoom/i.test((input.name || '') + ' ' + (input.closest('label')?.textContent || '')); });
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

  function findLikelyImageUrl(scope) {
    var container = scope.parentElement;
    for (var depth = 0; container && depth < 5; depth += 1, container = container.parentElement) {
      var imageInput = Array.from(container.querySelectorAll('input[type="text"], input[type="url"], input:not([type])')).find(function (input) {
        return /image|media_upload/i.test(input.name || '') && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(input.value || '');
      });
      if (imageInput) return imageInput.value;
    }
    return '';
  }

  function updatePreview(scope) {
    var crop = getCropFromInputs(scope);
    var frame = scope.querySelector('[data-sr-crop-preview-frame]');
    var image = scope.querySelector('[data-sr-crop-preview-image]');
    if (!frame || !image) return;

    var position = crop.x + '% ' + crop.y + '%';
    image.style.objectPosition = position;
    image.style.transformOrigin = position;
    image.style.transform = 'scale(' + crop.zoom + ')';

    var url = findLikelyImageUrl(scope);
    if (url && image.getAttribute('src') !== url) {
      image.setAttribute('src', url);
      frame.classList.remove('is-empty');
    }
  }

  function enhanceCropObject(scope) {
    if (!scope || scope.dataset.srCropEnhanced === 'true') return;
    var text = scope.textContent || '';
    if (!/crop position/i.test(text) || !/Horizontal focal point/i.test(text) || !/Zoom/i.test(text)) return;

    scope.dataset.srCropEnhanced = 'true';
    var preview = document.createElement('div');
    preview.className = 'sr-cms-crop sr-cms-crop--native';
    preview.innerHTML = '<div class="sr-cms-crop__frame is-empty" data-sr-crop-preview-frame><img alt="" draggable="false" data-sr-crop-preview-image><span>Crop preview appears after the image field has a saved URL.</span></div>';
    scope.insertBefore(preview, scope.firstChild);

    var crop = getCropFromInputs(scope);
    var frame = preview.querySelector('[data-sr-crop-preview-frame]');
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
    updatePreview(scope);
  }

  function scan() {
    document.querySelectorAll('fieldset, [role="group"], section, div').forEach(enhanceCropObject);
  }

  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  scan();
})();
