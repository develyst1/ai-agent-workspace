/**
 * QA harness — accept REQ-038 #3 (TASK-124, timetable student search) + TASK-125 (OBS-5 tiebreaker)
 * on `sid`, including the STANDING-RULE 4-width measurement of the now FOUR-control filter row.
 * READ-ONLY: filters and measurements only — nothing is created or changed.
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
const shot = (n) => page.screenshot({ path: `${OUT}/sid-r38-3-${n}.png` });

/** every booking label currently painted on the schedule grid */
const gridLabels = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map((b) => b.innerText.trim().replace(/\n/g, " "))
      .filter((t) => /^\d\d:\d\d\s+\S/.test(t)),
  );

try {
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);

  // ── is it deployed at all? ─────────────────────────────────────────────
  const findStudent = page.getByLabel(/find student|ค้นหานักเรียน/i).first();
  const present = (await findStudent.count()) > 0;
  const controls = await page.evaluate(() =>
    [...document.querySelectorAll("input")]
      .map((i) => ({
        label: i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent?.trim() ?? i.getAttribute("aria-label") ?? null,
        placeholder: i.placeholder || null,
        w: Math.round(i.getBoundingClientRect().width),
      }))
      .filter((x) => x.w > 0),
  );
  await shot("1-filter-row");
  record(
    "#3",
    "the timetable now carries a student search (this FAILED this morning)",
    'a "Find student" control beside Teacher / Type / Badge',
    `present=${present} · controls=${JSON.stringify(controls)}`,
    present ? "PASS" : "NOT DEPLOYED",
  );
  if (!present) throw new Error("#3 not deployed yet — stopping before the behaviour checks");

  // ── it actually filters ────────────────────────────────────────────────
  const before = await gridLabels();
  const target = (before.find((t) => /QA-expv/i.test(t)) ?? before[0] ?? "").replace(/^\d\d:\d\d\s+/, "");
  await findStudent.fill(target.slice(0, 6));
  await page.waitForTimeout(2000);
  const after = await gridLabels();
  await shot("2-filtered");
  record(
    "#3",
    "typing a name filters the visible schedule",
    "only the matching student's sessions remain painted",
    `query="${target.slice(0, 6)}" · before=${before.length} cells ${JSON.stringify(before.slice(0, 4))} · after=${after.length} cells ${JSON.stringify(after.slice(0, 4))}`,
    after.length > 0 && after.length < before.length && after.every((t) => t.toLowerCase().includes(target.slice(0, 6).toLowerCase())) ? "PASS" : "FAIL",
  );

  // case-insensitive
  await findStudent.fill(target.slice(0, 6).toUpperCase());
  await page.waitForTimeout(1800);
  const upper = await gridLabels();
  await findStudent.fill(target.slice(0, 6).toLowerCase());
  await page.waitForTimeout(1800);
  const lower = await gridLabels();
  record(
    "#3",
    "the match is case-insensitive",
    "UPPER and lower queries return the same rows",
    `upper=${upper.length} · lower=${lower.length}`,
    upper.length === lower.length && upper.length > 0 ? "PASS" : "FAIL",
  );

  // a non-matching query empties it (not "ignores the filter")
  await findStudent.fill("zzzz-no-such-student");
  await page.waitForTimeout(1800);
  const none = await gridLabels();
  record(
    "#3",
    "a non-matching query really filters (it doesn't silently ignore)",
    "no sessions painted",
    `cells=${none.length}`,
    none.length === 0 ? "PASS" : "FAIL",
  );

  // clear restores
  const clearBtn = page.locator("button.mantine-CloseButton-root:visible, button[aria-label*='lear' i]").first();
  if (await clearBtn.count()) await clearBtn.click();
  else await findStudent.fill("");
  await page.waitForTimeout(2000);
  const restored = await gridLabels();
  record(
    "#3",
    "clearing the box restores the full schedule",
    "back to the original session count",
    `before=${before.length} → cleared=${restored.length}`,
    restored.length === before.length ? "PASS" : "FAIL",
  );

  // ── both views (Sober built it into the day AND week memos) ────────────
  const dayBtn = page.getByRole("button", { name: /^daily$|^day$|รายวัน/i }).first();
  if (await dayBtn.count()) {
    await dayBtn.click();
    await page.waitForTimeout(2500);
    const dayAll = await gridLabels();
    await page.getByLabel(/find student|ค้นหานักเรียน/i).first().fill(target.slice(0, 6));
    await page.waitForTimeout(2000);
    const dayFiltered = await gridLabels();
    await shot("3-day-view-filtered");
    record(
      "#3",
      "the filter works in the DAY view too, not only the week",
      "the day grid filters the same way",
      `day all=${dayAll.length} → filtered=${dayFiltered.length} ${JSON.stringify(dayFiltered.slice(0, 3))}`,
      dayFiltered.length <= dayAll.length && dayFiltered.every((t) => t.toLowerCase().includes(target.slice(0, 6).toLowerCase())) ? "PASS" : "FAIL",
    );
    const weekBtn = page.getByRole("button", { name: /^weekly$|^week$|รายสัปดาห์/i }).first();
    if (await weekBtn.count()) await weekBtn.click();
    await page.waitForTimeout(2000);
  }

  // ── STANDING RULE — the 4-control filter row at four widths ───────────
  const widths = {};
  for (const w of [1600, 1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    widths[w] = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll("input")].filter((i) => i.getBoundingClientRect().width > 0);
      const rows = new Set(inputs.map((i) => Math.round(i.getBoundingClientRect().top)));
      return {
        controls: inputs.map((i) => ({
          label: (i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent?.trim() ?? i.getAttribute("aria-label") ?? "?").slice(0, 16),
          w: Math.round(i.getBoundingClientRect().width),
        })),
        linesUsed: rows.size,
        narrowest: Math.min(...inputs.map((i) => Math.round(i.getBoundingClientRect().width))),
        pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    await shot(`4-widths-${w}`);
  }
  const allUsable = Object.values(widths).every((v) => v.narrowest >= 100 && !v.pageHasHScroll);
  record(
    "STANDING RULE",
    "the now-FOUR-control filter row measured at 1600 / 1280 / 768 / 375",
    "no control collapses (the REQ-024 defect was 26/36 px); the row wraps instead of crushing; no page overflow",
    JSON.stringify(widths),
    allUsable ? "PASS" : "FAIL",
  );

  // ── TASK-125 — the OBS-5 expiry tiebreaker ────────────────────────────
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const m = page.locator('[role="dialog"]').first();
  await m.getByRole("tab", { name: /weekly course|คอร์ส/i }).first().click();
  await page.waitForTimeout(1500);
  await m.locator("input:visible").first().fill("QA-expv");
  await page.waitForTimeout(3000);
  await m.locator('input[role="combobox"]:visible').first().click();
  await page.waitForTimeout(1800);
  const opts = (await page.getByRole("option").allInnerTexts()).map((s) => s.replace(/\n/g, " · ").trim());
  await shot("5-obs5-tiebreaker");
  record(
    "TASK-125",
    "OBS-5 — two same-program courses are now distinguishable",
    "each duplicate entry carries an expiry tiebreaker; the two options are no longer identical strings",
    `options=${JSON.stringify(opts.slice(0, 4))}`,
    opts.length >= 2 && new Set(opts).size === opts.length ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
