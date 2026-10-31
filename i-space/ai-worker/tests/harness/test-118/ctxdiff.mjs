// TEST-118 AC-5 — "an interview-built spec's card context is unchanged except for the added requirements". The same interview-style spec
// (TEST-112's seed: parts + links + decisions, no requirement) in the OLD blueprint-back (HEAD, without TASK-145) and the NEW one; every
// part's v2 context and, after the same label, its v1 context — compared with `requirements` left out. usage: bun ctxdiff.mjs <old api> <new api>
import fs from 'node:fs';
const [OLD, NEW] = process.argv.slice(2);
const by = { 'content-type': 'application/json', 'x-blueprint-by': encodeURIComponent('โด่ง') };
const note = (c, ok, d) => console.log(`${ok ? 'OK ' : 'BAD'} ${c} — ${d}`);
const seed = async (api, file) => { const p = Bun.spawnSync([process.execPath, 'seed.mjs', api, file]); if (p.exitCode !== 0) throw new Error(p.stderr.toString()); return fs.readFileSync(file, 'utf8').trim(); };
const o = await seed(OLD, 'out-ctx/old-id.txt'), n = await seed(NEW, 'out-ctx/new-id.txt');
for (const [api, id] of [[OLD, o], [NEW, n]]) await fetch(`${api}/v1/projects/${id}/versions`, { method: 'POST', headers: by, body: JSON.stringify({ label: 'v1' }) });
const spec = await (await fetch(`${NEW}/v1/projects/${n}/spec`)).json();
const keys = spec.parts.map((p) => p.key);
// project ids, generated ids and times differ by construction; everything else must be equal
const strip = (v) => JSON.parse(JSON.stringify(v, (k, x) => (['projectId', 'id', 'createdAt', 'updatedAt', 'at', 'changeSetId', 'labelledAt', 'savedAt', 'confirmedAt', 'createdIn', 'updatedIn', 'removedIn'].includes(k) ? undefined : x)));
let same = 0, diff = [], reqs = [];
for (const key of keys) {
  for (const [name, path] of [['v2', `/spec/parts/${key}/context`], ['v1', `/versions/1/parts/${key}/context`]]) {
    const a = await (await fetch(`${OLD}/v1/projects/${o}${path}`)).json();
    const b = await (await fetch(`${NEW}/v1/projects/${n}${path}`)).json();
    reqs.push(JSON.stringify(b.requirements));
    const { requirements, ...rest } = b;
    if (JSON.stringify(strip(a)) === JSON.stringify(strip(rest)) && !('requirements' in a)) same++; else { diff.push(`${name} ${key}`); fs.writeFileSync(`out-ctx/diff-${name}-${key}.json`, JSON.stringify({ old: a, new: b }, null, 1)); }
  }
}
note(`AC-5 interview-built spec: ${keys.length} parts × v2 + v1 — every context equal to the old one except the new \`requirements\` field`, diff.length === 0, `${same} equal · differ: ${diff.join(', ') || 'none'}`);
note('AC-5 that field is [] on every context (the spec has no requirement)', reqs.every((r) => r === '[]'), [...new Set(reqs)].join(' | '));
