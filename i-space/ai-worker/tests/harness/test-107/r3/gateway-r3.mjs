// TEST-107 round 3: a local stand-in LLM gateway, mode read from a file on EVERY request — never the real gateway.
// usage: bun gateway-r3.mjs <port> <log file> <mode file>
//   feature / good / sleep / partial — the same answers as round 2's test-107-gateway-modes.mjs
//   replay     — the SHAPES the real model sent live in round 2 (hyphen refs, system without body, screen lists as strings,
//                decision cases as a string + open as a boolean), written by QA from r2/ac1-bot-row.json (SPEC-105 E8/E9)
//   unreadable — a reply that is not JSON, every time (SPEC-105 E10: reason protocol + roundRaw kept)
import fs from 'node:fs';
const [port, log, modeFile] = process.argv.slice(2);
const QUOTE = 'ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย';
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const reply = (changes, text, questions = []) => JSON.stringify({ reply: text, changes, questions, contradictions: [] });
const answer = (content) => json({ success: true, data: { provider: 'fake', model: 'qa-stub', content, usage: {}, latency_ms: 1 } });
const item = (change) => ({ change, saidBy: 'user', quote: QUOTE, sure: true });
const add = (ref, kind, title, body) => item({ op: 'part.add', ref, kind, title, ...(body === undefined ? {} : { body }) });
const link = (kind, from, to) => item({ op: 'link.add', kind, from, to });
const REPLAY = [
  add('$work', 'work', 'QA Health Board', { goal: 'หน้าเว็บแสดงสถานะบริการ' }),
  add('$role', 'role', 'ผู้ใช้ภายใน QA', { duty: 'เปิดแดชบอร์ด' }),
  add('$monitor', 'system', 'ตัวตรวจสถานะ QA'), // no body
  add('$status-data', 'data', 'สถานะบริการ QA', {}),
  add('$dashboard', 'screen', 'หน้าแดชบอร์ด QA', { fields: 'ชื่อบริการ, สถานะ', actions: 'เช็คตอนนี้', states: 'ปกติ, ล่ม' }),
  add('$availability', 'decision', 'เกณฑ์สถานะ QA', { rule: 'ตอบ 200 ภายใน 3 วิ = ปกติ', cases: '200 = ปกติ', open: true }),
  add('$step-view', 'step', 'ดูสถานะ QA', { ends: false }),
  add('$open-dashboard', 'interaction', 'เปิดแดชบอร์ด QA', { text: 'เปิดแดชบอร์ด' }),
  link('has_step', '$work', '$step-view'), link('has_interaction', '$step-view', '$open-dashboard'),
  link('from', '$open-dashboard', '$role'), link('to', '$open-dashboard', '$dashboard'),
  link('shows', '$dashboard', '$status-data'), link('covers', '$availability', '$monitor'),
];
Bun.serve({ hostname: '127.0.0.1', port: Number(port), idleTimeout: 255, async fetch(req) {
  const p = new URL(req.url).pathname;
  const mode = (() => { try { return fs.readFileSync(modeFile, 'utf8').trim(); } catch { return 'feature'; } })();
  fs.appendFileSync(log, `${new Date().toISOString()} ${mode} ${req.method} ${p}\n`);
  if (p.startsWith('/models')) return json({ fake: ['qa-stub'] });
  if (mode === 'sleep') { await new Promise((r) => setTimeout(r, 100_000)); return answer(reply([], 'ช้าเกินไป')); }
  if (mode === 'unreadable') return answer('QA-UNREADABLE นี่ไม่ใช่ JSON {{{');
  if (mode === 'replay') return answer(reply(REPLAY, 'บันทึกให้แล้วครับ'));
  if (mode === 'partial') {
    const c = (ref, kind, title) => add(ref, kind, title, {});
    return answer(reply([c('$w', 'work', 'งานทดสอบ AC-6'), c('$r', 'role', 'ผู้ใช้ทดสอบ'), c('$s', 'screen', 'หน้าทดสอบ AC-6'), c('$y', 'system', 'ระบบทดสอบ'), c('$f', 'feature', 'ฟีเจอร์ที่ไม่มีจริง')], 'บันทึกให้แล้วครับ'));
  }
  if (mode === 'good') return answer(reply([add('$w', 'work', 'งานทดสอบ TEST-107', {})], 'เพิ่มงานให้แล้วครับ'));
  return answer(reply([add('$x', 'feature', 'ฟีเจอร์ใหม่', {})], 'บันทึกให้แล้วครับ'));
} });
console.log(`gateway r3 stub on 127.0.0.1:${port}`);
