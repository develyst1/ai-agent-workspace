# TASK-550 — the approved LINE copy becomes FINAL — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-28) · **Size XS.** ⏸️ **Queued behind TASK-549 — not dispatched yet; here so the work is written down.**

## §0 Approved
**`COPY-REVIEW-2026-09-28.md` §E2 and §E3 are FINAL as written, both languages** (§E1 was already final).
- **§E2** — the `ปฏิทิน` reply: the SOM SCHEDULE link and "log in with the account your admin gave you".
- **§E3** — the new make-up-cancel line: `ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ {date}` / `A new class has been added on {date}.`

## §1 Do
- **Drop the draft markers, pin `mc_new_class` and the `ปฏิทิน` reply BY VALUE, both languages.**
- 🔑 **The shape pins stay:** *"only when a class was actually appended"* and *"never ชดเชย / make-up"* are **the promise**, and 🔑 **the promise outranks the letters — the words are now fixed, but they are not what makes the message honest.**
- **`{date}`, `{url}` remain placeholders** — 🚫 pin the template, never a rendered example.
- ⚠️ **Answer the same question as §2 of TASK-549:** what changed besides tests, in numbers, and **confirm no rendered string differs from the approved file.**

## Definition of Done
- [ ] Both pinned by value, both languages · **shape pins kept** · placeholders intact · "text-only?" answered with counts · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · mutation: **a one-character drift from the approved text** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-28): §E2 and §E3 FINAL. By value as TEMPLATES, shape pins kept, and **text-only (answered with counts below)** · **3524 / 0 normally, and 3× unreachable with plain `bun test`, 0 failed queries** · tsc 0 · 61 = 61 · four mutations bite

## §1 Done
- **The draft markers are gone:** the comment blocks above `cal_web_link` and `mc_new_class` now read **"APPROVED by the owner, FINAL"** (COPY-REVIEW §E2 / §E3). Pinned: no DRAFT / "NOT approved" / "Pinned by FORM|SHAPE" above either key.
- **By value, both languages, as TEMPLATES** (`t(key, lang)` with no vars, so **`{url}` and `{date}` stay placeholders**), in `approved-copy-task550.test.ts`.
  - A mutation that **renders a real date into the template BITES**.
- 🔑 **The shape pins stay, and they're the promise:**
  - the link **alone on its line** (TASK-519), the login line last (`calendar-web-link-task536`, kept, retitled);
  - the new-class line **only on a real append** (TASK-548's behaviour pins in `makeup-cancel-family-task537`, untouched);
  - **never ชดเชย / make-up** (re-pinned beside the values). A mutation putting ชดเชย into the approved line BITES **three** pins.

## §2 ⚠️ "Is it text-only?", in numbers, with a real comparison
- **Compared against the approved file itself.** A script reads `COPY-REVIEW-2026-09-28.md` §E2 / §E3 and our strings **through the real `t()`**, and compares segment by segment (the file writes a line break as ` / `).
  - **4 / 4 IDENTICAL:** `cal_web_link` TH, EN · `mc_new_class` TH, EN.
- **Production code changed by this task: 1 file** (`src/lib/line-i18n.ts`), **comments only.** Two comment blocks: **6 comment lines replaced by 7. 0 string lines, 0 code lines.**
  - **No rendered string differs**: the four values were already the approved text (TASK-536 / TASK-548 shipped them as drafts, and the owner approved them as written).
- **Test files: 3.**
  - **1 new**: `approved-copy-task550.test.ts`, 6 tests.
  - **2 edited, wording only**: `calendar-web-link-task536` (a header comment + one test title: "DRAFT" → "FINAL, the FORM kept here") and `makeup-cancel-family-task537` (one comment).
  - **No assertion changed in either.**

## §3 Break-and-watch (CHECKSUM identical, every restore byte-identical, BASELINE=32)
- **T1: one Thai character drifts** (`ก์` → `ค์` in the ปฏิทิน reply): **BITES**.
- **E1: one character drifts in EN** (the final period dropped): **BITES**.
- **P: a placeholder rendered into the template:** BITES.
- **M: ชดเชย creeps into the approved line:** BITES (3 pins).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **3524 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **61 = 61**.

## ✅ The comparison is the strongest one anyone has run on copy
🔑 **A script compares the APPROVED FILE ITSELF against our strings THROUGH THE REAL `t()` — 4 / 4 identical.**
⇒ **That proves the whole path, not the constant:** *the template, the lookup and the language selection all land on the owner's words, which a source-level diff would not have shown.* 📌 **Comparing against the document he approved, rather than against our own copy of it, is what makes it evidence.**

## ✅ Text-only, in numbers — the question answered, not deflected
**Production: 1 file, comments only (6 comment lines → 7; 0 string lines, 0 code lines) · no rendered string differs · tests: 1 new (6 tests) + 2 edited in wording only, no assertion changed.**
✅ **"No assertion changed" is the part that matters** — *an edit to a test's wording that quietly changed what it asserts would be exactly the drift this task exists to prevent.*

## ✅ Value pins added, shape pins kept, and the templates protected
**Both pinned by value, both languages, AS TEMPLATES** (`{url}` / `{date}` intact) — 🚫 **a rendered example never became the pin.** ✅ **The promise still holds the message honest:** the line only on a real append (**TASK-548's behaviour pins untouched**) and never ชดเชย / make-up. ✅ **And the DRAFT markers' ABSENCE is pinned**, so the words cannot quietly slide back to being ours.
