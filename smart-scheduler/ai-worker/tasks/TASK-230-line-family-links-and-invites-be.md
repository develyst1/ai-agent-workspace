# TASK-230: BE — the migration: `family_line_links`, `family_invites`, and two session columns

- Source: SPEC-071 + its **2026-09-02 amendment** (REQ-079 §15/§16). 🔴 **Read the amendment, not the body above it.**
- Status: ✅ DONE — code (Sober 2026-09-02) · 🔴 `0030` awaits the `sid` run → @Porter
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## What to do

⚠️ **Count `drizzle/*.sql` against the journal at the moment you write it** (board rule). Today both are 30.
Hand-authored + journal-registered per `drizzle/README.md`; do **not** run `db:generate`.

```sql
CREATE TABLE "family_line_links" (
  "parent_id"    uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "line_user_id" text NOT NULL,
  "linked_at"    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("parent_id", "line_user_id")
);
CREATE UNIQUE INDEX "family_line_links_user_uq" ON "family_line_links" ("line_user_id");

CREATE TABLE "family_invites" (
  "code"       text PRIMARY KEY,
  "parent_id"  uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "used_at"    timestamptz,
  "used_by"    text
);

ALTER TABLE "line_link_sessions" ADD COLUMN "muted_until"      timestamptz;
ALTER TABLE "line_link_sessions" ADD COLUMN "unexpected_count" integer NOT NULL DEFAULT 0;
```

🔴 **`family_line_links_user_uq` is the load-bearing line.** One LINE account belongs to **one** family. Without
it, a second family's invite silently re-points an account and that parent sees **another family's children** —
TASK-047's failure by a different route. It extends the *"one LINE user ⇒ one active roster link"* rule
`moveRosterLink` already enforces for teacher/parent.

**`parents.line_user_id` STAYS and remains the first link** — additive, exactly like `booking_teachers` in
TASK-224, so every existing reader, index and flow is untouched.
🔴 **One accessor** answers *"which family is this chat?"* — `[row.lineUserId, ...links]`, and nothing outside it
reads either source. Two readers is how the two disagree (TASK-228's lesson, and it cost a test rewrite).

⚠️ **`unexpected_count` is the TWO-STRIKES counter (AC-18), not the code lockout.** The lockout died with the
family code (§15); this one lives. It **resets on success and expires with the session** — a counter that only
increments hands someone a locked chat in June for a typo in March.

⚠️ **Witness the migration on a NEW object** — `family_invites` or the unique index. `ADD COLUMN` on an existing
table is witnessable, but pick the object that exists **only** after this ran (the `0022` lesson).

## Definition of Done
- [ ] Both tables + both columns exist; the unique index refuses a second family for one `line_user_id`.
- [ ] The accessor returns primary-first, and `grep` shows no second reader of either source.
- [ ] Nothing existing changes — `parents.line_user_id` and every current LINE path are untouched (diff it).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green (report the count).
- [ ] 🔴 **Run and verify on `sid` FIRST** — `db:migrate` → **`db:verify` ✅ before any restart** — and **state in
      this file how it was proven there.** 🚫 You do not run it; give @Sober → @Porter the exact commands.

## Implementation Notes (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `03458a3` |

### 🔴 The migration is `0030` — and I got the number wrong first, then caught it by counting
The task said *"today both are 30"*, and I wrote **`0031`**. **30 files means `0000`–`0029`, so the next is
`0030`.** I caught it by listing the directory instead of trusting my own arithmetic, and renamed the file and
the journal entry before anything else was built on it.

📌 **This is exactly what the board's counting rule is for**, and the interesting part is that a plausible
number is the dangerous kind of wrong: `0031` would have left a permanent hole at `0030` that nothing later
could fill, and `db:migrate` would have applied it perfectly happily. **Counted again after the fix:
`drizzle/*.sql` = 31, journal tags = 31, no orphan in either direction.**

### What changed

| File | Change |
|---|---|
| `drizzle/0030_family_line_links.sql` **(new)** | both tables · the unique index · both `line_link_sessions` columns |
| `drizzle/meta/_journal.json` | idx 30 registered (hand-authored; no `db:generate`) |
| `src/db/schema.ts` | `familyLineLinks` · `familyInvites` · `mutedUntil` · `unexpectedCount` |
| `src/lib/family-link.ts` **(new)** | the ONE accessor |
| `src/lib/migration-witness.ts` | witness for `0030` |
| `src/db/family-line-links.test.ts` **(new)** | 15 tests |

### The load-bearing line, and why it is an index and not a check
`family_line_links_user_uq`. **The app decides who may join a family; the database decides they may only join
once.** An application check would be defeated by two invites redeemed in the same moment — and the cost of
losing that race is a parent opening the app and seeing **another family's children**. That is TASK-047's PII
failure reached by a different route, so it is a constraint, asserted in both the migration and `schema.ts`
because those are the pair that drifts.

### The two counters — and the reason I wrote the distinction three times
`unexpected_count` (**two-strikes, AC-18**) exists; `code_attempts` / `code_locked_until` (**the code lockout**)
do not. You flagged that they were nearly deleted together on one sentence, so the distinction is now in the
migration, in `schema.ts`, **and in a test that fails if either dead column reappears**. A comment can be read
past; a test cannot.

⚠️ That test strips comments before asserting — the schema deliberately *names* the dead columns while
explaining which one died, and that explanation is the thing preventing the mistake recurring. **Only
declarations are evidence.** (The same comment-vs-code trap that caught me twice on TASK-223/236; third time I
saw it coming.)

### The ONE accessor
`lib/family-link.ts` — `familyLineUserIds(parentId)` (primary-first, **deduped**) and
`familyOfLineUser(lineUserId)` (fixed lookup order, so the answer never depends on which query ran).

The dedupe is not tidiness: a parent whose own `line_user_id` was also written into `family_line_links` — an
invite redeemed by the account already on the row — would otherwise be **pushed to twice**, and a duplicate
push is how a notification channel gets muted. That is the one-message-per-person rule `groupReminders` already
holds, applied at the source instead of at every caller.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1111 pass / 0 fail (+15)
drizzle/*.sql = 31 = journal tags, no orphan either way
```

### 🚦 `sid` FIRST — the exact commands for the owner (via @Sober → @Porter)
```bash
bun run db:migrate
bun run db:verify
```
`db:verify` is **BLOCKING** — ✅ before any restart — and should report **`0030_family_line_links` applied**,
witnessed by **`family_line_links_user_uq`**. Then `pm2 restart`. **`uat` only after `sid` is green.**

⚠️ **If `db:verify` comes back RED, read it before acting** — that is what happened with `0029`, and the answer
was `db:seed-ledger` (dry run → read → `--apply`), not a schema problem. The board's rule 2 sequence.

### 🚫 Not run by me
Nothing was executed against any database. Every statement is `IF NOT EXISTS`, and a test asserts that guard
count matches the create count, so a re-run is safe by construction rather than by carefulness.

## Questions
- **`family_invites.code` is the PRIMARY KEY, and I built it exactly as your SQL specified — but the code
  GENERATOR is not in this task, and its properties are now load-bearing in a way §15 changed.** With the
  family code gone, an invite is **the only way anyone ever joins a family**, so the invite code is the entire
  authentication surface for that door. Two things follow that I have deliberately not decided:
  1. **Collision.** `code` being the PK means a generator that ever repeats an unexpired code will throw a
     `23505` at redemption time — safe, but it needs the generating task to handle it rather than 500.
  2. **Guessability.** A short code is convenient to read down a phone; a short code is also guessable, and
     guessing one gets you into a family. The owner accepted a weak-code risk **for the family code** with his
     own reasoning — 🔴 **that acceptance was about a different mechanism and I am not carrying it across.**
  ⇒ **Whoever writes TASK-232 needs a stated code shape (length, alphabet, TTL) and a stated rate-limit
  position.** Not blocking `0030`; it should not be decided by whoever types the generator.

- **`used_at` / `used_by` are stored but nothing enforces single-use yet** — that is TASK-232's redemption path,
  and I did not add a partial unique index or a check, because "one use" is a rule about a transition, not about
  a row. Naming it so the absence reads as deferred rather than forgotten.

- **The accessor is currently the only reader**, which is the point — but it also means it is **untested against
  real rows** until TASK-231/232 use it. Its two properties that would hurt if wrong are the **dedupe** (a
  double push) and the **primary-first order** (an existing caller silently getting a different "first"
  account). Both are pinned by source tests today; the first live exercise is 232.

- 🟢 **TASK-240** (`coursePackages` course search) is still mine and still after-the-release. Untouched.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS.** And your question is the right one to have asked before writing the generator.

**Reproduced:** `tsc --noEmit` → **0** · `family-line-links.test.ts` → **15 pass / 0 fail** ·
`drizzle/*.sql` = **31** = journal tags, newest `0030_family_line_links` · the accessor at
`lib/family-link.ts:26,50`.

📌 **Catching `0031` by listing the directory instead of trusting the arithmetic is the whole point of the
counting rule, and you found the sharper half of it:** *a plausible number is the dangerous kind of wrong.*
`0031` would have left a permanent hole at `0030` that nothing later could fill, and **`db:migrate` would have
applied it perfectly happily** — a silent, unrecoverable gap. My task text said *"both are 30"* and you read past
my phrasing to the actual files. Correct.

📌 **"The app decides who may join a family; the database decides they may only join once."** That is the right
division and the right reason — an application check loses the race between two invites redeemed in the same
moment, and **the cost of losing it is a parent seeing another family's children.** Index, not check. Asserted in
both the migration and `schema.ts` **because those are the pair that drifts** — exactly so.

📌 **The two-counter distinction pinned by a test that strips comments** — and you saw the trap coming this time.
The schema deliberately *names* the dead columns while explaining which one died, so a naive grep would find them
and "confirm" they exist. **Only declarations are evidence.** Third encounter with that trap (TASK-223, TASK-236,
here) and the first one where it did not cost you a cycle.

📌 **The dedupe is not tidiness and you said why:** a parent whose own `line_user_id` also lands in
`family_line_links` gets pushed **twice**, and a duplicate push is how a person mutes the channel. Fixing it at
the source rather than at every caller is the same call as `groupReminders`.

---

## ✅ Your question — the invite code's shape. **DECIDED, and you were right not to carry the owner's acceptance across.**

**That refusal is the most important line in your notes.** The owner accepted a weak **family code** with his own
reasoning — *"ลูกค้ายังไม่มากขนาดนั้นที่จะโดน hack"* — about a secret **the parent chose and could change**, on a
mechanism that no longer exists. **An invite is a different thing: it is now the ONLY authentication surface for
joining a family**, and an acceptance does not transfer across a mechanism change. Do not let anyone re-use it.

**The decision, and the constraint that drives it: there is NO rate limiter anywhere in this codebase**
(SPEC-050 §Decisions, still true). ⇒ **the code must be strong enough that not having one does not matter.**

| | Decision |
|---|---|
| **Alphabet** | Crockford-style base32 — digits + uppercase letters **minus `I`, `L`, `O`, `U`**. Unambiguous read aloud and unambiguous typed. |
| **Length** | **8 characters** ⇒ ~32⁸ ≈ **1.1 × 10¹²**. A million blind guesses is ~1-in-a-million against a *single* live invite. **No rate limiter needed to make that safe** — which is the point, because we do not have one. |
| **TTL** | **30 minutes.** The admin is in the chat *right now*; a door that outlives the conversation is a door nobody is watching. |
| **Case** | Accept any case, store/compare upper. A parent retyping from a chat bubble should not fail on case. |
| **Single use** | 🔴 **A conditional UPDATE, not a check:** `UPDATE family_invites SET used_at=now(), used_by=$user WHERE code=$c AND used_at IS NULL AND expires_at > now() RETURNING parent_id`. **Zero rows returned = refused.** Atomic, so two simultaneous redemptions cannot both win — and it answers your *"one use is a rule about a transition, not about a row"* exactly: it **is** a transition, so make the transition the guard. |
| **Collision** | Generate → insert → on `23505` **retry up to 3 times**, then fail loudly. At 10¹² it will never fire; a `500` at issue time would be an absurd way to discover that. |
| **Logging** | 🚫 **Never log the code.** `line-log.ts` already hashes user ids for this reason; an invite in a log line is a credential in a log line. |

⇒ **Written into TASK-232**, so the generator is not decided by whoever happens to type it. **Not blocking
`0030`** — you were right that it is 232's, and right to raise it before 232 was written rather than after.

> **`used_at` / `used_by` stored with nothing enforcing single-use yet** — ✅ correct to defer, and the conditional
> UPDATE above is the enforcement. **No partial index needed.**

> **The accessor is untested against real rows until 231/232 use it** — ✅ noted, and you named the two properties
> that would hurt (the dedupe → a double push; primary-first → an existing caller silently getting a different
> "first"). Both are pinned at source; 232 is the first live exercise, and I will look at them there.

🟢 **TASK-240** — still yours, still after the release. It is in my ball line, not in anyone's memory.

**Status → DONE (code). 🔴 `0030` still needs the `sid` run** — commands are in your notes and go to @Porter now.
