# TASK-326 — two raw time sites the sweep missed, and a lockstep file that is not in lockstep

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **NOT in the `uat` batch. NO CLOCK.** 🚫 No BE change, no type change, no migration.
🔑 **Small on purpose. Two of the three items are mine to have got wrong.**

---

## §1 Two more raw time sites — **and neither is broken today**
**I gave you FOUR. There are SIX.** 🔻 **`CalendarWeekGrid.tsx:138`** (`{b.startTime}`) and
🔴 **`CheckinContent.tsx:108`** (`` `${b.startTime}–${b.endTime ?? ""}` ``).
✅ **I checked both before writing this:** `CalendarWeekGrid` takes DTO-mapped `Booking[]`; `CheckinContent`'s
payload returns through `toBookingDTO` too ⇒ 🚫 **neither shows seconds.**
⇒ ✅ **Route them through `formatTimeDisplay` anyway, for YOUR reason:** ***a renderer that is correct only
because a mapper in another repo is correct breaks silently the day that mapper moves.***
⚠️ **`CheckinContent` is the one that matters most:** **a PUBLIC page, its own local `BookingRef` type, fetched
directly rather than through the shared DTO types.** ⇒ 🔑 **the site least protected by the mapper is the one
on a parent's phone.**
📌 **Say if the count is still wrong** — *my grep produced the list of four and it was not exhaustive.*

## §2 🔻 The lockstep file that is not — **and I have cited it twice from the wrong side**
✅ **You are right, and I verified it.** **The sentence *"As stored (`HH:mm:ss`) — the FE formats"* is at
`smart-scheduler-back/src/types/contract.ts:156`.** **The FE's `src/types/api/contract.ts` — whose FIRST LINE
reads *"Synced from smart-scheduler-back/src/types/contract.ts — keep in lockstep"* — contains no `HH:mm:ss`
at all.**
🔴 **TASK-295 and TASK-324 both cite `contract.ts:155` for a line that exists only in the other repo.**
✅ **Copy the doc comment across.** 🚫 **COMMENT ONLY.** ⚠️ **Do not change a type and do not "sync" anything
else while you are there.** 🔑 **A lockstep file that has drifted in a COMMENT is a different problem from one
that has drifted in a TYPE — and if you find the second kind, that is a finding I want, not a fix I want.**

## §3 🚫 Named, not fixed — and this is the whole of it
**`CreateCourseModal:174` renders `{b.date}` raw** where every other list uses `formatDateDisplay`.
✅ **You were right to leave it: different call, different task, and the component is unrendered.**
🔴 **`ExpiryWarningSession.startTime` typed `HhMm` while carrying `HH:mm:ss` is NOT yours** — a BE type, and
**@Jason's call whether the TYPE is wrong or the VALUE is.** 🚫 **Do not touch it.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] **Both `§1` sites use `formatTimeDisplay`** — asserted per site
- [ ] 🔑 **You say whether SIX is the right number** — *and if it is not, the new list, not a fix*
- [ ] **`§2`'s comment copied across, comment only** — 🚫 **no type touched**, asserted as an absence
- [ ] ⚠️ **Any OTHER drift you notice between the two contract files is REPORTED, not fixed**
- [ ] 🚫 No BE change — asserted

## Question
🔑 **A file whose first line says *"keep in lockstep"* had drifted, and neither repo's tests could ever have
noticed.** ⇒ ❓ **Is there anything cheap that would?** 📌 *I am not asking for a build step or a codegen
pipeline — those are proposals for a different day.* ⚠️ **I am asking whether the FE could assert something
about the file it claims to mirror at all, or whether the honest answer is that a hand-copied file can only be
kept honest by hand.** 🔑 **If it is the second, say so plainly** — **then the fix is that the comment stops
promising lockstep and says what it actually is.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-10. **Six is not the number either. It is NINE — and §2 could not be done as written without making the comment false.**

```
bunx tsc --noEmit → exit 0
bun test          →  227 pass / 0 fail   (+5)
bun run build     → ok
```
🚫 No BE change · no type change · no migration.

### §1 ✅ Both sites routed — and the count is **NINE**, not six
`CalendarWeekGrid:138` and `CheckinContent:108` now use `formatTimeDisplay`, for the reason you quoted back.
✅ `CheckinContent` also loses its own `?? ""` — **the helper's contract absorbs it**, so the empty-case
fallback lives in one place instead of two.

🔻 **Three more raw time renders that BOTH our greps missed:**
| | why the grep could not see it |
|---|---|
| 🔴 `BookingModal.tsx:427` | `<Field value={\`${booking.startTime} - ${booking.endTime}\`} />` — **a prop, not a JSX interpolation.** The booking DETAIL view. |
| 🔴 `BookingModal.tsx:669` | `t("calendar.pausedOriginalSlot", { time: booking.startTime })` — **an i18n interpolation object.** |
| 🔴 `PausedTray.tsx:181` | the same key, same shape. |

🔑 **That is WHY the count kept moving: three of the nine are not `{b.startTime}` at all.** They are a `value=`
prop and two i18n argument objects, and no grep for the rendering shape finds them.
⚠️ **And the last two are the asymmetry in one expression:** they pass `date: formatDateDisplay(b.date)` and
`time: b.startTime` **on adjacent lines** — the date got the helper, the time did not, in the same call.
🚫 **Not fixed — the DoD says the list, not a fix.** ✅ All three take DTO-mapped bookings, so none shows
seconds today; they are the same "correct only because a mapper is correct" case as the two I did route.

### §2 🔻 The comment could NOT go where you said, and putting it there would have made it FALSE
✅ **You are right that the sentence is at `smart-scheduler-back/src/types/contract.ts:156`.** ⚠️ **What it
documents is `PlanSessionRow.startTime` — and the FE's `types/api/contract.ts` has no `PlanSessionRow` at all.**
🔴 **The only `startTime` in the FE's contract copy is `BookingDTO`'s — and that one IS `hhmm()`-mapped
(`db/mappers.ts:123`).** ⇒ **pasting *"As stored (`HH:mm:ss`)"* there would have been a lie in the exact place
we have spent the week removing lies.**

✅ **So it went onto the field it is actually about: `PlanSession.startTime` in `types/app/scheduler/index.ts`**
— the FE's name for that row — quoted verbatim, attributed to the BE line, and saying why it is not in the
contract copy. **Comment only; the field is still `string`, asserted.**
🔻 **And it replaced a stale annotation: that field read `startTime: string; // HH:mm`, which was FALSE** — the
plan row arrives with seconds, which is the whole of TASK-295 and TASK-324.

### 🔑 The other three `// HH:mm` annotations — checked, and all TRUE
`Booking` and `RescheduleTarget` are `hhmm()`-mapped (`db/mappers.ts:123`/`:183`); `CoursePackage.startTime` is
never on the wire at all (`mappers.ts:82` sets a client-side `"09:00"`).
⇒ 🔑 **The annotations were an accurate map of which payloads are normalised. The one that lied is exactly the
one payload that is not mapped.** *(I found this because my assertion failed on all three — twice narrowed, both
narrowings forced by running it.)*

### ⚠️ Other drift between the two contract files — REPORTED, as asked, and it is NOT one comment
**The files are not in lockstep at the TYPE level either:**
- **9 exports exist only on the BE**, including **`PlanSessionRow`** — the very type §2's comment belongs to —
  plus `BookingDiscount` and five request types.
- **17 exist only on the FE**, including `ExpiryWarning`, `ExpiryWarningSession`, `ResumeCourseResponse`,
  `PostedSale`, `Paged`, `CourseListItem` and the badge family.
🔑 **So the FE copy is not a drifted mirror; it is partly an independent file that says it is a mirror.**

### 🔴 And that corrects §3 — **`ExpiryWarningSession` is NOT a BE type, so it is not @Jason's**
You are holding *"`ExpiryWarningSession.startTime` typed `HhMm` carrying `HH:mm:ss`"* for @Jason as a BE type.
⚠️ **The BE has no such type.** Its equivalent is `ExpiryCandidate` in `lib/course-expiry-impact.ts:39`, and it
declares **`startTime?: string | null` — honest.** **`HhMm` is our claim, written on our side, in
`src/types/api/contract.ts`.**
⇒ ✅ **The value is not wrong; our TYPE is.** 🚫 **I did not touch it — §2 forbids a type change and I would
rather you re-route it than have me quietly widen scope** — but **you are waiting on the wrong person**, and
@Jason may reasonably answer *"nothing here is mine."* 📌 The BE-side option still exists (add `hhmm()` in
`expiryDecision`'s `candidates` map) — that is a *choice*, not a correction of a BE defect.

### Definition of Done
- [x] `bun test` **227 / 0** · `bunx tsc --noEmit` exit 0
- [x] Both §1 sites use `formatTimeDisplay` — asserted per site
- [x] 🔑 **SIX is not right — it is NINE**, with the new list and why the greps missed three
- [x] §2's comment copied across, **comment only** — 🚫 no type touched, asserted; ⚠️ **and placed where it is
      true rather than where it was asked for, with the reason**
- [x] ⚠️ **Other drift REPORTED** — 9 BE-only and 17 FE-only exports, plus the §3 correction
- [x] 🚫 No BE change — asserted
- [x] 🔑 Break-and-watch — restored, **line read back**

## Question — **can the FE assert anything about the file it claims to mirror?**

🔻 **Honest answer: no, not usefully — and the reason is not the one I expected.**

**I could make the FE read the sibling checkout by relative path and diff the two.** ⚠️ **I would not ship it:**
it breaks for anyone whose two repos are not siblings, it is green-by-absence on a machine where the path is
missing (**the worst failure mode — a check that passes because it found nothing**), and it makes the FE test
suite depend on a checkout it does not own.

🔑 **But the deeper reason is what this task found: the file is not a mirror.** **17 of its exports have no BE
counterpart at all.** ⇒ **a diff would report 26 differences, 17 of which are correct**, and an allow-list of
17 entries maintained by hand is the same hand-copying problem wearing a test.
⇒ ✅ **So: a hand-copied file can only be kept honest by hand, and this one is not even hand-copied — it is
hand-WRITTEN, with a header that claims otherwise.**

📌 **Then your own conclusion is the right one, and it is cheaper than any check: the comment should stop
promising lockstep and say what the file actually is** — *"the shapes this FE expects from the API; mirrors
`smart-scheduler-back/src/types/contract.ts` where a type exists there, and declares FE-only response shapes
where it does not."* 🔑 **That sentence would have made this task unnecessary**, because nobody would have cited
it as a source of truth — **including me, twice.**
🚫 **Not written: changing that header is a decision about what the file IS, and it is yours.**
