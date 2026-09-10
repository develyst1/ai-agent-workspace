# REQ-005: Unify the browser page titles across the whole site

- Status: **DELIVERED** — 2026-09-09, Porter. Acceptance-checked against all 6 AC; **all 6 MET**, evidence in `tasks/TASK-015/016/017` §Review — see §"Porter's acceptance check (2026-09-09)" at the end of this file. `DELIVERED` ≠ deployed (PROTOCOL §Statuses): the live site still serves the old titles until the owner ships it. Round 1–3 owner questions are all ANSWERED (A29/A30/A31/A34/A35/A37); nothing on this REQ is open with the owner.
  The unified title is **`<page name> | DTE — Develyst The Education`** and **`/` stays exactly `DTE — Develyst The Education`** — owner-stated (A29/A30/A31), not inferred.
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
3. The unified form is **the owner's to state, not anyone's to derive** — and he has now stated it
   in full (§Open questions Q1 + Q2; `SYSTEM-FACTS.md` **A29** shape, **A30** string, **A31** `/`):
   every route reads **`<page name> | DTE — Develyst The Education`** — separator is the pipe `|`,
   the site part is the **full** A19 string with its em dash (U+2014), never the short `DTE` — and
   **`/` reads exactly `DTE — Develyst The Education`** with no page name of its own. No other
   shape may be substituted, and nothing about the string is anyone's to re-derive.
4. Where a route has no title of its own today, that must be reported as part of the enumeration,
   not silently given one.

## Acceptance Criteria

- [x] A written enumeration of every `front/` route and the exact title it renders today, produced
      by a repeatable search over the repo on `develop` (command and its actual output recorded).
- [x] The unified title form is recorded verbatim from the owner's own words before any edit —
      **done 2026-09-08**: `SYSTEM-FACTS.md` **A29** (two-part shape) + **A30** (separator and tail)
      + **A31** (what `/` reads).
- [x] After the change, every enumerated route's title matches that form — confirmed **in a
      browser**, route by route, not by reading the source. Anything not actually opened is written
      `UNVERIFIED` (there is no QA role here).
- [x] `front/` builds and every touched route still renders — the engineer's own command output.
- [x] `/` still reads exactly `DTE — Develyst The Education` (A19) after the change — the owner
      confirmed it stays unchanged (**A31**, `Q2=คงเดิม`), so altering it is a defect, not a choice.
- [x] Every route other than `/` reads exactly `<page name> | DTE — Develyst The Education` (A30):
      the pipe `|` as separator, the **full** A19 site part with its em dash (U+2014) — no route
      shaped differently, none abbreviated to `DTE`, no route left on `… | DTE Platform`.

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

> **answer (owner, 2026-09-08) — BOTH parts. This REQ is now unblocked.**
> **2.1 = `Q1=ข`** → option **(ข)**: separator is the **pipe `|`**, tail is the **full**
> `DTE — Develyst The Education`, i.e. `ทักษะทั้งหมด | DTE — Develyst The Education` in place of
> today's `ทักษะทั้งหมด | DTE Platform`. Em dash separator (ก) and short `DTE` tail (ค) are
> **rejected**. Verbatim in `SYSTEM-FACTS.md` **A30**.
> **2.2 = `Q2=คงเดิม`** (*keep it as it is*) → `/` **stays exactly** `DTE — Develyst The Education`
> (A19): one part, no page name added. Verbatim in **A31**.
> (His `Q1`/`Q2` are the digest's numbering, not this file's — this file's Q1 was answered in the
> previous round as `Q2=ข`/A29. The mapping is written on each SYSTEM-FACTS line.)
> **Nothing on REQ-005 is open with the owner; status → `READY_FOR_SA`.**

## Open questions — round 3 (2026-09-09)

**Q3 → the owner (asked 2026-09-09 by Porter, in Thai). BLOCKING Part B's fifth route ONLY.**
He has now answered the Part B question in two halves (`SYSTEM-FACTS.md` **A34**, **A35**):

- **The four names are stated and closed** — `/login` → `เข้าสู่ระบบ`, `/register` → `สมัครสมาชิก`,
  `/teach` → `สอน`, `/verify-email` → `ยืนยันอีเมล` (**A34**, mapped positionally in the order the
  question listed the four routes). Nothing about these four is open.
- **`/classroom/[id]`: the rule is stated, the word is not.** `Q2=ชื่อกลาง` (**A35**) chooses the
  branch — **one shared fixed name for every classroom** — and rejects the per-course title. But
  "ชื่อกลาง" names the rule, not the word: it does not say what that shared name reads. REQ-005
  §Requirement 4 forbids anyone here inventing it, so the fifth route stays unbuilt until he writes
  the word. Candidates offered to him, his to pick or overwrite: **(ก)** `ห้องเรียน` · **(ข)**
  `เรียน` · **(ค)** `บทเรียน` · **(ง)** his own word, written exactly as he wants it in the tab.

⚠️ Not the SA Lead's, the engineers' or Porter's to settle. Until it is answered `/classroom/[id]`
keeps reading `DTE — Develyst The Education` and no file for it is edited. The other four are
unblocked and may be built now.

> **answer (owner, 2026-09-09): (ก) — `Q1=ก`. This REQ is now fully unblocked.**
> The shared page name for `/classroom/[id]` is **`ห้องเรียน`** — verbatim in `SYSTEM-FACTS.md`
> **A37**. (ข) `เรียน` and (ค) `บทเรียน` are **rejected**. It is **one fixed name on every
> classroom** — the branch **A35** already chose; the per-course title stays rejected and no
> `generateMetadata` is introduced. With **A30** every `/classroom/<id>` tab reads
> **`ห้องเรียน | DTE — Develyst The Education`**. Nobody may re-word, expand, shorten or
> per-course-ify it (§Requirement 4). **Nothing on REQ-005 is open with the owner any more** — the
> fifth Part B route is now stateable in a TASK exactly like the other four.

## Questions

*(SA Lead asks here; Porter answers as `> answer: ...`)*

**Sober's `specs/SPEC-004-unify-page-titles.md` §Questions Q1 — ANSWERED here** (Porter may not
write in `specs/`, so the answer lives in this REQ and Sober was pointed at it via `inbox/SA.md`):

> **answer (Porter 2026-09-09, from the owner's own words):** four of the five are stated —
> `/login` → **`เข้าสู่ระบบ`**, `/register` → **`สมัครสมาชิก`**, `/teach` → **`สอน`**,
> `/verify-email` → **`ยืนยันอีเมล`** (`SYSTEM-FACTS.md` **A34**). Combined with **A30** each tab
> reads `<name> | DTE — Develyst The Education`. **`/classroom/[id]` is HALF-answered**: **A35**
> settles the rule — one shared fixed name for all classrooms, per-course title **rejected** — but
> the word itself is unstated and is now **Q3 above**, with the owner. So Part B may be tasked for
> **four** routes now, and the fifth stays out of it until Q3 comes back. Nobody invents that word.

> **UPDATE (Porter 2026-09-09, same day, second round): Q3 is ANSWERED — SPEC-004 §Questions Q1 is
> now fully closed.** The fifth route's word is the owner's own: `/classroom/[id]` → **`ห้องเรียน`**
> (`SYSTEM-FACTS.md` **A37**), one shared fixed name, tab reads
> `ห้องเรียน | DTE — Develyst The Education`. Part B may now be completed for **all five** routes.

> **Sober's SPEC-004 §Questions Q2 (the 6 body-copy `DTE Platform` occurrences) — ANSWERED:** the
> owner said **`เปลี่ยน`** = change them (`SYSTEM-FACTS.md` **A36**). By SPEC-004's own framing that
> is **outside REQ-005**, so it does **not** widen this REQ or SPEC-004 — it is the new
> `requirements/REQ-006-replace-dte-platform-body-copy.md` (`DRAFT`, blocked on what they change
> *to*). Nothing in SPEC-004 or TASK-015 changes because of it.

## Porter's acceptance check (2026-09-09)

I checked the six Acceptance Criteria against the evidence already written in the TASK files. I ran
nothing myself and touched no code — every line below points at output an engineer produced and
Sober independently re-ran against the real repo. **All 6 AC are MET → REQ-005 is `DELIVERED`.**

| AC | Verdict | Where the evidence is |
|---|---|---|
| 1 — written enumeration of every route + today's title, repeatable command + real output | **MET** | `tasks/TASK-015-unify-page-titles-front.md` §"Enumeration evidence": the `find`, the `grep -rn "title:"`, the `use client` list (the 5 routes with no title of their own — §Requirement 4's "report it, don't silently give it one"), `generateMetadata` = none, and the em-dash `od` dump. Produced **before** any edit. |
| 2 — the unified form recorded verbatim from the owner before any edit | **MET** (ticked 2026-09-08) | `SYSTEM-FACTS.md` **A29** (two-part shape) + **A30** (pipe + full tail) + **A31** (`/` unchanged), plus **A34**/**A35**/**A37** for the five Part B page names. |
| 3 — after the change every route's title matches, confirmed **in a browser**, route by route | **MET** | All **8** routes were actually opened in a real Chrome tab and read as `document.title` + the tab strip — TASK-015 §DoD 10 (`/`, `/about`, `/courses`), TASK-016 §DoD 12 (`/login`, `/register`, `/verify-email`, `/teach`), TASK-017 §DoD 14 (`/classroom/99`). Nothing was accepted from a source read. Two carries are written `UNVERIFIED` below, not laundered. |
| 4 — `front/` builds and every touched route still renders | **MET** | `npm run build` **exit 0**, same **9** route entries, `/classroom/[id]` still `ƒ Dynamic`; `npx tsc --noEmit` **exit 0**. Run by Fern and re-run by Sober on his own servers (3019 / 3037) — TASK-017 §Review. |
| 5 — `/` still reads exactly `DTE — Develyst The Education` (A19) | **MET** | The rendered `/` title's **pipe count is 0** and its bytes carry `e2 80 94`, re-checked at all three units (TASK-015 §DoD 7, TASK-016, TASK-017 §DoD 10). A31 never regressed — the one way this design could have failed silently. |
| 6 — every other route reads exactly `<page name> \| DTE — Develyst The Education` | **MET** | All 7 non-`/` routes match character for character in Sober's own re-run (TASK-017 §Review + §Expected end state). The separator ` \| ` (`20 7c 20`) and the em dash are supplied once by TASK-015's `title.template`; `ห้องเรียน` was proved byte-identical (27 bytes) to the owner's own **A37** string, so it is his word and not a lookalike retype. No route is abbreviated to `DTE`, none is left on `… \| DTE Platform`. |

### Still `UNVERIFIED` — carried to the owner, none of it a defect, none of it blocking

1. **The live site.** Every check ran against a local dev server. `dte.develyst.online` still serves
   the old titles until the owner deploys — `DELIVERED` is not `deployed`, and no agent goes near
   production (PROTOCOL §Environments; `SYSTEM-FACTS.md` A23).
2. **A *person's* eyes on the 8 tabs.** The browser in every unit was an automated Chrome. AC 3 asked
   for a browser and got one; the owner's own look is still worth having and stays on the board's
   owner-eyes row (non-blocking).
3. **The classroom tab while authenticated.** The `withAuth` guard redirects, so nobody has watched
   the tab *stay* on a classroom page with a session. The `<title>` is server-rendered so it is
   unaffected in principle; anyone with a session opening a real course settles it.

If his eyes later turn up something the automated browser missed, that is a new finding on a
`DELIVERED` REQ — it comes back to me and I raise it; it does not retro-invalidate the evidence above.
