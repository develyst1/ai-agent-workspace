# TASK-839 — BE: **REQ-131 the admin alert "ผู้ปกครองแจ้งลาไม่สำเร็จ — อายุคอร์สไม่พอสำหรับคาบชดเชย" names the child and the class** (not "- · -") — @Jason, ≈ 0.3 d incl. +10%
**From @Sober, 2026-10-25.** GRANTED by Porter (inbox/SA.md, 10-25). **Git: on the owner's word only.**

## The cause (read 10-25, inbox/PM.md)
- `notifyAdmins(payload, exec, bookingId)` (`lib/line-admin.ts:59`): the **3rd argument** becomes the outbox row's `booking_id`, and the sender fills `{student} · {date}` from that row (`services/outbox.service.ts:97` `bookingContext(row.bookingId)`).
- The parent-leave refusal at `services/line-webhook.service.ts:1047` passes `bookingId` **inside the payload only**. The row's `booking_id` is empty, so it prints "- · -" every time.
- **It is the only `notifyAdmins` call site with this shape.**

## Do
1. `line-webhook.service.ts:1047`: pass the booking as the 3rd argument (`notifyAdmins({ kind, bookingId: b.id }, db, b.id)`, or the exec in scope there).
   - **Note:** the leave was rolled back, but the booking row itself still exists, so the context lookup finds it.
2. **The fallback for rows already queued without it:**
   - when the row's `booking_id` is null and the payload carries `bookingId`, the sender uses it to build the context, for this kind;
   - **or, if cleaner,** for any payload carrying a `bookingId`. Your call; say which, and why.
   - **Byte-identical** for every row that already has `booking_id`.
3. **No new words:** the approved text already has the `{student} · {date}` slots.

## Tests by value
- A parent's leave refused for no validity ⇒ the admin text reads the child's name and the class date (dd-mm-yyyy), **not "-"**.
- An old-shape row (`booking_id` NULL, `payload.bookingId` set) ⇒ also named.
- A row with neither ⇒ still "- · -" (no crash).
- Another kind's rendering is unchanged.

## Mutations
- The 3rd argument dropped at 1047.
- The fallback removed.
- The fallback reading the wrong field.

## Done means
- tests by value + the set (each bite shown);
- tsc 0 · the SAFE suite;
- `unhandled-between-tests: N`;
- `git status` in full.

**List every pin first.** Team B's TASK-749 files are in the same tree: **leave them alone**, and list only yours.


## Jason (BE) 2026-10-25 — TASK-839 BE (REQ-131): built; ONE pin file outside any grant (set 692) — waiting for GO

**Built:** (1) `line-webhook.service.ts` — the refusal's call is now `notifyAdmins({ kind: "leave_refused_no_validity", bookingId: b.id }, db, b.id)` (the 3rd argument = the row's `booking_id`; the comment sits on its own line above). (2) `outbox.service.ts` — the worker builds its context through `contextBookingId(row)`: the row's own `booking_id` first (byte-identical for every row that has one), and **only for `leave_refused_no_validity`**, when that is NULL, the payload's `bookingId`.
**My call, and why — this kind only, not "any payload carrying a bookingId":** a NULL `booking_id` on other kinds is deliberate (a notice about a day or a series); a general fallback would start naming a class on them. By value, another kind with a NULL `booking_id` and a `payload.bookingId` is built exactly as before (test + mutation B4).
No new words (the approved text already has `{student} · {date}`); no migration; no kind added (count stays 45).

**Tests (new `services/leave-refused-names-the-child-task839.test.ts`, 8, through the REAL worker `processOutboxOnce`):** a row with `booking_id` ⇒ the child's name + `30-10-2026`, not «-»; an OLD-shape row (NULL `booking_id`, `payload.bookingId`) ⇒ named too; neither ⇒ still `- · -`, no crash; another kind unchanged; the row's own id wins over the payload's; `notifyAdmins` writes the 3rd argument on every admin row; source pins on the webhook call and the one helper. **Set `leave-refused-names-the-child-task839.mutations.json`: 5/5 BITE, checksum identical** (B1 the 3rd argument dropped · B2 the fallback removed · B3 the wrong field · B4 any kind · B5 the row's id ignored).

**Pins listed:** the change breaks exactly ONE existing file — `src/services/leave-refused-no-validity-task692.mutations.json` (set 692, Team A's own): its P4 and P5 anchor the OLD line `notifyAdmins({ … bookingId: b.id });` (so `mutation-sets-task627` fails). Re-aim = the three strings `bookingId: b.id });\n` → `bookingId: b.id }, db, b.id);\n` (P4 `from`, P5 `from` and P5 `to`); both still resolve once and keep their bite. No test file changes.

**Verified so far:** tsc 0 · suite 5,158 pass / 4 fail (5,162): TASK-749's 3 reds + this one pin. Not marking green until set 692 is re-aimed.

Ball: Sober — GO for `leave-refused-no-validity-task692.mutations.json` (P4 + P5), please.

## ✅ 2026-10-25 — @Sober → @Jason: set 692 GRANTED + your scope call AGREED
- **`leave-refused-no-validity-task692.mutations.json` P4 + P5:** re-aim the three strings to the new call (`…bookingId: b.id }, db, b.id);`), as listed. **Both must still resolve once and bite.**
- **The fallback for THIS kind only: agreed.** A NULL `booking_id` on other kinds is deliberate (a notice about a day or a series). Your B4 mutation guards that.
- Then: the suite (report it with TASK-749's 3 reds named separately) + sets 839 and 692. Nudge me once green.


## Jason (BE) 2026-10-25 — TASK-839 BE: set 692 re-aimed — GREEN (my files)

- `leave-refused-no-validity-task692.mutations.json`: P4 `from`, P5 `from` and P5 `to` now read `…bookingId: b.id }, db, b.id);` (3 strings, nothing else). **Set 692: 12/12 BITE, 0 survivors, checksum identical** (P4 and P5 both still bite).
- **Set 839: 5/5 BITE**, checksum identical (B1 3rd argument dropped · B2 fallback removed · B3 wrong field · B4 any kind · B5 the row's id ignored).
- **Verified:** tsc 0 · suite **5,159 pass / 3 fail (5,162 tests, 369 files)** — the 3 reds are TASK-749's (`day-end-sweep` / `jobs.service.ts`), none mine; unhandled 0. `git status` (mine): `line-webhook.service.ts`, `outbox.service.ts`, `leave-refused-no-validity-task692.mutations.json` (modified); `leave-refused-names-the-child-task839.test.ts` + `.mutations.json` (new). TASK-749's `jobs.service.ts`, `day-end-sweep.ts`, `day-end-sweep-task749.{test.ts,mutations.json}` are not mine. My run had `.env` present; your no-.env room is yours.

Ball: Sober.

## ✅ 2026-10-25 — @Sober: TASK-839 VERIFIED → READY (`DEPLOY-REQ-131-leave-refused-alert-names-the-child-2026-10-25.md`)
- **No-`.env` clean room** of `5b5f483` + 5 files (Team B's 749 excluded): tsc 0 · SAFE suite **5,140 / 0** · unhandled 0 · 73 = 73 · sets 839 **5/5** · 692 12/12.
- 🧊 Frozen. **Git: on the owner's word only** (5 named files; 749 stays out).

## ⬆️ 2026-10-25 — @Sober: ขึ้น git (the owner's word, verbatim, via Porter) — COMMITTED + PUSHED on `dong`. No deploy
- **back `8db9f74`** `fix: Name the child and the class in the refused-leave admin alert (TASK-839)`.
  - **Exactly the 5 named files** (staged from the verified list; staged count 5; md5s unchanged since the verify).
  - Push: `5b5f483..8db9f74  dong -> dong`. Fetched first: 0 behind.
- **Left in the tree, NOT ours:** Team B's TASK-749 (`jobs.service.ts`, `day-end-sweep*`) and a modified `DEPLOY-scheduled-tasks-windows.md`.
- `merge-workflow.sh` not run (not ordered).
