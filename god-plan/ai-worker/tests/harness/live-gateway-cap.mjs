// D11 live run (QA, Tanya) — a call-capping forwarder on 127.0.0.1:4399, where the back expects its gateway.
// Owner 2026-11-09 14:52 "ให้เรียก AI จริง 4 ครั้งได้" (DECISIONS.md): exactly 4 live calls; an error counts; no retry beyond.
// POST /chat → forwards calls 1..CAP to the live gateway; from call CAP+1 it answers 500 and forwards NOTHING.
// Every forwarded request and answer is appended to out/TEST-001/d11-live/calls.jsonl (synthetic data only, D2).
// GET /count → { forwarded, refused }. Run: node tests/harness/live-gateway-cap.mjs
import http from "node:http";
import { appendFileSync, mkdirSync } from "node:fs";

const LIVE = "https://ai.develyst.online/chat";
const CAP = 4;
const OUT = new URL("./out/TEST-001/d11-live/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
let forwarded = 0, refused = 0;

http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/count") { res.end(JSON.stringify({ forwarded, refused, cap: CAP })); return; }
  if (req.method !== "POST" || req.url !== "/chat") { res.statusCode = 404; res.end(); return; }
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks).toString("utf8");
  if (forwarded >= CAP) {
    refused++;
    appendFileSync(OUT + "calls.jsonl", JSON.stringify({ at: new Date().toISOString(), refusedOverCap: true }) + "\n");
    res.statusCode = 500; res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ success: false, error: "QA cap reached — not forwarded" })); return;
  }
  const n = ++forwarded; const t0 = Date.now();
  appendFileSync(OUT + "calls.jsonl", JSON.stringify({ n, at: new Date().toISOString(), request: JSON.parse(body) }) + "\n");
  let status = 0, text = "";
  try {
    const r = await fetch(LIVE, { method: "POST", headers: { "content-type": "application/json" }, body, signal: AbortSignal.timeout(60000) });
    status = r.status; text = await r.text();
  } catch (e) { status = 0; text = JSON.stringify({ success: false, error: `forwarder: ${e.name}` }); }
  appendFileSync(OUT + "calls.jsonl", JSON.stringify({ n, at: new Date().toISOString(), ms: Date.now() - t0, status, response: text.slice(0, 20000) }) + "\n");
  console.log(`call ${n}/${CAP} → ${status} in ${Date.now() - t0} ms`);
  if (res.writableEnded || res.destroyed) return; // the back gave up (25 s); the call still counted
  res.statusCode = status || 502; res.setHeader("content-type", "application/json"); res.end(text);
}).listen(4399, "127.0.0.1", () => console.log("live-gateway-cap on 127.0.0.1:4399, cap", CAP));
