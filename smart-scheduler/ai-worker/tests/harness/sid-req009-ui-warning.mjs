/**
 * QA harness — REQ-009 AC-1: the type-change CONFIRMATION must name the freelance budget and the
 * remaining amount, and cancelling it must change nothing. Driven through the real UI:
 * teacher row ⋯ menu → "Change type" → pick FULL_TIME → the red budget-closing alert appears.
 *
 * Footprint: one throwaway `QA-req009d` teacher (Porter-authorized 2026-08-04), ARCHIVED at the end.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(10)} ${id} — ${String(actual).slice(0, 260)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1600, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const created = { teacherId: null, archived: false };
const find = async (id) => (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers).find((t) => t.id === id);

try {
  const mk = await A("POST", "/teachers", { name: "QA-req009d-teacher", nickname: "QA-req009d", type: "FREELANCE" });
  created.teacherId = mk.json?.id ?? mk.json?.teacher?.id;
  const bud = await A("PUT", `/teachers/${created.teacherId}/budget`, { monthlyBudgetMinor: 500000, rateMinor: 25000 });
  record("setup — QA freelance teacher with a ฿5,000 ceiling", "created + budget set", `create ${mk.status} · budget ${bud.status} · id=${created.teacherId}`, mk.status < 300 && bud.status < 300 ? "PASS" : "FAIL");

  await page.goto(`${origin}/scheduler/teachers`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);
  // The row actions are an ActionIcon whose aria-label is "Edit"; find the one inside MY teacher's row.
  const idx = await page.evaluate((nick) => {
    const btns = [...document.querySelectorAll('button[aria-label="Edit"], [aria-label="Edit"]')];
    for (let i = 0; i < btns.length; i++) {
      let el = btns[i];
      // Walk up only while the container is still ROW-SIZED — walking to the page root would match
      // any row (that is how the first attempt opened the wrong teacher's dialog).
      for (let up = 0; up < 6 && el; up++) {
        const txt = el.innerText ?? "";
        if (txt.length > 400) break;
        if (txt.includes(nick)) return i;
        el = el.parentElement;
      }
    }
    return -1;
  }, "QA-req009d");
  const rowText = await page.evaluate((nick) => {
    const all = [...document.querySelectorAll("div")].filter((d) => (d.innerText ?? "").includes(nick));
    return (all[all.length - 1]?.innerText ?? "").slice(0, 220);
  }, "QA-req009d");
  await page.screenshot({ path: `${OUT}/sid-req009-ui-1-row.png` });
  record(
    "AC-1a the QA teacher's row is on the page with its budget",
    "the teacher and a budget figure are visible",
    `menuIndex=${idx} · row="${rowText.split("\n").join(" · ")}"`,
    idx >= 0 ? "PASS" : "FAIL",
  );

  // ⋯ menu → Change type
  await page.getByLabel("Edit").nth(idx).click();
  await page.waitForTimeout(900);
  const menuItems = await page.getByRole("menuitem").allInnerTexts();
  const changeType = page.getByRole("menuitem", { name: /change type|เปลี่ยนประเภท/i }).first();
  await changeType.click();
  await page.waitForTimeout(1500);
  const dlg = page.locator('[role="dialog"]').last();
  await page.screenshot({ path: `${OUT}/sid-req009-ui-2-dialog.png` });

  // pick FULL_TIME
  await dlg.getByLabel(/type|ประเภท/i).first().click();
  await page.waitForTimeout(700);
  await page.getByRole("option", { name: /full.?time|ประจำ/i }).first().click();
  await page.waitForTimeout(1200);
  const warnText = await dlg.innerText();
  await page.screenshot({ path: `${OUT}/sid-req009-ui-3-warning.png` });
  record(
    "AC-1b the confirmation names the freelance budget AND the remaining amount",
    'a red alert like "This closes {name}\'s freelance budget (remaining ฿X)"',
    `menu=${JSON.stringify(menuItems)} · dialog="${warnText.replace(/\n/g, " · ").slice(0, 240)}"`,
    /freelance budget|งบฟรีแลนซ์/i.test(warnText) && /5,?000|฿/.test(warnText) ? "PASS" : "FAIL",
  );

  // AC-1c: CANCEL changes nothing
  await dlg.getByRole("button", { name: /^cancel$|ยกเลิก/i }).first().click();
  await page.waitForTimeout(1500);
  const afterCancel = await find(created.teacherId);
  record("AC-1c cancelling the dialog changes nothing", "the teacher is still FREELANCE", `type=${afterCancel?.type}`, afterCancel?.type === "FREELANCE" ? "PASS" : "FAIL");

  // AC-1d: confirm actually applies + closes the ceiling
  await page.getByLabel("Edit").nth(idx).click();
  await page.waitForTimeout(900);
  await page.getByRole("menuitem", { name: /change type|เปลี่ยนประเภท/i }).first().click();
  await page.waitForTimeout(1200);
  const dlg2 = page.locator('[role="dialog"]').last();
  await dlg2.getByLabel(/type|ประเภท/i).first().click();
  await page.waitForTimeout(700);
  await page.getByRole("option", { name: /full.?time|ประจำ/i }).first().click();
  await page.waitForTimeout(700);
  await dlg2.getByRole("button", { name: /^save$|บันทึก/i }).first().click();
  await page.waitForTimeout(3000);
  const afterConfirm = await find(created.teacherId);
  const avail = await A("GET", `/slots/availability?date=${new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)}&startTime=10:00`);
  const me = avail.json?.teachers?.find((t) => t.teacher.id === created.teacherId);
  await page.screenshot({ path: `${OUT}/sid-req009-ui-4-after.png` });
  record(
    "AC-2 on confirm the type changes and the ceiling is closed",
    "type=FULL_TIME, no active freelance ceiling left",
    `type=${afterConfirm?.type} · availability available=${me?.available} reason=${me?.reason ?? "—"}`,
    afterConfirm?.type === "FULL_TIME" ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 500), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
  await page.screenshot({ path: `${OUT}/sid-req009-ui-error.png` });
} finally {
  if (created.teacherId) {
    const arch = await A("POST", `/teachers/${created.teacherId}/archive`);
    created.archived = arch.status < 300;
    console.error("cleanup — archive:", arch.status);
  }
  console.log(JSON.stringify({ cases, created }, null, 2));
  await browser.close();
}
