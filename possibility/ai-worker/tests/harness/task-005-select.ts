// Harness (Jason, 2026-09-19): read-only selects for TASK-005 evidence. Run from possibility-back: bun --env-file=.env run <file> [ideaId]
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const id = process.argv[2];
console.log("ideas count:", (await sql`select count(*)::int n from ideas`)[0]!.n, "| idea_steps count:", (await sql`select count(*)::int n from idea_steps`)[0]!.n, "| users count:", (await sql`select count(*)::int n from users`)[0]!.n);
if (id) {
  for (const r of await sql`select step_order, step, provider, model, max_tokens, temperature, prompt_version, latency_ms, jsonb_typeof(output) t from idea_steps where idea_id=${id} order by step_order`)
    console.log(`  ${r.step_order} ${String(r.step).padEnd(12)} ${r.provider}/${r.model} max=${r.max_tokens} temp=${r.temperature} v=${r.prompt_version} ${r.latency_ms}ms output:${r.t}`);
  for (const r of await sql`select feasibility, impact, interestingness, idea_tier, lang from ideas where id=${id}`) console.log("  idea:", JSON.stringify(r));
}
for (const u of await sql`select email, tier from users order by email`) console.log("  user:", u.email, u.tier);
await sql.end();
