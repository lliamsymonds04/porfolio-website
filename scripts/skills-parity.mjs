#!/usr/bin/env node
/**
 * Phase 7 acceptance probe: skills parity between the resume and the site
 * data (§9 — "every skill on the resume appears exactly once").
 *
 * Parses the resume's "## Technical Skills" block and compares it, as a
 * multiset, against the clusters in src/data/skills.ts:
 *   - resume skill missing from the site  → FAIL (content gap)
 *   - site skill not on the resume        → FAIL (invented content)
 *   - any duplicate within skills.ts      → FAIL
 *
 * Matching is case-insensitive with punctuation trimmed, so "RESTful APIs"
 * matches "restful apis" but ".NET" stays distinct from "NET".
 *
 * The resume lives outside the repo (~/Documents/personal/resume.md);
 * pass its path as argv[2] to check against a different copy.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const resumePath = process.argv[2] ?? `${process.env.HOME}/Documents/personal/resume.md`;

const resume = readFileSync(resumePath, "utf8");
const skillsSource = readFileSync(join(root, "src/data/skills.ts"), "utf8");

const norm = (s) => s.trim().toLowerCase().replace(/[.,]$/, "");

// ---- resume side -------------------------------------------------------
const skillsHeading = /^#{1,3}\s*technical skills\s*$/im;
const headingStart = resume.search(skillsHeading);
if (headingStart === -1) {
  console.error("FAIL  resume has no 'Technical Skills' heading");
  process.exit(1);
}
// block runs until the next markdown heading
const afterHeading = resume.slice(headingStart).split("\n").slice(1);
const blockEnd = afterHeading.findIndex((line) => /^#{1,3}\s/.test(line));
const block = (blockEnd === -1 ? afterHeading : afterHeading.slice(0, blockEnd)).join("\n");

const resumeSkills = [];
for (const line of block.split("\n")) {
  // markdown horizontal rules terminate the block visually — skip them
  if (/^[-*_]{3,}\s*$/.test(line)) continue;
  // "**Languages:** Python, TypeScript, ..." — strip the label, split the list
  const list = line.replace(/^\s*\*\*[^*]+:\*\*\s*/, "").trim();
  if (!list || list.startsWith("**")) continue;
  resumeSkills.push(...list.split(",").map(norm).filter(Boolean));
}

// ---- site side ---------------------------------------------------------
// Parse the exported arrays without importing TS: pull each
// `skills: [ "A", "B", ... ]` block from the source text.
const siteSkills = [];
const arrayRe = /skills:\s*\[([^\]]*)\]/gs;
for (const m of skillsSource.matchAll(arrayRe)) {
  for (const item of m[1].matchAll(/"([^"]+)"/g)) siteSkills.push(item[1]);
}
// cluster labels are also quoted strings but never inside skills: [...] —
// sanity: we should have found exactly the cluster arrays.
const clusterCount = (skillsSource.match(/label:\s*"/g) ?? []).length;
const arrayCount = [...skillsSource.matchAll(arrayRe)].length;
if (clusterCount !== arrayCount) {
  console.error(
    `FAIL  parser mismatch: ${clusterCount} clusters but ${arrayCount} skills arrays`,
  );
  process.exit(1);
}

// ---- compare -----------------------------------------------------------
const failures = [];
const siteSet = new Map();
for (const s of siteSkills) {
  const key = norm(s);
  if (siteSet.has(key)) failures.push(`site duplicate: "${s}" appears twice`);
  siteSet.set(key, s);
}
for (const r of resumeSkills) {
  if (!siteSet.has(r)) failures.push(`on resume, missing from site: "${r}"`);
}
const resumeSet = new Set(resumeSkills);
for (const [key, s] of siteSet) {
  if (!resumeSet.has(key)) failures.push(`on site, not on resume: "${s}"`);
}

console.log(`resume lists ${resumeSkills.length} skills; site lists ${siteSet.size} across ${clusterCount} clusters.`);
if (failures.length) {
  console.log("FAIL");
  for (const f of failures) console.log(`      ${f}`);
  process.exit(1);
}
console.log("PASS  every resume skill appears on the site exactly once; nothing invented.");
