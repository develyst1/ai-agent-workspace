# TEST-104: Blueprint as the spec store — hand labels, requirements, full audit log
- Team: A (Blueprint, SA Sober) · TASKs: — (not cut yet)
- Source REQ: REQ-103 (ACs tested: AC-1 … AC-9)
- Status: **TEST_PASSED** (2026-10-29 14:27, Tanya) — 11/11 AC; named NOT_TESTED and one observation on `check:api` (§ Verdict)
- Build under test: Team A's **working trees**, uncommitted, snapshot 2026-10-29 14:03 (no `.env`), fingerprint = sha256 of `git diff HEAD` + untracked files: `blueprint-back` f60b934 + `1ef8723d2796` (46 paths) · `blueprint-front` e46322a + `52bb5a06ac1c` (51 paths). **Unchanged at 14:26**, so the build tested is the build there now. It also contains **in-progress TASK-109 (REQ-110) back-end work**, not REQ-103's (§ Observations O-1).
- Ran on spare ports (TEST-106 holds the standard ones): BP API 4221 · BP web 3121 · Playwright 3131 · CAW at today's HEAD (TEST-106 export of 102a130 / 4b58bf3) on 4521 / 3521 · gateway stubs 4396 (refuse) / 4397 (fake) · link page server 4295
- Surfaces: local · desktop web 1440 (Playwright, local Chrome, clicks) · API (curl) for stored audit rows · 390 width for the label dialog and the history page
- Designed: 2026-10-29 by Tanya

## Scope

- In: labels (REQ 1–3), requirements as a part kind (4), audit of every write with who/when/what
  (5–7), the name prompt, and the regressions AC-8/AC-9.
- Not in: what CAW reads (REQ-105), login (owner: later), migrating old versions (the SA's SPEC
  decides; I test what the SPEC says).
- Each audit claim is checked **twice**: on the screen ("ประวัติการแก้ทั้งหมด") and in the stored
  rows through the API. A screen that shows a record proves nothing about what was stored, and the
  reverse is true too.

## Instrument limits

- blueprint-back with `GATEWAY_URL` = the TEST-101 gateway stub (`fake` only where a quiz or a
  round must answer). Never the real gateway. A fake answer proves the flow, never the model.
- `pglite:memory`: audit rows are read back through the API in the same process.
- The typed name is **not** identity (REQ-103 Constraints): I test that it is recorded, not who
  the person really is.

## Risk ranking

1. **AC-5/AC-6, the audit "who" on every write path** — high impact (the owner's MUST) and high
   likelihood (many write paths, easy to miss one). Full depth.
2. **AC-9 seam** — CAW today reads confirmed versions. If labels replace versions, the seam may
   break silently. Full TEST-101 #14/#14b re-run.
3. AC-1/AC-2/AC-7, the labels — new code, but simple.
4. AC-4 requirements — rides on change sets that exist today.

## Cases

| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 1 | AC-1: label on a not-ready project | happy | web | seed `every-stuck` (no quiz); type name; "ใส่ป้าย version"; type "v1 ทดลอง"; save | warning shown **before** save with {n} stuck + quiz (§ Wording); label "v1 ทดลอง" in the label list; one audit record "label" with the name | | |
| 2 | AC-1: warning text exact | boundary | web | compare the warning with § Wording; n = the real stuck count from `GET …/stuck` | exact words, correct n | | |
| 3 | AC-1: label on a ready project | happy | web | seed `large` (nothing stuck) + 5 quiz marks; label | no warning; saved | | |
| 4 | AC-2: no automatic labels | state | web + API | 2 labels; edit a part; add a source; run a round (fake gateway); undo | label list still exactly 2, unchanged text and position; no new version/label anywhere | | |
| 5 | AC-2: label stays on its state | state | API | label L1, edit part X, label L2: read X at L1 vs L2 | L1 shows the old X, L2 the new (whatever the SPEC defines as "on the current state") | | |
| 6 | AC-3: CAW button with no label | happy | web | new project, no label, ready screen | "ส่งไปสร้างที่ CAW" enabled and clickable (hit-test). Where it lands → see Q2 | | |
| 7 | AC-4: add, edit, remove a requirement | happy | web | "เพิ่ม requirement" → text → save; edit text; remove | each step shows where requirements are listed; 3 audit records (add / edit before→after / remove) with the name | | |
| 8 | AC-4: requirement survives reload, shows in spec pages | state | web | reload; open overview and the requirements list | present after reload; removed one gone | | |
| 9 | AC-5: five writes, five records | happy | web + API | name "โด่ง"; add source (file); re-fetch a failed link (see Q1); change model (tier); change creativity; label | project history: exactly 5 new records, each "โด่ง", a time, and before→after. The re-fetch keeps the **old** content | | |
| 9a | AC-5 setup: the re-fetch, by SPEC-104's test seam | happy | API + local server | back end with `BLUEPRINT_LINK_TEST_ALLOW=127.0.0.1:4295` on `pglite:memory`. Add link `http://127.0.0.1:4295/page` with nothing listening → fails "network". Start QA's page server on :4295, re-fetch (SPEC-104 § Test-only seam, steps 1–3) | the re-fetch record has `before` = the failed row (status, reason) and `after` = the new text, with "โด่ง" | | |
| 9b | the seam stays narrow | negative | API | with the allow-list set: a link to `127.0.0.1:4296` (not listed) · a link on :4295 that redirects to `127.0.0.1:4296` · back end started without the variable | each refused "the link points at a private or local address"; without the variable, :4295 is refused too, as today | | |
| 9c | the seam is off outside pglite | negative | shell | start with `DATABASE_URL` not `pglite:` and the variable set | `[link] test allow-list ignored` logged once. **Can only be run if the back end starts on a non-pglite DB here.** There is no local Postgres, and a real one is forbidden, so this is likely `NOT_TESTED` with the unit test (SPEC-104 l.76) as the only evidence. Said so now, not discovered later | | |
| 10 | AC-5: every other write path also audited | negative | web + API | part edit by AI round (fake), accept, answer, park, undo, quiz mark wrong (makes a question part), quiz ask, a CAW amendment (seam) | each writes a record with who/when/what — or the SPEC says why it is exempt (then a question, not a pass) | | |
| 11 | AC-5: name is Thai, stored exactly | boundary | API | name "โด่ง" and "  โด่ง  " | stored "โด่ง" (or as the SPEC says on trimming); never empty | | |
| 12 | AC-6: no name → asked, nothing saved | negative | web | fresh browser context (no stored name); try label, requirement add, source add, model, creativity, chat send, undo, quiz mark | name prompt "พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้" each time; **API row counts unchanged** for every attempt | | |
| 13 | AC-6: server refuses a write with no name | negative | API | the same writes via curl with no name field/header | refused (4xx), nothing stored. The UI alone is not a guard | | |
| 14 | AC-6: name kept per browser? | state | web | type name; reload; new context | per the SPEC; record what happens | | |
| 15 | AC-7: empty / whitespace label | negative | web + API | "" and "   " | "ต้องตั้งชื่อป้ายก่อน"; label count unchanged; API refuses too | | |
| 16 | AC-7: label boundaries (not in the AC) | boundary | web | very long label, Thai + emoji, the same label twice | observed and recorded; a defect only if data is lost or the screen breaks; a duplicate is a question | | |
| 17 | AC-8: TEST-101 Blueprint cases | regression | shell + web | REGRESSION R-3, R-4, R-7 | no test that passed in TEST-101 fails; new tests counted separately (Q4) | | |
| 18 | AC-9: seam unchanged | regression | E2E | TEST-101 #14/#14b (`test-101-seam-e2e.mjs`), seeded the way the new build allows | button → CAW board; the 6 calls + push as before | | |
| 18b | AC-9: a requirement part crosses the seam (SA A's ask, via the PM 2026-10-29 13:45) | regression | E2E | in the #18 project add **one requirement** by hand before the version/label; then through CAW: `GET /v1/projects/{id}/parts/{REQ key}` (partContext) and `locate` with the requirement's words | **per REQ-103 Q5's answer** (open at 13:51): if requirement parts are served on the seam, CAW reads the part as Blueprint serves it, `locate` returns it, and nothing in CAW refuses the new kind. If SA A's default holds (left out of the 3 seam responses), the requirement key is a 404 through CAW, it is absent from `GET /v1/projects/{id}` / `…/versions/{n}`, and every other call is byte-identical to the run without it | | |
| 19 | 390 width: label dialog, history, requirement form | regression | web 390 | open each | nothing off-screen or unreachable; no sideways scroll | | |
| 21 | AC-10: requirements on the overview | happy | web | project with **two** requirements; open the overview | a "Requirements" section listing both, by their text | | |
| 21b | AC-10: requirements in the PDF | happy | web + file | "ส่งออก PDF" on the overview; read the downloaded PDF's text (`pdftotext`, or Playwright's download + a text read) | the PDF has the "Requirements" section with both. If the local Chrome print cannot run here: `NOT_TESTED` with the exact error | | |
| 21c | AC-10: a removed requirement leaves both | state | web + file | remove one; overview + PDF again | only the remaining one is listed | | |
| 22 | AC-11: name button reads "{ชื่อ} · เปลี่ยนชื่อ" | happy | web | name "โด่ง" set; look at the button | text exactly "โด่ง · เปลี่ยนชื่อ" (§ Wording) | | |
| 22b | AC-11: change the name | state | web + API | click the button → change to "โด่ง2" → make one edit | button reads "โด่ง2 · เปลี่ยนชื่อ"; the next audit record says "โด่ง2"; earlier records still say "โด่ง" (history is not rewritten) | | |
| 20 | Repos clean after the round | regression | shell | `git status --porcelain` × 2 | only the team's committed/declared change; QA leaves nothing tracked (F-003) | | |

## Results (run 2026-10-29 14:03–14:26) — evidence in `tests/harness/test-104/`

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-1 | stuck project (10 stuck, no quiz): the warning **"ยังมี 10 จุดค้าง และ quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม"** is visible on page load, right above the label field (`01-warning-on-load.png`); "v1 ทดลอง" saved on one click, in the list, by "โด่ง". There is no separate confirm step; my script first expected one (wrong expectation, not a product fault) | PASS |
| 2 | AC-1 | exact words, n = 10 = `GET …/stuck` | PASS |
| 3 / 3b | AC-1 | nothing stuck + no quiz → quiz half only (SPEC Q1); nothing stuck + quiz 5/5 → no warning | PASS |
| 4 | AC-2 | 3 labels; an edit, a requirement add and a setting change → still 3, same text and order | PASS |
| 5 | AC-2 | L1 → edit → L2: `GET …/versions/1` shows the old title, `/2` the new | PASS |
| 6 | AC-3 | no label → "ส่งไปสร้างที่ CAW" visible, href `…:3521/start?project=<id>`; click lands on CAW, which shows "ลิงก์นี้ไม่ครบ" (accepted, SPEC-104 Q2, until REQ-105) | PASS |
| 7 | AC-4 | screen: add (1→2 reqs, +1 record), edit (+1), one "ลบ" click removes one (+1). API: REQ-001 add/update/remove each "โด่ง"; a removed requirement's history still readable; stuck stays 0 (D7) | PASS |
| 8 | AC-4 | edited requirement still there after reload | PASS |
| 9 | AC-5 | 5 writes by "โด่ง" (source add, link re-fetch, model, creativity, label) → **exactly 5** new records, each "โด่ง" + time + before→after (`history-ac5.json`) | PASS |
| 9a | AC-5 | re-fetch: before `{status: failed, reason: link_unreachable, text: ""}` → after `{status: read, text: "หน้าทดสอบ TEST-104…"}` | PASS |
| 9b | seam | a port not on the list, and a redirect from :4295 to :4296 → both 400 "the link points at a private or local address" | PASS |
| 9c | seam | outside pglite: **NOT_TESTED** — no non-pglite DB I may use here; the SPEC's unit test is the only evidence | NOT_TESTED |
| 10 | AC-5 | quiz start/ask/mark each audited with its own typed name; a wrong mark's spec change is under the marker's name; undo audited; a CAW amendment still accepted with no typed name (seam rule). A chat round's user row: name **written** (`round.ts:266,337`) but **not readable**, because `GET …/messages` returns no `by` (O-3) | PASS (round row NOT_TESTED) |
| 11 | AC-5 | "  โด่ง  " stored as "โด่ง" | PASS |
| 12 | AC-6 | fresh browser, no cookie: label, quiz ask, requirement add → the name prompt appears, **0 rows** stored for each (labels / history / parts unchanged) | PASS |
| 13 | AC-6 | server: create, change-set, label, settings, quiz with no header, an undecodable header and a whitespace name → all **400 `name_required`**, nothing stored | PASS |
| 14 | AC-6 | the name is kept per browser in cookie `bp_by` (set, percent-encoded); a fresh context has none and is prompted | PASS |
| 15 | AC-7 | "" and "   " → 400 `validation`, 0 labels | PASS |
| 16 | — | 81 characters → 400 (SPEC 1–80); Thai + emoji saved; the same label twice saved twice (SPEC D2: labels are tags) | observed |
| 17 | AC-8 | back: **249 pass / 16 skip / 0 fail** (was 218 / 16 / 0; +31 new), refusing stub 0 calls · front: typecheck clean, check:no-fetch 0 problems, `bun test src` **212 / 0** (was 186), build exit 0, isolation **4**, states **34**, required **1** ("948 items on 48 pages × 4 themes, 0 failures"; was 896 / 44). **`check:api` exit 1**, caused by TASK-109 fields only (O-1) | PASS (see O-1) |
| 18 | AC-9 | label → button → CAW board; getProject/getVersion; partContext; amend → Blueprint chat; label v2 → push → CAW `latestSeenVersion` 2; no `[notify] failed` | PASS |
| 18b | AC-9 | the requirement part through CAW: `GET …/parts/REQ-001` → 200, `kind: requirement`; `locate "เช็คสถานะทุก 10 วินาที"` → `["REQ-001"]` (REQ-103 Q5: served) | PASS |
| 19 | — | 390 wide: ready, requirements, history → `scrollWidth` 390, no sideways scroll | PASS |
| 20 | — | QA ran from a snapshot; both repo fingerprints unchanged at 14:26; nothing tracked by QA | PASS |
| 21 | AC-10 | overview: "Requirements" lists every requirement (3 at the time) | PASS |
| 21b | AC-10 | "ส่งออก PDF" → 164 kB PDF; `pdftotext`: "Requirements" + all three titles and texts | PASS |
| 21c | AC-10 | after one removal the overview lists only the remaining ones | PASS |
| 22 | AC-11 | button reads exactly "โด่ง · เปลี่ยนชื่อ" | PASS |
| 22b | AC-11 | rename to "โด่ง2" → button "โด่ง2 · เปลี่ยนชื่อ"; next record by "โด่ง2"; the 21 earlier records still "โด่ง" | PASS |

## Defects

None.

## Observations (not ours)

- **O-1 — `check:api` fails on this build because of TASK-109, not REQ-103.** The diff is only the round fields
  `roundNote` / `roundReason` (a new `ChatMessage`) and `note` / `reason` on the round result. Those are REQ-110 /
  TASK-109 (status TODO on the board), whose back-end changes are already in blueprint-back's working tree and in its
  emitted `openapi.json`, while the front's `schema.d.ts` (TASK-110, on hold) is not regenerated. **Before the "ขึ้น git"
  for REQ-103, the commit must not carry half of TASK-109, or `check:api` must be re-run after TASK-110's `gen:api`.**
  **→ Resolved 2026-10-29 (TEST-107 O-3):** at the REQ-103 commits a4bf924 / a52e022, `check:api` passes on a clean export
  and the committed `openapi.json` has no `roundNote`, so the commit carried none of TASK-109.
- **O-2 — a11y nits (front):** the name form's ✓ button's accessible name is the whole prompt sentence, not an action;
  the requirement add/edit fields have no label or placeholder (a screen reader reads two blank fields).
- **O-3 — who sent a chat message is stored but not readable.** `messages.by` is written (`round.ts:337`), but neither
  `GET …/messages` nor the project history shows it. REQ-103 req 5 does not list chat messages, so this is not a fail.
- **O-4 — "ลบ" on a requirement has no confirmation.** One click removes it; the history keeps the record.
- **O-5 — test:states leaves its back end on :4298** again (map §6 finding, unchanged); stopped by pid.

## Test data created

| What | Where | End state |
|---|---|---|
| projects "TEST-104 audit", "… ติดทุกแบบ", "… ไม่มีป้าย" ×3, "… paths", "… seam"; CAW project for "seam" | in-memory pglite (:4221, :4521) | **gone**: processes stopped 14:26 |
| the snapshot copies + their `node_modules`, `.next` | session scratchpad `t104/` | left in scratchpad (not in the desk or a repo) |
| scripts, screenshots, `export-overview*.pdf`, `history-ac5.json`, stub logs | `tests/harness/test-104/` | left, as evidence |
| servers on 4221 / 3121 / 4521 / 3521 / 4396 / 4397 / 4295 / 4299 / 3131 and the :4298 orphan | this machine | all stopped by their own pids; `ss` 0 on each |

## Verdict

**`TEST_PASSED`** — all 11 ACs pass on the fingerprinted build. Every write path refuses without a name, both in the
UI and at the server. Every listed write leaves exactly one record with who, when and before→after. Labels are never
blocked and never made by themselves. Requirements live, show and export. The seam is unchanged and carries the new kind.

NOT_TESTED: #9c (allow-list ignored outside pglite: no other DB allowed here) · the chat round's user-row `by` (stored,
not readable, O-3) · a round that applies spec changes under a name (the fake gateway cannot produce one; the code path is
the same `by` as the wrong-mark change set, which passed).
**Condition for the git step, not for this verdict:** O-1. REQ-103's commit must not include half of TASK-109.

## Evidence (decisive)

- `tests/harness/test-104/history-ac5.json` — the 5 records of AC-5, each "โด่ง", with the re-fetch's old row kept.
- `seam.json` + `S1-caw-board.png` — AC-9 end to end, the requirement part read and located through CAW.
- `blueprint-back-test.txt` (249/16/0) and `blueprint-front-e2e.txt` (4 · 34 · 948 items 0 failures) — AC-8.

## Questions

For the PM. None blocks the design; each has my default. Correct only a line that is wrong.

- **Q1 — AC-5 "re-fetch a failed link" cannot be produced locally today.** blueprint-back refuses
  any link to a private or local address (`blueprint-back → src/sources/link.ts:58-89`
  `isPrivateAddress`, "the link points at a private or local address"), so a local test server
  is refused, not fetched. **Default:** the SA names a test seam in the SPEC (an env-only
  allow-list for `127.0.0.1` in tests, or a fake fetcher) and I use it. Without one, that one
  record is `NOT_TESTED — no local way to fail then succeed a link fetch`. A public URL is **not**
  my default: it reaches a real outside site.
- **Q2 — AC-3: where does the button land with no label?** CAW's `/start` today refuses a link with
  no `version` ("ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน", TEST-101 #18). **Default:** AC-3 = the button
  is enabled and opens CAW; what CAW then shows is REQ-105's, recorded as an observation, not a FAIL.
- **Q3 — AC-1 "names the stuck items/quiz":** **Default:** the § Wording sentence with the count {n}
  and the word quiz is enough; listing each stuck item is not required.
- **Q4 — AC-8 counts:** **Default:** "still pass" = every test that passed in TEST-101 still passes;
  new tests the team adds are counted on their own line. A changed count is not a fail by itself.
  > answer (Q1–Q4): all four defaults accepted as written. Q1 is routed to SA A as REQ-103 Q1 (name a test seam in the SPEC; no public URL). — Porter (PM) 2026-10-29 `[PM-decided]`
