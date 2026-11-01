// Throwaway mock of SPEC-001 §3.1–§3.3 (auth + admin users) so TASK-008 can be exercised before TASK-002 exists.
// Run: bun mock-api.ts   (port 8080, CORS for http://localhost:3000). In-memory only; NOT the real back end.
// Seed account: owner@example.test / ownerpass1 (owner). Users are added through POST /admin/users.
import { randomUUID } from "node:crypto";

type Role = "owner" | "user";
interface Rec { id: string; name: string; email: string; role: Role; status: "active" | "disabled"; createdAt: string; password: string }

const users: Rec[] = [
  { id: randomUUID(), name: "Owner", email: "owner@example.test", role: "owner", status: "active", createdAt: new Date().toISOString(), password: "ownerpass1" },
];
const MODELS: Record<string, string[]> = {
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro"],
  openai: ["gpt-4o-mini"],
  xai: ["grok-3-mini"],
};
let ai: { layer1: { provider: string | null; model: string | null }; layer2: { provider: string | null; model: string | null } } = {
  layer1: { provider: null, model: null },
  layer2: { provider: "gemini", model: "gemini-2.5-pro" },
};
const LINE_PUSHES: Record<string, number> = { "2026-11": 7, "2026-10": 31 };
const sessions = new Map<string, string>(); // token -> user id
const fails = new Map<string, number>();
const lockedUntil = new Map<string, number>();

const cors = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Expose-Headers": "Retry-After",
};
const pub = ({ password, ...u }: Rec) => u;
const json = (status: number, body?: unknown, extra: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", ...extra } });
const err = (status: number, code: string, fields?: Record<string, string>) =>
  json(status, { error: { code, message: `dev message for ${code}`, ...(fields ? { fields } : {}) } });

const PORT = Number(process.env.PORT ?? 8080);
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/v1/, "");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (path === "/health") return json(200, { ok: true, db: true });

    const body = req.method === "POST" || req.method === "PUT" ? await req.json().catch(() => ({})) : {};

    if (path === "/auth/login" && req.method === "POST") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if ((lockedUntil.get(email) ?? 0) > Date.now()) return err(429, "TOO_MANY_ATTEMPTS");
      const u = users.find((x) => x.email === email);
      if (!u || u.password !== body.password) {
        const n = (fails.get(email) ?? 0) + 1;
        fails.set(email, n);
        if (n >= 5) { lockedUntil.set(email, Date.now() + 300_000); fails.set(email, 0); }
        return err(401, "INVALID_CREDENTIALS");
      }
      fails.set(email, 0);
      if (u.status === "disabled") return err(403, "ACCOUNT_DISABLED");
      const token = randomUUID();
      sessions.set(token, u.id);
      return json(200, { token, user: pub(u) });
    }

    // everything below needs a token
    const token = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const me = users.find((x) => x.id === sessions.get(token));
    if (!me) return err(401, "UNAUTHENTICATED");
    if (me.status === "disabled") return err(401, "ACCOUNT_DISABLED");

    if (path === "/auth/logout" && req.method === "POST") { sessions.delete(token); return json(204); }
    if (path === "/me") return json(200, { user: pub(me) });

    if (path.startsWith("/admin/")) {
      if (me.role !== "owner") return err(403, "FORBIDDEN");
      if (path === "/admin/users" && req.method === "GET") return json(200, { users: [...users].reverse().map(pub) });

      // TASK-009 (SPEC-001 §3.3): AI settings, the gateway's model list, LINE push count
      if (path === "/admin/ai-models" && req.method === "GET") return json(200, MODELS);
      if (path === "/admin/settings/ai" && req.method === "GET") return json(200, ai);
      if (path === "/admin/settings/ai" && req.method === "PUT") {
        const fields: Record<string, string> = {};
        for (const layer of ["layer1", "layer2"] as const) {
          const { provider, model } = body[layer] ?? {};
          if (provider === null && model === null) continue;
          if (!(provider in MODELS)) fields[`${layer}.provider`] = "provider not in the gateway's /models";
          else if (!MODELS[provider].includes(model)) fields[`${layer}.model`] = "model not listed under that provider";
        }
        if (Object.keys(fields).length) return err(400, "VALIDATION", fields);
        ai = { layer1: body.layer1, layer2: body.layer2 };
        return json(200, ai);
      }
      if (path === "/admin/stats/line-pushes" && req.method === "GET") {
        const month = url.searchParams.get("month") ?? new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 7);
        return json(200, { month, count: LINE_PUSHES[month] ?? 0 });
      }
      if (path === "/admin/users" && req.method === "POST") {
        const fields: Record<string, string> = {};
        const name = String(body.name ?? "").trim();
        if (name.length < 1 || name.length > 100) fields.name = "must be 1-100 chars";
        if (!/^\S+@\S+\.\S+$/.test(String(body.email ?? ""))) fields.email = "invalid email";
        if (String(body.password ?? "").length < 8) fields.password = "min 8";
        if (Object.keys(fields).length) return err(400, "VALIDATION", fields);
        const email = String(body.email).trim().toLowerCase();
        if (users.some((x) => x.email === email)) return err(409, "EMAIL_TAKEN");
        const rec: Rec = { id: randomUUID(), name, email, role: "user", status: "active", createdAt: new Date().toISOString(), password: body.password };
        users.push(rec);
        return json(201, { user: pub(rec) });
      }
      const m = path.match(/^\/admin\/users\/([^/]+)\/(disable|enable|password)$/);
      if (m && req.method === "POST") {
        const target = users.find((x) => x.id === m[1]);
        if (!target) return err(404, "NOT_FOUND");
        if (m[2] === "password") {
          if (String(body.password ?? "").length < 8) return err(400, "VALIDATION", { password: "min 8" });
          target.password = body.password;
          for (const [t, id] of sessions) if (id === target.id) sessions.delete(t);
          return json(204);
        }
        if (m[2] === "disable") {
          if (target.role === "owner") return err(400, "CANNOT_DISABLE_OWNER");
          target.status = "disabled";
          for (const [t, id] of sessions) if (id === target.id) sessions.delete(t);
        } else target.status = "active";
        return json(200, { user: pub(target) });
      }
    }
    return err(404, "NOT_FOUND");
  },
});
console.log(`mock api on http://localhost:${PORT}/api/v1`);
