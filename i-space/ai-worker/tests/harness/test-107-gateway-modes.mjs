// TEST-107: a local stand-in LLM gateway whose behaviour is read from a mode file on EVERY request — never the real gateway.
// usage: bun tests/harness/test-107-gateway-modes.mjs <port> <log file> <mode file>
//   feature — a protocol-correct interview reply proposing part kind `feature` (as blueprint-back's own honest.test.ts does)
//   good    — a protocol-correct reply adding one `work` part (an applied round)
//   sleep   — answers only after 100 s (past the client's fixed 90 s timeout)
//   models  — GET /models always answers a small list
// The quoted words are the user message QA sends: "ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย".
import fs from 'node:fs';
const [port, log, modeFile] = process.argv.slice(2);
const QUOTE = 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const reply = (changes, text) => JSON.stringify({ reply: text, changes, questions: [], contradictions: [] });
const answer = (content) => json({ success: true, data: { provider: 'fake', model: 'qa-stub', content, usage: {}, latency_ms: 1 } });
Bun.serve({ hostname: '127.0.0.1', port: Number(port), idleTimeout: 255, async fetch(req) {
  const p = new URL(req.url).pathname;
  const mode = (() => { try { return fs.readFileSync(modeFile, 'utf8').trim(); } catch { return 'feature'; } })();
  fs.appendFileSync(log, `${new Date().toISOString()} ${mode} ${req.method} ${p}\n`);
  if (p.startsWith('/models')) return json({ fake: ['qa-stub'] });
  if (mode === 'sleep') { await new Promise((r) => setTimeout(r, 100_000)); return answer(reply([], 'ช้าเกินไป')); }
  if (mode === 'partial') {
    const c = (ref, kind, title, body = {}) => ({ change: { op: 'part.add', ref, kind, title, body }, saidBy: 'user', quote: QUOTE, sure: true });
    return answer(reply([c('$w', 'work', 'งานทดสอบ AC-6'), c('$r', 'role', 'ผู้ใช้ทดสอบ'), c('$s', 'screen', 'หน้าทดสอบ AC-6'), c('$y', 'system', 'ระบบทดสอบ'), c('$f', 'feature', 'ฟีเจอร์ที่ไม่มีจริง')], 'บันทึกให้แล้วครับ'));
  }
  if (mode === 'good') return answer(reply([{ change: { op: 'part.add', ref: '$w', kind: 'work', title: 'งานทดสอบ TEST-107', body: {} }, saidBy: 'user', quote: QUOTE, sure: true }], 'เพิ่มงานให้แล้วครับ'));
  return answer(reply([{ change: { op: 'part.add', ref: '$x', kind: 'feature', title: 'ฟีเจอร์ใหม่', body: {} }, saidBy: 'user', quote: QUOTE, sure: true }], 'บันทึกให้แล้วครับ'));
} });
console.log(`gateway modes stub on 127.0.0.1:${port}`);
