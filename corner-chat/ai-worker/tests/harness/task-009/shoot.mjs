// Throwaway (TASK-009): walk the AI settings page + the LINE push count at 1280 px against the mock, save screenshots next to this file.
// Needs: the mock (tests/harness/mock-api-task-008/mock-api.ts, fresh) on :8080 and the front on :3000.
// usage: node shoot.mjs <path to playwright-core/index.mjs>     (system Chrome, headless)
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const out = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const API = process.env.API_BASE ?? "http://localhost:8080/api/v1"; // 8081 when the real back end holds 8080
const ok = [];
const check = (name, pass, detail = "") => { ok.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name} ${detail}`); };

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const shot = (file) => page.screenshot({ path: join(out, file) });
const token = () => page.evaluate(() => sessionStorage.getItem("corner-chat.token"));
const apiAuthed = async (path) => { const tk = await token(); return page.evaluate(async ([url, t]) => (await fetch(url, { headers: { Authorization: `Bearer ${t}` } })).json(), [`${API}${path}`, tk]); };
const signIn = async (email, password) => {
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.keyboard.press("Enter");
};
const pickOption = async (comboIndex, title) => {
  await page.getByRole("combobox").nth(comboIndex).click();
  await page.locator(`.ant-select-item-option[title="${title}"]`).click();
};

// sign in
await page.goto(`${BASE}/login`);
await page.getByLabel("อีเมล").fill("owner@example.test");
await page.getByLabel("รหัสผ่าน").fill("ownerpass1");
await page.keyboard.press("Enter");
await page.waitForURL("**/users");

// LINE push count
await page.getByText("ข้อความ LINE ที่ส่งในเดือน พฤศจิกายน 2569").waitFor();
await page.waitForFunction(() => /\b7\b/.test(document.body.innerText));
const apiNow = await apiAuthed("/admin/stats/line-pushes");
check("count card shows the API's number for the current month", (await page.getByText(String(apiNow.count), { exact: true }).count()) > 0, `api=${JSON.stringify(apiNow)}`);
await page.waitForTimeout(600); // let the table finish loading
await shot("01-users-line-count.png");
await page.locator(".ant-picker").click();
await page.locator(".ant-picker-cell").nth(9).click(); // October
await page.waitForFunction(() => /\b31\b/.test(document.body.innerText));
const apiOct = await apiAuthed("/admin/stats/line-pushes?month=2026-10");
check("month picker → count of that month", apiOct.count === 31 && (await page.getByText("31", { exact: true }).count()) > 0, `api=${JSON.stringify(apiOct)}`);
check("title follows the picked month ({month} = ตุลาคม 2569)", (await page.getByText("ข้อความ LINE ที่ส่งในเดือน ตุลาคม 2569").count()) === 1);

// AI settings
await page.getByRole("link", { name: "ตั้งค่า AI กรองข้อความ" }).click();
await page.waitForURL("**/ai");
await page.getByText("ชั้นที่ 1: อ่านและสรุป").first().waitFor();
await page.waitForTimeout(500);
await shot("02-ai-settings.png");
const before = await apiAuthed("/admin/settings/ai");
await pickOption(0, "deepseek");
await pickOption(1, "deepseek-reasoner");
await page.getByRole("button", { name: "บันทึก", exact: true }).click();
await page.getByText("บันทึกแล้ว").waitFor();
const after = await apiAuthed("/admin/settings/ai");
check("save changes layer 1 on the server", after.layer1.provider === "deepseek" && after.layer1.model === "deepseek-reasoner", `before=${JSON.stringify(before.layer1)} after=${JSON.stringify(after.layer1)}`);
// REVIEW item 3: signing out clears the "saved" toast — it must not show over the sign-in page
await page.getByRole("button", { name: "ออกจากระบบ" }).click();
await page.waitForURL("**/login");
await page.waitForTimeout(300);
check("sign-out clears antd toasts (none over the sign-in page)", (await page.locator(".ant-message-notice").count()) === 0);
await signIn("owner@example.test", "ownerpass1");
await page.waitForURL("**/users");
await page.goto(`${BASE}/ai`);
await page.getByText("deepseek-reasoner").first().waitFor();
check("reload shows the saved value", (await page.getByText("deepseek-reasoner").count()) > 0);
check("save button disabled when nothing changed", await page.getByRole("button", { name: "บันทึก", exact: true }).isDisabled());

// "let the gateway choose" clears the model
await pickOption(0, "ให้ gateway เลือกเอง");
check("gateway-chooses → model select disabled", await page.getByRole("combobox").nth(1).isDisabled());

// VALIDATION from the server shows at the field, never the server's text
await page.route("**/api/v1/admin/settings/ai", (route) =>
  route.request().method() === "PUT"
    ? route.fulfill({ status: 400, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
        body: JSON.stringify({ error: { code: "VALIDATION", message: "dev text", fields: { "layer1.model": "dev reason" } } }) })
    : route.continue());
await pickOption(0, "gemini");
await page.getByRole("button", { name: "บันทึก", exact: true }).click();
await page.getByText("ตรวจข้อมูลช่องนี้อีกครั้ง").first().waitFor();
check("VALIDATION shown with the PM's text, not the server's", (await page.getByText("dev reason").count()) === 0 && (await page.getByText("dev text").count()) === 0);
await page.keyboard.press("Escape");
await page.waitForTimeout(800); // let the select's dropdown finish closing
await shot("03-ai-validation.png");
await page.unroute("**/api/v1/admin/settings/ai");

// gateway down
await page.route("**/api/v1/admin/ai-models", (route) =>
  route.fulfill({ status: 502, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "http://localhost:3000" },
    body: JSON.stringify({ error: { code: "GATEWAY_UNAVAILABLE", message: "dev text" } }) }));
await page.reload();
await page.getByText(/ติดต่อ AI gateway ไม่ได้/).waitFor();
await page.waitForTimeout(400);
const disabled = await page.locator(".ant-select-disabled").count();
check("gateway down → warning shown, all 4 selects read-only, values kept", disabled === 4 && (await page.getByText("gemini-2.5-pro").count()) > 0, `disabled=${disabled}`);
check("save disabled while the gateway is down", await page.getByRole("button", { name: "บันทึก", exact: true }).isDisabled());
await shot("04-ai-gateway-down.png");
await page.unroute("**/api/v1/admin/ai-models");

// 375 px: no page scroll, hit targets
await page.setViewportSize({ width: 375, height: 812 });
for (const path of ["/ai", "/users"]) {
  await page.goto(`${BASE}${path}`);
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const els = [...document.querySelectorAll("main button, main a, main .ant-select, main .ant-picker, header a")];
    const heights = els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => Math.round(e.getBoundingClientRect().height));
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, minH: Math.min(...heights) };
  });
  check(`375 px ${path}: no page scroll, every control ≥ 44 px`, m.sw <= m.cw && m.minH >= 44, JSON.stringify(m));
}
await browser.close();
console.log(ok.every(Boolean) ? "ALL PASS" : "SOME FAILED");
process.exit(ok.every(Boolean) ? 0 : 1);
