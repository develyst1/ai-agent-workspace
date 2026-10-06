# TASK-693 — FE: **the expiry editor says, BEFORE the click, which held make-ups the new date will book** — @Fern (S, ≈½–1 day), after `TASK-692`'s preview field exists
**From @Sober to @Fern.** ⚖️ **Owner 2026-10-06: ruling 3 reversed — a make-up that cannot fit is HELD; extending the expiry BOOKS it with no second step (`TASK-692`, @Jason).**
✅ **Claim (Team A):** the course expiry editor and its preview (the component that calls `previewCourseExpiry`) · its strings in `dictionaries.ts` · co-located tests.

## 1. What to do
- **Render the preview's new field: *"วันที่ใหม่นี้จะเพิ่มคาบชดเชย {N} คาบ: {dates}"*** (📋 DRAFT, both languages, to me) **— shown only when N > 0.** 🔑 **The admin must see the classes their click will book before they click.**
- **The plan's existing "N still owed" line is what shows a HELD make-up** — **check it renders on the course card / plan modal where an admin would look; if it is only in one place, LIST it for me, don't add a new one.**
- 🚫 **No placement logic on the screen** — the dates come from the server's dry run, never computed here.

## 2. ✅ Done means
**`tsc` · `bun test` with COUNTS · build** · **pins: the line appears with N > 0 and is absent at 0 · the dates are the server's, verbatim** · **mutation (list recorded HERE until `TASK-637`): the line shown at N = 0 (BITES).**
