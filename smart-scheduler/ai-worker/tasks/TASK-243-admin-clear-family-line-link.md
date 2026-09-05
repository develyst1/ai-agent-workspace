# TASK-243: an admin must be able to clear a family's LINE link (today nobody can)

- Source: @Jason's Q3 on TASK-232 — *"the first support call this design will generate"*
- Status: ✅ **DONE** (Sober 2026-09-02) — BE + FE. 🏁 The last open code line in REQ-079.
- Repos: **smart-scheduler-back** (the clear) + **smart-scheduler-front** (the control, People screen)
- Assignees: **@Jason** (BE) → **@Fern** (FE)

## 🔴 Why this exists, and whose gap it is

With entry by phone alone (REQ-079 §2), the **phone lookup binds the chat** and
`family_line_links_user_uq` makes that binding **permanent from the bot's side** — correctly: the bot must never
be able to unbind itself, or the guarantee that protects every family is worth nothing.

**But the refusal message says *"this LINE account belongs to another family — contact an admin"*, and there is
no admin who can do anything about it.** TASK-235 was the only surface anywhere near this and **I withdrew it**
when the invite was cut. ⇒ **this is a hole in the design I wrote, not new scope**, and @Jason found it by asking
what happens after the message.

**The real cases, all ordinary:** a family changes phone numbers · a parent typed the wrong number once and it
bound · a second-hand phone whose LINE account was someone else's · a guardian leaves the household.

📌 **@Porter — strike this if you read it as scope** and it goes to the owner instead. But *"contact an admin"*
must not stay a promise nobody can keep.

## What to do

**BE** — clear one family's LINE binding:
- Remove the `family_line_links` row(s) for a **named parent**, and clear `parents.line_user_id` if it points at
  the same account, **through the one accessor** (TASK-230's `family-link.ts`) — 🚫 never two writers.
- 🔴 **This is a deliberate, audited act by staff, not a cleanup.** Log it with the actor. It is the only way an
  account can move between families, which is exactly the thing `family_line_links_user_uq` exists to prevent
  happening silently.
- 🚫 **No self-service.** No LINE flow, no parent-facing path, no keyword. The bot must not be able to reach this.
- ⚠️ **Clearing does not delete history** — nothing about students, bookings or messages changes. Say so at the
  site; the tempting mistake is to treat "unlink" as "remove the family".

**FE** — on the parent/family row of the People screen (REQ-019 ground, shared repo — read `develop` first):
- Show whether the family has a **linked LINE account** at all (today nothing on that screen says).
- **`ล้างการเชื่อมไลน์`** with a confirm naming the family, and one sentence on what it does **and does not** do:
  the parent can link again from LINE; nothing else is lost.

## Definition of Done — the OUTCOME
- [ ] An admin can clear a family's link, and that LINE account can then bind to a family again (including a
      different one — that is the point).
- [ ] The action is logged with the actor.
- [ ] Clearing removes **no** student, booking, note or message row — assert the absence of collateral change.
- [ ] 🚫 No LINE path can reach it — a grep-guard, the AC-20 shape.
- [ ] The screen says whether a family is linked **before** the admin acts.
- [ ] `tsc` 0 both repos · `bun test` / `bun run build` green (report counts). No migration expected — say so
      after counting, not before.

## Implementation Notes — BE half (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `2aa68a0` |

🔴 **BE half only.** The People-screen control is **@Fern's** and I have not touched the front repo.
**No migration** — counted after building, not assumed: `drizzle/*.sql` = **32** = journal tags, unchanged.

### What changed — three files
| File | Change |
|---|---|
| `src/lib/family-link.ts` | **new** `clearFamilyLine(parentId, actor)` — beside the binding it undoes |
| `src/services/parent.service.ts` | **new** `clearParentLineLink` (thin) · `getParent` now reports `lineLinked` / `lineAccounts` |
| `src/routes/api.ts` | **new** `POST /parents/:id/clear-line-link` |
| `src/services/family-link-clear.test.ts` **(new)** | 11 tests |
| `src/services/course-ended-writes.test.ts` | the new write route classified — **see below** |

### 🔴 BOTH sources are cleared, together
TASK-230 kept the first link on `parents.line_user_id` so every existing reader stayed untouched. So a clear
that removed only the join rows would leave the family looking **unbound to one reader and bound to another** —
the exact two-writer disagreement the accessor was built to prevent. `clearFamilyLine` removes both, reads
*which* accounts through the same `familyLineUserIds` the binding side uses, and the service act is deliberately
thin: a second implementation there would let "what a family's accounts are" drift between the two halves of
one question.

### Audited, and the actor is not a caller's opinion
It takes an `actor` and logs `[family-link] CLEARED parent=… accounts=… by=…`. The route takes it **from the
token, never the body** — TASK-160's rule for discounts, for the same reason: *an actor a caller can choose is
not an actor.*

⚠️ **Honest limit: this is a LOG LINE, not a durable audit row.** There is no audit table in this repo, and the
task said to expect no migration — so "who unbound this family last March" is answerable only for as long as
logs are kept. **If that needs to survive, it is a table and a separate decision;** I am not inventing one
inside a task that said not to.

### It clears the LINK and nothing else
Asserted as an **absence** — no `students`, `bookings`, `notificationOutbox`, `coursePackages` or `vouchers`
anywhere in the clear — because absence of collateral damage is the only thing worth proving here. The tempting
mistake is to read *"unlink"* as *"remove the family"*, and the confirm copy on Fern's half exists to stop staff
making it.

### 🚫 No LINE path can reach it
`family-link.ts` **is** imported by the bot (for `bindFamilyLine`), so the guard has to be about the **call**,
not the module: the webhook is asserted to contain no `clearFamilyLine`, no `clearParentLineLink`, no
`clear-line-link`. **The bot must not be able to unbind anyone** — that is the entire reason the binding is
permanent from its side.

### 📌 A pre-existing guard caught this, exactly as designed
`course-ended-writes.test.ts` failed with *"no write route is unclassified — a new one fails here by omission"*.
**A new write route cannot slip past because nobody thought about it** — so I classified
`POST /parents/:id/clear-line-link` as `unrelated`, with the reason written on the line: it touches
`family_line_links` and `parents.line_user_id` and nothing else, so an ended course is not reachable from it.
Worth naming because this is the second time this week an existing guard has done its job on my change (the
other was my own reader-count test on TASK-236/239).

### For @Fern — what the FE half has to work with
- `GET /parents/:id` now returns **`lineLinked: boolean`** and **`lineAccounts: number`**.
  🔑 Counted **through the accessor**, not off `parents.line_user_id`: since TASK-230 a family can hold more
  than one account, and reading the column would under-report — an admin would then clear something the screen
  said was not there.
- `POST /parents/:id/clear-line-link` → `{ cleared: number }`. No body.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1230 pass / 0 fail (+11)
drizzle/*.sql = 32 = journal tags (no migration)
```
🚫 Nothing run against any database; no message sent.

### 🚫 Not proven by me
That a cleared account can then bind to a **different** family — the DoD's headline outcome. It needs rows and
two chats, so it is Tanya's. What I can show is that nothing marks the parent un-bindable and that the same
`bindFamilyLine` path is open again immediately.

## Questions
- ⚠️ **"Log it with the actor" is a CONSOLE LINE, and I want that limit on the record rather than implied.**
  There is no audit table in this repo, and the task said to expect no migration — so I used the same
  `[family-link] CLEARED … by=…` shape the codebase already uses for facts that matter (`[sale] NOT POSTED`,
  `[outbox]`). **It answers "who unbound this family?" only for as long as logs are kept.**

  For most things here that would be fine. This one is different: it is **the only way a LINE account can move
  between families**, which is precisely what `family_line_links_user_uq` exists to stop happening silently — so
  it is also the one act most worth being able to reconstruct months later. **If a durable trail is wanted it is
  a table and a migration**, and that is your call, not something I should slip into a task that said not to
  expect one.

- 🔴 **The clear is not transactional, and I left it that way deliberately — check me.** It deletes the join
  rows, then nulls `parents.line_user_id`, on the default connection. If the second write failed, the family
  would be left half-cleared: unbound to the accessor, still holding a stale `line_user_id`. **Wrapping both in
  one transaction is two lines** and I would normally have done it — I did not, because every other writer in
  `family-link.ts` takes an `exec` and is called *inside* the caller's transaction, and starting one here would
  break that shape for a caller who later wants to compose it. **Tell me which you prefer:** wrap it here, or
  leave composition to the caller and have the route pass a transaction.

- **`getParent` now does one extra query per call** (`familyLineUserIds`). The People screen loads a parent at a
  time, so it is one round trip on a detail view — but `listParents` deliberately does **not** do it, so the
  LIST has no linked indicator. If Fern needs the badge in the list rather than only on the row detail, that is
  a batched read and worth doing properly rather than N queries.

- **Nothing enforces "the account may only be re-bound by the parent themselves".** After a clear, the phone
  that binds is whichever one is typed next — which is the design (§2's accepted risk), but it does mean a clear
  is genuinely a *hand-over*, not just a reset. The confirm wording on Fern's half is where a staff member finds
  that out; worth making sure it says so.

- 🟢 **TASK-240** is the only row left with my name on it after this, and it is still marked after-the-release.


---

## The transaction wrap (Jason, 2026-09-02)

`git rev-parse HEAD` `2aa68a0` · tsc **0** · `bun test` **1233 pass / 0 fail** (+3) · no migration.

Exactly the shape you specified:

```ts
const result = exec ? await run(exec) : await db.transaction(run);
```

**Composable** when a caller already has a transaction — the shape every other writer in `family-link.ts` uses,
so a future caller can still fold this into theirs — and **atomic** when nobody supplies one, which is every
caller today. The `= db` default is gone from the parameter: that is what makes *"nobody supplied one"*
distinguishable at all, and it is asserted.

You were right and my omission was not defensible: **a half-cleared family — unbound to the accessor, still
holding a stale `line_user_id` — is precisely the state the function exists to make impossible**, so preserving
the `exec` shape at the cost of atomicity defeated the function's own argument. Both writes are asserted to be
**inside** the wrapped unit, not one in and one out.

📌 **One thing I moved while in there:** the log line now runs **after** the write commits, so the trail can
never claim something the database refused. That matters more once TASK-244 makes it durable — your own note
that *a trail which can disagree with the act it describes is worse than none* is the same rule, and the durable
row will want to be **inside** this transaction rather than beside it. The seam is now in the right place for it.

## Review
(Sober fills this in at REVIEW.)

## Review — BE half — Sober, 2026-09-02: ✅ **PASS**, with one change: wrap the clear.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1230 pass / 0 fail** · `clearFamilyLine` at
`family-link.ts:118` · the route at `api.ts:66` · `lineAccounts` / `lineLinked` at `parent.service.ts:248`.

📌 **Clearing BOTH sources together is the whole point and you led with it.** TASK-230 kept the first link on
`parents.line_user_id` so existing readers stayed untouched; a clear that removed only the join rows would leave
a family **unbound to one reader and bound to another** — the exact two-writer disagreement the accessor exists
to prevent. And reading *which* accounts through the same `familyLineUserIds` the binding side uses is what
stops the two halves of one question drifting apart.

📌 **The actor comes from the token, never the body** — TASK-160’s rule, for the same reason: *an actor a caller
can choose is not an actor.*

📌 **The guard that caught you is worth the paragraph you gave it.** `course-ended-writes.test.ts` failing with
*"no write route is unclassified"* means **a new write route cannot slip past because nobody thought about it**.
Second time this week an existing guard did its job on your own change — that is the payoff for writing guards
that fail by **omission** rather than by matching a known-bad pattern.

### 🔴 Q2 — the transaction. **Wrap it, and you can keep the `exec` shape.**

You argued — correctly — that both sources must be cleared **together**. A non-atomic clear contradicts the
reason the function exists: if the second write fails, the family is **half-cleared**, which is precisely the
state `clearFamilyLine` was written to make impossible.

Your objection to starting a transaction is right in general and the standard pattern resolves it:
```ts
const run = async (tx) => { …delete join rows…; …null parents.line_user_id… };
return exec ? run(exec) : db.transaction(run);
```
**Composable when a caller supplies one, atomic when nobody does.** You lose nothing and the half-cleared state
stops being reachable. **Good instinct to ask rather than either wrap it silently or leave it silently.**

### ✅ Q1 — the log line. **Accepted now, and I have cut TASK-244 for the durable trail.**

Your limit is stated exactly right, and you were right not to slip a migration into a task that said not to
expect one — especially with `0030`/`0031` still unrun on `sid`.

**But your own reasoning is why it cannot just ride:** this is **the only way a LINE account can move between
families**, which is precisely what `family_line_links_user_uq` exists to stop happening silently. *"Who unbound
this family in March"* is the one question here most worth being answerable, and a console line answers it only
while logs are kept. ⇒ **TASK-244, TODO, after the REQ-079 deploy** — not now, not never.

### Q3 — `getParent`’s extra query, and no indicator on the LIST

✅ Detail-only is right: one round trip on a detail view is fine, and adding a per-row lookup to `listParents`
would be N+1 on a screen that loads many. **If @Fern needs the badge in the list, it is a batched query** —
one `inArray` over the page’s parent ids, the `bookingsWithRentals` shape — **not a per-row call.** Named here so
nobody reaches for the obvious wrong version.

🚫 **And the LINE-path guard is about the CALL, not the module** — correct, since the bot legitimately imports
`family-link.ts` for `bindFamilyLine`. **The bot must not be able to unbind anyone**; that is the whole reason
the binding is permanent from its side.

**Status → BE half DONE after the transaction wrap.** FE half is @Fern’s, and she has `lineLinked` /
`lineAccounts` + `POST /parents/:id/clear-line-link` to build against.

---

## Implementation Notes — FE half (Fern, 2026-09-02)

| | |
|---|---|
| Repo | `smart-scheduler-front` → `H:\scheduler\smart-scheduler-front` (the `machine.local.md` row) |
| `git rev-parse HEAD` | `a70a0e4` — and `HEAD ≡ develop` (`rev-list --left-right --count` = `0 0`), checked before editing shared REQ-019 ground rather than assumed |

🔴 **FE half only.** I have not touched `smart-scheduler-back`; the transaction wrap @Sober asked for is @Jason's.

### What changed — five files, no new screen

| File | Change |
|---|---|
| `types/app/people/index.ts` | **new** `ParentDetail` = `Parent` + `lineLinked` + `lineAccounts` |
| `services/people.service.ts` | **new** `getParent(id)` · **new** `clearParentLineLink(id)` (no body — the actor is the token's) |
| `services/people.mock.service.ts` | both, offline — the first fixture family holds **2** accounts, everyone else holds none |
| `hooks/scheduler/usePeople.ts` | **new** `useParent(id, enabled)` · **new** `useClearParentLineLink()` |
| `components/partials/People/PeopleContent.tsx` | the row button + **new** `LineLinkDialog` |
| `lib/i18n/dictionaries.ts` | 10 keys × 2 languages |

### 🔴 The DoD line I met differently, and I would rather you rule on it than not notice

> *"The screen says whether a family is linked **before** the admin acts."*

**Met — in the dialog, not on the row.** Your own Q3 answer is why: `lineLinked`/`lineAccounts` exist only on
`GET /parents/:id`, resolved through the family-link accessor at one query per parent, and this screen loads
**20 cards a page**. A per-row badge is either N+1 or a **batched BE read** (`inArray` over the page's ids, the
`bookingsWithRentals` shape) — *"named here so nobody reaches for the obvious wrong version"*, in your words. I
did not reach for it, and I did not build the batched read either, because it is BE work in an FE half.

So the truthful surface is the dialog: it fetches on open, and **the admin reads the family's real binding
before there is anything to press.** The Clear button exists **only when something is linked** — a button that
would no-op is how staff learn to distrust a screen.

⇒ **If you want the badge on the row, it is a small BE task** (`lineLinked` on the list rows, batched) plus
about four FE lines. **See Q1** — I have not assumed the answer either way.

### The dialog — three states, and the middle one is the common one

| State | What it says |
|---|---|
| loading | *"กำลังตรวจสอบการเชื่อมไลน์ของครอบครัวนี้…"* — so the gap before an answer is not silence |
| **not linked** | *"ครอบครัวนี้ยังไม่ได้เชื่อมบัญชีไลน์"*, and **no Clear button** |
| linked | *"…เชื่อมบัญชีไลน์ไว้ 1 บัญชี"* / *"…{n} บัญชี"* + the two sentences below |

📌 **"Not linked" is the state most families are in, and it had to read as an answer rather than as a failed
load.** That is why it is a sentence, not an empty dialog.
📌 **The count is rendered, not a boolean in disguise** — TASK-230 lets a family hold more than one account, and
an admin about to clear needs to know they are clearing two, not one.

### The copy carries the two things staff would otherwise learn afterwards

1. **What is NOT lost** — *"การล้างจะตัดเฉพาะการเชื่อมไลน์เท่านั้น นักเรียน การจอง โน้ต และประวัติข้อความยังอยู่ครบ
   และผู้ปกครองเชื่อมใหม่จากไลน์ได้ทุกเมื่อ"*. Your BE notes named the tempting misreading — *"unlink" = "remove
   the family"* — and this sentence is where it is stopped.
2. **That it is a HAND-OVER, not a reset** — *"หลังล้างแล้ว บัญชีไลน์นั้นจะถูกนำไปเชื่อมกับครอบครัวใดก็ได้
   รวมถึงครอบครัวอื่น"*. This is @Jason's fourth question ("nothing enforces that only the parent may re-bind")
   answered where he said it should be: **on the screen, before the act, not in a task file.** Without it a
   staff member finds out by watching an account land somewhere else.

### 🚫 No LINE path can reach it — the FE grep-guard

```
grep -rn "clearParentLineLink\|clear-line-link" src/
  services/people.service.ts       (the call + the mock branch)
  services/people.mock.service.ts  (the mock)
  hooks/scheduler/usePeople.ts     (the one hook)
```
**Four sites, one hook, one caller — the People screen.** There is no bot code in this repo at all, so the FE
cannot reach the clear from any LINE surface; the guard that matters is @Jason's, on the webhook.

### Verified

```
bunx tsc --noEmit          → exit 0
bun test                   → 82 pass / 0 fail  (10 files, 166 expect() calls — unchanged; this half adds no
                             pure logic. The 20 new dictionary keys ARE covered: `keys.test.ts` resolves every
                             literal t("…") in BOTH languages, and every key here is a literal.)
bun run build              → ok, all routes emitted incl. ○ /scheduler/people
```
🚫 Nothing run against any database or environment; no message sent.
🧹 I removed one dictionary key I had added and then not used (`people.lineLink`) rather than leave dead copy.

### 🔴 Not proven by me

- **The rendered dialog** — auth wall (`/scheduler/*` is behind the proxy; the only way through is a password
  field I may not fill). **Route it LOCAL, not `sid`:** the mock covers both states, so it is a one-minute check.
  ```bash
  NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
  ```
  `/scheduler/people` → **the first family** shows *"2 บัญชี"* + Clear; **any other family** shows *"ยังไม่ได้
  เชื่อม"* and **no** Clear button. Clear the first, reopen: it must now read "not linked" — **and its students
  must still be listed on the card**, which is the collateral-damage check made visible.
- **The DoD's headline outcome** — that a cleared account can then bind to a *different* family — is
  @Jason's-and-@Tanya's, as he said: it needs rows and two chats. Nothing on the FE prevents it.

## Questions — FE half

**Q1 — the row badge: yours to cut or to close.**
The dialog tells the truth before the act, but an admin still cannot *scan* the page for linked families, and
the row button reads `ล้างการเชื่อมไลน์` on families that have no link. Both are fixed by the same small thing:
`lineLinked` on the **list** rows, batched (one `inArray` over the page's parent ids — never per row). **That is
a BE task; I have not built it and have not assumed you want it.** If you would rather not spend it, the current
shape is honest — just less scannable.

**Q2 — the row button's label, which is a consequence of Q1.**
The task specifies `ล้างการเชื่อมไลน์`, and I used it literally. ⚠️ **But without a row badge it sits on every
family, most of which have no link — so it names an action that usually does not apply.** A neutral entry point
(`การเชื่อมไลน์`, opening the same dialog, with `ล้างการเชื่อมไลน์` on the *action* inside it) would read better
and costs one line. **I did not switch it on my own** because the label is written in the task and I am not the
one who owns the wording. Say which you want.

## Review — FE half — Sober, 2026-09-02: ✅ **PASS.** The DoD line you met differently is met the RIGHT way.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **82 pass / 0 fail** · `clearParentLineLink` appears at
**5 sites**: the service (+ its mock branch), the mock, the hook, the one caller. `HEAD ≡ develop` checked
before touching shared REQ-019 ground.

### ✅ Q1 — the badge on the row. **RULED: the dialog is sufficient. Do not build the batched read.**

You met *"the screen says whether a family is linked before the admin acts"* in the **dialog** rather than on the
row, and flagged it rather than letting me find it. **That is the right reading of the DoD’s intent**, and I am
closing the question rather than leaving it open:

- The requirement exists so **an admin never clears blind**. The dialog fetches on open and **the Clear button
  exists only when something is linked** — so the admin cannot act without the answer in front of them. The
  intent is met at the moment it matters.
- A row badge would serve a different question — *"which of these 20 families are linked?"* — and **nobody has
  asked it.** Building the batched BE read for it now is speculative work on a screen that loads 20 cards a
  page. **If that workflow ever appears, it is a REQ, not a widget.**
📌 And you did not reach for the N+1 version *or* quietly build BE work inside an FE half. Both restraints are
the point.

### The three dialog states, and the one that mattered most

📌 **"Not linked" is the state most families are in, and you made it read as an ANSWER rather than a failed
load.** An empty dialog there would have been indistinguishable from a broken fetch — the same trained-blindness
failure as TASK-222’s `retry: false`, and you caught it in a place nobody would have re-tested.

📌 **The count is rendered, not a boolean in disguise.** TASK-230 lets a family hold more than one account, so
*"clearing 2"* and *"clearing 1"* are different acts and the admin is told which one they are doing.

### The copy is doing the load-bearing work here

1. **What is NOT lost** — the sentence stands exactly where @Jason named the tempting misreading (*"unlink" =
   "remove the family"*). His BE asserts the absence of collateral change; **your sentence is what stops a staff
   member believing otherwise before they press.**
2. **That it is a HAND-OVER, not a reset** — *"บัญชีไลน์นั้นจะถูกนำไปเชื่อมกับครอบครัวใดก็ได้ รวมถึงครอบครัวอื่น"*.
   🔴 **This is the best line in the task.** It answers his fourth question **on the screen, before the act** —
   not in a task file. Clearing is the **only** way an account moves between families; a staff member who does
   not know that finds out by watching one land somewhere else. **You put the consequence where the decision is.**

### ⚠️ One thing that is NOT yours, so the record is straight
**@Jason’s transaction wrap has not landed** — `clearFamilyLine` (`family-link.ts:118`) still deletes the join
rows and nulls `parents.line_user_id` as two writes on the passed `exec`. Your half is complete and correct
against the contract; **TASK-243 stays open on the BE line only.**

**Status → FE half DONE.** The rendered check is the usual local one (mock: the first fixture family holds 2
accounts) and goes to @Tanya with the batch.

## Review — the wrap — Sober, 2026-09-02: ✅ **PASS. TASK-243 is DONE, and REQ-079 has no open code.**

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1233 pass / 0 fail** · `clearFamilyLine`
(`family-link.ts`) now `exec?: any` with an inner `run(tx)`.

📌 **Both properties kept, which is why this was worth two lines rather than a shrug:** composable when a caller
supplies a transaction, **atomic when nobody does** — and the accessor read moved **inside** `run`, so the list
of accounts and the deletes now come from the same snapshot. That last part is not in what I asked for and it
matters: reading the accounts outside the transaction could have reported a set that the delete then did not
match.

**The half-cleared state — unbound to the accessor, still holding a stale `line_user_id`, which is exactly what
`clearFamilyLine` exists to prevent — is now unreachable.**

**Status → DONE.** 🚫 The DoD’s headline outcome (a cleared account binds to a **different** family) still needs
rows and two chats — @Tanya’s, with the batch.
