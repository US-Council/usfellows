# USFellows.org — USIVA Fellows Program

This repo is the source for **USFellows.org**, the canonical home for the
USIVA Fellows Program. The `usfellows.org` domain purchase is in progress;
until it completes, the site is served at **fellows.usiva.org**, which
points at this same repo. See the "Cut over to USFellows.org" milestone
issue for the cutover plan once the domain is live.

USIVA connects immigrant fellows (any foreign national with a completed
high-school degree) to unpaid fellowship placements and walks them
through the visa journey that follows.

Entry point is a fellowship, but the journey doesn't stop there. USIVA's
job is to show fellows exactly what paperwork gets them there, what
postures them for the next step, and what doors it opens — from an F-1
OPT or J-1 fellowship through to long-term pathways like EB-2 NIW and
H-1B. USIVA treats fellows as potentially **lifelong fellows**, not a
one-time placement.

## Pathway content map

The full site (tracked in the [v1 launch milestone](../../milestones))
will cover:

- **What is a Fellowship?** — explainer for prospective fellows, entry
  requirements, value proposition, consultation CTA.
- **Fellow journey timeline** — arrival → education → F-1 OPT/J-1
  fellowship → career doorways.
- **Pathway pages** — Bachelor's → F-1 OPT, Master's → F-1 OPT, PhD →
  F-1 OPT, plus a J-1 alternative entry, each with a paperwork checklist.
- **Doors it opens** — EB-2 NIW, H-1B, and other post-fellowship
  statuses.
- **Partner NGOs** — Tao Learning, Curiosity Research Corporation, and
  INSTAR Lab Inc., the three partner organizations fellows are placed
  with.
- **Apply** — migrating from `usiva.org/apply-opt.html` to
  `/apply` on this site. Source for the old page now lives at
  [US-Council/usiva](https://github.com/US-Council/usiva) (`gh-pages`
  branch).

## Local preview

No build step. Serve the repo root with any static file server:

```sh
python3 -m http.server
```

Then open `http://localhost:8000`.

## Deploy model

- **Hosting**: GitHub Pages, deployed from the `main` branch root. The
  `CNAME` file currently pins `fellows.usiva.org` (interim); it will be
  repointed to `usfellows.org` once that domain is live — see the
  cutover issue.
- **DNS**: Cloudflare, proxied CNAME `fellows.usiva.org` → this org's
  GitHub Pages domain, on the `usiva.org` zone (interim). Once
  `usfellows.org` is purchased and added to Cloudflare, DNS moves to
  apex A records + `www` CNAME per the cutover issue.
- **Stack**: plain HTML/CSS, no framework, dependency-light and fast.
  Framework decisions (if any become necessary) are tracked in the
  "Architecture & stack decision" issue.

## Status

This is a minimal launch scaffold — the branded landing page you see
today. The full site build is scoped across the issues in the
**USFellows.org v1 — launch** milestone.
