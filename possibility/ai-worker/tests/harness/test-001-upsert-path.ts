// Harness (Tanya, 2026-09-21): drives the BE's OWN upsertUserFromGoogle (SPEC-002 §Flow step 4) with a fake
// verified payload — i.e. everything after Google's signature check — for REQ-002 AC-2/AC-3. Fixture qa-tanya-b (D8b).
// 1st call = first sign-in (expect isNew, tier Ordinary); tier bumped by SQL on my own row; 2nd call with a new
// display name = returning sign-in (expect same id, not new, tier untouched, name refreshed, users count unchanged).
// Run from possibility-back: bun --env-file=.env run <abs path to this file>
import { sql } from "drizzle-orm";
import { db } from "../../../../../../possibility/possibility-back/src/db/client";
import { users } from "../../../../../../possibility/possibility-back/src/db/schema";
import { upsertUserFromGoogle } from "../../../../../../possibility/possibility-back/src/services/auth";
const count = async () => (await db.execute(sql`select count(*)::int n from users`))[0]!.n;
console.log("users before:", await count());
const first = await upsertUserFromGoogle({ sub: "qa-tanya-sub-b", email: "qa-tanya-b@example.com", name: "QA Tanya B" });
console.log("1st sign-in:", { id: first.user.id, isNew: first.isNew, tier: first.user.tier, name: first.user.displayName, email: first.user.email });
console.log("users after 1st:", await count());
await db.update(users).set({ tier: "Seeker" }).where(sql`google_sub = 'qa-tanya-sub-b'`);
const second = await upsertUserFromGoogle({ sub: "qa-tanya-sub-b", email: "qa-tanya-b@example.com", name: "QA Tanya B (renamed)" });
console.log("2nd sign-in:", { id: second.user.id, isNew: second.isNew, tier: second.user.tier, name: second.user.displayName, sameId: second.user.id === first.user.id });
console.log("users after 2nd:", await count());
const noName = await upsertUserFromGoogle({ sub: "qa-tanya-sub-c", email: "qa-tanya-c@example.com", name: null });
console.log("no-name sign-in:", { isNew: noName.isNew, tier: noName.user.tier, name: noName.user.displayName });
console.log("users after 3rd:", await count());
process.exit(0);
