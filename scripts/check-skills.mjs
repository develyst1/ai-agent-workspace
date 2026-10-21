#!/usr/bin/env node
// check-skills.mjs — generic skills name no person, no desk, no project.
// Usage: node scripts/check-skills.mjs [skills-dir] [template-dir]
//   (defaults: <workspace>/.claude/skills and <workspace>/_templates/project)
// Exit 0 = PASS, exit 1 = FAIL (either target). No dependencies.
//
// ⚠️ IN THIS WORKSPACE THE DEFAULT SKILLS PATH DOES NOT EXIST — pass the path:
//     node scripts/check-skills.mjs _templates/skills _templates/project
//   `.claude/skills/` is where the sibling workspace keeps them; here the shared skills live in
//   `_templates/skills/` (role-ba/be/fe/pm/qa/sa, workforce-protocol, desk, nudge-session,
//   rat-semantic-keys). Run bare, this script prints `no skills dir at …` and **exits 2** — it
//   fails loudly, which is correct; it does not silently pass. (Marie first reported the bare run
//   as a false PASS in the ORDER 24 report; that was a MEASUREMENT ERROR — `$?` was read after a
//   `| tail` pipe, so it showed tail's status, not node's. Re-measured 2026-10-21: exit 2.
//   ORDER 25.4's instruction to flag this to the owner as a defect is therefore WITHDRAWN —
//   there is nothing to fix here or in the sibling workspace.)
//
// ⚠️ ONE PART OF THIS CHECK IS CURRENTLY INERT, by data and not by code: the roster check reads
//   every desk's `ai-worker/TEAMS.md`, and no desk in this workspace has one yet (only
//   `_templates/project` does, as of ORDER 24). It therefore reports `0 roster names` and cannot
//   catch a person's name inside a skill — the very thing it exists for. It starts working the
//   moment desks get a TEAMS.md, which is a per-desk PM operation (MARIE.md ORDER 25.2's limit).
// Owned by Marie. Origin: MARIE-ORDER-2026-10-12-skill-name-check.md (Atlas) — the operator found
// worker names inside nudge-session; the prose rule "a skill never names a person, project or chain"
// (ATLAS.md 2026-10-05) was broken in 11 places.
//
// Checks, for every .claude/skills/<name>/ except PROJECT_SKILLS:
//   - SKILL.md and references/**/*.md contain no roster name (read from every desk's
//     ai-worker/TEAMS.md), no desk folder name, and no EXTRA_FORBIDDEN word;
//   - frontmatter `name:` equals the folder name;
//   - a double-quoted frontmatter `description:` has no unescaped `"` inside it.
// Second target, every file under _templates/project/ (what install.mjs copies into a new desk):
//   no roster name (same name source). Desk names are not checked there. Origin:
//   MARIE-ORDER-2026-10-12-template-without-names.md — names are the operator's, set at desk-open.
// Roster names match case-sensitively as whole words (some roster names are also English words;
// the lowercase word is not a person). Desk and project names match case-insensitively.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Project skills: allowed to name their own project. Add a skill here only with Atlas's go.
const PROJECT_SKILLS = ["rat-semantic-keys"];
// Forbidden words that are neither a roster name nor a current desk folder.
const EXTRA_FORBIDDEN = ["smart-scheduler"];

const WS = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = process.argv[2] ? resolve(process.argv[2]) : join(WS, ".claude", "skills");
if (!existsSync(skillsDir)) { console.error(`no skills dir at ${skillsDir}`); process.exit(2); }
const templateDir = process.argv[3] ? resolve(process.argv[3]) : join(WS, "_templates", "project");
if (!existsSync(templateDir)) { console.error(`no template dir at ${templateDir}`); process.exit(2); }

const NL = /\r?\n/;
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// --- desks and their rosters -------------------------------------------------
const desks = readdirSync(WS).filter((d) => isDir(join(WS, d)) && isDir(join(WS, d, "ai-worker")));
const people = new Set();
const rosterSources = [];
for (const d of desks) {
  const f = join(WS, d, "ai-worker", "TEAMS.md");
  if (!existsSync(f)) continue;
  rosterSources.push(relative(WS, f));
  let header = null;
  for (const line of readFileSync(f, "utf8").split(NL)) {
    const t = line.trim();
    // e.g. "**PM: <Name> (one). QA: <Name> (one).**"
    for (const m of t.matchAll(/\b(?:PM|QA|SA|FE|BE|BA):\s*([A-Z][A-Za-z]+)/g)) people.add(m[1]);
    if (!t.startsWith("|")) { header = null; continue; }
    const cells = t.slice(1, t.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
    if (!header) { header = cells; continue; }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
    const h0 = header[0].toLowerCase();
    if (h0 === "person" || h0 === "name") add(cells[0]);      // per-person table: column 1
    else if (h0 === "team") cells.slice(1).forEach(add);      // roster grid: every role column
  }
}
function add(cell) {
  const name = cell.replace(/[`*_]/g, "").trim();
  if (/^[A-Z][A-Za-z]+$/.test(name)) people.add(name);
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rules = [
  ...[...people].map((n) => ({ kind: "person", word: n, re: new RegExp(`(?<![A-Za-z0-9])${esc(n)}(?![A-Za-z0-9])`, "g") })),
  ...[...desks, ...EXTRA_FORBIDDEN].map((n) => ({ kind: desks.includes(n) ? "desk" : "project", word: n, re: new RegExp(`(?<![A-Za-z0-9-])${esc(n)}(?![A-Za-z0-9-])`, "gi") })),
];

// --- scan ---------------------------------------------------------------------
const hits = [];
function walk(dir, out) {
  if (!isDir(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (isDir(p)) walk(p, out);
    else if (e.endsWith(".md")) out.push(p);
  }
  return out;
}

const skills = readdirSync(skillsDir).filter((d) => isDir(join(skillsDir, d)) && !PROJECT_SKILLS.includes(d));
let filesScanned = 0;
for (const skill of skills) {
  const root = join(skillsDir, skill);
  const skillMd = join(root, "SKILL.md");
  const files = [...(existsSync(skillMd) ? [skillMd] : []), ...walk(join(root, "references"), [])];
  if (!existsSync(skillMd)) hits.push(`${rel(root)}: missing SKILL.md`);
  for (const f of files) {
    filesScanned++;
    const lines = readFileSync(f, "utf8").split(NL);
    lines.forEach((line, i) => {
      for (const r of rules) for (const m of line.matchAll(r.re)) hits.push(`${rel(f)}:${i + 1}: ${r.kind} "${m[0]}"`);
    });
    if (f === skillMd) checkFrontmatter(f, lines, skill);
  }
}

function checkFrontmatter(f, lines, folder) {
  if (lines[0].trim() !== "---") { hits.push(`${rel(f)}:1: no frontmatter`); return; }
  const end = lines.indexOf("---", 1);
  let sawName = false;
  for (let i = 1; i < (end < 0 ? lines.length : end); i++) {
    const m = lines[i].match(/^(name|description):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    const v = raw.trim();
    if (key === "name") {
      sawName = true;
      const name = v.replace(/^["']|["']$/g, "");
      if (name !== folder) hits.push(`${rel(f)}:${i + 1}: name "${name}" differs from folder "${folder}"`);
    } else if (v.startsWith('"')) {
      const body = v.slice(1);
      const closes = /(?<!\\)(?:\\\\)*"$/.test(body);
      const inner = closes ? body.slice(0, -1) : body;
      const bad = inner.match(/(?<!\\)(?:\\\\)*"/);
      if (!closes) hits.push(`${rel(f)}:${i + 1}: description opens with " but does not close it on this line`);
      else if (bad) hits.push(`${rel(f)}:${i + 1}: unescaped " inside description: ...${inner.slice(Math.max(0, bad.index - 20), bad.index + 20)}...`);
    }
  }
  if (!sawName) hits.push(`${rel(f)}: frontmatter has no name:`);
}

function rel(p) { const r = relative(process.cwd(), p); return !r || r.startsWith("..") ? p : r; }

// --- second target: the desk template -----------------------------------------
const tplHits = [];
const personRules = rules.filter((r) => r.kind === "person");
function walkAll(dir, out) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (isDir(p)) walkAll(p, out);
    else out.push(p);
  }
  return out;
}
const tplFiles = walkAll(templateDir, []);
for (const f of tplFiles) {
  readFileSync(f, "utf8").split(NL).forEach((line, i) => {
    for (const r of personRules) for (const m of line.matchAll(r.re)) tplHits.push(`${rel(f)}:${i + 1}: person "${m[0]}"`);
  });
}

const verdict = (h) => (h.length ? `FAIL (${h.length} hit${h.length > 1 ? "s" : ""})` : "PASS");
console.log(`check-skills: ${skills.length} skills, ${filesScanned} files under ${rel(skillsDir)} (skipped project skills: ${PROJECT_SKILLS.join(", ")})`);
console.log(`  forbidden: ${people.size} roster names from ${rosterSources.join(", ") || "NO TEAMS.md FOUND"}; desks: ${desks.join(", ")}; extra: ${EXTRA_FORBIDDEN.join(", ")}`);
for (const h of hits) console.log(h);
console.log(`skills: ${verdict(hits)}`);
console.log(`template: ${tplFiles.length} files under ${rel(templateDir)} (roster names only)`);
for (const h of tplHits) console.log(h);
console.log(`template: ${verdict(tplHits)}`);
const all = [...hits, ...tplHits];
console.log(`RESULT: ${verdict(all)}`);
process.exit(all.length ? 1 : 0);
