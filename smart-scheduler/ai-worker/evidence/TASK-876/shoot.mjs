// TASK-876 evidence (Flash): the Payment card + method select in ISOLATION, outside the repo (Sector: the three shared lines wait).
// A scratch bundle (bun build of partials/Payments/* + the dev FAKE, USE_FAKE_PAYMENTS=true for this run only) is served from OUT.
// Proves layout/render/form behaviour against the fake. Does NOT prove the real API, nor the sale form / PlanModal wiring (not built yet).
// Run: OUT=<scratch>/out PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot.mjs
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
for (const [w, h] of [[1280, 900], [768, 1024], [375, 812]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const shot = (n) => page.screenshot({ path: join(here, `${w}-${n}.png`), fullPage: true });
  const hscroll = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const run = { width: w, hscroll: {} };

  await page.goto(`${BASE}/?state=withRows`);
  await page.getByText("Course Fee").waitFor();
  run.hscroll.card = await hscroll();
  run.cardText = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 300);
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.waitForTimeout(600); // Mantine's modal fades in; shoot it settled
  await shot("2-card-edit-open");
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

  // an installment added (row 3, Cash, 1,000 ฿)
  await page.getByRole("button", { name: "Add an installment" }).click();
  await page.getByRole("dialog").getByLabel("Amount").fill("1000");
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByText("1,000", { exact: false }).first().waitFor();
  run.installmentRows = await page.locator("tbody tr").count();
  await shot("3-installment-added");

  await page.goto(`${BASE}/?state=noRow`);
  await page.getByText("Transfer (default)").waitFor();
  run.noRow = { edit: await page.getByRole("button", { name: "Edit", exact: true }).count(), add: await page.getByRole("button", { name: "Add an installment" }).count(), paid: await page.getByText("Paid", { exact: true }).count() };
  run.hscroll.noRow = await hscroll();
  await shot("4-no-payment-row");

  await page.goto(`${BASE}/?state=failing`);
  await page.getByRole("button", { name: "Retry" }).waitFor();
  run.errorText = (await page.getByRole("alert").first().innerText()).replace(/\s+/g, " ");
  await shot("5-error-retry");

  await page.goto(`${BASE}/?state=slow`);
  await page.getByRole("status").waitFor();
  await shot("6-loading");

  await page.goto(`${BASE}/?demo=select`);
  await page.getByRole("combobox", { name: "Payment Method" }).waitFor();
  run.selectValue = await page.getByRole("combobox", { name: "Payment Method" }).inputValue();
  await shot("1-sale-method-select-cash");
  out.runs.push(run);
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
