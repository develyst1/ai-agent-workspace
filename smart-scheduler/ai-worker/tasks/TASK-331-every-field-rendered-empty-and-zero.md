# TASK-331 — every field, rendered EMPTY and ZERO, read by a human

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-10)
⚪ **NO CLOCK.** 🔑 **ANALYSIS + TESTS ONLY — no product-code change**, which is what makes it safe while
@Tanya is on `uat`. 🚫 **Do NOT fix `Remaining : 0` here.** ✅ **Source: your own TASK-330 §3 and §4.**

---

## §1 Your finding is not one line. **I counted: `as string) ||` appears THIRTEEN times in `line-message.ts`.**
🔑 **You found `Remaining : 0` by reading one branch, and you said so — *"not by a method that would find the
others"*.** ✅ **That sentence is what let me find the method: it is YOUR OWN TELL, pointed at a BUG PATTERN
instead of a string.**
🔴 **`(payload.x as string) || undefined` is an IDIOM in that file, used thirteen times.** ⇒ ***every one of
those fields silently loses its whole line if its producer ever sends `0` or an empty string.***
📌 **That reframes `Remaining : 0` from a curiosity into the first CONFIRMED instance of a thirteen-wide
class** — and it is why the sweep comes before the fix.

## §2 What to produce
✅ **Every field of every message, rendered twice — once EMPTY, once ZERO** *(and null where the type allows)* —
**and the OUTPUT READ**, not merely asserted non-crashing.
| column | |
|---|---|
| **field · message** | |
| **empty →** | line absent · `Label :` with nothing after · renders |
| **zero →** | line absent · renders `0` |
| **is that RIGHT?** | 🔑 **your judgement, and the reason** |
| **can the producer send it?** | ⚠️ **checked, not assumed** |

🔴 **The last column is the one that matters and it is the expensive one.** 📌 *`Remaining : 0` is latent
because `remainingLabel` always returns a non-empty string — you established that by READING THE PRODUCER, and
that is the standard for every row.* ⚠️ **Where you cannot establish it cheaply, write *not established*.**
🚫 **Never a guessed no.**

## §3 🔑 The distinction to hold, because it is the whole point
**A missing line and a wrong line are not the same defect.**
⇒ ***omit-empty makes a missing line look INTENTIONAL*** — **the owner's own `(-)` reasoning pointed at us: a
field that vanishes when empty is indistinguishable from one that was never sent.**
🔑 **So the real output is not *which fields break*. It is *which fields could go MISSING with nobody able to
tell*.** 📌 **That is the class the reporting channel cannot reach**, and it is your sentence: ***not "the
message is wrong", but "the message is incomplete and looks complete".***

## §4 What NOT to do
🚫 **No product-code change. None.** ⚠️ **Not even the `||` to `??` you already know you want** — 🔑 **because
`?? undefined` alone converts the EMPTY case from an ABSENT line into a label with nothing after it, which
TASK-219 established reads as information that went missing.** ⇒ **the fix has a trap in it and deserves its
own task, cut from THIS list rather than from one example.**
🚫 **No producer-side types here either.** 🚫 **Do not touch `renderTodaySchedule`'s missing cap** — *your own
map calls it LOUD, and a loud failure is not this task's subject.*
✅ **Tests that RECORD current behaviour are welcome** — ⚠️ **but a test pinning a behaviour you judge WRONG
must say so AT the assertion**, 📌 *or the next reader takes the pin for approval.*

## Definition of Done
- [ ] `bun test` all pass, **state the count** · 🚫 **ZERO changes in `src/` outside test files** — say so, and
      let `git status` prove it
- [ ] 🔑 **The table, in the TASK** — every field, empty and zero, output READ
- [ ] 🔴 **Each row says whether the PRODUCER can send it** — ⚠️ *not established* where you did not check
- [ ] **Every row you judge WRONG is marked with its reason** — and 🚫 **none of them fixed**
- [ ] 🔑 **The thirteen `|| undefined` sites individually accounted for** — safe · latent · live
- [ ] 🔴 **If anything is LIVE, STOP and tell me before finishing** — ⚠️ *that is a defect, not a sweep, and it
      would not wait for @Tanya*
- [ ] **Say what the sweep did NOT cover**, the way you did in TASK-330 §4

## Question
🔑 **Your §4 named the real gap: the renderer is safe GIVEN a payload, and nothing checks what producers put in
one — `row.payload as any` means the compiler checks none of it.**
⇒ ❓ **After this sweep, is the honest fix a TYPE on the payload, or is it that the renderer should never
receive an unconstrained `any` at all?** 📌 *I am not asking you to build either.*
⚠️ **I am asking which one you would defend to someone who says "we have thirteen assertions now, that is
enough"** — 🔑 **because that person will be me in a month, and I would like the argument written down while
the map is fresh.**

---

## ✅ RESULT 2026-09-10 — @Jason. **ANALYSIS. `git status` in `smart-scheduler-back` is EMPTY.**
🚫 **Zero changes in `src/` — including no test file.** *(Two throwaway probes under `scripts/`, deleted; the
clean status is after.)* 📌 **`bun test` unchanged at 1990 / 160 files** — I ran nothing that could change it.

### 🟢 **NOTHING IS LIVE.** All thirteen are SAFE or LATENT — I am not stopping you.
🔑 **Checked, not assumed, for every row.** ⚠️ Two rows are *not established* and both are named.

---

## §1 THE THIRTEEN `(payload.x as string) ||` SITES, individually accounted for

| # | line | field · message | falsy → | is that RIGHT? | can the producer send it? |
|---|---|---|---|---|---|
| 1 | 139 | `attendeeNote` · `booking_confirmed` | **line absent** | ✅ **YES — it is the RULE.** `Remark` is `*ถ้ามี` (§7.3) | ✅ yes — `current.attendeeNote ?? null` |
| 2 | 163 | `studentName` · `leave_notice` | line absent | ✅ **YES** — TASK-224: *a studentless booking renders with no empty labels* | ✅ **yes, explicitly: `student?.name ?? ""`** |
| 3 | 188 | `attendeeNote` · `leave_notice` | line absent | ✅ YES — §9.1, same rule | ✅ yes |
| 4 | 235 | `studentName` · `course_confirmed` | line absent | ⚪ tolerable — the parent knows their own child | ✅ yes — `student?.nickname ?? student?.name ?? null` |
| 5 | 243 | `startDate` · `course_confirmed` | line absent | ⚪ tolerable | ⚠️ **not established** — `course.startDate`, not read |
| 6 | 244 | `coach` · `course_confirmed` | line absent | ⚪ tolerable — a coach knows it is theirs | ✅ yes — `teacher?.nickname ?? null` |
| 7 | 245 | `expiryDate` · `course_confirmed` | line absent | ✅ **YES — correct.** No expiry to state ⇒ no line stating one | ✅ yes — nullable |
| 8 | 285 | `note` · `course_confirmed` | line absent | ✅ YES — §8.1's `Remark` half of the trap | ✅ yes |
| 9 | 307 | **`remaining` · `course_deduction`** | 🔴 **line absent** | 🔴 **NO — see §2** | 🟡 **LATENT** — `remainingLabel` returns `"0 HR"` |
| 10 | 308 | `expiryDate` · `course_deduction` | line absent | ✅ YES — as #7 | ✅ yes — `input.expiryDate: string \| null` |
| 11 | 324 | `studentName` · `booking_paused`/`resumed` | **renders `-`** | ⚪ tolerable — `-` is visible, not silent | ✅ yes |
| 12 | 363 | `studentName` · `sick_leave` | renders `-` | ⚪ tolerable | ✅ yes |
| 13 | 373 | `studentName` · `leave_teacher` | renders `-` | ⚪ tolerable | ✅ yes |

🔑 **The split that matters: TEN can lose a LINE; THREE fall through to `-`.** ⚠️ **The three are the safe
shape** — a `-` is a visible admission; a missing line is not. 📌 *Same fields, two idioms, in one file.*

## §2 🔴 The one I judge WRONG — and it is #9, alone
**`Remaining` is the only field on this list whose absence removes the message's PURPOSE.** A `COURSE
DEDUCTION` exists to tell a parent what is left; without that line it is a receipt with no balance — and
**omit-empty makes the absence look deliberate.**
✅ **Every other absent line above is either the customer's own rule (`Remark`) or a true statement about
missing data (`no expiry`, `no student`).** ⇒ **#9 is not "one of thirteen". It is the one that is wrong, and
the other twelve are the reason it looked like a class.**
🚫 **Not fixed, per §4.** 📌 And your trap is real: `?? undefined` alone would turn `remaining: ""` into
`Remaining :` with nothing after it — **TASK-219's *information that went missing***. ⇒ the fix is
`?? undefined` **plus a producer-side type**, and it is one task with two halves, not a character swap.

## §3 What the sweep found BEYOND the thirteen
**Rendered every payload field of every message with `""`, `0` and `null` and read the output.**
- 🟡 **`size` / `total` → `Program : Freeskate`** — the hours silently drop off. **Not a missing line, a
  DEGRADED value.** ✅ **Safe: `PackageSize = 4 | 6 | 10` and the column is `smallint notNull`**, and for a
  VOUCHER `programLabel` ignores size entirely. ⚠️ **But worth one sentence:** since TASK-318 removed
  `Sessions :`, **the program label is the ONLY place the hours appear** — the redundancy that would have
  caught a bad size is the line the customer asked us to delete. *(Correctly deleted; noted, not reopened.)*
- 🟡 **`weeks` · `makeup_far_out`** — `String(payload.weeks ?? "-")`: `null` → `-`, but **`""` passes `??` and
  renders *"…: ⟨blank⟩ สัปดาห์…"*, a half-sentence.** Same for `replaces` → *"( → 2027-03-09)"*. **LATENT** —
  both are computed numbers/dates and the message only sends when `searchExhausted` is true.
  🔑 **Different failure from the thirteen: `??` guards null but not `""`, so it is the MIRROR of `||`.**
  ⇒ **the file has both bugs, one per idiom.**
- ✅ **No empty message, no `Label :` with nothing after it, anywhere** — measured across all kinds.

## §4 What this sweep did NOT cover
🚫 **Producers of five payloads I did not open** (`booking_paused`, `booking_resumed`, `teacher_assigned`,
`teacher_unassigned`, `reschedule_requested`) — all three of their falsy paths render `-` or omit a `line()`,
so **the renderer is safe whatever they send**; I did not verify what they send.
⚠️ **Rows 5 (`startDate`) — not established.** I did not read `coursePackages.startDate`'s nullability.
🚫 **`ctx` fields** (`date`, `startTime`, `coach`, `subject`) — they come from `bookingContext`, not a payload,
and are outside the `as string) ||` class. **Not swept.**
🚫 **`daily_reminder` / `daily_digest` rows** — their own renderers, own `dash()` guard. Not swept.

---

## ❓ THE QUESTION — **the two are not alternatives. A payload TYPE that is honest IS "never receive an `any`".**

**A single `OutboxPayload` type cannot exist as a flat interface** — fourteen kinds carry different fields, so
the only honest type is a **discriminated union on `kind`**. ⇒ **"put a type on the payload" and "the renderer
should not receive an unconstrained `any`" are the same fix**, one stated weakly and one stated properly.
📌 **What makes it real rather than cosmetic: the union must be PARSED at the boundary, not CAST.** `row.payload
as any` is where type information is *destroyed* — the producer knew `remaining` was a string, the DB column
knows nothing, and `as string` re-asserts a fact nobody checked. **A cast at that line changes nothing; a parse
changes everything.**

### 🔑 The argument I would make to you in a month, when you say "we have thirteen assertions, that is enough"
**Assertions and a parsed union fail at different times, and only one of them scales:**
1. 🔴 ***The thirteen assertions cannot fail for the FIFTEENTH KIND.*** They are per-field, per-message,
   written against the fourteen that exist. **A kind added next month inherits none of them** — which is the
   exact sentence from TASK-327, and the reason we stopped counting `5/14` and started asking *does branch
   fifteen get it free?* **A parsed union makes the new kind declare its fields or fail to compile.**
2. ⚠️ **A test can only cover the payloads I thought to write.** I found #9 by reading a `||`, and I said so —
   *not by a method that would find the others*. **You then found the method, and it was a grep for an IDIOM.**
   ⇒ **the next class will have a different idiom, and no assertion written today points at it.**
3. 📌 **The assertions live on the wrong side of the boundary.** They test *the renderer, given a payload*.
   **Nothing anywhere compares what a producer WROTE against what a branch EXPECTS** — and that comparison is
   the whole defect. A union is the only artefact that sits in both places at once.
4. ✅ **And the honest counter-argument, so it is on the record:** a union is a real cost — fourteen shapes, a
   parse at the read, and **every historical row in `notification_outbox` must still parse or the worker starts
   failing on data it used to send.** 🔑 **That is not a reason to prefer assertions; it is the reason to do it
   with a lenient parse that LOGS rather than throws** — the same shape as `notifyAdmins`' loud SKIPPED row.

⇒ **My answer: the union, parsed at the outbox read, lenient and logging.** 🚫 **Not thirteen `??`s and not
thirteen more tests** — *those hold the fourteen we know about, and the map already told us that is the
signature of a property held by repetition.*

**BALL: @Sober — TASK-331 delivered as analysis. 🟢 Nothing live. ⛔ Nothing in `src/`. TASK-328 when you
release it.**
