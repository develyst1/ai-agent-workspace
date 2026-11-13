# TASK-960 — FE: close a whole day, option B (SF) — @Flash (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5013. **Design:** `specs/SPEC-105-close-a-day-option-b.md`. §3 is the contract and §5 is your part. Read both.
- **Repo:** `smart-scheduler-front`, branch `dong`, base `86316ee`. **No git.**
- **Size:** ≈ 1.25 d.
- **Build against SPEC §3 now**, with a typed fake in the service layer the way the other services do. Switch to the real API when Brew's TASK-959 is on sid; I'll tell you.

## Files (closed list; ask me before others)
- `src/types/api/contract.ts`: `ClosedDayRow` + the POST/DELETE result types (reuse `LeaveDayClass`).
- New `src/services/closed-day.service.ts` + `src/hooks/scheduler/useClosedDays.ts`.
- New `src/components/partials/Calendar/{ClosedDayBanner, ClosedDayChip, ClosedDayPanel, CloseDayDialog}.tsx`.
- `src/components/partials/Calendar/CalendarContent.tsx`: mount the banner in day + week views next to `LeaveDayBanner`, add the header button, and read `?date` once on load.
- `src/lib/scheduler/attention-link.ts`: add `{ kind: "day", date }` → `/scheduler/calendar?date=…`. One builder, one reader.
- `src/lib/i18n/dictionaries.ts`: the new words, TH + EN.
- Tests next to each (dom tests, like the leave ones).

## What to build (SPEC §5)
1. **The «ปิดวันทำการ» button** in the calendar header, for admin and CEO only (never for a teacher-scoped session). It opens `CloseDayDialog`:
   - fields one per row: From · To (optional) · Reason (วันหยุด / สถานที่ปิด / สภาพอากาศ / อื่นๆ) · Note (required for อื่นๆ);
   - past dates are disabled; Save/Cancel at the bottom right;
   - after Save: a toast «ปิด N วันแล้ว · มี M คลาสค้างอยู่ — ดูได้ที่ Attention» (from `created` / `classesOnThem`), plus «(K วันปิดอยู่แล้ว)» when `alreadyClosed` is not empty.
2. **`ClosedDayBanner`** on each closed date in day and week views, on the `LeaveDayBanner` pattern:
   - a strip reading «วันปิดทำการ · <reason or note>»;
   - the chip opens `ClosedDayPanel`: date · reason · «ปิดโดย <createdBy> · <createdAt>» · the classes still on it (who · what · when · status), each with «เปิด» (the booking modal, as `LeaveDayPanel` does);
   - the panel also holds «เปิดวันทำการอีกครั้ง», behind a confirm reading exactly: «ยกเลิกการปิดเท่านั้น — คลาสที่ยกเลิก/ย้ายไปแล้วจะไม่กลับมา และไม่มีข้อความถึงผู้ปกครอง».
3. **Attention:** the new card renders itself. Its items carry `link: { kind: "day", date }` and open the calendar on that date.
4. **`DAY_CLOSED` (409):** the server's `message` appears in the existing error toast on every door (create, move, plan editor). Check that the generic handler already does this; add nothing if it does.

## Done = (evidence in `## Implementation Notes`)
- tsc 0 · the SF suite N/0 (paste the summary line) · lint as the repo runs it.
- Dom tests: the dialog's refusals (past date disabled, note required for อื่นๆ); the banner on a closed date in day and week views; the panel lists classes and «เปิด» opens the modal; the re-open confirm text; the attention day-link builds and reads `?date`; no button for a teacher session.
- The real run on sid comes later, after TASK-959: I tell you when, then 3 screenshots (dialog, banner + panel, attention card).

## Questions
- **Flash, 2026-11-13: 2 files off the list:** `app/(admin)/scheduler/calendar/page.tsx` (`<Suspense>` for `useSearchParams`, as bookings/page.tsx did in TASK-841) and `types/app/attention/index.ts` (`link` also allows `{ kind: "day"; date }`).
  > answer (Sector, 2026-11-13): **OK, both added to the closed list.** Each is the minimum the change needs.
- **Flash, 2026-11-13: the sid real run is BLOCKED on the sign-in, and I will not type the password.**
  - **State:** my local front is already on the real API: `.env.local` has `NEXT_PUBLIC_API_URL=https://som.develyst.online/api` and `NEXT_PUBLIC_USE_MOCK=false`. There is no fake to switch off, so the real path is ready.
  - **Block:** every `/closed-days` route needs a signed-in admin session on sid. I may not enter a password, and the desk's standing rule is that nobody types it or signs a token on sid / uat (`machine.local.md` → QA credentials; the "No password logins" ruling). I cannot reach the session any other way.
  - **Smallest path (one):** someone allowed to sign in does it once in the built-in browser pane (my local front, `http://localhost:3000`, sid API), and tells me. I then do the 3 screenshots and the `DAY_CLOSED` refusal myself, future dates only, re-opening every day I close.
  - Checked: DECISIONS / the QA-login ruling, `machine.local.md` — they cover who may log in; they do not give an agent a way in.

## Implementation Notes
### Flash (Team C) — 2026-11-13 — built against SPEC-105 §3 with a typed fake; the real run on sid waits for TASK-959
Repo `smart-scheduler-front`, branch `dong`, base `86316ee`, **nothing committed** (no git).
**Done =**
- **tsc 0** (`npx tsc --noEmit`).
- **SF suite: `1486 pass / 0 fail`, `Ran 1486 tests across 159 files`** (`bun test`). The 26 new tests are in `closed-day-task960.dom.test.tsx`.
- **`next build` passes**, and `/scheduler/calendar` still prerenders with the Suspense wrapper.
- **Lint: not runnable here.** `package.json` says `"lint": "next lint"`, but Next 16 has no `next lint` (`Invalid project directory …\lint`), and the repo has no eslint dependency or config. I did not add one. `tsc` and the build are the static checks I could run.

**Built (SPEC §5):**
1. **«ปิดวันทำการ» button** + `CloseDayDialog`:
   - Fields one per row: From · To (optional) · Reason (วันหยุด / สถานที่ปิด / สภาพอากาศ / อื่นๆ) · Note. Save/Cancel bottom right.
   - Past dates are disabled in both pickers (`minDate` = today). A viewed day in the past starts on today.
   - Save is disabled while «อื่นๆ» has no note, and the refusal is said in words under the field. The server's own refusals (`PAST_DATE`, `NOTE_REQUIRED`, `RANGE_TOO_LONG`) show in a red notice in the dialog.
   - The toast is «ปิด N วันแล้ว · มี M คลาสค้างอยู่ — ดูได้ที่ Attention», plus « (K วันปิดอยู่แล้ว)» when `alreadyClosed` is not empty. `to` is sent only when it is after `from`; `note` only when typed.
2. **`ClosedDayBanner` / `ClosedDayChip` / `ClosedDayPanel`**, on the `LeaveDayBanner` pattern, mounted in the day and week views:
   - The strip reads «วันปิดทำการ · <reason or note>».
   - The panel shows date · reason · «ปิดโดย … · …» · the classes still on it (time · who · what · status), each with «เปิด» (the booking modal, through the existing `LeaveClassOpener`).
   - «เปิดวันทำการอีกครั้ง» sits behind a confirm that reads exactly the approved sentence. Confirm → one `DELETE /closed-days/<date>`.
3. **Attention:** `attentionHref` builds `{ kind: "day", date }` → `/scheduler/calendar?date=…`. `dayRequestFromParams` is the one reader (a real `YYYY-MM-DD` only). `CalendarContent` reads it once, as the initial state of `date`. The card's title is `attention.checks.classes_on_closed_days` (TH «คลาสในวันปิดทำการ» / EN «Classes on a closed day»); the items render themselves as links.
4. **`DAY_CLOSED` (409): nothing added, the existing handlers already do it.**
   - `client.ts` makes an `ApiClientError` whose `message` is the body's message.
   - The create form (`setSubmitError(e.message)`), the move door (toast description) and every catch in `PlanModal` (`setError` / `onError(e.message)`) show it.
   - Pinned in the test file by reading those lines.

**Service layer:** `closed-day.service.ts` calls the real `/closed-days` routes. With `NEXT_PUBLIC_USE_MOCK=true` it uses an in-memory typed fake that answers §3's shapes and its refusals, with `bookings: []` and `classesOnThem: 0`. The hook is `useClosedDays` (read, `enabled` is the gate) with `useCloseDays` / `useReopenDay`. Both writes refresh `["closed-days"]` and the Attention key.

**Tests** (`closed-day-task960.dom.test.tsx`, 26):
- The strip in the day and week views, and nothing on an open day.
- A hook given `enabled: false` sends no request.
- The panel lists the classes, and «เปิด» reads that class's day.
- The re-open confirm text, and a single DELETE after confirm.
- No re-open for a past day.
- The dialog: past dates disabled, note required for อื่นๆ, the POST body, the toast, a server refusal kept in the dialog.
- The attention day link: build, read, round trip, and the card rendered.
- Wiring pins for the gate and the mounts.
- «No button for a teacher session» is pinned at the source, not mounted: `const canCloseDay = !scoped && can("action:calendar.status")` and `useClosedDays(…, !scoped)`.

**Decisions and deviations — please look at these:**
- **Files outside the closed list** (I messaged you before doing them):
  - `src/app/(admin)/scheduler/calendar/page.tsx`: wrapped in `<Suspense>`, because `useSearchParams` needs it at build (the Bookings page does the same).
  - `src/types/app/attention/index.ts`: `AttentionItem.link` also allows `{ kind: "day"; date }`.
- **Three existing pins updated, declared in place.** They were about what this task added.
  - `action-gate.test.ts`: a new site, `CalendarContent.tsx → action:calendar.status`.
  - `teacher-scope.test.ts`: six data hooks, two gated to admins.
  - The TASK-340 `t()`-argument rule found a raw date in `ClosedDayPanel`, and that was my defect. I fixed the code, not the rule.
- **[FE-decided] The button is in `CalendarContent`, in its own right-aligned row under the header, not inside `CalendarHeader`.** `CalendarHeader` is not in the list, and its «Record teacher leave» button sits next to it. If you want it in the header row, it is a one-prop change in `CalendarHeader`.
- **[FE-decided] The gate is `!scoped && can("action:calendar.status")`.** That is the same key as «Record teacher leave». The SPEC says «admin and CEO only», and I found no more specific key.
- **[FE-decided] In the week view each strip also carries its date** (e.g. «Sat 14 Nov · วันปิดทำการ · …»). The strip sits above seven columns, so without it a strip would not say which day.
- **[FE-decided] «Open the day again» is not offered for a past date.** The server refuses it with `PAST_DATE`. A refusal from the server shows in an error toast.
- **[FE-decided] The Attention title key follows the repo's convention** (`attention.checks.<key>`), not `att_<key>` as the SPEC wrote it.
- **EN words are my draft** and unreviewed. The TH words are SPEC-105 / TASK-960's own, pinned verbatim in the test.
- **"Today" is the browser's `dayjs()` date.** The server's is Bangkok. For a viewer in another time zone near midnight the two can differ, and then the server's `PAST_DATE` answer shows in the dialog's red notice.

**Waiting on you:** the real run on sid after TASK-959 (see Review) (3 screenshots: dialog, banner + panel, attention card). Until then the only proof is the fake's.

## Review
_(Sector)_
### Interim review (Sector, 2026-11-13): code ACCEPTED against the fake; DONE waits for the sid run
- **Re-run myself:** SF `tsc --noEmit` 0 · `bun test` **1486 pass / 0 fail**, 159 files.
- **Lint:** no `next lint` in Next 16 and no eslint in the repo, so it can't run. Accepted as a repo fact, not a gap of this TASK.
- **The FE-decided points, all accepted [SA-decided]:**
  - the button in its own row in `CalendarContent`;
  - the gate `!scoped && can("action:calendar.status")` (the same key as recording teacher leave);
  - the date prefix on the week-view strips;
  - no re-open for a past date (it matches the server);
  - the `attention.checks.<key>` title convention (the BE `att_` key is for the LINE digest; both exist);
  - the browser-date note.
- **The 3 updated pins** are about this task's own additions, so they are fine.
- **EN words:** the draft is fine for now. Tanya/Porter may adjust.
- **Still open for DONE:** the real run on sid after TASK-959 is applied there: the 3 screenshots + one DAY_CLOSED refusal seen on a real door. I ring you when it's on sid.
  > answer (Sector, 2026-11-13): **right call. Don't sign in.**
  > - **TASK-960 is DONE on code.** The sid UI run is **NOT_TESTED, by the desk's no-password rule.** It is not a gap in your work.
  > - **The real-API contract is still proven end to end:**
  >   - Brew's route tests use the real `authMiddleware` and `accessGuard` with the exact §3 shapes;
  >   - your service calls the real `/closed-days` routes with `USE_MOCK=false`;
  >   - both sides type the same §3 shapes.
  > - **The one smallest path to a real-UI proof** (someone allowed signs in once in the browser pane on your local front) goes to Porter **once**, with Tanya's round. He decides, and I don't ask again.
  > - If he says yes, you take the 3 screenshots and the DAY_CLOSED refusal (future dates only, every day re-opened), with no new review needed.

### Review (Sector, 2026-11-13): ✅ DONE on code; sid UI run NOT_TESTED (no-password rule), carried to Tanya's round via Porter
- The interim review stands: my re-run tsc 0, SF 1486/0; the FE decisions accepted.
- **Security review:**
  - the close/re-open controls are gated `!scoped && can("action:calendar.status")`, and the server enforces the same act;
  - no secret is in the front;
  - the `?date` reader takes a strict `YYYY-MM-DD` only.
  - Nothing found.
