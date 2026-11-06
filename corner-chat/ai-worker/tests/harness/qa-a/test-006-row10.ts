// TEST-006 row 10 — mail intake on SIT, READ-ONLY. The owner sends one mail from his personal box (B) to his work box
// (entronica); the work box forwards to his Gmail, which SIT's poller reads for user `dong` (his account: never written).
//   cd <corner-chat-back> && bun <this> <code> [minutes]
// Watches corner_chat (the shared DB, SIT row: "read anything") for a message whose subject contains <code>, then prints:
// arrival vs the Date header, whether the sender is B (compared in-process; no address printed), recipient kind, the
// decision (who decided, outcome, about line). Nothing is written anywhere. Throwaway harness.
import { SQL } from "bun";

const [code, minutesArg] = process.argv.slice(2);
if (!code || !/^[a-z0-9]{3,12}$/i.test(code)) { console.error("usage: bun test-006-row10.ts <code> [minutes]"); process.exit(2); }
const B = process.env.TEST_MAIL_B_EMAIL?.trim().toLowerCase(), A = process.env.TEST_MAIL_A_EMAIL?.trim().toLowerCase();
if (!B || !A) throw new Error("TEST_MAIL_B_EMAIL / TEST_MAIL_A_EMAIL missing in the back repo's .env");
// One short-lived connection per poll: the remote DB closed a long-lived one mid-watch (run r10t, 2026-11-03).
let db = new SQL(process.env.DATABASE_URL!);
const fresh = async () => { try { await db.close(); } catch {} db = new SQL(process.env.DATABASE_URL!); };
const until = Date.now() + Number(minutesArg ?? 30) * 60000;
console.log(`watching for subject containing "${code}" until ${new Date(until).toISOString()}`);
let row: any = null;
while (!row && Date.now() < until) {
  [row] = (await db`select m.id, m.subject, m.text, m.sender_key, m.sender_name, m.recipient_kind, m.received_at, m.stored_at,
                       m.filter_state, m.outcome, m.notified_at, u.email as user_email,
                       d.decided_by, d.score, d.bar, d.summary, d.reason, d.layer1_model, d.layer2_model
                    from messages m join users u on u.id = m.user_id left join decisions d on d.message_id = m.id
                    where m.channel = 'mail' and m.subject like ${"%" + code + "%"} limit 1`) as any[];
  if (!row) { await Bun.sleep(5000); await fresh(); }
}
if (!row) { console.log("NOT ARRIVED within the window"); await db.close(); process.exit(0); }
for (let i = 0; i < 24 && row.filter_state !== "done"; i++) {
  await Bun.sleep(5000);
  [row] = (await db`select m.*, d.decided_by, d.score, d.bar, d.summary, d.reason, d.layer1_model, d.layer2_model, u.email as user_email
                    from messages m join users u on u.id = m.user_id left join decisions d on d.message_id = m.id where m.id = ${row.id}`) as any[];
}
const key = String(row.sender_key).toLowerCase();
const out = {
  user: String(row.user_email).replace(/^(.).*?@/, "$1…@"),
  subject: row.subject,
  textStart: String(row.text).slice(0, 80),
  storedAfterDateHeader_s: Math.round((new Date(row.stored_at).getTime() - new Date(row.received_at).getTime()) / 1000),
  senderIsPersonalB: key === B,
  senderIsWorkA: key === A,
  senderIsAGmail: /@gmail\.com$/.test(key),
  senderNamePresent: !!row.sender_name && row.sender_name !== key,
  recipientKind: row.recipient_kind,
  filterState: row.filter_state, outcome: row.outcome, decidedBy: row.decided_by, score: row.score, bar: row.bar,
  models: `${row.layer1_model} / ${row.layer2_model}`, summary: row.summary, notified: !!row.notified_at,
  replacementChars: /�/.test(row.subject + row.text),
};
console.log(JSON.stringify(out, null, 2));
await Bun.write(`${import.meta.dir}/test-006-row10-${code}.json`, JSON.stringify({ at: new Date().toISOString(), code, ...out }, null, 2));
await db.close();
