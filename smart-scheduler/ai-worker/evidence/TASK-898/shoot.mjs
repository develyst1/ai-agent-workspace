// TASK-898 evidence (Flash): the Branch field in the four places, in the REAL components (CreatePlanFlow, CreateVoucherModal, BookingModal
// create + Move session, PlanModal), outside the repo: a scratch bun bundle with the repo's MOCK services (NEXT_PUBLIC_USE_MOCK=true at build)
// and BRANCH_LIVE=true for this run only (the tree ships it false). Proves render + control behaviour, Bravo by default, Other selectable.
// Does NOT prove the server stores it (TASK-889 half 2) and writes nothing anywhere. Run: OUT=<scratch>/out4 PW_PATH=... node shoot.mjs
import http from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const OUT = process.env.OUT;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = http.createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  try { const body = await readFile(join(OUT, p === "/" ? "index.html" : p)); res.writeHead(200, { "content-type": types[extname(p)] ?? "text/html" }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = { runs: [] };
for (const [w, h] of [[1280, 900], [375, 812]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  const shot = (n) => page.screenshot({ path: join(here, `${w}-${n}.png`), fullPage: true });
  const branchSelect = () => page.getByRole("combobox", { name: "Branch" });
  const run = { width: w };

  // 1 create booking (the calendar's Add form)
  await page.goto(`${BASE}/?demo=create`);
  await branchSelect().waitFor({ timeout: 20000 });
  run.create = { default: await branchSelect().inputValue() };
  await shot("1-create-booking");

  // 2 course sale
  await page.goto(`${BASE}/?demo=sale`);
  await branchSelect().waitFor({ timeout: 20000 });
  run.sale = { default: await branchSelect().inputValue() };
  await shot("2-course-sale");
  await branchSelect().click();
  await page.getByRole("option", { name: "Other", exact: true }).click();
  run.sale.afterPick = await branchSelect().inputValue();
  await page.waitForTimeout(300);
  await shot("2b-course-sale-other-chosen");

  // 3 voucher sale
  await page.goto(`${BASE}/?demo=voucher`);
  await branchSelect().waitFor({ timeout: 20000 });
  run.voucher = { default: await branchSelect().inputValue() };
  await shot("3-voucher-sale");

  // 4 Move session (this booking only)
  await page.goto(`${BASE}/?demo=detail`);
  // "Move session" is an item in the "More actions" menu (an icon button).
  await page.getByRole("button", { name: /More actions/ }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: /More actions/ }).click();
  await page.getByRole("menuitem", { name: "Move session" }).click();
  await branchSelect().waitFor({ timeout: 20000 });
  run.move = { default: await branchSelect().inputValue() };
  await shot("4-move-session");

  // 5 whole course next to Change teacher
  // The control sits beside Change teacher, which only a WRITABLE course offers: try the three mock courses until one does.
  let planId = null;
  for (const id of ["c2", "c3", "c1"]) {
    await page.goto(`${BASE}/?demo=plan&id=${id}`);
    if (await page.locator("[data-course-branch]").waitFor({ timeout: 7000 }).then(() => true, () => false)) { planId = id; break; }
  }
  const control = page.locator("[data-course-branch]");
  await control.waitFor({ timeout: 5000 });
  run.plan = { saveDisabledAtStart: await control.getByRole("button", { name: "Save" }).isDisabled(), changeTeacherButton: await page.getByRole("button", { name: /Change/ }).count() };
  await control.getByRole("combobox", { name: "Branch" }).click();
  await page.getByRole("option", { name: "Other", exact: true }).click();
  run.plan.saveEnabledAfterPick = !(await control.getByRole("button", { name: "Save" }).isDisabled());
  await control.scrollIntoViewIfNeeded();
  await shot("5-plan-whole-course");

  run.pageErrors = errors;
  out.runs.push(run);
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
