/**
 * QA harness — the two checks the retest run could not finish, plus the card-in-card and
 * status-colour observations, measured rather than read.
 *   · search / filters / bulk-confirm still work (no functional regression)
 *   · BookingsTable sits inside a <Card> that also wraps the filter row → containment layers
 *   · status chips: colour-only or colour+shape?
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
  console.error(`${result.padEnd(8)} [${area}] ${id} — ${String(actual).slice(0, 230)}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

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

  // ── functional regression: search + status filter + bulk confirm ───────
  const rowsAll = await page.locator("tbody tr").count();
  const search = page.locator('input[placeholder*="name" i]:visible').first();
  await search.fill("zzzz-nobody");
  await page.waitForTimeout(2200);
  const rowsNone = await page.locator("tbody tr").count();
  await search.fill("");
  await page.waitForTimeout(2200);
  const rowsBack = await page.locator("tbody tr").count();
  record(
    "regression",
    "search still filters and clears",
    "nonsense query empties the table; clearing restores it",
    `all=${rowsAll} → nonsense=${rowsNone} → cleared=${rowsBack}`,
    rowsAll > 0 && rowsNone < rowsAll && rowsBack === rowsAll ? "PASS" : "FAIL",
  );

  // Mantine associates the label with the listbox too, so getByLabel can resolve to the dropdown.
  // Target the INPUT whose own InputWrapper label reads "Status".
  const statusIdx = await page.evaluate(() =>
    [...document.querySelectorAll("input")].findIndex(
      (i) => (i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent ?? "").trim().toLowerCase() === "status",
    ),
  );
  const statusSel = statusIdx >= 0 ? page.locator("input").nth(statusIdx) : page.locator("__none__");
  let filtered = null;
  if (await statusSel.count()) {
    await statusSel.click();
    await page.waitForTimeout(800);
    const opt = page.getByRole("option", { name: /confirmed/i }).first();
    if (await opt.count()) {
      await opt.click();
      await page.waitForTimeout(2200);
      filtered = await page.locator("tbody tr").count();
      const statuses = await page.evaluate(() =>
        [...document.querySelectorAll("tbody tr")].map((r) => (r.innerText.match(/CONFIRMED|PENDING|ATTENDED|CANCELLED|ON LEAVE|EXTENDED/) ?? [""])[0]),
      );
      record(
        "regression",
        "the status filter still filters",
        "only rows of the chosen status remain",
        `rows=${filtered} statuses=${JSON.stringify([...new Set(statuses)])}`,
        filtered > 0 && new Set(statuses).size === 1 ? "PASS" : "FAIL",
      );
    }
  }

  const checkboxes = page.locator("tbody input[type=checkbox]");
  const cbCount = await checkboxes.count();
  if (cbCount > 0) {
    await checkboxes.first().check();
    await page.waitForTimeout(1200);
    const bulk = await page.getByRole("button", { name: /confirm/i }).allInnerTexts();
    record(
      "regression",
      "selecting a row still surfaces bulk confirm",
      "a bulk-confirm action appears with the selection count",
      `checkboxes=${cbCount} · bulkButtons=${JSON.stringify(bulk)}`,
      bulk.length > 0 ? "PASS" : "FAIL",
    );
    await checkboxes.first().uncheck();
  }

  // ── containment: is the table inside a Card that's inside a panel? ─────
  const containment = await page.evaluate(() => {
    const t = document.querySelector("table");
    if (!t) return null;
    const chain = [];
    let el = t.parentElement;
    for (let i = 0; i < 8 && el; i++) {
      const cs = getComputedStyle(el);
      const boxed = cs.borderStyle !== "none" || cs.boxShadow !== "none" || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent");
      chain.push({ cls: el.className.toString().split(" ").filter((c) => /Card|Paper|ScrollArea|sticky/i.test(c)).join(",").slice(0, 40), boxed, radius: cs.borderRadius });
      el = el.parentElement;
    }
    return chain;
  });
  const boxedLayers = (containment ?? []).filter((c) => c.boxed && /Card|Paper/i.test(c.cls)).length;
  record(
    "hallmark",
    "containment layers around the table (anti-pattern: card-in-card)",
    "one containment layer, not a card inside a card",
    `boxedCardLayers=${boxedLayers} · chain=${JSON.stringify(containment?.slice(0, 5))}`,
    boxedLayers <= 1 ? "PASS" : "FAIL",
  );

  // ── status chips: colour only, or colour + shape/icon? ────────────────
  const chips = await page.evaluate(() =>
    [...document.querySelectorAll('tbody [class*="Badge"]')].slice(0, 6).map((b) => ({
      text: b.innerText.trim(),
      hasIconOrDot: !!b.querySelector("svg") || getComputedStyle(b, "::before").content !== "none",
      color: getComputedStyle(b).color,
    })),
  );
  record(
    "hallmark",
    "status is never carried by colour alone (§2 / a11y)",
    "each status chip pairs colour with an icon or shape",
    JSON.stringify(chips),
    chips.length > 0 && chips.every((c) => c.hasIconOrDot) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
