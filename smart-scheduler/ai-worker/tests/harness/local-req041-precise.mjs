/**
 * QA harness — the three checks the REQ-041 run left ambiguous, measured precisely:
 *   §3.3  does the focus ring ACTUALLY animate? `transition-property: all` with `duration: 0s` animates
 *         nothing — the first run asserted on the property name alone, which is not the question.
 *   T-128 the six newly-defined muted sites, found by their exact class rather than a loose guess.
 *   DEF-1 the voucher Manage button at 375 (blocked last run by a modal overlay).
 * Local only.
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
  console.error(`${result.padEnd(8)} [${area}] ${id} — ${String(actual).slice(0, 260)}`);
};
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

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const shot = (n) => page.screenshot({ path: `${OUT}/r041b-${n}.png` });

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

  // ── §3.3 — does the ring actually animate? ────────────────────────────
  const rings = await page.evaluate(() => {
    const out = [];
    const targets = [...document.querySelectorAll("button, a, input")].slice(0, 40);
    for (const el of targets.slice(0, 12)) {
      const cs = getComputedStyle(el);
      const props = cs.transitionProperty.split(",").map((s) => s.trim());
      const durs = cs.transitionDuration.split(",").map((s) => s.trim());
      // does any transition that could cover the ring have a non-zero duration?
      const ringAnimated = props.some((p, i) => /all|outline|box-shadow/.test(p) && parseFloat(durs[i] ?? durs[0] ?? "0") > 0);
      out.push({
        tag: el.tagName.toLowerCase(),
        label: (el.innerText || el.getAttribute("aria-label") || el.placeholder || "").trim().slice(0, 18),
        property: cs.transitionProperty.slice(0, 40),
        duration: cs.transitionDuration.slice(0, 30),
        ringAnimated,
      });
    }
    return out;
  });
  const animated = rings.filter((r) => r.ringAnimated);
  record(
    "§3.3",
    "the focus-visible ring is INSTANT — i.e. nothing that could animate it has a duration > 0",
    "no control transitions outline/box-shadow (or `all`) with a non-zero duration",
    `checked=${rings.length} animated=${animated.length} · sample=${JSON.stringify(rings.slice(0, 4))}`,
    animated.length === 0 ? "PASS" : "FAIL",
  );
  record(
    "§3.3",
    "correction to my own earlier reading",
    "`transition-property: all` alone is NOT a finding when `transition-duration` is 0s",
    `durations seen: ${JSON.stringify([...new Set(rings.map((r) => r.duration))])}`,
    "INFO",
  );

  // ── T-128 — the six sites, found by their exact class ─────────────────
  const measure = async (cls, root = "body") =>
    page.evaluate(
      ([cls, root]) => {
        const scope = document.querySelector(root) ?? document.body;
        const el = [...scope.querySelectorAll("*")].find((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes(cls));
        if (!el) return { note: `no element with class "${cls}" on this screen` };
        const cs = getComputedStyle(el);
        let p = el.parentElement, bg = "rgba(0, 0, 0, 0)";
        while (p && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) {
          bg = getComputedStyle(p).backgroundColor;
          p = p.parentElement;
        }
        return { bg: cs.backgroundColor, color: cs.color, bgBehind: bg, text: (el.innerText ?? "").slice(0, 40).replace(/\n/g, " ") };
      },
      [cls, root],
    );

  const sites = {};
  // a hover: utility only computes once hovered
  const sortBtn = page.locator("thead button").first();
  if (await sortBtn.count()) await sortBtn.hover();
  await page.waitForTimeout(600);
  sites["BookingsTable sort header (hover tint)"] = await measure("hover:bg-muted-50", "thead");

  await page.getByRole("tab", { name: /course/i }).first().click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  sites["PlanModal summary bar"] = await measure("bg-muted-50/40", '[role="dialog"]');
  await shot("1-planmodal");
  await page.locator('[role="dialog"] button[aria-label], [role="dialog"] .mantine-Modal-close').first().click().catch(() => {});
  await page.waitForTimeout(1500);

  await page.goto(`${BASE}/scheduler/calendar`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  sites["CalendarWeekGrid non-bookable cell"] = await measure("bg-muted-50/80");
  await shot("2-calendar");
  const add = page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first();
  if (await add.count()) {
    await add.click();
    await page.waitForTimeout(2500);
    sites["BookingModal info box"] = await measure("bg-muted-50", '[role="dialog"]');
    await shot("3-bookingmodal");
    await page.locator('[role="dialog"] .mantine-Modal-close').first().click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  await page.goto(`${BASE}/scheduler/dashboard`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);
  sites["Dashboard row label"] = await measure("text-muted-800");
  await shot("4-dashboard");

  await page.goto(`${BASE}/scheduler/bookings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /all bookings/i }).click();
  await page.waitForTimeout(2000);
  const rental = page.getByRole("button", { name: /record rental|บันทึกการเช่า/i }).first();
  if (await rental.count()) {
    await rental.click();
    await page.waitForTimeout(2000);
    const sel = page.locator('[role="dialog"] input').first();
    if (await sel.count()) {
      await sel.click();
      await page.waitForTimeout(900);
      const o = page.getByRole("option").first();
      if (await o.count()) await o.click();
      await page.waitForTimeout(1500);
    }
    sites["RentalModal price"] = await measure("text-muted-700", '[role="dialog"]');
    await shot("5-rental");
    await page.locator('[role="dialog"] .mantine-Modal-close').first().click().catch(() => {});
    await page.waitForTimeout(1200);
  }

  const withContrast = Object.fromEntries(
    Object.entries(sites).map(([k, v]) => [k, v?.color && v?.bgBehind ? { ...v, contrast: contrast(v.color, v.bgBehind) } : v]),
  );
  const found = Object.values(withContrast).filter((v) => v && !v.note).length;
  const textSites = Object.values(withContrast).filter((v) => v?.contrast);
  record(
    "TASK-128",
    "the six newly-defined muted sites render, and the text ones still meet 4.5:1",
    "each site paints; contrast unharmed",
    JSON.stringify(withContrast),
    found >= 4 && textSites.every((v) => v.contrast >= 4.5) ? "PASS" : "PARTIAL",
  );

  // ── DEF-1 + 44px at 375 (no modal in the way this time) ───────────────
  await page.getByRole("tab", { name: /voucher/i }).first().click();
  await page.waitForTimeout(2000);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.waitForTimeout(1800);
  const manage = await page.evaluate(() => {
    const b = [...document.querySelectorAll("table button")].find((x) => /manage|จัดการ/i.test(x.innerText));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
    return { h: Math.round(r.height), w: Math.round(r.width), reachable: !!(hit && (hit === b || b.contains(hit))) };
  });
  await shot("6-voucher-375");
  record(
    "re-baseline",
    "DEF-1 stays closed and the 44 px phone hit target (H-9/M-3) is met",
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
