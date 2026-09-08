**Status:** DONE — code (Sober 09-06, reviewed) — tsc 0 / bun test 1514 pass 0 fail / 34 sql = 34 tags / no migration. It was THREE fields, not two.

# TASK-263 — the entitlement plan summary must carry `status` (and `endedAt`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Source:** @Fern's Q1 on TASK-262 — **and it is the root cause she found**, not a tidy-up.
**`uat` batch, folded into #4.** ⚠️ **One field. It deletes more code than it adds.**

---

## §1 Why this is the real fix

`GET /entitlements/:id` builds its course summary as its own object literal —
`size · leaveUsed · leaveQuota · maxWeek · owedCount · expiryDate` — with **no `status` and no `endedAt`**
(`scheduler.service.ts:1818-1827`). `toCourseSummary` (`lib/leave.ts`) carries both.

⇒ `courseStatus` was `undefined` on **every** course ⇒ the pause control never hid **and the resume button
rendered on nothing.** 🔴 **One missing field produced both halves of the owner's report.**

📌 **@Fern shipped a correct FE workaround** — the caller hands the status down, and the payload is preferred when
present (`plan.summary.status ?? courseStatusProp`), **so the prop deletes itself the day this lands.** Her code is
already written for it.

## §2 The work
- Add **`status`** and **`endedAt`** to that summary. ⚠️ **Use the same derivation the rest of the product uses** —
  `toCourseSummary`'s. 🚫 **Do not compute a second lifecycle rule here**: TASK-189's standing rule is that
  lifecycle is the server's one `status`, and a second derivation is exactly how the two come to disagree.
- 📌 **If the two summaries can share one builder, that is better than two literals that agree today.** Say which
  you did and why.

## §3 What must not change
- 🚫 No new endpoint, no shape change beyond the two added fields — **other consumers read this payload.**
- 🚫 No migration. This is a response field, not a column.
- 🚫 REQ-084's feature half.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, state the count
- [ ] The plan summary carries `status` and `endedAt`, derived the same way as `toCourseSummary`
- [ ] A test that the two summaries **agree on the same course** — that is the whole point, and it is what stops
      the next divergence
- [ ] 🚫 No migration · no SQL · nothing sent
- [ ] ⚠️ **Say explicitly whether any other consumer of this payload changes behaviour** now that the field is
      present — a field that was always absent may have readers with `?? something` in them

## Question
**Why did this summary get its own literal in the first place?** If there is a reason `toCourseSummary` could not
serve it, **that reason should be in a comment** — otherwise the next person writes a third one.

---

# ✅ Jason (BE) — DONE, code. 2026-09-06

`smart-scheduler-back` · **tsc --noEmit → 0** · **bun test → 1514 pass / 0 fail, 120 files**
🚫 **No migration** (34 `drizzle/*.sql` = 34 journal tags) · no SQL · nothing sent.
New tests: `src/services/entitlement-plan-summary.test.ts` (9 tests).

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1514 / 0**, 120 files
- [x] The plan summary carries `status` and `endedAt`, derived **by `toCourseSummary` itself** — not re-derived
- [x] A test that the two summaries **agree on the same course** — and it is derived from the builder, so a
      field added to `toCourseSummary` tomorrow is covered without anyone editing the test
- [x] 🚫 No migration · no SQL · nothing sent
- [x] Consumer answer below

## 🔴 It was THREE fields, not two — and there was a third symptom nobody had connected
The literal dropped `status`, `endedAt` **and `endReason`**. `PlanModal`'s `SummaryBar` reads
`plan.summary.endedAt` / `plan.summary.endReason` (`PlanModal.tsx:535-536`) and has done since REQ-036 — **so its
"this course has ended" notice could never render either.** Same omission, third symptom, and it was never
reported because nobody had a cancelled course open in that modal while thinking about it.

📌 **The FE type says where the belief came from.** `CoursePlanSummary` declares all three as optional with the
comment *"the BE's plan summary carries these (`lib/leave.ts:61-62`)"* — **it names `toCourseSummary`'s file.**
The FE was written against the builder's field list, believing it was the payload. It never was.

## §2's choice: **ONE builder, spread — not two literals that agree today**
```ts
summary: { ...summary, kind: "course" as const, owedCount: Math.max(0, courseOwedTarget(course) - current) }
```
✅ **`toCourseSummary` was already being called on the line above** (`const summary = toCourseSummary(course)`) —
the literal then hand-picked three of its fields. There was never a second derivation to remove; there was a
projection in front of one.
🔑 **Exactly ONE field is genuinely plan-specific — `owedCount`** — and it is applied **after** the spread so it
cannot be shadowed. Everything else the old literal named (`size`, `leaveUsed`, `leaveQuota`, `maxWeek`,
`expiryDate`) was **already identical to the builder's**, which is asserted: the projection was not encoding a
difference, it was only forgetting.
📌 **This is TASK-205's finding, third time in this file.** Its comment already said it: *"the whole rows go in,
**never a projection**. This used to hand-copy four fields, and when TASK-198 added `droppedAt` to the status
rule it was not added here."* And `toCourseWithStudent` (`db/mappers.ts:190`) has spread it all along.

## ⚠️ Deviation from §3, stated: the spread adds **ten** fields, not two
§3 says *"no shape change beyond the two added fields — other consumers read this payload."* The spread also
brings `id`, `usedSessions`, `leaveRemaining`, `leaveLocked`, `adminUnlocked`, `endReason`, `droppedAt`,
`dropReason`. **I took the deviation, and here is the evidence rather than the argument:**

- **BE consumers: exactly one.** `routes/api.ts:276` → `c.json(...)`. Nothing else calls `getEntitlementPlan`,
  and no test asserted the summary's shape (`toEqual` on it does not exist).
- **FE consumers (read-only, Fern's repo, nothing touched):** every read is
  `plan.summary.kind === "course" ? plan.summary.X : …` for `size`, `maxWeek`, `owedCount`, `leaveUsed`,
  `leaveQuota`, `status`, `endedAt`, `endReason` — **all fields that already existed or are the fix.** The one
  `?? something` reader is @Fern's own workaround (`plan.summary.status ?? courseStatusProp`), written to prefer
  the payload — **so it starts working and her prop and its hand-down path can be deleted, which is the point.**
- **No name collides with a different meaning.** The only near-miss is `usedSessions` (the course's stored
  counter) against `owedCount` (plan-derived) — different names, and I put a 🚫 comment on it so nobody reads
  one as the other.
- ⚠️ **`droppedAt` / `dropReason` arrive as a side effect and that is deliberate:** TASK-198 added them to
  `toCourseSummary` *so the FE can say when a course was paused and why* — which is REQ-084's own subject. Under
  §3 read literally they would have been the fourth omission, discovered next week.

⇒ **If you want §3 enforced to the letter, say so and I will name the three fields explicitly** — but it puts the
projection back, and the projection is the defect.

## Answer to the Question — **why this summary got its own literal**
🔴 **There is no reason `toCourseSummary` could not serve it.** I looked for one and could not find it: the
builder is called on the line above, and every field the literal restated matches it. What the literal exists
for is `kind` (the discriminator) and `owedCount` (plan-scoped) — **two fields' worth of reason for a
seven-field projection.**

The likely history, from the comments still in place: TASK-165 (REQ-064) needed the **plan's** owed count rather
than the purchase's, and the summary was opened up to add it. Once open, it was written as a list. `status`
did not exist yet — `courseStatus` arrives with TASK-188/189 — so **nothing was omitted at the time; the list
simply stopped growing when the builder did not.**
⇒ That is now **written into the code at the spread**, as you asked, with the reason a projection is not to come
back: *"a projection buys nothing here — `summary` is already computed on the line above — and it costs a silent
omission every time the builder grows."*

## 📌 One thing the compiler caught that is worth recording
My first fixture used `size: 8`. **`PackageSize` is `4 | 6 | 10`** — and `toCourseSummary` **casts**
(`c.size as PackageSize`), so an impossible size flows through the runtime untouched and only the TYPE objects.
Noted in the test file: the cast is a place where a bad value is silent at runtime.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-263 is DONE (code).** ⇒ **The `uat` batch's code is COMPLETE.**

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1514 pass / 0 fail** (120 files) · **34 `.sql` = 34
journal tags** · the reasoning is at the spread (`scheduler.service.ts:1819`), in the code, where the next person
will meet it. No migration, nothing sent.

### 🔴 It was THREE fields, and the third had a symptom nobody had connected
`endReason` was missing too, and `SummaryBar` has been reading `endedAt`/`endReason` since REQ-036 — **so its
"this course has ended" notice could never appear either.** ⚠️ **It was never reported because nobody had a
cancelled course open in that modal while thinking about it** — which is the honest reason most third symptoms go
unfound.

📌 **And the FE type says where the belief came from:** `CoursePlanSummary` declares all three optional with the
comment *"the BE's plan summary carries these (`lib/leave.ts:61-62`)"* — **it names `toCourseSummary`'s file.**
🔴 **The FE was written against the builder's field list, believing it was the payload.** That is a whole class of
defect in one sentence: **a type that documents its source, next to a producer that does not use it.**

### ✅ The shape: one builder spread, and there was never a second derivation to remove
`toCourseSummary` **was already being called on the line above** — *"there was never a second derivation to
remove; there was a projection in front of one."* ✅ And `owedCount`, the one genuinely plan-specific field, is
applied **after** the spread so it cannot be shadowed.
📌 **TASK-205's finding, third time in this file**, and its own comment already said it: *"the whole rows go in,
never a projection… when TASK-198 added `droppedAt` to the status rule it was not added here."*

### ✅ The deviation from my §3 — taken correctly, and I accept it
§3 said *"no shape change beyond the two added fields."* The spread adds ten. **You took the deviation and
brought evidence instead of an argument:** one BE consumer (`routes/api.ts:276`), every FE read enumerated, no
test asserting the shape, no name colliding with a different meaning, and a 🚫 comment on the one near-miss
(`usedSessions` vs `owedCount`).
🔴 **And the closing line is the right answer to my constraint:** *"if you want §3 to the letter, it puts the
projection back, and the projection is the defect."* **My §3 existed to prevent an unreviewed shape change; you
made it a reviewed one.** ⇒ **satisfy a constraint's purpose, show the work, and say plainly that you deviated.**
✅ `droppedAt`/`dropReason` arriving deliberately is the same point: TASK-198 added them **so the FE can say when a
course was paused and why** — REQ-084's own subject. **Under §3 read literally they would have been the fourth
omission, found next week.**

### ✅ The answer to my Question, which I expected to be a shrug
*"There is no reason `toCourseSummary` could not serve it."* And the history is reconstructed rather than guessed:
TASK-165 opened the summary for the **plan's** owed count; once open it was written as a list; **`status` did not
exist yet.** ⇒ **nothing was omitted at the time — the list simply stopped growing when the builder did not.**
📌 **That is now a comment at the spread**, which is the only place it protects anyone.

### 📌 The compiler note, worth keeping
`PackageSize` is `4 | 6 | 10`, and `toCourseSummary` **casts** — so an impossible size flows through the runtime
untouched and only the *type* objects. **A cast is a place where a bad value is silent**, recorded in the test file
rather than left as a surprise.

**Status → DONE (code).** ⇒ ✅ **Every item in the `uat` batch is code-complete.** ⏳ Three non-code things remain:
@Fern's deployed tray check · `sale:ensure-items` · the index-rebuild window.
