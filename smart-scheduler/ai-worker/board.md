# Board — smart-scheduler

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Smart Scheduler — scheduling + back-office ERP for a balance/wheeled
  sports activity center (replaces manual Excel + Alis To Soft).
- Code repository (monorepo root): `C:\Users\Admin\develyst\smart-scheduler`
  - `smart-scheduler-back` — scheduling API, Bun + Drizzle, **port 4006** (~75%) → Jason
  - `smart-scheduler-front` — staff calendar UI, Next.js, **port 3016** (~70%) → Fern
  - `smart-scheduler-backoffice-back` — ops/finance API (`ops` schema), **port 4010** → Jason
  - `smart-scheduler-backoffice-front` — admin ERP/money UI, Next.js, **port 3018** → Fern
    (**NOT 0%** — P&L dashboard + Items CRUD already built; backoffice pivoted to an
    item-centric P&L model, wallet/payroll set aside — see `project-understanding.md` §6)
- **Read first**: `ai-worker/project-understanding.md` (as-built map of all 4 repos,
  2026-07-20), then the monorepo root `CLAUDE.md` and `docs/` (business-domain,
  product-catalog-pricing, teacher-roster-payroll, monorepo-overview,
  requirement-timeline — newest entry wins). Older docs saying "tutoring school"
  are wrong — the real business is sports/balance programs.
- DB: one PostgreSQL — `public.*` (scheduling, owned by back) + `ops.*` (finance,
  owned by backoffice-back). The DATA REQUEST rule applies to **real/production
  data and live environments**; reading schema from the repos' Drizzle files is fine.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Freelance pay as monthly budget-stock + auto-disable at cap | HIGH | ✅ **DELIVERED** | Live & confirmed by คุณฟีน 2026-07-20 (freelance cap shows on frontoffice; budgets/salaries/P&L working). **Remaining ops (non-blocking):** register 2 scheduled tasks + swap placeholder→real numbers. |
| REQ-002 | Backoffice admin authentication (login + real JWT) | HIGH | ✅ **DELIVERED** | Live & confirmed 2026-07-20 — admin login works, auth enforced (`SKIP_ADMIN_AUTH=false`). |
| REQ-003 | Unified teacher onboarding/offboarding — one action, auto-synced both systems | HIGH | ⏸️ **ON HOLD** | **Do NOT deploy** (built, but its backoffice sync is moot — backoffice is being torn down). Rework the teacher-management parts as standalone under a later REQ. |
| REQ-004 | Move freelance limit into the frontoffice — standalone, no backoffice dependency | HIGH | ✅ **DELIVERED** | Deployed & confirmed working by คุณฟีน 2026-07-20. Freelance limit now standalone in the frontoffice. |
| REQ-005 | Standalone teacher management (rework REQ-003 minus ops sync) | **HIGH** | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-28** (stakeholder ran, Porter verified): teacher **archive** + **switch active/inactive** now return **200** (were 502/500); create/edit/reactivate OK. SPEC-007 / TASK-029 DONE & Sober-verified, deployed — teacher management is standalone (ops teacher-sync removed; availability routing fixed). |
| REQ-006 | Backoffice rebuild — universal "item" model on the shared DB | HIGH | ✅ **DELIVERED** | **Deployed + acceptance PASSED 2026-07-28** (stakeholder ran, Porter verified). Code DONE & Sober-verified: TASK-027 (shared `smart_scheduler` DB + retire ops) · TASK-028 (freelance money leak fixed — ATTENDED↔SICK_LEAVE toggle no longer inflates) · TASK-029 · TASK-030 (drift-safe `migrate:bo`). Re-deploy done: `migrate:bo` skipped the drifted `ops`, migrated freelance budgets; both backends restarted on `smart_scheduler`. **Non-blocking follow-ups:** verify the FULL freelance roster's budgets in FE (migrate carried only `freelance=1`); re-home TRIAL/SINGLE revenue → `bo`; tag-prefill; `bo.movement` unique-index; **REQ-009** (type-change budget close). |
| REQ-007 | Freelance cap on the calendar — budget-fill color strip + auto-hide when full | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): freelance with budget shows the **%-used color strip** (🟢≤30/🟡30-70/🔴>70); a **full** freelance is **hidden** from the calendar (like inactive); **top-up / limit-override / monthly reset brings them back**. TASK-032 (revised, superseded TASK-031; hide-when-full + %-strip, override-to-book removed), FE-only, deployed to `smart-scheduler-front`. TASK-031 never shipped → no wrong behavior was ever live. |
| REQ-008 | Bulk-confirm bookings (multi-select) | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): tick multiple PENDING bookings → "Confirm selected" confirms them in one action; a results modal reports each outcome; an over-budget freelance is **skipped-and-reported** (no batch rollback — explained to + OK'd by stakeholder); retry-safe (no dup LINE). TASK-036 (BE `POST /bookings/bulk-confirm`) + TASK-037 (FE multi-select + results modal), Sober-verified, deployed (back+front). |
| REQ-009 | Close the freelance ceiling on teacher type-change (+ admin warning) | MEDIUM | **READY_FOR_SA** | Sober — write SPEC. Follow-up flagged during TASK-029 review; stakeholder confirmed 2026-07-28: on FREELANCE→FT/PT, **close the freelance budget + warn the admin first** (keep history; new budget if changed back). **Lowest priority — after hotfixes + REQ-006 re-deploy.** No money leak. |
| REQ-010 | Show each student's sport program (subject) on the `/scheduler/bookings` course list | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): each `/scheduler/bookings` course card shows its **sport program** (Surfskate/Inline/…). TASK-034 (BE — `CourseSummary.subject` derived at read time, no migration) + TASK-035 (FE — `CoursePackagePanel`), Sober-verified, deployed (back+front). Vouchers out of scope. |
| REQ-011 | 🐛 Student picker doesn't filter when typing (New Booking / course / voucher) — fixed | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): typing a name in the student dropdown now **filters** the list (not the whole roster). Root cause was backend: `searchStudents` added a parent-phone `ilike('%%')` for non-numeric queries → matched everyone; TASK-033 adds the phone term only when the query has digits. Sober-verified, deployed to `smart-scheduler-back`. |
| REQ-012 | Registration/profile **form opened from LINE** capturing demographics (gender/DOB/province/nationality) | MEDIUM | **READY_FOR_SA** | Sober — spec. **RE-SCOPED 2026-07-29:** registration lives on LINE → capture via a **nice web form opened from LINE** (LIFF-style; nicer/simpler than Google Form) + also usable from the staff web. 4 fields missing on `students`. **Depends on REQ-015 (LINE UX) · prerequisite for REQ-013 demographics.** Qs: required/optional; nationality flag; province dropdown; also enroll-via-form? |
| REQ-013 | SOM dashboard (frontoffice) — customer / activity / attendance analytics | MEDIUM | **READY_FOR_SA** | Sober — spec (2026-07-25 meeting §1–4). Metrics **1/2/3/5 computable now** (existing-customers by course/voucher/trial-3mo, sport %, new/renew this month, daily attendance) → **new read endpoints + FE**; metric **4 (demographics) depends on REQ-012**. Financial parts split to REQ-014. Qs: mixed-student sport rule; voucher-expiry caveat; "new this month" definition. |
| REQ-014 | Backoffice — revenue by activity + per-customer spend (executive-only **by system**, no new roles) | MEDIUM | **READY_FOR_SA** | Sober — spec. **⚠️ RBAC DISSOLVED (stakeholder 2026-07-29): NO new role system** — the backoffice login **is** the executive's; only executives access the backoffice; front staff stay on the frontoffice → finance-on-backoffice = already executive-only (REQ-002). So REQ-014 = just **revenue-by-sport + per-customer spend on the backoffice**. Monthly revenue total HAVE; **split-by-sport PARTIAL** (sale carries no subject → SA tags sport on sales); per-customer spend PARTIAL (finance join). **No open business Q — UNBLOCKED.** |
| REQ-015 | LINE OA — easy & pretty & bilingual (buttons / rich menu / flex + TH/EN) [LINE-A] | **HIGH** | ✅ **SPEC_DONE — deploy gaps CLOSED, ready to release** | **@Porter — image review + release.** All four tasks DONE & Sober-verified: TASK-038/039 (bot) + **TASK-040** (`bun run line:publish-menus`, re-runnable; I re-ran the preflight: clean failure, no API call) + **TASK-041** (4 PNGs at exact dims 2500×1686 / 2500×843, 20–47 KB, grid aligned to the code's tap bounds — I inspected them visually; regenerable via `assets/line/generate-rich-menus.mjs`). **FYI for your review with คุณฟีน:** button labels use the bot's own `line-i18n` wording (นักเรียนของฉัน / เพิ่มนักเรียน) so menu and replies agree — a different phrasing is a one-line regenerate. **Release (ONE deploy):** TASK-038 **+** TASK-039 both **DONE & Sober-verified** (tsc 0 · suite **126/0** · LINE tests 13/0 · my own scope-guard, postback-authorization and Thai-literal greps). Bot is now **tap-driven** (parent/teacher rich menus, **no QR button**; quick-reply booking picker replaces "type 1 or 2"; flex lists; every reply keeps a back-to-menu button) **and bilingual TH/EN** (i18n table + TH fallback; per-user `line_lang` default TH seeded from LINE locale; toggle re-links the matching-language menu; outbox pushes localized to the recipient). **QR plumbing untouched** (`/checkin?token=`, token, `qr` keyword — scope guard held); postback booking ids are authorized against the parent's own bookings. **Deploy:** (1) apply `drizzle/0012_line_lang.sql` (`ADD COLUMN IF NOT EXISTS`) · (2) publish the **four** rich menus (parent/teacher × TH/EN images) via `publishRichMenus` · (3) redeploy scheduling-back (:4006) · (4) OA smoke: check-in/leave/children by tap, booking picker, language toggle (replies + menu flip, persisted), old keywords + `/checkin?token=` still work. _(History:  **@Sober — review TASK-038 (REVIEW); then @Jason builds TASK-039 (ship both together).** TASK-038 done by Jason 2026-07-29: postback layer + 2 rich menus (no QR) + quick-reply/flex builders + shared keyword/postback actions; strings centralized in `line-reply.S` for the i18n swap; tsc 0, `bun test` **122/0** (postback-parse + reply-builder + menu-structure tests). LINE-API = OA-smoke (brownfield). Orig:  **@Jason — build TASK-038 → TASK-039 (ship together).** SPEC-012 ACTIVE; all 3 Qs answered by คุณฟีน 2026-07-29: **(Q1)** TH+EN, explicit toggle, persisted, default TH, seeded from locale ✓ · **(Q2)** menus confirmed **minus the QR button** (Porter verified "QR" is a plain text check-in URL, not a QR code, and duplicates direct check-in) — put that effort into making check-in+leave genuinely good; **⚠️ scope guard: do NOT delete the QR plumbing** (`/checkin?token=`, token, `qr` keyword = contracted scope; menu-removal only) · **(Q3)** build **both** stages, **ship as ONE delivery**. Design = postback layer over the existing handlers (keyword stays a fallback) + quick-reply/flex + `line-i18n` + per-user `lang` (additive migration, human applies).)_ |
| REQ-016 | Teacher self-service — check my schedule on LINE [LINE-B] | MEDIUM | **READY_FOR_SA** | Sober — spec. Teacher has NO LINE commands today (push-only); wants "my schedule today/this week". **Small** — data path exists (`GET /bookings?teacherId&from&to`). Qs: views (today+week); detail level. |
| REQ-017 | Teacher bookings → phone calendar (subscription feed) [LINE-C] | MEDIUM | **READY_FOR_SA** | Sober — spec. Nothing today (UC-035 Planned). **Feasible + small: per-teacher tokenized `.ics` subscription** (`webcal://`, reuses `GET /bookings` + token pattern) → any phone calendar. Heavier alt = Google Calendar two-way. Qs: `.ics` (recommended) vs Google two-way. |

> 🗓️ **SEQUENCE (stakeholder 2026-07-29):** the **LINE work comes FIRST** → then the demographics/dashboard chain.
> Order: **REQ-015 (LINE UX+bilingual)** — foundation; **REQ-016 + REQ-017** (teacher schedule + calendar sync,
> independent, can run in parallel) → **REQ-012** (registration/demographics form opened from LINE, needs REQ-015)
> → **REQ-013** (SOM dashboard, needs REQ-012 for demographics) → **REQ-014** (backoffice revenue/spend, independent).
> Still open earlier in the queue: **REQ-009** (freelance type-change close). REQ-010/011 DELIVERED.

> ⚠️ **STRATEGIC PIVOT (2026-07-20, คุณฟีน):** current **backoffice is being torn down &
> rebuilt from scratch** (hard to use / not scalable). Finish the **frontoffice first,
> stand-alone**. Freelance limit → moves into frontoffice (REQ-004). Freelance **P&L/expense
> + FT/PT salary = deferred** to the new backoffice. REQ-003 (teacher↔ops sync) ON HOLD.
> REQ-001/002 stay DELIVERED but their backoffice-side money features are superseded by the rebuild.

> SPECs written 2026-07-20: **SPEC-001** (freelance budget-stock, booking-time cap
> & expense) + **SPEC-002** (FT/PT recurring effective-dated fixed-cost salary),
> both from REQ-001. 6 buildable tasks cut; TASK-007 (day-end revenue) blocked on
> a revenue-recognition question to Porter (does NOT block the other 6).

> Decision (2026-07-20, คุณฟีน): backoffice = **Path A, item-centric P&L**. No full
> payroll engine, no student hour-wallet. Freelance pay = per-teacher monthly
> "budget-stock" drawn down at the end-of-day cut → auto-disable at cap. Full/part-time
> = manual `FIXED_COST`. See REQ-001 + `project-understanding.md` §6.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | ops: reversible P&L expense + allowNegative + freelance-budget item | SPEC-001 | DONE | Jason | — |
| TASK-002 | scheduling: freelance draw-down at booking + reversal on cancel/leave | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-003 | backoffice-front: "Freelance Budgets" screen (list/create/top-up/display) | SPEC-001 | DONE | Fern | TASK-001 |
| TASK-004 | scheduler-front: baht remaining/budget + near-cap warning + real-time hide | SPEC-001 | DONE | Fern | TASK-008 |
| TASK-005 | ops: recurring FT/PT salary + shared month-start job (reset + materialize) | SPEC-002 | DONE | Jason | TASK-001 |
| TASK-006 | backoffice-front: "FT/PT Salary" admin screen (effective-dated) | SPEC-002 | DONE | Fern | TASK-005 |
| TASK-007 | scheduling: end-of-day REVENUE tally (attended TRIAL+SINGLE only) | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-008 | scheduling: teacher DTO budget fields + persist limit-override | SPEC-001 | DONE | Jason | TASK-002 |
| TASK-009 | ops: PATCH /catalog/items/:id (edit item) | SPEC-001 | DONE | Jason | TASK-001 |
| TASK-010 | backoffice-front: Edit modal for Freelance Budgets | SPEC-001 | DONE | Fern | TASK-009 |
| TASK-011 | align cross-service port config to real map (ops-back :4010, ops-front :3018) | SPEC-001 | DONE | Jason | — |
| TASK-012 | ops: seed first-trial / single-session INCOME items (day-end revenue) | SPEC-001 | DONE | Jason | TASK-007 |
| TASK-013 | ops: admin login endpoint + real JWT verification (mirror scheduling) | SPEC-003 | DONE | Jason | — |
| TASK-014 | backoffice-front: login page + cookie session + proxy.ts guard + logout | SPEC-003 | DONE | Fern | TASK-013 |
| TASK-015 | ops: serviceAuth teacher-sync API (party upsert/deactivate + salary terminate) | SPEC-004 | DONE | Jason | — |
| TASK-016 | scheduling: teacher CRUD + archive + ops sync + setup-incomplete gate | SPEC-004 | DONE | Jason | TASK-015 |
| TASK-017 | scheduler-front: teacher add/edit/change-type/archive UI + setup-incomplete gate | SPEC-004 | DONE | Fern | TASK-016 |
| TASK-018 | scheduling: teacher↔ops drift reconcile report | SPEC-004 | DONE | Jason | TASK-016 |
| TASK-019 | scheduling: local freelance budget (re-home from ops, standalone) | SPEC-005 | DONE | Jason | — |
| TASK-020 | scheduler-front: frontoffice freelance budget admin (set/edit/top-up) | SPEC-005 | DONE | Fern | TASK-019 |
| TASK-021 | backoffice-back: `bo` schema + migration (item/movement/tags) | SPEC-006 | DONE | Jason | — |
| TASK-022 | backoffice-back: universal item/movement/tag API + P&L report (single-admin JWT) | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-023 | backoffice-front: admin UI on the universal item model | SPEC-006 | DONE | Fern | TASK-022 |
| TASK-024 | scheduling: re-absorb freelance ceiling as a `bo.item` (in-tx, unit=hour) | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-025 | backoffice-back: data migration `ops.*` + `freelance_budgets` → `bo.*` | SPEC-006 | DONE | Jason | TASK-021 |
| TASK-026 | scheduler-front: re-point freelance budget admin at `bo`-backed data | SPEC-006 | DONE | Fern | TASK-024 |
| TASK-027 | backoffice-back: shared-DB topology fix (`bo` in `smart_scheduler`; migrate ops-optional; retire ops routes) | SPEC-006 | DONE | Jason | TASK-025 |
| TASK-028 | scheduling: freelance-drawdown idempotency — reconcile-to-target invariant (fixes the REQ-006 bug + latent REQ-004) | SPEC-006 | ✅ **DONE** | Jason | TASK-024 |
| TASK-029 | scheduling: standalone teacher mgmt — remove ops teacher-sync (5 sites) + retire `reconcile` + fix availability 500 (routing) | SPEC-007 | ✅ **DONE** | Jason | — |
| TASK-030 | backoffice-back: make `migrate:bo` drift-safe — ops passes degrade (catch 42P01/42703) so the essential freelance pass always runs | SPEC-006 | ✅ **DONE** | Jason | — |
| TASK-031 | scheduler-front: freelance budget strip on calendar + keep over-cap selectable + per-action override (confirm **+ direct-attend**) | SPEC-008 | DONE — ⚠️ **SUPERSEDED** by TASK-032 (REQ-007 revised) | Fern | — |
| TASK-032 | scheduler-front: REQ-007 revised — hide-when-full + %-used strip; remove the override-to-book (reverts TASK-031) | SPEC-008 | ✅ **DONE** | Fern | — |
| TASK-033 | scheduling: fix student search — phone `ilike` only when the query has digits (non-numeric q was matching all) | SPEC-009 | ✅ **DONE** | Jason | — |
| TASK-034 | scheduling (BE): add `subject: SubjectRef\|null` to `CourseSummary` — derive from the course's bookings in `getCourses` | SPEC-010 | ✅ **DONE** | Jason | — |
| TASK-035 | scheduler-front (FE): render the sport-program name on the `/scheduler/bookings` course cards | SPEC-010 | ✅ **DONE** | Fern | TASK-034 |
| TASK-036 | scheduling (BE): `POST /bookings/bulk-confirm` — loop single-confirm per id (own tx, partial-success, no batch rollback) | SPEC-011 | ✅ **DONE** | Jason | — |
| TASK-037 | scheduler-front (FE): multi-select PENDING rows on `BookingsTable` + "Confirm selected" + result summary | SPEC-011 | ✅ **DONE** | Fern | TASK-036 |
| TASK-038 | LINE (BE): tap UI — parent/teacher rich menus (**no QR button**) + postback routing + quick-reply/flex; check-in & leave tap-driven | SPEC-012 | ✅ **DONE** (⚠️ don't deploy alone — ships with 039) | Jason | — |
| TASK-039 | LINE (BE): bilingual TH/EN — `line-i18n` layer + per-user `lang` (default TH, seeded) + toggle + EN menu | SPEC-012 | ✅ **DONE** | Jason | TASK-038 |
| TASK-040 | LINE (BE): re-runnable `bun run line:publish-menus` setup command (validates token + 4 images, prints ids) | SPEC-012 | ✅ **DONE** | Jason | — |
| TASK-041 | LINE artwork: 4 rich-menu images → `smart-scheduler-back/assets/line/{parent,teacher}-{th,en}.png`, aligned to the fixed tap bounds | SPEC-012 | ✅ **DONE** | Fern | — |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~🚧 DATA REQUEST — `migrate:bo` failed: which DB is `DATABASE_URL` on?~~ | ✅ **ANSWERED 2026-07-28** (`project-docs/migrate-bo-db-check-2026-07-28.md`) | **Config is CORRECT — my "wrong DB" hypothesis is DISPROVEN.** `DATABASE_URL` → `smart_scheduler` (right shared DB); `public.freelance_budgets` ✅, `bo.item` ✅, **`ops.catalog_items` non-null**. So the shared `smart_scheduler` DB itself carries a **leftover, drifted `ops` schema** (missing `item_group`) — repointing won't help; `opsSchemaPresent()` sees the table and runs the failing pass. **→ The real unblock is TASK-030** (skip/degrade on a drifted `ops`, always run the freelance pass). Stakeholder chose TASK-030 over the `DROP SCHEMA ops` workaround (DROP off the table). |
| ~~🐛 REQ-006 BUG — freelance drawdown not idempotent~~ | ✅ **RESOLVED — TASK-028 DONE (Sober review 2026-07-28)** | Reconcile-to-target invariant shipped: `held` derived from the `bo.movement` ledger, `delta===0` no-op → toggling a booking ATTENDED↔SICK_LEAVE is a no-op (both consuming), leak gone; `remaining` clamped ≤ ceiling. **Verified by Sober: tsc 0 + `bun test` 100/0 + code inspection.** SICK_LEAVE reclassified consuming (flips REQ-004). Double-pay (kept sick-leave + makeup) confirmed **INTENDED** by Porter/คุณฟีน. Ships with the REQ-006 re-deploy. **Non-blocking follow-up:** add a unique index on `bo.movement(item_id, idempotency_key)` in **backoffice-back** to harden idempotency under concurrency (money already safe via the clamp). |
| ~~REQ-001/002 acceptance blockers (auth 403, cap not showing)~~ | ✅ RESOLVED | Both fixed 2026-07-20 (auth deployed; `OPS_API_URL` `/api` typo corrected). REQ-001 + REQ-002 DELIVERED. |
| **Scheduled tasks not yet set up** | Human | 2 jobs to register on the Windows server: end-of-day (:4006 nightly) + month-start (:4010, 1st). **Step-by-step guide written: `smart-scheduler/DEPLOY-scheduled-tasks-windows.md`** (endpoints verified from code). Non-blocking for interactive use. |
| Real numbers (placeholders live) | พี่ฟีน → Porter | Placeholders in use (FL 70k@500, FT 50k, PT 15k, Trial/Single 1,390). พี่ฟีน to give real figures + decide single-session price (program-dependent) + โต๊ด type. |
| repo lint (both FE) | Porter/maint | `bun run lint` broken — `next lint` removed in Next 16. Pre-existing, not from our changes. Small maintenance fix (migrate to ESLint CLI). |
| REQ-003 deploy | Porter → human | Apply scheduling migration `drizzle/0010_teacher_archived.sql` (`ADD COLUMN IF NOT EXISTS`, same `__drizzle_migrations` meta-drift reconcile as ops 0003) + redeploy scheduling-back (:4006) & scheduler-front (:3016). No scheduled tasks/seed needed. Then teacher add/edit/change-type/archive is live. ⚠️ But see "teacher CRUD not standalone" — with the backoffice offline, add/archive 502; sequence the REQ-003 rework before relying on it. |
| REQ-004 deploy | Porter → human | (1) Apply scheduling migration `drizzle/0011_freelance_budgets.sql` (`CREATE TABLE IF NOT EXISTS`; same meta-drift reconcile). (2) Register a **monthly** Windows task → `POST :4006/internal/jobs/month-reset` (`x-internal-secret`=`INTERNAL_JOB_SECRET`, 1st of month) — replaces the ops month-start reset for freelance. (3) Redeploy scheduling-back (:4006) + scheduler-front (:3016). (4) Re-enter the freelance budgets via the frontoffice (placeholder 70k@500). **Pre-deploy:** Jason's month-reset idempotency guard (TASK-019 fast-follow) should land first. Then the freelance limit is fully standalone (works with ops offline). |
| REQ-003 subjects (known limit) | Porter → พี่ฟีน | The teacher Add/Edit form lists **existing** subjects only (union across the roster) — a brand-new program/subject can't be created there yet. Out of REQ-003 scope. If คุณฟีน needs to add new programs via the UI → future small REQ (`GET /subjects` + subjects-admin). Non-blocking. |
| ~~🔴 Teacher archive/activate BROKEN in prod — CONFIRMED 2026-07-28~~ | ✅ **FIXED — TASK-029 DONE (Sober re-review 2026-07-28)**; deploys with REQ-006 | **Root causes CONFIRMED via prod traces (`project-docs/prod-traces-2026-07-28-…md`):** **(1) archive 502** = the deployed **OLD ops-live backoffice** errors on `ops.catalog_items` (`item_group` column missing = `0001_item_pl` migration drift) → 502. **TASK-029 §1 (remove the ops teacher-sync call) fixes it** — verified good (tsc 0, `bun test` 100/0). **(2) availability 500** = a **ROUTING bug**, NOT the mapper: `api.ts:32 .patch("/teachers/:id")` shadows `:75 .patch("/teachers/availability")` → id="availability" → `22P02 invalid uuid` → 500. **TASK-029 §3 (mapper filter) does NOT fix this** → **REWORK:** reorder the literal `/teachers/*` PATCH routes above `/teachers/:id` (same latent bug on `:46 /teachers/type-order`) + add a **route-level** test. §1/§2 stay as built. |
| ⚠️ PROD deploy fact (from traces 2026-07-28) | Porter → human (fold into REQ-006 re-deploy) | Prod currently runs the **OLD ops-live backoffice** (not TASK-027's `/auth`+`/bo` build) **with a migration drift** (`ops.catalog_items.item_group` missing). The REQ-006 re-deploy to the shared-`smart_scheduler` `bo` build makes the failing ops query moot — but the drift explains today's archive-502 and must be noted in the deploy runbook. |
| Teacher type-change money = local no-op (FL→FT/PT keeps a dormant `bo.item`) | Porter → คุณฟีน (possible small follow-up REQ) | Surfaced by Jason during TASK-029: removing `switchTypeOpsTeacher` means a teacher who changes **away from FREELANCE** keeps a dormant freelance `bo.item` ceiling — **no money leak** (`reconcileFreelanceDraw` early-returns on non-FREELANCE) but it may show a stale budget on the DTO. Out of REQ-005 scope. Business Q: should a FL→FT/PT change deactivate the freelance `bo.item`? If yes → tiny follow-up REQ. Non-blocking. |
| REQ-001 deploy gate | Porter → human | Before DELIVERED: (1) apply ops migration `drizzle/0003_even_turbo.sql` in the real env + reconcile the shared `__drizzle_migrations` meta-drift; (2) set up 2 scheduled tasks — end-of-day (**:4006**, INTERNAL_JOB_SECRET) + month-start (**:4010**, X-Service-Token, 1st of month); (3) seed data (DATA REQUEST) — **placeholder numbers PROVIDED** in `project-docs/seed-data-placeholder-2026-07-20.md` (FL budget 70k @ 500/hr, FT 50k, PT 15k, Trial 1,390, Single 1,390 placeholder). Can be typed via admin UI post-deploy or dev-seeded. BE can't apply migrations/DB under brownfield. |
| ⚠️ REQ-006 deploy — **hard ordering** | Porter → human | When REQ-006 ships: **(1)** apply the `bo` migration `backoffice-back/drizzle/0004_bo_schema.sql` (`CREATE SCHEMA/TABLE IF NOT EXISTS`); **(2)** run the **TASK-025 data migration** (`ops.*` + `public.freelance_budgets` → `bo.*`) — **MUST run before/with step 3**, else live freelances have no `bo.item` → not bookable (breaks the live REQ-004 limit); **(3)** deploy TASK-024 scheduling + the rebuilt backoffice (:4010) & backoffice-front (:3018). Then the freelance limit runs off `bo.item` (still atomic, same DB). Ops routes/screens retired in a later cleanup. |
