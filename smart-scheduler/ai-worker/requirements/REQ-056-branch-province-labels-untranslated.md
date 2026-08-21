# REQ-056: `สาขา` / `จังหวัด` render in Thai on the English UI (booking modal)
- Status: ⛔ **CLOSED — NOT A DEFECT (Porter, 2026-08-19). The premise was wrong; nothing to build.**
- Priority: LOW (cosmetic, but it is on the screen staff use all day and it is two strings)
- Requested: 2026-08-19 — found by Tanya as **DEF-5** during the `sid` six-REQ screen pass
- Deadline: none

## Problem / Goal
With the UI language set to **EN**, two labels in the New-booking modal still render in Thai — **`สาขา`** and
**`จังหวัด`** — at 1440 and at 375. Everything around them translates; these two were missed, so an English-reading
user gets a form that is 95 % English with two Thai words in it.

**Not in REQ-043/044's scope** — those changed the student picker and the tab strip and did not touch these fields.
This is a pre-existing i18n gap that the screen pass surfaced, which is exactly what a rendered pass is for.

## Requirement
1. Both labels resolve through the same i18n dictionary as the rest of the modal — **no hardcoded Thai string**.
2. They switch with the language toggle, both directions, like every other label on that form.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the UI language is **EN**, **When** the New-booking modal is open, **Then** the two
      labels read **`Branch`** and **`Province`**; **no Thai text remains** anywhere on that form in EN.
- [ ] **AC-2** — **Given** the language is **ไทย**, **Then** they read **`สาขา`** and **`จังหวัด`** exactly as today.
- [ ] **AC-3 (regression)** — No other label on the modal changes, and no raw i18n key is ever visible.

## User-facing wording (Porter as UX writer)
- TH `สาขา` · EN **`Branch`**
- TH `จังหวัด` · EN **`Province`**

## Constraints
- Copy only. No layout, no behaviour, no field changes.

## Out of Scope
- Auditing every other screen for untranslated strings — worth doing, but as its own sweep, not smuggled in here.
  *(If Sober thinks a quick grep for hardcoded Thai in the FE is cheap while he is in there, say so and I will
  raise it as its own REQ rather than widening this one.)*

## Questions
- (none — the strings are decided.)
- **🔴 SA finding (Sober 2026-08-19) — the premise is wrong; these aren't FE strings, they're DB data.** Grounded it:
  there is **no hardcoded `สาขา`/`จังหวัด` anywhere in the FE source** (grep on `src/**/*.tsx` = 0, only a code comment).
  On the booking modal those two labels are **badge-TYPE names** rendered as `bt.name` from `useBadges()` (the DB) —
  and `dictionaries.ts` itself lists `สาขา` as the *example* of an admin-created badge type (`typeNamePlaceholder:
  "e.g. Branch…"`). So the admin created badge types **named** `สาขา`/`จังหวัด`; they render as-entered because they're
  user data, not system copy. **You cannot translate a user-created badge name through the FE dictionary — there's no
  string to change.** ⇒ **REQ-056 as scoped (an i18n copy fix) is not buildable.** Three real options, owner's call
  (via Porter): **(a)** leave it — a badge the admin named `สาขา` correctly shows `สาขา` (it's their label, arguably not
  a bug); **(b)** add **bilingual badge names** (`badge_types.name_th`/`name_en`) so badges follow the UI language — a
  real badge-system feature, its own REQ, bigger than LOW-cosmetic; **(c)** the admin **renames** the badge types (or
  adds EN ones) — config, not code. I'd not cut a task until Porter picks; there is nothing for Fern to fix here.
- **Porter's grep-sweep question (answered):** a blind grep for Thai in the FE hits **43 `.tsx` files**, but most are
  **code comments** (like the one for this very field) and **DB-sourced labels** (badge names), not hardcoded UI
  strings. So it is **not a cheap grep** — a real "untranslated UI string" audit has to distinguish comments / data /
  badge-names from actual literals, which is a proper scoped pass, not a one-liner. Worth its own REQ **if** the owner
  wants an i18n audit; not something to smuggle in or estimate from a raw grep count.

---

## ⛔ CLOSED 2026-08-19 — my premise was wrong, and Sober grounded it before anyone built anything
I wrote this REQ assuming `สาขา` / `จังหวัด` were **hardcoded Thai strings the FE forgot to translate**. They are
not. Sober grepped the frontend: **zero** such literals. Those two words are **badge-TYPE names read from the
database** (`bt.name`) — an **admin created badges and named them in Thai**, and the UI renders the name as entered.
`dictionaries.ts` even lists `สาขา` as its *example* of an admin-created badge type.

**So the behaviour is correct.** A badge the school named `สาขา` displaying as `สาขา` on the English UI is **user
data shown faithfully**, not a missed translation. There is no dictionary string to change and no task to cut.

**Decision: (a) leave it.** The EN toggle exists for a Thai-speaking back-office; nobody today is an English-only
user of this screen, and inventing English names for someone else's badges would be us renaming their data.

**Recorded as a real option rather than dismissed:** if the back-office ever needs to be genuinely usable in
English (a foreign admin, a franchise), the honest fix is **bilingual badge names** (`name_th` / `name_en`) — a
**badge-system feature with its own REQ**, not a LOW cosmetic patch. Until someone actually needs it, building it
would be scope I invented from a screenshot.

**DEF-5 is reclassified: not a defect.** Tanya was still right to raise it — the same screenshot could equally have
shown a real i18n miss, and now we know which it was.

**Lesson (same family as REQ-044's premise and the "parent rows" I flagged):** I read a screen and inferred a
cause. The signal was real; my explanation of it was invented. Each time, the fix was someone grounding it in the
code or the data **before** work started — which is exactly what the chain is for.
