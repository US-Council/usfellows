#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const failures = [];
const redirectPages = new Set(["doorways.html", "journey.html", "partners.html", "pathways.html", "research-scientist-network.html"]);

if (htmlFiles.length !== 59) {
  failures.push(`Expected 59 root HTML pages, found ${htmlFiles.length}.`);
}

function localTarget(fromFile, reference) {
  const clean = reference.split("#")[0].split("?")[0];
  if (!clean || /^(?:[a-z]+:|#|\/\/)/i.test(clean)) return null;
  const relative = clean.startsWith("/") ? clean.slice(1) : path.join(path.dirname(fromFile), clean);
  return path.normalize(relative);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const titleCount = (source.match(/<title>/g) ?? []).length;
  const h1Count = (source.match(/<h1(?:\s|>)/g) ?? []).length;

  if (titleCount !== 1) failures.push(`${file}: expected one title, found ${titleCount}.`);
  if (!redirectPages.has(file) && h1Count !== 1) failures.push(`${file}: expected one h1, found ${h1Count}.`);
  if (!source.includes('rel="canonical"')) failures.push(`${file}: missing canonical URL.`);
  if (!redirectPages.has(file) && !source.includes('name="description"')) failures.push(`${file}: missing description.`);
  if (/FontAwesome|fonts\.googleapis|kingster-shell|icons\.css/.test(source)) {
    failures.push(`${file}: contains a retired asset reference.`);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !fs.existsSync(path.join(root, target))) {
      failures.push(`${file}: missing local target ${match[1]}.`);
    }
  }
}

const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
if (!robots.includes("sitemap-index.xml")) failures.push("robots.txt does not reference the generated sitemap index.");
for (const required of ["CNAME", ".nojekyll", "sitemap-index.xml", "assets/favicon.svg", "assets/img_hero_campus.jpg", "visual-sitemap/compact.html", "visual-sitemap/manifest.json", "visual-sitemap/meta.json"]) {
  if (!fs.existsSync(path.join(root, required))) failures.push(`Missing required build artifact: ${required}.`);
}

const visualManifest = JSON.parse(fs.readFileSync(path.join(root, "visual-sitemap/manifest.json"), "utf8"));
const visualMetadata = JSON.parse(fs.readFileSync(path.join(root, "visual-sitemap/meta.json"), "utf8"));
if (visualManifest.length !== 59 || visualMetadata.pageCount !== 59) failures.push("Visual sitemap does not contain all 59 pages.");
if (visualMetadata.base !== "https://usfellows.org/") failures.push("Visual sitemap was not generated from the live site.");
for (const entry of visualManifest) {
  if (!entry.ok || !fs.existsSync(path.join(root, "visual-sitemap", entry.image))) {
    failures.push(`Missing visual sitemap capture for ${entry.file}.`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, metadata, local links, and deployment assets.`);
