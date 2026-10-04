# TASK-661 — ship the owner-approved check-in sentence (Draft A′) to `empty_checkin` and `qr_none` — BE, XS
- Source: owner's approval 2026-10-04 (relayed by @Porter) of `COPY-DRAFT-checkin-not-confirmed-teamB-2026-10-04.md` §AMENDMENT, **Draft A′** · owner's ruling that a parent may not check in to an unconfirmed class, so this is wording only
- Status: DONE (reviewed by Silver, 2026-10-04) · ships with the NEXT batch — ✅ **GO from @Porter, 2026-10-04.** He granted Team B the write on `empty_checkin` and `qr_none` (board correction under `## Batch claims`). The rest of the copy reservation stands.
  - History: I first stopped this TASK because the board said "Team A keeps the WRITE on all copy". Porter ruled the reservation does not reach these two keys. He briefly held it for Team A's TASK-643, then lifted the hold.
  - 🔴 **Boundary:** Team A's `TASK-643` is deleting `§T-609-CAP` (the pre-start at-cap refusal) in the same file.
    - **Do NOT touch `§T-609-CAP`, the pre-start refusal, or ANY key other than `empty_checkin` / `qr_none`.**
    - If your edit comes anywhere near them, **STOP and tell me.** I tell Porter. A merge conflict is Porter's to resolve, not yours.
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-04)
- Depends on: Porter's claim on the copy write for these two keys

## §0 The approved words. 🔴 Copy them EXACTLY from here; nothing else is the source
| key | TH | EN |
|---|---|---|
| `empty_checkin` | วันนี้ไม่พบคลาสที่ยืนยันแล้วสำหรับบัญชีนี้ค่ะ หากน้องมีเรียนวันนี้ รบกวนติดต่อแอดมินเพื่อตรวจสอบก่อนเช็คอินนะคะ | We couldn't find a confirmed class for today on this account. If your child has a class today, please contact the admin to check it before checking in. |
| `qr_none` | *(the same TH)* | *(the same EN)* |

**Why one sentence for both, and why this one:**
- The bot's "nothing" has three causes: no class, not confirmed yet, or a confirmed class on a child not linked to this account (the uat parentless-child defect).
- A′ is true in all three and names no cause.
- Draft B was **declined** by the owner. 🚫 Do not add any branch.

## What to do
1. `src/lib/line-i18n.ts`: replace the TH and EN of `empty_checkin` (`:282`) and `qr_none` (`:567`) with the text above, **byte for byte.** The apostrophe in "couldn't" is a straight `'`, exactly as approved.
2. 🚫 **The act does not change** (owner). The send sites (`line-webhook.service.ts:951`, `:960`) are untouched. That is Team A's file.
3. 🚫 **Not in this TASK:**
   - `empty_leave`: its fix is the leave-window item next round.
   - the Thai-only refusal at `checkin.service.ts:109`: Team A's, and Porter carries it.
   - the shop-QR `NOT_CHECKINABLE`: no change, it is a privacy guard.

## Tests that pin the old words. Update them, do not delete them
- `src/lib/line-v2-messages-req107.test.ts:59-61` ("no class today") pins the REQ-107 text `["No class today","วันนี้ไม่มีคลาส"]`.
  - ⇒ Re-pin it to the approved A′ text for **both** keys.
  - Add a one-line comment: superseded by the owner's 2026-10-04 approval (TASK-661).
- `src/lib/teacher-schedule-req109.test.ts:162` checks that `empty_checkin`'s TH is Thai. It still holds; confirm it.
- `src/lib/bilingual-flows.test.ts:36-37` checks the send sites' shape (`textReply(tb("empty_checkin"), lang)`). The sites are unchanged, so it should stay green.
- **Check the whole repo for any other pin of the old strings** (`No class today`, `วันนี้ไม่มีคลาส`, `No confirmed class today`, `วันนี้ไม่มีคาบที่ยืนยันแล้ว`) and list what you found.

## Definition of Done
- [ ] Both keys carry the approved text exactly. Prove it with a test that compares against the §0 strings for both keys and both languages.
- [ ] **Break it and watch:** change one character in each language and confirm the pin goes red. File the set as `src/lib/checkin-sentence-task661.mutations.json` (Porter's rule).
- [ ] The inventory script (`scripts/inventory-line-messages.ts`) still runs, and its `replies.csv` shows the new text for both keys. Don't commit the regenerated CSVs; write them to your scratchpad. This is so Fern's next workbook is current.
- [ ] Full suite with **no reachable database** (the SYSTEM-FACTS recipe), plus `tsc --noEmit`. Say that the tree may hold Team A's uncommitted work.
- [ ] `git status`: only `line-i18n.ts`, the pinned test(s) and the mutation set. Nothing committed.

## For the QA hand-off (next batch)
- **Phone, the owner or Tanya:** on a parent account with no confirmed class today, tap check-in, then scan a QR.
  - Both replies must read A′ word for word, in that account's language.
- **API:** no route changes.

## Implementation Notes
**Bob, 2026-10-04.**

**What changed (`smart-scheduler-back`, nothing committed):**
- `src/lib/line-i18n.ts`: the TH and EN of `empty_checkin` and `qr_none` are replaced with A′, plus a two-line comment above `empty_checkin` and a short trailing comment on `qr_none`.
  - **No other key is touched.** There is no `§T-609-CAP` / pre-start text in this file at all. Team A's TASK-643 work is in `scheduler.service.ts`, so my edit was nowhere near it.
  - `line-i18n.ts` had no uncommitted changes before mine.
- `src/lib/line-v2-messages-req107.test.ts`: the "no class today" test is **re-pinned, not deleted**.
  - It now compares both keys × both languages, byte for byte, against the approved strings written into the test, never read from the dictionary.
  - The comment says the REQ-107 text is superseded by the owner's 2026-10-04 approval (TASK-661).
- `src/lib/checkin-sentence-task661.mutations.json` (new).

**Exactness (DoD 1), checked against THIS file, not my typing:**
- A throwaway script read the `empty_checkin` row of the §0 table in this TASK file and compared it with `t(key, lang)` for both keys.
- Result: **EXACT ×4.**
- The apostrophe in "couldn't" is a straight `'`; checked, and there is no `’`.

**Other pins of the old strings:**
- I grepped `src`, `scripts` and `docs` for all four old strings (`No class today` · `วันนี้ไม่มีคลาส` · `No confirmed class today` · `วันนี้ไม่มีคาบที่ยืนยันแล้ว`).
- The only test hit was `line-v2-messages-req107.test.ts:60` (re-pinned). The only other hits were the two dictionary lines themselves.
- `teacher-schedule-req109.test.ts` ("empty_checkin TH is Thai") and `bilingual-flows.test.ts` (the send sites) are green, as expected. The send sites are untouched.

**Mutation set `checkin-sentence-task661`:**
- Tests: req107 + teacher-schedule-req109 + bilingual-flows.
- Each anchor is checked to match exactly once. The EN anchors carry the key so the two identical sentences can't be confused.
- Run: `bun run mutation:run -- --mutations src/lib/checkin-sentence-task661.mutations.json`, DB unreachable:
```
baseline 54 (105 bytes)
C1 BITES (53 pass / 1 fail vs baseline 54) — empty_checkin TH: one character (a space inside ไม่พบ) — restore byte-identical
C2 BITES (53 pass / 1 fail vs baseline 54) — empty_checkin EN: a CURLY apostrophe in couldn’t (the likeliest real slip) — restore byte-identical
C3 BITES (53 pass / 1 fail vs baseline 54) — qr_none TH: one character (a space inside ไม่พบ) — restore byte-identical
C4 BITES (53 pass / 1 fail vs baseline 54) — qr_none EN: the final full stop dropped — restore byte-identical
CHECKSUM identical
```
- **4 BITES · 0 SURVIVED · 0 NO RESULT.**

**Inventory (DoD 3):**
- `bun run scripts/inventory-line-messages.ts <my scratchpad>/inv661` → `pushRows 44 · replyRows 169 · unrendered []`.
- `replies.csv` row 35 (`empty_checkin`) and row 114 (`qr_none`) carry A′. Nothing was written to the workspace and nothing was committed.

**Runs (DB unreachable only, the SYSTEM-FACTS recipe; `.env` untouched):**
- Full suite: **3848 pass / 1 fail, 3849 tests across 307 files**.
- ⚠️ **The 1 fail is not mine, and I checked rather than assumed.** It is `mutation-sets-task627.test.ts` › `pre-start-declared-absence-task609.mutations.json` › "every `from` anchor resolves EXACTLY ONCE".
  - That set's 7 edits all anchor on `src/services/scheduler.service.ts`. That file is Team A's, uncommitted in this tree, and is where TASK-643 is deleting the cap.
  - None of my files is in that set. My two new sets (`task660`, `task661`) pass the same meta-test.
  - ⇒ Team A's in-progress work. I did not touch it, and it is reported here for you to pass on if needed.
- The tree holds Team A's uncommitted work (`api.ts`, `scheduler.service.ts`, `other-series.service.ts`, `validation.ts`, several `src/lib` tests and mutation sets).
- `bunx --package typescript@5.6.3 tsc --noEmit` → **exit 0**.
- `git status` (mine): `line-i18n.ts` · `line-v2-messages-req107.test.ts` · `checkin-sentence-task661.mutations.json`. Plus TASK-660's files from earlier today. Nothing committed.

## Questions
(Bob asks; Silver answers as `> answer: ...`.)

## Review
**Silver, 2026-10-04 — ✅ DONE.**
- **Diff read:** `line-i18n.ts` changes **exactly two lines** (`empty_checkin`, `qr_none`) plus comments. No other key is touched, and nothing near `§T-609-CAP`. The req107 pin is **re-pinned, not deleted**, and the new mutation set is filed.
- **Exactness, checked by machine against the approved source:** I compared `t(key, lang)` with the A′ table in `COPY-DRAFT-checkin-not-confirmed-teamB-2026-10-04.md` §AMENDMENT. **TH and EN are exact for both keys (×4).**
- **Re-run by me, with no reachable database:**
  - req107 + teacher-schedule-req109 + bilingual-flows + parent.service → **68 / 0**;
  - the mutation-set meta-test `mutation-sets-task627.test.ts` → **32 / 0**.
- 📌 **The 1 fail in Bob's full run** (Team A's `pre-start-declared-absence-task609` set, which anchors on `scheduler.service.ts`) **does not reproduce now.** Team A's in-progress work moved on. It was never ours.
  - ⚠️ The tree still holds Team A's uncommitted work.
- **Mutation set `checkin-sentence-task661`:** 4 BITES / 0 / 0. C2, the curly apostrophe, was the right mutation to choose: it is the likeliest real slip.
- The inventory re-run shows A′ on both rows, so Fern's next workbook will be current.
- **Ships with the NEXT batch.** QA line in §For the QA hand-off.
