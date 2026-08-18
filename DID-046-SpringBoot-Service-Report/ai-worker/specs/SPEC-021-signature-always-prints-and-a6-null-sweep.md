# SPEC-021: Signature block always prints (4 slots) + sweep literal "null" — อ.6 (REQ-021) & อ.9 (DEF-9)

- Source: REQ-021 (อ.6, human: *"อ.6 แก้ให้ด้วย มีเรื่อง null ด้วยมั้ง"*) + DEF-9 (อ.9, under REQ-020,
  human: *"ลายเซ็นต์ควรขึ้นค้างไว้ด้วย ต่อให้ไม่มีคนเซ็นต์"*). Same two changes on sibling reports →
  one spec, one task (Porter approved bundling).
- Status: ACTIVE
- Care: **อ.6 is DELIVERED and in use** — minimal, surgical change; must NOT regress the delivered
  behaviours (REQ-005 item 7, REQ-009 ticks, REQ-010/015 person filter, REQ-011 เอกสารอื่นๆ, REQ-012 dotted line).

## Principle (already chosen by the human for the checklist)
**Form structure is LOCKED; data merely fills it in.** A paper form must stay hand-signable, so the
four signature slots must always print their structure (signature line, `( name )`, position line) even
with no signer data — blank, not absent. And a missing value renders **blank**, never the literal "null".

## Root cause — why the signature block collapses
Both reports render signatures via a subreport fed by `subDataSource("approvalSignatures")`
(a6-main.jrxml:197, a9-main.jrxml:171). The builder's `buildSignatures(referenceNo)` returns a list that
can be **shorter than 4 or empty**:
- `return List.of()` when `referenceNo` is blank, or when there is no `T_T_LICENSE_INFORM` row
  (`A6CheckListReportBuilder.java:103,109`; a9 builder is an identical mirror, ~103,109).
- `sig(...)` returns **null** for any slot whose name+position are both blank
  (`A6…:118-121`), and `buildSignatures` filters nulls out (`Stream.of(s1,s3,s2,s4).filter(nonNull)`).
An empty/short list → the subreport renders **zero/fewer rows** → the block (or slots) disappear.
The subreport itself is fine: for a blank row it still prints "(ลงชื่อ)" + "(  )" + position
(a6/a9-signature.jrxml:15,18) — the structure only needs a row to exist.

## The fix (surgical, mirrors the locked-checklist rule)
### 1. `buildSignatures` — ALWAYS exactly 4 slots, in the fixed display order (both a6 + a9 builders)
- Never `return List.of()`; when `referenceNo` is blank or there is no INFORM row → return **4 blank
  Signatures**.
- `sig(...)` must **never return null** → return a blank `Signature("", "", "")` when a slot has no
  name/position (so all 4 always present).
- Keep the existing slot order `s1, s3, s2, s4` (row-major 2-col: ตั้งเรื่อง / ผอ. top, หน. / จก. bottom).
- Do NOT hardcode role labels — position stays data-driven, blank when the DB has none (matches "blank
  when no data"). The a9 builder reuses the a6 recipe verbatim (this closes **DEF-9**).

### 2. Signature subreport — guard the position field (both a6 + a9)
`request-a6-signature.jrxml` / `request-a9-signature.jrxml` line ~21 (`$F{position}`) is a bare textField
with no `blankWhenNull` → add `blankWhenNull="true"` (name/nameInParen are already inline-guarded).

### 3. อ.6 full "null" sweep (REQ-021 #2 — the whole report, not just the a9-mirror field)
The a6 report currently has **zero** `blankWhenNull` on any of its 29 value textFields (6 jrxml: main +
component/evidence/evidenceSub/lawRef/signature). Add `blankWhenNull="true"` to every **null-capable
value** textField (bare `$F{...}` or expressions that can be null) across all six — same treatment
TASK-013 applied to a9. Leave static labels and already-safe inline-guarded concatenations' logic
untouched; `blankWhenNull` is harmless where a field is never null, so err toward covering value fields.

## Verify — DB-free first (BE), then real DB (QA)
### BE (A6PreviewTest + A9PreviewTest mock loops — no DB):
- **Signature (DEF-9 + REQ-021 #1):** add an **empty-signers** fixture to `A6CheckListPreviewBuilder`
  (and confirm a9 the same) → the preview must show **4 blank signature slots** (structure present).
  Keep a filled-signers case (a9 18847-style, 4 signers) → no regression.
- **Null sweep (REQ-021 #2):** set a null on a null-capable a6 field in the preview fixture → confirm it
  renders **blank**; grep the extracted `a6-preview.pdf` text for "null" → **none**.
- **No regression to delivered behaviours:** A6PreviewTest still green; item 7 / ticks / persons /
  เอกสารอื่นๆ / dotted-line content unchanged.
- **DEF-7 lesson:** regenerate `.jasper` via the PreviewTests (compile into `src/main/resources`) +
  clean compile; never hand-edit `.jasper`.

### QA (Tanya, via Porter — real `/a6/db/{id}` & `/a9/db/{id}`, read-only):
- **a6:** an อ.6 request with **no signer row** → 4 blank signature slots print; **38272 / 38314** →
  no "null" anywhere + all delivered behaviours intact.
- **a9:** `/a9/db/38179` (no signers) → 4 empty slots (DEF-9); `/a9/db/18847` (4 signers) → filled, no regression.
  (This is the process lesson: the a9 null leak escaped because it was only checked on the mock — confirm on real DB.)

## Not in this task
- No new fields/queries; no heading changes; no re-layout beyond `blankWhenNull`/the builder slot-padding.
- Real-DB seeding / sample provisioning for a9-destroy (type-2 sample, ReqMoveDestroyer) is unchanged &
  tracked elsewhere; DEF-9's a9 empty-signer check uses the existing 38179 sample.

## Tasks
- TASK-014: implement §1–§3 on both builders + templates; DB-free BE verification; hand to QA for the real-DB leg.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
