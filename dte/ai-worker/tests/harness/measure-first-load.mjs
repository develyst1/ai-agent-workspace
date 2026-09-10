#!/usr/bin/env node
// measure-first-load.mjs — TASK-019 / SPEC-001 "Decision 6" measuring instrument.
//
// Usage:  node measure-first-load.mjs <path-to-front> <label>
//
// Reads <front>/.next/diagnostics/route-bundle-stats.json (where Next 16 +
// Turbopack keeps First Load JS now that the build prints no size table) and,
// per route, sums the on-disk bytes of its de-duplicated chunk list raw, gzip
// (level 9) and Brotli (Node default quality). Each chunk is compressed
// INDIVIDUALLY and the results summed — that is how they are served, one
// request each.
//
// Fails loudly (exit 1, naming the file) if any listed chunk is missing from
// disk: a missing chunk means the .next being measured does not belong to the
// build that was just run, and a silent zero there is exactly how TASK-003 lost
// its BEFORE measurement.
//
// Throwaway verification script. No dependencies: plain Node ESM, node: only.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, brotliCompressSync } from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));

const frontArg = process.argv[2];
const label = process.argv[3];
if (!frontArg || !label) {
  console.error("usage: node measure-first-load.mjs <path-to-front> <label>");
  process.exit(2);
}
const front = resolve(frontArg);
const statsPath = join(front, ".next", "diagnostics", "route-bundle-stats.json");

if (!existsSync(statsPath)) {
  console.error(`ERROR: stats file not found: ${statsPath}`);
  console.error("The build did not run, or .next was removed after it.");
  process.exit(1);
}

const stats = JSON.parse(readFileSync(statsPath, "utf8"));
if (!Array.isArray(stats)) {
  console.error(`ERROR: ${statsPath} is not an array`);
  process.exit(1);
}

// The JSON stores Windows path separators (".next\\static\\chunks\\x.js").
// Normalise every backslash to "/" before resolving relative to <front>, so the
// same script works whichever separator the build wrote.
const normalise = (p) => p.replace(/\\/g, "/");

const missing = [];
const rows = [];

for (const entry of stats) {
  const route = entry.route;
  const declared = entry.firstLoadUncompressedJsBytes ?? null;
  const chunks = [...new Set((entry.firstLoadChunkPaths ?? []).map(normalise))];

  let raw = 0;
  let gzip = 0;
  let brotli = 0;

  for (const rel of chunks) {
    const abs = resolve(front, rel);
    if (!existsSync(abs)) {
      missing.push(`${route}: ${abs}`);
      continue;
    }
    const buf = readFileSync(abs);
    raw += buf.length;
    gzip += gzipSync(buf, { level: 9 }).length;
    brotli += brotliCompressSync(buf).length;
  }

  rows.push({ route, chunkCount: chunks.length, raw, gzip, brotli, declared });
}

if (missing.length) {
  console.error(`ERROR: ${missing.length} chunk file(s) listed in ${statsPath} are missing from disk:`);
  for (const m of missing) console.error(`  ${m}`);
  console.error("The .next being measured does not belong to the build just run.");
  process.exit(1);
}

rows.sort((a, b) => a.route.localeCompare(b.route));

const kb = (n) => (n / 1000).toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

console.log(`label: ${label}   node: ${process.version}   front: ${front}`);
console.log(`stats: ${statsPath}   routes: ${rows.length}`);
console.log("");
console.log(
  pad("route", 24) + rpad("chunks", 7) + rpad("raw", 12) + rpad("gzip", 12) +
  rpad("brotli", 12) + rpad("declared", 12) + "  note"
);
console.log("-".repeat(93));
for (const r of rows) {
  const note = r.declared === null
    ? "no declared value"
    : r.declared === r.raw
      ? "raw == declared"
      : `MISMATCH raw-declared = ${r.raw - r.declared}`;
  console.log(
    pad(r.route, 24) + rpad(r.chunkCount, 7) + rpad(`${kb(r.raw)} kB`, 12) +
    rpad(`${kb(r.gzip)} kB`, 12) + rpad(`${kb(r.brotli)} kB`, 12) +
    rpad(r.declared === null ? "-" : `${kb(r.declared)} kB`, 12) + "  " + note
  );
}

const out = join(HERE, `first-load-${label}.json`);
writeFileSync(
  out,
  JSON.stringify(
    {
      label,
      node: process.version,
      front,
      statsPath,
      generatedAt: new Date().toISOString(),
      gzipLevel: 9,
      brotliQuality: "node default",
      routes: rows,
    },
    null,
    2
  ) + "\n"
);
console.log("");
console.log(`written: ${out}`);
process.exit(0);
