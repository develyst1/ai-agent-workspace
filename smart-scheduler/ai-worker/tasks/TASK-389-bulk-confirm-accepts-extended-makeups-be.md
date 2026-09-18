# TASK-389 — `bulk-confirm` treats an `EXTENDED` make-up like `PENDING` (`REQ-094`: purple classes never reached the auto check-in) — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-18)
**The fact (verified):** the end-of-day auto-mark selects `status = CONFIRMED` only (`jobs.service.ts:18` — correct: a job never attends an unconfirmed class). A make-up is born `EXTENDED`; **`lib/bulk-confirm.ts:12` proceeds only for `PENDING`**, so make-ups are skipped by the bulk confirm, stay `EXTENDED`, and the job never sees them. A SINGLE confirm accepts them (no status guard). Not a design; a filter.
**Size XS.** 🚫 Do NOT add `EXTENDED` to the job's select.

## §1 The change
- `preCheckBulkConfirm`: `PENDING` **or `EXTENDED`** ⇒ proceed to the real single confirm (the same path; nothing else moves). Already-confirmed / attended ⇒ skipped as today.
- Pinned: a bulk over {PENDING, EXTENDED, CONFIRMED, SICK_LEAVE} confirms exactly the first two · the single confirm's behaviour for EXTENDED unchanged · the job's select literal unchanged (byte pin) · after a bulk confirm an EXTENDED row is CONFIRMED and the job attends it.

## Definition of Done
- [ ] Suite, **count** · tsc · 38 = 38
- [ ] 🔑 Break-and-watch (the filter back to PENDING-only ⇒ fail; EXTENDED added to the job's select ⇒ fail), `finally`, CHECKSUM

---

# 📤 REPORT — @Jason → @Sober (2026-09-18)

✅ **DONE (code), against §1.** **2382 pass / 0 fail**, **189 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (38 = 38)**.

## The change — one line
`lib/bulk-confirm.ts`: `if (booking.status === "PENDING" || booking.status === "EXTENDED") return { proceed: true };` — a proceeding id goes down the SAME path as before (`updateBookingStatus(id, "confirm")`), whose confirm branch reads only `confirmedAt` and never `status` (verified, pinned): an EXTENDED row becomes `CONFIRMED` + `confirmedAt`, exactly what the job selects. CONFIRMED/ATTENDED ⇒ `already_confirmed`; CANCELLED/PAUSED/NO_SHOW/SICK_LEAVE ⇒ `skipped` as before. The header says why (a filter, not a design). **The job's select is byte-identical.**

## Pinned (`lib/bulk-confirm-extended-req094.test.ts`, 8 tests + the TASK-036 pure test re-pointed)
- **By value:** a bulk over {PENDING, EXTENDED, CONFIRMED, SICK_LEAVE} proceeds for EXACTLY the first two; the other outcomes by value; CANCELLED/PAUSED/NO_SHOW still skipped, ATTENDED already_confirmed; the one line by source.
- **The path (source):** `bulkConfirm` = read → `preCheckBulkConfirm` → `updateBookingStatus(id, "confirm")` in that order; the confirm branch reads `confirmedAt` only (no `current.status` before the write) and sets `status: "CONFIRMED", confirmedAt`.
- **🚫 The job's select BYTE-frozen:** the exact `.where(and(eq(bookings.date, runDate), eq(bookings.status, "CONFIRMED"), ended));` line; no `inArray(bookings.status`, no `"EXTENDED"` anywhere in `jobs.service.ts`; the bulk's write literal and the job's filter literal meet on the same string.
- 38 = 38.
- 🔻 `bulk-confirm.test.ts` (TASK-036): EXTENDED moved from the "skipped" list to the "proceeds" test; PAUSED takes its place in the skipped list.

## 🔑 Mutation — five, `finally`, checksum — all bite
A the filter back to PENDING-only (3) · B SICK_LEAVE proceeds too (3) · **C EXTENDED added to the job's select — the wrong fix (2)** · D the bulk loop bypasses the pre-check (1) · E the single confirm grows a status guard (1). Every restore byte-identical.

📌 Nothing for @Fern: the bulk's request/response shapes are unchanged; a make-up now returns `confirmed` instead of `skipped`. For Tanya on `sid`: create a make-up (purple), bulk-confirm its day ⇒ it turns CONFIRMED; the 17:30 job then attends it.
