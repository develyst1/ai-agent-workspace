// REQ-121 AC-3 live — QA as the OWNER at the review step, so the one run can reach cards #2–#8 (REQ-121 § Out of Scope: the owner's review is
// not under test). Every second: a work card in `review` → log its last note (who, first 300 chars) and approve it (PATCH status done, as the
// operator — the board's review action). Ends when the project's latest run has ended. usage (from this folder): bun approver.mjs
import fs from 'node:fs';
const API = 'http://127.0.0.1:4500', H = { 'x-caw-actor': 'operator' };
const pid = fs.readFileSync('out/caw-project-id.txt', 'utf8').trim();
const log = (s) => { const l = `${new Date().toISOString()} ${s}`; console.log(l); fs.appendFileSync('out/live.log', l + '\n'); };
const get = async (p) => (await fetch(API + p, { headers: H })).json();
const names = Object.fromEntries((await get(`/v1/projects/${pid}/chain`)).members.map((m) => [m.id, m.name]));
const done = new Set(); let started = false;
for (;;) {
  const runs = (await get(`/v1/projects/${pid}/runs`)).runs ?? [];
  if (runs.length > 0) started = true;
  for (const c of (await get(`/v1/projects/${pid}/cards`)).cards.filter((c) => c.kind === 'work' && c.status === 'review' && !done.has(c.id))) {
    const ctx = await get(`/v1/cards/${c.id}/context`);
    const last = (ctx.notes ?? []).filter((n) => n.text).pop();
    const r = await fetch(`${API}/v1/cards/${c.id}/status`, { method: 'PATCH', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
    done.add(c.id);
    log(`owner (QA acting): approved #${c.number} ${c.title} → ${r.status} · last note by ${names[last?.workerId] ?? last?.author ?? '?'}: ${JSON.stringify((last?.text ?? '').slice(0, 300))}`);
  }
  if (started && runs[0]?.endedAt) { log(`approver: run ended (${runs[0].stopReason}) — ${done.size} card(s) approved`); break; }
  await new Promise((r) => setTimeout(r, 1000));
}
