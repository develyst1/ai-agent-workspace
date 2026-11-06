// DEF-1 probe (SA Sober, 2026-11-01): does the layer-2 call on the real gateway come back complete?
// A must-hold message (TEST-003 H07, made up), 4 calls at once like the corpus runner, ROUNDS rounds, at MAX_TOKENS.
// Run from the corner-chat-back checkout (it loads the product's own prompt):
//   bun <ai-worker>/tests/harness/def1-probe/probe.ts [rounds=4] [maxTokens=4096] [model=deepseek-v4-pro]
// Costs real money on the owner's gateway: keep rounds small. Made-up text only.
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { layer2Messages } = await import(pathToFileURL(join(process.cwd(), "src/filter/prompts/v1.ts")).href);

const URL = process.env.LLM_GATEWAY_URL ? `${process.env.LLM_GATEWAY_URL.replace(/\/$/, "")}/chat` : "https://ai.develyst.online/chat";
const ROUNDS = Number(process.argv[2] ?? 4);
const MAX_TOKENS = Number(process.argv[3] ?? 4096);
const MODEL = process.argv[4] ?? "deepseek-v4-pro";

const messages = layer2Messages({
  text: "เรื่อง: บัญชีของคุณจะถูกระงับ — คลิกลิงก์เพื่อยืนยันตัวตน",
  recipientKind: "to",
  layer1: { addressed: "yes", meaning: "spam", summary: "อ้างว่าบัญชีจะถูกระงับ ให้คลิกลิงก์ยืนยันตัวตน" },
  sentences: "แจ้งเรื่องที่ต้องตอบ ต้องทำ หรือต้องตัดสินใจ ทั้งเรื่องงานและเรื่องส่วนตัวที่ถามเราตรงๆ ไม่เอาโฆษณา ไม่เอาข่าวทั่วไป ไม่เอาคุยเล่น",
});

async function one() {
  const t = Date.now();
  const r = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "deepseek", model: MODEL, temperature: 0, max_tokens: MAX_TOKENS, messages }),
  });
  const j: any = await r.json().catch(() => ({}));
  const content: string = j?.data?.content ?? "";
  let json = false;
  try { JSON.parse(content.replace(/^```json\s*|\s*```$/g, "")); json = true; } catch {}
  return { empty: content.trim() === "", json, ct: j?.data?.usage?.completion_tokens ?? null, ms: Date.now() - t };
}

const rows: Awaited<ReturnType<typeof one>>[] = [];
for (let i = 0; i < ROUNDS; i++) rows.push(...(await Promise.all([one(), one(), one(), one()])));
const empty = rows.filter((r) => r.empty).length;
const bad = rows.filter((r) => !r.empty && !r.json).length;
const cts = rows.map((r) => r.ct).filter((n): n is number => typeof n === "number");
const ms = rows.map((r) => r.ms).sort((a, b) => a - b);
console.log(`${MODEL} max_tokens=${MAX_TOKENS} · ${rows.length} calls · empty ${empty} · invalid JSON ${bad}`);
console.log(`completion_tokens max ${Math.max(...cts)} · at budget ${cts.filter((n) => n >= MAX_TOKENS).length}`);
console.log(`latency ms median ${ms[Math.floor(ms.length / 2)]} · max ${ms[ms.length - 1]}`);
