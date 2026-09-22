// Harness (Fern, 2026-09-22): TASK-013 DoD screenshots — every page, TH + EN, desktop + 375 px.
// Uses the playwright module from the smart-scheduler-front checkout (no browsers downloaded here)
// driving the system Chrome. Read-only against the running app; the session cookie is minted by
// tests/harness/task-007-session-for.ts (no writes).
//
// Run:  PLAYWRIGHT_DIR=<smart-scheduler-front path>/ node <this file> <FE origin> <possibility_session value>
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// playwright is not installed here; point PLAYWRIGHT_DIR at a checkout that has it (the
// `smart-scheduler-front` path from the workspace-root machine.local.md), trailing slash.
const PLAYWRIGHT_DIR = process.env.PLAYWRIGHT_DIR;
if (!PLAYWRIGHT_DIR) { console.error("set PLAYWRIGHT_DIR (see machine.local.md)"); process.exit(2); }
const { chromium } = createRequire(PLAYWRIGHT_DIR)("playwright");

const [origin = "http://localhost:3000", session = ""] = process.argv.slice(2);
const outDir = dirname(fileURLToPath(import.meta.url));
await mkdir(outDir, { recursive: true });

const ideas = await fetch(`${origin.replace("3000", "4019")}/api/v1/ideas`, {
  headers: { cookie: `possibility_session=${session}` },
}).then((r) => r.json());
const byTier = new Map();
for (const i of ideas.ideas ?? []) if (!byTier.has(i.ideaTier)) byTier.set(i.ideaTier, i.id);
const [tierA, tierB] = [...byTier.entries()];

const pages = [
  ["landing", "/", false],
  ["idea-box", "/ideas/new", true],
  ["my-ideas", "/ideas", true],
  ["me", "/me", true],
  ["not-found", "/ideas/00000000-0000-4000-8000-000000000000", true],
];
if (tierA) pages.push([`result-${tierA[0].toLowerCase().replace(/ /g, "-")}`, `/ideas/${tierA[1]}`, true]);
if (tierB) pages.push([`result-${tierB[0].toLowerCase().replace(/ /g, "-")}`, `/ideas/${tierB[1]}`, true]);

const browser = await chromium.launch({ channel: "chrome" });
for (const [lang, viewport, tag] of [
  ["th", { width: 1280, height: 800 }, "desktop"],
  ["en", { width: 1280, height: 800 }, "desktop"],
  ["th", { width: 375, height: 812 }, "375"],
  ["en", { width: 375, height: 812 }, "375"],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  for (const [name, path, needsUser] of pages) {
    const cookies = [{ name: "lang", value: lang, url: origin }];
    if (needsUser && session) cookies.push({ name: "possibility_session", value: session, url: origin });
    await ctx.clearCookies();
    await ctx.addCookies(cookies);
    const page = await ctx.newPage();
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1500);
    const file = join(outDir, `${name}-${lang}-${tag}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("saved", file);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
