# TASK-624 — FE: **Swap must let you choose WHICH teacher goes out** (REQ-111 item E, front half)
**From @Sober to @Fern.** **Pairs with `TASK-629` (BE).** **Owner: "2 เริ่มได้เลย".** ▶️ **Start it after `TASK-611`; do not split your attention across both.**
🔑 **Khwan's own words, through the owner: *"swap ได้แค่ครูที่เป็น primary ค่ะ ต้องการให้เลือกคนอื่นได้ค่ะ แล้วจะตรงที่ต้องการใช้งานเลยค่ะ"*** — **and she says that alone makes it do what she needs.** ⇒ **A WIDENING of a control you already have. 🚫 Not a new screen, not a new dialog.**

---

## 1. ✅ Your file area — `OtherSeries/*` is yours this batch
**`OtherSeriesModal.tsx` and `OtherSeriesDialogs.tsx`.** 🚫 **Still not yours:** `CalendarContent.tsx` · `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · `lib/scheduler/teacher-scope.ts` · `lib/camp/grid.test.ts` · `partials/Bookings/*`. **Read anything; edit only your list.**

## 2. What is wrong today, in two places
1. **The Swap button is only ever DRAWN beside the primary's name.** **Each extra teacher gets *Remove*, never *Swap*.**
2. **The dialog HARDCODES who leaves** — the body builder is handed the series' primary, and **there is no "from" picker at all.**
⇒ **Both have to go.** ✅ **The server half is @Jason's and it is being widened in the same batch; until his lands, your requests will be refused — that is expected, not a bug to chase.**

## 3. ▶️ What to build
**Render the same Swap control beside EVERY teacher on the row, and send THAT teacher as the one going out.**
🔑 **ONE dialog and ONE body builder.** 🚫 **Do not add a second dialog for "swap an extra", and do not branch the body builder on whether the outgoing teacher is the primary** — **the screen does not need to know, and the moment it does, it holds a second idea of who is on a session.** *The server decides what that teacher's position means; the screen only says who.*
✅ **Everything else stays exactly as it is:** **the scope chooser with NOTHING pre-selected** (🔑 *that was Khwan's EARLIER complaint — a pre-selected "the rest" would reproduce it with one extra click*) · **the date label that says what the date MEANS in the chosen scope** · **the outcome line** · **the cover-rate box and its rules** · **nothing sent until a scope is chosen.**
⚠️ **The "to" picker already excludes everyone on the row. Check it still excludes the right set once the outgoing teacher is a variable** — 🔑 **the person going OUT must not appear in the list of people who could come IN.**

## 4. 📋 The copy — **send me the English; it stops being true the day this ships**
🔴 **The dialog's title today reads "สลับครูหลัก" / "Swap the primary teacher ({name})".** **The moment this ships, that is false on most uses of it.**
▶️ **Draft the English and send it to me. 🚫 Do not ship wording.** ✅ **Copy is mine this batch and the owner sees it before it goes.** 🔑 **Every string through the dictionary, both languages, and COUNTED** — *a bilingual assertion is satisfied by ONE language unless both are counted.*

## 5. ✅ Done means
1. **`bun node_modules/typescript/lib/tsc.js --noEmit` clean · `bun test` clean · `bun run build` clean.** 🔑 **On this repo `tsc` and `build` are the INVENTORY, not the suite.**
2. **A DOM test: the Swap control appears beside EVERY teacher on the row** (🔑 **derived from the row's teachers, not an enumerated list of two**) · **the outgoing teacher is the one the body names** · **the outgoing teacher is absent from the "to" list** · **no scope chosen ⇒ nothing sent.**
3. 🔴 **A test that the PRIMARY swap is unchanged** — same body, same scope rules. *The widening must be invisible to the use that already worked.*
4. **Both languages counted. The English draft with me before any wording is final.**

## 6. 🚫 Not in this task
**The from-here-on rate fix (`TASK-625`, @Jason's — same round, separate change)** · **"Add teacher", which STAYS as it is** (🔑 **a genuine second coach on a session is a real thing the school does — it was simply never the answer to Khwan's question**) · **the four notification kinds (`TASK-614`)** · **item D's grid marker (Team B's).**
