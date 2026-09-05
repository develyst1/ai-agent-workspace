# DRAFT-001: two project entries for /portfolio (REQ-003, awaiting his approval)
- Source: TASK-016 / SPEC-003 · Drafted 2026-09-05 by Fern · NOT YET APPROVED

> Citation form: `<repo>@<sha7>:<path>:<line>` for repo lines, or the live URL +
> the date it was loaded. **Every line below carries one.** Nothing here is
> inferred, smoothed or filled in — where a source is silent the field says so.

## Sources actually read

| Repo | Branch | HEAD SHA read | Matches SPEC-003 pin? |
|---|---|---|---|
| `seaharatp-commits/Learing-curve-front` | `develop` | `fdd93b37d37c09e3cf761ff5faef605b79430021` | **YES** |
| `seaharatp-commits/Learing-curve-back` | `develop` | `783aac9b164a79249b6c2b0f7df2ae2eee05d116` | **YES** |
| `develyst1/ong-match-front` | `dong` | `fa8036f61f876b2e96ae1f09e0dbdc8d38f0bc80` | **YES** |
| `develyst1/ong-match-back` | `dong` | `703513c51bc2e14807f34e368ca248c2165139b7` | **YES** |

All four `--depth 1` clones landed in the agent scratch directory only, were read
without any write, and were deleted at the end of the task. No branch, commit,
push, PR, issue or fork on any of them.

| Live URL | Loaded | What it served |
|---|---|---|
| `https://learning.develyst.online/` | 2026-09-05 | HTTP 200, redirected to `/login`; `<title>Learning Curve</title>` |
| `https://ong.develyst.online/` | 2026-09-05 | HTTP 200; `<title>Ong Match — หาคนไทป์เดียวกัน</title>` |

Public pages only. No login, no account created, no password typed, no form
submitted. Short forms of the SHAs used below: `fdd93b3` · `783aac9` · `fa8036f`
· `703513c`.

---

## Entry 1 — Learning Curve

### `title` — **AWAITING HIS PICK (SQ16b): the sources disagree, so I did not choose**

| # | Candidate | Citations |
|---|---|---|
| **(a)** | `Learning Curve` | live `<title>` at `https://learning.develyst.online/login`, loaded 2026-09-05 · `Learing-curve-front@fdd93b3:src/app/layout.tsx:21` · `Learing-curve-front@fdd93b3:CLAUDE.md:3` · `Learing-curve-front@fdd93b3:src/components/layout/MainLayout/MainLayout.tsx:25` |
| **(b)** | `LearningCurve` (one word) | `Learing-curve-back@783aac9:README.md:1` — the README heading reads `# LearningCurve Backend` |

Four sources say (a) and one says (b). **One line from him settles it**; the rest
of this entry reads the same either way.

### `summary` — 4 sentences, one citation block each

1. "A Thai-language web application that pairs an AI helpdesk chat with a
   learning dashboard."
   — `Learing-curve-front@fdd93b3:src/app/layout.tsx:22` (`description: "Learning Curve — AI Helpdesk และแดชบอร์ดการเรียนรู้"`, the same string served live on `https://learning.develyst.online/login`, 2026-09-05)
2. "Learners get generated lessons, quizzes and an AI chat; administrators get a
   knowledge base, a dashboard and skill management."
   — routes present in the tree: `Learing-curve-front@fdd93b3:src/app/(main)/{dashboard,lessons/[id],quizzes,quizzes/[id],chat,history,account}/page.tsx` and `Learing-curve-front@fdd93b3:src/app/(admin)/admin/{dashboard,knowledge-base,skill-radar}/page.tsx`
3. "A NestJS backend exposes authenticated learning, quiz, chat, Knowledge Base
   and Skill Radar APIs over PostgreSQL through Prisma."
   — `Learing-curve-back@783aac9:README.md:3-5`; `Learing-curve-back@783aac9:prisma/schema.prisma:5-8` (`provider = "postgresql"`)
4. "Lesson, quiz and chat generation call a separate AI gateway, and each caller
   holds a fallback response for when that gateway does not answer."
   — `Learing-curve-back@783aac9:README.md:51-58`

### `highlights` — 5, each a capability pointable at in the source

- "Builds a lesson from a topic the learner enters"
  — `Learing-curve-back@783aac9:src/learning/learning.controller.ts:31` (`@Post("lessons/generate-from-topic")`); `Learing-curve-back@783aac9:README.md:34`
- "Generates a quiz from a lesson and stores every attempt"
  — `Learing-curve-back@783aac9:src/learning/learning.controller.ts:45`; `Learing-curve-back@783aac9:src/learning/quiz.controller.ts:42` (`@Post(":id/attempts")`); `Learing-curve-back@783aac9:prisma/schema.prisma:173` (`model QuizAttempt`)
- "Skill Radar: per-user skill scores against a chosen position, with a cached career-alignment record"
  — `Learing-curve-back@783aac9:src/skill-radar/skill-radar.controller.ts:29,34,39`; `Learing-curve-back@783aac9:prisma/schema.prisma:247,299` (`model UserSkillScore`, `model CareerAlignment`); `Learing-curve-back@783aac9:README.md:17-18`
- "Knowledge base with a recommendation endpoint and admin-only create, update and delete"
  — `Learing-curve-back@783aac9:src/knowledge-base/knowledge-base.controller.ts:24,30,48,54,60`; `Learing-curve-back@783aac9:README.md:41`
- "AI chat with suggested questions and per-user chat history"
  — `Learing-curve-back@783aac9:src/chat/chat.controller.ts:13,18,23`; `Learing-curve-back@783aac9:src/history/history.controller.ts`; `Learing-curve-back@783aac9:prisma/schema.prisma:55,69` (`model ChatSession`, `model ChatMessage`)

### `techStack` — declared dependencies only

`['Next.js', 'React', 'TypeScript', 'HeroUI', 'Tailwind CSS', 'TanStack React Query', 'NextAuth', 'NestJS', 'Prisma', 'PostgreSQL', 'JWT']`

| Value | Declared at |
|---|---|
| Next.js, React | `Learing-curve-front@fdd93b3:package.json:` deps `next 16.2.9`, `react 19.2.7` |
| TypeScript | `Learing-curve-front@fdd93b3:package.json:` devDeps `typescript 6.0.3`; `Learing-curve-back@783aac9:package.json:44` `typescript 5.7.2` |
| HeroUI | `Learing-curve-front@fdd93b3:package.json:` deps `@heroui/react 2.8.10` |
| Tailwind CSS | `Learing-curve-front@fdd93b3:package.json:` devDeps `tailwindcss 4.3.0`, `@tailwindcss/postcss 4.3.0` |
| TanStack React Query | `Learing-curve-front@fdd93b3:package.json:` deps `@tanstack/react-query 5.101.0` |
| NextAuth | `Learing-curve-front@fdd93b3:package.json:` deps `next-auth 4.24.14` |
| NestJS | `Learing-curve-back@783aac9:package.json:` deps `@nestjs/common,core,config,platform-express 10.x` |
| Prisma | `Learing-curve-back@783aac9:package.json:` deps `@prisma/client 6.1.0`, devDeps `prisma 6.1.0` |
| PostgreSQL | `Learing-curve-back@783aac9:prisma/schema.prisma:6` (`provider = "postgresql"`) |
| JWT | `Learing-curve-back@783aac9:package.json:` deps `@nestjs/jwt 10.2.0`, `passport-jwt 4.0.1` |

Versions are shown here as evidence only; the proposed `techStack` strings carry
no version numbers, matching the shape a reviewer can check against the source.

### `link`

`https://learning.develyst.online/` — verbatim as he handed it over
(`requirements/REQ-003-portfolio-content-refresh.md:50`), and the URL loaded
2026-09-05. **No GitHub URL appears in this entry.**

### `id`

`learning-curve` — kebab-case; checked against the nine ids currently in
`front/src/constant/content/projects.ts` (`dte-platform`, `develyst-web`,
`laichill`, `crm-rag-chatbot`, `backend-optimisation`, `yodbarber`,
`ai-voice-avatar`, `develyst-ai`, `r1-bev`): **no collision**. This id is
unaffected by which title candidate he picks.

---

## Entry 2 — Ong Match

### `title` — **AWAITING HIS PICK (SQ16b): the sources disagree, so I did not choose**

| # | Candidate | Citations |
|---|---|---|
| **(a)** | `Ong Match` | `ong-match-front@fa8036f:src/constant/text/common/index.ts:4` (`brand: "Ong Match"`, rendered in the top bar at `ong-match-front@fa8036f:src/app/page.tsx:72-74`) · `ong-match-front@fa8036f:DEVLOG.md:8` (`## What Ong Match is`) |
| **(b)** | `Ong Match — หาคนไทป์เดียวกัน` | live `<title>` at `https://ong.develyst.online/`, loaded 2026-09-05 · `ong-match-front@fa8036f:src/app/layout.tsx:8` |

The live page renders **(a)** as the on-screen brand and serves **(b)** as the
document title, so both are real. **One line from him settles it.**

### `summary` — 4 sentences, one citation block each

1. "A Thai friend-matching web application built around interest 'types'
   (ไทป์) that members write for themselves."
   — `ong-match-front@fa8036f:DEVLOG.md:8-11`; `ong-match-back@703513c:DEVLOG.md:8-11`
2. "A member describes an interest, an AI check accepts or rejects it as a type,
   and a timed quiz then grades how deep the member goes in it and assigns a
   level."
   — `ong-match-back@703513c:src/ai/prompts.ts:1,11,18,24` (`GUARDRAIL_SYS`, `SUGGEST_SYS`, `QUIZGEN_SYS`, `GRADE_SYS`); `ong-match-back@703513c:src/routes/types.ts:23,32,54`; `ong-match-back@703513c:src/config/rules.ts:2-18`
3. "Levels gate contact: a type carries a minimum level another member has to
   reach before a conversation can start."
   — `ong-match-back@703513c:src/routes/social.ts:104` (`GET /users/:id/can-contact`); `ong-match-back@703513c:src/routes/types.ts:106` (`PUT /types/:id/requirement`)
4. "Around the types sit a post feed with following, people matching, tag search,
   trending tags, one-to-one chat and tag-based group rooms."
   — `ong-match-back@703513c:src/routes/social.ts:31,36,44,54,62,67`; `ong-match-back@703513c:src/routes/chat.ts:18,29`; `ong-match-back@703513c:src/routes/rooms.ts:11,16`

### `highlights` — 5, each a capability pointable at in the source

- "AI check that accepts or rejects a submitted type before it can be used"
  — `ong-match-back@703513c:src/ai/prompts.ts:1` (`GUARDRAIL_SYS`); `ong-match-back@703513c:src/routes/types.ts:32` (`POST /types/validate`)
- "Timed quiz generated and graded by AI, producing the level for that type; a type can be re-levelled and expires after a set period"
  — `ong-match-back@703513c:src/ai/prompts.ts:18,24`; `ong-match-back@703513c:src/routes/types.ts:54,78` (`POST /quizzes/:id/submit`, `POST /types/:id/relevel`); `ong-match-back@703513c:src/config/rules.ts:2-9` (`minQuestions`, `secPerQuestion`, `passScore`, `cooldownHours`, `expiryDays`, `failScore`)
- "Contact gate: each type carries the minimum level another member must hold before opening a conversation"
  — `ong-match-back@703513c:src/routes/social.ts:104`; `ong-match-back@703513c:src/routes/types.ts:106`
- "Post feed with follow and unfollow, people matching and trending tag groups"
  — `ong-match-back@703513c:src/routes/social.ts:31,36,44,62,67`; `ong-match-front@fa8036f:src/app/(main)/{discover,tribes,profile,u/[id]}/page.tsx`
- "One-to-one conversations and tag-based group rooms, with image upload served as static files"
  — `ong-match-back@703513c:src/routes/chat.ts:18,29,34,43`; `ong-match-back@703513c:src/routes/rooms.ts:11,16,25`; `ong-match-back@703513c:src/routes/uploads.ts:20`; `ong-match-back@703513c:src/app.ts:22` (`serveStatic` on `/uploads/*`)

### `techStack` — declared dependencies only

`['Next.js', 'React', 'TypeScript', 'Mantine', 'TanStack React Query', 'Bun', 'Hono', 'PostgreSQL', 'Zod']`

| Value | Declared at |
|---|---|
| Next.js, React | `ong-match-front@fa8036f:package.json:19-21` (`next 16.2.10`, `react 19.2.7`, `react-dom 19.2.7`) |
| TypeScript | `ong-match-front@fa8036f:package.json:33` (`typescript ^5.1.0`) |
| Mantine | `ong-match-front@fa8036f:package.json:12-14` (`@mantine/core,dates,hooks 9.4.1`) |
| TanStack React Query | `ong-match-front@fa8036f:package.json:16` (`@tanstack/react-query 5.101.2`) |
| Bun | `ong-match-back@703513c:package.json:7-13` (every script runs `bun`), `:21` (`@types/bun`) |
| Hono | `ong-match-back@703513c:package.json:16` (`hono ^4.6.0`) |
| PostgreSQL | `ong-match-back@703513c:package.json:17` (`postgres ^3.4.9`) |
| Zod | `ong-match-back@703513c:package.json:18` (`zod ^3.23.0`) |

### `link`

`https://ong.develyst.online/` — verbatim as he handed it over
(`requirements/REQ-003-portfolio-content-refresh.md:54`), and the URL loaded
2026-09-05. **No GitHub URL appears in this entry.**

### `id`

`ong-match` — kebab-case; **no collision** with the nine existing ids listed
under Entry 1. Unaffected by which title candidate he picks.

---

## Observations for the owner (never edits, only questions)

**1. Technologies found in the source that are NOT in `SKILL_GROUPS`
(`front/src/constant/content/about.ts`) — proposals only, nothing added.**
A skill claim is a claim about him, so none of these was written anywhere:

| Not currently listed | Declared at |
|---|---|
| HeroUI | `Learing-curve-front@fdd93b3:package.json` deps `@heroui/react 2.8.10` |
| Tailwind CSS | `Learing-curve-front@fdd93b3:package.json` devDeps `tailwindcss 4.3.0` |
| Mantine | `ong-match-front@fa8036f:package.json:12-14` |
| TanStack React Query | `Learing-curve-front@fdd93b3:package.json` deps; `ong-match-front@fa8036f:package.json:16` |
| NextAuth | `Learing-curve-front@fdd93b3:package.json` deps `next-auth 4.24.14` |
| Prisma | `Learing-curve-back@783aac9:package.json` deps `@prisma/client 6.1.0` |
| Zod | `ong-match-back@703513c:package.json:18` |
| Passport / JWT | `Learing-curve-back@783aac9:package.json` deps `@nestjs/passport`, `passport-jwt`, `@nestjs/jwt` |
| Framer Motion | `Learing-curve-front@fdd93b3:package.json` deps `framer-motion 12.40.0` |

Already listed and therefore **not** proposed: TypeScript, React / Next.js,
NestJS, `Bun + Hono`, PostgreSQL.

**2. Other people's data on a public page (R8).** Neither load showed any.
`https://learning.develyst.online/` redirected to `/login` and rendered only the
sign-in form (2026-09-05). `https://ong.develyst.online/` rendered the brand, the
tagline and a sign-in form (2026-09-05). **However**, the landing page in the
source is documented as a *public read-only news feed* —
`ong-match-front@fa8036f:src/app/page.tsx:31-33` ("Public landing + read-only
news feed. Guests can browse the latest posts…") — so that page **can** display
other members' posts. I stopped at the pages above and copied nothing from
either. Nothing from either site's screens is proposed for publication.

**3. Could not be sourced — and the field each would have filled.**
- **Dates** (when each project ran): not looked for, and git history is not an
  allowed source (SPEC-003 AC-f). `Project` has no date field anyway. → Q22-b.
- **Client / employer**: nothing in any of the four repos names one. `Project`
  has no such field. → Q22-b.
- **Any metric** (users, sessions, %, time saved): nothing measured appears in
  any source. Nothing was written.
- **His role on each project**: not read out of the repos; it lives in his own
  Q22 answer in REQ-003, which is his to state, not mine to derive.
- **Which project name he wants**: the two `title` pick-lists above (SQ16b).

**4. Both projects call the same AI gateway, `ai.develyst.online`** —
`Learing-curve-back@783aac9:README.md:71` (`AI_API_URL="https://ai.develyst.online"`)
and `ong-match-back@703513c:src/ai/client.ts:1` (`AI_BASE_URL … "https://ai.develyst.online"`).
That is a fact about his own infrastructure, not about either product, so **it is
not in either entry**. If he wants it said, it is his line to write.

**5. `link` trailing slash.** The nine existing entries end without a slash
(e.g. `https://dte.develyst.online`). The two URLs he handed over both end with
one, and SPEC-003 says `link` is his URL **verbatim** — so both new entries carry
the trailing slash and now differ in shape from the existing nine. Flagged, not
silently normalised.

**6. `Learing-curve-front@fdd93b3:CLAUDE.md:3-5` is out of step with its own
tree.** It describes pages "Login, AI Chat, History, Report an Issue (แจ้งปัญหา)"
and an admin area of "Knowledge Base management + Dashboard". At this SHA there
is **no** `report` route, and there **are** `dashboard`, `lessons/[id]`,
`quizzes`, `quizzes/[id]`, `account` and `admin/skill-radar` routes
(`Learing-curve-front@fdd93b3:src/app/(main)/…`, `…/(admin)/admin/…`). Both
entries above are drawn from the **routes and controllers that exist**, not from
that paragraph; only the word "helpdesk" comes from a live, current string
(`src/app/layout.tsx:22`).

**7. Numerals deliberately left out, available if he wants them.** SPEC-003 and
TASK-016 forbid metrics, so no number reached either entry. For completeness,
these are product rules stated in the source, not measurements, and he can ask
for any of them: level range `0–100` and 30-day expiry
(`ong-match-front@fa8036f:DEVLOG.md:9-11`), and `minQuestions: 3`,
`secPerQuestion: 20`, `passScore: 60`, `cooldownHours: 24`, `expiryDays: 30`,
`failScore: 40` (`ong-match-back@703513c:src/config/rules.ts:3-9`).

**8. `ai-worker/drafts/` did not exist.** TASK-016 §3 says "the folder exists";
it did not, so this task created it. No other path was added.
