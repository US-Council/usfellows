# SEO, analytics, and performance baseline

Review date: 2026-08-22
Canonical property: `https://usfellows.org`

## Search and sharing

- All 54 substantive sitemap routes have a unique title, description, canonical
  URL, Open Graph title/description/type/URL/image, and Twitter card metadata.
- `robots.txt` points crawlers to `https://usfellows.org/sitemap.xml`.
- `sitemap.xml` contains 54 current routes, with an ISO `lastmod` on every URL.
- Five historical routes remain explicit `noindex,follow` meta-refresh stubs and
  are excluded from the sitemap.
- Above-the-fold hero images are preloaded; the public artifact self-hosts its
  primary web fonts and uses a small, local icon subset.

The dependency-free `scripts/public-site-audit.py` checks these rules against
the source tree and the exact Pages artifact before deployment.

## Analytics decision

No client-side analytics, advertising pixels, or third-party tracking scripts
are shipped. This is intentional: the public site is informational and has no
need to collect behavioral data for the release. Operational host/security logs
remain outside the public page bundle. If measurement needs change, a separate
privacy review and documented consent/retention decision is required before a
tracker is added.

## Core Web Vitals evidence

The browser QA harness records native browser performance entries on the
representative Chromium mobile run. The 2026-08-22 local release run measured:

| Route | LCP | CLS | INP observation |
| --- | ---: | ---: | ---: |
| `/` | 472 ms | 0.000 | 96 ms |
| `/mission.html` | 200 ms | 0.000 | no interaction observed |
| `/fellowships.html` | 188 ms | 0.000 | no interaction observed |
| `/scholars.html` | 124 ms | 0.000 | no interaction observed |
| `/international-rd-scholars.html` | 144 ms | 0.000 | no interaction observed |
| `/host-institutions.html` | 208 ms | 0.000 | no interaction observed |
| `/journal.html` | 144 ms | 0.000 | no interaction observed |
| `/apply.html` | 116 ms | 0.000 | 40 ms |

These are real browser measurements on the release artifact, not fabricated
field data. INP is reported only when the browser observes an interaction;
the application and mobile-menu interactions exercise it where applicable.
Lighthouse remains useful as a throttled diagnostic, but its synthetic mobile
timings vary on a local static server and are not substituted for field data.

## Release command

```bash
BASE_URL=https://usfellows.org/ node scripts/public-site-qa.mjs
```

The GitHub Actions workflow runs the static audit and this HTTPS browser matrix
after every successful Pages deployment.
