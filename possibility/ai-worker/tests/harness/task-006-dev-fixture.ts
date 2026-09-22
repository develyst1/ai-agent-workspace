// Harness (Fern, 2026-09-21): creates ONE dev fixture user (dev-fern-a) on the working DB and prints its
// session cookie. Idempotent (upsert on google_sub, only display_name refreshed). Run from possibility-back:
//   bun --env-file=.env run <abs path to this file>
// Footprint: 1 users row (dev-fern-a@example.com) + whatever ideas/idea_steps TASK-006 submits under it.
import { db } from "../../../../../../possibility/possibility-back/src/db/client";
import { users } from "../../../../../../possibility/possibility-back/src/db/schema";
import { signSession } from "../../../../../../possibility/possibility-back/src/lib/session";
const f = { googleSub: "dev-fern-sub-a", email: "dev-fern-a@example.com", displayName: "Dev Fern A" };
const [u] = await db.insert(users).values(f).onConflictDoUpdate({ target: users.googleSub, set: { displayName: f.displayName } }).returning();
console.log(`${f.email} id=${u!.id} tier=${u!.tier} possibility_session=${await signSession(u!.id)}`);
process.exit(0);
