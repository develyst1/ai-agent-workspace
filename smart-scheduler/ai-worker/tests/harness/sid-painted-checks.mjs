/**
 * QA harness — READ-ONLY painted/layout checks on `sid` (writes nothing, creates nothing).
 *   · REQ-024 / TASK-081 — the CUSTOM date inputs must be usable (176 px), not collapsed (26/36 px)
 *   · REQ-026 Stage 1  — the old "Dashboard" nav entry is gone; the three keepers are present
 *   · TASK-099 / DEF-1 — the voucher table's new "Manage" column, measured on the DEPLOYED page
 */
import { openSidSession } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const WIDTHS = [1600, 1280, 768, 375];

const { browser, page, origin } = await openSidSession({ viewport: { width: 1280, height: 900 } });
const report = { origin, nav: {}, req024: {}, voucherManage: {}, consoleErrors: [] };
page.on("console", (m) => m.type() === "error" && report.consoleErrors.push(m.text().slice(0, 160)));

// ── REQ-026 Stage 1 — nav ─────────────────────────────────────────────────
await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
report.nav.items = (await page.locator("a").allInnerTexts())
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((s, i, a) => a.indexOf(s) === i);
report.nav.hasBareDashboard = report.nav.items.some((s) => /^dashboard$/i.test(s) || /^แดชบอร์ด$/.test(s));
report.nav.keepers = {
  somDashboard: report.nav.items.some((s) => /som dashboard/i.test(s)),
  dailyReport: report.nav.items.some((s) => /daily report|รายงานประจำวัน/i.test(s)),
  needsAttention: report.nav.items.some((s) => /needs attention|ต้องดำเนินการ/i.test(s)),
};
await page.screenshot({ path: `${OUT}/sid-nav-1280.png` });

// ── REQ-024 / TASK-081 — CUSTOM date inputs at four widths ────────────────
await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
await page.waitForTimeout(1500);

for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(500);

  // pick CUSTOM in the date-range Select (searchable Selects are not readonly — target by label)
  const rangeSelect = page.getByLabel(/^date range$|ช่วงวันที่/i).first();
  await rangeSelect.click();
  await page.waitForTimeout(400);
  await page.getByRole("option", { name: /custom|กำหนดเอง/i }).click();
  await page.waitForTimeout(800);

  report.req024[w] = await page.evaluate(() => {
    // Mantine v9 DatePickerInput renders a BUTTON-like control, not an <input> — measure the control
    // element inside the wrapper whose <label> is From / To.
    const control = (re) => {
      const wrap = [...document.querySelectorAll(".mantine-InputWrapper-root")].find((d) =>
        re.test((d.querySelector("label")?.textContent ?? "").trim()),
      );
      if (!wrap) return null;
      return (
        wrap.querySelector("input, button, [data-mantine-stop-propagation], .mantine-Input-input") ?? null
      );
    };
    const rect = (el) => (el ? Math.round(el.getBoundingClientRect().width) : null);
    const from = control(/^from$|^จากวันที่$/i);
    const to = control(/^to$|^ถึงวันที่$/i);
    return {
      fromWidth: rect(from),
      toWidth: rect(to),
      sameRowAsPresets: from && to ? Math.round(from.getBoundingClientRect().top) === Math.round(to.getBoundingClientRect().top) : null,
      pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: `${OUT}/sid-req024-custom-${w}.png` });
}

// ── TASK-099 / DEF-1 — voucher "Manage" column on the deployed page ───────
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(1200);
  report.voucherManage[w] = await page.evaluate(() => {
    const table = document.querySelector("table");
    if (!table) return { note: "no voucher table (empty list?)" };
    const card = table.closest(".mantine-Card-root") ?? table.parentElement;
    const btn = [...table.querySelectorAll("tbody button")].pop();
    if (!btn) return { note: "no Manage button in tbody" };
    const br = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(br.x + br.width / 2), Math.round(br.y + br.height / 2));
    return {
      manageBtn: { x: Math.round(br.x), w: Math.round(br.width) },
      tableScrollWidth: Math.round(table.scrollWidth),
      cardClientWidth: Math.round(card.clientWidth),
      cardOverflowX: getComputedStyle(card).overflowX,
      buttonIsHitTarget: !!(hit && (hit === btn || btn.contains(hit))),
      pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: `${OUT}/sid-vouchers-${w}.png` });
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
