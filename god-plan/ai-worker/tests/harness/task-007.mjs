// THROWAWAY scenario for TASK-007, run against the front on :4300 and a back on :4310.
//   DATA=real  → the REAL back on PGlite (tests/harness/back-pglite, TASK-011); its seed data
//   DATA=stub  → the SPEC stand-in (tests/harness/front-contract-stub); its seed data
// Sign-in values come from the environment (never from a file):
//   STUB_OWNER_EMAIL STUB_OWNER_PASSWORD STUB_INVITEE_EMAIL STUB_INVITEE_PASSWORD
// Optional BACK_PID: the pid of the back you started; if given, the run ends by stopping it to prove the "network" failure string.
import { mkdirSync } from "node:fs";
import { launch } from "./cdp.mjs";

const DATA = process.env.DATA ?? "real";
const DATASETS = {
  real: { main: "ย้ายบ้านใหม่", other: "งานสวนหลังบ้าน", todo: "จองรถขนของ", reason1: "รอช่างนัดวัน", reason2: "รอเอกสารจากเจ้าของเดิม", drawerTask: "ย้ายอินเทอร์เน็ต", drawerCount: "2 คอมเมนต์" },
  stub: { main: "ปรับปรุงบ้านแม่", other: "งานเลี้ยงปีใหม่", todo: "ซื้อสีทาบ้าน", reason1: "ช่างที่ติดต่อไว้ยังไม่ว่าง", reason2: "รอร้านส่งแบบกันสาดมาให้เลือก", drawerTask: "ซ่อมหลังคารั่ว", drawerCount: "3 คอมเมนต์" },
};
const D = DATASETS[DATA];
const OUT = new URL(`./shots/TASK-007${DATA === "real" ? "-real" : ""}/`, import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const E = (k) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const BASE = "http://localhost:4300";
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`); };
console.log(`data set: ${DATA}`);

const b = await launch({ width: 1280, height: 900 });
try {
  // ---------- 1280 ----------
  await b.size(1280, 900);
  await b.goto(`${BASE}/sign-in`);
  await b.shot(`${OUT}signin-1280.png`);

  // wrong password → the PM's string, stays on /sign-in
  await b.type("อีเมล", E("STUB_OWNER_EMAIL"));
  await b.type("รหัสผ่าน", "not-the-password");
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(800);
  check("wrong password shows the PM string and stays on /sign-in", (await b.text()).includes("อีเมลหรือรหัสผ่านไม่ถูกต้อง") && (await b.url()) === "/sign-in");

  await b.type("รหัสผ่าน", E("STUB_OWNER_PASSWORD"));
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1800);
  check("owner signs in and lands on /", (await b.url()) === "/");
  await b.shot(`${OUT}list-1280.png`);
  const listText = await b.text();
  check("owner sees the new-project form and both projects", listText.includes("สร้างโปรเจกต์") && listText.includes(D.main) && listText.includes(D.other));

  const linkTo = (name) => b.eval(`(() => { const a=[...document.querySelectorAll('a[href^="/projects/"]')].find(x=>x.querySelector('h2')?.textContent.trim()===${JSON.stringify(name)}); if(!a) return null; const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,href:a.getAttribute('href')}; })()`);
  const otherHref = (await linkTo(D.other))?.href;
  const link = await linkTo(D.main);
  if (!link) throw new Error("no project link");
  await b.clickAt(link);
  await b.sleep(1800);
  check("project page opens on /projects/<id>", (await b.url()).startsWith("/projects/"));
  const projPath = await b.url();
  const projUrl = `${BASE}${projPath}`;
  await b.shot(`${OUT}project-1280.png`);
  const t1 = await b.text();
  check("both ติดอยู่ tasks show their reason", t1.includes(D.reason1) && t1.includes(D.reason2));

  // helper: click a button inside the card whose h2 is `title`
  const inCard = async (title, text) => {
    const c = await b.eval(`(() => { const h=[...document.querySelectorAll('h2')].find(x=>x.textContent.trim()===${JSON.stringify(title)}); if(!h) return null;
      let card=h; while(card && !(card.querySelector && [...card.querySelectorAll('button')].some(x=>x.getAttribute('aria-label')==='สถานะ'||x.textContent.trim()===${JSON.stringify(text)}))) card=card.parentElement;
      if(!card) return null; const el=[...card.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)}||x.getAttribute('aria-label')===${JSON.stringify(text)}); if(!el) return null;
      el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    if (!c) throw new Error(`no "${text}" in card "${title}"`);
    await b.clickAt(c);
  };
  const column = (label) => b.eval(`(() => { const sec=[...document.querySelectorAll('section')].find(s=>s.getAttribute('aria-label')===${JSON.stringify(label)}); return sec ? sec.innerText : ''; })()`);

  // AC-2a: ติดอยู่ with an empty reason
  await inCard(D.todo, "สถานะ");
  await b.click("ติดอยู่", "[role=menuitemradio],[role=menuitem]");
  await b.sleep(400);
  check("choosing ติดอยู่ asks for the reason in the same step", (await b.text()).includes("ติดเพราะอะไร"));
  await b.shot(`${OUT}ac2a-reason-form-1280.png`);
  await b.click("บันทึก", "button");
  await b.sleep(500);
  check("AC-2a: empty reason shows ใส่เหตุผลที่ติดก่อน", (await b.text()).includes("ใส่เหตุผลที่ติดก่อน"));
  await b.shot(`${OUT}ac2a-refused-1280.png`);
  await b.goto(projUrl);
  check(`AC-2a: after a reload ${D.todo} is still in ยังไม่เริ่ม`, (await column("ยังไม่เริ่ม")).includes(D.todo));

  // a reason: saved, shown, survives a reload; leaving Stuck drops it (AC-17)
  await inCard(D.todo, "สถานะ");
  await b.click("ติดอยู่", "[role=menuitemradio],[role=menuitem]");
  await b.type("ติดเพราะอะไร", "รอเงินเดือนออก");
  await b.click("บันทึก", "button");
  await b.sleep(900);
  await b.goto(projUrl);
  const stuckCol = await column("ติดอยู่");
  check("reason saved: task is in ติดอยู่ with its reason after a reload", stuckCol.includes(D.todo) && stuckCol.includes("รอเงินเดือนออก"));
  await inCard(D.todo, "สถานะ");
  await b.click("กำลังทำ", "[role=menuitemradio],[role=menuitem]");
  await b.sleep(900);
  check("AC-17: moved out of ติดอยู่, the reason no longer shows", !(await b.text()).includes("รอเงินเดือนออก"));
  await b.goto(projUrl);
  check("AC-17: still gone after a reload", !(await b.text()).includes("รอเงินเดือนออก"));

  // add, rename, delete with confirm
  await b.type("ชื่องาน", "ทดสอบเพิ่มงาน");
  await b.click("เพิ่มงาน", "button");
  await b.sleep(900);
  check("add task: it appears", (await b.text()).includes("ทดสอบเพิ่มงาน"));
  await inCard("ทดสอบเพิ่มงาน", "แก้ชื่องาน");
  await b.type("แก้ชื่องาน", "ทดสอบเปลี่ยนชื่อ");
  await b.click("บันทึก", "button");
  await b.sleep(900);
  const t2 = await b.text();
  check("rename: the new title shows, the old one is gone", t2.includes("ทดสอบเปลี่ยนชื่อ") && !t2.includes("ทดสอบเพิ่มงาน"));
  await inCard("ทดสอบเปลี่ยนชื่อ", "ลบงาน");
  await b.sleep(500);
  check("delete asks the PM's confirm, with the comments warning", (await b.text()).includes('ลบงาน "ทดสอบเปลี่ยนชื่อ" ใช่ไหม ลบแล้วคอมเมนต์ของงานนี้หายไปด้วย'));
  await b.shot(`${OUT}delete-confirm-1280.png`);
  const del = await b.eval(`(() => { const bs=[...document.querySelectorAll('[role=alertdialog] button, [role=dialog] button')].filter(x=>x.textContent.trim()==='ลบงาน'); const el=bs[bs.length-1]; if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  if (!del) throw new Error("no confirm button");
  await b.clickAt(del);
  await b.sleep(1000);
  check("delete: the task is gone", !(await b.text()).includes("ทดสอบเปลี่ยนชื่อ"));
  await b.goto(projUrl);
  check("delete: still gone after a reload", !(await b.text()).includes("ทดสอบเปลี่ยนชื่อ"));

  // drawer opens and closes (the thread itself is TASK-008)
  await b.click(D.drawerCount, "button");
  await b.sleep(900);
  const dr = await b.text();
  check("drawer opens with the heading and the task title", dr.includes("คอมเมนต์") && dr.includes(D.drawerTask));
  await b.shot(`${OUT}drawer-1280.png`, { full: false });
  await b.click("ปิดคอมเมนต์", "button");

  // 404 for a project that does not exist
  await b.goto(`${BASE}/projects/00000000-0000-0000-0000-000000000000`);
  const nf = await b.text();
  check("an unknown project shows ไม่พบหน้านี้ (not the load-failed string)", nf.includes("ไม่พบหน้านี้") && !nf.includes("โหลดหน้านี้ไม่สำเร็จ"));

  // ---------- Q-F3: failure strings, and the form keeps what was typed ----------
  await b.goto(projUrl);
  await b.intercept((req) => (req.method === "PATCH" && /\/api\/tasks\//.test(req.url) ? { status: 403, body: { error: { code: "FORBIDDEN" } } } : null));
  await inCard(D.todo, "สถานะ");
  await b.click("ติดอยู่", "[role=menuitemradio],[role=menuitem]");
  await b.type("ติดเพราะอะไร", "เหตุผลที่พิมพ์ไว้");
  await b.click("บันทึก", "button");
  await b.sleep(700);
  check("Q-F3: a 403 on an action shows คุณไม่มีสิทธิ์ทำรายการนี้", (await b.text()).includes("คุณไม่มีสิทธิ์ทำรายการนี้"));
  check("Q-F3: …and the reason form keeps what was typed", await b.eval(`[...document.querySelectorAll('input')].some(i=>i.value==='เหตุผลที่พิมพ์ไว้')`));
  await b.shot(`${OUT}qf3-403-1280.png`);
  await b.clearIntercepts();
  await b.goto(projUrl);
  await b.intercept((req) => (req.method === "POST" && /\/api\/projects\/[^/]+\/tasks$/.test(req.url) ? { status: 500, body: { error: { code: "INTERNAL" } } } : null));
  await b.type("ชื่องาน", "งานที่พิมพ์ไว้");
  await b.click("เพิ่มงาน", "button");
  await b.sleep(700);
  check("Q-F3: a 500 on save shows บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง", (await b.text()).includes("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง"));
  check("Q-F3: …and the add-task box keeps what was typed", await b.eval(`[...document.querySelectorAll('input')].some(i=>i.value==='งานที่พิมพ์ไว้')`));
  await b.shot(`${OUT}qf3-500-1280.png`);
  await b.clearIntercepts();
  await b.goto(projUrl);
  await b.intercept((req) => (req.method === "GET" && /\/api\/projects\/[^/]+$/.test(req.url) ? { status: 500, body: { error: { code: "INTERNAL" } } } : null));
  await b.goto(projUrl, 1800);
  const ep = await b.text();
  check("Q-F3: a page that cannot load shows โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง (not ไม่พบหน้านี้)", ep.includes("โหลดหน้านี้ไม่สำเร็จ ลองรีเฟรชอีกครั้ง") && !ep.includes("ไม่พบหน้านี้"));
  await b.shot(`${OUT}qf3-load-failed-1280.png`);
  await b.clearIntercepts();

  // ---------- 390 ----------
  await b.size(390, 800);
  await b.goto(`${BASE}/sign-in`, 900);
  await b.shot(`${OUT}signin-390.png`);
  await b.goto(`${BASE}/`);
  await b.shot(`${OUT}list-390.png`);
  check("390: no horizontal page scroll on the list", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
  await b.goto(projUrl, 1800);
  await b.shot(`${OUT}project-390.png`);
  check("390: no horizontal page scroll on the board", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);
  await b.eval(`document.querySelector('section[aria-label="ติดอยู่"]').scrollIntoView({inline:'start',block:'nearest'})`);
  await b.sleep(400);
  await b.shot(`${OUT}project-390-stuck.png`);
  check("390: scrolling the strip still leaves the page itself without sideways scroll", (await b.pageOverflowX()) <= 0, `overflow ${await b.pageOverflowX()}px`);

  // sign out
  await b.size(1280, 900);
  await b.goto(`${BASE}/`);
  await b.click("ออกจากระบบ", "button");
  await b.sleep(1200);
  check("sign out returns to /sign-in", (await b.url()) === "/sign-in");
  await b.goto(`${BASE}/`, 1500);
  check("signed out: / sends the person to /sign-in", (await b.url()) === "/sign-in");

  // ---------- invitee (AC-6: no controls rendered at all) ----------
  await b.type("อีเมล", E("STUB_INVITEE_EMAIL"));
  await b.type("รหัสผ่าน", E("STUB_INVITEE_PASSWORD"));
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1800);
  const inviteeList = await b.text();
  check("invitee sees only the project they are in, and no new-project form", inviteeList.includes(D.main) && !inviteeList.includes(D.other) && !inviteeList.includes("สร้างโปรเจกต์"));
  await b.shot(`${OUT}invitee-list-1280.png`);
  await b.goto(projUrl, 1800);
  const inv = await b.text();
  const controls = await b.eval(`[...document.querySelectorAll('button')].filter(x=>['เพิ่มงาน','แก้ชื่องาน','ลบงาน'].includes(x.textContent.trim())||x.getAttribute('aria-label')==='สถานะ').length`);
  check("AC-6: invitee sees tasks and reasons but 0 add/rename/delete/status controls", inv.includes(D.reason1) && controls === 0, `controls=${controls}`);
  await b.shot(`${OUT}invitee-project-1280.png`);
  await b.goto(`${BASE}${otherHref}`, 1500);
  const hidden = await b.text();
  check("AC-4 (front side): another project's address shows ไม่พบหน้านี้ and none of its content", hidden.includes("ไม่พบหน้านี้") && !hidden.includes(D.other));

  // ---------- the real "network" case: stop the back and try to save ----------
  if (process.env.BACK_PID) {
    await b.goto(`${BASE}/sign-in`, 900);
    await b.type("อีเมล", E("STUB_OWNER_EMAIL"));
    await b.type("รหัสผ่าน", E("STUB_OWNER_PASSWORD"));
    await b.click("เข้าสู่ระบบ", "button");
    await b.sleep(1800);
    await b.goto(projUrl, 1800);
    process.kill(Number(process.env.BACK_PID)); // the back the caller started; nothing is killed by name
    await b.sleep(1200);
    await b.type("ชื่องาน", "งานตอนหลังบ้านดับ");
    await b.click("เพิ่มงาน", "button");
    await b.sleep(1500);
    check("Q-F3: with the back STOPPED, a save shows บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง and keeps the typed title", (await b.text()).includes("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง") && (await b.eval(`[...document.querySelectorAll('input')].some(i=>i.value==='งานตอนหลังบ้านดับ')`)));
    await b.shot(`${OUT}qf3-back-stopped-1280.png`);
  }
} finally {
  b.close();
}
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
