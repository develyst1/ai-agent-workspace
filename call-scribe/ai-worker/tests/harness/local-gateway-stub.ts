// Preload for local-gateway-regression.mjs (Tefany, 2026-11-06, TEST-101, REQ-101 AC-11).
// Replaces global fetch so NO request can leave the machine: a known provider host gets a canned reply,
// any other host throws. Requests carry markers that pick the behaviour:
//   [[fail:deepseek,xai]]  those providers answer HTTP 429
//   [[garbage]]            the model answers prose instead of JSON
//   [[slow]]               the provider never answers until the caller aborts
// Every outbound call is appended to STUB_LOG as one JSON line, with keys redacted.
import { appendFileSync } from "node:fs";

const HOSTS: Record<string, string> = {
  "api.openai.com": "openai",
  "generativelanguage.googleapis.com": "gemini",
  "api.x.ai": "xai",
  "api.deepseek.com": "deepseek",
  "api.tavily.com": "tavily",
};
const USAGE = { prompt_tokens: 11, completion_tokens: 22, total_tokens: 33 };
const json = (v: unknown, status = 200) =>
  new Response(JSON.stringify(v), { status, headers: { "Content-Type": "application/json" } });

globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = new URL(String(input?.url ?? input));
  const provider = HOSTS[url.hostname];
  const raw = typeof init.body === "string" ? init.body : "";
  appendFileSync(process.env.STUB_LOG!, JSON.stringify({
    provider: provider ?? "UNEXPECTED",
    url: url.origin + url.pathname + (url.search ? "?key=REDACTED" : ""),
    method: init.method ?? "GET",
    auth: String(init.headers?.Authorization ?? "").split(" ")[0] || null,
    body: raw ? JSON.parse(raw) : null,
  }) + "\n");
  if (!provider) throw new Error(`stub refused host ${url.hostname}`);

  const failed = raw.match(/\[\[fail:([^\]]+)\]\]/)?.[1].split(",") ?? [];
  if (failed.includes(provider)) return json({ error: { message: `stub ${provider} failure` } }, 429);

  if (raw.includes("[[slow]]")) {
    return new Promise((_, reject) => {
      init.signal?.addEventListener("abort", () => reject(new DOMException("stub aborted", "AbortError")));
    });
  }

  if (provider === "tavily") {
    return json({ answer: "stub answer", results: [{ title: "stub", url: "https://example.invalid/a", content: "stub" }] });
  }

  const text = raw.includes("[[garbage]]")
    ? "stub prose, not JSON"
    : raw.includes("routing classifier")
      ? '{"search":true,"query":"stub query","reason":"stub reason"}'
      : "stub reply";

  if (provider === "gemini") {
    return json({
      candidates: [{ content: { parts: [{ text }] } }],
      usageMetadata: { promptTokenCount: 11, candidatesTokenCount: 22, totalTokenCount: 33 },
    });
  }
  return json({ model: JSON.parse(raw).model, choices: [{ message: { content: text } }], usage: USAGE });
}) as any;
