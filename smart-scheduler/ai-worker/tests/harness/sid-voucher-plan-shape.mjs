/**
 * QA harness — closes a long-standing backlog item: the plan modal's `kind=voucher` SHAPE.
 * A voucher is hours-bound, not size-bound, so it must NOT offer make-up mechanics.
 * READ-ONLY: opens the modal and reads it; changes nothing.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(10)} ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);

try {
  const vouchers = (await A("GET", "/vouchers?q=QA")).json.items ?? [];
  const v = vouchers[0];
  const plan = (await A("GET", `/entitlements/${v.id}/plan`)).json;
  record(
    "the DTO is the VOUCHER discriminant, with an hours summary",
    'kind="voucher"; totalHours/usedHours/hoursRemaining/expiryDate; no size/owed/maxWeek',
    `kind=${plan.kind} · summary=${JSON.stringify(plan.summary)} · insertable=${plan.insertable} · liveEndDate=${plan.liveEndDate}`,
    plan.kind === "voucher" && plan.summary?.kind === "voucher" && plan.summary.size === undefined ? "PASS" : "FAIL",
  );
  record(
    "a voucher is never insertable (no make-up chain)",
    "insertable=false",
    `insertable=${plan.insertable}`,
    plan.insertable === false ? "PASS" : "FAIL",
  );

  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(1500);
  await page.locator('input[placeholder*="name" i]:visible, input[placeholder*="ค้นหา"]:visible').first().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage|จัดการ/i }).first().click();
  await page.waitForTimeout(2500);
  const d = page.locator('[role="dialog"]').first();
  const text = await d.innerText();
  const buttons = (await d.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  await page.screenshot({ path: `${OUT}/sid-voucher-plan-shape.png` });

  record(
    "the modal renders the VOUCHER shape, not the course shape",
    'a VOUCHER badge + "N / M h left" + the voucher note; no course size/leave',
    `text="${text.replace(/\n/g, " · ").slice(0, 240)}"`,
    /VOUCHER/.test(text) && /h left|ชั่วโมง/i.test(text) && !/session course|Leave \d/.test(text) ? "PASS" : "FAIL",
  );
  record(
    "no course-only mechanics are offered on a voucher",
    "no Insert make-up · no Mark absence · no Add extra (charged)",
    `buttons=${JSON.stringify([...new Set(buttons)])}`,
    !buttons.some((b) => /insert|absence|ขาด|charged|คิดเงิน/i.test(b)) ? "PASS" : "FAIL",
  );
  record(
    "the voucher rule is stated to the user",
    "a note explaining voucher sessions move one at a time",
    (text.split("\n").find((l) => /one at a time|make-?up chain|ทีละ/i.test(l)) ?? "not shown").slice(0, 160),
    /one at a time|make-?up chain|ทีละ/i.test(text) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
