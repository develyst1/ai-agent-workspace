// THROWAWAY for TASK-013: a pass-through to the real back (back-pglite on :4310) that, for ONE call, answers with headers and the
// first bytes of a body and then never finishes it. Everything else is proxied untouched, so a person can sign in and reach the board.
//   bun tests/harness/stall-body/server.ts      (127.0.0.1:4312; point the front at it with BACK_ORIGIN=http://127.0.0.1:4312)
// The stalled call: POST /api/projects/:id/ai/task-proposals → HTTP 502, content-type json, body `{"error":` and then silence for 60 s.
const UPSTREAM = "http://127.0.0.1:4310";
const STALL_MS = 60_000;

Bun.serve({
  hostname: "127.0.0.1",
  port: 4312,
  idleTimeout: 120,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "POST" && /\/ai\/task-proposals$/.test(url.pathname)) {
      const body = new ReadableStream({
        start(c) {
          c.enqueue(new TextEncoder().encode('{"error":'));
          setTimeout(() => { try { c.close(); } catch {} }, STALL_MS);
        },
      });
      return new Response(body, { status: 502, headers: { "content-type": "application/json" } });
    }
    const headers = new Headers(req.headers);
    headers.delete("host");
    const hasBody = !["GET", "HEAD"].includes(req.method);
    return fetch(UPSTREAM + url.pathname + url.search, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
    });
  },
});
console.log("stall-body on 127.0.0.1:4312 → proxy to :4310, stalls one call");
