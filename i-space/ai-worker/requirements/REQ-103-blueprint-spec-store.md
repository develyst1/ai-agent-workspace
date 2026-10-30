# REQ-103: Blueprint as the spec store — hand labels, requirements, full audit log

- Status: DELIVERED (2026-10-29 14:3x, the PM — QA TEST_PASSED 14:27, 11/11 AC; NOT_TESTED named in TEST-104 § Verdict) · **COMMITTED 2026-10-29** on the owner's own "ขึ้น git REQ-103 และ REQ-104": blueprint-back `a4bf924` (REQ-103 only; TASK-109 left out, PM checked migration 0007 not in it), blueprint-front `a52e022`, on `atom`, pushed (PM verified `origin/atom`)
- Git: commit and sync **this topic alone** when it passes QA (`CONVENTIONS.md` § Git) — only on the owner's own "ขึ้น git" in his session, relayed by the PM (`ATOM.md` "Ruled by the owner" §1).
- Owner also asked the team to **try the product** and fix where it differs from his intent: anything found beyond these ACs comes to the PM as a question, not as silent scope.
- Priority: HIGH `[team-proposed]` (plan order 1)
- Requested: 2026-10-29 by the owner — stamp `operator` (decisions 10:51 point a and 11:41 items 1–3, relayed by Atom)
- Deadline: none
- Depends on: REQ-102 (gap report `maps/blueprint-gap-102.md` a3–a7)
- Team: **A (Blueprint)** only. A change to what the seam serves is **not** in this REQ (that is REQ-105).

## The need (owner, via Atom)

> 10:51 (a): "Blueprint is the store of spec and requirements; the PM edits and adds there. No arbitrary version splitting. The SA/PM using the site put version labels on by hand. Every edit or addition MUST keep an audit log."
> 11:41: *"ใช้ตามที่ Porter แนะนำทุกข้อ ไปเลย"* — items 1, 2, 3 of `../project-docs/gap-102-th.md`.

## Problem / Goal

Today a "version" is a gated, auto-numbered, frozen copy made by "ยืนยัน 100%". Requirements have no home a person can
edit directly, and parts of the history have no record (`maps/blueprint-gap-102.md` a3–a7). The owner wants Blueprint to be the
one store a PM works in by hand, with every change traceable.

## Requirement

1. A person can put a **version label** (free text they type) on the project's current state at any time. `[operator 11:41 item 2]`
2. Putting a label is never blocked. If something is stuck or the quiz is not complete, the site shows a warning, and the person can still label. `[operator 11:41 item 2]`
3. The "ส่งไปสร้างที่ CAW" button is always available. Which spec CAW reads is REQ-105. `[operator 11:41 item 2]`
4. A PM can **add, edit and remove a requirement** by hand on the site. A requirement is a kind of spec part. `[operator 11:41 item 1]`
5. **Every** edit and addition writes an audit record: spec part changes (already done), requirement changes, source adds, source re-fetch (keeping the old content), project settings (model, creativity), and labels. `[operator 10:51 a]`
6. Each audit record says **who** (a name the person typed on the site), **when**, and **what changed** (before → after). `[operator 11:41 item 3]`
7. A person can read the audit history: per part (as today) and for the whole project.
8. **AMENDED 2026-10-29 by the PM** (Q6 item 7, from FE's walkthrough): requirements also appear on the project's overview page and in the PDF export, in their own "Requirements" section. `[PM-decided]` (owner 10:51: Blueprint is the store of spec *and requirements*).

## Acceptance Criteria

- [ ] **AC-1** — **Given** a project with stuck items and no quiz **When** the PM types a label "v1 ทดลอง" and saves **Then** the label appears in the project's label list with that text, and a warning was shown before saving that names the stuck items/quiz.
  - Check: QA, on blueprint-front locally (stub gateway).
- [ ] **AC-2** — **Given** two labels on a project **When** the PM edits a part after the second label **Then** no new label or version appears by itself; the labels stay where they were put.
  - Check: QA, project page + label list.
- [ ] **AC-3** — **Given** a project with no label **When** the user opens the ready screen **Then** "ส่งไปสร้างที่ CAW" can be clicked.
  - Check: QA.
- [ ] **AC-4** — **Given** a project **When** the PM adds a requirement, edits its text and removes it **Then** each step shows in the spec where requirements are listed, and each step has its own audit record.
  - Check: QA, screen + audit history.
- [ ] **AC-5** — **Given** the PM typed the name "โด่ง" on the site **When** they add a source, re-fetch a failed link, change the model, change creativity and put a label **Then** the project audit history shows 5 records, each with "โด่ง", a time, and what changed. The re-fetch record keeps the old content.
  - Check: QA, project audit history.
- [ ] **AC-6** (unhappy) — **Given** no name has been typed **When** the PM tries to make any change **Then** the site asks for a name first, and no change is saved without one.
  - Check: QA.
- [ ] **AC-7** (unhappy) — **Given** an empty or whitespace-only label **When** the PM saves it **Then** it is refused with the message in § Wording, and nothing is saved.
  - Check: QA.
- [ ] **AC-8** (regression) — the AI interview, sources, spec pages, undo, quiz and PDF still work exactly as TEST-101 found them, with the stub gateway; existing tests still pass (blueprint-back 218 pass / 16 skip; blueprint-front as in `maps/blueprint.md` §2).
  - Check: QA re-runs the TEST-101 Blueprint cases.
- [ ] **AC-9** (regression, seam) — **Given** CAW at today's code **When** it calls Blueprint's seam **Then** it keeps working as in TEST-101 #14. Changing what the seam serves is REQ-105, not this one.
  - Check: QA, the TEST-101 seam run.
- [ ] **AC-10** (added 2026-10-29, requirement 8) — **Given** a project with two requirements **When** the user opens the overview page and exports the PDF **Then** both show the "Requirements" section listing both requirements.
  - Check: QA, overview screenshot + PDF read. (The PDF needs a local Chrome print — if it cannot run here, `NOT_TESTED` with the reason.)
- [ ] **AC-11** (added 2026-10-29, Q6 item 5) — **Given** a name is set **When** the user looks at the name button **Then** it reads "{ชื่อ} · เปลี่ยนชื่อ", and clicking it lets them change the name.
  - Check: QA.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| label button | ใส่ป้าย version | Add version label |
| label field placeholder | ตั้งชื่อป้าย เช่น v1 ทดลอง | Name this label, e.g. v1 trial |
| warning before label (stuck/quiz) | ยังมี {n} จุดค้าง และ quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม | {n} items still stuck and the quiz isn't complete — you can label, but the spec may not be ready |
| warning, stuck only (added 2026-10-29, SPEC-104 Q1) | ยังมี {n} จุดค้าง — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม | {n} items still stuck — you can label, but the spec may not be ready |
| warning, quiz only (added 2026-10-29, SPEC-104 Q1) | quiz ยังไม่ครบ — ใส่ป้ายได้ แต่ spec อาจยังไม่พร้อม | The quiz isn't complete — you can label, but the spec may not be ready |
| empty label | ต้องตั้งชื่อป้ายก่อน | Give the label a name first |
| name prompt | พิมพ์ชื่อคุณก่อน ระบบจะบันทึกว่าใครแก้ | Type your name first — every change is recorded with it |
| audit history title | ประวัติการแก้ทั้งหมด | Full change history |
| add requirement | เพิ่ม requirement | Add requirement |
| name button, name set (added 2026-10-29, Q6) | {ชื่อ} · เปลี่ยนชื่อ | {name} · Change name |
| overview / PDF section (added 2026-10-29, Q6) | Requirements | Requirements |

## Constraints

- No live gateway call, no live Claude CLI (as REQ-101). This machine only.
- The seam's contract is unchanged in this REQ (AC-9).
- Not a login: the name is typed, not verified. `[operator 11:41 item 3]`

## Out of Scope

- Real login / auth (owner: later). · What CAW reads (REQ-105). · Migrating old confirmed versions. That is the SA's call, written in the SPEC: keep them readable as labels.

## Questions

- **Q1 (QA via PM → SA A — does not block the build)** — AC-5's "re-fetch a failed link" cannot be produced locally: blueprint-back refuses private/local addresses (`src/sources/link.ts:58-89`). Please name a **test-only seam** in the SPEC (e.g. an env-only allow-list for 127.0.0.1 in tests, or a fake fetcher) that QA can use; no public URL. `[PM-decided]` (TEST-104 Q1)
  > answer (Sober, SA A, 2026-10-29): `BLUEPRINT_LINK_TEST_ALLOW=127.0.0.1:<port>`, honoured only with `DATABASE_URL=pglite:…`; QA's recipe is in `specs/SPEC-104-blueprint-spec-store.md` § "Test-only seam for a local link". BE builds it in TASK-107.
- **Q2 (SA A → PM — does not block; default applies)** — warning wording when only stuck items **or** only the quiz applies → `specs/SPEC-104-blueprint-spec-store.md` § Questions Q1.
- **Q4 (SA A → PM, wording — does not block; FE builds the defaults)** — words REQ-103 § Wording doesn't have yet (TASK-108 Q1). Correct only the line that is wrong:
  - requirements page: nav name and title "requirement"; empty list "ยังไม่มี requirement ในโปรเจกต์นี้"; buttons "แก้" / "ลบ" / "ยกเลิก" / "เพิ่ม" (the site's existing words); field labels "ตั้งชื่อ" (title) and "requirement" (text);
  - name control: save with Enter or "✓"; once set, the name shows as a button;
  - a failed write: the existing "ต่อระบบไม่ได้ตอนนี้";
  - history action words: project_create "สร้างโปรเจกต์" · settings "เปลี่ยนการตั้งค่า" · source_add "เพิ่มเอกสาร" · source_refetch "ดึงลิงก์ใหม่" · label "ใส่ป้าย version" · quiz_start "เริ่ม quiz" · quiz_ask "ถาม quiz" · quiz_mark "ตรวจคำตอบ quiz". `[SA-proposed]`, built on the site's "เอกสาร" and "ใส่ป้าย version".
  > answer: all lines accepted as written; this list is now part of § Wording (the PM's decided copy). — Porter (PM) 2026-10-29 `[PM-decided]`
- **Q7 (SA A → PM, git — for the owner when he says "ขึ้น git" for REQ-103; does not block QA)** — the owner asked for one commit per topic (DECISIONS 12:41). In **blueprint-back**, REQ-110's TASK-109 is already in the working tree on top of REQ-103's uncommitted work: migration `0007` and edits to `round.ts`, `context.ts`, `client.ts`, `schema.ts` and `openapi.json`. Some of those files carry both topics. My mistake: I let TASK-109 start after TASK-107 was DONE, not after REQ-103 was committed (F-013). **blueprint-front is still clean**: I'm holding TASK-110 until REQ-103 is committed.
  Options for blueprint-back:
  - (a) **[default]** one commit with both topics, message naming REQ-103 + REQ-110, made only when **both** have passed QA;
  - (b) two commits: REQ-103 first, staged from a REQ-103-only patch, then REQ-110. Possible but delicate where one file holds both;
  - (c) REQ-103 alone, with REQ-110 parked out of the tree first. Not recommended: it rewrites a teammate's working tree.
  blueprint-front gets its own REQ-103 commit either way.
  > answer (PM, 2026-10-29 `[PM-decided]`): **default = (b)**, two commits (REQ-103 first from a REQ-103-only patch, then REQ-110). (a) contradicts the owner's recorded rule "commit … เป็นเรื่องๆ" (`DECISIONS.md` 12:41), so it is not mine to pick. Prepare the REQ-103-only patch when QA passes. If you judge the split unsafe in a shared file, say so in one line; I put (a) vs (b) to the owner together with his "ขึ้น git". (c) stays rejected. Your F-013 is noted.
  > SA (Sober, 2026-10-29 14:0x): **(b) is safe with this recipe; no unsafe flag.**
  > - **What's in the tree:**
  >   - REQ-110 only: `src/interview/context.ts`, `src/gateway/client.ts`, migration `0007` and its snapshot, `test/interview/honest.test.ts`, `retry.test.ts`.
  >   - Both topics: `src/interview/round.ts` (interleaved), `src/db/schema.ts`, `src/http/routes/rounds.ts`, `migrations/meta/_journal.json`, and the generated `openapi.json`.
  > - **Recipe:**
  >   1. Jason writes a REQ-110-only patch of his own hunks (TASK-109 DoD 7).
  >   2. At "ขึ้น git" I copy the tree to a plain scratch folder (no branch, no worktree) and apply that patch in reverse there.
  >   3. In the copy: re-emit `openapi.json` there and run the full suite + `tsc` on `pglite:memory`. That proves the REQ-103-only state works.
  >   4. Commit that state through a temporary index (`GIT_INDEX_FILE` + `--work-tree=<copy>`), so the real working tree is never touched.
  >   5. Then commit REQ-110 normally from the real tree, after its QA.
  > - **If the reversed copy fails its tests:** I stop and say so in one line, and the owner picks (a).
- **Q6 (SA A → PM, product findings from FE's walkthrough — the owner's "try the product" ask; none blocks REQ-103; each is a choice for the PM/owner)** — from `tasks/TASK-108-blueprint-front-spec-store.md` § Findings — try the product:
  - (1) Chat messages aren't in "ประวัติการแก้ทั้งหมด". Only spec changes and the eight audit actions are; messages are stored with who sent them. Should history mean "every edit" (today) or "everything a person did"?
  - (3) With one stuck item, the ready screen says it three times: summary chip, the new warning, and the old notes. I kept the old notes because they link to the fix. Drop them?
  - (5) Once set, the name button shows only the name, with nothing saying it can be clicked to change it. Add a word, e.g. "เปลี่ยนชื่อ"?
  - (7) Requirements show only on their own page, not on the overview or in the PDF. Add them?
  Default: no change until the PM or owner picks. Each one is S, my guess.
  > answer (PM, 2026-10-29 `[PM-decided]`):
  > (1) **No change.** History = every edit or addition to the store, per the owner's 10:51 *"every edit or addition MUST keep an audit log"*. Chat messages are already stored with their sender.
  > (3) **No change for now.** The notes carry the links to fix; the owner is the only tester and will say if it reads as too much.
  > (5) **Yes:** once a name is set, the button reads `{ชื่อ} · เปลี่ยนชื่อ` / EN `{name} · Change name` (added to § Wording).
  > (7) **Yes:** requirements appear on the overview page and in the PDF export, in their own section titled `Requirements` (the same word as the nav). Owner 10:51: Blueprint is the store of spec **and requirements**, so they belong in what the PM shares. AMENDED below as requirement 8 / AC-10.
- **Q5 (SA A → PM, a seam question for Team B — does not block the build; settle before the owner adds a requirement in a project CAW reads)** — once a requirement exists, `"requirement"` appears as a new `kind` value in three seam responses: `GET /v1/projects/{id}`, `GET …/versions/{n}` and `GET …/parts/{key}/context`. Everything else on the seam is byte-identical (TASK-107 step 7). Does CAW's client accept an unknown part kind, or reject the whole response? Team B can answer from caw-back's client. My default: if CAW rejects it, Blueprint leaves requirement parts out of those three seam responses only (size S). QA, please include one requirement in the AC-9 seam run.
  > PM: routed to SA B (seam, cross-team) 2026-10-29 — SA B answers here from caw-back's client. Sober's default (leave requirement parts out of those 3 responses if CAW rejects them) stands until then.
  > answer (Silver, SA B, 2026-10-29): **CAW accepts it. Nothing rejects an unknown kind**, so Blueprint can keep requirement parts
  > in all three responses (read from CAW's own repos only):
  > - `GET /v1/projects/{id}`: caw-back reads only `project.name` (`caw-back → src/blueprint/client.ts:62-65`).
  > - `GET …/versions/{n}`: it reads only `version` and `confirmedAt` (`:66-69`).
  > - `GET …/parts/{key}/context`: the body is passed through unread (`:70`).
  > - No caw-back code checks a part kind (grep: the only `kind` checks are CAW's own card kinds `work`/`question`).
  > - caw-front shows a part's kind with fallbacks: icon `kindIcon[kind] ?? FolderKanban`, colour group `?? "journey"`, word
  >   `partKind[kind] ?? kind` (`caw-front → src/components/card/Part.tsx:19-20,29`, `src/components/Board.tsx:48-50`).
  > **One visible effect:** `partKind` has no Thai word for `requirement` (`caw-front → src/words.ts:21-24`), so CAW's screens
  > would print the raw English word "requirement" next to such a part, with the default icon. If the PM wants a Thai word,
  > that is a one-line caw-front change (Team B), wording from the PM.
  > PM decision 2026-10-29 `[PM-decided]`: **keep requirement parts in all three seam responses** (Sober's fallback not needed). CAW shows the word **"requirement"**, the same word Blueprint uses (Q4). No Thai word and no change needed now. If Team B touches `words.ts` anyway, it may add `requirement: "requirement"` so the fallback is intentional.
- **Q3 (SA A → PM — does not block; default applies)** — AC-3 with no label: the build button opens CAW's `/start?project=<id>` with no version, and today's CAW says "ลิงก์นี้ไม่ครบ" until REQ-105 lands. Or should it stay on the page with "ใส่ป้ายก่อน"? → SPEC-104 § Questions Q2.
  > answer (Q2 + Q3): both defaults accepted — answered in SPEC-104 § Questions; warning halves added to § Wording. — Porter (PM) 2026-10-29 `[PM-decided]`

## Verification (by QA)

Build: Team A's working trees, fingerprints `1ef8723d2796` (back) / `52bb5a06ac1c` (front), unchanged during the run. Detail: `tests/TEST-104-blueprint-spec-store.md` § Results.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | warning with n = 10 visible before saving; label saved, listed, by "โด่ง" (#1–3b) |
| AC-2 | PASS | edits add no label; each label keeps its own state (#4–5) |
| AC-3 | PASS | no label → button opens CAW `/start?project=` (Q2 default) (#6) |
| AC-4 | PASS | add / edit / remove on screen, one record each; history kept (#7–8) |
| AC-5 | PASS | 5 writes → exactly 5 records with "โด่ง", time, before→after; re-fetch keeps the old row (#9–11) |
| AC-6 | PASS | no name → prompt and 0 rows (UI); 400 `name_required` on every write route (server) (#12–14) |
| AC-7 | PASS | empty and whitespace labels refused, nothing saved (#15) |
| AC-8 | PASS | back 249/16/0; front 212 unit, 4 + 34 e2e, 948 required items 0 failures. `check:api` fails on TASK-109's fields only (O-1) (#17) |
| AC-9 | PASS | the seam end to end against CAW at HEAD, and a requirement part read + located through CAW (#18–18b) |
| AC-10 | PASS | "Requirements" on the overview and in the PDF text (#21–21c) |
| AC-11 | PASS | "โด่ง · เปลี่ยนชื่อ"; rename changes new records only (#22–22b) |

## AC check (SA A — Sober, 2026-10-29 14:4x)

*Added after SPEC_DONE, and after QA's verification above, because ORDER 42 (14:20) made it the gate for SPEC_DONE (F-006/F-007). It would not have changed my call: every row is yes.*

| AC | Where it is met (deliverable) | Self-checked |
|---|---|---|
| AC-1 | Back: `test/http/spec-store.test.ts` "AC-1 + D2: a label is allowed with stuck items, no quiz…" (TASK-107 DoD 5). Front: `features/ready/LabelSection.tsx`, warning text shown on the real page (TASK-108 DoD 4, `default-10a-ready-warning.png`). | yes |
| AC-2 | `spec-store.test.ts` "AC-2: two labels, then a part edit — still exactly 2 rows" (TASK-107); walkthrough, two labels in the back end (TASK-108 Findings). | yes |
| AC-3 | `features/ready/load.ts` build link always enabled; href `…/start?project=<id>` with no label (TASK-108 DoD 4). | yes |
| AC-4 | `spec-store.test.ts` "AC-4: a requirement is added, edited and removed by hand — 3 history entries…" (TASK-107); `core/requirements/RequirementsEditor.tsx`, real page after add (TASK-108 DoD 4). | yes |
| AC-5 | `spec-store.test.ts` "AC-5: add source, re-fetch a failed link, change model, change creativity, label — five entries by โด่ง", with the old row kept in `before` (TASK-107). Project history page rows with "โด่ง" (TASK-108 DoD 4). The model-change row on screen was not produced in Fern's run (no model list with the gateway dead); the back end proves it. | yes |
| AC-6 | `spec-store.test.ts` "AC-6: a write with no name is 400 … every write route group" (TASK-107); name prompt, and create with no name → 0 projects (TASK-108 DoD 4). | yes |
| AC-7 | `spec-store.test.ts` "AC-7: an empty or blank label is 400…" (TASK-107); "ต้องตั้งชื่อป้ายก่อน", no call (TASK-108 DoD 4). | yes |
| AC-8 | Back 236/16/0 at TASK-107 (base 218); front 212 unit, states 34, isolation 4, required 948/0 (TASK-108 rework). | yes |
| AC-9 | TASK-107 step 7: seam documents identical except the `requirement` kind value; seam tests unchanged except `notify.test.ts`'s trigger lines (Q3/Q4); Q5: CAW accepts the kind. | yes |
| AC-10 | Overviews in 4 themes + PDF text via `pdftotext` (TASK-108 rework item 4). | yes |
| AC-11 | Name button "{ชื่อ} · เปลี่ยนชื่อ" in the DOM, with `title`/`aria-label` (TASK-108 rework item 3). | yes |
