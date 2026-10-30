// Throwaway (TASK-108 step 8): "try the product" as the PM named โด่ง, on a LOCAL pglite back end (gateway dead, nothing live).
// usage (cwd = blueprint-front): bun run <this file> <apiUrl> <frontUrl> <screenshot-dir> <theme>
// Prints one line per observation; screenshots go to <dir>. Throwaway: lives here, never in a product repo.
import { writeFileSync } from "node:fs";
import { chromium } from "/workspace/codebases/blueprint-front/node_modules/playwright-core/index.mjs";

const [api, front, dir, theme = "default"] = process.argv.slice(2);
const NAME = "โด่ง";
const by = encodeURIComponent(NAME);
const say = (k: string, v: unknown) => console.log(`${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
const call = async (method: string, route: string, body?: unknown) => {
  const r = await fetch(api + route, { method, headers: { "content-type": "application/json", "X-Blueprint-By": by }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
};

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const shot = (n: string) => page.screenshot({ path: `${dir}/${theme}-${n}.png`, fullPage: true });
const settle = () => page.waitForLoadState("networkidle").catch(() => {});

// 1. home, no name typed yet
await page.goto(`${front}/`);
await settle();
say("1 home, no name: name field open", await page.locator("[data-name-prompt]").count());
say("1 home: prompt placeholder", await page.locator("[data-name-prompt] input").getAttribute("placeholder"));
await shot("01-home-no-name");

// 2. try to create a project with no name (AC-6)
await page.getByRole("button", { name: "+ โปรเจกต์ใหม่" }).click();
await page.locator("dialog input[name=name]").fill("ลองไม่มีชื่อ");
await page.getByRole("button", { name: "สร้าง", exact: true }).click();
await settle();
await page.waitForTimeout(800);
say("2 create with no name: url after", page.url());
say("2 create with no name: projects in back end named ลองไม่มีชื่อ", ((await (await fetch(`${api}/v1/projects`)).json()) as { name: string }[]).filter((p) => p.name === "ลองไม่มีชื่อ").length);
await shot("02-create-without-name");
await page.keyboard.press("Escape");

// 3. type the name
const input = page.locator("[data-name-prompt] input");
await input.fill(NAME);
await input.press("Enter");
await settle();
await page.waitForTimeout(500);
say("3 after typing the name: name button text", (await page.locator("form[data-name-prompt]").count()) === 0 ? await page.locator("main button, header button, button").filter({ hasText: NAME }).first().innerText() : "(field still open)");
say("3 cookie", (await ctx.cookies()).filter((c) => c.name === "bp_by").map((c) => c.value));
await shot("03-home-named");

// 4. new project
await page.getByRole("button", { name: "+ โปรเจกต์ใหม่" }).click();
await page.locator("dialog input[name=name]").fill("ทดลอง REQ-103");
await page.locator(`dialog input[name=theme][value=${theme}]`).check().catch(() => {});
await page.getByRole("button", { name: "สร้าง", exact: true }).click();
await page.waitForURL(/\/chat$/, { timeout: 15000 });
await settle();
const projectId = page.url().split("/p/")[1]!.split("/")[0]!;
say("4 new project", { projectId, url: page.url() });
await shot("04-chat-new-project");

// 5. add a source through the chat page (a text file, stamped by the person)
writeFileSync(`${dir}/brief.txt`, "ผู้ใช้จองห้องประชุมได้ ผู้จัดการอนุมัติ\n");
const fileInput = page.locator("input[type=file]").first();
say("5 source: file input on the chat page", await fileInput.count());
if (await fileInput.count()) {
  await fileInput.setInputFiles(`${dir}/brief.txt`);
  await page.waitForTimeout(1500);
  await shot("05-chat-after-file-chosen");
  const radios = await page.locator("input[type=radio]").evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
  say("5 source: stamp choices on the page", radios);
}

// 6. a chat message (gateway is dead: GATEWAY_URL=127.0.0.1:9)
const box = page.locator("textarea").first();
await box.fill("ผู้ใช้จองห้องประชุมได้");
await box.press("Enter").catch(() => {});
await page.waitForTimeout(3000);
await settle();
say("6 chat: after a message with the gateway dead, visible text", (await page.locator("main").innerText()).split("\n").filter(Boolean).slice(-12));
await shot("06-chat-after-message");

say("projectId", projectId);
await browser.close();
