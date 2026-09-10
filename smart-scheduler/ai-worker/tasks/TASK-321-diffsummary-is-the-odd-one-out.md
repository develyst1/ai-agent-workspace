# TASK-321 — `diffSummary` is the odd one out, and TASK-319 is what made it so

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-10)
📌 **Small, and it rides with the batch** — ⚠️ **not because the owner asked, but because we made it.**
🚫 No BE change, no contract change, no migration.
**Source: YOUR OWN Question answer on TASK-319.** 🔑 **You named it, you called it the strongest candidate, and
you said the reason plainly: *"it was defensible an hour ago."***

---

## §1 Why I am acting on this one and none of the other three you named
🔴 **The other three are pre-existing and belong to TASK-294.** **This one is a REGRESSION we introduced today.**
⇒ `PlanModal.tsx:1194` → `plan.diffSummary` — **`{appended} added · {cancelled} removed · ends {end}`** — now
says **`ends`** in the same modal whose header you just changed to **`Last session`**, **and it is the third
instance of a non-date poured into a date slot** (`noLiveEnd` again).
🔑 **A modal that names one fact two ways is exactly what `Ends` was renamed to stop.** ⚠️ **Shipping the
rename WITHOUT this would leave the batch slightly worse at the thing it was supposed to fix.**

## §2 What to do — and you decide the wording, as before
✅ **The line agrees with the header** — same vocabulary, both languages (`จบ {end}` moves too).
✅ **The non-date gets the same structural treatment you gave the header**: 🔑 **`noLiveEnd` must not be able to
enter `{end}`.** 📌 *`noUpcomingSession` may or may not be the right sentence in a preview line — a plan preview
that ends with nothing live is a different statement from a course that has nothing upcoming.* ⚠️ **If they are
the same fact, reuse the key and say so; if not, say what the difference is.**
🚫 **Do NOT touch `noLiveEnd` itself, `noSessions`, or the Thai collision** — 🔑 **that is TASK-294, it is open,
and it is yours; three near-identical strings is a ruling, not a rename.**

## §3 What must not change
- 🚫 `deriveLiveEndDate` · `liveEndDate` · `createPreviewLine`'s `?? liveSessions.at(-1)?.date` (**correct, and
  you already proved it by having an assertion fail on it**).
- 🚫 TASK-319's header and `pausedNoEnd` — **byte-identical**, asserted.
- 🚫 The counts in `diffSummary` · the preview table · no new BE call.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command**
- [ ] **The header and `diffSummary` name the same fact the same way** — asserted, both languages
- [ ] 🔑 **A non-date cannot reach `{end}`** — asserted the way you asserted the header's
- [ ] **§2 answered**: reused key, or a new one with the difference stated
- [ ] 🚫 **TASK-294's three strings untouched** — asserted as an absence, *so this cannot quietly pre-empt a
      ruling that is still open*
- [ ] 🔑 **Break it and watch** — restore verified by READING the line

---

## §4 ✅ IMPLEMENTED — Fern, 2026-09-10. **The last non-date in a date slot.**

```
bunx tsc --noEmit → exit 0
bun test          →  212 pass / 0 fail   (was 201 for this task's own run; +5 here)
bun run build     → ok
```
🚫 No BE change · no contract change · no migration.

### §2 ANSWERED — a NEW key, not `noUpcomingSession` reused, and here is the difference
`plan.diffSummary`: **`… · ends {end}` → `… · last session {end}`** · **`จบ {end}` → `คาบสุดท้าย {end}`**, so
the line and the header name one fact one way.
**New key `plan.diffSummaryNoEnd`** — *"{appended} added · {cancelled} removed · nothing left on the schedule"*
/ *"เพิ่ม {appended} · เอาออก {cancelled} · ไม่เหลือคาบในตาราง"*.

🔑 **You asked whether they are the same fact. They are not, and the difference is TENSE and AGENCY:** the
header reports **what the course IS**; this line reports **what the change the admin is about to confirm WOULD
LEAVE** — and it is read while they can still cancel. *"No upcoming sessions"* in that position would state a
condition as though it already held. ⇒ **its own sentence.**
📌 **Two whole strings rather than one hedged one is the call TASK-287 already made** for
`resumeExpiryMoved`/`resumeExpirySame`, for the same reason: neither has to hedge.

### The structural half
`const lastSession = preview.liveEndDate ? … : null` — **the same treatment the header got in TASK-319.**
⇒ 🔑 **`{end}` can no longer receive anything but a date**, so that class cannot return to this slot. Asserted.

### 🔴 A consequence worth your attention: `noLiveEnd` now has NO renderer at all
It had exactly two callers — the header (TASK-319 removed it) and this line (removed now). **Nothing renders it.**
🚫 **I left the string in place, as §2 instructs** — deleting it would pre-empt **TASK-294**, which is an open
ruling on it, `noSessions`, and their shared Thai string. ⚠️ **But that ruling now has a fact it did not have:
one of the three strings is dead**, which may make it a deletion rather than a rewording.
✅ **The pin in `dialog-labels.test.ts` records all three states** — TASK-293 *"not changed"*, TASK-319 *"stays
because `diffSummary` renders it"*, TASK-321 *"nothing renders it"* — **because that pin's REASON has now gone
stale twice in two days**, which is precisely the class this batch exists for. **A dead string kept ON PURPOSE
with the purpose written down is the opposite of a label outliving its value, not an instance of it.**

### 🔑 Break it and watch — restored, and the restore READ back
Put `t("plan.noLiveEnd")` back into `{end}` ⇒ **two** assertions failed: the §2 one naming the slot, **and the
`noLiveEnd`-has-no-renderer pin** — the second was an unplanned cross-check and it is the more useful of the
two. ✅ Restored; `PlanModal.tsx:1200` read back as `… : null;`. Suite green after.

### Definition of Done
- [x] `bun test` **212 / 0** · `bunx tsc --noEmit` exit 0
- [x] Header and `diffSummary` name the same fact the same way — asserted, both languages
- [x] 🔑 A non-date cannot reach `{end}` — asserted as the header's was
- [x] §2 answered — **new key, with the difference stated**
- [x] 🚫 TASK-294's three strings untouched — asserted as an absence
- [x] 🔑 Break-and-watch — restored, **read back**
