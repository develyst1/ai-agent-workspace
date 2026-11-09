// Test stand-ins for TASK-103 prep. Local only, no network, no key.
//   bun stand-in.ts tts <port>      the documented Interactions TTS reply shape, a real small WAV (with an extra LIST chunk,
//                                   so a parser that assumes a 44-byte header breaks); STAND_IN_FAIL_AT=<n> answers 500 on call n
//   bun stand-in.ts gateway <port>  a gateway whose finished jobs report result.provider = STAND_IN_PROVIDER (default "stub")
const [kind, portArg] = process.argv.slice(2);
const port = Number(portArg);

function tone(sec: number): Buffer {
  const n = Math.round(24000 * sec);
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 440 * i) / 24000)), i * 2);
  const list = Buffer.concat([Buffer.from("LIST"), Buffer.from([4, 0, 0, 0]), Buffer.from("INFO")]);
  const fmt = Buffer.alloc(24);
  fmt.write("fmt ", 0); fmt.writeUInt32LE(16, 4); fmt.writeUInt16LE(1, 8); fmt.writeUInt16LE(1, 10);
  fmt.writeUInt32LE(24000, 12); fmt.writeUInt32LE(48000, 16); fmt.writeUInt16LE(2, 20); fmt.writeUInt16LE(16, 22);
  const data = Buffer.concat([Buffer.from("data"), Buffer.from([0, 0, 0, 0]), pcm]);
  data.writeUInt32LE(pcm.length, 4);
  const body = Buffer.concat([Buffer.from("WAVE"), fmt, list, data]);
  const riff = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), body]);
  riff.writeUInt32LE(body.length, 4);
  return riff;
}

if (kind === "tts") {
  let calls = 0;
  const failAt = Number(process.env.STAND_IN_FAIL_AT ?? 0);
  Bun.serve({ port, async fetch(req) {
    const b: any = await req.json().catch(() => ({}));
    calls++;
    const text: string = b?.input?.[0]?.content?.[0]?.text ?? "";
    const shapeOk = req.method === "POST" && new URL(req.url).pathname === "/v1beta/interactions" && b.model && b.response_format?.type === "audio"
      && Array.isArray(b.generation_config?.speech_config) && b.generation_config.speech_config[0]?.voice && req.headers.get("x-goog-api-key");
    if (!shapeOk) return new Response("bad shape", { status: 400 });
    if (failAt && calls === failAt) return new Response("boom", { status: 500 });
    if (process.env.STAND_IN_HANG_AT && calls === Number(process.env.STAND_IN_HANG_AT)) await new Promise(() => {}); // never answers
    // simulate a host pause DURING call N: the fake uptime file loses 278 s, so the boot epoch moves by +278 s
    if (process.env.STAND_IN_PAUSE_AT && calls === Number(process.env.STAND_IN_PAUSE_AT) && process.env.PAUSE_UPTIME_FILE) {
      const f = process.env.PAUSE_UPTIME_FILE;
      const p = (await Bun.file(f).text()).trim().split(/\s+/);
      await Bun.write(f, `${parseFloat(p[0]) - 278} 0 ${p[2] ?? ""}\n`);
    }
    const wavBytes = tone(Math.max(0.2, text.length * 0.01));
    return Response.json({ steps: [
      { type: "user_input", content: [{ type: "text", text: "(echo)" }] },
      { type: "model_output", content: [{ type: "text", text: "ignored" }, { type: "audio", data: wavBytes.toString("base64") }] },
    ], seen_store: b.store });
  } });
} else if (kind === "gateway") {
  const prov = process.env.STAND_IN_PROVIDER ?? "stub";
  Bun.serve({ port, fetch(req) {
    const p = new URL(req.url).pathname;
    if (p === "/") return Response.json({ ok: true });
    // STAND_IN_HANG=poll: answers the POST, never answers a job poll. STAND_IN_HANG=post: never answers the POST.
    if (req.method === "POST" && process.env.STAND_IN_HANG === "post") return new Promise<Response>(() => {});
    if (req.method !== "POST" && process.env.STAND_IN_HANG === "poll") return new Promise<Response>(() => {});
    if (req.method === "POST") return Response.json({ success: true, data: { job_id: p.includes("summ") ? "s1" : "t1", status: "queued" } }, { status: 202 });
    if (p.endsWith("/s1")) return Response.json({ success: true, data: { job_id: "s1", kind: "summary", status: "done", result: { provider: prov, model: process.env.STAND_IN_MODEL_S ?? "m", summary: "x" } } });
    return Response.json({ success: true, data: { job_id: "t1", kind: "transcription", status: "done", result: { provider: prov, model: process.env.STAND_IN_MODEL_T ?? "m", no_speech: false, speaker_count: 1, turns: [{ speaker: 1, text: "x" }] } } });
  } });
} else { console.error("usage: stand-in.ts tts|gateway <port>"); process.exit(2); }
