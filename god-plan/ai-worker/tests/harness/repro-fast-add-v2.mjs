// DEF-3 recipe v2 (QA, TEST-001 round 5) — corrected per SA (TASK-019 §Review): v1 typed over its own refused title.
// What a person does: press เพิ่มงาน for title N, and while it is still saving (about 1 s on the real back) type title N+1.
// Rule under test (PM-decided 2026-11-09): what a person typed is never lost silently.
// Per title: type → press → +200 ms type the NEXT title into the box (the only typing) → record the box right then, and again after the
// previous save has landed on the board → press add for it. End: reload, all titles must exist. Real back; env as a real-DB round.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", E = (k) => process.env[k];
const b = await launch({ width: 1280, height: 900, port: 9441 });
const until = async (p, n = 150) => { for (let i = 0; i < n; i++) { try { if (await p()) return true; } catch {} await b.sleep(200); } return false; };
const settle = async () => { let last = null, same = 0; for (let i = 0; i < 150 && same < 8; i++) { const c = await b.eval(`document.body.innerText + document.querySelectorAll('[class*=skeleton i]').length`); same = c === last ? same + 1 : 0; last = c; await b.sleep(200); } };
const box = () => b.eval(`document.querySelector('input[placeholder="ชื่องาน"]')?.value ?? null`);
const todo = () => b.eval(`(() => { const s=[...document.querySelectorAll('section')].find(x=>x.getAttribute('aria-label')==='ยังไม่เริ่ม'); return s ? s.innerText : ''; })()`);
const typeInto = async (text) => { await b.eval(`(() => { const i=document.querySelector('input[placeholder="ชื่องาน"]'); i.focus(); i.select(); })()`); await b.send("Input.insertText", { text }); };
const lines = [];
try {
  await b.goto(`${BASE}/sign-in`, 300); await settle(); await b.type("อีเมล", E("QA_OWNER_EMAIL")); await b.type("รหัสผ่าน", E("QA_OWNER_PASSWORD")); await b.click("เข้าสู่ระบบ", "button");
  await until(async () => (await b.eval("location.pathname")) === "/"); await settle();
  const name = `QA fast-add-v2${E("QA_TAG")}-${Date.now() % 100000}`; await b.type("ชื่อโปรเจกต์", name); await b.click("สร้างโปรเจกต์", "button");
  const href = () => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(name)})?.getAttribute('href') ?? null`);
  await until(async () => !!(await href())); const P = await href(); await b.goto(BASE + P, 300); await settle();
  await until(async () => (await box()) !== null);
  const titles = ["ไว 1", "ไว 2", "ไว 3"];
  await typeInto(titles[0]);
  for (let n = 0; n < titles.length; n++) {
    await b.click("เพิ่มงาน", "button");
    if (n + 1 < titles.length) {
      await b.sleep(200); await typeInto(titles[n + 1]);                     // the person types the next title while title n saves
      const during = await box();
      await until(async () => (await todo()).includes(titles[n]), 150);     // title n has landed
      await b.sleep(500); const after = await box();
      lines.push({ saving: titles[n], typedDuringSave: titles[n + 1], boxRightAfterTyping: during, boxAfterSaveLanded: after, kept: after === titles[n + 1] });
    } else { await until(async () => (await todo()).includes(titles[n]), 150); }
  }
  await b.sleep(1500); await b.goto(BASE + P, 300); await settle(); const t = await todo();
  for (const l of lines) console.log(JSON.stringify(l));
  const saved = titles.filter((x) => t.includes(x));
  console.log(JSON.stringify({ savedAfterReload: saved, result: saved.length === 3 && lines.every((l) => l.kept) ? "PASS" : "FAIL" }));
} finally { b.close(); }
