// TASK-925 evidence (Flash): the All Report page against the dev FAKE (USE_FAKE_REPORTS=true for this run only), BF `next dev -p 3325`.
// A local dummy route-guard cookie, no credential. The fake's role/state comes from localStorage["fake-reports"]. NOT the real API (TASK-924/926).
// Run: PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = process.env.BASE ?? "http://localhost:3325";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tokenFor = (role) => `${b64({ alg: "none" })}.${b64({ sub: "flash-task925-evidence", role })}.x`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = [];
const cases = [
  ["ceo", "ok"],
  ["admin", "ok"],
  ["ceo", "empty"],
  ["ceo", "error"],
];
for (const [w, h] of [[1280, 900], [375, 812]]) {
  for (const [role, mode] of cases) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addCookies([{ name: "bo_token", value: tokenFor(role), url: BASE }]);
    await ctx.addInitScript(([r, m]) => window.localStorage.setItem("fake-reports", JSON.stringify({ role: r, mode: m })), [role, mode]);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const run = { w, role, mode, hscroll: {}, errors };
    const shot = (n) => page.screenshot({ path: join(here, `fake-${w}-${role}-${mode}-${n}.png`), fullPage: true });
    await page.goto(`${BASE}/reports`);
    await page.getByRole("tab", { name: "REPORT", exact: true }).waitFor({ timeout: 20000 });

    // REPORT
    if (mode === "error") await page.getByText("The report could not be loaded").first().waitFor({ timeout: 15000 });
    else if (mode === "empty") await page.getByText("No data for this period").first().waitFor({ timeout: 15000 });
    else await page.locator("[data-card='newStudents']").waitFor({ timeout: 15000 });
    run.reportCards = await page.locator("[data-overview-cards] [data-card]").count();
    run.reportHasMoney = /revenue|refunds/i.test(await page.locator("[role=tabpanel]:visible").innerText());
    run.hscroll.report = await hscroll();
    await shot("1-report");

    // COURSE
    await page.getByRole("tab", { name: "COURSE", exact: true }).click();
    if (mode === "error") await page.getByText("The report could not be loaded").first().waitFor({ timeout: 15000 });
    else if (mode === "empty") await page.getByText("No data for this period").first().waitFor({ timeout: 15000 });
    else await page.locator("[data-course-table]").waitFor({ timeout: 15000 });
    run.courseRows = await page.locator("[data-course-row]").count();
    run.courseHasRevenue = /revenue/i.test(await page.locator("[role=tabpanel]:visible").innerText());
    run.unmatchedNote = await page.locator("[data-unmatched-note]").count();
    run.hscroll.course = await hscroll();
    await shot("2-course");

    // STUDENT
    await page.getByRole("tab", { name: "STUDENT", exact: true }).click();
    if (mode === "error") await page.getByText("The report could not be loaded").first().waitFor({ timeout: 15000 });
    else if (mode === "empty") await page.getByText("No data for this period").first().waitFor({ timeout: 15000 });
    else await page.locator("[data-student-table]").waitFor({ timeout: 15000 });
    run.studentRows = await page.locator("[data-student-row]").count();
    run.hscroll.student = await hscroll();
    await shot("3-student");

    // the other three headings
    await page.getByRole("tab", { name: "STOCK", exact: true }).click();
    run.stockLink = await page.getByRole("link", { name: /Open STOCK report/ }).getAttribute("href");
    await page.getByRole("tab", { name: "SALARY", exact: true }).click();
    run.salaryText = await page.getByText("Coming with Salary.").first().isVisible();
    out.push(run);
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
