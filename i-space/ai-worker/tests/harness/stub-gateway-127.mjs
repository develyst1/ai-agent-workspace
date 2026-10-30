// Throwaway (TASK-127): a stand-in LLM gateway, local only. usage: node stub-gateway-127.mjs <port>
// The model proposes ONE decision whose optional field `open` is a boolean (the registry wants a string) — the server should keep
// the decision and drop only `open` (SPEC-105 E9, `field_dropped`).
import { createServer } from "node:http";

const port = Number(process.argv[2] || 4296);
const origin = { stamp: "team-proposed", date: "2026-10-29" };
createServer((req, res) => {
  req.on("data", () => {});
  req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.url?.startsWith("/models")) return res.end(JSON.stringify({ fake: ["recorded"] }));
    const reply = {
      reply: "บันทึกกติกาการจองให้แล้วครับ",
      changes: [{
        change: { op: "part.add", ref: "$d", kind: "decision", title: "กฎการจอง", body: { rule: "จองล่วงหน้าได้ไม่เกิน 30 วัน", cases: ["วันหยุดจองไม่ได้"], open: true }, origin },
        saidBy: "user", quote: "กฎ", sure: true,
      }],
      questions: [], contradictions: [], suggestions: [],
    };
    res.end(JSON.stringify({ success: true, data: { content: JSON.stringify(reply), provider: "fake", model: "recorded", usage: null } }));
  });
}).listen(port, "127.0.0.1", () => console.log(`stub gateway on ${port}`));
