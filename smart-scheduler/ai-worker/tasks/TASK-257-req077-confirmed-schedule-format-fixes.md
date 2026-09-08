# TASK-257 — REQ-077 `CONFIRMED SCHEDULE`: three format defects found on a phone, plus the one beside them
**Status:** ✅ **DONE — code** (Sober 09-06, reviewed) — tsc 0 · bun test **1402/0** · no migration · 🚫 nothing sent.

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-06)
**Found by the owner on `sid`, 09:32**, reported by @Porter. **The structure is right — `Start` appears only here,
`**Advance Leave Notice : ไม่มี` renders exactly as Decision 2 specifies.** These are the labels and one content bug.
📌 **@Porter's words, and they are accurate: none of this is the build's fault** — `REQ-077` did not pin them.

---

## §1 The heading — `ob_course_title`

`line-i18n.ts:294` — `ob_course_title: { TH: "📅 ยืนยันคอร์สแล้ว", EN: "📅 Course schedule confirmed" }`.

⇒ **`CONFIRMED SCHEDULE:`** — the customer's own heading, the one `COURSE DEDUCTION` already got.
✅ **Keep an emoji**: they used `⏱️` and `💡` themselves, so `📅` stays. One i18n line, both languages.

## §2 🔴 `Date` and `Time` — the content bug, and the two messages currently disagree

`line-message.ts`, `case "course_confirmed"`:

```ts
const schedule = dow && payload.startTime ? `${dow} ${payload.startTime}` : (dow ?? undefined);
…  date: schedule,
   time: (payload.startTime as string) || undefined,
```

⇒ **`Date : อาทิตย์ 10:00` and `Time : 10:00`** — the time printed twice, and neither is a range.
🔴 **`COURSE DEDUCTION` prints `Time : 10:00-11:00`.** ⇒ **the two messages disagree about what `Time` means**,
and that is the one a customer reads as an error rather than a preference.

**Correct:** `Date : อาทิตย์` (the weekday alone) · `Time : 10:00-11:00`.

⚠️ **The payload has no `endTime`** — it carries `startTime: hhmm(course.startTime)` and nothing else.
⇒ **add `endTime` to the SAME payload** (`addHour` is already imported in `scheduler.service.ts`; a session is
start + 1h, the same derivation `insertBooking` uses). 🚫 **Not a second read, and not a second payload** — the
rule from TASK-253 stands: one object, more facts on it.
📌 **Derive it once, where the payload is built.** If the renderer builds the range from a start alone, the
"+1 hour" rule lives in two places, and the next duration change fixes one of them.

## §3 `Sessions` — and the one beside it that has the same defect

`ob_l_sessions: { TH: "จำนวนคาบที่ยืนยัน", … }` ⇒ **`Sessions`**.
📌 @Porter: *"one Thai label under eight English ones"* — the customer's template is **English labels, Thai
values**, and `renderFieldBlock` already follows that. **The two kept lines do not, because they go through the
old `t()` labels.**

🔴 **`ob_l_note` has the identical defect and was not named:** `{ TH: "หมายเหตุ", EN: "Note" }` renders
**`หมายเหตุ`** under the same eight English labels. **Fix both, or the next phone screenshot reports the one we
left.** ⇒ **`Note`**.
⚠️ **Check every other label these two kept lines can reach** before you stop — I have named two; **say whether
there are more**, rather than fixing exactly the list I wrote.

## §4 What must not move
- 🚫 The **field block itself** — order, labels, `ไม่มี`, the audience projection. All verified on the phone.
- 🚫 `booking_confirmed` — **out of scope, see the log entry.** Its byte-for-byte assertion (TASK-253) stays green.
- 🚫 `COURSE DEDUCTION` — it is the one that is already right; **§2 moves `course_confirmed` toward it**, never
  the other way.

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1402 pass / 0 fail** (7 new)
- [x] Heading is **`📅CONFIRMED SCHEDULE:`**, asserted in TH **and** EN — the emoji kept, spaced like theirs
      (`⏱️TODAY'S SCHEDULE:` / `💡COURSE DEDUCTION`, no space after the emoji)
- [x] `Date : อาทิตย์` (weekday alone) · `Time : 10:00-11:00`. 🔑 **Asserted by COMPARING the two messages** —
      `timeLine(deduction)` `toBe` `timeLine(confirmed)` — rather than pinning each separately, because the
      defect was not the format, it was the disagreement. A change to one alone now fails.
- [x] `endTime` on the **same** payload, derived once in `confirmCourse` (`addHour(course.startTime)`), and the
      renderer asserted to contain **no `addHour` at all**
- [x] `Sessions` and `Note` in the customer's convention — **plus the cause, netted** (see below)
- [x] `booking_confirmed`'s assertion still green, quoted verbatim from `line-message-fields.test.ts:265`:
      `"📅 ยืนยันตารางสอน\nนักเรียน: น้องเอ\nวิชา: Surfskate\nเวลา: 2026-09-06 10:00-11:00"`
- [x] 🚫 No migration (32 `drizzle/*.sql` = 32 journal tags) · no SQL · nothing sent

## Implementation Notes — Jason, 2026-09-06

Repo **`smart-scheduler-back`**, HEAD **`219fd59`**. Touched: `line-i18n.ts` · `line-message.ts` ·
`scheduler.service.ts` · `line-message-fields.test.ts` · `line-message.test.ts`.

**§2 — and one thing worth naming beyond the fix.** The payload never carried `endTime`, so this was a missing
fact, not a rendering slip. It is derived where the payload is built and the renderer only reads it. ⚠️ **An
outbox row queued before this deploy has no `endTime`** — the worker renders whatever is in the table, including
rows from an older build, so that case is asserted: it prints `Time : 10:00` and never a dangling `10:00-`.

**§3 — the cause, and it is now a net rather than two fixes.** See the answer below; the assertion is that **no
REQ-077 message contains `line(t(` or `ob_l_` at all**, across all three of them.

⚠️ **Three of my own tests changed** (`course_confirmed`'s two heading/slot cases and one label assertion), each
keeping its property: a teacher still reads `อาทิตย์`, never `0`.

## Answer — "is there anywhere else a `t()` label lands inside a REQ-077 block?"

**The cause: two labelling conventions coexist in this file, and nothing stopped one message using both.**
`renderFieldBlock`/`fieldLines` print the customer's convention (English label · ` : `); the older `line()`
prints the shipped one (`ob_l_*`, bilingual · `: `). The two kept lines went through `line()`, so
`จำนวนคาบที่ยืนยัน` and `หมายเหตุ` landed under eight English labels. **`Sessions` and `Note` were not two bugs;
they were one.**

⇒ Fixed at the cause: a second printer `extra()` in the customer's convention, new `ob_f_sessions` / `ob_f_note`
keys, and a **net**: `line(t(` and `ob_l_` are asserted absent from `course_confirmed`, `course_deduction` and
`daily_reminder`. The next line appended to any of them cannot reintroduce this silently.

🔴 **Why the keys are NEW rather than edited, which is the interesting half:** `ob_l_note` also renders
`booking_confirmed` — owner-verified and byte-frozen. **One key cannot serve two conventions**, so editing it
would have fixed this message and broken that one. That is also why `ob_l_*` still exists.

**I swept the rest rather than stopping at your two.** Three findings:
1. ✅ **No other `t()` LABEL reaches a REQ-077 block.** `course_deduction` and `daily_reminder` print only
   through `fieldLines`; the netted assertion now keeps it that way.
2. ✅ **`ob_dow_*` is NOT an instance**, though it looks like one: `Date : อาทิตย์` is a Thai **value** under an
   English label, which is exactly the customer's convention. Naming it so nobody "fixes" it later.
3. ⚠️ **One I am reporting, not fixing:** `renderTodaySchedule`'s empty state prints `tsched_empty` —
   *"ไม่มีคาบสอนในช่วงนี้"* — borrowed from `renderSchedule`, where the range may be a week. In a message headed
   `TODAY'S SCHEDULE` *"ช่วงนี้"* is the wrong noun. **It is unreachable in practice** (a reminder is only queued
   for someone who has classes), which is why it is a report and not a change: it is copy, and copy is @Porter's.

## Question
**Is there anywhere else a `t()` label lands inside a REQ-077 block?** §3 is a symptom of one cause — **two
labelling conventions in one message** — and I would rather have the cause named than the three instances fixed.


## Review — Sober, 2026-09-06: ✅ **PASS. TASK-257 is DONE (code).** You netted the cause and swept past my list.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1402 pass / 0 fail** (114 files) ·
`line-message-fields.test.ts:235` — `expect(timeLine(deduction)).toBe(timeLine(confirmed))` ·
`:198-199` — `line(t(` and `ob_l_` asserted **absent** from all three REQ-077 messages. No migration, nothing sent.

### 🔴 The `Time` assertion is better than the one I asked for

I asked you to pin each message's format. You asserted **the two against each other**:

> *"the defect was not the format, it was the disagreement. A change to one alone now fails."*

📌 **That is the difference between testing the symptom and testing the property.** Two separately-pinned formats
can both be edited to two new values and stay green; **one comparison cannot.** The thing that was wrong was never
`Time : 10:00` — it was that `COURSE DEDUCTION` said something else.

### ✅ The deploy-window case I did not think to ask for
> *"An outbox row queued before this deploy has no `endTime` — the worker renders whatever is in the table,
> including rows from an older build."*

**Asserted to print `Time : 10:00` and never a dangling `10:00-`.** The outbox is a queue that spans a restart, so
**a payload shape change has an in-flight population by definition** — and a trailing hyphen is exactly the kind
of thing that reaches a phone and looks like a bug in something else. **Nobody asked; you found the window.**

### ✅ Netted, not patched — and the reason the keys are NEW is the interesting half
`Sessions` and `Note` were **one** bug: two labelling conventions coexisting with nothing stopping a message using
both. ⇒ the assertion is that **no REQ-077 message contains `line(t(` or `ob_l_` at all.**
📌 **And the constraint that forced new keys rather than edits is the good kind of finding:** `ob_l_note` also
renders `booking_confirmed`, which is **owner-verified and byte-frozen** — **one key cannot serve two
conventions**, so editing it would have fixed this message by breaking that one. **You found the coupling before
it bit, rather than after.**

📌 **Third absence-assertion this week, and it passes the 09-05 test again:** the reason is a stated design rule
(*one convention per message*), not *"nobody wrote it yet"* — so it is a control. **That discipline now looks
habitual rather than remembered.**

### ✅ The sweep, and especially the one you ruled OUT
> *"`ob_dow_*` is NOT an instance, though it looks like one: `Date : อาทิตย์` is a Thai **value** under an English
> label, which is exactly the customer's convention. Naming it so nobody 'fixes' it later."*

**Recording a false positive is worth as much as recording a defect.** Left unwritten, the next person greps
`t(` in this file, finds `ob_dow_*`, and "fixes" the message into English weekdays for a Thai family. **That
sentence is the thing that stops it.**

### ✅ Reported, not fixed — correctly
`renderTodaySchedule`'s empty state prints *"ไม่มีคาบสอนในช่วงนี้"* — *"ช่วงนี้"* is the wrong noun under a heading
that says **TODAY'S**. **Unreachable in practice, and it is copy** ⇒ @Porter's, not yours, and not a silent edit.
**Right call on both counts.** @Porter — it is one word and it is yours.

**Status → DONE (code).** REQ-077's notification half stands complete and now matches the customer's format on a
phone.
