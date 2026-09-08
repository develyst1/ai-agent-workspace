# TASK-298 — the expiry warning arrives AFTER the save, and `REQ-085 §11.3` requires it BEFORE

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
📌 **No clock, blocks nothing.** 🚫 **No migration.** 🚫 No FE change *(that half comes after this route exists)*.
🔑 **`§11.2` asked for an admin-editable expiry. It has existed since `REQ-082` / TASK-265. Read §1 before you
plan anything — this task is one word wide: BEFORE.**

---

## §1 🔑 What already exists — do not rebuild any of it
| | |
|---|---|
| `PATCH /courses/:id/expiry` | writes the admin's date · **`updateCourseExpiry`**, `scheduler.service.ts:3688` |
| `EditExpiryDialog.tsx` | the FE dialog, **wired at `CoursePackagePanel.tsx:336`** |
| `expiryImpact` | `lib/course-expiry-impact.ts` — **PURE, and takes the sessions rather than fetching them** |
| `ExpiryWarningAlert` | renders `warn` / `outside` / `outsideCount`, **computing nothing** |

✅ **@Porter's DoD — *"it must NAME the sessions it cuts; a count is not enough"* — is ALREADY MET.**
`ExpiryWarning.outside` is a **list**, and the alert renders it as one (`contract.ts:241`, *"AC-4 asks for the
list, not a count"*). 🚫 **Nothing to add there.**

## §2 🔴 The one real gap, and it is a timing gap
`EditExpiryDialog`'s own comment states it plainly:
> *"the warning only exists after the save: `PATCH /courses/:id/expiry` writes the new date and returns what
> that left outside it. So this asks, saves, and then shows what happened."*

**`REQ-085 §11.3`, ratified by the owner:** **an earlier-than-derived expiry is ALLOWED, but the system must
SAY WHAT IT CUTS OFF *before* saving.** ⇒ 🔴 **today it says it afterwards.**
🔑 **@Porter's reason is the acceptance criterion, not the rule:** ***"DEF-4 was an expiry preceding the
course's own last session, and it reached the owner because NOTHING SAID SO. The defect was never that the date
was wrong — it was that the date was SILENT."***
⚠️ **A warning after the write is not silence — but it is the admin learning what they did, not deciding it.**
📌 **This is `SYSTEM-FACTS`' *"this product commits and then shows"* — the exact pattern @Porter has forbidden
for `REQ-086`'s editor. His `§11.3` ruling is the fix for a live instance of it.**

## §3 What to build — and it is small because the thinking is done
✅ **A read-only preview: "if I set this expiry, what falls outside?"** — **`expiryImpact` already answers it,
purely.** ⇒ **load the course's rows, call it, return the same `ExpiryWarning` the PATCH returns.** 🚫 **Write
nothing.**
🔑 **Same shape as `POST /courses/:id/cancel/preview` (TASK-291)** — **the server owns the answer, and the
dialog asks before the admin acts rather than counting rows itself.**
- 🔑 **The response must be the SAME `ExpiryWarning` shape the PATCH returns.** ⚠️ **Two shapes for one question
  is two answers that can disagree** — and this file's own header says three copies of one answer is *"this
  project's most frequent defect"*.
- 🚫 **Do NOT change `expiryImpact`, `EXPIRY_SETTLED_STATUSES`, or what the PATCH returns.** **The PATCH keeps
  its warning** — an admin who edits by some other path must still be told.
- 🚫 **Not a gate.** **`REQ-082` AC-4 is *warn, and still save*, and `§11.3` says the same:** ***"Not a refusal.
  The admin may still do it; they may not do it BLIND."*** ⇒ **this route refuses nothing and returns no
  `problem`.**

## §4 What must not change
- 🚫 `expiryImpact` and `EXPIRY_SETTLED_STATUSES` · the PATCH's behaviour, response and status codes
- 🚫 The derived expiry (**TASK-282 — it is what killed DEF-4**) · `resumeCourse` · no migration · no FE change

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **The preview returns the SAME `ExpiryWarning` the PATCH returns for the same date** — asserted **by
      comparing the two**, not by reading them
- [ ] 🔑 **It WRITES NOTHING** — asserted: the course's `expiryDate` and its rows are **unchanged after the
      call**. ⚠️ **This is the assertion that matters most; every other property is cosmetic beside it**
- [ ] **An earlier date names the sessions it cuts** — the LIST, not just the count
- [ ] **A later date returns `warn: false`** — 📌 *the owner sets a later expiry freely, so the quiet case is a
      real case, not an edge one*
- [ ] 🔑 **Break it and watch** — and **restore it, with the suite green before you report a number**
- [ ] 🚫 The PATCH byte-identical · `expiryImpact` untouched — asserted

## Question
📌 *`expiryImpact` was built pure so that the resume could ask about sessions **that do not exist yet**. That
foresight is why this task is a route and not a feature.*
🔑 **Which OTHER acts in this product commit before they show?** — **you have `/cancel/preview` and now this;
the resume has one; `ImportBalanceModal` may.** ⚠️ **I am not asking you to build any of them.** **Name the acts
where an admin learns what they did rather than deciding it** — 🔴 **because `REQ-086` hands the customer an
editor, and that list is the argument for what its preview has to cover.**
