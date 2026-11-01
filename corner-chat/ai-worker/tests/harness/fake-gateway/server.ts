// Fake LLM gateway for stubbed runs (TASK-006 step 6; TEST-003 cases 7–17, 20). Throwaway harness, not product code.
// It speaks the gateway's shapes (.claude/skills/llm-gateway §4): POST /chat, GET /models, GET /.
//
//   bun server.ts <script.json> [--port 3999]
//   then start the back end with LLM_GATEWAY_URL=http://127.0.0.1:3999
//
// The script file is re-read on every request, so it can be edited between messages. Layer 1 and layer 2 are told
// apart by the marker line in each system prompt ("[corner-chat prompt v1 layer 1|2]").
//
// script.json:
//   { "models": { "deepseek": ["deepseek-v4-flash"], ... },           // optional, for GET /models
//     "layer1": <answer>, "layer2": <answer> }
// <answer> (all keys optional):
//   "json":   { ... }            a fixed JSON object, sent as the answer text
//   "score":  69                 layer 2: answer {"score": <value>, "reason": "..."}; a string or 70.5 makes a BROKEN answer
//   "reason": "..."              the reason text that goes with "score"
//   "raw":    "any text"         sent as the answer text exactly (non-JSON, wrong shapes, ...)
//   "http500": true              answer HTTP 500 {"success":false,"error":...}
//   "hang":   true               never answer (the back end's 20 s timeout)
//   "delayMs": 500               wait before answering
//   "rules": [ { "contains": "text in the user message", ...<answer keys> } ]   first match wins, else the answer above
import { readFileSync } from "node:fs";

type Answer = {
  json?: unknown; score?: unknown; reason?: string; raw?: string; http500?: boolean; hang?: boolean; delayMs?: number;
};
type Layer = Answer & { rules?: (Answer & { contains: string })[] };
type Script = { models?: Record<string, string[]>; layer1?: Layer; layer2?: Layer };

const args = process.argv.slice(2);
const scriptPath = args.find((a) => !a.startsWith("--"));
if (!scriptPath) {
  console.error("usage: bun server.ts <script.json> [--port 3999]");
  process.exit(2);
}
const portIdx = args.indexOf("--port");
const port = portIdx >= 0 ? Number(args[portIdx + 1]) : 3999;

const DEFAULT_MODELS = {
  openai: ["gpt-4o", "gpt-4o-mini"],
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro"],
  xai: ["grok-3-mini"],
  deepseek: ["deepseek-v4-flash", "deepseek-chat"],
};
const DEFAULT_L1 = { addressed: "yes", meaning: "request", summary: "ข้อความทดสอบจากเกตเวย์ปลอม" };

const loadScript = (): Script => JSON.parse(readFileSync(scriptPath, "utf8"));

function pick(layer: Layer | undefined, userText: string): Answer {
  for (const rule of layer?.rules ?? []) if (userText.includes(rule.contains)) return rule;
  return layer ?? {};
}

const server = Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/") return Response.json({ name: "AI Develyst (FAKE)", version: "0" });
    if (request.method === "GET" && path === "/models") return Response.json(loadScript().models ?? DEFAULT_MODELS);
    if (request.method !== "POST" || path !== "/chat") return Response.json({ success: false, error: "not found" }, { status: 404 });

    const body: any = await request.json();
    const system: string = body.messages?.[0]?.content ?? "";
    const userText: string = body.messages?.[1]?.content ?? "";
    const layer = system.includes("layer 1") ? 1 : system.includes("layer 2") ? 2 : 0;
    const script = loadScript();
    const answer = pick(layer === 1 ? script.layer1 : script.layer2, userText);
    console.log(`[fake-gateway] layer ${layer} ${body.provider ?? "-"}/${body.model ?? "-"} ← ${JSON.stringify(Array.from(userText.split("\n").slice(-2).join(" ")).slice(0, 70).join(""))} → ${JSON.stringify(answer).slice(0, 120)}`);

    if (answer.delayMs) await Bun.sleep(answer.delayMs);
    if (answer.hang) return new Promise<Response>(() => {});
    if (answer.http500) return Response.json({ success: false, error: "fake gateway: scripted failure" }, { status: 500 });

    let content: string;
    if (answer.raw !== undefined) content = answer.raw;
    else if (answer.json !== undefined) content = JSON.stringify(answer.json);
    else if (layer === 1) content = JSON.stringify(DEFAULT_L1);
    else content = JSON.stringify({ score: answer.score ?? 50, reason: answer.reason ?? "ตามสคริปต์ของเกตเวย์ปลอม" });

    return Response.json({
      success: true,
      data: {
        provider: body.provider ?? "fake", model: body.model ?? "fake-model", content,
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }, latency_ms: 5,
      },
    });
  },
});
console.log(`[fake-gateway] listening on http://127.0.0.1:${server.port} with ${scriptPath}`);
