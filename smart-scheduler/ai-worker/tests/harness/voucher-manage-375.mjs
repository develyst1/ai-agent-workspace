/**
 * QA harness #2 — confirm/deny the 375px clipping of the voucher table's new "Manage" column,
 * and measure the plan-modal session-table action row at all four widths.
 * Same local mock setup as plan-modal-widths.mjs.
 */
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const PW =
  process.env.PW_PATH ??
  "C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(PW).href);

const BASE = process.env.BASE ?? "http://localhost:3016";
const OUT_DIR = process.env.OUT_DIR ?? "./out";
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.locator("input").first().fill("qa-local");
await page.locator('input[type="password"]').fill("qa-local-mock");
await page.locator('button[type="submit"]').click();
await page.waitForURL(/\/scheduler\/bookings/, { timeout: 20000 });
await page.waitForLoadState("networkidle");

const out = { clipping: {}, modalActionRow: {}, clickAt375: null, navItems: [] };

// nav (REQ-026 sanity, local build only)
out.navItems = await page.locator("nav a, aside a").allInnerTexts().catch(() => []);

for (const w of [1600, 1280, 768, 375]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.getByRole("tab", { name: /voucher/i }).click();
  await page.waitForTimeout(700);
  out.clipping[w] = await page.evaluate(() => {
    const table = document.querySelector("table");
    const card = table.closest(".mantine-Card-root") ?? table.parentElement;
    const btn = [...document.querySelectorAll("table tbody button")].pop();
    const br = btn.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    // is the button's centre actually the top element at that point? (true clipping check)
    const cx = Math.round(br.x + br.width / 2);
    const cy = Math.round(br.y + br.height / 2);
    const hit = document.elementFromPoint(cx, cy);
    return {
      buttonRect: { x: Math.round(br.x), w: Math.round(br.width) },
      buttonRightEdge: Math.round(br.right),
      cardVisibleRight: Math.round(cr.right),
      cardClientWidth: Math.round(card.clientWidth),
      tableScrollWidth: Math.round(table.scrollWidth),
      cardOverflowX: getComputedStyle(card).overflowX,
      hitAtButtonCentre: hit ? hit.tagName + "." + (hit.className?.toString().slice(0, 40) ?? "") : null,
      buttonIsHitTarget: !!(hit && (hit === btn || btn.contains(hit))),
      pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: `${OUT_DIR}/voucher-table-${w}.png` });
}

// can a user actually click it at 375?
await page.setViewportSize({ width: 375, height: 900 });
await page.getByRole("tab", { name: /voucher/i }).click();
await page.waitForTimeout(700);
try {
  await page.locator("table tbody button").first().click({ timeout: 5000, trial: true });
  out.clickAt375 = "playwright trial-click SUCCEEDED (actionability passed)";
} catch (e) {
  out.clickAt375 = "playwright trial-click FAILED: " + String(e).split("\n")[0].slice(0, 200);
}

// plan-modal action row across the four widths (opened from a course card)
for (const w of [1600, 1280, 768, 375]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.getByRole("tab", { name: /course/i }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /manage/i }).first().click();
  await page.waitForTimeout(1000);
  const dialog = page.locator('[role="dialog"]').first();
  out.modalActionRow[w] = await dialog.evaluate((d) => {
    const scroller = d.querySelector(".mantine-Table-scrollContainer, [data-scroll-container], .mantine-ScrollArea-root");
    const table = d.querySelector("table");
    const firstRow = table?.querySelector("tbody tr");
    const actionCell = firstRow?.querySelector("td:last-child");
    const btns = actionCell ? [...actionCell.querySelectorAll("button")] : [];
    const dr = d.getBoundingClientRect();
    return {
      modalWidth: Math.round(dr.width),
      tableScrollWidth: table ? Math.round(table.scrollWidth) : null,
      scrollerClientWidth: scroller ? Math.round(scroller.clientWidth) : null,
      scrollerOverflowX: scroller ? getComputedStyle(scroller).overflowX : null,
      actionCellWidth: actionCell ? Math.round(actionCell.getBoundingClientRect().width) : null,
      buttons: btns.map((b) => ({ label: b.innerText.trim(), w: Math.round(b.getBoundingClientRect().width) })),
      actionRowWraps: btns.length > 1 ? btns[0].getBoundingClientRect().top !== btns[1].getBoundingClientRect().top : null,
    };
  });
  await page.screenshot({ path: `${OUT_DIR}/plan-modal-${w}.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}

console.log(JSON.stringify(out, null, 2));
await browser.close();
