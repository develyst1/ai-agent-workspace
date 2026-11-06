// Fingerprint of the build under test: sha256 over every file in the given folders (path + content), sorted.
//   bun fingerprint.ts <repo> [folder…]      default folders: src migrations
// The back repo has no commit for this work yet (only d1152f1), so this hash is the build's name. Throwaway harness.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";

const [repo, ...folders] = process.argv.slice(2);
if (!repo) { console.error("usage: bun fingerprint.ts <repo> [folder…]"); process.exit(2); }
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? (n === "node_modules" || n === ".next" ? [] : walk(p)) : [p];
});
const files = (folders.length ? folders : ["src", "migrations"]).flatMap((f) => walk(join(repo, f))).sort();
const h = createHash("sha256");
for (const f of files) { h.update(relative(repo, f).replace(/\\/g, "/")); h.update("\0"); h.update(readFileSync(f)); h.update("\0"); }
console.log(`${h.digest("hex").slice(0, 16)} (${files.length} files, ${new Date().toISOString()})`);
