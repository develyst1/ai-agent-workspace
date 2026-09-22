# TASK-437 — `REQ-095 §13.4a` (SPEC-089 A): `subjects.kind` (`0050`), the seed script for the two DUO subjects, the DTO field, the server rule "a DUO course needs a DUO subject" — BE, S, CONTRACT FIRST

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-22) · **Size S.** Migration `0050_subject_kind` (51 = 51). No new key. The held batch.

## §0 Owner rulings (Porter 09-22, all as SPEC-089 A recommended)
A subject has a TYPE, not a name rule: `kind` = `PRIVATE` (default) | `DUO`. The two seeded DUO subjects (Duo INLINE SKATE / Duo SURFSKATE) carry `DUO`. The DUO Program dropdown lists DUO subjects only; the Private dropdown hides them; **the server refuses a DUO course on a non-DUO subject.**

## §1 Verify before the contract
1. `subjects` readers/writers: the subject DTO (`mappers.ts` — where `priceGroup` rides), `GET /subjects`, `POST/PATCH /subjects` (does the frontoffice create/edit subjects at all? — if yes, `kind` joins the body, validated against the closed set; if no, the seed script is the only writer — say which).
2. The DUO create (`POST /courses` with `duo`) — where `subjectId` is validated (`scheduler.service.ts` create path) — the seam for `400 NOT_A_DUO_SUBJECT`; and the reverse: a NON-DUO course on a DUO subject — refuse too (`400 DUO_SUBJECT`)? I say yes (a DUO program is not a Private one — the owner hid it from the Private dropdown); confirm.
3. The `ensure-sale-items` script shape for `scripts/ensure-subjects.ts` (upsert by `name`, `--dry-run` default, `--apply`; idempotent; prints what it would change). The two names by value: `Duo INLINE SKATE`, `Duo SURFSKATE` (as on `uat` — Porter confirms the exact strings; use these until told).

## §2 The contract I propose
- **`0050_subject_kind`:** `subjects.kind text NOT NULL DEFAULT 'PRIVATE'` (catalog-only add with a default on a SMALL table — fine) + `CHECK (kind IN ('PRIVATE','DUO'))` as `NOT VALID` + `VALIDATE` (the closed-set rule; the CHECK ⇔ `SUBJECT_KINDS` pinned by value, the TASK-406 lesson). The witness = the CHECK.
- `lib/subject-kinds.ts`: `SUBJECT_KINDS = ['PRIVATE','DUO']`, `isSubjectKind`.
- The subject DTO carries `kind`; every list that embeds a subject (the calendar's subjects, `GET /subjects`, the teacher-subjects lists) carries it by construction (one mapper).
- **The rule (service, before the tx):** a course create with `duo` ⇒ the subject must be `DUO` (`400 NOT_A_DUO_SUBJECT`); a course create without `duo` ⇒ the subject must not be `DUO` (`400 DUO_SUBJECT`); the OTHER/GROUP/voucher paths untouched (a voucher never draws a DUO subject — `VOUCHER_EXCLUDED_GROUPS` already excludes `balance-duo`; pin by value that it stays so).
- **Seed:** `scripts/ensure-subjects.ts --dry-run | --apply`: upserts the two DUO subjects (`kind = DUO`, `price_group = balance-duo`, `active = true`) by name; existing rows updated in place (never duplicated); pinned on a fixture (missing ⇒ created; present with `PRIVATE` ⇒ updated; present correct ⇒ untouched).
- 🚫 No pricing change (`balance-duo` stays the card key; `resolvePriceGroup` untouched); no RBAC change.
- ❓ for you: (1) §1.2's reverse refusal; (2) the frontoffice subject editor — exists? then the `kind` field joins it (validated).

## Definition of Done
- [ ] Contract confirmed via @Sober BEFORE code · suite **count** · tsc 0 · **51 = 51** · preflight `[]` · the CHECK ⇔ the set · the two refusals by value · the DTO field · the seed script by value on a fixture + `--dry-run` shape · 🔑 Break-and-watch, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-22) — §1 verified; §2 confirmed with two answers, one correction on the seed's shape, one ❓ of mine; no code yet

## §1 Verified in the repo
1. **Subject readers/writers.** There is NO `GET /subjects` and NO `POST/PATCH /subjects` — the frontoffice never creates or edits a subject (❓2 answered: no editor; `kind` joins no body). Subjects reach the FE through exactly TWO readers: (a) **`teacher.subjectOptions`** (`mappers.ts:33–37`, the ONE mapper every program picker renders — single · course · voucher · trial · plan; inactive dropped there and only there, REQ-065), shape `{ id, name }`; (b) **`GET /sellable-packages`** (`scheduler.service.ts:1774` `getSellablePackages`, the price card with each program that sells on it), shape `{ id, name }`. The only WRITERS are `db/seed.ts` and the owner-run **`scripts/add-subject.ts`** (`subjects:add` — insert-if-missing, dry-run by default, `--commit`; never updates an existing row by design, AC-5). ⇒ `kind` rides both readers (`{ id, name, kind }`); the seed script is the only writer of `DUO` — plus **`add-subject` gains `--kind PRIVATE|DUO` (default PRIVATE, validated against the set)**, or a third DUO program can never be added without a deploy; say no and I leave it.
2. **The seam.** `createCoursePackage` (`:1973`) resolves the price with `resolvePriceGroup(subjectId, input.duo ? "DUO" : courseGroupKind)` — for a DUO create it returns `balance-duo` WITHOUT reading the subject row, so today a DUO course can be sold on ANY subject id (the owner's hidden-dropdown is the only guard). The rule goes right there, before the tx: read the subject once (`db.query.subjects.findFirst`); `duo` + `kind ≠ DUO` ⇒ `400 NOT_A_DUO_SUBJECT`; no `duo` + `kind = DUO` ⇒ `400 DUO_SUBJECT` (**❓1: yes, the reverse too** — a DUO program is not a Private one, and `balance-duo` prices a 4-hour Private course at the DUO card otherwise). `importCoursePackage` (`:1855`) is the same shape without `duo` ⇒ the `DUO_SUBJECT` refusal applies there too (an import of a DUO course is not a thing yet). A course's subject cannot change later (`COURSE_SUBJECT_LOCKED`), so the create is the one seam.
3. **The seed's shape — Correction 1.** `ensure-sale-items` is upsert-by-ref with `--dry-run`; `add-subject` is insert-if-missing with `--commit`. `ensure-subjects.ts` needs the UPSERT (the two rows EXIST on `uat` as `PRIVATE` after `0050`'s default — they must be UPDATED in place to `DUO`, never duplicated), so it follows `ensure-sale-items`: `--dry-run` (the default) prints per name `create` / `update kind PRIVATE→DUO` / `unchanged`; `--apply` writes in ONE tx; idempotent; sets `kind = DUO`, `price_group = balance-duo`, `active = true`; matches by exact name (`Duo INLINE SKATE`, `Duo SURFSKATE` — until Porter confirms the bytes; a name mismatch ⇒ `create`, which the dry-run shows BEFORE anything is written, so a wrong string is caught by eye). The pure planner (`planEnsureSubjects(existing, wanted)`) is what the suite pins.

## §2 The contract — confirmed
- **`0050_subject_kind`** (51 = 51): `ALTER TABLE subjects ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'PRIVATE'` (a small table — the default fills in place; said in the header) + `subjects_kind_chk CHECK (kind IN ('PRIVATE','DUO'))` as `ADD CONSTRAINT … NOT VALID` then `VALIDATE` (the 0045 shape); the witness = the CHECK (`constraint-def` probe, `pg_get_constraintdef` contains both literals). The CHECK ⇔ `SUBJECT_KINDS` pinned by value (the test parses the migration's IN-list and compares — the TASK-410 lesson).
- **`lib/subject-kinds.ts`:** `SUBJECT_KINDS = ["PRIVATE", "DUO"] as const`, `isSubjectKind`, the two refusals (`NOT_A_DUO_SUBJECT` · `DUO_SUBJECT`), `assertSubjectKindForCourse(subject, duo: boolean)` — ONE pure rule both creates call.
- **Schema/DTO:** `subjects.kind text NOT NULL default 'PRIVATE'`; `subjectOptions[].kind` and `sellable-packages.packages[].subjects[].kind` — the two readers, one field each (pinned; no third reader exists — pinned by a scan of `{ id: s.id, name: s.name }` / `ts.subject` shapes).
- **The rule:** as §1.2 — before the tx, in `createCoursePackage` and `importCoursePackage`; by value: DUO on a PRIVATE subject ⇒ 400 `NOT_A_DUO_SUBJECT`, no row written; Private on a DUO subject ⇒ 400 `DUO_SUBJECT`; the matched pairs pass. OTHER / GROUP / voucher paths untouched — a voucher never draws `balance-duo` (`VOUCHER_EXCLUDED_GROUPS`, pinned by value stays); a single session / trial on a DUO subject stays as today (**❓ mine:** should `createBooking` refuse `SINGLE_SESSION` / `FIRST_TRIAL` on a DUO subject too? Today `balance-duo` has a 1-hour price (฿1,900), so a walk-in DUO hour IS sellable by design (TASK-399's walk-in) — I say leave it; say if the owner meant "DUO subjects are courses only").
- **Seed:** §1.3. **`add-subject --kind`:** §1.1 (default PRIVATE; the group/kind pair not cross-checked — a DUO kind on a non-DUO group is the owner's to decide; the dry-run prints both).
- 🚫 No pricing change; no RBAC change; `resolvePriceGroup` untouched.

## DoD as I will run it
Suite count · tsc 0 · 51 = 51 · preflight `[]` (alone + the batch) · the CHECK ⇔ the set by value · the two refusals by value on both creates (no write) · the two readers' `kind` by value · the planner by value (missing ⇒ create; PRIVATE ⇒ update; correct ⇒ unchanged; a foreign name untouched) · `--dry-run` shape by source · break-and-watch in `try/finally` with sha-256 · @Fern's lines · report ×4.

**For @Fern (draft):** `teacher.subjectOptions[]` and `GET /sellable-packages`'s `subjects[]` gain `kind: "PRIVATE" | "DUO"`; the DUO create's Program dropdown = `kind === "DUO"` only, every other picker = `kind !== "DUO"`; the server answers `400 NOT_A_DUO_SUBJECT` / `400 DUO_SUBJECT` on a mismatch (envelope, Thai message). No name-prefix rule anywhere.

⛔ Waiting on your confirm (the reverse refusal · `add-subject --kind` · the seed as an upsert · my ❓ on single/trial) before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-22) — build to §2 as written; four answers
1. **The reverse refusal — YES** (`DUO_SUBJECT` on a Private/import create), your reasoning stands (a 4-hour Private on `balance-duo` would be mispriced).
2. **`add-subject --kind` — YES** (default PRIVATE, validated; the group/kind pair printed, not cross-checked).
3. **The seed as an UPSERT (Correction 1) — YES**; the pure planner is the pin; the two name strings as written until Porter confirms the bytes (the dry-run's `create` line is the catch).
4. **Single session / trial on a DUO subject — LEAVE IT** (TASK-399's walk-in DUO hour is a designed sale at the DUO card). The rule is about COURSES; I say so to Porter in case the owner reads it wider.
Everything else as your §2 (the witness = the CHECK; the two readers' `kind`; no third reader by scan). Fern's lines final = your draft; TASK-438 §0 set.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-22) — built as confirmed; `0050` ⇒ 51 = 51; 2729 pass / 0 fail; 14/14 mutations bite

**Numbers:** `bun test` **2729 pass / 0 fail**, 209 files (+1: `src/lib/subject-kind-req095-13-4a.test.ts`, 11 tests) · `tsc --noEmit` **0** · 🔴 **`drizzle/0050_subject_kind.sql` — 51 = 51** (idx 50) · offline preflight `0050` alone `[]` and the batch 0038 → 0050 `[]` · 24 pins moved (the migration census 50 → 51 in 22 files; the picker's subject shape gains `kind`; the DUO create fixtures now answer the subject read).

## What was built
- **`0050_subject_kind`:** `subjects.kind text NOT NULL DEFAULT 'PRIVATE'` (a small table — the default fills in place, said in the header) + `subjects_kind_chk CHECK (kind IN ('PRIVATE','DUO'))` dropped-if-exists, added `NOT VALID`, then `VALIDATE`d (the 0045 shape, SHARE UPDATE EXCLUSIVE). The witness = the CHECK's definition (`constraint-def`, contains `DUO`), the LAST entry. **The CHECK ⇔ `SUBJECT_KINDS` by value:** the test parses the migration's IN-list and compares it to the code's set — a third kind on either side fails the suite (mutations C and J bite).
- **`lib/subject-kinds.ts`:** `SUBJECT_KINDS = ["PRIVATE", "DUO"]`, `isSubjectKind`, `NOT_A_DUO_SUBJECT` (400 `คอร์ส DUO ต้องใช้โปรแกรม DUO`) / `DUO_SUBJECT` (400 `โปรแกรม DUO ขายได้เฉพาะคอร์ส DUO`), `assertSubjectKindForCourse(subject, duo)` — the ONE pure rule (a row without a kind reads PRIVATE), `DUO_SUBJECT_SEEDS` (the two names), and the pure `planEnsureSubjects(existing, wanted)`.
- **The rule at both creates, BEFORE the tx:** `createCoursePackage` reads the subject once (its DUO branch never did — it priced from the DUO card blind) and asserts against `!!input.duo`; `importCoursePackage` asserts `false` (an import is a Private course). By value: a DUO create on a PRIVATE subject ⇒ 400 `NOT_A_DUO_SUBJECT` and the transaction never opens; a Private create / an import on a DUO subject ⇒ 400 `DUO_SUBJECT`, same. `createBooking` untouched — a walk-in DUO hour stays sellable (your ruling); `VOUCHER_EXCLUDED_GROUPS` still holds `balance-duo`; `resolvePriceGroup` never reads `kind` (pinned).
- **The two readers carry `kind`:** `teacher.subjects[]` (the ONE picker mapper — `{ id, name, kind }`, PRIVATE when a row has none) and `GET /sellable-packages`'s `subjects[]`. Pinned that these are the only two builders of the subject shape.
- **The seed — `scripts/ensure-subjects.ts` (`bun run subjects:ensure`):** the pure planner by value — missing ⇒ `create`; present as PRIVATE (uat after `0050`'s default) ⇒ `update kind PRIVATE→DUO` IN PLACE; present correct ⇒ `unchanged`; inactive ⇒ re-activated; a foreign name never touched; idempotent. `--dry-run` is the default (prints `+ / ~ / =` per name, writes nothing); `--apply` writes in ONE tx — `update … where name =` for an existing row, never a second insert (mutation L bites). ⚠️ The names are `Duo INLINE SKATE` / `Duo SURFSKATE` until Porter confirms uat's bytes — a mismatch shows as `create` in the dry-run before anything is written.
- **`add-subject --kind`:** `planSubjectAdd` takes `kind` (default PRIVATE, validated against the set — an unknown kind refused before any write); the insert carries it; the plan prints `ประเภท`.
- 🚫 No pricing change; no RBAC change.

## Break-and-watch — `mut437.mjs`, 14 mutations, **14 bite** (`try/finally`, sha-256 restore byte-identical)
A/B either refusal dropped · C/J the set drifts on either side · D the planner duplicates · E the planner ignores the kind · F the rule after the tx opens · G the import skips it · H/I a reader drops `kind` · K the column nullable · L the apply inserts on update · M the dry-run writes · N `add-subject` accepts an unknown kind.

## Contract lines for @Fern (TASK-438) — final
- `teacher.subjects[]` and `GET /sellable-packages`'s `packages[].subjects[]` gain `kind: "PRIVATE" | "DUO"`.
- The DUO create's Program dropdown = `kind === "DUO"` only; every other picker (single · course · voucher · trial · plan) = `kind !== "DUO"`. No name-prefix rule anywhere.
- `POST /courses` ⇒ `400 { code: "NOT_A_DUO_SUBJECT" }` (a `duo` body on a non-DUO subject) or `400 { code: "DUO_SUBJECT" }` (a Private body on a DUO subject); `POST /courses/import` the latter.

📦 Deploy (the human's): `db:migrate` (verify **51**) → `bun run subjects:ensure` (dry-run) → `--apply`. 🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ TASK-439's contract follows in its TASK.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me: **2729 pass / 0 fail** · tsc 0 · **51 = 51** (`0050_subject_kind`) · `scripts/ensure-subjects.ts` present. Fern's lines = TASK-438 §0. Deploy list: `ensure-subjects` dry-run → `--apply` after `db:migrate`.
