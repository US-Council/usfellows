# US Fellows

_Last verified: 2026-11-13._

The official static website for **US Fellows**, a national civic fellowship society owned and stewarded by **US Council**.

US Fellows honors and connects exceptional people across disciplines to humanity-scale missions through public-interest fellowship appointments, research affiliations, Host Institution partnerships, and service-oriented projects.

## Site structure

| Page | Purpose |
| --- | --- |
| `index.html` | Institutional homepage and primary overview |
| `mission.html` | Mission, vision, standard, public-benefit commitment, and governance |
| `fellowships.html` | Fellowship programs, appointment model, and specialized tracks |
| `scholars.html` | Five R&D Scholar designations, standards, standing, and program boundaries |
| `international-rd-scholars.html` | International Scholar thesis, outreach, network, and opportunity guide |
| `resident-rd-scholar.html` | Structured 20-hour Resident curriculum, applied work, mentorship, and completion standard |
| `trusted-rd-scholar.html` | Trusted eligibility, national-mission responsibilities, security boundaries, and standing |
| `principal-rd-scholar.html` | Principal-level funding, team, sponsor, risk, delivery, and mentorship leadership |
| `distinguished-rd-scholar.html` | Distinguished record, national impact, stewardship, review, and emeritus standing |
| `scholar-standards.html` | Shared selection, integrity, security, publication, service, title-use, and standing rules |
| `scholars-network.html` | Cross-level Scholar community and responsible collaboration protocol |
| `society.html` | Society life, code of service, and Fellowship Oath |
| `host-institutions.html` | Host eligibility, standards, and appointment model |
| `missions.html` | Ten humanity-scale mission areas |
| `fellows.html` | Fellow eligibility, selection, responsibilities, and benefits |
| `journal.html` | Journal scope, publication categories, and editorial standard |
| `apply.html` | Participation routes for Fellows, hosts, nominators, advisors, and partners |

Every dropdown destination in the primary navigation is a standalone HTML document. The application page is a five-step accessible wizard with local draft persistence, designation-specific Scholar fields, and submission through formfunnel (`door.taolearning.org/api/form`, `formType=usfellows`, reCAPTCHA v3 loaded only at the review step), which forwards accepted applications to the intake Logic App. The Logic App URL lives only in Key Vault; `assets/js/intake-config.js` holds only public values.

Legacy paths (`journey.html`, `pathways.html`, `doorways.html`, and `partners.html`) are retained only as redirects.

## Technology

- Plain HTML, CSS, and dependency-free JavaScript
- No framework, package manager, server-side code, or build step
- GitHub Pages-compatible relative links
- Shared navigation/footer and interaction behavior in `assets/js/kingster-shell.js`
- Shared visual system in `assets/css/site.css`
- Application behavior in `assets/js/application.js`, intake endpoint and public reCAPTCHA site key in `assets/js/intake-config.js`
- Scholar communication source and delivery rules in `communications/SCHOLAR-COMMUNICATIONS.md`
- Azure/Dynamics intake and opt-in International Scholar email infrastructure in `infrastructure/logicapps/us-fellows-intake/`
- Licensed Kingster template used as the structural reference for the top bar, institutional header, dropdown navigation, hero, and homepage content rhythm

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Content source of truth

The published pages and `scripts/expand_pages.py` carry the approved organization narrative, navigation, programs, missions, standards, and calls to action; new copy must stay consistent with them. `NOTES.md` holds the owner's open content and design direction (currently: fix the "Continue Exploring" alignment and bring curated photos back to every page). Do not restore the retired immigration/visa-placement narrative from repository history.

The long-form sections on the 35 destination pages are maintained in `scripts/expand_pages.py`. After changing that content model, run `python3 scripts/expand_pages.py` from the repository root to regenerate the static HTML. The deployed site still has no build-time dependency.

## Deployment

The repository is designed for static deployment from its root. `CNAME` (`usfellows.org`), `robots.txt`, and `sitemap.xml` contain the domain and crawler configuration.

GitLab (`git.developerdojo.org/US-Council/usfellows`) is the source of truth. It is mirrored to GitHub by git-mirror-sync (infrastructure#521); do not push to GitHub by hand. On GitHub, `.github/workflows/deploy.yml` copies the root `*.html`, `assets/`, `CNAME`, `.nojekyll`, `robots.txt` and `sitemap.xml` into `_site`, audits it with `scripts/public-site-audit.py`, and deploys it to GitHub Pages on every push to `main`. `.github/workflows/public-site-qa.yml` then runs the read-only Playwright browser matrix (`scripts/public-site-qa.mjs`). The GitLab project has no CI pipeline.
