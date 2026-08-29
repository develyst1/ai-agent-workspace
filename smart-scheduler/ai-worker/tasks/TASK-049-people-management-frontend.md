# TASK-049: scheduler-front (FE) — the People screen (parents + students, demographics, suspend)
- Source: SPEC-016 (REQ-019)
- Status: DONE  (reviewed 2026-08-01 by Sober — tsc 0 / build ok, label + badge-untouched + derived-age verified; partial browser check accepted with create/edit routed to acceptance; see Review)
- Depends on: **TASK-048** (endpoints + field contract)
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Add a **People** area to the frontoffice, beside Teachers — today staff have no screen for parents/students at
all (the nav is calendar · teachers · bookings · badges · dashboard · reports).

1. **Nav + route:** new `/scheduler/people` entry (i18n label, TH+EN) following the existing nav config pattern.
2. **List:** parents with **their students shown underneath** (expandable row / grouped card), with **search**
   (`GET /parents?q=` — matches parent name/phone and student name/nickname) and paging, mirroring how the
   Teachers/Bookings screens already do it.
3. **Create / edit:**
   - **Parent:** name, phone, **province** (Thai-province dropdown), note.
   - **Student:** name, nickname, **gender**, **date of birth** (date picker — show the **derived age** next to
     it, never store/enter age), **nationality** (Thai / foreign; "foreign" reveals a free-text country), note.
   - All demographic fields are **optional** — never block saving on them.
4. **Suspend / un-suspend a parent:** an action with a confirm dialog that states plainly what it does —
   *"stops their LINE bot access and new bookings; existing bookings and history are kept"* — plus a clearly
   visible **suspended** state on the row. Reversible.
5. Reuse the app's patterns: Mantine, TanStack hooks + `invalidateQueries`, `notify`, and **all copy via i18n
   (TH+EN)** — no hardcoded strings.

**⚠️ Label the province unmistakably.** The booking modal already has a **badge type named `จังหวัด`** (an ops
tag, per booking). This new field is a **different thing** — the household address. Label it so staff can't
confuse the two (e.g. "จังหวัดของผู้ปกครอง (ที่อยู่)"), and don't touch the badge.

## Definition of Done
- [ ] `/scheduler/people` lists parents with their students underneath, searchable; a parent created via LINE
      shows up here and is editable.
- [ ] Staff can create/edit a parent (incl. province) and a student (incl. gender, DOB with derived age shown,
      nationality); leaving demographics empty still saves.
- [ ] Suspend/un-suspend works, the confirm explains the effect, and the suspended state is visible; nothing is
      deleted.
- [ ] The province field is labelled so it cannot be mistaken for the `จังหวัด` **badge**; the badge is untouched.
- [ ] No regression to Teachers / Bookings / the booking modal.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and**, per our new standard, **actually open the
      screen in a browser** and exercise list → search → create → edit → suspend → un-suspend before calling it
      done. State what you clicked. (This is the REQ-017 lesson: a green build is not evidence the screen works.)

## Implementation Notes
**Fern — DONE, ready for review (2026-08-01). `smart-scheduler-front` only; no BE change.** New `/scheduler/people`.

**What I built** (layered, mirrors Teachers/Bookings):
- **Nav + route:** `nav.people` (TH+EN) in `AdminLayout.config.ts` + `app/(admin)/scheduler/people/page.tsx` →
  `PeopleContent`.
- **Data layer:** `types/app/people` (Parent/Student — API JSON already matches, no mapper) · `services/people.service.ts`
  (list/create/update parent, create/update student, suspend/unsuspend) · `hooks/scheduler/usePeople.ts`
  (TanStack, `invalidateQueries(['parents'])` on every mutation) · `lib/people/th-provinces.ts` (77 provinces).
- **UI:** `PeopleContent` = search (debounced `GET /parents?q=`) + paging + a card per parent (name, phone,
  province, **suspended badge + dimmed** when off) with **its students underneath** (nickname/name + `gender ·
  age · nationality` summary, each editable). `ParentFormModal` (name, phone, **province** labelled
  **"จังหวัดของผู้ปกครอง (ที่อยู่)"** — unmistakable vs the `จังหวัด` badge, which I did not touch).
  `StudentFormModal` (name, nickname, gender, **DOB with derived age shown**, nationality Thai/foreign +
  free-text country when foreign, note). Suspend/un-suspend go through a **confirm dialog stating the effect**
  ("stops LINE bot + new bookings; history kept; reversible"). All copy via i18n TH+EN; age derived (never stored).

**Two contract gaps I handled (flagged below):** (1) `createParent`/`updateParent` accept only phone/name/province
— **no parent `note`** → omitted it from the parent form. (2) `createParentStudent` takes name/nickname/note only
→ the student-create modal collects demographics and I **create-then-`PATCH /students/:id`** to apply
gender/DOB/nationality (service does this in one call).

**Verification:**
- `bunx tsc --noEmit` → **0**; `bun run build` → success (route `/scheduler/people` generated).
- **Browser check (ran the dev app in mock mode, logged in, exercised the real screen):** I added mock-mode
  parity (`people.mock.service.ts`, seeded 3 households incl. a suspended one) so the screen is exercisable
  offline **without touching the real `sid` env**. Exercised live and confirmed:
  - **List** renders parents with their students underneath; **demographics** show as `gender · age · nationality`
    with the **age derived** from DOB (e.g. "อายุ 11 ปี" / "Age 11").
  - **Search** by a child's nickname ("พีพี") narrowed to that one household — searches across parent + student.
  - **Suspend** → confirm dialog ("ระงับบัญชีนี้?" + the effect text) → parent flips to **ถูกระงับ** with an
    Un-suspend button; **Un-suspend** → confirm → returns to active. Reversible, nothing deleted.
  - **TH/EN toggle** re-labels the whole screen (verified both languages live).
  - ⚠️ **Could NOT drive the create/edit *form* modals in-browser:** the Browser pane runs **hidden**
    (`document.hidden === true` — screenshots fail for the same reason), and Mantine's `Select`(searchable) /
    `DatePickerInput` (floating-ui positioning) hang/don't mount without a composited pane. The **plain-text
    suspend modal opened fine**, proving the modal + mutation wiring; the form modals use the **same Modal +
    TextInput + Select + DatePickerInput** components already shipped and working in `TeacherFormModal` /
    `BookingModal`. So create/edit are verified by identical proven patterns + tsc/build, not by a live click.
    Flagging honestly per the REQ-017 standard — if you want a live click-through of create/edit, it needs the
    pane displayed (a user-side action I can't trigger from here).
- `bun run lint` not run — known-broken on Next 16 (not gated).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Contract gap #1 → @Sober:** the task lists a parent **note**, but `createParent`/`updateParent` (validation +
  service) accept only phone/name/province. I **omitted** parent note from the form. Add it to the endpoints if
  คุณฟีน wants it (small BE change) and I'll add the field.
- **Contract gap #2 (handled, FYI) → @Sober:** `createParentStudent` takes name/nickname/note only, so I
  **create-then-`PATCH`** to set a new student's demographics. Works and is invisible to the user; if you'd
  rather the create endpoint accept demographics directly, that's a small BE change and I'll drop the extra PATCH.
- **Browser-check limitation (above):** create/edit form modals couldn't be click-driven in the hidden pane
  (Select/DatePicker). If the DoD's "exercise create/edit" must be a literal live click, it needs the Browser
  pane displayed. Everything else (list/search/suspend/unsuspend/i18n/age) was exercised live.
- **Mock parity note:** I added `people.mock.service.ts` so `NEXT_PUBLIC_USE_MOCK=true` exercises this screen
  offline (parity with the rest of the app). No effect on the real API path.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** Screen is correct; the two contract gaps are answered below (one of
them was **my** mistake), and I'm accepting the partial browser check — with the untested part routed into
acceptance rather than waved away.
- **Verified myself:** `bunx tsc --noEmit` → 0; `bun run build` → success (`/scheduler/people` generated). The
  province label is **"จังหวัดของผู้ปกครอง (ที่อยู่)"** / "Parent's province (home address)" — unmistakable
  against the `จังหวัด` badge, and `git status` confirms **no badge file was touched**. Age is **derived**
  (`dayjs().diff(birthDate,"year")` in both the list and the modal) — never stored, as specced.
- **On the browser check — accepted, and here's the reasoning, because I set this standard two days ago and
  shouldn't bend it silently.** She exercised **list, search-by-child, suspend → confirm → suspended state,
  un-suspend, TH/EN, derived age** live, and stated plainly that the **create/edit form modals could not be
  click-driven** because the Browser pane runs hidden (Mantine `Select`/`DatePickerInput` need a composited
  pane). That is a **tooling limit, honestly reported — not a claim of coverage**, which is exactly what the
  standard was written to prevent. And the untested part is the *same* Modal/TextInput/Select/DatePickerInput
  stack already shipped and working in `TeacherFormModal`/`BookingModal` — **not** an unverified third-party
  surface, which was the REQ-017 failure mode. ⇒ Accepting, **but not pretending it's covered**: create/edit is
  now an explicit item in Porter's acceptance click-through (see the board).
- **Contract gap #1 (parent `note`) — my error, and dropping it was right.** My TASK-049 text listed a parent
  note, but the endpoints I specced in TASK-048 never accepted one. Omitting it is the correct call; I've put
  the small BE addition into **TASK-050 (LOW)** rather than letting it silently vanish.
- **Contract gap #2 (create-then-`PATCH` for a new student's demographics) — accepted as-is.** It works and is
  invisible to the user; the only cost is a small window where a failed PATCH leaves a student without
  demographics, which staff can fix by editing. Folded into **TASK-050** so the create endpoint can take them
  directly later. Not worth blocking this screen for.
- **Mock parity (`people.mock.service.ts`) — good judgement**: it let her exercise the real screen offline
  **without touching `sid`**, which is exactly the right instinct under the brownfield rule.
- **TASK-049 → DONE ⇒ REQ-019 SPEC_DONE** (both tasks complete). Ships with the next frontoffice deploy, after
  TASK-048's `db:migrate` (0014).

## Review
(superseded — see the verdict above)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-049 | scheduler-front (FE): `/scheduler/people` — parents with students underneath, search, demographics modals, suspend/un-suspend (**browser-checked** before DONE) | SPEC-016 | ✅ **DONE** | Fern | TASK-048 |
```
