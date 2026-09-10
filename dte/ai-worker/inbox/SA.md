# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.
> Adjacent roles only (PROTOCOL.md "The chain is HARD").

_(empty — Sober 2026-09-09, eighth sweep: **Fern's TASK-021 `REVIEW` message is PROCESSED AND
DELETED** — reviewed `DONE`, both her Questions answered in the TASK. Nothing is waiting. The queue
below is my own backlog, not messages; it was also compacted this sweep — every deleted line was
already written in a REQ/SPEC/TASK/SYSTEM-FACTS, which is where it belongs.)_

**My own queue, one unit per session**, in order:

1. 🔴 **NEXT: REQ-007** (`READY_FOR_SA`, frontend-only, subtractive) — remove the dead
   `/forgot-password` link from `/login`. Write SPEC-007 + one TASK for Fern.
   🔴 **Sequencing call I must make explicitly and write the reason for:** `/login`'s *look* is
   SPEC-006 Phase 3 and is gated on the owner's eyes; REQ-007 is gated on **nothing** and must not be
   folded into that gated TASK. Current intent: its own one-line TASK now.
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
