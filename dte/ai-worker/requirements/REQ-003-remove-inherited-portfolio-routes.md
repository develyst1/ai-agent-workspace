# REQ-003: Remove the inherited portfolio-site routes from the DTE frontend
- Status: READY_FOR_SA
- Priority: MEDIUM — scheduled **after REQ-001** (owner, 2026-09-07: "foundation first"; `SYSTEM-FACTS.md` A12)
- Requested: 2026-09-07 by the owner (develyst)
- Deadline: none stated

## Problem / Goal

`front/src/app/` contains four public routes that are not part of DTE — they read as a
software-agency portfolio site (`/portfolio`, `/services`, `/contact`, `/blog`). They are
live: production runs the tip of `develop` (`SYSTEM-FACTS.md` A4), so real visitors can
reach these pages today and they misrepresent what DTE is.

The owner was shown read-only evidence that these routes really are in the `dte` repo (he
had believed they belonged to another project) and answered in one word: **"ลบ"** — delete
them (owner, 2026-09-07; `SYSTEM-FACTS.md` A8).

Goal: DTE's public site stops serving pages that belong to a different product.

## The owner's own words (verbatim — evidence of intent)

> Question put to him 2026-09-07: *"`/portfolio`, `/services`, `/contact`, `/blog` มีอยู่จริงใน
> repo dte — จะให้เก็บไว้ หรือ ลบทิ้ง?"*
>
> **"ลบ"** (owner, 2026-09-07)

## Requirement

1. The system must no longer serve the routes `/portfolio`, `/services`, `/contact` and
   `/blog` on the DTE frontend.
2. Supporting code that exists **only** to serve those four routes must go with them, so the
   codebase does not keep dead files. Read-only survey 2026-09-07 found
   `front/src/constants/portfolio.ts` and `front/src/constants/services.ts`; whether anything
   else qualifies is a technical determination, not a business one.
3. No link anywhere in the frontend may point at a removed route. Read-only survey 2026-09-07
   found links in `front/src/components/Footer.tsx` (→ `/services`, `/portfolio`, `/contact`)
   and in `front/src/app/verify-email/page.tsx` (→ `/contact`). What each of those links
   becomes instead — removed, or repointed at a DTE page — is a design call for Sober.
4. No route that DTE actually uses may break: `/`, `/courses`, `/classroom`, `/teach`,
   `/login`, `/register`, `/verify-email` must keep working exactly as before.
5. A visitor arriving on an old link to `/portfolio`, `/services`, `/contact` or `/blog` must be
   **redirected to the home page `/`** — not shown a 404 (owner, 2026-09-07: "redirect", answering
   a question whose only redirect target was the home page; `SYSTEM-FACTS.md` A11). *How* the
   redirect is implemented, and whether it is permanent or temporary, is Sober's technical call.
6. `/about` is **kept** and is DTE's own About page (owner, 2026-09-07: "about for DTE";
   `SYSTEM-FACTS.md` A10). Nothing in this REQ deletes it or rewrites its wording — see
   §Out of Scope.

## Acceptance Criteria

- [ ] Requesting `/portfolio`, `/services`, `/contact`, `/blog` on a locally running `front/`
      no longer returns one of the inherited pages — with the actual command and its output
      recorded in the TASK's `## Implementation Notes` (PROTOCOL.md "Evidence").
- [ ] `front/` builds clean and there is no remaining import of a deleted file — evidenced by
      the build/typecheck command and its output, not by reading the code.
- [ ] Grepping the frontend finds no link or nav entry pointing at a removed route.
- [ ] Requesting each of the four removed routes on a locally running `front/` lands on `/`
      (redirect, not 404) — command and its output recorded in the TASK's `## Implementation Notes`.
- [ ] `/about` still loads locally and its content is unchanged by this REQ.
- [ ] The routes listed in requirement 4 still load locally — evidence recorded the same way.
- [ ] The owner has seen the change on his own eyes before it reaches production. There is no
      QA role here and no agent may touch production; deployment is his alone.

## Constraints

- C1 — **Live product.** Production serves the tip of `develop` (`SYSTEM-FACTS.md` A4), so
  these pages are reachable by real users right now. Removal is a user-visible change to a
  live site; it is not a refactor.
- C2 — Frontend only. `front/` is Fern's area via Sober's TASK; nothing in `back/` is in
  scope for this REQ.
- C3 — Work lands as edited files on `develop`. No agent commits, deploys, or touches
  production (PROTOCOL.md "Environments").
- C4 — This REQ is independent of REQ-001. It must not be folded into the component-library
  migration or the Next 16 upgrade: those are gated on the owner's approval, this is not.

## Out of Scope

- **Rewriting `/about` into DTE's own About copy.** The owner ruled that `/about` stays and is
  "about for DTE" (`SYSTEM-FACTS.md` A10), but he did **not** supply the Thai copy for it, and
  nobody may invent user-facing text. This REQ leaves the page exactly as it is; the rewrite needs
  his words first — a content DATA REQUEST Porter carries, tracked on the board.
- Any redesign, restyling, or component-library work on the pages that remain (that is REQ-001).
- Any backend change, including the `4013` port correction (a separate item — `SYSTEM-FACTS.md`
  A2/A7).

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`.) **All three owner questions are ANSWERED
as of 2026-09-07 — nothing in this REQ is blocked.**

- **Q1 (owner) — `/about`.** `front/src/app/about/` also exists and was not in the question he
  answered with "ลบ". Does it go too, or does DTE keep an About page?
  > Asked 2026-09-07, verbatim:
  > "อีกหน้าหนึ่งที่ผมไม่ได้ถามไปคือ `/about` ครับ — จะให้ลบด้วย หรือเก็บไว้เป็นหน้า About ของ DTE?"
  > **answer (owner, 2026-09-07): "about for DTE"** — `/about` **stays**, as DTE's About page; it is
  > NOT deleted. Folded into §Requirement 6. He gave no About copy, so the page's wording is
  > untouched here (§Out of Scope). `SYSTEM-FACTS.md` A10.
- **Q2 (owner) — redirect or 404.**
  > Asked 2026-09-07, verbatim:
  > "หน้าที่ลบไปแล้ว ถ้ามีคนกดลิงก์เก่าเข้ามา จะให้ขึ้น 404 ไปเลย หรือให้ redirect กลับหน้าแรกครับ?"
  > **answer (owner, 2026-09-07): "redirect"** — the only redirect target in the question was the
  > home page, so it binds: old links **redirect to `/`**. Folded into §Requirement 5; mechanism and
  > permanent-vs-temporary are Sober's call. `SYSTEM-FACTS.md` A11.
- **Q3 (owner) — priority.**
  > Asked 2026-09-07: "งานลบหน้าพวกนี้ จะให้ทำก่อน หรือหลัง งาน frontend foundation (REQ-001) ครับ?"
  > **answer (owner, 2026-09-07): "foundation first"** — REQ-001 first, this REQ after. Ordering
  > only: it does not merge the two (§Constraints C4) and does not gate this SPEC. `SYSTEM-FACTS.md` A12.
