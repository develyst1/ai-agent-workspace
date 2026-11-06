// TEST-001 #19 (REQ-001 req 6): a message is stored before anything else. Phase "a" with FILTER_PAUSED=true, phase "b" after
// the restart with the filter running. Throwaway harness.
import { call, login, ingest, lineMsg, qadb, secrets, waitDecided } from "./qadb";
const phase = process.argv[2];
if (phase === "a") {
  const OT = (await login(secrets.ownerEmail, secrets.ownerPassword)).json.token;
  const email = `p19-${Date.now().toString(36)}@qa-a.test`;
  const U = (await call("POST", "/admin/users", OT, { name: "ผู้ใช้ #19", email, password: "pw-case19-xyz" })).json.user;
  const r: any = ingest(lineMsg(U.id, "เก็บก่อนกรอง [S71]"));
  await Bun.sleep(3000);
  const [m] = await qadb`select filter_state, outcome, stored_at from messages where id = ${r.messageId}`;
  const [{ n }] = await qadb`select count(*)::int as n from decisions where message_id = ${r.messageId}`;
  const T = (await login(email, "pw-case19-xyz")).json.token;
  const api = await call("GET", `/messages/${r.messageId}`, T);
  console.log(JSON.stringify({ messageId: r.messageId, state: m?.filter_state, outcome: m?.outcome, stored: !!m?.stored_at, decisions: n, apiWhilePending: api.status }));
  await Bun.write(`${import.meta.dir}/case19.json`, JSON.stringify({ messageId: r.messageId, email }));
} else {
  const { messageId } = JSON.parse(await Bun.file(`${import.meta.dir}/case19.json`).text());
  const d = await waitDecided(messageId, 30000);
  const [{ n }] = await qadb`select count(*)::int as n from decisions where message_id = ${messageId}`;
  const [{ c }] = await qadb`select count(*)::int as c from ai_calls where message_id = ${messageId}`;
  console.log(JSON.stringify({ messageId, state: d?.filter_state, outcome: d?.outcome, decisions: n, aiCalls: c }));
}
await qadb.close();
