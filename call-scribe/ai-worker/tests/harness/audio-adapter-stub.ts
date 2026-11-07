// Preload for TASK-102: replaces global fetch so NO request leaves the machine.
// The case to play is read from the file named by CASEFILE on every call (so one server serves many cases).
// What the gateway sent is appended to OUTLOG as JSON lines: method, url, header NAMES only (no values),
// and for multipart the field names in order. Replies are built from the providers' docs, not from a real
// reply: everything about real behaviour stays UNVERIFIED until TASK-103.
import { appendFileSync, readFileSync } from "node:fs";

const realFetch = globalThis.fetch;
const caseName = () => readFileSync(process.env.CASEFILE!, "utf8").trim();
const json = (status: number, obj: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...headers } });
const text = (status: number, s: string) => new Response(s, { status });
const ERR = { error: { message: "SENTINELTEXT" } };

const G = "https://generativelanguage.googleapis.com";
const TURNS = [
  { speaker: 1, text: "สวัสดีครับ" },
  { speaker: 2, text: "สวัสดีค่ะ" },
  { speaker: 1, text: "ขอบคุณครับ" },
];

function httpCase(c: string): Response | null {
  const m = c.match(/^http(\d+)$/);
  return m ? json(Number(m[1]), ERR) : null;
}

function geminiGenerate(c: string, body: any): Response {
  const summary = body?.systemInstruction !== undefined;
  const reply = (finishReason: string | undefined, parts: any[]) =>
    json(200, { candidates: [{ ...(finishReason ? { finishReason } : {}), content: { parts } }] });
  const http = httpCase(c);
  if (http) return http;
  switch (c) {
    case "net": throw new TypeError("SENTINELTEXT");
    case "throw_type": return { get ok(): boolean { throw new TypeError("SENTINELTEXT"); } } as any;
    case "garbage": return text(200, "SENTINELTEXT not json");
    case "max_tokens": return reply("MAX_TOKENS", [{ text: summary ? "partial" : '{"turns":[{"speaker":1,"te' }]);
    case "safety": return reply("SAFETY", [{ text: "SENTINELTEXT" }]);
    case "no_candidates": return json(200, { promptFeedback: { blockReason: "SAFETY" } });
    case "schema_bad": return reply("STOP", [{ text: JSON.stringify({ lines: [] }) }]);
    case "speaker_string": return reply("STOP", [{ text: JSON.stringify({ turns: [{ speaker: "1", text: "x" }] }) }]);
    case "empty": return summary ? reply("STOP", [{ text: "   " }]) : reply("STOP", [{ text: JSON.stringify({ turns: [] }) }]);
    case "blank_text": return reply("STOP", [{ text: JSON.stringify({ turns: [{ speaker: 3, text: "  " }] }) }]);
    default: // ok
      return summary
        ? reply("STOP", [{ text: "ส่วนแรก " }, { text: "ส่วนที่สอง" }])
        : reply("STOP", [{ text: JSON.stringify({ turns: TURNS }) }]);
  }
}

function geminiUploadFinish(c: string): Response {
  if (c === "upload_400") return json(400, ERR);
  if (c === "upload_no_name") return json(200, { file: {} });
  if (c === "processing") return json(200, { file: { name: "files/stub1", uri: `${G}/v1beta/files/stub1`, state: "PROCESSING" } });
  return json(200, { file: { name: "files/stub1", uri: `${G}/v1beta/files/stub1`, state: "ACTIVE" } });
}

function xaiStt(c: string): Response {
  const http = httpCase(c);
  if (http) return http;
  switch (c) {
    case "net": throw new TypeError("SENTINELTEXT");
    case "throw_type": return { get ok(): boolean { throw new TypeError("SENTINELTEXT"); } } as any;
    case "garbage": return text(200, "SENTINELTEXT not json");
    case "empty": return json(200, { text: "", language: "th", duration: 1.5 });
    case "no_words": return json(200, { text: "สวัสดี", language: "th", duration: 1.5 });
    case "no_speaker": return json(200, { text: "x", words: [{ text: "x", start: 0, end: 1 }] });
    case "no_text": return json(200, { words: [] });
    default:
      return json(200, {
        text: "สวัสดี ครับ hello world", language: "th", duration: 2,
        words: [
          { text: "สวัสดี", start: 0, end: 1, speaker: 0 }, { text: "ครับ", start: 1, end: 2, speaker: 0 },
          { text: "hello", start: 2, end: 3, speaker: 1 }, { text: "world", start: 3, end: 4, speaker: 1 },
        ],
      });
  }
}

function xaiChat(c: string): Response {
  const http = httpCase(c);
  if (http) return http;
  const reply = (finish: string | undefined, content: any) =>
    json(200, { choices: [{ ...(finish ? { finish_reason: finish } : {}), message: { content } }] });
  switch (c) {
    case "net": throw new TypeError("SENTINELTEXT");
    case "throw_type": return { get ok(): boolean { throw new TypeError("SENTINELTEXT"); } } as any;
    case "garbage": return text(200, "SENTINELTEXT not json");
    case "length": return reply("length", "partial");
    case "filter": return reply("content_filter", "SENTINELTEXT");
    case "empty": return reply("stop", "  ");
    case "no_choices": return json(200, { choices: [] });
    default: return reply("stop", "สรุปจาก xAI");
  }
}

globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = String(input?.url ?? input);
  const method = String(init.method ?? "GET").toUpperCase();
  const body = init.body;
  const rec: Record<string, unknown> = {
    method, url,
    headers: Object.keys(Object.fromEntries(new Headers(init.headers ?? {}))).sort(),
    signal: init.signal ? "yes" : "NO",
  };
  if (body instanceof FormData) rec.fields = [...body.keys()];
  appendFileSync(process.env.OUTLOG!, JSON.stringify(rec) + "\n");

  const c = caseName();
  const u = new URL(url);
  const path = u.pathname;
  let parsed: any = null;
  if (typeof body === "string") { try { parsed = JSON.parse(body); } catch {} }

  if (u.host === "generativelanguage.googleapis.com") {
    if (path === "/upload/v1beta/files" && method === "POST") {
      return new Response("{}", { status: 200, headers: { "x-goog-upload-url": `${G}/upload/v1beta/files/stub-session` } });
    }
    if (path === "/upload/v1beta/files/stub-session") return geminiUploadFinish(c);
    if (path.endsWith(":generateContent")) return geminiGenerate(c, parsed);
    if (path === "/v1beta/files/stub1" && method === "GET") return json(200, { state: "ACTIVE" });
    if (path === "/v1beta/files/stub1" && method === "DELETE") return json(200, {});
  }
  if (u.host === "api.x.ai") {
    if (path === "/v1/stt") return xaiStt(c);
    if (path === "/v1/chat/completions") return xaiChat(c);
  }
  // anything else must never leave the machine
  appendFileSync(process.env.OUTLOG!, JSON.stringify({ UNEXPECTED_HOST: u.host, url }) + "\n");
  return text(599, "blocked by stub");
}) as any;
void realFetch;
