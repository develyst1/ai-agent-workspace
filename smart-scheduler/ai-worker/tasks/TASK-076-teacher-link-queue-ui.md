# TASK-076: scheduler-front (FE) — teacher link approval queue
- Source: SPEC-023 (REQ-020 Stage 2)
- Status: DONE  (reviewed 2026-08-01 by Sober — collision guard verified in code, approve proven to grant to the CHOSEN teacher against a real second namesake she added herself, all three caches invalidated; tsc 0 / build ok) — 🔴 **MUST SHIP WITH TASK-075**
- Depends on: **TASK-075**
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
Staff need somewhere to approve the teacher LINE-link requests TASK-075 creates. It belongs **alongside
REQ-019's People screens** — placement is yours (its own page or a section) as long as staff can find it
without being told where it is.

1. **A pending list**: claimed nickname, when it arrived, and the teacher it names (if any).
2. **Approve** — one click when the request already names a teacher.
3. **⚠️ Collision case: the request names NO teacher.** Staff must **pick which teacher it is** from those
   sharing that nickname before approving. This is the case the whole feature exists for — two teachers with
   the same nickname, where today the system binds whichever it found first. **Make choosing the obvious
   action, not a hidden extra step**, and show enough to tell them apart (full name at minimum).
4. **Reject**, and **Unlink** an already-linked teacher (a departed teacher otherwise keeps receiving schedule
   pushes forever).
5. **The pending count is already surfaced** by the needs-attention panel (TASK-075 adds the check) — link to
   this screen from there if it is easy, but do not build a second counter.
6. i18n TH+EN.

⚠️ **~22 requests will arrive in the launch fortnight** — nearly every teacher links at once. Make the list work
at that size: it should not need a search box, but it must not become a wall either.

## Definition of Done
- [ ] Pending requests are listed; approve links the teacher; the list updates.
- [ ] A **collision** request cannot be approved without choosing a teacher, and the choice is easy to make
      (staff can tell the candidates apart).
- [ ] Reject works; unlink works and the teacher shows as unlinked afterwards.
- [ ] Nothing here writes a link by any other route — approve is the only action that grants access.
- [ ] TH+EN; no regression to the People screens.
- [ ] `bunx tsc --noEmit` clean; `bun run build` succeeds — **and exercise it in a browser**, including the
      collision case, and say what you saw. If the environment blocks an interaction, say exactly which.

## Implementation Notes — Fern 2026-08-01

### Placement — and why unlink went here too
**Its own nav page, `/scheduler/link-requests`, sitting directly after People** (label "LINE links" /
"ผูก LINE"). You left placement to me; a nav entry is the version staff find without being told, and the People
page is a **parents** list — a teacher queue bolted onto it would be a section about the wrong people.

**Unlink lives on this page rather than on the Teachers page**, as a second section under the queue. Reasoning:
granting a link and removing one are the same decision viewed from either end, and putting them on one screen
means "how do I stop a departed teacher getting pushes?" has one answer, not a row-menu somewhere else. It also
gives the page a purpose when the queue is empty — which, after the launch fortnight, is most days.

### What I built
- `types/app/teacher-link/` — `TeacherLinkRequest` / `LinkCandidate` and an `isCollision()` helper
  (`teacherId === null`), so "collision" has one definition on the FE.
- `services/teacher-link.service.ts` (+ mock) — `GET /teacher-link-requests?status`,
  `POST …/:id/approve`, `POST …/:id/reject`, `DELETE /teachers/:id/line-link`. Matches your route shapes; I
  read `api.ts` + `teacher-link.service.ts` rather than inferring from the spec.
- `hooks/scheduler/useTeacherLink.ts` — queue query + 3 mutations. **Every decision invalidates the queue, the
  teacher roster AND the attention query**, so the pending count staff act on can't disagree with the list they
  just emptied.
- `components/partials/LinkRequests/LinkRequestsContent.tsx` — the screen.
- i18n TH+EN for the whole screen, `nav.linkRequests`, and **`attention.checks.pending_teacher_links`** (your
  9th check was rendering via the API's TH fallback on the EN side until now).

### 🔴 The collision case — how it's made impossible, not just discouraged
The picker is **inline in the request card**, labelled *"Which teacher is this?"* with a one-line reason, and
**Approve is `disabled` until a teacher is named**. Candidates render as **full name + nickname**
(`ครูดิว ธนพล (ดิว)`) so staff can actually tell them apart. Non-collision requests show the identified teacher
as a badge and approve in **one click** — no picker, no extra step for the ordinary case.

I did **not** rely on the UI alone: the mock `approve` **throws `teacher-required` when no teacher is given**,
mirroring your server, so a future UI bug can't look like it works offline.

### Browser check — mock mode, `http://localhost:3016/scheduler/link-requests`
(Verified `location.href` was localhost first; mock mode, no real data touched.)
Mock seeds 3 pending: one ordinary (`แคท` → ครูแคท ปิยะดา), one **collision** (`ดิว`, no teacher, 2 candidates),
one ordinary (`ฟ้า`). I added a real second `ดิว` (`t7 ครูดิว ณัฐวรรณ`) to the roster fixture — a collision
demoed against a fabricated candidate proves nothing.

1. **Collision guard:** read the buttons' `disabled` state directly — `แคท → Approve[disabled=false]`,
   **`ดิว → Approve[disabled=true]`**, `ฟ้า → Approve[disabled=false]`. The collision is the only blocked one.
2. **Candidates:** opened the picker → `[ครูดิว ธนพล (ดิว) | ครูดิว ณัฐวรรณ (ดิว)]` — both full names.
3. **Choosing enables approval:** picked **ณัฐวรรณ** → `Approve[disabled=false]`.
4. **Approve granted it to the teacher I chose:** clicked → queue **3 → 2**, and **ครูดิว ณัฐวรรณ** (not ธนพล)
   appeared under "Linked teachers". That's the whole point of the feature, verified end to end.
5. **Reject:** rejected `ฟ้า` → queue **2 → 1**, and ฟ้า was **not** added to the linked list.
6. **One-click approve:** approved `แคท` with no picker → queue **1 → 0**, empty state
   "No requests waiting.", แคท now linked.
7. **Unlink:** clicked Unlink on `แอน` → confirmation *"Unlink ครูแอน สมใจ from LINE? They will stop receiving
   schedule messages."* → confirmed → **แอน gone from the linked list.**
8. **Attention link:** the panel now renders *"Teacher LINE link requests awaiting approval"* with count **3**
   and an **Open** link → `href=/scheduler/link-requests`. **One badge only — no second counter** (your point 5).
   I added the 9th check to the FE's offline attention fixture, which predated it, so this was exercisable.
9. **TH + EN both render fully** (toggled via `ss.lang`); no raw keys leaked in either.
10. **No regression:** People screen loads normally (3 parents, students, suspend/un-suspend intact); nav shows
    `People → LINE links → Bookings` in order.

### Environment limits — stated exactly
- **Screenshots:** the in-app Browser pane isn't composited (`document.hidden`), so I verified through the
  accessibility tree / page text and drove Mantine's Select through scripted DOM events after the usual
  rAF/visibility patch. Everything above is a real click path, not an inspection of state.
- **Server-side refusals are not exercised offline** — `teacher-linked`, `teacher-archived`, `not-pending`
  (your `decideApproval` races). The UI surfaces them as a red toast carrying the API's own message
  (`ApiClientError`), and I could not force a real 409 in mock. **Worth one line of deploy smoke on sid:**
  approve the same request twice and check the second shows your message rather than a silent no-op.
- **Scale:** I exercised 3 requests, not ~22. The list is a flat card stack with a count header and no
  pagination — deliberate, since you said it "should not need a search box"; at 22 it is a long scroll but each
  row is self-contained. If it reads as a wall on real data, say so and I'll compact the row.

### Scope
**No second counter, no new notification plumbing, parent path untouched, no role switching.** The only write
path to a link on this screen is Approve — reject and unlink never grant anything.

`bunx tsc --noEmit` **clean**; `bun run build` **succeeded** (15/15 static pages, `/scheduler/link-requests`
included).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- Layout and placement are yours. The non-negotiable is that a collision request **cannot** be approved without
  naming the teacher.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0** (my run). `disabled={collision && !picked}`
(`LinkRequestsContent.tsx:90`) with `isCollision` as the single definition, and every decision invalidates the
queue, the roster **and** the attention query (`useTeacherLink.ts:25-27`).

### The browser check is the best one anyone has done on this project
**You added a real second `ดิว` to the roster fixture** rather than demoing the collision against the seeded
one, with the reason stated: *"a collision demoed against a fabricated candidate proves nothing."* That is the
difference between exercising a feature and proving it. And then you verified the thing that actually matters —
**approve granted the link to the teacher you chose (ณัฐวรรณ), not the other one (ธนพล)**. That single assertion
is REQ-020's entire purpose: the old code bound whichever match it found first. Everything else in this stage is
scaffolding around that one check.

Reading the buttons' `disabled` state directly across all three rows (`แคท` false · **`ดิว` true** · `ฟ้า`
false) is also stronger than clicking and observing — it shows the guard is *targeted*, not a blanket disable.

### The judgement calls, all sound
- **Its own nav page rather than a section of People** — correct, and your reason is the right one: People is a
  **parents** list, so a teacher queue bolted on would be a section about the wrong people.
- **Unlink on the same screen.** I hadn't decided this and your argument is better than the alternative:
  granting and removing are the same decision from either end, so *"how do I stop a departed teacher getting
  pushes?"* has one answer instead of a row-menu somewhere else. It also gives the page a purpose once the queue
  is empty — which, after the launch fortnight, is most days.
- **Making the mock's `approve` throw `teacher-required`** so a future UI bug can't look like it works offline.
  The mock mirroring the server's refusal is the same principle as the strip-`suspended` decision on TASK-057.
- **Fixing the EN label for the 9th check** (`attention.checks.pending_teacher_links`) — it was falling back to
  the API's Thai. You noticed a gap in *my* previous task while building this one.

### Your three environment limits — all correctly stated
Server-side races (`teacher-linked` / `teacher-archived` / `not-pending`) can't be forced offline; the UI
surfaces the API's own message via `ApiClientError`. **Your suggested smoke line — approve the same request
twice and check the second shows the message rather than a silent no-op — is exactly right and is now in the
deploy steps.** The scale caveat (3 exercised, ~22 expected) is honest; a flat card stack is what I asked for,
and "say so and I'll compact the row" is the correct offer rather than pre-optimising.

**TASK-076 → DONE. REQ-020 Stage 2 is complete** (TASK-075 + TASK-076).
⏳ **Deploy as a pair, and this pair cannot be split:** `bun run db:migrate` (0015) → restart :4006 → frontoffice.
Backend alone means **nobody can link at all**. Smoke: claim a nickname → "sent to staff" and the teacher stays
unlinked · approve → linked + they get the notice · **approve the same request twice → the second shows a clear
refusal** · claim a shared nickname → one row, no teacher, both candidates · unlink → pushes stop.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-076 | scheduler-front (FE): teacher link approval queue — approve · pick-on-collision · reject · unlink | SPEC-023 | ✅ **DONE** (Sober 2026-08-01 — `disabled={collision && !picked}` with one `isCollision` definition; all three caches invalidated so the pending count can't disagree with the list just emptied. **She added a REAL second `ดิว` to the roster fixture** — *"a collision demoed against a fabricated candidate proves nothing"* — then verified approve granted the link to the teacher **she chose** (ณัฐวรรณ, not ธนพล). That single assertion is REQ-020's entire purpose. Also fixed the EN label for my 9th check, which was falling back to Thai; tsc 0 / build ok) — 🔴 **MUST SHIP WITH TASK-075** | Fern | TASK-075 |
```
