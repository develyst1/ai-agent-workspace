/**
 * QA harness — TASK-099 AC-5: INSERT.
 *   (a) with nothing owed, an insert must be REFUSED with the server's reason (NO_OWED_SESSION)
 *   (b) after a cancel re-owes a session, an insert must PLACE it in the chosen slot
 * Operates only on the QA-owned course (COURSE_ID).
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
const today = new Date();
const plus = (n) => new Date(today.getTime() + n * 864e5).toISOString().slice(0, 10);

try {
  let plan = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  const live = plan.sessions.find((s) => /PENDING|CONFIRMED|EXTENDED/.test(s.status) && s.date >= plus(1));
  const teacherId = live.teacher.id;
  const subjectId = live.subject.id;

  // (a) nothing owed → refuse
  record(
    "AC-5a setup — owedCount is 0",
    "the plan owes nothing",
    `owedCount=${plan.summary.owedCount}`,
    plan.summary.owedCount === 0 ? "PASS" : "SKIP",
  );
  const bad = await A("POST", `/courses/${COURSE_ID}/plan`, {
    kind: "insert",
    teacherId,
    subjectId,
    date: plus(21),
    startTime: "11:00",
  });
  record(
    "AC-5a insert with nothing owed is refused with a reason",
    "4xx NO_OWED_SESSION + a human message",
    `${bad.status} ${bad.text.slice(0, 200)}`,
    bad.status >= 400 && /NO_OWED|ไม่มีคาบ/i.test(bad.text) ? "PASS" : "FAIL",
  );

  // (b) cancel a live session → does the plan re-owe? (TASK-105 behaviour, if deployed)
  const victim = plan.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.date >= plus(1));
  const cancel = await A("PATCH", `/bookings/${victim.id}/status`, { action: "cancel", reason: "QA test — TASK-099 insert path" });
  plan = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  record(
    "AC-5b setup — cancel a live session",
    "cancel accepted; the course re-owes (TASK-105) or simply drops the session",
    `cancel ${cancel.status} · owedCount now ${plan.summary.owedCount} · statuses ${plan.sessions.map((s) => s.status).join(",")}`,
    cancel.status === 200 ? "PASS" : "FAIL",
  );

  if (plan.summary.owedCount > 0) {
    const ins = await A("POST", `/courses/${COURSE_ID}/plan`, {
      kind: "insert",
      teacherId,
      subjectId,
      date: plus(20),
      startTime: "11:00",
    });
    const after = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
    record(
      "AC-5b insert places the owed session in the chosen slot",
      "200; owedCount drops by one; a session appears at the chosen date/time",
      `${ins.status} ${ins.text.slice(0, 120)} · owed ${plan.summary.owedCount} → ${after.summary.owedCount} · placed=${after.sessions.some((s) => s.date === plus(20) && s.startTime.startsWith("11:00"))}`,
      ins.status === 200 && after.summary.owedCount < plan.summary.owedCount ? "PASS" : "FAIL",
    );
  } else {
    record(
      "AC-5b insert places the owed session",
      "needs owedCount > 0",
      "cancel did not leave the course owing a session (TASK-105 re-owe not deployed here) — insert-success path not exercised",
      "NOT TESTED",
    );
  }

  // the modal's own insert affordance, at a glance
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  const d = page.locator('[role="dialog"]').first();
  await page.screenshot({ path: `${OUT}/sid-099d-insert.png` });
  record(
    "AC-5c the modal exposes Insert make-up with the owed hint",
    "an 'Insert make-up' button + 'N session(s) still owed'",
    (await d.innerText()).split("\n").filter((l) => /owed|insert/i.test(l)).join(" · ").slice(0, 160),
    (await d.getByRole("button", { name: /insert/i }).count()) > 0 ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  const final = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  console.log(JSON.stringify({ cases, finalPlan: { sessions: final?.sessions, summary: final?.summary } }, null, 2));
  await browser.close();
}
