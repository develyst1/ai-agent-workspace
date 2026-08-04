/**
 * QA harness — TASK-099 AC-6 only: a DELIVERED session must be read-only in the plan table,
 * and the server must refuse to move it. Operates only on the QA-owned course (COURSE_ID).
 * A past-dated session already exists in that plan from the previous run (past dates are allowed —
 * owner ruling), so it can be marked attended.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const COURSE_ID = process.env.COURSE_ID;
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(7)} ${id} — ${String(actual).slice(0, 220)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const today = new Date().toISOString().slice(0, 10);

try {
  const plan = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  const past = plan.sessions.find((s) => s.date < today && /PENDING|CONFIRMED|EXTENDED/.test(s.status));
  record(
    "AC-6 setup — a past-dated session exists to deliver",
    "one live session dated before today",
    past ? `${past.date} ${past.startTime} ${past.status}` : "none",
    past ? "PASS" : "BLOCKED",
  );
  if (past) {
    const conf = await A("PATCH", `/bookings/${past.id}/status`, { action: "confirm" });
    const att = await A("PATCH", `/bookings/${past.id}/status`, { action: "attend" });
    record(
      "AC-6 setup — mark it delivered",
      "confirm → attend both accepted",
      `confirm ${conf.status} ${conf.text.slice(0, 80)} · attend ${att.status} ${att.text.slice(0, 80)}`,
      att.status === 200 ? "PASS" : "BLOCKED",
    );

    await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("QA-expv");
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: /manage plan/i }).first().click();
    await page.waitForTimeout(2500);
    const d = page.locator('[role="dialog"]').first();
    const rows = await d.locator("tbody tr").allInnerTexts();
    const delivered = rows.find((t) => /ATTENDED/i.test(t));
    record(
      "AC-6 delivered rows are read-only in the plan table",
      "the ATTENDED row shows 'locked' and offers no Edit / Mark absence",
      `row="${(delivered ?? "none").replace(/\n/g, " · ").slice(0, 200)}"`,
      delivered && !/edit/i.test(delivered) ? "PASS" : "FAIL",
    );
    await page.screenshot({ path: `${OUT}/sid-099c-delivered.png` });

    const guard = await A("POST", `/courses/${COURSE_ID}/plan`, {
      kind: "move",
      bookingId: past.id,
      startTime: "15:00",
    });
    record(
      "AC-6b the server refuses to move a delivered session",
      "4xx SESSION_DELIVERED",
      `${guard.status} ${guard.text.slice(0, 200)}`,
      guard.status >= 400 ? "PASS" : "FAIL",
    );
  }
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  const final = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  console.log(JSON.stringify({ cases, finalPlan: { sessions: final?.sessions, summary: final?.summary } }, null, 2));
  await browser.close();
}
