// QA Team B (Tefany) — TEST-004 AC-7: the owner's admin web SHOWS this month's LINE push count, +1 per push.
// Needs `bun stack.ts` running (back :8192 on corner_chat_test_qa_b, fake LINE, fake gateway). This script starts the
// admin web itself: `next dev -p 3193` in corner-chat-front with NEXT_PUBLIC_API_BASE_URL → :8192 (ADMIN_WEB_ORIGIN is
// http://localhost:3193 in stack.ts), and stops it at the end.
//   node ac7-admin.mjs <playwright-core/index.mjs>
// Owner login from QA-B's secrets file (outside every repo) — never printed. Headless Chrome 1280×800. Throwaway harness.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "shots"), { recursive: true });
const secrets = JSON.parse(readFileSync(
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json", "utf8"));
const WEB = "http://localhost:3193", API = "http://127.0.0.1:8192/api/v1", LINE_SECRET = "qa-b-made-up-channel-secret";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass: !!pass }); console.log(`${pass ? "PASS" : "FAIL"} ${c} ${what} — expected ${expected} — got ${actual}`); };
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let json = null; try { json = t ? JSON.parse(t) : null; } catch { json = t; }
  return { status: r.status, json };
};
const hook = async (events) => {
  const body = JSON.stringify({ destination: "Uqab-oa", events });
  return (await fetch(`${API}/webhooks/line`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": createHmac("sha256", LINE_SECRET).update(body).digest("base64") }, body })).status;
};
let seq = 0;
const tag = Date.now().toString(36);
const mid = () => `qab7-${tag}-${++seq}`;
const L1 = `Uqab7${tag}l1`.padEnd(33, "0"), M = `Uqab7${tag}mm`.padEnd(33, "0"), G1 = `Cqab7${tag}g1`.padEnd(33, "0");
const tagMsg = (text) => ({ type: "message", timestamp: Date.now(), replyToken: `rt7-${++seq}`, source: { type: "group", groupId: G1, userId: M }, message: { id: mid(), type: "text", text, mention: { mentionees: [{ index: 0, length: 3, type: "user", userId: L1 }] } } });

// ---------- data: one linked user in one group
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const email = `a7-${tag}@qa-b.test`, password = `pw-a7-${tag}`;
await api("POST", "/admin/users", OT, { name: "ผู้ใช้ AC-7", email, password });
const UT = (await api("POST", "/auth/login", null, { email, password })).json.token;
await api("PUT", "/conditions/settings", UT, { bar: 70, sentences: "แจ้งเรื่องงาน" });
await hook([{ type: "message", timestamp: Date.now(), replyToken: "rt7-dm", source: { type: "user", userId: L1 }, message: { id: mid(), type: "text", text: (await api("POST", "/channels/line/link-code", UT)).json.code } }]);
await hook([{ type: "join", timestamp: Date.now(), replyToken: "rt7-j", source: { type: "group", groupId: G1 } }]);
const apiCount = async () => (await api("GET", "/admin/stats/line-pushes", OT)).json?.count;

// ---------- admin web
const next = spawn("npx", ["next", "dev", "-p", "3193"], { cwd: "H:/corner-chat/corner-chat-front", shell: true, env: { ...process.env, NEXT_PUBLIC_API_BASE_URL: API, PORT: "3193" }, stdio: "ignore" });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "th-TH" })).newPage();
const panelCount = async () => {
  const card = page.locator(".ant-card", { hasText: "LINE" }).first();
  await card.waitFor({ timeout: 30000 });
  for (let i = 0; i < 20; i++) { const v = (await card.locator("[aria-live=polite]").innerText()).trim(); if (/^\d+$/.test(v)) return { value: Number(v), title: (await card.innerText()).replace(/\s+/g, " ").slice(0, 90) }; await sleep(500); }
  return { value: NaN, title: (await card.innerText()).replace(/\s+/g, " ").slice(0, 90) };
};
try {
  for (let i = 0; i < 120; i++) { try { if ((await fetch(`${WEB}/login`)).status < 500) break; } catch {} await sleep(1000); }
  await page.goto(`${WEB}/login`);
  await page.getByLabel("อีเมล").waitFor({ timeout: 120000 });
  await page.getByLabel("อีเมล").fill(secrets.ownerEmail);
  await page.getByLabel("รหัสผ่าน").fill(secrets.ownerPassword);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).waitFor({ timeout: 60000 });
  const c0 = await panelCount();
  await page.screenshot({ path: join(here, "shots", "a7-01-before.png"), fullPage: true });
  check("T4#30", "admin web shows this month's count (= API)", `a number equal to the API (${await apiCount()})`, `${c0.value} · "${c0.title}"`, Number.isInteger(c0.value) && c0.value === (await apiCount()));

  await hook([tagMsg("@U QAB7-PUSH ส่งรายงานด่วน")]); await sleep(5000);
  await page.reload(); await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).waitFor({ timeout: 60000 });
  const c1 = await panelCount();
  await page.screenshot({ path: join(here, "shots", "a7-02-after-push.png"), fullPage: true });
  check("T4#30", "one passed message pushed → the page shows +1", `${c0.value + 1}`, c1.value, c1.value === c0.value + 1);

  await hook([tagMsg("@U QAB7-HOLD [HOLD] ขายของ")]); await sleep(5000);
  await page.reload(); await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).waitFor({ timeout: 60000 });
  const c2 = await panelCount();
  check("T4#31", "a held message → the page count unchanged", `${c1.value}`, c2.value, c2.value === c1.value);
} catch (e) {
  check("x", "script error", "none", String(e.message).split("\n")[0], false);
  await page.screenshot({ path: join(here, "shots", "a7-xx-error.png") }).catch(() => {});
} finally {
  await browser.close();
  next.kill();
  spawn("taskkill", ["/F", "/T", "/PID", String(next.pid)], { shell: true, stdio: "ignore" });
}
writeFileSync(join(here, "ac7-admin-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
