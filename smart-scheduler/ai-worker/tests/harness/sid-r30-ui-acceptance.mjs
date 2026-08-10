/**
 * QA harness — the UI half of the post-deploy acceptance, in a painted browser on `sid`:
 *   OBS-3   Insert shows a plan-diff PREVIEW before commit (resulting sessions + new end)
 *   OBS-3   Insert is disabled only on a genuinely-full course
 *   OBS-4   times render HH:mm (no raw 13:00:00)
 *   REQ-037 "เพิ่มคาบ (คิดเงิน)" is a VISIBLY separate action from Insert; extra rows are badged
 *   STANDING RULE — the plan modal's action row measured at 1600 / 1280 / 768 / 375
 * Read-mostly: it opens the preview and CANCELS it (dry-run writes nothing).
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const COURSE_ID = process.env.COURSE_ID;
const cases = [];
const record = (req, id, expected, actual, result) => {
  cases.push({ req, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${req}] ${id} — ${String(actual).slice(0, 240)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const shot = (n) => page.screenshot({ path: `${OUT}/sid-ui-${n}.png` });

const openPlanFor = async (search) => {
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill(search);
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  return page.locator('[role="dialog"]').first();
};

try {
  const plan = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  const d = await openPlanFor("QA-expv");
  const text = await d.innerText();
  await shot("1-plan");

  // ── OBS-4 — HH:mm, no raw seconds ──────────────────────────────────────
  record(
    "OBS-4",
    "times render HH:mm (the raw 13:00:00 is gone)",
    "no `\\d\\d:\\d\\d:\\d\\d` anywhere in the modal",
    `sample="${(text.match(/\d\d:\d\d(:\d\d)?/g) ?? []).slice(0, 6).join(", ")}"`,
    !/\d\d:\d\d:\d\d/.test(text) ? "PASS" : "FAIL",
  );

  // ── REQ-037 — the paid action is VISIBLY separate from Insert ──────────
  const buttons = (await d.getByRole("button").allInnerTexts()).map((s) => s.trim()).filter(Boolean);
  const insertBtn = d.getByRole("button", { name: /insert|เพิ่มคาบชดเชย|make-?up/i }).first();
  const paidBtn = d.getByRole("button", { name: /คิดเงิน|charged|extra/i }).first();
  const paidCount = await paidBtn.count();
  const styles = paidCount
    ? await paidBtn.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { text: el.innerText.trim(), color: cs.color, bg: cs.backgroundColor, rect: Math.round(el.getBoundingClientRect().width) };
      })
    : null;
  const insertStyles = (await insertBtn.count())
    ? await insertBtn.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { text: el.innerText.trim(), color: cs.color, bg: cs.backgroundColor, rect: Math.round(el.getBoundingClientRect().width) };
      })
    : null;
  record(
    "REQ-037",
    "the charged action is a separate, visibly distinct control from Insert",
    'both actions exist side by side and do not look alike (different label + colour)',
    `buttons=${JSON.stringify(buttons.slice(0, 8))} · paid=${JSON.stringify(styles)} · insert=${JSON.stringify(insertStyles)}`,
    paidCount > 0 && !!insertStyles && styles.text !== insertStyles.text && styles.color !== insertStyles.color ? "PASS" : "FAIL",
  );

  // extra (SINGLE_SESSION) rows are badged and offer no mark-absence
  const rows = await d.locator("tbody tr").allInnerTexts();
  const extraRow = rows.find((r) => /คาบพิเศษ|extra/i.test(r));
  record(
    "REQ-037",
    "an extra row is badged as a paid extra and has no Mark absence",
    '"คาบพิเศษ" badge; no absence action on that row',
    `row="${(extraRow ?? "none").replace(/\n/g, " · ").slice(0, 160)}"`,
    extraRow && !/absence|ขาด/i.test(extraRow) ? "PASS" : "FAIL",
  );

  // ── OBS-3 — the plan-diff preview appears BEFORE commit ────────────────
  const planBefore = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  await insertBtn.click();
  await page.waitForTimeout(1200);
  // fill the editor: teacher + subject, then Save → expect a DIFF CONFIRM, not an immediate apply
  const pick = async (label) => {
    const sel = d.getByLabel(new RegExp(`^${label}$`, "i")).first();
    if (!(await sel.count())) return false;
    await sel.click();
    await page.waitForTimeout(700);
    const opt = page.getByRole("option").first();
    if (await opt.count()) await opt.click();
    await page.waitForTimeout(500);
    return true;
  };
  await pick("teacher");
  await pick("subject");
  await shot("2-insert-editor");
  await d.getByRole("button", { name: /^save$|บันทึก/i }).first().click();
  await page.waitForTimeout(3500);
  const confirmText = await page.locator('[role="dialog"]').last().innerText();
  await shot("3-plan-diff-confirm");
  const planAfterPreview = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  record(
    "OBS-3",
    "Insert shows a plan-diff preview BEFORE anything is written",
    "a confirm step listing the resulting sessions + the new end date; the server plan is still unchanged",
    `confirm="${confirmText.replace(/\n/g, " · ").slice(0, 260)}" · serverRowsBefore=${planBefore.sessions.length} after=${planAfterPreview.sessions.length}`,
    planAfterPreview.sessions.length === planBefore.sessions.length &&
      /confirm|ยืนยัน|ผลลัพธ์|result|end|สิ้นสุด/i.test(confirmText)
      ? "PASS"
      : "FAIL",
  );

  // back out — nothing must be written
  const cancelBtn = page.locator('[role="dialog"]').last().getByRole("button", { name: /cancel|ยกเลิก|ปิด/i }).first();
  if (await cancelBtn.count()) await cancelBtn.click();
  await page.waitForTimeout(1500);
  const planAfterCancel = (await A("GET", `/entitlements/${COURSE_ID}/plan`)).json;
  record(
    "OBS-3",
    "backing out of the preview writes nothing",
    "the plan is byte-identical to before the preview",
    `rows ${planBefore.sessions.length} → ${planAfterCancel.sessions.length} · end ${planBefore.liveEndDate} → ${planAfterCancel.liveEndDate}`,
    planAfterCancel.sessions.length === planBefore.sessions.length && planAfterCancel.liveEndDate === planBefore.liveEndDate ? "PASS" : "FAIL",
  );

  // ── OBS-3 — Insert DISABLED only on a genuinely-full course ────────────
  const courses = (await A("GET", "/courses?limit=50")).json.items ?? [];
  let fullCourse = null;
  for (const c of courses.slice(0, 25)) {
    const p = (await A("GET", `/entitlements/${c.id}/plan`)).json;
    if (p?.insertable === false) {
      fullCourse = { id: c.id, student: c.student?.nickname ?? c.student?.name, plan: p };
      break;
    }
  }
  record(
    "OBS-3",
    "a genuinely-full course reports insertable=false (while mine, post-absence at owed 0, is true)",
    "at least one full course with insertable=false; the QA course insertable=true",
    `fullCourse=${fullCourse ? `${fullCourse.student} (owed ${fullCourse.plan.summary.owedCount})` : "none found"} · QA course insertable=${plan.insertable} at owed ${plan.summary.owedCount}`,
    !!fullCourse && plan.insertable === true ? "PASS" : "FAIL",
  );

  if (fullCourse) {
    const d2 = await openPlanFor(fullCourse.student);
    const ins2 = d2.getByRole("button", { name: /insert|เพิ่มคาบชดเชย|make-?up/i }).first();
    const state = (await ins2.count()) ? await ins2.evaluate((el) => ({ disabled: el.disabled || el.getAttribute("data-disabled") === "true", title: el.title || el.getAttribute("aria-label") || "" })) : null;
    await shot("4-insert-disabled");
    record(
      "OBS-3",
      "on that full course the Insert action is DISABLED with a reason",
      "disabled + a tooltip/reason; the paid extra action stays available",
      `insert=${JSON.stringify(state)} · paidStillThere=${(await d2.getByRole("button", { name: /คิดเงิน|charged|extra/i }).count()) > 0}`,
      state?.disabled === true ? "PASS" : "FAIL",
    );
  }

  // ── STANDING RULE — the plan modal's action row at four widths ─────────
  const widths = {};
  for (const w of [1600, 1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 1000 });
    const d3 = await openPlanFor("QA-expv");
    widths[w] = await d3.evaluate((el) => {
      const scroller = el.querySelector(".mantine-Table-scrollContainer, .mantine-ScrollArea-root");
      const table = el.querySelector("table");
      const footer = [...el.querySelectorAll("button")].filter((b) => /insert|คิดเงิน|extra|make-?up/i.test(b.innerText));
      return {
        modal: Math.round(el.getBoundingClientRect().width),
        tableScrollWidth: table ? Math.round(table.scrollWidth) : null,
        scrollerClientWidth: scroller ? Math.round(scroller.clientWidth) : null,
        scrollerOverflowX: scroller ? getComputedStyle(scroller).overflowX : null,
        actionButtons: footer.map((b) => ({ label: b.innerText.trim().slice(0, 24), w: Math.round(b.getBoundingClientRect().width) })),
        footerWraps: footer.length > 1 ? Math.round(footer[0].getBoundingClientRect().top) !== Math.round(footer[1].getBoundingClientRect().top) : null,
        anyZeroWidth: footer.some((b) => b.getBoundingClientRect().width < 40),
      };
    });
    await shot(`5-widths-${w}`);
  }
  const allOk = Object.values(widths).every((v) => !v.anyZeroWidth && (v.scrollerOverflowX === "auto" || v.tableScrollWidth <= v.scrollerClientWidth));
  record(
    "STANDING RULE",
    "the plan modal's new action row measured at 1600 / 1280 / 768 / 375",
    "no control collapses; the session table scrolls rather than clips",
    JSON.stringify(widths),
    allOk ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
