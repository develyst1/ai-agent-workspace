# REQ-105: CAW always sees the latest spec — a version label is only a tag

- Status: **DELIVERED + COMMITTED** (2026-10-30 12:2x — owner's "ขึ้น git REQ-105 ที่เหลือ": blueprint-back e4b2579 · blueprint-front 282e426 · caw-back 67dfe55 · caw-front 7359fa3, all pushed, PM verified; earlier B commit 27cbd1b / 4a071bc) · DELIVERED (2026-10-30 12:0x, the PM — QA's TEST_PASSED; NOT_TESTED: nothing in the ACs; REQ-108 phase 2 is the live end-to-end) · was TEST_PASSED (2026-10-30 11:54, QA Tanya — DEF-1 fixed by TASK-140; tested trees: bp-back 9578d51+`bfa66c01b56c` · bp-front b041cbd+`61317ffea9b1` · caw-back 58ab883+`f80e56880896` · caw-front 7ef4a1e+`1c1cf758f4de`; TEST-110 § Re-check) · was TEST_FAILED (joint run, 2026-10-30 11:40, QA Tanya — AC-1…AC-5 + Q6 PASS on the real Blueprint; AC-6 FAIL only on blueprint-front `check:api` after TASK-113, additive (TEST-110 DEF-1, MINOR); `tests/TEST-110-caw-reads-latest-spec.md` § Joint run) · was READY_FOR_SA (2026-10-29, the PM) — design now; build after REQ-103 has passed QA (it changes versions into labels)
- Priority: HIGH `[owner GO 12:41, plan order 2]`
- Requested: 2026-10-29 by the owner — stamp `operator` (`DECISIONS.md` 10:51 point b, 11:41 items 2 and 4, relayed by Atom)
- Deadline: none
- Depends on: REQ-103 (labels) · gap facts `maps/blueprint-gap-102.md` § b, `maps/caw-gap-102.md` b1–b6
- Teams: **A** = what Blueprint serves and when it tells CAW · **B** = what CAW reads and when. 🔴 **The seam contract is Blueprint's** (Team A). Any change to it goes through the PM; the two SAs do not talk to each other. Team A writes the new contract into its SPEC first; Team B designs against it.

## The need (owner, via Atom)

> 10:51 (b): "So CAW must always see the LATEST spec immediately, not separate versions; a version label is only a tag for work."
> 11:41 item 4 (accepted): CAW sees every saved edit; a hop that is running keeps the spec it started with; the next hop sees the latest.
> 11:41 item 2 (accepted): the "ส่งไปสร้างที่ CAW" button always works.

## Problem / Goal

Today CAW reads only confirmed version snapshots by number. A card is pinned to the version it was cut from, and an edit made
between two confirms is invisible to CAW (`maps/caw-gap-102.md` b1–b4). The owner wants Blueprint to be the live store,
with CAW always building from what is there now.

## Requirement

1. CAW reads the **current** spec from Blueprint, not a numbered snapshot.
2. CAW learns about a saved edit in Blueprint quickly (target: within 30 s) without anyone confirming or labelling.
3. A hop reads the spec once, at its start, and keeps that for the whole hop. The next hop reads the latest.
4. A version label, when present, travels as a **tag** (shown on the project and kept on cards as "cut at label X"), never as the selector of content.
5. A CAW project can start from a Blueprint project that has no label (the `/start` link works without `version`).
6. When a part a card depends on changes, the card shows that it changed (today's "spec เปลี่ยน" flag), and the worker's next hop reads the new text.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a CAW project built from a Blueprint project **When** the PM edits a part in Blueprint and saves (no label) **Then** within 30 s CAW shows the card that depends on it as changed, and the part reader in CAW shows the new text.
  - Check: QA, both apps locally; timestamps.
- [ ] **AC-2** — **Given** a hop is running on that card **When** the part changes mid-hop **Then** the running hop finishes on the text it started with, and the next hop on the card reads the new text.
  - Check: QA, stub CLI that prints the part text it was given at start; two hops.
- [ ] **AC-3** — **Given** a Blueprint project with **no** label **When** the user clicks "ส่งไปสร้างที่ CAW" **Then** CAW opens a board for it (no "ลิงก์นี้ไม่ครบ").
  - Check: QA.
- [ ] **AC-4** — **Given** labels "v1" and later "v2" on the project **When** the user looks at CAW **Then** the project shows the latest label as a tag, cards keep "ตัดงานที่ป้าย v1" as history, and the content shown is the latest spec either way.
  - Check: QA.
- [ ] **AC-5** (unhappy) — **Given** Blueprint is down **When** CAW tries to read **Then** CAW keeps working on what it last read, and shows that Blueprint is unreachable. When Blueprint is back, CAW catches up without a restart.
  - Check: QA, stopping blueprint-back for 60 s.
- [ ] **AC-6** (regression) — existing seam calls that CAW still uses behave the same, and both repos' tests pass (counts per TEST-101, new tests on their own line).
  - Check: QA.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| project tag (CAW header) | ป้าย {label} | Label {label} |
| project with no label | ยังไม่มีป้าย | No label yet |
| card history | ตัดงานที่ป้าย {label} | Cut at label {label} |
| card cut with no label | ตัดงานก่อนมีป้าย | Cut before any label |
| Blueprint unreachable (CAW) | ติดต่อ Blueprint ไม่ได้ตอนนี้ — ทำงานต่อจาก spec ล่าสุดที่อ่านได้ | Can't reach Blueprint right now — working from the last spec read |

## Constraints

- This machine; stub CLI for the ACs (live CLI allowed if useful, log it). No gateway call.
- The seam change is designed by Team A and routed by the PM. Team B builds against Team A's SPEC section.

## Out of Scope

- Persistent CLI sessions (REQ-106). · Login. · Migrating projects that already exist in a real database (there are none yet; the TEST DB is test data).

## Questions

- **Contract ready (SA A, 2026-10-29)** — the new seam contract Team B builds against is `specs/SPEC-106-seam-latest-spec.md` § "Seam contract v2". It adds four read routes under `/v1/projects/{projectId}/spec…` and a `spec.changed` push. Every route CAW uses today is unchanged. **PM, please route it to Team B.** Blueprint's build (TASK-113) waits for REQ-103 and REQ-110 to be committed.
- **Q1 (SA A → PM → Team B, does not block)** — does CAW's push receiver ignore an unknown `event` value? If it rejects one, Blueprint sends `spec.changed` to a second URL instead. Default: same URL, ignored if unknown. → SPEC-106 § Risks / questions.
  > PM 2026-10-29: contract + Q1 routed to SA B. Hint from the desk's own file (not an answer): `maps/caw-gap-102.md` b3 says CAW's push accepts only `event: "version.confirmed"` (`caw-back → src/http/routes/follow.ts:6,11`). SA B answers here from caw-back and designs against SPEC-106 § "Seam contract v2". Any change SA B needs in the contract comes back through the PM.
  > answer (SA B, Silver, 2026-10-29 14:4x): **today CAW rejects it** — run on a local API (`pglite:memory`, :4531): `spec.changed` → **400** `validation` ("expected \"version.confirmed\""), because `caw-back → src/http/routes/follow.ts:11` is `z.literal("version.confirmed")`. **No contract change is needed:** Team B's TASK-115 widens the receiver on the **same URL**: `version.confirmed` as today, `spec.changed` → 202 + pull, any other event → 202, ignored (SPEC-107 D8). Until TASK-115 is built, Blueprint's `spec.changed` gets a 400 there. That is harmless: the push is best effort, logged as a code, and the poll catches up (SPEC-106 V3). So Team A needs no `CAW_SPEC_NOTIFY_URL`.
- **Q2 (SA B → PM, does not block: the TASKs are on hold anyway)** — when a saved edit changes a part a card depends on, does the card still **stop** until the operator clears "spec เปลี่ยน" (today: `caw-back → src/cards/view.ts:23`, "the operator has seen the changed spec and says the card may go on", `src/cards/service.ts:219-225`)? Checked: DECISIONS 11:41 item 4 (a running hop keeps its spec; the next hop sees the latest) and REQ-105 req. 6 — neither says whether the next hop waits for the operator. **Default: yes, it stops, as today** (SPEC-107 D7). Cases: a running hop is never stopped by it · the next hop on that card waits for "clear" · now that every saved edit counts, not only a label, a busy editing session can stop many cards (they count as "stuck" on the home page, `projects/service.ts:121`) · the other choice (the flag only shows, work goes on with the new text) is one line in `view.ts` and changes AC-1's "shows as changed" in no way. Correct only the line that is wrong.
  > answer (PM, 2026-10-29 `[PM-decided]`): **No, it does not stop.** The flag only shows; the next hop goes on with the latest text. Interpreted `DECISIONS.md` 11:41 item 4 ("the next hop sees the latest") together with 10:51 (b) ("CAW must always see the LATEST spec immediately") — stopping on every saved edit would freeze the team during a normal editing session. A running hop is still never stopped. Cheap to reverse (one line in `view.ts`); I tell the owner this reading in one line.
- **Q3 (SA B → PM, wording, does not block)** — three existing sentences mention a version, which REQ-105 removes. SA's defaults, carried in TASK-116 until you answer: `/start` incomplete link `ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน` → **`ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์`** · `เวอร์ชันนี้ยังไม่ได้ยืนยันใน Blueprint` → **removed** (CAW no longer refuses a version) · proposal refusal `บางงานในข้อเสนอนี้ไม่มีใน spec เวอร์ชันนี้แล้ว — เริ่มงานไม่ได้` → **`บางงานในข้อเสนอนี้ไม่มีใน spec แล้ว — เริ่มงานไม่ได้`** · the projects list chip `spec เวอร์ชัน {n}` → **your `ป้าย {label}` / `ยังไม่มีป้าย`** (same as the header). Checked: REQ-105 § User-facing wording covers the new words only, not these. Correct only the line that is wrong.
  > answer: all four accepted as written. — Porter (PM) 2026-10-29 `[PM-decided]`
- **Q4 (SA B → PM, wording + one small behaviour, does not block)** — asked 2026-10-29 18:2x. When the part a card is anchored to is **removed** from the spec, the card's context today answers "Blueprint unreachable" (TASK-114 kept the old behaviour). That is the wrong reason. **Default:** CAW answers a distinct `anchor_removed`. The card page shows **`ส่วนนี้ถูกลบออกจาก spec แล้ว — งานนี้ทำต่อไม่ได้จนกว่าจะย้ายไปส่วนอื่นหรือปิดงาน`**, and the card is not workable (no hop starts on it). Built in TASK-115 (back) + TASK-116 (front). Correct the words or the "not workable" line if wrong. Checked: REQ-105 § User-facing wording and Q2/Q3 — no sentence for a removed part.
  > answer: the words and the "not workable" rule are accepted as written. — Porter (PM) 2026-10-29 `[PM-decided]`
- **Note (SA B → PM, information)** — CAW's side of REQ-105 is built against Blueprint's v2 contract (SPEC-106), with a stand-in for Blueprint's answers. Team A's TASK-113 (the real v2 routes) is still on hold. REQ-105 can only be proven end to end after TASK-113 is built and QA runs both together.
- **Note (SA B → PM, information, 2026-10-29 19:2x)** — a card whose spec part was removed (Q4) shows the PM's sentence on its page, **with no timeline and no comment box**: CAW sends a card's notes only inside its context, which now answers "removed". `[SA-decided]`, cheap to reverse. If users should still read or add notes there, say so and it becomes one small back TASK (a notes route) + front.
  > answer: accepted as is, no new TASK — the removed-part card is rare and its next step is to move or close it; notes there wait until the owner asks. — Porter (PM) 2026-10-29 19:2x `[PM-decided]`
- **Q5 (SA B → PM, 2026-10-30 08:1x — what Team B can move before TASK-113; your call, git order is the owner's)** — Team B's code for REQ-105 is all DONE and uncommitted (TASK-114/115/116). Every AC here needs the real Blueprint, so a full verdict waits for TASK-113. REQ-112 B (TASK-121/122) waits for REQ-105's **commit** in caw-back (PROTOCOL § Repo layout, F-013), not for TASK-117 to be built: TASK-121 can be built and tested on the stand-in that carries `relatedDecisions`.
  **Options:** (A) wait — nothing moves on Team B until TASK-113 → joint QA → owner's ขึ้น git REQ-105. (B) **my default:** QA runs the CAW-side parts now on the stand-in (AC-2 pinned hop, AC-3 `/start` without a label, AC-4 tag + "ตัดงานที่ป้าย", AC-5 down/up, AC-6 caw-back + caw-front suites); if they pass, the owner may say "ขึ้น git REQ-105 (caw-back + caw-front)"; I commit, and TASK-121 → TASK-122 start at once. AC-1 and the joint run stay open until TASK-113. Risk: if Blueprint's real v2 answers differ from the stand-in (field names, what `added` means), CAW needs a small fix in a later commit.
  **Cases:** the joint run fails on a contract difference → a CAW fix TASK on top of the commit · REQ-112's own AC proof still needs TASK-117 live → its verdict waits either way · REQ-108 is unaffected.
  Checked: DECISIONS 2026-10-30 02:4x (order 105 → 112 → 108; nothing on a split commit) · DECISIONS 2026-10-29 12:41 (commit per topic) — a split commit of one topic is not covered, so it is asked, not decided.
  > answer (PM, 2026-10-30 08:2x): **QA runs the CAW-side ACs on the stand-in now** (AC-2…AC-6 as you list) `[PM-decided]` — cheap, no git, finds problems early. **The split commit is not asked yet:** REQ-110's commit (the only thing TASK-113 waits for) needs just the owner's own words, so the joint run may come soon and make a split unnecessary. If REQ-110's git stays stuck after QA's CAW-side pass, I put the split to the owner then. — Porter
  > SA B note for the QA run (2026-10-30 08:3x): a runnable stand-in is ready — `tests/harness/stand-in-blueprint-105.ts` (header = usage). It serves caw-back's own test fake (recorded v1 + synthetic v2) on a fixed port (default 4290) with `POST/GET /__mode` to take Blueprint down/up, set or clear the label, save an edit (revision + 1 → a change set), switch the part text, and remove/restore a part. SA ran it 08:3x: `/spec` → revision 1, label v1; one edit → `/spec/changes?after=1` lists rev 2; down → 500; stopped by pid, port free. Synthetic v2 is not proof of Blueprint's real answers (AC-1 + joint run stay for TASK-113). — Silver

## Verification (by QA)

CAW side only, on QA's own Blueprint stand-in (written from SPEC-106 v2, seeded with the recorded worked seed), as the PM asked (Q5 answer). Build: caw-back a17ff11 + fp `02d4d26377b6` · caw-front f071c02 + fp `9fe6b0658829`. Detail: `tests/TEST-110-caw-reads-latest-spec.md`.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | NOT_TESTED (stand-in indicator: an edit seen in 7.2 s by poll alone) | needs the real Blueprint v2 (TASK-113) |
| AC-2 | PASS (stand-in) | real runner + QA stub worker: hop 1 read "QA-AC1" before and after a mid-hop edit (pinned); hop 2 read "QA-AC2" |
| AC-3 | PASS (stand-in) | `/start?project=<no label>` → board, "ยังไม่มีป้าย"; API 201 version 0 |
| AC-4 | PASS (stand-in) | header "ป้าย v2", card B "ตัดงานที่ป้าย v1", card A "ตัดงานก่อนมีป้าย", list chip "ป้าย v2"; content = latest |
| AC-5 | PASS (stand-in) | stand-in stopped 60 s: unreachable sentence, last read served (fromCache), a hop still ran; back → caught up in 6.3 s, same API process, resumed from its last revision |
| AC-6 | PASS | notify 202/400/202/202; no v1 call to Blueprint; rebuild-check same; caw-back 863/1/1 (known execPath), caw-front 340/0 + e2e 270 passed (1 timing flake, passes 3/3 alone — TEST-110 O-1) |
| joint run | **TEST_FAILED** (2026-10-30 11:40) → **PASS after TASK-140** (11:54: bp-front `check:api` matches, unit 235, states 34, required 948/0) | real blueprint-back + TASK-113, caw 58ab883 + TASK-138 / 7ef4a1e + TASK-139: AC-1 7.0 s poll-only / 0.3 s push · AC-2 pin held · AC-3 via Blueprint's own button · AC-4 tags · AC-5 60 s out, back in 2.1 s · Q6 "ป้าย 2" no null · no v1 calls · suites green **except blueprint-front `check:api`** (4 new v2 routes missing from its client, additive) → DEF-1 MINOR |

## AC check (SA A — Sober, Team A side, 2026-10-30 12:0x)

Team A's half is TASK-113 (blueprint-back seam v2, SPEC-106). Team B's half is TASK-114/115/116 (SPEC-107), DONE and committed (board); its rows are SA B's. "Where it is met" is Blueprint's side only.

| AC | Where it is met (Team A deliverable) | Self-checked |
|---|---|---|
| AC-1 | Every saved edit raises the project's `revision` by 1 and pushes `spec.changed` after commit (`src/spec/store.ts` apply/undo → `notifySpecChanged`); `GET …/spec/changes?after=` names the changed keys; `GET …/spec/parts/{key}/context` reads the latest text. Tests `test/seam/spec-v2.test.ts`, `spec-push.test.ts` (TASK-113; Sober's re-run 119/0). The "within 30 s on CAW's card" half is the joint run. | yes (Blueprint side); joint run → QA |
| AC-2 | Blueprint side: `revision` + `savedAt` on every read, so CAW can pin a hop to the revision it started with (the pin itself is CAW's, TASK-114). | yes (Blueprint side) |
| AC-3 | `GET …/spec`, `…/spec/locate` and context work with **no label** (`latestLabel` null; locate-latest returns candidates where v1 refused 409, spec-v2 test). | yes |
| AC-4 | `latestLabel` `{version, label, labelledAt, by}` on `/spec` and `/spec/changes` (spec-v2 test). | yes (Blueprint side) |
| AC-5 | Blueprint side: the changes feed lets CAW catch up from its last `rev` after an outage (`more` paging at 500, tested with 503 sets). The push is a hint and is never awaited (slow receiver: the save returns in < 1 s). | yes (Blueprint side) |
| AC-6 | v1 seam unchanged: `git diff --stat test/seam/` → 0 lines, all v1 seam tests pass; openapi semantic diff shows no changed path or schema; back full suite 302/16/0, tsc 0 (TASK-113). **Missed at first (DEF-1, F-036):** blueprint-front's `check:api` went red because its generated types lacked the 4 new routes. Fixed by TASK-140 (`gen:api`, `schema.d.ts` +296/−0). Sober's re-run 2026-10-30 11:4x: check:api matches, typecheck 0, front `235 pass / 0 fail`. | yes (QA re-check of check:api → PM) |

- **Q6 (SA B → PM, 2026-10-30 11:4x — CAW vs the REAL v2 seam, before QA's joint run; one difference, your call on the words)**
  **Ran:** `tests/harness/seam-smoke-105.mjs` (header = usage) — real blueprint-back (TASK-113 tree, HEAD 9578d51 + its uncommitted 17 paths, read only) and caw-back 58ab883, both in-memory on 127.0.0.1, Blueprint's gateway pointed at a dead port, CAW's poll off (only the push moves it), no runner. **ALL OK, 12/12:** real `/spec` (rev 1, no label) · CAW create with no label (AC-3) · cards on real keys · card context via route 2 (`specRead.fromCache: false`) · route 3 shape · label v1 reaches CAW by push (AC-4) · edit → `spec.changed` push → only that card flagged, CAW reads the new title (AC-1, CAW side) · route 4 shape (`rev/at/by/cause/added/changed/removed`, `more` boolean) · remove → `anchorRemoved: true`, not workable, context `404 anchor_removed` (Q4) · REQ-112 coverage answers on the real spec (the seed has no decision parts, so "0 uncovered" proves the route only). Blueprint's log: no `[notify] failed`. Both stopped by pid, ports free, repos untouched.
  **The one difference (read in code, not run — Blueprint can no longer make it):** the real `latestLabel.label` is `string | null` (`blueprint-back → src/seam/spec.ts:16`; null = a version confirmed before REQ-103's labels, `src/projects/service.ts:131-135`). CAW types it `string` (`caw-back → src/blueprint/client.ts:15`, ProjectSchema), and caw-front prints it as is: `front: src/app/p/[id]/layout.tsx:28` and `src/app/page.tsx:63` → **"ป้าย null"** for such a project. Cards are safe (`CardView.tsx:30` falls back to the number).
  **My default:** CAW shows such a label by its number, the same way the card already does — header/chip **`ป้าย {version}`** (e.g. "ป้าย 3"). Two XS TASKs: caw-back type + schema `label: string | null` (TASK A) → caw-front `gen:api` + `tag(label ?? String(version))` (TASK B), one more commit each. **Cases:** new labels always have a name (`routes/versions.ts:19` min 1) → unchanged · no label at all → `ยังไม่มีป้าย` unchanged · a project whose old version has no name → "ป้าย 3". Only data from before REQ-103 can hit it (e.g. older projects on the TEST DB — not checked, no real-data read).
  Checked: REQ-105 § User-facing wording (no words for a nameless label) · DECISIONS 2026-10-30 (nothing on it). Say "yes" and I cut the two TASKs at once; or correct the words.
  > answer: **yes** — `ป้าย {version}` (e.g. "ป้าย 3") for an old nameless label; cut the two XS TASKs. They join REQ-105's joint run: QA tests once, after them. — Porter (PM) 2026-10-30 10:4x `[PM-decided]`
