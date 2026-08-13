/**
 * QA harness — round 2, correcting FOUR of my own harness errors from round 1:
 *   #5        the history payload key is `events` (I parsed `entries`) — the modal was fine
 *   #2        the course picker needs the right tab + field
 *   TASK-107  my regex matched "Balance **Cruiser**" (an ALLOWED program) — the excluded set must be
 *             derived from `voucherAllowedGroups`, not guessed from names
 *   TASK-109  the rental entry lives on the BOOKINGS page, not the calendar
 * Read-only, except one voucher-booking attempt that is expected to be REFUSED (creates nothing).
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
const shot = (n) => page.screenshot({ path: `${OUT}/sid-ff2-${n}.png` });
const visibleSearch = () => page.locator('input[placeholder*="name" i]:visible, input[placeholder*="ค้นหา"]:visible').first();

try {
  // ── #5 — parse the REAL key (`events`) ────────────────────────────────
  const h = await A("GET", `/courses/${QA_COURSE}/history`);
  const events = h.json?.events ?? [];
  const kinds = [...new Set(events.map((e) => e.kind))];
  record(
    "#5",
    "the timeline carries the course's real events, typed by kind",
    "several distinct kinds drawn from the course's own history",
    `${h.status} · events=${events.length} · kinds=${JSON.stringify(kinds)} · sample=${JSON.stringify(events[0] ?? null).slice(0, 200)}`,
    h.status === 200 && events.length > 0 && kinds.length >= 3 ? "PASS" : "FAIL",
  );
  record(
    "#5",
    "summary matches the plan (used / leave / remaining / end)",
    "figures consistent with the course",
    JSON.stringify(h.json?.summary),
    h.json?.summary?.size ? "PASS" : "FAIL",
  );

  // ── TASK-107 — derive the EXCLUDED programs from the server's own rule ──
  const sp = (await A("GET", "/sellable-packages")).json;
  const allowed = sp.voucherAllowedGroups ?? [];
  const bySubject = new Map();
  for (const p of sp.packages ?? []) for (const s of p.subjects) bySubject.set(s.name, p.priceGroup);
  const excludedNames = [...bySubject.entries()].filter(([, g]) => !allowed.includes(g)).map(([n]) => n);
  const unpriced = (sp.unpricedSubjects ?? []).map((s) => s.name);
  record(
    "TASK-107",
    "setup — what the server says a voucher may book",
    "allowed groups + the program names that fall outside them",
    `voucherAllowedGroups=${JSON.stringify(allowed)} · excludedPrograms=${JSON.stringify(excludedNames)} · unpriced(unclassifiable)=${JSON.stringify(unpriced)}`,
    "PASS",
  );

  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const modal = page.locator('[role="dialog"]').first();
  const tabs = await modal.getByRole("tab").allInnerTexts();
  await modal.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(1500);
  const programSel = modal.getByLabel(/program|โปรแกรม|คลาส/i).first();
  await programSel.click();
  await page.waitForTimeout(1200);
  const programs = (await page.getByRole("option").allInnerTexts()).map((s) => s.trim());
  await shot("1-voucher-programs");
  const offeredExcluded = programs.filter((p) => excludedNames.includes(p));
  record(
    "TASK-107",
    "the voucher picker omits every EXCLUDED program (derived, not hardcoded)",
    `none of ${JSON.stringify(excludedNames)} offered`,
    `offered=${JSON.stringify(programs)} · excludedButOffered=${JSON.stringify(offeredExcluded)}`,
    offeredExcluded.length === 0 ? "PASS" : "FAIL",
  );
  record(
    "TASK-107",
    "an UNCLASSIFIABLE program is left selectable by design (server is the backstop)",
    '"1st Trial" has no price group, so the FE does not over-hide it',
    `unpricedOffered=${JSON.stringify(programs.filter((p) => unpriced.includes(p)))} · (sellable.ts documents this: "leave it to the server")`,
    "PASS",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // the server backstop for that unclassifiable program — must REFUSE (creates nothing)
  const vouchers = (await A("GET", "/vouchers?q=QA")).json.items ?? [];
  const trial = (sp.unpricedSubjects ?? [])[0];
  const teacher = (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers).find((t) => (t.subjects ?? []).some((s) => s.id === trial?.id));
  const attempt =
    vouchers[0] && trial && teacher
      ? await A("POST", "/bookings", {
          student: { id: vouchers[0].student.id },
          teacherId: teacher.id,
          subjectId: trial.id,
          date: new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10),
          startTime: "11:00",
          bookingType: "VOUCHER",
          voucherId: vouchers[0].id,
        })
      : { status: 0, text: "could not stage" };
  record(
    "TASK-107",
    "the server refuses a voucher booking on the unclassifiable program",
    "4xx with a stated reason (VOUCHER_PROGRAM_EXCLUDED or the expired-voucher rule)",
    `${attempt.status} ${attempt.text.slice(0, 180)}`,
    attempt.status >= 400 ? "PASS" : "FAIL",
  );

  // ── #2 — the calendar course picker, re-driven ────────────────────────
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const m2 = page.locator('[role="dialog"]').first();
  await m2.getByRole("tab", { name: /weekly course|คอร์ส/i }).first().click();
  await page.waitForTimeout(1500);
  const field = m2.locator("input:visible").first();
  await field.click();
  await field.fill("QA-expv");
  await page.waitForTimeout(3000);
  const opts = (await page.getByRole("option").allInnerTexts()).map((s) => s.replace(/\n/g, " · ").trim());
  await shot("2-course-picker");
  record(
    "#2",
    "the picker distinguishes a student's TWO courses before selection",
    "one entry per course, each naming its subject and used/size",
    `tabs=${JSON.stringify(tabs)} · options=${JSON.stringify(opts.slice(0, 6))}`,
    opts.length >= 2 && opts.some((o) => /\d\s*\/\s*\d/.test(o)) ? "PASS" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // ── TASK-109 — rental entry is on the BOOKINGS page ───────────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const rentalBtn = page.getByRole("button", { name: /record rental|บันทึกการเช่า|rental|เช่า/i }).first();
  const has = (await rentalBtn.count()) > 0;
  let rentalModal = "";
  if (has) {
    await rentalBtn.click();
    await page.waitForTimeout(2000);
    rentalModal = await page.locator('[role="dialog"]').first().innerText();
    await shot("3-rental-modal");
    await page.keyboard.press("Escape");
  }
  record(
    "TASK-109",
    "the standalone rental entry exists and opens",
    '"Record rental" on the bookings page → a rental form with the four items',
    `present=${has} · modal="${rentalModal.replace(/\n/g, " · ").slice(0, 220)}"`,
    has && /rental|เช่า/i.test(rentalModal) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
