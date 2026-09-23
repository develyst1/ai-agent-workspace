// Harness (Tanya, 2026-09-23): TEST-006 round 2b — REQ-004 admin half on SIT as qa-tanya-pw1
// (admin via ADMIN_EMAILS). Rows already seeded (3e0358e9 hire1/Visionary·20%, aebc50bc
// hire2/Ordinary·0%). Proves: AC-4 contacted toggle (PATCH 200, persists across reload, undo),
// EN copy pass, 375 px metrics + hit-test, non-admin still 404 post-change.
// Locators match the ACTUAL build: expand = antd row expand icon; toggle = antd Switch
// (role=switch); steps drawer = "ขั้นตอนของ AI" button inside the expanded row.
// Run: QA_ADMIN_PW=.. QA_HIRE_PW=.. node tests/harness/sit-test-006-admin-ui2.mjs
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const ORIGIN = "https://possibility.develyst.online";
const API = ORIGIN + "/api/v1";
const OUT = "H:/ai-agent-workplace/ai-agent-workspace/possibility/project-docs/qa-2026-09-23";
mkdirSync(OUT, { recursive: true });
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);
const rec = (name, data) => console.log(name, JSON.stringify(data));
async function login(request, email, password) {
  const r = await request.post(`${API}/auth/login`, { data: { email, password } });
  if (r.status() !== 200) throw new Error(`login ${email}: ${r.status()}`);
  return (await r.json()).user;
}
const browser = await chromium.launch({ channel: "chrome", headless: true });

// ---------- AC-4 contacted toggle, TH desktop ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
const page = await ctx.newPage();
await login(page.request, "qa-tanya-pw1@example.com", process.env.QA_ADMIN_PW);
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });

const myRow = page.locator("tr", { hasText: "qa-tanya-hire2@" }).first();
const sw = myRow.locator("[role=switch]");
rec("AC4-pre", { ariaChecked: await sw.getAttribute("aria-checked"), label: await myRow.innerText().then((t) => t.includes("ยังไม่ติดต่อ")) });
const [patchResp] = await Promise.all([
  page.waitForResponse((r) => r.url().includes("/admin/hire-requests/") && r.request().method() === "PATCH"),
  sw.click(),
]);
const patchJson = await patchResp.json();
rec("AC4-patch-on", { status: patchResp.status(), contactedAt: patchJson.hireRequest?.contactedAt });
await page.waitForTimeout(500);
rec("AC4-row-after", { ariaChecked: await sw.getAttribute("aria-checked"), showsContacted: (await myRow.innerText()).includes("ติดต่อแล้ว") });
await page.screenshot({ path: `${OUT}/test-006-admin-th-contacted.png`, fullPage: true });

await page.reload({ waitUntil: "networkidle" });
const rowReload = page.locator("tr", { hasText: "qa-tanya-hire2@" }).first();
rec("AC4-persists-after-reload", { ariaChecked: await rowReload.locator("[role=switch]").getAttribute("aria-checked"), showsContacted: (await rowReload.innerText()).includes("ติดต่อแล้ว") });

// undo (SPEC-005: PATCH false)
const [undoResp] = await Promise.all([
  page.waitForResponse((r) => r.url().includes("/admin/hire-requests/") && r.request().method() === "PATCH"),
  rowReload.locator("[role=switch]").click(),
]);
rec("AC4-undo", { status: undoResp.status(), contactedAt: (await undoResp.json()).hireRequest?.contactedAt });
await page.waitForTimeout(400);
rec("AC4-after-undo", { showsNotYet: (await rowReload.innerText()).includes("ยังไม่ติดต่อ") });

// ---------- EN pass ----------
await ctx.addCookies([{ name: "lang", value: "en", url: ORIGIN }]);
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const enText = await page.evaluate(() => document.body.innerText);
const enHeaders = await page.evaluate(() => [...document.querySelectorAll("th")].map((t) => t.innerText.trim()));
rec("AC3-admin-page-en", { title: enText.includes("Hire requests"), headers: enHeaders, statusCopy: enText.includes("Not yet contacted") });
await page.screenshot({ path: `${OUT}/test-006-admin-en-list.png`, fullPage: true });
// EN: expand my row, drawer title
await page.locator("tr", { hasText: "qa-tanya-hire1@" }).first().locator(".ant-table-row-expand-icon").click();
await page.waitForTimeout(400);
await page.locator(".ant-table-expanded-row button", { hasText: /AI|step/i }).first().click();
await page.waitForTimeout(900);
const drawerEn = await page.evaluate(() => document.querySelector(".ant-drawer")?.innerText ?? null);
rec("AC1-steps-drawer-en", { firstLine: drawerEn?.split("\n")[0], hasAllSteps: drawerEn ? ["understand", "goalClarity", "goodForWorld", "companyFit", "synthesis"].every((s) => drawerEn.includes(s)) : false });
await ctx.close();

// ---------- regression: non-admin still refused ----------
{
  const c = await browser.newContext();
  const p = await c.newPage();
  await login(p.request, "qa-tanya-hire1@example.com", process.env.QA_HIRE_PW);
  const r = await p.request.get(`${API}/admin/hire-requests`);
  rec("AC3-nonadmin-still-404", { status: r.status() });
  await p.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
  rec("AC3-nonadmin-page", { showsNotFound: (await p.evaluate(() => document.body.innerText)).includes("ไม่พบหน้านี้") });
  await c.close();
}

// ---------- 375 px ----------
{
  const c = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await c.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
  const p = await c.newPage();
  await login(p.request, "qa-tanya-pw1@example.com", process.env.QA_ADMIN_PW);
  await p.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
  const metrics = await p.evaluate(() => {
    const t = document.querySelector("table");
    const wrap = t?.closest(".ant-table-container, .ant-table-content, .ant-table") ?? t?.parentElement;
    return { pageHscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      pageScrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
      wrap: wrap ? { scrollW: wrap.scrollWidth, clientW: wrap.clientWidth, overflowX: getComputedStyle(wrap).overflowX } : null };
  });
  rec("admin-375", metrics);
  const swBtn = p.locator("tr", { hasText: "qa-tanya-hire1@" }).first().locator("[role=switch]");
  if (await swBtn.count()) {
    const b = await swBtn.boundingBox();
    const hit = b ? await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.outerHTML.slice(0, 100) ?? null, [b.x + b.width / 2, b.y + b.height / 2]) : null;
    rec("admin-375-switch-hittest", { box: b && { x: Math.round(b.x), y: Math.round(b.y) }, hit });
  }
  await p.screenshot({ path: `${OUT}/test-006-admin-th-375.png`, fullPage: true });
  await c.close();
}
await browser.close();
console.log("DONE");
