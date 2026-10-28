# TASK-841 — FE: **REQ-132 each "ใกล้ใช้ครบ" / "ใกล้หมดอายุ" Attention item links to that course (or voucher)** — @Fern, ≈ 0.3 d incl. +10%
**From @Sober, 2026-10-27.** GO by Porter; the owner: *"B"*. Back half = TASK-840 (Jason): the items gain the child's name in their label and `link: { kind: "course" | "voucher", id }`. **Git: on the owner's word only.**

## Do
1. **Attention page** (`AttentionContent.tsx`): an item that carries `link` renders its label as a link.
   - **Items without `link` render exactly as today.**
   - The page-level `CHECK_LINKS` (`attention.open`) is unchanged.
2. **The target: the exact course, opened** (my pick):
   - `link.kind === "course"` ⇒ `/scheduler/bookings?course=<id>`. The Bookings page reads `course` on load and **opens that course's "จัดการแผน" window** (`BookingsContent` already opens it with `setPlanId(id)`).
   - `link.kind === "voucher"` ⇒ the same idea for a voucher, if a voucher detail / panel can be opened by id. If not, `/scheduler/bookings` on the vouchers tab with the search pre-filled by the child's name. **Say which in your report.**
   - **An unknown or ended id:** the page opens normally, with no crash and no error toast (the window simply doesn't open).
   - **Today the Bookings page reads no URL parameters** (my check), so this is the one new read. Keep it to these keys.
3. **No new words.** The label text comes from the server.
4. **Permissions:** the link only navigates; the Bookings page's own gates still apply.

## Tests by value
- An item with `link` (course) renders as a link to `/scheduler/bookings?course=<id>`.
- An item without `link` renders as plain text.
- Bookings with `?course=<id>` opens that course's plan window.
- A bad id opens nothing and doesn't crash.

## Mutations
- The link dropped.
- The wrong id in the URL.
- `?course=` ignored on load.

## Done means
- tests by value + the set (each bite shown);
- tsc 0 · `bun test` · build;
- `unhandled-between-tests: N`;
- `git status` in full.

**Build against Jason's item shape** (his TASK-840 report). **List every pin first.**

---
## FE report — Fern, 2026-10-27 — TASK-841 DONE (front only; nothing committed by me)
**Change:**
- `AttentionContent.tsx`: an item with `link` renders its label as `<Anchor component={Link} href="/scheduler/bookings?course=<id>">` (`?voucher=<id>` for a voucher); items WITHOUT `link` render exactly as before (plain text + hint); `CHECK_LINKS` / `attention.open` untouched. The label is the server's text — **no new word**.
- `types/app/attention`: `AttentionItem.link?: { kind: "course" | "voucher"; id: string } | null` — **built to the shape in the task text: TASK-840's report has not been written into its task file yet, so I could not check Jason's actual item against it.** Please confirm.
- NEW `lib/scheduler/attention-link.ts`: `attentionHref(link)` (id URL-encoded; nothing else in the URL) and `planRequestFromParams(get)` — the Bookings page's ONE URL read, keys `course` / `voucher` only.
- NEW `hooks/scheduler/useOpenPlanFromLink.ts` + `BookingsContent.tsx` (the one new read): the plan is asked for first and the window opens (`setPlanId`) **only when it loads and is the kind the link names**, **once** (closing it never reopens it, even when the plan is re-read with new data). Unknown id / other kind / unloadable ⇒ nothing opens, no toast, no crash. A voucher link also lands on the Vouchers tab. `bookings/page.tsx` wraps the content in `<Suspense>` (`useSearchParams` needs it at build; build is green).
**Voucher answer (asked in the task):** a voucher CAN be opened by id — the plan window is one component for courses and vouchers (`PlanModal` + `GET /entitlements/:id/plan`; the voucher card already calls the same `setPlanId`), so `?voucher=<id>` opens that voucher's own plan window. No search-prefill fallback.
**Pins** (listed to you first): none needed editing — `action-gate.test.ts` (no new `can()` site), `course-lifecycle.test.ts:80`, `duo-subjects.test.ts:54`, `rental-row.test.ts:142`, `t-arg-shape.test.ts:227` all unchanged and green; mutation set `task-658.json` re-run: 17/17 BITE.
**One behaviour you should know:** an ENDED course whose plan loads WILL open (its plan is readable and shows the ended state); the task text said an ended id "doesn't open" — I read that as unknown/unloadable ids. Say if you want ended excluded (it would need the plan's status read; one line).
**Tests by value** (`attention-link-task841.dom.test.tsx`, 10): a course item ⇒ `a[href="/scheduler/bookings?course=c-10"]` with the server's label; a voucher item ⇒ `?voucher=v-5`; an item without `link` ⇒ no anchor, hint intact, and the check's own "open" link still once · id encoding · the URL reader (`course` / `voucher` / nothing / foreign keys ignored / empty) · BookingsContent uses that reader + the hook · the hook: a loading course opens its id once and a plan re-read with NEW data does not reopen it · a voucher opens · an unknown id opens nothing · the other kind opens nothing · no request ⇒ no plan is asked for.
**Mutation set `scripts/mutation/task-841.json`** (alone; no runner before or after; CHECKSUM identical; baseline 10/0): M1 🔴 link dropped · M2 🔴 wrong id in the URL · M3 🔴 `?course=` ignored · M4 voucher under `?course=` · M5 no kind check · M6 reopens (it SURVIVED at first — my "re-render" test did not re-run the effect; I changed it to re-read the plan with new data and it now bites) · M7 🔴 opens before the plan loads · M8 the page stops using the hook — **all 8 BITE.**
**Gates:** tsc 0 · build 0 · `bun test` **1392 pass / 0 fail** (147 files) · `unhandled-between-tests: 0`.
**`git status --short -uall` (front):**
```
 M src/app/(admin)/scheduler/bookings/page.tsx
 M src/components/partials/Attention/AttentionContent.tsx
 M src/components/partials/Bookings/BookingsContent.tsx
 M src/types/app/attention/index.ts
?? scripts/mutation/task-841.json
?? src/components/partials/Attention/attention-link-task841.dom.test.tsx
?? src/hooks/scheduler/useOpenPlanFromLink.ts
?? src/lib/scheduler/attention-link.ts
```
**Not done:** not clicked through in a real browser against Jason's real item (his half is not in my view); the dialog opening relies on `GET /entitlements/:id/plan` answering for any course/voucher id the item carries.

## ⚖️ 2026-10-27 — @Sober → @Fern: your two points
1. **The item shape: CONFIRMED.** Jason's TASK-840 report (now in his file) is `link: { kind: "course" | "voucher", id }`, with `link.id` = the item's id and no `link` on other checks. That's exactly what you built against.
2. **An ended course: keep it opening, as built.** Both checks only ever list LIVE courses (nearly finished = a live course with ≤ 2 left; expiring = not yet expired). An ended one can appear only if it ended between the panel loading and the click, and then opening its plan (which shows "ended") is the honest answer. No change.
- Verifying now on a clean copy.

## ✅ 2026-10-27 — @Sober: TASK-841 VERIFIED → READY with 840 (`DEPLOY-REQ-132-attention-names-and-links-2026-10-27.md`)
- **Clean copy** of front `f9f7f9c` + 8 files: tsc 0 · `bun test` **1,392 / 0** · unhandled 0 · build 0 (the tree unchanged) · sets 841 **8/8** · 658 17/17.
- 🧊 Both trees frozen (back 4 · front 8). **Git: on the owner's word only.**
