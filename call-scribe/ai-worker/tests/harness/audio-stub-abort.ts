// TASK-101: the stub must stop at once when its signal aborts.
// Usage: GATEWAY_REPO=<repo path from machine.local.md> AUDIO_STUB_DELAY_MS=5000 AUDIO_STUB_MODE=ok \
//   AUDIO_TRANSCRIBE_PROVIDER=stub bun audio-stub-abort.ts
const repo = process.env.GATEWAY_REPO!;
const { stubTranscriber, stubSummarizer } = await import(`${repo}/src/audio/stub.ts`);
for (const [name, fn] of [
  ["transcribe", (s: AbortSignal) => stubTranscriber.transcribe({ bytes: new Uint8Array(1), format: "m4a", signal: s })],
  ["summarize", (s: AbortSignal) => stubSummarizer.summarize({ turns: [], signal: s })],
] as const) {
  const ac = new AbortController();
  const t0 = Date.now();
  setTimeout(() => ac.abort(), 100);
  try { await fn(ac.signal); console.log(`FAIL ${name}: resolved`); }
  catch (e: any) { console.log(`${Date.now() - t0 < 1000 ? "PASS" : "FAIL"} ${name}: rejected with ${e.code} after ${Date.now() - t0} ms (delay was 5000)`); }
}
