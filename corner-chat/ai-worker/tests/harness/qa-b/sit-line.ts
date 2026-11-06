// QA Team B (Tefany) — TEST-006 row 9 (LINE intake + 1-on-1 push on SIT) helper, as QA-B's own SIT user. Throwaway.
//   bun sit-line.ts setup     → names ["ทดสอบซิท"], bar 0 (row 9 tests intake + push, not the AI's judgement)
//   bun sit-line.ts code      → a fresh 6-digit link code (code + Bangkok expiry only)
//   bun sit-line.ts status    → linked?, groups count, notified/held items as "recipientKind:about", push count if visible
// Hard-refuses any host but the SIT API. Prints no LINE id, no token, no password.
import { readFileSync } from "node:fs";

const API = "https://cornerchat-api-sit.develyst.online/api/v1";
if (new URL(API).hostname !== "cornerchat-api-sit.develyst.online") throw new Error("refusing: not the SIT API");
const U = JSON.parse(readFileSync("C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-sit-user.json", "utf8"));
const call = async (m: string, p: string, t?: string, b?: unknown) => {
  const r = await fetch(`${API}${p}`, { method: m, headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(b ? { "Content-Type": "application/json" } : {}) }, body: b ? JSON.stringify(b) : undefined });
  const x = await r.text(); try { return { s: r.status, j: JSON.parse(x) }; } catch { return { s: r.status, j: null }; }
};
const login = await call("POST", "/auth/login", undefined, { email: U.email, password: U.password });
if (login.s !== 200) { console.log(`QA-B SIT user login: ${login.s}`); process.exit(1); }
const T = login.j.token as string;
const cmd = process.argv[2];
try {
  if (cmd === "setup") {
    const n = await call("PUT", "/channels/line/names", T, { names: ["ทดสอบซิท"] });
    const s = await call("PUT", "/conditions/settings", T, { bar: 0, sentences: "แจ้งทุกเรื่อง (QA row 9)" });
    console.log(`names ${n.s} ${JSON.stringify(n.j?.names)} · settings ${s.s} bar ${s.j?.bar ?? "?"}`);
  } else if (cmd === "code") {
    const c = (await call("POST", "/channels/line/link-code", T)).j;
    console.log(`code ${c.code} · expires ${new Date(c.expiresAt).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" })} (Bangkok)`);
  } else if (cmd === "status") {
    const ch = (await call("GET", "/channels", T)).j?.line;
    const groups = (await call("GET", "/channels/line/groups", T)).j?.groups ?? [];
    const tab = async (t: string) => ((await call("GET", `/messages?tab=${t}&limit=50`, T)).j?.items ?? []).map((m: any) => `${m.recipientKind ?? "?"}:${m.decidedBy ?? m.decision?.decidedBy ?? ""}:${String(m.aboutLine ?? "").slice(0, 24)}`);
    console.log(JSON.stringify({ linked: ch?.linked, hasDisplayName: !!ch?.displayName, groups: groups.length, notified: await tab("notified"), held: await tab("held") }));
  } else {
    console.error("usage: bun sit-line.ts setup | code | status"); process.exit(2);
  }
} finally {
  await call("POST", "/auth/logout", T).catch(() => {});
}
