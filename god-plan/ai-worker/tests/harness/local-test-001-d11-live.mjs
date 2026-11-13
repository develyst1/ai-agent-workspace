// D11 live run through the screens (QA, Tanya). Front :4300 → back-pglite :4310 → live-gateway-cap :4399 → ai.develyst.online.
// Exactly 4 presses: AC-7 ×1 ("ให้ AI ช่วยแตกงาน" on P1, as owner), AC-9 ×3 ("สรุปใหม่" on P1's summary, as owner).
// Each press is made ONCE and waited out (answer or error); nothing is re-pressed. The forwarder refuses a 5th call anyway.
// Synthetic seed only (D2). Records what the screen shows; screenshots to out/TEST-001/d11-live/.
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300";
const OUT = new URL("./out/TEST-001/d11-live/", import.meta.url).pathname;
const ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const count = async () => (await (await fetch("http://127.0.0.1:4399/count")).json());
const b = await launch({ width: 1280, height: 900, port: 9401 });
const settle = async () => { let last = null, since = Date.now(); const t0 = Date.now(); while (Date.now() - t0 < 20000) { const c = await b.eval(`document.body.innerText + '|' + document.querySelectorAll('[class*=skeleton i]').length`); if (c !== last) { last = c; since = Date.now(); } else if (Date.now() - since > 800 && !/\|[1-9]\d*$/.test(c)) return; await b.sleep(200); } };
const go = async (u) => { await b.goto(u, 300); await settle(); };
const out = [];
try {
  if ((await count()).forwarded !== 0) throw new Error("forwarder count is not 0 at start — stop");
  await go(`${BASE}/sign-in`); await b.type("อีเมล", "owner@godplan.test"); await b.type("รหัสผ่าน", process.env.GP_SEED_OWNER_PASSWORD);
  await b.click("เข้าสู่ระบบ", "button"); await b.sleep(1500); await settle();
  const p1 = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='ย้ายบ้านใหม่').getAttribute('href')`);
  // ---- press 1: AC-7
  await go(BASE + p1);
  const t0 = Date.now(); await b.click("ให้ AI ช่วยแตกงาน", "button");
  while (Date.now() - t0 < 60000) { const t = await b.text(); if (t.includes("งานที่ AI เสนอ (เลือกเฉพาะที่ใช้)") || t.includes(ERR)) break; await b.sleep(300); }
  const rows = await b.eval(`[...document.querySelectorAll('li input[aria-label="ชื่องาน"]')].map(i=>i.value)`);
  await b.shot(OUT + "ac7-proposal.png", { full: true });
  out.push({ press: 1, ac: "AC-7", ms: Date.now() - t0, error: (await b.text()).includes(ERR), proposals: rows, forwarded: (await count()).forwarded });
  await b.click("ยกเลิก", "button").catch(() => {}); // nothing saved: the live proposal is read, not added
  // ---- presses 2–4: AC-9
  for (let i = 2; i <= 4; i++) {
    await go(BASE + p1 + "/summary");
    const before = await b.text();
    const s0 = Date.now(); await b.click("สรุปใหม่", "button");
    while (Date.now() - s0 < 60000) { const t = await b.text(); if ((t !== before && !t.includes("AI กำลังคิด…")) || t.includes(ERR)) break; await b.sleep(300); }
    await b.sleep(800);
    const text = await b.text();
    await b.shot(OUT + `ac9-summary-${i - 1}.png`, { full: true });
    out.push({ press: i, ac: "AC-9", ms: Date.now() - s0, error: text.includes(ERR), page: text, forwarded: (await count()).forwarded });
  }
} finally {
  b.close();
  console.log(JSON.stringify(out, null, 1));
  console.log("forwarder:", JSON.stringify(await count()));
}
