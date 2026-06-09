# Sara Ruffini Site Design System

This document captures the current visual language of the site as it exists now in the workspace. It is meant to be a practical reference for editing pages, CMS content, and shared UI.

## Brand Character

- Editorial, playful, and handmade.
- A mix of retro scrapbook energy, neo-brutalist contrast, and clean portfolio presentation.
- The tone is confident and personal, but not overly polished or corporate.

## Core Palette

The site uses a warm off-white base with strong black ink and a bright cyan primary accent.

- Background light: `#FDF9F0`
- Background dark: `#18181b`
- Text / ink: `#111111`
- Primary accent: `#3BDEC8`
- Secondary dark ink: `#1a1a1a`
- Card light: `#ffffff`
- Card dark: `#1E1E1E`

Supporting accents used across stickers, labels, and highlights:

- Yellow: `#FFEB3B`
- Pink: `#FF69B4`
- Orange: `#FF6B6B`
- Green: `#7FFF00`
- Purple: `#D8BFD8`
- Teal: `#008080`
- Teal bright: `#20B2AA`
- Red accent: `#FF3333`

## Typography

Current site typography is driven mostly by Inter and Space Grotesk, with expressive display moments on selected pages.

- Body: Inter
- Shared footer headings: Space Grotesk
- Decorative / handwritten accents: Permanent Marker, Rock Salt, and occasional serif styling
- Large hero moments: bold uppercase, tight tracking, high contrast

Recommended usage:

- Use bold uppercase headlines for featured portfolio sections.
- Use clean sans-serif body text for captions, metadata, and navigation.
- Reserve script or marker styles for short emphasis only.

## Layout Principles

- Wide desktop canvas with centered max-width sections.
- Strong use of negative space between sections.
- Many pages use off-grid, overlapping compositions rather than rigid symmetry.
- Cards often rely on a paper-cut or sticker look with thick borders and offset shadows.
- Masonry layouts are common for project grids.

## Shared Shell

The site chrome is intentionally minimal and consistent:

- Sticky top navigation with a cream background.
- Black divider line under the nav.
- Footer on a full black background with white text and cyan hover accents.
- Navigation hover states use scribble-style underlines.

## Component Patterns

### Hero Sections

- Large uppercase headline.
- One key word or phrase is highlighted in cyan or another accent.
- Decorative underline or scribble stroke under the emphasized word.
- Supporting copy is compact and editorial.

### Project Cards

- White or cream card bodies with black borders and hard shadows.
- Image frame first, then title and metadata below.
- Sticker-like badges sit outside or above cards, not inside the image clipping area.
- Slight rotations are used to create a collage feel.

### Stickers and Labels

- Badges are bold, uppercase, and highly visible.
- Common treatment: black border, strong drop shadow, bright fill color.
- Labels often overlap adjacent space by design, but should never clip critical text.

### Media Frames

- Images usually use `object-cover` and a fixed frame height or aspect ratio.
- Some sections use `rounded-lg`, `rounded-2xl`, or fully circular treatments.
- Overflow clipping is used only around media, not around labels or captions.

### Callouts and CTAs

- CTAs are simple, bold, and high contrast.
- Accent colors are used to draw attention without adding visual noise.
- Motion on hover is subtle: translate, shadow shift, underline reveal.

## Motion

The site motion language is playful but controlled.

- Floating or drifting elements are used in hero/sticker compositions.
- Hover states often shift cards by a few pixels and tighten or deepen shadows.
- Scribble or drawn line effects are used for emphasis.
- Marquee text is used for rhythmic, repeated messaging.

Keep motion light and purposeful. The site should feel alive, not busy.

## Spacing And Shape

- Outer sections generally use generous vertical rhythm.
- Cards often have thick borders and hard shadows rather than soft blur.
- Rounded corners vary by component:
  - Small editorial cards: subtle rounding
  - Device mockups and special containers: larger rounding
  - Sticker labels: often fully rounded or pill-like

## Content Style

- Short, direct, visual copy works best.
- Metadata should be concise: project type, year, or role.
- Titles should read like portfolio case studies or editorial headlines.
- Avoid generic corporate phrasing.

## Practical Editing Rules

- Do not clip labels or badges inside image frames.
- Keep media clipping inside the media container only.
- When using stickers or tags, give them their own space above or outside the main card content.
- Use strong contrast between background, card, and text.
- Prefer one strong accent per section instead of many competing accents.

## Main Visual Tokens In Use

- Background: warm cream
- Ink: black
- Accent: cyan
- Secondary accents: yellow, pink, orange, green, purple
- Borders: 2px to 5px black borders depending on component weight
- Shadows: hard offset shadows, not soft ambient shadows

## Overall Summary

The site’s current direction is best described as editorial collage with neo-brutalist edges: playful, tactile, handmade, and high-contrast, with enough structure to keep it readable and portfolio-grade.