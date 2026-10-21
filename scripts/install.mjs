#!/usr/bin/env node
// install.mjs — install or update the rules package on one desk.
// Usage: node scripts/install.mjs <desk-dir>
//   new folder (no ai-worker/)  → copy _templates/project/ai-worker, then write ai-worker/.harness
//   existing desk               → replace only the shared tools whose hash differs from harness.json
//                                 (old copy backed up under ai-worker/archive/), then rewrite .harness.
//                                 Desk-owned files are never touched.
// Refuses, writing nothing, when a desk's shared tool matches neither harness.json nor the hash the
// desk's .harness recorded (edited locally), or when the template no longer matches harness.json.
// Exit 0 = installed, 1 = refused, 2 = usage. No dependencies.
// Owned by Marie. Origin: MARIE-ORDER-2026-10-12-install-and-check-harness.md (Atlas, operator-approved).

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, copyFileSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const WS = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(WS, "_templates", "project");
if (!process.argv[2]) { console.error("usage: node scripts/install.mjs <desk-dir>"); process.exit(2); }
const desk = resolve(process.argv[2]);
const pkg = JSON.parse(readFileSync(join(WS, "harness.json"), "utf8"));

// A hash is a statement about CONTENT; a line ending is a TRANSPORT artefact. CR bytes are stripped
// before hashing so the manifest holds on any machine, any clone and any `core.autocrlf` — the owner
// switches machines constantly (CLAUDE.md). Without this, a Windows checkout (autocrlf=true, no
// .gitattributes) misses every hash: the package reads as drifted and every desk as "edited
// locally", and install.mjs refuses everywhere, writing nothing. Verified: ROLES.md hashes
// fd62e5a5… as checked out here and 315e66f7… with CR stripped — the shipped manifest value exactly.
// Origin: MARIE.md ORDER 25.1 (Atlas, after Marie's ORDER 24 finding). Byte-level filter, so it is
// encoding-agnostic. Keep this identical to the one in check-harness.mjs.
const sha = (p) => createHash("sha256").update(readFileSync(p).filter((b) => b !== 0x0d)).digest("hex");
const d = new Date();
const p2 = (n) => String(n).padStart(2, "0");
const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; // LOCAL date
const refuse = (msg) => { console.error(`REFUSED: ${msg}\nNothing written.`); process.exit(1); };

// The package must be consistent before it is installed anywhere.
for (const [f, h] of Object.entries(pkg.sharedTools)) {
  const p = join(TEMPLATE, f);
  if (!existsSync(p) || sha(p) !== h) refuse(`_templates/project/${f} does not match harness.json — fix the package first`);
}
for (const [f, h] of Object.entries(pkg.ruleFiles)) {
  const p = join(WS, f);
  if (!existsSync(p) || sha(p) !== h) refuse(`${f} does not match harness.json — fix the package first`);
}

const aw = join(desk, "ai-worker");
const hf = join(aw, ".harness");
const writeHarness = () => {
  const out = {
    harness: pkg.harness,
    version: pkg.version,
    installedAt: today,
    packageHashes: { ...pkg.sharedTools, ...pkg.ruleFiles },
  };
  writeFileSync(hf, JSON.stringify(out, null, 2) + "\n");
  console.log(`wrote ${basename(desk)}/ai-worker/.harness (${pkg.version}, ${today})`);
};

if (!existsSync(aw)) {
  // New desk.
  mkdirSync(desk, { recursive: true });
  cpSync(join(TEMPLATE, "ai-worker"), aw, { recursive: true });
  console.log(`new desk: copied _templates/project/ai-worker → ${basename(desk)}/ai-worker`);
  writeHarness();
  process.exit(0);
}

// Existing desk: decide everything first, write only after nothing is refused.
let recorded = {};
if (existsSync(hf)) {
  try { recorded = JSON.parse(readFileSync(hf, "utf8")).packageHashes || {}; }
  catch { refuse(`${basename(desk)}/ai-worker/.harness is not valid JSON`); }
}
const plan = [];
for (const [f, want] of Object.entries(pkg.sharedTools)) {
  const p = join(desk, f);
  if (!existsSync(p)) { plan.push({ f, backup: false }); continue; }
  const got = sha(p);
  if (got === want) continue;
  // A tool new to the package (the desk's .harness never recorded it) is adopted: backed up, then replaced.
  if (f in recorded && got !== recorded[f]) refuse(`${basename(desk)}/${f} was edited locally (sha256 ${got} matches neither harness.json nor the desk's .harness)`);
  plan.push({ f, backup: true });
}
for (const { f, backup } of plan) {
  const p = join(desk, f);
  if (backup) {
    const bak = join(aw, "archive", `${basename(f)}.before-${pkg.version}.${today}`);
    mkdirSync(dirname(bak), { recursive: true });
    copyFileSync(p, bak);
    console.log(`backed up ${f} → ai-worker/archive/${basename(bak)}`);
  }
  mkdirSync(dirname(p), { recursive: true });
  copyFileSync(join(TEMPLATE, f), p);
  console.log(`updated ${f}`);
}
if (!plan.length) console.log("shared tools already current — none touched");
writeHarness();
