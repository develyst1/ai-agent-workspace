// THROWAWAY: AC-11 idle proof for TASK-009. The project page is open 60 s, then the summary page is open 300 s with nobody
// pressing anything; the AI stand-in's call count must stay 0. Then ONE press of สรุปใหม่ must make exactly 1 call.
//   STUB_OWNER_EMAIL=… STUB_OWNER_PASSWORD=… node tests/harness/task-009-idle.mjs      (takes about 6.5 minutes)
import { writeFileSync } from "node:fs";
import { launch } from "./cdp.mjs";

const E = (k) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const BASE = "http://localhost:4300";
const GW = "http://127.0.0.1:4399";
const calls = async () => (await (await fetch(`${GW}/calls`)).json()).count;
writeFileSync(new URL("./gateway-stub/mode.txt", import.meta.url).pathname, "ok\n");
const b = await launch({ width: 1280, height: 900, port: 9336 });
let ok = true;
try {
  await b.goto(`${BASE}/sign-in`, 900);
  await b.type("อีเมล", E("STUB_OWNER_EMAIL"));
  await b.type("รหัสผ่าน", E("STUB_OWNER_PASSWORD"));
  await b.click("เข้าสู่ระบบ", "button");
  await b.sleep(1700);
  const href = await b.eval(`[...document.querySelectorAll('a[href^="/projects/"]')].find(a=>a.querySelector('h2')?.textContent.trim()==='ย้ายบ้านใหม่').getAttribute('href')`);
  await fetch(`${GW}/calls`, { method: "DELETE" });
  const t0 = Date.now();
  await b.goto(`${BASE}${href}`, 1500);
  console.log(`project page open; calls=${await calls()}`);
  await b.sleep(60_000);
  await b.goto(`${BASE}${href}/summary`, 1500);
  console.log(`summary page open at +${Math.round((Date.now() - t0) / 1000)}s; calls=${await calls()}`);
  await b.sleep(300_000);
  const idle = await calls();
  console.log(`after ${Math.round((Date.now() - t0) / 1000)} s with the pages open and no press: calls=${idle}`);
  ok = idle === 0;
  console.log(`${idle === 0 ? "PASS" : "FAIL"}  AC-11: 0 gateway calls while idle`);
  await b.click("สรุปใหม่", "button");
  await b.sleep(2500);
  const one = await calls();
  console.log(`${one === 1 ? "PASS" : "FAIL"}  AC-11: one press of สรุปใหม่ → calls=${one}`);
  ok = ok && one === 1;
} finally {
  b.close();
}
process.exit(ok ? 0 : 1);
