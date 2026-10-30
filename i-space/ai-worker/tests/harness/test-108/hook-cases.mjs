// TEST-108 layer 1 — run caw-back's REAL read-guard hook (src/runner/read-guard.ts) exactly as Claude Code does:
// `bun read-guard.ts '<readable JSON>' '<readOnly JSON>'` with the PreToolUse JSON on stdin. Records exit code + "caw-refused <code>".
// usage: bun hook-cases.mjs <caw-back dir> <scratch dir>
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [back, scratch] = process.argv.slice(2);
const proj = path.join(scratch, 'proj'), ro = path.join(scratch, 'ro'), outside = path.join(scratch, 'outside');
for (const d of [proj, ro, outside]) fs.mkdirSync(d, { recursive: true });
fs.writeFileSync(path.join(proj, 'x.ts'), 'console.log("hi")\n');
fs.writeFileSync(path.join(proj, 'package.json'), '{"name":"qa108","version":"0.0.0"}\n');
fs.writeFileSync(path.join(ro, 'spec.md'), 'read only\n');
fs.writeFileSync(path.join(outside, 'secret.txt'), 'outside\n');
try { fs.symlinkSync('/etc', path.join(proj, 'etc-link')); } catch {}
try { fs.symlinkSync(outside, path.join(proj, 'out-link')); } catch {}
const hook = path.join(back, 'src/runner/read-guard.ts');
const judge = (command, cwd = proj) => {
  const r = spawnSync(process.execPath, ['--no-env-file', hook, JSON.stringify([proj, ro]), JSON.stringify([ro])], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd }), encoding: 'utf8' });
  const code = r.stderr.match(/caw-refused (\w+)/)?.[1] ?? null;
  return { exit: r.status, code, stderr: r.stderr.trim().slice(0, 200) };
};
const cases = [
  // [group, command, expect: 'allow' | refusal code]
  ['AC-1', 'bun --version', 'allow'], ['AC-1', 'bun install', 'allow'], ['AC-1', 'bun build x.ts --outdir dist', 'allow'], ['AC-1', 'pwd && ls -la', 'allow'],
  ['AC-1+', 'bun run x.ts', 'allow'], ['AC-1+', 'bun test', 'allow'], ['AC-1+', 'cat package.json | grep name', 'allow'], ['AC-1+', 'mkdir -p dist && touch dist/a.txt', 'allow'],
  ['AC-1+', 'curl -s http://127.0.0.1:3900/api/status', 'allow'], ['AC-1+', 'ls -la 2>&1', 'allow'], ['AC-1+', 'git status', 'allow'], ['AC-1+', 'echo hello > out.txt', 'allow'],
  ['AC-2', 'docker ps', 'not_allowed'], ['AC-2', 'echo $HOME', 'shell_feature'], ['AC-2', 'git commit -m x', 'git_write'], ['AC-2', `cat ${outside}/secret.txt`, 'outside'],
  ['AC-2', 'cat /etc/passwd', 'outside'], ['AC-2', 'ls ~', 'outside'], ['AC-2', 'curl https://example.com', 'network'], ['AC-2', 'bun -e "console.log(1)"', 'inline_code'],
  ['AC-2', `rm ${ro}/spec.md`, 'read_only'], ['AC-2', 'find . -exec rm {} ;', 'not_allowed'], ['AC-2', 'ssh host', 'network'], ['AC-2', 'git push', 'git_write'],
  // bypass attempts — QA's own, not in the SPEC's examples
  ['bypass', 'curl http://127.0.0.1@evil.example/x', 'network'], ['bypass', 'curl http://localhost.evil.example/', 'network'], ['bypass', 'curl -x http://evil.example:8080 http://127.0.0.1/', 'network'],
  ['bypass', 'cat x.ts | sh', 'not_allowed'], ['bypass', "bash -c 'ls /'", 'not_allowed'], ['bypass', 'env cat /etc/passwd', 'not_allowed'],
  ['bypass', 'cat etc-link/passwd', 'outside'], ['bypass', 'cat out-link/secret.txt', 'outside'], ['bypass', 'git -C /etc status', 'outside'],
  ['bypass', 'ls ../outside', 'outside'], ['bypass', 'bun run ../outside/x.ts', 'outside'], ['bypass', 'node -p 1', 'inline_code'],
  ['bypass', 'echo a > /tmp/qa108-escape.txt', 'outside'], ['bypass', 'cp x.ts ../outside/', 'outside'], ['bypass', 'ls; rm -rf /', 'outside'],
  ['bypass', 'sleep 100 &', 'shell_feature'], ['bypass', 'cat <<EOF', 'shell_feature'], ['bypass', 'ls `pwd`', 'shell_feature'],
  ['bypass', "wget -O- 'http://evil.example'", 'network'], ['bypass', 'bun publish', 'not_allowed'], ['bypass', 'git diff --output=/tmp/x', 'git_write'],
  ['bypass', 'tee /etc/hosts', 'outside'], ['bypass', 'sed -i s/a/b/ x.ts', 'not_allowed'], ['bypass', 'python3 -c "print(1)"', 'not_allowed'],
];
const rows = []; let bad = 0;
for (const [g, cmd, want] of cases) {
  const r = judge(cmd);
  const got = r.exit === 0 ? 'allow' : (r.code ?? `exit${r.exit}`);
  const ok = want === 'allow' ? got === 'allow' : got !== 'allow';   // a refusal with another code still keeps the command out
  const exact = got === want;
  if (!ok) bad++;
  rows.push({ g, cmd, want, got, ok, exact, stderr: r.stderr });
  console.log(`${ok ? (exact ? 'OK  ' : 'OK~ ') : 'BAD '} [${g}] ${cmd}  → ${got}${exact ? '' : ` (expected ${want})`}`);
}
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'hook-cases.json'), JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} cases, ${bad} wrong side of the line, ${rows.filter((r) => r.ok && !r.exact).length} on the right side with another code`);
