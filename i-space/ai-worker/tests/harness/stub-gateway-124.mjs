// Throwaway (TASK-124): a stand-in LLM gateway, local only. usage: node stub-gateway-124.mjs <port>
//  - a request whose body mentions ALL-BAD → the model proposes ONE part of the unknown kind `feature` (nothing can be saved)
//  - any other request → the model proposes 5 changes: 4 valid steps and 1 of the unknown kind `feature` (1 refused, 4 saved)
// Its reply TEXT claims everything was saved — the front must not show it when anything was refused.
import { createServer } from "node:http";

const port = Number(process.argv[2] || 4296);
const origin = { stamp: "team-proposed", date: "2026-10-29" };
const step = (ref, title) => ({ change: { op: "part.add", ref, kind: "step", title, body: { ends: false }, origin }, saidBy: "user", quote: "ขั้น", sure: true });
const bad = (ref, title) => ({ change: { op: "part.add", ref, kind: "feature", title, body: {}, origin }, saidBy: "user", quote: "ขั้น", sure: true });

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    res.setHeader("content-type", "application/json");
    if (req.url?.startsWith("/models")) return res.end(JSON.stringify({ fake: ["recorded"] }));
    const changes = body.includes("ALL-BAD")
      ? [bad("$e", "แจ้งเตือนทางอีเมล")]
      : [step("$a", "รับคำขอ"), step("$b", "ตรวจสอบ"), step("$c", "อนุมัติ"), step("$d", "แจ้งผล"), bad("$e", "แจ้งเตือนทางอีเมล")];
    const reply = { reply: "เพิ่มให้ครบทั้งหมดแล้วครับ", changes, questions: [], contradictions: [], suggestions: [] };
    res.end(JSON.stringify({ success: true, data: { content: JSON.stringify(reply), provider: "fake", model: "recorded", usage: null } }));
  });
}).listen(port, "127.0.0.1", () => console.log(`stub gateway on ${port}`));
