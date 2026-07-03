# US Fellows

The official static website for **US Fellows**, a national civic fellowship society owned and stewarded by **US Council**.

US Fellows honors and connects exceptional people across disciplines to humanity-scale missions through public-interest fellowship appointments, research affiliations, Host Institution partnerships, and service-oriented projects.

## Site structure

| Page | Purpose |
| --- | --- |
| `index.html` | Institutional homepage and primary overview |
| `mission.html` | Mission, vision, standard, public-benefit commitment, and governance |
| `fellowships.html` | Fellowship programs, appointment model, and specialized tracks |
| `society.html` | Society life, code of service, and Fellowship Oath |
| `host-institutions.html` | Host eligibility, standards, and appointment model |
| `missions.html` | Ten humanity-scale mission areas |
| `fellows.html` | Fellow eligibility, selection, responsibilities, and benefits |
| `journal.html` | Journal scope, publication categories, and editorial standard |
| `apply.html` | Participation routes for Fellows, hosts, nominators, advisors, and partners |

Every dropdown destination in the primary navigation is a standalone HTML document. The application page is a five-step accessible wizard with local draft persistence and Azure Logic App submission.

Legacy paths (`journey.html`, `pathways.html`, `doorways.html`, and `partners.html`) are retained only as redirects.

## Technology

- Astro 7 static-site framework with strict TypeScript
- Reusable layouts and components in `src/layouts/` and `src/components/`
- Page sources in `src/pages/`; the build preserves all established `.html` URLs
- Shared visual system in `src/styles/global.css`
- Bundled interaction and application modules in `src/scripts/`
- Self-hosted Cormorant Garamond and Source Sans 3 through Fontsource
- Tree-shaken Lucide SVG icons through `@lucide/astro`
- Generated XML sitemap through `@astrojs/sitemap`
- Azure/Dynamics intake infrastructure in `infrastructure/logicapps/us-fellows-intake/`
- Static output compatible with GitHub Pages and other static hosts

## Local preview

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:4321`.

## Content source of truth

`NOTES.md` defines the approved organization narrative, navigation, programs, missions, standards, and calls to action. New copy must remain consistent with it. Do not restore the retired immigration/visa-placement narrative from repository history.

Edit page content in `src/pages/`, shared shell content in `src/components/`, and navigation data in `src/data/navigation.ts`.

## Verification

```sh
npm run validate
npm run preview
npm run smoke
```

`validate` compiles the site and checks all 50 routes, metadata, internal links, and deployment assets. `smoke` checks representative pages at desktop and mobile widths against a running preview server.

## Deployment

The production build is written to `dist/`. `.github/workflows/deploy.yml` uses Astro's official GitHub Pages action when `main` or `gh-pages` is pushed. GitHub Pages must use **GitHub Actions** as its publishing source, and the custom domain remains `usfellows.org`.

Files copied directly to the build, including `CNAME`, `.nojekyll`, `robots.txt`, visual-sitemap artifacts, and public images, live in `public/`.
