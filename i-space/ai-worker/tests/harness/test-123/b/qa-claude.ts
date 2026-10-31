// TEST-120 Team B (REQ-123) — TEST-122's stub + it records the skills file it was handed. TEST-122 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in) — QA's own, from TEST-116/118/119's, now for REQ-122's OPEN worker.
// Two ways it is started, like the real CLI:
// - `-p <prompt>` (no --input-format): one task, then exit — a CHAT hop replies once (`reply`); a card prompt is handled as one task.
// - `-p --input-format stream-json`: an OPEN worker — reads one stream-json user message per stdin line, does that task, prints a stream that ends in
//   a `result`, and waits for the next line; exits 0 on stdin EOF. The hop id comes from CAW_HOP_FILE, read on EVERY call (as the real MCP server does).
// Per task it records `<mode file>.hop-<hopId>.json`: { worker, cardId, pid, task (n-th task of THIS process), turn, action, result, t0, t1, prompt, handOffTo }
// and also writes `<mode file>.pid-<worker>` = its pid at task start (so QA can kill it mid-task).
// The mode file is JSON { "<workerId>": ["<action for its 1st turn on a card>", …] } (past the end the last repeats). Actions, `|`-joined:
//   `ctx:<n>` (round 2: the task's last model call reports a prompt of n tokens, as `assistant.message.usage`) · `sleep:<ms>` · `comment` · `review` (status review + comment) · `done` (status done + comment) · `handoff:<name or id>` · `status:<s>` · `die` (exit 1, no result)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
const args = process.argv.slice(2);
const value = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] ?? "" : "");
const MODE_FILE = process.env.QA_MODE_FILE!;
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string; CAW_HOP_FILE?: string };
const hopId = () => { if (mcp.CAW_HOP_FILE) { try { return readFileSync(mcp.CAW_HOP_FILE, "utf8").trim(); } catch { return ""; } } return mcp.CAW_HOP_ID ?? ""; };
const api = async (method: string, p: string, body?: unknown) => {
  const h = hopId();
  const r = await fetch(mcp.CAW_API_URL + p, { method, headers: { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(h ? { "x-caw-hop": h } : {}), "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; }
};
const out = (o: unknown) => console.log(JSON.stringify(o));
const stream = () => { out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] }); };
let ctxTokens: number | null = null;
const finish = () => { out({ type: "assistant", message: { id: `msg_${process.pid}_${served}`, content: [{ type: "text", text: "done" }], ...(ctxTokens === null ? {} : { usage: { input_tokens: ctxTokens, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 5 } }) } }); ctxTokens = null; out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } }); };
let served = 0;
async function task(prompt: string) {
  served++;
  const t0 = new Date().toISOString();
  const hop = hopId();
  const chat = /The operator wrote message (\S+) in project (\S+?)\.?\s/.exec(prompt);
  // TEST-120 B (REQ-123 AC-3): also what the runner handed over on start — the skills file it named, its text, and the argv
  const skillsFile = value("--append-system-prompt-file");
  const record: Record<string, unknown> = { worker: mcp.CAW_WORKER_ID, pid: process.pid, task: served, hop, t0, prompt, args, skillsFile, skills: (() => { try { return skillsFile ? readFileSync(skillsFile, "utf8") : null; } catch { return null; } })() };
  if (chat) {
    record.result = await api("POST", `/v1/chat/${chat[1]}/reply`, { text: "รับทราบครับ (TEST-122 stub)" });
  } else {
    const cardId = /Your card is (\S+)/.exec(prompt)?.[1];
    record.cardId = cardId;
    writeFileSync(`${MODE_FILE}.pid-${mcp.CAW_WORKER_ID}`, String(process.pid));
    const ctx = await api("GET", `/v1/cards/${cardId}/context`);
    record.handOffTo = ctx.j?.handOffTo ?? null; record.contextStatus = ctx.s; record.contextCard = ctx.j?.card?.id ?? null;
    const dir = path.dirname(MODE_FILE), base = path.basename(MODE_FILE) + ".hop-";
    const turn = readdirSync(dir).filter((f) => f.startsWith(base)).map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"))).filter((r) => r.worker === mcp.CAW_WORKER_ID && r.cardId === cardId).length;
    const plan: string[] = JSON.parse(readFileSync(MODE_FILE, "utf8"))[mcp.CAW_WORKER_ID] ?? ["comment"];
    const action = plan[Math.min(turn, plan.length - 1)]!;
    record.turn = turn; record.action = action; record.results = [];
    for (const step of action.split("|")) {
      if (step.startsWith("sleep:")) { await new Promise((r) => setTimeout(r, Number(step.slice(6)))); continue; }
      if (step.startsWith("ctx:")) { ctxTokens = Number(step.slice(4)); continue; }
      if (step === "die") { writeFileSync(`${MODE_FILE}.hop-${hop}.json`, JSON.stringify({ ...record, died: true, t1: new Date().toISOString() }, null, 1)); process.exit(1); }
      let res;
      if (step.startsWith("handoff:")) res = await api("POST", `/v1/cards/${cardId}/handoff`, { toWorkerId: step.slice(8), text: "TEST-122 stub hand-off" });
      else if (step.startsWith("status:")) res = await api("PATCH", `/v1/cards/${cardId}/status`, { status: step.slice(7) });
      else if (step === "review" || step === "done") { res = await api("PATCH", `/v1/cards/${cardId}/status`, { status: step }); (record.results as unknown[]).push({ step: `status ${step}`, s: res.s }); res = await api("POST", `/v1/cards/${cardId}/comments`, { text: `TEST-122 ${step} (pid ${process.pid}, task ${served})` }); }
      else res = await api("POST", `/v1/cards/${cardId}/comments`, { text: `TEST-122 comment (pid ${process.pid}, task ${served})` });
      (record.results as unknown[]).push({ step, s: res.s, j: res.s >= 400 ? res.j : undefined });
    }
  }
  // the older checks (TEST-116/119) read `result`: the last step's
  if (Array.isArray(record.results) && (record.results as unknown[]).length > 0) record.result = (record.results as unknown[])[(record.results as unknown[]).length - 1];
  record.t1 = new Date().toISOString();
  writeFileSync(`${MODE_FILE}.hop-${hop || `nohop-${process.pid}-${served}`}.json`, JSON.stringify(record, null, 1));
}
if (args.includes("--input-format")) {
  const lines = createInterface({ input: process.stdin });
  for await (const line of lines) {
    if (line.trim() === "") continue;
    const msg = JSON.parse(line);
    const prompt = typeof msg.message?.content === "string" ? msg.message.content : JSON.stringify(msg.message?.content ?? "");
    stream(); await task(prompt); finish();
  }
} else {
  stream(); await task(value("-p")); finish();
}
