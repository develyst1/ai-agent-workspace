// TEST-110 joint run (REQ-105): QA's network between CAW and the REAL blueprint-back. Not a stand-in: every byte comes from blueprint-back.
//  - :<proxyPort>  → blueprint-back. QA can take it down (connection refused) and up again — Blueprint "unreachable" from CAW for AC-5,
//                    without stopping blueprint-back (it runs on pglite:memory locally, SYSTEM-FACTS: a restart would lose the projects).
//  - :<relayPort>/notify → CAW's /v1/notify. Blueprint's CAW_NOTIFY_URL points here; QA switches the push on/off (AC-1 poll-only vs push).
//  - nameless on: every JSON answer's `latestLabel.label` is rewritten to null — the shape SPEC-106 allows (`string | null`) and only
//    pre-REQ-103 data carries; Blueprint can no longer make it (labels need 1–80 chars). A QA rewrite, named as such (REQ-105 Q6).
//  - :<ctlPort>/qa/{down,up,push-on,push-off,nameless-on,nameless-off}
// usage: bun qa-net.mjs <proxyPort> <blueprintUrl> <relayPort> <cawNotifyUrl> <ctlPort> <log>
import fs from 'node:fs';
const [proxyPort, BP, relayPort, CAW, ctlPort, LOG] = process.argv.slice(2);
const log = (s) => fs.appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`);
let proxy = null, push = false, nameless = false;
const strip = (o) => { if (o && typeof o === 'object') { for (const [k, v] of Object.entries(o)) { if (k === 'latestLabel' && v && typeof v === 'object') v.label = null; else strip(v); } } return o; };
const up = () => { proxy = Bun.serve({ hostname: '127.0.0.1', port: Number(proxyPort), async fetch(req) {
  const u = new URL(req.url); log(`bp ${req.method} ${u.pathname}${u.search}`);
  const r = await fetch(BP + u.pathname + u.search, { method: req.method, headers: req.headers, body: req.method === 'GET' ? undefined : await req.arrayBuffer() });
  const ct = r.headers.get('content-type') ?? 'application/json';
  if (nameless && ct.includes('json')) { const j = strip(await r.json()); log(`bp nameless-rewrite ${u.pathname}`); return new Response(JSON.stringify(j), { status: r.status, headers: { 'content-type': ct } }); }
  return new Response(await r.arrayBuffer(), { status: r.status, headers: { 'content-type': ct } });
} }); };
up();
Bun.serve({ hostname: '127.0.0.1', port: Number(relayPort), async fetch(req) {
  const body = await req.text(); log(`push ${push ? 'RELAYED' : 'DROPPED'} ${body.slice(0, 160)}`);
  if (!push) return new Response('{}', { status: 202 });
  const r = await fetch(CAW, { method: 'POST', headers: { 'content-type': 'application/json' }, body }); return new Response(await r.text(), { status: r.status });
} });
Bun.serve({ hostname: '127.0.0.1', port: Number(ctlPort), fetch(req) {
  const p = new URL(req.url).pathname; log(`ctl ${p}`);
  if (p === '/qa/down' && proxy) { proxy.stop(true); proxy = null; }
  if (p === '/qa/up' && !proxy) up();
  if (p === '/qa/push-on') push = true;
  if (p === '/qa/push-off') push = false;
  if (p === '/qa/nameless-on') nameless = true;
  if (p === '/qa/nameless-off') nameless = false;
  return Response.json({ up: !!proxy, push, nameless });
} });
console.log(`qa-net: proxy :${proxyPort} → ${BP} · relay :${relayPort} → ${CAW} · ctl :${ctlPort}`);
