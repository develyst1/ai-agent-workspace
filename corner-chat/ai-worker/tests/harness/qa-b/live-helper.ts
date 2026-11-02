// QA Team B (Tefany) — helper for the real-LINE live sitting (live-stack.ts must be running). Throwaway harness.
//   bun live-helper.ts setup "<nickname>"   create U1 (corner-chat test user for the owner), bar 70, names [nickname]
//   bun live-helper.ts code                  a fresh 6-digit link code for U1 (prints the code and its expiry only)
//   bun live-helper.ts status                linked?, groups, messages per tab with recipientKind, push count, row counts
//   bun live-helper.ts rows > file           every table's row count (AC-3 before/after)
// Prints our own ids, counts, kinds and the about line only — never a LINE user id, a token or the full message text.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { SQL } from "bun";

const API = "http://127.0.0.1:8192/api/v1";
const SECRETS = "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json";
const U1FILE = "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-live-u1.json";
const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));
const call = async (m: string, p: string, t?: string, b?: unknown) => {
  const r = await fetch(`${API}${p}`, { method: m, headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(b ? { "Content-Type": "application/json" } : {}) }, body: b ? JSON.stringify(b) : undefined });
  const x = await r.text(); try { return { s: r.status, j: JSON.parse(x) }; } catch { return { s: r.status, j: x }; }
};
const owner = async () => (await call("POST", "/auth/login", undefined, { email: secrets.ownerEmail, password: secrets.ownerPassword })).j.token as string;
const u1 = async () => { const u = JSON.parse(readFileSync(U1FILE, "utf8")); return (await call("POST", "/auth/login", undefined, { email: u.email, password: u.password })).j.token as string; };
const [cmd, arg] = process.argv.slice(2);

if (cmd === "setup") {
  const email = "u1-live@qa-b.test", password = `pw-live-${crypto.randomUUID().slice(0, 12)}`;
  const OT = await owner();
  const r = await call("POST", "/admin/users", OT, { name: "เจ้าของ (ทดสอบ LINE จริง)", email, password });
  if (r.s !== 201) throw new Error(`create U1 failed: ${r.s}`);
  writeFileSync(U1FILE, JSON.stringify({ email, password }));
  const T = await u1();
  await call("PUT", "/conditions/settings", T, { bar: 70, sentences: "แจ้งเรื่องงาน" });
  const n = await call("PUT", "/channels/line/names", T, { names: [arg ?? "ทดสอบคอร์เนอร์"] });
  console.log(`U1 created (${email}), names ${JSON.stringify(n.j?.names)}`);
} else if (cmd === "code") {
  const c = (await call("POST", "/channels/line/link-code", await u1())).j;
  console.log(`code ${c.code} · expires ${new Date(c.expiresAt).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" })} (Bangkok)`);
} else if (cmd === "status") {
  const T = await u1(), OT = await owner();
  const ch = (await call("GET", "/channels", T)).j?.line;
  const groups = (await call("GET", "/channels/line/groups", T)).j?.groups ?? [];
  const tab = async (t: string) => ((await call("GET", `/messages?tab=${t}&limit=50`, T)).j?.items ?? []).map((m: any) => `${m.recipientKind ?? "?"}:${String(m.aboutLine ?? "").slice(0, 30)}`);
  console.log(JSON.stringify({ linked: ch?.linked, hasDisplayName: !!ch?.displayName, groups: groups.map((g: any) => g.name), notified: await tab("notified"), held: await tab("held"), pushCount: (await call("GET", "/admin/stats/line-pushes", OT)).j?.count }, null, 1));
} else if (cmd === "rows") {
  const env = readFileSync("H:/corner-chat/corner-chat-back/.env", "utf8").match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)![1]!.replace(/^["']|["']$/g, "");
  const u = new URL(env); u.pathname = "/corner_chat_test_qa_b";
  const s = new SQL(u.toString());
  const t = await s`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`;
  const out: Record<string, number> = {};
  for (const { table_name } of t) out[table_name] = (await s.unsafe(`select count(*)::int n from "${table_name}"`))[0].n;
  const [{ ai }] = await s`select count(*)::int ai from ai_calls`;
  console.log(JSON.stringify({ ...out, _ai_calls: ai }));
  await s.close();
} else {
  console.error("usage: bun live-helper.ts setup <nickname> | code | status | rows");
  process.exit(2);
}
