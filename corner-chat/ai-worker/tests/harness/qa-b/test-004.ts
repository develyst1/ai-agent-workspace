// QA Team B (Tefany) — TEST-004 (REQ-003) harness. Throwaway, not product code.
//
//   bun test-004.ts            → one line per check; writes test-004-result.json + backend.log here
//
// What it proves: our LINE intake/link/push logic end to end on a LOCAL back end, with webhook events this script
// signs itself (its own made-up channel secret), the product's FAKE LINE API (records every push/reply) and the
// FAKE gateway (qa-b/gw.json: [HOLD] → score 0, [L2DOWN] → layer 2 HTTP 500, else 100).
// What it does NOT prove: real LINE event shapes ("tag all", quote-reply ids), the real push, the real OA's
// one-OA-per-group refusal — those need the test OA (B1/B7).
// Isolation: ONLY database corner_chat_test_qa_b on the owner's Postgres server (D43): the owner's DATABASE_URL from the
// back repo's .env with the database name swapped, read in-process, never printed. Never a local Postgres (rule 4).
// Back end on 127.0.0.1:8192, gateway :3992. The database is created at the start and dropped at the end of each run.
// (Runs before 2026-11-01 ~21:00 used corner_chat_qa_tefany on the local cluster — F-022.)
import { readFileSync, writeFileSync, existsSync, createWriteStream } from "node:fs";
import { createHmac } from "node:crypto";
import { SQL } from "bun";

const BACK = "H:/corner-chat/corner-chat-back";
const HERE = import.meta.dir;
const SECRETS =
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json";
const DB_NAME = "corner_chat_test_qa_b_t004"; // own name per script (TASK-039 Q, 2026-11-02): never shares, never force-drops another run
const PORT = 8192, GW_PORT = 3992;
const API = `http://127.0.0.1:${PORT}/api/v1`;
const LINE_SECRET = "qa-b-made-up-channel-secret";

// ---------- database (own DB only)
const dotenv = readFileSync(`${BACK}/.env`, "utf8");
// D43 + CLAUDE.md rule 4: the owner's DATABASE_URL only (never a local Postgres); only the database name is swapped.
const adminUrl = dotenv.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)?.[1]?.replace(/^["']|["']$/g, "");
if (!adminUrl) throw new Error("no DATABASE_URL in the back repo's .env (the owner gives it; D43)");
const au = new URL(adminUrl);
if (["127.0.0.1", "localhost", "::1"].includes(au.hostname)) throw new Error("refusing: a local Postgres (CLAUDE.md rule 4)");
const qaUrl = new URL(adminUrl); qaUrl.pathname = `/${DB_NAME}`;
// CREATE/DROP only, through the maintenance DB "postgres" (as scripts/db-init.ts does); no other database is touched.
const maintUrl = new URL(adminUrl); maintUrl.pathname = "/postgres";

// TASK-039: never cut off a live run. If anything is connected to this DB, stop and say so instead of dropping it.
{
  const s = new SQL(maintUrl.toString());
  try {
    const [{ n }] = await s`select count(*)::int n from pg_stat_activity where datname = ${DB_NAME}`;
    if (n > 0) { console.error(`refusing: ${n} connection(s) are using ${DB_NAME} — another QA-B run is up; stop it first`); process.exit(3); }
  } finally { await s.close(); }
}

{
  const s = new SQL(maintUrl.toString());
  await s.unsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`);
  await s.unsafe(`CREATE DATABASE "${DB_NAME}"`);
  await s.close();
}
if (!existsSync(SECRETS)) {
  const rnd = (n: number) => Buffer.from(crypto.getRandomValues(new Uint8Array(n))).toString("base64url");
  writeFileSync(SECRETS, JSON.stringify({ secretKey: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64"), ownerEmail: "owner@qa-b.test", ownerPassword: rnd(18) }));
}
const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));

// ---------- fakes
const { startFakeLineApi } = await import(`${BACK}/src/modules/line/testing/fake-line-api.ts`);
const line = startFakeLineApi();
const gw = Bun.spawn(["bun", `${HERE}/../fake-gateway/server.ts`, `${HERE}/gw.json`, "--port", String(GW_PORT)], { stdout: "ignore", stderr: "ignore" });

const env = {
  ...process.env,
  NODE_ENV: "development", PORT: String(PORT), HOST: "127.0.0.1",
  DATABASE_URL: qaUrl.toString(), DATABASE_URL_TEST: "",
  SECRET_KEY: secrets.secretKey, OWNER_EMAIL: secrets.ownerEmail, OWNER_PASSWORD: secrets.ownerPassword, OWNER_NAME: "QA-B Owner",
  ADMIN_WEB_ORIGIN: "http://localhost:3192",
  ZIMBRA_IMAP_HOST: "127.0.0.1", ZIMBRA_IMAP_PORT: "9", ZIMBRA_SMTP_HOST: "127.0.0.1", ZIMBRA_SMTP_PORT: "9", MAIL_POLL_SECONDS: "0",
  FILTER_PAUSED: "false", LLM_GATEWAY_URL: `http://127.0.0.1:${GW_PORT}`, LLM_GATEWAY_KEY: "",
  FCM_SERVICE_ACCOUNT_JSON: "",
  LINE_CHANNEL_SECRET: LINE_SECRET, LINE_CHANNEL_ACCESS_TOKEN: "qa-b-made-up-token", LINE_API_BASE: line.baseUrl,
};
const mig = Bun.spawnSync(["bun", "scripts/migrate.ts"], { cwd: BACK, env });
if (mig.exitCode !== 0) {
  // clean up before failing: nothing of this run may stay behind (D43: the DB is dropped after each run)
  gw.kill(); line.stop();
  const s = new SQL(maintUrl.toString());
  try { await s.unsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`); } finally { await s.close(); }
  throw new Error(`migrate failed (QA DB dropped): ${mig.stderr.toString().slice(0, 400)}`);
}
const logPath = `${HERE}/backend.log`;
const logOut = createWriteStream(logPath);
const back = Bun.spawn(["bun", "src/index.ts"], { cwd: BACK, env, stdout: "pipe", stderr: "pipe" });
for (const s of [back.stdout, back.stderr]) (async () => { for await (const c of s as any) logOut.write(c); })();
const db = new SQL(qaUrl.toString());

async function stopAll() {
  back.kill(); gw.kill(); line.stop(); await db.close(); logOut.end();
  await Bun.sleep(500);
  const s = new SQL(maintUrl.toString()); // D43: dropped after each run
  try { await s.unsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`); console.log(`dropped ${DB_NAME}`); } finally { await s.close(); }
}
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${API}/health`)).ok) break; } catch {}
    if (i > 80) throw new Error("back end did not come up");
    await Bun.sleep(250);
  }

  // ---------- helpers
  type Check = { case: string; what: string; expected: string; actual: string; pass: boolean };
  const checks: Check[] = [];
  const check = (c: string, what: string, expected: string, actual: unknown, pass: boolean) => {
    const a = typeof actual === "string" ? actual : JSON.stringify(actual);
    checks.push({ case: c, what, expected, actual: a, pass });
    console.log(`${pass ? "PASS" : "FAIL"} #${c} ${what} — expected ${expected} — got ${a}`);
  };
  async function call(method: string, path: string, token?: string, body?: unknown) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: any = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, json };
  }
  const sign = (body: string, secret = LINE_SECRET) => createHmac("sha256", secret).update(body).digest("base64");
  async function post(events: unknown[], opts: { sig?: string | null; tamper?: boolean } = {}) {
    const body = JSON.stringify({ destination: "Uqab-oa", events });
    const sig = opts.sig === undefined ? sign(body) : opts.sig;
    const sent = opts.tamper ? body.replace("}]}", ',"x":1}]}') : body;
    const res = await fetch(`${API}/webhooks/line`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(sig === null ? {} : { "x-line-signature": sig }) },
      body: sent,
    });
    return res.status;
  }
  let seq = 0;
  const mid = () => `qab-m-${Date.now()}-${++seq}`;
  const dm = (from: string, text: string) => ({ type: "message", timestamp: Date.now(), replyToken: `rt-${++seq}`, source: { type: "user", userId: from }, message: { id: mid(), type: "text", text } });
  const gmsg = (group: string, from: string, text: string, extra: Record<string, unknown> = {}) =>
    ({ type: "message", timestamp: Date.now(), replyToken: `rt-${++seq}`, source: { type: "group", groupId: group, userId: from }, message: { id: mid(), type: "text", text, ...extra } });
  const tagOf = (...ids: string[]) => ({ mention: { mentionees: ids.map((u, i) => ({ index: i, length: 3, type: "user", userId: u })) } });
  const repliesTo = (rt: string) => line.calls.filter((c: any) => c.path === "/v2/bot/message/reply" && c.body?.replyToken === rt).map((c: any) => c.body.messages?.[0]?.text);
  const pushes = () => line.calls.filter((c: any) => c.path === "/v2/bot/message/push");
  async function rows(): Promise<Record<string, number>> {
    const t = await db`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'`;
    const out: Record<string, number> = {};
    for (const { table_name } of t) out[table_name] = (await db.unsafe(`select count(*)::int n from "${table_name}"`))[0].n;
    return out;
  }
  const diff = (a: Record<string, number>, b: Record<string, number>) => Object.keys(b).filter((k) => a[k] !== b[k]).map((k) => `${k} ${a[k]}→${b[k]}`);
  async function markerHits(marker: string) {
    const t = await db`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'`;
    const hit: string[] = [];
    for (const { table_name } of t) {
      const [r] = await db.unsafe(`select count(*)::int n from "${table_name}" x where x::text like $1`, [`%${marker}%`]);
      if (r.n > 0) hit.push(`${table_name}:${r.n}`);
    }
    return hit;
  }
  async function msgsFor(token: string, tab = "notified") { return ((await call("GET", `/messages?tab=${tab}`, token)).json?.items ?? []) as any[]; }
  async function waitDone(ms = 15000) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const [r] = await db`select count(*)::int n from messages where filter_state <> 'done'`;
      if (r.n === 0) { await Bun.sleep(600); return; }
      await Bun.sleep(200);
    }
  }
  const login = async (email: string, password: string) => (await call("POST", "/auth/login", undefined, { email, password })).json?.token as string;

  // ---------- users
  const OT = await login(secrets.ownerEmail, secrets.ownerPassword);
  const mk = async (n: string) => {
    const email = `${n}@qa-b.test`, pw = `pw-${n}-${crypto.randomUUID().slice(0, 8)}`;
    const u = (await call("POST", "/admin/users", OT, { name: `ผู้ใช้ ${n}`, email, password: pw })).json.user;
    const t = await login(email, pw);
    await call("PUT", "/conditions/settings", t, { bar: 70, sentences: "แจ้งเรื่องงาน" });
    return { id: u.id as string, t };
  };
  const U1 = await mk("u1"), U2 = await mk("u2"), U3 = await mk("u3"), U4 = await mk("u4"), U5 = await mk("u5");
  const L1 = "Uqab0000000000000000000000000l1", L2 = "Uqab0000000000000000000000000l2", L3 = "Uqab0000000000000000000000000l3";
  const L4 = "Uqab0000000000000000000000000l4", L9 = "Uqab0000000000000000000000000l9", LX = "Uqab0000000000000000000000000lx";
  const M = "Uqab00000000000000000000000000m", N = "Uqab00000000000000000000000000n";
  const G1 = "Cqab000000000000000000000000g1", G2 = "Cqab000000000000000000000000g2", G3 = "Cqab000000000000000000000000g3";
  const code = async (u: { t: string }) => (await call("POST", "/channels/line/link-code", u.t)).json;
  const linked = async (u: { t: string }) => (await call("GET", "/channels", u.t)).json?.line;

  // ---------- AC-1 linking
  let c = await code(U1);
  check("1", "link-code shape", "6 digits, expires ≈ +10 min", c, /^\d{6}$/.test(c.code) && Math.abs(new Date(c.expiresAt).getTime() - Date.now() - 600_000) < 10_000);
  let ev = dm(L1, c.code);
  await post([ev]);
  let l = await linked(U1);
  check("1", "AC-1 right code → linked", "reply เชื่อม LINE แล้ว · linked · displayName from profile", `${repliesTo(ev.replyToken)} · ${JSON.stringify(l)}`, repliesTo(ev.replyToken)[0] === "เชื่อม LINE แล้ว" && l?.linked === true && !!l?.displayName);

  let wrong = String((Number(c.code) + 1) % 1000000).padStart(6, "0");
  ev = dm(L9, wrong); await post([ev]);
  check("2", "AC-1 wrong code", "reply รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป", repliesTo(ev.replyToken), repliesTo(ev.replyToken)[0] === "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป");

  // #3 expiry: QA moves expires_at of ITS OWN code rows (own DB) to stand in for the clock
  c = await code(U2);
  await db`update line_link_codes set expires_at = now() - interval '10 seconds' where code = ${c.code} and used_at is null`;
  ev = dm(L2, c.code); await post([ev]);
  check("3", "AC-1 expired code (10:10 stand-in)", "refused, not linked", `${repliesTo(ev.replyToken)} · linked=${(await linked(U2))?.linked}`, repliesTo(ev.replyToken)[0]?.startsWith("รหัสไม่ถูกต้อง") && (await linked(U2))?.linked === false);
  const cA = await code(U2); const cB = await code(U2);
  await db`update line_link_codes set expires_at = now() + interval '10 seconds' where code = ${cB.code} and used_at is null`;
  ev = dm(L2, cA.code); await post([ev]);
  check("4", "AC-1 old code after a new one", "A refused", repliesTo(ev.replyToken), repliesTo(ev.replyToken)[0]?.startsWith("รหัสไม่ถูกต้อง"));
  ev = dm(L2, cB.code); await post([ev]);
  check("3", "AC-1 code 10 s before expiry (9:50 stand-in)", "linked", `${repliesTo(ev.replyToken)} · ${(await linked(U2))?.linked}`, (await linked(U2))?.linked === true);
  check("4", "AC-1 newest code works", "B linked", (await linked(U2))?.linked, (await linked(U2))?.linked === true);
  ev = dm(L4, cB.code); await post([ev]);
  check("5", "AC-1 used code from another LINE account", "refused; U2 still linked", `${repliesTo(ev.replyToken)} · ${(await linked(U2))?.linked}`, repliesTo(ev.replyToken)[0]?.startsWith("รหัสไม่ถูกต้อง") && (await linked(U2))?.linked === true);
  const c3 = await code(U3);
  ev = dm(L1, c3.code); await post([ev]);
  check("6", "AC-1 LINE account linked to U1 sends U3's code (Q2)", "refused; U1 linked, U3 not", `${repliesTo(ev.replyToken)} · U1=${(await linked(U1))?.linked} U3=${(await linked(U3))?.linked}`, repliesTo(ev.replyToken)[0]?.startsWith("รหัสไม่ถูกต้อง") && (await linked(U1))?.linked === true && (await linked(U3))?.linked === false);
  ev = dm(L3, c3.code); await post([ev]);
  check("6", "the same U3 code then works from a free LINE account", "linked", (await linked(U3))?.linked, (await linked(U3))?.linked === true);

  // #1b brute force
  for (let i = 0; i < 5; i++) await post([dm(LX, String(100000 + i))]);
  const c5 = await code(U5);
  ev = dm(LX, c5.code); await post([ev]);
  check("1b", "AC-1 6th try after 5 wrong in 10 min", "no reply, not linked", `${JSON.stringify(repliesTo(ev.replyToken))} · ${(await linked(U5))?.linked}`, repliesTo(ev.replyToken).length === 0 && (await linked(U5))?.linked === false);

  // #1c not a code
  let r0 = await rows();
  const nc = ["สวัสดี", "12345", "1234567"].map((t) => dm(L9, t));
  await post(nc);
  check("1c", "AC-1 text that is not 6 digits", "no reply, no row change", `${nc.map((e) => repliesTo(e.replyToken).length)} · ${diff(r0, await rows())}`, nc.every((e) => repliesTo(e.replyToken).length === 0) && diff(r0, await rows()).length === 0);

  // ---------- groups (req 2): join check
  line.setResponse(`/v2/bot/group/${G2}/member/${L2}`, 404, {});
  await post([{ type: "join", timestamp: Date.now(), replyToken: "rt-j1", source: { type: "group", groupId: G1 } }]);
  await post([{ type: "join", timestamp: Date.now(), replyToken: "rt-j2", source: { type: "group", groupId: G2 } }]);
  const groups = async (u: { t: string }) => ((await call("GET", "/channels/line/groups", u.t)).json?.groups ?? []) as any[];
  let g1 = await groups(U1), g2u2 = await groups(U2);
  check("33", "req 2 OA joins G1; U1 never wrote there", "G1 on U1's list", g1.map((g) => g.id), g1.some((g) => g.id === G1));
  check("33", "req 2 G2 where U2 is NOT a member (profile 404)", "U2's list = [G1] only", g2u2.map((g) => g.id), g2u2.length === 1 && g2u2[0].id === G1);
  const c4 = await code(U4); await post([dm(L4, c4.code)]);
  check("33a", "req 2 U4 links after the OA is in G1/G2", "G1 and G2 listed for U4 (fake says member)", (await groups(U4)).length, (await groups(U4)).length === 2);
  await post([{ type: "memberJoined", timestamp: Date.now(), replyToken: "rt-mj", source: { type: "group", groupId: G3 }, joined: { members: [{ type: "user", userId: L1 }] } }]);
  check("33b", "req 2 memberJoined G3 for U1", "U1 now lists 3 groups (G1, G2, G3)", (await groups(U1)).length, (await groups(U1)).length === 3);
  check("33c", "req 2 user with no link has no groups", "[]", await groups(U5), (await groups(U5)).length === 0);

  // ---------- AC-2 intake triggers (G1 holds U1, U2, U3, U4 per the join check)
  await call("PUT", "/channels/line/names", U1.t, { names: ["ต้น", "Ton"] });
  await call("PUT", "/channels/line/names", U2.t, { names: ["บี"] });
  const baseU1 = (await msgsFor(U1.t)).length;
  const p0 = pushes().length;
  await post([gmsg(G1, M, "@U1 ช่วยดูเอกสารนี้หน่อย", tagOf(L1))]); await waitDone();
  let u1 = await msgsFor(U1.t);
  check("7", "AC-2 tag U1", "1 new message for U1, recipientKind mention", `${u1.length - baseU1} · ${u1[0]?.recipientKind ?? "?"}`, u1.length - baseU1 === 1);
  const ownMsg = gmsg(G1, L1, "ประชุมกี่โมง");
  r0 = await rows();
  await post([ownMsg]); await waitDone();
  const dOwn = diff(r0, await rows());
  check("18", "AC-3 U1's own non-trigger message", "only line_own_messages +1", dOwn, dOwn.length === 1 && dOwn[0]!.startsWith("line_own_messages"));
  await post([gmsg(G1, M, "บ่ายสองครับ", { quotedMessageId: ownMsg.message.id })]); await waitDone();
  check("8", "AC-2 reply to U1's own message", "+1 for U1", (await msgsFor(U1.t)).length - u1.length, (await msgsFor(U1.t)).length - u1.length === 1);
  const before9 = await Promise.all([U1, U2, U3, U4].map((u) => msgsFor(u.t)));
  await post([gmsg(G1, M, "ทุกคนเข้าประชุมด่วน", { mention: { mentionees: [{ index: 0, length: 4, type: "all" }] } })]); await waitDone();
  const after9 = await Promise.all([U1, U2, U3, U4].map((u) => msgsFor(u.t)));
  check("9", "AC-2 tag all (harness shape type:all)", "+1 for each of U1–U4", after9.map((a, i) => a.length - before9[i]!.length), after9.every((a, i) => a.length - before9[i]!.length === 1));
  let n0 = (await msgsFor(U1.t)).length;
  await post([gmsg(G1, M, "ต้น ช่วยดูหน่อย")]); await waitDone();
  check("10", "AC-2 nickname untagged", "+1 for U1", (await msgsFor(U1.t)).length - n0, (await msgsFor(U1.t)).length - n0 === 1);
  n0 = (await msgsFor(U1.t)).length;
  await post([gmsg(G1, M, "ต้นไม้ล้มขวางถนน")]); await waitDone();
  check("11", "AC-2 name inside another word (recorded, not judged)", "taken in (substring, Q7)", (await msgsFor(U1.t)).length - n0, (await msgsFor(U1.t)).length - n0 === 1);
  n0 = (await msgsFor(U1.t)).length;
  await post([gmsg(G1, M, "TON please check")]); await waitDone();
  check("12", "AC-2 Latin name, other case", "taken in (Q7)", (await msgsFor(U1.t)).length - n0, (await msgsFor(U1.t)).length - n0 === 1);
  n0 = (await msgsFor(U1.t)).length; const n2 = (await msgsFor(U2.t)).length;
  await post([gmsg(G1, M, "@U1 กับ บี มาคุยกัน QAB13", tagOf(L1))]); await waitDone();
  const u1n = await msgsFor(U1.t), u2n = await msgsFor(U2.t);
  check("13", "AC-2 tag U1 + name U2 in one message", "+1 each", `${u1n.length - n0},${u2n.length - n2}`, u1n.length - n0 === 1 && u2n.length - n2 === 1);

  // ---------- AC-3 drop unread
  const aiCount = async () => (await db`select count(*)::int n from ai_calls`)[0].n as number;
  const dropCases: Array<[string, string, any]> = [
    ["14", "tag a non-linked member", gmsg(G1, M, "@N QAB-DROP-14 ดูหน่อย", tagOf(N))],
    ["15", "reply to a non-linked member's message", gmsg(G1, M, "QAB-DROP-15 ตอบ", { quotedMessageId: "nonlinked-msg-1" })],
    ["16", "U1 writes U1's own nickname (Q1)", gmsg(G1, L1, "ต้น QAB-DROP-16 เองนะ")],
    ["17", "plain chatter", gmsg(G1, M, "ใครกินข้าวยัง QAB-DROP-17")],
    ["20", "image with no trigger", { ...gmsg(G1, M, ""), message: { id: mid(), type: "image" } }],
    ["20", "sticker with no trigger", { ...gmsg(G1, M, ""), message: { id: mid(), type: "sticker", packageId: "1", stickerId: "1" } }],
  ];
  for (const [cn, what, e] of dropCases) {
    const before = await rows(), ai0 = await aiCount();
    await post([e]); await waitDone(3000);
    const d = diff(before, await rows()), ai1 = await aiCount();
    const okRows = cn === "16" ? d.length === 1 && d[0]!.startsWith("line_own_messages") : d.length === 0;
    check(cn, `AC-3 ${what}`, cn === "16" ? "only line_own_messages +1; no message, no AI call" : "no row change, no AI call", `rows ${JSON.stringify(d)} · ai ${ai0}→${ai1}`, okRows && ai0 === ai1);
  }
  const markers = ["QAB-DROP-14", "QAB-DROP-15", "QAB-DROP-16", "QAB-DROP-17", "ประชุมกี่โมง"];
  const dbHits = (await Promise.all(markers.map(async (m) => [m, await markerHits(m)] as const))).filter(([, h]) => h.length);
  check("17", "AC-3 dropped text in any table", "0 hits", dbHits, dbHits.length === 0);

  // ---------- AC-4 push
  await waitDone();
  const pushedU1 = pushes().filter((p: any) => p.body?.to === L1);
  check("21", "AC-4 passed message pushed 1-on-1 to U1's LINE id", "≥ 1 push to L1", pushedU1.length, pushedU1.length >= 1);
  const lastTagPush = pushedU1.find((p: any) => String(p.body?.messages?.[0]?.text).includes("ช่วยดูเอกสารนี้หน่อย"));
  const txt = String(lastTagPush?.body?.messages?.[0]?.text ?? "");
  check("21", "AC-4 push text = about line, newline, first lines", "line 1 about line (from layer 1), line 2 message", JSON.stringify(txt), txt.split("\n").length >= 2 && txt.split("\n")[0]!.length > 0 && txt.split("\n")[1]!.includes("ช่วยดูเอกสารนี้หน่อย"));
  check("35", "req 7 receive-only: no push/reply addressed to a group id", "0", line.calls.filter((x: any) => /^C/.test(String(x.body?.to ?? ""))).length, line.calls.filter((x: any) => /^C/.test(String(x.body?.to ?? ""))).length === 0);
  const count = async () => (await call("GET", "/admin/stats/line-pushes", OT)).json?.count as number;
  let k0 = await count(), pp = pushes().length;
  await post([gmsg(G1, M, "@U1 ข้อความยาว\nบรรทัดสอง\nบรรทัดสาม\nบรรทัดสี่\nบรรทัดห้า QAB23", tagOf(L1))]); await waitDone();
  const p23 = pushes().slice(pp).find((p: any) => p.body?.to === L1);
  const t23 = String(p23?.body?.messages?.[0]?.text ?? "");
  check("23", "AC-4 5-line message", "about + lines 1–2 only", JSON.stringify(t23), t23.split("\n").length === 3 && t23.includes("บรรทัดสอง") && !t23.includes("บรรทัดสาม"));
  check("30", "AC-7 count +1 per push", `${k0}→${k0 + 1}`, `${k0}→${await count()}`, (await count()) === k0 + 1);
  k0 = await count(); pp = pushes().length;
  await post([gmsg(G1, M, "@U1 [HOLD] ขายของ", tagOf(L1))]); await waitDone();
  const heldU1 = await msgsFor(U1.t, "held");
  check("22", "AC-4 held message → no push", "0 new pushes; held tab has exactly that one", `${pushes().slice(pp).length} pushes · held=${heldU1.length} · ${JSON.stringify(heldU1[0]).slice(0, 160)}`, pushes().slice(pp).length === 0 && heldU1.length === 1 && JSON.stringify(heldU1[0]).includes("HOLD"));
  await post([dm(L9, "999999")]);
  check("31", "AC-7 a held message and a link-code reply do not count", `${k0}`, await count(), (await count()) === k0);
  pp = pushes().length;
  await post([gmsg(G1, M, "@U1 [L2DOWN] ด่วน", tagOf(L1))]); await waitDone(30000);
  const pDown = String(pushes().slice(pp).find((p: any) => p.body?.to === L1)?.body?.messages?.[0]?.text ?? "");
  check("21", "AC-4 AI down (D3) still pushed, marked", "starts 'AI ไม่ได้ตรวจ' (or about line) and pushed", JSON.stringify(pDown), pDown.length > 0);
  await call("POST", `/admin/users/${U3.id}/disable`, OT);
  pp = pushes().length;
  await post([gmsg(G1, M, "@U3 QAB24 ดูหน่อย", tagOf(L3))]); await waitDone();
  check("24", "AC-4 disabled user U3 tagged", "no push to L3", pushes().slice(pp).filter((p: any) => p.body?.to === L3).length, pushes().slice(pp).filter((p: any) => p.body?.to === L3).length === 0);
  pp = pushes().length; const m0 = (await msgsFor(U1.t)).length;
  const dup = gmsg(G1, M, "@U1 QAB25 ส่งซ้ำ", tagOf(L1));
  await post([dup]); await waitDone(); await post([dup]); await waitDone();
  check("25", "AC-4 the same event delivered twice", "1 message, 1 push", `${(await msgsFor(U1.t)).length - m0} msg · ${pushes().slice(pp).filter((p: any) => p.body?.to === L1).length} push`, (await msgsFor(U1.t)).length - m0 === 1 && pushes().slice(pp).filter((p: any) => p.body?.to === L1).length === 1);

  // ---------- AC-6 signature
  for (const [cn, what, opts] of [["27", "wrong signature", { sig: sign("x", "wrong-secret") }], ["28", "no signature header", { sig: null }], ["29", "body changed after signing", { tamper: true }]] as const) {
    const before = await rows();
    const st = await post([gmsg(G1, M, "@U1 QAB-SIG ลอง", tagOf(L1))], opts as any); await waitDone(2000);
    check(cn, `AC-6 ${what}`, "401, no row change", `${st} · ${JSON.stringify(diff(before, await rows()))}`, st === 401 && diff(before, await rows()).length === 0);
  }

  // ---------- names edit + un-link
  await call("PUT", "/channels/line/names", U1.t, { names: ["Ton"] });
  const names = (await call("GET", "/channels/line/names", U1.t)).json?.names;
  n0 = (await msgsFor(U1.t)).length;
  await post([gmsg(G1, M, "ต้น QAB34 อยู่ไหม")]); await waitDone();
  check("34", "req 5 removed nickname no longer takes in", `names ["Ton"] · +0`, `${JSON.stringify(names)} · +${(await msgsFor(U1.t)).length - n0}`, JSON.stringify(names) === '["Ton"]' && (await msgsFor(U1.t)).length - n0 === 0);
  const delSt = (await call("DELETE", "/channels/line", U2.t)).status;
  const n2b = (await msgsFor(U2.t)).length;
  await post([gmsg(G1, M, "@U2 QAB1d หลังเลิกเชื่อม", tagOf(L2))]); await waitDone();
  const u2names = (await call("GET", "/channels/line/names", U2.t)).json?.names;
  check("1d", "un-link U2", "204 · not linked · groups [] · names kept · tag not taken in",
    `${delSt} · ${(await linked(U2))?.linked} · ${(await groups(U2)).length} · ${JSON.stringify(u2names)} · +${(await msgsFor(U2.t)).length - n2b}`,
    delSt === 204 && (await linked(U2))?.linked === false && (await groups(U2)).length === 0 && JSON.stringify(u2names) === '["บี"]' && (await msgsFor(U2.t)).length - n2b === 0);

  // ---------- AC-3 logs (after everything)
  await Bun.sleep(500);
  const log = readFileSync(logPath, "utf8");
  const logHits = [...markers, "ช่วยดูเอกสารนี้หน่อย", "ต้นไม้ล้ม"].filter((m) => log.includes(m));
  check("19", "AC-3 message text in back-end stdout/stderr", "0 hits (dropped and taken-in text)", logHits, logHits.length === 0);

  const fail = checks.filter((x) => !x.pass).length;
  writeFileSync(`${HERE}/test-004-result.json`, JSON.stringify({ ranAt: new Date().toISOString(), pass: checks.length - fail, fail, checks }, null, 2));
  console.log(`\n${checks.length - fail}/${checks.length} PASS`);
} finally {
  await stopAll();
}
process.exit(0);
