// QA Team B (Tefany) — TEST-005 web rows + TEST-004 app-screen rows, on the app's browser build at 360×800.
// Needs `bun stack.ts` running (back :8192, app :3292, fake gateway :3992, fake LINE).
//   node test-005-web.mjs <playwright-core/index.mjs>   → one line per check; writes test-005-web-result.json, shots/
// Setup goes through the API and signed LINE webhooks (made-up secret, local only); what the user sees goes through
// data-testid. Proves screens/behaviour of the SAME React build the APK wraps, against the real local API.
// Does NOT prove Android: no push, no system back, localStorage instead of Capacitor Preferences, navigator.onLine
// instead of Android network state, Chrome fonts instead of the WebView's. Throwaway harness; all data made up.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHmac } from "node:crypto";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "shots"), { recursive: true });
const secrets = JSON.parse(readFileSync(
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json", "utf8"));
const APP = "http://127.0.0.1:3292", API = "http://127.0.0.1:8192/api/v1", LINE_SECRET = "qa-b-made-up-channel-secret";
const checks = [];
const check = (c, what, expected, actual, pass) => {
  checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`);
};
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  let json = null; try { json = t ? JSON.parse(t) : null; } catch { json = t; }
  return { status: r.status, json };
};
const hook = async (events) => {
  const body = JSON.stringify({ destination: "Uqab-oa", events });
  const r = await fetch(`${API}/webhooks/line`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": createHmac("sha256", LINE_SECRET).update(body).digest("base64") }, body });
  return r.status;
};
let seq = 0;
const mid = () => `qab5-${Date.now()}-${++seq}`;
const dm = (from, text) => ({ type: "message", timestamp: Date.now(), replyToken: `rt5-${++seq}`, source: { type: "user", userId: from }, message: { id: mid(), type: "text", text } });
const gmsg = (group, from, text, tagged, ts = Date.now()) => ({ type: "message", timestamp: ts, replyToken: `rt5-${++seq}`, source: { type: "group", groupId: group, userId: from }, message: { id: mid(), type: "text", text, mention: { mentionees: [{ index: 0, length: 3, type: "user", userId: tagged }] } } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settle() { await sleep(2500); }

// ---------- setup (API + webhooks)
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const tag = Date.now().toString(36);
const mk = async (n) => {
  const email = `w-${n}-${tag}@qa-b.test`, password = `pw-w-${n}-${tag}`;
  const u = (await api("POST", "/admin/users", OT, { name: `ผู้ใช้เว็บ ${n}`, email, password })).json.user;
  const t = (await api("POST", "/auth/login", null, { email, password })).json.token;
  await api("PUT", "/conditions/settings", t, { bar: 70, sentences: "แจ้งเรื่องงาน" });
  return { ...u, email, password, t };
};
const U1 = await mk("u1"), U2 = await mk("u2"), U3 = await mk("u3");
const L1 = `Uqab5${tag}l1`.padEnd(33, "0"), L2 = `Uqab5${tag}l2`.padEnd(33, "0"), M = `Uqab5${tag}mm`.padEnd(33, "0");
const G1 = `Cqab5${tag}g1`.padEnd(33, "0");
for (const [u, l] of [[U1, L1], [U2, L2]]) {
  const c = (await api("POST", "/channels/line/link-code", u.t)).json.code;
  await hook([dm(l, c)]);
}
await hook([{ type: "join", timestamp: Date.now(), replyToken: "rt5-j", source: { type: "group", groupId: G1 } }]);
const LONG = "ข้อความยาวมาก ".repeat(150) + "จบ";
// 2026-11-01 16:59:00Z = 23:59 Bangkok; 17:01Z = 00:01 Bangkok on 2 Nov
await hook([
  gmsg(G1, M, "@U1 QAB5-PASS ขอให้ส่งรายงานภายในวันนี้\nบรรทัดสอง\nบรรทัดสาม", L1, Date.parse("2026-11-01T16:59:00Z")),
  gmsg(G1, M, "@U1 QAB5-HOLD [HOLD] ขายครีมลดราคา", L1, Date.parse("2026-11-01T17:01:00Z")),
  gmsg(G1, M, "@U1 QAB5-DOWN [L2DOWN] ด่วนมาก", L1),
  gmsg(G1, M, `@U1 QAB5-LONG ${LONG}`, L1),
  gmsg(G1, M, "@U2 QAB5-SECRET-U2 ความลับของ U2", L2),
]);
await settle();
// paging: 32 more notified LINE messages for U1 (page size 30)
const bulk = Array.from({ length: 32 }, (_, i) => gmsg(G1, M, `@U1 QAB5-BULK-${String(i).padStart(2, "0")} งานชิ้นที่ ${i}`, L1, Date.parse("2026-10-30T03:00:00Z") + i * 60000));
for (let i = 0; i < bulk.length; i += 8) await hook(bulk.slice(i, i + 8));
await sleep(8000);
const items = async (u, tab) => (await api("GET", `/messages?tab=${tab}&limit=100`, u.t)).json?.items ?? [];
const n1 = await items(U1, "notified"), h1 = await items(U1, "held");
const idOf = (list, marker) => list.find((m) => JSON.stringify(m).includes(marker))?.id;
const ID = { pass: idOf(n1, "QAB5-PASS"), hold: idOf(h1, "QAB5-HOLD"), down: idOf(n1, "QAB5-DOWN"), long: idOf(n1, "QAB5-LONG"), u2: idOf(await items(U2, "notified"), "QAB5-SECRET-U2") };
check("setup", "made-up messages decided as stubbed", "notified 35 · held 1 · ids found", `notified ${n1.length} · held ${h1.length} · ${Object.values(ID).every(Boolean)}`, n1.length === 35 && h1.length === 1 && Object.values(ID).every(Boolean));

// ---------- browser
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, locale: "th-TH", timezoneId: "America/New_York" });
const page = await ctx.newPage();
const consoleLines = [];
page.on("console", (m) => consoleLines.push(m.text()));
const tid = (id) => page.getByTestId(id);
const shot = (n) => page.screenshot({ path: join(here, "shots", `b${n}.png`) });
const txt = async (id) => (await tid(id).first().innerText({ timeout: 3000 }).catch(() => "<absent>")).replace(/\s+/g, " ").trim();
const onScreen = (id, ms = 10000) => tid(id).first().waitFor({ timeout: ms }).then(() => true, () => false);
const signIn = async (u) => {
  await page.goto(`${APP}/signin`);
  await tid("signin-email").waitFor({ timeout: 60000 });
  await tid("signin-email").fill(u.email); await tid("signin-password").fill(u.password); await tid("signin-submit").click();
  return onScreen("screen-messages", 20000);
};
// reachability: control centre hit-tests to itself (or a child), page has no sideways scroll
async function reach(id) {
  const el = tid(id).first();
  if (!(await el.count())) return { ok: false, why: "absent" };
  await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
  return page.evaluate((testId) => {
    const n = document.querySelector(`[data-testid="${CSS.escape(testId)}"]`);
    const b = n.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const hit = document.elementFromPoint(x, y);
    const ok = !!hit && (n === hit || n.contains(hit) || hit.contains(n));
    const pageW = document.documentElement.scrollWidth, clientW = document.documentElement.clientWidth;
    return { ok: ok && pageW <= clientW && b.left >= -1 && b.right <= clientW + 1, why: `hit=${hit ? hit.tagName + "[" + (hit.getAttribute("data-testid") ?? "") + "]" : "null"} box=${Math.round(b.left)}..${Math.round(b.right)} page=${pageW}/${clientW}` };
  }, id);
}
// every interactive element on screen without a data-testid (own or on its control wrapper)
const missingTestIds = () => page.evaluate(() => {
  const els = [...document.querySelectorAll("button, input, textarea, select, a[href], [role=button], [role=tab], [role=switch], [role=slider]")]
    .filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden");
  return els.filter((e) => !e.closest("[data-testid]")).map((e) => `${e.tagName.toLowerCase()}${e.getAttribute("role") ? "[" + e.getAttribute("role") + "]" : ""}:${(e.textContent ?? e.getAttribute("aria-label") ?? "").trim().slice(0, 20)}`);
});
const walked = {};
async function visit(name, screenId) {
  const ok = await onScreen(screenId, 15000);
  const back = (await tid("nav-back").count()) ? await reach("nav-back") : null;
  const tabbar = (await tid("shell-tabbar").count()) ? await reach("tab-messages") : null;
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  walked[name] = { ok, url: page.url().replace(APP, ""), back: back?.ok ?? null, tabbar: tabbar?.ok ?? null, sideways: sw[0] > sw[1], missing: await missingTestIds() };
  await shot(`w-${name}`);
  return ok;
}

try {
  // ---------- #35 not signed in
  const redirects = [];
  for (const r of ["/messages", `/messages/${ID.pass}`, "/conditions", "/channels", "/channels/line", "/channels/line/names", "/channels/line/groups", "/channels/zimbra"]) {
    await page.goto(`${APP}${r}`);
    redirects.push(`${r}→${(await onScreen("screen-signin", 30000)) ? "signin" : page.url().replace(APP, "")}`);
  }
  check("T5#35", "not signed in: every route → /signin", "all signin", redirects.join(" "), redirects.every((x) => x.endsWith("→signin")));

  // ---------- U3 empty tabs (#12) + empty LINE screens (TEST-004 33c, 34a)
  await signIn(U3);
  await onScreen("list-empty");
  const emptyN = await txt("list-empty");
  await tid("list-tab-held").click(); await sleep(800);
  const emptyH = await txt("list-empty");
  check("T5#12", "empty tabs wording", "ยังไม่มีข้อความที่ต้องแจ้ง / ยังไม่มีข้อความที่ถูกกรองออก", `${emptyN} / ${emptyH}`, emptyN === "ยังไม่มีข้อความที่ต้องแจ้ง" && emptyH === "ยังไม่มีข้อความที่ถูกกรองออก");
  await shot("01-empty");
  await tid("tab-channels").click(); await onScreen("screen-channels");
  await tid("channels-open-line").first().click().catch(() => {});
  await onScreen("screen-line");
  const intro = await txt("line-intro"), code = await txt("line-code"), cd1 = await txt("line-countdown");
  await sleep(2200);
  const cd2 = await txt("line-countdown");
  check("T4#1", "link screen: intro, 6-digit code, countdown from ~10:00", "เชื่อม LINE: เพิ่มเพื่อน corner-chat แล้วส่งรหัสนี้ในแชต · code · รหัสหมดอายุใน 09:5x/10:00", `${intro} · ${code} · ${cd1} → ${cd2}`,
    intro === "เชื่อม LINE: เพิ่มเพื่อน corner-chat แล้วส่งรหัสนี้ในแชต" && /\d{6}/.test(code) && /^รหัสหมดอายุใน (10:00|09:5\d)$/.test(cd1) && cd1 !== cd2);
  await shot("02-line-code");
  const oldCode = code.match(/\d{6}/)?.[0];
  await tid("line-new-code").click(); await sleep(1500);
  const newCode = (await txt("line-code")).match(/\d{6}/)?.[0];
  const L3 = `Uqab5${tag}l3`.padEnd(33, "0");
  await hook([dm(L3, oldCode)]); await sleep(500);
  check("T4#1a", "ขอรหัสใหม่ replaces the code; the old one no longer links", "new ≠ old · still not linked", `${oldCode}→${newCode} · ${(await api("GET", "/channels", U3.t)).json?.line?.linked}`, newCode && newCode !== oldCode && (await api("GET", "/channels", U3.t)).json?.line?.linked === false);
  const t0 = Date.now();
  await hook([dm(L3, newCode)]);
  const linkedShown = await onScreen("line-linked", 10000);
  check("T4#1", "app shows linked without a manual reload (polls)", "เชื่อม LINE แล้ว + display name within ~3 s", `${await txt("line-linked")} · ${await txt("line-display-name")} · ${Date.now() - t0} ms`, linkedShown && (await txt("line-linked")).includes("เชื่อม LINE แล้ว") && Date.now() - t0 < 8000);
  await shot("03-line-linked");
  await tid("line-open-names").click(); await onScreen("screen-line-names");
  await onScreen("names-empty");
  check("T4#34a", "names empty wording", "ยังไม่มีชื่อ เพิ่มชื่อหรือชื่อเล่นที่เพื่อนใช้เรียกคุณ", await txt("names-empty"), (await txt("names-empty")) === "ยังไม่มีชื่อ เพิ่มชื่อหรือชื่อเล่นที่เพื่อนใช้เรียกคุณ");
  check("T4#36", "names screen title", "ชื่อที่ใช้เรียกคุณ (ใส่ชื่อเล่นได้หลายชื่อ)", await txt("screen-title"), (await txt("screen-title")) === "ชื่อที่ใช้เรียกคุณ (ใส่ชื่อเล่นได้หลายชื่อ)");
  for (const n of ["ต้น", "Ton"]) { await tid("name-input").fill(n); await tid("name-add").click(); await sleep(800); }
  await tid("name-delete-0").click(); await sleep(1000);
  await page.reload(); await onScreen("names-list");
  const namesApi = (await api("GET", "/channels/line/names", U3.t)).json?.names;
  check("T4#34", "add ต้น + Ton, delete the first, reload", "API and screen hold [Ton] only", `${await txt("names-list")} · ${JSON.stringify(namesApi)}`, JSON.stringify(namesApi) === '["Ton"]' && (await txt("names-list")).includes("Ton") && !(await txt("names-list")).includes("ต้น"));
  await shot("04-names");
  await tid("nav-back").click(); await onScreen("screen-line");
  await tid("line-open-groups").click(); await onScreen("screen-line-groups");
  await onScreen("groups-list");
  check("T4#33a", "U3 links after the OA is in G1 → G1 listed at once (fake LINE says member)", "กลุ่มทดสอบ listed", (await txt("groups-list")).slice(0, 60), (await txt("groups-list")).includes("กลุ่มทดสอบ"));
  await shot("05-groups-after-link");
  await tid("nav-back").click(); await onScreen("screen-line");
  await tid("line-unlink").click(); await onScreen("unlink-dialog");
  await tid("unlink-confirm").click(); await sleep(1500);
  const after = (await api("GET", "/channels", U3.t)).json?.line;
  check("T4#1d", "un-link from the app", "linked=false · names kept", `${JSON.stringify(after)} · ${JSON.stringify((await api("GET", "/channels/line/names", U3.t)).json?.names)}`, after?.linked === false && JSON.stringify((await api("GET", "/channels/line/names", U3.t)).json?.names) === '["Ton"]');

  // ---------- U1: lists, detail, walk
  await page.goto(`${APP}/signin`);
  await signIn(U1);
  await onScreen(`row-${ID.pass}`);
  const notifiedTxt = await txt("list");
  await tid("list-tab-held").click(); await onScreen(`row-${ID.hold}`);
  const heldTxt = await txt("list");
  check("T5#11", "tabs: passed under แจ้งแล้ว, held under ไม่ได้แจ้ง", "PASS row in notified, HOLD row in held only", `${notifiedTxt.includes("QAB5-PASS")}/${notifiedTxt.includes("QAB5-HOLD")} · ${heldTxt.includes("QAB5-HOLD")}/${heldTxt.includes("QAB5-PASS")}`,
    notifiedTxt.includes("QAB5-PASS") && !notifiedTxt.includes("QAB5-HOLD") && heldTxt.includes("QAB5-HOLD") && !heldTxt.includes("QAB5-PASS"));
  check("T5#11", "tab labels", "แจ้งแล้ว · ไม่ได้แจ้ง", `${await txt("list-tab-notified")} · ${await txt("list-tab-held")}`, (await txt("list-tab-notified")).includes("แจ้งแล้ว") && (await txt("list-tab-held")).includes("ไม่ได้แจ้ง"));
  await tid(`row-${ID.hold}`).click(); await onScreen("detail-why");
  const whyHold = await txt("detail-why");
  check("T5#11", "held detail: ทำไมไม่แจ้ง + reason", "ทำไมไม่แจ้ง · ไม่เกี่ยวกับงาน (QA-B stub) · ตรงเงื่อนไข 0% · เกณฑ์ 70%", whyHold, whyHold.includes("ทำไมไม่แจ้ง") && whyHold.includes("ไม่เกี่ยวกับงาน (QA-B stub)") && whyHold.includes("ตรงเงื่อนไข 0%") && whyHold.includes("เกณฑ์ 70%"));
  await shot("06-detail-held");
  check("T5#21", "held detail button", "แจ้ง", await txt("detail-correct"), (await txt("detail-correct")) === "แจ้ง");
  await page.goto(`${APP}/messages/${ID.pass}`); await onScreen("detail-why");
  const whyPass = await txt("detail-why");
  check("T5#21", "passed AI detail: about, text, why, score, bar, decided by, models, button", "ทำไมถึงแจ้ง · 100% · เกณฑ์ 70% · AI · โมเดล: a / b · ไม่ต้องแจ้ง · no ตอบกลับ (LINE)",
    `${await txt("detail-about")} | ${(await txt("detail-text")).slice(0, 40)} | ${whyPass} | ${await txt("detail-correct")} | reply=${await tid("detail-open-reply").count()}`,
    (await txt("detail-about")).includes("ขอให้ช่วยดูเรื่องงาน") && (await txt("detail-text")).includes("บรรทัดสาม") && whyPass.includes("ทำไมถึงแจ้ง") && whyPass.includes("ตรงเงื่อนไข 100%") && whyPass.includes("ตัดสินโดย: AI") && /โมเดล: .+ \/ .+/.test(whyPass) && (await txt("detail-correct")) === "ไม่ต้องแจ้ง" && (await tid("detail-open-reply").count()) === 0);
  await shot("07-detail-pass");
  await page.goto(`${APP}/messages/${ID.down}`); await onScreen("detail-why");
  check("T5#21", "AI-down detail", "about shows AI ไม่ได้ตรวจ · ตัดสินโดย: AI ไม่ได้ตรวจ", `${await txt("detail-about")} | ${await txt("why-decided-by")}`, (await txt("detail-about")).includes("AI ไม่ได้ตรวจ") && (await txt("why-decided-by")).includes("AI ไม่ได้ตรวจ"));
  // #19 long text
  await page.goto(`${APP}/messages/${ID.long}`); await onScreen("detail-text");
  const r19 = await reach("detail-correct");
  const sw19 = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  check("T5#19", "2,000+ char Thai message: detail scrolls, no sideways scroll, button reachable", "no sideways · button hit-tests", `${sw19} · ${r19.why}`, sw19 && r19.ok);
  await shot("08-detail-long");
  // #38 dates (browser in New York time)
  await page.goto(`${APP}/messages`); await onScreen(`row-${ID.pass}`);
  const rowPass = await txt(`row-${ID.pass}`);
  await tid("list-tab-held").click(); await onScreen(`row-${ID.hold}`);
  const rowHold = await txt(`row-${ID.hold}`);
  check("T5#38", "dates in Bangkok time from a New York browser", "PASS 23:59 on 1 พ.ย. · HOLD 00:01 on 2 พ.ย.", `${rowPass.match(/\d+ \S+ \d\d:\d\d/)?.[0]} · ${rowHold.match(/\d+ \S+ \d\d:\d\d/)?.[0]}`, /1 พ\.ย\.? 23:59/.test(rowPass) && /2 พ\.ย\.? 00:01/.test(rowHold));
  // #14 chips
  await tid("list-tab-notified").click(); await onScreen(`row-${ID.pass}`);
  await tid("chip-mail").click(); await sleep(1500);
  const mailList = await txt("list");
  await tid("chip-line").click(); await onScreen(`row-${ID.pass}`);
  const lineList = await txt("list");
  await tid("chip-all").click(); await onScreen(`row-${ID.pass}`);
  check("T5#14", "chips: อีเมล shows no LINE rows (no mail exists); LINE shows LINE rows", "mail → empty · line → rows", `${mailList.slice(0, 40)} · ${lineList.includes("QAB5-PASS")}`, !mailList.includes("QAB5") && lineList.includes("QAB5-PASS"));
  check("T5#14", "chip labels", "ทั้งหมด · อีเมล · LINE", `${await txt("chip-all")} · ${await txt("chip-mail")} · ${await txt("chip-line")}`, (await txt("chip-all")) === "ทั้งหมด" && (await txt("chip-mail")) === "อีเมล" && (await txt("chip-line")) === "LINE");
  // #15 paging (36 notified, page 30)
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 3000); await sleep(250); }
  await sleep(1500);
  const rowIds = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map((e) => e.getAttribute("data-testid")));
  check("T5#15", "scroll to the end loads the next page once", "35 rows, no duplicates", `${rowIds.length} rows · ${new Set(rowIds).size} unique`, rowIds.length === 35 && new Set(rowIds).size === 35);
  // #22 refresh
  await page.evaluate(() => window.scrollTo(0, 0));
  await hook([gmsg(G1, M, "@U1 QAB5-NEW มาใหม่หลังเปิดรายการ", L1)]); await settle();
  const sawBefore = (await txt("list")).includes("QAB5-NEW");
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 200 }] });
  for (let y = 210; y <= 560; y += 15) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y }] }); await sleep(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const pulled = await page.getByText("QAB5-NEW").first().waitFor({ timeout: 6000 }).then(() => true, () => false);
  let viaTab = false;
  if (!pulled) { await tid("tab-conditions").click(); await onScreen("screen-conditions"); await tid("tab-messages").click(); viaTab = await page.getByText("QAB5-NEW").first().waitFor({ timeout: 6000 }).then(() => true, () => false); }
  check("T5#22", "new message shows without restarting the app", "pull to refresh shows it", `before=${sawBefore} · pull=${pulled} · tab-switch=${viaTab}`, !sawBefore && (pulled || viaTab));

  // #16 walk every route by the app's own navigation, #18 testids
  await page.goto(`${APP}/messages`); await visit("messages", "screen-messages");
  await tid(`row-${ID.pass}`).click(); await visit("detail", "screen-message-detail");
  await tid("nav-back").click(); await onScreen("screen-messages");
  await tid("tab-conditions").click(); await visit("conditions", "screen-conditions");
  await tid("tab-channels").click(); await visit("channels", "screen-channels");
  await tid("channels-open-zimbra").first().click(); await visit("zimbra", "screen-zimbra");
  await tid("nav-back").click(); await onScreen("screen-channels");
  await tid("channels-open-line").first().click(); await visit("line", "screen-line");
  await tid("line-open-names").click(); await visit("line-names", "screen-line-names");
  await tid("nav-back").click(); await onScreen("screen-line");
  await tid("line-open-groups").click(); await visit("line-groups", "screen-line-groups");
  const groupsTxt = await txt("groups-list");
  await tid("nav-back").click(); await tid("nav-back").click(); await onScreen("screen-channels");
  await tid("menu-open").click(); await visit("signout-dialog-menu", "menu-signout");
  await page.keyboard.press("Escape");
  const walkSummary = Object.entries(walked).map(([k, v]) => `${k}:${v.ok ? "ok" : "MISSING"}${v.sideways ? "/SIDEWAYS" : ""}${v.back === false ? "/BACK-UNREACHABLE" : ""}`).join(" ");
  check("T5#16", "walk: messages, detail, conditions, channels, zimbra, line, names, groups, menu (reply needs a mail message)", "every screen reached by navigation, no sideways scroll, back arrow hit-tests", walkSummary,
    Object.values(walked).every((v) => v.ok && !v.sideways && v.back !== false));
  const missing = Object.entries(walked).flatMap(([k, v]) => v.missing.map((m) => `${k}:${m}`));
  check("T5#18", "every interactive element carries a data-testid (own or wrapper)", "0 missing", missing.length ? missing.join(" | ").slice(0, 400) : "0", missing.length === 0);
  check("T4#33", "U1's groups screen lists G1 (OA joined, U1 never wrote)", "1 group, กลุ่มทดสอบ", groupsTxt.slice(0, 80), groupsTxt.includes("กลุ่มทดสอบ"));
  await page.goto(`${APP}/channels/line/groups`); await onScreen("groups-help");
  check("T4#26", "help text present on the groups screen with a group", "กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว …", await txt("groups-help"), (await txt("groups-help")).startsWith("กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว"));

  // #28 / #30 isolation
  const seen = [];
  for (const r of ["/messages", "/conditions", "/channels", "/channels/line", "/channels/line/names", "/channels/line/groups"]) {
    await page.goto(`${APP}${r}`); await sleep(1500);
    if ((await page.locator("body").innerText()).includes("QAB5-SECRET-U2")) seen.push(r);
  }
  await page.goto(`${APP}/messages`); await tid("list-tab-held").click(); await sleep(1200);
  if ((await page.locator("body").innerText()).includes("QAB5-SECRET-U2")) seen.push("/messages held");
  check("T5#28", "U2's text on any of U1's screens", "none", seen.join(",") || "none", seen.length === 0);
  await page.goto(`${APP}/messages/${ID.u2}`);
  const errShown = await onScreen("detail-error");
  check("T5#30", "U1 types U2's message URL", "detail-error, no U2 text", `${errShown} · ${(await page.locator("body").innerText()).includes("QAB5-SECRET-U2")}`, errShown && !(await page.locator("body").innerText()).includes("QAB5-SECRET-U2"));

  // #23 / #25 / #27 offline (browser logic)
  await page.goto(`${APP}/messages`); await onScreen(`row-${ID.pass}`);
  await ctx.setOffline(true);
  await tid("tab-conditions").click(); await sleep(1000); await tid("tab-messages").click();
  const banner = await onScreen("offline-banner", 8000);
  const offList = (await txt("list")).includes("QAB5-PASS");
  check("T5#23", "offline: banner + the saved list", "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด + rows", `${banner ? await txt("offline-banner") : "no banner"} · rows=${offList}`, banner && (await txt("offline-banner")) === "ไม่มีอินเทอร์เน็ต กำลังแสดงข้อมูลล่าสุด" && offList);
  await shot("09-offline");
  await ctx.setOffline(false);
  await page.goto(`${APP}/messages/${ID.pass}`); await onScreen("detail-correct");
  const offlineNav = page.url();
  await ctx.setOffline(true);
  let corrErr = "not reached";
  if (await tid("detail-correct").count()) { await tid("detail-correct").click(); await sleep(2500); corrErr = (await tid("detail-correct-error").count()) ? await txt("detail-correct-error") : "no error shown"; }
  await shot("09b-offline-correct");
  await ctx.setOffline(false);
  await sleep(1500);
  const stillPassed = (await api("GET", `/messages/${ID.pass}`, U1.t)).json?.message?.outcome;
  check("T5#27", "correction tapped while offline", "visible error; message unchanged after reconnect", `${corrErr} · outcome now ${stillPassed} · (nav ${offlineNav.replace(APP, "")})`, corrErr !== "no error shown" && corrErr !== "not reached" && stillPassed === "notified");
  await page.goto(`${APP}/messages`); await onScreen(`row-${ID.pass}`);
  await sleep(1500);
  check("T5#25", "back online: banner gone, list loads", "no banner · rows", `${await tid("offline-banner").count()} · ${(await txt("list")).includes("QAB5-PASS")}`, (await tid("offline-banner").count()) === 0 && (await txt("list")).includes("QAB5-PASS"));

  // TEST-004 #33c: the OA leaves G1 → U1's groups screen is empty (wording + help text)
  // every group U1 has (earlier runs on the same stack leave their own G1 behind)
  const u1Groups = (await api("GET", "/channels/line/groups", U1.t)).json?.groups ?? [];
  await hook(u1Groups.map((g) => ({ type: "leave", timestamp: Date.now(), source: { type: "group", groupId: g.id } })));
  await page.goto(`${APP}/channels/line/groups`); await onScreen("screen-line-groups");
  await onScreen("groups-empty");
  check("T4#33c", "groups empty wording + help text (after the OA left G1)", "ยังไม่มีกลุ่ม … · help always shown", `${await txt("groups-empty")} · ${await txt("groups-help")}`,
    (await txt("groups-empty")) === "ยังไม่มีกลุ่ม เพิ่ม corner-chat เข้ากลุ่มไลน์ของคุณ แล้วกลุ่มจะขึ้นที่นี่" && (await txt("groups-help")) === "กลุ่มหนึ่งใส่บัญชีทางการได้แค่ตัวเดียว ถ้ากลุ่มมีบอทอื่นอยู่แล้ว จะเพิ่ม corner-chat ไม่ได้");
  await shot("05-groups-empty");
  await page.goto(`${APP}/messages`); await onScreen(`row-${ID.pass}`);

  // #33 / #32 sign-out then cache, browser back
  await tid("menu-open").click(); await tid("menu-signout").click(); await onScreen("signout-dialog");
  const dlg = await txt("signout-dialog");
  await tid("signout-confirm").click();
  const out = await onScreen("screen-signin");
  await page.goBack(); await sleep(1500);
  const backShows = (await page.locator("body").innerText()).includes("QAB5-");
  const blob = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  check("T5#33", "sign out: confirm, sign-in screen, browser back shows no data", "ออกจากระบบไหม · signin · no QAB5 text", `${dlg.slice(0, 16)} · ${out} · back shows data=${backShows}`, dlg.includes("ออกจากระบบไหม") && out && !backShows);
  check("T5#32", "sign-out clears the saved list", "no QAB5 text in storage", blob.includes("QAB5") ? "message text left in storage" : "clean", !blob.includes("QAB5"));

  // #37 MAIL_LOGIN_FAILED wording (mail host = closed local port)
  await signIn(U2);
  await page.goto(`${APP}/channels/zimbra`); await onScreen("zimbra-email-input");
  await tid("zimbra-email-input").fill(`w-u2-${tag}@qa-b.test`); await tid("zimbra-password-input").fill("made-up-mail-pw");
  await tid("zimbra-connect").click();
  await onScreen("zimbra-error", 40000);
  check("T5#37", "mail server unreachable (MAIL_SERVER_UNREACHABLE, a code the app has no text for) → generic Thai text, not the server message", "เกิดข้อผิดพลาด ลองอีกครั้ง", await txt("zimbra-error"), (await txt("zimbra-error")) === "เกิดข้อผิดพลาด ลองอีกครั้ง");
  await shot("10-zimbra-error");

  // #39 wording on the shell / channels
  await page.goto(`${APP}/channels`); await onScreen("screen-channels");
  const tabs = `${await txt("tab-messages")} · ${await txt("tab-conditions")} · ${await txt("tab-channels")}`;
  const chans = await page.locator('[data-testid="screen-channels"]').innerText();
  check("T5#39", "tab bar + channels screen wording", "ข้อความ · เงื่อนไขของฉัน · ช่องทาง · อีเมล Zimbra · LINE", `${tabs} | ${chans.replace(/\s+/g, " ").slice(0, 80)}`, tabs === "ข้อความ · เงื่อนไขของฉัน · ช่องทาง" && chans.includes("อีเมล Zimbra") && chans.includes("LINE"));
  await tid("menu-open").click();
  check("T5#39", "menu item", "ออกจากระบบ", await txt("menu-signout"), (await txt("menu-signout")) === "ออกจากระบบ");

  // #40 console
  const leaks = consoleLines.filter((l) => /QAB5|Bearer|ขอให้ส่งรายงาน|pw-w-/.test(l));
  check("T5#40", "browser console holds no token, password or message text", "0 lines", leaks.length ? leaks.slice(0, 3).join(" | ") : `0 of ${consoleLines.length}`, leaks.length === 0);
} catch (e) {
  check("x", "script error", "none", String(e.message).split("\n")[0], false);
  await shot("xx-error").catch(() => {});
} finally {
  await browser.close();
}
writeFileSync(join(here, "test-005-web-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, walked, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
