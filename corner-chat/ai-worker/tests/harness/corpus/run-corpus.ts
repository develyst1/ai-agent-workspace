// Corpus runner for REQ-004 AC-6 (TASK-006 step 5; TEST-003 #18, #19). Throwaway harness, not product code.
// It runs the real two-layer judge (src/filter/ai.ts) N times per message against the gateway in LLM_GATEWAY_URL and
// prints the scores plus the AC-6 totals per bar. It NEVER touches a database: the judge is built here with a fixed
// settings object, the user's name/names from the corpus, and no call log.
//
// Run it from the corner-chat-back checkout (it imports the product code from the current directory):
//   cd <corner-chat-back>
//   LLM_GATEWAY_URL=http://localhost:3009 bun <this folder>/run-corpus.ts <input> [--runs 3] [--concurrency 4]
// <input> is either QA's corpus markdown (tests/harness/corpus-req-004/corpus.md — read, never edited) or a JSON array of
//   { id, channel: "mail"|"line", senderName, groupName?, subject?, recipientKind, text, userSentences, expected: "notify"|"hold",
//     userName?, userNames? }
// Settings default to SPEC-001 S10; override with CORPUS_LAYER1 / CORPUS_LAYER2 = "provider/model" (or "-" for the gateway's choice).
// The production gateway costs real money: it is refused unless --allow-production is given (QA/SA probes only).
import { readFileSync } from "node:fs";

type Item = {
  id: string; channel: "mail" | "line"; senderName: string; groupName: string | null; subject: string | null;
  recipientKind: string; text: string; userSentences: string; userName: string; userNames: string[]; expected: "notify" | "hold";
};

const args = process.argv.slice(2);
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1]! : fallback;
};
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1]!.startsWith("--") && args[i - 1] !== "--allow-production"));
const input = positional[0];
if (!input) {
  console.error("usage: bun run-corpus.ts <corpus.md | items.json> [--runs 3] [--concurrency 4] [--allow-production]");
  process.exit(2);
}
const RUNS = Number(flag("--runs", "3"));
const CONCURRENCY = Number(flag("--concurrency", "4"));
const gatewayUrl = process.env.LLM_GATEWAY_URL?.trim() || "http://localhost:3009";
if (/ai\.develyst\.online/.test(gatewayUrl) && !args.includes("--allow-production")) {
  console.error(`Refusing to call the production gateway (${gatewayUrl}): it costs real money. Add --allow-production if this is the QA/SA probe.`);
  process.exit(2);
}

// ---------- reading the input ----------
const LINE_VIA: Record<string, string> = { tag: "mention", "reply to him": "reply_to_me", name: "name_match", "@All": "mention_all" };
const MAIL_VIA = ["to me", "Cc"];
const strip = (s: string) => s.replace(/\*\*/g, "").trim();

function fromMarkdown(md: string): Item[] {
  const userName = /- Name: \*\*(.+?)\*\*/.exec(md)?.[1]?.trim() ?? "ผู้ใช้";
  const namesLine = /name list for untagged matching:\s*(.+)/.exec(md)?.[1] ?? "";
  const userNames = [...namesLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  const userSentences = (/\*\*Sentences:\*\*\s*"([\s\S]*?)"/.exec(md)?.[1] ?? "").replace(/\s+/g, " ").trim();
  if (!userSentences) throw new Error("no **Sentences:** block found in the corpus");

  const items: Item[] = [];
  for (const row of md.split("\n").filter((l) => /^\|\s*[NH]\d+\s*\|/.test(l))) {
    const cells = row.split("|").slice(1, -1).map(strip);
    const [id, where, via, text, label] = cells as [string, string, string, string, string];
    const parts = where.split(" · ").map(strip);
    const expected = label === "N" ? "notify" : label === "H" ? "hold" : null;
    if (!expected) throw new Error(`row ${id}: label must be N or H, got "${label}"`);

    if (parts[0] === "LINE") {
      const recipientKind = LINE_VIA[via];
      if (!recipientKind) throw new Error(`row ${id}: unknown via "${via}"`);
      items.push({ id, channel: "line", senderName: "สมาชิกในกลุ่ม", groupName: parts[1] ?? null, subject: null, recipientKind, text, userSentences, userName, userNames, expected });
    } else if (parts[0] === "Mail") {
      if (!MAIL_VIA.includes(via)) throw new Error(`row ${id}: unknown via "${via}"`);
      const recipientKind = parts[1]!.includes("Cc") ? "cc" : parts[1]!.includes("(list)") ? "list" : "to";
      const subject = /^เรื่อง:\s*(.+?)(?:\s+—\s+|$)/.exec(text)?.[1] ?? null;
      items.push({ id, channel: "mail", senderName: parts[2] ?? "unknown", groupName: null, subject, recipientKind, text, userSentences, userName, userNames, expected });
    } else {
      throw new Error(`row ${id}: unknown channel "${parts[0]}"`);
    }
  }
  if (!items.length) throw new Error("no message rows found in the corpus");
  return items;
}

function fromJson(json: string): Item[] {
  return (JSON.parse(json) as any[]).map((r) => ({
    id: r.id, channel: r.channel, senderName: r.senderName, groupName: r.groupName ?? null, subject: r.subject ?? null,
    recipientKind: r.recipientKind, text: r.text, userSentences: r.userSentences ?? "", userName: r.userName ?? "ผู้ใช้",
    userNames: r.userNames ?? [], expected: r.expected,
  }));
}

const raw = readFileSync(input, "utf8");
const items = input.endsWith(".json") ? fromJson(raw) : fromMarkdown(raw);

// ---------- the judge: real product code, no database ----------
const repo = process.cwd();
const { createJudge, DEFAULT_AI_SETTINGS } = await import(`${repo}/src/filter/ai.ts`);
const { createGateway } = await import(`${repo}/src/filter/gateway.ts`);

const model = (env: string | undefined, fallback: { provider: string | null; model: string | null }) => {
  if (!env) return fallback;
  if (env === "-") return { provider: null, model: null };
  const [provider, ...rest] = env.split("/");
  return { provider: provider!, model: rest.join("/") || null };
};
const settings = {
  layer1: model(process.env.CORPUS_LAYER1, DEFAULT_AI_SETTINGS.layer1),
  layer2: model(process.env.CORPUS_LAYER2, DEFAULT_AI_SETTINGS.layer2),
};
const byUser = new Map(items.map((i) => [i.id, { name: i.userName, names: i.userNames }]));
const judge = createJudge({
  gateway: createGateway({ url: gatewayUrl, key: process.env.LLM_GATEWAY_KEY?.trim() ?? "" }),
  settings: async () => settings,
  userContext: async (userId: string) => byUser.get(userId)!,
  logCall: async () => {},
});

// ---------- running ----------
type Run = { score: number } | { error: string };
const results = new Map<string, Run[]>();
const queue = items.flatMap((item) => Array.from({ length: RUNS }, () => item));
let next = 0;
async function worker() {
  while (next < queue.length) {
    const item = queue[next++]!;
    const message = {
      id: crypto.randomUUID(), userId: item.id, channel: item.channel, senderKey: item.senderName, senderName: item.senderName,
      groupId: item.groupName, groupName: item.groupName, subject: item.subject, text: item.text, recipientKind: item.recipientKind,
    };
    let run: Run;
    try {
      run = { score: (await judge(message, { bar: 0, sentences: item.userSentences })).score };
    } catch (e) {
      run = { error: e instanceof Error ? e.message : String(e) };
    }
    (results.get(item.id) ?? results.set(item.id, []).get(item.id)!).push(run);
  }
}
console.log(`corpus: ${items.length} messages × ${RUNS} runs · gateway ${gatewayUrl} · layer1 ${JSON.stringify(settings.layer1)} · layer2 ${JSON.stringify(settings.layer2)}`);
await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));

// ---------- scoring (corpus.md "How a run is scored") ----------
// A failed judge fails open in the product (notified), so an error counts as notified here and is shown as ERR.
const notified = (r: Run, bar: number) => ("error" in r ? true : r.score >= bar);

function totals(bar: number) {
  let wrongHolds = 0, wrongPasses = 0, flips = 0;
  for (const item of items) {
    const outcomes = results.get(item.id)!.map((r) => notified(r, bar));
    if (item.expected === "notify") {
      if (outcomes.some((o) => !o)) wrongHolds++;
      if (outcomes.some((o) => o) && outcomes.some((o) => !o)) flips++;
    } else if (outcomes.some((o) => o)) {
      wrongPasses++;
    }
  }
  return { wrongHolds, wrongPasses, flips, meets: wrongHolds === 0 && wrongPasses <= 2 && flips === 0 };
}

const BARS = Array.from({ length: 9 }, (_, i) => 50 + i * 5);
const pad = (s: string | number, n: number) => String(s).padEnd(n);
console.log(`\n${pad("id", 5)}${pad("exp", 7)}${pad("scores per run", 22)}${BARS.map((b) => pad(b, 4)).join("")}   (. ok · H wrong hold · F flip · P wrong pass)`);
for (const item of items) {
  const runs = results.get(item.id)!;
  const scores = runs.map((r) => ("error" in r ? "ERR" : r.score)).join(", ");
  const cells = BARS.map((bar) => {
    const o = runs.map((r) => notified(r, bar));
    const symbol = item.expected === "notify" ? (o.every(Boolean) ? "." : o.some(Boolean) ? "F" : "H") : o.some(Boolean) ? "P" : ".";
    return pad(symbol, 4);
  }).join("");
  console.log(`${pad(item.id, 5)}${pad(item.expected, 7)}${pad(scores, 22)}${cells}`);
}

console.log(`\n${pad("bar", 6)}${pad("wrong holds (0)", 18)}${pad("wrong passes (≤2)", 20)}${pad("flips (0)", 11)}meets line`);
for (const bar of BARS) {
  const t = totals(bar);
  console.log(`${pad(bar, 6)}${pad(t.wrongHolds, 18)}${pad(t.wrongPasses, 20)}${pad(t.flips, 11)}${t.meets ? "yes" : "no"}`);
}
const best = Array.from({ length: 101 }, (_, b) => b).filter((b) => totals(b).meets).pop();
console.log(`\nhighest bar 0–100 meeting the line: ${best ?? "NONE (TEST-003 #19: no bar meets it → TEST_FAILED)"}`);
const errors = [...results.values()].flat().filter((r) => "error" in r);
if (errors.length) console.log(`${errors.length} run(s) failed (shown as ERR, counted as notified = fail open): ${[...new Set(errors.map((e: any) => e.error))].join(" | ")}`);
