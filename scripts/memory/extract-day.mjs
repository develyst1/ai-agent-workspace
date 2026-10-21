#!/usr/bin/env node
// extract-day.mjs <desk> <YYYY-MM-DD>
// Turns one local day of this machine's Claude Code transcripts into a per-desk digest:
//   <desk>/ai-worker/memory/digest/<date>.md   (git-ignored — chat text stays on this machine)
// Keeps: the operator's typed messages, the role's text replies, cross-session messages in and out,
// AskUserQuestion questions/answers. Drops tool calls, tool results, system reminders, thinking.
// Which desk/role a transcript belongs to: its `/desk <desk> <Name>` invocation (latest one before
// each entry), else the role's identity line `I am <Name> · <ROLE>` at the start of a reply, matched
// against <desk>/ai-worker/TEAMS.md and confirmed by the session naming that desk's ai-worker path
// more than any other desk's. Unknown → skipped.
// Design: BUNNY-DESIGN-2026-10-20.md §5.3. Node built-ins only.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// Transcript folder name = the workspace path with every non-alphanumeric turned into '-'.
// Was `'-' + ROOT.replace(…).replace(/^-/, '')` — the strip binds to ROOT.replace(…), which can
// never start with '-', so the prepended '-' always survived and the path never existed.
// Measured 2026-10-21: computed `-H--ai-agent-workplace-ai-agent-workspace` (absent) against the
// real `H--ai-agent-workplace-ai-agent-workspace`. A POSIX root still yields its own leading '-'
// from the first '/', which is the convention, so no prefix is needed on either platform.
// ⚠️ The sibling workspace `ai-agent-workspace-entronica` still carries the original line.
const TRANSCRIPTS = process.env.MEMORY_TRANSCRIPTS
  || path.join(os.homedir(), '.claude', 'projects', ROOT.replace(/[^A-Za-z0-9]/g, '-'));
const CUT = 600;          // a long reply keeps its first 600 characters
const CUT_OPERATOR = 2000; // the operator's own words are kept longer (pastes can be huge)

const [desk, date] = process.argv.slice(2);
if (!desk || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
  console.error('usage: node scripts/memory/extract-day.mjs <desk> <YYYY-MM-DD>');
  process.exit(2);
}
const deskDir = path.join(ROOT, desk, 'ai-worker');
const teamsFile = path.join(deskDir, 'TEAMS.md');
if (!fs.existsSync(teamsFile)) { console.error(`no ${path.relative(ROOT, teamsFile)} — cannot tell roles apart`); process.exit(2); }

// Roster: "| Porter | PM · all | ..." rows → name (lower) → { name, role }
const roster = new Map();
for (const line of fs.readFileSync(teamsFile, 'utf8').split('\n')) {
  const m = line.match(/^\|\s*([A-Z][A-Za-z]+)\s*\|\s*([A-Z]{2,})\s*·\s*([A-Za-z]+)/);
  if (m) roster.set(m[1].toLowerCase(), { name: m[1], role: m[2], team: m[3].toUpperCase() });
}
if (!roster.size) { console.error(`no roster rows found in ${path.relative(ROOT, teamsFile)}`); process.exit(2); }

const desks = fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'ai-worker')));
const dayStart = new Date(`${date}T00:00:00`); // local time
const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
const pad = n => String(n).padStart(2, '0');
const localDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function clean(text, cut) {
  let t = String(text)
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/\s*\n\s*/g, ' ↵ ')
    .replace(/[ \t]+/g, ' ')
    .trim();
  const chars = Array.from(t);
  if (chars.length > cut) t = chars.slice(0, cut).join('') + ' …';
  return t;
}
const textsOf = content => typeof content === 'string' ? [content]
  : Array.isArray(content) ? content.filter(x => x && x.type === 'text').map(x => x.text) : [];

// /desk args → { desk, who } (who may be null if no roster name is in the args)
function parseDesk(text) {
  const m = text.match(/<command-name>\/desk<\/command-name>\s*<command-args>([\s\S]*?)<\/command-args>/);
  if (!m) return null;
  const words = m[1].trim().split(/\s+/);
  const d = words[0];
  if (d !== desk) return { desk: d, who: null };
  for (const w of words.slice(1)) { const r = roster.get(w.toLowerCase()); if (r) return { desk: d, who: r }; }
  return { desk: d, who: null };
}

async function readSession(file) {
  const session = path.basename(file);
  let state = null;          // latest /desk: { desk, who } or null
  let identity = null;       // first "I am <Name> · <ROLE>" from a reply
  let starterId = null;      // identity from the OPERATOR's opening message — outranks replies
  let starterSeen = false;
  const pathCounts = {};
  const entries = [];        // { t, who: state-at-time, line }
  const pendingTools = new Map(); // tool_use id → { kind, t, state, to }
  const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
  for await (const raw of rl) {
    if (!raw) continue;
    for (const d of desks) { const k = `${d}/ai-worker`; if (raw.includes(k)) pathCounts[d] = (pathCounts[d] || 0) + 1; }
    let o; try { o = JSON.parse(raw); } catch { continue; }
    if (o.isSidechain || (o.type !== 'user' && o.type !== 'assistant')) continue;
    const t = o.timestamp ? new Date(o.timestamp) : null;
    const content = o.message?.content;
    const inDay = t && t >= dayStart && t < dayEnd;

    if (o.type === 'user') {
      const kind = o.origin?.kind;
      // A session continued after compaction opens with a summary (no origin) instead of the
      // starter. The summary still names the role — "You are Fern…", "Sober, the SA Lead…",
      // "Porter**, PM/BA/PO ONLY…". Accept only that appositive shape — `<Name>, [the] <own role>`
      // — so a summary that merely mentions a role ("Silver's SA-B session", in Atlas's own
      // summary) cannot claim the session. Measured 2026-10-22: the looser rule did exactly that.
      if (!starterId && !kind) {
        const text = textsOf(content).join('\n');
        if (text.includes('This session is being continued')) {
          const roleWord = { PM: 'PM', SA: 'SA', FE: 'Frontend|FE', BE: 'Backend|BE', QA: 'Tester|QA' };
          let best = null;
          // The summary's own identity line comes first ("I am **Atlas**…"). If it names someone
          // off the roster, this is not a role's session, whatever role starters it quotes later.
          const self = text.match(/\b(?:You are|I am) \**([A-Z][a-z]+)\b/);
          if (self) {
            const r = roster.get(self[1].toLowerCase());
            if (r) best = { at: self.index, r };
            starterSeen = true;
          }
          if (!self) for (const r of roster.values()) {
            const re = new RegExp(`(You are ${r.name}\\b|\\b${r.name}\\*{0,2}, (?:and ONLY )?(?:the )?(?:${roleWord[r.role] || r.role})\\b)`);
            const hit = re.exec(text);
            if (hit && (best === null || hit.index < best.at)) best = { at: hit.index, r };
          }
          if (best) { starterId = best.r; starterSeen = true; }
        }
      }
      if (kind === 'human' && !o.isMeta) {
        const text = textsOf(content).join('\n');
        const dk = parseDesk(text);
        if (dk) state = dk;
        // The operator's starter says who this session is — the most reliable signal there is,
        // because it is typed by the human, not inferred from what the model happened to say.
        // Two starter shapes are in use here: "You are <Name>, and ONLY…" and
        // "อ่าน <ROLE>[-<team>] Team …". (2026-10-22: a reply-based rule attributed an SA-B
        // session to the PM because her first reply opened by quoting him.)
        if (!starterId && !starterSeen && text.trim()) {
          starterSeen = true;   // only the FIRST thing the operator typed counts as the starter
          const you = text.match(/\bYou are ([A-Z][a-z]+)\b/);
          if (you && roster.get(you[1].toLowerCase())) starterId = roster.get(you[1].toLowerCase());
          const seat = !starterId && text.match(/อ่าน\s*([A-Z]{2,})(?:-([A-Z]))?\s*Team/);
          if (seat) {
            const want = (seat[2] || 'A').toUpperCase();
            const hits = [...roster.values()].filter(r => r.role === seat[1] && (r.team === want || r.team === 'ALL'));
            if (hits.length === 1) starterId = hits[0];   // ambiguous → no guess
          }
        }
        if (inDay && text.trim()) {
          let shown = text;
          const cmd = text.match(/<command-name>([^<]*)<\/command-name>[\s\S]*?<command-args>([\s\S]*?)<\/command-args>/);
          if (cmd) shown = `${cmd[1]} ${cmd[2]}`;
          if (clean(shown, CUT_OPERATOR)) entries.push({ t, st: state, line: `operator: ${clean(shown, CUT_OPERATOR)}` });
        }
      } else if (kind === 'peer' && inDay) {
        const text = textsOf(content).join('\n');
        const re = /<cross-session-message\b([^>]*)>([\s\S]*?)(?:<\/cross-session-message>|$)/g;
        let m, any = false;
        while ((m = re.exec(text))) {
          any = true;
          const from = (m[1].match(/name="([^"]*)"/) || m[1].match(/from="([^"]*)"/) || [, o.origin?.name || '?'])[1];
          entries.push({ t, st: state, line: `← ${from}: ${clean(m[2], CUT)}` });
        }
        if (!any && (o.origin?.body || text.trim())) entries.push({ t, st: state, line: `← ${o.origin?.name || '?'}: ${clean(o.origin?.body || text, CUT)}` });
      }
      if (Array.isArray(content)) for (const x of content) {
        if (x.type !== 'tool_result' || !pendingTools.has(x.tool_use_id)) continue;
        const p = pendingTools.get(x.tool_use_id); pendingTools.delete(x.tool_use_id);
        const res = typeof x.content === 'string' ? x.content : textsOf(x.content).join('\n');
        if (p.kind === 'send') {
          const nm = res.match(/session \S+ \(\\?"([^"\\]+)\\?"\)/);
          p.entry.line = p.entry.line.replace(/^(\S+ → )\S+/, `$1${nm ? nm[1] : p.to}`);
        } else if (p.kind === 'ask') {
          entries.push({ t: t || p.t, st: p.st, line: `operator (answer): ${clean(res, CUT)}` });
        }
      }
    } else { // assistant
      for (const x of Array.isArray(content) ? content : []) {
        if (x.type === 'text') {
          // Two identity openings are accepted: the `desk` skill's "I am <Name> · <ROLE>", and the
          // "<Name> (<ROLE>…)" opening the roles here actually write ("Porter (PM) จบรอบ…",
          // "Silver (SA-B) …"). Added 2026-10-21 after 0 of 16 real transcripts used the first form,
          // so every digest came out empty. Both still require the name to be on the roster WITH
          // that role, so a reply that merely mentions "Porter (PM)" mid-sentence never matches.
          // Reply-based identity is a fallback only, and only the explicit `desk`-skill form. The
          // "<Name> (<ROLE>)" form added 2026-10-21 was REMOVED on 10-22: a role's reply can open
          // by quoting another role ("Porter (PM) said…"), and a wrong attribution is worse than none.
          const id = x.text.match(/^\s*\**I am ([A-Z][a-z]+) · ([A-Z]{2,})/);
          if (id && !identity && roster.get(id[1].toLowerCase())?.role === id[2]) identity = roster.get(id[1].toLowerCase());
          if (inDay && x.text.trim()) entries.push({ t, st: state, line: `{who}: ${clean(x.text, CUT)}` });
        } else if (x.type === 'tool_use' && inDay && x.name === 'SendMessage') {
          const msg = x.input?.message;
          if (typeof msg !== 'string' || !msg.trim()) continue;
          const entry = { t, st: state, line: `{who} → ${x.input?.to || '?'}: ${clean(msg, CUT)}` };
          entries.push(entry);
          pendingTools.set(x.id, { kind: 'send', entry, to: x.input?.to || '?' });
        } else if (x.type === 'tool_use' && inDay && x.name === 'AskUserQuestion') {
          const qs = (x.input?.questions || []).map(q => q.question).filter(Boolean).join(' | ');
          entries.push({ t, st: state, line: `{who} (asks): ${clean(qs, CUT)}` });
          pendingTools.set(x.id, { kind: 'ask', t, st: state });
        }
      }
    }
  }
  // Resolve who each entry belongs to.
  const topDesk = Object.entries(pathCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const who0 = starterId || identity;
  const fallback = who0 && topDesk === desk ? who0 : null;
  const kept = [];
  for (const e of entries) {
    let who;
    if (e.st) who = e.st.desk === desk ? (e.st.who || fallback) : null;
    else who = fallback;
    if (!who) continue;
    kept.push({ ...e, who, line: e.line.replace('{who}', who.name) });
  }
  return { session, kept };
}

const files = fs.readdirSync(TRANSCRIPTS).filter(f => f.endsWith('.jsonl')).map(f => path.join(TRANSCRIPTS, f))
  .filter(f => fs.statSync(f).mtime >= dayStart); // untouched since before the day → nothing from that day

const sections = [];
for (const f of files) {
  const { session, kept } = await readSession(f);
  if (!kept.length) continue;
  // a session can change role mid-way (/desk again) — split by role
  const byRole = new Map();
  for (const e of kept) { const k = `${e.who.name}|${e.who.role}`; if (!byRole.has(k)) byRole.set(k, []); byRole.get(k).push(e); }
  for (const [k, es] of byRole) {
    es.sort((a, b) => a.t - b.t);
    const [name, role] = k.split('|');
    sections.push({ name, role, session, es });
  }
}
sections.sort((a, b) => a.es[0].t - b.es[0].t);

let out = `# Digest — ${desk} — ${date}\n\n` +
  `> Generated by \`scripts/memory/extract-day.mjs\` from this machine's Claude Code transcripts. Git-ignored: chat text\n` +
  `> stays on this machine. Do not edit — re-run the script. Times are local. Long replies cut to ${CUT} characters.\n`;
for (const s of sections) {
  out += `\n## ${s.name} (${s.role}) — ${s.session}\n\n`;
  for (const e of s.es) out += `[${hhmm(e.t)}] ${e.line}\n`;
}
const outDir = path.join(deskDir, 'memory', 'digest');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${date}.md`);
fs.writeFileSync(outFile, out);

console.log(`${path.relative(ROOT, outFile)} — ${Buffer.byteLength(out)} B, ${sections.length} section(s), ${sections.reduce((n, s) => n + s.es.length, 0)} entries`);
for (const s of sections) {
  const c = { operator: 0, reply: 0, xin: 0, xout: 0 };
  for (const e of s.es) {
    if (e.line.startsWith('operator')) c.operator++;
    else if (e.line.startsWith('← ')) c.xin++;
    else if (/^\S+ → /.test(e.line)) c.xout++;
    else c.reply++;
  }
  console.log(`  ${s.name} (${s.role}) ${s.session.slice(0, 8)}: ${s.es.length} entries — operator ${c.operator} · replies ${c.reply} · cross-in ${c.xin} · cross-out ${c.xout}`);
}
