// TASK-109 VARIANT of stub-back-107.mjs: also keeps the bytes of each finished upload in STUB_STORE (a scratch folder)
// as <id>.bin, so the test can ffprobe what the front actually sent, and decides the final status the way a stand-in
// can: ffmpeg volumedetect max_volume below -60 dB = "no_speech", otherwise "done". NOT the real back's decoder.
// Throwaway STAND-IN for call-scribe-back, for TASK-107 only. Not the real back: it proves the front's
// reading of SPEC-102's contract, nothing about the back. Synthetic data, no database, no files.
//   STUB_PORT=3101 STUB_MODE=empty|filled|error PASSWORD=test-pass node stub-back-107.mjs
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const store = process.env.STUB_STORE || "";
if (!store) throw new Error("STUB_STORE (an empty scratch folder) is required");
fs.mkdirSync(store, { recursive: true });

const port = Number(process.env.STUB_PORT || 3101);
const mode = process.env.STUB_MODE || "empty";
const password = process.env.PASSWORD || "test-pass";
const origin = process.env.FRONT_ORIGIN || "http://localhost:3100";
const sessions = new Set();
const CHUNK = 5 * 1024 * 1024;
const maxBytes = Number(process.env.STUB_MAX_BYTES || 4 * 1024 ** 3);
const uploaded = []; // { rec, size, chunks: Map(index -> bytes) }
const readBody = (req) => new Promise((resolve) => { const parts = []; req.on("data", (c) => parts.push(c)); req.on("end", () => resolve(Buffer.concat(parts))); });
let failures = 0;

const recordings = [
  { id: "00000000-0000-4000-8000-000000000002", clientId: "00000000-0000-4000-8000-0000000000a2", fileName: "synthetic-two.m4a", source: "file", status: "done", errorCode: null, retryable: false, durationMs: 61000, createdAt: "2026-11-06T09:10:00.000Z", updatedAt: "2026-11-06T09:11:00.000Z" },
  { id: "00000000-0000-4000-8000-000000000001", clientId: "00000000-0000-4000-8000-0000000000a1", fileName: "synthetic-one.m4a", source: "mic", status: "summary_failed", errorCode: "provider_failed", retryable: true, durationMs: 30000, createdAt: "2026-11-05T08:00:00.000Z", updatedAt: "2026-11-05T08:01:00.000Z" },
];

function send(res, status, body, extra = {}) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    ...extra,
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}
const err = (res, status, code) => send(res, status, { error: { code } });
const cookieOf = (req) => /(?:^|; )cs_session=([^;]+)/.exec(req.headers.cookie || "")?.[1];

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") return send(res, 204);
  if (url.pathname === "/health") return send(res, 200, { ok: true });
  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (failures >= 5) return err(res, 429, "too_many_attempts");
      let ok = false;
      try { ok = JSON.parse(raw).password === password; } catch { /* bad body */ }
      if (!ok) { failures++; return err(res, 401, "invalid_password"); }
      const token = Math.random().toString(36).slice(2);
      sessions.add(token);
      send(res, 204, undefined, { "Set-Cookie": `cs_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` });
    });
    return;
  }
  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    sessions.delete(cookieOf(req));
    return send(res, 204, undefined, { "Set-Cookie": "cs_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  }
  if (!sessions.has(cookieOf(req))) return err(res, 401, "unauthorized");
  if (url.pathname === "/api/auth/me") return send(res, 200, { loggedIn: true });
  if (url.pathname === "/api/recordings" && req.method === "GET") {
    if (mode === "error") return err(res, 500, "internal_error");
    return send(res, 200, { recordings: [...uploaded.filter((u) => u.rec.status !== "uploading").map((u) => u.rec).reverse(), ...(mode === "filled" ? recordings : [])] });
  }
  // --- upload stand-in (TASK-108): sizes and piece counts only; it never decodes anything ---
  if (url.pathname === "/api/recordings" && req.method === "POST") {
    return readBody(req).then((raw) => {
      let b; try { b = JSON.parse(raw.toString()); } catch { return err(res, 400, "invalid_request"); }
      if (!b.clientId || !b.fileName || !Number.isInteger(b.sizeBytes)) return err(res, 400, "invalid_request");
      const found = uploaded.find((u) => u.rec.clientId === b.clientId);
      if (found) return send(res, 200, { id: found.rec.id, status: found.rec.status, chunkSizeBytes: CHUNK, receivedChunks: [...found.chunks.keys()] });
      if (b.sizeBytes === 0) return err(res, 415, "unsupported_file");
      if (b.sizeBytes > maxBytes) return err(res, 413, "file_too_large");
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const rec = { id, clientId: b.clientId, fileName: b.fileName, source: b.source, status: "uploading", errorCode: null, retryable: false, durationMs: null, createdAt: now, updatedAt: now };
      uploaded.push({ rec, size: b.sizeBytes, chunks: new Map() });
      send(res, 201, { id, status: "uploading", chunkSizeBytes: CHUNK, receivedChunks: [] });
    });
  }
  const chunkRoute = /^\/api\/recordings\/([0-9a-f-]{36})\/chunks\/(\d+)$/.exec(url.pathname);
  if (chunkRoute && req.method === "PUT") {
    return readBody(req).then((bytes) => {
      const u = uploaded.find((x) => x.rec.id === chunkRoute[1]);
      if (!u) return err(res, 404, "recording_not_found");
      if (u.rec.status !== "uploading") return err(res, 409, "not_uploading");
      const index = Number(chunkRoute[2]);
      const pieces = Math.ceil(u.size / CHUNK);
      const expected = index === pieces - 1 ? u.size - index * CHUNK : CHUNK;
      if (index >= pieces || bytes.length !== expected) return err(res, 400, "bad_chunk");
      u.chunks.set(index, bytes.length);
      u.data = u.data ?? new Map();
      u.data.set(index, bytes);
      send(res, 204);
    });
  }
  const completeRoute = /^\/api\/recordings\/([0-9a-f-]{36})\/complete$/.exec(url.pathname);
  if (completeRoute && req.method === "POST") {
    return readBody(req).then(() => {
      const u = uploaded.find((x) => x.rec.id === completeRoute[1]);
      if (!u) return err(res, 404, "recording_not_found");
      const pieces = Math.ceil(u.size / CHUNK);
      const missing = [...Array(pieces).keys()].filter((i) => !u.chunks.has(i));
      if (missing.length) return send(res, 409, { error: { code: "chunks_missing" }, missing });
      // Stand-in rule, not a decoder: a name starting "bad-" is refused, as the real back refuses undecodable files.
      if (u.rec.fileName.startsWith("bad-")) { uploaded.splice(uploaded.indexOf(u), 1); return err(res, 415, "unsupported_file"); }
      const file = path.join(store, `${u.rec.id}.bin`);
      fs.writeFileSync(file, Buffer.concat([...Array(pieces).keys()].map((i) => u.data.get(i))));
      const vd = spawnSync("ffmpeg", ["-nostdin", "-v", "info", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
      const max = /max_volume: (-?[\d.]+) dB/.exec(vd.stderr || "")?.[1];
      u.rec.status = max !== undefined && Number(max) < -60 ? "no_speech" : "done";
      console.log(`complete ${u.rec.id} source=${u.rec.source} file=${u.rec.fileName} bytes=${u.size} max_volume=${max} -> ${u.rec.status}`);
      send(res, 202, u.rec);
    });
  }
  err(res, 404, "recording_not_found");
}).listen(port, "127.0.0.1", () => console.log(`stub back (${mode}) on ${port}`));
