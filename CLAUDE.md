# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

- **Pure static site** — HTML, CSS, dependency-free JavaScript. No build step, no framework.
- **Root is the published site root** — all `.html` files serve directly via GitHub Pages.
- **Content generation** — `python3 scripts/expand_pages.py` regenerates editorial sections from NOTES.md content.
- **Two remotes** — GitLab (`origin`, `git.developerdojo.org/US-Council/usfellows.git`) is primary; GitHub (`github.com/us-council/usfellows.git`) is a mirror kept by git-mirror-sync (infrastructure#521). Push to GitLab only.
- **Form intake** — `apply.html` posts to formfunnel (`door.taolearning.org/api/form`, reCAPTCHA v3), which forwards accepted applications to the Azure Logic App (in `infrastructure/`) → Dynamics 365 Leads. The Logic App URL lives only in Key Vault; never put it in `assets/js/intake-config.js`.

## Commands

- **Local preview:** `python3 -m http.server 8000` (run from repo root)
- **Regenerate editorial content:** `python3 scripts/expand_pages.py` (run from repo root)
- **Publish:** merge to `main` on GitLab; the GitHub mirror's `deploy.yml` deploys to GitHub Pages

## Content Rules

- **Source of truth:** `NOTES.md` governs all institutional facts, program names, mission areas, and calls to action. Never contradict NOTES.md.
- **No fabrication:** Never invent fellows, leaders, institutions, statistics, dates, partnerships, awards, or publications.
- **Retired narrative (never restore):** Immigration/visa-pathway, unpaid-placement, USIVA, Tao Learning, Curiosity Research Corporation, INSTAR Lab.
- **Do not add frameworks** (React, Astro, etc.) without explicit approval.

## Design System

- **Template:** Kingster structural pattern — top bar, logo-left nav, dropdown menus, large hero, quick-link band.
- **Palette:** Navy, gold, white, restrained red.
- **Typography:** Cormorant Garamond (headings), Source Sans 3 (body/UI) — self-hosted in `assets/fonts/`.
- **Shared CSS:** `assets/css/site.css` (130 lines). Kingster overrides in `assets/css/kingster-overrides.css`.
- **Shared JS:** `assets/js/kingster-shell.js` (nav/footer/interaction behavior).

## Accessibility

Every page must have: one descriptive `h1`, skip navigation, keyboard-accessible nav, responsive layout, unique `<title>` and meta description, visible focus states.

## Git Workflow

- Commit early, commit often. Push after every commit.
- Push to origin (GitLab); git-mirror-sync carries it to GitHub.
- No GitLab CI pipeline — GitHub Actions on the mirror audit and deploy on push to `main`.
