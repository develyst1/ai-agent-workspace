// Harness (Fern, 2026-09-22): TASK-014 evidence — W-4 (landing, wrong password) and W-6 (idea box
// against a BE whose AI gateway is dead) rendered TH + EN at desktop + 375 with COMPUTED contrast
// (text colour vs alert background, WCAG 2.x), plus the Thai hero headline at 320 / 375 / 414.
// Needs: FE on <origin> pointed at a BE whose AI_GATEWAY_URL is unreachable (so POST /ideas → 502),
// a password fixture (dev-fern-pw1@example.com / short7!x — TASK-012), and playwright via PLAYWRIGHT_DIR
// (the `smart-scheduler-front` path from machine.local.md, trailing slash) driving system Chrome.
//   PLAYWRIGHT_DIR=<path>/ node <this file> <FE origin> <BE origin>
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLAYWRIGHT_DIR = process.env.PLAYWRIGHT_DIR;
if (!PLAYWRIGHT_DIR) { console.error("set PLAYWRIGHT_DIR (see machine.local.md)"); process.exit(2); }
const { chromium } = createRequire(PLAYWRIGHT_DIR)("playwright");

const [origin = "http://localhost:3000", api = "http://localhost:4001"] = process.argv.slice(2);
const outDir = dirname(fileURLToPath(import.meta.url));
// Wrong-password tries count against the BE's per-(IP, email) rate limit (10 / 15 min, in memory —
// restart the BE to reset), so the W-6 sign-in uses a different fixture than the W-4 failures.
const EMAIL = "dev-fern-pw1@example.com";
const LOGIN = { email: "dev-jason-pw1@example.com", password: "correct-horse-8" }; // TASK-011 fixture

const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const parse = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
const ratio = (a, b) => { const [x, y] = [lum(parse(a)), lum(parse(b))].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2); };

const readAlert = () => {
  const a = document.querySelector(".ant-alert");
  const msg = a.querySelector(".ant-alert-title, .ant-alert-message") || a;
  return { text: a.innerText.split("\n")[0], color: getComputedStyle(msg).color, bg: getComputedStyle(a).backgroundColor, border: getComputedStyle(a).borderColor };
};

const browser = await chromium.launch({ channel: "chrome" });
for (const [tag, viewport] of [["desktop", { width: 1280, height: 800 }], ["375", { width: 375, height: 812 }]]) {
  for (const lang of ["th", "en"]) {
    const ctx = await browser.newContext({ viewport });
    await ctx.addCookies([{ name: "lang", value: lang, url: origin }]);
    const page = await ctx.newPage();

    // W-4: wrong password on the landing
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await page.fill("input[type=email]", EMAIL);
    await page.fill("input[type=password]", "wrong-password-1");
    await page.locator("main form button[type=submit]").click();
    await page.waitForResponse((r) => r.url().endsWith("/auth/login"));
    await page.waitForSelector(".ant-alert");
    const w4 = await page.evaluate(readAlert);
    await page.locator(".ant-alert").screenshot({ path: join(outDir, `w4-${lang}-${tag}.png`) });
    await page.screenshot({ path: join(outDir, `w4-page-${lang}-${tag}.png`) });
    console.log(`W-4 ${lang} ${tag}: "${w4.text}" color ${w4.color} on ${w4.bg} → ${ratio(w4.color, w4.bg)}:1 (border ${w4.border})`);

    // W-6: sign in, submit an idea, BE answers 502 (dead gateway)
    const login = await page.request.post(`${api}/api/v1/auth/login`, { data: LOGIN });
    if (login.status() !== 200) throw new Error(`login ${login.status()}: ${await login.text()}`);
    await page.goto(`${origin}/ideas/new`, { waitUntil: "networkidle" });
    await page.fill("textarea", "A dead-gateway contrast check: this idea must fail so the W-6 alert shows.");
    await page.locator("main button.ant-btn-primary").click();
    await page.waitForResponse((r) => r.url().endsWith("/api/v1/ideas") && r.request().method() === "POST", { timeout: 60000 });
    await page.waitForSelector(".ant-alert");
    const w6 = await page.evaluate(readAlert);
    await page.locator(".ant-alert").screenshot({ path: join(outDir, `w6-${lang}-${tag}.png`) });
    await page.screenshot({ path: join(outDir, `w6-page-${lang}-${tag}.png`) });
    console.log(`W-6 ${lang} ${tag}: "${w6.text}" color ${w6.color} on ${w6.bg} → ${ratio(w6.color, w6.bg)}:1 (border ${w6.border})`);
    await page.request.post(`${api}/api/v1/auth/logout`);
    await ctx.close();
  }
}

// DEF-2: the Thai hero headline at 320 / 375 / 414 — where does it break?
for (const width of [320, 375, 414]) {
  const ctx = await browser.newContext({ viewport: { width, height: 812 } });
  await ctx.addCookies([{ name: "lang", value: "th", url: origin }]);
  const page = await ctx.newPage();
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  const info = await page.evaluate(() => {
    const h = document.querySelector("main h2");
    const segs = [...h.querySelectorAll("span[class]")].map((s) => [s.textContent, Math.round(s.getBoundingClientRect().top)]);
    const lines = new Set(segs.map((s) => s[1])).size;
    return { text: h.textContent.replace(/​/g, "|"), segs, lines, hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  await page.locator("main h2").screenshot({ path: join(outDir, `hero-th-${width}.png`) });
  console.log(`hero th ${width}px: ${info.text} → ${info.lines} line(s), segments ${JSON.stringify(info.segs)}, hscroll ${info.hscroll}`);
  await ctx.close();
}
await browser.close();
