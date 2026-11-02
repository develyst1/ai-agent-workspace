// TEST-002 app rows (REQ-002 wording), app's browser build at 360×800, headless Chrome, by data-testid.
// It starts: the team's mail stand-in (tests/harness/mail-stand-in/run.ts, local IMAP+SMTP, no real mailbox) and QA's own
// back end (backend.ts → corner_chat_test_qa_a on the owner's server). The app must already run on 127.0.0.1:3192
// (vite, VITE_FAKE=false, /api → 127.0.0.1:8191).
//   QA_BACK_REPO=… QA_SECRETS=… node app-mail.mjs <playwright-core/index.mjs>
// Finish with `bun backend.ts … drop`. Throwaway harness; every mail and account is made up.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const here = dirname(fileURLToPath(import.meta.url));
const BACK = process.env.QA_BACK_REPO, SECRETS = process.env.QA_SECRETS;
if (!BACK || !SECRETS) throw new Error("set QA_BACK_REPO and QA_SECRETS");
const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));
const { simpleParser } = createRequire(join(BACK, "package.json"))("mailparser");
const APP = "http://127.0.0.1:3192", API = "http://127.0.0.1:8191/api/v1";
const tag = Date.now().toString(36);
const work = join(here, `.mail-${tag}`), inDir = join(work, "in"), sentDir = join(work, "sent"), portsFile = join(work, "ports.json");
mkdirSync(inDir, { recursive: true }); mkdirSync(sentDir, { recursive: true });
const A = { email: "somchai@test.local", password: `stand-in-pw-${tag}` };
const SENDER = "boss@acme.example.test";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (c, what, expected, actual, pass) => { checks.push({ case: c, what, expected, actual: String(actual), pass }); console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${actual}`); };
const api = async (method, path, token, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); return { status: r.status, json: t ? JSON.parse(t) : null };
};

// ---------- stand-in + back end
const stand = spawn("bun", [join(here, "../mail-stand-in/run.ts"), "--dir", inDir, "--ports-file", portsFile, "--sent-dir", sentDir, "--user", A.email, "--password", A.password], { cwd: BACK, stdio: "ignore" });
for (let i = 0; i < 60 && !existsSync(portsFile); i++) await sleep(250);
const ports = JSON.parse(readFileSync(portsFile, "utf8"));
let back = null;
async function startBack(smtpPort) {
  back = spawn("bun", [join(here, "backend.ts"), BACK, SECRETS, "up", "--imap-port", String(ports.imapPort), "--smtp-port", String(smtpPort), "--poll", "3"], { stdio: "ignore" });
  for (let i = 0; i < 90; i++) { try { if ((await fetch(`${API}/health`)).ok) return; } catch {} await sleep(500); }
  throw new Error("back end did not start");
}
async function stopBack() { back?.kill(); await new Promise((r) => (back.exitCode !== null ? r() : back.once("exit", r))); await sleep(800); }
let n = 0;
function drop(o) {
  const id = `<am-${++n}-${tag}@test.local>`;
  const head = [`From: "หัวหน้า ทดสอบ" <${SENDER}>`, `To: ${o.to ?? A.email}`, ...(o.cc ? [`Cc: ${o.cc}`] : []), `Subject: ${o.subject}`,
    `Date: ${new Date().toUTCString()}`, `Message-ID: ${id}`, "MIME-Version: 1.0", `Content-Type: ${o.ct ?? "text/plain; charset=UTF-8"}`, "Content-Transfer-Encoding: 8bit"].join("\r\n");
  writeFileSync(join(inDir, `${String(n).padStart(3, "0")}.eml`), Buffer.from(`${head}\r\n\r\n${o.body}\r\n`, "utf8"));
  return id;
}
async function idFor(token, subject, ms = 60000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    for (const tab of ["notified", "held"]) {
      const items = (await api("GET", `/messages?tab=${tab}&channel=mail`, token)).json?.items ?? [];
      const hit = items.find((i) => i.subject === subject);
      if (hit) return hit.id;
    }
    await sleep(1000);
  }
  return null;
}

await startBack(ports.smtpPort);
const OT = (await api("POST", "/auth/login", null, { email: secrets.ownerEmail, password: secrets.ownerPassword })).json.token;
const email = `am-u1-${tag}@qa-a.test`, pw = `pw-am-${tag}`;
await api("POST", "/admin/users", OT, { name: "ผู้ใช้เมลแอป", email, password: pw });
const T = (await api("POST", "/auth/login", null, { email, password: pw })).json.token;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await (await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, locale: "th-TH" })).newPage();
const tid = (id) => page.getByTestId(id);
const on = (id, ms = 15000) => tid(id).first().waitFor({ timeout: ms }).then(() => true, () => false);
const txt = async (id) => (await tid(id).first().innerText().catch(() => "<absent>")).replace(/\s+/g, " ").trim();
const shot = (k) => page.screenshot({ path: join(here, "shots", `m${k}.png`) });
const smtpFiles = () => readdirSync(sentDir).filter((f) => f.endsWith(".eml"));

try {
  await page.goto(`${APP}/signin`);
  await tid("signin-email").fill(email); await tid("signin-password").fill(pw); await tid("signin-submit").click();
  await on("screen-messages");
  // #1 / #2 connect screen
  await page.goto(`${APP}/channels/zimbra`);
  await on("zimbra-email-input");
  check("1", "connect screen title", "เชื่อมอีเมล Zimbra", await txt("screen-title"), (await txt("screen-title")) === "เชื่อมอีเมล Zimbra");
  await tid("zimbra-email-input").fill(A.email); await tid("zimbra-password-input").fill("wrong-password"); await tid("zimbra-connect").click();
  await on("zimbra-error");
  check("2", "wrong mail password wording (app)", "เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง", await txt("zimbra-error"), (await txt("zimbra-error")) === "เชื่อมไม่สำเร็จ ตรวจอีเมลหรือรหัสผ่านอีกครั้ง");
  check("2", "the password field is cleared after an attempt", "empty", await tid("zimbra-password-input").inputValue(), (await tid("zimbra-password-input").inputValue()) === "");
  await shot("01-wrong-password");
  await tid("zimbra-password-input").fill(A.password); await tid("zimbra-connect").click();
  await on("zimbra-connected");
  check("1", "right password → connected (app)", "เชื่อมแล้ว · the address shown", `${await txt("zimbra-connected")} · ${await txt("zimbra-email")}`, (await txt("zimbra-connected")) === "เชื่อมแล้ว" && (await txt("zimbra-email")) === A.email);
  await shot("02-connected");

  // mails arrive (after connect: no backfill)
  const sCc = `[corner-chat TEST-002 app] สำเนา ${tag}`, sAtt = `[corner-chat TEST-002 app] ไฟล์แนบ ${tag}`, sTh = `[corner-chat TEST-002 app] ขอให้ตอบกลับ ${tag}`;
  drop({ subject: sCc, to: "someone@acme.example.test", cc: A.email, body: "ส่งสำเนาถึงคุณ" });
  const b = `b${tag}`;
  const thaiName = `=?UTF-8?B?${Buffer.from("รายงาน.xlsx").toString("base64")}?=`;
  drop({ subject: sAtt, ct: `multipart/mixed; boundary="${b}"`, body: `--${b}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nแนบมาครับ\r\n--${b}\r\nContent-Type: application/pdf; name="a.pdf"\r\nContent-Disposition: attachment; filename="a.pdf"\r\nContent-Transfer-Encoding: base64\r\n\r\nJVBERi0xLjQ=\r\n--${b}\r\nContent-Type: application/octet-stream; name="${thaiName}"\r\nContent-Disposition: attachment; filename="${thaiName}"\r\nContent-Transfer-Encoding: base64\r\n\r\neA==\r\n--${b}--` });
  drop({ subject: sTh, body: "พรุ่งนี้ประชุมได้ไหมครับ\r\nตอบด้วยนะครับ" });
  const [idCc, idAtt, idTh] = [await idFor(T, sCc), await idFor(T, sAtt), await idFor(T, sTh)];
  check("4s", "three mails taken in after connect", "3 ids", [idCc, idAtt, idTh].filter(Boolean).length, !!idCc && !!idAtt && !!idTh);

  // #9 Cc marker, #11/#12 attachments note, subject + Thai body in the app
  await page.goto(`${APP}/messages/${idCc}`); await on("detail-text");
  check("9", "Cc-only mail shows the Cc marker (app)", "สำเนาถึงคุณ", await txt("detail-cc"), (await txt("detail-cc")) === "สำเนาถึงคุณ");
  await shot("03-cc-marker");
  await page.goto(`${APP}/messages/${idAtt}`); await on("detail-text");
  check("12", "attachments note (app)", "มีไฟล์แนบ: a.pdf, รายงาน.xlsx", await txt("detail-attachments"), (await txt("detail-attachments")) === "มีไฟล์แนบ: a.pdf, รายงาน.xlsx");
  await shot("04-attachments");
  await page.goto(`${APP}/messages/${idTh}`); await on("detail-text");
  check("7", "Thai subject and body readable on the detail (app)", `${sTh} · พรุ่งนี้ประชุมได้ไหมครับ`, `${await txt("detail-subject")} · ${(await txt("detail-text")).slice(0, 30)}`,
    (await txt("detail-subject")) === sTh && (await txt("detail-text")).startsWith("พรุ่งนี้ประชุมได้ไหมครับ"));

  // #13 reply from the app → ส่งแล้ว, one SMTP message
  await tid("detail-open-reply").click(); await on("reply-body");
  await tid("reply-body").fill("ได้ครับ เจอกันพรุ่งนี้"); await tid("reply-send").click();
  const sentOk = await page.getByTestId("reply-status").filter({ hasText: "ส่งแล้ว" }).first().waitFor({ timeout: 45000 }).then(() => true, () => false);
  await sleep(1500);
  const f1 = smtpFiles();
  const p1 = f1.length ? await simpleParser(readFileSync(join(sentDir, f1[0]))) : null;
  check("13", "reply from the app → ส่งแล้ว, one mail out", `ส่งแล้ว · 1 SMTP message · Re: ${sTh}`, `${await txt("reply-status")} · ${f1.length} · ${p1?.subject}`, sentOk && f1.length === 1 && p1?.subject === `Re: ${sTh}`);
  await shot("05-reply-sent");

  // #16 SMTP down → ส่งไม่สำเร็จ ลองอีกครั้ง + retry; #17 server back → retry IN PLACE (same screen) → sent once
  await stopBack(); await startBack(1);
  await page.goto(`${APP}/messages/${idTh}/reply`); await on("reply-body");
  await tid("reply-body").fill("ส่งตอนเซิร์ฟเวอร์เมลล่ม"); await tid("reply-send").click();
  const failed = await page.getByTestId("reply-status").filter({ hasText: "ส่งไม่สำเร็จ" }).first().waitFor({ timeout: 45000 }).then(() => true, () => false);
  const failText = await page.getByTestId("reply-status").filter({ hasText: "ส่งไม่สำเร็จ" }).first().innerText().catch(() => "<absent>");
  check("16", "SMTP unreachable → the app says so, with a retry", "ส่งไม่สำเร็จ ลองอีกครั้ง · retry button", `${failText} · retry ${await tid("reply-retry").count()}`, failed && failText.trim() === "ส่งไม่สำเร็จ ลองอีกครั้ง" && (await tid("reply-retry").count()) > 0);
  await shot("06-reply-failed");
  await stopBack(); await startBack(ports.smtpPort);
  await tid("reply-retry").first().click();
  const okAfter = await page.getByTestId("reply-status").filter({ hasText: "ส่งแล้ว" }).first().waitFor({ timeout: 45000 }).then(() => true, () => false);
  await sleep(12000);
  check("17", "retry on the same screen after the server is back", "ส่งแล้ว · 2 SMTP messages in all", `${okAfter} · ${smtpFiles().length}`, okAfter && smtpFiles().length === 2);
  await shot("07-retried");

  // #18 a failed reply after the user LEAVES the reply screen / reopens the app: still shown, and can it be retried?
  await stopBack(); await startBack(1);
  await page.goto(`${APP}/messages/${idTh}/reply`); await on("reply-body");
  await tid("reply-body").fill("ล้มเหลวแล้วออกจากหน้าจอ"); await tid("reply-send").click();
  await page.getByTestId("reply-status").filter({ hasText: "ส่งไม่สำเร็จ" }).first().waitFor({ timeout: 45000 }).catch(() => {});
  await page.goto(`${APP}/messages/${idTh}`); await on("detail-replies");
  await page.reload(); await on("detail-replies"); // as if the app was closed and reopened
  const repliesText = await txt("detail-replies");
  const retryish = await page.locator('[data-testid*="retry"]').count() + await page.getByRole("button", { name: /ลองอีกครั้ง|ส่งอีกครั้ง/ }).count();
  const failedApi = ((await api("GET", `/messages/${idTh}`, T)).json?.message?.replies ?? []).filter((r) => r.status === "failed").length;
  check("18", "after leaving the reply screen: the failed reply is shown", "listed with ส่งไม่สำเร็จ ลองอีกครั้ง", repliesText.slice(-60), repliesText.includes("ล้มเหลวแล้วออกจากหน้าจอ") && repliesText.includes("ส่งไม่สำเร็จ ลองอีกครั้ง"));
  check("18", "after leaving the reply screen: the user can retry it (AC-6 'with a retry', req. 6)", "≥ 1 retry control on the detail", `${retryish} retry controls · API failed replies ${failedApi}`, retryish > 0);
  await shot(`08-detail-failed-${tag}`); // unique name: run 2 overwrote run 1's DEF-1 picture (2026-11-01)
  // #18 (re-test after TASK-036): the detail's retry actually delivers — server back up, press it, exactly one more mail
  const before18 = smtpFiles().length;
  await stopBack(); await startBack(ports.smtpPort);
  await page.reload(); await on("detail-replies");
  const btn = page.locator('[data-testid^="detail-reply-retry-"]').first();
  const hadBtn = (await btn.count()) > 0;
  if (hadBtn) await btn.click();
  const doneOnDetail = await page.getByTestId("detail-replies").filter({ hasText: "ล้มเหลวแล้วออกจากหน้าจอ" }).first()
    .waitFor({ timeout: 5000 }).then(async () => {
      for (let i = 0; i < 60; i++) { if (!(await txt("detail-replies")).includes("ส่งไม่สำเร็จ")) return true; await sleep(1000); }
      return false;
    }, () => false);
  await sleep(12000);
  const after18 = smtpFiles().length;
  check("18", "the detail's retry delivers the failed reply once", "button pressed · no ส่งไม่สำเร็จ left · +1 mail", `${hadBtn} · ${doneOnDetail} · ${before18} → ${after18}`, hadBtn && doneOnDetail && after18 === before18 + 1);
  await shot("09-detail-retried");

  // #21 disconnect from the app
  await page.goto(`${APP}/channels/zimbra`); await on("zimbra-disconnect");
  await tid("zimbra-disconnect").click();
  const gone = await on("zimbra-connect");
  const chans = (await api("GET", "/channels", T)).json.mail;
  check("21", "disconnect from the app", "connect form back · API connected false", `${gone} · ${chans.connected}`, gone && chans.connected === false);
} catch (e) {
  check("x", "script error", "none", e.message.split("\n")[0], false);
  await shot("xx-error").catch(() => {});
} finally {
  await browser.close();
  await stopBack().catch(() => {});
  stand.kill();
  rmSync(work, { recursive: true, force: true });
}
writeFileSync(join(here, "app-mail-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
process.exit(0);
