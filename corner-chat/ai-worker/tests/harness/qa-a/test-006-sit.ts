// TEST-006 rows 1–5 — the SIT release pass, QA Team A's rows. Runs ONLY when SIT is in PROTOCOL.md → Environments (Q1).
//   QA_BACK_REPO=… bun test-006-sit.ts      → one line per check, writes test-006-sit-result.json
// SIT shares the desk's corner_chat database (TEST-006 rule 1): every user made here is `qa-sit-…`, recorded, and DISABLED at
// the end (the API cannot delete users). Never touches the owner account's data or any row it did not create. No restart,
// no config. The owner login is read in-process from the back repo's .env (TEST-006 rule 5) and never printed.
// Throwaway harness.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as tls from "node:tls";

const BACK = process.env.QA_BACK_REPO?.trim();
if (!BACK) throw new Error("set QA_BACK_REPO");
const HOST = "cornerchat-api-sit.develyst.online";
const API = `https://${HOST}/api/v1`;
const ADMIN_ORIGIN = "https://cornerchat-sit.develyst.online";
const env = Object.fromEntries(readFileSync(join(BACK, ".env"), "utf8").split(/\r?\n/).map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m: any) => [m[1], m[2].replace(/^["']|["']$/g, "")]));
if (!env.OWNER_EMAIL || !env.OWNER_PASSWORD) throw new Error("OWNER_EMAIL / OWNER_PASSWORD missing in the back repo's .env");

type Check = { row: string; what: string; expected: string; actual: string; pass: boolean };
const checks: Check[] = [];
const check = (row: string, what: string, expected: string, actual: unknown, pass: boolean) => {
  const a = typeof actual === "string" ? actual : JSON.stringify(actual);
  checks.push({ row, what, expected, actual: a, pass });
  console.log(`${pass ? "PASS" : "FAIL"} row ${row} ${what} — expected ${expected} — got ${a}`);
};
const call = async (method: string, path: string, token?: string, body?: unknown, headers: Record<string, string> = {}) => {
  const r = await fetch(`${API}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let json: any = null; try { json = t ? JSON.parse(t) : null; } catch { json = t.slice(0, 120); }
  return { status: r.status, json, headers: r.headers };
};
const code = (r: { status: number; json: any }) => `${r.status} ${r.json?.error?.code ?? ""}`.trim();
const tag = Date.now().toString(36);
const created: string[] = [];

try {
  // ---------- row 1: health, plain HTTP, TLS
  const h = await call("GET", "/health");
  check("1", "GET /health", "200 {ok:true, db:true}", `${h.status} ${JSON.stringify(h.json)}`, h.status === 200 && h.json?.ok === true && h.json?.db === true);
  const plain = await fetch(`http://${HOST}/api/v1/health`, { redirect: "manual" }).then((r) => `${r.status} ${r.headers.get("location") ?? ""}`, (e) => `refused (${(e as Error).message.slice(0, 40)})`);
  check("1", "plain HTTP", "refused, or a redirect to https", plain, /^refused/.test(plain) || /^30[1278] https:\/\//.test(plain));
  const cert: any = await new Promise((res) => {
    const s = tls.connect({ host: HOST, port: 443, servername: HOST }, () => { const c = s.getPeerCertificate(); res({ authorized: s.authorized, err: s.authorizationError, subject: c.subject?.CN, issuer: c.issuer?.O ?? c.issuer?.CN, until: c.valid_to }); s.end(); });
    s.on("error", (e) => res({ authorized: false, err: e.message }));
  });
  const daysLeft = cert.until ? Math.floor((Date.parse(cert.until) - Date.now()) / 86400000) : -1;
  check("1", "TLS certificate", "trusted chain, name matches, not expiring within 14 days", `${cert.authorized ? "trusted" : `NOT trusted (${cert.err})`} · CN ${cert.subject} · ${cert.issuer} · ${daysLeft} days left`, cert.authorized === true && daysLeft > 14);

  // ---------- row 2: admin API
  const ol = await call("POST", "/auth/login", undefined, { email: env.OWNER_EMAIL, password: env.OWNER_PASSWORD });
  check("2", "owner signs in (password not printed)", "200 role owner", `${ol.status} ${ol.json?.user?.role}`, ol.status === 200 && ol.json?.user?.role === "owner");
  const OT = ol.json?.token as string;
  const mk = async (n: string) => {
    const email = `qa-sit-${n}-${tag}@qa-a.test`, password = `pw-qa-sit-${n}-${tag}`;
    const r = await call("POST", "/admin/users", OT, { name: `qa-sit-${n}`, email, password });
    if (r.json?.user?.id) created.push(`${r.json.user.id} qa-sit-${n} ${email}`);
    return { r, email, password, id: r.json?.user?.id as string };
  };
  const U1 = await mk("u1"), U2 = await mk("u2");
  check("2", "create qa-sit-u1 and qa-sit-u2", "201 · 201, role user", `${U1.r.status} · ${U2.r.status}`, U1.r.status === 201 && U2.r.status === 201 && U1.r.json.user.role === "user");
  const list = await call("GET", "/admin/users", OT);
  const emails = (list.json?.users ?? []).map((u: any) => u.email);
  check("2", "the user list shows them", "both emails present", `${list.status} · ${emails.includes(U1.email)}/${emails.includes(U2.email)}`, list.status === 200 && emails.includes(U1.email) && emails.includes(U2.email));

  // ---------- row 3: user API, sign-out revokes, wrong password, isolation
  const l1 = await call("POST", "/auth/login", undefined, { email: U1.email, password: U1.password });
  const T1 = l1.json?.token as string;
  check("3", "qa-sit-u1 signs in", "200", l1.status, l1.status === 200);
  const wrong = await call("POST", "/auth/login", undefined, { email: U1.email, password: "definitely-wrong" });
  check("3", "a wrong password is refused", "401 INVALID_CREDENTIALS", code(wrong), wrong.status === 401 && wrong.json?.error?.code === "INVALID_CREDENTIALS");
  const T2 = (await call("POST", "/auth/login", undefined, { email: U2.email, password: U2.password })).json?.token as string;
  const u2rule = await call("POST", "/conditions/rules", T2, { kind: "keyword", value: `qa-sit-u2-${tag}`, action: "never" });
  await call("PUT", "/conditions/settings", T2, { bar: 42, sentences: "qa-sit-u2" });
  const steal = await call("DELETE", `/conditions/rules/${u2rule.json?.rule?.id}`, T1);
  const u1view = await call("GET", "/conditions", T1);
  const u2after = await call("GET", "/conditions", T2);
  check("3", "U1 cannot read or delete U2's data", "U1 sees bar 70 / no U2 rule · delete U2's rule → 404 · U2 unchanged (bar 42, rule kept)",
    `U1 bar ${u1view.json?.bar}, U2 rule visible ${(u1view.json?.rules ?? []).some((r: any) => r.id === u2rule.json?.rule?.id)} · ${code(steal)} · U2 bar ${u2after.json?.bar}, rule kept ${(u2after.json?.rules ?? []).some((r: any) => r.id === u2rule.json?.rule?.id)}`,
    u1view.json?.bar === 70 && !(u1view.json?.rules ?? []).some((r: any) => r.id === u2rule.json?.rule?.id) && steal.status === 404 && u2after.json?.bar === 42 && (u2after.json?.rules ?? []).some((r: any) => r.id === u2rule.json?.rule?.id));
  const adm = await call("GET", "/admin/users", T1);
  check("3", "a user token on the admin API", "403 FORBIDDEN", code(adm), adm.status === 403);

  // ---------- row 4: conditions + AI settings + the gateway from SIT
  const set = await call("PUT", "/conditions/settings", T1, { bar: 75, sentences: "แจ้งเรื่องงานที่ต้องตอบ (qa-sit)" });
  const rule = await call("POST", "/conditions/rules", T1, { kind: "keyword", value: "โปรโมชั่น", action: "never" });
  const back = await call("GET", "/conditions", T1);
  check("4", "U1 sets a bar and sentences, adds a rule; they read back the same", "bar 75 · Thai sentences · rule มีคำว่า โปรโมชั่น never",
    `${set.status}/${rule.status} · bar ${back.json?.bar} · "${back.json?.sentences}" · ${JSON.stringify((back.json?.rules ?? []).map((r: any) => `${r.kind}:${r.value}:${r.action}`))}`,
    back.json?.bar === 75 && back.json?.sentences === "แจ้งเรื่องงานที่ต้องตอบ (qa-sit)" && (back.json?.rules ?? []).some((r: any) => r.kind === "keyword" && r.value === "โปรโมชั่น" && r.action === "never"));
  const ai = await call("GET", "/admin/settings/ai", OT);
  check("4", "AI settings read (owner)", "200, a model per layer", `${ai.status} ${JSON.stringify(ai.json)}`, ai.status === 200 && !!ai.json?.layer1 && !!ai.json?.layer2);
  const models = await call("GET", "/admin/ai-models", OT);
  const providers = models.json && typeof models.json === "object" ? Object.keys(models.json.data ?? models.json).slice(0, 6) : [];
  check("4", "SIT reaches the AI gateway (GET /admin/ai-models passes the gateway's list through)", "200, providers listed", `${models.status} · ${JSON.stringify(providers)}`, models.status === 200 && providers.length > 0);

  // ---------- row 5: CORS
  const pre = async (origin: string) => {
    const r = await fetch(`${API}/auth/login`, { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,authorization" } });
    return { status: r.status, acao: r.headers.get("access-control-allow-origin") };
  };
  const good = await pre(ADMIN_ORIGIN), bad = await pre("https://evil.example.test");
  check("5", "preflight from the admin origin", `allowed: ACAO = ${ADMIN_ORIGIN}`, `${good.status} ACAO=${good.acao}`, good.acao === ADMIN_ORIGIN);
  check("5", "preflight from an unknown origin", "no ACAO for it (and not *)", `${bad.status} ACAO=${bad.acao}`, bad.acao !== "https://evil.example.test" && bad.acao !== "*");

  // ---------- row 3 tail: sign-out revokes the token
  const out = await call("POST", "/auth/logout", T1);
  const me = await call("GET", "/me", T1);
  check("3", "sign-out revokes the token", "204, then /me → 401", `${out.status} · ${code(me)}`, out.status === 204 && me.status === 401);

  // ---------- footprint: disable the two QA users (no delete endpoint)
  for (const u of [U1, U2]) if (u.id) await call("POST", `/admin/users/${u.id}/disable`, OT);
  const after = (await call("GET", "/admin/users", OT)).json?.users ?? [];
  const states = [U1, U2].map((u) => after.find((x: any) => x.id === u.id)?.status);
  check("footprint", "the two qa-sit users are disabled at the end", "disabled · disabled", states.join(" · "), states.every((s) => s === "disabled"));
} catch (e) {
  check("x", "script error", "none", (e as Error).message.split("\n")[0], false);
}
writeFileSync(join(import.meta.dir, "test-006-sit-result.json"), JSON.stringify({ ranAt: new Date().toISOString(), tag, created, checks }, null, 2));
console.log(`\n${checks.filter((c) => c.pass).length}/${checks.length} checks passed · created: ${created.length} user(s) (ids in the result file)`);
