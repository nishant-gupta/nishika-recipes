---
type: Guide
title: Nishika Recipes — Quickstart
description: A weekly content site for kids built on Adobe Edge Delivery Services (AEM EDS). Home to riddles, idioms, science experiments, stories, poems, and crafts with dynamic issue assembly, interactive blocks, and accessibility-first design.
---

# Nishika Recipes — Quickstart

**Nishika Recipes** is a weekly content platform for kids featuring riddles, idioms, science experiments, poems, stories, and crafts. It's built on **Adobe Edge Delivery Services (AEM EDS)** with a block-based architecture optimized for performance and accessibility.

- **Preview**: https://main--nishika-recipes--nishant-gupta.aem.page/
- **Live**: https://main--nishika-recipes--nishant-gupta.aem.live/

## What This Wiki Covers

This OpenWiki documents the repository structure, content model, block architecture, development workflow, and recent quality improvements. Use it to understand how content flows from Google Docs through the system, how blocks render and interact, and what priorities drive recent changes.

## Core Concepts

### Content Model

Every content page (riddle, idiom, science experiment, poem, craft, narrative) is authored as a Google Doc and includes a metadata table with:
- **Title** — page title
- **Description** — one-line teaser for cards and social
- **Type** — content type (`riddle`, `idiom`, `science`, `poem`, `story`, `narrative`, `craft`, `facts`)
- **Issue** — weekly issue tag (e.g., `issue-1`)

The **query index** (`helix-query.yaml`) extracts these fields into `/query-index.json`, which powers:
- Dynamic issue assembly (issue-cover block pulls matching content)
- Content cards in section grids
- Search results in the header
- Archive and listing pages

**Learn more**: [Content Model](/openwiki/content-model/index.md)

### Site Architecture

The site uses **seven main navigation sections**, each mapping to a flat URL structure (migrate to nested folders when volume reaches 20+ pages):

| Section | URL | Content types |
|---|---|---|
| Play & Puzzle | `/play-puzzle` | Riddle, Idiom, Fun Facts, Quiz |
| Stories & Poems | `/stories-poems` | Poem, Narrative Writing, Story |
| Make & Do | `/make-do` | Craft |
| Learn | `/learn` | Science |
| Issues | `/issues` | Weekly issue pages |
| Archive | `/archive` | All past content |
| About | `/about` | About page |

**Learn more**: [Architecture Overview](/openwiki/architecture/overview.md)

### Blocks

The site is built from reusable **block components** that handle layout, interaction, and content assembly. Key blocks include:

- **Content blocks** — `riddle-interactive`, `idiom-of-week`, `science-experiment`, `poem`, `narrative-writing`, `craft-steps`, `fact-cards`, `quiz`
- **Navigation & discovery** — `hero`, `featured-picks`, `section-grid`, `content-listing`
- **Page structure** — `header`, `footer`, `fragment` (inline content from other pages)
- **UX patterns** — `schedule-strip` (Mon/Wed/Fri rhythm), `subscribe-strip` (newsletter CTA), `issue-cover` (dynamic issue assembly)

**Learn more**: [Blocks Reference](/openwiki/blocks/index.md)

### Performance & Accessibility

Recent development has focused on **Core Web Vitals (CWV)** optimization and **WCAG AA compliance**:
- Eager loading of above-the-fold images
- Deferred initialization of non-critical blocks
- Delayed loading of third-party forms (Kit newsletter embed, Google Analytics)
- Delegated click tracking to avoid DOM bloat
- Contrast fixes across all content and UI blocks

**Learn more**: [Performance & Accessibility](/openwiki/performance-accessibility/index.md)

---

## Quick Links

### For Content Authors

- **Content Types**: See [content types and metadata](/openwiki/content-model/index.md#content-types) in the content model
- **Icons**: Find navigation and content type icons in [/icons](/icons)
- **Issue Assembly**: Understand how [issue pages dynamically pull content](/openwiki/content-model/index.md#issue-assembly)

### For Developers

- **Local Setup**: [Development guide](/openwiki/development/index.md)
- **Block Patterns**: Review [block structure and common patterns](/openwiki/blocks/index.md#anatomy-of-a-block)
- **Testing & Linting**: [npm scripts and code quality](/openwiki/development/index.md#testing--linting)
- **Styling System**: [CSS architecture and custom properties](/openwiki/architecture/overview.md#styling-system)

### For Reviewers

- **Recent Changes**: See [git history](#recent-focus-areas) below
- **WCAG & Performance**: [What changed and why](/openwiki/performance-accessibility/index.md#recent-improvements)
- **Analytics & Tracking**: [How clicks and events are captured](/openwiki/architecture/overview.md#analytics--tracking)

---

## Repository Structure

```
/blocks/                    # 24 reusable block components
  /{block-name}/
    {block-name}.js         # Decoration and interaction logic
    {block-name}.css        # Component styles
/scripts/
  aem.js                    # AEM EDS core library (RUM, metadata, fragments)
  scripts.js                # Post-load initialization
  delayed.js                # Deferred phase: GA4, Kit forms, click tracking
/styles/
  styles.css                # Global CSS variables and base styles
  fonts.css                 # Font imports (@font-face)
/icons/                     # SVG icons for nav and content types
/fonts/                     # Custom web fonts
/docs/                      # Content block documentation and templates
/helix-query.yaml           # Query index schema (fields extracted to /query-index.json)
README.md                   # Comprehensive content and block reference
```

---

## Recent Focus Areas

The repository has seen heavy investment in **user experience quality**, driven by these recent commits:

### Performance (CWV / LCP / CLS)
- Forced eager image loading on hero postcards and issue covers
- Deferred Kit newsletter form to the delayed phase to avoid blocking lazy render
- Progressive fragment loading for issue pages to prevent Cumulative Layout Shift (CLS)
- Optimized block initialization order to reduce Time to First Byte (TBT)

### Accessibility (WCAG AA)
- Fixed all remaining color contrast failures across blocks
- Removed decorative opacity on interactive links
- Fixed image alt text in issue covers and featured picks
- Added proper heading hierarchy to issue pages
- Improved tap targets and cursor states

### Feature Work
- Added hero `no-card` variant for full-width centered CTAs
- Implemented sticky progress strip on issue pages for multi-content navigation
- Added #subscribe anchor for deep-linking from hero CTAs
- Integrated Newsletter form (Kit/ConvertKit) with smart loading

---

## Environments & Deployments

- **Preview** (`main` branch): https://main--nishika-recipes--nishant-gupta.aem.page/
  - Published automatically from Google Drive
  - Used for QA and content review
- **Live** (`main` branch): https://main--nishika-recipes--nishant-gupta.aem.live/
  - Cached CDN version for end users
  - Deployed via Code Sync

**Content source**: Google Drive folder (configured in `fstab.yaml`)

---

## Key Files to Know

| File | Purpose |
|---|---|
| `/README.md` | Comprehensive content model, block catalog, icons reference, and dev setup |
| `/package.json` | npm scripts: `lint`, `lint:js`, `lint:css`, `lint:fix` |
| `/helix-query.yaml` | Query index schema — defines which fields are extracted from pages |
| `/styles/styles.css` | CSS variables (`--dark-color`, `--text-color`, etc.) and base styles |
| `/scripts/aem.js` | AEM EDS library: RUM sampling, metadata extraction, fragment loading |
| `/scripts/delayed.js` | GA4 init, Kit form injection, delegated click tracking |
| `/blocks/{name}/` | Each block has a `.js` file (decoration/interaction) and `.css` file (styles) |

---

## Common Workflows

### Add a new content block

1. Create `/blocks/{block-name}/` directory
2. Create `{block-name}.js` with an `export default decorate(block)` function
3. Create `{block-name}.css` with styles
4. Reference it in a Google Doc using the block syntax
5. Run `npm run lint` to validate

**Example**: See [riddle-interactive](/blocks/riddle-interactive/) for a complex interactive block.

### Change the query index

Edit `/helix-query.yaml` to add or remove fields. This changes what metadata is available in `/query-index.json` for blocks like `issue-cover` and `content-listing`.

### Fix accessibility or performance

Check recent commits in the [performance & accessibility guide](/openwiki/performance-accessibility/index.md#recent-improvements) to understand patterns. Common fixes:
- Add `loading="eager"` and `fetchPriority="high"` to above-the-fold images
- Defer third-party script injection to the delayed phase
- Use `aria-hidden="true"` for decorative elements
- Ensure color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)

### Deploy to live

Push to `main` branch. AEM EDS automatically:
1. Pulls content from Google Drive
2. Publishes preview version
3. Syncs code changes to CDN
4. Updates live version

---

## Backlog

- **Content folder restructure** (deferred until 20+ pages exist)
  - Target: `/play-puzzle/riddles/riddle-{n}`, `/stories-poems/poems/{slug}`, etc.
  - Requires redirect setup when implemented
  - Source: [README.md](/README.md#folder-structure-target--migrate-when-20-pages-exist)

---

**Last updated**: Check `/openwiki/.last-update.json` for documentation generation timestamp.
