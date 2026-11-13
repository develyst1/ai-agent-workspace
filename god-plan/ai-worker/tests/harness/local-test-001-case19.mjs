// TEST-001 case 19 (AC-8, gateway address points at nothing) — run with the stand-in STOPPED, back + front up. Local only.
// Owner presses "ให้ AI ช่วยแตกงาน" on P2 and "สรุปใหม่" on P1's summary; time to the error text (limit 30 s); project + summary unchanged.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const OUT = new URL("./out/TEST-001/case19/", import.meta.url).pathname; (await import("node:fs")).mkdirSync(OUT, { recursive: true });
const b = await launch({ width: 1280, height: 900, port: 9371 });
const until = async (ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await b.text()).includes(ERR)) return Date.now() - t0; await b.sleep(200); } return null; };
try {
  await b.goto(`${BASE}/sign-in`, 4000); await b.type("อีเมล", "owner@godplan.test"); await b.type("รหัสผ่าน", process.env.GP_SEED_OWNER_PASSWORD);
  await b.click("เข้าสู่ระบบ", "button"); await b.sleep(4000);
  const href = (n) => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(n)}).getAttribute('href')`);
  const p1 = await href("ย้ายบ้านใหม่"), p2 = await href("งานสวนหลังบ้าน");
  await b.goto(BASE + p2, 4000); const before = await b.text();
  await b.click("ให้ AI ช่วยแตกงาน", "button"); const g = await until(35000); await b.shot(OUT + "g1.png", { full: false });
  await b.goto(BASE + p2, 4000); const after = await b.text();
  await b.goto(BASE + p1 + "/summary", 4000); const sb = await b.text();
  await b.click("สรุปใหม่", "button"); const s = await until(35000); await b.shot(OUT + "s2.png", { full: false });
  await b.goto(BASE + p1 + "/summary", 4000); const sa = await b.text();
  const pass = g !== null && g <= 30000 && s !== null && s <= 30000 && before === after && sb === sa;
  console.log(JSON.stringify({ case: 19, g1ErrorMs: g, s2ErrorMs: s, tasksUnchanged: before === after, summaryUnchanged: sb === sa, result: pass ? "PASS" : "FAIL" }));
} finally { b.close(); }
