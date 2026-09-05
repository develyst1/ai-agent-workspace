# TASK-017: Place the approved entries in `projects.ts` + the intro numeral

- Source: SPEC-003
- Status: **DONE — 2026-09-05, Sober.** All 24 approved values re-derived from
  DRAFT-001 by my own parser and compared against the **evaluated module** —
  **24/24 character-exact, 0 diffs**. See §Review.
- Status history: `BLOCKED (waiting: Human via Porter — the R7 approval record in REQ-003)`
  -> `TODO` (UNBLOCKED 2026-09-05 by Sober; R7 record on disk, AC-g ticked by Porter)
  -> `IN_PROGRESS` 2026-09-05 Fern -> `REVIEW` 2026-09-05 Fern
  -> **`DONE` 2026-09-05 Sober**
- Owner: **Fern (FE)**
- Depends on: TASK-016 (DONE) **and** an approval record for DRAFT-001 written
  into `requirements/REQ-003-portfolio-content-refresh.md` by Porter — **both met.**

## The gate that blocked this task — now open

REQ-003 had to contain the **exact approved text and the date he approved it**;
that record *is* AC-g. It is there: the owner answered **`อนุมัติ`** on
2026-09-05 and Porter recorded it. **The approved text is
`drafts/DRAFT-001-req003-project-entries.md` as it stands, unedited**, with the
two `title` fields resolved. Nothing else about this task changed — you still
paste, and still draft nothing.

## The four approved decisions — all you need, no round-trip

Copied here from REQ-003 §R7 approval record so this task is startable on its
own. The **strings** are not re-typed here on purpose (a second copy is a second
thing that can drift) — they live in DRAFT-001 and you copy them from there.

| # | Decision | **APPROVED value** |
|---|---|---|
| 1 | The two entries | **ship as drafted** — DRAFT-001 byte for byte, no edit |
| 2 | Entry 1 `title` | **`Learning Curve`** (not `LearningCurve`) |
| 3 | Entry 2 `title` | **`Ong Match`** (not `Ong Match — หาคนไทป์เดียวกัน`) |
| 4 | `PORTFOLIO_INTRO.title` | **`Eleven projects, and what each one had to solve`** |

## How the pack maps into the file — Sober's rulings, so nothing is guessed

DRAFT-001 is a *cited* document; `projects.ts` is code. These five rules are the
whole translation, and they are **format, never wording** — if applying one would
change a word, stop and ask in §Questions instead.

1. **Order.** `PROJECTS` becomes **Learning Curve, Ong Match, then the existing
   nine untouched and in their current order** (SQ16a: the two new ones first;
   pack order between them). The nine existing objects are not edited or moved
   relative to each other.
2. **`summary`.** One string per entry = the pack's **four numbered sentences, in
   order, joined by a single space**. The citation line under each sentence is
   evidence and is **not** copied.
3. **`highlights`.** Five strings per entry = the pack's five bullet texts, in the
   pack's order; the `— <citation>` line under each is **not** copied.
4. **`techStack`.** Exactly the array printed on the pack's `techStack` line for
   that entry (11 values for Entry 1, 9 for Entry 2). The evidence table under it
   carries version numbers — **none of them ship**.
5. **Quoting.** The `"…"` wrapping a pack sentence or bullet is the pack's own
   quoting and is **not part of the string**; characters inside it are. Entry 2's
   first sentence really does contain `'types'` with ASCII apostrophes — keep them
   and let the file's formatter pick the JS delimiter (it will use double quotes
   for that one line). A delimiter is not a word.

**SQ17 — which branch this lands on is NOT yours and NOT mine.** The repo is on
`D1` with a clean tree (verified read-only 2026-09-05), while PROTOCOL still says
work is handed over "as edited files on `develop`". I have **not** resolved that
and no role may: git writes and branch choice are the human's, via Porter. It
does not block you — you edit the checked-out tree either way — so start.

Also already ruled, so do not re-open them: `link` keeps its **trailing slash**
verbatim for both entries (FQ46), and **no** "sole author" line, date, client,
metric or product numeral goes into either entry (FQ44, R9, AC-f).

## What to do

Paste approved strings. **Draft nothing. Improve nothing.**

1. `front/src/constant/content/projects.ts` — add the two approved `Project`
   objects, **first** in the `PROJECTS` array (§How the pack maps, rule 1). Match
   the existing formatting of the file; fields are exactly `id`, `title`,
   `summary`, `highlights`, `techStack`, `link` (the type is unchanged —
   `front/src/types/app/content/index.ts`, `link` optional). The file holds
   **nine** objects today (verified in the tree by Sober 2026-09-05), so it holds
   **eleven** when you are done.
2. `front/src/components/partials/Portfolio/Portfolio.config.ts` line 3 —
   `PORTFOLIO_INTRO.title` currently reads
   `'Nine projects, and what each one had to solve'` (verified 2026-09-05).
   Replace it with the **approved** line, decision 4 above:
   `'Eleven projects, and what each one had to solve'`. **Numeral only** — the
   rest of the sentence is not rewritten (SQ15).
3. Nothing else. No other file, no CSS, no component, no type change. If you
   believe an approved word is wrong, **ask in §Questions** — an improved word is
   an unapproved word.

## Definition of Done

- [x] The two entries in `projects.ts` are **byte-identical** to the approved text
      — every `summary`, `highlights` and `techStack` value traced back to its
      DRAFT-001 line (cite the pack heading + line you copied each from in
      §Implementation Notes), and the two `title`s are the approved picks
      (`Learning Curve`, `Ong Match`)
- [x] `PORTFOLIO_INTRO.title` is exactly
      `'Eleven projects, and what each one had to solve'`; nothing else in that
      file changed
- [x] `PROJECTS` has **11** objects and the existing nine are untouched — show it
      (e.g. `git diff` on `projects.ts` is additions only, no deleted line)
- [x] **Exactly two files changed.** `git status` / `git diff --stat` pasted into
      §Implementation Notes proves it (no commit — git is the human's). Sober
      checked the repo read-only on 2026-09-05: the working tree is **clean** and
      the checkout is on branch **`D1`** (TASK-013/014/015 are committed as
      `c152314`), so this DoD line is now literally exact — anything else in
      `git status` is yours. **Do not switch, create or reset a branch** to
      "put it on `develop`": branch choice is the human's via Porter (SQ17
      below). Edit the tree as it is checked out and **name the branch you were
      on** in §Implementation Notes.
- [x] `cd front && npx tsc --noEmit` exits 0 — output pasted
- [x] `cd front && npm run build` exits 0 — the tail pasted
- [x] `/portfolio` loads locally with 11 cards; both new cards open their modal and
      the modal's live link points at the handed-over URL. **If port 3000 is still
      held by the foreign `next` process nobody here owns (board §Standing rules,
      REQ-003 §Third handover 4): do not kill it, do not take the port** — serve
      your own build on another port, or record this line UNVERIFIED with the
      reason. Never claim a render you did not see.
      **Fern 2026-09-05: met on the running build at port 3210 (port 3000 had no
      listener; I took neither it nor any foreign process). 11 cards, both modals
      and both hrefs read off the live DOM. The modal PIXELS are UNVERIFIED — the
      capture returned a flat dark frame every time; declared, not claimed.**
- [x] No date, client, employer or metric appears in either entry
- [x] Status set to `REVIEW`, board updated, log entry written

## Implementation Notes

**Done 2026-09-05 by Fern. Status -> REVIEW.** Exactly two files changed, both
edits are pastes. I drafted nothing and improved nothing.

### Branch I was on (SQ17 — untouched by me)

`git branch --show-current` -> **`D1`**. Tree was clean before I started and holds
only my two modified files now. **No git write of any kind**: no add, commit,
branch, switch, stash or reset. Branch choice stays the human's via Porter.

### How the strings got in — machine copy, not typing

I did not retype any approved string. A one-off script read
`drafts/DRAFT-001-req003-project-entries.md` directly, unwrapped each markdown-wrapped
sentence/bullet, stripped the pack's own `"…"` quoting (mapping rule 5), joined the
four summary sentences with a single space (rule 2), dropped every `— <citation>` line
(rules 2, 3) and every version number under `techStack` (rule 4), then wrote the two
objects at the head of `PROJECTS` (rule 1). Independent re-check afterwards: all
**18/18** approved strings (8 summary sentences + 10 highlights) are present
**verbatim** in `projects.ts`.

### Value -> DRAFT-001 source line

`drafts/DRAFT-001-req003-project-entries.md`, line numbers as of 2026-09-05.

**Entry 1 — `learning-curve`** (pack `## Entry 1 — Learning Curve`, line 32)

| field | pack heading | lines copied |
|---|---|---|
| `title` | decision 2 in this TASK | `Learning Curve` (approved pick, candidate (a) at pack line 37) |
| `summary` s1 | `### summary` (44) | 46–47 |
| `summary` s2 | `### summary` (44) | 49–50 |
| `summary` s3 | `### summary` (44) | 52–53 |
| `summary` s4 | `### summary` (44) | 55–56 |
| `highlights` 1–5 | `### highlights` (59) | 61, 63, 65, 67, 69 |
| `techStack` (11) | `### techStack` (72) | 74 |
| `link` | `### link` (92) | 94 — `https://learning.develyst.online/`, trailing slash kept (FQ46) |
| `id` | `### id` (98) | 100 — `learning-curve` |

**Entry 2 — `ong-match`** (pack `## Entry 2 — Ong Match`, line 108)

| field | pack heading | lines copied |
|---|---|---|
| `title` | decision 3 in this TASK | `Ong Match` (approved pick, candidate (a) at pack line 114) |
| `summary` s1 | `### summary` (120) | 122–123 |
| `summary` s2 | `### summary` (120) | 125–127 |
| `summary` s3 | `### summary` (120) | 129–130 |
| `summary` s4 | `### summary` (120) | 132–133 |
| `highlights` 1–5 | `### highlights` (136) | 138, 140, 142, 144, 146 |
| `techStack` (9) | `### techStack` (149) | 151 |
| `link` | `### link` (164) | 166 — `https://ong.develyst.online/`, trailing slash kept (FQ46) |
| `id` | `### id` (170) | 172 — `ong-match` |

Mapping rule 5 applied once: entry 2's `summary` contains `'types'` with ASCII
apostrophes, so that one literal is delimited with double quotes. The characters
inside are untouched, including the Thai `(ไทป์)`.

### Files

1. `front/src/constant/content/projects.ts` — the two objects inserted **first** in
   `PROJECTS`; the nine existing objects are byte-untouched and in their original
   order (diff is **52 insertions, 0 deletions**).
2. `front/src/components/partials/Portfolio/Portfolio.config.ts` — line 3 numeral
   only: `'Nine projects, …'` -> `'Eleven projects, and what each one had to solve'`.
   `eyebrow` and `lead` untouched (1 insertion, 1 deletion).

### Evidence

```
$ git status --short
 M front/src/components/partials/Portfolio/Portfolio.config.ts
 M front/src/constant/content/projects.ts

$ git diff --stat
 .../partials/Portfolio/Portfolio.config.ts         |  2 +-
 front/src/constant/content/projects.ts             | 52 ++++++++++++++++++++++
 2 files changed, 53 insertions(+), 1 deletion(-)

$ git diff --numstat -- front/src/constant/content/projects.ts
52      0       front/src/constant/content/projects.ts      <- additions only, 0 deletions

$ grep -c "    id: " front/src/constant/content/projects.ts
11
  order: learning-curve, ong-match, dte-platform, develyst-web, laichill,
         crm-rag-chatbot, backend-optimisation, yodbarber, ai-voice-avatar,
         develyst-ai, r1-bev

$ cd front && npx tsc --noEmit ; echo exit=$?
exit=0

$ cd front && npm run build
 ✓ Compiled successfully in 14.5s
 ✓ Generating static pages (10/10)
 ├ ○ /portfolio                             7.76 kB         285 kB
[postbuild] copied .next/static + public/ into .next/standalone
exit=0
```

**No date, client, employer or metric in either entry** — swept the region between
`id: 'learning-curve'` and `id: 'dte-platform'`: `/\b(19|20)\d{2}\b/` none,
`/\d+\s*%/` none, `percent` none, `client` none, `employer` none, `users` none,
`months?` none. **The two new entries contain zero digit characters at all.**

### Rendered check — served the build on port **3210**, never port 3000

`npx next start -p 3210` on the build above (no `npm run dev` over `front/.next`).
Port 3000 had **no listener** at the time (`netstat` empty for `:3000`), and I
neither took it nor touched any foreign process.

- `/portfolio` served HTTP 200. The rendered HTML contains
  `Eleven projects, and what each one had to solve` and **not** `Nine projects…`.
- **11 cards**, in the approved order — read off the live DOM as the 11
  `Open project detail for …` buttons: Learning Curve, Ong Match, DTE Platform,
  Develyst Company Website, Laichill, RAG Chatbot for CRM Sales, Enterprise Backend
  Optimisation, YodBarber Queue Booking, AI Voice Avatar, Develyst AI Gateway,
  R1-BEV Voice Command Robot.
- **Both new cards open their modal.** Clicking each one produced a live
  `[role="dialog"]` (760x648 in a 1280x720 viewport, `document.hidden` false) whose
  rendered `innerText` is the approved title, the 4-sentence summary, the 5
  highlights and the full tech list, in order, for both entries.
- **Modal live link = the handed-over URL.** The only `<a>` in each dialog is
  "Open live project" with `href` exactly `https://learning.develyst.online/` and
  `https://ong.develyst.online/` respectively — trailing slash intact,
  `target="_blank"`.

**UNVERIFIED, stated plainly:** I could not capture a **screenshot of an open
modal**, nor of the card grid below the fold. The capture returned a flat dark frame
every time and `window.scrollTo` did not move the page in this harness. So the
modal's *painted pixels* are unverified by me — the same limit already standing in
this project as SQ7 / FQ35. Everything above about the modals is read from the live
DOM of the running build, not from a picture. The `/portfolio` opening block itself
**was** captured and visibly reads "Eleven projects, and what each one had to solve".
The server on 3210 was stopped at the end of the session.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

**FQ47 — nothing blocking. Three notices only; none needs an answer to close this task.**

> **answer (Sober 2026-09-05): all three accepted; none changes the verdict.**
> (1) Correct — rule 5 is a delimiter rule, and a delimiter is not a word. I
> verified the point you flagged: entry 2's `summary` uses **ASCII** `'` (U+0027)
> around `types`, not a curly quote, and the only non-ASCII bytes anywhere in
> either new entry are the Thai `(ไทป์)` — byte sweep on the region found
> `e0 b8/b9 xx` only, **zero `e2 80 xx`**, so no smart quote or en/em dash was
> introduced by any tool in the chain. (2) Noted and relayed to Porter for QA:
> `front/.next` holds your build output, so the next local run uses `next start`
> or clears `.next` first — this is exactly the standing note, not a new one.
> (3) Correct and required. SQ17 stays open with Porter → the human; **no role
> may resolve it**, and your zero git writes are the right outcome, not a gap.

1. **The mapping rules never fought the wording.** Applying rules 1-5 changed no word
   of the approved text — 18/18 approved strings are in `projects.ts` verbatim — so I
   never had to stop under rule 5. The one place rule 5 bit was entry 2's `summary`,
   which holds `'types'` with ASCII apostrophes; that literal is delimited with double
   quotes and its characters are untouched.
2. **`front/.next` now holds a fresh `npm run build` output** (my DoD build). The
   standing note forbids running `npm run dev` on top of a build output — so whoever
   runs local Next (QA via Porter, or you re-verifying) should serve it with
   `next start` or clear `front/.next` first. FYI, not a question.
3. **SQ17 untouched, as instructed.** I edited the tree as it was checked out on
   **`D1`** and made zero git writes — no add, commit, branch, switch, stash or reset.
   Both modified files are unstaged and uncommitted, waiting for the human.

## Review

**VERDICT: `DONE` — 2026-09-05, Sober.** Re-verified by me in the tree, not read
off Fern's report. This is the last TASK of SPEC-003.

### 1. The check that mattered: is the shipped copy the approved copy?

This REQ ships **real copy about a real person, approved by him verbatim**, so
the only review question worth anything is whether the strings on disk still
equal the strings he approved — **character for character**, not "looks right".

I did **not** re-read Fern's 18/18 claim and agree with it. I wrote my **own**
parser (independent of his one-off script) that:

- reads `drafts/DRAFT-001-req003-project-entries.md` — the artefact the R7
  record names as *the* approved text — and re-derives each value from the pack
  itself: unwraps every markdown-wrapped sentence/bullet, strips the pack's own
  `"…"`, drops each `— <citation>` line, joins the four summary sentences with
  one space, and evaluates the pack's printed `techStack` literal;
- loads the **shipped values by evaluating the module** (`projects.ts` with the
  type import stripped), so the comparison is against the real runtime strings —
  not a grep of the file, which cannot see an escaped or re-delimited character;
- compares with `===`, and on any mismatch prints the first differing index and
  both code points.

**Result: 24 comparisons, 24 OK, 0 FAIL** — for both entries: `id`, `title`,
`summary` (the 4 sentences joined by one space), all 5 `highlights` individually,
the full `techStack` array (11 and 9 values, in order), `link`, plus a field-set
check. Both titles are the approved picks (`Learning Curve`, `Ong Match`), both
`link`s keep the trailing slash (FQ46), and **no field outside the `Project`
type's six appears** on either object — nothing was invented in translation.

Byte-level sweep on the two new entries: **no digit characters at all** (FQ44,
AC-f, R9 hold), and the only non-ASCII bytes are Thai (`e0 b8/b9 xx`) — **zero
`e2 80 xx`**, so no smart quote or dash was substituted anywhere along the chain.
Entry 2's `'types'` is ASCII U+0027 on both sides.

### 2. The one existing string that changed

`Portfolio.config.ts` diff is **1 insertion, 1 deletion** and I read it: only
`Nine` → `Eleven`. The shipped line is character-identical to the approved value
in REQ-003 §R7 approval record, decision 4 — `eyebrow` and `lead` untouched
(SQ15 respected: numeral only, sentence not rewritten).

### 3. Scope, and that the nine existing entries survived

`git status --short` run by me = **exactly the two files**. `git diff --numstat`
= `52 0` on `projects.ts` — **additions only, zero deleted lines**, which is
proof the nine existing objects are byte-untouched rather than a claim about it.
`PROJECTS` evaluates to **11**, in the approved order (the two new first, then
the nine in their original order). No component, type, CSS or theme file is in
the diff — SPEC-003's content-only scope (R5) holds.

### 4. Build/render, re-checked rather than accepted

`npx tsc --noEmit` **re-run by me: exit 0**. I did not re-run `npm run build`;
instead I read the artefact his build already produced — the prerendered
`front/.next/server/app/portfolio.html`: it contains
`Eleven projects, and what each one had to solve` **once**, `Nine projects`
**zero** times, and **11** `Open project detail for …` labels in exactly the
approved order. Both new entries' opening summary sentences appear in that HTML
verbatim, and it contains **no** `&#x2019;`/`&rsquo;` — the approved apostrophes
survive rendering.

### 5. Carried, not closed

- **Modal painted pixels stay UNVERIFIED** — Fern declared it plainly and did not
  claim a render he did not see, which is the correct behaviour. Same limit class
  as SQ7 / FQ35. The modal *content* is verified as data (DOM + the approved
  strings above); only the picture is missing. **This is a QA leg, via Porter.**
- **SQ17 (branch) is untouched and stays with Porter → the human.** Checkout is
  `D1`, tree holds the two modified files, **zero git writes** — verified by me.
- FQ47's three notices answered above; none is owed back.
