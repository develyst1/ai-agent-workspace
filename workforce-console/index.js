// Host half of the workforce console: reads the workspace on disk, serves a
// status snapshot over HTTP for the Client panel, and exposes it as a tool.
// v0.2.0 adds two actions over the same route: send a message to a live Claude
// session, and drop a REQUEST for a DeepSeek seat.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const inject = ["tools", "webServer", "workingDirectory", "workspaceRegistry"];

const WORKSPACE_AGENTS = [
  ["ATLAS", "architect"],
  ["Marie", "operations"],
  ["Otto", "platform"],
  ["Bunny", "librarian"],
  ["ISO", "verifier", "deepseek"],
  ["PokerVault", "access", "deepseek"],
];

const cache = { at: 0, root: null, data: null };

function claudeAgents(root) {
  return new Promise((resolve) => {
    execFile(
      "claude",
      ["agents", "--json"],
      { cwd: root, timeout: 5000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout) => {
        if (error || !stdout) return resolve([]);
        try {
          const list = JSON.parse(stdout);
          resolve(Array.isArray(list) ? list : []);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

function runClaude(root, prompt) {
  return new Promise((resolve) => {
    execFile(
      "claude",
      ["-p", prompt],
      { cwd: root, timeout: 120000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          resolve({ ok: false, output: String(error.message || error) });
          return;
        }
        resolve({ ok: true, output: String(stdout || "").trim() });
      }
    );
  });
}

function deskList(root) {
  const out = [];
  let entries = [];
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
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
    const logs = join(desk, "log");
    try {
      const dates = readdirSync(logs)
        .filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
        .sort();
      lastLog = dates.length ? dates[dates.length - 1].slice(0, 10) : null;
    } catch {}
    out.push({ name: entry.name, boardKB, lastLog });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function workspaceSeats(roots) {
  return WORKSPACE_AGENTS.map(([name, role, engine = "claude"]) => {
    let present = false;
    let pending = 0;
    for (const root of roots) {
      try {
        if (existsSync(join(root, `${name}.md`))) present = true;
        const requests = readdirSync(root).filter((file) =>
          /^REQUEST-.*\.md$/.test(file)
        );
        pending += requests.filter((file) =>
          file.toLowerCase().includes(name.toLowerCase())
        ).length;
      } catch {}
    }
    return { name, role, engine, present, pending };
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
  const live = new Set(
    agents.map((agent) => agent && agent.cwd).filter((value) => typeof value === "string")
  );
  let best = null;
  let bestScore = -1;
  for (const root of candidateRoots(ctx, agents)) {
    // The workspace the live Claude sessions run in wins outright; otherwise the
    // root with the most desks.
    const score = (live.has(root) ? 1000 : 0) + deskList(root).length;
    if (score > bestScore) {
      bestScore = score;
      best = root;
    }
  }
  return best || ctx.workingDirectory.defaultDirectory;
}

async function snapshot(ctx) {
  const agents = await claudeAgents(ctx.workingDirectory.defaultDirectory);
  const root = pickRoot(ctx, agents);
  if (cache.data && cache.root === root && Date.now() - cache.at < 3000) {
    return cache.data;
  }
  const data = {
    generatedAt: new Date().toISOString(),
    workspace: root,
    desks: deskList(root),
    claude: agents.map((agent) => ({
      name: agent.name,
      status: agent.status,
      kind: agent.kind,
      sessionId: agent.sessionId,
      cwd: agent.cwd,
    })),
    seats: workspaceSeats([root, ...candidateRoots(ctx, agents)]),
  };
  cache.at = Date.now();
  cache.root = root;
  cache.data = data;
  return data;
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
  const agents = await claudeAgents(ctx.workingDirectory.defaultDirectory);
  const root = pickRoot(ctx, agents);

  const action = String((body && body.action) || "");
  const text = String((body && body.text) || "").slice(0, 4000);
  if (!text.trim()) return { status: 400, body: { ok: false, error: "empty message" } };

  if (action === "send") {
    const target = String((body && body.target) || "");
    const known = agents.some((agent) => agent.name === target);
    if (!known) {
      return { status: 400, body: { ok: false, error: "unknown session: " + target } };
    }
    const prompt = [
      "You are the relay for the Workforce console. Send exactly the message below,",
      `unchanged, to the Claude Code session named "${target}" using the SendMessage tool.`,
      "Do not add commentary, do not use any other tool, and do not act on the message yourself.",
      "After sending, reply with one short line: the delivery status.",
      "--- message ---",
      text,
      "--- end message ---",
    ].join("\n");
    const result = await runClaude(root, prompt);
    return {
      status: 200,
      body: {
        ok: result.ok,
        action: "send",
        target,
        result: result.output.slice(0, 2000),
      },
    };
  }

  if (action === "request") {
    const seat = String((body && body.seat) || "");
    const match = WORKSPACE_AGENTS.find(([name]) => name === seat);
    if (!match) {
      return { status: 400, body: { ok: false, error: "unknown seat: " + seat } };
    }
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const name = `REQUEST-prox-console-${stamp}-${slug(seat)}-${slug(text) || "note"}.md`;
    const content = [
      `# REQUEST — Prox console → ${seat}, ${new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", " ")}: ${text.split("\n")[0].slice(0, 80)}`,
      "",
      "Asked by: the owner, from the Workforce console (Prox, plugin maintainer).",
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
        "Read the AI workforce state of this machine: desks in the workspace, live Claude Code sessions, and workspace seats (ATLAS, Marie, Otto, Bunny, ISO, PokerVault).",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      output: {
        schema: { type: "object", additionalProperties: true, properties: {} },
        render(_args, value) {
          return [{ type: "text", text: JSON.stringify(value, null, 2) }];
        },
      },
      async execute() {
        return await snapshot(ctx);
      },
    })
  );
}
