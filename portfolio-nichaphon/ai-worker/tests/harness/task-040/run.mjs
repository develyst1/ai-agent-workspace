// TASK-040 DoD 2 (Fern, 2026-11-01). Zero real calls: no AI route is touched.
// Needs: back/ on 4014 with ADMIN_ENABLED=1 on a seeded SCRATCH store; the built standalone front on FRONT.
// Warms /, /about, /blog (3 loads each), then for each of three Saves makes ONE request to the page right after
// and checks the change is in that first response. Usage: FRONT=http://localhost:3072 node run.mjs
const FRONT = process.env.FRONT ?? 'http://localhost:3072';
const BACK = 'http://localhost:4014';
const ts = () => new Date().toISOString().slice(11, 23);
const page = async (path) => (await fetch(FRONT + path, { cache: 'no-store' })).text();
const send = async (method, path, body) => {
  const res = await fetch(BACK + path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return `${res.status}`;
};
const doc = async (key) => (await (await fetch(`${BACK}/admin/api/documents/${key}`)).json()).value;

for (const path of ['/', '/about', '/blog']) {
  for (let i = 1; i <= 3; i++) {
    const started = Date.now();
    await page(path);
    console.log(`${ts()} warm ${path} #${i} ${Date.now() - started} ms`);
  }
}

const stamp = Date.now().toString(36).toUpperCase();
const results = [];
async function check(label, save, path, needle) {
  const saved = await save();
  const savedAt = ts();
  const html = await page(path);
  const ok = html.includes(needle);
  console.log(`${savedAt} save ${label} → ${saved} · ${ts()} first GET ${path} contains ${JSON.stringify(needle)}: ${ok}`);
  results.push(ok);
}

// 1. site.availability → shown in the site shell (/)
const site = await doc('site');
const availability = `Available from test ${stamp}`;
await check('site.availability', () => send('PUT', '/admin/api/documents/site', { ...site, availability }), '/', availability);

// 2. one certificate's title → /about
const certs = await doc('certificates');
const certTitle = `TEST certificate ${stamp}`;
await check(
  'certificates[0].title',
  () => send('PUT', '/admin/api/documents/certificates', certs.map((c, i) => (i === 0 ? { ...c, title: certTitle } : c))),
  '/about',
  certTitle,
);

// 3. a new published post → /blog
const postTitle = `TEST post ${stamp}`;
await check(
  'new published post',
  () =>
    send('POST', '/admin/api/posts', {
      id: `test-${stamp.toLowerCase()}`,
      title: postTitle,
      excerpt: 'Test data for TASK-040, scratch store only.',
      author: 'Test',
      publishedAt: null,
      readTime: '1 min read',
      category: 'Test',
      slug: `test-${stamp.toLowerCase()}`,
      bodyMd: 'Test body.',
      cover: null,
      status: 'published',
    }),
  '/blog',
  postTitle,
);

console.log(`RESULT ${results.filter(Boolean).length}/${results.length} changes on the first request`);
