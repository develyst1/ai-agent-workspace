// TEST-119 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in), from TEST-117's. Records what the runner hands the
// CLI — the prompt, and the card's context as the worker reads it (`handOffTo`) — to `<mode file>.hop-<hopId>.json`, then acts as MCP would.
// The mode file is JSON { "<workerId>": ["<action for its 1st turn on a card>", "<2nd>", …] }; past the end the last action repeats.
// Actions: `comment` · `handoff:<name or id>` (POST /v1/cards/{id}/handoff as the worker) · `status:<status>` (PATCH its status as the worker). A CHAT hop replies once. Prints stream-json.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const value = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] ?? "" : "");
const MODE_FILE = process.env.QA_MODE_FILE!;
const prompt = value("-p");
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const headers = { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}), "content-type": "application/json" };
const api = async (method: string, p: string, body?: unknown) => { const r = await fetch(mcp.CAW_API_URL + p, { method, headers, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; } };
const out = (o: unknown) => console.log(JSON.stringify(o));
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
const record: Record<string, unknown> = { worker: mcp.CAW_WORKER_ID, prompt };
const chat = /The operator wrote message (\S+) in project (\S+?)\.?\s/.exec(prompt);
if (chat) {
  await api("POST", `/v1/chat/${chat[1]}/reply`, { text: "รับทราบครับ (TEST-119 stub)" });
} else {
  const cardId = /Your card is (\S+)/.exec(prompt)?.[1];
  if (cardId) {
    record.cardId = cardId;
    const ctx = await api("GET", `/v1/cards/${cardId}/context`);
    record.handOffTo = ctx.j?.handOffTo ?? null;
    // this worker's turn number on this card = the hops already recorded for the same worker and card
    const dir = path.dirname(MODE_FILE), base = path.basename(MODE_FILE) + ".hop-";
    const turn = readdirSync(dir).filter((f) => f.startsWith(base)).map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")))
      .filter((r) => r.worker === mcp.CAW_WORKER_ID && r.cardId === cardId).length;
    const plan: string[] = JSON.parse(readFileSync(MODE_FILE, "utf8"))[mcp.CAW_WORKER_ID] ?? ["comment"];
    const action = plan[Math.min(turn, plan.length - 1)]!;
    record.turn = turn; record.action = action;
    if (action.startsWith("handoff:")) record.result = await api("POST", `/v1/cards/${cardId}/handoff`, { toWorkerId: action.slice(8), text: "TEST-119 stub hand-off" });
    else if (action.startsWith("status:")) record.result = await api("PATCH", `/v1/cards/${cardId}/status`, { status: action.slice(7) });
    else record.result = await api("POST", `/v1/cards/${cardId}/comments`, { text: "TEST-119 stub comment" });
  }
}
writeFileSync(`${MODE_FILE}.hop-${mcp.CAW_HOP_ID}.json`, JSON.stringify(record, null, 1));
out({ type: "assistant", message: { content: [{ type: "text", text: "done" }] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } });
