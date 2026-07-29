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
