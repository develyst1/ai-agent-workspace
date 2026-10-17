# TASK-728 — R62's register-page twin follows the approved LINE sentence (verbatim mirror) — FE, XS
- Source: `COPY-SET-khwan-workbook-2026-10-11.md` row **R62** (`verify_parent_other_family`) · owner approval `COPY-REVIEW-2026-09-29.md:592-608`, item 4 (a)
- Status: ✅ DONE (Silver, 2026-10-11) · ships WITH TASK-727 (the twin must equal the back; checked at 727's review)
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-11)
- **Claim:** `src/lib/i18n/dictionaries.ts`, **only** the R62 twin (`:2109` comment "`verify_parent_other_family` — VERBATIM", and the `LINE_BOUND_TO_OTHER_FAMILY` strings, EN/TH) + any pin that asserts it. Reds outside ⇒ the standing practice.

## What to do
- The register page keeps a **deliberate verbatim copy** of the LINE sentence R62. Khwan changed **R62** (see the COPY-SET row for which language). ⇒ **The page's copy changes to the SAME approved words**, machine-copied from the COPY-SET's "her text" cell.
- 🔎 **R63 (`add_dup_detail`) needs nothing on the front:** its page hint was deleted in TASK-577 (`dictionaries.ts:2042`), and the page shows the server's sentence.

## Definition of Done
- [ ] A by-value test: the page string equals the approved R62 words (the language(s) she changed); the other language is unchanged.
- [ ] Mutation: the old words restored (bites).
- [ ] tsc · full `bun test` with counts · build. Nothing committed.

## Implementation Notes
**Fanta, 2026-10-11.** Repo `smart-scheduler-front`. Nothing committed.

**Files:** `M lib/i18n/dictionaries.ts` (the two `LINE_BOUND_TO_OTHER_FAMILY` strings under `register.code`, EN + TH, and the EN comment) · `?? lib/register/register-r62-task728.test.ts` (3) · `?? lib/register/register-r62-task728.mutations.json` (4). Nothing else; no pin outside the claim named these words (grep), so the standing practice had nothing to list.
- **EN:** `Someone has linked this LINE account in the system already. Please contact our Admin.`
- **TH:** `บัญชี LINE นี้ได้มีการผูกในระบบไว้แล้วค่ะ กรุณาติดต่อแอดมินค่ะ`
- Both are Khwan's R62 words as approved (`COPY-REVIEW-2026-09-29.md:592-608` item 4(a): "her words as they are"). I machine-compared the test's two strings with the R62 "her text" cell of `COPY-SET-khwan-workbook-2026-10-11.md` (trailing/leading spaces dropped, the same rule as 727): **both equal**. She changed BOTH languages, so both moved. The old TH had no final «ค่ะ»; hers has.
- **R63** needs nothing on the front, as you said (`add_dup_detail`'s page hint was deleted in TASK-577).

**Declared:** the page and the chat must carry the SAME words. The back's copy is TASK-727 (Bob): ⚠️ **NOT VERIFIED here** that his `verify_parent_other_family` landed with the identical two strings; your review of 727 is where the two meet.

**Verification:** `bunx tsc --noEmit` 0 · `bun run build` 0 · **full `bun test` 1155 pass / 0 fail across 130 files** (was 1152, +3). The test reads the strings by value (hand-written, EN + TH exactly; no stray whitespace and the old clauses gone; the neighbouring `PHONE_BOUND_TO_OTHER_LINE` untouched).
Mutation set: `bun run mutation:run -- --tests "src/lib/register/register-r62-task728.test.ts" --mutations src/lib/register/register-r62-task728.mutations.json` → **4/4 BITES**, CHECKSUM identical: the EN old words restored (R1) · the TH old words restored (R2) · her trailing space kept in TH (R3) and in EN (R4). 🚫 No click on sid or uat.

## Questions
None.

## Review

## Review
**Silver, 2026-10-11 — ✅ DONE.**
- **Both languages change, correctly:** Khwan filled TH AND EN for R62 (COPY-SET row). Machine-checked: the page's EN and TH equal her cells **byte for byte** after rule 3 (her trailing spaces dropped).
- **Re-run by me:** the full front suite **1155 / 0**; set `register-r62-task728` **4/4 BITES**, `CHECKSUM identical`. ⭐ R3/R4 (her trailing spaces kept) are a good guard on rule 3.
- **The one thing not checkable yet** (your note): that the back's R62 in TASK-727 is the identical string. **I check it at 727's review**, and the two ship together.
- **Files to commit:** `src/lib/i18n/dictionaries.ts` (the R62 twin), `src/lib/register/register-r62-task728.test.ts` + `.mutations.json`.
