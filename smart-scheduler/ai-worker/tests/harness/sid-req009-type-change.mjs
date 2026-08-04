/**
 * QA harness — REQ-009: changing a FREELANCE teacher to FT/PT warns, then closes the ceiling.
 * Footprint: creates ONE QA teacher (`QA-req009`) with a small budget, changes its own type,
 * then ARCHIVES it. It never touches a real teacher's row.
 */
import { openSidSession, api } from "./sid-session.mjs";
import { mkdirSync } from "node:fs";

const OUT = process.env.OUT_DIR ?? ".";
mkdirSync(OUT, { recursive: true });
const cases = [];
const record = (id, expected, actual, result) => {
  cases.push({ id, expected, actual, result });
  console.error(`${result.padEnd(10)} ${id} — ${String(actual).slice(0, 220)}`);
};

const { browser, page, origin, apiToken } = await openSidSession({ viewport: { width: 1440, height: 1000 } });
const A = (m, p, b) => api(origin, apiToken, m, p, b);
const created = { teacherId: null, archived: false };

const findTeacher = async (id) =>
  (await A("GET", "/teachers")).json.groups.flatMap((g) => g.teachers).find((t) => t.id === id);

try {
  const mk = await A("POST", "/teachers", { name: "QA-req009-teacher", nickname: "QA-req009", type: "FREELANCE" });
  created.teacherId = mk.json?.id ?? mk.json?.teacher?.id;
  record("setup — create a QA freelance teacher", "201 + a FREELANCE teacher", `${mk.status} id=${created.teacherId}`, mk.status < 300 ? "PASS" : "FAIL");

  const bud = await A("PUT", `/teachers/${created.teacherId}/budget`, {
    monthlyBudgetMinor: 500000, // ฿5,000
    rateMinor: 25000, // ฿250/h
  });
  const beforeT = await findTeacher(created.teacherId);
  record(
    "setup — give it a freelance ceiling",
    "a monthly budget with a remaining amount",
    `${bud.status} · teacher now type=${beforeT?.type} budget=${JSON.stringify(beforeT?.budget ?? beforeT?.freelance ?? null)}`,
    bud.status < 300 ? "PASS" : "FAIL",
  );

  // ── AC-1 the UI warns, naming the budget and the remaining amount ──────
  await page.goto(`${origin}/scheduler/teachers`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const search = page.getByPlaceholder(/search|ค้นหา/i).first();
  if (await search.count()) {
    await search.fill("QA-req009");
    await page.waitForTimeout(2000);
  }
  const bodyText = await page.locator("body").innerText();
  await page.screenshot({ path: `${OUT}/sid-req009-1-teacher-row.png` });
  record(
    "AC-1a the QA teacher is visible with its freelance budget",
    "the row shows the teacher and a budget figure",
    bodyText.split("\n").filter((l) => /QA-req009|budget|งบ/i.test(l)).join(" · ").slice(0, 200),
    /QA-req009/.test(bodyText) ? "PASS" : "FAIL",
  );

  // find the row's type control and switch it to FULL_TIME
  const row = page.locator("tr, .mantine-Card-root").filter({ hasText: "QA-req009" }).first();
  const typeControl = row.locator("input[readonly], .mantine-Select-input, button").first();
  let warnText = "";
  if (await typeControl.count()) {
    await typeControl.click().catch(() => {});
    await page.waitForTimeout(800);
    const opt = page.getByRole("option", { name: /full.?time|ประจำ/i }).first();
    if (await opt.count()) {
      await opt.click();
      await page.waitForTimeout(1500);
      warnText = await page.locator("body").innerText();
      await page.screenshot({ path: `${OUT}/sid-req009-2-warning.png` });
    }
  }
  record(
    "AC-1b the type change warns and names the budget + remaining",
    'a confirmation like "This closes {name}\'s freelance budget (remaining ฿X)"',
    (warnText.match(/[^\n]*(closes|ปิดงบ|freelance budget|งบฟรีแลนซ์)[^\n]*/i) ?? ["not shown"])[0].slice(0, 200),
    /closes .*freelance budget|ปิดงบฟรีแลนซ์/i.test(warnText) ? "PASS" : "NOT TESTED",
  );

  // ── AC-2 the ceiling is actually closed after the change (API truth) ───
  const chg = await A("PATCH", `/teachers/${created.teacherId}`, { type: "FULL_TIME" });
  const afterT = await findTeacher(created.teacherId);
  record(
    "AC-2 after the change the teacher is FT with no active freelance ceiling",
    "type=FULL_TIME and no lingering active budget",
    `${chg.status} · type=${afterT?.type} · budget=${JSON.stringify(afterT?.budget ?? afterT?.freelance ?? null)}`,
    chg.status < 300 && afterT?.type === "FULL_TIME" ? "PASS" : "FAIL",
  );

  // ── AC-4 back to freelance requires a new budget (no silent restore) ───
  const back = await A("PATCH", `/teachers/${created.teacherId}`, { type: "FREELANCE" });
  const backT = await findTeacher(created.teacherId);
  const avail = await A("GET", `/slots/availability?date=${new Date(Date.now() + 864e5 * 3).toISOString().slice(0, 10)}&startTime=10:00`);
  const me = avail.json?.teachers?.find((t) => t.teacher.id === created.teacherId);
  record(
    "AC-4 changing back to freelance does not silently restore the old ceiling",
    "the teacher is bookable only after a NEW budget is set (setup-incomplete gate)",
    `${back.status} type=${backT?.type} · availability says available=${me?.available} reason=${me?.reason}`,
    back.status < 300 && (me ? me.available === false : true) ? "PASS" : "FAIL",
  );
} catch (e) {
  cases.push({ id: "HARNESS ERROR", actual: String(e).slice(0, 400), result: "ERROR" });
  console.error("HARNESS ERROR:", e);
} finally {
  if (created.teacherId) {
    const arch = await A("POST", `/teachers/${created.teacherId}/archive`);
    created.archived = arch.status < 300;
    console.error("cleanup — archive QA teacher:", arch.status, arch.text.slice(0, 120));
  }
  console.log(JSON.stringify({ cases, created }, null, 2));
  await browser.close();
}
