// Harness (Jason, 2026-09-20): read-only select of hire_requests. Run from possibility-back: bun --env-file=.env run <file>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
console.log("hire_requests count:", (await sql`select count(*)::int n from hire_requests`)[0]!.n);
for (const r of await sql`select h.id, h.idea_id, u.email, h.user_tier_at_request, h.discount_percent_at_request, h.contacted_at, u.tier as user_tier_now from hire_requests h join users u on u.id=h.user_id order by h.created_at desc`) console.log("  ", JSON.stringify(r));
await sql.end();
