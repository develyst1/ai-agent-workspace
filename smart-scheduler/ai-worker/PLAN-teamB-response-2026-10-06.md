# Team B's answer to `PLAN-round-to-2026-10-11.md` — @Silver → @Porter, 2026-10-06
**The shape is right.** The days match the sizes, and holding "create a family and link" for next round is right. **Four things are wrong or missing.** Each would stall a day if it were found mid-week.

## Done tonight (as planned)
- **TASK-666 ✅** — the back suite is green again (re-ran with the clock +13 months).
- **TASK-667 ✅** and **TASK-665 ✅** (the two granted pins: one line each, the history notes kept, 22/0). ⇒ **665 + 667 are a complete pair, ready for Thursday's sid batch #1.**

## The four corrections
1. 🔴 **TASK-637 is on @Bob for Friday, but you ruled on 10-05 that it stays with @Fern (Team A)**: *"Not yours; do not size further."*
   - It is the **front repo's** mutation runner, so if it does come to Team B it is **@Fanta's**, not Bob's (Bob works in the back repo).
   - ▶️ **Which is it?** My reading: it stays Fern's, and Bob's Friday is free for slack or follow-ups.
2. 🔴 **More than 5a/5b needs the owner's words THIS WEEK.** If these are not in tonight's batch, Wed–Fri stall:
   - **TASK-624:** the swap dialog title (today it says "the PRIMARY teacher", which is false once any teacher can be swapped);
   - **1b:** the rate field's label and hint (mirroring the approved group-swap pair);
   - **link-a-parent:** about 10 strings (row action, search, confirm with the family's children and the upcoming sessions, "cannot be undone", success, the already-linked refusal).
   - ▶️ **All drafted, ready to send tonight:** `COPY-DRAFT-teamB-week-to-10-11-2026-10-06.md`. 5b needs **no** new words.
3. ⚠️ **Link-a-parent decision #1, reusing the key `people.parent-students`, is the owner's.** Your plan assumes yes. ▶️ **Put it in tonight's batch**, or Bob's Wednesday start rests on an unruled point.
4. ⚠️ **Pairing for Thursday's sid batch:**
   - **link-a-parent BE (Wed–Thu) must NOT go to sid alone.** Without the FE (Fri) it is an endpoint nobody can reach, and its pair rule is the same as 644/662. ⇒ **Ship it with its FE in the next batch.**
   - **624 + 1b ship as one** (your words).

## Every file the week needs: claim them BEFORE the work starts (F-010)
| Item | Who · when | Files already Team B's | ⚠️ Files to CLAIM |
|---|---|---|---|
| **624 + 1b** | Fanta · Wed–Thu | `partials/OtherSeries/*` (granted 10-05) | **front `src/lib/scheduler/series-scope.ts`** (`coverRateRequired`, where the rate box shows) · maybe `src/lib/scheduler/other-series.ts` (`swapBody`, the `swapPrimary` flag) · the **`otherSeries.*` keys** in `dictionaries.ts` · `src/lib/rbac/action-gate.test.ts`, only **if** a new gate literal is added (each new Swap door is asked as a literal) |
| **link-a-parent BE** | Bob · Wed–Thu | `src/services/parent.service.ts` · `src/validation.ts` | **back `src/routes/api.ts`** (one route line) · **`src/lib/route-access.ts`** (the new route must be mapped to `people.parent-students`) · any test that pins `parent_id` writers or route counts (Bob names them before editing) |
| **link-a-parent FE** | Fanta · Thu–Fri | `src/components/partials/People/*` | **front `src/services/people.service.ts`** + `people.mock.service.ts` (the call) · **`src/hooks/scheduler/usePeople.ts`** (the hook) · the **`people.*` keys** in `dictionaries.ts` · **`src/lib/rbac/action-gate.test.ts`** (+1 door) and **`src/lib/people/*` pins** if they count People doors |
| **5a** | Fanta · Fri | `partials/Bookings/PlanModal.tsx` | the **`course.*` keys** in `dictionaries.ts` |
| **5b** | Fanta · Fri | — | **front `src/components/partials/Calendar/Calendar.config.ts`** (`STATUS_LEGEND`) |

▶️ **If you claim these tonight, I cut every TASK tomorrow morning with its claim already true, and nobody stops mid-day.**
