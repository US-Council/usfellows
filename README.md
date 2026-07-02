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

Built as a static v1 from a licensed HTML template (Kingster education
template — layout/typography/icon-font base only; all copy, imagery
selection, and page structure are original to this build). Real content,
no forms, no server-side code:

| Page | File | Covers |
|---|---|---|
| Home | `index.html` | Hero + consult CTA, "What is a Fellowship?", benefits, pathway overview, partner strip, final CTA |
| The Fellow's Journey | `journey.html` | Timeline: arrival → education → F-1 OPT/J-1 fellowship → career doorways → lifelong fellowship |
| Pathways | `pathways.html` | Bachelor's / Master's / PhD → F-1 OPT fellow, plus the J-1 alternative start — who it fits, general paperwork, posture, doors opened |
| Partners | `partners.html` | Tao Learning, Curiosity Research Corporation, INSTAR Lab Inc — roles and the unpaid-placement model |
| Apply / Consult | `apply.html` | Process explainer; the only external action on the site is the link to `https://apply.usiva.org` |

Every page footer carries the mandatory disclaimer: informational only,
not legal advice, not a law firm, not affiliated with the U.S.
government.

**Not yet done**: migrating the old `usiva.org/apply-opt.html` content
into this site (source now lives at
[US-Council/usiva](https://github.com/US-Council/usiva), `gh-pages`
branch) — v1 links straight out to the existing `apply.usiva.org` intake
instead. Tracked in the "Apply page" milestone issue.

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

v1 baseline shipped: all five pages built out with real copy, a small
custom design system (`assets/css/site.css`) layered on the template's
icon font (Font Awesome + Elegant Icons), and one licensed photo from the
template package (the rest of the template's `upload/` imagery ships as
unusable dimension placeholders, not real photography — see the
"Brand & design system" milestone issue for the follow-up on real/AI
imagery). Suzanne owns refining brand, visuals, and copy from here;
tracked across the **USFellows.org v1 — launch** milestone issues.
