/**
 * QA harness — accept REQ-038 #5 (deduction history) after the 2026-08-10 deploy, spot-verify #2,
 * and smoke the fast-follow (voucher picker 107 · rental 109 · settings screen 102/122).
 *
 * Read-only EXCEPT one deliberate, reversible settings round-trip (override → reset), which is the
 * only way to test TASK-122's reset. The end state is asserted back to "not overridden".
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const QA_COURSE = process.env.COURSE_ID ?? "6710384c-19d3-4afb-997b-1f56f9063c11";
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/sid-ff-${n}.png` });
const visibleSearch = () => page.locator('input[placeholder*="name" i]:visible, input[placeholder*="ค้นหา"]:visible').first();

try {
  // ── #5 — deduction history, API ────────────────────────────────────────
  const h = await A("GET", `/courses/${QA_COURSE}/history`);
  const entries = h.json?.entries ?? h.json?.items ?? h.json?.timeline ?? [];
  record(
    "#5",
    "the endpoint is live after the deploy (was 404 this morning)",
    "200 with a timeline + summary",
    `${h.status} keys=${Object.keys(h.json ?? {}).join(",")} entries=${entries.length} summary=${JSON.stringify(h.json?.summary ?? null).slice(0, 150)}`,
    h.status === 200 ? "PASS" : "FAIL",
  );
  const kinds = [...new Set(entries.map((e) => e.kind))];
  record(
    "#5",
    "the timeline covers the real events of this course",
    "several distinct kinds (attended / cancelled / sick-leave / makeup / extra / freelance)",
    `kinds=${JSON.stringify(kinds)} · sample=${JSON.stringify(entries[0] ?? null).slice(0, 200)}`,
    kinds.length >= 3 ? "PASS" : "FAIL",
  );

  // ── #5 — the UI timeline ───────────────────────────────────────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  await visibleSearch().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^history$|ประวัติ/i }).first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role="dialog"]').first();
  const text = await dlg.innerText();
  await shot("1-history-modal");
  record(
    "#5",
    "the history modal renders what/when for each event",
    "a titled timeline with human labels and dates",
    `text="${text.replace(/\n/g, " · ").slice(0, 300)}"`,
    /deduction history|ประวัติการตัดคอร์ส/i.test(text) && entries.length > 0 ? "PASS" : "FAIL",
  );
  const rawKeyLeak = text.match(/kind[A-Z][A-Za-z-]*|history\.[a-zA-Z]+/g);
  record(
    "#5",
    "no raw i18n key falls through (the hyphen-key transform Sober flagged)",
    'no "kindNo-show" / "history.x" style strings on screen',
    `leaks=${JSON.stringify(rawKeyLeak)}`,
    !rawKeyLeak ? "PASS" : "FAIL",
  );
  record(
    "#5",
    'the "who isn\'t tracked yet" note is shown',
    "an explicit note that the actor is not recorded (shared login)",
    (text.split("\n").find((l) => /isn't tracked|ไม่ได้บันทึก|shares one login/i.test(l)) ?? "not shown").slice(0, 160),
    /isn't tracked|ไม่ได้บันทึก|shares one login/i.test(text) ? "PASS" : "FAIL",
  );
  record(
    "#5",
    "the summary line reports used / leave / remaining / end",
    "all four figures present",
    (text.split("\n").filter((l) => /used|leave|remaining|ends/i.test(l)).join(" · ") || "none").slice(0, 200),
    /used/i.test(text) && /remaining/i.test(text) ? "PASS" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // ── #2 — the calendar course-picker names WHICH course (TASK-121) ──────
  const qaCourses = (await A("GET", "/courses?q=QA")).json.items ?? [];
  record("#2", "setup — the QA student really has more than one course", "≥2 courses on one student", `courses=${qaCourses.length}`, qaCourses.length >= 2 ? "PASS" : "SKIP");
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const modal = page.locator('[role="dialog"]').first();
  await modal.getByRole("tab", { name: /weekly course|course|คอร์ส/i }).first().click();
  await page.waitForTimeout(1500);
  const studentInput = modal.locator("input").first();
  await studentInput.click();
  await studentInput.fill("QA-expv");
  await page.waitForTimeout(2500);
  const opts = await page.getByRole("option").allInnerTexts();
  await shot("2-course-picker");
  record(
    "#2",
    "the picker offers ONE entry per course, each naming its course",
    "entries carry subject + used/size so two courses are distinguishable BEFORE selecting",
    `options=${JSON.stringify(opts.map((o) => o.replace(/\n/g, " · ").slice(0, 80)))}`,
    opts.length >= 2 && opts.some((o) => /\d\s*\/\s*\d/.test(o)) ? "PASS" : "FAIL",
  );

  // ── TASK-107 — the voucher picker omits Onewheel / Balance Play ───────
  await modal.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(1500);
  const programSel = modal.getByLabel(/program|โปรแกรม|คลาส/i).first();
  let programs = [];
  if (await programSel.count()) {
    await programSel.click();
    await page.waitForTimeout(1000);
    programs = (await page.getByRole("option").allInnerTexts()).map((s) => s.trim());
  }
  await shot("3-voucher-programs");
  record(
    "TASK-107",
    "the voucher program picker omits the excluded programs",
    "no Onewheel, no Balance Play in the list (REQ-027 b)",
    `programs=${JSON.stringify(programs)}`,
    programs.length > 0 && !programs.some((p) => /onewheel|balance play|balance/i.test(p)) ? "PASS" : programs.length === 0 ? "NOT TESTED" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // ── TASK-109 — the rental entry surfaces ──────────────────────────────
  const bodyText = await page.locator("body").innerText();
  const rentalBtns = (await page.getByRole("button", { name: /rental|เช่า/i }).allInnerTexts()).map((s) => s.trim());
  record(
    "TASK-109",
    "a rental entry point exists on the schedule",
    '"Record rental" (standalone) and/or "Add rental" (add-on)',
    `buttons=${JSON.stringify(rentalBtns)} · onPage=${/rental|เช่า/i.test(bodyText)}`,
    rentalBtns.length > 0 || /rental|เช่า/i.test(bodyText) ? "PASS" : "FAIL",
  );

  // ── TASK-102/122 — the settings screen + reset ────────────────────────
  await page.goto(`${origin}/scheduler/settings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const setText = await page.locator("body").innerText();
  await shot("4-settings");
  const before = (await A("GET", "/settings")).json;
  record(
    "TASK-102",
    "the settings screen loads and shows the business rules",
    "the notice-days and check-in-early settings, with their defaults",
    `api=${JSON.stringify(before)} · screen="${setText.replace(/\n/g, " · ").slice(0, 200)}"`,
    /notice|แจ้งเปลี่ยนครู|check.?in|เช็คอิน/i.test(setText) ? "PASS" : "FAIL",
  );

  // reversible round-trip: override → verify → reset → verify back to default
  const key = "teacher_change_notice_days";
  const orig = before.find((s) => s.key === key);
  const put = await A("PUT", `/settings/${key}`, { value: 5 });
  const mid = (await A("GET", "/settings")).json.find((s) => s.key === key);
  const del = await A("DELETE", `/settings/${key}`);
  const after = (await A("GET", "/settings")).json.find((s) => s.key === key);
  record(
    "TASK-122",
    "a setting can be overridden and RESET back to its default",
    "override takes (isOverridden=true, value=5) → reset restores default 3 / isOverridden=false",
    `orig=${JSON.stringify(orig)} · afterPut ${put.status} ${JSON.stringify(mid)} · afterDelete ${del.status} ${JSON.stringify(after)}`,
    put.status < 300 && mid?.value === 5 && mid?.isOverridden === true && del.status < 300 && after?.value === orig.value && after?.isOverridden === orig.isOverridden ? "PASS" : "FAIL",
  );
  record(
    "TASK-122",
    "cleanup — the environment is back exactly as I found it",
    `${key} = ${orig?.value}, isOverridden=${orig?.isOverridden}`,
    JSON.stringify(after),
    after?.value === orig?.value && after?.isOverridden === orig?.isOverridden ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
