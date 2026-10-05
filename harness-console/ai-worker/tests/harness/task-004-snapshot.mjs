// TASK-004 evidence harness (Fern, 2026-10-05) — throwaway, NOT product code. Reads only.
// Walks the whole workspace and prints one line per file: relative path · size · mtime (ms),
// sorted, so two runs diff cleanly. Output is STDOUT only — redirect it to the OS temp folder,
// never inside the workspace. Read calls used: readdirSync (withFileTypes), lstatSync. Nothing else.
// Usage: node task-004-snapshot.mjs <workspacePath>  (defaults to $HARNESS_WORKSPACE_PATH)
import { readdirSync, lstatSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] || process.env.HARNESS_WORKSPACE_PATH;
if (!root) { console.error("usage: node task-004-snapshot.mjs <workspacePath>"); process.exit(2); }

const lines = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    const s = lstatSync(full); // lstat: a symlink is listed, never followed
    lines.push(`${path.relative(root, full).split(path.sep).join("/")}\t${s.size}\t${Math.trunc(s.mtimeMs)}`);
  }
};
walk(root);
lines.sort();
process.stdout.write(lines.join("\n") + "\n");
