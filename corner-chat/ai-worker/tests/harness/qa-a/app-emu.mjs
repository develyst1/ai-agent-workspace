// TEST-001 / TEST-003 app rows on the NATIVE APK (Capacitor WebView + native HTTP + Android Preferences), emulator only.
//   node app-emu.mjs <apk>
// - Every adb call names `-s emulator-5554`. The real phone on this machine is never addressed.
// - Back end: QA's own instance 127.0.0.1:8191 (db corner_chat_qa_tanya, fake gateway :3991); the APK reaches it at 10.0.2.2:8191.
// - The WebView is driven over raw DevTools (adb forward + WebSocket), the method proven in tests/harness/task-029/shoot-emu.mjs.
// - Screenshots are the whole emulator screen (adb screencap) → shots/e*.png.
// Throwaway harness; all accounts and messages are made up.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APK = process.argv[2];
if (!APK) throw new Error("usage: node app-emu.mjs <apk>");
const here = dirname(fileURLToPath(import.meta.url));
if (!process.env.QA_SECRETS) throw new Error("set QA_SECRETS (QA's secrets.json, outside the repo)");
if (!process.env.ANDROID_HOME) throw new Error("set ANDROID_HOME (machine.local.md → the app toolchain row)");
const secrets = JSON.parse(readFileSync(process.env.QA_SECRETS, "utf8"));
const ADB = join(process.env.ANDROID_HOME, "platform-tools", "adb.exe"), DEV = "emulator-5554", PKG = "com.develyst.cornerchat";
const API = "http://127.0.0.1:8191/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (c, what, expected, actual, pass) => {
  checks.push({ case: c, what, expected, actual: String(actual), pass });
  console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`);
};
const adb = (...a) => execFileSync(ADB, ["-s", DEV, ...a], { encoding: "utf8", timeout: 180000 }).trim();
const shot = (n) => writeFileSync(join(here, "shots", `e${n}.png`), execFileSync(ADB, ["-s", DEV, "exec-out", "screencap", "-p"], { maxBuffer: 64 << 20, timeout: 60000 }));
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, json: t ? JSON.parse(t) : null };
};
const ingest = (userId, text) => JSON.parse(execFileSync("bun", [join(here, "ingest-cli.ts"), userId, text], { encoding: "utf8" }).trim().split("\n").pop());

// ---------- data (API)
const tag = Date.now().toString(36);
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const mk = async (n) => {
  const email = `emu-${n}-${tag}@qa-a.test`, password = `pw-emu-${n}-${tag}`;
  return { ...(await api("POST", "/admin/users", OT, { name: `ผู้ใช้เครื่อง ${n}`, email, password })).json.user, email, password };
};
const U1 = await mk("u1"), U2 = await mk("u2"), U3 = await mk("u3");
const m1n = ingest(U1.id, "U1 ขอให้ยืนยันนัดประชุม [S71]");
const m1h = ingest(U1.id, "U1 ข้อความพักไว้ [S69]");
const m1x = ingest(U1.id, "U1 เกตเวย์ตอบเสีย [L2DOWN]");
const m2 = ingest(U2.id, "ความลับของ U2 ห้ามเห็น [S71]");

// ---------- device
adb("wait-for-device");
for (let i = 0; i < 120 && adb("shell", "getprop", "sys.boot_completed") !== "1"; i++) await sleep(2000);
check("dev", "emulator-5554 booted", "1", adb("shell", "getprop", "sys.boot_completed"), adb("shell", "getprop", "sys.boot_completed") === "1");
const model = `${adb("shell", "getprop", "ro.product.model")} · API ${adb("shell", "getprop", "ro.build.version.sdk")} · ${adb("shell", "wm", "size").replace("Physical size: ", "")}`;
console.log("device:", model);
adb("install", "-r", APK);
adb("shell", "pm", "clear", PKG);
try { adb("shell", "pm", "grant", PKG, "android.permission.POST_NOTIFICATIONS"); } catch {}
try { adb("shell", "dumpsys", "deviceidle", "whitelist", `+${PKG}`); } catch {}
adb("shell", "am", "start", "-n", `${PKG}/${PKG}.MainActivity`);
await sleep(8000);

let sock = "";
for (let i = 0; i < 30 && !sock; i++) {
  sock = (adb("shell", "cat", "/proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? "";
  if (!sock) await sleep(1000);
}
execFileSync(ADB, ["-s", DEV, "forward", "tcp:9334", `localabstract:${sock}`]);
let target;
for (let i = 0; i < 30 && !target; i++) {
  try { target = (await (await fetch("http://127.0.0.1:9334/json")).json()).find((t) => t.type === "page" && /^https?:\/\/localhost/.test(t.url)); } catch {}
  if (!target) await sleep(1000);
}
if (!target) throw new Error("no app page in the WebView");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("DevTools socket failed")); });
let seq = 0;
const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
async function ev(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(`page error: ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`.slice(0, 300));
  return r.result?.result?.value;
}
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const has = (id) => ev(`!!${q(id)}`);
const text = (id) => ev(`(${q(id)}?.innerText ?? '<absent>').replace(/\\s+/g, ' ').trim()`);
const click = (id) => ev(`(() => { const e = ${q(id)}; if (!e) throw new Error('no ${id}'); e.click(); return true })()`);
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; if (!e) throw new Error('no ${id}');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)});
  e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true })()`);
async function until(expr, what, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await ev(`!!(${expr})`)) return true; await sleep(400); }
  throw new Error(`timed out waiting for: ${what}`);
}
const go = (path) => ev(`(() => { history.pushState({}, '', ${JSON.stringify(path)}); dispatchEvent(new PopStateEvent('popstate')); return true })()`);
const prefKeys = () => ev(`(async () => (await window.Capacitor.Plugins.Preferences.keys()).keys)()`);
const signIn = async (email, pw) => {
  await until(q("screen-signin"), "sign-in screen");
  await fill("signin-email", email); await fill("signin-password", pw); await click("signin-submit");
};

try {
  check("dev", "page runs inside the native Capacitor shell", "true", await ev(`!!(window.Capacitor?.isNativePlatform?.())`), await ev(`!!(window.Capacitor?.isNativePlatform?.())`));
  // #1 / #4
  await until(q("screen-signin"), "sign-in screen");
  check("T1#1", "sign-in title (APK)", "เข้าสู่ระบบ corner-chat", await text("screen-title"), (await text("screen-title")) === "เข้าสู่ระบบ corner-chat");
  shot("01-signin");
  await signIn(U1.email, "definitely-wrong");
  await until(q("signin-error"), "error");
  const w1 = await text("signin-error");
  await signIn(`nobody-${tag}@qa-a.test`, "definitely-wrong");
  await sleep(1500);
  const w2 = await text("signin-error");
  check("T1#4", "wrong password / unknown email (APK, native HTTP)", "อีเมลหรือรหัสผ่านไม่ถูกต้อง ×2", `${w1} | ${w2}`, w1 === "อีเมลหรือรหัสผ่านไม่ถูกต้อง" && w2 === w1);
  shot("02-wrong-password");
  // U1 in; #7
  await signIn(U1.email, U1.password);
  await until(q(`row-${m1n.messageId}`), "U1's notified row", 30000);
  await sleep(800);
  const rows = await ev(`[...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4))`);
  const listText = await text("list");
  check("T1#7", "U1's notified list from the back end over 10.0.2.2: own rows only", "m1n + m1x, no U2", JSON.stringify(rows.map((r) => r.slice(0, 8))),
    rows.includes(m1n.messageId) && rows.includes(m1x.messageId) && !rows.includes(m2.messageId) && !listText.includes("ความลับของ U2"));
  check("T3#14", "ai_unavailable row says AI ไม่ได้ตรวจ (APK)", "contains AI ไม่ได้ตรวจ", await text(`row-${m1x.messageId}`), (await text(`row-${m1x.messageId}`)).includes("AI ไม่ได้ตรวจ"));
  shot("03-list");
  await go(`/messages/${m2.messageId}`);
  await until(`${q("detail-error")} || ${q("detail-text")}`, "detail result");
  const leaked = (await ev("document.body.innerText")).includes("ความลับของ U2");
  check("T1#7", "U1 opens U2's message by its id (APK)", "error, no U2 text", (await has("detail-error")) ? "detail-error" : "no error", (await has("detail-error")) && !leaked);
  // #12 / #22
  await go(`/messages/${m1h.messageId}`);
  await until(q("detail-why"), "why card");
  const why = await text("detail-why");
  check("T3#12", "why card (APK)", "ทำไมไม่แจ้ง · 69% · เกณฑ์ 70% · AI · models", why, why.includes("ทำไมไม่แจ้ง") && why.includes("69%") && why.includes("เกณฑ์ 70%") && why.includes("deepseek-v4-pro"));
  shot("04-why");
  await click("detail-correct");
  await until(q("detail-moved-by-you"), "moved line");
  const T1 = (await api("POST", "/auth/login", null, { email: U1.email, password: U1.password })).json.token;
  const after = (await api("GET", `/messages/${m1h.messageId}`, T1)).json.message;
  check("T3#22", "held → แจ้ง (APK)", "คุณย้ายข้อความนี้มาเอง · notified/user", `${await text("detail-moved-by-you")} · ${after.outcome}/${after.decidedBy}`,
    (await text("detail-moved-by-you")) === "คุณย้ายข้อความนี้มาเอง" && after.outcome === "notified" && after.decidedBy === "user");
  shot("05-moved");
  // #20 bar
  await go("/conditions");
  await until(q("conditions-bar"), "conditions");
  await fill("conditions-bar", "80");
  await sleep(300);
  const lbl = await text("conditions-bar-label");
  await click("conditions-save");
  await until(q("conditions-saved"), "saved");
  const bar = (await api("GET", "/conditions", T1)).json.bar;
  check("T3#20", "bar to 80 + save (APK)", "label 80% · API 80", `${lbl} · ${bar}`, lbl.includes("80%") && bar === 80);
  shot("06-conditions-80");
  await fill("conditions-bar", "70"); await click("conditions-save"); await sleep(1500);
  // #11 disabled while signed in; native Preferences wiped
  await go("/messages");
  await until(q("list"), "list");
  await sleep(1500);
  const keysBefore = await prefKeys();
  check("T1#7", "while signed in: token + saved pages in Android Preferences (precondition)", "cc.token + cc.cache.*", JSON.stringify(keysBefore), keysBefore.includes("cc.token") && keysBefore.some((k) => k.startsWith("cc.cache.")));
  await api("POST", `/admin/users/${U1.id}/disable`, OT);
  await ev("location.reload(), true");
  await sleep(4000);
  // reload drops the DevTools page context; re-evaluate until the app is back
  await until(q("screen-signin"), "kicked to sign-in", 30000);
  const keysAfter = await prefKeys();
  check("T1#11", "owner disables U1 → the APK's next load lands on sign-in", "screen-signin", "screen-signin", true);
  check("T1#7", "after the 401: no token and no saved pages in Android Preferences", "no cc.token, no cc.cache.*", JSON.stringify(keysAfter), !keysAfter.includes("cc.token") && !keysAfter.some((k) => k.startsWith("cc.cache.")));
  shot("07-kicked");
  await signIn(U1.email, U1.password);
  await until(q("signin-error"), "error"); await sleep(800);
  check("T1#10", "disabled U1 signs in (APK)", "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล", await text("signin-error"), (await text("signin-error")) === "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล");
  shot("08-disabled");
  await api("POST", `/admin/users/${U1.id}/enable`, OT);
  // #15 reset while signed in
  await signIn(U1.email, U1.password);
  await until(q("screen-messages"), "list", 30000);
  await api("POST", `/admin/users/${U1.id}/password`, OT, { password: `pw-emu-new-${tag}` });
  await click("tab-conditions");
  await until(q("screen-signin"), "kicked after reset", 30000);
  check("T1#15", "owner resets → the APK's next action lands on sign-in", "screen-signin", "screen-signin", true);
  await signIn(U1.email, `pw-emu-new-${tag}`);
  await until(q("screen-messages"), "list with the new password", 30000);
  // sign-out
  const tok = await ev(`(async () => (await window.Capacitor.Plugins.Preferences.get({ key: 'cc.token' })).value)()`);
  await click("menu-open"); await sleep(600); await click("menu-signout");
  await until(q("signout-confirm"), "sign-out dialog");
  const dlg = await text("signout-dialog");
  await click("signout-confirm");
  await until(q("screen-signin"), "signed out", 30000);
  const keysOut = await prefKeys();
  const me = tok ? (await api("GET", "/me", tok)).status : "no token read";
  check("T1#21", "sign-out on the APK: confirm, Preferences clean, old token dead", "ออกจากระบบไหม · [] · 401", `${dlg.slice(0, 14)} · ${JSON.stringify(keysOut.filter((k) => k === "cc.token" || k.startsWith("cc.cache.")))} · ${me}`,
    dlg.includes("ออกจากระบบไหม") && !keysOut.includes("cc.token") && !keysOut.some((k) => k.startsWith("cc.cache.")) && me === 401);
  shot("09-signed-out");
  // #16 lockout wording
  for (let i = 1; i <= 5; i++) { await signIn(U3.email, `wrong-${i}`); await sleep(1200); }
  await signIn(U3.email, U3.password);
  await sleep(1500);
  check("T1#16", "right password after 5 wrong (APK)", "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่", await text("signin-error"), (await text("signin-error")) === "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่");
  shot("10-too-many");
} catch (e) {
  check("x", "script error", "none", e.message.split("\n")[0], false);
  try { shot("xx-error"); } catch {}
} finally {
  try { ws.close(); } catch {}
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9334"]); } catch {}
}
writeFileSync(join(here, "app-emu-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), device: model, apk: APK, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
