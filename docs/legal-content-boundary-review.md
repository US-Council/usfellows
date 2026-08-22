# Public content boundary review

Review date: 2026-08-22
Repository: `US-Council/usfellows`
Public property: `https://usfellows.org`

This record is a content inventory and release control. It is not legal advice
and it is not a legal or compliance sign-off.

## Current public scope

The current site presents US Fellows as a national civic fellowship society.
The root publication contains 59 HTML files, of which 54 are substantive pages
listed in `sitemap.xml`. The five historical routes below remain as lightweight
redirect stubs and are not current content pages:

| Historical route | Current destination |
| --- | --- |
| `journey.html` | `society.html` |
| `pathways.html` | `fellowships.html` |
| `doorways.html` | `fellows.html` |
| `partners.html` | `host-institutions.html` |
| `research-scientist-network.html` | `scholars-network.html` |

The public artifact contains no OPT or J-1 process guidance, unpaid-placement
framing, or visa-paperwork instructions. International and immigration-related
references that remain are mission or participation context, accompanied by
boundaries such as the statement that recognition does not confer employment,
visa sponsorship, or other authority.

## Shared boundary

`assets/js/kingster-shell.js` adds the same visible footer notice to every page:

> Public website information is general and is not legal, financial, medical,
> academic, career, or other professional advice.

The notice links to `terms-of-service.html`, whose site-purpose section carries
the full general disclaimer. Program-specific boundaries remain close to the
relevant content in `international-rd-scholars.html` and `scholars.html`.

## Release gate for future changes

Do not add procedural immigration, visa, work-authorization, or placement
content based on this inventory. If a future product decision requires such
content, the change must have an authorized legal/compliance reviewer, a named
scope and version, and written approval attached to the GitHub issue before it
is published. The approval must identify the exact pages and wording reviewed;
an automated audit cannot substitute for that approval.

## Disposition of issue #10

Issue #10 describes the retired immigration/pathway site and requests review of
content that is not shipped. Its original legal-signoff acceptance criteria do
not apply to the current public scope. The issue can therefore be closed as
superseded/not applicable, with this record and the live boundary evidence
linked in the closing comment. Closing it must not be described as legal
approval of the retired content or as approval for future immigration content.
