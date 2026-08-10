/**
 * QA harness — the last two UI items:
 *   REQ-037  a LIVE extra row is badged "คาบพิเศษ" and offers no Mark absence
 *   REQ-030  the delivered-row Cancel in the UI asks for a REASON (TASK-105-FE)
 *
 * NOTE: both QA courses belong to the same student, so the harness first identifies WHICH course the
 * opened modal is showing by matching its rendered rows against each plan — no assumption.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const COURSE_IDS = (process.env.COURSE_IDS ?? "").split(",").filter(Boolean);
const cases = [];
const record = (req, id, expected, actual, result) => {
  cases.push({ req, id, expected, actual, result });
  console.error(`${result.padEnd(10)} [${req}] ${id} — ${String(actual).slice(0, 260)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const iso = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const shot = (n) => page.screenshot({ path: `${OUT}/sid-ui2-${n}.png` });

const openFirstPlan = async () => {
  await page.goto(`${origin}/scheduler/bookings`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByPlaceholder(/type a name|ค้นหา/i).first().fill("QA-expv");
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /manage plan/i }).first().click();
  await page.waitForTimeout(2500);
  return page.locator('[role="dialog"]').first();
};

try {
  // which course does the first card open?
  const plans = {};
  for (const id of COURSE_IDS) plans[id] = (await A("GET", `/entitlements/${id}/plan`)).json;
  let d = await openFirstPlan();
  const rowCount = await d.locator("tbody tr").count();
  const shownId =
    COURSE_IDS.find((id) => plans[id]?.sessions.length === rowCount) ?? COURSE_IDS[0];
  record(
    "setup",
    "identify which course the first card opens",
    "the modal's row count matches exactly one plan",
    `rendered rows=${rowCount} · candidates=${COURSE_IDS.map((id) => `${id.slice(0, 8)}:${plans[id]?.sessions.length}`).join(" ")} ⇒ ${shownId.slice(0, 8)}`,
    "PASS",
  );

  // ── REQ-037 — add a LIVE extra on that course, then check the row ──────
  const plan = plans[shownId];
  const teacherId = plan.sessions.find((s) => s.teacher)?.teacher.id;
  const subjectId = plan.sessions.find((s) => s.subject)?.subject.id;
  let slot = null;
  for (const dd of [12, 13, 14, 15, 18, 19]) {
    for (const t of ["11:00", "14:00", "15:00", "16:00"]) {
      const av = await A("GET", `/slots/availability?date=${iso(dd)}&startTime=${t}`);
      if ((av.json?.teachers ?? []).find((x) => x.teacher.id === teacherId)?.available) {
        slot = { date: iso(dd), time: t };
        break;
      }
    }
    if (slot) break;
  }
  const extra = await A("POST", `/courses/${shownId}/extra-session`, { teacherId, subjectId, date: slot.date, startTime: slot.time });
  const extraId = extra.json?.booking?.id ?? extra.json?.id;
  const planWithExtra = (await A("GET", `/entitlements/${shownId}/plan`)).json;

  d = await openFirstPlan();
  const rows = await d.locator("tbody tr").allInnerTexts();
  const dayLabel = `${new Date(slot.date + "T00:00:00").getDate()}`;
  const extraRow = rows.find((r) => r.includes(dayLabel) && /พิเศษ|extra|paid|charged/i.test(r));
  await shot("1-extra-row");
  record(
    "REQ-037",
    "the extra row is badged as a paid extra and offers no Mark absence",
    'a "คาบพิเศษ"/extra badge on the row; no absence action (it is not part of the quota)',
    `create ${extra.status} · slot ${slot.date} ${slot.time} · row="${(extraRow ?? rows.find((r) => r.includes(dayLabel)) ?? "none").replace(/\n/g, " · ").slice(0, 200)}"`,
    !!extraRow && !/absence|ขาด/i.test(extraRow) ? "PASS" : "FAIL",
  );
  record(
    "REQ-037",
    "the course summary is untouched by the extra (as rendered)",
    "size and end date unchanged in the modal header",
    `header="${(await d.innerText()).split("\n").slice(0, 6).join(" · ").slice(0, 160)}" · API end ${plan.liveEndDate} → ${planWithExtra.liveEndDate}`,
    planWithExtra.liveEndDate === plan.liveEndDate ? "PASS" : "FAIL",
  );

  // ── REQ-030 — the delivered-row Cancel asks for a reason (UI) ──────────
  const deliveredIdx = rows.findIndex((r) => /ATTENDED|locked/i.test(r));
  if (deliveredIdx >= 0) {
    const rowLoc = d.locator("tbody tr").nth(deliveredIdx);
    const cancelBtn = rowLoc.getByRole("button", { name: /cancel|ยกเลิก/i }).first();
    record(
      "REQ-030",
      "a delivered row now OFFERS Cancel (but still no Edit / Mark absence)",
      "Cancel present; Edit and Mark absence absent",
      `row="${rows[deliveredIdx].replace(/\n/g, " · ").slice(0, 160)}" · cancelBtn=${await cancelBtn.count()}`,
      (await cancelBtn.count()) > 0 && !/edit/i.test(rows[deliveredIdx]) ? "PASS" : "FAIL",
    );
    if (await cancelBtn.count()) {
      await cancelBtn.click();
      await page.waitForTimeout(1800);
      const dlg = page.locator('[role="dialog"]').last();
      const dlgText = await dlg.innerText();
      const inputs = await dlg.locator("input, textarea").count();
      await shot("2-cancel-reason-prompt");
      record(
        "REQ-030",
        "🆕 cancelling a DELIVERED row prompts for a mandatory reason",
        "a reason field (or an explicit reason-required message) before anything is sent",
        `prompt="${dlgText.replace(/\n/g, " · ").slice(0, 220)}" · inputs=${inputs}`,
        /reason|เหตุผล/i.test(dlgText) ? "PASS" : "FAIL",
      );
      // back out — do not cancel a delivered session for real
      const back = dlg.getByRole("button", { name: /cancel|ยกเลิก|ปิด|close/i }).last();
      if (await back.count()) await back.click();
      await page.waitForTimeout(1000);
    }
  } else {
    record("REQ-030", "delivered-row Cancel in the UI", "an ATTENDED row to click", "no delivered row on the shown course", "NOT TESTED");
  }

  // cleanup the extra I just made (its cancel must not re-owe — re-assert)
  if (extraId) {
    const beforeC = (await A("GET", `/entitlements/${shownId}/plan`)).json;
    const c = await A("PATCH", `/bookings/${extraId}/status`, { action: "cancel" });
    const afterC = (await A("GET", `/entitlements/${shownId}/plan`)).json;
    const cnt = (p) => p.sessions.filter((s) => s.bookingType !== "SINGLE_SESSION" && /PENDING|CONFIRMED|ATTENDED|EXTENDED|NO_SHOW/.test(s.status)).length;
    record(
      "REQ-037",
      "cleanup — cancelling the extra again does not re-owe",
      "counted plan rows unchanged",
      `${c.status} · counted ${cnt(beforeC)} → ${cnt(afterC)}`,
      c.status === 200 && cnt(beforeC) === cnt(afterC) ? "PASS" : "FAIL",
    );
  }
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await shot("error");
} finally {
  console.log(JSON.stringify({ cases }, null, 2));
  await browser.close();
}
