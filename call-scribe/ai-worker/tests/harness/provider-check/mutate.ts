// bun mutate.ts <file> <from> <to>  — replace <from> with <to> in <file>; throws unless <from> occurs EXACTLY once.
// Used by test-prep.sh to put one defect into a scratch COPY of a script and watch a check go red. Never run on a real file.
import { readFileSync, writeFileSync } from "node:fs";
const [file, from, to] = process.argv.slice(2);
if (!file || from === undefined || to === undefined) throw new Error("usage: mutate.ts <file> <from> <to>");
const src = readFileSync(file, "utf8");
const n = src.split(from).length - 1;
if (n !== 1) throw new Error(`mutate: expected exactly 1 match of ${JSON.stringify(from)} in ${file}, found ${n}`);
writeFileSync(file, src.replace(from, () => to));
console.log(`mutated ${file}: 1 match replaced`);
