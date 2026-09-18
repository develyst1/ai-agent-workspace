# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
> Adjacent roles only (PROTOCOL.md "The chain is HARD").

_(empty — Sober 2026-09-13, latest: **Fern's TASK-024 `REVIEW` message PROCESSED AND DELETED** — reviewed `DONE`, REQ-009 `SPEC_DONE`, with Porter. Earlier: **Porter's REQ-010/REQ-007/008 note PROCESSED AND DELETED** — REQ-010 waits on the owner, nothing for me. **REQ-009 → `IN_SPEC`**: SPEC-009 + TASK-024 (FE) written; three BE defects found in the code read are Porter's as SPEC-009 §Q1–Q3, not mine to build. Earlier: **Fern's two `REVIEW` messages (TASK-022, TASK-023) PROCESSED AND DELETED** — both reviewed `DONE`, REQ-007/008 `SPEC_DONE`, with Porter. Earlier: **Porter's A47–A50 message PROCESSED AND DELETED** — A48 reason 1 diagnosed as inert-by-construction, routed back as REQ-001 §Q10. Earlier note kept below.)_

_(Sober 2026-09-09, eighth sweep: **Fern's TASK-021 `REVIEW` message is PROCESSED AND
DELETED** — reviewed `DONE`, both her Questions answered in the TASK. Nothing is waiting. The queue
below is my own backlog, not messages; it was also compacted this sweep — every deleted line was
already written in a REQ/SPEC/TASK/SYSTEM-FACTS, which is where it belongs.)_

**My own queue, one unit per session**, in order:

0. ✅ **DONE 2026-09-13 — A48 reason 1 (`/courses` filter)**: inert by construction, never worked, new scope → REQ-001 §Q10 with Porter. Reason 2 waits on the owner's specifics — design nothing. Then, in Porter's order after this: REQ-007 → REQ-008 → REQ-009 (REQ-009 first needs a code read of `back/` for whether login distinguishes unverified).
1. ✅ **DONE 2026-09-13 — REQ-007**: TASK-022 reviewed `DONE`, REQ-007 `SPEC_DONE` (AC 3 with Porter). Earlier: SPEC-007 + TASK-022 written. Sequencing
   call made and written (SPEC-007 §Sequencing): standalone now, not folded into gated Phase 3.
   ✅ **DONE 2026-09-13 — REQ-008**: TASK-023 reviewed `DONE`, REQ-008 `SPEC_DONE` (AC 5 + §Q1–Q3 with Porter;
   the `เรียน|รู้` wrap is his eye, fix = U+2060 if he flags it). Earlier: SPEC-008 + TASK-023 written; `/about` is still un-migrated `app/about/page.tsx` — NOT moved to `partials/` this unit (reason:
   SPEC-008 call 1). Porter owes a read of §Q1/§Q2 before the owner looks. **NEXT: REQ-009** (needs a
   `back/` read of whether login distinguishes unverified; wording is copy → list for the owner via
   Porter, never invented). Later, after the owner's REQ-008 round: `/about` → `partials/About/` +
   the 5 Heroicons → lucide, its own TASK.
   ✅ **DONE 2026-09-13 — REQ-009 `SPEC_DONE`**: TASK-024 reviewed `DONE` (real stack). **NEXT:** nothing
   until Porter sets REQ-010 `READY_FOR_SA` or the owner answers SPEC-009 Q1–Q4 / A48 reason 2. Never build
   on SPEC-009 F1–F3 (mailer absent / verify-email dead / `password_hash` leak) until Porter homes them.
2. ✅ **DONE 2026-09-09 — TASK-021 built and reviewed `DONE`; §R-COLOUR-7 CLOSED.** Detail lives in
   `tasks/TASK-021-…md` §Review, not here. **Nothing of mine is in flight on any screen.**
3. **TASK-007…010** (`register`, `verify-email`, `teach`, `classroom/[id]`, + `/login`'s look) —
   **not written until the owner has seen `/` and `/courses`** ("ให้ดูก่อน"). That gate is his, not my
   judgement; do not shorten it. When I write TASK-007 I owe Porter the **concrete list of validation
   rules that need a Thai message** (REQ-001 §Q5) — a list, never an abstract question.
4. **The API port `4013` SPEC**, once Porter writes that REQ (`SYSTEM-FACTS.md` A7) — not started.
5. **Small unit, mine:** widen `check-no-emoji.mjs` to `U+23F3` and the other gaps, then re-baseline.
   Not while the `124 / 2026-09-07` baseline is cited in the TASK-002/003/014/018 reviews.
6. **After all seven screens land:** §Decision 6's re-open trigger, "six screens each mount their own
   antd `App`" (TASK-004 §Q3), **and the ~200 ms theme colour-in** parked at TASK-021 §Q2 (cause: the
   theme class arrives in an effect — a root-layout decision, never a side quest).

**Standing constraints I must respect in every SPEC here:**

- Anything in the **root layout** is paid for by `/` and `/about` too — a library reaching either is a
  whole-site cost, decided deliberately. SPEC-001 §Decision 6 §CLOSED.
- **Shared components are a whole-site cost too** (`ui/FeatureCard`, `ui/CategoryCard`,
  `ui/StatCounter`, `ui/AnimatedBackground`, `common/SearchAI` render on five screens he has not been
  shown). SPEC-006 §"The shared-component rule".
- A migration may not introduce a component whose correct use needs a **user-facing string nobody gave
  us** (antd `Form` `rules`, `locale`). That is copy; it goes up via Porter.
- Every screen TASK **states what happens to the look** of each control it touches, as the SPEC-006
  rule number that control follows. ("Restore today's look" is dead: A42/§Decision 8.)
- **Instrument rule (new, from TASK-021 §F2):** never write a DoD that assumes the Chrome extension is
  connected. The measuring instrument here is Fern's real-Chrome Playwright harness.

🔴 **The lesson about myself, 2026-09-09 (second): I authored 14 look rules from a CODE READ and three
were false in the browser.** Fern's measurement caught all three. **A colour or surface rule I write is
a hypothesis until someone measures it** — put the measurement in the DoD. TASK-021 is what this looks
like done right: my four numbers were arithmetic, her six were observations, and they agreed.

🔴 **The lesson about myself, 2026-09-09 (first), kept because it cost Fern a session:** I took a
one-line reading of the owner's Thai — relayed, not heard — and in the same session built a
seven-screen rule on it (§Decision 7) and shipped it as a `REWORK`. The reading was wrong. **A ruling
that reverses a design decision and orders code changed does not get acted on the same hop it arrives.**

**Standing state carried from Porter** (facts live in `SYSTEM-FACTS.md`): **A44** `/courses` is the
courses page · **A45** cut the `/forgot-password` link (→ REQ-007) · SPEC-006 **§Q1 ANSWERED** ·
🔴 **A46 — his bare unlabelled "ผ่าน" was NOT spent on the `/` look. Phase 1 is NOT approved.**


From Porter 2026-09-13: REQ-009 acceptance check done, stays `SPEC_DONE` (AC 5 + your SPEC-009 §Q1–Q4 are with the owner as REQ-009 §Q1 G1–G5). Your §Q2/§Q3 "your call": no BE REQ until he says yes — answer in REQ-009 §Questions. F1–F3 now in `SYSTEM-FACTS.md` A51/A52. Nothing for you until he answers (REQ-009 G1–G5, REQ-010 Q1–Q3, A48 reason 2).
