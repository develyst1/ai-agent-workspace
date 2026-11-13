// TEST-001 UI gap cases (QA): AC-14 through the invite screen (existing account, other project) and AC-16 refusal messages on screen
// (empty comment, comment > 2000, task title > 200). Local only: front :4300 → back-pglite :4310. Seed passwords from env, never printed.
import { mkdirSync } from "node:fs";
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300";
const OUT = new URL("./out/TEST-001/gaps/", import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await launch({ width: 1280, height: 900, port: 9391 });
const T = () => b.text(); const has = async (s) => (await T()).includes(s);
const settle = async () => { let last = null, since = Date.now(); const t0 = Date.now(); while (Date.now() - t0 < 20000) { const c = await b.eval(`document.body.innerText + '|' + document.querySelectorAll('[class*=skeleton i]').length`); if (c !== last) { last = c; since = Date.now(); } else if (Date.now() - since > 800 && !/\|[1-9]\d*$/.test(c)) return; await b.sleep(200); } };
const go = async (u) => { await b.goto(u, 300); await settle(); };
const signIn = async (e, p) => { await go(`${BASE}/sign-in`); await b.type("อีเมล", e); await b.type("รหัสผ่าน", p); await b.click("เข้าสู่ระบบ", "button"); await b.sleep(1500); await settle(); };
const signOut = async () => { await go(`${BASE}/`); await b.click("ออกจากระบบ", "button").catch(() => {}); await b.sleep(900); };
const href = (n) => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(n)})?.getAttribute('href') ?? null`);
const res = [];
try {
  await signIn("owner@godplan.test", process.env.GP_SEED_OWNER_PASSWORD);
  const p1 = await href("ย้ายบ้านใหม่"), p2 = await href("งานสวนหลังบ้าน");
  // AC-16 on screen, as owner
  await go(BASE + p1);
  const c = await b.eval(`(() => { const el=[...document.querySelectorAll('button')].find(x=>/\\d+ คอมเมนต์/.test(x.textContent.trim())); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await b.clickAt(c); await b.sleep(1000);
  await b.click("ส่ง", "button"); await b.sleep(600); const e1 = await has("พิมพ์คอมเมนต์ก่อนส่ง");
  await b.type("เขียนคอมเมนต์", "ข".repeat(2001)); await b.click("ส่ง", "button"); await b.sleep(800); const e2 = await has("ยาวเกิน 2000 ตัวอักษร ย่อให้สั้นลงหน่อย");
  await b.shot(OUT + "ac16-comment-too-long.png", { full: false });
  await b.click("ปิดคอมเมนต์", "button").catch(() => {}); await go(BASE + p1);
  await b.type("ชื่องาน", "ค".repeat(201)); await b.click("เพิ่มงาน", "button"); await b.sleep(800); const e3 = await has("ยาวเกิน 200 ตัวอักษร ย่อให้สั้นลงหน่อย");
  await b.shot(OUT + "ac16-title-too-long.png", { full: false });
  res.push({ case: "35/36-ui", ac: "AC-16", actual: `empty msg ${e1}; comment>2000 msg ${e2}; title>200 msg ${e3}`, result: e1 && e2 && e3 ? "PASS" : "FAIL" });
  // AC-14 through the screens: invite link for A on P2, A (signed out) uses existing email + password
  await go(`${BASE}${p2}/members`); await b.type("ชื่อคนที่จะชวน", "ทดสอบ A"); await b.click("สร้างลิงก์เชิญ", "button"); await b.sleep(1000);
  const link = (await b.eval(`document.querySelector('input[readonly]')?.value ?? null`)).replace(/^https?:\/\/[^/]+/, BASE);
  await signOut(); await go(link);
  const hint = await has("เคยมีบัญชีแล้ว ใช้อีเมลกับรหัสผ่านเดิมได้เลย");
  await b.type("อีเมล", "invitee-a@godplan.test"); await b.type("ตั้งรหัสผ่าน", process.env.GP_SEED_A_PASSWORD); await b.click("เข้าร่วม", "button"); await b.sleep(2000); await settle();
  const onP2 = (await b.eval("location.pathname")) === p2;
  await go(`${BASE}/`); const list = await T();
  await b.shot(OUT + "ac14-both-projects.png", { full: false });
  res.push({ case: "32-ui", ac: "AC-14", actual: `hint ${hint}; landed on P2 ${onP2}; list has both ${list.includes("ย้ายบ้านใหม่") && list.includes("งานสวนหลังบ้าน")}`, result: hint && onP2 && list.includes("ย้ายบ้านใหม่") && list.includes("งานสวนหลังบ้าน") ? "PASS" : "FAIL" });
} finally { b.close(); for (const r of res) console.log(JSON.stringify(r)); }
