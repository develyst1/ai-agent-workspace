// Stand-in for the AI gateway (SPEC-002 §Testability P1/P2). Run: `bun server.ts` (port 4399, 127.0.0.1 only).
// It never contacts a real gateway. It answers POST /chat in the gateway's shape (llm-gateway skill §4).
// The answer depends on the MODE read from mode.txt on EVERY request (missing file = "ok"):
//   ok · 500 · hang · empty · malformed        (switch with: echo hang > mode.txt, no restart)
// Every request is appended to calls.jsonl as {"at": ISO, "body": <request JSON>}.
// GET /calls → {"count", "calls"} · DELETE /calls → empties it. Both files are scratch, synthetic data only.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = 4399;
const dir = import.meta.dir;
const MODE_FILE = join(dir, "mode.txt");
const CALLS_FILE = join(dir, "calls.jsonl");
const HANG_MS = 40_000;

const readMode = () => (existsSync(MODE_FILE) ? readFileSync(MODE_FILE, "utf8").trim() || "ok" : "ok");
const readCalls = () =>
  existsSync(CALLS_FILE)
    ? readFileSync(CALLS_FILE, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l))
    : [];

const reply = (content: string) =>
  Response.json({
    success: true,
    data: {
      provider: "stub",
      model: "stub-1",
      content,
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      latency_ms: 1,
    },
  });

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  idleTimeout: 60, // seconds; longer than the 40 s hang
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/calls" && req.method === "GET") {
      const calls = readCalls();
      return Response.json({ count: calls.length, calls });
    }
    if (pathname === "/calls" && req.method === "DELETE") {
      writeFileSync(CALLS_FILE, "");
      return Response.json({ count: 0, calls: [] });
    }

    if (pathname === "/chat" && req.method === "POST") {
      let body: any = null;
      try {
        body = await req.json();
      } catch {
        body = { unparseable: true };
      }
      appendFileSync(CALLS_FILE, JSON.stringify({ at: new Date().toISOString(), body }) + "\n");

      const mode = readMode();
      switch (mode) {
        case "ok": {
          const system = String(body?.messages?.[0]?.content ?? "");
          return system.includes("JSON")
            ? reply(JSON.stringify(["ออกแบบหน้าจอ", "เขียน API", "ทดสอบระบบ", "เตรียมข้อมูลตัวอย่าง", "สรุปผลการทำงาน"]))
            : reply("โปรเจกต์คืบหน้าไปได้ดี งานส่วนใหญ่กำลังดำเนินการ มีบางงานที่ยังติดอยู่และต้องการการตัดสินใจ");
        }
        case "500":
          return Response.json({ success: false, error: "stub 500" }, { status: 500 });
        case "hang":
          await Bun.sleep(HANG_MS);
          return reply("too late");
        case "empty":
          return reply("");
        case "malformed":
          // HTTP 200 whose BODY is not valid JSON (SPEC-002 §Testability as amended; F-005).
          return new Response('{"success":true,"data":', { status: 200, headers: { "content-type": "application/json" } });
        default:
          return Response.json({ success: false, error: "stub: unknown mode" }, { status: 500 });
      }
    }

    return Response.json({ success: false, error: "stub: not found" }, { status: 404 });
  },
});
console.log(`gateway stand-in on 127.0.0.1:${PORT}`);
