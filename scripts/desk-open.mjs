#!/usr/bin/env node
// desk-open.mjs — answer the desk-opening questions in a browser; the answers land in a file.
// Usage: node scripts/desk-open.mjs [--no-open]
//   Starts a local server on 127.0.0.1:4777 (next free port if taken), prints the URL and opens it in the
//   default browser (--no-open skips that). Ctrl+C stops it. No dependencies — Node built-ins only.
// API:
//   GET /                   the form (_templates/desk-open/form.html)
//   GET /api/questions      the form's words, roles and recommended team (_templates/desk-open/questions.json)
//   GET /api/desks          saved answer files: [{ desk, title, status, updatedAt }]
//   GET /api/desks/<desk>   one answer file, as stored (a v1 file comes back as v1; the form converts it)
//   PUT /api/desks/<desk>   write it (JSON body, <= 256 KB), v2 shape:
//     { desk, title, short, status, updatedAt,
//       mode:    { v: manual|dispatcher|long-run, by }    the team's work mode (options in questions.json)
//       project: { oneLine, forWhom, firstWork }            each { label, v, by }
//       team:    { nodes: [{ id, kind: you|agent|person, role, also[], name, duties[], by }],
//                  edges: [{ from, to, by }] }
//       code:    { repos, git, systems, secrets }            each { label, v, by } (secrets also has note) }
//     Unknown keys are dropped on the way in, so derived values (teams, session names) never reach the file.
// Writes only <workspace>/desk-open/<desk>.json (pretty-printed, temp file + rename). Nothing else.
// Owned by Marie. Origin: MARIE-ORDER-2026-10-12-desk-open-form.md (Atlas) — the operator found answering
// _templates/DESK-OPEN.md as Markdown too hard and asked for a form that saves to a file.
// v2: MARIE-ORDER-2026-10-14-desk-open-form-v2.md — three steps, the team is a canvas the operator draws.
// mode: MARIE-ORDER-2026-10-14-desk-open-work-mode.md — the team's work mode, chosen on step 2.

import { createServer } from "node:http";
import { readFileSync, writeFileSync, renameSync, readdirSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const WS = join(dirname(fileURLToPath(import.meta.url)), "..");
const TPL = join(WS, "_templates", "desk-open");
const OUT = join(WS, "desk-open");
const HOST = "127.0.0.1";
const FIRST_PORT = 4777;
const LAST_PORT = FIRST_PORT + 20;
const MAX_BODY = 256 * 1024;
const DESK_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;
const STATUSES = ["draft", "answered"];

function send(res, code, body, type = "application/json; charset=utf-8") {
  const data = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(data);
}
const fail = (res, code, error) => send(res, code, { error });

function readJson(p) { return JSON.parse(readFileSync(p, "utf8")); }

function listDesks() {
  if (!existsSync(OUT)) return [];
  const out = [];
  for (const f of readdirSync(OUT).sort()) {
    if (!f.endsWith(".json")) continue;
    const desk = f.slice(0, -5);
    if (!DESK_RE.test(desk)) continue;
    try {
      const d = readJson(join(OUT, f));
      out.push({ desk, title: d.title || desk, status: d.status || "draft", updatedAt: d.updatedAt || null });
    } catch {
      out.push({ desk, title: desk, status: "unreadable", updatedAt: null });
    }
  }
  return out;
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    // Over the limit: stop keeping chunks but drain the request, so the client still gets the 413 answer.
    req.on("data", (c) => { size += c.length; if (size <= MAX_BODY) chunks.push(c); });
    req.on("end", () => {
      if (size > MAX_BODY) reject(Object.assign(new Error("body larger than 256 KB"), { code: 413 }));
      else resolveBody(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

const str = (x, max) => (typeof x === "string" ? x.slice(0, max) : "");
const strList = (x) => (Array.isArray(x) ? x.filter((s) => typeof s === "string").map((s) => s.slice(0, 60)) : []);
const by = (x) => (x && x.by === "operator" ? "operator" : "template");
const NODE_KINDS = ["you", "agent", "person"];
const NODE_ID = /^[a-z0-9-]{1,40}$/;

function normValues(group, src, fields) {
  const out = {};
  for (const f of fields.filter((f) => f.group === group)) {
    const x = src && typeof src === "object" && src[f.id] && typeof src[f.id] === "object" ? src[f.id] : {};
    const v = f.type === "multi" ? strList(x.v !== undefined ? x.v : f.default) : str(x.v !== undefined ? x.v : f.default, 4000);
    out[f.id] = { label: f.label, v, ...(f.noteFor ? { note: str(x.note, 2000) } : {}), by: by(x) };
  }
  return out;
}

// An unknown or missing mode falls back to the template default, stamped "template".
function normMode(x, mode) {
  const ok = x && typeof x === "object" && mode.options.some((o) => o.id === x.v);
  return ok ? { v: x.v, by: by(x) } : { v: mode.default, by: "template" };
}

function normTeam(t) {
  const nodes = [];
  const ids = new Set();
  for (const n of t && Array.isArray(t.nodes) ? t.nodes : []) {
    if (!n || typeof n !== "object" || !NODE_ID.test(n.id) || ids.has(n.id) || !NODE_KINDS.includes(n.kind)) continue;
    ids.add(n.id);
    nodes.push({
      id: n.id, kind: n.kind, role: str(n.role, 40),
      also: n.kind === "agent" ? strList(n.also) : [],
      name: str(n.name, 60).trim(),
      duties: n.kind === "you" ? strList(n.duties) : [],
      by: by(n),
    });
  }
  const edges = [];
  const seen = new Set();
  for (const e of t && Array.isArray(t.edges) ? t.edges : []) {
    if (!e || !ids.has(e.from) || !ids.has(e.to) || e.from === e.to) continue;
    const key = [e.from, e.to].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ from: e.from, to: e.to, by: by(e) });
  }
  return { nodes, edges };
}

async function writeDesk(desk, req, res) {
  let raw;
  try { raw = await readBody(req); } catch (e) { return fail(res, e.code === 413 ? 413 : 400, e.message); }
  let d;
  try { d = JSON.parse(raw); } catch { return fail(res, 400, "body is not valid JSON"); }
  if (!d || typeof d !== "object" || Array.isArray(d)) return fail(res, 400, "body must be a JSON object");
  if (d.status !== undefined && !STATUSES.includes(d.status)) return fail(res, 400, `status must be one of ${STATUSES.join(", ")}`);
  // The field label travels with each value so a reader needs no other file; questions.json is its source.
  const { fields, mode } = readJson(join(TPL, "questions.json"));
  const doc = {
    desk,
    title: typeof d.title === "string" && d.title.trim() ? d.title.trim() : desk,
    short: str(d.short, 6).trim().toUpperCase(),
    status: d.status || "draft",
    updatedAt: new Date().toISOString(),
    mode: normMode(d.mode, mode),
    project: normValues("project", d.project, fields),
    team: normTeam(d.team),
    code: normValues("code", d.code, fields),
  };
  mkdirSync(OUT, { recursive: true });
  const target = join(OUT, `${desk}.json`);
  const tmp = join(OUT, `.${desk}.json.${process.pid}.tmp`);
  try {
    writeFileSync(tmp, JSON.stringify(doc, null, 2) + "\n", "utf8");
    renameSync(tmp, target);
  } catch (e) {
    try { unlinkSync(tmp); } catch {}
    return fail(res, 500, `could not write: ${e.message}`);
  }
  send(res, 200, doc);
}

const server = createServer(async (req, res) => {
  // Raw path, not new URL(): URL parsing would resolve "/api/desks/../x" away instead of rejecting it.
  const path = req.url.split("?")[0];
  try {
    if (path === "/" && req.method === "GET") return send(res, 200, readFileSync(join(TPL, "form.html"), "utf8"), "text/html; charset=utf-8");
    if (path === "/api/questions" && req.method === "GET") return send(res, 200, readJson(join(TPL, "questions.json")));
    if (path === "/api/desks" && req.method === "GET") return send(res, 200, listDesks());
    if (path.startsWith("/api/desks/")) {
      let desk;
      try { desk = decodeURIComponent(path.slice("/api/desks/".length)); } catch { return fail(res, 400, "bad desk name"); }
      if (!DESK_RE.test(desk)) return fail(res, 400, "desk must match ^[a-z0-9][a-z0-9-]{1,40}$");
      const file = join(OUT, `${desk}.json`);
      if (req.method === "GET") return existsSync(file) ? send(res, 200, readFileSync(file, "utf8")) : fail(res, 404, "no such desk");
      if (req.method === "PUT") return writeDesk(desk, req, res);
      return fail(res, 405, "method not allowed");
    }
    fail(res, 404, "not found");
  } catch (e) {
    fail(res, 500, e.message);
  }
});

function openBrowser(u) {
  const [cmd, args] =
    process.platform === "darwin" ? ["open", [u]] :
    process.platform === "win32" ? ["cmd", ["/c", "start", "", u]] :
    ["xdg-open", [u]];
  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.on("error", () => console.log("(could not open a browser — open the URL above yourself)"));
    child.unref();
  } catch {
    console.log("(could not open a browser — open the URL above yourself)");
  }
}

// One "listening" handler for the whole run: a callback passed to each listen() call would survive a failed
// attempt and fire later with the old port (v1 printed 4777 and 4778 when 4777 was busy).
function onBusy(e) {
  if (e.code === "EADDRINUSE" && tryPort < LAST_PORT) return listen(tryPort + 1);
  console.error(`cannot start: ${e.message}`);
  process.exit(1);
}
let tryPort = FIRST_PORT;
function listen(port) {
  tryPort = port;
  server.once("error", onBusy);
  server.listen(port, HOST);
}
server.on("listening", () => {
  server.removeListener("error", onBusy);
  const u = `http://${HOST}:${server.address().port}/`;
  console.log(`desk-open: ${u}  (answers are saved to desk-open/<desk>.json — Ctrl+C to stop)`);
  if (!process.argv.includes("--no-open")) openBrowser(u);
});
listen(FIRST_PORT);
