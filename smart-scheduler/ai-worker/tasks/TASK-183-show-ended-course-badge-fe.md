# TASK-183: An ended course must LOOK ended everywhere (REQ-036 Part B / B2) (FE)

- Source: REQ-036 Part B (Porter 2026-08-25). 🔴 **Urgent (was a queued follow-up — the owner escalated it).** The
  list card shows a green **`ปกติ`** badge on a cancelled course — *"the most misleading pixel in the product, and it
  is the screen staff decide from"* — and the plan header reads `สิ้นสุด ยังไม่มีคาบ` (**never started**) on a course
  deliberately **ended**. BE-only-free: the fields already exist on the DTO.
- Status: ✅ **FE DONE (Sober 2026-08-25)** — tsc 0 (pinned) · build ok · 40/0; both mappers populate the fields, badge branch first. Rendered pass rides @Tanya. Q1 → endorsed, TASK-187 cut.
- Repo: **smart-scheduler-front**. **BE emits the data already** (`smart-scheduler-back/src/types/contract.ts:111-112`
  — `endedAt`, `endReason`); the front type + mapper drop them (the TASK-179-Q2 response-mapper pattern again).

## What to build
1. **Thread the fields through the FE** — add `endedAt: string | null` + `endReason: EndCourseReason | null` to the
   front course/plan type **and its mapper** (mirror how an existing `null`-able field is carried). This is the whole
   root cause: the data arrives and is dropped.
2. **The card badge** — when `endedAt` is set, the course reads **`ยกเลิกแล้ว`** (danger), **not** `ปกติ`. This is the
   headline fix. Reuse the `endCourse.<reason>` keys for the reason.
3. **The plan header** — an ended course shows **`ยกเลิกแล้ว — {reason}`**, never `สิ้นสุด ยังไม่มีคาบ`
   (never-started). An empty plan on an *ended* course means forfeited, not un-begun; say so.
4. **Hide the write actions on an ended course** — `เพิ่มคาบ`, add/move/plan-edit controls do not render for a course
   with `endedAt` set. (The server guard in TASK-185 is the real protection; this is so staff aren't offered a button
   that will 409.)
5. **Surface `409 COURSE_ENDED`** — if a write races the ended state, show the server's message, not a generic error.
   Distinct from `ALREADY_ENDED` (the double-cancel case the dialog already handles).
- Bilingual via `t(...)`, no raw key. No new colors beyond the existing danger/dimmed set.

## Definition of Done
- [ ] 🔴 A cancelled course reads **`ยกเลิกแล้ว`** on the list card — never green `ปกติ`.
- [ ] The plan header of an ended course says ended + reason, never "never started".
- [ ] No add/move/plan/extra-session control is offered on an ended course; a 409 `COURSE_ENDED` (if it races)
      surfaces the server's message.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · no raw key.
- [ ] Rendered verdict → rides @Tanya with the rest of REQ-036.

## Notes
(Fern fills in. Pure FE — the BE already carries `endedAt`/`endReason`; do not touch the BE contract. This is the
visible half of "an ended course is ended everywhere"; TASK-185 is the enforced half.)

---

## Implementation Notes (Fern 2026-08-25)
**`smart-scheduler-front@dong`, uncommitted — 6 files. BE untouched, as specced.**

### Root cause confirmed: the data arrived and was dropped
`dtoToCourseView` is an **explicit allow-list** and never mapped `endedAt`/`endReason`. That single omission is the
whole bug — the green `ปกติ` badge wasn't a badge-logic error, it was a course object that had never heard of being
cancelled. **Fourth time this shape has cost this feature set** (`createBooking` body → TASK-170; `dtoToBooking` →
Part 2; `toSessionRow` → TASK-184; now this).

🟢 **So I made the type carry the weight rather than a comment** — same move Jason made in TASK-184: `endedAt` /
`endReason` are **required** on `CoursePackageView` (both builders always set them). Optional was exactly how they
became `undefined` and the badge stayed green. `toCourseView` normalises the offline path so the two agree.

### What changed
1. **The badge — ENDED outranks everything.** The new branch is **first**, before locked / special-unlock / normal, so
   no other state can win over "this course was cancelled". Reads `ยกเลิกแล้ว — {reason}` (danger + `Ban` icon),
   reusing the `endCourse.<reason>` keys rather than a second vocabulary.
2. **The plan header** no longer says `ยังไม่มีคาบ` on an ended course. That string means *never started*, which is
   the **opposite** of the truth — the sessions were forfeited deliberately. It now reads `ยกเลิกแล้ว — {reason}`.
3. **Write actions are not offered** on an ended course: the whole `เพิ่มคาบ` / insert / owed row is replaced by one
   dimmed line saying why, and **per-row edit is withdrawn too** (`onEdit` made optional on `SessionTable`, so the
   row genuinely offers nothing — rather than a handler that fails).
4. **`409 COURSE_ENDED` already surfaces the server's own message** — every catch in `PlanModal` is
   `e instanceof ApiClientError ? e.message : generic` (6 sites). I added no special-casing: the server's sentence is
   better than anything I'd write, and a new branch would be a second place to keep in sync.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** (used the pinned version per your TASK-184 note —
the env's `latest` tsgo does panic) · `bun run build` **ok** · `bun test src/lib/scheduler/ src/services/` **40/0** ·
§3.5 on both changed components **0/0/0/0** · no raw key.
🔴 Rendered verdict → @Tanya with the rest of REQ-036.

## Questions
- **Q1 (the pattern, fourth occurrence — I'd now argue it's worth a task):** every one of these was a response mapper
  silently dropping a field the BE already sent, and every one was compiler-silent until someone made the field
  required. TASK-172 guards request bodies. The symmetric guard is either (a) types — make DTO-derived view fields
  **required** by default, which caught this one the moment I tried it, or (b) a fixture test per mapper. I lean (a):
  it can't rot and it costs nothing. Not doing it unasked, but four is a pattern, not bad luck.

## Review — ✅ PASS (Sober 2026-08-25)
Reproduced `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · 40/0. Root cause fixed at the
mapper, not papered at the badge: both builders now set the fields — `dtoToCourseView` (`lib/api/mappers.ts:78`, the
real path) and `toCourseView` (`lib/scheduler/leave.ts:27`, the offline path) — and `endedAt`/`endReason` are
**required** on `CoursePackageView` (`types/app/scheduler/index.ts:268`), so a future mapper can't silently drop them
again. The ENDED badge branch is **first** (`CoursePackagePanel.tsx:116`) so no other state outranks "cancelled"; the
plan header no longer reads `ยังไม่มีคาบ` (never-started) on an ended course; write actions withdrawn (incl. per-row
edit made optional so the row offers nothing rather than a failing handler); `COURSE_ENDED` surfaces via the existing
`ApiClientError ? e.message` path (no second place to keep in sync). Good call reusing the `endCourse.<reason>` keys.

### Q1 (the fourth response-mapper omission) — ENDORSED, cut as TASK-187
You're right that four is a pattern, not luck, and your lean (a) is the correct one: **DTO-derived view fields required
by default** caught this the moment you tried it and can't rot — strictly better than a per-mapper fixture test.
**Standing convention from here: a `*View`/app type built from a DTO makes its fields required, so an allow-list mapper
that forgets one fails the build.** Cut **TASK-187** (low-pri) to sweep the remaining course/booking view mappers to
that shape — applied, not just declared. Not urgent; opportunistic before the next mapper touch.
