/**
 * QA harness — customer-prod post-deploy smoke, PHASE 2 (human-approved 2026-08-11).
 * Creates QA-owned data to close the checks that cannot be done on an empty database:
 *   #2  the calendar course-picker distinguishes a student's TWO courses
 *   #4  a voucher booking shows its class/subject
 *   #5  the deduction history renders for a course with real activity (post-wipe re-verify)
 *
 * Cleanup is WAIVED by the human (they will re-run the reset). Everything created is prefixed `QA-prod`
 * and reported for the ledger. Rules still in force: touch no row QA did not create · no LINE to real
 * people · **NO teacher-change flow** (fires dual LINE to real teachers) · TASK-090 guard untouched.
 */
import { openProdSession, api } from "./prod-session.mjs";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 240)}`);
};

const { browser, page, origin, apiToken } = await openProdSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const shot = (n) => page.screenshot({ path: `${OUT}/prod-p2-${n}.png` });
const created = { studentId: null, courseIds: [], voucherId: null, bookingIds: [] };

/** a slot where `teacher` is genuinely free */
async function freeSlot(teacherId, fromDay) {
  for (let d = fromDay; d < fromDay + 20; d++) {
    for (const t of ["11:00", "14:00", "15:00", "16:00", "10:00"]) {
      const av = await A("GET", `/slots/availability?date=${iso(d)}&startTime=${t}`);
      if ((av.json?.teachers ?? []).find((x) => x.teacher.id === teacherId)?.available) return { date: iso(d), time: t };
    }
  }
  return null;
}

try {
  const teachers = (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers);
  const teacher = teachers.find((t) => t.active && (t.subjects ?? []).length >= 2);
  const subjects = teacher.subjects.filter((s) => !/1st trial/i.test(s.name));
  const [subjA, subjB] = [subjects[0], subjects[1]];

  // ── setup 1: student + course A (inline student creates the parent too) ──
  const slotA = await freeSlot(teacher.id, 7);
  const c1 = await A("POST", "/courses", {
    student: { name: "QA-prod-student", nickname: "QA-prod", phone: "0900000092" },
    teacherId: teacher.id,
    subjectId: subjA.id,
    size: 4,
    startDate: slotA.date,
    startTime: slotA.time,
    note: "QA post-deploy smoke (phase 2) — Tanya 2026-08-11",
  });
  created.courseIds.push(c1.json?.course?.id);
  created.studentId = c1.json?.course?.student?.id;
  created.bookingIds.push(...(c1.json?.bookings ?? []).map((b) => b.id));

  // ── setup 2: a SECOND course, different program, same student ──────────
  const slotB = await freeSlot(teacher.id, 8);
  const c2 = await A("POST", "/courses", {
    student: { id: created.studentId },
    teacherId: teacher.id,
    subjectId: subjB.id,
    size: 4,
    startDate: slotB.date,
    startTime: slotB.time,
    note: "QA post-deploy smoke (phase 2) — Tanya 2026-08-11",
  });
  created.courseIds.push(c2.json?.course?.id);
  created.bookingIds.push(...(c2.json?.bookings ?? []).map((b) => b.id));

  // ── setup 3: a voucher + a voucher booking carrying its program ────────
  const v = await A("POST", "/vouchers", { student: { id: created.studentId }, totalHours: 5 });
  created.voucherId = v.json?.voucher?.id ?? v.json?.id;
  const slotV = await freeSlot(teacher.id, 9);
  const vb = await A("POST", "/bookings", {
    student: { id: created.studentId },
    teacherId: teacher.id,
    subjectId: subjA.id,
    date: slotV.date,
    startTime: slotV.time,
    bookingType: "VOUCHER",
    voucherId: created.voucherId,
    note: "QA post-deploy smoke (phase 2) — Tanya 2026-08-11",
  });
  created.bookingIds.push(vb.json?.booking?.id ?? vb.json?.id);
  writeFileSync(`${OUT}/phase2-created.json`, JSON.stringify(created, null, 2));

  record(
    "setup",
    "QA-owned data created (cleanup waived by the human — reset will follow)",
    "1 student (+parent) · 2 courses on different programs · 1 voucher · 1 voucher booking",
    `student=${created.studentId?.slice(0, 8)} · courses=${c1.status}/${c2.status} (${subjA.name} · ${subjB.name}) · voucher=${v.status} · voucherBooking=${vb.status}`,
    c1.status === 201 && c2.status === 201 && v.status < 300 && vb.status < 300 ? "PASS" : "FAIL",
  );

  // ── #2 — the calendar course-picker distinguishes the two courses ──────
  const eligible = await A("GET", "/students/eligible?type=COURSE_PACKAGE&q=QA-prod");
  record(
    "#2",
    "the API offers one entry per course, each with its own context",
    "two entries for this student, each naming its course",
    JSON.stringify(eligible.json).slice(0, 300),
    (eligible.json?.students ?? []).length >= 2 ? "PASS" : "FAIL",
  );

  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const m = page.locator('[role="dialog"]').first();
  await m.getByRole("tab", { name: /weekly course|คอร์ส/i }).first().click();
  await page.waitForTimeout(1500);
  await m.locator("input:visible").first().fill("QA-prod");
  await page.waitForTimeout(3000);
  await m.locator('input[role="combobox"]:visible').first().click();
  await page.waitForTimeout(1800);
  const opts = (await page.getByRole("option").allInnerTexts()).map((s) => s.replace(/\n/g, " · ").trim());
  await shot("1-course-picker");
  record(
    "#2",
    "the picker names WHICH course before selection",
    "two distinct options, each carrying subject + used/size",
    `options=${JSON.stringify(opts.slice(0, 4))}`,
    opts.length >= 2 && new Set(opts).size === opts.length && opts.some((o) => /\d\s*\/\s*\d/.test(o)) ? "PASS" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1500);

  // ── #4 — the voucher booking shows its class ──────────────────────────
  const vrows = await A("GET", "/bookings?type=VOUCHER&limit=10");
  const withSubject = (vrows.json?.items ?? []).filter((b) => b.subject || b.subjectName || b.subjectId);
  record(
    "#4",
    "the API carries a subject on the voucher booking",
    "the voucher row exposes its class",
    `rows=${vrows.json?.items?.length} withSubject=${withSubject.length} · sample=${JSON.stringify(vrows.json?.items?.[0] ?? null).slice(0, 220)}`,
    (vrows.json?.items ?? []).length > 0 && withSubject.length === (vrows.json?.items ?? []).length ? "PASS" : "FAIL",
  );

  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
  await page.waitForTimeout(2000);
  const typeSel = page.getByLabel(/^type$|ประเภท/i).first();
  if (await typeSel.count()) {
    await typeSel.click();
    await page.waitForTimeout(800);
    const opt = page.getByRole("option", { name: /voucher|วอยเชอร์/i }).first();
    if (await opt.count()) await opt.click();
    await page.waitForTimeout(2500);
  }
  const table = await page.evaluate(() => {
    const t = document.querySelector("table");
    if (!t) return null;
    return {
      head: [...t.querySelectorAll("thead th")].map((h) => h.textContent.trim()),
      body: [...t.querySelectorAll("tbody tr")].slice(0, 5).map((r) => [...r.querySelectorAll("td")].map((c) => c.innerText.trim().replace(/\n/g, " "))),
    };
  });
  await shot("2-voucher-bookings");
  const si = table?.head.findIndex((h) => /subject|วิชา|คลาส/i.test(h)) ?? -1;
  const subjectCells = si >= 0 ? (table?.body ?? []).map((r) => r[si]).filter(Boolean) : [];
  record(
    "#4",
    "the FE shows the voucher booking's class in the bookings table",
    "the Subject column is populated on the voucher row",
    `head=${JSON.stringify(table?.head)} · subjectCells=${JSON.stringify(subjectCells)}`,
    si >= 0 && subjectCells.length > 0 && subjectCells.every((s) => s && s !== "—" && s !== "-") ? "PASS" : "FAIL",
  );

  // the voucher plan modal shows it per session, and renders the VOUCHER shape
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).first().click();
  await page.waitForTimeout(2000);
  const manage = page.getByRole("button", { name: /manage|จัดการ/i }).first();
  let vtext = "";
  if (await manage.count()) {
    await manage.click();
    await page.waitForTimeout(2500);
    vtext = await page.locator('[role="dialog"]').first().innerText();
    await shot("3-voucher-plan-modal");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }
  record(
    "#4",
    "the voucher plan modal shows the class per session (and the voucher shape)",
    "Subject column with a real value; VOUCHER badge + hours, not the course shape",
    `modal="${vtext.replace(/\n/g, " · ").slice(0, 240)}"`,
    /subject|วิชา/i.test(vtext) && /VOUCHER/i.test(vtext) ? "PASS" : "FAIL",
  );

  // ── #5 — deduction history on a course with real activity ─────────────
  const hist = await A("GET", `/courses/${created.courseIds[0]}/history`);
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder*="name" i]:visible, input[placeholder*="ค้นหา"]:visible').first().fill("QA-prod");
  await page.waitForTimeout(2500);
  const histBtn = page.getByRole("button", { name: /^history$|ประวัติ/i }).first();
  let htext = "";
  if (await histBtn.count()) {
    await histBtn.click();
    await page.waitForTimeout(2500);
    htext = await page.locator('[role="dialog"]').first().innerText();
    await shot("4-history");
    await page.keyboard.press("Escape");
  }
  const leak = htext.match(/kind[A-Z][A-Za-z-]*|history\.[a-zA-Z]+/g);
  record(
    "#5",
    "deduction history renders post-wipe on a course with real activity",
    "timeline + summary; the actor note; no raw i18n key",
    `api=${hist.status} events=${hist.json?.events?.length} · modal="${htext.replace(/\n/g, " · ").slice(0, 200)}" · rawKeyLeaks=${JSON.stringify(leak)}`,
    hist.status === 200 && /deduction history|ประวัติการตัดคอร์ส/i.test(htext) && !leak ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases, created }, null, 2));
  await browser.close();
}
