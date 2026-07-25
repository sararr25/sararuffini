---
name: Editorial Scrapbook
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3c4a46'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6b7a76'
  outline-variant: '#bacac5'
  surface-tint: '#006b5f'
  primary: '#006b5f'
  on-primary: '#ffffff'
  primary-container: '#3bdec8'
  on-primary-container: '#005e53'
  inverse-primary: '#39ddc7'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#605e58'
  on-tertiary: '#ffffff'
  tertiary-container: '#cac7bf'
  on-tertiary-container: '#54534c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#60fae3'
  primary-fixed-dim: '#39ddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e6e2d9'
  tertiary-fixed-dim: '#c9c6be'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484741'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  paper-bg: '#FDF9F0'
  ink: '#111111'
  accent-cyan: '#3BDEC8'
  accent-yellow: '#FFEB3B'
  accent-pink: '#FF69B4'
  accent-orange: '#FF6B6B'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  sticker-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '800'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 5vw
  gutter: 2rem
  section-v: 8rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
---

## Brand & Style

The design system is an expressive, editorial-first framework that blends the tactile charm of a physical scrapbook with the sharp, high-contrast energy of Neo-Brutalism. It is designed to feel "handmade" but technically precise, catering to a creative, high-energy audience that values personality over corporate polish.

The visual language is defined by a "collage" philosophy: elements are layered as if physically stuck onto a surface, utilizing overlapping components, irregular rotations, and "sticker" badges. The aesthetic is intentionally raw, featuring thick ink-like borders, hard offset shadows, and vibrant cyan highlights against a warm, paper-like background. 

Key attributes include:
- **Handmade Tactility:** Use of paper-cut card styles and scribble-style underlines.
- **Neo-Brutalist Contrast:** Aggressive black borders and 0-blur shadows.
- **Eclectic Energy:** A mix of technical "grotesk" typography and playful, organic accents.

## Colors

The palette centers on a high-contrast relationship between **Ink (#111111)** and **Paper (#FDF9F0)**. The primary accent is a vibrant **Cyan (#3BDEC8)**, used sparingly for critical interactive elements and rhythmic highlights.

A secondary set of "sticker" colors—Yellow, Pink, and Orange—are used exclusively for decorative badges, labels, and "scribble" annotations. These should never be used for primary UI surfaces, but rather as small, high-chroma pops of color that break the monochrome base.

- **Background:** Always use the warm off-white for main surfaces to maintain the "editorial paper" feel.
- **Highlights:** Apply the Cyan accent to emphasized words in hero text and primary action hover states.

## Typography

The typography strategy pairs the technical, geometric personality of **Space Grotesk** for headlines and labels with the neutral readability of **Inter** for body copy. 

- **Headlines:** Should be bold and high-impact. For hero sections, use tight tracking and uppercase styling to evoke a tabloid or editorial poster aesthetic.
- **Interactions:** Use Space Grotesk in all-caps for buttons, chips, and navigation to maintain a "structured" feel amidst the more organic layout elements.
- **Decorative Accents:** Handwritten scripts (like Permanent Marker or Rock Salt) should be used as "annotations" rather than structural text—think of them as margin notes.

## Layout & Spacing

This design system uses a **Fluid Grid** with wide horizontal margins to create a spacious, gallery-like feel. While the underlying structure is organized, components should frequently break the grid through "sticker" placements and slight rotations (1-3 degrees).

- **Sectional Rhythm:** Use generous vertical padding between sections (8rem+) to emphasize each content block as a standalone "exhibit."
- **Overlays:** Content should feel layered. Small "sticker" badges should overlap the corners of images or cards by 10-15px to break the rigid boundaries of the layout.
- **Responsive Reflow:** On mobile, high-density decorative elements (like side-stickers) should transition to a centered stack or be hidden to preserve legibility.

## Elevation & Depth

Depth is conveyed through **Bold Borders** and **Hard Shadows**, rejecting soft blurs and gradients in favor of a flat, layered look.

- **The "Retro Shadow":** UI cards and buttons utilize a hard, 0-blur offset shadow (e.g., `4px 4px 0px 0px #111111`).
- **Interactive Depth:** On hover or active states, the shadow should "compress" (e.g., from 4px to 2px) and the element should translate 2px in the direction of the shadow to simulate a physical button being pressed.
- **Stroke Weights:** Use a consistent 2px black border for standard cards and a 4px border for hero-level "window" containers or primary buttons.

## Shapes

The shape language is primarily **Soft (0.25rem - 0.75rem)**, providing enough rounding to feel approachable without losing the "paper-cut" sharpness. 

- **Exceptions:** Use pill-shaped (rounded-full) geometry exclusively for **Stickers** and **Badges** to differentiate them from structural content cards. 
- **The "Torn" Edge:** For special image containers, use irregular mask paths to simulate torn paper, adding to the handmade scrapbook aesthetic.

## Components

### Buttons & CTAs
Buttons are high-contrast rectangles with 2px borders and hard shadows. The label is always uppercase Space Grotesk. The primary CTA uses the Cyan fill, while secondary buttons use the Paper-white background.

### Sticker Badges
Stickers are pill-shaped chips with bright fill colors (Pink/Yellow/Orange) and heavy black borders. They are often placed with a slight rotation and used for "New," "Featured," or category tags.

### Paper-Cut Cards
Cards feature a white background, sharp black borders, and a deep hard shadow. They should contain a media frame (image/video) that uses `object-cover`, followed by a metadata section below a thin horizontal divider line.

### Scribble Underlines
Key emphasis words in headlines should be styled with a "scribble" underline—a SVG path that mimics a hand-drawn marker stroke in Cyan or Yellow.

### Windows (PROJECT.EXE)
Special project showcases use a "Windows 95" style container with a title bar, a "close" icon, and a hard shadow. This reinforces the retro-tech editiorial energy.

### Checkboxes & Inputs
Input fields are flat with a 2px border. On focus, the border color remains black but the hard shadow thickness doubles to indicate activity. Checkboxes use a bold 'X' mark rather than a tick.