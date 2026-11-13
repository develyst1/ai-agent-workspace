// TASK-956 round 10b-C (Flash): the Conversion counts are DISTINCT CHILDREN. Built final-ui over file://, as CEO through the real "Viewing as" Select.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-10b-conversion.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], requests = [], checks = [];
const ok = (name, cond, detail = "") => checks.push({ name, pass: !!cond, detail: String(detail).slice(0, 300) });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) requests.push(r.url().slice(0, 100)); });

await page.goto(`${BASE}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await page.locator("header input").first().click();
await page.getByRole("option", { name: /^CEO/ }).first().click();
await page.evaluate(() => { location.hash = "#/reports/home"; });
await page.waitForTimeout(500);
await page.getByRole("tab", { name: "CONVERSION", exact: true }).click();
await page.waitForTimeout(300);

const MONTHS = ["Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];
const monthNow = async () => (await page.locator("[data-month-picker] p, [data-month-picker] .mantine-Text-root").first().innerText()).trim();
const gotoMonth = async (m) => { let g = 0; while ((await monthNow()) !== m && g++ < 6) { await page.getByRole("button", { name: MONTHS.indexOf(m) > MONTHS.indexOf(await monthNow()) ? "Next month" : "Previous month" }).click(); await page.waitForTimeout(150); } };
const setBranch = async (b) => { await page.getByRole("combobox", { name: "Branch", exact: true }).click(); await page.getByRole("option", { name: b, exact: true }).click(); await page.waitForTimeout(200); };

let cells = 0, bad = 0, multiRows = 0, badDetail = [];
const namesByMonthCoach = {}; // month -> name -> Set(coach)
let totalBad = 0, pctBad = 0;
const badNames = new Set(); // a name that is not «Nong <Nickname>» (e.g. a letter suffix)
for (const branch of ["All", "Bravo", "Other"]) {
  await setBranch(branch);
  for (const m of MONTHS) {
    await gotoMonth(m);
    const rowSums = { trial: 0, open: 0, renewal: 0 };
    for (const coach of ["Pete", "Ton", "May"]) {
      const tds = (await page.locator(`[data-conv-row="${coach}"] td`).allInnerTexts()).map((x) => x.trim());
      const counts = { trial: Number(tds[1]), open: Number(tds[2]), renewal: Number(tds[4]) };
      const expectPct = counts.trial === 0 ? "–" : `${Math.round((counts.open / counts.trial) * 100)}%`;
      if (tds[3] !== expectPct) pctBad++;
      for (const col of ["trial", "open", "renewal"]) {
        rowSums[col] += counts[col];
        if (counts[col] === 0) { if (await page.locator(`[data-conv-link="${coach}|${col}"]`).count()) { bad++; badDetail.push(`${branch}|${m}|${coach}|${col}: link on 0`); } cells++; continue; }
        await page.locator(`[data-conv-link="${coach}|${col}"]`).click();
        await page.waitForTimeout(120);
        const rows = await page.locator("[data-conv-modal] tbody tr").evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.trim())));
        const names = rows.map((r) => r[0]);
        const distinct = new Set(names).size;
        const multi = rows.filter((r) => r[1].includes(",")).length;
        multiRows += multi;
        // a multi-event row: as many courses as dates
        const mismatch = rows.some((r) => r[1].split(",").length !== r[2].split(",").length);
        cells++;
        if (rows.length !== counts[col] || distinct !== rows.length || mismatch) { bad++; badDetail.push(`${branch}|${m}|${coach}|${col}: count ${counts[col]} rows ${rows.length} distinct ${distinct}`); }
        for (const n of names) if (!/^Nong [A-Z][a-z]+$/.test(n)) badNames.add(n);
        if (branch === "All") for (const n of names) { ((namesByMonthCoach[m] ??= {})[n] ??= new Set()).add(coach); }
        await page.getByRole("button", { name: "Close", exact: true }).click();
        await page.waitForTimeout(100);
      }
    }
    const tot = (await page.locator('[data-conv-row="total"] td').allInnerTexts()).map((x) => x.trim());
    if (Number(tot[1]) !== rowSums.trial || Number(tot[2]) !== rowSums.open || Number(tot[4]) !== rowSums.renewal) totalBad++;
    const expTot = rowSums.trial === 0 ? "–" : `${Math.round((rowSums.open / rowSums.trial) * 100)}%`;
    if (tot[3] !== expTot) pctBad++;
  }
}
ok(`every coach × month × branch × column (${cells} cells): count = modal rows = distinct names, courses match dates`, bad === 0, badDetail.slice(0, 5).join(" ; "));
ok("Total row = sum of the coach rows in every month/branch", totalBad === 0, totalBad);
ok("Conversion % follows (coach rows and Total)", pctBad === 0, pctBad);
ok("At least one child row carries two dates (a child with two trials / renewals)", multiRows > 0, multiRows);
const twoCoaches = Object.entries(namesByMonthCoach).flatMap(([m, o]) => Object.entries(o).filter(([, s]) => s.size > 1).map(([n]) => `${m} ${n}`));
ok("No child appears under two coaches in one month", twoCoaches.length === 0, twoCoaches.slice(0, 5).join(" ; "));

ok("Every name is «Nong <Nickname>» with no letter suffix", badNames.size === 0, [...badNames].slice(0, 5).join(" ; "));
// every child has its own nickname: a name belongs to exactly one child, so the number of distinct names seen in all months = number of distinct (month, name) pairs
const allSeen = Object.values(namesByMonthCoach).flatMap((o) => Object.keys(o));
ok("No nickname is shared by two children (distinct across the whole mock)", new Set(allSeen).size === allSeen.length, `${new Set(allSeen).size} distinct of ${allSeen.length} child-months`);
// Pete · Oct · 1st Trial = 10 (All branches)
await setBranch("All");
await gotoMonth("Oct 2026");
const peteTrial = (await page.locator('[data-conv-row="Pete"] td').allInnerTexts())[1].trim();
await page.locator('[data-conv-link="Pete|trial"]').click();
await page.waitForTimeout(250);
const peteRows = await page.locator("[data-conv-modal] tbody tr").count();
const peteText = await page.locator("[data-conv-modal]").innerText();
ok("Pete · Oct 2026 · 1st Trial = 10, with 10 rows", peteTrial === "10" && peteRows === 10, `${peteTrial} / ${peteRows}`);
ok("Pete · Oct: its Conversion % = 7 ÷ 10 = 70%", (await page.locator('[data-conv-pct="Pete"]').innerText()).trim() === "70%");
await page.screenshot({ path: join(here, "r10b-1280-ceo-conversion-pete-oct-trial.png") });
await page.getByRole("button", { name: "Close", exact: true }).click();

console.log(JSON.stringify({ checks, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, modalSample: peteText.slice(0, 400), consoleProblems: problems, networkRequests: requests }, null, 1));
await browser.close();
