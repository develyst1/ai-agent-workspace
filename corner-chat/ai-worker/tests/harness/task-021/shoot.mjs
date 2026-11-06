// Throwaway (TASK-021): the LINE-count month picker shows the Thai month + Buddhist year; the API still gets YYYY-MM.
// Read-only against the running back end on :8080 (sign-in + GET /admin/stats/line-pushes), front on :3000, 1280 px.
// usage: node shoot.mjs <playwright-core/index.mjs> <corner-chat-back/.env>   — the owner login is read from that file, never printed.
import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const env = Object.fromEntries(
  readFileSync(process.argv[3], "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const here = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const ok = [];
const check = (name, pass, detail = "") => { ok.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name} ${detail}`); };

const browser = await chromium.launch({ channel: "chrome" });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const calls = [];
page.on("request", (r) => { if (r.url().includes("/admin/stats/line-pushes")) calls.push(new URL(r.url()).search || "(no query)"); });

await page.goto(`${BASE}/login`);
await page.getByLabel("อีเมล").fill(env.OWNER_EMAIL);
await page.getByLabel("รหัสผ่าน").fill(env.OWNER_PASSWORD);
await page.keyboard.press("Enter");
await page.waitForURL("**/users");

const card = page.locator(".ant-card").first();
const picker = page.locator(".ant-picker input");
await page.getByText(/ข้อความ LINE ที่ส่งในเดือน \S+ \d{4}/).waitFor();
await page.waitForTimeout(600);
const title0 = (await card.innerText()).split("\n")[0];
const month0 = title0.replace("ข้อความ LINE ที่ส่งในเดือน ", "");
const shown0 = await picker.inputValue();
check("title and picker read the same Thai month + Buddhist year", shown0 === month0 && /^\S+ 25\d\d$/.test(shown0), `title="${month0}" picker="${shown0}"`);
await page.screenshot({ path: join(here, "01-picker-thai.png") });

await picker.click();
const gridHeader = await page.locator(".ant-picker-header-view").first().innerText();
await page.locator(".ant-picker-cell").nth(9).click(); // October
await page.getByText("ข้อความ LINE ที่ส่งในเดือน ตุลาคม 2569").waitFor();
await page.waitForTimeout(600);
const shown1 = await picker.inputValue();
check("pick October → picker shows ตุลาคม 2569", shown1 === "ตุลาคม 2569", `picker="${shown1}"`);
check("pick October → the API call is month=2026-10 (Gregorian YYYY-MM)", calls.includes("?month=2026-10"), `calls=${JSON.stringify(calls)}`);
await page.screenshot({ path: join(here, "02-picker-october.png") });

// what the open grid shows (the TASK says: write down what the grid would need)
await picker.click();
const gridCells = (await page.locator(".ant-picker-cell-inner").allInnerTexts()).slice(0, 12).join(" · ");
console.log(`grid header (year panel): "${gridHeader}" · cells: ${gridCells}`);
await page.screenshot({ path: join(here, "03-picker-grid-open.png") });

await browser.close();
console.log(ok.every(Boolean) ? "ALL PASS" : "SOME FAILED");
process.exit(ok.every(Boolean) ? 0 : 1);
