// Harness (Jason, 2026-09-19): REQ-001 AC-3 boundaries against src/lib/tier.ts. Run from possibility-back: bun run <this file>
import { discountFor, rank, tierFromLowestScore } from "../../../../../../possibility/possibility-back/src/lib/tier";
const expected: [number, string][] = [
  [39, "Ordinary"], [40, "Seeker"], [59, "Seeker"], [60, "Raw Diamond"], [74, "Raw Diamond"],
  [75, "Visionary"], [89, "Visionary"], [90, "The Possibility"], [0, "Ordinary"], [100, "The Possibility"],
];
let fail = 0;
for (const [n, want] of expected) {
  const got = tierFromLowestScore(n);
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} lowest=${String(n).padStart(3)} → ${got.padEnd(15)} discount=${discountFor(got)}% rank=${rank(got)}`);
}
console.log(fail === 0 ? "ALL PASS" : `${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
