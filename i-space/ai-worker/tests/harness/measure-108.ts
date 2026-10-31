// Throwaway (TASK-108): seed the worked example on a LOCAL pglite back end, then print where the clean-blue web box starts
// at 390 px (tests/states.spec.ts:228 asks <= 422), with and without the name cookie.
// usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <out-prefix>
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";
import { seed } from "/workspace/codebases/blueprint-front/tests/seed/seed.ts";

const [api, front, out] = process.argv.slice(2);
const s = await seed(api!, "worked", "clean-blue");
const browser = await chromium.launch({ channel: "chrome" });
for (const name of [null, "โด่ง"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  if (name) await ctx.addCookies([{ name: "bp_by", value: encodeURIComponent(name), url: new URL(front!).origin }]);
  const page = await ctx.newPage();
  await page.goto(`${front}/p/${s.id}/web`);
  await page.waitForSelector("main [role=region]");
  const top = await page.locator("main [role=region]").evaluate((e) => e.getBoundingClientRect().top);
  console.log(name ?? "(no name)", "box top =", top);
  await page.screenshot({ path: `${out}-${name ? "name" : "noname"}.png` });
  await ctx.close();
}
await browser.close();
