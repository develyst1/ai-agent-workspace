// Throwaway (TASK-110): force a rejected round and a timed-out round on a LOCAL pglite back end with the stub gateway, then print
// what each theme's chat page shows. usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <dir>
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir] = process.argv.slice(2);
const by = encodeURIComponent("โด่ง");
const say = (k: string, v: unknown) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const call = async (method: string, route: string, body?: unknown) => {
  const r = await fetch(api + route, { method, headers: { "content-type": "application/json", "X-Blueprint-By": by }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
};
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "bp_by", value: by, url: new URL(front!).origin }]);
const page = await ctx.newPage();

const ids: Record<string, { rejected: string; timeout: string }> = {};
for (const theme of ["default", "clean-blue", "luxury-gold", "minimal-mono"]) {
  const rejected = (await call("POST", "/v1/projects", { name: `rejected ${theme}`, theme })).body.id as string;
  const r1 = await call("POST", `/v1/projects/${rejected}/rounds`, { message: "เพิ่ม feature แจ้งเตือน" });
  say(`${theme} rejected round: API answer`, { status: r1.status, round: { status: r1.body?.status, roundReason: r1.body?.roundReason ?? r1.body?.message?.roundReason, roundNote: r1.body?.roundNote ?? r1.body?.message?.roundNote } });
  const msgs = (await call("GET", `/v1/projects/${rejected}/messages?limit=50`)).body as { role: string; content: string; roundStatus: string; roundReason?: string; roundNote?: string }[];
  say(`${theme} rejected round: stored bot row`, msgs.filter((m) => m.role === "bot").map((m) => ({ content: m.content, roundStatus: m.roundStatus, roundReason: m.roundReason, roundNote: m.roundNote })));
  ids[theme] = { rejected, timeout: "" };
}
// one timeout round (takes ~90 s: the gateway's own limit), repeated on the other themes by reusing its stored rows is not possible — run them in parallel
await Promise.all(Object.keys(ids).map(async (theme) => {
  const id = (await call("POST", "/v1/projects", { name: `timeout ${theme}`, theme })).body.id as string;
  ids[theme]!.timeout = id;
  const r = await call("POST", `/v1/projects/${id}/rounds`, { message: "TIMEOUT-ME ช่วยหน่อย" });
  say(`${theme} timeout round: API answer`, { status: r.status, round: r.body?.status });
}));
for (const theme of Object.keys(ids)) {
  for (const kind of ["rejected", "timeout"] as const) {
    await page.goto(`${front}/p/${ids[theme]![kind]}/chat`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    const text = (await page.locator("main").innerText()).split("\n").map((l) => l.trim()).filter(Boolean);
    say(`${theme} ${kind}: rendered chat text`, text);
    say(`${theme} ${kind}: retry + change-model buttons`, await page.getByRole("button", { name: /ลองใหม่|เปลี่ยนโมเดล/ }).allInnerTexts());
    await page.screenshot({ path: `${dir}/${theme}-110-${kind}.png`, fullPage: true });
  }
}
await browser.close();
