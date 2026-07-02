# US Fellows — Image Manifest

Early deliverable for the imagery lane, per the template-faithful rebuild mandate (2026-07-02).
This lists every image slot in the curated 17-page set, at the **exact dimensions the
Kingster "college" template ships** for that slot. Nothing here should be resized — the
template's CSS crops/positions these images at these exact pixel dimensions, and changing
them will break the faithful-template layout.

**Every generated photo must contain NO TEXT of any kind** (no overlaid words, no signage
with legible text, no book spines/screens with readable text) — the template lays its own
type over these images.

**Status column:** `PLACEHOLDER` = currently ships with the template's own stock/demo photo
(Unsplash/Shutterstock/iStock filenames), sitting in as a dimension-correct placeholder until
the imagery lane replaces it. `SOLID`/`ICON` = not a photo slot (CSS color, or a small vector
icon file) — flagged only where its filename could be mistaken for a photo slot.

Target paths below are where each image will live in the rebuilt repo. Paths under
`assets/upload/tracks/`, `assets/upload/programs/`, etc. are **new, per-page-distinct
copies** created during the rebuild (the template reuses one shared stock photo across all
four "track" pages and several other page families — I'm giving each final page its own file
path now so the imagery lane can generate four genuinely different photos instead of
overwriting one shared file four times).

---

## Shared chrome (every page)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/logo-HP.png` | 200×200 | Header + footer primary logo mark | Wordmark/monogram lockup, transparent background, no photographic content — this is a logo asset, not photography; leave to brand/logo work, not the imagery lane. |
| `assets/upload/menu-logo.png` | 100×100 | Mobile menu / secondary logo | Same mark, smaller — logo asset, not imagery-lane scope. |
| `assets/upload/mega-menu-bg.jpg` | 446×299 | Background wash behind the "Fellowship Tracks" mega-menu dropdown panel | Soft, low-contrast, out-of-focus academic/research setting (desk, books, or lab bench at a distance) so white menu text stays legible over it. No people in focus, no text, no legible signage. |

---

## index.html (Home)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/home/hero-slide-1.jpg` | 2000×1200 | Revolution Slider hero, slide 1 (full-bleed) | Wide establishing shot conveying prestige and possibility — a fellow at work in a research/lab/studio setting, natural light, editorial not stock-y. No text, no visible screens with readable content, no logos on clothing/objects. |
| `assets/upload/home/section-bg-1.jpg` | 2200×443 | Full-bleed low-height section background band (stat/quote band) | Abstract or wide architectural/campus texture (columns, glass, stone) at a low aspect ratio — must read well cropped very short. No people close enough to be a focal subject, no text. |
| `assets/upload/home/section-bg-2.jpg` | 2200×433 | Full-bleed section background band ("group of fellows" band) | Wide shot of a small group in a collaborative setting (seminar table, lab, studio) shot from a respectful distance — candid, not posed-smile stock photography. No text, no visible name badges. |
| `assets/upload/home/section-bg-3.jpg` | 2200×521 | Full-bleed section background band (institutional/campus band) | Wide architectural or campus-adjacent shot — stone/glass building facade, dusk or golden hour. No text/signage, no people as focal subject. |
| `assets/upload/home/card-education.jpg` | 700×450 | Homepage track/program card thumbnail — Education track | Tao Learning field: a learning environment — hands writing, a whiteboard being used (blank/abstract marks, not legible text), or a study setting. No legible text anywhere in frame. |
| `assets/upload/home/card-research.jpg` | 700×450 | Homepage track/program card thumbnail — Research track | Curiosity Research Corporation field: a research setting — notebook and instruments, or a researcher mid-observation, shot from behind/side to avoid a posed portrait. No legible text/labels. |
| `assets/upload/home/card-applied-science.jpg` | 700×450 | Homepage track/program card thumbnail — Applied Science track | INSTAR Lab field: an applied-science/lab setting — bench equipment, close-up of hands working with lab tools. No legible instrument readouts or labels, no people's faces as the focal point. |
| `assets/upload/home/card-fellow-services.jpg` | 700×450 | Homepage track/program card thumbnail — Fellow Services track | USIVA field (fellow services/placement support, NOT visa/immigration): two people in a mentoring/advising conversation, shot candidly from the side/behind, warm and supportive tone. No paperwork with legible text, no name badges. |
| `assets/upload/home/portrait-1.jpg` … `portrait-5.jpg` | 600×733 each (5 images) | Homepage "fellows" portrait/avatar grid | Editorial portrait crops (waist-up), varied settings (lab, studio, seminar room, outdoors), natural expressions, NOT posed corporate headshots. No name tags, no text in frame. These must NOT be treated as real named individuals — caption copy will describe them generically (e.g. "A Research Track fellow"), never with an invented name. |
| `assets/upload/home/content-1.jpg` | 834×660 | Homepage content-body image (classroom-style block) | A collaborative learning/seminar setting, wide enough to breathe next to body copy. No legible text on any surface in frame. |
| `assets/upload/home/content-2.jpg` … `content-5.jpg` | 640×449 each (4 images) | Homepage secondary content-body images | Varied fellowship-adjacent settings: campus walkway, library/reading room, lab bench, outdoor collaborative space. No legible text, no people as tight facial focal point. |
| `assets/upload/home/icon-stat-1.png` … `icon-stat-4.png` | ~100×130, 130×130, 130×130, 96×130 | Homepage stat-row pictograms | **ICON, not photography** — simple line/glyph icons (e.g. graduation cap, globe, handshake, book). Transparent background, single color matching site palette, no text baked into the icon. |
| `assets/upload/home/icon-row-2-1.png` … `icon-row-2-4.png` | 500×203 each | Homepage secondary icon/pictogram row | **ICON, not photography** — same treatment as above, wider aspect. |
| `assets/upload/home/news-teaser-1.jpg` | 1920×530 | Homepage news-teaser full-bleed strip | Wide editorial shot, campus or institutional setting, dusk/golden hour tone matching hero. No text. |
| `assets/upload/home/news-teaser-2.jpg` | 1920×872 | Homepage secondary news-teaser image | Same treatment, taller crop — a fellow presenting or collaborating, shot wide/candid. No text, no readable slides/screens. |

## about.html (About)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/about/page-title-bg.jpg` | 1800×900 | Page-title band background | Wide institutional shot — US Council program setting, could be a boardroom-adjacent or campus-adjacent architectural shot. Muted/darker tone since white page-title text overlays it. No text/signage. |
| `assets/upload/about/icon-1.png` … `icon-3.png` | 65×65, 67×58, 63×62 | About-page icon trio (mission/values row) | **ICON, not photography** — simple glyphs (e.g. compass, shield, bridge) matching site palette. |
| `assets/upload/about/partner-logo-1.jpg` … `-4.jpg` | 248×120 each (4 images, one dropped from the original 5-logo strip since only 4 partners exist) | Partner/accreditation logo strip | **NOT imagery-lane scope** — these are the four partner organizations' own logo lockups (US Council, USIVA, Tao Learning, Curiosity Research Corporation, INSTAR Lab — pick 4 to fit the strip or extend to 5 slots). Needs real partner-supplied logo files, not generated photography. Flag to brand/partnerships, not hardmagic. |
| `assets/upload/about/icon-col-2.png` … `icon-col-4.png` | 43×45, 40×43, 47×47 | Small numbered/stat-adjacent icons | **ICON, not photography.** |
| `assets/upload/about/content-1.jpg` | 2000×1333 | About page body photo 1 | Wide shot conveying the program's institutional seriousness — could be an exterior/interior architectural shot tied to US Council's operating context. No text/signage, no people as tight focal subject. |
| `assets/upload/about/content-2.jpg` | 2000×1335 | About page body photo 2 | A collaborative or advisory setting — two or three people in conversation at a table, shot candidly from a distance. No name tags, no legible documents. |
| `assets/upload/about/content-3.jpg` | 2000×1333 | About page body photo 3 | Campus/institutional exterior or a research/applied setting representing the breadth of the four tracks. No text. |

## fellowship-life.html (About > Fellow Life, from university-life.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/fellowship-life/page-title-bg.jpg` | 1700×810 | Page-title band background | A warm, lived-in shot of fellows in a shared space (common room, courtyard) — conveys community, not academia-as-institution. No text. |
| `assets/upload/fellowship-life/section-bg.jpg` | 1551×857 | Section background band | Wide shot of a shared/social fellow space, softer and warmer than the page-title band. No text, no people as tight focal subject. |
| `assets/upload/fellowship-life/content-full.jpg` | 2000×1333 | Full-width body content photo | A candid group shot (3-5 people) in a relaxed fellow-community setting — walking, talking, working together outdoors or in a common area. No posed group-photo smiles-at-camera; no text, no name badges. |
| `assets/upload/fellowship-life/card-1.jpg` … `card-5.jpg` | 900×500 each (5 images) | Fellow-life feature card grid (originally: activities/parking/transportation/trophy-adjacent life topics) | Five distinct fellow-life scenes: (1) a shared meal/social gathering, (2) commuting/transit near the program site, (3) a recreational/wellness activity, (4) a community or civic event, (5) an everyday campus-adjacent street scene. Candid, editorial, no text/signage, no posed-at-camera shots. |
| `assets/upload/fellowship-life/icon-1.png` … `icon-4.png` | 43×32, 39×34, 25×31, 28×33 | Small life-topic pictograms | **ICON, not photography** — glyphs for the four life-topic cards above (e.g. community, transit, recreation, civic). |

## education-track.html, research-track.html, applied-science-track.html, fellow-services-track.html (Fellowship Tracks — one shared template, four distinct instances)

All four track pages use the **identical department-page template** — same slot types and
dimensions repeat exactly across all four. Distinct target paths and per-track art direction
below so each track gets its own unique photography.

| Slot type | Dimensions | Context |
|---|---|---|
| Hero/body photo A | 1280×853 | Large body photo, upper section |
| Hero/body photo B | 2000×1313 | Large body photo, lower section |
| Section background 1 | 600×238 | Small full-bleed background strip |
| Section background 2 | 600×235 | Small full-bleed background strip |
| Tab-panel image ×4 | 700×923 each | Four-tab content panel (e.g. Overview / Structure / Outcomes / How to Join) |
| Tab background decoration | 298×276 | **Decorative PNG, not photography** — template's own tab-frame graphic, keep as-is, not imagery-lane scope |
| Card thumbnail | 700×450 | Used when this track is referenced elsewhere (nav, homepage) — reuse the homepage card image listed above rather than generating a duplicate |

**Education track** (`assets/upload/tracks/education-*.jpg`) — Tao Learning field. Art direction: warm, literacy/STEAM-forward learning environments — a whiteboard mid-use (abstract marks only, no legible text), students/fellows in a hands-on workshop setting, materials and tools of teaching. No legible text anywhere, no posed-at-camera portraits.

**Research track** (`assets/upload/tracks/research-*.jpg`) — Curiosity Research Corporation field. Art direction: a research/observation setting — notebooks, instruments, a researcher mid-task shot from the side. No legible instrument readouts, no name tags, no posed portraits.

**Applied Science track** (`assets/upload/tracks/applied-science-*.jpg`) — INSTAR Lab field. Art direction: an interdisciplinary lab/bench setting — equipment, hands at work, a sense of precision and rigor. No legible labels/readouts, no faces as tight focal point.

**Fellow Services track** (`assets/upload/tracks/fellow-services-*.jpg`) — USIVA field, framed as placement/advising support (NOT visa or immigration imagery). Art direction: an advising/mentoring conversation — two people at a table, warm and attentive, shot candidly from the side/behind. No paperwork with legible text, no name badges, nothing that reads as a government/legal office setting.

## programs.html (Programs listing, from course-list-1.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/programs/page-title-bg.jpg` | *(none in template — this listing page uses a solid-color page-title band, no photo slot)* | Page-title band | N/A — no image slot; template renders this band as a flat color field. |
| `assets/upload/programs/card-1.jpg` … `card-4.jpg` | 700×450 each (4 images, one per track's flagship program) | Program listing grid cards | Four distinct shots, one per track (reuse the four track card images from the homepage list above rather than generating new ones — same subject matter, same dimensions). |

## program-detail.html (Program Detail Pattern, from introduction-to-financial-accounting.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/programs/detail-page-title-bg.jpg` | 2000×651 | Page-title band background | A single flagship example program's setting — pick one track (e.g. Research) for this illustrative pattern page. Wide, muted-tone shot since white text overlays it. No text/signage. |
| `assets/upload/programs/detail-content-1.jpg` | 2000×1334 | Program detail body photo | A fellow actively engaged in program work — hands-on, mid-task, shot candidly. No legible text, no posed portrait. |
| `assets/upload/programs/detail-content-2.jpg` | 550×500 | Program detail secondary/inline body photo | A smaller supporting detail shot — a tool, workspace, or close working detail relevant to the illustrative program. No legible text/labels. |

## apply.html (Admissions > Apply, from apply-to-kingster.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/apply/page-title-bg.jpg` | 1800×825 | Page-title band background | A forward-looking, aspirational shot — someone at the start of a journey (walking into a building, opening a laptop, arriving somewhere new) shot from behind/side, not posed at camera. No text, no visible screen content, no visible application paperwork. |
| `assets/upload/apply/content-1.jpg` | 2000×1365 | Apply-page body photo | A welcoming, in-progress fellowship scene reinforcing "this could be you." No text, no posed group photo. |
| `assets/upload/apply/icon-1.png` … `icon-4.png` | 41×41, 43×45, 40×43, 47×47 | Four-step application process icons | **ICON, not photography** — simple glyphs for a 4-step process (e.g. submit, review, interview, welcome). |

## funding.html (Admissions > Funding, from scholarships.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/funding/page-title-bg.jpg` | 1700×937 | Page-title band background | A quiet, dignified shot conveying support without triumphalism — avoid "money/cash" visual clichés entirely. A study or work setting bathed in good light works well. No text. |
| `assets/upload/funding/content-1.jpg` | 800×517 | Funding-page body photo | A fellow at work, unposed, in a setting that implies focus and opportunity rather than financial hardship or charity framing. No text, no visible paperwork/checks/currency. |
| `assets/upload/funding/icon-title.png` | 53×52 | Small heading-adjacent icon | **ICON, not photography.** |

## fellows-community.html (Admissions > Fellows Community, from alumni.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/fellows-community/page-title-bg.jpg` | 1700×961 | Page-title band background | A warm group/gathering shot conveying an ongoing network, not a one-time graduation event. No text, group shot from a respectful distance (not posed rows). |
| `assets/upload/fellows-community/content-1.jpg` | 2000×1334 | Body photo 1 | A candid small-group conversation, community/network feel. No name tags, no text. |
| `assets/upload/fellows-community/content-2.jpg` | 2000×1335 | Body photo 2 | A second candid community scene — different setting than content-1 for variety (e.g. outdoors vs. indoors). No text. |
| `assets/upload/fellows-community/card-1.jpg` … `card-8.jpg` | 900×500 each (8 images) | Community grid/gallery cards | Eight distinct candid scenes spanning all four tracks (2 per track) showing the ongoing network in action — working sessions, casual gatherings, mentoring moments. No text, no posed corporate-headshot crops, no invented names in captions (describe generically, e.g. "Fellows Community, Applied Science track"). |

## news.html (News listing, from blog-grid-3-columns.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/news/page-title-bg.jpg` | *(none in template — this listing page uses a solid-color page-title band, no photo slot)* | Page-title band | N/A — no image slot. |
| `assets/upload/news/card-1.jpg` … `card-6.jpg` | 700×660 each (6 images) | News-listing grid card thumbnails | Six distinct editorial-style images spanning program news topics (a new track cohort starting, a fellow presenting work, an advising session, a lab/studio moment, a community gathering, an institutional/partner moment). No text overlays in the photo itself (headlines render as HTML, not baked into the image), no invented named individuals implied as the subject. |

## news-post.html (News single-post pattern, from standard-post-type.html)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/news/post-featured.jpg` | 2000×1365 | Single-post featured/body image | One editorial image matching whichever news-card topic this illustrative post uses. No text baked into the image. |
| `assets/upload/news/author-avatar.jpg` | 90×90 | Byline avatar | **Flag, do not generate a fake person.** The template ships this as a generic byline avatar; for a real institutional site this should be either the US Council program logo mark (reuse `logo-HP.png` cropped square) or omitted entirely — do NOT generate a photorealistic "author" headshot, since news posts should be bylined as "US Fellows Program" (an institution), not an invented named person. |

## gallery.html (Gallery)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/gallery/page-title-bg.jpg` | 1800×1200 | Page-title band background | A signature wide shot representing the program's overall visual identity — this is the "cover" image for the whole gallery. No text. |
| `assets/upload/gallery/grid-1.jpg` … `grid-16.jpg` | 700×660 each (16 images — curated down from the template's 26-item demo sample) | Gallery grid cells | Sixteen distinct editorial photos spanning all four tracks and the fellow-community/admissions moments — labs, studios, seminar rooms, campus-adjacent exteriors, advising conversations, group gatherings. No text anywhere, no posed corporate photography, varied compositions (some wide, some close-detail-on-hands/tools) so the grid doesn't feel repetitive. |
| `assets/upload/gallery/lightbox-1.jpg` … `lightbox-4.jpg` | ~2000×1000–1365 (varies; match each grid item's full-size companion) | Lightbox full-size versions for a handful of "featured" grid items | Same subjects as their corresponding grid cells, just full resolution — no separate art direction needed, generate at the higher of the two dimensions and the grid crop derives from it. |

## contact.html (Contact — form stripped, Apply CTA only)

| Target path | Dimensions | Context | Art direction |
|---|---|---|---|
| `assets/upload/contact/page-title-bg.jpg` | 1800×915 | Page-title band background | A calm, professional shot — an office/institutional interior or exterior, understated. No text/signage (this matters more than usual here, since a contact page is exactly the kind of place a template's stock photo tends to have visible fake address/phone text baked in — confirm none does). |

## 404.html (not in nav — infrastructure page)

No content-photo slots — the template's 404 page is typography + the shared header/footer/logo
chrome only (all logo assets already covered under "Shared chrome" above). No imagery-lane work
needed here.

---

## Slot-count summary

| Page | Photo slots | Icon/logo slots (not imagery-lane scope) |
|---|---|---|
| Shared chrome | 1 (mega-menu bg) | 2 (logos) |
| index.html | 14 | 8 |
| about.html | 3 | 3 (+ 4 partner logos, not imagery-lane) |
| fellowship-life.html | 7 | 4 |
| education/research/applied-science/fellow-services tracks (×4) | 4 photo slots × 4 tracks = 16 | 4 tab-bg decorations (not imagery-lane) |
| programs.html | 4 | 0 |
| program-detail.html | 3 | 0 |
| apply.html | 2 | 4 |
| funding.html | 2 | 1 |
| fellows-community.html | 10 | 0 |
| news.html | 6 | 0 |
| news-post.html | 1 (+1 flagged, do-not-generate) | 0 |
| gallery.html | 20 | 0 |
| contact.html | 1 | 0 |
| **Total photo slots to generate** | **~90** | — |

Flagged items requiring a decision outside the imagery lane's normal generation flow:
1. **Partner logos** (about.html) — need real partner-supplied logo files, not AI-generated photography.
2. **News-post byline avatar** — should not be a generated "fake person" headshot; use the program logo mark or omit.
