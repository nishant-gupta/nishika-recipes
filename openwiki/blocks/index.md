---
type: Reference
title: Blocks Catalog & Reference
description: Complete catalog of 24 reusable block components. Includes anatomy, patterns, data structures, and usage examples for content blocks, navigation, and utility blocks.
---

# Blocks Reference

Nishika Recipes is built from 24 reusable block components. Each block is a self-contained JavaScript module that decorates a `<div class="block {name}">` and transforms it into interactive UI.

## Block Anatomy

Every block follows the same structure:

```
/blocks/{block-name}/
  {block-name}.js       # export default decorate(block)
  {block-name}.css      # .{block-name} styles
```

### Decoration Lifecycle

```javascript
// decorate() receives the block div from AEM EDS
export default function decorate(block) {
  // 1. Parse HTML structure from Google Doc
  const rows = [...block.children];
  const data = parseBlock(rows);
  
  // 2. Clear block — replace table structure with custom DOM
  block.textContent = '';
  
  // 3. Build interactive UI
  const container = buildUI(data);
  
  // 4. Attach event listeners
  container.addEventListener('change', handleChange);
  
  // 5. Append to page
  block.append(container);
}
```

### Key Patterns

**Parse table data**
- Google Docs render as HTML tables
- Read rows and cells to extract structured data
- Handle variant formats (lists, plain text, etc.)

**Handle icons**
- EDS renders `:icon-name:` as `<span class="icon icon-name"><img></span>`
- Extract and reposition as needed

**Load external content**
- Use `loadFragment(path, blockType)` from `fragment.js`
- Optionally filter to a single block type

**Coordinate multiple instances**
- Use a registry to let instances on the same page communicate
- Example: quiz block has a registry so multiple quizzes can switch between each other

---

## Content Blocks

These blocks render individual pieces of content (from content pages).

### riddle-interactive

**Purpose**: Interactive riddle game with multiple difficulty levels

**Input**: Table with columns: Level | Question | Answers | Hint

**Features**:
- Organize questions by difficulty level
- Answer normalization (case-insensitive, punctuation-insensitive)
- Hint system
- Score tracking with star emoji
- **Source**: `/blocks/riddle-interactive/riddle-interactive.js`

### idiom-of-week

**Purpose**: Idiom lesson with definition, example, and quiz

**Input**: Multiple sections (definition, example, quiz table)

**Features**:
- Example sentence usage
- Integrated quiz
- Visual styling with idiom-specific colors

**Source**: `/blocks/idiom-of-week/`

### science-experiment

**Purpose**: Guided science experiment walkthrough

**Input**: Table with experiment steps, materials, hypothesis, results

**Features**:
- Step-by-step progression
- Materials checklist
- Hypothesis vs. results comparison
- Observation prompts

**Source**: `/blocks/science-experiment/`

### poem

**Purpose**: Poetry display with decorative styling

**Input**: Poem text (multiline)

**Features**:
- Stacked-page visual design
- Line break preservation
- Poem-specific typography

**Source**: `/blocks/poem/`

### narrative-writing

**Purpose**: Short stories or narrative writing exercises

**Input**: Story text and metadata

**Features**:
- Rich text formatting (bold, italic)
- Story-specific layout
- Character and plot information

**Source**: `/blocks/narrative-writing/`

### storybook

**Purpose**: 3D page-turn animation for stories

**Input**: Story text (may be loaded from `narrative-writing` page via fragment)

**Features**:
- Interactive page-turn animation (desktop)
- Slide animation (mobile)
- Progress indicator
- Preserves bold/italic formatting

**Source**: `/blocks/storybook/`

### craft-steps

**Purpose**: Step-by-step craft instructions with images

**Input**: Table with step number | instruction | image

**Features**:
- Numbered steps
- Materials list
- Supply requirements
- Image per step

**Source**: `/blocks/craft-steps/`

### fact-cards

**Purpose**: Swipeable fun fact cards (often paired with quiz)

**Input**: Table with fact cards and their content

**Features**:
- Horizontal swipe/carousel
- Grid and list view toggle
- Tap target optimization
- Often appears with `quiz` block below

**Source**: `/blocks/fact-cards/`

### quiz

**Purpose**: Multiple-choice quiz

**Input**: Table with title | question | options (A/B/C/D) | correct answer

**Features**:
- Multiple questions per page
- Multiple quizzes can coordinate (only one plays at a time)
- Score tracking
- Answer feedback

**Format** (new):
```
Title | Quiz Name
Question | The actual question?
Options | • Option A
         | • Option B
         | • Option C
         | • Option D
Answer | A
```

**Source**: `/blocks/quiz/`

---

## Navigation & Discovery Blocks

### header

**Purpose**: Site header with navigation, search, and branding

**Features**:
- Search functionality (queries `/query-index.json`)
- Mobile menu toggle
- Navigation links to main sections
- Brand logo

**Search behavior**:
- Fetches `/query-index.json` and searches across `title`, `description`, `type`
- Returns result cards with image, title, path
- Client-side filtering for instant results

**Source**: `/blocks/header/`

### footer

**Purpose**: Site footer with links and metadata

**Features**:
- Additional navigation
- About information
- Legal links
- Brand metadata

**Source**: `/blocks/footer/`

### hero

**Purpose**: Homepage hero banner with postcard (or full-width CTA)

**Input**: Two cells — content | postcard (or single cell with `no-card` variant)

**Features**:
- Hero postcard with image and text
- `no-card` variant for full-width centered CTA
- Heading, description, button CTAs
- Eager image loading (LCP optimization)
- Button grouping

**Variants**:
- Default: content on left, postcard on right
- `no-card`: full-width centered content (no postcard)

**Source**: `/blocks/hero/`

### featured-picks

**Purpose**: Curated content cards grid (homepage)

**Input**: Table with tag | title | description | meta | link

**Features**:
- Responsive card grid
- Category tags
- Featured badge for latest issue
- Image support
- Watermark number for issues

**Source**: `/blocks/featured-picks/`

### section-grid

**Purpose**: Main navigation with category tiles

**Input**: Table with icon | section name | description | link

**Features**:
- Icon extraction and positioning
- Category-based navigation
- Mobile-responsive grid
- Accessibility: icon decoration vs. links

**Source**: `/blocks/section-grid/`

### content-listing

**Purpose**: Archive and content listing pages

**Features**:
- Groups content by issue
- Type pills with icons
- Filters and sorting
- Watermark design for issues
- Featured badge for latest

**Source**: `/blocks/content-listing/`

---

## Page Structure & UX Blocks

### issue-cover

**Purpose**: Issue page hero and dynamic content assembly

**Input**: Google Doc table — Issue # | Date | Title — Tagline | optional image

**Algorithm**:
1. Extract metadata from first two rows
2. Query `/query-index.json` for pages with matching `issue` tag
3. Sort by canonical type order (Riddle → Idiom → Science → Poem → Story → Craft)
4. Load each as a fragment with block-type filtering
5. Render section headings (icon + label)
6. Attach sticky progress strip for navigation

**Features**:
- Dynamic issue assembly (no manual page editing)
- Sticky progress strip (navigate without scrolling)
- Section pills with icons
- Eager image loading for cover image
- Guard against recursive decoration (issue page in query index)

**Related**: [Content Model — Issue Assembly](/openwiki/content-model/index.md#issue-assembly)

**Source**: `/blocks/issue-cover/`

### fragment

**Purpose**: Inline-include content from another page

**Input**: Link to fragment path (e.g., `/play-puzzle/riddle-name`)

**Optional variant**: Block type filter (e.g., `Fragment (idiom-of-week)`)

**Algorithm**:
1. Fetch `{path}.plain.html`
2. Decorate and initialize blocks in the fragment
3. Optionally filter to a single block type
4. Replace fragment block with loaded content

**Use cases**:
- Pull a specific block from a content page (issue assembly)
- Reuse content across multiple pages
- Build composite pages

**Related**: [Architecture — Fragment Block](/openwiki/architecture/overview.md#fragment-block)

**Source**: `/blocks/fragment/`

### page-hero

**Purpose**: Subpage hero (for non-homepage hero use)

**Input**: Heading, description, optional image

**Features**:
- Similar to hero but optimized for subpages
- Issue badge support
- Simpler layout (no postcard)

**Source**: `/blocks/page-hero/`

---

## Utility & Layout Blocks

### schedule-strip

**Purpose**: Publishing rhythm bar (Mon/Wed/Fri content schedule)

**Input**: Table with day | content + icon

**Features**:
- Horizontal strip layout
- Icon extraction (EDS `:icon-name:` syntax)
- Day labels with content
- Mobile-responsive

**Example**:
```
Monday   | :type-riddle: Riddle
Wednesday| :type-science: Science
Friday   | :type-craft: Craft
```

**Source**: `/blocks/schedule-strip/`

### subscribe-strip

**Purpose**: Newsletter CTA with embedded form

**Input**: Table with heading | description

**Features**:
- Heading and description
- Kit (ConvertKit) form embed
- Anchor ID for deep-linking (`#subscribe`)
- Smart loading (eager on direct URL, deferred on scroll)
- Re-scroll after Kit form renders

**Related**: [Architecture — Delayed Loading](/openwiki/architecture/overview.md#phase-3-delayed-load-low-priority)

**Source**: `/blocks/subscribe-strip/`

### columns

**Purpose**: Layout utility for side-by-side content

**Features**:
- Flexible column widths
- Responsive stacking

**Source**: `/blocks/columns/`

### cards

**Purpose**: Generic card grid layout

**Features**:
- Responsive grid
- Card hover effects

**Source**: `/blocks/cards/`

### feature-cards

**Purpose**: Styled feature cards (similar to featured-picks but different styling)

**Input**: Cards with images, titles, descriptions

**Source**: `/blocks/feature-cards/`

### fact-feature

**Purpose**: Single featured fact callout

**Input**: Fact text and optional image

**Features**:
- Large, prominent styling
- Used as accent blocks

**Source**: `/blocks/fact-feature/`

### instructions

**Purpose**: How-to or instruction section

**Input**: List of instruction steps

**Features**:
- Numbered steps
- Subheadings for organization

**Source**: `/blocks/instructions/`

### about

**Purpose**: About page content and team

**Source**: `/blocks/about/`

### recipe-list

**Purpose**: Recipe or ingredient listing

**Features**:
- Ingredient lists
- Recipe organization

**Source**: `/blocks/recipe-list/`

---

## Common Block Patterns

### Pattern: Answer Normalization

Riddles and quizzes normalize answers before checking:

```javascript
function normalize(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')      // Remove punctuation
    .replace(/\b(a|an|the)\b/g, '')    // Remove articles
    .replace(/\s+/g, ' ')              // Collapse whitespace
    .trim()
    .split(' ');                       // Split into words for stemming
}

function stem(word) {
  // Rough stemming: remove common endings
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}
```

This allows answers like:
- "the sphinx" → matches "sphinx"
- "riddles" → matches "riddle"
- "a butterfly" → matches "butterfly"

### Pattern: Icon Extraction

Blocks that work with EDS icons:

```javascript
// EDS renders :icon-name: as this HTML
const iconSpan = contentCell?.querySelector('.icon');

// Extract and reposition
if (iconSpan) {
  const iconWrap = document.createElement('span');
  iconWrap.className = 'my-icon-wrapper';
  iconWrap.appendChild(iconSpan.cloneNode(true));
  container.append(iconWrap);
}
```

### Pattern: Query Index Lookup

Blocks that fetch and filter `/query-index.json`:

```javascript
async function fetchAndFilter() {
  const response = await fetch('/query-index.json');
  const data = await response.json();
  
  // Filter by issue tag
  const issueContent = data.data.filter(item => item.issue === 'issue-12');
  
  // Sort by type order
  const sorted = issueContent.sort((a, b) => 
    CONTENT_TYPES.findIndex(t => t.id === a.type) -
    CONTENT_TYPES.findIndex(t => t.id === b.type)
  );
  
  return sorted;
}
```

### Pattern: Fragment Loading with Block Type Filter

```javascript
import { loadFragment } from '../fragment/fragment.js';

// Load specific block type from another page
const fragment = await loadFragment('/play-puzzle/riddle-12', 'riddle-interactive');
// Result: only the riddle-interactive block, no headers or metadata
```

### Pattern: Multiple Instance Coordination

When a page has multiple blocks of the same type that should coordinate:

```javascript
// Global registry
const quizRegistry = [];

export default function decorate(block) {
  const quiz = { block, /* ... */ };
  quizRegistry.push(quiz);
  
  // Setup coordination
  startBtn?.addEventListener('click', () => {
    quizRegistry.forEach(q => {
      if (q !== quiz) q.block.classList.add('hidden');
    });
  });
}
```

---

## Styling & CSS Classes

Each block has:
- **Block class**: `.{block-name}` on the root div
- **Scoped classes**: `.{block-name}-component-name` for internal elements
- **State classes**: `.{block-name}-active`, `.{block-name}-disabled`, etc.

**Example** (riddle block):
```html
<div class="block riddle-interactive">
  <div class="riddle-container">
    <div class="riddle-game">
      <div class="riddle-level-selector">...</div>
      <div class="riddle-question">...</div>
      <div class="riddle-answer-input">...</div>
      <div class="riddle-hint">...</div>
    </div>
  </div>
</div>
```

---

## Block Development Checklist

When creating or modifying a block:

- ✅ Export `decorate(block)` function
- ✅ Parse HTML table structure from Google Docs
- ✅ Replace block.textContent = '' before building new DOM
- ✅ Handle icons (`:icon-name:` EDS syntax)
- ✅ Add keyboard support (especially for interactive blocks)
- ✅ Add aria-labels and semantic HTML
- ✅ Test on mobile (min-width: 320px)
- ✅ Ensure color contrast (WCAG AA: 4.5:1 text, 3:1 UI)
- ✅ Run `npm run lint` — fix all CSS and JS errors
- ✅ Eager-load images above the fold
- ✅ Defer non-critical initialization

---

## Related

- **[Architecture Overview](/openwiki/architecture/overview.md)** — How blocks load and decorate
- **[Content Model](/openwiki/content-model/index.md)** — Content types and metadata
- **[README.md](/README.md)** — Block catalog and detailed reference
