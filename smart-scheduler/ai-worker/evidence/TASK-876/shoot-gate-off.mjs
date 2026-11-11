// TASK-876 SHIP-GATE evidence (Flash): with PAYMENTS_LIVE=false and USE_FAKE_PAYMENTS=false (the tree as committed to deploy), the REAL
// CreatePlanFlow and PlanModal show NO payment UI and make NO /payments request. Same scratch-bundle setup as shoot-app.mjs.
// Run: OUT=<scratch>/out2 PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot-gate-off.mjs
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
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const requests = [];
page.on("request", (r) => /payments/i.test(r.url()) && requests.push(r.url()));
const out = {};

await page.goto(`${BASE}/?demo=sale`);
const student = page.getByPlaceholder(/Search by name/);
await student.click();
await student.fill("น้อง");
await page.getByRole("option").first().click();
await page.getByRole("combobox", { name: /Teacher/ }).click();
await page.getByRole("option").nth(3).click();
await page.getByRole("combobox", { name: /Program/ }).click();
await page.getByRole("option", { name: "Bike", exact: true }).click();
await page.getByText("Amount payable").waitFor({ timeout: 15000 }); // the price + discount section are showing, i.e. `chosen` is set
await page.waitForTimeout(500);
out.sale = { paymentMethodLabels: await page.getByText("Payment Method").count(), formText: (await page.locator("label").allInnerTexts()).map((s) => s.trim()) };
await page.screenshot({ path: join(here, "gate-off-1-sale-form.png"), fullPage: true });

await page.goto(`${BASE}/?demo=plan`);
await page.getByText("Sun 08/Nov/26").first().waitFor({ timeout: 15000 });
await page.waitForTimeout(1500); // long enough for a request to have gone out, if one were going to
out.plan = { installmentHeadings: await page.getByText("Installment").count(), paymentWords: await page.getByText(/Payment|Course Fee|Remaining/).count() };
await page.screenshot({ path: join(here, "gate-off-2-plan-modal.png"), fullPage: true });

out.paymentsRequests = requests;
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
