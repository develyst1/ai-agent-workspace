// TEST-107 round 3: are the "saved, but field X left out" lines visible, and after "ดูรายละเอียด"? usage: bun r3-details.mjs <front dir>
import { createRequire } from 'node:module';
const [front] = process.argv.slice(2);
const { chromium } = createRequire(front + '/package.json')('@playwright/test');
const WEB = 'http://127.0.0.1:3141', API = 'http://127.0.0.1:4231';
const all = await (await fetch(`${API}/v1/projects`)).json();
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: 'bp_by', value: encodeURIComponent('โด่ง'), url: WEB }]);
const p = await ctx.newPage();
for (const pr of (all.projects ?? all).filter((x) => / r3 replay /.test(x.name))) {
  await p.goto(`${WEB}/p/${pr.id}/chat`, { waitUntil: 'networkidle' });
  const vis = async () => { const out = []; for (const f of ['fields', 'actions', 'states', 'open']) { const l = p.getByText(`ตัดช่อง ${f} ออก`, { exact: false }).first(); out.push(`${f}:${(await l.count()) ? await l.isVisible() : 'absent'}`); } return out.join(' '); };
  const before = await vis();
  const more = p.getByText('ดูรายละเอียด').first(); if (await more.count()) await more.click(); else console.log('no ดูรายละเอียด on', pr.name); await p.waitForTimeout(800);
  const after = await vis();
  const dlg = await p.locator('[role=dialog]').count();
  console.log(`${pr.name}: before ${before} | after click ${after} | dialog ${dlg}`);
  await p.screenshot({ path: `e9-details-${pr.name.split(' ').pop()}.png`, fullPage: true });
}
await b.close();
