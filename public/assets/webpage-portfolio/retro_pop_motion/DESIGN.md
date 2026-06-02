---
name: Retro-Pop Motion
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#3a4a44'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#6a7b74'
  outline-variant: '#b9cbc3'
  surface-tint: '#006b57'
  primary: '#006b57'
  on-primary: '#ffffff'
  primary-container: '#00ffd1'
  on-primary-container: '#00725c'
  inverse-primary: '#00e0b7'
  secondary: '#9b4500'
  on-secondary: '#ffffff'
  secondary-container: '#fc8a40'
  on-secondary-container: '#672c00'
  tertiary: '#5e5e5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#e4e2de'
  on-tertiary-container: '#646461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#15ffd1'
  primary-fixed-dim: '#00e0b7'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005141'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68d'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#763300'
  tertiary-fixed: '#e4e2de'
  tertiary-fixed-dim: '#c8c6c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  h1:
    fontFamily: Epilogue
    fontSize: 84px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  h2:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h3:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built for a high-energy video editor, merging the tactile nostalgia of a physical scrapbook with the sharp, digital punch of modern pop art. It draws heavily from **Neo-Brutalism**—characterized by thick black borders, un-rendered shadows, and high-contrast color palettes—while softening the "raw" edges with rounded corners and hand-drawn flourishes. 

The aesthetic is professional yet eccentric, signaling creativity and technical boldness. It prioritizes a "sticker" effect where elements appear layered and physically stuck onto the page, creating a sense of depth through hard offsets rather than soft blurs.

## Colors

The palette is anchored by a warm, organic **Signature Cream** background that prevents the high-contrast elements from feeling sterile. 

- **Vibrant Teal (#00FFD1):** Used for primary actions, success states, and key highlights. It should feel electric against the cream.
- **Orange (#FF8C42):** Used for secondary accents, "New" tags, and callouts. It provides a warm, retro counterpoint to the teal.
- **Thick Black (#000000):** The structural backbone. Used for all outlines, heavy shadows, and typography.
- **Signature Cream (#FDFBF7):** The canvas. All surfaces default to this color to maintain the "paper" feel.

## Typography

The typography strategy relies on extreme weight contrast. 

**Headlines** use **Epilogue** at its heaviest weight (900). This provides the "Display" punch required for the retro-pop look. Headlines should often be paired with handwritten-style SVG underlines or "squiggle" decorations to break the rigid digital grid.

**Body Text** uses **Be Vietnam Pro**. It is contemporary and clean, ensuring that long-form CV descriptions remain legible even amidst the vibrant surrounding UI.

**Labels and Metadata** utilize **Space Grotesk**. Its technical, slightly quirky geometric construction reflects the "video editor" persona—precise yet creative.

## Layout & Spacing

This design system uses a **fixed grid** model (typically 12 columns for desktop) but encourages elements to "break" the grid slightly through offsets. 

The spacing rhythm is based on an 8px scale. White space is used intentionally to separate "clusters" of content. Content should feel like it is composed of modular cards and blocks rather than a continuous flowing document. 

Key layout rule: Use generous margins around the main container to emphasize the "object-on-a-table" look of the portfolio.

## Elevation & Depth

Depth in this system is strictly **2D-Physical**. Instead of using Z-axis blurs or soft ambient shadows, depth is achieved through:

1.  **Hard Offsets:** Elements feature a solid black shadow (100% opacity) offset by 4px or 8px to the bottom-right.
2.  **Sticker Layers:** Elements can be slightly rotated (1-2 degrees) to mimic the imperfect placement of stickers in a scrapbook.
3.  **Outlines:** Every interactive or container element must have a 3px or 4px solid black border.
4.  **Hand-drawn accents:** Use SVG "squiggles," "circles," and "arrows" to point at key information, creating a layer that feels like it was drawn on top of the finished layout.

## Shapes

While the borders are "brutalist," the corners are **Rounded**. This prevents the design from feeling too aggressive or "web 1.0." 

- Standard boxes and cards use a 0.5rem radius.
- Large feature containers or "hero" sections use a 1.5rem radius.
- Decorative elements, like "tags" or "pills," should be fully rounded (pill-shaped).

## Components

### Buttons
Buttons are the primary interactive element. They must have a 3px black border and a "hard shadow" offset. On hover, the button should move 2px down and to the right, "pressing" into its shadow.
- **Primary:** Teal background, black text.
- **Secondary:** Orange background, black text.

### Cards
Cards are the "containers" for video projects and CV entries. They feature the Signature Cream background, a 3px black border, and a hard black shadow. Video thumbnails within cards should have a 0.5rem corner radius to match the container.

### Chips/Tags
Used for "Software Used" or "Skills." These are pill-shaped with a 2px black border. Use a mix of Teal and Orange to categorize different skill types (e.g., Creative vs. Technical).

### Handwritten Flourishes
A special component category. These are non-interactive SVG paths (underlines, arrows, "X" marks) used to highlight specific words in a headline or to connect two related pieces of information in a CV timeline.

### Input Fields
Inputs follow the card style: Cream background, 3px black border. When focused, the border color remains black, but the "hard shadow" changes to the Teal color for a vibrant feedback loop.