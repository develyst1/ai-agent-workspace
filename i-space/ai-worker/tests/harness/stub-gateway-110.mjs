// Throwaway (TASK-110): a stand-in LLM gateway, local only. usage: node stub-gateway-110.mjs <port>
//  - a request whose body mentions TIMEOUT-ME sleeps 100 s (blueprint-back's gateway timeout is 90 s) → the round times out
//  - any other request answers with a reply that proposes a part of the unknown kind `feature` → the round is rejected
import { createServer } from "node:http";

const port = Number(process.argv[2] || 4296);
createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.url?.startsWith("/models")) return res.end(JSON.stringify({ fake: ["recorded"] }));
    if (body.includes("TIMEOUT-ME")) return void setTimeout(() => res.end("{}"), 100_000);
    const reply = {
      reply: "เพิ่มให้แล้วครับ",
      changes: [{
        change: { op: "part.add", ref: "$f", kind: "feature", title: "แจ้งเตือน", body: {}, origin: { stamp: "operator", date: "2026-10-29" } },
        saidBy: "user", quote: "feature", sure: true,
      }],
      questions: [], contradictions: [], suggestions: [],
    };
    res.end(JSON.stringify({ success: true, data: { content: JSON.stringify(reply), provider: "fake", model: "recorded", usage: null } }));
  });
}).listen(port, "127.0.0.1", () => console.log(`stub gateway on ${port}`));
