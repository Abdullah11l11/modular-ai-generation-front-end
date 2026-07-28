# MGF — Modular Generation Framework Design Specification

## 1. Concept & Vision

**MGF** is a template marketplace and editor built on a **three-layer architecture** (structure/style/content separation). The interface embodies a professional, tool-like aesthetic — clean without being sterile, with deliberate use of color accents and thoughtful micro-interactions. The overall feel is "design tool meets developer playground": structured enough for serious work, but approachable for creators at any level.

The design philosophy prioritizes **clarity over decoration** — every UI element serves a function. The cyan accent provides consistent visual anchoring across both light and dark modes.

---

## 2. Design Language

### 2.1 Aesthetic Direction
Inspired by modern SaaS design tools (Linear, Raycast, Vercel). Clean geometric forms, subtle borders, restrained color use with one strong accent. Professional but not cold.

### 2.2 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bg` | `#e8e8e8` | `#212930` | Page background |
| `--sur` | `#f1f1f1` | `#141413` | Surface/cards |
| `--sur2` | `#EFEDE8` | `#1A1A18` | Elevated surfaces |
| `--sur3` | `#E8E6E1` | `#222220` | Darkest surface |
| `--bor` | `#43a7ff` | `#91deff` | Primary border (blue) |
| `--bor2` | `#C8C5BE` | `#383835` | Secondary border |
| `--t1` | `#111110` | `#EDEAE4` | Primary text |
| `--t2` | `#5A5855` | `#9A9790` | Secondary text |
| `--t3` | `#9A9790` | `#5A5855` | Tertiary/muted text |
| `--acc` | `#0B1F3A` | `#E8E5DF` | Avatar background |
| `--cy` | `#09B8C4` | `#09B8C4` | Cyan accent (constant) |
| `--cy-d` | `rgba(9,184,196,.09)` | same | Cyan background tint |
| `--cy-b` | `rgba(9,184,196,.28)` | same | Cyan border tint |

**Note:** Dark mode `.dark` class redefines all variables except `--cy` which remains constant.

### 2.3 Typography

| Role | Font | Weights |
|------|------|---------|
| UI / Body | `'Plus Jakarta Sans'` | 300, 400, 500, 600, 700, 800 |
| Code / Mono | `'JetBrains Mono'` | 400, 500 |

**Scale:**
- Display (hero): `clamp(36px, 5vw, 66px)` — 800 weight
- H1 (page titles): 26px — 800 weight
- H2 (section): 22px — 800 weight
- Card title: 13px — 700 weight
- Body: 13-13.5px — 400 weight
- Caption/meta: 11-12px — 500-600 weight
- Code: 10.5-11px — JetBrains Mono

**Letter-spacing:** Headlines use `-0.02em` to `-0.04em` for tighter, premium feel.

### 2.4 Spatial System

| Token | Value | Usage |
|-------|-------|-------|
| `--r4` | 4px | Tight radius (tags, small elements) |
| `--r8` | 8px | Standard radius (buttons, inputs) |
| `--r12` | 12px | Card/panel radius |
| `--r16` | 16px | Modal radius |
| `--nav` | 52px | Navigation height |
| `--fm` | JetBrains Mono | Monospace font variable |
| `--fn` | Plus Jakarta Sans | Sans font variable |

### 2.5 Motion Philosophy

- **Transitions:** 0.15s-0.2s ease for interactive states (hover, focus)
- **Entrance:** Fade + 4px translateY, 0.2s ease (`@keyframes fi`)
- **Hover lift:** Cards translate `-1px` Y with shadow increase
- **Modal:** Scale from 0.97→1 with opacity fade
- **No gratuitous animation** — motion serves feedback, not decoration

### 2.6 Visual Assets

- **Icons:** Custom inline SVGs, 10-13px, 2-2.5px stroke weight, round caps
- **Avatars:** Initials (2 chars) with colored background circles
- **Logo:** 4-quadrant grid of squares with decreasing opacity

---

## 3. Layout & Structure

### 3.1 Navigation (Sticky)

```
[Logo] -- [Nav Links] -------- [Actions] -- [Avatar] [Logout]
```

- Height: 52px, sticky top, z-index 100
- Left: Logo mark + "MGF" text
- Center: Context-sensitive nav links (Browse, Add template when logged in)
- Right: Theme toggle, avatar, logout
- Border-bottom with `--bor` color accent
- `n-sep` dividers (1px × 18px) separate sections

### 3.2 Page Patterns

| Route | Layout | Notes |
|-------|--------|-------|
| `auth` | Split: 60% left form, 40% right panel (dark accent bg) | Before login |
| `landing` | Hero + stats + 3-column feature grid + featured templates | Marketing feel |
| `marketplace` | Header + filter bar + auto-fill grid | Template browsing |
| `detail` | 2-column: 1fr main + 300px sidebar | Template info + files |
| `editor` | 3-column: 200px left + 1fr center + 270px right | Split view editor |
| `profile` | Header + tabs + grid | User content |
| `add` | Centered single-column card selection or form | Two-step flow |
| `ai-gen` | 2-column: 1fr main + 360px side panel | AI generation wizard |

### 3.3 Responsive Strategy

- **Grid:** `repeat(auto-fill, minmax(248px, 1fr))` for template cards
- **Editor:** Fixed 3-column, non-responsive (desktop-only tool view)
- **Max-width:** 1180px container for most content
- **Breakpoints:** Not explicitly defined — relies on auto-fill grids and flex-wrap

### 3.4 Visual Pacing

- Hero sections: 72px top padding
- Section spacing: 22px horizontal margins
- Cards: 12px gap
- Inner padding: 12-15px for cards, 24px for panels

---

## 4. Features & Interactions

### 4.1 Authentication (`auth`)

**Sign In / Register Tabs:**
- Tab underline style with animated bottom border
- Form fields: Full name (register only), Email, Password
- "Forgot password?" link (sign in only)
- CTA button: "Sign in" / "Create account"
- Toggle link: "No account?" / "Already have an account?"

**Right Panel (Dark/Accent):**
- Feature list with cyan dots
- Testimonial quote with left border accent
- Author attribution

**Behavior:**
- Simulated login sets `S.loggedIn = true`, routes to `landing`
- No actual authentication — demo mode

### 4.2 Landing Page (`landing`)

**Hero Section:**
- Eyebrow badge: cyan border + bg tint + "Modular Generation Framework"
- H1: Two-line, "Separate structure, style **and** content."
- Subtitle: Brief description
- CTAs: "Browse templates" (primary), "Add template" (secondary)
- Stats row: 847 Templates · 1,204 Projects · 92 Contributors · 6 Types

**Feature Grid (3-column):**
- Three-layer model
- Clone and personalise
- AI at every layer

**Featured Templates:**
- Section header + "View all →" link
- 4 template cards

### 4.3 Marketplace (`marketplace`)

**Header:**
- H1: "Templates"
- Subtitle: count + "contributors"

**Filter Bar:**
- Search input (left, with icon)
- Filter chips: All, Presentation, Website, Resume, Post, Carousel, Infographic
- Active chip fills dark

**Grid:**
- Template cards, filtered by type and search

### 4.4 Template Detail (`detail`)

**Main Column:**
- Large preview (16:10 aspect)
- Title, type badge, tags, author
- Description paragraph
- Files list grouped by layer (structure/style/content) with colored badges
- Comments section with add comment input

**Sidebar:**
- "Clone template" button (cyan primary)
- "Upvote" toggle button (cyan when voted)
- About card: Type, Author, Files, Upvotes, Clones (calculated as 40% of upvotes)
- Tags card
- Layers card with color dots

**Interactions:**
- Click card → clone modal
- Toggle vote → increments count visually
- Comments input (non-functional)

### 4.5 Template Editor (`editor`)

**Left Panel (200px):**
- "Add layout" button with dropdown popup
- Layer visibility toggles: STR / STY / CON
- Slide thumbnails list with active state highlight
- Click to switch slides

**Center Panel:**
- Toolbar: Back button, project name, Preview, Export, Save
- Canvas area: 16:10 preview frame with slide content
- Elements are clickable (title, subtitle, body) with cyan outline when selected
- Status bar: Slide number, Selected element, Layout file, active Layers

**Right Panel (270px):**
- Tabs: Theme | Content | Style | AI
- **Theme Tab:** CSS variables for selected element (color swatches + editable values), "View full theme.css" button, Global theme section
- **Content Tab:** Editable fields based on selected element (title text/size/weight, subtitle, bullets)
- **Style Tab:** Typography controls (size, line-height, letter-spacing, weight, align buttons), Spacing controls (opacity, padding grid, radius, z-index)
- **AI Tab:** Prompt textarea, model selector, Generate button, JSON editor, generation history

**Behavior:**
- Clicking canvas elements selects them (`S.selEl`)
- CSS vars update based on selection
- Layer visibility toggles (`S.layVis`) filter what's shown
- Slide navigation updates `S.edSlide`

### 4.6 Profile (`profile`)

**Header:**
- Avatar (large, 62px), name, handle, join date
- Stats: Templates count, Projects count, Total upvotes
- Tabs: Templates | Projects

**Templates View:**
- Grid of user's templates (filtered by author)

**Projects View:**
- Grid of user's projects with "From: [template name]" reference

### 4.7 Add Template (`add`)

**Initial View:**
- H1 + subtitle
- Two cards: "Build manually" | "Generate with AI"
- Manual → shows manual form; AI → routes to `ai-gen`

**Manual Form:**
- Template name input
- Type + Visibility selects (grid 1fr 1fr)
- Description textarea
- Tags input
- Files list with layer badges
- Publish button

### 4.8 AI Generate (`ai-gen`)

**Main Column:**
- Back button + H1 + subtitle
- Large textarea for prompt
- Model selector dropdown
- Template type grid (3×3)
- Layer checkboxes (all checked by default)
- Generate + Save draft buttons

**Side Panel:**
- Generation log steps (5 steps)
- Previous templates list with mini previews

### 4.9 Modal System

**Overlay:** Fixed full-screen with `rgba(0,0,0,.4)` backdrop

**Clone Modal:**
- Title with fork icon
- Subtitle explanation
- Project name input
- Locale + Direction selects
- Cancel + Clone & open buttons

**Behavior:**
- `openModal(type, id)` sets content and opens
- `closeModal()` removes on backdrop click or button
- `doClone()` closes and routes to editor

### 4.10 Theme Toggle

- Sun/Moon icon button in nav
- Toggles `.dark` class on `<html>`
- All CSS vars flip except `--cy`
- Avatar bg changes: `--acc` (light) / `--cy` (dark)

---

## 5. Component Inventory

### 5.1 Buttons

| Class | Appearance | States |
|-------|------------|--------|
| `.btn` | Base: 7px 15px padding, 13px 500 weight | — |
| `.btn-p` | Dark bg, light text, dark border | Hover: 85% opacity |
| `.btn-s` | Surface bg, dark text, blue border | Hover: border darkens |
| `.btn-cy` | Cyan bg, dark text, 600 weight | Hover: 90% opacity |
| `.btn-ghost` | Transparent, muted text | Hover: surface bg |
| `.btn-sm` | 5px 11px padding, 12px font | — |
| `.btn-xs` | 3px 8px padding, 11px font, r4 radius | — |

### 5.2 Inputs

| Class | Appearance | States |
|-------|------------|--------|
| `.inp` | Surface bg, blue border, r8, 7px 11px | Focus: cyan border |
| `textarea.inp` | Resizable vertical, 1.55 line-height | — |
| `.pinp` | Smaller (28px height), r4 radius | Focus: cyan |
| `.cv-val` | Mono font, fixed 80px width | Focus: cyan |
| `.json-area` | Mono font, r8, min-height 180px | Focus: cyan |

### 5.3 Cards

**Template Card (`.t-card`):**
- 16:10 preview with hover overlay (Clone + View buttons)
- Body: Type label, title, meta row (author + upvotes)
- Hover: border darkens, lift -1px, shadow
- Dark mode: stronger shadow

### 5.4 Badges & Tags

| Class | Appearance |
|-------|------------|
| `.badge` | r20, surface bg, blue border, 11px 600 weight |
| `.badge-cy` | Cyan border + bg tint |
| `.badge-dk` | Dark accent bg |
| `.tag` | Mono font, r3, surface2 bg, subtle border |

### 5.5 Navigation

| Class | Appearance |
|-------|------------|
| `.n-logo` | Logo mark + "MGF" text, pointer cursor |
| `.n-link` | r8, muted text, hover: dark text + surface bg |
| `.n-link.on` | Active state same as hover |
| `.ico-btn` | 32×32, r8, border, centered icon |
| `.ava` | 28×28 circle, accent bg, initials |

### 5.6 Dividers

| Class | Appearance |
|-------|------------|
| `.dvd` | 1px horizontal line, `--bor` color |
| `.dvd-v` | 1px vertical, 16px height |

### 5.7 Editor Components

| Class | Appearance |
|-------|------------|
| `.sthumb` | r8, 2px border, thumbnail preview |
| `.sthumb.on` | Cyan border when active |
| `.lv-btn` | Flex 1, r4, 10px 600 weight, abbreviation |
| `.lv-btn.on` | Inverted colors |
| `.lay-pop` | Absolute dropdown, r8, shadow |
| `.lay-item` | r4 padding, hover surface bg |
| `.abtn` | 24×24 r4 buttons for align/style |
| `.swatch` | 24×24 color picker square |
| `.psec` | Collapsible sections with header |
| `.psec-hd` | Uppercase 11px 700 weight, chevron |

---

## 6. Technical Approach

### 6.1 Architecture

**Single HTML File Application** — No build step, no framework. Pure HTML + CSS + vanilla JavaScript.

**State Management:**
- Single global object `S` (state)
- All mutations call `render()` to re-draw
- No reactive patterns — direct DOM updates

**Routing:**
- Hash-based via `S.route` string ('landing', 'marketplace', etc.)
- `go(route, extra)` updates state and triggers render

### 6.2 CSS Architecture

**Custom Properties (Variables):**
- Full design token set in `:root`
- Dark mode via `.dark` class override
- Component-level vars for typography (`--fm`, `--fn`)

**BEM-like Naming:**
- Block: `.t-card`, `.btn`, `.inp`
- Element: `.card-body`, `.btn-p`, `.inp:focus`
- Modifier: `.btn-sm`, `.btn-cy`

### 6.3 Data Model

```javascript
// Template
{
  id: number,
  title: string,
  type: 'Presentation' | 'Website' | 'Resume' | 'Post' | 'Carousel' | 'Infographic',
  author: string,
  av: string (initials),
  avc: string (avatar color),
  up: number (upvotes),
  tags: string[],
  p1: string (primary color),
  p2: string (secondary color)
}

// Slide (for editor)
{
  name: string,
  p1: string,
  p2: string,
  layout: string (filename)
}

// Project
{
  id: number,
  title: string,
  tmpl: string (template name),
  type: string,
  date: string,
  p1: string,
  p2: string
}

// CSS_VARS (per element)
{
  '--heading-font': string,
  '--heading-size': string,
  '--heading-weight': string,
  '--heading-color': string,
  // etc.
}
```

### 6.4 Key Implementation Patterns

**HTML Generation:**
- Template literal functions (`renderAuth()`, `renderMarketplace()`)
- Return HTML strings, inject via `innerHTML`
- Map arrays for lists: `${items.map(i => `<div>${i}</div>`).join('')}`

**Icon System:**
- All icons as inline SVG strings in `ic` object
- Used as `${ic.logo}`, `${ic.search}`, etc.

**Preview Thumbnails:**
- `prevHTML(t)` generates inline-styled div based on template type
- Different layouts for Presentation/Carousel, Resume, Website, Post, Infographic

**Modal Pattern:**
- Fixed overlay div with pointer-events control
- Content injected into `#modal-cnt`
- `openModal()` / `closeModal()` toggle class

### 6.5 External Dependencies

| Resource | Purpose |
|----------|---------|
| Google Fonts: Plus Jakarta Sans | UI typography |
| Google Fonts: JetBrains Mono | Code/mono typography |

**No JavaScript dependencies** — all logic is native ES5-compatible vanilla JS.

---

## 7. Page-by-Page Summary

| Page | Purpose | Key Elements |
|------|---------|--------------|
| Auth | Login/register | Split layout, form tabs, feature list |
| Landing | Marketing home | Hero, stats, feature grid, featured cards |
| Marketplace | Browse templates | Filter bar, search, card grid |
| Detail | View template | Preview, description, files, comments, clone |
| Editor | Edit project | 3-column layout, element selection, CSS var editing, AI tab |
| Profile | User dashboard | Avatar, stats, tabbed template/project grids |
| Add | Create template | Card selection (manual/AI), form |
| AI Gen | AI-assisted creation | Prompt input, type selection, generation log |

---

## 8. Interaction States Summary

| Element | Default | Hover | Active/On | Disabled |
|---------|---------|-------|-----------|---------|
| `.n-link` | muted text | dark text + bg | same as hover | — |
| `.btn-p` | dark fill | 85% opacity | — | — |
| `.btn-s` | surface + border | darker border | — | — |
| `.ico-btn` | surface + border | darker border + dark icon | — | — |
| `.t-card` | surface + border | lift + shadow | — | — |
| `.sthumb` | blue border | darker border | cyan border | — |
| `.lv-btn` | surface bg | — | inverted | — |
| `.up-btn` | surface + border | cyan tint bg | cyan border + bg | — |
| `.g-opt` | surface + border | cyan tint bg | cyan border + bg | — |
| `.abtn` | surface | inverted | inverted | — |
| `.inp` | blue border | — | cyan border | — |

---

## 9. Layer System Reference

The core MGF concept: **three independent layers** per template.

| Layer | Color | Files | Description |
|-------|-------|-------|-------------|
| Structure | Cyan (`--cy`) | `layouts/*.html` | HTML templates with placeholder hooks |
| Style | Purple (`#6D28D9`) | `theme.css`, `base.css` | CSS with custom properties |
| Content | Orange (`#D97706`) | `sample_data.json`, `context.md` | Data and configuration |

Files shown per template:
- **Structure:** title.html, bullets.html, image.html
- **Style:** theme.css, base.css
- **Content:** sample_data.json, context.md
