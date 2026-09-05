# REQ-003: Portfolio content refresh — his real projects on the site (N5)

- Status: **IN_SPEC — AT THE R7 GATE, 2026-09-05, Porter.** SPEC-003 ACTIVE,
  TASK-016 DONE, the draft pack **relayed to the owner 2026-09-05** and TASK-017
  `BLOCKED` until his approved text + date exist in **§R7 approval record**
  below. **AC-g is NOT met yet** — the record is empty by design until he
  answers. See §R7 approval gate.
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

### What this does NOT settle — and is not resolved by assumption here

> **SUPERSEDED 2026-09-05 by §His answers — all four are now answered.** Kept
> verbatim as the record of what was *not* assumed while it was open.

- **Q20 (permission to publish) is still unanswered.** His words are the
  strongest signal yet toward its first half — a man asking why two projects are
  not on his portfolio is not hiding them. **Porter declares that reading and
  does not apply it**, for one concrete reason: Q20's *second* half — is either
  one client work with a confidentiality limit, and is there anything on either
  site that must not be shown — **cannot be inferred from any sentence he has
  written**, and it is the half that causes real damage if guessed wrong.
- **Q22 is still unanswered** except possibly one field of it — see Q27.
- **Q21 may or may not have just been answered.** That is exactly Q27, and it is
  the reason this hop did not start work.

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

- [ ] **AC-a — every published fact traces to a line he wrote.** For each claim
      about him or a project on the finished pages, the exact source is citable:
      his own text, or a draft he approved. Testable by inspection against this
      REQ's record; needs none of his facts to be written down as a rule.
- [ ] **AC-b — nothing appears that he has not permitted.** No project name,
      screenshot, link or client name on any route that is not covered by his
      Q20 answer. Ticks empty-handed if Q20 comes back "no": the criterion is
      then met by nothing being added.
- [ ] **AC-c — the shipped visual identity is untouched (R5).** The change is
      words, images and links only; REQ-001 + REQ-002's look is not restyled.
      Verifiable as a diff-shape criterion, and it survives every answer.

### The content criteria — new 2026-09-05, on his answers

- [ ] **AC-d — both projects are on the site.** **Learning curve** and **Ong
      match** each appear as an entry on the route(s) that carry his work, each
      linking to its live URL (`https://learning.develyst.online/`,
      `https://ong.develyst.online/`). Testable by loading the pages.
- [ ] **AC-e — each entry says what the project is, from its own source.** The
      description of what each project *does* is traceable to something the team
      actually read — that repo or that live site — and the citation exists in
      the drafting record. No claim about *quality*, *scale* or *impact* appears
      unless he supplied it (that is AC-a's other half).
- [ ] **AC-f — his role appears exactly as he stated it, and no further.** Both
      entries may say he is the **sole author / wrote it all himself** (Q27=ก,
      Q22). Neither entry states a **date**, a **client or employer**, or a
      **result/metric** unless he has supplied it in writing by then (R9). A
      draft that fills one of those from the repo's git history or from the code
      **fails this criterion**.
- [ ] **AC-g — nothing shipped that he had not approved (R7).** For every entry,
      this REQ records the exact text he approved and the date. Zero published
      words without a matching approval line. This is the criterion that makes
      `ทีมร่าง` safe; if it cannot be shown, the REQ is not done.
- [ ] **AC-h — the whole-site scope (Q16 = `ทั้งเว็บ`) was actually looked at.**
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

## Where this REQ stands now — 2026-09-05, after his answers

**Every gate that was blocking has lifted, and the REQ is `READY_FOR_SA`.**
Nothing below is a guess; each line names the answer it stands on.

| Now settled | On what |
|---|---|
| The two projects **may be published** — names, screenshots, links | Q20 `ลงได้ทั้งคู่` |
| The **team drafts** the entry copy, from the four repos + two live sites | Q21 `ทีมร่าง` |
| **He approves every entry before it ships** (R7) — no exception | Q21's gate |
| His **role** on both: sole author, front and back | Q27 `ก` + Q22 |
| Scope is the **whole site**, not `/portfolio` alone | Q16 `ทั้งเว็บ` |
| An unsourced date/client/metric is **omitted, never filled** (R9) | R2 + R7 |
| Existing `/portfolio` entries **stay** until he says otherwise | Q28 default, declared |

**Still with him, none of it blocking:** **Q22-b** (dates · result), **Q28**
(keep/replace the old entries), **Q29** (screens showing other people's data).
Each one changes the drafts he will be shown, not whether drafting may start.

**What Sober can begin without another round-trip:** the whole spec — which
routes carry an entry, what shape an entry has in the shipped layout, how the
drafts are produced from the four handed-over repos and the two live URLs, and
where the draft text lands as a file for Porter to relay. The one thing a spec
**must not** do is write his facts: dates, clients and results are R9 territory
until Q22-b comes back.

## What happened the moment each gate lifted — the original table (2026-09-05)

Kept because it is the record of what was promised before the answers arrived:

| Answer arrives | What it unlocks, immediately |
|---|---|
| **Q27 = (ก) role** | Q21 is still open and must be answered; but the *role* field of Q22 is filled for both projects, from him, and never needs asking again. |
| **Q27 = (ข) he writes** | Q21 closes as "he writes"; the REQ becomes small — the team places his text and nothing is drafted. Q20 and the rest of Q22 stay open. |
| **Q20 = yes** (with any limits) | The two projects become publishable content; Porter writes R1's acceptance criteria against exactly what he permits. |
| **Q20 = no / partial** | REQ-003 shrinks to whatever he does permit, or closes. Better to learn this before anyone reads a line of that code. |
| **Q21 = team drafts** | The repos and live sites become source material; drafts go to him for approval, and **no draft ships unapproved**. |
| **Q21 = he writes** | The team stops at placing his text — no drafting at all, and the REQ becomes small. |
| **Q22 answered** | The last facts exist; the REQ becomes testable and moves `READY_FOR_SA` → Sober specs it → Fern builds → Tanya tests. |

**No duration is promised here.** Porter has no basis for one and does not invent
estimates. **Updated 2026-09-05:** the sentence "it is waiting on three answers
from him" is now **false** — he gave them. The wait is over and the work is the
team's; the next thing he owes is not an unblock, it is an **approval** of drafts
that do not exist yet.

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

> **EMPTY 2026-09-05. Nothing is approved yet and nothing may ship.**
> When he answers, Porter writes here: the exact approved strings (or his edits),
> which title he picked for each entry, the intro line, and the date. Only then
> does `TASK-017` leave `BLOCKED`. **Until this record exists on disk, AC-g is
> unticked and no word of the pack reaches the site.**
