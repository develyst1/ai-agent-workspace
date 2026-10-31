// TEST-106: follow the real-CLI run — log every hop (start/end, worker, outcome, tokens, note) and the run state; exit when the run ends or after 25 min.
import fs from 'node:fs';
const P = '458a8293-6e60-4e88-9991-d9e90a857b43', API = 'http://127.0.0.1:4500', H = { 'X-CAW-Actor': 'operator' };
const names = Object.fromEntries(((await (await fetch(`${API}/v1/workers`, { headers: H })).json()).workers).map((w) => [w.id, w.name]));
const seen = new Map(); const t0 = Date.now();
const log = (s) => { const l = `${new Date().toTimeString().slice(0, 8)} ${s}`; console.log(l); fs.appendFileSync('run-watch.log', l + '\n'); };
while (Date.now() - t0 < 25 * 60 * 1000) {
  let hops, runs, cards;
  try {
    hops = (await (await fetch(`${API}/v1/projects/${P}/hops`, { headers: H })).json()).hops;
    runs = (await (await fetch(`${API}/v1/projects/${P}/runs`, { headers: H })).json()).runs;
    cards = (await (await fetch(`${API}/v1/projects/${P}/cards`, { headers: H })).json()); cards = cards.cards ?? cards;
  } catch (e) { log(`api error ${e.message}`); await new Promise((r) => setTimeout(r, 10000)); continue; }
  for (const h of hops) {
    const key = `${h.id}:${h.endedAt ? 'end' : 'run'}`;
    if (seen.has(key)) continue; seen.set(key, 1);
    log(`hop ${h.id} ${names[h.workerId] ?? h.workerId} card ${h.cardId ?? 'chat'} ${h.endedAt ? `ENDED ${h.outcome} in/out ${h.tokensIn}/${h.tokensOut} note ${JSON.stringify(h.note).slice(0, 160)}` : `STARTED ${h.startedAt}`}`);
  }
  const run = runs?.[0];
  const st = `cards ${cards.map((c) => `#${c.number}:${c.status}`).join(' ')} · run ${run?.id?.slice(-6)} ${run?.endedAt ? `ENDED ${run.reason ?? run.endReason ?? ''}` : 'open'}`;
  if (!seen.has(st)) { seen.set(st, 1); log(st); }
  if (run?.endedAt) { log('run ended — watcher exits'); break; }
  await new Promise((r) => setTimeout(r, 5000));
}
