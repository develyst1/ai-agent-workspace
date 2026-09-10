# REQ-005: Profile source-of-truth (MD) + reconcile the site's facts with the 2026 resume
- Status: **READY_FOR_SA** — unblocked 2026-09-09 by the owner's answers to Q40 / Q41 / Q42
  (recorded verbatim in §Owner decisions below). Two NON-blocking calls remain: Q47, Q48.
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

## Acceptance Criteria

- [ ] AC-a: One profile Markdown file exists in the repo, and **every** line in it is
      traceable to the resume transcript, a live site string, or an owner decision recorded
      in §Owner decisions (spot-checkable).
- [ ] AC-b: The file contains **no** reference name, no third-party phone number, **no
      "Chatuchak"**, and nothing the owner did not write or approve.
- [ ] AC-c: Each conflict C1–C8 is either changed to the owner's answer or explicitly left
      as-is on his word — with the decision recorded in this REQ, not only in code.
      **C1 and C3 each carry TWO strings** (see the resolved table); both must move.
- [ ] AC-d: After the change the site builds clean and the corrected strings are **seen**
      on the rendered pages (QA round, pictures), not merely present in the source.
- [ ] AC-e: No fact appears on the site that is absent from both the resume and the
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

**Q47 (NEW 2026-09-09, NON-blocking) — C5, one field for two resume lines.** The resume's
header is two lines — **AI ENGINEER** / **SENIOR SOFTWARE ENGINEER** — while the site has one
`SITE.role` string, today "Senior / AI Software Engineer". "Resume base" settles the *words*
but not the *shape*, and joining two lines is a presentation choice, so Porter is not calling
it a fact. **Written default if he says nothing: "AI Engineer / Senior Software Engineer"** —
both resume lines, in the resume's order, joined with the separator the site already uses.
Non-blocking: it is one constant and can change after the build.

**Q48 (NEW 2026-09-09, NON-blocking) — C8, the footer year.** `SITE.copyrightYear` still says
**2025**; today is 2026-09-09. This is not a resume fact, so his "resume base" rule does not
reach it. **Written default: 2026.** He may also want it to advance by itself each year rather
than be a number someone must remember — that is a build choice and would go to Sober.
