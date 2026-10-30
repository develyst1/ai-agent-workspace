// TEST-107 AC-1: a counting proxy in front of the REAL LLM gateway (owner's yes, 2026-10-29, AT MOST 8 calls).
// Every request — chat or model list — counts. Request 9 and later are refused locally (503) and never leave this machine.
// Logs: time, n, method, path, upstream status, duration. Never logs bodies or headers (no key travels through here anyway).
// usage: bun tests/harness/test-107-gateway-cap-proxy.mjs <port> <log file> [cap=8]
import fs from 'node:fs';
const [port, log, capArg = '8'] = process.argv.slice(2);
const CAP = Number(capArg), UP = 'https://ai.develyst.online';
let n = 0;
Bun.serve({ hostname: '127.0.0.1', port: Number(port), idleTimeout: 255, async fetch(req) {
  const u = new URL(req.url);
  if (n >= CAP) {
    fs.appendFileSync(log, `${new Date().toISOString()} REFUSED (cap ${CAP} reached) ${req.method} ${u.pathname}\n`);
    return new Response(JSON.stringify({ error: `TEST-107 cap of ${CAP} live calls reached` }), { status: 503, headers: { 'content-type': 'application/json' } });
  }
  n += 1; const k = n, t0 = Date.now();
  try {
    const res = await fetch(UP + u.pathname + u.search, { method: req.method, headers: { 'content-type': req.headers.get('content-type') ?? 'application/json' }, body: req.method === 'GET' ? undefined : await req.text() });
    const body = await res.arrayBuffer();
    fs.appendFileSync(log, `${new Date().toISOString()} #${k} ${req.method} ${u.pathname} → ${res.status} in ${Date.now() - t0} ms\n`);
    return new Response(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' } });
  } catch (e) {
    fs.appendFileSync(log, `${new Date().toISOString()} #${k} ${req.method} ${u.pathname} → network error after ${Date.now() - t0} ms\n`);
    return new Response(JSON.stringify({ error: 'upstream network error' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
} });
console.log(`cap proxy (${CAP}) on 127.0.0.1:${port} → ${UP}`);
