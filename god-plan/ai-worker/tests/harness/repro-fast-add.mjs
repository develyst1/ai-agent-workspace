// QA repro (TEST-001 round 4, case 1b): owner adds 3 tasks in quick succession on the REAL back (about 1 s per save).
// Per add: type the title, press เพิ่มงาน, then 300 ms later record the box value and whether the button is disabled.
// Afterwards reload and count which titles exist. Env as a real-DB round (QA_OWNER_EMAIL/PASSWORD, QA_TAG). Local only.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", E = (k) => process.env[k];
const b = await launch({ width: 1280, height: 900, port: 9431 });
const until = async (p, n = 150) => { for (let i = 0; i < n; i++) { try { if (await p()) return true; } catch {} await b.sleep(200); } return false; };
const settle = async () => { let last = null, same = 0; for (let i = 0; i < 150 && same < 8; i++) { const c = await b.eval(`document.body.innerText + document.querySelectorAll('[class*=skeleton i]').length`); same = c === last ? same + 1 : 0; last = c; await b.sleep(200); } };
try {
  await b.goto(`${BASE}/sign-in`, 300); await settle(); await b.type("อีเมล", E("QA_OWNER_EMAIL")); await b.type("รหัสผ่าน", E("QA_OWNER_PASSWORD")); await b.click("เข้าสู่ระบบ", "button");
  await until(async () => (await b.eval("location.pathname")) === "/"); await settle();
  const name = `QA fast-add${E("QA_TAG")}-${Date.now() % 100000}`; await b.type("ชื่อโปรเจกต์", name); await b.click("สร้างโปรเจกต์", "button");
  const href = () => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(name)})?.getAttribute('href') ?? null`);
  await until(async () => !!(await href())); const P = await href(); await b.goto(BASE + P, 300); await settle();
  const titles = ["ด่วน 1", "ด่วน 2", "ด่วน 3"];
  for (const t of titles) {
    await b.type("ชื่องาน", t); await b.click("เพิ่มงาน", "button"); await b.sleep(300);
    const st = await b.eval(`(() => { const i=document.querySelector('input[placeholder="ชื่องาน"]'); const btn=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='เพิ่มงาน'); return { box: i?.value, inputDisabled: !!i?.disabled, buttonDisabled: !!btn?.disabled || btn?.getAttribute('aria-disabled')==='true' || btn?.hasAttribute('data-disabled') }; })()`);
    console.log(`after pressing for "${t}" +300 ms:`, JSON.stringify(st));
  }
  await b.sleep(8000); await b.goto(BASE + P, 300); await settle();
  const text = await b.text(); console.log("after reload, saved:", JSON.stringify(titles.filter((t) => text.includes(t))), "| error text on page before reload was not captured");
} finally { b.close(); }
