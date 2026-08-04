/**
 * QA harness — the two TASK-099 ACs the first behavioural run could not set up deterministically:
 *   AC-3b  a REFUSED move shows the SERVER's exact reason in the modal
 *   AC-6   a delivered (ATTENDED) session is read-only in the plan table, and the server blocks its move
 * Operates only on the QA-owned course (COURSE_ID).
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const COURSE_ID = process.env.COURSE_ID;
const shot = (page, n) => page.screenshot({ path: `${OUT}/sid-099b-${n}.png` });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(7)} ${id} — ${String(actual).slice(0, 200)}`);
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** the same label the modal's Date select renders: dayjs("ddd D MMM") */
const dayLabel = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);

const openPlan = async () => {
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  return page.locator('[role="dialog"]').first();
};

try {
  const plan = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  const live = plan.sessions.filter((s) => /PENDING|CONFIRMED|EXTENDED/.test(s.status));
  const anchor = live[0]; // an occupied slot (this session's own teacher+date+time)
  const victim = live[1]; // the one we will try to move onto it
  console.error("anchor", anchor.date, anchor.startTime, "victim", victim.date, victim.startTime);

  // ── AC-3b — drive the SAME clash through the modal ─────────────────────
  const dialog = await openPlan();
  const rows = await dialog.locator("tbody tr").allInnerTexts();
  const victimIdx = rows.findIndex((t) => t.includes(String(new Date(victim.date + "T00:00:00").getDate())));
  await dialog.getByRole("button", { name: /^edit$/i }).nth(Math.max(victimIdx, 0)).click();
  await page.waitForTimeout(1200);

  await dialog.getByLabel(/^date$/i).first().click();
  await page.waitForTimeout(600);
  await page.getByRole("option", { name: dayLabel(anchor.date), exact: true }).click();
  await page.waitForTimeout(500);
  await dialog.getByLabel(/^time$/i).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("option", { name: anchor.startTime.slice(0, 5), exact: true }).click();
  await page.waitForTimeout(500);
  // make sure the teacher is the one holding the anchor slot
  await dialog.getByLabel(/^teacher$/i).first().click();
  await page.waitForTimeout(600);
  const tOpt = page.getByRole("option", { name: new RegExp(`^${anchor.teacher.nickname}`, "i") }).first();
  if (await tOpt.count()) await tOpt.click();
  await page.waitForTimeout(600);
  await shot(page, "1-editor-clash-setup");
  const availabilityText = await dialog.innerText();

  await dialog.getByRole("button", { name: /^save$/i }).click();
  await page.waitForTimeout(4000);
  const uiText = await dialog.innerText();
  const notif = (await page.locator('[class*="Notification"]').allInnerTexts().catch(() => [])).join(" ");
  const alertCount = await dialog.locator('[class*="Alert"]').count();
  const after = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  const victimAfter = after.sessions.find((s) => s.id === victim.id);
  record(
    "AC-3b modal surfaces the server's refusal reason",
    'a red alert carrying the server text ("ครูมีคาบในช่วงเวลานี้แล้ว"), and the move does NOT apply',
    `alertBlocks=${alertCount} · alertText="${(uiText.match(/ครู[^\n]*|[^\n]*SLOT[^\n]*/) ?? [""])[0].slice(0, 120)}" · notif="${notif.slice(0, 160)}" · victim now ${victimAfter?.date} ${victimAfter?.startTime}`,
    alertCount > 0 && /ครูมีคาบ|SLOT_TAKEN/.test(uiText) ? "PASS" : "FAIL",
  );
  record(
    "AC-3b(i) availability view flags the taken slot before saving",
    "the clash owner is shown on the teacher badge (BOOKED · <student>)",
    (availabilityText.match(/[A-Za-zก-๙]+ · BOOKED[^\n]*/i) ?? ["not found"])[0].slice(0, 120),
    /BOOKED/i.test(availabilityText) ? "PASS" : "FAIL",
  );
  await shot(page, "2-refusal");

  // ── AC-6 — a delivered session must be read-only ───────────────────────
  // set one of MY sessions to a past date first (past-dated bookings are allowed — owner ruling),
  // because a future session cannot be marked ATTENDED.
  const past = new Date();
  past.setDate(past.getDate() - 3);
  const pastDate = past.toISOString().slice(0, 10);
  const target = after.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status));
  const moveBack = await A("POST", `/courses/${COURSE_ID}/plan`, {
    kind: "move",
    bookingId: target.id,
    date: pastDate,
    startTime: "09:00",
  });
  const att = await A("PATCH", `/bookings/${target.id}/status`, { action: "attend" });
  record(
    "AC-6 setup — a session can be delivered",
    "move to a past date, then mark ATTENDED",
    `move ${moveBack.status} ${moveBack.text.slice(0, 90)} · attend ${att.status} ${att.text.slice(0, 90)}`,
    att.status === 200 ? "PASS" : "BLOCKED",
  );

  if (att.status === 200) {
    const d2 = await openPlan();
    const rows2 = await d2.locator("tbody tr").allInnerTexts();
    const delivered = rows2.find((t) => /ATTENDED/i.test(t));
    record(
      "AC-6 delivered rows are read-only in the plan table",
      "the ATTENDED row shows 'locked' and offers no Edit / Mark absence",
      `row="${(delivered ?? "none").replace(/\n/g, " · ").slice(0, 160)}"`,
      delivered && !/edit/i.test(delivered) ? "PASS" : "FAIL",
    );
    await shot(page, "3-delivered-locked");

    const guard = await A("POST", `/courses/${COURSE_ID}/plan`, {
      kind: "move",
      bookingId: target.id,
      startTime: "15:00",
    });
    record(
      "AC-6b the server refuses to move a delivered session",
      "4xx SESSION_DELIVERED",
      `${guard.status} ${guard.text.slice(0, 160)}`,
      guard.status >= 400 && /DELIVERED|เรียนไปแล้ว|แก้ไข/i.test(guard.text) ? "PASS" : "FAIL",
    );
  }
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot(page, "error");
} finally {
  const final = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  console.log(JSON.stringify({ cases, finalPlan: { sessions: final?.sessions, summary: final?.summary } }, null, 2));
  await browser.close();
}
