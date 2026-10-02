# TASK-586 — item 8: the camp Close / Open / Delete screen — FE, S/M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-30) · **Size S/M.** 🔓 **Unheld: the owner ruled, and @Jason's half is in.**

## §0 ⚠️ First
**Re-read the front repo and say so.** 🚫 **Palm's items 4, 9, 11.**

## §1 What the server now means
- **Close = stop NEW bookings. Nothing else.** ✅ **Existing bookings stay, coach blocks stay (past and future), BOTH reminders keep going, the per-day swap still works — and the week still charges its days, because they still run.**
- 🔑 **Close ⇒ Open restores the week EXACTLY** (proven by value) ⇒ **your words may say so without hedging.**
- **Delete: only when the camp has NO bookings, checked by the server AT THE MOMENT of the act** — **a camp that gained a booking while your dialog was open is refused, told how many, and pointed at Close.**

## §2 The work
- **Close · Open · Delete, with the server's refusals VERBATIM.** 🚫 **Never paraphrase them** — *the delete refusal already tells the admin how many bookings and what to do instead.*
- 🔑 **The words must not over-claim.** ⚠️ **"Close" must not read as "cancel", "hide" or "turn off"** — **it stops new bookings and the rest of the week continues.** 📋 **Drafts into `COPY-REVIEW-2026-09-29.md`, both languages, shape-pinned.**
- 🔴 **`bannerWeeksFor` HIDES closed weeks from the calendar banner.** ⚠️ **That was written when Close meant "camp off". It may now be wrong.** 🔑 **Derive what hiding it costs an admin now that the week is still running, still staffed and still charging** — **and say what you decided and why.** 🚫 **Do not change it silently either way.**
- ⚠️ **Delete must not be offered where it cannot succeed** — but 🔑 **the server is still the decider: a hidden button is a convenience, never the guard.**

## §3 The proof
🔑 **Clicked: Close sends one request and nothing else · Open the same · Delete on a camp with bookings shows the SERVER's refusal and leaves the camp alone.** ✅ **Assert the REQUESTS, not the screen.**

## Definition of Done
- [ ] All three act, refusals **verbatim** · 🔑 **the copy does not read as cancel / hide / off** · 🔴 **the banner question DERIVED and decided out loud** · delete offered honestly, **the server still the guard** · 🔑 clicked, asserting the requests · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch, CHECKSUM · report + `inbox/SA.md` + log.

---

# 📤 REPORT — @Fern → @Sober (2026-09-30)

## §0 ✅ Front repo re-read first
🚫 Not from memory. `git log` read only — the tip is still `ffa8e9f`, so the tree is the one I left plus my own uncommitted work. I read the camp page, `lib/camp/units.ts`, the camp wire and hooks, **and @Jason's TASK-581/560 backend**: the status branch in `updateWeek`, `deleteWeek`'s refusal, and the three comments where he recorded that a CLOSED week keeps its blocks, its reminders and its charges. 🚫 Palm's items 4, 9, 11 untouched.

## §1 What I found before writing anything
**Close already existed — one tap, no confirm.** ⚠️ **What did NOT exist:**
- 🔴 **a way back.** A closed week could be closed and **never reopened from this screen.** *The server restores it exactly; the UI simply had no door.*
- 🔴 **Delete.** @Jason shipped it in TASK-560 and no screen called it.
- ⚠️ **And the words over-claimed:** `weekStatus_CLOSED` was *"ปิดแล้ว" / "Closed"* and the toast said *"no new days can be planned into it"*. **A week that is still running, still staffed and still charging was being labelled as shut.**

## §2 The three acts
- **Close** → one `PATCH { status: "CLOSED" }`. **Take bookings again** → one `PATCH { status: "OPEN" }`, on the same key, because it is the same decision reversed.
- **Delete** → `DELETE /camp/weeks/:id`, **no body**: *"is it empty?"* is the server's question and it asks it **at the act**. 🔑 **The refusal is shown VERBATIM, in the dialog, not a toast** — it already says **how many bookings** there are and **to stop new bookings instead**, and that is the whole of its value. 🚫 `retry: false`, because a silent retry could report a different count than the one the admin is reading.
- ⚠️ **Delete is offered only on a week with no children counted — and that is a CONVENIENCE, not the guard.** The server decides; the test that proves it is the refused one.

## §3 🔴 `bannerWeeksFor` — derived, decided, and NOT changed quietly
**What hiding a closed week costs, now:** the banner is **the only thing on the calendar that says camp is running** — the grid has no camp cells. **A closed week still has children at camp, coaches blocked, reminders going out and days charging.** ⇒ **An admin looking at a Tuesday with eight children and two coaches at camp saw an empty strip.** *That is not a cosmetic loss; it is the fact the component exists to carry.*
⚖️ **Decided:**
- **OPEN ⇒ always shown**, even at zero — it can still be sold into, and the row is the door to that.
- **CLOSED ⇒ shown only on a day that HAS children** — that is exactly "still running". 🚫 **A closed week with an empty day stays hidden**, because it has nothing to sell and nothing to run, and showing it would be noise an admin learns to ignore.
- 🔑 **And the row is MARKED closed**, greyed, with *"Closed to new bookings"*. **That marker is why showing it is safe:** *a week that cannot take a booking must not look like one that can.*
📌 **The reasoning is in `units.ts` and in the pin, not only in this report** — and **both mutations are covered**: hiding them again bites, and showing empty ones bites too.

## §4 The copy — it must not read as cancel, hide or off
🔴 **Two existing strings changed** (`weekStatus_CLOSED`, `weekClosedOk`) and **the button's label** (*"Close"* → *"Stop new bookings"*), because *"ปิดแล้ว"* reads as **the camp is off** — and an admin who reads it that way tells a parent the wrong thing, **with the screen as the source.**
✅ **The close message now says what CARRIES ON** — the children keep their days, the coaches keep their sessions, the reminders still go out — **and that bookings can be taken again at any time, with no hedging**, because the server restores the week exactly.
📋 **6 new + 3 changed, both languages, filed as COPY-REVIEW §14**, with the banner behaviour change called out for the owner. 🚫 **No new words for any refusal: every one is the server's own sentence.**
🔑 **Pinned over BOTH languages:** no lifecycle string may contain *cancel / hidden / hide / turned off* or *ยกเลิก / ซ่อน / ปิดทั้งสัปดาห์*; the chip and the button must both name **new bookings**; the close message must say what carries on and that it is reversible; and the delete body must point at the other door.

## §5 The proof — 🔑 clicked, asserting the requests
**7 clicked tests:** Close sends **one** PATCH with `{ status: "CLOSED" }` **and nothing else** (no DELETE, no other week touched) · Take-bookings-again sends **one** the other way · a row never offers both · 🔴 **a refused delete shows the server's sentence byte-for-byte (`toBe`, not `toContain`), with `3 รายการ` and `ปิดรับ` in it, one DELETE attempted, NO status PATCH behind the admin's back and NO success toast** · an accepted delete sends one DELETE and says so · Delete is absent where children are counted.
⚠️ **And one assertion I had to fix for the right reason:** *"nothing on this screen says cancelled / hidden / off"* was reading `document.body.textContent`, **which includes Mantine's injected stylesheet — `.mantine-hidden-from-xs` matched "hidden".** 📌 **A pin that can be satisfied by a stylesheet is not a copy pin.** ✅ Moved to `camp.test.ts` where it covers **both languages**, which is where it belonged.

## §6 🔑 Break-and-watch — 10 mutations, all BITE
`scripts/mutation/task-586.json` · **BASELINE 28/0, 251 B green** · **CHECKSUM identical.**

| # | mutation | verdict |
|---|---|---|
| K1 | 🔴 the delete refusal replaced by a generic message | ✅ BITES 27/1 |
| K2 | 🔴 a refused delete claims success | ✅ BITES 27/1 |
| K3 | Close sends the wrong status | ✅ BITES 27/1 |
| K4 | 🔴 the way back disappears | ✅ BITES 25/3 |
| K5 | 🔴 the banner hides closed weeks again | ✅ BITES 26/2 |
| K6 | the banner shows EMPTY closed weeks too | ✅ BITES 27/1 |
| K7 | 🔴 the banner stops marking a closed week | ✅ BITES 27/1 |
| K8 | 🔑 the chip reads as "off" again | ✅ BITES 24/4 |
| K9 | the close message stops saying what carries on | ✅ BITES 27/1 |
| K10 | the delete body stops offering the other door | ✅ BITES 27/1 |

📌 **K5 and K6 are a pair on purpose:** the banner rule is a judgement, so **both directions of getting it wrong are pinned** — hiding a running week, and cluttering the strip with empty ones.

## §7 Verification
**870 pass / 0 fail across 91 files** (was 858/90 ⇒ **+12 tests, +1 file**) · **tsc clean** · **`bun run build` ok** · mutation pass **CHECKSUM identical**.
🚫 No SQL, no database, no environment · no BE change · no deploy request · git read only.
⚠️ **Declared: four existing pins updated, none weakened** — the banner's date-math pin (**rewritten with the argument in it**), the banner render pin (a closed week is now expected, marked), the camp copy count 80 → 86, and the key-literal sweep 104 → 106 (**both new doors are on the EXISTING `camp.week-open` key** — the owner's one key for a week's lifecycle; 🚫 no new key).
⚠️ **Not proven by me:** CSS, focus and a real tap · whether the greyed banner row is distinguishable enough on the owner's screen (**Tanya's**) · and **§3 is a judgement, so if you or the owner want closed weeks hidden again, it is one line and the pin says which line.**

**Ball: @Sober.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-30) · **item 8 is complete**
Verified by me: **870 pass / 0 fail** across 91 files · tsc 0 · build ok.

## 🔴 §1 — what the reading found before she wrote anything
**Close existed with NO WAY BACK from that screen: a week could be closed and never reopened, though the server restores it exactly.** **And Delete shipped in TASK-560 with no screen calling it.**
🔑 **We had shipped a one-way switch whose reverse already worked** — *the capability was there and the door was not.* 📌 **That is the second time this fortnight that reading first found something bigger than the ticket.**
⚠️ **And the words over-claimed: *"Closed"* on a week that is still running, still staffed and still charging.**

## ✅ §2 — the acts, and the refusal handled with real care
**Close and "take bookings again" are the same decision reversed, on the SAME key.** ✅ **Delete sends no body — *"is it empty?"* is the server's question, asked AT THE ACT.**
🔴 **The refusal is VERBATIM, in the DIALOG rather than a toast, `toBe` not `toContain`** — *it already names how many bookings and points at Close, and that is the whole of its value.*
🔑 **And `retry: false`, "because a silent retry could report a different count than the one the admin is reading."** 📌 **That is a subtlety nobody asked for and it is exactly right.**
✅ **Delete offered only where no children are counted — a CONVENIENCE — and the refused test is what proves the guard is the server's.**

## ⚖️ §3 — the banner: derived, decided OUT LOUD, and I am accepting it
**What hiding costs NOW: the banner is the ONLY thing on the calendar that says camp is running** (the grid has no camp cells) **⇒ an admin looking at a Tuesday with eight children and two coaches at camp saw an empty strip.**
✅ **Decided: OPEN ⇒ always shown · CLOSED ⇒ only on a day that HAS children · and the row is MARKED closed.**
🔑 **The marker is why showing it is safe: a week that cannot take a booking must not look like one that can.** ✅ **An empty closed day stays hidden, because it would be noise an admin learns to ignore.**
✅ **Both directions of getting it wrong are mutated (K5 hides a running week, K6 clutters the strip), and the reasoning is in the code AND the pin.**
⚖️ **Accepted as decided.** 📌 **It is a visible change, so it goes to the owner as a NOTIFICATION with the copy, not as a question** — **and she has said which single line reverses it.**

## ⚠️ The assertion she fixed, and it is a keeper
***"Nothing here says cancelled / hidden / off"* was reading `document.body.textContent` — which includes Mantine's INJECTED STYLESHEET, and `.mantine-hidden-from-xs` matched "hidden".**
🔑 ***"A pin that can be satisfied by a stylesheet is not a copy pin."*** ✅ **Moved to where it covers BOTH languages** — which is where the DoD's *"must not read as cancel/hide/off"* belonged. **Recorded.**
📌 **Same family as her `document.body` finding in TASK-567: the surface being asserted was not the surface that holds the claim.**
✅ **Both new doors on the EXISTING `camp.week-open` key — no new key.** ✅ **Copy pinned over both languages, including that the close message must say WHAT CARRIES ON and that it is reversible.**
