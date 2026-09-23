// Harness (Tanya, 2026-09-23): TEST-006 — REQ-004 hire button + admin negatives on SIT.
// Proves on the deployed build (https://possibility.develyst.online):
//   AC-1  W-1 click → POST 201 → W-2 (email + discount in text) → button replaced by disabled W-3 (TH, then EN on reopen)
//   AC-2  reopen → W-3 shown; second POST /hire-request → 409; GET /ideas/:id → hireRequested true
//   AC-3  non-admin: /admin page = not-found, GET /admin/hire-requests → 404; signed-out /admin → not an admin list
//   AC-4  negative half only: PATCH /admin/hire-requests/:id as non-admin → 404
//   AC-6  no admin link anywhere in the signed-in UI (header, /ideas, /me, result page), desktop + 375px
// Does NOT prove: the admin page itself (Google-only account siegkung@gmail.com — QA cannot sign in).
// Run:  QA_PW='<password>' node tests/harness/sit-test-006-hire-ui.mjs <ideaId-h1> <ideaId-h2>
// Screenshots → possibility/project-docs/qa-2026-09-23/
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ORIGIN = "https://possibility.develyst.online";
const API = ORIGIN + "/api/v1";
const PW = process.env.QA_PW;
const [IDEA_H1, IDEA_H2] = process.argv.slice(2);
if (!PW || !IDEA_H1 || !IDEA_H2) { console.error("usage: QA_PW=.. node <file> <ideaId-h1> <ideaId-h2>"); process.exit(2); }
const OUT = "H:/ai-agent-workplace/ai-agent-workspace/possibility/project-docs/qa-2026-09-23";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(pathToFileURL("H:/scheduler/smart-scheduler-front/node_modules/playwright/index.mjs").href);

async function apiCookie(page, email) {
  const r = await page.request.post(`${API}/auth/login`, { data: { email, password: PW } });
  if (r.status() !== 200) throw new Error(`login ${email}: ${r.status()} ${await r.text()}`);
  return (await r.json()).user;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const rec = (name, data) => { results.push({ name, ...data }); console.log(name, JSON.stringify(data)); };

// ---------- AC-1 + AC-2 + AC-6, TH, desktop, as h1 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
  const page = await ctx.newPage();
  const user = await apiCookie(page, "qa-tanya-hire1@example.com");

  await page.goto(`${ORIGIN}/ideas/${IDEA_H1}`, { waitUntil: "networkidle" });
  const hireBtn = page.locator("button", { hasText: "สนใจจ้างทำ" });
  await hireBtn.waitFor({ timeout: 15000 });
  const box = await hireBtn.boundingBox();
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.outerHTML.slice(0, 120) ?? null,
    [box.x + box.width / 2, box.y + box.height / 2]);
  rec("AC1-pre", { w1Visible: true, hitTestContainsButton: !!hit && hit.includes("button"), hit });

  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/hire-request") && r.request().method() === "POST"),
    hireBtn.click(),
  ]);
  const respJson = await resp.json();
  rec("AC1-post", { status: resp.status(), body: respJson });

  await page.waitForTimeout(1500);
  const bodyText = await page.evaluate(() => document.body.innerText);
  const w2expected = `ส่งคำขอแล้ว — เราจะติดต่อกลับทางอีเมล qa-tanya-hire1@example.com พร้อมข้อเสนอราคาที่รวมส่วนลด 0% ของคุณ`;
  const after = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map((b) => ({ text: b.innerText.trim(), disabled: b.disabled }));
    return { btns, alertText: document.querySelector(".ant-alert")?.innerText ?? null };
  });
  rec("AC1-after", {
    w2ExactShown: bodyText.includes(w2expected),
    alert: after.alert,
    w3DisabledShown: after.btns.some((b) => b.text.includes("ส่งคำขอแล้ว") && b.disabled),
    w1Gone: !after.btns.some((b) => b.text.includes("สนใจจ้างทำ")),
    btns: after.btns,
  });
  await page.screenshot({ path: `${OUT}/test-006-ac1-th-after-hire.png`, fullPage: true });

  // AC-2: reload → W-3; no W-1
  await page.reload({ waitUntil: "networkidle" });
  const reopen = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map((b) => ({ text: b.innerText.trim(), disabled: b.disabled }));
    return { w3: btns.some((b) => b.text.includes("ส่งคำขอแล้ว") && b.disabled), w1: btns.some((b) => b.text.includes("สนใจจ้างทำ")) };
  });
  rec("AC2-reopen-th", reopen);
  await page.screenshot({ path: `${OUT}/test-006-ac2-th-reopen.png`, fullPage: true });

  // AC-2 API: second POST → 409
  const dup = await page.request.post(`${API}/ideas/${IDEA_H1}/hire-request`);
  rec("AC2-duplicate-post", { status: dup.status(), body: await dup.json() });

  // idea DTO now carries hireRequested
  const ideaGet = await page.request.get(`${API}/ideas/${IDEA_H1}`);
  rec("AC2-idea-dto", { status: ideaGet.status(), hireRequested: (await ideaGet.json()).idea?.hireRequested });

  // AC-3 (non-admin): /admin page + API
  await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
  const adminText = await page.evaluate(() => document.body.innerText);
  rec("AC3-nonadmin-admin-page", { showsNotFound: adminText.includes("ไม่พบหน้านี้"), showsAdminCopy: adminText.includes("คำขอจ้างงาน") });
  await page.screenshot({ path: `${OUT}/test-006-ac3-nonadmin-admin.png`, fullPage: true });
  const admApi = await page.request.get(`${API}/admin/hire-requests`);
  rec("AC3-nonadmin-admin-api", { status: admApi.status(), body: await admApi.json() });

  // AC-4 negative: PATCH as non-admin
  const patch = await page.request.patch(`${API}/admin/hire-requests/00000000-0000-0000-0000-000000000000`, { data: { contacted: true } });
  rec("AC4-nonadmin-patch", { status: patch.status() });

  // AC-6: no admin link in any signed-in surface (desktop)
  for (const path of ["/ideas", "/me", `/ideas/${IDEA_H1}`]) {
    await page.goto(ORIGIN + path, { waitUntil: "networkidle" });
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.includes("admin")));
    const menuText = await page.evaluate(() => document.querySelector("header")?.innerText ?? "");
    rec("AC6-no-admin-link", { path, adminLinks: links, headerMentionsAdmin: /admin|คำขอจ้างงาน/i.test(menuText) });
  }

  // AC-1 wording in EN (reopen, W-3 must be English)
  await ctx.addCookies([{ name: "lang", value: "en", url: ORIGIN }]);
  await page.goto(`${ORIGIN}/ideas/${IDEA_H1}`, { waitUntil: "networkidle" });
  const en = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map((b) => ({ text: b.innerText.trim(), disabled: b.disabled }));
    return { w3en: btns.some((b) => b.text === "Request sent" && b.disabled), btns };
  });
  rec("AC2-reopen-en", en);
  await page.screenshot({ path: `${OUT}/test-006-ac2-en-reopen.png`, fullPage: true });
  await ctx.close();
}

// ---------- AC-3 signed-out /admin ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${ORIGIN}/admin`, { waitUntil: "networkidle" });
  const t = await page.evaluate(() => document.body.innerText);
  rec("AC3-signedout-admin", { showsAdminCopy: t.includes("คำขอจ้างงาน") || t.includes("Hire requests"), showsLandingOrSignin: /เข้าสู่ระบบ|Sign in|ไม่พบหน้านี้|not found/i.test(t) });
  await page.screenshot({ path: `${OUT}/test-006-ac3-signedout-admin.png`, fullPage: true });
  const api = await page.request.get(`${API}/admin/hire-requests`);
  rec("AC3-signedout-admin-api", { status: api.status() });
  await ctx.close();
}

// ---------- AC-6 at 375 px ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await ctx.addCookies([{ name: "lang", value: "th", url: ORIGIN }]);
  const page = await ctx.newPage();
  await apiCookie(page, "qa-tanya-hire1@example.com");
  for (const path of ["/ideas", `/ideas/${IDEA_H1}`]) {
    await page.goto(ORIGIN + path, { waitUntil: "networkidle" });
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.includes("admin")));
    const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    rec("AC6-375", { path, adminLinks: links, hscroll });
  }
  await page.screenshot({ path: `${OUT}/test-006-375-result-w3.png`, fullPage: true });
  await ctx.close();
}

// ---------- AC-2 guard: h2 cannot hire h1's idea ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await apiCookie(page, "qa-tanya-hire2@example.com");
  const r = await page.request.post(`${API}/ideas/${IDEA_H1}/hire-request`);
  rec("AC-edge-other-user-idea", { status: r.status(), body: await r.json() });
  await ctx.close();
}

await browser.close();
console.log("DONE");
