# TASK-047: LINE (BE) — stop leaking children's names on parent link + never silently resolve a teacher-name collision
- Source: SPEC-015 (REQ-020, Stage 1)
- Status: DONE  (reviewed 2026-07-31 by Sober — retirement + doChildren boundary + bind-nobody ordering verified; tsc 0 / suite 173/0; see ## Review)
- Depends on: none. Small, backend-only, no migration, no UI.
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why (verified in code, not assumed)
Two problems in `services/line-webhook.service.ts` `verifyAndLink` that need **no staff UI** to fix — so they
ship now rather than waiting for REQ-020's approval queue (which needs REQ-019's screens):

1. **PII leak.** Linking as a parent matches on **phone**, binds if that parent has no `lineUserId`, then the
   success reply interpolates `kids.map(k => k.name).join(", ")` (`:172`, i18n key `verify_parent_students`).
   ⇒ **anyone who types a parent's phone number is told that family's children's names.** That's a disclosure to
   an unauthenticated stranger, and it's the most concrete part of REQ-020.
2. **Silent collision.** Teacher matching is `rows.find(tt => tt.nickname.toLowerCase() === nick.toLowerCase())`
   (`:151`) — **first match wins**. With two teachers nicknamed "off" it always binds the first, silently. The
   stakeholder raised exactly this case.

⚠️ **Do NOT change** the unknown-phone → `findOrCreateParentByPhone` path (`:174`). That is **parent
self-registration**, which the stakeholder has confirmed must stay (REQ-020 #2, REQ-019 #5). The junk-record
concern is handled by REQ-019's view/suspend, not by blocking creation.

## What to do
1. **Confirm the parent link without PII.** Replace the children's **names** in the confirmation with a
   **count** — e.g. TH "พบนักเรียน {n} คนในบัญชีนี้" / EN "{n} children on file" (nothing when the count is 0).
   The legitimate parent still gets a meaningful confirmation that they hit the right account; a stranger who
   guessed a phone learns nothing identifying. Retire or repurpose `verify_parent_students` (TH **and** EN) —
   after this, **no student name may appear in any pre-link/at-link reply**.
2. **Refuse a teacher-name collision instead of guessing.** Count the case-insensitive nickname matches:
   - **exactly one** → keep today's behaviour (bind if free, existing "already linked to someone else" message
     unchanged);
   - **more than one** → **bind nobody**; reply (TH+EN, via `line-i18n`) that several teachers share that name
     and staff must complete the pairing. Keep the session in a sane state so the person isn't stuck in a loop.
   - **zero** → unchanged (`verify_teacher_notfound`).
3. Everything else stays: parent self-registration, existing links, TASK-046's move-the-link rule, admin list.

## Definition of Done
- [ ] Linking as a parent by phone **never returns student names** — the confirmation reports a count (or
      nothing when there are none). Grep confirms no student-name interpolation remains in the link replies.
- [ ] Two teachers sharing a nickname ⇒ **neither is linked**, and the claimant gets a clear "staff must
      complete this" message (TH + EN). One match still links exactly as before; zero match unchanged.
- [ ] Parent self-registration on an unknown phone still works (unchanged), existing linked users unaffected.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add pure tests for the match-count decision (0 / 1 / many)
      and for the no-PII confirmation formatting. DB/LINE paths are OA smoke; state the smoke steps.

## Implementation Notes

Both fixes are in `verifyAndLink` (`services/line-webhook.service.ts`); the two security decisions are extracted
into a new pure `lib/line-pairing.ts` so each rule is stated once and unit-tested. No migration, no UI, no
change to parent self-registration.

**1. PII leak — count, never names.**
- `lib/line-i18n.ts`: **retired `verify_parent_students`** (the `{names}` key, TH+EN) and added
  **`verify_parent_children_count`** — TH `"\nพบนักเรียน {n} คนในบัญชีนี้"` / EN `"\n{n} children on file"`.
- `parentChildrenNote(count, lang)` (pure) → the count line, or **`""` when 0** (nothing to confirm).
- `verifyAndLink` now calls `parentChildrenNote(kids.length, lang)` instead of interpolating
  `kids.map(k => k.name).join(", ")`. A legitimate parent still gets confirmation they hit the right account; a
  stranger who guessed a phone learns only a number.

**2. Teacher collision — bind nobody.**
- `decideTeacherMatch(matchCount)` (pure) → `none | one | ambiguous`.
- `verifyAndLink` switched `rows.find(...)` → **`rows.filter(...)`** and branches on the count: **0** →
  `verify_teacher_notfound` (unchanged) · **1** → `matches[0]`, then the existing already-linked-to-someone-else
  check and bind, **exactly as before** · **2+** → **binds nobody** and returns the new
  **`verify_teacher_ambiguous`** (TH+EN): several teachers share that nickname, staff must complete the pairing.
- **Session state is sane, not a loop:** an `ok:false` result keeps the session at `AWAIT_CODE` (the existing
  "keep session for retry" path), so the person can retype a different nickname or restart with `สมัคร` — same
  as the not-found case.

**Untouched, deliberately:** unknown-phone → `findOrCreateParentByPhone` (**parent self-registration stays**,
per REQ-020 #2 / REQ-019 #5) · existing links · TASK-046's move-the-link rule · the admin list · everything
Stage-2 (approval queue, unlink/suspend, collision-resolution UI).

> **Note for the reviewer's grep:** `kids.map(k => k.name)` still appears **once**, at `doChildren` — that is the
> post-link **"my children"** feature (REQ-015), where the parent is resolved from **their own**
> `findParentByLineUserId(lineUserId)`. That is an authenticated parent viewing their own data, **not** a
> pre-link/at-link reply, so it is correctly left alone. The link path no longer touches names at all.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **152 pass / 0 fail** (28 files).
- New `lib/line-pairing.test.ts`: match-count decision **0/1/many** (2 and 5 → `ambiguous`, never "first wins");
  the ambiguous reply resolves in **TH and EN** and echoes only the typed nickname; the count note contains the
  number and **no `{names}`**; 0 children → `""`; and — as the retirement proof — **`t("verify_parent_students")`
  now returns the raw key in both languages, i.e. the name-leaking string is gone.**
- ✅ **Grep check (DoD):** `verify_parent_students` → only a comment + the retirement test (no live use);
  no student-name interpolation remains anywhere in the link replies (the one remaining `kids.map` is
  `doChildren`, explained above).
- ⚠️ DB/LINE paths are **OA smoke** (brownfield). **OA smoke (post-deploy):** (1) link as a parent using a phone
  that has children → the reply says the **count**, no names; a phone with none → no extra line; (2) with two
  teachers nicknamed e.g. "off", type that nickname → **neither is linked** and the staff-pairing message appears
  (TH and EN); retyping a unique nickname then links normally; (3) a unique nickname links exactly as before;
  (4) an unknown phone still self-registers a parent.

**DoD:** parent link never returns names — count only, grep-confirmed ✓ · nickname collision binds nobody +
clear TH/EN message, one/zero match unchanged ✓ · self-registration + existing links unaffected ✓ · tsc clean +
`bun test` green with pure tests for the match-count decision and the no-PII confirmation ✓ · smoke steps stated ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If a **count-only** confirmation looks odd in the real message flow, say so — but do **not** put names back;
  propose an alternative non-identifying confirmation instead.
- The approval queue, unlink/suspend, and the collision *resolution* UI are **Stage 2** (they need REQ-019's
  screens). This task only stops the leak and the silent guess — don't build toward the queue here.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-31).** The leak is closed and the silent guess is gone — both verified in code,
not taken from the report.
- **PII leak closed:** `verify_parent_students` (the `{names}` string) is **retired** — the only remaining
  references are a comment and a test that asserts `t("verify_parent_students")` now returns the **raw key**,
  which is a neat retirement proof. The link reply uses `parentChildrenNote(kids.length, lang)` → a **count**
  (empty at 0). A stranger who guesses a phone now learns a number, not a family's children.
- **The one remaining `kids.map(k => k.name)` is correct to keep — I checked it rather than trusting the note:**
  it's at `:290` inside **`doChildren`**, which resolves the parent from **their own**
  `findParentByLineUserId(lineUserId)`. That's an authenticated parent viewing their own data (REQ-015's "my
  children"), not a pre-link reply. Right call to leave it, and right call to flag it for me.
- **Collision binds nobody:** `rows.find` → **`rows.filter`** + `decideTeacherMatch(count)`; the `ambiguous`
  branch **returns before any `db.update`** (I read the ordering specifically) so no one is linked; `none` and
  the single-match path (incl. the already-linked-to-someone-else check) are unchanged. Session stays at
  `AWAIT_CODE` so the person can retype — not a dead end.
- **Self-registration untouched**, as required: unknown phone still creates a parent (REQ-020 #2 / REQ-019 #5).
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **173/0**, incl. the new `line-pairing` tests
  (0/1/many decision — 2 and 5 both `ambiguous`, never "first wins"; count note carries a number and no names).
- **TASK-047 → DONE = REQ-020 Stage 1 complete.** Needs a `sid` deploy to take effect; Stage 2 (approval queue +
  unlink/suspend) still waits on REQ-019's screens **and** the unanswered dual-role question.
(Sober fills at REVIEW.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-047 | LINE (BE): 🔐 **stop the PII leak** — parent-link confirmation reports a **count, not children's names**; **teacher-nickname collision binds nobody** (was: first match wins) | SPEC-015 | ✅ **DONE** — ⏳ needs `sid` deploy | Jason | — |
```
