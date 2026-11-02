// TEST-002 owner window (REQ-002 rows only the real Zimbra can prove). Box A = the owner's WORK mail on Zimbra (the app
// connects to it); box B = his personal mail (any service; he sends from it and reads the reply in it).
//   QA_BACK_REPO=… QA_SECRETS=… bun test-002-live.ts <code>      (<code> = the short word in the subject he types)
// Steps: read-only counts of A (INBOX total/unseen, Sent) → start QA's back end on the REAL host (--real-mail, poll 10 s,
// AI gateway and LINE on closed local ports: no real mail text leaves this machine) → U1 connects A → wait ≤ 20 min for his
// mail with <code> in the subject → check Thai → ONE Thai reply to B (the owner's go: the window itself) → counts again →
// disconnect → stop → drop the database. A's password is read in-process from the back repo's .env, never printed.
// Throwaway harness.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { call, login, qadb, secrets, waitDecided, BACK_REPO, SECRETS } from "./qadb";

const code = process.argv[2];
if (!code || !/^[a-z0-9]{3,12}$/i.test(code)) { console.error("usage: bun test-002-live.ts <code: 3–12 letters/digits>"); process.exit(2); }
const env = Object.fromEntries(readFileSync(join(BACK_REPO, ".env"), "utf8").split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m: any) => [m[1], m[2].replace(/^["']|["']$/g, "")]));
const A = { email: env.TEST_MAIL_A_EMAIL, password: env.TEST_MAIL_A_PASSWORD }, B = env.TEST_MAIL_B_EMAIL;
if (!A.email || !A.password || !B) throw new Error("TEST_MAIL_A_EMAIL / TEST_MAIL_A_PASSWORD / TEST_MAIL_B_EMAIL must be set in the back repo's .env");
const here = import.meta.dir;
const { ImapFlow } = createRequire(join(BACK_REPO, "package.json"))("imapflow");
const out: Record<string, unknown> = { code, startedAt: new Date().toISOString() };
const say = (k: string, v: unknown) => { out[k] = v; console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`); };

async function counts() {
  const c = new ImapFlow({ host: env.ZIMBRA_IMAP_HOST || "mail.entronica.in.th", port: Number(env.ZIMBRA_IMAP_PORT || 993), secure: true, auth: { user: A.email, pass: A.password }, logger: false });
  await c.connect();
  const inbox = await c.status("INBOX", { messages: true, unseen: true }); // STATUS changes no flags
  const sentBox = (await c.list()).find((f: any) => f.specialUse === "\\Sent")?.path ?? "Sent";
  const sent = await c.status(sentBox, { messages: true });
  await c.logout();
  return { inbox: inbox.messages, unseen: inbox.unseen, sent: sent.messages };
}

let child: any = null;
try {
  say("countsBefore", await counts());
  child = Bun.spawn(["bun", join(here, "backend.ts"), BACK_REPO, SECRETS, "up", "--real-mail", "--poll", "10"], { stdout: Bun.file(join(here, "backend-live.log")), stderr: Bun.file(join(here, "backend-live.err")) });
  for (let i = 0; i < 90; i++) { try { if ((await fetch("http://127.0.0.1:8191/api/v1/health")).ok) break; } catch {} await Bun.sleep(500); }
  const OT = (await login(secrets.ownerEmail, secrets.ownerPassword)).json.token;
  const em = `live-${code}@qa-a.test`, pw = `pw-live-${code}-${Date.now().toString(36)}`;
  await call("POST", "/admin/users", OT, { name: "ผู้ใช้ทดสอบเมลจริง", email: em, password: pw });
  const T = (await login(em, pw)).json.token;
  const con = await call("PUT", "/channels/mail", T, { email: A.email, password: A.password });
  say("#1 connect real Zimbra", `${con.status} connected=${con.json?.mail?.connected}`);
  const connectedAt = Date.now();
  console.log(`\n>>> READY ${new Date().toISOString()} — ask the owner to send from B now. Subject must contain: ${code}\n`);

  let row: any = null;
  for (let i = 0; i < 120 && !row; i++) {
    [row] = (await qadb`select id, subject, text, recipient_kind, received_at, stored_at from messages where subject like ${"%" + code + "%"} limit 1`) as any[];
    if (!row) await Bun.sleep(10000);
  }
  if (!row) throw new Error("no mail with the code arrived within 20 minutes");
  const lag = (new Date(row.stored_at).getTime() - new Date(row.received_at).getTime()) / 1000;
  say("#4 arrival", `stored ${lag.toFixed(0)} s after the mail's Date header (${((Date.now() - connectedAt) / 60000).toFixed(1)} min after connect)`);
  say("#7 real Thai — subject", row.subject);
  say("#7 real Thai — text (first 120)", String(row.text).slice(0, 120));
  say("#7 replacement characters", /�/.test(row.subject + row.text) ? "FOUND" : "none");
  say("recipient kind", row.recipient_kind);

  await waitDecided(row.id, 60000);
  const replyText = `ได้รับแล้วครับ ทดสอบตอบกลับภาษาไทย ${code}`;
  const r = await call("POST", `/messages/${row.id}/replies`, T, { body: replyText });
  let st = r.json?.reply?.status;
  for (let i = 0; i < 40 && st !== "sent" && st !== "failed"; i++) { await Bun.sleep(2000); st = (await qadb`select status from mail_outbox where id = ${r.json?.reply?.id}`)[0]?.status; }
  // Never print A's or B's address: they are the owner's real mailboxes (redacted from run qa7k's files, 2026-11-01).
  const toRow = (await qadb`select 1 from mail_outbox where id = ${r.json?.reply?.id}`).length;
  say("#13 reply", `${r.status} → ${st} at ${new Date().toISOString()} (to B only; outbox row ${toRow})`);
  await Bun.sleep(5000);
  say("countsAfter", await counts());
  const dis = await call("DELETE", "/channels/mail", T);
  say("#21 disconnect", dis.status);
  const log = await Bun.file(join(here, "backend-live.log")).text().catch(() => "");
  say("#20 log", `${log.split("\n").length} lines · A's password ${log.includes(A.password) ? "FOUND" : "absent"}`);
  console.log("\n>>> Now ask the owner (via the PM): did the reply arrive in B, in the SAME conversation as his mail, from his work address, Thai readable? (TEST-002 § Owner window, step 3)\n");
} catch (e) {
  say("error", (e as Error).message);
} finally {
  child?.kill(); await child?.exited;
  const drop = Bun.spawnSync(["bun", join(here, "backend.ts"), BACK_REPO, SECRETS, "drop"]);
  say("cleanup", drop.stdout.toString().trim());
  writeFileSync(join(here, `test-002-live-${code}.json`), JSON.stringify(out, null, 2));
  await qadb.close();
  process.exit(0);
}
