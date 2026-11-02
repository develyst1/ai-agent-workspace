// REQ-004 AC-6 / AC-10 corpus run that KEEPS every judgement (layer-1 summary, addressed, meaning, score, reason, models).
// It reuses the SA's corpus parser idea but scores differently on one point: a failed judge is NOT counted as "notified" —
// it is reported as an invalid run, because counting it as a pass could hide a wrong hold on a must-notify message.
//   cd <corner-chat-back> && LLM_GATEWAY_URL=https://ai.develyst.online bun <this> <corpus.md> <out.json> [--runs 3]
// Product code: src/filter/ai.ts (createJudge) + src/filter/pipeline.ts (buildAboutLine). No database. Throwaway harness.
import { readFileSync, writeFileSync } from "node:fs";

const [input, out] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const runsIdx = process.argv.indexOf("--runs");
const RUNS = runsIdx > 0 ? Number(process.argv[runsIdx + 1]) : 3;
if (!input || !out) { console.error("usage: bun corpus-full.ts <corpus.md> <out.json> [--runs 3]"); process.exit(2); }
const gatewayUrl = process.env.LLM_GATEWAY_URL?.trim();
if (!gatewayUrl) { console.error("LLM_GATEWAY_URL is required"); process.exit(2); }

const md = readFileSync(input, "utf8");
const userName = /- Name: \*\*(.+?)\*\*/.exec(md)![1]!.trim();
const userNames = [...(/name list for untagged matching:\s*(.+)/.exec(md)![1]!).matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
const sentences = /\*\*Sentences:\*\*\s*"([\s\S]*?)"/.exec(md)![1]!.replace(/\s+/g, " ").trim();
const LINE_VIA: Record<string, string> = { tag: "mention", "reply to him": "reply_to_me", name: "name_match", "@All": "mention_all" };
const strip = (s: string) => s.replace(/\*\*/g, "").trim();
const items = md.split("\n").filter((l) => /^\|\s*[NH]\d+\s*\|/.test(l)).map((row) => {
  const [id, where, via, text, label] = row.split("|").slice(1, -1).map(strip) as string[];
  const parts = where!.split(" · ").map(strip);
  const line = parts[0] === "LINE";
  return {
    id: id!, expected: label === "N" ? "notify" : "hold", text: text!,
    channel: (line ? "line" : "mail") as "line" | "mail",
    groupName: line ? parts[1]! : null,
    senderName: line ? "สมาชิกในกลุ่ม" : parts[2]!,
    subject: line ? null : (/^เรื่อง:\s*(.+?)(?:\s+—\s+|$)/.exec(text!)?.[1] ?? null),
    recipientKind: line ? LINE_VIA[via!]! : parts[1]!.includes("Cc") ? "cc" : parts[1]!.includes("(list)") ? "list" : "to",
  };
});
if (items.length !== 30) throw new Error(`expected 30 corpus rows, got ${items.length}`);

const repo = process.cwd();
const { createJudge, DEFAULT_AI_SETTINGS } = await import(`${repo}/src/filter/ai.ts`);
const { createGateway } = await import(`${repo}/src/filter/gateway.ts`);
const { buildAboutLine } = await import(`${repo}/src/filter/pipeline.ts`);
// Same timeout as the back end's gatewayFrom(config): LLM_TIMEOUT_MS, default 40000 (TASK-031). createGateway alone falls back to 20 s.
const timeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? 40000);
const callLogs: Record<string, any[]> = {}; // per judged message id: every gateway call (layer, ok, latency, completionTokens, error)
const judge = createJudge({
  gateway: createGateway({ url: gatewayUrl, key: process.env.LLM_GATEWAY_KEY?.trim() ?? "", timeoutMs }),
  settings: async () => DEFAULT_AI_SETTINGS,
  userContext: async () => ({ name: userName, names: userNames }),
  logCall: async (c: any) => { (callLogs[c.messageId] ??= []).push(c); },
});

const results: Record<string, any[]> = {};
const queue = items.flatMap((it) => Array.from({ length: RUNS }, (_, run) => ({ it, run })));
let next = 0;
const t0 = Date.now();
async function worker() {
  while (next < queue.length) {
    const { it, run } = queue[next++]!;
    const started = Date.now();
    const mid = crypto.randomUUID();
    let r: any;
    try {
      const j = await judge({ id: mid, userId: "corpus", channel: it.channel, senderKey: it.senderName, senderName: it.senderName,
        groupId: it.groupName, groupName: it.groupName, subject: it.subject, text: it.text, recipientKind: it.recipientKind }, { bar: 0, sentences });
      r = { run, ok: true, ms: Date.now() - started, ...j,
        aboutLine: buildAboutLine({ channel: it.channel, groupName: it.groupName, senderName: it.senderName, summary: j.summary, decidedBy: "ai", rule: null }) };
    } catch (e) {
      r = { run, ok: false, ms: Date.now() - started, error: e instanceof Error ? e.message : String(e) };
    }
    r.calls = callLogs[mid] ?? [];
    (results[it.id] ??= []).push(r);
    process.stdout.write(r.ok ? "." : "E");
  }
}
console.log(`corpus ${items.length} × ${RUNS} · ${gatewayUrl} · layer1 ${JSON.stringify(DEFAULT_AI_SETTINGS.layer1)} · layer2 ${JSON.stringify(DEFAULT_AI_SETTINGS.layer2)}`);
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`\ndone in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// Scoring — corpus.md "How a run is scored". An invalid run (judge error) makes that message UNSCORED, never a pass.
const valid = (id: string) => results[id]!.every((r) => r.ok);
function totals(bar: number) {
  let wrongHolds = 0, wrongPasses = 0, flips = 0, unscored = 0;
  for (const it of items) {
    if (!valid(it.id)) { unscored++; continue; }
    const o = results[it.id]!.map((r) => r.score >= bar);
    if (it.expected === "notify") { if (o.some((x) => !x)) wrongHolds++; if (o.some((x) => x) && o.some((x) => !x)) flips++; }
    else if (o.some((x) => x)) wrongPasses++;
  }
  return { bar, wrongHolds, wrongPasses, flips, unscored, meets: unscored === 0 && wrongHolds === 0 && wrongPasses <= 2 && flips === 0 };
}
const all = Array.from({ length: 101 }, (_, b) => totals(b));
const meeting = all.filter((t) => t.meets).map((t) => t.bar);
for (const it of items) {
  const rs = results[it.id]!.sort((a, b) => a.run - b.run);
  console.log(`${it.id} ${it.expected.padEnd(6)} ${rs.map((r) => (r.ok ? String(r.score).padStart(3) : "ERR")).join(" ")}  ${rs[0]?.aboutLine ?? rs[0]?.error ?? ""}`);
}
for (const b of [50, 55, 60, 65, 70, 75, 80, 85, 90]) console.log(JSON.stringify(totals(b)));
console.log(`bars meeting the line: ${meeting.length ? `${meeting[0]}–${meeting[meeting.length - 1]} (highest ${meeting[meeting.length - 1]})` : "NONE"}`);
writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), gatewayUrl, settings: DEFAULT_AI_SETTINGS, runs: RUNS, userName, userNames, sentences, items, results, totals: all, meeting }, null, 2));
