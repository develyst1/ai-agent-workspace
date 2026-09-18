# TASK-386 — RBAC Stage 3 (action-level), FE: every action gated by its key, the `Actions` checklist per user from `GET /permissions`, the action-refusal sentence (`REQ-092`, `SPEC-079 §2` Stage 3)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (proposed to @Jason, TASK-385; confirmation + the full key list via me):** `GET /permissions` ⇒ `{ menus: string[], actions: [{ key, area, labelTh, labelEn }] }` (the ONLY source of action names/labels) · `GET /me` gains `actions: string[]` (super admin: all) · `PUT /users/:id/actions { keys }` ⇒ `{ user }` · `UserDTO.actions` · an action refused ⇒ `403 FORBIDDEN "ไม่มีสิทธิ์ทำรายการนี้"` (distinct from the menu sentence).
**Size M–L** (the sweep is the bulk: ~59 action sites). ⛔ Chain stopped. Ships with TASK-385, `sid` only.

---

## §1 ONE gate, everywhere
- `useMe().access` gains `actions`; **`can(action)`** (super admin ⇒ true) beside `mayOpen` — one function; **every mutate control in the app reads it** (buttons, menu items, form submits, the tick menu, the Users page's own actions stay super-admin-gated). Not granted ⇒ the control is **hidden** (not disabled — a disabled button invites a question the user cannot answer; the server refuses anyway). List the sites in the report grouped by area — the count is the deliverable's honesty check against the BE's key list.
- 🚫 No client-side key list — keys come from the BE registry through `useMe`/`GET /permissions`; the FE has a TYPE for the key strings only where it must (the constant used at a site), and a pin that every key used at a site exists in the BE's list (fetch the registry in the test from the BE's exported file? — no cross-repo import; instead pin against a checked-in snapshot of the list that the report states equals the BE's — say how).
- A `403` with the action sentence on a granted page ⇒ show it (the control was visible because the grant was taken away mid-session; `useMe` re-reads on 403 as Stage 2 built).

## §2 The Users page — the `Actions` checklist
- Beside `Menus`: **`Actions`** (a count) ⇒ a dialog grouped by area (the areas = the menus' tails; a group header per menu with its nav label; an action row = the BE's label in `lang`); `Select all` per group and overall ⇒ `PUT /users/:id/actions { keys }`. A super admin row: *all actions*.
- 📌 Convenience, not a rule: ticking an action whose area's menu is NOT granted is allowed (the server will refuse the route by menu first) — show a small hint *"this menu is not granted"* on the group header; do not auto-grant.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] `can()` value-tested; the site list in the report (grouped, counted) · the checklist request shape · the two refusal sentences distinguished
- [ ] Keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Name any control that MUTATES but has no obvious single key in the BE's list (a composite screen that calls two routes) — the shape of a key the registry lacks; build nothing extra.

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-18. **ONE gate, `can(action)`, on every mutate control (68 key literals, 30 files, 44 of the 46 keys — the two unused named); the `Actions` checklist rendered from `GET /permissions`; the three action sentences told apart.**

```
bunx tsc --noEmit → exit 0
bun test          →  411 pass / 0 fail   (403 after TASK-384; +8 — new lib/rbac/action-gate.test.ts)
bun run build     → ok
git status        →  since the TASK-382 commit: 53 modified · 2 new (lib/rbac/{actions.ts,action-gate.test.ts});
                     of those, TASK-384's are 4 code + 8 comment-sweep files; the rest is this task
```
Built against @Jason's CONFIRMED contract (TASK-385, 2350/0). 🚫 No roles · no matrix (Stage 4).

### `§1` — ONE gate, everywhere
- **`lib/rbac/actions.ts`:** `can(me, action)` — a super admin ⇒ every act, else the grant, unknown access ⇒ nothing
  (value-tested; mutation 1 fails). **`useCan()`** in `useMe.ts` is the one door: it reads the same `/me` the nav and
  the route guard read (`access.actions`; the login body seeds `actions` beside `menus`, `/me` is the truth). The
  Stage-1 role reader is **retired**: `DiscountSection` asks `can("action:sales.discount")` and reads no role and
  no session (mutation 10 fails).
- 🚫 **No FE list of action names.** The FE has the key STRINGS at the sites (typed by shape, `` `action:${string}.${string}` ``)
  and, **for the test only**, `ACTION_KEYS_SNAPSHOT` — 46 keys, a checked-in mirror of the BE's `ACTION_KEYS`
  (`lib/permissions.ts`, TASK-385). **How the pin works:** `action-gate.test.ts` walks `src/components` + `src/app`
  for every `"action:…"` literal and refuses one the snapshot does not know (a typo cannot open a control — mutation 3,
  a misspelt key at a site, fails two tests; mutation 2, a key dropped from the snapshot, fails one). **The snapshot
  equals the BE's list key for key, in order — checked on this machine by a script diffing the two files (46 = 46,
  `true`), stated here, and re-checked whenever the BE adds a key: updating the snapshot is a task, not a drift.**
- **Hidden, never disabled** — every site is `can(…) && <control/>` or a ternary that renders a plain read; the walk
  pins that no `disabled={!can(` exists anywhere (mutation 4 fails). Where hiding would leave a hole in a layout the
  read stays: an empty grid cell keeps its dashed border without the `+`; the work-days editor becomes one line
  (*"Work days · Mon–Fri"*); the badge type's on/off Switch becomes the word; the expiry date stays as text.
- **The sweep — 68 key literals in 30 files, by area** (the count is the honesty check; the test pins 68 / 30 and
  that exactly two keys have no site):
  - **calendar (9 keys, 16 literals):** `book` — the empty-cell `+` in BOTH grids, the create form's Save, the ⋯
    Overbook (an overbook is a new booking) · `status` — Attended, Confirm, Sick leave and Cancel-with-reason are ONE
    act (the BE keeps the route one key) — the modal's two buttons, the ⋯ items, the cancel dialog's red button, the
    plan modal's per-session cancel · `booking-edit` — ⋯ Move; a voucher row's edit in the plan modal ·
    `leave-override` — the orange *override* button under the too-late sentence (the sentence still shows without
    it) · `pause` — ⋯ Pause / Resume · `badges` — the badge Selects + Save · `note` — the per-session note in the
    plan editor · `rental` — Add / Mark paid / Remove on the modal's rental row · `rental-sale` — the Bookings page's
    standalone door + `RentalModal`'s Record. 📌 The ⋯ menu itself disappears when it would have no item
    (`menuHasItems`; mutation 6 fails).
  - **bookings (12 keys, 20 literals):** `bulk-confirm` — the header tick, the row ticks and the button, hidden
    together · `course-create` — New course, `CreatePlanFlow`'s Generate, `CreateCourseModal`'s submit ·
    `course-edit` — Unlock / Relock (a course PATCH) · `course-plan` — Insert, a course row's edit and mark-absence
    (both go through the plan) · `course-expiry` — the expiry DATE control on the card + the dialog's Save ·
    `course-extra-session` — Extra · `course-confirm` — Confirm N · `course-drop` — Pause and Resume on the plan +
    the dialog's submit · `course-cancel` — End course + the dialog's confirm · `course-import` / `voucher-import`
    — the Import door per tab; inside, the kind switch offers only the granted kinds and the Save follows the kind
    in force · `voucher-create` — Issue voucher + the dialog's submit.
  - **people (7 of 8 keys, 12 literals):** `parent-create` / `parent-edit` — Add parent, Edit, and the form's Save by
    mode · `parent-students` — Add student (the row) and the student form's Save in create mode · `student-edit` —
    the pencil + the form's Save in edit mode · `student-delete` — the red trash (TASK-365's pin now strips the
    user's own grant before its "no condition on the student" negative) · `parent-suspend` — Suspend / Unsuspend ·
    `parent-line-unlink` — Clear LINE. ⚠️ **`student-create` (`POST /students`) has NO FE caller** — the booking
    form creates through the parent (`POST /parents/:id/students`); named for the owner's list below.
  - **teachers (8 of 9 keys, 12 literals):** `create` — Add teacher + the form's Save · `edit` — ⋯ Edit, ⋯ Change
    type, the form's Save in edit mode · `archive` — ⋯ Archive and the archived list's Reactivate (one key) ·
    `availability` — the group Enable/Disable and each row's Switch · `budget` — Set budget / Top up ·
    `limit-override` — the orange override Switch · `work-days` — the day buttons, presets and Save (read-only line
    without) · `type-order` — the drag handle (`isDragDisabled` too). ⚠️ **`calendar-link` has NO FE caller** (the
    BE placed it by area, ✱).
  - **link-requests (2 keys, 2 literals):** `decide` — Approve + Reject (and the collision Select, which only
    serves them) · `unlink` — the teacher's Unlink.
  - **badges (4 keys, 4 literals):** `type-create` — the add-type card · `type-edit` — the type's Switch ·
    `value-create` — the add-value row · `value-edit` — each value's on/off.
  - **settings (1 key, 1 literal):** `edit` — Edit and Reset (one act).
  - **sales (1 key, 1 literal):** `discount` — `DiscountSection` renders nothing without it, on all five forms.
  - The ⋯ row menu on Teachers disappears when neither `edit` nor `archive` is granted; the Users page's own actions
    stay super-admin-gated (asserted: no action key on it).
- **A `403` on a granted page** — the control was visible because the grant went mid-session: the site shows the
  server's sentence as it already did (`errMsg`/`notify`), and the interceptor's `ss:forbidden` makes `useMe`
  re-read, so the control is gone on the next paint.

### `§2` — the `Actions` checklist
- `UserDTO.actions`; each row gains **`Actions`** — a super admin's row says *"All actions (super admin)"*; every
  other row is a count ⇒ **`ActionsModal`**: `usePermissions()` (`GET /permissions`, cached 5 min, fetched only while
  a dialog is open) ⇒ groups by the registry's `area` field (never by parsing), **each group headed by the menu's own
  nav label** (`NAV_BY_AREA`: `link-requests` → *LINE links*, …; `sales` → one new word, *Sales*), each row **the BE's
  label in `lang`** (`labelTh` / `labelEn`), `Select all` per group and overall, `Select none`. Save ⇒
  **`PUT /users/:id/actions { keys }`**, filtered to the registry in the registry's order (mutation 8 fails; 11 — the
  wrong body — fails). No FE list of labels (mutation 9 — a client label — fails three tests).
- 📌 The convenience: a group whose menu the user cannot open carries a small orange *"menu not granted"* badge;
  ticking is allowed, nothing is auto-granted.

### `§3` — the sentences
- `ACTION_FORBIDDEN_SENTENCE` (`ไม่มีสิทธิ์ทำรายการนี้`), `DISCOUNT_FORBIDDEN_SENTENCE` (`ไม่มีสิทธิ์ให้ส่วนลด`) and
  **a third the contract line did not name — `LEAVE_OVERRIDE_FORBIDDEN_SENTENCE` (`ไม่มีสิทธิ์ยกเว้นกฎแจ้งลาล่วงหน้า`,
  `assertMayOverrideLeave`)** — pinned as four distinct sentences with the menu one, and pinned ABSENT from both
  dictionaries: the FE replaces none of them; every site renders the server's words.
- Copy: `users.*` +8 (46 → 54) — both languages, counted. `rbac.*` unchanged at 4.

### 🔑 Break-and-watch — twelve mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `can()` ignores the grant | **1 fail** |
| 2 | the snapshot drops a key a site uses | **1 fail** |
| 3 | a site uses a key the registry lacks (a typo) | **2 fail** |
| 4 | a site becomes `disabled=` instead of hidden | **1 fail** |
| 5 | the status buttons stop asking | **2 fail** |
| 6 | the ⋯ menu renders with no items | **1 fail** |
| 7 | `useCan` reads the flag instead of `/me` | **1 fail** |
| 8 | the checklist sends the keys as ticked | **1 fail** |
| 9 | the checklist grows a client label | **3 fail** |
| 10 | the discount gate reads a role again | **2 fail** |
| 11 | `PUT /users/:id/actions` sends `{ actions }` | **1 fail** |
| 12 | a form's create key swapped for its edit key | **1 fail** (📌 slipped the first run — a pin on the three create/edit forms added) |
`md5` identical on all nine mutated files. Four earlier pins moved to the keyed shapes, each named in its file:
TASK-374's `) : canAdd && canRental ? (`, TASK-372's `{!rental.paid && canRental && (`, TASK-287's
`{!result && can("action:bookings.course-drop") && (`, TASK-365's negative now strips the user's own grant.

### Definition of Done
- [x] **411 / 0** · `tsc` 0 · build ok
- [x] `can()` value-tested · the site list above (grouped, counted, pinned 68 / 30 / two unused) · `{ keys }` · the sentences distinguished
- [x] Keys counted, both languages
- [x] 🔑 Break-and-watch — twelve, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid`: as the super admin give a new user the *Schedule* menu and ONLY `Book a session` ⇒ as them: the
`+` shows on empty cells, a booking opens with **no** Attended/Confirm and **no** ⋯; add `Set a session's status` ⇒
the two buttons and the ⋯ appear; take it away while they sit on the page ⇒ the next Confirm shows the server's
sentence and the buttons go on the next paint; give `Give a discount` only ⇒ the discount block appears on the
course form. The checklist: the *Sales* group, the orange badge on a group whose menu is not granted, Select all.

## Question — **a control that mutates with no single key** ⚠️ owner's list
None found the way the question is shaped: no screen calls two mutate routes from one control. **The inverse
exists, twice — keys with no control:** `action:people.student-create` (`POST /students` — the FE always creates a
student under a parent, `parent-students`) and `action:teachers.calendar-link` (no FE caller, the BE's ✱). Both sit
on the checklist as ticks that change nothing on any screen today; the owner may want them hidden from the checklist
or the routes retired — a BE/registry call, not built. **One key that is broader than its control:**
`calendar.status` covers Attended, Confirm, Sick leave AND Cancel-with-reason in one tick (the BE kept the route one
key); if the owner wants "may mark attended but not cancel", that is a registry split, named.
