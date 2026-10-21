#!/usr/bin/env node
// check-harness.mjs — which desks run the current rules package, and which do not.
// Usage: node scripts/check-harness.mjs [workspace]   (default: this script's workspace)
// One line per desk (every <workspace>/<dir>/ai-worker/):
//   current · behind <package version> (desk has <v>) · edited locally: <file> · no .harness
// Plus a `package:` line when harness.json no longer matches the files it hashes.
// Exit 0 = every desk current and the package consistent; exit 1 otherwise. No dependencies.
// Owned by Marie. Origin: MARIE-ORDER-2026-10-12-install-and-check-harness.md (Atlas, operator-approved).

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE_WS = join(dirname(fileURLToPath(import.meta.url)), "..");
const ws = process.argv[2] ? resolve(process.argv[2]) : HERE_WS;
const pkgFile = join(ws, "harness.json");
if (!existsSync(pkgFile)) { console.error(`no harness.json at ${pkgFile}`); process.exit(2); }
const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));

// A hash is a statement about CONTENT; a line ending is a TRANSPORT artefact. CR bytes are stripped
// before hashing so the manifest holds on any machine, any clone and any `core.autocrlf` — the owner
// switches machines constantly (CLAUDE.md). Without this, a Windows checkout (autocrlf=true, no
// .gitattributes) misses every hash: the package reads as drifted and every desk as "edited
// locally". Verified in the sibling workspace, which still has this defect: its own gate there
// reports 8 package files drifted and all 4 desks edited locally, none of which is true.
// Origin: MARIE.md ORDER 25.1 (Atlas, after Marie's ORDER 24 finding). Byte-level filter, so it is
// encoding-agnostic. Keep this identical to the one in install.mjs.
const sha = (p) => createHash("sha256").update(readFileSync(p).filter((b) => b !== 0x0d)).digest("hex");
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const cmpVer = (a, b) => {
  const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

let bad = 0;

// The package itself: harness.json must describe the files it ships.
const pkgDrift = [];
for (const [f, h] of Object.entries(pkg.ruleFiles || {})) {
  const p = join(ws, f);
  if (!existsSync(p)) pkgDrift.push(`${f} missing`);
  else if (sha(p) !== h) pkgDrift.push(`${f} changed without a version bump (now ${sha(p)})`);
}
for (const [f, h] of Object.entries(pkg.sharedTools || {})) {
  const p = join(ws, "_templates", "project", f);
  if (!existsSync(p)) pkgDrift.push(`_templates/project/${f} missing`);
  else if (sha(p) !== h) pkgDrift.push(`_templates/project/${f} changed without a version bump (now ${sha(p)})`);
}
for (const d of pkgDrift) console.log(`package: ${d}`);

// Every desk.
const desks = readdirSync(ws).filter((d) => isDir(join(ws, d, "ai-worker"))).sort();
const width = Math.max(0, ...desks.map((d) => d.length));
for (const d of desks) {
  const aw = join(ws, d, "ai-worker");
  const hf = join(aw, ".harness");
  let state;
  if (!existsSync(hf)) state = "no .harness";
  else {
    let h;
    try { h = JSON.parse(readFileSync(hf, "utf8")); } catch { h = null; }
    if (!h) state = "no .harness (unreadable)";
    else {
      // A shared tool is "edited locally" when it matches neither the package nor what the desk recorded.
      const recorded = h.packageHashes || {};
      const edited = Object.entries(pkg.sharedTools || {})
        .filter(([f, want]) => {
          const p = join(ws, d, f);
          if (!existsSync(p)) return false; // missing is installable, not an edit
          const got = sha(p);
          return got !== want && f in recorded && got !== recorded[f]; // never recorded = new to the package, installable
        })
        .map(([f]) => f);
      const stale = Object.entries(pkg.sharedTools || {})
        .filter(([f, want]) => !existsSync(join(ws, d, f)) || sha(join(ws, d, f)) !== want)
        .map(([f]) => f);
      if (edited.length) state = `edited locally: ${edited.join(", ")}`;
      else if (cmpVer(h.version, pkg.version) !== 0)
        state = `behind ${pkg.version} (desk has ${h.version})`;
      else if (stale.length) state = `behind ${pkg.version} (stale tool: ${stale.join(", ")})`;
      else state = "current";
    }
  }
  if (state !== "current") bad++;
  console.log(`${d.padEnd(width)}  ${state}`);
}
console.log(`harness ${pkg.version}: ${desks.length} desk(s), ${bad ? `${bad} not current` : "all current"}${pkgDrift.length ? " · package inconsistent" : ""}`);
process.exit(bad || pkgDrift.length ? 1 : 0);
