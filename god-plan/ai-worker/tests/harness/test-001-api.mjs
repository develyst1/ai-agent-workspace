// TEST-001 API-level harness (QA, Tanya). Throwaway, workspace only — never a product repo.
// Runs against back-pglite (127.0.0.1:4310) + gateway-stub (127.0.0.1:4399). Synthetic people only.
// Passwords come from the environment (GP_SEED_*_PASSWORD); never printed.
// API level proves the back's behaviour only — not what the painted screen shows (that is the UI round).
// Usage (from god-plan/ai-worker): node tests/harness/test-001-api.mjs <round-label>
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const BACK = 'http://127.0.0.1:4310';
const STUB = 'http://127.0.0.1:4399';
const ORIGIN = 'http://127.0.0.1:4300';
const MODE_FILE = join(HERE, 'gateway-stub', 'mode.txt');
const round = process.argv[2] || 'dry-run';
const OUT = join(HERE, 'out', 'TEST-001', round);
mkdirSync(OUT, { recursive: true });
for (const host of [BACK, STUB]) if (!/^http:\/\/127\.0\.0\.1:/.test(host)) throw new Error('refusing non-local host ' + host);

const pw = (k) => { const v = process.env[k]; if (!v) throw new Error('missing env ' + k); return v; };
const results = [];
const rec = (id, ac, expected, actual, pass) => { results.push({ id, ac, expected, actual, result: pass === null ? 'NOT_TESTED' : pass ? 'PASS' : 'FAIL' }); };

function client() {
  let cookie = '';
  return async function call(method, path, body) {
    const headers = { origin: ORIGIN };
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const t0 = Date.now();
    const r = await fetch(BACK + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.getSetCookie?.() || [];
    for (const c of sc) { const kv = c.split(';')[0]; if (/=\s*$/.test(kv) || /Max-Age=0/i.test(c)) cookie = ''; else cookie = kv; }
    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: r.status, json, text, ms: Date.now() - t0 };
  };
}
const setMode = (m) => writeFileSync(MODE_FILE, m + '\n');
const stubCalls = async () => (await (await fetch(STUB + '/calls')).json());
const clearCalls = () => fetch(STUB + '/calls', { method: 'DELETE' });
// D1 guard: <= 10 AI presses per person per minute. Wait out the window before cases that count calls.
const rateWindow = () => new Promise(r => setTimeout(r, 61000));

const TAG = process.env.QA_TAG || '';
const OWNER = process.env.QA_OWNER_EMAIL || 'owner@godplan.test', A = process.env.QA_A_EMAIL || 'invitee-a@godplan.test', B = process.env.QA_B_EMAIL || 'invitee-b@godplan.test';
async function signedIn(email, password) { const c = client(); const r = await c('POST', '/api/auth/sign-in', { email, password }); if (r.status !== 200) throw new Error(`sign-in ${email} → ${r.status}`); return c; }

const o = await signedIn(OWNER, process.env.QA_OWNER_PASSWORD || pw('GP_SEED_OWNER_PASSWORD'));
const a = await signedIn(A, pw('GP_SEED_A_PASSWORD'));
const b = await signedIn(B, pw('GP_SEED_B_PASSWORD'));
setMode('ok'); await clearCalls();

const projs = (await o('GET', '/api/projects')).json.projects;
const P1 = projs.find(p => p.name === (process.env.QA_P1 || 'ย้ายบ้านใหม่')), P2 = projs.find(p => p.name === (process.env.QA_P2 || 'งานสวนหลังบ้าน'));
const p1 = (await o('GET', `/api/projects/${P1.id}`)).json;
const t = p1.tasks;

// --- case 1 (AC-1) owner creates project + 3 tasks
{ const r = await o('POST', '/api/projects', { name: 'QA-TEST-001 โปรเจกต์ทดสอบ', description: 'ทดสอบ' });
  const pid = r.json?.project?.id; const ts = [];
  for (const n of ['งาน 1', 'งาน 2', 'งาน 3']) ts.push((await o('POST', `/api/projects/${pid}/tasks`, { title: n })).json?.task);
  const g = (await o('GET', `/api/projects/${pid}`)).json;
  const ok = r.status === 201 && g.tasks.length === 3 && g.tasks.every(x => x.status === 'todo');
  rec(1, 'AC-1', 'project + 3 tasks, all todo', `create ${r.status}; tasks ${g.tasks.map(x => x.status).join(',')}`, ok);
  globalThis.QAP = { pid, ts: g.tasks }; }
const QAP = globalThis.QAP;
// case 2 (D16 project name 100/101)
{ const r100 = await o('POST', '/api/projects', { name: 'ก'.repeat(100) }); const r101 = await o('POST', '/api/projects', { name: 'ก'.repeat(101) });
  rec(2, 'AC-1/D16', '100 → 201, 101 → 400', `${r100.status}, ${r101.status}`, r100.status === 201 && r101.status === 400); }
// case 3 (AC-2) stuck + reason visible to A
{ const tk = t.find(x => x.status === 'todo');
  const r = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'stuck', stuckReason: 'รอผลตรวจ QA' });
  const seen = (await a('GET', `/api/projects/${P1.id}`)).json.tasks.find(x => x.id === tk.id);
  rec(3, 'AC-2', 'stuck + reason seen by A (API)', `${r.status}; A sees ${seen?.status}/${seen?.stuckReason}`, r.status === 200 && seen?.status === 'stuck' && seen?.stuckReason === 'รอผลตรวจ QA');
  globalThis.T3 = tk; }
// case 4 (AC-2a) empty / spaces reason
{ const tk = QAP.ts[0];
  const r1 = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'stuck', stuckReason: '' });
  const r2 = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'stuck', stuckReason: '   ' });
  const r3 = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'stuck' });
  const after = (await o('GET', `/api/projects/${QAP.pid}`)).json.tasks.find(x => x.id === tk.id);
  rec(4, 'AC-2a', 'empty / spaces / missing reason → 400; status stays todo', `${r1.status}, ${r2.status}, ${r3.status}; status ${after.status}`, [r1, r2, r3].every(x => x.status === 400) && after.status === 'todo'); }
// case 8 (AC-4) B's list
{ const r = await b('GET', '/api/projects'); const names = r.json.projects.map(p => p.name);
  rec(8, 'AC-4', 'P1 absent from B list', JSON.stringify(names), !names.includes(P1.name)); }
// case 9 (AC-4) B direct
{ const paths = [`/api/projects/${P1.id}`, `/api/tasks/${t[0].id}/comments`, `/api/projects/${P1.id}/summary`, `/api/projects/${P1.id}/members`];
  const rs = []; for (const p of paths) rs.push(await b('GET', p));
  const leak = rs.some(r => r.text.includes(P1.name) || t.some(x => r.text.includes(x.title)));
  rec(9, 'AC-4', '404/403, no P1 name/task in body', rs.map(r => r.status).join(',') + (leak ? ' LEAK' : ' no-leak'), rs.every(r => r.status === 404 || r.status === 403) && !leak); }
// case 10 (AC-4/D3) B summary press, 0 calls
{ await clearCalls(); const r = await b('POST', `/api/projects/${P1.id}/summary`); const c = await stubCalls();
  rec(10, 'AC-4/D3', 'refused; 0 gateway calls', `${r.status}; calls ${c.count}`, (r.status === 404 || r.status === 403) && c.count === 0); }
// case 11 signed out
{ const anon = client(); const rs = [await anon('GET', `/api/projects/${P1.id}`), await anon('GET', '/api/projects')];
  rec(11, 'AC-4', '401, nothing of P1', rs.map(r => r.status).join(','), rs.every(r => r.status === 401 && !r.text.includes(P1.name))); }
// case 12 (AC-5) A comments; owner sees name + time
{ const tk = t[0]; const t0 = Date.now(); const r = await a('POST', `/api/tasks/${tk.id}/comments`, { body: 'ความเห็นจาก A (QA)' });
  const cs = (await o('GET', `/api/tasks/${tk.id}/comments`)).json.comments; const c = cs.at(-1);
  const skew = c ? Math.abs(new Date(c.createdAt).getTime() - t0) : null;
  rec(12, 'AC-5', 'owner sees comment, author name, time ≈ now', `${r.status}; last=${JSON.stringify(c)}; skew ${skew} ms`, r.status === 201 && c?.body === 'ความเห็นจาก A (QA)' && skew !== null && skew < 60000 && JSON.stringify(c).includes('displayName') ); }
// case 14 (AC-6) A direct writes
{ const before = JSON.stringify((await o('GET', `/api/projects/${P1.id}`)).json.tasks);
  const rs = [await a('POST', '/api/projects', { name: 'A tries' }), await a('POST', `/api/projects/${P1.id}/tasks`, { title: 'A tries' }),
    await a('POST', `/api/projects/${P1.id}/tasks/bulk`, { titles: ['x'] }), await a('PATCH', `/api/tasks/${t[0].id}`, { title: 'A edit' }),
    await a('PATCH', `/api/tasks/${t[0].id}`, { status: 'done' }), await a('DELETE', `/api/tasks/${t[0].id}`),
    await a('POST', `/api/projects/${P1.id}/invites`, { name: 'x' }), await a('POST', `/api/projects/${P1.id}/ai/task-proposals`)];
  const after = JSON.stringify((await o('GET', `/api/projects/${P1.id}`)).json.tasks);
  rec(14, 'AC-6', 'all 403; P1 unchanged', rs.map(r => r.status).join(',') + (before === after ? ' unchanged' : ' CHANGED'), rs.every(r => r.status === 403) && before === after); }
// case 15/16 (AC-7) proposals write nothing; bulk saves exactly chosen
{ await clearCalls(); const before = (await o('GET', `/api/projects/${P2.id}`)).json.tasks.length;
  const r = await o('POST', `/api/projects/${P2.id}/ai/task-proposals`); const mid = (await o('GET', `/api/projects/${P2.id}`)).json.tasks.length;
  const props = r.json?.proposals || []; const chosen = props.slice(0, Math.max(1, props.length - 2)).map(p => p.title); if (chosen[0]) chosen[0] = chosen[0] + ' (แก้)';
  const s = await o('POST', `/api/projects/${P2.id}/tasks/bulk`, { titles: chosen }); const after = (await o('GET', `/api/projects/${P2.id}`)).json.tasks;
  const added = after.slice(-0).filter(x => chosen.includes(x.title));
  rec(15, 'AC-7', 'proposals 200, nothing written', `${r.status}; ${props.length} proposals; tasks ${before}→${mid}`, r.status === 200 && props.length > 0 && before === mid);
  rec(16, 'AC-7', 'exactly chosen (with edit) added as todo', `bulk ${s.status}; tasks ${mid}→${after.length}; matched ${added.length}/${chosen.length}`, s.status === 201 && after.length === mid + chosen.length && added.length === chosen.length && added.every(x => x.status === 'todo')); }
// case 19–22 (AC-8) modes
async function aiPair(label, caseId) {
  const s0 = JSON.stringify((await o('GET', `/api/projects/${P1.id}/summary`)).json); const n0 = (await o('GET', `/api/projects/${P2.id}`)).json.tasks.length;
  const g = await o('POST', `/api/projects/${P2.id}/ai/task-proposals`); const s = await o('POST', `/api/projects/${P1.id}/summary`);
  const s1 = JSON.stringify((await o('GET', `/api/projects/${P1.id}/summary`)).json); const n1 = (await o('GET', `/api/projects/${P2.id}`)).json.tasks.length;
  const ok = g.status === 502 && s.status === 502 && g.ms <= 30000 && s.ms <= 30000 && s0 === s1 && n0 === n1;
  rec(caseId, 'AC-8', `${label}: both 502 ≤ 30 s; summary + tasks unchanged`, `G1 ${g.status}/${g.ms}ms ${g.json?.error?.code ?? ''}; S2 ${s.status}/${s.ms}ms; summary ${s0 === s1 ? 'same' : 'CHANGED'}; tasks ${n0}→${n1}`, ok);
}
setMode('500'); await aiPair('stub 500', 20);
setMode('empty'); await aiPair('stub empty', '22a');
setMode('malformed'); await aiPair('stub malformed (200 non-JSON)', '22b');
setMode('hang'); await aiPair('stub hang 40 s', 21);
setMode('ok');
// case 23/24 (AC-9) open = 0 calls; press = 1 call
{ await clearCalls(); const sA = await a('GET', `/api/projects/${P1.id}/summary`); const sO = await o('GET', `/api/projects/${P1.id}/summary`); const c0 = (await stubCalls()).count;
  const stuck = (await o('GET', `/api/projects/${P1.id}`)).json.tasks.filter(x => x.status === 'stuck');
  const listed = JSON.stringify(sA.json);
  const allListed = stuck.every(x => listed.includes(x.title) && listed.includes(x.stuckReason));
  rec(23, 'AC-9', 'open (A, O) → 0 calls; every stuck task + reason listed', `${sA.status}/${sO.status}; calls ${c0}; stuck ${stuck.length} listed ${allListed}`, sA.status === 200 && c0 === 0 && allListed);
  const p = await a('POST', `/api/projects/${P1.id}/summary`); const c1 = (await stubCalls()).count; const sO2 = (await o('GET', `/api/projects/${P1.id}/summary`)).json; const c2 = (await stubCalls()).count;
  rec(24, 'AC-9', 'A press → exactly 1 call; O sees new stored one without a call', `${p.status}; calls ${c1}→${c2}; same ai ${JSON.stringify(sO2?.ai) === JSON.stringify(p.json?.ai)}`, p.status === 200 && c1 === 1 && c2 === 1 && JSON.stringify(sO2?.ai) === JSON.stringify(p.json?.ai)); }
// case 28–32 invites (TTL 60 s set at back start)
const signedOut = () => client();
{ const inv = await o('POST', `/api/projects/${P1.id}/invites`, { name: 'MRK-NAME-7731' }); const tok = inv.json.url.split('/invite/')[1];
  const c = signedOut(); const acc = await c('POST', `/api/invites/${tok}/accept`, { email: `MRK-MAIL-7731${TAG}@godplan.test`, password: 'qa-pass-7731', displayName: 'MRK-NAME-7731' });
  const again = await signedOut()('POST', `/api/invites/${tok}/accept`, { email: `x2${TAG}@godplan.test`, password: 'qa-pass-7731' });
  rec(28, 'AC-13', 'accept 200; reuse → 410', `${inv.status}; accept ${acc.status}; reuse ${again.status}`, acc.status === 200 && again.status === 410);
  // case 27 markers: marked person comments, then AI runs
  await c('POST', `/api/tasks/${t[0].id}/comments`, { body: 'MRK-COMMENT-7731 ความเห็นที่ห้ามส่ง' });
  await rateWindow(); await clearCalls(); const m1 = await o('POST', `/api/projects/${P1.id}/summary`); const m2 = await o('POST', `/api/projects/${P1.id}/ai/task-proposals`);
  const calls = await stubCalls(); const bodies = JSON.stringify(calls.calls);
  const hits = ['MRK-COMMENT-7731', 'MRK-NAME-7731', 'MRK-MAIL-7731'].filter(m => bodies.includes(m));
  const sent = bodies.includes(P1.name);
  rec(27, 'AC-12', '0 marker hits; project name present', `S2 ${m1.status}, G1 ${m2.status}; calls ${calls.count}; hits [${hits}]; project name sent ${sent}`, calls.count === 2 && hits.length === 0 && sent);
  writeFileSync(join(OUT, 'case27-calls.json'), JSON.stringify(calls, null, 1));
  // case 31 AC-18 signed-in A opens someone else's link
  const inv2 = await o('POST', `/api/projects/${P1.id}/invites`, { name: 'ทดสอบ A4' }); const tok2 = inv2.json.url.split('/invite/')[1];
  const r409 = await a('POST', `/api/invites/${tok2}/accept`, { email: `a4${TAG}@godplan.test`, password: 'qa-pass-7731' });
  const a4 = await signedOut()('POST', `/api/invites/${tok2}/accept`, { email: `a4${TAG}@godplan.test`, password: 'qa-pass-7731', displayName: 'ทดสอบ A4' });
  rec(31, 'AC-18', 'signed-in → 409 SIGNED_IN, link still works for A4', `${r409.status} ${r409.json?.error?.code ?? ''}; A4 ${a4.status}`, r409.status === 409 && a4.status === 200);
  // case 30 new link cancels old
  const l1 = (await o('POST', `/api/projects/${P2.id}/invites`, { name: 'ทดสอบ A3' })).json.url.split('/invite/')[1];
  const l2 = (await o('POST', `/api/projects/${P2.id}/invites`, { name: 'ทดสอบ A3' })).json.url.split('/invite/')[1];
  const r1 = await signedOut()('GET', `/api/invites/${l1}`); const r2 = await signedOut()('GET', `/api/invites/${l2}`);
  rec(30, 'AC-13', 'old link 410, new 200', `${r1.status}, ${r2.status}`, r1.status === 410 && r2.status === 200);
  // case 32 AC-14 existing A invited to P2
  const l3 = (await o('POST', `/api/projects/${P2.id}/invites`, { name: 'ทดสอบ A' })).json.url.split('/invite/')[1];
  const ac = signedOut(); const r3 = await ac('POST', `/api/invites/${l3}/accept`, { email: A.toUpperCase(), password: pw('GP_SEED_A_PASSWORD') });
  const list = (await ac('GET', '/api/projects')).json?.projects?.map(p => p.name) || [];
  const wrongPw = await signedOut()('POST', `/api/invites/${(await o('POST', `/api/projects/${QAP.pid}/invites`, { name: 'x' })).json.url.split('/invite/')[1]}/accept`, { email: A, password: 'wrong-password-1' });
  rec(32, 'AC-14', 'existing A (upper-case email) joins P2 with same password; sees P1+P2; wrong pw 401', `${r3.status}; sees [${list}]; wrong pw ${wrongPw.status}`, r3.status === 200 && list.includes(P1.name) && list.includes(P2.name) && wrongPw.status === 401);
  globalThis.EXPIRE_TOK = (await o('POST', `/api/projects/${P2.id}/invites`, { name: 'ทดสอบ หมดอายุ' })).json.url.split('/invite/')[1];
  globalThis.EXPIRE_AT = Date.now();
}
// case 6 short password, case 42 no sign-up
{ const tok = (await o('POST', `/api/projects/${QAP.pid}/invites`, { name: 'ทดสอบ pw' })).json.url.split('/invite/')[1];
  const r = await signedOut()('POST', `/api/invites/${tok}/accept`, { email: `pw7${TAG}@godplan.test`, password: '1234567' });
  rec(6, 'AC-3a/D7', '7-char password → 400', `${r.status}`, r.status === 400);
  const su = await Promise.all(['/api/auth/sign-up', '/api/users', '/api/auth/register'].map(p => signedOut()('POST', p, { email: 'x@godplan.test', password: '12345678' })));
  rec(42, 'D14', 'no sign-up route (404)', su.map(r => r.status).join(','), su.every(r => r.status === 404 || r.status === 405)); }
// case 33/34 reset
{ const aid = (await a('GET', '/api/me')).json.user.id;
  const rl = await o('POST', `/api/users/${aid}/reset-links`); const tok = rl.json?.url?.split('/reset/')[1];
  const r = await signedOut()('POST', `/api/resets/${tok}`, { password: 'new-pass-7731' });
  const old = await signedOut()('POST', '/api/auth/sign-in', { email: A, password: pw('GP_SEED_A_PASSWORD') });
  const neu = await signedOut()('POST', '/api/auth/sign-in', { email: A, password: 'new-pass-7731' });
  const sess = await a('GET', '/api/me');
  const twice = await signedOut()('POST', `/api/resets/${tok}`, { password: 'another-7731' });
  const self = await o('POST', `/api/users/${(await o('GET', '/api/me')).json.user.id}/reset-links`);
  rec(33, 'AC-15', 'reset 204; old 401; new 200; old session signed out; owner self-reset 400', `${rl.status}/${r.status}; old ${old.status}; new ${neu.status}; old session ${sess.status}; self ${self.status}`, r.status === 204 && old.status === 401 && neu.status === 200 && sess.status === 401 && self.status === 400);
  rec(34, 'AC-15', 'second use → 410', `${twice.status}`, twice.status === 410); }
// case 35–38 comments
{ const tk = t[0]; const e1 = await o('POST', `/api/tasks/${tk.id}/comments`, { body: '' }); const e2 = await o('POST', `/api/tasks/${tk.id}/comments`, { body: '   ' });
  rec(35, 'AC-16', 'empty / spaces → 400', `${e1.status}, ${e2.status}`, e1.status === 400 && e2.status === 400);
  const L = (n) => 'ข'.repeat(n);
  const r = [await o('POST', `/api/tasks/${tk.id}/comments`, { body: L(2000) }), await o('POST', `/api/tasks/${tk.id}/comments`, { body: L(2001) }),
    await o('PATCH', `/api/tasks/${QAP.ts[1].id}`, { title: L(200) }), await o('PATCH', `/api/tasks/${QAP.ts[1].id}`, { title: L(201) }),
    await o('PATCH', `/api/tasks/${QAP.ts[2].id}`, { status: 'stuck', stuckReason: L(500) }), await o('PATCH', `/api/tasks/${QAP.ts[2].id}`, { status: 'stuck', stuckReason: L(501) }),
    await o('POST', '/api/projects', { name: 'QA desc', description: L(2000) }), await o('POST', '/api/projects', { name: 'QA desc', description: L(2001) })];
  const exp = [201, 400, 200, 400, 200, 400, 201, 400];
  rec(36, 'AC-16/D16', 'limits: at-limit ok, over 400 — ' + exp.join(','), r.map(x => x.status).join(','), r.every((x, i) => x.status === exp[i]));
  const html = '<script>alert(1)</script><b>x</b>'; const h = await o('POST', `/api/tasks/${tk.id}/comments`, { body: html });
  rec(37, 'AC-16', 'API stores HTML verbatim (render check is UI-only)', `${h.status}; stored ${h.json?.comment?.body === html}`, null);
  const cid = h.json?.comment?.id; const ed = [await o('PATCH', `/api/comments/${cid}`, { body: 'x' }), await o('DELETE', `/api/comments/${cid}`)];
  rec(38, 'D15', 'no edit/delete of comments (404/405)', ed.map(x => x.status).join(','), ed.every(x => x.status === 404 || x.status === 405)); }
// case 39 / 40 status
{ const tk = globalThis.T3; const r = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'doing' }); const seen = (await o('GET', `/api/projects/${P1.id}`)).json.tasks.find(x => x.id === tk.id);
  const back = await o('PATCH', `/api/tasks/${tk.id}`, { status: 'stuck' });
  rec(39, 'AC-17/D12', 'leave stuck → reason cleared; back to stuck needs reason', `${r.status}; reason ${JSON.stringify(seen.stuckReason)}; back-without-reason ${back.status}`, r.status === 200 && !seen.stuckReason && back.status === 400);
  const d = await o('PATCH', `/api/tasks/${QAP.ts[0].id}`, { status: 'done' }); const u = await o('PATCH', `/api/tasks/${QAP.ts[0].id}`, { status: 'todo' });
  rec(40, 'D5', 'done → todo allowed', `${d.status}, ${u.status}`, d.status === 200 && u.status === 200); }
// case 26 (D1 guards) — last: it trips the rate limit
{ await rateWindow(); await clearCalls(); const rs = []; for (let i = 0; i < 12; i++) rs.push(await o('POST', `/api/projects/${P1.id}/summary`));
  const n429 = rs.filter(r => r.status === 429).length; const c = (await stubCalls()).count;
  rec(26, 'AC-11/D1', '≤10 accepted/min; rest 429; calls = accepted', `200×${rs.filter(r => r.status === 200).length}, 429×${n429}; calls ${c}`, n429 >= 2 && c === rs.filter(r => r.status === 200).length && c <= 10); }
// case 29 expiry (TTL 60 s)
{ const wait = 62000 - (Date.now() - globalThis.EXPIRE_AT); if (wait > 0) await new Promise(r => setTimeout(r, wait));
  const r = await signedOut()('GET', `/api/invites/${globalThis.EXPIRE_TOK}`);
  rec(29, 'AC-13', 'after TTL 60 s → 410', `${r.status}`, r.status === 410); }

setMode('ok');
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1));
for (const r of results) console.log(`${String(r.id).padEnd(4)} ${r.ac.padEnd(11)} ${r.result.padEnd(10)} ${r.actual}`);
console.log(`PASS ${results.filter(r => r.result === 'PASS').length} · FAIL ${results.filter(r => r.result === 'FAIL').length} · NOT_TESTED ${results.filter(r => r.result === 'NOT_TESTED').length}`);
