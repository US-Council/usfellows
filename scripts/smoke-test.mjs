#!/usr/bin/env node

import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL ?? "http://127.0.0.1:4321";
const executableCandidates = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);
const executablePath = executableCandidates.find((candidate) => fs.existsSync(candidate));
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const failures = [];

async function inspect(pathname, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(`${base}/${pathname}`, { waitUntil: "networkidle" });
  if (!response?.ok()) failures.push(`${pathname}: HTTP ${response?.status() ?? "no response"}.`);
  if (errors.length) failures.push(`${pathname}: browser errors: ${errors.join(" | ")}`);
  if (await page.locator("h1").count() !== 1) failures.push(`${pathname}: expected one h1.`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) failures.push(`${pathname}: horizontal overflow at ${viewport.width}px.`);

  if (viewport.width < 760) {
    await page.locator(".menu-toggle").click();
    if (!(await page.locator(".mobile-panel").evaluate((element) => element.classList.contains("is-open")))) {
      failures.push(`${pathname}: mobile navigation did not open.`);
    }
    await page.locator(".mobile-close").click();
  }

  await context.close();
}

for (const pathname of ["index.html", "fellowships.html", "scholars.html", "scholars-network.html", "apply.html"]) {
  await inspect(pathname, { width: 1440, height: 1000 });
  await inspect(pathname, { width: 390, height: 844 });
}

const scholarRoutes = [
  "international-rd-scholars.html",
  "resident-rd-scholar.html",
  "trusted-rd-scholar.html",
  "principal-rd-scholar.html",
  "distinguished-rd-scholar.html",
  "scholar-standards.html",
  "scholars-network.html"
];

const scholarContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const scholarPage = await scholarContext.newPage();
await scholarPage.goto(`${base}/scholars.html`, { waitUntil: "networkidle" });
const desktopScholarRoutes = await scholarPage.locator(".desktop-nav .dropdown-group .subdropdown > li > a").evaluateAll((links) =>
  links.map((link) => link.getAttribute("href"))
);
if (JSON.stringify(desktopScholarRoutes) !== JSON.stringify(scholarRoutes)) {
  failures.push(`Scholar navigation hierarchy is incorrect: ${desktopScholarRoutes.join(", ")}.`);
}

await scholarPage.goto(`${base}/apply.html?program=International%20R%26D%20Scholar`, { waitUntil: "networkidle" });
if (await scholarPage.locator("#program").inputValue() !== "International R&D Scholar") {
  failures.push("Application did not honor the Scholar program query parameter.");
}
if (await scholarPage.locator('[data-scholar-for="International R&D Scholar"]').evaluate((panel) => panel.hidden)) {
  failures.push("International Scholar application fields were not revealed.");
}
if (!(await scholarPage.locator('[data-scholar-for="Trusted R&D Scholar"] input').first().isDisabled())) {
  failures.push("Inactive Scholar designation fields were not disabled.");
}

await scholarPage.goto(`${base}/research-scientist-network.html`);
await scholarPage.waitForURL("**/scholars-network.html");
await scholarContext.close();

await browser.close();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Browser smoke tests passed at desktop and mobile widths.");
