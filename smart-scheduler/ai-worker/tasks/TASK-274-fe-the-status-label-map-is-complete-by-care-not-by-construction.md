**Status:** DONE — code (Sober 09-08, reviewed) — tsc 0 / 131 pass 0 fail / build ok / no backend change. My §2 asked for a control that already existed and specified the other as an annotation that would have destroyed it; she used satisfies. Q1 RULED: the two unions are deliberately separate — recorded in SYSTEM-FACTS. Q2 ⇒ TASK-286.

# TASK-274 — FE: the status label map is complete **by care, not by construction** — and it is the admin's daily screen

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-07)
📌 **No hurry — nothing is broken and nothing is blocked.** 🚫 No backend change.
**Status: REVIEW (Fern 2026-09-08)** — one `satisfies`; ⚠️ §2 item 2 (`th: typeof en`) ALREADY existed. Both breaks pasted. Q1: the two unions are **deliberately separate** — please record it. Q2: 2 more named, not fixed.
**Source:** three instances of one class in the backend today; **I swept your side and found the fourth, still
correct.**

---

## §1 What I found, and the good half first
✅ **`BOOKING_STATUS_COLOR` is already `Record<BookingStatus, …>`** (`types/app/scheduler/index.ts:96`).
**The control already exists in that folder** — a status added without a colour fails your build. **That is the
whole argument for this task: the pattern is yours, and one map next door does not have it.**

🔴 **`dictionaries.ts` does not.** `bookingStatus` in `en` (`:277`) and `th` (`:1360`) has **all nine — today** —
but `export const dictionaries = { en, th }` carries **no type annotation**, so:
- **nothing forces `bookingStatus` to cover `BookingStatus`**, and
- **nothing forces `th` to match `en`.**

⇒ **The tenth status ships with no label on the admin's daily screen, in two languages, and the build stays
green.** ⚠️ **And this is not hypothetical:** the backend spent today fixing **exactly this shape** three times —
the LINE status label (broken, found by @Tanya), the teacher's phone calendar (broken, already published), the
attention cards (still correct). **Yours is the fourth, and it is the only one on a screen somebody uses every
day.**

## §2 The change
1. **`bookingStatus: Record<BookingStatus, string>`** on **both** dictionaries.
2. **Type `th` against `en`** (`const th: typeof en = {…}`, or the equivalent shape you prefer) — **so a key
   added to one language cannot be missing from the other.** 📌 That is a second, independent failure this map
   currently permits, and it costs the same line.
🚫 **Do not change any label text**, the key order, or `t()`/dictionary lookup behaviour.
🚫 **Do not touch `BOOKING_STATUS_COLOR` or `OFF_CALENDAR_STATUSES`** — both are right.

## §3 What must not change
- 🚫 The nine labels' text, in either language.
- 🚫 Any backend file. 🚫 Any behaviour a user can see.

## Definition of Done
- [ ] Typecheck clean; **state the command** *(⚠️ `bun run lint` fails repo-wide — `next lint`, Next 16.
      Pre-existing, not yours.)*
- [ ] **Break it and watch, twice — and the control is the COMPILER, not a test:**
      **(a)** delete `PAUSED` from `en.bookingStatus` ⇒ typecheck fails ·
      **(b)** delete it from `th` only ⇒ typecheck fails
      **Paste both.** *(A test asserting nine keys would be a second copy of the list.)*
- [ ] The nine rendered labels are **byte-identical to before**, both languages — asserted, because *"no-op"* is
      a claim
- [ ] 🚫 No backend change, no visible change

## Questions
1. ⚠️ **You have TWO `BookingStatus` unions** — `types/api/contract.ts:24` (the wire) and
   `types/app/scheduler/index.ts:85` (the app). **Both complete, both hand-written.** **Should the app one derive
   from the contract one?** 📌 **I am asking, not instructing:** if they are deliberately separate — the app
   layer free to diverge from the wire — **say so and I will write it down as a decision instead of leaving it
   as a coincidence.** **If they are not, it is one line and it belongs in this task.**
2. **Is there any other map keyed by status on your side** that I did not find? I looked at colour, label and
   `OFF_CALENDAR_STATUSES`. **Name what you find; do not fix it here.**

📌 **For the record, so this reads honestly:** there is a **fifth** copy of the status list — yours on the wire —
and **it was CORRECT while the backend's own published contract was wrong.** I have deliberately **not** cut a
task for that: the list is right, and the only real fixes are cross-repo codegen or a contract test, which are
decisions about how the repos relate rather than bugs. **This task is the part that is one line and entirely
inside your repo.**

---

## Implementation Notes (Fern, 2026-09-08)

| | |
|---|---|
| Repo | `smart-scheduler-front` · `git rev-parse --short HEAD` = **`dbf21fc`** |
| Status | **REVIEW** — one `satisfies`. ⚠️ **Half of §2 was already done**; see below. Q1 and Q2 answered. |

### ⚠️ §2 item 2 already existed — `dictionaries.ts:1115` has `const th: typeof en`

Your note says *"nothing forces `th` to match `en`"*. **It does, and it has for a long time**: line 1115 is
`const th: typeof en = {…}`, and the file's own header comment says so (*"`th` must mirror its shape exactly
(enforced by `const th: typeof en`)"*). I proved it rather than trusting the comment — break (b) below is that
control firing, and it fired **before** I changed anything about `th`.

⇒ **The task was one change, not two.** Saying so because "I did both" would have been a quiet claim to work
that was already in the file, and the diff would have shown it.

### The change — one line, and `satisfies` rather than an annotation

```ts
bookingStatus: { …nine labels, untouched… } satisfies Record<BookingStatus, string>,
```

🔑 **`satisfies`, not `: Record<BookingStatus, string>` — and the difference is load-bearing.** A type
**annotation** would widen `en.bookingStatus` to `Record<BookingStatus, string>`, and then `th: typeof en` would
only require *"a record of statuses to strings"* — **so the second control would be traded away for the first**
and break (b) would stop firing. `satisfies` demands completeness **and** keeps the literal type, so both
controls hold at once. (Checked, not assumed: I ran break (b) against the finished file.)

### 🔑 The DoD's real requirement — broken twice, both outputs pasted

**(a) `PAUSED` deleted from `en.bookingStatus`:**
```
src/lib/i18n/dictionaries.ts(301,5): error TS1360: Type '{ PENDING: string; … CANCELLED: string; }'
  does not satisfy the expected type 'Record<BookingStatus, string>'.
  Property 'PAUSED' is missing … but required in type 'Record<BookingStatus, string>'.
src/lib/i18n/dictionaries.ts(1384,5): error TS2353: Object literal may only specify known properties,
  and 'PAUSED' does not exist in type '{ … CANCELLED: string; }'.
```
📌 **Two errors, and the second is the interesting one:** removing the English label also makes the *Thai* one an
excess property. The two controls compose — you cannot quietly drop a status from one side.

**(b) `PAUSED` deleted from `th` only:**
```
src/lib/i18n/dictionaries.ts(1375,3): error TS2741: Property 'PAUSED' is missing in type
  '{ PENDING: string; … CANCELLED: string; }' but required in type
  '{ PENDING: string; … CANCELLED: string; PAUSED: string; }'.
```
Both restored; `bunx tsc --noEmit` → **exit 0**.

### The labels are byte-identical — asserted, because "no-op" is a claim

`git diff -- src/lib/i18n/dictionaries.ts` on this task is **exactly**: one import line, one doc comment, and
`},` → `} satisfies Record<BookingStatus, string>,`. **No label text, no key order, no lookup behaviour.**
*(The two `PAUSED:` lines that appear in a diff against `develop` are TASK-261's, already on `HEAD`.)*

### Verified

```
bunx tsc --noEmit   → exit 0
bun test            → 131 pass / 0 fail, 287 expect(), 14 files
bun run build       → ok
```
⚠️ `bun run lint` fails repo-wide (`next lint`, Next 16) — pre-existing, untouched.
🚫 No backend change. 🚫 Nothing a user can see.

## Answers

### Q1 — the two `BookingStatus` unions: **deliberately separate. Please write it down as a decision.**

They are not a coincidence, and I would not derive one from the other:

- `types/api/contract.ts` is **"synced from `smart-scheduler-back/src/types/contract.ts` — keep in lockstep"**
  (its own first line). It describes **the wire**, and its job is to be a faithful copy of what the server sends.
- `types/app/scheduler` describes **the app's own model**, which is already deliberately *not* the wire's:
  `Booking` there is flattened (`studentName`, `teacherId`, `subject: string | null`) and `dtoToBooking` is the
  seam between them. It also carries app-only vocabulary — `OFF_CALENDAR_STATUSES`, `BOOKING_STATUS_COLOR`,
  `isDeliveredStatus` — which mean nothing to the server.

🔴 **And the record you cited is the argument for keeping them apart:** my wire copy was **right while the
backend's published contract was wrong**. If the app union derived from the wire union, that same day the app
would have inherited the error and `PAUSED` would have vanished from the colour map, the icon map and
`OFF_CALENDAR_STATUSES` — **a wrong contract would have propagated into the screen instead of being contradicted
by it.** Two hand-written lists cost one line of duplication and bought exactly one useful disagreement.
⇒ **Deliberate. My recommendation: record it as a decision**, and if the duplication ever needs closing, close it
with a **cross-repo contract test** (the two lists must agree) rather than by making one depend on the other.

### Q2 — every other status-keyed structure on my side

| Where | Shape | Verdict |
|---|---|---|
| `types/app/scheduler:96` `BOOKING_STATUS_COLOR` | `Record<BookingStatus, …>` | ✅ complete by construction |
| `components/common/BookingBadges.tsx:30` `STATUS_ICON` | `Record<BookingStatus, LucideIcon>` | ✅ **you missed this one, and it is fine** — same control |
| `lib/i18n/dictionaries.ts` `bookingStatus` | *(was)* untyped | ✅ **fixed here** |
| `types/app/scheduler:125` `OFF_CALENDAR_STATUSES` | `readonly BookingStatus[]` | ✅ correct as a **list** — it is a subset by design, so completeness would be wrong |
| `lib/scheduler/pause-booking.ts:31` `UNPAUSABLE_STATUSES` | `readonly BookingStatus[]` | ✅ same — a subset, deliberately |
| `Calendar.config.ts:5` `STATUS_LEGEND` | `BookingStatus[]` | ⚠️ **a hand-written subset with no control** — see below |
| `Modal/BookingModal.tsx:95` `MOVABLE_STATUSES` | `Booking["status"][]` | ✅ subset by design |
| `types/app/scheduler:521` `isDeliveredStatus` | `(s: string) =>` | ⚠️ takes `string`, not `BookingStatus` — see below |

🔴 **Two worth naming, neither fixed here (you said name, do not fix):**
1. **`STATUS_LEGEND`** is the same *class* as `BOOKING_TABS_LEGEND`, which I already got caught by on TASK-227:
   **a hand-written array of a union that the compiler will never complete for you.** It lists **6 of 9**
   statuses today, which is legitimate — the legend explains the common ones — **but nothing distinguishes
   "deliberately six" from "someone forgot the tenth"**, and `PAUSED` is arguably missing from it right now for
   the same reason `OTHER` was missing from the legend in TASK-227.
2. **`isDeliveredStatus(s: string)`** takes `string`, so a typo passes silently. One-word fix, not mine tonight.

📌 Both are **subset** problems, which is a genuinely harder shape than this task's: a `Record` proves
completeness, and nothing proves *"this subset is still the right subset"*. Worth its own task if you think it is
worth one — I would put `STATUS_LEGEND` first, because it is on the calendar.

## Review — Sober, 2026-09-08: ✅ **PASS. TASK-274 is DONE.** 🔻 **My §2 asked for one thing already done and specified the other in a way that would have DESTROYED it.**

**Reproduced:** `bunx tsc --noEmit` → **0** · `bun test` → **131 pass / 0 fail** ·
`dictionaries.ts:302` = `} satisfies Record<BookingStatus, string>,` · **`const th: typeof en` at `:1130`, and
the file's header comment at `:2` says so — it predates this task** · `STATUS_ICON` is a `Record<BookingStatus,…>` ·
`isDeliveredStatus = (s: string)`. 🚫 No backend change.

### 🔻 `satisfies` rather than the annotation I wrote — and my line would have traded one control for the other
> *"A type ANNOTATION would widen `en.bookingStatus` to `Record<BookingStatus, string>`, and then `th: typeof en`
> would only require 'a record of statuses to strings' — so the second control would be traded away for the
> first."*

**My §2 item 1 said, verbatim, `bookingStatus: Record<BookingStatus, string>`.** ⇒ **doing what I asked would
have silently removed the `th`-mirrors-`en` guarantee that was already in the file.** **Two mistakes in one
line:** I asked for a control that existed, and **the way I asked for the other half would have broken it.**
✅ **And she checked rather than reasoned it:** *"I ran break (b) against the finished file."*

### ✅ She said half the task was already done instead of claiming it
> *"Saying so because 'I did both' would have been a quiet claim to work that was already in the file."*

📌 **The diff would have shown it, and that is exactly why saying it matters** — a report that survives its own
diff is the only kind worth reading. **And she proved the existing control fired rather than trusting its
comment**, which is the same discipline the backend has been running on all week.

### 🔑 Break (a) produced TWO errors, and the second is the finding
Deleting `PAUSED` from `en` makes the **Thai** one an **excess property**. ⇒ **the two controls COMPOSE:** you
cannot quietly drop a status from one side, because the other side then has one too many. **That is stronger
than either control alone and neither of us designed it.**

### 🔴 Q1 — accepted, recorded as a decision, **and it changes my earlier ruling**
> *"My wire copy was RIGHT while the backend's published contract was WRONG. If the app union derived from the
> wire union, that same day the app would have inherited the error and `PAUSED` would have vanished from the
> colour map, the icon map and `OFF_CALENDAR_STATUSES` — a wrong contract would have propagated into the screen
> instead of being contradicted by it."*

**I ruled on `BookingStatus` that the only real fixes were (a) codegen from our OpenAPI or (b) a cross-repo
contract test, and I did not rank them.** ⇒ **She has ranked them, with evidence from an event that actually
happened: (a) is ACTIVELY WRONG.** **Deriving makes the client inherit the server's mistakes; two lists that must
agree makes the client able to CONTRADICT them, which is what happened and what saved the screen.**
✅ **Recorded in `SYSTEM-FACTS` as a decision:** *the two unions are deliberately separate; if the duplication is
ever closed it is closed with a contract test, never by derivation.* **This is the first time this week a
duplication has been argued FOR, and the argument is better than my rule.**

### Q2 — and you found one I missed
✅ **`STATUS_ICON` is already a `Record`** — I swept colour, label and `OFF_CALENDAR_STATUSES` and did not look at
the badge icons. **Named and correct.**
🔑 **And the distinction you drew is the one worth keeping:** *"a `Record` proves completeness, and nothing proves
this subset is still the right subset."* ⇒ **`STATUS_LEGEND` (6 of 9) and `MOVABLE_STATUSES` are a HARDER shape
than anything fixed today**, and *"nothing distinguishes 'deliberately six' from 'someone forgot the tenth'"* is
the sentence for it.
⇒ **Cut as TASK-286**, with a mechanism for the subset shape: **make it a total map to a boolean**, so a new
status must be *classified* rather than *omitted*. 📌 **`isDeliveredStatus(s: string)` rides with it — that is the
FOURTH `string` parameter this week that hid a question** (`bookingEventKind` · `veventStatus` · `t()`'s key ·
this). **You put it first; I agree, and `STATUS_LEGEND` goes first because it is on the calendar.**
