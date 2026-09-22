// Harness (Tanya, 2026-09-22): forces tiers on MY OWN qa-tanya-pw2/pw3 rows on the SIT DB (REQ-007 AC-2, REQ-001 AC-6 —
// Sober's note: force Seeker / Raw Diamond / The Possibility via fixtures). Writes ONLY rows whose email starts with
// qa-tanya-pw2/pw3. Idempotent: one synthetic idea per user (text prefixed [QA-FIXTURE]), scores chosen so the
// REQ-001 rule yields the wanted tier; users.tier set to the same. Declared in TEST-006 §Test data.
// Usage from possibility-back: bun --env-file=.env run <file> [pw2Tier]   (pw2Tier: Seeker | "Raw Diamond"; default Seeker)
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const pw2Tier = process.argv[2] ?? "Seeker";
const plan = [
  { email: "qa-tanya-pw2@example.com", tier: pw2Tier, scores: pw2Tier === "Seeker" ? [55, 50, 58] : [70, 62, 74] },
  { email: "qa-tanya-pw3@example.com", tier: "The Possibility", scores: [95, 92, 96] },
];
for (const p of plan) {
  const [u] = await sql`select id from users where email = ${p.email}`;
  if (!u) throw new Error("fixture user missing: " + p.email);
  const [f, im, n] = p.scores;
  const text = `[QA-FIXTURE] synthetic idea inserted by QA to force the tier ${p.tier} for display checks — not analysed by the AI.`;
  const existing = await sql`select id from ideas where user_id = ${u.id} and text like '[QA-FIXTURE]%'`;
  if (existing.length) {
    await sql`update ideas set feasibility=${f}, impact=${im}, interestingness=${n}, idea_tier=${p.tier}, text=${text} where id = ${existing[0]!.id}`;
  } else {
    await sql`insert into ideas (user_id, text, lang, feasibility, impact, interestingness, idea_tier, reason)
      values (${u.id}, ${text}, 'en', ${f}, ${im}, ${n}, ${p.tier}, 'QA fixture reason — synthetic row for tier display checks.')`;
  }
  await sql`update users set tier = ${p.tier}, updated_at = now() where id = ${u.id} and email like 'qa-tanya-pw%'`;
  const [row] = await sql`select i.id, i.idea_tier, u.tier from ideas i join users u on u.id = i.user_id where i.user_id = ${u.id} and i.text like '[QA-FIXTURE]%'`;
  console.log(`${p.email}: users.tier=${row!.tier} idea ${row!.id} idea_tier=${row!.idea_tier} scores=${f}/${im}/${n}`);
}
await sql.end();
