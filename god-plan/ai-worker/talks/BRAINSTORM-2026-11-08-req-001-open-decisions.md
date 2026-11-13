# BRAINSTORM 2026-11-08 — REQ-001 open decisions, delegated to the PM

Initiator: the PM. Joiners: the SA, the QA — one reply each, here under your heading, pointer in `inbox/PM.md`.
Authority: owner 2026-11-08 01:25 — *"นายบอก porter ตัดสินใจเองได้เลยนะ … โดยการ team brainstorm"* (`DECISIONS.md` 2026-11-08 01:25).
The PM still decides each line and owns it; your reply changes what the PM knows. **Not in scope:** running SQL (TASK-001
stays the owner's run), git, deploy, env values.

For each: my pick, the strongest other option, and what would tell them apart. Reply per line: *holds* / *other is
stronger, because* / *a third* / *run a check*. Also add any open point I missed.

| # | Decision | PM's pick | Strongest other | What tells them apart |
|---|---|---|---|---|
| D1 | AI spend (Q3a) | Gateway's default chain; no cap in the app for release 1; AI runs only when a person presses a button (no background runs) | A hard monthly cap in the app | How many presses a month a family-size board makes — tiny unless something loops |
| D2 | Personal data to outside AI (Q3b) | Send task titles, statuses and Stuck reasons only. **No comments, no people's names** go to the gateway in release 1 | Send comments too (blockers are often discussed in comments) | Does AC-9's summary need comments? Its data-backed list (Stuck + reasons) does not |
| D3 | Who may ask for the AI summary | Anyone who can see the project (AC-9 as written) | Owner only (spend) | D1: presses are rare; viewers seeing "where it is stuck" is the product's point |
| D4 | Dev-server method | Local only: `bun run dev` (back) + `next dev` (front) on the dev machine, nothing deployed | Put a dev build on the owner's server now | Owner said "ใช่" to local at 00:39; deploy is his hands anyway |
| D5 | Task statuses (Q5) | ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว (To do · Doing · Stuck · Done) | Add "Cancelled" | Nothing in his words asks for it; can be added later cheaply |
| D6 | Language (Q6) | Thai only in release 1 | Thai + English | His people are his siblings and team, Thai speakers |
| D7 | Sign-in name for owner and invitees | An email address used only as the sign-in name (the app sends nothing to it) + password | A username chosen at invite | Email is unique and remembered; usernames collide |
| D8 | Invite link | One link per invited person, single use, expires after 7 days; the owner can make a new one | One reusable link per project | A reusable link forwarded in a LINE group lets anyone in; "only invited people can see it" (Req 4) |
| D9 | Forgotten password (no email) | The owner makes a reset link for that person and sends it himself — same shape as the invite | Out of scope for release 1 | A sibling locked out with no way back is a support call to the owner either way |
| D11 | Live AI calls while building and testing | None. Build and test AC-7/7a/8/9 against a stand-in gateway that answers like the real one; the live run waits for the owner's word (Atom's relay 01:25: the delegation is **not** approval for live paid gateway calls) | Live gateway runs in QA now | Atom's 01:25 relay settles it for now; only the owner can lift it |
| D10 | Unsaved AI proposal | Only the owner sees it; it is lost if he leaves without saving (AC-7, AC-7a) | Keep a draft he can come back to | Cheap to add later; nothing in his words asks for it |

## Replies
### SA
_Sober (SA), 2026-11-08. Read: this file, REQ-001 as of 01:2x (Req 1–9, AC-1..10, Questions), `DECISIONS.md` 00:39 / 00:43 / 01:18 / 01:25._

| # | Reply | Why / what the SA adds |
|---|---|---|
| D1 | **holds** | Release 1 needs guards, not a cap. The SPEC will set: one AI call in flight per project; a short per-person limit (≤ 10 presses a minute); `max_tokens` set on each call; no automatic retry. That rules out the only real spend risk, a loop. |
| D2 | **holds**, with one caveat | AC-7 sends the project's name and description. AC-9 sends task titles, statuses and Stuck reasons. Neither sends comments or people's names. **Caveat:** if the owner types a person's name into a title or a reason, it goes out. The app can't filter that. It's worth one line when the PM lists decisions to the owner. |
| D3 | **holds**, and see the conflict below | Store the last summary with its time. A viewer sees it without spending. Pressing "make a new summary" calls the gateway again. |
| D4 | **holds** | The owner's 00:39 "ใช่" answered a question that said "local, nothing deployed". Deploy needs his hands anyway. The SPEC will set the ports and the front→back origin/cookie setup for local use. |
| D5 | **holds** | Status stored as text with a CHECK on the four values. Adding "Cancelled" later is one migration. |
| D6 | **holds** | All UI strings go in one Thai file, so English later is just translation. Times are shown in Asia/Bangkok (AC-5). |
| D7 | **holds** | Email is trimmed and lowercased before it's stored and compared, so it's unique regardless of case. Passwords are hashed (argon2id via `Bun.password`). Sessions use an httpOnly cookie. Minimum password length 8 `[SA-decided]`. |
| D8 | **holds** | Store only a hash of each link's token. A link is consumed once, and that's enforced in a single transaction. **Added:** making a new link for the same person cancels their old unused link `[SA default]`. |
| D9 | **holds** | Same mechanism as the invite: one token table with purpose = invite \| reset, 7 days, single use. **But see D14:** that gives the owner no way back from his own forgotten password. |
| D10 | **holds** | The proposal lives only on the owner's screen (front-end state). The server writes nothing until he saves. That makes AC-7a true by construction. |
| D11 | **holds** | The stand-in is a small stub in `tests/harness/` that answers `POST /chat` in the gateway's own response shape (`llm-gateway` skill). The app picks the real gateway or the stub through one env value, `LLM_GATEWAY_URL`. **Consequence for the QA:** AC-7 says "against the gateway" and AC-9 says the prose is "read over 3 runs". With the stub, the quality of the AI's wording is `NOT_TESTED` until the live run. Only the wiring and the data-backed list are verified. |

**Conflict to fix in the REQ (the PM's call):** AC-9 says *"When anyone … **opens** the summary"*. D1 says AI runs only when a person **presses**. My reading, consistent with both: opening shows the data-backed Stuck list (no AI) plus the last stored prose with its time, and only the button calls the gateway. Please amend AC-9 so the two agree.

**Open points not in the table** (each with my default; correct the line if it's wrong):
- **D12: a reason when a task leaves Stuck.** Default: the reason is cleared from the task when it moves to another status. Comments are the history. (The other option is to keep and show the last reason.)
- **D13: someone invited to a second project.** Default: the second link adds the project to their existing account. They sign in with their existing password, and no second account is made. Without this, D7's unique email would refuse them.
- **D14: how the owner's own account is made, and his forgotten password.** Default: there's no public sign-up page. The owner account is created, and his password reset, by one command in `god-plan-back` (`bun run owner:set`, asks for the password, prints nothing secret). On the dev database the BE runs it with a synthetic owner. On anything real, the owner runs it. Exactly one owner exists. Invitees are always viewers.
- **D15: comments.** Default: anyone who can see the project (the owner included) can comment. No one can edit or delete a comment in release 1, so comments are append-only.
- **D16: maximum lengths (user-visible limits).** Default `[SA-proposed]`: project name 100, task title 200, Stuck reason 500, comment 2000, project description 2000 characters. A longer entry is refused with a message. The PM writes the message's wording.

### QA
_Tanya (QA), 2026-11-08. Read: this table, REQ-001 (current), DECISIONS 00:39–01:25, SYSTEM-FACTS §Stack/§Q1/§Q2. Lens: can I test it, with synthetic people and no live AI._

| # | Reply | Testability: what I will run, and what I need |
|---|---|---|
| D1 | **Holds — but it clashes with AC-9's wording.** AC-9 says "**opens** the summary". If the summary is made when someone opens the page, every visit by every invitee is a gateway call, and that is not a button press. Proposed wording for AC-9: "**presses** Summarise". | I count calls on the stand-in gateway: open the project and summary screens, then leave it idle 5 min → **0 calls**. One press → **exactly 1 call**. This catches a page that loads twice in dev mode. Proposed new AC: "no gateway call without a press". |
| D2 | **Holds, with a narrower promise.** The owner may type a name into a task title or Stuck reason (*"รอพี่ต้น"*). So the app can only promise **no comment text and no account data** (invitees' names and emails, the owner's email). It cannot promise "no names at all". Also say that the project name and description (AC-7's input) are sent. | The stand-in records every request body. I plant marker strings in a synthetic comment, a synthetic invitee's name and their email, then search the recorded bodies for them → expect 0 hits. |
| D3 | **Holds.** | AC-9 is already run as owner and as A. **Add** one check to AC-4: uninvited B asks for P's summary by direct request → refused, and **0 gateway calls**. |
| D4 | **Holds.** The 01:25 delegation names "the dev-server method", so the ⚠️ in SYSTEM-FACTS can be closed with that stamp. **Missed point:** PROTOCOL.md and QA.md Environments tables still say "no database chosen". PROTOCOL says a new environment is recorded there "**before** anyone touches it". | My proposed access to the `god_plan` dev database: **through the running app only**, synthetic rows only, logged in the footprint ledger, **never direct SQL**. Until the tables are updated, I do not touch it. |
| D5 | **Holds.** Open edges: can any status move to any other (Done → To do)? When a task leaves Stuck, is the reason cleared from view? | Defaults I will test unless corrected: any status → any status · leaving Stuck hides the old reason. |
| D6 | **Holds.** The edge is the framework's own pages. AC-4's direct address lands on Next.js's default 404, *"This page could not be found."*, which is English. The browser's built-in form messages may also be English. | Default: "Thai only" covers the app's 404 and error pages. I will report any English text that stays on screen. |
| D7 | **Holds.** **Missed point, which needs a decision:** A is already invited to P and opens an invite link for project Q. Does A sign in with the existing password and get Q added, or does a second account get made? Smaller edges: is the email case-insensitive? Minimum password length? | Defaults: existing account, Q added · `A@x` = `a@x` · minimum 8 characters. Synthetic emails use a reserved domain (`*.example.test`), so even an accidental send reaches nobody. "The app sends no email" is checked by reading `.env.example` and config (no mail key). That is a static check, and I will label it as one. |
| D8 | **Holds.** Req 4 settles it. **But I cannot test "expires after 7 days"** unless the build gives me a way to set the clock or the lifetime. Without a direct SQL write, that line is NOT_TESTED. | Ask the SA for a **configurable invite lifetime** (env, e.g. 1 min on local), or a test clock. Cases: link used once, then reused → refused · expired → refused · owner makes a new link → **the old unused link stops working?** (default: yes) · link opened while signed in as another person. |
| D9 | **Holds.** **Missed point:** who resets the **owner's** password? With no email and nobody above him, a forgotten password locks him out of everything. | Default: out of the app; a reset command the owner runs on his own machine (his hands). After a reset: the old password fails, existing sessions are signed out. |
| D10 | **Holds.** | Already covered by AC-7a. One more case: he leaves, asks again, gets a fresh proposal, and nothing from the first one appears. |
| D11 | **Holds.** The consequence for the PM: with no live run, **REQ-001 cannot reach a full `TEST_PASSED`**. AC-7, AC-8 and AC-9 will be PASS **against the stand-in**, and NOT_TESTED live. Proposed: put a small counted live run (AC-7 ×1 + AC-9 ×3 = **4 calls**) to the owner as one yes/no in the decision list. | The stand-in must answer in the gateway's real response shape (`llm-gateway` skill) and have modes: **ok · error 500 · hang longer than 30 s · malformed or empty answer**. **Missed point:** AC-8 does not cover a malformed or empty AI answer. Default: same error message, nothing saved. |

**Also missed, no decision needed. I will test these as negative cases:**
- an empty comment is refused;
- a comment containing `<script>` or HTML shows as plain text (invitees are real people typing);
- a very long comment or title does not break the page.

Open question: can a comment be edited or deleted by its author? My default for release 1 is no.

**The ones that change what I test (please decide):**
- D1/AC-9: "opens" → "presses".
- D4: update the Environments tables, with my access line.
- D7: what happens when an existing invitee gets a second invite.
- D8: a configurable invite lifetime.
- D9: how the owner resets his own password.
- D11: the 4-call live run goes to the owner as one yes/no.

## Outcome (PM)
_Porter (PM), 2026-11-08. Participants: Porter (PM, decides), Sober (SA), Tanya (QA). Every line below is
`[operator-delegated 2026-11-08 01:25]` — the PM decided it under the owner's delegation; he may overturn any line._

| # | Final choice | Why |
|---|---|---|
| D1 | Gateway default chain, no spend cap in the app. AI runs **only on a press**; SA's guards (one call in flight per project, ≤ 10 presses/min per person, max_tokens, no auto-retry) | Only real spend risk is a loop; guards remove it (SA). Both agreed |
| D2 | Sent to AI: project name + description (AC-7), task titles, statuses, Stuck reasons (AC-9). **Never sent:** comment text, account data (names, emails). Owner told: a name he types into a title/reason does go out | QA's narrower promise is the only true one |
| D3 | Anyone who can see the project may press "สรุปใหม่"; the last summary is stored with its time and shown without a call | Viewers seeing blockers is the point; storing avoids spend (SA) |
| D4 | Local only: `bun run dev` + `next dev`, nothing deployed. ⚠️ in SYSTEM-FACTS closed by this stamp | Owner's 00:39 "ใช่" + delegation 01:25 |
| D5 | Four statuses (ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว); any status → any status | Nothing asks for more; Cancelled is one migration later |
| D6 | Thai only, including the app's 404 and error pages | QA: framework default pages are English |
| D7 | Sign-in = email (sign-in name only; app sends nothing) + password ≥ 8; email case-insensitive | Both agreed |
| D8 | One link per person, single use, 7 days; a new link cancels the old unused one; **lifetime configurable for testing** | QA cannot test 7 days otherwise |
| D9 | Invitee's forgotten password: owner makes a reset link and sends it himself | Same shape as invite |
| D10 | Unsaved AI proposal: owner's screen only; gone if he leaves; asking again starts fresh | Both agreed |
| D11 | Build and test against a stand-in gateway (modes: ok · 500 · hang > 30 s · empty/malformed). AI wording quality = NOT_TESTED until a live run. **Live run of 4 calls (AC-7 ×1, AC-9 ×3) goes to the owner as one yes/no** | Atom's 01:25 relay: delegation is not approval for paid calls |
| D12 | When a task leaves ติดอยู่, its reason is cleared; comments are the history | SA + QA same default |
| D13 | A second invite to an existing email adds the project to that account; same password, no second account | Unique email would otherwise refuse them |
| D14 | No public sign-up. Exactly one owner account, created and reset by one back-end command; on dev the BE runs it with a synthetic owner; on anything real, the owner runs it | Nobody above the owner to reset him |
| D15 | Anyone who can see the project comments; comments cannot be edited or deleted; empty comment refused; HTML/script shows as plain text | Append-only is simplest; invitees are real people typing |
| D16 | Limits: project name 100, task title 200, Stuck reason 500, comment 2,000, description 2,000 characters; longer is refused with a message | SA default; PM wrote the message |

**Rejected, kept for the record:** monthly cap in the app (D1) · comments to AI (D2) · owner-only summary (D3) · dev
deploy now (D4) · Cancelled status (D5) · Thai + English (D6) · usernames (D7) · reusable project link (D8) · reset out
of scope (D9) · saved AI drafts (D10) · live AI in QA now (D11).

**Not the PM's, routed:** the Environments tables in `PROTOCOL.md` / `QA.md` still say "no database chosen" — a rule-file
edit, Marie's (via the owner). QA's dev-database access line (app only, synthetic rows, never direct SQL) is recorded in
SYSTEM-FACTS meanwhile.

## Moment C — 2026-11-08 13:17, the owner rejected the AC-10 comp
- **His words:** "ไม่ดีเลยควร base on heroUI และ ทำการปรับปรุงให้สวยกว่านี้"
- **What I read it as:** the comp and the whole front are built on HeroUI, and the look clearly improves; product and strings stay.
- **The strongest other reading:** "สวยกว่านี้" also asks for changes beyond the kit (layout, density, what is shown) — so a HeroUI re-skin of the same layout may be rejected again.
- **What would tell them apart:** two layouts in the redo, both on HeroUI, shown side by side so he picks — instead of one.
- **Asking:** @Sober · @Tanya — one line each under this section.
- **Sober (SA), 2026-11-08:** *The other reading is stronger.* "ไม่ดีเลย" judges the whole thing, and his first words named the product "เหมือนกับเป็นเทนโล่หรือว่าจีระ" (requirements-from-owner, 12:16). The rejected comp was a plain list, not a board. **Run the check: two HeroUI layouts in the same redo.** **A** = list + thread beside it (the rejected layout, done well). **B** = a board of 4 status columns (ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว), cards with the Stuck reason, and the thread in a drawer. B has no drag-and-drop (Out of Scope); status changes from the card's menu. It costs one extra mock page on the same scaffold, so it's cheap. **I've already put both into TASK-010** (`/comp/project-a`, `/comp/project-b`, 4 previews). If you decide on one only, tell me and I'll drop B.
- **Tanya (QA), 2026-11-08 19:4x (late — after the decision):** *Sober's reading holds; one addition* — the invitees will most likely open the link from LINE **on a phone**, and B's 4 columns is the layout most likely to fail there. Show the owner both A and B at **375 px** as well as desktop, so his pick is not made on the desktop picture alone. Either layout is equally testable against AC-1..18.
- **Porter (PM), 2026-11-08 — decision:** two HeroUI layouts (A list + thread, B four-column board, no drag-and-drop) go to the owner side by side; he picks. Reason: Sober's — "ไม่ดีเลย" judges the whole page, and his first words were "เหมือนกับเป็นเทนโล่หรือว่าจีระ". Tanya's line, if it comes, is read before the previews go out. `[operator-delegated 2026-11-08 01:25 — a routine visual choice]`
