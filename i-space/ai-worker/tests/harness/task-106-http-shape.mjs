// TASK-106 DoD 6, the part that needs no back end: what `createHttpApi().hopOutput` sends and how it reads the answer (a fake fetch answers; nothing is called).
// usage: bun tests/harness/task-106-http-shape.mjs <caw-front dir>
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const front = process.argv[2];
const { createHttpApi } = await import(pathToFileURL(path.join(front, 'src/api/http.ts')).href);
const { CawError } = await import(pathToFileURL(path.join(front, 'src/api/caw.ts')).href);

const seen = [];
const answer = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const api = createHttpApi({
  baseUrl: 'http://fake.invalid',
  fetch: async (req) => {
    seen.push(`${req.method} ${new URL(req.url).pathname}${new URL(req.url).search} actor=${req.headers.get('x-caw-actor')}`);
    if (req.url.includes('/missing/')) return answer(404, { error: { code: 'not_found', message: 'no such hop' } });
    return answer(200, { hopId: 'h1', entries: [{ seq: 4, at: '2026-10-29T06:00:00.000Z', kind: 'gap', text: '', gapSeconds: 12 }], more: true });
  },
});

console.log('no query   →', JSON.stringify(await api.hopOutput('h1')));
await api.hopOutput('h1', { after: 7, limit: 50 });
await api.hopOutput('h1', { after: -1 });
const err = await api.hopOutput('missing').catch((e) => e);
console.log('404        →', err instanceof CawError, err.status, err.code);
for (const s of seen) console.log('sent       →', s);
