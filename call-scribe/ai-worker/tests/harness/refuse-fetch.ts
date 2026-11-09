// Preload: every outbound fetch is written to OUTBOUND_LOG and refused, so nothing leaves the machine.
// Used to prove the audio suites stay off real providers when a repo's .env holds keys (TASK-112).
// Local calls are let through, since the harness itself may call localhost from the same process.
import { appendFileSync } from "node:fs";

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init: any) => {
  const url = String(input?.url ?? input);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url)) return realFetch(input, init);
  appendFileSync(process.env.OUTBOUND_LOG ?? "/dev/stderr", url.replace(/key=[^&]+/, "key=X") + "\n");
  throw new TypeError("refused by refuse-fetch.ts");
}) as any;
