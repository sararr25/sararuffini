# sararuffini

Portfolio site with Decap CMS and automation scripts for SEO metadata, media batching, and image optimization.

## Setup

```bash
npm install
```

## New Automation Commands

### Bulk media upload (20+ files in one shot)

```bash
npm run media:bulk-upload -- --source /path/to/folder/with/media
```

Optional flags:

```bash
--quality 80      # webp quality for generated variants (default 80)
--no-optimize     # skip auto image optimization after import
```

Uploaded files are copied to `assets/media/uploads/YYYY-MM-DD/` with safe filenames.

### Image optimization pipeline

```bash
npm run optimize:images
```

This scans `assets/media`, generates responsive WebP variants (`thumb`, `medium`, `full`) into `assets/media/optimized`, and writes `assets/media/optimized/manifest.json`.

Custom input/output:

```bash
npm run optimize:images -- --input assets/media/uploads --output assets/media/optimized --quality 80
```

### Template presets cloning

```bash
npm run template:create -- --template video --output content/pages/video-v3.json
npm run template:create -- --template graphics --output content/pages/graphics-v2.json
npm run template:create -- --template app --output content/pages/app-v3.json
npm run template:create -- --template web --output content/pages/web-v1.json
```

Use `--force` to overwrite an existing target file.

### Rename a page slug (folder + JSON + references)

```bash
npm run page:rename-slug -- --old-slug socialmedia-portfolio --new-slug social-media-pro --page-name "Social Media Pro"
```

Dry run preview:

```bash
npm run page:rename-slug -- --old-slug socialmedia-portfolio --new-slug social-media-pro --dry-run
```

This command updates path references across project text files, renames:
- `pages/<old-slug>/` to `pages/<new-slug>/`
- `content/pages/<old-slug>.json` to `content/pages/<new-slug>.json`

Then it writes `page_slug` (and optionally `page_name`) in the renamed JSON.

## SEO Auto Meta Tags

Page metadata is now injected automatically by `scripts/cms-page-loader.js`.

Priority order:
1. `seo` object in the page JSON (`seo_title`, `seo_description`, `seo_image`)
2. Root-level SEO fields in page JSON (legacy fallback)
3. Global defaults in `content/global-seo.json`

Injected tags include:
- `description`
- `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`

## Shared Site Structure

To avoid editing the same UI in many files, shared public-site UI is centralized here:

- `content/global.json`: brand name, navbar labels/links, footer contact info
- `styles/shared-nav-footer.css`: the single visual style source for navbar and footer
- `scripts/shared-site-chrome.js`: renders navbar and footer in public pages
- `styles/shared-project-pager.css`: shared previous/next project pager styling
- `scripts/shared-project-pager.js`: renders project pager from the current page JSON

### What to edit for common changes

- Change navbar/footer text or links: `content/global.json`
- Change navbar/footer font, spacing, colors, hover states: `styles/shared-nav-footer.css`
- Change shared project pager labels/titles/links for a page: `content/pages/<slug>.json`
- Change shared project pager layout/style: `styles/shared-project-pager.css`

### Public page convention

Public pages under `pages/` should prefer placeholders over duplicated markup:

- Navbar: `<nav class="shared-site-nav" data-shared-chrome="nav"></nav>`
- Footer: `<footer class="shared-site-footer" data-shared-chrome="footer"></footer>`
- Project pager: `<section class="shared-project-pager" data-shared-project-pager></section>`

This keeps future edits local instead of spread across many HTML files.
