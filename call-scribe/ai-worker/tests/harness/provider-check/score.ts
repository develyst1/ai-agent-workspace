// TASK-103 scorer. Pure function of files: no network, no audio.
// bun score.ts --script script-S103.json --transcript <job.json> [--summary <job.json>] [--elapsed-s N] [--cost-usd N]
// <job.json> is the body of GET /audio/jobs/:id ({ success, data: { status, result | error } }).
//
// Word splitting: Intl.Segmenter("th", word granularity), word-like segments only, lower-cased, NFC, with
// Thai tone-mark/space noise ignored. Thai has no spaces, so ICU's dictionary decides the boundaries; both
// the script and the transcript go through the SAME splitter, so a different spelling of one word costs it.
// Words %  = multiset recall: script words found in the transcript / script words (AC-3 line: 80).
// Speakers = speaker_count, and % of transcript turns on the right voice (AC-4 line: exactly 2, 80):
//   a transcript turn's voice = the script voice whose UNIQUE words (words used by only one voice) it hits most;
//   a tie or no hit = "unknown", counted wrong. Each label maps to the voice most of its turns hit (tie → first).
// Summary  = per topic, any keyword found (whitespace removed on both sides). "Invented" is NOT decided here:
//   the scorer lists Latin/number tokens in the summary found nowhere in the script or topics; a human reads it.
import { readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const opt = (n: string) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : undefined; };
const seg = new Intl.Segmenter("th", { granularity: "word" });
const norm = (s: string) => s.normalize("NFC").toLowerCase();
const words = (s: string): string[] => [...seg.segment(norm(s))].filter(x => x.isWordLike).map(x => x.segment);
const squash = (s: string) => norm(s).replace(/\s+/g, "");

export function score(script: any, transcriptJob: any, summaryJob?: any, elapsedS?: number, costUsd?: number) {
  const row: any = {};
  const t = transcriptJob?.data;
  row.transcription_status = t?.status ?? "missing";
  if (t?.status === "failed") row.transcription_error = t.error;
  const r = t?.result;
  if (r) {
    const scriptWords = script.turns.flatMap((x: any) => words(x.text));
    const pool = new Map<string, number>();
    for (const w of (r.turns ?? []).flatMap((x: any) => words(x.text))) pool.set(w, (pool.get(w) ?? 0) + 1);
    let hit = 0;
    for (const w of scriptWords) { const n = pool.get(w) ?? 0; if (n > 0) { hit++; pool.set(w, n - 1); } }
    row.words_pct = scriptWords.length ? Number(((100 * hit) / scriptWords.length).toFixed(1)) : 0;
    row.script_words = scriptWords.length;
    row.no_speech = r.no_speech;
    row.speaker_count = r.speaker_count;

    const byVoice: Record<string, Set<string>> = { A: new Set(), B: new Set() };
    for (const x of script.turns) for (const w of words(x.text)) byVoice[x.voice].add(w);
    const uniq = (v: string, o: string) => new Set([...byVoice[v]].filter(w => !byVoice[o].has(w)));
    const uA = uniq("A", "B"), uB = uniq("B", "A");
    const tally: Record<string, Record<string, number>> = {};
    const attributed: { label: number; voice: string }[] = [];
    for (const x of r.turns ?? []) {
      const ws = words(x.text);
      const a = ws.filter(w => uA.has(w)).length, b = ws.filter(w => uB.has(w)).length;
      const voice = a > b ? "A" : b > a ? "B" : "unknown";
      attributed.push({ label: x.speaker, voice });
      tally[x.speaker] ??= {};
      tally[x.speaker][voice] = (tally[x.speaker][voice] ?? 0) + 1;
    }
    const map: Record<string, string> = {};
    for (const [label, c] of Object.entries(tally)) {
      const best = Object.entries(c).filter(([v]) => v !== "unknown").sort((p, q) => q[1] - p[1])[0];
      map[label] = best ? best[0] : "unknown";
    }
    const right = attributed.filter(x => x.voice !== "unknown" && map[x.label] === x.voice).length;
    row.turns_on_right_voice_pct = attributed.length ? Number(((100 * right) / attributed.length).toFixed(1)) : 0;
    row.label_to_voice = map;
    row.transcript_turns = attributed.length;
    // Does the speech survive? For `leak`: did voice B's unique words come through at all, labelled or not.
    const all = new Set((r.turns ?? []).flatMap((x: any) => words(x.text)));
    row.voice_A_unique_words_present_pct = uA.size ? Number(((100 * [...uA].filter(w => all.has(w)).length) / uA.size).toFixed(1)) : 0;
    row.voice_B_unique_words_present_pct = uB.size ? Number(((100 * [...uB].filter(w => all.has(w)).length) / uB.size).toFixed(1)) : 0;
  }
  if (summaryJob) {
    const s = summaryJob?.data;
    row.summary_status = s?.status ?? "missing";
    if (s?.status === "failed") row.summary_error = s.error;
    const text: string = s?.result?.summary ?? "";
    if (text) {
      const sq = squash(text);
      row.topics = script.topics.map((tp: any) => ({ topic: tp.name, present: tp.keywords.some((k: string) => sq.includes(squash(k))) }));
      row.topics_present = `${row.topics.filter((x: any) => x.present).length}/${script.topics.length}`;
      const known = squash(JSON.stringify(script));
      row.invented_check = "MANUAL — a human reads the summary against the script";
      row.summary_latin_or_number_tokens_not_in_script = [...new Set(norm(text).match(/[a-z]+|\d+/g) ?? [])].filter(tok => !known.includes(tok));
    }
  }
  if (elapsedS !== undefined) row.elapsed_s = elapsedS;
  if (costUsd !== undefined) row.cost_usd = costUsd;
  return row;
}

if (import.meta.main) {
  const sp = opt("script"), tp = opt("transcript");
  if (!sp || !tp) { console.error("usage: bun score.ts --script <s.json> --transcript <job.json> [--summary <job.json>] [--elapsed-s N] [--cost-usd N]"); process.exit(2); }
  const j = (p?: string) => (p ? JSON.parse(readFileSync(p, "utf8")) : undefined);
  console.log(JSON.stringify(score(j(sp), j(tp), j(opt("summary")), opt("elapsed-s") ? Number(opt("elapsed-s")) : undefined, opt("cost-usd") ? Number(opt("cost-usd")) : undefined), null, 2));
}
