// Harness (Tanya, 2026-09-23): TEST-006 READ-ONLY — hire_requests rows for the QA hire accounts,
// joined to users (current tier) and ideas (scores, idea tier) for AC-1 field completeness and
// AC-5 snapshot-vs-current comparison. Run from possibility-back: bun --env-file=.env run <abs path>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const rows = await sql`
  select h.id, h.created_at, h.user_tier_at_request, h.discount_percent_at_request, h.contacted_at,
         u.email, u.display_name, u.tier as user_tier_now,
         i.id as idea_id, left(i.text, 60) as idea_preview, i.feasibility, i.impact, i.interestingness, i.idea_tier
  from hire_requests h join users u on u.id = h.user_id join ideas i on i.id = h.idea_id
  where u.email like 'qa-tanya-hire%' order by h.created_at`;
console.log(`hire_requests rows for qa-tanya-hire*: ${rows.length}`);
for (const r of rows) console.log(JSON.stringify(r));
await sql.end();
