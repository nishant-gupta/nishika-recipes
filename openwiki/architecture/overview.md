---
type: Architecture
title: Nishika Recipes — System Architecture
description: AEM EDS-based block architecture with multi-phase script loading, dynamic content assembly via query index, and modular CSS. Emphasizes performance optimization and accessibility.
---

# System Architecture

Nishika Recipes is built on **Adobe Edge Delivery Services (AEM EDS)**, a headless CMS platform that separates content (Google Drive) from presentation (code repository). The system uses a **block-based component architecture** where each UI element is a self-contained, reusable JavaScript and CSS module.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Drive (Content)                  │
│  - Pages authored as Google Docs                            │
│  - Tables and blocks define structure                       │
└────────────────────┬────────────────────────────────────────┘
                     │ fstab.yaml mountpoint
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    AEM EDS Platform                         │
│  - Publishes content to /query-index.json                   │
│  - Serves plain HTML fragments (.plain.html)               │
│  - Handles CDN caching and preview/live split               │
└────────────────────┬────────────────────────────────────────┘
                     │ /index.html, /.plain.html
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Browser & DOM Decoration Phase                │
│  1. Parse HTML (server-rendered)                            │
│  2. Load scripts in three phases (eager, lazy, delayed)    │
│  3. Block decorators transform HTML into interactive UI    │
│  4. Event listeners, tracking, and app state initialized    │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Phase Script Loading

Scripts load in three phases to balance interactivity, performance, and user experience:

### Phase 1: Eager Load (Blocks RenderStart)

Runs synchronously during the `loadEager` phase before paint:
- **`aem.js`** — Core AEM EDS library
  - RUM (Real User Monitoring) sampling and telemetry
  - Metadata extraction from `<meta>` tags
  - `getMetadata()` for blocks to access page metadata
  - Fragment block utilities

- **`scripts.js`** — Post-load setup
  - `decorateMain()` — Walk the DOM and apply block decoration
  - Load only the **first block** to avoid serializing all blocks before First Contentful Paint (FCP)

**Why split?** The first block often contains critical content (hero, page title). Decorating all blocks upfront causes layout recalculation before rendering.

### Phase 2: Lazy Load (After FCP)

Runs after paint, when the page becomes interactive:
- Continue `loadSections()` to decorate remaining blocks
- Each block's `decorate()` function runs in sequence
- Interactive elements (buttons, forms, games) become available

### Phase 3: Delayed Load (Low Priority)

Runs in the idle time bucket after interaction:
- **`delayed.js`** — Non-critical features
  - **Google Analytics 4** (`G-LJ62YCR276`) initialization
  - **Kit newsletter form** injection into `.subscribe-form-embed` placeholders
  - **Click tracking** for all buttons and key links
  - Observes hashchange events to load Kit on `#subscribe` navigation

**Why defer?** Kit loads reCAPTCHA and other third-party assets that block interaction. GA4 is purely observational. Click tracking uses event delegation to avoid DOM pollution.

## Content Assembly Pipeline

### Query Index

The **helix-query.yaml** schema defines which fields are extracted from every page and exposed via `/query-index.json`:

```yaml
fields:
  - title        # <h1> text
  - description  # First <p> text
  - image        # First <img> src
  - issue        # <meta name="issue"> content
  - type         # <meta name="type"> content (content type)
```

### Dynamic Content Assembly (Issue Pages)

The **issue-cover** block demonstrates the power of the query index:

1. **Read metadata from Google Doc** — Issue number, date, title, tagline, optional cover image
2. **Query `/query-index.json`** — Fetch all pages with matching `issue` tag
3. **Sort by canonical order** — Riddle → Idiom → Science → Poem → Story → Craft
4. **Load each as a fragment** — Use `loadFragment(path, blockType)` to fetch and decorate content
5. **Render sticky progress strip** — Lets readers navigate between pieces without scrolling
6. **Append to page** — Content sections are injected dynamically

This pattern allows weekly issues to assemble from independently authored content without manual page editing.

### Fragment Block

The **fragment** block inline-includes content from another page:

```
Fragment (idiom-of-week)
  ↓
loadFragment('/play-puzzle/idiom-name')
  ↓
Fetch '/play-puzzle/idiom-name.plain.html'
  ↓
decorateMain() + loadSections() on fragment HTML
  ↓
Extract only the 'idiom-of-week' block (blockType filter)
  ↓
Replace fragment block with loaded content
```

This is used in issue pages to pull specific blocks from content pages while respecting media paths and cross-origin concerns.

## Block Architecture

### Anatomy of a Block

Every block is a directory with:

```
/blocks/{name}/
  {name}.js       # export default decorate(block) {}
  {name}.css      # .{name} styles
```

The **decorate** function receives a `<div class="block {name}">` and transforms it:

```javascript
export default function decorate(block) {
  // 1. Read HTML table structure from Google Doc
  const rows = [...block.children];
  
  // 2. Parse data (metadata, images, lists, etc.)
  const data = parseBlock(rows);
  
  // 3. Clear block contents
  block.textContent = '';
  
  // 4. Build interactive DOM
  const container = document.createElement('div');
  container.className = '{name}-container';
  
  // populate container with structured HTML
  
  // 5. Attach event listeners
  container.addEventListener('click', handleInteraction);
  
  // 6. Append to page
  block.append(container);
}
```

### Key Patterns

**Parse and Replace**
- Read table rows from HTML
- Extract data (question/answer, title/description, etc.)
- Replace with custom-built DOM structure

Example: [riddle-interactive](/blocks/riddle-interactive/riddle-interactive.js#L10-L43)

**Decorate Icons**
- EDS renders `:icon-name:` syntax in Google Docs as `<span class="icon icon-name"><img src="/icons/icon-name.svg"></span>`
- Blocks extract and reposition icon spans
- Use `decorateIcons()` utility from `aem.js` if needed

Example: [schedule-strip](/blocks/schedule-strip/schedule-strip.js#L20-L36)

**Load External Content**
- Use `loadFragment(path, blockType)` to fetch and decorate content from other pages
- Optionally filter to a single block type (useful in issue pages)

Example: [issue-cover](/blocks/issue-cover/issue-cover.js#L1)

**Progressive Enhancement**
- Initialize interactive features (games, quizzes) during the lazy phase
- Avoid blocking interactions during eager load
- Use `await loadSections()` to ensure dependent blocks are ready

Example: [quiz](/blocks/quiz/quiz.js#L43-L60) — Multiple quizzes on one page coordinate via a registry

## Styling System

### CSS Architecture

Global styles are organized in three layers:

**`/styles/styles.css`** — Base styles and variables
- CSS custom properties (variables)
- Default body styles, reset, typography
- Media queries for responsive breakpoints

**`/styles/fonts.css`** — Web font imports
- `@font-face` declarations for Epilogue (body) and Boldonse (headings)

**Per-block CSS** — Component-scoped styles
- `/blocks/{name}/{name}.css`
- Encapsulated with block class prefix (e.g., `.riddle-interactive`)

### CSS Variables

Root variables defined in `styles.css`:

```css
:root {
  /* Brand colors */
  --dark-color: #7c3f87;                 /* Primary purple */
  --text-color: #4a1a5c;                 /* Dark text */
  --background-color: #f5f0fb;           /* Light lavender bg */
  
  /* Semantic colors */
  --link-color: #7c3f87;
  --button-color: #f5f0f7;
  --button-hover-color: #5e2070;
  
  /* Accent palette */
  --accent-yellow: #fbbf24;
  --accent-coral: #f87171;
  --accent-teal: #34d399;
  --accent-blue: #60a5fa;
  
  /* Typography */
  --body-font-family: epilogue, sans-serif;
  --heading-font-family: boldonse, sans-serif;
  
  /* Responsive sizing */
  --body-font-size-m: 18px;
  --heading-font-size-xl: 36px;
  ...
}
```

Blocks use these variables for consistent theming. When colors change, update the root variables and all components automatically adjust.

## Analytics & Tracking

### RUM (Real User Monitoring)

AEM EDS provides `sampleRUM()` in `aem.js`. It samples a subset of pageviews and sends timing data to the RUM collector:

```javascript
sampleRUM('checkpoint', { name: 'string' });
```

Checkpoints are logged at:
- Page load (`cwv`)
- Image load (`image`)
- Error conditions

### Google Analytics 4

Injected during the **delayed phase** (`delayed.js`):

```javascript
const GA_ID = 'G-LJ62YCR276';
const script = document.createElement('script');
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
document.head.appendChild(script);
```

### Click Tracking

Delegated listener on `document` (delayed phase) captures:

**Button clicks**
```javascript
gtag('event', 'button_click', {
  block: 'storybook',           // Block name or 'page'
  label: 'Next Page'            // Button text or aria-label
});
```

**Link clicks** (contextual)
- Hero CTA: `event: 'cta_click'` with `destination` URL
- Section nav: `event: 'section_click'` with section name
- Issue nav: `event: 'issue_nav_click'` with direction (prev/next)
- Newsletter: `event: 'subscribe_click'`

See `/scripts/delayed.js` for the full tracking implementation.

---

## Content Flow Example: Issue #12

1. **Author creates Google Doc**
   - Title: "Issue #12 — The Moon, a Muddy Puddle & Why Ice Floats"
   - Metadata table with issue tag: `issue-12`
   - Optional cover image

2. **Content authors create riddle, idiom, science, poem, craft pages**
   - Each tagged with `Issue: issue-12` in metadata

3. **AEM EDS publishes all pages**
   - `/query-index.json` now includes all 6 content items tagged `issue-12`
   - Each page gets a `.plain.html` endpoint

4. **Browser loads /issues/issue-12**
   - `issue-cover` block decoration runs
   - Queries `/query-index.json` for `issue-12` items
   - Calls `loadFragment()` for each in canonical order
   - Renders issue hero + dynamic content sections + progress strip

5. **User interacts**
   - Clicks "Next" in progress strip → scrolls to next content
   - Clicks "Get issue in inbox" → loads Kit form (delayed phase)
   - All clicks tracked to GA4 (delayed phase)

---

## Key Files

| File | Purpose |
|---|---|
| `/fstab.yaml` | Mountpoint configuration — points to Google Drive |
| `/helix-query.yaml` | Query index schema — defines extracted fields |
| `/scripts/aem.js` | AEM EDS core library (RUM, metadata, fragments) |
| `/scripts/scripts.js` | Post-load initialization (decorateMain, loadSections) |
| `/scripts/delayed.js` | Non-critical features (GA4, Kit, click tracking) |
| `/styles/styles.css` | CSS variables and base styles |
| `/styles/fonts.css` | Web font imports |

---

## Related

- **[Content Model](/openwiki/content-model/index.md)** — How metadata flows and issue assembly works
- **[Blocks Reference](/openwiki/blocks/index.md)** — Catalog of all 24 blocks
- **[Performance & Accessibility](/openwiki/performance-accessibility/index.md)** — Optimization patterns and recent fixes
