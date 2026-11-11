// TASK-925 REAL-API run (Flash, 2026-11-09): BF on :3325 (fake OFF, NEXT_PUBLIC_BACKOFFICE_API_URL=http://localhost:4310/api) → a LOCAL BB on :4310
// (SKIP_ADMIN_AUTH=true, DATABASE_URL host = sid, checked). The three /v1/reports routes are GET-only: nothing is written.
// Role: the dev bypass gives CEO. An ADMIN real run would need a signed token on sid, which the desk rules bar: NOT_TESTED (admin is proved on the fake + BB tests).
// PRIVACY: student cells are blurred BEFORE every shot, and this script prints counts only, never a name, phone or nickname.
// Run: PW_PATH=... node shoot-real.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = "http://localhost:3325";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "none" })}.${b64({ sub: "flash-task925-evidence", role: "ceo" })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = { runs: [] };
for (const [w, h] of [[1280, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([{ name: "bo_token", value: token, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  const calls = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/v1/reports/")) calls.push(`${r.request().method()} ${u.split("/v1/reports/")[1].split("?")[0]} ${r.status()}`);
  });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const blur = () => page.addStyleTag({ content: "[data-student-table] tbody td, [data-student-counts] ~ * input { filter: blur(7px) !important; }" });
  const run = { width: w, hscroll: {}, errors, calls };
  await page.goto(`${BASE}/reports`);
  await page.locator("[data-card='newStudents']").waitFor({ timeout: 30000 });
  run.cards = await page.locator("[data-overview-cards] [data-card]").count();
  run.revenueCard = (await page.locator("[data-card='revenueMinor']").count()) === 1;
  run.hscroll.report = await hscroll();
  await page.screenshot({ path: join(here, `real-${w}-1-report.png`), fullPage: true });

  // a branch → the "Students: all branches" note
  await page.locator("input:not([type=hidden])").first().click(); // the Branch select (the month field is not an <input>)
  await page.getByRole("option", { name: "Bravo", exact: true }).click();
  await page.locator("[data-students-all-branches]").waitFor({ timeout: 15000 });
  await page.waitForTimeout(1000);
  run.allBranchesNote = (await page.locator("[data-students-all-branches]").count()) === 1;
  await page.screenshot({ path: join(here, `real-${w}-1b-report-branch.png`), fullPage: true });

  await page.getByRole("tab", { name: "COURSE", exact: true }).click();
  await page.locator("[data-course-table]").or(page.getByText("No data for this period")).first().waitFor({ timeout: 30000 });
  run.courseRows = await page.locator("[data-course-row]").count();
  run.courseHasRevenueCol = /revenue/i.test(await page.locator("[role=tabpanel]:visible").innerText());
  run.unmatchedNote = await page.locator("[data-unmatched-note]").count();
  run.approxNote = await page.locator("[data-active-approx]").count();
  run.voucherRows = await page.locator("[data-course-row]", { hasText: "Voucher" }).count();
  run.hscroll.course = await hscroll();
  await page.screenshot({ path: join(here, `real-${w}-2-course.png`), fullPage: true });

  await page.getByRole("tab", { name: "STUDENT", exact: true }).click();
  await page.locator("[data-student-table]").or(page.getByText("No data for this period")).first().waitFor({ timeout: 30000 });
  await blur();
  run.studentRows = await page.locator("[data-student-row]").count();
  await page.waitForTimeout(1500); // lets the Activity options call (courses, 366 days) finish before `calls` is read
  run.studentCounts = (await page.locator("[data-student-counts]").innerText()).replace(/\s+/g, " ");
  run.hscroll.student = await hscroll();
  await page.screenshot({ path: join(here, `real-${w}-3-student.png`), fullPage: true });
  out.runs.push(run);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
