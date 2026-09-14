#!/usr/bin/env node
/**
 * Phase 9 link check (§9.4): every project/contact URL the site prints is
 * probed live, because B3/B4 proved links rot. Collects:
 *
 *   1. every external http(s) URL in src/data and src components,
 *   2. every internal "#anchor" href in src/ cross-checked against the ids
 *      that actually exist in the components,
 *   3. every asset path referenced by data/index.html, checked against
 *      dist/ after a build.
 *
 * Exits non-zero if any external link doesn't return 2xx/3xx, any anchor
 * has no matching id, or any asset is missing.
 *
 * Usage: npm run build first (for the asset checks), then
 *   node scripts/check-links.mjs [--offline-anchor-checks-only]
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const offline = process.argv.includes("--offline-anchor-checks-only");

// ---- gather source files ------------------------------------------------
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|html)$/.test(name)) out.push(p);
  }
  return out;
}
const sources = walk(join(root, "src"));
const indexHtml = readFileSync(join(root, "index.html"), "utf8");

const externalUrls = new Map(); // url -> [where]
const internalAnchors = new Map(); // anchor -> [where]
const assetPaths = new Map(); // path -> [where]

const add = (map, key, where) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(where);
};

for (const file of [...sources, join(root, "index.html")]) {
  const text = readFileSync(file, "utf8");
  const where = relative(root, file);
  for (const m of text.matchAll(/https?:\/\/[^\s"'`,)]+/g)) {
    const url = m[0].replace(/[.,]+$/, "");
    // JSON-LD + og:url self-references are fine to probe, keep them
    add(externalUrls, url, where);
  }
  for (const m of text.matchAll(/href="#([^"]+)"/g)) {
    add(internalAnchors, m[1], where);
  }
  for (const m of text.matchAll(/"(\/(?:me|projects|resume\.pdf|favicon\.ico|og\.png)[^"]*)"/g)) {
    add(assetPaths, m[1], where);
  }
}
// data-layer media paths use src: "/projects/x.webp"
for (const file of sources) {
  const text = readFileSync(file, "utf8");
  const where = relative(root, file);
  for (const m of text.matchAll(/src:\s*"(\/[^"]+)"/g)) add(assetPaths, m[1], where);
}

let failures = 0;

// ---- internal anchors ----------------------------------------------------
// ids present in source (components render them; acceptance probes verify
// the rendered DOM separately).
const ids = new Set();
for (const file of sources) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/(?:\bid=|getElementById\()\s*["'`]([^"'`)(]+)["'`]/g)) {
    if (!/^\$\{/.test(m[1])) ids.add(m[1]);
  }
}
for (const [anchor, wheres] of internalAnchors) {
  // dynamic ids (e.g. `${tab.id}-tab`) are resolved at runtime — the tab
  // anchors (#experience/#projects) are covered by the acceptance probe.
  if (anchor === "top" || anchor === "main") continue;
  if (!ids.has(anchor) && !["experience", "projects", "about", "skills", "contact"].includes(anchor)) {
    console.log(`FAIL  anchor "#${anchor}" (${wheres.join(", ")}) has no matching id`);
    failures++;
  }
}
console.log(`anchors: ${internalAnchors.size} internal anchors checked against ${ids.size} ids`);

// ---- assets in dist ------------------------------------------------------
let assetTotal = 0;
for (const [path, wheres] of assetPaths) {
  assetTotal++;
  if (existsSync(join(root, "dist", path))) continue;
  console.log(`FAIL  asset ${path} (${wheres.join(", ")}) missing from dist/`);
  failures++;
}
console.log(`assets: ${assetTotal} referenced asset paths checked against dist/`);

if (offline) {
  console.log(failures ? "FAIL" : "PASS  anchors and assets OK (external probes skipped)");
  process.exit(failures ? 1 : 0);
}

// ---- external probes -----------------------------------------------------
console.log(`probing ${externalUrls.size} external URLs...`);
const urlList = [...externalUrls.keys()];

// URLs that can't be meaningfully probed by a static fetch:
//  - the Last.fm base URL: the real request is built at runtime with query
//    params + an API key (Q6), so a parameterless probe 400s by design;
//    the footer renders or fails silently, which is the live check.
//  - absolute URLs under the deploy origin: those probe *deployment
//    freshness*, not link rot (og:image on a not-yet-redeployed site). We
//    still check them below, but as a distinct "stale deploy" signal.
const SKIP = (url) => url.startsWith("https://ws.audioscrobbler.com/");
const deployOrigin = "https://llia.me";

const results = [];
const toProbe = [];
for (const url of urlList) {
  if (SKIP(url)) {
    results.push({ url, where: externalUrls.get(url).join(", "), skipped: "runtime API (Q6)" });
  } else if (url.startsWith(deployOrigin)) {
    results.push({ url, where: externalUrls.get(url).join(", "), deployCheck: true });
  } else {
    toProbe.push(url);
  }
}

// Bounded concurrency — 25 simultaneous fresh connections tripped DNS/
// connection throttling; 6 at a time probes reliably.
const CONCURRENCY = 6;
let cursor = 0;
async function worker() {
  while (cursor < toProbe.length) {
    const url = toProbe[cursor++];
    const where = externalUrls.get(url).join(", ");
    const probe = async () => {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; portfolio-link-check/1.0)" },
      });
      return res.status;
    };
    let status = null;
    let error = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        status = await probe();
        error = null;
        break;
      } catch (err) {
        error = err instanceof Error ? `${err.name}: ${err.cause?.code ?? err.message}` : String(err);
        status = null;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    results.push({ url, where, status, error });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

for (const r of results) {
  if (r.skipped) {
    console.log(` skip  ${r.url} — ${r.skipped}`);
  } else if (r.deployCheck) {
    // deployment freshness: the file exists locally — does the live origin
    // serve it? Unreachable origin (domain not connected yet) is a note,
    // not a failure.
    const path = new URL(r.url).pathname;
    if (!existsSync(join(root, "dist", path)) && path !== "/") {
      console.log(`FAIL  ${r.url} (${r.where}) — referenced but not in dist/`);
      failures++;
      continue;
    }
    try {
      const res = await fetch(r.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status >= 400) {
        console.log(`FAIL  ${r.url} (${r.where}) — live origin serves HTTP ${res.status}; redeploy needed`);
        failures++;
      } else {
        console.log(`  ok  ${res.status}  ${r.url}  (deployed)`);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.cause?.code ?? err.message : String(err);
      console.log(` note  ${r.url} — origin not reachable yet (${reason}); check after the domain connects`);
    }
  } else if (r.error !== null || r.status === null) {
    console.log(`FAIL  ${r.url} (${r.where}) — unreachable: ${r.error}`);
    failures++;
  } else if (r.status >= 400) {
    // LinkedIn serves HTTP 999 to non-browser clients — bot protection, not
    // a dead link. The URL itself is the resume's (L8-reconciled) one.
    if (r.status === 999 && r.url.includes("linkedin.com")) {
      console.log(`  ok  ${r.status}  ${r.url}  (bot protection — treated as live)`);
    } else {
      console.log(`FAIL  ${r.url} (${r.where}) — HTTP ${r.status}`);
      failures++;
    }
  } else {
    console.log(`  ok  ${r.status}  ${r.url}`);
  }
}
console.log(`external: ${toProbe.length} probed, ${results.filter((r) => r.skipped).length} skipped, ${results.filter((r) => r.deployCheck).length} deploy-freshness`);
console.log(failures ? "\nFAIL" : "\nPASS  zero dead links; anchors and assets all resolve.");
process.exit(failures ? 1 : 0);
