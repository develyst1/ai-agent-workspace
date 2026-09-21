// Harness (Jason, 2026-09-19): creates two dev fixture users (prefix dev-jason-) on the working DB and prints a
// session cookie for each. Idempotent (upsert on google_sub). Run from possibility-back: bun --env-file=.env run <file>
import { db } from "../../../../../../possibility/possibility-back/src/db/client";
import { users } from "../../../../../../possibility/possibility-back/src/db/schema";
import { signSession } from "../../../../../../possibility/possibility-back/src/lib/session";
const fixtures = [
  { googleSub: "dev-jason-sub-a", email: "dev-jason-a@example.com", displayName: "Dev Jason A" },
  { googleSub: "dev-jason-sub-b", email: "dev-jason-b@example.com", displayName: "Dev Jason B" },
];
for (const f of fixtures) {
  const [u] = await db.insert(users).values(f).onConflictDoUpdate({ target: users.googleSub, set: { displayName: f.displayName } }).returning();
  console.log(`${f.email} id=${u!.id} tier=${u!.tier} COOKIE_${f.googleSub.at(-1)!.toUpperCase()}=possibility_session=${await signSession(u!.id)}`);
}
process.exit(0);
