// Throwaway (TASK-108 rework): the overview's "Requirements" section in two themes, the name button's DOM, named history rows,
// and the PDF. Local pglite back end, gateway dead. usage (cwd = blueprint-front):
//   bun run <this file> <apiUrl> <frontUrl> <dir>
import { writeFileSync } from "node:fs";
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir] = process.argv.slice(2);
const by = encodeURIComponent("โด่ง");
const say = (k: string, v: unknown) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const call = async (method: string, route: string, body?: unknown) => {
  const r = await fetch(api + route, { method, headers: { "content-type": "application/json", "X-Blueprint-By": by }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return t ? JSON.parse(t) : null;
};
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
const origin = { stamp: "operator", date: today };

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bp_by", value: by, url: new URL(front!).origin }]);
const page = await ctx.newPage();
const settle = async () => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(600); };

for (const theme of ["default", "luxury-gold"]) {
  const p = await call("POST", "/v1/projects", { name: `req ${theme}`, theme });
  await call("POST", `/v1/projects/${p.id}/change-sets`, {
    cause: { kind: "operator" },
    changes: [
      { op: "part.add", ref: "$w", kind: "work", title: "จองห้อง", body: { goal: "ผู้ใช้จองห้องประชุมได้" }, origin },
      { op: "part.add", ref: "$r1", kind: "requirement", title: "จองห้องได้ทุกวัน", body: { text: "เลือกวันและเวลาแล้วจองได้" }, origin },
      { op: "part.add", ref: "$r2", kind: "requirement", title: "ยกเลิกการจองได้", body: { text: "ยกเลิกก่อนเวลา 1 ชั่วโมง" }, origin },
    ],
  });
  await page.goto(`${front}/p/${p.id}/overview`);
  await settle();
  const text = (await page.locator("main").innerText()).split("\n").map((l) => l.trim()).filter(Boolean);
  say(`${theme} overview: visible text`, text);
  say(`${theme} overview: data-required markers`, await page.locator("[data-required]").evaluateAll((els) => els.map((e) => `${e.getAttribute("data-required")}=${(e as HTMLElement).innerText.trim()}`)));
  await page.screenshot({ path: `${dir}/${theme}-30-overview-requirements.png`, fullPage: true });
  say(`${theme} name button DOM`, await page.locator("button[title*='เปลี่ยนชื่อ']").first().evaluate((e) => e.outerHTML.replace(/class="[^"]*"/g, "")));
  say(`${theme} name button visible text`, await page.locator("button[title*='เปลี่ยนชื่อ']").first().innerText());
  // history rows: named operator row shows no "โดยคุณ"
  await page.goto(`${front}/p/${p.id}/history`);
  await settle();
  say(`${theme} history rows`, (await page.locator("main").innerText()).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 8));
  // PDF
  const res = await fetch(`${front}/p/${p.id}/export/pdf`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(`${dir}/${theme}-overview.pdf`, buf);
  say(`${theme} pdf`, { status: res.status, bytes: buf.length, type: res.headers.get("content-type") });
}
await browser.close();
