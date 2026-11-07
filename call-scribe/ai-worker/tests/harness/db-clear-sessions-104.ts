// Removes the throwaway sessions rows my own login checks created (TASK-104).
// Run with cwd = call-scribe-back. Touches only the sessions table; prints a count.
import { SQL } from "bun";

const sql = new SQL(process.env.DATABASE_URL!);
try {
  const gone = await sql`DELETE FROM sessions RETURNING 1`;
  const left = await sql`SELECT count(*)::int AS n FROM sessions`;
  console.log("deleted:", gone.length, "| left:", left[0].n);
} finally {
  await sql.close();
}
