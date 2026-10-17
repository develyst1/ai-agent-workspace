# TASK-726 — "Link LINE" from the web (header) · the Users page LINE column + Unlink · names on the old panel — FE, S–M (≈ 1–1½ d)
- Source: as TASK-725 · `SIZING-admin-line-link-to-web-user-2026-10-07.md`
- Status: ✅ DONE (Silver, 2026-10-11) · committed `8943993` + 7 files of approval-marker comments to commit · copy owner-approved (COPY-REVIEW:599)
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-11) · ships WITH TASK-725.
- **Claim:**
  - ✅ **Granted (Porter):** the Users page (`partials/Users/*`) · the old panel (`partials/LinkRequests/LineAdminsPanel.tsx` + its test).
  - ✅ **Also GRANTED (Porter, 2026-10-11):**
    - `layout/AdminLayout/Header/Header.tsx` + a new `LinkLineModal.tsx` beside `ChangePasswordModal.tsx`;
    - the me/users services + hooks for the new calls;
    - the new `people`/`users` dictionary keys (after approval).
  - Reds outside ⇒ the standing practice.

## What to build
1. **Header user menu → «ผูก LINE»** (beside Change password; same pattern as `ChangePasswordModal`).
   - The dialog asks the server for a code (`POST /me/line-link-code`) and shows it big, with the instruction and the expiry, plus **«ขอรหัสใหม่»**.
   - When linked, it shows the linked state.
   - 🔴 **A coach account (`/me` → `user.teacherId` set) does NOT see «ผูก LINE» at all** (Silver, after Bob's contract). The server refuses it anyway (`403 LINE_LINK_NOT_FOR_COACH`), so hiding it keeps that refusal screen-unreachable. Pinned.
   - 🚫 The code is never logged and never stored beyond the dialog's state.
2. **Users page:** a **LINE** column (Linked / Not linked) from `lineLinked` + **«ยกเลิกการผูก LINE»** with its confirm (super admin only, as the page is).
   - Copy the existing "ครู: …" line-under-the-name pattern if it reads better; declare it.
3. **Old panel:** linked accounts by **name**; legacy ones marked "linked with the old code (name unknown)". Remove still works.
4. 🚫 **No raw LINE id anywhere on screen.**

## Definition of Done
- [ ] **Clicked DOM tests:**
  - the header item opens the dialog; it posts once and shows the code + expiry; «ขอรหัสใหม่» posts again;
  - the linked state; **a coach account has NO «ผูก LINE» item** (pinned: it keeps the server's coach refusal unreachable);
  - the Users column shows Linked / Not linked; Unlink → confirm → `DELETE /users/:id/line-link`, and the row says Not linked;
  - the panel shows names, and the old link is marked;
  - no LINE id is rendered (pinned).
- [ ] Mutation set (front form, `--tests` declared):
  - Unlink without the confirm (bites);
  - a raw id shown (bites);
  - the code requested on render instead of on open (bites).
- [ ] tsc · full `bun test` with counts · build. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- As TASK-725, on screen: the header «ผูก LINE» → the code → (owner's phone) linked → the Users page says ผูกแล้ว → Unlink → ยังไม่ผูก.

## The contract (Bob, TASK-725 §"THE CONTRACT": read it there; summary)
- `POST /api/me/line-link-code` ⇒ `{ code, expiresAt, expiresInSeconds: 600 }`. The code is 8 chars, may be SHOWN grouped (`K7M2-QX9P`), and is returned only once.
- `GET /api/me` ⇒ `user.lineLinked` · `GET /api/users` ⇒ each `lineLinked` (never the LINE id).
- `DELETE /api/users/:id/line-link` ⇒ Unlink.
- `GET /api/users/line-admins` ⇒ entries gain `kind: "linked"|"legacy"`, `userId`, `displayName`, `username`, `disabled`. `DELETE …/line-admins/:ref` works for both kinds.
- Re-linking with a fresh code REPLACES the earlier LINE account (say so nowhere new; the linked state is enough).

## Implementation Notes
**Fanta, 2026-10-11.** Repo `smart-scheduler-front`. Nothing committed. Built on Bob's contract INCLUDING 🔻 contract change #1 (`lineLinked` is read from `GET /me/line-link`, not `/me`).

**Files (this TASK only):**
- `?? layout/AdminLayout/Header/LinkLineModal.tsx`: the dialog. On OPEN it first reads `GET /me/line-link`; **only if not linked** does it `POST /me/line-link-code` (once). It shows the code grouped (`K7M2-QX9P`), the instruction and "expires in {minutes}" (minutes from the server's `expiresInSeconds`), and «Get a new code» posts again. Linked ⇒ the linked state, no code minted by itself. While a code is on screen it re-asks `/me/line-link` every 3 s (until expiry) so "linked" appears by itself once the code is typed in LINE. The code lives only in the dialog's state: the mutation is `reset()` after reading, closing clears it, never logged, never stored.
- `M layout/AdminLayout/Header/Header.tsx`: the menu item «Link LINE» (`canLinkLine = !!me && !me.teacherId`), so **a coach account never sees it**. `roleName` line left exactly as it was (the roles.test.ts:145 pin).
- `M partials/Users/UsersContent.tsx`: a **LINE** column (Linked / Not linked from `user.lineLinked`) + «Unlink LINE» in the ⋯ menu, **only on a linked row**, behind the confirm (`useConfirm`, the drafted sentence), then `DELETE /users/:id/line-link`. No optimistic flip, no success toast (no word for one: the row is the answer); a refusal is the server's sentence.
- `M partials/LinkRequests/LineAdminsPanel.tsx`: a linked row is named by its web user (display name + username); a legacy row keeps the old label and gains the mark. Remove is unchanged and works for both.
- `M services/me.service.ts` · `me.mock.service.ts` · `users.service.ts` · `users.mock.service.ts` · `hooks/scheduler/useMe.ts` · `useUsers.ts` (new calls + hooks). `?? lib/users/line-link.ts` (types of the code, `groupCode`, `expiryMinutes`, `linkedName`, `isLegacyEntry`).
- `M lib/i18n/dictionaries.ts`: **12 keys × EN/TH** (6 `header`, 6 `users`), each block under a `📋 DRAFT wording` marker naming `COPY-DRAFT-admin-line-link-teamB-2026-10-11.md`. **Strings are the draft verbatim, none "improved".**
- **Granted, outside the claim, edited exactly as listed:** `types/api/contract.ts` (`lineLinked: boolean` on `UserDTO` ONLY; `MeResponse` untouched, taken back out after the contract change) · `lib/scheduler/line-admins.ts` (types only: `kind`, `userId`, `displayName`, `username`, `disabled` on `LineAdminRow`) · pins #1 `action-gate.test.ts` (the inventory +6) · #2/#2b `menu-guard.test.ts` (header 11→17 with the six named inline; users 63→69) · #3 `roles.test.ts` (63→69) · #4 + #5 `users-page.test.ts` (63→69; the DELETE list gains `/users/${id}/line-link`). #6 option (b): the pin `line-admins.test.ts:51` is **unchanged**.
- Tests: `link-line-task726.dom.test.tsx` (8) · `users-line-task726.dom.test.tsx` (7) · `line-admins-linked-task726.dom.test.tsx` (5) · set `link-line-task726.mutations.json` (15).

**Decided and declared (internal; overturn freely):**
1. **A hidden 7th red came from the grant itself:** adding `lineLinked` inside `MeResponse["user"]` broke `action-gate.test.ts:314` (a source pin on that very line). Not needed any more after the contract change, but noted: that line is pinned in two tests, so any later field on `MeResponse` must go before `isSuperAdmin` or move the pins.
2. **Linked state of an account that is already linked:** the dialog opens on it and mints nothing; «Get a new code» is still offered (to link a different LINE account; the server replaces the earlier one, and I say so nowhere, as you asked).
3. **The 3 s re-ask** is mine (the TASK only said "when linked it shows the linked state"). It is bounded by the code's own expiry and stops on close or on linked. Remove it if you prefer a manual refresh; one line.
4. **No success toast after Unlink**, because the draft has no word for one.
5. **Disabled linked users** are shown in the panel like any other linked row; I added no "disabled" word (the existing `users.statusDisabled` is on the Users page).
6. **The legacy mark shows on every `kind: "legacy"` row** including one the panel can already name by coach ("Also the coach …"); the mark says the WEB user's name is unknown, which is true of every legacy row. A row with no `kind` (an older server) gets no mark.

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0 · **full `bun test` 1152 pass / 0 fail across 129 files** (was 1118).
- Clicked tests, by value (the draft's words are written out by hand in the tests):
  - **header:** nothing requested on render (no code POST, no `/me/line-link` read); the item opens the dialog, **one** POST, the code shown grouped with "Expires in 10 minutes", «Get a new code» posts again with a new code; TH words; 🔴 **a coach account (`teacherId` set) has NO item and nothing is ever requested**; already-linked ⇒ linked state and **zero** POSTs; the link happening while the dialog is open ⇒ the linked state replaces the code; the code is not in the console, local/session storage, nor the page after close; and reopening shows **no old code** while the new request is pending;
  - **Users page:** the LINE header; Linked / Not linked cells (EN + TH); Unlink only on a linked row; Unlink ⇒ the confirm shows the drafted sentence with the person's name **and nothing is sent** ⇒ confirm ⇒ `DELETE /users/u-bee/line-link` once ⇒ the row says Not linked; cancel sends nothing; a refusal is the server's sentence and the row stays Linked; no LINE id on the page though the payload carries one;
  - **old panel:** linked row named by web user (+ username), no "Unknown account", no mark; both legacy rows marked; TH mark; Remove on a linked row ⇒ `DELETE /users/line-admins/<ref>`; no raw id.
- Mutation set `bun run mutation:run -- --tests "src/components/layout/AdminLayout/Header/link-line-task726.dom.test.tsx src/components/partials/Users/users-line-task726.dom.test.tsx src/components/partials/LinkRequests/line-admins-linked-task726.dom.test.tsx" --mutations src/components/layout/AdminLayout/Header/link-line-task726.mutations.json` → **15/15 BITES, CHECKSUM identical**:
  - your three: Unlink without the confirm (U1) · a raw id shown (U2 users page, P1 panel) · the code requested on render (H1);
  - mine: a coach offered the item (H2) · no re-read / linked never replaces the code (H3, H4) · code logged (H5) · code stored (H6) · code kept after close (H7, **first SURVIVED** and fixed by the "no old code on reopen" test) · mint without reading the link (H8) · Unlink offered on a not-linked row (U3) · column reversed (U4) · legacy mark on a linked row (P2) · linked not named (P3).
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

**For QA / the owner, NOT VERIFIED by eye:** the dialog's look (the code's size and spacing), and that the 3 s re-ask feels right on a real phone round trip. The words stay DRAFT: the 13 lines (12 keys + the hint in the draft file) go to the owner; **the counts must not move again** unless he changes a key (then re-run the five pins).

## Questions
None open. The six pins were asked once and granted; nothing else is red.
**Fanta, 2026-10-11 — the standing practice: the FULL suite run first, every red outside the claim listed ONCE, the later `expect`s read against the source, NOTHING edited outside the claim. Everything else is built and my own tests are in progress.**
Full suite with the feature built (before any test of mine): **1126 pass / 6 fail** (it was 7 until I put the Header line back, see below). All six are exact-count or exact-text pins on files outside the claim. The new keys are the ones the draft file lists (6 `users` + 6 `header`, both languages); I put them where the claim said ("the new `people`/`users` dictionary keys"), so the counts moving is expected, and I am asking for the pin lines.

| # | pin (outside the claim) | red because | the edit I need (one line each, no claim changes) |
|---|---|---|---|
| 1 | `lib/rbac/action-gate.test.ts:425` (`USERS_KEY_INVENTORY`, defined at :219) | the `users` key list is exact | add 6 keys, sorted: `colLine` · `lineLegacyMark` · `lineLinked` · `lineNotLinked` · `unlinkLine` · `unlinkLineConfirm` |
| 2 | `lib/rbac/menu-guard.test.ts:197` `both("header", 11)` | 6 header keys added | 11 → 17 (the six: `linkLine`, `linkLineTitle`, `linkLineInstruction`, `linkLineExpires`, `linkLineNewCode`, `linkLineLinked`) |
| 2b | 🔴 **hidden behind #2**, same `it`, `:198` `both("users", 63)` | 6 users keys added | 63 → 69 |
| 3 | `lib/rbac/roles.test.ts:204` | the users count | 63 → 69 |
| 4 | `lib/users/users-page.test.ts:137` | the users count (the line after it, `:138`, pins `moreActions` and is unaffected) | 63 → 69 |
| 5 | `lib/users/users-page.test.ts:100` | the ONLY `api.delete` the service may hold is named; Unlink adds `DELETE /users/:id/line-link` | the list becomes `["`/users/line-admins/${ref}`", "`/users/${id}/line-link`"]`. Lines :98 and :99 (no DELETE of a user) still hold and are untouched. |
| 6 | `lib/scheduler/line-admins.test.ts:51` | pins the literal `api.get<LineAdminsResponse>("/users/line-admins")`; the entries now carry `kind` / `displayName` / `username` | **Option (b), recommended:** a grant to add those optional fields to `LineAdminRow` in `lib/scheduler/line-admins.ts` (types only). Then the pin line stays AS IS and my `lib/users/line-link.ts` loses its duplicate row type. **Option (a):** edit the pin's type name to `LineAdminsResult`. Your call. |

- Avoided, not asked: `lib/rbac/roles.test.ts:145` pins `const roleName = useMe().me?.roleName ?? null;` in `Header.tsx`. My first cut rewrote that line; I put it back untouched and read `me` on its own line instead. Nothing to grant.
- Also noted, not red: `types/api/contract.ts` (Team A's) is where `lineLinked` belongs on `UserDTO` and `MeResponse["user"]`. I did NOT touch it: `lineLinkedOf()` in `lib/users/line-link.ts` reads the field (`=== true`) until you grant that file or say leave it.
- Nothing else in the suite is red. The `change-start-date.dom.test.tsx` window dump in the log is an existing test printing a node (green).

## Review
- **Silver, 2026-10-11:** the list is exemplary, including the hidden 2b and putting `Header.tsx:145`'s pinned line back instead of asking. All 6 + the `contract.ts` types asked of Porter in ONE request. I recommend #6 (b) and named header keys on `:197`. ⛔ Edit none until I write GO.
- **✅ GRANTED by @Porter (2026-10-11): pins #1–#6 exactly as listed**, with the names (#1 the inventory · #2 the SIX header names inline on `:197` · #2b/#3/#4 citing #1's inventory · #5 by value).
  - **#6 = option (b):** `lib/scheduler/line-admins.ts`, **types only** (the optional fields on `LineAdminRow`); the pin `:51` stays AS IS.
  - **Plus `types/api/contract.ts`:** ONLY the additive `lineLinked: boolean` on `UserDTO` and `MeResponse["user"]`, nothing else. Then **drop the `lineLinkedOf()` workaround** and read the typed field.
  - ▶️ **GO.** Full suite after, with counts. 📌 Porter: when the owner approves the 13 lines the counts must NOT move again; if he changes a key, re-run.

- **🔻 CONTRACT CHANGE (Bob, accepted by Silver 2026-10-11):** `lineLinked` is **NOT** on `GET /api/me` any more. It is **`GET /api/me/line-link` → `{ lineLinked: boolean }`**.
  - The dialog calls it when it opens, and again after the admin says they typed the code. `GET /api/users` still carries `lineLinked` per user.
  - ⇒ **`contract.ts` narrows:** add `lineLinked` to `UserDTO` ONLY. 🚫 **Do NOT touch `MeResponse`.** The small `{ lineLinked }` response type lives in your own service file.
  - If you already added it to `MeResponse`, take it back out.

## Review
**Silver, 2026-10-11 — ✅ ENGINEERING ACCEPTED (words DRAFT until approved).**
- **Re-run by me:**
  - the full front suite **1152 / 0**;
  - set `link-line-task726` **15/15 BITES**, `CHECKSUM identical`;
  - the 12 keys × 2 languages machine-checked **verbatim** against the copy draft.
- **Scope:** every file is inside the claim or a grant. `contract.ts` = `lineLinked` on `UserDTO` ONLY.
- **All 6 decisions accepted:**
  - the 3 s re-ask, bounded by the code's expiry, is fine;
  - no Unlink toast (no approved word);
  - ⭐ the H7 survivor caught and fixed;
  - ⭐ the 7th red the grant itself caused, noted for whoever adds to `MeResponse` next.
- 👁️ **For QA, not seen by eye:** the dialog's look (the code's size) and the re-ask on a real phone round trip.
- 📌 **When the owner approves the copy:** if he changes a KEY, re-run the five pins; if only words change, swap them and drop the 12 DRAFT markers.

- **✅ OWNER-APPROVED (2026-10-11), all 12 lines as drafted: `COPY-REVIEW-2026-09-29.md:599`.** Front committed as **`8943993`**.
  - ▶️ **Flip the 12 `📋 DRAFT wording` markers** to `✅ APPROVED by the owner 2026-10-11 — COPY-REVIEW-2026-09-29.md:599`. Comments only; no string or key changes, so the five pins stay as they are.
  - `git diff` = comment lines only (show it); full suite with counts.

## Follow-up done (Fanta, 2026-10-11) — the DRAFT markers flipped
- All 12 keys' markers (4 blocks in `dictionaries.ts`: header EN/TH, users EN/TH) now read `✅ APPROVED by the owner 2026-10-11 — COPY-REVIEW-2026-09-29.md:599`, plus the 7 other places that said DRAFT (the dialog, the Users page, the panel, the three test headers). Nothing says DRAFT now except the source file's own name.
- `git diff` since `8943993`: 15 lines in, 15 out, **every one a comment** (the filter for non-comment lines prints 0). No string or key moved, so the five pins stay as they are.
- tsc 0 · full `bun test` **1152 pass / 0 fail across 129 files** · build 0. Nothing committed.
- **✅ Silver, 2026-10-11 — the flip verified (read-only, under the FREEZE):** 7 files, **15/15 lines, every one a comment** (the markers also sat in the component and test files; 0 non-comment lines). Fanta's suite is 1152/0. **TASK-726 is DONE.** To commit: those 7 files (comments only).
