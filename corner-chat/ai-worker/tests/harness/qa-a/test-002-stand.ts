// TEST-002 (REQ-002) on the LOCAL mail stand-in (the back repo's test/support/mail-server.ts: hoodiecrow IMAP + smtp-server
// on 127.0.0.1, no TLS, no real mailbox). The real Zimbra rows are the owner window's (TEST-002 § Owner window).
//   QA_BACK_REPO=… QA_SECRETS=… bun test-002-stand.ts      → one line per check, writes test-002-stand-result.json
// The back end is QA's own instance (backend.ts → corner_chat_test_qa_a on the owner's server), started and stopped here as a
// child so the restart and "SMTP unreachable" rows can be made. Finish with `bun backend.ts … drop`. Throwaway harness.
import { writeFileSync, createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { call, login, ingest, lineMsg, qadb, secrets, waitDecided, BACK_REPO, SECRETS } from "./qadb";

type Check = { case: string; what: string; expected: string; actual: string; pass: boolean };
const checks: Check[] = [];
const check = (c: string, what: string, expected: string, actual: unknown, pass: boolean) => {
  const a = typeof actual === "string" ? actual : JSON.stringify(actual);
  checks.push({ case: c, what, expected, actual: a, pass });
  console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${a}`);
};
const code = (r: { status: number; json: any }) => `${r.status} ${r.json?.error?.code ?? ""}`.trim();
const tag = Date.now().toString(36);
const here = import.meta.dir;
const req = createRequire(join(BACK_REPO, "package.json"));
const { simpleParser } = req("mailparser");
const { ImapFlow } = req("imapflow");
const { startMailStandIn } = await import(join(BACK_REPO, "test/support/mail-server.ts"));

// ---------- stand-in (mailbox A + a second login for the isolation row)
const A = { email: "somchai@test.local", password: `stand-in-pw-${tag}` };
const A2 = { email: "other@test.local", password: `stand-in-pw2-${tag}` };
const SENDER = "boss@acme.example.test";
let n = 0;
const msgId = () => `<t2-${++n}-${tag}@test.local>`;
type Mail = { id: string; raw: string | Buffer };
function eml(o: { subject?: string; to?: string; cc?: string; extraHeaders?: string; body?: string; contentType?: string; cte?: string; inReplyTo?: string; rawBody?: Buffer }): Mail {
  const id = msgId();
  const head = [
    `From: "หัวหน้า ทดสอบ" <${SENDER}>`, `To: ${o.to ?? A.email}`, ...(o.cc ? [`Cc: ${o.cc}`] : []),
    `Subject: ${o.subject ?? `[corner-chat TEST-002] ${n}`}`, `Date: ${new Date().toUTCString()}`, `Message-ID: ${id}`,
    ...(o.inReplyTo ? [`In-Reply-To: ${o.inReplyTo}`, `References: ${o.inReplyTo}`] : []),
    "MIME-Version: 1.0", `Content-Type: ${o.contentType ?? "text/plain; charset=UTF-8"}`, `Content-Transfer-Encoding: ${o.cte ?? "8bit"}`,
    ...(o.extraHeaders ? [o.extraHeaders] : []),
  ].join("\r\n");
  if (o.rawBody) return { id, raw: Buffer.concat([Buffer.from(head + "\r\n\r\n", "utf8"), o.rawBody]) };
  if (o.body && o.body.length > 1_000_000) return { id, raw: Buffer.concat([Buffer.from(head + "\r\n\r\n", "utf8"), Buffer.from(o.body, "utf8")]) };
  // UTF-8 bytes, never a JS string: the stand-in treats a string as "binary" and cuts every Thai character to its low
  // byte (run 1 of this script, 2026-11-01: five false FAILs, harness-side).
  return { id, raw: Buffer.from(`${head}\r\n\r\n${o.body ?? "ข้อความทดสอบภาษาไทย"}\r\n`, "utf8") };
}
const tis620 = (s: string) => Buffer.from([...s].map((ch) => { const c = ch.codePointAt(0)!; return c >= 0x0e01 && c <= 0x0e5b ? c - 0x0e00 + 0xa0 : c; }));
const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64").replace(/.{76}/g, "$&\r\n");
const qp = (s: string) => [...Buffer.from(s, "utf8")].map((b) => (b > 126 || b === 61 ? `=${b.toString(16).toUpperCase().padStart(2, "0")}` : String.fromCharCode(b))).join("").replace(/.{70}/g, "$&=\r\n");
const w2047 = (s: string) => `=?UTF-8?B?${Buffer.from(s).toString("base64")}?=`;

const stand = await startMailStandIn({ user: A.email, password: A.password, extraUsers: { [A2.email]: A2.password } });
const old = eml({ subject: "[corner-chat TEST-002] เก่าก่อนเชื่อม", body: "มาก่อนเชื่อม ต้องไม่ถูกดึง" });
await stand.append(old.raw); // already in INBOX before anyone connects

// ---------- QA back end as a child
let child: any = null;
const logFile = join(here, "backend-t2.log");
const log = createWriteStream(logFile, { flags: "a" });
async function startBackend(smtpPort: number) {
  child = Bun.spawn(["bun", join(here, "backend.ts"), BACK_REPO, SECRETS, "up", "--imap-port", String(stand.imapPort), "--smtp-port", String(smtpPort), "--poll", "3"],
    { stdout: "pipe", stderr: "pipe" });
  for (const s of [child.stdout, child.stderr]) (async () => { for await (const c of s) log.write(c); })();
  for (let i = 0; i < 90; i++) { try { if ((await fetch("http://127.0.0.1:8191/api/v1/health")).ok) return; } catch {} await Bun.sleep(500); }
  throw new Error("back end did not start");
}
async function stopBackend() { child?.kill(); await child?.exited; await Bun.sleep(800); }
const rowsFor = async (id: string) => (await qadb`select id, user_id, filter_state, subject, text, recipient_kind, has_attachments, attachment_names from messages where mail_message_id = ${id}`) as any[];
async function waitRow(id: string, ms = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const r = await rowsFor(id); if (r.length) return { row: r[0], ms: Date.now() - t0, count: r.length }; await Bun.sleep(500); }
  return { row: null, ms: Date.now() - t0, count: 0 };
}
async function deliver(m: Mail) { await stand.append(m.raw); return waitRow(m.id); }
const outbox = async (replyId: string) => (await qadb`select status, attempts, error from mail_outbox where id = ${replyId}`)[0] as any;
async function waitReply(replyId: string, want: string[], ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const o = await outbox(replyId); if (want.includes(o?.status)) return o; await Bun.sleep(500); }
  return await outbox(replyId);
}

await qadb`select 1`; // connection up before the child resets nothing (the DB is created by `up` if missing)
await startBackend(stand.smtpPort);
const OT = (await login(secrets.ownerEmail, secrets.ownerPassword)).json.token;
const mk = async (nm: string) => {
  const email = `t2-${nm}-${tag}@qa-a.test`, password = `pw-t2-${nm}-${tag}`;
  const u = (await call("POST", "/admin/users", OT, { name: `ผู้ใช้เมล ${nm}`, email, password })).json.user;
  return { ...u, token: (await login(email, password)).json.token as string };
};
const U1 = await mk("u1"), U2 = await mk("u2");

try {
  // #2 wrong password, #3 bad input — nothing stored
  let r = await call("PUT", "/channels/mail", U1.token, { email: A.email, password: "wrong-password" });
  const [{ c: acc0 }] = await qadb`select count(*)::int as c from mail_accounts where user_id = ${U1.id}`;
  check("2", "connect with a wrong password", "422 MAIL_LOGIN_FAILED · 0 rows", `${code(r)} · ${acc0}`, r.status === 422 && r.json.error.code === "MAIL_LOGIN_FAILED" && acc0 === 0);
  for (const [label, body, ok] of [
    ["malformed email", { email: "notanemail", password: "x12345678" }, [400]],
    ["empty password", { email: A.email, password: "" }, [400]],
    ["an address the server does not know", { email: `x-${tag}@example.test`, password: "x12345678" }, [422]],
  ] as const) {
    r = await call("PUT", "/channels/mail", U1.token, body);
    check("3", `connect with ${label}`, `${ok.join("/")}`, code(r), (ok as readonly number[]).includes(r.status));
  }
  const [{ c: acc1 }] = await qadb`select count(*)::int as c from mail_accounts where user_id = ${U1.id}`;
  check("3", "nothing stored after the refused connects", "0", acc1, acc1 === 0);

  // #1 (stand-in) connect; #20 no password in the reply
  r = await call("PUT", "/channels/mail", U1.token, { email: A.email, password: A.password });
  check("1s", "connect with the right password (stand-in)", "200 connected", `${r.status} ${r.json?.mail?.connected}`, r.status === 200 && r.json.mail.connected === true);
  const ch = await call("GET", "/channels", U1.token);
  check("20", "GET /channels and the PUT reply never carry the password", "no password text, no password field",
    /password/i.test(JSON.stringify(ch.json) + JSON.stringify(r.json)) || JSON.stringify(ch.json).includes(A.password) ? "leak" : "clean",
    !/password/i.test(JSON.stringify(ch.json) + JSON.stringify(r.json)) && !JSON.stringify(ch.json).includes(A.password));

  // no backfill: the mail that was there before connecting is not taken in
  await Bun.sleep(8000);
  check("1s", "mail already in INBOX before connect is not taken in (SPEC §6)", "0 rows", (await rowsFor(old.id)).length, (await rowsFor(old.id)).length === 0);

  // #4 intake time (stand-in, poll 3 s) + #13 base mail
  const base = eml({ subject: "[corner-chat TEST-002] ขอให้ยืนยันนัดประชุม", body: "พรุ่งนี้ประชุม 10 โมง ช่วยยืนยันด้วยครับ" });
  const w = await deliver(base);
  check("4s", "a new mail is taken in (stand-in, poll 3 s)", "≤ 120 s, once", `${(w.ms / 1000).toFixed(1)} s, ${w.count} row`, !!w.row && w.ms <= 120000 && w.count === 1);

  // #7 Thai encodings
  const TH = "สวัสดีครับ ทดสอบภาษาไทย ๑๒๓";
  const enc: [string, Mail][] = [
    ["UTF-8 8bit", eml({ body: TH })],
    ["TIS-620", eml({ contentType: "text/plain; charset=TIS-620", rawBody: tis620(TH) })],
    ["windows-874", eml({ contentType: "text/plain; charset=windows-874", rawBody: tis620(TH) })],
    ["quoted-printable", eml({ cte: "quoted-printable", body: qp(TH) })],
    ["base64", eml({ cte: "base64", body: b64(TH) })],
    ["HTML only", eml({ contentType: "text/html; charset=UTF-8", body: `<html><body><p><b>${TH}</b></p><div>บรรทัดสอง</div></body></html>` })],
    ["Thai subject (RFC 2047)", eml({ subject: w2047("หัวเรื่องภาษาไทย ทดสอบ"), body: TH })],
    ["TIS-620 subject (RFC 2047 Q)", eml({ subject: `=?TIS-620?B?${tis620("เรื่องไทยแบบเก่า").toString("base64")}?=`, body: TH })],
  ];
  for (const [label, m] of enc) {
    const got = await deliver(m);
    const text = String(got.row?.text ?? ""), subj = String(got.row?.subject ?? "");
    const want = label.includes("subject") ? (label.startsWith("TIS") ? "เรื่องไทยแบบเก่า" : "หัวเรื่องภาษาไทย ทดสอบ") : TH;
    const ok = label.includes("subject") ? subj === want : text.includes(TH) && !/[<>]/.test(text) && !/�/.test(text);
    check("7", `Thai: ${label}`, `"${want}" readable${label === "HTML only" ? ", no tags" : ""}`, label.includes("subject") ? subj : text.slice(0, 60).replace(/\s+/g, " "), ok);
  }

  // #8 empty subject / empty body / long body
  for (const [label, m] of [
    ["no subject", eml({ subject: "" })], ["empty body", eml({ body: "" })], ["long body (200 KB)", eml({ body: "ยาว ".repeat(50000) })],
  ] as [string, Mail][]) {
    const got = await deliver(m);
    check("8", label, "taken in once", got.count, got.count === 1);
  }

  // #9 / #10 recipient kinds
  const kinds: [string, Mail, string][] = [
    ["only in Cc", eml({ to: "someone@acme.example.test", cc: A.email }), "cc"],
    ["in To and Cc", eml({ to: A.email, cc: A.email }), "to"],
    ["only in Bcc (not in To/Cc)", eml({ to: "someone@acme.example.test" }), "to"],
    ["mailing list (List-Id)", eml({ to: "all-staff@acme.example.test", extraHeaders: "List-Id: <all-staff.acme.example.test>" }), "list"],
  ];
  for (const [label, m, kind] of kinds) {
    const got = await deliver(m);
    check(label.includes("Cc") && kind === "cc" ? "9" : "10", `recipient kind: ${label}`, kind, got.row?.recipient_kind, got.row?.recipient_kind === kind);
  }

  // #11 / #12 attachments
  const boundary = `b-${tag}`;
  const mp = (parts: string) => eml({ contentType: `multipart/mixed; boundary="${boundary}"`, cte: "7bit", body: parts });
  const pdfPart = (name: string) => `--${boundary}\r\nContent-Type: application/pdf; name="${name}"\r\nContent-Disposition: attachment; filename="${name}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64("%PDF-1.4 QA-MARKER-PDF-CONTENT " + "x".repeat(2000))}\r\n`;
  const textPart = `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\nแนบไฟล์มาให้ครับ\r\n`;
  let got = await deliver(mp(`${textPart}${pdfPart("report.pdf")}--${boundary}--`));
  const [stored] = await qadb`select text from messages where mail_message_id = ${n ? `<t2-${n}-${tag}@test.local>` : ""}`;
  check("11", "one PDF attached", "hasAttachments · [report.pdf] · file content not stored", `${got.row?.has_attachments} · ${JSON.stringify(got.row?.attachment_names)} · ${String(stored?.text ?? "").includes("QA-MARKER") ? "content stored" : "not stored"}`,
    got.row?.has_attachments === true && JSON.stringify(got.row?.attachment_names) === '["report.pdf"]' && !String(stored?.text ?? "").includes("QA-MARKER"));
  const thaiName = `=?UTF-8?B?${Buffer.from("รายงาน.xlsx").toString("base64")}?=`;
  got = await deliver(mp(`${textPart}${pdfPart("a.pdf")}--${boundary}\r\nContent-Type: application/vnd.ms-excel; name="${thaiName}"\r\nContent-Disposition: attachment; filename="${thaiName}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64("x")}\r\n--${boundary}--`));
  check("12", "two files, one with a Thai name", '["a.pdf","รายงาน.xlsx"]', JSON.stringify(got.row?.attachment_names), JSON.stringify(got.row?.attachment_names) === '["a.pdf","รายงาน.xlsx"]');
  await waitDecided(got.row?.id); // undecided messages are in neither tab (SPEC-001 §3.4)
  const list = (await call("GET", "/messages?tab=notified&channel=mail", U1.token)).json.items ?? [];
  const item = list.find((i: any) => i.id === got.row?.id);
  check("12", "the API shows the names (app shows มีไฟล์แนบ: {names})", "attachmentNames on the item", JSON.stringify(item?.attachmentNames), JSON.stringify(item?.attachmentNames) === '["a.pdf","รายงาน.xlsx"]');

  // too large (> 15 MB): row kept with the PM's wording
  got = await deliver(eml({ body: "ก".repeat(16 * 1024 * 1024 / 3 + 1000) }));
  check("Q-SA-1", "a mail over 15 MB: row kept, preview in the PM's wording", "อีเมลนี้ใหญ่เกินไป ({n} MB) เปิดอ่านใน Zimbra", String(got.row?.text ?? "<no row>").slice(0, 70), /^อีเมลนี้ใหญ่เกินไป \(\d+(\.\d+)? MB\) เปิดอ่านใน Zimbra/.test(String(got.row?.text ?? "")));

  // #6 read marks: the poller must not set \Seen
  const imap = new ImapFlow({ host: "127.0.0.1", port: stand.imapPort, secure: false, auth: { user: A.email, pass: A.password }, logger: false });
  await imap.connect();
  await imap.mailboxOpen("INBOX", { readOnly: true });
  let seen = 0, total = 0;
  for await (const m of imap.fetch("1:*", { flags: true })) { total++; if (m.flags?.has("\\Seen")) seen++; }
  await imap.logout();
  check("6", "the poller marks nothing as read", "0 \\Seen", `${seen} of ${total}`, seen === 0 && total > 5);

  // #5 restart: no duplicates
  const before = (await qadb`select mail_message_id, count(*)::int as c from messages where user_id = ${U1.id} group by 1 having count(*) > 1`).length;
  const totalBefore = (await qadb`select count(*)::int as c from messages where user_id = ${U1.id}`)[0].c;
  await stopBackend(); await startBackend(stand.smtpPort); await Bun.sleep(10000);
  const totalAfter = (await qadb`select count(*)::int as c from messages where user_id = ${U1.id}`)[0].c;
  const dups = (await qadb`select mail_message_id from messages where user_id = ${U1.id} group by 1 having count(*) > 1`).length;
  check("5", "restart + 3 polls: no mail taken in twice", `same row count, 0 duplicates`, `${totalBefore} → ${totalAfter}, duplicates ${before}/${dups}`, totalAfter === totalBefore && dups === 0);

  // #13 / #15 reply, Thai, threading headers, Sent copy, sender only
  const baseRow = (await rowsFor(base.id))[0];
  await waitDecided(baseRow.id);
  const sentBefore = (await stand.messagesIn("Sent")).length, smtpBefore = stand.sent.length;
  const replyText = "ยืนยันครับ เข้าได้ ๑๐ โมง";
  r = await call("POST", `/messages/${baseRow.id}/replies`, U1.token, { body: replyText });
  const rep1 = await waitReply(r.json?.reply?.id, ["sent", "failed"]);
  const out1 = stand.sent[smtpBefore];
  const p1 = out1 ? await simpleParser(Buffer.from(out1.raw, "binary")) : null;
  check("13", "reply → sent", "202 queued → sent", `${r.status} ${r.json?.reply?.status} → ${rep1?.status}`, r.status === 202 && rep1?.status === "sent");
  check("13", "reply envelope: from mailbox A, to the sender only", `${A.email} → [${SENDER}]`, `${out1?.from} → ${JSON.stringify(out1?.to)}`, out1?.from === A.email && JSON.stringify(out1?.to) === JSON.stringify([SENDER]));
  check("13", "reply headers: Re: subject, In-Reply-To, References", `Re: … · ${base.id}`, `${p1?.subject} · ${p1?.inReplyTo} · ${JSON.stringify(p1?.references)}`,
    p1?.subject === "Re: [corner-chat TEST-002] ขอให้ยืนยันนัดประชุม" && p1?.inReplyTo === base.id && [].concat(p1?.references ?? []).includes(base.id));
  check("15", "Thai reply body readable after the SMTP round trip", replyText, String(p1?.text ?? "").trim(), String(p1?.text ?? "").trim() === replyText);
  check("13", "one copy in mailbox A's Sent", `+1`, `${sentBefore} → ${(await stand.messagesIn("Sent")).length}`, (await stand.messagesIn("Sent")).length === sentBefore + 1);
  // reply to a mail that had Cc → still the sender only (D37)
  const ccMail = eml({ to: A.email, cc: "colleague@acme.example.test" });
  const ccRow = (await deliver(ccMail)).row; await waitDecided(ccRow.id);
  const s0 = stand.sent.length;
  r = await call("POST", `/messages/${ccRow.id}/replies`, U1.token, { body: "ตอบเฉพาะผู้ส่ง" });
  await waitReply(r.json?.reply?.id, ["sent", "failed"]);
  check("13", "reply to a mail with Cc goes to the sender only (D37, no reply-all)", `[${SENDER}]`, JSON.stringify(stand.sent[s0]?.to), JSON.stringify(stand.sent[s0]?.to) === JSON.stringify([SENDER]));

  // #14 reply to a reply: subject not doubled, References chain kept
  const rr = eml({ subject: "Re: [corner-chat TEST-002] ขอให้ยืนยันนัดประชุม", inReplyTo: p1?.messageId ?? base.id, body: "รับทราบครับ" });
  const rrRow = (await deliver(rr)).row; await waitDecided(rrRow.id);
  const s1 = stand.sent.length;
  r = await call("POST", `/messages/${rrRow.id}/replies`, U1.token, { body: "ขอบคุณครับ" });
  await waitReply(r.json?.reply?.id, ["sent", "failed"]);
  const p2 = stand.sent[s1] ? await simpleParser(Buffer.from(stand.sent[s1].raw, "binary")) : null;
  check("14", "reply to a reply", "Re: once · In-Reply-To = that mail · References keep the chain", `${p2?.subject} · ${p2?.inReplyTo === rr.id} · ${JSON.stringify(p2?.references)}`,
    p2?.subject === "Re: [corner-chat TEST-002] ขอให้ยืนยันนัดประชุม" && p2?.inReplyTo === rr.id && [].concat(p2?.references ?? []).includes(rr.id));

  // reply refusals
  const line: any = ingest(lineMsg(U1.id, "ข้อความไลน์ [S71]")); await waitDecided(line.messageId);
  r = await call("POST", `/messages/${line.messageId}/replies`, U1.token, { body: "x" });
  check("13", "reply to a LINE message", "400 NOT_MAIL", code(r), r.status === 400 && r.json.error.code === "NOT_MAIL");
  r = await call("POST", `/messages/${baseRow.id}/replies`, U1.token, { body: "" });
  check("13", "empty reply body", "400", code(r), r.status === 400);

  // #16 SMTP unreachable → failed, nothing sent; #18 survives a restart; #17 retry delivers once, double retry
  await stopBackend(); await startBackend(1);
  const s2 = stand.sent.length;
  const fA = await call("POST", `/messages/${baseRow.id}/replies`, U1.token, { body: "ส่งตอนเซิร์ฟเวอร์ล่ม ก" });
  const fB = await call("POST", `/messages/${baseRow.id}/replies`, U1.token, { body: "ส่งตอนเซิร์ฟเวอร์ล่ม ข" });
  const oA = await waitReply(fA.json?.reply?.id, ["failed", "sent"]), oB = await waitReply(fB.json?.reply?.id, ["failed", "sent"]);
  check("16", "SMTP unreachable → failed with an error, nothing reaches the server", "failed ×2 · 0 accepted", `${oA?.status}/${oB?.status} · "${String(oA?.error).slice(0, 50)}" · ${stand.sent.length - s2}`,
    oA?.status === "failed" && oB?.status === "failed" && !!oA?.error && stand.sent.length === s2);
  const det = (await call("GET", `/messages/${baseRow.id}`, U1.token)).json.message;
  check("16", "the detail shows the failed reply (app: ส่งไม่สำเร็จ ลองอีกครั้ง + retry)", "status failed in replies[]", JSON.stringify(det.replies.map((x: any) => x.status)), det.replies.filter((x: any) => x.status === "failed").length === 2);
  await stopBackend(); await startBackend(stand.smtpPort);
  const det2 = (await call("GET", `/messages/${baseRow.id}`, U1.token)).json.message;
  check("18", "failed replies survive a back-end restart (never silently lost)", "2 failed", det2.replies.filter((x: any) => x.status === "failed").length, det2.replies.filter((x: any) => x.status === "failed").length === 2);
  const s3 = stand.sent.length;
  const ra = await call("POST", `/replies/${fA.json.reply.id}/retry`, U1.token);
  await waitReply(fA.json.reply.id, ["sent"]);
  const again = await call("POST", `/replies/${fA.json.reply.id}/retry`, U1.token);
  const [d1, d2] = await Promise.all([call("POST", `/replies/${fB.json.reply.id}/retry`, U1.token), call("POST", `/replies/${fB.json.reply.id}/retry`, U1.token)]);
  await waitReply(fB.json.reply.id, ["sent"]); await Bun.sleep(12000);
  const delivered = stand.sent.slice(s3).map((m: any) => m.raw.includes(Buffer.from("ส่งตอนเซิร์ฟเวอร์ล่ม").toString("binary")) || true);
  const bodies = await Promise.all(stand.sent.slice(s3).map(async (m: any) => String((await simpleParser(Buffer.from(m.raw, "binary"))).text ?? "").trim()));
  check("17", "retry → sent once; retry again → 409 NOT_FAILED", "202 · sent · 409", `${ra.status} · ${(await outbox(fA.json.reply.id)).status} · ${code(again)}`, ra.status === 202 && (await outbox(fA.json.reply.id)).status === "sent" && again.status === 409);
  check("17", "double-tap retry on the other failed reply", "one 202 + one 409 (or both 202), exactly one mail", `${d1.status}/${d2.status} · bodies ${JSON.stringify(bodies)}`,
    bodies.filter((b) => b === "ส่งตอนเซิร์ฟเวอร์ล่ม ก").length === 1 && bodies.filter((b) => b === "ส่งตอนเซิร์ฟเวอร์ล่ม ข").length === 1 && bodies.length === 2 && delivered.length === 2);

  // #19 password at rest, #20 logs
  const [acc] = await qadb`select password_enc from mail_accounts where user_id = ${U1.id}`;
  const pwEnc = String(acc?.password_enc ?? "");
  check("19", "stored mailbox password", "not plain, not base64(plain), present", pwEnc ? `${pwEnc.length} chars, plain: ${pwEnc.includes(A.password)}, b64(plain): ${pwEnc.includes(Buffer.from(A.password).toString("base64"))}` : "no row",
    !!pwEnc && !pwEnc.includes(A.password) && !pwEnc.includes(Buffer.from(A.password).toString("base64")));
  log.end(); await Bun.sleep(300);
  const logText = await Bun.file(logFile).text();
  check("20", "back-end log (whole run, 4 starts)", "no mailbox password, no URL", `${logText.split("\n").length} lines · password ${logText.includes(A.password) ? "FOUND" : "absent"} · postgres URL ${/postgres(ql)?:\/\//.test(logText) ? "FOUND" : "absent"}`,
    !logText.includes(A.password) && !/postgres(ql)?:\/\//.test(logText));

  // #22 isolation: U2 connects the second login; neither reaches the other's mail
  r = await call("PUT", "/channels/mail", U2.token, { email: A2.email, password: A2.password });
  const u2ch = (await call("GET", "/channels", U2.token)).json.mail;
  const u1get = await call("GET", `/messages/${baseRow.id}`, U2.token);
  const u1rep = await call("POST", `/messages/${baseRow.id}/replies`, U2.token, { body: "x" });
  const u1retry = await call("POST", `/replies/${fA.json.reply.id}/retry`, U2.token);
  const u2list = (await call("GET", "/messages?tab=notified&channel=mail", U2.token)).json.items ?? [];
  check("22", "U2: own mailbox only; U1's mail, reply and retry by id → 404", `${A2.email} · 404 · 404 · 404 · none of U1's ids`,
    `${u2ch?.email} · ${u1get.status} · ${u1rep.status} · ${u1retry.status} · ${u2list.some((i: any) => i.id === baseRow.id) ? "U1 mail listed" : "clean"}`,
    u2ch?.email === A2.email && u1get.status === 404 && u1rep.status === 404 && u1retry.status === 404 && !u2list.some((i: any) => i.id === baseRow.id));

  // #21 disconnect: password gone, nothing new taken in, old mail kept
  r = await call("DELETE", "/channels/mail", U1.token);
  const delStatus = r.status;
  const [{ c: acc2 }] = await qadb`select count(*)::int as c from mail_accounts where user_id = ${U1.id}`;
  const after = eml({ subject: "[corner-chat TEST-002] หลังเลิกเชื่อม" });
  await stand.append(after.raw); await Bun.sleep(10000);
  const u1rows = (await qadb`select count(*)::int as c from messages where mail_message_id = ${after.id} and user_id = ${U1.id}`)[0].c;
  const kept = (await call("GET", `/messages/${baseRow.id}`, U1.token)).status;
  r = await call("POST", `/messages/${baseRow.id}/replies`, U1.token, { body: "หลังเลิกเชื่อม" });
  check("21", "disconnect: 204 · password row gone · new mail not taken in for U1 · old mail kept · reply → 409", "204 · 0 · 0 · 200 · 409 MAIL_NOT_CONNECTED",
    `${delStatus} · ${acc2} · ${u1rows} · ${kept} · ${code(r)}`,
    delStatus === 204 && acc2 === 0 && u1rows === 0 && kept === 200 && r.status === 409 && r.json.error.code === "MAIL_NOT_CONNECTED");
} catch (e) {
  check("x", "script error", "none", (e as Error).message.split("\n")[0], false);
} finally {
  await stopBackend();
  await stand.close();
}
writeFileSync(join(here, "test-002-stand-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed`);
await qadb.close();
process.exit(0);
