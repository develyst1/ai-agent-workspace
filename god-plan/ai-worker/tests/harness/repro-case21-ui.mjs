// TEST-001 case 21 isolation (QA): stand-in `hang`, owner presses "ให้ AI ช่วยแตกงาน" on P2 in a fresh browser; time to the error text, up to 60 s.
// Also logs every /api request the page makes and its outcome (CDP Network). Local only.
import { writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";
const BASE = "http://localhost:4300", MODE = new URL("./gateway-stub/mode.txt", import.meta.url).pathname;
const ERR = "AI ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้ง ไม่มีอะไรในโปรเจกต์เปลี่ยน";
const b = await launch({ width: 1280, height: 900, port: 9361 });
const net = [];
try {
  await b.send("Network.enable");
  // record the AI task-proposals request: sent / response status / finished|failed, ms from the press
  const ws = b.send; let T0 = 0; const reqs = {};
  globalThis.__net = net; globalThis.__mark = () => { T0 = Date.now(); };
  await b.goto(`${BASE}/sign-in`, 4000);
  await b.type("อีเมล", "owner@godplan.test"); await b.type("รหัสผ่าน", process.env.GP_SEED_OWNER_PASSWORD);
  await b.click("เข้าสู่ระบบ", "button"); await b.sleep(4000);
  const href = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='งานสวนหลังบ้าน').getAttribute('href')`);
  await b.goto(BASE + href, 5000);
  // optional: replay the round's earlier modes first (SEQ=500,empty,malformed), each press waited out to its error
  for (const m of (process.env.SEQ || "").split(",").filter(Boolean)) {
    writeFileSync(MODE, m + "\n"); const s0 = Date.now(); await b.click("ให้ AI ช่วยแตกงาน", "button");
    while (Date.now() - s0 < 30000 && !(await b.text()).includes(ERR)) await b.sleep(200);
    console.log(`prior ${m}: error after ${Date.now() - s0} ms`); await b.goto(BASE + href, 3000);
  }
  writeFileSync(MODE, "hang\n");
  const t0 = Date.now();
  const before = await b.eval(`performance.getEntriesByType('resource').length`);
  await b.click("ให้ AI ช่วยแตกงาน", "button");
  let at = null, btn = null;
  while (Date.now() - t0 < 60000) {
    const t = await b.text();
    if (t.includes(ERR)) { at = Date.now() - t0; break; }
    await b.sleep(250);
  }
  const res = await b.eval(`performance.getEntriesByType('resource').slice(${before}).filter(e=>e.name.includes('task-proposals')).map(e=>({start:Math.round(e.startTime), dur:Math.round(e.duration), status:e.responseStatus}))`);
  console.log("task-proposals timing (performance API):", JSON.stringify(res));
  btn = await b.eval(`[...document.querySelectorAll('button')].map(x=>x.textContent.trim()).filter(x=>x.includes('AI'))`);
  await b.shot(new URL("./out/TEST-001/repro-21-ui.png", import.meta.url).pathname, { full: false });
  console.log(JSON.stringify({ errorShownAfterMs: at, aiButtonsNow: btn, waitedMs: Date.now() - t0 }));
} finally { writeFileSync(MODE, "ok\n"); b.close(); }
