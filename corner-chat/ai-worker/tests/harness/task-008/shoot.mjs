// Throwaway (TASK-008 REWORK item 2): walk the admin web at 1280 px and save the DoD screenshots next to this file.
// Needs: the mock (tests/harness/mock-api-task-008/mock-api.ts) on :8080 and the front on :3000, both fresh (only the owner exists).
// usage: node shoot.mjs <path to playwright-core/index.mjs>     (system Chrome, headless — no window pops up)
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const out = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const ok = [];
const check = (name, pass, detail = "") => { ok.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name} ${detail}`); };

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const shot = (file) => page.screenshot({ path: join(out, file) });
const token = () => page.evaluate(() => sessionStorage.getItem("corner-chat.token"));

async function signIn(email, password) {
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.keyboard.press("Enter");
}

await page.goto(`${BASE}/login`);
await page.getByLabel("อีเมล").waitFor();
await shot("01-signin.png");

await signIn("owner@example.test", "ownerpass1");
await page.waitForURL("**/users");
await page.getByText("owner@example.test").waitFor();
check("owner signed in, token kept", (await token()) !== null);

await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
const dialog = page.getByRole("dialog");
await dialog.getByLabel("ชื่อ").fill("U1");
await dialog.getByLabel("อีเมล").fill("u1@example.test");
await dialog.getByLabel("รหัสผ่านแรก").fill("userpass1");
await page.waitForTimeout(600); // let the modal's fade-in finish
await shot("02-users-add-modal.png");
await dialog.getByRole("button", { name: "ยืนยัน" }).click();
await page.getByText("u1@example.test").waitFor();
await page.getByRole("dialog").waitFor({ state: "detached" });
check("U1 listed after add", true);
await shot("03-users-row-actions.png");

const ownerRow = page.getByRole("row").filter({ hasText: "owner@example.test" });
check("owner row has no disable button", (await ownerRow.getByRole("button", { name: "ปิดใช้งาน" }).count()) === 0);

await page.getByRole("button", { name: "ออกจากระบบ" }).click();
await page.waitForURL("**/login");
check("sign-out clears token", (await token()) === null);

await signIn("u1@example.test", "userpass1");
await page.getByText("หน้านี้สำหรับผู้ดูแลเท่านั้น").waitFor();
check("user account refused on the admin web, no token (AC-2)", (await token()) === null, `url=${new URL(page.url()).pathname}`);
await shot("04-nonowner-refused.png");

await signIn("owner@example.test", "ownerpass1");
await page.waitForURL("**/users");
await page.getByText("u1@example.test").waitFor();
await page.route("**/api/v1/admin/users", (route) => route.abort());
await page.reload();
await page.getByText("ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง").waitFor();
await shot("05-server-down.png");
check("server-down wording + retry shown", true);

await browser.close();
console.log(ok.every(Boolean) ? "ALL PASS" : "SOME FAILED");
process.exit(ok.every(Boolean) ? 0 : 1);
