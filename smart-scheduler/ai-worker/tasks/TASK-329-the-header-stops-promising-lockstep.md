# TASK-329 — the header stops promising lockstep, and the last three time sites

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
⚪ **NO CLOCK. Not in the batch.** ✅ **Every item here is INVISIBLE on screen** — a comment, a type, and three
renders whose output does not change — 🔑 **which is why it may land while @Tanya is on `uat`.**
🚫 No BE change, no migration, no behaviour change. **Source: your TASK-326 report, three of its findings.**

---

## §1 ✅ THE DECISION YOU ASKED ME FOR — the header changes, and your sentence is the one to use
**You were right not to write it: what that file IS is my call.** ✅ **Here it is.**
🔴 **`src/types/api/contract.ts` will stop saying *"Synced from … keep in lockstep"*.** ⚠️ **It is not a mirror
and has not been one: 17 of its exports have no BE counterpart.** 🔑 ***A header that claims to be generated
from somewhere else invites everyone to cite it as a source of truth — and it is what made ME cite it twice
for a line that lives in the other repo.***
✅ **Use your own wording, which is better than mine:**
> *"The shapes this FE expects from the API. Mirrors `smart-scheduler-back/src/types/contract.ts` where a type
> exists there, and declares FE-only response shapes where it does not."*
📌 **Add one clause I want in it: *"a type here is this repo's CLAIM about the wire, not the BE's
declaration"*** — 🔑 **because that is exactly the distinction `§2` below turns out to need.**
🚫 **Comment only. No type moves, nothing is deleted, and nothing is "synced" while you are in there.**

## §2 🔻 `ExpiryWarningSession.startTime` — you corrected my routing and it is YOURS
✅ **I held it for @Jason as a BE type. It is not one — the BE has ZERO `ExpiryWarningSession`, and its
equivalent `ExpiryCandidate` declares `startTime?: string | null`, which is honest.** **I verified both.**
⇒ 🔑 **`HhMm` is OUR claim, written on our side, about a payload nothing normalises.** ⇒ **the VALUE is not
wrong; the TYPE is.**
✅ **Fix the type here.** 🚫 **Do NOT ask the BE to add `hhmm()` to `expiryDecision`'s candidates map** —
⚠️ *that is a CHOICE about the wire, not a correction, and it belongs to a conversation nobody has had.*
📌 **`formatTimeDisplay` already makes the render correct whatever the type says; this is about the type
telling the truth.**

## §3 The last three raw sites — the ones no grep for a render shape could find
| | why it hid |
|---|---|
| `BookingModal.tsx:427` | a **`value=` prop**, not a JSX interpolation |
| `BookingModal.tsx:669` | an **i18n argument object** (`{ time: booking.startTime }`) |
| `PausedTray.tsx:181` | the same key, the same shape |
✅ **Route all three, for the reason you have now given twice:** *a renderer that is correct only because a
mapper in another repo is correct breaks silently the day that mapper moves.*
🔴 **And `:669` / `PausedTray` are the finding in one expression: they pass `date: formatDateDisplay(b.date)`
and `time: b.startTime` on ADJACENT LINES.** 🔑 **The date got the helper and the time did not, in the same
call — that is the whole of TASK-324 visible in two lines, and it is worth a comment beside the fix.**

## §4 What must not change
- 🚫 Any TYPE in `contract.ts` · the 17 FE-only exports · the three `// HH:mm` annotations you verified TRUE
  (`Booking`, `RescheduleTarget`, `CoursePackage`).
- 🚫 `formatTimeDisplay` itself · `TIME_SLOTS` / any `Select` VALUE · `formatDateDisplay`.
- 🚫 No BE change · no migration · **nothing a tester can see.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] **The header no longer promises lockstep**, and carries the CLAIM clause — 🚫 **comment only**, asserted
- [ ] **`ExpiryWarningSession.startTime` tells the truth** — ⚠️ *and say what you widened it to and why that is
      honest rather than merely looser*
- [ ] **All three `§3` sites use `formatTimeDisplay`** — asserted per site
- [ ] 🔑 **NINE is the number, or you tell me it is not** — *the count has moved three times and twice it was my
      grep that was wrong*
- [ ] 🔑 **Nothing renders differently** — ⚠️ **asserted, because that is what makes this safe under @Tanya**
- [ ] 🔑 **Break it and watch** — **mutation and restore in ONE tool call**, restore verified byte-identical
      *(@Jason's, and it exists because a commit landed inside his window)*

## Question
🔑 **Your answer to the last one was that a hand-written file cannot be checked against a file it does not
mirror, and the fix is to stop claiming it does.** ✅ **I agree, and it generalises further than that file.**
⇒ ❓ **What ELSE in this repo carries a header claiming a relationship it does not have?** 📌 *"Generated",
"synced", "mirrors", "do not edit", "keep in step with" — any promise that a HUMAN is responsible for keeping
and no test enforces.*
⚠️ **Name them; change nothing.** 🔑 **A false claim of automation is worse than no claim, because it converts
a file people would check by hand into one they trust by default** — **which is precisely how I came to cite
that line twice without opening the file it was supposed to mirror.**

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-10. **All three sections. And the count is ELEVEN — the last two are the same shape as the three you just named.**

```
bunx tsc --noEmit → exit 0
bun test          →  234 pass / 0 fail   (+7)
bun run build     → ok
git status        →  4 files, all invisible on screen
```
🚫 No BE change · no migration · **no behaviour change.**

### §1 ✅ The header stops promising
Your wording, plus the clause you asked for. It now also **names the two facts that made the old claim false**
— 17 FE-only exports, 9 BE-only including `PlanSessionRow` — **and that the citation happened twice**, so the
next reader does not have to re-derive any of it. 🚫 Comment only; every export and the three verified-TRUE
`// HH:mm` annotations untouched, asserted.

### §2 ✅ The type stops claiming — **and what I widened it to is `string`, which is not looser**
`startTime?: HhMm | null` → **`startTime?: string | null`**, matching the BE's `ExpiryCandidate` exactly.
🔑 **Why that is honest rather than merely looser, since you asked:** `HhMm` is `type HhMm = string`. **The
compiler saw no difference either way — the alias was a LABEL, not a constraint.** ⇒ nothing tightens, nothing
widens, **no call site changes, and no guarantee is lost, because there was never a guarantee — only a claim.**
📌 The render was already correct via `formatTimeDisplay`; this is the type telling the truth.
🚫 Did not ask the BE for `hhmm()` in that map — a CHOICE about the wire, not a correction.

### §3 ✅ All three routed — and `:669` / `PausedTray` got the comment you asked for
Both carried `date: formatDateDisplay(b.date)` and `time: b.startTime` **on adjacent lines**, and the fix now
says so at the site. ✅ Asserted **structurally**, not just by presence: the two keys must appear formatted, in
that order, in the same call.

### 🔻 ELEVEN, not nine — **and the two new ones are the shape you just named**
| | shape |
|---|---|
| 🔴 `CancelBookingDialog.tsx:80` | `t("cancelBooking.line", { …, time: booking?.startTime ?? "—" })` |
| 🔴 `BookingModal.tsx:1140` | `t("booking.blockedDesc", { …, time: blocked.startTime })` |

**Both are i18n ARGUMENT OBJECTS — identical to `:669` and `PausedTray:181`.** 🔑 **The count has moved four
times, and every miss after the first has been the same shape.** ⇒ **the blind spot is not the count, it is that
we keep sweeping for a RENDER when three of the eleven are a `value=` prop and five are a `t()` argument key.**
🚫 **Not fixed — the DoD asked for the number.** Neither shows seconds (both take DTO bookings).
📌 **The durable answer is a sweep by SHAPE**: *a `time:` key inside a `t()` argument object whose value is a
DTO field*. **I did not build it** — TASK-322 taught me a check must first be proven against the defect it
claims, and that proof belongs in its own task, not smuggled into this one.

✅ **Checked and NOT in class:** `CalendarContent:99` (`time:` as a slot KEY into state, not a render) and
`BookingModal:776` (`description: \`${date} ${startTime}\`` — component state from a `Select`, already a slot
value, not a DTO field).

### 🔑 Nothing renders differently — asserted, which is what makes this safe under @Tanya
Every site touched receives `toBookingDTO`'s `hhmm()` output, and `formatTimeDisplay` is a `slice(0, 5)` ⇒
**on an `HH:mm` input it is the IDENTITY**, asserted for `09:00 · 17:30 · 23:59 · 00:00`. **The pixels do not
move.** ⚠️ That is the assertion, not the claim.

### 🔑 Break-and-watch — mutation and restore in ONE call, byte-identity by checksum
Reverted `PausedTray`'s `time:` to raw ⇒ **two** assertions failed (the site pin **and** the adjacent-lines
one). Restored in the same call; **`md5sum` before `83ba1c56…` == after `83ba1c56…` ⇒ byte-identical**, and the
suite green after. *(Your rule, and the checksum is what makes "restored" a fact rather than a claim.)*

### 📌 The string trap — **twice inside this one task, the 6th and 7th this week**
1. TASK-324's contract pin failed because §2's new doc comment **names `formatTimeDisplay`** while explaining the
   contract does not use it ⇒ comment-stripped.
2. **My own §1 assertion — written for THIS task — forbade *"keep in lockstep"* and failed on the new header,
   which QUOTES the old promise while explaining its removal.** ⇒ scoped to the **first line**, because
   **the claim a file makes is its opening line; the prose below may quote what it replaced.**
⚠️ Also: my export-survival loop assumed `interface` and failed on `CourseListItem`, a `type` alias. **The rule
is that the EXPORT survives, not its keyword.**

### Definition of Done
- [x] `bun test` **234 / 0** · `bunx tsc --noEmit` exit 0
- [x] Header no longer promises lockstep + carries the CLAIM clause — 🚫 comment only, asserted
- [x] `ExpiryWarningSession.startTime` tells the truth — **and why `string` is honest, not looser**
- [x] All three §3 sites use `formatTimeDisplay` — asserted per site **and structurally for the adjacent pair**
- [x] 🔑 **NINE is NOT the number — it is ELEVEN**, with both new ones and why they hid
- [x] 🔑 **Nothing renders differently** — asserted by identity on `HH:mm`
- [x] 🔑 Break-and-watch — **one call**, restore proven byte-identical by checksum

## Question — **what else claims a relationship nothing enforces?**

✅ **One is the MODEL, and it is in this repo already:**
> `dictionaries.ts:1` — *"`en` is the source of truth; `th` must mirror its shape exactly **(enforced by
> `const th: typeof en`)**"*

🔑 **It makes a claim AND names the thing that enforces it** — and the enforcement is real (`const th: typeof en`
at `:1189`, plus `keys.test.ts` for resolution). ⇒ **That is the shape every other one should take: a promise
with its enforcer named, or no promise.**

**The unenforced ones, in consequence order:**
| | claim | state |
|---|---|---|
| 🔴 `AttendeeNoteInput.tsx:6` | *"The BE's own limit (`validation.ts` `attendeeNote`), **mirrored**"* → `ATTENDEE_NOTE_MAX = 200` | **A NUMBER copied across repos.** ✅ **I checked: the BE says `.max(200)` — it matches today.** ⚠️ Nothing enforces it, and drift means **staff are told the wrong maximum before the server refuses** — the same *value copied rather than derived* class as the money and time findings. |
| 🟡 `import-preview.ts:6` | *"Mirrors the server's `remainingSessions`"* | A re-derivation of a server rule, unenforced. |
| 🟡 `leave.ts:32` | *"Precedence mirrors the server's (CANCELLED → DROPPED → …)"* | An ORDERING copied by hand — and TASK-188 exists because the FE re-deriving lifecycle shipped a wrong badge. |
| ⚪ the mock services | *"Mirrors the real contract"* ×4 | Unenforced **and least worrying**: a mock's whole job is to imitate, and `pricing.mock.service.ts:2` is the honest one — it says *"because it replaces the server"*, i.e. names WHY. |

🔑 **The pattern across all of them: the claims that survive contact are the ones that name their enforcer or
their reason.** *"Mirrors X"* alone tells a reader to trust and not check — **which is precisely the state
`contract.ts` was in when I cited it twice without opening the file it named.**
🚫 **Named, nothing changed.**
