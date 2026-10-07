# TASK-698 — after a create, every refusal in the link dialog names BOTH halves — FE, XS
- Source: @Tanya TEST-081 (case C, the faded toast) · **owner-APPROVED TH line, `COPY-REVIEW-2026-09-29.md:504`** (via @Porter, 2026-10-07) · completes TASK-696
- Status: DONE (reviewed by Silver, 2026-10-07) · rides the NEXT deploy with TASK-697
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-07)
- **Claim ✅ (Porter, 2026-10-07):**
  - `partials/People/*` (its tests included);
  - **ONE new key** in `dictionaries.ts` (`people.*`, EN + TH), that key only.
  - Anything else red ⇒ the standing practice: run the full suite, send me the whole list once, and edit nothing outside the claim.

## §0 Why
- In QA's case C (create OK, link refused), the "บันทึกผู้ปกครองแล้ว" toast had **faded** by the time the refusal showed. The only evidence the family was created was the confirm's title.
- An admin who misses it **retries and creates a SECOND family**, silently and permanently.

## What to build
1. **Whenever the family was created IN this dialog** (via `onCreated`), **every** refusal the dialog shows carries this line first, followed by the server's own reason:
   - this covers the **dry run** (`preview.error`) and **the link itself** (`error`): one sentence for both (owner);
   - TH, **verbatim, APPROVED:** **`สร้างครอบครัวเบอร์ {phone} แล้ว แต่ยังผูก {child} ไม่สำเร็จ`**
   - EN, **APPROVED (Porter, 2026-10-07), verbatim, no DRAFT marker:** **`The family with phone {phone} was created, but {child} is not linked yet.`**
2. **`{phone}` is the new family's phone** (always present, and what the admin just typed), never the name.
   - **`{child}` is the child's real name**, the same one the dialog title uses; never "น้อง".
3. **A family picked from search** (not created here) ⇒ the refusal is exactly what it is today, the server's sentence alone (pinned).
4. One key under `people.*` (e.g. `people.linkCreatedButNotLinked`). Keep the server's reason visible and unchanged after the line (same Alert).

## Definition of Done
- [ ] **By-value DOM tests: the point is that the phone AND the child are IN the sentence, not merely that a sentence appeared** (Porter):
  - create (phone `0812345678`) → the link refused ⇒ the Alert contains the exact TH line with **that phone** and **that child's name**, plus the server's reason;
  - create → the **dry run** refused ⇒ the same line, same values;
  - a family picked from SEARCH → a refusal ⇒ the server's sentence only, **no** "สร้างครอบครัว";
  - EN: the line with both values.
- [ ] Mutation set (front form, `--tests` declared):
  - the line dropped after a create (bites);
  - the line shown for a searched family (bites);
  - `{phone}` replaced by the name (bites);
  - `{child}` dropped or replaced by "น้อง" (bites);
  - the dry-run refusal path without the line (bites).
- [ ] `bun test`, `tsc` and `build`, with counts. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen:** force case C again (create a new phone, then a refused link) ⇒ the red box reads *"สร้างครอบครัวเบอร์ {that phone} แล้ว แต่ยังผูก {that child} ไม่สำเร็จ"* + the reason, and it stays until the admin acts.
- **Screen:** a searched family with a refusal ⇒ the reason only.

## Implementation Notes
**Fanta, 2026-10-07.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds my accepted-but-uncommitted TASK-697 files.

**Files (this TASK only):**
- `M lib/i18n/dictionaries.ts`: **ONE new key**, `people.linkCreatedButNotLinked`, EN + TH, nothing else (`git diff -U0`: the key + comments). **Both strings verbatim, no DRAFT marker** (the TH is the owner's, `COPY-REVIEW-2026-09-29.md:504`; the EN is Porter's carried translation, approved as drafted, 10-07):
  - TH `สร้างครอบครัวเบอร์ {phone} แล้ว แต่ยังผูก {child} ไม่สำเร็จ`
  - EN `The family with phone {phone} was created, but {child} is not linked yet.`
  - I wrote the EN marker as an approval note (as on 662/664), then — per your inbox note — did not touch the words.
- `M partials/People/LinkParentDialog.tsx`: a `createdHere` flag. It is set by `onCreated` and cleared where a family is picked from the list: the only two ways into the confirm step. When set, **the same red Alert** shows the line FIRST (`data-link-created-line`), then the server's reason, unchanged. The Alert is the one that already covers the dry run's refusal (`preview.error`) AND the link's (`error`), so **one sentence serves both** (the owner's ruling), with no second code path. `{phone}` is the new family's phone (`parent.phone`, what was just typed), `{child}` is the child's real name (the same `child` the dialog title uses). A searched family renders exactly the server's sentence, as before.
- `?? link-refusal-halves-task698.dom.test.tsx` (7) · `?? link-refusal-halves-task698.mutations.json` (6).
- `M link-parent-create-task696.mutations.json` and `link-parent-task669.mutations.json`: **two and one anchors updated** (see the 🔴 note below). Their mutations and expectations are unchanged.

**Decided and declared (internal; overturn freely):**
1. **One Alert, one sentence for both refusals** rather than two render paths, so the dry-run and link cases cannot drift apart.
2. **No clear in the Cancel handler.** My first version cleared `createdHere` there too; a mutation that removed it SURVIVED, correctly: it was an **equivalent mutant**, because every way into the confirm step already sets or clears the flag. I deleted the redundant line and its comment, and dropped that mutation rather than keep dead code.
3. 🔴 **The by-value tests write both sentences out BY HAND** (not built from the dictionary), with a child whose name is neither "น้อง" nor a nickname and a family name that is not the phone, so a swapped, empty or generic value fails.

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0 · **full `bun test` 1095 pass / 0 fail across 122 files** (was 1088).
- `link-refusal-halves-task698.dom.test.tsx` → **7 pass / 0 fail**, clicked, read as the EXACT text of the red box:
  - **TH, create (phone 0812345678) → the LINK refused:** the box is *exactly* `LINE_TH + server's reason`: the line with THAT phone and THAT child, **not** the family's name, the created half before the reason, and nothing else; `POST /parents` was called once;
  - **TH, create → the DRY RUN refused (the cap):** the same line and values, then the cap sentence; Link stays shut;
  - **EN, create → refused:** the English line with both values;
  - **a family picked from SEARCH:** link refused ⇒ the box is exactly the server's sentence, **no "สร้างครอบครัว"**; dry run refused ⇒ exactly the sentence; and after create → refused → Cancel → pick a searched family → refused, the box is the sentence alone;
  - the two dictionary strings are exactly the approved words, both languages.
- Mutation set `link-refusal-halves-task698`: `bun run mutation:run -- --tests "src/components/partials/People/link-refusal-halves-task698.dom.test.tsx src/components/partials/People/link-parent-create-task696.dom.test.tsx src/components/partials/People/link-parent-task669.dom.test.tsx" --mutations src/components/partials/People/link-refusal-halves-task698.mutations.json`
  ```
  BASELINE 23 pass / 0 fail
  W1 the line dropped after a create ................... BITES 19/4
  W2 the line shown for a SEARCHED family .............. BITES 20/3
  W3 {phone} replaced by the family's NAME ............. BITES 19/4
  W4 {child} dropped ................................... BITES 19/4
  W5 {child} replaced by "น้อง" ........................ BITES 19/4
  W6 the DRY-RUN refusal path without the line ......... BITES 22/1
  CHECKSUM identical
  ```
  (The DoD's five are W1–W6 minus the equivalent one I removed: W1 dropped, W2 searched, W3 phone→name, W4/W5 child dropped/"น้อง", W6 dry-run path.)
- 🔴 **Found while re-running the neighbouring sets:** `ANCHOR MISSING` on 696's V1/V2 and 669's K3, because this TASK rewrote the two `onClick`/`onCreated` lines they anchored on. **That is "not run", not a verdict**, so I updated those anchors (same mutation, new text) and re-ran: **669 10/10, 696 6/6, all BITES, checksum identical.**
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

## Questions
None. Nothing outside the claim turned red (full suite 1095/0), so the standing practice had nothing to list.

## Review

**Silver, 2026-10-07:** EN approved by Porter as drafted. 🔒 Do not "improve" it: "is not linked yet" mirrors the Thai ยัง and tells the admin it is retriable (Porter rejected "could not be linked"). At review, I check that the COPY-REVIEW record exists before closing.

**Silver, 2026-10-07 — ✅ DONE.**
- **ONE key**, `people.linkCreatedButNotLinked`. TH and EN are **verbatim** to `COPY-REVIEW` (both machine-checked), with no DRAFT marker.
- **Re-anchors accepted:** 669 K3 still "a link WITHOUT the confirm" on a search pick; 696 V1/V2 still mutate the created-family path. They are the same claims, re-found after `setCreatedHere` reshaped the text.
- **Re-run by me:** the full front suite **1095 / 0**. Sets (each run with all 5 People test files):
  - 698 **6/6**;
  - 696 **6/6**;
  - 669 **10/10**.
  - No SURVIVED, no missing anchor, `CHECKSUM identical`.
- **Files to commit (698):**
  - `People/LinkParentDialog.tsx`;
  - `link-refusal-halves-task698.dom.test.tsx` + `.mutations.json`;
  - the re-anchored `link-parent-task669.mutations.json` and `link-parent-create-task696.mutations.json`;
  - `lib/i18n/dictionaries.ts`.
