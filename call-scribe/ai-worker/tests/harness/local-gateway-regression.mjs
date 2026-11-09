// local-gateway-regression.mjs (Tefany, 2026-11-06) — TEST-101, REQ-101 AC-11. Local only, never the deployed gateway.
//
// PROVES: on a scratch copy of the gateway, status codes, selected headers, response shape and error cases match a
//   baseline taken from 790f63a, for the 10 Bruno requests, /tiers, and the auth/error cases below.
// DOES NOT PROVE: anything about real providers (every provider is stubbed, no key, no spend), the deployed gateway,
//   or the new audio endpoint. Reply text is not compared.
//
// Run with bun, from anywhere. <repo> is the develyst-ai path in machine.local.md; <work> is an empty scratch folder.
//   capture baseline:  bun local-gateway-regression.mjs capture --repo <repo> --rev 790f63a --work <work> --out baseline.json
//   capture later:     bun local-gateway-regression.mjs capture --repo <repo> --tree --work <work> --replay baseline.json --out after.json
//                      (--tree = the working tree, tracked + untracked, without ignored files; or --rev <sha>)
//   compare:           bun local-gateway-regression.mjs compare baseline.json after.json     (exit 0 = no difference)
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(new URL(import.meta.url).pathname);
const TEST_KEY = "tefany-test-key-not-real";
const OFF_KEY = "tefany-disabled-key-not-real";
const DUMMY = { OPENAI_API_KEY: "dummy", GEMINI_API_KEY: "dummy", XAI_API_KEY: "dummy", DEEPSEEK_API_KEY: "dummy", TAVILY_API_KEY: "dummy" };
const VALUE_KEYS = new Set(["success", "error", "provider", "model", "search", "query", "reason"]);

const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? undefined : process.argv[i + 1]; };
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: "buffer", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout;
};

// ── the scratch copy ───────────────────────────────────────────────────────────────────────────────────────────────
function makeCopy(repo, rev, work) {
  const dir = join(work, "copy");
  mkdirSync(dir, { recursive: true });
  if (rev) {
    const tar = join(work, "copy.tar");
    run("git", ["-C", repo, "archive", "-o", tar, rev]);
    run("tar", ["-xf", tar, "-C", dir]);
    rmSync(tar);
  } else {
    const files = run("git", ["-C", repo, "ls-files", "-co", "--exclude-standard", "-z"]).toString().split("\0").filter(Boolean);
    for (const f of files) cpSync(join(repo, f), join(dir, f));
  }
  for (const secret of [".env", "api-keys.json"]) rmSync(join(dir, secret), { force: true });
  run("bun", ["install", "--frozen-lockfile"], { cwd: dir, env: { PATH: process.env.PATH, HOME: process.env.HOME } });
  writeFileSync(join(dir, "api-keys.json"), JSON.stringify([
    { key: TEST_KEY, project: "tefany-test" },
    { key: OFF_KEY, project: "tefany-off", disabled: true },
  ]));
  return dir;
}

// ── the requests: Bruno files, frozen once in the baseline, plus cases the collection lacks ─────────────────────────
function brunoCases(dir) {
  const out = [];
  for (const f of readdirSync(join(dir, "bruno")).filter((n) => n.endsWith(".bru")).sort()) {
    const text = readFileSync(join(dir, "bruno", f), "utf8");
    const m = text.match(/^(get|post) \{[\s\S]*?url: \{\{baseUrl\}\}(\S*)/m);
    if (!m) throw new Error(`cannot parse ${f}`);
    const body = text.match(/^body:json \{\n([\s\S]*?)\n\}/m)?.[1];
    out.push({
      name: `bruno: ${f}`, server: "main", method: m[1].toUpperCase(), path: m[2] || "/",
      key: /Authorization: Bearer/.test(text) ? TEST_KEY : undefined,
      body: body === undefined ? undefined : JSON.stringify(JSON.parse(body)),
    });
  }
  if (out.length !== 10) throw new Error(`expected 10 Bruno requests, found ${out.length}`);
  return out;
}

const post = (name, path, body, extra = {}) => ({ name, server: "main", method: "POST", path, key: TEST_KEY, body: typeof body === "string" ? body : JSON.stringify(body), ...extra });
const say = (text) => ({ messages: [{ role: "user", content: text }] });

function extraCases() {
  const auth = ["/chat", "/chat/multi", "/search", "/search/classify"].flatMap((p) => [
    post(`auth: ${p} no header`, p, {}, { key: undefined }),
    post(`auth: ${p} unknown key`, p, {}, { key: "wrong-key" }),
    post(`auth: ${p} disabled key`, p, {}, { key: OFF_KEY }),
    post(`auth: ${p} wrong scheme`, p, {}, { key: undefined, rawAuth: `Basic ${TEST_KEY}` }),
  ]);
  return [
    { name: "open: GET /tiers", server: "main", method: "GET", path: "/tiers" },
    { name: "open: unknown route", server: "main", method: "GET", path: "/no-such-route" },
    { name: "open: GET /chat", server: "main", method: "GET", path: "/chat", key: TEST_KEY },
    { name: "open: CORS preflight /chat", server: "main", method: "OPTIONS", path: "/chat", origin: "https://example.invalid" },
    ...auth,
    post("400: /chat empty messages", "/chat", { messages: [] }),
    post("400: /chat no messages", "/chat", {}),
    post("400: /chat/multi no configs", "/chat/multi", {}),
    post("400: /search no query", "/search", {}),
    post("400: /search blank query", "/search", { query: "   " }),
    post("400: /search/classify no message", "/search/classify", {}),
    post("bad body: /chat not JSON", "/chat", "not json"),
    post("bad body: /chat/multi not JSON", "/chat/multi", "not json"),
    post("bad body: /search not JSON", "/search", "not json"),
    post("bad body: /chat multipart", "/chat", "--x\r\nContent-Disposition: form-data; name=\"a\"\r\n\r\nb\r\n--x--\r\n", { contentType: "multipart/form-data; boundary=x" }),
    post("provider down: /chat openai 429", "/chat", { provider: "openai", ...say("[[fail:openai]]") }),
    post("provider down: /chat gemini 429", "/chat", { provider: "gemini", ...say("[[fail:gemini]]") }),
    post("provider unknown: /chat", "/chat", { provider: "nobody", ...say("hello") }),
    post("provider slow: /chat timeout", "/chat", { provider: "xai", timeout: 50, ...say("[[slow]]") }),
    post("provider slow: /chat gemini timeout", "/chat", { provider: "gemini", timeout: 50, ...say("[[slow]]") }),
    post("tier: /chat flagship", "/chat", { provider: "openai", tier: "flagship", ...say("hello") }),
    post("tier: /chat default chain small", "/chat", { tier: "small", ...say("hello") }),
    post("fallback: deepseek down", "/chat", say("[[fail:deepseek]]")),
    post("fallback: three down", "/chat", say("[[fail:deepseek,xai,gemini]]")),
    post("fallback: all down", "/chat", say("[[fail:deepseek,xai,gemini,openai]]")),
    post("multi: one of two down", "/chat/multi", { configs: [{ provider: "xai", ...say("[[fail:xai]]") }, { provider: "openai", ...say("hello") }] }),
    post("search: tavily down", "/search", { query: "[[fail:tavily]]" }),
    post("classify: not JSON", "/search/classify", { message: "[[garbage]]" }),
    post("classify: model down", "/search/classify", { message: "[[fail:gemini]]" }),
    post("no provider keys: /chat openai", "/chat", { provider: "openai", ...say("hello") }, { server: "nokeys" }),
    post("no provider keys: /chat gemini", "/chat", { provider: "gemini", ...say("hello") }, { server: "nokeys" }),
    post("no provider keys: default chain", "/chat", say("hello"), { server: "nokeys" }),
    post("no provider keys: /search", "/search", { query: "hello" }, { server: "nokeys" }),
    post("auth off: /chat without a key", "/chat", { provider: "openai", ...say("hello") }, { server: "authoff", key: undefined }),
    post("no key file: fails closed", "/chat", { provider: "openai", ...say("hello") }, { server: "nokeyfile" }),
    post("search disabled: /search", "/search", { query: "hello" }, { server: "searchoff" }),
  ];
}

// ── the servers ────────────────────────────────────────────────────────────────────────────────────────────────────
const SERVERS = {
  main: { env: { AUTH_ENABLED: "true", ...DUMMY } },
  nokeys: { env: { AUTH_ENABLED: "true" } },
  authoff: { env: { AUTH_ENABLED: "false", ...DUMMY } },
  nokeyfile: { env: { AUTH_ENABLED: "true", ...DUMMY }, emptyCwd: true },
  searchoff: { env: { AUTH_ENABLED: "true", WEB_SEARCH_ENABLED: "false", ...DUMMY } },
};

async function startServer(dir, work, name) {
  const spec = SERVERS[name];
  const probe = Bun.serve({ port: 0, hostname: "localhost", fetch: () => new Response("") });
  const port = probe.port;
  probe.stop(true);
  const log = join(work, `outbound-${name}.jsonl`);
  writeFileSync(log, "");
  const cwd = spec.emptyCwd ? mkdtempSync(join(work, "empty-")) : dir;
  // process.execPath, not "bun": where "bun" on PATH is a shell wrapper, kill() stops only the wrapper and orphans the server.
  const proc = Bun.spawn([process.execPath, "--preload", join(HERE, "local-gateway-stub.ts"), join(dir, "src/index.ts")], {
    cwd, stdout: "ignore", stderr: "ignore",
    // A clean env on purpose: nothing real reaches the copy. The .env.example defaults are spelled out.
    env: { PATH: process.env.PATH, HOME: process.env.HOME, PORT: String(port), STUB_LOG: log, DEFAULT_PROVIDER: "gemini",
      DEFAULT_TEMPERATURE: "0.7", DEFAULT_MAX_TOKENS: "1024", DEFAULT_TIMEOUT: "30000", AI_DATETIME_TZ: "Asia/Bangkok", ...spec.env },
  });
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try { await fetch(base + "/"); return { base, log, proc }; } catch { await Bun.sleep(100); }
  }
  proc.kill();
  throw new Error(`server ${name} did not start`);
}

// ── what gets recorded ─────────────────────────────────────────────────────────────────────────────────────────────
function signature(v, key) {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.map((x) => signature(x));
  if (typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, signature(v[k], k)]));
  return VALUE_KEYS.has(key) ? v : typeof v;
}

// Runs on the raw JSON line, where the quotes around now are escaped.
const scrub = (text) => text.replace(/Current date\/time: .*? Treat this as \\"now\\"\./g, "<DATETIME>");

async function record(c, srv) {
  const headers = {};
  if (c.key) headers.Authorization = `Bearer ${c.key}`;
  if (c.rawAuth) headers.Authorization = c.rawAuth;
  if (c.body !== undefined) headers["Content-Type"] = c.contentType ?? "application/json";
  if (c.origin) { headers.Origin = c.origin; headers["Access-Control-Request-Method"] = "POST"; }
  const before = readFileSync(srv.log, "utf8").length;
  const res = await fetch(srv.base + c.path, { method: c.method, headers, body: c.body });
  const text = await res.text();
  let body;
  try {
    const parsed = JSON.parse(text);
    // The open GETs are configuration, not replies: their values count, so a dropped model is seen.
    body = c.method === "GET" && res.status === 200 ? { full: parsed } : { shape: signature(parsed) };
  } catch {
    body = { text };
  }
  const outbound = readFileSync(srv.log, "utf8").slice(before).split("\n").filter(Boolean).map(scrub).sort();
  return {
    name: c.name,
    status: res.status,
    headers: Object.fromEntries(["content-type", "access-control-allow-origin", "access-control-allow-methods"].map((h) => [h, res.headers.get(h)])),
    body,
    outbound: outbound.map((l) => JSON.parse(l)),
  };
}

async function capture() {
  const repo = arg("repo"), rev = arg("rev"), tree = process.argv.includes("--tree"), out = arg("out"), replay = arg("replay");
  if (!repo || !out || !arg("work") || (!rev && !tree)) throw new Error("capture needs --repo, --work, --out and --rev or --tree");
  const work = resolve(arg("work"));
  mkdirSync(work, { recursive: true });
  const dir = makeCopy(repo, rev, work);
  const cases = replay ? JSON.parse(readFileSync(replay, "utf8")).cases : [...brunoCases(dir), ...extraCases()];
  const results = [];
  try {
    for (const name of Object.keys(SERVERS)) {
      const subset = cases.filter((c) => c.server === name);
      if (!subset.length) continue;
      const srv = await startServer(dir, work, name);
      try {
        for (const c of subset) results.push(await record(c, srv));
      } finally {
        srv.proc.kill();
        await srv.proc.exited;
        // Exit of the child is not proof: only a refused connection is. Fail loudly rather than leak quietly.
        const stillUp = await fetch(srv.base + "/").then(() => true, () => false);
        if (stillUp) throw new Error(`server ${name} still answers on ${srv.base} after kill; stop it by hand`);
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  const refused = results.flatMap((r) => r.outbound).filter((o) => o.provider === "UNEXPECTED");
  writeFileSync(out, JSON.stringify({ source: rev ?? "working tree", cases, results }, null, 1) + "\n");
  console.log(`captured ${results.length} cases from ${rev ?? "working tree"} -> ${out}`);
  console.log(`outbound calls to the stub: ${results.flatMap((r) => r.outbound).length}; to an unexpected host: ${refused.length}`);
}

// ── compare ────────────────────────────────────────────────────────────────────────────────────────────────────────
function compare() {
  const [a, b] = process.argv.slice(3, 5).map((f) => JSON.parse(readFileSync(f, "utf8")));
  const after = new Map(b.results.map((r) => [r.name, r]));
  let diffs = 0;
  for (const r of a.results) {
    const o = after.get(r.name);
    if (!o) { console.log(`MISSING  ${r.name}`); diffs++; continue; }
    for (const part of ["status", "headers", "body", "outbound"]) {
      const x = JSON.stringify(r[part]), y = JSON.stringify(o[part]);
      if (x !== y) {
        diffs++;
        console.log(`DIFF     ${r.name} [${part}]\n  before: ${x.slice(0, 400)}\n  after:  ${y.slice(0, 400)}`);
      }
    }
  }
  console.log(`${a.results.length} cases compared (${a.source} vs ${b.source}): ${diffs} difference(s)`);
  process.exit(diffs ? 1 : 0);
}

const mode = process.argv[2];
if (mode === "capture") await capture();
else if (mode === "compare") compare();
else throw new Error("usage: capture | compare (see the head comment)");
process.exit(0);
