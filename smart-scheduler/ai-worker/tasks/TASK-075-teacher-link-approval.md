# TASK-075: scheduling (BE) — teacher link requests, approval, unlink (+ a 9th attention check)
- Source: SPEC-023 (REQ-020 Stage 2)
- Status: DONE  (reviewed 2026-08-01 by Sober — single-writer property verified independently by grep; journal 16=16; archived-teacher + oracle rules tested; tsc 0 / 316 tests) — 🔴 **MUST SHIP WITH TASK-076** (BE alone means nobody can link at all)
- Depends on: none (TASK-047 Stage 1 is DONE)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
`line-webhook.service.ts:174` is `db.update(teachers).set({ lineUserId })` on a nickname match — **typing a
teacher's nickname grants that teacher's access, immediately, to whoever typed it.** Stage 1 stopped the
collision case binding the wrong person; this removes the assumption underneath it.

## What to do

### 1. Migration — `teacher_link_requests`
`id` · `lineUserId` · `claimedNickname` · `teacherId` (**nullable** — unknown for a collision until staff
decide) · `status` (`PENDING`/`APPROVED`/`REJECTED`) · `createdAt` · `decidedAt` · `decidedBy`.

**Hand-author the SQL and register it in `drizzle/meta/_journal.json` — do NOT run `db:generate`** (TASK-042
rule; the snapshot chain is still incomplete). **One PENDING row per `lineUserId`** — a re-claim updates the
existing row, so a confused teacher retrying three times does not produce three identical rows to work through.

### 2. The webhook change — reuse `decideTeacherMatch`, change what the outcomes do
| outcome | now |
|---|---|
| `none` | unchanged — "not found", no request |
| `one` | **create a PENDING request naming that teacher** (was: bind immediately) |
| `ambiguous` | **create a PENDING request with the nickname and NO teacher** — staff pick who it is |

**The ambiguous case stops being a dead end and becomes the feature.** The reply in all pending cases:
*"your request is with staff; you will be told when it is approved"* — and they stay **unlinked** (no teacher
menu, no schedule pushes) until approved. TH+EN via `line-i18n`.

⚠️ **The bot must not become an oracle:** a request naming a real teacher and one naming nobody must look
**identical** to the person typing. Do not leak nickname existence in the wording.

### 3. Endpoints (authenticated staff)
- `GET /api/teacher-link-requests?status=PENDING`
- `POST /api/teacher-link-requests/:id/approve` — body carries **`teacherId`** (required when the request has
  none, i.e. a collision).
- `POST /api/teacher-link-requests/:id/reject`
- `DELETE /api/teachers/:id/line-link` — **unlink** (`lineUserId = null`). A departed teacher currently keeps
  getting schedule pushes forever with no way to stop it. Reversible: they can claim again.

**Approval is the only code path that writes `teachers.lineUserId`** — so "how did this account get linked?" has
exactly one answer. Move the roster-menu link the same way the current flow does (`moveRosterLink`, TASK-046).

### 4. ⚠️ Safety — this is the point of the task, not the trimming
- **A claim on an already-linked teacher is refused at request time**, exactly as today (`:171`). Do **not**
  let it become a pending request that would silently steal an account on approval.
- **Re-check at approval time.** Between request and decision the teacher may have been linked, archived, or
  had their nickname changed. Approving must **fail cleanly**, never overwrite.
- **Nothing about the parent path changes** — parents stay self-service (คุณฟีน's confirmed decision).
- One LINE account = one role stands (**Q3 answered: "ไม่มี"**). **Do not build role switching.**

### 5. A 9th attention check — `pending_teacher_links`
Count of PENDING requests. Counts-only in the digest (it is a queue, not a person). **One registry entry** —
and per SPEC-018's amendment, one loader if it needs a source nobody has loaded. A queue nobody is told about is
a queue nobody empties, and ~22 requests are about to arrive.

## Definition of Done
- [ ] A nickname claim **no longer links anyone**; it creates a PENDING request. `teachers.lineUserId` is
      written **only** by approve.
- [ ] A collision creates one request with **no** `teacherId`; approving it requires staff to name the teacher.
- [ ] Claiming an **already-linked** teacher is refused at request time (no request created).
- [ ] Approving a request whose teacher became linked/archived meanwhile **fails cleanly and changes nothing**.
- [ ] Re-claiming updates the existing PENDING row — never a second one.
- [ ] Unlink clears `lineUserId`; that teacher stops receiving pushes and can claim again.
- [ ] Parent linking is byte-for-byte unchanged.
- [ ] `pending_teacher_links` appears in the digest and the panel with **no** change to the digest/job/panel.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — pure tests for the request/approve decisions (incl. the two
      race cases above), plus the "already linked → refused" rule.

## Implementation Notes

### 🔐 The single-writer property, stated precisely
**`approveTeacherLinkRequest` is the only code path in the app that sets `teachers.lineUserId` to a non-null
value.** I grep-verified it: the only other writes are `lineUserId: null` (unlink, and the role-move) — clearing
a link grants nothing — plus two `lineLang` updates that *match on* `lineUserId` without writing it.

The line that used to do it, `line-webhook.service.ts:174`, is gone. Typing a nickname now queues a request.

### Migration — `teacher_link_requests` (0015)
Hand-authored, **journal idx 15, no `db:generate`**. ✅ **Journal audit: 16 entries = 16 `.sql` files.**
- `teacher_id` **nullable by design** — on a collision we don't know who the claimant is, and guessing is the
  bug being fixed.
- **One PENDING per `lineUserId` enforced by a partial unique index**, not by remembering to check: a confused
  teacher retrying three times leaves staff one row. Partial, so their historical APPROVED/REJECTED rows stay
  as an audit trail.
- `status` is `text` + a CHECK constraint, matching `job_runs` rather than introducing a new enum type.

### The rules are pure (`lib/teacher-link.ts`), so the dangerous cases are unit-tested
- **`decideClaim`** reuses TASK-047's `decideTeacherMatch` — no second definition of "ambiguous".
- **`already-linked` is refused at request time, never queued.** If it became a pending request, approving it
  would silently move a live teacher account to a stranger — exactly the theft this task prevents.
- ⚠️ **An archived teacher reads as `not-found`**, and archived duplicates are filtered *before* the ambiguity
  count — so a departed namesake can't turn a real single match into a fake collision. Saying "that teacher
  exists but has left" would also leak roster information to an unauthenticated stranger.
- **`decideApproval`** re-validates at decision time and returns a reason instead of overwriting: `not-pending`
  (a double-click can't link twice), `teacher-required`, `teacher-missing`, `teacher-archived`,
  **`teacher-linked`** (someone else won the race — we lose it loudly). Approving a request for a teacher
  already linked to *this* claimant stays idempotent.

### ⚠️ The bot does not become an oracle
`pending` and `pending-ambiguous` share **one reply key**, and that key deliberately **does not echo the
nickname back**. Otherwise the wording tells a stranger whether a nickname exists and how many teachers share
it — which is the same class of leak as TASK-047's children's-names bug. There's a test asserting the two
outcomes map to the identical key.

### Three things the DoD implies that I had to add
1. **The roster move had to follow the grant.** The old flow called `moveRosterLink` on link; approval is now
   where the link happens, so it calls it there. It couldn't just be exported from `line-webhook.service` —
   that module now imports `teacher-link.service`, so importing back would be a **cycle**. Extracted to
   `lib/roster-link.ts`; one definition, both sides reach it. **Behaviour unchanged.**
2. **The teacher rich menu** is linked on approval (it used to be linked on the immediate bind). Best-effort,
   but **logged loudly** on failure — TASK-066's lesson: a silent failure is how a broken step goes unnoticed.
3. **The bot promises "you'll be told once it's approved", so approval sends it** — via the existing outbox,
   in the teacher's own stored language. Not sending would have made the bot's own message a lie. Also
   best-effort: the grant must not roll back because LINE is down.

### Staff queue — one privacy decision
`GET /teacher-link-requests` **drops the raw LINE userId** rather than blanking it (destructured out, so
nothing can re-add it by spreading the row); the screen gets a 6-char `lineUserRef`, which is enough to tell
two rows apart. Each row also carries **`candidates`** — the live teachers sharing that nickname — so the FE
offers the real choice and staff physically cannot approve a collision without naming someone.

### 9th attention check — `pending_teacher_links`
One registry entry + one loader, exactly as SPEC-018's amended claim predicts. Counts-only (a queue, not a
person). **No change to the digest, the job, the panel or the endpoint.** The registry test moves 8 → 9.

### Untouched
**The parent path is byte-for-byte unchanged** — `linkParentLine` / `findOrCreateParentByPhone` /
`moveRosterLink(…, "customer")` all still run exactly as before; parents stay self-service (คุณฟีน's decision).
**No role switching was built** (Q3: "ไม่มี").

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **316 pass / 0 fail** (45 files, was 299 — **+17**).
- ✅ **Journal audit: 16 = 16.**
- New `lib/teacher-link.test.ts` covers the DoD's dangerous cases: a claim **queues rather than links** · a
  collision queues **one row with no teacher** · **already-linked refused at request time** · re-claiming your
  own link is fine · archived → not-found, and an archived duplicate doesn't fake a collision · 🔐 **the two
  pending outcomes share one reply key** · and **both races** — approving when the teacher was linked
  elsewhere, or archived, in the meantime → fails cleanly · double-approval refused · a final sweep asserting
  **every failure path returns `ok:false`**, so none can leak a teacherId it shouldn't link.
- ⚠️ DB behaviour is **deploy smoke** (brownfield). **Smoke:** `bun run db:migrate` (0015) → type a teacher's
  nickname in the bot → reply is *"sent to staff"*, and **`GET /api/teachers` shows that teacher still
  unlinked** and they get **no teacher menu and no pushes** · the request appears in `GET
  /api/teacher-link-requests` and in the attention panel · retype the nickname twice → **still one row** ·
  approve → teacher linked, teacher menu appears, they receive the approval message · approve again → refused ·
  claim a nickname two teachers share → one row with **no** teacher and both as `candidates`; approving
  without `teacherId` → **400** · `DELETE /api/teachers/:id/line-link` → pushes stop, and they can claim again.

**DoD:** a claim links nobody; `teachers.lineUserId` written only by approve (grep-verified) ✓ · collision → one
request with no teacher, approval requires naming ✓ · already-linked refused at request time ✓ · both races fail
cleanly and change nothing ✓ · re-claim updates the existing row (DB-enforced) ✓ · unlink clears the link and is
reversible ✓ · parent linking byte-for-byte unchanged ✓ · `pending_teacher_links` in digest + panel with no
change to digest/job/panel ✓ · tsc clean + tests green with pure tests for the request/approve decisions ✓.

### Two small flags (not fixed — they're yours to rule on)
- **`verify_teacher_ambiguous` is now unused in production** (my change orphaned it); it's still referenced by
  TASK-047's test asserting the key resolves. Four lines of dead string — I left it rather than edit another
  task's reviewed test for no benefit.
- The approval notice goes through the **outbox**, so it only actually sends once the outbox worker is running
  — same dependency as every other push. Worth knowing if the first approvals look silent in testing.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **A pending user stays fully unlinked** — no teacher menu, no pushes. Approval is the only thing that grants.
- If the cleanest implementation would let an approval write `lineUserId` from more than one place, **stop and
  tell me** — single-writer is the property this whole task buys.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0; `bun test` **316 pass / 0 fail**; `drizzle/*.sql` = **16** and
`_journal.json` = **16 tags**. All my own runs.

### 🔐 I verified the single-writer property myself rather than accept the grep
Every write to `teachers.lineUserId` in `src/`:
- `teacher-link.service.ts:132` — **the grant**, and it sits *after* `decideApproval` inside
  `approveTeacherLinkRequest`;
- `teacher-link.service.ts:183` and `lib/roster-link.ts:26` — **`null`** (unlink / role move). Clearing a link
  grants nothing.
- `parent.service.ts:68` is the **parents** table, untouched by this stage.

**That's the whole list.** `line-webhook.service.ts:174` is gone, replaced by a comment naming what used to be
there — which is the right way to leave a removed vulnerability: the next person reading that function learns
why it looks like this.

### The judgement calls, all of which improved on the spec
- **Archived teachers read as `not-found`, and archived duplicates are filtered *before* the ambiguity count.**
  I hadn't specified either. Both matter: a departed namesake would otherwise turn a real single match into a
  fake collision, and "that teacher exists but has left" **leaks roster information to an unauthenticated
  stranger**. He reasoned from the same principle as the oracle rule without being told to.
- **One PENDING per `lineUserId` enforced by a partial unique index** — DB-enforced rather than remembered,
  and partial so historical APPROVED/REJECTED rows survive as an audit trail. I specified the behaviour; he
  made it a property.
- **`decideApproval` returns a reason instead of overwriting**, and he split them by what the clicker should do:
  `teacher-required`/`teacher-missing` → 400, the races → 409. *"Needs more input"* and *"the world moved under
  you"* really are different problems.
- **Dropping the raw LINE userId from the queue response entirely** (destructured out, so nothing can re-add it
  by spreading) with a 6-char ref instead. I asked for a queue; he asked what the screen actually needs. And
  `candidates` on each row means the FE **physically cannot** approve a collision without naming someone.
- **The oracle rule is tested, not just honoured** — both pending outcomes share one reply key, asserted.

### The three additions were correct, and the reason he had to make them is the interesting part
The roster move, the rich menu and the approval notice all had to **follow the grant**, because the grant moved.
That's the shape of this change: everything that used to hang off "the moment of binding" had to move with it.
Extracting `moveRosterLink` to `lib/roster-link.ts` to break the cycle is the right fix — and **sending the
approval notice because the bot promises it** is the detail I'd have missed. *"Not sending would have made the
bot's own message a lie"* is exactly the standard.

### Your two flags — ruled
1. **`verify_teacher_ambiguous` orphaned: leave it.** Four lines of dead string, still referenced by TASK-047's
   reviewed test. Editing another task's test for no behavioural gain is churn. If TASK-072 ever tidies that
   area it can go then.
2. **The approval notice depends on the outbox worker running** — noted, and worth having said. Same dependency
   as every other push, so nothing new; but "the first approvals look silent in testing" is precisely the kind
   of thing that gets misdiagnosed as a bug in *this* feature. It's in the smoke steps now.

**TASK-075 → DONE. @Fern: TASK-076 unblocked** — each queue row carries `candidates`, so the collision case has
everything the screen needs.
⏳ **Deploy:** `bun run db:migrate` (0015) + restart :4006. **Do not deploy this without TASK-076** — the same
completeness rule as TASK-058/059: teachers can no longer link themselves, so shipping the backend alone means
**nobody can link at all** until the approval screen exists. Board updated.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-075 | scheduling (BE): 🔐 **teacher link REQUESTS + approval + unlink** + a 9th attention check | SPEC-023 | ✅ **DONE** (Sober 2026-08-01 — **single-writer property verified by my own grep**: the *only* non-null write to `teachers.lineUserId` in `src/` is the grant inside `approveTeacherLinkRequest`; everything else writes `null`. Beyond spec: **archived teachers read as not-found and archived duplicates are filtered before the ambiguity count** — a departed namesake can't fake a collision, and "exists but has left" would leak roster info to a stranger; one-PENDING-per-account is a **partial unique index**, not a remembered check; the oracle rule is **tested** (both pending outcomes share one reply key). Journal **16=16**, no `db:generate`; tsc 0 / **316 tests**) — 🔴 **MUST SHIP WITH TASK-076** | Jason | — |
```
