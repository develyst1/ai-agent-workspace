/*
 * TEST-011 AC-c harness (Tanya, QA — 2026-11-01). ZERO real calls (no Draft-with-AI press).
 * Through the REAL admin UI, against the store COPY: write (A) a PUBLISHED post with a Markdown body (heading, list,
 * link, bold, a raw <script> line) and (B) a DRAFT post. Then on the public site: /blog lists A (not B), A opens on
 * /blog/<slug> with the body rendered (no raw HTML executed), B's page is a 404.
 * Usage: NODE_PATH=<dir>/node_modules ADMIN_URL=http://localhost:4015 BASE_URL=http://127.0.0.1:3072 OUT=<dir> node test011-acc-2026-11-01.cjs
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ADMIN = process.env.ADMIN_URL || 'http://localhost:4015';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3072';
const OUT = process.env.OUT || '.';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

const A = {
  title: 'QA-T011 published post', slug: 'qa-t011-published-post', category: 'QA', readTime: '2 min read',
  excerpt: 'QA-T011-EXCERPT a post written in the admin by QA.',
  body: '## QA-T011 heading\n\nA paragraph with **bold words** and a [link to contact](/contact).\n\n- first point\n- second point\n\n<script>window.__qa_xss = 1</script>\n\nQA-T011-BODY-END',
};
const B = { title: 'QA-T011 draft post', slug: 'qa-t011-draft-post', category: 'QA', readTime: '1 min read', excerpt: 'QA-T011-DRAFT should not be public.', body: 'QA-T011-DRAFT-BODY' };

async function openPosts(a) {
  await a.goto(ADMIN + '/', { waitUntil: 'networkidle' });
  await a.waitForFunction(() => [...document.querySelectorAll('nav[aria-label="Content documents"] p')].some((x) => x.innerText === 'Blog'), null, { timeout: 30000 });
  await a.evaluate(() => {
    const ps = [...document.querySelectorAll('nav[aria-label="Content documents"] p')];
    let el = ps.find((x) => x.innerText === 'Blog').nextElementSibling;
    while (el && el.tagName !== 'P') { const l = el.tagName === 'A' ? el : el.querySelector('a'); if (l && l.innerText.trim() === 'Posts') { l.click(); return; } el = el.nextElementSibling; }
  });
  await a.waitForTimeout(1200);
}
async function writePost(a, p, status, tag) {
  await openPosts(a);
  await a.locator('main button', { hasText: /^New post$/ }).click();
  await a.waitForTimeout(900);
  const box = (n) => a.getByRole('textbox', { name: n, exact: true });
  await box('Title').fill(p.title);
  const autoSlug = await box('Slug').inputValue();
  await box('Slug').fill(p.slug);
  await box('Category').fill(p.category);
  await a.keyboard.press('Escape');
  await box('Read time').fill(p.readTime);
  const author = await box('Author').inputValue();
  await box('Excerpt').fill(p.excerpt);
  const excerptId = await box('Excerpt').getAttribute('id');
  const body = a.locator(`main textarea:not([id="${excerptId}"])`).last();
  await body.fill(p.body);
  await a.locator('main label.mantine-SegmentedControl-label').filter({ hasText: status === 'published' ? /^Published$/ : /^Draft/ }).click();
  await a.screenshot({ path: path.join(OUT, `${tag}-admin-before-save.png`), fullPage: true });
  const t0 = Date.now();
  await a.locator('main button', { hasText: /^Save$/ }).first().click();
  await a.waitForTimeout(1500);
  const msg = await a.evaluate(() => document.querySelector('main').innerText.split('\n').filter((l) => /Saved|error|could not|invalid/i.test(l)).slice(0, 3));
  await a.screenshot({ path: path.join(OUT, `${tag}-admin-after-save.png`), fullPage: true });
  return { autoSlug, author, msg, t0 };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const a = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const pub = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pubErr = [];
  pub.on('pageerror', (e) => pubErr.push(String(e).slice(0, 150)));

  const wa = await writePost(a, A, 'published', 'c1-published');
  console.log('AC-c write A', JSON.stringify(wa));
  const wb = await writePost(a, B, 'draft', 'c2-draft');
  console.log('AC-c write B', JSON.stringify(wb));

  await pub.goto(BASE + '/blog', { waitUntil: 'networkidle' });
  const list = await pub.evaluate(() => document.body.innerText);
  const firstCard = await pub.evaluate(() => { const a = [...document.querySelectorAll('main a[href^="/blog/"]')]; return a.map((x) => x.getAttribute('href')); });
  await pub.screenshot({ path: path.join(OUT, 'c3-public-blog-list.png') });
  console.log('AC-c /blog', JSON.stringify({ hasA: list.includes(A.title), hasAexcerpt: list.includes('QA-T011-EXCERPT'), hasB: list.includes(B.title) || list.includes('QA-T011-DRAFT'), postLinks: firstCard, seenAfterSaveSeconds: (Date.now() - wa.t0) / 1000 }));

  const resA = await pub.goto(BASE + '/blog/' + A.slug, { waitUntil: 'networkidle' });
  await pub.waitForTimeout(600);
  const art = await pub.evaluate(() => ({
    h1: (document.querySelector('h1') || {}).innerText,
    h2: [...document.querySelectorAll('main h2')].map((h) => h.innerText),
    strong: [...document.querySelectorAll('main strong')].map((s) => s.innerText),
    li: [...document.querySelectorAll('main li')].map((l) => l.innerText).filter((t) => /point/.test(t)),
    contactLink: [...document.querySelectorAll('main a')].filter((x) => x.innerText === 'link to contact').map((x) => x.getAttribute('href')),
    scriptTagsInMain: document.querySelectorAll('main script').length,
    xssRan: window.__qa_xss === 1,
    rawMarks: (document.querySelector('main').innerText.match(/\*\*|##|\]\(/g) || []).length,
    bodyEnd: document.querySelector('main').innerText.includes('QA-T011-BODY-END'),
    title: document.title,
  }));
  await pub.screenshot({ path: path.join(OUT, 'c4-public-post-page.png'), fullPage: true });
  console.log('AC-c /blog/<A>', JSON.stringify({ status: resA.status(), ...art }));

  // reach it the way a visitor does: click the card on /blog
  await pub.goto(BASE + '/blog', { waitUntil: 'networkidle' });
  await pub.locator(`main a[href="/blog/${A.slug}"]`).first().click();
  await pub.waitForTimeout(1500);
  console.log('AC-c click-through', JSON.stringify({ landed: new URL(pub.url()).pathname }));

  const resB = await pub.goto(BASE + '/blog/' + B.slug, { waitUntil: 'networkidle' });
  const bText = await pub.evaluate(() => document.body.innerText.slice(0, 200));
  await pub.screenshot({ path: path.join(OUT, 'c5-public-draft-404.png') });
  console.log('AC-c /blog/<B draft>', JSON.stringify({ status: resB.status(), bText }));
  console.log('public pageerrors', JSON.stringify(pubErr));
  await browser.close();
})().catch((e) => { console.error('[harness error]', e); process.exit(1); });
