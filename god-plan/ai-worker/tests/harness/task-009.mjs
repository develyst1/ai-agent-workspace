// THROWAWAY scenario for TASK-009 (AI proposals + summary). Needs, all local: the REAL back on :4310 (back-pglite), the AI
// stand-in on :4399 (gateway-stub; the back is pointed at it, never at a live gateway), and the front on :4300.
//   STUB_OWNER_EMAIL=… STUB_OWNER_PASSWORD=… STUB_INVITEE_EMAIL=… STUB_INVITEE_PASSWORD=… node tests/harness/task-009.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";

const OUT = new URL("./shots/TASK-009/", import.meta.url).pathname;
const MODE = new URL("./gateway-stub/mode.txt", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const E = (k) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const BASE = "http://localhost:4300";
const GW = "http://127.0.0.1:4399";
const MAIN = "ย้ายบ้านใหม่";
const AI_ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`); };
const mode = (m) => writeFileSync(MODE, m + "\n");
const calls = async () => (await (await fetch(`${GW}/calls`)).json()).count;
const clearCalls = () => fetch(`${GW}/calls`, { method: "DELETE" });

const b = await launch({ width: 1280, height: 900, port: 9335 });
const T = () => b.text();
const has = async (s) => (await T()).includes(s);
const taskTitles = () => b.eval(`[...document.querySelectorAll('section h2')].map(h=>h.textContent.trim())`);
const colTitles = (label) => b.eval(`(() => { const s=[...document.querySelectorAll('section')].find(x=>x.getAttribute('aria-label')===${JSON.stringify(label)}); return s ? [...s.querySelectorAll('h2')].map(h=>h.textContent.trim()) : []; })()`);
const rows = () => b.eval(`[...document.querySelectorAll('li')].filter(li=>li.querySelector('input[type=checkbox]')).map(li=>({on:li.querySelector('input[type=checkbox]').checked,title:li.querySelector('input:not([type=checkbox])')?.value}))`);
const rowCentre = (i) => b.eval(`(() => { const li=[...document.querySelectorAll('li')].filter(li=>li.querySelector('input[type=checkbox]'))[${i}]; const el=li.querySelector('label')||li.querySelector('input[type=checkbox]'); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
const typeInRow = async (i, text) => {
  await b.eval(`(() => { const li=[...document.querySelectorAll('li')].filter(li=>li.querySelector('input[type=checkbox]'))[${i}]; const el=li.querySelector('input:not([type=checkbox])'); el.scrollIntoView({block:'center'}); el.focus(); el.select(); })()`);
  await b.send("Input.insertText", { text });
  await b.sleep(200);
};
const signIn = async (email, pw) => {
  await b.goto(`${BASE}/sign-in`, 900);
  await b.type("อีเมล", email);
  await b.type("รหัสผ่าน", pw);
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1700);
};
const waitFor = async (pred, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await pred()) return Date.now() - t0; await b.sleep(500); } return -1; };

try {
  mode("ok");
  await b.size(1280, 900);
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  const href = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(MAIN)}).getAttribute('href')`);
  const PROJ = `${BASE}${href}`;
  await clearCalls();
  await b.goto(PROJ, 1700);
  check("AC-11: opening the project page makes 0 gateway calls", (await calls()) === 0);
  const before = await taskTitles();

  // ---------- AC-7: propose → untick 2, edit 1, save ----------
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await waitFor(async () => (await rows()).length > 0, 8000);
  const r0 = await rows();
  check("a proposal appears: 5 rows, all ticked, each with a title", r0.length === 5 && r0.every((r) => r.on && r.title), `rows=${r0.length}`);
  check("AC-11: one press = exactly 1 gateway call", (await calls()) === 1);
  check("the panel heading is the PM's string", await has("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)"));
  await b.shot(`${OUT}proposal-1280.png`);
  const keep = [r0[0].title, r0[2].title, r0[4].title];
  await b.clickAt(await rowCentre(1));
  await b.clickAt(await rowCentre(3));
  await typeInRow(0, "ชื่องานที่ฉันแก้เอง");
  const r1 = await rows();
  check("2 rows unticked, 1 title edited", r1.filter((r) => !r.on).length === 2 && r1[0].title === "ชื่องานที่ฉันแก้เอง");
  await b.shot(`${OUT}proposal-edited-1280.png`);
  await b.click("บันทึกงานที่เลือก", "button");
  await b.sleep(1500);
  const afterSave = await taskTitles();
  const added = afterSave.filter((t) => !before.includes(t));
  check("AC-7: exactly the 3 ticked rows were added, with the edit", added.length === 3 && added.includes("ชื่องานที่ฉันแก้เอง") && added.includes(keep[1]) && added.includes(keep[2]) && !added.includes(keep[0]), `added=${added.length}`);
  check("AC-7: they are in ยังไม่เริ่ม", (await colTitles("ยังไม่เริ่ม")).includes("ชื่องานที่ฉันแก้เอง"));
  check("the panel closed after saving", (await rows()).length === 0);
  await b.goto(PROJ, 1700);
  check("AC-7: still there after a reload", (await taskTitles()).includes("ชื่องานที่ฉันแก้เอง"));
  check("saving made no extra gateway call", (await calls()) === 1);
  const base2 = await taskTitles();

  // ---------- AC-7a: a proposal left open is gone after a reload, nothing added ----------
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await waitFor(async () => (await rows()).length > 0, 8000);
  check("a second press gives a proposal (call 2)", (await rows()).length === 5 && (await calls()) === 2);
  await b.goto(PROJ, 1700);
  check("AC-7a: reload drops the proposal and adds nothing", (await rows()).length === 0 && (await taskTitles()).length === base2.length);
  // asking again replaces what is on screen
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await waitFor(async () => (await rows()).length > 0, 8000);
  await typeInRow(0, "แก้แล้วจะหายเมื่อถามใหม่");
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await b.sleep(1500);
  const r2 = await rows();
  check("asking again replaces the proposal (the edit is gone)", r2.length === 5 && !r2.some((r) => r.title === "แก้แล้วจะหายเมื่อถามใหม่"));
  // cancel drops it too
  await b.click("ยกเลิก", "button");
  await b.sleep(400);
  check("AC-7a: ยกเลิก drops the proposal, nothing added", (await rows()).length === 0 && (await taskTitles()).length === base2.length);

  // ---------- AC-8: the stand-in fails in four ways; same message, project unchanged ----------
  for (const m of ["500", "empty", "malformed"]) {
    mode(m);
    await b.click("ให้ AI ช่วยแตกงาน", "button");
    const ms = await waitFor(async () => (await T()).includes(AI_ERR), 15000);
    check(`AC-8: gateway mode ${m} → the AI error string`, ms >= 0, `${ms} ms`);
    check(`AC-8: mode ${m} → no proposal and the project unchanged`, (await rows()).length === 0 && (await taskTitles()).length === base2.length);
  }
  await b.shot(`${OUT}ai-error-1280.png`);
  mode("hang");
  const t0 = Date.now();
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await b.sleep(1000);
  check("while the call runs the button is disabled and says AI กำลังคิด…", (await has("AI กำลังคิด…")) && (await b.eval(`[...document.querySelectorAll('button')].some(x=>x.textContent.includes('AI กำลังคิด')&&x.disabled)`)));
  await b.shot(`${OUT}ai-thinking-1280.png`, { full: false });
  const ms = await waitFor(async () => (await T()).includes(AI_ERR), 34000);
  check("AC-8: gateway mode hang → the AI error within 30 s", ms >= 0 && Date.now() - t0 <= 30000, `${Date.now() - t0} ms`);
  check("AC-8: hang → the project unchanged", (await rows()).length === 0 && (await taskTitles()).length === base2.length);
  mode("ok");

  // ---------- busy / too many presses (faked answers: the back needs a second tab or 10 presses to produce them) ----------
  await b.goto(PROJ, 1700);
  await b.intercept((req) => (req.method === "POST" && /\/ai\/task-proposals$/.test(req.url) ? { status: 429, body: { error: { code: "AI_BUSY" } } } : null));
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await b.sleep(900);
  check("429 AI_BUSY shows AI กำลังทำงานให้โปรเจกต์นี้อยู่ รอสักครู่แล้วลองใหม่", await has("AI กำลังทำงานให้โปรเจกต์นี้อยู่ รอสักครู่แล้วลองใหม่"));
  await b.clearIntercepts();
  await b.intercept((req) => (req.method === "POST" && /\/ai\/task-proposals$/.test(req.url) ? { status: 429, body: { error: { code: "RATE_LIMITED" } } } : null));
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await b.sleep(900);
  check("429 RATE_LIMITED shows กดถี่เกินไป รอสักนาทีแล้วลองใหม่", await has("กดถี่เกินไป รอสักนาทีแล้วลองใหม่"));
  await b.clearIntercepts();

  // ---------- summary (AC-9) ----------
  await b.goto(`${PROJ}/summary`, 1700);
  const s1 = await T();
  const callsBeforeSummary = await calls();
  check("AC-9: the summary lists both ติดอยู่ tasks with their reasons", s1.includes("ย้ายอินเทอร์เน็ต") && s1.includes("รอช่างนัดวัน") && s1.includes("โอนทะเบียนบ้าน") && s1.includes("รอเอกสารจากเจ้าของเดิม"));
  check('AC-9: before any press it says ยังไม่มีสรุป กด "สรุปใหม่"', s1.includes('ยังไม่มีสรุป กด "สรุปใหม่"'));
  check("AC-9/AC-11: opening the summary made no gateway call", (await calls()) === callsBeforeSummary);
  await b.shot(`${OUT}summary-empty-1280.png`);
  const c0 = await calls();
  await b.click("สรุปใหม่", "button");
  const got = await waitFor(async () => (await T()).includes("สรุปเมื่อ"), 15000);
  check("สรุปใหม่ → an AI text with สรุปเมื่อ <date time>", got >= 0 && /สรุปเมื่อ \d{1,2} [ก-๙.]+ \d{2}:\d{2}/.test(await T()));
  check("AC-11: that press made exactly 1 gateway call", (await calls()) === c0 + 1);
  await b.shot(`${OUT}summary-1280.png`);
  const stored = (await T());
  await b.goto(`${PROJ}/summary`, 1700);
  check("AC-9: the stored summary is still there after a reload, with no new call", (await T()).includes("สรุปเมื่อ") && (await calls()) === c0 + 1);
  // failure leaves the old summary in place
  mode("hang");
  const t1 = Date.now();
  await b.click("สรุปใหม่", "button");
  const ms2 = await waitFor(async () => (await T()).includes(AI_ERR), 34000);
  check("AC-8: summary press with the gateway hanging → the AI error within 30 s", ms2 >= 0 && Date.now() - t1 <= 30000, `${Date.now() - t1} ms`);
  check("AC-8: …and the earlier summary is still shown", (await T()).includes("สรุปเมื่อ"));
  mode("ok");

  // ---------- an invitee reads the summary (AC-9 as A) ----------
  await b.goto(`${BASE}/`, 800);
  await b.click("ออกจากระบบ", "button");
  await b.sleep(1000);
  await signIn(E("STUB_INVITEE_EMAIL"), E("STUB_INVITEE_PASSWORD"));
  await b.goto(`${PROJ}/summary`, 1700);
  const sa = await T();
  check("AC-9 as an invitee: the same stuck list and the stored summary", sa.includes("รอช่างนัดวัน") && sa.includes("รอเอกสารจากเจ้าของเดิม") && sa.includes("สรุปเมื่อ"));
  await b.goto(PROJ, 1700);
  check("an invitee sees the summary link but no AI task button", (await b.centre("สรุปงาน", "a")) !== null && (await b.centre("ให้ AI ช่วยแตกงาน", "button")) === null);

  // ---------- 390 ----------
  await b.goto(`${BASE}/`, 800);
  await b.click("ออกจากระบบ", "button");
  await b.sleep(1000);
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  await b.size(390, 800);
  await b.goto(`${PROJ}/summary`, 1700);
  await b.shot(`${OUT}summary-390.png`);
  check("390: no sideways page scroll on the summary", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
  await b.goto(PROJ, 1700);
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  await waitFor(async () => (await rows()).length > 0, 8000);
  await b.shot(`${OUT}proposal-390.png`);
  check("390: no sideways page scroll with the proposal open", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
} finally {
  mode("ok");
  b.close();
}
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
