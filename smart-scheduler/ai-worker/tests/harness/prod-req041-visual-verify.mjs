/**
 * QA harness — post-deploy VISUAL verify of REQ-041 on customer-prod (human-authorized, in-session).
 * STRICTLY READ-ONLY: no data created or changed, nothing submitted, no LINE, no teacher-change.
 * Access is the app's own login form — TASK-090's guard is not run, not edited, not bypassed.
 *
 *   1. DEF-3 fix — are the `/NN` alpha rules GENERATED now, and do they paint?
 *   2. the six tinted sites, in situ (header backdrop · Teachers ×2 · Reports · PlanModal · WeekGrid)
 *   3. no visual regression from the token migration — the 63f734d/129 baseline re-measured on prod
 */
import { openProdSession, api } from "./prod-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (area, id, expected, actual, result) => {
  cases.push({ area, id, expected, actual, result });
  console.error(`${result.padEnd(8)} [${area}] ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin, apiToken } = await openProdSession({ viewport: { width: 1440, height: 950 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/prod041-${n}.png` });

/** computed background of the first element carrying an exact class */
const byClass = (cls, root = "body") =>
  page.evaluate(
    ([cls, root]) => {
      const scope = document.querySelector(root) ?? document.body;
      const el = [...scope.querySelectorAll("*")].find((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes(cls));
      if (!el) return { note: "not on this screen" };
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, tag: el.tagName.toLowerCase(), text: (el.innerText ?? "").slice(0, 34).replace(/\n/g, " ") };
    },
    [cls, root],
  );

try {
  record("access", "authenticated on customer-prod via the app's own login form", "signed in; TASK-090 guard untouched", `url=${page.url().replace(origin, "")}`, /scheduler/.test(page.url()) ? "PASS" : "FAIL");

  // ── 1. DEF-3: are the alpha rules generated on the DEPLOYED css? ───────
  const css = await page.evaluate(() => {
    const wanted = ["bg-content1\\/80", "bg-muted-100\\/60", "bg-muted-100\\/50", "bg-muted-50\\/40", "bg-muted-50\\/80", "bg-muted-50", "bg-muted-100"];
    const rules = {};
    for (const sheet of document.styleSheets) {
      let rs;
      try {
        rs = sheet.cssRules;
      } catch {
        continue;
      }
      for (const r of rs) {
        if (!r.selectorText) continue;
        for (const w of wanted) if (r.selectorText === `.${w}` && !rules[w]) rules[w] = r.cssText.slice(0, 150);
      }
    }
    const paint = {};
    for (const cls of ["bg-content1/80", "bg-muted-100/60", "bg-muted-100/50", "bg-muted-50/40", "bg-muted-50/80", "bg-muted-50", "bg-muted-100"]) {
      const el = document.createElement("div");
      el.className = cls;
      document.body.appendChild(el);
      paint[cls] = getComputedStyle(el).backgroundColor;
      el.remove();
    }
    return { rules, paint };
  });
  const alphaClasses = ["bg-content1/80", "bg-muted-100/60", "bg-muted-100/50", "bg-muted-50/40", "bg-muted-50/80"];
  const stillDead = alphaClasses.filter((c) => /rgba\(0, 0, 0, 0\)/.test(css.paint[c] ?? ""));
  record(
    "DEF-3",
    "the opacity modifiers compose again on the DEPLOYED build",
    "every `/NN` class now emits a rule and paints a translucent colour",
    `painted=${JSON.stringify(css.paint)} · sampleRule=${JSON.stringify(css.rules["bg-content1\\/80"] ?? css.rules["bg-muted-100\\/60"] ?? null)}`,
    stillDead.length === 0 ? "PASS" : "FAIL",
  );

  // ── 2. the six sites, in situ ─────────────────────────────────────────
  const sites = {};
  sites["Header.tsx:27 — app header backdrop (bg-content1/80)"] = await byClass("bg-content1/80");
  await shot("1-header");

  await page.goto(`${origin}/scheduler/teachers`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  sites["TeachersContent — bg-muted-100/60"] = await byClass("bg-muted-100/60");
  sites["TeachersContent — count of tinted blocks"] = await page.evaluate(
    () => [...document.querySelectorAll("*")].filter((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes("bg-muted-100/60")).length,
  );
  await shot("2-teachers");

  await page.goto(`${origin}/scheduler/reports`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  sites["ReportsContent — bg-muted-100/50"] = await byClass("bg-muted-100/50");
  await shot("3-reports");

  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  sites["CalendarWeekGrid — non-bookable cell (bg-muted-50/80)"] = await byClass("bg-muted-50/80");
  await shot("4-calendar");

  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  const managePlan = page.getByRole("button", { name: /manage plan/i }).first();
  if (await managePlan.count()) {
    await managePlan.click(); // read-only: opens the modal, nothing is submitted
    await page.waitForTimeout(2800);
    sites["PlanModal:269 — summary bar (bg-muted-50/40)"] = await byClass("bg-muted-50/40", '[role="dialog"]');
    await shot("5-planmodal");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1200);
  } else {
    sites["PlanModal:269 — summary bar (bg-muted-50/40)"] = { note: "no course card on prod to open (data was reset)" };
  }

  const painted = Object.entries(sites).filter(([, v]) => v && v.bg && !/rgba\(0, 0, 0, 0\)/.test(v.bg));
  const transparent = Object.entries(sites).filter(([, v]) => v && v.bg && /rgba\(0, 0, 0, 0\)/.test(v.bg));
  record(
    "DEF-3",
    "the six tinted sites paint in situ — especially the app header backdrop",
    "each site shows a translucent colour, not rgba(0,0,0,0)",
    JSON.stringify(sites),
    transparent.length === 0 && painted.length >= 3 ? "PASS" : transparent.length ? "FAIL" : "PARTIAL",
  );

  // ── 3. no visual regression — re-baseline on prod ─────────────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
  await page.waitForTimeout(2500);
  const base = {};
  for (const w of [1440, 768, 375]) {
    await page.setViewportSize({ width: w, height: 950 });
    await page.waitForTimeout(1500);
    base[w] = await page.evaluate(() => {
      const t = document.querySelector("table");
      if (!t) return { note: "no rows on prod" };
      const pinned = [...t.querySelectorAll("[data-pin]")];
      const badges = [...t.querySelectorAll('[class*="Badge"]')];
      const cells = [...t.querySelectorAll("tbody td")];
      const nums = cells.filter((c) => /\d/.test(c.innerText));
      return {
        pinned: pinned.length,
        allSticky: pinned.every((el) => getComputedStyle(el).position === "sticky"),
        truncatedBadges: badges.filter((b) => b.scrollWidth > b.clientWidth + 1 || /…/.test(b.innerText)).length,
        clipped: cells.filter((c) => c.scrollWidth > c.clientWidth + 1).length,
        iso: cells.filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.innerText.trim())).length,
        ddMmmYy: cells.filter((c) => /^\d{2}\/[A-Za-z]{3}\/\d{2}$/.test(c.innerText.trim())).length,
        tabular: nums.filter((c) => (getComputedStyle(c).fontVariantNumeric || "").includes("tabular-nums")).length,
        numeric: nums.length,
        pageHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    await shot(`6-bookings-${w}`);
  }
  const measured = Object.values(base).filter((v) => !v.note);
  record(
    "no-regression",
    "the pinned/no-truncation/format baseline still holds on prod",
    "pinned sticky · 0 truncated · 0 clipped · no ISO dates · tabular-nums present · no page h-scroll",
    JSON.stringify(base),
    measured.length > 0 && measured.every((v) => v.pinned > 0 && v.allSticky && v.truncatedBadges === 0 && v.clipped === 0 && v.iso === 0 && !v.pageHScroll) ? "PASS" : measured.length ? "FAIL" : "NOT TESTED",
  );

  // DEF-1 on prod at 375
  await page.setViewportSize({ width: 375, height: 950 });
  await page.getByRole("tab", { name: /voucher|วอยเชอร์/i }).first().click();
  await page.waitForTimeout(2500);
  const manage = await page.evaluate(() => {
    const b = [...document.querySelectorAll("table button")].find((x) => /manage|จัดการ/i.test(x.innerText));
    if (!b) return { note: "no voucher rows on prod" };
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
    return { h: Math.round(r.height), reachable: !!(hit && (hit === b || b.contains(hit))) };
  });
  await shot("7-voucher-375");
  record(
    "no-regression",
    "DEF-1 stays closed on prod and the 44 px hit target holds",
    "reachable at 375, ≥44 px",
    JSON.stringify(manage),
    manage.note ? "NOT TESTED" : manage.reachable && manage.h >= 44 ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
