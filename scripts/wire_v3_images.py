#!/usr/bin/env python3
"""Wire v3 AVIF images into all HTML pages per the image-distribution-plan.csv.

Replaces --page-photo, --support-photo, --section-photo CSS variable URLs in each
page's <body style="..."> attribute, updates site.css root defaults, and updates
the index.html og:image meta tag.
"""

import re
import csv
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_PLAN = os.path.join(REPO_ROOT, "image-distribution-plan.csv")
SITE_CSS = os.path.join(REPO_ROOT, "assets", "css", "site.css")
INDEX_HTML = os.path.join(REPO_ROOT, "index.html")

def load_distribution_plan():
    """Load image-distribution-plan.csv, return dict mapping page->{slot: path}."""
    plan = {}
    with open(DIST_PLAN, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            page = row["page"].strip()
            if not page:
                continue
            slots = {}
            for slot in ("page_photo", "support_photo", "section_photo", "photo_4", "photo_5"):
                val = row.get(slot, "").strip()
                if val:
                    slots[slot] = val
            plan[page] = slots
    return plan


def build_v3_url(rel_path):
    """Convert a distribution-plan relative path (e.g. 'v3/image_0000.avif')
    to a full absolute URL for use in CSS: '/assets/photos/v3/image_0000.avif'"""
    if not rel_path:
        return None
    # Strip any leading 'v3/' or 'assets/photos/' prefix to normalize
    rel_path = rel_path.strip()
    if rel_path.startswith("v3/"):
        return f"/assets/photos/{rel_path}"
    elif rel_path.startswith("assets/"):
        return f"/{rel_path}"
    else:
        return f"/assets/photos/v3/{rel_path}"


def update_html_body_style(html_path, plan_entry):
    """Update the <body style="..."> attribute for one page."""
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Build replacement map for the three main slots
    replacements = {}
    for slot, css_var in [("page_photo", "--page-photo"),
                          ("support_photo", "--support-photo"),
                          ("section_photo", "--section-photo")]:
        if slot in plan_entry:
            new_url = build_v3_url(plan_entry[slot])
            if new_url:
                replacements[css_var] = new_url

    if not replacements:
        print(f"  SKIP {html_path}: no v3 mappings")
        return False

    # Replace each CSS variable URL in the body style attribute
    # Pattern: --page-photo:url('OLD_PATH')
    for css_var, new_url in replacements.items():
        # Match the current URL value - it can be single or double quoted, absolute or relative
        pattern = re.compile(
            rf'({css_var}:url\()[\'"]?[^\'")]+[\'"]?(\))'
        )
        content = pattern.sub(rf'\1{new_url}\2', content)

    if content == original:
        print(f"  NO CHANGE {html_path} (pattern may not match)")
        return False

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  UPDATED {html_path}")
    return True


def update_site_css():
    """Update the CSS root custom-property defaults in site.css."""
    with open(SITE_CSS, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Replace the root variable line for the three photo variables
    # Current: --page-photo:url("/img_hero_campus.jpg");--support-photo:url("/img_hero_campus.jpg")...
    # New: use the index page's v3 photos as defaults
    replacements = {
        "--page-photo": "url('/assets/photos/v3/image_0141.avif')",
        "--support-photo": "url('/assets/photos/v3/image_0142.avif')",
        "--section-photo": "url('/assets/photos/v3/image_0143.avif')",
    }

    for var_name, new_value in replacements.items():
        # Match the CSS variable and its url() value
        pattern = re.compile(
            rf'({var_name}:)url\(["\']?[^"\'\)]+["\']?\)'
        )
        content = pattern.sub(rf'\1{new_value}', content)

    if content == original:
        print("  NO CHANGE site.css")
        return False

    with open(SITE_CSS, "w", encoding="utf-8") as f:
        f.write(content)
    print("  UPDATED site.css")
    return True


def update_index_og_image():
    """Update the og:image meta tag in index.html to use a v3 image."""
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Replace the og:image content URL
    # From: content="https://usfellows.org/assets/img_hero_campus.jpg"
    # To: content="https://usfellows.org/assets/photos/v3/image_0141.avif"
    old_og = r'(content="https://usfellows\.org/)assets/img_hero_campus\.jpg(")'
    new_og = r'\1assets/photos/v3/image_0141.avif\2'

    content = re.sub(old_og, new_og, content)

    if content == original:
        print("  NO CHANGE index.html og:image")
        return False

    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(content)
    print("  UPDATED index.html og:image")
    return True


def main():
    print("Loading distribution plan...")
    plan = load_distribution_plan()
    print(f"  Found {len(plan)} pages in plan")

    # 1. Update HTML files
    print("\nUpdating HTML body style attributes...")
    html_updated = 0
    html_skipped = 0
    html_not_found = 0
    for page_name, slots in sorted(plan.items()):
        html_path = os.path.join(REPO_ROOT, f"{page_name}.html")
        if not os.path.exists(html_path):
            print(f"  FILE NOT FOUND: {html_path}")
            html_not_found += 1
            continue
        if update_html_body_style(html_path, slots):
            html_updated += 1
        else:
            html_skipped += 1

    print(f"  HTML updated: {html_updated}, skipped/unchanged: {html_skipped}, not found: {html_not_found}")

    # 2. Update site.css
    print("\nUpdating site.css root variables...")
    css_updated = update_site_css()

    # 3. Update index.html og:image
    print("\nUpdating index.html og:image...")
    og_updated = update_index_og_image()

    # Summary
    print("\n--- SUMMARY ---")
    print(f"HTML files updated: {html_updated}")
    print(f"site.css updated: {css_updated}")
    print(f"og:image updated: {og_updated}")

    return 0 if (html_updated > 0 or css_updated or og_updated) else 1


if __name__ == "__main__":
    sys.exit(main())
