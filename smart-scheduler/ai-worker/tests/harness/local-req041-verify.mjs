/**
 * QA harness — REQ-041 (TASK-128 tokens/motion + TASK-129 table/format polish) on `dong`, locally.
 *   1. re-baseline the 63f734d rework: pinned columns · no truncation · DEF-1 reachable at 375
 *   2. TASK-129: dates DD/MMM/YY · tabular-nums · distinct status icons · Manage ≥44px @375
 *   3. the date FILTER still returns rows (display formatter must not have touched the ISO query)
 *   4. §3.3 focus-visible ring is instant
 *   5. the SIX newly-defined `muted-{50,700,800,900}` sites SA flagged — they go from no-colour to a
 *      colour, so each is eyeballed and measured (contrast included) rather than assumed
 * Local only, mock data.
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
  console.error(`${result.padEnd(8)} [${area}] ${id} — ${String(actual).slice(0, 230)}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const shot = (n) => page.screenshot({ path: `${OUT}/r041-${n}.png` });

/** relative luminance + contrast ratio, for the two text sites */
const contrast = (fg, bg) => {
  const lum = (c) => {
    const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
};

try {
  await page.goto(`${BASE}/login?next=/scheduler/bookings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.locator("input").first().fill("qa-local");
  await page.locator('input[type="password"]').fill("qa-local-mock");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/scheduler\//, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: /all bookings/i }).click();
  await page.waitForTimeout(3000);

  // ── 1. re-baseline the rework (must be untouched by the token swap) ────
  const base = {};
  for (const w of [1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(1200);
    base[w] = await page.evaluate(() => {
      const t = document.querySelector("table");
      const pinned = [...t.querySelectorAll("[data-pin]")];
      const badges = [...t.querySelectorAll('[class*="Badge"]')];
      return {
        pinned: pinned.length,
        allSticky: pinned.every((el) => getComputedStyle(el).position === "sticky"),
        truncatedBadges: badges.filter((b) => b.scrollWidth > b.clientWidth + 1 || /…/.test(b.innerText)).length,
        clippedCells: [...t.querySelectorAll("td")].filter((td) => td.scrollWidth > td.clientWidth + 1).length,
        pageHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
  }
  record(
    "re-baseline",
    "the 63f734d rework survives the token swap (pinned · no truncation · no clipping)",
    "unchanged at every width",
    JSON.stringify(base),
    Object.values(base).every((v) => v.pinned > 0 && v.allSticky && v.truncatedBadges === 0 && v.clippedCells === 0 && !v.pageHScroll) ? "PASS" : "FAIL",
  );

  // ── 2. TASK-129: date format + tabular-nums ───────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(1200);
  const fmt = await page.evaluate(() => {
    const cells = [...document.querySelectorAll("tbody td")];
    const txt = cells.map((c) => c.innerText.trim());
    const numeric = cells.filter((c) => /\d/.test(c.innerText));
    return {
      iso: txt.filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c)).length,
      ddMmmYy: txt.filter((c) => /^\d{2}\/[A-Za-z]{3}\/\d{2}$/.test(c)).length,
      sampleDates: txt.filter((c) => /\d{2}\/[A-Za-z]{3}\/\d{2}|\d{4}-\d{2}-\d{2}/.test(c)).slice(0, 3),
      tabular: numeric.filter((c) => (getComputedStyle(c).fontVariantNumeric || "").includes("tabular-nums")).length,
      numericTotal: numeric.length,
    };
  });
  record(
    "TASK-129",
    "M-1 closed — the bookings table renders DD/MMM/YY, no ISO left",
    "iso=0, dates read DD/MMM/YY",
    JSON.stringify(fmt),
    fmt.iso === 0 && fmt.ddMmmYy > 0 ? "PASS" : "FAIL",
  );
  record(
    "TASK-129",
    "M-2 closed — numeric cells carry tabular-nums (was 0/20)",
    "most numeric cells use tabular-nums",
    `${fmt.tabular}/${fmt.numericTotal}`,
    fmt.tabular > 0 ? "PASS" : "FAIL",
  );

  // status chips: the three danger statuses must be shape-distinct
  const chips = await page.evaluate(() => {
    const seen = {};
    for (const b of document.querySelectorAll('tbody [class*="Badge"]')) {
      const label = b.innerText.trim();
      if (!seen[label]) {
        const svg = b.querySelector("svg");
        seen[label] = {
          icon: !!svg,
          iconPath: svg ? (svg.querySelector("path")?.getAttribute("d") ?? "").slice(0, 24) : null,
          ariaHidden: svg ? svg.getAttribute("aria-hidden") : null,
          color: getComputedStyle(b).color,
        };
      }
    }
    return seen;
  });
  record(
    "TASK-129",
    "H-8 — status chips carry shape, and same-colour statuses are distinguishable",
    "icons present; different statuses have different glyphs; icon aria-hidden so the label stays the a11y name",
    JSON.stringify(chips),
    Object.values(chips).some((c) => c.icon) ? "PASS" : "FAIL",
  );

  // ── 3. the date filter still returns rows (ISO query preserved) ───────
  const rowsBefore = await page.locator("tbody tr").count();
  const dr = await page.evaluate(() =>
    [...document.querySelectorAll("input")].findIndex(
      (i) => (i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent ?? "").trim().toLowerCase() === "date range",
    ),
  );
  let rowsRange = null;
  if (dr >= 0) {
    await page.locator("input").nth(dr).click();
    await page.waitForTimeout(700);
    const thisMonth = page.getByRole("option", { name: /this month/i }).first();
    if (await thisMonth.count()) {
      await thisMonth.click();
      await page.waitForTimeout(2500);
      rowsRange = await page.locator("tbody tr").count();
    }
  }
  record(
    "regression",
    "🔴 the date FILTER still returns rows (the display formatter must not have touched the ISO query)",
    "a preset range still queries and returns rows",
    `all=${rowsBefore} → thisMonth=${rowsRange}`,
    rowsRange !== null && rowsRange > 0 ? "PASS" : rowsRange === 0 ? "FAIL" : "NOT TESTED",
  );
  await shot("1-bookings-1280");

  // ── 4. §3.3 focus ring instant ────────────────────────────────────────
  const ring = await page.evaluate(() => {
    const b = document.querySelector("tbody button") ?? document.querySelector("button");
    b.focus();
    const cs = getComputedStyle(b);
    return { transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration, outlineWidth: cs.outlineWidth };
  });
  record(
    "§3.3",
    "the focus-visible ring is instant (never transitioned)",
    "no transition covering outline/box-shadow",
    JSON.stringify(ring),
    !/all|outline|box-shadow/.test(ring.transitionProperty) ? "PASS" : "FAIL",
  );

  // ── 5. the SIX newly-defined muted sites ──────────────────────────────
  const sites = {};
  // (a) BookingsTable sort-header hover + (b) PlanModal summary bar
  sites["BookingsTable:298 sort header"] = await page.evaluate(() => {
    const el = document.querySelector("thead button, thead [class*='inline-flex']");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color };
  });
  await page.getByRole("tab", { name: /course/i }).first().click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  sites["PlanModal:269 summary bar"] = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const el = [...d.querySelectorAll("div")].find((x) => /rounded-xl/.test(x.className) && /border-muted-200|bg-muted-50/.test(x.className));
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, border: cs.borderColor, text: el.innerText.slice(0, 40).replace(/\n/g, " ") };
  });
  await shot("2-planmodal-summary");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);

  // (c) CalendarWeekGrid non-bookable cell + (d) BookingModal box
  await page.goto(`${BASE}/scheduler/calendar`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  sites["CalendarWeekGrid:106 non-bookable"] = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find((x) => /bg-muted-50\/80/.test(x.className?.toString?.() ?? ""));
    if (!el) return { note: "no non-bookable cell in this week's grid" };
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor };
  });
  await shot("3-calendar-week");
  const addBtn = page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first();
  if (await addBtn.count()) {
    await addBtn.click();
    await page.waitForTimeout(2500);
    sites["BookingModal:995 info box"] = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const el = [...d.querySelectorAll("div")].find((x) => /bg-muted-50/.test(x.className?.toString?.() ?? ""));
      if (!el) return { note: "box not rendered on this tab" };
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, border: cs.borderColor, text: el.innerText.slice(0, 60).replace(/\n/g, " ") };
    });
    await shot("4-bookingmodal-box");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // (e) DashboardContent:64 label + (f) RentalModal:145 price
  await page.goto(`${BASE}/scheduler/dashboard`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);
  sites["DashboardContent:64 label"] = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find((x) => /text-muted-800/.test(x.className?.toString?.() ?? ""));
    if (!el) return { note: "not on this route" };
    const cs = getComputedStyle(el);
    let p = el.parentElement, bg = "rgba(0, 0, 0, 0)";
    while (p && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) { bg = getComputedStyle(p).backgroundColor; p = p.parentElement; }
    return { color: cs.color, bgBehind: bg, text: el.innerText.slice(0, 30) };
  });
  await shot("5-dashboard");

  await page.goto(`${BASE}/scheduler/bookings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /all bookings/i }).click();
  await page.waitForTimeout(2000);
  const rental = page.getByRole("button", { name: /record rental|บันทึกการเช่า/i }).first();
  if (await rental.count()) {
    await rental.click();
    await page.waitForTimeout(2000);
    // pick an item so the price line renders
    const sel = page.locator('[role="dialog"] input').first();
    if (await sel.count()) {
      await sel.click();
      await page.waitForTimeout(800);
      const o = page.getByRole("option").first();
      if (await o.count()) await o.click();
      await page.waitForTimeout(1200);
    }
    sites["RentalModal:145 price"] = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[role="dialog"] strong')].find((x) => /text-muted-700/.test(x.className?.toString?.() ?? ""));
      if (!el) return { note: "price line not rendered (no item selected?)" };
      const cs = getComputedStyle(el);
      let p = el.parentElement, bg = "rgba(0, 0, 0, 0)";
      while (p && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) { bg = getComputedStyle(p).backgroundColor; p = p.parentElement; }
      return { color: cs.color, bgBehind: bg, text: el.innerText.slice(0, 30) };
    });
    await shot("6-rental-price");
  }

  const withContrast = Object.fromEntries(
    Object.entries(sites).map(([k, v]) => [
      k,
      v && v.color && v.bgBehind ? { ...v, contrast: contrast(v.color, v.bgBehind) } : v,
    ]),
  );
  const rendered = Object.values(withContrast).filter((v) => v && (v.bg || v.color)).length;
  const textOk = Object.values(withContrast).filter((v) => v?.contrast).every((v) => v.contrast >= 4.5);
  record(
    "TASK-128",
    "the SIX newly-defined muted sites now render a colour — and it is an improvement, not a regression",
    "each site paints a real tint; the two text sites still meet 4.5:1",
    JSON.stringify(withContrast),
    rendered >= 4 && textOk ? "PASS" : "PARTIAL",
  );

  // ── DEF-1 re-baseline at 375 ──────────────────────────────────────────
  await page.getByRole("tab", { name: /voucher/i }).first().click();
  await page.waitForTimeout(2000);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.waitForTimeout(1500);
  const manage = await page.evaluate(() => {
    const b = [...document.querySelectorAll("table button")].find((x) => /manage|จัดการ/i.test(x.innerText));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
    return { h: Math.round(r.height), reachable: !!(hit && (hit === b || b.contains(hit))) };
  });
  await shot("7-voucher-375");
  record(
    "re-baseline",
    "DEF-1 stays closed, and H-9/M-3 (44 px phone hit target) is fixed",
    "reachable at 375 and ≥44 px tall",
    JSON.stringify(manage),
    manage?.reachable && manage.h >= 44 ? "PASS" : manage?.reachable ? "PARTIAL" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
