#!/usr/bin/env node
/**
 * Renders resume/resume.html → public/resume.pdf using a headless Chromium
 * (Playwright's cached build, no npm dependency). Run after editing the HTML:
 *
 *   node scripts/render-resume.mjs
 *
 * Print rules live in the HTML's @page block (A4, 14/15mm margins); this
 * script only drives the browser and asserts the output is sane.
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = join(root, "resume", "resume.html");
const out = join(root, "public", "resume.pdf");

// Locate a Chromium binary without adding a dependency.
function findChromium() {
  const cache = join(process.env.HOME ?? "", ".cache", "ms-playwright");
  try {
    for (const dir of readdirSync(cache)) {
      if (!dir.startsWith("chromium")) continue;
      for (const candidate of [
        join(cache, dir, "chrome-linux64", "chrome"),
        join(cache, dir, "chrome-linux", "chrome"),
      ]) {
        if (existsSync(candidate)) return candidate;
      }
    }
  } catch {
    /* no cache dir */
  }
  throw new Error(
    "No Chromium found under ~/.cache/ms-playwright — install one or extend findChromium().",
  );
}

const chromium = findChromium();
// Chrome's --print-to-pdf honours @page rules including margins when
// --no-pdf-header-footer is passed. (The `script` template above is unused
// scaffolding from a Playwright-library approach; Chrome CLI is enough.)
const result = spawnSync(
  chromium,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${out}`,
    `file://${html}`,
  ],
  { stdio: "inherit" },
);

if (result.status !== 0 || !existsSync(out)) {
  console.error("render-resume: PDF was not produced");
  process.exit(1);
}

const kb = Math.round(statSync(out).size / 1024);
if (kb < 20) {
  unlinkSync(out);
  console.error(`render-resume: output suspiciously small (${kb} KB) — failing`);
  process.exit(1);
}
console.log(`render-resume: wrote public/resume.pdf (${kb} KB)`);
