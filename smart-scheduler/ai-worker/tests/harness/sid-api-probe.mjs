/**
 * QA harness — authenticated read-only API probes on `sid`.
 * Usage: node sid-api-probe.mjs "<GET path>" ["<GET path2>" ...]   (paths are relative to /api)
 */
import { openSidSession, api } from "./sid-session.mjs";

const { browser, origin, apiToken } = await openSidSession();
for (const p of process.argv.slice(2)) {
  const r = await api(origin, apiToken, "GET", p);
  console.log(`\n=== GET ${p} → ${r.status}`);
  console.log(r.text.slice(0, 1200));
}
await browser.close();
