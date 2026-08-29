# REQ-015: LINE OA — easy & pretty & bilingual (buttons / rich menu / flex + TH/EN)  [LINE-A]
- Status: READY_FOR_SA
- Priority: HIGH  (stakeholder wants LINE improved **first**, before the demographics/dashboard chain)
- Requested: 2026-07-29 by stakeholder (คุณฟีน)
- Deadline: none — **precedes REQ-012 → REQ-013/014**
- Source: stakeholder direction 2026-07-29; hub UC-032 (LINE TH+EN = Partial) + SCR-008 "raw bot UX" note.

## Problem / Goal
The LINE OA bot is **hard to use and not pretty**: it's a plain-text keyword bot where users **type numbers**
("เช็คอิน 1", "ลา 2") to disambiguate, with **no menu, buttons, or cards**, and it **replies in Thai only**.
Make it friendly and bilingual.

## Requirement
1. Replace the type-a-keyword / type-a-number interaction with a **tap-friendly UI**: a LINE **rich menu** +
   **quick-reply buttons** + **flex message cards** for the common actions (check-in, leave, QR, my children /
   my schedule, register, help), so users **tap instead of typing** commands/numbers.
2. **Bilingual TH / EN** — the bot's replies and menu are available in both Thai and English.

## Acceptance Criteria
- [ ] Parents/teachers use the bot via **buttons / rich menu** for the common actions (no need to type keywords
      or numbers for the main flows).
- [ ] Bot replies (and the menu) appear in **Thai or English** per the chosen language.
- [ ] Existing flows (check-in, leave, QR, add child, linking) still work through the new UI.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- Current bot is **text-only** (`LineTextMessage`, `line-client.ts`) — no rich menu / quick reply / flex / LIFF.
  Replies are **inline Thai literals** (`line-webhook.service.ts`, `line-message.ts`) — no i18n layer; EN keyword
  *input* is partly tolerated but all *responses* are Thai. Disambiguation = "type a number".
- This is a **larger effort** than the recent small REQs (rich menu setup + flex templates + a reply-language
  layer touching every string). SA to scope/stage.

## Constraints
- Reuse the existing webhook/command backend + outbox; this is a **presentation + language** layer over it.
- HOW (rich menu vs LIFF vs flex, i18n mechanism) is the SA's design.

## Out of Scope
- The registration/demographics form (REQ-012), teacher schedule command (REQ-016), calendar sync (REQ-017) —
  separate REQs that build on this.

## Questions
(SA + stakeholder. Porter answers `> answer: ...`; business calls → `@Porter`.)
- **Languages:** TH + EN only (confirm)? How does a user pick — auto by their LINE locale, or a toggle button?
- **Rich menu scope:** which actions become menu buttons (check-in / leave / QR / my children / my schedule /
  register / help)?
- Staging OK — deliver the button/rich-menu UX first, bilingual second (or together)?

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-015 | LINE OA — easy & pretty & bilingual (buttons / rich menu / flex + TH/EN) [LINE-A] | **HIGH** | ✅ **DELIVERED** (+1 post-delivery fix pending deploy) | ⏳ **@Porter — TASK-046 (DONE, Sober-verified) needs a `sid` deploy + a quick repro re-check**, not a fresh acceptance round: an already-linked parent types `สมัคร` → `2` → the bot should now ask for the **teacher nickname** (was: parent menu), and after linking they hold **one** role only. Fixes "an already-linked user can never change role" + the stale dual-link. **Live acceptance PASSED 2026-07-30** (stakeholder tested on the real OA; Porter verified against the exported chat transcript): rich-menu **taps work** (เช็คอิน / แจ้งลา / นักเรียนของฉัน), **language toggle flips both ways and persists** ("Switched to English ✅" / "เปลี่ยนเป็นภาษาไทยแล้ว ✅"), and the **regression holds** — typed keywords + `/checkin?token=` still work. **Root cause of the earlier failure was environmental, not code:** the LINE webhook pointed at a *different* server than the one being deployed to; re-pointing it made everything work with no code change. _Not covered by this run:_ the quick-reply **booking picker** (no bookable slot existed — the empty state rendered correctly). **Follow-ups tracked separately:** the role-switch bug + no-unlink gap (see Blocked). _Previously:_ Built by Jason 2026-07-30 (**instrumentation only, no speculative fix**): `[line-in]` log line per inbound event (incl. **successful** taps), logged early-exit naming the missing field (was a silent `return`), `UNHANDLED action=` warning, and read-only **`bun run line:inspect-menus [userId]`** printing each stored menu's **`areas`** (+ `⚠️ NO AREAS` = hypothesis A), the channel default, the full `/richmenu/list` (flags OA-Manager menus), and the user's linked menu (= hypothesis B). Never logs the userId (sha-prefix marker) or the token; missing token → clean exit 1 before any API call. tsc 0, `bun test` **139/0**. **Operator steps + a read-the-result table are in the task's Implementation Notes.** _Previously:_ Sober re-verified the **entire static path is correct** (areas built as `postback`, `createRichMenu` sends `areas`, webhook forwards all events, dispatch → `handlePostback`, `ev.postback.data` read per the LINE API) — and typing `เมนู` works, so webhook/signature/linking/reply are fine ⇒ the fault is **runtime/config**, not the source. Remaining hypotheses — **(A)** menu stored without/with broken `areas`, **(B)** the user's linked menu isn't ours (stale per-user link or an **OA-Manager** menu, which takes precedence), **(C)** OA not delivering postback events — are only separable by evidence, and **a successful postback currently logs nothing** (inbound logged only on error + a silent `return` in `handlePostback`). So TASK-045 adds **inbound-event logging + a read-only `line:inspect-menus`** command; **no speculative fix**. Menu stays published per คุณฟีน. _Previously: release unblocked —_ ✅ **TASK-042 DONE (Sober-verified 2026-07-30)** — `0012_line_lang` is registered in the journal (13 entries = 13 `.sql`, audited independently), SQL unchanged/idempotent ⇒ **the DB step is plain `bun run db:migrate`, re-runnable, no psql side-channel**. Gap B (missing 0004–0012 snapshots) was **proven real by a scratch probe** and **documented** in `drizzle/README.md` (⚠️ do NOT run `db:generate` here) rather than faked — rebuilding that chain is flagged **maintenance tech-debt**, blocks nothing. **@Porter — the release can proceed** (image review → the 4 steps below). _Previously: deploy gaps closed —_ **@Porter — image review + release.** All four tasks DONE & Sober-verified: TASK-038/039 (bot) + **TASK-040** (`bun run line:publish-menus`, re-runnable; I re-ran the preflight: clean failure, no API call) + **TASK-041** (4 PNGs at exact dims 2500×1686 / 2500×843, 20–47 KB, grid aligned to the code's tap bounds — I inspected them visually; regenerable via `assets/line/generate-rich-menus.mjs`). **FYI for your review with คุณฟีน:** button labels use the bot's own `line-i18n` wording (นักเรียนของฉัน / เพิ่มนักเรียน) so menu and replies agree — a different phrasing is a one-line regenerate. **Release (ONE deploy):** TASK-038 **+** TASK-039 both **DONE & Sober-verified** (tsc 0 · suite **126/0** · LINE tests 13/0 · my own scope-guard, postback-authorization and Thai-literal greps). Bot is now **tap-driven** (parent/teacher rich menus, **no QR button**; quick-reply booking picker replaces "type 1 or 2"; flex lists; every reply keeps a back-to-menu button) **and bilingual TH/EN** (i18n table + TH fallback; per-user `line_lang` default TH seeded from LINE locale; toggle re-links the matching-language menu; outbox pushes localized to the recipient). **QR plumbing untouched** (`/checkin?token=`, token, `qr` keyword — scope guard held); postback booking ids are authorized against the parent's own bookings. **Deploy:** (1) apply `drizzle/0012_line_lang.sql` (`ADD COLUMN IF NOT EXISTS`) · (2) publish the **four** rich menus (parent/teacher × TH/EN images) via `publishRichMenus` · (3) redeploy scheduling-back (:4006) · (4) OA smoke: check-in/leave/children by tap, booking picker, language toggle (replies + menu flip, persisted), old keywords + `/checkin?token=` still work. _(History:  **@Sober — review TASK-038 (REVIEW); then @Jason builds TASK-039 (ship both together).** TASK-038 done by Jason 2026-07-29: postback layer + 2 rich menus (no QR) + quick-reply/flex builders + shared keyword/postback actions; strings centralized in `line-reply.S` for the i18n swap; tsc 0, `bun test` **122/0** (postback-parse + reply-builder + menu-structure tests). LINE-API = OA-smoke (brownfield). Orig:  **@Jason — build TASK-038 → TASK-039 (ship together).** SPEC-012 ACTIVE; all 3 Qs answered by คุณฟีน 2026-07-29: **(Q1)** TH+EN, explicit toggle, persisted, default TH, seeded from locale ✓ · **(Q2)** menus confirmed **minus the QR button** (Porter verified "QR" is a plain text check-in URL, not a QR code, and duplicates direct check-in) — put that effort into making check-in+leave genuinely good; **⚠️ scope guard: do NOT delete the QR plumbing** (`/checkin?token=`, token, `qr` keyword = contracted scope; menu-removal only) · **(Q3)** build **both** stages, **ship as ONE delivery**. Design = postback layer over the existing handlers (keyword stays a fallback) + quick-reply/flex + `line-i18n` + per-user `lang` (additive migration, human applies).)_ |
```
