// QA Team B (Tefany) — TEST-006: make (or disable) QA-B's own SIT user through the SIT admin API. Throwaway harness.
//   bun sit-user.ts create     → creates qa-sit-b1-<tag>@qa-b.test with a generated password (scratchpad file only)
//   bun sit-user.ts disable    → disables that user (footprint end state)
// The owner login is read in-process from corner-chat-back/.env (OWNER_EMAIL / OWNER_PASSWORD) and never printed.
// Hard-refuses any API host except the SIT one. Prints the e-mail, statuses and counts only.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const API = "https://cornerchat-api-sit.develyst.online/api/v1";
if (new URL(API).hostname !== "cornerchat-api-sit.develyst.online") throw new Error("refusing: not the SIT API");
const FILE = "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-sit-user.json";
const env = readFileSync("H:/corner-chat/corner-chat-back/.env", "utf8");
const val = (k: string) => env.match(new RegExp(`^\\s*${k}\\s*=\\s*(.+)\\s*$`, "m"))?.[1]?.replace(/^["']|["']$/g, "");
const call = async (m: string, p: string, t?: string, b?: unknown) => {
  const r = await fetch(`${API}${p}`, { method: m, headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(b ? { "Content-Type": "application/json" } : {}) }, body: b ? JSON.stringify(b) : undefined });
  const x = await r.text(); try { return { s: r.status, j: JSON.parse(x) }; } catch { return { s: r.status, j: null }; }
};
const ownerLogin = await call("POST", "/auth/login", undefined, { email: val("OWNER_EMAIL"), password: val("OWNER_PASSWORD") });
if (ownerLogin.s !== 200) { console.log(`owner login on SIT: ${ownerLogin.s} (not printing why)`); process.exit(1); }
const OT = ownerLogin.j.token as string;
const cmd = process.argv[2];

if (cmd === "create") {
  if (existsSync(FILE)) { const u = JSON.parse(readFileSync(FILE, "utf8")); console.log(`exists already: ${u.email}`); process.exit(0); }
  const tag = Date.now().toString(36);
  const email = `qa-sit-b1-${tag}@qa-b.test`;
  // letters and digits only, so it can be typed with `adb shell input text` without shell quoting
  const password = "QaB" + Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString("hex");
  const r = await call("POST", "/admin/users", OT, { name: "QA-B SIT (Tefany)", email, password });
  if (r.s !== 201) { console.log(`create: ${r.s} ${r.j?.error?.code ?? ""}`); process.exit(1); }
  writeFileSync(FILE, JSON.stringify({ id: r.j.user.id, email, password }));
  const login = await call("POST", "/auth/login", undefined, { email, password });
  console.log(`created ${email} (id ${r.j.user.id.slice(0, 8)}…) · user login ${login.s}`);
} else if (cmd === "disable") {
  const u = JSON.parse(readFileSync(FILE, "utf8"));
  const r = await call("POST", `/admin/users/${u.id}/disable`, OT);
  console.log(`disable ${u.email}: ${r.s}`);
} else {
  console.error("usage: bun sit-user.ts create | disable"); process.exit(2);
}
