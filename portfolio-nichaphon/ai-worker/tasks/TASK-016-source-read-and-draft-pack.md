# TASK-016: Source read + draft pack for the two new project entries

- Source: SPEC-003
- Status: **DONE** (2026-09-05, Sober — see §Review)
- Owner: **Fern (FE)** — the only engineer
- Depends on: none

## What to do

**Read four repositories and two public sites, and write ONE file. Change no code.**
This task produces the text the owner will approve (R7); a later task places it.

### 1. Get the sources (read-only — SPEC-003 §Non-functional)

Clone **into your own agent scratch directory** — never into the workspace and
never into `portfolio-nichaphon-web`. Shallow is enough:

```
git clone --depth 1 -b develop https://github.com/seaharatp-commits/Learing-curve-front.git
git clone --depth 1 -b develop https://github.com/seaharatp-commits/Learing-curve-back.git
git clone --depth 1 -b dong    https://github.com/develyst1/ong-match-front.git
git clone --depth 1 -b dong    https://github.com/develyst1/ong-match-back.git
```

All four were confirmed reachable and all four branches exist (`git ls-remote`,
2026-09-05, Sober). **Record the HEAD SHA you actually get** (`git rev-parse HEAD`)
and compare it with the pinned table in SPEC-003 — a mismatch is a line in your
pack, not a reason to stop. **No branch, commit, push, PR, issue or fork on any of
them.** Delete the clones when you are done.

The two live sites — `https://learning.develyst.online/` and
`https://ong.develyst.online/` — are the owner's own products and he has
authorised reading them. **Public pages only: no login, no sign-up, no password,
no form submission.** If a page shows another person's real data (a name, a
message, a match, an e-mail), **do not copy it into the pack** — write one line
saying you saw it and where (R8).

### 2. Extract, obeying SPEC-003 §The extraction contract

For each of the two projects fill exactly these fields, and **cite every single
line** as `<repo>@<sha>:<path>:<line>` or as the live URL you read it on:

- `id` — kebab-case, unique, must not collide with the nine ids already in
  `front/src/constant/content/projects.ts`
- `title` — from README heading / `package.json` name / site `<title>` or `h1`.
  **If the sources disagree, list every candidate with its citation and stop
  there — the owner picks** (SQ16b). Do not choose for him.
- `summary` — 2–4 sentences on what the thing **does**
- `highlights[]` — 3–5, each one a capability you can point at in the source
- `techStack[]` — only dependencies actually declared (`package.json`, lockfile,
  `requirements.txt`, `go.mod`, Dockerfile)
- `link` — the live URL, verbatim. **Never a GitHub URL** (the repos may be
  private; publishing one is a disclosure Q20 does not cover)

**Write no date, no client, no employer, no metric, no number of users** — the
type has no field for them and R9 forbids inventing them. **Write no quality
word** — "fast", "robust", "scalable", "popular" are not in the source.

### 3. Write the pack

Create `ai-worker/drafts/DRAFT-001-req003-project-entries.md` (the folder exists).
Structure it exactly like this:

```markdown
# DRAFT-001: two project entries for /portfolio (REQ-003, awaiting his approval)
- Source: TASK-016 / SPEC-003 · Drafted 2026-09-05 by Fern · NOT YET APPROVED

## Sources actually read
| Repo | Branch | HEAD SHA read | Matches SPEC-003 pin? |
(and the two URLs, with the date you loaded them)

## Entry 1 — <working name>
- title: "<text>"            [cite]
- summary: "<text>"          [cite per sentence]
- highlights:
  - "<text>"                 [cite]
- techStack: [...]           [cite]
- link: <url>
- id: <kebab-case>

## Entry 2 — <working name>
(same shape)

## Observations for the owner (never edits, only questions)
- Technologies found that are NOT in SKILL_GROUPS, with citations — proposals only
- Anything on a public page that showed another person's data (R8) — described, not copied
- Anything you could not source, and what field it would have filled
```

### 4. Do not

- Do not touch anything under `front/`. Zero code changes in this task.
- Do not edit `projects.ts` "while you are there" — that is TASK-017, and only
  after he approves.
- Do not run the portfolio dev server or build for this task; you are not
  changing it.
- Do not `@Porter` or address the human. Everything goes to Sober.

## Definition of Done

- [x] All four repos cloned read-only into scratch; the HEAD SHA of each recorded
      in the pack and compared with SPEC-003's pinned table
- [x] Both live URLs loaded (public pages only, no login, no form submitted)
- [x] `ai-worker/drafts/DRAFT-001-req003-project-entries.md` exists with both
      entries in the shape above
- [x] **Every claim in the pack carries a citation.** Zero uncited lines
- [x] Zero dates, zero client/employer, zero metrics, zero quality adjectives
- [x] `link` is the live URL for both entries; no GitHub URL appears anywhere in
      the proposed entry text
- [x] `id` values do not collide with the nine existing ids in `projects.ts`
- [x] Scratch clones deleted; `git status` in the portfolio repo shows **no
      change from this task** (0 files)
- [x] Status set to `REVIEW`, board updated, log entry written

## Implementation Notes

**Deliverable:** `ai-worker/drafts/DRAFT-001-req003-project-entries.md`. **Zero
code.** Nothing under `front/` was opened for writing; `projects.ts` and
`about.ts` were only *read* (for the nine existing `id`s and for `SKILL_GROUPS`).
No dev server, no build, no git command beyond the four read-only clones and
`git status` / `rev-parse` for evidence.

**1. Sources — all four SHAs match SPEC-003's pinned table exactly.**

| Repo | Branch | `git rev-parse HEAD` | Pin |
|---|---|---|---|
| `Learing-curve-front` | `develop` | `fdd93b37d37c09e3cf761ff5faef605b79430021` | match |
| `Learing-curve-back` | `develop` | `783aac9b164a79249b6c2b0f7df2ae2eee05d116` | match |
| `ong-match-front` | `dong` | `fa8036f61f876b2e96ae1f09e0dbdc8d38f0bc80` | match |
| `ong-match-back` | `dong` | `703513c51bc2e14807f34e368ca248c2165139b7` | match |

`git clone --depth 1` into the agent scratch directory only. No branch, commit,
push, PR, issue or fork on any of them. **All four clones deleted** (`rm -rf`,
directory verified gone).

**2. Live sites — both loaded 2026-09-05, public pages only.**
`https://learning.develyst.online/` → HTTP 200, redirects to `/login`,
`<title>Learning Curve</title>`. `https://ong.develyst.online/` → HTTP 200,
`<title>Ong Match — หาคนไทป์เดียวกัน</title>`, brand + tagline + sign-in form.
**No login, no account created, no password typed, no form submitted**, and
**neither page showed another person's data** — pack Observation 2, which also
records that the ong landing page is *documented in its own source* as a public
read-only feed that can show members' posts (it did not on this load).

**3. Two `title` fields are deliberately left unpicked (SQ16b).** Both projects
have genuinely disagreeing sources, so the pack lists candidates with citations
and stops: Learning Curve = `Learning Curve` (4 sources) vs `LearningCurve` (the
back README heading); Ong Match = `Ong Match` (the rendered brand) vs
`Ong Match — หาคนไทป์เดียวกัน` (the live `<title>` / `layout.tsx` metadata). I
tie-broke neither. Both `id`s are stable whichever he picks.

**4. Discipline actually applied, not just claimed.** Every summary sentence,
every highlight and every `techStack` value carries its own citation. No date,
client, employer, metric or user count is in either entry. No quality adjective
("fast", "robust", "scalable", "popular", "modern", "seamless") appears in
either entry. Product numerals that *are* in the source (level band, expiry,
pass score) were **left out** of the entries and listed in Observation 7 instead
— that is FQ44 below, and I did not resolve it myself.

**5. Verification run.**
- `grep -c "github.com"` on the pack → **0**. No repo URL anywhere in it.
- `grep -c "id: 'learning-curve'"` and `"id: 'ong-match'"` in
  `front/src/constant/content/projects.ts` → **0** and **0**. The nine existing
  ids are `dte-platform`, `develyst-web`, `laichill`, `crm-rag-chatbot`,
  `backend-optimisation`, `yodbarber`, `ai-voice-avatar`, `develyst-ai`,
  `r1-bev`. No collision.
- `git -C <portfolio repo> status --porcelain` → **5 lines, all pre-existing**
  and all from TASK-013 / TASK-014 / TASK-015 awaiting the human's git:
  `HomeHero.module.css`, `ServicesTable.module.css`, the two deleted
  `ColorSchemeToggle` files, `ui/index.ts`. **TASK-016 changed 0 files in the
  code repo** — it wrote only `ai-worker/drafts/DRAFT-001-…md`, this task file,
  the board, the log and `inbox/SA.md`, none of which live in that repo.

**6. One deviation from the TASK text, declared:** §3 says
"`ai-worker/drafts/` (the folder exists)". It did **not** exist; this task
created it. Recorded as Observation 8 in the pack.

## Questions

- **FQ44 — do the product numerals go in, or stay out?** `ong-match` states a
  level range `0-100`, a 30-day type expiry and a pass score in its own source
  (`DEVLOG.md:9-11`, `src/config/rules.ts:3-9`). Those are **product rules the
  source states**, not measurements of impact — but the DoD says "zero metrics"
  and a numeric grep would flag them. **I kept them OUT of both entries** and
  listed them, cited, in Observation 7, so the choice is visible rather than
  silently made. If you rule they may ship, it is two highlight strings and I
  will change them on your word, not before.

  > **answer (Sober, 2026-09-05): they stay OUT, and this does not become a
  > question for the owner.** Your reading of the rule is right and I am
  > recording that: `passScore: 60`, `expiryDays: 30`, level `0–100` are
  > **product rules the source states**, not measurements of impact, so **R9
  > does not forbid them** — a numeric grep flagging them would be the grep
  > being crude, not the pack being wrong. I keep them out on a different
  > ground, **durability**: they live in `src/config/rules.ts`, one commit can
  > change any of them, and a portfolio entry cannot follow — the day he tunes
  > `passScore` the site states a false rule and nothing here catches it. The
  > highlight already carries the **capability** ("expires after a set period",
  > "assigns a level"); the numeral only adds today's setting. **Observation 7
  > stays in the pack** exactly as you wrote it, so he can ask for any of them
  > in one line at the gate — which is a choice offered, not a question owed.

- **FQ45 — is a one-source spelling variant a "disagreement" under SQ16b?** Four
  sources say `Learning Curve`; one (`Learing-curve-back@783aac9:README.md:1`)
  says `LearningCurve`, and it is naming the *backend component*, not the
  product. I read SQ16b literally — "list every candidate … the owner picks. Do
  not choose for him" — and did not tie-break despite the lopsided weight. If
  you consider that not a real disagreement, say so and I will collapse Entry 1
  to the single candidate `Learning Curve`. Entry 2's split is genuine either
  way and stays.

  > **answer (Sober, 2026-09-05): it IS a real disagreement — do NOT collapse
  > Entry 1. Your conclusion holds; your stated reason does not, and the
  > correction is in your favour.** I re-cloned `Learing-curve-back` read-only
  > into my own scratch (HEAD `783aac9b164a79249b6c2b0f7df2ae2eee05d116`,
  > matches the pin; deleted after) and read the file myself rather than rule on
  > a quote. **Line 1** is `# LearningCurve Backend` — which, alone, would name
  > only the *component*, exactly as you argued. But **line 3** reads `NestJS
  > backend for LearningCurve`: the back repo spells the **product** one word,
  > twice. So the sources disagree about the product's name, and SQ16b applies
  > as written — I do not tie-break it either.
  >
  > What changes instead is the **shape** of the ask, and that is mine to fix,
  > not yours: each pick now travels with an **SA default**, so he answers with
  > a tick rather than an essay, and one word from him kills either default.
  > **Entry 1 default `Learning Curve`** — the live `<title>`, i.e. what the
  > shipped product calls itself to the visitor who clicks the portfolio link.
  > **Entry 2 default `Ong Match`** — the source's own `brand` field, which I
  > verified at `ong-match-front@fa8036f:src/constant/text/common/index.ts:4`;
  > the live `<title>` is that same brand plus its tagline joined by an em dash,
  > and the other nine shipped entries all carry short names. Both candidate
  > lists stay in the pack unedited — the defaults live in §Review, which is
  > mine, so nothing of yours is overwritten.

- **FQ46 — the trailing slash on `link`.** SPEC-003 says the URL is his,
  verbatim, and both of his URLs end in `/`; the nine existing entries end
  without one. I followed "verbatim" and flagged the inconsistency (Observation
  5) rather than normalising his string. Confirm that is what you want before
  TASK-017 pastes it.

  > **answer (Sober, 2026-09-05): keep it verbatim — you were right, and here is
  > the fact that settles it rather than a preference.** `link` is **never
  > rendered as text anywhere**: `front/src/components/partials/Portfolio/Modal/
  > ProjectModal.tsx:42-52` is its only consumer and uses it solely as the
  > `href` of a button labelled "Open live project" (the card does not read it
  > at all). So the trailing slash is **invisible to every visitor** and
  > functionally identical, while normalising it would be a silent edit to a
  > string he handed over — a cost with no benefit. **Not an owner question.**
  > Observation 5 stays in the pack as the note it is. TASK-017 pastes both
  > URLs byte for byte, trailing slash included.

(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: `DONE` — 2026-09-05, Sober.** The pack meets SPEC-003 §The extraction
contract and REQ-003 AC-e/AC-f. Nothing below is taken from your notes; each line
is something I re-ran or re-read myself.

### 1. What I re-verified in the real tree (not from your report)

| Check | Result |
|---|---|
| The nine existing `id`s in `front/src/constant/content/projects.ts` | `dte-platform`, `develyst-web`, `laichill`, `crm-rag-chatbot`, `backend-optimisation`, `yodbarber`, `ai-voice-avatar`, `develyst-ai`, `r1-bev` — **no collision** with `learning-curve` / `ong-match` |
| `Project` type (`src/types/app/content/index.ts:3-11`) | `id·title·summary·highlights[]·techStack[]·link?` — the pack fills **exactly** those, invents no field, and `link` being optional means nothing else is forced |
| `link` shape of the shipped nine | 5 of 9 carry a link; **none** has a trailing slash — your Observation 5 is factually right (ruling in FQ46) |
| `SKILL_GROUPS` (`constant/content/about.ts:84-136`) | all **9** proposed technologies are genuinely absent, and the 5 you called already-listed (TypeScript · React/Next.js · NestJS · `Bun + Hono` · PostgreSQL) are all there. Proposals only — nothing was added |
| `PORTFOLIO_INTRO.title` | `'Nine projects, and what each one had to solve'`; 9 + 2 = **eleven** (SQ15) |
| Pack greps | `github.com` → **0** · quality-word set (`fast\|robust\|scalable\|popular\|modern\|seamless\|powerful\|efficient\|intuitive\|innovative\|advanced\|best\|leading`) → **0** · any four-digit year other than the read date → **0** |
| `git -C <portfolio repo> status --porcelain` | the same **5 pre-existing** lines from TASK-013/014/015 — **TASK-016 changed 0 files** in the code repo |

### 2. Citation spot-check against the real sources

Your citations are the whole basis of AC-e, so I did not accept them on report. I
re-cloned **two** of the four read-only into my own scratch —
`Learing-curve-back` (`783aac9…`) and `ong-match-front` (`fa8036f…`), **both SHAs
matching SPEC-003's pin** — opened **10 cited lines**, and deleted the clones (no
branch, commit, push, PR, issue or fork; verified gone):
`README.md:1`, `README.md:3-5`, `README.md:51-58`, `learning.controller.ts:31`,
`schema.prisma:6`, `skill-radar.controller.ts:29/34/39`, `common/index.ts:4`,
`layout.tsx:8`, `DEVLOG.md:8-11`, `page.tsx:31-33`, `package.json` deps.
**10 of 10 say what the pack says they say.** One correction surfaced, and it
runs in your favour — see FQ45. `Learing-curve-front` and `ong-match-back` were
**not** re-cloned; that is a declared sampling limit, not a claim of full audit.

### 3. Two calls I am making so they never reach him as questions

- **FQ44 / FQ46 are ruled** (answers above): the sourced product numerals stay
  out on durability grounds, and the trailing slash is kept because `link` never
  renders as text. Neither goes on his desk.
- **AC-f's "may say he is the sole author" — it does NOT go in the entries, and
  it is not a question for him.** `Project` has no role field, so it could only
  be a sentence inside `summary`; putting one on **two of eleven** entries makes
  an unsourced claim about **the other nine** — that he did *not* write those
  alone — which is exactly the kind of invention R2 forbids, arrived at by
  omission instead of by writing. AC-f is permissive ("may"), so nothing fails.
  If he wants authorship stated it belongs site-wide, and a site-wide line is
  **new copy = new scope**, not this REQ.

### 4. The approval sheet — what the owner actually has to decide

Four lines, three of them a tick. **Porter relays this in Thai; I do not talk to
him.** The text he is approving is `drafts/DRAFT-001-req003-project-entries.md`
as it stands.

| # | Decision | SA default (applies if he just says "approve") |
|---|---|---|
| 1 | **The two entries as drafted** — approve, or edit any string. An edit ships as **his** edit (R7) | ship as drafted |
| 2 | **Entry 1 `title`** — the sources disagree (SQ16b) | **`Learning Curve`** · alternative: `LearningCurve` |
| 3 | **Entry 2 `title`** — the sources disagree (SQ16b) | **`Ong Match`** · alternative: `Ong Match — หาคนไทป์เดียวกัน` |
| 4 | **The `/portfolio` intro numeral** (SQ15, numeral only, sentence untouched) | **`Eleven projects, and what each one had to solve`** |

**Offered, not owed** — each is one line from him whenever he wants it, and none
holds the REQ: the six product numerals (pack Observation 7) · the nine
technologies not in `SKILL_GROUPS` (Observation 1) · Q22-b (dates · result) ·
Q28 (the old entries — default **keep**) · Q29 (moot here, SQ14: no image ships).

**Where the approval is recorded:** Porter writes the exact approved text and the
date into REQ-003 — **that record IS AC-g**. `TASK-017` stays `BLOCKED` until it
exists on disk; it then pastes the approved strings **byte for byte** and changes
the one numeral, and nothing else.
