# TASK-022: Translate auth + people list + form
- Source: SPEC-007
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-021

## What to do
Route every user-facing string on these screens through `t()` (add `th`+`en` catalog entries under
`auth` / `people`), no behaviour change:
- **Auth** (`login`, `register`, `AuthCard`): titles, subtitles, field labels/placeholders, buttons,
  the generic "invalid email or password", "email already in use", per-field validation text, cross-links.
- **People list**: title, the "{count} people" line (interpolate `{count}`, with Thai/English plural
  wording), filter placeholders (search/relationship/tag), Export/New buttons, loader, the two empty
  states (no people / no filter match).
- **PersonForm**: section headings (Basics / Thinking & communication style / Topics…), every field
  label + placeholder, the axis `Select` **display labels** (keep the stored value = canonical English
  token), Create/Save/Cancel/Delete, field-error text.

## Definition of Done
- [x] Default Thai: people list ("ผู้คน"/"ส่งออก"/"เพิ่มคน", placeholders) + form (sections
      "ข้อมูลพื้นฐาน"/…, name, "สร้าง") + auth ("เข้าสู่ระบบ"/"ยินดีต้อนรับ") render Thai on load;
      switch → English flips all (verified list + login both directions).
- [x] `{count}` interpolates ("{count} คน" / "{count} people"); axis Select shows the translated label
      ("เหตุผล") but **create stored the canonical `reason`** (verified via the created person). Create works.
- [x] No hardcoded user-facing strings on these screens — grep: no literal `label=`/`placeholder=`/
      `description=` in login/register/people/PersonForm; all via `t()`.
- [x] No behaviour/API change; `bun run build` clean. Walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-29 in `manager-gold-front` (branch `dong`, commit `c70d208`).

**Files:**
- `lib/i18n/catalog.ts` (mod) — added `auth`/`people`/`form`/`axis` keys (th+en, type-parity enforced).
- `app/login/page.tsx` + `app/register/page.tsx` (mod) — all chrome via `t()`; **errors stored as keys**
  (`errorKey`) so they re-translate on language switch; register maps which 400 fields failed → translated
  per-field messages (rules are known: email format / password ≥8).
- `app/people/page.tsx` (mod) — title, `{count}` (`people.countOne/Other`), filter placeholders, Export/New,
  empty states, Open/Edit, loader — all `t()`. (Sentiment badge value left as data — TASK-023 area.)
- `components/PersonForm.tsx` (mod) — section headings, field labels/placeholders, buttons, field errors via
  `t()`; **axis `Select` `data` = `{value:o, label:t('axis.'+o)}`** → translated label, canonical English value.
- `app/people/new/page.tsx` + `app/people/[id]/edit/page.tsx` (mod) — titles (`form.newTitle` / `form.editTitle`
  with `{name}`), the delete `window.confirm` (`form.deleteConfirm`), error state — via `t()`.

**Verification (evidence) — real browser on :3020 → my own mock on :4098 (see §7 note):**
- Default (no stored pref): list Thai ("ผู้คน", "ส่งออก", "เพิ่มคน", "{n} คน", Thai placeholders), no
  English leaks; form Thai (3 sections, name, "สร้าง").
- **Axis canonical:** set Decision basis to **"เหตุผล"** (Thai label) → submit → the created person's
  `decisionBasis === "reason"` (canonical English, not the label). Create works (→ `/people`).
- Switch **EN**: list → "People"/"Export"/"New person" (Thai gone). Auth `/login`: EN ("Log in"/"Welcome
  back") ↔ TH ("เข้าสู่ระบบ"/"ยินดีต้อนรับ"). `mg-lang` persists.
- grep: no literal `label=`/`placeholder=`/`description=` left. `bun run build` clean. Only console msg =
  the known ColorSchemeScript dev warning.

**§7 note:** `:4020` is **Jason's running Postgres backend** (his TASK-024). I did NOT touch it or its DB —
I ran **my own mock on :4098** and pointed my dev front at it (`NEXT_PUBLIC_API_BASE=http://localhost:4098`),
plus the no-backend auth screens. Stopped only my own processes. Sentiment-badge label translation +
profile/AI-chrome strings are TASK-023.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `c70d208` on `dong`). Read `PersonForm.tsx` (axis handling)
+ `app/login/page.tsx` + the notes:
- **Axis guardrail exactly right:** `Select data = {value: o, label: t('axis.'+o)}` → translated label,
  stored/sent value = canonical English token `o`. Verified: "เหตุผล" → stored `reason`; create works.
- **Errors as keys, not text:** login stores `errorKey: MsgKey` and renders `t(errorKey)` → re-translates
  on language switch; 401/400 collapse to one generic message (no enumeration) — preserved.
- All auth/list/form chrome via `t()` (grep: no literal `label=`/`placeholder=` left); `{count}` interpolates
  (th/en); handlers/validation unchanged; `bun run build` clean. §7 followed (own mock :4098; left Jason's
  :4020 PG backend alone).

Non-blocking: non-`name` field errors now show a generic translated "invalid" instead of the exact backend
message — a fine i18n tradeoff (can't surface raw English backend text in a Thai UI). DoD: all 4 met.
→ TASK-023 + TASK-025 remain for REQ-007/008.
