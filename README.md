# Nishika Recipes

A weekly content site for kids — riddles, idioms, science experiments, stories, poems, and crafts. Built on Adobe Edge Delivery Services (AEM EDS).

## Environments

- Preview: https://main--nishika-recipes--nishant-gupta.aem.page/
- Live: https://main--nishika-recipes--nishant-gupta.aem.live/

---

## Content Structure

### Site sections (nav groups)

| Section | URL | Content types |
|---|---|---|
| Play & Puzzle | `/play-puzzle` | Riddle, Idiom, Fun Facts, Quiz |
| Stories & Poems | `/stories-poems` | Poem, Narrative Writing, Story |
| Make & Do | `/make-do` | Craft |
| Learn | `/learn` | Science |
| Issues | `/issues` | Weekly issue pages |
| Archive | `/archive` | All past content |
| About | `/about` | About page |

### Folder structure (target — migrate when 20+ pages exist)

```
/play-puzzle/
  riddles/riddle-{n}
  idiom/{slug}
  facts/{slug}
  quiz/{slug}

/stories-poems/
  poems/{slug}
  narratives/{slug}

/make-do/
  crafts/{slug}

/learn/
  science/{slug}

/issues/
  issue-{n}

/archive/
/about/
```

> Current state: pages live at flat URLs (e.g. `/riddles`, `/poem`). The folder restructure is deferred until content volume grows. When restructuring, set up redirects from old URLs.

---

## Content Metadata

Every content page (riddle, idiom, science, poem, craft, narrative) must include a metadata table at the bottom of the Google Doc:

| Metadata | |
|---|---|
| Title | Page title |
| Description | One-line teaser shown in cards and social previews |
| Type | Content type (see values below) |
| Issue | Issue tag this piece belongs to (e.g. `issue-1`) |

### Type values

| Type value | Used for | Block |
|---|---|---|
| `riddle` | Riddle pages | `riddle-interactive` |
| `idiom` | Idiom of the week | `idiom-of-week` |
| `science` | Science experiments | `science-experiment` |
| `poem` | Poems | `poem` |
| `story` | Short stories | `narrative-writing` |
| `narrative` | Narrative writing exercises | `narrative-writing` |
| `craft` | Step-by-step crafts | `craft-steps` |
| `facts` | Fun fact cards + quiz | `fact-cards`, `quiz` |

### Issue tag

The `Issue` metadata field links a content page to a weekly issue. The value must match the slug of the corresponding issue page exactly.

Example: a riddle page at `/play-puzzle/riddles/riddle-12` with `Issue: issue-1` will be pulled into `/issues/issue-1` automatically.

---

## Issue Pages

Issue pages live at `/issues/issue-{n}`. The `issue-cover` block:

1. Reads the issue number, date, title, and tagline from the Google Doc table (2 rows only)
2. Fetches `/query-index.json` and filters for all pages tagged with the matching issue slug
3. Sorts content in canonical order: Riddle → Idiom → Science → Poem → Craft
4. Loads each page as a fragment (using the `fragment` block with block-type filtering)
5. Renders a sticky progress strip so readers can navigate between pieces without leaving the page

### Issue page doc structure

```
| Issue Cover | | |
| Issue #12   | Week of July 7, 2026 | The Moon, a Muddy Puddle & Why Ice Floats |
| A riddle, an idiom, a science surprise, a sunset poem, and a paper craft. | | |

--- (subscribe-strip block at the bottom) ---
```

No fragment blocks needed — content is assembled dynamically from the query index.

---

## Query Index

`helix-query.yaml` indexes all pages and exposes these fields in `/query-index.json`:

| Field | Source | Purpose |
|---|---|---|
| `title` | `<h1>` | Card title |
| `description` | First `<p>` | Card teaser |
| `image` | First `<img>` | Card thumbnail |
| `issue` | `<meta name="issue">` | Issue tag for dynamic assembly |
| `type` | `<meta name="type">` | Content type for sorting and fragment filtering |

---

## Blocks

| Block | Purpose |
|---|---|
| `hero` | Homepage hero with postcard |
| `featured-picks` | Curated content cards grid |
| `section-grid` | Category navigation tiles |
| `schedule-strip` | Mon/Wed/Fri publishing rhythm bar |
| `subscribe-strip` | Email subscribe CTA |
| `issue-cover` | Issue page hero + dynamic content assembly |
| `riddle-interactive` | Interactive riddle game |
| `idiom-of-week` | Idiom walkthrough + quiz |
| `science-experiment` | Guided science experiment |
| `fact-cards` | Swipeable fun fact cards |
| `quiz` | Multiple-choice quiz |
| `poem` | Poem with stacked-page design |
| `narrative-writing` | Short story / narrative writing |
| `craft-steps` | Step-by-step craft guide |
| `fact-feature` | Single featured fact callout |
| `fragment` | Inline content from another page (supports block-type filtering via variant) |

---

## Icons

Icons live in `/icons/` as SVG files and are referenced either via EDS icon syntax in Google Docs or directly in block JavaScript.

### EDS icon syntax

Type `:icon-name:` in a Google Doc cell. EDS renders it as `<span class="icon icon-name"><img src="/icons/icon-name.svg"></span>` before blocks load. Blocks that support icons (section-grid, schedule-strip) detect and render these spans automatically.

### Nav icons (section-grid)

Used in the first column of a `section-grid` table row.

| File | EDS syntax | Section |
|---|---|---|
| `nav-play-puzzle.svg` | `:nav-play-puzzle:` | Play & Puzzle |
| `nav-stories-poems.svg` | `:nav-stories-poems:` | Stories & Poems |
| `nav-make-do.svg` | `:nav-make-do:` | Make & Do |
| `nav-learn.svg` | `:nav-learn:` | Learn |
| `nav-issues.svg` | `:nav-issues:` | Issues |
| `nav-archive.svg` | `:nav-archive:` | Archive |
| `nav-about.svg` | `:nav-about:` | About |

### Content type icons

Used inline in `schedule-strip` content cells and referenced directly in `issue-cover` (progress strip, hero pills, section headings).

| File | EDS syntax | Content type |
|---|---|---|
| `type-riddle.svg` | `:type-riddle:` | Riddle |
| `type-idiom.svg` | `:type-idiom:` | Idiom |
| `type-science.svg` | `:type-science:` | Science |
| `type-poem.svg` | `:type-poem:` | Poem |
| `type-story.svg` | `:type-story:` | Story |
| `type-narrative.svg` | `:type-narrative:` | Narrative |
| `type-craft.svg` | `:type-craft:` | Craft |
| `type-facts.svg` | `:type-facts:` | Fun Facts (also used as fallback for unknown types) |

### Block-specific icons

These are used internally by blocks and are not intended for Google Doc authoring.

| File | Used by |
|---|---|
| `riddle-*.svg` | `riddle-interactive` |
| `idiom-*.svg` | `idiom-of-week` |
| `science-*.svg` | `science-experiment` |
| `craft-*.svg` | `craft-steps` |
| `quiz-*.svg` | `quiz` |
| `score-star.svg`, `streak-fire.svg` | `riddle-interactive`, `quiz` |
| `search.svg`, `search-dark.svg` | Nav / search UI |
| `grid.svg`, `grid-active.svg`, `list.svg`, `list-active.svg` | `fact-cards` view toggle |
| `bullet.svg` | General list decoration |
| `cross.svg` | Modal / dismiss UI |

---

## Development

### Installation

```sh
npm i
```

### Linting

```sh
npm run lint
```

### Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in `fstab.yaml`
2. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
3. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
4. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)

### Further reading

- [Developer Tutorial](https://www.aem.live/developer/tutorial)
- [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Web Performance](https://www.aem.live/developer/keeping-it-100)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
