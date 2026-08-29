
---

## Implementation Notes (Fern 2026-08-28)
**`smart-scheduler-front`, 7 files (1 new).** You were right that this is mostly wiring into seams that exist —
the badge and the fifth chip genuinely cost **one line each**, because TASK-189 made lifecycle a single server field.

### The seam paid off, and the type caught the rest
Adding `DROPPED` to `CourseStatus` immediately failed the build on `COURSE_STATUS_COLOR` — the map is
`Record<CourseStatus, string>`, so a new state **cannot** be added without deciding how it looks. That's TASK-187's
required-by-default idea working on an enum. The filter picks the fifth chip up from `COURSE_STATUSES` with the
server's counts; **no client recount**, per TASK-189.

**Colour:** amber. A pause is neither a failure nor an ending, so it must not borrow CANCELLED's red or EXPIRED's
grey — the four existing states keep their meanings.

### Drop / resume
One `DropResumeDialog`, two modes. It is deliberately **reassuring where `EndCourseDialog` is grave**: it says the
course keeps its slot and can be resumed, and it asks for a **free-text, optional** reason — matching the BE, which
kept it optional on purpose because a pause has no closed set of causes the way an early ending does.

🔴 **There is no `/drop/preview`.** Rather than invent a count, the sentence uses the **live-session count the plan
already has on screen** and claims nothing the server hasn't. If the two ever had to agree exactly, the answer is a
preview endpoint — not cleverer arithmetic in the dialog.

**Resume** asks for the new expiry (the server requires it: the pause has eaten into the old window) and the Confirm
stays disabled until it's given. `SLOT_TAKEN` from the regeneration, and the refusal codes, surface **the server's own
message** — it knows which slot and why; the dialog doesn't.

### Write gating — one predicate, from the server
`courseWritable = !ended && !dropped`, both read off `summary.status`. A **paused** course therefore hides every
schedule-writing control (including the per-row edit) and offers exactly **one** action: resume. The server refuses
those writes anyway (`COURSE_DROPPED`), so offering them would only hand staff a button that 409s — and I did not
add a second way to ask "is this course over?", which is the duplication TASK-189 removed.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** ·
`bun test src/lib/scheduler/ src/services/` **40/0** · §3.5 **0/0/0/0** · no raw key.
🔴 Rendered → @Tanya. **The case worth testing is resume:** pause a course, resume it with a new expiry, and check it
returns **on its own weekday/time** — and separately that resuming into a slot someone else has taken fails **loudly**
rather than half-rebuilding (Jason's tx rolls it back; the FE just shows what he says).

## Questions
- **Q1 (small, honest):** the drop sentence's session count comes from the plan on screen, not the server. It will be
  right in every normal case, but it is *my* number, not the BE's — unlike the cancel dialog, which uses
  `/cancel/preview`. If you'd rather they be symmetric, that's a small BE `/drop/preview` and I'd wire it in minutes.
