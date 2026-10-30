// Throwaway (TASK-108 step 8, part 3): creativity through the UI (a settings audit row), and the ready screen in every theme
// at 1280 and 390 with the label section. Local pglite back end, gateway dead. usage (cwd = blueprint-front):
//   bun run <this file> <apiUrl> <frontUrl> <screenshot-dir> <projectId-of-the-default-project>
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir, projectId] = process.argv.slice(2);
const by = encodeURIComponent("โด่ง");
const say = (k: string, v: unknown) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const call = async (method: string, route: string, body?: unknown) => {
  const r = await fetch(api + route, { method, headers: { "content-type": "application/json", "X-Blueprint-By": by }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
};
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bp_by", value: by, url: new URL(front!).origin }]);
const page = await ctx.newPage();
const settle = async () => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(600); };

// creativity: the slider on the chat page
await page.goto(`${front}/p/${projectId}/chat`);
await settle();
const slider = page.locator("input[type=range]").first();
await slider.focus();
await slider.press("ArrowRight");
await page.waitForTimeout(1500);
await settle();
const hist = (await call("GET", `/v1/projects/${projectId}/history`)).body as { entries: { by: string | null; kind: string; before: unknown; after: unknown }[] };
say("creativity via the slider: newest history row", hist.entries[0]);
say("model control on the chat page (needs the gateway's model list)", await page.locator("select").count());

// every theme: a project, a stuck question, the ready screen at two widths, then a label
for (const theme of ["clean-blue", "luxury-gold", "minimal-mono"]) {
  const p = (await call("POST", "/v1/projects", { name: `ready ${theme}`, theme })).body as { id: string };
  await call("POST", `/v1/projects/${p.id}/change-sets`, { cause: { kind: "operator" }, changes: [{ op: "part.add", ref: "$q", kind: "question", title: "ใครอนุมัติ", body: { text: "ใครอนุมัติ" }, origin: { stamp: "operator", date: today } }] });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${front}/p/${p.id}/ready`);
    await settle();
    const over = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    say(`${theme} @${width}: page scrolls sideways`, over);
    const box = await page.getByRole("button", { name: "ใส่ป้าย version" }).boundingBox();
    say(`${theme} @${width}: label button size`, box && { w: Math.round(box.width), h: Math.round(box.height) });
    await page.screenshot({ path: `${dir}/${theme}-20-ready-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${front}/p/${p.id}/ready`);
  await settle();
  await page.getByPlaceholder("ตั้งชื่อ").fill("v1 ทดลอง");
  await page.getByRole("button", { name: "ใส่ป้าย version" }).click();
  await settle();
  say(`${theme}: after a label, label list in back end`, ((await call("GET", `/v1/projects/${p.id}/labels`)).body as { labels: { label: string; by: string }[] }).labels.map((l) => `${l.label} · ${l.by}`));
  await page.screenshot({ path: `${dir}/${theme}-21-ready-labelled.png`, fullPage: true });
  // the requirements page and the history in this theme
  for (const pg of ["requirements", "history"]) {
    await page.goto(`${front}/p/${p.id}/${pg}`);
    await settle();
    await page.screenshot({ path: `${dir}/${theme}-22-${pg}.png`, fullPage: true });
  }
}
await browser.close();
