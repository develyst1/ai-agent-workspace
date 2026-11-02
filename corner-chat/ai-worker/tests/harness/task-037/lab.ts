// TASK-037 throwaway lab (Fanta). Run from the corner-chat-back checkout (so Bun reads its .env itself):
//   bun <this file> up | serve | seed <passwordFile> | msg <ext> <notified|held> | count | drop
// The target is ONLY the database corner_chat_test_appb on the server DATABASE_URL names (D43). The URL and every password are
// read in-process and never printed; this file prints database names and counts only.
import { SQL } from "bun";

const TARGET = "corner_chat_test_appb";
const base = process.env.DATABASE_URL?.trim();
if (!base) throw new Error("DATABASE_URL missing");
const target = new URL(base);
target.pathname = `/${TARGET}`;
process.env.DATABASE_URL = target.toString();
process.env.DATABASE_URL_TEST = ""; // never the shared test database

const root = process.cwd();
const { sqlOptions } = await import(`${root}/src/config`);
const mode = process.argv[2];

async function admin() {
  const u = new URL(target.toString());
  u.pathname = "/postgres";
  return new SQL(u.toString(), await sqlOptions(u.toString()));
}

if (mode === "up") {
  const a = await admin();
  const found = await a`select 1 from pg_database where datname = ${TARGET}`;
  if (!found.length) await a.unsafe(`CREATE DATABASE "${TARGET}"`);
  console.log(`${TARGET}: ${found.length ? "already there" : "created"}`);
  await a.close();
  const { db } = await import(`${root}/src/core/db`);
  const { migrate } = await import(`${root}/src/core/migrate`);
  const applied = await migrate(db);
  console.log(`${TARGET}: migrated ${applied.length} file(s)`);
  await db.close();
} else if (mode === "serve") {
  await import(`${root}/src/index`);
} else if (mode === "seed") {
  // The made-up app user, created through the admin API as the owner (the owner row is seeded by the server from .env).
  const pwFile = process.argv[3]!;
  const password = `Aa1-${crypto.randomUUID().slice(0, 12)}`;
  const api = `http://127.0.0.1:${process.env.PORT ?? "8093"}/api/v1`;
  const login = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD }),
  });
  console.log(`owner login: ${login.status}`);
  const token = (await login.json()).token as string;
  const made = await fetch(`${api}/admin/users`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: "ผู้ทดสอบ B", email: "appb@corner.test", password }),
  });
  console.log(`create user: ${made.status}`);
  await Bun.write(pwFile, password);
} else if (mode === "msg") {
  const ext = process.argv[3]!;
  const outcome = process.argv[4]!;
  const { db } = await import(`${root}/src/core/db`);
  const [m] = await db`
    insert into messages
      (user_id, channel, external_id, sender_key, sender_name, group_id, group_name, text, recipient_kind,
       received_at, filter_state, outcome, notified_at)
    select id, 'line', ${ext}, 'U9001', 'คุณทดสอบ', 'G9001', ${"กลุ่มทดสอบ " + ext},
           ${"ข้อความใหม่สำหรับทดสอบการแจ้งเตือน " + ext}, 'to', now(), 'done', ${outcome},
           case when ${outcome} = 'notified' then now() end
    from users where email = 'appb@corner.test'
    returning id`;
  await db`
    insert into decisions (message_id, decided_by, outcome, summary, score, reason, bar, layer1_provider, layer1_model, prompt_version)
    values (${m.id}, 'ai', ${outcome}, ${"ข้อความทดสอบ " + ext}, 88, 'ทดสอบ', 70, 'gateway', 'fast-1', 'p3')`;
  console.log(`message ${ext}: ${outcome} id=${m.id}`);
  await db.close();
} else if (mode === "link") {
  // The made-up user's LINE link, straight into the throwaway database (no webhook, no secret, nothing sent anywhere).
  const { db } = await import(`${root}/src/core/db`);
  await db`insert into line_links (user_id, line_user_id, display_name)
           select id, 'L-appb-1', 'เอ' from users where email = 'appb@corner.test' on conflict do nothing`;
  console.log("line link: inserted");
  await db.close();
} else if (mode === "count") {
  const a = await admin();
  const [r] = await a`select count(*)::int as n from pg_database where datname = ${TARGET}`;
  console.log(`${TARGET} present: ${r.n}`);
  await a.close();
} else if (mode === "drop") {
  const a = await admin();
  await a`select pg_terminate_backend(pid) from pg_stat_activity where datname = ${TARGET} and pid <> pg_backend_pid()`;
  await a.unsafe(`DROP DATABASE IF EXISTS "${TARGET}"`);
  const [r] = await a`select count(*)::int as n from pg_database where datname = ${TARGET}`;
  console.log(`${TARGET} present after drop: ${r.n}`);
  await a.close();
} else {
  throw new Error("mode?");
}
