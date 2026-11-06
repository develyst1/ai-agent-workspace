// Throwaway (TASK-009 item 2): the DoD's live lines against the REAL back end (TASK-006 / TASK-007), 1280 px, screenshots next to this file.
// Setup (outside this file): a throwaway database on the team's local cluster, the real back end on :8081 pointed at it and at the FAKE gateway
// (tests/harness/fake-gateway, :3997), the front on :3000 built with NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1.
// The owner's login is read from the back end's own .env; the throwaway DB's URL comes in as env LIVE_URL. Neither is printed.
// usage: node shoot-live.mjs <playwright-core/index.mjs> <corner-chat-back/.env> <phase: main|down>
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [, , pw, envPath, phase = "main"] = process.argv;
const { chromium } = await import(pathToFileURL(pw).href);
const env = Object.fromEntries(
  readFileSync(envPath, "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const OWNER_EMAIL = env.OWNER_EMAIL, OWNER_PASSWORD = env.OWNER_PASSWORD;
const LIVE_URL = process.env.LIVE_URL;
if (!OWNER_EMAIL || !OWNER_PASSWORD || !LIVE_URL) throw new Error("need the back end's .env owner login and env LIVE_URL");

const here = dirname(fileURLToPath(import.meta.url));
const BACK = dirname(envPath);
const INGEST = join(here, "..", "task-005-ingest.ts");
const BASE = "http://localhost:3000";
const API = "http://localhost:8081/api/v1";
const ok = [];
const check = (name, pass, detail = "") => { ok.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name} ${detail}`); };

const call = async (path, { token, method = "GET", body } = {}) => {
  const res = await fetch(`${API}${path}`, { method, headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const sql = (q) => execFileSync("psql", [LIVE_URL, "-At", "-v", "ON_ERROR_STOP=1", "-c", q], { encoding: "utf8" }).trim();

const owner = (await call("/auth/login", { method: "POST", body: { email: OWNER_EMAIL, password: OWNER_PASSWORD } })).body.token;
if (!owner) throw new Error("owner login against the real back end failed");

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const shot = (file) => page.screenshot({ path: join(here, file) });
const pickOption = async (comboIndex, title) => {
  await page.getByRole("combobox").nth(comboIndex).click();
  await page.locator(`.ant-select-item-option[title="${title}"]`).click();
};
const signInUi = async () => {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("อีเมล").fill(OWNER_EMAIL);
  await page.getByLabel("รหัสผ่าน").fill(OWNER_PASSWORD);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/users");
};

if (phase === "main") {
  // --- TASK-006: AI settings, then AC-9 ---
  // start from the shipped defaults so the run can be repeated
  await call("/admin/settings/ai", { token: owner, method: "PUT", body: { layer1: { provider: "deepseek", model: "deepseek-flash" }, layer2: { provider: "deepseek", model: "deepseek-v4-pro" } } });
  await signInUi();
  await page.goto(`${BASE}/ai`);
  await page.getByText("ชั้นที่ 1: อ่านและสรุป").first().waitFor();
  await page.waitForTimeout(800);
  const before = (await call("/admin/settings/ai", { token: owner })).body;
  await shot("live-01-ai-settings.png");
  await pickOption(1, "deepseek-chat");
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.getByText("บันทึกแล้ว").waitFor();
  const after = (await call("/admin/settings/ai", { token: owner })).body;
  check("save changes layer 1's model on the real server", after.layer1.model === "deepseek-chat", `before=${JSON.stringify(before.layer1)} after=${JSON.stringify(after.layer1)}`);
  await page.reload();
  await page.getByText("deepseek-chat").first().waitFor();
  check("reload shows the new value", (await page.getByText("deepseek-chat").count()) > 0);
  await page.waitForTimeout(500);
  await shot("live-02-ai-saved.png");

  // a rejected save: the real server's VALIDATION (a model the gateway does not list), through the API, to prove the field mapping on real error bodies
  const bad = await call("/admin/settings/ai", { token: owner, method: "PUT", body: { layer1: { provider: "deepseek", model: "not-a-model" }, layer2: after.layer2 } });
  check("real PUT with an unlisted model → 400 VALIDATION naming the field", bad.status === 400 && bad.body.error?.code === "VALIDATION" && Object.keys(bad.body.error.fields ?? {}).some((k) => k.includes("layer1")), JSON.stringify(bad.body.error?.fields));

  // AC-9: a made-up message AFTER the save carries the new layer-1 model
  const stamp = Date.now().toString(36);
  const u1 = { name: `U1 live9 ${stamp}`, email: `u1-live9-${stamp}@example.test`, password: `pw-${stamp}-long` };
  const created = await call("/admin/users", { token: owner, method: "POST", body: u1 });
  check("test user U1 created through the API", created.status === 201);
  const ingest = (text) => execFileSync("bun", [INGEST, u1.email, text], { cwd: BACK, env: { ...process.env, DATABASE_URL: LIVE_URL }, encoding: "utf8" }).trim();
  const out = ingest("ช่วยยืนยันหน่อยว่าพรุ่งนี้ประชุมกี่โมง (ข้อความทดสอบ)");
  console.log("ingest →", out.slice(0, 160));
  const u1Token = (await call("/auth/login", { method: "POST", body: { email: u1.email, password: u1.password } })).body.token;
  let item;
  for (let i = 0; i < 40 && !item; i++) {
    const list = await call("/messages?tab=notified", { token: u1Token });
    item = list.body.items?.[0];
    if (!item) await new Promise((r) => setTimeout(r, 500));
  }
  const detail = item ? (await call(`/messages/${item.id}`, { token: u1Token })).body.message : null;
  console.log("decision JSON →", JSON.stringify(detail?.decision));
  check("AC-9: decision.layer1.model is the new model (deepseek-chat)", detail?.decision?.layer1?.model === "deepseek-chat", JSON.stringify(detail?.decision?.layer1));

  // --- TASK-007: the count card ---
  ingest("ข้อความทดสอบที่สอง ยืนยันหน่อย");
  ingest("ข้อความทดสอบที่สาม ยืนยันหน่อย");
  const ids = sql(`select m.id from messages m join users u on u.id = m.user_id where u.email = '${u1.email}' order by m.received_at`).split(/\r?\n/);
  check("3 made-up messages stored for U1", ids.length === 3, `n=${ids.length}`);
  // hand-seeded push rows (Team B's LINE notifier is what writes them in production): 2 this month, 1 in October
  sql(`insert into line_pushes (user_id, message_id, pushed_at) select m.user_id, m.id, v.ts from (values ('${ids[0]}'::uuid, now()), ('${ids[1]}'::uuid, now()), ('${ids[2]}'::uuid, timestamptz '2026-10-15 12:00+07')) v(mid, ts) join messages m on m.id = v.mid`);
  const apiNow = (await call("/admin/stats/line-pushes", { token: owner })).body;
  const apiOct = (await call("/admin/stats/line-pushes?month=2026-10", { token: owner })).body;
  console.log("curl-equivalent →", JSON.stringify(apiNow), JSON.stringify(apiOct));
  await page.goto(`${BASE}/users`);
  await page.getByText("ข้อความ LINE ที่ส่งในเดือน พฤศจิกายน 2569").waitFor();
  await page.waitForTimeout(800);
  const cardNow = await page.locator(".ant-card").innerText();
  check("count card = GET /admin/stats/line-pushes (this month)", apiNow.count === 2 && new RegExp(`\\b${apiNow.count}\\b`).test(cardNow), `api=${JSON.stringify(apiNow)} card="${cardNow.replace(/\n/g, " ")}"`);
  await shot("live-03-users-line-count.png");
  await page.locator(".ant-picker").click();
  await page.locator(".ant-picker-cell").nth(9).click(); // October
  await page.getByText("ข้อความ LINE ที่ส่งในเดือน ตุลาคม 2569").waitFor();
  await page.waitForTimeout(500);
  const cardOct = await page.locator(".ant-card").innerText();
  check("month picker → October equals the API for 2026-10", apiOct.count === 1 && /\b1\b/.test(cardOct), `api=${JSON.stringify(apiOct)} card="${cardOct.replace(/\n/g, " ")}"`);
} else {
  // --- gateway STOPPED for real (closed port) ---
  const models = await call("/admin/ai-models", { token: owner });
  check("real GET /admin/ai-models with the gateway stopped → 502 GATEWAY_UNAVAILABLE", models.status === 502 && models.body.error?.code === "GATEWAY_UNAVAILABLE", `status=${models.status}`);
  await signInUi();
  await page.goto(`${BASE}/ai`);
  await page.getByText(/ติดต่อ AI gateway ไม่ได้/).waitFor();
  await page.waitForTimeout(500);
  const disabled = await page.locator(".ant-select-disabled").count();
  check("page shows the unreachable state: 4 selects read-only, current values kept, save disabled",
    disabled === 4 && (await page.getByText("deepseek-chat").count()) > 0 && (await page.getByRole("button", { name: "บันทึก", exact: true }).isDisabled()), `disabled=${disabled}`);
  await shot("live-04-ai-gateway-stopped.png");
}

await browser.close();
console.log(ok.every(Boolean) ? "ALL PASS" : "SOME FAILED");
process.exit(ok.every(Boolean) ? 0 : 1);
