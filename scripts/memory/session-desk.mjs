#!/usr/bin/env node
// session-desk.mjs <session_id> <transcript_path> [prompt]
// Which desk a Claude session belongs to, for the memory-cue hook (scripts/hooks/memory-cue.sh).
// Prints `<desk> <Name> <ROLE>` or nothing. The answer is cached in <root>/.claude/session-desk/<session_id>
// (git-ignored) as that line, or `none`, so a transcript is read at most once per session:
//   1. prompt is `/desk <desk> <Name>` (typed, or the expanded <command-name>/desk</command-name> form)
//      → written at once; ROLE from <desk>/ai-worker/TEAMS.md (`-` when the name is not on the roster).
//   2. cached → the cached answer; a cached `none` older than 60 minutes is re-checked (step 3).
//   3. else the transcript, with extract-day.mjs's rules: the latest `/desk` the operator typed or the
//      `desk` skill opened through the Skill tool (whichever is later), else the
//      first `I am <Name> · <ROLE>` at the start of a reply, valid only when that name/role is on the
//      roster of the desk whose `<desk>/ai-worker` path the session names on the most lines.
//      Nothing found → `none` (Atlas, Marie, Bunny sessions). No transcript yet → nothing, not cached.
// <root> = $MEMORY_ROOT (scratch tests) or the workspace root. Never throws to the caller: any error → no
// output, exit 0. Origin: MARIE-ORDER-2026-10-20-memory-web-full-build.md §1. Node built-ins only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.MEMORY_ROOT
  ? path.resolve(process.env.MEMORY_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [sid, transcript, prompt = ''] = process.argv.slice(2);
const RECHECK_MIN = 60; // a cached `none` is re-read from the transcript after this many minutes

function main() {
  if (!sid || !/^[A-Za-z0-9_-]{1,128}$/.test(sid)) return;
  const cacheDir = path.join(ROOT, '.claude', 'session-desk');
  const cacheFile = path.join(cacheDir, sid);
  const save = line => { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(cacheFile, line + '\n'); };
  const show = line => { if (line && line !== 'none') console.log(line); };

  const isDesk = d => /^[A-Za-z0-9._-]+$/.test(d) && !d.startsWith('.') && fs.existsSync(path.join(ROOT, d, 'ai-worker'));
  const rosterOf = d => {
    const r = new Map();
    const f = path.join(ROOT, d, 'ai-worker', 'TEAMS.md');
    if (!fs.existsSync(f)) return r;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\|\s*([A-Z][A-Za-z]+)\s*\|\s*([A-Z]{2,})\s*·/);
      if (m) r.set(m[1].toLowerCase(), { name: m[1], role: m[2] });
    }
    return r;
  };
  // `/desk` args → answer line, or 'none' for a folder that is not a desk
  const fromDeskArgs = args => {
    const words = args.trim().split(/\s+/).filter(Boolean);
    const d = words[0];
    if (!d || !isDesk(d)) return 'none';
    const roster = rosterOf(d);
    for (const w of words.slice(1)) { const r = roster.get(w.toLowerCase()); if (r) return `${d} ${r.name} ${r.role}`; }
    const name = (words[1] || '-').replace(/[^\p{L}\p{N}_-]/gu, '') || '-';
    return `${d} ${name} -`;
  };
  const deskArgsIn = text => {
    const m = text.match(/<command-name>\/desk<\/command-name>\s*<command-args>([\s\S]*?)<\/command-args>/)
      || text.match(/^\s*\/desk\s+([^\n]+)/);
    return m ? m[1] : null;
  };

  // 1. the prompt itself
  const pa = deskArgsIn(prompt);
  if (pa != null) { const line = fromDeskArgs(pa); save(line); show(line); return; }

  // 2. cache — a desk answer is kept; a `none` older than RECHECK_MIN is looked at again (a role may have
  //    been opened since, e.g. through the Skill tool — Atlas 2026-10-20)
  if (fs.existsSync(cacheFile)) {
    const cached = fs.readFileSync(cacheFile, 'utf8').trim();
    const ageMin = (Date.now() - fs.statSync(cacheFile).mtimeMs) / 60000;
    if (cached !== 'none' || ageMin < RECHECK_MIN) { show(cached); return; }
  }

  // 3. transcript
  if (!transcript || !fs.existsSync(transcript)) return;
  const buf = fs.readFileSync(transcript);
  const lineAt = idx => {
    const s = buf.lastIndexOf(10, idx) + 1;
    let e = buf.indexOf(10, idx); if (e < 0) e = buf.length;
    return { s, e, text: buf.toString('utf8', s, e) };
  };
  const parse = t => { try { return JSON.parse(t); } catch { return null; } };
  const textsOf = c => typeof c === 'string' ? [c] : Array.isArray(c) ? c.filter(x => x && x.type === 'text').map(x => x.text) : [];

  // 3a. the latest /desk: typed by the operator, or the `desk` skill opened through the Skill tool
  const latest = (pat, argsOf) => {
    const P = Buffer.from(pat);
    let at = buf.lastIndexOf(P);
    for (let tries = 0; at >= 0 && tries < 50; tries++) {
      const { s, text } = lineAt(at);
      const o = parse(text);
      const args = o && !o.isSidechain ? argsOf(o) : null;
      if (args != null) return { at, args };
      at = s > 0 ? buf.lastIndexOf(P, s - 1) : -1;
    }
    return null;
  };
  const typed = latest('<command-name>/desk</command-name>', o =>
    o.type === 'user' && !o.isMeta && (o.origin?.kind ?? 'human') === 'human' ? deskArgsIn(textsOf(o.message?.content).join('\n')) : null);
  const viaSkill = latest('"skill":"desk"', o => {
    if (o.type !== 'assistant' || !Array.isArray(o.message?.content)) return null;
    const u = o.message.content.filter(x => x?.type === 'tool_use' && x.name === 'Skill' && x.input?.skill === 'desk').pop();
    return u && typeof u.input.args === 'string' ? u.input.args : null;
  });
  const deskHit = [typed, viaSkill].filter(Boolean).sort((a, b) => b.at - a.at)[0];
  if (deskHit) { const line = fromDeskArgs(deskHit.args); save(line); show(line); return; }

  // 3b. identity line + desk-path majority (lines naming `<desk>/ai-worker`)
  const desks = fs.readdirSync(ROOT).filter(isDesk);
  let top = null, topN = 0;
  for (const d of desks) {
    const pat = Buffer.from(`${d}/ai-worker`);
    let n = 0, i = buf.indexOf(pat);
    while (i >= 0) { n++; const nl = buf.indexOf(10, i); if (nl < 0) break; i = buf.indexOf(pat, nl + 1); }
    if (n > topN) { top = d; topN = n; }
  }
  let identity = null;
  const topRoster = top ? rosterOf(top) : new Map();
  if (top) {
    const IAM = Buffer.from('I am ');
    let i = buf.indexOf(IAM);
    for (let tries = 0; i >= 0 && tries < 300 && !identity; tries++) {
      const { e, text } = lineAt(i);
      const o = parse(text);
      if (o && o.type === 'assistant' && !o.isSidechain && Array.isArray(o.message?.content)) {
        for (const x of o.message.content) {
          const m = x?.type === 'text' && x.text.match(/^\s*\**I am ([A-Z][a-z]+) · ([A-Z]{2,})/);
          const r = m && topRoster.get(m[1].toLowerCase());
          if (r && r.role === m[2]) { identity = r; break; }
        }
      }
      i = buf.indexOf(IAM, e + 1);
    }
  }
  const line = identity ? `${top} ${identity.name} ${identity.role}` : 'none';
  save(line); show(line);
}

try { main(); } catch { /* a hook helper must never fail its caller */ }
process.exit(0);
