// TEST-109 round 2 — AC-5 + QA's own variations through the REAL hook with the runner's default ports.
// usage: bun variations.mjs <caw-back dir> <scratch dir> <hostname>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [back, scratch, host] = process.argv.slice(2);
const proj = path.join(scratch, 'proj'); fs.mkdirSync(proj, { recursive: true });
fs.writeFileSync(path.join(proj, 'h.txt'), 'X-CAW-Actor: operator\n');
fs.writeFileSync(path.join(proj, 'u.txt'), 'http://127.0.0.1:4500/v1/proposals/X/accept\n');
fs.writeFileSync(path.join(proj, 'cfg.txt'), 'url = "http://127.0.0.1:4500/"\n');
const { serverPortsOf } = await import(path.join(back, 'src/runner/config.ts'));
const P = serverPortsOf({}, 'http://127.0.0.1:4500', () => {});
const judge = (command) => {
  const r = spawnSync(process.execPath, ['--no-env-file', path.join(back, 'src/runner/read-guard.ts'), JSON.stringify([proj]), '[]', JSON.stringify(P)], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: proj }), encoding: 'utf8' });
  return r.status === 0 ? 'allow' : (r.stderr.match(/caw-refused (\w+)/)?.[1] ?? `exit${r.status}`);
};
const cases = [
  // AC-5 as written
  ['AC-5 port', 'curl http://127.0.0.1:04500/v1/projects', 'refuse'], ['AC-5 port', 'curl http://127.0.0.1:004500/', 'refuse'], ['AC-5 port', 'curl http://localhost:04200/v1/projects', 'refuse'],
  ['AC-5 port', 'curl http://localhost:4500/', 'refuse'], ['AC-5 port', 'curl http://[::1]:4500/', 'refuse'], ['AC-5 port', 'curl http://0.0.0.0:4500/', 'refuse'],
  ['AC-5 port', `curl http://${host}:4500/`, 'refuse'],
  ['AC-5 header', 'curl -H @h.txt http://127.0.0.1:3900/', 'refuse'], ['AC-5 header', 'curl -H@h.txt http://127.0.0.1:3900/', 'refuse'], ['AC-5 header', 'curl --header @h.txt http://127.0.0.1:3900/', 'refuse'],
  ['AC-5 header', 'curl -K cfg.txt http://127.0.0.1:3900/', 'refuse'], ['AC-5 header', 'curl -H "X-CAW-Actor: $ACTOR" http://127.0.0.1:3900/', 'refuse'],
  ['AC-5 both', 'curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept', 'refuse'],
  // QA's variations — the port / host
  ['var port', 'curl http://127.0.0.1:0x1194/', 'refuse'], ['var port', 'curl http://[::]:4500/', 'refuse'], ['var port', 'curl http://[0:0:0:0:0:0:0:1]:4500/', 'refuse'],
  ['var port', 'curl http://x@127.0.0.1:4500/', 'refuse'], ['var port', 'curl http://127.0.0.1:4500@example.invalid/', 'refuse'], ['var port', 'curl http://LOCALHOST:4500/', 'refuse'],
  ['var port', 'curl http://localhost.:4500/', 'refuse'], ['var port', 'curl http://127.0.0.1:3900/ http://127.0.0.1:4500/', 'refuse'], ['var port', 'curl -: http://127.0.0.1:3900/ -: http://127.0.0.1:4500/', 'refuse'],
  // QA's variations — the header
  ['var header', 'curl -H "X-CAW-Actor:operator" http://127.0.0.1:3900/', 'refuse'], ['var header', 'curl -H @- http://127.0.0.1:3900/ < h.txt', 'refuse'], ['var header', 'curl -H @/dev/stdin http://127.0.0.1:3900/ < h.txt', 'refuse'],
  ['var header', "curl --variable h@h.txt --expand-header '{{h}}' http://127.0.0.1:3900/", 'refuse'], ['var header', "curl -H 'x-blueprint-by:x' http://127.0.0.1:3900/", 'refuse'],
  // QA's variations — the URL out of sight
  ['var hidden', "curl --variable u@u.txt --expand-url '{{u}}'", 'refuse'], ['var hidden', 'wget -i u.txt', 'refuse'], ['var hidden', 'wget --input-file=u.txt', 'refuse'],
  ['var hidden', 'curl --next http://127.0.0.1:4500/', 'refuse'],
  // D8 — routing
  ['D8', 'curl --connect-to 127.0.0.1:3900:127.0.0.1:4500 http://127.0.0.1:3900/v1/projects', 'refuse'], ['D8', 'curl --connect-to ::127.0.0.1:4500 http://127.0.0.1:3900/', 'refuse'],
  ['D8', 'curl --resolve example.invalid:4500:127.0.0.1 http://example.invalid:4500/', 'refuse'], ['D8', 'curl --unix-socket /tmp/x.sock http://localhost/', 'refuse'],
  ['D8', 'curl -x 127.0.0.1:4500 http://example.invalid/', 'refuse'], ['D8', 'curl --preproxy 127.0.0.1:4500 http://127.0.0.1:3900/', 'refuse'], ['D8', 'curl --proxy http://127.0.0.1:3900 http://127.0.0.1:3900/', 'refuse'],
  // still allowed (AC-2)
  ['AC-2', 'curl -s http://127.0.0.1:3900/api/status', 'allow'], ['AC-2', 'curl -s --json \'{"a":1}\' http://127.0.0.1:3900/api/x', 'allow'], ['AC-2', 'curl -L http://localhost:3900/', 'allow'],
];
const rows = []; let bad = 0;
for (const [g, cmd, want] of cases) { const got = judge(cmd); const ok = want === 'allow' ? got === 'allow' : got !== 'allow'; if (!ok) bad++; rows.push({ g, cmd, want, got, ok }); console.log(`${ok ? 'OK ' : 'BAD'} [${g}] ${cmd.slice(0, 120)}  → ${got}`); }
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'variations.json'), JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} cases, ${bad} on the wrong side`);
