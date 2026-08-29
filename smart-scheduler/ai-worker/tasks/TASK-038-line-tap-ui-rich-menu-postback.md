# TASK-038: LINE (BE) — tap UI: rich menus + postback routing + quick-reply/flex replies
- Source: SPEC-012 (REQ-015, Stage 1)
- Status: DONE  (reviewed 2026-07-29 by Sober — verified tsc 0 / LINE tests 13/0 / suite 122/0 + scope-guard & postback-authorization checks; see ## Review). ⚠️ **Ships together with TASK-039** — not released alone.
- Depends on: none. ⚠️ **Ships together with TASK-039** (คุณฟีน: one delivery) — do not release this alone.
- Assignee: @Jason (smart-scheduler-back, port 4006 — LINE webhook/bot)

## What to do
Make the LINE bot **tap-driven** instead of "type a keyword / type a number", **reusing the existing command
handlers** (`services/line-webhook.service.ts`) — this is a presentation layer, not a flow rewrite.

**1. Rich menus (2, by role — the bot already detects role via `detectLinkedRole`):**
- **Parent:** check-in · leave · my children · register/add-child · language-help (+1 free slot).
- **Teacher:** my schedule *(REQ-016 — wire the slot; it can reply "coming soon"/help until 016 lands)* ·
  language-help.
- ❌ **No QR button** (confirmed: the "qr" command returns a plain text check-in URL, not a QR code, and the
  direct check-in path uses the same token internally — it's a redundant channel).
- ⚠️ **Scope guard — do NOT delete the QR plumbing**: `/checkin?token=`, the token mechanism, and the existing
  `qr` **keyword** stay working exactly as-is (contracted scope; direct check-in depends on the token). This
  task removes QR **from the menu only**.
- Create/upload/link the menu via the Messaging API — extend `lib/line-admin.ts` (channel token already in env).
  Keep the menu definition in code (so it can be re-applied); document how to (re)publish it.

**2. Postback routing:** menu/quick-reply taps send `postback` events with a stable action key (e.g.
`action=checkin`, `action=leave&bookingId=…`). Add a **postback branch** in the webhook that maps each action to
**the same handler** the keyword uses today. **Keyword input must keep working** (backward-compatible fallback).

**3. Quick-reply / flex replies — this is where the "make check-in + leave genuinely good" effort goes:**
- Where a flow today says *"มีหลายคาบวันนี้ — พิมพ์ เช็คอิน 1 หรือ 2"*, reply with **quick-reply buttons, one per
  booking** (tap instead of typing a number) carrying the booking id in the postback.
- Render lists (my children, today's classes) as **flex cards** instead of a text list.
- Clear **confirmation** replies after check-in / leave, and good **empty** ("วันนี้ไม่มีคาบ…") and **error**
  states — keep them tappable (e.g. a "back to menu" quick reply) rather than dead ends.

Do **not** change check-in/leave/QR **business logic**, the outbox, or idempotency — reuse them.

## Definition of Done
- [ ] Parent + teacher rich menus exist and are linked to the right users; every listed action is reachable by
      **tapping** (no keyword/number typing needed for the main flows). No QR button.
- [ ] A tap → postback → the **same** handler/business effect as the old keyword (check-in / leave / my children
      / register). Typing the old keywords still works.
- [ ] Multi-booking check-in and leave are chosen by **tapping a booking** (quick reply), not by typing a number.
- [ ] Confirmation / empty / error replies are clear and keep the user in a tappable flow.
- [ ] `/checkin?token=` + the token mechanism + the `qr` keyword still work (untouched).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — add tests for the **pure** parts (postback action parsing /
      action→handler mapping / reply-builder shape). LINE-API calls are runtime — state what you verified by
      inspection and how to smoke it on the real OA.

## Implementation Notes

Presentation layer over the existing command handlers — **no change to check-in/leave/QR business logic, the
outbox, the token, or idempotency**. The `qr` keyword + `/checkin?token=` are untouched (scope guard). All new
files in `smart-scheduler-back/src`.

**Postback plumbing** (`lib/line-webhook.ts`): `LineWebhookEvent` gains `postback?: {data}`; added
`eventPostbackData(ev)` + pure `parsePostback(data)` (`action=checkin&bookingId=…` → `{action, params}`).

**Rich replies** (`lib/line-client.ts`): widened the message types — `LineTextMessage` gains optional
`quickReply`, added `LineFlexMessage` + `LineAction`/`LineQuickReply`, and a `LineMessage` union;
`replyMessage`/`pushMessage` now take `LineMessage[]` (plain-text callers unaffected).

**Reply builders + string table** (`lib/line-reply.ts`, new): `textReply` (always appends a "‹ เมนู"
back-to-menu quick reply — no dead ends), `bookingPicker` (one postback button per booking carrying its id →
replaces "type 1/2"; labels clamped to 20 chars), `childrenFlex` (flex bubble list). **Every Thai string lives
in the exported `S` table** so TASK-039's i18n is a mechanical `S.x → t(key,lang)` swap.

**Rich menus** (`lib/line-rich-menu.ts`, new): `PARENT_RICH_MENU` (3×2, `checkin·leave·children / register·
lang·help` — **no QR area**) + `TEACHER_RICH_MENU` (`schedule` (REQ-016 slot) · `lang`), each area a
`postback`. Publish/link helpers hit the Messaging API: `createRichMenu`, `uploadRichMenuImage` (api-data host),
`setDefaultRichMenu`, `linkRichMenuToUser`, and one-shot `publishRichMenus({parentImagePath, teacherImagePath})`
(creates both, uploads images, stores the ids in `app_settings.line_rich_menu_ids`, sets parent as default).
`linkRoleRichMenu(userId, role)` gives a freshly-linked teacher the teacher menu (parent is default) — wired
best-effort into `verifyAndLink` success.

**Webhook routing** (`services/line-webhook.service.ts`): extracted shared actions `doCheckin` /
`doCheckinBooking` / `doLeave` / `doLeaveBooking` / `doChildren` / `doMenu` used by **both** the keyword branch
and the new `handlePostback` (routes `action=…` → the same action; unknown/`menu`/`help` → the menu; teacher →
schedule stub/help; `lang` → a stub TASK-039 fills). Added the `postback` branch to `handleLineWebhookEvents`.
`doCheckinBooking`/`doLeaveBooking` **authorize** the id against the parent's today-bookings before acting (a
forged postback can't check in an arbitrary booking). Keyword input (incl. `เช็คอิน N` / `ลา N`) still works —
those branches now resolve the index and call the shared action.

**How to (re)publish the rich menu** (human, on the OA — needs `LINE_CHANNEL_ACCESS_TOKEN` + two menu images):
supply `parent.jpg` (2500×1686) + `teacher.jpg` (2500×843), then run once:
`bun -e 'import {publishRichMenus} from "./src/lib/line-rich-menu"; await publishRichMenus({parentImagePath:"parent.jpg", teacherImagePath:"teacher.jpg"}); process.exit(0)'`
(re-run to replace; it re-stores the ids + resets the default). New followers get the parent menu; teachers get
the teacher menu on account-link.

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**.
- `bun test` → **122 pass / 0 fail** (22 files). New pure tests: `parsePostback`/`eventPostbackData`
  (`line-webhook.test.ts`), reply-builder shapes (`line-reply.test.ts` — picker carries `action=…&bookingId=`,
  label clamp, flex bubble), rich-menu structure (`line-rich-menu.test.ts` — parent 6 postback areas in order,
  **no qr action**, teacher = schedule+lang, valid sizes).
- ⚠️ **LINE-API calls are runtime — NOT run under brownfield** (no OA/channel token/DB). Verified by tsc +
  the pure tests + inspection. **OA smoke (post-deploy):** publish the menus (above) → tap check-in with 0/1/many
  today-bookings (empty msg / direct / picker) → tap a booking in the picker (checks in) → tap leave likewise →
  tap "my children" (flex) → confirm the old keywords (`เช็คอิน`, `ลา`, `qr`, `เมนู`) + `/checkin?token=` still work.

**i18n readiness (task Q):** menu/picker/empty strings are centralized in `S`; a few confirmation/error literals
remain inline in the service (`เช็คอินสำเร็จ ✅` etc.) — **TASK-039 extends `S`/`t()` to cover those** in the
full sweep. No second translation mechanism introduced.

**DoD:** menus defined (parent/teacher, no QR) + publish/link helpers + wired on link ✓ · tap→postback→same
handler, keywords still work ✓ · multi-booking chosen by tapping (quick reply) ✓ · confirmation/empty/error keep
a back-to-menu tap ✓ · `qr` keyword + token untouched ✓ · tsc clean + `bun test` green, pure-part tests added ✓.
(Live rich-menu creation + tap delivery = OA smoke, per brownfield.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- Bilingual is **TASK-039** — build Stage 1 with the existing Thai strings, but **structure the replies so the
  i18n swap is mechanical** (e.g. keep literals in one place / a builder you can key later). Don't hand-roll a
  second translation mechanism.
- If a LINE constraint blocks something (rich-menu size/areas, postback payload limits), flag it here rather
  than redesigning around it silently.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29)** — but ⚠️ **not deployable alone** (ships with TASK-039, per คุณฟีน).
- **Scope guard HELD (checked first):** `qr` keyword still handled (`line-webhook.service.ts:293`),
  `getCheckinQr`/`checkinByToken` + `/checkin?token=` + `GET /bookings/:id/checkin` all untouched. The rich menus
  contain **no `qr` action** — parent = checkin·leave·children·register·lang·help (6 postback areas), teacher =
  schedule·lang. Exactly the confirmed decision (menu-removal only).
- **Postback → same handlers:** shared actions (`doCheckin`/`doCheckinBooking`/`doLeave`/`doLeaveBooking`/
  `doChildren`/`doMenu`) are called by **both** the keyword branch and `handlePostback`, so a tap and a keyword
  produce the same business effect; keyword input (incl. `เช็คอิน N`) still works. Business logic, outbox,
  idempotency untouched — correct.
- **Security — the best part of this build, and it wasn't asked for:** `doCheckinBooking` /
  `doLeaveBooking` **re-derive the parent's today-bookings from the LINE user id and require the posted
  `bookingId` to be in that set** (leave also requires `CONFIRMED`). So a forged/replayed postback can't act on
  someone else's booking. Verified in code — this is a real authorization check, not a claim. Good instinct.
- **UX per the REQ-015 intent:** multi-booking check-in/leave now reply with a **quick-reply picker** (one button
  per booking, id in the postback) instead of "type 1 or 2"; children render as a flex bubble; `textReply` always
  appends a "‹ เมนู" quick reply so no reply is a dead end.
- **Verified myself:** `bunx tsc --noEmit` → 0; new LINE tests (`line-reply` / `line-rich-menu` /
  `line-webhook`) → **13/0** (picker carries `action=…&bookingId=`, label clamp, flex shape, parent menu has 6
  areas in order with **no qr**, teacher = schedule+lang); full `bun test` → **122/0**.
- **LINE-API calls not run** (brownfield — no OA/token): accepted per the DoD, with a concrete publish command +
  OA smoke list documented. That smoke belongs in the **combined** REQ-015 deploy.
- **Handoff carried into TASK-039 (I've added it there explicitly):** a few confirmation/error literals are still
  inline in the service (`เช็คอินสำเร็จ ✅`, `แจ้งลาสำเร็จ ✅`, the ⚠️ quota line, the catch-message fallbacks) —
  TASK-039 must extend `S`/`t()` to cover **those too**, not just the centralized `S` strings.
- **TASK-038 → DONE.** REQ-015 stays IN_SPEC until TASK-039 lands; **do not deploy this alone.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-038 | LINE (BE): tap UI — parent/teacher rich menus (**no QR button**) + postback routing + quick-reply/flex; check-in & leave tap-driven | SPEC-012 | ✅ **DONE** (⚠️ don't deploy alone — ships with 039) | Jason | — |
```
