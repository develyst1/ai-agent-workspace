# TASK-539 — the "LINE links" page: see who is linked as admin, and remove one — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size S.** 🔨 **Owner's ruling.** ⏸️ **Needs TASK-538's endpoints** — start when they land; if the shape is not there, stop and tell me rather than deriving it.

## §0 Why
**There is no way to remove admin rights from a LINE account.** 🔴 **The demo phone is stuck as an admin and will receive admin leave notices — other families' children by name — the moment pushes resume on 1 Oct.**
**The owner asked for it where the shop already manages LINE links:** one list, one button, a confirm dialog, **super admin only.**

## §1 Build
- **On the LINE-links page: the accounts linked as ADMIN, each with a Remove button**, behind the action key TASK-538 names. 🔑 **A user without that key sees no button** — not a disabled one. (TASK-518's rule: a control that cannot succeed invites a person to try and then tells them no.)
- **A confirm dialog that says what will happen in the shop's terms:** *this account stops being an admin and stops receiving admin notices.* ⚠️ **It must not say "deleted"** — the person keeps their parent or coach role, and **a dialog that overstates what a button does is how an admin becomes afraid of the button.**
- 📋 **Propose the words** (both languages, marked as a draft, pinned by form) — including **what the list says about an account we cannot name.** 🔑 TASK-538 establishes that **we store bare ids with no display name**: so some rows will have no person behind them. **The page must say that honestly** — *"unknown account"* is fine, **something that looks like a name is not.**
- 🔑 **Proven by a real CLICK, per TASK-532's harness:** **click Remove ⇒ the dialog appears ⇒ confirm ⇒ the request is asserted at the fetch boundary with that account's id**, and **a refusal shows the server's sentence with no success toast.** 🚫 **Render-only is not enough** — this is a control, and it is the reason we built the harness.
- 🚫 **No optimistic update.** The row leaves the list when the server says it has.

## §2 What must not move
🚫 Anything else on that page · the Undo control · the login and menu guards. **And nothing about coach or parent links** — this removes an admin role, nothing else.

## Definition of Done
- [ ] The admin list with a Remove button, **absent without the key** · a confirm dialog that does not overstate (**never "deleted"**) · 📋 the words proposed as a draft, pinned by form, **including the honest label for an unnameable account** · 🔑 **clicked through: Remove ⇒ dialog ⇒ confirm ⇒ the request asserted with that id**, plus a clicked refusal showing the server's sentence and no success · 🚫 no optimistic update · §2 pinned unchanged · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation showing the button without the key, one that renders a fabricated name for an unnameable row, and one that removes the row before the server answers · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): the admin list, the Remove control, clicked end to end · **658 / 0** (was 635 · +23) · tsc 0 · **8 mutations bite** · 🔑 **one §1 correction: there IS no key**

## §1 ⚠️ The one thing in §1 that could not be built as written — and what I did instead
§1 says the button sits *"behind the action key TASK-538 names"* and *"a user without that key sees NO button"*. **TASK-538 deliberately added no key.** Its §1, verbatim: *"An action key is grantable: `hasAction` is true for a super admin or anyone granted the key. So a key would make this power delegable to non-super-admins, i.e. not 'super admin only'"* ⇒ *"No key added: `ACTION_KEYS` stays 60"*, which the board row confirms (**60, counted not taken**).

🔑 **So the honest FE gate is `session.user.isSuperAdmin`, the same pattern the Users and roles pages already use** — and I did **not** invent a 61st key to satisfy the sentence. Inventing one would have been worse than a mismatch: it would have made the power **delegable on the FE** while the server stayed super-admin-only, so a granted non-super-admin would see a button that always 403s — **exactly the "invites a person to try and then tells them no" failure §1 quotes TASK-518 to prevent.**

**The spirit of §1 is kept literally:** not a super admin ⇒ **no panel at all** (`if (!isSuperAdmin) return null;`) — no disabled button, no "you cannot do this" card, **and the list is never even fetched** (`useLineAdmins(isSuperAdmin)`), so the refusal is not something the server has to say.

📌 **Pinned by ABSENCE as well as by value:** `expect(panel).not.toContain("action:")` · `not.toContain("useCan")` · `actions.ts` contains no `line-admin` — so **a later task cannot quietly turn this into a grantable key without a red test.**

## §2 What I built
- **`src/lib/scheduler/line-admins.ts`** — the rules, the only place any of this is decided: `adminRowLabel` (a name when the server gave one, else the `lineAdmins.unknownAccount` key — **whitespace is not a name either**, or a `" "` would paint a row that reads as a blank name) · `afterRemovalKey` · `adminRows` / `notKnownLines` (as sent, junk dropped, nothing invented).
- **`LineAdminsPanel.tsx`** on the LINE-links page, under the teacher links — for the reason the unlink already lives there: everything about a LINE link in one place staff can find. Rows show the name or the honest label, the id tail, and the coach/parent facts when we have them; **the server's three `notKnown` sentences are rendered as sent**, on the page where someone is deciding about those rows.
- **The dialog names what the account KEEPS** (`afterTeacher` / `afterParent` / `afterVisitor`, from the server's menu) and **never says deleted**. 🔑 **An unknown or absent `afterRemoval` falls back to `afterVisitor` — the sentence that promises LEAST**: over-promising kept access is the wrong way to be wrong on a dialog that takes rights away.
- **`menuSettled: false` is SAID, not swallowed:** the rights are gone (TASK-538's order guarantees that), so the notification is a **warning** carrying "LINE would not accept the menu change", not a clean success. A clean success there would hide exactly the half that failed.
- 🚫 **No optimistic update:** `onMutate` / `setQueryData` are absent (pinned), the list is refetched on the server's answer, and **a refusal keeps the row AND the dialog**, with the server's own sentence.
- 📋 **The copy is a DRAFT (both languages), pinned BY FORM** — the dialog title ends in `?`, the three consequences exist, are long enough, and are **distinct** (one sentence reused for all three says nothing), the placeholders the code passes are the ones the copy takes, `unknownAccount` carries no `{`, and 🚫 **the act is never called a delete: EN says "delete" only to deny it ("not deleted"), and Thai `ลบ` may appear ONLY inside `ไม่ใช่การลบ`** — pinned over every Thai value in the block, so a new key cannot smuggle it in.

## §3 🔑 Clicked, not rendered (`line-admins.dom.test.tsx`, TASK-532's harness, 5 tests)
Mounted with the **real react-query hooks** over a faked fetch boundary, so the no-optimistic rule is proven by behaviour and not only by source:
1. **Remove ⇒ the dialog appears ⇒ confirm ⇒ `DELETE /users/line-admins/0f1e2d3c4b5a6978`** — asserted with **that row's id**, exactly once, and **nothing is sent before the confirm**. The unnameable row shows *"Unknown account"*; the other shows *"Also the coach บีม"*.
2. The dialog says **"It keeps its coach access."** on the coach row, contains **"not deleted"**, and contains no "Delete".
3. 🔴 **A refused removal** (`404 NOT_FOUND`, the server's Thai sentence): the sentence appears, **the dialog stays**, **the row is still there**, and **no notification is raised at all** (`expect(notes).toEqual([])` — not one word of success for an act that did not happen), one attempt.
4. `menuSettled: false`: the dialog closes (it DID work) and the notification is the **warning** naming the menu.
5. **Not a super admin: no panel, no button, and `gets` is empty** — the list is never fetched.

## §4 🔑 Break-and-watch — `BASELINE=` (md5), every mutation in `try/finally`, all four files back to baseline
```
BASELINE= line-admins.ts       5a24309aea7dbaa1a11aed7025d18904
          LineAdminsPanel.tsx  5424efb63e0f8af5d7dd409626787fb8
          useUsers.ts          fece4781b58e15fc239215913df5e6f4
          users.service.ts     408c584e7b082ac0cca4a0d951d40234
```
| # | mutation | caught by |
|---|---|---|
| M1 | **the panel renders for a NON super admin** (§1's "no button" mutation) | the source pin **and** the clicked test (a panel exists, and `gets` is non-empty) |
| M2 | **an unnameable row shows a fabricated name** (`name \|\| "LINE user"`) | the rule test **and 3 of the 5 clicked tests** |
| M3 | **the row is removed BEFORE the server answers** (`onMutate` + `setQueryData`) | the absence pin **and** the clicked refusal (the row had gone) |
| M4 | the dialog closes on a refusal too (`setError` then `setTarget(null)`) | the clicked refusal |
| M5 | `menuSettled: false` reported as a clean success | the source pin **and** the clicked warning test |
| M6 | an unknown `afterRemoval` promises kept **coach** access | the rule test + 2 clicked tests |
| M7 | the removal points at `/users/${ref}` (a user DELETE) | my route pin **and** the Users page's own no-delete pin |
| M8 | the list is fetched for everyone (`useLineAdmins(true)`) | the gate pin **and** the clicked non-super-admin test |

All eight bite; **none slipped**; every file restored (md5 re-checked after each `finally`).

## §5 ⚠️ Declared: I changed one pin in an existing test — **narrowed, not loosened**
`src/lib/users/users-page.test.ts` forbade **`api.delete` anywhere in `users.service.ts`**, commented *"no delete route exists"*. TASK-538 put a **second resource** in that service (`/users/line-admins/:ref`), so the pin fired on a legitimate DELETE. I did not delete it or soften it into a regex that lets anything through — I pinned **what it always meant**, literally:
```ts
expect(svc).not.toMatch(/api\.delete<[^>]*>\(`\/users\/\$\{id\}`/);   // no DELETE of a USER
expect([...svc.matchAll(/api\.delete<[^>]*>\(([^)]*)\)/g)].map((m) => m[1]))
  .toEqual(["`/users/line-admins/${ref}`"]);                          // and the ONLY delete this file may hold
```
🔑 **It is now stricter than it was:** the old form would have accepted any *third* DELETE once someone had a reason to relax it; this one names the exhaustive list, so **the next DELETE added to this file is a red test and a decision.** M7 proves both halves still bite.

## §6 📌 Two harness facts the next `.dom.test.tsx` will hit (SYSTEM-FACTS candidates — your call)
- 🔑 **Bun has no auto-cleanup for `@testing-library/react`.** Without `afterEach(cleanup)` **every render LEAKS into the next test**, so a row count or a *"the dialog is gone"* check silently reads the **previous** test's DOM. It cost me a red run whose failure pointed at the wrong test. The Undo file got away with it only because it never counted nodes.
- 🔑 **A Mantine modal's SHELL — and its `title` — stays mounted through a close transition that happy-dom never finishes** ⇒ **a title-based check can never observe a close.** The probe has to be something inside `{target && …}`. Same class as TASK-531's D4: **what is on screen is not what is in state.**
- ⚠️ And a cost worth knowing: **a failing `toBeNull()` on a happy-dom node prints the whole React fiber tree** — one such assertion inside a `waitFor` turned this 2-second file into an **eight-minute** run. Asserting booleans (`querySelectorAll(...).length`) keeps a red run readable. Written into the file.

## §7 Verification
**658 pass / 0 fail across 70 files in 3.2 s** (baseline 635 ⇒ **+23**: 18 rules/wire/copy, 5 clicked) · **`tsc --noEmit`: 0** · §2 untouched: no change to the Undo control, the login/menu guards, or anything about coach or parent links — the only edit to an existing page is the two lines that mount the panel, and the only edit to an existing test is §5's narrowing.

⚠️ **`bun run lint` could not run** — `next lint` is not wired in this repo (it reads its own flag as a directory), and `bunx eslint` pulls ESLint 10, which refuses the repo's legacy `.eslintrc`. **Not a new breakage, and I did not "fix" it by adding config**; tsc is clean. Say the word if you want it as its own task.

🚫 **No deploy request.** **What I have NOT proven** is the same limit I named in TASK-532: CSS, focus order, z-index, a real phone's tap. The panel sits below the teacher links on a page staff already use, and **whether the Remove button is reachable and readable on the owner's phone is Tanya's, not mine.**

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **658 pass / 0 fail across 70 files in 3.32 s** · tsc 0 · **`ACTION_KEYS` still 60** — I checked, because her §1 turns on it.

## 📌 My two tasks disagreed, and she caught it instead of inventing a key
**My §1 said "behind the action key TASK-538 names."** **TASK-538 deliberately named none** — *a key is grantable, so the power becomes delegable* — and **she did not derive one around my sentence.**
🔑 **Her reasoning is the deciding one, and it is my own rule pointed back at me: a 61st key would be WORSE than the mismatch, because a granted non-super-admin would see a button that always 403s** — **the exact failure TASK-518 taught us to avoid, which my own §1 quotes.** ⇒ **the gate is `isSuperAdmin`, the Users/roles pattern**, and **my rule is kept literally: no super admin ⇒ no panel at all, and the list is never even fetched.** ✅ **Pinned by ABSENCE of any key.**
📌 **Two tasks of mine, written a day apart, contained different answers to the same question. She read both and followed the one that was right.**

## ✅ The click proof, and the refusal is the better half
**Remove ⇒ dialog ⇒ confirm ⇒ `DELETE …/<that row's ref>` once, with nothing sent before the confirm** — and 🔑 **a refusal keeps the ROW and the DIALOG, shows the server's sentence, and raises no notification at all.** **Keeping the dialog open is right: the admin is mid-decision, and closing it would make them find the row again to learn what happened.**
✅ **`menuSettled: false` is said as a warning rather than a clean success** — 📌 **that is the FE half of Jason's deliberate choice** (rights off first, menu after): the backend refuses to pretend, and now the screen does not either.
✅ **Unnameable rows say "unknown account", `notKnown` rendered as sent**, and **the dialog names what is KEPT and never "deleted"** — with the Thai `ลบ` pinned to appear only inside *"ไม่ใช่การลบ"*. 🔑 **Pinning a word to the phrase that negates it is a neat way to keep a promise about copy.**

## ✅ The pin she narrowed, declared and stricter
The Users page's *"no `api.delete` in this file"* became **"no DELETE of a USER, plus the exhaustive list of DELETEs allowed"** — **stricter than before, with both halves proven to bite.** **A pin narrowed to what it always meant, rather than widened to accommodate a new line.**

## 📌 Her two harness facts — taken into SYSTEM-FACTS
1. **Bun has no auto-cleanup between tests: renders leak into the next test, and the failure names the WRONG one.**
2. **A Mantine modal's shell and title survive a close transition happy-dom never finishes** ⇒ **a title can never prove a close**; probe inside the conditional instead.
🔑 **Both are the kind of thing that costs the next person an afternoon and is invisible in a diff.** ⚠️ And the standing limit is restated honestly: **CSS, focus, z-index and a phone's tap are still outside any of this.**
📌 `bun run lint` is not wired in this repo — **noted, not new, and she did not add config to make a number look green.** I am not asking for it today.
