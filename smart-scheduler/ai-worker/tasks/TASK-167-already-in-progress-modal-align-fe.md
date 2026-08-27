# TASK-167: Align the "Already in progress" modal helper-text row (REQ-064 AC-8) (FE)

- Source: SPEC-060 (REQ-064) AC-8 — the misalignment the owner actually pointed at.
- Status: DONE (FE code — SA-reviewed Sober 2026-08-24). Rendered 375 helper-wrap check rides @Tanya.

## Review — PASS ✅ (Sober 2026-08-24)
Reproduced: front tsc **0** · build ok · §3.5 0/0/0/0. `ImportBalanceModal.tsx` — `Group grow align="flex-end"` on **all three** field rows (`:203/248/268`), not just the reported one, so end-aligning the label→description→input wrappers keeps the **inputs** on one line whatever height a helper takes (incl. 375 wrap). Fixes the ROW, never one box — Porters requirement; the comment states the rule so `flex-start` cannot creep back. No reserved slots, no copy. **REQ-064 AC-8 code DONE.** The 1440/768/375 render (esp. narrow-to-375 so a helper wraps) rides @Tanya — headless modal, house practice.
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front**. Small, visual.

## What to build
On the "Already in progress" (import) modal, `Remaining sessions start` and `Time` share a two-column row, but their
inputs aren't on the same line: the left field has a **two-line helper** ("The first session from here on — not the
original start"), the right has none, so the left input is pushed down.

🔴 **Fix the ROW, not one box** (Porter): either the row aligns its **inputs** (not their tops), or **every field in
the row reserves the same helper slot** — so the next field whose helper wraps doesn't re-open this. Nudging one box
re-breaks the moment another helper wraps, and this form is full of helper text.

## Definition of Done
- [ ] `Remaining sessions start` and `Time` inputs sit on the same line, **and stay aligned when a helper text
      wraps** — checked at **1440 / 768 / 375** (REQ-041).
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok · FRONTEND-STANDARD holds · rendered verdict pasted (rides @Tanya
      if the modal won't composite headless).

## Notes / Questions
(Fern fills in. This is AC-8 only — the data defects in REQ-064 are BE, TASK-165/166. Do not touch the import logic.)

---

## Implementation Notes (Fern 2026-08-23)
**`ImportBalanceModal.tsx` — one word, three rows.**

`<Group grow align="flex-start">` → **`align="flex-end"`**. A Mantine `Input.Wrapper` renders label → description →
input, so aligning the row at its **end** puts the input boxes on one line **whatever height the helper text takes**,
including when it wraps at 375. `flex-start` aligned the *tops* of the wrappers, which is why only the field with a
two-line helper (`Remaining sessions start`) sat lower than `Time`.

**Applied to EVERY field row in the form, not just the reported one** — that's the part of Porter's note that mattered.
Of the three rows: one mixes a described field with an undescribed one (the reported bug), one has descriptions on
both (breaks the moment they wrap to different heights), one has neither (breaks the day a helper is added). Nudging
the one box the owner pointed at would have left the other two waiting to reappear. Left a comment at the first row
stating the rule so the next person adding a field doesn't reintroduce `flex-start`.

**Deliberately not done:** no reserved empty helper slots, no per-field height hacks, no new copy. `flex-end` needs
none of them and has no wording implications.

**Evidence:** `bunx tsc --noEmit` **0** · `bun run build` **ok** · FRONTEND-STANDARD §3.5 on the file **0/0/0/0**.
🔴 **The 1440/768/375 check is NOT done** — this is a Mantine modal and it won't composite in this session's headless
pane (same limit as every modal task in this batch). Per the task's own allowance, it **rides @Tanya**. What she
should try specifically: **narrow to 375 so a helper wraps to two lines**, then confirm both inputs still sit on one
line — that's the case the fix exists for, and the case a top-aligned row fails.
