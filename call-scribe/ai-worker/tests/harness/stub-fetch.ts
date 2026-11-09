// Preload: replaces global fetch so NO request leaves the machine.
// Prints what the gateway would have sent to a provider, then returns a canned reply.
const realSetTimeout = setTimeout;
globalThis.fetch = (async (input: any, init: any) => {
  const url = String(input?.url ?? input);
  const safeUrl = url.replace(/key=[^&]+/, "key=STUB");
  const body = init?.body ? JSON.parse(init.body) : null;
  console.log("OUTBOUND " + JSON.stringify({ url: safeUrl, body }));
  const delay = Number(process.env.STUB_DELAY_MS ?? 0);
  if (delay) await new Promise((r) => realSetTimeout(r, delay));
  const payload = url.includes("generativelanguage")
    ? { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "stub-part-1" }, { text: "stub-part-2" }] } }] }
    : { model: body?.model, choices: [{ finish_reason: "length", message: { content: "stub" } }] };
  return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
}) as any;
