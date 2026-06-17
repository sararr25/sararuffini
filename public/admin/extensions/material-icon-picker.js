/*
 * Visual Material Symbols icon picker for Sveltia CMS.
 * Stores the selected icon name as a string from the curated site icon list.
 */
(function () {
  var ICONS = [
    'account_tree', 'add', 'arrow_back', 'arrow_forward', 'arrow_outward', 'auto_awesome',
    'calendar_month', 'category', 'code', 'comment', 'database', 'design_services',
    'download', 'edit', 'feedback', 'flash_on', 'flight_takeoff', 'format_quote',
    'headphones', 'mail', 'map', 'movie', 'movie_edit', 'music_note', 'north_east',
    'notifications', 'palette', 'photo_camera', 'play_arrow', 'play_circle_filled',
    'psychology', 'route', 'shopping_bag', 'smart_display', 'star',
    'subdirectory_arrow_left', 'terminal', 'touch_app', 'travel_explore', 'videocam', 'web'
  ];

  window.SaraCmsMaterialIcons = ICONS;

  var CMS = window.CMS;
  var React = window.React;
  var register = CMS && (CMS.registerFieldType || CMS.registerWidget);

  if (!CMS || !React || !register) {
    return;
  }

  var h = React.createElement;

  class MaterialIconControl extends React.Component {
    constructor(props) {
      super(props);
      this.state = { filter: '' };
    }

    render() {
      var value = typeof this.props.value === 'string' ? this.props.value : '';
      var filter = this.state.filter.toLowerCase();
      var icons = ICONS.filter(function (icon) {
        return !filter || icon.indexOf(filter) !== -1;
      });

      return h('div', { className: 'sr-cms-icons' }, [
        h('input', {
          key: 'search',
          className: 'sr-cms-icons__search',
          type: 'search',
          placeholder: 'Search icons',
          value: this.state.filter,
          onChange: function (event) {
            this.setState({ filter: event.target.value });
          }.bind(this)
        }),
        h('div', { key: 'grid', className: 'sr-cms-icons__grid' }, icons.map(function (icon) {
          return h('button', {
            key: icon,
            type: 'button',
            className: 'sr-cms-icons__button' + (icon === value ? ' is-selected' : ''),
            onClick: function () {
              this.props.onChange(icon);
            }.bind(this),
            title: icon
          }, [
            h('span', { key: 'glyph', className: 'material-symbols-outlined', 'aria-hidden': 'true' }, icon),
            h('span', { key: 'name' }, icon)
          ]);
        }.bind(this)))
      ]);
    }
  }

  register.call(CMS, 'material_icon', MaterialIconControl);

  var style = document.createElement('style');
  style.textContent = [
    '.sr-cms-icons{display:grid;gap:12px}',
    '.sr-cms-icons__search{width:100%;box-sizing:border-box;border:1px solid #c7c7c7;border-radius:6px;padding:8px 10px;font:500 14px system-ui}',
    '.sr-cms-icons__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;max-height:320px;overflow:auto;padding:2px}',
    '.sr-cms-icons__button{display:grid;grid-template-columns:28px minmax(0,1fr);align-items:center;gap:7px;border:1px solid #d4d4d4;background:#fff;border-radius:7px;padding:8px;text-align:left;cursor:pointer;color:#111}',
    '.sr-cms-icons__button:hover{border-color:#111}',
    '.sr-cms-icons__button.is-selected{background:#111;color:#fff;border-color:#111}',
    '.sr-cms-icons__button .material-symbols-outlined{font-size:24px}',
    '.sr-cms-icons__button span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 12px system-ui}'
  ].join('\n');
  document.head.appendChild(style);
})();

/*
 * Fallback for Sveltia builds that do not expose the custom field API:
 * enhance native selects containing the curated icon options with a visual grid.
 */
(function () {
  var icons = window.SaraCmsMaterialIcons || [];
  if (!icons.length) return;

  function isIconSelect(select) {
    if (!select || select.dataset.srIconEnhanced === 'true') return false;
    var optionValues = Array.from(select.options || []).map(function (option) {
      return option.value;
    });
    return icons.some(function (icon) {
      return optionValues.indexOf(icon) !== -1;
    });
  }

  function setSelectValue(select, value) {
    select.value = value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function enhanceSelect(select) {
    if (!isIconSelect(select)) return;
    select.dataset.srIconEnhanced = 'true';

    var grid = document.createElement('div');
    grid.className = 'sr-cms-icons sr-cms-icons--native';

    Array.from(select.options).forEach(function (option) {
      if (icons.indexOf(option.value) === -1) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sr-cms-icons__button' + (option.selected ? ' is-selected' : '');
      button.title = option.value;
      button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">' + option.value + '</span><span>' + option.value + '</span>';
      button.addEventListener('click', function () {
        setSelectValue(select, option.value);
        grid.querySelectorAll('.sr-cms-icons__button').forEach(function (node) {
          node.classList.toggle('is-selected', node === button);
        });
      });
      grid.appendChild(button);
    });

    select.addEventListener('change', function () {
      grid.querySelectorAll('.sr-cms-icons__button').forEach(function (node) {
        node.classList.toggle('is-selected', node.title === select.value);
      });
    });

    select.insertAdjacentElement('afterend', grid);
  }

  function scan() {
    document.querySelectorAll('select').forEach(enhanceSelect);
  }

  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  scan();
})();
