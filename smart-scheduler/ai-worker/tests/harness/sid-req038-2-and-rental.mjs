/**
 * QA harness — the last two checks of the 2026-08-10 pass, each on a FRESH page load so a leftover
 * modal overlay can't block the next step (that is what stopped round 2).
 *   #2        the calendar course-picker distinguishes a student's two courses (TASK-121)
 *   TASK-109  the standalone rental entry on the bookings page opens
 * Read-only: nothing is created.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 260)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/sid-ff3-${n}.png` });

try {
  // ── #2 — the calendar course picker ───────────────────────────────────
  const qa = (await A("GET", "/courses?q=QA")).json.items ?? [];
  const eligible = (await A("GET", "/students/eligible?type=COURSE_PACKAGE&q=QA-expv")).json;
  record(
    "#2",
    "the API offers one entry PER COURSE with its context",
    "two entries for the two-course QA student, each carrying subject + used/size",
    `courses=${qa.length} · eligible=${JSON.stringify(eligible).slice(0, 400)}`,
    (eligible?.students ?? []).length >= 2 ? "PASS" : "FAIL",
  );

  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const m = page.locator('[role="dialog"]').first();
  const tabs = await m.getByRole("tab").allInnerTexts();
  await m.getByRole("tab", { name: /weekly course|คอร์ส/i }).first().click();
  await page.waitForTimeout(1800);
  // The tab has TWO controls: a free-text search box, then the eligible-student SELECT below it.
  // Type into the search, then OPEN the select — that is where the per-course entries live.
  await m.locator("input:visible").first().fill("QA-expv");
  await page.waitForTimeout(3000);
  await m.locator('input[role="combobox"]:visible').first().click();
  await page.waitForTimeout(1800);
  const opts = (await page.getByRole("option").allInnerTexts()).map((s) => s.replace(/\n/g, " · ").trim());
  await shot("1-course-picker");
  record(
    "#2",
    "the picker distinguishes the two courses BEFORE selection",
    "one option per course, each naming its subject and used/size",
    `tabs=${JSON.stringify(tabs)} · options=${JSON.stringify(opts.slice(0, 6))}`,
    opts.length >= 2 && opts.some((o) => /\d\s*\/\s*\d/.test(o)) ? "PASS" : "FAIL",
  );

  // ── TASK-109 — the standalone rental entry (fresh load) ───────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  // the standalone rental entry sits on the ALL BOOKINGS tab (BookingsContent.tsx:78)
  await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
  await page.waitForTimeout(2500);
  const allButtons = (await page.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  const rentalBtn = page.getByRole("button", { name: /record rental|บันทึกการเช่า|rental|เช่า/i }).first();
  const has = (await rentalBtn.count()) > 0;
  let modalText = "";
  if (has) {
    await rentalBtn.click();
    await page.waitForTimeout(2500);
    modalText = await page.locator('[role="dialog"]').first().innerText();
    await shot("2-rental-modal");
  }
  record(
    "TASK-109",
    "the standalone rental entry exists on the bookings page and opens",
    '"Record rental" → a form offering the four rental items',
    `buttons=${JSON.stringify([...new Set(allButtons)].slice(0, 10))} · modal="${modalText.replace(/\n/g, " · ").slice(0, 240)}"`,
    has && /rental|เช่า/i.test(modalText) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
