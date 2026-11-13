// THROWAWAY recipe for TASK-013: sign in as the owner, open the board, press the AI task button while the back (via stall-body)
// answers headers + a half body and then stalls. Reports, second by second, whether the error string appeared and whether the
// button is enabled again. The SAME recipe is run on the old code (Step 0) and on the new code (Step 3).
//   STUB_OWNER_EMAIL=… STUB_OWNER_PASSWORD=… node tests/harness/task-013-recipe.mjs
import { launch } from "./cdp.mjs";

const E = (k) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const BASE = "http://localhost:4300";
const AI_ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const b = await launch({ width: 1280, height: 900, port: 9337 });
let errAt = -1, enabledAt = -1;
try {
  await b.goto(`${BASE}/sign-in`, 900);
  await b.type("อีเมล", E("STUB_OWNER_EMAIL"));
  await b.type("รหัสผ่าน", E("STUB_OWNER_PASSWORD"));
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1700);
  const href = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='ย้ายบ้านใหม่').getAttribute('href')`);
  await b.goto(`${BASE}${href}`, 1700);
  const tasksBefore = await b.eval(`document.querySelectorAll('section h2').length`);
  const t0 = Date.now();
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  for (;;) {
    const s = Math.round((Date.now() - t0) / 1000);
    const txt = await b.text();
    const btnDisabled = await b.eval(`[...document.querySelectorAll('button')].some(x=>x.textContent.includes('AI กำลังคิด')&&x.disabled)`);
    if (errAt < 0 && txt.includes(AI_ERR)) errAt = Date.now() - t0;
    if (enabledAt < 0 && !btnDisabled && s > 1) enabledAt = Date.now() - t0;
    if (s === 10 || s === 20 || s === 30 || s === 35 || s === 40) console.log(`t=${s}s  error shown: ${errAt >= 0}  button still disabled/"AI กำลังคิด…": ${btnDisabled}`);
    if ((errAt >= 0 && enabledAt >= 0) || s >= 40) break;
    await b.sleep(1000);
  }
  const tasksAfter = await b.eval(`document.querySelectorAll('section h2').length`);
  console.log(`RESULT error string at: ${errAt >= 0 ? errAt + " ms" : "NEVER within 40 s"} · button enabled again at: ${enabledAt >= 0 ? enabledAt + " ms" : "NEVER within 40 s"} · tasks on the board before/after: ${tasksBefore}/${tasksAfter}`);
} finally {
  b.close();
}
