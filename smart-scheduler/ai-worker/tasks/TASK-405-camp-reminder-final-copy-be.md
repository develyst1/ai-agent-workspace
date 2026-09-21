# TASK-405 — The camp-day reminder: the OWNER'S final copy replaces the placeholders (`REQ-095 §10`, Stage 3b close)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-19) · **Size XS.** No migration (44 = 44). `sid`.

## §0 The owner's words (via Porter, 2026-09-19) — these are the bytes
- **Label is `Students`, NOT `Kids`** — the app's existing term (`ob_f_student` family), a customer may be a teen/adult. Everywhere in the camp reminder.
- **Teacher block** (per OPEN week covering today, after the class blocks, the same `⏱️TODAY'S SCHEDULE:` title):
  ```
  Camp : <week name>
  Date : DD/MM/YYYY
  Students : 8 (Full 5 · AM 2 · PM 1)
    - <child name>
    - <child name>
    …  (up to 12 names, then "+n")   ← the group's `Seats` block shape
  ```
- **Parent block** (per child with a PLANNED day today; beside any class block for the family):
  ```
  Student : <child>
  Camp : <week name>
  Date : DD/MM/YYYY
  Time : Full day | Morning (AM) | Afternoon (PM)
  ```
  TH: `Student` → the existing `ob_f_student` TH value · `Camp : ` → `แคมป์ : ` · `Time : ` → `ช่วง : ` with `เต็มวัน` / `ช่วงเช้า` / `ช่วงบ่าย`. The labels ride the existing per-audience language rule.
- **Timing = the 08:15 run** (already so).

## §1 Do
- Replace the `cp_*` PLACEHOLDER labels with the words above, both languages; drop the 📖 PLACEHOLDER comment; the pins that asserted "by FORM" now assert **by VALUE** (the exact lines, TH and EN, one teacher block with 13 children ⇒ 12 names + `+1`; one parent block per half).
- `Students` is the label — pin that the camp renderer never prints `Kids` (`/Kids/` absent in `line-i18n.ts` and the camp renderer).
- The names list rides the teacher block ONLY (the parent block names its own child) — the builder already carries the children; the renderer prints them.
- 🚫 No other change: the flag stays `off` by default (the owner flips it after deploy); the builder, the select, the keys untouched.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 44 = 44 · the words by value both languages · `Kids` absent · the +n rule by value · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# 📤 REPORT — @Jason → @Sober (2026-09-19)

✅ **DONE (code).** **2518 pass / 0 fail**, 195 files · `tsc --noEmit` clean · 🚫 no migration (**44 = 44**). The flag stays `off` by default; the builder's selection, the keys and the select are untouched.

## What changed (three files)
- **`lib/line-i18n.ts`** — the `cp_*` placeholders (and the 📖 PLACEHOLDER comment) are GONE; the owner's labels: `cp_camp` (TH `แคมป์` / EN `Camp`), `cp_students` (`Students` both — 🔑 never `Kids`), `cp_time` (TH `ช่วง` / EN `Time`), `cp_half_full` (`เต็มวัน` / `Full day`), `cp_half_am` (`ช่วงเช้า` / `Morning (AM)`), `cp_half_pm` (`ช่วงบ่าย` / `Afternoon (PM)`). `Student` and `Date` reuse the existing `ob_f_student` / `ob_f_date` keys (TH value `Student`, per §0).
- **`lib/line-message.ts` `case "camp_reminder"`** — under the same `⏱️TODAY'S SCHEDULE:` title (`ob_today_title`), blocks separated by a blank line: **teacher** per OPEN week — `Camp : <week>` · `Date : DD-MM-YYYY` · `Students : n (Full x · AM y · PM z)` · `  - <child>` up to **`CAMP_NAMES_MAX = 12`** then `  +n` (the group's `Seats` shape); **parent** per child — `Student : <child>` · `Camp : <week>` · `Date : DD-MM-YYYY` · `Time : Full day | Morning (AM) | Afternoon (PM)`. The labels ride `lang` like every other message.
- **`lib/camp-reminder.ts`** — ⚠️ one correction to your §1 "the builder already carries the children": it did NOT (TASK-403's teacher row was counts only). The rows now carry what the renderer prints and nothing it re-derives: `CampTeacherRow` + `date` + `names: string[]` (the planned children of that week today, in the select's order); `CampParentRow` + `date`. The selection rules (PLANNED only, OPEN weeks, per device, SKIPPED rows) and the `camp-reminder:` keys are byte-unchanged.

## ⚠️ One deviation from §0's sketch, on the owner's own rule
§0 wrote `Date : DD/MM/YYYY`. **REQ-087 §7 (TASK-344) is the owner's standing rule that EVERY rendered date is `DD-MM-YYYY`** (*"เอา แก้ให้เป็น 08-09-2026 เหมือนกัน"*), enforced by the every-date walker over all 19 kinds — this branch included. So the camp date renders **`05-10-2026`** through the ONE `ddmmyyyy` helper, like the class blocks above it in the same message. Say if the owner really wants a slash here and only here — it would be the first message to differ.

## Pinned (`camp-3b-undo-qr-reminder-req095-3b.test.ts` — 19 tests, +2; three moved from FORM to VALUE)
- **The teacher block by VALUE**, TH and EN, the whole message byte-for-byte (title, blank line, `Camp`/`แคมป์`, `Date : 05-10-2026`, `Students : 3 (Full 1 · AM 1 · PM 1)`, the three names).
- **The parent block by VALUE**, TH and EN, two children ⇒ two blocks; the three halves (`Full day` / `Morning (AM)` / `Afternoon (PM)` and `เต็มวัน` / `ช่วงเช้า` / `ช่วงบ่าย`).
- **The +n rule by VALUE:** 13 children ⇒ exactly 12 `  - ` lines then `  +1` and the 13th name absent; 12 ⇒ all twelve and no `+`; `CAMP_NAMES_MAX = 12`; two weeks ⇒ two blocks.
- **`Kids` absent** in `line-i18n.ts` (code) and in the camp renderer; the three old `cp_title` / `cp_teacher_line` / `cp_parent_line` keys and the PLACEHOLDER sentence absent; the six new keys present with their bytes; the builder's `names` on the teacher row only, `date` on both.
- The existing walkers (trailing whitespace, ISO-date leak, placeholder leak) cover the new bytes by construction — 2518 green.

## 🔑 Mutation — fourteen, `finally`, checksum — all bite
A `Kids` back · B TH camp label left English · C TH time label left English · D AM as the old placeholder · E the cap at 10 · F no `+n` (the rest dropped silently) · G the names dropped from the teacher block · H the date raw ISO · I the parent's `Time` line dropped · J no blank line between blocks · K its own title · L the builder carries no names · M the parent row no date · N the count inflated. Every restore byte-identical.

📦 Nothing to deploy beyond the held `uat` batch; the owner flips `camp_reminder_enabled` after. 🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
