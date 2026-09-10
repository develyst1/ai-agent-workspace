# TASK-319 — `Ends` is the wrong word, and the slot it names also receives a NON-DATE

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **Batch item 8a — the ONE front-end item in the owner's `uat` batch.** ⏱️ **No clock; `uat` waits for the
whole batch.** 🚫 No BE change, no API change, no new component.
🔑 **It is one word. Read `§2` before you decide it is one word.**

---

## §1 What was asked
**@Porter, from the round he walked with the owner: `Ends` → `Last session` in the plan modal.**
📌 **The reason, and it is the reason the word is wrong rather than merely plain:** ⚠️ **a course has TWO
end-ish dates and they are not the same thing** — **the last SESSION** (`plan.liveEndDate`, derived from the
live plan) and **the EXPIRY** (`expiryDate`, a CEILING — TASK-282 §7 and the whole `§12` argument).
⇒ 🔑 **`Ends` names neither of them unambiguously, and it sits in a modal that shows both.**
**`Last session` says which one it is.** 🚫 **So do not treat this as a wording preference — it is a
disambiguation, and that is what decides the Thai below.**

## §2 🔴 The part that is NOT one word — the same slot also renders a non-date
`dictionaries.ts:643` — **`endsOn: "Ends {date}"`** — and `PlanModal.tsx:586`:
```ts
const end = plan.liveEndDate ? dayjs(plan.liveEndDate).format("D MMM YY") : t("plan.noLiveEnd");
```
🔴 **`{date}` receives `noLiveEnd` — *"no live sessions"* — when there is no live plan.**
⇒ **today that reads `Ends no live sessions`.** ⚠️ **Rename the label and it reads `Last session no live
sessions`, which is worse: the old one was clumsy, the new one repeats a word and reads like a broken
template.**
📌 **This is already on the record and was already scoped out once:** `dialog-labels.test.ts:73` says
*"Only the paused case was ruled on. A completed or never-started plan still reads 'Ends no live sessions'"*.
🔑 **TASK-293 §2 solved exactly this shape for the PAUSED course** — it gave it **its own sentence**
(`pausedNoEnd`) instead of pouring a non-date into a date slot — **and deliberately left the other two cases.**
⇒ ✅ **The pattern to follow already exists in this file, by the same author, for the same reason.**
⚠️ **I am not ordering the second half. I am telling you it is in front of you and asking you to DECIDE it and
say which you did:**
1. ✅ **rename only** — and *"Last session no live sessions"* ships, or
2. ✅ **rename, and give the no-live-plan case its own sentence** the way `pausedNoEnd` does.
🔑 **If you pick 1, say why the repetition is acceptable.** 📌 *Either answer is defensible; an unnoticed one
is not.* 🚫 **Do NOT change `deriveLiveEndDate` or `liveEndDate` — TASK-293 established the VALUE is right and
the LABEL is what outlived it. That holds here.**

## §3 The Thai moves too, and `§1` is why
**`dictionaries.ts:1740` — `endsOn: "สิ้นสุด {date}"`.** 🔴 **Thai carries the SAME ambiguity** — *สิ้นสุด*
against *วันหมดอายุ* is the same two-dates problem in the same modal. ⇒ ✅ **it moves to the session word
(`คาบสุดท้าย {date}` or your better one — you write the Thai, I do not).**
🚫 **Leaving Thai as `สิ้นสุด` would fix the ambiguity for one language only** — 📌 **and this modal is a STAFF
screen, where the owner and the admins work in Thai.** ⇒ **the language that needed it most would be the one
left behind.**
⚠️ **This is NOT the `§4`/`§18` LINE-label rule** (English labels on notifications). **That governs messages to
customers. This is the admin app and it is bilingual by design** — 🔑 *do not carry a notification rule across
into the staff UI; that carry is the exact mistake that has cost us twice this week.*

## §4 What must not change
- 🚫 `pausedNoEnd` and TASK-293 §2's paused branch — **byte-identical**, asserted.
- 🚫 The expiry's own label and value · `plan.size` · `plan.leave` · the ENDED-course branch (REQ-036).
- 🚫 No BE change · no contract change · no new dictionary key **unless** you choose `§2` option 2, in which
  case the new key is expected and you say so.

## Definition of Done
- [ ] `bun test` / the FE suite all pass, **state the count** · typecheck clean, **say which command**
- [ ] **`Ends {date}` → the session wording, EN and TH**, and 🔑 **the pinned label assertions in
      `dialog-labels.test.ts` are UPDATED, not deleted** — ⚠️ *a pin that changes because a requirement changed
      is correct; one deleted because it failed is the class we keep finding*
- [ ] 🔴 **`§2` DECIDED and stated** — and if you took option 2, **the no-live-plan case is asserted with the
      new sentence and `Last session no live sessions` is asserted as ABSENT**
- [ ] **The PAUSED course still reads `pausedNoEnd`** — asserted, *so this rename cannot quietly re-open
      TASK-293*
- [ ] 🔑 **Break it and watch** — ⚠️ **verify the restore by READING the line**, not by the exit code of the
      script that wrote it *(@Jason's, and it caught a real silent `sed` failure yesterday)*
- [ ] 🚫 No BE or contract change — asserted as an absence

## Question
🔑 **`Ends` was not wrong when it was written — it became wrong when the modal grew a second date.**
⇒ ❓ **Are there other labels in this app that were unambiguous when written and are not any more, because the
SCREEN around them gained something?** ⚠️ **I am not asking for a sweep or a fix — name them if you see them.**
📌 *@Jason reached the general form of this from the other side yesterday:* ***a label is at risk exactly when
it names an attribute that is CONSTANT across the set it is displayed in.*** 🔑 **Yours is its twin: a label is
at risk when the CONTEXT around it gains a second candidate for the thing it names.** **If you think that
framing is wrong for the front end, say so — the front end has more screens with two of everything than the
notifications do, and you would know before I would.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-10. **Renamed, and I took option 2.**

```
bunx tsc --noEmit → exit 0
bun test          →  196 pass
                       0 fail      (+4 for this task)
bun run build     → ok
```
🚫 No BE change · no contract change.

### §1 — the label, both languages
`plan.endsOn`: **`Ends {date}` → `Last session {date}`** · **`สิ้นสุด {date}` → `คาบสุดท้าย {date}`**
✅ **Your framing is right and the Thai had to move for the reason you gave**: *สิ้นสุด* against *วันหมดอายุ* is
the same two-dates ambiguity, on a **staff** screen worked in Thai — leaving it would have fixed the language
that needed it least. ✅ And agreed that the `§4`/`§18` English-label rule governs LINE messages to customers,
not the admin app.

### §2 DECIDED — **option 2.** The no-live-plan case gets its own sentence
New key **`plan.noUpcomingSession`** — *"No upcoming sessions"* / *"ไม่มีคาบที่กำลังจะถึง"* — and
`SummaryBar`'s date is now **`string | null`**, so a non-date cannot enter the `{date}` slot at all.

**Why not option 1:** the rename's entire purpose is disambiguation, and `Last session no live sessions` would
have shipped a repeated word and a broken-looking template **in the name of clarity** — worse than the clumsy
string it replaced, which is your own reading and I agree with it.
🔑 **And the deciding fact is one you left me to find: `noLiveEnd` has a SECOND caller.** `PlanDiffConfirm`
(`PlanModal.tsx:1180`) pours it into `plan.diffSummary` — *"{appended} added · {cancelled} removed · ends
{end}"*. ⇒ **the string could not simply be retired, and the header had to stop using it rather than the string
change meaning under a second reader.** *(See the Question — that line is now the odd one out.)*
📌 **Wording chosen to be true of every remaining case** — completed, expired, nothing scheduled yet, a voucher
with no live rows — **rather than claiming which one it is.** The old `noLiveEnd` had to serve all of them too;
the difference is that this one is a sentence in its own right instead of a fragment in a date slot.
🚫 `deriveLiveEndDate`, `liveEndDate` and the value untouched — **TASK-293 established the VALUE is right and
the LABEL is what outlived it, and that still holds.** 🚫 Still a label, not a control: asserted that the header
has no `onClick` and no `UnstyledButton`, **because editing a derivation is what TASK-282 exists to protect.**

### The pins were UPDATED, not deleted
`dialog-labels.test.ts`'s `noLiveEnd` pin used to read *"a completed or never-started plan still reads `Ends no
live sessions` — named in the task, deliberately not changed."* **You have now ruled on those cases**, so the
pin says so and asserts the new sentence beside it. ⚠️ **Updated because the requirement changed — which is the
correct reason, and not the class we keep finding.** The PAUSED branch is asserted **byte-identical** in both
languages, so this rename cannot quietly re-open TASK-293.

### 🔑 Break it and watch — restored, and the restore READ back
Put `t("plan.noLiveEnd")` back into the date slot ⇒ the §2 assertion failed, naming it. ✅ **Restore verified by
READING the line:** `PlanModal.tsx:597` reads `… .format("D MMM YY") : null;`. Suite green after.

### ⚠️ One assertion of mine was too broad, and I caught it by running it
I first wrote `expect(modal).not.toMatch(/liveEndDate\s*\?\?/)` file-wide. **It failed on `createPreviewLine`,
where `plan?.liveEndDate ?? liveSessions.at(-1)?.date` is CORRECT** — create mode, every row live by
construction. Scoped to the header, with the reason written at the assertion. 📌 **Same shape as the string
traps: a ban wider than the rule it protects.**

### Definition of Done
- [x] `bun test` **196 / 0** · `bunx tsc --noEmit` exit 0
- [x] EN + TH renamed · **pins UPDATED, not deleted**
- [x] 🔴 §2 decided and stated — **option 2**, and `Last session no live sessions` asserted as unreachable
      (the header cannot contain `noLiveEnd`)
- [x] The PAUSED course still reads `pausedNoEnd` — asserted, both languages
- [x] 🔑 Break-and-watch — restored, **read back**
- [x] 🚫 No BE or contract change

## Question — **labels that were unambiguous when written and are not now**

✅ **Your framing is right, and I would sharpen it for the front end rather than replace it.** @Jason's form —
*a label is at risk when it names an attribute CONSTANT across the set it is displayed in* — and yours —
*when the context gains a second candidate* — are both about ONE screen. 🔑 **This defect crossed two.** The
owner conflated the course card's `expires` with the plan modal's `Ends`; **nothing on either screen changed
its own context.** ⇒ **on the front end the risk arrives when the user's PATH gains a second candidate, not
when a screen does** — and a path is exactly what no component's tests can see.

**Named, nothing changed:**
| label | why it is at risk |
|---|---|
| 🔴 **`plan.diffSummary`** — *"… · ends {end}"* (`:717`, TH `จบ {end}`) | **The rename made this the odd one out INSIDE the same modal**: the header now says `Last session`, this line still says `ends`. **And it is the THIRD instance of a non-date in a date slot** — it renders `noLiveEnd` the same way the header used to. ⇒ **the strongest candidate, and it is the one this task created.** |
| 🟡 **`noUpcomingSession` · `noLiveEnd` · `noSessions`** | **Three near-identical English strings for three different facts** — and in Thai `noLiveEnd` and `noSessions` are **already the same string** (`ยังไม่มีคาบ`), which is **TASK-294**, open and mine. ⚠️ **My new key is distinct in BOTH languages, so it does not worsen the collision — but TASK-294 now has three siblings to rule on, not two.** I would rather say that than let it be discovered. |
| 🟡 **`calendar.noSessions`** — *"No sessions today"* | A fourth in the same family, different block. Unambiguous today; listed so the TASK-294 sweep sees the whole set. |
| ✅ **`course.expiresOn`** (TASK-311) | **Checked, and it is fine** — it names the ceiling explicitly and is now the only clickable date. |

🚫 **I did not pad this.** The only one I would act on is `diffSummary`, and only because **this task made it
inconsistent** — it was defensible an hour ago.
