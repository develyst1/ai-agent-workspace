# REQ-005: Profile source-of-truth (MD) + reconcile the site's facts with the 2026 resume
- Status: **DELIVERED 2026-09-13, Porter — 5 of 5 AC ticked.** AC-a/b/c/e on the 2026-09-13 acceptance pass
  (§Acceptance pass); **AC-d ticked on TEST-008 `TEST_PASSED` (Tanya, 24/24, 0 defects) — the strings SEEN on
  `/` + `/about` at 1280 and 360, both meta descriptions byte-equal to C5.a / C5.b** — see §Delivery. Not signed
  off, not deployed. His sheet answers: §Approval record; the add-list, C5/C8/C9, SQ29: §Owner decisions
  (2026-09-13 block). Q47 / Q48 / Q51 CLOSED by his words.
- Priority: HIGH
- Requested: 2026-09-09 by the owner (Nichaphon)
- Deadline: none stated

## Problem / Goal

The owner sent his **newest resume** (2026-09-06) and asked, in his words:

> "นี่คือ resume ล่าสุดของฉัน นำไปทำข้อมูลเกี่ยวกับฉันเป็น MD แล้ว นำไปแก้ไข
> รายละเอียดใน frontend ในส่วนที่จำเป็นต้องแก้"

Two outcomes, for two different audiences:

1. **A single machine-readable profile in Markdown** — one file that states who he is and
   what he has built. It exists because REQ-007 (the "ask AI about me" feature) needs an
   answer source that cannot be argued with: if a fact is not in that file, the AI does not
   say it.
2. **The live site's facts stop disagreeing with his resume.** The site copy predates this
   resume. Where the two say different things about the same real event, a visitor (or a
   recruiter holding the PDF) sees a contradiction.

## Source material (already in the workspace — no DATA REQUEST needed for these)

- `../project-docs/resume-2026-09-06/NICHAPHON-SAYVAV.pdf` + `.png` — the owner's files,
  copied in on 2026-09-09.
- `../project-docs/resume-2026-09-06-transcript.md` — Porter's faithful transcript of the
  PNG. **This transcript is the only quotable form of the resume for the team.**

## Requirement

1. The system must carry **one profile file in Markdown**, generated from the transcript
   above plus copy that is *already live on the site*, and nothing else.
2. That file must be **fact-only and attributed**: every claim in it is traceable to one of
   **three** sources — the resume transcript, an already-shipped site string, or **the owner's
   own written decision recorded in this REQ** (the third source was added 2026-09-09: his
   "4 years" in Q40 exists in no other place). **No role adds a metric, a date, a client name,
   a testimonial or a certificate that is not in one of those three places.**
3. The file must **exclude, permanently**: the two resume references (names, employers,
   phone numbers) and any third-party personal data. See Q41.
4. The site's own copy must be corrected **only where it contradicts the resume**, per the
   owner's decisions in the conflict table below. Copy that merely says *more* than the
   resume (e.g. the CRM chatbot's detail on `/portfolio`) is **not** a contradiction and is
   left alone.
5. Facts the resume carries that the site does not show at all (Education, Languages, the
   Kimi/DeepSeek/xAI providers, Text-to-SQL, MQTT, nginx/pm2, Go Gin, SQLite) **may now be
   added** — Q42 ANSWERED 2026-09-09: *"ถ้าอะไรเหมาะสม และดูดี ก็เพิ่ม"* ("if something fits and
   looks good, add it"). The judgement of *fits and looks good* is delegated to the team, but
   the **fact** is not: every added item must still be traceable per R2, and **every item
   actually added must be listed in §Owner decisions here** so he can see at sign-off exactly
   what appeared on his site in his name.

## The conflict table (found 2026-09-09 by reading the resume against the shipped code)

| # | Subject | Site says today | Resume says | Where the site string lives |
|---|---|---|---|---|
| C1 | GFAI kiosk build time | "In **two weeks** I delivered a working prototype" | "Shipped a reception kiosk in **about three weeks**" | `front/src/constant/content/about.ts` → `EXPERIENCE.gfai`; also `VALUES.execution` ("a robotic kiosk prototype in two weeks") |
| C2 | GFAI job title | "AI and Developer" | "AI & Robotics Developer" | same file, `EXPERIENCE.gfai.role` |
| C3 | ICM company name | "ICM Smart Solution**s** Co., Ltd." | "ICM SMART SOLUTION CO., LTD." (singular) | same file, `EXPERIENCE.icm.organisation`; also `CERTIFICATES.employee-survival.issuer` |
| C4 | ICM job title | "Senior Software Engineer" | "Senior / **Staff** Software Engineer" | same file, `EXPERIENCE.icm.role` |
| C5 | Own headline role | "Senior / AI Software Engineer" | "AI Engineer" + "Senior Software Engineer" (two lines) | `front/src/constant/site.ts` → `SITE.role` |
| C6 | Years of experience | `CAREER_STATS` shows "**3+** Years experience" | resume states no total; ICM alone is 2022–2026 | `front/src/constant/content/about.ts` → `CAREER_STATS` |
| C7 | Location | "Bangkok, Thailand" | "Chatuchak, Bangkok" | `front/src/constant/site.ts` → `SITE.location` |
| C8 | Footer copyright year | "2025" | — (not a resume fact; noticed while reading) | `front/src/constant/site.ts` → `SITE.copyrightYear` |

**None of these eight is a defect and none is a team decision.** They are statements about
the owner's own life; only he can say which version is true. C1 and C6 are the two that a
recruiter can actually catch, because he is holding the other version on paper.

## Owner decisions — 2026-09-09 (his words, then what they resolve)

**Q40 — ANSWERED, verbatim:** *"resume base ฉันว่านายเข้าใจผิด 3y+ นั่นคือทั้งหมด ตอนนี้เป็น
4 ปีแล้ว ส่วน GFAI ฉันทำแค่สามสัปดาห์ ตามresume"*
Three things, in his order: **(1) the resume is the base** for every conflict; **(2) Porter
misread C6** — "3+ years" was never about one employer, it was always his **career total**,
and that total **is now 4 years**; **(3) GFAI was three weeks**, as the resume says.

**Q41 — ANSWERED:** *"ห้าม"* — forbidden. Porter's written default is confirmed and hardened.

**Q42 — ANSWERED:** *"ถ้าอะไรเหมาะสม และดูดี ก็เพิ่ม"* — see R5 above.

### The conflict table, resolved

| # | Resolution (his rule: resume is the base) | Note |
|---|---|---|
| C1 | GFAI kiosk becomes **"about three weeks"** — his own words, twice over | Two strings, not one: `EXPERIENCE.gfai` **and** `VALUES.execution` ("a robotic kiosk prototype in two weeks"). Missing the second leaves the contradiction alive on the same page. |
| C2 | GFAI role becomes **"AI & Robotics Developer"** | resume base |
| C3 | ICM name becomes **singular** — "Solution", not "Solutions" | Two strings: `EXPERIENCE.icm.organisation` **and** `CERTIFICATES.employee-survival.issuer`. **Casing is not a fact:** the resume prints it all-caps, the site is title case; the site keeps title case → **"ICM Smart Solution Co., Ltd."** Flagged for his eye at sign-off — if he wants the legal all-caps form, one word changes it. |
| C4 | ICM role becomes **"Senior / Staff Software Engineer"** | resume base |
| C5 | **NOT resolved by the rule** — the resume has *two* title lines, `SITE.role` is *one* field. See **Q47**. | non-blocking |
| C6 | `CAREER_STATS` becomes **4 years** — his statement, dated 2026-09-09 | This number lives in **no** other source. Under R2 it is now traceable to this line and nowhere else; if it is ever questioned, this is the citation. |
| C7 | **Site keeps "Bangkok, Thailand".** Q41 (`ห้าม`) **overrides the resume-base rule here** — "Chatuchak" is not added to the site *and not written into the profile file either*, because the AI answers out of that file. | privacy beats the base rule |
| C8 | **NOT resolved** — the footer year is not a resume fact, so "resume base" says nothing about it. See **Q48**. | non-blocking |

### What Q41 (`ห้าม`) bars, in full

The two references (names, employers, phone numbers) and his home district are barred from
**all four** of: the profile Markdown file · any site copy · any AI knowledge base · any
answer the REQ-007 feature is capable of producing. This is now a hard constraint, not a
default. **Unchanged by it:** `SITE.phone` and `SITE.email` are already public on the live
site today and no role touches them — see Q41's note below.

### Owner decisions — 2026-09-13 (the TASK-020 approval sheet; his words in §Approval record)

Everything below is **his word as of 2026-09-13**, not a team default any more. Exact strings are
in `../drafts/DRAFT-002-req005-profile-pack.md` §(a)–(d); this list is what R5 requires — every
item that appears on his site in his name, plus the profile-file decisions.

- **Profile text (sheet line 1): approved as drafted** — `PROFILE.md` body per DRAFT-002 §(a) and
  `PROFILE.citations.md` per §(b), no line changed.
- **SQ29 clause (on line 1): the two adjacent ICM four-month CRM AI bullets are TWO SEPARATE
  projects** (`ก+ข คนละโปรเจกต์` — "ก and ข are different projects"): the resume's Text-to-SQL
  assistant and the site's RAG chatbot are different work. The bullets ship as two bullets and
  nothing is merged. **The relationship is now STATED by him, not unstated** — TASK-021 step 9's
  "change nothing" branch applies, but its note should cite this line rather than say "unstated";
  REQ-007's knowledge may treat them as two projects on his word.
- **R5 add-list (sheet line 2): OPTION 1 — all nine added, nothing already shipped is edited.**
  `DeepSeek`, `Kimi`, `xAI`, `Text-to-SQL / schema grounding`, `MQTT` → group `ai` ·
  `Go Gin` → `backend` · `SQLite` → `databases` · `nginx`, `pm2` → `devops`.
  `Generative AI (Gemini, OpenAI)` stays exactly as it is. Casing `nginx` / `pm2` as the resume
  prints them (he was shown the casing note and did not ask otherwise).
- **C5 (sheet line 3 / Q47): `SITE.role` = "AI Engineer / Senior Software Engineer"** — `ตามนั้น`
  ("as proposed"), so the written default is now his word. Moves THREE strings (SQ23): `SITE.role`
  plus the two `metadata.description` sentences C5.a / C5.b exactly as DRAFT-002 §(d) prints them.
- **C8 (sheet line 4 / Q48): `SITE.copyrightYear` = "2026"**, a plain constant (no auto-year, SQ25).
- **C9 (sheet line 5): candidate A — `ABOUT_INTRO.title` = "Four years of shipping the thing nobody
  there had shipped before".** The line's second half (was "three years" his career total or one
  pattern of work?) was **not answered in words**. A is the wording that ships either way, so nothing
  waits on it — recorded as unanswered, **not inferred** from his pick.
- **The 22 site-only claims (sheet line 6): KEEP ALL** (`เก็บทั้งหมด`) — nothing comes out of the
  profile; TASK-021 step 8's "if he said keep, keep all" branch applies.
- **Q51: Education and Languages are NOT shown on `/about`** (`ไม่แสดง`) — profile-only, site
  untouched. The written default is now his word; no new REQ.

## Acceptance Criteria

- [x] AC-a: One profile Markdown file exists in the repo, and **every** line in it is
      traceable to the resume transcript, a live site string, or an owner decision recorded
      in §Owner decisions (spot-checkable).
- [x] AC-b: The file contains **no** reference name, no third-party phone number, **no
      "Chatuchak"**, and nothing the owner did not write or approve.
- [x] AC-c: Each conflict C1–C8 is either changed to the owner's answer or explicitly left
      as-is on his word — with the decision recorded in this REQ, not only in code.
      **C3 carries TWO strings; C1 carries FIVE** — the two the table names plus
      `Home.config.ts` `HOME_LEAD` (visible Home copy) and the `metadata.description` in
      `layout.tsx` and `about/page.tsx` (indexed by search engines). *Count corrected
      2026-09-13 by Porter on SA's SQ22 grep; TASK-019 already moved all five.* All must move.
- [x] AC-d: After the change the site builds clean and the corrected strings are **seen**
      on the rendered pages (QA round, pictures), not merely present in the source.
- [x] AC-e: No fact appears on the site that is absent from both the resume and the
      previously approved copy.

## Constraints

- Owner-stated: the profile is **Markdown**.
- `PROTOCOL.md` standing rule: site content is real copy about a real person — no invented
  client name, testimonial, certificate, date or metric.
- Frontend-only. This REQ does not need the backend of REQ-006 to land first, but REQ-007
  cannot start before AC-a and AC-b here are met.

## Out of Scope

- Anything about the AI feature itself (REQ-006, REQ-007).
- Re-designing any page. This is a factual correction pass, not a visual one.
- The seven certificate/portfolio images sitting beside the resume in the owner's Downloads
  folder — they were not part of this request.

## Questions

**~~Q40~~ ANSWERED 2026-09-09** — resume is the base; "3+ years" was the career total and is
now **4 years**; GFAI is **three weeks**. Full text + the resolved table in §Owner decisions.

**~~Q41~~ ANSWERED 2026-09-09 — `ห้าม`.** The default is confirmed and is now a hard
constraint (see §Owner decisions). **One line back to him, non-blocking:** his answer is read
as *forbidding the publication of the third-party references and of his home district*. It is
**not** read as an instruction to remove `SITE.phone` / `SITE.email`, which are already public
on the live site and which nobody proposed changing. If he did mean those should come off the
site, one word does it — but the team will not remove a working contact route on an inference.

**~~Q42~~ ANSWERED 2026-09-09** — *"if something fits and looks good, add it."* Recorded in R5:
the team may add Education, Languages and the new AI vocabulary; every added item is still
traceable, and every item added is listed in §Owner decisions for his sign-off.

**~~Q47~~ ANSWERED 2026-09-13 — `ตามนั้น` (as proposed): "AI Engineer / Senior Software Engineer",
three strings move — see §Owner decisions 2026-09-13 block.** Original text kept below.
**Q47 (2026-09-09) — C5, one field for two resume lines.** The resume's
header is two lines — **AI ENGINEER** / **SENIOR SOFTWARE ENGINEER** — while the site has one
`SITE.role` string, today "Senior / AI Software Engineer". "Resume base" settles the *words*
but not the *shape*, and joining two lines is a presentation choice, so Porter is not calling
it a fact. **Written default if he says nothing: "AI Engineer / Senior Software Engineer"** —
both resume lines, in the resume's order, joined with the separator the site already uses.
Non-blocking: it is one constant and can change after the build.

**~~Q48~~ ANSWERED 2026-09-13 — `2026`, a plain constant.** Original text kept below.
**Q48 (2026-09-09) — C8, the footer year.** `SITE.copyrightYear` still says
**2025**; today is 2026-09-09. This is not a resume fact, so his "resume base" rule does not
reach it. **Written default: 2026.** He may also want it to advance by itself each year rather
than be a number someone must remember — that is a build choice and would go to Sober.

**~~Q51~~ ANSWERED 2026-09-13 — `ไม่แสดง` (don't show): profile-only, `/about` untouched; the
default is now his word.** Original text kept below.
**Q51 (2026-09-13, from SA's SQ24) — Education and Languages on `/about`?**
Both facts go into the profile file (so the REQ-007 AI can answer them). The site has **no**
rendered section for either, so showing them on `/about` would be a new block that §Out of
Scope bars. **Written default if he says nothing: profile-only, site untouched.** If he wants
them visible on `/about`, that is a new small REQ, not a change to this one.

## Approval record — the TASK-020 sheet (R5 / AC-c gate)

**Put to the owner 2026-09-13 by Porter, in Thai, with the actual proposed strings** — six
lines from `../drafts/DRAFT-002-req005-profile-pack.md` §(e) plus SA's SQ29 clause on line 1
(the two adjacent ICM four-month CRM bullets: one project or two?). Defaults he can simply
tick: line 2 option 1 (nothing shipped is edited) · line 3 Q47's default · line 4 Q48's
default · line 6 keep all 22. **No default** on line 1 (his facts), line 5 (C9: A, B, or his
own words, plus career-total-or-one-pattern) or the SQ29 clause (silence = ship as drafted).

**His answers — 2026-09-13, verbatim, one line:**
*"1=ถูกทั้งหมด ก+ข คนละโปรเจกต์, 2=option 1, 3=ตามนั้น, 4=2026, 5=A, 6=เก็บทั้งหมด, Q51=ไม่แสดง, Q49=30"*
(Q49 is REQ-006/007's budget question and is recorded in REQ-007 §Owner decisions, not here.)

| Sheet line | His word | Resolved value |
|---|---|---|
| 1 — profile text | `ถูกทั้งหมด` (all correct) | `PROFILE.md` + `PROFILE.citations.md` ship as drafted (DRAFT-002 §(a)/(b)), no line changed |
| 1 — SQ29 clause | `ก+ข คนละโปรเจกต์` (ก and ข are different projects) | the two ICM four-month CRM AI bullets = **two separate projects**; two bullets stay, no merge; relationship now STATED by him |
| 2 — nine skill items + Class 1b | `option 1` | all nine added; `Generative AI (Gemini, OpenAI)` untouched (six-item option 2 rejected) |
| 3 — headline / C5 / Q47 | `ตามนั้น` (as proposed) | `SITE.role` = "AI Engineer / Senior Software Engineer" + C5.a + C5.b (three strings) |
| 4 — footer year / C8 / Q48 | `2026` | `SITE.copyrightYear` = "2026", plain constant |
| 5 — `/about` `<h1>` / C9 | `A` | "Four years of shipping the thing nobody there had shipped before"; the career-total-or-one-pattern half **not answered** — nothing depends on it |
| 6 — the 22 site-only claims | `เก็บทั้งหมด` (keep all) | all 22 stay in the profile |
| Q51 (rode along) | `ไม่แสดง` (don't show) | Education / Languages profile-only; `/about` untouched |

Recorded by Porter 2026-09-13. The add-list and C5 / C8 / C9 / SQ29 are copied into §Owner
decisions (2026-09-13 block) per R5. Sober told via `inbox/SA.md`: TASK-021's owner-side gate is
lifted — every conditional step (7 Class 1b, 8 line 6, 9 SQ29) now has his answer; moving the
BLOCKED status is his.

## Acceptance pass — Porter (PM), 2026-09-13

**REQ-005 stays `SPEC_DONE`. 4 of the 5 acceptance criteria are ticked (AC-a, AC-b, AC-c, AC-e); AC-d is
held for exactly the reason its own words give: the corrected strings must be *seen* on rendered pages by
QA, and so far only the implementer and the reviewer have looked.** Nothing here is a complaint about the
work — Sober re-ran every DoD line of TASK-021 himself (diff-empty vs the approved draft, greps, build,
strings found in the *built* HTML) rather than agreeing with Fern.

### The four that closed

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-a | Porter 2026-09-13 | `back/knowledge/PROFILE.md` exists (my own `ls` 2026-09-13: `PROFILE.md`, `PROFILE.citations.md`, `PROJECTS.md`). Traceability is by construction: the file is `diff`-empty against DRAFT-002 §(a) (Sober, TASK-021 §Review), whose 66-row citation table Sober scanned independently at TASK-020 (22 site-only rows flagged, 0 mismatch), and the owner answered sheet line 1 `ถูกทั้งหมด` + line 6 `เก็บทั้งหมด` (§Approval record) — every line is now resume, live site copy, or his word |
| AC-b | Porter 2026-09-13 | My own read-only grep 2026-09-13: `chatuchak` = **0** in all three knowledge files and 0 under `front/src`. Sober read the whole `PROFILE.md`: the only human names are Nichaphon Sayvav and "Dong" (his own nickname — line 6 `Goes by: Dong`); every other capitalised pair is a company, product, school or place. The two references were never transcribed (Porter withheld them 2026-09-09), so a file derived from the transcript cannot carry them |
| AC-c | Porter 2026-09-13 | C1 ×5 / C2 / C3 ×2 / C4 / C6 landed in TASK-019 (10/10 re-verified by Sober); C5 ×3 / C8 / C9 landed in TASK-021 on his 2026-09-13 words; C7 left as-is on Q41. My own read of the source 2026-09-13: `about.ts` carries "about three weeks" ×2, `AI & Robotics Developer`, `ICM Smart Solution Co., Ltd.` + issuer `ICM Smart Solution`, `Senior / Staff Software Engineer`, years `'4'`; `HOME_LEAD` "about three weeks"; `site.ts` `role: 'AI Engineer / Senior Software Engineer'`, `copyrightYear: '2026'`. Every decision is recorded in this REQ (§Owner decisions + §Approval record), not only in code |
| AC-e | Porter 2026-09-13 | The only *new* facts on the site are the nine skill chips — each a resume item (R5 / Q42, his `option 1` on sheet line 2) — and C5/C8/C9, each his word on the sheet. Sober verified the nine strings + groups against DRAFT-002 §(c) and C5.a/C5.b/C9 character-for-character (TASK-021 §Review). Education / Languages stay profile-only (Q51 `ไม่แสดง`) |

### The one that is open — AC-d

The build is clean (Sober: `npm run build` exit 0, 10/10 pages, no warning) and the strings are in the shipped
bytes — but the AC says **seen on the rendered pages (QA round, pictures)**, and it is not my place to tick a
word the REQ chose deliberately. Fern's own pixel capture came back blank (he said so); Sober read the DOM. An
independent eye has not looked. **This is TEST-008's REQ-005 half** (below).

### What is being asked of QA — TEST-008, the REQ-005 half (zero cost)

Requested from Tanya via `inbox/QA.md`. **Everything here is a picture of the built surface; no real gateway
call is involved and `back/` need not run for this half.** The strings, exactly as they must read:

1. **`/` (Home)** at 1280 and 360: header + footer role line **"AI Engineer / Senior Software Engineer"**;
   the footer year **"© 2026"** (Sober's note: the HTML carries `© <!-- -->2026` — one "© 2026" is what must
   be seen); the Home lead containing **"in about three weeks"**.
2. **`/about`** at 1280 and 360: the `<h1>` **"Four years of shipping the thing nobody there had shipped
   before"**; the stat **"4" / "Years experience"**; GFAI role **"AI & Robotics Developer"** and its paragraph
   **"In about three weeks I delivered…"**; ICM **"Senior / Staff Software Engineer"** at **"ICM Smart Solution
   Co., Ltd."**; the certificate issuer **"ICM Smart Solution"**; the values line **"a robotic kiosk prototype in
   about three weeks"**; and the **nine new skill chips** — `DeepSeek`, `Kimi`, `xAI`, `Text-to-SQL / schema
   grounding`, `MQTT` (AI group) · `Go Gin` (backend) · `SQLite` (databases) · `nginx`, `pm2` (devops) — with
   `Generative AI (Gemini, OpenAI)` still present unchanged.
3. **Absence, on both routes:** no "two weeks", no "Three years", no "Solutions" (plural), no "2025" in the
   footer, no "Chatuchak" anywhere in the rendered text.
4. **The two `<meta name="description">` strings** for `/` and `/about`, read off the built HTML and quoted
   in the TEST file (indexed copy; C5.a / C5.b per DRAFT-002 §(d) — Tanya quotes, I adjudicate).
5. Name the surface (build id, `next start` vs standalone) and the counts: console errors / pageerrors /
   failed requests on both routes.

**Not asked:** no re-derivation of `PROFILE.md` against the draft (diff-empty, Sober), no judgement of the
look, no REGRESSION re-run beyond what the two routes show anyway. **Her file, her edit:** any
`tests/REGRESSION.md` row that quotes an old string goes stale the day this ships.

### What `SPEC_DONE` means right now
Not `DELIVERED`, not signed off, not deployed. The five `front/` files and `back/` are uncommitted on `D1`
(`1dcc9b8`); git stays the owner's. C3's title-case form and the unanswered half of C9 go to him at sign-off.

## Delivery — Porter (PM), 2026-09-13

**REQ-005 is `DELIVERED`: 5 / 5.** AC-a / b / c / e closed in §Acceptance pass above; **AC-d closed on
TEST-008** (`tests/TEST-008-req005-strings-and-req007-stub-pictures.md`, Tanya, `TEST_PASSED` 24/24 — the
REQ-005 half is A1–A16: 15/15 PASS + the two meta strings QUOTED).

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-d | Porter 2026-09-13, on TEST-008 | Build clean (Sober, TASK-021) and the strings **seen** by an independent eye on the *served* production build (`BUILD_ID Twf3FOdhYYaVXTKRSnGEp`, standalone on 3072): role line, `© 2026`, "in about three weeks", the `/about` `<h1>`, GFAI / ICM roles and org, the issuer, the values line, all nine chips — each located in the DOM, photographed at 1280 and 360 (`../project-docs/qa-test008-2026-09-13/`). Absence list clean: `two weeks` 0 · `Three years` 0 · `Solutions` 0 · `Chatuchak` 0; `2025` 0 in the footer. **The two `<meta name="description">` strings Tanya quoted (A15) are byte-equal to DRAFT-002 §(d) C5.a / C5.b** — my own string compare 2026-09-13 — so the indexed copy carries his approved wording, not only the visible copy. Counts: console errors 0 · pageerrors 0 · failed requests 0 · non-local requests 0 over the four loads |

**Corrections to my own brief, recorded so the next reader does not chase them:** the stat `4 / Years experience`
renders on `/` (Home stats band), not on `/about` where I listed it — Tanya photographed it where it is; and at 360
the header hides its role line by pre-existing CSS (`2ef36ec`, before REQ-005), so "header + footer" at 360 is
"hero + footer" (OBS-11). Neither is a defect; both are my brief's imprecision, not the build's.

**Carried to the owner at sign-off (not defects, his eye):**
- **OBS-12** — `/about` shows `2025` four times as certificate-year captions (pre-existing content, not C8), and
  the Employee Survival certificate **image** itself prints `ICM Smart Solutions Co.,Ltd.` (plural, inside the PNG
  artwork). C3 named *strings*; a picture is not a string. Whether the artwork stays is his — nobody edits his
  certificate image without his word.
- **Q52 (was TEST-008 QQ14 / OBS-13)** — at 360×740 the hero quote's line box now ends at 740.41 on a 740 fold (was
  49 px spare): legible, nothing cut, zero margin. Spent by **this REQ's** longer role + lead (C1 / C2, his words),
  not by REQ-007. Keep as is, or restore margin (a copy or layout decision — his, then Sober)? Non-blocking.
- C3's title-case form and the unanswered half of C9 (§Owner decisions) — as before.

**What DELIVERED means right now:** not signed off, not deployed. `back/knowledge/PROFILE*.md` and the `front/`
files are uncommitted on `D1` (`1dcc9b8`); git stays the owner's.
