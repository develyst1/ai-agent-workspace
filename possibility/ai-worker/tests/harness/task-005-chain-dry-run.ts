// Harness (Jason, 2026-09-19): runs the 5-step chain against the real gateway WITHOUT a database
// (analyseIdea writes nothing). Run from possibility-back with env vars set; costs one chain of gateway calls.
import { loadAiConfig } from "../../../../../../possibility/possibility-back/src/ai/config";
import { analyseIdea } from "../../../../../../possibility/possibility-back/src/services/analysis";
import { tierFromLowestScore, discountFor } from "../../../../../../possibility/possibility-back/src/lib/tier";
await loadAiConfig();
const text = process.argv[2] ?? "A mobile app that lets small farmers in rural Thailand share tractors and harvesters by the hour, with GPS tracking, a deposit system, and Thai-language voice booking for farmers who cannot read well.";
const lang = (process.argv[3] ?? "th") as "th" | "en";
const t0 = Date.now();
const r = await analyseIdea(text, lang);
for (const s of r.steps) console.log(`${s.order} ${s.step.padEnd(12)} ${s.config.provider}/${s.config.model} ${s.latencyMs}ms output=${JSON.stringify(s.output).slice(0, 140)}…`);
const low = Math.min(r.scores.feasibility, r.scores.impact, r.scores.interestingness);
console.log("scores:", r.scores.feasibility, r.scores.impact, r.scores.interestingness, "| reason:", r.scores.reason);
console.log(`min=${low} → ideaTier=${tierFromLowestScore(low)} discount=${discountFor(tierFromLowestScore(low))}% total=${Date.now() - t0}ms`);
