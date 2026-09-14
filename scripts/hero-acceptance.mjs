#!/usr/bin/env node
/**
 * Phase 5 acceptance probe (§9): serves dist/ locally and drives headless
 * Chrome (Playwright's cached build, no npm dependency) through 320 / 768 /
 * 1024 / 1440 / 2560 px, asserting at each width:
 *   - no horizontal overflow (documentElement.scrollWidth <= innerWidth)
 *   - the hero name actually scales with the viewport
 *   - the hero, photo and resume CTA are all present and laid out
 * Exits non-zero on the first failure, printing the offending width.
 *
 * CDP notes (learned the hard way): the DevTools websocket exposes the
 * *browser* target, so everything must go through a session attached to the
 * page target. Evaluate without a contextId: the browser tracks the current
 * context per session automatically. The initial about:blank page is rendered
 * as an empty-shell page; navigate it and the app mounts into it.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTHS = [320, 360, 768, 1024, 1440, 2560];

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

const profileDir = mkdtempSync(join(tmpdir(), "hero-probe-"));
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

// 1. find the about:blank page target, 2. attach to it (flatten → replies on
// this socket carry sessionId), 3. everything else rides the session.
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

for (const width of WIDTHS) {
  const height = Math.round((width / 16) * 9);
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  });
  await send("Page.navigate", { url });
  // The React render isn't synchronous with the navigate reply — wait for
  // the hero h1 to exist (poll, don't guess).
  await evalJs(`(async () => {
    for (let i = 0; i < 100; i++) {
      if (document.querySelector("h1")) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    return false;
  })()`);

  const check = await evalJs(`(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const doc = document.documentElement;
    const h1 = document.querySelector("h1");
    const nameSize = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
    const photo = document.querySelector('img[src="/me/profile.webp"]');
    const resume = document.querySelector('a[href="/resume.pdf"]');
    // anything sticking out horizontally? (skip decorative aria-hidden layers)
    const els = [...document.querySelectorAll("body *")];
    const wide = els.filter((el) => {
      if (el.closest('[aria-hidden="true"]')) return false;
      const r = el.getBoundingClientRect();
      return r.right > window.innerWidth + 1 || r.left < -1;
    });
    return {
      href: location.href,
      scrollWidth: doc.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: doc.scrollWidth > window.innerWidth,
      nameSize,
      hasHero: !!h1,
      hasPhoto: !!photo && photo.naturalWidth > 0,
      hasResume: !!resume,
      outOfBoundsEls: wide.length,
      badTags: wide.map((el) => el.tagName + "." + String(el.className).split(" ")[0]),
    };
  })()`);

  const problems = [];
  if (check.overflow) {
    problems.push(`horizontal overflow: scrollWidth ${check.scrollWidth} > ${check.innerWidth}`);
  }
  if (check.outOfBoundsEls > 0) {
    problems.push(
      `${check.outOfBoundsEls} element(s) outside viewport: ` +
      check.badTags.slice(0, 5).join(", "),
    );
  }
  if (!check.hasHero) problems.push("hero h1 missing");
  if (!check.hasPhoto) problems.push("hero photo missing or failed to load");
  if (!check.hasResume) problems.push("resume CTA missing");
  if (width >= 768 && check.nameSize <= 32) {
    problems.push(`name not scaling at ${width}px (${check.nameSize}px)`);
  }

  const tag = problems.length === 0 ? "PASS" : "FAIL";
  console.log(
    `${tag} ${String(width).padStart(4)}px  name=${check.nameSize.toFixed(1)}px  photo=${check.hasPhoto}  resume=${check.hasResume}` +
    (problems.length ? `\n      ${problems.join("\n      ")}` : ""),
  );
  if (problems.length) failures++;
}

ws.close();
chrome.kill();
server.close();
process.exit(failures ? 1 : 0);
