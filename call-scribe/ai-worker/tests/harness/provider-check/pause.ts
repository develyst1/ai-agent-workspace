// TASK-103 pause detection and the ledger file, shared by tts-voices.ts and run-check.ts.
//
// This box is a KVM guest that the host can pause (about 5.8 h overnight and about 280 s at about 02:00, SYSTEM-FACTS).
// Boot epoch = wall clock - first field of /proc/uptime. It should not move (noise measured 2026-11-07: +-0.006 s over 80
// samples in 20 s). A move of more than 2 s = a pause. LIMIT: this sees a pause only once the guest's wall clock has
// caught up; it did on the 278 s event, and that one event is all that is known.
// Test-only: PAUSE_UPTIME_FILE points at a fake uptime file ("<seconds> <idle>").
//
// The ledger keeps boot_epoch, so a pause BETWEEN two runs counts too. A pause is recorded in the ledger as `pause`; while one
// is recorded every script refuses to spend (exit 4). Only Silver clears it; then, on his word:
//   bun pause.ts clear --ledger <file> --note "<Silver's words and date>"
import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";

// The owner's spending ceiling for TASK-103 (DECISIONS 2026-11-07 03:49: half a dollar). Both scripts refuse a --limit-usd above
// it. The owner raises it, by editing this constant; no flag does.
export const MAX_LIMIT_USD = 0.5;
// A `long` run only if the ledger is at or under this (SA's rule, Re-size item 4).
export const LONG_MAX_LEDGER_USD = 0.25;
export const PAUSE_THRESHOLD_S = 2;
export const EXIT_PAUSED = 4;

export function bootEpoch(): number {
  const f = process.env.PAUSE_UPTIME_FILE ?? "/proc/uptime";
  const p = readFileSync(f, "utf8").trim().split(/\s+/);
  let up = parseFloat(p[0]);
  // test-only third field: the wall clock when the file was written; the fake uptime then advances in real time, as a real one does
  if (p[2]) up += Date.now() / 1000 - parseFloat(p[2]);
  return Date.now() / 1000 - up;
}

export const loadLedger = (p: string) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { total_usd: 0, entries: [] });
/** Atomic: write a temporary file next to it, then rename. */
export function saveLedger(p: string, l: any) {
  const tmp = `${p}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(l, null, 2));
  renameSync(tmp, p);
}
/** Call before the first save of a ledger: it remembers the boot epoch it was started under. */
export const stamp = (l: any) => { if (l.boot_epoch === undefined) l.boot_epoch = bootEpoch(); return l; };

export type PauseResult = null | { refused: boolean; move_s: number };
/**
 * null = fine. Otherwise the caller must stop spending and exit EXIT_PAUSED.
 * startEpoch is the baseline when the ledger has none yet (or does not exist, as for a stub run).
 * The pause is recorded in the ledger only if the ledger file already exists.
 */
export function pauseCheck(ledgerPath: string, startEpoch: number): PauseResult {
  const have = existsSync(ledgerPath);
  const l = have ? loadLedger(ledgerPath) : null;
  if (l?.pause) return { refused: true, move_s: l.pause.move_s };
  const base = l?.boot_epoch ?? startEpoch;
  const move = bootEpoch() - base;
  if (Math.abs(move) <= PAUSE_THRESHOLD_S) return null;
  if (l) {
    l.pause = { at: new Date().toISOString(), move_s: Number(move.toFixed(1)), note: "recorded by pause.ts; only Silver clears it" };
    saveLedger(ledgerPath, l);
  }
  return { refused: false, move_s: Number(move.toFixed(1)) };
}
export const pauseLine = (r: NonNullable<PauseResult>) =>
  r.refused
    ? `REFUSING: the ledger records a pause (boot epoch moved ${r.move_s} s). No spending until Silver clears it.`
    : `PAUSED: the boot epoch moved ${r.move_s} s (more than ${PAUSE_THRESHOLD_S} s). Stopping; no retry, no further paid call. A restart is Silver's decision.`;

if (import.meta.main) {
  const a = process.argv.slice(2);
  const opt = (n: string) => { const i = a.lastIndexOf(`--${n}`); return i >= 0 ? a[i + 1] : undefined; };
  if (a[0] === "clear") {
    const f = opt("ledger"), note = opt("note");
    if (!f || !note) { console.error('usage: bun pause.ts clear --ledger <file> --note "<Silver\'s words and date>"'); process.exit(2); }
    const l = loadLedger(f);
    if (!l.pause) { console.error("no pause recorded"); process.exit(1); }
    (l.pauses_cleared ??= []).push({ ...l.pause, cleared_note: note, cleared_at: new Date().toISOString() });
    delete l.pause;
    l.boot_epoch = bootEpoch();
    saveLedger(f, l);
    console.log("pause cleared; boot epoch reset");
  } else { console.error("usage: bun pause.ts clear ..."); process.exit(2); }
}
