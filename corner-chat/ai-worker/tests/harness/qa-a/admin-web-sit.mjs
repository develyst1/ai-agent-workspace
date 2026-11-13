// TEST-006 row 11 — the admin web UI walk on SIT, behind Cloudflare Access. Headless Chrome, 1280×800.
//   QA_BACK_REPO=… QA_CF_TOKEN_FILE=… node admin-web-sit.mjs <playwright-core/index.mjs>
// Access: the QA service token `corner-chat-qa` (TEST-006 § Update ~23:58). Its two values are read in-process from
// QA_CF_TOKEN_FILE (machine.local.md → "corner-chat QA Access token") and added ONLY to requests for the admin-web host —
// never to the API host (that would add headers the API's CORS does not allow and break the page). Never printed.
// The owner login comes from the back repo's .env, in-process, never printed. Users made here are `qa-sit-w…` and DISABLED at
// the end. AI settings are only OPENED, never saved (they are SIT-wide). Throwaway harness.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "shots"), { recursive: true });
const BACK = process.env.QA_BACK_REPO, TOK = process.env.QA_CF_TOKEN_FILE;
if (!BACK || !TOK) throw new Error("set QA_BACK_REPO and QA_CF_TOKEN_FILE");
const kv = (txt) => Object.fromEntries(txt.split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*[=:]\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]));
const env = kv(readFileSync(join(BACK, ".env"), "utf8")), cf = kv(readFileSync(TOK, "utf8"));
if (!env.OWNER_EMAIL || !env.OWNER_PASSWORD || !cf.CF_ACCESS_CLIENT_ID || !cf.CF_ACCESS_CLIENT_SECRET) throw new Error("owner login or Access token missing");
const WEB_HOST = "cornerchat-sit.develyst.online", WEB = `https://${WEB_HOST}`, API = "https://cornerchat-api-sit.develyst.online/api/v1";
const tag = Date.now().toString(36);
const U = { name: `qa-sit-w ${tag}`, email: `qa-sit-w-${tag}@qa-a.test`, pw: `pw-qa-sit-w-${tag}`, pw2: `pw2-qa-sit-w-${tag}` };
const checks = [], created = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass }); console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`); };
const apiLogin = async (email, password) => (await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })).status;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "th-TH" });
await ctx.route("**/*", (route) => {
  const req = route.request();
  if (new URL(req.url()).hostname === WEB_HOST) return route.continue({ headers: { ...req.headers(), "cf-access-client-id": cf.CF_ACCESS_CLIENT_ID, "cf-access-client-secret": cf.CF_ACCESS_CLIENT_SECRET } });
  return route.continue();
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 120)); });
const shot = (n) => page.screenshot({ path: join(here, "shots", `sit-w${n}.png`), fullPage: true });
const visible = (t) => page.getByText(t).filter({ visible: true }).first();

try {
  // Access: without the token the page must not open (sanity: a plain fetch, no headers)
  const bare = await fetch(`${WEB}/login`, { redirect: "manual" }).then((r) => `${r.status} ${r.headers.get("location")?.slice(0, 60) ?? ""}`);
  check("11", "without the token, Access stops the request", "302 to an Access login, or 403", bare, /^(30[1237]|403)/.test(bare) && !/^200/.test(bare));
  const resp = await page.goto(`${WEB}/login`);
  await visible("เข้าสู่ระบบผู้ดูแล corner-chat").waitFor({ timeout: 60000 });
  check("11", "with the QA token, the sign-in page opens", "200 · title เข้าสู่ระบบผู้ดูแล corner-chat", `${resp?.status()} · shown`, resp?.status() === 200);
  await shot("01-signin");
  // wrong password
  await page.getByLabel("อีเมล").fill(env.OWNER_EMAIL);
  await page.getByLabel("รหัสผ่าน").fill("wrong-password-qa");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  check("11", "wrong password on the SIT admin web", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", (await visible("อีเมลหรือรหัสผ่านไม่ถูกต้อง").waitFor({ timeout: 15000 }).then(() => "shown", () => "not shown")), true && (await visible("อีเมลหรือรหัสผ่านไม่ถูกต้อง").isVisible()));
  // owner signs in (the web talks to the SIT API cross-origin: CORS + the API, end to end)
  await page.getByLabel("รหัสผ่าน").fill(env.OWNER_PASSWORD);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  const inUsers = await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).waitFor({ timeout: 30000 }).then(() => true, () => false);
  check("11", "owner signs in → users page (web → SIT API, cross-origin)", "เพิ่มผู้ใช้ visible", page.url(), inUsers);
  // LINE push count panel
  const pushPanel = await visible("ข้อความ LINE ที่ส่งในเดือน").waitFor({ timeout: 10000 }).then(() => true, () => false);
  check("11", "the LINE push count panel shows", "ข้อความ LINE ที่ส่งในเดือน {month}", pushPanel ? "shown" : "not shown", pushPanel);
  await shot("02-users");
  // add a qa-sit user through the modal
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("ชื่อ").fill(U.name); await dlg.getByLabel("อีเมล").fill(U.email); await dlg.getByLabel("รหัสผ่านแรก").fill(U.pw);
  await dlg.getByRole("button", { name: "ยืนยัน" }).click();
  const row = page.locator("tr", { hasText: U.email });
  const listed = await row.waitFor({ timeout: 15000 }).then(() => true, () => false);
  if (listed) created.push(U.email.replace(/-[a-z0-9]+@/, "-…@"));
  const s1 = await apiLogin(U.email, U.pw);
  check("11", "add qa-sit-w through the web → listed → it signs in (API)", "row ใช้งานอยู่ · 200", `${listed ? (await row.innerText()).replace(/\s+/g, " ").slice(0, 70) : "not listed"} · ${s1}`, listed && s1 === 200);
  await shot("03-added");
  // duplicate
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
  await dlg.getByLabel("ชื่อ").fill("ซ้ำ"); await dlg.getByLabel("อีเมล").fill(U.email.toUpperCase()); await dlg.getByLabel("รหัสผ่านแรก").fill("another-pw-123");
  await dlg.getByRole("button", { name: "ยืนยัน" }).click();
  check("11", "duplicate email (upper case)", "อีเมลนี้มีผู้ใช้แล้ว", await visible("อีเมลนี้มีผู้ใช้แล้ว").waitFor({ timeout: 10000 }).then(() => "shown", () => "not shown"), await visible("อีเมลนี้มีผู้ใช้แล้ว").isVisible());
  await page.keyboard.press("Escape"); await dlg.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  // reset password
  await row.getByRole("button", { name: "ตั้งรหัสผ่านใหม่" }).click();
  await page.getByRole("dialog").getByLabel("รหัสผ่านใหม่").fill(U.pw2);
  await page.getByRole("dialog").getByRole("button", { name: "ยืนยัน" }).click();
  const resetOk = await visible("เปลี่ยนรหัสผ่านแล้ว").waitFor({ timeout: 15000 }).then(() => true, () => false);
  const o = await apiLogin(U.email, U.pw), nw = await apiLogin(U.email, U.pw2);
  check("11", "reset on the web → old / new", "เปลี่ยนรหัสผ่านแล้ว · 401 / 200", `${resetOk ? "shown" : "not shown"} · ${o} / ${nw}`, resetOk && o === 401 && nw === 200);
  // AI settings page: OPEN ONLY (SIT-wide settings are never saved here)
  await page.goto(`${WEB}/ai`);
  const aiOpen = await visible("ตั้งค่า AI กรองข้อความ").waitFor({ timeout: 20000 }).then(() => true, () => false);
  // run 1 read the page while it still said กำลังโหลด… — wait for the content itself, and measure how long it takes
  const t0 = Date.now();
  const loaded = await page.getByText(/ชั้นที่ 1/).filter({ visible: true }).first().waitFor({ timeout: 30000 }).then(() => true, () => false);
  const loadMs = Date.now() - t0;
  const aiText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  check("11", "AI settings page opens and loads (not saved)", "ตั้งค่า AI กรองข้อความ · both layers · deepseek shown, ≤ 30 s",
    `${aiOpen ? "shown" : "not shown"} · loaded ${loaded} in ${(loadMs / 1000).toFixed(1)} s · layer1 ${aiText.includes("ชั้นที่ 1")} · layer2 ${aiText.includes("ชั้นที่ 2")} · deepseek ${aiText.includes("deepseek")}${loaded ? "" : " · still: " + (aiText.includes("กำลังโหลด") ? "กำลังโหลด…" : aiText.slice(0, 60))}`,
    aiOpen && loaded && aiText.includes("ชั้นที่ 2") && aiText.includes("deepseek"));
  await shot("04-ai-settings");
  // disable the qa-sit user (footprint end state) — through the web
  await page.goto(`${WEB}/users`);
  await row.waitFor({ timeout: 15000 });
  await row.getByRole("button", { name: "ปิดใช้งาน" }).click();
  await page.getByText(`ปิดใช้งาน ${U.name} ไหม`).filter({ visible: true }).first().waitFor({ timeout: 5000 });
  await page.getByRole("button", { name: "ยืนยัน" }).last().click();
  await page.waitForTimeout(2000);
  const dis = await apiLogin(U.email, U.pw2);
  check("11", "disable on the web → the qa-sit user cannot sign in", "row ปิดใช้งาน · 403", `${(await row.innerText()).includes("ปิดใช้งาน")} · ${dis}`, dis === 403);
  await shot("05-disabled");
  // sign out
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  check("11", "sign out → back to sign-in", "sign-in title", await visible("เข้าสู่ระบบผู้ดูแล corner-chat").waitFor({ timeout: 10000 }).then(() => "shown", () => "not shown"), await visible("เข้าสู่ระบบผู้ดูแล corner-chat").isVisible());
  // The walk causes one 401 (wrong password) and one 409 (duplicate email) on purpose; Chrome logs every failed request.
  const unexpected = consoleErrors.filter((e) => !/status of (401|409)/.test(e));
  check("11", "no unexpected browser console errors (the walk's own 401 + 409 excluded)", "0", `${unexpected.length} unexpected of ${consoleErrors.length}${unexpected.length ? " — " + unexpected.slice(0, 2).join(" | ") : ""}`, unexpected.length === 0);
} catch (e) {
  check("x", "script error", "none", e.message.split("\n")[0], false);
  await shot("xx-error").catch(() => {});
} finally {
  await browser.close();
}
writeFileSync(join(here, "admin-web-sit-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, created, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
