// Harness (Tanya, 2026-09-23): TEST-006 probe 2 — expand MY admin row on SIT and dump what the
// expansion contains (full idea text? steps drawer trigger?). Run: QA_ADMIN_PW=.. node <file>
import { pathToFileURL } from "node:url";
const ORIGIN = "https://possibility.develyst.online";
const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
const page = await ctx.newPage();
await page.request.post(`${ORIGIN}/api/v1/auth/login`, { data: { email: "qa-tanya-pw1@example.com", password: process.env.QA_ADMIN_PW } });
await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
const row = page.locator("tr", { hasText: "qa-tanya-hire1@" }).first();
await row.locator(".ant-table-row-expand-icon").click();
await page.waitForTimeout(600);
const dump = await page.evaluate(() => {
  const expanded = document.querySelector(".ant-table-expanded-row, tr.ant-table-expanded-row");
  return {
    expandedText: expanded?.innerText ?? null,
    buttons: [...document.querySelectorAll(".ant-table-expanded-row button, .ant-table-expanded-row a")].map((b) => ({ tag: b.tagName, text: b.innerText.trim().slice(0, 60) })),
  };
});
console.log(JSON.stringify(dump, null, 1));
await page.screenshot({ path: "H:/ai-agent-workplace/ai-agent-workspace/possibility/project-docs/qa-2026-09-23/test-006-admin-th-expanded.png", fullPage: true });

// steps drawer trigger, wherever it is now
const stepsBtn = page.locator("button, a", { hasText: /ขั้นตอน|AI วิเคราะห์|steps/i }).first();
console.log("steps trigger count:", await stepsBtn.count());
if (await stepsBtn.count()) {
  await stepsBtn.click();
  await page.waitForTimeout(900);
  const drawer = await page.evaluate(() => document.querySelector(".ant-drawer")?.innerText ?? null);
  console.log("drawer:", JSON.stringify(drawer));
  await page.screenshot({ path: "H:/ai-agent-workplace/ai-agent-workspace/possibility/project-docs/qa-2026-09-23/test-006-admin-th-steps-drawer.png" });
}
await browser.close();
