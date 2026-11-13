// TASK-876 evidence (Flash): the REAL CreatePlanFlow (sale form) and PlanModal (course plan) with the new payment parts,
// outside the repo: a scratch bundle (bun build) of the repo's own components with the repo's MOCK services
// (NEXT_PUBLIC_USE_MOCK=true at build) + the payment FAKE (USE_FAKE_PAYMENTS=true for this run only), a fake client session
// seeding useMe (mock-mode LOGIN can't be used: the 7-day token rule fails closed on "mock-token").
// Proves render + control behaviour of the wired blocks. Does NOT prove the real API, nor a real sale/PATCH round trip.
// Run: OUT=<scratch>/out2 PW_PATH=<smart-scheduler-front>/node_modules/playwright/index.mjs node shoot-app.mjs
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
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  const shot = (n) => page.screenshot({ path: join(here, `app-${w}-${n}.png`), fullPage: true });
  const run = { width: w };

  // 1 the sale form: Student → Teacher → (Program) → the price appears → the Payment Method select → Cash
  await page.goto(`${BASE}/?demo=sale`);
  const student = page.getByPlaceholder(/Search by name/);
  await student.click();
  await student.fill("น้อง");
  await page.getByRole("option").first().click();
  // The 4th mock teacher teaches Bike / Skate, which the mock price card prices (the 1st teaches the unpriced Surfskate).
  await page.getByRole("combobox", { name: /Teacher/ }).click();
  await page.getByRole("option").nth(3).click();
  await page.getByRole("combobox", { name: /Program/ }).click();
  await page.getByRole("option", { name: "Bike", exact: true }).click();
  await page.getByRole("combobox", { name: "Payment Method" }).waitFor({ timeout: 15000 });
  run.defaultMethod = await page.getByRole("combobox", { name: "Payment Method" }).inputValue();
  await page.getByRole("combobox", { name: "Payment Method" }).click();
  await page.getByRole("option", { name: "Cash", exact: true }).click();
  run.chosenMethod = await page.getByRole("combobox", { name: "Payment Method" }).inputValue();
  run.methodOptions = null;
  await page.waitForTimeout(400);
  await shot("1-sale-form-cash-chosen");

  // 2 the plan modal of a saved course: the Payment card under the sessions
  await page.goto(`${BASE}/?demo=plan`);
  await page.getByText("Course Fee").waitFor({ timeout: 15000 });
  run.planCardText = (await page.locator("section[aria-label='Installment']").innerText()).replace(/\s+/g, " ").slice(0, 200);
  await page.getByText("Installment").first().scrollIntoViewIfNeeded();
  await shot("2-plan-modal-payment-card");

  // 3 the same card in Thai (the PM's words)
  await page.goto(`${BASE}/?demo=plan&lang=th`);
  await page.getByText("ค่าคอร์ส").waitFor({ timeout: 15000 });
  run.thaiCard = (await page.locator("section").filter({ hasText: "ค่าคอร์ส" }).first().innerText()).replace(/\s+/g, " ").slice(0, 160);
  await page.getByText("งวดชำระ").first().scrollIntoViewIfNeeded();
  await shot("3-plan-modal-payment-card-th");
  await page.evaluate(() => window.localStorage.removeItem("ss.lang"));

  run.pageErrors = errors;
  out.runs.push(run);
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
