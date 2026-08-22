# Public site QA baseline

Review date: 2026-08-22
Canonical site: `https://usfellows.org`

## Scope

The release artifact contains 59 root HTML files. Five are historical
meta-refresh stubs; 54 current pages are listed in `sitemap.xml`. The browser
matrix intentionally tests the current `usfellows.org` property. The former
interim immigration-domain launch path is retired and is not a release target.

`scripts/public-site-qa.mjs` is read-only. It never clicks the final submit
control and fails if a request other than GET or HEAD is attempted.

The checks cover:

- every sitemap route: HTTPS/HTTP status, HTML response, one `main`, one `h1`,
  skip navigation, expected canonical, and retired-public-term scan;
- each historical stub's destination and no retired public content;
- Chromium desktop across every current sitemap route;
- Firefox and WebKit desktop on the representative route matrix;
- Chromium and WebKit at a 390px mobile viewport;
- console/page/request failures, same-origin failed resources, image alt
  attributes, and mobile horizontal overflow;
- mobile menu open/close/Escape focus behavior;
- the non-submitting application wizard transition and the conditional
  International R&D Scholar fields.
- native browser LCP, CLS, and observed interaction timing samples on the
  representative Chromium mobile run; see `seo-performance-baseline.md`.

## Local release run

The complete local matrix passed against a local static server:

```text
BASE_URL=http://127.0.0.1:8765/ ALLOW_HTTP=1 node scripts/public-site-qa.mjs
public-site-qa: chromium-desktop: 54 route(s)
public-site-qa: firefox-desktop: 8 route(s)
public-site-qa: webkit-desktop: 8 route(s)
public-site-qa: chromium-mobile: 8 route(s)
public-site-qa: webkit-mobile: 8 route(s)
public-site-qa: passed (5 browser/API checks)
```

The repository workflow repeats the static audit and then runs the same matrix
against `https://usfellows.org` after a successful Pages deployment, using a
pinned Playwright runner and all three browser engines.

## DNS and HTTPS boundary

The current canonical property resolves through Cloudflare and redirects HTTP
to HTTPS. The live certificate covers `usfellows.org` and `*.usfellows.org`,
and the HTTPS response includes HSTS. No retired interim domain is treated as
a required launch dependency by this release.

This document records QA evidence, not legal/compliance approval. See
`docs/legal-content-boundary-review.md` for the content-boundary disposition.
