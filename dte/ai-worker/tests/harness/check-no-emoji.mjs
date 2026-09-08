#!/usr/bin/env node
// check-no-emoji.mjs — REQ-001 requirement 3 / SPEC-001 "The no-emoji check".
//
// Usage:  node check-no-emoji.mjs <path-to-scan>
//   <path-to-scan> is a directory (scanned recursively) or a single file.
//
// Scans .ts/.tsx/.js/.jsx, skipping node_modules and .next.
// Exits 1 if any flagged character is found, 0 otherwise.
// No dependencies: plain Node ESM, node:fs only. Runs without npm install.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const SKIP_DIRS = new Set(["node_modules", ".next"]);

// SPEC-001's stated scope: the emoji ranges, plus four text glyphs that the
// SPEC counts as icon usage by another name (-> <- check cross).
const RANGES = [
  [0x1f000, 0x1faff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
];
const EXTRA = new Set([
  0xfe0f, // variation selector-16
  0x2192, // ->
  0x2190, // <-
  0x2713, // check
  0x2715, // cross
]);

function isFlagged(cp) {
  if (EXTRA.has(cp)) return true;
  return RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
}

function collectFiles(target) {
  const st = statSync(target);
  if (st.isFile()) {
    return EXTENSIONS.some((e) => target.endsWith(e)) ? [target] : [];
  }
  const out = [];
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...collectFiles(join(target, entry.name)));
    } else if (EXTENSIONS.some((e) => entry.name.endsWith(e))) {
      out.push(join(target, entry.name));
    }
  }
  return out;
}

function hex(cp) {
  return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
}

const target = process.argv[2];
if (!target) {
  console.error("usage: node check-no-emoji.mjs <path-to-scan>");
  process.exit(2);
}

let files;
try {
  files = collectFiles(target);
} catch (err) {
  console.error(`cannot scan ${target}: ${err.message}`);
  process.exit(2);
}

let hits = 0;
for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    // Iterate by code point so surrogate pairs are one character, and count
    // the column in code points too.
    let col = 0;
    for (const ch of line) {
      col += 1;
      const cp = ch.codePointAt(0);
      if (isFlagged(cp)) {
        hits += 1;
        console.log(`${file}:${i + 1}:${col}  ${ch}  ${hex(cp)}`);
      }
    }
  });
}

if (hits > 0) {
  console.log(`\n${hits} occurrence(s) in ${files.length} file(s) scanned.`);
  process.exit(1);
}
console.log(`OK — 0 emoji in ${files.length} files scanned`);
process.exit(0);
