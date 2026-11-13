// TASK-011: run the REAL back (its own createApp, schema and migrations) on in-memory PGlite, with synthetic people.
// usage: bun tests/harness/back-pglite/serve.ts <path-to-god-plan-back>      (from god-plan/ai-worker)
// Test harness only. It never touches a real database; every restart gives fresh seed data.
import { resolve } from "node:path";

const SEED_PASSWORDS = ["GP_SEED_OWNER_PASSWORD", "GP_SEED_A_PASSWORD", "GP_SEED_B_PASSWORD"] as const;

// Fail fast, naming the key and never printing a value.
const repoArg = process.argv[2];
if (!repoArg) {
  console.error("usage: bun serve.ts <path-to-god-plan-back>");
  process.exit(2);
}
for (const key of SEED_PASSWORDS) {
  const v = process.env[key];
  if (!v) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  if (v.length < 8) {
    console.error(`Invalid environment variable: ${key} (at least 8 characters)`);
    process.exit(1);
  }
}
const ttl = Number(process.env.INVITE_TTL_SECONDS?.trim() || "604800");
if (!Number.isInteger(ttl) || ttl < 1) {
  console.error("Invalid environment variable: INVITE_TTL_SECONDS");
  process.exit(1);
}

// The AI gateway. DEFAULT: the local stand-in. The live gateway only when BOTH vars are set (D11: 4 calls, run by QA).
// One without the other is an error, never a silent fallback. Nothing else is ever printed from these vars.
const STAND_IN = "http://127.0.0.1:4399";
const liveUrl = process.env.GP_LIVE_GATEWAY_URL?.trim();
const liveConfirm = process.env.GP_LIVE_GATEWAY_CONFIRM?.trim();
if (liveUrl && liveConfirm !== "D11-4-calls") {
  console.error("Missing or wrong environment variable: GP_LIVE_GATEWAY_CONFIRM (needed together with GP_LIVE_GATEWAY_URL)");
  process.exit(1);
}
if (liveConfirm && !liveUrl) {
  console.error("Missing required environment variable: GP_LIVE_GATEWAY_URL (needed together with GP_LIVE_GATEWAY_CONFIRM)");
  process.exit(1);
}
if (liveUrl && !/^https?:\/\/[^\s/]+/.test(liveUrl)) {
  console.error("Invalid environment variable: GP_LIVE_GATEWAY_URL (an http(s) URL is expected)");
  process.exit(1);
}
const isLive = Boolean(liveUrl);

const repo = resolve(repoArg);
process.chdir(repo); // the repo's test helper applies ./drizzle relative to the working directory
const { createApp } = await import(`${repo}/src/app`);
const { loadConfig } = await import(`${repo}/src/config/env`);
const { makeTestDb } = await import(`${repo}/test/setup`);
const { setOwner } = await import(`${repo}/scripts/owner-set`);
const { users, projects, tasks, comments, projectMembers } = await import(`${repo}/src/db/schema`);

const { db } = await makeTestDb();

// People (all synthetic; emails are listed in the README).
const OWNER_EMAIL = "owner@godplan.test";
await setOwner(db, { email: OWNER_EMAIL, displayName: "เจ้าของทดสอบ", password: process.env.GP_SEED_OWNER_PASSWORD! });
const [owner] = await db.select({ id: users.id }).from(users);
const mkUser = async (email: string, displayName: string, password: string) =>
  (await db.insert(users).values({ email, displayName, passwordHash: await Bun.password.hash(password) }).returning({ id: users.id }))[0]!.id;
const aId = await mkUser("invitee-a@godplan.test", "สมศรี ทดสอบ", process.env.GP_SEED_A_PASSWORD!);
await mkUser("invitee-b@godplan.test", "สมชาย ทดสอบ", process.env.GP_SEED_B_PASSWORD!);

// P1: 6 tasks, all four statuses (2 stuck, each with a reason), A is a member. P2: 2 tasks, nobody else.
const t0 = Date.now() - 60_000; // spread created_at so the order is stable
const seedTasks = async (projectId: string, rows: { title: string; status: string; reason?: string }[]) =>
  db
    .insert(tasks)
    .values(rows.map((r, i) => ({ projectId, title: r.title, status: r.status, stuckReason: r.reason ?? null, createdAt: new Date(t0 + i * 1000) })))
    .returning({ id: tasks.id, title: tasks.title });

const [p1] = await db.insert(projects).values({ name: "ย้ายบ้านใหม่", description: "โปรเจกต์ตัวอย่างสำหรับทดสอบ" }).returning({ id: projects.id });
const p1Tasks = await seedTasks(p1!.id, [
  { title: "จองรถขนของ", status: "todo" },
  { title: "แพ็คของห้องนอน", status: "doing" },
  { title: "แพ็คของห้องครัว", status: "doing" },
  { title: "ย้ายอินเทอร์เน็ต", status: "stuck", reason: "รอช่างนัดวัน" },
  { title: "โอนทะเบียนบ้าน", status: "stuck", reason: "รอเอกสารจากเจ้าของเดิม" },
  { title: "ทำความสะอาดบ้านเก่า", status: "done" },
]);
await db.insert(projectMembers).values({ projectId: p1!.id, userId: aId });
const [p2] = await db.insert(projects).values({ name: "งานสวนหลังบ้าน", description: "" }).returning({ id: projects.id });
await seedTasks(p2!.id, [
  { title: "ซื้อต้นไม้", status: "todo" },
  { title: "ขุดแปลงผัก", status: "doing" },
]);
await db.insert(comments).values([
  { taskId: p1Tasks[3]!.id, authorId: aId, body: "ช่างบอกว่าสัปดาห์หน้ามาได้ครับ" },
  { taskId: p1Tasks[3]!.id, authorId: owner!.id, body: "ขอบคุณ เดี๋ยวโทรยืนยันอีกที" },
  { taskId: p1Tasks[1]!.id, authorId: aId, body: "แพ็คไปแล้วครึ่งห้อง" },
]);

// The back's own Config, with its defaults for everything not named here (the same values as before the TASK-016 refactor).
const config = loadConfig({
  FRONT_ORIGIN: "http://127.0.0.1:4300",
  COOKIE_SECURE: "false",
  INVITE_TTL_SECONDS: String(ttl),
  LLM_GATEWAY_URL: isLive ? liveUrl! : STAND_IN, // the stand-in unless the D11 switch above is on
});
const app = createApp({ db, config });
Bun.serve({ port: 4310, hostname: "127.0.0.1", idleTimeout: config.idleTimeoutS, fetch: app.fetch });
console.log(`back-pglite listening on 127.0.0.1:4310 (seeded: owner, A, B, P1, P2)${isLive ? " — LIVE GATEWAY (D11)" : ""}`);
