# REQ-005: Bilingual UI (Thai / English) with a language switch
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-09-18 by the owner
- Deadline: none
- Source: chat 2026-09-18; SYSTEM-FACTS.md §UI language

## Problem / Goal
The owner wants the product usable in Thai and English, switchable by the user.

## Requirement
1. Every user-visible string exists in Thai and English; the wording is the one given in
   REQ-001..004 (Porter's), never engineer-drafted.
2. A visible language switch (TH | EN) on every page, including before sign-in.
3. The chosen language is remembered for that user/browser and used for the AI reason (REQ-003 R3).
4. Tier names are never translated (REQ-001 R1).
5. Default language for a first visit: Thai.

## Acceptance Criteria
- [ ] AC-1 — **Given** a first visit **When** the landing page opens **Then** it is in Thai and the switch shows EN available.
- [ ] AC-2 — **Given** any page **When** the user switches to EN **Then** every visible string on that page is English; no Thai text and no raw key (e.g. `btn.submit`) remains. Tanya checks each page: landing, sign-in, idea box, result, my ideas, admin.
- [ ] AC-3 — **Given** EN chosen **When** the user reloads or signs in again **Then** the UI is still EN.
- [ ] AC-4 — **Given** either language **When** a tier is shown **Then** the name is the exact English string.
- [ ] AC-5 — regression: REQ-003 AC-8 (reason language follows the UI language).

## User-facing wording (Porter as UX writer)
- Switch labels: "TH" / "EN".
- App title (Porter 2026-09-21, answers TASK-002 Q-1): the brand name **"Possibility"** in BOTH languages — never transliterated to Thai.

## Constraints
- No third language.

## Out of Scope
- Auto-detecting language from the browser; translating user-submitted idea text.

## Questions
