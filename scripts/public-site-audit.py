#!/usr/bin/env python3
"""Run dependency-free checks against a static US Fellows artifact."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


TEXT_SUFFIXES = {".css", ".html", ".js", ".json", ".svg", ".txt", ".webmanifest", ".xml"}
SPECIAL_FILENAMES = {"robots.txt", "sitemap.xml"}
LEGACY_STUBS = {
    "doorways.html": "fellows.html",
    "journey.html": "society.html",
    "partners.html": "host-institutions.html",
    "pathways.html": "fellowships.html",
    "research-scientist-network.html": "scholars-network.html",
}
FORBIDDEN_TERMS = (
    ("Trustora", re.compile(r"trustora", re.IGNORECASE)),
    ("WorldEnterpriseGroup", re.compile(r"worldenterprisegroup", re.IGNORECASE)),
    ("USIVA", re.compile(r"usiva", re.IGNORECASE)),
    ("Tao Learning", re.compile(r"tao\s+learning", re.IGNORECASE)),
    (
        "Curiosity Research Corporation",
        re.compile(r"curiosity\s+research\s+corporation", re.IGNORECASE),
    ),
    ("INSTAR Lab", re.compile(r"instar\s+lab", re.IGNORECASE)),
)
SOCIAL_PROPERTIES = ("og:title", "og:description", "og:type", "og:url", "og:image")
TWITTER_PROPERTIES = ("twitter:card", "twitter:title", "twitter:description", "twitter:image")
JS_ATTRIBUTE_RE = re.compile(
    r"\b(?:href|src)\s*=\s*(?P<quote>[\"'])(?P<value>[^\"'<>{}$+\s]+)(?P=quote)",
    re.IGNORECASE,
)
MALFORMED_MAIN_RE = re.compile(r">{2,}\s*</main\b|>\s+>\s*</main\b", re.IGNORECASE)
SOURCE_TREE_EXCLUSIONS = {
    ".astro",
    ".claude",
    ".deepseek",
    ".git",
    ".github",
    ".playwright-mcp",
    "_site",
    "communications",
    "dist",
    "infrastructure",
    "node_modules",
    "public",
    "scripts",
}


class PageParser(HTMLParser):
    """Collect metadata, links, and visible text immediately before </main>."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str, int]] = []
        self.title_count = 0
        self.title_texts: list[str] = []
        self.description_count = 0
        self.description_values: list[str] = []
        self.canonical_count = 0
        self.canonical_values: list[str] = []
        self.h1_count = 0
        self.h1_texts: list[str] = []
        self.refresh = False
        self.robots: list[str] = []
        self.preloads: list[str] = []
        self.social: dict[str, list[str]] = {
            key: [] for key in SOCIAL_PROPERTIES + TWITTER_PROPERTIES
        }
        self.malformed_main = False
        self._capture_tag: str | None = None
        self._capture_parts: list[str] = []
        self._last_data: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attributes = {key.lower(): value or "" for key, value in attrs}
        line, _ = self.getpos()

        for attribute in ("href", "src"):
            if attribute in attributes:
                self.links.append((attribute, attributes[attribute], line))

        if tag == "title":
            self.title_count += 1
            if self._capture_tag is None:
                self._capture_tag = "title"
                self._capture_parts = []
        elif tag == "h1":
            self.h1_count += 1
            if self._capture_tag is None:
                self._capture_tag = "h1"
                self._capture_parts = []
        elif tag == "meta":
            name = attributes.get("name", "").lower()
            property_name = attributes.get("property", "").lower()
            content = attributes.get("content", "")
            if name == "description":
                self.description_count += 1
                self.description_values.append(content)
            if name == "robots":
                self.robots.append(content)
            if name in TWITTER_PROPERTIES:
                self.social[name].append(content)
            if attributes.get("http-equiv", "").lower() == "refresh":
                self.refresh = True
            if property_name in SOCIAL_PROPERTIES:
                self.social[property_name].append(content)
        elif tag == "link":
            rel = attributes.get("rel", "").lower().split()
            if "canonical" in rel:
                self.canonical_count += 1
                self.canonical_values.append(attributes.get("href", ""))
            if "preload" in rel and attributes.get("as", "").lower() == "image":
                self.preloads.append(attributes.get("href", ""))

        self._last_data = None

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == self._capture_tag:
            value = "".join(self._capture_parts).strip()
            if tag == "title":
                self.title_texts.append(value)
            else:
                self.h1_texts.append(value)
            self._capture_tag = None
            self._capture_parts = []
        if tag == "main" and self._last_data is not None and self._last_data.strip() == ">":
            self.malformed_main = True
        self._last_data = None

    def handle_data(self, data: str) -> None:
        self._last_data = data
        if self._capture_tag is not None:
            self._capture_parts.append(data)

    def handle_comment(self, data: str) -> None:
        self._last_data = None


def relative_path(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def artifact_files(root: Path) -> list[Path]:
    source_tree = (root / "scripts" / "expand_pages.py").is_file() and (root / "sitemap.xml").is_file()
    source_text_suffixes = {".css", ".html", ".js", ".svg"}
    return sorted(
        (
            path
            for path in root.rglob("*")
            if path.is_file()
            and not (
                source_tree
                and any(part in SOURCE_TREE_EXCLUSIONS for part in path.relative_to(root).parts[:-1])
            )
            and (
                path.name.lower() in SPECIAL_FILENAMES
                or path.suffix.lower() in (source_text_suffixes if source_tree else TEXT_SUFFIXES)
            )
        ),
        key=lambda path: path.as_posix(),
    )


def check_artifact_shape(root: Path) -> list[str]:
    """Keep a deploy artifact to the public root pages, metadata, and assets."""
    if (root / "scripts" / "expand_pages.py").is_file() and (root / "sitemap.xml").is_file():
        return []

    errors: list[str] = []
    allowed_root_files = {"CNAME", ".nojekyll", "robots.txt", "sitemap.xml"}
    for path in root.iterdir():
        if path.is_dir() and path.name != "assets":
            errors.append(f"unexpected directory in public artifact: {path.name}/")
        elif path.is_file() and path.name not in allowed_root_files and path.suffix.lower() != ".html":
            errors.append(f"unexpected root file in public artifact: {path.name}")
    if not (root / "assets").is_dir():
        errors.append("assets/ is missing from public artifact")
    return errors


def read_artifact_text(root: Path, paths: list[Path]) -> tuple[dict[Path, str], list[str]]:
    texts: dict[Path, str] = {}
    errors: list[str] = []
    for path in paths:
        try:
            texts[path] = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors.append(f"{relative_path(root, path)}: not valid UTF-8")
    return texts, errors


def line_number(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def is_within(root: Path, path: Path) -> bool:
    try:
        path.relative_to(root)
    except ValueError:
        return False
    return True


def resolve_local_reference(root: Path, source: Path, value: str) -> Path | None:
    value = value.strip()
    if not value or value.startswith("#"):
        return None
    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        return None
    raw_path = unquote(parts.path)
    if not raw_path:
        return source.resolve()
    if raw_path.startswith("/"):
        candidate = root / raw_path.lstrip("/")
    else:
        candidate = source.parent / raw_path
    candidate = candidate.resolve()
    if candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate


def check_links(root: Path, texts: dict[Path, str], parsers: dict[Path, PageParser]) -> list[str]:
    errors: list[str] = []
    reported: set[tuple[str, int, str, str]] = set()

    def check(
        path: Path,
        attribute: str,
        value: str,
        line: int,
        resolution_source: Path | None = None,
    ) -> None:
        value = value.strip()
        if not value or value.startswith("#"):
            return
        target = resolve_local_reference(root, resolution_source or path, value)
        if target is None:
            return
        if is_within(root.resolve(), target) and target.is_file():
            return
        key = (relative_path(root, path), line, attribute, value)
        if key in reported:
            return
        reported.add(key)
        errors.append(f"{key[0]}:{line}: broken local {attribute} reference {value}")

    for path, parser in parsers.items():
        for attribute, value, line in parser.links:
            check(path, attribute, value, line)

    for path, text in texts.items():
        if path.suffix.lower() != ".js":
            continue
        for match in JS_ATTRIBUTE_RE.finditer(text):
            check(
                path,
                match.group(0).split("=", 1)[0].strip(),
                match.group("value"),
                line_number(text, match.start()),
                root / "index.html",
            )
    return errors


def check_sitemap(root: Path, texts: dict[Path, str]) -> list[str]:
    path = root / "sitemap.xml"
    if not path.is_file() or path not in texts:
        return []
    errors: list[str] = []
    try:
        document = ET.fromstring(texts[path])
    except ET.ParseError as exc:
        return [f"sitemap.xml: malformed XML ({exc})"]

    for url_node in document:
        if url_node.tag.rsplit("}", 1)[-1] != "url":
            continue
        lastmods = [
            (child.text or "").strip()
            for child in url_node
            if child.tag.rsplit("}", 1)[-1] == "lastmod"
        ]
        if len(lastmods) != 1 or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmods[0]):
            errors.append("sitemap.xml: every URL needs one ISO date lastmod")

    for loc in document.iter():
        if loc.tag.rsplit("}", 1)[-1] != "loc":
            continue
        value = (loc.text or "").strip()
        parts = urlsplit(value)
        raw_path = unquote(parts.path)
        if parts.scheme and parts.scheme.lower() not in {"http", "https"}:
            target = None
        elif raw_path in {"", "/"}:
            target = (root / "index.html").resolve()
        else:
            target = (root / raw_path.lstrip("/")).resolve()
            if raw_path.endswith("/"):
                target = target / "index.html"
        if (
            target is None
            or not is_within(root.resolve(), target)
            or target.suffix.lower() != ".html"
            or not target.is_file()
        ):
            errors.append(f"sitemap.xml: URL does not map to an artifact HTML page {value}")
    return errors


def audit(root: Path) -> tuple[list[str], int]:
    errors = check_artifact_shape(root)
    paths = artifact_files(root)
    texts, read_errors = read_artifact_text(root, paths)
    errors.extend(read_errors)

    for path, text in texts.items():
        for label, pattern in FORBIDDEN_TERMS:
            match = pattern.search(text)
            if match:
                errors.append(
                    f"{relative_path(root, path)}:{line_number(text, match.start())}: forbidden public reference {label}"
                )

    html_paths = [path for path in paths if path.suffix.lower() == ".html" and path in texts]
    parsers: dict[Path, PageParser] = {}
    for path in html_paths:
        parser = PageParser()
        try:
            parser.feed(texts[path])
            parser.close()
        except Exception as exc:  # HTMLParser is permissive, but report malformed input cleanly.
            errors.append(f"{relative_path(root, path)}: HTML parse failed ({exc})")
        parsers[path] = parser
        if parser.malformed_main or MALFORMED_MAIN_RE.search(texts[path]):
            errors.append(f"{relative_path(root, path)}: malformed greater-than text before </main>")

        relative = relative_path(root, path)
        if relative in LEGACY_STUBS and parser.refresh:
            if parser.canonical_count != 1 or not any(parser.canonical_values):
                errors.append(f"{relative}: legacy stub needs one canonical link")
            if not any("noindex" in value.lower() for value in parser.robots):
                errors.append(f"{relative}: legacy stub needs noindex,follow")
            expected = LEGACY_STUBS[relative]
            if not any(
                attribute == "href"
                and urlsplit(value).path.lstrip("/") == expected
                for attribute, value, _ in parser.links
            ):
                errors.append(f"{relative}: legacy stub needs destination link {expected}")
            continue

        required = (
            ("title", parser.title_count, parser.title_texts),
            ("canonical", parser.canonical_count, parser.canonical_values),
            ("description", parser.description_count, parser.description_values),
            ("h1", parser.h1_count, parser.h1_texts),
        )
        for label, count, values in required:
            if count != 1 or not any(value.strip() for value in values):
                errors.append(f"{relative}: expected one non-empty {label} (found {count})")
        for key in SOCIAL_PROPERTIES + TWITTER_PROPERTIES:
            values = parser.social[key]
            if len(values) != 1 or not any(value.strip() for value in values):
                errors.append(f"{relative}: expected one non-empty {key} (found {len(values)})")
        if parser.social["og:type"] != ["website"]:
            errors.append(f"{relative}: og:type must be website")
        photo_match = re.search(r"--page-photo:\s*url\(([^)]+)\)", texts[path], re.IGNORECASE)
        if photo_match:
            expected_photo = photo_match.group(1).strip("\"'")
            if expected_photo not in parser.preloads:
                errors.append(f"{relative}: above-fold page photo is not preloaded")

    errors.extend(check_links(root, texts, parsers))
    errors.extend(check_sitemap(root, texts))
    return errors, len(html_paths)


def main(argv: list[str] | None = None) -> int:
    argument_parser = argparse.ArgumentParser(description=__doc__)
    argument_parser.add_argument("--root", default=".", type=Path, help="artifact root (default: .)")
    args = argument_parser.parse_args(argv)
    root = args.root.resolve()
    if not root.is_dir():
        print(f"public site audit: artifact root is not a directory: {args.root}", file=sys.stderr)
        return 2

    errors, html_count = audit(root)
    if errors:
        for error in errors:
            print(f"public-site-audit: {error}", file=sys.stderr)
        print(f"public-site-audit: failed with {len(errors)} issue(s)", file=sys.stderr)
        return 1
    print(f"public-site-audit: passed ({html_count} HTML pages checked)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
