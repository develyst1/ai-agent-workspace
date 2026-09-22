// Harness (Tanya, 2026-09-21): READ-ONLY — every idea on the working (SIT) DB with its owner, scores, tier, and the
// idea_steps saved for it (order, key, provider/model, output keys) — REQ-003 AC-2/AC-10/AC-11 evidence.
// Run from possibility-back: bun --env-file=.env run <abs path to this file>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const ideas = await sql`select i.id, u.email, i.lang, i.feasibility f, i.impact im, i.interestingness n, i.idea_tier, left(i.reason,60) reason, i.created_at, length(i.text) len
  from ideas i join users u on u.id=i.user_id order by i.created_at`;
console.log(`ideas count: ${ideas.length}`);
for (const i of ideas) {
  const lowest = Math.min(i.f, i.im, i.n);
  console.log(`\n${i.created_at.toISOString()} ${i.email} lang=${i.lang} len=${i.len} scores=${i.f}/${i.im}/${i.n} lowest=${lowest} tier=${i.idea_tier} id=${i.id}\n  reason: ${i.reason}…`);
  const steps = await sql`select step_order, step, provider, model, max_tokens, temperature, prompt_version, output, latency_ms from idea_steps where idea_id=${i.id} order by step_order`;
  for (const s of steps) console.log(`  ${s.step_order} ${String(s.step).padEnd(13)} ${s.provider}/${s.model} max=${s.max_tokens} temp=${s.temperature} v=${s.prompt_version} ${s.latency_ms}ms keys=${Object.keys(s.output).join(",")}`);
}
await sql.end();
