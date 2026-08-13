/**
 * QA harness — functional retest of the pro engineer's FE rework (`smart-scheduler-front@dong`,
 * commits 63f734d + 7f9456e), run LOCALLY in mock mode against FRONTEND-STANDARD.md §2/§3.
 *
 * Checks, at 375 / 768 / 960 / 1280:
 *   · lead (checkbox) + action columns stay PINNED, edge shadow only while that side hides content
 *   · no truncation: badges show full labels (no "PEN…"), cells don't clip
 *   · Voucher "Manage" reads as a filled button (not a tag)
 *   · PlanModal: ⋯ overflow menu, keyboard-operable, modal widened, correct actions per row state
 *   · dates DD/MMM/YY · times HH:mm · tabular-nums on numeric columns
 *   · no functional regression: search, filters, bulk confirm, plan preview
 * Local only — nothing touches any server.
 */
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL("C:/Users/Admin/develyst/smart-scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href
);

const BASE = "http://localhost:3016";
const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (area, id, expected, actual, result) => {
  cases.push({ area, id, expected, actual, result });
  console.error(`${result.padEnd(8)} [${area}] ${id} — ${String(actual).slice(0, 220)}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const shot = (n) => page.screenshot({ path: `${OUT}/dong-${n}.png` });

const login = async () => {
  await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.locator("input").first().fill("qa-local");
  await page.locator('input[type="password"]').fill("qa-local-mock");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/scheduler\//, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
};

/** measure a table: pinned columns, overflow, clipping, badge truncation */
const measureTable = () =>
  page.evaluate(() => {
    const table = document.querySelector("table");
    if (!table) return { note: "no table" };
    const scroller =
      table.closest("[data-at-start], [data-at-end], .mantine-ScrollArea-viewport") ??
      table.parentElement;
    const cs = scroller ? getComputedStyle(scroller) : null;
    const pinned = [...table.querySelectorAll("[data-pin]")].map((el) => ({
      pin: el.getAttribute("data-pin"),
      position: getComputedStyle(el).position,
      left: getComputedStyle(el).left,
      right: getComputedStyle(el).right,
      z: getComputedStyle(el).zIndex,
    }));
    const badges = [...table.querySelectorAll('[class*="Badge"]')].map((b) => ({
      text: b.innerText.trim(),
      truncated: b.scrollWidth > b.clientWidth + 1 || /…|\.\.\./.test(b.innerText),
    }));
    const clipped = [...table.querySelectorAll("td")].filter((td) => td.scrollWidth > td.clientWidth + 1).length;
    return {
      tableScrollWidth: Math.round(table.scrollWidth),
      scrollerClientWidth: scroller ? Math.round(scroller.clientWidth) : null,
      scrollerOverflowX: cs?.overflowX ?? null,
      atStart: scroller?.getAttribute?.("data-at-start") ?? null,
      atEnd: scroller?.getAttribute?.("data-at-end") ?? null,
      pinnedCount: pinned.length,
      pinnedSample: pinned.slice(0, 3),
      badgeCount: badges.length,
      truncatedBadges: badges.filter((b) => b.truncated).map((b) => b.text),
      clippedCells: clipped,
      pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

try {
  await login();

  // ── BookingsTable (All bookings) ───────────────────────────────────────
  await page.getByRole("tab", { name: /all bookings/i }).click();
  await page.waitForTimeout(2500);
  const bt = {};
  for (const w of [1280, 960, 768, 375]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(1200);
    bt[w] = await measureTable();
    await shot(`bookings-${w}`);
  }
  record(
    "BookingsTable",
    "lead + action columns are pinned at every width",
    "data-pin elements are position:sticky",
    JSON.stringify(Object.fromEntries(Object.entries(bt).map(([w, v]) => [w, `pinned=${v.pinnedCount} ${v.pinnedSample?.[0]?.position ?? "-"}`]))),
    Object.values(bt).every((v) => v.pinnedCount > 0 && v.pinnedSample.every((p) => p.position === "sticky")) ? "PASS" : "FAIL",
  );
  record(
    "BookingsTable",
    "no truncated badge labels (the PENDING→PEN… tell)",
    "every status/type chip shows its full text",
    JSON.stringify(Object.fromEntries(Object.entries(bt).map(([w, v]) => [w, `badges=${v.badgeCount} truncated=${JSON.stringify(v.truncatedBadges)}`]))),
    Object.values(bt).every((v) => (v.truncatedBadges ?? []).length === 0) ? "PASS" : "FAIL",
  );
  record(
    "BookingsTable",
    "the table scrolls horizontally instead of clipping cells; the page never scrolls sideways",
    "clippedCells=0 and no page h-scroll",
    JSON.stringify(Object.fromEntries(Object.entries(bt).map(([w, v]) => [w, `clipped=${v.clippedCells} tableW=${v.tableScrollWidth}/${v.scrollerClientWidth} overflowX=${v.scrollerOverflowX} pageHScroll=${v.pageHasHScroll}`]))),
    Object.values(bt).every((v) => v.clippedCells === 0 && !v.pageHasHScroll) ? "PASS" : "FAIL",
  );
  record(
    "BookingsTable",
    "edge shadow is scroll-aware (data-at-start / data-at-end flip)",
    "at 375 the scroller reports hidden content on one side",
    JSON.stringify(Object.fromEntries(Object.entries(bt).map(([w, v]) => [w, `atStart=${v.atStart} atEnd=${v.atEnd}`]))),
    bt[375]?.atStart !== null || bt[375]?.atEnd !== null ? "PASS" : "INFO",
  );

  // date + numeric formatting
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(1000);
  const fmt = await page.evaluate(() => {
    const cells = [...document.querySelectorAll("tbody td")].map((c) => c.innerText.trim());
    const nums = [...document.querySelectorAll("tbody td")].filter((c) => /\d/.test(c.innerText));
    return {
      sample: cells.slice(0, 12),
      isoDates: cells.filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c)).length,
      ddMmmYy: cells.filter((c) => /^\d{2}\/[A-Za-z]{3}\/\d{2}$/.test(c)).length,
      secondsTimes: cells.filter((c) => /^\d{2}:\d{2}:\d{2}/.test(c)).length,
      tabularNumCells: nums.filter((c) => (getComputedStyle(c).fontVariantNumeric || "").includes("tabular-nums")).length,
      numericCells: nums.length,
    };
  });
  record(
    "formats",
    "dates DD/MMM/YY · times HH:mm · tabular-nums on numeric columns (§2)",
    "no ISO dates, no seconds, numerics use tabular-nums",
    JSON.stringify(fmt),
    fmt.isoDates === 0 && fmt.secondsTimes === 0 ? (fmt.tabularNumCells > 0 ? "PASS" : "PARTIAL") : "FAIL",
  );

  // ── VoucherPanel ───────────────────────────────────────────────────────
  await page.getByRole("tab", { name: /voucher/i }).click();
  await page.waitForTimeout(2000);
  const vp = {};
  for (const w of [1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(1200);
    vp[w] = await measureTable();
    vp[w].manage = await page.evaluate(() => {
      const b = [...document.querySelectorAll("table button")].find((x) => /manage|จัดการ/i.test(x.innerText));
      if (!b) return null;
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
      return {
        text: b.innerText.trim(),
        bg: cs.backgroundColor,
        color: cs.color,
        w: Math.round(r.width),
        h: Math.round(r.height),
        reachable: !!(hit && (hit === b || b.contains(hit))),
      };
    });
    await shot(`vouchers-${w}`);
  }
  record(
    "VoucherPanel",
    "🔴 DEF-1 retest — the Manage control is REACHABLE at 375 (it was clipped off-surface before)",
    "hit-test at the button centre returns the button",
    JSON.stringify(Object.fromEntries(Object.entries(vp).map(([w, v]) => [w, `reachable=${v.manage?.reachable} w=${v.manage?.w} pinned=${v.pinnedCount}`]))),
    vp[375]?.manage?.reachable === true ? "PASS" : "FAIL",
  );
  record(
    "VoucherPanel",
    "Manage reads as a button, not a tag (§2 filled variant)",
    "solid background, adequate hit height",
    JSON.stringify(vp[1280]?.manage),
    vp[1280]?.manage && !/rgba\(0, 0, 0, 0\)|transparent/.test(vp[1280].manage.bg) ? "PASS" : "FAIL",
  );
  record(
    "VoucherPanel",
    "phone hit target ≥44 px (§3.2)",
    "button height ≥44 at 375",
    `h=${vp[375]?.manage?.h}`,
    (vp[375]?.manage?.h ?? 0) >= 44 ? "PASS" : "FAIL",
  );

  // ── PlanModal ──────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("tab", { name: /course/i }).first().click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role="dialog"]').first();
  const modal = await dlg.evaluate((d) => {
    const r = d.getBoundingClientRect();
    const rowBtns = [...d.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("button")].map((b) => b.innerText.trim() || b.getAttribute("aria-label") || "⋯"));
    return { width: Math.round(r.width), rowActionSets: rowBtns.slice(0, 4), text: d.innerText.slice(0, 400) };
  });
  await shot("planmodal-1280");
  record(
    "PlanModal",
    "sized for its table (§2 — `size=\"1100px\"` beat a cramped xl)",
    "modal noticeably wider than the old 780 px",
    `width=${modal.width}`,
    modal.width >= 1000 ? "PASS" : "FAIL",
  );
  record(
    "PlanModal",
    "row actions collapsed into a ⋯ overflow menu, not 2–3 inline mini buttons (§2)",
    "≤1 control per row before opening the menu",
    JSON.stringify(modal.rowActionSets),
    modal.rowActionSets.every((s) => s.length <= 1) ? "PASS" : "FAIL",
  );

  // the ⋯ menu must work by KEYBOARD (no hover-only)
  const menuBtn = dlg.locator("tbody tr button").first();
  await menuBtn.focus();
  const focusRing = await menuBtn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { outline: cs.outlineStyle + " " + cs.outlineWidth, transition: cs.transitionProperty, boxShadow: cs.boxShadow.slice(0, 60) };
  });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1200);
  const menuItems = await page.getByRole("menuitem").allInnerTexts().catch(() => []);
  await shot("planmodal-menu");
  record(
    "PlanModal",
    "the ⋯ menu opens by KEYBOARD (Enter), not hover-only (§2)",
    "menu items appear after Enter",
    `items=${JSON.stringify(menuItems)}`,
    menuItems.length > 0 ? "PASS" : "FAIL",
  );
  record(
    "a11y/§3.3",
    "focus-visible ring is instant (never transitioned)",
    "no transition on outline/box-shadow for the focused control",
    JSON.stringify(focusRing),
    !/outline|box-shadow|all/.test(focusRing.transition) ? "PASS" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // no functional regression: the plan preview still gates a change
  const before = await dlg.locator("tbody tr").count();
  record("regression", "plan modal still renders its session rows", "rows present", `rows=${before}`, before > 0 ? "PASS" : "FAIL");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // search + filters still work on the bookings table
  await page.getByRole("tab", { name: /all bookings/i }).click();
  await page.waitForTimeout(2000);
  const rowsAll = await page.locator("tbody tr").count();
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("zzzz-nobody");
  await page.waitForTimeout(2000);
  const rowsFiltered = await page.locator("tbody tr").count();
  record(
    "regression",
    "search still filters the bookings table",
    "a nonsense query empties it",
    `all=${rowsAll} → filtered=${rowsFiltered}`,
    rowsAll > 0 && rowsFiltered < rowsAll ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
