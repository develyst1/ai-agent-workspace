# TASK-046: LINE (BE) — an already-linked user can never finish `สมัคร` (branch order) + stale link on role change
- Source: SPEC-012 (REQ-015 defect, found by the stakeholder during LINE acceptance)
- Status: DONE  (reviewed 2026-07-30 by Sober — reorder + all 3 link-move sites verified, admin call confirmed, tsc 0 / suite 145/0; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## The defect (Sober verified in code — confirmed, not assumed)
Repro (stakeholder): type `สมัคร` → choose **2 (teacher)** → the bot replies with **parent** options; the role
change can never complete.

**Cause — branch order in `services/line-webhook.service.ts` `handleMessage`:**
1. `สมัคร` correctly does `setStep(CHOOSE_ROLE)` and prompts (this part works from any state).
2. The **"Already-linked routing"** block (`detectLinkedRole` → `if (linked === "customer") return
   handleParentCommand(...)`) sits **BEFORE** the **"Linking conversation"** block that handles
   `session.step === "CHOOSE_ROLE"` / `AWAIT_CODE`.
3. So the user's next message (`2`) is swallowed by `handleParentCommand("2")` → parent menu. ⇒ **the
   `CHOOSE_ROLE` / `AWAIT_CODE` branches are unreachable for anyone already linked.**

Pre-existing (predates REQ-015); it only surfaced now that people actually use the bot.

**Note the file already contains the correct pattern:** `AWAIT_STUDENT_NAME` is handled **above** the
already-linked routing precisely so an in-progress conversation isn't swallowed. This fix makes the linking
conversation follow that same rule.

**Second-order issue found while verifying — fix it in the same task:** `verifyAndLink` only refuses when the
*target* record belongs to a **different** LINE user; it does **not** clear the user's **previous** link. So
once (1) is fixed, a parent who re-links as a teacher ends up **linked as both**, and `detectLinkedRole` checks
**teacher before parent** ⇒ their parent surface silently disappears. A role *change* must **move** the link,
not accumulate one.

## What to do
1. **Reorder:** handle the **linking conversation** (`session.step === "CHOOSE_ROLE"`, then `AWAIT_CODE`)
   **before** the already-linked routing block — same placement rationale as the existing `AWAIT_STUDENT_NAME`
   branch. Do not change what those branches *do*; only when they get a chance to run.
   - Keep everything else intact: `สมัคร` still restarts from any state; a linked user with **no** active linking
     session still routes to their normal parent/teacher/admin handling.
2. **Move the link, don't duplicate it:** when `verifyAndLink` successfully links this `lineUserId` to a new
   role/record, **clear this same `lineUserId` from the other role's rows** (parent ↔ teacher; leave the admin
   list to your judgement — say what you chose). Net effect: one LINE user ⇒ one active role link.
   - Keep it inside the existing transaction/flow if there is one; don't invent new tables or a migration.
3. **Do not** add an unlink/logout/change-role *command* — that's a product decision Porter is writing up as its
   own REQ (dual-role people, who may unbind what). Out of scope here.

## Definition of Done
- [ ] An **already-linked** user can type `สมัคร`, pick a role, enter the code/nickname/phone, and **complete**
      the link — the reported repro passes.
- [ ] After a successful role change the user is linked to **exactly one** role (the previous link is cleared) —
      no dual-linked rows, so `detectLinkedRole` can't silently hide a surface.
- [ ] Unaffected: a linked user with no active linking session still gets normal routing; `สมัคร` still restarts
      from any state; `AWAIT_STUDENT_NAME` still works; rich-menu/postback flows unchanged.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add tests for the routing decision (linked + in-CHOOSE_ROLE
      → linking branch wins; linked + no session → normal routing) and for the link-move. If the ordering logic
      isn't easily testable in place, factor the decision into a small pure helper rather than leaving it untested.

## Implementation Notes

Your diagnosis matched the code exactly. Both parts fixed in `services/line-webhook.service.ts`; the two
decisions that were *implicit* are now pure helpers in the new `lib/line-routing.ts`, so the ordering itself is
unit-tested (the reorder is otherwise invisible to tests).

**1. Reorder — conversation beats already-linked routing.** New pure
`decideMessageRoute(sessionStep, linkedRole)` → `add-student | linking | linked | welcome`, encoding the rule the
file already applied to `AWAIT_STUDENT_NAME`: an in-progress multi-turn conversation wins; only with no
conversation does the existing link decide. `handleMessage` now reads the session **and** the link, asks the
helper, and the already-linked block is gated behind `route === "linked"`. **Branch bodies are unchanged** —
only when they get a chance to run. `สมัคร` still restarts from any state (it's still handled above everything);
`AWAIT_STUDENT_NAME` still wins; the `CHOOSE_ROLE` / `AWAIT_CODE` bodies (incl. the `AWAIT_CODE`-without-
`pendingRole` fall-through to welcome) are byte-identical. Cost: `detectLinkedRole` now also runs during a
linking conversation (3 indexed queries) — negligible, and it's the same count as before on the linked path.

**2. Move the link, don't duplicate.** New `moveRosterLink(lineUserId, newRole)` called at the **three** roster
link-success points in `verifyAndLink` (teacher link; parent link to an existing phone; parent created for a new
phone): linking as **teacher** clears `parents.line_user_id` for that LINE user, linking as **customer** clears
`teachers.line_user_id`. Net: one LINE user ⇒ one active roster link, so `detectLinkedRole` (teacher before
parent) can't silently hide the other surface. No new table, no migration, no unlink/logout *command* (out of
scope, per the task). The post-link seed-lang/rich-menu code is unaffected — after the move only the new role's
row matches.

> **⚠️ Judgement call to confirm — the admin list (you asked me to say what I chose):** I **left
> `app_settings.line_admin_user_ids` untouched.** Reasoning: it's a *notification subscription*, not a roster
> identity, and `detectLinkedRole` checks admin **last** — so an admin entry can never shadow a parent/teacher
> surface, i.e. it cannot cause the bug this task fixes. Clearing it would silently unsubscribe someone from
> leave alerts because they registered a child, and it can't be restored without the admin code. So a
> parent/teacher link now moves cleanly, while an admin who also links as a parent keeps receiving admin
> notifications and gets the parent surface. **Say the word if you'd rather admin be exclusive too — it's a
> two-line change**, but it felt like the more destructive default so I didn't take it unasked.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **145 pass / 0 fail** (27 files).
- New `lib/line-routing.test.ts` — **the reported repro is a test**: `decideMessageRoute("CHOOSE_ROLE",
  "customer") === "linking"` (before the fix, `linked` won and swallowed the "2"), same for `AWAIT_CODE` and for
  an already-linked teacher/admin; plus *linked + no session → `linked`* (normal routing unaffected),
  `AWAIT_STUDENT_NAME` still wins, unlinked+no session → `welcome`, and `otherRosterTable` mapping
  (teacher→clears parents, customer→clears teachers).
- ⚠️ The DB writes + LINE delivery are **OA smoke** (brownfield — no DB/OA here). **OA smoke (post-deploy):**
  (1) as an **already-linked parent**: type `สมัคร` → `2` → the bot asks for the **teacher nickname** (was: parent
  menu) → enter it → link completes; (2) then check `detectLinkedRole` behaviour — the teacher surface works and
  the old parent link is gone (one role only); (3) unaffected paths: a linked parent with no session still gets
  the parent menu on `เมนู`, `เพิ่มนักเรียน` multi-turn still works, rich-menu/postback flows unchanged.
- The human's DB workaround (manually clearing `line_user_id`) is no longer needed — and I built nothing to
  automate it, per your note.

**DoD:** already-linked user can complete `สมัคร` (repro covered by a test) ✓ · exactly one role link after a
change ✓ (parent↔teacher; admin subscription deliberately kept — flagged above) · normal routing / `สมัคร`
restart / `AWAIT_STUDENT_NAME` / postback flows unaffected ✓ · tsc clean + `bun test` green with the ordering
factored into a tested pure helper ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If the reorder turns out to break another flow you can see (e.g. some branch relies on running before the
  linking conversation), **stop and tell me** — I'd rather re-scope than have you paper over it with an extra
  condition.
- Workaround currently in use (human clears `line_user_id` in the DB) becomes unnecessary once this lands; don't
  build anything to automate that here.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-30).** Both halves correct, and the flagged judgement call is the right one.
- **Reorder verified:** `decideMessageRoute(sessionStep, linkedRole)` encodes exactly the rule the file already
  applied to `AWAIT_STUDENT_NAME` — an in-progress conversation (`AWAIT_STUDENT_NAME`, then
  `CHOOSE_ROLE`/`AWAIT_CODE`) wins; only with no conversation does the existing link decide. `handleMessage`
  gates the already-linked block behind `route === "linked"`, and the **branch bodies are unchanged** — only
  *when* they run. Extracting it into a pure helper was the right move: the reorder is otherwise invisible to
  tests, and **the reported repro is now literally a test case** (`decideMessageRoute("CHOOSE_ROLE","customer")
  === "linking"`).
- **Link-move verified:** `moveRosterLink` is called at **all three** success points (teacher; parent with an
  existing phone; parent newly created) — I checked each. Net: one LINE user ⇒ one active roster link, so
  `detectLinkedRole` can't silently hide the other surface. No new table, no migration, no unlink *command*
  (correctly left out of scope).
- **✅ Admin judgement call — CONFIRMED, keep it as you built it.** I verified the load-bearing fact rather than
  taking it on trust: `detectLinkedRole` checks **teacher → customer → admin**, so an admin entry genuinely
  **cannot shadow** a parent/teacher surface and therefore cannot cause the bug this task fixes. Your framing is
  right — `line_admin_user_ids` is a **notification subscription, not a roster identity**. Clearing it would
  silently unsubscribe someone from leave alerts because they registered a child, and it can't be restored
  without the admin code. **Choosing the less-destructive default and asking instead of assuming was correct.**
  An admin who also links as a parent keeping both is the behaviour we want, not a leak.
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **145/0** (up from 139 — new `line-routing`
  tests incl. the repro, normal-routing-unaffected, and the `otherRosterTable` mapping).
- **DB writes + LINE delivery are OA smoke** (brownfield) — accepted; the smoke steps are written down.
- **TASK-046 → DONE.** REQ-015 is already DELIVERED, so this is a **post-delivery fix**: it needs a deploy to
  `sid` and a quick re-check of the repro (already-linked parent → `สมัคร` → `2` → asks for the teacher
  nickname), not a fresh acceptance round.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-046 | LINE (BE): 🐛 already-linked user can't finish `สมัคร` — **reorder** the linking conversation above already-linked routing + **move** (not duplicate) the link on role change | SPEC-012 | ✅ **DONE** (Sober-verified; admin-list call confirmed) — ⏳ needs a `sid` deploy + repro re-check | Jason | — |
```
