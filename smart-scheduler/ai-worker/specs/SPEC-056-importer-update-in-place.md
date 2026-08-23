# SPEC-056: Importer updates in place — safe re-import against an edited sheet (REQ-059)

- Source: REQ-059 (the importer must update existing students; wipe-and-re-import is closed for `uat`)
- Author: Sober (SA) 2026-08-22
- Status: READY — task cut (TASK-156). BE-only, owner-run, no migration.

## The crux, answered first (REQ-059 Q1 — the identity key)

**There is no fully-automatic stable key, and I will not pretend otherwise.** `(parent phone, student name)` is the
only identity the source sheet offers, and the evidence proves it unstable — **31 names changed on the first update**
(nickname → nickname + surname). Phone is shared across a family (≤5 children), and DOB is blank on ~half the rows,
so neither rescues it. Any scheme that *guesses* a rename will, on some row, merge two different children or fork
one — silently, on a live roster. So the rule is **match exactly, and make ambiguity a human decision, never a
guess:**

For each row, resolve the **parent by phone** (as today), then:

1. **Parent is newly created by this row's phone** ⇒ every child under it is genuinely new ⇒ **CREATE** (AC-1).
2. **Parent exists AND a child's name matches exactly** ⇒ **UPDATE that student in place** (fill + correct, rules
   below). This is the idempotent, safe path.
3. **Parent exists AND the row's name matches no existing child** ⇒ **AMBIGUOUS: a renamed child or a new sibling —
   the importer cannot tell.** ⇒ **HOLD the row; never auto-create, never auto-update.** The report prints the
   parent's existing children (with their DOBs) beside the sheet's name and DOB, e.g.
   *"row 84: parent 081… has [เอแคลร์ (DOB 2018-03-02)]; sheet says 'เอแคลร์ อังศุมาลิณณ์' (DOB 2018-03-02) — rename
   of an existing child, or a new sibling? resolve by hand"*, so a human settles it in seconds.

**This is the honest answer to REQ-059 Q1:** renames are handled by **human confirmation**, not by a magic key. It
turns the 31 silent duplicates into **31 explicit review lines** — which is exactly the protection the REQ exists
for. (A real new sibling under an existing parent is also held; that is the accepted cost of never forking. The
report makes it a quick yes/no, and it is rare next to the harm of an auto-created duplicate.)

> **One-time reconciliation, owner-run, out of this tool:** the 31 already-renamed rows are resolved once by a human
> using the export Porter holds; from then on their names match exactly and update cleanly. This tool's job is to
> make every future refresh **safe by default**, not to auto-resolve the current backlog.

## Update rules (the exact-match path, requirement 3)

Reusing **`lib/demographics.ts`** (from REQ-060 Part A) so a sheet `Male` vs a stored `male` is **not** a spurious
diff — normalise both sides before comparing/writing.

- **Fill empties:** sheet has a value, stored is empty ⇒ write it.
- **Corrections land, and every one is shown:** sheet value ≠ stored value ⇒ **update, and the dry-run prints
  `field: old → new`** (AC-2). The dry-run diff is the review gate — the owner sees every overwrite before
  `--commit`, which is what keeps a sheet value from silently clobbering a value a human typed in the product
  (the REQ-060 `คุณมะเหมี่ยว` concern). *(Owner question below on whether conflicts should instead be held.)*
- **Never blank:** sheet cell empty, stored has a value ⇒ **keep stored**, report "kept" (AC-3). An import must
  never erase a hand-filled gap.
- **Import-owned fields only:** student `name` is the match key (not overwritten on the exact path — a changed name
  is case 3), plus `dob`, `gender`, `nationality`; parent `name` fills-if-empty only. **Never touch** courses,
  bookings, vouchers, quota, plans, LINE links, or notes (requirement 4, AC-4).

## The dual-phone case (new AC, from the evidence)

A cell holding two numbers (`0991659555 , 0994456464`, `x / y`) must **not** be silently held. Rule: **split on `,`
or `/`; the first valid 10-digit number is the parent key; the remaining number(s) are echoed in the report as
"second contact: …"** and are **not** stored (there is no second-phone field, and inventing a second-parent linkage
is scope we should not guess — same discipline as the Note column). The row **imports** on the first number; the
report carries the second so the owner keeps it.

## The report (requirement 5 / AC-7) — per source row, keyed to the Excel row number

`created` · `updated` + the field list with `old → new` · `unchanged` · `held` + reason (dual-phone leftover echoed,
`Note` column echoed) · **`review: possible rename`** + the candidate existing child. Counts alone are forbidden —
"updated 47" tells the owner nothing about what moved.

## Acceptance mapping

- **AC-1** new rows create · **AC-2** corrections update + named in the dry-run diff · **AC-3** empty sheet cell
  never blanks a stored value · **AC-4** a student with a course keeps course/bookings/plan/quota/LINE across the
  update (verify on a real one) · **AC-5** a changed name is **held for review, not duplicated** (the requirement-2
  behaviour, stated in the report) · **AC-6** immediate re-run = 0 created · 0 updated · **AC-7** the per-row report
  above.
- **+AC-8 (dual-phone)** — a two-number cell imports on the first number and echoes the second; never silently held.
- **+AC-9 (rename visible)** — a name-miss under a known parent prints the candidate existing child, not a bare hold.

## Run target (per the standing-rule distinction I added today)

This is **data**, not a schema migration — and it is **divergent per box**: the corrections belong to **`uat`**
(the customer's edited sheet against the customer's real students). `sid` holds the old-name rehearsal, a different
dataset. ⇒ **The run target is `uat`**; the *logic* may be rehearsed on `sid`, but "sid first" is not a data
guarantee here. Owner runs dry-run → reviews the diff → `--commit`, on `uat`.

## Owner question (folded up via Porter — one decision, not a blocker)

- **Conflict policy:** default is **sheet wins on a non-empty conflict, with the change shown in the dry-run diff**
  for review. The alternative is to **HOLD conflicts** for explicit confirmation instead of overwriting. Default is
  chosen because the owner asked for "corrections to land" and the dry-run diff already surfaces every change; say
  the word if you'd rather conflicts be held.

## Out of scope

- Deleting students/parents (no safe delete; REQ-057 covers course cleanup, and is on HOLD).
- Wave 2 (courses/timetable import). The `Note` column stays **ignored + echoed** (owner-closed Q4).
- Auto-resolving the current 31 renames — that is the one-time human reconciliation above.
