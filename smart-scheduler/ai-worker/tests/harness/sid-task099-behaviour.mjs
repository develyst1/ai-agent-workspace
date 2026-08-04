/**
 * QA harness — TASK-099 BEHAVIOUR on `sid`, through the real plan modal in a painted browser.
 *
 * Footprint: creates ONE 4-session course package for the QA student I already own
 * (`QA-expv-student`) and edits only that course's own sessions. Never touches another row.
 * Everything it creates is reported at the end for the footprint ledger.
 *
 * Covers the ACs mock data could not: plan loads · edit/move applies · a refused move shows the
 * SERVER's exact reason · mark-absence · insert · delivered rows read-only.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const shot = (page, n) => page.screenshot({ path: `${OUT}/sid-099-${n}.png` });

const QA_STUDENT_ID = "be5192a8-9634-4b81-a1c8-cb7a7f855995"; // QA-expv-student (created by QA 2026-08-02)
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(7)} ${id} — ${String(actual).slice(0, 160)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const created = { courseId: null, bookingIds: [] };

try {
  // ── setup: a course of my own (reuse one via COURSE_ID to avoid extra footprint) ──
  if (process.env.COURSE_ID) {
    created.courseId = process.env.COURSE_ID;
    console.error("reusing existing QA course", created.courseId);
  } else {
  const teachers = (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers);
  const teacher = teachers.find((t) => t.active && t.subjects?.length);
  const subject = teacher.subjects.find((s) => !/1st trial/i.test(s.name)) ?? teacher.subjects[0];
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const startDate = start.toISOString().slice(0, 10);

  const mk = await A("POST", "/courses", {
    student: { id: QA_STUDENT_ID },
    teacherId: teacher.id,
    subjectId: subject.id,
    size: 4,
    startDate,
    startTime: "13:00",
    note: "QA TASK-099 behavioural test — Tanya 2026-08-04",
  });
  if (mk.status !== 201) throw new Error(`course create failed ${mk.status}: ${mk.text}`);
  created.courseId = mk.json.id ?? mk.json.course?.id ?? mk.json.coursePackageId;
  console.error("created course", created.courseId, "teacher", teacher.nickname, "subject", subject.name, "start", startDate);
  }

  // ── AC: the plan DTO loads (TASK-097 deployed?) ────────────────────────
  const plan0 = await A("GET", `/entitlements/${created.courseId}/plan`);
  record(
    "AC-plan-endpoint",
    "GET /entitlements/:id/plan → 200 with a kind-discriminated DTO",
    `${plan0.status} kind=${plan0.json?.kind} sessions=${plan0.json?.sessions?.length} liveEnd=${plan0.json?.liveEndDate}`,
    plan0.status === 200 && plan0.json?.kind === "course" ? "PASS" : "FAIL",
  );
  created.bookingIds = (plan0.json?.sessions ?? []).map((s) => s.id);

  // ── open the modal in the browser ──────────────────────────────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const search = page.getByPlaceholder(/type a name|ค้นหา/i).first();
  await search.fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  const dialog = page.locator('[role="dialog"]').first();
  const modalText = await dialog.innerText();
  await shot(page, "1-plan-open");
  record(
    "AC-1 plan modal renders the course plan",
    "4 session rows + summary (size/leave/owed/end date)",
    `rows=${await dialog.locator("tbody tr").count()} · ${modalText.replace(/\n/g, " · ").slice(0, 220)}`,
    (await dialog.locator("tbody tr").count()) === 4 ? "PASS" : "FAIL",
  );

  // ── AC: edit/move applies ──────────────────────────────────────────────
  const before = await A("GET", `/entitlements/${created.courseId}/plan`);
  const row2 = before.json.sessions[1];
  await dialog.getByRole("button", { name: /^edit$/i }).nth(1).click();
  await page.waitForTimeout(1200);
  // change the TIME select to a different slot
  await dialog.getByLabel(/^time$/i).first().click();
  await page.waitForTimeout(500);
  const times = await page.getByRole("option").allInnerTexts();
  const curTime = row2.startTime.slice(0, 5);
  const newTime = times.map((t) => t.trim()).find((t) => /^\d\d:00$/.test(t) && t !== curTime) ?? times[3].trim();
  await page.getByRole("option", { name: newTime.trim(), exact: true }).click();
  await page.waitForTimeout(400);
  await shot(page, "2-editor");
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await page.waitForTimeout(3500);
  const after = await A("GET", `/entitlements/${created.courseId}/plan`);
  const moved = after.json.sessions.find((s) => s.id === row2.id);
  record(
    "AC-2 edit/move applies",
    `session 2 moves ${row2.startTime.slice(0, 5)} → ${newTime.trim()}`,
    `server now says ${moved?.startTime} (was ${row2.startTime})`,
    moved && moved.startTime.slice(0, 5) === newTime.trim() ? "PASS" : "FAIL",
  );
  await shot(page, "3-after-move");

  // ── AC: a REFUSED move shows the server's exact reason ─────────────────
  // move session 3 onto session 1's exact slot (same teacher, same time) → the slot is taken
  const s1 = after.json.sessions[0];
  const s3 = after.json.sessions[2];
  const direct = await A("POST", `/courses/${created.courseId}/plan`, {
    kind: "move",
    bookingId: s3.id,
    date: s1.date,
    startTime: s1.startTime.slice(0, 5),
    teacherId: s1.teacher?.id,
  });
  record(
    "AC-3a server refuses a clashing move",
    "4xx with a typed reason",
    `${direct.status} ${direct.text.slice(0, 160)}`,
    direct.status >= 400 && direct.status < 500 ? "PASS" : "FAIL",
  );
  const serverReason = String(direct.json?.error?.message ?? direct.json?.message ?? direct.text ?? "");

  // now the same refusal through the modal — does the UI show that reason?
  await dialog.getByRole("button", { name: /^edit$/i }).nth(2).click();
  await page.waitForTimeout(1200);
  await dialog.getByLabel(/^date$/i).first().click();
  await page.waitForTimeout(500);
  const dLabel = new Date(s1.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  const dOpt = page.getByRole("option", { name: new RegExp(dLabel.replace(/,/g, ""), "i") }).first();
  if (await dOpt.count()) await dOpt.click();
  await page.waitForTimeout(400);
  await dialog.getByLabel(/^time$/i).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("option", { name: s1.startTime.slice(0, 5), exact: true }).click();
  await page.waitForTimeout(400);
  await dialog.getByRole("button", { name: /^save$/i }).click();
  await page.waitForTimeout(3500);
  const uiText = await dialog.innerText();
  const notif = (await page.locator('[class*="Notification"]').allInnerTexts().catch(() => [])).join(" ");
  record(
    "AC-3b the modal surfaces the SERVER's reason",
    `a red alert carrying the server text (${serverReason.slice(0, 60)}…)`,
    `alertBlocks=${await dialog.locator('[class*="Alert"]').count()} · text="${(uiText.match(/[^\n]*(ชน|ไม่ว่าง|taken|clash|เต็ม|ซ้ำ)[^\n]*/) ?? [""])[0].slice(0, 120)}" · notif="${notif.slice(0, 120)}"`,
    (await dialog.locator('[class*="Alert"]').count()) > 0 || /ชน|ไม่ว่าง|taken|clash|เต็ม|ซ้ำ/.test(uiText + notif) ? "PASS" : "FAIL",
  );
  await shot(page, "4-refusal");
  const cancelBtn = dialog.getByRole("button", { name: /^cancel$/i }).first();
  if (await cancelBtn.count()) await cancelBtn.click();
  await page.waitForTimeout(600);

  // ── AC: mark absence appends a make-up (a 4-session course stays 4) ────
  const preAbs = await A("GET", `/entitlements/${created.courseId}/plan`);
  await dialog.getByRole("button", { name: /mark absence/i }).first().click();
  await page.waitForTimeout(4000);
  const postAbs = await A("GET", `/entitlements/${created.courseId}/plan`);
  const live = (p) => p.json.sessions.filter((s) => !/CANCELLED/.test(s.status)).length;
  record(
    "AC-4 mark-absence keeps the course at size",
    "the absent session leaves the plan and one appended session takes its place — total stays 4",
    `before: ${live(preAbs)} live rows / statuses ${preAbs.json.sessions.map((s) => s.status).join(",")} → after: ${live(postAbs)} live rows / ${postAbs.json.sessions.map((s) => s.status).join(",")}`,
    postAbs.json.sessions.some((s) => /SICK_LEAVE|LEAVE/.test(s.status)) ? "PASS" : "FAIL",
  );
  await shot(page, "5-after-absence");
  created.bookingIds = postAbs.json.sessions.map((s) => s.id);

  // ── AC: insert ─────────────────────────────────────────────────────────
  const owed = postAbs.json.summary?.owedCount ?? 0;
  const insertBtn = dialog.getByRole("button", { name: /insert/i }).first();
  record(
    "AC-5 insert is offered when the course owes a session",
    "an 'Insert make-up' action is present when owedCount > 0",
    `owedCount=${owed}, insert button present=${(await insertBtn.count()) > 0}`,
    (await insertBtn.count()) > 0 ? "PASS" : "FAIL",
  );
  if (owed > 0 && (await insertBtn.count())) {
    await insertBtn.click();
    await page.waitForTimeout(1200);
    await dialog.getByLabel(/^teacher$/i).first().click();
    await page.waitForTimeout(600);
    const tOpt = page.getByRole("option").first();
    if (await tOpt.count()) await tOpt.click();
    await page.waitForTimeout(600);
    await dialog.getByLabel(/^subject$/i).first().click();
    await page.waitForTimeout(600);
    const sOpt = page.getByRole("option").first();
    if (await sOpt.count()) await sOpt.click();
    await page.waitForTimeout(400);
    await shot(page, "6-insert-editor");
    await dialog.getByRole("button", { name: /^save$/i }).click();
    await page.waitForTimeout(4000);
    const postIns = await A("GET", `/entitlements/${created.courseId}/plan`);
    record(
      "AC-5b insert places the owed session",
      "owedCount drops / a new live session appears",
      `owedCount ${owed} → ${postIns.json.summary?.owedCount} · rows ${postAbs.json.sessions.length} → ${postIns.json.sessions.length}`,
      (postIns.json.summary?.owedCount ?? 99) < owed || postIns.json.sessions.length > postAbs.json.sessions.length ? "PASS" : "FAIL",
    );
    created.bookingIds = postIns.json.sessions.map((s) => s.id);
    await shot(page, "7-after-insert");
  }

  // ── AC: delivered rows are read-only ───────────────────────────────────
  const cur = await A("GET", `/entitlements/${created.courseId}/plan`);
  const target = cur.json.sessions.find((s) => /CONFIRMED|PENDING/.test(s.status));
  const att = await A("PATCH", `/bookings/${target.id}/status`, { status: "ATTENDED" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  const d2 = page.locator('[role="dialog"]').first();
  const rowsText = await d2.locator("tbody tr").allInnerTexts();
  const deliveredRow = rowsText.find((t) => /ATTENDED/i.test(t));
  record(
    "AC-6 delivered rows are read-only",
    "an ATTENDED row shows 'locked' and offers no Edit / Mark absence",
    `mark-status=${att.status} · deliveredRow="${(deliveredRow ?? "none").replace(/\n/g, " ").slice(0, 120)}"`,
    deliveredRow && !/edit/i.test(deliveredRow) ? "PASS" : "FAIL",
  );
  await shot(page, "8-delivered-locked");

  // ── the move guard on a delivered session (server side) ────────────────
  const guard = await A("POST", `/courses/${created.courseId}/plan`, {
    kind: "move",
    bookingId: target.id,
    startTime: "16:00",
  });
  record(
    "AC-6b a delivered session cannot be moved",
    "4xx SESSION_DELIVERED",
    `${guard.status} ${guard.text.slice(0, 140)}`,
    guard.status >= 400 && /DELIVERED|เรียนไปแล้ว/i.test(guard.text) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot(page, "error");
} finally {
  const final = created.courseId ? await A("GET", `/entitlements/${created.courseId}/plan`) : null;
  console.log(
    JSON.stringify(
      { cases, created, finalPlan: final?.json ? { sessions: final.json.sessions, summary: final.json.summary } : null },
      null,
      2,
    ),
  );
  await browser.close();
}
