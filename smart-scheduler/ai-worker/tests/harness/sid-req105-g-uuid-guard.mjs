/**
 * TEST round G (REQ-105 slice, TASK-451) — the uuid-param guard is GLOBAL on /api/*:
 * a broken id must get a 400 at the boundary, never a 500 (previously 22P02 from pg).
 *
 * Proves: garbage / non-uuid :id params on several real routes return 400, not 500.
 * Does NOT prove: the FE never sends "undefined" (that is TASK-450b, a client guard).
 *
 * Run: node tests/harness/sid-req105-g-uuid-guard.mjs   (from smart-scheduler/ai-worker)
 */
import { openSidSession, api } from "./sid-session-kuydong.mjs";

const CASES = [
  ["GET", "/bookings/undefined"],
  ["GET", "/bookings/not-a-uuid"],
  ["GET", "/teachers/b1"],
  ["GET", "/courses/123"],
  ["GET", "/camp/weeks/undefined/days"],
  ["GET", "/students/nope"],
];

const { browser, origin, apiToken } = await openSidSession();
const results = [];
for (const [method, path] of CASES) {
  const r = await api(origin, apiToken, method, path);
  const verdict = r.status === 400 ? "PASS" : "FAIL";
  results.push({ method, path, status: r.status, verdict, body: r.text.slice(0, 160) });
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
