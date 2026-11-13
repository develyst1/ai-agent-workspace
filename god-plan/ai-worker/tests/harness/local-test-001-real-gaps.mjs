// TEST-001 on the REAL god_plan back (QA, Tanya): the UI cases that the fixed-sleep ui harness could not judge at real-DB latency
// (about 1 s per call). Every step waits for its own visible result (no fixed sleeps as proof). UTC timestamps per case, to set beside
// timer-stall-detector.mjs (Q-F6). Synthetic people, tag QA_TAG. Front :4300 → real back :4310 → gateway-stub :4399.
// Cases: 1 (AC-1 add 3 tasks), 7 (AC-3 upper-case sign-in on screen), 5/3c (AC-3a invite C, C sees Stuck), 12 (AC-5), 37 (AC-16),
// 31/28 (AC-18, AC-13 used link), 33 (AC-15 reset). Run with the env of a real-DB round (see TEST-001 §Round 4).
import { mkdirSync, writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300";
const E = (k) => { const v = process.env[k]; if (!v) { console.error("missing " + k); process.exit(2); } return v; };
const TAG = E("QA_TAG"), round = process.argv[2] || "real-gaps";
const OUT = new URL(`./out/TEST-001/${round}/`, import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const OWNER = { email: E("QA_OWNER_EMAIL"), pw: E("QA_OWNER_PASSWORD") }, A = { email: E("QA_A_EMAIL"), pw: E("GP_SEED_A_PASSWORD") };
const C = { email: `c2.tester${TAG}@gp.example.test`, pw: "c2-tester-pass-01", name: "ทดสอบ C2" };
const P1 = E("QA_P1"), TODO = "จองรถขนของ", DRAWER = "ย้ายอินเทอร์เน็ต";
const iso = () => new Date().toISOString().slice(11, 19);
const res = []; const rec = (id, ac, ok, actual, s0) => { const r = { id, ac, result: ok ? "PASS" : "FAIL", actual, utc: `${s0}→${iso()}` }; res.push(r); console.log(JSON.stringify(r)); };
const b = await launch({ width: 1280, height: 900, port: 9421 });
const T = () => b.text(); const has = async (s) => (await T()).includes(s);
// counts polls, not wall time: a machine freeze (OBS-2) must not use up a wait
const until = async (pred, ms = 20000) => { const t0 = Date.now(); for (let i = 0; i < ms / 200; i++) { try { if (await pred()) return Date.now() - t0; } catch {} await b.sleep(200); } return null; };
const settle = async () => { let last = null, same = 0; for (let i = 0; i < 150; i++) { const c = await b.eval(`document.body.innerText + '|' + document.querySelectorAll('[class*=skeleton i]').length`); if (c !== last) { last = c; same = 0; } else if (++same >= 6 && !/\|[1-9]\d*$/.test(c)) return; await b.sleep(250); } }; // counts polls (OBS-2)
const go = async (u) => { await b.goto(u, 300); await settle(); };
// DEF-2 (round 4): a sign-in can fail with "บันทึกไม่สำเร็จ" (back 500 INTERNAL). Every such failure is LOGGED with its UTC time, then
// retried at most twice, so the other ACs can still be judged. The failures are evidence for DEF-2, never hidden.
const signInFailures = [];
const signIn = async (u) => { for (let attempt = 1; attempt <= 3; attempt++) {
  await go(`${BASE}/sign-in`); await b.type("อีเมล", u.email); await b.type("รหัสผ่าน", u.pw); await b.click("เข้าสู่ระบบ", "button");
  await until(async () => (await b.url()) !== "/sign-in" || (await has("อีเมลหรือรหัสผ่านไม่ถูกต้อง")) || (await has("บันทึกไม่สำเร็จ")), 30000); await settle();
  if ((await b.url()) === "/sign-in" && (await has("บันทึกไม่สำเร็จ"))) { signInFailures.push(iso()); console.log(JSON.stringify({ signInFailed: iso(), attempt })); continue; }
  return; } };
const signOut = async () => { await go(`${BASE}/`); await b.click("ออกจากระบบ", "button").catch(() => {}); await until(async () => (await b.url()) === "/sign-in", 15000); };
const href = (n) => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(n)})?.getAttribute('href') ?? null`);
const column = (l) => b.eval(`(() => { const s=[...document.querySelectorAll('section')].find(x=>x.getAttribute('aria-label')===${JSON.stringify(l)}); return s ? s.innerText : ''; })()`);
const cardBtn = async (title, re) => { const c = await b.eval(`(() => { const h=[...document.querySelectorAll('h2')].find(x=>x.textContent.trim()===${JSON.stringify(title)}); if(!h) return null;
  let card=h; const m=(x)=>${re}.test(x.textContent.trim()); while(card && !(card.querySelectorAll && [...card.querySelectorAll('button')].some(m))) card=card.parentElement; if(!card) return null;
  const el=[...card.querySelectorAll('button')].find(m); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`); if (!c) throw new Error("no button in " + title); await b.clickAt(c); };
const readonly = async () => (await b.eval(`document.querySelector('input[readonly]')?.value ?? null`))?.replace(/^https?:\/\/[^/]+/, BASE) ?? null;
let P1PATH;
try {
  // ---- case 1: AC-1 — add 3 tasks, each waited until it is on the board
  let s0 = iso(); await signIn(OWNER); P1PATH = await href(P1);
  await until(async () => await b.eval(`[...document.querySelectorAll('label')].some(l=>l.textContent.trim()==='ชื่อโปรเจกต์')`), 150);
  const name = `QA AC-1 real${TAG}-${Date.now() % 100000}`; await b.type("ชื่อโปรเจกต์", name); await b.click("สร้างโปรเจกต์", "button");
  // creating a project stays on the list (by design); open it from the list by its unique name
  await until(async () => !!(await href(name)), 30000); const QPh = await href(name); await go(BASE + QPh); const QP = await b.url();
  await until(async () => await b.eval(`!!document.querySelector('input[placeholder="ชื่องาน"]')`), 30000);
  for (const n of ["งานจริง 1", "งานจริง 2", "งานจริง 3"]) { await b.type("ชื่องาน", n); await b.click("เพิ่มงาน", "button"); await until(async () => (await column("ยังไม่เริ่ม")).includes(n), 20000); }
  await go(BASE + QP); const todo = await column("ยังไม่เริ่ม");
  rec(1, "AC-1", ["งานจริง 1", "งานจริง 2", "งานจริง 3"].every((n) => todo.includes(n)), `todo column after reload: ${JSON.stringify(todo.slice(0, 120))}`, s0);
  // ---- case 1b: the same with a person's pace — add the next task as soon as the box is free (no wait for the board)
  s0 = iso(); for (const n of ["เร็ว 1", "เร็ว 2", "เร็ว 3"]) { await until(async () => await b.eval(`!document.querySelector('input[placeholder="ชื่องาน"]')?.disabled`), 20000); await b.type("ชื่องาน", n); await b.click("เพิ่มงาน", "button"); await b.sleep(300); }
  await b.sleep(6000); await go(BASE + QP); const todo2 = await column("ยังไม่เริ่ม"); const got = ["เร็ว 1", "เร็ว 2", "เร็ว 3"].filter((n) => todo2.includes(n));
  await b.shot(OUT + "1b-fast-adds.png", { full: true });
  rec("1b", "AC-1", got.length === 3, `quick successive adds kept ${got.length}/3: [${got}]`, s0);
  // ---- case 5 / 3c: invite C to P1, C joins signed out, sees Stuck + reason
  s0 = iso(); await go(`${BASE}${P1PATH}/members`); await b.type("ชื่อคนที่จะชวน", C.name); await b.click("สร้างลิงก์เชิญ", "button");
  await until(async () => !!(await readonly()), 20000); const inv = await readonly();
  await signOut(); await go(inv); await b.type("อีเมล", C.email); await b.type("ตั้งรหัสผ่าน", C.pw); await b.click("เข้าร่วม", "button");
  await until(async () => (await b.url()) === P1PATH, 30000); await settle();
  const st = await column("ติดอยู่");
  rec(5, "AC-3a/AC-2", (await b.url()) === P1PATH && st.includes("รอช่างนัดวัน"), `C on P1 ${(await b.url()) === P1PATH}; C sees Stuck + reason ${st.includes("รอช่างนัดวัน")}`, s0);
  // ---- case 7: A signs in on screen with the upper-case email
  s0 = iso(); await signOut(); await signIn({ email: A.email.toUpperCase(), pw: A.pw }); const u7 = await b.url(); const txt7 = await T();
  await b.shot(OUT + "07-upper-signin.png", { full: false });
  rec(7, "AC-3", u7 === "/" && txt7.includes(P1), `url ${u7}; P1 listed ${txt7.includes(P1)}; error text ${txt7.includes("บันทึกไม่สำเร็จ")}`, s0);
  // ---- case 12: A comments; owner and C see it with A's name
  s0 = iso(); await go(BASE + P1PATH); await cardBtn(DRAWER, /\d+ คอมเมนต์/); await until(() => has("เขียนคอมเมนต์"), 10000).catch(() => {});
  await until(async () => await b.eval(`!!document.querySelector('textarea, input[placeholder="เขียนคอมเมนต์"]')`), 15000);
  await b.type("เขียนคอมเมนต์", `ความเห็นจริงจาก A${TAG}`); await b.click("ส่ง", "button"); await until(() => has(`ความเห็นจริงจาก A${TAG}`), 20000);
  const seenBy = async (u) => { await signOut(); await signIn(u); await go(BASE + P1PATH); await cardBtn(DRAWER, /\d+ คอมเมนต์/);
    await until(() => has(`ความเห็นจริงจาก A${TAG}`), 20000); return b.eval(`(() => { const li=[...document.querySelectorAll('[role=dialog] li')].find(x=>x.innerText.includes(${JSON.stringify(`ความเห็นจริงจาก A${TAG}`)})); return li ? li.innerText : null; })()`); };
  const o12 = await seenBy(OWNER); const c12 = await seenBy(C);
  rec(12, "AC-5", !!o12 && o12.includes("สมศรี ทดสอบ") && !!c12 && c12.includes("สมศรี ทดสอบ"), `owner ${JSON.stringify(o12)}; C ok ${!!c12 && c12.includes("สมศรี ทดสอบ")}`, s0);
  // ---- case 37: HTML as C
  s0 = iso(); const html = `<script>window.__x=1</script><b>QA${TAG}</b>`; await b.type("เขียนคอมเมนต์", html); await b.click("ส่ง", "button"); await until(() => has(html), 20000);
  const bold = await b.eval(`document.querySelectorAll('[role=dialog] b').length`), ran = await b.eval(`window.__x===1`);
  rec(37, "AC-16", (await has(html)) && bold === 0 && !ran, `literal ${await has(html)}; <b> ${bold}; script ran ${ran}`, s0);
  await b.click("ปิดคอมเมนต์", "button").catch(() => {});
  // ---- case 31 / 28: A signed in opens a fresh link; then A5 uses it; then reuse refused
  s0 = iso(); await signOut(); await signIn(OWNER); await go(`${BASE}${P1PATH}/members`); await b.type("ชื่อคนที่จะชวน", "ทดสอบ A5"); await b.click("สร้างลิงก์เชิญ", "button");
  await until(async () => !!(await readonly()), 20000); const l5 = await readonly();
  await signOut(); await signIn(A); await go(l5); const m31 = await has("ตอนนี้เข้าระบบอยู่ในชื่อคนอื่น ออกจากระบบก่อนแล้วเปิดลิงก์นี้อีกครั้ง");
  await signOut(); await go(l5); await b.type("อีเมล", `a5.tester${TAG}@gp.example.test`); await b.type("ตั้งรหัสผ่าน", "a5-tester-pass1"); await b.click("เข้าร่วม", "button");
  await until(async () => (await b.url()) === P1PATH, 30000); const j31 = (await b.url()) === P1PATH;
  rec(31, "AC-18", m31 && j31, `signed-in message ${m31}; A5 joined ${j31}`, s0);
  s0 = iso(); await signOut(); await go(l5); const used = await has("ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์");
  rec(28, "AC-13", used, `used link message ${used}`, s0);
  // ---- case 33: reset C via screens
  s0 = iso(); await signIn(OWNER); await go(`${BASE}${P1PATH}/members`);
  const rc = await b.eval(`(() => { const li=[...document.querySelectorAll('li')].find(x=>x.innerText.includes(${JSON.stringify(C.name)})&&x.innerText.includes('สร้างลิงก์ตั้งรหัสผ่านใหม่')); if(!li) return null; const el=[...li.querySelectorAll('button')].find(x=>x.textContent.trim()==='สร้างลิงก์ตั้งรหัสผ่านใหม่'); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await b.clickAt(rc); await until(async () => !!(await b.eval(`[...document.querySelectorAll('li input[readonly]')][0]?.value ?? null`)), 20000);
  const ru = (await b.eval(`[...document.querySelectorAll('li input[readonly]')][0]?.value`)).replace(/^https?:\/\/[^/]+/, BASE);
  await signOut(); await go(ru); await b.type("รหัสผ่านใหม่", "c2-tester-pass-02"); await b.click("บันทึกรหัสผ่าน", "button"); await until(() => has("เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย"), 20000);
  const done = await has("เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย");
  await signIn(C); const oldFails = (await b.url()) === "/sign-in" && (await has("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
  await signIn({ email: C.email, pw: "c2-tester-pass-02" }); const newOk = (await b.url()) === "/";
  rec(33, "AC-15", done && oldFails && newOk, `done ${done}; old fails ${oldFails}; new works ${newOk}`, s0);
} catch (e) { console.log(JSON.stringify({ harnessError: e.message.slice(0, 200), at: iso() })); await b.shot(OUT + "err.png", { full: false }).catch(() => {}); }
finally { b.close(); console.log(JSON.stringify({ signInFailures })); writeFileSync(OUT + "results.json", JSON.stringify({ res, signInFailures }, null, 1)); }
