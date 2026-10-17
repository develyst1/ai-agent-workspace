# TASK-734 — Option A: the «คุยกับแอดมิน» cell shows its text in the chat (`displayText`), so the chat surfaces for the admin — BE, XS
- Source: Khwan Q7 *"เวลาผปคกดเมนูมา มันไม่เด้งแชทขึ้นมาข้างบน"* · analysis `SIZING-teamB-khwan-answers-2026-10-12.md` §3 · **DECIDED option A under the owner's delegation** (Porter 2026-10-12) · makes 729's `ผู้ใช้ LINE` + time fallback findable
- Status: ✅ ENGINEERING DONE (Silver, 2026-10-12) · committed in `9fa5eb2` · ⏳ ships ONLY after the owner's phone SEES the bump on sid (step 0 → republish + relink → his phone)
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim (asked of Porter):** `src/lib/line-rich-menu.ts` (the cell action type + the admin cell, both menus) + its tests. 🚫 **No script runs from us:** the owner republishes + relinks (`scripts/line-publish-menus.ts` / `line-relink-menus.ts`). 🚫 **NEVER `line-remove-menus.ts`.** 🔴 SAFE test command only (TASK-723 has it). 🔴 run → list → ask → THEN edit.

## Build
1. Allow `displayText` on a cell's postback action type (`:18`).
2. Set `displayText: "คุยกับแอดมิน"` on the `action=admin` cell of **both** menus (`:99`, `:123`). Data unchanged (`action=admin`), so the webhook path is untouched.
   - The words are the button's own label, nothing new. If the EN menu's label differs, use that menu's label; declare it.
3. Every other cell unchanged (pin: only the admin cell carries `displayText`).

## The proof order (Porter; NOT ours to run)
**Step 0** (Tanya / the owner, OLD menus on sid): press «คุยกับแอดมิน» ⇒ the chat does NOT bump (her symptom) ⇒ build ⇒ **the owner republishes + relinks on sid** ⇒ his phone presses ⇒ **the chat shows "คุยกับแอดมิน" and bumps to the top** of OA Manager ⇒ only then uat. **No bump ⇒ A is dropped.**

## Definition of Done
- [ ] By-value tests: the admin cell's action = postback + `data: "action=admin"` + `displayText`; no other cell has one; both menus.
- [ ] Mutation: `displayText` missing (bites) · data changed (bites, the webhook path guard).
- [ ] tsc · full suite (SAFE). Nothing committed.

## Implementation Notes
**Bob, 2026-10-12 — BUILT inside the claim (`lib/line-rich-menu.ts` + a new test + set). Nothing committed. No script run.**
- `RichMenuArea.action` allows an optional `displayText`; the `cell()` helper takes it; the two `action=admin` cells (the UNKNOWN menu's second cell and the KNOWN/customer menu's corner) set it to **`คุยกับแอดมิน`** (a const `ADMIN_DISPLAY_TEXT`). The EN twins (`..._EN`) and the bilingual `UNKNOWN_MENU` / `CUSTOMER_MENU` spread those same areas, so all of them carry it. **Declared:** one text for every menu — the artwork labels the button in Thai/bilingual and the EN twins reuse the same cells; there is no separate EN label to use.
- The postback **data stays `action=admin`**, so the webhook path is untouched. Teacher/parent role menus have no `action=admin` cell (nothing to change); the admin (uri) menu is untouched.
- Tests: NEW `lib/rich-menu-admin-displaytext-task734.test.ts` (**4**: both menus + twins carry data+displayText on exactly one cell; EVERY other postback cell in EVERY menu def has none; cell data lists unchanged; geometry unchanged) + `.mutations.json` (**5 BITES · 0 SURVIVED**, checksum identical: D1 displayText missing · D2 data changed (webhook guard) · D3 leaks onto another cell · D4 wrong text · D5 helper drops it).
- **Full suite (SAFE): 4531 pass / 3 fail (340 files); tsc 0.** The 3 reds: one in task537 (TASK-731's), two in `rich-menu-admin-task530.test.ts` below.

## Questions
1. 🔴 `src/lib/rich-menu-admin-task530.test.ts` (a rich-menu test, but not the new one — asking, not assuming "its tests"): **line 73** pins the area type text `action: { type: "postback"; data: string; label?: string };` → add `displayText?: string`; **lines 183 and 184** pin the byte-for-byte JSON of `UNKNOWN_MENU` and `CUSTOMER_MENU` → each gains `,"displayText":"คุยกับแอดมิน"` inside the admin cell (the teacher JSON at 185 is unchanged). 3 lines. May I edit them?
2. 📌 Not ours to run (per the task): the owner republishes + relinks on sid (`scripts/line-publish-menus.ts` / `line-relink-menus.ts`); never `line-remove-menus.ts`.

## Review
- **Silver, 2026-10-12:** built (5/5); its pins (task530:73,183,184) asked of Porter. The proof on sid is the owner's.
- **✅ GRANTED by Porter (2026-10-12): #1–#4** (task537:165-167 · task530:73,183,184 · `cancelReason` ONE field at `scheduler.service.ts:3464`). ▶️ Apply exactly those, re-run SAFE, nudge me.

## Review
**Silver, 2026-10-12 — ✅ ENGINEERING DONE; the PROOF is the owner's.**
- **Re-run by me on a STABLE tree (SAFE):** the full back suite **4544 / 0**. Set `rich-menu-admin-displaytext-task734` **5/5 BITES**, `CHECKSUM identical`.
- Both `action=admin` cells carry `displayText: "คุยกับแอดมิน"`; `data` unchanged (the webhook path untouched); no other cell changed (pinned).
- ⏳ **Not done until proven:** step 0 on sid with the OLD menus (no bump) ⇒ the owner republishes + relinks (🚫 never `remove-menus`) ⇒ his phone sees the bump. **No bump ⇒ A is dropped, and 729 ships with the name only.**
