# TASK-324 — `15:00:00`: there is no formatter for a time a human reads, and the date has one

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **Batch item 7 — the LAST item in the owner's `uat` batch.** ⏱️ **After TASK-321.** 🚫 No BE change, no
contract change, no migration.
🔑 **@Porter asked: *"is there ONE formatter for a time a human reads?"*. I counted before writing this. The
answer is NO — and the shape of the no is the task.**

---

## §1 The count, which is the finding
| | |
|---|---|
| **sites rendering a raw `startTime` / `endTime`** | 🔴 **four** — `ExpiryWarningAlert.tsx:54` · `EditExpiryDialog.tsx:205` · `BookingsTable.tsx:369` · `CreateCourseModal.tsx:174` |
| **sites doing `.slice(0, 5)` inline** | **three** *(TASK-295's)* |
| **a shared time formatter** | 🔴 **none** |
| **a shared DATE formatter** | ✅ **`formatDateDisplay`, `src/lib/ui/format.ts`** |

🔑 **That last row is the whole explanation.** **Dates got a function, times never did** ⇒ **every time display
is a local decision, and four of the seven decided nothing.** 📌 *The owner has now reported this FOUR times
this week, on four different screens, and each report looked like a one-line bug.*
⇒ ✅ **So: `formatTimeDisplay` beside `formatDateDisplay`, and the seven sites use it.**

## §2 What I am NOT asking for
🚫 **Not a sweep of every string in the app.** 🚫 **Not a change to what the API sends** — ⚠️ **`contract.ts:155`
documents `HH:mm:ss` and names the FRONT END as the formatter. That is the contract and it stays.**
🚫 **Not `TIME_SLOTS` / `Select` VALUES** — 🔑 **a `Select`'s value is a KEY, not a display**, and TASK-295 was
about the label it shows, not the value it holds. ⚠️ **`PlanModal.tsx:832`'s comment says `seed.startTime` is
`"17:00:00"` and feeds `TIME_SLOTS` deliberately — do not "fix" that.**
📌 **If a site turns out to need the seconds, leave it and SAY SO** — *a list of four that becomes three with a
reason is a better answer than four silent edits.*

## §3 The thing worth deciding
❓ **Does `formatTimeDisplay` take a range?** **Three of the four sites render `start`–`end`, with three
different dashes between them** (`-`, `–`, ` · `). ⚠️ **I am not asking you to unify the punctuation** —
🔑 **but say whether the helper formats ONE time or a RANGE, because if it is one time then the dash stays a
local decision and the next reader will ask this again.**
📌 *My reading: one time. The separator is layout and belongs to the screen. But you own this.*

## §4 What must not change
- 🚫 The API contract · `TIME_SLOTS` · any `Select` value · `formatDateDisplay` itself.
- 🚫 TASK-295's three sites keep behaving identically — ✅ **they may route through the helper, but the OUTPUT
  is byte-identical**, asserted.
- 🚫 No BE change, no new dependency.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] ✅ **`formatTimeDisplay` exists beside `formatDateDisplay`** and 🔴 **all four raw sites use it** —
      asserted per site, ⚠️ *not by a file-wide "no raw startTime" ban, which would fail on the `Select` values*
- [ ] **TASK-295's three sites are byte-identical in output** — asserted
- [ ] 🔑 **`§3` answered** — one time or a range, and why
- [ ] **Any site you deliberately left raw is NAMED with its reason**
- [ ] 🔑 **Break it and watch** — restore verified by READING the line
- [ ] 🚫 No BE or contract change — asserted as an absence

## Question
🔑 **@Jason's tell from an hour ago — *count the call sites; a copy item is a scope decision exactly when the
string is SHARED* — is what found this.** ⚠️ **But it needed a variant: there was no shared string to count,
so I counted the sites that should have shared one and did not.**
⇒ ❓ **Is "a formatter that exists for one type and not its sibling" a shape you can see elsewhere in this
repo?** 📌 *Dates have `formatDateDisplay`; times have nothing. Money? Durations? Counts?* 🚫 **Name them, do
not fix them** — 🔑 **and if the honest answer is that this is the only pair, that is worth knowing too,
because it would mean the four reports were one defect and not the start of a class.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-10. **`formatTimeDisplay` exists. And your count of four is really two — the other two were never broken.**

```
bunx tsc --noEmit → exit 0
bun test          →  222 pass / 0 fail   (+10, one new file)
bun run build     → ok
```
🚫 No BE change · no contract change · no migration · no new dependency.

### The helper
`src/lib/ui/format.ts`, beside `formatDateDisplay`:
```ts
export const formatTimeDisplay = (time: string | null | undefined): string => (time ? time.slice(0, 5) : "");
```
🚫 **A trim, not a parse — and that is load-bearing.** A `dayjs` parse would "improve" a malformed value and
**silently change what the three already-correct `.slice(0, 5)` sites render.** ⇒ byte-identical by
construction, asserted against the exact expression they used to hold (`"9:0"`, `"garbage"` included).
✅ Absent → `""`, the same contract `formatDateDisplay` keeps.

### §3 ANSWERED — **ONE time, not a range.** Your reading, and two reasons of my own
1. **One site has no `endTime` to pair** (`ExpiryWarningAlert` renders a lone `startTime`) ⇒ a range helper
   needs an optional second argument, i.e. **two shapes in one function.**
2. **The separator is genuinely different per screen** — a table cell (`-`), an inline list (`–`), a chip
   (` · `) — so the helper would have to take the dash as a parameter, **and then it is formatting something
   that is not a time.**
⇒ **the dash stays a local decision, and the doc comment says so** so the next reader does not re-ask.

### 🔻 §1's count — **four raw sites, but only TWO could ever have shown seconds**
I checked which payload each one actually receives before changing them:
| site | receives | was it showing `15:00:00`? |
|---|---|---|
| `ExpiryWarningAlert:54` | the expiry DTO | 🔴 **YES** — `expiryDecision`'s `candidates` map is `startTime: r.startTime`, **raw; no `hhmm()` anywhere on that path** |
| `EditExpiryDialog:205` | **the same DTO** | 🔴 **YES** — and it is the same list, rendered before the save instead of after |
| `BookingsTable:369` | `dtoToBooking` | ✅ **No** — `toBookingDTO` applies `hhmm()` (`db/mappers.ts:123`) |
| `CreateCourseModal:174` | `POST /courses` bookings | ✅ **No** — same mapper. ⚠️ **And this component has no renderer at all** (TASK-322 §3) |

🔑 **So the defect is ONE payload with TWO renderers, not four screens** — which is also why it looked like four
separate one-line bugs: *the same list appears twice, once before a save and once after.*
✅ **I routed all four through the helper anyway**, and the reason for the two that were fine is worth stating:
**a renderer that is correct only because a mapper in another repo is correct is one that breaks silently the
day that mapper moves.** 🚫 Nothing else changed at those two sites.

### 🔴 Reported, not fixed — three
1. **`ExpiryWarningSession.startTime` is typed `HhMm` and carries `HH:mm:ss`.** The contract type is a lie on
   that field. ⇒ **the honest fix is `hhmm()` in `expiryDecision`'s `candidates` map — one line, backend** —
   but you said no BE change, and it is @Jason's call whether the type or the value is wrong.
2. 🔻 **The sentence we have all been citing is not in the file we cite.** *"As stored (`HH:mm:ss`) — the FE
   formats"* is at **`smart-scheduler-back/src/types/contract.ts:156`**. The FE's `src/types/api/contract.ts`
   — **whose own first line says *"Synced … keep in lockstep"*** — never received it. **TASK-295 and this task
   both cite "contract.ts:155" for a line that exists only on the other side.** ⚠️ Found while writing an
   assertion against it. **The agreement is real; only its FE copy is missing.**
3. **`CreateCourseModal:174` renders `{b.date}` raw** where every other list uses `formatDateDisplay` — a
   date-side instance in the very line I was fixing. **Not touched:** different call, different task, and the
   component is unrendered.

### The pin TASK-295 left on those three sites — UPDATED, not deleted
It read `startTime.slice(0, 5)` × 3. **The mechanism moved; the property did not**, so it now asserts three
`formatTimeDisplay(…)` sites **and** that no inline slice survives — with the byte-identical guarantee asserted
separately. ⚠️ **Updated because a task changed the mechanism, which is the correct reason.**

### 🔑 Break it and watch — restored, and the restore READ back
Reverted `ExpiryWarningAlert` to `${s.startTime}` ⇒ its per-site assertion failed, naming the file. ✅ Restored;
line 57 read back as `${formatTimeDisplay(s.startTime)}`. Suite green after.

### Definition of Done
- [x] `bun test` **222 / 0** · `bunx tsc --noEmit` exit 0
- [x] ✅ `formatTimeDisplay` beside `formatDateDisplay`; **all four sites use it — asserted PER SITE**, not by a
      file-wide ban (which would have failed on the `Select` values, and I assert those are untouched)
- [x] TASK-295's three sites **byte-identical in output** — asserted against the old expression itself
- [x] 🔑 §3 answered — **one time**, with reasons
- [x] **Sites left raw are named** — the `Select` VALUE (a key, not a display) and `CreateCourseModal`'s `{b.date}`
- [x] 🔑 Break-and-watch — restored, **read back**
- [x] 🚫 No BE or contract change — asserted

## Question — **is "a formatter for one type but not its sibling" visible elsewhere?**

🔴 **Yes, and MONEY is a worse instance than time was.** Not the only pair ⇒ **this is a class.**

**There are three states in this repo, not two:**
| type | state |
|---|---|
| **date** | ✅ one formatter (`formatDateDisplay`), used everywhere |
| **time** | 🔴 **no formatter** — seven local decisions (this task) |
| **money** | 🟡 **a formatter EXISTS *and* four local copies coexist** |

🔑 **Money is worse precisely because the shared one exists.** `formatPriceMinor` is used by the price/discount
paths — **and four other surfaces roll their own satang→baht**:
`FreelanceBudgetStrip.tsx:11` and `FreelanceBudgetControls.tsx:13` hold the **identical line**
(`(satang / 100).toLocaleString("th-TH")`), plus `TeacherRowActions:36` and `TeachersContent:41`.
🔻 **And the repo has already written down that this must not happen.** `money-display.test.ts`'s own header
says `formatPriceMinor` is *"the repo's ONE converter rather than a second one written beside the dialog"* —
**and it is pinned there because a 100× unit defect shipped on this exact boundary** (TASK-169: `391` took ฿3.91
off instead of ฿391, found by @Tanya, not by the compiler).
⚠️ **A wrong time is embarrassing. A wrong magnitude of money is actionable** — and the local copies are in the
FREELANCE BUDGET surfaces, which is where a wrong number gets a teacher booked or refused.
🚫 **Named, not fixed** — and it needs a judgement I should not make alone: **a budget strip may legitimately
want different formatting from a price**, in which case the answer is a second NAMED formatter, not reuse.

✅ **Checked and clean:** durations (`hoursLeft` / `{hours}h` are interpolated counts, not formatted values) and
counts (plain numbers). **No third gap found.**
