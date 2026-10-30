// TEST-101 guard: a local stand-in LLM gateway — never the real one. Logs every request.
// usage: bun tests/harness/test-101-gateway-stub.mjs <port> <log file> [refuse|fake]
//   refuse (default): every request → 503.
//   fake: the same canned answers blueprint-front's own tests/states.spec.ts stand-in gives (models list + one fixed chat reply).
import fs from 'node:fs';
const [port, log, mode = 'refuse'] = process.argv.slice(2);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
Bun.serve({ hostname: '127.0.0.1', port: Number(port), fetch(req) {
  const p = new URL(req.url).pathname;
  fs.appendFileSync(log, `${new Date().toISOString()} ${mode} ${req.method} ${p}\n`);
  if (mode !== 'fake') return json({ error: 'TEST-101 gateway stub: no live LLM call' }, 503);
  if (p.startsWith('/models')) return json({ fake: ['recorded'] });
  const content = JSON.stringify({ answer: 'ยังไม่ได้ระบุในสเปก', parts: [], notInSpec: false });
  return json({ success: true, data: { content, provider: 'fake', model: 'recorded', usage: null } });
} });
console.log(`gateway stub (${mode}) on 127.0.0.1:${port}`);
