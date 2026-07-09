# Issue Cover Block — Google Doc Template

Place this table at the **top of an issue page doc** (e.g. `/issues/12`).
Each content section below it is a `Fragment` block pointing to the canonical content page.

---

## Table structure

| Issue Cover | | |
|---|---|---|
| Issue #12 | Week of July 7, 2026 | The Moon, a Muddy Puddle & Why Ice Floats |
| A riddle, an idiom, a science surprise, a sunset poem, and a paper craft — all in one place. | | |

**Row 1:** Issue number · Date · Page title
**Row 2:** Tagline (first cell only)

That's it — content sections are assembled dynamically from the query index.

---

## Full page doc structure

```
[ Issue Cover block — table above ]

--- (horizontal rule = new section) ---

| Fragment |
| /riddles/riddle-12 |

---

| Fragment |
| /idiom/under-the-weather |

---

| Fragment |
| /science/why-ice-floats |

---

| Fragment |
| /poems/the-sky-forgot-to-go-dark |

---

| Fragment |
| /crafts/paper-moon-mobile |

---

[ subscribe-strip block ]
```

The order of rows in the Issue Cover table must match the order of Fragment sections below it.
The anchor IDs (`riddle`, `idiom`, etc.) are injected automatically onto each section's wrapper —
they survive the async fragment load because the outer section element is preserved when fragments render.

---

## Content page design

Each content page (e.g. `/riddles/riddle-12`) should contain **only the interactive block** — no hero,
no subscribe strip. This makes it work cleanly both as a standalone page and as a fragment on the issue page.

Any page-level chrome (title, subscribe CTA) can live on the issue page itself.
