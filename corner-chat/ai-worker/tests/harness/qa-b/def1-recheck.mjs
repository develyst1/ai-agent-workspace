// QA Team B (Tefany) — DEF-1 re-test (TEST-005 #40) after TASK-035, with NO database and NO back end.
//   node def1-recheck.mjs <fake.apk> <local.apk>
// fake APK : VITE_FAKE=true — signs in with no server, loads the fake list (Preferences cache writes with message text).
// local APK: VITE_FAKE=false, API 10.0.2.2:8192 with nothing listening — the login request still crosses the Capacitor
//            bridge (CapacitorHttp), which is where run 1–2 logged the login body.
// Does NOT cover: the Bearer header on a successful real API call (needs the D43 database).
// Prints COUNTS only, never a matching line (workforce-protocol §14). emulator-5554 only; the real phone is never addressed.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [FAKE, LOCAL] = process.argv.slice(2);
if (!FAKE || !LOCAL) throw new Error("usage: node def1-recheck.mjs <fake.apk> <local.apk>");
const here = dirname(fileURLToPath(import.meta.url));
const ADB = "H:/dev-tools/android-sdk/platform-tools/adb.exe", DEV = "emulator-5554", PKG = "com.develyst.cornerchat";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const adb = (...a) => execFileSync(ADB, ["-s", DEV, ...a], { encoding: "utf8", timeout: 180000, maxBuffer: 256 << 20 }).trim();
const sh = (c) => adb("shell", c);
const checks = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass }); console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`); };

const MARK_PW = `qabpw${Date.now().toString(36)}`;      // made-up password typed into the form; never a real one
const MARK_EMAIL = `def1-${Date.now().toString(36)}@qa-b.test`;
const FIXTURE_TEXT = "ประชุมด่วนพรุ่งนี้ 9 โมงเช้า";        // from src/data/fake/fixtures.ts (made-up)

let ws, pending, seq = 0;
async function attach() {
  let sock = "";
  for (let i = 0; i < 40 && !sock; i++) { sock = (sh("cat /proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ""; if (!sock) await sleep(1000); }
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9336"]); } catch {}
  execFileSync(ADB, ["-s", DEV, "forward", "tcp:9336", `localabstract:${sock}`]);
  let target;
  for (let i = 0; i < 40 && !target; i++) { try { target = (await (await fetch("http://127.0.0.1:9336/json")).json()).find((t) => t.type === "page" && /^https?:\/\/localhost/.test(t.url)); } catch {} if (!target) await sleep(1000); }
  if (!target) throw new Error("no app page in the WebView");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("DevTools socket failed")); });
  pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
const ev = async (expression) => { const r = await new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } })); }); return r.result?.result?.value; };
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const has = (id) => ev(`!!${q(id)}`);
const waitFor = async (id, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await has(id).catch(() => false)) return true; await sleep(300); } return false; };
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)});
  e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true })()`);
const click = (id) => ev(`${q(id)}.click()`);

function counts() {
  const all = execFileSync(ADB, ["-s", DEV, "logcat", "-d"], { encoding: "utf8", maxBuffer: 256 << 20 }).split("\n");
  const n = (re) => all.filter((l) => re.test(l)).length;
  return {
    lines: all.length,
    capacitorVerbose: n(/V Capacitor: callback/),
    capacitorAny: n(/\bCapacitor\b/),
    typedPassword: n(new RegExp(MARK_PW)),
    typedEmail: n(new RegExp(MARK_EMAIL.replace(/[.@]/g, "\\$&"))),
    fixtureText: n(new RegExp(FIXTURE_TEXT)),
    tokenPref: n(/"key":"cc\.token","value":"[A-Za-z0-9]/),
    bearer: n(/Bearer [A-Za-z0-9]/),
    loginBody: n(/auth\\?\/login/),
  };
}

async function runOne(label, apk, afterSignIn) {
  try { sh(`pm uninstall ${PKG}`); } catch {}
  adb("install", "-r", apk);
  try { sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`); } catch {}
  sh("logcat -c");
  sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000);
  await attach();
  await waitFor("signin-email", 30000);
  await fill("signin-email", MARK_EMAIL); await fill("signin-password", MARK_PW); await click("signin-submit");
  await sleep(8000);
  await afterSignIn();
  await sleep(3000);
  try { ws.close(); } catch {}
  const c = counts();
  console.log(`${label} counts: ${JSON.stringify(c)}`);
  return c;
}

adb("wait-for-device");
for (let i = 0; i < 150 && sh("getprop sys.boot_completed") !== "1"; i++) await sleep(2000);
const dev = `${sh("getprop ro.product.model")} · API ${sh("getprop ro.build.version.sdk")}`;

const local = await runOne("local", LOCAL, async () => {});
check("T5#40", "local APK: login request (server unreachable) — typed password / email / login body in logcat", "0 · 0 · 0", `${local.typedPassword} · ${local.typedEmail} · ${local.loginBody}`, local.typedPassword === 0 && local.typedEmail === 0 && local.loginBody === 0);
check("T5#40", "local APK: Capacitor verbose bridge lines", "0", local.capacitorVerbose, local.capacitorVerbose === 0);

let fakeReachedList = false, fakeRows = 0;
const fake = await runOne("fake", FAKE, async () => {
  fakeReachedList = await waitFor("screen-messages", 20000);
  await sleep(2000);
  fakeRows = await ev(`document.querySelectorAll('[data-testid^="row-"]').length`).catch(() => 0);
  check("T5#40", "fake APK precondition: signed in and the list loaded (so cache writes happened)", "screen-messages + rows > 0", `${fakeReachedList} · ${fakeRows} rows`, fakeReachedList && fakeRows > 0);
  // open the first row so a detail load happens too
  await ev(`document.querySelector('[data-testid^="row-"]')?.click()`).catch(() => {});
  await sleep(2500);
});
check("T5#40", "fake APK: signed in + list + detail — fixture message text / token pref / Bearer in logcat", "0 · 0 · 0", `${fake.fixtureText} · ${fake.tokenPref} · ${fake.bearer}`, fake.fixtureText === 0 && fake.tokenPref === 0 && fake.bearer === 0);
check("T5#40", "fake APK: typed password / Capacitor verbose lines", "0 · 0", `${fake.typedPassword} · ${fake.capacitorVerbose}`, fake.typedPassword === 0 && fake.capacitorVerbose === 0);

try { sh(`pm uninstall ${PKG}`); } catch {}
try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9336"]); } catch {}
writeFileSync(join(here, "def1-recheck-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), device: dev, apks: { fake: FAKE, local: LOCAL }, counts: { local, fake }, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
