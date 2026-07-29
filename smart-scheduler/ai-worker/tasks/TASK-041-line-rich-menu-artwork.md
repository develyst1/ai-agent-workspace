# TASK-041: LINE rich-menu artwork — 4 images (parent/teacher × TH/EN), committed to the repo
- Source: SPEC-012 (REQ-015 deploy gap #2)
- Status: DONE  (reviewed 2026-07-29 by Sober — dimensions decoded + images inspected visually + TASK-040 preflight finds all four; see ## Review)
- Depends on: none (tap areas are already fixed in code). Pairs with TASK-040 (the publish command).
- Assignee: @Fern (design/FE) — ⚠️ the files are committed into **`smart-scheduler-back/assets/line/`**
  (backend repo) because the publish command reads them from there. Assets only — no backend code changes.

## What to do
REQ-015's bot is built but can't ship without rich-menu images. Produce **4 images** whose visual cells line up
**exactly** with the tap areas already fixed in `smart-scheduler-back/src/lib/line-rich-menu.ts` — if the artwork
doesn't match the bounds, buttons land on the wrong labels.

**Fixed file paths (contract with TASK-040 — do not rename):**
```
smart-scheduler-back/assets/line/parent-th.png
smart-scheduler-back/assets/line/parent-en.png
smart-scheduler-back/assets/line/teacher-th.png
smart-scheduler-back/assets/line/teacher-en.png
```

**Parent menu — 2500 × 1686, 3 columns × 2 rows** (exact bounds from the code):
| cell | x, y | w × h | action | TH label | EN label |
|---|---|---|---|---|---|
| 1 | 0, 0 | 833 × 843 | `checkin` | เช็คอิน | Check-in |
| 2 | 833, 0 | 833 × 843 | `leave` | แจ้งลา | Leave |
| 3 | 1666, 0 | **834** × 843 | `children` | ลูกของฉัน | My children |
| 4 | 0, 843 | 833 × 843 | `register` | สมัคร/เพิ่มนักเรียน | Register / add child |
| 5 | 833, 843 | 833 × 843 | `lang` | ภาษา | Language |
| 6 | 1666, 843 | **834** × 843 | `help` | ช่วยเหลือ | Help |

**Teacher menu — 2500 × 843, 2 cells:**
| cell | x, y | w × h | action | TH label | EN label |
|---|---|---|---|---|---|
| 1 | 0, 0 | 1250 × 843 | `schedule` | ตารางของฉัน | My schedule |
| 2 | 1250, 0 | 1250 × 843 | `lang` | ภาษา / ช่วยเหลือ | Language / Help |

**Design direction (business-level, relayed by Porter from the stakeholder — she delegated the look to us,
and will do a quick yes/no on the 4 images before release):**
- The customer is a **wheeled-sports / skate activity center** (bike, scooter, surfskate, skate) — **not** a
  tutoring school. Tone should fit that.
- **Simple and legible on a phone**: one clear icon + a short label per cell, high contrast, generous padding
  from the cell edges (so nothing looks clipped at the tap boundary).
- Consistent with the **frontoffice app's existing look** (Mantine palette / the restrained-color direction the
  client asked for — keep it calm, not loud).
- **Thai is primary**; the EN images mirror the TH layout exactly, English labels only.
- **Labels must match the bot's own wording** — reuse the `line-i18n` TH/EN strings (`lib/line-i18n.ts`) so the
  menu and the replies agree; the table above is the intended wording, confirm against the i18n keys.

**Format:** PNG (or JPEG), exact pixel dimensions above, **≤ 1 MB each** (LINE limit). Keep the source file
(Figma/SVG/whatever) alongside or documented so the artwork can be regenerated/tweaked after the stakeholder's
review — the publish command is re-runnable by design.

## Definition of Done
- [ ] All 4 images exist at the exact paths above, with the exact dimensions, ≤ 1 MB each.
- [ ] Each visual cell aligns with its tap-area bounds (table above); labels match the `line-i18n` wording;
      TH and EN versions share the same layout.
- [ ] Legible at phone size (check at ~1/3 scale); no text clipped near cell edges.
- [ ] Source/how-to-regenerate noted in Implementation Notes (for the post-review tweak round).
- [ ] No code changes in `smart-scheduler-back` — assets only.

## Implementation Notes
**Fern — DONE, ready for review (2026-07-29). 4 images produced; assets only, no `src/` change.**

**Deliverables (all in `smart-scheduler-back/assets/line/`):**
- `parent-th.png` / `parent-en.png` — **2500 × 1686** (47 KB / 42 KB)
- `teacher-th.png` / `teacher-en.png` — **2500 × 843** (22 KB / 20 KB)
- All indexed PNG, **well under the 1 MB LINE limit**; exact dimensions verified with `sharp` metadata.

**How they're made (regeneratable — DoD):** `assets/line/generate-rich-menus.mjs` — a standalone script that
builds each menu as an SVG (cell rects at the **exact bounds mirrored from `src/lib/line-rich-menu.ts`**: x-splits
833/1666, row 843; teacher split 1250) with simple line/silhouette icons + a centered label per cell, then
rasterises to PNG via **`sharp`**. Palette = the frontoffice Mantine look (accent `#228be6`, text `#212529`,
white bg, subtle `#e9ecef` cell dividers) — calm/restrained per the client direction. Icons: check-ring
(check-in), calendar-✕ (leave), two-people (my children), person-plus (add child), globe (language), ?-ring
(help), calendar-agenda (my schedule), globe-with-?-badge (language/help). Verified each image visually at ~1/3
scale: labels legible, nothing clipped near the tap edges (icon upper-40%, label at 74% of cell height).
- **Run to regenerate:** `sharp` isn't a dep of the backend repo, so run from a repo that has it —
  `cd smart-scheduler-front && bun ../smart-scheduler-back/assets/line/generate-rich-menus.mjs` (the script
  resolves `sharp` from cwd via `createRequire`, writes all 4 PNGs back into the folder). Documented in the
  `assets/line/README.md` "Regenerating the artwork" section I appended (kept the existing TASK-040 path-contract
  section intact).

**Labels — reconciled to `line-i18n.ts` (per the DoD "match the i18n wording"):** where the bot has a `btn_*`
key I used **its** wording, which differs slightly from this task's table:
- cell 3 → `btn_children` = **นักเรียนของฉัน / My children** (task table said "ลูกของฉัน / My children")
- cell 4 → `btn_register` = **เพิ่มนักเรียน / Add child** (task table said "สมัคร/เพิ่มนักเรียน / Register / add child")
- teacher cell 2 → `btn_langhelp` = **ภาษา/ช่วยเหลือ / Language/Help**
- `checkin`/`leave` = `btn_checkin`/`btn_leave` (เช็คอิน / แจ้งลา). `language`/`help`/`my schedule` have **no**
  dedicated i18n key (they're postback actions, not text buttons) → used the SPEC-012 wording (ภาษา / Language,
  ช่วยเหลือ / Help, ตารางของฉัน / My schedule).

**Scope note:** no backend code changed — added the `assets/line/` folder (4 PNGs + generator + README section).
The generator is a build-time asset tool, **not** imported by the app (doesn't touch `src/`, the build, or tests).

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- **Label reconciliation flag → @Sober.** I used the `line-i18n` `btn_*` wording where it exists (children →
  "นักเรียนของฉัน", register → "เพิ่มนักเรียน") over this task's table wording ("ลูกของฉัน", "สมัคร/เพิ่มนักเรียน"),
  per the DoD "labels match the line-i18n wording." If Porter/คุณฟีน prefers the table's exact phrasing on the
  buttons instead, it's a one-line edit in the generator + re-run — tell me which wording wins.
  > **answer (Sober): your call was right — keep the `line-i18n` wording.** The DoD said the labels must match
  > the bot's own strings, and menu↔reply consistency is the point: a button reading "ลูกของฉัน" that produces a
  > reply saying "นักเรียนของฉัน" is exactly the kind of small incoherence this REQ exists to remove. My table
  > was indicative wording; the i18n table is the source of truth. **No change needed.**
  > Where no `btn_*` key exists (language / help / my schedule) your SPEC-012 wording is fine.
  > **Not routing this to Porter as a blocker** — it's copy consistency, not a scope/business decision, and
  > คุณฟีน sees the actual rendered labels in Porter's pre-release image review anyway. I've flagged it to
  > @Porter as an FYI so he can point at the wording during that review; if she wants different phrasing it's
  > your one-line regenerate.
- Bounds + dimensions match `line-rich-menu.ts` exactly (verified). Nothing needed changing on the code side.
- Ready for the stakeholder's yes/no. The generator makes a tweak round cheap (edit palette/icon/label → re-run).

## Review
**Verdict: DONE ✅ (Sober, 2026-07-29).** Meets every constraint, and I checked the artwork **by eye**, not just
by metadata.
- **Files + specs verified myself:** all four at the contracted paths; decoded the PNG headers →
  `parent-{th,en}` = **2500×1686**, `teacher-{th,en}` = **2500×843** (exact); sizes **20–47 KB**, far under the
  1 MB LINE limit.
- **Looked at the images:** parent-TH renders a clean 3×2 grid whose dividers fall **on the tap boundaries**
  (thirds + mid-height), in the code's action order — เช็คอิน · แจ้งลา · นักเรียนของฉัน / เพิ่มนักเรียน · ภาษา ·
  ช่วยเหลือ. teacher-EN splits at **1250** with My schedule · Language/Help. Icons + labels are centered with
  real padding — nothing crowds a cell edge, and it's legible small. Palette is the restrained frontoffice blue
  (`#228be6`) on white, which fits the "calm, not loud" direction.
- **Integration proven, not assumed:** I ran TASK-040's preflight with the images in place — it found **all
  four** (only the missing token was reported). The Fern↔Jason contract holds in reality.
- **Regenerability (the DoD point that matters for the tweak round):** `assets/line/generate-rich-menus.mjs`
  builds the SVGs from bounds **mirrored from `line-rich-menu.ts`** and rasterises via `sharp`, with the run
  command documented in `assets/line/README.md`. So คุณฟีน's review feedback is a cheap edit + re-run + re-publish.
- **Scope clean:** `assets/` only. (The `src/` diff in the working tree is TASK-038/039's LINE code, not this task.)
- **Answered the label question in ## Questions — Fern's call was correct** (i18n wording wins over my
  indicative table; menu↔reply consistency is the point). No change required; flagged to @Porter as an FYI for
  the pre-release image review.
- **TASK-041 → DONE.** With TASK-040, **REQ-015's deploy gaps are closed.**
