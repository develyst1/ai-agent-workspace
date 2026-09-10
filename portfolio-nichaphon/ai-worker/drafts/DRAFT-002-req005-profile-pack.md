# DRAFT-002: profile source-of-truth pack (REQ-005, awaiting his approval)
- Source: TASK-020 / SPEC-005 · Drafted 2026-09-09 by Fern · **NOT YET APPROVED, nothing written to the repo**

> **What this is.** The exact words proposed for two new text files and for **five** site
> strings — his headline plus the two search-result descriptions that hardcode it, the footer
> year, and the `/about` headline (a **sixth** moves only if he picks option 2 on sheet line 2)
> — put in front of the owner before any of them reach his site or his AI's mouth.
> Nothing here is live. No file under `front/`, `back/` or anywhere in the code repo was
> modified by this task — proof in TASK-020 §Implementation Notes.
>
> **Three allowed sources, and only these three:**
> - `[R:<section>]` — `../project-docs/resume-2026-09-06-transcript.md`
> - `[S:<file>:<key>]` — a string already shipping in `front/src/`
> - `[O:<question>]` — an owner decision recorded in `requirements/REQ-005-…md` §Owner decisions
>
> Every line of section (a) has a row in section (b). Where a source is silent, this pack
> says so instead of filling the gap.

---

## (a) Proposed `PROFILE.md` — the full body, final wording

> Destination once approved: `back/knowledge/PROFILE.md` (repo root `back/`, currently
> empty). Everything between the two rulers is the file. It carries **no citation marker,
> no footnote and no bracketed tag** — REQ-007 feeds this whole file to an LLM and any
> marker in it would be read back to a visitor as content.

---

# Nichaphon Sayvav

## Identity

- Name: Nichaphon Sayvav
- Goes by: Dong
- Titles: AI Engineer · Senior Software Engineer
- Location: Bangkok, Thailand
- Years of professional experience: 4
- Performance awards: 2
- Availability: Open to new opportunities

## Summary

Builds production AI systems: a thin multi-provider LLM gateway, schema-grounded
Text-to-SQL assistants on company data, and robotics kiosks. First in company to ship
Generative AI into a live CRM. Mentored 7+ developers.

## Experience

### AI & Robotics Developer — GFAI R&I Thailand Co., Ltd. — 2026

- Shipped a reception kiosk in about three weeks: QR / PIN / card scan, conversation,
  MQTT door open.
- GFAI had no product of its own and resold third-party hardware. The kiosk was their
  first in-house product: a robotic kiosk web app built to replace front-desk
  receptionists in client office lobbies.
- The kiosk handles walk-in visitors and pre-scheduled appointments, with conversational
  AI and QR scanning, deployed straight onto client robots.
- Led the whole scope: gathering requirements, setting up cloud infrastructure and
  preparing the production environment.
- Built with Next.js, TypeScript, Bun.js and Hono.

### Senior / Staff Software Engineer — ICM Smart Solution Co., Ltd. — 2022 to 2026

- First in the company to put Generative AI (Gemini, OpenAI, xAI) into production systems.
- Built a CRM-connected AI assistant in four months so sales could ask business questions
  grounded in company data using Text-to-SQL and schema routing.
- Built an AI-powered RAG chatbot into the core CRM Sales application end to end in
  under four months, giving the sales team real-time, context-aware customer support.
- Mentored 7 developers. Refactored backend paths and cut related project cost by about
  40 percent.
- Promoted to Senior faster than anyone in company history.
- Built with Generative AI, RAG, NestJS and PostgreSQL.

### Freelance Engineer — Fastwork.com — ongoing

- Owned full-lifecycle work: requirements, cloud setup, build, teaching client code, and
  bugfix.
- A computer-vision auto-door prototype and an AI doctor-assistant tool, from requirements
  through deployment support.
- Projects owned independently from zero to production, with direct client communication
  throughout.
- Built with Python, FastAPI, computer vision and cloud deployment.

## Selected systems

### AI API Center — LLM Gateway

One API for DeepSeek, Kimi, xAI, Gemini and GPT.

- Single POST API: caller sets provider, model, max tokens, and temperature. Every vendor
  returns the same response shape.
- Default cost-tier fallback when no model is set: DeepSeek, then Kimi, then xAI, then
  Gemini, then GPT. Task-level switching stays in the app.
- Checks that a model is usable. Typed errors for outage, quota, and unknown model.
  Provider keys never leave the server.

### Organization Q&A — Text-to-SQL agent

Answers internal questions from live database tables and a data dictionary.

- Routes general chat against business-data questions, so the database is not hit on every
  message.
- Matches the question to an allowlist of tables and views and a data dictionary, loads
  schema, peeks recent rows, drops irrelevant tables, then generates SELECT only.
- Inspects the query before it runs and answers from real result sets. The usage path can
  log query and result for audit.

## Skills

- **Core AI** — LLM gateway (multi-provider) · Text-to-SQL / schema grounding · intent
  routing (chat against data) · prompt and web-search tool · Gemini, OpenAI, xAI, DeepSeek,
  Kimi · AI and MQTT robotics kiosk · RAG chatbot and LLM pipelines · prompt engineering ·
  AI robotics · computer vision
- **Languages** — TypeScript · JavaScript · Python · Go
- **Backend** — NestJS · Express · Node.js · Bun (Elysia, Hono) · FastAPI · Django ·
  Go Gin · Go Fiber
- **Databases** — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite
- **Frontend and apps** — React · Next.js · SvelteKit · HTMX · Vue.js · Angular · ASP.NET ·
  kiosk web apps
- **Mobile** — React Native · Flutter
- **Infrastructure** — Docker · Git · nginx · pm2 · Linux and Windows · cloud deployment
- **Ways of working** — leadership and mentoring · critical thinking · first principles
  thinking · negotiation

## Education

- Computer Technology — Higher Vocational Certificate — 2021

## Languages

- Thai — native
- Lao — fluent
- English — working

## Certificates

- Prompt Engineering with GitHub Copilot — BorntoDev Academy — 2025
- DevLab Certificate — DevLab — 2025
- Employee Survival — ICM Smart Solution — 2025
- Essential SQL for Everyone — DevLab — 2025

## Contact

- Email: nichaphon.s@hotmail.com
- Phone: 082-037-3814
- Website: portfolio.develyst.online
- Location: Bangkok, Thailand

---

## Notes on the draft above — **NOT part of the file**; deviations from the suggested shape

- **Section list.** The suggested nine sections are all present and in order. One
  suggested section was **split for readability, not for content**: "Skills" keeps the
  resume's own grouping idea but uses eight labelled groups instead of the resume's three,
  so that every item can carry its own citation row without a merged group hiding which
  source it came from.
- **"7+" in the Summary and "7" in Experience are both his own resume's words**, in the
  two different places the resume puts them (header summary against the ICM bullet). They
  are not in conflict — "7+" includes 7 — so neither was rewritten. Nothing was smoothed.
- **No projects section, and that is now settled (FQ33, answered — SPEC-005 D5).** The site
  ships eleven portfolio entries, all approved copy. They stay **out** of this file: it
  answers *who he is*, while the eleven entries answer *what the AI may say about his work*.
  They become a **second** knowledge file under REQ-007, copy-pasted from the already-approved
  site entries — so they cost him **no** approval line here, and `PROFILE.md` must not be
  treated as the AI's only source.
- **The home district on the resume is written nowhere in this pack** — not in the body,
  not in the citations, not in these notes. Q41 (`ห้าม`) is treated as absolute.
- **Neither of the resume's two references appears**, by name, employer or phone number.
  The transcript never carried them, so there was nothing to omit by hand.

---

## (b) Proposed `PROFILE.citations.md` — one row per fact line in (a)

> Destination once approved: `back/knowledge/PROFILE.citations.md`.

| Line / heading in `PROFILE.md` | The claim | Citation |
|---|---|---|
| Title | Nichaphon Sayvav | `[R:Header]` · `[S:site.ts:SITE.name]` |
| Identity | Name: Nichaphon Sayvav | `[R:Header]` · `[S:site.ts:SITE.name]` |
| Identity | Goes by: Dong | `[S:site.ts:SITE.nickname]` — **site-only, no resume backing** |
| Identity | Titles: AI Engineer · Senior Software Engineer | `[R:Header]` (title line 1 + title line 2) |
| Identity | Location: Bangkok, Thailand | `[S:site.ts:SITE.location]` · `[O:Q41]` (resume's district line barred) |
| Identity | Years of professional experience: 4 | `[O:Q40]` — his own 2026-09-09 decision; exists in no other source |
| Identity | Performance awards: 2 | `[S:about.ts:CAREER_STATS.awards]` — **site-only, no resume backing** |
| Identity | Availability: Open to new opportunities | `[S:site.ts:SITE.availability]` — **site-only, no resume backing** |
| Summary | whole paragraph, verbatim | `[R:Header > Summary]` |
| Experience > GFAI | heading: AI & Robotics Developer | `[R:Experience > GFAI]` · `[S:about.ts:EXPERIENCE.gfai.role]` |
| Experience > GFAI | heading: GFAI R&I Thailand Co., Ltd. | `[S:about.ts:EXPERIENCE.gfai.organisation]` (title case kept, same rule as C3) · `[R:Experience > GFAI]` |
| Experience > GFAI | heading: 2026 | `[R:Experience > GFAI]` · `[S:about.ts:EXPERIENCE.gfai.period]` |
| Experience > GFAI | reception kiosk in about three weeks: QR / PIN / card scan, conversation, MQTT door open | `[R:Experience > GFAI]` · `[O:Q40]` (three weeks) |
| Experience > GFAI | GFAI had no product of its own and resold third-party hardware; first in-house product | `[S:about.ts:EXPERIENCE.gfai.body]` — **site-only, no resume backing** |
| Experience > GFAI | walk-in visitors and pre-scheduled appointments, conversational AI and QR scanning, deployed onto client robots | `[S:about.ts:EXPERIENCE.gfai.body]` — **site-only, no resume backing** |
| Experience > GFAI | led requirements, cloud infrastructure, production environment | `[S:about.ts:EXPERIENCE.gfai.body]` — **site-only, no resume backing** |
| Experience > GFAI | Next.js, TypeScript, Bun.js, Hono | `[S:about.ts:EXPERIENCE.gfai.tags]` — **site-only, no resume backing** |
| Experience > ICM | heading: Senior / Staff Software Engineer | `[R:Experience > ICM]` · `[S:about.ts:EXPERIENCE.icm.role]` |
| Experience > ICM | heading: ICM Smart Solution Co., Ltd. | `[S:about.ts:EXPERIENCE.icm.organisation]` (singular, title case) · `[R:Experience > ICM]` |
| Experience > ICM | heading: 2022 to 2026 | `[R:Experience > ICM]` · `[S:about.ts:EXPERIENCE.icm.period]` |
| Experience > ICM | first in the company to put Generative AI (Gemini, OpenAI, xAI) into production | `[R:Experience > ICM]` |
| Experience > ICM | CRM-connected AI assistant in four months, Text-to-SQL and schema routing | `[R:Experience > ICM]` |
| Experience > ICM | RAG chatbot in the core CRM Sales application, under four months, real-time context-aware support | `[S:about.ts:EXPERIENCE.icm.body]` — **site-only, no resume backing** |
| Experience > ICM | mentored 7 developers; backend paths refactored; project cost cut about 40 percent | `[R:Experience > ICM]` · `[S:about.ts:EXPERIENCE.icm.body]` |
| Experience > ICM | promoted to Senior faster than anyone in company history | `[S:about.ts:EXPERIENCE.icm.body]` — **site-only, no resume backing** |
| Experience > ICM | Generative AI, RAG, NestJS, PostgreSQL | `[S:about.ts:EXPERIENCE.icm.tags]` — **site-only, no resume backing** |
| Experience > Freelance | heading: Freelance Engineer | `[R:Experience > Freelance]` · `[S:about.ts:EXPERIENCE.freelance.role]` |
| Experience > Freelance | heading: Fastwork.com | `[S:about.ts:EXPERIENCE.freelance.organisation]` · `[R:Experience > Freelance]` (resume prints "FASTWORK") |
| Experience > Freelance | heading: ongoing | `[S:about.ts:EXPERIENCE.freelance.period]` — **site-only, no resume backing** |
| Experience > Freelance | requirements, cloud setup, build, teaching client code, bugfix | `[R:Experience > Freelance]` |
| Experience > Freelance | computer-vision auto-door prototype and AI doctor-assistant tool | `[R:Experience > Freelance]` · `[S:about.ts:EXPERIENCE.freelance.body]` |
| Experience > Freelance | owned independently zero to production, direct client communication | `[S:about.ts:EXPERIENCE.freelance.body]` — **site-only, no resume backing** |
| Experience > Freelance | Python, FastAPI, computer vision, cloud deployment | `[S:about.ts:EXPERIENCE.freelance.tags]` — **site-only, no resume backing** |
| Selected systems > gateway | heading: AI API Center — LLM Gateway | `[R:Selected systems > AI API Center]` |
| Selected systems > gateway | one API for DeepSeek, Kimi, xAI, Gemini and GPT | `[R:Selected systems > AI API Center]` (sub-line) |
| Selected systems > gateway | single POST API; provider, model, max tokens, temperature; one response shape | `[R:Selected systems > AI API Center]` |
| Selected systems > gateway | cost-tier fallback order; task-level switching stays in the app | `[R:Selected systems > AI API Center]` |
| Selected systems > gateway | model usability check; typed errors; keys never leave the server | `[R:Selected systems > AI API Center]` |
| Selected systems > Q&A | heading: Organization Q&A — Text-to-SQL agent | `[R:Selected systems > Organization Q&A]` |
| Selected systems > Q&A | answers internal questions from live tables and a data dictionary | `[R:Selected systems > Organization Q&A]` (sub-line) |
| Selected systems > Q&A | routes chat against data questions | `[R:Selected systems > Organization Q&A]` |
| Selected systems > Q&A | allowlist, data dictionary, schema load, row peek, drop tables, SELECT only | `[R:Selected systems > Organization Q&A]` |
| Selected systems > Q&A | inspects query before run; answers from real result sets; audit log path | `[R:Selected systems > Organization Q&A]` |
| Skills > Core AI | LLM gateway (multi-provider) · Text-to-SQL / schema grounding · intent routing · prompt and web-search tool · Gemini, OpenAI, xAI, DeepSeek, Kimi · AI and MQTT robotics kiosk | `[R:Skills > CORE AI]` |
| Skills > Core AI | RAG chatbot and LLM pipelines · prompt engineering · AI robotics · computer vision | `[S:about.ts:SKILL_GROUPS.ai]` — **site-only, no resume backing** |
| Skills > Languages | TypeScript · JavaScript · Python · Go | `[S:about.ts:SKILL_GROUPS.languages]` — **site-only, no resume backing** |
| Skills > Backend | NestJS · Express · Node.js · Bun (Elysia, Hono) · FastAPI · Django · Go Gin · Go Fiber | `[R:Skills > BACKEND]` · `[S:about.ts:SKILL_GROUPS.backend]` |
| Skills > Databases | PostgreSQL · MySQL · MSSQL · MongoDB · SQLite | `[R:Skills > BACKEND]` · `[S:about.ts:SKILL_GROUPS.databases]` |
| Skills > Frontend and apps | React · Next.js · SvelteKit · HTMX · kiosk web apps | `[R:Skills > APP & INFRA]` |
| Skills > Frontend and apps | Vue.js · Angular · ASP.NET | `[S:about.ts:SKILL_GROUPS.frontend]` — **site-only, no resume backing** |
| Skills > Mobile | React Native · Flutter | `[R:Skills > APP & INFRA]` · `[S:about.ts:SKILL_GROUPS.mobile]` |
| Skills > Infrastructure | Docker · Git · nginx · pm2 · Linux and Windows | `[R:Skills > APP & INFRA]` |
| Skills > Infrastructure | cloud deployment | `[S:about.ts:SKILL_GROUPS.devops]` — **site-only, no resume backing** |
| Skills > Ways of working | leadership and mentoring · critical thinking · first principles thinking · negotiation | `[S:about.ts:SKILL_GROUPS.ways-of-working]` — **site-only, no resume backing** |
| Education | Computer Technology — Higher Vocational Certificate — 2021 | `[R:Education]` |
| Languages | Thai — native | `[R:Languages]` |
| Languages | Lao — fluent | `[R:Languages]` |
| Languages | English — working | `[R:Languages]` |
| Certificates | Prompt Engineering with GitHub Copilot — BorntoDev Academy — 2025 | `[S:about.ts:CERTIFICATES.prompt-engineering-copilot]` — **site-only, no resume backing** |
| Certificates | DevLab Certificate — DevLab — 2025 | `[S:about.ts:CERTIFICATES.devlab]` — **site-only, no resume backing** |
| Certificates | Employee Survival — ICM Smart Solution — 2025 | `[S:about.ts:CERTIFICATES.employee-survival]` (singular, post-C3) — **site-only, no resume backing** |
| Certificates | Essential SQL for Everyone — DevLab — 2025 | `[S:about.ts:CERTIFICATES.essential-sql]` — **site-only, no resume backing** |
| Contact | nichaphon.s@hotmail.com | `[R:Contact]` · `[S:site.ts:SITE.email]` |
| Contact | 082-037-3814 | `[R:Contact]` · `[S:site.ts:SITE.phone]` |
| Contact | portfolio.develyst.online | `[R:Contact]` |
| Contact | Bangkok, Thailand | `[S:site.ts:SITE.location]` · `[O:Q41]` |

**Coverage, counted not claimed.** Section (a)'s body is **59 claim units** (the title, three
job headings, every bullet, both system sub-lines, the summary paragraph) plus **9 structural
`##` section headings**, which state no fact and so carry no row. The table above has **66
rows** — more than 59 because each job heading yields three rows (role, organisation, period)
and three skill lines split across a resume row and a site row.

**22 of the 66 rows cite a site string only — no resume line, no owner decision — and all 22
now carry `**site-only, no resume backing**`.** The flag is applied by a **mechanical** rule,
not by judgement: a row with no `[R:` and no `[O:` in its citation is flagged, full stop.
(A first draft flagged five of them and its prose said six; the count below was produced by
reading the citation column of every row, so it can be re-checked the same way.)

They fall into six plain groups:

| Group | Rows | What it means |
|---|---|---|
| The four certificates | 4 | The resume names **no certificate at all**; issuer and year come from the site |
| What GFAI's business was before the kiosk | 3 | Includes "had no product of its own and resold third-party hardware" — a claim about a **named third-party company** |
| Other job-history lines | 4 | The ICM RAG-chatbot bullet · "promoted to Senior faster than anyone in company history" · the Freelance period "ongoing" · the Freelance zero-to-production line |
| The three technology tag lists | 3 | The GFAI, ICM and Freelance "Built with" lines |
| Skill lines | 5 | The extra Core AI items · the Languages line · Vue.js / Angular / ASP.NET · "cloud deployment" · the ways-of-working items |
| Identity lines | 3 | "Goes by: Dong" · "Availability" · "Performance awards: 2" |

Every one of the 22 is copy **already published on his site in his own name**, so each is a
legal source under REQ-005 R2 and **none has been struck**. They are listed together, and put
on the approval sheet as line 6, for one reason: REQ-007 will feed this file to an LLM that
will repeat them to a stranger as fact. **One word strikes any of them.**

---

## (c) Q42 Class 1 add-list — new `SKILL_GROUPS` items only

Nine items, all nine of SPEC-005's candidates, none added, none dropped. Each is a new
string in an array that an existing component already renders: **no new component, no new
type, no layout change**. All nine were grepped against `about.ts` first — **zero already
present**, so none is a duplicate.

| # | Exact string | Target group | Citation | Why it fits |
|---|---|---|---|---|
| 1 | `DeepSeek` | `ai` ("AI and Robotics") | `[R:Skills > CORE AI]` · `[R:Selected systems > AI API Center]` | The group already names his providers; this is one he ships and the site does not list. |
| 2 | `Kimi` | `ai` | `[R:Skills > CORE AI]` · `[R:Selected systems > AI API Center]` | Same reason as DeepSeek — a provider in his own gateway's fallback chain. |
| 3 | `xAI` | `ai` | `[R:Skills > CORE AI]` · `[R:Experience > ICM]` | Already named in his ICM production work, but missing from the skills list. |
| 4 | `Text-to-SQL / schema grounding` | `ai` | `[R:Skills > CORE AI]` | The resume's own phrase; it is the one capability behind a whole Selected System. |
| 5 | `MQTT` | `ai` | `[R:Skills > CORE AI]` · `[R:Experience > GFAI]` | The kiosk's door-open path; the group already carries "AI Robotics" with no protocol beside it. |
| 6 | `Go Gin` | `backend` | `[R:Skills > BACKEND]` | The group already lists `Go Fiber`; Gin is the sibling framework the resume names. |
| 7 | `SQLite` | `databases` | `[R:Skills > BACKEND]` | The only database on the resume the site's list is missing. |
| 8 | `nginx` | `devops` ("Tools and DevOps") | `[R:Skills > APP & INFRA]` | The group has Docker and Git but nothing that serves the site; nginx is what actually fronts it. |
| 9 | `pm2` | `devops` | `[R:Skills > APP & INFRA]` | Same group, the process manager beside it. |

**Two notes, neither of them a decision:**

- **Casing.** `nginx` and `pm2` are written exactly as the resume prints them, lowercase.
  The rest of that group is title case (`Docker`, `Git`, `Cloud Deployment`). This follows
  the same rule C3 used for the ICM name — the source's spelling, the site's convention
  where they collide — and **one word reverses it** if he prefers `Nginx` / `PM2`.
- **An overlap he now chooses between (FQ34, answered — SPEC-005 D3 "Class 1b").** The `ai`
  group's first item already reads `Generative AI (Gemini, OpenAI)`, so adding the three
  provider chips would name five providers in two different shapes on one page. Class 1 was
  **not** widened into a licence to edit shipped copy; instead **exactly one** named existing
  item may move, and only if he approves its replacement string himself. Both shapes ride
  inside **sheet line 2**, with no recommendation:
  - **option 1 (nothing already shipped is edited)** — all nine new items go in and
    `Generative AI (Gemini, OpenAI)` stays exactly as it is;
  - **option 2** — that one item becomes `Generative AI (Gemini, OpenAI, xAI, DeepSeek, Kimi)`
    and add-list items 1-3 (`DeepSeek`, `Kimi`, `xAI`) are then **not** added separately —
    six new items instead of nine.

  Adding the chips *and* rewriting the phrase is not on offer: it would name the same three
  providers twice on one page.
- **No Education or Languages section is proposed for the site.** That is SQ24, with
  Porter. Both facts are in the profile file above, where they carry no UI cost.

---

## (d) C5, C8 and C9 proposals

### C5 — `SITE.role`, and the two strings that move with it

- **Today:** `SITE.role = 'Senior / AI Software Engineer'` (`src/constant/site.ts:6`).
- **Proposed (Q47's written default):** `'AI Engineer / Senior Software Engineer'` — both
  resume title lines, in the resume's order, joined with the separator the site already
  uses. Citation: `[R:Header]` · `[O:Q47 default]`.

Approving it **moves three strings, not one** (SPEC-005 SQ23). The other two hardcode the
old words instead of interpolating the constant, so they must change by hand or his search
result will contradict his own page:

| # | Where | Exact replacement sentence |
|---|---|---|
| C5.a | `src/app/layout.tsx:38` `metadata.description` | `AI Engineer / Senior Software Engineer working on Generative AI, RAG chatbots, AI robotics and full-stack systems. Robotic kiosk prototype delivered in about three weeks; RAG chatbot taken to production in under four months.` |
| C5.b | `src/app/about/page.tsx:7` `metadata.description` | `AI Engineer / Senior Software Engineer with production Generative AI, RAG chatbots and AI robotics, including a robotic kiosk prototype delivered in about three weeks.` |

Only the leading role phrase changes in each; every other word stays exactly as it ships
today (both already carry "about three weeks" from TASK-019).

**`layout.tsx`'s page *title* needs no edit** — it already interpolates `${SITE.role}`
(`title.default = ` `${SITE.name} — ${SITE.role}`), so approving C5 makes the browser tab
and the search-result heading read **"Nichaphon Sayvav — AI Engineer / Senior Software
Engineer"** with no further change.

### C8 — `SITE.copyrightYear`

- **Today:** `'2025'` (`src/constant/site.ts:12`). **Proposed (Q48's written default):**
  `'2026'`, as a plain string constant.
- Not computed, per SPEC-005 D4 / SQ25: this site is statically built, so an
  auto-advancing year freezes at build time — it would go stale exactly as `'2025'` did,
  but invisibly. A constant is wrong *visibly*, and one character fixes it.

### C9 — `ABOUT_INTRO.title`, the `/about` headline — **two candidates and one question; not picked**

- **Today:** `'Three years of shipping the thing nobody there had shipped before'`
  (`src/components/partials/About/About.config.ts:3`). It is the `/about` page `<h1>`.
- **Why it is on this sheet:** TASK-019 applied his own Q40 decision and `/` now reads
  **"4 Years experience"**. Both ship. One career length, two different numbers, one of
  them at headline size on the page a recruiter opens.
- Citation: `[S:About.config.ts:ABOUT_INTRO.title]` · `[O:Q40]`.

| Candidate | Exact wording | What it does |
|---|---|---|
| **A** | `Four years of shipping the thing nobody there had shipped before` | Minimal edit — the headline keeps its shape and matches the `4`. |
| **B** | `Shipping the thing nobody there had shipped before` | Drops the number entirely, so no second career figure can ever go stale. |

**The question only he can answer:** was "three years" ever meant as his **career total**
— in which case it is simply a stale number and A or B repairs it — or as the length of
**one particular pattern of work**, a separate fact the resume never states? If it is the
second, the number is not stale but it does collide with the `4` on the same site, and B
is the safe repair. **Neither SA nor FE will answer this.**

**Reverting the `4` back to `3+` is deliberately not offered.** The `4` is his own Q40
decision and is the fixed point here; the headline is the string that moves.

---

## (e) The approval sheet — six questions, for Porter to put to him

1. **The profile text** in section (a) above — is every line about you correct as written?
   Yes, or tell me which lines to change. (Read line 6 below before you answer this one.)
2. **Nine technology names get added to the skills list on your About page:** DeepSeek,
   Kimi, xAI, Text-to-SQL / schema grounding, MQTT, Go Gin, SQLite, nginx, pm2. Add all
   nine, or name the ones to drop. **One extra choice sits inside this question:** your
   AI-skills list already has an item reading **"Generative AI (Gemini, OpenAI)"**.
   **Option 1** — that item stays exactly as it is and all nine names above are added.
   **Option 2** — that item becomes **"Generative AI (Gemini, OpenAI, xAI, DeepSeek,
   Kimi)"**, and then DeepSeek, Kimi and xAI are *not* added as separate names, so six new
   names go in instead of nine. Option 2 is the only one that changes wording already
   published on your site. We are not recommending either.
3. **Your headline changes** from "Senior / AI Software Engineer" to "AI Engineer / Senior
   Software Engineer", the two title lines from your resume. Yes, or your own wording.
4. **The footer year changes** from 2025 to 2026. Yes or no.
5. **Your About page headline still says "Three years of shipping the thing nobody there
   had shipped before", while your Home page now says 4 years experience — two different
   numbers about the same career.** Choose A "Four years of shipping the thing nobody
   there had shipped before", B "Shipping the thing nobody there had shipped before", or
   your own words; and tell us whether "three years" meant your whole career or the length
   of one particular way of working.
6. **Some of what this profile says about you comes from your website, not from your
   resume** — your two performance awards, "promoted to Senior faster than anyone in
   company history", your freelance work being "ongoing", your four certificates (Prompt
   Engineering with GitHub Copilot, DevLab, Employee Survival, Essential SQL for Everyone),
   what GFAI's business was before your kiosk, and several technology and ways-of-working
   lists. They are all on your site today, and your AI will repeat them to visitors as
   fact. Keep them all, or name the ones to take out.

---

## Questions for Sober (`@Sober`)

**FQ33 / FQ34 / FQ35 — all three ANSWERED 2026-09-09** in
`tasks/TASK-020-profile-source-of-truth-draft-pack.md` §Questions, and this pack has been
reworked to match: the eleven portfolio entries stay out (SPEC-005 D5) · the one shipped
`ai` item rides inside sheet line 2 as two options (SPEC-005 D3, Class 1b) · every
unbacked claim is **kept**, all 22 of them flagged mechanically, and named on sheet line 6.

**FQ36 (NEW 2026-09-09) — a side effect of fix 2, flagged, not decided.** Striking "the same
work shipped as" leaves the ICM section with two adjacent bullets that each describe a
four-month CRM AI build: one from the resume (a CRM-connected AI assistant, Text-to-SQL and
schema routing) and one from the site (an AI-powered RAG chatbot in the CRM Sales app). Your
instruction was to let the bullet stand on its own, and I applied your wording verbatim. The
residual risk is the mirror image of the one you closed: a reader — or the REQ-007 LLM — may
now infer **two** separate four-month CRM projects, which no source states either. I am not
proposing a fix, because every fix I can think of asserts a relationship between them that no
allowed source supports. **The one person who knows whether they are one project or two is the
owner**, so if you want it resolved rather than left neutral, it is a sheet line, not an edit.
Nothing is blocked on this and the pack is complete without it.
