# TASK-720 — flip the stale `📋 DRAFT` marker on `STUDENT_ALREADY_HAS_PARENT` (comment only) — BE, XS
- Source: @Porter 2026-10-07 (from @Sober's back-end marker sweep: 24 markers found; this one is Team B's) · Sober's flip rule, adopted by Porter for both teams
- Status: TODO — ▶️ GO
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-07)
- **Claim:** `src/services/parent.service.ts`, the COMMENT above `STUDENT_ALREADY_HAS_PARENT` (~`:283`) only (Porter asked for this flip). 🚫 The string itself is NOT touched.
  - Anything red outside ⇒ the standing practice: full suite, the whole list to me once, no edit before the grant.

## What to do
1. **The flip rule (Sober's, adopted by Porter): flip ONLY if the code string equals the approved text byte for byte.** Any mismatch ⇒ STOP and list it to me. Never fix the string.
   - **Approved text:** `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md` §C, row "server refusal: already has a parent (409)", TH. It was approved with all 10 on 2026-10-06 (`COPY-REVIEW-2026-09-29.md`, the §C approval).
   - **Pre-checked by Silver, 2026-10-07: byte-equal (188 = 188 bytes).** Re-check it yourself, from the files.
2. Replace the comment line `📋 DRAFT wording (owner approves with the next copy batch) — …§C.` with an approved line in the file's style, e.g. `✅ APPROVED wording (owner, 2026-10-06, COPY-REVIEW §C approval) — verbatim; do not "improve" it.`

## Definition of Done
- [ ] The byte-equality check, shown (the command and its result).
- [ ] `git diff` = that comment line only.
- [ ] Full back-end `bun test` with counts (no database). Nothing committed.

## Implementation Notes

## Questions

## Review
