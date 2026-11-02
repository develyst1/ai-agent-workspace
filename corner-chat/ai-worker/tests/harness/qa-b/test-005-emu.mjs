// QA Team B (Tefany) — TEST-005 APK rows (+ TEST-004 app half of AC-4) on the NATIVE APK, emulator only.
//   node test-005-emu.mjs <apk>       needs `bun stack.ts` running (back :8192); APK built with VITE_API_BASE=http://10.0.2.2:8192/api/v1
// - Every adb call names `-s emulator-5554`. The real phone on this machine is never addressed.
// - The WebView is driven over raw DevTools (adb forward + WebSocket), Tanya's method (qa-a/app-emu.mjs).
// - Phone notifications are read with `dumpsys notification --noredact`, tapped through the shade (uiautomator dump + input tap).
// - Screenshots: whole emulator screen → shots/e*.png. Throwaway harness; all accounts and messages are made up.
// Proves: the D-B14 watcher (30 s poll) raising and opening notifications, airplane mode, system back, font scale,
// Preferences cleared, logcat clean — on API 34 x86_64 emulator. Does NOT prove a real phone / vendor battery managers.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APK = process.argv[2];
if (!APK) throw new Error("usage: node test-005-emu.mjs <apk>");
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "shots"), { recursive: true });
const secrets = JSON.parse(readFileSync(
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json", "utf8"));
const ADB = "H:/dev-tools/android-sdk/platform-tools/adb.exe", DEV = "emulator-5554", PKG = "com.develyst.cornerchat";
const API = "http://127.0.0.1:8192/api/v1", LINE_SECRET = "qa-b-made-up-channel-secret";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (c, what, expected, actual, pass) => {
  checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`);
};
const adb = (...a) => execFileSync(ADB, ["-s", DEV, ...a], { encoding: "utf8", timeout: 180000, maxBuffer: 64 << 20 }).trim();
const sh = (cmd) => adb("shell", cmd);
const shot = (n) => writeFileSync(join(here, "shots", `e${n}.png`), execFileSync(ADB, ["-s", DEV, "exec-out", "screencap", "-p"], { maxBuffer: 64 << 20, timeout: 60000 }));
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let json = null; try { json = t ? JSON.parse(t) : null; } catch { json = t; }
  return { status: r.status, json };
};
const hook = async (events) => {
  const body = JSON.stringify({ destination: "Uqab-oa", events });
  return (await fetch(`${API}/webhooks/line`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": createHmac("sha256", LINE_SECRET).update(body).digest("base64") }, body })).status;
};
let seq = 0;
const tag = Date.now().toString(36);
const mid = () => `qabE-${tag}-${++seq}`;
const dm = (from, text) => ({ type: "message", timestamp: Date.now(), replyToken: `rtE-${++seq}`, source: { type: "user", userId: from }, message: { id: mid(), type: "text", text } });
const gmsg = (group, from, text, tagged) => ({ type: "message", timestamp: Date.now(), replyToken: `rtE-${++seq}`, source: { type: "group", groupId: group, userId: from }, message: { id: mid(), type: "text", text, mention: { mentionees: [{ index: 0, length: 3, type: "user", userId: tagged }] } } });

// ---------- data
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const mk = async (n) => {
  const email = `e-${n}-${tag}@qa-b.test`, password = `pw-e-${n}-${tag}`;
  const u = (await api("POST", "/admin/users", OT, { name: `ผู้ใช้เครื่อง ${n}`, email, password })).json.user;
  const t = (await api("POST", "/auth/login", null, { email, password })).json.token;
  await api("PUT", "/conditions/settings", t, { bar: 70, sentences: "แจ้งเรื่องงาน" });
  return { ...u, email, password, t };
};
const U1 = await mk("u1"), U2 = await mk("u2");
const L1 = `UqabE${tag}l1`.padEnd(33, "0"), L2 = `UqabE${tag}l2`.padEnd(33, "0"), M = `UqabE${tag}mm`.padEnd(33, "0"), G1 = `CqabE${tag}g1`.padEnd(33, "0");
for (const [u, l] of [[U1, L1], [U2, L2]]) await hook([dm(l, (await api("POST", "/channels/line/link-code", u.t)).json.code)]);
await hook([{ type: "join", timestamp: Date.now(), replyToken: "rtE-j", source: { type: "group", groupId: G1 } }]);
await hook([gmsg(G1, M, `@U1 QABE-OLD ข้อความก่อนเข้าแอป`, L1), gmsg(G1, M, `@U2 QABE-SECRET-U2 ของ U2`, L2), gmsg(G1, M, `@U1 QABE-HOLD0 [HOLD] โฆษณา`, L1)]);
await sleep(4000);

// ---------- device
adb("wait-for-device");
for (let i = 0; i < 150 && sh("getprop sys.boot_completed") !== "1"; i++) await sleep(2000);
const devInfo = `${sh("getprop ro.product.model")} · API ${sh("getprop ro.build.version.sdk")} · ${sh("wm size").replace("Physical size: ", "")} · density ${sh("wm density").replace("Physical density: ", "")}`;
check("dev", "emulator-5554 booted", "boot_completed 1", devInfo, sh("getprop sys.boot_completed") === "1");
sh("settings put system font_scale 1.0");
sh("cmd connectivity airplane-mode disable");
try { sh(`pm uninstall ${PKG}`); } catch {}
adb("install", "-r", APK);
check("T5#41", "fresh install of the local debug APK", "installed", sh(`pm path ${PKG}`).slice(0, 40), sh(`pm path ${PKG}`).startsWith("package:"));
sh("logcat -c");

// ---------- DevTools
let ws, target, pending = new Map(), cdpSeq = 0;
async function attach() {
  let sock = "";
  for (let i = 0; i < 40 && !sock; i++) { sock = (sh("cat /proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ""; if (!sock) await sleep(1000); }
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9335"]); } catch {}
  execFileSync(ADB, ["-s", DEV, "forward", "tcp:9335", `localabstract:${sock}`]);
  target = undefined;
  for (let i = 0; i < 40 && !target; i++) { try { target = (await (await fetch("http://127.0.0.1:9335/json")).json()).find((t) => t.type === "page" && /^https?:\/\/localhost/.test(t.url)); } catch {} if (!target) await sleep(1000); }
  if (!target) throw new Error("no app page in the WebView");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("DevTools socket failed")); });
  pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
const send = (method, params = {}) => new Promise((res) => { const id = ++cdpSeq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
async function ev(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(`page error: ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`.slice(0, 300));
  return r.result?.result?.value;
}
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const has = (id) => ev(`!!${q(id)}`).catch(() => false);
const text = (id) => ev(`(${q(id)}?.innerText ?? '<absent>').replace(/\\s+/g, ' ').trim()`).catch(() => "<absent>");
const click = (id) => ev(`(() => { const e = ${q(id)}; if (!e) throw new Error('no ${id}'); e.click(); return true })()`);
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; if (!e) throw new Error('no ${id}');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)});
  e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true })()`);
const waitFor = async (id, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await has(id)) return true; await sleep(300); } return false; };
const path = () => ev("location.pathname").catch(() => "?");
const body = () => ev("document.body.innerText").catch(() => "");
const reach = (id) => ev(`(() => { const n = ${q(id)}; if (!n) return { ok: false, why: 'absent' }; n.scrollIntoView({ block: 'center' });
  const b = n.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  const ok = !!h && (h === n || n.contains(h) || h.contains(n)); const pw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
  return { ok: ok && pw <= cw, why: 'hit=' + (h ? h.tagName : null) + ' page=' + pw + '/' + cw }; })()`);
async function signIn(u) {
  await waitFor("signin-email", 30000);
  await fill("signin-email", u.email); await fill("signin-password", u.password); await click("signin-submit");
  return waitFor("screen-messages", 20000);
}
// ---------- notifications
function notifs() {
  const d = sh("dumpsys notification --noredact").replace(/\r/g, ""); // adb on Windows returns CRLF (run 1 parser bug)
  const out = [];
  for (const block of d.split(/\n\s*NotificationRecord\(/).slice(1)) {
    if (!block.includes(`pkg=${PKG}`)) continue;
    const title = block.match(/android\.title=String \((.*?)\)\n/)?.[1] ?? "";
    const txt = block.match(/android\.text=String \((.*?)\)\n/s)?.[1] ?? "";
    const ongoing = /flags=0x[0-9a-f]*[2-9a-f]2\b|FLAG_ONGOING|ongoing/i.test(block.slice(0, 400));
    out.push({ title, text: txt, ongoing });
  }
  return out;
}
async function waitNotif(marker, ms = 75000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const n = notifs().find((x) => (x.title + "\n" + x.text).includes(marker));
    if (n) return { ...n, ms: Date.now() - t0 };
    await sleep(1000);
  }
  return null;
}
async function tapNotif(marker) {
  sh("cmd statusbar expand-notifications"); await sleep(1500);
  sh("uiautomator dump /sdcard/qab-ui.xml");
  const xml = sh("cat /sdcard/qab-ui.xml");
  // the notification row itself (clickable), not only the text node inside it
  const nodes = [...xml.matchAll(/<node [^>]*>/g)].map((m) => m[0]);
  const node = nodes.find((n) => n.includes(marker));
  const b = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (!b) { sh("cmd statusbar collapse"); return false; }
  sh(`input tap ${(+b[1] + +b[3]) >> 1} ${(+b[2] + +b[4]) >> 1}`);
  return true;
}
// cancel this app's MESSAGE notifications only (the watcher's ongoing one stays): swipe-dismiss is unreliable over adb,
// so the shade's "Clear all" is used through the status bar service; ongoing notifications are not cleared by it.
function clearShade() {
  try { sh("cmd statusbar expand-notifications"); } catch {}
  try {
    sh("uiautomator dump /sdcard/qab-ui.xml");
    const xml = sh("cat /sdcard/qab-ui.xml");
    const node = [...xml.matchAll(/<node [^>]*>/g)].map((m) => m[0]).find((n) => /text="Clear all"|content-desc="Clear all"/.test(n));
    const b = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (b) sh(`input tap ${(+b[1] + +b[3]) >> 1} ${(+b[2] + +b[4]) >> 1}`);
  } catch {}
  try { sh("cmd statusbar collapse"); } catch {}
}
// after a tap: re-attach and wait up to 12 s for the WebView to land on the expected path
async function landed(expected) {
  const end = Date.now() + 12000; let p = "?";
  while (Date.now() < end) { try { await attach(); p = await path(); if (p === expected) return p; } catch {} await sleep(1000); }
  return p;
}
const prefs = () => { try { return sh(`run-as ${PKG} cat shared_prefs/CapacitorStorage.xml`); } catch (e) { return `<unreadable ${String(e.message).slice(0, 60)}>`; } };
const msgId = async (u, marker, tab = "notified") => ((await api("GET", `/messages?tab=${tab}&limit=100`, u.t)).json?.items ?? []).find((m) => JSON.stringify(m).includes(marker))?.id;

async function section(name, fn) { try { await fn(); } catch (e) { check(name, "section error", "none", String(e.message).split("\n")[0], false); try { shot(`x-${name}`); } catch {} } }

try {
  // ---------- #8 refused permission (first sign-in), then #9 asked once
  await section("T5#8", async () => {
    sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000);
    await attach();
    check("T5#41", "opens to sign-in", "/signin", await path(), (await path()) === "/signin");
    shot("01-signin");
    await fill("signin-email", U1.email); await fill("signin-password", U1.password); await click("signin-submit");
    let denied = false;
    for (let i = 0; i < 20 && !denied; i++) {
      await sleep(1000);
      sh("uiautomator dump /sdcard/qab-ui.xml");
      const xml = sh("cat /sdcard/qab-ui.xml");
      const node = [...xml.matchAll(/<node [^>]*>/g)].map((m) => m[0]).find((n) => /text="(Don.t allow|Don’t allow)"/.test(n));
      const b = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      if (b) { shot("02-permission-prompt"); sh(`input tap ${(+b[1] + +b[3]) >> 1} ${(+b[2] + +b[4]) >> 1}`); denied = true; }
    }
    check("T5#8", "permission asked at the first sign-in", "system prompt shown and refused", denied ? "prompt → Don't allow" : "no prompt seen", denied);
    // a battery prompt may follow; dismiss with back if it is a system screen
    await sleep(2500); sh("uiautomator dump /sdcard/qab-ui.xml");
    if (!/com\.develyst\.cornerchat/.test(sh("dumpsys window | grep -E 'mCurrentFocus'"))) { sh("input keyevent KEYCODE_BACK"); await sleep(1500); }
    await attach();
    await waitFor("screen-messages", 15000);
    const hint = await waitFor("notifications-hint", 8000);
    check("T5#8", "refused → hint on the list", "ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด", hint ? await text("notifications-hint") : "no hint", hint && (await text("notifications-hint")) === "ปิดการแจ้งเตือนอยู่ จะไม่เห็นข้อความใหม่จนกว่าจะเปิด · แตะเพื่อเปิด");
    shot("03-refused-hint");
    await hook([gmsg(G1, M, `@U1 QABE-REFUSED ไม่ควรเด้ง`, L1)]);
    const n = await waitNotif("QABE-REFUSED", 50000);
    check("T5#8", "refused → no notification for a passed message (50 s)", "none", n ? JSON.stringify(n) : "none", !n);
    // sign out + in: asked once
    await click("menu-open"); await waitFor("menu-signout"); await click("menu-signout"); await waitFor("signout-confirm"); await click("signout-confirm");
    await waitFor("signin-email", 15000);
    await fill("signin-email", U1.email); await fill("signin-password", U1.password); await click("signin-submit");
    await sleep(4000); sh("uiautomator dump /sdcard/qab-ui.xml");
    const again = /Don.t allow|Don’t allow/.test(sh("cat /sdcard/qab-ui.xml"));
    check("T5#9", "second sign-in does not ask again", "no prompt", again ? "prompt shown again" : "no prompt", !again);
    shot("04-second-signin");
  });

  // grant from here on (as a user tapping the hint would), and the battery exemption as TASK-030 did
  sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`);
  try { sh(`dumpsys deviceidle whitelist +${PKG}`); } catch {}
  sh(`am force-stop ${PKG}`); sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000); await attach();
  await waitFor("screen-messages", 20000);
  await sleep(35000); // let one watcher tick set its watermark after start

  await section("T5#watcher", async () => {
    const perm = notifs().filter((n) => !/QABE/.test(n.title + n.text));
    check("obs", "permanent watcher notification while signed in (SPEC D-B14)", "corner-chat กำลังรอข้อความใหม่", perm.map((n) => n.title + "|" + n.text).join(" ; ").slice(0, 120), perm.some((n) => (n.title + n.text).includes("corner-chat กำลังรอข้อความใหม่")));
    const old = notifs().find((n) => (n.title + n.text).includes("QABE-OLD"));
    check("T5#1", "messages from before sign-in raise nothing (watermark)", "no QABE-OLD notification", old ? "raised" : "none", !old);
  });

  // ---------- #3 foreground: list open
  await section("T5#3", async () => {
    await hook([gmsg(G1, M, `@U1 QABE-FG มาขณะเปิดแอป`, L1)]);
    const t0 = Date.now(); let seen = false;
    while (Date.now() - t0 < 75000 && !seen) { seen = (await body()).includes("QABE-FG"); if (!seen) await sleep(1000); }
    const n = await waitNotif("QABE-FG", 5000);
    check("T5#3", "app open on the list: new message appears without action", "row ≤ 60 s", `${seen ? Date.now() - t0 + " ms" : "not in 75 s"} · notification=${!!n}`, seen && Date.now() - t0 <= 60000);
  });

  // ---------- #1 background + #7 timing (5 runs) + #4 tap
  sh("input keyevent KEYCODE_HOME"); await sleep(2000);
  const times = [];
  await section("T5#1", async () => {
    for (let i = 1; i <= 5; i++) {
      const marker = `QABE-BG${i}`;
      await hook([gmsg(G1, M, `@U1 ${marker} รายงานด่วน\nบรรทัดสอง\nบรรทัดสาม`, L1)]);
      const n = await waitNotif(marker, 90000);
      times.push(n ? n.ms : null);
      if (i === 1) {
        check("T5#1", "background: notification arrives", "title = about line (full form), body = first 2 lines", n ? `${n.ms} ms · "${n.title}" | "${n.text.replace(/\n/g, "⏎")}"` : "none in 90 s",
          n && n.title.startsWith("[LINE ·") && n.text.includes(marker) && n.text.includes("บรรทัดสอง") && !n.text.includes("บรรทัดสาม"));
        shot("05-notification-shade");
      }
    }
    check("T5#7", "5 runs, each ≤ 60 s from the webhook (includes the filter)", "all ≤ 60000 ms", times.join(", "), times.every((t) => t !== null && t <= 60000));
  });
  await section("T5#4", async () => {
    // run 2 tapped with 5–7 bundled notifications in the shade; now: clear the shade, one notification, then tap
    clearShade(); sh("input keyevent KEYCODE_HOME"); await sleep(1000);
    await hook([gmsg(G1, M, `@U1 QABE-TAP1 แตะเพื่อเปิด`, L1)]);
    await waitNotif("QABE-TAP1", 90000);
    check("T5#4", "precondition: exactly one message notification in the shade", "1", notifs().filter((x) => /QABE/.test(x.title + x.text)).length, notifs().filter((x) => /QABE/.test(x.title + x.text)).length === 1);
    const id = await msgId(U1, "QABE-TAP1");
    const tapped = await tapNotif("QABE-TAP1");
    const p = await landed(`/messages/${id}`);
    check("T5#4", "tap the notification (app in background) → that message", `/messages/${id?.slice(0, 8)}…`, `${tapped} · ${p}`, tapped && p === `/messages/${id}`);
    shot("06-tap-opened");
    const toast = sh("uiautomator dump /sdcard/qab-ui.xml") && /ให้ corner-chat ทำงานตลอดเวลา/.test(sh("cat /sdcard/qab-ui.xml"));
    check("obs", "detail screen: battery toast present (Tanya's observation)", "recorded", toast ? "toast visible over the detail" : "no toast", true);
    const r = await reach("detail-correct");
    check("T5#19", "detail button hit-tests inside the APK WebView", "hit", r.why, r.ok);
  });
  await section("T5#5", async () => {
    clearShade(); sh("input keyevent KEYCODE_HOME"); await sleep(1000);
    await hook([gmsg(G1, M, `@U1 QABE-A ข้อความเอ`, L1)]); await waitNotif("QABE-A", 90000);
    await hook([gmsg(G1, M, `@U1 QABE-B ข้อความบี`, L1)]); await waitNotif("QABE-B", 90000);
    const idA = await msgId(U1, "QABE-A");
    const tapped = await tapNotif("QABE-A"); const pA = await landed(`/messages/${idA}`);
    check("T5#5", "two notifications, tap the older (A)", "A's detail", `${tapped} · ${pA}`, tapped && pA === `/messages/${idA}`);
  });
  await section("T5#2", async () => {
    // swipe the app away from recents (not force-stop)
    sh("input keyevent KEYCODE_APP_SWITCH"); await sleep(2500);
    sh("input swipe 360 900 360 100 300"); await sleep(2500);
    sh("input keyevent KEYCODE_HOME"); await sleep(2000);
    clearShade();
    await hook([gmsg(G1, M, `@U1 QABE-KILLED หลังปัดทิ้ง`, L1)]);
    const n = await waitNotif("QABE-KILLED", 90000);
    check("T5#2", "app swiped away from recents → still notified", "≤ 60 s", n ? `${n.ms} ms` : "none in 90 s", n && n.ms <= 60000);
    const id = await msgId(U1, "QABE-KILLED");
    const tapped = await tapNotif("QABE-KILLED"); const pK = await landed(`/messages/${id}`);
    check("T5#4", "tap after the app was swiped away → that message", "that detail", `${tapped} · ${pK}`, tapped && pK === `/messages/${id}`);
  });
  await section("T5#6", async () => {
    sh("input keyevent KEYCODE_HOME");
    await hook([gmsg(G1, M, `@U1 QABE-HELD [HOLD] โปรโมชั่น`, L1)]);
    const n = await waitNotif("QABE-HELD", 70000);
    check("T5#6", "held message → no notification (70 s, > 2 ticks)", "none", n ? "raised" : "none", !n);
  });
  await section("T5#10", async () => {
    await hook([gmsg(G1, M, `@U1 QABE-DOWN [L2DOWN] เกตเวย์ล่ม`, L1)]);
    const n = await waitNotif("QABE-DOWN", 90000);
    check("T5#10", "AI down → still notified, title AI ไม่ได้ตรวจ", "title starts AI ไม่ได้ตรวจ", n ? `"${n.title}"` : "none", n && n.title.startsWith("AI ไม่ได้ตรวจ"));
  });

  // ---------- back to the app: smoke, system back, resume reload
  sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); await attach();
  await section("T5#22", async () => {
    await ev("location.assign('/messages')"); await sleep(1500); await attach(); await waitFor("screen-messages");
    sh("input keyevent KEYCODE_HOME"); await sleep(1500);
    await hook([gmsg(G1, M, `@U1 QABE-RESUME [HOLD] ระหว่างพักแอป`, L1)]); await sleep(4000);
    await ev("document.querySelector('[data-testid=\"list-tab-held\"]')?.click()").catch(() => {});
    sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(4000); await attach();
    await click("list-tab-held").catch(() => {}); await sleep(2000);
    check("T5#22", "resume the APK → list reloads (held message added while away)", "QABE-RESUME shown", (await body()).includes("QABE-RESUME"), (await body()).includes("QABE-RESUME"));
    await click("list-tab-notified").catch(() => {}); await sleep(1000);
    check("T5#11", "APK smoke: tab switch", "both tabs render", `${await has("list-tab-held")} · ${await has("list")}`, (await has("list-tab-held")) && (await has("list")));
  });
  await section("T5#17", async () => {
    const steps = [];
    const backFrom = async (go, screen, expectScreen) => {
      try { await go(); } catch (e) { steps.push(`${screen}→SETUP(${String(e.message).slice(0, 40)} at ${await path()})`); return false; }
      await waitFor(screen, 10000);
      const fromPath = await path();
      sh("input keyevent KEYCODE_BACK"); await sleep(1500);
      const focus = sh("dumpsys window | grep -E 'mCurrentFocus'").replace(/\s+/g, " ").slice(0, 90);
      const fg = /com\.develyst\.cornerchat/.test(focus);
      let ok = false, toPath = "?"; try { await attach(); ok = await waitFor(expectScreen, 5000); toPath = await path(); } catch (e) { toPath = `attach failed: ${String(e.message).slice(0, 40)}`; }
      steps.push(`${screen}(${fromPath})→${ok && fg ? expectScreen : `LOST[fg=${fg} path=${toPath} focus=${focus}]`}`);
      if (!fg) { sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); try { await attach(); } catch {} }
      return ok && fg;
    };
    const id = await msgId(U1, "QABE-FG");
    const r = [];
    await click("tab-messages").catch(() => {}); await waitFor(`row-${id}`, 10000);
    r.push(await backFrom(async () => { await click(`row-${id}`); }, "screen-message-detail", "screen-messages"));
    r.push(await backFrom(async () => { await click("tab-channels"); await waitFor("screen-channels"); await click("channels-open-line"); }, "screen-line", "screen-channels"));
    r.push(await backFrom(async () => { await click("channels-open-line"); await waitFor("screen-line"); await click("line-open-names"); }, "screen-line-names", "screen-line"));
    r.push(await backFrom(async () => { await click("line-open-groups"); }, "screen-line-groups", "screen-line"));
    r.push(await backFrom(async () => { await click("nav-back"); await waitFor("screen-channels"); await click("channels-open-zimbra"); }, "screen-zimbra", "screen-channels"));
    check("T5#17", "system back on each sub-screen → one step back, app stays open", "all one step back", steps.join(" "), r.every(Boolean));
  });
  await section("T5#20", async () => {
    sh("settings put system font_scale 1.3"); await sleep(2500);
    sh(`am force-stop ${PKG}`); sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000); await attach();
    await waitFor("screen-messages", 15000);
    const ids = ["list-tab-held", "tab-conditions", "tab-channels", "menu-open"];
    const res = [];
    for (const id of ids) res.push(`${id}:${(await reach(id)).ok}`);
    const id = await msgId(U1, "QABE-FG");
    await ev(`location.assign('/messages/${id}')`).catch(() => {}); await sleep(1500); await attach(); await waitFor("detail-correct");
    res.push(`detail-correct:${(await reach("detail-correct")).ok}`);
    shot("07-font-1.3-detail");
    sh("settings put system font_scale 1.0");
    check("T5#20", "font scale 1.3 (largest on API 34 = 1.3): controls still hit-test", "all true", res.join(" "), res.every((x) => x.endsWith(":true")));
  });

  // ---------- offline: airplane mode
  await section("T5#24", async () => {
    await ev("location.assign('/messages')").catch(() => {}); await sleep(1500); await attach(); await waitFor("screen-messages");
    sh("cmd connectivity airplane-mode enable"); await sleep(4000);
    await click("tab-conditions"); await sleep(1500); await click("tab-messages"); await sleep(2500);
    const banner = await text("offline-banner");
    check("T5#24", "airplane mode: banner + the saved list", "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด + rows", `${banner} · rows=${(await body()).includes("QABE-")}`, banner === "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" && (await body()).includes("QABE-"));
    shot("08-airplane");
    sh(`am force-stop ${PKG}`); sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(7000); await attach();
    await sleep(2500);
    const b2 = await text("offline-banner");
    check("T5#26", "cold start in airplane mode: saved list + banner", "banner + rows", `${b2} · rows=${(await body()).includes("QABE-")}`, b2 === "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" && (await body()).includes("QABE-"));
    shot("09-airplane-cold");
    sh("cmd connectivity airplane-mode disable"); await sleep(8000);
    await click("tab-conditions").catch(() => {}); await sleep(1500); await click("tab-messages").catch(() => {}); await sleep(3000);
    check("T5#25", "airplane off → banner goes, list loads", "no banner", `${await has("offline-banner")}`, !(await has("offline-banner")));
  });

  // ---------- #31 account switch + #32 Preferences cleared + #33
  await section("T5#31", async () => {
    const before = prefs();
    check("T5#32", "while signed in, Preferences hold the token + saved list (precondition)", "cc.token + cc.cache", `${/cc\.token/.test(before)} · ${/cc\.cache/.test(before)}`, /cc\.token/.test(before));
    await click("menu-open"); await waitFor("menu-signout"); await click("menu-signout"); await waitFor("signout-confirm");
    const dlg = await text("signout-dialog");
    await click("signout-confirm"); await waitFor("signin-email", 15000);
    const after = prefs();
    check("T5#32", "after sign-out: no token, no saved list, no message text in Preferences", "clean", `${/cc\.token/.test(after)} · ${/cc\.cache/.test(after)} · ${/QABE/.test(after)}`, !/cc\.token/.test(after) && !/cc\.cache/.test(after) && !/QABE/.test(after));
    sh("input keyevent KEYCODE_BACK"); await sleep(1500);
    let leak = false; try { await attach(); leak = (await body()).includes("QABE-"); } catch {}
    check("T5#33", "APK sign-out: confirm text; system back shows no data", "ออกจากระบบไหม · no data", `${dlg.slice(0, 16)} · ${leak}`, dlg.includes("ออกจากระบบไหม") && !leak);
    sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(4000); await attach();
    const perm = notifs().filter((n) => (n.title + n.text).includes("corner-chat กำลังรอข้อความใหม่"));
    check("T5#31", "signed out: the watcher's permanent notification is gone", "none", perm.length, perm.length === 0);
    await signIn(U2);
    await sleep(35000);
    sh("input keyevent KEYCODE_HOME");
    await hook([gmsg(G1, M, `@U1 QABE-AFTER-SWITCH ของ U1 หลังสลับบัญชี`, L1)]);
    const n = await waitNotif("QABE-AFTER-SWITCH", 90000);
    check("T5#31", "U1 signed out, U2 signed in: U1's passed message raises nothing on this device (90 s)", "none", n ? "LEAK: raised" : "none", !n);
    sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); await attach();
    const b = await body();
    check("T5#31", "U2's app shows none of U1's messages", "no QABE-BG/FG text", b.includes("QABE-BG") || b.includes("QABE-FG") ? "U1 text visible" : "clean", !b.includes("QABE-BG") && !b.includes("QABE-FG"));
    shot("10-u2-after-switch");
  });

  // ---------- #40 logcat
  await section("T5#40", async () => {
    const lc = execFileSync(ADB, ["-s", DEV, "logcat", "-d"], { encoding: "utf8", maxBuffer: 256 << 20 });
    // counts only: a matching line would carry the very secret it proves (workforce-protocol §14)
    const all = lc.split("\n");
    const n = (re) => all.filter((l) => re.test(l)).length;
    const counts = { messageText: n(/QABE/), password: n(/pw-e-/), bearer: n(/Bearer [A-Za-z0-9]/), tokenPref: n(/"key":"cc\.token","value":"[A-Za-z0-9]/), capacitorVerbose: n(/V Capacitor: callback/) };
    const leaked = counts.messageText + counts.password + counts.bearer + counts.tokenPref;
    check("T5#40", "logcat: no message text, password or token", "0 lines", `${JSON.stringify(counts)} of ${all.length} lines`, leaked === 0);
  });
} finally {
  try { sh("settings put system font_scale 1.0"); sh("cmd connectivity airplane-mode disable"); sh("cmd statusbar collapse"); } catch {}
  try { ws?.close(); } catch {}
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9335"]); } catch {}
}
writeFileSync(join(here, "test-005-emu-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, apk: APK, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
