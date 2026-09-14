#!/usr/bin/env node
/**
 * Phase 8: generates the 1200×630 Open Graph preview image (§8.4) by
 * screenshotting scripts/og-template.html with headless Chromium (Playwright's
 * cached build, no npm dependency) using the site's own palette, Inter
 * (served from node_modules @fontsource-variable/inter) and the shipped
 * portrait. Writes public/og.png, referenced by index.html's og/twitter tags.
 *
 * Run after any brand/copy/portrait change:
 *   node scripts/make-og.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

// Tiny static server: the template, the Inter woff2, the portrait.
const { createServer } = await import("node:http");
const template = readFileSync(join(root, "scripts", "og-template.html"));
const inter = readFileSync(
  join(root, "node_modules", "@fontsource-variable", "inter", "files", "inter-latin-wght-normal.woff2"),
);
const portrait = readFileSync(join(root, "public", "me", "profile.webp"));

const server = createServer((req, res) => {
  if (req.url.startsWith("/og.html")) {
    res.writeHead(200, { "content-type": "text/html" }); res.end(template);
  } else if (req.url.startsWith("/inter.woff2")) {
    res.writeHead(200, { "content-type": "font/woff2" }); res.end(inter);
  } else if (req.url.startsWith("/profile.webp")) {
    res.writeHead(200, { "content-type": "image/webp" }); res.end(portrait);
  } else { res.writeHead(404); res.end(); }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const port = server.address().port;

const profileDir = mkdtempSync(join(tmpdir(), "og-"));
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
    if (info) { clearTimeout(timer); ws.removeEventListener("message", handler); ok(info.targetId); }
  });
});
pending.clear();
ws.send(JSON.stringify({
  id: ++id,
  method: "Target.attachToTarget",
  params: { targetId: pageTargetId, flatten: true },
}));
while (sessionId === null) await new Promise((ok) => setTimeout(ok, 50));

await send("Page.enable");
await send("Runtime.enable");

await send("Emulation.setDeviceMetricsOverride", {
  width: 1200, height: 630, deviceScaleFactor: 1, mobile: false,
});
await send("Page.navigate", { url: `http://127.0.0.1:${port}/og.html` });
// wait for the webfont + image to settle before shooting
const ready = await send("Runtime.evaluate", {
  awaitPromise: true, returnByValue: true,
  expression: `(async () => {
    await document.fonts.load('800 92px "Inter Variable"');
    await document.fonts.ready;
    const img = document.querySelector("img");
    if (img && !img.complete) await new Promise((r) => { img.onload = r; });
    await new Promise((r) => setTimeout(r, 150));
    return true;
  })()`,
});
if (ready.result?.value !== true) throw new Error("page never settled");

const shot = await send("Page.captureScreenshot", {
  format: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
});
const out = join(root, "public", "og.png");
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`wrote ${out} (1200x630)`);

ws.close();
chrome.kill();
server.close();
