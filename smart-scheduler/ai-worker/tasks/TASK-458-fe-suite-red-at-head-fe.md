# TASK-458 — 🔴 the FE suite is RED at HEAD (4 failures, not from REQ-105): the `users` copy-count pins (62 vs 63) and the §13.3 course-card pin — find out WHY each one moved, then move the pin with a reason or restore the behaviour — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-24) · **Size S.** Blocks `sid` for the REQ-105 slice.

## §0 What I measured, so you do not have to
With every uncommitted change stashed, HEAD alone is **556 pass / 12 fail**. With the REQ-105 work in place it is **568 / 4** — your slice adds 17 passing and no failure. The 4 that remain:
1. `§3 — the sentences, and the copy > copy: users +8 (54 × 2)` · 2. `menu-guard > keys counted in both languages` · 3. `§2 — the Users page > copy` — all three pin `users` at **62** keys; the dictionary actually has **63**, in BOTH languages (so whatever was added was added properly, only the pins did not move).
4. `§3 — the forms > the course card (§13.3): the DEFAULT coach rate…` — the card was restructured in `510e2e7` ("a details box and bottom-aligned actions") and `c8e9639` ("render the name line as a div").

## §1 The work — and the order matters
- **First find out WHICH key is the 63rd and why it exists.** If a change added it deliberately, the three pins move to 63 **each with the reason in the comment** (they already carry the history of every earlier move — keep that shape). If it is a stray — a duplicate, a key nothing renders — it comes OUT and the pins stay at 62. 🚫 Do not "fix" a count pin by changing the number until you can say what the key is for: a count pin that is edited to match reality every time it fires is a pin that has stopped working.
- **Then the course card.** Say whether the §13.3 rule still HOLDS in the restructured card (the default coach rate edits `PATCH /courses/:id { classRateMinor }` only when changed, never null, no Clear; the DUO tag stays DUO-only). If it holds and only the test's reach into the DOM broke, re-pin it on what a user can see — **never by loosening what it asserts**. If the behaviour itself was lost in the restructure, restore it: that rule is the owner's from REQ-095 §13.3.
- Report the suite as **N pass / 0 fail** — that is the point of the task.
- 🚫 No new features, no copy changes beyond the stray if there is one.

## Definition of Done
- [ ] Each of the 4 explained in one line (what moved, and whether the pin or the behaviour was wrong) · suite **N / 0** · tsc · build ok · the pins carry their reasons · 🔑 Break-and-watch with `BASELINE=` on anything you re-pin · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-24. **The suite is GREEN: 572 / 0. Four pins moved, each with what moved and why; no behaviour changed.**

```
bunx tsc --noEmit → exit 0
bun test          →  572 pass / 0 fail
bun run build     → ok
git status        →  4 test files touched · 0 source files
```
🚫 No deploy asked.

### The four, one line each
1–3. **The `users` count pins (62 → 63) — the pin was wrong, the dictionary is right.** The 63rd key is **`moreActions`**,
added in **`897b29a`** *("fold row actions into a menu")* as the `aria-label` of the row's ⋯ menu — rendered at
`UsersContent.tsx:295`, present in **both** languages, and a fourth pin (`roles.test.ts`) had already been moved to 63 by
that commit's author; these three were missed. So: a real key that earns its place ⇒ the three move to **63**, each
naming the key and the commit. **And one of them now asserts the key is RENDERED** — a pure count can be satisfied by a
key nothing uses, which is how a stray would have slipped through this very check.
4. **The §13.3 course-card pin — the pin's REACH was wrong; the RULE holds.** Verified in the restructured card:
`rateChange` still gates the PATCH (only when changed), `onSave` still receives a number and never null, there is still
no Clear, the pencil is still behind `bookings.course-edit` (absent when read-only, not disabled), no rate still renders
**`—`** and never ฿0, and the DUO tag is still DUO-only. What broke: `510e2e7` moved the line into the card's details box,
so the label and the value are two spans and the old `toContain("Default coach rate 500 ฿ / session")` over raw HTML
could not see them. Re-pinned on **what a user sees** (tags stripped) plus the `data-duo-rate` attribute and the edit
door's presence/absence — stricter than before, not looser.

### 📌 A pin I found WEAK while proving the rule
*"Never null"* was pinned only as a source literal (`not.toMatch(/classRateMinor: null/)`). My mutation handed `null` to
`onSave` through a cast and **the suite stayed green** — so the pin is now on the CALL as well: exactly one `await
onSave(`, taking `change.classRateMinor`, and never `onSave(null`. Mutation 4 bites now.

### 🔎 Found, not changed
**`course.defaultRateLine` ("Default coach rate {baht} ฿ / session") has no reader any more** — the restructure split it
into `course.defaultRate` + `course.rateValue`. It is still counted by the duo copy test, so deleting it is a copy
decision with a pin attached, and this TASK says no copy changes beyond a stray. Yours to rule on; one line either way.

### 🔑 Break-and-watch — eight, `try/finally`, checksum, **`BASELINE=0` on a green suite**
| # | mutation | result |
|---|---|---|
| 1 | a 64th `users` key appears | **4 fail** |
| 2 | the 63rd key is taken away | **5 fail** |
| 3 | the 63rd key stops being rendered | **1 fail** |
| 4 | the default rate can be CLEARED (`null` through a cast) | **1 fail** — 📌 this is the pin that was weak; it bites now |
| 5 | the rate PATCHes even when unchanged | **1 fail** |
| 6 | the edit door shows without the key | **1 fail** |
| 7 | no rate set renders ฿0 instead of a dash | **1 fail** |
| 8 | the DUO tag leaks onto every course | **1 fail** |
`md5` identical on the four mutated files (`dictionaries.ts` · `DuoRateLine.tsx` · `CoursePackagePanel.tsx` · `UsersContent.tsx`).

### Definition of Done
- [x] Each of the 4 explained (3 = the pin was wrong and why the key exists · 1 = the pin's reach was wrong, the rule holds)
- [x] **572 / 0** · `tsc` 0 · build ok · the pins carry their reasons
- [x] 🔑 Break-and-watch with `BASELINE=0`, `finally`, checksum

### ⚠️ Not seen on a screen
Nothing changed on any screen — this task moved test pins only. For @Tanya, the two behaviours the pins now guard are
worth one look each on `sid`: the users row's ⋯ menu (its label is the 63rd key) and a course card's **Default coach
rate** — pencil visible only with `bookings.course-edit`, a course with no rate reads `—` (never ฿0), and saving the
same number again sends nothing.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24). **The FE suite is GREEN: 572 / 0**, tsc 0, build ok, **0 source files touched** — re-run by me. I also confirmed `course.defaultRateLine` has no reader outside the dictionary.
She did the task the right way round, and three things are worth keeping:
1. **She named the 63rd key before touching a number** — `moreActions`, added in `897b29a` as the ⋯ menu's `aria-label`, present in both languages and actually rendered. So the pins moved to 63 **with the reason and the commit in the comment**, which is what keeps a count pin readable in a year.
2. 🔑 **One of those pins now asserts the key is RENDERED, not just counted.** A pure count is satisfied by a key nothing uses — which is exactly how a stray would slip past the check meant to catch strays. That is the better pin and it came out of doing the work properly.
3. 🔴 **She found a weak pin of ours and fixed it:** *"the course rate is never null"* was pinned on a source literal, so a `null` reaching `onSave` through a cast left the suite green. It is pinned on the CALL now and the mutation bites. The §13.3 RULE itself was never broken — only the test's reach into the DOM, after the card's restructure — and she re-pinned it on **what a user can see**, stricter rather than looser, which is the only acceptable direction when a pin breaks.
**Ruling on her find:** `course.defaultRateLine` is dead — the split replaced it with `defaultRate` + `rateValue` — and it is still copy-counted, so it is one line in the dictionary plus the counts. **Delete it in the next FE task you take**, with the count pins moved and the reason named; not worth a task of its own, and not worth leaving to rot either.
