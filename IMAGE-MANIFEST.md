# Media Manifest

## Photography

Every primary route has a distinct editorial photograph at `public/assets/photos/pages/<route>.avif`. No route shares a photograph, and each photograph appears only once on its route, in the hero.

The complete page-by-page art direction, deterministic seeds, positive instructions, dedicated negative prompt, and selected 16:9 delivery crops are versioned in `scripts/generate-site-photos.mjs`. The negative prompt explicitly excludes text, letters, numbers, logos, seals, badges, watermarks, signage, branded clothing, uniforms, lanyards, interface elements, and common anatomical artifacts.

All route photographs are delivered as 1920 × 1080 AVIF. They are synthetic editorial scenes and do not depict actual US Fellows, staff, partners, appointments, host institutions, or documented events.

| Route | Unique photograph |
| --- | --- |
| Home | `pages/index.avif` |
| Mission | `pages/mission.avif` |
| Fellowships | `pages/fellowships.avif` |
| Society | `pages/society.avif` |
| Host Institutions | `pages/host-institutions.avif` |
| Missions | `pages/missions.avif` |
| Fellows | `pages/fellows.avif` |
| Journal | `pages/journal.avif` |
| Apply | `pages/apply.avif` |
| Our Mission | `pages/our-mission.avif` |
| Vision | `pages/vision.avif` |
| Why US Fellows | `pages/why-us-fellows.avif` |
| US Fellows Standard | `pages/us-fellows-standard.avif` |
| Governance & Stewardship | `pages/governance-stewardship.avif` |
| Fellowship Programs | `pages/fellowship-programs.avif` |
| Career Advancement | `pages/career-advancement.avif` |
| International Graduate Fellows | `pages/international-graduate-fellows.avif` |
| International R&D Scholars | `pages/international-rd-scholars.avif` |
| National Capacity Fellows | `pages/national-capacity-fellows.avif` |
| Mission Fellowships | `pages/mission-fellowships.avif` |
| Fellowship Society | `pages/fellowship-society.avif` |
| Cohorts & Chapters | `pages/cohorts-chapters.avif` |
| Convenings & Honors | `pages/convenings-honors.avif` |
| Code of Service | `pages/code-of-service.avif` |
| Fellowship Oath | `pages/fellowship-oath.avif` |
| Become a Host | `pages/become-a-host.avif` |
| Who Can Host | `pages/who-can-host.avif` |
| Host Standards | `pages/host-standards.avif` |
| Appointment Model | `pages/appointment-model.avif` |
| Submit Opportunity | `pages/submit-opportunity.avif` |
| Humanity & Dignity | `pages/humanity-dignity.avif` |
| Science & Discovery | `pages/science-discovery.avif` |
| Planetary Stewardship | `pages/planetary-stewardship.avif` |
| Civic Life & Public Trust | `pages/civic-life-public-trust.avif` |
| National Capacity & Resilience | `pages/national-capacity-resilience.avif` |
| Become a Fellow | `pages/become-a-fellow.avif` |
| Eligibility | `pages/eligibility.avif` |
| Selection Criteria | `pages/selection-criteria.avif` |
| Fellow Benefits | `pages/fellow-benefits.avif` |
| Nominate a Fellow | `pages/nominate-a-fellow.avif` |
| Essays & Research Notes | `pages/essays-research-notes.avif` |
| Field Reports | `pages/field-reports.avif` |
| Fellow Stories | `pages/fellow-stories.avif` |
| Institutional Briefings | `pages/institutional-briefings.avif` |
| Impact Reports | `pages/impact-reports.avif` |
| Terms of Service | `pages/terms-of-service.avif` |
| Privacy Policy | `pages/privacy-policy.avif` |
| Doorways | `pages/doorways.avif` |
| Journey | `pages/journey.avif` |
| Partners | `pages/partners.avif` |
| Pathways | `pages/pathways.avif` |

`public/assets/photos/home-hero-og.jpg` is the social-sharing derivative of `pages/index.avif`; it is metadata, not a second in-page placement.

### Editorial rhythm

Photography is intentionally varied by page rather than assigned by quota:

- Home uses three photographs: one hero and two editorial interludes.
- Thirty long-form mission, fellowship, Society, host, candidate, and Journal pages use two photographs: one hero and one editorial interlude.
- Nineteen focused pages retain one hero photograph so forms, legal reading, selection guidance, and short gateway experiences remain restrained.

The 33 supporting photographs are stored in `public/assets/photos/editorial/`. Most page-level prompts, seeds, crops, and the dedicated no-text negative prompt are versioned in `scripts/generate-support-photos.mjs`; the International R&D Scholars supporting image is a derived internal AVIF asset from the same synthetic editorial set. The pages intentionally limited to one photograph are Apply, Our Mission, Why US Fellows, US Fellows Standard, Fellowship Programs, Code of Service, Fellowship Oath, Who Can Host, Appointment Model, Eligibility, Selection Criteria, Nominate a Fellow, Essays & Research Notes, Terms of Service, Privacy Policy, Doorways, Journey, Partners, and Pathways.

## Icons

All interface and narrative icons are original inline SVGs. `src/components/CivicIcon.astro` contains the custom 25-glyph civic icon language used across 197 narrative placements, with fine-line geometry and a restrained gold secondary stroke. Header menu controls are also custom inline SVG. The site has no stock icon-library dependency.

Do not identify synthetic subjects as real people. Replace synthetic photography with approved documentary photography only when US Council supplies verified subjects, releases, and captions.
