// TEST-118 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in), from TEST-112's. Acts through the API with the headers
// CAW's MCP server sends (x-caw-actor worker, x-caw-hop = this hop), and records what the runner handed it:
// - a CHAT hop: saves the prompt AND the text of `--append-system-prompt-file` (where SPEC-117 D2 puts the requirements) to
//   `<mode file>.chat-<hopId>.json`; locates each anchor of `<mode file>.items.json` (as MCP `locate`), proposes those items, replies once.
// - a CARD hop: saves the prompt and its card context (as MCP `card_context`) to `<mode file>.card-<hopId>.json`, then comments.
import { readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const value = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] ?? "" : "");
const MODE_FILE = process.env.QA_MODE_FILE!;
const prompt = value("-p");
const sysFile = value("--append-system-prompt-file");
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const headers = { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}), "content-type": "application/json" };
const api = async (method: string, p: string, body?: unknown) => { const r = await fetch(mcp.CAW_API_URL + p, { method, headers, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, j: JSON.parse(t) }; } catch { return { s: r.status, j: t }; } };
const out = (o: unknown) => console.log(JSON.stringify(o));
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
const chat = /The operator wrote message (\S+) in project (\S+?)\.?\s/.exec(prompt);
if (chat) {
  const record: Record<string, unknown> = { prompt, sysFile, system: sysFile ? readFileSync(sysFile, "utf8") : null };
  const items = JSON.parse(readFileSync(`${MODE_FILE}.items.json`, "utf8"));
  record.locate = [];
  for (const i of items) (record.locate as unknown[]).push(await api("POST", `/v1/projects/${chat[2]}/locate`, { request: i.anchor.key }));
  const proposal = await api("POST", `/v1/projects/${chat[2]}/proposals`, { messageId: chat[1], items });
  record.proposal = proposal;
  record.reply = await api("POST", `/v1/chat/${chat[1]}/reply`, { text: "เสนองานตามข้อกำหนดครับ (TEST-118 stub)", proposalId: proposal.j?.id });
  writeFileSync(`${MODE_FILE}.chat-${mcp.CAW_HOP_ID}.json`, JSON.stringify(record, null, 1));
} else {
  const cardId = /Your card is (\S+)/.exec(prompt)?.[1];
  const ctx = await api("GET", `/v1/cards/${cardId}/context`);
  writeFileSync(`${MODE_FILE}.card-${mcp.CAW_HOP_ID}.json`, JSON.stringify({ prompt, cardId, status: ctx.s, context: ctx.j }, null, 1));
  await api("POST", `/v1/cards/${cardId}/comments`, { text: `TEST-118 read the card context (${ctx.s})` });
}
out({ type: "assistant", message: { content: [{ type: "text", text: "done" }] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } });
