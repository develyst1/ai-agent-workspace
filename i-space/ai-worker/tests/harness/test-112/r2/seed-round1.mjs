// TEST-112 joint (copied from TEST-106's step2-changeset.mjs; the same spec, a new project): put the REQ-108 spec into Blueprint through
// POST /v1/projects/{id}/change-sets — no screen offers this. Every part below restates the PM's spec text only.
import fs from 'node:fs';
const API = 'http://127.0.0.1:4202';
const id = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') }, body: JSON.stringify({ name: 'TEST-112 Health Board', theme: 'clean-blue' }) })).json()).id;
fs.writeFileSync('out/bp-round1-project-id.txt', id); console.log('project', id);
const origin = { stamp: 'operator', date: '2026-10-29', note: 'TEST-106 workaround: entered via change-set API (interview stored nothing, P1-1)' };
const part = (ref, kind, title, body = {}) => ({ op: 'part.add', ref, kind, title, body, origin });
const link = (kind, from, to, label) => ({ op: 'link.add', kind, from, to, origin, ...(label ? { label } : {}) });
const SVC = [
  ['$sys1', 'Blueprint API', 'http://127.0.0.1:4200/health'],
  ['$sys2', 'Blueprint เว็บ', 'http://127.0.0.1:3100'],
  ['$sys3', 'CAW API', 'http://127.0.0.1:4500/health'],
  ['$sys4', 'CAW เว็บ', 'http://127.0.0.1:3500'],
];
const changes = [
  part('$work1', 'work', 'I-Space Health Board', { goal: 'หน้าเว็บเดียว ดูว่าบริการของ I-Space ตัวไหนเปิดอยู่' }),
  part('$role1', 'role', 'ผู้ดูแลระบบ', { duty: 'เปิดหน้าดูสถานะบริการของ I-Space' }),
  part('$scr1', 'screen', 'หน้า Health Board', {
    fields: [{ name: 'name', label: 'ชื่อ' }, { name: 'status', label: 'สถานะ' }, { name: 'ms', label: 'เวลาตอบ (ms)' }, { name: 'checkedAt', label: 'เวลาที่เช็คล่าสุด' }],
    actions: [{ name: 'checkNow', label: 'เช็คตอนนี้' }],
    states: [{ name: 'up', note: '"ทำงาน" สีเขียว' }, { name: 'down', note: '"ไม่ตอบ" สีแดง' }],
  }),
  ...SVC.map(([ref, name]) => part(ref, 'system', name)),
  part('$data1', 'data', 'ServiceStatus', { fields: [{ name: 'name' }, { name: 'url' }, { name: 'status', note: 'ทำงาน | ไม่ตอบ' }, { name: 'ms', type: 'number' }, { name: 'checkedAt', type: 'time' }] }),
  part('$step1', 'step', 'เปิดหน้า Health Board', { ends: false }),
  part('$step2', 'step', 'เช็คสถานะทั้ง 4 บริการ', { ends: false }),
  part('$step3', 'step', 'แสดงสถานะ', { ends: true }),
  link('has_step', '$work1', '$step1'), link('has_step', '$work1', '$step2'), link('has_step', '$work1', '$step3'),
  link('next', '$step1', '$step2'), link('next', '$step2', '$step3'),
  part('$int1', 'interaction', 'เปิด http://127.0.0.1:3900', { text: 'เปิด http://127.0.0.1:3900' }),
  link('has_interaction', '$step1', '$int1'), link('from', '$int1', '$role1'), link('to', '$int1', '$scr1'),
  ...SVC.flatMap(([ref, name, url], i) => [
    part(`$int2${i}`, 'interaction', `เช็ค ${name} (${url})`, { text: `เช็ค ${url}` }),
    link('has_interaction', '$step2', `$int2${i}`), link('from', `$int2${i}`, '$scr1'), link('to', `$int2${i}`, ref),
  ]),
  part('$int3', 'interaction', 'แสดงชื่อ · สถานะ · ms · เวลาที่เช็คล่าสุด ของแต่ละบริการ', { text: 'แสดงชื่อ · สถานะ · ms · เวลาที่เช็คล่าสุด' }),
  link('has_interaction', '$step3', '$int3'), link('from', '$int3', '$scr1'), link('to', '$int3', '$role1'),
  link('shows', '$scr1', '$data1'),
  part('$dec1', 'decision', 'แสดง 4 บริการ', { rule: 'แสดง 4 บริการ: ' + SVC.map(([, n, u]) => `${n} (${u})`).join(', ') }),
  part('$dec2', 'decision', 'เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้"', { rule: 'เช็คใหม่เองทุก 10 วินาที และมีปุ่ม "เช็คตอนนี้"' }),
  part('$dec3', 'decision', 'ไม่ตอบภายใน 3 วินาที = "ไม่ตอบ"', { rule: 'ถ้าบริการไม่ตอบภายใน 3 วินาที ให้ถือว่า "ไม่ตอบ"' }),
  part('$dec4', 'decision', 'รันที่ http://127.0.0.1:3900 ไม่ต้อง login ไม่ต้องมีฐานข้อมูล', { rule: 'รันในเครื่องที่ http://127.0.0.1:3900 ไม่ต้อง login ไม่ต้องมีฐานข้อมูล' }),
  part('$dec5', 'decision', 'ข้อความบนหน้าเป็นภาษาไทย', { rule: 'ข้อความบนหน้าเป็นภาษาไทย' }),
  part('$dec6', 'decision', 'ไม่ทำ: login, การแจ้งเตือน, เก็บประวัติ, deploy', { rule: 'ไม่ทำ: login, การแจ้งเตือน, เก็บประวัติ, deploy' }),
  link('covers', '$dec1', '$step2'), link('covers', '$dec2', '$step2'), link('covers', '$dec3', '$step2'),
  link('covers', '$dec4', '$work1'), link('covers', '$dec5', '$scr1'), link('covers', '$dec6', '$work1'),
];
const r = await fetch(`${API}/v1/projects/${id}/change-sets`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') }, body: JSON.stringify({ cause: { kind: 'operator' }, changes }) });
const body = await r.json();
console.log('change-set', r.status, r.ok ? body.changeSetId : JSON.stringify(body).slice(0, 800));
fs.writeFileSync('out/changeset-round1.json', JSON.stringify(body, null, 2));
const stuck = await (await fetch(`${API}/v1/projects/${id}/stuck`)).json();
console.log('stuck', JSON.stringify(stuck).slice(0, 900));
