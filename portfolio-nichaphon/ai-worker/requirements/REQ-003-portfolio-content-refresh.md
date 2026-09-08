# REQ-003: Portfolio content refresh — his real projects on the site (N5)

- Status: **DELIVERED 2026-09-05, Porter.** **8 of 8 AC ticked** — AC-d closed on
  TEST-006 (`TEST_PASSED`, 10/10, 0 defects: both modals SEEN as pictures at 1280
  and 360, each live href read off the DOM). SPEC-003 + TASK-016 + TASK-017 all
  `DONE`. **DELIVERED is the team's word, not his** — his sign-off is still to
  come, and **nothing is deployed** (`main`/`production` do not carry it).
  Q22-b, Q29 + both Observations survive DELIVERED, NOT closed; **Q28 + OBS-8
  ANSWERED 2026-09-05, OBS-8 → REQ-004.** **CONSOLIDATED** — 3 superseded history
  sections became pointers; the full pre-consolidation file is verbatim in
  `../archive/REQ-003-portfolio-content-refresh-2026-09-05-preconsolidation.md`.
- Status history: **SPEC_DONE — ACCEPTANCE PASS RUN, 2026-09-05, Porter.** SPEC-003 and
  both TASKs are `DONE` (Sober). **7 of 8 AC ticked; AC-d alone is open** and
  needs one QA round — the two new cards' modal has never been seen as a picture,
  so the rendered live-URL link rests on the implementer's own load. Requested
  from Tanya. **NOT `DELIVERED`, not his sign-off, not a deploy** — the 2 edited
  files sit unstaged on `D1` (SQ17). See **§Acceptance pass**.
- Status history: **IN_SPEC — R7 APPROVED, 2026-09-05, Porter.** SPEC-003 ACTIVE,
  TASK-016 DONE. The owner answered **`อนุมัติ`** on 2026-09-05: the pack ships
  as drafted, on the three SA defaults. **AC-g is MET** — the record is written
  in **§R7 approval record** below, and **TASK-017 is UNBLOCKED**. Q22-b, Q28,
  Q29 and both Observations stay open and non-blocking.
- Status history: **IN_SPEC — AT THE R7 GATE, 2026-09-05, Porter.** SPEC-003
  ACTIVE, TASK-016 DONE, the draft pack **relayed to the owner 2026-09-05** and
  TASK-017 `BLOCKED` until his approved text + date exist in **§R7 approval
  record** below. **AC-g is NOT met yet** — the record is empty by design until
  he answers. See §R7 approval gate.
- Status history: **READY_FOR_SA — 2026-09-05, Porter.** Q20, Q21, Q27 answered in full;
  Q22 answered on its **role** field only. Not blocked: the two unanswered
  fields (dates · result) and the old-entries call (**Q28**) are non-blocking by
  construction, because **Q21 = `ทีมร่าง` created an approval gate** — no drafted
  word ships until he approves it, so a missing field can only ever be an
  omission he sees, never a wrong fact he doesn't. See §His answers.
- Priority: HIGH (he has now handed the same material over **three times** — 2026-09-02,
  2026-09-05, 2026-09-05 again — and nothing has been produced from any of them)
- Requested: 2026-09-02 by the site owner (Nichaphon); **re-raised twice on 2026-09-05**
- Deadline: none given
- Source: REQ-001 §New asks — **N5**. Owner's answers **Q16** (scope) and
  **Q17** (material) are already in; **Q20/Q21** were asked 2026-09-02 and went
  unanswered until **2026-09-05**, which is why no REQ existed before then and
  why nothing was built. Both are now answered — see §His answers.
- Opened: 2026-09-05 by Porter (PM) — the ask now has a home so its detail stops
  living in REQ-001's §New asks. Opening it changes nothing about REQ-001
  (DELIVERED) or REQ-002 (SPEC_DONE).

> R-numbers here are REQ-003's own. Anything from an earlier requirement is
> cited explicitly (`REQ-001 R4`, `REQ-002 R1`, …).

## Problem / Goal

The site's content is out of date. Verbatim, 2026-09-02:

> อัปเดต portfolio ... นั่นมันของเก่า มีอีกหลายอย่างที่เกิดขึ้นมา

And again, 2026-09-05, as a question about time rather than a new ask:

> เมื่อไหร่จะอัปเดต portfolio ฉันเสร็จ

He has since built and shipped real projects that the site does not mention.
REQ-001 and REQ-002 changed how the site **looks**; neither changed a single
word of what it **says** about him. This is that work, and only that work.

**Goal: his current, real work appears on the site, in his own facts, with his
permission.**

## Third handover — 2026-09-05, his words verbatim

Recorded before anything is interpreted. Relayed by the dispatcher:

> http://localhost:3000/portfolio
>
> ยังไม่เห็น พวกนี้เลย
> นี่ฉันเป็นคนเขียนเองทั้งหมด
>
> https://learning.develyst.online/
> https://github.com/seaharatp-commits/Learing-curve-front.git branch develop
> https://github.com/seaharatp-commits/Learing-curve-back.git branch develop
>
> https://ong.develyst.online/
> https://github.com/develyst1/ong-match-back.git branch dong
> https://github.com/develyst1/ong-match-front.git branch dong

**This is the third time the same four repositories and two live URLs have been
handed over** — 2026-09-02, earlier on 2026-09-05, and now. The `.git` suffixes
and the word `branch` are new *formatting*; the repositories, the branches and
the URLs are the same set. **One sentence is genuinely new:**
`นี่ฉันเป็นคนเขียนเองทั้งหมด`.

### What this settles

1. **The material list is final, not a draft or a transcription artefact.** Three
   independent hand-overs, same four repos, same two branches (`develop`,
   `dong`), same two URLs. Nothing more is coming that he has not sent.
2. **He is checking the running site himself, and the gap is real to him.**
   `ยังไม่เห็น พวกนี้เลย` — "I don't see any of these yet" — on `/portfolio`.
3. **Why he sees nothing is known and is not a defect:** **no role has ever
   changed a word of site content.** REQ-001 and REQ-002 changed how the site
   *looks*; this REQ, the only one that changes what it *says*, has never left
   `DRAFT` because it is blocked on his answers. **Nobody has cloned or read any
   of the four repos** — still true today. The `/portfolio` entries he is looking
   at are the pre-existing ones that shipped before the team existed.
4. **Separately, and stated so it is not confused with (3):** the process serving
   `localhost:3000` is **not the team's** — a `next` process nobody here owns has
   held that port since 2026-09-03 and every role has routed around it rather
   than touch it. No role runs, builds or deploys his site; work reaches him as
   edited files on `develop`, and git and deploy are his hands alone (board
   §Standing rules). So even after this REQ is built, what port 3000 shows is
   whatever he last started there.

### What this did NOT settle at the third handover — CONSOLIDATED 2026-09-05

Superseded on 2026-09-05 by §His answers (all four answered). The verbatim block
— what was deliberately *not* assumed while Q20/Q21/Q22 were open — is kept in
`../archive/REQ-003-portfolio-content-refresh-2026-09-05-preconsolidation.md`.

## His answers — 2026-09-05, verbatim (Q27, Q20, Q21, Q22)

Recorded before interpretation, exactly as he wrote them:

> Q27=ก, Q20=ลงได้ทั้งคู่, Q21=ทีมร่าง, Q22=ทั้งหมด ฉันเเป็นคนทำเองกับมือ

**This is the hop the REQ was waiting for. What each answer does:**

1. **Q27 = (ก) — the sentence was about his ROLE.** `นี่ฉันเป็นคนเขียนเองทั้งหมด`
   means *"I wrote all of this code myself"*. **Fact, from the only allowed
   source: he is the sole author of both projects, front and back.** It does
   **not** touch Q21 — which he answered separately, so no tie had to be broken.
2. **Q20 = `ลงได้ทั้งคู่` — permission GRANTED for both projects.** Q20 named
   *names, screenshots and links* for both sites; "both can be posted" answers
   that question as asked. **R3 is satisfied** — this REQ no longer proceeds on
   silence, it proceeds on his word. He stated **no limit**; nothing is inferred
   from that beyond "none stated" (see R8 and Q29 for the one thing Porter will
   not publish on a "none stated": other people's data inside a screenshot).
3. **Q21 = `ทีมร่าง` — the TEAM drafts, he approves.** This is the explicit lift
   of REQ-001 R4 for this text, the way Q10/Q11 lifted it for the quotes, and it
   is **scoped to drafting entry copy from the four repos and the two live
   sites — nothing else.** It brings its own gate with it: **no draft ships
   unapproved** (now **R7**).
4. **Q22 = `ทั้งหมด ฉันเเป็นคนทำเองกับมือ` — the role field, twice over.** Q22
   asked four things per project (role · dates · client or employer · result).
   His answer states **role**: he did all of it himself, by hand. It **does not
   state dates and does not state any result or number**, and Porter does not
   read those out of it. Whether "did it all himself" also means "there was no
   client" is **not** claimed here — it is a statement about authorship, not
   about who the work was for. Remaining fields = **Q22-b**, non-blocking.

### Why this is `READY_FOR_SA` although Q22 is not fully answered

The old §What happens table said `READY_FOR_SA` waits for Q22 in full. **That
table was written before Q21 had an answer, and Q21's answer changes the risk
it was protecting against.** Stated plainly so it is a declared decision, not a
drift:

- The danger Q22 guarded was **a wrong fact shipping** — a date or a metric the
  team invented to fill a slot. Under `ทีมร่าง` **every entry passes through him
  before it ships (R7)**, so an absent date can only ever surface as an
  **omission he is looking at**, which he closes with one line.
- Therefore the honest default is written into the REQ rather than left to
  anyone's judgement: **a field with no source is omitted, never filled**
  (**R9**). Omission is not invention; invention is what R2 forbids.
- **Nothing publishes on this reasoning alone.** If he wants dates and results
  on the entries, Q22-b is sitting in front of him and the drafts will show him
  exactly where they would go.

## What is already settled — no guessing needed here

1. **Scope (Q16, answered `ทั้งเว็บ`).** N5 covers his content **across the
   site** — About, Services and Portfolio, not the `/portfolio` route alone.
   Which specific strings change is a spec question, not a scope question.
2. **The material (Q17).** He handed over source repositories and live URLs, not
   finished copy. Handed over on 2026-09-02 and **again unchanged twice on
   2026-09-05** (three times in total — see §Third handover):

   | Project | Live URL | Repos (branch) |
   |---|---|---|
   | Learning curve | `https://learning.develyst.online/` | `seaharatp-commits/Learing-curve-front` (`develop`) · `seaharatp-commits/Learing-curve-back` (`develop`) |
   | Ong match | `https://ong.develyst.online/` | `develyst1/ong-match-back` (`dong`) · `develyst1/ong-match-front` (`dong`) |

3. **All four repos are readable from this machine and every branch he names
   exists** — checked 2026-09-02, re-checked and still true 2026-09-05. **No role
   has cloned or read any of them, across all three hand-overs.** Access has
   never been the blocker; permission and his four facts are.
4. **The 2026-09-02 link typo is now CLOSED, not by assumption.** On 2026-09-02
   the fourth link's visible text said `ong-match-front` while its href pointed
   at `ong-match-back`, and Porter recorded a low-confidence reading rather than
   correct it silently. His 2026-09-05 message lists **all four repositories as
   plain text**, `ong-match-back` and `ong-match-front` separately. The earlier
   reading is confirmed by his own words. Nothing to ask.

## Requirement

The system must:

1. **R1 — Show his real, current projects.** At minimum the two he handed over
   (Learning curve, Ong match), on the routes that carry his work.
2. **R2 — Every published fact is his.** REQ-001 **R4** binds unchanged: no role
   invents a fact about a person or a project. Reading a repository tells us what
   a thing *does*; it cannot tell us his role on it, when he did it, who it was
   for, or what it achieved. **Those four facts have exactly one source: him.**
3. **R3 — Nothing is published without permission. SATISFIED 2026-09-05 for
   these two projects.** Naming, screenshotting or linking a project on a public
   site is a disclosure; **Q20 = `ลงได้ทั้งคู่`** grants it for Learning curve
   and Ong match — names, screenshots and links, both sites. R3 keeps binding
   for **anything he has not named**: a third project, a client, a person, a
   logo, a testimonial is still a disclosure with no permission behind it.
4. **R4 — Read-only source access, no credentials, ever.** If a screen only
   exists behind a login, that is a **DATA REQUEST** and he screenshots it.
   Nobody asks him for a password and no role creates an account. Reading these
   four handed-over repos is read-only: no writes, pushes, branches or deploys.
   (Boundary already recorded on 2026-09-02: the standing rule about not tracking
   his commits concerns **the portfolio repo**; it does not forbid reading these.)
5. **R5 — Content only.** This REQ changes words, images and links. It does not
   restyle anything — the visual identity is REQ-001 + REQ-002's. If new content
   genuinely does not fit the shipped layout, that is a finding to raise, not a
   licence to redesign.
6. **R6 — REQ-002 is not blocked by this and does not block this.** They touch
   the same routes at different layers. Sequencing between them is his call; if
   he wants one first, he says so.
7. **R7 — The approval gate (new 2026-09-05, from Q21 = `ทีมร่าง`).** The team
   drafts; **he approves every entry's exact final text before it ships.** The
   drafts leave the team as a file the human can read, Porter relays them to him
   in Thai, and his approval is recorded in this REQ against the exact wording
   approved. **No drafted word reaches the site without that record.** A draft he
   edits ships as *his* edit, not as the draft.
8. **R8 — A screenshot may not disclose other people's data (new 2026-09-05).**
   Q20 permits screenshots of **his** two sites. It cannot permit what belongs to
   a third party: if a screen shows real users, real names, real messages,
   matches, e-mail addresses or anything similar, that screen is **not published
   as-is** — the team raises it instead (**Q29**). This is the one place where
   "he stated no limit" is deliberately not treated as "there is no limit",
   because the person harmed would not be him. He can overrule it in one line.
9. **R9 — A fact with no source is OMITTED, never filled (new 2026-09-05).**
   Where the team has no sourced value for a field — a date, a client, a metric —
   the entry simply does not carry that field. No placeholder, no "2024", no
   "improved performance", no rounded guess. R2 is what this protects; R7 is what
   makes it safe (he sees the omission and can close it).

## Acceptance criteria

**Written 2026-09-05 on his four answers** — the three answer-independent ones
below were already here; **AC-d … AC-h are new and are what makes this REQ a
deliverable** rather than a "we broke nothing" list.

### The three that held under every possible answer (written at the third handover)

- [x] **AC-a — every published fact traces to a line he wrote.** For each claim
      about him or a project on the finished pages, the exact source is citable:
      his own text, or a draft he approved. Testable by inspection against this
      REQ's record; needs none of his facts to be written down as a rule.
- [x] **AC-b — nothing appears that he has not permitted.** No project name,
      screenshot, link or client name on any route that is not covered by his
      Q20 answer. Ticks empty-handed if Q20 comes back "no": the criterion is
      then met by nothing being added.
- [x] **AC-c — the shipped visual identity is untouched (R5).** The change is
      words, images and links only; REQ-001 + REQ-002's look is not restyled.
      Verifiable as a diff-shape criterion, and it survives every answer.

### The content criteria — new 2026-09-05, on his answers

- [x] **AC-d — both projects are on the site.** **Learning curve** and **Ong
      match** each appear as an entry on the route(s) that carry his work, each
      linking to its live URL (`https://learning.develyst.online/`,
      `https://ong.develyst.online/`). Testable by loading the pages.
      > **NOT ticked 2026-09-05, Porter — the only AC still open.** That both
      > entries are *on* `/portfolio` is proven (prerendered HTML, re-read by
      > Sober). The **rendered live-URL link sits inside each card’s modal**, and
      > the only person who has seen it is the engineer who wrote it — from the
      > DOM, never as a picture. An AC that says "testable by loading the pages"
      > is not ticked on the implementer’s own load. It closes on QA — see
      > §Acceptance pass.
      > **TICKED 2026-09-05, Porter, on TEST-006 (`TEST_PASSED`, 10/10, 0
      > defects).** Both halves are now SEEN, not inferred: `/portfolio` painted
      > with the intro line and **11** cards (Learning Curve 01, Ong Match 02
      > first, the nine old ones kept), and **each new card's modal opened and
      > captured as a picture** at 1280x900 and 360x740, on a fresh `npm run
      > build` (exit 0) served from `node .next/standalone/server.js`. The live
      > link inside each modal reads `https://learning.develyst.online/` and
      > `https://ong.develyst.online/`, `target="_blank" rel="noopener
      > noreferrer"` — read off the live DOM, never clicked (no live product URL
      > was contacted). One non-defect fact rides along: **OBS-8** — see
      > §TEST-006 intake. Evidence: tests/TEST-006-req003-acd-portfolio-modal-pictures.md,
      > shots in `../project-docs/qa-test006-2026-09-05/`.
- [x] **AC-e — each entry says what the project is, from its own source.** The
      description of what each project *does* is traceable to something the team
      actually read — that repo or that live site — and the citation exists in
      the drafting record. No claim about *quality*, *scale* or *impact* appears
      unless he supplied it (that is AC-a's other half).
- [x] **AC-f — his role appears exactly as he stated it, and no further.** Both
      entries may say he is the **sole author / wrote it all himself** (Q27=ก,
      Q22). Neither entry states a **date**, a **client or employer**, or a
      **result/metric** unless he has supplied it in writing by then (R9). A
      draft that fills one of those from the repo's git history or from the code
      **fails this criterion**.
- [x] **AC-g — nothing shipped that he had not approved (R7).** For every entry,
      this REQ records the exact text he approved and the date. Zero published
      words without a matching approval line. This is the criterion that makes
      `ทีมร่าง` safe; if it cannot be shown, the REQ is not done.
      > **TICKED 2026-09-05, Porter.** His verbatim `อนุมัติ`, the date, the two
      > `title` picks, the intro line and the cited approved text are all in
      > **§R7 approval record** below. The tick is on the *record existing*,
      > which is what AC-g asks for; it does **not** claim the strings are on the
      > site yet — that is TASK-017, and AC-a/AC-d/AC-e/AC-f still verify it.
- [x] **AC-h — the whole-site scope (Q16 = `ทั้งเว็บ`) was actually looked at.**
      Every route that describes his work was reviewed against the two new
      entries, and the spec lists which strings changed **and which were
      deliberately left unchanged, with the reason**. Silence about a route is
      not coverage. Existing `/portfolio` entries are **kept** unless he says
      otherwise — see **Q28**; removing his existing content is not implied by
      "add these two".

Deliberately still absent: any criterion that asserts an entry is *accurate* in
his eyes. That is what AC-g's approval record is for — accuracy is his
judgement, not a test the team can run on his behalf.

## Questions

> **Status 2026-09-05: Q20, Q21, Q27 = ANSWERED and closed. Q22 = ANSWERED on
> its role field; the rest is Q22-b. Two new, both NON-blocking: Q28, Q29.**
> The original wording of the closed four is kept below unedited — the answer is
> attached to each as `> answer:`, never by rewriting the question.

### Open (none of these blocks the spec)

- **Q22-b — DATA REQUEST, non-blocking (opened 2026-09-05 from Q22's answer).**
  Two fields per project are still unsourced: **the dates** (when he built it /
  when it went live) and **any result or number he wants shown** (users, matches,
  courses, uptime — his choice, or none). Per **R9** the entries simply omit what
  he does not supply, and he will see the omission at the approval gate (R7).
  Four short lines in chat is enough; a file in `../project-docs/` is equally fine.
- **Q28 — the existing `/portfolio` entries: keep, replace, or remove?
  (NEW 2026-09-05, non-blocking.)** He said `นั่นมันของเก่า` about the current
  content and `ยังไม่เห็น พวกนี้เลย` about the two new ones — that asks for the
  two to be **added**; it does not say what happens to what is already there.
  **Porter does not read "add these" as "delete those"**, so the default written
  into AC-h is: **existing entries stay untouched** until he says otherwise.
  Removing his content is destructive and needs his word, not an inference.
  > answer 2026-09-05, owner: **`เก็บไว้`** = keep. **Q28 CLOSED**, nine stay.
- **Q29 — screenshots that contain other people's data (NEW 2026-09-05,
  non-blocking, R8).** Q20 permits screenshots of his two sites. If a screen on
  either one shows **real users, real names, messages or matches**, the team will
  **not** publish that screen as-is and will raise it instead — even though he
  stated no limit — because the person exposed would not be him. One line from
  him overrules this either way (e.g. "the data there is fake, publish it").

### Answered and closed

- **Q20 — permission to publish (asked 2026-09-02).** May
  `learning.develyst.online` and `ong.develyst.online` — their names,
  screenshots and links — appear on his public portfolio? Is either client work
  with a confidentiality limit, and is there anything on either site that must
  not be shown?
  **Re-asked a third time 2026-09-05.** `ยังไม่เห็น พวกนี้เลย` reads strongly
  toward "yes" on the first half — see §Third handover, where that reading is
  **declared and deliberately not applied**. The second half (limits, and what
  must not be shown) has no signal at all in anything he has written, and it is
  the half that does damage if guessed. **Still his, still blocking.**
  > **answer: 2026-09-05 — `ลงได้ทั้งคู่`.** Permission GRANTED for both
  > projects: names, screenshots and links, as the question listed them. **No
  > limit stated.** Recorded as "none stated", not as "none exists" — the one
  > place that distinction is acted on is **R8/Q29** (other people's data in a
  > screenshot), and nowhere else. **Q20 CLOSED. R3 satisfied for these two.**
- **Q21 — who writes the entry text (asked 2026-09-02, still open).** Does he
  want the team to **draft** each entry from the repos and the live sites for him
  to approve — an explicit lift of REQ-001 R4 for this text, the way Q10/Q11
  lifted it for the quotes — or will he write the entries himself?
  > **answer: 2026-09-05 — `ทีมร่าง`.** The **team drafts**, he approves. R4 is
  > lifted **only** for entry copy drafted from the four repos and the two live
  > sites; it binds everywhere else. The lift arrives with its gate: **R7 — no
  > draft ships unapproved**, and **R9 — an unsourced field is omitted, never
  > filled**. **Q21 CLOSED.**
- **Q27 — NEW 2026-09-05, and it is the one that must be answered first.** His
  new sentence, verbatim, is **`นี่ฉันเป็นคนเขียนเองทั้งหมด`**. It has **two
  readings and they lead to different projects**, so Porter answers neither:
  - **(ก) a fact about his ROLE** — "I wrote all of this code myself", i.e. he is
    the sole author of both projects, front and back. It sits immediately after
    the repository list, which is what makes this the plainer reading. If this is
    what he means it is **the first fact about these projects to come from the
    only source allowed to give it (him)** — it answers the *role* field of Q22
    and **nothing else**: not the dates, not the client or employer, not the
    result.
  - **(ข) an answer to Q21** — "I will write all of it myself", i.e. he writes the
    portfolio entries and the team only places them. **Q21's own wording offers
    him the phrase `ฉันเขียนเอง` for exactly this**, and his sentence contains
    `เขียนเอง`. That collision is the whole reason this cannot be read either way
    by inference.
  - **It could also be both.** One line from him settles it; Porter does not pick.
    Until he does, **Q21 stays open and no drafting starts**, because starting
    would be acting on reading (ก) and stopping would be acting on reading (ข).
  > **answer: 2026-09-05 — `ก`.** It is a fact about his **ROLE**: he wrote both
  > projects himself, front and back. It carries **nothing else** — not the
  > dates, not a client, not a result. Q21 was answered separately (`ทีมร่าง`),
  > so the tie never had to be broken by inference. **Q27 CLOSED.**
- **Q22 — DATA REQUEST, new 2026-09-05 (needed whichever way Q21 goes).** For
  each of the two projects: **his role · the dates · the client or employer ·
  any result or number he wants shown.** Code cannot supply these four, so even a
  team-drafted entry stalls on them. Format is his choice — four lines per
  project in chat is enough; a file in `../project-docs/` is equally fine.
  > **answer: 2026-09-05 — `ทั้งหมด ฉันเเป็นคนทำเองกับมือ`, which answers the
  > ROLE field for both projects and only that field.** Dates and result/number
  > are **not** stated and are not read out of it; whether there was a client is
  > **not** claimed either way (the sentence is about authorship, not about who
  > the work was for). **Q22 partially closed → the remainder is Q22-b, which is
  > non-blocking under R7 + R9.**

### Not resolved by assumption — recorded so he can overrule in one word

> **CLOSED 2026-09-05 — he answered it himself: `Q21 = ทีมร่าง`.** The reading
> below was never applied, and it turned out to be the right one; that is luck,
> not method, and the method is what is kept. Left unedited as the record.

His 2026-09-05 messages re-hand the same four repositories and ask when the work
finishes. That **reads** like an expectation that the team drafts from them
(otherwise there would be little point re-sending source code) — but reading it
that way would be **guessing his answer to Q21**, and Porter does not answer the
owner's questions for him. It is written here, not acted on. One word — "ทีมร่าง"
or "ฉันเขียนเอง" — settles it.

**Updated after the third handover (2026-09-05):** the new sentence
`นี่ฉันเป็นคนเขียนเองทั้งหมด` pulls in the *opposite* direction from that reading
— which is precisely why it is now **Q27** and not a conclusion. Three hand-overs
of source code point one way; `เขียนเอง` points the other. **Porter will not
break that tie by inference**, and says so to him plainly rather than picking the
convenient reading and calling it progress.

### What three hand-overs with nothing produced actually costs — stated, not excused

He has now spent three messages sending the same material and the team has
produced nothing from any of them. **The cause is not that the material was
unclear or unreachable** — it has been complete and readable since 2026-09-02.
The cause is that **the three answers only he can give have not been asked for
in a form he could answer in one message.** That is Porter's to fix, and it is
fixed this hop: Q20/Q21/Q22/Q27 go to him as a single copy-paste block in Thai,
short enough to answer in one reply.

## Where this REQ stood while it was open — CONSOLIDATED 2026-09-05

Two sections lived here and are now history, not state: **§Where this REQ stands
now (after his answers)** and **§What happened the moment each gate lifted — the
original table**. Both are superseded by §Acceptance pass, §TEST-006 intake and
§Delivery below. Kept **verbatim** in
`../archive/REQ-003-portfolio-content-refresh-2026-09-05-preconsolidation.md`.
Nothing was deleted; nothing that is still open lived only there.

## R7 approval gate — pack relayed 2026-09-05 (Porter)

**What was relayed:** `drafts/DRAFT-001-req003-project-entries.md` as it stands
(drafted by Fern, reviewed by Sober, TASK-016 `DONE`). The approval sheet is
`tasks/TASK-016-source-read-and-draft-pack.md` §Review §4 — four lines, three of
them a tick. **Porter relays; no role talks to the owner but Porter, and the
text he approves is the pack's wording byte for byte.**

### The four decisions put to him

| # | Decision | SA default if he simply says "approve" |
|---|---|---|
| 1 | **The two entries as drafted** — approve, or edit any string. An edit ships as **his** edit (R7) | ship as drafted |
| 2 | **Entry 1 `title`** — sources genuinely disagree (SQ16b): 4 sources say `Learning Curve`, the back-end README says `LearningCurve` | **`Learning Curve`** |
| 3 | **Entry 2 `title`** — sources genuinely disagree (SQ16b): the rendered brand is `Ong Match`, the live `<title>` is `Ong Match — หาคนไทป์เดียวกัน` | **`Ong Match`** |
| 4 | **The `/portfolio` intro numeral** (SQ15 — numeral only, sentence untouched): today it reads "Nine projects, and what each one had to solve" and the array becomes eleven | **`Eleven projects, and what each one had to solve`** |

**Offered, not owed — none of these holds the REQ, each is one line from him
whenever he wants it:** the six sourced product numerals (pack Observation 7) ·
the nine technologies found in the source but absent from `SKILL_GROUPS`
(Observation 1) · **Q22-b** (dates · result per project) · **Q28** (the existing
nine `/portfolio` entries — default **keep**) · **Q29** (moot for this REQ per
**SQ14**: no image slot exists on `Project`, so no screenshot ships).

Two calls Sober **ruled** so they never reached his desk, recorded here so he can
still overrule either in one word: the sourced product numerals stay **out**
(FQ44), and the trailing slash on both `link` values is **kept** verbatim because
`link` only ever renders as an `href`, never as text (FQ46). AC-f's optional
"sole author" line is **not** in either entry — on 2 of 11 entries it would make
an unsourced claim about the other 9.

### R7 approval record — AC-g

**RECORDED 2026-09-05 by Porter. AC-g is TICKED. `TASK-017` is UNBLOCKED.**

#### His answer, verbatim

> อนุมัติ

Received 2026-09-05. That is the whole reply — one word, no edit to any string,
no alternative picked.

#### How that one word is read, and why it is not an inference

The approval sheet Porter relayed carries a **written SA default per decision**,
under the column heading *"SA default (applies if he just says 'approve')"*
(`tasks/TASK-016-source-read-and-draft-pack.md` §Review §4, reproduced above in
§The four decisions put to him). **`อนุมัติ` is "approve".** So the reading below
is the sheet's own stated rule being applied to the answer it was written for —
not Porter guessing what he meant. Every one of the four is a default that was
**shown to him** before he answered; had he wanted the alternative, decisions 2
and 3 each listed it beside the default.

#### The four decisions, as approved

| # | Decision | **APPROVED value** |
|---|---|---|
| 1 | The two entries as drafted | **ship as drafted** — `drafts/DRAFT-001-req003-project-entries.md` byte for byte, no edit |
| 2 | Entry 1 `title` | **`Learning Curve`** (not `LearningCurve`) |
| 3 | Entry 2 `title` | **`Ong Match`** (not `Ong Match — หาคนไทป์เดียวกัน`) |
| 4 | `/portfolio` intro numeral (SQ15 — numeral only) | **`Eleven projects, and what each one had to solve`** |

#### The exact approved text

**The approved text is `drafts/DRAFT-001-req003-project-entries.md` as it stood
on 2026-09-05 when it was relayed, unedited**, with the two `title` fields
resolved to the values in the table above. That file is the record of the
strings; it is cited here rather than re-typed, deliberately — a second copy of
the same strings in a second file is a second thing that can drift, and R7 asks
for *the exact wording approved*, which is that file's wording.

Approved, per entry:

- **Entry 1** — `id` `learning-curve` · `title` **`Learning Curve`** ·
  `summary` (4 sentences) · `highlights` (5) · `techStack` (11 values) ·
  `link` `https://learning.develyst.online/` (trailing slash **kept**, FQ46)
  — all as drafted, DRAFT-001 §Entry 1.
- **Entry 2** — `id` `ong-match` · `title` **`Ong Match`** ·
  `summary` (4 sentences) · `highlights` (5) · `techStack` (9 values) ·
  `link` `https://ong.develyst.online/` (trailing slash **kept**, FQ46)
  — all as drafted, DRAFT-001 §Entry 2.
- **The one existing string that changes** — `PORTFOLIO_INTRO.title` becomes
  **`Eleven projects, and what each one had to solve`**. Numeral only; the rest
  of the sentence is untouched (SQ15).

#### What this record does NOT approve — unchanged, still open

`อนุมัติ` answers the four decisions on the sheet and nothing beyond them. Still
his, still unanswered, still non-blocking, and **none of them may be read as
settled by this word**:

- **Q22-b** — the dates and any result/number per project. Under **R9** both
  entries ship with those fields simply absent. He is looking at that omission
  now, and closes it in one line whenever he wants.
- **Q28** — the nine existing `/portfolio` entries. Default **keep**; nothing is
  removed. `PROJECTS` becomes eleven, which is exactly why decision 4 existed.
- **Q29** — moot for this REQ per **SQ14**: `Project` has no image slot, so no
  screenshot ships either way.
- **Observation 1** (nine technologies not in `SKILL_GROUPS`) and
  **Observation 7** (six sourced product numerals) — offered, not taken. Nothing
  is added to `SKILL_GROUPS` and no numeral enters either entry.
- The two SA rulings recorded above (FQ44 numerals out · FQ46 trailing slash
  kept) and the absence of an AC-f "sole author" line stand as ruled. He can
  still overrule any of them in one word; this record is not his agreement to
  them, it is his approval of the text they produced.

## Acceptance pass — Porter (PM), 2026-09-05

**REQ-003 stays `SPEC_DONE`. 7 of 8 acceptance criteria are ticked; AC-d is the
one that is not, and it is not ticked because the evidence for its second half
comes only from the engineer who wrote the code.** Both TASKs (016, 017) are
`DONE` and reviewed by Sober, who re-derived every shipped string himself rather
than agreeing with Fern's claim.

### How the seven closed

| AC | Closed on | The evidence, named |
|----|-----------|---------------------|
| AC-a | Porter 2026-09-05 | Every line of `DRAFT-001` carries a citation (`<repo>@<sha7>:<path>:<line>`, or the live URL + load date); the owner approved that pack verbatim (`อนุมัติ`, §R7 approval record); Sober proved the shipped strings **are** that pack — 24/24 character-exact against the evaluated module |
| AC-b | Porter 2026-09-05 | Only the two projects his **Q20** permits were added. Nothing else appears: `git diff --numstat` on `projects.ts` is `52 0` — **additions only**, so no existing entry was rewritten — and no screenshot ships at all (SQ14: `Project` has no image slot) |
| AC-c | Porter 2026-09-05 | The REQ defines this one as a **diff-shape** criterion and the diff shape is exactly right: **2 files, both content**, no CSS, component, theme or type file; `Portfolio.config.ts` is 1 insertion / 1 deletion, `Nine`→`Eleven` only (SQ15) — see tasks/TASK-017-…md §Review §2–§3 |
| AC-e | Porter 2026-09-05 | Each summary sentence and each highlight in DRAFT-001 names the repo line or live page it came from. On the "no quality/scale/impact claim unless he supplied it" half: the byte sweep found **zero digit characters** in either entry, and anything adjectival that survived is text **he approved verbatim** — which is him supplying it. Stated so he can overrule it in one word |
| AC-f | Porter 2026-09-05 | **Zero digits** in either entry, so no date and no metric is even expressible; `client` / `employer` / `users` / `months` / `%` sweeps all clean. No "sole author" line was added — AC-f **permits** one, it does not require one (FQ44, R9) |
| AC-g | Already ticked 2026-09-05 | Unchanged. TASK-017 does not re-tick it; it **confirms** it — the record said what he approved, and what shipped is character-exact to that record |
| AC-h | Porter 2026-09-05 | SPEC-003 §Whole-site review lists **all six routes plus `metadata.description` and `SKILL_GROUPS`** — 2 changed, 8 deliberately unchanged, each with its reason. No route is passed over in silence, and the nine existing entries are **kept** (Q28 default) |

### The one that is open — AC-d, and what it needs

**AC-d — both projects on the site, each linking to its live URL.** Its first
half is met: the prerendered `/portfolio` HTML that Sober read himself carries
**11 cards in the approved order** and the intro line `Eleven projects, and what
each one had to solve`. Its second half — the **live-URL link, which renders only
inside each card's modal** — rests on Fern's own DOM read of his own build, and
**the open modal has never been seen as a picture by anyone** (the capture came
back a flat dark frame every time; he declared that rather than claiming a render,
which is the correct behaviour). Same limit class as SQ7 / FQ35.

So the criterion is not ticked, and the round that closes it is the round the
owner would want anyway: **see it**.

### What is being asked of QA — and what is deliberately not

Requested from Tanya, via inbox, as one round:

1. `/portfolio` **as a picture**, showing the intro line and the 11 cards.
2. **Each new card's modal opened and captured as a picture** — Learning Curve
   and Ong Match — with the "Open live project" link's `href` read off the live
   DOM in the same round and reported next to the picture.

**Not asked, on purpose:** no re-run of the string comparison (Sober's parser
already did it independently, 24/24 character-exact — a second pass adds nothing
and would read as distrust of a check that was done properly), no re-audit of the
DRAFT-001 citations (that is document inspection, already adjudicated here), and
no full REGRESSION re-run (this change touches two content files and REQ-002's
site-wide round closed five days' worth of look questions). Method stays hers;
the one constraint is the standing one — **name the surface the round ran on**.
Standing note she needs: `front/.next` currently holds a build output, so it is
`next start` or clear `.next` first, never `npm run dev` on top of it.

### What `SPEC_DONE` means right now

- **Porter's acceptance pass has run and found one gap**, which is with QA. It
  is **not** `DELIVERED`, it is **not** the owner's sign-off, and it is **not**
  a deploy. Nothing has shipped anywhere: the two edited files are still
  **unstaged on branch `D1`**, with zero git writes by any role (SQ17).
- Q22-b, Q28, Q29, Observation 1 and Observation 7 are untouched by this pass
  and stay open and non-blocking, exactly as §R7 recorded them.

## TEST-006 intake — Porter (PM), 2026-09-05

Tanya's AC-d round came back **`TEST_PASSED`, 10/10 cases, 0 defects**, on a
declared surface (fresh `npm run build`, exit 0, served from
`node .next/standalone/server.js` on :3061; `.next` deleted before and after; no
product file touched; production never contacted). **AC-d is ticked above on
this round**, and both items I deliberately excluded — the string comparison and
the citation audit — stayed excluded, as asked.

### QQ11 — answered: SQ17's premise moved, and the new state answers SQ17 itself

> QA's question: the board and this REQ say the 2 edited files "sit unstaged on
> `D1`"; at test time the tree was **clean** and the content **committed** as
> `ca5c097`. Is SQ17 to be re-put to the owner?

**> answer (Porter, 2026-09-05): QA's fact is correct, and I confirmed it myself
by reading the repo's git state (read-only — no role wrote anything).** What I
read: `ca5c097` *"feat: update portfolio intro title and add new projects…"*,
2 files / 53 insertions / 1 deletion — **exactly TASK-017's scope** — and the SHA
sits on **`D1`, `origin/D1`, `develop` and `origin/develop` alike**. `main` is
`d30dfea`, `production` is `ed2eb5d` — neither carries it.

So **SQ17 is not re-put: the state answered it.** SQ17 asked whether work on `D1`
should be handed over on `develop`; `develop` **is** the work, same SHA, pushed —
nothing for the owner to choose between. What is left is not SQ17: **whether it
goes further (`main` / `production` = a deploy) is the owner's hand alone**, and
that reaches him as a status line, not a branch question.

Attribution, stated so nobody has to infer it later: **no role committed
anything.** The team's git rule is unbroken — every role wrote files and stopped.
Who made the commit is the owner's own business and this REQ does not assert it.
Sober's SQ17 text in `specs/SPEC-003-…md §Questions` is his file, not mine; I
have `@Sober`'d him in today's log so he can close it against the new state.

### QQ12 — answered: OBS-8 goes to the owner on its own, it does NOT ride with SQ13

> QA's question: does OBS-8 (at 360 the modal's "Open live project" button starts
> below the modal's fold, reachable once scrolled) go to the owner, or ride with
> SQ13 the way OBS-5 does?

**> answer (Porter, 2026-09-05): it goes to the owner on its own, inside this
REQ, and it is NOT folded into SQ13.** QQ9's rule was *one fact, one owner, one
question* — and applying that rule here **separates** these two, it does not join
them. OBS-5 rides with SQ13 because they are literally the same fact about the
same thing: `/services`, the table scroller, phone height. OBS-8 is a different
route (`/portfolio`), a different component (the project modal), and it lands on
**the two entries he approved verbatim today** — bundling it under a `/services`
layout question would bury the one observation that touches his own new copy.

**Not a defect, not blocking:** QA proved the button reachable, uncovered and
hit-testable after ordinary scrolling. Recorded as **Observation 8** below and
put to him with the picture, answerable in one line. Moving it would be a new
scope call for a later REQ — the team does not restyle on an observation (R5).

### Observation 8 — recorded, non-blocking

- **OBS-8 (from TEST-006, QA):** at **360x740** both new modals open scrolled to
  the top with the **"Open live project" button ~600px further down** inside the
  modal's own scroll region (y=1255 Learning Curve / y=1293 Ong Match on open;
  y=634 and in-viewport after ordinary scrolling, nothing covering either).
  Desktop 1280 is unaffected — the button is inside the viewport on open.
  **Owner's call, one line: leave it, or raise the button on phones in a later
  REQ.** Not a defect, not a blocker, no task exists for it.

## Delivery — Porter (PM), 2026-09-05

**REQ-003 is `DELIVERED`.** All **8 of 8** acceptance criteria are ticked
(AC-a/b/c/e/f/g/h on 2026-09-05 in §Acceptance pass; **AC-d** on TEST-006, above).
SPEC-003 is `DONE`, TASK-016 and TASK-017 are `DONE` and both were re-verified by
Sober rather than accepted from the implementer.

**What was actually delivered:** two new project entries — **Learning Curve** and
**Ong Match** — as the first two of **11** cards on `/portfolio`, each with the
approved summary, five highlights, its tech-stack chips and a live link to its own
site; plus the `/portfolio` intro line `Eleven projects, and what each one had to
solve`. Every shipped string is **character-exact (24/24)** to the pack he
approved with `อนุมัติ`. The nine existing entries are byte-untouched (`52 0`,
additions only), no CSS/theme/component file was touched (R5 holds), and there are
**zero digits** in either entry, so no date, metric or claim he did not supply
can be present.

**What `DELIVERED` does NOT mean — stated so it is never read as more than it is:**

- It is **not his sign-off.** DELIVERED is the team saying every criterion it
  wrote is met and evidenced; only he can say the copy is *right about him*.
- It is **not a deploy.** `main` and `production` do not carry `ca5c097`; the
  live droplet is untouched. Deploying is his hand alone.
- It **closes nothing that was open.** Q22-b (dates + result per project), Q28
  (keep or remove the old entries — default *keep*, held), Q29 (screenshots of
  other people's data — default *not published*, R8), Observation 1, Observation
  7 and the new **OBS-8** all survive this delivery, unchanged and non-blocking.
