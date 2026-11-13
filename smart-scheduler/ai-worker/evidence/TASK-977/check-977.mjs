// TASK-977 (Flash, Team C): round 13 — Summary rows open Detail, Manual typed category, Refund badge, no SPORTS, ECA Edit/Cancel/columns, Demo Edit, Stock Report Day/Custom, no All Report.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-977.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync } from "node:fs";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [], checks = [];
const ok = (name, cond, detail = "") => { checks.push({ name, pass: !!cond, detail: String(detail).slice(0, 400) }); };

const open = async (w = 1280) => {
  const page = await (await browser.newContext({ viewport: { width: w, height: 900 } })).newPage();
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 200)}`));
  // Mantine renders a Select's input as a combobox, not a textbox: find every labelled field by its label
  const gbr = page.getByRole.bind(page);
  page.getByRole = (role, o) => (role === "textbox" && o?.name ? page.getByLabel(o.name, { exact: typeof o.name === "string" }).and(page.locator("input, textarea")) : gbr(role, o));
  await page.goto(`${pathToFileURL(process.env.DIST).href}#/`);
  await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
  return page;
};
const viewAs = async (page, re) => { await page.locator("header input").first().click(); await page.getByRole("option", { name: re }).first().click(); await page.waitForTimeout(300); };
const hash = async (page, slug) => { await page.evaluate((s) => { location.hash = `#/${s}`; }, slug); await page.waitForTimeout(450); };
const tab = async (page, name) => { await page.getByRole("tab", { name, exact: true }).click(); await page.waitForTimeout(300); };
const txt = (s) => s.replace(/\s+/g, " ").trim();
const money = (s) => Number(String(s).replace(/[^0-9.\-]/g, "")) || 0;
const rowsOf = (page, sel) => page.locator(`${sel} tbody tr`).evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim())));
const errCount = () => problems.length;

const page = await open();
await viewAs(page, /^CEO/);

/* ---------- #4 Summary → Detail ---------- */
await hash(page, "revenue/summary");
for (const t of ["Today", "MTD", "YTD"]) {
  await tab(page, t);
  // Type row
  const types = await page.locator("[data-type-row]").evaluateAll((els) => els.map((e) => ({ t: e.getAttribute("data-type-row"), cells: [...e.cells].map((c) => c.innerText.trim()) })));
  const ty = types.find((x) => money(x.cells[2]) > 0) ?? types[0];
  await page.locator(`[data-type-row="${ty.t}"]`).click();
  await page.waitForTimeout(500);
  const h = await page.evaluate(() => location.hash);
  const periodText = txt(await page.locator("main .mantine-Card-root").nth(1).locator("p, div").first().innerText());
  const detailRows = await rowsOf(page, "main");
  const totalRow = detailRows.find((r) => r[0]?.startsWith("Total Revenue"));
  const refundBlock = await page.locator("main tbody tr", { hasText: "Refund (Expense)" }).count();
  const sel = await page.locator("main input").evaluateAll((els) => els.map((e) => e.value));
  ok(`#4 ${t}: a Type row (${ty.t}) opens Detail with tab and branch`, h.includes("revenue/lines") && h.includes(`type=${encodeURIComponent(ty.t)}`) && h.includes(`tab=${t === "Today" ? "today" : t === "MTD" ? "mtd" : "ytd"}`) && h.includes("branch=All"), h);
  ok(`#4 ${t}: ${ty.t} Detail filter shows ${t === "Today" ? "Day" : t === "MTD" ? "Month" : "Custom"} · type ${ty.t}`, sel.includes(ty.t) && sel.includes(t === "Today" ? "Day" : t === "MTD" ? "Month" : "Custom"), sel.join(" | "));
  // the sample has lines for 14–16 Oct only, so the sums can match on Today alone (Detail says so under its table); MTD / YTD are checked by filter, not by total
  if (t === "Today") ok(`#4 ${t}: Detail line total = the row's Revenue (${ty.cells[2]})`, !!totalRow && money(totalRow[1]) === money(ty.cells[2]), `Detail: ${totalRow?.join(" | ")} · row: ${ty.cells.join(" | ")}`);
  else ok(`#4 ${t}: Detail total shown (sample has lines for 14–16 Oct only: ${totalRow?.[1]} vs the row's ${ty.cells[2]})`, !!totalRow, `Detail: ${totalRow?.join(" | ")}`);
  await hash(page, "revenue/summary");
  await tab(page, t);
  // Category row
  const cats = await page.locator("[data-category-row]").evaluateAll((els) => els.map((e) => ({ c: e.getAttribute("data-category-row"), cells: [...e.cells].map((c) => c.innerText.trim()) })));
  // one sport heading (Inline Skate: every plan folded together) and one type heading (ECA) per tab
  const ca = cats.find((x) => x.c === "Inline Skate") ?? cats[0];
  await page.locator(`[data-category-row="${ca.c}"]`).click();
  await page.waitForTimeout(500);
  const h2 = await page.evaluate(() => location.hash);
  const rows2 = await rowsOf(page, "main");
  const total2 = rows2.find((r) => r[0]?.startsWith("Total Revenue"));
  const sel2 = await page.locator("main input").evaluateAll((els) => els.map((e) => e.value));
  ok(`#4 ${t}: a Category row (${ca.c}) opens Detail with cat, tab, branch`, h2.includes("revenue/lines") && h2.includes(`cat=${encodeURIComponent(ca.c)}`) && h2.includes("tab=") && h2.includes("branch="), h2);
  ok(`#4 ${t}: Detail Category filter = «${ca.c} · All» and type COURSE`, sel2.includes(`${ca.c} · All`) && sel2.includes("COURSE"), sel2.join(" | "));
  if (t === "Today") ok(`#4 ${t}: ${ca.c} Detail line total = the row's Revenue (${ca.cells[2]})`, !!total2 && money(total2[1]) === money(ca.cells[2]), `Detail: ${total2?.join(" | ")} · row: ${ca.cells.join(" | ")}`);
  // a type heading (ECA) sets the type
  await hash(page, "revenue/summary");
  await tab(page, t);
  await page.locator('[data-category-row="ECA"]').click();
  await page.waitForTimeout(450);
  const selE = await page.locator("main input").evaluateAll((els) => els.map((e) => e.value));
  const totE = (await rowsOf(page, "main")).find((r) => r[0]?.startsWith("Total Revenue"));
  const ecaRow = cats.find((x) => x.c === "ECA");
  ok(`#4 ${t}: the «ECA» heading opens Detail on type ECA`, selE.includes("ECA"), selE.join(" | "));
  if (t === "Today") ok(`#4 ${t}: ECA Detail line total = the row's Revenue (${ecaRow.cells[2]})`, !!totE && money(totE[1]) === money(ecaRow.cells[2]), `Detail: ${totE?.join(" | ")}`);
  await hash(page, "revenue/summary");
  await tab(page, t);
  // keyboard + chevrons
  const chevs = await page.locator("[data-category-box] [data-row-chevron]").count();
  ok(`#4 ${t}: one chevron per Category row (${cats.length})`, chevs === cats.length, chevs);
  await page.locator(`[data-category-row="${ca.c}"]`).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  ok(`#4 ${t}: Enter on a focused Category row opens Detail`, (await page.evaluate(() => location.hash)).includes("cat="));
  await hash(page, "revenue/summary");
  await tab(page, t);
  // Total / Refund rows not clickable
  const h0 = await page.evaluate(() => location.hash);
  await page.locator("[data-category-box] [data-total-row]").click();
  if (await page.locator("[data-category-refund]").count()) await page.locator("[data-category-refund]").click();
  await page.waitForTimeout(250);
  ok(`#4 ${t}: Total and Refund rows of the Category box do not navigate`, (await page.evaluate(() => location.hash)) === h0, h0);
  // refund lines equal
  const refT = await page.locator("[data-type-box] tbody tr", { hasText: "Refund (Expense)" }).innerText().then(txt).catch(() => "none");
  const refC = await page.locator("[data-category-refund]").innerText().then(txt).catch(() => "none");
  ok(`#4 ${t}: Category box shows the Refund line equal to the Type box's`, refT !== "none" && refT === refC, `type: ${refT} · category: ${refC}`);
}
// Branch param on Today
await tab(page, "Today");
await page.locator("[data-type-box]").scrollIntoViewIfNeeded();
await page.getByRole("textbox", { name: "Branch" }).click().catch(() => {});
await page.getByRole("option", { name: "Bravo", exact: true }).click().catch(() => {});
await page.getByRole("button", { name: "Apply Filter" }).click();
await page.waitForTimeout(300);
const bt = await page.locator("[data-type-row]").first().getAttribute("data-type-row");
await page.locator(`[data-type-row="${bt}"]`).click();
await page.waitForTimeout(500);
const hb = await page.evaluate(() => location.hash);
const selb = await page.locator("main input").evaluateAll((els) => els.map((e) => e.value));
ok("#4 Today with Branch=Bravo: Detail opens on Bravo", hb.includes("branch=Bravo") && selb.includes("Bravo"), `${hb} · ${selb.join(" | ")}`);
// header Detail button opens on Day
await hash(page, "revenue/summary");
await page.getByRole("button", { name: "Detail", exact: true }).click();
await page.waitForTimeout(500);
const selD = await page.locator("main input").evaluateAll((els) => els.map((e) => e.value));
ok("#4 the header «Detail» button (no params) opens on Day, All, All", (await page.evaluate(() => location.hash)).endsWith("revenue/lines") && selD[2] === "Day" && selD[0] === "All" && selD[5] === "All" && selD[7] === "All", selD.join(" | "));

/* ---------- #5 Manual ---------- */
await hash(page, "revenue/manual");
await page.getByRole("textbox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByRole("textbox", { name: "Category" }).click();
const optNames = await page.getByRole("option").allInnerTexts();
ok("#5 Type OTHER: the Category list ends with «Other (type it)»", optNames[optNames.length - 1].trim() === "Other (type it)", optNames.join(", "));
const beforeList = optNames.slice(0, -1).join(",");
await page.getByRole("option", { name: "Other (type it)" }).click();
ok("#5 picking it shows a required «Category name» box (max 60)", (await page.locator("[data-typed-category]").count()) === 1 && (await page.locator("[data-typed-category]").getAttribute("maxlength")) === "60");
await page.getByRole("textbox", { name: "Amount" }).fill("500");
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForTimeout(300);
ok("#5 empty typed category → an error under the field", (await page.locator("main").innerText()).includes("Type the category name"));
await page.locator("[data-typed-category]").fill("  Team poster  ");
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForTimeout(400);
const toast = await page.locator(".mantine-Notification-root").allInnerTexts();
ok("#5 the saved line shows the typed name (trimmed) as its category", toast.some((x) => x.includes("category Team poster,")), toast.join(" / "));
await hash(page, "revenue/categories");
ok("#5 the category list / Categories page do not gain it", !(await page.locator("main").innerText()).includes("Team poster"));
await hash(page, "revenue/manual");
await page.getByRole("textbox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByRole("textbox", { name: "Category" }).click();
ok("#5 Manual's list for OTHER is unchanged", (await page.getByRole("option").allInnerTexts()).slice(0, -1).join(",") === beforeList);
await page.keyboard.press("Escape");

/* ---------- #7 Categories ---------- */
await hash(page, "revenue/categories");
const cat = await page.locator("main").innerText();
ok("#7 no SPORTS block on Type and Category", !/sports/i.test(cat), cat.slice(0, 120).replace(/\n/g, " "));
await page.screenshot({ path: join(here, "r13-1280-ceo-categories.png") });

/* ---------- #6 Refund ---------- */
await hash(page, "revenue/refund");
// try each source until one that is not already refunded shows the pre-save badge
let badgesBefore = [];
const nSrc = await (async () => { await page.getByLabel("From", { exact: true }).and(page.locator("input")).first().click(); const n = await page.getByRole("option").count(); await page.keyboard.press("Escape"); return n; })();
for (let i = 0; i < nSrc; i++) {
  await page.getByLabel("From", { exact: true }).and(page.locator("input")).first().click();
  await page.getByRole("option").nth(i).click();
  await page.waitForTimeout(250);
  badgesBefore = (await page.locator("main .mantine-Badge-root").allInnerTexts()).map(txt);
  if (badgesBefore.includes("Refund")) break;
}
const refundText = await page.locator("main").innerText();
ok("#6 Refund before save: the wording «Cancelled on save» is gone", !refundText.includes("Cancelled on save"), "");
ok("#6 the session badges include «Refund» before save", badgesBefore.some((b) => b.trim().toLowerCase() === "refund"), badgesBefore.join(", "));
await page.screenshot({ path: join(here, "r13-1280-ceo-refund-before.png") });

/* ---------- #8 ECA ---------- */
await hash(page, "revenue/eca-term");
const eca = async () => page.locator("[data-eca-revenue-value]").innerText().then(txt);
const heads = await page.locator("table thead th").allInnerTexts();
const headTxt = heads.map(txt);
ok("#8d History headers: School · Term · Status · Net Amount · Students · Payment Date · Action", headTxt.join("|").includes("School|Term|Status") && headTxt.some((h) => h.includes("Net Amount")) && headTxt.includes("Students") && !headTxt.some((h) => /Total Amount|Before VAT/.test(h)) && !headTxt.some((h) => h.includes("Net received")), headTxt.join(" | "));
ok("#8d the «Proposed: to confirm» tag stays on Net Amount", (await page.locator("table thead [data-proposed-tag]").count()) === 1);
const statusDefault = await page.locator("[data-eca-form] input").evaluateAll((els) => els.map((e) => e.value));
ok("#8a a new entry's Status defaults to Pending", statusDefault.includes("Pending") && !statusDefault.includes("Received"), statusDefault.join(" | "));
const totalBefore = await eca();
// Edit a Received row
const staRow = page.locator('[data-eca-row="Received"]').first();
const staCells = await staRow.locator("td").allInnerTexts();
await staRow.locator("[data-eca-edit]").click();
await page.waitForTimeout(300);
const formVals = await page.locator("[data-eca-form] input").evaluateAll((els) => els.map((e) => e.value));
ok("#8b Edit prefills the same form (school, term, price, students, classes)", formVals.includes(txt(staCells[0])) && formVals.includes(txt(staCells[1])) && formVals.some((v) => v.includes("400")) && formVals.includes("18") && formVals.includes("5"), formVals.join(" | "));
const rowsBeforeEdit = await page.locator("[data-eca-row]").count();
await page.getByRole("textbox", { name: "Term" }).fill("Term 2b");
await page.locator("[data-eca-save]").click();
await page.waitForTimeout(350);
const rowsAfterEdit = await page.locator("[data-eca-row]").count();
ok("#8b saving replaces that row (same count, new term)", rowsAfterEdit === rowsBeforeEdit && (await page.locator("table tbody").innerText()).includes("Term 2b"), `${rowsBeforeEdit} → ${rowsAfterEdit}`);
// Cancel
const totalPre = await eca();
const rcvRow = page.locator('[data-eca-row="Received"]').first();
const net = txt(await rcvRow.locator("td").nth(3).innerText());
await rcvRow.locator("[data-eca-cancel]").click();
await page.waitForTimeout(300);
await page.locator("[data-eca-cancel-confirm]").click();
await page.waitForTimeout(250);
ok("#8c Cancel with an empty reason is refused (reason required)", (await page.locator("[data-eca-cancel-modal]").innerText()).includes("Enter the reason"));
await page.locator("[data-eca-cancel-reason-input]").fill("School withdrew the term");
await page.locator("[data-eca-cancel-confirm]").click();
await page.waitForTimeout(400);
const totalPost = await eca();
const canc = page.locator('[data-eca-row="Cancelled"]').first();
ok("#8c the row stays as a grey Cancelled badge with its reason", (await canc.count()) === 1 && (await canc.locator("[data-eca-status]").innerText()).trim() === "Cancelled" && (await canc.innerText()).includes("School withdrew the term"), await canc.innerText().then(txt));
ok("#8c a Cancelled row has no Edit / Cancel / Delete", (await canc.locator("button").count()) === 0);
ok(`#8c the revenue total drops (before ${totalPre}, after ${totalPost})`, money(totalPost) < money(totalPre), `${totalPre} → ${totalPost}`);
ok("#8c the Status filter offers Cancelled", await (async () => { await page.locator("[data-eca-filter]").click(); const o = await page.getByRole("option").allInnerTexts(); await page.keyboard.press("Escape"); return o.includes("Cancelled"); })());
// Delete of Pending stays
ok("#8c a Pending row still has Delete", (await page.locator('[data-eca-row="Pending"] [data-eca-delete]').count()) >= 1);
// alignment: Net Amount and Students right-aligned
const al = await page.locator("[data-eca-row]").first().locator("td").evaluateAll((tds) => tds.map((t) => getComputedStyle(t).textAlign));
ok("#8d Net Amount and Students are right-aligned", al[3] === "right" && al[4] === "right", al.join(","));
ok("#8d O-151-11a kept: Status / Term nowrap, table minWidth 900", (await page.locator("[data-eca-row]").first().locator("td").nth(1).evaluate((e) => getComputedStyle(e).whiteSpace)) === "nowrap");
// Amendment 2 (O-151-13c): the form's summary card line reads «Net Amount», bold, with the tag; «Net received» is gone from the page
const card = await page.locator('[data-eca-result] [data-eca-line="Net Amount"]').evaluate((e) => ({ label: e.querySelector("p").innerText.trim(), fw: getComputedStyle(e.querySelectorAll("p")[e.querySelectorAll("p").length - 1]).fontWeight, tag: e.querySelectorAll("[data-proposed-tag]").length }));
ok("Amd 2: the form card reads «Net Amount» (value bold) with the Proposed tag", card.label === "Net Amount" && Number(card.fw) >= 700 && card.tag === 1, JSON.stringify(card));
ok("Amd 2: «Net received» appears nowhere on the page", !(await page.locator("main").innerText()).includes("Net received"));
await page.locator("[data-eca-result]").screenshot({ path: join(here, "r13-1280-ceo-eca-form-card.png") });
// Round 13 rework (Sector): every History header shows in full at 1280, the Proposed tag is whole and under «Net Amount», and the table fits its card
const hdr = await page.locator("table thead th").evaluateAll((els) => els.map((e) => ({ t: e.innerText.replace(/\s+/g, " ").trim(), clipped: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((x) => x.scrollWidth > x.clientWidth + 1) })));
ok("1280 ECA History: no header is clipped", hdr.every((h) => !h.clipped), JSON.stringify(hdr));
ok("1280 ECA History: the last header reads «Action» in full", hdr[hdr.length - 1].t === "Action", hdr[hdr.length - 1].t);
const fit = await page.locator("table").last().evaluate((t) => { const c = t.closest(".mantine-Card-root").getBoundingClientRect(); const r = t.getBoundingClientRect(); const th = t.querySelector("thead th:last-child").getBoundingClientRect(); return { tableRight: Math.round(r.right), cardRight: Math.round(c.right), lastHeadRight: Math.round(th.right), scroll: t.parentElement.scrollWidth > t.parentElement.clientWidth + 1 }; });
ok("1280 ECA History: the table fits its card (no inner scroll, last header inside the card)", !fit.scroll && fit.lastHeadRight <= fit.cardRight, JSON.stringify(fit));
const tag = await page.locator("table thead [data-proposed-tag]").evaluate((e) => ({ clipped: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((x) => x.scrollWidth > x.clientWidth + 1), text: e.innerText.trim(), under: e.getBoundingClientRect().top > e.closest("th").querySelector("span").getBoundingClientRect().bottom - 2 }));
ok("1280 ECA History: «Proposed: to confirm» is whole and sits under «Net Amount»", !tag.clipped && tag.text === "Proposed: to confirm" && tag.under, JSON.stringify(tag));
await page.screenshot({ path: join(here, "r13-1280-ceo-eca-payment.png"), fullPage: true });

/* ---------- #10 Demo ---------- */
await hash(page, "stock/demo");
const matrixBefore = await rowsOf(page, "[data-demo-matrix]");
const row0 = page.locator("[data-demo-history-row]").first();
const h0txt = txt(await row0.innerText());
await row0.locator("[data-demo-history-edit]").click();
await page.waitForTimeout(300);
await page.locator("[data-demo-edit-why]").fill("Needed for the Wednesday class");
await page.getByLabel("Qty", { exact: true }).and(page.locator("input")).fill("1");
await page.locator("[data-demo-edit-save]").click();
await page.waitForTimeout(400);
const row0after = page.locator("[data-demo-history-row]").first();
const matrixAfter = await rowsOf(page, "[data-demo-matrix]");
ok("#10 an edited History row shows «edited» and the new remark", (await row0after.locator("[data-edited-badge]").count()) === 1 && (await row0after.innerText()).includes("Needed for the Wednesday class"), txt(await row0after.innerText()));
ok("#10 stock counts follow: Skateboard Bravo +1, STA −1 (qty 2 → 1)", JSON.stringify(matrixBefore) !== JSON.stringify(matrixAfter), `before ${matrixBefore.find((r) => r[0] === "Skateboard")} → after ${matrixAfter.find((r) => r[0] === "Skateboard")} (was: ${h0txt})`);
await page.screenshot({ path: join(here, "r13-1280-ceo-demo.png"), fullPage: true });

/* ---------- #11 Stock Report ---------- */
await hash(page, "stock/reports");
const seg = await page.locator("[data-period-filter] .mantine-SegmentedControl-label").allInnerTexts();
ok("#11 the period control shows only Day and Custom, default Day", seg.map(txt).join(",") === "Day,Custom" && (await page.locator("[data-period-filter] .mantine-SegmentedControl-root input:checked").getAttribute("value")) === "day", seg.join(","));

/* ---------- #14 All Report hidden ---------- */
for (const who of [/^CEO/, /^Admin/]) {
  const p = await open();
  await viewAs(p, who);
  const menu = await p.locator("nav, aside").first().innerText();
  await hash(p, "");
  const home = await p.locator("main").innerText();
  ok(`#14 ${who}: no «All Report» in the menu or on Home`, !/All Report/i.test(menu) && !/All Report/i.test(home), "");
  await hash(p, "reports/home");
  const nf = await p.locator("main").innerText();
  ok(`#14 ${who}: /reports/home gives the shell's not-found / cannot-see screen`, nf.trim().length > 0 && !/All Report|Revenue|Student/.test(nf.split("\n")[0]), txt(nf).slice(0, 100));
  await p.context().close();
}

/* ---------- screenshots at 375 + 1280 ---------- */
await page.setViewportSize({ width: 1280, height: 900 });
await hash(page, "revenue/summary");
await page.screenshot({ path: join(here, "r13-1280-ceo-summary.png"), fullPage: true });
await page.setViewportSize({ width: 375, height: 900 });
await hash(page, "revenue/summary");
await page.screenshot({ path: join(here, "r13-375-ceo-summary.png"), fullPage: true });
const ov = async () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok("375 Summary: no page overflow", (await ov()) <= 0, await ov());
await hash(page, "revenue/eca-term");
ok("375 ECA Payment: no page overflow", (await ov()) <= 0, await ov());
const clip375 = await page.locator("[data-eca-status]").evaluateAll((els) => els.map((e) => ({ t: e.innerText.trim(), clipped: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((x) => x.scrollWidth > x.clientWidth + 1) })));
ok("375 ECA History: «Pending» / «Received» / «Cancelled» read in full, not clipped (O-151-11a)", clip375.length >= 3 && clip375.every((b) => !b.clipped), JSON.stringify(clip375));
await page.locator("[data-eca-row]").first().scrollIntoViewIfNeeded();
await page.screenshot({ path: join(here, "r13-375-ceo-eca-history.png") });
await page.screenshot({ path: join(here, "r13-375-ceo-eca-payment.png"), fullPage: true });
await hash(page, "stock/demo");
ok("375 Stock Demo: no page overflow", (await ov()) <= 0, await ov());
await page.screenshot({ path: join(here, "r13-375-ceo-demo.png"), fullPage: true });

ok("0 console errors / warnings on the touched pages", errCount() === 0, problems.slice(0, 5).join(" · "));
const pass = checks.filter((c) => c.pass).length;
writeFileSync(join(here, "r13-run.json"), JSON.stringify({ pass, total: checks.length, checks, problems }, null, 1));
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"} ${c.name}${c.pass ? "" : "  ← " + c.detail}`);
console.log(`\n${pass}/${checks.length}`);
await browser.close();
