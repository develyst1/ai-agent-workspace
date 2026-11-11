// TASK-937 batch 3 evidence (Flash): Revenue 6 pages + All Report, clicked headless in the BUILT single file (file://, offline): console, network, per-role access, key flows, shots.
// Run: DIST=<dist/index.html> PW_PATH=... node click-batch3.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];
const requests = [];
const res = { roles: {}, flows: {} };
const hook = (page, tag) => {
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${tag} ${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => problems.push(`${tag} pageerror: ${String(e).slice(0, 200)}`));
  page.on("request", (r) => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) requests.push(r.url().slice(0, 100)); });
};
const setRole = async (page, role) => { await page.goto(`${BASE}#/`); await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 }); await page.getByText(role, { exact: true }).first().click(); await page.waitForTimeout(300); };
const REV = ["summary", "lines", "manual", "refund", "categories", "eca-term"];

// ---- roles: which of the 7 pages open
for (const role of ["CEO", "Admin", "Coach"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  hook(page, role);
  await setRole(page, role);
  const out = [];
  for (const slug of REV) {
    await page.goto(`${BASE}#/revenue/${slug}`);
    await page.waitForTimeout(350);
    out.push(`${slug}:${(await page.locator("h2").count()) > 0 && !/cannot see|ไม่สามารถ/i.test(await page.locator("main, body").first().innerText()) ? "opens" : "cannot-see"}`);
  }
  await page.goto(`${BASE}#/reports/home`);
  await page.waitForTimeout(500);
  out.push(`all-report:${(await page.getByRole("tab", { name: "REPORT", exact: true }).count()) > 0 ? "opens" : "cannot-see"}`);
  res.roles[role] = out;
  await ctx.close();
}

// ---- flows as CEO (1280) + the same All Report as Admin
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
hook(page, "flows");
await setRole(page, "CEO");
const body = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
const toast = async () => (await page.locator(".mantine-Notification-description").last().innerText()).trim();

// Summary: title, ECA button, refund colour
await page.goto(`${BASE}#/revenue/summary`);
await page.getByRole("button", { name: "ECA Payment" }).waitFor();
res.flows.summary_title = (await page.locator("h2").first().innerText()).trim();
res.flows.summary_buttons = await page.locator("h2 + div button, main button").evaluateAll((bs) => bs.slice(0, 6).map((b) => b.textContent.trim()));
await page.screenshot({ path: join(here, "batch3-1280-ceo-summary.png"), fullPage: true });

// Detail: words
await page.goto(`${BASE}#/revenue/lines`);
await page.getByText("Product Name").first().waitFor();
const dt = await body();
res.flows.detail = { productName: dt.includes("Product Name"), payment: dt.includes("Payment"), summaryButton: dt.includes("Summary") };
await page.screenshot({ path: join(here, "batch3-1280-ceo-detail.png"), fullPage: true });

// Manual: empty form, inline errors, then a good save
await page.goto(`${BASE}#/revenue/manual`);
await page.getByRole("button", { name: "Save" }).click();
await page.getByText("Choose a type").waitFor();
const mt = await body();
res.flows.manual_errors = ["Choose a type", "Choose a category", "Enter an amount above 0"].every((t) => mt.includes(t));
await page.screenshot({ path: join(here, "batch3-1280-ceo-manual-errors.png"), fullPage: true });

// Categories: Add, duplicate refused inline
await page.goto(`${BASE}#/revenue/categories`);
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.getByLabel("New category").fill("Drink");
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "F&B", exact: true }).click();
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
res.flows.categories_dup = (await body()).includes("This category already exists");
await page.getByLabel("New category").fill("Roller derby");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(300);
res.flows.categories_added = (await body()).includes("Roller derby");

// ECA: empty form, total 0, errors, overflow, good save -> history +1 and form cleared
await page.goto(`${BASE}#/revenue/eca-term`);
await page.getByText("Total Amount").first().waitFor();
const ecaRowsBefore = await page.locator("tbody tr").count();
res.flows.eca_total_empty = (await page.getByText("Total Amount", { exact: true }).first().locator("xpath=following-sibling::*[1]").innerText()).trim();
await page.getByRole("button", { name: "Save" }).click();
res.flows.eca_errors = (await body()).includes("Choose a school") && (await body()).includes("Enter the term");
await page.getByRole("combobox", { name: "School" }).click();
await page.getByRole("option", { name: "STA", exact: true }).click();
await page.getByLabel("Term", { exact: true }).fill("Term 3");
await page.getByLabel("Price per class").fill("400");
await page.getByLabel("Student").fill("18");
await page.getByLabel("Class / Term").fill("5");
res.flows.eca_total_live = (await page.getByText("Total Amount", { exact: true }).first().locator("xpath=following-sibling::*[1]").innerText()).trim();
await page.screenshot({ path: join(here, "batch3-1280-ceo-eca.png"), fullPage: true });
await page.getByRole("button", { name: "Save" }).click();
await page.waitForTimeout(400);
res.flows.eca_rows = [ecaRowsBefore, await page.locator("tbody tr").count()];
res.flows.eca_cleared = (await page.getByLabel("Term", { exact: true }).inputValue()) === "";
res.flows.eca_toast = await toast();

// Refund: empty -> search -> pick -> confirm modal -> save -> Refunded badge, session box, Save shut; an already refunded sale
await page.goto(`${BASE}#/revenue/refund`);
await page.getByText("Pick a sale to see its sessions").waitFor();
await page.screenshot({ path: join(here, "batch3-1280-ceo-refund-empty.png"), fullPage: true });
await page.getByRole("textbox", { name: "From" }).click().catch(async () => { await page.getByPlaceholder("Search by student name").click(); });
await page.getByRole("option", { name: /น้องข้าวหอม/ }).first().click();
res.flows.refund_amount_default = (await page.getByLabel("Amount").inputValue()).trim();
res.flows.refund_session_before = (await body()).toLowerCase().includes("cancelled on save"); // Mantine badges are upper-cased by CSS: compare case-insensitively
await page.screenshot({ path: join(here, "batch3-1280-ceo-refund-picked.png"), fullPage: true });
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.getByRole("dialog").getByText("This cannot be undone").waitFor();
await page.screenshot({ path: join(here, "batch3-1280-ceo-refund-confirm.png"), fullPage: true });
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await page.getByRole("status").getByText(/Refund saved:/).waitFor(); // the in-page alert (the toast now starts with the same words)
const rb = (await body()).toLowerCase();
res.flows.refund_after = { savedAlert: rb.includes("refund saved:"), refundedBadge: rb.includes("refunded"), lineTold: rb.includes("the family was told by line"), cancelledBadge: rb.includes("cancelled") && !rb.includes("cancelled on save") };
await page.getByRole("dialog").waitFor({ state: "hidden" });
res.flows.refund_save_disabled = await page.getByRole("button", { name: "Save", exact: true }).isDisabled();
await page.screenshot({ path: join(here, "batch3-1280-ceo-refund-done.png"), fullPage: true });
await page.getByPlaceholder("Search by student name").click();
await page.getByRole("option", { name: /น้องใบบัว/ }).first().click();
res.flows.refund_already = (await body()).includes("This sale has already been refunded");

await ctx.close();

// ---- All Report as CEO and as Admin
for (const role of ["CEO", "Admin"]) {
  for (const [w, h] of [[1280, 900], [375, 812]]) {
    const c2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
    const p = await c2.newPage();
    hook(p, `AllReport-${role}-${w}`);
    await setRole(p, role); // the role switcher is in the desktop header; resize afterwards (the hash route keeps the page's state)
    await p.setViewportSize({ width: w, height: h });
    await p.goto(`${BASE}#/reports/home`);
    await p.locator("[data-card='newStudents']").waitFor({ timeout: 15000 });
    const hs = () => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const run = { cards: await p.locator("[data-overview-cards] [data-card]").count(), money: await p.locator("[data-card='revenue']").count(), hscroll: {} };
    run.hscroll.report = await hs();
    await p.screenshot({ path: join(here, `allreport-${w}-${role.toLowerCase()}-1-report.png`), fullPage: true });
    await p.getByRole("tab", { name: "COURSE", exact: true }).click();
    await p.locator("[data-course-table]").waitFor();
    run.courseRows = await p.locator("[data-course-row]").count();
    run.revenueCol = (await p.locator("[role=tabpanel]:visible").innerText()).toLowerCase().includes("revenue");
    run.unmatched = await p.locator("[data-unmatched-note]").count();
    run.voucherRows = await p.locator("[data-course-row]", { hasText: "Voucher" }).count();
    run.hscroll.course = await hs();
    await p.screenshot({ path: join(here, `allreport-${w}-${role.toLowerCase()}-2-course.png`), fullPage: true });
    await p.getByRole("tab", { name: "STUDENT", exact: true }).click();
    await p.locator("[data-student-table]").waitFor();
    run.studentRows = await p.locator("[data-student-row]").count();
    run.counts = (await p.locator("[data-student-counts]").innerText()).replace(/\s+/g, " ");
    run.hscroll.student = await hs();
    await p.screenshot({ path: join(here, `allreport-${w}-${role.toLowerCase()}-3-student.png`), fullPage: true });
    if (role === "CEO" && w === 1280) {
      // CSV export of the visible rows
      const [dl] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name: "Export CSV" }).click()]);
      const txt = (await (await import("node:fs/promises")).readFile(await dl.path(), "utf8"));
      run.csv = { name: dl.suggestedFilename(), bom: txt.charCodeAt(0) === 0xfeff, lines: txt.trimEnd().split("\r\n").length };
      // Status filter + search narrow it
      await p.getByRole("combobox", { name: "Status" }).click();
      await p.getByRole("option", { name: "All", exact: true }).click();
      run.rowsAll = await p.locator("[data-student-row]").count();
      await p.getByPlaceholder("Name, nickname or parent phone").fill("ภูมิ");
      await p.getByRole("button", { name: "Search", exact: true }).click();
      run.rowsSearch = await p.locator("[data-student-row]").count();
      // REPORT: month back, branch note; COURSE: earlier To shows the approx note
      await p.getByRole("tab", { name: "REPORT", exact: true }).click();
      await p.getByRole("combobox", { name: "Branch" }).click();
      await p.getByRole("option", { name: "Bravo", exact: true }).click();
      run.branchNote = (await p.locator("[data-students-all-branches]").count()) === 1;
      await p.getByRole("button", { name: "Previous month" }).click();
      run.prevMonthCards = await p.locator("[data-overview-cards] [data-card]").count();
      await p.getByRole("tab", { name: "STOCK", exact: true }).click();
      run.stockLink = await p.getByRole("link", { name: /Open STOCK report/ }).count();
      await p.getByRole("tab", { name: "SALARY", exact: true }).click();
      run.salaryLink = await p.getByRole("link", { name: /Open SALARY report/ }).getAttribute("href");
      await p.getByRole("tab", { name: "CHECK IN", exact: true }).click();
      run.checkInNote = (await p.locator("[data-linked='checkin']").innerText()).trim();
    }
    run.salaryTabShown = (await p.getByRole("tab", { name: "SALARY", exact: true }).count()) === 1;
    res.flows[`allreport_${role}_${w}`] = run;
    await c2.close();
  }
}
res.consoleProblems = problems;
res.networkRequests = requests;
console.log(JSON.stringify(res, null, 1));
await browser.close();
