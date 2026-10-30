// Throwaway (TASK-127): one round whose decision has a malformed optional field; print the stored record and each theme's chat text.
// usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <dir>
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

for (const theme of ["clean-blue", "luxury-gold", "default", "minimal-mono"]) {
  const id = (await call("POST", "/v1/projects", { name: `dropped ${theme}`, theme })).body.id as string;
  const round = await call("POST", `/v1/projects/${id}/rounds`, { message: "เพิ่มกฎการจองห้อง" });
  const rows = (await call("GET", `/v1/projects/${id}/messages?limit=50`)).body as Record<string, unknown>[];
  const bot = rows.filter((m) => m.role === "bot").at(-1)!;
  if (theme === "clean-blue") {
    say("round status", round.body?.status);
    say("stored bot row", { roundStatus: bot.roundStatus, roundSaved: bot.roundSaved, roundRefused: bot.roundRefused, roundAdjusted: bot.roundAdjusted, roundRaw: bot.roundRaw, content: bot.content });
    const spec = (await call("GET", `/v1/projects/${id}`)).body as { parts: { key: string; kind: string; title: string; body: unknown }[] };
    say("stored decision (the part really exists, without `open`)", spec.parts.filter((p) => p.kind === "decision"));
  }
  await page.goto(`${front}/p/${id}/chat`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);
  const lines = (await page.locator("main").innerText()).split("\n").map((l) => l.trim()).filter(Boolean);
  say(`${theme}: rendered chat text`, lines);
  say(`${theme}: roundRaw / SECRET anywhere on the page`, (await page.content()).includes(String(bot.roundRaw ?? "\u0000none")));
  await page.screenshot({ path: `${dir}/${theme}-127-field-dropped.png`, fullPage: true });
}
await browser.close();
