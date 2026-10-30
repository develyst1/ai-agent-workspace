// TEST-112 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in). Prints stream-json lines like the real CLI and
// acts through the API with the headers CAW's MCP server sends (x-caw-actor worker, x-caw-hop = this hop).
// - a CARD hop: reads its card context once (what MCP `card_context` returns) and saves the prompt it was given and that context to
//   `<mode file>.card-<hopId>.json`, then comments that it read it.
// - a CHAT hop (prompt "The operator wrote message <id> in project <pid>"): proposes the cards in `<mode file>.items.json` for that
//   message, as MCP `propose_cards` does (workerId "self" = this worker).
import { readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const value = (f: string) => args[args.indexOf(f) + 1] ?? "";
const MODE_FILE = process.env.QA_MODE_FILE!;
const prompt = value("-p");
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const out = (o: unknown) => console.log(JSON.stringify(o));
const headers = { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}), "content-type": "application/json" };
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
const chat = /The operator wrote message (\S+) in project (\S+?)\.?\s/.exec(prompt);
if (chat) {
  // as MCP `locate` first: CAW lets a hop propose only keys it located (anchor_not_located otherwise)
  const loc = await fetch(`${mcp.CAW_API_URL}/v1/projects/${chat[2]}/locate`, { method: "POST", headers, body: JSON.stringify({ request: "หน้า Health Board" }) });
  writeFileSync(`${MODE_FILE}.locate.json`, JSON.stringify({ status: loc.status, body: await loc.json() }, null, 1));
  const items = JSON.parse(readFileSync(`${MODE_FILE}.items.json`, "utf8")).map((i: any) => ({ ...i, workerId: i.workerId === "self" ? mcp.CAW_WORKER_ID : i.workerId }));
  const r = await fetch(`${mcp.CAW_API_URL}/v1/projects/${chat[2]}/proposals`, { method: "POST", headers, body: JSON.stringify({ messageId: chat[1], items }) });
  const proposal = await r.json() as any;
  writeFileSync(`${MODE_FILE}.proposal.json`, JSON.stringify({ status: r.status, body: proposal }, null, 1));
  // as MCP `reply`: the entry worker answers the message once, with the proposal it made (the chat shows a proposal with its reply)
  const rep = await fetch(`${mcp.CAW_API_URL}/v1/chat/${chat[1]}/reply`, { method: "POST", headers, body: JSON.stringify({ text: "เสนองานสร้างหน้า Health Board 1 งานครับ", proposalId: proposal.id }) });
  writeFileSync(`${MODE_FILE}.reply.json`, JSON.stringify({ status: rep.status, body: await rep.json() }, null, 1));
} else {
  const cardId = /Your card is (\S+)/.exec(prompt)?.[1];
  const r = await fetch(`${mcp.CAW_API_URL}/v1/cards/${cardId}/context`, { headers });
  const context = await r.json();
  writeFileSync(`${MODE_FILE}.card-${mcp.CAW_HOP_ID}.json`, JSON.stringify({ prompt, status: r.status, context }, null, 1));
  await fetch(`${mcp.CAW_API_URL}/v1/cards/${cardId}/comments`, { method: "POST", headers, body: JSON.stringify({ text: `TEST-112 read the card context (${r.status})` }) });
}
out({ type: "assistant", message: { content: [{ type: "text", text: "done" }] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } });
