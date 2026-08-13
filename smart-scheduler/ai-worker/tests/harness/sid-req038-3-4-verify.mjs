/**
 * QA harness — REQ-038 essential set, the two verify-only items (READ-ONLY: creates nothing).
 *   #3  a SEARCH BAR on the timetable/schedule page (customer: "Search Bar หน้าตาราง")
 *   #4  a VOUCHER booking shows its class/subject in the FE (REQ-029)
 * Also probes whether #5 (deduction history, TASK-119/120) is deployed at all.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1600, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/sid-r38-${n}.png`, fullPage: false });

try {
  // ── #3 — search bar on the timetable page ──────────────────────────────
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  const controls = await page.evaluate(() => {
    const labelOf = (i) =>
      i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent?.trim() ??
      i.getAttribute("aria-label") ??
      i.placeholder ??
      null;
    return [...document.querySelectorAll("input")]
      .map((i) => ({ label: labelOf(i), placeholder: i.placeholder || null, w: Math.round(i.getBoundingClientRect().width) }))
      .filter((x) => x.w > 0);
  });
  const studentSearch = controls.find((c) => /student|นักเรียน|ชื่อนักเรียน/i.test(`${c.label} ${c.placeholder}`));
  await shot("1-calendar-controls");
  record(
    "#3",
    "the timetable/schedule page carries a STUDENT search bar",
    'a control labelled/placeheld "Search student / ค้นชื่อนักเรียน" on /scheduler/calendar',
    `controls=${JSON.stringify(controls)}`,
    studentSearch ? "PASS" : "FAIL",
  );

  // is it anywhere else on that page (a modal/drawer trigger)?
  const buttons = (await page.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  record(
    "#3",
    "…or any other way to find a student from the timetable",
    "a search action of some kind on the page",
    `buttons=${JSON.stringify([...new Set(buttons)].slice(0, 14))}`,
    /search|ค้นหา/i.test(buttons.join(" ")) ? "PASS" : "FAIL",
  );

  // for contrast: the same search DOES exist on the bookings page (REQ-011/024)
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  const bookingsHasSearch = (await page.getByPlaceholder(/type a name|ค้นหา/i).count()) > 0;
  record(
    "#3",
    "contrast — the bookings page does have it",
    "search present on /scheduler/bookings",
    `present=${bookingsHasSearch}`,
    bookingsHasSearch ? "PASS" : "FAIL",
  );

  // ── #4 — a VOUCHER booking shows its class/subject ─────────────────────
  const vb = await A("GET", "/bookings?type=VOUCHER&limit=20");
  const rows = vb.json?.items ?? [];
  const withSubject = rows.filter((r) => r.subject || r.subjectName || r.subjectId);
  record(
    "#4",
    "the API carries a subject on voucher bookings (REQ-029)",
    "voucher rows expose their class/subject",
    `${vb.status} rows=${rows.length} withSubject=${withSubject.length} sample=${JSON.stringify(rows[0] ?? null).slice(0, 220)}`,
    rows.length > 0 && withSubject.length === rows.length ? "PASS" : rows.length === 0 ? "NOT TESTED" : "FAIL",
  );

  // and does the FE render it? — All bookings tab, filtered to Voucher
  await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
  await page.waitForTimeout(2000);
  const typeSel = page.getByLabel(/^type$|ประเภท/i).first();
  if (await typeSel.count()) {
    await typeSel.click();
    await page.waitForTimeout(700);
    const opt = page.getByRole("option", { name: /voucher|วอยเชอร์/i }).first();
    if (await opt.count()) await opt.click();
    await page.waitForTimeout(2500);
  }
  const table = await page.evaluate(() => {
    const t = document.querySelector("table");
    if (!t) return null;
    const head = [...t.querySelectorAll("thead th")].map((h) => h.textContent.trim());
    const body = [...t.querySelectorAll("tbody tr")].slice(0, 6).map((r) => [...r.querySelectorAll("td")].map((c) => c.innerText.trim().replace(/\n/g, " ")));
    return { head, body };
  });
  await shot("2-voucher-bookings");
  const subjIdx = table?.head.findIndex((h) => /subject|วิชา|คลาส/i.test(h)) ?? -1;
  const subjectsShown = subjIdx >= 0 ? (table?.body ?? []).map((r) => r[subjIdx]).filter(Boolean) : [];
  record(
    "#4",
    "the FE shows the voucher booking's class/subject",
    "the Subject column is populated on voucher rows",
    `head=${JSON.stringify(table?.head)} · subjectCells=${JSON.stringify(subjectsShown)} · rowsShown=${table?.body.length}`,
    subjIdx >= 0 && subjectsShown.length > 0 && subjectsShown.every((s) => s && s !== "—" && s !== "-") ? "PASS" : "FAIL",
  );

  // the voucher plan modal / voucher panel view of the same thing
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(2000);
  const manage = page.getByRole("button", { name: /manage|จัดการ/i }).first();
  if (await manage.count()) {
    await manage.click();
    await page.waitForTimeout(2500);
    const dlg = page.locator('[role="dialog"]').first();
    const dtext = await dlg.innerText();
    await shot("3-voucher-plan-modal");
    record(
      "#4",
      "the voucher plan modal shows the class/subject per session",
      "a Subject column with real values (and the voucher shape, not the course shape)",
      `modal="${dtext.replace(/\n/g, " · ").slice(0, 260)}"`,
      /subject|วิชา/i.test(dtext) ? "PASS" : "FAIL",
    );
  }

  // ── #5 — is the deduction history even deployed? ───────────────────────
  const courses = (await A("GET", "/courses?limit=1")).json.items ?? [];
  const hist = courses.length ? await A("GET", `/courses/${courses[0].id}/history`) : { status: 0, text: "no course" };
  record(
    "#5",
    "deduction history (TASK-119/120) reachable on `sid`?",
    "GET /courses/:id/history → 200",
    `${hist.status} ${hist.text.slice(0, 120)}`,
    hist.status === 200 ? "PASS" : "NOT DEPLOYED",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
