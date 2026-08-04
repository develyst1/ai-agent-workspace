/**
 * QA harness — TASK-099 plan modal: live render + STANDING-RULE 4-breakpoint width measurement.
 *
 * Runs a REAL compositing Chrome (playwright, channel:"chrome") against the LOCAL dev server
 * (localhost:3016) started in MOCK mode, so no real environment and no credential is involved:
 * in mock mode the NextAuth Credentials provider accepts any local input (auth.ts `useMock`).
 *
 *   NODE_PATH=<front repo>/node_modules node plan-modal-widths.mjs
 *
 * Nothing is written to the product repo; output is JSON on stdout + screenshots in OUT_DIR.
 */
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

// ESM ignores NODE_PATH, so resolve playwright out of the front repo explicitly.
const PW =
  process.env.PW_PATH ??
  "C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(PW).href);

const BASE = process.env.BASE ?? "http://localhost:3016";
const OUT_DIR = process.env.OUT_DIR ?? "./out";
const WIDTHS = [1600, 1280, 768, 375];

mkdirSync(OUT_DIR, { recursive: true });

const rect = async (loc) => {
  if ((await loc.count()) === 0) return null;
  const b = await loc.first().boundingBox();
  return b ? { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y) } : null;
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e).slice(0, 200)));

// ── sign in (mock provider) ────────────────────────────────────────────────
await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000); // hydration — an early click submits nothing
await page.locator("input").first().fill("qa-local");
await page.locator('input[type="password"]').fill("qa-local-mock");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/\/scheduler\//, { timeout: 20000 });
await page.waitForLoadState("networkidle");

const report = { url: page.url(), breakpoints: {}, modal: {}, consoleErrors };

// ── helper: measure the voucher table at a width ──────────────────────────
async function measureVoucherTab(width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(600);

  const table = page.locator("table").first();
  const headers = table.locator("thead th");
  const nTh = await headers.count();
  const headerWidths = [];
  for (let i = 0; i < nTh; i++) headerWidths.push(Math.round((await headers.nth(i).boundingBox())?.width ?? 0));

  const manageBtn = page.getByRole("button", { name: /manage|จัดการ/i }).first();
  const manage = await rect(manageBtn);
  const manageCell = await rect(table.locator("tbody tr").first().locator("td").last());

  // overflow: Mantine Table sits inside a Card; compare table scroll width to its container
  const overflow = await page.evaluate(() => {
    const t = document.querySelector("table");
    if (!t) return null;
    const parent = t.parentElement;
    return {
      tableScrollWidth: Math.round(t.scrollWidth),
      containerClientWidth: Math.round(parent.clientWidth),
      containerScrollWidth: Math.round(parent.scrollWidth),
      containerOverflowX: getComputedStyle(parent).overflowX,
      docScrollWidth: Math.round(document.documentElement.scrollWidth),
      docClientWidth: Math.round(document.documentElement.clientWidth),
    };
  });

  await page.screenshot({ path: `${OUT_DIR}/vouchers-${width}.png`, fullPage: false });
  return { headerWidths, manageButton: manage, manageCell, overflow };
}

async function measureCourseTab(width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.getByRole("tab", { name: /course|คอร์ส/i }).click();
  await page.waitForTimeout(600);
  const managePlan = page.getByRole("button", { name: /manage plan|จัดการแผน|manage/i }).first();
  const r = await rect(managePlan);
  const card = await rect(page.locator(".mantine-Card-root").first());
  await page.screenshot({ path: `${OUT_DIR}/courses-${width}.png`, fullPage: false });
  return { managePlanButton: r, card };
}

for (const w of WIDTHS) {
  report.breakpoints[w] = {
    courses: await measureCourseTab(w),
    vouchers: await measureVoucherTab(w),
  };
}

// ── open the plan modal from a COURSE card (1280) ─────────────────────────
async function openAndMeasureModal(tabRe, label, width = 1280) {
  await page.setViewportSize({ width, height: 1000 });
  await page.getByRole("tab", { name: tabRe }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /manage plan|จัดการแผน|manage|จัดการ/i }).first().click();
  await page.waitForTimeout(1200);
  const dialog = page.locator('[role="dialog"]').first();
  const present = (await dialog.count()) > 0;
  const out = { present, width };
  if (present) {
    out.box = await rect(dialog);
    out.text = (await dialog.innerText()).slice(0, 1500);
    out.sessionRows = await dialog.locator("tbody tr").count();
    out.editButtons = await dialog.getByRole("button", { name: /edit|แก้ไข/i }).count();
    out.absenceButtons = await dialog.getByRole("button", { name: /absence|ลา/i }).count();
    out.insertButtons = await dialog.getByRole("button", { name: /insert|เพิ่ม/i }).count();
    await page.screenshot({ path: `${OUT_DIR}/modal-${label}-${width}.png` });
  }
  return out;
}

report.modal.course = await openAndMeasureModal(/course|คอร์ส/i, "course");
// interact: open the per-session editor + availability view
try {
  const dialog = page.locator('[role="dialog"]').first();
  await dialog.getByRole("button", { name: /edit|แก้ไข/i }).first().click();
  await page.waitForTimeout(900);
  report.modal.editor = {
    visible: (await dialog.getByText(/availability|ตารางว่าง|ครูที่ว่าง/i).count()) > 0,
    selects: await dialog.locator("input[readonly], .mantine-Select-input").count(),
    text: (await dialog.innerText()).slice(0, 2000),
  };
  await page.screenshot({ path: `${OUT_DIR}/modal-course-editor-1280.png` });
} catch (e) {
  report.modal.editor = { error: String(e).slice(0, 300) };
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

report.modal.voucher = await openAndMeasureModal(/voucher|วอยเชอร์/i, "voucher");
await page.keyboard.press("Escape");

// modal at 375 (the narrow case)
report.modal.course375 = await openAndMeasureModal(/course|คอร์ส/i, "course", 375);
await page.keyboard.press("Escape");

report.consoleErrors = consoleErrors.slice(0, 20);
console.log(JSON.stringify(report, null, 2));
await browser.close();
