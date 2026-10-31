// Throwaway (TASK-133): an api part whose path is a full URL, on the API page of each theme, at 1280 and 390.
// Stores two api parts per project (short + long URL), screenshots the page, checks the whole URL is in the DOM and no horizontal page scroll.
// usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <dir>
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir] = process.argv.slice(2);
const by = encodeURIComponent("โด่ง");
const SHORT = "http://127.0.0.1:4500/health";
const LONG = "https://status.example-company.internal/services/blueprint-api/v1/health?verbose=true";
const say = (k: string, v: unknown) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const call = async (method: string, route: string, body?: unknown) => {
  const r = await fetch(api + route, { method, headers: { "content-type": "application/json", "X-Blueprint-By": by }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
};
const origin = { stamp: "team-proposed", date: "2026-10-30" };
const browser = await chromium.launch({ channel: "chrome" });
let allOk = true;

for (const theme of ["default", "clean-blue", "luxury-gold", "minimal-mono"]) {
  const id = (await call("POST", "/v1/projects", { name: `url ${theme}`, theme })).body.id as string;
  const cs = await call("POST", `/v1/projects/${id}/change-sets`, {
    cause: { kind: "operator" },
    changes: [
      { op: "part.add", ref: "$a", kind: "api", title: "Health", body: { method: "GET", path: SHORT, responses: [{ status: 200 }] }, origin },
      { op: "part.add", ref: "$b", kind: "api", title: "Service status", body: { method: "GET", path: LONG, responses: [{ status: 200 }] }, origin },
    ],
  });
  say(`${theme}: change-set`, { status: cs.status, keys: cs.body?.keys });
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([{ name: "bp_by", value: by, url: new URL(front!).origin }]);
    const page = await ctx.newPage();
    await page.goto(`${front}/p/${id}/api`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.evaluate(() => document.body.innerText);
    const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
    // every text node holding a URL: is its box inside the viewport (not clipped on the right)?
    const clipped = await page.evaluate((urls) => {
      const out: unknown[] = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.textContent ?? "";
        if (!urls.some((u) => t.includes(u))) continue;
        const el = n.parentElement!;
        const r = document.createRange(); r.selectNodeContents(n);
        const rect = r.getBoundingClientRect();
        const cs = getComputedStyle(el);
        out.push({ tag: el.tagName, right: Math.round(rect.right), vw: window.innerWidth, scrollW: el.scrollWidth, clientW: el.clientWidth, overflow: cs.overflowX, ws: cs.whiteSpace, ellipsis: cs.textOverflow });
      }
      return out;
    }, [SHORT, LONG]);
    const hasShort = body.includes(SHORT), hasLong = body.includes(LONG);
    const noScroll = m.scrollWidth <= m.innerWidth;
    const boxesOk = (clipped as { right: number; vw: number; scrollW: number; clientW: number; ellipsis: string }[]).every((c) => c.right <= c.vw && c.scrollW <= c.clientW + 1 && c.ellipsis !== "ellipsis");
    allOk &&= hasShort && hasLong && noScroll && boxesOk;
    say(`${theme} @${width}`, { urlsInText: { short: hasShort, long: hasLong }, ...m, noHorizontalScroll: noScroll, urlBoxes: clipped });
    await page.screenshot({ path: `${dir}/${theme}-${width}-api-url.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
say("ALL OK", allOk);
