// Throwaway (TASK-124): one partly-saved round and one all-refused round on a LOCAL pglite back end with the stub gateway; print
// the stored record and what each theme's chat page shows. usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <dir>
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
  for (const [kind, message] of [["partial", "เพิ่ม 5 ขั้น"], ["allbad", "ALL-BAD เพิ่มขั้น"]] as const) {
    const id = (await call("POST", "/v1/projects", { name: `${kind} ${theme}`, theme })).body.id as string;
    const round = await call("POST", `/v1/projects/${id}/rounds`, { message });
    const rows = (await call("GET", `/v1/projects/${id}/messages?limit=50`)).body as { role: string; content: string; roundStatus: string; roundSaved: number | null; roundRefused: unknown[] | null }[];
    const botRow = rows.filter((m) => m.role === "bot").at(-1);
    if (theme === "clean-blue") say(`${kind} stored bot row`, { status: round.body?.status, content: botRow?.content, roundStatus: botRow?.roundStatus, roundSaved: botRow?.roundSaved, roundRefused: botRow?.roundRefused });
    await page.goto(`${front}/p/${id}/chat`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    const botText = await page.locator("main").innerText();
    const lines = botText.split("\n").map((l) => l.trim()).filter(Boolean);
    say(`${theme} ${kind}: rendered chat text`, lines);
    // are the lines really on separate lines? find the element holding the header/sentence and compare its height to one line
    const probe = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0 && /ยังไม่ได้บันทึก/.test(e.textContent ?? "")).at(-1) as HTMLElement | undefined;
      if (!el) return null;
      const cs = getComputedStyle(el);
      // does the text after the first "\n" start at the element's left edge (= a line of its own)?
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && (n.textContent ?? "").includes("\n")) as Text | undefined;
      let itemStartsLine: boolean | null = null;
      if (node) {
        const at = (node.textContent ?? "").indexOf("\n") + 1;
        const r = document.createRange();
        r.setStart(node, at); r.setEnd(node, at + 1);
        itemStartsLine = Math.abs(r.getBoundingClientRect().left - el.getBoundingClientRect().left - parseFloat(cs.paddingLeft)) < 3;
      }
      return { whiteSpace: cs.whiteSpace, height: Math.round(el.getBoundingClientRect().height), lineHeight: cs.lineHeight, itemStartsLine, text: (el.textContent ?? "").slice(0, 60) };
    });
    say(`${theme} ${kind}: bot message element`, probe);
    await page.screenshot({ path: `${dir}/${theme}-124-${kind}.png`, fullPage: true });
  }
}
await browser.close();
