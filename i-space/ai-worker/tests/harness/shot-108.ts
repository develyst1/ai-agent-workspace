// Throwaway (TASK-108): screenshot one front URL at a width, optionally with the name cookie set.
// usage (from the blueprint-front checkout): bun run <this file> <url> <width> <out.png> [name]
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [url, width, out, name] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: Number(width), height: 844 } });
if (name) await ctx.addCookies([{ name: "bp_by", value: encodeURIComponent(name), url: new URL(url).origin }]);
const page = await ctx.newPage();
await page.goto(url);
await page.screenshot({ path: out, fullPage: false });
await browser.close();
