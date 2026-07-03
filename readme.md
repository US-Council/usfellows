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

- Plain HTML, CSS, and dependency-free JavaScript
- No framework, package manager, server-side code, or build step
- GitHub Pages-compatible relative links
- Shared navigation/footer and interaction behavior in `assets/js/kingster-shell.js`
- Shared visual system in `assets/css/site.css`
- Application behavior in `assets/js/application.js`
- Azure/Dynamics intake infrastructure in `infrastructure/logicapps/us-fellows-intake/`
- Licensed Kingster template used as the structural reference for the top bar, institutional header, dropdown navigation, hero, and homepage content rhythm

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Content source of truth

`NOTES.md` defines the approved organization narrative, navigation, programs, missions, standards, and calls to action. New copy must remain consistent with it. Do not restore the retired immigration/visa-placement narrative from repository history.

The long-form sections on the 35 destination pages are maintained in `scripts/expand_pages.py`. After changing that content model, run `python3 scripts/expand_pages.py` from the repository root to regenerate the static HTML. The deployed site still has no build-time dependency.

## Deployment

The repository is designed for static deployment from its root. `CNAME`, `robots.txt`, and `sitemap.xml` contain the domain and crawler configuration.
