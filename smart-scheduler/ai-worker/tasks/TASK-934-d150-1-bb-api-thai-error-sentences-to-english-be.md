# TASK-934 — BE: back-office API Thai error sentences → English (D-150-1 (c)) — backoffice-back — @Jason (Team A)

**From @Sober, 2026-11-09. D-150-1 (c), Porter's ruling (22:30/22:31): the back office is English (D2), including the API's own error sentences that the FE shows verbatim.** Fanta found these while Englishing Team B's screens; the FE passes several of them straight through (`error.message`), so only the BE can make them English. Repo `smart-scheduler-backoffice-back`, branch `dong`. **This is a FOLLOW-UP: it does NOT hold the D-150-1/O-150-1/933 bundle deploy** — it rides a later BB deploy. Git only on the owner's word / the sid+Tanya grant. Chain: report in this TASK; Sober reviews.

## Scope — English the Thai human-readable error messages; keep the CODES unchanged
Only the `message` text changes; the error `code` (`PERIOD_EXISTS`, `NO_TEACHER`, `LOCKED`, `KIND_NOT_ALLOWED`, `NOT_MERIT_ELIGIBLE`, …) and the status stay exactly as they are (the FE and tests key on the code/status, never the sentence).
The ones Fanta listed (salary / period / profile / entries / my-slip domain):
- «ไม่พบงวดเงินเดือน» → e.g. "Pay period not found"
- «ไม่พบสลิป» → "Slip not found"
- «มีงวดเดือนนี้แล้ว» (PERIOD_EXISTS) → "This month's pay period already exists"
- «งวดนี้ไม่มีช่วงวันที่» → "This period has no date range"
- «ไม่พบโปรไฟล์» (×4 sites) → "Profile not found"
- «ต้องระบุเหตุผล» (×2) → "A reason is required"
- «ไม่พบรายการ» → "Line not found"
- «บัญชีนี้ไม่มีสลิปเงินเดือนของครู» (NO_TEACHER, my-slip) → "This account has no coach salary slip"
- (the lock sentence «งวดนี้ถูกล็อกแล้ว»/similar if present → "This period is locked")

**Do a sweep, don't just fix the list:** grep BB for Thai characters in `badRequest/notFound/conflict/throw`-style messages across the salary / period / profile / entries / my-slip routes+services and English every human sentence. **Out of scope / list-only:** «id ไม่ถูกต้อง» in the **notifications** path (different domain, not Team B's screens) — English it too if trivial and in the same sweep, else list it. Leave any sentence the **customer herself wrote in Thai and asked to keep** (none known in BB errors; if you find one, cite it and keep it).

## Done = (evidence in `## Implementation Notes`)
- tsc 0 · DB-less suite green · a test scans the BB error-message sites in these domains for Thai characters (allow-list any cited keep-Thai). Any existing test that pins a Thai sentence is updated to the English one (tag `🔻 TASK-934`); tests that key on the **code** are untouched.
- No migration, no schema, no route/behaviour change — message text only.
- `git status` clean; no git command. This does NOT ride the current bundle — report when done and it rides the next BB deploy.

## Claim
backoffice-back: the Thai→English sweep of back-office API error sentences (codes unchanged). **Sober reviews.** Questions → me.

## Questions / Implementation Notes / Review
_(—)_


## Implementation Notes: Jason (BE), 2026-11-09. DONE, ready for review. Message text only; every CODE and status unchanged.
**Sweep (salary / period / profile / entries / my-slip / transport route + service + lib files):** 28 sentence sites plus the ~30 `uuid(id, "…")` 404 messages in `routes/salary.ts` and `routes/transport.ts`, 14 distinct sentences, all now English, in `routes/salary.ts, salary-internal.ts, transport.ts` and `services/bonus-lines, commission-lines, salary, salary-reports, slip-confirm, transport`:
Pay period not found · Slip not found · No slip for this period (slip-confirm) · Coach not found · Line not found · Profile not found (×4) · School not found · Trip not found · This month's pay period already exists (`PERIOD_EXISTS`) · A school with this name already exists (`SCHOOL_EXISTS`) · This period is locked and cannot be edited (`LOCKED`, ×4 files) · This period has no date range (period_start / period_end) (`NO_RANGE` + 3 badRequest) · A reason is required (×2) · This account has no coach salary slip (`NO_TEACHER`, my-slip AND the slip-confirm copy) · Invalid service token (`salary-internal`).
**Evidence:** tsc 0 · suite **1396 pass / 0 fail** (+3). The only existing test that pinned a Thai sentence was a fake in `salary-reports.service.test.ts` (one line, now English); every code-keyed test is untouched. New `lib/english-errors-task934.test.ts`: scans the domain's non-test files and fails on ANY Thai character in a non-comment line (the ฿ sign U+0E3F is excluded; one cited keep: `salary-notify.ts` `looksLikeMoney`, the Thai money-word detector, not a message), a coverage guard so a moved file cannot silently drop out, and spot pins that the codes stayed (`PERIOD_EXISTS`, `NO_TEACHER`). Mutation checked: put one Thai sentence back, the scan failed (2 of 3 red); restored, green. No migration, schema or route change.
**Still Thai in BB, OUT of this domain, listed (your call, ~20 min if you want them):**
- `middleware/auth.ts` (service token / login / token-expired sentences), `lib/http.ts` defaults («ไม่พบข้อมูล», «ไม่มีสิทธิ์», «ไม่ได้รับอนุญาต»), `routes/auth.ts` login failure «ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง».
- **MY OWN R0.1 sentences**: `bo-user-admin.service.ts` + `routes/users.ts` (admit/deactivate: «ชื่อผู้ใช้ไม่ถูกต้อง», «ไม่พบผู้ใช้นี้ในระบบหน้าบ้าน», …). The Users page shows these verbatim, so they probably belong in this sweep; I did not touch them because R0.1 is already accepted and committed.
- `routes/notifications.ts` «id ไม่ถูกต้อง»; stock/inventory/catalog/revenue services (not Team B's screens).
No git command run.

## Review ✅ ACCEPTED (Sober, 2026-11-09) + extension: the R0.1 /users admit sentences (same bundle)
934 verified (light, message-only): codes/status unchanged (spot: `conflict("PERIOD_EXISTS","This month's pay period already exists")`, `ApiException(403,"NO_TEACHER",...)`), and `lib/english-errors-task934.test.ts` scans the domain for Thai (excludes ฿ U+0E3F, comments, cited `looksLikeMoney`) with a coverage-guard. tsc 0 · 1396/0 · mutation-checked. ✅ ACCEPTED.
**Extension (do now, same BB tree → rides the bundle):** English the **R0.1 /users admit + deactivate sentences** too — the Users page (back office) shows them verbatim, so D2 applies. `bo-user-admin.service.ts` + `routes/users.ts`. **Message text ONLY; every error CODE + status + `error.details.field` unchanged** (the FE keys on details.field + status). Update any test pinning a Thai admit sentence (tag 🔻 TASK-934) + add these files to the Thai-scan. Proposed English (Porter will nod — adjust): «ชื่อผู้ใช้ไม่ถูกต้อง»→"Invalid username" · «ไม่สามารถเพิ่มผู้ใช้เป็น CEO ได้»→"A user can't be added as CEO" · «role ต้องเป็น admin หรือ coach»→"Role must be admin or coach" · «teacherId ไม่ถูกต้อง»→"Invalid teacher" · «ผู้ใช้นี้ถูกปิดใช้งานในระบบหน้าบ้าน»→"This person is disabled in the front office" · «ไม่พบผู้ใช้นี้ในระบบหน้าบ้าน»→"This person is not in the front office" · «ผู้ใช้นี้ถูกเพิ่มในหลังบ้านแล้ว»→"This person already has a back-office login" · «โค้ชต้องระบุ teacherId»→"A coach must have a teacher selected" · «id ไม่ถูกต้อง»→"Invalid id" · «ไม่พบผู้ใช้»→"User not found" · «ไม่สามารถปิดใช้งานบัญชี CEO ได้»→"The CEO account can't be deactivated".
**HOLD — NOT in scope (Porter's call):** `middleware/auth.ts` + `routes/auth.ts` login/token sentences (the **login page was left as ruled** — needs Porter) and `lib/http.ts` defaults + `notifications.ts` + stock/inventory/catalog/revenue (a separate later D2 sweep). List them; don't touch. Ball: Jason (admit-English → report) → Sober (review) → Porter (word nod).


## Extension done: Jason (BE), 2026-11-09. R0.1 /users sentences are English (Sober's proposed words). Ready for review and Porter's word nod.
Message text ONLY in `services/bo-user-admin.service.ts` and `routes/users.ts`; every CODE, status and `error.details.field` unchanged (the 930 tests, including the details.field test, are untouched and green). Words: Invalid username · A user can't be added as CEO · Role must be admin or coach · Invalid teacher · This person is disabled in the front office · This person is not in the front office · This person already has a back-office login · A coach must have a teacher selected · Invalid id · User not found · The CEO account can't be deactivated · plus one not on your list, the non-object body in `routes/users.ts`: «ข้อมูลไม่ถูกต้อง» -> "Invalid request body" (adjust if Porter prefers another). No existing test pinned a Thai admit sentence (all key on code/status/field). The Thai scan in `lib/english-errors-task934.test.ts` now covers both files (DOMAIN regex + the coverage guard names them). tsc 0 · suite 1396 / 0. HELD as ruled, untouched: `middleware/auth.ts`, `routes/auth.ts` login/token, `lib/http.ts` defaults, `notifications.ts`, stock/inventory/catalog/revenue. No git command run.

## Extension ✅ ACCEPTED + remainder DEFERRED to a later Brew (Team C) TASK (Porter, 2026-11-09)
Jason's R0.1 admit/deactivate extension ✅ ACCEPTED (code-read: English words match, every code/status/`error.details.field` intact, Thai scan covers both files, 1396/0; one extra standard word "Invalid request body"). 934 + extension ride this bundle's BB deploy.
**Porter ruled the REMAINDER is a later TASK for Brew (Team C), NOT this bundle:** (1) login/auth — `routes/auth.ts` «ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง» + `middleware/auth.ts` service-token/login/token-expired sentences (Porter: login → English); (2) `lib/http.ts` defaults («ไม่พบข้อมูล»/«ไม่มีสิทธิ์»/«ไม่ได้รับอนุญาต»); (3) `routes/notifications.ts` «id ไม่ถูกต้อง»; (4) stock/inventory/catalog/revenue service sentences. This list is the Brew task's scope — Porter/Sector route it to Brew. Left untouched in this bundle.
