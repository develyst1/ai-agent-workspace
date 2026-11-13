# OWNER'S NEXT BATCH (moved from board.md verbatim, ORDER 67, 2026-11-13)
> PM's file. Board rows that sat under the DECISIONS heading went back to the board's Tasks table.

## 📋 OWNER'S NEXT BATCH — he is assembling it; **nothing here is dispatched until he says so** (opened 2026-09-08)
> *"อยู่ในลิสต์นะ จดไว้ เดี๋ยวจะส่งงานชุดวันนี้ให้ทำให้หมด"* ⇒ **@Porter holds this list. Do NOT route any of it
> to @Sober early** — he sends the batch as one, and a half-sent batch is how build order gets set by accident.

| # | Item | State | Note |
|---|---|---|---|
| 1 | **`TASK-284` — `Remark` does not reach the course-level confirmation message** | TODO, @Jason | 🔑 **he reproduced it himself**; a KNOWN limitation from `TASK-269 §2` that was deliberately not fixed — **his finding overrides that decision** |
| 2 | **The `ON LEAVE` row keeps its OLD time after a re-plan** | ❓ **@Sober still owes the ruling** | on the screen he verified himself; **3rd time this week a leave sat at the edge of a rule** |
| 3 | **The toast header is ENGLISH** — *"Something went wrong"* over a Thai body | not filed | **a Thai admin's first line is in the wrong language, and says less than the line beneath it** |
| 4 | **`TASK-292`** — the client computes a COUNT on a bulk act | TODO, @Fern | **same class as the `9`-vs-`5` we just fixed** |
| 5 | **`TASK-294`** — `ยังไม่มีคาบ` means two OPPOSITE things | TODO, @Fern | *none left* vs *not begun*; **no English-side review can catch it** |
| 6 | **`TASK-297`** — three paths answer without reaching the error handler | TODO, @Jason | 🚫 **no admin can see any of them** |
| 7 | **`REQ-080` — narrow the guard so QA can READ `uat`** | `READY_FOR_SA`, never shipped | 🔴 **@Tanya was blocked out of tonight's `uat` confirmation by this exact gap** — `mint-session.mjs` refuses `uat` BY DESIGN and there is no `uat` entry in the access file |
| 8 | **A READ of `ecosystem.cjs`** — what ELSE is hard-coded there? | @Porter's ask | **not a task**; the LINE credentials cost us days |

### 🔴 DECISIONS, not defects — these are HIS to answer, and no agent may settle them
- **13+ `CANCELLED` rows accumulate per paused course and nothing prunes them.** 🟢 The count correctly excludes them ⇒ **not the old defect.**
- **An OVER-QUOTA leave is locked with no make-up** ⇒ a re-plan lays out one MORE than the pause cancelled, **spending the lock.**
- **The extension ceiling measures from the PURCHASE start date** ⇒ after a long pause, a later make-up can be refused on a course that legitimately moved.
- **`resume/preview`** — the admin reads the moved dates AFTER confirming. **@Sober and @Porter both recommend NOT building it.**


