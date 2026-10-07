# TASK-721 — Team B's half of the front approval-marker audit (`dictionaries.ts`) — FE, XS
- Source: owner ruling 2026-10-07 via @Porter, "the front marker audit runs before FRI 16" · Team A's half is TASK-701 (Fern: 25 flipped, 0 mismatches, 23 with no record) · Fern listed Team B's rows, untouched
- Status: DONE (reviewed by Silver, 2026-10-07) — 23 keys byte-checked, 0 mismatches; the 2 overstated rows now name their real approver (@Porter)
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-07)
- **Claim:** in `src/lib/i18n/dictionaries.ts`, **only the approval COMMENTS of Team B's rows** (below), EN and their TH mirrors. 🚫 **No string changes, no behaviour.**
  - Pins that read these comments ⇒ the standing practice: full suite first, the whole red list to me once, no edit before the grant.

## The rows (re-taken from the file 2026-10-07; Fern's list, lines shift)
`:594` TASK-624 §B · `:986` TASK-662 · `:990` TASK-664 · `:1239` TASK-670 · `:1684` TASK-669 §C. Plus any Team B row the same grep finds that I missed (TASKs 660–689, 696–698): **list it**.
- They all already SAY "approved". This audit is to CHECK that claim against the record, byte for byte, and put it in the standard form.

## The rule (TASK-701 §2, the same one Fern and Jason used)
1. **Find each approval:** in `COPY-REVIEW-2026-09-29.md` (or `-09-28`), or the draft file it approves as drafted (`COPY-DRAFT-*` named in the comment).
2. **Compare every string under that comment byte for byte**, EN and TH. Normalise only whitespace, backticks and `{x}` vs `<x>`.
3. **Equal ⇒ relabel** the comment to `✅ APPROVED by the owner <date> — <record file>:<line>`. Keep any useful note after it.
   - **Different ⇒ 🚫 do NOT relabel and do NOT fix: LIST it** (key, code text, approved text).
   - **No record found ⇒ list it.**
4. 🚫 Never `APPROVED` without a record line you can point at.

## Definition of Done
- [ ] A table in Implementation Notes: relabelled (line · key(s) · record line) · NOT relabelled (line · key · why).
- [ ] `git diff` = comment lines only (show `git diff | grep "^[+-] " | grep -v "//"` is empty).
- [ ] `tsc` · full `bun test` with counts · build. Nothing committed.

## Implementation Notes
**Fanta, 2026-10-07.** `smart-scheduler-front`, `src/lib/i18n/dictionaries.ts` only. Nothing committed. Method: every string under each comment compared with the record by a script (EN and TH, whitespace/backticks/`{x}` normalised), 23 keys. Line numbers are as of now (they sit 2 lower than your list: TASK-698's comment shifted them).

### Relabelled (strings equal the record, EN and TH)
| lines (EN · TH) | key(s) | record line |
|---|---|---|
| :986 · :2983 | `parentPhoneRequired`, `parentPhoneRequiredError` | owner approval `COPY-DRAFT-parent-phone-required-teamB-2026-10-04.md:27-29`; strings :8-9, :11-12 |
| :990 · :2986 | `noParentTag`, `noParentFilter`, `noParentExplainer`, `noParentEmpty` | owner approval `COPY-DRAFT-no-household-visible-teamB-2026-10-05.md:30-35`; strings :9-10, :18-24 |
| :1239 · :3212 | `endedCompleted`, `endedExpired` | owner "1-4 ตามแนะนำ" `log/2026-10-06.md:224-225`; strings `SIZING-teamB-next-round-pile-2026-10-05.md:94-95` |
| :1684 · :3621 | the 10 `people.linkParent*` keys | owner approval `COPY-REVIEW-2026-09-29.md:496-497`; strings `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md:30-39` |
| :1696 · :3632 | `linkCreatedButNotLinked` (TASK-698, a row you did not list) | TH owner `COPY-REVIEW-2026-09-29.md:504`; EN **@Porter** (carried translation) `:511`. Written as two approvers, NOT "by the owner" for the EN. |
| :2651 | `swapTeacherTitle` **TH only** | owner ruling `log/2026-10-06.md:224,227` (the title is named in prose, `สลับครู — {ชื่อครูที่เลือก}`, placeholder named in words, same string) |
| :580 · :2653 | `swapTo` (a row you did not list) | **@Porter**, not the owner: `log/2026-10-06.md:612`. The comment already said Porter; I only added the record line. |

### NOT relabelled — listed for you / Porter (🚫 not fixed)
| line | key | why |
|---|---|---|
| :594 · :2662 (:596-597, :2663-2664) | `swapRate`, `swapRateHint` (TASK-624 1b) | The strings equal the draft `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md:15-16` byte for byte. But **no record line approves those words**: §B carries no approval stamp (only §C does, :21). The nearest line is `log/2026-10-06.md:228`, "1b: the TASK-634 rate ruling carries over", which approves the *rule*, not the sentence. The code comment says "covered by the owner's approval (Silver)", i.e. derivation. **Needs: a record line, or a one-line owner confirmation.** |
| :576 | `swapTeacherTitle` **EN** | The comment says "owner-APPROVED". The record: the owner ruled the TH (`log/2026-10-06.md:227`) and said the EN companion is Silver's to draft and returns only if the meaning moves. The EN words ("Swap teacher — {name}") appear in `inbox/PM.md:1536` (Silver to Porter) and nowhere in a copy record. So "owner-APPROVED" overstates it. **Needs: Porter to record the EN (as he did for 698 EN) or say the comment should read "Silver's companion".** |
| :2061 | `alreadyLinkedToOne` (TASK-593, Team A, Fern) | Already LISTED by Fern in TASK-701; out of my half. Not touched. |

No other Team B row in 660-689, 696-698: `grep "TASK-6[6-9]\|TASK-69\|TASK-7"` finds only the rows above.

### Verification
- `git diff` on `dictionaries.ts`: **14 lines out, 14 in, every one a `//` comment**; `git diff -U0 | grep "^[+-] " | grep -v "//"` is **empty**. No string, key or behaviour changed.
- `bunx tsc --noEmit` exit 0 · full `bun test` **1095 pass / 0 fail across 122 files** (same as before; no pin read these comments) · `bun run build` exit 0.

## Questions
None blocking. The two NOT-relabelled rows (:594 and :576) need a record from Porter; they ship as they are today meanwhile.

## Review
**Silver, 2026-10-07 — ✅ DONE.**
- **Verified by me:** the `dictionaries.ts` diff is 14/14 comment lines with **0 non-comment changes**. tsc, the full suite 1095/0 and the build per Fanta; no pin reads these comments.
- **Both NOT-relabelled findings are correct**, checked against the log myself:
  - `log/2026-10-06.md:227` approves the TH title and **delegates** the EN to me;
  - `:228` approves the 1b **rule** (it carries over), not the words. §B has no approval stamp.
  - ⇒ The labels "owner-APPROVED" on those rows overstated it. Listing them, not relabelling, is exactly the rule. ⭐ So are the two rows I hadn't listed (698, `swapTo`), and recording two approvers instead of one.
- **Follow-up:** once Porter records the words, a one-line comment relabel each (XS). Until then they ship as they are.
- **Commit `src/lib/i18n/dictionaries.ts` ONLY.** The front tree also holds Team A's uncommitted files (`scripts/mutation/*`, `Calendar/Modal/ReportLeaveDialog.tsx`), and those are not 721's.

## Follow-up (Silver, 2026-10-07) — relabel the 2 listed rows, now recorded. Comments only.
Porter recorded both **as HIS approvals, not the owner's**. I checked by machine that all six strings are in the record verbatim.
| key(s) | record | label must say |
|---|---|---|
| `swapRate`, `swapRateHint` (EN + TH) | `COPY-REVIEW-2026-09-29.md:572-573` | **`✅ APPROVED by @Porter 2026-10-07 — COPY-REVIEW-2026-09-29.md:572-573`** (the owner approved only the RULE, `log/2026-10-06.md:228`) |
| `swapTeacherTitle` **EN** | `COPY-REVIEW-2026-09-29.md:577` | **`✅ APPROVED by @Porter 2026-10-07 under the owner's delegation of the EN (log/2026-10-06.md:227) — COPY-REVIEW-2026-09-29.md:577`** |
- 🔴 **Never "owner-approved" on these** (Porter: a label must name its REAL approver, because "approved" is not one state).
- The TH title stays as you labelled it (owner).
- Byte-check again first. `git diff` = comment lines only. Full suite. Nudge me.

## Follow-up done (Fanta, 2026-10-07)
- Byte-checked first: all six strings in `COPY-REVIEW-2026-09-29.md:570-577` equal the code (EN and TH). Relabelled, naming Porter, never "owner":
  - `swapRate`/`swapRateHint` (EN :594, TH :2662): `✅ APPROVED by @Porter 2026-10-07 — COPY-REVIEW-2026-09-29.md:572-573 (the owner approved only the RULE, log/2026-10-06.md:228)`.
  - `swapTeacherTitle` EN (:576): `✅ APPROVED by @Porter 2026-10-07 under the owner's delegation of the EN (log/2026-10-06.md:227) — COPY-REVIEW-2026-09-29.md:577`. TH title unchanged (owner).
- `git diff | grep "^[+-] " | grep -v "//"` is empty. tsc 0 · full `bun test` 1095/0 · build: the first run failed with `ENOTEMPTY rmdir .next/standalone/.next` (a transient file lock in the git-ignored build output, nothing in source); the next two runs exit 0.

**Silver, 2026-10-07 — ✅ FOLLOW-UP DONE, TASK CLOSED.**
- Verified: `:576` (EN title) and `:594`/`:2662` (rate pair) say "APPROVED by @Porter 2026-10-07", with `COPY-REVIEW:577` and `:572-573`. No "owner-approved" left on them.
- The cumulative diff is **17/17 comment lines, 0 non-comment**. The full suite is **1095 / 0** (re-run by me).
- **Commit `src/lib/i18n/dictionaries.ts` ONLY** (Team A's files are also in the tree).
