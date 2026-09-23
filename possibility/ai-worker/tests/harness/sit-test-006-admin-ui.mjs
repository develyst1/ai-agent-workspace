// Harness (Tanya, 2026-09-23): TEST-006 round 2 — REQ-004 admin half on SIT, as qa-tanya-pw1
// (on ADMIN_EMAILS, owner 2026-09-23). Proves on the deployed build:
//   AC-1 display half: list shows date, name, email, idea preview (120 chars, expandable), 3 scores,
//                      idea tier + user tier at request with discount; admin copy per REQ-004 §Questions (TH+EN)
//   AC-3 admin half:   /admin renders for an admin; API 200; empty state copy; non-admin STILL 404 (post-change regression)
//   AC-4:              contacted toggle → PATCH 200 → state persists across reload; undo works
// Also: steps drawer (title, 5 step labels, model meta, close), newest-first order, 375 px pass.
// Does NOT prove: pricing/messaging (out of scope); Google-account admin (siegkung) — list-based admin
// makes the sign-in method irrelevant, but his actual account is not clicked by me.
// Run:  node tests/harness/sit-test-006-admin-ui.mjs
// Screenshots → possibility/project-docs/qa-2026-09-23/
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ORIGIN = "https://possibility.develyst.online";
const API = ORIGIN + "/api/v1";
const ADMIN_PW = process.env.QA_ADMIN_PW;
const HIRE_PW = process.env.QA_HIRE_PW;
if (!ADMIN_PW || !HIRE_PW) { console.error("set QA_ADMIN_PW and QA_HIRE_PW"); process.exit(2); }
const OUT = "H:/ai-agent-workplace/ai-agent-workspace/possibility/project-docs/qa-2026-09-23";
mkdirSync(OUT, { recursive: true });
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);

const IDEA_H1 = "46265726-591a-4abc-8298-ff1249923d9d"; // hire1's Ordinary idea (un-hired after round-1 cleanup)
const IDEA_H2 = "7c7702ab-1d8c-4144-9606-5814a7c2dbe2"; // hire2's Ordinary idea

async function login(request, email, password) {
  const r = await request.post(`${API}/auth/login`, { data: { email, password } });
  if (r.status() !== 200) throw new Error(`login ${email}: ${r.status()} ${await r.text()}`);
  return (await r.json()).user;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const rec = (name, data) => console.log(name, JSON.stringify(data));

// ---------- admin session, TH desktop — EMPTY STATE FIRST (hire_requests is empty after round-1 cleanup) ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
const page = await ctx.newPage();
const admin = await login(page.request, "qa-tanya-pw1@example.com", ADMIN_PW);
rec("admin-login", { email: admin.email, isAdmin: admin.isAdmin });

const emptyApi = await page.request.get(`${API}/admin/hire-requests`);
rec("AC3-admin-api-empty", { status: emptyApi.status(), body: await emptyApi.json() });
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const emptyText = await page.evaluate(() => document.body.innerText);
rec("AC3-empty-state-th", { title: emptyText.includes("คำขอจ้างงาน"), emptyCopy: emptyText.includes("ยังไม่มีคำขอ") });
await page.screenshot({ path: `${OUT}/test-006-admin-th-empty.png`, fullPage: true });
await ctx.addCookies([{ name: "lang", value: "en", url: ORIGIN }]);
await page.reload({ waitUntil: "networkidle" });
const emptyEn = await page.evaluate(() => document.body.innerText);
rec("AC3-empty-state-en", { title: emptyEn.includes("Hire requests"), emptyCopy: emptyEn.includes("No requests yet") });
await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);

// ---------- seed: two hire requests (hire1 = Visionary now, hire2 = Ordinary) ----------
{
  const c1 = await browser.newContext();
  const p = await c1.newPage();
  const u1 = await login(p.request, "qa-tanya-hire1@example.com", HIRE_PW);
  const r1 = await p.request.post(`${API}/ideas/${IDEA_H1}/hire-request`);
  const c2 = await browser.newContext();
  const p2 = await c2.newPage();
  const u2 = await login(p2.request, "qa-tanya-hire2@example.com", HIRE_PW);
  await new Promise((r) => setTimeout(r, 1100)); // ensure distinct created_at for newest-first
  const r2 = await p2.request.post(`${API}/ideas/${IDEA_H2}/hire-request`);
  rec("seed", { hire1: { status: r1.status(), tier: u1.tier }, hire2: { status: r2.status(), tier: u2.tier },
    r1: await r1.json().catch(() => null), r2: await r2.json().catch(() => null) });
  await c1.close(); await c2.close();
}
const listApi = await page.request.get(`${API}/admin/hire-requests`);
const listJson = await listApi.json();
rec("AC3-admin-api-list", { status: listApi.status(), count: listJson.hireRequests?.length,
  first: listJson.hireRequests?.[0] && { email: listJson.hireRequests[0].user.email, createdAt: listJson.hireRequests[0].createdAt, previewLen: listJson.hireRequests[0].idea.textPreview?.length, scores: listJson.hireRequests[0].idea.scores, ideaTier: listJson.hireRequests[0].idea.ideaTier, userTierAtRequest: listJson.hireRequests[0].userTierAtRequest, discount: listJson.hireRequests[0].discountPercentAtRequest, contactedAt: listJson.hireRequests[0].contactedAt },
  second: listJson.hireRequests?.[1] && { email: listJson.hireRequests[1].user.email, userTierAtRequest: listJson.hireRequests[1].userTierAtRequest, discount: listJson.hireRequests[1].discountPercentAtRequest } });

await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const pageText = await page.evaluate(() => document.body.innerText);
rec("AC3-admin-page-th", {
  title: pageText.includes("คำขอจ้างงาน"),
  headers: ["วันที่", "ชื่อ", "อีเมล", "ไอเดีย", "ระดับ", "ส่วนลด", "สถานะ"].map((h) => [h, pageText.includes(h)]),
  rowsText: [pageText.includes("QA Tanya Hire1"), pageText.includes("qa-tanya-hire1@example.com"), pageText.includes("qa-tanya-hire2@example.com")],
  notYetContacted: pageText.includes("ยังไม่ติดต่อ"),
  emptyCopyAbsent: !pageText.includes("ยังไม่มีคำขอ"),
});
await page.screenshot({ path: `${OUT}/test-006-admin-th-list.png`, fullPage: true });

// newest first: hire2's row must come before hire1's
const order = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("tr")].map((r) => r.innerText);
  const i1 = rows.findIndex((r) => r.includes("qa-tanya-hire1@"));
  const i2 = rows.findIndex((r) => r.includes("qa-tanya-hire2@"));
  return { i1, i2, newestFirst: i2 !== -1 && i1 !== -1 && i2 < i1 };
});
rec("AC3-newest-first", order);

// scores + tiers visible per row (hire1 row: idea Ordinary vs user tier Visionary 20% at request)
const hire1Row = await page.evaluate(() => {
  const tr = [...document.querySelectorAll("tr")].find((r) => r.innerText.includes("qa-tanya-hire1@"));
  return tr ? tr.innerText : null;
});
rec("AC1-row-content-hire1", { row: hire1Row, hasScores: hire1Row?.includes("85") && hire1Row?.includes("70") && hire1Row?.includes("30"),
  hasIdeaTier: hire1Row?.includes("Ordinary"), hasUserTierAndDiscount: hire1Row?.includes("Visionary") && hire1Row?.includes("20") });

// expand idea text
const expandBtn = page.locator("text=ดูทั้งหมด").first();
if (await expandBtn.count()) {
  await expandBtn.click();
  await page.waitForTimeout(400);
  const expanded = await page.evaluate(() => document.body.innerText.includes("[QA] A simple note-taking web page for my family so we can write down grocery lists and small reminders. Nothing new, just a basic page with text fields."));
  const collapseVisible = await page.locator("text=ย่อ").first().count();
  rec("AC1-expand", { fullTextShown: expanded, collapseVisible: !!collapseVisible });
  await page.screenshot({ path: `${OUT}/test-006-admin-th-expanded.png`, fullPage: true });
} else rec("AC1-expand", { expandButtonFound: false });

// steps drawer
const stepsLink = page.locator("text=/ขั้นตอน|steps|Steps/i").first();
if (await stepsLink.count()) {
  await stepsLink.click();
  await page.waitForTimeout(800);
  const drawerText = await page.evaluate(() => document.querySelector(".ant-drawer")?.innerText ?? "");
  rec("AC1-steps-drawer", {
    title: drawerText.includes("ขั้นตอนที่ AI วิเคราะห์"),
    steps: ["สิ่งที่ลูกค้าต้องการสื่อ", "ความชัดเจนของเป้าหมาย", "ประโยชน์ต่อโลก", "ตรงกับงานที่เราทำ", "สรุปและให้คะแนน"].map((s) => [s, drawerText.includes(s)]),
    metaModel: /โมเดล .+\/.+ · \d+ มิลลิวินาที/.test(drawerText),
    closeBtn: drawerText.includes("ปิด"),
  });
  await page.screenshot({ path: `${OUT}/test-006-admin-th-steps-drawer.png` });
  await page.locator(".ant-drawer >> text=ปิด").first().click().catch(() => page.keyboard.press("Escape"));
  await page.waitForTimeout(400);
} else rec("AC1-steps-drawer", { linkFound: false });

// ---------- AC-4: contacted toggle on hire2's row, reload persistence, undo ----------
{
  const row = page.locator("tr", { hasText: "qa-tanya-hire2@" }).first();
  const toggle = row.locator("button", { hasText: /ยังไม่ติดต่อ|ติดต่อแล้ว/ }).first();
  const [patchResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/admin/hire-requests/") && r.request().method() === "PATCH"),
    toggle.click(),
  ]);
  const patchJson = await patchResp.json();
  rec("AC4-patch", { status: patchResp.status(), contactedAt: patchJson.hireRequest?.contactedAt });
  await page.waitForTimeout(600);
  const rowAfter = await row.innerText();
  rec("AC4-row-after-toggle", { showsContacted: rowAfter.includes("ติดต่อแล้ว") });
  await page.screenshot({ path: `${OUT}/test-006-admin-th-contacted.png`, fullPage: true });

  await page.reload({ waitUntil: "networkidle" });
  const rowReload = await page.locator("tr", { hasText: "qa-tanya-hire2@" }).first().innerText();
  rec("AC4-persists-after-reload", { showsContacted: rowReload.includes("ติดต่อแล้ว") });

  // undo (SPEC-005: PATCH false lets him undo a mis-click)
  const row2 = page.locator("tr", { hasText: "qa-tanya-hire2@" }).first();
  const [undoResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/admin/hire-requests/") && r.request().method() === "PATCH"),
    row2.locator("button", { hasText: /ติดต่อแล้ว|ยังไม่ติดต่อ/ }).first().click(),
  ]);
  rec("AC4-undo", { status: undoResp.status(), contactedAt: (await undoResp.json()).hireRequest?.contactedAt });
}

// ---------- EN pass ----------
await ctx.addCookies([{ name: "lang", value: "en", url: ORIGIN }]);
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const enText = await page.evaluate(() => document.body.innerText);
rec("AC3-admin-page-en", {
  title: enText.includes("Hire requests"),
  headers: ["Date", "Name", "Email", "Idea", "Tier", "Discount", "Status"].map((h) => [h, enText.includes(h)]),
  statusCopy: enText.includes("Not yet contacted"),
});
await page.screenshot({ path: `${OUT}/test-006-admin-en-list.png`, fullPage: true });

// ---------- empty state (cleanup the two rows via admin-allowed path? no — via DB cleanup later;
// empty state is checked by API + a fresh account with no rows is not admin-able, so verify the
// copy after the DB cleanup at the end of the round instead) ----------

// ---------- regression: non-admin STILL refused after the admin-list change ----------
{
  const c2 = await browser.newContext();
  const p3 = await c2.newPage();
  await login(p3.request, "qa-tanya-hire1@example.com", HIRE_PW);
  const r = await p3.request.get(`${API}/admin/hire-requests`);
  rec("AC3-nonadmin-still-404", { status: r.status() });
  await c2.close();
}

// ---------- 375 px ----------
{
  const c3 = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await c3.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
  const p4 = await c3.newPage();
  await login(p4.request, "qa-tanya-pw1@example.com", ADMIN_PW);
  await p4.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
  const metrics = await p4.evaluate(() => {
    const t = document.querySelector("table");
    return { hscrollPage: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      pageScrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      table: t ? { scrollW: t.scrollWidth, clientW: t.clientWidth, parentOverflowX: getComputedStyle(t.parentElement).overflowX, parentScrollW: t.parentElement.scrollWidth, parentClientW: t.parentElement.clientWidth } : null };
  });
  rec("admin-375", metrics);
  // hit-test the contacted toggle of the first row
  const btn = p4.locator("tr button", { hasText: /ยังไม่ติดต่อ|ติดต่อแล้ว/ }).first();
  if (await btn.count()) {
    const b = await btn.boundingBox();
    const hit = b ? await p4.evaluate(([x, y]) => document.elementFromPoint(x, y)?.outerHTML.slice(0, 100) ?? null, [b.x + b.width / 2, b.y + b.height / 2]) : null;
    rec("admin-375-toggle-hittest", { box: b, reachable: !!hit && (hit.includes("button") || hit.includes("span")) });
  }
  await p4.screenshot({ path: `${OUT}/test-006-admin-th-375.png`, fullPage: true });
  await c3.close();
}

await ctx.close();
await browser.close();
console.log("DONE");
