# TASK-233: BE — Flow 3 เพิ่มนักเรียน: summary before write, admin told, nothing partial

- Source: SPEC-071 · REQ-079 §5 Flow 3 · **AC-9 · AC-10 · AC-11 · AC-12** · §7(a)/(b)
- Status: ✅ DONE — code (Sober 2026-09-02) · `0031` pending on `sid` with `0030`. Was: REVIEW — both additions done (2FA → `draft`, cap at the name step)

## The flow

name → (duplicate? ask for more detail) → birthdate → province → **summary → confirm** → saved + admin notified.

## 🔴 The three rules that are the actual requirement

1. **The summary-and-confirm step is not optional.** It writes into a roster that **has no delete for anything
   with history** — that is not an oversight, it is the product. Three seconds of review against a record nobody
   can remove.
2. **A duplicate name asks for MORE DETAIL — it never demands a rename** (§7(a)). Two real children can share a
   name. Telling a parent to rename their child is wrong, **and it confirms to whoever typed it that such a child
   exists.** ⇒ *"มีน้องชื่อนี้อยู่แล้ว รบกวนใส่นามสกุลหรือชื่อเล่นเพิ่ม เพื่อไม่ให้สลับกันนะคะ"* — same outcome,
   no false claim, no leak.
   ⚠️ This encodes **@Porter's recommendation, not the owner's literal words** (*"บอกให้ตั้งใหม่"*). If the owner
   overrules it, only this message and AC-9 change.
3. **Abandon halfway ⇒ nothing is written** (AC-12). The row is created at **confirm**, never before — a
   half-registration in a roster with no delete is the expensive kind of mess.

**The admin must be notified** (the customer's own step 5) — reuse `getAdminLineUserIds` /
`app_settings.line_admin_user_ids`; do not invent a second recipient list. **Without it the hand-off depends on
somebody remembering to look.**

🚫 **No auto-scheduling.** The parent registers; **a human puts the child on the calendar.**
🚫 **No money, ever** (AC-20) — the flow modules must not import the sale/discount/movement paths at all. A
grep-guard test, TASK-223's shape: **a rule the build enforces beats one in prose.**
🚫 **No parent-side delete in this task.** §7(b) is a recommendation the owner has not ruled on.

## Definition of Done — the OUTCOME
- [ ] **AC-10:** the summary shows name · birthdate · province and **nothing is written until confirm**.
- [ ] **AC-12:** abandoning at every step leaves **no student row and no partial anything** — test each step.
- [ ] **AC-9:** a duplicate name asks for a surname/nickname; it does **not** demand a rename and does **not**
      reveal whose child the existing one is.
- [ ] **AC-11:** an admin is notified on success.
- [ ] The grep-guard proves no money path is reachable from these modules.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. 🚫 Nothing sent, no DB run.

## Implementation Notes (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `03458a3` |

🔴 **This one carries a migration — `0031`.** Counted at the moment of writing: 31 files (`0000`–`0030`) and 31
journal tags before it. Now **32 = 32, no orphan either way.**

### 🔴 Why a migration, when TASK-232 avoided one
TASK-232 parked the 2FA code in `pending_role` because no migration was open and that branch ships OFF — and I
said then it should become a proper column the next time one was. **Doing it a second time, for a three-field
wizard, is how a column called `pending_role` quietly becomes a blob nobody can reason about.** One documented
compromise is a compromise; two is a pattern. So `0031` adds `line_link_sessions.draft jsonb`.

`jsonb` rather than three columns: the fields belong to one in-flight form, are read and written together, and a
fourth question tomorrow must not be another migration.

### The three rules, and where each is enforced
1. **Summary before write.** `createStudentForParent` appears **only** inside the confirm branch — asserted by
   slicing the function and checking the earlier half does not mention it. That single assertion is most of
   AC-12: if the write existed anywhere earlier, an abandoned conversation would leave a child in a roster
   **with no delete**.
2. **AC-9 — more detail, never a rename.** `decideDuplicate` returns `more-detail`, and the message is a
   **constant with no interpolation** — asserted, because a message that echoed the existing child's name would
   leak exactly what withholding the rename was protecting. The check runs on the name step only; the detail
   step is the *answer* to it, not a second question.
3. **AC-12 — abandon anywhere, nothing exists.** The draft lives on the session, which already expires after 30
   minutes of silence (TASK-231) and is deleted outright when the flow ends. Cancelling at the summary says so
   in words: the one thing a parent must not wonder is whether part of it was saved anyway.

### The birthdate is strict on purpose
`new Date("2026-02-31")` silently becomes **March 3**. A birthdate that quietly becomes the wrong date is worse
than one nobody entered, and there is no delete to correct it with — so the parser round-trips through `Date`
and **refuses** rather than rolling forward. A bad format re-asks.

### AC-11 — the admin is told, through the existing list
Reuses `notifyAdmins`, which writes a **loud SKIPPED row when no admin is configured** (TASK-152's lesson), so a
mis-configured environment is visible rather than silently dropping the hand-off. Asserted to fire **after** the
row exists, and asserted not to build a second recipient list.

📌 **An unrecognised answer at the summary reuses TASK-231's two-strikes rule** — it is an unrecognised in-flow
reply like any other, and giving it a bespoke retry loop would be the second definition that drifts. That is now
the **fourth** call site of one handover rule.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1180 pass / 0 fail (+21)
drizzle/*.sql = 32 = journal tags, no orphan either way
```

### 🚦 `sid` FIRST — the commands for the owner (via @Sober → @Porter)
```bash
bun run db:migrate
bun run db:verify
```
**BLOCKING** — ✅ before any restart. It should report **`0031_line_session_draft` applied**, witnessed by the
`draft` column. ⚠️ `0030` and `0031` are both pending on `sid`; they apply in order in one run.

📌 On the witness: a column probe is normally the weaker kind (the `0022` lesson), and I want the reasoning on
record rather than looking like I forgot it — **that risk is about columns which already existed.** `draft` did
not, so it can only be present because `0031` ran.

🚫 Nothing was run against any database and no message was sent.

## Questions
- 🔴 **I added a migration you did not ask for, and I want that checked rather than assumed.** TASK-233's text
  says nothing about one. I judged that overloading `pending_role` a **second** time — after TASK-232's 2FA code
  — would turn it into a general-purpose blob, which is the drift I have been flagging all week. **If you would
  rather this shipped without `0031`, the fallback is JSON in `pending_role` and it is ~10 lines** — but then
  `0030` and the 2FA overload and this would all be riding one text column, and I do not think that survives
  the next person.

- ⚠️ **`province` is a HOUSEHOLD field, not a per-student one.** `parents.province` exists; `students` has no
  province column. So confirming writes the province **to the parent**, which means a second child registered
  later **overwrites the household's province** with whatever is typed then. That is arguably correct (one
  family, one address) and it is what the existing schema says — but §5's flow reads as though it belongs to
  the child, so **I want the reading confirmed rather than assumed.** If it should be per-student it is a
  column, and that is a different task.

- **The flow asks name → birthdate → province, in that order, and only `name` is mandatory.** Birthdate and
  province both accept `ข้าม`. The REQ lists the fields but does not say which are required; I made the two
  demographic ones optional because **a registration that cannot be completed without a birthdate is a
  registration a parent abandons**, and AC-12 then guarantees we get nothing at all. Easy to tighten if the
  owner wants them mandatory.

- **`MAX_STUDENTS_PER_PARENT` is checked by `createStudentForParent` at CONFIRM, not at the name step.** So a
  parent at the cap walks the whole wizard and is refused at the end. That is a worse experience than refusing
  up front, and I left it because moving the check earlier would duplicate a rule that already lives in one
  place — the thing I keep arguing against. **Say the word and I will call the same function's precondition at
  the name step instead of copying its rule.**

- 🟢 **TASK-240** (`coursePackages` course search) and 🟠 **TASK-243** (the admin unbind control, from my own
  TASK-232 finding) are both still open and both still mine. **TASK-234 is next** unless @Porter re-orders.


---

## The two additions you asked for at review (Jason, 2026-09-02)

tsc **0** · `bun test` **1186 pass / 0 fail** (+6) · no new migration — `0031` is unchanged and still unrun.

### 1. The 2FA code moved out of `pending_role` into `draft`
Done **while `0031` is still unrun**, which is exactly the window you named. `setTwoFaChallenge` now writes
`draft: { twoFaCode }`, and the read goes through a single accessor (`twoFaCodeOf`) so `draft`'s shape has one
reader rather than a `session.draft?.x` scattered around.

📌 **`pending_role` now means only what its name says** — the linking role — and a test asserts nothing reads a
2FA code out of it any more. Your condition on TASK-232 was *"a proper column the next time a migration is open
anyway"*; the cost today was one function and one accessor, and skipping it would have made the overload
permanent by habit.

### 2. The cap is asked at the NAME step — by extracting the precondition, not copying it
New `assertCanAddStudent(parentId)` in `parent.service.ts`. **`createStudentForParent` now calls it too**, so
there is one definition of "how many is too many" and one message; a test asserts the rule
(`>= MAX_STUDENTS_PER_PARENT`) appears **exactly once** in that file.

Two details worth naming:
- **It returns the count it already computed**, so `createStudentForParent` does not run a second
  `listStudentsOfParent` for the number it returns. Extracting a check should not cost a query.
- 🔴 **The write still enforces it.** The early call is a *courtesy check in front of* the real one, not a
  replacement — a race or a future second entry point must still be refused at the write. Asserted, because
  "we check it earlier now" is exactly how a guard quietly becomes the only guard.

A parent at the cap is now refused **before the first question**, and the session is cleared so they are not
left inside a flow they cannot finish.

### 📌 The comment-vs-code trap, fourth time
Both AC-10 assertions failed on my own prose — the flow *explains* why `createStudentForParent` sits where it
does, and an unstripped `toContain` measured the explanation. The helper is now hoisted with a note saying so.
It is the same shape as TASK-223, TASK-236, and `Math.random` in TASK-232: **these files deliberately discuss
the symbols the tests assert on, so structural claims have to strip comments.** I keep re-learning it one file
at a time, so it is written where the next person will hit it.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS. The migration you did not have permission for is the right call.**

**Reproduced:** `tsc --noEmit` → **0** · `line-add-student.test.ts` → **20 pass / 0 fail** ·
`drizzle/*.sql` = **32** = journal tags, newest `0031_line_session_draft` · `decideDuplicate` at
`line-add-student.ts:79`.

### ✅ Q1 — `0031`. **Approved, and the reasoning is better than my task's silence on it.**

> *"One documented compromise is a compromise; two is a pattern."*

**That is the correct test and it is the one I would have applied.** I told you on TASK-232 that `pending_role`
becomes a proper column *"the next time a migration is open anyway"* — you noticed the second overload would
arrive **before** that day and would make it permanent by habit. **A column called `pending_role` holding a 2FA
code and a three-field wizard is a blob with a misleading name**, and the next reader inherits it with no way to
know what is in it.

`jsonb` over three columns is right too: one in-flight form, read and written together, **and a fourth question
tomorrow must not be another migration.** ✅ And your witness reasoning is correct and worth having written down:
the `0022` risk is about probing columns that **already existed** — `draft` did not, so its presence can only
mean `0031` ran.

🔴 **One thing follows that you should do now, because the migration is open and unrun:** **move TASK-232's 2FA
code out of `pending_role` and into `draft`.** That was my stated condition, this is the moment it named, and
doing it while `0031` is still pending costs nothing. **Leave it and the compromise becomes permanent for the
reason you just argued.**

### The three rules, and how you proved them

📌 **Asserting `createStudentForParent` appears ONLY inside the confirm branch — by slicing the function and
checking the earlier half never mentions it** — is most of AC-12 in one assertion. **If the write existed anywhere
earlier, an abandoned conversation leaves a child in a roster with no delete.** That is a structural proof rather
than a behavioural sample, which is the right shape for a rule about *absence*.

📌 **AC-9: the message is a constant with no interpolation, asserted.** A message that echoed the existing child's
name would leak **exactly what withholding the rename was protecting** — the same PII reasoning as
`parentChildrenNote`, applied to a sentence rather than a list. I did not name that risk in the task; you did.

📌 **The strict birthdate.** `new Date("2026-02-31")` silently becoming March 3, into a roster with **no delete**,
is precisely the class of wrong this system cannot correct. Round-tripping through `Date` and refusing is right.

📌 **Two-strikes reused at the summary rather than a bespoke retry** — the **fourth** call site of one handover
rule, and each time you have chosen the existing one. That is why it is still one rule.

### Your other three questions

> **Q2 — `province` is a HOUSEHOLD field; a second child overwrites it.** ✅ Right to stop. The schema says
> household (`parents.province`, REQ-019 / TASK-048 put it there deliberately), and §5's flow reads as though it
> belongs to the child. **Going to @Porter.** **My lean, and the interim I want in the code:** keep it on the
> parent, but **do not silently overwrite a non-empty household province** — write it when empty, otherwise leave
> what is there. That loses nothing, cannot corrupt an address a staff member entered, and is reversible either
> way the owner rules. 🚫 Do not add a "which is right?" question to the parent — that is a UX decision nobody has
> made.

> **Q3 — only `name` mandatory; birthdate and province accept `ข้าม`.** ✅ **Keep it**, and your reason is the
> right one: *a registration that cannot be completed without a birthdate is a registration a parent abandons*,
> and AC-12 then guarantees we get **nothing at all**. ⚠️ But the customer's own ask (§3) names all three fields,
> so this is a deviation and @Porter should carry it — **we still ASK for all three; we just do not lose the
> child over one.** Flagged, not hidden.

> **Q4 — `MAX_STUDENTS_PER_PARENT` refused at confirm, after the whole wizard.** 🔴 **Fix it, and you already
> named the fix that is not duplication:** call the **same function's precondition** at the name step rather than
> copying its rule. One definition, checked earlier. Walking a parent through three questions to refuse them at
> the end is the kind of thing that reads as the system being broken.

### Not proven by you, correctly
Nothing run against a database, no message sent. 🚦 `0030` **and** `0031` are both pending on `sid` and apply in
order in one run — that goes to @Porter with the commands.

**Status → DONE (code), with the two small additions above (2FA → `draft`; the cap checked at the name step).**
🟢 TASK-240 and 🟠 TASK-243 both still yours.

## Review #2 — Sober, 2026-09-02: ✅ **PASS. TASK-233 is DONE.**

**Reproduced:** `tsc --noEmit` → **0** · `line-add-student` + `line-phone-entry` → **20 pass / 0 fail** ·
`twoFaCodeOf` at `line-webhook.service.ts:223` reading `draft` · `assertCanAddStudent` at
`parent.service.ts:92`, called by the name step (`:386`) **and** by `createStudentForParent` (`:118`) ·
`>= MAX_STUDENTS_PER_PARENT` appears **exactly once** (`:94`). `0031` unchanged and still unrun.

📌 **The extraction is the right shape, and the line that makes it right is yours:** *"the early call is a
courtesy check in front of the real one"*, asserted — because **"we check it earlier now" is exactly how a guard
quietly becomes the only guard.** The write still enforces it, and the test pins that rather than trusting it.

📌 **Returning the count it already computed** so the write does not re-query for the number it reports —
extracting a check should not cost a query. Small, and the kind of thing that is never fixed later.

📌 **`pending_role` now means only what its name says**, with a test asserting nothing reads a 2FA code out of
it. That closes the compromise inside the window it was named for, which is the whole reason I asked for it now
rather than "next time".

### 📌 The comment-vs-code trap, fourth occurrence — and the fix is now shared

TASK-223 · TASK-236 · TASK-232 · here. **Four times in one week, and every time it was prose being asserted
instead of code.** Hoisting the stripping helper with a note **so the next person meets the lesson instead of
the failure** is the right response — it stops being folklore the moment it is a shared helper with a reason
attached. 🔴 **Anyone writing a source-assertion test in this repo uses that helper.** Recorded here because it
is now a repo-wide convention rather than one task’s workaround.

**Status → DONE.** 🟢 TASK-240 and 🟠 TASK-243 still yours.
