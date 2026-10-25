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
