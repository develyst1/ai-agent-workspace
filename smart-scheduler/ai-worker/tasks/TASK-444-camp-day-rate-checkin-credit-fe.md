# TASK-444 — `REQ-104 §2` items 4–5a FE: the camp week's day editor gets a per-coach rate box (behind key 59; absent without it); the check-in page shows the remaining credit (camp days / Private sessions or hours) — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S.** Against TASK-443's contract once CONFIRMED (§0 pasted then). After TASK-442. The held batch.

## §0 The contract — CONFIRMED 2026-09-22 (TASK-443)
`GET /api/camp/weeks/:id/days` ⇒ `days[].teacherRates: Record<teacherId, minor>` (0 for a coach without a set rate; the key ABSENT/null without key 59 — render nothing then). `PATCH /api/camp/weeks/:id/days/:date { teacherIds?, startTime?, endTime?, teacherRates? }` — `teacherRates` ⇒ `403 COACH_RATE_FORBIDDEN` without 59, `400 RATE_TEACHER_NOT_ON_DAY` for a coach not on the day. Scans: `POST /api/checkin/camp` ⇒ `+ credit: { remainingDays, totalDays }` (half days ⇒ `3.5`); `POST /api/checkin` ⇒ `+ remaining: { used, total, unit: 'sessions'|'hours' } | null` (null on a trial/single ⇒ no line). No client arithmetic.

## §1
- **The day editor** (`OpenWeekDialog` / the per-day swap dialog, TASK-418's): a `฿ rate` box per coach on the day — rendered only with `can(coach-rate)` (the `withoutRates` guard already strips the field), prefilled from `teacherRates` (0 ⇒ `0`, not blank), sends only when changed.
- **The check-in page** (`CheckinContent`, both kinds): after a successful scan, one line — camp: `Remaining : 3.5/10 days`; Private: `Remaining : 7/10 sessions` or `… hours` — from the response, no arithmetic; nothing on `already`.
- Copy both languages for the UI labels (the notice bytes are the server's). Snapshot unchanged.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the rate box by the key · the credit line by value (both kinds; `already` shows none) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22. **The camp day editor's per-coach rate box (key 59; masked ⇒ nothing) · the check-in page's ONE `Remaining` line from the response (camp days · course sessions · voucher hours).**

```
bunx tsc --noEmit → exit 0
bun test          →  555 pass / 0 fail   (was 550; +5 — new lib/camp/camp-rate-credit.test.ts)
bun run build     → ok
git status        →  6 source modified (contract.ts · camp/grid.ts · camp/units.ts · dictionaries · OpenWeekDialog · CheckinContent) · 1 new test · 2 pins moved
```
Built to §0 (TASK-443). No new key; the snapshot unchanged (59, pinned). 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/camp/grid.ts`), value-tested:** `dayRates(day)` — the rates restricted to the coaches ON the day, a missing
  rate read as `0` (the server's default: the box shows `0`, not blank); `null` (masked without 59) or absent (an older
  payload) ⇒ `null` (mutations 1, 3). `dayPatch` gains `teacherRates` ONLY when a rate on the edited day's coaches differs
  from the server's (mutation 2); a coach removed from the day is not in the rates sent (the server's 400 for an off-day
  coach); a coach added with nothing typed sends no rates (the server defaults him to `0` by absence — nothing changed);
  a masked day never sends rates. `changedDayPatches` unchanged.
- **The day editor (`OpenWeekDialog`, the edit face's per-day table):** a fifth column `Rate per coach (฿)` rendered only
  with `can(COACH_RATE_KEY)` AND when the server sent the rates unmasked (mutation 8) — hidden, never disabled; in it one
  `NumberInput` per coach on the day (the coach's nickname as prefix, baht, step 50), prefilled from the DTO. On save every
  per-day PATCH goes through `withoutRates(body, canRate)` (mutation 9) — the field is stripped without the key, and the
  server 403s regardless; the 403 / the 400 (`ตั้งค่าเรทได้เฉพาะครูที่อยู่ในวันนี้`) reach the dialog as the server's sentence,
  what was typed stays. The swap door (`CampBlockPanel`, `teacherIds` only) untouched.
- **Pure (`lib/camp/units.ts`):** `remainingLine({ kind: "camp", credit })` ⇒ `checkin.remainingDays { remaining, total }`
  (`3.5` as sent — mutation 4 rounds it and fails); `remainingLine({ kind: "session", remaining })` ⇒ `remainingSessions` |
  `remainingHours` by the server's `unit` (mutation 6); `null` / absent ⇒ `null` (mutation 5). No arithmetic — asserted
  on the lib and the page by regex.
- **The check-in page (`CheckinContent`, both views):** one `RemainingLine` — `Remaining : 3.5/10 days` · `7/10 sessions`
  · `4/10 hours` — only when `!result.already` (mutation 7; pinned on both kinds). The camp view's line sits under the
  card (and the undo line); the session view's under the points line.
- **Contract:** `days[].teacherRates?: Record<string, number> | null` · `CampWeekDayResult.day.teacherRates?` ·
  `CampCheckinResult.credit?: { remainingDays, totalDays }` · `CheckinRemaining { used, total, unit }` (all optional —
  older payloads). Copy **+5 both languages**: `checkin.remaining · remainingDays · remainingSessions · remainingHours`,
  `camp.rateCol` (the notice bytes are the server's — none here).
- Pins moved: the camp copy count 76 → 77; the editor's PATCH line (`body: p.body` → `withoutRates(p.body, canRate)`).

### 🔑 Break-and-watch — nine, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `dayRates` sends an off-day coach's rate too | **2 fail** |
| 2 | the rates always ride (unchanged too) | **1 fail** |
| 3 | a masked day still sends rates | **1 fail** |
| 4 | the camp line rounds the half day on the client (`Math.floor`) | **1 fail** — 📌 first written as `total − (total − remaining)`, which is value-identical: a no-op mutation, not a slipped pin; replaced |
| 5 | a trial/single (`null`) prints a line | **1 fail** |
| 6 | hours print as sessions | **1 fail** |
| 7 | the line shows on `already` | **1 fail** |
| 8 | the rate column shows without key 59 | **1 fail** |
| 9 | the PATCH skips the `withoutRates` guard | **2 fail** |
`md5` identical on the four mutated files.

### Definition of Done
- [x] **555 / 0** · `tsc` 0 · build ok
- [x] The rate box by the key (and the server's mask) · the credit line by value (both kinds; `already` shows none) · no arithmetic (asserted)
- [x] 🔑 Break-and-watch — nine, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid` (after `0052` — 53): Camp → edit a week ⇒ the per-day table has a `Rate per coach (฿)` column ONLY for a
role with `bookings.coach-rate` (another role: four columns, as before); each day lists its coaches with a `0 ฿` box
(or the set rate); type a rate on one day ⇒ Save ⇒ ONE PATCH for that day carrying `teacherRates`; a day untouched sends
nothing; a coach typed then removed from the day ⇒ his rate is not sent. A camp scan ⇒ `Remaining : 3.5/10 days` under
the card (a half-day scan shows the half); a course scan ⇒ `Remaining : 7/10 sessions`; a voucher scan ⇒ `… hours`; a
trial / single scan ⇒ no line; scanning the same QR again (`Already checked in`) ⇒ no line.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me on the final tree: **555 pass / 0 fail** · tsc 0 · the `/group-series` wire present · `remainingLine` in `lib/camp/units.ts`. Fern's call accepted: the pre-act cascade line counts students from the DTO, the families number prints only from the server's `familiesTold` (siblings share an account — not knowable client-side).
