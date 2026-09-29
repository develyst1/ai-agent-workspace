# TASK-484 — REQ-109 §1: the new ORANGE teacher menu artwork, stretched 2000×672 → 2500×843 — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** Asset prep only — **no publishing** (the owner runs every publish, by runbook).

## §0 The ask
`project-docs/customer-2026-09-26-teacher/teacher-menu-orange-2000x672.webp` replaces the current teacher artwork. **Owner's ruling, 09-26: stretch this file to 2500×843. There is no other original** — so do not ask for one and do not spend time trying to reconstruct a higher-resolution version.

## §1 Build
- Produce `assets/line/menu-teacher.png` at **2500×843**, **≤ 1 MB** (the same constraints TASK-472 settled for the other two).
- **Two cells, unchanged:** `ตารางของฉัน / My Schedule` · `ภาษา/ช่วยเหลือ / Language / Help`. The cell geometry is the same as today's teacher menu — 🔑 **say in your report which areas file the publish uses for the teacher menu and confirm it still matches this artwork.** A stretched image with the old hit-boxes is exactly the kind of thing that looks right and taps wrong.
- **Say what the stretch cost.** 2000×672 → 2500×843 is a 1.25× upscale; if the text goes soft enough that a coach would notice, **tell me rather than shipping it quietly** — the owner chose this file knowing it is the only one, but he has not seen the result.
- 📌 Record the final dimensions and byte size in the report, as TASK-472 did, so the runbook's prerequisite block stays true.
- 🚫 **Do not publish anything.** 🚫 No change to `menuIdFor`, the role axis, or either runbook (I will update those).

## Definition of Done
- [ ] `assets/line/menu-teacher.png` at 2500×843, ≤ 1 MB, dimensions and bytes stated · the cell areas confirmed against the artwork · the upscale's visible cost stated honestly · the publish's existing image checks still pass · suite **count** · tsc 0 · 57 = 57 · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-26) — the orange teacher art at 2500×843, 612,931 bytes; the hit-boxes match; the upscale's cost stated; nothing published

**Numbers:** `bun test` **3121 pass / 0 fail** (+1) · `tsc` **0** · **57 = 57** · 🚫 nothing published · no change to `menuIdFor`, the role axis or either runbook.

## §1 The file
- `assets/line/menu-teacher.png`: **2500 × 843, 612,931 bytes, full-colour PNG.** It stayed under 1,000,000 bytes without the palette fallback. Source: `customer-2026-09-26-teacher/teacher-menu-orange-2000x672.webp` (2000×672 WebP), stretched `fit: "fill"`. The aspect ratio is the same (2000/672 ≈ 2500/843), so this is a pure 1.25× scale with no distortion.
- **Made by the resize script's new optional THIRD argument** (`resize-customer-menus.mjs <linked> <unlinked> [teacher]`). The two parent files came out **byte-identical** on the same run (sha-256 checked).
- 🔴 **One thing the task did not name: the GENERATOR used to write `menu-teacher.png`** (TASK-472's bilingual blue art). Left alone, **the next regeneration would have silently overwritten the owner's orange file.** I removed that job. It stays as a commented line in the generator (the way back), and after a regeneration **all nine PNGs are unchanged** (sha-256 checked).
- The README is updated: the teacher row, the command with the third file, and the measured size.

## §2 🔑 The hit-boxes vs the artwork
- **The publish uses `TEACHER_MENU`** (`src/lib/line-rich-menu.ts`), which spreads `TEACHER_RICH_MENU`'s areas: **`action=schedule` at x 0–1250 and `action=lang` at x 1250–2500, both full height (0–843).** `IMAGE_PATHS.teacherImage` = `assets/line/menu-teacher.png`.
- **The artwork matches:** My Schedule on the left, Language / Help on the right, and the divider line at **x = 1250**, checked by eye on the stretched file.
- **Pinned by value** in `rich-menu-images-req107.test.ts`: the two areas, their actions, their exact bounds and the menu size. The existing image checks (PNG, exactly 2500×843, ≤ 1,000,000 bytes, every tap area inside) pass on the new file.

## §3 What the 1.25× upscale cost, stated honestly
- I compared the label **"ตารางของฉัน / My Schedule" at 1:1** (a crop of the stretched file against the same region of the original).
- The strokes are **slightly softer**, and the source's own faint **WebP compression speckle around the letters is carried over, 1.25× larger**. Nothing is broken, misshapen or unreadable.
- **In context it will not show:** LINE draws a rich menu at the phone's width (about 1080 px on a typical phone), so this 2500 px image is shown **about 2.3× SMALLER than its own size**. The softness introduced by a 1.25× enlargement is well below what that reduction keeps.
- **My read: not something a coach would notice.** The owner judges it on Tanya's screenshot, as with the parent menus.

⛔ Only you mark this DONE. ▶️ TASK-485 now.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified by me: `assets/line/menu-teacher.png` is **2500 × 843, 612,931 bytes** (read from the PNG header, not from the report) · **3121 pass / 0 fail** · tsc 0 · 57 = 57 · nothing published.

🔴 **The find is the one my task did not contain: the GENERATOR still wrote `menu-teacher.png`.** TASK-472's script produced the old bilingual blue artwork at that exact path, so **the next time anyone regenerated the menus, the owner's orange file would have been silently overwritten** — and it would have been found by a coach seeing blue artwork weeks later, with nobody able to say when it changed. He removed the job, left the way back as a commented line, and **proved the other nine PNGs are byte-identical after a regeneration** (sha-256).
📌 **The pattern, because it now has three instances:** *a new file dropped into a path something else generates.* The asset is correct the day it lands and wrong the next time a script runs. **When we replace a generated artefact with a hand-made one, the generator is part of the change** — that belongs in my task next time, not in his report.

**The hit-box check was the right thing to ask for and it was done properly:** `TEACHER_MENU`'s two areas (`schedule` 0–1250, `lang` 1250–2500, full height) pinned **by value**, and the artwork's divider confirmed at x = 1250. A stretched image with stale hit-boxes looks right and taps wrong; now it cannot drift silently.

✅ **The upscale's cost is stated the way I wanted it stated** — softer strokes, the source's WebP speckle carried over 1.25× larger, nothing broken — **plus the reason it will not show**: LINE renders the menu at roughly phone width, about 2.3× smaller than this file, which swallows more softness than a 1.25× enlargement introduces. **A judgement with its reasoning attached, and the decision still left to the owner on Tanya's screenshot.** That is the right division: he measured, he did not decide.
