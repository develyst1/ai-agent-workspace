# TEST-112: F3 (the leave dialog follows the ticks) + TASK-830 (English area names) on sid

- **QA:** Tanya
- **Date:** 2026-10-21
- **Environment:** sid: front `c743304` + back `fa1a04c` (front-only deploy)
- **Brief:** Porter's ⏸️ / ▶️ F3 + TASK-830 entries in `inbox/QA.md`; `DEPLOY-F3-and-TASK-830-front-2026-10-21.md` §4
- **Evidence:** `project-docs/qa-2026-10-21/task830/`

**Verdict:**
- **TASK-830: ✅ PASS** on the admin parent form, EN and TH, saved data read back.
- **The register link (LIFF) screen is not reachable headless.** Its proof is Sober's unit set plus the admin form, which uses the same `AreaPicker` code.
- **F3: ✅ by evidence without a login** (my judgment below). A real-browser look needs a teacher session, so DR-3 is optional, not blocking.

## F3: can it be proven without a teacher login? Mostly yes
| Piece | Evidence | |
|---|---|---|
| **The rule the screen must follow:** the server acts ONLY on the ticked sessions | Already proven on sid **by value** in TEST-111 §re-check run 0: ticking only the sole class ⇒ `cancelled 1`; the co-taught Y1 / X1 and the D4 X3 kept qatt75 | ✅ (server unchanged: back still `fa1a04c`) |
| **The screen logic** (each before-save line counts only the ticked classes) | I ran Sober's `leave-co-taught-task828.dom.test.tsx` myself on the front tree at **`c743304`**: **37 pass / 0 fail** | ✅ |
| The cases in that file | everything ticked ⇒ cancels 1 · 2 go on · one D4 sentence; **only the sole ticked ⇒ cancels 1, NO co-taught line, NO D4 sentence**; co-taught only ⇒ the co-taught n of the ticked; D4 alone ⇒ its sentence only; nothing ticked ⇒ nothing said; a future day ⇒ the whole day | = DEPLOY §4's three F3 bullets |
| **The deployed dialog in a real browser** | **Not seen.** Only a teacher login opens it; the admin's door is future-only and has no ticks | ⚪ |

**My call:**
- The open risk is only that sid's built bundle differs from `c743304`. That is low: the same component rendered on sid in TEST-111, and the deploy is the usual build.
- **I'd accept F3 on this evidence.**
- If you want the real-browser look anyway: **DR-3 (optional)**. The owner re-opens "อนุญาต b" (sid, `qa-coach-qatt75`) for this one F3 check. I'd make 3 QA classes today (sole / co-taught / D4), tick only the sole one, read the dialog, save, read back, clean up. About 10 minutes.

## TASK-830: the admin parent form (People → Edit parent), QA parent `a3fb456e` (QAChatOne / Two)
**Original:** province text «กรุงเทพมหานคร», no codes, no address lines. It was restored exactly at the end (read back equal, field by field).

| Step | Result | |
|---|---|---|
| **EN** form, province: type "Bueng" | options `["Bueng Kan"]` | ✅ |
| **EN** district list | "Mueang Bueng Kan, Phon Charoen, So Phisai, Seka, Pak Khat, Bueng Khong Long, …"; typing "Mueang" finds it | ✅ |
| **EN** sub-district list (3801) | "Bueng Kan, Non Sombun, Non Sawang, Ho Kham, Nong Loeng, Khok Kong, Na Sawan, Khai Si, Chaiyaphon, Wisit, Kham Na Di, Pong Pueai"; typing "Bueng" finds 380101 | ✅ |
| **EN Save ⇒ stored** | `provinceCode 38 · districtCode 3801 · subdistrictCode 380101` · `province` **"บึงกาฬ"** (Thai) · `addressTh` **"บึงกาฬ เมืองบึงกาฬ บึงกาฬ"** · `addressEn` "Bueng Kan Mueang Bueng Kan Bueng Kan" | ✅ |
| **EN parent card** | "… 0899990763 **Bueng Kan Mueang Bueng Kan Bueng Kan** Edit …" | ✅ |
| **TH** card | "… บึงกาฬ เมืองบึงกาฬ บึงกาฬ แก้ไข …" | ✅ |
| **TH** form | the pickers in Thai (บึงกาฬ / เมืองบึงกาฬ / บึงกาฬ), typing Thai finds them, Thai labels | ✅ unchanged |
| **TH Save** of the same picks (reset to the original first) | **identical** to the EN save: codes, `province`, `addressTh` (compared field by field) | ✅ |
| **The once-garbled sub-district** (คลองตันเหนือ, the old "Khnong Tntnai") | API `103902` nameEn **"Khlong Tan Nuea"**. The EN picker: Bangkok → Vadhana → typing "Khlong Tan" ⇒ `["Khlong Tan Nuea"]` (`en-khlong-tan-nuea.png`; Add-parent form opened only to read, then Cancel, nothing saved) | ✅ |

- ⚪ **N1:** Bangkok's วัฒนา is **"Vadhana"** in the dataset (the official BMA spelling). Typing "Watthana" finds only Thawi Watthana. Not a defect; noted in case Khwan types the common spelling.
- ⚪ **The register link (LIFF):** it opens only inside LINE (the LIFF ID token is the credential), so a headless browser can't reach the pickers or the confirm row, and QA has no LINE account.
  - **The page uses the same `AreaPicker` / `areaLabel` as the admin form above,** and Sober's `address-english-task830.dom.test.tsx` covers the confirm row and the saved body.
  - A real LINE look would be the owner's, on his phone, if wanted.

## Clean-up
- **Parent `a3fb456e` was restored** after every run with `PATCH` codes null, then `{province: "กรุงเทพมหานคร"}`. The final read back **equals the original** (`addressTh` / `addressEn` null).
- **Nothing else was created or saved.** No teacher login was used: the "อนุญาต b" exception ended with TEST-111.

**Scripts (scratchpad):**
- `t830a` (explore);
- `t830b` (the EN / TH saves + restore);
- `t830c` (Khlong Tan Nuea, read only);
- the F3 unit run: `bun test src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx` on `c743304`.

**§uat (2026-10-21):** the EN admin parent form on uat lists English names ("Bueng" ⇒ Bueng Kan; districts in English), opened only. See TEST-111 §uat.
