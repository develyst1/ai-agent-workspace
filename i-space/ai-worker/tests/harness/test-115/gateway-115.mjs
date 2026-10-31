// TEST-115 (REQ-115) — a local stand-in LLM gateway that RECORDS the model every request asks for and answers from a script.
// Never the real gateway. usage: bun gateway-115.mjs <port> <calls log> <script file>
// The script file holds { run, script }: `script` = answer kinds, used one per POST /chat in order; it restarts at 0 whenever the
// file changes (`run` is unique per write, so the same script written twice restarts too). A bare array is read as the script.
// Past its end the last kind repeats. Every /chat writes one JSON line to the log: { at, n, asked, kind }.
//   good       — a round reply that stores one work part
//   refused    — a round reply with one good part and one the server refuses (kind "feature")
//   unreadable — not JSON
//   http500    — HTTP 500 (a transport failure; the client's own R8 retry applies)
//   quiz       — a quiz reply { answer, parts, notInSpec }
import fs from 'node:fs';
const [port, log, scriptFile] = process.argv.slice(2);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const QUOTE = 'ทำหน้า Health Board ให้หน่อย';
const add = (ref, kind, title) => ({ change: { op: 'part.add', ref, kind, title, body: {} }, saidBy: 'user', quote: QUOTE, sure: true });
const round = (changes) => JSON.stringify({ reply: 'บันทึกให้แล้วครับ', changes, questions: [], contradictions: [] });
let seen = null, n = 0;
Bun.serve({ hostname: '127.0.0.1', port: Number(port), async fetch(req) {
  const p = new URL(req.url).pathname;
  if (p.startsWith('/models')) return json({ stub: ['qa-cheap', 'qa-main'] });
  const text = fs.readFileSync(scriptFile, 'utf8');
  if (text !== seen) { seen = text; n = 0; }
  const parsed = JSON.parse(text);
  const script = Array.isArray(parsed) ? parsed : parsed.script;
  const body = await req.json();
  const asked = body.tier ? `tier:${body.tier}` : `${body.provider}/${body.model}`;
  const kind = script[Math.min(n, script.length - 1)];
  fs.appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), n, asked, kind }) + '\n');
  n++;
  const answer = (content) => json({ success: true, data: { provider: body.tier ? 'stub' : body.provider, model: body.tier ? `tier-${body.tier}` : body.model, content, usage: {}, latency_ms: 1 } });
  if (kind === 'http500') return json({ success: false }, 500);
  if (kind === 'unreadable') return answer('QA-UNREADABLE นี่ไม่ใช่ JSON {{{');
  if (kind === 'refused') return answer(round([add('$w', 'work', 'งานทดสอบ TEST-115'), add('$f', 'feature', 'ฟีเจอร์ที่ไม่มีจริง')]));
  if (kind === 'quiz') return answer(JSON.stringify({ answer: 'หน้า Health Board แสดงสถานะบริการ', parts: [], notInSpec: false }));
  return answer(round([add('$w', 'work', 'งานทดสอบ TEST-115')]));
} });
console.log(`gateway-115 stub on 127.0.0.1:${port}`);
