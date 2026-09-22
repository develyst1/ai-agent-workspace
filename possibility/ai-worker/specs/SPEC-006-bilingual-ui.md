# SPEC-006: Bilingual UI (TH / EN) — the rules every FE task already builds to, plus the final sweep
- Source: REQ-005 (R1–R5, AC-1..5); SPEC-001 §Frontend layout (dictionary + `lang` cookie); SPEC-003 (`lang` in the analyse body)
- Status: ACTIVE
- Author: Sober (SA), 2026-09-21

## Overview
REQ-005 is not a feature to build at the end; it is a rule every FE task has been built under since
TASK-002: one typed TH/EN dictionary, a `lang` cookie (default `th`, 1 year, SameSite=Lax,
independent of the session), a `TH | EN` switch in the header on every page, `<html lang>` set
server-side so a reload never flashes, and tier names rendered from the BE string with **no
dictionary key**. This SPEC writes those rules down once, names the mechanism that makes AC-2
("no raw key, no Thai in EN") a compile-time fact rather than a review promise, and defines the one
remaining task: a page-by-page sweep with evidence once all six pages exist.

## Rules (binding on TASK-006/007/009 and everything after)
1. **Every user-visible string is a dictionary key** in `src/lib/i18n/th.ts` and `en.ts`; `en` is typed
   `Record<keyof typeof th, string>` (TASK-002), so a key missing in one language fails `npm run build`.
   Interpolation (`{email}`, `{discount}`, `{n}`) goes through `translate(key, vars)` — never string concatenation.
2. **Wording is Porter's, verbatim** (REQ-001..005 §User-facing wording). Engineers never draft copy;
   a missing string is a `## Questions` line to Sober → Porter.
3. **Never translated:** the brand `Possibility` (REQ-005 §Wording) and the five tier names (REQ-001 R1).
   Tier names come from the API and are rendered as-is; tier *descriptions* are dictionary keys.
   **Enforcement:** `grep -rn "Raw Diamond\|Visionary\|The Possibility" src/lib/i18n/` must return only
   description entries — this grep is a DoD line in TASK-007 and TASK-010.
4. **Language is a browser preference, not a user attribute:** cookie only, no `users.lang` column,
   survives sign-out and sign-in (AC-3). Default `th` when absent or invalid (AC-1; proven by the
   TASK-002 server-side harness).
5. **The AI reason follows the UI language:** the FE sends `lang` from the cookie in `POST /ideas`
   (SPEC-003); the reason is stored with the idea and **not re-translated** when the user later switches
   language (a saved result is immutable, REQ-003 R5). AC-5 tests the language at submit time.
6. **Google-rendered text** (the GIS button, REQ-002) follows `locale` = current lang and is Google's
   wording — accepted by Porter 2026-09-21, not a wording defect.
7. Dates are formatted by the FE (`DD/MMM/YY HH:mm`, month abbreviations from a dictionary key list,
   not `toLocaleString` guesses) — TASK-006/009.

## API / Interface Design
No BE change. `lang` appears on the wire only in `POST /ideas` (SPEC-003).

## Data Model
None.

## Flow
Switch → `LangProvider` writes the cookie + `documentElement.lang` → every `useT()` consumer
re-renders → GIS button re-initialises with the new `locale`. Reload → server reads the cookie →
`<html lang>` + dictionary chosen before first paint.

## Tasks
- TASK-010: FE — bilingual sweep of all pages with TH/EN screenshots, raw-key/Thai-in-EN grep, i18n guard script, cookie persistence across sign-out/sign-in — owner: FE (depends on: TASK-009)

## Questions
