// TEST-001 admin-web cases (AC-1, AC-2, #2, #4, #10, #13, #14 on the owner's page). Headless Chrome, 1280×800.
// Front: `next dev` on localhost:3191 with NEXT_PUBLIC_API_BASE_URL → QA's own back end 127.0.0.1:8191.
//   node admin-web.mjs <playwright-core/index.mjs>
// Owner login from QA's secrets file (outside the repo) — never printed. Throwaway harness.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
if (!process.env.QA_SECRETS) throw new Error("set QA_SECRETS (QA's secrets.json, outside the repo)");
const secrets = JSON.parse(readFileSync(process.env.QA_SECRETS, "utf8"));
const WEB = "http://localhost:3191", API = "http://127.0.0.1:8191/api/v1";
const tag = Date.now().toString(36);
const U = { name: `ผู้ใช้เว็บ ${tag}`, email: `web-${tag}@qa-a.test`, pw: `pw-web-${tag}-xyz`, pw2: `pw-web2-${tag}-xyz` };
const checks = [];
const check = (c, what, expected, actual, pass) => {
  checks.push({ case: c, what, expected, actual: String(actual), pass });
  console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${actual}`);
};
const apiLogin = async (email, password) => (await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })).status;
const shot = (page, n) => page.screenshot({ path: join(here, "shots", `${n}.png`), fullPage: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const body = () => page.locator("body").innerText();
try {
  await page.goto(`${WEB}/login`);
  await page.getByText("เข้าสู่ระบบผู้ดูแล corner-chat").waitFor({ timeout: 60000 });
  check("1", "admin sign-in title", "เข้าสู่ระบบผู้ดูแล corner-chat", "shown", true);
  // #4 wrong password on the web
  await page.getByLabel("อีเมล").fill(secrets.ownerEmail);
  await page.getByLabel("รหัสผ่าน").fill("wrong-password-1");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.getByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง").waitFor({ timeout: 10000 }).then(() => check("4", "wrong password wording on the web", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "shown", true), () => check("4", "wrong password wording on the web", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "not shown", false));
  await shot(page, "w01-wrong-password");
  // owner signs in
  await page.getByLabel("รหัสผ่าน").fill(secrets.ownerPassword);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).waitFor({ timeout: 30000 });
  check("1", "owner signs in → users page with the add button", "เพิ่มผู้ใช้ visible", page.url(), true);
  // #1 add user through the modal
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("ชื่อ").fill(U.name);
  await dlg.getByLabel("อีเมล").fill(U.email);
  await dlg.getByLabel("รหัสผ่านแรก").fill(U.pw);
  await shot(page, "w02-add-modal");
  await dlg.getByRole("button", { name: "ยืนยัน" }).click();
  const row = page.locator("tr", { hasText: U.email });
  await row.waitFor({ timeout: 10000 });
  check("1", "added user listed", "row with the email, ใช้งานอยู่", await row.innerText().then((t) => t.replace(/\s+/g, " ")), (await row.innerText()).includes("ใช้งานอยู่"));
  const s1 = await apiLogin(U.email, U.pw);
  check("1", "user added on the web signs in with that password (API — the app is not built)", "200", s1, s1 === 200);
  // #2 duplicate (other case) on the web
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
  await dlg.getByLabel("ชื่อ").fill("ซ้ำ");
  await dlg.getByLabel("อีเมล").fill(U.email.toUpperCase());
  await dlg.getByLabel("รหัสผ่านแรก").fill("another-pw-123");
  await dlg.getByRole("button", { name: "ยืนยัน" }).click();
  const dupShown = await page.getByText("อีเมลนี้มีผู้ใช้แล้ว").waitFor({ timeout: 10000 }).then(() => true, () => false);
  check("2", "duplicate email (upper case) on the web", "อีเมลนี้มีผู้ใช้แล้ว", dupShown ? "shown" : "not shown", dupShown);
  await shot(page, "w03-duplicate");
  await page.keyboard.press("Escape");
  await dlg.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  // #10 disable
  await row.getByRole("button", { name: "ปิดใช้งาน" }).click();
  await page.getByText(`ปิดใช้งาน ${U.name} ไหม`).filter({ visible: true }).first().waitFor({ timeout: 5000 });
  check("10", "disable asks first, with the REQ wording", `ปิดใช้งาน ${U.name} ไหม …`, "shown", true);
  await page.getByRole("button", { name: "ยืนยัน" }).last().click();
  await page.waitForTimeout(1500);
  const rowDis = (await row.innerText()).replace(/\s+/g, " ");
  const s10 = await apiLogin(U.email, U.pw);
  check("10", "disable on the web → row + sign-in", "row ปิดใช้งาน · login 403", `${rowDis} · ${s10}`, s10 === 403 && rowDis.includes("ปิดใช้งาน"));
  await shot(page, "w04-disabled");
  // #13 enable
  await row.getByRole("button", { name: "เปิดใช้งาน" }).click();
  await page.getByRole("button", { name: "ยืนยัน" }).last().click();
  await page.waitForTimeout(1500);
  const s13 = await apiLogin(U.email, U.pw);
  check("13", "enable on the web → sign-in", "200", s13, s13 === 200);
  // #14 reset
  await row.getByRole("button", { name: "ตั้งรหัสผ่านใหม่" }).click();
  await page.getByRole("dialog").getByLabel("รหัสผ่านใหม่").fill(U.pw2);
  await page.getByRole("dialog").getByRole("button", { name: "ยืนยัน" }).click();
  const doneShown = await page.getByText("เปลี่ยนรหัสผ่านแล้ว").waitFor({ timeout: 10000 }).then(() => true, () => false);
  const sOld = await apiLogin(U.email, U.pw), sNew = await apiLogin(U.email, U.pw2);
  check("14", "reset on the web → old / new", "เปลี่ยนรหัสผ่านแล้ว · 401 / 200", `${doneShown ? "shown" : "not shown"} · ${sOld} / ${sNew}`, doneShown && sOld === 401 && sNew === 200);
  // AC-2: sign out, sign in as the user
  await page.getByRole("button", { name: "ออกจากระบบ" }).click();
  await page.getByText("เข้าสู่ระบบผู้ดูแล corner-chat").waitFor({ timeout: 10000 });
  await page.getByLabel("อีเมล").fill(U.email);
  await page.getByLabel("รหัสผ่าน").fill(U.pw2);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  const refused = await page.getByText("หน้านี้สำหรับผู้ดูแลเท่านั้น").waitFor({ timeout: 10000 }).then(() => true, () => false);
  // A stored value counts as a kept token only if the API accepts it as one (GET /me → 200).
  const stored = await page.evaluate(() => [...Object.entries(localStorage), ...Object.entries(sessionStorage)]);
  const live = [];
  for (const [k, v] of stored) {
    for (const cand of [v, ...(String(v).match(/[A-Za-z0-9_-]{30,}/g) ?? [])]) {
      const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${cand}` } });
      if (r.status === 200) live.push(k);
    }
  }
  check("2", "user account on the admin web", "หน้านี้สำหรับผู้ดูแลเท่านั้น, no usable token kept", `${refused ? "shown" : "not shown"} · storage keys=[${stored.map(([k]) => k).join(", ")}] · usable tokens under=[${live.join(", ")}]`, refused && live.length === 0);
  await shot(page, "w05-user-refused");
  await page.goto(`${WEB}/users`);
  await page.waitForTimeout(3000);
  const onUsers = !(await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).isVisible());
  check("2", "user then opens /users directly", "no users page (sent to sign-in)", page.url(), onUsers);
  await shot(page, "w06-user-direct-users");
} catch (e) {
  check("x", "script error", "none", e.message.split("\n")[0], false);
  await shot(page, "wxx-error").catch(() => {});
} finally {
  await browser.close();
}
writeFileSync(join(here, "admin-web-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), user: U.email, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
