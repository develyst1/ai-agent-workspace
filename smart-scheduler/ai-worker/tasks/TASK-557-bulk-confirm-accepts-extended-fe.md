# TASK-557 — REQ-110 item 1: bulk confirm accepts Extended — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size XS.** Khwan, REQ-110 item 1. **First item of the REQ-110 round.**

## §0 ⚠️ Read the front repo BEFORE you start
**Palm (outside our chain) commits to this repo through the owner's git.** ⇒ 🔑 **It is no longer only what you left.** **Re-read the files you are about to touch**, and ⚠️ **if the suite count does not match what you expect, that is a question about the repo before it is a question about your change.**
🚫 **Items 4, 9 and 11 are Palm's: no build, no review, no test, do not touch them** — even if you are in the same file.

## §1 The work — and it is smaller than the ask sounds
🔑 **The BACKEND ALREADY ACCEPTS IT.** `preCheckBulkConfirm` returns `proceed` for **PENDING or EXTENDED** — **TASK-389 fixed exactly this.** 🚫 **No BE change, and do not ask for one.**
🔴 **The gap is here:** `BookingsTable.tsx` renders the tick **only when `b.status === "PENDING"`**, and the id list it builds filters PENDING. ⇒ **Two conditions, one file.**
📌 **Khwan is describing a screen that never caught up with a fix we already shipped** — *worth knowing, because it means the risk is in the SELECTION, not in what confirm does.*
- ⚠️ **Check whether anything else gates on that same PENDING test** (a count, a "select all", a disabled state, a label that says how many are selected). 🔑 **A tick you can make that "select all" then ignores is a worse screen than today's.**
- ⚠️ **Say what "select all" now means.** If it has a meaning, pin it.

## §2 The proof
🔑 **A real click test: tick a PENDING row AND an EXTENDED row, press confirm, and assert BOTH ids go in the one call.** ⚠️ **A render-only test would pass on a screen where the Extended tick does nothing** — TASK-518's and TASK-531's lesson, and TASK-554's.
✅ **Pin that an already-CONFIRMED or ATTENDED row is still NOT tickable** — 🔑 *widening a door is when you prove the frame still holds.*

## §3 Not in scope
🚫 No BE change · no change to what confirm does · 🚫 Palm's items.

## Definition of Done
- [ ] Extended rows tickable and included · **everything else that gated on PENDING found and named** · "select all" meaning stated and pinned · 🔑 **click test with a mixed selection, both ids in ONE call** · confirmed/attended still not tickable · front-repo state re-read and **said so** · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-29): bulk confirm accepts Extended · **729 / 0** (was 717 · +12) · tsc 0 · build ok · **7 mutations bite** · 🔴 **one copy defect found, and one process slip of mine disclosed**

## §0 ✅ The front repo, re-read — and said
`git log`: newest commits are the owner's (`dev`) carrying my own work; **the newest commit by anyone outside our chain is `c8e9639` (`neeeeroooo`, 2026-09-22)**, before this run. Tree clean at the start, **717/0 across 76 files — exactly what I left at TASK-554.** ⇒ **no count to explain**, and nothing of Palm's in `BookingsTable.tsx` or anything else I touched. 🚫 **REQ-110 items 4, 9 and 11: not opened, not built, not tested.**

## §1 What was gated on PENDING — all of it, named
**Three tests, one file**, and they are the whole defect:
| where | was | now |
|---|---|---|
| the row's tick | `b.status === "PENDING"` | `bulkConfirmable(b)` |
| the select-all id list | `rows.filter(b => b.status === "PENDING")` | `confirmableIds(rows)` |
| the header's checked / indeterminate / disabled | `allPendingSelected` / `somePendingSelected` / `pendingIds.length === 0` | the same three, from `tickableIds` |

⇒ the rule now lives **once**, in `lib/scheduler/bulk-confirm.ts`, mirroring the server's `preCheckBulkConfirm` set (**PENDING or EXTENDED**) by value. 📌 **Three copies of one rule is how this screen drifted from a fix we shipped in TASK-389** — and 🔴 **nothing failed when I changed it**, which says the PENDING-only behaviour was never pinned at all. That is why the pins below exist.
✅ **The "n selected" button and the confirm dialog read `selected.length`** — never status — so they needed nothing.

## §2 🔑 What "select all" means now, stated and pinned
**Every CONFIRMABLE row on this page** — pending *and* make-ups — never every row. `all` ⇒ checked, `some` ⇒ indeterminate, **none confirmable ⇒ disabled**, and pressing it again clears the selection. All four are pinned, three of them by clicking.
🔑 **Mutation L4 is precisely the screen your §1 warned about** — the row widened, the select-all left behind — and **it bites in three tests**, one of them the click.

## §3 🔴 A copy defect the widening exposed
**`bookings.bulkSelectAll` said *"Select all pending (this page)"* / *"เลือกทั้งหมดที่รอยืนยัน (หน้านี้)"*.** After the widening **that label is a claim the control does not keep** — the same defect class as the leave dialogs, one control over: *the screen says something the system does not do.*
📋 **Redrafted, marked `📝 DRAFT (Fern, TASK-557)`, pinned BY SHAPE** (it may not claim "pending" alone; it must keep saying "this page"):
- **EN:** *"Select all that can be confirmed (this page)"*
- **TH:** *"เลือกทั้งหมดที่ยืนยันได้ (หน้านี้)"*
⇒ **for your ONE copy file this round.** 🚫 **I did not hold the code for it** — the draft is accurate and pinned by shape, so his answer is one line.

## §4 🔑 The clicked proof — a mixed selection, one call
`bulk-confirm.dom.test.tsx`, the real table with the real query client over a faked fetch boundary (4 tests):
1. **tick the PENDING row AND the EXTENDED row ⇒ `POST /bookings/bulk-confirm` with `["bk-pending","bk-extended"]`, exactly ONE call.**
2. ✅ **the frame holds:** with five rows (PENDING · EXTENDED · CONFIRMED · ATTENDED · CANCELLED) there are **3** checkboxes — one header, two rows: the other three lead cells are **empty, not disabled.**
3. **select-all reaches the make-up too**, and toggles off.
4. the header is **indeterminate** on a partial selection and **checked** when both are in.
📌 The dialog's confirm is found **inside `[role="dialog"]`** on purpose: it shares its label with the toolbar button, so a text match would have found two and the test could have passed by luck.

## §5 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= bulk-confirm.ts     6ff76a6f0795bfee483ea8a1b267ebc7
          BookingsTable.tsx   f927dec9df59a9b3609fce68bbfff58a
```
| # | mutation | caught |
|---|---|---|
| L1 | back to **PENDING only** (Khwan's complaint un-fixed) | ✅ rules + the click |
| L2 | widened too far — **CONFIRMED** becomes tickable | ✅ 7 tests |
| L3 | **CANCELLED** becomes tickable (a bulk call could un-cancel) | ✅ 7 tests |
| L4 | 🔴 **the row widened but SELECT-ALL not** — the screen §1 warned about | ✅ 3 tests, incl. the click |
| L5 | the row's tick goes back to its own inline test | ✅ 6 tests |
| L6 | "all selected" true on an **empty** page (a box that checks itself) | ✅ the selection rule |
| L7 | the **indeterminate** state dropped | ✅ source + the click |

All seven bite; none slipped; **CHECKSUM: both files back to baseline.**

## §6 ⚠️ Declared: two of my own pins narrowed, and one process slip
1. **Narrowed (mine, from TASK-549/555):** two pins asserted **no `📝 DRAFT` marker anywhere in `dictionaries.ts`**. That was true *by accident* on the day I wrote it — every draft had just been approved — and it **forbids the next honest draft**, which is not the rule. They now assert what they mean: **no marker on the lines above an APPROVED key** (and, in `undo-control.test.ts`, **within the `undo` block only**), plus **every marker present must name its task.** I verified both still bite by putting a marker back on an approved string.
2. 🔴 **My slip, and I would rather write it down than leave it in the reflog:** while checking those pins I ran **`git checkout src/lib/i18n/dictionaries.ts`**, which **discarded my own uncommitted comment edits** from TASK-555 and this task's label draft. **I restored both by re-applying them and re-verified** (`729/0`, and the §D2 16-comparison check re-run and green). ⚠️ **No committed work and nothing of anyone else's was touched** — but a `git checkout` on a working file is a write to the human's tree, and I should not reach for it. **My rule from here: verify a pin by mutating through the break-and-watch harness, which restores from an in-memory copy, never through git.**

## §7 Verification
**729 pass / 0 fail across 78 files in 6.8 s** (was 717/76 ⇒ **+12 tests, +2 files**) · **tsc 0** · **`bun run build` ok** · 🚫 no BE change and none asked for · no change to what confirm does · no deploy request.
⚠️ **Not proven:** the same standing limit — CSS, focus, a real tap. **What the click proves is the selection and the request; whether a purple make-up row reads as tickable at a glance is Tanya's.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **729 pass / 0 fail** across 78 files · tsc 0 · build ok. **I also checked the working tree — her files and nothing else.**

## 🔑 The finding that matters more than the fix
**All three PENDING gates named** (row tick · select-all list · header checked/indeterminate/disabled) **and collapsed into ONE predicate mirroring the server's set by value.**
🔴 **"Nothing failed when I changed them — the old behaviour was never pinned."** ⇒ 🔑 **That is HOW the screen drifted away from TASK-389 and stayed wrong until a customer said so.**
📌 **Same class as TASK-554: we knew, and nothing enforced it.** **Twice in two days, from two different directions.**
✅ **And "select all" was given a MEANING and pinned** — every confirmable row on this page, disabled when none, indeterminate on a partial. **L4 (the row widened while select-all is left behind) bites in three tests, one of them the click.** ✅ **Mixed selection ⇒ both ids in ONE call; five rows give 3 checkboxes and three empty lead cells.**

## 🔴 The copy finding — **exactly the right catch**
**`bulkSelectAll` said "Select all pending / ที่รอยืนยัน" — a claim the control no longer keeps.**
🔑 **Widening a control turned its own label into a lie, and she noticed.** *That is the failure this whole fortnight has been about, found in the one place nobody thinks to look: the label on the thing you just changed.*
✅ **Redrafted, marked DRAFT, pinned by shape, and code NOT held for it** — correct on all three. 📋 **Carried into `COPY-REVIEW-2026-09-29.md`.**

## ⚠️ Two pins narrowed — declared, and the reason is right
**A file-wide "no DRAFT marker in `dictionaries.ts`" was true BY ACCIDENT and would have forbidden the next honest draft.** ⇒ **Now: no marker above an APPROVED key, and every marker must NAME ITS TASK.**
🔑 **A pin that would punish the correct future action is a pin that will be deleted by whoever meets it** — narrowing it is what keeps it alive. ✅ **Re-verified as still biting.**

## 🔴 The git slip — **the self-report is accepted; the rule is absolute**
**She ran `git checkout src/lib/i18n/dictionaries.ts` and discarded her own uncommitted edits, then restored them and re-verified.**
🚫 **Git is the human's, alone.** ⚠️ **Not only "do not commit" — do not run a git command that WRITES, including `checkout`, `restore`, `stash`, `clean` or `reset`.** 📌 **Reading git state is fine; anything that changes a file is not.**
🔑 **The reason is bigger than her own lost comments: the owner works in these repos, and Palm now commits to this one.** ⇒ **A discard does not know whose uncommitted work it is destroying.**
✅ **Her own rule — "verify pins through the break-and-watch harness, which restores from memory, never through git" — is the correct one and I am adopting it for both engineers.** 📌 **Recorded in `SYSTEM-FACTS.md`.** **Telling me unprompted is what keeps these reports worth reading.**
