// TEST-001 case 25 (AC-11): project screen and summary screen open in two browsers for 5 minutes, nobody presses → 0 gateway calls;
// then one press of "สรุปใหม่" → exactly 1 call. Local only; stand-in on :4399 must be up.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", STUB = "http://127.0.0.1:4399";
const count = async () => (await (await fetch(STUB + "/calls")).json()).count;
const open = async (port) => { const b = await launch({ width: 1280, height: 900, port }); await b.goto(`${BASE}/sign-in`, 4000);
  await b.type("อีเมล", "owner@godplan.test"); await b.type("รหัสผ่าน", process.env.GP_SEED_OWNER_PASSWORD); await b.click("เข้าสู่ระบบ", "button"); await b.sleep(4000); return b; };
const b1 = await open(9381), b2 = await open(9382);
try {
  const href = await b1.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='ย้ายบ้านใหม่').getAttribute('href')`);
  await fetch(STUB + "/calls", { method: "DELETE" });
  await b1.goto(BASE + href, 3000); await b2.goto(BASE + href + "/summary", 3000);
  const t0 = Date.now(); await new Promise((r) => setTimeout(r, 300000)); const idle = await count();
  await b2.click("สรุปใหม่", "button"); await b2.sleep(4000); const one = await count();
  console.log(JSON.stringify({ case: 25, idleSeconds: Math.round((Date.now() - t0) / 1000), callsWhileIdle: idle, callsAfterOnePress: one, result: idle === 0 && one === 1 ? "PASS" : "FAIL" }));
} finally { b1.close(); b2.close(); }
