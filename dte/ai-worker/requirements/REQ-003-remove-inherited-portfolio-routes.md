# REQ-003: Remove the inherited portfolio-site routes from the DTE frontend
- Status: SPEC_DONE — **acceptance-checked by Porter 2026-09-09: AC 1–5 MET, AC 6 MET WITH ONE GAP,
  AC 7 NOT MET** (it is the owner's own eyes and no one on this team may substitute for it).
  Deliberately **not** `DELIVERED`. See §"Porter's acceptance check (2026-09-09)" at the end of
  this file. (The header read `READY_FOR_SA` until 2026-09-09 — stale; `board.md` had it right.)
- Priority: MEDIUM — scheduled **after REQ-001** (owner, 2026-09-07: "foundation first"; `SYSTEM-FACTS.md` A12)
- Requested: 2026-09-07 by the owner (develyst)
- Deadline: none stated

## Problem / Goal

`front/src/app/` contains four public routes that are not part of DTE — they read as a
software-agency portfolio site (`/portfolio`, `/services`, `/contact`, `/blog`). They are
live: production runs the tip of `develop` (`SYSTEM-FACTS.md` A4), so real visitors can
reach these pages today and they misrepresent what DTE is.

The owner was shown read-only evidence that these routes really are in the `dte` repo (he
had believed they belonged to another project) and answered in one word: **"ลบ"** — delete
them (owner, 2026-09-07; `SYSTEM-FACTS.md` A8).

Goal: DTE's public site stops serving pages that belong to a different product.

## The owner's own words (verbatim — evidence of intent)

> Question put to him 2026-09-07: *"`/portfolio`, `/services`, `/contact`, `/blog` มีอยู่จริงใน
> repo dte — จะให้เก็บไว้ หรือ ลบทิ้ง?"*
>
> **"ลบ"** (owner, 2026-09-07)

## Requirement

1. The system must no longer serve the routes `/portfolio`, `/services`, `/contact` and
   `/blog` on the DTE frontend.
2. Supporting code that exists **only** to serve those four routes must go with them, so the
   codebase does not keep dead files. Read-only survey 2026-09-07 found
   `front/src/constants/portfolio.ts` and `front/src/constants/services.ts`; whether anything
   else qualifies is a technical determination, not a business one.
3. No link anywhere in the frontend may point at a removed route. Read-only survey 2026-09-07
   found links in `front/src/components/Footer.tsx` (→ `/services`, `/portfolio`, `/contact`)
   and in `front/src/app/verify-email/page.tsx` (→ `/contact`). What each of those links
   becomes instead — removed, or repointed at a DTE page — is a design call for Sober.
4. No route that DTE actually uses may break: `/`, `/courses`, `/classroom`, `/teach`,
   `/login`, `/register`, `/verify-email` must keep working exactly as before.
5. A visitor arriving on an old link to `/portfolio`, `/services`, `/contact` or `/blog` must be
   **redirected to the home page `/`** — not shown a 404 (owner, 2026-09-07: "redirect", answering
   a question whose only redirect target was the home page; `SYSTEM-FACTS.md` A11). *How* the
   redirect is implemented, and whether it is permanent or temporary, is Sober's technical call.
6. `/about` is **kept** and is DTE's own About page (owner, 2026-09-07: "about for DTE";
   `SYSTEM-FACTS.md` A10). Nothing in this REQ deletes it or rewrites its wording — see
   §Out of Scope.

## Acceptance Criteria

- [x] Requesting `/portfolio`, `/services`, `/contact`, `/blog` on a locally running `front/`
      no longer returns one of the inherited pages — with the actual command and its output
      recorded in the TASK's `## Implementation Notes` (PROTOCOL.md "Evidence").
- [x] `front/` builds clean and there is no remaining import of a deleted file — evidenced by
      the build/typecheck command and its output, not by reading the code.
- [x] Grepping the frontend finds no link or nav entry pointing at a removed route.
- [x] Requesting each of the four removed routes on a locally running `front/` lands on `/`
      (redirect, not 404) — command and its output recorded in the TASK's `## Implementation Notes`.
- [x] `/about` still loads locally and its content is unchanged by this REQ.
- [~] The routes listed in requirement 4 still load locally — evidence recorded the same way.
      **6 of 7 evidenced 200; `/classroom/[id]` NOT exercised (auth-guarded, no local session).**
- [ ] ⏳ **OPEN — his alone, asked 2026-09-09 (§Questions Q4).** The owner has seen the change on his own eyes before it reaches production. There is no
      QA role here and no agent may touch production; deployment is his alone.

## Constraints

- C1 — **Live product.** Production serves the tip of `develop` (`SYSTEM-FACTS.md` A4), so
  these pages are reachable by real users right now. Removal is a user-visible change to a
  live site; it is not a refactor.
- C2 — Frontend only. `front/` is Fern's area via Sober's TASK; nothing in `back/` is in
  scope for this REQ.
- C3 — Work lands as edited files on `develop`. No agent commits, deploys, or touches
  production (PROTOCOL.md "Environments").
- C4 — This REQ is independent of REQ-001. It must not be folded into the component-library
  migration or the Next 16 upgrade: those are gated on the owner's approval, this is not.

## Out of Scope

- **Rewriting `/about` into DTE's own About copy.** The owner ruled that `/about` stays and is
  "about for DTE" (`SYSTEM-FACTS.md` A10), but he did **not** supply the Thai copy for it, and
  nobody may invent user-facing text. This REQ leaves the page exactly as it is; the rewrite needs
  his words first — a content DATA REQUEST Porter carries, tracked on the board.
- Any redesign, restyling, or component-library work on the pages that remain (that is REQ-001).
- Any backend change, including the `4013` port correction (a separate item — `SYSTEM-FACTS.md`
  A2/A7).

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`.) **Q1–Q3 were ANSWERED 2026-09-07 and nothing
in the BUILD is blocked. Q4, added 2026-09-09, is the owner-eyes acceptance criterion and it is OPEN —
it blocks `DELIVERED`, nothing else.**

- **Q1 (owner) — `/about`.** `front/src/app/about/` also exists and was not in the question he
  answered with "ลบ". Does it go too, or does DTE keep an About page?
  > Asked 2026-09-07, verbatim:
  > "อีกหน้าหนึ่งที่ผมไม่ได้ถามไปคือ `/about` ครับ — จะให้ลบด้วย หรือเก็บไว้เป็นหน้า About ของ DTE?"
  > **answer (owner, 2026-09-07): "about for DTE"** — `/about` **stays**, as DTE's About page; it is
  > NOT deleted. Folded into §Requirement 6. He gave no About copy, so the page's wording is
  > untouched here (§Out of Scope). `SYSTEM-FACTS.md` A10.
- **Q2 (owner) — redirect or 404.**
  > Asked 2026-09-07, verbatim:
  > "หน้าที่ลบไปแล้ว ถ้ามีคนกดลิงก์เก่าเข้ามา จะให้ขึ้น 404 ไปเลย หรือให้ redirect กลับหน้าแรกครับ?"
  > **answer (owner, 2026-09-07): "redirect"** — the only redirect target in the question was the
  > home page, so it binds: old links **redirect to `/`**. Folded into §Requirement 5; mechanism and
  > permanent-vs-temporary are Sober's call. `SYSTEM-FACTS.md` A11.
- **Q3 (owner) — priority.**
  > Asked 2026-09-07: "งานลบหน้าพวกนี้ จะให้ทำก่อน หรือหลัง งาน frontend foundation (REQ-001) ครับ?"
  > **answer (owner, 2026-09-07): "foundation first"** — REQ-001 first, this REQ after. Ordering
  > only: it does not merge the two (§Constraints C4) and does not gate this SPEC. `SYSTEM-FACTS.md` A12.

- **Q4 (owner) — the last acceptance criterion, AC 7: his own eyes.** ⏳ **OPEN, asked 2026-09-09.**
  Everything else on this REQ is evidenced and closed; this one cannot be closed by anyone on this
  team (no QA role, no agent touches production). Asked in Thai, 2026-09-09, verbatim:
  > "REQ-003 (ลบหน้า `/portfolio` `/services` `/contact` `/blog`) ทำเสร็จและมีหลักฐานครบแล้วบนเครื่อง local ครับ
  > เหลืออย่างเดียวคือตาของพี่เอง — เปิด `front/` บนเครื่องพี่แล้วดู 3 อย่าง: (1) พิมพ์ 4 path เก่า แล้วต้องเด้งกลับหน้าแรก
  > (2) **Footer** ตอนนี้เหลือลิงก์ "About" อันเดียว ในแถวที่เคยมี 4 อัน หน้าตาโอเคไหม (3) หน้า `/verify-email`
  > หายไปหนึ่งบล็อกท้ายการ์ด (`มีปัญหา? / ติดต่อฝ่ายสนับสนุน`) โอเคไหม — ตอบ `Q1=ผ่าน` หรือ `Q1=ไม่ผ่าน` + สิ่งที่ต้องแก้"

  Two things were said to him in the same breath, so his one word can never be over-claimed later:
  **(a)** the live site `dte.develyst.online` **still serves all four inherited pages** and will until
  he ships it himself — `DONE` is not deployed; **(b)** `/classroom/[id]` was never exercised (AC 6's
  gap), so if he happens to open a classroom while looking, a word on it is welcome — but it is
  **not** part of the pass/fail he is being asked for.

## Porter's acceptance check (2026-09-09)

Done on the handover Sober made when he closed SPEC-003 and TASK-014. **This check reads recorded
evidence; it runs nothing.** Porter writes no code and opens no terminal on the repo — every verdict
below is scored against a command and its actual output already written into a SPEC or TASK file,
and where the only evidence is somebody's claim it is scored as a claim. Verdicts in the order the
criteria are written above:

| # | Acceptance criterion | Verdict | Where the evidence is |
|---|---|---|---|
| 1 | The four removed paths no longer return an inherited page, with command + output | **MET** | `tasks/TASK-014-remove-inherited-portfolio-routes.md` §Implementation Notes 1, 2 and 4 — `ls src/app \| sort` shows the four directories gone, the `npm run build` route table lists **9 routes and none of the four**, and each path answers **307**. Sober re-ran all of it himself on his own dev server (§Review 1, 2, 4) rather than reading Fern's paste. |
| 2 | `front/` builds clean, no remaining import of a deleted file, evidenced by command output | **MET** | `npm run build` **exit 0** and `npx tsc --noEmit` **exit 0**, pasted by Fern and **re-run by Sober** (§Review 2–3). Fern's first attempt failed on Next's own stale generated `.next/dev/types/validator.ts`; she deleted that one **generated** file (outside `src/`) and declared it — **no source file was bent to make the build green**, and Sober confirmed it regenerates clean. |
| 3 | Grepping the frontend finds no link or nav entry pointing at a removed route | **MET** | §Implementation Notes 6 — the specified grep returns no lines, `exit=1`. Sober additionally ran **three wider greps nobody asked for** (`ติดต่อฝ่ายสนับสนุน\|Help Text`, `constants/portfolio\|constants/services`, `/portfolio\|/blog\|href="/contact"`) across `src/`, all empty (§Review 6). |
| 4 | Each removed route lands on `/` — redirect, not 404 — with command + output | **MET** | §Implementation Notes 4 — all four answer **307 `location: /`** (`permanent: false`, so nothing is cached in a visitor's browser forever). `/blog/` with a trailing slash reaches `/` in **two** hops: Next's own built-in 308 → `/blog`, then our 307 → `/` (`final_code=200 hops=2`). Fern pasted the raw output instead of paraphrasing it into agreement with the SPEC, asked about it (§Questions Q1) instead of "fixing" the config, and **the wrong statement turned out to be Sober's, in SPEC-003 §Flow, now corrected there**. Reproduced by Sober (§Review 4). |
| 5 | `/about` still loads and its content is unchanged by this REQ | **MET** | §Implementation Notes 8 — `/about` **200**, no file under `src/app/about/` edited or deleted, both strays (`page-new.tsx`, `page.tsx.backup`) still on disk. Sober re-checked by **file mtime**, not by claim: the only two `front/src` files this TASK changed are `Footer.tsx` and `verify-email/page.tsx` (§Review, Spec conformance). |
| 6 | The routes of §Requirement 4 still load locally, evidenced the same way | **MET WITH ONE GAP** | Six of the seven are evidenced **200** on a local dev server, twice (§Implementation Notes 5, re-run at §Review 5): `/`, `/courses`, `/teach`, `/login`, `/register`, `/verify-email`. **`/classroom/[id]` was NOT exercised** — it is auth-guarded and needs a real session and a real course id, and Fern correctly **invented neither**. It appears as `ƒ (Dynamic)` in the build table and imports nothing this TASK touched, which is an argument, not evidence. Scored honestly as a gap, not ticked. |
| 7 | The owner has seen the change with his own eyes before it reaches production | **NOT MET — his alone** | There is **no QA role on this project** and no agent may touch production, so nobody here can close this half. Put to him in Thai on 2026-09-09 (§Questions Q4 below). Until he answers, this criterion stays open and REQ-003 stays `SPEC_DONE`. |

**Verdict: the removal is done and evidenced on `develop`, but REQ-003 is NOT `DELIVERED`.** Two
criteria are open and neither can be closed by this team: AC 7 in full, and the `/classroom/[id]`
half of AC 6. The precedent is REQ-004, where the same owner-eyes criterion waited until he looked
and answered `ผ่าน` (`SYSTEM-FACTS.md` A33) — it was never ticked on his behalf, and this one will
not be either.

⚠️ **`DONE` is not deployed, and this is the thing to say out loud.** `dte.develyst.online` **still
serves all four inherited pages today** and will keep serving them until the owner ships the change
himself (`SYSTEM-FACTS.md` A4 + PROTOCOL.md §Environments). Nothing in the table above is true for
real users yet; every 307 and every 200 came from a local dev server.

**The three UNVERIFIED items Sober carried up are accepted as written, not laundered:** the live
site (above), `/classroom/[id]` (AC 6's gap), and **how the Footer and the `/verify-email` card now
LOOK** — the Footer holds a single "About" link inside a `justify-center space-x-6` row that was
built for four, and `/verify-email` lost a block from the bottom of its card. Both build and answer
200; whether either now reads as wrong is a layout question **no exit code can answer**, which is
exactly what Q4 asks him.
