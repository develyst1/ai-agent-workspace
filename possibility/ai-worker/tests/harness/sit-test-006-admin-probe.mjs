// Harness (Tanya, 2026-09-23): TEST-006 probe — dump the admin page DOM structure on SIT
// (row HTML for my seeded row, all buttons/links/switches, drawer triggers) so the admin-suite
// assertions match what the build actually renders. Run: QA_ADMIN_PW=.. node <file>
import { pathToFileURL } from "node:url";
const ORIGIN = "https://possibility.develyst.online";
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
const page = await ctx.newPage();
await page.request.post(`${ORIGIN}/api/v1/auth/login`, { data: { email: "qa-tanya-pw1@example.com", password: process.env.QA_ADMIN_PW } });
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const dump = await page.evaluate(() => {
  const row = [...document.querySelectorAll("tr")].find((r) => r.innerText.includes("qa-tanya-hire1@"));
  return {
    tableHeaders: [...document.querySelectorAll("th")].map((t) => t.innerText.trim()),
    rowHtml: row?.outerHTML ?? null,
    buttons: [...document.querySelectorAll("button")].map((b) => ({ text: b.innerText.trim().slice(0, 40), cls: b.className.slice(0, 60), role: b.getAttribute("role") })),
    links: [...document.querySelectorAll("a")].map((a) => ({ text: a.innerText.trim().slice(0, 40), href: a.getAttribute("href") })),
    switches: [...document.querySelectorAll("[role=switch], .ant-switch")].map((s) => s.outerHTML.slice(0, 120)),
    typography: [...document.querySelectorAll(".ant-typography")].slice(0, 10).map((t) => t.innerText.slice(0, 60)),
  };
});
console.log(JSON.stringify(dump, null, 1));
await browser.close();
