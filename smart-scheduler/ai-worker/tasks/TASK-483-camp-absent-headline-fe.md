# TASK-483 — 🔴 the camp check-in page tells a nanny "Already checked in ✅" for a child the coach marked ABSENT — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-26) · **Size XS.** Next round, item 4. ⚠️ **Parent-facing text** — the wording below is the owner's approved direction via Porter; do not improve on it without telling me.

## §0 What Tanya saw (TEST-074, `task480-camp-link-absent-refused.png`)
TASK-480 made ABSENT terminal to a scan, and the refusal is correct — but the **page** renders it as a success: a **green tick** and the headline **"เช็คอินแล้ว / Already checked in"**, with `Status: Absent` four lines below in the detail box.

🔴 **Why this is worth an XS task rather than a backlog note.** The person holding the phone at the counter is often **a nanny or a driver** — the owner's own reason for rejecting LINE identity in REQ-108. They do not know the child was marked absent, they are not going to read a status line under a green tick, and the headline tells them the job is done. **They walk the child in.** The guard we built to protect the coach's record is defeated by the screen that reports it.
📌 And note what actually happened: **the backend behaved perfectly and the product still misled the user.** A correct refusal rendered as a success is not a smaller bug than a wrong refusal.

## §1 Build
- In `CampSuccessView` (`components/partials/Checkin/CheckinContent.tsx`), when the day's status is **`ABSENT`**:
  - **no green tick** — a neutral mark, not `bg-success` / `CheckCircle2`;
  - the headline says **already RECORDED**, not already checked in: **`บันทึกแล้ว` / `Already recorded`**;
  - the status line stays as it is (that is the fact, and it should be readable, not the only clue).
- **An ATTENDED "already" is unchanged** — green tick, "already checked in". That one really is a success, and I do not want this turning into a page that looks anxious about every repeat scan.
- 🔑 **It fixes both doors at once, which is why it belongs in this component:** the camp roster link and the shop-front QR page both render `CampSuccessView`. **Pin that the shop-front path shows the new shape too** — that is the door the poster points at.
- **Check and tell me, do not fix silently:** does the equivalent SESSION reply have the same problem? A session's refusals go down the error path (TASK-479's "too late"), so I believe it does not — **confirm from the code and say so in your report.** If it does, that is a second finding and I want it named.
- Copy counted, both languages. 🚫 No BE change, no change to what the server decides.

## Definition of Done
- [ ] ABSENT ⇒ neutral mark + "already recorded", by RENDERING (assert the green/success mark is **absent**, not just that the text changed) · ATTENDED "already" byte-identical · **the shop-front path pinned to show the new shape** · the session reply checked and stated · copy both languages · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that restores the success tick on ABSENT and one that changes the ATTENDED case · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-27. **An ABSENT day is recorded, not checked in — and the mark at the top says so.**

```
bunx tsc --noEmit → exit 0
bun test          →  596 pass / 0 fail   (was 591; +5 — new lib/checkin/camp-absent-reply.test.ts)
bun run build     → ok
git status        →  2 source modified (CheckinContent · dictionaries) · 1 new test
```
🚫 No BE change, nothing about what the server decides. 🚫 No deploy asked.

### `§1` — what changed
- **ABSENT:** a **neutral** mark — `bg-muted-200` / `ClipboardList`, no green anywhere — and the headline **`บันทึกแล้ว` /
  `Already recorded`** (the owner's words via @Porter, unchanged). The `Status: Absent` line stays exactly where it was:
  it is the fact, and it should be readable — it just is no longer the ONLY clue (mutation 6 drops it and fails).
- **Pinned by RENDERING, as the DoD asked — by absence, not by changed text:** the ABSENT output contains no
  `data-camp-mark="success"`, no `bg-success`, and not even the tick's own `lucide-circle-check` class (so a future
  change that keeps the wrapper and swaps the icon cannot pass either).
- **ATTENDED is untouched:** green tick + *Already checked in* on a repeat, *Check-in complete* on a fresh scan — and
  PLANNED / CANCELLED keep the success face as well, because this page must not turn anxious about every repeat scan
  (mutations 3 and 4 fail).
- **The branch is the server's `status` and nothing else** (`const absent = d.status === "ABSENT"`) — mutation 5 derives
  it from `already` instead and four tests fail.
- **Both doors, one component:** the camp roster link and the shop-front QR page both render this `CampSuccessView`, and
  the **shop-front path is pinned** to the new shape — that is the door the poster points at. Asserted too: exactly ONE
  `CampSuccessView` exists in the repo, so the two doors cannot drift apart.

### ✅ The SESSION reply — checked, as you asked, and it does NOT have this problem
Its success body carries **no status at all**: `{ already, booking, crmAwarded?, remaining? }` (the local `CheckinResult`
in `CheckinContent.tsx`). Every refusal a session can meet — sick leave, cancelled, the TASK-479 window's "too late" —
comes back **not-ok**, and the page's `if (!res.ok)` hands it to `ErrorView` with the server's own sentence. There is no
path on which a session refusal reaches `SuccessView`, so there is nothing to mislead with and I changed nothing there.
📌 The difference worth naming: the camp route answers a refusal **200 with the day as it stands** (so the page had to
read the status), while the session route answers **non-2xx**. A success body that can describe a refusal is the shape
that produced this bug.

### 📎 While I was in that component — the two absent lines (your item 1, NOT fixed)
`CampSuccessView` reads `d.studentName` and `d.weekName`, and you have since told me the camp answer is an 8-key
allow-list (`weekName` now sent on the "already" reply too — thank you, that fixes the empty line on a repeat scan;
`studentName` still never sent). **I have not touched either line.** What they are for, so you can rule:
- **`weekName`** — *which camp week this is*. On a phone at the counter it is the only thing distinguishing two weeks a
  family has bought, and it is now sent on both paths, so the line earns its place.
- **`studentName`** — **my view, since you asked: keep it and have it sent.** Not because the session view has it, but
  because of the same person this task is about: **the phone is often a nanny or a driver with two or three children in
  the car**, and the reply's other four lines (week · date · half · status) are identical for siblings on the same camp
  day. Without the name, "which child did I just check in?" has no answer on screen, and the one person least able to
  work it out from context is the one most likely to be holding the phone. It is one field and it closes that gap.
  (If it is not sent, the honest alternative is deleting the line — a conditional that never renders reads as a bug to
  the next person, as this one did to Jason.)

### 🔑 Break-and-watch — seven, `try/finally`, checksum, `BASELINE=0` on a GREEN suite
| # | mutation | result |
|---|---|---|
| 1 | the success tick comes back on ABSENT | **1 fail** |
| 2 | the headline goes back to "already checked in" on ABSENT | **1 fail** |
| 3 | the ATTENDED "already" is changed too (the page turns anxious) | **1 fail** |
| 4 | the ATTENDED mark turns neutral | **1 fail** |
| 5 | the branch reads `already` instead of the server's status | **4 fail** |
| 6 | the status line is dropped (the fact disappears entirely) | **1 fail** |
| 7 | the Thai headline is the checked-in one | **1 fail** |
`md5` identical on the two mutated files.

### Definition of Done
- [x] ABSENT ⇒ neutral mark + "already recorded", **by rendering, asserting the success mark's ABSENCE**
- [x] ATTENDED "already" byte-identical · **the shop-front path pinned to the new shape** · the session reply checked and stated
- [x] Copy both languages · **596 / 0** · `tsc` 0 · build ok · 🔑 seven mutations, `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya, on a phone: have a coach mark a camp day **ABSENT**, then scan that child's camp link ⇒ **a grey clipboard
mark and "บันทึกแล้ว"**, with `Status: ไม่มาเรียน` in the box below — **no green tick anywhere**. Then the same through the
**shop-front QR** (the poster's door) ⇒ the identical screen. Then an ordinary ATTENDED day scanned twice ⇒ the green
tick and "เช็คอินแล้วก่อนหน้านี้", exactly as before. A session link that is refused (too late, cancelled) ⇒ the red
error face, unchanged.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-27)
Verified in the current tree: **614 pass / 0 fail** (596 at her report; the difference is TASK-491 and TASK-514, both verified in the same run) · tsc 0 · build ok.

✅ **Pinned by ABSENCE, and she went one better than the DoD asked:** not just "no `bg-success`" but **not even the tick's own `lucide-circle-check` class** — so **a future change that keeps the wrapper and swaps the icon cannot pass either.** That is the difference between pinning today's markup and pinning the property.
✅ **The branch is the server's `status` and nothing else** — mutation 5 derives it from `already` and four tests fail. **The page reads the fact, not a proxy for it.**
✅ **One `CampSuccessView` in the repo, asserted** — so the two doors cannot drift apart. Fixing both by construction rather than by remembering to fix both.
🔑 **And the finding in her answer to my session-reply question is the general lesson:** the camp route answers a refusal **200 with the day as it stands**, so the page had to read the status; the session route answers **non-2xx**, so its refusals cannot reach the success view at all. 📌 **"A success body that can describe a refusal is the shape that produced this bug."** That sentence is the reusable part, and it is why the session path needed nothing.

## 🔨 Ruling on her `studentName` argument: **yes — have it sent. TASK-515.**
I asked what the line was *for* and said I would delete it if the answer was "the session view has it". **Her answer is not that.** The reply's other four lines — week, date, half, status — are **identical for siblings on the same camp day**, and **the phone is usually a nanny or a driver with two or three children in the car.** ⇒ **"Which child did I just check in?" has no answer on the screen, and the person least able to work it out from context is the one most likely to be holding it.**
🔑 **That is the same reasoning the owner used to reject LINE identity for REQ-108, applied to a different surface** — and it is a better argument than the one I was ready to accept. One field, and it closes the gap.
✅ **And her alternative is right too:** *"if it is not sent, the honest alternative is deleting the line — a conditional that never renders reads as a bug to the next person, as this one did to Jason."* **Either way the code must stop lying about what it shows.**
