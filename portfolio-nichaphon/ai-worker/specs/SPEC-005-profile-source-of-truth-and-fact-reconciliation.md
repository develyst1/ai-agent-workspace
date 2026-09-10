# SPEC-005: Profile source-of-truth file + resume-vs-site fact reconciliation
- Source: REQ-005
- Status: ACTIVE (2026-09-09, Sober)

## Overview

REQ-005 asks for two things with one shared rule: **one machine-readable profile in
Markdown**, and **the site's facts stopping their disagreement with the 2026-09-06 resume**.
The shared rule is R2 — every claim traces to one of exactly three sources (the resume
transcript, an already-shipped site string, or an owner decision recorded in REQ-005
§Owner decisions).

Technical approach, and why:

1. **Split by who has already decided.** Five conflicts (C1, C2, C3, C4, C6) are settled
   verbatim by the owner's Q40 — they need no further approval and ship immediately
   (TASK-019). Everything that is still a *choice* — the profile file's actual sentences,
   the Q42 add-list, C5 and C8 — is drafted first, approved by the owner once, and only
   then placed (TASK-020 → TASK-021). This is the pattern REQ-003 used (TASK-016 → TASK-017)
   and it is used again because the same rule applies: **no sentence goes on this man's
   site in his name until he has read the exact words.**
2. **The profile is two files, not one.** `PROFILE.md` is clean prose the AI can be fed
   whole; `PROFILE.citations.md` carries the line-by-line provenance. They are separate
   because REQ-007 feeds the profile to an LLM — citation markers inside the body would be
   read back to a visitor as if they were content.
3. **No new UI.** REQ-005 §Out of Scope bars a visual pass, so every site change here is a
   string edit inside files that already exist and already render.

## Decisions this SPEC makes (SA's own, recorded so they can be reversed cheaply)

**D1 — The profile lives at `back/knowledge/PROFILE.md`** (+ `back/knowledge/PROFILE.citations.md`).
`back/` already exists at the repo root, empty, as the owner's Q33 decision. Putting the
knowledge beside its only consumer keeps `back/` deployable on its own; a root-level
`profile/` would force the human to copy a second directory whenever he deploys (Q43).
REQ-005 is still frontend-only in the sense that matters — **no backend code, no Bun, no
Hono, no dependency is created here**; two text files are written into an empty folder.
Reversal cost if the owner or REQ-006 wants it elsewhere: one `git mv` and one path
constant. Carried to Porter as **SQ26 (FYI)**.

**D2 — `PROFILE.md` body is clean; provenance is a sibling file.** See Overview #2.

**D3 — Q42's add-list splits into two classes.** Class 1 fits an existing rendered array
with zero new UI; Class 2 does not exist anywhere in the site's UI today. Only Class 1 is
authorised for the site by this SPEC. See §Flow step 4 and **SQ24**.

**D3 amended 2026-09-09 (Sober, answering Fern's FQ34) — Class 1b, exactly one edit.** Class 1
authorises *new array items only*. Fern found that adding `DeepSeek`, `Kimi` and `xAI` as chips
leaves the group's existing first item, `Generative AI (Gemini, OpenAI)`, naming two more
providers inside a phrase — five providers in two shapes on one page. He correctly refused to
rewrite it. **Class 1 is NOT widened into a general licence to edit shipped copy**; instead
D3 now reads: *new array items, plus **one named existing item**, if and only if the owner
approves its exact replacement string on the approval sheet.* It is offered inside sheet line 2
(no new line) as two shapes he picks between, with no recommendation: **option 1** — all nine
new items, nothing shipped is edited; **option 2** — that item becomes
`Generative AI (Gemini, OpenAI, xAI, DeepSeek, Kimi)` and the three provider chips are then
**not** added, so six new items instead of nine. Adding the chips *and* rewriting the phrase is
not offered — it names the same three providers twice.

**D5 — the eleven `projects.ts` entries are REQ-007's scope, not REQ-005's** (Sober 2026-09-09,
answering Fern's FQ33). `PROFILE.md` answers *who he is*; the eleven approved portfolio entries
answer *what the AI may say about his work*, and folding them in would roughly double the file.
They become a **second** knowledge file (working name `back/knowledge/PROJECTS.md`), specced
under REQ-007 and sourced by copy-paste from the already-approved `projects.ts` — so it costs
the owner no approval line here. Written down rather than left implicit for one reason:
**`PROFILE.md` must not silently become the AI's only source.** REQ-007's spec inherits this.

**D4 — C8 stays a constant, not a computed year.** See **SQ25**: on a statically built site
an auto-advancing year freezes at build time, which replaces a *visible* stale number with
an *invisible* one. The value itself remains the owner's (Q48).

## Interface / Data — the exact strings that move

Verified by grep against the working tree on 2026-09-09, **not** taken from the REQ's counts.
REQ-005 AC-c states C1 and C3 carry two strings each. **C3 does. C1 does not — it carries
five** (see SQ22). All paths below are relative to `front/` unless stated.

### Group A — decided by Q40, no approval needed (TASK-019)

| # | File : line | Current | Becomes |
|---|---|---|---|
| C1.1 | `src/constant/content/about.ts:45` | "In **two weeks** I delivered a working prototype" | "In **about three weeks** I delivered a working prototype" |
| C1.2 | `src/constant/content/about.ts:156` | "a robotic kiosk prototype in **two weeks**" | "a robotic kiosk prototype in **about three weeks**" |
| C1.3 | `src/components/partials/Home/Home.config.ts:2` (`HOME_LEAD`) | "to a working prototype in **two weeks**" | "to a working prototype in **about three weeks**" |
| C1.4 | `src/app/layout.tsx:38` (`metadata.description`) | "Robotic kiosk prototype delivered in **two weeks**" | "Robotic kiosk prototype delivered in **about three weeks**" |
| C1.5 | `src/app/about/page.tsx:7` (`metadata.description`) | "a robotic kiosk prototype delivered in **two weeks**" | "a robotic kiosk prototype delivered in **about three weeks**" |
| C2 | `src/constant/content/about.ts:40` | `role: 'AI and Developer'` | `role: 'AI & Robotics Developer'` |
| C3.1 | `src/constant/content/about.ts:63` | `'ICM Smart Solutions Co., Ltd.'` | `'ICM Smart Solution Co., Ltd.'` |
| C3.2 | `src/constant/content/about.ts:184` | `issuer: 'ICM Smart Solutions'` | `issuer: 'ICM Smart Solution'` |
| C4 | `src/constant/content/about.ts:62` | `role: 'Senior Software Engineer'` | `role: 'Senior / Staff Software Engineer'` |
| C6 | `src/constant/content/about.ts:139` | `{ id: 'years', value: '3+', ... }` | `value: '4'` (label `Years experience` unchanged) |

C1.3 is **visible copy on the homepage**. C1.4 and C1.5 are indexed by search engines.
Leaving any of the three keeps the contradiction alive on the site the recruiter opens.

**C3 casing is deliberate, not an oversight:** the resume prints the name all-caps; the site
is title case and stays title case, per Porter's resolved table. Flagged for the owner at
sign-off — one word reverses it.

**C7 changes nothing.** Q41 (`ห้าม`) overrides the resume-base rule: `SITE.location` keeps
"Bangkok, Thailand" and **"Chatuchak" is written into no file, including the profile.**

### Group B — proposed, needs the owner's eye first (TASK-020 → TASK-021)

| # | Where | Proposal carried into the approval sheet |
|---|---|---|
| C5 | `src/constant/site.ts:6` `SITE.role` | Q47's written default, "AI Engineer / Senior Software Engineer" — **plus** the two propagations in SQ23 |
| C8 | `src/constant/site.ts:12` `SITE.copyrightYear` | Q48's written default, `'2026'`, as a constant (D4) |
| Q42 Class 1 | `src/constant/content/about.ts` `SKILL_GROUPS` items | New array items only — see §Flow step 4 |
| **C9** (NEW 2026-09-09) | `src/components/partials/About/About.config.ts:3` `ABOUT_INTRO.title` | The `/about` `<h1>`, `'Three years of shipping the thing nobody there had shipped before'` — two candidate wordings + the reading question, see below |
| PROFILE | `back/knowledge/PROFILE.md` | The full proposed text, verbatim, with its citation file |

**C9 — added 2026-09-09 by Sober, from Fern's FQ32 on TASK-019, verified by SA.**
C6 correctly moved `CAREER_STATS.years` from `3+` to `4` per Q40. That created a
contradiction with a string this SPEC never tabled: the `/about` page headline still says
**"Three years"**. Both now ship — verified in the **built** output, not just source:
`.next/server/app/index.html` carries `4` + `Years experience`, `about.html` carries
`<h1>Three years of shipping…</h1>`. One career length, two numbers, one of them at `<h1>`
scale on the page a recruiter reads. It is **not** a sixth conflict string of C1 and does not
touch SQ22 — an SA sweep of `front/src` for every year-count phrasing (`(one|…|ten|[0-9]+)
+? years?`, `yrs`, `decade`, `since 20`) returns **this one line and nothing else**.

Why it is Group B and not a silent fix: it is visible copy in a real person's name about his
own career, and the repair is a *wording* choice, not a find-and-replace. Same rule as the
rest of Group B — he reads the exact words first. **The `4` is the fixed point** (his own
Q40 decision); the headline is the string that moves, so "revert C6" is not an option to
offer him. Reversal cost: one string.

**The ambiguity SA will not resolve by assumption, and neither may FE:** "Three years" reads
either as his **career total** (stale, contradicts the `4`) or as "three years of *this
particular pattern*" (a different fact the resume never states). Both readings go to the
owner with both candidate wordings; the pick is his.

## Flow

1. **TASK-019** applies Group A exactly as tabled. No other string is touched. `npx tsc
   --noEmit` clean, `npm run build` exit 0 with no new error or warning line.
2. **TASK-020** produces `drafts/DRAFT-002-req005-profile-pack.md` — no code is edited. It
   contains, in this order: (a) the complete proposed `PROFILE.md` body; (b) the complete
   proposed `PROFILE.citations.md`, one row per profile line; (c) the Q42 Class 1 add-list,
   each item with its citation and the exact `SKILL_GROUPS` group it joins; (d) the C5, C8
   **and C9** proposals; (e) a **6-line approval sheet** (4 before C9, 5 before SQ28) Porter
   can put to the owner unchanged. **Line 6 is the one added at review (SQ28):** it names, in
   his own language, the claims in the profile that come from his website and **not** from his
   resume, because line 1 asks him to confirm every line is correct and he cannot do that
   honestly without being told which ones his resume never backed. Every row in (b) whose
   citation carries no `[R:` and no `[O:` must be flagged **mechanically**, not by editorial
   judgement — 22 of the 66 rows, not the six the first draft named.
3. **Approval hop.** Porter takes the sheet to the owner. Nothing in Group B is written to
   the repo before that answer lands. **Porter — not SA, not FE — copies the approved
   add-list into REQ-005 §Owner decisions**, because R5 requires it to be recorded there and
   neither SA nor FE may edit a REQ file (SQ24).
4. **Q42 add-list, the two classes (D3):**
   - **Class 1 — authorised for the site.** Items that are new entries in an array that is
     already rendered by an existing component: `Kimi`, `DeepSeek`, `xAI` (into
     `SKILL_GROUPS.ai`), `Text-to-SQL / schema grounding` and `MQTT` (into `ai`), `Go Gin`
     (into `backend`), `SQLite` (into `databases`), `nginx` and `pm2` (into `devops`).
     Zero new components, zero new types, zero layout change.
   - **Class 2 — NOT authorised for the site by this SPEC.** `Education` and `Languages`
     have no rendered structure anywhere on the site; showing them means a new `/about`
     section, a new type and a new component — which REQ-005 §Out of Scope explicitly bars.
     **Both facts still go into `PROFILE.md`**, so the REQ-007 AI can answer them. Whether
     they also earn a block on `/about` is the owner's scope call, raised as SQ24.
5. **TASK-021** places everything approved: writes the two profile files, applies the
   approved C5 (with SQ23's propagations if C5 moves), C8, **C9** and the Class 1 items.
   Build clean, same commands. Two conditional steps were added at review: the **Class 1b**
   edit if he picks option 2 on sheet line 2, and **removing any claim he names on line 6**
   from both profile files (a deletion, never a rewrite).
6. **Error / edge cases the tasks must handle, not discover:**
   - After TASK-019, a grep for `two weeks` over `front/src` must return **zero** hits, a
     grep for `Smart Solutions` (plural) must return zero, and a grep for `'3+'` must
     return zero.
   - If Fern finds a **sixth** occurrence of any conflict string that this SPEC did not
     table, that is a question in the TASK (`@Sober`), **not** a silent extra edit — the
     count is what SQ22 puts to Porter and it must stay true.
   - `layout.tsx`'s page *title* already interpolates `${SITE.role}`; it needs no edit when
     C5 moves. Its *description* hardcodes the words and does (SQ23).

## Non-functional

- **Privacy is a hard gate, not a nice-to-have.** Q41 (`ห้าม`) bars the two resume
  references and the home district from the profile file, the site, any knowledge base and
  any answer REQ-007 can produce.
- **AC-b's check, made runnable:** the team deliberately never transcribed the reference
  names, so it cannot grep for names it does not know. The checkable form is therefore:
  (i) `grep -i chatuchak` over `back/knowledge/` and `front/src/` returns **zero**; and
  (ii) **the only human names appearing anywhere in `PROFILE.md` are "Nichaphon Sayvav" and
  "Dong"** — every other capitalised name in the file must be a company, a product or a
  technology. Fern states the result of both checks in §Implementation Notes.
- No new dependency, no new route, no new component, no theme token. If any change would
  need one, it is a question for Sober before it is written.
- Verification commands are the ones this repo already uses: `cd front && npx tsc --noEmit`
  and `cd front && npm run build`.

## Tasks

- TASK-019: Apply the ten decided resume-fact corrections (depends on: —)
- TASK-020: Draft the profile source-of-truth pack + approval sheet (depends on: —)
- TASK-021: Place the approved profile, C5/C8 and the Class 1 additions (depends on: TASK-019, TASK-020, owner approval)

## Questions

**SQ22 (NEW 2026-09-09, for Porter — a correction to REQ-005 AC-c, not a request).**
AC-c states "C1 and C3 each carry TWO strings". Grep against the working tree says **C3 does;
C1 carries FIVE**: `about.ts:45`, `about.ts:156` (the two the REQ names) **plus**
`Home.config.ts` `HOME_LEAD` — **visible copy on the homepage** — and the `metadata.description`
in `layout.tsx` and `about/page.tsx`, both indexed by search engines. All five say "two weeks"
and all five contradict the resume, so R4 puts all five in scope and SPEC-005 fixes all five.
C2, C4 and C6 are one string each, confirmed. **Nothing is blocked** — this is Porter recording
the true count in REQ-005, which SA may not edit.

**SQ23 (NEW 2026-09-09, for Porter — rides with Q47, non-blocking).** C5 is described as one
field, `SITE.role`. It is one field, but the *current headline's words* are also hardcoded in
two `metadata.description` strings (`layout.tsx:38`, `about/page.tsx:7`). If the owner answers
Q47, those two must change with it or the new headline contradicts itself in Google's results
while the footer shows the new one. (`layout.tsx`'s page *title* interpolates `SITE.role` and
needs no edit.) No decision is asked for — only that Q47's answer is understood to move
**three** strings, not one.

**SQ24 (NEW 2026-09-09, for Porter — one scope question + one routing fact).**
*The scope question:* Q42 says add what fits, and R5 lists Education and Languages among the
candidates — but REQ-005 §Out of Scope bars re-designing any page, and Education and Languages
have **no rendered structure on the site at all**, so putting them on `/about` means a new
section, a new type and a new component. The REQ points both ways and SA will not settle it by
assumption. **SPEC-005's resolution, which needs no answer to proceed:** both facts go into
`PROFILE.md` (no UI, so the REQ-007 AI can still answer "what is his education?"), and the
site is left alone. **The open question for the owner is only:** does he also want an
Education / Languages block visible on `/about`? If yes it is a new small REQ, not this one.
*The routing fact:* R5 requires every added item to be listed in REQ-005 §Owner decisions.
Neither SA nor FE may edit a REQ file — **Porter must copy the approved add-list in** from
TASK-020's approval sheet, or R5 is left unmet by construction.

**SQ25 (NEW 2026-09-09, for Porter — the build half of Q48, answered by SA).** Q48 asks
whether the footer year should advance by itself and routes the build choice to Sober. Answer:
**no, keep it a constant.** The site is statically built and redeployed only when the human
chooses; a server-rendered `new Date().getFullYear()` freezes at **build** time, so it would go
stale exactly as today's `'2025'` did, but silently — nobody would think to check a number that
"updates itself". A client-side year avoids that at the cost of a hydration mismatch risk on
every page. A constant is honest: it is wrong visibly, and one character fixes it. **The value
stays the owner's** — Q48 is unchanged and still his.

**SQ26 (NEW 2026-09-09, for Porter — FYI, not a question).** The profile file is placed at
`back/knowledge/PROFILE.md` (D1). REQ-005 calls itself frontend-only; this writes two text
files into the empty `back/` folder the owner created in Q33, and creates **no backend code and
no dependency**. The reason is deployment: REQ-007's service is the file's only reader, and a
root-level `profile/` would make the human copy a second directory every time he deploys `back/`
(Q43). If he would rather it sat at the repo root, one `git mv` and one path constant reverse it.

**SQ27 (NEW 2026-09-09, for Porter — a fifth line on TASK-020's approval sheet, non-blocking).**
Applying C6 exactly as the owner decided it (Q40, `3+` → `4`) has left the site saying his
career length twice, with two different numbers: `/` now shows **"4 Years experience"** while
`/about`'s `<h1>` still reads **"Three years of shipping the thing nobody there had shipped
before"**. Verified by SA in the **built** HTML, so it is what would ship, not a source-only
artefact. It is **not** a missed C1 occurrence — an SA sweep for every year-count phrasing in
`front/src` returns that one line and nothing else, so **SQ22's count of five is unaffected**.
Fern found it, left it untouched and asked (FQ32); that was correct — it is visible copy in a
real person's name and the repair is a wording choice, not a replace.

**No new question goes to the owner and no new hop is created:** it becomes **C9** in this
SPEC's Group B and rides into the approval sheet TASK-020 is already drafting, so he settles
it alongside C5, C8 and the skill list. What Porter needs to know: **the sheet is now five
lines, not four**, and the fifth asks him to choose the `/about` headline. Two candidate
wordings are put to him, plus the one thing SA refuses to decide for him — whether "three
years" was ever meant as his career total at all, or as the length of one particular pattern
of work. Reverting the `4` is deliberately **not** offered as an option: it is his own Q40
decision, so the headline is the string that moves. If he does not answer, REQ-005 can still
be delivered — but it delivers with two different career numbers visible on the site, and
that is his call to make knowingly, not ours to make by default.

**SQ28 (NEW 2026-09-09, for Porter — the sheet grew again, from 5 lines to 6. Non-blocking,
nothing waits on an answer).**

Reviewing TASK-020 I checked Fern's own citation table by counting rather than reading: **22 of
its 66 rows cite a shipped site string and nothing else** — no resume line, no recorded owner
decision. The draft flagged 5 of them and its prose called it six. The 16 that were not flagged
include the two a stranger is most likely to take as fact:

- **the four certificates**, each with an issuer and a year — the resume names **no** certificate
  at all, and REQ-005 R2 names "a certificate" as exactly the kind of claim that needs a source;
- **the GFAI narrative** — "GFAI had no product of its own and resold third-party hardware" is a
  claim about a **named third-party company's business**, published in his name.

None of this is invented and none of it is a defect in his site: every one of the 22 is copy he
has already shipped. **They are all kept** — deleting his own website's claims out of the file
his AI answers from would be the team editing his life. What changes is only that he gets to
*see* them: sheet line 1 asks him to confirm every line of the profile is correct, and he cannot
answer that honestly while the unbacked lines are indistinguishable from the resume-backed ones.

**So the sheet is now SIX lines, not five.** Line 6 names the categories in plain language —
the two performance awards, "promoted to Senior faster than anyone in company history", the
freelance work being "ongoing", the four certificates by name, what GFAI's business was before
the kiosk, and several technology / ways-of-working lists — and asks one thing: keep them all,
or name the ones to take out. **No new hop, no new question of yours, no answer needed from you**
— you deliver the sheet as written once TASK-020's rework lands. Line 2 also grew a sub-clause
(the FQ34 / Class 1b option, D3 amended) but is still one line.

Two related answers of mine, recorded in §Decisions so they are not rediscovered: **D5** — the
eleven `projects.ts` entries stay out of `PROFILE.md` and become REQ-007's second knowledge file
(costs him no approval line here); **D3 amended** — Class 1 is not widened into a licence to
edit shipped copy; exactly one named string may move, and only on his word.

**SQ29 (NEW 2026-09-09, for Porter — one clause to add when you deliver sheet line 1. Nothing
waits on you, and the sheet is still SIX lines).** Fixing one unsourced inference exposed its
mirror image, and Fern raised it rather than quietly patching it (his FQ36).

The struck clause used to say the resume's CRM-connected AI assistant (Text-to-SQL, schema
routing) and the site's AI-powered RAG chatbot in the CRM Sales app were **the same work**. No
allowed source says that, so it is gone. But the two claims now sit as **two adjacent bullets
under ICM, each describing a CRM AI build of about four months** — so a reader, and more to the
point the REQ-007 LLM, may just as wrongly infer **two separate** four-month projects. No source
states that either.

**SA's decision: the body does not change.** Every repair asserts *same* or *different*, and
both are unsourced; two bullets in a list assert nothing on their own, which is the only shape
that stays inside REQ-005 R2. The pack was **not** sent back a third time for this.

**What we ask of you is one clause, not a seventh line.** Sheet line 1 already shows him both
bullets and asks whether every line is correct. When you put line 1 into Thai, **name the spot**:
two bullets under ICM each describe a four-month CRM AI build — is that one project or two? A
doubled achievement is the most noticeable error a man can find in his own record, so one word
from him settles it. **If he says nothing, nothing breaks**: the bullets ship as drafted and
TASK-021's notes record that the relationship is unstated.

**Why this is in the SPEC and not only in the task.** Under **D5** the eleven `projects.ts`
entries become REQ-007's second knowledge file — and one of them **is** the CRM RAG chatbot,
this very bullet. When I spec REQ-007 I must know the relationship is *unstated* rather than
let the AI join the two on its own; the same fact would otherwise have to be rediscovered from a
closed task's §Questions. TASK-021 carries the matching conditional **step 9**.
