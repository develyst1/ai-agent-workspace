// TEST-114 (REQ-116) — E15 (a URL ends where non-URL text starts) and E16 (held = the same address) through the API the chat page posts to.
// Stub gateway-r2.mjs :4398 (modes `none`, `holds:<address>`). API :4231. usage (from this folder): bun edges.mjs
import fs from 'node:fs';
const API = 'http://127.0.0.1:4231';
const by = { 'content-type': 'application/json', 'X-Blueprint-By': encodeURIComponent('โด่ง') };
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const mode = (m) => fs.writeFileSync('mode.txt', m);
const kept = async (msg, m = 'none') => {
  mode(m);
  const id = (await (await fetch(`${API}/v1/projects`, { method: 'POST', headers: by, body: JSON.stringify({ name: `TEST-114 ${msg.slice(0, 30)}`, theme: 'clean-blue' }) })).json()).id;
  const r = await (await fetch(`${API}/v1/projects/${id}/rounds`, { method: 'POST', headers: by, body: JSON.stringify({ message: msg }) })).json();
  const s = await (await fetch(`${API}/v1/projects/${id}`)).json();
  return { status: r.status, paths: s.parts.filter((p) => p.kind === 'api').map((p) => p.body.path), kept: (r.adjusted ?? []).filter((a) => a.what === 'url_kept').map((a) => a.title) };
};
const eq = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
let k;
// AC-1
k = await kept('ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที');
note('AC-1 Thai right after the URL → exactly http://127.0.0.1:4500/health', eq(k.paths, ['http://127.0.0.1:4500/health']) && eq(k.kept, ['http://127.0.0.1:4500/health']), JSON.stringify(k));
k = await kept('ดูที่http://127.0.0.1:3100แล้วนะ และที่http://127.0.0.1:3500/ด้วย');
note('AC-1 Thai on both sides, two URLs, one with a trailing "/"', eq(k.paths, ['http://127.0.0.1:3100', 'http://127.0.0.1:3500/']), JSON.stringify(k.paths));
k = await kept('ลิงก์ http://127.0.0.1:4200/health?a=1&b=2#top ครับ');
note('AC-1 neighbour: query + fragment kept whole (ASCII)', eq(k.paths, ['http://127.0.0.1:4200/health?a=1&b=2#top']), JSON.stringify(k.paths));
k = await kept('ดูหน้า https://example.test/ค้นหา?q=1 ด้วย');
console.log(`    neighbour (observe): a URL whose path is Thai → kept ${JSON.stringify(k.paths)}`);
k = await kept('หน้าแรก https://example.test/%E0%B8%84%E0%B9%89%E0%B8%99 (percent-encoded Thai)');
note('neighbour: a percent-encoded Thai path is kept whole', eq(k.paths, ['https://example.test/%E0%B8%84%E0%B9%89%E0%B8%99']), JSON.stringify(k.paths));
// AC-2
k = await kept('ตรวจ http://127.0.0.1:3100 ด้วยครับ', 'holds:http://127.0.0.1:31000');
note('AC-2 a part holding :31000 does NOT hold :3100 → :3100 kept', eq(k.paths, ['http://127.0.0.1:3100']), JSON.stringify(k));
k = await kept('ตรวจ http://127.0.0.1:3100 ด้วยครับ', 'holds:http://127.0.0.1:3100');
note('AC-2 neighbour: a part holding exactly :3100 → nothing kept (no duplicate)', k.paths.length === 0, JSON.stringify(k));
k = await kept('ตรวจ http://127.0.0.1:3100 ด้วยครับ', 'holds:http://127.0.0.1:3100/');
note('AC-2 neighbour: a part holding ":3100/" counts as ":3100" (trailing slash)', k.paths.length === 0, JSON.stringify(k));
k = await kept('ตรวจ http://127.0.0.1:4200 ด้วยครับ', 'holds:http://127.0.0.1:4200/health');
note('AC-2 neighbour: a part holding ":4200/health" does NOT hold ":4200"', eq(k.paths, ['http://127.0.0.1:4200']), JSON.stringify(k));
k = await kept('ตรวจ http://127.0.0.1:4200/health ด้วยครับ', 'holds:http://127.0.0.1:4200/health?x=1');
console.log(`    neighbour (observe): part holds ":4200/health?x=1", user wrote ":4200/health" → kept ${JSON.stringify(k.paths)}`);
k = await kept('ตรวจที่http://127.0.0.1:3100ทุกวัน', 'holds:http://127.0.0.1:3100');
note('AC-1 × AC-2: Thai-glued URL that a part already holds → nothing kept', k.paths.length === 0, JSON.stringify(k));
