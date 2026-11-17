#!/usr/bin/env node

/* Read-only browser release checks for the deployed static US Fellows site. */
import { chromium, firefox, webkit, devices, request } from "playwright";

const BASE_URL = new URL(process.env.BASE_URL || "https://usfellows.org/");
const EXPECTED_CANONICAL_ORIGIN = process.env.EXPECTED_CANONICAL_ORIGIN || "https://usfellows.org";
const TIMEOUT = Number(process.env.QA_TIMEOUT_MS || 30_000);
const FORBIDDEN_PUBLIC_TERMS = /trustora|worldenterprisegroup|usiva|tao\s+learning|curiosity\s+research\s+corporation|instar\s+lab/i;
const LEGACY_ROUTES = {
  "/journey.html": "/society.html",
  "/pathways.html": "/fellowships.html",
  "/doorways.html": "/fellows.html",
  "/partners.html": "/host-institutions.html",
  "/research-scientist-network.html": "/scholars-network.html",
};
const BROWSER_ROUTES = [
  "/",
  "/mission.html",
  "/fellowships.html",
  "/scholars.html",
  "/international-rd-scholars.html",
  "/host-institutions.html",
  "/journal.html",
  "/apply.html",
];

// Desktop widths swept for horizontal overflow on top of the 1440 runs (#5, after !13).
const DESKTOP_OVERFLOW_WIDTHS = [1024, 1280, 1920];
const DESKTOP_OVERFLOW_HEIGHT = 1000;

const failures = [];
const checks = [];
const vitalSamples = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function absoluteUrl(route) {
  return new URL(route, BASE_URL).href;
}

function routePath(value) {
  const url = new URL(value, BASE_URL);
  return `${url.pathname}${url.search}` || "/";
}

function canonicalRoute(route) {
  return new URL(route, EXPECTED_CANONICAL_ORIGIN).href;
}

function overflowMessage(name, route, state) {
  return `${name} ${route}: horizontal overflow at ${state.viewport}px wide: scrollWidth ${state.width}px > ${state.viewport}px (+${state.width - state.viewport}px)`;
}

function isManagedCloudflareRum(requestEvent) {
  const url = new URL(requestEvent.url());
  return requestEvent.method() === "POST" &&
    url.origin === BASE_URL.origin &&
    url.pathname === "/cdn-cgi/rum";
}

async function installVitals(context) {
  await context.addInitScript(() => {
    const vitals = { lcp: 0, cls: 0, inp: 0 };
    window.__usfVitals = vitals;
    if (!window.PerformanceObserver) return;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) vitals.lcp = Math.max(vitals.lcp, entry.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) vitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) vitals.inp = Math.max(vitals.inp, entry.duration);
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    } catch {}
  });
}

async function getSitemap(api) {
  const response = await api.get(absoluteUrl("/sitemap.xml"), { timeout: TIMEOUT });
  check(response.status() === 200, `sitemap.xml returned ${response.status()}`);
  const xml = await response.text();
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => routePath(match[1]));
  check(routes.length > 0, "sitemap.xml contains no loc entries");
  check(new Set(routes).size === routes.length, "sitemap.xml contains duplicate routes");
  check(routes.includes("/"), "sitemap.xml does not contain the homepage");
  return routes;
}

async function validateHttpRoutes(api, routes) {
  for (const route of routes) {
    const response = await api.get(absoluteUrl(route), { timeout: TIMEOUT });
    const body = await response.text();
    const contentType = response.headers()["content-type"] || "";
    check(response.status() === 200, `${route}: expected HTTP 200, got ${response.status()}`);
    check(/text\/html/i.test(contentType), `${route}: expected HTML content type, got ${contentType}`);
    check((body.match(/<main\b/gi) || []).length === 1, `${route}: expected one main element`);
    check((body.match(/<h1\b/gi) || []).length === 1, `${route}: expected one h1`);
    check(/class=["'][^"']*\bskip-link\b/i.test(body), `${route}: missing skip link`);
    check(!FORBIDDEN_PUBLIC_TERMS.test(body), `${route}: contains a retired or cross-company public term`);

    const canonical = body.match(/<link\b(?=[^>]*\brel=["'][^"']*\bcanonical\b)[^>]*\bhref=["']([^"']+)["']/i);
    check(canonical && canonical[1] === canonicalRoute(route), `${route}: canonical does not match the expected public URL`);
  }
}

async function validateLegacyRoutes(api) {
  for (const [route, destination] of Object.entries(LEGACY_ROUTES)) {
    const response = await api.get(absoluteUrl(route), { timeout: TIMEOUT });
    const body = await response.text();
    const refreshTarget = body.match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*>/i);
    const target = body.match(/\burl=([^\s"'<>]+)/i);
    check(response.status() === 200, `${route}: legacy redirect returned ${response.status()}`);
    check(refreshTarget, `${route}: missing meta-refresh redirect`);
    check(target && routePath(new URL(target[1], absoluteUrl(route))) === destination, `${route}: redirect target is not ${destination}`);
    check(!FORBIDDEN_PUBLIC_TERMS.test(body), `${route}: contains a retired or cross-company public term`);
  }
}

async function runApplicationFlow(page, label) {
  const requiredValues = {
    "#first-name": "Release",
    "#last-name": "QA",
    "#email": "release-qa@example.invalid",
    "#city": "Washington",
    "#state": "DC",
    "#country": "United States",
  };
  for (const [selector, value] of Object.entries(requiredValues)) await page.locator(selector).fill(value);
  await page.locator("#application-next").click();
  check(await page.locator("#application-step-name").textContent() === "Program direction", `${label}: application wizard did not advance without submission`);
  await page.locator("#program").selectOption({ label: "International R&D Scholar" });
  check(await page.locator('[data-scholar-fields]:not([hidden])').count() === 2, `${label}: International R&D Scholar fields did not appear`);
  check(await page.locator("#application-submit").isHidden(), `${label}: submit button became visible before the final step`);
}

async function runBrowser(name, browserType, options, routes, runMobileFlow) {
  let browser;
  try {
    browser = await browserType.launch({ headless: true });
    const context = await browser.newContext(options);
    if (name === "chromium-mobile") await installVitals(context);
    const routeSet = routes;
    let menuChecked = false;
    let applicationChecked = false;
    for (const route of routeSet) {
      const page = await context.newPage();
      const pageFailures = [];
      page.on("console", (message) => {
        if (message.type() === "error") pageFailures.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => pageFailures.push(`pageerror: ${error.message}`));
      page.on("requestfailed", (requestEvent) => {
        const failedUrl = new URL(requestEvent.url());
        if (failedUrl.origin === BASE_URL.origin) pageFailures.push(`requestfailed: ${requestEvent.url()} (${requestEvent.failure()?.errorText || "unknown"})`);
      });
      page.on("request", (requestEvent) => {
        if (!["GET", "HEAD"].includes(requestEvent.method()) && !isManagedCloudflareRum(requestEvent)) {
          pageFailures.push(`non-read-only request: ${requestEvent.method()} ${requestEvent.url()}`);
        }
      });

      try {
        const response = await page.goto(absoluteUrl(route), { waitUntil: "domcontentloaded", timeout: TIMEOUT });
        check(response?.status() === 200, `${name} ${route}: expected HTTP 200, got ${response?.status()}`);
        await page.waitForTimeout(250);
        check(await page.locator("main#main").count() === 1, `${name} ${route}: missing main`);
        check(await page.locator("h1").count() === 1, `${name} ${route}: expected one h1`);
        check(await page.locator("a.skip-link").count() === 1, `${name} ${route}: missing skip link`);
        check(await page.locator(".footer-disclaimer").count() === 1, `${name} ${route}: shared footer disclaimer did not render`);
        const pageState = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          missingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
          bodyText: document.body.innerText,
        }));
        check(pageState.width <= pageState.viewport + 1, overflowMessage(name, route, pageState));
        check(pageState.missingAlt === 0, `${name} ${route}: image without alt text`);
        check(!FORBIDDEN_PUBLIC_TERMS.test(pageState.bodyText), `${name} ${route}: contains a retired or cross-company public term`);

        if (runMobileFlow && !menuChecked) {
          const toggle = page.locator(".menu-toggle");
          const panel = page.locator(".mobile-panel");
          await toggle.click();
          check(await panel.evaluate((element) => element.classList.contains("is-open")), `${name}: mobile menu did not open`);
          await page.keyboard.press("Escape");
          check(!(await panel.evaluate((element) => element.classList.contains("is-open"))), `${name}: mobile menu did not close on Escape`);
          check(await toggle.evaluate((element) => document.activeElement === element), `${name}: mobile menu did not restore focus`);
          menuChecked = true;
        }
        if (route === "/apply.html" && !applicationChecked) {
          await runApplicationFlow(page, name);
          applicationChecked = true;
        }
        if (name === "chromium-mobile" && BROWSER_ROUTES.includes(route)) {
          vitalSamples.push({ route, ...(await page.evaluate(() => window.__usfVitals || {})) });
        }
      } catch (error) {
        failures.push(`${name} ${route}: ${error.message}`);
      }
      for (const pageFailure of pageFailures) failures.push(`${name} ${route}: ${pageFailure}`);
      await page.close();
    }
    checks.push(`${name}: ${routeSet.length} route(s) at ${options.viewport.width}px`);
    await context.close();
  } catch (error) {
    failures.push(`${name}: browser setup failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

/* Loads each route once, resizes the viewport through every width and fails any width that scrolls sideways. */
async function runOverflowSweep(name, browserType, routes, widths) {
  let browser;
  try {
    browser = await browserType.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: widths[0], height: DESKTOP_OVERFLOW_HEIGHT } });
    for (const route of routes) {
      const page = await context.newPage();
      try {
        await page.setViewportSize({ width: widths[0], height: DESKTOP_OVERFLOW_HEIGHT });
        const response = await page.goto(absoluteUrl(route), { waitUntil: "load", timeout: TIMEOUT });
        check(response?.status() === 200, `${name} ${route}: expected HTTP 200, got ${response?.status()}`);
        for (const width of widths) {
          await page.setViewportSize({ width, height: DESKTOP_OVERFLOW_HEIGHT });
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const state = await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
          }));
          check(state.viewport === width, `${name} ${route}: viewport is ${state.viewport}px, expected ${width}px`);
          check(state.width <= state.viewport + 1, overflowMessage(name, route, state));
        }
      } catch (error) {
        failures.push(`${name} ${route}: ${error.message}`);
      }
      await page.close();
    }
    checks.push(`${name}: ${routes.length} route(s) at ${widths.join("/")}px`);
    await context.close();
  } catch (error) {
    failures.push(`${name}: browser setup failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  check(BASE_URL.protocol === "https:" || process.env.ALLOW_HTTP === "1", `BASE_URL must use HTTPS (got ${BASE_URL.href})`);
  const api = await request.newContext({ ignoreHTTPSErrors: false });
  try {
    const routes = await getSitemap(api);
    check(BROWSER_ROUTES.every((route) => routes.includes(route)), "browser smoke matrix contains a route not present in sitemap");
    await validateHttpRoutes(api, routes);
    await validateLegacyRoutes(api);

    const desktop = { viewport: { width: 1440, height: 1000 } };
    const mobileDevice = { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } };
    await runBrowser("chromium-desktop", chromium, desktop, routes, false);
    await runBrowser("firefox-desktop", firefox, desktop, BROWSER_ROUTES, false);
    await runBrowser("webkit-desktop", webkit, desktop, BROWSER_ROUTES, false);
    await runBrowser("chromium-mobile", chromium, mobileDevice, BROWSER_ROUTES, true);
    await runBrowser("webkit-mobile", webkit, mobileDevice, BROWSER_ROUTES, true);
    await runOverflowSweep("chromium-overflow", chromium, routes, DESKTOP_OVERFLOW_WIDTHS);
    await runOverflowSweep("firefox-overflow", firefox, BROWSER_ROUTES, DESKTOP_OVERFLOW_WIDTHS);
    await runOverflowSweep("webkit-overflow", webkit, BROWSER_ROUTES, DESKTOP_OVERFLOW_WIDTHS);
  } finally {
    await api.dispose();
  }

  for (const message of checks) console.log(`public-site-qa: ${message}`);
  for (const sample of vitalSamples) {
    console.log(
      `public-site-qa: vitals ${sample.route} LCP=${sample.lcp.toFixed(1)}ms CLS=${sample.cls.toFixed(3)} INP=${sample.inp ? `${sample.inp.toFixed(1)}ms` : "not-observed"}`,
    );
  }
  if (failures.length) {
    for (const failure of failures) console.error(`public-site-qa: ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(`public-site-qa: passed (${checks.length} browser/API checks)`);
}

main().catch((error) => {
  console.error(`public-site-qa: fatal: ${error.stack || error.message}`);
  process.exitCode = 1;
});
