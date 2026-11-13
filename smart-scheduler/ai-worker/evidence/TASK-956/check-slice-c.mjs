// TASK-956 slice C (Flash): round-10 checks on the BUILT final-ui single file over file:// (offline), through the real "Viewing as" Select.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-slice-c.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], requests = [], checks = [];
const ok = (name, cond, detail = "") => checks.push({ name, pass: !!cond, detail: String(detail).slice(0, 300) });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on("request", (r) => { if (!/^(file|data|blob):/.test(r.url())) requests.push(r.url().slice(0, 100)); });

const viewAs = async (re) => { await page.locator("header input").first().click(); await page.getByRole("option", { name: re }).first().click(); await page.waitForTimeout(300); };
const hash = async (slug) => { await page.evaluate((s) => { location.hash = `#/${s}`; }, slug); await page.waitForTimeout(450); };
const num = (s) => Number(String(s).replace(/[^0-9.\-−]/g, "").replace("−", "-"));
const tabNames = () => page.locator('[role="tab"]').allInnerTexts();
const toasts = () => page.locator(".mantine-Notification-description").allInnerTexts();
const clickTab = async (name) => { await page.getByRole("tab", { name, exact: true }).click(); await page.waitForTimeout(350); };
const tableRows = (sel) => page.locator(`${sel} tbody tr`).evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim())));

await page.goto(`${BASE}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await viewAs(/^CEO/);

/* ── 1. Bonus (Conversion): Excel + PDF in the header ── */
await hash("proposed/conversion");
const convBtns = await page.locator("main button").allInnerTexts();
ok("1 Conversion header has Excel and PDF", convBtns.includes("Excel") && convBtns.includes("PDF"), convBtns.join("|"));
await page.getByRole("button", { name: "Excel", exact: true }).click();
await page.waitForTimeout(300);
let t = (await toasts()).join(" | ");
ok("1 Excel toast names the period", /conversion-2026-10-01_2026-10-31\.xlsx/.test(t), t);
await page.getByRole("button", { name: "PDF", exact: true }).click();
await page.waitForTimeout(300);
t = (await toasts()).join(" | ");
ok("1 PDF toast names the period", /conversion-2026-10-01_2026-10-31\.pdf/.test(t), t);

/* ── 2. Revenue Summary: Excel ── */
await hash("revenue/summary");
await page.getByRole("button", { name: "Excel", exact: true }).click();
await page.waitForTimeout(300);
t = (await toasts()).join(" | ");
ok("2 Summary Excel (Today) toast", /revenue-summary-2026-10-16\.xlsx/.test(t), t);
await clickTab("MTD");
await page.getByRole("button", { name: "Excel", exact: true }).click();
await page.waitForTimeout(300);
t = (await toasts()).join(" | ");
ok("2 Summary Excel (MTD) toast", /revenue-summary-2026-10\.xlsx/.test(t), t);

/* ── 3. All Report tabs as CEO ── */
await hash("reports/home");
const ceoTabs = await tabNames();
ok("3 CEO sees REVENUE and CONVERSION tabs", ceoTabs.includes("REVENUE") && ceoTabs.includes("CONVERSION"), ceoTabs.join("|"));
// REPORT tab revenue per month for the cross-check
const reportRevenue = {};
for (const m of ["Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"]) {
  await clickTab("REPORT");
  // go to the month by stepping the picker from Oct 2026
  const cur = async () => (await page.locator("[data-month-picker] p, [data-month-picker] .mantine-Text-root").first().innerText()).trim();
  let guard = 0;
  const order = ["Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];
  while ((await cur()) !== m && guard++ < 6) {
    const want = order.indexOf(m), have = order.indexOf(await cur());
    await page.getByRole("button", { name: want > have ? "Next month" : "Previous month" }).click();
    await page.waitForTimeout(200);
  }
  reportRevenue[m] = num(await page.locator('[data-card="revenue"] [data-card-value]').innerText());
}
await clickTab("REVENUE");
const hdrBtns = await page.locator("main button").allInnerTexts();
ok("3 REVENUE tab: Excel button in the header", hdrBtns.includes("Excel"), hdrBtns.join("|"));
await page.getByRole("button", { name: "Excel", exact: true }).click();
await page.waitForTimeout(300);
ok("3 REVENUE Excel toast", /report-revenue\.xlsx/.test((await toasts()).join(" | ")));
const catRows = await tableRows('[data-rr-box="category"] table');
const typeRows = await tableRows('[data-rr-box="type"] table');
const catHead = await page.locator('[data-rr-box="category"] thead th').allInnerTexts();
ok("3 REVENUE box 1 is by Category with months across", catHead[0] === "Category" && catHead.includes("Oct 2026") && catHead.includes("Total"), catHead.join("|"));
const typeHead = await page.locator('[data-rr-box="type"] thead th').allInnerTexts();
ok("3 REVENUE box 2 is by Type", typeHead[0] === "Type", typeHead.join("|"));
const totalCat = catRows.find((r) => r[0] === "Total Revenue");
const totalType = typeRows.find((r) => r[0] === "Total Revenue");
const catBody = catRows.filter((r) => r[0] !== "Total Revenue" && r[0] !== "Refund (Expense)");
const typeBody = typeRows.filter((r) => r[0] !== "Total Revenue" && r[0] !== "Refund (Expense)");
// Round 13 (TASK-977 #15, declared): the REVENUE tab now has a Month picker and shows the picked month and the one before it (not all four at once).
// So this check steps the picker through each month and reads that month's column (the one just before «Total»).
const monthCols = ["Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];
let sumsOk = true, typeEqCat = true, matchesReport = true;
const revCur = async () => (await page.locator("[data-month-picker] p, [data-month-picker] .mantine-Text-root").first().innerText()).trim();
for (const m of monthCols) {
  let guard = 0;
  while ((await revCur()) !== m && guard++ < 8) {
    await page.getByRole("button", { name: monthCols.indexOf(m) > monthCols.indexOf(await revCur()) ? "Next month" : "Previous month" }).click();
    await page.waitForTimeout(200);
  }
  const cR = await tableRows('[data-rr-box="category"] table');
  const tR = await tableRows('[data-rr-box="type"] table');
  const last = (r) => r.length - 2; // the month's own column, just before «Total»
  const cBody = cR.filter((r) => r[0] !== "Total Revenue" && r[0] !== "Refund (Expense)");
  const tBody = tR.filter((r) => r[0] !== "Total Revenue" && r[0] !== "Refund (Expense)");
  const cTot = cR.find((r) => r[0] === "Total Revenue");
  const tTot = tR.find((r) => r[0] === "Total Revenue");
  if (cBody.reduce((s, r) => s + num(r[last(r)]), 0) !== num(cTot[last(cTot)])) sumsOk = false;
  if (tBody.reduce((s, r) => s + num(r[last(r)]), 0) !== num(tTot[last(tTot)])) sumsOk = false;
  if (num(cTot[last(cTot)]) !== num(tTot[last(tTot)])) typeEqCat = false;
  if (num(cTot[last(cTot)]) !== reportRevenue[m]) matchesReport = false;
}
ok("3 Every month total = sum of its rows (both boxes)", sumsOk);
ok("3 Category box total = Type box total", typeEqCat);
ok("3 Month totals = REPORT tab Revenue", matchesReport, JSON.stringify(reportRevenue));
const typeNames = typeBody.map((r) => r[0]);
ok("3 Type names are REVENUE → Type", ["COURSE", "1ST TRIAL", "VOUCHER", "ECA", "SALES", "F&B", "RENT", "OTHER"].every((n) => typeNames.includes(n)), typeNames.join("|"));
await page.screenshot({ path: join(here, "r10c-1280-ceo-all-report-revenue.png"), fullPage: true });

/* ── 4. CONVERSION tab (CEO), every count against its list ── */
await clickTab("CONVERSION");
const convHead = await page.locator("[data-conversion-tab] thead th").allInnerTexts();
ok("4 Conversion columns", JSON.stringify(convHead) === JSON.stringify(["Coach", "1st Trial (Student)", "Open Course (After Trial)", "Conversion %", "Renewal Course"]), convHead.join("|"));
const verifyAll = async (label) => {
  let bad = 0, linksSeen = 0;
  for (const coach of ["Pete", "Ton", "May"]) {
    const row = page.locator(`[data-conv-row="${coach}"]`);
    const cells = await row.locator("td").allInnerTexts();
    const [, trial, open, pct, renew] = cells.map((x) => x.trim());
    const expectPct = Number(trial) === 0 ? "–" : `${Math.round((Number(open) / Number(trial)) * 100)}%`;
    if (pct !== expectPct) bad++;
    for (const [col, n] of [["trial", trial], ["open", open], ["renewal", renew]]) {
      const link = page.locator(`[data-conv-link="${coach}|${col}"]`);
      if (Number(n) === 0) { if (await link.count()) bad++; continue; }
      linksSeen++;
      await link.click();
      await page.waitForTimeout(250);
      const listLen = await page.locator("[data-conv-modal] tbody tr").count();
      const head = await page.locator("[data-conv-modal] thead th").allInnerTexts();
      if (listLen !== Number(n) || head.join("|") !== "Student|Date|Course") bad++;
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.waitForTimeout(250);
    }
  }
  ok(`4 ${label}: every count = its list length, % = Open ÷ Trial`, bad === 0, `links opened ${linksSeen}, bad ${bad}`);
};
await verifyAll("CEO All branches Oct 2026");
// screenshot with a modal open
await page.locator('[data-conv-link="Pete|open"]').click();
await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "r10c-1280-ceo-conversion-modal.png"), fullPage: true });
await page.getByRole("button", { name: "Close", exact: true }).click();
await page.waitForTimeout(250);
// branch filter + «–»
await page.getByRole("combobox", { name: "Branch", exact: true }).click();
await page.getByRole("option", { name: "Other", exact: true }).click();
await page.waitForTimeout(300);
await verifyAll("CEO branch Other Oct 2026");
await page.getByRole("button", { name: "Next month" }).click();
await page.waitForTimeout(300);
const tonNov = (await page.locator('[data-conv-pct="Ton"]').innerText()).trim();
ok("4 Ton, Other, Nov 2026: 1st Trial 0 gives «–»", tonNov === "–", tonNov);
await verifyAll("CEO branch Other Nov 2026");
await page.getByRole("button", { name: "Next month" }).click();
await page.waitForTimeout(300);
ok("4 A month with no data shows the empty state", (await page.locator("[data-conversion-tab]").innerText()).includes("No data for this period"));

/* ── 5. ECA Payment ── */
await hash("revenue/eca-term");
const pick = async (label, option) => { await page.getByRole("combobox", { name: label, exact: true }).first().click(); await page.getByRole("option", { name: option, exact: true }).first().click(); };
const lineVal = async (k) => num(await page.locator(`[data-eca-line="${k}"]`).innerText().then((s) => s.split("\n").pop()));
const result = async () => ({ before: await lineVal("Before VAT"), vat: await lineVal("VAT"), incl: await lineVal("Total incl. VAT"), wht: await lineVal("Withholding tax"), net: await lineVal("Net Amount") }); // round 13 (TASK-977 Amd 2, declared): «Net received» is now «Net Amount»
await pick("School", "STA");
await page.getByLabel("Term", { exact: true }).fill("Term 4");
await page.getByLabel("Price per class").fill("100");
await page.getByLabel("Student", { exact: true }).fill("10");
await page.getByLabel("Class / Term").fill("10");
await pick("Mode", "Amount includes VAT");
let r = await result();
ok("5 Example (incl. VAT 10,000) gives 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63", r.before === 9345.79 && r.vat === 654.21 && r.incl === 10000 && r.wht === 280.37 && r.net === 9719.63, JSON.stringify(r));
await page.setViewportSize({ width: 1280, height: 1500 });
await page.screenshot({ path: join(here, "r10c-1280-ceo-eca-form-example.png") });
await page.setViewportSize({ width: 1280, height: 900 });
const lineLabels = await page.locator("[data-eca-result] [data-eca-line]").evaluateAll((els) => els.map((e) => e.getAttribute("data-eca-line")));
ok("5 Result block has exactly the five lines", JSON.stringify(lineLabels) === JSON.stringify(["Before VAT", "VAT", "Total incl. VAT", "Withholding tax", "Net Amount"]), lineLabels.join("|"));
ok("5 «Proposed: to confirm» tag next to Net Amount", (await page.locator('[data-eca-line="Net Amount"] [data-proposed-tag]').innerText()).trim() === "Proposed: to confirm");
await pick("Mode", "Amount excludes VAT");
r = await result();
ok("5 Excludes VAT 10,000: 10,000 / 700 / 10,700 / 300 / 10,400", r.before === 10000 && r.vat === 700 && r.incl === 10700 && r.wht === 300 && r.net === 10400, JSON.stringify(r));
await pick("Mode", "Amount is net after WHT");
r = await result();
ok("5 Net 10,000: parts add up (Before + VAT = Total incl.; Total incl. − WHT = 10,000)", Math.abs(r.before + r.vat - r.incl) < 0.001 && Math.abs(r.incl - r.wht - 10000) < 0.001 && r.net === 10000, JSON.stringify(r));
await page.getByLabel("VAT %").fill("10");
await page.getByLabel("WHT %").fill("5");
r = await result();
ok("5 VAT % and WHT % are editable (net mode, 10 % / 5 %)", Math.abs(r.before - 9523.81) < 0.011 && Math.abs(r.incl - r.wht - 10000) < 0.001, JSON.stringify(r));
await page.getByLabel("VAT %").fill("7");
await page.getByLabel("WHT %").fill("3");
await pick("Mode", "Amount excludes VAT");

// Pending save, no Payment Date
const revenueVal = async () => num(await page.locator("[data-eca-revenue-value]").innerText());
const rev0 = await revenueVal();
ok("5 Revenue total counts Received rows only (64,800.00 at the start)", rev0 === 64800, rev0);
ok("5 «Revenue = Before VAT · Proposed: to confirm» tag", (await page.locator("[data-eca-revenue] [data-proposed-tag]").innerText()).trim() === "Revenue = Before VAT · Proposed: to confirm");
await pick("Status", "Pending");
ok("5 Payment Date field is gone while Pending", (await page.getByLabel("Payment Date").count()) === 0);
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(350);
const pendingRows = await page.locator('[data-eca-row="Pending"]').count();
ok("5 Saved Pending with no date: the list has 2 Pending rows (1 seeded + this one)", pendingRows === 2, pendingRows);
ok("5 Pending row shows «–» for the date and no revenue change", (await revenueVal()) === rev0 && (await page.locator('[data-eca-row="Pending"]').first().innerText()).includes("–"), await revenueVal());
// Status filter
await page.locator("input[data-eca-filter]").click();
await page.getByRole("option", { name: "Received", exact: true }).click();
await page.waitForTimeout(250);
ok("5 Filter Received: only Received rows", (await page.locator('[data-eca-row="Pending"]').count()) === 0 && (await page.locator('[data-eca-row="Received"]').count()) === 2);
await page.locator("input[data-eca-filter]").click();
await page.getByRole("option", { name: "Pending", exact: true }).click();
await page.waitForTimeout(250);
ok("5 Filter Pending: only Pending rows, each with Mark received + Delete", (await page.locator('[data-eca-row="Received"]').count()) === 0 && (await page.locator("[data-eca-receive]").count()) === 2 && (await page.locator("[data-eca-delete]").count()) === 2);
await page.locator("input[data-eca-filter]").click();
await page.getByRole("option", { name: "All", exact: true }).click();
await page.waitForTimeout(250);
ok("5 A Received row has no Delete", (await page.locator('[data-eca-row="Received"] [data-eca-delete]').count()) === 0);
// Mark received with an edited amount: the seeded KIS Term 3 (24,000, excl) -> 23,500
await page.locator('[data-eca-row="Pending"]', { hasText: "Term 3" }).locator("[data-eca-receive]").click();
await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "r10c-1280-ceo-eca-mark-received.png") });
const amt = page.locator("[data-eca-receive-modal]").getByLabel("Amount");
await amt.fill("23500");
await page.locator("[data-eca-receive-save]").click();
await page.waitForTimeout(350);
const rev1 = await revenueVal();
ok("5 Mark received moves the revenue total by the (edited) amount before VAT", rev1 === rev0 + 23500, `${rev0} -> ${rev1}`);
ok("5 The row is Received and now has no Delete", (await page.locator('[data-eca-row="Received"]', { hasText: "Term 3" }).count()) === 1 && (await page.locator('[data-eca-row="Received"]', { hasText: "Term 3" }).locator("[data-eca-delete]").count()) === 0);
// Delete the other Pending
await page.locator('[data-eca-row="Pending"]').first().locator("[data-eca-delete]").click();
await page.waitForTimeout(250);
await page.locator("[data-eca-delete-confirm]").click();
await page.waitForTimeout(300);
ok("5 A Pending row can be deleted; the total is unchanged", (await page.locator('[data-eca-row="Pending"]').count()) === 0 && (await revenueVal()) === rev1);
// Form is one column
const formRows = await page.evaluate(() => {
  const ws = [...document.querySelectorAll("main .mantine-InputWrapper-root")].filter((w) => w.getBoundingClientRect().width > 0 && !w.closest("table") && !w.querySelector("[data-eca-filter]") && !w.closest("[data-eca-revenue]"));
  const rows = new Map();
  for (const w of ws.slice(0, 11)) { const k = Math.round(w.getBoundingClientRect().top / 4); rows.set(k, (rows.get(k) ?? 0) + 1); }
  return { fields: Math.min(ws.length, 11), maxPerRow: Math.max(0, ...rows.values()) };
});
// Round 11 (TASK-957): the ECA form is the ONE exception to rule 6 (ขวัญ asked for a shorter box), a 3-column grid. The old «one field per row» line is retired.
ok("5 ECA form: compact 3-column grid (TASK-957 exception to rule 6), at most 3 fields per row", formRows.maxPerRow >= 1 && formRows.maxPerRow <= 3, JSON.stringify(formRows));
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: join(here, "r10c-1280-ceo-eca-form.png"), fullPage: true });

/* ── 6. PROPOSED menu ── */
const nav = await page.evaluate(() => {
  const n = document.querySelector("nav") ?? document.querySelector("aside") ?? document.body;
  return n.innerText;
});
const leftover = ["Payment Setting (Edit)", "Conversion export", "Revenue Summary export", "Stock Report filters", "Report Revenue + Conversion"].filter((x) => nav.includes(x));
ok("6 The 5 approved cards are gone from the menu", leftover.length === 0, leftover.join("|"));
ok("6 «Move course to branch» stays", nav.includes("Move course to branch"));
const propGroup = nav.split("\n").map((s) => s.trim()).filter(Boolean);
const i = propGroup.indexOf("PROPOSED");
ok("6 PROPOSED group lists only Move course to branch", i >= 0 && propGroup[i + 1] === "Move course to branch", propGroup.slice(i, i + 4).join("|"));

/* ── 7. Admin (Kung): sees CONVERSION, not REVENUE ── */
await hash("frontoffice/coach-login");
await page.locator('[data-menu-edit="kung"]').click();
await page.waitForTimeout(300);
const modal = page.locator("[data-menu-modal]");
for (const g of await modal.locator("[data-group-check]").all()) { if (await g.isChecked()) { await g.click(); if (await g.isChecked()) await g.click(); } }
for (const c of await modal.locator("[data-menu-check]").all()) if (await c.isChecked()) await c.uncheck();
await modal.locator('[data-menu-check="All Report"]').check();
await page.keyboard.press("Escape");
await page.waitForTimeout(250);
await viewAs(/^Admin \(Kung\)/);
await hash("reports/home");
const adminTabs = await tabNames();
ok("7 Admin: no REVENUE and no SALARY tab", !adminTabs.includes("REVENUE") && !adminTabs.includes("SALARY"), adminTabs.join("|"));
ok("7 Admin: CONVERSION tab is there", adminTabs.includes("CONVERSION"), adminTabs.join("|"));
await clickTab("CONVERSION");
ok("7 Admin: the Conversion table works and shows no money", (await page.locator("[data-conv-row]").count()) === 4 && !(await page.locator("main").innerText()).includes("฿"));
await page.screenshot({ path: join(here, "r10c-1280-admin-conversion.png"), fullPage: true });
ok("7 Admin: no Excel button on the Conversion tab", !(await page.locator("main button").allInnerTexts()).includes("Excel"));

/* ── 8. 375 px, no horizontal overflow ── */
await viewAs(/^CEO/);
await page.setViewportSize({ width: 375, height: 812 });
const over = {};
for (const [slug, tab] of [["reports/home", "REVENUE"], ["reports/home", "CONVERSION"], ["revenue/eca-term", null], ["revenue/summary", null], ["proposed/conversion", null]]) {
  await hash(slug);
  if (tab) { await page.getByRole("tab", { name: tab, exact: true }).click(); await page.waitForTimeout(300); }
  over[`${slug}${tab ? "#" + tab : ""}`] = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}
ok("8 375 px: no horizontal overflow", !Object.values(over).some(Boolean), JSON.stringify(over));
await page.setViewportSize({ width: 1280, height: 900 });

console.log(JSON.stringify({ checks, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, consoleProblems: problems, networkRequests: requests }, null, 1));
await browser.close();
