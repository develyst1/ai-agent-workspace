// TASK-937 REWORK evidence (Flash): the toasts are English. Triggers 6 toasts in the BUILT final-ui as CEO, prints each text, checks it has no Thai letter, and shoots 3.
// Run: DIST=<dist/index.html> PW_PATH=... node toasts-english.mjs
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const BASE = pathToFileURL(process.env.DIST).href;
const THAI = /[ก-ฺเ-๎]/;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
page.on("pageerror", (e) => problems.push(`pageerror: ${String(e).slice(0, 160)}`));
await page.goto(`${BASE}#/`);
await page.getByText("BACK OFFICE").first().waitFor({ timeout: 20000 });
await page.getByText("CEO", { exact: true }).first().click();
const out = [];
const last = async (label, shot) => {
  await page.waitForTimeout(350);
  const t = (await page.locator(".mantine-Notification-description").last().innerText()).trim();
  out.push({ label, text: t, thai: THAI.test(t) });
  if (shot) await page.screenshot({ path: join(here, `toast-${shot}.png`) });
};
const go = (h) => page.goto(`${BASE}#/${h}`);

// Demo: no reason, then move
await go("stock/demo");
await page.getByRole("button", { name: "Move A → B" }).click();
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
await last("Demo: move without a reason");
await page.getByRole("dialog").getByPlaceholder("Why?").fill("Lesson at STA");
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
await last("Demo: moved", "demo-moved");
await page.getByRole("button", { name: "More" }).click();
await page.getByRole("menuitem", { name: "Add Location" }).click();
await page.getByRole("dialog").getByLabel("Location").fill("ISB");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await last("Demo: location added");

// Low Stock save
await go("stock/low-stock");
await page.getByLabel("Alert (Unit) of F&B").fill("6");
await page.getByRole("button", { name: "Save" }).click();
await last("Low Stock: saved");

// ECA save
await go("revenue/eca-term");
await page.getByRole("combobox", { name: "School" }).click();
await page.getByRole("option", { name: "STA", exact: true }).click();
await page.getByLabel("Term", { exact: true }).fill("Term 3");
await page.getByLabel("Price per class").fill("400");
await page.getByLabel("Student").fill("18");
await page.getByLabel("Class / Term").fill("5");
await page.getByRole("button", { name: "Save" }).click();
await last("ECA: saved", "eca-saved");

// Refund save
await go("revenue/refund");
await page.getByPlaceholder("Search by student name").click();
await page.getByRole("option", { name: /น้องข้าวหอม/ }).first().click();
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await last("Refund: saved", "refund-saved");

// Add Manually, Categories, Summary filter, Detail filter, Student CSV
await go("revenue/manual");
await page.getByRole("combobox", { name: "Type" }).click();
await page.getByRole("option", { name: "OTHER", exact: true }).click();
await page.getByRole("combobox", { name: "Category" }).click();
await page.getByRole("option", { name: "Shirt", exact: true }).click();
await page.getByLabel("Amount").fill("500");
await page.getByRole("button", { name: "Save" }).click();
await last("Add Manually: saved");
await go("revenue/summary");
await page.getByRole("button", { name: "Apply filters" }).click();
await last("Summary: filtered");
await go("revenue/lines");
await page.getByRole("button", { name: "Apply filters" }).click();
await last("Detail: filtered");
await go("revenue/categories");
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.getByLabel("New category").fill("Roller derby");
await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
await last("Categories: added");
await go("proposed/payment-setting");
await page.getByRole("button", { name: "Edit" }).click();
await page.getByRole("button", { name: "Save" }).click();
await last("Proposed 1: saved");
await go("proposed/move-course");
await page.locator("[data-course-card='k1']").getByRole("button", { name: /Move course to branch/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Move", exact: true }).click();
await last("Proposed 5: moved");
await go("proposed/conversion");
await page.getByRole("button", { name: "Reset" }).click();
await last("Proposed 2: reset");
await go("reports/home");
await page.getByRole("tab", { name: "STUDENT", exact: true }).click();
await page.locator("[data-student-table]").waitFor();
await page.getByRole("button", { name: "Export CSV" }).click();
await last("Students: CSV");
console.log(JSON.stringify({ toasts: out, anyThai: out.some((o) => o.thai), consoleProblems: problems }, null, 1));
await browser.close();
