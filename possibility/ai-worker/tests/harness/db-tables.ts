// Harness (Jason, 2026-09-19): read-only — lists public tables + row counts on the working DB. Run from possibility-back: bun --env-file=.env run <file>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const db = await sql`select current_database() d`;
console.log("database:", db[0]!.d);
const tables = await sql`select table_name from information_schema.tables where table_schema='public' order by 1`;
for (const t of tables) {
  const [{ n }] = await sql.unsafe(`select count(*)::int n from "${t.table_name}"`);
  console.log(`${String(t.table_name).padEnd(24)} rows=${n}`);
}
await sql.end();
