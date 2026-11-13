// THROWAWAY scenario for TASK-008 (comments, members, invite, reset). Front on :4300; the back on :4310 is whatever is running
// there (the SPEC stand-in `front-contract-stub`, or the real back from TASK-011 once it can seed the same synthetic data).
//   STUB_OWNER_EMAIL=… STUB_OWNER_PASSWORD=… STUB_INVITEE_EMAIL=… STUB_INVITEE_PASSWORD=… node tests/harness/task-008.mjs
import { mkdirSync } from "node:fs";
import { launch } from "./cdp.mjs";

const OUT = new URL(`./shots/TASK-008${(process.env.DATA ?? "real") === "real" ? "-real" : ""}/`, import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const E = (k) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const BASE = "http://localhost:4300";
// DATA=real → the real back's seed (back-pglite); DATA=stub → the SPEC stand-in's seed. `task` is the one with 2 seeded comments.
const DATA = process.env.DATA ?? "real";
const D = { real: { main: "ย้ายบ้านใหม่", other: "งานสวนหลังบ้าน", task: "ย้ายอินเทอร์เน็ต" }, stub: { main: "ปรับปรุงบ้านแม่", other: "งานเลี้ยงปีใหม่", task: "ซ่อมหลังคารั่ว" } }[DATA];
console.log(`data set: ${DATA}`);
const NEW_EMAIL = "tesa@example.test"; // synthetic person created by the walk
const NEW_PW = "walk-first-pass-1";
const NEW_PW2 = "walk-second-pass-2";
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`); };

const b = await launch({ width: 1280, height: 900, port: 9334 });
const T = () => b.text();
const has = async (s) => (await T()).includes(s);
const signIn = async (email, pw) => {
  await b.goto(`${BASE}/sign-in`, 900);
  await b.type("อีเมล", email);
  await b.type("รหัสผ่าน", pw);
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1600);
};
const signOut = async () => { await b.goto(`${BASE}/`, 1200); await b.click("ออกจากระบบ", "button"); await b.sleep(1000); };
// The back builds links from its FRONT_ORIGIN (127.0.0.1 for the harness); the browser here uses localhost, and a cookie and
// Next's dev server are per host. So the host part is swapped to BASE; the path and token are untouched.
const local = (u) => (u ? u.replace(/^https?:\/\/[^/]+/, BASE) : u);
const readonlyUrl = async () => local(await b.eval(`document.querySelector('input[readonly]')?.value ?? null`));
const clickDialogBtn = async (text) => {
  const c = await b.eval(`(() => { const el=[...document.querySelectorAll('[role=dialog] button')].find(x=>x.textContent.trim()===${JSON.stringify(text)}); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  if (!c) throw new Error(`no dialog button ${text}`);
  await b.clickAt(c);
};

try {
  await b.send("Browser.grantPermissions", { origin: BASE, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
  await b.size(1280, 900);

  // ---------- comments (owner) ----------
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  const projHref = await b.eval(`document.querySelector('a[href^="/projects/"]') && [...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='${D.main}').getAttribute('href')`);
  const PROJ = `${BASE}${projHref}`;
  await b.goto(PROJ, 1600);
  await b.click("2 คอมเมนต์", "button"); // the stuck-roof task has 2 seeded comments
  await b.sleep(900);
  const thread = await T();
  const items = await b.eval(`[...document.querySelectorAll('[role=dialog] li')].map(li => li.innerText)`);
  const timeRe0 = /\d{1,2} [ก-๙.]+ \d{2}:\d{2}/;
  check("thread opens with the 2 seeded comments, each with an author and a Bangkok time", items.length === 2 && items.every((t) => timeRe0.test(t)), `items=${items.length}`);
  console.log("      first comment (synthetic):", JSON.stringify(items[0] ?? ""));
  await b.click("ส่ง", "button");
  await b.sleep(500);
  check("empty comment refused with พิมพ์คอมเมนต์ก่อนส่ง", await has("พิมพ์คอมเมนต์ก่อนส่ง"));
  await b.type("เขียนคอมเมนต์", "ก".repeat(2001));
  await b.click("ส่ง", "button");
  await b.sleep(500);
  check("over 2000 characters refused with the too-long string", await has("ยาวเกิน 2000 ตัวอักษร ย่อให้สั้นลงหน่อย"));
  await b.type("เขียนคอมเมนต์", "<b>hi</b>");
  await b.click("ส่ง", "button");
  await b.sleep(900);
  const afterSend = await T();
  const boldEls = await b.eval(`document.querySelectorAll('[role=dialog] b').length`);
  check("AC-16: <b>hi</b> shows as typed text, not as bold", afterSend.includes("<b>hi</b>") && boldEls === 0, `<b> elements=${boldEls}`);
  check("the count in the drawer went to 3", afterSend.includes("3 คอมเมนต์"));
  await b.shot(`${OUT}thread-1280.png`, { full: false });
  await b.click("ปิดคอมเมนต์", "button");
  await b.sleep(500);
  check("the board's card now says 3 คอมเมนต์", (await T()).includes("3 คอมเมนต์"));

  // ---------- members + invite (owner) ----------
  check("owner sees the link to the members page", await b.centre("คนในโปรเจกต์", "a") !== null);
  await b.goto(`${PROJ}/members`, 1600);
  await b.type("ชื่อคนที่จะชวน", "ทดสอบเอ");
  await b.click("สร้างลิงก์เชิญ", "button");
  await b.sleep(900);
  const invite1 = await readonlyUrl();
  check("making an invite shows its link and the copy button", !!invite1 && invite1.includes("/invite/") && (await has("คัดลอกลิงก์เชิญ")));
  await b.click("คัดลอกลิงก์เชิญ", "button");
  await b.sleep(500);
  check("copying shows คัดลอกแล้ว ส่งให้คนที่เชิญได้เลย", await has("คัดลอกแล้ว ส่งให้คนที่เชิญได้เลย"));
  check("the pending-invites list shows the name", (await has("ลิงก์เชิญที่ยังไม่มีคนใช้")) && (await has("ทดสอบเอ")));
  await b.shot(`${OUT}members-1280.png`);

  // ---------- AC-18: the owner, signed in, opens a fresh link ----------
  await b.goto(invite1, 1400);
  check("AC-18: signed in, the invite page shows the signed-in-as-someone-else message and no form", (await has("ตอนนี้เข้าระบบอยู่ในชื่อคนอื่น ออกจากระบบก่อนแล้วเปิดลิงก์นี้อีกครั้ง")) && !(await has("เข้าร่วม")));
  await b.shot(`${OUT}invite-signed-in-1280.png`, { full: false });

  // ---------- AC-3a: signed out, the same link works ----------
  await signOut();
  await b.goto(invite1, 1400);
  const invText = await T();
  check("invite page: heading names the project, the name is pre-filled, the existing-account hint shows", invText.includes(`ชวนคุณเข้าโปรเจกต์ "${D.main}"`) && invText.includes("เคยมีบัญชีแล้ว ใช้อีเมลกับรหัสผ่านเดิมได้เลย") && (await b.eval(`[...document.querySelectorAll('input')].some(i=>i.value==='ทดสอบเอ')`)));
  console.log("      heading text:", JSON.stringify(invText.split("\n").find((l) => l.includes("ชวนคุณเข้าโปรเจกต์")) ?? ""));
  await b.shot(`${OUT}invite-1280.png`, { full: false });
  await b.type("อีเมล", NEW_EMAIL);
  await b.type("ตั้งรหัสผ่าน", "123");
  await b.click("เข้าร่วม", "button");
  await b.sleep(900);
  check("a short password shows รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร and stays on the invite page", (await has("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")) && (await b.url()).startsWith("/invite/"));
  await b.type("ตั้งรหัสผ่าน", NEW_PW);
  await b.click("เข้าร่วม", "button");
  await b.sleep(2000);
  check("AC-3a: accepting lands on the project and shows its tasks", (await b.url()) === projHref && (await has(D.task)));

  // ---------- AC-5 / AC-16: this person comments; the owner reads it ----------
  await b.click("3 คอมเมนต์", "button");
  await b.sleep(900);
  await b.type("เขียนคอมเมนต์", "<b>hi</b> จากคนที่ถูกเชิญ");
  await b.click("ส่ง", "button");
  await b.sleep(900);
  check("the invited person can comment", await has("<b>hi</b> จากคนที่ถูกเชิญ"));
  await signOut();
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  await b.goto(PROJ, 1600);
  await b.click("4 คอมเมนต์", "button");
  await b.sleep(900);
  const seen = await T();
  const timeRe = /\d{1,2} [ก-๙.]+ \d{2}:\d{2}/;
  check("AC-5: the owner sees that comment with the author's name and a Thai time", seen.includes("<b>hi</b> จากคนที่ถูกเชิญ") && seen.includes("ทดสอบเอ") && timeRe.test(seen));
  check("AC-16: shown literally, no <b> element", (await b.eval(`document.querySelectorAll('[role=dialog] b').length`)) === 0);

  // ---------- AC-13: the used link ----------
  await signOut();
  await b.goto(invite1, 1400);
  check("AC-13: the used link shows the invite-link message", await has("ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์"));
  await b.shot(`${OUT}invite-used-1280.png`, { full: false });

  // ---------- AC-15: reset ----------
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  await b.goto(`${PROJ}/members`, 1600);
  const rc = await b.eval(`(() => { const li=[...document.querySelectorAll('li')].find(x=>x.innerText.includes('ทดสอบเอ')&&x.innerText.includes('สร้างลิงก์ตั้งรหัสผ่านใหม่')); const el=[...li.querySelectorAll('button')].find(x=>x.textContent.trim()==='สร้างลิงก์ตั้งรหัสผ่านใหม่'); el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await b.clickAt(rc);
  await b.sleep(900);
  const resetUrl = local(await b.eval(`[...document.querySelectorAll('li input[readonly]')][0]?.value ?? null`));
  check("making a reset link shows it and คัดลอกแล้ว ส่งให้เจ้าตัวได้เลย", !!resetUrl && resetUrl.includes("/reset/") && (await has("คัดลอกแล้ว ส่งให้เจ้าตัวได้เลย")));
  await signOut();
  await b.goto(resetUrl, 1400);
  await b.shot(`${OUT}reset-1280.png`, { full: false });
  await b.type("รหัสผ่านใหม่", "123");
  await b.click("บันทึกรหัสผ่าน", "button");
  await b.sleep(700);
  check("reset: a short password shows its string", await has("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"));
  await b.type("รหัสผ่านใหม่", NEW_PW2);
  await b.click("บันทึกรหัสผ่าน", "button");
  await b.sleep(900);
  check("reset: shows เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย", await has("เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย"));
  await signIn(NEW_EMAIL, NEW_PW);
  check("AC-15: the old password now fails", (await b.url()) === "/sign-in" && (await has("อีเมลหรือรหัสผ่านไม่ถูกต้อง")));
  await signIn(NEW_EMAIL, NEW_PW2);
  check("AC-15: the new password works", (await b.url()) === "/");
  await signOut();
  await b.goto(resetUrl, 1400);
  check("a used reset link shows the link message", await has("ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์"));

  // ---------- AC-14: an existing account uses a link for another project ----------
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  const p2Href = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='${D.other}').getAttribute('href')`);
  await b.goto(`${BASE}${p2Href}/members`, 1600);
  await b.type("ชื่อคนที่จะชวน", "พี่เอ");
  await b.click("สร้างลิงก์เชิญ", "button");
  await b.sleep(900);
  const invite2 = await readonlyUrl();
  await signOut();
  await b.goto(invite2, 1400);
  await b.type("อีเมล", E("STUB_INVITEE_EMAIL"));
  await b.type("ตั้งรหัสผ่าน", E("STUB_INVITEE_PASSWORD"));
  await b.click("เข้าร่วม", "button");
  await b.sleep(2000);
  check("AC-14: an existing account joins the other project with its old password", (await b.url()) === p2Href);
  await b.goto(`${BASE}/`, 1500);
  const both = await T();
  check("AC-14: the list now shows both projects", both.includes(D.main) && both.includes(D.other));

  // ---------- AC-6: an invitee is not the owner ----------
  await b.goto(`${BASE}${projHref}/members`, 1500);
  check("an invitee opening the members page gets ไม่พบหน้านี้", await has("ไม่พบหน้านี้"));
  await b.goto(PROJ, 1500);
  check("an invitee sees no members link and no add-task box", (await b.centre("คนในโปรเจกต์", "a")) === null && (await b.centre("เพิ่มงาน", "button")) === null);
  await b.click("3 คอมเมนต์", "button").catch(() => {});
  await b.sleep(600);

  // ---------- 390 ----------
  await signOut();
  await b.size(390, 800);
  await b.goto(invite1.replace(/[^/]+$/, "x"), 900); // an unknown token shows the link message
  check("an unknown invite token shows the link message", await has("ลิงก์นี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของโปรเจกต์"));
  await b.shot(`${OUT}invite-used-390.png`);
  await signIn(E("STUB_OWNER_EMAIL"), E("STUB_OWNER_PASSWORD"));
  await b.goto(`${PROJ}/members`, 1500);
  await b.type("ชื่อคนที่จะชวน", "ทดสอบบี");
  await b.click("สร้างลิงก์เชิญ", "button");
  await b.sleep(900);
  await b.shot(`${OUT}members-390.png`);
  check("390: no sideways page scroll on the members page", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
  const invite3 = await readonlyUrl();
  await b.goto(PROJ, 1500);
  await b.click("3 คอมเมนต์", "button").catch(() => {});
  await b.click("4 คอมเมนต์", "button").catch(() => {});
  await b.sleep(900);
  await b.shot(`${OUT}thread-390.png`, { full: false });
  await signOut();
  await b.goto(invite3, 1400);
  await b.shot(`${OUT}invite-390.png`);
  check("390: no sideways page scroll on the invite page", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
} finally {
  b.close();
}
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
