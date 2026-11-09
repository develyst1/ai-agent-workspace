// TASK-103 voice script. Makes ONE track per speaker (time-aligned, silence where the other speaks) from
// script-S103.json, using the provider's own text-to-speech over HTTP. Nothing is installed.
//
// 🛑 Makes a REAL, PAID call. It refuses to run unless --really-call-tts is passed. Prep never passes it
// outside a scratch copy with fake keys and refuse-fetch.ts preloaded (or the stand-in server).
//
// bun tts-voices.ts --really-call-tts --out <dir> --work <dir> --limit-usd <n> --ledger <file.json> \
//     --rate-text-in <usd per 1M text tokens> --rate-audio-out <usd per 1M audio tokens> \
//     [--script script-S103.json] [--model gemini-3.8-flash-tts] [--voice-a Puck] [--voice-b Kore] \
//     [--base-url https://generativelanguage.googleapis.com] [--omit-store]
// Key: GEMINI_API_KEY from the environment, sent as a header, never printed.
// --out gets only the two tracks. --work holds each paid turn as it arrives (turn-NN.wav), so a failure at
// turn 7 keeps turns 1-6 and a retry reuses them instead of paying again. Remove --work afterwards.
// The rates have no default on purpose: a guessed price is not a limit check.
//
// API shape (Google's speech page, REST tab, read 2026-11-07 by Silver and by me; UNVERIFIED until a live call):
//   POST {base}/v1beta/interactions   header x-goog-api-key
//   { model, input:[{type:"user_input",content:[{type:"text",text}]}], response_format:{type:"audio"},
//     generation_config:{speech_config:[{voice}]}, store:false }
//   audio = last of steps[type=model_output].content[type=audio] .data  (base64 of a COMPLETE WAV: RIFF, 24 kHz mono 16-bit)
// `store:false` is Silver's instruction (the default stores the exchange); the single-speaker example on the page does not
// show it, so if the live call answers 400 mentioning it, rerun with --omit-store and tell Silver.
// Pause (pause.ts): the boot epoch is checked before each paid call and after each one; a move of more than 2 s stops
// everything with exit 4. The ledger keeps the spend already recorded, and refuses further spending until Silver clears it.
// Money records: a turn's GUESS is written before its call and replaced by the measured figure after; if the call fails the
// guess stays, marked. For live runs put --ledger and --work in call-scribe-test-voices (a temp folder may not survive);
// at the end remove --work by hand; the ledger is the one extra file allowed beside the 5 kept.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { bootEpoch, loadLedger, saveLedger, stamp, pauseCheck, pauseLine, EXIT_PAUSED, MAX_LIMIT_USD } from "./pause";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const die = (m: string, code = 2): never => { console.error(m); process.exit(code); };

if (!flag("really-call-tts")) die("REFUSING: this makes a paid text-to-speech call. Pass --really-call-tts only when Silver has cleared the live part.");
const out = opt("out") ?? die("--out <dir> required");
const work = opt("work") ?? die("--work <dir> required (a mktemp folder, removed afterwards)");
const limit = Number(opt("limit-usd") ?? die("--limit-usd required"));
const ledgerPath = opt("ledger") ?? die("--ledger <file> required");
const rateIn = Number(opt("rate-text-in") ?? die("--rate-text-in required (USD per 1M text tokens)"));
const rateOut = Number(opt("rate-audio-out") ?? die("--rate-audio-out required (USD per 1M audio tokens)"));
const model = opt("model", "gemini-3.8-flash-tts")!;
const voiceOf: Record<string, string> = { A: opt("voice-a", "Puck")!, B: opt("voice-b", "Kore")! };
const scriptPath = opt("script", new URL("./script-S103.json", import.meta.url).pathname)!;
const baseUrl = opt("base-url", "https://generativelanguage.googleapis.com")!;
const key = process.env.GEMINI_API_KEY ?? die("GEMINI_API_KEY not set in the environment");
if (!(limit > 0) || !(rateIn >= 0) || !(rateOut >= 0)) die("limit and rates must be numbers");
if (limit > MAX_LIMIT_USD) die(`REFUSING: --limit-usd ${limit} is above the owner's ceiling ${MAX_LIMIT_USD} (pause.ts). The owner raises it, not a flag.`);

const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const callLimitMs = Number(opt("call-limit-s", "120")) * 1000;
const startEpoch = bootEpoch();
/** Exit 4 if the box paused (or the ledger already records a pause). Nothing is called after this returns false. */
function guard() {
  const r = pauseCheck(ledgerPath, startEpoch);
  if (r) { console.error(pauseLine(r)); process.exit(EXIT_PAUSED); }
}

// Cost model. Text tokens: 1 token per character (an over-count for Thai, so a ceiling on that part). Audio: 25 tokens per
// second as documented for this model. BEFORE a turn the audio length is a GUESS (0.15 s per character, no bound on Thai);
// AFTER it, the measured length replaces the guess. All of this is an estimate, never a bill; read the console for the bill.
const GUESS_SEC_PER_CHAR = 0.15;
const textCost = (chars: number) => (chars * rateIn) / 1e6;
const audioCost = (sec: number) => (sec * 25 * rateOut) / 1e6;
const guessTurn = (chars: number) => textCost(chars) + audioCost(chars * GUESS_SEC_PER_CHAR);
guard();
{
  const l = loadLedger(ledgerPath);
  const total = script.turns.reduce((n: number, t: any) => n + guessTurn(t.text.length), 0);
  console.log(`estimate for all ${script.turns.length} turns (a guess, not a bound): US$${total.toFixed(4)}; ledger so far US$${l.total_usd}; limit US$${limit}`);
  if (l.total_usd + total > limit) die(`REFUSING: ledger ${l.total_usd} + estimate ${total.toFixed(4)} would pass the limit ${limit}.`, 3);
}

const RATE = 24000;
/** Parse a RIFF/WAVE buffer: check 24 kHz mono 16-bit, return the PCM of the `data` chunk (never assume a 44-byte header). */
function wavPcm(buf: Buffer): Buffer {
  if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") throw new Error("reply is not a RIFF/WAVE file");
  let off = 12, fmtOk = false;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    let size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ") {
      const fmt = buf.readUInt16LE(body), ch = buf.readUInt16LE(body + 2), sr = buf.readUInt32LE(body + 4), bits = buf.readUInt16LE(body + 14);
      if (fmt !== 1 || ch !== 1 || sr !== RATE || bits !== 16) throw new Error(`unexpected WAV format fmt=${fmt} ch=${ch} rate=${sr} bits=${bits}`);
      fmtOk = true;
    }
    if (id === "data") {
      if (!fmtOk) throw new Error("data chunk before fmt chunk");
      if (size === 0xffffffff || body + size > buf.length) size = buf.length - body; // a streamed header may not know its size
      return buf.subarray(body, body + size);
    }
    off = body + size + (size % 2);
  }
  throw new Error("no data chunk in the WAV");
}
function wav(pcm: Buffer): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function speak(text: string, voice: string): Promise<Buffer> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1beta/interactions`, {
      // its own limit (120 s, --call-limit-s): a TTS server that stops answering must not hang a paid run. A timed-out call is
      // NEVER retried (it may have been billed): the turn's guess stays in the ledger, marked, and the script exits 1.
      signal: AbortSignal.timeout(callLimitMs),
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        model,
        input: [{ type: "user_input", content: [{ type: "text", text }] }],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice }] },
        ...(flag("omit-store") ? {} : { store: false }),
      }),
    });
  } catch (e: any) {
    throw new Error(`TTS request failed (${e?.name ?? "error"}): ${String(e?.message ?? e).slice(0, 80)}`);
  }
  if (!res.ok) throw new Error(`TTS HTTP ${res.status}`); // body not printed: it can echo the text
  const j: any = await res.json();
  const audios = (j?.steps ?? []).filter((s: any) => s?.type === "model_output").flatMap((s: any) => s.content ?? []).filter((c: any) => c?.type === "audio");
  const b64 = audios.at(-1)?.data;
  if (!b64) throw new Error("TTS reply carried no audio");
  // log token counts if the reply carries a usage figure, never the text (none is documented on the pages read)
  if (j?.usage) console.log(`  usage: ${JSON.stringify(j.usage).slice(0, 160)}`);
  return Buffer.from(b64, "base64");
}

mkdirSync(out, { recursive: true });
mkdirSync(work, { recursive: true });
const gap = Buffer.alloc(Math.round(RATE * 0.4) * 2); // 0.4 s of silence between turns
const tracks: Record<string, Buffer[]> = { A: [], B: [] };
try {
  for (const [i, t] of script.turns.entries()) {
    const f = `${work}/turn-${String(i + 1).padStart(2, "0")}.wav`;
    let pcm: Buffer;
    if (existsSync(f)) {
      pcm = wavPcm(readFileSync(f)); // already paid for on an earlier try
      console.log(`turn ${i + 1}/${script.turns.length} voice ${t.voice}: reused, no call`);
    } else {
      guard(); // pause check before the paid call
      // limit rechecked before EACH paid turn, on the ledger as it stands now
      const l = stamp(loadLedger(ledgerPath));
      const g = Number(guessTurn(t.text.length).toFixed(6));
      if (l.total_usd + g > limit) throw Object.assign(new Error(`STOP before turn ${i + 1}: ledger ${l.total_usd} + this turn's estimate ${g.toFixed(5)} would pass the limit ${limit}`), { code: 3 });
      // spend is recorded BEFORE the call as a guess, so a pause or a death mid-call cannot leave a billed call unrecorded
      const entry = { kind: "tts-turn", turn: i + 1, model, status: "guess", est_usd: g };
      l.total_usd = Number((l.total_usd + g).toFixed(6));
      l.entries.push(entry);
      saveLedger(ledgerPath, l);
      try {
        pcm = wavPcm(await speak(t.text, voiceOf[t.voice]));
      } catch (e) {
        const l2 = loadLedger(ledgerPath); // the call failed: the guess stays in the ledger, marked
        const e2 = l2.entries.findLast((x: any) => x.kind === "tts-turn" && x.turn === i + 1 && x.status === "guess");
        if (e2) e2.status = "guess-call-failed";
        saveLedger(ledgerPath, l2);
        throw e;
      }
      writeFileSync(f, wav(pcm));
      const sec = pcm.length / 2 / RATE;
      const spent = Number((textCost(t.text.length) + audioCost(sec)).toFixed(6));
      const l3 = loadLedger(ledgerPath); // replace the guess with the measured figure, NOW, so a later failure cannot lose a paid turn
      const e3 = l3.entries.findLast((x: any) => x.kind === "tts-turn" && x.turn === i + 1 && x.status === "guess");
      l3.total_usd = Number((l3.total_usd - (e3?.est_usd ?? 0) + spent).toFixed(6));
      if (e3) Object.assign(e3, { status: "measured", audio_s: Number(sec.toFixed(2)), est_usd: spent });
      saveLedger(ledgerPath, l3);
      console.log(`turn ${i + 1}/${script.turns.length} voice ${t.voice}: ${sec.toFixed(1)} s; ledger now US$${l3.total_usd}`);
      guard(); // and after the call: on a pause this turn is already in the ledger and no further call is made
    }
    tracks[t.voice].push(pcm, gap);
    tracks[t.voice === "A" ? "B" : "A"].push(Buffer.alloc(pcm.length), gap);
  }
} catch (e: any) {
  console.error(`FAILED (no track written; turns already paid are kept in ${work} and in the ledger): ${e.message}`);
  process.exit(e.code === 3 ? 3 : 1);
}
writeFileSync(`${out}/voice-A-track.wav`, wav(Buffer.concat(tracks.A)));
writeFileSync(`${out}/voice-B-track.wav`, wav(Buffer.concat(tracks.B)));
console.log(`done: tracks in ${out}; ledger US$${loadLedger(ledgerPath).total_usd} (an ESTIMATE from lengths; check the console)`);
