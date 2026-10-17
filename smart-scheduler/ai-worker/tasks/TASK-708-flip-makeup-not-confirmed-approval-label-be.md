# TASK-708 — BE: **flip the stale "📋 DRAFT" label on `ob_makeup_not_confirmed` to its real approval** — @Jason (XS, ≈ 15 min) · hygiene, no owner decision
**From @Sober to @Jason, 2026-10-11.** On @Porter's ask (`inbox/SA.md`, 2026-10-11: *"hygiene, cut freely"*). **A comment change only. No string, no test, no behaviour.**
⚠️ **Claim: back `src/lib/line-i18n.ts` is TEAM B's file** (board, batch 10-02). This is the comment above the key **you** wrote in `TASK-702`, lines ≈614–616 ONLY. **Start only once @Porter has written the grant into this task** (he clears it with Team B). Touching anything else in the file ⇒ stop and tell me.

## The change
The comment above `ob_makeup_not_confirmed` still says *"📋 DRAFT: owner approval pending in @Porter's copy set"*. **The owner approved it on 2026-10-07** — `COPY-REVIEW-2026-09-29.md:584`, owner verbatim *"อนุมัติข้อความแจ้งแอดมิน"*.
**Write the label so it names the REAL approval, no more:**
- **TH:** ✅ APPROVED by the owner 2026-10-07 — `COPY-REVIEW-2026-09-29.md:584`.
- **EN:** its companion as drafted — **the owner was shown the TH line only** (the record says so). 🚫 Do not label the EN "owner-approved".
🚫 **The two strings stay byte for byte.** Keep the rest of the comment (what the notice is for).

## ✅ Done means
- `git diff` = **comment lines only**, in that one block; both strings unchanged (check them against `COPY-REVIEW-2026-09-29.md:584–590` by machine, not by eye).
- `tsc` 0 (`bunx --package typescript@5.6.3 tsc --noEmit`) · full suite with the DB unreachable and every connection setting blanked (`SYSTEM-FACTS` 2026-10-08) · **counts** · `unhandled-between-tests: 0`.
- No mutation set: nothing executable changes.
**Then:** my check → owner commit. Rides the next back release; no deploy of its own. No git.

---
## ✅ GRANT — @Porter, 2026-10-11: Team A (@Jason) may edit ONE comment in `src/lib/line-i18n.ts` (Team B's file)
**Scope:** the approval-label comment on `ob_makeup_not_confirmed` only (DRAFT → APPROVED 2026-10-07, `COPY-REVIEW-2026-09-29.md` last-but-one section). **No string, no other line.**
**Why it is safe now:** the back tree was clean when this was granted, and Team B has no open edit in that file. **Condition:** it lands (and the owner commits it) **BEFORE the wording build** (`COPY-SET-khwan-workbook-2026-10-11.md`) is cut to Team B, which rewrites this file. If that cut comes first, 708 folds into it instead.

## ✅ 2026-10-11 — @Jason: `TASK-708` DONE — the `ob_makeup_not_confirmed` label now names the real approval (comment only)
**`tsc` 0 (5.6.3) · suite (DB unreachable, every connection setting blanked) `4312 pass · 0 fail` · `unhandled-between-tests: 0` · `67 = 67`.** No mutation set (nothing executable changed), no git.
**`line-i18n.ts` diff = the two comment lines above the key, nothing else** (`-2/+2`, verified by `git diff -U0`). New label: *"✅ TH APPROVED by the owner 2026-10-07 — COPY-REVIEW-2026-09-29.md:584 (the owner was shown the TH line only); EN is its companion as drafted, not separately owner-approved."* The rest of the comment (what the notice is for) is kept. **Both strings unchanged — compared BY MACHINE against `COPY-REVIEW-2026-09-29.md:584–590`: TH ✅ EN ✅ byte for byte, in the doc and in the code.**
**⚠️ One thing outside the grant, in MY OWN file (not Team B's):** `makeup-born-confirmed-task702.test.ts` pinned the old text (*"marked DRAFT beside the key"*, regex on `📋 DRAFT: owner approval pending`) and failed the moment the label was right. I re-aimed that ONE pin (and its `describe` title) to the new label — it now asserts the TH-approved wording, the "EN not separately owner-approved" sentence, and that the block holds no "DRAFT". Nothing loosened; no other file touched. *(Your brief said "no test" — there was one, and it was mine.)*
▶️ **Ball: Sober — your check → owner commit (rides the next back release).**

