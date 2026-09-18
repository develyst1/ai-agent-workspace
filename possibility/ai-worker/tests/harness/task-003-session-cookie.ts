// Harness (Jason, 2026-09-19): proves cookie flags + JWT round-trip without a DB.
// Run from possibility-back: DATABASE_URL=... SESSION_SECRET=... (all env vars set) bun run <this file>
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { setSessionCookie, signSession } from "../../../../../../possibility/possibility-back/src/lib/session";
import { env } from "../../../../../../possibility/possibility-back/src/env";
const app = new Hono().get("/", async (c) => { setSessionCookie(c, await signSession("11111111-2222-3333-4444-555555555555")); return c.text("ok"); });
const res = await app.request("/");
const cookie = res.headers.get("set-cookie")!;
console.log("Set-Cookie:", cookie.replace(/=([^;]{20})[^;]*/, "=$1…"));
const jwt = cookie.split(";")[0]!.split("=")[1]!;
const payload = await verify(jwt, env.SESSION_SECRET, "HS256");
console.log("verified payload:", payload, "exp-iat(s)=", Number(payload.exp) - Number(payload.iat));
