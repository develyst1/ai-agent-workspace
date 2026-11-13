// THROWAWAY for TASK-019 (DEF-2, front half): with the back STOPPED, a sign-in attempt must show the sign-in failure string
// (never the "could not save" one), and the typed email must stay in its box. Start the front, stop the back, then run this.
// A synthetic email and password are typed; nothing real is used.
import { launch } from "./cdp.mjs";

const BASE = "http://localhost:4300";
const b = await launch({ width: 1280, height: 900, port: 9438 });
let ok = true;
const check = (name, pass, extra = "") => { ok = ok && pass; console.log(`${pass ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`); };
try {
  await b.goto(`${BASE}/sign-in`, 1500);
  await b.type("อีเมล", "someone@example.test");
  await b.type("รหัสผ่าน", "not-a-real-password");
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(2500);
  const text = await b.text();
  const emailKept = await b.eval(`[...document.querySelectorAll('input')].some(i=>i.value==='someone@example.test')`);
  check("back stopped: the sign-in failure string is shown", text.includes("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"));
  check("…and it is not the save message", !text.includes("บันทึกไม่สำเร็จ"));
  check("…and not the wrong-password message", !text.includes("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
  check("the typed email stays in its box", emailKept);
  check("still on /sign-in", (await b.url()) === "/sign-in");
} finally {
  b.close();
}
process.exit(ok ? 0 : 1);
