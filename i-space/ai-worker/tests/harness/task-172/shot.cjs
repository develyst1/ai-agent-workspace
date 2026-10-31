// TASK-172 DoD 7 — throwaway: open the standalone server in headless Chrome, screenshot it,
// and record whether styles really applied. Run: node shot.cjs <url> <out.png>
// Playwright is taken from the blueprint-front checkout; nothing is written into that repo.
const path = require("path");
const REPO = process.env.BP_FRONT || "H:/ispace/blueprint-front";
const { chromium } = require(path.join(REPO, "node_modules", "playwright-core"));

(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const failed = [];
  page.on("response", (r) => { if (r.status() >= 400) failed.push(r.status() + " " + r.url()); });
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const facts = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return {
      title: document.title,
      stylesheets: document.styleSheets.length,
      bodyBg: cs.backgroundColor,
      bodyFont: cs.fontFamily.slice(0, 60),
      textLen: document.body.innerText.length,
    };
  });
  await page.screenshot({ path: out, fullPage: false });
  console.log(JSON.stringify({ status: res.status(), ...facts, failedResponses: failed }, null, 2));
  await browser.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
