/**
 * TEST-142 step runner (Twenty). Every created row is named "Twenty-…"; ids are kept in
 * tests/harness/state/test142-sid.json (no secrets, no personal data — test ids only).
 * Usage: node sid-task860-step.mjs <step>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openApi } from "./sid-twenty-api.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(here, "state", "test142-sid.json");
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
const S = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : {};
const save = () => fs.writeFileSync(STATE_FILE, JSON.stringify(S, null, 2));

const T = {
  Kid: "59c298af-c931-4051-a69d-e68a34d1bec2",
  New: "d33b65f6-3c1b-431a-bf71-798997e0567d",
  Print: "34ce6f67-2c2f-44d9-a928-b79266808ed8",
  Toth: "3cb5b02d-1235-420f-8a91-6998a51edcff",
  NoTeacher: "f57601fa-41ac-4971-a3df-615f00a25c28",
};
const SUB = {
  INLINE: "64a44651-ea10-42b2-b6fe-4007cd821c68",
  BIKE: "42c82993-3e80-4146-9216-b08de16b3453",
  SCOOTER: "6c36fe19-a0be-42ca-add3-bd7d35bfaa27",
  DUO_INLINE: "3b58b7ce-b23d-4fc3-8eff-6ce3bd0993ce",
};

const { browser, call } = await openApi();
const log = (label, r) => console.log(`${label} → ${r.status} ${r.text.slice(0, Number(process.env.MAX ?? 500))}`);

async function trial(key, name, phone, date, time, teacher = T.Kid, subject = SUB.INLINE) {
  const r = await call("POST", "/bookings", {
    student: { name, nickname: name, phone }, teacherId: teacher, subjectId: subject,
    date, startTime: time, bookingType: "FIRST_TRIAL",
  });
  log(`trial ${key}`, r);
  const b = r.json?.booking ?? r.json;
  if (r.status < 300) { S[key] = { bookingId: b.id, studentId: b.studentId ?? b.student?.id }; save(); }
  return r;
}
async function status(key, action, extra = {}) {
  const r = await call("PATCH", `/bookings/${S[key].bookingId}/status`, { action, ...extra });
  log(`${action} ${key}`, r);
  return r;
}

const LINK_KEYS = ["fromTrialBookingId", "prevCourseId", "prevVoucherId", "firstTeacherId", "coachChangedAt", "latestTeacherId", "bonus100Pick", "bonus100PickBy", "bonus100PickAt"];
const pickLinks = (o) => Object.fromEntries(LINK_KEYS.filter((k) => o && k in o).map((k) => [k, o[k]]));

async function course(key, studentKey, subject, teacher, startDate, startTime, size = 4, extra = {}) {
  const r = await call("POST", "/courses", {
    student: { id: S[studentKey].studentId }, teacherId: teacher, subjectId: subject, size, startDate, startTime,
    note: `Twenty-${key}`, ...extra,
  });
  log(`course ${key}`, r);
  const c = r.json?.course ?? r.json;
  if (r.status < 300) { S[key] = { courseId: c.id, links: pickLinks(c) }; save(); console.log(`  links: ${JSON.stringify(pickLinks(c))}`); }
  return r;
}
async function voucher(key, studentKey, hours = 5) {
  const r = await call("POST", "/vouchers", { student: { id: S[studentKey].studentId }, totalHours: hours, note: `Twenty-${key}` });
  log(`voucher ${key}`, r);
  const v = r.json?.voucher ?? r.json;
  if (r.status < 300) { S[key] = { voucherId: v.id, links: pickLinks(v) }; save(); console.log(`  links: ${JSON.stringify(pickLinks(v))}`); }
  return r;
}

const step = process.argv[2];
switch (step) {
  case "trialA": await trial("trialA", "Twenty-F4 A", "0900091001", "2026-11-08", "09:00"); break;
  case "attendA": await status("trialA", "confirm"); await status("trialA", "attend"); break;
  // A: trial → course1 (INLINE) → course2 (BIKE) → voucher → course3 (SCOOTER)
  case "A1": await course("A1", "trialA", SUB.INLINE, T.Kid, "2026-11-14", "10:00"); break;
  case "A2": await course("A2", "trialA", SUB.BIKE, T.Kid, "2026-11-14", "11:00"); break;
  case "A3": await voucher("A3", "trialA"); break;
  case "A4": await course("A4", "trialA", SUB.SCOOTER, T.Kid, "2026-11-14", "13:00"); break;
  // B: trial → voucher → voucher (cases 10, 12)
  case "B": {
    await trial("trialB", "Twenty-F4 B", "0900091002", "2026-11-08", "10:00");
    await status("trialB", "confirm"); await status("trialB", "attend");
    await voucher("B1", "trialB"); await voucher("B2", "trialB"); break;
  }
  // C: PENDING trial · D: CANCELLED trial → course (case 8)
  case "C": {
    await trial("trialC", "Twenty-F4 C", "0900091003", "2026-11-08", "11:00");
    await course("C1", "trialC", SUB.INLINE, T.Kid, "2026-11-14", "14:00"); break;
  }
  case "D": {
    await trial("trialD", "Twenty-F4 D", "0900091004", "2026-11-08", "13:00");
    await status("trialD", "cancel", { reason: "Twenty-F4 test", reasonCode: "CUSTOMER_CANCELLED" });
    await course("D1", "trialD", SUB.INLINE, T.Kid, "2026-11-14", "15:00"); break;
  }
  // E: trial dated in the future, confirm + try to attend, then sell (case 9)
  case "E": {
    await trial("trialE", "Twenty-F4 E", "0900091005", "2026-11-15", "09:00");
    await status("trialE", "confirm"); await status("trialE", "attend");
    await voucher("E1", "trialE"); break;
  }
  // F: attended trial, then an IMPORT course (case 15)
  case "F": {
    await trial("trialF", "Twenty-F4 F", "0900091006", "2026-11-08", "14:00");
    await status("trialF", "confirm"); await status("trialF", "attend");
    const r = await call("POST", "/courses/import", {
      student: { id: S.trialF.studentId }, teacherId: T.Kid, subjectId: SUB.INLINE, size: 10, usedSessions: 3,
      startDate: "2026-11-15", startTime: "10:00", note: "Twenty-F1 import",
    });
    log("import F1", r);
    const c = r.json?.course ?? r.json;
    if (r.status < 300) { S.F1 = { courseId: c.id, links: pickLinks(c) }; save(); console.log(`  links: ${JSON.stringify(pickLinks(c))}`); }
    break;
  }
  // G (primary) + H (co-student): both attended trials, then one DUO course (case 16)
  case "GH": {
    await trial("trialG", "Twenty-F4 G", "0900091007", "2026-11-08", "15:00");
    await status("trialG", "confirm"); await status("trialG", "attend");
    await trial("trialH", "Twenty-F4 H", "0900091008", "2026-11-08", "15:00", T.New);
    await status("trialH", "confirm"); await status("trialH", "attend");
    await course("G1", "trialG", SUB.DUO_INLINE, T.Kid, "2026-11-15", "11:00", 4, { duo: { coStudentId: S.trialH.studentId } });
    break;
  }
  // H after the DUO: its own trial is still free and its own sale links it; prev = the DUO course it sat in
  case "H1": await voucher("H1", "trialH"); break;
  // coach-change cases 20–23 + pick 24 (the parts that need no day-end)
  case "change": {
    const ctt = async (label, courseKey, body) => {
      const r = await call("POST", `/courses/${S[courseKey].courseId}/change-teacher-time`, body);
      log(label, r);
      const c = r.json?.course ?? r.json;
      console.log(`  links: ${JSON.stringify(pickLinks(c))}`);
      return r;
    };
    await ctt("A1 time-only (Kid, 16:00)", "A1", { teacherId: T.Kid, startDate: "2026-11-14", startTime: "16:00" });
    await ctt("A2 → New", "A2", { teacherId: T.New, startDate: "2026-11-14", startTime: "11:00" });
    await ctt("A2 → Print", "A2", { teacherId: T.Print, startDate: "2026-11-14", startTime: "11:00" });
    break;
  }
  case "pick": {
    for (const [label, key, pick] of [["A1 (no change)", "A1", "FIRST"], ["A2 (changed)", "A2", "SHARE"]]) {
      const r = await call("PUT", `/courses/${S[key].courseId}/bonus100-pick`, { pick });
      log(`pick ${label} ${pick}`, r);
    }
    break;
  }
  // day-end fixtures: J (two courses started 2026-11-08, session 1 attended) and K (started 2026-11-01, cover on wk 1)
  case "J": {
    await trial("trialJ", "Twenty-F4 J", "0900091009", "2026-10-31", "09:00");
    await status("trialJ", "cancel", { reason: "Twenty-F4 test", reasonCode: "CUSTOMER_CANCELLED" });
    await course("J1", "trialJ", SUB.INLINE, T.Kid, "2026-11-08", "16:00");
    await course("J2", "trialJ", SUB.BIKE, T.Kid, "2026-11-08", "17:00");
    await course("K1", "trialJ", SUB.SCOOTER, T.Kid, "2026-11-01", "15:00");
    break;
  }
  case "K": await course("K1", "trialJ", SUB.SCOOTER, T.Toth, "2026-11-01", "15:00"); break;
  case "dayend-prep": {
    const row = (key, i) => S[key].rows[i].id;
    const st = async (id, action) => { const r = await call("PATCH", `/bookings/${id}/status`, { action }); log(`${action} ${id}`, r); };
    // K1: week-1 cover by Print (single-session teacher change), then attend weeks 1 and 2
    const cover = await call("PATCH", `/bookings/${row("K1", 0)}`, { teacherId: T.Print });
    log("K1 wk1 cover → Print", cover);
    for (const i of [0, 1]) { await st(row("K1", i), "confirm"); await st(row("K1", i), "attend"); }
    // J1 / J2: attend week 1 (Kid)
    for (const key of ["J1", "J2"]) { await st(row(key, 0), "confirm"); await st(row(key, 0), "attend"); }
    // J1: whole course → New from wk 2 ; J2: → New, then back → Kid
    const ctt = async (label, key, teacherId) => log(label, await call("POST", `/courses/${S[key].courseId}/change-teacher-time`, { teacherId, startDate: "2026-11-15", startTime: key === "J1" ? "16:00" : "17:00" }));
    await ctt("J1 → New", "J1", T.New);
    await ctt("J2 → New", "J2", T.New);
    await ctt("J2 → Kid", "J2", T.Kid);
    break;
  }
  // a voucher class on B1, attended 2026-11-08 by Print → tonight B1.firstTeacherId = Print
  case "Bv": {
    const r = await call("POST", "/bookings", { student: { id: S.trialB.studentId }, teacherId: T.Print, subjectId: SUB.INLINE,
      date: "2026-11-08", startTime: "16:00", bookingType: "VOUCHER", voucherId: S.B1.voucherId, note: "Twenty-F4 Bv" });
    log("B1 voucher class", r);
    const b = r.json?.booking ?? r.json;
    if (r.status < 300) {
      S.Bv = { bookingId: b.id }; save();
      log("confirm", await call("PATCH", `/bookings/${b.id}/status`, { action: "confirm" }));
      log("attend", await call("PATCH", `/bookings/${b.id}/status`, { action: "attend" }));
    }
    break;
  }
  // ---- F5 (TASK-861) ----
  case "F5-other": {
    const r = await call("POST", "/bookings", { teacherId: T.NoTeacher, date: "2026-11-09", startTime: "09:00", bookingType: "OTHER",
      otherTitle: "Twenty-F5 park fee test", otherPriceMinor: 10000 });
    log("OTHER on No Teacher", r);
    const b = r.json?.booking ?? r.json;
    if (r.status < 300) { S.F5other = { bookingId: b.id }; save(); log("confirm", await call("PATCH", `/bookings/${b.id}/status`, { action: "confirm" })); }
    break;
  }
  case "F5-refuse": {
    const nt = T.NoTeacher;
    const stu = { id: S.trialC.studentId };
    log("FIRST_TRIAL on NT", await call("POST", "/bookings", { student: { name: "Twenty-F5 X", nickname: "Twenty-F5 X", phone: "0900091010" }, teacherId: nt, subjectId: SUB.INLINE, date: "2026-11-16", startTime: "09:00", bookingType: "FIRST_TRIAL" }));
    log("SINGLE_SESSION on NT", await call("POST", "/bookings", { student: stu, teacherId: nt, subjectId: SUB.INLINE, date: "2026-11-16", startTime: "10:00", bookingType: "SINGLE_SESSION" }));
    log("VOUCHER class on NT", await call("POST", "/bookings", { student: { id: S.trialB.studentId }, teacherId: nt, subjectId: SUB.INLINE, date: "2026-11-16", startTime: "11:00", bookingType: "VOUCHER", voucherId: S.B2.voucherId }));
    log("COURSE on NT", await call("POST", "/courses", { student: stu, teacherId: nt, subjectId: SUB.INLINE, size: 4, startDate: "2026-11-16", startTime: "12:00", note: "Twenty-F5 refuse" }));
    log("C1 whole-course → NT", await call("POST", `/courses/${S.C1.courseId}/change-teacher-time`, { teacherId: nt, startDate: "2026-11-14", startTime: "14:00" }));
    const plan = await call("GET", `/entitlements/${S.C1.courseId}/plan`);
    const rowId = plan.json?.sessions?.[0]?.id;
    log("C1 wk1 single move → NT", await call("PATCH", `/bookings/${rowId}`, { teacherId: nt }));
    log("PATCH teacher NT (same nickname)", await call("PATCH", `/teachers/${nt}`, { nickname: "No Teacher" }));
    log("leave for NT", await call("POST", "/teacher-leave-days", { teacherId: nt, reason: "Twenty-F5 refuse", date: "2026-11-20" }));
    log("calendar-link NT", await call("POST", `/teachers/${nt}/calendar-link`));
    log("DELETE line-link NT", await call("DELETE", `/teachers/${nt}/line-link`));
    break;
  }
  case "F5-reads": {
    const d = await call("GET", "/reports/daily?date=2026-11-09");
    console.log(`daily → ${d.status}; mentions "No Teacher": ${d.text.includes("No Teacher")}; mentions NT id: ${d.text.includes(T.NoTeacher)}; keys=${Object.keys(d.json ?? {}).join(",")}`);
    const bt = d.json?.byTeacher ?? [];
    console.log(`  byTeacher rows: ${bt.length}: ${bt.map((x) => x.nickname ?? x.name ?? x.teacherId).join(", ")}`);
    const som = await call("GET", "/reports/som");
    console.log(`som → ${som.status}; mentions "No Teacher": ${som.text.includes("No Teacher")}; mentions NT id: ${som.text.includes(T.NoTeacher)}`);
    const at = await call("GET", "/attention");
    console.log(`attention → ${at.status}; mentions "No Teacher": ${at.text.includes("No Teacher")}; mentions NT id: ${at.text.includes(T.NoTeacher)}`);
    const cal = await call("GET", "/calendar?date=2026-11-09");
    console.log(`calendar 2026-11-09 → ${cal.status}; has my park block: ${cal.text.includes("Twenty-F5 park fee test")}; mentions NT id: ${cal.text.includes(T.NoTeacher)}; ${cal.status >= 400 ? cal.text.slice(0, 200) : ""}`);
    const ord = await call("GET", "/teachers/type-order");
    console.log(`type-order → ${ord.status}; mentions NT id: ${ord.text.includes(T.NoTeacher)}`);
    const nt = (await call("GET", `/teachers`)).json?.groups?.flatMap((g) => g.teachers).find((x) => x.isSystem);
    console.log(`system teacher now: ${JSON.stringify({ id: nt?.id, name: nt?.name, nickname: nt?.nickname, active: nt?.active, archived: nt?.archived, lineLinked: nt?.lineLinked, budgetMinor: nt?.budgetMinor, subjects: nt?.subjects?.length })}`);
    break;
  }
  case "part2": {
    log("pick J2 (first Kid = latest Kid) FIRST", await call("PUT", `/courses/${S.J2.courseId}/bonus100-pick`, { pick: "FIRST" }));
    log("pick J1 (first Kid, latest New) FIRST", await call("PUT", `/courses/${S.J1.courseId}/bonus100-pick`, { pick: "FIRST" }));
    const d = await call("GET", "/reports/daily?date=2026-11-09");
    const bt = d.json?.byTeacher ?? [];
    console.log(`daily 11-09 after day-end → ${d.status}; byTeacher ${bt.length} rows; NT id present: ${d.text.includes(T.NoTeacher)}; "No Teacher" present: ${d.text.includes("No Teacher")}`);
    const som = await call("GET", "/reports/som");
    console.log(`som → ${som.status}; NT id present: ${som.text.includes(T.NoTeacher)}`);
    const c = await call("GET", "/courses?q=Twenty-&limit=200");
    for (const x of (c.json?.items ?? [])) if ([S.J1.courseId, S.J2.courseId, S.K1.courseId].includes(x.id)) console.log(`C ${x.id.slice(0, 8)} ${JSON.stringify(pickLinks(x))}`);
    break;
  }
  case "cleanup": {
    const body = { reason: "ADMIN_ERROR", note: "Twenty TEST-142 cleanup: QA test data (Twenty-F4)" };
    // A1…K1 and A3/B1/B2 were cancelled in the first cleanup run (2026-11-09); only the rest here.
    for (const k of ["E1", "H1"]) log(`cancel voucher ${k}`, await call("POST", `/vouchers/${S[k].voucherId}/cancel`, body));
    for (const k of ["trialA", "trialB", "trialC", "trialD", "trialE", "trialF", "trialG", "trialH", "trialJ"]) log(`archive student ${k}`, await call("POST", `/students/${S[k].studentId}/archive`));
    break;
  }
  case "plans": {
    for (const key of ["J1", "J2", "K1"]) {
      const r = await call("GET", `/entitlements/${S[key].courseId}/plan`);
      const rows = r.json?.sessions ?? r.json?.planSessions ?? r.json?.rows ?? [];
      console.log(`${key} plan → ${r.status} keys=${Object.keys(r.json ?? {}).join(",")}`);
      for (const x of rows) console.log(`  ${x.id ?? x.bookingId} ${x.date} ${x.startTime} ${x.status} ${x.teacher?.nickname ?? x.teacherId ?? ""}`);
      S[key].rows = rows.map((x) => ({ id: x.id ?? x.bookingId, date: x.date, status: x.status }));
      save();
    }
    break;
  }
  case "read": {
    const c = await call("GET", "/courses?q=Twenty-&limit=200");
    const items = c.json?.items ?? c.json?.courses ?? (Array.isArray(c.json) ? c.json : []);
    console.log(`GET /courses?q=Twenty- → ${c.status}, ${items.length}`);
    for (const x of items) console.log(`C ${x.id} ${x.student?.name ?? x.studentName ?? ""} ${x.subject?.name ?? ""} ${JSON.stringify(pickLinks(x))}`);
    const v = await call("GET", "/vouchers?q=Twenty-&limit=200");
    const vi = v.json?.items ?? v.json?.vouchers ?? (Array.isArray(v.json) ? v.json : []);
    console.log(`GET /vouchers?q=Twenty- → ${v.status}, ${vi.length}`);
    for (const x of vi) console.log(`V ${x.id} ${x.student?.name ?? x.studentName ?? ""} ${JSON.stringify(pickLinks(x))}`);
    break;
  }
  case "show": console.log(JSON.stringify(S, null, 2)); break;
  default: console.log("unknown step");
}
await browser.close();
