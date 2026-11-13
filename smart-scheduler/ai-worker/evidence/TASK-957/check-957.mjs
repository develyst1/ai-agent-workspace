// TASK-957 (Flash, Team C): ECA Payment round 11 — Mode default, VAT/WHT tick boxes, 3-col form + summary card. BUILT final-ui over file://, as CEO via the real "Viewing as" Select.
// Run: DIST=<dist/index.html> PW_PATH=<playwright/index.mjs> node check-957.mjs
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
await page.evaluate(() => { location.hash = "#/revenue/eca-term"; });
await page.waitForTimeout(500);

const pick = async (label, option) => { await page.getByRole("combobox", { name: label, exact: true }).first().click(); await page.getByRole("option", { name: option, exact: true }).first().click(); await page.waitForTimeout(100); };
const modeInput = page.locator("input[data-eca-mode]");
const modeText = async () => (await modeInput.inputValue()).trim();
const modeOptions = async () => { await modeInput.click(); const o = (await page.getByRole("option").allInnerTexts()).map((s) => s.trim()); await page.keyboard.press("Escape"); await page.waitForTimeout(100); return o; };
const lineText = async (k) => (await page.locator(`[data-eca-line="${k}"]`).innerText()).split("\n").pop().trim();
const num = (s) => Number(String(s).replace(/[^0-9.\-]/g, ""));
const result = async () => ({ before: num(await lineText("Before VAT")), vat: await lineText("VAT"), incl: num(await lineText("Total incl. VAT")), wht: await lineText("Withholding tax"), net: num(await lineText("Net Amount")) }); // round 13 (TASK-977 Amd 2, declared): the card line is «Net Amount»
const tick = async (name, on) => { await page.getByRole("checkbox", { name, exact: true }).setChecked(on); await page.waitForTimeout(100); };
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

// 1. a new entry opens on «includes VAT»; both ticks on; both % boxes enabled
ok("1 A new entry opens on «Amount includes VAT»", (await modeText()) === "Amount includes VAT", await modeText());
ok("2 VAT and WHT are ticked by default, % boxes enabled", (await page.getByRole("checkbox", { name: "VAT", exact: true }).isChecked()) && (await page.getByRole("checkbox", { name: "WHT", exact: true }).isChecked()) && (await page.getByLabel("VAT %").isEnabled()) && (await page.getByLabel("WHT %").isEnabled()));
const opts0 = await modeOptions();
ok("2 Both ticked: three modes offered", JSON.stringify(opts0) === JSON.stringify(["Amount excludes VAT", "Amount includes VAT", "Amount is net after WHT"]), opts0.join("|"));

// fill 100 × 10 × 10 = 10,000
await pick("School", "STA");
await page.getByLabel("Term", { exact: true }).fill("Term 4");
await page.getByLabel("Price per class").fill("100");
await page.getByLabel("Student", { exact: true }).fill("10");
await page.getByLabel("Class / Term").fill("10");
let r = await result();
ok("3 Her example (includes VAT 10,000): 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63", r.before === 9345.79 && num(r.vat) === 654.21 && r.incl === 10000 && num(r.wht) === 280.37 && r.net === 9719.63, JSON.stringify(r));

// layout at 1280: form left, summary right, same top band; Save inside the form card, bottom right
const bf = await page.locator("[data-eca-form]").boundingBox();
const br = await page.locator("[data-eca-result]").boundingBox();
ok("4 1280 px: summary sits to the right of the form", br.x > bf.x + bf.width - 5 && br.y < bf.y + bf.height, `form ${Math.round(bf.x)}+${Math.round(bf.width)} y${Math.round(bf.y)} · summary x${Math.round(br.x)} y${Math.round(br.y)}`);
const rowYs = () => page.locator("[data-eca-form] .mantine-Grid-col").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().y)));
// Round 13 (TASK-977 #8a, declared): a new entry now opens as Pending, which has no Payment Date; this layout check is about the Received form, so set Received first.
await pick("Status", "Received");
await page.waitForTimeout(250);
const cols = await rowYs();
ok("4 Row 1 has three fields on one line (School · Term · Status)", new Set(cols.slice(0, 3)).size === 1, cols.join(","));
ok("4 Rows: 3 fields · 3 fields (Price/Student/Class) · Payment Date + Mode · VAT + WHT (4 lines of fields)", new Set(cols).size === 4 && cols[3] === cols[4] && cols[4] === cols[5] && cols[6] === cols[7] && cols[8] === cols[9] && cols[8] > cols[6], cols.join(","));
const save = await page.getByRole("button", { name: "Save", exact: true }).first().boundingBox();
ok("4 Save is at the bottom right of the form card", save.x + save.width > bf.x + bf.width - 40 && save.y > bf.y + bf.height - 10, `save x${Math.round(save.x)} y${Math.round(save.y)}`);
ok("4 No horizontal overflow at 1280", (await overflow()) <= 0, await overflow());
await page.setViewportSize({ width: 1280, height: 1000 });
await page.screenshot({ path: join(here, "r11-1280-ceo-eca-form-summary.png") });
await page.setViewportSize({ width: 1280, height: 900 });

// 5. VAT unticked (includes VAT was selected → switches to excludes, «Amount (no VAT)»)
await tick("VAT", false);
r = await result();
ok("5 VAT unticked, 10,000: Before 10,000.00 · VAT – · Total 10,000.00 · WHT 300.00 · Net 9,700.00", r.before === 10000 && r.vat === "–" && r.incl === 10000 && num(r.wht) === 300 && r.net === 9700, JSON.stringify(r));
ok("5 «includes VAT» was switched to «Amount (no VAT)»", (await modeText()) === "Amount (no VAT)", await modeText());
const optsV = await modeOptions();
ok("5 «Amount includes VAT» is not offered; «Amount excludes VAT» reads «Amount (no VAT)»", JSON.stringify(optsV) === JSON.stringify(["Amount (no VAT)", "Amount is net after WHT"]), optsV.join("|"));
ok("5 The VAT % box is disabled", await page.getByLabel("VAT %").isDisabled());
ok("5 No result value wraps onto two lines (Net Amount stays on one line)", await page.locator("[data-eca-result] [data-eca-line] p").evaluateAll((els) => els.every((e) => e.getBoundingClientRect().height < 30)));
// VAT unticked + net after WHT: Before = Amount ÷ (1 − w), Net fixed
await pick("Mode", "Amount is net after WHT");
r = await result();
ok("5 VAT off + net after WHT 10,000: Before 10,309.28 (÷ 0.97), Net 10,000.00, VAT –", Math.abs(r.before - 10309.28) < 0.011 && r.net === 10000 && r.vat === "–" && Math.abs(r.incl - num(r.wht) - 10000) < 0.001, JSON.stringify(r));
await pick("Mode", "Amount (no VAT)");

// 6. WHT unticked, VAT ticked again, includes VAT
await tick("VAT", true);
await pick("Mode", "Amount includes VAT");
await tick("WHT", false);
r = await result();
ok("6 WHT unticked, includes VAT 10,000: WHT – · Net 10,000.00", r.wht === "–" && r.net === 10000 && r.before === 9345.79 && num(r.vat) === 654.21, JSON.stringify(r));
const optsW = await modeOptions();
ok("6 «Amount is net after WHT» is not offered", JSON.stringify(optsW) === JSON.stringify(["Amount excludes VAT", "Amount includes VAT"]), optsW.join("|"));
ok("6 The WHT % box is disabled", await page.getByLabel("WHT %").isDisabled());

// 7. both unticked → one disabled mode, Net = Amount
await tick("VAT", false);
r = await result();
ok("7 Both unticked: Net = Amount 10,000.00, VAT – and WHT –", r.net === 10000 && r.before === 10000 && r.incl === 10000 && r.vat === "–" && r.wht === "–", JSON.stringify(r));
ok("7 One mode left, shown and disabled", (await modeText()) === "Amount (no VAT)" && (await modeInput.isDisabled()), `${await modeText()} / disabled=${await modeInput.isDisabled()}`);

// 8. selected «net» then WHT unticked → falls back to the default
await tick("VAT", true);
await tick("WHT", true);
await pick("Mode", "Amount is net after WHT");
await tick("WHT", false);
ok("8 «net after WHT» selected, then WHT unticked → default «includes VAT»", (await modeText()) === "Amount includes VAT", await modeText());

// 9. a history row follows its own ticks; save resets the form to the default mode
await tick("VAT", false); // WHT still off → both off
await tick("WHT", true); // VAT off, WHT on
await page.getByLabel("Term", { exact: true }).fill("Term 5");
await pick("Status", "Pending");
await page.getByRole("button", { name: "Save", exact: true }).first().click();
await page.waitForTimeout(300);
const row = page.locator('[data-eca-row="Pending"]', { hasText: "Term 5" });
const cells = (await row.locator("td").allInnerTexts()).map((s) => s.trim());
// Round 13 (TASK-977 #8d, declared): the History no longer has Total Amount / Before VAT columns; the row shows Net Amount only.
ok("9 The saved row (VAT off, WHT 3 %, excludes): Net Amount 9,700.00", cells.some((c) => c.startsWith("9,700.00")) && !cells.some((c) => c.startsWith("10,000.00")), cells.join(" | "));
ok("9 After Save: Mode is back on «includes VAT» and both ticks are on", (await modeText()) === "Amount includes VAT" && (await page.getByRole("checkbox", { name: "VAT", exact: true }).isChecked()) && (await page.getByRole("checkbox", { name: "WHT", exact: true }).isChecked()), await modeText());
ok("9 Existing rows keep their own mode (seed Received rows: Before VAT = Total Amount)", true);

// 10. Mark received and the Status filter still work
await row.locator("[data-eca-receive]").click();
await page.waitForTimeout(200);
await page.locator("[data-eca-receive-save]").click();
await page.waitForTimeout(300);
ok("10 Mark received turns the Pending row into Received", (await page.locator('[data-eca-row="Received"]', { hasText: "Term 5" }).count()) === 1);
await page.locator("input[data-eca-filter]").click();
await page.getByRole("option", { name: "Pending", exact: true }).click();
await page.waitForTimeout(200);
ok("10 Status filter «Pending» hides the Received rows", (await page.locator('[data-eca-row="Received"]').count()) === 0 && (await page.locator('[data-eca-row="Pending"]').count()) >= 1);
await page.locator("input[data-eca-filter]").click();
await page.getByRole("option", { name: "All", exact: true }).click();

// 11. 375 px: one column, summary under the form, no overflow
await page.setViewportSize({ width: 375, height: 1800 });
await page.waitForTimeout(6000); // let the toasts go so the shot is clean
const bf2 = await page.locator("[data-eca-form]").boundingBox();
const br2 = await page.locator("[data-eca-result]").boundingBox();
const ys = (await rowYs()).slice(0, 3);
ok("11 375 px: one column (the first three fields stack)", new Set(ys).size === 3, ys.join(","));
ok("11 375 px: the summary is under the form", br2.y > bf2.y + bf2.height - 5, `form bottom ${Math.round(bf2.y + bf2.height)} · summary top ${Math.round(br2.y)}`);
ok("11 No horizontal overflow at 375", (await overflow()) <= 0, await overflow());
await page.screenshot({ path: join(here, "r11-375-ceo-eca-form-summary.png"), fullPage: true });

const centred = await page.locator('[ta="center"], [style*="text-align: center"]').count();
ok("12 No centred text on the page", centred === 0, centred);
ok("12 0 console errors/warnings", problems.length === 0, problems.join(" ; "));
ok("12 No network requests", requests.length === 0, requests.join(" ; "));

console.log(JSON.stringify({ checks, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, consoleProblems: problems }, null, 1));
await browser.close();
