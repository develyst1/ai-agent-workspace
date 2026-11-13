# REQUEST 2026-11-13 · Silver (SA-B) → Porter: deploy ask for sid. Team B: TASK-942 + D-155-1, TASK-961, TASK-962
**What goes up** (smart-scheduler-back and smart-scheduler-front, branch `dong`, the working tree; nothing is committed). Every Team B file below was reviewed by me (the TASK § Review sections).
**Why a deploy now, not a local run:** Fanta can't do a local run. It needs a signed-in SF session, and a password login is not allowed for us. So **sid + Tanya is the real check** for D-155-1 (TEST-155 case 4) and for TASK-961/962.

## SB (smart-scheduler-back)
| TASK | files |
|---|---|
| **TASK-942 + D-155-1** | `drizzle/0078_slot_exempt_park_blocks.sql` · `src/lib/slot-holder.ts` · `src/lib/system-teacher.ts` (+ its mutations json) · `src/services/scheduler.service.ts` (`insertBooking` / `moveBooking` slotExempt, `getCalendar` `more`) · `src/db/schema.ts` (slot_exempt column + index) · `src/types/contract.ts` (`slots[].more`) · tests |
| **TASK-961** | `drizzle/0079_activity_changes.sql` · `src/lib/activity-change.ts` · `src/services/scheduler.service.ts` (4 new functions, notices) · `src/lib/booking-sale-amount.ts` + `src/lib/revenue-line.ts` (one builder plus the relabel; **Sector reviews this hunk**, SPEC-107 § 0) · `src/lib/line-i18n.ts` + `src/lib/line-message.ts` · `src/lib/route-access.ts` · `src/routes/api.ts` · `src/validation.ts` · `src/types/contract.ts` · `src/db/schema.ts` (`activityChanges`) · `src/lib/migration-witness.ts` · `drizzle/meta/_journal.json` · tests |
| **Not Team B's, in the same tree** (Team C's TASK-959 close-a-day) | `drizzle/0077_closed_days.sql` · `src/lib/closed-day.ts` · `src/services/closed-day.service.ts` · `src/lib/attention.ts` · `src/services/attention.service.ts` · `src/services/jobs.service.ts` · `src/middleware/uuid-params.ts`, plus its hunks in the shared files. **Porter: please confirm with Sector that these are reviewed. They already went up in the owner's last sid deploy. If anything changed since and is unreviewed, Sector takes it out before this deploy.** |

**Migrations:** none are pending on sid. 0077, 0078 and 0079 are all `applied · verified` (MIGRATION-QUEUE: Journal 80). **On uat, later:** 0078 and 0079 are the owner's, and both are additive. 0078's index rebuild takes a short lock on `bookings`, so it goes in at a quiet time.

## SF (smart-scheduler-front)
| TASK | files |
|---|---|
| **TASK-942 + D-155-1** | `src/components/partials/Calendar/CalendarGrid.tsx` · `src/lib/api/mappers.ts` · `src/types/api/contract.ts` (`more`) · tests |
| **TASK-962** | `src/components/partials/Bookings/ChangeActivityDialog.tsx` (new) · `src/components/partials/Bookings/PlanModal.tsx` · `src/components/partials/Calendar/Modal/BookingModal.tsx` · `src/hooks/scheduler/useScheduler.ts` · `src/services/scheduler.service.ts` + `scheduler.mock.service.ts` · `src/types/api/contract.ts` · `src/lib/i18n/dictionaries.ts` · `.env.example` · tests |
| **Not Team B's** (Team C's TASK-960) | `CalendarContent.tsx` · `calendar/page.tsx` · `attention-link.ts` · `types/app/attention/index.ts` · `CloseDayDialog.tsx` · `ClosedDay*.tsx` · `useClosedDays.ts` · `closed-day.service.ts`. **Same confirmation from Sector as above.** |
| **Env (SF)** | `NEXT_PUBLIC_BACKOFFICE_URL`: the back-office web address on sid. If it's empty, the confirm screen shows text only and no link. Nothing breaks. |

## The checks after the deploy (stop if any fails)
1. On sid: `bun run db:verify` gives **Journal 80 · witnesses 80 · ✅**. Red ⇒ stop and don't restart the app.
2. Tanya, TEST-155 case 4: 3 park blocks at one hour all show in the No Teacher cell (`data-park-stack="3"`). The others still show one per hour.
3. Tanya, a new TEST for REQ-5014: change one course's activity (the preview, the typed-price case and the no-refund case) and one 1 HR. Attended classes stay as they were. Then a fresh bo-ceo card for the revenue-line read (TEST-155 case 7, and the relabel).
