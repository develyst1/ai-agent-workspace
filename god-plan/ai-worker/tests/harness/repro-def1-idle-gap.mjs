// Extra attempt to provoke DEF-1: a hung AI call through the front proxy right after the proxy connection sat idle.
import { writeFileSync } from "node:fs";
const MODE = "/workspace/ai-agent-workspace/god-plan/ai-worker/tests/harness/gateway-stub/mode.txt";
const base = "http://localhost:4300";
const r = await fetch(base + "/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@godplan.test", password: process.env.GP_SEED_OWNER_PASSWORD }) });
const cookie = r.headers.getSetCookie()[0].split(";")[0];
const list = await (await fetch(base + "/api/projects", { headers: { cookie } })).json();
const p2 = list.projects.find((p) => p.name === "งานสวนหลังบ้าน").id;
for (const gap of [10, 31, 35, 45]) {
  writeFileSync(MODE, "ok\n");
  await fetch(base + "/api/projects", { headers: { cookie } }).then((x) => x.text());
  await new Promise((s) => setTimeout(s, gap * 1000));
  writeFileSync(MODE, "hang\n");
  const t0 = Date.now();
  try {
    const x = await fetch(`${base}/api/projects/${p2}/ai/task-proposals`, { method: "POST", headers: { cookie }, signal: AbortSignal.timeout(90000) });
    console.log(`idle ${gap}s then hung G1: ${x.status} after ${Date.now() - t0} ms ${(await x.text()).slice(0, 60)}`);
  } catch (e) { console.log(`idle ${gap}s then hung G1: no answer after ${Date.now() - t0} ms (${e.name})`); }
}
writeFileSync(MODE, "ok\n");
