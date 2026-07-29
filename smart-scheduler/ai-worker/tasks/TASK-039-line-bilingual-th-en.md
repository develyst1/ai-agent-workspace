# TASK-039: LINE (BE) — bilingual TH/EN (i18n layer + per-user language + toggle + EN menu)
- Source: SPEC-012 (REQ-015, Stage 2)
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / suite 126/0 + my own Thai-literal grep + migration check; see ## Review). ⚠️ ships together with TASK-038 as ONE delivery
- Depends on: TASK-038. ⚠️ **Ships together with TASK-038 as ONE delivery** (คุณฟีน).
- Assignee: @Jason (smart-scheduler-back, port 4006 — LINE webhook/bot)

## What to do
Make every bot reply + the rich menu available in **Thai and English**, chosen by the user.

**1. i18n layer** — add `lib/line-i18n.ts`: `t(key, lang, vars?)` over a keyed **TH/EN** table. Replace the
inline Thai literals in `services/line-webhook.service.ts` + `lib/line-message.ts` (and TASK-038's reply
builders) with keys. Keep keys grouped by flow (checkin/leave/children/register/help/errors). Missing EN → fall
back to TH (never show a raw key).
> **⚠️ Carried from the TASK-038 review (Sober) — don't miss these:** TASK-038 centralized the menu/picker/empty
> strings in the exported `S` table (so that part is a mechanical `S.x → t(key,lang)` swap), **but a number of
> confirmation/error literals are still inline in `line-webhook.service.ts`** — e.g. `เช็คอินสำเร็จ ✅` /
> `เช็คอินแล้วก่อนหน้านี้`, `แจ้งลาสำเร็จ ✅`, the `⚠️ โควตาลาครบแล้ว…` line, the extension line, and the
> `catch` fallbacks (`ไม่สามารถเช็คอินได้ในขณะนี้`, `ไม่พบคาบที่เลือก`). **This task must cover those too** —
> after the sweep, no user-visible Thai literal should remain outside the i18n table.

**2. Per-user language** — persist `lang` (`TH`|`EN`) on the LINE-link record (e.g. `parents.line_lang`, and the
teacher link), **default `TH`**, **seeded from the LINE profile locale** on first contact. Migration must be
additive + idempotent (`ADD COLUMN IF NOT EXISTS`) per the brownfield rule — the app owns `public.*`, so this is
a normal scheduling migration; **do not apply it to any real DB** (the human applies it at deploy — note it in
the task).

**3. Language toggle** — the **language/help** menu button (from TASK-038) lets the user switch TH ⇄ EN; the
choice **persists** and wins over the seeded locale. Confirm the switch with a reply in the **new** language.

**4. EN rich menu** — a second rich-menu image/definition in English; linking follows the user's `lang` (switch
the linked menu when the language changes).

## Definition of Done
- [ ] Every bot reply in the main flows (check-in, leave, my children, register/add-child, help, errors) renders
      in the user's language — TH and EN both verified; missing EN falls back to TH (no raw keys).
- [ ] **No user-visible Thai literal remains outside the i18n table** — including the confirmation/error strings
      TASK-038 left inline in `line-webhook.service.ts` (see the carried note above). A grep for Thai text in the
      service/reply layer should only hit the i18n table.
- [ ] A new user defaults to TH (seeded from LINE locale where available); the **toggle** switches language,
      persists, and the reply confirming the switch is in the new language.
- [ ] The rich menu the user sees matches their language (EN menu linked for EN users).
- [ ] Existing flows still work identically (this is presentation only — no business-logic change).
- [ ] Migration is additive/idempotent and **not applied** here (brownfield — deploy step documented).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — test the pure i18n layer (key lookup per lang, var
      interpolation, TH fallback) and, if practical, that a sample of flow replies resolves in both languages.

## Implementation Notes

Presentation-only bilingual sweep — no business-logic change. The user's language is resolved once per event
from their link record and threaded through every reply; every user-facing string now comes from one i18n table.

**i18n layer** (`lib/line-i18n.ts`, new): `t(key, lang, vars?)` over a keyed **TH/EN** table (all bot copy —
welcome/role/codes, menu, buttons, pickers, empty/error, verify/link, add-student, check-in/leave confirmations,
teacher/admin, lang-switch, qr, **and the outbox push messages**). Missing EN → **TH fallback** (never a raw
key; unknown key returns itself defensively). `{var}` interpolation. + `langFromLocale` / `isLang`.

**Per-user language:** added `line_lang` to `parents` + `teachers` (`db/schema.ts`) — migration
**`drizzle/0012_line_lang.sql`** (`ADD COLUMN IF NOT EXISTS`, additive/idempotent). **⚠️ NOT applied (brownfield)
— human applies at deploy** on the scheduling DB (the app owns `public.*`). Shared resolver
`lib/line-lang.ts` `resolveBotLang(lineUserId)` (teacher/parent `line_lang`, default TH) used by BOTH the webhook
service and the outbox worker. **Seeded** on account-link from the LINE profile locale
(`line-client.getProfileLang`, best-effort → TH).

**Sweep** (`services/line-webhook.service.ts`): `resolveLang` at each entry (`handleMessage`/`handlePostback`/
`handleFollow`); every reply is `t(key, lang, vars)`; the reply builders (`lib/line-reply.ts`) take `lang` for
the back-to-menu label. **Grep for Thai in the service now hits only input-keyword vocabularies** (`เช็คอิน`,
`ลา`, `เมนู`, `สมัคร`, the `เพิ่มนักเรียน` regex, `SKIP_WORDS`, the `สูงสุด` error-match) **and one internal
booking note** (`"แจ้งลาผ่าน LINE"`, stored as data) — **no reply output literal remains**. _(One boundary
note: `createStudentForParent`'s "…สูงสุด…" validation message is thrown by `parent.service` — shared with the
REST API, outside the LINE reply layer — so it's surfaced as-is, not re-keyed. Flagging, not fixing here.)_

**Toggle** (`action=lang`): flips the stored `line_lang` on the matching record, **re-links the matching-language
rich menu**, and confirms in the **new** language.

**EN rich menu** (`lib/line-rich-menu.ts`): `PARENT_RICH_MENU_EN` / `TEACHER_RICH_MENU_EN` (same postback areas,
EN name/chatBarText/image). `publishRichMenus` now creates all **four** (parent/teacher × TH/EN), stores the ids,
sets TH-parent as default; `linkRoleRichMenu(userId, role, lang)` picks the right one (on link + on toggle).

**Outbox** (`lib/line-message.ts` + `services/outbox.service.ts`): `formatOutboxMessage(payload, ctx, lang="TH")`
renders via `t()`; the worker resolves the **recipient's** language and passes it — so teacher/admin pushes are
bilingual too. Default TH keeps the existing `line-message.test.ts` green.

**Deploy steps** (human): **(1)** apply `drizzle/0012_line_lang.sql` (same meta-drift reconcile as prior
`IF NOT EXISTS` migrations). **(2)** (re)publish the menus with **four** images:
`bun -e 'import {publishRichMenus} from "./src/lib/line-rich-menu"; await publishRichMenus({parentThImage:"parent-th.jpg", parentEnImage:"parent-en.jpg", teacherThImage:"teacher-th.jpg", teacherEnImage:"teacher-en.jpg"}); process.exit(0)'`.
**(3)** redeploy scheduling-back (:4006).

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **126 pass / 0 fail** (23 files). New `line-i18n.test.ts` (key lookup per lang, `{var}` interp,
  unknown-key = key / no raw-key leak, `langFromLocale`/`isLang`); `line-reply.test.ts` updated for the
  language-correct back-to-menu; the pre-existing outbox test stays green on the TH default.
- ⚠️ LINE-API (profile locale fetch, EN rich-menu create/link, push delivery) is **OA-smoke** under brownfield.
  **OA smoke (post-deploy):** new follower defaults TH → tap check-in/leave/children (TH) → tap language → replies
  + menu flip to EN, persisted → toggle back to TH; a teacher push (confirm a booking) arrives in that teacher's
  language.

**DoD:** main-flow replies bilingual + TH fallback ✓ · no reply Thai literal outside the table ✓ · default TH +
locale seed + toggle persists + confirms in new lang ✓ · EN menu linked by lang ✓ · flows unchanged (presentation
only) ✓ · migration additive/idempotent + not applied (deploy documented) ✓ · tsc clean + `bun test` green, i18n
tests added ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Field placement for `lang` is your call within the existing link records (parent/teacher) — keep it one
  concept, not two mechanisms. Flag here if the teacher link has no natural home for it.
  - **Jason:** put `line_lang` on **both** `parents` and `teachers` (each already keyed by `line_user_id`) —
    one concept (a nullable `text`, null → TH), resolved by a single shared `resolveBotLang` + toggled by a
    single `toggleLang`. No separate mechanism. (An admin has no roster row — admins get TH; they only receive
    system notices, not the tap flows.)
- Scope: **TH + EN only** (confirmed by คุณฟีน). Don't add a third language or an auto-detect-per-message scheme.
  - **Jason:** TH/EN only; language is chosen by the explicit toggle (persisted), seeded once from the profile
    locale — no per-message auto-detect. As specified.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Completes REQ-015; ships **with TASK-038 as one delivery**.
- **The DoD line I added — verified by my own grep, not taken on trust.** Thai remaining in
  `line-webhook.service.ts` is **only**: input-keyword vocabularies (`SKIP_WORDS`, `เมนู`, `เพิ่มนักเรียน` regex,
  `นักเรียน/ลูก`, `qr/คิวอาร์`, `เช็คอิน`, `ลา`, `สมัคร` — what the user *types*, correctly still Thai), the
  internal booking note `"แจ้งลาผ่าน LINE"` (stored as **data**, not a reply), and the `msg.includes("สูงสุด")`
  error-match. **No reply-output literal remains** — replies go through `t(key, lang)`. The carried TASK-038
  handoff (`เช็คอินสำเร็จ ✅`, `แจ้งลาสำเร็จ ✅`, quota-⚠️, catch fallbacks) is swept. ✓
- **Boundary call accepted:** `createStudentForParent`'s "…สูงสุด…" message is thrown by `parent.service` and
  **shared with the REST API**, so it stays un-keyed — correct: that's outside the LINE reply layer, and re-keying
  a shared service error to a LINE-only i18n table would be the wrong coupling. Flagged, not fixed — right call.
- **Scope extension accepted (good judgment):** he also made the **outbox pushes** bilingual (`formatOutboxMessage`
  + the worker resolving the *recipient's* language). Beyond the literal task text but squarely inside REQ-015's
  "the bot's replies are available in TH/EN" — a teacher push arriving in Thai for an EN user would have been an
  obvious hole. Existing outbox test stays green on the TH default.
- **Verified in code:** `line-i18n.ts` keyed TH/EN + **TH fallback** + `{var}` interpolation + `isLang`/
  `langFromLocale`; `resolveBotLang` shared by the webhook **and** the outbox worker (one concept, not two);
  toggle flips `line_lang`, **re-links the matching-language menu**, and confirms in the **new** language; four
  rich menus (parent/teacher × TH/EN) with the same postback areas.
- **Migration correct for brownfield:** `drizzle/0012_line_lang.sql` = `ADD COLUMN IF NOT EXISTS` on
  `parents`+`teachers`, additive/idempotent, **explicitly not applied** — the human applies it at deploy. ✓
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **126 pass / 0 fail** (23 files, incl. the new
  `line-i18n.test.ts`: per-lang lookup, interpolation, no raw-key leak, locale mapping).
- **LINE-API paths (profile locale, EN menu create/link, push delivery) not runnable** under brownfield —
  accepted; the OA smoke list is documented and belongs to the combined deploy.
- **TASK-039 → DONE. REQ-015 → SPEC_DONE.** Combined deploy (both tasks, one release): **(1)** apply
  `drizzle/0012_line_lang.sql` · **(2)** publish the **four** rich menus (parent/teacher × TH/EN images) via
  `publishRichMenus` · **(3)** redeploy scheduling-back (:4006) · **(4)** OA smoke: tap check-in/leave/children,
  the booking picker, language toggle (replies + menu flip to EN, persisted), and confirm the old keywords +
  `/checkin?token=` still work.
