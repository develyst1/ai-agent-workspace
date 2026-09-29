# TASK-472 — the three rich-menu images at LINE's exact sizes, under 1 MB, at the runbook's fixed paths — plus the README contract and a check that the artwork matches the tap areas — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size S.** No migration. **This is the runbook's prerequisite** — without it step 3 refuses.

## §0 What is wrong with the customer's files (Porter, verified)
`project-docs/customer-2026-09-25-richmenu/`:
- `menu-linked-6cell.png` — **1527×1030, 1.58 MB.** Right ratio, wrong size, **over LINE's 1 MB limit**.
- `menu-unlinked-2cell.jpg` — **2160×728.** Not a size LINE accepts at all.
LINE takes **2500×1686 / 1200×810 / 800×540** for a full menu and **2500×843** for a half one, **≤ 1 MB**.
**Owner's ruling (09-25):** stretch them to the exact sizes now and use them; if Khwan later sends full-size originals, swap them in; if the stretched ones look fine on Tanya's screenshots they may go to the real OA as they are. **So: no waiting.**

## §1 You already have the tool, and the precedent
`assets/line/generate-rich-menus.mjs` (TASK-041) draws today's menus with `sharp`, which lives in the **frontoffice** repo — the script documents running it from there (`cd smart-scheduler-front && bun ../smart-scheduler-back/assets/line/generate-rich-menus.mjs`). Use the same anchoring for the resize. 🚫 Do not add `sharp` to the backend's dependencies for this.

## §2 Build
1. **A resize step** (extend the existing script or a sibling beside it — say which and why) producing exactly:
   - `assets/line/menu-unknown.png` — **2500×843**
   - `assets/line/menu-customer.png` — **2500×1686**
   - `assets/line/menu-teacher.png` — **2500×843** (see §3)
   each **≤ 1 MB** (say what you did if a resize lands over: PNG optimisation, or the 1200×810 tier — never a silent quality cliff).
2. 🔑 **A check that the artwork matches the TAP AREAS**, and this is the part worth more than the resize: the cells in `src/lib/line-rich-menu.ts` are a grid over 2500×1686 (and 2500×843). Assert the image dimensions equal the definition's `size`, for all three — so **a picture whose buttons do not line up with the taps fails the suite instead of confusing a parent**. That is the failure this pairing exists to prevent: the image is what a person sees, the definition is what LINE acts on, and nothing today says they agree.
3. **`assets/line/README.md`** — it still describes the old six files. Rewrite it for the new contract: three files, their exact sizes, the ≤ 1 MB rule, where they come from (the customer's originals for the two parent menus; §3 for the teacher), and how to regenerate. The README is what the next person reads before a publish; leave it saying something true.
- 🚫 No change to the cell definitions or to the publish script.

## §3 The teacher image — my recommendation, and a decision for the owner
Today there are `teacher-th.png` and `teacher-en.png`; one menu per role means one file, and the teacher cells are labelled in one language, so the teacher menu is **not** bilingual the way the new parent artwork is.
🔑 **But our teacher images are GENERATED, not drawn** — `generate-rich-menus.mjs` renders the labels from `line-i18n.ts`. So we do not have to pick a language: **generate a bilingual teacher image** (`แจ้งลา / Leave` in one cell, the same for the rest), matching the parent menus and keeping the cells exactly where they are.
⚠️ **The owner ruled "the teacher menu keeps its existing artwork and cells".** Regenerating the labels honours the *cells* but changes the *picture*, so I am putting it to him through Porter as a small, cheap improvement rather than assuming it. **Build the bilingual one; if he says no, `teacher-th.png` resized is the fallback and it is a one-line change** — say so in your report so the swap is obvious.

## Definition of Done
- [ ] The three files at the exact sizes, each ≤ 1 MB, at the runbook's paths · the dimensions-match-definitions check (all three, failing if a size drifts) · the README rewritten for the new contract · the teacher image built bilingual with the fallback named · what you did about any file over 1 MB · suite **count** · tsc 0 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — three images at LINE's exact sizes, ≤ 1,000,000 bytes; the picture-matches-definition check; README rewritten; 3031 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **3031 pass / 0 fail** (+9; new `src/lib/rich-menu-images-req107.test.ts`) · `tsc` **0** · 🚫 no migration (**56 = 56**) · 🚫 no change to the cell definitions or the publish script · 🚫 `sharp` NOT added to the backend (both scripts run from the front repo, the generator's own anchoring).

## §1 The three files (at the publish's `IMAGE_PATHS`)
| File | Size | Bytes | How |
|---|---|---|---|
| `assets/line/menu-unknown.png` | **2500×843** | 983,826 | her 2160×728 JPEG stretched, full-colour PNG |
| `assets/line/menu-customer.png` | **2500×1686** | 591,887 | her 1527×1030 PNG stretched; **⚠️ 256-colour PNG** (below) |
| `assets/line/menu-teacher.png` | **2500×843** | 28,552 | generated, bilingual (§3) |

## §2 What I did about the file that would have been over 1 MB (no silent quality cliff)
- Her 6-cell image stretched to 2500×1686 is **2.67 MB as full-colour PNG**.
- A 256-colour palette with dithering was still **1.56 MB**.
- **256-colour, quality 90, no dither: 0.59 MB.** I compared a crop of it side by side with the full-colour one, and they read the same: her art is flat orange line work on off-white, and dithering was what bloated it.
- The 1200×810 tier was **not** an option: the image must equal the definition's `size`, and the definitions are not mine to change here.
- The script tries full colour first and falls back only when over the cap, **printing that it did**.
- 📌 I read LINE's "1 MB" as the **stricter 1,000,000 bytes**, in both the script and the test, so no reading of it can refuse the file. The unlinked file (983,826) passes either way.

## §3 Resize = a SIBLING script; teacher = the generator EXTENDED. Why each:
- **`assets/line/resize-customer-menus.mjs` (new sibling).** The generator draws from code and needs no input, so any machine can regenerate it. The resize needs her files, which live outside the repo (paths passed as arguments). Folding it in would make every regeneration depend on her files being present. `fit: "fill"`: her linked art is already the right ratio; her unlinked art stretches about 2 % vertically.
- **`generate-rich-menus.mjs` (extended).** The teacher art is generated there. It gets an optional second label line (`sub`) and a new `menu-teacher.png` job: the **same two cells at the same bounds, same blue**, with Thai over English (`ตารางของฉัน / My schedule` · `ภาษา/ช่วยเหลือ / Language/Help`), in the parent art's arrangement.
  - ✅ **The six existing files regenerate byte-identical** (sha-256 checked before and after), so a cell without `sub` renders exactly as before.
  - ⏪ **Fallback if the owner keeps the Thai-only picture:** a one-line swap, written as a comment beside the job (use `teacher-th`'s svg).

## §4 🔑 The check that matters: the picture matches the definition
`rich-menu-images-req107.test.ts` checks the following:
- It pairs each file with its menu **through the publish script's own `IMAGE_PATHS`**, so the file checked is the file uploaded. A fourth image that is not paired fails.
- For each file, it reads the PNG header (IHDR, no image library) and asserts **width × height = the definition's `size`**, the file is a real PNG, and it is **≤ 1,000,000 bytes**.
- Every tap area lies inside the picture.
- The three sizes are ones LINE accepts.

## §5 README rewritten
Three files, exact sizes, the ≤ 1,000,000-byte rule (and that it is now a test), where each file comes from, both regenerate commands, the palette note with the measured sizes, the teacher fallback, and a short note on the six older files (still on accounts until `line:remove-menus`, after the sweep).

## Break-and-watch: `mut472.mjs`, 7 mutations, **7 bite**
`finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + every PNG in the folder, `21f46f83…`, identical before and after. `BASELINE=33` read off the run on 3 suites.
- A 🔴 the customer image swapped for a half-height picture
- B 🔴 the unlinked image left at her original 2160×728
- C the teacher image full-height
- D 🔴 the customer image padded past 1,000,000 bytes
- E 🔴 the **definition** drifts (teacher size changed, image untouched)
- F the publish uploads a fourth, unpaired image
- G a JPEG under a `.png` name

⛔ Only you mark this DONE. ▶️ For the owner/Tanya: the stretched art's sharpness is judged on Tanya's screenshots, per the ruling.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3031 pass / 0 fail** both times · tsc 0 · 56 = 56. The three files on disk measure **983,826 · 591,887 · 28,552 bytes** — all under the 1,000,000 cap he adopted.
Three calls I am keeping:
1. 🔑 **"Picture = definition" is built the right way round** — the test pairs each file **through the publish's own `IMAGE_PATHS`**, not a list typed in the test, reads the PNG header, and asserts width × height equals the definition's `size` **and that every tap area falls inside the picture**. So the thing that ships and the thing that is checked cannot be two different files, and a cell that wanders off the edge fails before a parent presses it.
2. **The 1 MB problem was solved out loud, not quietly.** Her 6-cell art is 2.67 MB stretched and still 1.56 MB dithered; 256 colours at quality 90 without dither is 0.59 MB and reads the same side by side. He says what he tried, what he chose, and that the script only falls back **when over the cap** and prints when it does. He also refused the 1200×810 tier for the right reason — the image must equal the definition's size, and that rule is now a test.
3. **The cap is read as 1,000,000 bytes, not 1,048,576** — the stricter reading of an ambiguous limit, on a file we cannot test against LINE until publish day. Correct instinct.
⚠️ **One thing to watch, and it is not a defect:** `menu-unknown.png` is **983,826 bytes — 98.4 % of the cap.** It passes, and it has almost no headroom, so **if Khwan later sends full-size originals, the unknown menu is the file to re-check first**; a slightly busier picture will tip it over and the test will say so before LINE does. Noted for the runbook rather than fixed.
📌 The six older images regenerating **byte-identical** is the proof that extending the generator changed nothing it should not have — exactly the check I would have asked for.
