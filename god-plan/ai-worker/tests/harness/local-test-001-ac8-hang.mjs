// TEST-001 AC-8 hang check, both buttons, with UTC start/end per press (QA, Tanya) — to set beside timer-stall-detector.mjs (Q-F6).
// Stand-in `hang`; owner presses "ให้ AI ช่วยแตกงาน" on P2 and "สรุปใหม่" on P1's summary, N times each, fresh page each press.
// Pass = error text on screen within 30 s. Local only. Run: N=4 node tests/harness/local-test-001-ac8-hang.mjs
import { writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", MODE = new URL("./gateway-stub/mode.txt", import.meta.url).pathname;
const ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const N = Number(process.env.N || 4);
const iso = () => new Date().toISOString().slice(11, 19);
const b = await launch({ width: 1280, height: 900, port: 9411 });
const settle = async () => { let last = null, since = Date.now(); const t0 = Date.now(); while (Date.now() - t0 < 20000) { const c = await b.eval(`document.body.innerText + '|' + document.querySelectorAll('[class*=skeleton i]').length`); if (c !== last) { last = c; since = Date.now(); } else if (Date.now() - since > 800 && !/\|[1-9]\d*$/.test(c)) return; await b.sleep(200); } };
const go = async (u) => { await b.goto(u, 300); await settle(); };
try {
  await go(`${BASE}/sign-in`); await b.type("อีเมล", process.env.QA_OWNER_EMAIL || "owner@godplan.test"); await b.type("รหัสผ่าน", process.env.QA_OWNER_PASSWORD || process.env.GP_SEED_OWNER_PASSWORD);
  await b.click("เข้าสู่ระบบ", "button"); await b.sleep(1500); await settle();
  const href = (n) => b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()===${JSON.stringify(n)})?.getAttribute('href') ?? null`);
  const p1 = await href(process.env.QA_P1 || "ย้ายบ้านใหม่"), p2 = await href(process.env.QA_P2 || "งานสวนหลังบ้าน");
  writeFileSync(MODE, "hang\n");
  for (let i = 1; i <= N; i++) {
    for (const [label, url, btn] of [["G1", BASE + p2, "ให้ AI ช่วยแตกงาน"], ["S2", BASE + p1 + "/summary", "สรุปใหม่"]]) {
      await go(url); const s = iso(); const t0 = Date.now(); await b.click(btn, "button");
      let at = null; while (Date.now() - t0 < 60000) { if ((await b.text()).includes(ERR)) { at = Date.now() - t0; break; } await b.sleep(250); }
      console.log(`${label} #${i}  [${s}→${iso()} UTC]  error on screen ${at === null ? "NOT within 60 s" : at + " ms"}  ${at !== null && at <= 30000 ? "PASS" : "LATE"}`);
    }
  }
} finally { writeFileSync(MODE, "ok\n"); b.close(); }
