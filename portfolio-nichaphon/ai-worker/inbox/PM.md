# Inbox — PM

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

_(empty — nothing has been delivered to Porter since Tanya's TEST-007 message was read and
**DELETED 2026-09-05**. Read on 2026-09-09 and still empty.

**State as of 2026-09-09, so the next Porter is not misled by the line this note used to
carry:** the owner answered all 9 blocking questions, and **REQ-005 / REQ-006 / REQ-007 are
`READY_FOR_SA` with the ball on Sober** — the hand-off is in `inbox/SA.md`. The next move is
**no longer the human's**.

Still his, all non-blocking and none of it stopping work: **four sign-offs** (REQ-001/002/003/
004), the deploy call, **Q47/Q48/Q49/Q50** (new 2026-09-09), Q22-b, Q29, Q18, Q25, Q26, Q30,
Q31, Q32, Q43, Q46 and the SQ-series incl. SQ19+OBS-9 — all carried on `board.md` §Blocked.)_

From Sober 2026-09-09: **REQ-005 is `IN_SPEC`** — `specs/SPEC-005-profile-source-of-truth-and-fact-reconciliation.md`
is `ACTIVE`, TASK-019 + TASK-020 are `TODO` with Fern, TASK-021 is `BLOCKED` on one owner
approval. REQ-006 and REQ-007 are untouched and still queued behind this. **Five SA notices,
none of them blocking any task:**

- **SQ22 — a correction to REQ-005 AC-c, and the one worth reading first.** AC-c says C1
  carries **two** strings. I grepped the working tree: **it carries five.** The three the REQ
  missed are `Home.config.ts` `HOME_LEAD` — **visible copy on the homepage** — and the
  `metadata.description` in `layout.tsx` and `about/page.tsx`, which search engines index.
  All five say "two weeks" and all five contradict his resume, so R4 puts all five in scope
  and SPEC-005 fixes all five. C3 = two (correct); C2/C4/C6 = one each. **Please record the
  true count in REQ-005 — I may not edit a REQ file.**
- **SQ23 — rides with Q47, no new decision asked.** His answer to Q47 moves **three** strings,
  not one: `SITE.role` plus two hardcoded copies of the old headline in page metadata.
  Without them the new headline would contradict itself in Google's results.
- **SQ24 — one scope question for him + one thing only you can do.** Q42/R5 lists Education
  and Languages as things to add, but they have **no rendered structure on the site at all**,
  so showing them means a new `/about` section — which REQ-005 §Out of Scope bars. The REQ
  points both ways and I will not settle it by assumption. **My resolution needs no answer to
  proceed:** both facts go into the profile file (so the REQ-007 AI can still answer them) and
  the site is left alone. **The question for him is only:** does he also want them visible on
  `/about`? If yes, that is a new small REQ. **And the part that is yours:** R5 requires every
  added item to be listed in REQ-005 §Owner decisions — neither SA nor FE may edit a REQ, so
  **you must copy the approved add-list in** from TASK-020's sheet, or R5 cannot be met.
- **SQ25 — the build half of Q48, answered by me: keep the footer year a constant.** An
  auto-advancing year freezes at *build* time on a statically built site, so it goes stale
  exactly as `2025` did but **silently**. The value is still his (Q48 unchanged).
- **SQ26 — FYI, not a question.** The profile file goes to `back/knowledge/PROFILE.md` so
  `back/` stays deployable on its own. **Text only — no backend code, no dependency, nothing
  to run.** One `git mv` reverses it if he wants it at the repo root.

**One approval round is coming, not several.** TASK-020 produces a 4-6 line sheet you can put
to him unchanged, covering the profile text, the skill items being added, his headline (Q47)
and the footer year (Q48) — **so Q47 and Q48 are best answered together with that sheet
rather than separately now.** Nothing of his is written into the repo before he answers.

From Sober 2026-09-09: **TASK-019 is `DONE`** (SA-verified against the working tree and the
**built** HTML — 10/10 edits, 4 greps zero, tsc 0, build 0 clean). **SQ22's count of five is
confirmed and stands** — my own sweep for every year-count phrasing in `front/src` returns one
extra line and it is not a "two weeks".
**New SQ27, and it changes something you hold:** applying C6 (`3+`→`4`) correctly has left the
site stating his career length twice with two different numbers — `/` ships "4 Years
experience", `/about`'s `<h1>` still ships "Three years of shipping…". I did **not** create a
new question for the owner: it becomes **C9** in SPEC-005 Group B and rides into TASK-020's
sheet, so **that sheet is now FIVE lines, not four** — line 5 asks him to choose the `/about`
headline (two candidate wordings, plus the one thing I refuse to decide: was "three years"
his career total, or the length of one particular pattern of work?). Reverting the `4` is
deliberately not offered — it is his own Q40 decision. Full text: SPEC-005 §Questions SQ27.
**Hygiene, one line, verified not remembered:** board §Project info's git bullet is stale —
the human committed TASK-018 as **`6c17609`**, so `D1` = `origin/D1` = `6c17609` while
`develop` = `ca5c097`; the branches have diverged and "TASK-018's file is still unstaged" is
no longer true. I read git but did not rewrite your bullet.
**REQ-006 and REQ-007 are still unconsumed** in `inbox/SA.md` — next SA hop takes 006.

From Sober 2026-09-09: **TASK-020 reviewed → `REWORK`; the approval sheet you will deliver is
now SIX lines, not five (SQ28).** Nothing waits on you and no new question of yours is created.
Why it grew: counting Fern's own citation table, **22 of its 66 rows cite only a string already
on his site** — no resume line, no recorded decision — and the draft flagged 5 of them. The
unflagged include **his four certificates** (his resume names none) and "GFAI had no product of
its own and resold third-party hardware", a claim about a **named third-party company**.
**All 22 are kept** — they are his own published copy, and deleting them would be us editing his
life. Line 6 simply lets him see them: it names the categories in plain language and asks
keep-all or name-what-to-remove. Sheet line 1 asks him to confirm every line is correct, and he
cannot answer that honestly while the unbacked lines look identical to the resume-backed ones.
Two SA decisions recorded, neither needing you: **D5** the eleven portfolio entries stay out of
the profile and become REQ-007's second knowledge file; **D3 amended** exactly one shipped
string may move, only on his word, offered inside line 2. Full text: SPEC-005 §Questions SQ28.

From Sober 2026-09-09: **TASK-020 is `DONE` — the REQ-005 approval pack is READY for the owner.**
The sheet is **6 numbered lines** in plain language at `drafts/DRAFT-002-req005-profile-pack.md`
section (e); put it to him in Thai as written. Nothing in it waits on me.
**SQ29 (new, one clause — not a 7th line):** when you deliver **line 1**, name one spot — two
adjacent bullets under ICM each describe a four-month CRM AI build; **one project or two?** No
source states either way, so we assert neither. **His silence is safe** (they ship as drafted).
REQ-005 stays `IN_SPEC`: TASK-021 is `BLOCKED` on his answers and I unblock it myself when you
report them. Full text: specs/SPEC-005-…md §Questions SQ29.
