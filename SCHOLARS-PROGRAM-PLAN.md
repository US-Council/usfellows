# US Fellows R&D Scholars website plan

Source: the locally retained ChatGPT export titled **US Fellows Scholars Program** (conversation `6a5ba8a4-3438-83ea-8e0f-9fad7d590fa9`, updated July 20, 2026). The export itself is private, ignored by Git, and is not a website content dependency.

## Outcome

Add R&D Scholars as a coherent professional pathway within US Fellows without confusing it with the existing field-based Fellow programs. The website should help a visitor answer three questions quickly:

1. Which Scholar designation matches my present eligibility and responsibility?
2. What evidence and commitments are expected at that level?
3. What happens after I apply, especially if I am an International R&D Scholar?

## Information architecture

- Keep the existing top-level navigation. Make **R&D Scholars Program** a real hierarchy within the Fellowships menu, with all five programs in order, followed by shared standards and the Scholars Network.
- Use `scholars.html` as the authoritative program overview and five-level designation map.
- Use `international-rd-scholars.html` as the operational guide for thesis framing, endorsements, targeted outreach, funding-opportunity review, permissions, and safeguards.
- Use `resident-rd-scholar.html`, `trusted-rd-scholar.html`, `principal-rd-scholar.html`, and `distinguished-rd-scholar.html` as full program definitions rather than short overview sections.
- Use `scholar-standards.html` as the shared governance source for selection, standing, integrity, security, publication, service, title use, and accountable enforcement.
- Use `scholars-network.html` as the cross-level community page and recipient-side protocol: how the five designations contribute, what a complete request contains, what a scientist may do, and what no request implies.
- Surface the new pathway on the homepage and in the main Fellowships overview, while preserving the ten existing Fellow programs.

## Program model

| Designation | Primary gate | Expected engagement | Website treatment |
| --- | --- | --- | --- |
| International R&D Scholar | Mission-aligned research potential and a credible thesis/research direction | Flexible, part-time, voluntary, and self-paced | Emphasize advisor endorsement, network-building, funding research, and targeted requests |
| Resident R&D Scholar | Readiness for a structured professional research pathway | At least 20 hours per week | Emphasize mentoring, methods, AI/cyber literacy, documentation, ethics, and teamwork |
| Trusted R&D Scholar | Active U.S. Government clearance plus continuing eligibility | Full-time work on projects of U.S. national importance | State the gate without collecting clearance details; emphasize security and compliance |
| Principal R&D Scholar | Current or former PI, Co-PI, Key Personnel, program/technical director, chief scientist, or comparable leadership | Leadership of funded, multidisciplinary mission work | Emphasize proposal leadership, teams, partnerships, and translation to mission use |
| Distinguished R&D Scholar | Multiple decades of national-impact work and continuing contribution to US Fellows | Strategic, intellectual, institutional, service, or financial contribution | Present as the highest recognition; make clear that financial support cannot purchase the title |

Advancement is not automatic. Application, invitation, nomination, and institutional partnership are valid entry routes. Active, inactive, alumni, and emeritus standings support periodic review and honest title use.

## Application and lifecycle

1. Add all five designations to the current application program selector.
2. Reveal designation-specific questions only after a Scholar pathway is selected.
3. Collect research focus for every Scholar applicant, plus only the minimum evidence needed for the selected gate.
4. Never ask for classified information, clearance identifiers, export-controlled material, unpublished proprietary details, or protected personal data.
5. Save the complete intake in the existing Dynamics 365 Lead flow.
6. When an International R&D Scholar prospect explicitly opts in, send the onboarding guide after Dynamics accepts the application. Email failure must not turn an accepted application into a failed intake.
7. Keep the research-scientist communication staff-controlled. A scientist's contact information, name, affiliation, endorsement, or proposed role may not be represented without explicit permission.

## Email strategy

### International Scholar onboarding

The first drafted email becomes:

- the core of the public International R&D Scholar guide;
- an optional automated follow-up for applicants who select that designation and request guidance; and
- a consistent checklist covering thesis summary, home-advisor endorsement, CV/publications, relevant solicitation identifiers, proposed collaborators, and a specific ask.

The email points prospects to Grants.gov, SAM.gov, SBIR, and STTR, while requiring them to verify topic, deadline, eligibility, deliverables, and lead-organization rules. It expressly disclaims funding, employment, supervision, sponsorship, proposal participation, lab access, or institutional commitment.

### Research scientist protocol

The second drafted email becomes:

- a public explanation of the request standard;
- a reusable notice for scientists whose participation has been approved by staff; and
- the basis for future CRM-assisted outreach only after consent and role-specific review.

Scientists may advise, refer, endorse, or consider a proposal role, but are never obligated. No scholar may list a person or organization without explicit permission.

## Governance, measurement, and follow-through

- Review designation and standing periodically against integrity, mission alignment, service, collaboration, communication, leadership, publications/innovation, and mentoring.
- Track application starts, completion rate, designation mix, onboarding-email opt-in/delivery, complete outreach packages, scientist response rate, permission status, and funded or otherwise validated collaborations.
- Audit public claims quarterly so the site never implies employment, sponsorship, security clearance, restricted access, admission, funding, or automatic advancement.
- Before production activation, deploy the updated Logic App with an authorized Office 365 Outlook connection, verify sender identity and reply handling, then submit one test International Scholar application and one non-Scholar control application.

## Delivery phases

- **Phase 1 — Website and intake:** program pages, navigation, homepage/fellowship discovery, conditional application fields, Dynamics description mapping, sitemap, and accessibility checks.
- **Phase 2 — Email activation:** provision the Outlook connector, approve sender and final copy, deploy, and confirm opt-in-only delivery in Logic App run history.
- **Phase 3 — Operations:** define reviewer rubrics, standing-review cadence, scientist permission records, reusable CRM views, and reporting.
- **Phase 4 — Evidence:** publish anonymized outcomes and refine pathways based on conversion, collaboration quality, and mission impact rather than volume alone.
