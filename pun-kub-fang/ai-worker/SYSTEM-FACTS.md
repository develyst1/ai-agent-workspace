# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-09-18, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product, the other developer's work, or how the
> system behaves that is **not** derivable from the code, not a requirement, and not a
> status. Who owns what, which branch is whose, decisions the owner already made, which
> document is authoritative, environment facts.
>
> **The rule that makes it work — Porter's, binding on himself:**
> **When the owner states such a fact, it is written HERE BEFORE the reply is sent.** Not
> after, not "when I update the board", not in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate. If a fact turns out to be
> wrong, strike it and write the correction under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the owner, โด่ง / develyst — the only person who has ever talked to this team** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-09-18)** was read out of the repos on the day the desk opened and is evidence of
> what is *there* — not of any decision. The full survey is
> `../project-docs/as-built-survey-2026-09-18.md`.

---

## Who owns what (owner, 2026-09-18)

- **The front, `pun-kub-fang`, has another owner — a different developer is its main
  owner.** (owner, 09-18, verbatim: *"front มีอยู่แล้ว … มี dev อีกคนเป็นเจ้าของหลัก"*)
  ⇒ we are guests in it. Fern touches only files a TASK names; nobody on the team
  contacts that developer — everything goes through the owner.
- **Our team's job is the backend, primarily.** The front is touched **only at the API
  seam.** (owner, 09-18, verbatim: *"งานเราคือ backend เป็นหลัก; front แตะแค่ตะเข็บ API"*)
- **`pun-kub-fang-back` is entirely ours** — greenfield, **Bun + Hono**. (owner, 09-18,
  verbatim: *"greenfield, Bun + Hono, ของเราเต็มตัว"*)
- ⚠️ **Who the other developer is, which branch they work on, and which branch our seam
  edits land on — NOT stated.** Git shows authors `Develyst` (29 commits), `sss` (23),
  `dev` (4), `wachi9142-cpu` (1, the only commit on `main`), and branches `main · develop ·
  dong · kf · D2` (Marie, read-only survey 09-18). **Nobody infers the person from the
  commit count.** Q1 below.

## Names (owner, 2026-09-18)

- **The real name is `pun-kub-fang` (ปั่นกับฟ่าง).** The parent folder on disk is spelled
  **`pub-kub-fang`** — a typo the owner has chosen to live with; the repos inside it are
  spelled correctly. (owner, 09-18, verbatim: *"โฟลเดอร์แม่สะกด pub- แต่ repo สะกด pun- —
  ชื่อจริงคือ pun-kub-fang"*) ⇒ never "fix" the folder, never write `pub-` into any of our
  files; the paths live in `machine.local.md` only.

## What the front is and does today (Marie, read-only survey 2026-09-18)

- **A smoothie / drinks shop site** — smoothies, Italian soda, milk, tea, coffee, soft
  drinks, snacks, sandwiches, "mix your own", fresh buffet, lucky-drink gacha, promotions.
  **Next.js 16 + React 19 + TypeScript + Tailwind 4 + Ant Design 6** (antd as theme
  provider), `lucide-react` with a hand-written `.d.ts`.
- 🔴 **The front makes NO network call at all.** No `fetch`, no `.env`, no `NEXT_PUBLIC_*`.
  **Every piece of content is a static constant in `src/data/site.ts`** — 3,899 lines,
  148 KB, **imported by 41 files**. ⇒ our API is not replacing a backend; it is the first
  one, and the front has no seam for it yet.
- **The cart persists to `localStorage` and submits nowhere.** There is no checkout, no
  order endpoint being called. An order flow would be **new scope**, not a port.
- **The chat ("ทักฟ่างได้เลย!") is a rule-based local script** (`src/lib/fangAnswers.ts`),
  persisted to `localStorage`. No AI, no backend, no LINE integration. Wiring it is new scope.
- **`merge-workflow.sh` is the Develyst Robot sync script**: from a personal branch it merges
  `develop` in and pushes the branch back into `develop`; refuses to run on `main` or
  `develop`. **The human's, never an agent's.**
- **Branch state on 09-18:** `main` (tip 08-29, `wachi9142-cpu`) · `develop` +53 over main
  (tip 09-17) · `dong` = the owner's, `develop` + 3 (tip 09-18, checked out locally) · `kf`
  identical tip to `develop` · `D2` (`sss`, tip 09-07) **fully contained in `develop`**, 37
  behind — not diverged, dormant. **What each branch is FOR is the owner's to say** (Q1/Q2).

## The back repo (Marie, read-only survey 2026-09-18)

- **Greenfield: one commit ("Initial commit"), a one-line README, a Node-style
  `.gitignore`. Branches `main · develop · dong` already exist, all at that commit; `dong`
  is checked out.** No source, no `package.json`.
- **Stack is decided: Bun + Hono** (owner, 09-18). **Everything else — database, layout,
  migrations, OpenAPI generation, the working branch — is SPEC-001, proposed by Sober,
  decided by the owner, written here.** Until then no scaffold.

## Environments (owner, 2026-09-18)

- **Tanya: full access on local. There is no dev server yet.** (owner, 09-18, verbatim:
  *"local เต็ม ยังไม่มี dev server"*)
- **No production and no real database may be touched by anyone on this team.** (owner,
  09-18, verbatim: *"ห้ามแตะ production/DB จริง"*) Whether the front is deployed anywhere,
  and where, is **not stated** and **not ours to find out by probing** — Q3.
- The day a dev server for our backend exists, it is written here and in PROTOCOL's
  Environments table **before** anyone uses it.

## Team (owner, 2026-09-18)

- **Porter (PM / BA / PO — no UX-writer hat; the front's words are the other developer's)
  · Sober (SA) · Jason (BE — all of the back) · Fern (FE — a guest in the front) · Tanya
  (QA — judges our team's work only).** Chain: Human ↔ Porter ↔ Sober ↔ (Jason, Fern);
  Tanya ↔ Porter. **Nobody on the team talks to the other developer.**

## Open questions for the owner — asked by Porter, answered here

- **Q1 — Who is the other developer, and which branch of `pun-kub-fang` do they work on?**
  Not stated; not inferable from git.
- **Q2 — Which branch do OUR seam edits in the front land on, and who merges them?** Not
  stated. (`dong` is checked out locally and is the owner's; whether that is the answer
  is his to say.)
- **Q3 — Is the front deployed anywhere today, and is there a database behind anything?**
  Not stated; the files show no deployment target and no database.
- **Q4 — Which `site.ts` resource should the API serve FIRST, and is v1 read-only and
  public?** Porter's first REQ needs this; Sober's SPEC-001 needs the second half.
- **Q5 — Should the API mirror the front's bilingual field names as they are (`nameEn` /
  `labelEn` / `en` / `titleEn`, inconsistent) or normalise them?** Sober will propose in
  SPEC-001; the owner decides, because it decides how much of the front Fern must touch.
