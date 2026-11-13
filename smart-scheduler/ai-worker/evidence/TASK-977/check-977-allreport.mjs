// TASK-977 Amendment 1 (Flash, Team C): All Report #15 period picker on REVENUE, #16 titles, #17 Conversion note.
// Run against a SCRATCH build that temporarily mounts /reports/home (the real registry entry is gone after #14; the entry was re-added for this build only and removed again).
// Run: DIST=<scratch dist/index.html> PW_PATH=<playwright/index.mjs> node check-977-allreport.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync } from "node:fs";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], checks = [];
const ok = (name, cond, detail = "") => checks.push({ name, pass: !!cond, detail: String(detail).slice(0, 400) });
const txt = (s) => s.replace(/\s+/g, " ").trim();
const money = (s) => Number(String(s).replace(/[^0-9.\-]/g, "")) || 0;

const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
await page.goto(`${pathToFileURL(process.env.DIST).href}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await page.locator("header input").first().click();
await page.getByRole("option", { name: /^CEO/ }).first().click();
await page.waitForTimeout(300);
await page.evaluate(() => { location.hash = "#/reports/home"; });
await page.waitForTimeout(500);

/* REPORT tab: the Revenue figure of a month (the number the REVENUE tab must equal) */
const reportRevenue = async () => {
  const m = txt(await page.locator("main").innerText()).match(/(?:^|\s)Revenue ([\d,]+(?:\.\d+)?) ฿/i);
  return m ? money(m[1]) : null;
};
const setMonth = async (label) => {
  // the shell's MonthPicker: a button that opens a month grid
  const mp = page.locator("[data-rr-period] button, main .mantine-Card-root button").first();
  await mp.click();
  await page.waitForTimeout(200);
};
const reportOct = await reportRevenue();

await page.getByRole("tab", { name: "REVENUE", exact: true }).click();
await page.waitForTimeout(400);
const titles = await page.locator("[data-rr-title]").allInnerTexts();
ok("#16 the two section titles read «Revenue By Category» and «Revenue By Type»", titles.map(txt).join("|") === "Revenue By Category|Revenue By Type", titles.join("|"));
ok("#15 the REVENUE tab has a Month picker and a Branch select (the REPORT tab's bar)", (await page.locator("[data-rr-period]").count()) === 1 && (await page.locator("[data-rr-period]").innerText()).includes("Branch") && (await page.locator("[data-rr-period]").innerText()).includes("Month"), txt(await page.locator("[data-rr-period]").innerText()));
const colHeads = async () => (await page.locator("[data-rr-box='category'] thead th").allInnerTexts()).map(txt);
const totalRow = async (box) => (await page.locator(`[data-rr-box='${box}'] [data-total-row]`).first().locator("td").allInnerTexts()).map(txt);
ok("#15 default month Oct 2026 → columns: Sep 2026, Oct 2026, Total", (await colHeads()).join("|") === "Category|Type|Sep 2026|Oct 2026|Total", (await colHeads()).join("|"));
const t1 = await totalRow("category");
const t2 = await totalRow("type");
ok(`#15 Oct 2026 Total Revenue (${t1[3]}) equals the REPORT tab's Revenue for Oct (${reportOct})`, reportOct !== null && money(t1[3]) === reportOct, `${t1.join(" | ")} vs ${reportOct}`);
ok("#15 both boxes agree on the Total row", JSON.stringify(t1.slice(2)) === JSON.stringify(t2.slice(1)), `${t1.join("|")} / ${t2.join("|")}`);
await page.screenshot({ path: join(here, "r13-1280-ceo-allreport-revenue-oct.png"), fullPage: true });

/* pick another month through the real picker */
await page.getByLabel("Next month").click();
await page.waitForTimeout(350);
const pop = "Next month";
const heads2 = await colHeads();
ok("#15 picking Nov → columns Oct 2026, Nov 2026, Total (the table follows the picked period)", heads2.join("|") === "Category|Type|Oct 2026|Nov 2026|Total", heads2.join("|") + " · picker: " + txt(pop).slice(0, 60));
const novTotal = await totalRow("category");
// REPORT for Nov
await page.getByRole("tab", { name: "REPORT", exact: true }).click();
await page.waitForTimeout(300);
await page.getByLabel("Next month").click();
await page.waitForTimeout(350);
const reportNov = await reportRevenue();
ok(`#15 Nov 2026 Total Revenue (${novTotal[3]}) equals the REPORT tab's Revenue for Nov (${reportNov})`, reportNov !== null && money(novTotal[3]) === reportNov, `${novTotal.join(" | ")} vs ${reportNov}`);
await page.getByRole("tab", { name: "REVENUE", exact: true }).click();
await page.waitForTimeout(300);
await page.getByLabel("Next month").click(); // the tab opens on Oct again (it is not kept mounted): pick Nov once more
await page.waitForTimeout(350);
ok("#15 back on REVENUE, Nov again: its Total still equals the REPORT's Nov", money((await totalRow("category"))[3]) === reportNov, (await totalRow("category")).join(" | "));
await page.screenshot({ path: join(here, "r13-1280-ceo-allreport-revenue-nov.png"), fullPage: true });

/* Branch: the total follows the REPORT tab's Revenue for that branch */
await page.getByLabel("Branch", { exact: true }).and(page.locator("input")).first().click();
await page.getByRole("option", { name: "Bravo", exact: true }).click();
await page.waitForTimeout(350);
const bravo = await totalRow("category");
const bravoType = await totalRow("type");
ok("#15 Branch Bravo: both boxes still add up to the same Total row", JSON.stringify(bravo.slice(2)) === JSON.stringify(bravoType.slice(1)), `${bravo.join("|")}`);
ok("#15 Branch Bravo: its Total is smaller than All", money(bravo[3]) < money(novTotal[3]), `${bravo[3]} < ${novTotal[3]}`);
/* a month with no data */
await page.getByLabel("Branch", { exact: true }).and(page.locator("input")).first().click();
await page.getByRole("option", { name: "All", exact: true }).click();
await page.getByLabel("Next month").click();
await page.waitForTimeout(350);
ok("#15 a month outside the sample (Dec 2026) reads «No data for this period», no crash", (await page.locator("main").innerText()).includes("No data for this period"));
await page.getByLabel("Previous month").click();
await page.waitForTimeout(250);

/* Admin: no REVENUE tab at all */
await page.locator("header input").first().click();
await page.getByRole("option", { name: /^Admin/ }).first().click();
await page.waitForTimeout(400);
ok("Admin: the REVENUE tab is still not drawn", (await page.getByRole("tab", { name: "REVENUE", exact: true }).count()) === 0);

/* #17 Conversion note */
await page.locator("header input").first().click();
await page.getByRole("option", { name: /^CEO/ }).first().click();
await page.waitForTimeout(300);
await page.getByRole("tab", { name: "CONVERSION", exact: true }).click();
await page.waitForTimeout(500);
const note = await page.locator("main p, main .mantine-Text-root").evaluateAll((els) => els.map((e) => e.textContent).filter((t) => t && t.includes("Conversion %")));
ok("#17 the Conversion note reads exactly «Conversion % = Open Course ÷ 1st Trial (กดที่ตัวเลขเพื่อดูรายละเอียด)»", note.some((n) => n.trim() === "Conversion % = Open Course ÷ 1st Trial (กดที่ตัวเลขเพื่อดูรายละเอียด)"), JSON.stringify(note));
await page.screenshot({ path: join(here, "r13-1280-ceo-allreport-conversion.png"), fullPage: true });

/* 375: no overflow */
await page.getByRole("tab", { name: "REVENUE", exact: true }).click();
await page.setViewportSize({ width: 375, height: 900 });
await page.waitForTimeout(400);
ok("375 All Report REVENUE: no page overflow", (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
await page.screenshot({ path: join(here, "r13-375-ceo-allreport-revenue.png"), fullPage: true });

ok("0 console errors / warnings", problems.length === 0, problems.slice(0, 5).join(" · "));
const pass = checks.filter((c) => c.pass).length;
writeFileSync(join(here, "r13-allreport-run.json"), JSON.stringify({ pass, total: checks.length, checks, problems }, null, 1));
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"} ${c.name}${c.pass ? "" : "  ← " + c.detail}`);
console.log(`\n${pass}/${checks.length}`);
await browser.close();
