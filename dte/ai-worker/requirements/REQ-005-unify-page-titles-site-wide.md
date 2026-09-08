# REQ-005: Unify the browser page titles across the whole site

- Status: DRAFT — 2026-09-08, Porter. **Q1 is ANSWERED** — the owner chose the two-part form
  (`Q2=ข`, `SYSTEM-FACTS.md` **A29**). **Still waiting on him for ONE line: the exact separator /
  word order, and what `/` reads** (§Open questions **Q2**). Not `READY_FOR_SA` on purpose — a SPEC
  cannot be written against a title string nobody has stated.
- Priority: LOW — cosmetic copy on already-working pages. It blocks nothing and nothing blocks it;
  REQ-001 (frontend foundation) keeps its lane.
- Requested: 2026-09-08 by the owner (develyst).
- Deadline: none stated.

## Problem / Goal

After the product-name rename (REQ-004 / SPEC-002), the site's browser tabs no longer agree with
each other. `/` reads `DTE — Develyst The Education` (the exact string the owner fixed in
`SYSTEM-FACTS.md` A19); the other routes still carry the inherited shape — Fern observed
`/courses` rendering `ทักษะทั้งหมด | DTE Platform`.

**Nothing here is broken.** None of those other titles contains the superseded name, so REQ-004's
rename never reached them and no engineer was wrong to leave them alone. This REQ exists only
because the owner, shown the inconsistency, asked for one look across the site:

> **"ให้เหมือนกันทั้งเว็บ"** — *make them the same across the whole site* (2026-09-08;
> `SYSTEM-FACTS.md` **A27**, answering `specs/SPEC-002-product-name-rename.md` §Questions Q5)

It is a **separate REQ by his own framing of the question**, never a widening of SPEC-002 — SPEC-002
is closing on the scope it was written for.

## Requirement

1. Every route's browser page title in `front/` must follow **one single, written-down form**, so
   that no route's tab is shaped differently from another's.
2. The routes and their current titles must be **enumerated from the code first, and the list
   written down**, before anything is edited — the same discipline REQ-004 §Requirement 3 imposed,
   for the same reason: the owner sees what is about to change on a live site.
3. The unified form is **the owner's to state, not anyone's to derive** — see §Open questions Q1.
   Until he answers, no enumeration is specced into edits and no title is changed.
4. Where a route has no title of its own today, that must be reported as part of the enumeration,
   not silently given one.

## Acceptance Criteria

- [ ] A written enumeration of every `front/` route and the exact title it renders today, produced
      by a repeatable search over the repo on `develop` (command and its actual output recorded).
- [ ] The unified title form is recorded verbatim from the owner's own words before any edit.
- [ ] After the change, every enumerated route's title matches that form — confirmed **in a
      browser**, route by route, not by reading the source. Anything not actually opened is written
      `UNVERIFIED` (there is no QA role here).
- [ ] `front/` builds and every touched route still renders — the engineer's own command output.
- [ ] `DTE — Develyst The Education` (A19) is not altered on `/` unless the owner's answer to
      §Open questions **Q2.2** explicitly changes it.
- [ ] Every title is `<page name><separator><site part>` per A29, with the separator and site part
      exactly as the owner states them in **Q2.1** — no route shaped differently, none abbreviated.

## Constraints

- **C1 — `front/` only.** Page titles are frontend copy. `back/`'s Swagger title
  (`DTE API — Develyst The Education`, TASK-012) is a different surface and is **not** in scope.
- **C2 — copy only.** No layout, component, routing, metadata-architecture or SEO redesign is
  authorised by this REQ. If a technically better mechanism exists (a Next.js `title.template`,
  say), choosing it is the SA Lead's call — but it may not change what the user reads beyond Q1's
  answer.
- **C3 — brownfield and LIVE.** `dte.develyst.online` serves real users. No agent deploys, ssh-es,
  or contacts production for any reason, including to check what a title renders there.
- **C4 — the superseded name is already gone** from `front/` and `back/` (REQ-004, verified
  2026-09-08). This REQ must not reintroduce it, and it does not re-open REQ-004's acceptance.

## Out of Scope

- SPEC-002 and REQ-004 in every respect — this REQ neither widens nor reopens them.
- Meta descriptions, Open Graph tags, favicons, and any other metadata that is not the browser
  page title.
- `back/`, the Swagger `/docs` title, and anything outside the repo (C1, C3).
- The `/about` page's Thai copy — still a separate open DATA REQUEST (`SYSTEM-FACTS.md` A10).
- Adding titles to routes that REQ-003 may delete: the inherited portfolio routes
  (`/portfolio` `/services` `/contact` `/blog`) are REQ-003's business. If REQ-003 lands first they
  simply are not in the enumeration; if it has not, they are enumerated and flagged, not styled.

## Open questions

**Q1 → the owner (asked 2026-09-08 by Porter, in Thai). BLOCKING this REQ, and only this.**
"เหมือนกัน" settles that the titles must **match**; it does not settle **what they match to**, and
the two readings put different text in every tab:

- **(a) one string on every page** — every route's tab reads exactly `DTE — Develyst The Education`
  (A19). Consistent and short, but the tab no longer says *which* page you are on, which matters to
  a user with several tabs open and to search results.
- **(b) page name + one unified site part** — each route keeps its own name and they all share the
  same tail, e.g. `ทักษะทั้งหมด — DTE — Develyst The Education` in place of today's
  `ทักษะทั้งหมด | DTE Platform`. The pages are then "the same" in shape while still telling the user
  where he is; `/` stays exactly A19.

⚠️ **Not to be decided by the SA Lead, the engineers, or Porter.** REQ-004 §Requirement 2's phrase
"no tagline, no suffix, no site-name separator, no per-page template" was written as a rule about
*the string that replaces the old name* — it is **not** an answer to this question, and reading it
as one would be inferring a copy rule from a document (PM.md: a rule is a fact only when the owner
states it). If (b) is chosen, the **exact** separator and word order are his too, in one line.

> **answer (owner, 2026-09-08): (b) — `Q2=ข`.** Recorded verbatim in `SYSTEM-FACTS.md` **A29**
> ("Q2" was that question's number in the digest he was reading; REQ-005 has only this one question).
> Each route keeps its own page name plus **one** unified site part; a single fixed string on every
> tab — (a) — is rejected. **A19 is not rewritten by this.** He answered with the one letter and
> nothing else, so the separator, the word order and `/`'s own text are **still unstated** → **Q2
> below**. Requirement 3 therefore still holds: nothing is enumerated into edits yet.

**Q2 → the owner (asked 2026-09-08 by Porter, in Thai). NOW the only blocker on this REQ.**
(ข) fixes the *shape* — page name + one common tail — but not the *characters*, and the tab text
differs on every route depending on the answer. Two things, one line:

1. **The exact tail and separator.** The example in Q1 was written "e.g." and is deliberately **not**
   an offered string. Candidates, his to pick or overwrite:
   - **(ก)** `ทักษะทั้งหมด — DTE — Develyst The Education` — em dash, full A19 tail (longest; tabs
     truncate early and the user may see only the page name).
   - **(ข)** `ทักษะทั้งหมด | DTE — Develyst The Education` — today's `|` kept, full A19 tail.
   - **(ค)** `ทักษะทั้งหมด — DTE` — em dash, short tail (fits a narrow tab; the full name shows only
     on `/`).
   - **(ง)** something else — he writes the tail exactly as he wants it and that is the rule.
2. **What `/` reads.** Under (ข) the home route has no page name distinct from the site. Porter's
   option-(ข) text said `/` would stay exactly `DTE — Develyst The Education` (A19) — **confirm or
   overwrite**; it is not assumed from a one-letter answer.

⚠️ Same rule as Q1: the SA Lead, the engineers and Porter may not settle either of these. Until they
are answered, no enumeration is specced into edits and **no title is changed** (§Requirement 3).

## Questions

*(SA Lead asks here; Porter answers as `> answer: ...`)* — none yet. This REQ is not
`READY_FOR_SA` until Q1 above is answered.
