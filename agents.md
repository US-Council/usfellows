# Agent Instructions

## Project objective

Maintain the official US Fellows website as a prestigious, credible national civic fellowship society owned by US Council.

## Source of truth

1. Use `NOTES.md` for institutional facts, positioning, program names, mission areas, standards, and approved calls to action.
2. Use `readme.md` for the current technical architecture.
3. Treat old immigration, visa, unpaid-placement, and named partner copy as retired. Do not reintroduce it.

## Technical constraints

- Keep the site static and GitHub Pages-compatible.
- Use relative internal links.
- Put shared styling in `src/styles/global.css`.
- Put shared navigation and footer markup in `src/components/`, navigation data in `src/data/navigation.ts`, and interaction behavior in `src/scripts/`.
- Keep Astro configured for static output and preserve the established `.html` routes.
- Preserve one descriptive `h1`, skip navigation, keyboard access, responsive behavior, unique metadata, and visible focus states on every substantive page.
- Do not add nonfunctional forms or fabricate submission endpoints, people, metrics, dates, cohorts, partnerships, awards, or publications.

## Design direction

- Preserve the Kingster-derived institutional pattern: top bar, logo-left navigation, dropdown menus, large editorial hero, quick-link band, and formal content sections.
- Maintain the navy, gold, white, and restrained red palette.
- Use `Cormorant Garamond` for major editorial headings and `Source Sans 3` for interface/body text.
- Aim for civic prestige and institutional seriousness, not a startup or recruitment-site aesthetic.

## Verification

Before finishing a change:

1. Run `npm run validate`.
2. Run `npm run preview` and `npm run smoke`.
3. Confirm the browser console has no errors.
4. Inspect homepage and one inner page at desktop and mobile widths.
5. Search for retired narrative terms before release.
