// Throwaway (TASK-108 step 8, part 2): requirements, the label flow, history and the build link, as the PM named โด่ง.
// Local pglite back end, gateway dead. usage (cwd = blueprint-front):
//   bun run <this file> <apiUrl> <frontUrl> <screenshot-dir> <theme> <projectId>
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir, theme = "default", projectId] = process.argv.slice(2);
const NAME = "โด่ง";
const by = encodeURIComponent(NAME);
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
const shot = (n: string) => page.screenshot({ path: `${dir}/${theme}-${n}.png`, fullPage: true });
const settle = async () => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(600); };
const text = async () => (await page.locator("main").innerText()).split("\n").map((l) => l.trim()).filter(Boolean);

// 7. finish the source upload on the chat page (the stamp choice completes it)
await page.goto(`${front}/p/${projectId}/chat`);
await settle();
await page.locator("input[type=file]").first().setInputFiles(`${dir}/brief.txt`);
await page.getByRole("button", { name: "ยืนยันโดยเจ้าของโปรเจกต์" }).click();
await settle();
say("7 source added: sources on the page", (await text()).filter((l) => l.includes("brief")));
say("7 source in back end", ((await call("GET", `/v1/projects/${projectId}/sources`)).body as { name: string }[]).map?.((s) => s.name) ?? (await call("GET", `/v1/projects/${projectId}/sources`)).body);

// 8. requirements: add, edit, remove
await page.goto(`${front}/p/${projectId}/requirements`);
await settle();
say("8 requirements page, empty: visible text", await text());
await shot("08a-requirements-empty");
await page.getByRole("button", { name: "เพิ่ม requirement" }).click();
await page.getByLabel("ตั้งชื่อ").fill("จองห้องได้ทุกวัน");
await page.getByRole("textbox", { name: "requirement" }).fill("ผู้ใช้เลือกวันและเวลาแล้วจองห้องประชุมได้");
await page.getByRole("button", { name: "เพิ่ม", exact: true }).click();
await settle();
say("8 after add", await text());
await shot("08b-requirements-added");
await page.getByRole("button", { name: "แก้", exact: true }).first().click();
await page.getByRole("textbox", { name: "requirement" }).fill("ผู้ใช้เลือกวันและเวลาแล้วจองห้องประชุมได้ ภายใน 30 วัน");
await page.getByRole("button", { name: "แก้", exact: true }).last().click();
await settle();
say("8 after edit", await text());
await shot("08c-requirements-edited");
await page.getByRole("button", { name: "ลบ", exact: true }).first().click();
await settle();
say("8 after remove", await text());
await shot("08d-requirements-removed");
// leave one standing so the spec lists it
await page.getByRole("button", { name: "เพิ่ม requirement" }).click();
await page.getByLabel("ตั้งชื่อ").fill("ยกเลิกการจองได้");
await page.getByRole("textbox", { name: "requirement" }).fill("ผู้จองยกเลิกได้ก่อนเวลา 1 ชั่วโมง");
await page.getByRole("button", { name: "เพิ่ม", exact: true }).click();
await settle();
say("8 one requirement left standing", await text());
const proj = (await call("GET", `/v1/projects/${projectId}`)).body as { parts: { key: string; kind: string }[] };
say("8 requirement parts in back end", proj.parts.filter((p) => p.kind === "requirement").map((p) => p.key));

// 9. an unanswered question makes something stuck (added by API as โด่ง: the chat cannot make one with the gateway dead)
const q = await call("POST", `/v1/projects/${projectId}/change-sets`, {
  cause: { kind: "operator" },
  changes: [{ op: "part.add", ref: "$q", kind: "question", title: "ใครอนุมัติการจอง", body: { text: "ใครอนุมัติการจอง" }, origin: { stamp: "operator", date: today } }],
});
say("9 stuck question added", { status: q.status, keys: q.body?.keys });

// 10. the ready screen: warning with stuck items + no quiz, empty label, first label, second label
await page.goto(`${front}/p/${projectId}/ready`);
await settle();
say("10 ready, stuck + no quiz: visible text", await text());
const buildHref0 = await page.locator("a[data-build], a.lg-ready-build-link, .lg-ready-build a, a:has-text('ส่งไปสร้างที่ CAW')").first().getAttribute("href");
say("10 build link with no label (href)", buildHref0);
await shot("10a-ready-warning");
await page.getByRole("button", { name: "ใส่ป้าย version" }).click();
await settle();
say("10 empty label: alert", await page.locator("[role=alert]").allInnerTexts());
say("10 empty label: labels in back end", (await call("GET", `/v1/projects/${projectId}/labels`)).body);
await shot("10b-ready-empty-label");
await page.getByPlaceholder("ตั้งชื่อป้าย เช่น v1 ทดลอง").fill("v1 ทดลอง");
await page.getByRole("button", { name: "ใส่ป้าย version" }).click();
await settle();
say("10 after label 1: visible text", await text());
await shot("10c-ready-one-label");
// AC-2: an edit after the label adds no label by itself
const key = q.body?.keys?.$q as string;
await call("POST", `/v1/projects/${projectId}/change-sets`, {
  cause: { kind: "operator" },
  changes: [{ op: "part.update", key, body: { text: "ใครอนุมัติการจอง", proposedAnswer: "ผู้จัดการ", status: "open" }, origin: { stamp: "operator", date: today } }],
});
await page.goto(`${front}/p/${projectId}/ready`);
await settle();
await page.getByPlaceholder("ตั้งชื่อป้าย เช่น v1 ทดลอง").fill("v2 หลังแก้");
await page.getByRole("button", { name: "ใส่ป้าย version" }).click();
await settle();
say("10 after label 2: visible text", await text());
const labels = (await call("GET", `/v1/projects/${projectId}/labels`)).body;
say("10 labels in back end", labels);
const buildHref2 = await page.locator("a:has-text('ส่งไปสร้างที่ CAW')").first().getAttribute("href");
say("10 build link after two labels (href)", buildHref2);
await shot("10d-ready-two-labels");

// 11. project-wide history
await page.goto(`${front}/p/${projectId}/history`);
await settle();
say("11 history (no part chosen): visible text", await text());
await shot("11-history-project-wide");
const hist = (await call("GET", `/v1/projects/${projectId}/history`)).body as { entries: { by: string | null; kind: string; entity: string }[] };
say("11 back end history rows (by · kind)", hist.entries.map((e) => `${e.by} · ${e.kind}`));

say("projectId", projectId);
await browser.close();
