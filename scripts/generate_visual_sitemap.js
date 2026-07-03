#!/usr/bin/env node

/**
 * Generate a numbered screenshot grid for every root-level HTML page.
 *
 * Usage:
 *   node scripts/generate_visual_sitemap.js http://127.0.0.1:8000 \
 *     --out=visual-sitemap
 *
 * Requires either `playwright` or `playwright-core`. Set CHROME_PATH when the
 * browser executable is not available at one of the common system paths.
 */

const fs = require('fs');
const path = require('path');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (_) {
    return require('playwright-core');
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const base = args.find((arg) => !arg.startsWith('--'));
  if (!base) {
    console.error('Usage: node scripts/generate_visual_sitemap.js <url> [options]');
    process.exit(1);
  }

  const option = (name, fallback) => {
    const match = args.find((arg) => arg.startsWith(`--${name}=`));
    return match ? match.slice(name.length + 3) : fallback;
  };

  return {
    base: base.endsWith('/') ? base : `${base}/`,
    concurrency: Number.parseInt(option('concurrency', '4'), 10),
    out: path.resolve(option('out', 'visual-sitemap')),
    root: path.resolve(option('root', '.')),
    width: Number.parseInt(option('width', '1280'), 10),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function textContent(value) {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getPageInventory(root) {
  const files = fs.readdirSync(root)
    .filter((file) => file.endsWith('.html') && fs.statSync(path.join(root, file)).isFile());

  const sitemapPath = path.join(root, 'sitemap.xml');
  const sitemapFiles = fs.existsSync(sitemapPath)
    ? [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map((match) => {
        const pathname = new URL(match[1]).pathname;
        return pathname === '/' ? 'index.html' : decodeURIComponent(pathname.replace(/^\//, ''));
      })
      .filter((file) => files.includes(file))
    : [];

  const ordered = [...new Set(sitemapFiles)];
  const extras = files.filter((file) => !ordered.includes(file)).sort((a, b) => a.localeCompare(b));

  return [...ordered, ...extras].map((file, index) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const redirectMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*?url=([^"';>]+)["']/i);

    return {
      file,
      number: index + 1,
      redirect: redirectMatch ? redirectMatch[1].trim() : null,
      title: titleMatch ? textContent(titleMatch[1]) : file,
    };
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function safeSlug(file) {
  return file.replace(/\.html$/i, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
}

async function capturePages(inventory, options) {
  const { chromium } = loadPlaywright();
  const executablePath = findChrome();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const shotDir = path.join(options.out, 'shots');
  fs.mkdirSync(shotDir, { recursive: true });

  const digits = String(inventory.length).length;
  const results = new Array(inventory.length);
  let cursor = 0;

  async function worker() {
    const context = await browser.newContext({
      colorScheme: 'light',
      reducedMotion: 'reduce',
      viewport: { width: options.width, height: 900 },
    });
    const page = await context.newPage();

    while (cursor < inventory.length) {
      const index = cursor++;
      const entry = inventory[index];
      const prefix = String(entry.number).padStart(digits, '0');
      const outputName = `${prefix}-${safeSlug(entry.file)}.jpg`;
      const outputPath = path.join(shotDir, outputName);
      const sourcePath = entry.file === 'index.html' ? '' : entry.file;
      const url = new URL(sourcePath, options.base).toString();
      // Zero-delay meta refresh pages can destroy Playwright's execution
      // context mid-capture. Their destination is the page a visitor sees.
      const captureUrl = new URL(entry.redirect || sourcePath, options.base).toString();

      try {
        await page.goto(captureUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(async () => {
          if (document.fonts?.ready) await document.fonts.ready;
          await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
        });
        await page.screenshot({
          animations: 'disabled',
          fullPage: true,
          path: outputPath,
          quality: 78,
          type: 'jpeg',
        });
        results[index] = { ...entry, captureUrl, image: `shots/${outputName}`, ok: true, url };
        console.log(`[${prefix}/${inventory.length}] ${entry.file}`);
      } catch (error) {
        results[index] = { ...entry, captureUrl, error: error.message, image: null, ok: false, url };
        console.warn(`[${prefix}/${inventory.length}] FAILED ${entry.file}: ${error.message}`);
      }
    }

    await context.close();
  }

  await Promise.all(Array.from(
    { length: Math.max(1, Math.min(options.concurrency, inventory.length)) },
    () => worker(),
  ));
  await browser.close();
  return results;
}

function buildHtml(results, base) {
  const digits = String(results.length).length;
  const successful = results.filter((result) => result.ok).length;
  const redirectCount = results.filter((result) => result.redirect).length;
  const generatedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());

  const directory = results.map((result) => {
    const number = String(result.number).padStart(digits, '0');
    return `<li><a href="#page-${number}"><span>${number}</span>${escapeHtml(result.file)}</a></li>`;
  }).join('\n');

  const cards = results.map((result) => {
    const number = String(result.number).padStart(digits, '0');
    const redirect = result.redirect
      ? `<div class="redirect">Legacy redirect &rarr; ${escapeHtml(result.redirect)}</div>`
      : '';
    const media = result.ok
      ? `<a class="image-link" href="${escapeHtml(result.image)}" target="_blank"><img src="${escapeHtml(result.image)}" loading="lazy" alt="Screenshot of ${escapeHtml(result.file)}"></a>`
      : `<div class="error">Screenshot failed<br>${escapeHtml(result.error || 'Unknown error')}</div>`;

    return `<article class="card" id="page-${number}">
      <div class="number">${number}</div>
      ${media}
      <div class="caption">
        <div class="filename">${escapeHtml(result.file)}</div>
        <div class="title">${escapeHtml(result.title)}</div>
        ${redirect}
      </div>
    </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Numbered Visual Sitemap | US Fellows</title>
<style>
  :root { color-scheme: light; --ink: #17212b; --muted: #66717d; --line: #d8dde3; --paper: #fff; --accent: #9d3026; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: #eef1f4; color: var(--ink); font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  header { padding: 32px clamp(20px, 4vw, 64px) 24px; background: var(--paper); border-bottom: 1px solid var(--line); }
  h1 { margin: 0 0 6px; font-family: Georgia, serif; font-size: clamp(28px, 4vw, 44px); font-weight: 500; }
  .meta { margin: 0; color: var(--muted); }
  .summary { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 16px; font-weight: 600; }
  .directory-wrap { padding: 24px clamp(20px, 4vw, 64px); background: #f8f9fa; border-bottom: 1px solid var(--line); }
  .directory-wrap h2 { margin: 0 0 12px; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
  .directory { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 5px 20px; margin: 0; padding: 0; list-style: none; }
  .directory a { display: flex; gap: 8px; color: var(--ink); text-decoration: none; }
  .directory a:hover { color: var(--accent); text-decoration: underline; }
  .directory span { flex: 0 0 auto; color: var(--accent); font-variant-numeric: tabular-nums; font-weight: 800; }
  main { padding: 24px clamp(20px, 4vw, 64px) 64px; }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: start; gap: 18px; }
  .card { position: relative; min-width: 0; overflow: hidden; background: var(--paper); border: 1px solid #cbd1d8; border-radius: 8px; box-shadow: 0 2px 8px rgb(28 39 49 / 8%); scroll-margin-top: 16px; }
  .image-link { display: block; background: #dfe3e7; }
  .image-link img { display: block; width: 100%; height: auto; }
  .number { position: absolute; z-index: 1; top: 10px; left: 10px; min-width: 42px; padding: 6px 8px; border: 2px solid #fff; border-radius: 5px; background: var(--accent); color: #fff; box-shadow: 0 2px 7px rgb(0 0 0 / 28%); font-size: 16px; font-weight: 800; line-height: 1; text-align: center; font-variant-numeric: tabular-nums; }
  .caption { padding: 11px 12px 13px; border-top: 1px solid var(--line); }
  .filename { font-weight: 750; word-break: break-word; }
  .title { margin-top: 2px; color: var(--muted); font-size: 12px; }
  .redirect { margin-top: 7px; padding-top: 7px; border-top: 1px solid #eceff2; color: var(--accent); font-size: 11px; font-weight: 700; }
  .error { min-height: 180px; display: grid; place-content: center; padding: 20px; color: #9b1c1c; text-align: center; }
  @media (max-width: 1400px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  @media print { .directory-wrap { display: none; } .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } body { background: #fff; } .card { box-shadow: none; } }
</style>
</head>
<body>
  <header>
    <h1>US Fellows Visual Sitemap</h1>
    <p class="meta">Generated ${escapeHtml(generatedAt)} from ${escapeHtml(base)}</p>
    <div class="summary"><span>${results.length} numbered pages</span><span>${successful} screenshots captured</span><span>${redirectCount} legacy redirects</span></div>
  </header>
  <nav class="directory-wrap" aria-label="Page directory">
    <h2>Numbered page directory</h2>
    <ol class="directory">${directory}</ol>
  </nav>
  <main>
    <div class="grid">${cards}</div>
  </main>
</body>
</html>`;
}

(async () => {
  const options = parseArgs();
  const inventory = getPageInventory(options.root);
  if (!inventory.length) throw new Error(`No root-level HTML files found in ${options.root}`);

  fs.mkdirSync(options.out, { recursive: true });
  console.log(`Capturing ${inventory.length} pages from ${options.base}`);
  const results = await capturePages(inventory, options);
  fs.writeFileSync(path.join(options.out, 'index.html'), buildHtml(results, options.base));
  fs.writeFileSync(path.join(options.out, 'manifest.json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Visual sitemap written to ${path.join(options.out, 'index.html')}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
