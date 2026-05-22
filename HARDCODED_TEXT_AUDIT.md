# Hardcoded Text Content Audit - CMS Migration Checklist

## Overview
This document lists all hardcoded text content found in HTML files WITHOUT `data-cms-text` attributes. These should be migrated to CMS fields for dynamic management.

---

## 1. **index.html** (Root Homepage)
**File:** `/index.html`

### Navigation & Footer (Shared Across All Pages)
| Content | Location | Element Type | Suggested CMS Field |
|---------|----------|--------------|-------------------|
| Home | nav links | `<a>` text | `nav.home_label` |
| Projects | nav links | `<a>` text | `nav.projects_label` |
| About | nav links | `<a>` text | `nav.about_label` |
| Contact | nav links | `<a>` text | `nav.contact_label` |
| VIDEO EDITOR - CONTENT CREATOR | footer | `<p>` text | `footer.tagline` |

### Showreel Section
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| 🔧 Browser window title bar chrome | semantic | `showreel.window_chrome_label` |

---

## 2. **workspace.html**
**File:** `/workspace.html`

### Page Cards Navigation
| Card Label | Element Type | Suggested CMS Field |
|-----------|--------------|-------------------|
| Homepage | `<span>` in card | `workspace.card_1_label` |
| Portfolio Main | `<span>` in card | `workspace.card_2_label` |
| About | `<span>` in card | `workspace.card_3_label` |
| Contact | `<span>` in card | `workspace.card_4_label` |
| Social Media Project | `<span>` in card | `workspace.card_5_label` |
| Graphics | `<span>` in card | `workspace.card_6_label` |
| Video V1 | `<span>` in card | `workspace.card_7_label` |
| Video V2 | `<span>` in card | `workspace.card_8_label` |
| App V1 | `<span>` in card | `workspace.card_9_label` |
| App V2 | `<span>` in card | `workspace.card_10_label` |

### Header
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Sara Ruffini | `<p class="eyebrow">` | `workspace.header_name` |
| Portfolio Workspace | `<h1>` | `workspace.header_title` |
| Base di lavoro: pagine collegate e pronte per refactoring risorse + UI. | `<p class="subtitle">` | `workspace.header_subtitle` |

---

## 3. **pages/contact/index.html**
**File:** `/pages/contact/index.html`

### Form Elements
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Name | `<label>` text | `contact_form.label_name` |
| Email | `<label>` text | `contact_form.label_email` |
| Subject | `<label>` text | `contact_form.label_subject` |
| The Vision | `<label>` text | `contact_form.label_message` |
| Your name | form input placeholder | `contact_form.placeholder_name` |
| hello@you.com | form input placeholder | `contact_form.placeholder_email` |
| Video Editing Project | select option | `contact_form.subject_option_1` |
| Motion Graphics | select option | `contact_form.subject_option_2` |
| Collaboration | select option | `contact_form.subject_option_3` |
| Just saying hi! | select option | `contact_form.subject_option_4` |
| Tell me about your project... | textarea placeholder | `contact_form.placeholder_message` |
| Send It! | button text | `contact_form.button_text` |

### Camera/Equipment Labels
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Cam 01 | `<div>` text (absolute positioned) | `contact.camera_label` |
| REC | timecode display | `contact.rec_indicator` |
| 00:04:20 | timecode | `contact.timecode_display` |

---

## 4. **pages/about/index.html**
**File:** `/pages/about/index.html`

### Skills Marquee (Hardcoded repeating text)
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Adobe Premiere Pro | marquee span | `about.marquee_skill_1` |
| After Effects | marquee span | `about.marquee_skill_2` |
| Davinci Resolve | marquee span | `about.marquee_skill_3` |
| Sound Design | marquee span | `about.marquee_skill_4` |
| Color Grading | marquee span | `about.marquee_skill_5` |
| Motion Graphics | marquee span | `about.marquee_skill_6` |

### Timeline Section Labels (Without data-cms-text)
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| The Grind | section heading underline text | `about.timeline_section_title` |

### Timeline Project Badges/Annotations
Multiple timeline entries use these label structures without data-cms-text in some places. Review these entries:
- Years badges (2021 - Present, 2018 - 2019, 2019 - 2021) - **have data-cms-text ✓**
- Role titles (Senior Video Editor, Freelance Editor, Content Creator) - **have data-cms-text ✓**
- Company names (Neon Wave Studios, Self-Employed, Pixel Perfect Agency) - **have data-cms-text ✓**

---

## 5. **pages/graphics/index.html**
**File:** `/pages/graphics/index.html`

### Project Tags (Category Labels)
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Photography | tag badge | `graphics.category_tag_1` |
| Editorial | tag badge | `graphics.category_tag_2` |
| 2024 | tag badge | `graphics.year_tag` |

### Image Captions and Annotations
| Content | Location | Element Type | Suggested CMS Field |
|---------|----------|--------------|-------------------|
| #summer_vibe_01 | handwritten on polaroid | `<div>` with font-handwriting | `graphics.polaroid_caption` |
| NEW DROP | badge circle | `<span>` text | `graphics.new_drop_badge` |
| THE CITY IS YOURS | gradient overlay text | `<h3>` in div | `graphics.hero_image_text` |

### Team Section
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| +2 | team count badge | `graphics.team_count_badge` |
| Creative Team | label | `graphics.team_label` |

---

## 6. **pages/app-v1/index.html**
**File:** `/pages/app-v1/index.html`

### UI Element Labels and Annotations
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| the palette... | handwritten annotation (font-hand class) | `app_v1.palette_label` |
| #13ECEC | color hex code in hover tooltip | `app_v1.color_1_code` |
| #102222 | color hex code in hover tooltip | `app_v1.color_2_code` |
| #F6F8F8 | color hex code in hover tooltip | `app_v1.color_3_code` |
| #FF5E5E | color hex code in hover tooltip | `app_v1.color_4_code` |
| Main Display | spec label | `app_v1.typography_spec_label` |
| Space Grotesk | font name spec | `app_v1.typography_font_name` |
| Aa | typography sample | `app_v1.typography_sample` |
| ABCDEFGHIJKLMNOPQRSTUVWXYZ | character set (uppercase) | `app_v1.typography_uppercase` |
| abcdefghijklmnopqrstuvwxyz | character set (lowercase) | `app_v1.typography_lowercase` |
| 0123456789 | character set (numbers) | `app_v1.typography_numbers` |
| user profile v1.2 | handwritten annotation | `app_v1.mockup_annotation` |
| Design System | dashboard item 1 title | `app_v1.sample_item_1_title` |
| Updated 2h ago | dashboard item 1 time | `app_v1.sample_item_1_time` |
| User Flows | dashboard item 2 title | `app_v1.sample_item_2_title` |
| Pending review | dashboard item 2 status | `app_v1.sample_item_2_status` |
| hello, creator. | large heading on phone mockup | `app_v1.phone_hero_text` |
| Active Project | badge label | `app_v1.active_project_badge` |
| Mobile App V2 | active project name | `app_v1.active_project_name` |
| New Entry | button text | `app_v1.new_entry_button` |

### Step Flow Annotations
| Content | Location | Element Type | Suggested CMS Field |
|---------|----------|--------------|-------------------|
| 01. Homepage | flow step label | badge | `app_v1.flow_step_1_title` |
| User lands on dashboard. System fetches recent projects via GraphQL. | step description | `<p>` | `app_v1.flow_step_1_desc` |
| Authenticated | status badge | `<div>` | `app_v1.flow_step_1_status` |
| entry point! | handwritten annotation | font-hand | `app_v1.flow_annotation_1` |
| 02. Selection | flow step label | badge | `app_v1.flow_step_2_title` |
| User selects active project. State updates globally via Context API. | step description | `<p>` | `app_v1.flow_step_2_desc` |
| Interaction | status badge | `<div>` | `app_v1.flow_step_2_status` |
| click triggers load... | handwritten annotation | font-hand | `app_v1.flow_annotation_2` |
| 03. The Editor | flow step label | badge | `app_v1.flow_step_3_title` |
| Canvas renders via WebGL. Real-time collaboration sockets open. | step description | `<p>` | `app_v1.flow_step_3_desc` |
| Heavy Load | status badge | `<div>` | `app_v1.flow_step_3_status` |
| main workspace | handwritten annotation | font-hand | `app_v1.flow_annotation_3` |
| 04. Checkout | flow step label | badge | `app_v1.flow_step_4_title` |
| Export assets. Payment processing via Stripe API. Delivery. | step description | `<p>` | `app_v1.flow_step_4_desc` |
| Secure | status badge | `<div>` | `app_v1.flow_step_4_status` |

---

## 7. **pages/app-v2/index.html**
**File:** `/pages/app-v2/index.html`

### UX Narrative Flow Annotations
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Entry Point | handwritten annotation (font-hand class) | `app_v2.flow_entry_label` |
| User lands on splash. Check for existing session token. | annotation description | `app_v2.flow_entry_desc` |
| If Authenticated... | handwritten annotation | `app_v2.flow_conditional_label` |
| Validate credentials against API. If 200 OK, store JWT in secure storage. | annotation description | `app_v2.flow_conditional_desc` |
| Dashboard Init | handwritten annotation | `app_v2.flow_dashboard_label` |
| Fetch user profile & recent projects in parallel. Skeleton load state active. | annotation description | `app_v2.flow_dashboard_desc` |
| follow the flow | handwritten annotation | `app_v2.flow_cta_label` |
| welcome aboard. | phone mockup heading | `app_v2.onboarding_heading` |
| Your digital creative studio awaits. | phone mockup subheading | `app_v2.onboarding_subtitle` |
| Sign In | button text | `app_v2.button_signin` |
| Create Account | button text | `app_v2.button_create_account` |
| verify identity | phone mockup heading | `app_v2.auth_heading` |
| Email | form label | `app_v2.auth_label_email` |
| Password | form label | `app_v2.auth_label_password` |
| user@example.com | form placeholder | `app_v2.auth_placeholder_email` |
| •••••••••••• | password indicator | `app_v2.auth_password_dots` |
| Authenticate | button text | `app_v2.button_authenticate` |
| Success Redirect | flow state badge | `app_v2.flow_state_success` |
| Action: Tap Sign In | flow annotation/action hint | `app_v2.flow_action_signin` |
| hello, alex. | dashboard greeting | `app_v2.dashboard_greeting` |
| Mobile App V2 | active project card title | `app_v2.dashboard_active_project_title` |
| Active Project | badge label | `app_v2.dashboard_active_badge` |
| Recent Activity | section heading | `app_v2.dashboard_activity_heading` |
| Updated wireframes | activity item 1 title | `app_v2.activity_item_1_title` |
| 2 mins ago | activity item 1 time | `app_v2.activity_item_1_time` |
| New comment | activity item 2 title | `app_v2.activity_item_2_title` |
| 1 hour ago | activity item 2 time | `app_v2.activity_item_2_time` |
| End of User Flow | flow completion label | `app_v2.flow_completion_label` |
| more videos → | handwritten annotation | `video_v2.annotation_more` |

---

## 8. **pages/weber-grillinspiration/index.html**
**File:** `/pages/weber-grillinspiration/index.html`

### Project Spec Box
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Engagement Specs | spec box heading | `video_v1.specs_heading` |
| Position | spec label | `video_v1.spec_role_label` |
| Senior Video Editor | spec value | `video_v1.spec_role_value` |
| Duration | spec label | `video_v1.spec_duration_label` |
| 24 Months (Contract) | spec value | `video_v1.spec_duration_value` |
| Key Deliverables | spec label | `video_v1.spec_deliverables_label` |
| 30+ Assets, 2 Campaigns | spec value | `video_v1.spec_deliverables_value` |
| Key Projects | annotation label (handwritten style) | `video_v1.annotation_projects` |

### Project Breakdown Labels
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Art Direction | tag badge | `video_v1.tag_1` |
| Motion Design | tag badge | `video_v1.tag_2` |
| Video Edit | tag badge | `video_v1.tag_3` |
| 01:45 / Collaboration Reel | timecode label | `video_v1.video_timecode` |
| 2021-2023 Highlights | timeline label | `video_v1.timeline_label` |
| Volume 100% | volume indicator | `video_v1.volume_label` |

### Featured/Section Projects
| Content | Location | Element Type | Suggested CMS Field |
|---------|----------|--------------|-------------------|
| Product Launch | yellow badge | `video_v1.section_1_badge` |
| The Apex Series Reveal | project title | `video_v1.section_1_title` |
| A high-energy 60s spot for the flagship product. I handled the offline edit and coordinated with the VFX team for the HUD overlays. The goal was speed and precision. | description | `video_v1.section_1_desc` |
| Social | tag badge | `video_v1.section_1_tag_1` |
| Web | tag badge | `video_v1.section_1_tag_2` |
| Employer Brand | teal badge | `video_v1.section_2_badge` |
| Life at Vertex | project title | `video_v1.section_2_title` |
| A documentary-style recruiting film. Shot over two weeks at headquarters. My role involved storyboarding the narrative arc to highlight company values without feeling corporate. | description | `video_v1.section_2_desc` |
| Internal | tag badge | `video_v1.section_2_tag_1` |
| Youtube | tag badge | `video_v1.section_2_tag_2` |
| Award winner | handwritten annotation | `video_v1.annotation_award` |
| Event Opener | pink badge | `video_v1.section_3_badge` |
| Keynote 2022 Opener | project title | `video_v1.section_3_title` |
| The hype reel for the annual developer conference. Fast-paced, kinetic typography mixed with product renders. Synced tightly to a custom audio track. | description | `video_v1.section_3_desc` |
| Live Event | tag badge | `video_v1.section_3_tag_1` |
| Redefining the brand through motion, one frame at a time. | footer tagline (italic serif) | `video_v1.footer_tagline` |

---

## 9. **pages/video-v2/index.html**
**File:** `/pages/video-v2/index.html`

### Project Badge & Status
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Spring Campaign '24 | badge text | `video_v2.hero_badge` |
| 02:15 / Main Spot | hero timecode | `video_v2.hero_timecode` |

### Sidebar Information
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| in-house productions | section title | `video_v2.sidebar_title` |
| A collection of high-energy promotional content produced for Apex Athletics over a two-year partnership. Focus on dynamic motion, bold typography, and rhythmic editing. | description | `video_v2.sidebar_desc` |
| Role | spec label | `video_v2.sidebar_role_label` |
| Senior Editor | spec value | `video_v2.sidebar_role_value` |
| Deliverables | spec label | `video_v2.sidebar_deliverables_label` |
| TV Commercials | deliverable item 1 | `video_v2.deliverable_1` |
| Social Shorts | deliverable item 2 | `video_v2.deliverable_2` |
| Product Launches | deliverable item 3 | `video_v2.deliverable_3` |
| Athlete Profiles | deliverable item 4 | `video_v2.deliverable_4` |
| Tools | spec label | `video_v2.sidebar_tools_label` |
| Premiere Pro, After Effects, DaVinci Resolve | tools value | `video_v2.sidebar_tools_value` |
| more videos → | handwritten annotation | `video_v2.annotation_more` |

### Video Grid Items
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Social Teaser #1 | video card badge | `video_v2.card_1_badge` |
| 15s • Instagram Reels | video specs | `video_v2.card_1_specs` |
| Product Reveal | video card badge | `video_v2.card_2_badge` |
| 45s • Website Hero | video specs | `video_v2.card_2_specs` |
| DOCU-STYLE | video card badge (rotated) | `video_v2.card_3_badge` |
| "The Long Run" | video title | `video_v2.card_3_title` |
| 03:20 • YouTube | video specs | `video_v2.card_3_specs` |
| Summer Events | video card badge | `video_v2.card_4_badge` |
| 60s • Internal Recap | video specs | `video_v2.card_4_specs` |
| fast cuts! | handwritten annotation (font-handwriting) | `video_v2.annotation_cuts` |
| More Coming Soon | placeholder circle text | `video_v2.more_coming_label` |

---

## 10. **pages/socialmedia-portfolio/index.html**
**File:** `/pages/socialmedia-portfolio/index.html`

### Handwritten Annotations (font-hand class elements) - CRITICAL
These are the most important to migrate as they're design-specific labels:

| Content | Location | Element Type | Suggested CMS Field |
|---------|----------|--------------|-------------------|
| scroll | annotation above phones | `<p>` with font-hand | `socmed.annotation_scroll` |
| organic production videoleap app | annotation beside phone 1 | `<p>` with font-hand | `socmed.annotation_phone1` |
| high retention hooks | annotation beside phone 2 | `<p>` with font-hand | `socmed.annotation_phone2` |
| capcut edits & trends | annotation beside phone 3 | `<p>` with font-hand | `socmed.annotation_phone3` |
| split testing different hooks | annotation beside phone 4 | `<p>` with font-hand | `socmed.annotation_phone4` |

### Technical Specs Tags
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| #UGC Content | tag badge | `socmed.tag_1` |
| Shot on iPhone | tag badge | `socmed.tag_2` |
| VideoLeap App | tag badge | `socmed.tag_3` |

### Phone Caption
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| One more format test for stronger retention #social #ugc | phone mockup caption | `socmed.phone_caption` |
| View more on Instagram | link text | `socmed.view_more_link` |

---

## 11. **pages/portfolio-main/code.html**
**File:** `/pages/portfolio-main/code.html`

### Project Cards - Badges (Some Hardcoded)
Review all project card badges - these appear to already have `data-cms-text` attributes based on structure like `data-cms-text="card_1.badge"`, so they may be acceptable.

### Text Annotations
| Content | Element Type | Suggested CMS Field |
|---------|--------------|-------------------|
| Curated for impact. | serif italic annotation | `portfolio.tagline_annotation` |

---

## Priority Implementation Order

### TIER 1 - CRITICAL (Site-wide, appears 10+ times)
1. **Navigation links** - Home, Projects, About, Contact
2. **Footer content** - tagline, links, contact info

### TIER 2 - HIGH (Page-specific repeated elements)
1. Workspace page card labels (10 cards)
2. Contact form labels and placeholders (8 fields)
3. Skills marquee items (6 skills)
4. All handwritten annotations with `font-hand` class

### TIER 3 - MEDIUM (Project details, important but single-use)
1. Project specification boxes (Engagement Specs, etc.)
2. Project breakdown tags
3. Flow diagram annotations
4. Camera/equipment labels

### TIER 4 - LOW (Nice-to-have, decorative text)
1. Color hex codes display
2. Typography specs
3. Some badge variants
4. Timecode labels

---

## Related Content JSON Files

Cross-reference with:
- [content/pages/about.json](content/pages/about.json)
- [content/pages/homepage.json](content/pages/homepage.json)
- [content/pages/portfolio-main.json](content/pages/portfolio-main.json)
- [content/pages/app-v1.json](content/pages/app-v1.json)
- [content/pages/app-v2.json](content/pages/app-v2.json)
- [content/pages/graphics.json](content/pages/graphics.json)
- [content/pages/weber-grillinspiration.json](content/pages/weber-grillinspiration.json)
- [content/pages/video-v2.json](content/pages/video-v2.json)
- [content/pages/socialmedia-portfolio.json](content/pages/socialmedia-portfolio.json)

These JSON files should be updated with the new field definitions as CMS fields are added.

---

## Notes for Development

- **Navigation/Footer Duplication**: Site-wide nav and footer text is duplicated across all pages. Consider creating a shared `navigation` and `footer` object in CMS and referencing it across all pages.
- **Font-hand Elements**: Annotations with `font-hand` or `font-handwriting` class are usually design-specific labels/tooltips - these should be migrated to ensure design consistency across variations.
- **Spec Boxes**: Project specification boxes follow a pattern - could create a reusable CMS component for "project_specs" with fields: role, duration, deliverables.
- **Badge System**: Project badges (colored labels) exist across multiple pages - consider creating a "badge_type" CMS field for consistency.
- **Phone Mockup Text**: The phone mockup elements (sign in, auth flows, dashboard text) could be moved to a separate "app_ui_text" CMS section for easier A/B testing.
