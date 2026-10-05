# DATA REQUEST — the migration LEDGER, read-only, sid AND uat — @Sober, 2026-10-06
**For @Porter → the owner, who runs it.** 🚫 **SELECT only. Nothing here writes. No agent runs it.** **Owner approved uat read-only requests 2026-10-05.**
**Known going in:** **sid's ledger held 113 rows, uat's holds 86, against 65 migrations.** **uat verified GREEN tonight with no repair; sid needed the seed-ledger repair (10-04).**

## 1. The read — run on BOTH boxes, paste the full output of both
```sql
-- A. summary
SELECT count(*) AS rows, count(DISTINCT hash) AS hashes, count(DISTINCT created_at) AS dates
FROM drizzle.__drizzle_migrations_scheduling;

-- B. every row (113 + 86 lines; nothing sensitive in it — a date and the first 12 characters of a file fingerprint)
SELECT id, created_at, left(hash, 12) AS h12, length(hash) AS len
FROM drizzle.__drizzle_migrations_scheduling
ORDER BY id;
```

## 2. The candidate being TESTED — line endings
**Fact, checked today in the repo:** **all 65 migration files are stored LF and check out CRLF on a Windows machine** (`git ls-files --eol`: `i/lf w/crlf` × 65). **The ledger fingerprint is sha256 of the file TEXT** ⇒ **the same migration has TWO fingerprints: one when migrated/seeded from Linux, another from a Windows checkout.** **`verify` and `seed-ledger` match by fingerprint only** ⇒ **a row written under the "other" fingerprint reads as MISSING, and the seed adds a second row for the same migration.**
**The appendix lists, for every migration, its date and BOTH fingerprints (first 12 chars), computed from the repo today.**

## 3. What each result MEANS — 🔑 the read can DISPROVE it as well as confirm it
| what B shows | meaning |
|---|---|
| ✅ **every row's `created_at` is a journal date · no date has more than 2 rows · every `h12` is that date's LF or CRLF fingerprint** | **CONFIRMED.** The surplus is one migration recorded under both line endings. **sid: 48 dates with two rows; uat: 21.** |
| ✅ **…and the two-row dates differ between the boxes** (different migrations, or contiguous id ranges) | **The 113-vs-86 difference is explained:** each box got a different number of migrations applied/seeded from a Windows checkout. **⇒ "per machine", not "per deploy".** |
| ❌ **a row whose `created_at` is NOT any journal date** | **DISPROVED for that row — another writer** (a hand-applied migration, `migrate-through`, or a script). **That writer is the cause to chase.** |
| ❌ **a row whose `h12` is NEITHER fingerprint for its date** | **DISPROVED, and worse: the migration FILE was edited after it was applied.** The schema and the file disagree. |
| ❌ **two rows with the same date AND the same `h12`** | **DISPROVED: something wrote the identical row twice** (the seed dedups by fingerprint, so it is not the seed). |
| ⚪ **`len` ≠ 64** | **Known, not the cause:** legacy rows written with the TAG as the hash (`db-check-migrate.ts`); `migration-ledger.ts` already accounts for them. |

### 🔴 What line endings CANNOT explain — said now, before the read
**A duplicate row carries the SAME date as the real one, and drizzle decides what to apply from the NEWEST date only.** ⇒ **Line endings can make `verify` go RED and grow the surplus, but they cannot make drizzle SKIP a migration.**
⇒ **If the read confirms line endings, the honest conclusion is that sid's "8 missing" were never skipped work: they were applied, and recorded under the other fingerprint** — which matches what the repair found ("missing ledger rows, not missing work"). 🔑 **So I am withdrawing "the surplus made drizzle skip 8" as a claim until the read shows a row DATED LATER than a migration the schema lacked. Only that would be a real skip.**

## 4. If confirmed — the fix (sized XS–S, needs one owner decision)
**Hash normalised (LF) text in OUR verify/seed scripts** · **and pin `drizzle/*.sql` to LF with ONE `.gitattributes` line scoped to that folder** (⚠️ owner's decision — we refused a repo-wide one before). **drizzle-kit hashes the raw file itself, so the pin is what makes a Windows-run migrate write the Linux fingerprint.** 🚫 **No ledger rows are deleted by anyone; the surplus is harmless once nothing reads it as missing.**

## Appendix — every migration's date and both fingerprints (first 12 of sha256), from the repo, 2026-10-06
| idx | tag | created_at (journal `when`) | LF | CRLF |
|---|---|---|---|---|
| 0 | 0000_supreme_zarek | 1782154751279 | e81b50b56318 | 96a2890e8294 |
| 1 | 0001_add_reschedule_fields | 1782743601027 | f1f4b3c19459 | 0611fa74dc59 |
| 2 | 0002_reschedule_slot_index | 1782743623109 | 21a038962583 | 91b761c47bab |
| 3 | 0003_app_settings | 1782747790472 | c201b2c8ad0d | 5841d3cf5813 |
| 4 | 0004_teacher_work_days | 1783000000000 | ac4ed9814a15 | 8294545510f2 |
| 5 | 0005_line_crm_checkin | 1783000000001 | 5721950ebc2b | e9ee874ca929 |
| 6 | 0006_parents | 1783000000002 | d266f1cd4eaf | 1a7e70b1ecbd |
| 7 | 0007_leave_overbook_slot_index | 1783000000003 | c5950a6cf808 | e6798cd4d41f |
| 8 | 0008_badges | 1783000000004 | 9e1120695ad9 | 5d1124a7acaa |
| 9 | 0009_noshow_jobruns | 1783000000005 | 3772fe098939 | 59d237b84a27 |
| 10 | 0010_teacher_archived | 1783000000006 | 1d3f950c4d72 | 7269c6f5297b |
| 11 | 0011_freelance_budgets | 1783000000007 | 119846e1a44b | 5f7e19afaf0c |
| 12 | 0012_line_lang | 1783000000008 | 12d2f0bbc5aa | cdc9b70f9ae5 |
| 13 | 0013_teacher_calendar_token | 1783000000009 | ec50d1477d33 | f9847566cad7 |
| 14 | 0014_people_demographics_suspend | 1783000000010 | 7e0f4a0335bf | 7ce6bc04d5b2 |
| 15 | 0015_teacher_link_requests | 1783000000011 | 08eff36458fd | 3b6d8dafe75d |
| 16 | 0016_subjects_price_group | 1783000000012 | 71e9793e3973 | 17c0e41bd5bd |
| 17 | 0017_entitlement_source | 1783000000013 | aa824e119e89 | a049335610ec |
| 18 | 0018_course_subject | 1783000000014 | 91ecd9212d8b | 3fb808b93373 |
| 19 | 0019_planned_at_creation | 1783000000015 | c508783c22aa | f725801e5bfe |
| 20 | 0020_booking_discount | 1783000000016 | 3d02c0279c87 | 626b824c554e |
| 21 | 0021_course_prior_sessions | 1783000000017 | 7ffc1ac8ea2e | 0800c2620964 |
| 22 | 0022_booking_attendee_note | 1783000000018 | 0de93e99493c | e65181704940 |
| 23 | 0023_course_ended | 1783000000019 | 10b279f10131 | a65b7df29dcc |
| 24 | 0024_course_dropped | 1783000000020 | 154d85e80eef | 6e74fe22eeed |
| 25 | 0025_booking_cancel_reason | 1783000000021 | cab7c87328d4 | df0b4fe16cd7 |
| 26 | 0026_course_leave_quota | 1783000000022 | 3cfb82d7b0be | e6121fd7950a |
| 27 | 0027_course_size_sanity | 1783000000023 | 913c63a4f563 | fbf9b00735c4 |
| 28 | 0028_outbox_idempotency | 1783000000024 | 72fca0d5610f | a55958d2bbbe |
| 29 | 0029_other_booking_type | 1783000000025 | 183f91fad185 | 037edf11b70a |
| 30 | 0030_family_line_links | 1783000000026 | 5cdb0116f7ad | a7b073eb7860 |
| 31 | 0031_line_session_draft | 1783000000027 | c514c67d8e1c | 5bd29d8d0e77 |
| 32 | 0032_booking_paused_status | 1783000000028 | 373ab688bde5 | 7dc7bf016248 |
| 33 | 0033_paused_slot_index | 1783000000029 | ae9ce6792db2 | 053af8fbeb2f |
| 34 | 0034_course_expiry_changes | 1783000000030 | 4ef8eb4e58ad | 591011dc207c |
| 35 | 0035_booking_rentals | 1783000000031 | cf620d8e6ba2 | 650cde96067b |
| 36 | 0036_users | 1783000000032 | dfc217b61f3c | 01b81c59000f |
| 37 | 0037_roles | 1783000000033 | 4bf6b8939069 | 0318ad2aa562 |
| 38 | 0038_course_rental_marker | 1783000000034 | fbc112516b73 | cf76ed0463f1 |
| 39 | 0039_student_archive | 1783000000035 | 8ed2c597457a | dbbde8bc7557 |
| 40 | 0040_other_schedule | 1783000000036 | a53f1015e4d5 | acc4a822f857 |
| 41 | 0041_group_session | 1783000000037 | ecca155c1e54 | 52738028cfda |
| 42 | 0042_camp | 1783000000038 | 0fb87f568f7e | 5ed9ab4c7fc3 |
| 43 | 0043_camp_checkin_token | 1783000000039 | ed76a8d8850e | 6b8e21bb6d04 |
| 44 | 0044_user_teacher_link | 1783000000040 | 8f55c2f14a1a | e3e1fdda222c |
| 45 | 0045_cancel_reason_teacher_leave | 1783000000041 | 986f03e70661 | 31484328fc1e |
| 46 | 0046_parent_archive | 1783000000042 | 09354400db2d | 25e32ababa4e |
| 47 | 0047_camp_week_days | 1783000000043 | cea3f6f23dba | 248d051b07e7 |
| 48 | 0048_duo_course | 1783000000044 | 94ca51b98aec | 9db1003c4835 |
| 49 | 0049_other_series_key | 1783000000045 | 0f55e0e5bcc0 | 43275952d690 |
| 50 | 0050_subject_kind | 1783000000046 | d320eb0e2c85 | 0ecd01a4db76 |
| 51 | 0051_voucher_end | 1783000000047 | 807cc774c240 | 92531cf8636e |
| 52 | 0052_camp_day_rates | 1783000000048 | 638f2f05cd20 | 59067e0062ef |
| 53 | 0053_camp_day_teachers | 1783000000049 | d7127af4fc00 | 5a22f7e201b9 |
| 54 | 0054_group_slot_yield | 1783000000050 | ba0fd43ef0b1 | e46835e75ced |
| 55 | 0055_line_webhook_events | 1783000000051 | b9c899c55988 | dad603ef0532 |
| 56 | 0056_booking_checkin_source | 1783000000052 | c31cb676fc41 | aa5d849ab4e3 |
| 57 | 0057_checkin_channel_actor | 1783000000053 | f7f5563d4cd8 | df452d7ffc50 |
| 58 | 0058_booking_undo | 1783000000054 | 03fbca10cb58 | eaa29d0e4c69 |
| 59 | 0059_attendance_undo_kind | 1783000000055 | 84f916c42b0f | 9a17106d9f74 |
| 60 | 0060_leave_note_undo | 1783000000056 | 04eb55ec67a8 | 9730edaf8647 |
| 61 | 0061_expiry_recording_marker | 1783000000057 | aec61f60027d | 55215a53efdf |
| 62 | 0062_teacher_leave_days | 1783000000058 | fcfb9eab1314 | 6dceb3db5dc2 |
| 63 | 0063_voucher_expiry_changes | 1783000000059 | 32dac136d731 | 7909536a5df6 |
| 64 | 0064_course_reconfirm_needed | 1783000000060 | f2fd216e9cfd | 855564507b7e |