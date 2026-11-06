// QA Team B (Tefany) — live sitting: what U1's app (web build :3292, real back end) shows. Throwaway.
//   node live-app-shot.mjs <playwright-core/index.mjs> <label> <route>   → shots/live-<label>.png + a short text summary
// U1's login comes from a scratchpad file outside every repo; never printed. The display name is NOT printed (real person).
import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const [pw, label, route] = process.argv.slice(2);
const { chromium } = await import(pathToFileURL(pw).href);
const here = dirname(fileURLToPath(import.meta.url));
const u = JSON.parse(readFileSync("C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-live-u1.json", "utf8"));
const APP = "http://127.0.0.1:3292";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await (await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, locale: "th-TH" })).newPage();
const tid = (id) => p.getByTestId(id);
await p.goto(`${APP}/signin`); await tid("signin-email").waitFor({ timeout: 60000 });
await tid("signin-email").fill(u.email); await tid("signin-password").fill(u.password); await tid("signin-submit").click();
await tid("screen-messages").waitFor({ timeout: 20000 });
await p.goto(`${APP}${route}`); await p.waitForTimeout(3000);
const ids = await p.evaluate(() => [...document.querySelectorAll("[data-testid]")].map((e) => e.getAttribute("data-testid")));
const txt = async (id) => (await tid(id).first().innerText({ timeout: 1000 }).catch(() => "")).replace(/\s+/g, " ").trim();
console.log(JSON.stringify({
  route, lineLinked: await txt("line-linked"), hasDisplayName: (await txt("line-display-name")).length > 0,
  groupRows: ids.filter((x) => x?.startsWith("group-row-")).length, groupsEmpty: await txt("groups-empty"),
  rows: ids.filter((x) => x?.startsWith("row-")).length,
}));
await p.screenshot({ path: join(here, "shots", `live-${label}.png`) });
await b.close();
