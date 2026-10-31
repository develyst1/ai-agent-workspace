// TEST-110 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in). Prints stream-json lines like the real CLI and
// acts as the worker through the API with the headers CAW's MCP server sends (x-caw-actor worker, x-caw-hop = this hop) — what
// `card_context` and `comment` do. Modes: `read` — read the card context once, comment the part's title it was given;
// `pin` — the same, then wait for QA's go file (QA edits the part meanwhile), read again and comment again, then end.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const value = (f: string) => args[args.indexOf(f) + 1] ?? "";
const MODE_FILE = process.env.QA_MODE_FILE!;
const mode = readFileSync(MODE_FILE, "utf8").trim();
const cardId = /Your card is (\S+)/.exec(value("-p"))?.[1];
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const out = (o: unknown) => console.log(JSON.stringify(o));
const headers = { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}) };
const context = async () => { const r = await fetch(`${mcp.CAW_API_URL}/v1/cards/${cardId}/context`, { headers }); return { status: r.status, body: await r.json() as any }; };
const comment = (text: string) => fetch(`${mcp.CAW_API_URL}/v1/cards/${cardId}/comments`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ text }) });
const said = (c: { status: number; body: any }) => `${c.status} title=${c.body?.spec?.part?.title ?? "-"} revision=${c.body?.specRead?.revision ?? "-"} pinned=${c.body?.specRead?.pinned ?? "-"} fromCache=${c.body?.specRead?.fromCache ?? "-"}`;
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
const first = await context();
await comment(`TEST-110 start-read (hop ${mcp.CAW_HOP_ID}): ${said(first)}`);
if (mode === "pin") {
  writeFileSync(`${MODE_FILE}.started`, mcp.CAW_HOP_ID ?? "");
  for (let i = 0; i < 180 && !existsSync(`${MODE_FILE}.go`); i++) await new Promise((r) => setTimeout(r, 500));
  const second = await context();
  await comment(`TEST-110 mid-read (hop ${mcp.CAW_HOP_ID}): ${said(second)}`);
}
out({ type: "assistant", message: { content: [{ type: "text", text: "read the card context" }] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } });
