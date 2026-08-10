/**
 * QA harness — post-deploy acceptance of the REQ-030 batch on `sid` (2026-08-04, live).
 * Covers REQ-030 (incl. the delivered-cancel-with-reason behaviour change), REQ-037 (extra paid
 * session) and OBS-3 (plan-diff preview + `insertable`).
 *
 * Footprint: creates ONE course package for the QA-owned student `QA-expv-student` and only ever
 * edits that course's own sessions. Reported at the end for the ledger.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const QA_STUDENT_ID = "be5192a8-9634-4b81-a1c8-cb7a7f855995";
const shot = (page, n) => page.screenshot({ path: `${OUT}/sid-r30-${n}.png` });

const cases = [];
const record = (req, id, expected, actual, result) => {
  cases.push({ req, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${req}] ${id} — ${String(actual).slice(0, 230)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const created = { courseId: null, extraBookingId: null };
/** counted plan rows = COURSE_PACKAGE rows that are not cancelled/leave */
const counted = (plan) =>
  plan.sessions.filter((s) => s.bookingType !== "SINGLE_SESSION" && /PENDING|CONFIRMED|ATTENDED|EXTENDED|NO_SHOW/.test(s.status)).length;
const getPlan = async () => (await A("GET", `/entitlements/${created.courseId}/plan`)).json;

try {
  // ── setup: a free slot, then a course of my own ────────────────────────
  const teachers = (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers);
  let picked = null;
  const REUSE = process.env.COURSE_ID;
  for (const day of [7, 8, 9, 10]) {
    for (const time of ["11:00", "15:00", "16:00", "14:00"]) {
      const av = await A("GET", `/slots/availability?date=${iso(day)}&startTime=${time}`);
      const free = (av.json?.teachers ?? []).find((t) => t.available && teachers.find((x) => x.id === t.teacher.id)?.subjects?.length);
      if (free) {
        picked = { date: iso(day), time, teacher: teachers.find((x) => x.id === free.teacher.id) };
        break;
      }
    }
    if (picked) break;
  }
  const subject = picked.teacher.subjects.find((s) => !/1st trial/i.test(s.name)) ?? picked.teacher.subjects[0];
  const mk = REUSE ? { status: 201, json: { course: { id: REUSE } }, text: "reused" } : await A("POST", "/courses", {
    student: { id: QA_STUDENT_ID },
    teacherId: picked.teacher.id,
    subjectId: subject.id,
    size: 4,
    startDate: picked.date,
    startTime: picked.time,
    note: "QA post-deploy acceptance REQ-030/037/OBS-3 — Tanya 2026-08-04",
  });
  created.courseId = mk.json?.course?.id ?? mk.json?.id;
  console.error(`setup: course ${created.courseId} · ${picked.teacher.nickname} · ${subject.name} · ${picked.date} ${picked.time}`);
  if (!created.courseId) throw new Error(`course create failed ${mk.status}: ${mk.text}`);

  let plan = await getPlan();
  record("REQ-030", "DTO — the plan carries the new fields", "`insertable` + per-row `bookingType`", `insertable=${plan.insertable} · bookingTypes=${[...new Set(plan.sessions.map((s) => s.bookingType))].join(",")} · rows=${plan.sessions.length}`, plan.insertable !== undefined && plan.sessions.every((s) => s.bookingType) ? "PASS" : "FAIL");

  // ── OBS-3: the dry-run preview endpoint writes NOTHING ─────────────────
  const s2 = plan.sessions[1];
  const pv = await A("POST", `/courses/${created.courseId}/plan/preview`, { kind: "move", bookingId: s2.id, startTime: "17:00" });
  const afterPv = await getPlan();
  record(
    "OBS-3",
    "preview is a dry run — returns the resulting plan and writes nothing",
    "200 {resultingSessions, liveEndDate, moves}; the real plan is unchanged",
    `${pv.status} keys=${Object.keys(pv.json ?? {}).join(",")} resulting=${pv.json?.resultingSessions?.length} newEnd=${pv.json?.liveEndDate} · server still says session2 ${afterPv.sessions[1]?.startTime}`,
    pv.status === 200 && Array.isArray(pv.json?.resultingSessions) && afterPv.sessions[1].startTime === s2.startTime ? "PASS" : "FAIL",
  );

  // ── OBS-3: a refusal in dry-run carries the SAME typed reason ──────────
  const s1 = plan.sessions[0];
  const pvBad = await A("POST", `/courses/${created.courseId}/plan/preview`, { kind: "move", bookingId: plan.sessions[2].id, date: s1.date, startTime: s1.startTime.slice(0, 5), teacherId: s1.teacher.id });
  record("OBS-3", "a refused change fails in preview with the same typed reason", "4xx SLOT_TAKEN, no confirm dialog possible", `${pvBad.status} ${pvBad.text.slice(0, 140)}`, pvBad.status >= 400 && /SLOT_TAKEN/.test(pvBad.text) ? "PASS" : "FAIL");

  // ── REQ-030: teacher-change 3-day notice ───────────────────────────────
  // a session inside 3 days + a different teacher ⇒ TEACHER_CHANGE_TOO_LATE
  const soonDate = iso(1);
  const otherTeacher = teachers.find((t) => t.id !== picked.teacher.id && t.active && t.subjects?.length);
  const moveSoon = await A("POST", `/courses/${created.courseId}/plan`, { kind: "move", bookingId: plan.sessions[3].id, date: soonDate, startTime: "10:00" });
  const planA = await getPlan();
  const soonRow = planA.sessions.find((s) => s.date === soonDate);
  const late = soonRow
    ? await A("POST", `/courses/${created.courseId}/plan`, { kind: "move", bookingId: soonRow.id, teacherId: otherTeacher.id, subjectId: otherTeacher.subjects[0].id })
    : { status: 0, text: "could not stage a session inside the notice window" };
  record(
    "REQ-030",
    "teacher-change inside the 3-day notice is refused",
    "4xx TEACHER_CHANGE_TOO_LATE",
    `stage move ${moveSoon.status} · change-teacher ${late.status} ${late.text.slice(0, 160)}`,
    late.status >= 400 && /TEACHER_CHANGE_TOO_LATE|แจ้งล่วงหน้า/i.test(late.text) ? "PASS" : "FAIL",
  );
  const lateOverride = soonRow
    ? await A("POST", `/courses/${created.courseId}/plan`, { kind: "move", bookingId: soonRow.id, teacherId: otherTeacher.id, subjectId: otherTeacher.subjects[0].id, override: true })
    : { status: 0, text: "" };
  record("REQ-030", "admin override bypasses the notice", "200 with override:true", `${lateOverride.status} ${lateOverride.text.slice(0, 120)}`, lateOverride.status === 200 ? "PASS" : "FAIL");

  // ── REQ-030: planned absence keeps the course at size ──────────────────
  plan = await getPlan();
  const before = counted(plan);
  const absTarget = plan.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.date > iso(2));
  const abs = await A("POST", `/courses/${created.courseId}/plan`, { kind: "mark-absence", bookingId: absTarget.id, planned: true });
  plan = await getPlan();
  record(
    "REQ-030",
    "a planned absence keeps the course at size",
    "the absent row leaves the plan and one appended row takes its place — counted rows unchanged",
    `${abs.status} · counted ${before} → ${counted(plan)} · appended=${JSON.stringify(abs.json?.appended ?? abs.json?.moves?.appended ?? null)} · statuses ${plan.sessions.map((s) => s.status).join(",")}`,
    abs.status === 200 && counted(plan) === before ? "PASS" : "FAIL",
  );

  // ── OBS-3: insertable stays TRUE after an absence (owed==0 but appended) ─
  record(
    "OBS-3",
    "post-absence the course stays insertable even at owedCount 0",
    "insertable=true while owedCount=0 (an EXTENDED exists to reschedule)",
    `insertable=${plan.insertable} · owedCount=${plan.summary.owedCount}`,
    plan.insertable === true ? "PASS" : "FAIL",
  );

  // ── REQ-030: insert ────────────────────────────────────────────────────
  const insCount = counted(plan);
  const ins = await A("POST", `/courses/${created.courseId}/plan`, { kind: "insert", teacherId: picked.teacher.id, subjectId: subject.id, date: iso(25), startTime: "11:00" });
  plan = await getPlan();
  record(
    "REQ-030",
    "insert places the trailing session in the chosen slot",
    "200; a row appears at the chosen date/time; counted rows unchanged",
    `${ins.status} · placed=${plan.sessions.some((s) => s.date === iso(25) && s.startTime.startsWith("11:00"))} · counted ${insCount} → ${counted(plan)}`,
    ins.status === 200 && plan.sessions.some((s) => s.date === iso(25)) && counted(plan) === insCount ? "PASS" : "FAIL",
  );

  // ── REQ-030 (behaviour change): a LIVE-row cancel RE-OWES ──────────────
  const liveBefore = counted(plan);
  const liveVictim = plan.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.date > iso(2));
  const liveCancel = await A("PATCH", `/bookings/${liveVictim.id}/status`, { action: "cancel" });
  plan = await getPlan();
  record(
    "REQ-030",
    "🆕 a live-row cancel RE-OWES (a cancel is a reschedule, not a forfeit)",
    "cancel accepted with no reason; counted rows return to size (a make-up appended)",
    `${liveCancel.status} · counted ${liveBefore} → ${counted(plan)} · size=${plan.summary.size} · statuses ${plan.sessions.map((s) => s.status).join(",")}`,
    liveCancel.status === 200 && counted(plan) === liveBefore ? "PASS" : "FAIL",
  );

  // ── REQ-030 (behaviour change): DELIVERED rows ─────────────────────────
  // stage a delivered row: move one into the past, confirm, attend
  const pastTarget = plan.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.bookingType === "COURSE_PACKAGE");
  await A("POST", `/courses/${created.courseId}/plan`, { kind: "move", bookingId: pastTarget.id, date: iso(-2), startTime: "09:00" });
  await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "confirm" });
  const attended = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "attend" });
  record("REQ-030", "setup — a delivered (ATTENDED) row exists", "attend accepted", `${attended.status}`, attended.status === 200 ? "PASS" : "BLOCKED");

  const movDelivered = await A("POST", `/courses/${created.courseId}/plan`, { kind: "move", bookingId: pastTarget.id, startTime: "15:00" });
  record(
    "REQ-030",
    "delivered rows still REFUSE edit/move",
    "4xx SESSION_DELIVERED",
    `${movDelivered.status} ${movDelivered.text.slice(0, 150)}`,
    movDelivered.status >= 400 && /SESSION_DELIVERED/.test(movDelivered.text) ? "PASS" : "FAIL",
  );

  const noReason = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "cancel" });
  record(
    "REQ-030",
    "🆕 cancelling a DELIVERED row with NO reason is refused",
    "4xx REASON_REQUIRED",
    `${noReason.status} ${noReason.text.slice(0, 150)}`,
    noReason.status >= 400 && /REASON_REQUIRED|ต้องระบุเหตุผล/.test(noReason.text) ? "PASS" : "FAIL",
  );
  const blankReason = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "cancel", reason: "   " });
  record(
    "REQ-030",
    "🆕 a whitespace-only reason is also refused",
    "4xx REASON_REQUIRED (trimmed)",
    `${blankReason.status} ${blankReason.text.slice(0, 120)}`,
    blankReason.status >= 400 ? "PASS" : "FAIL",
  );

  const delBefore = counted(plan);
  const withReason = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "cancel", reason: "QA acceptance — mis-marked attendance" });
  plan = await getPlan();
  const cancelledRow = plan.sessions.find((s) => s.id === pastTarget.id);
  record(
    "REQ-030",
    "🆕 cancelling a DELIVERED row WITH a reason succeeds and a make-up appears",
    "200; the row is CANCELLED; counted rows back to size; the reason is stored",
    `${withReason.status} · row now ${cancelledRow?.status ?? "gone from plan"} · counted ${delBefore} → ${counted(plan)} · note="${(withReason.json?.booking?.note ?? "").slice(0, 60)}"`,
    withReason.status === 200 && counted(plan) === delBefore ? "PASS" : "FAIL",
  );

  // ── REQ-037: the extra PAID session ────────────────────────────────────
  const beforeExtra = { counted: counted(plan), size: plan.summary.size, end: plan.liveEndDate };
  const extra = await A("POST", `/courses/${created.courseId}/extra-session`, {
    teacherId: picked.teacher.id,
    subjectId: subject.id,
    date: iso(30),
    startTime: "11:00",
  });
  created.extraBookingId = extra.json?.id ?? extra.json?.booking?.id;
  plan = await getPlan();
  const extraRow = plan.sessions.find((s) => s.bookingType === "SINGLE_SESSION");
  record(
    "REQ-037",
    "the extra session is added as a SINGLE_SESSION and does NOT change the course",
    "201/200; row bookingType=SINGLE_SESSION; size, counted rows and end date unchanged",
    `${extra.status} · extraRow=${extraRow ? `${extraRow.date} ${extraRow.bookingType}` : "none"} · counted ${beforeExtra.counted} → ${counted(plan)} · size ${beforeExtra.size} → ${plan.summary.size} · end ${beforeExtra.end} → ${plan.liveEndDate}`,
    extra.status < 300 && !!extraRow && counted(plan) === beforeExtra.counted && plan.summary.size === beforeExtra.size && plan.liveEndDate === beforeExtra.end ? "PASS" : "FAIL",
  );

  const extraCancel = created.extraBookingId ? await A("PATCH", `/bookings/${created.extraBookingId}/status`, { action: "cancel" }) : { status: 0, text: "no id" };
  const planAfterExtraCancel = await getPlan();
  record(
    "REQ-037",
    "cancelling the extra does NOT re-owe",
    "counted rows unchanged (no make-up appended for a paid extra)",
    `${extraCancel.status} · counted ${counted(plan)} → ${counted(planAfterExtraCancel)} · owed ${plan.summary.owedCount} → ${planAfterExtraCancel.summary.owedCount}`,
    extraCancel.status === 200 && counted(planAfterExtraCancel) === counted(plan) ? "PASS" : "FAIL",
  );
  plan = planAfterExtraCancel;

  // ── REQ-030: the orphaned-session net (read-only) ──────────────────────
  const impact = await A("GET", `/teachers/${picked.teacher.id}/work-days/impact?workDays=0`);
  record(
    "REQ-030",
    "orphan pre-check — work-days impact reports what a change would orphan",
    "{removedDays, orphanCount, sessions[]} over future LIVE bookings",
    `${impact.status} ${impact.text.slice(0, 180)}`,
    impact.status === 200 && impact.json?.orphanCount !== undefined ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  const final = created.courseId ? await getPlan() : null;
  console.log(JSON.stringify({ cases, created, finalPlan: final ? { sessions: final.sessions, summary: final.summary, insertable: final.insertable, liveEndDate: final.liveEndDate } : null }, null, 2));
  await browser.close();
}
