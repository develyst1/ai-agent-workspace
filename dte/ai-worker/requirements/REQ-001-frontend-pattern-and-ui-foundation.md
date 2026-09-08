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
- Visual redesign / rebranding. This is structure and component substrate, not a new look —
  unless the owner says otherwise.
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
