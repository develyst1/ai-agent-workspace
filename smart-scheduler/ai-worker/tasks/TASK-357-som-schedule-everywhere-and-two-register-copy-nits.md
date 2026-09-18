# TASK-357 — `SOM SCHEDULE` everywhere in the frontoffice + the two `§10` copy defects from the owner's phone

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-15)
**Source:** `REQ-089 §0 item 0` (customer, verbatim) + @Porter's two copy defects from the `sid` screenshots.
**Size S.** ⛔ **Chain stopped: this task, nothing beside it.** 🚫 **Item 6 (dashboard colours) is the owner's own FE team — never touch.**

---

## §1 `SOM SCHEDULE` — every place a human reads the app's name
Owner's spelling: **`SOM SCHEDULE`** (ruled 09-14). The sites I found — *a count is a place to look, not a finding; you walk the build*:
`src/app/layout.tsx:19` (root title) · `src/app/login/page.tsx:46` · `AdminLayout.config.ts:43` (`APP_NAME`) · `Header.tsx:52` (fallback) · `dictionaries.ts:261` and `:1558` (`appName`, both languages). **The page-level `metadata` on `/register` and `/checkin` become REDUNDANT once the root says it — remove them and their "root stays Smart Scheduler" comments; TASK-356's test flips: every route reads `SOM SCHEDULE`.**
❓ **`<meta description>` (`layout.tsx:20`, the English tagline):** your own finding — a LINE preview shows it. 🚫 Leave the words; **replace the product name only if it appears in it** (it does not today). Not our line to write.
🚫 Filenames, package name, repo, `NEXT_PUBLIC_*`, storage keys (`ss.lang.*`), and code identifiers stay — the customer said *"ชื่อ app ทุกส่วนใน frontoffice"*: what is READ, not what is stored.

## §2 The Unlink button truncates on a real phone
Owner's screenshot: `Unlink this family's LINE conn` — cut, no ellipsis, no wrap, 360-px phone. **Both fixes: shorten AND let it wrap** (a Thai label can be longer than you think). EN ≤ ~24 chars — e.g. `Unlink this family's LINE`; TH your equivalent, same MEANING (the whole family, every account — the writer's consequence, TASK-354). Still PLACEHOLDER for @Porter's words; the size limit is the finding.

## §3 `1 children`
`alreadyLinkedTo` EN: `{n} child` / `{n} children` — pick by `n === 1`. TH unchanged (no plural). 🚫 No pluralisation library; one ternary in the one place.

## Definition of Done
- [ ] Suite passes, **count** · tsc clean · build ok — 🔑 **built HTML: EVERY prerendered route's `<title>` is `SOM SCHEDULE`; `grep -r "Smart Scheduler" src` = zero outside tests/comments that record history**
- [ ] §2: label fits 360 px in BOTH languages — say how you checked (a width assertion or the mobile viewport)
- [ ] §3: `1 child`, `2 children`, TH untouched — asserted
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ answer to the OWNER'S LIST
❓ Does anything a parent reads come from the BACKEND with the old name (a LINE message header, the ICS calendar name, an email)? **Name, do not fix** — that is @Jason's repo.

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-15. **`SOM SCHEDULE` in every place the frontoffice reads the name; the two copy defects; nothing stored renamed.**

```
bunx tsc --noEmit → exit 0
bun test          →  330 pass / 0 fail   (was 327; +3 — the title test flipped, three new cases)
bun run build     → ok — 16 of 16 prerendered routes read <title>SOM SCHEDULE</title>; the only other titles are
                    Next's own _not-found / _global-error
git status        →  9 modified · 0 new
grep -r "Smart Scheduler" src  → ZERO outside test files (whose comments record the history); the built HTML of
                    /login and /scheduler/people: zero
```
🚫 Item 6 (colours) untouched · filenames, `package.json`, `NEXT_PUBLIC_*`, `ss.lang.*`, identifiers keep their names
— asserted (`package.json` has no `SOM SCHEDULE`; `"ss.lang.register"` still there).

### `§1` — the six sites, and the two redundant titles gone
| site | now |
|---|---|
| `layout.tsx:19` root `title` | `SOM SCHEDULE` — the one place the document title comes from |
| `login/page.tsx:46` | `<Title>SOM SCHEDULE</Title>` |
| `AdminLayout.config.ts` `APP_NAME` (the sidebar) | `SOM SCHEDULE` |
| `Header.tsx:52` fallback | `SOM SCHEDULE` |
| `dictionaries.ts` `brand.appName` ×2 | `SOM SCHEDULE` both languages |
| `/register`, `/checkin` page-level `metadata` | **removed**, with their "root stays Smart Scheduler" comments replaced by one line saying why |
🔑 **Asserted two ways:** (a) a walk of every non-test `.ts/.tsx` under `src`, comments stripped, finds the old name
in **zero** files, and the six sites are pinned positively; (b) **TASK-356's test FLIPPED, not deleted** — it was
*"exactly these two pages set a title, the root stays Smart Scheduler"*; it is now *"EVERY route's title is
`SOM SCHEDULE`, from the root; NO page sets its own"* (the walk of `page.tsx` files is kept, its expected set is
now empty), with the three-task history in the comment above it. ✅ The build confirms 16/16.
❓ **`<meta description>`** — left word for word (the product name does not appear in it); asserted unchanged.

### `§2` — the Unlink label: shorter AND wrapping
- EN **`Unlink this family's LINE`** (25) · TH **`ปลด LINE ของครอบครัวนี้`** (22) — still PLACEHOLDER, still the
  writer's meaning (`family` / `ครอบครัว` asserted present).
- **How I checked 360 px:** by derivation, pinned in the test — 360 − page `p-4` (2×16) − Paper `p="xl"` (2×32) =
  264 px for the button; minus its padding (2×18), the icon (16) and the gap (8) ⇒ **~204 px for the label at the
  14 px button font ≈ 7 px/char ⇒ ~29 chars is the cliff**; the old label was 35 and cut at `…LINE conn`. The pin is
  **≤ 26 both languages** (margin), and it is a length bound, not the bytes. ⚠️ Not a browser measurement — I cannot
  open the page — so the second fix is the safety net:
- **Both red buttons wrap** (`WRAP_LABEL`: `label.whiteSpace: normal`, `root.height: auto`, min-height kept) — a label
  @Porter later makes longer folds to a second line instead of being cut. Asserted on both buttons; mutations 4 and 5.

### `§3` — `1 child`
`alreadyLinkedToOne` (EN `(1 child)`) beside `alreadyLinkedTo` (`({n} children)`); **one ternary, in the one place**
(`childCount === 1`, asserted to occur exactly once on the page). TH: the same sentence under both keys — no plural,
key parity — asserted byte-equal and unchanged. 📌 *Named, not touched: `createdCount` still says `child(ren)` — the
TASK-348 placeholder, not on the owner's screenshot.*

### 🔑 Break-and-watch — six mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | root title back to `Smart Scheduler` | **2 fail** |
| 2 | a page-level `metadata` on `/checkin` again | **1 fail** |
| 3 | the header fallback reads the old name | **1 fail** |
| 4 | the 35-char Unlink label back | **1 fail** |
| 5 | the wrap removed from the confirm button | **1 fail** |
| 6 | `(1 children)` | **1 fail** |
`md5sum` identical on all five mutated files; suite green after.

### Definition of Done
- [x] **330 / 0** · `tsc` 0 · build ok — 🔑 **16/16 prerendered `<title>`s are `SOM SCHEDULE`; `grep` = zero outside tests**
- [x] §2: fits 360 px both languages — a derived LENGTH bound (≤ 26) + the buttons wrap; how it was checked stated
- [x] §3: `1 child`, `2 children`, TH untouched — asserted
- [x] 🔑 Break-and-watch — six, one call, checksum

### ⚠️ Not seen on a screen
The wrapped red button on a real 360-px phone (two lines, centred, the icon beside the first). The length bound is
arithmetic; the owner's next screenshot is the measurement.

## Question — **does anything a parent reads come from the BACKEND with the old name?** ⚠️ owner's list — @Jason's repo, name only
Grepped `smart-scheduler-back/src` for `Smart Scheduler` / `smart-scheduler`:
1. 🔻 **The ICS calendar feed** (`lib/ics.ts:153,156`): `PRODID:-//Smart Scheduler//Teacher Schedule//EN` and the
   fallback `X-WR-CALNAME: Smart Scheduler`. **But it is the TEACHERS' feed** (`routes/calendar.ts`, REQ-017), and
   the route passes its own name — `ตารางสอน <nickname>` — so the fallback never shows; only `PRODID` carries the old
   name, and calendar apps do not display `PRODID`. **No parent ever subscribes to it.** Cosmetic, one line, Jason's.
2. ✅ **LINE messages** — no message text, header or `altText` carries the product name; the rich menus are named
   `smart-scheduler-parent-th` etc. — **internal LINE API names**, never rendered to a parent (`chatBarText` is
   `Menu` / `เมนู`).
3. ✅ **No email** — nothing in the BE sends one.
4. ✅ `openapi/document.ts` `Smart Scheduler API` — developers only. `ops-client` / `sale-items`
   `external_source = 'smart-scheduler'` — a STORED discriminator shared with the backoffice DB — must NOT change.
**So: nothing a parent reads comes from the BE with the old name; one cosmetic `PRODID` on the teachers' feed.**
🚫 Named, nothing touched.
