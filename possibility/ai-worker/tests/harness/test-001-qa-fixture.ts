// Harness (Tanya, 2026-09-21): ONE QA fixture user (prefix qa-, SPEC-001 D8b) on the working DB + a session cookie
// minted with the BE's own signSession. Idempotent (upsert on google_sub). Stands in for a Google sign-in ONLY for
// the header/guard/sign-out cases — it does NOT exercise POST /auth/google. Run from possibility-back:
//   bun --env-file=.env run <abs path to this file>
import { db } from "../../../../../../possibility/possibility-back/src/db/client";
import { users } from "../../../../../../possibility/possibility-back/src/db/schema";
import { signSession } from "../../../../../../possibility/possibility-back/src/lib/session";
const f = { googleSub: "qa-tanya-sub-a", email: "qa-tanya-a@example.com", displayName: "QA Tanya A" };
const [u] = await db.insert(users).values(f).onConflictDoUpdate({ target: users.googleSub, set: { displayName: f.displayName } }).returning();
console.log(`${f.email} id=${u!.id} tier=${u!.tier} created=${u!.createdAt.toISOString()}`);
console.log(`COOKIE=possibility_session=${await signSession(u!.id)}`);
process.exit(0);
