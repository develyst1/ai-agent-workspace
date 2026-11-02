// QA Team B (Tefany) — TEST-005 #4 (tap with ONE notification) and #17 (system back from the detail), isolated.
//   node emu-focus.mjs <apk>        needs `bun stack.ts` running; emulator-5554 only; real phone never addressed.
// Fresh install → sign in (permission granted beforehand, so no prompt) → wait one watcher tick → HOME → one message →
// tap its notification → where does the WebView land? Then: list → tap a row → system BACK → where does it land?
// Also tries the same BACK after a short wait and a second BACK, and records the WebView's history length.
// Counts and paths only. Throwaway harness; all data made up.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APK = process.argv[2];
const here = dirname(fileURLToPath(import.meta.url));
const secrets = JSON.parse(readFileSync("C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json", "utf8"));
const ADB = "H:/dev-tools/android-sdk/platform-tools/adb.exe", DEV = "emulator-5554", PKG = "com.develyst.cornerchat";
const API = "http://127.0.0.1:8192/api/v1", LINE_SECRET = "qa-b-made-up-channel-secret";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const adb = (...a) => execFileSync(ADB, ["-s", DEV, ...a], { encoding: "utf8", timeout: 180000, maxBuffer: 64 << 20 }).trim();
const sh = (c) => adb("shell", c);
const shot = (n) => writeFileSync(join(here, "shots", `f${n}.png`), execFileSync(ADB, ["-s", DEV, "exec-out", "screencap", "-p"], { maxBuffer: 64 << 20 }));
const out = {};
const api = async (m, p, t, b) => { const r = await fetch(`${API}${p}`, { method: m, headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(b ? { "Content-Type": "application/json" } : {}) }, body: b ? JSON.stringify(b) : undefined }); const x = await r.text(); try { return JSON.parse(x); } catch { return x; } };
const hook = async (events) => { const body = JSON.stringify({ destination: "x", events }); await fetch(`${API}/webhooks/line`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": createHmac("sha256", LINE_SECRET).update(body).digest("base64") }, body }); };
const tag = Date.now().toString(36); let seq = 0;
const L1 = `UqabF${tag}l1`.padEnd(33, "0"), M = `UqabF${tag}mm`.padEnd(33, "0"), G1 = `CqabF${tag}g1`.padEnd(33, "0");
const gm = (text) => ({ type: "message", timestamp: Date.now(), replyToken: `rf-${++seq}`, source: { type: "group", groupId: G1, userId: M }, message: { id: `qabF-${tag}-${++seq}`, type: "text", text, mention: { mentionees: [{ index: 0, length: 3, type: "user", userId: L1 }] } } });

const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).token;
const email = `f-${tag}@qa-b.test`, password = `pw-f-${tag}`;
await api("POST", "/admin/users", OT, { name: "ผู้ใช้ทดสอบแตะ", email, password });
const UT = (await api("POST", "/auth/login", null, { email, password })).token;
await api("PUT", "/conditions/settings", UT, { bar: 70, sentences: "แจ้งเรื่องงาน" });
await hook([{ type: "message", timestamp: Date.now(), replyToken: "rf-dm", source: { type: "user", userId: L1 }, message: { id: `qabF-${tag}-dm`, type: "text", text: (await api("POST", "/channels/line/link-code", UT)).code } }]);
await hook([{ type: "join", timestamp: Date.now(), replyToken: "rf-j", source: { type: "group", groupId: G1 } }]);
await hook([gm("@U QABF-LIST1 รายการแรก"), gm("@U QABF-LIST2 รายการสอง")]);
await sleep(4000);

let ws, pending, cs = 0;
async function attach() {
  let sock = ""; for (let i = 0; i < 40 && !sock; i++) { sock = (sh("cat /proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ""; if (!sock) await sleep(1000); }
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9337"]); } catch {}
  execFileSync(ADB, ["-s", DEV, "forward", "tcp:9337", `localabstract:${sock}`]);
  let t; for (let i = 0; i < 40 && !t; i++) { try { t = (await (await fetch("http://127.0.0.1:9337/json")).json()).find((x) => x.type === "page" && /^https?:\/\/localhost/.test(x.url)); } catch {} if (!t) await sleep(1000); }
  try { ws?.close(); } catch {}
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
const ev = async (e) => (await new Promise((r) => { const id = ++cs; pending.set(id, r); ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: e, awaitPromise: true, returnByValue: true } })); })).result?.result?.value;
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const waitFor = async (id, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await ev(`!!${q(id)}`).catch(() => false)) return true; await sleep(300); } return false; };
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); return true })()`);
const notifCount = (marker) => (sh("dumpsys notification --noredact").replace(/\r/g, "").match(new RegExp(`android\\.text=String \\([^)]*${marker}`, "g")) ?? []).length;
const anyMsgNotifs = () => (sh("dumpsys notification --noredact").replace(/\r/g, "").match(/android\.text=String \([^)]*QAB/g) ?? []).length;

adb("wait-for-device");
try { sh(`pm uninstall ${PKG}`); } catch {}
adb("install", "-r", APK);
sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`);
try { sh(`dumpsys deviceidle whitelist +${PKG}`); } catch {}
sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000); await attach();
await waitFor("signin-email", 30000);
await fill("signin-email", email); await fill("signin-password", password); await ev(`${q("signin-submit")}.click()`);
out.signedIn = await waitFor("screen-messages", 20000);
await sleep(35000); // one watcher tick sets the watermark

// ---- #4: one message notification; tap it the two ways a user can (A: the collapsed group's line, B: expand, then the row)
const dump = () => { sh("uiautomator dump /sdcard/qab-ui.xml"); return [...sh("cat /sdcard/qab-ui.xml").matchAll(/<node [^>]*>/g)].map((m) => m[0]); };
const centre = (n) => { const b = n.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/); return b ? [(+b[1] + +b[3]) >> 1, (+b[2] + +b[4]) >> 1] : null; };
async function landedOn(expected) { const seen = []; for (let i = 0; i < 12; i++) { await sleep(1000); try { await attach(); const p = await ev("location.pathname"); seen.push(p); if (p === expected) break; } catch { seen.push("?"); } } return { seen: [...new Set(seen)], ok: seen.at(-1) === expected }; }
async function oneNotif(marker) {
  sh("input keyevent KEYCODE_HOME"); await sleep(1500);
  await hook([gm(`@U ${marker} แตะเพื่อเปิด`)]);
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && notifCount(marker) === 0) await sleep(1000);
  const items = (await api("GET", "/messages?tab=notified&limit=50", UT)).items ?? [];
  return { ms: Date.now() - t0, id: items.find((m) => JSON.stringify(m).includes(marker))?.id, inShade: anyMsgNotifs() };
}
// A: collapsed group, tap its visible first line ("[LINE · …")
let n = await oneNotif("QABF-TAPA");
sh("cmd statusbar expand-notifications"); await sleep(1500);
let line = dump().find((x) => /text="\[LINE ·/.test(x));
out.A = { notifiedMs: n.ms, msgNotifsInShade: n.inShade, tapped: line ? centre(line) : "no [LINE line" };
shot("01a-shade"); if (line) sh(`input tap ${centre(line).join(" ")}`);
Object.assign(out.A, await landedOn(`/messages/${n.id}`)); out.A.expected = `/messages/${n.id}`; shot("02a-after-tap");
// B: expand the group first, then tap the row that carries the message text
n = await oneNotif("QABF-TAPB");
sh("cmd statusbar expand-notifications"); await sleep(1500);
const chev = dump().find((x) => /expand_button|content-desc="Expand"|resource-id="android:id\/expand_button"/.test(x));
if (chev) { sh(`input tap ${centre(chev).join(" ")}`); await sleep(1500); }
const row = dump().find((x) => x.includes("QABF-TAPB"));
out.B = { notifiedMs: n.ms, msgNotifsInShade: n.inShade, expanded: !!chev, tapped: row ? centre(row) : "no row" };
shot("01b-expanded"); if (row) sh(`input tap ${centre(row).join(" ")}`);
Object.assign(out.B, await landedOn(`/messages/${n.id}`)); out.B.expected = `/messages/${n.id}`; shot("02b-after-tap");
// C: #2 — app swiped away from recents (not force-stopped), shade collapsed, then one message
sh("cmd statusbar collapse"); sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000);
sh("input keyevent KEYCODE_APP_SWITCH"); await sleep(2500); shot("01c-recents");
sh("input swipe 360 900 360 100 300"); await sleep(2500);
sh("input keyevent KEYCODE_HOME"); await sleep(2000);
const svc = sh(`dumpsys activity services ${PKG}`);
out.C = { serviceAfterSwipe: /ServiceRecord/.test(svc), processAfterSwipe: sh(`pidof ${PKG}`).length > 0 };
n = await oneNotif("QABF-SWIPED");
out.C.notifiedMs = notifCount("QABF-SWIPED") > 0 ? n.ms : `none in ${n.ms} ms`;
const items = (await api("GET", "/messages?tab=notified&limit=50", UT)).items ?? [];
sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(4000); await attach();

// ---- #17: list → row → system BACK
await ev(`location.pathname !== '/messages' && history.length && (history.pushState({}, '', '/messages'), dispatchEvent(new PopStateEvent('popstate')))`).catch(() => {});
await ev(`${q("tab-messages")}?.click()`).catch(() => {});
await waitFor("screen-messages", 10000);
const rowId = items.find((m) => JSON.stringify(m).includes("QABF-LIST1"))?.id;
await waitFor(`row-${rowId}`, 10000);
await ev(`${q(`row-${rowId}`)}.click()`);
await waitFor("screen-message-detail", 10000);
out.backFrom = await ev("location.pathname"); out.historyLength = await ev("history.length");
shot("03-detail-before-back");
sh("input keyevent KEYCODE_BACK"); await sleep(3000);
const focus = sh("dumpsys window | grep -E 'mCurrentFocus'").replace(/\s+/g, " ");
out.afterBackForeground = /com\.develyst\.cornerchat/.test(focus);
try { await attach(); out.afterBackPath = await ev("location.pathname"); } catch (e) { out.afterBackPath = `attach failed`; }
shot("04-after-back");
sh("input keyevent KEYCODE_BACK"); await sleep(3000);
out.afterSecondBackForeground = /com\.develyst\.cornerchat/.test(sh("dumpsys window | grep -E 'mCurrentFocus'"));
try { await attach(); out.afterSecondBackPath = await ev("location.pathname"); } catch { out.afterSecondBackPath = "attach failed"; }

try { sh(`pm uninstall ${PKG}`); } catch {}
try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9337"]); } catch {}
console.log(JSON.stringify(out, null, 2));
writeFileSync(join(here, "emu-focus-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), ...out }, null, 2));
process.exit(0);
