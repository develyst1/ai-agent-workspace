// TEST-115 (REQ-115) — which model each gateway call asks for, through the API the chat and quiz pages use.
// Stub gateway-115.mjs :4398 (script.txt, calls.log). API :4251. usage (from this folder): bun cases.mjs <group>
//   group "main"  — AC-1, AC-2, AC-3 (API started with no GATEWAY_LIGHT_MODEL)
//   group "env"   — AC-4 (API restarted with GATEWAY_LIGHT_MODEL set; the expected value is argv[3])
import fs from 'node:fs';
const API = 'http://127.0.0.1:4251';
const [group, expectLight] = process.argv.slice(2);
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const post = async (path, body, method = 'POST') => (await fetch(`${API}${path}`, { method, headers: by, body: JSON.stringify(body) })).json();
const sent = () => fs.readFileSync('calls.log', 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
// run `fn` with the stub on `script`; return what the stub saw (HTTP requests) and what Blueprint recorded
const setScript = (script) => { fs.writeFileSync('calls.log', ''); fs.writeFileSync('script.txt', JSON.stringify({ run: crypto.randomUUID(), script })); };
const withScript = async (script, fn) => {
  setScript(script);
  const out = await fn(); return { http: sent().map((c) => `${c.asked}:${c.kind}`), ...out };
};
const project = async (name, model) => {
  const id = (await post('/v1/projects', { name: `TEST-115 ${name}`, theme: 'clean-blue' })).id;
  if (model) await post(`/v1/projects/${id}`, { model }, 'PATCH');
  return id;
};
const round = (name, script, model) => withScript(script, async () => {
  const id = await project(name, model);
  const r = await post(`/v1/projects/${id}/rounds`, { message: 'ทำหน้า Health Board ให้หน่อย' });
  const rows = (await (await fetch(`${API}/v1/projects/${id}/messages?limit=10`)).json());
  const bot = (rows.messages ?? rows).filter((m) => m.role === 'bot').pop();
  return { id, status: r.status, calls: r.calls, rowCalls: bot?.roundCalls ?? null, refused: r.refused };
});
// the setup round runs on its own script (`good`), so the quiz's script starts fresh at its first answer
const quiz = (name, script, model) => withScript(['good'], async () => {
  const id = await project(name, model);
  await post(`/v1/projects/${id}/rounds`, { message: 'ทำหน้า Health Board ให้หน่อย' }); // a spec to ask about
  setScript(script); // count only the quiz calls
  const q = await post(`/v1/projects/${id}/quizzes`, {});
  const item = await post(`/v1/projects/${id}/quizzes/${q.id}/questions`, { question: 'หน้า Health Board แสดงอะไร' });
  const latest = await (await fetch(`${API}/v1/projects/${id}/quizzes/latest`)).json();
  return { id, status: item.status, calls: item.calls, storedCalls: (latest.items ?? []).at(-1)?.calls ?? null };
});
const short = (calls) => (calls ?? []).map((c) => `${c.step}/${c.weight}/${c.asked}${c.fallback ? '/fallback' : ''}/${c.ok ? 'ok' : c.reason}`);
// jsonb stores an object's keys in its own order, so compare with sorted keys
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, canon(v[x])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
let k;
if (group === 'main') {
  // AC-1
  k = await round('AC-1', ['good', 'good']);
  note('AC-1 neighbour: a clean round = one heavy call on the project model', same(k.http, ['tier:medium:good']) && same(short(k.calls), ['first/heavy/tier:medium/ok']), JSON.stringify({ http: k.http, calls: short(k.calls) }));
  fs.writeFileSync('ac1-clean.json', JSON.stringify(k, null, 2));
  k = await round('AC-1', ['refused', 'good']);
  note('AC-1 refused first reply → correction on tier:small; both in the round record with their kind',
    same(k.http, ['tier:medium:refused', 'tier:small:good']) && same(short(k.calls), ['first/heavy/tier:medium/ok', 'correction/light/tier:small/ok']) && same(k.calls, k.rowCalls),
    JSON.stringify({ http: k.http, calls: short(k.calls), rowSame: same(k.calls, k.rowCalls), status: k.status }));
  fs.writeFileSync('ac1.json', JSON.stringify(k, null, 2));
  k = await round('AC-1 reask', ['unreadable', 'good']);
  note('AC-1 neighbour: an unreadable first reply → the re-ask on tier:small', same(k.http, ['tier:medium:unreadable', 'tier:small:good']) && same(short(k.calls), ['first/heavy/tier:medium/protocol', 'reask/light/tier:small/ok']), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  // AC-2
  k = await quiz('AC-2', ['quiz']);
  note('AC-2 quiz answer on tier:small, recorded on the item', same(k.http, ['tier:small:quiz']) && same(short(k.calls), ['answer/light/tier:small/ok']) && same(k.calls, k.storedCalls), JSON.stringify({ http: k.http, calls: short(k.calls), stored: same(k.calls, k.storedCalls), status: k.status }));
  fs.writeFileSync('ac2.json', JSON.stringify(k, null, 2));
  // AC-3 — the light call fails once, each way
  k = await round('AC-3 unreadable', ['refused', 'unreadable', 'good']);
  note('AC-3 correction unreadable on light → ONE retry on tier:medium, marked fallback', same(k.http, ['tier:medium:refused', 'tier:small:unreadable', 'tier:medium:good']) && same(short(k.calls), ['first/heavy/tier:medium/ok', 'correction/light/tier:small/protocol', 'correction/light/tier:medium/fallback/ok']), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  fs.writeFileSync('ac3-unreadable.json', JSON.stringify(k, null, 2));
  k = await round('AC-3 still', ['refused', 'refused', 'good']);
  note('AC-3 correction still refusing on light → ONE retry on tier:medium', same(k.http, ['tier:medium:refused', 'tier:small:refused', 'tier:medium:good']) && k.calls.at(-1)?.fallback === true, JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status, refused: k.refused }));
  k = await round('AC-3 timeout-ish', ['refused', 'http500', 'http500', 'good']);
  console.log(`    AC-3 (observe) correction light transport failure: HTTP ${JSON.stringify(k.http)} · record ${JSON.stringify(short(k.calls))} · status ${k.status}`);
  fs.writeFileSync('ac3-transport.json', JSON.stringify(k, null, 2));
  k = await round('AC-3 both fail', ['refused', 'unreadable', 'unreadable', 'good']);
  note('AC-3 light AND fallback fail → stops; at most one extra call', same(k.http, ['tier:medium:refused', 'tier:small:unreadable', 'tier:medium:unreadable']), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  k = await round('AC-3 reask both', ['unreadable', 'unreadable', 'unreadable', 'good']);
  note('AC-3 re-ask light AND fallback fail → stops at 3 calls', same(k.http, ['tier:medium:unreadable', 'tier:small:unreadable', 'tier:medium:unreadable']), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  k = await quiz('AC-3 quiz', ['unreadable', 'quiz']);
  note('AC-3 quiz light unreadable → ONE retry on tier:medium', same(k.http, ['tier:small:unreadable', 'tier:medium:quiz']) && same(short(k.calls), ['answer/light/tier:small/protocol', 'answer/light/tier:medium/fallback/ok']), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  k = await quiz('AC-3 quiz all bad', ['unreadable']);
  console.log(`    AC-3 (observe) quiz, every reply unreadable: HTTP ${JSON.stringify(k.http)} · record ${JSON.stringify(short(k.calls))} · status ${k.status}`);
  fs.writeFileSync('ac3-quiz-all-bad.json', JSON.stringify(k, null, 2));
  k = await round('AC-3 small project', ['refused', 'unreadable', 'good'], 'tier:small');
  note('AC-3 neighbour: project on tier:small → no fallback (light IS the project model)', same(k.http, ['tier:small:refused', 'tier:small:unreadable']) && !k.calls.some((c) => c.fallback), JSON.stringify({ http: k.http, calls: short(k.calls), status: k.status }));
  k = await round('AC-3 named project', ['refused', 'good'], 'stub/qa-main');
  note('neighbour: the picker\'s named model stays on the heavy call; light still tier:small', same(k.http, ['stub/qa-main:refused', 'tier:small:good']), JSON.stringify({ http: k.http, calls: short(k.calls) }));
}
if (group === 'env') {
  k = await round('AC-4', ['refused', 'good']);
  note(`AC-4 light call uses the configured ${expectLight}`, same(k.http, ['tier:medium:refused', `${expectLight}:good`]) && k.calls[1]?.asked === expectLight, JSON.stringify({ http: k.http, calls: short(k.calls) }));
  k = await quiz('AC-4 quiz', ['quiz']);
  note(`AC-4 quiz uses ${expectLight}`, same(k.http, [`${expectLight}:quiz`]), JSON.stringify({ http: k.http, calls: short(k.calls) }));
}
