// TASK-113 DoD (migration): prove 0010's backfill on a DATABASE THAT ALREADY HOLDS change sets (in-memory pglite only).
//   bun run backfill-check.mjs <blueprint-back repo path>
// Applies migrations up to 0009 as they are, seeds 2 projects with change sets (time-ordered, one tie), then runs 0010.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const repo = process.argv[2];
if (!repo) { console.error("usage: bun run backfill-check.mjs <blueprint-back path>"); process.exit(2); }
const { PGlite } = createRequire(join(repo, "package.json"))("@electric-sql/pglite");
const dir = join(repo, "src/db/migrations");
const journal = JSON.parse(readFileSync(join(dir, "meta/_journal.json"), "utf8"));
const sqlOf = (tag) => readFileSync(join(dir, `${tag}.sql`), "utf8").split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);

const db = new PGlite();
const tags = journal.entries.map((e) => e.tag);
const last = tags.at(-1);
for (const tag of tags.slice(0, -1)) for (const stmt of sqlOf(tag)) await db.exec(stmt);

const p1 = (await db.query("insert into projects (name) values ('A') returning id")).rows[0].id;
const p2 = (await db.query("insert into projects (name) values ('B') returning id")).rows[0].id;
const ins = (p, at, kind) => db.query("insert into change_sets (project_id, at, cause_kind) values ($1, $2, $3)", [p, at, kind]);
await ins(p1, "2026-10-01T10:00:00Z", "operator");
await ins(p1, "2026-10-03T10:00:00Z", "message"); // the later one, inserted second
await ins(p1, "2026-10-02T10:00:00Z", "source");  // inserted last but earlier in time → must get rev 2
await ins(p2, "2026-10-05T10:00:00Z", "operator");
console.log("before 0010: columns has rev =", (await db.query("select column_name from information_schema.columns where table_name='change_sets' and column_name='rev'")).rows.length === 1);

console.log("applying", last);
for (const stmt of sqlOf(last)) await db.exec(stmt);

const rows = (await db.query("select p.name, c.rev, c.cause_kind from change_sets c join projects p on p.id = c.project_id order by p.name, c.rev")).rows;
console.log(JSON.stringify(rows));
const expected = [["A", 1, "operator"], ["A", 2, "source"], ["A", 3, "message"], ["B", 1, "operator"]];
const got = rows.map((r) => [r.name, r.rev, r.cause_kind]);
console.log("backfill by time, per project:", JSON.stringify(got) === JSON.stringify(expected) ? "OK" : "WRONG");
const nn = (await db.query("select is_nullable from information_schema.columns where table_name='change_sets' and column_name='rev'")).rows[0].is_nullable;
console.log("rev is_nullable after:", nn);
try { await db.query("insert into change_sets (project_id, cause_kind, rev) values ($1, 'operator', 1)", [p1]); console.log("duplicate (project, rev): ACCEPTED (bad)"); }
catch (e) { console.log("duplicate (project, rev): refused —", String(e.message).includes("change_sets_project_rev_idx") ? "unique index change_sets_project_rev_idx" : e.message); }
