# TASK-450 — `REQ-105 §7` (c)+(d) from the same `sid` log: the outbox reports `sent=0 failed=N` repeatedly — surface the LINE API's own error instead of a count · `camp_weeks/camp_days` queried with the literal id `"undefined"` (`22P02`) — find the caller — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size S.** No migration expected. After TASK-449.

## §0 The evidence (Porter, `sid` log, 09-23)
(c) the outbox worker logged `sent=0 failed=N` repeatedly through the afternoon — likely Tanya's "push ceiling" (the demo OA's free quota, or a 429). (d) `camp_weeks` / `camp_days` were queried with the id string `"undefined"` ⇒ Postgres `22P02 invalid input syntax for type uuid`.

## §1 (c) — make a failed push say WHY
- Read the worker's send path: when LINE answers non-2xx, what is kept? The row's failure count and status, or the body too? **A count is not a diagnosis.** Build: the LINE response's **status + `message` / `details[0].message`** is stored on the outbox row (an existing column if there is one — say which; otherwise the run's log line carries it), and the worker's run summary prints the FIRST distinct error per run (`sent=0 failed=12 — 429 You have reached your monthly limit`), so a quota wall is one line instead of an afternoon.
- Then answer plainly in your report: **on the evidence, is the demo OA over its free push quota?** A 429 / "monthly limit" body says yes; `Invalid reply token` or "the user hasn't added the OA" says something else entirely. If the failed rows never stored a reason, say so — the owner re-runs one push after the fix and the reason appears.
- 🚫 No retry-policy change, no quota logic — the worker's job here is to report, not to decide.

## §2 (d) — the `"undefined"` id
- Find the caller that passes an undefined week/day id into a camp read (a route param never validated, a FE call with `undefined` in the path, a job?). The fix is at the boundary: a route whose `:id` is not a uuid answers **400**, never reaching the DB — the shape the other routes use (say whether a shared validator exists; if it does, this route simply is not using it). Name the caller so @Fern gets a line if it is the FE's.
- Pinned by value: `/camp/weeks/undefined` and the day route ⇒ 400 with the envelope, zero queries.

## Definition of Done
- [ ] (c) the error surfaced by value (status + message on the row/summary) + the plain answer on the quota · (d) the caller named and the 400 by value · suite **count** · tsc 0 · 53 = 53 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-23) — (c) the reason now rides the run; (d) the caller named and the 400 built; 2827 pass / 0 fail; 14/14 mutations bite

**Numbers:** `bun test` **2827 pass / 0 fail**, 218 files (+1: `src/lib/outbox-reason-and-uuid-param-req105.test.ts`, 6 tests) · `tsc --noEmit` **0** · 53 = 53 (no migration) · 1 pin moved (`teacher-reassigned-notice-req097`'s outbox summary shape).

## §1 (c) — what was kept, what was missing, and the plain answer on the quota
**What was already kept:** the outbox row HAS an `error` column and the worker has always written `err.message` into it on every failure (`outbox.service.ts`), so **the diagnosis was never lost — only unreadable.** Two things made it unreadable:
1. the message was built as `LINE push failed <status>: <first 300 chars of the raw body>` — LINE's JSON, unparsed;
2. the RUN summary printed **only counts** (`[outbox] sent=0 failed=N retry=0`), so a monthly-quota wall and a dead token looked identical from the log. That is the afternoon Porter saw.
**Built:** `describeLineError(status, body)` (pure, in `line-client.ts`) parses LINE's own `message` and `details[].message` (de-duplicated, one line; the raw text when the body is not that JSON; bounded at 300 chars) — it is what `pushMessage` throws, so it is what the ROW stores; and `processOutboxOnce` now returns `errors: string[]` (the DISTINCT reasons of that run, in the order they first appeared), which the worker prints:
`[outbox] sent=0 failed=12 retry=0 — LINE push failed 429: You have reached your monthly limit. (+1 other reason)`
**The plain answer you asked for: I cannot say it is the quota, and nobody should say so from the log we have** — counts alone cannot distinguish a 429 from a 401. But **the verdict is already on `sid`, in rows written before this change**, so it is a one-line read, not a re-test:
```sql
select status, attempts, error, count(*) from notification_outbox
where channel='line' and error is not null group by 1,2,3 order by 4 desc limit 20;
```
📋 **DATA REQUEST (read-only, the owner or Tanya on `sid`)** — that output names it: `429 … monthly limit` ⇒ the free push quota is the wall; `401 … invalid token` / `400 … not found` ⇒ something else entirely. After this deploy the same sentence is in the log line itself and no query is needed again.
🚫 No retry-policy change, no quota logic — the worker reports, it does not decide.

## §2 (d) — the caller, and the boundary
**The caller is the FE.** `smart-scheduler-front`: `getCampWeekDays(id)` → `api.get(\`/camp/weeks/${id}/days\`)`, reached through `useCampWeekDays(id)` (`src/hooks/scheduler/useCamp.ts:33`) from **three** places — `CampBlockPanel.tsx:27` (`block.campWeekId`), `OpenWeekDialog.tsx:39`, `WeekRoster.tsx:34` (`weekId`). The hook guards with `enabled: !!id` — **which passes for the STRING `"undefined"`**: a real `undefined` is blocked, but anything that has already been through a template or a route param arrives as the four-letter word and sails through. ⇒ 📨 **a line for @Fern (via you):** whichever of those three passes a possibly-undefined id, the guard must be `enabled: isUuid(id)` (or the value must not be stringified upstream); the BE now answers 400 instead of 500, so the page will show a refusal rather than a spinner — but the request should not be made at all.
**No shared param validator existed** (no `zValidator("param")` anywhere in the repo; `ID = z.string().uuid()` is used for BODY fields only). Built: `middleware/uuid-params.ts` — `badUuidParams(pattern, path)` is pure (it reads the matched route PATTERN, the way `accessGuard` already does via `c.req.matchedRoutes`) and refuses any param named `id` or `<something>Id` whose value is not a uuid; `:key` (a SETTINGS key) and `:date` are excluded **by name**, and the route table's own census is pinned (`date · id · key · teacherId` are the only four param names in the API).
**Mounted on `/api/camp/*` only — deliberately, and this is the one thing I want your ruling on.** Mounted globally (`/api/*`, one character's difference) it is correct in production but **21 existing tests fail**: their fixtures call the root app with ids like `"b1"` / `"s1"`. That is fixture churn across a dozen files owned by other tasks' pins, not a product change, so I did not bundle it here. 👉 **Say the word and I will do it as its own S task** (fixtures first, then the one-character mount). Until then every non-camp route keeps the old behaviour.
Pinned by value through the ROOT app: `/camp/weeks/undefined/days` ⇒ **400** with the envelope, the service **never called** and `db.query.campWeeks.findFirst` **never called** (⇒ no `22P02`, because Postgres is never asked); the same for `PATCH /camp/weeks/undefined/days/:date`, `PATCH /camp/days/undefined`, `GET /camp/days/undefined/checkin`, `POST /camp/packages/undefined/days`; a real uuid still reaches the service and `:date` is untouched. The guard sits **after** `accessGuard` so a caller who may not see a route still gets its 403 rather than learning the route's shape from a 400.

## Break-and-watch — `mut450.mjs`, 14 mutations, **14 bite** (`try/finally`, sha-256 restore byte-identical)
A the body ignored again · B `details[]` dropped · C a non-JSON body becomes nothing · D the raw body unbounded · E the push throws the old count-shaped message · F the run stops collecting reasons · G the reasons collected but not printed · H the row stops storing its reason · I `undefined` passes as an id · J `:key`/`:date` forced to be uuids · K the guard refuses only after the handler ran · L uuid matching made case-sensitive · M the guard unmounted · N the guard mounted before the access guard.
🔑 Two of those (G, H) first read as "PASSED" because a mutated file can make a test file fail to LOAD — 22 passes and **zero** failures. The runner now also bites on *fewer tests than the clean baseline*; both then bit. Worth carrying into the next one: a mutation harness that trusts `fail=0` alone can report a passing mutation that never ran.

⛔ Only you mark this DONE. 📋 One DATA REQUEST (the outbox rows) · 📨 one line for @Fern (the `enabled: !!id` guard) · ❓ one ruling (global mount as its own task?).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-23) — and my ruling on the global mount: YES, its own task
Re-run by me: **2827 pass / 0 fail** · tsc 0 · 53 = 53 · `middleware/uuid-params.ts` + `describeLineError` in place. Three things of his I am keeping as decisions:
1. **He refused to answer the quota question from counts.** Right. The reason was always stored in the row's `error` column — only the run summary made a 429 and a dead token look alike. The verdict is a one-line read of rows already on `sid` (DATA REQUEST with Porter), not a re-test.
2. **The camp-only mount was the honest call for THIS task** — a global mount is one character and 21 fixture failures in other tasks' pins, which is churn disguised as a fix. ✅ **Ruling: do it as its own S task (TASK-451), fixtures first, one-character mount after** — a boundary that refuses a malformed id everywhere is worth an afternoon of fixtures, and every route that is not camp is currently one typo away from the same 500. The guard sitting AFTER `accessGuard` (a 403 before a 400) is correct and stays.
3. 🔑 **His harness finding is the important one and it is now a rule:** two mutations first read as PASSED because a mutated file can make a test file fail to LOAD — 22 passes, zero failures, nothing run. A break-and-watch that trusts `fail = 0` alone can report a passing mutation that never executed. His runner now also bites on *fewer tests than the clean baseline*. Recorded in SYSTEM-FACTS for every future task.


---

## §3 ✅ TASK-450b (FE) — Fern, 2026-09-24. **`isUuid`, not `!!id` — and the same guard on the WRITE door, which had none at all.**

```
bunx tsc --noEmit → exit 0
bun test          →  554 pass / 4 fail — ⚠️ the four are NOT mine (see the finding below); the baseline on this tree is 551/4 + my 3 new tests
bun run build     → ok
git status        →  3 source modified (lib/camp/units.ts · hooks/scheduler/useCamp.ts · CampBlockPanel.tsx) · 1 new test · 1 pin moved (grid.test's door line)
```
🚫 No deploy asked.

- **Which fix I chose, and why both:** the guard, not the upstream value. The value cannot be "un-stringified" at a single
  place — `block.campWeekId` is cast (`b.campWeekId as string` in `mergeCampCells`), `week?.id`, and a roster id come from
  three independent paths — so the honest fix is at the one door they share. Pure `isUuid(id)` (`lib/camp/units.ts`),
  value-tested: a uuid in either case passes; `""`, `" "`, `undefined`, `null`, a number, an object, a uuid PREFIX and a
  uuid with one character too many do not — and **the string `"undefined"` above all**, with `!!"undefined" === true`
  pinned beside it so the blind spot is stated, not implied.
- **The read:** `useCampWeekDays` ⇒ `enabled: isUuid(id)` (mutation 1). The other camp queries are unchanged — this TASK's
  line is the week-days one; `useCampPackages` takes a `studentId` from a picked student (say so rather than widen silently).
- **🔎 What I found beyond the line:** the GET was guarded (badly); **the WRITE was not guarded at all.** `CampBlockPanel`'s
  `Swap teacher` sends `PATCH /camp/weeks/${block.campWeekId}/days/:date` through a MUTATION, which has no `enabled` — a
  block whose week id never arrived would have sent `/camp/weeks/undefined/days/…` on a click, the same URL Jason's 400 now
  catches. The door is now absent without a uuid week id (hidden, never disabled) and the handler refuses too (mutations 4, 5).
  That is the more likely origin of the sid line: the panel opens from a merged camp block, where the id is a cast.
- 🔑 **Five mutations in `try/finally`, md5 identical on the three files:** the guard back to `!!id` · `isUuid` accepting any
  non-empty string · `isUuid` matching a PREFIX · the write door without the guard (2 fail) · the handler without it.

### ⚠️ Finding for @Sober — **four failing tests on this tree are NOT from this change**
Measured by stashing my edits: the tree **before** my change is **551 pass / 4 fail**; with it, **554 / 4** (+3, my new
tests). The four come from the last two commits on the branch (`510e2e7` *"give the course card a details box and
bottom-aligned actions"*, `c8e9639` *"render the course card's name line as a div, not a p"*, and the roles-matrix commit):
`users` gained a copy key (the pins say 62, the dictionary has 63 — three tests) and the course card's markup moved under
REQ-102 §13.3's rate pin. **I did not touch them** — they are another hand's work on shared ground and their pins are not
in my TASK. Tell me to move them and I will, in one pass, with the reason written in each.
