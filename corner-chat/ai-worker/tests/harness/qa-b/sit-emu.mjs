// QA Team B (Tefany) — TEST-006 rows 6–8 on SIT: the TASK-041 RELEASE APK on cc_phone_360 (emulator-5554 only; the real
// phone is never addressed). Signs in as QA-B's own SIT user (scratchpad file, never printed).
//   node sit-emu.mjs          → one line per check; writes sit-emu-result.json, shots/s*.png
// Row 6: sign in, both tabs, chips, menu, every reachable screen opens with no error state, sign out.
// Row 7: no cleartext (runtime: no "Cleartext HTTP traffic" refusals; the API base is https) and logcat holds no password,
//        token, e-mail or message text during rows 6 + 8 (counts only — the secrets are compared in-process, never printed).
// Row 8: the watcher's permanent notification shows after sign-in; airplane mode → offline wording + last list; recovers.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const U = JSON.parse(readFileSync("C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-sit-user.json", "utf8"));
const ADB = "H:/dev-tools/android-sdk/platform-tools/adb.exe", DEV = "emulator-5554", PKG = "com.develyst.cornerchat";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const adb = (...a) => execFileSync(ADB, ["-s", DEV, ...a], { encoding: "utf8", timeout: 120000, maxBuffer: 256 << 20 }).trim();
const sh = (c) => adb("shell", c);
const shot = (n) => writeFileSync(join(here, "shots", `s${n}.png`), execFileSync(ADB, ["-s", DEV, "exec-out", "screencap", "-p"], { maxBuffer: 64 << 20 }));
const checks = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass }); console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`); };

let ws, pending, cs = 0;
async function attach() {
  let sock = ""; for (let i = 0; i < 40 && !sock; i++) { sock = (sh("cat /proc/net/unix").match(/@?(webview_devtools_remote_\d+)/) ?? [])[1] ?? ""; if (!sock) await sleep(1000); }
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9340"]); } catch {}
  execFileSync(ADB, ["-s", DEV, "forward", "tcp:9340", `localabstract:${sock}`]);
  let t; for (let i = 0; i < 40 && !t; i++) { try { t = (await (await fetch("http://127.0.0.1:9340/json")).json()).find((x) => x.type === "page" && /^https?:\/\/localhost/.test(x.url)); } catch {} if (!t) await sleep(1000); }
  if (!t) throw new Error("no app page");
  try { ws?.close(); } catch {}
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
const ev = async (e) => (await Promise.race([
  new Promise((r) => { const id = ++cs; pending.set(id, r); try { ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: e, awaitPromise: true, returnByValue: true } })); } catch {} }),
  new Promise((_, rej) => setTimeout(() => rej(new Error("devtools timeout")), 5000)),
])).result?.result?.value;
const q = (id) => `document.querySelector('[data-testid="${id}"]')`;
const has = (id) => ev(`!!${q(id)}`).catch(async () => { try { await attach(); } catch {} return false; });
const waitFor = async (id, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await has(id)) return true; await sleep(300); } return false; };
const click = (id) => ev(`${q(id)}.click()`);
const text = (id) => ev(`(${q(id)}?.innerText ?? '<absent>').replace(/\\s+/g, ' ').trim()`).catch(() => "<absent>");
const fill = (id, v) => ev(`(() => { const e = ${q(id)}; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); return true })()`);
const path = () => ev("location.pathname").catch(() => "?");
const watcherPosted = () => /pkg=com\.develyst\.cornerchat[\s\S]*?android\.title=String \(corner-chat กำลังรอข้อความใหม่\)/.test(sh("dumpsys notification --noredact").replace(/\r/g, "")); // a posted record, not the channel's name
const errorIds = ["list-error", "detail-error", "conditions-error", "channels-error", "zimbra-error", "line-error", "names-error", "groups-error", "signin-error"];
const visibleErrors = () => ev(`${JSON.stringify(errorIds)}.filter((id) => { const e = document.querySelector('[data-testid="' + id + '"]'); return e && e.getBoundingClientRect().height > 0; })`).catch(() => ["?"]);

try {
  try { sh(`dumpsys deviceidle whitelist +${PKG}`); } catch {}
  sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`);
  sh("cmd connectivity airplane-mode disable");
  sh("logcat -c");
  sh(`am force-stop ${PKG}`);
  sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(5000);
  await attach();
  const origin = await ev("location.origin");
  check("T6#6", "release APK opens to sign-in", "/signin", `${await path()} (${origin})`, (await waitFor("signin-email", 30000)) && (await path()) === "/signin");
  shot("03-signin");
  await fill("signin-email", U.email); await fill("signin-password", U.password); await click("signin-submit");
  const inList = await waitFor("screen-messages", 30000);
  await sleep(3000);
  if (!/cornerchat/.test(sh("dumpsys window | grep mCurrentFocus"))) { sh("input keyevent KEYCODE_BACK"); await sleep(1500); await attach(); } // a system battery prompt, if any
  check("T6#6", "sign in as QA-B's SIT user → message list", "screen-messages, no error", `${inList} · errors ${JSON.stringify(await visibleErrors())}`, inList && (await visibleErrors()).length === 0);
  shot("04-list");

  // every reachable screen, by the app's own navigation
  const seen = {};
  const visit = async (name, screenId) => { const ok = await waitFor(screenId, 15000); await sleep(1500); const errs = await visibleErrors(); seen[name] = `${ok ? "ok" : "MISSING"}${errs.length ? " ERR:" + errs.join(",") : ""}`; shot(`05-${name}`); };
  await visit("messages", "screen-messages");
  await click("list-tab-held").catch(() => {}); await sleep(1500); seen["held tab"] = `${await has("list-empty") || await has("list") ? "ok" : "MISSING"}${(await visibleErrors()).length ? " ERR" : ""}`;
  await click("list-tab-notified").catch(() => {});
  for (const c of ["chip-mail", "chip-line", "chip-all"]) { await click(c).catch(() => {}); await sleep(1000); }
  seen["chips"] = (await visibleErrors()).length ? "ERR" : "ok";
  await click("menu-open"); seen["menu"] = (await waitFor("menu-signout", 5000)) ? "ok" : "MISSING"; shot("06-menu");
  sh("input keyevent KEYCODE_BACK"); await sleep(1500); await attach();
  await click("tab-conditions"); await visit("conditions", "screen-conditions");
  await click("tab-channels"); await visit("channels", "screen-channels");
  await click("channels-open-zimbra"); await visit("zimbra", "screen-zimbra");
  await click("nav-back"); await waitFor("screen-channels");
  await click("channels-open-line"); await visit("line", "screen-line");
  if (await has("line-open-names")) { await click("line-open-names"); await visit("names", "screen-line-names"); await click("nav-back"); await waitFor("screen-line"); }
  else seen["names"] = "not reachable (LINE not linked — expected for a new user)";
  if (await has("line-open-groups")) { await click("line-open-groups"); await visit("groups", "screen-line-groups"); await click("nav-back"); await waitFor("screen-line"); }
  else seen["groups"] = "not reachable (LINE not linked — expected for a new user)";
  const lineCode = (await text("line-code")).match(/\d{6}/) ? "a 6-digit code shown" : await text("line-code");
  seen["line code"] = lineCode;
  const bad = Object.entries(seen).filter(([, v]) => /MISSING|ERR/.test(v));
  check("T6#6", "every reachable screen opens with no error (SIT API)", "all ok", Object.entries(seen).map(([k, v]) => `${k}:${v}`).join(" | "), bad.length === 0);

  // row 8: watcher + offline
  await click("nav-back").catch(() => {}); await waitFor("screen-channels"); await click("tab-messages"); await waitFor("screen-messages");
  await sleep(4000);
  const notif = sh("dumpsys notification --noredact").replace(/\r/g, "");
  const watcher = /pkg=com\.develyst\.cornerchat[\s\S]*?android\.title=String \(corner-chat กำลังรอข้อความใหม่\)/.test(notif);
  check("T6#8", "the watcher's permanent notification shows after sign-in", "corner-chat กำลังรอข้อความใหม่", watcher ? "shown" : "absent", watcher);
  sh("cmd connectivity airplane-mode enable"); await sleep(4000);
  await click("tab-conditions").catch(() => {}); await sleep(1500); await click("tab-messages").catch(() => {}); await sleep(2500);
  const banner = await text("offline-banner");
  shot("07-airplane");
  check("T6#8", "airplane mode → offline wording + the last list", "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด", `${banner} · list=${await has("list") || await has("list-empty")}`, banner === "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด");
  sh("cmd connectivity airplane-mode disable"); await sleep(8000);
  await click("tab-conditions").catch(() => {}); await sleep(1500); await click("tab-messages").catch(() => {}); await sleep(3000);
  check("T6#8", "airplane off → banner gone, list loads from SIT", "no banner, no error", `banner=${await has("offline-banner")} · errors ${JSON.stringify(await visibleErrors())}`, !(await has("offline-banner")) && (await visibleErrors()).length === 0);

  // row 6: sign out
  await click("menu-open"); await waitFor("menu-signout"); await click("menu-signout"); await waitFor("signout-confirm"); await click("signout-confirm");
  const out = await waitFor("signin-email", 15000);
  await sleep(2000);
  const prefs = (() => { try { return sh(`run-as ${PKG} cat shared_prefs/CapacitorStorage.xml`); } catch { return "<run-as refused: release build>"; } })();
  check("T6#6", "sign out → sign-in screen; watcher notification gone", "signin · no watcher", `${out} · watcher posted=${watcherPosted()} · prefs: ${prefs.startsWith("<") ? prefs : "readable"}`, out && !watcherPosted());
  shot("08-signed-out");

  // row 7: logcat + cleartext at runtime
  const lc = execFileSync(ADB, ["-s", DEV, "logcat", "-d"], { encoding: "utf8", maxBuffer: 256 << 20 }).split("\n");
  const n = (pred) => lc.filter(pred).length;
  const c = {
    password: n((l) => l.includes(U.password)),
    email: n((l) => l.includes(U.email)),
    bearer: n((l) => /Bearer [A-Za-z0-9]/.test(l)),
    tokenPref: n((l) => /"key":"cc\.token","value":"[A-Za-z0-9]/.test(l)),
    capacitorVerbose: n((l) => /V Capacitor: callback/.test(l)),
    cleartextRefused: n((l) => /[Cc]leartext HTTP traffic/.test(l)),
    plainHttpToSit: n((l) => /http:\/\/cornerchat/.test(l)),
  };
  check("T6#7", "logcat during rows 6 + 8: no password / e-mail / token / bridge dump; no cleartext attempt", "all 0", `${JSON.stringify(c)} of ${lc.length} lines`, Object.values(c).every((v) => v === 0));
} catch (e) {
  check("x", "script error", "none", String(e.message).split("\n")[0], false);
  try { shot("xx-error"); } catch {}
} finally {
  try { sh("cmd connectivity airplane-mode disable"); } catch {}
  try { ws?.close(); } catch {}
  try { execFileSync(ADB, ["-s", DEV, "forward", "--remove", "tcp:9340"]); } catch {}
}
writeFileSync(join(here, "sit-emu-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), apkSha256: "9816a1b5f9986b52…", user: U.email, checks }, null, 2));
console.log(`\n${checks.filter((x) => x.pass).length}/${checks.length} checks passed`);
process.exit(0);
