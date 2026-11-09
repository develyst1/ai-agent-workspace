// Read-only first look at the dev database (TASK-104 order, step 4).
// Run with cwd = call-scribe-back so Bun loads its .env:  bun <this file>
// Prints the database name and the user tables only. Never prints the URL.
import { SQL } from "bun";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL: missing");
  process.exit(1);
}
const sql = new SQL(url);
try {
  const db = await sql`SELECT current_database() AS db`;
  console.log("current_database:", db[0].db);
  const t = await sql`
    SELECT table_schema, table_name FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY 1, 2`;
  console.log("tables:", t.length);
  for (const r of t) console.log(`  ${r.table_schema}.${r.table_name}`);
} catch (e) {
  const msg = String((e as Error).message ?? e).split(url).join("<url>");
  console.error("check failed:", msg);
  process.exit(2);
} finally {
  await sql.close();
}
