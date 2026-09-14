#!/usr/bin/env node
/**
 * Phase 6 acceptance probe (§9): serves dist/ locally and drives headless
 * Chrome (Playwright's cached build, no npm dependency) through the
 * WorkTabs acceptance criteria:
 *
 *   1. Default load: Experience tab selected, ExperiencePanel rendered,
 *      ProjectsPanel not; the tablist/tab/tabpanel ARIA contract wired.
 *   2. Clicking Projects: selection flips, #projects lands in the URL,
 *      sessionStorage remembers it, the Experience panel unmounts
 *      (no focus leak), the Projects panel renders 6 cards + 5 tiles.
 *   3. Keyboard: ArrowRight/ArrowLeft/Home/End move focus AND select
 *      (automatic activation), with roving tabIndex.
 *   4. Session persistence: a reload without a hash keeps the last tab.
 *   5. Deep link: a cold load of /#projects selects Projects and scrolls
 *      the section into view.
 *   6. Reduced motion: with prefers-reduced-motion emulated, the panel
 *      swaps synchronously (no cross-fade delay) — proof the JS-driven
 *      animation is actually disabled, which the CSS guard can't reach.
 *   7. The Home Server architecture diagram loads as real media.
 *
 * Exits non-zero on any failure.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function findChromium() {
  const cache = join(process.env.HOME ?? "", ".cache", "ms-playwright");
  for (const dir of readdirSync(cache)) {
    if (!dir.startsWith("chromium")) continue;
    for (const c of [
      join(cache, dir, "chrome-linux64", "chrome"),
      join(cache, dir, "chrome-linux", "chrome"),
    ]) {
      if (existsSync(c)) return c;
    }
  }
  throw new Error("No Chromium under ~/.cache/ms-playwright");
}

// Static file server for dist/ (no dependency).
const { createServer } = await import("node:http");
const { readFile } = await import("node:fs/promises");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".pdf": "application/pdf", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".ico": "image/x-icon", ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const path = req.url.split("?")[0];
  const file = path === "/" ? "/index.html" : path;
  try {
    const data = await readFile(join(root, "dist", file));
    const ext = file.split(".").pop();
    res.writeHead(200, { "content-type": MIME["." + ext] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const port = server.address().port;

const profileDir = mkdtempSync(join(tmpdir(), "worktabs-probe-"));
const chrome = spawn(findChromium(), [
  "--headless=new", "--no-sandbox", "--disable-gpu",
  `--user-data-dir=${profileDir}`, "--remote-debugging-port=0", "about:blank",
], { stdio: "pipe" });

const wsEndpoint = await new Promise((ok, err) => {
  let buf = "";
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) ok(m[0]);
  });
  chrome.on("exit", () => err(new Error("chrome exited: " + buf)));
  setTimeout(() => err(new Error("timeout waiting for CDP endpoint")), 10_000);
});
const ws = new WebSocket(wsEndpoint);
await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });

let id = 0;
const pending = new Map();
let sessionId = null;

function send(method, params = {}) {
  return new Promise((res, rej) => {
    const msgId = ++id;
    pending.set(msgId, { resolve: res, reject: rej });
    const payload = { id: msgId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });
}

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === "Target.attachedToTarget" && sessionId === null) {
    sessionId = msg.params.sessionId;
    return;
  }
  if (msg.id && pending.has(msg.id)) {
    const { resolve: res, reject: rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  }
};

ws.send(JSON.stringify({ id: ++id, method: "Target.getTargets", params: {} }));
const pageTargetId = await new Promise((ok, err) => {
  const timer = setTimeout(() => err(new Error("no page target")), 5000);
  ws.addEventListener("message", function handler(ev) {
    const msg = JSON.parse(ev.data);
    const info = msg.result?.targetInfos?.find((t) => t.type === "page");
    if (info) {
      clearTimeout(timer);
      ws.removeEventListener("message", handler);
      ok(info.targetId);
    }
  });
});
pending.clear();
ws.send(JSON.stringify({
  id: ++id,
  method: "Target.attachToTarget",
  params: { targetId: pageTargetId, flatten: true },
}));
while (sessionId === null) await new Promise((ok) => setTimeout(ok, 50));

async function evalJs(expression, awaitPromise = true) {
  const r = await send("Runtime.evaluate", {
    expression, awaitPromise, returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error(
      r.exceptionDetails.text + " " +
      JSON.stringify(r.exceptionDetails.exception?.description ?? ""),
    );
  }
  return r.result.value;
}

await send("Page.enable");
await send("Runtime.enable");

const url = `http://127.0.0.1:${port}/`;
let failures = 0;

function report(name, problems) {
  const tag = problems.length === 0 ? "PASS" : "FAIL";
  console.log(`${tag}  ${name}` + (problems.length ? `\n      ${problems.join("\n      ")}` : ""));
  if (problems.length) failures++;
}

/** Navigate and wait for React to mount (poll for the tablist). */
async function goto(path = "/") {
  await send("Page.navigate", { url: url + path.replace(/^\//, "") });
  const ok = await evalJs(`(async () => {
    for (let i = 0; i < 100; i++) {
      if (document.querySelector('[role="tablist"]')) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  })()`);
  if (!ok) throw new Error("tablist never mounted after navigating to " + path);
}

const VIEWPORT = `(() => {
  const doc = document.documentElement;
  return { w: window.innerWidth, h: window.innerHeight };
})()`;

await send("Emulation.setDeviceMetricsOverride", {
  width: 1280, height: 800, deviceScaleFactor: 1, mobile: false,
});

// ---------- 1. default load ----------
await goto("/");
{
  const s = await evalJs(`(() => {
    const tablist = document.querySelector('[role="tablist"]');
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const selected = tabs.find((t) => t.getAttribute("aria-selected") === "true");
    const expPanel = document.getElementById("experience-panel");
    const projPanel = document.getElementById("projects-panel");
    return {
      hasTablist: !!tablist,
      tabCount: tabs.length,
      tablistLabelled: tablist?.getAttribute("aria-label") ?? null,
      selectedLabel: selected?.textContent.trim() ?? null,
      selectedIsFirst: selected === tabs[0],
      roving: tabs.map((t) => t.tabIndex),
      expLabelledBy: expPanel?.getAttribute("aria-labelledby") ?? null,
      expControls: selected?.getAttribute("aria-controls") ?? null,
      hasSuncorp: !!expPanel?.querySelector("h3"),
      suncorpText: expPanel?.querySelector("h3")?.textContent ?? "",
      hasEducation: (expPanel?.textContent ?? "").includes("University of Queensland"),
      hasTanda: (expPanel?.textContent ?? "").includes("Tanda"),
      projPanelAbsent: projPanel === null,
      hash: location.hash,
    };
  })()`);
  const problems = [];
  if (!s.hasTablist) problems.push("tablist missing");
  if (s.tabCount !== 2) problems.push(`expected 2 tabs, got ${s.tabCount}`);
  if (s.tablistLabelled === null) problems.push("tablist has no aria-label");
  if (s.selectedLabel !== "Experience") problems.push(`default selection is "${s.selectedLabel}", expected Experience`);
  if (!s.selectedIsFirst) problems.push("selected tab is not first in DOM order");
  if (JSON.stringify(s.roving) !== "[0,-1]") problems.push(`roving tabIndex wrong: ${JSON.stringify(s.roving)}`);
  if (s.expLabelledBy !== "experience-tab") problems.push(`panel labelledby=${s.expLabelledBy}`);
  if (s.expControls !== "experience-panel") problems.push(`aria-controls=${s.expControls}`);
  if (!s.hasSuncorp || !s.suncorpText.includes("Suncorp")) problems.push("ExperiencePanel missing Suncorp");
  if (!s.hasTanda) problems.push("ExperiencePanel missing Tanda");
  if (!s.hasEducation) problems.push("ExperiencePanel missing education entry");
  if (!s.projPanelAbsent) problems.push("projects-panel present on default load (panel leak)");
  if (s.hash !== "") problems.push(`unexpected hash on cold load: ${s.hash}`);
  report("default load: Experience selected, ARIA contract wired", problems);
}

// Home Server diagram + private caption (rendered inside Experience? no —
// it is on the Projects tab; checked after the switch below). Diagram img
// only exists when the Projects panel is open, so check there.

// ---------- 2. click Projects ----------
{
  await evalJs(`(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.find((t) => t.textContent.trim() === "Projects").click();
    return true;
  })()`);
  // cross-fade: mode="wait" means the new panel enters after the old exits
  await new Promise((r) => setTimeout(r, 700));
  // The diagram is lazy-loaded below the fold — scroll it into view and
  // wait for it to decode before asserting on it.
  await evalJs(`(async () => {
    const img = document.querySelector('img[src="/projects/home-server-diagram.svg"]');
    img?.scrollIntoView({ block: "center" });
    for (let i = 0; i < 50; i++) {
      if (img && img.complete && img.naturalWidth > 0) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  })()`);
  const s = await evalJs(`(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const selected = tabs.find((t) => t.getAttribute("aria-selected") === "true");
    const projPanel = document.getElementById("projects-panel");
    const h3s = [...(projPanel?.querySelectorAll("h3") ?? [])].map((h) => h.textContent.trim());
    const diagram = document.querySelector('img[src="/projects/home-server-diagram.svg"]');
    return {
      selectedLabel: selected?.textContent.trim() ?? null,
      hash: location.hash,
      stored: sessionStorage.getItem("worktabs"),
      activeIsTab: document.activeElement?.getAttribute("role") === "tab",
      projLabelledBy: projPanel?.getAttribute("aria-labelledby") ?? null,
      tier1Count: h3s.length,
      hasHomeServer: h3s.includes("Home Server"),
      privateCaption: (projPanel?.textContent ?? "").includes("private network"),
      diagramLoaded: !!diagram && diagram.naturalWidth > 0,
      diagramAlt: diagram?.alt.startsWith("Architecture diagram") ?? false,
      experienceGone: !(document.getElementById("experience-panel")),
      suncorpLeak: [...document.querySelectorAll("h3")].some((h) => h.textContent.includes("Suncorp")),
      heading: document.getElementById("experience-heading")?.textContent.trim() ?? "",
    };
  })()`);
  const problems = [];
  if (s.selectedLabel !== "Projects") problems.push(`selection did not flip (${s.selectedLabel})`);
  if (s.hash !== "#projects") problems.push(`hash not synced: "${s.hash}"`);
  if (s.stored !== "projects") problems.push(`sessionStorage wrong: "${s.stored}"`);
  if (s.projLabelledBy !== "projects-tab") problems.push(`panel labelledby=${s.projLabelledBy}`);
  if (s.tier1Count !== 11) problems.push(`expected 6 cards + 5 tiles = 11 h3s, got ${s.tier1Count}`);
  if (!s.hasHomeServer) problems.push("Home Server card missing");
  if (!s.privateCaption) problems.push("private-network caption missing");
  if (!s.diagramLoaded) problems.push("architecture diagram missing or failed to load");
  if (!s.diagramAlt) problems.push("diagram alt text missing");
  if (!s.experienceGone) problems.push("experience-panel still in DOM (focus leak)");
  if (s.suncorpLeak) problems.push("Suncorp content still in DOM (focus leak)");
  if (!s.heading.startsWith("What I've built")) problems.push(`heading didn't switch: "${s.heading}"`);
  report("click Projects: selection, hash, persistence, 11 projects, diagram", problems);
}

// ---------- 3. keyboard ----------
{
  await evalJs(`(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.find((t) => t.textContent.trim() === "Projects").focus();
    return true;
  })()`);
  const s = await evalJs(`(async () => {
    const press = (key) => document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    const state = () => {
      const sel = document.querySelector('[role="tab"][aria-selected="true"]');
      return { label: sel.textContent.trim(), focused: document.activeElement === sel, hash: location.hash };
    };
    const out = {};
    press("ArrowRight");
    await new Promise((r) => setTimeout(r, 700));
    out.afterArrowRight = state();
    press("ArrowLeft");
    await new Promise((r) => setTimeout(r, 700));
    out.afterArrowLeft = state();
    press("Home");
    await new Promise((r) => setTimeout(r, 700));
    out.afterHome = state();
    press("End");
    await new Promise((r) => setTimeout(r, 700));
    out.afterEnd = state();
    return out;
  })()`);
  const problems = [];
  const expect = (name, got, label, hash) => {
    if (got.label !== label) problems.push(`${name}: selected "${got.label}"`);
    if (!got.focused) problems.push(`${name}: focus did not move with selection`);
    if (got.hash !== hash) problems.push(`${name}: hash "${got.hash}"`);
  };
  expect("ArrowRight", s.afterArrowRight, "Experience", "#experience");
  expect("ArrowLeft", s.afterArrowLeft, "Projects", "#projects");
  expect("Home", s.afterHome, "Experience", "#experience");
  expect("End", s.afterEnd, "Projects", "#projects");
  report("keyboard: ArrowRight/ArrowLeft/Home/End activate + move focus", problems);
}

// ---------- 4. session persistence ----------
await goto("/");
{
  const s = await evalJs(`(() => ({
    selected: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim() ?? null,
    hash: location.hash,
  }))()`);
  const problems = [];
  if (s.selected !== "Projects") problems.push(`reload without hash lost the tab: "${s.selected}"`);
  if (s.hash !== "#projects") problems.push(`hash not restored: "${s.hash}"`);
  report("session persistence: reload keeps Projects selected", problems);
}

// ---------- 5. deep link, cold load ----------
await goto("/#projects");
{
  const s = await evalJs(`(async () => {
    for (let i = 0; i < 40; i++) {
      const sel = document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim();
      const scrolled = window.scrollY > 200;
      if (sel === "Projects" && scrolled) return { sel, scrolled, hash: location.hash };
      await new Promise((r) => setTimeout(r, 100));
    }
    return {
      sel: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim() ?? null,
      scrolled: window.scrollY > 200,
      hash: location.hash,
    };
  })()`);
  const problems = [];
  if (s.sel !== "Projects") problems.push(`cold-load deep link did not select Projects (${s.sel})`);
  if (!s.scrolled) problems.push(`section not scrolled into view on cold load (scrollY=${s.scrolled ? "yes" : "low"})`);
  if (s.hash !== "#projects") problems.push(`hash wrong: "${s.hash}"`);
  report("deep link: cold load of /#projects selects tab + scrolls", problems);
}

// ---------- 6. reduced motion ----------
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await goto("/");
{
  // Cross-fade (mode="wait") delays the new panel by ~300ms; the reduced
  // path swaps synchronously. If the Projects h3 exists one rAF after the
  // click, the JS animation was genuinely skipped.
  const s = await evalJs(`(async () => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.find((t) => t.textContent.trim() === "Projects").click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const projPanel = document.getElementById("projects-panel");
    return {
      panelPresent: !!projPanel,
      hasCards: (projPanel?.textContent ?? "").includes("Customer Support Bot"),
      hash: location.hash,
    };
  })()`);
  const problems = [];
  if (!s.panelPresent) problems.push("panel not swapped synchronously under reduced motion");
  if (!s.hasCards) problems.push("panel content wrong under reduced motion");
  report("reduced motion: panel swaps synchronously (no cross-fade)", problems);
}
await send("Emulation.setEmulatedMedia", { features: [] });

// ---------- 7. mobile sanity: 375px, no overflow, tabs full-width ----------
await send("Emulation.setDeviceMetricsOverride", {
  width: 375, height: 740, deviceScaleFactor: 1, mobile: true,
});
await goto("/");
{
  const s = await evalJs(`(() => {
    const doc = document.documentElement;
    const els = [...document.querySelectorAll("body *")].filter(
      (el) => !el.closest('[aria-hidden="true"]') &&
        (el.getBoundingClientRect().right > window.innerWidth + 1 ||
         el.getBoundingClientRect().left < -1));
    return {
      overflow: doc.scrollWidth > window.innerWidth,
      tabs: document.querySelectorAll('[role="tab"]').length,
      outOfBounds: els.length,
      bad: els.slice(0, 3).map((el) => el.tagName),
    };
  })()`);
  const problems = [];
  if (s.overflow) problems.push("horizontal overflow at 375px");
  if (s.outOfBounds > 0) problems.push(`${s.outOfBounds} out-of-bounds els: ${s.bad.join(", ")}`);
  report("mobile 375px: no overflow, tablist present", problems);
}

console.log(failures === 0 ? "\nAll Phase 6 acceptance checks passed." : `\n${failures} check(s) FAILED.`);
ws.close();
chrome.kill();
server.close();
process.exit(failures ? 1 : 0);
