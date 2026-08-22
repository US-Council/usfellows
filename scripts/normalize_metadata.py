#!/usr/bin/env python3
"""Apply the shared static-site metadata and hero preload policy."""

from __future__ import annotations

from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent
CRITICAL_CSS = (ROOT / "assets/css/critical.css").read_text(encoding="utf-8").strip()
LEGACY_STUBS = {
    "doorways.html",
    "journey.html",
    "partners.html",
    "pathways.html",
    "research-scientist-network.html",
}


class HeadMetadata(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title: list[str] = []
        self.metas: dict[tuple[str, str], str] = {}
        self.photo = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "title":
            self._in_title = True
        if tag.lower() == "meta":
            for key in ("name", "property"):
                if attrs_dict.get(key):
                    self.metas[(key, attrs_dict[key].lower())] = attrs_dict.get("content", "")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title.append(data)


def insert_after_tag(source: str, pattern: str, markup: str) -> str:
    match = re.search(pattern, source, flags=re.IGNORECASE)
    if not match:
        raise RuntimeError(f"metadata anchor not found: {pattern}")
    return source[: match.end()] + markup + source[match.end() :]


def add_meta(source: str, attribute: str, key: str, value: str, anchor: str) -> str:
    pattern = rf"<meta\b(?=[^>]*\b{re.escape(attribute)}=[\"']{re.escape(key)}[\"'])[^>]*>"
    if re.search(pattern, source, flags=re.IGNORECASE):
        return source
    markup = f'\n    <meta {attribute}="{escape(key)}" content="{escape(value, quote=True)}" />'
    return insert_after_tag(source, anchor, markup)


def defer_stylesheet(source: str, href: str) -> str:
    pattern = rf'<link\b(?=[^>]*\brel=["\']stylesheet["\'])(?=[^>]*\bhref=["\']{re.escape(href)}["\'])[^>]*>'
    match = re.search(pattern, source, flags=re.IGNORECASE)
    if not match or re.search(r"\bmedia=[\"']print[\"']", match.group(0), flags=re.IGNORECASE):
        return source
    replacement = (
        f'<link rel="preload" as="style" href="{href}" />\n'
        f'<link rel="stylesheet" href="{href}" media="print" '
        "onload=\"this.onload=null;this.media='all'\" />\n"
        f'<noscript><link rel="stylesheet" href="{href}" /></noscript>'
    )
    return source[: match.start()] + replacement + source[match.end() :]


def restore_stylesheet(source: str, href: str) -> str:
    pattern = rf'\s*<link\b(?=[^>]*\brel=["\']preload["\'])(?=[^>]*\bas=["\']style["\'])(?=[^>]*\bhref=["\']{re.escape(href)}["\'])[^>]*>\s*<link\b(?=[^>]*\brel=["\']stylesheet["\'])(?=[^>]*\bhref=["\']{re.escape(href)}["\'])[^>]*>\s*<noscript><link\b(?=[^>]*\brel=["\']stylesheet["\'])(?=[^>]*\bhref=["\']{re.escape(href)}["\'])[^>]*></noscript>'
    return re.sub(
        pattern,
        f'\n    <link rel="stylesheet" href="{href}" />',
        source,
        count=1,
        flags=re.IGNORECASE,
    )


def normalize_page(path: Path) -> bool:
    source = path.read_text(encoding="utf-8")
    parser = HeadMetadata()
    parser.feed(source)
    filename = path.name
    title = "".join(parser.title).strip()
    description = parser.metas.get(("name", "description"), "").strip()
    image = ""
    photo_match = re.search(r"--page-photo:\s*url\(([^)]+)\)", source, flags=re.IGNORECASE)
    if photo_match:
        image = photo_match.group(1).strip("\"'")

    if filename not in LEGACY_STUBS and (not title or not description or not image):
        raise RuntimeError(f"{filename}: missing title, description, or page photo")

    updated = source.replace("display=swap", "display=optional")
    for stylesheet in ("assets/css/fonts.css", "assets/css/icons.css"):
        updated = restore_stylesheet(updated, stylesheet)
    updated = defer_stylesheet(updated, "assets/css/site.css")
    updated = re.sub(
        r"<script\b(?=[^>]*\bsrc=[\"']assets/js/)[^>]*>",
        lambda match: match.group(0)
        if re.search(r"\bdefer(?:\s|=|>)", match.group(0), flags=re.IGNORECASE)
        else match.group(0).replace(">", " defer>"),
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r"\s*<link\b(?=[^>]*\brel=[\"']preconnect[\"'])(?=[^>]*\bhref=[\"']https://fonts\.(?:googleapis|gstatic)\.com[\"'])[^>]*>",
        "",
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r"\s*<link\b(?=[^>]*\bhref=[\"']https://fonts\.googleapis\.com/css2\?[^\"']+[\"'])(?=[^>]*\brel=[\"']stylesheet[\"'])[^>]*>",
        "",
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r"\s*<link\b(?=[^>]*\brel=[\"']preload[\"'])(?=[^>]*\bas=[\"']font[\"'])(?=[^>]*\bhref=[\"'][^\"']*source-sans-3-latin\.woff2[\"'])[^>]*>",
        "",
        updated,
        flags=re.IGNORECASE,
    )
    if filename in LEGACY_STUBS:
        updated = add_meta(
            updated,
            "name",
            "robots",
            "noindex,follow",
            r"<link\b(?=[^>]*\brel=[\"'][^\"']*\bcanonical\b)[^>]*>",
        )
    else:
        updated = re.sub(
            r'<style\b[^>]*data-critical=["\']us-fellows["\'][^>]*>.*?</style>',
            f'<style data-critical="us-fellows">{CRITICAL_CSS}</style>',
            updated,
            count=1,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if '<style data-critical="us-fellows">' not in updated:
            updated = insert_after_tag(
                updated,
                r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>",
                f'\n    <style data-critical="us-fellows">{CRITICAL_CSS}</style>',
            )
        if "assets/css/fonts.css" not in updated:
            updated = insert_after_tag(
                updated,
                r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>",
                '\n    <link rel="stylesheet" href="assets/css/fonts.css" />',
            )
        if "cormorant-garamond-latin.woff2" not in updated:
            updated = insert_after_tag(
                updated,
                r"<link\b(?=[^>]*\bhref=[\"']assets/css/fonts\.css[\"'])[^>]*>",
                '\n    <link rel="preload" as="font" type="font/woff2" href="assets/fonts/web/cormorant-garamond-latin.woff2" crossorigin />',
            )
        updated = add_meta(
            updated,
            "property",
            "og:type",
            "website",
            r"<meta\b(?=[^>]*\bproperty=[\"']og:description[\"'])[^>]*>",
        )
        updated = add_meta(
            updated,
            "name",
            "twitter:title",
            title,
            r"<meta\b(?=[^>]*\bname=[\"']twitter:card[\"'])[^>]*>",
        )
        updated = add_meta(
            updated,
            "name",
            "twitter:description",
            description,
            r"<meta\b(?=[^>]*\bname=[\"']twitter:title[\"'])[^>]*>",
        )
        og_image = parser.metas.get(("property", "og:image"), "").strip()
        if not og_image:
            raise RuntimeError(f"{filename}: missing og:image")
        updated = add_meta(
            updated,
            "name",
            "twitter:image",
            og_image,
            r"<meta\b(?=[^>]*\bname=[\"']twitter:description[\"'])[^>]*>",
        )
        preload_pattern = rf"""<link\b(?=[^>]*\brel=[\"']preload[\"'])(?=[^>]*\bas=[\"']image[\"'])(?=[^>]*\bhref=[\"']{re.escape(image)}[\"'])[^>]*>"""
        if not re.search(preload_pattern, updated, flags=re.IGNORECASE):
            updated = insert_after_tag(
                updated,
                r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>",
                f'\n    <link rel="preload" as="image" href="{escape(image, quote=True)}" fetchpriority="high" />',
            )

    if updated != source:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for path in sorted(ROOT.glob("*.html")):
        changed += normalize_page(path)

    icons = ROOT / "assets/css/icons.css"
    icon_source = icons.read_text(encoding="utf-8")
    icon_updated = re.sub(
        r"(font-weight\s*:\s*(?:normal|400)\s*;font-style\s*:\s*normal)(})",
        r"\1;font-display:optional\2",
        icon_source,
        flags=re.IGNORECASE,
    )
    if icon_updated != icon_source:
        icons.write_text(icon_updated, encoding="utf-8")
        changed += 1

    sitemap = ROOT / "sitemap.xml"
    sitemap_source = sitemap.read_text(encoding="utf-8")
    sitemap_updated = re.sub(
        r"(<url><loc>[^<]+</loc>)(?!<lastmod>)",
        r"\1<lastmod>2026-08-22</lastmod>",
        sitemap_source,
    )
    if sitemap_updated != sitemap_source:
        sitemap.write_text(sitemap_updated, encoding="utf-8")
        changed += 1

    print(f"normalized {changed} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
