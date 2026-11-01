// Throwaway (TASK-008 REWORK item 3): the DoD's live lines against the REAL back end (TASK-002), 1280 px, screenshots next to this file.
// Needs: the real back end on :8080 (its own local Postgres on 5433) and the front on :3000.
// The owner's login is read from the back end's own .env at run time — it is never printed and never stored here.
// usage: node shoot-live.mjs <playwright-core/index.mjs> <path to corner-chat-back/.env>
import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const env = Object.fromEntries(
  readFileSync(process.argv[3], "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const OWNER_EMAIL = env.OWNER_EMAIL, OWNER_PASSWORD = env.OWNER_PASSWORD;
if (!OWNER_EMAIL || !OWNER_PASSWORD) throw new Error("OWNER_EMAIL / OWNER_PASSWORD missing in the back end's .env");

const out = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const API = "http://localhost:8080/api/v1";
const stamp = Date.now().toString(36);
const U1 = { name: `U1 live ${stamp}`, email: `u1-live-${stamp}@example.test`, pw1: `first-${stamp}-pw`, pw2: `second-${stamp}-pw` };
const ok = [];
const check = (name, pass, detail = "") => { ok.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name} ${detail}`); };

const login = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const shot = (file) => page.screenshot({ path: join(out, file) });
const token = () => page.evaluate(() => sessionStorage.getItem("corner-chat.token"));
const signIn = async (email, password) => {
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.keyboard.press("Enter");
};
const row = () => page.getByRole("row").filter({ hasText: U1.email });
const adminUsers = async () => {
  const tk = await token();
  const res = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${tk}` } });
  return (await res.json()).users;
};
const u1Status = async () => (await adminUsers()).find((u) => u.email === U1.email)?.status;

await page.goto(`${BASE}/login`);
await page.getByLabel("อีเมล").waitFor();
await shot("live-01-signin.png");
await signIn(OWNER_EMAIL, OWNER_PASSWORD);
await page.waitForURL("**/users");
await page.getByText(OWNER_EMAIL).first().waitFor();
check("owner signs in to the admin web (real API) → users page", (await token()) !== null);

// add U1
await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
const dialog = page.getByRole("dialog");
await dialog.getByLabel("ชื่อ").fill(U1.name);
await dialog.getByLabel("อีเมล").fill(U1.email);
await dialog.getByLabel("รหัสผ่านแรก").fill(U1.pw1);
await page.waitForTimeout(600);
await shot("live-02-add-modal.png");
await dialog.getByRole("button", { name: "ยืนยัน" }).click();
await row().waitFor();
await page.getByRole("dialog").waitFor({ state: "detached" });
check("U1 listed after add", (await row().count()) === 1);
await page.waitForTimeout(400);
await shot("live-03-row-actions.png");
check("U1 can sign in with the first password (AC-1, API)", (await login(U1.email, U1.pw1)).status === 200);

// duplicate email, other case → EMAIL_TAKEN at the field
await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
const dlg2 = page.getByRole("dialog");
await dlg2.getByLabel("ชื่อ").fill("Dup");
await dlg2.getByLabel("อีเมล").fill(U1.email.toUpperCase());
await dlg2.getByLabel("รหัสผ่านแรก").fill("duplicate-pw-1");
await dlg2.getByRole("button", { name: "ยืนยัน" }).click();
await page.getByText("อีเมลนี้มีผู้ใช้แล้ว").waitFor();
check("duplicate email → EMAIL_TAKEN shown at the field", true);
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "detached" });

// disable → enable
await row().getByRole("button", { name: "ปิดใช้งาน" }).click();
await page.getByRole("button", { name: "ยืนยัน" }).click();
await row().getByRole("button", { name: "เปิดใช้งาน" }).waitFor();
check("disable → status disabled on the server", (await u1Status()) === "disabled", `login while disabled → ${(await login(U1.email, U1.pw1)).status}/${(await login(U1.email, U1.pw1)).body?.error?.code}`);
await row().getByRole("button", { name: "เปิดใช้งาน" }).click();
await page.getByRole("button", { name: "ยืนยัน" }).click();
await row().getByRole("button", { name: "ปิดใช้งาน" }).waitFor();
check("enable → active again, U1 signs in", (await u1Status()) === "active" && (await login(U1.email, U1.pw1)).status === 200);

// reset password
await row().getByRole("button", { name: "ตั้งรหัสผ่านใหม่" }).click();
const dlg3 = page.getByRole("dialog");
await dlg3.getByLabel("รหัสผ่านใหม่").fill(U1.pw2);
await dlg3.getByRole("button", { name: "ยืนยัน" }).click();
await page.getByText("เปลี่ยนรหัสผ่านแล้ว").waitFor();
const oldPw = await login(U1.email, U1.pw1);
const newPw = await login(U1.email, U1.pw2);
check("reset: old password refused, new works (curl-equivalent)", oldPw.status === 401 && newPw.status === 200, `old=${oldPw.status} ${oldPw.body?.error?.code} new=${newPw.status}`);

// U1 on the admin web
await page.getByRole("button", { name: "ออกจากระบบ" }).click();
await page.waitForURL("**/login");
await signIn(U1.email, U1.pw2);
await page.getByText("หน้านี้สำหรับผู้ดูแลเท่านั้น").waitFor();
check("U1 refused on the admin web, no token in sessionStorage (AC-2)", (await token()) === null, `url=${new URL(page.url()).pathname}`);
await shot("live-04-nonowner-refused.png");

await browser.close();
console.log(ok.every(Boolean) ? "ALL PASS" : "SOME FAILED", `(test user ${U1.email} left in the local dev DB)`);
process.exit(ok.every(Boolean) ? 0 : 1);
