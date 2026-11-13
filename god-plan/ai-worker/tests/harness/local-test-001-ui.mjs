// TEST-001 UI round (QA, Tanya) — local only: front next dev :4300 → back-pglite :4310 → gateway-stub :4399.
// Proves what a person sees and can reach on the painted screen (desktop 1280, phone 375), driven through headless Chrome (cdp.mjs).
// Does NOT prove: real Postgres (TASK-001), live AI wording (D11), a real phone, keyboard/screen reader.
// Run (from god-plan/ai-worker), seed passwords in env, never printed:
//   GP_SEED_OWNER_PASSWORD=… GP_SEED_A_PASSWORD=… GP_SEED_B_PASSWORD=… node tests/harness/local-test-001-ui.mjs <round>
// Synthetic people only. Stand-in mode is switched through gateway-stub/mode.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./cdp.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4300";
const STUB = "http://127.0.0.1:4399";
const round = process.argv[2] || "ui-1";
const OUT = join(HERE, "out", "TEST-001", round);
mkdirSync(OUT, { recursive: true });
const MODE = join(HERE, "gateway-stub", "mode.txt");
const env = (k) => { const v = process.env[k]; if (!v) { console.error("missing " + k); process.exit(2); } return v; };
const TAG = process.env.QA_TAG || ""; // real-DB runs: a suffix so persistent rows never collide
const OWNER = { email: process.env.QA_OWNER_EMAIL || "owner@godplan.test", pw: process.env.QA_OWNER_PASSWORD || env("GP_SEED_OWNER_PASSWORD") };
const A = { email: process.env.QA_A_EMAIL || "invitee-a@godplan.test", pw: env("GP_SEED_A_PASSWORD") };
const B = { email: process.env.QA_B_EMAIL || "invitee-b@godplan.test", pw: env("GP_SEED_B_PASSWORD") };
const C = { email: `c.tester${TAG}@gp.example.test`, pw: "c-tester-pass-01", name: "ทดสอบ C" };
const P1 = process.env.QA_P1 || "ย้ายบ้านใหม่", P2 = process.env.QA_P2 || "งานสวนหลังบ้าน", TODO = "จองรถขนของ", DRAWER_TASK = "ย้ายอินเทอร์เน็ต";
const STR = {
  aiError: "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน", rate: "กดถี่เกินไป รอสักนาทีแล้วลองใหม่",
  linkUsed: "ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์", signedInOther: "ตอนนี้เข้าระบบอยู่ในชื่อคนอื่น ออกจากระบบก่อนแล้วเปิดลิงก์นี้อีกครั้ง",
  notFound: "ไม่พบหน้านี้", reasonEmpty: "ใส่เหตุผลที่ติดก่อน", wrong: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
};
const results = [];
const rec = (id, ac, expected, actual, pass, shot) => {
  const result = pass === null ? "NOT_TESTED" : pass === "ERR" ? "HARNESS_ERROR" : pass ? "PASS" : "FAIL";
  results.push({ id, ac, expected, actual, result, shot });
  console.log(`${String(id).padEnd(5)} ${ac.padEnd(10)} ${result.padEnd(13)} ${actual}`);
};
const setMode = (m) => writeFileSync(MODE, m + "\n");
const calls = async () => (await (await fetch(STUB + "/calls")).json()).count;
const clearCalls = () => fetch(STUB + "/calls", { method: "DELETE" });

const b = await launch({ width: 1280, height: 900, port: 9351 });
const T = () => b.text();
const has = async (s) => (await T()).includes(s);
const local = (u) => (u ? u.replace(/^https?:\/\/[^/]+/, BASE) : u);
const shot = async (name, full = false) => { const f = join(OUT, name); await b.shot(f, { full }); return `out/TEST-001/${round}/${name}`; };
// settle: the page's text stopped changing for 800 ms and no skeleton is on screen (first loads in next dev compile slowly)
async function settle(max = 20000) {
  const t0 = Date.now(); let last = null, since = Date.now();
  while (Date.now() - t0 < max) {
    let cur; try { cur = await b.eval(`[document.body.innerText, document.querySelectorAll('[class*=skeleton i]').length].join('|')`); } catch { cur = null; }
    if (cur !== last) { last = cur; since = Date.now(); } else if (Date.now() - since >= 800 && cur && !/\|[1-9]\d*$/.test(cur)) return Date.now() - t0;
    await b.sleep(200);
  }
  return null;
}
const go = async (url) => { await b.goto(url, 300); return settle(); };
const waitFor = async (pred, ms = 8000, step = 200) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await pred()) return Date.now() - t0; await b.sleep(step); } return null; };
async function signIn(u) {
  await go(`${BASE}/sign-in`);
  await b.type("อีเมล", u.email); await b.type("รหัสผ่าน", u.pw);
  await b.click("เข้าสู่ระบบ", "button");
  await waitFor(async () => (await b.url()) !== "/sign-in" || (await has(STR.wrong)), 8000);
  await settle();
}
async function signOut() { await go(`${BASE}/`); try { await b.click("ออกจากระบบ", "button"); } catch {} await b.sleep(900); }
const projHref = (name) => b.eval(`(() => { const a=[...document.querySelectorAll('a[href^="/projects/"]')].find(x=>x.querySelector('h2')?.textContent.trim()===${JSON.stringify(name)}); return a ? a.getAttribute('href') : null; })()`);
const column = (label) => b.eval(`(() => { const s=[...document.querySelectorAll('section')].find(x=>x.getAttribute('aria-label')===${JSON.stringify(label)}); return s ? s.innerText : ''; })()`);
// a control inside the card whose h2 is `title`; returns centre + hit-test result
async function cardControl(title, matcher) {
  return b.eval(`(() => { const h=[...document.querySelectorAll('h2')].find(x=>x.textContent.trim()===${JSON.stringify(title)}); if(!h) return null;
    const m=${matcher.toString()}; let card=h; while(card && !(card.querySelectorAll && [...card.querySelectorAll('button')].some(m))) card=card.parentElement;
    if(!card) return null; const el=[...card.querySelectorAll('button')].find(m); if(!el) return null; el.scrollIntoView({block:'center',inline:'center'});
    const r=el.getBoundingClientRect(); const x=r.x+r.width/2, y=r.y+r.height/2; const hit=document.elementFromPoint(x,y); return {x,y,hit: !!hit && (hit===el||el.contains(hit))}; })()`);
}
async function clickCard(title, matcher) { const c = await cardControl(title, matcher); if (!c) throw new Error(`no control in card ${title}`); await b.clickAt(c); }
const isStatus = (x) => x.getAttribute("aria-label") === "สถานะ";
const isComments = (x) => /\d+ คอมเมนต์/.test(x.textContent.trim());
async function setStatus(title, label, reason) {
  await clickCard(title, isStatus); await b.click(label, "[role=menuitemradio],[role=menuitem]"); await b.sleep(400);
  if (reason !== undefined) { if (reason) await b.type("ติดเพราะอะไร", reason); await b.click("บันทึก", "button"); }
  await b.sleep(900);
}
async function readonlyUrl() { return local(await b.eval(`document.querySelector('input[readonly]')?.value ?? null`)); }
async function makeInvite(projPath, name) {
  await go(`${BASE}${projPath}/members`); await b.type("ชื่อคนที่จะชวน", name); await b.click("สร้างลิงก์เชิญ", "button"); await b.sleep(1000);
  return readonlyUrl();
}
const step = async (id, ac, fn) => { try { await fn(); } catch (e) { rec(id, ac, "—", `harness error: ${e.message}`.slice(0, 200), "ERR"); try { await b.shot(join(OUT, `err-${id}.png`), { full: false }); } catch {} } };

let P1PATH, P2PATH, QPATH;
try {
  await b.send("Browser.grantPermissions", { origin: BASE, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
  await b.size(1280, 900); setMode("ok"); await clearCalls();

  // ---- owner: case 1 (AC-1)
  await step(1, "AC-1", async () => {
    await signIn(OWNER);
    P1PATH = await projHref(P1); P2PATH = await projHref(P2);
    await b.type("ชื่อโปรเจกต์", `QA ทดสอบ AC-1${TAG}`); await b.click("สร้างโปรเจกต์", "button"); await b.sleep(1500);
    if (!(await b.url()).startsWith("/projects/")) { await go(`${BASE}/`); const h = await projHref(`QA ทดสอบ AC-1${TAG}`); if (h) await go(BASE + h); }
    QPATH = await b.url();
    for (const n of ["งานทดสอบ 1", "งานทดสอบ 2", "งานทดสอบ 3"]) { await b.type("ชื่องาน", n); await b.click("เพิ่มงาน", "button"); await b.sleep(900); }
    await go(BASE + QPATH);
    const todo = await column("ยังไม่เริ่ม");
    const ok = ["งานทดสอบ 1", "งานทดสอบ 2", "งานทดสอบ 3"].every((n) => todo.includes(n));
    await go(`${BASE}/`);
    const listed = await has(`QA ทดสอบ AC-1${TAG}`);
    rec(1, "AC-1", "project listed; 3 tasks in ยังไม่เริ่ม", `listed ${listed}; 3 in todo column ${ok}`, listed && ok, await shot("01-ac1-list.png"));
  });
  // ---- case 4 (AC-2a) empty reason refused, status kept
  await step(4, "AC-2a", async () => {
    await go(BASE + P1PATH);
    await clickCard(TODO, isStatus); await b.click("ติดอยู่", "[role=menuitemradio],[role=menuitem]"); await b.sleep(400);
    await b.click("บันทึก", "button"); await b.sleep(600);
    const msg = await has(STR.reasonEmpty); const s = await shot("04-ac2a-refused.png");
    await go(BASE + P1PATH);
    const kept = (await column("ยังไม่เริ่ม")).includes(TODO);
    rec(4, "AC-2a", "message shown; task stays ยังไม่เริ่ม after reload", `message ${msg}; kept ${kept}`, msg && kept, s);
  });
  // ---- case 3 (AC-2) owner marks Stuck with reason
  await step(3, "AC-2", async () => {
    await setStatus(TODO, "ติดอยู่", "รอผลตรวจ QA");
    await go(BASE + P1PATH);
    const col = await column("ติดอยู่");
    rec("3o", "AC-2", "owner: ติดอยู่ + reason", `in stuck col ${col.includes(TODO)}; reason ${col.includes("รอผลตรวจ QA")}`, col.includes(TODO) && col.includes("รอผลตรวจ QA"), await shot("03-ac2-owner.png"));
  });
  // ---- invite C (AC-3a, case 5) — link made by owner, opened signed-out
  let inviteC;
  await step(5, "AC-3a", async () => {
    await clearCalls();
    inviteC = await makeInvite(P1PATH, C.name);
    await signOut();
    await go(inviteC);
    await b.type("อีเมล", C.email); await b.type("ตั้งรหัสผ่าน", C.pw);
    await b.click("เข้าร่วม", "button"); await waitFor(async () => (await b.url()) === P1PATH, 8000); await settle();
    const onP = (await b.url()) === P1PATH && (await has(DRAWER_TASK));
    rec(5, "AC-3a", "C joins via link, lands on P1 (app sends no mail: no mail key in .env.example — static)", `on P1 ${onP}`, onP, await shot("05-ac3a-joined.png"));
  });
  // ---- case 3 continued: C (invitee) sees Stuck + reason; case 7 (AC-3) A signs in with upper-case email
  await step("3c", "AC-2", async () => {
    const col = await column("ติดอยู่");
    rec("3c", "AC-2", "invitee C sees ติดอยู่ + reason", `${col.includes(TODO) && col.includes("รอผลตรวจ QA")}`, col.includes(TODO) && col.includes("รอผลตรวจ QA"));
  });
  await step(7, "AC-3", async () => {
    await signOut();
    await signIn({ email: A.email.toUpperCase(), pw: A.pw });
    const list = await T(); const href = await projHref(P1);
    await go(BASE + href);
    const col = await column("ติดอยู่");
    const ok = (await b.url()) === P1PATH && col.includes("รอผลตรวจ QA") && col.includes("รอช่างนัดวัน");
    rec(7, "AC-3", "A signs in with upper-case email; sees P1, statuses, blockers", `list has P1 ${list.includes(P1)}; board ok ${ok}`, list.includes(P1) && ok, await shot("07-ac3-A-board.png"));
  });
  // ---- case 13 (AC-6) A: no create/edit/delete controls on screen
  await step(13, "AC-6", async () => {
    const ctl = await b.eval(`(() => { const t=[...document.querySelectorAll('button,a,input')].map(e=>(e.textContent||'').trim()+'|'+(e.getAttribute('aria-label')||'')+'|'+(e.getAttribute('placeholder')||''));
      return ['เพิ่มงาน','สถานะ','แก้ชื่องาน','ลบงาน','ชื่องาน','คนในโปรเจกต์','ให้ AI ช่วยแตกงาน'].filter(w=>t.some(x=>x.split('|').includes(w))); })()`);
    await go(`${BASE}/`);
    const createForm = await b.eval(`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='สร้างโปรเจกต์')`);
    rec(13, "AC-6", "A sees no add/status/rename/delete/members/AI/create-project control", `found [${ctl}]; create-project ${createForm}`, ctl.length === 0 && !createForm, await shot("13-ac6-A-list.png"));
  });
  // ---- case 12 (AC-5) A comments; O and C see name + Bangkok time
  await step(12, "AC-5", async () => {
    await go(BASE + P1PATH);
    await clickCard(DRAWER_TASK, isComments); await b.sleep(900);
    const before = new Date();
    await b.type("เขียนคอมเมนต์", "ความเห็นทดสอบจาก A"); await b.click("ส่ง", "button"); await b.sleep(1200);
    const bkk = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false }).format(before);
    const checkAs = async (u) => { await signOut(); await signIn(u); await go(BASE + P1PATH); await clickCard(DRAWER_TASK, isComments); await b.sleep(1000);
      return b.eval(`(() => { const li=[...document.querySelectorAll('[role=dialog] li')].find(x=>x.innerText.includes('ความเห็นทดสอบจาก A')); return li ? li.innerText : null; })()`); };
    const asO = await checkAs(OWNER); const sO = await shot("12-ac5-owner-thread.png");
    const asC = await checkAs(C);
    const ok = (t) => !!t && t.includes("สมศรี ทดสอบ") && t.includes(bkk);
    rec(12, "AC-5", `O and C see it with A's name and ${bkk} (Asia/Bangkok)`, `O: ${JSON.stringify(asO)} · C: ${ok(asC)}`, ok(asO) && ok(asC), sO);
  });
  // ---- case 37 (AC-16) HTML shows as text (as C)
  await step(37, "AC-16", async () => {
    await b.type("เขียนคอมเมนต์", "<script>window.__x=1</script><b>QA</b>"); await b.click("ส่ง", "button"); await b.sleep(1200);
    const txt = await has("<script>window.__x=1</script><b>QA</b>");
    const bold = await b.eval(`document.querySelectorAll('[role=dialog] b').length`); const ran = await b.eval(`window.__x===1`);
    rec(37, "AC-16", "literal text; no <b>, script not run", `text shown ${txt}; <b> ${bold}; script ran ${ran}`, txt && bold === 0 && !ran, await shot("37-ac16-html.png"));
    await b.click("ปิดคอมเมนต์", "button").catch(() => {});
  });
  // ---- case 8/9 (AC-4) B
  await step(8, "AC-4", async () => {
    await signOut(); await signIn(B);
    const t = await T();
    rec(8, "AC-4", "B's list has no P1", `P1 in list ${t.includes(P1)}`, !t.includes(P1), await shot("08-ac4-B-list.png"));
    await go(BASE + P1PATH); const d = await T();
    const leak = [P1, DRAWER_TASK, TODO, "รอช่างนัดวัน"].filter((w) => d.includes(w));
    rec(9, "AC-4", "direct address: Thai not-found, nothing of P1", `not-found ${d.includes(STR.notFound)}; leaked [${leak}]`, d.includes(STR.notFound) && leak.length === 0, await shot("09-ac4-B-direct.png"));
    await go(BASE + P1PATH + "/summary"); const s = await T();
    rec("9s", "AC-4", "summary address: nothing of P1", `not-found ${s.includes(STR.notFound)}; leaks ${[P1, "รอช่างนัดวัน"].filter((w) => s.includes(w))}`, s.includes(STR.notFound) && !s.includes(P1) && !s.includes("รอช่างนัดวัน"));
  });
  // ---- case 11 signed out; case 41 (D6) unknown address Thai
  await step(11, "AC-4", async () => {
    await signOut(); await go(BASE + P1PATH);
    const t = await T(); const url = await b.url();
    rec(11, "AC-4", "signed out → sign-in page, nothing of P1", `url ${url}; P1 shown ${t.includes(P1)}`, !t.includes(P1) && !t.includes(DRAWER_TASK), await shot("11-signed-out.png"));
    await go(`${BASE}/no-such-page-qa`); const n = await T();
    const english = /[A-Za-z]{4,}/.test(n.replace(/AI/g, ""));
    rec(41, "D6", "Thai 404, no English words", `not-found ${n.includes(STR.notFound)}; text ${JSON.stringify(n.slice(0, 80))}`, n.includes(STR.notFound) && !english, await shot("41-d6-404.png"));
  });
  // ---- case 31 (AC-18) signed in as A opens a fresh link for A4; then A4 uses it
  await step(31, "AC-18", async () => {
    await signIn(OWNER); const l = await makeInvite(P2PATH, "ทดสอบ A4");
    await signOut(); await signIn(A); await go(l);
    const msg = await has(STR.signedInOther); const s = await shot("31-ac18.png");
    await signOut(); await go(l);
    await b.type("อีเมล", `a4.tester${TAG}@gp.example.test`); await b.type("ตั้งรหัสผ่าน", "a4-tester-pass1"); await b.click("เข้าร่วม", "button");
    await waitFor(async () => (await b.url()) === P2PATH, 8000);
    rec(31, "AC-18", "A sees signed-in-as-other message; link still works for A4", `message ${msg}; A4 joined ${(await b.url()) === P2PATH}`, msg && (await b.url()) === P2PATH, s);
    await signOut(); await go(l);
    rec(28, "AC-13", "used link → link message", `${await has(STR.linkUsed)}`, await has(STR.linkUsed), await shot("28-ac13-used.png"));
  });
  // ---- case 39 (AC-17) owner moves Stuck → กำลังทำ; reason gone for O and A
  await step(39, "AC-17", async () => {
    await signIn(OWNER); await go(BASE + P1PATH);
    await setStatus(TODO, "กำลังทำ");
    await go(BASE + P1PATH); const o = await has("รอผลตรวจ QA");
    await signOut(); await signIn(A); await go(BASE + P1PATH); const a = await has("รอผลตรวจ QA");
    rec(39, "AC-17", "reason gone for O and A", `owner sees ${o}; A sees ${a}`, !o && !a);
  });
  // ---- AI: cases 15–18 (AC-7, AC-7a), as owner on P2
  await step(15, "AC-7", async () => {
    await signOut(); await signIn(OWNER); await go(BASE + P2PATH); setMode("ok"); await clearCalls();
    const before = await T();
    await b.click("ให้ AI ช่วยแตกงาน", "button");
    const t = await waitFor(() => has("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)"), 10000);
    const rows = await b.eval(`[...document.querySelectorAll('li input[aria-label="ชื่องาน"]')].map(i=>i.value)`);
    const s = await shot("15-ac7-proposal.png", true);
    rec(15, "AC-7", "proposal list shown (owner only), 1 call", `shown after ${t} ms; ${rows.length} rows; calls ${await calls()}`, t !== null && rows.length > 0 && (await calls()) === 1, s);
    globalThis.ROWS = rows;
    // case 17: A opens P2 meanwhile — no proposal
    // (A is a member of P2 from AC-14? not yet: checked via B? — use C? C is not in P2.) A4 is a P2 member: checked below via a second browser.
  });
  await step(16, "AC-7", async () => {
    const rows = globalThis.ROWS;
    // untick the last two, edit the first
    for (const title of rows.slice(-2)) { const c = await b.eval(`(() => { const el=[...document.querySelectorAll('[role=checkbox],input[type=checkbox],label')].find(x=>x.getAttribute('aria-label')===${JSON.stringify(title)}); if(!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`); if (!c) throw new Error("no checkbox " + title); await b.clickAt(c); }
    await b.eval(`(() => { const i=document.querySelector('li input[aria-label="ชื่องาน"]'); i.focus(); i.select(); })()`);
    await b.send("Input.insertText", { text: "งานแก้ชื่อโดยเจ้าของ" }); await b.sleep(300);
    const expected = ["งานแก้ชื่อโดยเจ้าของ", ...rows.slice(1, -2)];
    await b.click("บันทึกงานที่เลือก", "button"); await b.sleep(1500);
    await go(BASE + P2PATH); const todo = await column("ยังไม่เริ่ม");
    const added = expected.filter((x) => todo.includes(x)); const leaked = rows.slice(-2).filter((x) => todo.includes(x)).concat(todo.includes(rows[0]) ? [rows[0]] : []);
    rec(16, "AC-7", "exactly ticked items (with edit) added as ยังไม่เริ่ม", `added ${added.length}/${expected.length}; unticked/old present [${leaked}]`, added.length === expected.length && leaked.length === 0, await shot("16-ac7-saved.png", true));
  });
  await step(18, "AC-7a", async () => {
    await clearCalls(); const before = await column("ยังไม่เริ่ม");
    await b.click("ให้ AI ช่วยแตกงาน", "button"); await waitFor(() => has("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)"), 10000);
    await go(`${BASE}/`); await go(BASE + P2PATH);
    const after = await column("ยังไม่เริ่ม"); const panel = await has("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)");
    rec(18, "AC-7a", "leave unsaved → nothing added; proposal gone", `todo same ${before === after}; panel after return ${panel}`, before === after && !panel);
  });
  await step(17, "AC-7", async () => {
    // owner opens a proposal, then a second browser signed in as A4 (P2 member) looks at P2
    await b.click("ให้ AI ช่วยแตกงาน", "button"); await waitFor(() => has("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)"), 10000);
    const props = await b.eval(`[...document.querySelectorAll('li input[aria-label="ชื่องาน"]')].map(i=>i.value)`);
    const b2 = await launch({ width: 1280, height: 900, port: 9352 });
    try {
      await b2.goto(`${BASE}/sign-in`, 1500); await b2.type("อีเมล", `a4.tester${TAG}@gp.example.test`); await b2.type("รหัสผ่าน", "a4-tester-pass1"); await b2.click("เข้าสู่ระบบ", "button"); await b2.sleep(2000);
      await b2.goto(BASE + P2PATH, 1800); const t = await b2.text();
      const seen = props.filter((p) => t.includes(p) && !(globalThis.ROWS || []).slice(1, -2).includes(p) && p !== "งานแก้ชื่อโดยเจ้าของ");
      rec(17, "AC-7", "invitee never sees the unsaved proposal", `proposal heading ${t.includes("งานที่ AI เสนอ")}; unsaved titles seen [${seen}]`, !t.includes("งานที่ AI เสนอ") && seen.length === 0);
    } finally { b2.close(); }
    await b.click("ยกเลิก", "button").catch(() => {});
  });
  // ---- AC-8 on screen: 500, empty, malformed, hang; and gateway down (case 19, done by run script)
  for (const [id, mode] of [[20, "500"], ["22a", "empty"], ["22b", "malformed"], [21, "hang"]]) {
    await step(id, "AC-8", async () => {
      setMode(mode); await go(BASE + P2PATH); const before = await column("ยังไม่เริ่ม");
      const t0 = Date.now(); await b.click("ให้ AI ช่วยแตกงาน", "button");
      const t = await waitFor(() => has(STR.aiError), 35000, 250); const s = await shot(`${id}-ac8-${mode}-tasks.png`);
      if (t === null) console.log(`      ${id}: no error by 35 s; AI button now "${await b.eval(`[...document.querySelectorAll('button')].map(x=>x.textContent.trim()).find(x=>x.includes('AI'))`)}"; rate/busy text ${await has(STR.rate)}/${await has("AI กำลังทำงานให้โปรเจกต์นี้อยู่")}; url ${await b.url()}`);
      await go(BASE + P2PATH); const after = await column("ยังไม่เริ่ม");
      await go(BASE + P1PATH + "/summary"); const sb = await T();
      await b.click("สรุปใหม่", "button"); const t2 = await waitFor(() => has(STR.aiError), 35000, 250);
      await go(BASE + P1PATH + "/summary"); const sa = await T();
      rec(id, "AC-8", `${mode}: error text ≤ 30 s on both; nothing changes`, `G1 ${t} ms · S2 ${t2} ms · tasks same ${before === after} · summary same ${sb === sa}`, t !== null && t <= 30000 && t2 !== null && t2 <= 30000 && before === after && sb === sa, s);
    });
  }
  setMode("ok");
  // ---- AC-9 (cases 23/24) as A: open = 0 calls; press = 1; owner sees stored one
  await step(23, "AC-9", async () => {
    await signOut(); await signIn(A); await clearCalls();
    await go(BASE + P1PATH + "/summary"); const t = await T(); const c0 = await calls();
    const ok = t.includes("รอช่างนัดวัน") && t.includes("รอเอกสารจากเจ้าของเดิม");
    rec(23, "AC-9", "A opens summary: both Stuck tasks + reasons listed; 0 calls", `listed ${ok}; calls ${c0}`, ok && c0 === 0, await shot("23-ac9-open.png", true));
    await b.click("สรุปใหม่", "button"); const w = await waitFor(async () => (await T()).includes("สรุปเมื่อ"), 10000); await b.sleep(500);
    const after = await T(); const c1 = await calls();
    const stamp = (after.match(/สรุปเมื่อ [^\n]+/) || [""])[0];
    await signOut(); await signIn(OWNER); await clearCalls(); await go(BASE + P1PATH + "/summary"); const o = await T(); const c2 = await calls();
    rec(24, "AC-9", "A press → 1 call, new time; O sees same stored summary, 0 calls", `A calls ${c1}; stamp "${stamp}"; owner sees stamp ${o.includes(stamp)}; owner calls ${c2}`, c1 === 1 && !!stamp && o.includes(stamp) && c2 === 0, await shot("24-ac9-owner.png", true));
  });
  // ---- case 26 (D1) rate limit message on screen
  await step(26, "AC-11/D1", async () => {
    await b.sleep(61000); await clearCalls(); await go(BASE + P1PATH + "/summary");
    let shown = false; let presses = 0;
    for (let i = 0; i < 13 && !shown; i++) { await b.click("สรุปใหม่", "button"); presses++; await waitFor(async () => !(await has("AI กำลังคิด…")), 8000, 150); shown = await has(STR.rate); }
    rec(26, "AC-11/D1", "after 10 presses in a minute the Thai rate message shows; calls ≤ 10", `presses ${presses}; message ${shown}; calls ${await calls()}`, shown && (await calls()) <= 10, await shot("26-d1-rate.png"));
  });
  // ---- case 33 (AC-15) reset C through the screens
  await step(33, "AC-15", async () => {
    await go(`${BASE}${P1PATH}/members`);
    const rc = await b.eval(`(() => { const li=[...document.querySelectorAll('li')].find(x=>x.innerText.includes(${JSON.stringify(C.name)})&&x.innerText.includes('สร้างลิงก์ตั้งรหัสผ่านใหม่')); if(!li) return null; const el=[...li.querySelectorAll('button')].find(x=>x.textContent.trim()==='สร้างลิงก์ตั้งรหัสผ่านใหม่'); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    if (!rc) throw new Error("no reset button for C");
    await b.clickAt(rc); await b.sleep(1000);
    const url = local(await b.eval(`[...document.querySelectorAll('li input[readonly]')][0]?.value ?? null`));
    await signOut(); await go(url); await b.type("รหัสผ่านใหม่", "c-tester-pass-02"); await b.click("บันทึกรหัสผ่าน", "button"); await b.sleep(1200);
    const done = await has("เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย");
    await signIn(C); const oldFails = (await b.url()) === "/sign-in" && (await has(STR.wrong));
    await signIn({ email: C.email, pw: "c-tester-pass-02" }); const newWorks = (await b.url()) === "/";
    rec(33, "AC-15", "reset via screens; old password fails; new works", `done msg ${done}; old fails ${oldFails}; new works ${newWorks}`, done && oldFails && newWorks, await shot("33-ac15.png"));
  });
  // ---- case 43: phone 375 — board, thread, summary, members, invite; overflow + hit-test
  await step(43, "all/375", async () => {
    await b.size(375, 812); await signOut(); await signIn(OWNER);
    const out = [];
    await go(BASE + P1PATH);
    const ox = await b.pageOverflowX();
    const board = await b.eval(`(() => { const s=[...document.querySelectorAll('section')].find(x=>x.getAttribute('aria-label')==='ติดอยู่'); if(!s) return null; let p=s.parentElement; while(p && getComputedStyle(p).overflowX==='visible') p=p.parentElement; return p ? {ox:getComputedStyle(p).overflowX, sw:p.scrollWidth, cw:p.clientWidth} : null; })()`);
    const st = await cardControl("รอช่างนัดวัน" ? DRAWER_TASK : DRAWER_TASK, isStatus); const cm = await cardControl(DRAWER_TASK, isComments);
    out.push(`board page overflowX ${ox}; columns container ${JSON.stringify(board)}; status hit ${st?.hit}; comments hit ${cm?.hit}`);
    const s1 = await shot("43-375-board.png");
    if (cm) { await b.clickAt(cm); await b.sleep(900); }
    const send = await b.centre("ส่ง", "button"); const sendHit = send ? await b.eval(`(()=>{const e=document.elementFromPoint(${send.x},${send.y}); return !!e && (e.closest('button')?.textContent.trim()==='ส่ง');})()`) : false;
    out.push(`thread send hit ${sendHit}`); await shot("43-375-thread.png");
    await go(BASE + P1PATH + "/summary"); const ox2 = await b.pageOverflowX(); await shot("43-375-summary.png", true);
    await go(BASE + P1PATH + "/members"); const ox3 = await b.pageOverflowX(); await shot("43-375-members.png", true);
    await go(BASE + P2PATH); const ai = await b.centre("ให้ AI ช่วยแตกงาน", "button"); const aiHit = ai ? await b.eval(`(()=>{const e=document.elementFromPoint(${ai.x},${ai.y}); return !!e && !!e.closest('button');})()`) : false;
    out.push(`summary ox ${ox2}; members ox ${ox3}; AI button hit ${aiHit}`);
    const pass = ox <= 0 && ox2 <= 0 && ox3 <= 0 && st?.hit && cm?.hit && sendHit && aiHit && board && (board.ox === "auto" || board.ox === "scroll" || board.sw <= board.cw);
    rec(43, "all/375", "no page side-scroll; columns swipe in own container; key controls hittable", out.join(" · "), !!pass, s1);
    await b.size(1280, 900);
  });
} finally {
  setMode("ok");
  b.close();
  writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 1));
  const n = (r) => results.filter((x) => x.result === r).length;
  console.log(`PASS ${n("PASS")} · FAIL ${n("FAIL")} · NOT_TESTED ${n("NOT_TESTED")} · HARNESS_ERROR ${n("HARNESS_ERROR")}`);
}
