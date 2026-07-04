#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const failures = [];
const redirectPages = new Set(["doorways.html", "journey.html", "partners.html", "pathways.html"]);

if (htmlFiles.length !== 50) {
  failures.push(`Expected 50 root HTML pages, found ${htmlFiles.length}.`);
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
for (const required of ["CNAME", ".nojekyll", "sitemap-index.xml", "assets/favicon.svg", "assets/img_hero_campus.jpg"]) {
  if (!fs.existsSync(path.join(root, required))) failures.push(`Missing required build artifact: ${required}.`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, metadata, local links, and deployment assets.`);
