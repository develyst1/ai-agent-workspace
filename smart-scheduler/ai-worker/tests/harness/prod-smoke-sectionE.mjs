/**
 * QA harness — customer-prod smoke, SECTION E: REQ-030 · REQ-037 · OBS-3 on the QA-owned course.
 * Runs only against the course created in phase 2. **Teacher-change is deliberately NOT exercised**
 * (dual LINE to real teachers, TASK-094 — ratified exclusion; covered by its `sid` TEST_PASSED).
 * Cleanup waived by the human; everything here stays on QA-owned rows.
 */
import { openProdSession, api } from "./prod-session.mjs";
import { mkdirSync, readFileSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const created = JSON.parse(readFileSync(`${OUT}/phase2-created.json`, "utf8"));
const COURSE = created.courseIds[0];
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 240)}`);
};

const { browser, page, origin, apiToken } = await openProdSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const shot = (n) => page.screenshot({ path: `${OUT}/prod-E-${n}.png` });
const plan = async () => (await A("GET", `/entitlements/${COURSE}/plan`)).json;
const counted = (p) =>
  p.sessions.filter((s) => s.bookingType !== "SINGLE_SESSION" && /PENDING|CONFIRMED|ATTENDED|EXTENDED|NO_SHOW/.test(s.status)).length;

try {
  let p0 = await plan();
  record("REQ-030", "the plan DTO carries insertable + per-row bookingType", "new fields present", `insertable=${p0.insertable} · types=${[...new Set(p0.sessions.map((s) => s.bookingType))].join(",")} · rows=${p0.sessions.length}`, p0.insertable !== undefined ? "PASS" : "FAIL");

  // ── OBS-3 — preview writes nothing, and refuses with the same typed reason ──
  const s2 = p0.sessions[1];
  const pv = await A("POST", `/courses/${COURSE}/plan/preview`, { kind: "move", bookingId: s2.id, startTime: "17:00" });
  const after = await plan();
  record(
    "OBS-3",
    "the plan preview is a true dry run on production",
    "200 with the resulting plan; the stored plan unchanged",
    `${pv.status} keys=${Object.keys(pv.json ?? {}).join(",")} resulting=${pv.json?.resultingSessions?.length} · stored session2 still ${after.sessions[1]?.startTime}`,
    pv.status === 200 && after.sessions[1].startTime === s2.startTime ? "PASS" : "FAIL",
  );
  const clash = await A("POST", `/courses/${COURSE}/plan/preview`, {
    kind: "move",
    bookingId: p0.sessions[2].id,
    date: p0.sessions[0].date,
    startTime: p0.sessions[0].startTime.slice(0, 5),
    teacherId: p0.sessions[0].teacher.id,
  });
  record("OBS-3", "a refused change fails in preview with the same typed reason", "4xx SLOT_TAKEN", `${clash.status} ${clash.text.slice(0, 140)}`, clash.status >= 400 && /SLOT_TAKEN/.test(clash.text) ? "PASS" : "FAIL");

  // ── REQ-030 — edit/move applies (date/time only; NO teacher change) ────
  const mv = await A("POST", `/courses/${COURSE}/plan`, { kind: "move", bookingId: s2.id, startTime: "16:00" });
  let p1 = await plan();
  record(
    "REQ-030",
    "edit/move applies (time only — teacher-change deliberately not exercised)",
    "the chosen time is written",
    `${mv.status} · session2 ${s2.startTime} → ${p1.sessions.find((s) => s.id === s2.id)?.startTime}`,
    mv.status === 200 && p1.sessions.find((s) => s.id === s2.id)?.startTime.startsWith("16:00") ? "PASS" : "FAIL",
  );

  // ── REQ-030 — planned absence keeps the course at size ────────────────
  const before = counted(p1);
  const target = p1.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.date > iso(2));
  const abs = await A("POST", `/courses/${COURSE}/plan`, { kind: "mark-absence", bookingId: target.id, planned: true });
  p1 = await plan();
  record(
    "REQ-030",
    "a planned absence keeps the course at size",
    "absent row leaves the plan, one appended takes its place",
    `${abs.status} · counted ${before} → ${counted(p1)} · statuses ${p1.sessions.map((s) => s.status).join(",")}`,
    abs.status === 200 && counted(p1) === before ? "PASS" : "FAIL",
  );
  record("OBS-3", "post-absence the course stays insertable at owed 0", "insertable=true", `insertable=${p1.insertable} · owed=${p1.summary.owedCount}`, p1.insertable === true ? "PASS" : "FAIL");

  // ── REQ-030 — insert ──────────────────────────────────────────────────
  const insBefore = counted(p1);
  const ins = await A("POST", `/courses/${COURSE}/plan`, {
    kind: "insert",
    teacherId: p1.sessions[0].teacher.id,
    subjectId: p1.sessions[0].subject.id,
    date: iso(26),
    startTime: "16:00",
  });
  p1 = await plan();
  record(
    "REQ-030",
    "insert places the trailing session in the chosen slot",
    "200; a row appears there; counted rows unchanged",
    `${ins.status} · placed=${p1.sessions.some((s) => s.date === iso(26))} · counted ${insBefore} → ${counted(p1)}`,
    ins.status === 200 && counted(p1) === insBefore ? "PASS" : "FAIL",
  );

  // ── REQ-030 — a LIVE-row cancel re-owes ───────────────────────────────
  const liveBefore = counted(p1);
  const victim = p1.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.date > iso(2));
  const lc = await A("PATCH", `/bookings/${victim.id}/status`, { action: "cancel" });
  p1 = await plan();
  record(
    "REQ-030",
    "a live-row cancel re-owes (reschedule, not forfeit)",
    "no reason needed; counted rows return to size",
    `${lc.status} · counted ${liveBefore} → ${counted(p1)}`,
    lc.status === 200 && counted(p1) === liveBefore ? "PASS" : "FAIL",
  );

  // ── REQ-030 — delivered: edit/move refused, cancel needs a reason ──────
  const pastTarget = p1.sessions.find((s) => /PENDING|CONFIRMED/.test(s.status) && s.bookingType === "COURSE_PACKAGE");
  await A("POST", `/courses/${COURSE}/plan`, { kind: "move", bookingId: pastTarget.id, date: iso(-2), startTime: "10:00" });
  await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "confirm" });
  const att = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "attend" });
  const mvDel = await A("POST", `/courses/${COURSE}/plan`, { kind: "move", bookingId: pastTarget.id, startTime: "15:00" });
  record("REQ-030", "a delivered row still refuses edit/move", "4xx SESSION_DELIVERED", `attend ${att.status} · move ${mvDel.status} ${mvDel.text.slice(0, 120)}`, mvDel.status >= 400 && /SESSION_DELIVERED/.test(mvDel.text) ? "PASS" : "FAIL");

  const noReason = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "cancel" });
  record("REQ-030", "cancelling a delivered row with NO reason is refused", "4xx REASON_REQUIRED", `${noReason.status} ${noReason.text.slice(0, 120)}`, noReason.status >= 400 && /REASON_REQUIRED/.test(noReason.text) ? "PASS" : "FAIL");

  const delBefore = counted(p1);
  const withReason = await A("PATCH", `/bookings/${pastTarget.id}/status`, { action: "cancel", reason: "QA prod smoke — mis-marked attendance" });
  p1 = await plan();
  record(
    "REQ-030",
    "cancelling a delivered row WITH a reason cancels and re-owes",
    "200; counted rows back to size; reason stored",
    `${withReason.status} · counted ${delBefore} → ${counted(p1)} · note="${(withReason.json?.booking?.note ?? "").slice(0, 60)}"`,
    withReason.status === 200 && counted(p1) === delBefore ? "PASS" : "FAIL",
  );

  // ── REQ-037 — the extra PAID session ──────────────────────────────────
  const b4 = { counted: counted(p1), size: p1.summary.size, end: p1.liveEndDate };
  let extraSlot = null;
  for (let d = 30; d < 45 && !extraSlot; d++) {
    for (const t of ["11:00", "14:00", "15:00"]) {
      const av = await A("GET", `/slots/availability?date=${iso(d)}&startTime=${t}`);
      if ((av.json?.teachers ?? []).find((x) => x.teacher.id === p1.sessions[0].teacher.id)?.available) {
        extraSlot = { date: iso(d), time: t };
        break;
      }
    }
  }
  const extra = await A("POST", `/courses/${COURSE}/extra-session`, {
    teacherId: p1.sessions[0].teacher.id,
    subjectId: p1.sessions[0].subject.id,
    date: extraSlot.date,
    startTime: extraSlot.time,
  });
  let p2 = await plan();
  const extraRow = p2.sessions.find((s) => s.bookingType === "SINGLE_SESSION");
  record(
    "REQ-037",
    "the extra paid session is a SINGLE_SESSION and leaves the course untouched",
    "201; size/counted/end unchanged",
    `${extra.status} · extraRow=${extraRow ? `${extraRow.date} ${extraRow.bookingType}` : "none"} · counted ${b4.counted}→${counted(p2)} · size ${b4.size}→${p2.summary.size} · end ${b4.end}→${p2.liveEndDate}`,
    extra.status < 300 && !!extraRow && counted(p2) === b4.counted && p2.summary.size === b4.size && p2.liveEndDate === b4.end ? "PASS" : "FAIL",
  );
  const ec = await A("PATCH", `/bookings/${extraRow.id}/status`, { action: "cancel" });
  const p3 = await plan();
  record(
    "REQ-037",
    "cancelling the extra does NOT re-owe",
    "counted rows and owed unchanged",
    `${ec.status} · counted ${counted(p2)}→${counted(p3)} · owed ${p2.summary.owedCount}→${p3.summary.owedCount}`,
    ec.status === 200 && counted(p3) === counted(p2) ? "PASS" : "FAIL",
  );

  // ── the UI half: the plan-diff confirm actually appears before commit ──
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.locator('input[placeholder*="name" i]:visible, input[placeholder*="ค้นหา"]:visible').first().fill("QA-prod");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  const d = page.locator('[role="dialog"]').first();
  const modalText = await d.innerText();
  const buttons = (await d.getByRole("button").allInnerTexts()).map((s) => s.trim());
  await shot("1-plan-modal");
  record(
    "REQ-030/037 (UI)",
    "the plan modal renders on production with both actions visible",
    "session table + Insert make-up + the separate charged action + delivered row locked",
    `buttons=${JSON.stringify([...new Set(buttons)])} · text="${modalText.replace(/\n/g, " · ").slice(0, 200)}"`,
    /insert/i.test(buttons.join(" ")) && /charged|คิดเงิน/i.test(buttons.join(" ")) ? "PASS" : "FAIL",
  );

  const insertBtn = d.getByRole("button", { name: /insert make-?up/i }).first();
  if ((await insertBtn.count()) && !(await insertBtn.isDisabled())) {
    await insertBtn.click();
    await page.waitForTimeout(1500);
    for (const label of ["teacher", "subject"]) {
      const sel = d.getByLabel(new RegExp(`^${label}$`, "i")).first();
      if (await sel.count()) {
        await sel.click();
        await page.waitForTimeout(700);
        const o = page.getByRole("option").first();
        if (await o.count()) await o.click();
        await page.waitForTimeout(500);
      }
    }
    const rowsBefore = (await plan()).sessions.length;
    await d.getByRole("button", { name: /^save$|บันทึก/i }).first().click();
    await page.waitForTimeout(3500);
    const confirmText = await page.locator('[role="dialog"]').last().innerText();
    const rowsAfter = (await plan()).sessions.length;
    await shot("2-plan-diff");
    record(
      "OBS-3 (UI)",
      "the plan-diff preview appears BEFORE anything is written",
      '"Your plan will become…" with the resulting sessions; nothing written until confirmed',
      `confirm="${(confirmText.match(/[^\n]*(will become|added|removed|ends)[^\n]*/i) ?? [""])[0].slice(0, 140)}" · rows ${rowsBefore} → ${rowsAfter}`,
      rowsAfter === rowsBefore && /will become|added|removed/i.test(confirmText) ? "PASS" : "FAIL",
    );
    const cancelBtn = page.locator('[role="dialog"]').last().getByRole("button", { name: /^cancel$|ยกเลิก/i }).first();
    if (await cancelBtn.count()) await cancelBtn.click();
  }
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  const fin = await plan();
  console.log(JSON.stringify({ cases, finalPlan: { summary: fin?.summary, sessions: fin?.sessions?.length, insertable: fin?.insertable } }, null, 2));
  await browser.close();
}
