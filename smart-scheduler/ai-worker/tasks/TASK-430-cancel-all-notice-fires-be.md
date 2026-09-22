# TASK-430 — `REQ-101 §5` cancel-all coach notice: FIRES on every live row (PENDING included) + the owner-accepted bytes replace the placeholder — BE, S, defect fix (no contract round)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S.** No migration (50 = 50). No new key. `sid`; the ONLY open item before `uat`.

## §0 What Tanya saw (demo OA, 09-22)
ADDED ✅ and REMOVED ✅ delivered on a 3-date ECA. **Cancel-all ⇒ `200 { cancelled: 3 }` and NO coach bubble.** Cause (read, `other-series.service.ts:124`): `notifySeriesTeachers(…, live.filter(r => r.status === "CONFIRMED"), …)` — Tanya's rows were PENDING (no confirm-all in that run) ⇒ zero rows ⇒ the early `return`. You mirrored the per-row cancel's CONFIRMED-only rule (`:2909`); my contract said "every live row" for the cancel and did not say which rows the NOTICE covers — my gap. **The ruling:** the series notices are their own family — ADDED already tells a coach about PENDING dates, so a cancel-all must tell them those dates are gone. The per-row cancel keeps its CONFIRMED-only rule (a coach never told of a row is not told of its cancel) — unchanged.

## §1 Build
1. `cancelAllOtherSeries`: the notice covers **every LIVE row cancelled** (`live`, not the CONFIRMED subset); one outbox row per teacher (primary + extras across the rows) as now; ATTENDED untouched as now.
2. **The bytes — REQ-101 §5, owner-accepted, NO placeholder:** `❌ ยกเลิกตารางทั้งชุด / ❌ SCHEDULE CANCELLED` · `ตารางสอนถูกยกเลิกทั้งชุด` · `รายการ` / `เหตุผล` (the existing `ob_reason_*` label) / `วันที่` one line per date `DD-MM-YYYY`, the hour once · EN `Your teaching schedule has been cancelled` · `Program` / `Reason` / `Date`. The same block shape as ADDED/REMOVED. Remove the 📖 mark in `line-i18n.ts`; the placeholder-leak census must now see zero for this kind.
3. Pins: a PENDING-only series ⇒ cancel-all enqueues ONE `other_series_cancelled` per coach listing all dates (mutation: the CONFIRMED filter back ⇒ fails); a mixed PENDING+CONFIRMED series ⇒ every date in the one message; the bytes by value (TH+EN, the reason label, `DD-MM-YYYY`); the per-row cancel on a PENDING row still sends nothing (by value — the old rule kept).

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 50 = 50 · the three pins · the placeholder census 0 for this kind · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. 🚫 No deploy request; Tanya re-captures on `sid` after the human restarts it.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-22) — the notice fires on every live row; the owner's bytes in; 2691 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **2691 pass / 0 fail** (+1 test in `other-series-req101.test.ts`; the CANCELLED bytes test rewritten) · `tsc --noEmit` **0** · 50 = 50 · no key.

- **The fix (`other-series.service.ts`):** `cancelAllOtherSeries` now hands `live` (every row it cancelled, PENDING included) to `notifySeriesTeachers` — not the CONFIRMED subset. ONE outbox row per teacher across those rows (primary + extras), as before; ATTENDED untouched; the per-row cancel's CONFIRMED-only rule (`sendClassCancelledToTeacher` `:2909`) untouched — pinned by source beside the new pin.
- **The bytes (REQ-101 §5, owner-accepted — no placeholder):** TH `❌ ยกเลิกตารางทั้งชุด` · `ตารางสอนถูกยกเลิกทั้งชุด` · `รายการ: <title>` · `Time: HH:MM-HH:MM` · `เหตุผล: <the existing ob_reason_* label>` · `วันที่:` one line per date `DD-MM-YYYY`; EN `❌ SCHEDULE CANCELLED` · `Your teaching schedule has been cancelled` · `Program:` · `Time:` · `Reason:` · `Date:` + the lines. The EN labels are the owner's (`Program` / `Date` differ from ADDED/REMOVED's `Item` / `Dates`), so the CANCELLED kind carries its own two label keys (`os_c_item`, `os_c_dates`) and the reason rides `cl_reason` (`เหตุผล` / `Reason`). The 📖 mark is gone from `line-i18n.ts`; the block's comment names the ruling.
- **The three pins:** a PENDING-only series (Tanya's shape) ⇒ cancel-all enqueues ONE `other_series_cancelled` per coach listing all three dates; a mixed PENDING + CONFIRMED series ⇒ every date in the one message; the bytes by value TH + EN (the reason label, `DD-MM-YYYY`); the per-row cancel on a PENDING row still tells no coach (by source); no 📖 in the three kinds' i18n block (by source).
- **Break-and-watch — `mut430.mjs`, 8/8 bite** (`try/finally`, sha-256 restore): A the CONFIRMED gate back · B the notice per row · C the TH title byte-changed · D the EN body back to the placeholder wording · E the 📖 mark re-added · F EN `Item` for `Program` · G the reason label without its TH · H EN `Dates` for `Date`.

🚫 No deploy request; `sid` for Tanya's re-capture after the human restarts it. ⛔ Only you mark this DONE. ▶️ TASK-431's contract follows in its TASK.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me: **2691 pass / 0 fail** · tsc 0 · 50 = 50 · `cancelAllOtherSeries` passes `live` (every row it cancelled) to the notice · `os_cancelled_title` = REQ-101 §5's bytes, no 📖 on the kind. Ready for Tanya's re-capture on `sid` (a PENDING series and a confirmed one).
