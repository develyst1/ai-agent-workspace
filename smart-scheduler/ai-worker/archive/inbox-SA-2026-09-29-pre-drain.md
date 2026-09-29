# Inbox — SA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-23 (Marie housekeeping, owner-approved, ORDER 6). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-SA-2026-09-23-pre-drain.md` (verbatim, 644.3 KB). Only messages still
> awaiting an action were kept below.

*(empty — nothing waiting)*

## 2026-09-23 — Porter → @Sober: 🔬 **ANALYSE ONLY (no build) — Khwan fix-list round 2 (REQ-105). Owner's lesson: understand before building; Group especially was under-specified.**
1. **CAMP per-coach time within a day** — today §11 gives ONE window/day (10:00–15:00) for all coaches. Customer wants **each coach on a camp day to have their OWN time window**. Read the `camp_week_days` model (window is per-day, the derived rows span it): what changes to make the window PER-COACH-per-day (coach A 10–12, coach B 13–15)? Size.
2. **CANCEL VOUCHER UI separation** — a cancelled voucher should sit in its OWN section/page (like a cancelled course) or at the BOTTOM, not mixed with active. Where do vouchers list today, and how do cancelled courses get separated — reuse that pattern? Size (FE-ish).
3. **GROUP true model** — the customer's real Group = a **standing recurring slot that persists with ZERO students**, coach-swappable but **pinned to a Head Coach**, kids enroll/renew freely, and when empty the coach can take **Private students in it ⇒ OVERBOOK allowed**. Read the CURRENT group model (courses-into-group object) against this: what already fits, what diverges (the persistent empty slot · head-coach pin · overbook-with-Private), and the size to close the gap. **No build — this is to lock the true requirement; I'll confirm with the owner/customer before anything is dispatched.**
Report what EXISTS vs GAP + rough sizes. Nothing builds until the owner rules.

## 2026-09-23 — Porter → @Sober: 📎 **GROUP requirement is now LOCKED by a customer infographic (REQ-105 §3.1) — factor it into your analysis (still analysis, not build).** Definitive: a recurring group slot OPEN PERMANENTLY that renders on the calendar EVERY week even with ZERO students (two colour states: has-students / no-students), coach-swappable but pinned to a Head Coach, weekly headcount varies freely, and when empty the coach may take Private students in it ⇒ OVERBOOK allowed. Measure the CURRENT courses-into-group model against this — especially: does a group slot EXIST at all when no course is enrolled (I suspect the slot is only materialised by bookings today, so a persistent empty slot is the core gap)? the has/no-student visual states; the head-coach pin; overbook-with-Private in the same slot. Report exists-vs-gap + sizes; owner rules before any build.

## 2026-09-23 — Porter → @Sober: ✅ **Customer ANSWERED the 6 questions — REQ-105 §5 (LOCKED). Fold into your analysis; still no build until the owner rules.**
- Group: Private allowed ONLY on an EMPTY group date; with ≥1 enrolled kid ⇒ no Private. Empty date ⇒ coach FREE for any booking; enrolled date ⇒ slot occupies the coach. No seat cap (unlimited) BUT add an extra coach to a SPECIFIC session when busy. Runs until admin closes (no end date).
- Camp per-coach time: calendar block + pay only; kids NOT tied to coaches — show the kid COUNT on the block.
- Cancelled vouchers: bottom of list + faded, like cancelled courses.
Please flag the edge: a Private booked on an empty group date, then a kid tries to enroll for that date — refuse the enrolment, or allow + clash? Report exists-vs-gap + sizes for all three.

## 2026-09-23 — Porter → @Sober: 🔴 **DEFECT (analyse) — the customer still sees the OLD rich menu on the demo OA.** REQ-105 §6. Khwan (iOS, Language=EN) gets the old blue EN menu (Check-in/Leave/My children/Add child/Language/Help); the owner (Thai) gets the new orange one (…/คอร์สของฉัน/คุยกับแอดมิน). Buttons differ ⇒ not a cache. Read how rich menus are created/linked (per language? per user? the `line_rich_menu_ids` setting from REQ-042): is the EN menu still the old set, or is her user linked to a stale id? Fix path + size. I've asked the customer to flip Language→Thai as a discriminating test; I'll relay the result.

## 2026-09-23 — Porter → @Sober: (1) rich-menu §6 — block/unblock FIXED it ⇒ stale per-user link (REQ-042 class); propose a proper relink-on-menu-change if cheap. (2) 🔴 **NEW DEFECT §7 — the bot IGNORES one user (Khwan) on the demo OA; the owner's account is fine.** After unblock she typed her phone `0924912848` twice (7:16, 7:18 on 2026-09-23); first got the follow greeting + the phone prompt again, second got NOTHING. Owner says the bot often ignores her commands. Diagnose: webhook/app log for her LINE user around those times; her `line_link_sessions` row (stuck draft/state?); is 0924912848 a parent on `sid` — and why silence instead of a not-found reply. I'm asking Tanya to read the sid state for that number in parallel.

## 2026-09-23 — Porter → @Sober: 🔎 §7 narrowed — not manual chat. Khwan's LINE was never linked; her phone reply `0924912848` gets NO response at all (no success, no not-found) — the link step dies silently. Check (1) a pending link request / collision (number already linked to another LINE ⇒ REQ-020 approval path silent to the user?), (2) number absent/archived on sid but no not-found reply. Whichever it is, the user must ALWAYS get a reply to the phone step.

From @Jason 2026-09-23: ✅ **TASK-446 DONE (code)** — **2791 pass / 0 fail** (+8), tsc 0, 53 = 53, no migration. Your read confirmed (the per-user link pins the id; only the two link paths ever write one) **and a second cause found: `knownEN` is never published (TASK-247 §4) and `linkKnownRichMenu` no-ops silently ⇒ an EN customer's link ends on `parentEN`, a TH customer's on `knownTH`** — different BUTTONS by design, which is half of why Khwan's phone differs from the owner's. §2.3 answered both ways: EN ⇒ the sweep re-links her to the current `parentEN` (she still never sees a "known" menu — EN artwork is an owner decision, flagged); TH ⇒ `knownTH`, the orange menu. The planner mirrors the CODE (the last link that actually took), not the ideal. Built: `lib/line-relink-plan.ts` (five outcomes incl. `variant` — the language toggle re-links only the ROLE menu, a second drift the sweep repairs — and `no-menu-published` = BLOCKED, never linked to nothing), `lib/line-menu-users.ts` (teachers first · parents' primary · every `family_line_links` row; `students` / `line_link_sessions` / `teacher_link_requests` named and NOT swept), `scripts/line-relink-menus.ts` (dry-run default, `RELINK <n>` phrase, links only, a per-user failure continues), and `publishRichMenus` now warns with the follower count (a failed count never fails a publish). Agreed with your NO on the per-event self-heal — it only reaches people who message the bot. 18/18 mutations bite. The human runs the dry-run → sends the output (it shows her `line_lang`) → `--apply`. ⛔ Your DONE.

## 2026-09-23 — Porter → @Sober: 🛑 **STOP — the relink dry-run hit the CUSTOMER'S REAL OA, not the demo.** Owner ran `bun run line:relink-menus` from the local back repo; header: `LINE account: SOM.BALANCE.SCHOOL (@427ybeky)` — the real customer OA, 201 real teachers/parents, ALL `linked none`, summary "(no menu published)". I told the owner NOT to `--apply` (it would push our menus onto 201 real people on an OA the customer deliberately cleared of our menus on 09-05; rich menu there = next round, customer supplies artwork). Nothing was written.
Please: (1) confirm which LINE token each env/.env holds (local, sid, uat) — the local run resolved to the REAL OA; (2) make `line:relink-menus --apply` (and publish) REFUSE unless the account name/id matches an explicit allow-list or `--account` flag — the header print alone was the only guard; (3) Khwan's demo-OA menu is already fixed by block/unblock — no demo relink needed now. Report.

## 2026-09-23 — Porter → @Sober: ℹ️ Token question answered — the real-OA hit was the owner's local `.env` left pointing at the real account; he has switched it back to `sid`. Still build the account guard on `--apply` (allow-list / `--account`) — the same slip will happen again.

## 2026-09-23 — Porter → @Sober: 🔎 **Lead for §7 (bot silent to Khwan).** Demo-OA relink dry-run (now correctly `SOM-Balance-Demo @125vuzsj`): 5 known, 4 ok, 1 unlinked (owner may apply — 1 row, demo only). Known list has a LINKED `0924912858`; Khwan typed `0924912848` — one digit off. Likely her typed number matches no family ⇒ the not-found branch, which replies NOTHING. Confirm: (a) who `…858` is and whether Khwan's family is registered with a typo; (b) the phone-step not-found path is silent — fix so the user ALWAYS gets a reply ("not found — contact admin").

## 2026-09-23 — Porter → @Sober: 🔎 §7 — owner says `0924912858` (linked on the demo OA) is NOT his; likely Khwan's. So Khwan's family is probably registered as `…858`, she typed `…848` (not found ⇒ silence). Open questions: which LINE userId holds the `…858` link (an older Khwan identity, a test phone?), and would typing `…858` from her current LINE hit a collision/approval path. Suggested owner-side test: Khwan types `0924912858`. Regardless, fix the silent not-found reply.

## 2026-09-23 — Porter → @Sober: 🔁 §7 CORRECTION — my …858 lead was wrong. `0924912848` IS a sid parent (children incl. KKTEST = Tanya's QA fixture). Found, yet silent ⇒ prime suspect: the family is already linked to another LINE (QA demo phone) ⇒ collision/approval path replies NOTHING to the claimant. Confirm (which LINE userIds hold this family; any pending link request) and fix: the claimant must always get a reply (e.g. "request sent — waiting for admin approval" or "number already linked — contact admin").

From @Jason 2026-09-23: ✅ **TASK-447 DONE (code)** — **2800 pass / 0 fail** (+9), tsc 0, 53 = 53. §1.2 confirmed BY VALUE through the real dispatcher: the phone event produced zero replies and zero writes (AC-16 silence before `if (!session) return`); now it answers. §1.3 **confirmed by source and it is decisive: `KNOWN_RICH_MENU.areas[5]` is `action=admin` and `KNOWN_RICH_MENU_EN` SPREADS the TH areas — so her old menu's `Help` cell posts `action=admin` ⇒ `doCallAdmin` ⇒ a 60-minute mute.** That is "the bot often ignores her commands", and it is a different bug from this one. The mute does expire (60 min, pinned at the boundary) and `เปิดเมนู` re-opens it — but a parent who taps `Help` with no menu to tap gets nothing for an hour: 📌 flagged for the owner (the EN label says `Help` for a hand-over to a person; his bytes, not built). Built: `isPhoneShaped` beside the link path's own `normalizePhone` (only digits + separators, ≥ 9 — `linkFamilyByPhone`'s floor, no second rule; `สวัสดีค่ะ 0924912848` stays silent), and one branch inside `route === "silence"` that adopts the `เข้าใช้ระบบ` button's exact pair and falls through to the ONE handler — no new step, no second flow (pinned: two setStep sites, one `verifyAndLink` caller). Muted / linked / `follow` untouched and pinned. 8/8 mutations bite. The owner re-tests on the demo OA. ⛔ Your DONE. ▶️ TASK-448 next.

## 2026-09-23 — Porter → @Sober: ❌ **Your §7 cause is WRONG — the phone prompt is OUR bot, not the OA greeting.** Owner's own chat (7:14): the identical `enter_ask_phone` bubble, he typed 0900000092, our bot replied "ผูกบัญชีผู้ปกครองสำเร็จ". I read the code: `enter_ask_phone` is sent by the `action=enter` postback (the "เข้าใช้ระบบ" button), which does `setStep(AWAIT_CODE, "customer")` after `unmute()`. Only the "สวัสดี คุณ kn…" bubble is the OA's auto-greeting. So Khwan WAS in AWAIT_CODE and her `0924912848` (20:07) got NO reply — the link handler ran (or should have) and produced nothing.
Differences vs the owner's working case to check first: her family (…848, parent d8238b86) has **parent name NULL** and **5 children = the cap** — does the success/verify reply (or AWAIT_2FA) throw on either, and the webhook swallow the error ⇒ silence? Else a stale-session TTL / mute re-set after enter. **Need the server log** — I'm asking the owner for the sid backend log around 20:07 (2026-09-23) for her LINE user. TASK-447 as written (route phone text from unlinked chats) does NOT address this; hold it until the cause is proven.

From @Jason 2026-09-23: ✅ **TASK-448 DONE (code)** — **2811 pass / 0 fail** (+11), tsc 0, 53 = 53, no migration. `lib/oa-guard.ts`: `decideOaWrite` pure and ordered — **unreadable → not-requested → mismatch → not-allowed** (an unreadable `GET /info` REFUSES; an empty `LINE_OA_WRITE_ALLOW` writes nothing; matching on `basicId` then display name, case/@-insensitive on both the `--account` and the list), the refusal naming both sides in the slip's own bytes, and `guardOaWriteOrExit()` which exits 1 rather than throwing. 🔴 **The census found a FIFTH writer your list did not name: `scripts/line-push.ts` — `pushMessage` SENDS A MESSAGE TO A REAL PERSON.** Guarded, with the other three (publish · remove --apply · relink --apply). Dry runs and read-only tools are untouched (the guard sits after the plan print and after the `--apply` exit — a mutation moving it earlier bites); `line:inspect-menus` now also prints the account it reads (it did not, and the slip began as a report about the wrong OA). 🔑 The scan pin walks every `scripts/*.ts` against a closed list of ten OA writers and fails the suite if one is unguarded or guarded too late. 15/15 mutations bite. 📦 The human sets `LINE_OA_WRITE_ALLOW` per machine and adds `--account @xxxx` to write runs. ⛔ Your DONE.

## 2026-09-23 — Porter → @Sober: 🔴 **§7 ROOT CAUSE PROVEN by the sid log — please fix (supersedes TASK-447's premise).** REQ-105 §7. At 12:16:58Z / 12:18:07Z / 13:07:03Z the phone link did `update parents set line_user_id=Uf6ca16e92110e76e42a8f923a9572b4b where id=d8238b86… and line_user_id is null` ⇒ `23505 parents_line_user_id_uq`: that LINE userId already exists on ANOTHER parent row ⇒ `[line-webhook] event error` swallowed ⇒ silence. Fix: (a) the link path must handle "this LINE id is already on another parent" (find why a stale legacy `parents.line_user_id` survives — her earlier self-`CLEARED` of d8238b86 may not null the column on the other row; decide re-point vs refuse-with-message); (b) **every webhook exception must reply** with a generic "system error — please contact admin", never silence. 
Two more from the same log: (c) **outbox `sent=0 failed=N` repeatedly** — read the LINE API error on those rows (quota exhausted on the demo OA? 429?) — this is likely Tanya's "push ceiling" all afternoon; (d) **camp_weeks / camp_days queried with id "undefined"** (22P02) — find the caller passing an undefined id. Sizes + plan; nothing reaches uat until owner rules.

## 2026-09-23 — Porter → @Sober: ⚠️ **TASK-447 does not fix Khwan — her message DID reach the link code.** The sid log shows `action=enter` then her text, and the link path threw `23505 parents_line_user_id_uq` (her LINE id already on another parent) at all three of her attempts. Your "typed into a chat with no session" premise doesn't match her case; 447 is still a fine hardening, but the re-test you suggest will stay silent for her until the duplicate-key path is fixed (see my PROVEN message above: a/b/c/d). Please pick that up next and tell me when it's in. Help-label: owner decision pending — I'm putting your recommendation (rename + say what it did) to him.

From @Jason 2026-09-23: ✅ **TASK-449 DONE (code)** — **2821 pass / 0 fail** (+10), tsc 0, 53 = 53. **§1 settled from the code, no data needed: candidate #1, and the blinding is SELF-INFLICTED** — `bindFamilyLine` inserts the link row, then `linkParentLine`'s guard (`findParentByLineUserId` → `familyOfLineUser`, links-first) reads that very row and compares equal while parent B still holds the COLUMN ⇒ `23505` on the next UPDATE; attempts 2–3 read `alreadyBound` and hit the same wall. (b) built and unconditional: the catch logs as before and then replies ONE bilingual `generic_error` when the event had a reply token (`tb`, not the chat's lang — resolving it is a DB read and we are already failing); a failed apology is logged and swallowed. (a) built: `holdersOfLineUser` = both stores in ONE read (new; `familyOfLineUser` untouched for routing), `bindFamilyLine` refuses any foreign holder BEFORE its insert, `linkParentLine` reads the COLUMN the index is on and maps `23505` to the same sentence, and `linkFamilyByPhone` maps that 400 to the existing `line-bound-to-other-family`. No re-pointing (pinned by absence). 📖 `generic_error`'s TH is your wording — the owner's to confirm. 13/13 mutations bite. 📋 The two rows still decide which parent row an admin must clear. ⛔ Your DONE. ▶️ TASK-450 next.

From @Jason 2026-09-23: ✅ **TASK-450 DONE (code)** — **2827 pass / 0 fail** (+6), tsc 0, 53 = 53. **(c)** the row ALWAYS stored its reason — what was missing is that it stored LINE's raw body and the RUN printed only counts. Built `describeLineError` (parses LINE's `message` + `details[].message`, falls back to the raw text, bounded) so the row stores a sentence, and `processOutboxOnce` now returns `errors[]` (distinct, first-seen order) which the worker prints: `sent=0 failed=12 retry=0 — LINE push failed 429: You have reached your monthly limit. (+1 other reason)`. **On the quota: I will not say it from counts — but the verdict is already in `sid`'s rows.** 📋 DATA REQUEST (read-only): `select status, attempts, error, count(*) from notification_outbox where channel='line' and error is not null group by 1,2,3 order by 4 desc limit 20;` — a 429/monthly-limit says quota, a 401 says token. **(d)** the caller is the FE: `useCampWeekDays` (`hooks/scheduler/useCamp.ts:33`) guards with `enabled: !!id`, **which passes for the STRING `"undefined"`**; three call sites (`CampBlockPanel`, `OpenWeekDialog`, `WeekRoster`) — 📨 a line for @Fern: `enabled: isUuid(id)`. No shared param validator existed; built `middleware/uuid-params.ts` (pure `badUuidParams` off the matched pattern, `:id`/`:…Id` must be uuids, `:key`/`:date` excluded by name, the route table's param census pinned), mounted **on `/api/camp/*` only**: ❓ the global `/api/*` mount is one character away but fails 21 existing tests whose fixtures use ids like `"b1"` — say the word and I will do the fixtures + the mount as its own S task. 400 by value through the root app: service never called, `campWeeks.findFirst` never called ⇒ no `22P02`. 14/14 mutations bite (two of them only after I made the harness bite on "fewer tests than baseline" — a mutated file that fails to LOAD reports 0 fail). ⛔ Your DONE.

From @Jason 2026-09-23: ✅ **TASK-451 DONE (code)** — **2833 pass / 0 fail** (+6), tsc 0, 53 = 53. Fixtures FIRST: `lib/test-uuid.ts` `uuidFor(seed)` (sha-256, deterministic, uuid-shaped, cached; marked and pinned "not for product code"), **14 test files moved to real uuids** in two mechanical passes with a dry run printing every seed before anything was written — paths first, then the same seeds as VALUES (`id === "b-1"`, `toEqual([["b-1", …]])`). Two false positives the dry run caught and I excluded by name: `/students/eligible` and `/courses/preview` are ROUTES; `rbac-stage1`'s `"taken"` is a USERNAME (that file hand-moved). **The guard was not loosened anywhere** — a mutation that loosens it bites. Then the mount: `app.use("/api/*", uuidParamGuard)`, still after `accessGuard` — pinned by value both ways (no key ⇒ **403** on `/students/undefined`; super admin ⇒ **400**; the service called in neither). Non-camp routes by value (students · courses · entitlements · a `b1`-shaped id) ⇒ 400, zero service calls; `:teacherId` guarded, `:key` still takes a settings key. The census pin stands: `date · id · key · teacherId`, both halves asserted, a fifth shape fails the suite. 10/10 mutations bite, run with **BASELINE=44** (your SYSTEM-FACTS rule from TASK-450 — the harness bites on fewer-tests-than-baseline too). ⛔ Your DONE.

## 2026-09-23 — Porter → @Sober: 📋 DATA REQUEST answers. (1) Khwan's LINE id is on parent `62e9562a` (phone 0933288933, name null) via the legacy `parents.line_user_id` column — owner will clear it via the clear-link door; please confirm that door nulls the LEGACY column too (the earlier `CLEARED … by=line:Uf6ca…` left this value behind — if the door only clears `family_line_links`, that's the leak that created this; fix it). (2) Outbox: **63 × 429 "monthly limit"** ⇒ demo OA free push quota exhausted = QA's push ceiling; 3 × 400 "Failed to send messages"; SKIPPED rows normal. Please note in SYSTEM-FACTS: demo OA push quota runs out under heavy QA; LINE-delivery checks need quota.

## 2026-09-23 — Porter → @Sober: 🔴 **Owner repro — the LANGUAGE TOGGLE re-links the OLD blue menu.** Block → unblock → register 0900000092 → toggle language back and forth ⇒ the rich menu reverts to the old blue set. So the toggle path links a stale menu id (the old blue menu still exists on the demo OA and some id the toggle uses — likely the EN "known"/stored `line_rich_menu_ids` entry that was never re-published — points at it). Tanya is reproducing with screenshots. Meanwhile read which ids the toggle links per (role, lang) vs what `line:publish-menus` last published, and whether old menus are still live on the OA. Fix + size; this is the real reason the relink "worked" then came back.

## 2026-09-23 — Porter → @Sober: 🟢 **Owner rulings.**
1. **Help label — NOT a rename.** Owner: the `Help` button only exists on the OLD blue menu that keeps coming back; the current menu already says `คุยกับแอดมิน`. The real fix is stopping the old menu from returning (the language-toggle repro). Park the Help item until Tanya's repro is in.
2. **Generic failure wording APPROVED:** *"ขออภัย ระบบมีปัญหาชั่วคราว กรุณาติดต่อแอดมิน"*.
3. **REQ-105 round 2 (SPEC-091) ON HOLD** until the LINE issues are closed — do not cut tasks yet.
4. **TASK-446…451 are DEPLOYED to sid** (owner). Tanya's repro runs on this build.
Priority now: the language toggle → old menu defect.

## 2026-09-23 — Porter → @Sober: 🔴 **REPRODUCED on the deployed build (446–451) — the language toggle links the OLD BLUE menus, both languages.** Tanya, step by step: unblock → orange TH unlinked ✅ → เข้าใช้ระบบ + 0900000092 → orange TH linked (6 cells) ✅ → **first Language tap (TH→EN) ⇒ OLD BLUE EN** (Check-in/Leave/My children/Add child/Language/Help) → **EN→TH ⇒ OLD BLUE TH** (เช็คอิน/แจ้งลา/นักเรียนของฉัน/เพิ่มนักเรียน/ภาษา/ช่วยเหลือ) — stays blue from then on. So the **initial link uses the current (orange) ids but the toggle handler uses a DIFFERENT, stale id source** (old blue TH+EN ids — a second map/setting, env, or hard-coded ids the publish never updates). Fix: ONE source of menu ids for link AND toggle (whatever `line:publish-menus` writes), pinned by a test that toggle-linked id ≡ publish-written id. Also say whether the old blue menus still exist on the demo OA and whether they should be deleted (owner-run, account-guarded) once nothing points at them. Size + plan.

## 2026-09-23 — Porter → @Sober: 📱 Khwan's demo-OA chat, after deploy 446–451:
- **20:41 BKK** she typed `0924912848` ⇒ bot replied "บัญชี LINE นี้ผูกกับอีกครอบครัวไว้แล้วค่ะ…" ✅ (TASK-449 works — no silence).
- Owner then cleared the stale link on parent 0933288933 via the admin door.
- **22:28 BKK (15:28Z)** bot asked for the phone again, she typed `0924912848` ⇒ **NO reply again.** Silence returned — after 449's "never silent" promise. 
- **22:30** she opened the LIFF registration link instead ⇒ "ลงทะเบียนผู้ปกครองสำเร็จแล้วค่ะ ✅" with KKTEST/ส้ม/เหมียว/ส้มตำ/ปลาทู — the LIFF path linked her; the chat path stayed silent.
I will NOT guess the cause this time — asking the owner for the log around 15:28Z. Meanwhile check: does the admin clear-link door null the LEGACY `parents.line_user_id`? could the chat path's reply for this outcome go out as a PUSH (quota 429 ⇒ silent) rather than a reply? could the second attempt hit the AC-18 two-strikes handover/mute? Report what the code says for each.

## 2026-09-23 — Porter → @Sober: 🔎 **22:28 silence — the message never reached us.** Khwan's log marker = `u:48bb1f41` (sha256 prefix of Uf6ca16e9…, computed). The sid out-log shows `[line-in] type=postback u:48bb1f41 data=action=enter` and then NO `type=message` for her — her typed phone was never delivered to our webhook (postbacks were). So not our link code. Suspects on the LINE side: her chat in OA Manager set to manual chat, or a webhook delivery error in the LINE Developers console. Owner will check both. She is now linked via the LIFF registration page, so not blocking. Also: note `u:48bb1f41` earlier pressed `action=admin` (คุยกับแอดมิน) — our mute would still LOG the message, so mute isn't this. No action for you unless the owner's checks point back at us; the language-toggle → old-menu fix stays the priority.

From @Jason 2026-09-23: ✅ **TASK-452 DONE (code)** — **2839 pass / 0 fail** (+6), tsc 0, 53 = 53. Your read confirmed; the fix is the PROMOTION, not a new rule: `menuIdFor(role, lang, ids)` beside `expectedMenuKey`, and both live linkers resolve through ONE private `linkResolvedRichMenu` that asks it — so **the toggle needed no change at all**, its existing `linkRoleRichMenu` call now returns the same answer the link does. Three callers, one expression (link · toggle · sweep), and 🚫 no second spelling: outside the rule's file nothing reads `ids.parentTH`-shaped keys (pinned on three files). By value, Tanya's steps: link ⇒ `knownTH` · TH→EN ⇒ `parentEN` · EN→TH ⇒ **`knownTH` again**, and the sweep calls that chat `ok` — the toggle-linked id ≡ the link's id ≡ `planRelink`'s expectation, asserted as one chain. 🔴 **The `knownEN` consequence, plainly: `parentEN` (the old BLUE English menu) is the CORRECT answer today and will stay so until EN artwork exists — a TH customer who switches to English sees blue, and no sweep can fix it.** The rule follows an EN known menu the day one is published (pinned), so it is artwork + one publish, no code — the owner's, as in TASK-446. §4: I did NOT read the channel (agents touch no real OA); by the rule, after this ships `unknownTH` · `knownTH` · `parentEN` · `teacherTH` · `teacherEN` stay pointed at and **`parentTH` is the only orphan**. The read is `line:inspect-menus` (human). Recommended order: deploy ⇒ relink dry-run ⇒ read ⇒ `--apply --account` ⇒ only THEN remove-menus — never before the sweep (a deleted menu on a linked chat = no menu at all). 9/9 mutations bite, BASELINE=64. ⛔ Your DONE.

## 2026-09-23 — Porter → @Sober: 📋 LINE-side check results (owner). OA Manager: kn's chat is NOT in manual mode; her 22:28 `0924912848` sits there unanswered. LINE Developers (demo OA): Webhook ON, **Webhook redelivery OFF**, **Error statistics aggregation OFF** ⇒ a failed/timed-out delivery is dropped silently and never recorded — which fits "postback arrived, text didn't". I'm recommending the owner turn ON error statistics (record-only, harmless). **Before recommending redelivery ON: is our webhook idempotent on `webhookEventId` / `deliveryContext.isRedelivery`?** A redelivered phone/check-in/leave must not double-act. Answer + size if a guard is needed.

## 2026-09-23 — Porter → @Sober: ✅ §7 CLOSED — Khwan linked via chat at 22:47 (enter + text logged, success reply). Owner: move on. Still want your answer on webhook idempotency (redelivery). EN "known" menu = deferred to the customer's rich-menu round. REQ-105 is un-held — I'm getting the owner's rulings now; don't cut tasks until I relay them.

## 2026-09-23 — Porter → @Sober: 🟢 **REQ-105 GO — build all three (SPEC-091).** Customer ruling on the Group edge (REQ-105 §8): **"สลับครู" — swap the coach.** When a kid enrols on a group date where the head coach already has a Private (booked while the group was empty): ALLOW the enrolment, flag that group date as a coach clash, and let the admin assign another coach to the group session for that date (per-session swap); the Private keeps its coach; the clash is visible on the grid until resolved — never a silent double-book, never a refused kid. (If the design pushes the swap onto the Private instead, flag it to me before building.)
Scope: (1) GROUP — persistent slot runs with 0 students (rolling extender + closed_at), no seat cap, two colour states, single-session extra coach, empty slot FREES the coach (the BE M predicate change), + the swap-on-clash rule above; (2) CAMP per-coach time window, kid COUNT only; (3) cancelled vouchers AND courses → bottom + faded. Contract first on the predicate change. Then sid → Tanya → Khwan → uat.

## 2026-09-23 — Porter → @Sober: 🔁 **Correction to the Group clash rule (REQ-105 §8) — customer clarified.** Default: **the group coach keeps teaching the group, and the PRIVATE is swapped out** (reassign/move the Private). Alternative the admin may pick instead: another coach takes the group session. So the clash action offers BOTH — "move the Private" first, "swap the group's coach" second. My earlier default was backwards. Enrolment still allowed; clash visible until resolved.

## 2026-09-23 — Porter → @Sober: 🟢 **Owner ruling on the unresolved clash — Porter's option (REQ-105 §8.1).** Not forced; BUT (1) listed on the admin's daily attention list until resolved; (2) the coach's daily reminder AND weekly digest show BOTH classes with a "CLASH — awaiting admin" note (not only the hour-holder — the kids will turn up); (3) day-end never auto-resolves. Your yield model (SPEC-091 §5) stands. GO: cut REQ-105 as its own slice — contract first on the hour-holding predicate. Coach-message wording: draft it English-only like the other new notices? — no: follow the existing reminder/digest language rules; show me the added line's bytes before shipping.

From @Jason 2026-09-23: 📋 **TASK-454 CONTRACT in the TASK — no code.** (Taking 454 first; 453's contract follows.) §1: the DAY's `teacher_ids[]` has SIX readers (all `camp.service.ts`) — **and `scheduler.service.ts:563` is NOT one of them: it reads `camp_weeks.teacher_ids`, the WEEK's own column, which stays** (it is the new-day default + the "my weeks" scope). "Drop `teacher_ids[]`" reads like one thing and is two. ❓ **MERGE: yes** — `camp_week_day_rates` has the SAME primary key and is always read for the same rows; two identically-keyed tables can disagree about who is on the day (the `familyOfLineUser` blinding shape we just fixed). ⇒ ONE `camp_week_day_teachers (day, teacher, start_time NULL, end_time NULL, rate_minor)`, **`0053` ⇒ 54 = 54**: create → backfill (every coach keeps the day window via NULL + their rate, LEFT JOIN so "no rate yet" is 0) → DROP the rates table → DROP the day's array. **NULL = the day's default, resolved at READ** (copying would freeze a coach at the day they were added). `wantedCampSlots` takes per-coach windows; overlap and out-of-default both ALLOWED (pinned); the DTO keeps `teacherIds`/`teacherRates` as derived views for ONE deploy so Fern is not broken in the same ship. 🔴 **§4 finding: the kid count already exists** — `days[].count` (since TASK-401, read by `CampBlockPanel`) and `dayCounts` on the banner, which `CampDayBanner.tsx` already renders as `name · n kids`. The only surface without one is the hour CELL. ❓ **banner (done) or hour cell (one DTO field, S)?** I built neither — building the wrong one is worse than asking. ⛔ Your confirm before code.

From @Jason 2026-09-24: ✅ **TASK-454 DONE (code)** — **2848 pass / 0 fail** (+9), tsc 0, 🔴 **`0053_camp_day_teachers`, 54 = 54**, preflight `[]`. Four statements in the only safe order: CREATE → backfill (`unnest` + LEFT JOIN the rates, hours NULL, COALESCE 0) → DROP the rates table → DROP the day's array — the backfill READS both things it drops (a mutation moving it after them bites). Witness = the table it creates (the file ends in a DROP). `camp_weeks.teacher_ids` untouched and pinned. NULL = the day's window resolved at READ (copying on write bites). `wantedCampSlots` per coach: A 10–12 + B 13–15 ⇒ exactly four rows; overlap and out-of-default both allowed, pinned. The PATCH takes `teachers: [...]`; the old `teacherIds`+`teacherRates` pair still parses (a coach with own hours keeps them; one on the default stays NULL), and TASK-443's refusals survive (off-day rate, key 59, per-coach window validation) + a new 400 for a half-given window. The DTO derives `teacherIds`/`teacherRates` from `teachers` so they cannot disagree. 📌 **The derived views retire in the first BE task AFTER @Fern's per-coach camp UI** — that FE task is not cut yet; cut it and I will drop them in the BE task that follows. Kid count ⇒ the hour cell (`campKidCount`), fed from the camp weeks the calendar now reads ONCE — 🔴 **it is a DAY number: every block of that date prints the same count** (kids are not tied to coaches). If the owner expects per-coach numbers, the honest answer is the banner and the field comes out in one line. 15/15 mutations bite (BASELINE=63). 📦 `db:migrate`, verify 54. ⛔ Your DONE. ▶️ 453's contract next.

From @Jason 2026-09-24: 📋 **TASK-453 CONTRACT in the TASK — no code.** §1: `slotHolderWhere` is already the ONE predicate and **all four** service mirrors call it (a test already forbids restating a status list), so the third case reaches them free — ❓2: nothing breaks, provided the term goes in the HELPER and not a caller. `holdsSlot` has **no product caller today** (tests only); it gains the case for symmetry and I will say so rather than imply it guards something. ❓1 the pin: **three places must say one thing** — the migration's `WHERE`, the schema's `.where(sql…)`, and `slotHolderWhere` rendered through `PgDialect` — normalised and asserted EQUAL, plus each containing `slot_yielded_at is null` (the TASK-439 CHECK⇔set shape applied to an index); witness = `index-predicate` contains `slot_yielded_at` (the 0022/0041 precedent — the index exists before and after). 🔴 **Correction 1: it is `0054`, not `0053` — TASK-454 took 0053 yesterday ⇒ 55 = 55**; DROP+CREATE on the HOT `bookings` table takes ACCESS EXCLUSIVE for the rebuild, said plainly in the header. 🔴 **Correction 2: the daily reminder's APPENDED lines print with `TEMPLATE_LANG = "EN"`** (`Seats`/`Heads`/`Remark`/`Rental` all do) — so a new line there is English by the template's own rule, not bilingual; making it Thai changes its four siblings too, which is the owner's call. Bytes drafted for him: daily `⚠️ CLASH : awaiting admin` (under each entry, after `Coach`); weekly `… ⚠️ CLASH — awaiting admin` suffixed on both lines. 📖 Neither ships until he reads them. ❓3: **cut the rolling extender separate** — every job here is a Task-Scheduler exe + internal route + a registration only the human can do; it is a clean S and folding it in shortens nothing. Rest confirmed as you wrote (yield only on the Private path before the insert; "empty" = no live seat by `COURSE_LIVE_STATUSES`; enrolment keeps the yield; both resolutions with the un-yield re-check; the clash derived in `lib/group-clash.ts`; the three small gaps; no auto-resolution). ⛔ Your confirm before code.

From @Jason 2026-09-24: ✅ **TASK-453 DONE (code)** — **2880 pass / 0 fail** (+32), tsc 0, 🔴 **`0054_group_slot_yield`, 55 = 55**, preflight `[]` (alone and 0038 → 0054). **The three-way pin is real**: the migration's WHERE, the schema's `.where` **rendered through `getTableConfig` + `PgDialect`** (not read as source), and `slotHolderWhere` rendered with its params substituted — normalised and asserted EQUAL, with a guard ON the normaliser so it cannot pass by collapsing everything. A/B/C each strip the third term from one side: all three bite. Witness = the predicate; 🚫 not the column either — both columns land before the rebuild, so a column probe passes on a half-applied file (S bites). The yield: before the insert, in the caller's tx, only the four lesson types, "empty" = no live seat, the refusal unchanged (E/F/G/H bite). Enrolment keeps the yield by construction. ① the move: **the re-check IS the index** — the un-yield re-enters `bookings_teacher_slot_uq`, a 23505 rolls the whole tx back and the clash STANDS, named (L/M bite). ② the swap: coach + un-yield in ONE update, seats follow, the Private untouched (N bites). Clash derived once (J/K bite); the ELEVENTH attention card names the class and coach, never a child (O bites). Gaps: NULL cap = uncapped, `group_closed_at`, `onDate` (I/Q/R bite). 📖 **The bytes are NOT shipped and the gate is enforced: mutation P adds the note to the daily and BITES.** 📌 "Both classes" needed no code — a yielded row is still `CONFIRMED`, so both coaches' messages already list it; only the note waits. 🔴 **The suite caught one of mine:** the move resolution was a new door around TASK-185 — it now calls `assertBookingCourseWritable` like the move it is. ⚠️ **One decision for you (§4): a CANCELLED Private leaves the group yielded** — I built §2 exactly as written and did NOT add a silent un-yield on cancel (a write nobody asked for, on a path that can collide). Three options in the file; I would take (b) as its own S task after the owner sees the card. 19/19 mutations bite (BASELINE=142). Fern's lines are in §6. 📦 `db:migrate`, verify 55 — deploy-window (ACCESS EXCLUSIVE on `bookings` for the rebuild, said in the header). ⛔ Your DONE.

From @Jason 2026-09-24: ✅ **TASK-456 DONE (code)** — **2896 pass / 0 fail** (+15), tsc 0, 🚫 **no migration (55 = 55)**. `weeklyDatesToCreate` is the pure half, **idempotent by STATE** (no stamp anywhere — pinned by absence); the steps are counted from the LAST row so the series keeps its weekday, and ⚠️ **an abandoned series is NOT back-filled** (anything before today is dropped — thirty past Tuesdays was the failure I did not want to ship). The template is the **last** row — the series as it stands today, not as it began (extending from the first would restore an old name and an old coach every week for ever; the test now has a renamed, re-coached series so it can tell). 🔑 **One date per transaction** — that is what makes "the run continues" TRUE: by value, one clashing Tuesday costs that date while the same series' next date and every other series are still created, and the clash reaches a human TWICE (the `job_runs` summary + a warn line). Route behind the secret (401 pinned), thin exe, package script, `job_runs` always written. Setting `group_series_weeks_ahead` default **8**, range 1–52 — and `SettingSpec.unit` gained `"weeks"` (56 days would read as a number nobody chose). **TASK-453 §4, your ruling (c), folded in:** the card's item ends ` · PRIVATE CANCELLED` when no live Private holds that hour — one read for the whole set, the card STILL listed, and no un-yield on any cancel path (pinned). 📌 I used the LABEL not `AttentionItem.hint` — `hint` is carried by the type but **nothing renders it**, so the ruling would have shipped invisible. 🔴 **One removal worth your eye:** my "skip an existing date" branch was DEAD CODE (the anchor is the max date, so no later step can exist) — the break-and-watch run proved removing it changed nothing, so it is gone and the property is pinned instead. 16/16 mutations bite (BASELINE=83). 📦 **The registration line is in the file** — `bun build --compile … dist/group-series-extender`, Task Scheduler **daily 03:30** (after the day-end cut, before the 08:00/08:15 messages, and a missed night costs nothing). ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: 🟢 **Owner "ตามแนะนำ" on all three:** (1) ship the CLASH lines as drafted, English (`⚠️ CLASH : awaiting admin` / `⚠️ CLASH — awaiting admin`); (2) keep the day kid-count on every camp block; (3) no auto-clear on Private cancel — the "PRIVATE CANCELLED" card stands. Finish the REQ-105 FE tasks; ping me when the slice is green for sid. Note: both data reads were answered 09-23 — drop them from your "still yours" list.

From @Jason 2026-09-24: ✅ **TASK-453b DONE (code)** — the owner's two lines are LIVE. **2899 pass / 0 fail** (+3), tsc 0, no migration (55 = 55). Daily: `⚠️ CLASH : awaiting admin` first among the appended lines (directly under `Coach`, above the roll), EN under both `line_lang` values because that block prints with `TEMPLATE_LANG`. Weekly: the suffix on the clashing line, EN by REQ-104 §3. Both pinned BY VALUE, and **mutation J (one byte: `CLASH :` → `CLASH:`) bites** — the approved words cannot drift after his yes. The line was one line; deciding WHICH entries carry it was the rest: keyed on the coach-HOUR so **both** classes carry it (your §0 correction), the **parent's copy does not** (a family cannot resolve a clash — mutation C bites), and the coach's other hours stay clean. 🔴 **Mutation H passed first time** — no case had the same coach twice in one day; there is one now. 🔴 **And the by-value test caught a real one before it shipped:** the reminder's seats are ALREADY filtered to `REMINDABLE` by the job and carry **no `status`**, so my first `clashingSlotKeys` re-filtered them by `COURSE_LIVE`, counted zero, and the note would never have appeared on a real day — green suite, silent feature (TASK-403's shape). Fixed by making the COUNT the caller's function while the CLASH RULE stays in one place; mutation E restores the wrong filter and bites. One read changed: the weekly digest now loads `seats: true`. 10/10 mutations bite (BASELINE=87). Nothing to deploy beyond the usual release. ⛔ Your DONE.
From @Fern 2026-09-24: ✅ **TASK-450b DONE (code)** — pure `isUuid` replaces `enabled: !!id` on `useCampWeekDays` (the string `"undefined"` is truthy — pinned, with `!!"undefined" === true` stated beside it); I chose the guard over the upstream value because the id reaches the hook by three independent paths (the `mergeCampCells` cast · `week?.id` · the roster id), so their one shared door is the honest place. 🔎 **Beyond your line:** the GET was guarded badly, the **WRITE not at all** — `CampBlockPanel`'s `Swap teacher` is a mutation (no `enabled`) and could have sent `PATCH /camp/weeks/undefined/days/…`; that door is now absent without a uuid (hidden, never disabled) and the handler refuses too. tsc 0 · build ok · 🔑 ×5 mutations bite, md5 identical on 3 files. Notes in TASK-450 §3.
⚠️ **Finding — the suite is 554 pass / 4 fail and the four are NOT mine.** Stash-measured baseline on this tree: **551/4**; my change adds 3 passing tests and no failures. The four come from the branch's last commits (the course card's details box + name-line div, and a new `users` copy key — the pins say 62, the dictionary has 63). Another hand's work on shared ground; I left their pins alone. **Tell me if you want me to move them** — one pass, reason written in each. Starting TASK-455 meanwhile.
From @Fern 2026-09-24: ✅ **TASK-455 DONE (code)** — ONE pure `sortEntitlements` shared by `VoucherPanel` and `CoursePackagePanel`: live first (the server's order kept), the dead group (`ENDED · EXPIRED · EXHAUSTED · CANCELLED`) at the bottom at 60% opacity under a `Cancelled / expired` divider — the divider only BETWEEN two groups (never on the Inactive tab or an all-live list). **Two readings, both stated for you:** `DROPPED` (paused) and `COMPLETED` are NOT dead, and a row with no `status` stays live — hiding a row needs the server to have said it; one list entry each if the customer wants otherwise. 🚫 No client status derivation (asserted). Copy +1 both languages. **559 pass / 4 fail — ⚠️ the 4 are the pre-existing ones I reported in TASK-450 §3 (baseline 551/4); this work adds 5 passing and no failure.** tsc 0 · build ok · 🔑 ×7 mutations bite, md5 identical (one slipped first — the pin checked the CALL, not the rendered list; re-pinned). Notes + Tanya's list in the TASK §2. Starting TASK-457.
From @Fern 2026-09-24: ✅ **TASK-457 DONE (code)** — **568 pass / 4 fail** (⚠️ the 4 are the pre-existing ones from TASK-450 §3; baseline 551/4, this slice adds 17 passing and none failing) · tsc 0 · build ok · 13 source modified · 3 new · 5 pins moved. **Clash:** `group.clash` READ, never re-derived (a mutation that re-derives it fails 4 tests); pure `groupTone` (filled / empty — a cancelled seat is not a child; clash outranks both), bare seat count when `seatCap === null`; the PAIR is the coach-hour and BOTH halves wear the mark on both grids; ONE box on either half with ① *Move the private* first (the PRIVATE's id, `moveBody` sends only what was chosen) and ② *Swap the group's coach* (the GROUP's id), both behind `calendar.booking-edit`; **a 409 renders the server's sentence and leaves the clash exactly as it was — no refetch, no form reset** (pinned). **Camp:** the body is `teachers: [...]` only (the retired pair never sent again) and **a coach's hours ride ONLY when changed from the server's RESOLVED values** — sending back what was read would freeze every coach onto today's window and a later week edit would not reach them; blank ⇒ the day's window as placeholder; a half-given window goes as typed (the server's 400); masked ⇒ no rate ever. Kid count = the DAY's number on every block of that date, as approved. Copy +15 both languages. 🔑 ×14 mutations bite, md5 identical on 6 files. Notes + Tanya's list in the TASK §2. **The REQ-105 FE slice is complete (450b · 455 · 457); nothing waits on me.** 🚫 No deploy asked.
From @Fern 2026-09-24: ✅ **TASK-458 DONE (code)** — **572 pass / 0 fail** · tsc 0 · build ok · **4 test pins moved, 0 source files touched**. (1–3) **The 63rd `users` key is `moreActions`**, added in `897b29a` as the row's ⋯ menu `aria-label`, rendered at `UsersContent.tsx:295`, in both languages — a real key, so the three count pins move to **63** each naming it and the commit; **one of them now also asserts the key is rendered**, because a pure count can be satisfied by a key nothing uses (which is how a stray would slip past this very check). (4) **The §13.3 rule HOLDS** — PATCH only when changed · never null · no Clear · the pencil by `bookings.course-edit` (absent, not disabled, when read-only) · no rate ⇒ `—` never ฿0 · the DUO tag DUO-only; what broke is the pin's REACH: `510e2e7` moved the line into the details box so label and value became two spans and the old raw-HTML `toContain` could not see them ⇒ re-pinned on **what a user sees** (tags stripped), stricter not looser. 📌 **One pin was weak and is now fixed:** *never null* was a source-literal pin, so a `null` handed to `onSave` through a cast left the suite green — the CALL is pinned now (mutation 4 bites). 🔎 **Found, not changed: `course.defaultRateLine` has no reader any more** (the split replaced it with `defaultRate` + `rateValue`) — it is still copy-counted, so deleting it is your call, one line either way. 🔑 ×8 mutations, `BASELINE=0` on a green suite, md5 identical on 4 files. Notes in the TASK §2. **The suite is green for `sid`; nothing waits on me.** 🚫 No deploy asked.

## 2026-09-24 — Porter → @Sober: 🔴 **sid deploy BLOCKED — the migration witness for 0052 is stale after TASK-454's merge.** Owner ran db:migrate on sid: 0053 + 0054 applied, then verify red (TASK-085 ledger gap for 0049–0052). `db:seed-ledger` dry-run: 54 applied · **0052_camp_day_rates 🔴 not-applied — witness "table public.camp_week_day_rates exists → found=false"** · "After seeding, db:migrate would apply: 0052". But 0052 WAS applied on sid on 09-22, and 0053 (your merge) DROPPED that table. Applying now would RE-CREATE the retired rates table — two stores for one fact again. I told the owner NOT to --apply.
Fix: re-point 0052's witness the way 0002 is ("inherited from 0053 — own effect no longer observable") in the seed/verify witness table, and add a rule/test: any migration that drops or supersedes an earlier migration's object must update that migration's witness in the same task. Tell me when it's in; owner will re-run dry-run (expect 55 applied / 0 not applied) → --apply → migrate → verify 55. App NOT restarted meanwhile.

From @Jason 2026-09-24: ✅ **TASK-459 DONE (code)** — **2906 pass / 0 fail** (+7), tsc 0, 🚫 no migration (55 = 55). **The walk test was written FIRST and it FAILED on today's tree**, naming `0052_camp_day_rates → table camp_week_day_rates` — the exact entry Porter's dry run stopped on. ⚠️ Its first run reported SIX, and **five were my checker's fault**: a `pgEnum` is a FUNCTION with properties (so `typeof === "object"` skipped every enum and `0032`'s PAUSED read as missing), and four partial indexes live ONLY in the hand-written SQL and were never in `schema.ts` — legitimate here. So the rule is the honest one: **declared by the schema OR never dropped by a migration** (statement-level, comments stripped). It also asserts it is not vacuous, and carries a guard-on-the-guard using the REAL objects 0053 dropped rather than invented names. The fix: `0052` → `superseded-by 0053`, **`rerunnable: false`**, 0002's shape, with the ⚠️ that re-running it would REGRESS 0053 by re-creating the retired table; it also says why 0052's OTHER half (the stamp) stays covered — 0053's witness cannot be satisfied unless 0052 ran, because the backfill READS that table. By value on `sid`'s exact state: **55 applied / 0 not-applied**, `found: null` (never a probe result it did not take), and it **inherits without assuming** (0053 unapplied ⇒ `needs-human`). 🔴 **The part worth your eye: TASK-454's own pin — mine — asserted the defect** ("the witness entry stands (a box that has not run 0053 still needs it)"). It sounds right and is not: a witness cannot serve a box that has not run 0053 if it lies to every box that has. Corrected in place with that reasoning beside it. Your §1 is right that neither of us asked whose witness the table was — the walk now asks it automatically. The standing rule is in `drizzle/README.md` with the consequence, the three steps, both worked examples and the date it cost a deploy. 8/8 mutations bite (BASELINE=44). 📦 Owner: dry-run (expect 55/0, "would apply: (none)") → `--apply` → `db:migrate` → verify 55. ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: 🔴 **DEF-1 ROOT CAUSE — LINE `request_timeout` on our webhook, 14 today.** Owner enabled error statistics; LINE console (times shown in JST = BKK+2) lists 14 × `request_timeout: https://som.develyst.online/api/webhooks/line` on 2026-09-24, incl. 13:19:33–13:19:58 (2), 13:21:36, 13:25:13 = exactly Tanya's 11:19 enter / 11:21 phone (never logged, silent) / 11:25 resend (logged, linked), and 00:45–00:47 = Khwan's 22:45–22:47 retest. So the "message never arrived" cases are LINE giving up on a SLOW response; sometimes our handler still finishes (reply lands), sometimes it never logs at all.
Why slow (from `src/routes/webhooks.ts`): the route awaits `handleLineWebhookEvents` BEFORE returning 200 ("process synchronously") — DB work + LINE reply API + rich-menu link calls, all inside LINE's timeout; plus the URL goes Cloudflare → front domain → /api proxy → backend.
Fix, please size: (1) **ACK 200 immediately after the signature check and process events asynchronously** (replyToken replies still valid) — LINE's own guidance; keep per-event error isolation + never-silent; (2) evaluate pointing the webhook straight at the backend host (bypassing the front proxy) — tell me the URL/infra change the owner would make; (3) log signature-failure 401s (currently unlogged); (4) with idempotency on webhookEventId, then redelivery ON. ⚠️ Same code serves the REAL customer OA — real parents likely hit this silently today. Priority over the REQ-105 residue.

From @Jason 2026-09-24: 📋 **TASK-460 CONTRACT in the TASK — no code.** §1.1 the worst path is the PHONE step: **~9–10 DB round trips + 2 outbound LINE HTTPS calls** before we say 200 (3 reads before the branch; up to 6 in `linkFamilyByPhone`; then `linkRoleRichMenu` = another read + an HTTP call, then the reply) — which is why the timeouts cluster on phone events and not on menu taps, and why the reply sometimes lands anyway (we finish; LINE gave up). §1.2 **I will put the per-chat lock in, and here is the argument you asked for: ACK-first does not CREATE the concurrency** — two rapid messages already arrive as two separate requests and nothing serialises them today; a batched delivery is sequential in our loop either way. What ACK-first changes is that our tail outlives the response, which is **exactly what already happens when the request is slow — i.e. the 14 cases in the console**. ⚠️ What genuinely gets worse is VISIBILITY: today a mangled step came with a `request_timeout` in the owner's console; afterwards everything returns 200 and a lost step looks like nothing. A failure that stops leaving evidence is worse at the same rate. ⇒ a `Map<lineUserId, Promise>` chain, ~15 lines, no infrastructure. 🔴 **The honest limit: it serialises within ONE process, and the repo does not record how many we run** (no PM2/ecosystem file is committed — that is Otto's). With N processes it degrades to exactly today, so never worse; I will not call it a distributed lock. 🚫 I am NOT proposing `pg_advisory_xact_lock`: the handler makes two outbound HTTPS calls and holding a transaction across those is a worse trade. **Please ask Otto how many processes serve `/api`** and I will state which we have. §1.3 the reply token is bound to the EVENT, not our response; an expired one throws `LinePushError(400)` → the event-error log → the apology → which fails on the same token and logs again ⇒ **logged twice, never silent**, before and after. 🔴 **§2 correction: `webhookEventId` is not in our event type at all** — the parser keeps only type/replyToken/source/message/postback, so LINE's `webhookEventId` AND `deliveryContext.isRedelivery` are thrown away; there is nothing to be idempotent ON until the parser carries them (it also means no log we have ever written could tell a re-delivery from a first delivery). Store: a new table `line_webhook_events (webhook_event_id PK, seen_at)` where **the INSERT is the dedupe** (`ON CONFLICT DO NOTHING … RETURNING`), so two concurrent deliveries cannot both pass; 🚫 not a column on `line_link_sessions` (a postback with no session has nowhere to write, and the row dies on completion). The TTL sweep rides the EXISTING day-end job, not a new one (TASK-456's lesson). `0055` ⇒ **56 = 56**. REDELIVERY stays OFF until the owner has seen a real duplicate dropped in the log — not on a green suite. §4 Otto note is in the file (both mount paths, the raw body must arrive byte-identical or every request 401s, the header preserved, the two env vars, `/health`). ⛔ Your confirm before code.

From @Jason 2026-09-24: ✅ **TASK-460 DONE (code)** — **2922 pass / 0 fail** (+16), tsc 0, 🔴 **`0055_line_webhook_events`, 56 = 56**, preflight `[]`. ACK after the signature check, process after; the headline is **by value through the real route: a handler held open on a gate cannot delay the 200** (A restores the `await` and bites). The 401 logs `sig=present|MISSING bodyLen=N from=…` — never the body (pinned with a marker string the line must not carry) and never the signature; `MISSING` vs `present` is what separates a scanner from a wrong secret. Dedupe = the INSERT (`onConflictDoNothing().returning()`), before any dispatch, with a missing id PROCESSED not dropped (F/G/H bite). The per-chat queue: one chat strictly sequential by value, two chats not serialised, a failure cannot poison the chain (I/J/K bite) — and the **single-process limit + why `pg_advisory_xact_lock` was refused are written in the file and pinned**, because the day someone reads it as a distributed lock is the day it stops being true. **Your addition is in and pinned**: `[line-in]` carries `id=` + `REDELIVERY`, every event gets `FINISH id · outcome · ms` **from a `finally`**, so a lost step is a line with no finish (L bites); `outcome` names `ok`/`duplicate`/`error`/`error+apology-failed` — the last is what an expired reply token reads as. Sweep on the existing day-end job (7 days), counted in the summary. 🔴 **Three things for your eye: (1)** my census sweep rewrote a test that was NOT a migration count (`auto-cut`'s `55` minutes) — the suite caught it, I reverted and audited every other `toBe(56)` in the tree; a blind numeric sweep across 37 files is exactly how a wrong green pin gets planted. **(2)** my first version of the new suite made REAL calls to `api.line.me` (the unknown-action path replies) — stubbed; a test that passes because a third party answered is not a test. **(3)** mutation Q ("the sweep is dropped") PASSED first time: my pin matched `delete(lineWebhookEvents)` while the mutation kept the text and never awaited it — `void db.delete(...)` greps identically and sweeps nothing. The pin now requires `const swept = await db` + the count. 17/17 bite (BASELINE=37). 📖 REDELIVERY stays off until the owner has seen a real duplicate dropped in the log. 📦 Otto's note is in §4 of the file (both mount paths · byte-identical body or every request 401s — and that 401 now logs, which is how he will see it) — **and the question back: how many processes serve `/api`**. 📦 `db:migrate`, verify 56. ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: ✅ TASK-460 on sid — migrate ⇒ verify **56** clean (no ledger gap). **Otto's question answered by the owner's `pm2 list`: `som-back` = ONE process, fork mode** (id 6; `som-front` id 7 separate). So the per-chat lock holds as designed. Owner will watch the LINE console for new `request_timeout`s after the restart. Direct-to-backend webhook stays with Otto, not blocking.

## 2026-09-24 — Porter → @Sober: 📦 The owner keeps job triggers in the back repo's `sm-jobs/` folder (daily-digest, daily-reminder, end-of-day, month-reset, weekly-teacher-digest `.ps1`) and copies them to the box. **TASK-456 shipped no `sm-jobs/group-series-extender.ps1`**, so he had nothing to deploy. Please add it (same shape as weekly-teacher-digest.ps1, route `/internal/jobs/group-series-extender`, secret by the same means as its siblings) and make "a new job ⇒ its sm-jobs trigger in the same task" a rule. Owner is hand-copying one today.

From @Jason 2026-09-24: ✅ **TASK-461 DONE (code)** — **2926 pass / 0 fail** (+4), tsc 0, no migration (56 = 56). `sm-jobs/group-series-extender.ps1` built by **copying the sibling's BYTES and swapping the job name** (identical verb, port, header, body, backticks, CRLF, no trailing newline) — a hand-typed sibling is how the subtly-different one reaches the box. The rule reads the job names **out of the router** and the posted job **out of each ps1**, then walks both ways: **→** every route has a trigger (this defect — a job the owner could not deploy); **←** every trigger posts to a route that exists **and to its own name** — the more expensive direction, because a trigger aimed at a renamed route fails on the box every night for ever and nobody reads a Task Scheduler history until something else breaks. ⚠️ The **URL path** is the assertion, and the rest of the file is compared **to a sibling** rather than a literal, so when the owner changes the port across all six the test follows him instead of fighting him. Guard-on-the-guard included. **Census asked and answered: six routes, six triggers, nothing dangling** — one hole, now closed, and the list is pinned so a seventh route without a trigger fails on the number too. 📖 **Report-only, §4:** all six triggers carry the secret in plain text in the repo (the new one too — I invented no second way). Plainly: repo access = the token that runs the day-end cut and the revenue post, and rotating it means editing six files; the alternative is `$env:INTERNAL_JOB_SECRET` (one line per file), whose real cost is operational — it must be a **MACHINE-level** variable or a task running "whether user logged on or not" sees nothing and all six 401 at 03:30 — plus setting it again on every new box; and the cost of NOT switching is that the value is in git history for ever, so any rotation is a rotation plus an accepted exposure. 🚫 Changed nothing — the owner's call with Otto. 5/5 mutations bite (BASELINE=19); mutation A **moves the file** rather than editing it, because the defect is an absence, and all six triggers are md5-verified byte-identical afterwards. 📦 The owner copies the file and registers it daily 03:30; nothing to deploy in the API. ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: 🔴 **URGENT — group-series-extender on sid: "connection closed" + Postgres went into RECOVERY MODE at the same time.** Owner ran `sm-jobs/group-series-extender.ps1` on the box ⇒ `Invoke-RestMethod: The underlying connection was closed: An unexpected error occurred on a receive` (no HTTP response). The som-back log at the same time shows `57P03 the database system is in recovery mode` (outbox tick) — i.e. the Postgres cluster crashed/restarted. Coincidence is possible, but the extender may have crashed the backend or the shared Postgres (the box hosts ~30 apps on one cluster, incl. possibly uat). I told the owner NOT to re-run. Please: (1) read the extender for anything unbounded (loops per series × weeks, one giant transaction, no batching, a runaway date loop on a bad series row?) and whether sid data could make it explode; (2) say what the endpoint does on DB error — does it crash the process (connection closed = process died mid-request?); (3) give a SAFE way to run it once (dry-run / single series / limit). Owner/Otto are checking the Postgres log for OOM/"terminated by signal".
## 2026-09-24 — Porter → @Sober: ✅ DEF-1 CLOSED — owner's console export: 14 request_timeouts, last one before the TASK-460 deploy, zero after (incl. Tanya's traffic window). Please note it; TASK-460 is a uat candidate (the real OA has the same bug).

From @Jason 2026-09-24: ✅ **TASK-462 DONE (code)** — **2944 pass / 0 fail** (+18), tsc 0, no migration (56 = 56; `job_runs` already had a free-text `status` and nullable `finished_at`). 🔴 **Correction to your §1.5, and it points at me:** the outbox tick DOES catch — the `57P03` line in the log IS that catch, so that path survived. Walking every detached promise in `src`, the one that did NOT was **mine, in TASK-460's per-chat queue**: `void next.finally(...)` rejects when `next` does, and the dedupe INSERT sat outside the event's `try` — so during a cluster restart it was the first thing to fail and `.finally` manufactured a rejection nobody could catch, the kind that ends a Bun process. I cannot say it fired on `sid`, but it was a live path from "DB hiccup" to "API gone" and it is closed (`then(clear, clear)` + the insert inside the `try`; P and Q bite). Built: **DRY RUN by default** — `apply: z.boolean().default(false)` in the SCHEMA; the plan per series (key · title · coach · dates) + `wouldCreate`; **zero writes, not even `job_runs`**, pinned by counting. 🔴 **BOTH triggers send `apply: true`** — the ps1 AND TASK-456's bun exe, which sent `{}` and would have reported a plan every night and created nothing with a green exit code; TASK-461's rule covers ps1s only and the exe is a second door. Bounds `maxSeries` 25 / `maxDates` 100 in the body, validated, reported (`truncated` + `datesNotReached`, response + `job_runs` + warn), stopping BEFORE a series (never half-extended), and **only series WITH work count** or the first 25 finished ones would eat the budget for ever; resumes for free. **Route = option (b), argued:** dry run synchronous; **apply answers 202 `{runId}` after writing a `running` row with no `finished_at`**, then finishes that same row `success`/`failed` — "ran long" vs "died" become a row that finishes vs one that never does (and if the DB is what died, the row stays `running`, which is the honest record). 409 `ALREADY_RUNNING` on a second apply. ⚠️ Cost stated: the ps1's exit code no longer reflects the outcome — read it in `job_runs`. **Process:** `unhandledRejection` logs + keeps serving; `uncaughtException` logs + **exit(1)** (a synchronous throw leaves state unknown — never worse than before, it just adds the line). What we lose by not dying and what a handler must not swallow are in §3, pinned (M/N/O bite). §4 for Otto: postgres.js 3.4 defaults (10 conns, 30 s connect, broken connections discarded and reopened lazily, **no retry in our code**) — and still open: **how many processes, and is there a supervisor?** §5: the `sid` estimate comes from the owner's own DRY RUN (the command is in the file); upper bound = live unclosed series × 8, and the plan doubles as the list of test series to close first. 🔴 Mutation G passed first time because the MUTATION modelled an imaginary bug — rewritten to the real one, it bites. 17/17 (BASELINE=53). 📦 Order: deploy → dry run on `sid` → re-copy the ps1 → one manual apply read in `job_runs` → only then register nightly. ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: 🔴 **Tanya TEST-067 C/E/F/G — two defects to fix before uat** (C, F PASS; G PASS except DEF-2).
- **DEF-3 (HIGH) — coach pay leak:** a `menu:camp` user WITHOUT key 59 reads every coach's `teachers[].rateMinor` on camp days — TASK-454's new field is not in the key-59 read mask (`rate`, `classRateMinor`, `teacherRates`). Write side is guarded; READ leaks. Fix at the mapper/mask + a pin that walks every rate-bearing field (so the next new rate field can't slip past).
- **DEF-2 (minor):** `GET /api/group-series/:key` and `/api/other-series/:key` still 500 on a malformed key — TASK-451's guard doesn't cover these `:key` readers.
- Answers for your TASK-462 questions: `som-back` = ONE process under **PM2** (fork mode; PM2 is the supervisor and restarts on exit). Postgres log check is with Otto/owner.
uat is held until DEF-3 is fixed and re-tested (owner chose: full Tanya pass first).

From @Jason 2026-09-24: ✅ **TASK-463 DONE (code)** — **2955 pass / 0 fail** (+11), tsc 0, no migration (56 = 56). **§1 why TASK-434's pin went blind:** it was `/^\s*rateMinor:\s/m` — `rateMinor:` at the START of a line — and TASK-454's camp producer is a one-line object literal with the key mid-line. It was never removed or scoped away; it checked the code's LAYOUT, not the API's output, and stopped matching the day someone wrote the same thing on one line. The new walk demonstrates it on the very line that leaked (434's regex: false; the walk: `rateMinor`). A second pin carried the PREMISE — TASK-431's mask test asserted "a `rateMinor` on a non-rate object stays"; the only other `rateMinor` in src is the dormant `freelance_budgets` column no route reads, so it is corrected. **§2 the walk FAILED on today's tree** (scratch copy, deleted) and named TWO keys: `rateMinor` (the leak — by value, 60000/45000 returned to a no-59 user) and **`teacherRateMinor`** — the primary coach's rate column: no DTO emits it today, but a raw row from any future reader would, and the old mask would have let it through. Nothing else leaks; one more name was one careless reader away. **Built:** ONE declared set `COACH_RATE_FIELDS` (5 names); the read mask IS it (pinned by identity); the write fields are it minus the read-only names, with the difference stated once beside it. **The walk** finds every rate-shaped key ANYWHERE on a line and requires it to be masked or named in `NOT_A_COACH_RATE` with a reason (`hourlyRate` = key 57 · `rates` = a local variable · `migrate` = the pattern's own false positive) — and every exemption must still occur in src, so the allow-list cannot go stale into a blind spot. **Mutation E adds a new `coachRateMinor` to the camp producer and the suite fails that day.** DEF-3 by value through the root app with the REAL `campDayTeachers` output. **DEF-2 decided by ROUTE:** `FREE_FORM_PARAMS` lists the only non-uuid params by full pattern (settings `:key`, camp `:date`, calendar `:file`) and every other param is a uuid — an undeclared one fails closed; renaming `:key` would have left the name bet in place for the next route. By value: both series readers 400 with the service never called; a real key passes; `/settings/:key` still resets. Porter's answer written in the queue docstring and beside `uncaughtException` (exit(1) = restarted by PM2). 8/8 mutations bite (BASELINE=39). 📦 Re-test notes for Tanya are in the file. ⛔ Your DONE.

## 2026-09-24 — Porter → @Sober: 🔎 **REQ-106 (customer, uat) — the Rental note is missing from the TEACHER's view of a session; admin sees it.** Screens: teacher login on uat, booking 2026-09-23 14:00 Haris / Private INLINE SKATE shows session note but no Rental; admin sees "Rental: Rent 200 / Full Set (inline Skate Size 45-46 + Protective Gear Set) · paid". Khwan asks whether she must grant a permission. Tell me: which gate hides it (a key? the REQ-097 teacher-scope mask?), and your recommendation — the coach needs the GEAR to prepare; the rental PRICE may be money the coach shouldn't see (ties to the key-57/59 thinking). Analysis + size; no build until owner rules. Not blocking the pending uat deploy unless you think it should.

## 2026-09-24 — Porter → @Sober: ➕ REQ-106 add-on: confirm the TASK-463 unified pay mask does NOT null/hide the Rental block (it carries a price) for users without key 57/59 — the coach must still see the GEAR. The customer suspected our permission change caused the missing rental note (it can't on uat — 463 isn't there — but it could after we ship).

## 2026-09-24 — Porter → @Sober: 🔎 REQ-106 §2 — separate complaint on uat: the customer turned off a 'see value' permission and still sees the value. Awaiting her screenshots (which key, which screen, which account). Meanwhile tell me: does super_admin bypass role grants? do grant changes take effect immediately or only at next login? and list every money surface still UNmasked on uat (before TASK-463 ships).

## 2026-09-24 — Porter → @Sober: ↩️ REQ-106 §2 withdrawn — the customer was only asking WHERE the permission fix is, not reporting a failure. No action. REQ-106 §1 (rental in teacher view) stands.

## 2026-09-24 — Porter → @Sober: ❌ **Correction to your §2 point 3 — keys 57 and 59 ARE on uat.** log/2026-09-22.md "WHOLE BATCH (REQ-094…104) LIVE ON uat — 2026-09-23": uat migrated to 53 with REQ-101/102/103/104, owner granted 57/58/59. What is NOT on uat is only what came after: TASK-446…463 (incl. TASK-463's camp `rateMinor` fix and REQ-105's per-coach camp table). So on uat today: coach rate + freelance budget ARE masked by 57/59 except the camp per-day rates. (§2 itself is withdrawn — the customer only asked where the fix is.) Please re-check claims about what's on uat against the log before stating them. REQ-106 §1 (rental in teacher view) is the open item — your read?

## 2026-09-24 — Porter → @Sober: 🟢 **REQ-106 GO — owner (ก): gear only**, read-only in the teacher (scoped) view — rental item + remark, NO price, NO paid state, NO buttons. **Fold into the held uat batch** (owner). FE S — cut it; ping me when green so the owner redeploys sid and Tanya checks it, then the single uat deploy.
From @Fern 2026-09-24: ✅ **TASK-464 DONE (code)** — **578 pass / 0 fail** · tsc 0 · build ok · 2 source modified · 2 new · 1 pin moved. A **separate `RentalGearLine`**, not a flag inside `RentalSection` (my call, argued in the TASK: that section is three doors, a money post and six server codes — a `readOnly` branch would leave "a coach must never see money" one boolean away from every one of them; the new file imports no price source, holds no door, reads no `paid`). The coach sees `Equipment to prepare: <tier>` + the remark, nothing else. ✅ **Your read was right: `paid` IS in the object** (the scope picks bookings, not fields) — no BE change needed, and the whole job was not rendering it. **Absences pinned by RENDERING with `paid: true` AND `false`:** no ฿ / "baht" / price shape, no Paid–Unpaid in either language, no `<button>`/`<a>`/`<input>`/`role=button`; plus a source pin of exactly ONE hook call (`useT`). No rental ⇒ the stripped text is `""` (no empty box, no dash). The unscoped section untouched (pinned: still its key, still `usePayBookingRental`, knows nothing of `scoped`). ✅ **Folded in per your ruling: `course.defaultRateLine` deleted** (both languages + its copy-list pin, reason named; a mutation that brings it back fails). 🔑 ×8 mutations, `BASELINE=0` on a green suite, md5 identical on 3 files. Notes + Tanya's list in the TASK §2. 📦 Ships with the held `uat` batch. Nothing waits on me.

## 2026-09-25 — @Porter → @Sober: 🔴 DEFECT (uat, just deployed) — the group extender's dry run reports `"weeks": null, "horizon": "NaN-NaN-NaN"`, i.e. it can never create a date on any box.
Owner ran on the uat box (dry run, body `{}`), after migrate → 56 + pm2 restart:
```
{ "dryRun": true, "date": "2026-09-25", "horizon": "NaN-NaN-NaN", "weeks": null, "series": 0, "closedSkipped": 0,
  "wouldCreate": 0, "truncated": null, "datesNotReached": 0, "plan": [] }
```
My read (please verify, not a fix instruction): `jobs.service.ts` `planGroupSeriesExtension` does `Number(await getSetting("group_series_weeks_ahead"))`, but `getSetting` returns the `resolveSetting` object `{ value, isDefault, reason }`, not the number ⇒ `Number({...})` = NaN ⇒ horizon NaN ⇒ `d <= "NaN-NaN-NaN"` never true ⇒ zero dates, reported green. Tests spied the setting so never saw it. Also `truncated: null` looks like a second unset field — please check.
Asks: (1) confirm cause + fix, with a test through the REAL getSetting (no spy); (2) is `series: 0` on uat a consequence of this or genuinely no open series? (3) expected dry-run reading after the fix so the owner can check it.
Impact now: nothing created, nothing broken — the owner has NOT applied or scheduled the extender on any box and will not until this is fixed. Rest of the uat deploy stands. After the fix: owner redeploy sid → dry run → Tanya → uat.

## 2026-09-25 — @Porter → @Sober: ❓ uat relink dry run (real OA @427ybeky) — read-only, NOT applied; need your reading before anything is.
Owner ran `line:relink-menus --dry-run` against uat (token = SOM.BALANCE.SCHOOL @427ybeky). Summary line verbatim:
`205 known LINE account(s): 0 ok · 0 stale · 0 variant· 205 unlinked · 0 blocked (no menu published)` — every row `linked none`, expected teacherTH (21 teachers) / parentTH / parentEN (184 customers, majority EN).
Questions: (1) does `linked none` on all 205 mean real users today see only the OA's default menu, and is that what they had before this deploy (i.e. nothing regressed)? (2) are the `expected` menu ids actually PUBLISHED on @427ybeky, or only on the demo OA — what does "(no menu published)" refer to? (3) with TASK-446/452 now live on uat, what happens when a real user links / taps the language toggle — does the link call succeed, fail quietly, or error? (4) if we ever `--apply`, most parents are EN ⇒ they would get the old blue EN menu (no EN known artwork) — confirm.
Held: no `--apply` on the real OA until you answer and the owner rules. `LINE_OA_WRITE_ALLOW` is unset on uat (owner's choice) so a write cannot happen by accident.
➕ Addendum: the owner had already run the trigger (`apply:true`) once on uat before the dry run — runId `bb630bf6-f3bd-4015-887a-ca6658a3fb50`, returned `running`. My read: apply walks the same empty plan ⇒ created 0, only a job_runs row. Please confirm, and tell me the one thing the owner should look at to see that row finished (there is no run-status endpoint in `routes/internal.ts`).

## 2026-09-25 — @Porter → @Sober: FYI — inspect-menus on the real OA (@427ybeky) settles (2): all 4 stored ids `NOT FOUND on LINE`, no API default menu, `/richmenu/list` empty. Relink `--apply` stays off until a publish (REQ-077, owner). No action asked; if the stored dead ids should be cleared/flagged so link/toggle stop calling LINE with them, tell me the size — not urgent.

From @Jason 2026-09-25: ✅ **TASK-465 DONE (code)** — **2964 pass / 0 fail** (+9), tsc 0, no migration (56 = 56). It was mine (TASK-456), and so was the reason nobody saw it: **both my extender suites spied `getSetting` to a bare `2`** where production returns an object. 🔴 **The test written first found something WORSE:** on today's code the no-series case failed exactly like `uat` (NaN-NaN-NaN), but the case WITH a series **HUNG** — `weeklyDatesToCreate` stops on a STRING compare, and `"2026-11-13" <= "NaN-NaN-NaN"` is **true** (digits sort before "N") for every date forever: **360,756 iterations in 300 ms, year 8940, array growing, synchronous.** So on `uat` (no series) it was a green zero; **on any box WITH a live series the first call never returns — no HTTP response, unbounded memory.** ⚠️ **That is `sid`'s incident exactly** (no response at all + a Postgres restart, which is what the OOM killer on a 30-app box does). I cannot prove it from here — Otto's OOM/Postgres log can — but it is now the leading candidate, and it corrects TASK-462 §1.1 (the string bound held only while the horizon was a date; the `maxDates` bounds could not help, they apply after a function that never returned). **Built:** `getNumberSetting` (reads `.value`, refuses non-finite, names the setting); 🔑 **the misuse made to THROW** — a resolved setting carries a non-enumerable `Symbol.toPrimitive` that throws, so `Number(obj)`/`+obj`/`obj*7`/template all fail loudly with the fix in the message. Argued over your options: a branded type cannot stop `Number(any)`; a helper relies on being chosen; a scan knows only its pattern — the throwing object catches EVERY coercion path in production on first run, and leaves `.value`/destructuring/`toEqual`/JSON untouched (pinned). The helper and a paren-matching scan pin are belt and braces (the scan's first-draft REGEX flagged correct code — now a paren matcher). A non-date horizon FAILS the run, and `weeklyDatesToCreate` itself refuses a non-date `from`/`horizon` in < 50 ms. **No spy on the setting anywhere now** — both older suites fake the `app_settings` ROW. 7/7 mutations bite (BASELINE=52); G (guard removed) **hangs and is killed at 60 s** — a synchronous loop cannot be stopped by Bun's per-test timer, which is the best argument for the guard living inside the loop. 📦 **Owner's re-check on `uat`:** `weeks: 8`, `horizon: "2026-11-20"`, and **`series: 0` / `wouldCreate: 0` — zeros WITH a real horizon are a healthy run** (uat has no live group series; your read is right, as is `truncated: null`). On a box with a series, `plan` lists each one. 🔴 **`sid` must not run the extender on today's code at all** — dry run there only after this ships. ⛔ Your DONE.

## 2026-09-25 — @Porter → @Sober: Owner ruling — the whole rich-menu topic is PARKED (your option 1 relink BLOCKED-check, option 2 clearing the dead ids, REQ-077 artwork). Do not cut anything for it. Focus: TASK-465 (+ the read-only "last job runs" view you already offered in that round) → report when green; owner redeploys sid → dry run → Tanya → uat.

## 2026-09-25 — @Porter → @Sober: TASK-465 relayed to the owner, incl. the loop/sid-incident reading and "Otto has the proof". Two checks: (1) the read-only "last job runs" view you offered for this round is not in your DONE note — in, or deferred? (2) confirm this round is code-only (no migration, verify stays 56) so I can give the owner a one-message sid runbook.

## 2026-09-25 — @Porter → @Sober: TASK-465 PASS on sid (Tanya, TEST-069, screenshots viewed) — uat release goes ahead. One question, not blocking:
Balance Play Monday 2026-11-09 was NOT created: Camp 12:00 that day already holds "Aiwa · Course · Balance Play (Group)" (LAST). Apply 4, dry run promised 5; follow-up dry run 0. So:
(1) Is that date now a PERMANENT hole? The extender steps after the series' LAST row (11-16 now exists), so 11-09 will never be retried — and the only trace is a console warn.
(2) REQ-105 §8 says an empty group date YIELDS its hour to a Private and stays visible (CLASH on enrolment). Should the extender create that date as a yielded row instead of skipping it? Or is Aiwa's booking actually a member of this group (title says Balance Play (Group)) — i.e. not a Private at all?
(3) Should the dry run pre-check the coach-hour so the plan does not promise dates the apply will skip?
Size + your recommendation; I take it to the owner. The "last job runs" view question from earlier is still open.

## 2026-09-25 — @Porter → @Sober: 📥 REQ-107 (rich menu v2 + message formats + LIFF sign-up) — ANALYSE ONLY, no TASKs yet.
The owner un-parks the rich-menu topic as the NEXT round (after TASK-465 reaches uat). File: `requirements/REQ-107-richmenu-v2-message-format-liff-register.md`; customer originals in `project-docs/customer-2026-09-25-richmenu/`. Headlines: bilingual TH+EN artwork (unlinked 2-cell, linked 6-cell), phone-typing sign-up → LIFF page, Add Student → LIFF link, new check-in/leave/my-course/help formats. Real OA has 0 menus (fresh publish). Please return: what each item costs (S/M/L), what the bilingual artwork does to the TH/EN menu-family model, what a LIFF sign-up needs from us (LINE Login channel, page, id-token verify, where it lives), and any question to add to §5. I am asking the owner the LIFF-ownership and teacher-menu questions in parallel.
➕ REQ-107 addendum (§6 in the file): owner says `2011577840-zelD9mEA` = REAL OA LIFF, `2011571495-uCrah47D` = DEMO OA LIFF. Our `/register` LIFF page (REQ-088 / TASK-348) already exists and the env files carry both ids — so please size §2 as "wire menu + bot to the existing /register", and say whether /register already covers Add Student (new child) or only family linking.
➕ REQ-107: owner rules the teacher menu stays AS IS (existing artwork/cells) for now — but it must be re-published on the real OA alongside the new parent menus (its stored ids are dead too). Include that in your sizing.

## 2026-09-25 — @Porter → @Sober: REQ-107 §5 Q1 answered — and it is a problem. The REAL OA's LIFF `2011577840-zelD9mEA` has its **Endpoint URL on `sid` (som.develyst.online)**. `.env.uat` carries this id. Our bot sends no liff link today (no `liff.line.me` in src), so exposure is only if the link was shared by hand. Please state: (1) today, a real parent who opens it — which backend/DB receives the lookup/link/create, and does sid's token verification accept a real-OA Login-channel token? (2) the exact go-live change (endpoint → `https://frontoffice.develyst.online/register`, owner's console step) and whether sid then needs its own LIFF (the demo `2011571495-uCrah47D`). Asking the owner whether Khwan has already shared the link.

## 2026-09-25 — @Porter → @Sober: ▶️ REQ-107 RELEASED TO BUILD (owner rulings in REQ-107 §6):
- Khwan has **NOT** shared the real-OA LIFF link. Your Q(1) on today's exposure is therefore informational only. Q(2), the go-live endpoint steps, is still wanted, for the owner's runbook.
- The chat-bar label is `เมนู | Menu`.
- Keep the typed-phone sign-up working. The menu stops advertising it.
- "Chat with Admin closes the menu" is sent back to Khwan in your words (collapsed by default plus the existing mute). **Hold only that item** until she answers.

Please cut the TASKs:
- one bilingual menu per role (family collapse);
- the teacher menu re-published as-is;
- LIFF wiring to /register (demo LIFF on sid, real LIFF on uat);
- the 4 message formats. Every byte comes from the customer's sheet in `project-docs/customer-2026-09-25-richmenu/`.

Flow: sid (demo OA publish, owner's hands with the guard) → Tanya on the demo phone with screenshots → uat publish on @427ybeky. Still open from earlier: the extender skipped-date hole and the job-runs view.

From @Jason 2026-09-25: ✅ **TASK-466 DONE (code)** — **2974 pass / 0 fail** (+10), tsc 0, no migration. Cause, my reading: the read was LIVE-only, so a cancelled last date fell out of the date set, the anchor dropped back and the next weekly step WAS the cancelled date (no slot held ⇒ no clash). My TASK-456 "unreachable guard" reasoning was sound about the set it was given — the set was wrong. 📌 **The full suite stayed green through the fix before any new test existed**: every older fixture had live rows only. **Split reads, ONE query, no status filter:** ALL rows answer "which dates has it HAD" (date set + anchor); LIVE rows answer "does it still run / what does it look like" (a cancel-all stays terminal; the template is still the last live row; closed skip unchanged). **Anchor = (c)**, pinned against both (a) resurrection and (b) the cancelled tail ending the series. By value: cancel the LAST date ⇒ never re-created (was `[10-13, 10-20, 10-27]`, now `[10-20, 10-27]`); two cancelled Tuesdays ⇒ none, cadence kept; second run ⇒ nothing. 🔴 **My own break-and-watch miss, reported:** I first ran it with the wrong BASELINE (60 vs 51), which dressed mutation B up as a bite — **B actually passed**: re-adding the status filter to the DB `where` is invisible to fixtures that ignore their `where`. Added a test that runs the real `where` against recording operators (asks `bookingType=GROUP`, nothing about status); with the right baseline B bites. 4/4 (BASELINE=52). ⛔ Your DONE. ▶️ TASK-467.

From @Jason 2026-09-25: ✅ **TASK-467 DONE (code)** — **2978 pass / 0 fail** (+4), tsc 0, no migration. **One deviation, argued:** the route is `/internal/jobs/job-runs`, not `runs` — TASK-461's rule is "a trigger calls a route with its OWN name", your spec named the file `job-runs.ps1` and the route `runs`, so one had to move; I kept the rule and moved the route (the file name is the one the owner types). 🚫 No exception added to the walk — an exception by name is DEF-2's bet. 📌 **The walk now covers GET routes** (it matched `.post` only); census = seven. Built: behind the same secret (401, DB never asked), **newest first pinned from the SQL the route builds**, default 20, cap 100 **twice** (the schema 400s at 101; the service clamps anyway), exactly `{ job, runId, status, startedAt, finishedAt, summary }`, no write of any kind (pinned). 🔑 **A `running` row returns `finishedAt: null` — never defaulted** (mutation D dresses it as finished and bites). `sm-jobs/job-runs.ps1`: the siblings' header copied, `-Method Get`, a table where an unfinished run prints **`-- NOT FINISHED --`**, not a blank that reads like success. 7/7 mutations bite (BASELINE=8); G moves the trigger FILE away and TASK-461's walk catches it. 📦 Owner: `powershell -File sm-jobs\\job-runs.ps1`. ⛔ Your DONE. ▶️ TASK-468 contract next.

From @Jason 2026-09-25: 📋 **TASK-468 CONTRACT in the TASK — no code.** §0 the cells come off the customer's sheet in `project-docs/…richmenu/`: **6 separate cells in exactly today's `KNOWN_RICH_MENU` order** (so "คอร์สของฉัน / เพิ่มนักเรียน" is two cells), the 2-cell = today's `UNKNOWN` (`enter · admin`); the images match our two sizes ⇒ **no geometry change**, only names, chat bar, ids. §1 **`MenuIds` gains `unknown · customer · teacher`**; the eight old keys stay in the TYPE because `mergeMenuIds` must keep them (TASK-247) and the sweep must recognise them. `menuIdFor(role, ids)` / `expectedMenuKey` lose `lang`. ❓3 answered with **one pinned legacy fallback**: role key absent ⇒ `customer` → `knownTH` → `parentTH`, `teacher` → `teacherTH` — so a box that deployed the code but has not re-published keeps linking exactly as before for a TH chat; nothing goes blank. `linkKnownRichMenu` goes (a one-step rule now); `settleLinkedRole` links once; **the toggle's relink is removed** — it changes the bot language only. Publish creates three (`unknown` default · `customer` · `teacher` unchanged but re-published), `เมนู | Menu`, stored by merge; old names stay in `OUR_MENU_NAMES` for provenance. §2 both consequences stated: **the `knownEN` gap closes itself; the TASK-452 drift class is retired at the root.** 🔴 **§3 correction — `variant` does NOT become unreachable: it becomes THE migration path.** After the publish every existing follower holds an OLD id that the merge keeps stored ⇒ `variant` ⇒ `--apply` moves them. Deleting it would relabel them all `stale` ("not ours" — false). Kept, re-documented. §5 the owner's order: deploy → publish demo → relink dry run (expect all `variant`) → apply → Tanya → the same on real with `--account` → delete old menus only after the sweep. ⛔ Your confirm before code.

From @Jason 2026-09-25: ⏳ **Waiting on you, nothing else open on BE.** TASK-467 is CODE DONE (awaiting review) and TASK-468's CONTRACT is in the task (awaiting your confirm — the one-id-per-role model, the TH-only legacy fallback, and `variant` kept as the migration path). TASK-469/470 are sequenced after 468 and I am holding to your order. 📌 One offer, your call: **TASK-470 (the four message formats) does not touch menu ids at all** — it is wording in the renderers, read from the customer's sheet — so it could run while 468's contract waits. Say the word and I start it; otherwise I wait for 468.

From @Jason 2026-09-25: ✅ **TASK-468 DONE (code)** — **2990 pass / 0 fail** (+7), tsc 0, no migration. Built as confirmed: three per-role menus with the cells **reused by reference** (the sheet is today's cells/order/sizes — pinned by identity so the layouts cannot drift), chat bar `เมนู | Menu` (11 chars, inside LINE's 14), `MenuIds` `unknown · customer · teacher` + documented legacy keys, `menuIdFor(role, ids)` with **no language parameter** (pinned by arity) and the TH-only legacy fallback pinned both ways, `linkKnownRichMenu` removed, **the toggle links nothing** (by absence; mutation E bites), publish = three by MERGE (old ids survive, by value), default `unknown`. 📌 **A third caller the contract did not list:** `teacher-link.service.ts` (teacher-link approval) also passed a language — moved to the one-argument call. `variant` kept as THE migration path, by value (old-family followers → `variant` → role menu; on an old box, no churn). **Pins moved in NINE suites**, each named in the file; the "role menu THEN known menu" ORDER pins are **retired, not relaxed** (one call, nothing to misorder), and one visible label change: an old menu found with no stored ids reads `known-th` (TASK-252's readable label) instead of `knownTH` — still ours. 9/9 mutations bite (BASELINE=122). 📦 The owner's order is in §5 (deploy → images → publish demo → relink dry run, expect all `variant` → apply → Tanya → real → remove old menus last). ⛔ Your DONE. ▶️ TASK-470 starting alongside now.

From @Jason 2026-09-25: 🔍 **TASK-470 started — the sheet is read, and it disagrees with the task summary in seven places.** The sheet wins, so I build to it, but you should see them now (full list in the TASK, §1): (1) **two TH cells contain ENGLISH** (leave prompt G18, check-in success G11) — copied as written, flagged; (2) My Course lines start with `.  ` (dot + two spaces), not in your summary; (3) her two leave examples disagree (`@ 16:00` vs `@15:00`) — I use `@ 16:00`; (4) times use a DOT in check-in, a COLON in leave, `DD.MM.YY` in expiry, `DD/MM` in leave dates — all copied, all flagged against `DD-MM-YYYY`; 🔴 (5) **the Language/Help reply becomes confirmation + command list in ONE message, and her list DROPS "Or just type your question — an admin will read it and reply 🙏"** — the only line telling a parent a human reads the chat. I build it, but **please put that one to the owner explicitly**; (6) check-in items have no bullet, leave items do — copied; (7) **the sheet carries a LITERAL real LIFF URL (row 43)** — not copied into code (TASK-469's ENV rule). Also: her class lines run 40–50 chars and LINE caps a button at 20 — her format goes in the message body, buttons stay short (the existing TASK-316 split). Your two open items don't block me — her own notes agree with both of your readings.

From @Jason 2026-09-25: ✅ **TASK-470 DONE (code)**. **3010 pass / 0 fail** (+20), tsc 0, 56 = 56, no migration. Her four formats are pinned **by value in both languages**, blank lines included (new `line-v2-lines.ts` + `line-v2-messages-req107.test.ts`). Names go through `studentNamesOf`, so a DUO row reads `Feen & Pun`. `qr`/`menu`/`children` are gone from the list but **still work** (pinned). 🔴 **`My Course` / `Request Leave` are now real commands.** Her list advertises them, and the TASK-313 guard caught that they were not commands. Pins moved in 5 suites, each named. 11/11 mutations bite (BASELINE=151). I (My Course losing the name) **passed first**, got a pin, and now bites. **For the owner (TASK file §1 + §6):** (a) the "admin will reply 🙏" line is gone from the list; pinned absent pending him, and the admin cell on both menus still guarantees a person is reachable. (b) The leave success drops the child's name (overrides TASK-135 Q2). (c) Two TH cells are English text. (d) Three date/time styles vs DD-MM-YYYY. (e) "Duo" comes from the subject name, not invented. (f) ❓ **My Course under `both()` now prints identical lines twice.** I kept TASK-276's bilingual rule; single-language is your call. The make-up date is no longer printed; the make-up session is still created. The quota-locked warning is kept. ⛔ Your DONE. ▶️ TASK-469 after your 468 review.

From @Jason 2026-09-25: ✅ **TASK-470 ruling (f) applied** — My Course: heading bilingual (`คอร์สของฉัน :` / `My Course:`), each class line printed ONCE; "no courses" stays bilingual. Pinned by value (+ "exactly once"); `bilingual-flows` site moved. 3011/0, tsc 0; mutation L (lines doubled again) bites. ▶️ TASK-469 now.

From @Jason 2026-09-25: ✅ **TASK-469 DONE (code).** **3021 pass / 0 fail** (+10), tsc 0, 56 = 56, `/register` untouched, no pins moved.
- **Choice: a postback whose reply is the link, not a URI cell.** The id is read at reply time from the env of the server attached to that OA, so a menu published from the wrong box can never carry the other OA's id. Today's live menus work on deploy without a republish. No `LIFF_ID` ⇒ each tap keeps today's typed flow. Cost: one extra tap (§1).
- **Both cells reply the same way:** her rows 41–42 (TH + EN), then `https://liff.line.me/<LIFF_ID>` once, and no step is set.
- **Typed fallback proven by value through the real dispatcher** with the link on offer: a typed phone still links (`found`), `สมัคร` still opens `CHOOSE_ROLE`, and `เพิ่มนักเรียน` is unchanged.
- **No LIFF id in `src`/`scripts`:** shape scan, fakes only in tests.
- **9/9 mutations bite** (BASELINE=63). ⚠️ The "hard-coded real id" mutation used a same-shape stand-in: I would not write the real id into the repo even for a run, and the scan is shape-based.
- **Deploy note (§5):** the running server's env must carry its own OA's `LIFF_ID`, and the real LIFF endpoint moves to frontoffice `/register` at go-live (console, not code).
⛔ Your DONE. ⏳ TASK-468 still with you. Nothing else is waiting for BE.

## 2026-09-25 — @Porter → @Sober: 🔴 CORRECTION to your TASK-466 note ("the extender is scheduled nowhere"). **It IS scheduled — daily 03:30 on BOTH sid and uat since this afternoon** (owner registered `sm-group-series-extender`, SYSTEM, after TASK-465 passed). Both boxes run the PRE-466 build tonight unless the owner deploys first. I am recommending: deploy the current BE (466–470) to sid before 03:30. uat has 0 group series, so pre-466 there is inert until a group exists; it gets 466 in the REQ-107 uat deploy. Tell me if you see it differently. SYSTEM-FACTS-worthy: read the log before stating what is scheduled on a box.
Also queued (NOT for now): `requirements/REQ-108-shopfront-qr-checkin.md` — fixed shop-front QR → phone → child → class → check-in. Analyse only after REQ-107 is through; the phone-as-only-credential guard is the first question.

## 2026-09-25 — @Porter → @Sober: Owner rulings on TASK-470:
1. **KEEP the child's name in the leave confirmation.** TASK-135 wins over the sheet. Please make the change and tell me when it is green.
2. Drop the "admin will reply" line, per the sheet.
3. The English text in the Thai cells stays as-is.
4. The sheet's date styles stay as-is.

For 3 and 4, Khwan sees them in Tanya's screenshots and may change them.

Your provisional answers stand unless Khwan says otherwise:
- the leave-quota removal applies to the message only;
- "moves to the end" is a wording change only.

When the name fix is in, send me the demo-OA publish runbook: exact commands, what the owner should expect at each step, "variant = success", and old menus deleted LAST.

From @Jason 2026-09-25: ✅ **TASK-471 DONE (code)** — **3022 pass / 0 fail** (+1), tsc 0, 56 = 56.
- **The line now reads** `Record Leave: Feen — FRI 25/09 @ 16:00 : …` / `บันทึการลา : Feen — …`, in TASK-135's `<heading>: {name} — <session>` shape (read from the committed key). Her other words are unchanged.
- **The ruling is written beside the key:** decided twice, the owner's 2026-09-25 ruling via you, the reason, and "do not fix it back to her sheet". A test keeps the comment present.
- 📌 **The name value:** it goes through `studentNamesOf` (the ONE rule, as every other line since 470), not TASK-135's `b.student.name`. So it reads the nickname, and a DUO session reads `Feen & Pun`.
- **Nothing else from 470 moved**; only this line's pins changed.
- **6/6 mutations bite** (BASELINE=59), including deleting the ruling's comment.
⛔ Your DONE. Nothing else waiting for BE.

## 2026-09-25 — @Porter → @Sober: runbook prerequisite gap. The customer's artwork does not meet LINE's rules.
Customer files are in `project-docs/customer-2026-09-25-richmenu/`:
- `menu-linked-6cell.png` is **1527×1030 and 1.58 MB**. The ratio is right, but LINE wants exactly 2500×1686 (or 1200×810 / 800×540) and at most 1 MB.
- `menu-unlinked-2cell.jpg` is **2160×728**. That is not an allowed LINE size; it needs 2500×843.

Also, `menu-teacher.png` = "the EXISTING teacher artwork". Today there are `teacher-th.png` and `teacher-en.png`, but one menu per role means one file. Which one? And the teacher cells are TH or EN labels only, so the teacher menu is not bilingual. Say what you recommend.

`assets/line/README.md` still describes the old six files. Please update it with the new contract.

Asks:
(1) Cut a small asset-prep TASK: resize to the exact LINE sizes, under 1 MB, at the runbook's fixed paths, and check the cell bounds against `line-rich-menu.ts`. That keeps the owner's hands out of image editing.
(2) Upscaling 1527 to 2500 will be soft. I am asking the owner to request full-size originals from Khwan. Use the upscale for the demo test and swap in her originals before the real OA.
➕ Owner ruling on the artwork (09-25): **stretch the customer's images to the exact LINE sizes now and use them.** If Khwan later sends full-size originals, swap them in. If the stretched ones look fine, they can go to the real OA as they are. So the asset-prep TASK is the plan: exact sizes, ≤1 MB, runbook paths. Tanya's demo screenshots are where the owner judges the sharpness. The teacher-file question still stands.

From @Jason 2026-09-25: ✅ **TASK-472 DONE (code).** **3031 pass / 0 fail** (+9), tsc 0, 56 = 56. No change to the cell definitions, the publish script, or backend dependencies.
- **Sizes:** `menu-unknown.png` 2500×843 (984 KB, full colour) · `menu-customer.png` 2500×1686 (592 KB) · `menu-teacher.png` 2500×843 (29 KB, generated, bilingual).
- **Over-1 MB, handled out loud:** her 6-cell art stretched is 2.67 MB full colour and 1.56 MB even as a dithered palette. As **256-colour quality 90 with no dither** it is 0.59 MB and reads the same side by side. The script falls back only when over the cap and prints it. The 1200×810 tier was not an option (the image must equal the definition's size).
- **The cap is read as the stricter 1,000,000 bytes.**
- **Where it lives:** the resize is a **sibling** script (it needs her files, which live outside the repo). The teacher image **extends the generator**: same cells, same blue, Thai over English. The six older files regenerate **byte-identical**. ⏪ Thai-only fallback = the one-line swap commented beside the job.
- 🔑 **Picture = definition:** a new test pairs each file through the publish's own `IMAGE_PATHS` and reads the PNG header. It asserts width × height = `size`, ≤ 1,000,000 bytes, and every tap area inside the picture.
- **README rewritten** for the three-file setup.
- **7/7 mutations bite** (BASELINE=33), including the definition drifting while the image stays.
⛔ Your DONE. Nothing else is waiting for BE.

## 2026-09-25 — @Porter → @Sober: FYI from the demo inspect (step 2 green, @125vuzsj). The 4 ids stored in the **uat** DB, which were reported NOT FOUND on the real OA (`5d5b92ea…`, `d072f130…`, `382c134f…`, `bc9f5178…`), **all exist on the DEMO OA** as earlier `smart-scheduler-*` publishes. So uat's stored ids were demo menus from the start. At some point a publish ran with the demo token against the uat DB. That is not "the customer cleared our menus on 09-05".
This matters for runbook step 6 on the real OA: there is nothing of ours to replace there, it is a first publish. TASK-448's guard now blocks the token/account mismatch. Does anything also stop a publish from writing ids into the wrong DB (demo token + uat DATABASE_URL)? If not, say whether it is worth an S. Not blocking the demo run.
Also: the demo channel has 26 menus (20 orphans). Step 7's remove-menus will list them, and I assume that is fine.

## 2026-09-25 — @Porter → @Sober: demo publish ran. Result: `3 are the set just published` and 5 followers are still on the previous ids. **But the summary prints `undefined` for all six old keys** (`scripts/line-publish-menus.ts:85-90` still prints parentTH/parentEN/teacherTH/teacherEN/unknownTH/knownTH, not the new per-role keys). It is almost certainly cosmetic. Still, it is the same class of problem as this morning: a tool telling the owner something false at the moment he decides. Please cut an XS so it prints the three ids it stored. I have asked the owner to confirm with `line:inspect-menus` before the sweep.

## 2026-09-25 — @Porter → @Sober: Two items from Tanya's REQ-107 demo PASS (TEST-070).

**1. Owner ruling: the Sign Up reply gets its OWN wording.** Today it reuses the Add Student copy ("…to add a student"). Wanted:
- TH: `กรุณากดที่ลิ้งค์ด้านล่างเพื่อสมัครสมาชิกค่ะ`
- EN: `Please click the link below to sign up.`

The link, the fallback and Add Student stay as they are. XS. Tell me when it is green.

**2. The unrelated fix-list.** Also queue the print fix in `line-publish-menus`, which prints `undefined` for the old keys.

**Question.** Khwan's pending answer on "Chat with Admin closes the menu" could turn into "collapsed by default". Is that the menu's `selected` flag, meaning a REPUBLISH plus a sweep? If so I will hold the real-OA publish until she answers, so it runs once.

## 2026-09-25 — @Porter → @Sober: ⏸️ HOLD — owner: "ยังไม่สั่ง sober นะ รอ". Do NOT start the Sign-Up wording XS or the publish-printout fix yet. Khwan's fix-list is arriving; I will send everything as ONE batch. If Jason already started, stop at a clean point and report where it stands.

## 2026-09-25 — @Porter → @Sober: ▶️ HOLD LIFTED. The REQ-107 round-2 batch goes out as ONE set; the owner confirms Khwan's list is complete. Everything is in `requirements/REQ-107-…md` §7.

The items:
- **K0a.** The Sign Up reply gets its own wording:
  - TH `กรุณากดที่ลิ้งค์ด้านล่างเพื่อสมัครสมาชิกค่ะ`
  - EN `Please click the link below to sign up.`
- **K0b.** `line-publish-menus` should print the ids it stored. Today it prints `undefined` for the old keys.
- **K1.** Language/Help reply: add a blank line after the first line, in both languages. Also check that the TH toggle always sends the TH command list; one of Tanya's shots shows the line on its own.
- **K2.** No change to the date styles or to the English inside Thai cells (Khwan).
- **K3.** Chat with Admin:
  - reply TH `สักครู่นะคะ แอดมินจะเข้ามาตอบกลับเร็ว ๆ นี้นะคะ` / EN `Admin will talk to you soon.`
  - menus published COLLAPSED (`selected:false`).
  - ⚠️ Her wording drops the "(type: reopen)" hint. First tell me: does the mute expire on its own? If it does, drop the hint as she wrote. If it does not, STOP on this sub-item and give me the options; that one is the owner's call.
- **K4.** The check-in class pick sends text with `Teacher <name>` in TH and EN. Today TH reads `ครูEk` and EN reads a bare `Ek`. Check whether the leave pick has the same shape and align it. Respect LINE's 20-character quick-reply label limit, with the full text in `displayText`.

Unchanged: the child name stays in the leave confirmation (owner's ruling).

After build: the owner republishes on the demo, because the menus are now collapsed ⇒ new ids + sweep. Then Tanya re-checks only the changed items. Then the real-OA publish runs once. Please update `RUNBOOK-richmenu-v2-demo-publish.md` if the republish differs from the first run.

From @Jason 2026-09-25: ✅ **TASK-473 DONE (code)** — **3047 pass / 0 fail** (+14), tsc 0, 56 = 56. All five items are pinned by exact text in both languages, several through the real dispatcher. 12/12 mutations bite (BASELINE=105).
- **K0a:** Sign Up has its own words.
- **K0b:** the `undefined` was **my miss in 468** (the report kept printing six legacy keys). It now prints the ids **read back after the merge**: role ids tagged NEW / kept / ⚠️ NOT STORED, then the legacy ones. Pinned.
- **K1:** blank line added. The **TH toggle is NOT a defect**: one toggle path (pinned by count), EN→TH proven by value through the dispatcher. No TH-only shot exists in `qa-2026-09-25/`. ⚠️ Her §7 block has no blank line after `Available Commands:` but today's list does; I added and removed nothing. It is a one-character change if you rule otherwise.
- **K3:** her words. **The hint is gone, but the mute still expires in 60 minutes (pinned) and `เปิดเมนู` still works.** All three menus are `selected: false` (only unknown was `true` before).
- **K4:** `Teacher <name>` both languages. The chat shows the full row and the button stays ≤ 20, pinned with a 20-character name. 🔴 **Leave HAD diverged:** it sent only `24/10 15:00`. Fixed, it now sends the full dated row. Also fixed: the pick's child name now uses `studentNamesOf`.
- 📌 **Second publish (§4):** run 1's ids are overwritten, so followers on run-1 menus read **`stale`, not `variant`**. Both are relinked, still success, but the runbook should say so. Pinned.
- ⛔ **§5, READ FIRST:** `line:remove-menus` has NO leftovers-only mode. It removes the **live** set too (pinned by value). **My 468 §5 step 6 was wrong**; as written it would take every menu off the account. Nobody has run it. ❓ Cut a leftovers-only mode, or strike the step. Not built here.
⛔ Your DONE.

## 2026-09-25 — @Porter → @Sober: ▶️ K5 is folded into THIS round (owner ruling). REQ-107 §7 K5 covers **check-in after class end**.

**What to add.** A new setting `checkin_late_minutes`, "เช็คอินได้หลังจบคลาส (นาที)":
- default 0, which keeps today's behaviour;
- sits next to `checkin_early_minutes` in Settings;
- a range is your call.

**Where it applies.** `isWithinCheckinWindow` and `checkinWindowMessage` in `lib/checkin.ts`, and every caller, including camp and the `/checkin` token page.

**Decisions for you to state:**
- whether the window may cross midnight (my guess: cap it at the same day);
- how it interacts with day-end auto-attend. A late check-in must not collide with a day-end run.

**Test.** Go through the REAL `getSetting`, not a spy; this morning's lesson.

**Sequencing.** No migration is expected. Report when green. The owner does ONE sid deploy, then the demo republish, then Tanya re-checks the changed items plus K5.

## 2026-09-25 — @Porter → @Sober: ▶️ REQ-108 (shop-front QR self check-in) RELEASED. **It ships in the SAME uat release as REQ-107** (owner: "มันต้องไปด้วยกัน ขวัญอยากได้"). File: `requirements/REQ-108-shopfront-qr-checkin.md`.

**Analyse now, in parallel with K5.**
- Size it.
- Reuse what exists: the `/checkin` page, `QrDialog`/qrcode.react, and the window rule including the new K5 late minutes.
- 🔴 **The guard for "phone number is the only credential":** anyone who knows the phone can check a child in and sees the family's child names. Give options with a recommendation. The owner rules before any build.

**Questions for your analysis:**
- Does the phone need to be LINE-linked?
- Is it today's sessions only, inside the window?
- Camp days?
- The ATTENDED state and parent notice must be the same as the other paths.
- Where does the admin get the printable QR? A Settings or front-desk page?

**Planning.** Tell me how this changes the timing of the combined sid deploy, so I can plan the owner's steps. If the REQ-107 demo republish can go ahead before REQ-108 is built (code-only, no menu change), say so. Tanya can then check the menus earlier.

From @Jason 2026-09-25: ✅ **TASK-474 DONE (code).** **3058 pass / 0 fail** (+11), tsc 0, 56 = 56, **no existing check-in pin moved**.
- **The setting:** `checkin_late_minutes`, default 0, 0–180, label as asked. Registry-driven, so the Settings screen shows it with no FE change.
- 🔴 **A piece the task didn't name:** the check-in **token** expires at the class end and is checked before the window, so without a fix every late scan would have said "token expired". New tokens now live to the window's end (threaded through `getCheckinQr` **and both confirm paths in `scheduler.service`**). Older tokens are honoured inside the late window, and with 0 the check is exactly the old one.
- **Every caller is pinned** by a scan of `src`.
- **Ruling 1:** same-day guard untouched, clamp to 23:59, the code's own 180 ceiling.
- **Ruling 2:**
  - ATTENDED (what the day-end leaves) ⇒ "already", no change.
  - NO_SHOW ⇒ the window's "too late", **no change**. Mutation A (a late scan flips a NO_SHOW) bites.
  - 📌 A NO_SHOW scan used to say "not confirmed yet" (the wrong reason). It now says "too late" even at 0, per your ruling.
- **Real `getSetting`, no spy:** the DB row fake runs the real `where` and answers only the key asked for. Covered: no row, number, and text.
- **Camp is unchanged on purpose:** a camp day already scans all day, so an end time would *refuse* scans it takes today. Pinned.
- **For the owner (§5):** the window is only real between the class end and the day-end run (~17:30). A 16:00–17:00 class gets at most 30 real minutes, and a 17:00–18:00 class gets none.
- 10/10 mutations bite (BASELINE=26).
⛔ Your DONE.

## 2026-09-25 — @Porter → @Sober: ▶️ REQ-108 BUILD. The owner has ruled on the credential; see `requirements/REQ-108-…md` for the last two sections.

**Credential.** LINE identity (your option A) is REJECTED. The person at the counter may be a nanny or driver without the parent's LINE, which kills the pushed code (option B) too. **The flow is phone-based, as Khwan drew it**, with these guards, all owner-approved:
1. Today's sessions only, inside the check-in window, including K5's late minutes and the day-end settle rule.
2. After the phone is entered, list ONLY the children who have a check-in-able session right now; never the whole family. If there is none, reply with a neutral "no class to check in right now" and show no names.
3. The parent's LINE notice fires at once. This is the same act as the other paths, so misuse shows up immediately. The admin can reverse the check-in by the existing means; confirm which.
4. Rate-limit phone lookups per device/IP.

**Scope from SPEC-093:**
- the printable QR on the Settings page, reusing QrDialog;
- camp days included under camp's rules;
- the ATTENDED state and the notice produced by the same code as the other paths;
- the "phone registered in LINE" wording is Khwan's, but guard 3 relies on a LINE notice. State what happens for a family with no linked LINE at all. My proposal: the check-in still works and there is simply no notice, which the admin can see. Your call; tell me.

**Sequencing.** Build after TASK-474 (done). It then goes to sid, Tanya, and on to the same uat release as REQ-107. Record in the TASK that the owner chose phone-based over LINE identity, and why.

From @Jason 2026-09-25: 📐 **TASK-475 CONTRACT**, read from the code; **no code written**. Full contract in the TASK file (§A–§D). Headlines:
- ✅ **The same act exists:** the shop-front calls `getCheckinQr` → `checkinByToken` (exactly the LINE path; window with early + late, settled rule, attend, credit, notice, CRM) and, for camp, `getDayCheckinQr` → `checkinCampByToken`. No second attend.
- 🔴 **Guard 3 has holes:** the only attend notice is COURSE DEDUCTION, which fires only for course/voucher bookings. **Trial / single sessions send NO notice at all**, and **camp's notice is day-end only.**
- 🔴 **Provenance:** sessions have **no actor field and there is no audit table**; your premise holds only for camp (`marked_by`). `note` fails because a cancel reason overwrites it. ⇒ ❓ a column `bookings.checkin_source` = **migration 56 → 57**. Camp needs none.
- **Reversal:** cancel-ATTENDED **does return the unit** ✅, but leaves the row CANCELLED and **messages the coach and the families "class cancelled"**. That line is for Porter.
- ⚠️ **The public token page doesn't refuse a SUSPENDED household** (LINE does), so the shop-front would inherit it.
- **Rate limit:** in-memory, per IP, **counting misses** (5 per 10 minutes) plus a ceiling (60 per 10 minutes). Refresh-proof and safe for a busy desk. Honest limits: resets on restart, becomes N× under a PM2 cluster, and is only trustworthy behind nginx.
- **Contract for Fern:** `POST /checkin/shopfront/lookup` and `POST /checkin/shopfront` (the act re-validates against the phone's CURRENT list). Unknown number = the same `200 { children: [] }`.
- ❓ **Before code:** (1) the column + migration? (2) guard 3 holes — accept, or a new check-in notice (owner copy)? (3) camp items PLANNED only? (4) suspended ⇒ neutral empty? ⏸️ Waiting on you.

## 2026-09-25 — @Porter → @Sober: REQ-107 round 2, Tanya PASS (TEST-071). Collapsed menus, K1, K3 and K0a are all verified. I found 2 small leftovers in her shot `req107r2-K4-checkin-pick.png` (the reply to `reopen`). Please fold them into the REQ-108 round as an XS:
1. The un-mute reply prints the TH list and then "Available Commands:" with **no blank line between the two blocks**. It is also both languages at once, while every other reply follows the chat's language. Make it consistent with K1: follow the chat language, with a blank line after the heading.
2. The quick-reply chips under it still say **`นักเรียนของฉัน`** (the old name). The menu says `คอร์สของฉัน / My Course`. Align the chips everywhere they appear, TH and EN.

Noted, not a defect: a rich-menu tap is still answered during the mute; only free text is silenced. Tell me if that is not intended.

Not yet covered: the K4 pick BUTTONS and K5. Both need a class today before 17:30. Tanya will book a sid fixture class for tomorrow morning. The teacher menu is still unverified.

From @Jason 2026-09-25: ✅ **TASK-475 DONE (code).** **3079 pass / 0 fail** (+21), tsc 0, **migration 0056 ⇒ 57 = 57** (57 witnesses).
- **Built exactly as your §C / §D:**
  - `checkin_source` is written only on the attend transition and kept through a cancel. The `note` rejection is in the migration header.
  - Sources: `line` / `checkin-qr` / `shopfront-qr` / the staff actor / `end-of-day`.
  - Camp uses `marked_by`, no migration.
- **The lookup:** only check-in-able children (live early + late window, CONFIRMED, not camp hours; camp PLANNED only). The four kinds of "nothing" return **byte-identical `{"children":[]}` with the same reads**.
- **The act:** re-validates against the phone's list, then calls **exactly** `getCheckinQr` → `checkinByToken(…, "shopfront-qr")` (camp: its pair). No attend of its own, pinned by source; a bookingId not in the list ⇒ 409 and no call.
- **Rate limit:** as proposed, with its honest limits in the header.
- **Contract for Fern:** in the TASK file, §4.
- **12/12 mutations bite** (BASELINE=72). **J passed first** (nothing pinned that a matching lookup isn't a miss through the route); now pinned.
- 📌 **§6: a FALSE bite of mine, caught.** My edit was refused, and a stale BASELINE=72 against 71 tests "bit". I caught it on the `0 fail`, redid it for real, and re-read the baseline. Same lesson as TASK-466; I'd like SYSTEM-FACTS to carry "a bite with 0 fail is not a bite until the baseline is re-read".
- Census 56 → 57 in 35 suites, every line printed and each one a migration/journal/witness count.
⛔ Your DONE. ▶️ TASK-476 whenever you say.

From @Jason 2026-09-25: ✅ **TASK-476 DONE (code).** **3087 pass / 0 fail** (+8), tsc 0, 57 = 57, no existing pin moved.
- **Both** token pages had the gap: **camp's too** (`campScanOutcome` never looks at the household).
- **The fix:**
  - One helper, `anyHouseholdSuspended` = `blockedBySuspension` over each child's parent (pinned: neither page reads `suspendedAt` itself).
  - The LINE path's own words, `tb("suspended_notice")`.
  - The check runs **FIRST**, before "already", so no booking or remaining comes back.
  - A walk-in is never blocked.
- 📌 **My reading, for you to confirm:** a **DUO row with EITHER household suspended is refused**.
- 📌 There are two wordings for one policy in the codebase (LINE's vs booking/sale's); I used LINE's as asked.
- TASK-475's act inherits the fix, with nothing repeated.
- 7/7 mutations bite (BASELINE=59), including "the check after already".
⛔ Your DONE. Nothing else is waiting for BE.

From @Jason 2026-09-25: ✅ **TASK-477 DONE (code).** **3097 pass / 0 fail** (+10), tsc 0, 57 = 57.
- **Un-mute:** the chat's language only, with the list's blank line after the heading (by value, TH and EN). Typed `menu` and Help are unchanged (still bilingual, pinned).
- **Chips:** found in ONE place, now built from one list, `PARENT_CHIPS` = register · mycourses · checkin · leave, in the menu's words, both languages, ≤ 20 characters. EN "Add child" → "Add Student" and "Leave" → "Request Leave".
- ⚠️ **Behaviour change for Tanya:** the third chip **used to list the children (`action=children`) and now opens My Course (`action=mycourses`)**. Typing `children` still lists them. Your trap (My Course on `children`) is mutation B, and it bites.
- **§3 pinned both ways:** muted + tap ⇒ answered, muted + free text ⇒ silent; no mute gate on the postback path.
- 8/8 mutations bite (BASELINE=62).
⛔ Your DONE. Nothing else is waiting for BE.

## 2026-09-25 — @Porter → @Sober: ▶️ NEW, folded into THIS round (owner: "ทำรวมรอบนี้เลย ตามแนะนำ"). **Admin "Undo leave".** Source: Tanya TEST-072, finding with screenshot. No admin screen can reverse a mistaken leave:
- the roster has nothing;
- Manage plan ⋮ on an ON LEAVE row = Edit / Mark absence only;
- Unlock = quota only;
- `confirm` is a no-op on a leaved seat (`scheduler.service.ts:2998`, `:3462-3464`).

**Wanted.** A per-session **"ยกเลิกการลา / Undo leave"** admin action on the session roster AND the plan editor. It must:
- return the seat to CONFIRMED;
- refund the leave quota, including over-quota/unlock cases;
- re-hold the coach-hour;
- undo any make-up or extension the leave created. State what happens to an EXTENDED tail row.

If the coach-hour was re-booked meanwhile, refuse with a clear message. Your wording.

**Permissions and notices.** Say which RBAC key gates it, and whether the family or coach is told. My guess is no message, or a neutral one. Your call; tell me.

**Pending owner decision, so build Undo leave so it can extend.** I am proposing to the owner that the same "undo" handles a **false check-in**: back to CONFIRMED, credit returned, NO cancellation message. That solves your TASK-475 point 2, where cancel announces a false cancellation and sick-leave falsifies the record. I will confirm his answer.

Also: clean up asda's 24/10 and 31/10 leaves with the new action in Tanya's round.

## 2026-09-25 — @Porter → @Sober: Owner rulings ("1-3 ตามแนะนำ"), recorded in REQ-108:
1. **Guard 3 gap: ACCEPTED for this release.** Keep the provenance you built. No new check-in notice now.
2. **False check-in reversal:** extend the new **Undo** action, so an admin can undo a check-in. The seat goes back to CONFIRMED, the credit is returned, and NO message goes out. Same action as Undo leave. Record who and when, and keep the provenance of the original check-in on the record.
3. **DUO with one suspended family:** refuse only the suspended family. The other child CAN check in. Change what shipped in TASK-475.

Report the size and fold all three into this round. Then Fern's shop-front page. Then one sid deploy (migration 57). Then Tanya: K4 and K5 with tomorrow's fixture class, the teacher menu if a coach phone is available, the QR page, Undo leave/check-in, and the chip behaviour change. Then uat.

## 2026-09-25 — @Porter → @Sober: 🔴 URGENT, the customer has already announced it. Khwan sent her customers a "Check in" poster (`project-docs/customer-2026-09-25-richmenu/khwan-checkin-poster.webp`). It shows 3 ways: ① the LINE rich-menu Check-in; ② **scan the QR at the counter → phone → child → class → Check-in**; ③ staff at reception. Owner: "รีบเลย".

1. **Today, before anything else:** give me the **final, fixed URL the wall QR will encode on uat**, e.g. `https://frontoffice.develyst.online/<route>`. Khwan may print the poster's QR now. It must never change after she prints it; one URL, no token that expires. If the design needs a per-day token, say so NOW, because a printed poster cannot rotate.
2. **ETA:** the fastest safe path to uat for REQ-107 and REQ-108. Say what can go first:
   - REQ-107 menus + K5 + TASK-477 are done and verified except K4/K5;
   - REQ-108 is waiting on Fern's page and the Undo/DUO changes.

   If Undo leave/check-in is what delays the QR, propose a split: QR first, Undo right after. Do not drop guards 1, 2 or 4.
3. Poster wording: step 2 says "Enter your mobile phone that linked with Line App". Our flow accepts any family phone on record, linked or not. That is fine, but confirm it.
From @Fern 2026-09-25: ✅ **TASK-478 DONE (code)** — **586 pass / 0 fail** · tsc 0 · **build ok with `○ /checkin/shop` in the route list** · 4 new + 1 new test · 3 source modified. 🔴 **The printed URL:** `SHOPFRONT_PATH` written once, the reason beside it AND in the route file (a paper QR cannot be rotated, re-issued or redirected — do not rename/nest/tidy; the test header repeats it to whoever it stops); renaming the route fails the suite, drifting the literal fails two. **No token** anywhere (the page reads no search params). The poster's URL is built by pure `shopfrontUrl(NEXT_PUBLIC_API_URL)` — the same value the backend's `PUBLIC_CHECKIN_BASE_URL` uses — and the QR panel types no host (value-tested incl. trailing slash and `undefined` ⇒ relative). 🔴 **The guard:** unknown number · nothing now · suspended · a child with an empty list ⇒ ONE pure `isNothingToOffer` ⇒ one phase, one sentence, no names, no count, same controls; every refusal (429 · 409 `NOT_CHECKINABLE` · 400 · dead network) is the same neutral line and the 409 returns to a REFRESHED list. **Two pins I added after breaking my own work:** the page may not read `children` at all (a mutation adding `if (!data.children) setNotice("Phone not found")` walked past the first pins) and it holds no literal sentence; rows render in exactly one place. The reply is the EXISTING `SuccessView`/`CampSuccessView` (now exported from `CheckinContent`, with the reason). Nothing stored (`autoComplete="off"`, no `localStorage`), the field cleared on success and on start-over. The body carries the phone again + exactly one id **pinned by KEY SET** — 📌 `toEqual` treats an `undefined` value as an absent key, so a both-ids body slipped. No client phone-format rule (the server's 400 decides). Settings: the shared `QrPanel` + the URL in TEXT + print. Copy +12 both languages. 📌 Also deleted a guard I could not pin (`offerRows` re-asking emptiness — it can never change a result). 🔑 ×14 mutations, `BASELINE=0` on a green suite, md5 identical on 4 files; three slipped first and are re-pinned. Notes + Tanya's phone-first list in the TASK §2. Nothing waits on me.

## 2026-09-25 — @Porter → @Sober: the split is agreed. REQ-107 + REQ-108 go now; Undo and DUO follow. Note that the owner ALREADY ruled on both Undo questions ("1-3 ตามแนะนำ", 09-25, in REQ-108 and my earlier message). Nothing is waiting on him: build Undo (leave + false check-in, silent) and the DUO change straight after. Please send the uat publish runbook for the REAL OA, as one file. It must cover:
- the `.env` switch to uat values, with `LINE_OA_WRITE_ALLOW=@427ybeky` and the real `LIFF_ID`;
- the LIFF endpoint change for `2011577840-zelD9mEA` → `https://frontoffice.develyst.online/register`;
- migration 57;
- the expected sweep words on the real OA (mostly `unlinked`, 205 rows);
- a reminder that step 7 is struck.

## 2026-09-25 — @Porter → @Sober: 🔴 sid `db:migrate` for TASK-475/476 (0056_booking_checkin_source) came back RED. Preflight listed **4 pending: 0053, 0054, 0055, 0056**, even though sid was at 56 since 09-24. Drizzle then applied. Verify result:
- journal 57 · ledger 94 rows · **witnesses 57 applied**
- **0053/0054/0055 NOT recorded as applied** ("ledger newest created_at=1783000000052 ≥ when", the TASK-085 skip mode). 0056's `when` is ...052.

The owner is told: no restart, and `db:seed-ledger --dry-run` output only; I will forward it.

Questions:
(1) The witnesses say the schema has all 57. Is this only missing ledger rows (seed-ledger would record 3 and apply none), or could 0054's index rebuild have been skipped for real?
(2) Why did sid's ledger lose, or never have, rows for 0053–0055 after the 09-24 deploy + seed-ledger? Does the same thing wait for uat, which recorded 0053–0055 properly this morning?
(3) Does 0056's `when` (...052) collide with 0052's? That smells like a timestamp reuse.

## 2026-09-25 — @Porter → @Sober: TEST-073 flag from Tanya. The check-in source (`shopfront-qr`) is **stored but shown nowhere in admin**. No UI or DTO surfaces it. Your promise to the owner was "an admin can see at a glance that it came from the wall QR". As it stands, that evidence is invisible to the shop.

Please make it visible, as small as possible: a chip on the session roster / booking detail, e.g. "เช็คอินจาก QR หน้าร้าน / Shop QR". Say whether it rides this uat release or the Undo round. My preference is this release, because it is the only safety net for unlinked families.

Still open: the multi-select question. Khwan asked; the owner has not ruled; do nothing yet.
➕ Owner rules: the **shop-QR multi-select** (checkboxes plus one Check-in, for 2+ children; Khwan's ask) goes into the **NEXT round**, with Undo leave/check-in and DUO. Not this release. Size it with those.

## 2026-09-25 — @Porter → @Sober: Tanya's phone block (TEST-073). C PASS; K4 check-in PASS; K5 via shop and LINE PASS. Screenshots viewed. Two items for you, and one is serious.

1. 🔴 **Teacher linking: is there still a way in?**
   - Tanya cleared the demo link, made a fixture teacher, and found **no teacher entry in the LINE flow**. `register → Next → enter phone` is the customer path only; `CHOOSE_ROLE` is never reached.
   - The new unknown menu only offers Sign Up, which is the parent LIFF.
   - **How does a NEW coach link their LINE on uat after this release?** Answer from the code: keyword `ครู` / teacher link requests (0015) / admin-side link / something else.
   - If REQ-107 closed the door, that is a release blocker. Size the fix. If a door exists, give Tanya the exact steps so she can close E (teacher menu).
2. 🟡 **Wording:** an ended class (late = 0) via the LINE check-in replies `โทเคนเซ็คอินหมดอายุแล้ว`.
   - Parents should never see "token", and it misspells เช็คอิน.
   - It should read like the other surfaces, e.g. "เลยเวลาเช็คอินแล้ว / Check-in time has passed", following the chat language.
   - XS. Please do it in this release.

Still owed before uat, from earlier:
- the shop-QR source chip in admin;
- the uat/real-OA runbook;
- the sid ledger root cause, and whether uat will hit it.

From @Jason 2026-09-25: ✅ **TASK-479 DONE (code).** **3106 pass / 0 fail** (+9), tsc 0, 57 = 57; WHEN it fires is untouched.
- 📌 **No misspelling exists:** the code says `เช็คอิน`. In Tanya's shot, LINE's font draws ช close to ซ. The real faults were "token" and the language.
- **4 parent-facing lines on 3 surfaces:** session expired and bad link, camp expired and bad link.
- 🔴 **The third surface is the LINE chat:** the bot relayed the raw Thai error even into English chats. It now answers in the chat's language via a new code `CHECKIN_TOO_LATE`.
- **Wording:** Porter's for "too late". For the bad link I used the check-in PAGE's own existing words (`ลิงก์เช็คอินไม่ถูกต้อง`), as you invited: one voice.
- **Staff login's `โทเคน…` kept** (not parent-facing; public routes precede auth, pinned).
- 🔑 **The rule is pinned by a scan** of the 13 parent-facing files: no "token"/"โทเคน" in human text. It is proven non-vacuous and catches a planted line.
- 7/7 mutations bite (BASELINE=39), including "a NEW token string".
⛔ Your DONE. Nothing else is waiting for BE.

## 2026-09-25 — @Porter → @Sober: E is still open, with a screenshot (`req107-E-rolepicker.png`). On sid, `register` and `สมัคร` both answer "กรุณาพิมพ์ "Next" เพื่อเข้าใช้งานค่ะ / Please type "Next" to continue." There is no visible role picker.

**A clue from Khwan's own sheet** (`Status Update/เชื่อมระบบ.html`, step 2): *"type Next = parent; teachers use the word **ครู**, admin **แอดมิน**, CEO **CEO**"*. So the "role picker" may simply be **that prompt**, where a teacher types `ครู` instead of `Next`.

Confirm from the code. If that is right, the teacher door is `สมัคร` → type `ครู`, and Tanya retries exactly that. If it is not right, the door is shadowed and this is a blocker. Your earlier steps ("choose ครู") read like a picker, which is how Tanya missed it.

## 2026-09-25 — @Porter → @Sober: **E PASS, and the teacher door is confirmed working.** The sequence: `สมัคร` → type `teacher` (or `ครู`) at the "type Next" prompt → nickname → request → admin approve → 2-cell teacher menu. The schedule and language cells both work. Tanya withdrew her finding; your earlier "choose ครู" wording was the source of the confusion. **Your answer on my Khwan-sheet question is no longer needed.**

One nit from Tanya: the **teacher's ภาษา/ช่วยเหลือ reply lists the CUSTOMER commands** (Add Student / My Course / Check-in / Leave), which a coach cannot use. Please fold it into the next round, as a teacher-specific list or no list. Say if you think it must go in this release.

Still owed before uat: the source chip, the runbook, and the ledger root cause.

## 2026-09-25 — @Porter → @Sober: 🔴 RELEASE BLOCKER from Tanya (TEST-073, final): **a camp scan overturns a staff-marked ABSENT.**

What she did: staff marked the camp day ABSENT (200), then `POST /checkin/camp {token}` returned 200 and the day flipped to **ATTENDED**. Her code read: `campScanOutcome` (lib/camp.ts) has no ABSENT guard and falls through to "attend".

Your SPEC-093 rule was "a wall QR must never overturn an absence a coach recorded". It is broken, and not only on the wall QR: the camp roster link does it too. **That makes it pre-existing on uat.**

The fix: ABSENT is terminal to every scan (roster link, LINE, shop QR), with the same neutral / "already marked" answer. Add a test through each path. XS, but it blocks the uat release; please do it first.

Otherwise A–F is complete and PASS. The 2 minor flags (source chip; teacher help list) are as already sent.

Still owed before uat: this fix, the source chip (your call on whether it rides this release), the runbook, and the ledger root cause.

From @Jason 2026-09-25: ✅ **TASK-480 DONE (code) — the release blocker.** **3113 pass / 0 fail** (+7), tsc 0, 57 = 57, and `assertDayTransition` / `markDay` untouched.
- **The fix:** `ABSENT ⇒ "already"` in `campScanOutcome`, with the reason in the code. The old `camp-3b` pin that asserted the defect (`ABSENT ⇒ "attend"`) moved.
- 📌 **I found TWO doors, not three:**
  - **roster QR / `POST /checkin/camp`**: by value, 200 `already`, still ABSENT, **zero writes**;
  - **shop-front**: 409, nothing written; it was already closed by 475's PLANNED-only list.
  - **The bot has NO camp scan path** (pinned by source; the reminder carries no link).
- 🔑 **The admin's ABSENT → ATTENDED still works** through the real `markDay`.
- **Session path checked:** the pin is `checkin-late-window-req107` › "NO_SHOW inside the late window ⇒ … NO status change". It holds, so there's no second finding.
- 5/5 mutations bite, including the new guard removed and the admin's correction closed.
⛔ Your DONE. ▶️ TASK-481 now.

From @Jason 2026-09-25: ⏸️ **TASK-481 STOPPED as you instructed: YES, `checkinSource` would reach a scoped teacher. No code written.**
- **Why:** ONE builder (`toBookingDTO`) serves every booking read. A linked teacher reads it through `GET /calendar` (viewer mask exists, today budget-only) and `GET /bookings` (scoped, **no viewer mask**).
- ⚠️ **The value for a staff attend is the admin's USERNAME** (`actorOf(c)`), so a coach would see which admin account marked their class. There is no literal `staff` value; pre-0056 rows are `null`.
- **Options:**
  - **A.** Raw for everyone.
  - **B. `null` for a scoped viewer** (my recommendation; it needs the viewer threaded into `GET /bookings`).
  - **C.** Coarse for coaches (a username becomes `staff`).
- **Camp:** `marked_by` is surfaced **nowhere** today (`dayDTO`, `toPackageDTO.days`, the editor). It has the same values and the same question for `menu:camp` readers, so please rule for both.
Full detail in the TASK file §1–§3. ⏸️ Waiting on your ruling.

From @Jason 2026-09-26: ✅ **TASK-481 DONE (code), ruling B.** **3120 pass / 0 fail** (+7), tsc 0, 57 = 57.
- **`checkinSource` is OPT-IN in `toBookingDTO`:** exactly three reads pass `provenance: !scope` (calendar grid, cancelled tray, booking list), so an admin reads it raw and a scoped teacher reads `null`.
- 🔴 **Why opt-in:** the same builder answers the PUBLIC scan. A raw default would have handed **a parent the admin's username**. Pinned: the public "already" answer is `null`, and a scan of `src` finds nothing else opting in.
- **Camp `markedBy`** is surfaced on `GET /camp/packages` `days[]`, under the same rule; `null` elsewhere.
- **Raw values** pass through unchanged, including a username and `null` (never a default word).
- **Contract for Fern** is in the TASK file §2.
- 📌 **Stated limit:** the rule is tested by value where the value is made; the two big hand-built reads are pinned by source (as every existing test of them is).
- 7/7 mutations bite, including "raw to a scoped viewer", "a coarsened word" and "defaulted to a word".
⛔ Your DONE. Nothing else is waiting for BE.
From @Fern 2026-09-26: ✅ **TASK-482 DONE (code)** — **591 pass / 0 fail** · tsc 0 · build ok · 2 new · 6 source modified. The field was live on my read (TASK-481), so nothing derived. ONE map + ONE `CheckinSourceChip`, on the roster row (beside its status chip) and the booking detail's header; **`shopfront-qr` only** — `checkin-qr`, `end-of-day`, `staff`, an admin USERNAME, `""`, a mis-cased or underscored variant, `null` and `undefined` (ten values) render NOTHING, pinned by RENDERING as an empty stripped output, and the raw value never reaches the screen. Outlined amber + a hover sentence — quiet, not an alarm, for the admin scanning a roster. 🚫 The coach's `null` stays the SERVER's rule: no `scoped`/`teacher` anywhere near the field, and **if a coach ever sees a chip I will report it as a BE defect rather than patch the view**. The mapper carries the field as sent (absent ⇒ null; a mutation substituting `"staff"` fails). I did not add the other four chips. 📌 **A real find from my own test, worth your notes:** the value is an admin USERNAME, so it is free text used as a MAP KEY — with a plain object `checkinSourceLabelKey("toString")` returned `Object.prototype.toString`, **a FUNCTION**, which the chip would have rendered in front of a customer. Now a frozen null-prototype map + `Object.hasOwn`, and **both halves pinned** — the prototype/freeze by value, the `hasOwn` by source, because with a null-prototype map the two lookup shapes are behaviourally identical (stated as a limit rather than hidden). 🔑 ×8 mutations, `BASELINE=0` on a green suite, md5 identical on 4 files. Notes + Tanya's list in the TASK §2. Nothing waits on me.

## 2026-09-26 — @Porter → @Sober: the sid seed-ledger dry run you asked for was ALREADY run on 09-25, before the apply. The owner's output was:
- `Journal: 57 migrations · witnesses: 57`, every row ✅ applied;
- `Summary: 57 applied · 0 not applied · 0 need a human · 0 warned`;
- `Ledger …: 94 row(s) present · 3 to insert`.

After `--apply`: `Inserted 3 row(s)` and verify is green at `ledger 97 row(s)`. The seed output also said "The shared drizzle.__drizzle_migrations was NOT modified". So there is a SHARED ledger table alongside the per-repo `__drizzle_migrations_scheduling`. Could that be where 37 extra rows or the missing 3 went?

The `count(*) / count(DISTINCT hash)` query is logged as an optional owner DATA REQUEST. Non-blocking.

## 2026-09-26 — @Porter → @Sober: TEST-074 PASS. TASK-480 is fixed and evidenced. One wording nit for the NEXT round: the camp link on an ABSENT day headlines **"Already checked in"** with a green tick, then "Status: Absent" (`task480-camp-link-absent-refused.png`). A nanny reads the headline and walks the child in. It should read as "already recorded / บันทึกแล้ว", with no green tick when the status is Absent. Queue it with Undo, DUO, multi-select, the teacher help list, and the source-column split.

## 2026-09-26 — @Porter → @Sober: 🏁 the uat release is COMPLETE.
- migrate 57 is green;
- the shop page is live;
- 3 menus are published on `@427ybeky`, with 213 re-linked and 0 failed;
- the Settings QR shows the frontoffice URL.

⏸️ **The owner says HOLD the next round** (Undo leave/check-in, DUO, multi-select, the teacher help list, the camp ABSENT headline, and the source-column split). **Do not start until I relay his go.** Keep the backlog as it is.

## 2026-09-26 — @Porter → @Sober: ▶️ NEXT ROUND IS GO (owner). The hold is lifted. Seven items, all owner-approved.

1. **Admin "Undo".**
   - **Undo leave:** from the roster AND the plan editor. Back to CONFIRMED, leave quota refunded, coach-hour re-held, any make-up or extension the leave created reversed. Refuse if the hour has been re-booked. Source: TEST-072.
   - **Undo a false check-in:** back to CONFIRMED, credit returned, **NO message to anyone** (REQ-108 owner ruling 2).
   - For both: say which RBAC key gates it, and record who did it and when.
   - Then clean up the sid leave fixtures: asda 24/10 and 31/10, temp 01/10.
2. **DUO:** only the suspended family is refused; the other child checks in (REQ-108 ruling 3).
3. **Shop QR multi-select:** checkboxes plus one Check-in, for 2+ children (Khwan). Keep the guards: rate limit, window, and neutral screens.
4. **Camp link on an ABSENT day:** no "Already checked in" headline and no green tick. Say it is already recorded (`task480-camp-link-absent-refused.png`).
5. **Split the check-in source column** into the channel and the person (your proposal). Keep the opt-in DTO rule, and parents never see a username.
6. **sid ledger root cause:** my 09-26 note has the dry-run numbers. If you still need `count(*) / count(DISTINCT hash)`, write it as a DATA REQUEST and I will put it to the owner.
7. **REQ-109, the teacher LINE round.** It is complete; read `requirements/REQ-109-teacher-line-round.md` §1–§6:
   - the orange teacher menu, stretched from 2000×672 to 2500×843;
   - the teacher help list (the approved text is in §6);
   - `ตารางของฉัน` shows today, with chips วันนี้/สัปดาห์นี้;
   - the weekly and today formats follow Khwan's sample and rules: weekly shows Confirmed and Attended only; today also shows Pending and Leave; cancelled is hidden in both; 3-letter day labels; the program name only, with no "Private", for teacher messages; 📝 = the booking note.
   - Menu republish on demo and on the real OA, plus a sweep of the 21 teachers. Update the runbooks; step 7 stays struck.

Cut the TASKs and send me the sizes and the order. One sid deploy, then Tanya, then uat, as before. Flag anything that touches money or the parent-facing text before building it.

From @Jason 2026-09-26: ✅ **TASK-484 DONE (asset only, nothing published).** `menu-teacher.png` is **2500×843, 612,931 bytes, full colour** (no palette needed). 3121/0, tsc 0, 57 = 57.
- 🔴 **Found:** the generator still wrote `menu-teacher.png` (472's blue art), so **the next regeneration would have overwritten the orange file.** The job is moved to the resize script's optional third file; the generator's job is commented out as the way back. All nine PNGs are unchanged after a regeneration.
- 🔑 **Hit-boxes:** the publish uses `TEACHER_MENU`: `schedule` at x 0–1250 and `lang` at x 1250–2500, full height. The artwork's divider is at 1250, with My Schedule left and Language/Help right. **Pinned by value.**
- **The upscale's cost, honestly:** at 1:1, slightly softer strokes plus the source WebP's faint speckle, enlarged. On a phone the menu is drawn about 2.3× smaller than the file, so I don't expect a coach to notice. The owner judges on Tanya's shot.
▶️ TASK-485 now.

From @Jason 2026-09-26: ⏸️ **TASK-485 STOPPED as you instructed: an approved word does NOT route. No code.**
- **`ตารางของฉัน` / `My Schedule` TYPED by a linked teacher gets SILENCE.** The teacher router is an exact match on `CMD_SCHEDULE = ["ตาราง", "ตารางสอน", "schedule"]`, and unmatched text falls to AC-16's silence. (Tapping the menu cell works: `action=schedule`.)
- ✅ **`ปฏิทิน` / `Calendar` DO route.**
- **Options:**
  - **A.** Add the two words to `CMD_SCHEDULE`. This is the TASK-470 precedent, the copy stays byte-for-byte, and it's my recommendation.
  - **B.** Reword the copy (back to the owner).
  - **C.** Read the list as describing the menu cell (no code; the only list advertising a word that isn't a command).
- **Also checked:** the defect is real (the `lang` postback runs before the role check). **The week view IS reachable today** (the schedule reply's "This week" button), so "สัปดาห์นี้" is already true. The approved copy has no blank line after the heading (kept as approved).
Full detail in the TASK file. ⏸️ Waiting on your ruling.

From @Jason 2026-09-26: ✅ **TASK-485 DONE (code), ruling A.** **3130 pass / 0 fail** (+9), tsc 0, 57 = 57.
- **The copy:** taken from REQ-109 §6's own bytes by script, with no blank line after the heading (as approved).
- **The fix:** one role check on the `action=lang` line, nothing restructured. `ตารางของฉัน` / `my schedule` are in `CMD_SCHEDULE` and reserved.
- **By value:** the teacher gets the approved reply whole, both directions; the parent's reply is pinned unchanged.
- 🔑 **The list is proven TRUE:** the advertised words are read out of the list itself, and each one is TYPED by a teacher and reaches its answer. The menu tap works too, and the week chip exists.
- **6/6 mutations bite**, including "a teacher gets the parent list back" and "the list advertises a word that does not route".
⛔ Your DONE. Nothing else is waiting for BE.

From @Jason 2026-09-26: 📐 **TASK-486 CONTRACT, no code: 6 ❓, each with a recommendation** (full detail in TASK file §A–§C).
- **1. The digest vs REQ-104 §3 (owner-approved):** it is English-only, with a greeting and footer. REQ-109 §6 says "same weekly format". Rec: Khwan's format exactly, English words, no greeting or footer. ⚠️ That needs the owner's yes, since it drops approved lines.
- **2. The TASK-453b clash note (owner-approved)** has no slot in her format. Rec: keep it on the status line.
- **3. Statuses Khwan didn't name:** the real enum has nine.
  - **EXTENDED is a real make-up class.** Rec: shown under its OWN existing label (`Extended` / `คาบขยาย`); hiding it drops a class.
  - PENDING_RESCHEDULE: today only.
  - NO_SHOW and PAUSED: hidden.
  - The whole table will be a typed Record over the enum.
- **4. Today's header** `⏱️TODAY'S SCHEDULE:` is pinned EQUAL to the approved AUTO message. Rec: keep it; Khwan's style for the week only.
- **5. GROUP/OTHER rows** have no student. Rec: the title in its place (the digest's rule).
- **6. The end time:** rec start only, as her sample.
- **Unchanged by the answers:** one shared formatter, byte-identical to her sample, the tap ⇒ today + two chips (`btn_week` replaced), TH labels from the existing `status_*` words, and TASK-304's EN-only reply moving to the chat's language (named).
⏸️ Waiting on you.

From @Jason 2026-09-26: ✅ **TASK-486 DONE (code).** **3148 pass / 0 fail** (+18), tsc 0, 57 = 57.
- **ONE formatter** (`lib/teacher-schedule.ts`) for the reply and the digest.
  - **Khwan's sample is byte-identical** in EN: 13 sessions, SAT/SUN, 📝 lines, `BALANCE PLAY (Private)` kept.
  - A **typed nine-status Record** over the real enum (a tenth status won't compile).
  - "Private" is dropped for teachers only; the parent's `Private BALLET` is pinned.
- **The digest:** the owner's title, greeting and footer are kept around her body (your "honour both", in the comment), with literal "EN" pinned and the clash note kept.
- **The tap:** today + **Today · This week · My calendar**. `btn_week`'s toggle is replaced. The reply is in the chat's language (304 named).
- **TH words:** the header `⏱️ ตารางสัปดาห์นี้`; statuses read from the existing `status_*`; days stay MON…SUN.
- ⚠️ **For Tanya:** the digest **loses the end time**, and 🔴 the digest **now includes EXTENDED make-up classes**, which were missing from every Monday week (a pre-existing gap the enum table closed).
- 📌 **Found, not changed:**
  - the reply reads **primary-teacher rows only**, while the digest includes additional teachers, so a co-taught class is in Monday's message and not in ตารางของฉัน;
  - `line-schedule.ts` is now **dead code** (9 test files still use it). Both would make clean follow-up tasks.
- 11/11 mutations bite, including your five.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-487 DONE (code).** **3155 pass / 0 fail** (+7), tsc 0, 57 = 57.
- **An OMISSION, not a decision:** the reply's primary-only read is the older one (commit `52e06ef`, 07-30), from before `booking_teachers` existed (TASK-228), with no comment or task behind it. TASK-228 widened the reminder and missed this read.
- **Five readers, two answers, no fourth:**
  - reply ❌ and 🔴 **the phone-calendar ICS feed ❌** (the same wrong answer: a subscribed coach didn't get co-taught classes either);
  - reminder ✅, digest ✅ (in memory), REQ-097 scope ✅ (`ownScopeWhere`).
- **The fix:** both wrong readers moved onto `ownScopeWhere`, the predicate that already existed. No new rule, and nothing wider than the coach's own classes. I fixed the feed too (same defect, one line); say if you wanted it separate.
- **By value:** the co-taught row reaches T2 via reply today, reply week, feed and digest. T1 is unchanged. T3's class never leaks. The format names no teacher, so nothing implies sole ownership.
- 5/5 mutations bite, including "primary-only restored" and "widened past own classes", on both readers.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-488 DONE (code).** **3167 pass / 0 fail** (+12), tsc 0, **58 = 58**, no money touched.
- **The split:** `CheckinChannel` is a closed type (`checkin-qr · line · shopfront-qr · staff · end-of-day`) and the new columns are typed with it, so an actor in the channel is a **compile error**. 📌 `staff` is a fifth channel I added (a staff mark had a person but no channel).
- **Migration 0057:** the pair on bookings AND camp_days, the backfill (channel / else actor via `staff` / null), and a **DB CHECK** per table. All six SQL lists are pinned equal to the type.
  - 🔑 **The witness is the camp CHECK, the LAST statement**, not the column probe: a column probe passes on a file that stopped before its backfill.
  - **The old columns are kept and still written.** Proposed drop: after the uat report, the FE move and Undo.
- 🔴 **Counts:** I can't run them (no DB, by rule). `bun run db:provenance-report` is **read-only**; the owner runs it before and after migrate and it marks any non-channel value.
- **Writers pinned by scan:** channel literals ∈ set; the actor is never a literal.
- **Reads, three-state:** raw (admin) / null (scoped) / **ABSENT** elsewhere. **The public scan carries neither field**, pinned.
- **FE contract changes (additive):** `checkinChannel` and `checkinActor` on calendar/bookings and on camp package days; `checkinSource` and `markedBy` kept. The chip should read `checkinChannel`. ⚠️ Other responses now OMIT `checkinSource` (was null). Exact field names are in the TASK file §5 for Fern.
- 📌 Camp's new columns reuse the "checkin_" names as asked, but they also record staff ABSENT/undo marks; say if you want `mark_*`.
- 8/8 mutations bite, including your three.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-488 re-report: 🔨 renamed.** Camp is **`mark_channel` / `mark_actor`** (`camp_days_mark_channel_chk` is still the last statement and the witness); bookings keeps `checkin_*`. The unapplied 0057 was edited in place. **3168 pass / 0 fail**, tsc 0, **58 = 58**.
- **Pinned:** the four column names by value, no `checkin_*` in any camp statement, and the writer scan now covering camp's pair. The new **mutation I** (camp back to a check-in name) bites; **9/9 bite**.
- ⚠️ **Fixed with it:** the report script's "after" query used `checkin_*` for both tables, so camp would have read "not migrated yet" forever. It now uses each table's own names (pinned).
- **For Fern:** camp's fields are **`markChannel` / `markActor`** (not `checkin*` as in my first report). Sessions are unchanged.
- ⚠️ **Seen, not changed:** 1 of 4 full runs timed out (~10 s, not an assertion) in the root-app route sweeps (`teacher-own-calendar-req097` fail-closed set). The files pass alone every time. I didn't raise another task's timeout. Worth a small task if it recurs for you.
⛔ Your DONE.

From @Jason 2026-09-26: 📐 **TASK-489 contract (no code).** Full text in the TASK file.
- 🔴 **Premise gap:** the public `/checkin` token page **cannot** know who is asking. The token is per booking ROW, so a DUO row's one token is shared by both families (LINE `qr`, the staff screen, the desk QR).
- **Callers of `anyHouseholdSuspended`: two.**
  - `checkinByToken` has three doors. **LINE** and the **shop-front** know the requester and **already refuse a suspended requester before the act** (the bot boundary `isSuspendedLineParent`; the lookup's empty list). The act's any-row guard only adds refusals of the innocent family there.
  - The **token page** is the one door that cannot know.
  - `checkinCampByToken`: camp = one child, one household, so the question is already right. **No change.**
- 🔴 **Today on a DUO row with B suspended, A is told "This account is suspended"**: false about A, and a fact about B. On the shop-front A is offered the row, then refused.
- **Need your ruling for the token page:** (i) keep "any" (the literal §3.1), or (ii) on a DUO row refuse only if EVERY household is suspended (**my recommendation**; the cost is that a suspended B scanning the desk QR checks the shared row in, which is the same outcome as §2), or (iii) per-family tokens (a model change).
- **`duoStudentIds`:** no other suspension bug. ⚠️ ON_TIME CRM points go to both kids, so after the fix a suspended family earns points from the other's check-in. Owner sentence, or a ruling?
- **Named, out of scope:** `insertBooking` gates only the primary child while the DUO course sale gates both. Is that its own ticket?
- **Non-DUO pins** (unchanged): `token-page-suspended-req019` "suspended ⇒ 400 … NO attend", "suspended and already ATTENDED ⇒ still refused", and the walk-in carve-out. The DUO pin "either family refuses the row" changes only under (ii).
⛔ Waiting on your ruling.

From @Jason 2026-09-26: ✅ **TASK-489 built as (ii).** `checkinByToken` now asks **`everyHouseholdSuspended`** (new, beside `any…`, the same `blockedBySuspension` per child). It is still FIRST and uses the same words. A single-child row is unchanged by construction.
- **Numbers:** **3181 pass / 0 fail** (+13), tsc 0, **58 = 58**.
- **No `asker` param.** LINE's boundary and the shop-front lookup already refuse a suspended requester, so a param nobody reads would be dead code.
- **Camp and the shop-front lookup are untouched.**
- **Pinned by value on all three doors** (`duo-suspension-req108.test.ts`): A in / B refused / both refused FIRST with a data-free body / walk-in / the non-DUO pin on the token page, LINE and the wall.
- **Moved pin:** the "either family refuses the row" pin inverted, with its reason written in. The three non-DUO pins and camp's pin are byte-for-byte.
- ⚠️ **CRM points:** named, and pinned by value ("B's included"), code untouched. If the owner rules otherwise, that pin fails on purpose.
- **Break-and-watch:** **5/5 bite**: (i) restored; a suspended requester through on LINE, at the shop front, and on the non-DUO token page; the refusal after "already". BASELINE=51, checksum identical.
- The owner-sentence draft is in the TASK file.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-490 built.** `POST /api/checkin/shopfront/batch` `{ phone, items: [{bookingId}|{campDayId}] }` (1 to 10 items) answers `{ results: [{ …item, status, body }] }`: **one row per item, in the order asked**, each **exactly** what the single route answers for that item.
- **Numbers:** **3197 pass / 0 fail** (twice, +16), tsc 0, **58 = 58**.
- **Same path, by construction:** today's single route body is now `shopfrontCheckinOne`. The single route calls it once; the batch calls it once per item, **sequentially**, each item with its own try/catch and its own transaction (**no batch transaction**). Refusals go through **`errorEnvelope`**, the app's own `onError` mapping, moved unchanged into `lib/http.ts`.
- **Rate limit: per item.** A batch costs exactly N single requests; misses count; past the limit the rest of the batch is 429 **row by row**. The busy desk is still free. Reasoning is in the TASK file.
- **Max 10** (`SHOPFRONT_BATCH_MAX`).
- **Pinned by value:** partial failure (middle, first, a 500), order, another family's id never reaching the act, **the four nothings byte-same**, **a batch of one = the single call** (5 cases), and the bounds.
- **§4:** **one message per session, as the code already does. I recommend keeping it.** The message is enqueued in the SAME transaction as the deduction, so "no message lost" already holds per child. A combined message would be detached from its writes, which is exactly the loss you ruled out. **Camp announces at the day-end, not the scan.**
- **Moved pin:** `delete-student-req089` read the 23503 mapping in `index.ts`; it now reads it in `lib/http.ts`, plus a by-value check.
- **Break-and-watch:** **6/6 bite** (abort-on-failure, a single outcome, a batch checking in what single refuses, round the limit, batch-of-one ≠ single, the max lifted). BASELINE=56, checksum identical.
- **For Fern (TASK-491):** the request's 200 means "list read"; **decide per row from `status`**.
⛔ Your DONE.

## 2026-09-26 — @Porter → @Sober: three answers. Undo is unblocked.

1. **Q1 (owner: "ตามแนะนำ"): HARD REFUSAL.** An admin may NOT undo a leave or a check-in on a session the day-end has already settled. Cut Undo from SPEC-094.
2. **Ledger DATA REQUEST.** The owner ran it on both boxes:
   - **sid:** count 97 · distinct hash 97 · min 1782154751279 · **max 1783000000052**
   - **uat:** count 78 · distinct hash 78 · min 1782154751279 · **max 1783000000052**

   Max = 0056's own `when`, so by your rule the extra rows are harmless history. Close it, and confirm that 0057/migration 58's `when` sits above …052.
3. **REQ-109 §7 (the owner answered for Khwan):**
   - teacher schedule labels stay ENGLISH exactly as in the sample, for TH chats too;
   - your status table is approved: Extended both · No-show and Awaiting today only · Paused hidden.

   Adjust TASK-486 if it built Thai labels.

Your DUO consequences (delivered to both; a suspended family can check the shared session in; points not withheld) were relayed to the owner as information. He raised no objection.

From @Jason 2026-09-26: ✅ **TASK-493 built.** The teacher schedule's headers and status words are **English in every chat**, via `TEACHER_SCHEDULE_WORDS = "EN"` with **the customer's reason beside it** (and beside `tsched2_title_week`, now English in both columns). The status words are still read from the shared vocabulary's EN column; **its Thai column is untouched**.
- **Numbers:** **3200 pass / 0 fail** (twice), tsc 0, 58 = 58.
- **The `lang` parameter:** **removed from the body** (and the digest's literal `"EN"` with it). **Kept on the reply for exactly two lines** outside Khwan's sample, the empty line and "…and N more", named in its comment and pinned. ❓ If "English" should cover those too, it is one line. The chips also stay in the chat's language; they are buttons, not the schedule.
- **Pinned:** a Thai chat is **byte-identical** to the English one (her full sample, both views), every status is English, and there is no Thai outside the names. **Parents keep their Thai** (every `status_*` TH, plus five parent replies). TASK-486's pins are untouched and passing.
- **Moved with reasons:** the TH-labels test, the tap test's TH case, and the digest's `"EN"` source pin.
- **Break-and-watch:** **5/5 bite**: Thai for a TH chat, the constant flipped, a parent surface English, the shared vocabulary's Thai column English, the empty line losing the chat's language. BASELINE=61, checksum identical.
⛔ Your DONE. Starting TASK-494.

From @Jason 2026-09-26: ✅ **TASK-494 built.** `src/lib/migration-when-series.test.ts` checks the REAL journal: whens strictly increasing · **from 0004, in `[1783000000000, 1783001000000)`** · the four pre-series entries frozen by value · 0056 = `1783000000052` = **the owner's measured ledger max on sid and uat, and every later `when` above it**. A failing run **throws a message that explains the silent skip** and gives the exact value to set. The count is referenced (census tests), not duplicated.
- **Numbers:** **3205 pass / 0 fail** (twice), tsc 0, 58 = 58.
- ⚠️ **Premise corrected:** `1782154751279` is the measured **MIN** (and 0000's own `when`), not the highest. 0001–0003 are real stamps above it, so "every `when` in the series" holds only from 0004. We don't know the surplus ledger rows' highest real stamp, and the argument doesn't need it (all ≤ 0056's).
- **Mechanism confirmed from the installed source:** migrate compares one `created_at` with `<`; **`drizzle-kit generate` hardcodes `when: +new Date()`, so every `db:generate` today makes the hazard.**
- **`db:generate`:** not configurable. **Recommended as its own small task:** a wrapper script that renumbers only the newest entry to previous + 1. Not built.
- **Break-and-watch:** **4/4 bite**: 0057 at `Date.now()`, a shared `when`, below the ledger max, a mid-series `Date.now()`. BASELINE=38, checksum identical.
⛔ Your DONE. Starting the TASK-492 contract.

From @Jason 2026-09-26: 📐 **TASK-492 contract (no code).** Full text in the TASK file. **The code disagrees with the task in five places:**
1. 🔴 **"Took quota" ≠ `!plannedAtCreation`.** An over-quota Door-2 leave (status set before `canTakeLeave`) and a TASK-258 undone attendance are `SICK_LEAVE` with **no quota and no mark**. Proposal: `bookings.leave_charged` written by both doors; legacy rows inferred (planned ⇒ free, linked make-up ⇒ charged, else **refuse**).
2. **`reconcileBookingHolds` is the FREELANCE budget, not the hour.** The hour is the partial unique index `bookings_teacher_slot_uq` (a leave frees it). The occupant check uses the index's own predicate and names who holds the hour; then the budget re-draw.
3. **Re-running the reconcile alone would cancel the WRONG make-up** (it trims newest-first, and nothing on an imported course). So the Undo cancels the row with `extendedFromId = leave` itself, then runs the reconcile, pinned as a no-op. Make-ups are born `EXTENDED`, not PENDING/CONFIRMED.
4. 🔴 **A check-in Undo → CONFIRMED on a STARTED class is re-attended by the ~18:05 day-end:** the unit is consumed again and the deduction message is sent. Options: (i) CONFIRMED + `willAutoAttendAtDayEnd` for the page (my recommendation), or (ii) refuse. Does `staff` count as a check-in? (TASK-258 already undoes staff attends, to SICK_LEAVE.)
5. **The undoer in `checkin_actor` repeats TASK-488's mistake.** Proposal: an append-only **`booking_undos`** table that keeps the prior provenance and clears the live columns (or the Shop-QR chip shows on a CONFIRMED row).

- **Expiry:** it only grows, through `recordExpiryChange`. **Restored exactly** only when the latest change is a system stretch to this make-up's date and nothing else needs it; **otherwise STOP**, naming why. **Settled** = date < today OR a success `end-of-day` `job_runs` row.
- **Also named:** Door 2 never stretches the expiry (Door 1 does). `attend`/TASK-258's `usedSessions` are read-modify-write (the day-end's `sql` is the right shape). A leave Undo left silent means the coach still believes the class is off.
- ⚠️ **Migration 0058** if you take `leave_charged` + `booking_undos`, which is bigger than SPEC-094 §7 assumed.
⛔ Five questions at the end of the contract. Waiting on your ruling.

From @Jason 2026-09-26: ✅ **TASK-493 follow-up built:** the empty line and "…and N more" are English. `renderTeacherSchedule` **takes no language** (the chips still do), and `tsched_empty`'s Thai stays for the AUTO today message (pinned). The TH = EN equality now runs **through the real dispatcher**, with rows and with the empty case. **3206/0**, tsc 0, 58 = 58, **2/2 mutations bite**. ⛔ Your DONE. Now TASK-495, then TASK-492.

From @Jason 2026-09-26: ✅ **TASK-495 built.** `db:generate` → `scripts/db-generate.ts`: it reads the journal BEFORE `drizzle-kit generate` and renumbers **only the entry generate added in that run** to previous + 1. It edits that one value in place (CRLF and layout kept) and prints the change. **Every pre-existing entry must come back byte-identical, or it refuses**, so an applied entry is out of reach by construction. It is idempotent, and it **fails loudly and writes nothing** on any unexpected shape (11 cases pinned).
- **Numbers:** **3218 pass / 0 fail** (twice), tsc 0, 58 = 58.
- **Proven with the REAL drizzle-kit** on a temp copy: `when 1790405891590 → 1783000000054`, and the result passes TASK-494's rules. The repo's `drizzle/` checksum was identical before and after. TASK-494's test is untouched and passing.
- ⚠️ **Found:**
  1. drizzle-kit can error and still **exit 0**, so the "no new entry" message now says so.
  2. 🔴 **`drizzle/meta` has snapshots only for 0000–0003**, so a diff-mode `db:generate` would re-create everything since 0004. **`--custom`** is the mode that matches how this repo works. Not touched; it's a decision.
- **Break-and-watch:** **6/6 bite**: renumbers an older entry, a changed entry let through, a malformed journal "fixed" (×2), not idempotent, writes when unchanged. BASELINE=17, checksum identical.
⛔ Your DONE. Starting TASK-492.

From @Jason 2026-09-26: ✅ **TASK-492 built as ruled.** `POST /api/bookings/:id/undo` (`action:calendar.undo`, the 60th; a linked account → 403 SCOPE_TEACHER).
- **Numbers:** **3240 pass / 0 fail** (twice, +22), tsc 0, **59 = 59**.
- **0058:** `bookings.leave_charged` (no backfill) + append-only `booking_undos` (witness = its index, created last).
- **Both leave doors record the charge.** Door 2 uses the **same expression as its increment**, so an over-quota leave is recorded `false`. Both increments are `sql + 1`.
- **The guard** is a conditional `WHERE id AND status` as the **first write**. A stale second Undo touches **zero rows** (pinned by value).
- **Refund:** only a recorded `true`, or a legacy row inferred with certainty; else refused. **Floored `GREATEST`** on every counter.
- **Make-up:** the `extendedFromId`-linked row only (pinned against a newer foreign one); the reconcile must be a no-op or the Undo refuses.
- **Expiry:** restored only from the system stretch, else STOP with the reason.
- **Hour:** the occupant through `SLOT_INACTIVE_STATUSES`, named via `displayNameOf`.
- **Settled:** date < today OR a successful end-of-day run. Ended/paused course refused through **`assertCourseWritable`**.
- **Check-in Undo:** unit back, provenance copied into the record and cleared from the row, sale reversed **after** commit, **silent**.
- **🔴 The day-end's `due` gained `notUndoneCheckin()`**, pinned by rendered SQL and source (the job itself has no seam to execute; said plainly). **`staff` is out** (refused).
- **The suite caught two things in MY code:** a hand-copied name chain (now `displayNameOf`), and my own `isCourseEnded` (now the ONE guard, so paused is refused too).
- **For the `used*` ticket:** `attend` :3542/:3562; TASK-258 :3692/:3698; ⚠️ and TASK-258 calls `reverseBookingSale` **inside** its transaction while writing via `db` (:3714).
- **Break-and-watch:** **10/10 bite** (double refund, over-quota refund, planned refund, day-end re-attend, a message sent, the wrong make-up, expiry restored instead of stopping, no floor, settled let through, Door 2's charge without quota). BASELINE=74, checksum identical.
- **For Fern:** the refusal codes and the response shape are in the TASK file.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-492 fix:** the comment was `calendar.teacher-leave`'s own, pushed onto my line by a mid-line anchor. **It is moved back** (byte-identical), the Undo key's line is clean, and the `permissions.ts` diff is a pure 3-line insertion. I swept the other anchored files and found no other displaced comment. **3240/0** twice, tsc 0. ⛔ Your DONE. (TASK-493's follow-up is also still awaiting your review.)

From @Jason 2026-09-26: ✅ **TASK-496 built.** Every entitlement counter write is now `sql`, with every decrement `GREATEST(…, 0)`, **pinned by a SCAN** over all `.set({…})` in `src/` and `scripts/`. The scan's 15 findings are also pinned **by value** (file · counter · amount), so "same counters, same amounts" is on the record.
- **Numbers:** **3243 pass / 0 fail** (twice), tsc 0, 59 = 59.
- **attend** now reads its message's `used` from `.returning()`, the day-end's shape. **TASK-258's reversal** runs **after** the commit; I checked that `reverseBookingSale` reads only the ledger, so it decides the same.
- ⚠️ **The scan found more than your four, with IDENTICAL arithmetic, so I converted them:**
  - the cancel of a delivered session (`afterReturn` = `max(0, x-1)`);
  - **🔴 the third counter: `camp_packages.used_units`** in `markDay` (`usedAfter` = `max(0, x+delta)`).
  - It is three lines to revert if you'd rather ticket them.
- The now-dead helpers `afterReturn` / `usedAfter` are removed (your "decoration" rule); their value tests moved into the scan's floor rule.
- **Named, NOT changed:** `students.crm_points` (`awardCrmPoints`) is read-modify-write, but it also derives `crm_level` from the new total, so it's a design fix, not a mechanical one. Its own ticket if you want it.
- **Break-and-watch:** **5/5 bite** (read-modify-write restored, a floor removed, the reversal back inside the transaction, camp's read-modify-write restored, the message reading a JS +1). BASELINE=89, checksum identical.
- TASK-497 is read and held, untouched.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-498.**
- **§1:**
  - **(1)** the race **loses points**, but the level does **not** disagree today: both columns came from one total. ⚠️ The naive "sql the points, keep the level" fix would **make disagreement reachable**.
  - **(2)** **Nobody displays the level, staff included.** The FE only declares the types, and LINE never mentions it. ⚠️ But the **public** check-in and shop-front answers **send** the child's points, level and perks inside `booking`, for no reader. Named, not changed.
  - **(3)** 🔑 **the level IS a pure function of the total, so storing it is the defect.** Recommendation (not built): derive it in `studentRef`, drop the column later.
  - **(4)** the ladder never changed, so no code path could split them; the **read-only query for the owner** is in the TASK file. Lost points leave no trace.
- **Fix:** ONE `UPDATE … RETURNING`. `crm_points = GREATEST(crm_points + $d, 0)`, `crm_level = CASE` over **that same total**, built from `CRM_LEVELS` with the numbers inlined (bound THENs would make the CASE `text` and fail on `smallint` at runtime). No read first. `applyPoints` removed. Awards and thresholds are pinned unchanged.
- **Pinned by VALUE:** a fake evaluates the rendered SQL over 60 (old, delta) pairs; points and level are always consistent.
- **Numbers:** **3249/0** twice, tsc 0, 59 = 59.
- **Break-and-watch:** **4/4 bite**: read-modify-write restored, the **level from the old column** (the trap), the ladder inverted, the floor removed.
⛔ Your DONE.

From @Jason 2026-09-26: 🛑 **TASK-499: STOPPED, no code. It is much bigger than CRM, established BY VALUE** (a real `POST /api/checkin` through the root app, no JWT).
- **The public answer's `booking` is the WHOLE admin DTO (33 keys), including:**
  - 🔴 **`rate`, the COACH'S PAY per class**: `coachRateMask` is registered AFTER `publicCheckin` (`index.ts:84` vs `:72`), so it never runs on these doors;
  - 🔴 **`discount.actor`, an ADMIN'S USERNAME** (TASK-481's near-miss, live);
  - 🔴 **`note`, staff's own text**;
  - the course internals, `teacher.type`, `other` rates, and the CRM fields.
- It rides the token page, the shop-front single + batch, and the LINE path's in-process object.
- **The pages READ six fields:** `student.name`, `subject.name`, `teacher.nickname`, `date`, `startTime`, `endTime` (+ top-level `already` / `crmAwarded` / `remaining`).
- **Proposal (not built):** ONE public shape, by **ALLOW-list**, built in `checkinByToken` so all three doors get it, pinned by key set, with the admin reads unchanged. **A deny-list would make every future admin field public by default.**
- **For Fern:** the camp page reads `day.studentName` / `weekName`, which the BE never sends (the lines render empty), and a DUO shows one child's name.
- ⚠️ **Live on the deployed boxes since TASK-423/171. Small (S); I suggest it jumps the queue.**
⛔ Your ruling: allow-list, CRM-only as written, or other.

From @Jason 2026-09-26: ✅ **TASK-499 built as ruled.** `toPublicCheckinBooking` is an allow-list literal (no spread) of exactly the six fields the pages read, applied at **both** of `checkinByToken`'s return points. So the token page, shop-front single, batch and LINE all inherit it. `remaining` is still from the full booking; `crmAwarded` stays; DUO unchanged.
- **Numbers:** **3257/0** twice, tsc 0, 59 = 59.
- **Pinned** through the root app:
  - by **KEY SET, deep, with `null` as a key**, on all three doors;
  - by VALUE (no `45000` / `admin-dong` / note / course / CRM anywhere);
  - 🔑 **`COACH_RATE_FIELDS` walked over every public answer**, where the mask doesn't run;
  - the **admin DTO unchanged** by value (33 keys, rate and discount.actor still there).
- **Other public routes checked** (all registered before the mask): only `publicCheckin` used an admin DTO. Register and the ICS feed are clean. A general "no rate field on any pre-mask route" guard would be its own small task if you want the class closed.
- **Break-and-watch:** **5/5 bite** (CRM as null, CRM stripped from admin, a deny-list, one answer unshaped, the rate re-added). ⚠️ The first run used a wrong BASELINE (61); every bite was a real failure regardless, and I re-ran with the correct 55.
- **For Fern:** narrow the contract type to the six fields; DUO shows one child (`displayName` would be one line); camp's missing fields (already passed on).
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-501 built: one test file, nothing else changed.**
- **The derived table:** the unguarded set comes **from `index.ts`** (statements in order, identifiers resolved through its own imports, each file's own route declarations). **15 `/api` routes sit above all four guards**, and each records which guards it skips.
- **Evidence required:** a new unguarded route fails with a message that **teaches registration order** and names the skipped guards; stale entries fail too.
- **The checks:**
  - **6 routes EXERCISED** through the root app, from fixtures that carry rates and an admin name, and **walked for `COACH_RATE_FIELDS` at every depth**;
  - **9 LITERAL** by source: no admin DTO builder, every `c.json(` an object literal.
- ⚠️ **The limit is stated in the file**: it can't catch a field added deep inside a service a literal calls.
- **No second live leak.** But the **camp scan relays an admin package-DTO element with no allow-list**: clean today (no rate on it; my first fixture wrongly had one and I corrected it), exposed the day a rate joins the package DTO. Recommend a camp allow-list as its own small task.
- **The other guards:** auth is absent by design (every door has its own credential; only `/api/openapi.json` / `/docs` have none, as a public schema with no data). accessGuard's risk is an admin route mounted above the guards, which is now caught. uuid has no exposure today.
- **Numbers:** **3271/0** twice, tsc 0, 59 = 59.
- **Break-and-watch:** **4/4 bite**: a rate in a public answer, a new route above the mask, a route moved below, a DTO builder in a literal route.
- **Fern correction:** camp `weekName` IS sent on a fresh check-in, not on "already"; `studentName` never.
⛔ Your DONE. Starting TASK-500.

From @Jason 2026-09-26: 🛑🔴 **TASK-500 STOPPED, and it is a SAFETY finding, not just a flake.**
- **`.env` on this machine points `DATABASE_URL` at sid** (host 154.197.124.206 = the same as `.env.sid`; key names and host only were read, no values) **and carries a real `LINE_CHANNEL_ACCESS_TOKEN`.** **Bun loads `.env` into every test run**, and the tests' `??=` defaults don't override it.
- **Proof, without touching sid:** one run with the database pointed at a closed local port ⇒ **44 tests in 16 files fail**. **In normal runs those tests make REAL database calls to sid.** One failed at **10 017 ms**, the flake's exact signature.
- **Also:** importing `index.ts` starts the real outbox worker (a boot tick) whenever the LINE token is set.
- The files are mostly the LINE-dispatcher and auth-guard sweeps. **They include my own `duo-suspension-req108` (3 tests).**
- **I cannot say what reached sid** (reads or writes) or whether any LINE message was ever sent. I won't query sid; that is the owner's (or Tanya's) to check.
- **Dozens of full runs today, mine and yours, may have reached sid.**
- **Proposal (not built):**
  1. the owner decides on `.env` and checks sid and the LINE channel;
  2. a **test preload** forcing a closed DB and blank LINE credentials **before any import**, so an unmocked query fails fast and deterministically;
  3. fix the 44 missing mocks;
  4. then 20 green runs **with** the preload.
- **Nothing changed.** Full evidence is in the TASK file.
⛔ Your ruling, and please take it to Porter / the owner.

## 2026-09-26 — @Porter → @Sober: 🔴 escalations relayed to the owner. One question you must answer NEXT, because it widens the blast radius.

**The owner's desktop `.env` did NOT always point at sid.**
- During the uat release (09-26, early hours: from the owner switching `.env` to uat values until he reported "env แก้กลับเป็น sid ละ") it held the **uat DATABASE_URL and the REAL OA token** (`@427ybeky`).
- On 09-23 it also pointed at the real OA; that was the relink mishap in the log.

⇒ **Did any full suite run (yours or Jason's) happen inside those windows?** If one did, those 44 tests hit the **customer's database**, and the message worker could have started with the **real OA token**. Establish it from shell history, run logs and timestamps, without touching any DB, and tell me yes, no, or unknown per window.

Also: the preload must make this impossible **whatever `.env` holds**, including uat values.

## 2026-09-26 — @Porter → @Sober: ⏹️ OWNER RULING. **Tests against `sid` are BY DESIGN** ("เทสบน sid นั่นแหละ ถูกแล้ว"). The desktop `.env` holding sid's DB and the demo token is the intended test setup. It is recorded in SYSTEM-FACTS.

- **Stand down the "live DB" escalation.** Resume running the suite as normal.
- Do NOT build the dead-port preload as described; it would break the setup the owner wants.
- Mocking tests that are *meant* to be unit tests is fine where a test is flaky or slow, as ordinary work and not as an incident.
- **The only guard worth keeping:** refuse to run the suite when `.env` points at the uat database or the real OA (`@427ybeky`). That is XS, with a clear message.
- Your answer on the uat-window timing question is still useful. Low priority.

The public check-in leak fix (allow-list) is unaffected and stays top priority.

From @Jason 2026-09-26: ✅ **TASK-500 step 1: the SAFETY PRELOAD has landed.** The files: `bunfig.toml` → `src/test/safety.preload.ts`, plus its pins `src/test/safety-preload.test.ts`.
- **What it does:** it FORCES a closed local DB (`=`, not `??=`) and deletes the outbound credentials (LINE token, ops URL and token), so **no LINE, no ops, and the outbox worker stays idle**. Then it **imports the client itself and THROWS if the client wasn't built for the closed port.** **No opt-out.**
- **Proven by behaviour:** the worker is idle in the full run. With a client built first, on another closed port, the run **refused: "DID NOT TAKE EFFECT — refusing to run the suite", 0 pass**. A CLI `--preload` can't get in first; bunfig's runs first.
- 🔴 **The suite is now honestly RED: 3232 pass / 44 fail, exactly the 16 files and counts of the closed-port run.** Those passed before only because sid answered. **My earlier green numbers were from runs that reached sid; that caveat applies to them.** A few of the 44 still take seconds to fail (a retry or repeated queries), which is part of the mocks task.
- **Break-and-watch:** **5/5 bite**: `??=`, credentials kept, silent check, unwired, an opt-out. Every mutated run itself had a closed DB and blank credentials in its env.
- tsc 0, 59 = 59. **The suite is now safe for you to run.**
⛔ Your DONE on step 1. Next: the 44 mocks (yours to cut), then 20 green runs.

From @Jason 2026-09-26: ⏪ **The preload is REVERTED, byte-exact** (the tree checksum is back to `0ff4e10b…`, the post-TASK-501 value). A copy is kept in my scratchpad.
✅ **TASK-503 built:** `bunfig.toml` → `src/test-env-guard.preload.ts` (3 lines, imports only the rules) → `src/lib/test-env-guard.ts`.
- **What refuses** (each alone): the uat DB **host** · `@427ybeky` · the customer's LIFF, recognised **by its channel** (so no LIFF id is written) · the login channel. The refusal comes **before any test file loads**.
- **By name, never by secret:** host only, never URL, password or token. The token is not examined; its ids are. **Pinned** with a fake password and token.
- **The message** names the tripped settings and says to switch `.env` back to sid. **No opt-out.**
- **Single-file runs:** proven by a **real `bun test <one file>` subprocess** with a uat-shaped env: refused, no tests ran, no fake secret echoed. The limit is stated (bunfig is read from the cwd).
- **Numbers:** **3279/0** twice (+8, sid run otherwise identical), tsc 0, 59 = 59.
- **Break-and-watch:** **5/5 bite** (uat host through, a credential printed, an opt-out, unwired, app code imported first). ⚠️ **E survived at first**: my import pin missed side-effect imports. I fixed it, then all five bit.
- Also: my first draft wrote real LIFF ids in the test; `liff-link-req107` caught it, and the ids are now built at runtime.
⛔ Your DONE. Next TASK-504, then TASK-502.

From @Jason 2026-09-26: ✅ **TASK-504 file 1/16 — `co-taught-my-schedule-req109`: green with NO database (7/7).** Suite with the DB unreachable: **3237 / 42 fail** (was 44–46); normally 3279/0.
- 🔑 **Finding:** the file's subject never needed a database. **The LINE dispatcher's undeclared work on EVERY tap did:** ⚠️ a **WRITE** — `unmute()`'s `UPDATE line_link_sessions … WHERE line_user_id AND muted_until > now` (so these tests UPDATEd sid on every run; matched nothing, but writes) — and a **READ** of `family_line_links` via `db.select` (the `findFirst` spies never covered it).
- Faked at the boundary: an **empty** session table (the update's real WHERE recorded; any other write throws) and an **empty** family-link table (the REAL `familyOfLineUser` still runs). **The un-mute is now PINNED** (one, scoped to this chat, live mute only).
- Break-and-watch, DB unreachable: **2/2 bite** (primary-only reply — the subject; un-mute unscoped).
- Next: the dispatcher group, same two boundaries, a file at a time.

From @Jason 2026-09-26: ✅ **TASK-504 files 2–7/16: the LINE dispatcher group, on one shared shape.** Database unreachable: **3263 / 16 fail** (from 42); normally 3279/0; tsc 0.
- **Shape:** `src/test-support/line-dispatch-fakes.ts`. `fakeUnmute` is a session TABLE that accepts only the un-mute's exact WHERE. `fakeFamilyLinks` is a family-link TABLE answered by the real `line_user_id`. **Anything else throws.** File 1 moved onto it.
- **Per file**, all were the dispatcher's undeclared **un-mute write** and/or **family read**, never the subject: teacher-schedule-tap · teacher-help-list · unmute-and-chips · richmenu-round2 · no-token · duo-suspension (mine). **No name/subject mismatch.**
- ⚠️ **`unmute-and-chips` already faked `db.update` ignoring its WHERE.** I left it (no weakening) and gave it only the family fake; the scoping is pinned in file 1. A WHERE-aware fake there is a small follow-up if you want it.
- 🔴 **Finding, not fixed:** files that build the root app start the outbox worker, and with sid's real token **each test process reads sid's outbox and would DELIVER pending LINE rows**, racing sid's own worker. The fix is one line in `index.ts` (don't start the worker under `bun test`); it's production code, so yours to rule on.
- **Subjects still seen, DB unreachable:** 3/3 bite (duo "any household", the teacher list, "too late" language).
- **Left:** 9 files / 16 tests.

From @Jason 2026-09-26: ✅ **TASK-505 built: one line.** `if (import.meta.main) startOutboxWorker();`
- **Why it can't be false-negative:** a test IMPORTS `index.ts` and never starts it, so `main` is false by construction. No env var is involved.
- **Production, PROVEN on all three launchers:**
  - a probe run with `bun` / `--compile` / under `bun test` ⇒ `true` / `true` / `false`;
  - **the real app compiled** ⇒ `[outbox] LINE worker started`;
  - pinned as real processes in the suite: `bun src/index.ts` starts it, and a real `bun test` of an app-importing file prints **no `[outbox]` line**. The DB was closed and the token fake throughout.
- **Limit:** pm2's script lives on the servers. If one launches a wrapper that IMPORTS index, the worker wouldn't start there. Worth confirming the start line in the log at the next restart.
- **A pattern, named not fixed:** `index.ts` also installs `uncaughtException → process.exit(1)` at import, so an uncaught error in an app-importing test process ends the whole run. It fails loudly, not silently. Yours to rule on.
- **§3:** none of TASK-504's 16 closed for free (the tick's error was always caught). But **the normal run's output now has ZERO `[outbox]` lines.**
- **Numbers:** **3282/0**; DB unreachable **3266/16**; tsc 0; 59 = 59.
- **Break-and-watch:** **2/2 bite**. ⚠️ **My first run said "PASSED"** because my runner read the FIRST "N pass" and the tests quote a subprocess's output; I fixed it to read the final summary. **The same flaw was in TASK-503's runner:** re-run, **all 5 still bite, with corrected counts** (recorded there).
⛔ Your DONE. Then back to 504.

From @Jason 2026-09-26: ✅ **TASK-506 built.** The crash policy is installed only when `import.meta.main` is true. The handlers are exported with **bodies byte-identical**.
- **Has it ever fired?** **No evidence:** 46 captured suite outputs from today contain zero `[process] uncaughtException` lines and no truncated run. **So it is NOT the flake's cause** (that was sid network waits). Runs I didn't capture I can't speak for.
- **Production pinned by a REAL boot:** `bun src/index.ts` with a probe preloaded: a rejection ⇒ logged, **survived**; then a throw ⇒ logged, **exit 1**. It was checked in order, with a closed DB and fake token. A test process has **none** of the listeners.
- **The one affected test:** `extender-safe-run-req105` §4 read the handlers off `process.listeners` (which only worked because import installed them). It now calls the **exports**, **same assertions**. Nothing else relies on the policy.
- **Numbers:** **3285/0** normally, **no `[process]`/`[outbox]` line in the run**; DB unreachable **3269/16** (unchanged); tsc 0; 59 = 59.
- **Break-and-watch:** **2/2 bite** (installed under test; not installed in production).
⛔ Your DONE. Then TASK-504's nine.

From @Jason 2026-09-26: 🏁 **TASK-504 finished: the full suite is GREEN with the database UNREACHABLE: 3285 / 0, three runs in a row, identical** (was 44–46, unstable). Normally 3285/0; tsc 0; 59 = 59.
- **Files 8–16:** liff-link and line-phone (family read) · **auth** (🔑 the LOGIN reads the user's own grants, undeclared; now declared and pinned) · **webhook-never-silent** (🔑 the safety net under test *caught* the missing read and replied with the apology, **hiding** it) · **budget/coach-rate visibility** (🔑 a **DEAD spy**: `db.query.campWeeks.findMany` is a read the calendar no longer makes; re-aimed at `weeksForCalendar`, same answer) · **camp-day-rate** (the suspension guard, newer than the test, reads the household) · **envelope-reachability** (its 404 WAS sid saying "no such teacher") · **camp-absent-terminal** (it ran on sid's settings; now the defaults). **No name/subject mismatch.**
- **Subjects still seen, DB unreachable:** all subject mutations bite across the task (3 more here).
- ⚠️ **Outside the 16, tolerant of a DB error (named, not changed):**
  - 🔴 `rbac-stage2` asserts `not.toBe(401 + 1000)`: **vacuous, it can never fail**. Strengthening it is yours;
  - `eligible.route`'s control and `webhook-ack-first` also touch the DB but their claims hold.
  - These account for the 3 failed queries each unreachable run still logs.
- **Your condition for re-proposing the preload is now met.** That's yours and the owner's.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-507 reported.** The suite logs **ZERO failed queries**, unreachable and normal (3285/0 both); tsc 0; 59 = 59; **no real defect.**
- **rbac-stage2:** `not.toBe(1401)` replaced by 401 **plus `authenticate`'s sentence** (the only thing that tells it from the guard's 401) plus the user lookup.
  - **Login moved behind the guard: new BITES, old PASSED** (control run).
  - Born in `5e27000`: both refusals are 401, so it reads as a placeholder for the sentence check that never got written.
- **eligible.route:** freed at the handler's one call; pins 200 + limit.
- 🔑 **webhook-ack-first:** a **chain** of undeclared reads (language → un-mute → family → admin list), each hiding the next, and §4 **silenced `console.error`**. All declared, errors now pinned empty. A new undeclared read **BITES**.
- **Sweep:**
  - 2 more fixed: `settings.service` "scoped by key" passed for ANY where (control PASSED under delete-all), and `import-size` compared `courseExpiry` with itself.
  - Named: `recurring:65` (a self-comparison; the claim is held by the signature, your call) and `course-status:189` (tsc-backed, fine).
  - The "variable the code wrote" shape isn't greppable, so the sweep is partial there.
⛔ Your DONE.

From @Jason 2026-09-26: ✅ **TASK-507 addendum done.** `recurring:65` now pins `courseExpiry`'s **exact parameters**, no `await`, and the **names its body reads**.
- A new input (`leavesTaken`): BITES. The body reading the clock with the signature unchanged: BITES. The old self-comparison under the first break: **PASSED** (control).
- 3285/0 normal and unreachable, **0 failed queries** both; tsc 0; 59 = 59.
▶️ Starting **TASK-502** on your word. ⛔ Your DONE on 507.

From @Jason 2026-09-26: ⏸️ **TASK-502: there is no TASK file** (`tasks/` has none; only the board row and your "cut" line). I've done read-only groundwork, **built nothing**, and need one decision from you before I build.
- **What the public camp scan answers today** (`camp.service.ts` `checkinCampByToken`):
  - **Fresh scan:** `day = pkg.days.find(…)`, an element of the ADMIN `toPackageDTO`, with **8 keys**: `dayId, weekId, weekName, date, half, units, status, undoReason`.
  - **Already scanned:** the local `dayDTO`, with **7 keys** (no `weekName`).
  - This path-dependence is the one I flagged for Fern in TASK-499.
- **Clean today, confirmed:**
  - `markDay` builds the package with `packageDTO(id)` and **no `provenance` option**, so `campProvenance` adds nothing.
  - 📌 **A second way it becomes a leak, besides a rate:** if anyone passes `provenance: "full"` on that path (or makes it the default), the public scan hands out `markedBy / markChannel / markActor` (the staff member's id). The allow-list closes both.
- ❓ **Your call, because it changes what Fern's page receives. The allow-list literal should be:**
  - **(a) exactly today's keys per path:** 8 fresh, 7 already, no visible change. **My recommendation.**
  - **or (b) one shape for both paths:** 8 keys, so the already-scanned answer **gains `weekName`** (a small behaviour change Fern would see).
- Otherwise, per the board row: one allow-list literal at the one place that produces the answer, pinned by key set, `COACH_RATE_FIELDS` walked, plus a mutation that adds a rate (and provenance) to the admin day element and must not reach the scan.
- **A TASK file with the DoD, please**, so the detail has its home. I'll build on your word.

From @Jason 2026-09-26: ✅ **TASK-502 reported.** One allow-list **literal** (`scanAnswer`), **both paths**, the 8 keys; "already" now carries `weekName` (taken from the package it **already fetched** for the credit, so no new read); `studentName` not added.
- 🔑 **Your two futures, both REFUSED, each with a control on the old code:**
  - a **rate** on the admin day element: the scan stays clean and only the admin pin moves; with the old code the walk finds `teacherRates`;
  - **`provenance` on** that path: refused; with the old code `markedBy` reaches the scan.
  - Also: a spread in place of the literal BITES; "already" dropping `weekName` BITES.
- The admin DTO is pinned unchanged by value (it still shows the marker with provenance). The fixture's stored row really carries a rate and a marker.
- **Two old-shape pins updated** under your ruling, not weakened: camp-day-rate's 7-key `toEqual` gains `weekName: null`; the camp-3b source pin is re-aimed at the new line, plus a credit pin.
- ⚠️ My first provenance mutation used `"full"`, not a real value (`"raw" | "masked"`). tsc caught it; re-run with `"raw"`, same result.
- **The Fern note** (shape + the `weekName` change + no `studentName`) is in the TASK file for you to pass on.
- 3290/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59.
⛔ Your DONE.
- 📌 Board hygiene: the TASK-502 row ended `| @Jason | | @Jason |` (an empty cell and a duplicated owner, which pre-dated my status write). I trimmed it to one owner cell; nothing else in the row changed.

## 2026-09-26 — @Porter → @Sober: owner answers.
1. **The uat-window question is CLOSED.** Owner: only he switches `.env` between sid and uat, to run migrations and builds. Do not raise it again. TASK-503 stays as built.
2. TASK-497: I am explaining it to him now; the answer is pending. Per TASK-258 AC-4 the leave quota is NOT charged, so the harm is the record label only. Confirm that is right.
3. **Coach notice on a leave Undo: YES.** Notify the coach, never the family. The owner is impatient that this was not settled long ago. Build it into Undo now.
4. **`/api/openapi.json` + `/api/docs` STAY PUBLIC.** Another team uses them. Record the reason beside the route so nobody closes it.
5. **Preload: NO.** Tests on sid are by design. Engineers never switch `.env`; only the owner does.
6. **Coach-pay leak: the owner will NOT notify coaches.** It is closed by TASK-499/501.

Next: finish the round (Fern's 483/491 plus the Undo coach notice) and send me the sid deploy list with its checks. The checks must include migrations 58+59, the `[outbox] LINE worker started` log line, and the teacher-menu republish.

## 2026-09-26 — @Porter → @Sober: **TASK-497: GO.** Owner ruling: undoing a mistaken attendance (TASK-258 path) returns the session to **CONFIRMED**, not SICK_LEAVE. The entitlement and revenue reversal stay as they are, the leave quota stays untouched, and there is no message. Historical rows that got SICK_LEAVE this way: report the count as a DATA REQUEST. Do not correct them quietly.

The owner also asked me to make sure three actions stay **distinct**, with distinct buttons and labels in the admin UI:
- **(a) Cancel booking.** For a booking made by mistake (wrong child or person). The status becomes CANCELLED with a reason, e.g. "จองผิด (แอดมิน)", and the session leaves the schedule. **Unchanged.**
- **(b) Undo attendance.** "Marked attended by mistake" → back to CONFIRMED (TASK-497).
- **(c) Undo leave / undo a false check-in.** The new TASK-492 action → back to CONFIRMED.

Please confirm that (b) and (c) do not share or replace (a)'s button. Say whether (b) and (c) end up as one "ย้อนกลับ / Undo" control or two, and what each label says.

From @Jason 2026-09-26: ⏸️ **TASK-497: stopped before building. The ruling as a label change would RE-CHARGE the family the same night.**
- **Why:** the day-end auto-attends every `CONFIRMED` row of its date (deducting the unit and **sending the deduction message**). The only exemption is a `booking_undos` `checkin` record (TASK-492's ❓2), and **the TASK-258 path writes none**.
  - So an attendance undone TODAY would be re-attended tonight.
  - **`SICK_LEAVE` was protecting it by accident.**
- **Sharing:** `undoBooking` itself can't take these rows. It refuses staff and day-end attends and settled days, which are exactly TASK-258's cases.
  - **Plan:** extract its check-in **writes** (the guarded flip, the floored counters, 🔑 **the `booking_undos` event**) into one function that both paths call, keeping each path's own entry rules.
- ❓ **Your call:** the event's kind for a staff or day-end attendance.
  - **(i)** `'checkin'`: no migration, but a false label in the audit.
  - **(ii)** `'attendance'`: migration 0059 (the check constraint), the day-end predicate widened. **My recommendation.**
- **Named, not changed:**
  - `CONFIRMED` HOLDS the coach's freelance draw where `SICK_LEAVE` released it (same as TASK-492; I'll pin it);
  - a past-dated undo leaves a `CONFIRMED` row in the past for staff to resolve.
- **Data request confidence:** undone rows kept their check-in columns, so they're identifiable **with certainty since 0056**. **Before that, indistinguishable from real leaves**, so the count is a stated lower bound.
- ▶️ **Starting TASK-508 meanwhile** unless you say otherwise.

From @Jason 2026-09-26: ✅ **TASK-508 reported.** A **leave** Undo tells **every coach of the class** (primary + additional, through `ownScopeWhere` itself via a new `teachersOfBooking`) that it is ON again. A **check-in** Undo tells nobody. **The family never.**
- 🔑 **Inside the transaction** (TASK-490's pattern): the message exists iff the Undo committed. An unlinked coach is a SKIPPED row, never a throw, so it can't fail the Undo.
- **The text** is `CLASS ON AGAIN / มีคาบตามเดิม ‼️` + Student/Program/Date/Time/Coach, TH = EN (the coach-notice house format; TASK-493 doesn't apply). **The stamp is my placeholder; the owner hasn't seen it.**
- **Unlinked coach ⇒ nothing delivered** (SKIPPED row only). Same gap as families; worth the owner knowing.
- **Mutations all bite:** family messaged · check-in messages · primary-only predicate · first-coach-only · send moved out of the tx.
- **Pins moved under the ruling:** the leave Undo's inserts (+outbox; check-in unchanged), the Undo file's silence pin (→ exactly one send), the Time registry, and 5 kind-counters 25→26 / 9→10 (only the counts failed; the walkers rendered the new kind clean).
- ⚠️ **Named, not changed:**
  - 🔴 **the LEAVE NOTICE itself (and the cancel notice) tells only the PRIMARY coach**, so an additional teacher learns the class is back on but was never told it was off (TASK-487's gap on the original message);
  - a leave Undo cancels the make-up **without telling its coach**;
  - an Undo after today's class time sends "on again" for a past class.
- 3297/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59. ▶️ TASK-509 next; TASK-497 waits on your (i)/(ii).

From @Jason 2026-09-26: ✅ **TASK-509 reported.** The reason is at the registration in `index.ts` and in TASK-501's evidence (both entries), and **the routes are unchanged**. 3297/0 normal and unreachable; tsc 0; 59 = 59.
- **What they expose, walked:** `openapi.json` is a **hand-written, PARTIAL** schema (**17 paths vs ~130 guarded routes**, 7 schemas, last edited 09-07): route names, shapes, the bearer scheme.
  - **No customer data**, no host, no coach-rate field.
  - ⚠️ "Full API shape" overclaims, so the note says PARTIAL.
- `docs` loads Swagger UI from **cdn.jsdelivr.net**.
- **Both are also mounted at the root** (`/openapi.json`, `/docs`); the note covers both.
- ⚠️ **Named:** the public login example is `admin`/`admin`. The password is unusable (8+ required), but `admin` is `.env.example`'s bootstrap username. Worth a neutral example when the document is next touched; yours or the owner's.
- **No new test, agreeing with your lean.**
▶️ Nothing else queued for me except TASK-497, which waits on your (i)/(ii).

From @Jason 2026-09-26: ✅ **TASK-510 reported.** The leave notice, the cancel notice **and the teacher's-own-leave notice** (a hand-written union, a 4th copy) now all go through `teachersOfBooking`: **every coach**, no parent, wording unchanged.
- **A leave Undo's cancelled make-up tells ITS coaches**, but only for a make-up they HELD (`EXTENDED`/`CONFIRMED`, not `PENDING`). It's in the transaction after every refusal; **my first placement was before the plan check, and TASK-508's "refused ⇒ nothing queued" test caught it.**
- ⚠️ **Reads oddly, reported not edited:** a different coach's make-up notice says `Reason : ยกเลิกคาบขยาย — ย้อนกลับการลา`, i.e. a leave on a class they never heard of, in our own verb. It's the row's existing note. Words are yours or the owner's.
- **Mutations all bite:** leave primary-only · cancel primary-only · make-up coach untold · family on leave · family on make-up.
- ❓ **Timing:** from code, **yes**, for every class that starts before the day-end (documented ~18:05; the real server time is Otto's). From data: **not yet knowable** (`booking_undos.undone_at` only exists since 0058, this week). A read-only DATA REQUEST query is in the task. No rule invented.
- ⚠️ **Named:**
  - the **bulk `course_dropped_teacher`** (course dropped/ended, voucher ended) is still **primary-only**, the last coach notice with that shape;
  - whether a **move** reaches an additional teacher is unverified.
- 3304/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59. ▶️ TASK-511 next.

From @Jason 2026-09-26: ✅ **TASK-511 reported.** The public login example is now `your.username` / `your-password-here`. Both are accepted by the real rules (USERNAME_RE; 8+ characters), so the example teaches no rejected shape.
- The other 3 examples (a date, two times) are obvious placeholders and were left alone. The whole document has no phone, email, id, token or host (TASK-509's walk). Nothing else of that shape.
- **Pinned** by value and against the real rules; reverting to `admin`/`admin` BITES.
- Short-password accounts: **not investigated**, as instructed.
- 3306/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59.
▶️ **Nothing else is queued for me except TASK-497, waiting on your (i)/(ii).**

From @Jason 2026-09-27: ✅ **TASK-512 reported.** The bulk notice now reaches every coach. Co-taught ⇒ **the same dates in each coach's message, pinned as correct.** Wording unchanged, and the Coach line already lists every coach.
- 🔑 **The pin is DERIVED:** every coach-message producer in `src/` (17) must be classified, or the suite fails.
  - The 5 class-event ones must ask `teachersOfBooking` and never look a teacher up.
  - The others are named: 4 by design, 4 own-copies that reach everyone.
- ⚠️ **Correction to my TASK-510 report:** the bulk notice was **NOT** the last primary-only one. The derived scan found **four more: `booking_paused` and `booking_resumed` (a class stops / starts again: TASK-510's rule), `course_confirmed`, `rental_added_teacher`.** They're listed as open in the pin (which may only shrink). A follow-up is recommended.
- **Mutations all bite:** bulk primary-only · bulk tells the family · an unclassified new coach message · the leave notice back to its own lookup.
- 🔴 **§2, not built: a date or time move reaches every coach as NOTHING AT ALL.**
  - `moveBooking` / the plan editor update in place, and are *"silent"* by TASK-436's own comment.
  - There's no cancel+new pair; `PENDING_RESCHEDULE` is never written, and `reschedule_requested` has no producer.
  - A coach learns only passively: the ICS feed, the next daily reminder if it's sent after the move, the Monday digest.
  - **Owner decision.**
- 3310/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59.
▶️ TASK-511 was already reported (09-26). **TASK-497 waits on your (i)/(ii).**

From @Jason 2026-09-27: ✅ **TASK-513 reported.** **Three converged, one argued and left. The inventory's primary-only list is EMPTY and pinned empty** (`const OPEN_PRIMARY_ONLY = {}`).
- **pause / resume:** every coach, **pinned as a PAIR** by value on a co-taught class (both told it stopped, the same two told it restarted, no family).
  - ⚠️ **Kept AC-7 rather than SKIPPED:** these two write *no row* for an unlinked coach (SPEC-072 §5, "we tried to reach someone" is false). Changing that is a ruling on AC-7; I didn't make it.
- **rental_added_teacher:** converged after looking twice. It's a fact about the session, not an instruction, and **it exists only to carry the Rental line the morning reminder couldn't, and that reminder already goes to every coach.**
- **course_confirmed: argued named-by-design, left.**
  - A course has **one coach by construction**: validation refuses extras on every lesson type (AC-20), and a group course seat keeps the extras on the group row.
  - The message is a course summary with one `Coach :` line.
  - The AC-20 refusal is **pinned as the exemption's ground**.
  - Named beside it: a *re-teachered* course confirms to `rows[0]`'s coach only.
- **Mutations all bite:** pause primary-only · resume primary-only · pause tells the family · rental primary-only (**source pin only**; no by-value rental test).
- Named: a group **seat's** events reach only the seat's coach (the extras are on the group row). That's a product question.
- 3313/0 normal and unreachable, 0 failed queries; tsc 0; 59 = 59.
▶️ TASK-511 was reported 09-26. **TASK-497 still waits on your (i)/(ii).**

From @Jason 2026-09-27: ✅ **TASK-497 reported: built as ruled, (ii).** An undone attendance is **CONFIRMED**, through **the check-in Undo's own writes** (`attendance-revert.service`: the guarded flip + the floored counters + the event). Each door keeps its entry rules. The kind is the truth: parent check-in ⇒ `checkin`; staff / day-end / legacy ⇒ **`attendance`**. **Migration 0059** (witness by the CHECK's *definition*); `notUndoneCheckin` → **`notUndoneAttendance`**, widened. **60 = 60**; 3318/0 both ways, 0 failed queries; tsc 0.
- **Pinned unchanged, by value:** the unit back (floored), **`leaveUsed` untouched**, no make-up, no message, the reversal after commit, the note.
- **New on this door: the guard** (a double undo is a 409, nothing twice).
- **Mutations all bite:** charges the quota · sends a message · back to SICK_LEAVE · the false `checkin` label · no event (tonight's re-attend) · the day-end exemption narrowed.
- **Consequences pinned:** CONFIRMED holds the freelance hour; the row's check-in columns are cleared (kept on the event); a past-dated CONFIRMED is left for staff.
- 🔴 **FE (Fern's):** the only UI path is BookingModal's **"Sick leave" button** on an ATTENDED row. Its dialog says it *consumes quota and appends a make-up*, and its toast says *leave saved*. Both are now untrue there. Recommend a Fern task; the words are the owner's.
- 📋 **DATA REQUEST** is in the task: SICK_LEAVE + a check-in column. **A LOWER BOUND, stated in the query itself** (certain since 0056; earlier undos are indistinguishable from real leaves; **do not widen**).
- ⚠️ `db:generate` wrote a chained `0059_snapshot.json`; deleted per the drizzle README.
▶️ Nothing else queued for me.
From @Fern 2026-09-27: ✅ **TASK-483 DONE (code)** — **596 pass / 0 fail** · tsc 0 · build ok · 2 source modified · 1 new test. ABSENT ⇒ a neutral mark (`bg-muted-200` / `ClipboardList`) + `บันทึกแล้ว` / `Already recorded`, **pinned by RENDERING as the ABSENCE of the success mark** — no `data-camp-mark="success"`, no `bg-success`, not even the tick's own `lucide-circle-check` class, so swapping the icon under the same wrapper cannot pass either. The status line stays readable (dropping it fails). **ATTENDED byte-identical** (repeat + fresh), and PLANNED/CANCELLED keep the success face — no anxious page. The branch is the server's `status`, never `already` (that mutation fails 4 tests). **Both doors:** exactly one `CampSuccessView` exists (asserted) and the **shop-front path is pinned** to the new shape. Copy +1 both languages, the owner's words unchanged.
✅ **You asked me to check the SESSION reply: it cannot have this bug.** Its success body carries no status at all (`already`, `booking`, `crmAwarded`, `remaining`) and every refusal — sick leave, cancelled, TASK-479's window — comes back non-2xx into `ErrorView` with the server's sentence. Nothing changed there. 📌 The difference worth naming: the camp route answers a refusal **200 with the day as it stands** (so the page must read the status), the session route answers **non-2xx**. **A success body that can describe a refusal is the shape that produced this bug** — worth remembering when a new route picks its refusal style.
📎 **Your item 1, answered and NOT fixed:** `weekName` earns its line (and now arrives on both paths — that explains the empty line on repeat scans). **`studentName`: my view is keep the line and have it sent.** Not because the session view has it — because of the same person this task is about: the nanny or driver holding the phone may have three children in the car, and week · date · half · status are identical for siblings on the same camp day, so "which child did I just check in?" has no answer on screen. One field closes that. If it is not to be sent, the honest alternative is deleting the line, since a conditional that never renders reads as a bug to the next person (it did to Jason).
🔑 ×7 mutations, `BASELINE=0` on a green suite, md5 identical on 2 files. Notes + Tanya's list in the TASK §2. **Starting TASK-491** (the mixed result designed first, per your note), then TASK-514.
From @Fern 2026-09-27: ✅ **TASK-491 DONE (code)** — **609 pass / 0 fail** · tsc 0 · build ok · 3 source modified · 1 new test · 3 counts moved in my own TASK-478 pins (each named). **I designed the mixed result first, as you said, and the happy path did look after itself.** Pure and value-tested: `rowOutcome` (from **that row's own status**), `rowReason` (**that child's own server sentence**), `batchSummary`, `batchHeadlineKey` (**a success word is reachable only when EVERY child is in** — a mixed batch gets *"{in} of {total} checked in · {refused} need the front desk"*), `pairRows` (**matched BY ID**, so a reordered answer cannot mislabel a child), `batchBody`, `canSubmitBatch`/`overMax`. **A 2xx is never a check-in by itself**; an ABSENT camp day in a row is refused (TASK-483's rule, now per row); a row the server did not answer for is refused, never assumed done. No row hidden, no optimistic tick, no retry-all, and the summary line is IN ADDITION to the rows. **A single ticked child goes down today's single route unchanged** — which is also why the compact row is not a second success reply: it is an outcome line for a list, and the one place a full reply renders is untouched. The ceiling of 10 is surfaced BEFORE the request. **The four "nothing" cases stay indistinguishable** — the page still may not read `children`, holds no literal sentence, renders the ticking list in one place, and every tick is identical. Ticks cleared in three places; nothing stored. Copy +8 both languages. 🔑 ×11 mutations, `BASELINE=0` on a green suite, md5 identical on 2 files — 📌 one slipped first: the refused row's OWN reason was pinned in the HELPER only, so a mutation that dropped it at the call site (one generic line for every refusal) passed; pinned at the call site now. Notes + Tanya's mixed-case-first list in the TASK §2. **Starting TASK-514** — I will report on the Undo collision before building anything.
From @Fern 2026-09-27: ✅ **TASK-514 DONE (code)** — **614 pass / 0 fail** · tsc 0 · build ok · 2 source modified · 1 new test. ONE branch (`undoing = booking.status === "ATTENDED"`) picks **label · dialog title · sentence · confirm button · toast** together, so the exact failure this task is about — fixing one and leaving another lying — cannot recur in halves (each half mutated alone fails). **Every other row byte-identical:** the leave copy pinned by exact text in both languages, **ONE `sickLeave.mutateAsync` for both cases** (no second mutation, no second endpoint), the override/locked/make-up toasts untouched; widening `undoing` to non-ATTENDED rows fails.
📝 **My draft (marked `📝 DRAFT (Fern, TASK-514)` ×4 in the dictionary, pinned BY SHAPE so his answer is a one-line change):** menu + confirm **Undo attendance / ยกเลิกการเช็คอิน** · title **Undo this attendance? / ยกเลิกการเช็คอินคาบนี้?** · sentence **"The session goes back to confirmed and the class returns to the family's balance. No leave is used, no make-up is added, and nobody is told." / "คาบจะกลับเป็นยืนยันแล้ว และคืนคาบเข้าโควตาของลูกค้า ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร"** · toast **Attendance undone / ยกเลิกการเช็คอินแล้ว**. The pin requires the four facts and forbids the old promises. Two deliberate word choices for him to overrule: Thai says **ยกเลิกการเช็คอิน** (the MARK is undone, not the child's attendance), and the sentence ends with **ไม่มีการแจ้งใคร** because that is the first thing an admin wants to know before pressing.
🔎 **The Undo collision is REAL — reported, not resolved.** TASK-492's family lists exactly this row (`ATTENDED from a check-in ⇒ CONFIRMED · credit returned · re-hold · silent`) — the same real-world act as this control on an ATTENDED row. **There is no FE task for the Undo family in `tasks/` yet, so today there is exactly ONE button and I built no second one.** One difference that matters for your ruling: **TASK-492's Undo re-holds the coach's hour and can REFUSE naming the obstacle; this path cannot** (it goes through the existing sick-leave mutation, which knows nothing of re-holding) — the same act with different safety. **My recommendation: when the Undo FE lands, this ATTENDED branch should BECOME that Undo** (one act, one door, the stronger safety) rather than sitting beside it, and these draft words should be what `ย้อนกลับ` says on an ATTENDED row so the label never changes meaning twice. ⚠️ If the Undo FE ships a second button without this branch being removed, that is the two-buttons problem you warned about — it wants to be one task's job.
🔑 ×9 mutations, `BASELINE=0` on a green suite, md5 identical on 2 files. Notes + the draft table + Tanya's list in the TASK §2. Nothing waits on me.

## 2026-09-27 — @Porter → @Sober: two points before the owner rules.
1. **Fern's TH button label `ยกเลิกการเช็คอิน`.** It uses **ยกเลิก**, the same verb as **ยกเลิกการจอง** (cancel booking). The owner explicitly asked that Cancel and Undo stay distinct, and your own plan used **ย้อน…** (ย้อนการเข้าเรียน / ย้อนการเช็คอิน / ย้อนการลา). I am proposing **ย้อน** to the owner. Tell me if there is a reason Fern moved away from it.
2. **"Is a group seat's coach the class's coach?"** I cannot put that to the owner as it stands. Give me 3 plain lines: what happens today, one concrete example (which coach gets which message), and your recommendation.

Also confirm: DEPLOY-sid expects **Journal: 60** now (the file still says 59).

## 2026-09-27 — @Porter → @Sober: owner rulings ("1-3 ตามแนะนำ ย้ายคาบแจ้งทั้งคู่").

**Wordings:**
1. The coach "class back on" notice: your placeholder is **APPROVED as final**. `CLASS ON AGAIN / มีคาบตามเดิม ‼️` in the cancel-notice house format.
2. The make-up cancellation reason: **APPROVED**. `นักเรียนกลับมาเรียนคาบเดิมแล้ว จึงไม่ต้องมีคาบชดเชยนี้ / The student's original class is back on, so this make-up is not needed.`
3. The admin control uses **ย้อน**, not ยกเลิก, so it stays distinct from ยกเลิกการจอง:
   - labels by row state: `ย้อนการเข้าเรียน / Undo attendance` · `ย้อนการเช็คอิน / Undo check-in` · `ย้อนการลา / Undo leave`;
   - dialog title in the same verb;
   - body (Fern's, approved): "คาบจะกลับเป็นยืนยัน และคืนคาบเข้าโควตาของลูกค้า ไม่ใช้โควตาลา ไม่เพิ่มคาบชดเชย และไม่มีการแจ้งใคร". Adjust the body for the leave case, where the coach IS told.

**4. NEW: announce class MOVES to BOTH the coach(es) and the family.** When an admin changes a class's date or time, send "moved from old date/time → to new date/time", following the house format.
- Use the shared every-coach predicate. Parent text follows the chat language.
- Propose the exact wording to me before shipping.
- It may be wired to the unused "awaiting reschedule" template, or ignore that; your call.
- Size it.

Is it in this sid deploy or the next one? My preference: the next one, so today's deploy is not held. Say which.

Pending from my last note: the group-seat coach question in 3 plain lines, and Journal 60.

## 2026-09-27 — @Porter → @Sober: owner rulings.
1. **Group: notify EVERY coach of the group** when a seat changes: cancel, leave, undo, and the rest. A seat's coaches are the group's coaches. Cut it; it rides the next deploy with TASK-516 unless it is XS and ready now.
2. **The sid deploy goes NOW**, without waiting for TASK-517 (the ย้อน labels). A later code-only redeploy will carry 517. I will tell Tanya that the old label is known for this round.

## 2026-09-27 — @Porter → @Sober: Tanya's TEST-075 interim. Four defects and one gap. Screenshots viewed.

🔴 **B, a gap in the plan and not a test miss: there is NO admin Undo control anywhere.**
- On the ON LEAVE row menu (`B-modal-sickleave-no-undo-menu.png`) the options are Overbook / Record leave (disabled) / Pause / Cancel booking.
- I grepped the FE repo and found no undo route and no undo action at all.
- TASK-492 shipped the API only. Your plan said "Undo BE M–L + FE M", but no FE task was ever cut; 517 is labels on a control that does not exist.
- ⇒ **Cut the Undo FE task now.** It covers:
  - the one control with state-driven `ย้อน…` labels (TASK-517 folds in);
  - roster AND plan editor;
  - the state-varying dialog body;
  - clear refusals: settled day, slot taken, charge unknown.

  Without it, the owner's feature cannot be used.

🔴 **D3: the coach calendar link opens the wrong website and carries the private token.**
- The reply sends `webcal://som.develyst.online/api/calendar/<token>`.
- LINE linkifies it as `develyst.online/…`, dropping the scheme+subdomain handling, and opens another site on the root domain (`G-calendar-link-opens-wrong-site.png`: "kbtgkampushk2026").
- Fix: send an `https://som…` / `https://frontoffice…` link that LINE can open. Also consider whether the token must rotate (it has been sent to the root host's logs).

🔴 **D1:** a newly linked teacher's FIRST typed message (`ตารางของฉัน`) is swallowed into the admin hand-off and the chat is muted. It works after `reopen`.

🟠 **D2:** `reopen` shows a TEACHER the customer command list. It should be the teacher list (REQ-109 §6).

🟠 **Old leave fixtures** (asda 24/10, 31/10, temp 01/10) are refused by Undo with `UNDO_LEAVE_CHARGE_UNKNOWN`. That is correct by design. Give me a DATA REQUEST to fix them by hand on sid, or leave them.

**Not defects:**
- the LINE pushes that did not arrive are the **demo OA's monthly push quota, exhausted until 1 Oct**, which is known. Replies work.
- The stale sid FE (missing 483/491/514) is the owner's redeploy.

Size B and D1–D3, and give me the order. My order: B first, then D3, D1, D2.

From @Jason 2026-09-27: ⏸️ **TASK-519 STOPPED, as §2 instructs. Nothing built, nothing rotated.** A plain `https` `.ics` link makes an **iPhone** tap **import a one-time snapshot** instead of subscribing (only `webcal://` subscribes on tap). **Android** never had tap-to-subscribe (only "From URL" with the https URL). This is platform knowledge, **not device-tested**; Tanya can confirm on sid.
- **Host:** per box from env. sid `som.develyst.online`, customer `frontoffice.develyst.online` (the check-in host their phones already use). **No host change needed.**
- ⭐ **Recommendation:** LINE sends `https://<host>/api/calendar/<token>` (no `.ics`), a **landing page on our host**.
  - It has a **Subscribe button with the `webcal://` href** (iPhone subscribes as today) and the https URL to copy for Android. no-referrer, no-store, no third-party assets.
  - **The `.ics` feed is unchanged**, so existing subscriptions keep working. The token only goes to us.
  - One device unknown: whether LINE's in-app browser hands `webcal` off; if not, the page says *open in Safari*.
- **Tokens:**
  - (1) **Unknowable exactly**: a tap leaves no trace on our side. **Upper bound = coaches with a `calendar_token`** (read-only DATA REQUEST in the task).
  - (2) One coach's classes, −30/+90 days, **with the children's display names**, subject and status. No phone, parent, note or money. Still **"where and when a named child will be"**.
  - (3) **Rotation exists, per coach, staff-only** (`?rotate=true`, the old link 404s at once). **No notification, no bulk.** I agree with your lean: fix the link, then rotate through it.
- **Your ruling needed:** the landing page, **or** plain https as a stopgap (iPhone loses subscribe), or other. ⚠️ **Until then each tap still sends the token away.**
▶️ **Moving to TASK-520** while you decide.

From @Jason 2026-09-27: ⏸️ **TASK-520 STOPPED, as §1.2 asks. The condition is named, and PARENTS ARE AFFECTED TOO** (narrower). Nothing built.
- **The condition:** a chat's **linking step outlives a link completed ELSEWHERE**, and the router checks linking steps **before** "linked".
  - A teacher's *successful* nickname claim returns `ok:false` (queued), so it **counts as strike 1** and the chat stays `AWAIT_CODE`.
  - The approval never touches the chat session.
  - The coach's next message (`ตารางของฉัน`) is read **as another nickname**: `not-found`, strike 2, **hand-over + mute**.
  - Not ordinality: it's that stale state (linking twice ⇒ twice).
- 🔴 **Parents:** a parent who types `สมัคร` in chat, picks "customer", then **registers on the page** is linked while the chat still holds `AWAIT_CODE`. Their next message is read **as a phone number** (the bot asks a linked parent for their phone); the second is **hand-over + mute**. Parents who finish **in chat** are fine. A read-only DATA REQUEST sizing it is in the task.
- ⭐ **Fix (not built):**
  - one `endLinkingConversation` that clears **only** a *linking* step + strikes, **never `mutedUntil`** (the hand-off rule is pinned both ways), called where a link completes outside the chat (the approval + the page);
  - and a queued (`pending`) claim is **not a strike** and ends `AWAIT_CODE`. Reply unchanged, no-oracle holds.
  - Router order unchanged (2FA relies on it).
- ❓ **(a)** both teachers and parents [rec.] · **(b)** teachers only · **(c)** other.
▶️ **TASK-521 next**, while you decide 519 and 520.

From @Jason 2026-09-27: ✅ **TASK-521 reported.** **ONE decision, every surface.** `commandListKey(role)` + `commandChips(role, lang)` are now read by Language/Help, **the muted `reopen`**, a parent's `เมนู`/`reopen`, and an **unmuted teacher's `reopen`** (which was silence). 3324/0 both ways; tsc 0; 60 = 60.
- **Why 485 missed it:** the list was chosen **at each call site**. 485's check sat on the Language postback only, the un-mute hard-coded `menu_body`, and `doMenu` always attached the parent chips. **TASK-477's chips were NOT role-aware.**
- **A teacher's chips** = today · this week · my calendar, **extracted byte-identical from the schedule reply**, which now reads the same function (one vocabulary).
- **Proven through the real dispatcher:**
  - every word **in the reply actually sent** routes for a teacher, typed;
  - every chip under it, tapped, answers;
  - the parent's reply is unchanged.
- **Mutations all bite:** teacher gets the parent list · the un-mute decides alone again · an advertised word that doesn't route · a parent chip for a teacher.
- ⚠️ **Named:**
  - a teacher's `เมนู` still answers "account linked…", not the list (a copy question);
  - an admin's `reopen` shows the parent list, as before.
▶️ **Waiting on your rulings for TASK-519 and TASK-520. TASK-516 / TASK-522 are next-deploy.**

From @Jason 2026-09-27: ✅ **TASK-519 reported: built as ruled.** LINE now sends `https://<box host>/api/calendar/subscribe/<token>` (the token in the path; same base as the feed). The **landing page** has a **webcal:// Subscribe button**, the https .ics URL for Android, and **the "if the button does nothing → Open in Safari" line in its own copy**. **The feed is untouched, no subscription breaks, nothing rotated.** 3332/0 both ways; tsc 0; 60 = 60.
- 🔴 **The new pre-guard route:** **my own TASK-501 suite refused it first**, and it's now in EVIDENCE with its own `why`.
- **Allow-list by signature** (`renderCalendarSubscribePage({ webcal, https })`: two URLs and fixed words; the route reads only `id` to check existence).
- **Headers:** no-store · no-referrer · **X-Robots-Tag noindex** · CSP `default-src 'none'`. Unknown token ⇒ plain 404.
- **Proven against the REAL rendered text** through the dispatcher (TH and EN): no `webcal`, only our https link, each alone on its line, no `?`.
  - Page by value: only the two URLs; **no coach name even with one in reach**; no script or asset.
- **Mutations all bite:** webcal back · token in a query string · coach's name on the page · third-party script · no noindex · a page for an unknown token.
- ⚠️ **Device-only facts** (LINE's linkify, the in-app browser's `webcal` hand-off) are **for Tanya**, labelled not guessed.
- 📌 The staff `calendar-link` endpoint still returns `{https, webcal}`. If the staff screen gives staff a link to send by LINE, it should be the page URL (Fern's; not checked).
▶️ **TASK-520 still waits on your (a)/(b).**

From @Jason 2026-09-27: ✅ **TASK-520 reported, and 🔴 A CORRECTION FIRST: the PARENT case I reported does NOT exist.**
- **`routes/register.ts` has cleared the chat session on success since 09-12** (`clearLinkSession` on all three link doors, TASK-347 Rule 4). I inferred the page path from `settleLinkedRole` and **didn't read the route**, the TASK-510 mistake again.
- **Verified:** parents are bound only through `linkFamilyByPhone`, from the chat (clears on success) or the page (clears). **Parents are unaffected. Sorry: your "worse bug" paragraph rests on my error.**
- **The DATA REQUEST to Porter over-counts** (it includes parents). The corrected, teachers-only version is in the task.
- **The teacher fix (as ruled):**
  - a **queued** claim ends the linking conversation (no strike; reply unchanged, no-oracle holds);
  - the **approval** ends it;
  - `endLinkingConversation` writes `FLOW_CLEARED` (**no `mutedUntil`**, so it can't end a mute), **only on a linking step**;
  - `LINKING_STEPS` is now one list the router reads too.
- **Proven through the real dispatcher:** claim → approval → **`ตารางของฉัน` answered**; a real hand-off stays muted (free text AND commands); add-student untouched.
- **Mutations all bite:** first message swallowed · approval doesn't end it (source pin only) · the helper ends the mute · it ends any step · the list loses a step.
- ⚠️ **Coaches already stuck** (approved before this ships) will still be misread once. Repairing them is a **one-off data change for the owner**; the exact UPDATE is in the task (never touches the mute). Not run.
- 3340/0 both ways; tsc 0; 60 = 60. ▶️ **TASK-523 next.**

From @Jason 2026-09-27: ✅ **TASK-523 reported.** The ONE decision now covers **every role**: teacher · parent · **admin → `admin_linked_menu`, no chips** · **unlinked → `welcome`, no chips** (existing copy only). 3361/0 both ways; tsc 0; 60 = 60.
- **The surfaces, derived:** A Language/Help · B muted `reopen` · C typed `เมนู`/help/`reopen` per role · D the parent postback default · E the add-student replies (parent-only, correct).
- 🔑 **The 5th case nobody mentioned: an UNLINKED person was shown the PARENT's four** on A and B, none of which route for them. Now `welcome` ("type สมัคร"), and `สมัคร`/`register` are proven to start registration.
- **Teacher `เมนู` ⇒ the LIST.** "account linked…" was written **07-29, when teachers had no list**, the only thing to say rather than a choice. Pinned with the dates.
- **Admin `reopen`** was silence; it's now their line.
- **The whole table by value** through the dispatcher (21 tests). **One mutation per fixed surface, all bite.**
- ⚠️ **Named:**
  - an **admin tapping any menu postback is told to register** (`welcome`), a false sentence, not a list;
  - the rich-menu images are outside this scan.
▶️ **Next-deploy work remains (TASK-516, TASK-522); TASK-515 is still queued.**

From @Jason 2026-09-27: ✅ **TASK-524 reported.** **One line**: the non-parent postback guard now reads `commandListKey(linked)`. Admin ⇒ their own line; **unlinked ⇒ `welcome`, byte-identical**. No branch, no copy. 3369/0 both ways; tsc 0; 60 = 60.
- **The postback answers, derived and classified:** `welcome` was **NOT** the only wrong-role answer. There are **two more, and they're what an admin actually meets**. An admin gets **no role rich menu**, so they keep the **unknown** menu, whose only two cells are:
  - **`enter`**, which sends staff a **parent sign-up link**;
  - **`admin`**, which **mutes the admin's own chat** and "calls" themselves.
- 📌 **Latent:** `doCallAdmin` labels every caller `parent_asked_for_admin` (teachers too). It renders as the default text today; it must not say "parent" when its copy lands.
- **Not fixed** (named): both change what a *menu button does* for a role. The honest fix is likely **an admin menu of their own (or none)**, a rich-menu and owner-words decision. **Yours to cut.**
- **Mutations bite:** admin told to register again · unlinked no longer gets `welcome`. TASK-346's guard pins moved with the same claims.
▶️ **TASK-515 next.**

From @Jason 2026-09-27: ⏸️ **TASK-515 STOPPED, as §1 instructs: the student is NOT on either object the camp scan already fetches.** The day read is `with: { package: true }` (only `studentId`); the credit's `packageDTO` reads the package + days/week. Nothing built.
- ⭐ **Option (a):** widen the scan's **own first read** to `with: { package: { with: { student: { columns: { nickname: true, name: true } } } } }`.
  - **Same statement, no new query**, and the `columns` limit means the public door reads only the two name fields.
  - It's the shape `getDayCheckinQr` already uses.
- (b) A separate student query: not recommended. (c) Leave it, and Fern removes the line.
- **Name rule:** `studentNamesOf` (nickname ?? name) is the ONE rule to reuse.
  - 📌 `getDayCheckinQr` hand-writes a **second copy** (same order, but falls back to `""` not `null`). Converging it would pair naturally with (a). Named.
- ❓ **Your call: (a) / (b) / (c).**
▶️ Meanwhile the next-deploy pair (**TASK-516**, **TASK-522**) is next in your order. I'll start **TASK-522** unless you say otherwise.

From @Jason 2026-09-27: ✅ **TASK-522 reported (next deploy).** **The ONE predicate now knows what a seat is:** `teachersOfBooking` resolves the class first (a seat ⇒ its group row, else itself), then asks `ownScopeWhere`, unchanged. **No producer touched.** Every class-event notice in the TASK-512 inventory inherits it (leave · cancel incl. the Undo's make-up · the Undo's "on again" · pause/resume · same-day rental · the bulk drop/end; own-leave acts on non-seats, unchanged). 3376/0 both ways; tsc 0; 60 = 60.
- **Two seats ⇒ each coach TWICE**, one per child, each naming its seat. **Pinned as correct**; not arguing for a merge.
- **Proven by value:** a seat ⇒ Ek + Nok (asked about the group); **a private session unchanged**; the join is still THE predicate. Through the real cancel sender: 4 rows, unlinked ⇒ SKIPPED.
- **Mutations bite:** seat → own coach · private recipients change · predicate narrowed.
- ⚠️ The first real Postgres run is **Tanya's on sid**.
- ⚠️ **Reads oddly, reported:** Nok's copy says `Coach : Ek` only. The worker builds that line from the **seat** row, which has no extras. The fix is the same resolution in `bookingContext` (one line), but it changes existing message text, so **yours to rule**.
▶️ **TASK-516 next** (the other next-deploy task). **Still waiting on you: TASK-515 (a)/(b)/(c).**

From @Jason 2026-09-27: ✅ **TASK-516 reported (next deploy).** A real move (date or start time, compared as HH:MM) of a CONFIRMED/EXTENDED class ⇒ **every coach** (`teachersOfBooking`) + **the family** (the cancel notice's household rule, **extracted into ONE `familyAccountsOfRow`**, no second rule). It runs inside both doors' transactions, so the plan editor's dry-run rolls it back. 3390/0 both ways; tsc 0; 60 = 60.
- 📋 **The WORDING is a DRAFT** (in the task, both audiences, both languages). Coach: `CLASS MOVED / ย้ายคาบ ‼️` + Student/Program/Coach + From/To. Family: `📅 ย้ายคาบเรียน:` / `📅 CLASS MOVED:` + Student/Program + จาก/เป็น (From/To). **Nothing about why. For the owner.**
- 🔑 **Several moves:** FROM/TO are **snapshotted per move**, so two drags send a **chain A→B, B→C**, each true. The worker delivers oldest-first; ⚠️ a failed-then-retried first send can arrive after the second. Not coalesced (it would race the worker); **one-per-burst is a ruling if the owner wants it**.
- **Only a real move:** note / subject / rate / same-slot-respelt ⇒ nothing; a teacher change ⇒ only today's pair; PENDING ⇒ nothing.
  - ⚠️ **I included EXTENDED make-ups** (the family *cancel* notice is CONFIRMED-only). Say if you want CONFIRMED-only.
- **`PENDING_RESCHEDULE` / `reschedule_requested`: left, per your lean**, still named as dead.
- 🔑 **A real defect found and fixed:** TASK-345's all-kinds walker **crashed my renderer on a partial payload**. `slotLine` is now total (fewer lines, never no message).
- **Mutations all bite:** note-only fires · primary only · coaches but not family · PENDING announced · FROM not snapshotted.
- ⚠️ **Named:** a GROUP row's move tells the families of **all** seats, **including cancelled ones**. That's the shared household rule (pre-existing in cancel); the fix would be a seat-status filter in the one rule, **yours**.
▶️ **Waiting on you: TASK-515 (a)/(b)/(c).** Nothing else queued for me.

From @Jason 2026-09-27: ✅ **Both addenda done, and TASK-515 built as (a).** 3400 / 0 normal AND unreachable, 0 failed queries · tsc 0 · 60 = 60.
- **TASK-522:** a seat's `Coach :` line = **the group's coaches** (the seat's `group` rides the same query); a private row is byte-identical. 🔑 **Any other false line for the second coach? NONE** (child/subject/slot are the seat's and true; `teacherNickname` = the group's primary).
- **TASK-516:** the one household rule **drops CANCELLED seats**. ⚠️ **A trap closed:** the admin's group cancel cascades seats FIRST, so a re-read would have told **no** family. It now snapshots seats before the cascade.
  - **Audience changes, all GROUP-only, all pinned:** the move (family) · the admin's group cancel · a teacher's own leave · the series cancel-all. Private/DUO unchanged.
  - Retry limit written in the code. 📌 Named for the owner: **a cancelled make-up (EXTENDED) is never told to the family** (the cancel notice is CONFIRMED-only).
- **TASK-515:** a `columns: { nickname, name }` read (same statement), `studentName` on **both** paths via `studentNamesOf` (9 keys); the QR converged, **its `""` kept (load-bearing: a template string would print "null")**.
  - 🔑 **Two MORE spellings of the rule found in camp.service and converged** (fallbacks kept, byte-identical). A pin now asserts none remain (**HEAD had four**).
  - Fern note in the task.
- **Mutations all bite:** Coach from the seat · private changed · cancelled seats counted · re-read after cascade (source) · one path only · a second name rule.
▶️ Nothing else queued for me.

From @Jason 2026-09-27: ✅ **TASK-525 reported.** The alert kind names who asked: parent (**unchanged**) · teacher · admin · **unlinked** (which was also labelled a parent). No copy invented: all four render the parked default, and **no counter moved** (the walkers count renderer `case`s; these render via `default:`). 3407/0 both ways; tsc 0; 60 = 60.
- 🔑 **"The already-resolved role", honestly:** the typed twin lives in the parent-only handler, so it passes `"customer"` (no lookup).
  - The **postback handles `action=admin` BEFORE any role check by design** (TASK-234, and two pins assert that order), so it has no role.
  - I tried hoisting the lookup; **the pins failed and were right**; reverted.
  - `doCallAdmin` resolves the role only when not given one: that path's **only** lookup, gating nothing.
- 📌 **The admin-taps-it behaviour is pinned UNCHANGED** (mutes their own chat, alerts all admins). A mutation that "quietly fixes" it BITES.
- **Mutations bite:** teacher labelled a parent again · the admin behaviour fixed quietly · unlinked labelled a parent.
▶️ **Nothing left for BE on the board.**
From @Fern 2026-09-27: ✅ **TASK-518 DONE (code) — TASK-517 folded in.** **620 pass / 0 fail** · tsc 0 · build ok · 3 new · 7 source modified · 1 test file replaced · 17 pins moved (15 × snapshot 59 → 60 each naming the 60th key; the sweep 103/39). **ONE `UndoControl` on BOTH surfaces** (the roster modal and the plan editor's row menu) — one component, one rule, one dialog. Labels from the row's state: `SICK_LEAVE`⇒**ย้อนการลา** · `ATTENDED` from a check-in channel⇒**ย้อนการเช็คอิน** · any other `ATTENDED`⇒**ย้อนการเข้าเรียน** · anything else ⇒ **nothing rendered** (absent, never greyed). 🔴 `ยกเลิก` is pinned ABSENT from the whole family so Cancel and Undo cannot blur. 🔴 **The body varies by state and the LEAVE case says the coach IS told** — both directions pinned in both languages; your catch would otherwise have shipped the very defect this control removes. **Refusals:** the server's sentence verbatim and **no refusal code in the component**, so `UNDO_SLOT_TAKEN` keeps the hour and its holder and `UNDO_LEAVE_CHARGE_UNKNOWN` reads as correct-by-design; the success toast is reachable only after the await, and the catch sets the sentence **and nothing else**. 🚫 No optimistic update (invalidate on success only). The 60th key is in the BE's slot — moving it fails 16 tests. 🔑 **TASK-514's ATTENDED branch removed in this task**, the Sick-leave control a leave again with its original words byte-identical, and its superseded draft keys deleted.
📌 **One mid-build correction I want to pass on:** I first asked the key through the constant `UNDO_KEY`, and your action sweep then listed `calendar.undo` among *"keys with no FE site"* — a perfectly wired door the sweep could not see. The site asks its key as a **literal** now, like every other site, with the reason in the code. **A pin that cannot see a door is worse than a verbose site**, and the sweep was right to complain.
📌 **On the check-in label:** "ATTENDED from a check-in" is a CLOSED set (`shopfront-qr` · `checkin-qr` · `line`) because `checkinSource` is open-ended today (a staff check-in carries a USERNAME) — anything outside it reads as the general *attendance* wording, since both labels lead to the same act and the general word is the safe default. **TASK-488's `checkinChannel` is exactly the closed set this wants**; when it lands the guess disappears.
📝 Still a draft: the **toast** alone (marked ×2, and the marker mutation kept as you asked).
❓ **Your calendar-link question — answered, nothing changed: NEITHER.** The FE has **no calendar-link surface at all** — `action:teachers.calendar-link` is pinned in `action-gate.test.ts` as one of exactly two keys with **no FE site**, and there is no fetch, no button, no copy field and no `webcal` string anywhere in `src`. **Staff cannot copy it and cannot send it from the product**, so nobody can re-create the leak by hand through our UI and there is nothing for me to fix. ⚠️ Whoever uses that endpoint does so outside the app (curl/Postman/DB) — so if the customer is supposed to be able to hand a coach a calendar link, **that surface does not exist yet**: a product gap, not a leak.
🔑 ×12 mutations, `BASELINE=0` on a green suite, md5 identical on 7 files. Notes + Tanya's refusals-first list in the TASK §2. Nothing waits on me.
From @Fern 2026-09-27: ✅ **TASK-526 DONE (code)** — **622 pass / 0 fail** · tsc 0 · build ok · 5 source modified · 1 test extended. The Undo label reads **`checkinChannel`** now: pinned **by value for every channel of the closed set** — the three scans (`shopfront-qr` · `checkin-qr` · `line`) ⇒ `ย้อนการเช็คอิน`, `staff` and `end-of-day` ⇒ `ย้อนการเข้าเรียน`. **The safe default survives** (unknown, mis-cased, or absent ⇒ the general *attendance* wording) — a mislabel is cosmetic, a missing control would not be. 🚫 **`checkinActor` never read**, asserted on the **comment-stripped** code: the prose may name the rule while the code may not do it — my first version of that pin read the raw file and failed on its own explanation. `CHECKIN_CHANNELS` mirrors your `lib/checkin-channel.ts` and is pinned equal to the five. The mapper carries both as sent; an absent channel stays absent (inventing one would make an unscanned row read as a scan).
📌 **On removing the hard-coded list: it did not disappear, it CHANGED KIND — and that is the honest answer.** It no longer guesses which strings might be channels (that part is gone); what remains says **which of the five channels mean a family SCANNED**, which is a product question your set does not answer (`staff` and `end-of-day` are channels too). So it is a typed SUBSET (`readonly CheckinChannel[]`): every member must exist in `CHECKIN_CHANNELS` (a drift fails) and the membership is pinned by value.
📌 **What else reads `checkinSource` — exactly one thing: the TASK-482 wall-QR chip** (`lib/scheduler/checkin-source.ts` + `CheckinSourceChip`, on the Bookings roster and the booking detail). Nothing else in `src`. **TASK-488 §78 says that chip should read `checkinChannel === "shopfront-qr"` too — I did NOT touch it** (out of this task's scope): it is a one-line change plus its pins whenever you want it. ⚠️ **And until it moves, `checkinSource` cannot be dropped:** the chip is its last reader, and dropping the column would silence the chip **without failing a single test on either side** — worth knowing before that drop is scheduled.
🔑 ×7 mutations, `BASELINE=0` on a green suite, md5 identical on 3 files. Notes + Tanya's one check in the TASK §2. Nothing waits on me.
From @Fern 2026-09-27: ✅ **TASK-527 DONE (code)** — **623 pass / 0 fail** · tsc 0 · build ok · 4 source modified · 1 test rewritten. The chip reads **`checkinChannel === "shopfront-qr"`**: every channel of the closed set decided BY VALUE (one with words, the other four silent), and an unknown channel, a mis-cased one, `null` or absent renders **nothing** and throws nothing — pinned by rendering. 🚫 **`checkinActor` unread**, asserted on comment-stripped code (your lesson from 526, applied deliberately). 📌 I **kept** the null-prototype map and `Object.hasOwn` even though the `toString` hazard left with the open-ended field: the guard costs nothing and the map is one `as unknown as` away from being fed free text again.
✅ **Answer 1 — nothing in the FE reads `checkinSource` any more.** Three mentions remain and none is a reader: the mapper's **passthrough**, the two **optional deprecated** type fields, and the dictionary **key name** `checkinSource.shopfrontQr` (a copy path, not a payload field). 🔑 So the pin names the **field access** (`/\.checkinSource\b/`) rather than the string — renaming the copy key later is not a regression, while pointing the chip back at the column is. 📌 I did **not** delete the passthrough or the type fields: your deprecation window still sends the field, and removing them now would make the FE disagree with a live payload. **One line whenever the drop lands** — happy to do it in the task that meets the drop.
✅ **Answer 2, honestly — NO test would fail if the field vanished, and that is now the RIGHT answer.** Nothing reads it, so its disappearance is invisible **by design**: the mapper yields `null`, no render changes, no assertion touches the value. **Before this task the same "no" was the danger** — the chip read it, so a drop would have silenced an unlinked family's only evidence of a wall-QR check-in with neither repo objecting. 🔑 **What fails now is the regression, not the drop:** re-pointing the chip at `checkinSource`, or chipping a channel that should be silent. So the net is a test — but it is around *"do not read the deprecated column"*, **not** around *"the column still exists"*, and I would rather state that precisely than let it sound broader than it is.
🔑 ×7 mutations, `BASELINE=0` on a green suite, md5 identical on 4 files. Notes + Tanya's one check in the TASK §2. Nothing waits on me.

## 2026-09-27 — @Porter → @Sober: before the owner deploys, I need two things.
1. **The exact drafts, so I can put them in front of him:**
   - the move-notice wording, for the coach AND the parent, TH and EN, with a filled example;
   - Fern's toast draft.
2. **Is the move notice + group-seat rule already in the repos' current HEAD?** If the owner builds sid from the latest code today, does the move notice go LIVE with draft wording? If it does, either the wording gets approved first, or you tell me how it is held back. I will not let an unapproved parent message ship by accident.

Also, on D3: is the root host `develyst.online` really a host "we do not control"? It is the owner's domain family. I am asking him whether the root is his. If it is, the token only reached his own server's logs, and that changes the rotation question.

## 2026-09-27 — @Porter → @Sober: owner rulings, plus one new customer ask. REQ-109 §8.

**Rulings:**
1. **Admin rich menu: NONE.** Admins get no rich menu. Build it (XS?).
2. **Root `develyst.online` is the OWNER's server.** The D3 token only reached his own logs. **No rotation of the 21 calendar tokens.** Close that item.
3. **The missing staff calendar-link surface is FINE.** Coaches get their calendar link from LINE only. Close it.

**New, from Khwan:** "อย่างไรส่วนนี้ก็ใช้ไม่ได้ เพราะมันไม่อัพเดทในปฏิทินโทรศัพท์ เปลี่ยนเป็นกดแล้วส่งลิงก์หน้าเว็บเราให้แทนได้ไหมคะ". In practice the phone-calendar subscription does not update for coaches. She wants the calendar command to send a **link to our own web page** showing the coach's schedule, in place of the subscription.

**Analyse, don't build.** I need:
- (a) Is there already a coach-facing web schedule page? The coach web login with menu:calendar used in TEST-068 is a candidate. Could we just link to it?
- (b) If not, does a token page of the same shape as the D3 subscribe page, rendered as HTML, fit? Say what it shows: today and week, same statuses as REQ-109 §3/§7, the named children.
- (c) Login or token? Remember a token = the named children's schedule.
- (d) What happens to the existing subscriptions and the new subscribe page?
- (e) Size.

**Still pending from my last note:** the move-notice drafts (coach + parent, TH/EN, filled example), Fern's toast, and whether the move notice is in HEAD, i.e. whether a sid deploy today would ship draft wording.

From @Jason 2026-09-27: ⏸️ **TASK-528 STOPPED: "no menu" for ONE user is not something LINE can do while the account has a default menu, and ours is the unknown menu.** Nothing built.
- LINE shows **per-user → account default (API) → OA Manager default → nothing**. There is **no per-user "none"**. Our publish ends with **`setDefaultRichMenu(unknown)`**, so **unlinking an admin = the unknown menu**, the very thing ruled out.
  - Our own code says so (the relink plan: "default only to a follower with no per-user link"; TASK-250: "clear the default ⇒ no menu").
  - Not OA-tested (labelled). **Tanya can confirm** by unlinking her admin account on the demo OA.
- **The sweep:** it enumerates parents and teachers only, so it **never repairs an admin** (and never protects one).
- **Options (owner's: artwork + words):**
  - ⭐ **(a)** a one-cell per-user **admin menu** that opens the web app, plus an `admin` role in the sweep. It's the only per-user state that isn't the unknown menu. Needs an image + his words; then S for me.
  - **(b)** clear the account default: ❌ **new visitors would see NO menu** (no `follow` handling since `baa6015`), so sign-up disappears.
  - **(c)** leave it.
  - TASK-524's actions are unchanged in all three.
- **For Tanya:** photograph **after reopening the chat**; LINE can hold the previous menu until then.
- 📌 Noted: `develyst.online` is the owner's, so the D3 rotation item is closed.

## 2026-09-27 — @Porter → @Sober: owner rulings.

**1. Move notice: APPROVED, but in the HOUSE PATTERN.** The owner said "ให้ pattern คล้ายๆ กับอันอื่นๆ". Two corrections to your draft:
- Date and Time on **separate lines**, like every other notice.
- **English field labels in both languages**, like `❌ CLASS CANCELLED:` / Student / Program / Date / Time. No Thai "จาก/เป็น".

The main block is the NEW slot. The OLD slot goes on one appended line, `Was : <date> <time>`, the same way cancel appends Reason/Note.

**Coach** (every coach):
```
CLASS MOVED / ย้ายคาบ ‼️
Student : มะขิด
Program : Freeskate 1 HR
Date : 12-10-2026
Time : 14:00-15:00
Coach : Ek, Nok
Was : 05-10-2026 10:00-11:00
```

**Family.** The title follows the chat language: TH `📅 ย้ายคาบเรียน:` / EN `📅 CLASS MOVED:`. No coach, no reason.
```
📅 ย้ายคาบเรียน:
Student : มะขิด
Program : Freeskate 1 HR
Date : 12-10-2026
Time : 14:00-15:00
Was : 05-10-2026 10:00-11:00
```

**Toast** `ย้อนรายการแล้ว / Undone`: approved.

Pin these by value, replacing the drafts. **Tell me when they are green. The sid deploy waits on this.**

**2. Admin menu: option (a).** A one-cell admin menu, "open the web app". It needs artwork: make it in the same orange/bilingual style (stretch-safe 2500×843, or your call on size), plus the sweep learning the admin role. Propose the cell's words to me first. It rides the next deploy, not this one.

**3. Khwan's calendar ask (SPEC-095): Tanya device-checks first.** I am briefing her now. Nothing gets built until her result.

From @Jason 2026-09-27: ✅ **TASK-529 GREEN: the move notice is the owner's words, byte-pinned.** **3409 / 0 normally AND unreachable, 0 failed queries · tsc 0 · 60 = 60.** ▶️ Ready for your verify / release.
- The block is **the house block of the NEW slot** (the same list and order as the cancel notice). **`Was : <old>` is ONE appended line, last.**
  - **One new label, `Was`**, English, shared by both audiences.
  - The draft keys `From/To/จาก/เป็น` are removed, and both DRAFT markers are gone.
  - The stamp and titles were already the approved text (byte-unchanged).
- 🔑 **The mix is pinned by both halves:** the titles differ by language, and the labelled lines are identical across languages.
- **`Was` is always present from the producer** (`from` is built from the pre-move row's NOT NULL date/start). **The exception:** a hand-made partial payload drops the line, and it **never renders a bare `Was :`**.
- **One registry row honestly updated:** TASK-283's time-format audit now records the move notice as **printing a `Time`** (the new slot, both ends formatted in `announceMove`).
- **Six mutations bite:** From/To restored · Thai labels in the family copy · Coach in the family copy · family title tidied to English · slots swapped · Was above the block.
- 🚫 **`announceMove` untouched**: all TASK-516 behaviour is pinned green.
- ⚠️ **Reported, not harmonised:** the family **cancel** notice's `Reason` label is **Thai (`เหตุผล`) in TH**, while all its other labels are English (owner-approved TASK-410). The label **order** agrees everywhere.
▶️ Now on **TASK-530**: proposing the cell's words first.

From @Jason 2026-09-27: 📋 **TASK-530 §1: the cell's words proposed (DRAFT). Nothing built, no artwork.**
- **Big: `SOM SCHEDULE`**, the app's own name in the owner's spelling (TASK-357). It says what the thing IS, identically in both languages.
  - **Small: `เปิดระบบ · Open the system`**, which stays true in every case below.
  - Rejected: `ไปที่หน้าเว็บ` (a mechanism) · `ผู้ดูแลระบบ` (the person) · `เข้าสู่ระบบ` (the login button's word; false while a session is live) · `จัดการตาราง` (only one part).
- 🔑 **What it OPENS:** `/` goes to the calendar, or **`/login`** without a session.
  - **A live session rarely survives:** the backend token defaults to **12 h** (any 401 signs out to `/login`).
  - **LINE's in-app browser doesn't share cookies** with Chrome/Safari, so even a fresh phone-browser login meets the login page inside LINE (labelled, not tested).
  - ⭐ LINE's `?openExternalBrowser=1` opens the phone's own browser instead.
  - ⇒ **"open the web app" would over-promise; "เปิดระบบ" doesn't.**
- **The real size:** no menu cell opens a URL today (areas are typed **postback only**).
  - ⭐ **(i) a URI action**, a small widening; the other menus' areas stay byte-identical.
  - **(ii) a postback replying with a link**, which means an extra tap and a new message needing words.
  - Plus a new env key, **`PUBLIC_ADMIN_BASE_URL`**, read at publish (the publish refuses if it's missing), for the runbook.
- ⛔ **Please rule on three things:** the words · (i)/(ii) · `openExternalBrowser`.

From @Jason 2026-09-27: ✅ **TASK-530 built as ruled.** 🚫 Nothing published. **3433 / 0 normally AND unreachable, 0 failed queries · tsc 0 · 60 = 60 · nine mutations bite.**
- **Art: `assets/line/menu-admin.png`** (2500×843, 57 KB, orange house style): `SOM SCHEDULE` / `เปิดระบบ · Open the system`, with no divider.
  - It is drawn by **its own** `generate-admin-menu.mjs`. **A test reads every script in `assets/line/` and allows only that one to name the file**; that's the anti-overwrite mechanism (mutation G bites).
- **ONE area = the whole image** (pinned; the half-width mutation bites).
  - **Narrow widening:** `RichMenuArea` stays postback-only by TYPE, and the link area is its own type. **Every other menu is pinned postback-only.**
- 🔴 **The refusal, in three places:** `adminMenuUrl` throws (missing / non-https / `?` / `#`) · the script's preflight · **`publishRichMenus` resolves it first; with `fetch` spied, NOTHING reaches LINE.**
  - Plus `createRichMenu` refuses any link area without an https link.
- ⚠️ **`openExternalBrowser=1` is the one behaviour asserted from LINE's documentation, not observation.** Tanya can confirm on the demo OA.
- 🔑 **Sweep:** `admin` role with an **EMPTY fallback**, so an admin expects the admin menu or nothing, **never `unknown`** (mutation U bites).
  - On the unknown menu or the default ⇒ RELINK → admin; nothing published ⇒ BLOCKED.
  - Admins are listed **last**, so a coach/parent-admin keeps their role menu (the `detectLinkedRole` order), at link too.
- **Link door:** `settleAdminLink` lives in the register service. **RULE 1 refused my first placement in the chat, and it was right.**
- **Unchanged (pinned):** the three menus byte-identical · `setDefaultRichMenu(unknown)` once · TASK-524's actions · teacher/parent linking.
- `inspect-menus` needs no change: it shows `areas: 1 · (0,0 2500x843) action.type=uri data=<link>`.
- 🔑 **A pin strengthened:** adopt's "covers every menu publish creates" regex **couldn't see `createRichMenu(adminMenuFor(...))`**, so it would have passed while missing the 4th menu. Fixed.
- ⚠️ **Adopt** on an OA published before 530 now reports `missing smart-scheduler-admin`: **re-publish, then adopt.**
- 📌 **Yours:** the runbooks (+ image, + **`PUBLIC_ADMIN_BASE_URL`**) · after the publish, **the relink sweep moves the existing admins**.
▶️ **Nothing left for BE on the board.**

## 2026-09-27 — @Porter → @Sober: 🔴 TASK-518 is on screen but does not work, and TASK-514 regressed (Tanya, TEST-075 D4/D5). Screenshots viewed.

- **D4:** the ON LEAVE ⋮ `ย้อนการลา` and the ATTENDED ⋮ `ย้อนการเข้าเรียน` do **NOTHING** when clicked:
  - no dialog;
  - no `/undo` request;
  - no error.

  Tanya suspects the confirm dialog is mounted inside the menu item and unmounts when the menu closes (`UndoControl.tsx`). **The owner's Undo is still unusable on screen.**
- **D5 (regression of 514):** the ATTENDED row shows **`บันทึกลา/ป่วย`** again, with the dialog "จะใช้โควตาลาของคอร์ส 1 ครั้ง และเพิ่มคาบชดเชยต่อท้ายให้" (`U-th-attended-row-leave-label-regression.png`). Pressing it returns the row to CONFIRMED. That is exactly the misleading button 514 fixed at 03:35. TASK-518 appears to have re-introduced the old path.

This is a blocker for the next uat: fix both, **with a test that clicks through to the request** (your "the API works ≠ the feature exists" lesson, one layer up). Then sid redeploy, then Tanya.
From @Fern 2026-09-27: ✅ **TASK-531 FIXED (code)** — **631 pass / 0 fail** · tsc 0 · build ok · 4 source modified · 1 new test · 6 pins moved.
🔴 **D4 cause — Tanya's reading was right:** the dialog was returned from the same component as the menu item and the hosts placed it **inside `<Menu.Dropdown>`**, so the click that set `open` closed the menu and **unmounted the dialog before it could paint** — no dialog, no request, no error. **Fixed where the dialog LIVES**, not with a flag holding the menu open: `useUndoControl()` keeps the state at the ROW's lifetime and returns `{ menuItem, dialog }` — item in the dropdown, **dialog after `</Menu>`** on both hosts. ✅ **I scanned every `<Menu.Dropdown>` in `src`: no other dialog is inside one** — `confirmDialog`, `CancelBookingDialog` and the move `Modal` already live outside `</Menu>`; the Undo was the only broken one, and the roster's placement is pinned now so the pattern is held rather than remembered.
🔴 **D5 — how it came back, since "it regressed" is not a cause: nothing was restored.** TASK-518 removed TASK-514's ATTENDED branch **by your ruling** (one act, one door) — and with the Undo door dead (D4), **the leave item was the only thing an admin could press on an ATTENDED row**, dialog and quota promise included. So it is TASK-514 from the admin's seat and a planned removal from the code's. ⇒ **the leave item is now not offered on an ATTENDED row at all** (absent, not disabled — the Undo owns that act), with the label and the quota sentence pinned **ABSENT** there; every other row's leave flow is byte-identical.
🔑 **The proof you asked for: the act is DRIVEN, at the fetch boundary** (`mock.module` over the API client). All three states ⇒ `POST /bookings/<id>/undo` carrying **the row's own id** and the typed reason (or `{}`); a row with nothing to undo asks **nothing**; a refused act returns **the server's sentence with the holder intact and no success toast**; `UNDO_LEAVE_CHARGE_UNKNOWN` likewise.
⚠️ **And what is NOT proven, plainly: the mouse.** No DOM in this repo's test setup (no jsdom, no happy-dom, no testing-library; `playwright` is an unused devDependency with no harness) ⇒ **`onClick` → handler and Mantine's painting are not exercised.** Proven instead: the handler's whole effect, and by source that the dialog is outside the menu, that the item's `onClick` opens it, and that the hook returns both. **Therefore unproven by test:** the wiring of that `onClick` and the paint — I read both, and Tanya's pass is what confirms them. **A DOM harness is a dependency decision (package + preload + config): yours and the owner's, not mine to take inside a blocker.** Say the word and I will cut it as its own task — it would make *"a control is proven by clicking it"* enforceable instead of argued.
➕ While in there: **a LINKED teacher account is now offered no Undo door at all** — the server refuses it `403 SCOPE_TEACHER`, so a control there could only ever fail, and the guard sits beside the existing `canStatus = canAttend && !scoped`.
🔑 ×9 mutations, `BASELINE=0` on a green suite, md5 identical on 5 files — 📌 one slipped first: my host pins checked only **where** the dialog is placed, so a mutation that stopped the hook returning one passed; the returned element is pinned now. Notes + Tanya's run-order list in the TASK §2.
From @Fern 2026-09-27: ✅ **TASK-532 DONE (code)** — **635 pass / 0 fail** · tsc 0 · build ok · ⏱️ **the cost, stated: 1.6s → 2.8s (+1.2s, ×1.75)** for 4 clicked tests in one file; the 631 fast tests are ~1.6s of that, and I ran it twice to be sure the number is steady.
**Chosen: `happy-dom` + `@testing-library/react` + `user-event`** (4 devDeps incl. `@happy-dom/global-registrator`), loaded by `bunfig.toml` → `test/dom-preload.ts`. **Reasoning:** it runs inside **Bun's own runner** (no second command, no CI change), costs ~300ms per DOM file instead of the seconds a browser needs, and takes ~40 lines of stubs (`matchMedia`, `ResizeObserver`, `document.fonts`). 🚫 **Playwright rejected for THIS job, not in general** — it proves a real browser but needs a downloaded browser, a dev server and a separate command: right for a journey through the product, wrong for *"does this button do anything"*, which has to answer in the same second as everything else or nobody waits for it. ⚠️ **"Heavier than the problem" was a live option and I checked it before installing** — the whole thing is one preload and four tests, and it caught a real process-wide bug in its first hour, so I did not stop.
🔑 **Your gap is closed, and precisely which part:** a real `userEvent.click` on the menu item ⇒ **the dialog is found on screen** (the paint) ⇒ a real click on confirm ⇒ **`POST /bookings/<id>/undo` asserted at the boundary**, with nothing asked before it — for the **check-in** state and the **leave** state (a reason **typed into the textarea** arriving in the body), plus a **refused** act (the server's sentence on screen, **the dialog still open**, one attempt, no success) and a **CONFIRMED** row (no control to click). ⚠️ What remains outside ANY DOM harness: the real browser's CSS, focus, z-index and a phone's tap — named, so "clicked" does not come to mean "seen".
📌 **And the harness earned its place in its first hour by exposing a booby trap: `mock.module` is global to the test PROCESS.** My first version returned only the members this file needed from `@/hooks/scheduler` and **silently deleted the rest for every other file** — two unrelated suites failed with *"Export named 'useResolveClashMove' not found"*. Every mock now **spreads the real module** and replaces one member, with the reason written in the file. Worth passing on: anything less than a spread is a trap for whoever writes the next DOM test.
🚫 **The 631 are NOT converted**, and the boundary is stated at the top of `test/dom-preload.ts` — the file people will copy from: **a `.dom.test.tsx` is for a CONTROL** (pressed, irreversible or expensive — money, a message to a family, an undo), **not labels, not layout, not copy counts**; a harness used to assert text is centred is slow, brittle, deleted within a month, and takes the rule with it. Also: `tsconfig` now excludes `*.test.tsx` exactly as it already excluded `*.test.ts`. Notes + the when-to-reach-for-it note in the TASK §2.

From @Jason 2026-09-27: ✅ **TASK-533: the pin is built. The count was comments, not mocks.** **3442 / 0 both ways, 0 failed queries · tsc 0 · 60 = 60.**
- 📌 **The backend has ZERO `mock.module` calls.** The five grep hits are notes recording **TASK-072** (`a7d9322`), which replaced every whole-module stub with narrow `spyOn` + restore.
  - Its guard (`module-isolation.test.ts`) only proves three modules resolve, so **nothing stopped a sixth**. Now something does.
  - No test edited, and no subject touched.
- ⚠️ **A ruling for you: TASK-072's rule is stricter than this task's.**
  - Spreading fixes the loud half ("Export … not found"). **A spread mock still hands its one FAKE member to every other file in the process, silently.** TASK-072 chose "nothing leaks".
  - **I built YOUR rule** (spread, or a named exception), with the failure message recommending `spyOn` first.
  - ⭐ **Recommend "no `mock.module` except a named exception"**: a one-line switch, the same exception mechanism.
- **The pin** (`mock-module-scan-task533.test.ts`): walks all of src + scripts (>400 files) with comments stripped.
  - **Named exceptions** carry a reason (≥ 20 characters), and **a stale exception fails**.
  - **"Zero today" is pinned**, so the first real mock is a visible act.
  - The scanner is proven on samples, so a green scan over zero calls isn't a vacuous one.
- **Mutations:** a sixth, narrow mock in a real file BITES · the spread control passes the rule and trips only "zero today" (intended) · detection broken, comments not stripped, and a silent exception all BITE.
▶️ **Nothing left for BE on the board.**

## 2026-09-27 — @Porter → @Sober: owner ruling ("เอาตามแนะนำ"). **Tell the FAMILY when a make-up (EXTENDED) class is CANCELLED.** Use the existing family cancel notice's house pattern:
- `❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:`;
- Student / Program / Date / Time;
- no coach.

This closes the asymmetry with the move notice. Cut it, size it, and pin the wording by value against the existing cancel notice rather than a new draft. If a different Reason/Note line is needed for a make-up, propose it to me first.

It rides the next deploy with the move notice, the group-seat rule and the admin menu. The sid FE redeploy for D4/D5 is going ahead now.

## 2026-09-28 — @Porter → @Sober: 🔴 SEC-1 (Tanya), CONFIRMED by me. It is worse than her report.

**The prompt `code_admin` (`line-i18n.ts:215`) says "กรุณาพิมพ์รหัสแอดมิน (เช่น 229) / Please type the admin code (e.g. 229)".** The server check is `process.env.LINE_ADMIN_VERIFY_CODE ?? "229"` (`line-webhook.service.ts:424`). I checked the owner's local `.env`, `.env.sid` and `.env.uat` for presence only, without printing them: **all three set `LINE_ADMIN_VERIFY_CODE` to exactly the default shown in the prompt.**

⇒ If the uat server matches its `.env.uat`, then **anyone who follows the REAL OA** can do `สมัคร` → `แอดมิน`, type the number the bot shows them, and **become an admin**:
- they receive every family's leave notices and other admin notices, which is PII;
- there is no approval step.

**Fix (S), this goes ahead of everything:**
1. Remove the example from both prompt strings. A prompt must never contain a credential.
2. No default: if `LINE_ADMIN_VERIFY_CODE` is unset or short, refuse admin linking with a neutral line and log it loudly.
3. Enforce a minimum strength, e.g. 8+ characters, and **refuse to boot or refuse admin linking if the value equals the old default**.
4. Rate-limit wrong admin-code attempts per LINE user.
5. Consider requiring super-admin approval like teacher links. Propose; the owner rules.
6. **A read-only DATA REQUEST: list the admin LINE links on uat and on sid** (display name plus linked-at, no ids needed), so the owner can spot anyone who should not be there. Give me the SQL.

The owner is being told now to change the code on both servers immediately (config only, a restart).

Separate: SPEC-095 device result is in (TEST-075). The feed updates within 1 s, but **on Android the Subscribe button does nothing** (LINE and Brave); only Google Calendar web "From URL" works, and it re-polls in hours. No iPhone was tested. I am taking it to the owner as supporting Khwan's web-page link. Stand by to cut SPEC-095 on his word.
➕ SEC-1: the owner has changed the admin verify code (the value is not shared). The code fix + DATA REQUEST SQL are still needed.

## 2026-09-28 — @Porter → @Sober: ▶️ **SPEC-095 GO, as Khwan asked** (owner: "ทำตามที่ขวัญขอเลย"). REQ-109 §8, last bullet.

- The coach's calendar command replies with a **link to our web page showing that coach's schedule**. It **replaces** the subscription link in the reply.
- The page is a **token page with no login** (your option (b)/(c)): today plus this week, the same formatter and statuses as the LINE schedule, and English labels as approved.
- Keep the `.ics` feed and the subscribe page alive so existing subscriptions keep working. An "add to phone calendar" line on the new page is your call. **Say whether the Android Subscribe button can be made to work** (e.g. a Google Calendar add-by-URL link) or whether to drop that button, since Tanya proved it does nothing on Android.
- Update the teacher help-list line for `ปฏิทิน` to match. It currently says "ลิงก์ปฏิทินสอนทั้งหมด"; propose the new wording to me.

It rides the next deploy after SEC-1. SEC-1 stays top priority. Note: the owner changed the admin code on **sid only**. uat still runs the old default until he acts; that is his decision, and it is recorded.

## 2026-09-28 — @Porter → @Sober: ⛔ CORRECTION to my SPEC-095 GO. **Do NOT build a token page.** The owner clarified ("ก"): Khwan's "หน้าเว็บเรา" is the **EXISTING Schedule page of our web app**, where a coach logs in and sees only their own classes (your SPEC-095 answer (a)).

Scope becomes:
- **The calendar command replies with a link to that page** on the box's own web host (sid: som / uat: frontoffice), replacing the subscription link. Open it in the phone's browser (`openExternalBrowser=1`, as with the admin menu) so a login session can persist.
- **Prerequisite, and the real question:** a coach needs a web user linked to their teacher record (users ↔ teacher link, migration 0044). Tell me:
  - how many coaches on uat have one today (a read-only count, as a DATA REQUEST if needed);
  - how the shop creates one today (Users page, teacher link, `menu:calendar`).

  If most coaches have none, the owner and Khwan must know that before this ships, because every coach would land on a login page they cannot pass.
- What a logged-in coach sees there: confirm it is only their own classes (the scoping from REQ-106 / TEST-068).
- The help-list wording for `ปฏิทิน`: propose it.
- Keep the `.ics` feed and the subscribe page alive for existing subscribers. Stop advertising them in the reply.

Size it. SEC-1 stays first.
➕ **The owner answers your prerequisite: NO coach uses a web account today, not one.** Do not count it and do not raise a DATA REQUEST. Build the link to the existing Schedule page as scoped. Creating coach web accounts is the shop's own onboarding, outside this task. Just make sure the Users page can create a coach user linked to their teacher record with the calendar menu, and tell me if it cannot.
➕ **Withdraw my extra "make sure the Users page can create a coach user" check.** It is not needed; the owner will handle coach accounts himself. Your queue is only: (1) SEC-1, then (2) the calendar command linking to the existing Schedule page, then (3) the make-up-cancel family notice.
➕ **The owner confirms the calendar scope in his own words:** "ส่งลิ้งไป ให้ครูล็อกอินเอง แล้วเข้าไปใช้เว็บ แบบบนมือถือ แค่นั้น".
- `calendar` / `ปฏิทิน` sends a link to the web app. The coach logs in and uses the web on their phone. **That is all.**
- Replace today's subscribe-link reply entirely.
- No new page, no token page, no counting.

## 2026-09-28 — @Porter → @Sober: two minor findings from TEST-075 that were in the file but not in her inbox note. Queue them behind SEC-1, the calendar link and the make-up cancel.
- **F1:** an undone leave keeps the leave's reason in the booking **Note**, so a CONFIRMED session still reads "Note: <leave reason>" (`B-modal-confirmed-actions.png`). Undo should clear or restore the note the leave wrote.
- **F2:** the leave dialog on a **1-HR** booking promises "uses one of the course's leaves and adds a make-up session". A 1-HR leave does neither (`leaveRefunded:false`, `makeupCancelledId:null`). This is the same misleading-dialog shape as TASK-514; the body should follow the booking type.

F3 (marking attended 8 days early) and F4 (API ignores a non-group `groupId`) are noted only. No action unless you disagree.

## 2026-09-28 — @Porter → @Sober: owner ruling. **Build a way to REMOVE admin rights from a LINE account.** Today there is no admin-unlink control. The demo phone is stuck as an admin and will receive admin leave notices once pushes resume on 1 Oct.
- Put it where the shop already manages LINE links: the "LINE links" page in the admin web. It lists the LINE accounts linked as admin, and a remove button for each. **Super admin only.**
- On removal, that LINE account falls back to its other role's menu (parent/coach), or to the visitor menu. The sweep must agree.
- Keep it simple: one list, one button, a confirm dialog. It is proven by a real click (your standard).

Queue: SEC-1 → calendar link → make-up cancel notice → this → F1/F2.

From @Jason 2026-09-28: ✅ **TASK-534 (SEC-1): the door is shut in code.** **3458 / 0 normally AND unreachable, 0 failed queries · tsc 0 · 60 = 60 · six mutations bite** (the example restored · the default restored · the chat told why · the limit off · the strength weakened · the typed text logged).
- ⚠️ **On deploy:** all three env files still hold the old value, so **admin linking is REFUSED everywhere until the owner sets a new 8+ character code** (the log shouts `… is retired`). That's the door shut.
  - 🚫 **Existing admins, including any who got in through the hole, stay linked** until the owner acts on the DATA REQUEST. **The fix closes the door; it doesn't empty the room.**
- **1. The prompt** has no example. **A RULE over all 232+ chat strings:** no secret prompt carries an example, and the retired value appears nowhere.
- **2. No default** (the webhook reads the env only through the gate). **Refused (not the boot):** unset / short / **retired (`229`, even if re-set)**. `.env.example` has an empty placeholder with the rule.
- **3. 8 characters:** phone-typeable, ≈20M hours per account with the limit, **the same minimum as the web bootstrap password**. Constant-time compare.
- 🚫 **ONE identical reply** for wrong / unset / short / retired / over-limit (**even the right code**), strike 1, nobody linked. Pinned through the real dispatcher.
  - The log says why, never the typed text, the value, or its length.
- **4. Rate limit:** the **shop-front limiter reused** (its limits are now constructor parameters; the shop-front defaults are unchanged and pinned). **5 misses / 60 min per LINE user.**
  - 🔴 **Finding: the two-strikes mute was NOT a limit.** `เปิดเมนู` clears it, so miss-miss-unmute-retry was unlimited. Now pinned closed.
- 📌 **Approval-ready:** the gate is one call in front of the success half. Approval would replace *add id + menu + "linked ✅"* with *queue a request* (the teacher pattern); the gate doesn't move.
- 📋 **DATA REQUEST SQL in the TASK (§5).** ⚠️ **There is NO display name and NO linked-at in our data**: admin links are bare ids in one row, and `updated_at` is only the list's last change.
  - The SQL gives the count, the last change, and each link named where our data knows the person (coach/parent), else `…xxxx`.
  - 🔑 **Hole-linked and legitimate admins are INDISTINGUISHABLE**, so emptying the list and re-linking is **the owner's call**. I'll draft that one-row write on his word.
▶️ **Nothing else for BE on the board.**

From @Jason 2026-09-28: ✅ **TASK-535: it was NOT a route reaching a database. It was a TIMED-OUT test leaking into the next one, proved deterministically.** Fixed without narrowing. **5 consecutive unreachable runs with plain `bun test` (your command, 5 s default): 3459 / 0 each, 0 failed queries** · reachable 3459 / 0 · tsc 0 · 60 = 60.
- ⚠️ **Why my reports missed it:** I always ran `--timeout 90000`, and you ran plain `bun test`. **The defect only exists under the 5 s default.**
- 🔑 **The mechanism** (forced `--timeout 100` reproduces your exact two failures every time):
  - Under load the "every key" sweep (normally 0.2 s) crossed 5 s. **Bun doesn't stop a timed-out test**, so its loop ran on under the NEXT test's no-grant fakes ⇒ **`FORBIDDEN`**.
  - **Its `finally` then restored the REAL `findUserById` mid-next-test** ⇒ a real query ⇒ **`500` / `ECONNRESET`**.
  - The database was reached only AFTER the timeout un-faked it. **No route added since TASK-504 reads anything here: all routes are stubs.** TASK-488's "flake" fits exactly.
- **When:** not a commit. **The old sweep rebuilt every route per request (cost grew with routes × routes)**, so it crept toward the limit with each route added.
- 🔑 **Next route safe:**
  - fakes live in the describe (no cross-test leak);
  - a **TRIPWIRE** on every DB entry point **names** any unfaked read in the failure (proved: `db.query.users.findFirst`);
  - routes are stubs by construction; **a pin: the guards' awaited reads are exactly verifyToken · findUserById · effectiveGrantKeys**;
  - built once and signed once, **0.20 s → 0.043 s**, same coverage (floor kept);
  - an explicit budget.
  - **Not narrowed**: mutation N proves narrowing fails.
- **No other file regressed.** JUnit per-test times: the only tests near 5 s (the crash-policy and outbox boot tests) already carry 30–70 s budgets and use no spies.
- **Mutations** (under `--timeout 100`): budget removed · unfaked read (named by the tripwire) · new guard read · narrowed sweep: all BITE.
- ⭐ **Your call:** `bunfig.toml [test] timeout = 90000`, so plain `bun test` = the documented command and nobody verifies a different suite than the engineer ran. It closes the class. Not done without your word.
▶️ **Nothing else for BE on the board.**

From @Jason 2026-09-28: ✅ **TASK-536: the calendar command sends the web app.** **3471 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 60 = 60 · six mutations bite** (subscribe link re-advertised · openExternalBrowser dropped · a second key · the feed deleted · a broken link when unset · the approved help line changed).
- **The chip / `ปฏิทิน` / `calendar`** ⇒ `<PUBLIC_ADMIN_BASE_URL>/?openExternalBrowser=1`, alone on its line (by value).
  - **TASK-530's builder and key, reused.** Pinned: exactly three `PUBLIC_*` names in src.
  - The scope is untouched.
- **Key unset ⇒ the generic-error sentence + a loud log**, never a broken link.
  - ⚠️ **Runbook: this key is now needed at RUNTIME on every box that answers coaches**, not only at publish.
- **Asking mints no token any more.** `cal_link` / `cal_not_teacher` are removed from the copy (nothing sent them).
  - 🚫 **The subscribe page and the `.ics` feed are pinned STILL ANSWERING (200) and still mounted**, and deleting the feed BITES.
- 📋 **Words (TASK §3):**
  - **the reply (DRAFT, shipped, form-pinned):** "📅 ตารางสอนของคุณอยู่ในระบบ SOM SCHEDULE: / <link> / แตะลิงก์ แล้วเข้าสู่ระบบด้วยบัญชีที่แอดมินให้ไว้" (+ EN);
  - **the help line (approved copy, NOT shipped):** ⭐ "· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ" / "· Calendar — Link to the web app: your schedule on your phone".
- ⚠️ **What a coach with no account sees:** the phone browser opens "เข้าสู่ระบบสำหรับทีมงาน / Sign in for staff" (username + password), **with nothing on it saying how to get an account**, and any attempt reads "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง".
  - ⇒ **Every coach's first experience today is a page they can't pass.** The reply's last line is the only thing pointing them to the admin.
- 🔴 **For the owner's onboarding:** a coach sees only their own classes **because the web account is LINKED to their teacher record** (TASK-406).
  - **An account made WITHOUT that link is unscoped: every coach's classes and the families' names.** That's the one field onboarding must never skip.
▶️ **Nothing else for BE on the board.**

From @Jason 2026-09-28: ⏸️ **Ready for the make-up-cancel family notice, but there is no TASK for it yet.** Your note names it as next, but there's no `TASK-537` file under `tasks/` and no board row. I build only from a TASK file, so **nothing is started**. Please cut it; I'll pick it up on the next nudge. (Noted: the reply's last line, "log in with the account your admin gave you", stays pinned as load-bearing.)

From @Jason 2026-09-28: ✅ **TASK-537: an admin's cancel of a make-up tells the family; a leave Undo doesn't. Told apart STRUCTURALLY, not by a condition.** **3479 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 60 = 60 · four mutations bite** (family told on Undo · admin silenced · a cancelled seat's family told · a replacement promised).
- 🔑 **How:** the admin's cancel calls **the ONE family sender** (it was CONFIRMED-only). **The Undo cancels its make-up inside `undo.service` and calls ONLY the coach sender.** Widening the family sender therefore can't reach an Undo.
  - Pinned: admin by value through the **real `updateBookingStatus`**; Undo by source and by the real `undoBooking`'s "no non-teacher row".
- **Its own kind, `makeup_cancelled_parent`**, with **no Note**, because the CONFIRMED notice's Note is chosen by SHAPE (*"a make-up has been added"*). For a make-up that's a promise, and **it can be false** (ended course / extension ceiling / locked leave add nothing).
  - The CONFIRMED notice is **byte-identical**. The household rule is reused, cancelled seats excluded.
- 📋 **Words (DRAFT, form-pinned):** ⭐ **the SAME title as the approved cancel** ("❌ ยกเลิกคาบเรียน:" / "❌ CLASS CANCELLED:") + Student / Program / Date / Time.
  - Naming it "make-up" invites "is another coming?".
  - **Proposed, not built:** a Note only when the re-plan **actually appended** a row, naming its date (the owner's words, plus a small plumb).
- ⚠️ **Two findings for your ruling:**
  - (1) 🔴 **An admin's cancel of a make-up tells NO COACH.** The admin path's coach notice is CONFIRMED-only (TASK-370); TASK-510 covers the Undo's make-up and the CONFIRMED cancel, not this. ⇒ **the family is now told and the coach isn't, for the same act.** Not changed (§2); it's a one-line gate if you rule it in.
  - (2) **The ONE family sender has three callers**, so **a coach's OWN leave that cancels a make-up now tells the family too** (and the OTHER-series cancel-all). Real cancellations, not Undos. I kept one rule. Say if the leave case should stay silent (that would be a structural split).
▶️ **Nothing else for BE on the board.**

From @Jason 2026-09-28: ✅ **TASK-537 addendum: finding 1 built.** The coach gate is now **CONFIRMED or EXTENDED** (one line, same words; PENDING still tells no coach). **One admin make-up cancel ⇒ every coach AND the family**, pinned together through the real cancel. A PENDING make-up tells neither. Two existing gate pins moved (same claim). **Mutations:** coach silenced again BITES · PENDING let through BITES. **3481 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 60 = 60.** ▶️ Nothing else for BE on the board.

From @Jason 2026-09-28: ✅ **TASK-538: the list and the removal.** **3492 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 60 = 60 (no key added) · four mutations bite** (non-super-admin removes · messaged · left on the admin menu · list not written).
- 🔑 **The guard is `requireSuperAdmin`, not an action key.** An action key is **grantable** (`hasAction` = super admin OR granted), so it would make this **delegable**, not super-admin-only. **Every power over who-can-do-what (users / roles / grants) already uses `requireSuperAdmin`.** Pinned through the root app: a non-super-admin WITH grants gets 403.
- **For Fern (TASK-539):**
  - `GET /api/users/line-admins` ⇒ `{ admins: [{ ref, idTail, alsoTeacher, alsoParent, afterRemoval }], notKnown: [3 sentences] }`. `ref` is opaque; **no LINE id in the response**; **no displayName / linkedAt field exists**, and `notKnown` says why.
  - `DELETE /api/users/line-admins/:ref` ⇒ `{ removed: { ref, idTail }, afterRemoval, menuSettled }` · 404 `NOT_FOUND` "ไม่พบบัญชี LINE แอดมินนี้".
  - (`:ref` is declared in `FREE_FORM_PARAMS`, count 3 → 4.)
- **Removal:** the id comes off the list FIRST (notices stop), then the menu (coach ⇒ teacher menu · parent ⇒ parent menu · nobody known ⇒ per-user link removed ⇒ visitor default). **Never the admin menu.**
  - A LINE failure ⇒ still removed, `menuSettled: false`, loud log.
  - **The sweep agrees:** a removed pure admin isn't listed at all.
  - 🚫 **No message** (behaviour + source); a server-log audit line only.
- ⚠️ **Self-removal / lockout: NOT a lockout.** Web super admins and LINE admins are separate identities (we can't map one to the other), so the page is never lost. **Granting LINE admin is the CODE, not a super-admin act.**
  - **But:** with zero LINE admins, notices go to nobody (one skipped row, TASK-152), and **until the owner sets a new 8+ code, nobody can re-link.**
  - ⭐ The order: new code → real admins re-link → remove unknowns. **The demo phone can go first, today.**
▶️ **Nothing else for BE on the board. TASK-539's shape is there.**

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-539 done — the LINE-admin list and Remove, clicked end to end.** 658/0 in 3.2 s (was 635, **+23**) · tsc 0 · **8 mutations bite, none slipped** — see `tasks/TASK-539-line-links-page-remove-admin-fe.md` §1–§7.
⚠️ **One thing in §1 I could not build as written, and did not derive around: there is NO action key.** TASK-538 added none deliberately (*a key is grantable ⇒ the power becomes delegable*), `ACTION_KEYS` stays 60, so the gate is **`session.user.isSuperAdmin`** — the Users/roles pattern. 🔑 **A 61st key would have been worse than the mismatch:** a granted non-super-admin would see a button that always 403s, which is the failure §1 quotes TASK-518 to prevent. **Your rule is kept literally:** no super admin ⇒ **no panel at all**, and **the list is never even fetched**. No key anywhere, pinned by ABSENCE.
🔑 **Clicked:** Remove ⇒ dialog ⇒ confirm ⇒ `DELETE /users/line-admins/<that row's ref>` once, nothing sent before the confirm; **a refusal keeps the row AND the dialog with the server's sentence and raises no notification at all.** ✅ Unnameable rows say *“unknown account”*; `notKnown` rendered as sent; the dialog names what is KEPT and **never “deleted”** (Thai `ลบ` pinned to `ไม่ใช่การลบ` only); `menuSettled:false` said as a warning, not a clean success; 🚫 no optimistic update.
⚠️ **Declared:** I **narrowed** the Users page's *“no `api.delete` in this file”* pin (TASK-538 put a second resource there) to what it always meant — no DELETE of a **user**, plus the exhaustive list of DELETEs allowed ⇒ **stricter than before**. M7 proves both halves bite.
📋 **The copy is a DRAFT both languages, pinned by form** — over to you for the owner. 📌 **Two harness facts for SYSTEM-FACTS if you want them:** Bun has **no auto-cleanup** (renders leak into the next test and the failure names the wrong one), and **a Mantine modal's shell/title survives a close transition happy-dom never finishes** (so a title can never prove a close — probe inside `{target && …}`).
⚠️ **Still not proven, same limit as TASK-532:** CSS, focus, z-index, a phone's tap. ⚠️ `bun run lint` is not wired in this repo — not new, and I did not add config to make it green; tsc is 0. 🚫 No deploy request.

From @Jason 2026-09-28: ⏸️ **TASK-540 STOPPED: the pre-leave note is UNRECOVERABLE and the leave's own note is UNDETECTABLE, so even the partial fix can't be honest.** Nothing built.
- **Both leave writers do `note: reason ?? oldNote`:** a leave with a reason overwrites in place, and nothing copies the old note.
  - No audit table exists. The leave notice's payload carries `attendeeNote`, not the reason.
  - **`booking_undos` can't carry it as built:** it's written AT UNDO, after the overwrite. The only moment the old note exists is the leave's own write.
- 🔑 **"Clear only when it's EXACTLY what the leave wrote" needs to know what the leave wrote, and nothing stores that either.** At Undo, (a) the leave's reason R and (b) an admin's own note A that a reason-less leave left alone **look identical**. Clearing kills A; keeping leaves R. So I stopped.
- **Proposed exact fix (S, migration 0060 ⇒ 61 = 61):**
  - both leave writers record `leave_note_replaced` + `note_before_leave` in the same UPDATE;
  - the Undo restores only when `replaced`, otherwise leaves the note alone;
  - **pre-deploy leaves are untouched** (honest: unknowable). Tanya's row is one of them;
  - optionally `booking_undos.note_before / note_after` for the audit.
- ⛔ **Your ruling please.**

From @Jason 2026-09-28: ✅ **TASK-540 built as ruled: migration 0060, two columns + the restore, no audit columns.** **3499 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · four mutations bite** (admin note cleared · reason left behind · edit not superseding · a writer bypassing).
- **Both leave writers go through ONE helper** (`lib/leave-note.ts`): a reason ⇒ `note = reason` + `replaced = true` + `note_before_leave`; none ⇒ note untouched. The `reason ?? note` semantics are exact.
  - **The Undo restores only when `replaced`**, otherwise it doesn't touch the note.
- ⚠️ **One edge closed within the proportion:** a staff note EDIT during the leave would otherwise be overwritten by the restore (the quieter defect, created by the fix). **The one edit path resets `replaced`** (one line, no column).
- **By value, through the real `undoBooking`:**
  - with a reason over the admin's note ⇒ the admin's note is back;
  - over no note ⇒ empty;
  - **a reason-less leave ⇒ the admin's note survives**;
  - **pre-0060 ⇒ untouched (Tanya's row: not fixed by this, as you said)**;
  - the check-in Undo never touches the note.
- **Moved:** migration-count pins 60 → 61 (61 lines; the script touched only file / journal / witness counts); TASK-492's door pin names the helper; 0059 is pinned by index.
- 🔴 **Deploy order is load-bearing: `db:migrate` BEFORE the new code**, or every leave write fails on the new columns.
▶️ **Nothing else for BE on the board.**

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-541 done — the leave dialog follows the ROW.** 665/0 (was 658, **+7**) · tsc 0 · **build ok** · **6 mutations bite, CHECKSUM verified** — see `tasks/TASK-541-one-hour-leave-dialog-promises-what-it-does-not-do-fe.md` §1–§7.
🔑 **The set, derived not enumerated: there is no per-type table at all.** The server does the quota spend and the make-up inside ONE condition (`current.courseId && current.course`) ⇒ **the deciding fact is COURSE-BACKED, not the type.** 📌 **A type-keyed rule would have been wrong for every GROUP SEAT** — seats are ordinary rows with their own `courseId`, so two seats in one group can deserve different sentences. All six types are still named in a `Record<BookingType, …>` so a seventh forces a decision. **1-HR · trial · voucher · OTHER (camp day included) · the GROUP row ⇒ nothing claimed.**
⚠️ **Two residual overstatements — your call, not my guess.** (1) **Over-quota course leave**: spends nothing, appends nothing (`locked`), yet the course body promises both. **FE-knowable** (`course.leaveRemaining` + `adminUnlocked`), **one line in `leaveClaimKey` plus one copy key** — but **§2 pins that sentence byte-identical**, so I did not touch it. (2) **`planned_at_creation`**: the make-up IS appended and **no quota is charged** — 🚫 **`plannedAtCreation` is not in `BookingDTO` at all**, so this is the contract question your §1 told me to stop on.
📋 **The no-course words are a DRAFT pinned by ABSENCE of the claims** (EN `adds a make-up` / `uses one of the course`; TH `เพิ่มคาบชดเชย` / `จะใช้โควตา`) — **the owner can redraft without unpinning the promise.** The body says only what the server always does: recorded as leave, coach and admins told, and then denies both claims — because *“nothing happens”* is not the reassurance an admin needs before recording a leave.
⚠️ **Declared:** two existing Undo pins (`undo-control` §3, `undo-click` §4) froze `message: t("confirmAction.leaveMsg")` — **the line this task changes.** Updated to `t(leaveClaimKey(booking))`, with what they protected kept (one entry point; the course copy byte-identical). 📌 **No DOM test on purpose: a sentence is not a control.** 🚫 No BE change. 🚫 No deploy request.

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-541 ADDENDUM done — residual (1), the over-quota course leave.** 670/0 (was 665, **+5**) · tsc 0 · build ok · **9 mutations bite, CHECKSUM verified** — see the TASK's `# ✅ ADDENDUM` section A§1–A§5.
🔑 **An over-quota course leave now says what it does:** nothing spent, nothing added, **rescheduling stays locked until an admin unlocks it** — and the **within-quota** course sentence is still byte-identical (A9 bites if it drifts, by my pin and TASK-518's).
⚠️ **One thing worth your notice beyond this task:** `dtoToBooking` is an **allow-list**, and **neither `leaveRemaining` nor `adminUnlocked` was mapped** even though `BookingDTO.course` has carried both all along — *the compiler will not say*, so those facts were invisible to every screen. The row now carries `courseLeave` **as sent**; 🚫 nothing derived in the mapper, pinned by absence.
🔑 **The locked sentence is said only when we POSITIVELY know the quota is gone.** No leave facts ⇒ today's words, because **swapping one pair of claims for another on a guess is this defect in the opposite direction** (mutation A4 is exactly that, and it bites). ✅ An **admin unlock** restores the quota-and-make-up truth, mirroring `canTakeLeave`.
✅ **The new body reuses the toast's own vocabulary** (*rescheduling locked*), pinned both languages — *the dialog and the outcome must not read as two problems* — and it names what the admin must do next. 📋 Both new sentences remain DRAFTS pinned by the shape of the claim: the owner can rewrite every word without unpinning the promise.
⏸️ **Residual (2) stays with TASK-542.** Once `plannedAtCreation` is on the DTO it is one more branch here (make-up appended, **no quota charged**) — I will take it as an addendum the same way. 🚫 No BE change. 🚫 No deploy request.

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-543 done — the dropped set is written down, and the class is narrower than we assumed.** 678/0 (was 671, **+7**) · tsc 0 · build ok · **7 mutations bite, CHECKSUM verified** — see `tasks/TASK-543-the-mapper-drops-dto-fields-silently-fe.md` §1–§6.
🔑 **All 36 top-level `BookingDTO` fields ARE mapped** — the dropped set up there is **empty**. **What hides fields is a nested object the mapper REDUCES** (`course` → id + lock · `student` → two names · `teacher` → an id · `subject` → a name); one passed through **whole cannot hide anything.** ⇒ 📌 **the danger is every place we take a PIECE of an object**, which is a sharper statement than *“the mapper drops fields”* — and it is exactly where the two lost facts lived.
📋 **27 declared drops, a reason each** (course 16 · student 6 · teacher 3 · subject 2), plus `DROPPED_TOP` **deliberately empty** — the pin that makes the next accidental top-level drop fail at once. ⚠️ **Placeholder reasons are rejected too** (*“not used”*, *“TODO”*, *“-”*), and counts are asserted **per set**, not over a merge (two objects legitimately drop an `id`, and a merge would hide one reason — the failure shape this file exists to catch).
🔨 **Writing the reasons caught a duplicated rule in my own addendum, and I fixed it here.** `CourseSummary.leaveLocked` = `leaveUsed >= quota && !adminUnlocked` = **exactly `!canTakeLeave`**: the server already sends the conclusion and yesterday I rebuilt it from two fields. The row now carries **`courseLeaveLocked` as sent**; pinned by ABSENCE that neither the rule nor `dtoToBooking` may hold that condition (mutation D7 bites). **Behaviour unchanged by construction** — and 📌 **two of yesterday's nine mutations no longer exist because the code they broke is gone**; the pin that replaces both is *the FE does not derive this at all*. **If you would rather I had reported it than changed it, it is one line to revert** — I judged that leaving a knowingly duplicated rule while filing a task about invisible drops would be the wrong trade.
📌 **Named, not fixed, per your §1:** **`dtoToTeacher`** and **`dtoToCourseView`** (the widest of the three ⇒ **the least visible omissions**). 🚫 **Nothing outside `lib/api/mappers.ts` has this shape** — services hand DTOs straight to hooks — and I pinned that the file exports exactly three `dtoTo*` so a fourth cannot appear unnoticed.
⚠️ **Stated limit:** it is a **source-derived** check (interface block + mapper body as text) — **it cannot see a field inherited via `extends` or added to a type alias**; none arrives that way today. 🚫 No generated mapper, no runtime check, per your §2. 🚫 Nothing newly mapped — the one mapper change **removed** two fields. 🚫 No BE change · no deploy request.

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-544 done — all three mappers declare their drops**, and 🔴 **one finding I stopped on.** 682/0 (was 678, **+4**) · tsc 0 · build ok · **8 mutations bite, CHECKSUM verified** — see `tasks/TASK-544-the-other-two-mappers-declare-their-drops-fe.md` §1–§6.
✅ **Both drop nothing at their top level** — and `dtoToTeacher` shows **why**: its one nested object is **reduced AND kept whole** (`subjects` → names, `subjectOptions` intact). 🔑 **A reduced-and-kept object cannot hide a field** — exactly what `course` did not do. Both halves pinned (E2 bites). `dtoToCourseView` carries all 18 summary fields; `row.student` → the name declares **7 drops with reasons**. **34 declared entries across three mappers, each with a reason.**
🔴 **The finding you expected, and it is worse than a drop: `dtoToCourseView` INVENTS.** `CoursePackage` requires `startDate`/`weekday`/`startTime`; `CourseSummary` sends none, so the mapper fills `""`, `0`, `"09:00"`. 🔑 **A dropped field is `undefined` and readers are guarded; a fabricated one is a plausible value nobody questions** — `"09:00"` is a real time and `0` is Sunday. 📌 **No reader found today** (plan flow/modal read a booking's or plan group's times) — ⚠️ **“no reader found”, not “no reader possible”.** 🚫 **STOPPED, not fixed:** the fix is either **the server sending the three** (a contract question, like TASK-542) or **the view not requiring them** (a type change with readers to check). **Your call which.** ✅ Declared, and pinned by literals so a **fourth** invention fails (E5).
✅ **Generalise or repeat: half, and I am saying which half.** The four helpers are shared — one mechanism, no second invention. The **declarations stay three explicit lists**, because a table through one loop would hide which mapper an entry belongs to, and *a check nobody can read stops being maintained.*
⚠️ **Limit restated and sharpened:** source-derived ⇒ `extends` is invisible — 📌 **and `CoursePackageView extends CoursePackage` is precisely where the invented fields live**, which is why that pin uses literals rather than field names. 🚫 Nothing newly mapped, no screen changed, no BE change, no deploy request. ✅ The three-`dtoTo*` pin holds (E8: a fourth mapper has nowhere to hide).

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-545 done — the course view can no longer invent times.** 682/0 · tsc 0 · build ok · **5 mutations bite, CHECKSUM verified** — see `tasks/TASK-545-the-course-view-stops-inventing-times-fe.md` §1–§6.
✅ **`Omit`, not optional fields** — one line: **an optional still invites a reader, and these values are plausible**, so optionals would give a future reader `undefined` and a silent blank; `Omit` gives them a **compile error before it ships.** 🚫 `CoursePackage` untouched and pinned (the plan flow's times are real).
🔑 **Readers: ZERO, derived by the compiler.** Producer set is closed (`dtoToCourseView`, `toCourseView`); removing the three makes any read a type error and **tsc is clean.** ⚠️ **And the derivation is proved non-vacuous** — F1 and F3 show the compiler firing on exactly this type, so **its silence is evidence, not luck.** 📌 **Gap stated: tsc excludes test files**, so that half rests on the green suite (the fields are genuinely absent at runtime) plus a grep — weaker, and I am saying so. ✅ Corroborated by an older pin I did not write: `expiry-warning.test.ts` already asserts `not.toContain("course.weekday")`.
🚫 **No rendering change and no guard was forced** — tsc clean with no edits outside the two files is that statement; **no `?? ""` anywhere**, since a guard preserving a fabricated default only moves the lie one layer up.
✅ **TASK-544's pin now says something stronger:** *“this mapper invents NOTHING — no literal-valued key at all”* (plus the `Omit`, plus `CoursePackage` keeping all three). **It cannot pass merely because the three are gone** — F2 re-introduces `weekday: 3` and bites — and the empty set is itself pinned. 📌 **F1/F3 are caught twice now: the compiler became a second net, which is the gain of fixing the TYPE rather than the values.**
⚠️ **Not done, by design:** giving the view real times. If something ever needs them, **that is the contract question for @Jason** — and it will arrive as a compile error, not as Sunday 09:00 on the owner's screen. 🚫 No BE change · no deploy request.

From @Jason 2026-09-28: ✅ **TASK-542: `plannedAtCreation` on the admin DTO, raw** (`true` / `false`, never undefined). The full key set is pinned: 33 + 1 = 34, nothing else moved. **3504 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · three mutations bite** (leaked to public · wrong value · a stray field).
- 🔒 **Public: CONFIRMED unaffected.** Every public check-in answer goes through `toPublicCheckinBooking`'s six-field allow-list (by value + by source; a leak mutation BITES). The camp scan uses its own allow-list, not this builder.
- 📌 **The scoped teacher SEES it on their own rows.** Scope filters rows and masks only provenance. It's harmless (the SICK_LEAVE status and the course's leave counts are already theirs). One line if you want it masked; not recommended.
- 🔴 **Your real question: YES, a FOURTH, already wrong on screen.** The **leave Undo dialog's approved body** says, for every leave, *"the leave is returned to the family's quota and its make-up is cancelled"*.
  - **False** for a creation-declared, an over-quota, or any 1-hour / voucher leave.
  - The screen can't tell: **`leaveCharged` and the leave's make-up are NOT on the DTO.**
  - ⭐ **One BE task:** expose `leaveCharged` (raw) + a `makeupId` computed by the Undo's OWN `makeupDecision` (so the dialog and the act can't disagree). Then the FE words the cases.
  - Checked and not gaps: confirmedAt · checkinTokenExpiresAt (private by design) · the note-undo internals · created / updated.
▶️ **Nothing else for BE on the board.**

From @Jason 2026-09-28: ⏸️ **TASK-546 STOPPED: the deciders CAN be shared, but the DTO shape can't share their INPUTS.** That's "a copy is the defect" one layer down. Nothing built.
- **The act:**
  - the charge is `leaveChargeOf(row, hasLinked)`, which **infers or refuses legacy NULLs**, so **raw `leaveCharged` already disagrees with the act** on pre-0058 leaves;
  - the make-up is `makeupDecision` over **per-row reads** (linked rows + a per-date `isDaySettled`), and it **THROWS (= the Undo refuses) in five states**.
- **Two DTO fields would need:** (a) a **second, grouped** read path feeding the same decider on 4 readers (the drift hides there); (b) **no home for a refusal**, so the dialog promises an Undo the act refuses; (c) two grouped reads on the calendar's hot path for a one-row dialog.
- ⭐ **Recommend: `GET /api/bookings/:id/undo-preview`, a DRY-RUN of the act.**
  - The Undo's READ half moves **verbatim** into `planUndo(tx, row, today)`. `undoBooking` = `planUndo` + writes (byte-identical behaviour; the 44 Undo pins guard it). The preview runs `planUndo` read-only.
  - It returns `{ ok, kind, leaveRefunded, makeupCancelled: { id, date } | null, expiry }` or the act's **own refusal**, word for word.
  - **Same function, same reads ⇒ the dialog and the act can't disagree; refusals are known before the click.** No DTO growth (the key set stays 34), no list-read cost.
  - **Scope:** a scoped teacher can't Undo, so the preview refuses them too, and **no id crosses scope.**
  - S.
- **Or §4 (your ruled shape):** buildable with (a) and (b) as stated gaps; key set 36.
- ⛔ **Your ruling please.**

From @Jason 2026-09-28: ✅ **TASK-546: the preview as ruled.** **3514 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · key set still 34 · four mutations bite** (disagree · preview writes · gate retyped · refusal swallowed).
- **Condition 1:** `planUndo`'s body is **byte-identical** to the 53 lines it replaced (compared against HEAD by script), and **the act after the reads is byte-identical** (the only diff from HEAD is TASK-540's line). **No line changed.**
  - Undo pins named and green: **booking-undo 54 (44 + 10) · counter-sql · coach-notice-inventory · task537 = 64 / 0.**
  - TASK-492's gate source-pin was moved to the shared guard **and tightened** (it would have passed on a `-1`).
- **`GET /bookings/:id/undo-preview`** = `planUndo` read-only ⇒ `{ ok, kind, leaveRefunded, makeupCancelled: { id, date }, expiry }` or **the act's refusal word for word** (404 stays 404).
  - **Agreement pinned on 7 cases** (incl. 3 refusals) through the preview AND the real act; **the write log is empty** every time.
- **Condition 3:** **ONE `UNDO_ACCESS` value** (pinned as the same object) + **ONE `assertMayUndo` guard** on both routes. The scoped teacher is refused, so no id crosses scope.
- ⚠️ **Rule exception (your call):** *"no GET carries an action key"* (TASK-385, pinned twice) collides with condition 3. Added as **ONE named exception with its reason**, pinned to the Undo's own entry; every other read still carries none.
- ⚠️ **Known gap (your call):** `UNDO_PLAN_WOULD_CHANGE` is decided **after** the act's writes, so the preview can say ok where the act then refuses (the make-up already trimmed). **Pinned visibly.**
  - To close it: (a) move the balance check before the writes via the reconcile's pure planner (changes the act, so a bigger task), or (b) a rollback dry run (exact, but takes write locks).
▶️ **Nothing else for BE on the board.**

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-547 done — both leave dialogs, one pass.** 704/0 across 73 files (was 682, **+22**) · tsc 0 · build ok · **13 mutations bite, CHECKSUM verified** — see the TASK's report §1–§7.
✅ **§1:** four outcomes from three facts — no course · LOCKED · **declared at creation (make-up added, NO quota)** · otherwise byte-identical. **LOCKED first, because the server checks it first** (G3 bites); **`=== true`** so an absent fact claims nothing (G2 bites ×5).
✅ **§2:** the three Undo bodies now state only the INVARIANT (the act, and who is told); quota / make-up / expiry come from the preview **and only when the server states them.** ⚠️ **Your constraint is in the copy:** *“this WOULD…”* + *“the server checks again when you confirm, so it may still refuse”* ⇒ 🔑 **a post-click refusal is not a contradiction**, with a clicked test for TASK-546 §4's exact case (clean preview ⇒ act refuses ⇒ **both sentences on screen together, both true**).
🔑 **Four states, one blocker:** `loading` waits · `ready` lists what was said, or **“Nothing else follows”** (*an empty list is the silence this defect is made of*) · `refused` shows the server's sentence **verbatim** and **blocks** · `failed` says **we could not check** and **still allows the act** — *a preview outage must not stop a legitimate undo.* 🚫 A failed check never renders a confident body (G5 bites ×9); an error with a stale body is still `failed`.
✅ **DOM test, 9 clicked cases** over the real query client, since this one IS a control.
⚠️ **Four existing pins changed meaning, each declared:** TASK-531's *hidden-never-disabled* **narrowed to the DOOR** (the confirm may be blocked **only** with the refusal rendered above it — the *“why?”* is already answered on screen, in the server's words) · the two leave-body claim pins **INVERTED** (absence in the body, presence in the preview keys) · `undo` copy 12 → 21 · Thai `previewMakeupOff` made **passive** so your `ยกเลิก`-never rule stays untouched rather than loosened.
📋 New copy is a DRAFT in both languages, pinned by claim shape. ⚠️ **Not proven:** CSS/focus and **the reflow while the forecast loads on a phone** — Tanya's. 📌 **One line if you disagree:** if the admin should always be able to press and be refused by the act, that is `canConfirm` + one clicked test; I judged the act's own sentence before the click, with the button visibly unavailable, to be the same information without the false hope. 🚫 No BE change · no deploy request.

## 2026-09-28 — @Porter → @Sober: owner answers.
- **2. Make-up-cancel wording: Jason's option, APPROVED.** The same `❌ ยกเลิกคาบเรียน:` / `❌ CLASS CANCELLED:` title, and it never says "make-up". Add a line **only when the re-plan actually appended a new make-up, naming its date**. Propose the exact TH/EN words of that line with the build; the owner will see them in the copy file below.
- **3. The help-list line is APPROVED:** `· ปฏิทิน — ลิงก์เข้าเว็บ ดูตารางสอนบนมือถือ` / `· Calendar — Link to the web app: your schedule on your phone`. Pin it by value.
- **4. The copy batch: put ALL draft strings into ONE file for the owner to review.** Suggested name: `COPY-REVIEW-2026-09-28.md`. For each string give: where it appears (screen/message and the moment), the TH text, the EN text, and one line on what it promises. Include the calendar reply and this new make-up line. Tell me when it is ready and I will put it in front of him.

From @Jason 2026-09-28: ✅ **TASK-548: both built.** **3518 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · five mutations bite** (a line with no append · an inferred append · the title drifting · the notice moved back · the help line changed).
- ⚠️ **Reachability, first:** in the admin's cancel the family notice ran **before** the re-plan, so the result **didn't exist there.**
  - I **didn't infer it. I moved that ONE call below the re-plan** (same transaction, nothing else reordered; its inputs were already pre-write). Pinned, with a move-back mutation.
  - **If you count that as changing the act, it's one line back and this becomes a STOP.**
  - A coach's own leave already re-planned first, so it just keeps and hands the result.
- **The line is built from the re-plan's OWN `appended` ids**, reading those rows' dates by id. **No append ⇒ TASK-537's payload byte for byte, and no line** (pinned).
  - 📖 DRAFT words (shape-pinned): **"Note : ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ DD-MM-YYYY" / "Note : A new class has been added on DD-MM-YYYY."**
  - Never "make-up" / "ชดเชย"; the title unchanged. **The family only; the coach's notice unchanged (pinned).**
- **The help line: FINAL, by value, both languages.** Count and order unchanged. Pins touched: `teacher-help-list-req109` and `calendar-web-link-task536`; the rest passed untouched.
▶️ **Nothing else for BE on the board.**

## 2026-09-28 — @Porter → @Sober: ✅ **COPY-REVIEW-2026-09-28: the owner approved ALL of it ("ผ่านหมด").** Every 📋 DRAFT string in sections A–E becomes FINAL as written, in both languages, including the caveat sentence and "ไม่ทราบว่าเป็นบัญชีของใคร".
- Remove the draft markers and pin by value where you pin copy.
- Say whether anything changes in the build, since it should be text-only.

Then send me the **sid deploy list**. It must include: migrations 61, with `db:migrate` BEFORE the code; `PUBLIC_ADMIN_BASE_URL` at runtime; the new 8+ admin code; and the admin-removal order. That is the next step: sid → Tanya → Khwan on sid → uat.

## 2026-09-28 — @Fern → @Sober: ✅ **TASK-549 done — the approved copy is final.** 710/0 across 74 files (was 704/73) · tsc 0 · build ok · **7 mutations bite, CHECKSUM verified** — see the TASK report §1–§6.
🔑 **@Porter's question, as a statement with counts:** **no rendered string changed** — all **23** approved rows match his file **character for character, both languages** (compared programmatically, not by eye) · **no component touched** · `dictionaries.ts` changed in **comment lines only** (13 markers) · ⚠️ **not purely text-only: 2 test files** (1 re-pointed, 1 new — 6 tests, 65 assertions). ⇒ **deployable difference nil; what the suite guarantees is what changed.**
🔑 **Both pin kinds kept, and I can show it is not duplication:** H3 rewords a sentence **keeping its promise** ⇒ **only the value pin catches it**; H4 strengthens *“may still refuse”* ⇒ **the value pin catches the letters, the SHAPE pin catches the broken promise.** *A reword that fails only the value pin is a conversation; one that fails a shape pin is a defect.*
✅ **The reasons stayed and are pinned** — H5 deletes *why “would” is deliberate* and bites.
🔴 **A finding for @Porter's next batch, not a blocker: EIGHT of the LINE-admin page's seventeen strings were never in the §D table** (`tail`, `alsoTeacher`, `alsoParent`, `afterVisitor`, `confirm`, `removed`, `notKnownTitle`, `empty`). **They stay drafts, held by shape only, named in the file, and a mutation that sneaks one into the approved list bites** — 🔑 *nobody may read silence as approval.* Worth sending up with the next round rather than assuming “ผ่านหมด” covered rows he never saw.
📌 **Left alone and named:** the discount errors + the attendee-note hint (**now pinned as still-marked**, so this task cannot be read as blessing them); §E is Jason's TASK-550. 🚫 No BE change · no deploy request.

From @Jason 2026-09-28: ✅ **TASK-550: §E2 + §E3 FINAL.** **3524 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · four mutations bite** (a one-character TH drift · a one-character EN drift · a placeholder rendered · ชดเชย creeping in).
- **By value, both languages, as TEMPLATES** (`{url}` / `{date}` intact). **The shape pins are kept as the promise:** the link alone on its line · the line only on a real append (TASK-548's behaviour pins untouched) · never ชดเชย / make-up. The DRAFT markers are removed, and their absence is pinned.
- ⚠️ **Text-only, in numbers:**
  - a script compares the **approved file itself** against our strings **through the real `t()`**: **4 / 4 IDENTICAL**;
  - production: **1 file, comments only (6 comment lines → 7; 0 string lines, 0 code lines)**;
  - **no rendered string differs**;
  - tests: **1 new** (6 tests) + **2 edited in wording only** (a title, two comments; no assertion changed).
▶️ **Nothing else for BE on the board.**

## 2026-09-28 — @Porter → @Sober: ✅ **COPY-REVIEW §D2: the owner has approved all 8 strings ("ผ่านหมด").** He saw them word for word in chat, TH, with their positions. Make them FINAL and pin them by value like the rest.

It rides the same sid deploy if it is ready in time. If not, it follows as a code-only redeploy; nothing rendered changes. Tell me which.

## 2026-09-28 — @Porter → @Sober: 🔴 **D7 is a BLOCKER, and I relayed it late.** It was in Tanya's 18:15 note. **The shop-QR multi-select page CRASHES when a 2nd child is ticked**: "This page couldn't load", console `Cannot read properties of null (reading 'checked')`.
- Reproduced 2/2 on the phone (Brave) and in desktop Chrome at 360 px (`qa-2026-09-28/SQ-2-both-ticked.png`, `SQ-desktop-mobile-after-2nd-tick.png`).
- TASK-491's feature is unusable, and **Khwan's poster flow sends real families to this page**.
- Fix it **with a real click test** that ticks two children and then submits. Your harness should have caught this; tell me why it did not.

Also from TEST-075 (build DEPLOY-sid-2026-09-28). Size these; D7 goes first.
- 🟠 **F5 (real-world):** a search containing a digit floods the bookings list. `q=Ari3y` returns 228 unrelated bookings. A real student named "Ari3y(V)'MOM" cannot be found by name.
- 🟠 **Copy:**
  - the "สิ่งที่หน้านี้แสดงให้ไม่ได้" block renders in ENGLISH inside the Thai UI;
  - the ORDINARY leave dialog alone omits "ระบบจะแจ้งครูและแอดมิน";
  - a refused-at-confirm Undo has no heading, and the stale forecast stays under it;
  - the Undo intro "…คืนคาบเข้าโควตาของลูกค้า" sits above "ไม่คืนโควตาลา" and reads as a contradiction.

  Propose the fixes. Only new or changed wording comes to the owner.
- F6 (a start time via the API that the calendar cannot show) and F7 (`cancel` at the admin-code prompt mutes the chat): note them; do not act unless you disagree.

## 2026-09-28 — @Porter → @Sober: from Tanya's item-6 run (make-up cancel notice) on sid. Two things.
1. **Odd-but-true notice.** An admin cancelled make-up `e7cb8771` (10/11). The re-plan immediately re-added `0494ab85` on **the same date, 10/11**. The family would get "❌ cancelled 10/11" plus "ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ 10/11/2026", i.e. "cancelled, and re-added on the same day". My proposal to the owner: **when the re-plan puts the class back on the same date and time, send nothing**, because nothing changed for the family. Size it and tell me any catch. I am asking the owner now.
2. **The forecast missed a case.** The Undo of that leave forecast "คืนโควตาลา, no make-up", then was refused at confirm with `UNDO_PLAN_WOULD_CHANGE`. That is the expected (b) behaviour, but the forecast should have seen the replaced make-up. Look at it.

Also: the "no new class ⇒ no line" half cannot be reached by an admin cancel, because every course cancel re-owes a make-up. Name a path Tanya can use, or state that it is covered by test only.

## 2026-09-28 — @Porter → @Sober: owner ruling ("ตามแนะนำ ไม่ต้องส่ง"). **When an admin cancels a make-up and the re-plan puts a new class on the SAME date and time, send NO family notice.** Nothing changed for the family. Different date or time ⇒ the notice goes as built, with its "ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ …" line.

Decide the coach side too, on the same principle: a coach whose class is the same slot needs no cancel notice. Tell me if you see it differently.

Cut it and size it, with D7 first. Pin it with a test on the same-slot case AND the different-date case.

From @Jason 2026-09-28: **TASK-551.** ⏸️ **D7: cause named, STOPPED** · ✅ **§2 built** · ✅ **§3 answered.** **3532 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · four §2 mutations bite.**
- 🔴 **D7 is neither the accepted gap nor a preview / act split.** Both read the same thing (no live make-up linked to the leave), because **the link was never written.**
  - **The planner** (`planCourseMoves`) counts a leave as "matched" if ANY row points to it, **including the CANCELLED `e7cb8771`**, so the re-plan appended `0494ab85` with `extendedFromId: null`. Reproduced on the pure planner.
  - The refusal follows: undoing the leave leaves `0494ab85` surplus, and the reconcile would trim it.
  - **The fix is one planner line (a cancelled make-up no longer matches), but it CHANGES THE ACT's outcome here** (the Undo would cancel `0494ab85` and proceed). That's your "separate finding, don't fold in".
  - **sid's row also needs a one-row re-link** (a DATA REQUEST) or Tanya's case stays as it is.
  - ⛔ **Rule please:** (a) the planner fix + data repair, or (b) re-open TASK-546 §4.
- ✅ **§2:** derived that **the re-plan CAN change the coach / co-teachers / time** (it copies a TEMPLATE's primary coach and times), so the same-coach condition is load-bearing.
  - **ONE pure decider** (`sameSlotReplacement`), exact (date · start · end · coach SET), make-ups only. The coach notice moved below the re-plan (your TASK-548 move rule).
  - Pinned both ways: **same slot + same coaches ⇒ nothing** · same slot + a different or dropped coach ⇒ the family silent, the coaches told · **a different date ⇒ today's notices byte for byte** · one minute off ⇒ both told.
  - Not in scope, stated: the coach who GAINS the re-added class is told in neither case (pre-existing).
- ✅ **§3:** ended / paused / non-course / other-series are **unreachable**; the ceiling and an expired course are **not paths** (they append).
  - **REACHABLE: an over-size IMPORTED course** (its trims are withheld, so surplus make-ups exist). **For Tanya:** pick one from the TASK-166 audit and cancel a surplus make-up. **If sid has none: test only.**

From @Jason 2026-09-28: ⏸️ **TASK-552 STOPPED: a REAL dependency on the old behaviour. The line is NOT changed.**
- **Blast radius:** counts are never affected (only WHICH leave an append names). The readers are the planner, the re-plan's template choice, the Undo and course history.
- 🔴 **The dependency: two writers ANSWER a leave WITHOUT linking**, and the old "cancelled still matches" rule was covering for them:
  - **(1) pause → resume**: the pause cancels the make-up, and resume re-lays owed sessions **unlinked**;
  - **(2) an admin insert filling a leave's gap**: the reconcile trims the leave's make-up, and the insert answered it **unlinked**.
- **Reproduced on the pure planner** (pause → resume, then a new leave L3):
  - old ⇒ L3's make-up linked to **L3**; fixed ⇒ linked to **the pre-pause leave**;
  - ⇒ **undoing L3 forecasts "no make-up" and refuses: D7 moved onto every paused / inserted course.**
- ⇒ **The data is incomplete, not just the rule.** "A cancelled make-up is not a make-up" is only safe once every answer carries its link.
- **Options:**
  - ⭐ **(B) now**: the re-owe **inherits** the cancelled make-up's leave (`reconcileCoursePlan(tx, courseId, { reowedFor: [L] })`), which closes D7 going forward without touching pause / insert;
  - **(A) later, its own task**: resume + insert write links, a backfill, then the one line;
  - (C) accept D7 (not recommended).
- **sid row: the repair is REQUIRED** (nothing rewrites an existing link): set `extended_from_id` of `0494ab85…` to `e7cb8771…`'s `extended_from_id`. Read-only check SQL is in the TASK. 🚫 Not touched.
- ⛔ **Your ruling please.**

From @Jason 2026-09-29: ✅ **TASK-552 (B) built.** **3544 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries · tsc 0 · 61 = 61 · four mutations bite** (inheritance ignored · a link invented · the one-line rule shipped early · a double answer).
- **The re-owe inherits ONLY the cancelled row's OWN link** (`reowedForOf`), on exactly the 3 cancel-then-re-plan paths.
  - **An unlinked make-up ⇒ nothing, and it's SAID** in the log (TASK-553).
  - The planner puts that leave first, never as a double answer; **empty ⇒ the old answer byte for byte.**
- 🔑 **The one-line planner change is DELIBERATELY ABSENT** (pinned + an early-ship mutation BITES). **Pause / resume and insert are UNCHANGED** (pinned). The gap stays visible for TASK-553.
- **End to end:** D7's course as (B) writes it ⇒ **the forecast names the replacement, and the act PROCEEDS and cancels it.**
  - **The OLD unlinked shape (sid's row) still reads "no make-up"**: (B) fixes new rows, not existing ones. Pinned.
- **Before / after of an affected course** is in the TASK (§3), so a later reader knows why M2 now says "make-up of <L's date>" and mirrors L's slot.
- 🚫 **The sid repair is untouched** (a DATA REQUEST, as you sent it).
▶️ **TASK-553 is next when you say.**

## 2026-09-29 — @Porter → @Sober: 🔒 **SCOPE FROZEN. The owner closes this round.** Only TWO items remain in it:
1. **D7:** the shop-QR crash on the 2nd tick. Blocker. Needs a real two-child click-and-submit test.
2. **Same-slot suppression:** no make-up-cancel notice when the re-plan lands on the same date and time.

**Everything else moves to the NEXT round:** F5 (digit search), the 4 copy nits, the forecast miss (`UNDO_PLAN_WOULD_CHANGE`), and anything new. Do not start them.

Then: one sid deploy → Tanya re-tests D7 plus a quick smoke → Khwan tests on sid → uat. Send me the sid deploy list when both are green.

## 2026-09-29 — @Porter → @Sober: 🔴 **LABEL MIX-UP. Tanya's D7 is NOT fixed.**
- **Tanya's D7 = the shop-QR page CRASHES when a 2nd child is ticked** (`qa-2026-09-28/SQ-2-both-ticked.png`, console `Cannot read properties of null (reading 'checked')`). That is what I sent as the blocker (my 09-28 note: "D7 is a BLOCKER").
- What you and the board call "D7" in TASK-551/552 is the **forecast miss** (`UNDO_PLAN_WOULD_CHANGE`). That is a different finding.
- `ShopfrontCheckinContent.tsx` has not changed since 857d897. A pointer only, you rule: the `onChange` reads `e.currentTarget.checked` **inside the `setTicked` updater**, and React may run that updater after the event has been released, when `currentTarget` is null. **Cut it now (FE XS), with the two-child tick-and-submit click test.**

**⛔ sid does NOT go until this crash is fixed.** It is one of the two items the owner kept in this round. Rename the forecast item on the board so D7 means one thing.

Corrections to your "still with the owner" list:
- **§D2 (the 8 LINE-page strings) was APPROVED on 09-28**; my note is above. Finalise it.
- **The owner has already set the new 8+ admin code on the sid server.**
- The one-row DATA REQUEST and the "coach who gains a class" question stay with me. The latter is **next round** (scope is frozen).
➕ **DATA REQUEST done:** the owner ran the one-row repair on sid, and `0494ab85`'s `extended_from_id` is now equal to `e7cb8771`'s ("updated"). Tanya's case should now forecast correctly once the build is on sid.

## 2026-09-29 — @Fern → @Sober: ✅ **TASK-554 done — the shop-QR crash is fixed and clicked.** 717/0 across 76 files (was 710/74) · tsc 0 · build ok · **2 mutations bite, CHECKSUM verified** — see the TASK report §1–§6. **The sid blocker is clear from my side.**
✅ **Fixed as you ruled:** the value is read **eagerly in the handler body**. 🚫 **Not the optional chain** — it would stop the crash and record the wrong thing silently; that mutation bites.
🔴 **The sweep found something you will want: TWO hits, and the second is a COMMENT in `lib/scheduler/other-booking.ts` showing this exact line as “← the defect”.** ⇒ **this is TASK-237 (REQ-078 DEF-1/DEF-5) returning nineteen tasks later, on a public page.** That task wrote down the mechanism **and why it survives review** — the eager `dispatchSetState` path makes the FIRST interaction work and defers the second into the render phase — which describes *“first tick survives, second dies”* a month before Tanya hit it. 🚫 **No other live site has the shape; I fixed only this one, as instructed.**
✅ **So I added the enforcement, and I am declaring it: `lib/ui/event-in-updater.test.ts`, a repo-wide sweep** (comments stripped, so the documenting prose does not trip it; a failure NAMES the file; the optional-chain rescue is refused too). **It changes no component.** 🔑 My reason: **the rule is worth what its enforcement is worth, and prose has now failed at this once.** If you would rather it were its own task, it lifts out in one file.
🔑 **The clicked proof fails on the THROW**: restoring the deferred read makes the page throw `TypeError: null is not an object (evaluating 'e.currentTarget.checked')` — Tanya's crash, in JSC's wording. Tick A → tick B → SUBMIT, both ids in the batch in the order asked. 📌 **A render-only test would have passed on the broken code.**
⚠️ **Not proven:** CSS/focus/a real phone's tap — Tanya's. ⏸️ Ready for **TASK-555** (the §D2 approval boundary) whenever you release it. 🚫 No BE change · no deploy request.

## 2026-09-29 — @Porter → @Sober: D8 (new, from Tanya's sid re-test). **DIAGNOSE ONLY. Do not fix. The owner has ruled this.**
**What she saw.** On sid, after the deploy (TASK-551/552 + 554), the Undo forecast on the item-6 fixture leave does NOT name the replacement make-up. It **refuses** with `UNDO_EXPIRY_UNRECOVERABLE`:
- the message: "can't recover the original expiry, currently 10/11, set at course open, no move record";
- 10/11 IS the original expiry from the sale;
- yesterday the same leave previewed clean;
- the rows involved: the leave `40c68a59`, the cancelled make-up `e7cb8771`, the replacement `0494ab85` (the owner re-linked it by hand on 09-29), and the course `47be0cc9`.
- Evidence: `project-docs/qa-2026-09-29/FC-item6-forecast.png`.

**The one question to answer:** what causes the refusal?
- **(a) Only the hand repair or this fixture's data.** Then real customers cannot hit it. It goes to the next round, and Khwan proceeds.
- **(b) The new code (TASK-551/552).** Then a real Undo on uat could be refused. We fix it before uat.

If you need rows, send a read-only DATA REQUEST through me. No agent runs SQL. The scope stays frozen otherwise.

## 2026-09-29 — @Porter → @Sober: D8 answer accepted. TASK-556 goes ahead, and it lands before uat. **TASK-555 stays HELD.**
- **TASK-556.** This is the owner's rule applied as written: real customers can reach it, so it is fixed before uat.
  - Keep the fix to exactly this refusal: an expiry that never moved means the Undo proceeds.
  - If the engineer proves that unsafe, say so and do not build it.
  - After TASK-556 is green, send me the sid deploy list. Tanya re-tests D8 only.
- **TASK-555 (the §D2 strings): do NOT release it this round.** The owner froze scope on 09-29 to D7 plus same-slot suppression; D8 is in only because it blocks uat. Copy goes to the next round.
- **Tanya's fixture course `47be0cc9`** is kept as the live D8 repro. Tell me when it is no longer needed.

From @Jason 2026-09-29: ⏸️ **TASK-556: your reading is RIGHT for the common case but NOT PROVABLE from the data. Falsified in the LATE direction.** Nothing built.
- ✅ **"`keep` can't end a course early": always true.**
- ❌ **"`null` = never moved" is only true for writes made after migration 0034.** Two writers move an expiry **unrecorded**: every stretch / edit **before 0034** (no backfill), and **`repair-course-expiry.ts` (FIX-007), which writes without `recordExpiryChange`** and can be re-run.
  - ⇒ **The case:** a pre-0034 stretch E0 → E1 = the make-up's date, and an advance leave undone ⇒ `keep` leaves **E1, silently LATE** (unearned validity).
- **The other three reasons stay refusals:** "not this make-up's change" (an unrecorded writer, unknowable) · "moved by an actor" (a human decision; intent unknowable) · "sessions after `from`" (not exactly restorable).
- 🔴 **Reachability: COMMON, and not caused by (B).** The born ceiling = plan end + quota weeks, so **the make-up of a course's LAST in-quota leave lands exactly ON the born expiry**, with no stretch and no record.
  - ⇒ **it refuses for every size-4 course's leave**, and for the 2nd leave of a size-6 and the 3rd of a size-10.
  - Leave paths always linked their make-ups; **TASK-492's fixture had a system change record, so the born-ceiling shape was never tested.**
  - In these common cases, `keep` IS right.
- **Options:**
  - ⭐ **(1)** `keep` when `null` **AND the course was created after THIS DB applied 0034** (from the DB's migration record, not a constant), **+ make the repair script record its writes**;
  - (2) `keep` whenever `null` (accepts the late error);
  - (3) leave it (every size-4 leave's Undo refuses).
- 📋 **Q1–Q5 read-only statements are in the TASK**, each with what it proves. **Q5 sizes the problem** (live make-ups on an unrecorded expiry).
- ⛔ **Your ruling please.**

From @Jason 2026-09-29: ⛔ **TASK-556 (1): STOPPED before code. The fact (1) rests on isn't in the data. My error, your recorded class.**
- 🔴 **The DB doesn't record when 0034 was applied.** Drizzle writes `created_at = the journal's when`, identical on every box (for 0034: synthetic 2026-07-02), not the apply time. ⇒ **My Q3 returns the same lie on sid and uat. Withdrawn.**
- ✅ **The repair script: it RAN with `--commit` on both boxes on 2026-08-28, with traces** (the log, and the report files dated 08-28). **No later run is recorded; both runs precede 0034.**
  - 🔑 **It can't cause the late case anyway:** it writes `courseExpiry(start, size)`, a value independent of any make-up. **Only a pre-recording stretch / edit / resume can.** Every `src` writer records today; the repair script is the only one that doesn't.
- 🔴 **A separate hazard (your ruling):** a re-run TODAY resets native expiries to `courseExpiry(start, size)`, **EARLIER** than the born ceiling and **discarding every recorded stretch / admin move**, with no record. **Its "idempotent" header is stale.** Recommend **retiring it**, not teaching it to record.
- ⭐ **What CAN prove it:**
  - **(1a)** the cutoff = this box's EARLIEST `course_expiry_changes.changed_at`. It proves the recording CODE was live; courses born after it ⇒ `keep`, earlier ones refuse (safe); no migration.
  - **(1b)** a marker migration seeded with COALESCE(that, now()), which also works on a fresh box.
  - Pre-cutoff courses keep refusing, **reworded for an admin** (DRAFT).
- 📋 **Q6** (`min(changed_at)` + count, per box) and **Q7** (47be0cc9's `created_at`) are in the TASK. **Q5 still sizes it.**
- ⛔ **Please rule:** (1a) or (1b), and retire or guard the script.

From @Jason 2026-09-29: ✅ **TASK-556 (1b) built.** **3551 / 0 normally, and 3× unreachable, 0 failed queries · tsc 0 · 62 = 62 · seven mutations bite** (including **a refusal turned into a silent keep**, **a refusal turned into a silent restore** and **`keep` swallowing a real unrecoverable case**).
- **0061:** one row, `recording_since = COALESCE(min(changed_at), now())`, `ON CONFLICT DO NOTHING` (a re-run never moves it); witnessed by the table. A fresh box gets `now()`, so it doesn't refuse everything.
- **No record + born strictly AFTER ⇒ `keep`. Before / same instant / no marker ⇒ refused**, reworded for an admin (📋 DRAFT, shape-pinned: why, since when in Bangkok, both dates, open the course page and fix the leave and the expiry by hand).
  - The other three reasons are untouched; "born after" lives only in the no-record branch.
- **End to end, Tanya's shape** (size-4, the make-up ON the born expiry, no record):
  - born after ⇒ **the act proceeds, the expiry is untouched and nothing is recorded; the preview agrees**;
  - born before ⇒ **it refuses and writes nothing; the preview gives the same words.**
- 🚫 **The repair script is retired:** a refusing stub (no DB, `exit 1`, says why and where to go). Nothing depended on it.
  - ⚠️ **`lib/expiry-repair-plan.ts` + its test are now orphans.** Retire them too?
- 61 existing count pins bumped 61 → 62 (TASK-540's convention).
- **Q5 / Q6 / Q7 for the owner; 0061 is owner-run, sid first.**
- ⛔ Only you mark this DONE.

## 2026-09-29 — @Porter → @Sober: D8 ✅ confirmed by Tanya on sid. The round's code is DONE; nothing more for this round.
- Fixture: the forecast names the make-up and the Undo returns 200. No live old-course refusal exists on sid to judge the wording.
- **Next round (copy batch), not now:** the LEAVE_CHARGE_UNKNOWN and MAKEUP_CHAIN refusals end in a bare "กรุณาแก้ไขด้วยตนเอง" with no what or where. The verbatim text is in TEST-075.
- Release `47be0cc9` to Tanya when you no longer need it.
- Next: Khwan tests on sid, then uat. I will ask you for the uat list (migrations 58–62) when the owner says go.

## 2026-09-29 — @Porter → @Sober: REQ-110 (Khwan's 12-item front-office feedback). **SIZE ONLY. Build nothing.** The owner approved this.
The file is `requirements/REQ-110-khwan-frontoffice-final-feedback.md`: the verbatim text, a one-line restatement of each item, and the owner's rulings in §4.

**Size these 9:** items 1, 2, 3, 4, 5, 6, 8, 9 and 11.
- **For each:** BE/FE, a size, dependencies, and any question that blocks sizing.
- **Keep it to what she asked.** Take each item literally. No specs or options unless an item cannot be sized without one. One question at most per item, and only if it blocks.
- **Item 2 (ruled):**
  - a whole-day block of NEW bookings for that teacher;
  - existing bookings that day are listed for the admin to handle;
  - nothing moves automatically.
- **Item 8 (ruled):**
  - delete only when a camp has no bookings;
  - otherwise Close, which stops new bookings only;
  - Open re-allows them.
- **Item 6:** a not-yet-started course only; the expiry is recomputed normally.
- **Item 5:** ECA, change the teacher for ONE session only. Today Move session, Swap and Add teacher all apply to every remaining session.

**Held (waiting for Khwan's answers via the owner):** items 7, 10 and 12. I will send them on.

**Constraints:**
- **Do not start any TASK.** sid stays on the current build while Khwan tests it, and the uat release (migrations 58–62) comes first.
- **TASK-553, TASK-555** and the copy nits stay where they are.
- Also say which of these items overlap with the existing next-round backlog.
