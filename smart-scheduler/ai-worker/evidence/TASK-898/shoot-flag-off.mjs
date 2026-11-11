// TASK-898 FLAG-OFF evidence (Flash): the same REAL components and mock services as shoot.mjs, built with BRANCH_LIVE = false (the gate off).
// Proves the four places show NO Branch field, label or read-only line, in either width. Run: OUT=<scratch>/out5 PW_PATH=... node shoot-flag-off.mjs
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
  const shot = (n) => page.screenshot({ path: join(here, `off-${w}-${n}.png`), fullPage: true });
  const branchWords = async () => (await page.getByText(/^Branch$|^สาขา$/).count()) + (await page.locator("[data-course-branch], [data-branch-line]").count());
  const run = { width: w };

  await page.goto(`${BASE}/?demo=create`);
  await page.getByText("Single").or(page.getByText("Voucher")).first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  run.create = await branchWords();
  await shot("1-create-booking");

  await page.goto(`${BASE}/?demo=sale`);
  await page.getByText("Student", { exact: false }).first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  run.sale = await branchWords();
  await shot("2-course-sale");

  await page.goto(`${BASE}/?demo=voucher`);
  await page.getByText("Student", { exact: false }).first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  run.voucher = await branchWords();
  await shot("3-voucher-sale");

  await page.goto(`${BASE}/?demo=detail`);
  await page.getByRole("button", { name: /More actions/ }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: /More actions/ }).click();
  await page.getByRole("menuitem", { name: "Move session" }).click();
  await page.getByRole("button", { name: "Back" }).waitFor({ timeout: 20000 }); // the move form's own Back button
  await page.waitForTimeout(500);
  run.move = await branchWords();
  await shot("4-move-session");

  let planId = null;
  for (const id of ["c2", "c3", "c1"]) {
    await page.goto(`${BASE}/?demo=plan&id=${id}`);
    if (await page.getByRole("button", { name: /Change/ }).first().waitFor({ timeout: 7000 }).then(() => true, () => false)) { planId = id; break; }
  }
  run.plan = { changeTeacherVisible: planId !== null, branchThings: await branchWords() };
  await shot("5-plan");

  run.pageErrors = errors;
  out.runs.push(run);
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
