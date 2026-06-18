# Admin Extensions

Custom Sveltia CMS helpers for Sara Ruffini's portfolio admin.

- `image-crop-widget.js` enhances built-in crop object fields used by `*_crop_position` fields. It adds an Edit crop modal beside each matching image, supports drag, wheel/pinch zoom, and stores `{ x, y, zoom }` without changing the schema. Sveltia CMS does not currently implement `CMS.registerWidget`/`CMS.registerFieldType`, so this is a DOM enhancement rather than a registered custom field type.
- `material-icon-picker.js` enhances curated icon select fields such as `meta_chips[].icon`, `tech_flow_*_icon`, and `more_about_cards[].icon` with a visual Material Symbols grid. It also attempts `CMS.registerFieldType('material_icon', ...)` when a compatible CMS global exists.
- `inline-icon-badge.js` adds an insert helper for the About page `intro_paragraph_1_html` and `intro_paragraph_2_html` fields. It also attempts `CMS.registerEditorComponent('inline-icon-badge', ...)` when a compatible CMS global exists, but the textarea helper is the reliable path for the current runtime.
- `slug-sync.js` keeps the existing page-name-to-slug helper out of `admin/index.html`.

The frontend loaders still accept the old crop string format (`50,50,100,0`) so existing saved content remains backward compatible.
