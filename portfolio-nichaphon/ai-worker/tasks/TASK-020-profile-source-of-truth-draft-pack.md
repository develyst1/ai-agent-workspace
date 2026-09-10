# TASK-020: Draft the profile source-of-truth pack + approval sheet
- Source: SPEC-005
- Status: **DONE 2026-09-09, Sober** — all three rework fixes re-verified by SA from the file
  itself (22/22 flagged by my own mechanical re-scan, 0 mismatch; the bridge clause gone; the
  sheet 6 lines asking all five questions). **The pack is ready for the owner.** FQ36 answered
  below: no body edit, no third pass — it rides to Porter as **SQ29** and into TASK-021 step 9.
  (Previously: **REVIEW 2026-09-09, Fern (rework resubmitted)** — all three fixes applied inside
  `DRAFT-002`, all 5 rework DoD boxes evidenced in §Implementation Notes › Rework. Zero code
  touched (git identical to the pre-rework capture). One new non-blocking question, **FQ36**,
  on a side effect of fix 2.)
  (Previously: **REWORK 2026-09-09, Sober** — the pack is sound and every DoD box was re-verified by
  SA, but the approval sheet did not yet show the owner what he would be signing: the "six
  claims with no resume backing" is really **22**, and one body sentence asserted an identity no
  source states. Three closed fixes in §Review; FQ33/FQ34/FQ35 answered in §Questions.)
  (Previously: **REVIEW 2026-09-09, Fern** — pack written, zero code touched, all 8 DoD boxes
  evidenced in §Implementation Notes; three questions for Sober (FQ33/FQ34/FQ35) in §Questions.)
  (Scope had grown 2026-09-09, Sober: §(d) gained C9 — Fern's own FQ32, routed — and the sheet
  is 5 lines, not 4. Both are in the delivered pack.)
- Depends on: none (independent of TASK-019 — different files, no overlap)
- Owner: **Fern (FE)**

## What to do

Write **one draft file** — `ai-worker/drafts/DRAFT-002-req005-profile-pack.md` — and **edit
no code at all**. This is the same shape as TASK-016's pack for REQ-003: the owner reads the
exact words before any of them reach his site or his AI's mouth.

### Sources you may use — and only these three

1. `../project-docs/resume-2026-09-06-transcript.md` (cite as `[R:<section>]`)
2. A string **already shipped** in `front/src/` (cite as `[S:<file>:<key>]`)
3. An owner decision recorded in `requirements/REQ-005-…md` §Owner decisions (cite as `[O:Q40]` etc.)

Anything you cannot cite to one of those three does not go in the pack. No rounding, no
"and more", no inferred totals, no invented client name, date, metric or certificate.

### The pack has five sections, in this order

**(a) The proposed `PROFILE.md` body — the full text, final wording.**
Destination once approved: `back/knowledge/PROFILE.md` (repo root `back/`, currently empty).
Write it as clean Markdown a human would happily read: **no citation markers, no footnote
numbers, no `[R:…]` tags anywhere in the body.** REQ-007 feeds this whole file to an LLM,
and any marker in it will be read back to a visitor as if it were content.

Suggested sections (adjust if the facts justify it, but say why in the pack):
Identity · Summary · Experience (GFAI, ICM, Freelance) · Selected systems (the LLM gateway,
the Text-to-SQL agent) · Skills · Education · Languages · Certificates · Contact.

Four content rules that are not negotiable:
- **The corrected facts, not the old ones.** Use "about three weeks", "AI & Robotics
  Developer", "Senior / Staff Software Engineer", "ICM Smart Solution Co., Ltd.", "4 years".
- **`ห้าม` is absolute.** No reference name, no third-party phone number, **no "Chatuchak"**.
  Location, if stated at all, is "Bangkok, Thailand".
- **Education and Languages DO go in this file** (they are barred from the *site* by
  SPEC-005 §D3, not from the profile).
- `SITE.phone` and `SITE.email` are already public on the live site and may appear.

**(b) The proposed `PROFILE.citations.md` — one row per fact line in (a).**
Destination: `back/knowledge/PROFILE.citations.md`. Table: `line/heading | the claim |
citation`. This is where every `[R:…]` / `[S:…]` / `[O:…]` tag lives. Sober will spot-check
rows at random against the transcript and the shipped code, so a row that cannot be
verified is a rework, not a rounding error.

**(c) The Q42 Class 1 add-list.** These are new items in `SKILL_GROUPS` arrays that already
render — no new component, no new type, no layout change. Propose each with its citation and
the exact group it joins. SPEC-005's candidates: `Kimi`, `DeepSeek`, `xAI`,
`Text-to-SQL / schema grounding`, `MQTT` → group `ai`; `Go Gin` → `backend`; `SQLite` →
`databases`; `nginx`, `pm2` → `devops`. **You may propose fewer** if an item reads badly
beside what is already there (the owner's Q42 was *"ถ้าอะไรเหมาะสม และดูดี ก็เพิ่ม"* — if it fits
and looks good). **You may not propose more** without asking Sober first.
Note for each: exact string, target group, citation, and one short line of why it fits.
**Do not propose an Education or Languages section for the site** — that is SQ24, with Porter.

**(d) C5 and C8 proposals.**
- C5 `SITE.role`, today `'Senior / AI Software Engineer'`. Q47's written default is
  `'AI Engineer / Senior Software Engineer'`. Show it, and show that approving it also
  moves **two** hardcoded copies of the old words: `src/app/layout.tsx` `metadata.description`
  and `src/app/about/page.tsx` `metadata.description`. Write the exact replacement sentence
  for each of those two, so the owner sees what his search-result snippet will say.
  (`layout.tsx`'s page *title* interpolates `SITE.role` and needs no edit — say so.)
- C8 `SITE.copyrightYear`, today `'2025'`. Q48's written default is `'2026'`, as a plain
  constant (SPEC-005 §D4 explains why it is not computed).
- **C9 `ABOUT_INTRO.title` — ADDED 2026-09-09 by Sober, from your own FQ32.**
  `src/components/partials/About/About.config.ts:3`, today
  `'Three years of shipping the thing nobody there had shipped before'`. It is the `/about`
  `<h1>`. TASK-019's C6 has just made `/` say **"4 Years experience"**, so the site now
  states one career length twice with two different numbers, both in shipped HTML.
  Write this proposal as **two candidate wordings plus one question**, and do **not** pick:
  - candidate A, minimal edit: `'Four years of shipping the thing nobody there had shipped before'`
  - candidate B, drop the number: `'Shipping the thing nobody there had shipped before'`
  - the question: was "three years" ever meant as his **career total** (then A or B fixes a
    stale number), or as the length of **one particular pattern of work** (then it may be a
    separate fact and B is the safe repair)? SA will not answer this; he must.
  - **Do not offer "revert the 4 back to 3+"** as an option — the `4` is his own Q40
    decision and is the fixed point. The headline is the string that moves.
  - Cite it `[S:About.config.ts:ABOUT_INTRO.title]` + `[O:Q40]`, like everything else.

**(e) The approval sheet — 5 to 6 lines, plain language, no file paths, no jargon.**
Porter puts this to the owner in Thai without having to rewrite it. It must let him answer
each of these with one word: (1) the profile text as drafted — yes / changes; (2) the skill
items being added; (3) his headline (C5); (4) the footer year (C8); **(5) the `/about`
headline — A, B, or his own words (C9)**. Line (5) must say plainly, in one clause, why it
is being asked: his site now shows both "4 years" and "Three years".

## Definition of Done

- [x] `ai-worker/drafts/DRAFT-002-req005-profile-pack.md` exists with all five sections.
- [x] **Zero files under `front/`, `back/` or anywhere in the code repo were modified** —
      confirm with `git status` in the code repo and paste the result.
- [x] Every line of section (a) has a matching row in section (b), and every row's citation
      names a real place you actually opened.
- [x] `grep -i chatuchak` over the whole pack returns **zero**.
- [x] The only human names in section (a) are "Nichaphon Sayvav" and "Dong". State that you
      checked, and how.
- [x] Section (a) contains **no** citation marker, footnote or bracketed tag.
- [x] The approval sheet in (e) is 6 lines or fewer **and asks all five questions** — the
      fifth being C9, the `/about` headline.
- [x] Section (d) carries C9 with **both** candidate wordings and the "career total vs one
      pattern of work" question, and **does not pick one** and does not offer reverting the `4`.

## Implementation Notes

**Written 2026-09-09 by Fern. One file created, zero code touched.**

- **Deliverable:** `ai-worker/drafts/DRAFT-002-req005-profile-pack.md`, five sections in the
  order the TASK names: (a) the full proposed `PROFILE.md` body, (b) the full proposed
  `PROFILE.citations.md`, (c) the Q42 Class 1 add-list, (d) C5 + C8 + C9, (e) the five-line
  approval sheet.
- **Sources actually opened** (nothing else was read as a source): the resume transcript;
  `front/src/constant/site.ts`, `front/src/constant/content/about.ts`,
  `front/src/components/partials/Home/Home.config.ts`,
  `front/src/components/partials/About/About.config.ts`, `front/src/app/layout.tsx`,
  `front/src/app/about/page.tsx`; and REQ-005 §Owner decisions.

### DoD evidence

| Check | Command / method | Result |
|---|---|---|
| Pack exists, five sections | file written | **yes** |
| No code file modified | `git status --short` + `git diff --stat` in the code repo, run **before** drafting and **again after** | **identical both times**: the same four `M` lines (TASK-019's), `4 files changed, 10 insertions(+), 10 deletions(-)`. `git status --untracked-files=all` adds nothing. `back/` still holds **0 entries** |
| Every (a) line has a (b) row | scripted: body split into claim units, each matched by token overlap against the citation table | **59 claim units + 9 structural `##` headings** (headings state no fact) against **66 citation rows**; the one unit scoring under 0.5 on the crude token match ("Matches the question to an allowlist…") **does** have its row, abbreviated. **No uncovered claim** |
| `grep -i chatuchak` over the pack | `grep -ic chatuchak drafts/DRAFT-002-…md` | **0**. The district name is written nowhere in the pack — not in the body, not in the citations, not in my own explanatory prose, which is why those passages say "the home district" |
| Only human names in (a) are "Nichaphon Sayvav" and "Dong" | scripted extraction of **every** capitalised token in the bounded body (regex `[A-Z][A-Za-z.&/-]*`), then classified by hand — 145 distinct tokens | The only person tokens are **Nichaphon**, **Sayvav**, **Dong**. Everything else is a company (GFAI R&I Thailand, ICM Smart Solution, Fastwork.com, BorntoDev Academy, DevLab), a product or technology (Gemini, OpenAI, xAI, DeepSeek, Kimi, GPT, Hono, Elysia, NestJS, …), a place (Bangkok, Thailand), a language (Thai, Lao, English), or a sentence-initial ordinary word |
| (a) has no citation marker, footnote or bracketed tag | scripted `/[[RSO]:|[^|[[0-9]+]/` over the bounded body | **0 hits**. The body is fenced between two `---` rulers and the explanatory notes were moved **outside** it and re-titled "NOT part of the file", so the boundary is unambiguous |
| Sheet is ≤ 6 lines and asks all five | read | **5 numbered lines**, in the TASK's order: profile text · skill items · headline (C5) · footer year (C8) · `/about` headline (C9). Line 5 states the reason in its first clause — his site now shows both "4 years" and "Three years" |
| C9 carries both wordings + the question, picks neither, offers no revert | read | Two candidates tabled (A minimal edit, B drop the number), the "career total or one pattern of work" question stated as **his**, and the pack says in as many words that reverting the `4` is **not** offered because it is his own Q40 decision |

### Judgement calls I made, and what I refused to do

- **All nine Class 1 candidates are proposed — none dropped, none added.** I checked each
  against `about.ts` first: all nine return **zero** existing occurrences, so none is a
  duplicate. Two consequences are recorded rather than decided: the lowercase `nginx` / `pm2`
  spelling (the resume's, against the group's title case — same collision C3 had), and the
  provider overlap with the existing `Generative AI (Gemini, OpenAI)` item, which is FQ34.
- **I did not touch any shipped string, even where one would read better.** Rewriting that
  `ai` item to hold all five providers is an edit, and SPEC-005 D3 Class 1 authorises new
  array items only.
- **"Mentored 7+ developers" (summary) and "Mentored 7 developers" (ICM bullet) are both
  kept, both verbatim**, because both are his resume's own words in the two places it puts
  them, and "7+" includes 7 — they do not contradict. Nothing was smoothed to hide it.
- **Six claims in the body have a site citation and no resume backing** — they are legal
  under R2 (a shipped string is an allowed source) but the REQ-007 AI will repeat them as
  fact, so they are listed together in section (b) instead of being buried. That is FQ35.
- **Left out deliberately:** the eleven `projects.ts` entries (FQ33), and any Education or
  Languages block for the *site* (SQ24, Porter's).
- **Nothing was inferred.** In particular I did **not** assert that the resume's "AI API
  Center — LLM Gateway" is the site's "Develyst AI Gateway" project, or that it is the
  gateway REQ-006 will call. They may well be the same system; no source I am allowed to
  use says so, so the profile describes only what the resume states.

### Housekeeping

- No dev server started, no build run — this unit edits no code, so there is nothing to
  typecheck. `front/.next` from Sober's review was left alone and **not** deleted, because
  I did not run `npm run dev`; the next engineer who does must still delete it first.
- No commit, no stage, no branch touched. Checkout is still `D1`.

### Rework 2026-09-09 (Fern) — the three §Review fixes

**One file edited: `ai-worker/drafts/DRAFT-002-req005-profile-pack.md`. Zero code, again.**
`git status --short` / `git diff --stat` / `git log -1` / `ls -A back` were captured **before**
this rework and re-run after: identical both times — the same four TASK-019 `M` files,
`10 insertions(+), 10 deletions(-)`, HEAD `6c17609`, `back/` **0 entries**.

| Fix | What I did | Evidence |
|---|---|---|
| **1 — flag all 22** | Re-flagged section (b) by **script**, not by eye: any row citing `[S:` with no `[R:` and no `[O:` gets exactly `**site-only, no resume backing**`. The three earlier wordings ("…not on the resume", "…the resume states no period") were normalised to that one string so the flag can never again be editorial. The "six claims" paragraph is replaced by a **22 of 66** statement plus a six-group breakdown (certificates 4 · GFAI's business 3 · other job-history lines 4 · the three tag lists 3 · skill lines 5 · identity lines 3 = **22**). | Re-scan of the rendered table: **66 rows, 22 unbacked, 22 flagged, 0 mismatch** in either direction |
| **2 — drop the bridge** | `The same work shipped as` struck; your replacement sentence used **verbatim**. Its (b) row is unchanged and now carries the fix-1 flag. | `grep -c "The same work shipped as"` = **0** |
| **3 — sixth line** | Sheet is **6 numbered lines**; line 6 is your §Review wording, reflowed only. Line 2 gained FQ34's option 1 / option 2 with both exact strings. | `grep -c "^[0-9]\. "` inside section (e) = **6** |

**One arithmetic note, so the count is not re-litigated later.** Your answer says "the 16 you
did not flag"; mechanically it is **17** — 22 unbacked minus the **5** rows that carried the
bold flag. The 17th is the extra-Core-AI-items row, which my prose named among "six" but never
actually flagged; that is the same discrepancy you spotted from the other side ("5 carry the
bold flag while your prose says six"). Nothing here is in dispute — the rule you gave is what
was applied, and it flags all 22.

**Two consequential edits, and I chose the more conservative shape on both.** Sheet line 2 ends
with one plain factual clause — *"Option 2 is the only one that changes wording already
published on your site"* — because without it he is choosing between two strings with no way to
see which one edits his live copy; it states the difference and recommends nothing. Sheet line 1
gained *"(Read line 6 below before you answer this one.)"* for the reason your fix 3 gives.

**Housekeeping edits inside the pack, no content moved:** the (a) notes' projects bullet and
(c)'s overlap note were stale the moment FQ33/FQ34 were answered, so they now state D5 and
Class 1b instead of "raised as FQ33/FQ34 for Sober"; the pack's trailing questions section
records all three as answered and carries **FQ36**. Sections (a), (b), (c) and (d) are otherwise
untouched — nothing you accepted was re-drafted.

**One count I corrected without being asked, recorded so it is not a silent deviation.** The
pack's opening blurb said "two new text files and **four** site strings" — a stale count from
before C9 was added at your review. It is **five** (`SITE.role` + the two hardcoded descriptions
+ `SITE.copyrightYear` + `ABOUT_INTRO.title`), and the blurb now says so, and names the sixth
that moves only under FQ34's option 2. Nothing else in the blurb changed.

No dev server, no build (this unit still edits no code). `front/.next` left as it was.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

Ask here — do not decide alone — if: a resume line and a shipped site line say the same
thing differently and you cannot tell which wording to use; an item in the Class 1 list
reads badly and you want to drop it (say which and why, that is fine, just record it); or
you believe a fact belongs in the profile that is not in any of the three allowed sources.

**FQ33 (NEW 2026-09-09) — should the profile carry the eleven portfolio entries?**
`front/src/constant/content/projects.ts` ships eleven approved project entries, several of
them AI work a visitor is very likely to ask the REQ-007 feature about ("Develyst AI
Gateway", "RAG Chatbot for CRM Sales", "R1-BEV Voice Command Robot" …). TASK-020's section
list does not include a projects section, and folding eleven entries in would roughly
**double** the file, so **they are not in this draft**. They are already-approved copy, so
adding them later is a copy-paste, not a new approval hop. Your call — and it may belong to
REQ-007 (what the AI can answer) rather than to REQ-005 (what is true about him).

> **answer (Sober 2026-09-09): keep them out of `PROFILE.md`, and add them nowhere in REQ-005.**
> Your second reading is the right one. REQ-005's file answers *who he is*; the eleven entries
> answer *what the AI may say about his work*, which is REQ-007's knowledge scope — and REQ-007
> is `READY_FOR_SA` and mine to spec next. Recorded as SPEC-005 **D5** so the next spec inherits
> it instead of rediscovering it: the entries become a **second** file (working name
> `back/knowledge/PROJECTS.md`), specced under REQ-007, sourced by copy-paste from the
> already-approved `projects.ts`. Two consequences you should not have to infer: (1) it costs the
> owner **no** extra approval line now, and (2) `PROFILE.md` must not silently become the AI's
> only source — which is why this is written down rather than left as "we'll add it later".
> **Nothing in your draft changes for FQ33.**

**FQ34 (NEW 2026-09-09) — the `ai` group's existing first item, once the add-list lands.**
Adding `DeepSeek`, `Kimi` and `xAI` as chips leaves `Generative AI (Gemini, OpenAI)` naming
two more providers **inside a phrase**, so `/about` would list five providers in two
different shapes. Rewriting that item to `Generative AI (Gemini, OpenAI, xAI, DeepSeek,
Kimi)` reads better, but it **edits a shipped string**, which SPEC-005 D3 Class 1 does not
authorise ("new array items only"). **I did not do it and did not put it on the sheet.** If
you want it offered to him it needs either a sixth sheet line or a widening of Class 1 —
both are yours, not mine.

> **answer (Sober 2026-09-09): you were right not to do it, and it does not need a new line.**
> I am **not** widening Class 1 into a general licence to edit shipped strings — that rule exists
> because this is copy in a real person's name. I am authorising exactly one edit, **Class 1b**,
> and only if he says so in his own words: SPEC-005 D3 now reads "new array items, **plus one
> named existing item, if and only if the owner approves its exact replacement string on the
> sheet**". It rides **inside sheet line 2**, which is already the skills question, as a
> two-option sub-clause — no sixth line is spent on it:
> - **option 1 (default — nothing already shipped is edited):** all nine new items go in and
>   `Generative AI (Gemini, OpenAI)` stays exactly as it is;
> - **option 2:** that one item becomes `Generative AI (Gemini, OpenAI, xAI, DeepSeek, Kimi)`
>   and add-list items 1-3 (`DeepSeek`, `Kimi`, `xAI`) are then **not** added separately — six
>   new items instead of nine.
>
> Write both shapes out and recommend neither. Option 2 *without* dropping those three chips
> would name the same three providers twice on one page, so that shape is not on offer.

**FQ35 (NEW 2026-09-09) — six site-only claims sit in the profile body; keep or strike?**
Listed together at the foot of section (b): the **2 performance awards**, **"promoted to
Senior faster than anyone in company history"**, the Freelance period **"ongoing"**, three
frontend frameworks (**Vue.js, Angular, ASP.NET**), the four **ways-of-working** items, and
the four extra Core AI items. Each is a shipped site string, so each is a **legal** source
under R2 — but **none has resume backing**, and the REQ-007 AI will repeat them to a
stranger as fact about a real person. I kept them and flagged them rather than dropping them
silently. If the knowledge base should carry only resume-backed claims, say so and I strike
all six in TASK-021 — it is a deletion, so it costs nothing.

> **answer (Sober 2026-09-09): keep every one of them, strike none — but the number is wrong,
> and that is the rework.** Keeping is right: each is copy he has already shipped in his own
> name, and R2 makes a shipped string a legal source; silently deleting his own website's claims
> from the file his AI answers out of would be *us* editing his life. **But six is not the
> count.** I counted the rows in your own table whose citation carries no `[R:` and no `[O:` —
> **22 of 66**, of which **5** carry the bold flag while your prose says six. The 16 you did not
> flag include the ones a stranger is most likely to take as fact: **the four certificates**
> (each with an issuer and a year — the resume names no certificate at all, and REQ-005 R2 names
> "a certificate" as exactly the kind of claim that needs a source), and the **GFAI narrative** —
> "GFAI had no product of its own and resold third-party hardware" is a statement about a **named
> third-party company's business**, and the most reputationally loaded sentence in the file.
> Also unflagged: the ICM and Freelance body lines, all four tag lists, "Availability",
> "Goes by: Dong", "cloud deployment", and the Languages skill line. **Fix (b) so the flag is
> mechanical, not editorial** — no `[R:` and no `[O:` means flagged — and put the honest number
> on the sheet. See §Review fix 1 and fix 3.

**FQ36 (NEW 2026-09-09, from the rework) — fix 2 leaves the mirror-image inference open.**
Non-blocking; the pack is complete without an answer. Striking "the same work shipped as" leaves
the ICM section with two adjacent bullets that each describe a four-month CRM AI build — the
resume's CRM-connected AI assistant (Text-to-SQL, schema routing) and the site's AI-powered RAG
chatbot in the CRM Sales app. Your reasoning is right and I applied your sentence verbatim. What
I want on the record: a reader, or the REQ-007 LLM, may now infer **two separate** four-month CRM
projects — which no allowed source states either. I am **not** proposing a fix, because every fix
I can construct asserts a relationship (same / different) that no source supports. The only
person who knows is the owner, so if you want it resolved rather than left neutral it is a sheet
line, not an edit — and the sheet is already at its 6-line ceiling, so that is your call, not mine.

> **answer (Sober 2026-09-09): you are right in both directions, and the answer is "change
> nothing in the body". This does not reopen the pack.** Fix 2 struck an unsourced *same*; every
> repair you could write here asserts an unsourced *same* or *different*. Two bullets sitting in
> a list assert nothing on their own — that is the only shape that stays inside R2, so the body
> ships exactly as you wrote it. Recorded so it is not rediscovered:
> - **It reaches the owner without a 7th line.** Sheet line 1 already shows him both bullets and
>   asks whether every line is correct — and a doubled four-month project is the single most
>   noticeable error a man can find in his own record. It goes to Porter as **SQ29** so that when
>   he puts line 1 into Thai he *names the spot* rather than trusting a skim. One clause in his
>   delivery, no change to your sheet.
> - **TASK-021 gains step 9**, conditional and shaped exactly like Class 1b: if the owner says
>   one project, the two bullets merge into his words; if he says two, or says nothing, they ship
>   as drafted and the notes say so.
> - **REQ-007 inherits it, not us.** SPEC-005 §D5 already sends the eleven `projects.ts` entries
>   into REQ-007's second knowledge file — one of which is the CRM RAG chatbot, the very bullet in
>   question. When I spec REQ-007 I have to know this relationship is *unstated* rather than
>   assume the LLM may join them, so it is written into SPEC-005 §SQ29 now, while it is cheap.
>
> For the record, on your arithmetic correction: **you are right and I was wrong.** 22 unbacked
> minus the 5 already bold is **17**, not the 16 my FQ35 answer wrote. It changed no instruction —
> the rule I gave was "no `[R:` and no `[O:` means flagged" and that is what you applied to all 22 —
> but the number was mine and it was wrong, so it is corrected here rather than left to stand.

## Review

### Verdict round 2 — 2026-09-09, Sober: **DONE**

The three fixes are in and the pack is ready for the owner. As before, nothing is taken from
your notes — every line below is something I ran or read myself, against the file on disk.

- **Fix 1 re-scanned by my own script, not your count.** I parsed section (b), applied the rule
  independently (*a row citing `[S:` with no `[R:` and no `[O:` must carry
  `**site-only, no resume backing**`*) and got **22 unbacked, 22 flagged, 0 missing, 0 flags on a
  backed row**, and no surviving copy of the three old flag wordings. The six-group breakdown
  sums to **22** and each group matches the rows it claims (certificates 4 · GFAI's business 3 ·
  other job-history 4 · the three tag lists 3 · skill lines 5 · identity 3).
- **Your 66 is right and my parser's 73 was wrong** — the extra 7 are the breakdown table's own
  header and six rows. Recorded because a future reader re-running this check will hit the same
  thing.
- **Fix 2: `grep -c "The same work shipped as"` = 0**, and the replacement bullet is my sentence
  **verbatim**, standing alone.
- **Fix 3: the sheet is 6 numbered lines and asks all five questions.** Line 2 carries option 1
  and option 2 with both exact strings and recommends neither; line 6 is the unbacked-categories
  question in his language. Your two additions — line 2's "Option 2 is the only one that changes
  wording already published on your site" and line 1's pointer to line 6 — are both **kept**:
  each states a fact he needs to answer honestly and neither recommends anything.
- **Fresh spot-checks on rows I had not touched in round 1** (the rework moved flags, so I
  re-picked): all **four certificates** match `about.ts` `CERTIFICATES` on title, issuer **and**
  year, and the resume names no professional certificate at all (only the 2021 Higher Vocational
  Certificate under Education) — so all four are correctly flagged site-only. The ICM bullet
  "Generative AI (Gemini, OpenAI, xAI)" is the resume's own line **verbatim** and is correctly
  **not** flagged.
- **Zero code touched, verified in the repo myself:** `git status --short` = TASK-019's four `M`
  files and nothing else, `git diff --stat` = 4 files / 10 insertions / 10 deletions, `git log -1`
  = `6c17609`, checkout `D1`, `ls -A back` = **empty**. `grep -ic chatuchak` over the pack = **0**.

**What happens next, so nobody waits on the wrong thing:** the pack goes to Porter for the owner.
TASK-021 stays `BLOCKED` until he answers, and it now carries three conditional steps — Class 1b
(line 2), delete-what-he-names (line 6) and the ICM merge (SQ29).

### Verdict round 1 — 2026-09-09, Sober: REWORK

Three closed fixes, all inside `DRAFT-002`. No code is
involved, nothing you did is thrown away, and the pack does not need re-drafting — (a) is sound
prose, and I accept (c) and (d) as delivered.

### What I re-verified myself (nothing taken on trust from your notes)

- **Zero code touched: TRUE.** `git status --short` in the repo shows the same four `M` files
  from TASK-019 and nothing else; `git log -1` = `6c17609`; `back/` is still empty.
- **Privacy gate: TRUE.** `grep -ic chatuchak` over the pack = **0**; `grep -ric chatuchak` over
  `front/src` = **0**.
- **Ten citation rows spot-checked at random against the two sources — all ten hold:** the
  Summary paragraph (word for word against the transcript Header), the GFAI three-weeks bullet,
  the ICM 7-developers / 40-percent bullet, both Selected-systems sub-lines with their three
  bullets each, the Education line, the three Languages lines, the Backend and Databases skill
  lines, and the Contact block.
- **All nine add-list items really are absent from `about.ts`** — checked against the shipped
  `SKILL_GROUPS`, not against your grep: `backend` has `Go Fiber` and no `Go Gin`, `databases`
  has no `SQLite`, `devops` is `Docker, Git, Cloud Deployment` only. The `ai` group's first item
  does read `Generative AI (Gemini, OpenAI)`, so **FQ34 is a real overlap, not a misreading**.
- **C5's two replacement sentences are exact.** Compared word by word against the shipped
  `layout.tsx:38` and `about/page.tsx:7`: only the leading role phrase moves, and both already
  carry "about three weeks" from TASK-019. `title.default` does interpolate the `SITE.role`
  constant, so your "no edit needed" is right.
- **C9 is delivered exactly as the TASK demanded:** both candidates, the reading question stated
  as his, no pick, and no revert-the-`4` option.

### Fix 1 — section (b): flag every unbacked row, and count them

The table has **66 rows; 22 cite only `[S:`** — no `[R:`, no `[O:`. Five carry the bold flag and
the prose says six. Re-flag **all 22** by the mechanical rule *no `[R:` and no `[O:` means
`**site-only, no resume backing**`*, and replace the "six claims" paragraph with the true count.
The 16 currently unflagged are listed in my FQ35 answer above; the four certificates and the
GFAI third-party-company sentence are the two that matter most.

### Fix 2 — section (a): one sentence asserts something no source states

> "**The same work shipped as** an AI-powered RAG chatbot inside the core CRM Sales
> application, end to end in under four months..."

The resume describes a CRM-connected AI assistant built with Text-to-SQL and schema routing; the
site describes an AI-powered RAG chatbot in the CRM Sales app. They may well be one project.
**No allowed source says they are** — "the same work" is a bridge you built, and it is the
identical inference you correctly refused for "AI API Center = Develyst AI Gateway". Drop the
bridging clause and let the bullet stand on its own, e.g.:

> "Built an AI-powered RAG chatbot into the core CRM Sales application end to end in under four
> months, giving the sales team real-time, context-aware customer support."

Its (b) row keeps the site-only flag from fix 1. This matters more here than it would on a CV:
REQ-007 feeds this file to an LLM, and an unsourced "the same work" is exactly the sort of line
a model will elaborate on to a stranger.

### Fix 3 — section (e): a sixth line, so he sees what he is signing

Line 1 asks "is every line about you correct as written?". He cannot answer that honestly
without being told which lines his **resume does not carry**. TASK-020's DoD allows **6 lines**;
spend the sixth. Plain language, no file paths, no counts he has to decode — name the categories:

> 6. **Some of what this profile says about you comes from your website, not from your resume**
>    — your two performance awards, "promoted to Senior faster than anyone in company history",
>    your freelance work being "ongoing", your four certificates (Prompt Engineering with GitHub
>    Copilot, DevLab, Employee Survival, Essential SQL for Everyone), what GFAI's business was
>    before your kiosk, and several technology and ways-of-working lists. They are all on your
>    site today, and your AI will repeat them to visitors as fact. Keep them all, or name the
>    ones to take out.

And line 2 gains FQ34's two-option sub-clause (see that answer above) — still one line.

### What I am NOT asking you to change

The "7+" / "7" pair (both his own words, in the two places his resume puts them); the `nginx` /
`pm2` lowercase (source spelling, flagged not decided); "Performance awards: 2" read off a
shipped `'2x'`; the split into eight skill groups; and the absence of a projects section (FQ33,
answered above). All correct as delivered.

### Definition of Done for the rework

- [x] All 22 site-only rows in (b) carry the flag, and the summary paragraph states **22 of 66**,
      counted the same way (no `[R:`, no `[O:`) — not six.
- [x] The "The same work shipped as" clause is gone from (a); the bullet stands alone.
- [x] The sheet in (e) is **6 lines**, and line 6 names the unbacked categories in his words.
- [x] Sheet line 2 offers FQ34's option 1 / option 2 with both exact strings, recommending
      neither.
- [x] `grep -ic chatuchak` over the pack still returns **0**, and **zero code files are still
      modified** (`git status --short` unchanged from TASK-019's four).
