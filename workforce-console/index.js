// Host half of the workforce console: reads the workspace on disk, serves a
// status snapshot over HTTP for the Client panel, and exposes it as a tool.
// v0.5.0: the gate's own verdict per desk (never a threshold of our own), seats
// read from a table in PLUGINS.md, the inbox as the ball line, Harness sessions
// for the DeepSeek seats, and a compact form of the tool answer.
import { execFile, spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const inject = ["tools", "webServer", "workingDirectory", "workspaceRegistry"];

// Used only when PLUGINS.md has no readable `## Seats` table.
const FALLBACK_SEATS = [
  { name: "Atlas", file: "ATLAS.md", role: "architect", engine: "claude" },
  { name: "Marie", file: "MARIE.md", role: "operations", engine: "claude" },
  { name: "Otto", file: "OTTO.md", role: "platform", engine: "claude" },
  { name: "Bunny", file: "BUNNY.md", role: "librarian", engine: "claude" },
  { name: "ISO", file: "ISO.md", role: "verifier", engine: "deepseek" },
  { name: "PokerVault", file: "POKERVAULT.md", role: "access", engine: "deepseek" },
];

const QUIET_DAYS = 21;
const GATE_TTL_MS = 5 * 60 * 1000;
const cache = { at: 0, root: null, data: null };
const gateCache = new Map();

// ---------------------------------------------------------------- Claude CLI
let claudeCache;

function isFile(value) {
  try {
    return existsSync(value) && statSync(value).isFile();
  } catch {
    return false;
  }
}

function versionKey(value) {
  return String(value)
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((part) => Number(part));
}

function compareVersions(a, b) {
  const left = versionKey(a);
  const right = versionKey(b);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }
  return String(a).localeCompare(String(b));
}

function onPath(names) {
  const dirs = String(process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");
  for (const dir of dirs) {
    if (!dir) continue;
    for (const name of names) {
      const candidate = join(dir, name);
      if (isFile(candidate)) return candidate;
    }
  }
  return null;
}

function appBundledCli() {
  if (process.platform === "win32") {
    const base = process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, "Claude-Data")
      : join(homedir(), "AppData", "Local", "Claude-Data");
    let apps = [];
    try {
      apps = readdirSync(base, { withFileTypes: true }).filter((entry) => entry.isDirectory());
    } catch {
      return null;
    }
    const found = [];
    for (const app of apps) {
      const code = join(base, app.name, "claude-code");
      let versions = [];
      try {
        versions = readdirSync(code, { withFileTypes: true }).filter((entry) => entry.isDirectory());
      } catch {
        continue;
      }
      for (const version of versions) {
        const versionDir = join(code, version.name);
        let hashes = [];
        try {
          hashes = readdirSync(versionDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
        } catch {
          continue;
        }
        for (const hash of hashes) {
          const exe = join(versionDir, hash.name, "claude.exe");
          if (isFile(exe)) found.push({ exe, version: version.name });
        }
      }
    }
    if (!found.length) return null;
    found.sort((a, b) => compareVersions(b.version, a.version));
    return found[0].exe;
  }
  const candidates = [join(homedir(), ".local", "bin", "claude"), join(homedir(), ".claude", "local", "claude")];
  for (const candidate of candidates) if (isFile(candidate)) return candidate;
  return null;
}

export function resolveClaude() {
  if (claudeCache !== undefined) return claudeCache;
  const envPath = process.env.CLAUDE_BIN;
  if (envPath) {
    claudeCache = isFile(envPath)
      ? { bin: envPath, shell: false, source: "CLAUDE_BIN" }
      : { bin: null, shell: false, source: "CLAUDE_BIN", error: "CLAUDE_BIN does not name a file: " + envPath };
    return claudeCache;
  }
  const names = process.platform === "win32" ? ["claude.exe", "claude.cmd", "claude.bat", "claude"] : ["claude"];
  const found = onPath(names);
  if (found) {
    const ext = found.slice(found.lastIndexOf(".")).toLowerCase();
    claudeCache = {
      bin: found,
      shell: process.platform === "win32" && (ext === ".cmd" || ext === ".bat"),
      source: "PATH",
    };
    return claudeCache;
  }
  const bundled = appBundledCli();
  if (bundled) {
    claudeCache = { bin: bundled, shell: false, source: "app bundle" };
    return claudeCache;
  }
  claudeCache = {
    bin: null,
    shell: false,
    source: "none",
    error:
      process.platform === "win32"
        ? "claude CLI not found: not on PATH, and no Claude-Data\\*\\claude-code\\<version>\\*\\claude.exe"
        : "claude CLI not found on PATH or in ~/.local/bin",
  };
  return claudeCache;
}

function runClaudeBin(args, cwd, timeout) {
  return new Promise((resolve) => {
    const claude = resolveClaude();
    if (!claude.bin) {
      resolve({ ok: false, error: claude.error || "claude CLI not found", stdout: "" });
      return;
    }
    execFile(
      claude.bin,
      args,
      { cwd, timeout, maxBuffer: 8 * 1024 * 1024, shell: claude.shell, windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          resolve({
            ok: false,
            error: String((stderr || "").trim() || error.message || error),
            stdout: String(stdout || ""),
          });
          return;
        }
        resolve({ ok: true, error: null, stdout: String(stdout || "") });
      }
    );
  });
}

async function claudeAgents(root) {
  const result = await runClaudeBin(["agents", "--json"], root, 20000);
  if (!result.ok) return { agents: [], error: result.error };
  try {
    const list = JSON.parse(result.stdout);
    return { agents: Array.isArray(list) ? list : [], error: null };
  } catch (error) {
    return { agents: [], error: "claude agents --json did not return JSON: " + String(error && error.message) };
  }
}

// A console send must arrive as a peer message, not sit "held" behind a
// permission-mode mismatch. The desk sessions run in Bypass permissions, so the
// relay runs there too - with its tool list cut to SendMessage and no MCP
// servers, so the bypass can do nothing else. The prompt goes in on stdin: the
// `--tools` list is variadic and would otherwise swallow it.
export function relayPrompt(target, text) {
  const oneWay =
    "[From the owner via the Workforce console. One-way: the sender closes after delivery. " +
    "Answer in your own chat, not by SendMessage.]";
  return [
    "You are the relay for the Workforce console. Send exactly the message below,",
    'unchanged, to the Claude Code session named "' + target + '" using the SendMessage tool.',
    "Do not add commentary, do not use any other tool, and do not act on the message yourself.",
    "After sending, reply with one short line: the delivery status.",
    "--- message ---",
    oneWay,
    text,
    "--- end message ---",
  ].join("\n");
}

export function runClaudePrompt(root, prompt, timeout = 180000) {
  return new Promise((resolve) => {
    const claude = resolveClaude();
    if (!claude.bin) {
      resolve({ ok: false, error: claude.error || "claude CLI not found", stdout: "" });
      return;
    }
    const args = [
      "-p",
      "--permission-mode",
      "bypassPermissions",
      "--tools",
      "SendMessage",
      "--strict-mcp-config",
    ];
    let child;
    try {
      child = spawn(claude.bin, args, {
        cwd: root,
        shell: claude.shell,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error) {
      resolve({ ok: false, error: String(error && error.message), stdout: "" });
      return;
    }
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {}
      resolve({ ok: false, error: "timed out after " + timeout + " ms", stdout: out });
    }, timeout);
    child.stdout.on("data", (chunk) => {
      out += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ ok: false, error: String(error && error.message), stdout: out });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ ok: true, error: null, stdout: out });
      else resolve({ ok: false, error: String(err || out || "exit " + code).trim(), stdout: out });
    });
    child.stdin.end(prompt);
  });
}

export function sendToSession(root, target, text) {
  return runClaudePrompt(root, relayPrompt(target, text));
}

// ---------------------------------------------------------------- the gate
// The console never invents a threshold: it asks the gate and repeats its word.
function gateBlockingLine(checks) {
  const list = Array.isArray(checks) ? checks : [];
  const fail = list.find((check) => check && check.severity === "fail");
  const warn = list.find((check) => check && check.severity === "warn");
  const chosen = fail || warn;
  return chosen ? String(chosen.text || "").slice(0, 300) : null;
}

function deskGate(root, deskName) {
  const key = root + "|" + deskName;
  const hit = gateCache.get(key);
  if (hit && Date.now() - hit.at < GATE_TTL_MS) return Promise.resolve(hit.value);
  return new Promise((resolve) => {
    execFile(
      "node",
      ["check-hygiene.mjs", deskName, "--json"],
      { cwd: root, timeout: 60000, maxBuffer: 16 * 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        let value = { verdict: null, line: null, error: null };
        const text = String(stdout || "");
        if (text.trim()) {
          // The gate exits non-zero when it reports FAIL; its stdout is still the answer.
          try {
            const json = JSON.parse(text);
            value = {
              verdict: json && json.result ? String(json.result) : null,
              line: gateBlockingLine(json && json.checks),
              error: null,
            };
          } catch (parseError) {
            value = { verdict: null, line: null, error: "gate output was not JSON" };
          }
        } else {
          value = { verdict: null, line: null, error: String((error && error.message) || "the gate printed nothing") };
        }
        gateCache.set(key, { at: Date.now(), value });
        resolve(value);
      }
    );
  });
}

// ---------------------------------------------------------------- the files
export function parseTeams(text) {
  const lines = String(text || "").split(/\r?\n/);
  const start = lines.findIndex((line) => /^\|\s*Name\s*\|/.test(line));
  if (start < 0) return [];
  const people = [];
  const seen = new Set();
  for (let i = start + 2; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 2) continue;
    const name = cells[0].replace(/`/g, "");
    const roleCell = cells[1];
    if (!name || !roleCell) continue;
    const [role, team = ""] = roleCell.split(/[\u00b7.]/).map((part) => part.trim());
    const key = name + "|" + role;
    if (seen.has(key)) continue;
    seen.add(key);
    people.push({
      name,
      role: role || roleCell,
      team,
      inbox: (cells[3] || "").replace(/`/g, ""),
      session: (cells[4] || "").replace(/`/g, ""),
    });
  }
  return people;
}

// Seats are data: the `## Seats` table in PLUGINS.md, so a new workspace
// identity is a row, not a code edit.
export function parseSeats(text) {
  const lines = String(text || "").split(/\r?\n/);
  const start = lines.findIndex((line) => /^\|\s*name\s*\|\s*charter\s*\|/i.test(line));
  if (start < 0) return [];
  const seats = [];
  for (let i = start + 2; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 3) continue;
    const name = cells[0].replace(/`/g, "");
    if (!name) continue;
    seats.push({
      name,
      file: cells[1].replace(/`/g, "") || name.toUpperCase() + ".md",
      role: cells[2] || "",
      engine: (cells[3] || "claude").toLowerCase() === "deepseek" ? "deepseek" : "claude",
    });
  }
  return seats;
}

function readSeats(root) {
  try {
    const seats = parseSeats(readFileSync(join(root, "PLUGINS.md"), "utf8"));
    if (seats.length) return seats;
  } catch {}
  return FALLBACK_SEATS;
}

function nameTokens(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function teamKey(team) {
  const match = /^[A-Za-z0-9]+/.exec(String(team || "").trim());
  return match ? match[0].toUpperCase() : "ALL";
}

function cleanName(value) {
  return String(value || "").replace(/^@/, "").trim();
}

// A desk's own `## Chain` block wins; otherwise the chain follows the roster:
// owner-PM, PM-QA, PM-SA per team, SA-BE and SA-FE inside that team.
export function parseChain(text) {
  const block = /```chain[^\n]*\n([\s\S]*?)```/i.exec(String(text || ""));
  if (!block) return null;
  const links = [];
  for (const raw of block[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(.+?)\s*(?:\u2194|\u21c4|<->|--)\s*(.+)$/.exec(line);
    if (!match) continue;
    links.push({ from: cleanName(match[1]), to: cleanName(match[2]) });
  }
  return links.length ? links : null;
}

export function defaultChain(people) {
  const links = [];
  const pm = people.find((person) => person.role === "PM");
  if (!pm) return links;
  links.push({ from: "owner", to: pm.name });
  for (const qa of people.filter((person) => person.role === "QA")) {
    links.push({ from: pm.name, to: qa.name });
  }
  for (const sa of people.filter((person) => person.role === "SA")) {
    links.push({ from: pm.name, to: sa.name });
    for (const role of ["BE", "FE"]) {
      for (const member of people.filter(
        (person) => person.role === role && teamKey(person.team) === teamKey(sa.team)
      )) {
        links.push({ from: sa.name, to: member.name });
      }
    }
  }
  return links;
}

// Inbox messages name their sender in one of the two shapes the desks use:
// `From <Name> ...` or `## ... <Name> -> <Name> ...`. A `#`/`>` line without a
// sender is the file's preamble; body lines are not messages.
export function parseInboxMessages(text) {
  const counts = new Map();
  let total = 0;
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(">")) continue;
    let sender = null;
    const from = /^From\s+@?([A-Za-z][A-Za-z0-9-]*)/i.exec(line);
    if (from) sender = from[1];
    else if (line.startsWith("#") && line.includes("\u2192")) {
      const before = line.split("\u2192")[0].replace(/^#+\s*/, "");
      const names = (before.match(/@?[A-Za-z][A-Za-z0-9-]*/g) || []).filter(
        (name) => !/^(From|To|and|see|the|at)$/i.test(name)
      );
      if (names.length) sender = cleanName(names[names.length - 1]);
    } else {
      continue;
    }
    total += 1;
    if (sender) counts.set(sender, (counts.get(sender) || 0) + 1);
  }
  return {
    total,
    senders: [...counts.entries()].map(([from, count]) => ({ from, count })),
  };
}

// Sessions all run with cwd = workspace root, so the cwd cannot tell desks
// apart. The name is the only key, and it only matches when it says the same
// thing: `Sector-SOM` and `SOM-Sector` are one session, `Porter-CSC` is not
// `SOM-Porter` (the same names sit on every desk).
export function sameSessionName(left, right) {
  const a = nameTokens(left);
  const b = nameTokens(right);
  if (!a.length || !b.length) return false;
  if (a.length !== b.length) return false;
  return a.every((token) => b.includes(token));
}

// Seat names are workspace-wide and unique, so a session may carry more words.
export function liveSession(agents, name) {
  const wanted = nameTokens(name);
  if (!wanted.length) return null;
  for (const agent of agents) {
    const have = nameTokens(agent && agent.name);
    if (wanted.every((token) => have.includes(token))) return agent;
  }
  return null;
}

function sessionByName(agents, sessionName) {
  if (!sessionName) return null;
  return agents.find((agent) => sameSessionName(agent && agent.name, sessionName)) || null;
}

// ---------------------------------------------------------------- the inbox
// Since ORDER 61 a hand-off IS a line in `inbox/<ROLE>.md`, so the ball is that
// file. Its header is a preamble of `#` headings and `>` quotes; anything below
// that is mail. The file's mtime is the only age this console can measure; it
// never claims to know when a line was read.
function mailWaiting(file) {
  if (!file || !isFile(file)) return null;
  try {
    const text = readFileSync(file, "utf8");
    const parsed = parseInboxMessages(text);
    if (!parsed.total) return null;
    const ageMinutes = Math.max(0, Math.round((Date.now() - statSync(file).mtimeMs) / 60000));
    return { lines: parsed.total, ageMinutes, senders: parsed.senders };
  } catch {
    return null;
  }
}

function deskList(root, agents) {
  const out = [];
  let entries = [];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const desk = join(root, entry.name, "ai-worker");
    const board = join(desk, "board.md");
    if (!existsSync(board)) continue;
    let boardKB = 0;
    try {
      boardKB = Math.round(statSync(board).size / 1024);
    } catch {}
    let lastLog = null;
    let logAgeDays = null;
    const logs = join(desk, "log");
    try {
      const dates = readdirSync(logs)
        .filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
        .sort();
      lastLog = dates.length ? dates[dates.length - 1].slice(0, 10) : null;
      if (lastLog) logAgeDays = Math.floor((now - Date.parse(lastLog + "T23:59:59")) / 86400000);
    } catch {}
    let people = [];
    let teamsText = "";
    const teams = join(desk, "TEAMS.md");
    if (existsSync(teams)) {
      try {
        teamsText = readFileSync(teams, "utf8");
        people = parseTeams(teamsText);
      } catch {}
    }
    const ownChain = parseChain(teamsText);
    const chain = { links: ownChain || defaultChain(people), derived: !ownChain };
    const roster = people.map((person) => {
      const live = sessionByName(agents, person.session);
      const mail = person.inbox ? mailWaiting(join(desk, person.inbox)) : null;
      const state = live ? live.status : null;
      return {
        name: person.name,
        role: person.role,
        team: person.team,
        inbox: person.inbox,
        session: person.session,
        status: state,
        sessionName: live ? live.name : null,
        mail,
        messages: mail ? mail.senders : [],
        // A seat holding mail with nothing moving is the ball.
        ball: Boolean(mail) && !(state === "busy" || state === "waiting"),
      };
    });
    out.push({
      name: entry.name,
      boardKB,
      lastLog,
      logAgeDays,
      quiet: logAgeDays == null || logAgeDays > QUIET_DAYS,
      live: roster.filter((person) => person.status).length,
      balls: roster.filter((person) => person.ball).length,
      chain,
      people: roster,
    });
  }
  out.sort((a, b) => {
    const left = a.lastLog || "";
    const right = b.lastLog || "";
    if (left !== right) return left < right ? 1 : -1;
    if (a.live !== b.live) return b.live - a.live;
    return a.name.localeCompare(b.name);
  });
  return out;
}

// The workspace's naming: `REQUEST-<from>-to-<seat>-<date>-<slug>.md`. A REQUEST
// is open until a reply heading is followed by something other than `(pending)`.
export function isOpenRequest(text) {
  const match = /^##\s*(?:[^\n]*\banswer\b[^\n]*|Reply)[^\n]*$/im.exec(String(text || ""));
  if (!match) return true;
  const rest = String(text).slice(match.index + match[0].length);
  const first = rest.split(/\r?\n/).find((line) => line.trim() !== "");
  if (!first) return true;
  return /^\(pending\)/i.test(first.trim());
}

export function requestIndex(roots) {
  const index = new Map();
  const seen = new Set();
  for (const root of roots) {
    if (typeof root !== "string" || !root) continue;
    const key = root.replace(/[\\/]+$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    let files = [];
    try {
      files = readdirSync(root).filter((name) => /^REQUEST-.*\.md$/.test(name));
    } catch {
      continue;
    }
    for (const file of files) {
      const match = /-to-([a-z0-9]+)-/i.exec(file);
      if (!match) continue;
      const seat = match[1].toLowerCase();
      const entry = index.get(seat) || { requests: 0, open: 0, samples: [] };
      entry.requests += 1;
      try {
        const text = readFileSync(join(root, file), "utf8");
        if (isOpenRequest(text)) {
          entry.open += 1;
          if (entry.samples.length < 3) entry.samples.push(file);
        }
      } catch {}
      index.set(seat, entry);
    }
  }
  return index;
}

// Harness sessions are the ones the owner sees in this app's sidebar. The
// agents service carries only ids, so the title and cwd come from the session
// cache the Harness itself writes.
function harnessSessions(ctx) {
  let ids = [];
  try {
    const service = ctx.get ? ctx.get("agents") : null;
    if (service) ids = service.list().map((agent) => String(agent.id));
  } catch {}
  if (!ids.length) return [];
  const home = process.env.DSH_HOME || join(homedir(), ".dsh");
  const dir = join(home, "storages", "session_projcache", "sessions");
  return ids.map((rawId) => {
    const id = rawId.replace(/^session-/, "");
    let title = null;
    let cwd = null;
    let lastActivity = null;
    try {
      const json = JSON.parse(readFileSync(join(dir, "session-" + id + ".json"), "utf8"));
      const record = (json && json.record) || {};
      const rows = record.rows || {};
      title = rows.title && rows.title.val ? String(rows.title.val) : null;
      cwd = (record.identity && record.identity.cwd) || (rows.workingDirectory && rows.workingDirectory.val) || null;
      lastActivity =
        rows.timeContext && rows.timeContext.val && rows.timeContext.val.lastMessageTime
          ? Number(rows.timeContext.val.lastMessageTime)
          : null;
    } catch {}
    return { id, title, cwd, lastActivity };
  });
}

function harnessFor(harness, name) {
  const wanted = nameTokens(name);
  if (!wanted.length) return null;
  return (
    harness.find((session) => {
      const have = nameTokens(session.title);
      return have.length && wanted.every((token) => have.includes(token));
    }) || null
  );
}

function workspaceSeats(roots, agents, harness, seatList) {
  const index = requestIndex(roots);
  return seatList.map((seat) => {
    const present = roots.some((root) => {
      try {
        return existsSync(join(root, seat.file));
      } catch {
        return false;
      }
    });
    const entry = index.get(seat.name.toLowerCase());
    const claudeLive = seat.engine === "claude" ? liveSession(agents, seat.name) : null;
    const harnessLive = seat.engine === "deepseek" ? harnessFor(harness, seat.name) : null;
    const state =
      seat.engine === "deepseek"
        ? harnessLive
          ? "live"
          : "no live view"
        : claudeLive
        ? claudeLive.status
        : "no session";
    return {
      name: seat.name,
      role: seat.role,
      engine: seat.engine,
      present,
      state,
      sessionName: claudeLive ? claudeLive.name : harnessLive ? harnessLive.title : null,
      open: entry ? entry.open : 0,
      requests: entry ? entry.requests : 0,
      samples: entry ? entry.samples : [],
    };
  });
}

function candidateRoots(ctx, agents) {
  const roots = [];
  const push = (value) => {
    if (typeof value === "string" && value && !roots.includes(value)) roots.push(value);
  };
  try {
    for (const workspace of ctx.workspaceRegistry.list()) push(workspace && workspace.path);
  } catch {}
  for (const agent of agents) push(agent && agent.cwd);
  push(ctx.workingDirectory.defaultDirectory);
  return roots;
}

function pickRoot(ctx, agents) {
  const live = new Set(agents.map((agent) => agent && agent.cwd).filter((value) => typeof value === "string"));
  let best = null;
  let bestScore = -1;
  for (const root of candidateRoots(ctx, agents)) {
    const score = (live.has(root) ? 1000 : 0) + deskList(root, agents).length;
    if (score > bestScore) {
      bestScore = score;
      best = root;
    }
  }
  return best || ctx.workingDirectory.defaultDirectory;
}

async function snapshot(ctx) {
  const loaded = await claudeAgents(ctx.workingDirectory.defaultDirectory);
  const agents = loaded.agents;
  const root = pickRoot(ctx, agents);
  if (cache.data && cache.root === root && Date.now() - cache.at < 3000) {
    return cache.data;
  }
  const roots = candidateRoots(ctx, agents);
  const claude = resolveClaude();
  const harness = harnessSessions(ctx);
  const desks = deskList(root, agents);
  const gates = await Promise.all(desks.map((desk) => deskGate(root, desk.name)));
  const gated = desks.map((desk, index) => ({ ...desk, gate: gates[index] }));
  const data = {
    generatedAt: new Date().toISOString(),
    workspace: root,
    claudeBin: claude.bin,
    claudeSource: claude.source,
    claudeError: loaded.error || null,
    desks: gated,
    claude: agents.map((agent) => ({
      name: agent.name,
      status: agent.status,
      kind: agent.kind,
      sessionId: agent.sessionId,
      cwd: agent.cwd,
    })),
    harness,
    seats: workspaceSeats([root, ...roots], agents, harness, readSeats(root)),
  };
  cache.at = Date.now();
  cache.root = root;
  cache.data = data;
  return data;
}

function compact(data) {
  return {
    generatedAt: data.generatedAt,
    workspace: data.workspace,
    claudeBin: data.claudeBin,
    claudeError: data.claudeError,
    sessions: data.claude.length,
    harness: data.harness.map((session) => session.title || session.id),
    desks: data.desks.map((desk) => ({
      name: desk.name,
      gate: desk.gate && desk.gate.verdict,
      gateLine: desk.gate && desk.gate.line,
      live: desk.live,
      balls: desk.balls,
      quiet: desk.quiet,
      log: desk.lastLog,
    })),
    seats: data.seats.map((seat) => ({
      name: seat.name,
      engine: seat.engine,
      state: seat.state,
      open: seat.open,
    })),
  };
}

function respond(res, body, status = 200) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) req.destroy();
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function handlePost(ctx, body) {
  const loaded = await claudeAgents(ctx.workingDirectory.defaultDirectory);
  const agents = loaded.agents;
  const root = pickRoot(ctx, agents);
  const seatList = readSeats(root);

  const action = String((body && body.action) || "");
  const text = String((body && body.text) || "").slice(0, 4000);
  if (!text.trim()) return { status: 400, body: { ok: false, error: "empty message" } };

  if (action === "send") {
    const target = String((body && body.target) || "");
    const known = agents.some((agent) => agent.name === target);
    if (!known) {
      return { status: 400, body: { ok: false, error: "unknown session: " + target } };
    }
    const result = await sendToSession(root, target, text);
    return {
      status: 200,
      body: {
        ok: result.ok,
        action: "send",
        target,
        result: String(result.ok ? result.stdout : result.error || "").trim().slice(0, 2000),
      },
    };
  }

  if (action === "request") {
    const seat = String((body && body.seat) || "");
    const match = seatList.find((entry) => entry.name === seat);
    if (!match) {
      return { status: 400, body: { ok: false, error: "unknown seat: " + seat } };
    }
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const name = `REQUEST-owner-to-${slug(seat)}-${stamp}-${slug(text) || "note"}.md`;
    const content = [
      `# REQUEST: the owner -> ${seat}, ${new Date().toISOString().slice(0, 16).replace("T", " ")}: ${text
        .split("\n")[0]
        .slice(0, 80)}`,
      "",
      "Dropped from the Workforce console (Prox, plugin maintainer); the words are the owner's.",
      "",
      text,
      "",
      "## Reply",
      "(pending)",
      "",
    ].join("\n");
    try {
      writeFileSync(join(root, name), content, "utf8");
    } catch (error) {
      return { status: 500, body: { ok: false, error: String(error && error.message) } };
    }
    return { status: 200, body: { ok: true, action: "request", seat, file: name } };
  }

  return { status: 400, body: { ok: false, error: "unknown action: " + action } };
}

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: "exact",
      path: "/api/workforce/status",
      handler: async (req, res) => {
        try {
          if (req.method === "POST") {
            const raw = await readBody(req);
            let body;
            try {
              body = JSON.parse(raw);
            } catch {
              return respond(res, { ok: false, error: "invalid JSON body" }, 400);
            }
            const result = await handlePost(ctx, body);
            return respond(res, result.body, result.status);
          }
          respond(res, await snapshot(ctx));
        } catch (error) {
          respond(res, { ok: false, error: String(error && error.message) }, 500);
        }
      },
    })
  );

  ctx.effect(() =>
    ctx.tools.register({
      name: "workforce_status",
      description:
        "Read the AI workforce state of this machine: desks with the gate's verdict, each desk's roster with live session state and waiting inbox mail, live Claude Code sessions, Harness sessions, and workspace seats. Pass compact:true for a one-screen summary.",
      parameters: {
        type: "object",
        properties: { compact: { type: "boolean", description: "Return the summary instead of every person." } },
        additionalProperties: false,
      },
      output: {
        schema: { type: "object", additionalProperties: true, properties: {} },
        render(_args, value) {
          return [{ type: "text", text: JSON.stringify(value, null, 2) }];
        },
      },
      async execute(args) {
        const data = await snapshot(ctx);
        return args && args.compact ? compact(data) : data;
      },
    })
  );
}
