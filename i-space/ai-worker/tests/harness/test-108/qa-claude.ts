// TEST-108 stub for `claude -p` (CLAUDE_BIN, through a wrapper). Mode from the file named by QA_MODE_FILE (the wrapper bakes it in;
// the runner cuts the child's env). Prints stream-json lines like the real CLI, with refusals in the exact shape a hook block has
// (stream.ts: a `user` tool_result is_error starting `PreToolUse:<Tool> hook error:`). Acts on its card through the API as the worker.
import { readFileSync } from "node:fs";
const args = process.argv.slice(2);
const value = (f: string) => args[args.indexOf(f) + 1] ?? "";
const mode = readFileSync(process.env.QA_MODE_FILE!, "utf8").trim();
const cardId = /Your card is (\S+)/.exec(value("-p"))?.[1];
const mcp = JSON.parse(readFileSync(value("--mcp-config"), "utf8")).mcpServers.caw.env as { CAW_API_URL: string; CAW_WORKER_ID: string; CAW_HOP_ID?: string };
const out = (o: unknown) => console.log(JSON.stringify(o));
const call = async (method: string, path: string, body?: unknown) => {
  const r = await fetch(`${mcp.CAW_API_URL}${path}`, { method, headers: { "x-caw-actor": `worker:${mcp.CAW_WORKER_ID}`, ...(mcp.CAW_HOP_ID ? { "x-caw-hop": mcp.CAW_HOP_ID } : {}), ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return r.status;
};
let n = 0;
const refuse = (command: string, code: string, detail: string) => {
  const id = `tu${++n}`;
  out({ type: "assistant", message: { content: [{ type: "tool_use", id, name: "Bash", input: { command } }] } });
  out({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, is_error: true, content: `PreToolUse:Bash hook error: [bun read-guard.ts]: caw-refused ${code}: "${detail}" is not allowed here — try another way` }] } });
};
const result = () => out({ type: "result", subtype: "success", is_error: false, num_turns: n + 1, usage: { input_tokens: 10, output_tokens: 5 } });
out({ type: "system", subtype: "init", model: "qa-stub", tools: [], mcp_servers: [{ name: "caw" }] });
// TEST-109: keep a copy of the per-hop settings the runner wrote (shows the hook command and its server-ports argument)
try { await Bun.write(`${process.env.QA_MODE_FILE}.settings.json`, readFileSync(value("--settings"), "utf8")); } catch {}
if (mode === "api") {
  refuse("curl -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/proposals/X/accept", "api", "127.0.0.1:4500");
  out({ type: "assistant", message: { content: [{ type: "text", text: "I will use CAW's tools instead." }] } });
  await call("POST", `/v1/cards/${cardId}/comments`, { text: "TEST-109: API call refused, used CAW's tools instead" });
}
if (mode === "crash") { console.error("qa-claude: crash on purpose (TEST-108)"); process.exit(1); }
if (mode === "hang") { await new Promise((r) => setTimeout(r, 600_000)); process.exit(0); }
if (mode === "refuse1") {
  refuse("docker ps", "not_allowed", "docker");
  out({ type: "assistant", message: { content: [{ type: "text", text: "docker is not allowed; I will list the folder instead." }] } });
  await call("POST", `/v1/cards/${cardId}/comments`, { text: "TEST-108: refused once, carried on another way" });
}
if (mode === "cap") {
  const cmds: [string, string, string][] = [["docker ps", "not_allowed", "docker"], ["echo $HOME", "shell_feature", "$"], ["git commit -m x", "git_write", "git"], ["cat /etc/passwd", "outside", "/etc/passwd"], ["curl https://x", "network", "x"], ["bun -e 1", "inline_code", "-e"], ["ssh h", "network", "h"], ["ls ~", "outside", "~"], ["python3 x", "not_allowed", "python3"], ["git push", "git_write", "git"], ["kubectl get pods", "not_allowed", "kubectl"]];
  for (const [c, code, d] of cmds) refuse(c, code, d);
}
if (mode === "ok") await call("POST", `/v1/cards/${cardId}/comments`, { text: "TEST-108: done" });
result();
