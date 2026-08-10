/** QA probe — read-only: what does the Teachers page look like, and where is the ⋯ menu? */
import { openSidSession } from "./sid-session.mjs";
const { browser, page, origin } = await openSidSession({ viewport: { width: 1600, height: 1000 } });
await page.goto(`${origin}/scheduler/teachers`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("[class*='Card'], tr")].slice(0, 60);
  const first = cards.find((c) => /FREELANCE|FULL|PART/i.test(c.innerText) && c.querySelectorAll("button").length);
  return {
    placeholders: [...document.querySelectorAll("input")].map((i) => i.placeholder).filter(Boolean),
    sampleCardClass: first?.className?.toString().slice(0, 80),
    sampleCardText: first?.innerText.slice(0, 200),
    buttonLabels: [...document.querySelectorAll("button")].slice(0, 25).map((b) => (b.innerText.trim() || b.getAttribute("aria-label") || b.className.toString().slice(0, 30)).slice(0, 40)),
  };
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: `${process.env.OUT_DIR ?? "."}/sid-teachers-page.png`, fullPage: false });
await browser.close();
