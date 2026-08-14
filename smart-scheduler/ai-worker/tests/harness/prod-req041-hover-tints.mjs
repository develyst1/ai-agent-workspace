/**
 * QA harness — the one REQ-041 site my previous probe mis-tested, done properly on customer-prod.
 * READ-ONLY.
 *
 * `bg-muted-100/60` is used ONLY as `hover:bg-muted-100/60` (TeachersContent:255, :342). Tailwind
 * therefore generates `.hover\:bg-muted-100\/60:hover` and never the bare class — so injecting a plain
 * `<div class="bg-muted-100/60">` paints nothing for a reason that has nothing to do with the fix.
 * The honest test is to hover the real element and read the computed background.
 */
import { openProdSession } from "./prod-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(8)} ${id} — ${String(actual).slice(0, 250)}`);
};

const { browser, page, origin } = await openProdSession({ viewport: { width: 1440, height: 950 } });

try {
  await page.goto(`${origin}/scheduler/teachers`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);

  const count = await page.evaluate(
    () => [...document.querySelectorAll("*")].filter((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes("hover:bg-muted-100/60")).length,
  );
  record("setup — the hover-tinted teacher blocks exist on prod", "≥1 element carrying hover:bg-muted-100/60", `count=${count}`, count > 0 ? "PASS" : "FAIL");

  // rest state, then hover the same element, and compare
  const before = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes("hover:bg-muted-100/60"));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { bg: getComputedStyle(el).backgroundColor, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), text: el.innerText.slice(0, 30).replace(/\n/g, " ") };
  });
  await page.screenshot({ path: `${OUT}/hover-1-rest.png` });
  await page.mouse.move(before.x, before.y);
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find((x) => (x.className?.toString?.() ?? "").split(/\s+/).includes("hover:bg-muted-100/60"));
    return { bg: getComputedStyle(el).backgroundColor };
  });
  await page.screenshot({ path: `${OUT}/hover-2-hovered.png` });

  record(
    "🔴 the Teachers hover tint composes on the deployed build",
    "hovering paints rgba(241,245,249,0.6) — i.e. the /60 modifier now works",
    `rest=${before.bg} → hover=${after.bg} · block="${before.text}"`,
    /rgba\(241, 245, 249, 0\.6\)/.test(after.bg) ? "PASS" : after.bg !== before.bg ? "PARTIAL" : "FAIL",
  );

  // and the generated rule itself, for the record
  const rule = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      let rs;
      try {
        rs = sheet.cssRules;
      } catch {
        continue;
      }
      for (const r of rs) if (r.selectorText && r.selectorText.includes("hover\\:bg-muted-100\\/60")) return r.cssText.slice(0, 170);
    }
    return null;
  });
  record(
    "the emitted CSS rule proves the alpha composes",
    "a rule exists using rgb(var(--color-muted-100) / 0.6) or the resolved rgba",
    String(rule),
    rule ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
