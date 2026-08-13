/** QA probe — read-only: how does the DAY view render sessions vs the WEEK view? */
import { openSidSession, api } from "./sid-session.mjs";
const OUT = process.env.OUT_DIR ?? ".";
const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1600, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);

const today = new Date().toISOString().slice(0, 10);
const rows = (await A("GET", `/bookings?from=${today}&to=${today}&limit=50`)).json?.items ?? [];
console.log("API bookings for", today, "→", JSON.stringify(rows.map((b) => ({ t: b.startTime, s: b.status, who: b.student?.nickname ?? b.student?.name, teacher: b.teacher?.nickname }))));

await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3500);

const dump = async (label) => {
  const info = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map((b) => b.innerText.trim().replace(/\n/g, " | ")).filter(Boolean);
    return {
      headerDate: document.querySelector("input[value*='20']")?.value ?? null,
      nonEmptyCells: btns.filter((t) => t && t !== "+" && t.length > 1).slice(0, 25),
      totalButtons: btns.length,
      plusCells: btns.filter((t) => t === "+").length,
    };
  });
  console.log(`\n--- ${label} ---\n` + JSON.stringify(info, null, 1));
  await page.screenshot({ path: `${OUT}/probe-${label}.png` });
};

await dump("week-view");
await page.getByText(/^daily$/i).first().click();
await page.waitForTimeout(3000);
await dump("day-view");

await browser.close();
