# USFellows.org — USIVA Fellows Program

This repo is the source for **USFellows.org**, the canonical home for the
USIVA Fellows Program. The `usfellows.org` domain purchase
is in progress; until DNS is live, the site is served at
**fellows.usiva.org**, which points at this same repo. See the "Cut over to
USFellows.org" milestone issue for the cutover plan once the domain
resolves.

USIVA connects immigrants and foreign nationals (any candidate with a
completed high-school degree) to unpaid fellowship placements and walks
them through the visa journey that follows.

Entry point is a fellowship, but the journey doesn't stop there. USIVA's
job is to show fellows exactly what paperwork gets them there, what
postures them for the next step, and what doors it opens — from an F-1
OPT or J-1 fellowship through to long-term pathways like EB-2 NIW and
H-1B. USIVA treats fellows as potentially **lifelong fellows**, not a
one-time placement.

## Site map

Static site built from a licensed HTML template (Kingster education
template — layout/typography/icon-font base only; all copy, imagery
selection, and page structure are original to this build). Real content,
no forms, no server-side code, six pages:

| Page | File | Covers |
|---|---|---|
| Home | `index.html` | Hero + consult CTA, "What is a Fellowship?", journey teaser, pathway overview cards, doorways teaser, partner strip, final CTA |
| The Fellow's Journey | `journey.html` | Gradient-spine timeline: arrival → education → F-1 OPT/J-1 fellowship → career doorways → lifelong fellowship |
| Pathways | `pathways.html` | Bachelor's / Master's / PhD → F-1 OPT fellow, plus the J-1 alternative start — who each fits, how the journey unfolds, paperwork categories, doors opened, and a pathway comparison table |
| Doorways | `doorways.html` | The long-term doorways a fellowship placement can posture a candidate for: F-1 OPT, J-1, EB-2 NIW, H-1B, and beyond |
| Partners | `partners.html` | Tao Learning, Curiosity Research Corporation, INSTAR Lab Inc — real, sourced descriptions of each org, plus the unpaid-placement/foot-in-the-door model |
| Apply / Consult | `apply.html` | Who it's for, what a consult covers, document prep, an FAQ, and the one external action on the site: the link to `https://apply.usiva.org` |

Every page footer carries the mandatory disclaimer: informational only,
not legal advice, not a law firm, not affiliated with the U.S.
government. Every page also ships a skip-to-content link, a single `<h1>`,
and per-page SEO metadata (unique title/description/OG tags, canonical
link, and JSON-LD — `Organization` on the homepage, `BreadcrumbList` on
every inner page, `FAQPage` on `apply.html` matching its visible FAQ).

## Local preview

No build step. Serve the repo root with any static file server:

```sh
python3 -m http.server
```

Then open `http://localhost:8000`.

## Deploy model

- **Hosting**: GitHub Pages, deployed from the `main` branch root. The
  `CNAME` file currently pins `fellows.usiva.org` (interim); it will be
  repointed once `usfellows.org` DNS is live — see the
  cutover issue.
- **DNS**: Cloudflare (interim, on the `usiva.org` zone). Once the
  `usfellows.org` domain is added to Cloudflare, DNS moves
  per the cutover issue.
- **Stack**: plain HTML/CSS/vanilla JS, no framework, no build step, no
  server-side code. All internal links are relative so the site works
  unmodified on any host.

## Status

All six pages are built out with real, sourced copy on a shared custom
design system (`assets/css/site.css`) layered on the template's icon font
(Font Awesome + Elegant Icons), plus one licensed photo from the template
package (the rest of the template's `upload/` imagery ships as unusable
dimension placeholders, not real photography — still an open gap, see the
"Brand & design system" milestone issue). We own this site end to end;
there's no external handoff. Work is tracked across the
**USFellows.org v1 — launch** milestone issues, and progress is logged
directly on those issues as build-log comments rather than closed until a
QA pass signs off.
