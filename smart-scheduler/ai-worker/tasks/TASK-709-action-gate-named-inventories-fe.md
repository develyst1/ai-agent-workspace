# TASK-709 — FE: **`action-gate.test.ts` — every bare count becomes a NAMED inventory** — @Fern (XS, ≈ 1½ h incl. +10 percent) · hygiene, test-only, no owner decision
**From @Sober to @Fern, 2026-10-11.** On @Porter's ask (`inbox/SA.md`, 2026-10-11: *"hygiene, cut freely"*). The spec is `SIZING-teamB-next-round-pile-2026-10-05.md` §7 (F-012); @Porter routed it to Team A today.
✅ **Claim (Team A):** front `src/lib/rbac/action-gate.test.ts` ONLY (+ a mutation set beside it). 🚫 No product file. Re-read the file first — the counts have moved since the spec (`:70` is **40** now, after `TASK-696`).

## The defect
- `:69` `expect(sites.length).toBe(110)` and `:70` `expect(new Set(sites.map((s) => s.file)).size).toBe(40)` count **the same population at two levels**, and **neither says what it holds**. One new gate breaks both, and `:70` only shows once `:69` is fixed: a tripwire with no label.
- `:51` `KEYS.length` 60 · `:166` the `users` dictionary 63 · `:171` the `rbac` dictionary 4 — bare counts of OTHER populations. Same treatment (cheap): include them.

## The build
- **Replace each bare count with the LIST it counts:** the `file → key` sites (sorted), the `KEYS`, the two dictionaries' key lists — so **adding a gate breaks ONE assertion and the diff names what changed.** **`:69` and `:70` are ONE population ⇒ ONE list:** the site list already carries each file, so a separate file list would make a gate in a new file break two assertions again — drop it. `:61` (the unused keys, named) is the pattern to copy.
- **The "asked as a literal" sweep stays exactly as strict.** Nothing loosened: the lists must equal today's sets **exactly** (no `toContain`, no `>=`).
- The comments that narrate past TASKs on `:69`/`:70` may go — the list itself now says it. Keep TASK-696's NAMED check (`LinkParentDialog` + `people.parent-create`) or let the list cover it; say which.
- 📌 **If a THIRD count of the SAME population turns up, stop and tell me** — then it is not a tidy-up.

## ✅ Done means
- `npx tsc --noEmit` 0 · `bun test` with **counts** · `unhandled-between-tests: 0` · `bun run build` 0. **The same number of tests pass before and after** (nothing deleted).
- **Mutations (`{tests, mutations}` set, TASK-637):** add a fake gate site · remove one · move one to another file · add a key to `KEYS` · add a key to each dictionary — **each must break exactly ONE assertion, and that assertion's diff must name it.** Print the list; CHECKSUM identical.
**Then:** my check → owner commit. Rides the next front release. No git.

---
## 📋 @Fern REPORT — 2026-10-11 — 🔨 DONE, ready for @Sober
(Re-read `action-gate.test.ts` first — the counts matched your note: 110 sites / 40 files / 60 keys / 63 users / 4 rbac.) **Test-only: `src/lib/rbac/action-gate.test.ts` + `scripts/mutation/task-709.json`. No product file.**
**What each bare count became (nothing loosened — all `toEqual`, no `toContain` / `>=`):**
- `:69` `sites.length === 110` and `:70` `files.size === 40` ⇒ **ONE list**, `SITE_INVENTORY`: the 110 `file → key` lines, sorted (a file with two literals appears twice, exactly as the old count counted occurrences). The file is inside each line, so a gate in a new file breaks ONE assertion, not two. The narrated TASK history on those lines is gone; the pointer for adding a gate is in the constant's comment.
- **TASK-696's named check (`LinkParentDialog` + `people.parent-create`): the list covers it** — its line is in `SITE_INVENTORY`, so I dropped the separate `.some`.
- `:51` `KEYS.length === 60` ⇒ `KEY_INVENTORY` (registry order, 60). `:166` ⇒ `USERS_KEY_INVENTORY` (63 EN keys, sorted). `:171` ⇒ `RBAC_KEY_INVENTORY` (4).
- **One design choice, said plainly:** the "exactly two keys have no FE site" assertion now filters the NAMED `KEY_INVENTORY`, not the live `KEYS` — otherwise a new key would break TWO assertions (the registry list and the unused list). The sweep itself is as strict as before (`unknown` still checked against live `KEYS`).
- Two `it()` titles carried dead numbers ("54 keys…", "86 key literals across 33 files"); they now say what is asserted, no numbers. **Same test count: 8 → 8; whole suite 1132 → 1132.**
- **Third count of the SAME population: none found** (I read the whole file; the `.size).toBe(4)` is the four distinct sentences, a different population).
**Verification:** tsc 0 · `bun test` **1132 pass / 0 fail, 126 files** (identical to before) · **unhandled-between-tests: 0** · build 0.
**Mutations** `scripts/mutation/task-709.json` (`{tests, mutations}`, `tests` = `action-gate.test.ts`, printed; baseline 8/0; CHECKSUM identical). **Every one fails exactly ONE assertion (7 pass / 1 fail):** G1 add a fake site (`DropResumeDialog` duplicate `course-drop`) · G2 remove a site (`ImportBalanceModal` `course-import`, key still used in `BookingsContent`) · G3 move a site to another file · G4 add a key to the snapshot (`actions.ts`) · G5 add a key to EN `users` · G6 add a key to EN `rbac`. **And the diff names it — I read two by hand** (then restored, md5 identical): G3 ⇒ `+ …DropResumeDialog.tsx → action:bookings.course-import` / `- …ImportBalanceModal.tsx → action:bookings.course-import`; G4 ⇒ `+ "action:calendar.zzz-fake"`. G5/G6 edit `dictionaries.ts` — the front tree was clean (`git status`: only my two files) when I ran them; the runner restores byte-for-byte.
**BALL: @Sober** (your check → owner commit; rides the next front release).
