// Preload for the GATEWAY process in TASK-103 runs: an outbound fetch to any host other than the two providers under test
// (and localhost) is refused and logged, so DeepSeek, OpenAI and everything else cannot be reached by mistake, whatever the
// gateway's own default provider or fallback chain says. (Owner, DECISIONS 2026-11-07 03:49: "อย่าเพิ่งใช้ deepseek นะ".)
// Refused hosts go to ALLOWLIST_LOG (default stderr), one line each, the URL without its query string.
// If another preload (refuse-fetch.ts) is also loaded, this one must be the OUTER wrapper, so a refused host never reaches it.
import { appendFileSync } from "node:fs";

// When ALLOWLIST_LOG is set the preload says so as soon as it is loaded, so run-check.ts can PROVE the gateway it started is
// under the allow-list (and not merely hope the flag was passed).
if (process.env.ALLOWLIST_LOG) appendFileSync(process.env.ALLOWLIST_LOG, "LOADED\n");
const ALLOWED = new Set(["generativelanguage.googleapis.com", "api.x.ai", "localhost", "127.0.0.1"]);
const inner = globalThis.fetch;
globalThis.fetch = (async (input: any, init: any) => {
  const raw = String(input?.url ?? input);
  let host = "";
  try { host = new URL(raw).hostname; } catch { /* unparseable: refused below */ }
  if (!ALLOWED.has(host)) {
    appendFileSync(process.env.ALLOWLIST_LOG ?? "/dev/stderr", `REFUSED host=${host || "?"} ${raw.split("?")[0]}\n`);
    throw new TypeError(`refused by allow-hosts.ts: ${host || "unparseable url"}`);
  }
  return inner(input, init);
}) as any;
