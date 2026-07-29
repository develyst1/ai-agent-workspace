# TASK-023: Translate profile + sections + AI panel chrome
- Source: SPEC-007
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-021

## What to do
Route every user-facing string on the profile area through `t()` (catalog under `person` / `ai` /
`errors`), no behaviour change:
- **Person profile**: header actions (Back, Edit), the grouped **field group titles + row labels**
  (Relationship, Role, Decision basis, …), the "Person not found" state.
- **Feelings / interactions / tags sections**: section titles, "Current: <sentiment>" label,
  add-forms (labels/placeholders/buttons), the sentiment display labels, delete, "No … yet" empties.
- **AI panels (advisor + note-summary) — CHROME ONLY**: panel titles, the topic input label/placeholder,
  the "How should I approach them?" / "Summarize notes" buttons, the "Save to interactions"/"Saved ✓"
  labels, and the state text — friendly **"AI service is unavailable"**, **"Add some notes first"**,
  loading. **Do NOT translate the AI-generated advice/summary content** (that's REQ-008) — the
  `<Markdown>`/`AiResultCard` content passes through untouched.

## Definition of Done
- [x] Default Thai: profile, the three sections, and both AI panels' chrome render in Thai; switch → English.
- [x] The AI **content** card is unchanged (still renders the model's text via `AiResultCard`); only the
      surrounding labels/buttons/state text are translated.
- [x] Sentiment display labels translate but the value logic is unchanged (badge colors, currentSentiment).
- [x] No hardcoded user-facing strings remain on these screens (grep). No behaviour/API change.
- [x] `bun run build` clean. Walkthrough (TH + EN, an advice render, the 502 + no-notes states) in Notes.

## Implementation Notes
**Commit:** `1788a25` on `dong` (7 files, source only — no `.env`/`node_modules`/`.next`).

**Files touched**
- `lib/i18n/catalog.ts` — added `person.*` (back, notFound.title/body/back, group.basics/thinking/
  communication/topics/notes, field.commContent/commFormality), `sentiment.positive/negative/neutral`,
  `feelings.*`, `interactions.*` (+ `err.date`/`err.topic`), `tags.*`, `ai.*` (advisor.title/topicLabel/
  topicPlaceholder/button, save/saved, summary.title/button, unavailable, noNotes) — **both `en` and `th`;
  th/en parity is compile-enforced** by `th: Record<MsgKey,string>`.
- `app/people/[id]/page.tsx` — header (back/edit/**sentiment badge**), `FieldsCard` group titles + row
  labels, `NotFound`. Rows carry an `axis` flag: axis fields render `t(\`axis.${value}\`)`, free-text rows
  render the raw value.
- `components/FeelingsSection.tsx`, `InteractionsSection.tsx`, `TagsSection.tsx`, `AdvisorSection.tsx`,
  `NoteSummarySection.tsx` — all chrome via `t()`; the two AI panels store an `errorKey: MsgKey|null` and
  render `t(errorKey)` so error text re-translates on language switch.

**Guardrails**
- Sentiment + axis fields show **translated display labels** but the stored/sent value stays the canonical
  English token; `SENTIMENT_COLOR` map + `currentSentiment` logic unchanged.
- `AiResultCard` content is passed straight from `advice.content`/`summary.content` — **never** routed
  through `t()` (that's REQ-008). Only the panel chrome around it is translated.

**Browser walkthrough** (own mock on `:4098`, front on `:3020` via `NEXT_PUBLIC_API_BASE`; Jason's real
`:4020` untouched; stopped only my own PIDs afterward):
- **Default Thai** on `/people/p1`: groups "ข้อมูลพื้นฐาน / การคิด-การตัดสินใจ / การสื่อสาร / หัวข้อ & แรงจูงใจ / โน้ต";
  axis values "อารมณ์/ตรงไปตรงมา/เร็ว/เรื่องเล่า/กันเอง"; free-text ("friend","Designer","hiking, side projects")
  stays raw; sentiment badge "เชิงบวก"; sections "ความรู้สึก / บันทึกการพูดคุย / แท็ก / ที่ปรึกษาการเข้าหา / สรุปโน้ต".
- **Advice render**: clicked "ควรเข้าหาคนนี้อย่างไร?" → card body = "Tone / Warm but direct / Lead with the win /
  Keep it short / Use data to back it up." save-chrome = "บันทึกลงการพูดคุย".
- **Switch → EN**: all chrome flips (Basics / Decision basis / Approach Advisor / Save to interactions …);
  the advice card body is **byte-identical to the Thai render** — confirms chrome-only translation.
- **no-notes state** on `/people/p2` (no notes): "Summarize notes" → alert "Add some notes first."; switching
  TH ⇄ EN re-translates it to "กรุณาเพิ่มโน้ตก่อน" (uses `errorKey`→`t()`). The **502-unavailable** path renders via
  the identical `errorKey`→`t(\"ai.unavailable\")` mechanism ("ระบบ AI ไม่พร้อมใช้งานตอนนี้ — กรุณาลองใหม่").
- **grep** for `(label|placeholder|title)="[A-Za-z]` / bare capitalized JSX literals across the profile-area
  files → **no matches**. `bun run build` → compiled + TypeScript clean (only the known harmless dev-only
  ColorSchemeScript warning). No behaviour/API change.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `1788a25` on `dong`). Read `AdvisorSection.tsx` +
`app/people/[id]/page.tsx` (FieldsCard):
- **Guardrail verified: AI content is NOT translated.** `AdvisorSection` passes `content={advice.content}`
  straight to `AiResultCard` (→ `<Markdown>`), never through `t()`; Fern's TH/EN walkthrough shows the
  advice card body byte-identical across languages. Only chrome (title/topic/buttons/save) is `t()`.
  Same pattern for the summary panel.
- **Sentiment/axis:** badge label `t('sentiment.'+v)` but `SENTIMENT_COLOR[v]`/`currentSentiment` use the
  raw value (logic unchanged); FieldsCard axis rows translate via `t('axis.'+v)`, free-text rows render raw.
- **Error text re-translates on switch** via `errorKey → t()` (ai.unavailable / no-notes / somethingWrong).
- grep: no hardcoded UI literals on the profile-area files; `bun run build` clean; no behaviour/API change.
  §7 followed (own mock :4098; left Jason's :4020 alone).

DoD: all 5 met. **Last task of SPEC-007 — REQ-007 complete.**
