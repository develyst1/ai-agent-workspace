// TASK-876 REAL-API, READ-ONLY run (Flash, 2026-11-09). The repo's real PaymentCard / PlanModal + REAL services (no fake) in a scratch bundle,
// PAYMENTS_LIVE=true for this run only, talking through a GET-ONLY proxy (anything else is refused 405) to a LOCAL SB on :4306
// (SKIP_AUTH=true, LINE tokens empty, DATABASE_URL host = sid, checked). Ids are passed as args; no names are printed or screenshotted
// (the plan-modal check is by text only: its header carries a student's name).
// Run: OUT=<scratch>/out3 NO_ROW=<course id> NO_FEE=<course id> PW_PATH=... node shoot-real.mjs
import http from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(pathToFileURL(process.env.PW_PATH).href);
const OUT = process.env.OUT, SB = "http://localhost:4306";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const seen = [];
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname.startsWith("/api/")) {
    seen.push(`${req.method} ${u.pathname}`);
    if (req.method !== "GET") { res.writeHead(405); res.end("read-only proxy"); return; }
    try { const r = await fetch(SB + u.pathname + u.search); res.writeHead(r.status, { "content-type": r.headers.get("content-type") ?? "application/json" }); res.end(Buffer.from(await r.arrayBuffer())); }
    catch { res.writeHead(502); res.end(); }
    return;
  }
  try { const body = await readFile(join(OUT, u.pathname === "/" ? "index.html" : u.pathname)); res.writeHead(200, { "content-type": types[extname(u.pathname)] ?? "text/html" }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
const out = {};
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");

// 1 older sale, fee but no payment row: "Transfer (default)", no Edit, no Add, no Paid
await page.goto(`${BASE}/?demo=card&id=${process.env.NO_ROW}`);
await page.getByText("Transfer (default)").waitFor({ timeout: 20000 });
out.noRow = { text: (await text()).slice(0, 200), edit: await page.getByRole("button", { name: "Edit", exact: true }).count(), add: await page.getByRole("button", { name: "Add an installment" }).count(), paid: await page.getByText("Paid", { exact: true }).count() };
await page.screenshot({ path: join(here, "real-1280-1-no-payment-row.png"), fullPage: true });

// 1b the same in Thai
await page.goto(`${BASE}/?demo=card&id=${process.env.NO_ROW}&lang=th`);
await page.getByText("โอนเงิน (ค่าเริ่มต้น)").waitFor({ timeout: 20000 });
await page.screenshot({ path: join(here, "real-1280-1b-no-payment-row-th.png"), fullPage: true });
await page.evaluate(() => window.localStorage.removeItem("ss.lang"));

// 2 a sale with no fee on record
await page.goto(`${BASE}/?demo=card&id=${process.env.NO_FEE}`);
await page.getByText("Transfer (default)").waitFor({ timeout: 20000 });
out.noFee = { text: (await text()).slice(0, 200), add: await page.getByRole("button", { name: "Add an installment" }).count() };
await page.screenshot({ path: join(here, "real-1280-2-no-fee.png"), fullPage: true });

// 3 inside the real PlanModal (by text only; the header has a student's name)
await page.goto(`${BASE}/?demo=plan&id=${process.env.NO_ROW}`);
await page.getByText("Transfer (default)").waitFor({ timeout: 25000 });
out.planModal = { hasPaymentHeading: (await page.getByText("Payment", { exact: true }).count()) > 0, hasTransferDefault: (await page.getByText("Transfer (default)").count()) > 0 };

out.apiRequests = [...new Set(seen)];
out.nonGet = seen.filter((s) => !s.startsWith("GET "));
out.pageErrors = errors;
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 2));
