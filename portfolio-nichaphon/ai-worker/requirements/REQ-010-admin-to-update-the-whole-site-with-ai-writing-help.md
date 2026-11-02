# REQ-010: Admin system — the owner updates 100% of the site himself, with AI help to write
- Status: DELIVERED (2026-11-01, Porter — on TEST-011 `TEST_PASSED` after TASK-042) · **SIGNED OFF 2026-11-01 by the owner: "ไปต่อให้จบเลย"** (in chat, answering "Do you sign off on REQ-010?") · uncommitted on `D1`, not deployed · **cannot go public until Q2 login** (deferred by him) — §Delivery
- Priority: HIGH
- Requested: 2026-11-01 by the owner (Dong), in chat to Porter
- Deadline: none

## The ask, in his words `[operator]`

> *"ฉันคิดว่า ข้อมูลพวกนี้บนเว็บอ่ะ มันเก่าเกินไปแล้วฉันก็อัปเดตตลอดๆ ไม่ไหว"*
> *"… อีกอย่างที่อยากให้ทำ คือ ระบบ admin ของฉันที่ อัปเดตหน้าเว็บ ได้ร้อย% เพื่ออัปเดตได้ล่าสุดตลอด และ ง่าย
> เพราะ มีเอไอช่วย เขียนข้อความ ได้"* — owner, 2026-11-01

One sentence (Porter): he wants a private admin where he can change everything the site shows, easily, with AI
drafting the words, so the site (and the Home AI that answers from it) is always current without a developer.

## Problem / Goal

Today every word on the site lives in the code (`front/src/constant/…`) and the Home AI answers from two
Markdown files under `back/knowledge/`. Any change needs a developer, a build and his deploy, so the site has
gone stale (seen 2026-11-01: /blog shows 6 "Develyst Team" posts dated Dec 2024–Jan 2025 that cannot be
opened; certificate years all 2025). Goal: he changes content in minutes, and the change is live and known to the
Home AI.

## Owner decisions — 2026-11-01

His reply to Q1, verbatim: *"ตามนั้นเกือบหมด ยกเว้น login รอก่อนเดี๋ยวค่อยกลับมาคุย"* `[operator, 2026-11-01]`
- Q1 (b)(c)(d)(e)(f) **approved as written** (his word "ตามนั้น" on the pack below).
- Q1 (a) login **NOT decided — deferred by him** ("รอก่อน เดี๋ยวค่อยกลับมาคุย"). → Q2.
- Q44 ("database later", 2026-09-09) is **superseded**: (c) approved = a database now.

## Requirement

1. `[operator: wants it his, (a) deferred]` The admin is for him alone. **How he gets in is undecided (Q2).**
   `[PM-decided]` Until Q2 is answered, the admin must not be reachable from the public internet: it runs
   locally only, and the public site must not expose any way to change content.
2. `[operator, Q1 b]` Every text and picture on all 6 pages can be changed there: headline, experience, skills,
   services, projects with pictures, certificates, client screenshots, contact details — and **real blog posts he
   writes there, each with its own page** (today's 6 sample posts are replaced by whatever he writes).
3. `[operator, Q1 c]` Content is stored in a database. Which one: the SA's call.
4. `[operator, Q1 d]` On Save, the public site shows the change within one minute — no rebuild, no deploy by him.
5. `[operator, Q1 e]` AI helps write: he types a rough note in Thai or English, the AI proposes text, he edits and
   approves; **the AI never publishes by itself**. Calls go through his gateway.
6. `[operator, Q1 f]` Visitors see the site in English. He may brief the AI in Thai and get English text back.
7. `[PM-decided]` The Home AI answers from the same content he edits, so one Save refreshes both the page and
   what the AI knows.
8. `[PM-decided]` Moving today's content in: everything the site shows on 2026-11-01 is in the admin on day one,
   unchanged, so nothing disappears when the switch happens.

## Acceptance Criteria

- [ ] AC-a (R2, R8): Given the admin on day one, when he opens each of the 6 pages' content, then every text and
  picture visible on the live site on 2026-11-01 is there, unchanged. **Check:** Tanya, page-by-page compare
  against pictures of today's site.
- [ ] AC-b (R2, R4): Given he changes a headline, a project and a certificate and presses Save, then the public
  page shows each change within one minute without a build. **Check:** Tanya, local, timed, pictures.
- [ ] AC-c (R2): Given he writes a blog post and saves it, then it appears on /blog and opens on its own page.
  **Check:** Tanya, pictures.
- [ ] AC-d (R5): Given he types a Thai note and asks the AI for text, then he gets English text he can edit, and
  nothing changes on the public site until he approves and saves. **Check:** Tanya, real gateway, inside a call
  ledger the SA writes first.
- [ ] AC-e (R7): Given he changes a fact (e.g. adds a project) and saves, when a visitor asks the Home AI about it,
  then the answer uses the new fact. **Check:** Tanya, real gateway, ledgered.
- [ ] AC-f (R1, unhappy path): Given the public site, a visitor has no way to change content — no admin link, no
  writable endpoint reachable from the public site. **Check:** Sober's design note + Tanya's probe on local.
- [ ] AC-g (regression): All 6 pages and the Home AI still work for visitors after the switch (REGRESSION list).
  **Check:** Tanya.

## Constraints

- AI calls go through his gateway `https://ai.develyst.online` (REQ-006).
- **This reopens Q44.** On 2026-09-09 he said *"ต้องมี postgres อีกเหรอ ไว้คราวหลัง"* (database later). An
  admin that saves content needs storage, so "later" is now → Q1 (c).
- The team never deploys; production is his hands.

## Out of Scope (proposed)

- Visitor accounts, comments, a newsletter.
- A Thai version of the site (only if he wants it — not asked).
- REQ-007's idea I (a private list of questions the AI could not answer) — easy to add once storage exists;
  not in unless he says so.

## Questions

**Q2 (owner, blocks going live only — NOT the build) — how does he log in?** Deferred by him 2026-11-01.
The team builds everything else and runs it locally; nothing of the admin goes public until he answers.
Porter will bring it back when the build is ready to show, with the options laid out.
> 2026-11-01, owner again: *"ปล่อยไปก่อนเลยเรื่อง login เดี๋ยวฉันเอามาคุยทีหลัง"* — still deferred; he will raise it himself. `[operator]`

**~~Q1~~ ANSWERED 2026-11-01** (see §Owner decisions) — (b)–(f) approved, (a) deferred → Q2. The pack as asked:
**Q1 (owner, BLOCKS REQ-010) — decision pack. Correct only the line that is wrong.** `[PM-proposed]`
- (a) Login: only him, one account; no sign-up page, no second user.
- (b) "100%" = every text and picture on all 6 pages (Home, About, Services, Portfolio, Blog, Contact): headline,
  experience, skills, services, projects with pictures, certificates, client screenshots, contact details, and
  **real blog posts he writes there** (each post gets its own page).
- (c) Storage: yes, a database now (Q44's "later" ends here). Which one is the SA's call.
- (d) Live: on Save the public site shows the change within a minute — no rebuild, no deploy by him.
- (e) AI writing: works in Thai or English, whichever he types in; it never publishes by itself.
- (f) The site stays in English for visitors; he may write to the AI in Thai and get English text back.

## QA brief — 2026-11-01, Porter → Tanya

Test AC-a…g from this REQ, not from the build. Local only (`back/` + built `front/` + `admin/` on 127.0.0.1:4015); never
production. Use a copy of the seeded store so your edits don't become his content.
- **No-call ACs first (start now):** AC-a (page-by-page vs pictures of today's live site), AC-b (headline + project +
  certificate Save → public page within 1 min, timed), AC-c (write a post → /blog + its own page), AC-f (probe: no admin
  link, no writable endpoint from the public site / front origin — SPEC-010 D5), AC-g (REGRESSION list, 6 pages + Home AI UI).
- **Real-call ACs (AC-d, AC-e, and one Home AI regression question) only after Sober writes your row** in SPEC-010
  §Call ledger (cap 13). Follow the row exactly; a technical failure is the result — record it, no re-press.
Report: verdict per AC, pictures, `calls=` from the back log, any defect reproducible from the steps.

## Delivery — 2026-11-01, Porter

All 7 AC ticked on tests/TEST-011-req010-admin-acceptance.md (`TEST_PASSED` after re-test; round 1 failed only on DEF-1,
closed by TASK-042). Real calls 12 / 15 (TASK-037 1, QA 11; re-test 0). Accepted as written.
- `[PM-decided]` QQ15: AC-a baseline = pre-switch `D1` build (b068fba), not production (lacks REQ-005).
- `[PM-decided]` OBS-22 fixed: new posts default to his name.
- For him at sign-off: **OBS-20** — after deploy the whole site depends on `back/`; `back/` down = every page shows
  "Content is unavailable right now." · OBS-23 (post page background band stops part-way, cosmetic) · OBS-24 (Home AI said
  "PostgreSQL has been my main choice" — small inference) · OBS-25 (click-nav `_rsc` may log ERR_ABORTED, harmless).
- **Not live:** uncommitted on `D1`; nothing deployed; the admin stays local-only until he answers Q2 (login).
