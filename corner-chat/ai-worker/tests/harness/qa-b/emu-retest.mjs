// QA Team B (Tefany) — TEST-005 re-test after TASK-037/038: #4 (collapsed-group tap), #5 (oldest row), #4 after a swipe
// from recents, #17 back key per D46, and back with a dialog/menu open (D46 extended).
//   node emu-retest.mjs <apk>      needs `bun stack.ts` running (back :8192, fake LINE, AI stub); emulator-5554 only.
// Taps go where a user taps: the collapsed group card, or a row after expanding. Routes are read from the WebView.
// Prints paths, counts and booleans only. Throwaway harness; all data made up.
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
const shot = (n) => writeFileSync(join(here, "shots", `r${n}.png`), execFileSync(ADB, ["-s", DEV, "exec-out", "screencap", "-p"], { maxBuffer: 64 << 20 }));
const checks = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass }); console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`); };
const api = async (m, p, t, b) => { const r = await fetch(`${API}${p}`, { method: m, headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(b ? { "Content-Type": "application/json" } : {}) }, body: b ? JSON.stringify(b) : undefined }); const x = await r.text(); try { return JSON.parse(x); } catch { return x; } };
const hook = async (events) => { const body = JSON.stringify({ destination: "x", events }); await fetch(`${API}/webhooks/line`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": createHmac("sha256", LINE_SECRET).update(body).digest("base64") }, body }); };
const tag = Date.now().toString(36); let seq = 0;
const L1 = `UqabR${tag}l1`.padEnd(33, "0"), M = `UqabR${tag}mm`.padEnd(33, "0"), G1 = `CqabR${tag}g1`.padEnd(33, "0");
const gm = (text) => ({ type: "message", timestamp: Date.now(), replyToken: `rr-${++seq}`, source: { type: "group", groupId: G1, userId: M }, message: { id: `qabR-${tag}-${++seq}`, type: "text", text, mention: { mentionees: [{ index: 0, length: 3, type: "user", userId: L1 }] } } });

// ---------- data
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).token;
const email = `r-${tag}@qa-b.test`, password = `pw-r-${tag}`;
await api("POST", "/admin/users", OT, { name: "ผู้ใช้ทดสอบซ้ำ", email, password });
const UT = (await api("POST", "/auth/login", null, { email, password })).token;
await api("PUT", "/conditions/settings", UT, { bar: 70, sentences: "แจ้งเรื่องงาน" });
const rule = await api("POST", "/conditions/rules", UT, { kind: "keyword", value: "โปรโมชั่น", action: "never" });
await hook([{ type: "message", timestamp: Date.now(), replyToken: "rr-dm", source: { type: "user", userId: L1 }, message: { id: `qabR-${tag}-dm`, type: "text", text: (await api("POST", "/channels/line/link-code", UT)).code } }]);
await hook([{ type: "join", timestamp: Date.now(), replyToken: "rr-j", source: { type: "group", groupId: G1 } }]);
await hook([gm("@U QABR-SEED รายการตั้งต้น")]);
await sleep(4000);
const idOf = async (marker) => ((await api("GET", "/messages?tab=notified&limit=100", UT)).items ?? []).find((m) => JSON.stringify(m).includes(marker))?.id;

// ---------- WebView
let ws, pending, cs = 0;
async function attach() {
  let sock = ""; for (let i = 0; i < 40 && !sock; i++) { sock = (sh("cat /proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ""; if (!sock) await sleep(1000); }
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9338"]); } catch {}
  execFileSync(ADB, ["-s", DEV, "forward", "tcp:9338", `localabstract:${sock}`]);
  let t; for (let i = 0; i < 40 && !t; i++) { try { t = (await (await fetch("http://127.0.0.1:9338/json")).json()).find((x) => x.type === "page" && /^https?:\/\/localhost/.test(x.url)); } catch {} if (!t) await sleep(1000); }
  if (!t) throw new Error("no app page");
  try { ws?.close(); } catch {}
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
// a page reload kills the socket and the answer never comes: time out after 5 s instead of hanging
const ev = async (e) => (await Promise.race([
  new Promise((r) => { const id = ++cs; pending.set(id, r); try { ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: e, awaitPromise: true, returnByValue: true } })); } catch {} }),
  new Promise((_, rej) => setTimeout(() => rej(new Error("devtools timeout")), 5000)),
])).result?.result?.value;
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const has = (id) => ev(`!!${q(id)}`).catch(async () => { try { await attach(); } catch {} return false; });
// on screen = present AND painted (antd-mobile keeps a closed popover in the DOM, hidden)
const visible = (id) => ev(`(() => { const e = ${q(id)}; if (!e) return false; const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
  let p = e; while (p) { const ps = getComputedStyle(p); if (ps.display === 'none' || ps.visibility === 'hidden' || ps.opacity === '0') return false; p = p.parentElement; }
  return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; })()`).catch(() => false);
const toChannelsTop = async () => { await click("tab-channels").catch(() => {}); for (let i = 0; i < 4 && !(await has("screen-channels")); i++) { await click("nav-back").catch(() => {}); await sleep(800); } return has("screen-channels"); };
const waitFor = async (id, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await has(id)) return true; await sleep(300); } return false; };
const click = (id) => ev(`${q(id)}.click()`);
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); return true })()`);
const path = () => ev("location.pathname").catch(() => "?");
const focusIsApp = () => /com\.develyst\.cornerchat/.test(sh("dumpsys window | grep -E 'mCurrentFocus'"));
const back = async () => { sh("input keyevent KEYCODE_BACK"); await sleep(1800); };
// ---------- shade
const notifText = () => sh("dumpsys notification --noredact").replace(/\r/g, "");
const msgNotifs = () => (notifText().match(/android\.text=String \([^)]*QABR/g) ?? []).length;
const waitNotif = async (marker, ms = 90000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (notifText().includes(marker)) return Date.now() - t0; await sleep(1000); } return null; };
const dump = () => { sh("uiautomator dump /sdcard/qab-ui.xml"); return [...sh("cat /sdcard/qab-ui.xml").matchAll(/<node [^>]*>/g)].map((m) => m[0]); };
const centre = (n) => { const b = n.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/); return b ? [(+b[1] + +b[3]) >> 1, (+b[2] + +b[4]) >> 1] : null; };
async function landed(expected) { const seen = []; for (let i = 0; i < 12; i++) { await sleep(1000); try { await attach(); const p = await path(); seen.push(p); if (p === expected) break; } catch { seen.push("?"); } } return { seen: [...new Set(seen)].join(" → "), ok: seen.at(-1) === expected }; }
async function tapCollapsed() { sh("cmd statusbar expand-notifications"); await sleep(1500); const n = dump().find((x) => /text="\[LINE ·/.test(x)); if (n) sh(`input tap ${centre(n).join(" ")}`); return !!n; }

async function section(name, fn) { try { await fn(); } catch (e) { check(name, "section error", "none", String(e.message).split("\n")[0], false); try { shot(`x-${name}`); } catch {} } }

adb("wait-for-device");
for (let i = 0; i < 150 && sh("getprop sys.boot_completed") !== "1"; i++) await sleep(2000);
try { sh(`pm uninstall ${PKG}`); } catch {}
adb("install", "-r", APK);
sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`);
try { sh(`dumpsys deviceidle whitelist +${PKG}`); } catch {}
sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(6000); await attach();
await waitFor("signin-email", 30000);
await fill("signin-email", email); await fill("signin-password", password); await click("signin-submit");
check("setup", "signed in on the APK", "screen-messages", await waitFor("screen-messages", 20000), true);
await sleep(35000); // one watcher tick sets the watermark

// ---------- #4: three messages, collapsed tap → the NEWEST; #5: expand → oldest row → the OLDEST
await section("T5#4", async () => {
  sh("input keyevent KEYCODE_HOME"); await sleep(1500);
  for (const m of ["QABR-N1", "QABR-N2", "QABR-N3"]) { await hook([gm(`@U ${m} ข้อความ ${m}`)]); await waitNotif(m); await sleep(1500); }
  check("T5#4", "precondition: 3 message notifications in the shade", "3", msgNotifs(), msgNotifs() === 3);
});
await section("T5#5", async () => {
  sh("input keyevent KEYCODE_HOME"); await sleep(1500);
  sh("cmd statusbar expand-notifications"); await sleep(1500);
  const chev = dump().find((x) => /expand_button|content-desc="Expand"/.test(x));
  if (chev) { sh(`input tap ${centre(chev).join(" ")}`); await sleep(1500); }
  const nodes5 = dump(); console.log(`#5 shade texts: ${nodes5.map((x) => x.match(/text="([^"]*QABR[^"]*)"/)?.[1]).filter(Boolean).join(' | ')}`); const row = nodes5.find((x) => x.includes("QABR-N1"));
  shot("02-expanded");
  if (row) sh(`input tap ${centre(row).join(" ")}`);
  const want = `/messages/${await idOf("QABR-N1")}`;
  const r = await landed(want);
  check("T5#5", "expanded group: tap the oldest row (N1) → that message", want.slice(0, 22) + "…", `${!!chev}/${!!row} · ${r.seen}`, !!row && r.ok);
});
await section("T5#4", async () => {
  sh("input keyevent KEYCODE_HOME"); await sleep(1500);
  await hook([gm("@U QABR-N4 ข้อความ QABR-N4")]); await waitNotif("QABR-N4"); await sleep(1500);
  const inShade = msgNotifs();
  const tapped = await tapCollapsed(); shot("01-collapsed");
  const want = `/messages/${await idOf("QABR-N4")}`;
  const r = await landed(want);
  check("T5#4", "collapsed group tap (with older ones in the shade) opens the newest message (N4)", want.slice(0, 22) + "…", `${inShade} in shade · ${tapped} · ${r.seen} · left in shade after: ${msgNotifs()}`, tapped && r.ok);
});
await section("T5#4b", async () => {
  // app removed from recents, then one new message, tap the collapsed group (Silver's UNVERIFIED)
  sh("input keyevent KEYCODE_APP_SWITCH"); await sleep(2500);
  sh("input swipe 360 900 360 100 300"); await sleep(2500);
  sh("input keyevent KEYCODE_HOME"); await sleep(2000);
  await hook([gm("@U QABR-AFTERSWIPE หลังปัดแอปทิ้ง")]);
  const ms = await waitNotif("QABR-AFTERSWIPE");
  const tapped = await tapCollapsed();
  const want = `/messages/${await idOf("QABR-AFTERSWIPE")}`;
  const r = await landed(want);
  check("T5#4", "after a swipe from recents: notified, collapsed tap → that message", want.slice(0, 22) + "…", `${ms} ms · ${tapped} · ${r.seen}`, ms !== null && tapped && r.ok);
});

// ---------- #17: back key per D46
const results17 = [];
async function backCase(label, go, expectPath, expectHome = false) {
  await go(); await sleep(1500);
  const from = await path();
  await back();
  const home = !focusIsApp();
  let to = "(app not in front)";
  if (!home) { try { await attach(); to = await path(); } catch { to = "?"; } }
  const ok = expectHome ? home : (!home && to === expectPath);
  results17.push(`${label}: ${from} → ${expectHome ? (home ? "HOME" : `stayed ${to}`) : to}${ok ? "" : " ✗"}`);
  if (home) { sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); await attach(); }
  return ok;
}
const nav = async (route) => { await ev(`window.history.pushState({}, '', '${route}'); dispatchEvent(new PopStateEvent('popstate'))`); await sleep(1200); };
await section("T5#17", async () => {
  sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); await attach();
  await click("tab-messages").catch(() => {}); await waitFor("screen-messages");
  const id = await idOf("QABR-SEED");
  const r = [];
  r.push(await backCase("detail", async () => { await click("tab-messages"); await waitFor(`row-${id}`); await click(`row-${id}`); await waitFor("screen-message-detail"); }, "/messages"));
  r.push(await backCase("line", async () => { await toChannelsTop(); await click("channels-open-line"); await waitFor("screen-line"); }, "/channels"));
  r.push(await backCase("names", async () => { await toChannelsTop(); await click("channels-open-line"); await waitFor("line-open-names"); await click("line-open-names"); await waitFor("screen-line-names"); }, "/channels/line"));
  r.push(await backCase("groups", async () => { await toChannelsTop(); await click("channels-open-line"); await waitFor("line-open-groups"); await click("line-open-groups"); await waitFor("screen-line-groups"); }, "/channels/line"));
  r.push(await backCase("zimbra", async () => { await toChannelsTop(); await click("channels-open-zimbra"); await waitFor("screen-zimbra"); }, "/channels"));
  r.push(await backCase("top /messages", async () => { await click("tab-messages"); await waitFor("screen-messages"); }, null, true));
  r.push(await backCase("top /conditions", async () => { await click("tab-conditions"); await waitFor("screen-conditions"); }, null, true));
  r.push(await backCase("top /channels", async () => { await click("tab-channels"); await waitFor("screen-channels"); }, null, true));
  check("T5#17", "back key (D46): sub-screen one step back; tab top leaves the app", "all ✓", results17.join(" | "), r.every(Boolean));
});

// ---------- D46 extended: back with an overlay open closes the overlay only
const results46 = [];
async function overlayCase(label, open, overlayId, stillScreen) {
  await open(); let opened = false; for (let i = 0; i < 15 && !opened; i++) { opened = await visible(overlayId); if (!opened) await sleep(300); }
  const from = await path();
  await back();
  const inFront = focusIsApp();
  let closed = false, samePath = false, screen = false;
  if (inFront) { try { await attach(); closed = !(await visible(overlayId)); samePath = (await path()) === from; screen = await has(stillScreen); } catch {} }
  const ok = opened && inFront && closed && samePath && screen;
  results46.push(`${label}: opened=${opened} inFront=${inFront} closed=${closed} samePath=${samePath}${ok ? "" : " ✗"}`);
  if (!inFront) { sh(`am start -n ${PKG}/${PKG}.MainActivity`); await sleep(3000); await attach(); }
  return ok;
}
await section("D46x", async () => {
  const r = [];
  r.push(await overlayCase("menu on /messages", async () => { await click("tab-messages"); await waitFor("screen-messages"); await click("menu-open"); }, "menu-signout", "screen-messages"));
  r.push(await overlayCase("sign-out dialog", async () => { await click("tab-messages"); await waitFor("screen-messages"); await click("menu-open"); await waitFor("menu-signout"); await click("menu-signout"); }, "signout-dialog", "screen-messages"));
  const stillSignedIn = (await path()) !== "/signin" && (await has("screen-messages"));
  r.push(await overlayCase("un-link dialog", async () => { await toChannelsTop(); await click("channels-open-line"); await waitFor("line-unlink"); await click("line-unlink"); }, "unlink-dialog", "screen-line"));
  const stillLinked = (await api("GET", "/channels", UT)).line?.linked === true;
  r.push(await overlayCase("rule delete dialog", async () => { await toChannelsTop(); await click("tab-conditions"); await waitFor("screen-conditions"); const found = await waitFor(`conditions-rule-delete-${rule.rule?.id}`, 10000); if (!found) { shot("03-conditions-no-rule"); console.log(`conditions texts: ${(await ev("document.querySelector('[data-testid=screen-conditions]')?.innerText ?? '<none>'")).replace(/s+/g, ' ').slice(0, 300)}`); } if (!found) console.log(`rule delete ids on screen: ${await ev("[...document.querySelectorAll('[data-testid^=conditions-rule]')].map((e) => e.dataset.testid).join(',')")} · want ${rule.rule?.id}`); await click(`conditions-rule-delete-${rule.rule?.id}`); }, "conditions-delete-dialog", "screen-conditions"));
  const ruleKept = ((await api("GET", "/conditions", UT)).rules ?? []).some((x) => x.id === rule.rule?.id);
  check("D46x", "back with an overlay open closes it only (no step back, no leaving), nothing confirmed", "all ✓ · still signed in · still linked · rule kept",
    `${results46.join(" | ")} · signedIn=${stillSignedIn} linked=${stillLinked} ruleKept=${ruleKept}`, r.every(Boolean) && stillSignedIn && stillLinked && ruleKept);
});

// ---------- logcat (DEF-1 stays fixed)
await section("T5#40", async () => {
  const all = execFileSync(ADB, ["-s", DEV, "logcat", "-d"], { encoding: "utf8", maxBuffer: 256 << 20 }).split("\n");
  const n = (re) => all.filter((l) => re.test(l)).length;
  const c = { messageText: n(/QABR/), password: n(/pw-r-/), bearer: n(/Bearer [A-Za-z0-9]/), capacitorVerbose: n(/V Capacitor: callback/) };
  check("T5#40", "logcat clean (counts only)", "all 0", JSON.stringify(c), Object.values(c).every((v) => v === 0));
});

try { sh(`pm uninstall ${PKG}`); } catch {}
try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9338"]); } catch {}
writeFileSync(join(here, "emu-retest-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), apk: APK, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
