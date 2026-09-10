# SPEC-004: Unify the browser page titles across the DTE frontend
- Source: REQ-005
- Status: **DONE** — 2026-09-09. **All three units are `DONE`**: TASK-015 (Part A), TASK-016 (four
  of Part B's five routes) and **TASK-017** (the fifth, `/classroom/[id]` = `ห้องเรียน`), each
  reviewed by Sober with no rework. **Every route on the site now renders
  `<page name> | DTE — Develyst The Education` except `/`, which stays one-part per A31** — the end
  state REQ-005 asked for. **REQ-005 is `SPEC_DONE`**; Porter's acceptance check is next. `DONE` ≠
  deployed, and 3 UNVERIFIED items ride along to the owner (TASK-017 §Review).
- Written: 2026-09-09 by Sober (SA Lead) · **updated 2026-09-09** (Q1+Q2 answered, Decision 4 made
  concrete, Decision 6 added, TASK-016 written) · **updated 2026-09-09 at TASK-016's review**
  (TASK-016 `DONE`; Decision 6's word supplied by A37) · **updated 2026-09-09 at TASK-017's review**
  (TASK-017 `DONE`; SPEC closed; §Flow step 5 + edge case (c) made final)

## Overview

Every route's `<title>` must read **`<page name> | DTE — Develyst The Education`**, except `/`,
which stays exactly **`DTE — Develyst The Education`** — both strings owner-stated
(`SYSTEM-FACTS.md` **A29** shape, **A30** string, **A31** `/`). Nothing here is inferred.

**Approach: one Next.js `title.template` in the root layout, not nine literals.** REQ-005 C2
explicitly leaves the mechanism to me. The template writes the site part **once**, so no route can
drift out of the form and a future route conforms by default — that is REQ-005 §Requirement 1
("one single, written-down form") enforced by the framework instead of by vigilance. The rejected
alternative was editing each page's literal: it duplicates the em-dash string across files, and
every duplication is a place a later edit can diverge silently.

**Single-side change: `front/` only, one owner (Fern).** Nothing in `back/` is touched (REQ-005
C1), so **this SPEC declares no BE↔FE contract** — no HTTP surface, no field casing to settle.

**It splits into two parts because only one of them is fully owner-stated:**

- **Part A — the 3 routes that already have a title of their own.** Fully determined by A30/A31.
  Tasked now as **TASK-015**.
- **Part B — the 5 routes that have NO title of their own** (they are `'use client'`, so they
  cannot export `metadata` and inherit the root default). Giving them a title requires a **page
  name in Thai for each**, which the owner has not stated. REQ-005 §Requirement 4 says such routes
  are **reported, not silently given one**. **No TASK is written for Part B until he states the
  five names** — see §Questions Q1.

## Enumeration — what the tree actually renders today

Read-only, by me, against `front/` on `develop`, 2026-09-09. The repeatable commands and their
real output are in `tasks/TASK-015-unify-page-titles-front.md` §Enumeration evidence.

| # | Route | Source file | Title it renders TODAY | Part |
|---|---|---|---|---|
| 1 | `/` | `src/app/page.tsx:18` (overrides layout) | `DTE — Develyst The Education` | A — **unchanged** |
| 2 | `/about` | `src/app/about/page.tsx:13` | `เกี่ยวกับเรา \| DTE Platform` | A |
| 3 | `/courses` | `src/app/courses/page.tsx:14` | `ทักษะทั้งหมด \| DTE Platform` | A |
| 4 | `/login` | `src/app/login/page.tsx` — **`'use client'`, no `metadata`** | inherits `DTE — Develyst The Education` | **B** |
| 5 | `/register` | `src/app/register/page.tsx` — **`'use client'`** | inherits `DTE — Develyst The Education` | **B** |
| 6 | `/teach` | `src/app/teach/page.tsx` — **`'use client'`** | inherits `DTE — Develyst The Education` | **B** |
| 7 | `/verify-email` | `src/app/verify-email/page.tsx` — **`'use client'`** | inherits `DTE — Develyst The Education` | **B** |
| 8 | `/classroom/[id]` | `src/app/classroom/[id]/page.tsx` — **`'use client'`** | inherits `DTE — Develyst The Education` | **B** |

That is **every route in `front/src/app/`** — 8 routes (the root `src/app/layout.tsx:22` is the
fallback, not a route). There is **no `generateMetadata` anywhere** and **no nested `layout.tsx`**,
so the table above is the complete metadata surface.

The four inherited portfolio routes are **already gone** (TASK-014, `DONE` 2026-09-09), so
REQ-005 §Out of Scope's "if REQ-003 lands first they simply are not in the enumeration" is the
case that applies. `/portfolio` `/services` `/contact` `/blog` are `redirects()` entries in
`front/next.config.ts` and have no title of their own — correctly absent from this table.

**Two non-route files carry the same old title string and are NOT touched:**
`src/app/about/page-new.tsx:13` and `src/app/about/page.tsx.backup` — the stray About files Porter
already carries as housekeeping (SPEC-003 §Questions Q2). Neither is a Next route (`page-new.tsx`
and `.backup` are not route filenames), so neither renders a tab. Editing them is not in this
SPEC; **an engineer must not "fix them while in there".**

## API / Interface Design

None. This SPEC changes no HTTP surface. The only interface it touches is the browser tab.

## Data Model

None. No table, column, migration or SQL. Nothing goes near any database.

## Design decisions

**Decision 1 — the root layout owns the site part, via `title.template`.**
`front/src/app/layout.tsx` `metadata.title` becomes the object form:

```ts
title: {
  default: "DTE — Develyst The Education",
  template: "%s | DTE — Develyst The Education",
},
```

Both literals use the **A19 em dash U+2014** (bytes `e2 80 94`) inside the site part, and an ASCII
pipe `|` (byte `7c`) as the separator between the two parts — I verified the em dash as bytes on
today's `layout.tsx:22` and `page.tsx:18`. A hyphen, an en dash or an `&mdash;` entity is a defect.

**Decision 2 — `/page.tsx` must DROP its `title` key.** This is the one trap in this design and
the reason it is written down. Next.js applies the root `template` to **any child segment that
sets a string title, including the home page**. `src/app/page.tsx:18` currently sets
`title: 'DTE — Develyst The Education'`; left alone it would render
`DTE — Develyst The Education | DTE — Develyst The Education`, which violates **A31**. Removing
just that one key (its `description` on line 19 stays) makes `/` fall through to `default`, which
is exactly A19. `title: { absolute: ... }` would also work and is **rejected** — it re-duplicates
the string Decision 1 exists to centralise.

**Decision 3 — Part A pages set only their own name.** `/about` → `title: 'เกี่ยวกับเรา'`,
`/courses` → `title: 'ทักษะทั้งหมด'`. The page names are **today's own words, unchanged**; this
REQ unifies the tail, it does not rename pages (REQ-005 C2, copy only).

**Decision 4 — Part B's mechanism: one pass-through server `layout.tsx` per route.**
*(Written 2026-09-09 as "specced but NOT tasked"; **tasked 2026-09-09 as TASK-016** for four routes
once the owner named them — A34. The mechanism below is unchanged from the original text.)*

A `'use client'` page cannot export `metadata`; the only route-local fix is a tiny **server**
`layout.tsx` beside it exporting `export const metadata = { title: '<page name>' }` and returning
`children` untouched, with the root template supplying the tail. Verified against the tree
2026-09-09: none of these route folders has a `layout.tsx` today, so each is a new file and nothing
is overwritten. The layout must **not** carry `'use client'`, must render no wrapper element (the
root layout already provides `html`/`body`/`Navbar`/`main`/`Footer`), and must set **only** `title`.

**Rejected alternative:** converting each page into a server component that renders a client child.
It works, but it is a component-architecture change on four live, auth- and form-carrying pages to
achieve a copy fix — exactly the redesign REQ-005 **C2** forbids.

**The page names are the owner's, copied byte-for-byte, never retyped:** `/login` → `เข้าสู่ระบบ`,
`/register` → `สมัครสมาชิก`, `/teach` → `สอน`, `/verify-email` → `ยืนยันอีเมล` (**A34**). Nobody here
may re-word, expand or shorten them (REQ-005 §Requirement 4); TASK-016 DoD 3 checks their bytes.

**Decision 6 — `/classroom/[id]` is deliberately left one-part, and that is not an omission.**
The owner chose the **rule** — one shared fixed name for every classroom, per-course title
**rejected** (`SYSTEM-FACTS.md` **A35**, `ชื่อกลาง`) — but not the **word**. REQ-005 §Requirement 4
forbids anyone here inventing it, so the route was **excluded from TASK-016** and kept rendering
`DTE — Develyst The Education`. TASK-016 §Review confirms it stayed that way: no layout file under
`classroom/`, the page's mtime unchanged, and `/classroom/7` still one-part on a local server.

> **UPDATE 2026-09-09 (at TASK-016's review) — the word has arrived and this decision is now
> actionable.** The owner answered REQ-005 §Open questions **Q3** with **(ก)**: the shared name is
> **`ห้องเรียน`** (`SYSTEM-FACTS.md` **A37**), one fixed name on every classroom, so the tab reads
> **`ห้องเรียน | DTE — Develyst The Education`**. `เรียน` and `บทเรียน` were rejected, and the
> per-course title stays rejected (A35). This is exactly what Decision 6 anticipated: a **fifth file
> of the identical shape** — one more pass-through server `layout.tsx` under
> `src/app/classroom/[id]/` setting `title` only — **no new mechanism, no `generateMetadata`, no
> re-design**. It becomes its own TASK; nothing already `DONE` is reopened. Until that TASK is
> written and built, the route legitimately still renders one part.

> **TASKED 2026-09-09 as TASK-017** (`tasks/TASK-017-classroom-page-title.md`, Fern, `TODO`).
> Re-verified against the repo the same day: `src/app/classroom/[id]/` still holds **only**
> `page.tsx`, so the layout is a new file and nothing is overwritten. The TASK carries A37's word as
> **bytes** (27 bytes, 9 code points, transcribed from `SYSTEM-FACTS.md` A37 itself) so it is copied,
> never retyped — the same discipline that held for A34. Two of its checks exist to hold A35's
> *rule* and not merely A37's word: no `generateMetadata`/`params` in the file, and the identical
> title proved on at least three different ids.

Until the word was stated, an engineer who added a name for it — however obvious — would have
introduced a defect, not shown initiative. **That held during TASK-016 and Fern respected it**,
including for the obvious `ห้องเรียน`. It is now stated, and only by the owner.

**Decision 5 — body copy is out of scope.** `DTE Platform` also appears as **visible page copy** in
six places (`/about` ×2 including a table header, `/login:86`, `/register:193`, `/teach:104`, plus a
comment in `src/services/api.ts:1`). REQ-005 is page titles only, and none of these is the
superseded name, so REQ-004 C4 is not reopened. **Not changed**; reported to Porter in §Questions
Q2 as an observation, not a request.

## Flow

1. Root layout gains `default` + `template` (Decision 1).
2. `/page.tsx` loses its `title` key → `/` renders `default` = A19, unchanged (Decision 2).
3. `/about` and `/courses` keep their own name only → the template appends the shared tail.
4. The 5 client routes are untouched by TASK-015 and keep rendering `default` — a **one-part**
   title, correct for `/` and not yet correct for them. That is the visible state of Part B being
   blocked, and it is not a defect of TASK-015.
5. **(added 2026-09-09, TASK-016.)** Four of those five gain a pass-through `layout.tsx` setting
   their own name (Decision 4), so their tabs become two-part. `/classroom/[id]` stays one-part
   (Decision 6). `/` must remain one-part throughout — TASK-016 DoD 8 proves it, because a template
   applied to a title `/` should not have is the one way this design fails silently.
6. **(added 2026-09-09, TASK-017 — final state.)** The fifth route gains the identical
   pass-through layout with `title: 'ห้องเรียน'` (A37). **All 8 app routes are now two-part except
   `/`**, verified live by Fern and re-verified by Sober at review. Nothing further is planned in
   this SPEC.

**Edge cases.** (a) Next's built-in 404 page keeps its own framework title — no `not-found.tsx`
exists, and creating one is a new page, not a title fix: out of scope. (b) `/teach` and
`/classroom/[id]` are auth-guarded in the client, but their `<title>` comes from the
server-rendered head, so it is checkable without a session. (c) `/classroom/[id]` renders one title
for every id — a per-course title would need `generateMetadata` on a server component, which is the
metadata-architecture redesign REQ-005 C2 forbids. **(settled 2026-09-09 at TASK-017's review, from
Fern's Q1.)** A **non-numeric** id is **not** an error case for the title: `[id]` is a plain string
segment, nothing in the route parses it as a number, and the layout never reads `params` — so
`/classroom/1`, `/7` and `/abc` all return **HTTP 200 with the byte-identical title** (proved twice,
by Fern and again by Sober). What the page *body* does with such an id is a separate question and
outside REQ-005.

## Non-functional

No auth, validation, performance or logging change. No new dependency. No route added or removed.
No production contact of any kind (REQ-005 C3): evidence comes from a **local** dev server only.

## Tasks

- **TASK-015**: Unify the page titles in `front/` — template + 3 routes — owner: **FE (Fern)**
  (depends on: —) — **DONE**, reviewed 2026-09-09, no rework.
- **TASK-016**: Part B page titles — the four owner-named client routes (`/login`, `/register`,
  `/teach`, `/verify-email`) — owner: **FE (Fern)** (depends on: TASK-015 ✅) — **DONE**, reviewed
  2026-09-09, no rework; all 12 DoD checks re-run by Sober — see TASK-016 §Review.
- **TASK-017**: Part B's fifth route — the `/classroom/[id]` page title (`ห้องเรียน`, **A37**) —
  owner: **FE (Fern)** (depends on: TASK-015 ✅, TASK-016 ✅) — **DONE**, reviewed 2026-09-09, no
  rework; all 14 DoD checks re-run by Sober (byte-match against A37, build 0, `tsc` 0, 8/8 titles
  live, 3 ids identical, `/` pipe-free, 14 `DTE Platform`, emoji 124, mtimes = the one new file) —
  see TASK-017 §Review. It was the SPEC's **last unit**.

**All units `DONE` → SPEC-004 is `DONE` and REQ-005 is `SPEC_DONE`** (2026-09-09).

## Questions

**Q1 → Porter, for the owner. BLOCKING Part B only** (Part A ships without it).
Five routes have **no page name at all** today — `/login`, `/register`, `/teach`, `/verify-email`,
`/classroom/[id]`. A30's form is `<page name> | DTE — Develyst The Education`, and the `<page name>`
half of it does not exist for these five. REQ-005 §Requirement 4 says they are reported, not
silently named, so I am reporting them and **not** proposing words: the four Thai names and one
rule are his to write, one line each.

- `/login` — ? · `/register` — ? · `/teach` — ? · `/verify-email` — ?
- `/classroom/[id]` — this one is a **rule, not a name**: every course opens on the same route, so
  either all classrooms share one fixed name, or the tab shows the course's own title (a bigger
  change — see §Flow edge case (c) — which he would have to ask for explicitly).

⚠️ Not mine, not Porter's, not Fern's to settle. Until it is answered the five keep reading
`DTE — Develyst The Education` and **no file for them is edited**.

> **answer (owner, via Porter) — Q1 is FULLY CLOSED, both halves. No longer blocking anything.**
> The four names came as **A34**: `/login` = `เข้าสู่ระบบ` · `/register` = `สมัครสมาชิก` ·
> `/teach` = `สอน` · `/verify-email` = `ยืนยันอีเมล` (built as TASK-016). The `/classroom/[id]`
> **rule** came as **A35** (one shared fixed name, per-course title rejected) and its **word** as
> **A37** (`Q1=ก`): `ห้องเรียน` (built as TASK-017). Every one of the five is now named by the
> owner and none was invented here — REQ-005 §Requirement 4 held end to end.

> **ANSWERED IN HALVES 2026-09-09** — Porter relayed the owner's words in
> `requirements/REQ-005-unify-page-titles-site-wide.md` §Questions (he may not write in `specs/`);
> the facts are `SYSTEM-FACTS.md` **A34** and **A35**.
> **First half — closed.** `/login` → `เข้าสู่ระบบ` · `/register` → `สมัครสมาชิก` · `/teach` → `สอน` ·
> `/verify-email` → `ยืนยันอีเมล` (A34, mapped positionally in the order this question listed them).
> Those four are now **TASK-016** (`TODO`, Fern) — see §Decision 4.
> **Second half — still open, and it is the WORD not the rule.** `Q2=ชื่อกลาง` (A35) picks the
> branch *one shared fixed name*, and **rejects** the per-course title; it does not say what that
> name reads. So `/classroom/[id]` is **excluded from TASK-016** (§Decision 6) and stays one-part
> until the owner writes the word — REQ-005 §Open questions **Q3**, with him now. **Nobody invents
> it**, and I am not proposing one here either.

**Q2 → Porter. NOT blocking anything — an observation to carry, or to drop.**
`DTE Platform` survives as **visible page copy** in six places (Decision 5), so after TASK-015 the
tabs will read `DTE — Develyst The Education` while the `/about` comparison table and the
`/login` · `/register` · `/teach` headings still read `DTE Platform` on screen. That is **outside
REQ-005** and I have changed none of it. If the owner wants it, it is a new REQ; if he does not,
nothing happens and nobody re-raises it.

> **ANSWERED 2026-09-09 (Porter, from the owner):** `เปลี่ยน` = **change them** (`SYSTEM-FACTS.md`
> **A36**). By this SPEC's own framing that is **outside REQ-005**, so it widens nothing here: it
> became **`requirements/REQ-006-replace-dte-platform-body-copy.md`** (`DRAFT`, blocked on what they
> change *to*). **Nothing in SPEC-004, TASK-015 or TASK-016 changes because of it** — the six
> body-copy lines stay exactly as they are, and **TASK-016 DoD 9** exists to prove Fern did not
> "helpfully" touch them while working in the same folders. Closed here; the follow-up lives in
> REQ-006.

*(Engineers ask here; I answer as `> answer: ...`)*
