// TEST-117 stub for `claude -p` (CLAUDE_BIN through a wrapper; QA_MODE_FILE baked in). Records what the runner hands the CLI — the
// skills text behind `--append-system-prompt-file` and the prompt — to `<mode file>.hop-<hopId>.json`, then acts as MCP would:
// a CHAT hop replies once (`reply`), a CARD hop comments (`comment`). Prints stream-json like the real CLI.
import { readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const value = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] ?? "" : "");
const MODE_FILE = process.env.QA_MODE_FILE!;
const prompt = value("-p");
const skillsFile = value("--append-system-prompt-file");
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const headers = { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}), "content-type": "application/json" };
const out = (o: unknown) => console.log(JSON.stringify(o));
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
writeFileSync(`${MODE_FILE}.hop-${mcp.CAW_HOP_ID}.json`, JSON.stringify({ args, prompt, skillsFile, skills: skillsFile ? readFileSync(skillsFile, "utf8") : null }, null, 1));
const chat = /The operator wrote message (\S+) in project (\S+?)\.?\s/.exec(prompt);
if (chat) await fetch(`${mcp.CAW_API_URL}/v1/chat/${chat[1]}/reply`, { method: "POST", headers, body: JSON.stringify({ text: "รับทราบครับ (TEST-117 stub)" }) });
else { const cardId = /Your card is (\S+)/.exec(prompt)?.[1]; if (cardId) await fetch(`${mcp.CAW_API_URL}/v1/cards/${cardId}/comments`, { method: "POST", headers, body: JSON.stringify({ text: "TEST-117 stub hop" }) }); }
out({ type: "assistant", message: { content: [{ type: "text", text: "done" }] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 1, usage: { input_tokens: 10, output_tokens: 5 } });
