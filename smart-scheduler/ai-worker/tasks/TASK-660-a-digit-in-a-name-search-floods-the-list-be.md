# TASK-660 — F5: a digit in a student search floods the list — BE, S
- Source: F5 (TEST-075 §F5; deferred by the owner 2026-09-29) · sizing `SIZING-NEXT-ROUND-teamB-2026-10-04.md` §5 · Porter's go 2026-10-04 (the freeze lifted for F5 only)
- Status: DONE (reviewed by Silver, 2026-10-04) · ships with the NEXT batch
  - History: it was BLOCKED until @Porter granted Team B the claim on `src/services/parent.service.ts` and its test (board, `## Batch claims`, 2026-10-04). Q1 was accepted with a condition; see §Questions.
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-04)
- Depends on: none · 🔴 **Ships with the NEXT batch, not this one.** Do not rush it.

## §0 The cause (CERTAIN; read by me)
`studentSearchConditionsOn` (`src/services/parent.service.ts:642-650`):
```ts
const digits = normalizePhone(q);                         // strips every non-digit
if (digits) conditions.push(ilike(p.phone, `%${digits}%`)); // ANY digit ⇒ a phone match
```
- The real student "Ari3y(V)'MOM" ⇒ `digits = "3"` ⇒ `phone ILIKE '%3%'` matches nearly every parent.
- TEST-075 recorded **228 rows for `Ari3y`** and **1347 for `2`**.
- 📌 **History:** TASK-033 (2026-07-29) stopped a letters-only search from matching everyone. Its rule, "add the phone clause when there is any digit", is the same bug one step further. Its test `"mixed query containing digits → phone clause included"` (`parent.service.test.ts:20-22`) pinned that rule. It was **not** a business decision about mixed searches.

## What to do
1. In `studentSearchConditionsOn` only: add the phone clause **only when the query is phone-shaped.** That means:
   - after removing spaces, `-`, `+`, `(`, `)` and `.`, **only digits remain**; and
   - there are **at least 3 digits** (so `081` still works, and a lone `2` no longer floods).
   - Keep `normalizePhone` for the needle itself.
2. Name and nickname matching is unchanged.
3. **Every caller inherits the fix without being edited.** Name them in your notes and confirm none needs a change:
   - `search.queries.ts` (bookings, students, courses, vouchers);
   - `lib/eligibility.ts` (the picker);
   - the `scheduler.service.ts` callers. 🚫 **Do not edit `scheduler.service.ts`**: it is Team A's.
4. **Decide and declare:** the helper's name and where the "phone-shaped" test lives (beside `normalizePhone` is the obvious home).
5. 🚫 Out of scope, and noted only: `%` and `_` in a search are not escaped in ILIKE. That is a separate item if Porter wants it.

## Definition of Done
- [ ] 🔴 **Porter's condition, which is not negotiable: PROVE the two ordinary cases unchanged by PINNING them, not just asserting a count.**
  - **A pure-digit search still finds phones.** For `"081"`, pin that the phone condition's pattern is exactly `%081%`, beside name and nickname.
  - **A pure-name search still finds names.** For `"Aileen"`, pin that the name and nickname patterns are exactly `%Aileen%` and that there is no phone condition.
  - Pin through the **generated SQL**: drizzle `.toSQL()` on `studentSearchQuery(...)` needs no database. Then a change to either pattern goes red, not only a change in how many conditions there are.
  - **Break it and watch** on each of these too.
  - *Why it matters:* a search that returns too little is the same complaint from the other side, and it is harder to notice.
- [ ] Pure tests in `parent.service.test.ts`:
  - `"Ari3y"` → 2 conditions (no phone);
  - `"Ari3y(V)'MOM"` → 2;
  - `"2"` → 2;
  - `"081"` → 3;
  - `"081-234-5678"` → 3;
  - `"+66 81 234"` → 3;
  - `"  -  "` → 2 (existing).
  - The mixed `"โอ๊ด 081"` test is updated to the ruling in Q1, with its comment saying why.
- [ ] **Break it and watch:** revert to "any digit" and confirm the `Ari3y` test goes red. Paste both runs.
- [ ] 🔴 **Run ONLY without a reachable database** (owner ruling 2026-10-04: engineers never test against `sid`). Use the DB-unreachable recipe in `SYSTEM-FACTS.md` § "The DB-unreachable run is available in ANY `.env` state".
  - 🚫 Do not run with `--env-file=.env.sid`. That was the 10-02 practice, and it is now superseded.
  - Report the full-suite count, and **say the tree may hold Team A's uncommitted work**.
- [ ] `bunx tsc --noEmit` exits 0.
- [ ] `git status`: only `parent.service.ts` and its test. Nothing committed.

## Implementation Notes
**Bob, 2026-10-04.**

**What changed (`smart-scheduler-back`, nothing committed): `src/services/parent.service.ts` + `src/services/parent.service.test.ts` only** (+60 / −11).

**The fix:**
- In `studentSearchConditionsOn`, the phone clause now rides only when `isPhoneShaped(q, PHONE_SEARCH_MIN_DIGITS)` is true, with `PHONE_SEARCH_MIN_DIGITS = 3`.
- The needle is still `normalizePhone(q)`.
- Name and nickname matching is untouched.

**Decide and declare (internal):**
- **I reused the EXISTING `isPhoneShaped`** (`parent.service.ts`, TASK-447, beside `normalizePhone`) instead of writing a second "is this a phone" rule. It already means exactly the TASK's shape: only digits plus space · `-` · `.` · `(` · `)` · a leading `+`. I gave it a `minDigits` parameter.
  - **Its default stays 9**, so its chat callers (`line-webhook.service.ts`, `routes/checkin.ts`) are byte-for-byte unchanged.
  - Their own tests (`line-phone-in-silence-req105`, `line-silence`) are green in the full run.
  - One rule with two floors, so the two can't drift apart.
- ⚠️ **One small difference from the TASK's wording, stated:** that rule accepts `+` only at the START (`+66 81 234` ✅). A `+` in the middle (`81+234`) is not phone-shaped, so it gets name/nickname matching only. I kept the existing rule rather than fork it; overturn it if you want.
- The floor is a named constant, `PHONE_SEARCH_MIN_DIGITS`, beside the function.

**Callers: all inherit the fix and none is edited.**

| caller | effect |
|---|---|
| `search.queries.ts`: `courseMatch` (incl. a DUO's co-student via `studentSearchConditionsOn`), `studentMatch` (bookings · vouchers), `studentSearchQuery` | inherits |
| `parent.service.ts` `searchStudents` (`/students`) | inherits |
| `scheduler.service.ts:836` (`studentSearchQuery` → `/bookings?q=` and the eligible pickers) | inherits; **not touched** |
| `lib/eligibility.ts` | only a comment there; `matchesSearch` consumes the resolved ids |
| `validation.ts:404` | comment only |

**Tests (`parent.service.test.ts`):**
- **The TASK's seven cases:** `Ari3y` → 2 · `Ari3y(V)'MOM` → 2 · `2` → 2 · `081` → 3 · `081-234-5678` → 3 · `+66 81 234` → 3 · `"  -  "` → 2.
- The old *"mixed query containing digits → phone clause included"* test is **rewritten** as *"mixed query (name + digits) → name + nickname only"* (`โอ๊ด 081` → 2). Its comment says it pinned TASK-033's "any digit" rule and cites Porter's Q1 ruling.
- 🔴 **Porter's condition, pinned through `studentSearchQuery(q).toSQL()`** (no database; the precedent is `eligible-search.test.ts`). The whole WHERE clause and its params are compared exactly:
  - `081` ⇒ `where ("students"."name" ilike $1 or "students"."nickname" ilike $2 or "parents"."phone" ilike $3)` with `["%081%","%081%","%081%"]`.
  - `081-234-5678` ⇒ params `["%081-234-5678%","%081-234-5678%","%0812345678%"]`, so the phone needle is the DIGITS.
  - `Aileen` ⇒ `where ("students"."name" ilike $1 or "students"."nickname" ilike $2)` with `["%Aileen%","%Aileen%"]`, so there is **no phone condition**.

**Break it and watch** (on `parent.service.test.ts` + `eligible-search.test.ts`; baseline **24 pass / 0 fail**):

| mutation | result |
|---|---|
| M1: revert to "any digit" (`if (normalizePhone(q))`) | **4 red** — the `Ari3y` and `Ari3y(V)'MOM` tests, `2`, and the mixed-query test |
| M2: phone needle = the raw term | 1 red (the formatted-phone pin) |
| M3: floor 4 (`081` stops finding phones) | 3 red, **incl. the `081` `.toSQL()` pin** |
| M4: floor 1 (a lone `2` floods again) | 1 red |
| M5: name pattern prefix-only (`Aileen%`) | 3 red, **incl. the `Aileen` `.toSQL()` pin** |
| M6: phone clause on every query | 9 red, **incl. the `Aileen` pin** |

All restored (`cmp` against the backup) and re-run: **24 / 0**. Both of Porter's pins went red under a change to their own pattern (M3 for `081`, M5/M6 for `Aileen`), so they really are pinned.

**Runs. 🔴 With NO reachable database only** (the `SYSTEM-FACTS.md` recipe: `DATABASE_URL=postgres://nobody@127.0.0.1:1/none`, and `LINE_OA_WRITE_ALLOW` / `LIFF_ID` / `LINE_LOGIN_CHANNEL_ID` / `LINE_CHANNEL_ACCESS_TOKEN` blanked). No `sid`, no `--env-file`, and `.env` untouched.
- Full suite: **3846 pass / 0 fail, 3846 tests across 307 files**.
  - ⚠️ The tree also holds **Team A's uncommitted work** (`api.ts`, `scheduler.service.ts`, `other-series.service.ts`, `validation.ts`, several `src/lib` tests and mutation files). The count includes it. Nothing failed, so there is nothing to attribute.
- `bunx --package typescript@5.6.3 tsc --noEmit` → **exit 0**.
- `git diff --stat` for my files: only `parent.service.ts` and `parent.service.test.ts`. Nothing committed.

📌 **Not done, stated:** `%` and `_` in a search are still not escaped in ILIKE (out of scope per §5). Also, Sober's Team A practice now files mutation sets as `*.mutations.json`; this TASK did not ask for one, and M1–M6 are above. I can file them if you want that for Team B too.

## Questions
- **Q1 (Silver → Porter, user-visible): a name plus digits, e.g. `"โอ๊ด 081"`.**
  - Today it also matches every parent whose phone contains `081`.
  - With the fix it matches only names containing that exact text, which is almost always none.
  - *My proposal: accept that.* A mixed query is not a phone number. Searching by phone is still one plain number away.
  > answer (Porter, 2026-10-04): **ACCEPTED.** An admin searching a mixed string is looking for a PERSON, not a number. **Condition:** the pure-digit and the pure-name cases must be PINNED unchanged (the 🔴 DoD item).

## For the QA hand-off (one line, lifted into the next batch's hand-off by Silver)
- **Behaviour change, check it deliberately:**
  - **API:** `GET /api/bookings?q=Ari3y` (and `?q=2`) no longer returns the whole roster. `?q=081` still finds by parent phone, and `?q=<a name>` still finds by name.
  - **Screen:** the Bookings / Students search box shows the same results as the API.
  - A "name + digits" search (`โอ๊ด 081`) now matches names only. That is intended.

## Review
**Silver, 2026-10-04 — ✅ DONE.**
- **Diff read in full:** `parent.service.ts` (+22/−11) and its test. Nothing else of Team B's changed.
  - The phone clause now rides only on `isPhoneShaped(q, PHONE_SEARCH_MIN_DIGITS = 3)`, and the needle is still the digits.
  - Name and nickname are untouched.
- **Reusing `isPhoneShaped` is accepted, and it was the better call.** One rule with two floors cannot drift apart, and its default of 9 keeps the LINE chat callers exactly as before.
- **The `+` in the middle (`81+234` gets names only) is accepted.** A real phone carries `+` only in front.
- **Porter's condition is met:**
  - `081` and `Aileen` are pinned on the **whole generated WHERE clause and its params** (`.toSQL()`, no database).
  - **Each pin went red under a change to its own pattern** (M3 for `081`, M5 and M6 for `Aileen`).
  - The formatted-phone pin proves the needle is the digits.
- **Re-run by me, with no reachable database** (the SYSTEM-FACTS recipe):
  - `parent.service.test.ts` + `eligible-search.test.ts` → **24 / 0**;
  - the chat callers' `line-phone-in-silence-req105.test.ts` + `line-silence.test.ts` → **37 / 0**;
  - `tsc --noEmit` → exit 0.
  - ⚠️ **The tree also holds Team A's uncommitted work.** My runs were targeted; Bob's full run (3846/0) includes Team A's work.
- **On the `*.mutations.json` offer:** not needed for this TASK. M1–M6 in your notes are the record. If Porter wants that practice for both teams, it is his rule to set.
- **Ships with the NEXT batch.** The QA line above goes into that batch's hand-off.

## Follow-up owed (Silver, 2026-10-04): file the mutation set
- **Porter's rule, both teams (SYSTEM-FACTS, 2026-10-04):** a mutation set is a **committed file beside the test it proves**, named `*.mutations.json`. Every report that quotes a mutation score names the set.
- ⇒ @Bob: file M1–M6 as `src/services/parent.service-task660.mutations.json`, beside `parent.service.test.ts`.
  - Use the same `{ tests, mutations }` shape as Team A's sets (e.g. `src/lib/admin-records-teacher-leave-task608.mutations.json`).
  - Run it once through `scripts/mutation/run.ts` with no reachable database, and paste the result naming the set.
  - Nothing else changes; the TASK stays DONE once the set is filed and its run is pasted.
- 📌 Porter asked me to tell you: **you asked the right question.** The rule exists because Team A found its own scores could not be reproduced by anyone else. With one convention, a number means the same thing whoever reports it.
- ✅ **Filed (Bob, 2026-10-04):** `src/services/parent.service-task660.mutations.json` (`{ task, proves, note, tests, mutations }`, the TASK-608 shape).
  - `tests` = `parent.service.test.ts` + `eligible-search.test.ts`. Each anchor was checked to match exactly once.
  - Run: `bun run mutation:run -- --mutations src/services/parent.service-task660.mutations.json`, DB unreachable, `.env` untouched:
    ```
    baseline 24 (105 bytes)
    M1 BITES (20 pass / 4 fail vs baseline 24) — revert to TASK-033's 'any digit' rule — the F5 defect itself — restore byte-identical
    M2 BITES (23 pass / 1 fail vs baseline 24) — the phone needle is the raw term, not the digits — restore byte-identical
    M3 BITES (21 pass / 3 fail vs baseline 24) — floor 4 — `081` stops finding phones (Porter's pure-digit pin) — restore byte-identical
    M4 BITES (23 pass / 1 fail vs baseline 24) — floor 1 — a lone `2` floods the list again — restore byte-identical
    M5 BITES (21 pass / 3 fail vs baseline 24) — the name pattern becomes prefix-only (Porter's pure-name pin) — restore byte-identical
    M6 BITES (15 pass / 9 fail vs baseline 24) — the phone clause on EVERY query (the REQ-011 roster flood) — restore byte-identical
    CHECKSUM identical
    ```
  - **Set `parent.service-task660`: 6 BITES · 0 SURVIVED · 0 NO RESULT.** Every count equals my hand-run in the Implementation Notes. Nothing else changed.

- ✅ **Follow-up accepted (Silver, 2026-10-04):** the set is filed beside its test, 6 BITES / 0 / 0, its run is pasted and names the set, and the meta-test `mutation-sets-task627.test.ts` passes 32/0 with it included. **The follow-up is closed.**
