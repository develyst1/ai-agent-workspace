# SPEC-003: Portfolio content refresh — two sourced project entries

- Source: REQ-003
- Status: **DONE** — 2026-09-05, Sober. Both TASKs (016, 017) are `DONE`; REQ-003
  is `SPEC_DONE` and with Porter for acceptance. SQ14/SQ15/SQ16 settled;
  **SQ17 stays open** (branch choice — the human's, via Porter).
- Scope of this spec: **content only** (R5). No component, no type field, no CSS,
  no theme value is added, removed or changed by it.

> SQ-numbers continue the global SA series (SPEC-002 ended at SQ13), so a board
> row never carries two SQ7s.

## Overview

REQ-003 asks for his two real projects to appear on the site, drafted by the team
(Q21 `ทีมร่าง`) and approved by him before they ship (R7).

The design is deliberately small: the shipped `/portfolio` route already renders
**any** number of `Project` objects — card grid + detail modal, both built in
REQ-002 — so the whole change is **two more objects in
`front/src/constant/content/projects.ts`** plus one numeral in that route's
intro. Nothing is designed, styled or invented.

**The work splits exactly at the R7 gate, and the split is the point:**

| Before the gate — *sourcing* | After the gate — *placement* |
|---|---|
| TASK-016. Read the four repos at pinned commits + the two public sites. Extract **only what the source states**, cite every line, produce a draft pack as a file. **Touches no code.** | TASK-017. Paste the **approved strings verbatim** into one content file. **Drafts nothing, improves nothing.** |

A single task that both drafted and placed would let an unapproved word reach the
site through one "obvious" edit. Split, that is structurally impossible: TASK-017
has no licence to write a word, and TASK-016 has no licence to touch `front/`.

## What ships — and what deliberately does not

**Ships:** two entries of the existing `Project` type
(`front/src/types/app/content/index.ts`), each carrying
`id` / `title` / `summary` / `highlights[]` / `techStack[]` / `link`.

**Deliberately not in this REQ, each with its reason:**

1. **No screenshots.** Q20 permits them. The shipped card (`PortfolioGrid.tsx`)
   and modal (`Modal/ProjectModal.tsx`) have **no image slot**, and `Project` has
   no image field — adding one is layout work, which **R5 forbids in this REQ**.
   Useful consequence: because nothing from either site's screens is published,
   **R8 / Q29 cannot bite here at all**. Raised to Porter as **SQ14**, not decided
   by me: if he wants images on the cards, that is new scope, not a spec detail.
2. **No date, no client/employer, no metric.** The type carries no such field and
   **R9** forbids filling one. This is Q22-b territory and stays empty until he
   writes it. A draft that derives a date from git history **fails AC-f**.
3. **No new route, no new section, no `/about` experience entry.** See
   §Whole-site review — every route was looked at and each "unchanged" carries its
   reason on the record (AC-h).

## The extraction contract — where each field may come from

This is the heart of the spec: it turns R2/R9 from a principle into a check a
reviewer can actually run. **Every line in the draft pack carries a citation.** A
line with no citation is not a weak line, it is a **defect** — Sober rejects the
pack.

| Field | The ONLY allowed sources | Forbidden — fails review |
|---|---|---|
| `title` | the repo `README` heading, `package.json` `name`, or the live site's `<title>` / `h1` | a name invented for prettiness. **If sources disagree, the pack lists every candidate with its citation and he picks** — see SQ16 |
| `summary` (2–4 sentences) | what the source says the thing **does**: README prose, route/page names, API surface, entity names | any claim about **quality, scale, popularity, speed or impact** ("fast", "robust", "used by hundreds") — none of that is in the source |
| `highlights[]` (3–5) | one **capability visible in the source** each, with its own citation: a route, a page, an endpoint, a model, a README bullet | a benefit statement, a marketing line, an inferred user outcome |
| `techStack[]` | dependencies **actually declared**: `package.json`, lockfile, `requirements.txt`, `go.mod`, Dockerfile base image | a framework guessed from the file layout, or a buzzword the code never imports |
| `link` | exactly the two URLs he handed over, verbatim | any other URL — **including a GitHub URL**. The repos are source material, not published links; they may be private, and publishing one is a disclosure Q20 does not cover |
| anything else | — | **omitted (R9)** |

**Pinned sources.** Read at these exact commits, recorded read-only by Sober with
`git ls-remote --heads` on 2026-09-05 (no clone, no fetch, no write):

| Repo (branch) | Commit at 2026-09-05 |
|---|---|
| `seaharatp-commits/Learing-curve-front` (`develop`) | `fdd93b37d37c09e3cf761ff5faef605b79430021` |
| `seaharatp-commits/Learing-curve-back` (`develop`) | `783aac9b164a79249b6c2b0f7df2ae2eee05d116` |
| `develyst1/ong-match-back` (`dong`) | `703513c51bc2e14807f34e368ca248c2165139b7` |
| `develyst1/ong-match-front` (`dong`) | `fa8036f61f876b2e96ae1f09e0dbdc8d38f0bc80` |

Citing `<repo>@<sha>:<path>:<line>` keeps every claim re-checkable months later
even if he pushes to those branches tomorrow. **If a checkout's HEAD does not
match the SHA above, that is a finding to report, not a reason to stop** — record
the SHA actually read.

## Flow — draft, gate, place

1. **TASK-016** produces `ai-worker/drafts/DRAFT-001-req003-project-entries.md`
   (new folder, created by this spec's design; the pack is a *deliverable*, not a
   log — it must outlive the task because his approval is recorded **against its
   exact wording**).
2. **Sober reviews the pack** against R2/R9 and AC-e/AC-f: every claim cited, zero
   uncited claims, zero date/client/metric, zero quality words. Verdict in
   TASK-016 §Review.
3. **Sober → Porter** (inbox): the pack is ready to relay. Sober does **not** talk
   to the human.
4. **Porter relays it in Thai; the owner approves or edits.** Porter records the
   **exact approved text and the date** in REQ-003 — that record *is* AC-g. An
   edit he makes ships as his edit.
5. **TASK-017 places the approved strings verbatim** — byte for byte. If Fern
   believes an approved word is wrong, he asks in §Questions; he does not improve
   it. An improved word is an unapproved word.
6. Acceptance and QA routing after that are Porter's, not this spec's.

**Nothing in step 5 may start before step 4 exists on disk.** That is why TASK-017
sits on the board as `BLOCKED` and not as `TODO`.

## Whole-site review — AC-h, every route, changed or not

Q16 = `ทั้งเว็บ`, so silence about a route is not coverage. Reviewed 2026-09-05 by
Sober against the real tree.

| Route / file | Changes? | What, or why not |
|---|---|---|
| `/portfolio` — `constant/content/projects.ts` | **YES** | The two entries are added, **placed first** in `PROJECTS` (SQ16) |
| `/portfolio` — `Portfolio.config.ts` | **YES, one word** | `PORTFOLIO_INTRO.title` reads **"Nine projects, and what each one had to solve"**; the array becomes **eleven**, so the numeral must move or the page states a falsehood. **Only the numeral changes** — the sentence is not rewritten, because a new headline is *not* entry copy and Q21's R4 lift does not cover it. The resulting line still goes into the approval pack (**SQ15**) |
| `/portfolio` — `page.tsx` `metadata.description` | **no** | It lists *kinds* of work ("AI platforms, RAG chatbots, an LLM gateway, a voice-controlled robot and production web applications") and stays true with two more entries. Rewriting it would be new copy under R4 |
| `/` (Home) | **no** | `HOME_LEAD`, `CAREER_STATS` (`3+`, `40%`, `4`, `2x`) and `CAPABILITIES` are **his existing career claims**. The two projects supply **no sourced value** for any of them, and R9 forbids nudging a number so it "includes" them |
| `/about` | **no — and this is the one that tempts** | `EXPERIENCE` is where a real project *with dates and an employer* would live. Those two fields are exactly what **Q22-b has not answered**, and git history is not an allowed source (AC-f). It stays untouched **until he supplies them**; that is then a follow-up, not this spec |
| `/services` | **no** | Services describe **what he offers**, not what he built; `SERVICES_INTRO.lead` says "Six areas" and six still ship. Whether these projects imply a new service is his call — it reaches him as a question in the pack, never as an edit |
| `/blog` | **no** | Article content; carries no project claim |
| `/contact` | **no** | Channels and FAQ; carries no project claim |
| `SKILL_GROUPS` (`/about`) | **no, but reported** | If the repos use a technology not already listed, TASK-016 **lists it in the pack as a proposal with its citation**. It is never added silently: a skill claim is a claim about **him**, and only he ratifies it |

Existing `/portfolio` entries are **kept** — Q28's declared default. Removing his
content needs his word, never an inference.

## Non-functional — the boundaries this work runs inside

- **Read-only on the four repos (R4).** Shallow clone into the agent's own scratch
  directory only; **no branch, no commit, no push, no PR, no issue, no fork** —
  nothing that writes anywhere. Delete the clone when done. **Never clone into the
  portfolio repo or into the workspace.**
- **The two live sites: public pages only.** No login, no account creation, no
  password, no form submission (R4). They are the owner's own products and he has
  authorised reading them; they are **not** this project's production.
- **If a public page shows another person's real data** — a name, a message, a
  match, an e-mail — **it is not copied into the draft** (R8); it is reported in
  the pack instead.
- **No git write anywhere, including the portfolio repo** — the human's alone. No
  deploy, no `pm2`, no ssh, nothing touching `portfolio.develyst.online`.
- **TASK-017 verification:** `npx tsc --noEmit` exits 0 and `npm run build` exits 0
  from `front/`. Content-only means the build must not move.

## Tasks

- **TASK-016**: Source read + draft pack for the two entries (owner: Fern; depends on: —)
- **TASK-017**: Place the approved entries in `projects.ts` + the intro numeral
  (owner: Fern; depends on: TASK-016 **and** the R7 approval record in REQ-003)

## Questions

- **SQ14 — screenshots are permitted but this REQ ships none. Notice, not a
  blocker.** Q20 grants screenshots; the shipped card and modal have no image slot
  and R5 forbids adding one here, so no image ships and **Q29 cannot bite in this
  REQ**. If the owner expected pictures of the two sites, that is **new scope** — a
  layout change to the portfolio card — and it comes back as a REQ, not as a quiet
  spec decision. @Porter to relay if he wants it.
- **SQ15 — one existing sentence changes although it is not "entry copy".**
  `PORTFOLIO_INTRO.title` says **"Nine projects"**; with two more it must say
  eleven or the page is false. Sober changes **the numeral only**, and puts the
  exact resulting line in the approval pack so he sees it. Flagged because it is
  the one string outside the two entries that this REQ touches.
- **SQ16 — two calls I made that are look, not fact; he overrules either in one
  line.** (a) The two new entries are placed **first** in `PROJECTS`, so
  `ยังไม่เห็น พวกนี้เลย` is answered on first paint; the grid's `01, 02 …` ordinals
  are positional, so everything below renumbers. (b) If the sources disagree on a
  project's **name**, the pack lists the candidates and **he picks** — no tie-break
  by inference. Both travel with the pack.
  > **Updated 2026-09-05 after the TASK-016 review — SQ16b is unchanged in
  > substance and cheaper to answer.** Both titles turned out to be **genuine**
  > disagreements (I re-read `Learing-curve-back:README.md` myself: line 3 spells
  > the *product* `LearningCurve`), so neither was tie-broken. Each pick now
  > carries an **SA default** — `Learning Curve` and `Ong Match` — so he answers
  > with a tick and one word overrules either. The candidate lists in the pack
  > are untouched; the defaults live in `tasks/TASK-016-…md` §Review §4, which
  > also carries the full 4-line approval sheet Porter relays.
- **SQ17 (new 2026-09-05) — the code repo is no longer where the board says it
  is. Notice + one question for the owner; it does NOT block TASK-017.** Checked
  read-only 2026-09-05 by Sober: the working tree is **clean** and the checkout
  is on branch **`D1`** — the team's TASK-013/014/015 edits are now committed
  (`c152314`), which no role did. PROTOCOL and board §Standing rules still say
  work is handed over "as edited files on **`develop`**". **No role resolves
  this**: branch choice and every git write are the human's alone. Fern edits the
  checked-out tree and records which branch he was on; the owner says where this
  work should live. @Porter to relay whenever convenient.

(Fern asks here; Sober answers as `> answer: ...`)
