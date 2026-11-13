// THROWAWAY stand-in for god-plan-back, written by the FE (Fern) from SPEC-002 §API only, to check the FRONT's wiring
// while the real back cannot run (no dev database yet, TASK-001). It proves nothing about the real back.
// In memory, synthetic data only. Routes: A1 A2 A3 P1 P2 P3 T1 T3 T4. Sign-in values come from the environment,
// never from this file:  STUB_OWNER_EMAIL STUB_OWNER_PASSWORD STUB_INVITEE_EMAIL STUB_INVITEE_PASSWORD
//   bun tests/harness/front-contract-stub/server.ts      (listens on 127.0.0.1:4310)
type Status = "todo" | "doing" | "stuck" | "done";
type User = { id: string; email: string; displayName: string; isOwner: boolean; password: string };
type Task = { id: string; projectId: string; title: string; status: Status; stuckReason: string | null; commentCount: number; createdAt: string; updatedAt: string };
type Project = { id: string; name: string; description: string; createdAt: string; members: string[] };

const env = (k: string) => process.env[k] ?? (console.error(`missing ${k}`), process.exit(1));
const users: User[] = [
  { id: "u-owner", email: env("STUB_OWNER_EMAIL"), displayName: "โอ", isOwner: true, password: env("STUB_OWNER_PASSWORD") },
  { id: "u-a", email: env("STUB_INVITEE_EMAIL"), displayName: "พี่เอ", isOwner: false, password: env("STUB_INVITEE_PASSWORD") },
];
const sessions = new Map<string, string>(); // cookie value -> user id
let n = 100;
const now = () => new Date().toISOString();
const mk = (projectId: string, title: string, status: Status, reason: string | null, commentCount: number): Task => ({
  id: `t${n++}`, projectId, title, status, stuckReason: reason, commentCount, createdAt: now(), updatedAt: now(),
});
const projects: Project[] = [
  { id: "p1", name: "ปรับปรุงบ้านแม่", description: "ซ่อมบ้านของแม่ให้อยู่สบายก่อนหน้าฝนปีหน้า", createdAt: now(), members: ["u-a"] },
  { id: "p2", name: "งานเลี้ยงปีใหม่", description: "", createdAt: now(), members: [] },
];
const tasks: Task[] = [
  mk("p1", "ซื้อสีทาบ้าน", "todo", null, 0),
  mk("p1", "ซ่อมหลังคารั่ว", "stuck", "ช่างที่ติดต่อไว้ยังไม่ว่าง รอคิวสัปดาห์หน้า", 3),
  mk("p1", "เปลี่ยนก๊อกน้ำห้องครัว", "doing", null, 1),
  mk("p1", "ขอใบเสนอราคากันสาดหน้าบ้าน", "stuck", "รอร้านส่งแบบกันสาดมาให้เลือก", 2),
  mk("p1", "วัดขนาดประตูห้องนอน", "done", null, 0),
  mk("p2", "จองร้านอาหาร", "todo", null, 0),
];

type Link = { id: string; purpose: "invite" | "reset"; projectId?: string; userId?: string; name: string; used: boolean; cancelled: boolean; expiresAt: string };
const links = new Map<string, Link>();
const comments: { id: string; taskId: string; body: string; createdAt: string; author: { id: string; displayName: string } }[] = [
  { id: "c1", taskId: "t101", body: "ช่างที่พี่เคยจ้างน่าจะว่างก่อน เดี๋ยวพี่ลองถามให้", createdAt: "2026-11-08T02:12:00.000Z", author: { id: "u-a", displayName: "พี่เอ" } },
  { id: "c2", taskId: "t101", body: "ได้ ฝากพี่เอถามช่างด้วยนะ", createdAt: "2026-11-08T07:05:00.000Z", author: { id: "u-owner", displayName: "โอ" } },
];

for (const t of tasks) t.commentCount = comments.filter((c) => c.taskId === t.id).length; // counts follow the comments

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const fail = (status: number, code: string, extra: object = {}) => json(status, { error: { code, ...extra } });
const pub = (u: User) => ({ id: u.id, email: u.email, displayName: u.displayName, isOwner: u.isOwner });
const canSee = (u: User, p: Project) => u.isOwner || p.members.includes(u.id);
const counts = (pid: string) => {
  const c = { todo: 0, doing: 0, stuck: 0, done: 0 };
  for (const t of tasks) if (t.projectId === pid) c[t.status]++;
  return c;
};
const checkLen = (field: string, v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return fail(400, "VALIDATION", { field, rule: "required" });
  if (s.length > max) return fail(400, "VALIDATION", { field, rule: "tooLong", max });
  return s;
};

Bun.serve({
  hostname: "127.0.0.1",
  port: 4310,
  idleTimeout: 30,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const m = req.method;
    const cookie = /gp_session=([^;]+)/.exec(req.headers.get("cookie") ?? "")?.[1];
    const me = cookie ? users.find((u) => u.id === sessions.get(cookie)) : undefined;
    const body: any = ["POST", "PATCH"].includes(m) ? await req.json().catch(() => ({})) : {};

    if (path === "/api/health") return json(200, { ok: true });
    if (path === "/api/auth/sign-in" && m === "POST") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email || !body.password) return fail(400, "VALIDATION", { field: "email", rule: "required" });
      const u = users.find((x) => x.email === email && x.password === body.password);
      if (!u) return fail(401, "INVALID_CREDENTIALS");
      const token = crypto.randomUUID();
      sessions.set(token, u.id);
      return json(200, { user: pub(u) }, { "set-cookie": `gp_session=${token}; HttpOnly; SameSite=Lax; Path=/` });
    }
    if (path === "/api/auth/sign-out" && m === "POST") {
      if (cookie) sessions.delete(cookie);
      return new Response(null, { status: 204, headers: { "set-cookie": "gp_session=; Max-Age=0; Path=/" } });
    }
    // ---- public: invites and resets (I2 I3 R2 R3) ----
    let q: RegExpExecArray | null;
    const startSession = (u: User) => {
      const token = crypto.randomUUID();
      sessions.set(token, u.id);
      return { "set-cookie": `gp_session=${token}; HttpOnly; SameSite=Lax; Path=/` };
    };
    if ((q = /^\/api\/invites\/([^/]+)$/.exec(path)) && m === "GET") {
      const l = links.get(q[1]);
      if (!l || l.purpose !== "invite" || l.used) return fail(410, "LINK_INVALID");
      const p = projects.find((x) => x.id === l.projectId)!;
      return json(200, { projectName: p.name, inviteeName: l.name, expiresAt: l.expiresAt, ownerName: users[0].displayName });
    }
    if ((q = /^\/api\/invites\/([^/]+)\/accept$/.exec(path)) && m === "POST") {
      if (me) return fail(409, "SIGNED_IN"); // checked first, token untouched (AC-18)
      const l = links.get(q[1]);
      if (!l || l.purpose !== "invite" || l.used) return fail(410, "LINK_INVALID");
      const email = String(body.email ?? "").trim().toLowerCase();
      let u = users.find((x) => x.email === email);
      if (u) {
        if (u.password !== body.password) return fail(401, "INVALID_CREDENTIALS");
      } else {
        if (String(body.password ?? "").length < 8) return fail(400, "VALIDATION", { field: "password", rule: "tooShort", min: 8 });
        u = { id: `u${n++}`, email, displayName: String(body.displayName ?? l.name).trim() || l.name, isOwner: false, password: body.password };
        users.push(u);
      }
      l.used = true;
      const p = projects.find((x) => x.id === l.projectId)!;
      if (!p.members.includes(u.id)) p.members.push(u.id);
      return json(200, { user: pub(u), projectId: p.id }, startSession(u));
    }
    if ((q = /^\/api\/resets\/([^/]+)$/.exec(path))) {
      const l = links.get(q[1]);
      if (!l || l.purpose !== "reset" || l.used) return fail(410, "LINK_INVALID");
      const u = users.find((x) => x.id === l.userId)!;
      if (m === "GET") return json(200, { displayName: u.displayName });
      if (m === "POST") {
        if (String(body.password ?? "").length < 8) return fail(400, "VALIDATION", { field: "password", rule: "tooShort", min: 8 });
        u.password = body.password;
        l.used = true;
        for (const [k, v] of sessions) if (v === u.id) sessions.delete(k);
        return new Response(null, { status: 204 });
      }
    }
    if (!me) return fail(401, "UNAUTHENTICATED");
    if (path === "/api/me") return json(200, { user: pub(me) });
    if (path === "/api/projects" && m === "GET")
      return json(200, { projects: projects.filter((p) => canSee(me, p)).reverse().map(({ members, ...p }) => ({ ...p, taskCounts: counts(p.id) })) });
    if (path === "/api/projects" && m === "POST") {
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      const name = checkLen("name", body.name, 100);
      if (name instanceof Response) return name;
      const p: Project = { id: `p${n++}`, name, description: String(body.description ?? "").trim(), createdAt: now(), members: [] };
      projects.push(p);
      const { members, ...pub2 } = p;
      return json(201, { project: pub2 });
    }
    let r: RegExpExecArray | null;
    if ((r = /^\/api\/projects\/([^/]+)$/.exec(path)) && m === "GET") {
      const p = projects.find((x) => x.id === r![1]);
      if (!p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      const { members, ...pp } = p;
      return json(200, { project: pp, tasks: tasks.filter((t) => t.projectId === p.id), viewer: { isOwner: me.isOwner } });
    }
    if ((r = /^\/api\/projects\/([^/]+)\/tasks$/.exec(path)) && m === "POST") {
      const p = projects.find((x) => x.id === r![1]);
      if (!p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      const title = checkLen("title", body.title, 200);
      if (title instanceof Response) return title;
      const t = mk(p.id, title, "todo", null, 0);
      tasks.push(t);
      return json(201, { task: t });
    }
    if ((r = /^\/api\/projects\/([^/]+)\/members$/.exec(path)) && m === "GET") {
      const p = projects.find((x) => x.id === r![1]);
      if (!p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      const pend = [...links.values()].filter((l) => l.purpose === "invite" && l.projectId === p.id && !l.used && !l.cancelled);
      return json(200, {
        members: p.members.map((id) => users.find((u) => u.id === id)!).map((u) => ({ id: u.id, displayName: u.displayName, email: u.email })),
        pendingInvites: pend.map((l) => ({ id: l.id, inviteeName: l.name, expiresAt: l.expiresAt })),
      });
    }
    if ((r = /^\/api\/projects\/([^/]+)\/invites$/.exec(path)) && m === "POST") {
      const p = projects.find((x) => x.id === r![1]);
      if (!p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      const name = checkLen("name", body.name, 100);
      if (name instanceof Response) return name;
      for (const l of links.values()) if (l.purpose === "invite" && l.projectId === p.id && l.name.toLowerCase() === name.toLowerCase() && !l.used) l.cancelled = true, l.used = true; // D8: the old unused link dies
      const token = crypto.randomUUID().replaceAll("-", "");
      links.set(token, { id: `l${n++}`, purpose: "invite", projectId: p.id, name, used: false, cancelled: false, expiresAt: new Date(Date.now() + 7 * 864e5).toISOString() });
      return json(201, { url: `http://localhost:4300/invite/${token}`, expiresAt: links.get(token)!.expiresAt });
    }
    if ((r = /^\/api\/users\/([^/]+)\/reset-links$/.exec(path)) && m === "POST") {
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      const u = users.find((x) => x.id === r![1] && !x.isOwner);
      if (!u) return fail(404, "NOT_FOUND");
      const token = crypto.randomUUID().replaceAll("-", "");
      links.set(token, { id: `l${n++}`, purpose: "reset", userId: u.id, name: u.displayName, used: false, cancelled: false, expiresAt: new Date(Date.now() + 7 * 864e5).toISOString() });
      return json(201, { url: `http://localhost:4300/reset/${token}`, expiresAt: links.get(token)!.expiresAt });
    }
    if ((r = /^\/api\/tasks\/([^/]+)\/comments$/.exec(path))) {
      const t = tasks.find((x) => x.id === r![1]);
      const p = t && projects.find((x) => x.id === t.projectId);
      if (!t || !p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      const list = comments.filter((c) => c.taskId === t.id);
      if (m === "GET") return json(200, { comments: list });
      if (m === "POST") {
        const text = checkLen("body", body.body, 2000);
        if (text instanceof Response) return text;
        const c = { id: `c${n++}`, taskId: t.id, body: text, createdAt: now(), author: { id: me.id, displayName: me.displayName } };
        comments.push(c);
        t.commentCount = comments.filter((x) => x.taskId === t.id).length;
        return json(201, { comment: c });
      }
    }
    if ((r = /^\/api\/tasks\/([^/]+)$/.exec(path))) {
      const t = tasks.find((x) => x.id === r![1]);
      const p = t && projects.find((x) => x.id === t.projectId);
      if (!t || !p || !canSee(me, p)) return fail(404, "NOT_FOUND");
      if (!me.isOwner) return fail(403, "FORBIDDEN");
      if (m === "DELETE") {
        tasks.splice(tasks.indexOf(t), 1);
        return new Response(null, { status: 204 });
      }
      if (m === "PATCH") {
        if (body.title !== undefined) {
          const title = checkLen("title", body.title, 200);
          if (title instanceof Response) return title;
          t.title = title;
        }
        if (body.status !== undefined) {
          if (!["todo", "doing", "stuck", "done"].includes(body.status)) return fail(400, "VALIDATION", { field: "status", rule: "invalid" });
          if (body.status === "stuck") {
            const reason = checkLen("stuckReason", body.stuckReason, 500);
            if (reason instanceof Response) return reason;
            t.stuckReason = reason;
          } else t.stuckReason = null;
          t.status = body.status;
        }
        t.updatedAt = now();
        return json(200, { task: t });
      }
    }
    return fail(404, "NOT_FOUND");
  },
});
console.log("front-contract-stub on 127.0.0.1:4310");
