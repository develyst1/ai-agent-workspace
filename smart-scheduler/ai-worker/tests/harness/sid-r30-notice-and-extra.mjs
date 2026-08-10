/**
 * QA harness — re-runs the two checks the first pass could not stage correctly:
 *   REQ-030  teacher-change inside the 3-day notice (the first run picked the SAME teacher, so no swap happened)
 *   REQ-037  the extra paid session (the first run got a 400 whose body was not captured)
 * Both derive teacher/subject from the course's OWN plan, so the staging can't drift again.
 */
import { openSidSession, api } from "./sid-session.mjs";

const COURSE_ID = process.env.COURSE_ID;
const cases = [];
const record = (req, id, expected, actual, result) => {
  cases.push({ req, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${req}] ${id} — ${String(actual).slice(0, 260)}`);
};

const { browser, origin, apiToken } = await openSidSession();
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const getPlan = async () => (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
const counted = (p) =>
  p.sessions.filter((s) => s.bookingType !== "SINGLE_SESSION" && /PENDING|CONFIRMED|ATTENDED|EXTENDED|NO_SHOW/.test(s.status)).length;

try {
  let plan = await getPlan();
  const ownTeacherId = plan.sessions.find((s) => s.teacher)?.teacher.id;
  const teachers = (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers);
  const mine = teachers.find((t) => t.id === ownTeacherId);
  console.error("course teacher =", mine?.nickname);

  // ── REQ-030 — teacher-change notice, with a genuinely DIFFERENT teacher ──
  const soonRow = plan.sessions.find((s) => /PENDING|CONFIRMED|EXTENDED/.test(s.status) && s.date <= iso(2) && s.date >= iso(0));
  let staged = soonRow;
  if (!staged) {
    const any = plan.sessions.find((s) => /PENDING|CONFIRMED|EXTENDED/.test(s.status));
    const mv = await A("POST", `/courses/${COURSE_ID}/plan`, { kind: "move", bookingId: any.id, date: iso(1), startTime: "10:00" });
    plan = await getPlan();
    staged = plan.sessions.find((s) => s.id === any.id);
    console.error("staged a session at", staged?.date, staged?.startTime, "move status", mv.status);
  }
  // a different, active teacher who can take the subject
  const other = teachers.find((t) => t.id !== ownTeacherId && t.active && (t.subjects ?? []).length);
  const late = await A("POST", `/courses/${COURSE_ID}/plan`, {
    kind: "move",
    bookingId: staged.id,
    teacherId: other.id,
    subjectId: other.subjects[0].id,
  });
  record(
    "REQ-030",
    "teacher-change inside the 3-day notice is refused",
    "4xx TEACHER_CHANGE_TOO_LATE (setting = 3 days, not overridden)",
    `class ${staged.date} ${staged.startTime} · ${mine?.nickname} → ${other.nickname} · ${late.status} ${late.text.slice(0, 170)}`,
    late.status >= 400 && /TEACHER_CHANGE_TOO_LATE|ล่วงหน้า/i.test(late.text) ? "PASS" : "FAIL",
  );

  // the same swap, far enough out, must be ALLOWED (proves the guard is a notice, not a block)
  const farRow = plan.sessions.find((s) => /PENDING|CONFIRMED|EXTENDED/.test(s.status) && s.date >= iso(10));
  const far = farRow
    ? await A("POST", `/courses/${COURSE_ID}/plan`, { kind: "move", bookingId: farRow.id, teacherId: other.id, subjectId: other.subjects[0].id })
    : { status: 0, text: "no far-out session to use" };
  record(
    "REQ-030",
    "the same teacher-change with enough notice is ALLOWED",
    "200 — the guard is a notice window, not a block on teacher changes",
    `class ${farRow?.date} · ${far.status} ${far.text.slice(0, 140)}`,
    far.status === 200 ? "PASS" : "FAIL",
  );

  // override on the too-late one
  const ovr = await A("POST", `/courses/${COURSE_ID}/plan`, {
    kind: "move",
    bookingId: staged.id,
    teacherId: other.id,
    subjectId: other.subjects[0].id,
    override: true,
  });
  record("REQ-030", "admin override bypasses the notice", "200 with override:true", `${ovr.status} ${ovr.text.slice(0, 130)}`, ovr.status === 200 ? "PASS" : "FAIL");

  // ── REQ-037 — the extra paid session, with the full error text ─────────
  plan = await getPlan();
  const before = { counted: counted(plan), size: plan.summary.size, end: plan.liveEndDate, owed: plan.summary.owedCount };
  // find a slot where the course's own teacher is genuinely free
  let slot = null;
  for (const d of [21, 22, 23, 24, 25, 28]) {
    for (const t of ["11:00", "14:00", "15:00", "16:00"]) {
      const av = await A("GET", `/slots/availability?date=${iso(d)}&startTime=${t}`);
      const row = (av.json?.teachers ?? []).find((x) => x.teacher.id === ownTeacherId);
      if (row?.available) {
        slot = { date: iso(d), time: t };
        break;
      }
    }
    if (slot) break;
  }
  const subjectId = plan.sessions.find((s) => s.subject)?.subject.id ?? mine.subjects[0].id;
  const extra = await A("POST", `/courses/${COURSE_ID}/extra-session`, {
    teacherId: ownTeacherId,
    subjectId,
    date: slot?.date ?? iso(21),
    startTime: slot?.time ?? "11:00",
  });
  plan = await getPlan();
  const extraRow = plan.sessions.find((s) => s.bookingType === "SINGLE_SESSION");
  record(
    "REQ-037",
    "the extra paid session is added as a SINGLE_SESSION and leaves the course untouched",
    "201; a SINGLE_SESSION row appears; counted rows, size and end date all unchanged",
    `slot=${slot?.date} ${slot?.time} · ${extra.status} ${extra.text.slice(0, 150)} · extraRow=${extraRow ? `${extraRow.date} ${extraRow.bookingType} ${extraRow.status}` : "none"} · counted ${before.counted}→${counted(plan)} · size ${before.size}→${plan.summary.size} · end ${before.end}→${plan.liveEndDate}`,
    extra.status < 300 && !!extraRow && counted(plan) === before.counted && plan.summary.size === before.size && plan.liveEndDate === before.end ? "PASS" : "FAIL",
  );

  const extraId = extraRow?.id;
  if (extraId) {
    const insertableBefore = plan.insertable;
    const cancel = await A("PATCH", `/bookings/${extraId}/status`, { action: "cancel" });
    const after = await getPlan();
    record(
      "REQ-037",
      "cancelling the extra does NOT re-owe",
      "counted rows and owedCount unchanged (no make-up appended for a paid extra)",
      `${cancel.status} · counted ${counted(plan)}→${counted(after)} · owed ${plan.summary.owedCount}→${after.summary.owedCount} · insertable ${insertableBefore}→${after.insertable}`,
      cancel.status === 200 && counted(after) === counted(plan) && after.summary.owedCount === plan.summary.owedCount ? "PASS" : "FAIL",
    );
  }
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  const final = await getPlan();
  console.log(JSON.stringify({ cases, finalPlan: { sessions: final?.sessions, summary: final?.summary, insertable: final?.insertable, liveEndDate: final?.liveEndDate } }, null, 2));
  await browser.close();
}
