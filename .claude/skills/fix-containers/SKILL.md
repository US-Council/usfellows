---
name: fix-containers
description: Fix the "Continue Exploring" container alignment issue at the bottom of site pages
---

# Continue Exploring Container Alignment Fix (from NOTES.md)

The "Continue Exploring" containers at the bottom of many pages are out of alignment.

## Options (in priority order)

1. **Balance the layout** — add content or filler to the left side of the container row so the "Continue Exploring" box isn't floating awkwardly. This could be a related-links section, a "did you know?" factoid, or simply padding.
2. **Realign the containers** — adjust the CSS grid/flexbox so the containers sit properly regardless of content. The containers likely need consistent min-heights or a proper grid structure.
3. **Remove them** — if alignment can't be fixed cleanly, remove the "Continue Exploring" containers from affected pages entirely.

## Approach

1. Identify which pages have the issue (inspect several across different sections)
2. Determine if it's a shared CSS issue in `assets/css/site.css` or `assets/css/kingster-overrides.css`
3. Check if the HTML structure differs between pages (some may have missing siblings)
4. Apply the fix — prefer the grid/flexbox alignment fix first
5. Verify across multiple pages
