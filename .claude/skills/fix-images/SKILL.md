---
name: fix-images
description: Restore and curate photos across all site pages using AI-generated imagery
---

# Photo Restoration Task (from NOTES.md)

Previous iterations of the site had photos that were removed as "too repetitive or off-key." The preference is to bring photos back — curated better if possible, or just restored if curation is too complex.

## Approach

1. **Review IMAGE-MANIFEST.md** — check what image guidelines and inventory exist
2. **Audit each page** — identify where photos should appear (hero, content bands, etc.)
3. **Generate per-page photos** using AI (hm CLI) — unique imagery matched to each page's content and theme
4. **Replace the single shared hero** (`assets/img_hero_campus.jpg`) with per-page hero images
5. **Wire into HTML** — add `<img>` tags with proper alt text, responsive sizing, lazy loading
6. **Commit and push** after each logical batch

## Design Constraints

- Preserve the Kingster template layout — don't break the visual rhythm
- Navy/gold/white/red palette — photos should complement this
- Keep file sizes reasonable (compress JPGs, use WebP if appropriate)
- Every image needs descriptive alt text for accessibility
- Don't fabricate — photos should be representational (campus, collaboration, ceremony, civic spaces) not specific real people/locations
