// TEST-001 / TEST-003 app-surface rows, on the app's browser build (Capacitor + React, SPEC-003: "tested with the same
// Playwright") at 360×800, headless Chrome. App: vite on 127.0.0.1:3192, VITE_FAKE=false, /api proxied to QA's own back
// end 127.0.0.1:8191 (fake gateway on :3991). Setup and the owner's actions go through the API; what the user sees goes
// through the app's data-testid attributes only.
//   node app-surface.mjs <playwright-core/index.mjs>
// Throwaway harness. All accounts and messages are made up.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "shots"), { recursive: true });
if (!process.env.QA_SECRETS) throw new Error("set QA_SECRETS (QA's secrets.json, outside the repo)");
const secrets = JSON.parse(readFileSync(process.env.QA_SECRETS, "utf8"));
const APP = "http://127.0.0.1:3192", API = "http://127.0.0.1:8191/api/v1";
const tag = Date.now().toString(36);
const checks = [];
const check = (c, what, expected, actual, pass) => {
  checks.push({ case: c, what, expected, actual: String(actual), pass });
  console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`);
};
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, json: t ? JSON.parse(t) : null };
};
const ingest = (userId, text, extra) => JSON.parse(execFileSync("bun", [join(here, "ingest-cli.ts"), userId, text, ...(extra ? [JSON.stringify(extra)] : [])], { encoding: "utf8" }).trim().split("\n").pop());

// ---------- setup (API)
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const mk = async (n) => {
  const email = `app-${n}-${tag}@qa-a.test`, password = `pw-app-${n}-${tag}`;
  const u = (await api("POST", "/admin/users", OT, { name: `ผู้ใช้แอป ${n}`, email, password })).json.user;
  return { ...u, email, password };
};
const U1 = await mk("u1"), U2 = await mk("u2"), U3 = await mk("u3");
const m1n = ingest(U1.id, "U1 ขอให้ยืนยันนัดประชุม [S71]");
const m1h = ingest(U1.id, "U1 ข้อความพักไว้ [S69]");
const m1x = ingest(U1.id, "U1 เกตเวย์ตอบเสีย [L2DOWN]");
const m2 = ingest(U2.id, "ความลับของ U2 ห้ามเห็น [S71]");
check("setup", "made-up messages decided", "notified/held/notified(ai_unavailable)/notified", [m1n, m1h, m1x, m2].map((m) => `${m.outcome}/${m.decidedBy}`).join(" "), m1n.outcome === "notified" && m1h.outcome === "held" && m1x.decidedBy === "ai_unavailable");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, locale: "th-TH" });
const page = await ctx.newPage();
const tid = (id) => page.getByTestId(id);
const shot = (n) => page.screenshot({ path: join(here, "shots", `a${n}.png`) });
const txt = async (id) => (await tid(id).first().innerText().catch(() => "<absent>")).replace(/\s+/g, " ").trim();
const signIn = async (email, password) => {
  await page.goto(`${APP}/signin`);
  await tid("signin-email").waitFor({ timeout: 30000 });
  await tid("signin-email").fill(email);
  await tid("signin-password").fill(password);
  await tid("signin-submit").click();
};
const onScreen = (id, ms = 10000) => tid(id).first().waitFor({ timeout: ms }).then(() => true, () => false);
const storageBlob = () => page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));

try {
  // ---------- TEST-001 #1 / #4: sign-in screen, wrong password, unknown email
  await page.goto(`${APP}/messages`);
  const redirected = await onScreen("screen-signin");
  check("T1#1", "not signed in → /messages redirects to sign-in", "screen-signin", page.url(), redirected);
  check("T1#1", "app sign-in title", "เข้าสู่ระบบ corner-chat", await txt("screen-title"), (await txt("screen-title")) === "เข้าสู่ระบบ corner-chat");
  await shot("01-signin");
  await signIn(U1.email, "definitely-wrong");
  await onScreen("signin-error");
  const wrongPw = await txt("signin-error");
  await signIn(`nobody-${tag}@qa-a.test`, "definitely-wrong");
  await onScreen("signin-error");
  const unknown = await txt("signin-error");
  check("T1#4", "wrong password / unknown email wording (same text)", "อีเมลหรือรหัสผ่านไม่ถูกต้อง ×2", `${wrongPw} | ${unknown}`, wrongPw === "อีเมลหรือรหัสผ่านไม่ถูกต้อง" && unknown === wrongPw);
  await shot("02-wrong-password");

  // ---------- U1 signs in; #7 lists hold only U1's
  await signIn(U1.email, U1.password);
  const inList = await onScreen("screen-messages", 15000);
  await onScreen(`row-${m1n.messageId}`);
  check("T1#1", "U1 signs in on the app → message list", "screen-messages", page.url(), inList);
  const notifiedText = await txt("list");
  check("T1#7", "notified tab: U1's notified rows, none of U2's", `row ${m1n.messageId.slice(0, 8)} present, U2 text absent`, notifiedText.slice(0, 160),
    (await tid(`row-${m1n.messageId}`).count()) === 1 && (await tid(`row-${m2.messageId}`).count()) === 0 && !notifiedText.includes("ความลับของ U2"));
  const aiDownRow = await txt(`row-${m1x.messageId}`);
  check("T3#14", "an ai_unavailable message on the list says so", "row contains AI ไม่ได้ตรวจ", aiDownRow, aiDownRow.includes("AI ไม่ได้ตรวจ"));
  const aiRow = await txt(`row-${m1n.messageId}`);
  check("T3#26", "list about line without the [channel · group] head (D42)", "ขอให้ยืนยันนัด, no '[LINE ·'", aiRow, aiRow.includes("ขอให้ยืนยันนัด") && !aiRow.includes("[LINE ·"));
  await shot("03-list-notified");
  await tid("list-tab-held").click();
  await onScreen(`row-${m1h.messageId}`);
  const heldText = await txt("list");
  check("T1#7", "held tab: U1's held row, none of U2's", "held row present", heldText.slice(0, 120), (await tid(`row-${m1h.messageId}`).count()) === 1 && !heldText.includes("ความลับของ U2"));
  // direct link to U2's message
  await page.goto(`${APP}/messages/${m2.messageId}`);
  const u2err = await onScreen("detail-error");
  const u2text = await page.locator("body").innerText();
  check("T1#7", "U1 opens U2's message by URL", "detail-error, no U2 text", u2err ? "detail-error shown" : "no error", u2err && !u2text.includes("ความลับของ U2"));

  // ---------- TEST-003 #12 why card, #22 held → แจ้ง
  await page.goto(`${APP}/messages/${m1h.messageId}`);
  await onScreen("detail-why");
  const why = await txt("detail-why");
  check("T3#12", "why card: header, reason, score, bar, decided by, models", "ทำไมไม่แจ้ง · 69 · เกณฑ์ 70% · AI · deepseek-flash / deepseek-v4-pro", why,
    why.includes("ทำไมไม่แจ้ง") && /69/.test(await txt("why-score")) && why.includes("เกณฑ์ 70%") && (await txt("why-decided-by")).includes("AI") && why.includes("deepseek-flash") && why.includes("deepseek-v4-pro"));
  await shot("04-detail-held-why");
  const corrLabel = await txt("detail-correct");
  await tid("detail-correct").first().click();
  const moved = await onScreen("detail-moved-by-you");
  const movedText = await txt("detail-moved-by-you");
  const apiAfter = (await api("GET", `/messages/${m1h.messageId}`, (await api("POST", "/auth/login", null, { email: U1.email, password: U1.password })).json.token)).json.message;
  check("T3#22", "held → button แจ้ง → moved", "button แจ้ง · คุณย้ายข้อความนี้มาเอง · API outcome notified, decidedBy user", `${corrLabel} · ${movedText} · ${apiAfter.outcome}/${apiAfter.decidedBy}`,
    corrLabel === "แจ้ง" && moved && movedText === "คุณย้ายข้อความนี้มาเอง" && apiAfter.outcome === "notified" && apiAfter.decidedBy === "user");
  const whyAfter = await txt("detail-why");
  check("T3#22", "why card still shows the system's decision after the move", "ทำไมไม่แจ้ง", whyAfter.slice(0, 60), whyAfter.includes("ทำไมไม่แจ้ง"));
  await shot("05-detail-moved");
  // #23 notified → ไม่ต้องแจ้ง
  await page.goto(`${APP}/messages/${m1n.messageId}`);
  await onScreen("detail-correct");
  const corr2 = await txt("detail-correct");
  await tid("detail-correct").first().click();
  await onScreen("detail-moved-by-you");
  await page.goto(`${APP}/messages`);
  await tid("list-tab-held").click();
  const nowHeld = await onScreen(`row-${m1n.messageId}`);
  check("T3#23", "notified → ไม่ต้องแจ้ง → in the held tab", "button ไม่ต้องแจ้ง · row in held", `${corr2} · ${nowHeld}`, corr2 === "ไม่ต้องแจ้ง" && nowHeld);

  // ---------- TEST-003 #20/#21 bar in the app; AC-2 rule in the app
  await tid("tab-conditions").click();
  await onScreen("screen-conditions");
  check("T3#21", "bar label", "แจ้งเมื่อตรงเงื่อนไขตั้งแต่ 70%", await txt("conditions-bar-label"), (await txt("conditions-bar-label")) === "แจ้งเมื่อตรงเงื่อนไขตั้งแต่ 70%");
  await tid("conditions-bar").focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  const label80 = await txt("conditions-bar-label");
  await tid("conditions-save").click();
  const saved = await onScreen("conditions-saved");
  const T1api = (await api("POST", "/auth/login", null, { email: U1.email, password: U1.password })).json.token;
  const barApi = (await api("GET", "/conditions", T1api)).json.bar;
  check("T3#20", "slider to 80 + save", "label 80% · saved · API bar 80", `${label80} · ${saved} · ${barApi}`, label80.includes("80%") && saved && barApi === 80);
  const m75 = ingest(U1.id, "หลังเปลี่ยนเกณฑ์ในแอป [S75]");
  check("T3#20", "next message after the app change (score 75, bar 80)", "held", m75.outcome, m75.outcome === "held");
  await tid("conditions-bar").focus();
  await page.keyboard.press("End");
  const label100 = await txt("conditions-bar-label");
  await page.keyboard.press("ArrowRight");
  const maxed = await tid("conditions-bar").inputValue();
  check("T3#21", "slider cannot go past 100 / below 0", "100% at End, value stays 100", `${label100} · ${maxed}`, label100.includes("100%") && maxed === "100");
  await page.keyboard.press("Home");
  check("T3#21", "slider Home", "0%", await txt("conditions-bar-label"), (await txt("conditions-bar-label")).includes(" 0%"));
  await tid("conditions-bar").focus();
  for (let i = 0; i < 70; i++) await page.keyboard.press("ArrowRight");
  await tid("conditions-save").click();
  await onScreen("conditions-saved");
  check("T3#20", "back to 70 + save", "API bar 70", (await api("GET", "/conditions", T1api)).json.bar, (await api("GET", "/conditions", T1api)).json.bar === 70);
  // rule from the app: keyword โปรโมชั่น → never
  await tid("conditions-add-kind-keyword").click();
  await tid("conditions-add-value").fill("โปรโมชั่น");
  await tid("conditions-add-action-never").click();
  await tid("conditions-add-submit").click();
  await page.waitForTimeout(1000);
  const rulesText = await txt("conditions-rules");
  check("T3#2", "rule added in the app shows in the list", "มีคำว่า … โปรโมชั่น … ไม่ต้องแจ้ง", rulesText, rulesText.includes("โปรโมชั่น") && rulesText.includes("ไม่ต้องแจ้ง"));
  await shot("06-conditions");
  const mRule = ingest(U1.id, "มีโปรโมชั่นพิเศษ [S100]");
  await page.goto(`${APP}/messages/${mRule.messageId}`);
  await onScreen("detail-why");
  const whyRule = await txt("detail-why");
  check("T3#2", "rule-held message: why card in the app", "held · ตัดสินโดย: กฎของคุณ · กฎของคุณ: มีคำว่า โปรโมชั่น", `${mRule.outcome} · ${whyRule}`,
    mRule.outcome === "held" && whyRule.includes("กฎของคุณ: มีคำว่า โปรโมชั่น") && (await txt("why-decided-by")).includes("กฎของคุณ"));
  await shot("07-detail-rule");

  // ---------- TEST-001 #11 / #10 disabled while signed in, then sign-in refused; offline cache cleared
  await page.goto(`${APP}/messages`);
  await onScreen("list");
  const beforeBlob = await storageBlob();
  check("T1#7", "while signed in, the offline cache holds U1's list (precondition)", "U1 text in storage", beforeBlob.includes("U1 ") ? "yes" : "no", beforeBlob.includes("U1 "));
  await api("POST", `/admin/users/${U1.id}/disable`, OT);
  await page.reload();
  const kicked = await onScreen("screen-signin", 15000);
  const afterBlob = await storageBlob();
  check("T1#11", "owner disables U1 → app's next load", "back to sign-in", page.url(), kicked);
  check("T1#7", "after the 401: no U1 message text and no token left in storage (TASK-029 fix)", "no 'U1 ', no live token", afterBlob.includes("U1 ") ? "U1 text still stored" : "clean", !afterBlob.includes("U1 "));
  await shot("08-kicked-after-disable");
  await signIn(U1.email, U1.password);
  await onScreen("signin-error");
  check("T1#10", "disabled U1 signs in on the app", "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล", await txt("signin-error"), (await txt("signin-error")) === "บัญชีนี้ถูกปิดใช้งาน ติดต่อผู้ดูแล");
  await shot("09-disabled-wording");
  await api("POST", `/admin/users/${U1.id}/enable`, OT);

  // ---------- TEST-001 #15 reset while signed in
  await signIn(U1.email, U1.password);
  await onScreen("screen-messages", 15000);
  await api("POST", `/admin/users/${U1.id}/password`, OT, { password: `pw-new-${tag}` });
  await tid("tab-conditions").click();
  const kicked2 = await onScreen("screen-signin", 15000);
  check("T1#15", "owner resets U1's password → the app's next action", "back to sign-in", page.url(), kicked2);
  await signIn(U1.email, U1.password);
  await onScreen("signin-error");
  const oldPw = await txt("signin-error");
  await signIn(U1.email, `pw-new-${tag}`);
  const newOk = await onScreen("screen-messages", 15000);
  check("T1#14", "old password refused, new works (app)", "อีเมลหรือรหัสผ่านไม่ถูกต้อง · list", `${oldPw} · ${newOk}`, oldPw === "อีเมลหรือรหัสผ่านไม่ถูกต้อง" && newOk);

  // ---------- sign-out ends the session and clears storage
  const tokenBefore = await page.evaluate(() => Object.values(localStorage).find((v) => /^[A-Za-z0-9_-]{30,}$/.test(v)) ?? null);
  await tid("menu-open").click();
  await tid("menu-signout").click();
  await onScreen("signout-dialog");
  const dlg = await txt("signout-dialog");
  await tid("signout-confirm").click();
  const out = await onScreen("screen-signin");
  const blobOut = await storageBlob();
  const oldTok = tokenBefore ? (await api("GET", "/me", tokenBefore)).status : "no token found in storage";
  check("T1#21", "sign-out: confirm, back to sign-in, storage clean, old token dead", "ออกจากระบบไหม · signin · no U1 text · /me 401", `${dlg.slice(0, 20)} · ${out} · ${blobOut.includes("U1 ") ? "U1 text left" : "clean"} · ${oldTok}`,
    dlg.includes("ออกจากระบบไหม") && out && !blobOut.includes("U1 ") && oldTok === 401);

  // ---------- TEST-001 #16 lockout wording
  for (let i = 1; i <= 5; i++) { await signIn(U3.email, `wrong-${i}`); await onScreen("signin-error"); }
  await signIn(U3.email, U3.password);
  await onScreen("signin-error");
  check("T1#16", "right password after 5 wrong (app)", "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่", await txt("signin-error"), (await txt("signin-error")) === "ลองผิดหลายครั้งเกินไป รอสักครู่แล้วลองใหม่");
  await shot("10-too-many");
} catch (e) {
  check("x", "script error", "none", e.message.split("\n")[0], false);
  await shot("xx-error").catch(() => {});
} finally {
  await browser.close();
}
writeFileSync(join(here, "app-surface-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
