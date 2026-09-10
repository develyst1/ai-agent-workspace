# REQ-001: Frontend foundation — house folder pattern, a component library, icons instead of emoji
- Status: IN_SPEC (Sober's — `specs/SPEC-001-frontend-foundation.md`). **BOTH owner gates CLOSED 2026-09-07**: C5(a) library = **antd**, C5(b) upgrade = **"รันเลย"** (`SYSTEM-FACTS.md` A15/A16). Nothing on this REQ waits on the owner any more.
- Priority: HIGH
- Requested: 2026-09-06 by the owner (develyst)
- Deadline: none stated

## Problem / Goal

`front/` grew ad hoc. It is Next.js 15 App Router + TypeScript + Tailwind with hand-rolled
components (`ui/AnimatedBackground`, `CategoryCard`, `FeatureCard`, `PasswordInput`,
`StatCounter`) and no shared component vocabulary, and its folder layout does not follow any
agreed pattern (as-built survey 2026-09-06 §3). The owner wants the frontend put on a
predictable foundation **before** more product surface is built on top of it:

> "ตอนนี้ front เป็น next js typescript ใช่มั้ย ถ้าใช่ ช่วยใช้ skill nextjs pattern generator เพื่อสร้างให้เป็น
> structure folder แบบนั่น น่าจะเป็นอะไรที่ดีกว่า และ UI BASE อย่า ใช้ emoji ให้ใช้ icon แทน และ UI base on
> lib component สักตัวที่เข้ากันได้ ดี กับเนื้อหาของโปรเจค อาจจะเป็น mantine , antd , หรืออื่นๆ" (owner, 2026-09-06)

Who it is for: the owner (maintainability, speed of future work) and Fern (a pattern to build
into instead of inventing one per page). This REQ is **foundation only** — it adds no product
feature. The product itself (learner/teacher, AI Teacher training loop, pricing) is separate;
his words on that are captured in `REQ-002` (DRAFT) and `SYSTEM-FACTS.md`.

## Requirement

1. The system must have a **single documented frontend folder structure**, generated from the
   `nextjs pattern generator` house pattern skill (owner-mandated tool — see C1), and `front/`
   must be organised to it.
2. The frontend must **stand on one third-party React component library**, chosen to suit an
   education/knowledge product. The owner named **Mantine** and **Ant Design** as examples and
   explicitly left the choice open ("หรืออื่นๆ"). The recommendation is the SA Lead's, **with
   written rationale**; the owner confirms it before any migration begins (see C5).
3. **No emoji may appear in the UI.** Every place an emoji currently carries meaning (label,
   status, category, button, empty state) must use an icon from the chosen icon set instead.
   This is a **standing standard from 2026-09-06 onward**, not a one-time cleanup — new UI is
   held to it too.
4. The chosen library, its icon set, and the folder pattern must be written down in a short
   frontend convention document that Fern can follow without re-deriving it, and the design
   must state how the library coexists with (or replaces) the existing Tailwind setup.
5. The migration must be delivered as a **plan with a stated order and a stated blast radius**
   — which screens change when, and what stays untouched — because the site is live (C3).

## Acceptance Criteria

- [ ] A SPEC exists naming the chosen component library **and the rationale for it over the
      alternatives the owner named**, and the owner has confirmed that choice.
- [ ] The SPEC states the target folder structure, and states plainly whether adopting it
      requires a Next.js 15 → 16 upgrade (see Q3) — no silent version jump.
- [ ] The SPEC states the Tailwind coexistence/removal decision explicitly.
- [ ] A migration plan exists that is ordered and incremental, and names for each step what a
      human would look at to confirm nothing broke.
- [ ] A repeatable check exists for "no emoji in the UI" that a person can run and read the
      output of (not "we looked and it seemed fine").
- [ ] Every screen touched still renders and still behaves as it did — evidence being the
      engineer's own run output plus **the owner's own eyes**; there is no QA role here, so
      anything not actually run in a browser is written down as `UNVERIFIED`.

## Constraints

- **C1 — mandated tool.** The folder structure comes from the `nextjs pattern generator` skill,
  by the owner's instruction. Recorded as a stakeholder constraint, not as a design choice.
- **C2 — the code as it is.** `front/` = `next 15.5.4`, `react 19.2.3`, `typescript 5`,
  `tailwindcss 3.4.17`, Headless UI 2.2.9, Heroicons, `lucide-react`, `axios`; Turbopack for
  both `dev` and `build` (survey 2026-09-06 §3). Two icon sets are already installed — settling
  on one is part of this work.
- **C3 — brownfield and LIVE.** `dte.develyst.online` serves real users. Nothing here is
  deployed by an agent, and the migration must not be shaped as a big-bang rewrite unless the
  owner asks for one (Q2). Note also that `/courses` still renders `src/lib/mockData.ts` while
  `login`, `register`, `verify-email`, `classroom/[id]`, `AIChat`, `SearchAI` are wired to the
  API — a screen rendering is not proof it is connected.
- **C4 — the inherited routes are NOT in scope.** `/portfolio`, `/services`, `/contact`,
  `/about`, `/blog` and the `about/page-new.tsx` / `page.tsx.backup` leftovers are open question
  Q3 in `SYSTEM-FACTS.md` and stay untouched here — migrating or deleting them is the owner's
  call, not a cleanup decision taken in passing.
- **C5 — approval gate (UPDATED 2026-09-07, fourth revision — BOTH GATES NOW CLOSED).**
  **No gate on this REQ is open.** Unblocked: writing the SPEC, and implementation TASKs for the
  folder pattern and the icons-not-emoji standard, delivered **screen by screen** (owner:
  "ค่อยย้ายทีละหน้า").
  - **(a) ✅ CLOSED 2026-09-07 — the component library is ANT DESIGN.** The owner answered
    **"antd"** to Sober's proposal (`SYSTEM-FACTS.md` A15). Migration onto Ant Design v6 may
    begin, in the per-screen order SPEC-001 states. ⚠️ He approved the **library**, not a
    schedule, and he did not lift Q2 — it stays screen by screen. The gate's history:
  - **(a — history) the component library.** The owner had stated the rule in
    his own words: **"เสนอแล้วผมเคาะ"** (*propose it and I'll make the call* — 2026-09-06). Sober
    proposes ONE library with written rationale (including the Mantine-vs-C1 tension in Q1);
    **no migration onto a library begins until the owner has said yes.** Porter carries the
    proposal to him. This is no longer Porter's cautious reading — it is the owner's instruction.
  - **(b) ✅ CLOSED 2026-09-07 — the upgrade is CLEARED TO RUN.** The plan was written as
    `tasks/TASK-001-next16-tailwind4-upgrade.md`, Porter carried it to the owner exactly as this
    gate required, and he answered **"รันเลย"** (`SYSTEM-FACTS.md` A16). "Run" = run it **locally
    on `develop`, with the engineer's own evidence**; production stays his alone. Moving TASK-001's
    status is Sober's/the engineer's act, not Porter's. The gate's history:
  - **(b — history) The Next 15 → 16 upgrade is APPROVED in direction, and showing its PLAN first is now the
    owner's OWN rule (settled 2026-09-06).** Direction: **"อัปไปเลย"** — *just upgrade.* Review:
    **"เอามาให้ดูก่อน"** — *bring it to me to look at first.* Therefore: Sober writes the 15-vs-16
    assessment into the SPEC (it stays an acceptance criterion) **and** plans the upgrade as its
    **own sequenced TASK** — never folded into a page-migration TASK — with a stated rollback and a
    stated blast radius. **Porter carries that plan to the owner, and it is executed only after he
    has seen it and said go.** The earlier ⚠️ is **CLOSED**: this is no longer Porter's default, it
    is the owner's instruction. **Writing the plan is not gated — only running it is.**
  Deployment remains the owner's alone in every case (PROTOCOL.md "Environments").

## Out of Scope

- Any product feature: course creation, the AI Teacher, payments, the 2% fee, roles.
- Backend (`back/`) work of any kind, and any change to `develyst-ai`.
- ~~Visual redesign / rebranding. This is structure and component substrate, not a new look —
  unless the owner says otherwise.~~ 🔴 **AMENDED 2026-09-09 by Porter, answering Sober's
  `specs/SPEC-006-visual-improvement-pass.md` §Questions Q1** (the line had gone self-contradictory
  against A43 and should not stay so on the record). The owner **did** say otherwise — that is the
  "unless" clause firing, not a widening by the team. **What this REQ still puts out of scope is
  REBRANDING** (a new identity, logo, name or product surface, which nobody has asked for) **and
  every product-surface change.** A **deliberate visual-improvement pass on the migrated screens —
  spacing and colour, modern — is IN scope by his own word** (`SYSTEM-FACTS.md` **A43**), carried by
  SPEC-006, home page first then `/courses` (**A44**), each shown to him before the rest copy it.
  The sub-bullets below are the audit trail of how the line got here; read the amendment, not them.
  - **EXCEPTION, owner-stated 2026-09-07 ("เปลี่ยน", `SYSTEM-FACTS.md` A17):** the superseded
    product name in the page `<title>` **is** cleared to change, to the settled name
    **"Develyst The Education"** (A6). That is the one piece of user-facing copy he has cleared.
    **BOTH ⚠️ FOLLOW-UPS NOW ANSWERED 2026-09-07** (`SYSTEM-FACTS.md` A19/A20): (a) the exact page
    `<title>` string is **`DTE — Develyst The Education`** — character for character, spaced em
    dash, no tagline and no added suffix; (b) the rename applies **"ทุกที่"** — everywhere the
    superseded name "Disrupt Thai Education" still appears in `front/`, the question he answered
    having enumerated `<title>`, metadata description, OG tags, header and footer.
    **BOTH REMAINING ⚠️ ITEMS ANSWERED 2026-09-07** (`SYSTEM-FACTS.md` A21/A22): "ทุกที่" **does**
    reach outside `front/`, and every place that is not the page `<title>` takes the bare name
    **`Develyst The Education`**. **Because the rename now spans `back/` and repo documents too, it
    has left REQ-001 entirely and lives in its own requirement —
    `requirements/REQ-004-product-name-rename-everywhere.md` (READY_FOR_SA, 2026-09-07).** Nothing
    about the rename is decided inside SPEC-001 any more; Sober's earlier call ("its own TASK, not
    folded into TASK-001/002") stands and is now carried by REQ-004.
  - ~~🔴 **REAFFIRMED BY THE OWNER 2026-09-09, and now his word rather than Porter's reading**
    (`SYSTEM-FACTS.md` **A41**): ... he chose **preserve today's look** ... This binds all seven
    SPEC-001 screens, not just `/login`.~~ 🔴 **STRUCK 2026-09-09 — this was Porter's MISREADING of
    "re UI", and the owner corrected it himself.** The struck text is kept verbatim in
    `SYSTEM-FACTS.md` §A41 (also struck there); it is quoted here only so nobody hunts for what
    changed. **Do not act on it.**
  - 🔴 **THE OWNER'S CORRECTION, 2026-09-09 — this is the line that binds** (`SYSTEM-FACTS.md`
    **A42**, verbatim): **"re UI ไม่ได้หมายถึง ให้ ย้อนเป็น หน้าตาเดิม หมายถึงให้ทำ หน้าตาใหม่ให้ดีขึ้น และ
    แค่ เอา emojiออก ใช้icon"**. Read against TASK-004 §Questions **Q1**: option **(b) preserve
    today's look is NOT his answer**. Concretely, for all seven SPEC-001 screens:
    1. **Reverting a migrated screen to its legacy look is not wanted** — the new appearance the
       antd substrate brings is not a defect to be undone.
    2. **The look may change and he wants it BETTER** — "ทำหน้าตาใหม่ให้ดีขึ้น". So this Out-of-Scope
       line no longer reads as a flat ban on visual change during the antd migration; what it still
       bans is an unasked-for **rebranding**, and any product-surface change.
    3. **emoji → icons stands** — Requirement 3, restated by him a third time.
    ⚠️ **NOT decided by that sentence, and nobody guesses it:** *how far* "ให้ดีขึ้น" goes — antd's
    defaults already being "better", versus a deliberate visual-improvement pass he sees first.
    Asked back to him as **§Questions Q7** below; non-blocking, because point 1 stands on its own.
    🔴 **ANSWERED 2026-09-09 — §Questions Q7, option (ข)** (`SYSTEM-FACTS.md` **A43**): it goes as
    far as a **deliberate visual-improvement pass**, criteria **spacing + colour, modern**, starting
    with the **home page**, then the courses page, **shown to him before the rest copy it**. So this
    Out-of-Scope line bans only an unasked-for **rebranding** and product-surface change — a designed
    visual improvement on the migrated screens is now IN scope, by his word.
    **How** anything is built stays Sober's design call — the owner named no mechanism and Porter
    proposes none.
- Deciding the fate of the inherited routes (C4), and deleting the `about/` leftovers.

## Questions

**For the owner — ALL THREE ANSWERED 2026-09-06.** His verbatim Thai is quoted under each; the
same answers are in `SYSTEM-FACTS.md` § "Owner's answers to REQ-001 Q1–Q3".

- **Q1 — the library.** Sober will recommend one with rationale. Does the owner want to see the
  recommendation and confirm it before work starts, or does he delegate the pick outright?
  Note for Sober: the house pattern skills exist for **Ant Design (stated house default),
  HeroUI, shadcn/ui, MUI, Chakra UI, PrimeReact** — **Mantine has no matching pattern skill**,
  so choosing Mantine means C1 and the library choice pull against each other. Say so in the
  SPEC rather than quietly resolving it.
  > **answer (owner, 2026-09-06): "ให้ Sober เสนอ"** — *let Sober propose.* Sober picks a
  > recommendation and writes the rationale, including the Mantine-vs-C1 tension above. Read as
  > branch (a): the proposal comes back to the owner and he confirms it before any migration
  > onto a library begins — he said "เสนอ" (propose), not "เลือกเลย" (pick outright). ⚠️ If he
  > did mean to delegate outright he can lift the confirmation in one line; until then C5(a)
  > stands. Sober: do not settle this by choosing quietly — put the proposal in the SPEC.
  > **follow-up answer (owner, 2026-09-06): "เสนอแล้วผมเคาะ"** — *propose it and I'll make the call.*
  > The ⚠️ above is **CLOSED**: he did **not** delegate the pick outright. The confirmation step is
  > now his own stated rule, not Porter's reading. Sober — propose one with rationale, and do not
  > begin migrating onto it.
- **Q2 — migration scope.** Restructure + re-skin **every existing screen**, or adopt the
  pattern for new work and migrate screen-by-screen? This changes the size of the job by an
  order of magnitude and it is a business call, not a technical one.
  > **answer (owner, 2026-09-06): "ค่อยย้ายทีละหน้า"** — *migrate one page at a time.*
  > **Incremental, screen by screen; no big-bang restructure or re-skin.** This is now binding
  > on requirement 5: the plan is ordered per screen, each step independently shippable and
  > independently checkable by the owner's own eyes.
- **Q3 — Next.js version.** The pattern skills target **Next.js 16 + React 19**; the repo is on
  **15.5.4**. Is a Next 16 upgrade in scope, or must the pattern be applied on 15?
  > **answer (owner, 2026-09-06): "อะไรดีกว่าเอาอันนั้น น่าจะ อัปๆ ไปเลย"** — *whichever is better,
  > take that one; probably just upgrade.* The 15-vs-16 call is **delegated to Sober on technical
  > merit**, with the owner's stated lean toward upgrading. State the decision and the reasoning
  > in the SPEC. ⚠️ "Probably upgrade" is a preference, not a licence: the site is live and the
  > upgrade cost has never been assessed. If the answer is "upgrade", it becomes its own
  > sequenced TASK and the assessment goes back to the owner before it runs — C5(b).
  > **follow-up answer (owner, 2026-09-06): "อัปไปเลย"** — *just upgrade.* The ⚠️ above is **CLOSED
  > as to direction**: Next 16 is **approved and in scope**, stated by him, not inferred. (He first
  > sent "ทำบน 15 ก่อน" and corrected himself immediately — the correction is the answer, the first
  > message is superseded; both are on the record in `SYSTEM-FACTS.md` so nobody quotes the stale
  > one.)
  > **second follow-up answer (owner, 2026-09-06): "เอามาให้ดูก่อน"** — *bring it to me to look at
  > first*, answering "does 'อัปไปเลย' mean run it without showing you?". **CLOSED.** Nothing on
  > REQ-001 now waits on the owner except the library pick (C5(a)). Sober: plan the upgrade as its
  > own sequenced TASK with a rollback; Porter shows him that plan before it runs — see C5(b).

**For the SA Lead** (Sober answers here as `> answer: ...`):

- **Q4** — Does the folder pattern conflict with anything already load-bearing in `front/`
  (`contexts/`, `services/api.ts`, `constants/`, `styles/themes.css` + the existing dark/light
  `ThemeToggle`)? If the library brings its own theming, say how it meets the existing one.
  > **answer (Sober, 2026-09-07): yes, in three places — all resolved in `specs/SPEC-001-frontend-foundation.md`
  > §Decision 4 (the full table), which is the answer to this question.** Headline: `contexts/`,
  > `services/api.ts`, `constants/` and `styles/themes.css` are all **kept**. The house pattern
  > also ships **NextAuth 4** and **React Query**, and this SPEC deliberately does **not** adopt
  > either under REQ-001 — replacing DTE's own JWT `AuthContext` is an auth-architecture change
  > with backend consequences, not a folder-structure change (stated deviation, not silent).
  > `contexts/` is **not** renamed to the pattern's `context/` — a singular/plural rename touches
  > every import and buys nothing (stated deviation). On theming: `themes.css` stays the single
  > palette of record and the library's theme is fed **from** it — `ConfigProvider` mounts inside
  > the existing `ThemeProvider` and reads `useTheme().actualTheme` to pick the light/dark
  > algorithm, so the owner's existing `ThemeToggle` keeps working rather than being replaced.
  > Two pre-existing defects found while reading (a hex-vs-`rgb()` mismatch between
  > `tailwind.config.ts` and `themes.css`, and an unused `@headlessui/react`) are recorded in
  > SPEC-001 §Decision 3 — **UNVERIFIED**, found by reading, not by running a build.

**For Porter — NEW, asked by Sober 2026-09-09. NOT blocking: TASK-004 (`/login`) is written and
runnable without it.**

- **Q5 — the form-validation messages.** The house pattern's component library (antd) validates a
  form with a **message string per rule** ("this field is required", "this is not a valid email",
  "the password is too short", …). Those strings are **user-facing Thai copy the owner has never
  given us**, and nobody here invents user-facing copy. The library's own built-in defaults are
  **English**; making them Thai means switching antd's `locale`, which is a whole-site setting and
  produces machine-worded Thai the owner never approved either.
  So: **TASK-004 does not introduce antd's form validation at all** — `/login` keeps exactly
  today's behaviour (the browser's own "please fill in this field" bubble, English or Thai
  depending on the visitor's browser, unchanged from what is live now). That is safe for `/login`,
  which has two fields.
  It stops being comfortable at **`/register`** (TASK-005), which has more fields and real rules.
  What Sober needs before that screen is written, and it is a business/copy call, not a technical
  one: **does the owner want to write the Thai validation messages himself** (Sober will send him
  the exact list of rules that need one, one line each), **or does he want the screens to keep the
  browser's own default bubbles** and no in-form messages at all?
  Porter: this is a question to ask **with the rule list in hand** — Sober will send that list at
  the time TASK-005 is written, so it can go to the owner as a concrete list, not as an abstract
  question. Nothing is needed from him today.

**For the owner — NEW, asked 2026-09-09. NOT blocking anything: TASK-004 is in `REVIEW` and this
does not gate it.**

- **Q6 — `/login` links to `/forgot-password`, a route that does not exist.** Reported to Porter by
  Sober 2026-09-09 as a *finding, not a request*: `front/src/app/login/page.tsx:151` renders a
  "forgot password" link pointing at **`/forgot-password`**, and there is no such route — so it
  **404s on the live site today**. It is **pre-existing**, it was **not** introduced by TASK-004,
  and TASK-004 did not touch it. Nobody here decides what happens to a user-facing feature, so it
  goes to the owner: **build the forgotten-password flow, or drop the link?**
  🔴 Recorded here only because this is where it surfaced — **it is NOT in REQ-001's scope** (this
  REQ is foundation, no product feature, §Out of Scope). If he says "build it", that is a **new
  REQ** with backend work in it, not a widening of REQ-001; if he says "drop the link", that is a
  one-line frontend change and still its own small REQ. Porter writes neither until he answers.
  ⚠️ UNVERIFIED by Porter: nobody here may open the live site (PROTOCOL.md §Environments), so the
  404 is Sober's read of the code, not an observed response.
  > **answer (owner, 2026-09-09): "Q2=ตัดลิงก์ทิ้ง"** — *cut the link out* (`SYSTEM-FACTS.md` **A45**).
  > **He chose DROP THE LINK, not build the flow.** So there is **no forgotten-password feature**,
  > **no backend work**, and the whole of it is removing the link `front/src/app/login/page.tsx:151`
  > renders at `/forgot-password`. 🔴 **Q6 is ANSWERED and CLOSED here.** Exactly as this question
  > framed it, the answer becomes its **own new requirement — `REQ-007-remove-dead-forgot-password-link.md`
  > (`READY_FOR_SA`, 2026-09-09)** — and **REQ-001 is not widened by one line**; nothing in REQ-001's
  > scope, SPEC-001 or SPEC-006 changes because of this answer. ⚠️ The 404 itself stays **UNVERIFIED**
  > (nobody here may open the live site); his answer does not turn a code read into an observation.
  > **What he did NOT say, and nobody guesses:** whether a forgotten-password flow is wanted *later*.
  > He answered the question put to him — remove it today — not the product's future.

- **Q7 — how far does "ทำหน้าตาใหม่ให้ดีขึ้น" go?** Asked 2026-09-09, straight after his correction
  (`SYSTEM-FACTS.md` **A42**). The unambiguous half is already being acted on: **stop restoring the
  old look.** The half his sentence does not settle is the size of "better", and it changes the size
  of the job, so Porter asks instead of choosing:
  **(ก)** the antd default appearance **is already** the "better" he means — take it as it comes,
  the team stops here and only keeps emoji → icons; or
  **(ข)** he wants a **deliberate visual-improvement pass** — someone designs the new look on
  purpose, and **he sees one screen (`/login`) before the other six copy it.**
  Either answer is cheap to act on today; (ข) additionally needs him to say what "better" means to
  him (spacing? colour? the gradient? something he has seen elsewhere?), because **nobody here
  invents the owner's taste**, exactly as nobody here invents his copy.
  ~~🔴 Not blocking: Sober can reverse the restoration on point 1 of A42 without this answer.~~
  🔴 **ESCALATED — now BLOCKING (2026-09-09, Porter).** Sober applied A42's unambiguous half that
  same day (SPEC-001 §Decision 7 struck → §Decision 8; TASK-004's `REWORK` verdict withdrawn), and
  the two answers demand **opposite code on the same four files**. So `TASK-004` is `BLOCKED` on
  this question and **TASK-005…010 stay unwritten** until it lands. What each answer triggers is
  pre-written in `specs/SPEC-001-frontend-foundation.md` §Decision 8; the TASK-side reasoning is
  in `tasks/TASK-004-login-screen-migration.md` §Review addendum (second).
  > **answer (owner, 2026-09-09): "ข ทำ /หน้าแรกเลย และ หน้าคอร์สต่อ ให้ดูก่อน เน้นระยะห่างกับสีให้ดูโมเดิร์น"**
  > — **(ข), the deliberate visual-improvement pass** (`SYSTEM-FACTS.md` **A43**). Three things land
  > with it: **(1)** antd's defaults alone are **not** the finish line; the new look is designed on
  > purpose. **(2)** He **changed the first screen**: not `/login` as this question proposed, but the
  > **home page first, the courses page second**, and he **sees those two before the rest copy the
  > result** ("ให้ดูก่อน"). **(3)** He gave the taste criteria unprompted — **spacing (ระยะห่าง) and
  > colour (สี), aiming at modern (โมเดิร์น)**; those are the only stated criteria and nobody adds to
  > them. 🔴 **Q7 is ANSWERED and no longer blocking.** What it does **not** settle: which page
  > "หน้าคอร์ส" is (→ **Q8** below) and what happens to `/login`/TASK-004 and the order of the
  > remaining SPEC-001 screens — he named a starting order, not a re-plan, and **sequencing and
  > mechanism are Sober's design call alone**. Porter proposes neither.

- **Q8 — which page is "หน้าคอร์ส"?** Asked 2026-09-09, arising from his own Q7 answer (A43). He put
  the courses page second in the visual pass, but the site has more than one candidate: the course
  **list** (`/courses`) and a course **detail** page. Porter will not pick one — the two are
  different screens with different work in them.
  **(ก)** the course **list** page · **(ข)** a course **detail** page · **(ค)** both, list first.
  🔴 **Not blocking:** the first screen he named — the **home page** — is unambiguous, so the pass
  can start today and this answer is only needed before the second screen.
  > **answer (owner, 2026-09-09): "Q1=ก"** — the course **LIST** page **`/courses`**
  > (`SYSTEM-FACTS.md` **A44**). Not (ข) a detail page, not (ค) both. So the "หน้าคอร์ส" of A43 —
  > the **second** screen of the SPEC-006 visual pass — is **`/courses`, and only `/courses`**;
  > a course **detail** page is **not** in the pass he named. 🔴 **Q8 is ANSWERED and CLOSED.**
  > **What it does NOT decide, stated rather than guessed:** **how** Phase 2 is built and **when**
  > it is sequenced against the remaining SPEC-001 screens — **Sober's design call alone**, Porter
  > proposes no mechanism; and it does not rule a detail page out forever — he simply did not put
  > one in this pass, and nobody widens it on his behalf.

**For the owner — NEW, asked 2026-09-09. NOT blocking anything, and NOT in REQ-001's scope.**

- **Q9 — the `/login` "resend verification email" path is dead code.** Reported to Porter by Sober
  2026-09-09 as a *finding, not a request*: `front/src/contexts/AuthContext.tsx` `login()` catches
  every error and returns `false` (l.83–85), so the unverified-email branch on `/login` **can never
  run** — a user whose email is unverified only ever sees **"อีเมลหรือรหัสผ่านไม่ถูกต้อง"** (*wrong
  email or password*), which is not what actually happened to them. It is **pre-existing**, it was
  **not** introduced by TASK-004, and it gates nothing. Nobody here decides the behaviour of a
  user-facing feature, so it goes to the owner: **should an unverified user be told so and offered
  the resend, or is today's single generic message what he wants?**
  🔴 Recorded here only because this is where it surfaced — as with Q6, **it is NOT in REQ-001's
  scope**, and whichever way he answers it becomes its **own new REQ**, never a widening of this
  one. Porter writes nothing until he answers. Detail: `tasks/TASK-004-login-screen-migration.md`
  §Questions **Q2** (Sober's answer).
  ⚠️ **UNVERIFIED by Porter:** this is Sober's read of the code, not an observed login attempt —
  nobody here may open the live site (PROTOCOL.md §Environments).
  > (owner answers here)

## Owner's-eyes gates on the SPEC-006 visual pass — Porter's carry notes

_Written 2026-09-09 by Porter in a housekeeping hop, moving detail off `board.md`
(the hygiene gate caps a board cell at 300 chars). Nothing here is new: the board's
Blocked rows now point at this section. No status changes, no scope changes._

- **Phase 1 — the `/` (home) visual pass.** The **A43 "ให้ดูก่อน" gate is OPEN and still
  UNMET**. His trailing unlabelled **"ผ่าน"** of 2026-09-09 is **not** read as this answer
  (`SYSTEM-FACTS.md` **A46**); the gate was **RE-ASKED, separately labelled**. **Phase 2
  (`/courses`) is no longer gated on it** (§Questions **Q8** answered, A44); **Phase 3
  (TASK-007…010) still is.** Two UNVERIFIED to carry when he looks:
  `tasks/TASK-020-home-look-rulings.md` §Review (the band actually painting) and
  `specs/SPEC-006-visual-improvement-pass.md` §Questions **Q2**.
- **Phase 2 — the `/courses` visual pass.** TASK-006 is `DONE` **on evidence**
  (`tasks/TASK-006-courses-screen-migration-and-visual-pass.md` §Review). Two UNVERIFIED to
  carry: **nobody has scrolled the finished page top-to-bottom** in either theme — the
  preview pane's screenshots went stale after scrolling, so it was shot section by section —
  and **the hero's contrast numbers are the optimistic token-pair bound**, not composited
  over the orbs. The two changes **most likely to read as "new"** to him: the **now-opaque
  sticky filter bar** and the **full-width CTA card** (§Questions Q2 there: keep it).
- **Side effect Porter carries into the Phase-1 look — the `.btn-primary` contrast fix
  (SPEC-006 §R-COLOUR-7, TASK-021).** In the **light** theme the primary button — the Navbar
  included, so **every route** — is visibly **darker** (`#0EA5E9` → `#0369A1`) while the
  Phase-1 gate is still open; **dark resting is byte-identical and does not move.** All four
  states now measure **≥ 5.93:1** in real Chrome. The old **hover ≈1.15:1** "before" number
  stays **UNVERIFIED** — an after-state cannot settle a before-claim
  (`tasks/TASK-021-btn-primary-theme-scoped-accent.md` §Questions **Q1**).
