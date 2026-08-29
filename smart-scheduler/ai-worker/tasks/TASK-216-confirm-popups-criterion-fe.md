# TASK-216: Confirm popups wherever a confirmation belongs (REQ-073) (FE)

- Source: REQ-073 (owner: *"popup ทุกที่ที่ควรมีการ confirmation"*). 🟠 MEDIUM, FE-only. **Last uat-gating item.** On
  `develop`.
- Status: ✅ **FE DONE (Sober 2026-08-29)** — one `useConfirm` primitive (dismiss=false) + exactly 5 wirings (verified); 2 already-confirmed left alone; consequence-not-mechanism sentences; do-NOT list grep-clean. tsc 0·build ok·41/0. 🔴 มาเรียน-feel = Tanya. **REQ-073 done → whole uat batch code-complete.**
- Repo: **smart-scheduler-front**.

## The criterion (owner — a rule, not a per-button call). Confirm when the action is ≥1 of:
1. **Hard to undo** — consumes quota, ends/pauses a course, changes the plan, overrides a lock.
2. **Reaches a human** — sends LINE to a teacher or parent.
3. **Moves money** — charges / posts revenue.
**Do NOT confirm** navigation · filtering · the display toggle · opening a form · a note/badge edit · anything a second
click reverses for free (a plain move). A popup on a harmless action teaches staff to dismiss popups — which costs the
ones that matter.

## Enumerated from the router (SA, cross-checked with Porter's list — not taken as complete)
**Missing a confirm today → ADD one:**
| action | UI | why |
|---|---|---|
| **`attend` (มาเรียน)** | booking | consumes a session (1) — **see the CHEAP-dialog rule below** |
| **`confirm`** (single) | booking | messages the teacher (2) |
| **`sick_leave` (ลา/ป่วย)** | booking | consumes leave quota + appends a make-up (1) |
| **`extra-session` (เพิ่มคาบ คิดเงิน)** | course | **charges (3)** |
| **`plan` insert (แทรกคาบชดเชย)** | plan modal | changes the plan (1) |
| **admin unlock (ปลดล็อก)** | course/plan | overrides the leave lock (1) |
| **`bulk-confirm`** (multi-select) | bookings table | messages teachers in bulk (2) — bulk = more, not less |

**Already have a dialog — REUSE the shape, do not invent a second:** cancel course · pause · resume · cancel a
delivered session · cancel a 1HR/voucher (TASK-212) · confirm-whole-course (TASK-202).

## 🔴 The one that needs care — `มาเรียน` gets the CHEAPEST dialog
On 2026-08-23, **15 real sessions went NO_SHOW because staff pressed `confirm` and never pressed `มาเรียน`** — we need
staff to press `มาเรียน` MORE, so its confirm must not tax the click. Make it the **lightest** possible: one line
("มาเรียนคาบนี้?"), **primary button focused, Enter confirms / Esc cancels, NO reason field**, no extra reading. The
heavier dialogs (reason enum, named blast radius) stay for cancel/pause/charge — do not put that weight on `มาเรียน`.
(The owner overruled dropping the `มาเรียน` popup; this is how we honour it without re-creating the NO_SHOW risk.)

## DoD — verify the RENDERED behaviour
- [ ] Each action in the table opens a confirm before acting; each already-dialogged action is unchanged (one shared
      dialog component, not a second vocabulary).
- [ ] `มาเรียน`'s dialog is one line, Enter-confirms/Esc-cancels, no reason field.
- [ ] No confirm on nav/filter/display-toggle/note/badge/plain-move (verify none was added by reflex).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · `keys.test.ts` green, no raw key on any
      new dialog (rendered). Rendered pass → @Tanya.

## Notes
(Fern fills in. One shared confirm primitive wired to the seven actions; `มาเรียน` = the light variant. If a shared
`useConfirm()`/dialog already exists from the cancel/pause work, extend it rather than adding a parallel one.)

---

## Implementation Notes (Fern 2026-08-29)
**One shared primitive + five wirings. Two of your seven already confirm — I did not add a second.**

### 🆕 `components/common/useConfirm.tsx` — one primitive, imperative on purpose
`const ok = await confirm({...}); if (!ok) return;` reads at the call site as the guard it is, so wiring an action
costs one line and nobody is tempted to hand-roll a dialog with its own wording. Esc **and** the backdrop both settle
to `false` — a dismissed confirm must never read as consent. It deliberately offers **no reason field**: actions that
need one already have their own richer dialog, and this is the shape for *"are you sure"*, not *"why"*.

### 🔴 Two of the seven were already confirmed — adding one would have been the harm the task warns about
I checked each before wiring, rather than working from the list:
- **`plan insert`** already goes through `requestChange` → `previewPlanChange` → the **`PlanDiffConfirm` diff** the
  user must apply (TASK-115). That is a *better* confirm than a generic one — it shows what will change. A second
  popup in front of it would be pure friction.
- **admin unlock** already opens its own confirm modal (`pending !== null` in `CoursePackagePanel`).

Your enumeration was from the **router**, which is the right way to be complete about *actions*; these two are covered
at the **UI** layer, which the router can't see. Flagging so the table reads accurately next time, not as a correction.

### Wired (5)
| action | dialog | why this weight |
|---|---|---|
| **`มาเรียน`** | 🔴 **light** — one line, no message, focused primary, **Enter confirms / Esc cancels** | the 2026-08-23 rule: 15 sessions went NO_SHOW because staff never pressed it, so the confirm costs a **keystroke, not a read** |
| `confirm` (single) | names **the teacher** who will be messaged | reaches a human (2) |
| `ลา/ป่วย` | says it **uses a leave and appends a make-up** | hard to undo (1) |
| `เพิ่มคาบ (คิดเงิน)` | says it is **billed on top of the package** | moves money (3) |
| `bulk-confirm` | names **the count** and that each teacher is messaged | bulk = more consequence, so the number belongs in the sentence |

Every sentence states the **consequence, not the mechanism** — what staff have to weigh is what happens after they
press it.

### The do-NOT list, verified rather than assumed
`grep` for `askConfirm({` returns **exactly 5 call sites**, in the three files above. **No** confirm was added to
navigation, filtering, the display toggle, opening a form, a note/badge edit, or a plain move.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · suite **41/0**
(incl. `keys.test.ts`, so every new sentence resolves in both languages).
🔴 **Rendered → @Tanya.** The one to feel rather than read: **`มาเรียน` must still be a two-keystroke action**
(click → Enter). If it feels like a tax, it will re-create the NO_SHOW problem and we should say so before uat.
