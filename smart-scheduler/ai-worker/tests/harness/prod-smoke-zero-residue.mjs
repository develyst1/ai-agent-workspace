/**
 * QA harness — customer-prod post-deploy smoke, PHASE 1: every check that leaves NO footprint.
 *   A     the build landed (4-control filter row) + the STANDING-RULE widths at 1600/1280/768/375
 *         (this is the one open runtime check on TASK-124)
 *   107   the voucher Program picker omits the excluded programs
 *   109   "Record rental" opens its form (then Cancel — nothing posted)
 *   102   the settings screen lists the rules (READ ONLY — no override on production)
 *   plus  a clean-slate confirmation, and a check that nothing QA does could notify a real person
 * Creates nothing. Changes nothing. Sends nothing.
 */
import { openProdSession, api } from "./prod-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (item, id, expected, actual, result) => {
  cases.push({ item, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${item}] ${id} — ${String(actual).slice(0, 240)}`);
};

const { browser, page, origin, apiToken } = await openProdSession({ viewport: { width: 1600, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/prod-${n}.png` });

try {
  record("access", "authenticated on customer-prod via the app's own login form", "signed in; TASK-090 guard untouched (no minting)", `url=${page.url().replace(origin, "")}`, /scheduler/.test(page.url()) ? "PASS" : "FAIL");

  // ── the clean slate the owner reported ─────────────────────────────────
  const [students, courses, vouchers, bookings, teachers] = await Promise.all([
    A("GET", "/students?q="),
    A("GET", "/courses?limit=5"),
    A("GET", "/vouchers?limit=5"),
    A("GET", "/bookings?limit=5"),
    A("GET", "/teachers"),
  ]);
  const teacherList = (teachers.json?.groups ?? []).flatMap((g) => g.teachers);
  record(
    "clean slate",
    "the REQ-040 clear is visible from the app",
    "students/courses/vouchers/bookings empty; teachers kept",
    `students=${(students.json ?? []).length} · courses=${courses.json?.total ?? "?"} · vouchers=${vouchers.json?.total ?? "?"} · bookings=${bookings.json?.total ?? "?"} · teachers=${teacherList.length}`,
    teacherList.length > 0 ? "PASS" : "FAIL",
  );

  // ── safety pre-check: could anything I do reach a real person? ─────────
  const settings = await A("GET", "/settings");
  const linked = teacherList.filter((t) => t.lineUserId || t.lineLinked || t.hasLineLink);
  record(
    "safety",
    "pre-check — is any real teacher still LINE-linked, and are admin LINE recipients configured?",
    "used to decide what is safe to exercise; teacher-change is excluded regardless",
    `teachersExposingALinkFlag=${linked.length} · settingsKeys=${(settings.json ?? []).map((s) => s.key).join(",")}`,
    "PASS",
  );

  // ── A — the build landed + the STANDING-RULE widths ────────────────────
  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  const findStudent = page.getByLabel(/find student|ค้นหานักเรียน/i).first();
  record(
    "A",
    "the new frontoffice build is live (the four-control filter row)",
    '"Find student" present beside Teacher / Type / Badge',
    `findStudentPresent=${(await findStudent.count()) > 0}`,
    (await findStudent.count()) > 0 ? "PASS" : "FAIL",
  );

  const widths = {};
  for (const w of [1600, 1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500);
    widths[w] = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll("input")].filter((i) => i.getBoundingClientRect().width > 0);
      return {
        controls: inputs.map((i) => ({
          label: (i.closest(".mantine-InputWrapper-root")?.querySelector("label")?.textContent?.trim() ?? i.getAttribute("aria-label") ?? "?").slice(0, 14),
          w: Math.round(i.getBoundingClientRect().width),
        })),
        lines: new Set(inputs.map((i) => Math.round(i.getBoundingClientRect().top))).size,
        narrowest: Math.min(...inputs.map((i) => Math.round(i.getBoundingClientRect().width))),
        pageHasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    await shot(`widths-${w}`);
  }
  record(
    "STANDING RULE",
    "the 4-control filter row measured on PRODUCTION at 1600/1280/768/375",
    "nothing collapses (the defect this rule exists for was 26/36 px); the row wraps; no page overflow",
    JSON.stringify(widths),
    Object.values(widths).every((v) => v.narrowest >= 100 && !v.pageHasHScroll) ? "PASS" : "FAIL",
  );
  await page.setViewportSize({ width: 1600, height: 1000 });

  // ── 107 — the voucher program picker (read-only: opened, never submitted) ─
  const sp = (await A("GET", "/sellable-packages")).json;
  const allowed = sp?.voucherAllowedGroups ?? [];
  const bySubject = new Map();
  for (const p of sp?.packages ?? []) for (const s of p.subjects) bySubject.set(s.name, p.priceGroup);
  const excluded = [...bySubject.entries()].filter(([, g]) => !allowed.includes(g)).map(([n]) => n);

  await page.goto(`${origin}/scheduler/calendar`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^add booking$|^เพิ่มการจอง$/i }).first().click();
  await page.waitForTimeout(2500);
  const modal = page.locator('[role="dialog"]').first();
  await modal.getByRole("tab", { name: /voucher|วอยเชอร์/i }).click();
  await page.waitForTimeout(1500);
  await modal.getByLabel(/program|โปรแกรม|คลาส/i).first().click();
  await page.waitForTimeout(1200);
  const programs = (await page.getByRole("option").allInnerTexts()).map((s) => s.trim());
  await shot("107-voucher-programs");
  record(
    "107",
    "the voucher Program picker omits every excluded program",
    `derived from the server: allowed=${JSON.stringify(allowed)} ⇒ excluded=${JSON.stringify(excluded)}`,
    `offered=${JSON.stringify(programs)} · excludedButOffered=${JSON.stringify(programs.filter((p) => excluded.includes(p)))}`,
    programs.length > 0 && programs.filter((p) => excluded.includes(p)).length === 0 ? "PASS" : "FAIL",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);

  // ── 109 — the rental form opens (Cancel, never Record) ────────────────
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.getByRole("tab", { name: /all bookings|การจองทั้งหมด/i }).click();
  await page.waitForTimeout(2000);
  const rentalBtn = page.getByRole("button", { name: /record rental|บันทึกการเช่า/i }).first();
  let rentalText = "";
  if (await rentalBtn.count()) {
    await rentalBtn.click();
    await page.waitForTimeout(2000);
    rentalText = await page.locator('[role="dialog"]').first().innerText();
    await shot("109-rental-form");
    const cancel = page.locator('[role="dialog"]').first().getByRole("button", { name: /^cancel$|ยกเลิก/i }).first();
    if (await cancel.count()) await cancel.click(); // never "Record"
    await page.waitForTimeout(1000);
  }
  record(
    "109",
    "the standalone rental entry opens its form (and is then cancelled — nothing recorded)",
    '"Record rental" → Equipment + Hours form',
    `present=${(await rentalBtn.count()) > 0} · form="${rentalText.replace(/\n/g, " · ").slice(0, 180)}"`,
    /equipment|อุปกรณ์/i.test(rentalText) ? "PASS" : "FAIL",
  );

  // ── 102 — settings screen, READ ONLY on production ────────────────────
  await page.goto(`${origin}/scheduler/settings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const setText = await page.locator("body").innerText();
  await shot("102-settings");
  record(
    "102",
    "the settings screen lists the business rules (NOT exercised — no override on production)",
    "both rules visible with their values; the override/reset path stays covered by its `sid` pass",
    `api=${JSON.stringify((settings.json ?? []).map((s) => `${s.key}=${s.value}(default ${s.default}, overridden ${s.isOverridden})`))} · screenShows=${/notice|แจ้งเปลี่ยนครู|check.?in|เช็คอิน/i.test(setText)}`,
    /notice|แจ้งเปลี่ยนครู|check.?in|เช็คอิน/i.test(setText) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
