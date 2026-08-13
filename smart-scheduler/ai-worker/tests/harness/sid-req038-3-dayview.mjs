/**
 * QA harness — the one case the #3 acceptance skipped: the student search must filter the **DAY**
 * view too, not only the week (SA built it into both memos). The view switch is a Mantine
 * SegmentedControl (a radio input), not a button — which is why the first pass silently skipped it.
 * READ-ONLY.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(10)} ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1600, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
/**
 * Session cells, format-agnostic. The WEEK view renders "10:00 | Student"; the DAY view renders
 * "Student | Subject | TYPE" with NO leading time — so a time-anchored regex reads the day grid as
 * empty. That false negative is exactly what this harness produced on its first run.
 */
const gridLabels = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map((b) => b.innerText.trim().replace(/\n/g, " "))
      .filter((t) => t.length > 1 && !/^(sign out|today|weekly|daily|en|ไทย|\+)$/i.test(t) && !/^\d{1,2}\s\w{3}\s\d{4}$/.test(t)),
  );

try {
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);

  // switch to the DAY view via the SegmentedControl (label, not button)
  const seg = await page.evaluate(() =>
    [...document.querySelectorAll(".mantine-SegmentedControl-root label, .mantine-SegmentedControl-label")].map((l) => l.textContent.trim()),
  );
  await page.getByText(/^daily$|^day$|รายวัน/i).first().click();
  await page.waitForTimeout(3000);
  // Today's grid can legitimately be empty (sessions are sparse), so ASK THE API which day actually has
  // sessions and step to it — otherwise an empty grid gets mistaken for a broken filter.
  const soon = await A("GET", `/bookings?from=${new Date().toISOString().slice(0, 10)}&to=${new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10)}&limit=200`);
  // count only rows the grid actually PAINTS — a cancelled booking is not drawn, and counting it would
  // make an empty grid look like a broken filter.
  const byDate = {};
  const painted = (soon.json?.items ?? []).filter((b) => !/CANCELLED|PENDING_RESCHEDULE/.test(b.status));
  for (const b of painted) byDate[b.date] = (byDate[b.date] ?? 0) + 1;
  console.error("painted-by-date:", JSON.stringify(byDate));
  const targetDate = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0]?.[0];
  const shownDate = await page.evaluate(() => document.querySelector("input[value*='20']")?.value ?? "");
  const daysBetween = Math.round((new Date(targetDate) - new Date(shownDate)) / 864e5);
  console.error(`API says the busiest upcoming day is ${targetDate} (${byDate[targetDate]} sessions); grid shows ${shownDate}; stepping ${daysBetween}`);
  let stepped = 0;
  for (let i = 0; i < Math.abs(daysBetween) && i < 60; i++) {
    await page.getByLabel(daysBetween > 0 ? /^next$|^ถัดไป$/i : /^previous$|^ก่อนหน้า$/i).first().click();
    await page.waitForTimeout(350);
    stepped++;
  }
  await page.waitForTimeout(2500);
  let dayAll = await gridLabels();
  await page.screenshot({ path: `${OUT}/sid-r38-3-day-all.png` });
  record("setup — the DAY view is showing", "the day grid renders sessions", `segments=${JSON.stringify(seg)} · targetDate=${targetDate} · steppedDays=${stepped} · cells=${dayAll.length} ${JSON.stringify(dayAll.slice(0, 4))}`, dayAll.length > 0 ? "PASS" : "SKIP");

  const target = (dayAll.find((t) => /QA-expv/i.test(t)) ?? dayAll[0] ?? "").replace(/^\d\d:\d\d\s+/, "");
  const q = target.slice(0, 6);
  await page.getByLabel(/find student|ค้นหานักเรียน/i).first().fill(q);
  await page.waitForTimeout(2500);
  const dayFiltered = await gridLabels();
  await page.screenshot({ path: `${OUT}/sid-r38-3-day-filtered.png` });
  record(
    "#3 — the search filters the DAY view as well as the week",
    "only the matching student's sessions remain in the day grid",
    `query="${q}" · all=${dayAll.length} ${JSON.stringify(dayAll.slice(0, 3))} → filtered=${dayFiltered.length} ${JSON.stringify(dayFiltered.slice(0, 3))}`,
    dayFiltered.length > 0 && dayFiltered.length <= dayAll.length && dayFiltered.every((t) => t.toLowerCase().includes(q.toLowerCase())) ? "PASS" : "FAIL",
  );

  // and a non-match empties the day grid too
  await page.getByLabel(/find student|ค้นหานักเรียน/i).first().fill("zzzz-no-such-student");
  await page.waitForTimeout(2000);
  const dayNone = await gridLabels();
  record(
    "#3 — a non-matching query empties the DAY grid too",
    "no sessions painted",
    `cells=${dayNone.length}`,
    dayNone.length === 0 ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await page.screenshot({ path: `${OUT}/sid-r38-3-day-error.png` });
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
