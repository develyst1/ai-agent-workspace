/**
 * QA harness — REQ-022's last open line: does the **expired-voucher red alert** actually render?
 * Uses the data I already created on `sid` (student `QA-expv`, 5 h voucher expired 2026-04-05).
 * A refused save creates nothing, so this leaves no new footprint.
 * Mirrors `tests/CLICK-SCRIPTS-owner.md` script #3.
 */
import { openSidSession } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });

const { browser, page, origin } = await openSidSession({ viewport: { width: 1440, height: 950 } });
const r = { steps: [], alert: null };
const log = (s, v) => {
  r.steps.push({ step: s, detail: v });
  console.error(`· ${s}: ${typeof v === "string" ? v.slice(0, 200) : JSON.stringify(v)?.slice(0, 300)}`);
};

await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
log("buttons on calendar", (await page.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean).slice(0, 20));

// the create path is an empty calendar cell (aria-label "Add booking"), not a toolbar button
const openBtn = page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first();
await openBtn.click();
await page.waitForTimeout(2500);
const dialog = page.locator('[role="dialog"]').first();
log("modal opened", (await dialog.innerText()).slice(0, 400));
await page.screenshot({ path: `${OUT}/sid-req022-1-modal.png` });

// Voucher tab
await dialog.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
await page.waitForTimeout(1200);
log("voucher tab", (await dialog.innerText()).slice(0, 400));
await page.screenshot({ path: `${OUT}/sid-req022-2-voucher-tab.png` });

// student search → QA-expv
const search = dialog.locator("input").first();
await search.click();
await search.fill("QA-expv");
await page.waitForTimeout(2500);
const optionTexts = await page.getByRole("option").allInnerTexts().catch(() => []);
log("student options for QA-expv", optionTexts);
await page.screenshot({ path: `${OUT}/sid-req022-3-student-search.png` });
r.expiredVoucherOfferedInPicker = optionTexts.length > 0;

if (optionTexts.length) {
  await page.getByRole("option").first().click();
  await page.waitForTimeout(1800);
  log("after picking student", (await dialog.innerText()).slice(0, 800));
  await page.screenshot({ path: `${OUT}/sid-req022-4-picked.png` });

  // fill whatever else is required, then save
  const save = dialog.getByRole("button", { name: /save|confirm|ยืนยัน|บันทึก/i }).last();
  await save.click();
  await page.waitForTimeout(3000);
  const body = await dialog.innerText();
  r.alert = {
    dialogText: body.slice(0, 1200),
    hasThaiExpiredMessage: /วอยเชอร์หมดอายุ/.test(body),
    redAlertPresent:
      (await dialog.locator('[class*="Alert"], [role="alert"]').count()) > 0 ||
      (await page.locator('[class*="Notification"]').count()) > 0,
  };
  const notif = await page.locator('[class*="Notification"]').allInnerTexts().catch(() => []);
  r.alert.notifications = notif;
  r.alert.hasThaiExpiredMessageAnywhere = /วอยเชอร์หมดอายุ/.test(body + notif.join(" "));
  await page.screenshot({ path: `${OUT}/sid-req022-5-after-save.png` });
}

console.log(JSON.stringify(r, null, 2));
await browser.close();
