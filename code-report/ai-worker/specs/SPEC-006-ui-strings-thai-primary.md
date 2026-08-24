# SPEC-006: Reword existing UI strings to Thai-primary / English-secondary
- Source: REQ-007
- Status: ACTIVE

## Overview

REQ-007 asks the team to reword the existing user-facing strings so Thai leads
and English is secondary ("ไทยหลัก อังกฤษรอง", Q39/Q40 = "แก้เลย"). Grounded
against the real repo `code-report-front` at `68a1475` (clean tree):

- **Every user-facing string lives in ONE file**, `src/constant/text/dictionaries.ts`
  (a `th` object + an `en` object, keyed by `MessageKey`). Nothing user-visible is
  hardcoded in a component — verified: the only Thai characters anywhere else in
  `src/` are a code comment quoting a decision (`types/app/reports/index.ts:18`),
  not UI text. So the reword is a bounded edit to string **values** in one module.
- **The `th` object is already ~90% Thai-primary.** Most keys are pure Thai
  (e.g. `header.logout` = "ออกจากระบบ", `reports.new.submit` = "สร้างรายงาน").
  The reword is therefore NOT a rewrite — it is a small, finite consistency pass
  over the handful of `th` values that still lead with English.

### The form of "อังกฤษรอง" — SA ruling (REQ-007 Req 5, my call)

REQ-007 Req 5 gives the SA the concrete form. **I rule Form 2: "Thai text,
keeping English only where a term has no natural or already-adopted Thai
equivalent"** — NOT Form 1 ("a Thai line with an English line beside it").
Reasons, all grounded:

1. Form 1 (both languages shown at once) would add a second line to labels and
   fields → a **layout change**, which REQ-007 Req 3 and the REQ-006 Req 2
   discipline forbid. Form 2 changes only string values, so the "strings only,
   no layout/behaviour" constraint holds.
2. The app **already** offers English as a first-class, switchable mode
   (`I18nProvider`, the header language switch, `DEFAULT_LANGUAGE = "th"`). A
   Thai reader already gets Thai by default; an English reader flips the switch.
   Showing English inline in the Thai dictionary too would be redundant with a
   toggle that already exists.
3. Form 2 is **how the `th` dictionary was already authored** and how the
   stakeholder already edits it (Q37: he kept "Branch" in English deliberately).
   Ruling Form 2 keeps the reword consistent with decisions already on the record.

### Scope ruling

- **In scope: the `th` object's string values only** — the copy the stakeholder
  reads (Q39: "everything he reads"; his interface default is Thai).
- **Out of scope: the `en` object** — it is what an English-mode reader sees, not
  the stakeholder; no key is added or removed, so `en` stays byte-for-byte
  untouched and the `Record<MessageKey, string>` type still matches key-for-key.
- **The language switch, controls, layout, gating, data, and every non-`th`
  file are untouched** (REQ-007 Req 3). No new dependency.

## API / Interface Design

None. No endpoint, no contract, no component signature changes. The only edit is
to literal string values inside the `th` object of `dictionaries.ts`.

## Data Model

None.

## Flow — the reword audit (grounded, complete)

Classifying all `th` values against Form 2. The overwhelming majority are already
Thai-primary and are **left exactly as-is**. Only the keys below still lead with
English or carry an English loanword, and only these are in play.

**Excluded by prior settled decision (NO CHANGE — do not touch):**
- `app.name` = "KnowCode" (REQ-001 Req 14).
- `reports.new.branch` = "Branch" and `reports.view.params.branch` = "Branch"
  — **Q37: the stakeholder explicitly chose to keep "Branch" in English.**
- `reports.new.repoUrl.placeholder` (a URL example), `reports.new.date.hint`'s
  `Asia/Bangkok` (a timezone identifier), `header.language.th.short`/`.en.short`
  = "TH"/"EN" (language codes) — technical identifiers read verbatim (REQ-007
  Req 4c). On-screen dates (`DD/MMM/YY`, REQ-001 Req 15) are produced by
  `formatIsoDate`, not by this dictionary — nothing to touch.

**Reword candidates (the entire in-play set) — with PROPOSED drafts:**

| Key | Current `th` value | Proposed Thai-primary draft | Note |
|-----|--------------------|-----------------------------|------|
| `reports.view.params.repo` | `Repository` | `ที่เก็บโค้ด` | fully-English label; app already uses `ที่เก็บโค้ด` for `reports.new.section.repository`, so English here is internally inconsistent |
| `reports.new.pat` | `Personal access token` | `โทเคนการเข้าถึงส่วนบุคคล (Personal access token)` | GitHub-specific term; Thai-primary, English kept in parentheses so it stays recognisable |
| `reports.new.repoUrl` | `ที่อยู่ของ repository` | `ที่อยู่ของที่เก็บโค้ด` | `repository` → `ที่เก็บโค้ด` for consistency |
| `reports.new.private` | `เป็น repository ส่วนตัว` | `เป็นที่เก็บโค้ดส่วนตัว` | same |
| `reports.new.branch.empty` | `repository นี้ยังไม่มี branch จึงสร้างรายงานไม่ได้` | `ที่เก็บโค้ดนี้ยังไม่มี branch จึงสร้างรายงานไม่ได้` | `repository` → `ที่เก็บโค้ด`; **`branch` loanword kept** (see the wording question) |
| `reports.new.branch.load` | `โหลดรายการ branch` | *(propose KEEP — `branch` loanword)* | tied to Q37; see wording question |
| `reports.new.branch.loading` | `กำลังโหลดรายการ branch` | *(propose KEEP)* | same |
| `reports.new.branch.select` | `เลือก branch` | *(propose KEEP)* | same |
| `reports.new.branch.locked` | `โหลดรายการ branch ให้สำเร็จก่อน จึงจะกรอกส่วนที่เหลือได้` | *(propose KEEP the `branch` loanword)* | same |

Everything else in `th` is already Thai-primary and stays unchanged
(`คอมมิต`/transliterated terms included — those are Thai script, not English).

### Why the loanword policy is NOT mine to assume

The whole right-hand column above hinges on one judgement I **cannot** derive from
the requirement: whether the stakeholder's Q37 "keep Branch" tolerance generalises
to the other git loanwords (`repository`, `branch` in body text, `Personal access
token`). Q37 proves his choice to keep some English git terms is a **deliberate
taste, not a default**, so translating them by assumption would be exactly the
"invent user-facing copy" trap. I therefore:

1. propose the drafts above (Thai-primary where I judge it consistent with his own
   `ที่เก็บโค้ด` usage; keep `branch` to match his kept "Branch"), and
2. gate them on his yes/no — see `## Questions` (routed via Porter, per Q41 and the
   REQ-001 Q14 sign-off default). **No proposed string ships without his answer.**

## Non-functional

- Strings only. Diff = value edits inside the `th` object of one file. Existing
  gates still apply: `bun run typecheck` exit 0, `bun run build` green with the
  same four routes, SPEC-002 token gate real-zero, clean tree.
- `en` object unchanged; `MessageKey` set unchanged; no new key, no removed key.

## Tasks

- TASK-024: FE — apply the stakeholder-approved Thai-primary `th` strings to
  `dictionaries.ts` (depends on: the sign-off in `## Questions`).

## Questions

### Q-SA-22 (to Porter → the stakeholder) — the loanword policy, decides the reword

The `th` dictionary is already almost entirely Thai-primary; the only strings still
leading with English are git technical terms. In Q37 the stakeholder kept "Branch"
in English on purpose. **Does that tolerance extend to the other git loanwords?**
The team proposes:
- `Repository` label → `ที่เก็บโค้ด`; `repository` inside sentences → `ที่เก็บโค้ด`;
- keep the `branch` loanword in body text (matching the kept "Branch" label);
- `Personal access token` → `โทเคนการเข้าถึงส่วนบุคคล (Personal access token)`.

Answerable in one line: **yes to the proposed set, or tell us which git terms to
keep in English.** (This is also the Q41 sign-off on the reworded copy — REQ-001
Q14 default = the drafts return to him for yes/no before shipping.)

> answer: (pending — via Porter)
