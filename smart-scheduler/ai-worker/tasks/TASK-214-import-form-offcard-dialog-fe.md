# TASK-214: Import-course form — off-card size option, quota field, dialog closes (import-form batch) (FE)

- Source: owner (via Porter). 🔴 HIGH. Depends on TASK-213 (the contract). On `develop`.
- Status: ✅ **FE DONE (Sober 2026-08-29) — off-card SAVE blocked on TASK-215 (BE one-liner).** All 4 items built (off-card+quota, editable computed expiry, dialog-closes, Thai error on the field). tsc 0·build ok. Off-card save works once TASK-215 lands.
- Repo: **smart-scheduler-front**.

## Items (FE half of the batch)
1. **Size is the fixed 4/6/10 choice by default**, plus an explicit **"off-card" option** that reveals a **free size
   input + a manual leave-quota field** (ONE extra field — quota — not a max-week field; `MAX_WEEK = size + quota`).
   No more free-number-by-default that sends an off-card size to a 500.
2. **Expiry shows the computed default (from TASK-213) and stays editable** — don't hard-code today+2mo on the client.
3. 🔴 **The dialog closes after a successful save** (it currently doesn't).
4. A rejected size shows the server's **Thai message** inline, not a generic failure.

## DoD
- [ ] Default = 4/6/10; off-card reveals size + quota; the computed expiry shows and is editable.
- [ ] Save closes the dialog; a rejected size shows the Thai reason inline.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green. Rendered → @Tanya.

## Notes
(Fern fills in. The off-card path is one extra field. Dialog-close-on-save is the small one, but it's the one the owner
hit — verify it on the rendered page.)

---

## Implementation Notes (Fern 2026-08-29)
All four items built. **One of them cannot succeed end-to-end until a one-line BE fix — Q1.**

1. **Size is the price card by default.** A `Select` of `4 / 6 / 10` plus an explicit **"อื่น ๆ (นอกการ์ดราคา)"**
   option; choosing it reveals a free size input **and the one extra field the rule needs — the leave quota**. No
   max-week field: `MAX_WEEK = size + quota` is the server's derivation, and a second field here would be a second
   copy of it. Free-number-by-default is gone, which is what sent an unsupported size to a 500.
2. **Expiry shows the server's computed default and stays editable.** `POST /courses/import/preview` seeds it; the
   moment a human touches the date the seeding stops (`expiryTouched`) — TASK-195's rule, honour a deliberate date.
   The form holds **no** copy of the expiry rule, and a preview failure never blocks the form (the save re-validates).
3. **The dialog closes on a successful save.** ⚠️ Worth stating: this **replaces** a deliberate batch-entry behaviour
   — the modal used to stay open and keep teacher/day/time/size for the next family. Closing costs re-entry per
   family during an import sitting. The owner asked for it and it's his call; flagging the trade-off, not resisting it.
4. **A rejected size shows the server's Thai sentence inline**, on the size field itself (`error={sizeProblem}`), not
   a generic failure and not a toast.

### 🔴 Q1 — the off-card path cannot currently save, and it's a BE one-liner
I traced the round trip rather than assuming it worked:
- `importCoursePreview` **accepts** `leaveQuota` (`validation.ts:577`) — so the preview is fine.
- `importCoursePackage` (the **save** schema, `validation.ts:496-506`) does **not** declare it, and the object has no
  `.passthrough()` — **zod strips it**.
- `importCoursePackage` the *service* reads `input.leaveQuota` (`scheduler.service.ts:1182`), so it always sees
  `undefined`.
- `decideImportSize(8)` with no quota returns **`ok: false`** (`import-size.test.ts:27-29`).

⇒ **An off-card import will be refused with "fill in the leave quota" even though the staff member filled it in.** The
FE now sends `leaveQuota`; it is discarded at the validation boundary. Fix = add `leaveQuota` to the
`importCoursePackage` schema (same shape as the preview's). **Not mine to write.**

This is the same class as TASK-170 and TASK-204: a field present on one side and absent from the contract in the
middle, compiling cleanly the whole way.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**
(incl. `keys.test.ts`).
🔴 **Rendered → @Tanya.** Item 3 (dialog closes) is the one the owner actually hit — worth confirming on the page.
And **items 1+2 can only be fully exercised after Q1 lands**: today the off-card save refuses.
