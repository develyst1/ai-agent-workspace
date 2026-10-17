# TASK-725 — every red OUTSIDE the claim, in ONE list (Bob, 2026-10-11)

> Standing practice (Silver, 2026-10-07): full suite first, the WHOLE list once, **nothing outside the claim edited before the grant**. Nothing below has been touched.

## 0. How this was measured — so the numbers can be trusted
- The suite: the SAFE command (TASK-723), DB unreachable. **Current tree: 4175 pass / 147 fail.** `.env` never read or printed.
- **Baseline = the same tree with ONLY my files reverted to HEAD, in a scratch copy** (never the shared tree). The tree is shared and moved while I measured: that baseline showed 10 reds that were Team A's in-progress work, and **by the final run all but one of them were green** (their work landed; §6). **The reds below are those of the final run that the baseline did not have: 145.**
- **What is hiding under them** (the later `expect`s of each failing `it()`): I applied the mechanical fixes below **in a second scratch copy only** and re-ran: **4311 pass / 11 fail, and the 11 are exactly §4 (3 one-liners) + my own claim files (§5, 8 tests).** So after §2 and §3 **nothing else is hidden.**

## 1. The cause is only TWO things (plus three one-liners)
1. **A new migration `0067`** — 63 pin lines in 38 files count the migration files/journal entries (the standing convention). 39 tests are red at first because several files hold more than one pin, each hidden behind the one before it.
2. **`getAdminLineUserIds` now also reads `users`** (the linked web admins). Every test that fakes only `appSettings` for it now hits the real, unreachable DB: the webhook answers *"something went wrong"*, plus ECONNREFUSED escapes (13 *unhandled errors between tests*, the TASK's DoD wants 0).

## 2. The 63 migration-count pin lines (all follow ONE convention)
`expect(files.length).toBe(67); // TASK-497: +0059 · 🔻 TASK-540: +0060 · …` → **`toBe(68)`** and append `· 🔻 TASK-725: +0067` to that trailing comment. Derived by `grep -rnE "(toBe|toHaveLength)\(67\)" src --include=*.test.ts` (63 lines, every one carries the `+00xx` comment). **No other `67` is touched.**

| file | lines |
|---|---|
| `src/lib/archive-parent-req098.test.ts` | 44, 45 |
| `src/lib/archive-student-req093.test.ts` | 38, 41 |
| `src/lib/birth-month-req099.test.ts` | 97 |
| `src/lib/booking-rental-row-req091.test.ts` | 206, 208 |
| `src/lib/budget-visibility-req102.test.ts` | 206 |
| `src/lib/bulk-confirm-extended-req094.test.ts` | 75 |
| `src/lib/camp-3b-undo-qr-reminder-req095-3b.test.ts` | 45, 46 |
| `src/lib/camp-day-rate-req104.test.ts` | 65, 66 |
| `src/lib/camp-on-grid-req095-11.test.ts` | 53, 54 |
| `src/lib/camp-per-coach-window-req105.test.ts` | 53, 54 |
| `src/lib/camp-req095-3a.test.ts` | 44, 45 |
| `src/lib/camp-week-500-family-dedupe-req104.test.ts` | 161 |
| `src/lib/coach-rate-req095-13-3.test.ts` | 60, 61 |
| `src/lib/coach-rate-visibility-req102-6.test.ts` | 192 |
| `src/lib/course-rental-round2-req091-14.test.ts` | 178, 181 |
| `src/lib/duo-course-req095-13.test.ts` | 56, 57 |
| `src/lib/group-price-and-walkin-req095-2b.test.ts` | 188 |
| `src/lib/group-series-extender-req105.test.ts` | 190 |
| `src/lib/group-series-req104.test.ts` | 82, 83 |
| `src/lib/group-session-req095-2a.test.ts` | 46, 49 |
| `src/lib/group-slot-yield-req105.test.ts` | 105, 106 |
| `src/lib/oa-write-guard-req105.test.ts` | 139 |
| `src/lib/other-schedule-req095.test.ts` | 42, 45 |
| `src/lib/other-series-req101.test.ts` | 83, 84 |
| `src/lib/rbac-stage1-users-req092.test.ts` | 219, 222 |
| `src/lib/rbac-stage2-menu-guard-req092.test.ts` | 287 |
| `src/lib/rbac-stage3-actions-req092.test.ts` | 267 |
| `src/lib/rbac-stage4-roles-req092.test.ts` | 40, 43 |
| `src/lib/rich-menu-relink-req105.test.ts` | 167 |
| `src/lib/school-issue-reason-task690.test.ts` | 64, 65 |
| `src/lib/subject-kind-req095-13-4a.test.ts` | 41, 42 |
| `src/lib/teacher-own-calendar-req097.test.ts` | 51, 52, 425 |
| `src/lib/voucher-end-req103.test.ts` | 86, 87 |
| `src/lib/webhook-ack-first-req105.test.ts` | 166 |
| `src/lib/whole-course-rental-req091.test.ts` | 160, 161 |
| `src/lib/witness-observability-req105.test.ts` | 121, 161 |
| `src/services/course-expiry-edit.test.ts` | 40 |
| `src/services/province-and-note-req088-9.test.ts` | 123 |

(63 lines in 38 files.)

## 3. The tests whose fake answers `appSettings` but not `users` (the ~100)
The fix is the same one line each: give the recipients' read an answer, e.g. `spies.push(spyOn(db.query.users, "findMany").mockImplementation((async () => []) as any));` next to the existing `db.query.appSettings.findFirst` fake (or `query: { users: { findMany: async () => [] } }` on a hand-built `exec`). **Proven**: with the users read answering `[]` in a scratch copy, every test in this table passes.

| failing tests | file | owner of the file |
|---|---|---|
| 32 | `src/services/command-list-by-role-task523.test.ts` |  |
| 13 | `src/services/teacher-help-list-req109.test.ts` |  |
| 7 | `src/services/unmute-and-chips-req107.test.ts` |  |
| 5 | `src/services/line-phone-in-silence-req105.test.ts` |  |
| 4 | `src/services/calendar-web-link-task536.test.ts` |  |
| 4 | `src/services/declared-absence-stretches-expiry-task646.test.ts` | Team A's TASK |
| 4 | `src/services/teacher-schedule-tap-req109.test.ts` |  |
| 3 | `src/services/co-taught-my-schedule-req109.test.ts` |  |
| 3 | `src/services/duo-suspension-req108.test.ts` |  |
| 3 | `src/services/liff-link-req107.test.ts` |  |
| 3 | `src/services/link-conversation-ends-task520.test.ts` |  |
| 3 | `src/services/richmenu-round2-req107.test.ts` |  |
| 2 | `src/services/no-token-in-parent-copy-req107.test.ts` |  |
| 2 | `src/services/webhook-never-silent-req105.test.ts` |  |
| 1 | `src/lib/rbac-stage1-users-req092.test.ts` |  |
| 1 | `src/lib/rich-menu-relink-req105.test.ts` |  |
| 1 | `src/lib/webhook-ack-first-req105.test.ts` |  |
| 1 | `src/middleware/auth.test.ts` |  |
| 1 | `src/services/booking-undo-req108.test.ts` |  |
| 1 | `src/services/makeup-born-confirmed-task702.test.ts` | Team A's TASK |

## 4. Three one-line pins that are about something else
| file:line | why | the one-line fix |
|---|---|---|
| `src/lib/rbac-stage1-users-req092.test.ts:55` | the user DTO gained `lineLinked` (a boolean — the LINE id never leaves the server) | add `"lineLinked"` to the sorted key list (between `"isSuperAdmin"` and `"menus"`) |
| `src/middleware/auth.test.ts:99` | the login response's `user` is the same DTO | add `lineLinked: false` to the expected object |
| `src/services/makeup-born-confirmed-task702.test.ts:327` (Team A's TASK-702) | pins `J.entries.at(-1)` to be `0066` — it is no longer the LAST entry | look the entry up by `idx` instead: `J.entries.find((e) => e.idx === 66)` (keeps the claim "0066 is registered with this tag"; it can no longer rot) |

## 5. Inside my claim (I fix these myself — listed so nothing is invisible)
- `src/services/sec1-admin-code-task534.test.ts` — fails to LOAD (`checkAdminCode` is gone). TASK item 8 says extend it; I rewrite it for the one-time code, keeping the SEC-1 rules that still hold (same reply, miss limiter, no logging of the typed text) and adding the no-fallback pins.
- `src/lib/line-admin.test.ts` (5), `src/services/line-admin-removal-task538.test.ts` (7) — tests of `line-admin.ts` / `line-admin-links.service.ts`.
- `src/lib/rich-menu-admin-task530.test.ts` — pins `await addAdminLineUserId(lineUserId)` before `settleAdminLink` in the admin branch; it tests `verifyAndLink`, which is mine.

## 6. NOT mine — what was red WITHOUT my change (Team A's work in progress; I did not touch any of it)
At my first baseline the tree had 10 such reds (the `cancelSeatsOfGroup` / re-plan / TASK-705 family, and two that failed only in my scratch copy because I left out `sm-jobs/`). **By the final run 9 of the 10 were green**, because Team A's work landed in between. The one still red:
- `src/lib/group-series-req104.test.ts` — 🔴 ONE module, keyed — no copied function; the OTHER callers byte-identical; the seat path exported; 56 = 56 > `SeriesKe — ⚠️ it now ALSO carries a migration-count pin (counted in §2), so I could not tell the two causes apart by name.
