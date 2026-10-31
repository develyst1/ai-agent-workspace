// TEST-109 (REQ-113) — the REAL read-guard hook with the 3rd argument (the server ports), exactly as the runner writes it.
// usage: bun hook-api-cases.mjs <caw-back dir> <scratch dir>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [back, scratch] = process.argv.slice(2);
const proj = path.join(scratch, 'proj'); fs.mkdirSync(proj, { recursive: true });
fs.writeFileSync(path.join(proj, 'h.txt'), 'X-CAW-Actor: operator\n');
const { serverPortsOf } = await import(path.join(back, 'src/runner/config.ts'));
const DEFAULT = serverPortsOf({}, 'http://127.0.0.1:4500', () => {});
const MOVED = serverPortsOf({ BLUEPRINT_URL: 'http://localhost:4210', BLUEPRINT_WEB_URL: 'http://127.0.0.1:3110' }, 'http://127.0.0.1:4510', () => {});
const judge = (command, ports) => {
  const r = spawnSync(process.execPath, ['--no-env-file', path.join(back, 'src/runner/read-guard.ts'), JSON.stringify([proj]), '[]', JSON.stringify(ports)], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: proj }), encoding: 'utf8' });
  return r.status === 0 ? 'allow' : (r.stderr.match(/caw-refused (\w+)/)?.[1] ?? `exit${r.status}`);
};
const J = (o) => `'${JSON.stringify(o)}'`;
const cases = [
  // AC-1: TEST-108 Q1's four calls, verbatim shape
  ['AC-1', `curl -s -X PATCH -H 'X-CAW-Actor: operator' -H 'content-type: application/json' -d ${J({ mode: 'dispatcher', hopBudget: 999 })} http://127.0.0.1:4500/v1/projects/P/mode`, 'refuse', DEFAULT],
  ['AC-1', "curl -s -X POST -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/proposals/X/accept", 'refuse', DEFAULT],
  ['AC-1', `curl -s -X PATCH -H 'X-CAW-Actor: operator' -H 'content-type: application/json' -d ${J({ roots: ['/workspace/caw-workspaces'] })} http://127.0.0.1:4500/v1/projects/P/workspace`, 'refuse', DEFAULT],
  ['AC-1', `curl -s -X POST -H 'X-Blueprint-By: worker' -H 'content-type: application/json' -d ${J({ label: 'v9' })} http://127.0.0.1:4200/v1/projects/P/versions`, 'refuse', DEFAULT],
  ['AC-1', `curl -s -X POST -H 'X-Blueprint-By: x' -H 'content-type: application/json' -d ${J({ cause: { kind: 'operator' }, changes: [] })} http://127.0.0.1:4200/v1/projects/P/change-sets`, 'refuse', DEFAULT],
  // other spellings of the target (port rule)
  ['port', 'curl http://127.0.0.1:4500/v1/projects', 'refuse', DEFAULT],
  ['port', 'curl http://localhost:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://[::1]:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://127.1:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://0.0.0.0:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://127.0.0.2:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://2130706433:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://[::ffff:127.0.0.1]:4500/health', 'refuse', DEFAULT],
  ['port', 'curl 127.0.0.1:4500/health', 'refuse', DEFAULT],
  ['port', 'curl --url http://127.0.0.1:4500/health', 'refuse', DEFAULT],
  ['port', 'curl http://127.0.0.1:4200/v1/projects', 'refuse', DEFAULT],
  ['port', 'curl http://127.0.0.1:3100/', 'refuse', DEFAULT],
  ['port', 'curl -X POST http://127.0.0.1:3500/p/x', 'refuse', DEFAULT],
  ['port', 'wget -qO- http://127.0.0.1:4500/v1/workers', 'refuse', DEFAULT],
  ['port', 'curl http://127.0.0.1:04500/health', 'refuse', DEFAULT],
  // other spellings of the header
  ['header', "curl -H 'x-caw-actor: operator' http://127.0.0.1:3900/", 'refuse', DEFAULT],
  ['header', "curl --header 'X-CAW-Actor: operator' http://127.0.0.1:3900/", 'refuse', DEFAULT],
  ['header', 'curl -H @h.txt http://127.0.0.1:3900/', 'refuse', DEFAULT],
  ['header', "curl -H 'X-Blueprint-By: x' http://127.0.0.1:3900/", 'refuse', DEFAULT],
  ['header', "wget --header='X-CAW-Actor: operator' http://127.0.0.1:3900/", 'refuse', DEFAULT],
  // AC-2: the worker's own ports
  ['AC-2', 'curl -s http://127.0.0.1:3900/api/status', 'allow', DEFAULT],
  ['AC-2', 'curl -I http://localhost:3900/', 'allow', DEFAULT],
  ['AC-2', 'curl http://localhost:5173/', 'allow', DEFAULT],
  // AC-3: ports moved by env (CAW API 4510, Blueprint API localhost:4210, Blueprint web 3110)
  ['AC-3', 'curl http://127.0.0.1:4510/v1/projects', 'refuse', MOVED],
  ['AC-3', 'curl http://localhost:4510/v1/projects', 'refuse', MOVED],
  ['AC-3', 'curl http://127.0.0.1:4210/v1/projects', 'refuse', MOVED],
  ['AC-3', 'curl http://localhost:4210/v1/projects', 'refuse', MOVED],
  ['AC-3', 'curl http://127.0.0.1:3110/', 'refuse', MOVED],
  ['AC-3', 'curl http://127.0.0.1:4500/health', 'allow', MOVED],
];
console.log('runner ports, default:', JSON.stringify(DEFAULT), '· moved:', JSON.stringify(MOVED));
const rows = []; let bad = 0;
for (const [g, cmd, want, ports] of cases) {
  const got = judge(cmd, ports);
  const ok = want === 'allow' ? got === 'allow' : got !== 'allow';
  if (!ok) bad++;
  rows.push({ g, cmd, want, got, ok });
  console.log(`${ok ? 'OK ' : 'BAD'} [${g}] ${cmd.slice(0, 110)}  → ${got}`);
}
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'hook-api-cases.json'), JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} cases, ${bad} on the wrong side`);
