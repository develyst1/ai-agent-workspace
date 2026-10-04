# SIZING — stop creating, surface, and finally FORBID the parentless child (`TASK-641` / `TASK-642`)
**By @Sober for @Porter, 2026-10-04.** 🚫 **No TASK written — sized only, as asked. You claim the areas, then I cut.**
✅ **Every fact below was read from the code today; the files and line-level facts are named so you can claim against them.**

---

## 0. The one fact that shapes everything
**There is exactly ONE place that creates a parentless child: `resolveStudentId` in `scheduler.service.ts`.** ✅ **Five acts route through it** — `createBooking`, `createCoursePackage`, `createVoucher`, `importCoursePackage`, `importVoucher`.
**The hole is the validator: the inline-student branch of `studentInput` has `phone: z.string().trim().optional()`.** ⇒ **No phone ⇒ `parentId: null`, silently.**
⭐ **And the FRONT already asks for it:** the shared picker `components/common/StudentSelect.tsx` shows a **"parent phone"** field whenever the student is NEW — **it is simply optional.** ⇒ 🔑 **The route-around EXISTS on screen today.** **Making it required does not block anybody — unlike `TASK-632`, where the refusal had no answer.**

## 1. ✂️ THE SPLIT — **three pieces, and the order is not negotiable**
### Piece A — **STOP creating them.** ⭐ **Ship FIRST. Size S, BE + FE together.**
- **BE:** the inline branch requires a phone — refused in `resolveStudentId` with a sentence that says what to type, 🚫 never a bare 400. ✅ **One choke point covers all five acts.**
- **FE:** `StudentSelect` makes the parent-phone field **required when the student is new.** **The field already exists.**
- ⚠️ **One trap in the same component, flagged not folded:** `handleType` treats **typed text that was never selected** as a NEW student. ⇒ **A staff member who types `Ari Khosla` and does not click the existing match gets a second record.** 🔑 **That is plausibly how duplicates are born.** **Piece A's required phone will make it NOTICEABLE; fixing the trap itself is a separate decision.**
### Piece B — **SURFACE the ones that exist.** **Size S, FE-mostly. Second.**
- ⭐ **The data is ALREADY on the wire:** the dropdown's source does a **LEFT JOIN** to the parent and returns `parentId` on every row. ⇒ **a marker is a render change — 🚫 no new query, no new field.**
- **And a way to FIND them**, because the People page lists children BY PARENT, so they are not just unlabelled — **they are UNLISTED.** ▶️ **A filter or a short admin list.**
### Piece C — **FORBID it.** **LAST. Only after A ships AND every environment is swept.**
- **A migration (66 `.sql` = 66 tags, `--custom`) that makes a LIVE parentless child unrepresentable.** **See §3 — I recommend a CHECK, not a plain NOT NULL.**
- 🔴 **Order is the point:** **C before A ⇒ the app keeps trying to write a null and the DATABASE refuses it ⇒ a 500 on an ordinary booking.** **C before the sweep ⇒ the migration itself FAILS on deploy.**

🔑 **A stops new cases, B finds the old ones, C makes it impossible forever.** **Ship A first because it is the only one that stops the count going UP.**

## 2. ⚖️ The 17 dormant rows — **neither sweep blindly, nor leave forever**
**Harmless today: no future sessions.** 🔴 **Case #5 the moment a course is booked onto one** — and the picker offers them, alphabetically, with no warning.
▶️ **My ruling: they need not be resolved for A or B — but they MUST be resolved before C, because C cannot apply while they exist.**
⭐ **And with the constraint I recommend in §3, the cheap resolution for junk is ARCHIVE, not a fake family** — **so the owner decides each row: ATTACH (a real child) or ARCHIVE (not a child, or abandoned).** 📌 **`ISB (ECA)` — no course, possibly not a child at all — is the clearest archive candidate.** 🚫 **Never DELETE: deleting is not ours to do, and the owner's rule is never to destroy information.**
✅ **A read-only list of all of them is one line away from the query he already ran** — the same query without the future-sessions filter.

## 3. 🔑 Can it be made SAFE on existing data? **Yes — but NOT with a plain `NOT NULL`.**
**Does anything legitimately need a parentless child?** ⚠️ **Two candidates, both data questions, neither answerable from code:**
1. **The IMPORT paths** (`importCoursePackage`, `importVoucher`) bring in off-card history that may genuinely have no phone. 📌 **And they use the SAME picker, so Piece A makes the phone required on the IMPORT screen too.** ▶️ **The owner must say whether an import may proceed without a family.**
2. **Records that are not children at all** (`ISB (ECA)`).
⇒ **So:**
- 🔴 **Plain `NOT NULL`:** every one of the 19 remaining uat rows needs a PARENT — **ARCHIVING DOES NOT HELP, because an archived row still holds the null.** ⇒ **junk records would need an invented family — 🚫 a lie written into the data to satisfy a constraint.**
- ⭐ **RECOMMENDED: `CHECK (parent_id IS NOT NULL OR archived_at IS NOT NULL)`.** ✅ **A LIVE child must have a family; an archived record may not.** ⇒ **the broken state — a live, bookable child nobody can reach — becomes UNREPRESENTABLE, and the junk can simply be archived.** 🔑 **It forbids exactly the defect and nothing else.**
**What C costs, plainly:** **one migration** · **a sweep of EVERY environment's live parentless rows BEFORE it deploys** (uat known: 2 blocked on the customer + 17 dormant; **sid unknown — the same count query, run there**) · ⚠️ **and a deploy-order hazard: if any environment still holds one, the migration fails mid-deploy.** ▶️ **So the DEPLOY note for C must start with "run the count; expect 0".**
⚠️ **One edge to close inside C, not before it:** **an `{ id }` reference to an ARCHIVED student is not refused today** — the picker hides archived rows, but the API does not check. **Under the CHECK, booking onto an archived parentless record would be legal.** 📌 **Small, and it belongs with C.**

## 4. 🔴 IS ANY OF THIS TEAM B's? **YES — and it is the screen in Khwan's own screenshot.**
**`StudentSelect` is ONE shared component used by BOTH teams' screens:**
- **Team B's area (`partials/Bookings/*`):** `CreateCourseModal` — 🔴 **the "New course → Student" picker in `new-course-dropdown-two-aris.png`** · `CreatePlanFlow` · `CreateVoucherModal` · `ImportBalanceModal` (**the import path**).
- **Team A's:** `Calendar/Modal/BookingModal.tsx`.
- **Unclaimed:** `partials/Camp/*` (three dialogs).
⇒ 🔑 **The fix belongs in the COMMON component, not in any one team's screen** — 🚫 **fixing it per screen is how two screens end up with two rules.**
▶️ **Recommendation: claim `components/common/StudentSelect.tsx` to ONE team, and tell the OTHER that its screens will change behaviour** — **specifically that a NEW student will require a phone on `CreateCourseModal` and `ImportBalanceModal`.** 📌 **That is your call and your message to send; I have not contacted anybody.**

## 5. 📋 Files I expect to touch — **for you to claim before I cut**
| Piece | Repo | File | Note |
|---|---|---|---|
| A | back | `src/validation.ts` | `studentInput` inline branch |
| A | back | `src/services/scheduler.service.ts` | `resolveStudentId` — **Team A already** |
| A, B | front | `src/components/common/StudentSelect.tsx` | 🔴 **shared with Team B's screens** |
| B | front | `src/components/partials/People/*` | a filter / list — **unclaimed** |
| C | back | `drizzle/0065_*.sql` + journal + `src/db/schema.ts` | **migration 66** — `--custom` |
| C | back | the `{id}` → archived check | small, inside C |
✅ **Per your ruling today, each file's co-located test comes with it.**

## 6. 📏 Sizes, honestly
**A — S** (one guard, one required field; the field exists). **B — S** (render a fact already on the wire; one finding aid). **C — S in code, but GATED on data work that is not ours and not small: every environment swept, per row, by the owner.**
🔑 **The engineering is small. The DATA decisions are the long pole, and that is why C goes last and A goes now.**

---

## ✅ ADDENDUM 2026-10-04 — **Khwan answered: `ISB (ECA)` was a MISTAKE, not a gap. The sizing went DOWN.**
**Khwan: *"ก่อนหน้านี้ใส่ผิดไปค่ะ ขวัญไม่ได้ให้แก้ เพราะไม่ได้ส่งผลอะไรไรค่ะ"*** ⇒ **staff entered it wrong once; nothing depends on it.** ✅ **`OTHER`/`ECA` lacks nothing.**

### 📉 What got SMALLER, stated plainly
| | Before her answer | Now |
|---|---|---|
| **Worst-case total** | A (S) + B (S) + C (S) **+ a "not a person" flag (M)** | **A (S) + B (S) + C (S)** — 🔻 **the M is gone** |
| **Piece A** | S, **with an open risk** that it might block a live workflow and **might need an exception branch** | **S, no exception, no risk to a workflow** — 🔻 **the legitimate case is an OTHER/ECA booking, which takes no student at all.** ⇒ **Piece A refuses only what was always a mistake.** |
| **Piece C's CHECK** | might have needed a second escape (`OR is_placeholder`) | 🔻 **exactly the shape recommended: `parent_id IS NOT NULL OR archived_at IS NOT NULL`. No second term.** |
| **"Legitimate parentless" candidates (§3)** | two: imports, and non-children | 🔻 **one: imports.** **Non-children is retired.** |
| **Pieces B and C's code** | S, S | **unchanged** |
| **Data for C** | `ISB (ECA)` possibly a class of rows | 🔻 **ONE row, archived when C is applied** (the owner has ruled: do nothing to it before then) |

### ⚠️ What did NOT get smaller — **so the good news does not hide it**
🔴 **The IMPORT question is still OPEN, and Khwan's answer does not touch it.** **The import screen uses the same shared picker, so Piece A makes the phone required on imports too, and imports bring in off-card history that may genuinely have no phone.** ▶️ **"May an import proceed without a family?" is now the ONLY open product question on Piece A.**
🔴 **The per-row decisions for C are unchanged: 17 dormant rows + ตินติน + the archive of `ISB (ECA)`, each the owner's.**
🔑 **So: one fewer option, one fewer risk, one fewer term in the constraint — and one question left.**

---

## ⚖️ ADDENDUM 2 (2026-10-04) — **the owner exempted IMPORTS. Final split — and the ruling RETIRES Piece C as designed.**
**Ruling: the import path MAY create a new student without a household; the booking / new-course path may NOT.** **Reason: imports carry off-card history, some of which genuinely has no phone.**

### 🔴 1. THE CONSEQUENCE NOBODY HAS SAID YET: **Piece C's CHECK is now INCOMPATIBLE with the ruling**
**The CHECK says "a LIVE child must have a parent". The exemption now PERMITS an import to create exactly a live child with no parent** (an imported course with sessions still to run). ⇒ **Under the CHECK, those imports would FAIL at the database.**
⇒ **Two options, the owner's, 🚫 not mine:**
- ⭐ **RETIRE C.** 🔑 **The policy no longer holds the invariant, so the database must not assert it.** **The owner chose VISIBILITY over PROHIBITION; Piece B becomes the permanent control.** ✅ **And a second reduction falls out: the 17 dormant rows were only a PREREQUISITE OF C — retire C and their clean-up becomes optional hygiene, not a gate.**
- **REBUILD C with a provenance marker** (a column recording "created by import without a family", and `OR imported_without_family` in the CHECK). **M**, and 🔴 **it is a new concept whose only job is to let the constraint coexist with its own exception.**

### ⚖️ 2. "A and B no longer ship independently" — **I PARTLY DISAGREE, and here is exactly where**
✅ **AGREE: the EXEMPTION depends on B.** **An import that creates an unreachable child is acceptable ONLY because B makes it findable. If B slips, the exemption must be revisited.**
🔴 **DISAGREE: Piece A does NOT depend on B to be safe.** **A alone closes the booking path and leaves the import path EXACTLY as open as it is today** ⇒ **strictly better than the status quo, never worse.** **And the booking path is where the one case we TRACED (Ari) came from.**
⇒ ▶️ **So: A may ship first; B follows; and what is coupled to B is the EXEMPTION, not Piece A.** 🔑 *Holding A for B would keep open the path that produced the known case, and buy no safety.*

### 🔑 3. How import vs booking is distinguished — **ONE rule, enforced by the SERVER, per ACT**
**The five acts already have five schemas.** ⇒ **Two input shapes, chosen by the ACT, not by the screen:** **the strict one (phone required on a new student) for `createBooking`, `createCoursePackage`, `createVoucher`; the existing optional one for `importCoursePackage`, `importVoucher`.**
✅ **The server is the AUTHORITY.** **The picker only MIRRORS it, with ONE explicit prop — `requireParentPhone` — that defaults to TRUE.** 🔑 **Default TRUE means a NEW caller is safe without anyone remembering: it fails CLOSED.** **Only `ImportBalanceModal` passes `false` — and it calls exactly `useImportCoursePackage` and `useImportVoucher`, so it maps 1:1 onto the two exempt server acts.**
🚫 **The component never sniffs which screen it is on.** ⇒ **If the prop were ever wrong, the server still refuses on the booking path.** **That is one rule, mirrored — not three.**
⚠️ **Evidence that this matters, found while checking: the shared picker ALREADY misbehaves for one caller.** **`SellCampDialog` uses it — so it offers "create a new student" — but sends only `student.id`, which a new student does not have.** 📌 **Out of scope; recorded because it is exactly the class of problem @Porter named.**

### 📋 4. FINAL SPLIT and FILES — for @Porter to claim
| Piece | Size | Repo | Files | Note |
|---|---|---|---|---|
| **A** | **S** | back | `src/validation.ts` | **two student input shapes, chosen per act** |
| **A** | — | front | `src/components/common/StudentSelect.tsx` | **`requireParentPhone`, default `true`** · 🔴 shared |
| **A** | — | front | `src/components/partials/Bookings/ImportBalanceModal.tsx` | 🔴 **TEAM B's file — ONE line: `requireParentPhone={false}`** |
| **B** | **S** | front | `StudentSelect.tsx` (marker) · `partials/People/*` (finding aid) | **now the PERMANENT control for import-created rows** |
| **C** | — | back | — | ⛔ **RETIRED as designed — owner: retire, or rebuild with a marker (M)** |
✅ **Every other caller of the picker needs NO change: the default does the work.** ✅ **Co-located tests come with each file, per your ruling.**
