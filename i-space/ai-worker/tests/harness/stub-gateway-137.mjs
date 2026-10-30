// Throwaway (TASK-137): a stand-in LLM gateway, local only. usage: node stub-gateway-137.mjs <port>
// The model answers politely and proposes NO part — so an address in the user's message is left out of its answer,
// and the server keeps it itself (SPEC-111 E14, `url_kept`).
import { createServer } from "node:http";

const port = Number(process.argv[2] || 4296);
createServer((req, res) => {
  req.on("data", () => {});
  req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.url?.startsWith("/models")) return res.end(JSON.stringify({ fake: ["recorded"] }));
    const reply = { reply: "รับทราบครับ", changes: [], questions: [], contradictions: [], suggestions: [] };
    res.end(JSON.stringify({ success: true, data: { content: JSON.stringify(reply), provider: "fake", model: "recorded", usage: null } }));
  });
}).listen(port, "127.0.0.1", () => console.log(`stub gateway on ${port}`));
