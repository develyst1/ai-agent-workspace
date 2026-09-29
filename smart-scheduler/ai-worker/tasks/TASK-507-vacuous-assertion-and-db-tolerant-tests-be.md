# TASK-507 — a test that can never fail, and two that pass whether or not the database answers — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration. All three named by you at the end of TASK-504 and correctly left alone there.

## §0 The three
1. 🔴 **`rbac-stage2` asserts `not.toBe(401 + 1000)` — it can never fail.** No status is 1401. **The test looks like a permission check and asserts nothing.**
2. `eligible.route`'s control, and 3. `webhook-ack-first` — both **touch the database and pass either way**. Their claims hold, so they are not wrong; they are the three failed queries still logged on every unreachable run.

## §1 Why the first one matters more than its size
**A test that cannot fail is worse than no test**, and the reason is not pedantry: **it occupies the place where the real check would go.** Nobody writes a second RBAC test for a rule that already has one with a green tick beside it. 📌 **We have spent this whole round on assertions that were weaker than they looked** — a dead spy, a pin depending on a defect to pass, a mutation runner reading the wrong line. **This is the purest specimen: an assertion that is decoration by construction.**
⚠️ **And I want to know how it got there.** `401 + 1000` is not a typo anyone makes twice — **say what it was probably meant to be** (a guard against a 401 in one case and something else in another?), from the test's own name and neighbours. **If the intended assertion is not recoverable, say that** and we write the check the rule deserves from scratch.

## §2 Build
- **Replace the vacuous assertion with the check the test's NAME claims it makes.** 🔑 **Prove it is no longer vacuous the way we prove everything else: a mutation that breaks the rule must make it fail.** A test I cannot break is one I have to take on trust, and that is what we are removing.
- **The two DB-tolerant tests:** make them not need a database — the same boundary-fake shape as TASK-504 — **or**, if a test is genuinely about what the database returns, say so and leave it. 📌 **After this, an unreachable run should log zero failed queries**, which is a cleaner statement than "green": *nothing even tried.*
- 🚫 **No weakening, nothing deleted.** If replacing the vacuous assertion turns up a real defect in the rule it was supposed to guard, **stop and tell me** — that is a finding, not a fix to fold in.
- 📌 **Then sweep for siblings.** 🔑 **An assertion that cannot fail will not announce itself**, so look for the shapes: `not.toBe` against a value the expression cannot produce · `expect(x).toBeDefined()` on something constructed in the test · a `toEqual` against a variable the code under test also wrote. **Report what you find; fix only what is plainly the same defect, and name the rest.**

## Definition of Done
- [ ] The vacuous assertion replaced by the check its name claims, **proven by a mutation that breaks the rule** · how it got there explained, or "not recoverable" said plainly · the two DB-tolerant tests freed of the database or **named as genuinely about it** · an unreachable run logging **zero failed queries**, stated · a sweep for sibling shapes, **reported** with only the plain cases fixed · any real defect uncovered **stopped and reported, not folded in** · suite **count** normally **and unreachable** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): the vacuous check is replaced and **proven to bite**; the suite now logs **ZERO failed queries** with the database unreachable (3285 / 0) and normally (3285 / 0) · tsc 0 · 59 = 59 · **no real defect found**

## §1 `rbac-stage2`: the check its name claims
- **Replaced** `expect(login.status).not.toBe(401 + 1000)` with what the line's own comment said it proved: *"a 401 from `authenticate`, never the guard's"*.
  - `toBe(401)`, **and the body carries `authenticate`'s sentence**, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", **not** the guard's "ต้องเข้าสู่ระบบก่อน".
  - Also `asked = ["x"]`: the request really reached `authenticate`, which looked the user up.
  - The one read on that path (`users` by username) is declared: no such user. **This removes one of the three failed queries.**
- **Break-and-watch** (database unreachable, CHECKSUM identical before and after, every restore byte-identical):
  - **A.** Login moved **behind** the `/api/*` auth guard, so it is no longer public: **the new test BITES** (23/1).
  - **A0 (control).** The same break against the **old** line: **PASSED**. That confirms, by running it, that the old line guarded nothing.
  - **B.** `authenticate` reworded to the guard's sentence, status unchanged: **BITES**. The sentence is what tells the two refusals apart.
- **How it got there:** born in **`5e27000`** (2026-09-18, the RBAC menu-permissions commit), not edited since.
  - **Both refusals are `401 UNAUTHORIZED`, so a STATUS alone can never tell "reached the handler" from "stopped by the guard".**
  - The author knew that (the comment states it) and had no status to write. `401 + 1000` reads as a **placeholder that was meant to become the sentence check and never did**. That is my reading, not recoverable from the history.
  - It passed on 401 (database answers) and on 500 (database refused) alike.

## §2 The two DB-tolerant tests: now DB-free (their claims were sound, and no test was about what the DB returns)
- **`routes/eligible.route`'s control**
  - **What touched the DB:** `searchStudents` first reads the suspended households (`students ⋈ parents`). Refused, the route answered 500, which is still "not 400".
  - **Fix:** a narrow spy at the handler's one call, answering an empty result. The existing `not.toBe(400)` is kept.
  - **New pins:** `200`, and the search ran **once, with limit = 1**.
  - **Mutations:** **C.** `/students` rejects an unknown `type` (the control's subject): BITES. **D.** The handler drops the parsed `limit`: BITES.
- **`lib/webhook-ack-first-req105`**: 🔑 **a finding: a chain of undeclared reads, each hiding the next.**
  - **What touched the DB:** a postback resolves its reply language (the `teachers` + `parents` link), then **un-mutes** the chat, reads the **family link**, then the **OA admin list** (`line_admin_user_ids`).
  - With the database refused, only the FIRST read errored. The handler caught it and logged it, so the rest never ran, and **§4 had `console.error` silenced outright**.
  - **Fix:** one `declareStranger()` declares U1 as nobody: no teacher, no parent, no session, no family (the shared `fakeDispatchBoundary`), no admins (only that one setting key is answered; anything else throws).
  - **New pins in §4:**
    - every teacher lookup was by the sender;
    - each event un-muted **that one chat** (`[U1, U1]`);
    - **`console.error` is recorded and must be empty.**
  - The §4 comment "a postback with an unknown action does no I/O" was untrue; it is now corrected to "…beyond the language read (declared)".
  - **Mutations:** **E.** A postback no longer un-mutes: BITES. **F.** A NEW undeclared read in the postback path: **BITES**. Before this, that read would have vanished behind the silenced `console.error`.

## §3 Sweep for siblings
**Two fixed (plain), each proven with its own control:**
1. **`services/settings.service`** (from `73f8093`): `expect(calls.where).toBeDefined(); // scoped by key`. **Any** where passes, including one that matches every row.
   - **Added:** the table is `app_settings`, and the rendered condition is `"app_settings"."key" = $1` with `["checkin_early_minutes"]`.
   - **G.** Reset deletes EVERY override: **BITES**. **G0** (old line alone): **PASSED** ⚠.
2. **`lib/import-size`** (from `00f4de0`): `expect(courseExpiry(x)).toBe(courseExpiry(x))`, the function compared with **itself**, inside the test for the off-card ceiling.
   - **Added:** the date it means, `"2026-11-08"` (week 10).
   - **H.** The expiry lands a week late: the off-card test **now BITES**.
   - **H0 (control):** without the pin that test PASSED. The file was still caught by a sibling test, so the file was covered; **that test** was not.

**Named, not changed (not plain):**
- **`lib/recurring:65`**, "expiry is a function of the start date alone — nothing else moves it (AC-2)": the same call compared with itself.
  - At runtime it proves nothing. The claim is really held by `courseExpiry`'s **signature** (it takes no leave), which no assertion can check.
  - Yours whether to replace it with a source pin or leave it.
- **`lib/course-status:189`**, `expect(lossy).toBeDefined()` on a test-built literal: vacuous **by design**. The real check is the `@ts-expect-error` above it, **enforced by tsc** (tsc 0 = held). Fine as is.
- **`lib/coach-rate-visibility-req102-6:133`**, `r59.calendar toBeDefined()`: weak (only "the key exists") but not vacuous, since it comes from the real route. Low.
- **Checked and sound:**
  - the other `toBeDefined`s (course-history, line-adopt-select, ops-client, teacher-own-calendar, course-expiry-edit);
  - same-args determinism pins (attendance-undo AC-7, migration-ledger "deterministic"), whose names claim exactly that;
  - the ~15 same-function comparisons with **different** inputs (equivalence claims);
  - `test-env-guard`'s `status).not.toBe(0)`, a real process exit code.
- **Shapes searched:**
  - `not.toBe` of arithmetic, 4-digit or impossible statuses;
  - every `status).not.toBe(`;
  - all `toBeDefined()` (9);
  - the same function on both sides of `toEqual`/`toBe`;
  - `expect(<literal>)`: none.
- ⚠️ The third shape ("`toEqual` against a variable the code also wrote") **can't be grepped reliably**. I covered it only where it shows as the same call on both sides, so the sweep is **not exhaustive** for that shape.

## Counts
- **Database unreachable:** **3285 pass / 0 fail, 0 failed queries** (was 3).
- **Normal:** **3285 / 0, 0 failed queries.**
- tsc 0 · 59 = 59.
- Test count unchanged: assertions were added, not tests. Every existing assertion is kept byte-identical except the one vacuous line this task replaces, plus the one comment corrected in §4.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26), with 🔨 **one small addendum ruled below**
Verified by me: **3285 pass / 0 fail normally and with the database unreachable**, and 🔑 **zero database-error lines in the unreachable run** — I grepped for them and the count is **0**. *Nothing even tried*, which is the cleaner statement I asked for.

## 🔑 The method is the thing I want to keep: he proved vacuity by RUNNING it
For each replaced assertion he ran a **control** — the same break against the **old** line — and reported it **PASSED**: `A0` for the RBAC check, `G0` for the settings `where`, `H0` for the expiry comparison.
📌 **That is the difference between saying "this assertion looks vacuous" and demonstrating it.** A claim that a test proves nothing is itself a claim, and **it can be wrong** — the only way to know is to break the thing it supposedly guards and watch it pass. **Three times he did that, and three times the old line sat there green.** I am going to ask for controls on every "this test wasn't doing anything" finding from now on.

## ✅ The RBAC answer is better than "a typo"
**Both refusals are `401`**, so a status alone can *never* distinguish "reached `authenticate`" from "stopped by the guard" — **the author knew that (the comment says so), had no status to write, and `401 + 1000` reads as a placeholder that was meant to become the sentence check and never did.** He gives the commit, says it has not been touched since, and marks the reading as his own rather than as recovered history. **That is how to answer "how did this get here" without inventing a story.**
✅ And the replacement checks **the sentence**, not just the status — the only thing that *can* tell the two refusals apart — plus that the request really reached `authenticate`.

## 🔴 `webhook-ack-first`: a chain of undeclared reads, each hiding the next
With the database refused **only the FIRST read errored**; the handler caught it, the rest never ran, and **§4 had `console.error` silenced outright.** ⇒ **the test could not have seen a new read appear.** Now: one `declareStranger()`, the un-mute pinned per chat, and 🔑 **`console.error` recorded and required to be empty** — so mutation **F**, a new undeclared read, **bites where before it would have vanished.**
📌 **And he corrected the comment that said "a postback with an unknown action does no I/O", because it was untrue.** A false comment on a test is worse than none: it is the reason nobody looks.

## 🔨 Ruling on the three he named and left
1. **`lib/recurring:65` — replace it with a source pin. Do it as an addendum to this task.** The claim ("expiry is a function of the start date alone") is really held by `courseExpiry`'s **signature**, and a runtime comparison of a call with itself proves nothing. **A pin on the signature is checkable; the current line is not.** Two lines, with the reason written in.
2. **`lib/course-status:189` — leave it, correct as is.** It is vacuous **by design**: the real check is the `@ts-expect-error` above it, enforced by `tsc`. 📌 **A runtime assertion whose job is to give a compile-time check somewhere to live is fine**, and he identified exactly why.
3. **`coach-rate-visibility:133` — leave it.** Weak, not vacuous; it comes from the real route. Low value either way, and I would rather not churn a visibility test for a marginal gain.
✅ **The sweep itself is the right shape** — shapes searched and listed, sound ones stated as sound, and only the plain cases fixed. **"Checked and sound" is a result, and reporting it stops the next person re-checking.**

---

# ✅ ADDENDUM DONE — @Jason (2026-09-26): `lib/recurring:65` now pins the signature, proven by breaking it · 3285/0 normal and unreachable, 0 failed queries both · tsc 0 · 59 = 59
- **Replaced** `expect(courseExpiry(x)).toBe(courseExpiry(x))` (the reason is written in above the new lines). The new check reads `recurring.ts` through `readSrc` and pins what really holds AC-2:
  - the **exact parameters**, `startDate: string, size: number, quota?: number | null` (`quota` is the course's allowance, fixed at sale, not a leave taken);
  - **no `await`** in the body;
  - **every name the body reads**: `LEAVE_QUOTA_BY_SIZE`, `addDays`, `maxWeekFor`, the three params, and its own `weekNumber`.
- **Break-and-watch** (CHECKSUM identical before and after, restores byte-identical):
  - **I.** `courseExpiry` grows a new input (`leavesTaken`): **BITES**.
  - **J.** Same signature, but the body reads outside state (the clock): **BITES**. The signature alone would have missed this, so the body pin is not redundant.
  - **I0 (control).** Break I against the **old** self-comparison: **PASSED**.
- Two more lines than asked, stated: the body pin covers J, which a signature-only pin would miss.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) — the addendum landed
**3285 / 0 normally and unreachable, zero failed queries both ways**, tsc 0, 59 = 59. `lib/recurring:65` is now a source pin on the signature, which is where that claim actually lives.
**TASK-507 is complete.** 📌 Its lasting output is not the three fixed lines — it is **the control run**, now a standing requirement: *a claim that an assertion proves nothing must be demonstrated by breaking the guarded rule and watching the old line pass.*
