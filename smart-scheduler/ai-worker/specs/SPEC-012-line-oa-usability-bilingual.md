# SPEC-012: LINE OA — tap-friendly UI + bilingual (rich menu / quick-reply / flex + TH/EN)
- Source: REQ-015
- Status: ACTIVE — **all 3 questions ANSWERED by Porter/คุณฟีน 2026-07-29; tasks cut (TASK-038 + TASK-039)**

## Overview
REQ-015 layers a **presentation + language** upgrade over the existing LINE command backend (webhook + session
machine + outbox) — **not** a rewrite of the flows. As-built (verified): `line-webhook.service.ts` is a
**text-keyword** bot — `handleParentCommand` parses typed Thai words (`เช็คอิน`/`ลา`/`qr`/`เพิ่มนักเรียน`),
disambiguates by "**type a number**" (`เช็คอิน 1`), replies with **inline Thai text** via `replyMessage([LineTextMessage])`
(`line-client.ts`); a session/step machine drives register/link. There is **no rich menu, quick-reply, flex, or
i18n layer**. So REQ-015 = three additive pieces over the same command handlers:

1. **Rich menu** — a persistent tappable menu (image + tap areas) posting an action per button, so users tap
   instead of typing a keyword.
2. **Quick-reply / flex** — where a flow currently says "type 1 or 2", reply with **quick-reply buttons** (tap
   the booking); render lists (my children / today's classes) as **flex cards**. The underlying handler is
   reused — only the reply shape changes, and the tap sends a **postback** the handler already understands.
3. **Bilingual TH/EN** — a reply-language layer: extract every Thai literal into a keyed TH/EN dictionary and
   render by the user's chosen language; the rich menu ships in both languages.

**This is materially larger than the recent small REQs** (rich-menu setup + flex templates + an i18n layer that
touches every reply string). It needs **staging**, and 3 decisions that fork the build (below) — hence this is a
**design proposal**: I'm routing the load-bearing questions to Porter **before** cutting engineer tasks, so the
tasks don't churn on the answers.

## CONFIRMED decisions (Porter/คุณฟีน 2026-07-29 — supersede the "rec" wording below)
1. **Language (Q1):** TH + EN only; **explicit toggle button**, persisted per user, default **TH**, seeded from
   the LINE locale. (Exactly my rec.)
2. **Menus (Q2):** as proposed **minus the QR button** — Porter verified the "QR" command is **not a QR code at
   all** (a plain text check-in URL; the direct check-in command uses the same token internally; no venue
   scanner exists) → it's a redundant channel. **Parent menu:** check-in · leave · my children ·
   register/add-child · language/help (+1 free slot). **Teacher menu:** my schedule (REQ-016 slot) ·
   language/help. Put the freed effort into making **check-in + leave genuinely good** (tap a booking, clear
   confirmation, good empty/error states).
   ⚠️ **Scope guard:** REQ-015 removes QR **from the menu only** — do **NOT** delete `/checkin?token=` or the
   token mechanism (the direct check-in path depends on it, and it's contracted scope in `requirement.html`
   UC-009/SCR-008/API-015). Retiring it properly would be its own REQ.
3. **Staging (Q3):** build **both** stages and **ship them together as ONE delivery** (not a Stage-1-only
   release). Split internally as TASK-038 (tap UX) → TASK-039 (bilingual) for a safe build order.

## Recommended design (my proposal — CONFIRMED above)
- **Architecture:** keep the webhook command handlers as the source of truth; add (a) a **postback layer** —
  rich-menu/quick-reply taps send `postback` events carrying a stable action key (e.g. `action=checkin`,
  `action=leave&bookingId=…`), routed to the same handlers as today's keywords (keyword input stays supported
  as a fallback); (b) a **reply builder** that returns quick-reply/flex messages instead of bare text; (c) an
  **i18n module** `line-i18n.ts` — `t(key, lang, vars)` over a TH/EN table, replacing the inline literals.
- **Language pick (my rec):** a **per-user language setting** persisted on the user's LINE link (a `lang` field,
  default `TH`), toggled by a **"ภาษา / Language" rich-menu button** (explicit, reliable) — *seed* it from the
  LINE profile locale on first contact, but let the toggle win. (Auto-only by locale is unreliable — many Thai
  users' LINE locale is EN.)
- **Rich menu (my rec) — two menus by role** (the bot already detects parent vs teacher via `detectLinkedRole`):
  - **Parent:** เช็คอิน (check-in) · ลา (leave) · QR · ลูกของฉัน (my children) · สมัคร/เพิ่มนักเรียน (register/add child) · ภาษา/help.
  - **Teacher:** ตารางวันนี้ (my schedule — REQ-016) · QR/check-in help · ภาษา/help. *(Teacher schedule button is REQ-016; wire the slot now, fill when 016 lands.)*
- **Staging (my rec):** **Stage 1 = the tap UX** (rich menu + quick-reply/flex + the postback layer) on the
  existing Thai flows → immediate usability win; **Stage 2 = bilingual** (the i18n layer + EN menu). Ship 1 then
  2. This de-risks the big i18n sweep and delivers the most-felt improvement first.

## API / Interface (no new public API; LINE-facing only)
- LINE **rich menu** created via the Messaging API (`line-admin.ts` — extend for rich-menu create/upload/link;
  needs the channel token, already in env). Handle `postback` events in the webhook (new branch alongside the
  text branch). No change to the app's REST API. Reuses the existing outbox for pushes.

## Data Model
- One small addition: persist the user's `lang` (TH|EN) — on the LINE-link record (e.g. `parents.line_lang` /
  the teacher link), default TH. (Confirm field placement during Stage 2; migration is tiny, `IF NOT EXISTS`.)

## Flow / Non-functional
- Every rich-menu/quick-reply tap → `postback` → mapped to the **same** handler the keyword used → same
  business effect (check-in / leave / QR / list). Keyword input remains supported (backward-compatible).
- Reuse the outbox + idempotency; no change to check-in/leave/QR business logic. Bilingual = presentation only.

## Tasks
- **TASK-038** (Jason, BE — Stage 1): rich menus (parent/teacher, **no QR button**) + postback routing +
  quick-reply/flex reply builders; make check-in + leave tap-driven with good confirm/empty/error states.
  (depends on: —)
- **TASK-039** (Jason, BE — Stage 2): `line-i18n` TH/EN layer over every reply string + per-user `lang`
  (default TH, seeded from locale) + the language toggle + the EN rich menu. (depends on: TASK-038)
- ⚠️ **Both ship as ONE delivery** (คุณฟีน, Q3) — TASK-038 is not released on its own; deploy after TASK-039.
- **TASK-040** (Jason, BE — deploy gap): re-runnable `bun run line:publish-menus` setup command (wraps
  `publishRichMenus`, validates token + the 4 images, prints ids). (depends on: —)
- **TASK-041** (Fern, design — deploy gap): the **4 rich-menu images** committed to
  `smart-scheduler-back/assets/line/{parent,teacher}-{th,en}.png`, aligned to the tap-area bounds already fixed
  in `line-rich-menu.ts`. (depends on: —)
- 🔗 **Cross-task contract (owned here, not by direct BE↔FE coordination):** the 4 file paths + exact dimensions
  (parent 2500×1686 3×2; teacher 2500×843 ×2) + cell bounds are fixed in TASK-040 **and** TASK-041 identically.
  If either side needs a change, it comes back to me and I update both.
- REQ-015 **cannot deploy** until 040 + 041 land (code is DONE).

## Questions
(Sober asks; Porter answers as `> answer: ...`. These are the load-bearing forks — routing before cutting tasks.)
- **Q1 — Language pick.** Confirm **TH + EN only**, and that a **language is chosen by an explicit toggle
  button** (persisted per user, default TH, seeded from LINE locale) — my rec — rather than auto-by-locale only.
  > **answer (Porter, from คุณฟีน 2026-07-29): YES — your rec, as-is.** TH + EN only; explicit toggle button,
  > persisted per user, default TH, seeded from LINE locale. Confirmed.
- **Q2 — Rich-menu items (the one genuine business call).** Confirm the two menus I proposed:
  **Parent** = check-in · leave · QR · my children · register/add-child · language/help;
  **Teacher** = my schedule (REQ-016) · check-in/QR help · language/help.
  Add/remove/reorder any button? (This fixes what the rich-menu image + tap areas contain.)
  > **answer (Porter, from คุณฟีน 2026-07-29): menus CONFIRMED as proposed, with ONE change — drop the QR button.**
  > คุณฟีน asked us to first understand what QR is even for ("QR เกิดมาแค่เพื่อ check-in + sick leave มั้ง"),
  > and said: if it isn't needed, don't have it — **just make check-in and leave good enough.**
  > **Porter investigated the as-built (read-only) and confirms her hunch:**
  > - **It is not a QR code at all.** No QR image is generated anywhere (no qrcode dep in either repo). The `qr`
  >   command replies with a **plain text check-in URL** (`/checkin?token=…`). "QR" is a naming holdover.
  > - **It is a redundant delivery channel for the same self-check-in** — the direct `เช็คอิน` command calls the
  >   *same* `getCheckinQr` → `checkinByToken` internally; identical result. There is **no venue scanner / kiosk /
  >   staff-scan** anywhere, so it proves no physical presence and adds **zero** anti-abuse (it's weaker: the link
  >   is long-lived, forwardable, needs no LINE identity, and is the system's only unauthenticated write endpoint).
  > - **Sick-leave is fully independent of QR** — confirmed; removing QR does not touch leave.
  > **⇒ For REQ-015: build the rich menus WITHOUT the QR button** (parent: check-in · leave · my children ·
  > register/add-child · language/help · [free slot]; teacher: my schedule · language/help). Invest that effort in
  > making **check-in + leave** genuinely good (tap a booking, clear confirmation, good empty/error states).
  > **⚠️ Scope guard — do NOT delete the QR plumbing under REQ-015.** Leave `/checkin?token=` + the token
  > mechanism working as-is (the direct check-in command depends on the token internally, and `requirement.html`
  > UC-009/SCR-008/API-015 + the 2026-06-28 spec entry sell "QR Code สำหรับเช็คอิน" as **contracted scope**).
  > This answer removes it from the **menu only**. Porter is confirming the contract point with คุณฟีน separately;
  > if she agrees to retire it properly, that becomes its own small REQ. Don't guess it into this build.
- **Q3 — Staging.** OK to ship **Stage 1 (tap UX) first, Stage 2 (bilingual) second** — my rec — or does คุณฟีน
  want both delivered together? (Changes whether it's one task or two.)
  > **answer (Porter, from คุณฟีน 2026-07-29): do BOTH — deliver the whole thing (tap UX **and** bilingual).**
  > Stakeholder's words: "ทำไปให้หมดเลย ถ้าทำงานเป็นทีม สื่อสาร และทำความเข้าใจร่วมกันดี ๆ ไม่ยากหรอก."
  > You may still split it into TASK-A / TASK-B internally for a clean build order — the ask is that **both
  > ship together as one delivery**, not a Stage-1-only release. Sequence the work however is safest.
- (Design/technical calls I've made and am **not** asking — flagging for the record: reuse the existing handlers
  via a postback layer; keyword input stays as a fallback; i18n via a keyed TH/EN module. Say if any conflicts
  with a LINE constraint you know of.)
