# TASK-255 — three copies of "student → parent → LINE user id", and they will drift
**Status:** ➡️ **SUPERSEDED by TASK-259** (Sober 09-06). The read below stands and is the basis of `SPEC-074`; the build is TASK-259. **Not cancelled — promoted.**
accessor, and the defect is bigger than the duplication.** Nothing changed. **Your ruling needed before any code.**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**No priority.** Found by @Jason while building TASK-254 and **flagged rather than fixed, which was the right
call** — unifying it there would have touched `confirmCourse` and the reminder job, neither of which that task
was about. **Cut so that the flag becomes a thing that exists, not a sentence in a finished task file.**

---

## The finding, in his words

> *"`notifyCourseDeduction` does its own parent lookup (student → parent → `line_user_id`), which is the third
> copy of that two-step in the repo (`scheduler.service` has a private one, `daily-reminder` does it in bulk).
> It is the kind of duplication that drifts, and TASK-230's `familyLineUserIds` is the accessor they should
> probably all end at."*

**Why it matters more than ordinary duplication:** since TASK-230 a family may hold **several** LINE accounts.
⇒ **three copies of "who do we send this to" is three chances to answer that question differently**, and the
symptom is not a crash — it is **one parent silently not receiving a message the other one got.** Nobody reports
that; they just stop trusting the channel.

## The work
1. **Read all three** and say what they actually do — bulk vs single, one account or all of them, and whether any
   of them already disagrees. ⚠️ **Report the differences before removing them:** if two of them disagree today,
   **one of those is a live defect and it is worth more than this refactor.**
2. **Land them on one accessor** — TASK-230's `familyLineUserIds` unless the read shows a reason it cannot serve
   all three, in which case say what the reason is.
3. **Assert there is one.** A test that the two-step appears once, comment-stripped — the repo's convention, and
   the counting trap from 09-03 applies: **match code shape, not the identifier in prose.**

## Definition of Done
- [x] The three sites named, their differences reported **before** any of them is changed — below
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count — **nothing changed yet**: this is the
      READ, per your instruction. No file in the repo was edited.
- [ ] One accessor, or a stated reason why one cannot serve all three — **waiting on your ruling**, because the
      read changed what the task is
- [ ] A test that pins it to one
- [ ] 🚫 No migration · no SQL · nothing sent — **and nothing run**: this is source reading only

---

# THE READ — Jason, 2026-09-06 (no code changed)

## Answer to your Question, first: **the three AGREE with each other. All three disagree with the accessor.**

**So it is not a tidy-up, and it is not the defect you predicted either — it is a bigger one, one level up.**
Every one of the three reads **`parents.line_user_id` and nothing else**:

| # | Site | Shape | Reads | Accounts reached |
|---|---|---|---|---|
| 1 | `lib/course-deduction.ts:91` `lookupParentLine` | single, per booking | `students.parentId` → `parents.lineUserId` | **1** |
| 2 | `services/scheduler.service.ts:3280` `parentLineUserId` | single, per booking | identical | **1** |
| 3 | `services/jobs.service.ts:358/385` (reminder) | **bulk** — one `findMany` for the day's parents | identical column | **1 per parent** |

⇒ On the question *"does a family with two linked accounts get two messages?"* **all three answer "no", in the
same way, for the same reason.** They are three copies of one rule, and the rule is the old one.

## 🔴 The live defect the read actually found — and it is not in these three

`familyLineUserIds` (TASK-230's accessor, `lib/family-link.ts:27`) has **exactly two callers, and neither one
sends anything**: `clearFamilyLine` (the admin unlink) and `getParent` (the People screen's badge).
**No notification path in the repo uses it.** The same is true in the other direction: `familyOfLineUser` is
called **once**, inside `bindFamilyLine`'s own guard.

Now follow REQ-079's phone entry (`line-webhook.service.ts:400-403`), which is how a second family member links:

```ts
const bind = await bindFamilyLine(existing.id, lineUserId);   // adds a row to family_line_links
await linkParentLine(existing.id, lineUserId);                 // parents.lineUserId = <this account>  ← unconditional
```

`linkParentLine` (`parent.service.ts:60`) refuses only when that LINE id belongs to a **different** parent; for a
second account of the **same** family it simply overwrites. ⇒ **`parents.line_user_id` is "whoever linked most
recently", and every earlier account survives only in `family_line_links` — a table nothing reads.**

**What that means for a real family, stated as behaviour:**
- 🔴 **Outbound:** after the mother links, **every message goes to her phone only.** The father is not sent to,
  is not marked SKIPPED, and produces no error — there is one outbox row and it is `queued`. **Exactly the
  silent shape you described, arrived at by a different route than you expected.**
- 🔴 **Inbound, and I did not expect this one:** the webhook identifies a parent with `findParentByLineUserId`
  (`parent.service.ts:32` — the **column**), used at seven sites, plus a fourth hand-rolled copy of the same
  lookup in `checkin.service.ts:82`. So after the mother links, **the father's `เช็คอิน`, `ลา` and `คอร์สของฉัน`
  stop working** — he is not recognised as a parent at all and falls to `silence` / `welcome`.
- ⚠️ So REQ-079's *"a family may hold several LINE accounts"* is true in the **schema and the admin screen**, and
  false in **every message and every command**. The unique index that makes the binding permanent is doing its
  job; nothing else is using what it protects.

## What I did NOT do, and why

🚫 **I did not unify anything**, per your instruction — and after the read I would not have wanted to: landing
the three on `familyLineUserIds` would change **outbound only**, quietly making a two-account family start
receiving two of everything, while the second account still cannot type `เช็คอิน`. **Half of a fix for this is
worse than none**, because it looks like the feature works.

## What I recommend, for your ruling

1. **This is a defect, not a refactor**, and it belongs in the `uat` batch as one — the read enlarged it, exactly
   as you said it might.
2. **It is three questions, not one**, and they should be decided together:
   - **who receives** — every account (`familyLineUserIds`) or the primary?
   - **who is recognised** — should `findParentByLineUserId` become `familyOfLineUser`? That is the inbound half
     and it is **seven call sites plus a fourth copy**, so it is its own task.
   - **what `linkParentLine` should do when the column is already set** — overwrite (today), or leave the first
     account as primary? 📌 This one is upstream of both: today the answer to *"which single phone?"* is
     *"the newest"*, which nobody chose.
3. **My suggestion:** the unification (1) is small and safe **only if** the inbound half is cut alongside it. If
   the batch cannot hold both, I would rather ship **neither** than the outbound half alone.

⏳ **Waiting on you.** Nothing is changed; say the word and I will cut it whichever way you decide.

## Question
**Do any two of the three disagree today** — about a family with more than one linked account, or about a parent
with no link at all? **That answer decides whether this is a tidy-up or a defect**, and it is the first thing to
find out.


## Ruling — Sober, 2026-09-06: **HOLD the build.** And @Porter's last line changes the ruling I was about to write.

**Reproduced from source:** `familyLineUserIds` (`family-link.ts`) has two callers — `clearFamilyLine` and
`getParent` — **and neither sends anything.** `linkParentLine` overwrites `parents.lineUserId` for a second
account of the same family. `findParentByLineUserId` reads the **column**. **Your read stands as written.**

### ✅ You found a bigger thing than either of us predicted, by looking one level up
I asked *"do the three disagree?"* — a question about duplication. **You answered it (they agree) and then asked
the better question: do they agree with the thing they should be using?** They do not, and none of them ever did.
📌 **That is the difference between checking for drift and checking for correctness.** Three copies of a rule are
harmless when the rule is right; **these are three copies of a rule the schema stopped believing in at TASK-230.**

### ✅ "Neither half, rather than the outbound half alone" — accepted, with the reason sharpened
**Today the father's phone is consistently dead** — no messages, no commands. **After an outbound-only fix it
becomes inconsistently alive:** messages arrive, he taps `เช็คอิน`, nothing happens. 🔴 **A half-fix converts a
silence anyone can describe into a contradiction nobody can** — the family reports *"the bot is broken"* instead
of *"my husband gets nothing"*, and the second is actionable while the first is not.

### 🔴 The ruling, and @Porter's last line is what decides it

I was going to hand the owner a choice — **(A)** one account per family, made explicit and honest, or **(B)**
genuinely several. **That framing is wrong, and @Porter's note is why:**

> *"นี่คือสิ่งที่เราเขียนบอกลูกค้าไปในลิสต์ว่า 'ผู้ปกครองผูกได้หลายคน (พ่อ แม่ ผู้ปกครองอื่น) ทำแทนกันได้'"*

**The customer has already been told (B).** ⇒ **the policy question is not open — it was answered by a promise,
and the promise is on the record.** Offering the owner *"or we could do (A)"* would be offering him a retraction
dressed as a design option. 🚫 **I am not putting that in front of him as an engineering choice.**

⇒ **(B) is the requirement:** outbound to every linked account, **and** inbound recognising every linked account.
✅ **And the answer @Porter is actually waiting for — "will it work as advertised if we fix it?" — is YES.**
Nothing in the schema is missing: **`family_line_links` and its unique index were built for exactly this at
TASK-230.** The work is real but it is wiring, not design. **The list can stand. Do not correct it.**

### The size, honestly, because it changes the batch
| Half | Work | Size |
|---|---|---|
| **Outbound** | the three sites → `familyLineUserIds` | **small** — one accessor, three call sites |
| **Inbound** | `findParentByLineUserId` → `familyOfLineUser` | 🔴 **seven call sites + the hand-rolled copy in `checkin.service.ts:82`** — the larger half, and the one that makes the promise true |
| **Upstream** | `linkParentLine`'s silent overwrite | small, and it stops *"whoever linked last"* from being the rule |

⚠️ **Ship both halves or neither** — that stands, and it is now a requirement rather than a preference.

### 🔄 What this does to the batch — @Porter, this outranks two of your items
**A live defect against something the customer has been told in writing beats an unstarted feature.** ⇒ revised
order: **1. this** · 2. REQ-083 · 3. REQ-076 · 4. REQ-084 defect · 5. TASK-251 · 6. TASK-252.
🔴 **And my descope list changes with it:** if the batch runs long, **REQ-076 is now the third thing I would cut,
after 252 and 251** — it is the largest item and it is a feature nobody has been promised a date for. **This is
not cuttable at all**, because cutting it means correcting the customer's list.

📌 **This is exactly what "information first" was for**, and it is the one place in the sequence where a different
order would have cost real work: under any other, TASK-255 gets quietly unified early and **`uat` ships the
outbound half alone** — the half that makes it look fixed.

📌 **And a pattern worth naming beyond this task:** `family_line_links` is a table with a unique index protecting
rows **that nothing reads**. Same shape as `UNKNOWN_RICH_MENU` before TASK-247 and `menuHasAdminButton` before its
test. **Fourth time this month a mechanism was built, documented, and never given a caller** — frequent enough
now to be worth its own look.

**Status: HELD, not cancelled — and no longer a refactor.** I spec it as a defect next, after REQ-083.
