// TASK-104 DB checks 2 and 4. Run with cwd = call-scribe-back:  bun <this file> [token]
// Lists columns of recordings and sessions; with a cookie token argument, checks the
// sessions row holds a hash and not the token. Never prints the URL or the token.
import { SQL } from "bun";

const sql = new SQL(process.env.DATABASE_URL!);
try {
  for (const t of ["recordings", "sessions"]) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t}
      ORDER BY ordinal_position`;
    console.log(`${t}:`);
    for (const c of cols)
      console.log(`  ${c.column_name} ${c.data_type} null=${c.is_nullable} default=${c.column_default ?? "-"}`);
  }
  const token = process.argv[2];
  if (token) {
    const rows = await sql`SELECT * FROM sessions`;
    console.log("sessions rows:", rows.length);
    for (const r of rows) {
      const vals = Object.entries(r).map(([k, v]) => [k, String(v)] as const);
      const holdsToken = vals.some(([, v]) => v === token);
      const hashCol = vals.find(([, v]) => /^[0-9a-f]{64}$/.test(v));
      console.log("  row holds raw token:", holdsToken, "| 64-hex hash column:", hashCol ? hashCol[0] : "none");
    }
  }
} finally {
  await sql.close();
}
