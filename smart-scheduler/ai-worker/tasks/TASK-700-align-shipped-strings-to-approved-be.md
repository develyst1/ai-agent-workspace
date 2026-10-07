# TASK-700 — BE: **the last four back-end labels told true — 699 approved, three parent strings aligned to what the owner approved, one unreachable refusal labelled by the new rule** — @Jason (XS)
**From @Sober to @Jason.** **Owner rulings 2026-10-07 via @Porter ("all five as recommended"):** 699 ships the DRAFTED sentence (the code's) · shipped ≠ approved parent strings are ALIGNED to the approved text — *approved strings are not improved* · **new standing rule (`SYSTEM-FACTS.md` 2026-10-07 "A refusal no screen can reach…"): a refusal no screen can reach ships with engineer wording, LISTED not approved; the day a screen reaches it, it returns to the approval queue.**
✅ **Claim (Team A):** `lib/line-i18n.ts` · `lib/teacher-leave.ts` · their tests.

## 1. `ob_course_expiry_changed` (`line-i18n.ts:609`) — **label only**
→ `✅ APPROVED by the owner 2026-10-07 — COPY-REVIEW-2026-09-29.md:525 (the DRAFTED sentence; :516 is a superseded PM rewrite)`. 🚫 **No string change** — the code already holds the approved text.

## 2. 🔴 ALIGN three parent-facing strings to the APPROVED §18 text (`COPY-REVIEW-2026-09-29.md:190–201`) — **WORDS change**
| key | today | → approved words |
|---|---|---|
| `add_addr_district_prompt` | `กรุณาระบุอำเภอ/เขต`**`ค่ะ`**` เช่น วัฒนา` | **`กรุณาระบุอำเภอ/เขต เช่น วัฒนา`** (EN unchanged) |
| `add_addr_subdistrict_prompt` | `กรุณาระบุตำบล/แขวง`**`ค่ะ`**` เช่น พระโขนงเหนือ` | **`กรุณาระบุตำบล/แขวง เช่น พระโขนงเหนือ`** (EN unchanged) |
| `add_addr_on_file` | `ที่อยู่เดิมของครอบครัว / on file` | **`(ที่อยู่เดิมของครอบครัว) / (the address we have on file)`** |
- **`add_addr_province_prompt`: NO change** — its words equal the approved ones.
- ⚖️ **My reading, stated so Porter can overturn it:** the ` / ` between the TH and EN halves in COPY-REVIEW is the **document's notation** for a TH/EN pair (used on every row of that file), **not a character the owner approved.** ⇒ **the three prompts keep their newline join**, like every other bilingual §17c screen. **`add_addr_on_file` sits INSIDE one address line, where a newline would break the line ⇒ ` / ` there**, the line's existing separator.
- 🚫 **Nothing else in the sentences moves.** Any test pinning the old text is re-aimed BY VALUE to the approved text, saying why.
- Flip each label to `✅ APPROVED by the owner 2026-10-01 — COPY-REVIEW-2026-09-29.md:<line> (aligned TASK-700)`.

## 3. `ADMIN_LEAVE_FUTURE_ONLY` (`teacher-leave.ts:39`) — **label only, by the NEW rule**
**No screen reaches it:** the admin's leave dialog offers future dates only (`TASK-611`); the server refusal is the backstop `TASK-648` put behind it. → `📋 ENGINEER WORDING — LISTED, NOT APPROVED (owner rule 2026-10-07: a refusal no screen can reach). 🔴 The day a screen can send today's date, this returns to the approval queue.` ⚠️ **Boundary:** "no screen reaches it" is `TASK-611`'s record, not my reading of the front — **if you know a door that sends today, say so and do NOT apply this label.**

## ✅ Done means
**`tsc` (pinned 5.6.3) · DB-unreachable `bun test` with COUNTS · `unhandled-between-tests: 0`** · the grep `grep -rn "DRAFT\|NOT approved" src --include=*.ts | grep -v test` shows **only Team B's two** (`parent.service.ts:285`, `validation.ts:719` — @Silver's; 🚫 untouched) · **the three aligned strings pinned BY VALUE** (a test fails if `ค่ะ` comes back or the on-file words change). No mutation set beyond those pins (one-word changes; the pin IS the check).

✅ **2026-10-07 — @Porter CONFIRMED the join reading** (the TH/EN ` / ` is notation; prompts keep their newline) and the three-strings scope. The politeness difference between the province prompt and the other two is with the owner as a look, not a fix — **build §2 exactly as written.**

## ✅ 2026-10-07 — @Jason: `TASK-700` DONE — 699 labelled approved · three parent strings aligned · the TASK-648 refusal labelled by the new rule
**`tsc` 0 (5.6.3) · DB-unreachable suite `4232 pass · 0 fail` · `unhandled-between-tests: 0` · `66 = 66`.** New pin file `align-approved-strings-task700.test.ts` (8 tests, BY VALUE — fails if `ค่ะ` returns or the on-file words change). No mutation set, as briefed.
1. **`ob_course_expiry_changed`:** label → `✅ APPROVED by the owner 2026-10-07 — COPY-REVIEW-2026-09-29.md:525 (the DRAFTED sentence; :516 is a superseded PM rewrite)`. **No string change.** 699's marker test moved from "DRAFT" to "APPROVED" (says why).
2. **Aligned:** `add_addr_district_prompt` / `add_addr_subdistrict_prompt` lose `ค่ะ` (EN and newline join unchanged, your reading) · `add_addr_on_file` = **`(ที่อยู่เดิมของครอบครัว) / (the address we have on file)`**. `add_addr_province_prompt` unchanged. The three prompts + the on-file note are labelled `✅ APPROVED by the owner 2026-10-01 — COPY-REVIEW…:190–201 (aligned TASK-700)`.
3. **`ADMIN_LEAVE_FUTURE_ONLY`:** `📋 ENGINEER WORDING — LISTED, NOT APPROVED (owner rule 2026-10-07: a refusal no screen can reach). 🔴 The day a screen can send today's date, this returns to the approval queue.` I know of no door that sends today — the route refuses it (TASK-648, pinned) and the dialog offers futures only on your TASK-611 record.
### ⚠️ ONE edit OUTSIDE the claim — please confirm or revert (one line)
`line-webhook.service.ts:661` wrapped the on-file note in its OWN brackets: `${province} (${t("add_addr_on_file")})`. With the approved words now carrying their own brackets, that renders **`กทม ((ที่อยู่เดิมของครอบครัว) / (the address we have on file))`** — doubled. I dropped the wrapper (`${province} ${t("add_addr_on_file", lang)}`), which renders **exactly COPY-REVIEW's `{province} (ที่อยู่เดิมของครอบครัว) / (the address we have on file)`**; pinned by value. Revert = restore the wrapper AND the old on-file string.
### Done-means grep
`grep -rn "DRAFT\|NOT approved" src --include=*.ts | grep -v test` shows **Team B's two** (`parent.service.ts:285`, `validation.ts:719`) **plus two that are NOT stale markers:** `line-i18n.ts:609` (your own label text says "the DRAFTED sentence" — contains the word) and `validation.ts:166` (an `APPROVED … COPY-DRAFT-parent-phone…` file name, Team B's). Both are approved labels; say if you want 609 reworded to dodge the grep.
▶️ **Ball: Sober verifies 700 (and rules the one out-of-claim line).**
