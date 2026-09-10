# TASK-306 — the plan editor's leave notifies nobody, and a setting now controls nothing

**Repo:** `smart-scheduler-back` (+ a small FE half, §3) · **Assignee:** @Jason · **From:** @Sober (2026-09-09)
📌 **No clock.** 🚫 No migration. **Source: your own Question answer on TASK-305 — you named both and wired
neither, correctly.**
🔑 **Two loose ends of ONE mechanism, so one task: the leave notice you just built does not fire from every door,
and the setting that used to gate it now gates nothing.**

---

## §1 🔴 A teacher is told SOMETIMES — and you narrowed it to ONE path, which is the useful part
**Four writes set `SICK_LEAVE`. One notifies.** ✅ **Your own triage, which I am adopting rather than re-doing:**
| path | notifies | verdict |
|---|---|---|
| `:1703` declared at creation | ❌ | ✅ **fine** — the leave predates the course; the teacher has not been told of the class either |
| `:2749` attendance correction (`ATTENDED → SICK_LEAVE`) | ❌ | ✅ **fine** — the class already happened; a notice would be about the past, and its own branch says so |
| `:2810` `updateBookingStatus` `sick-leave` | ✅ | — |
| 🔴 **`:2382` the plan editor's `mark-absence`** | ❌ | 🔴 **THE HOLE** |

🔑 **`:2382` cancels a FUTURE session exactly as `:2810` does** — **an admin using the plan editor is doing the
same thing by a different door.** ⇒ **a coach arriving for a cancelled class, with the notification working.**
📌 ***"It is one path, not three"*** — **your read, and it is why this task is small.**

## §2 What to do — §1
✅ **`:2382` sends the same `LEAVE NOTICE`, built from the same `leavePayload`.**
🔑 **One payload builder, both call sites** — ⚠️ **not a second construction of the same message.** *A coach and
an admin must never read different versions of one leave, and neither must two admins who used different
screens.*
✅ **Non-throwing, exactly as TASK-305 made it:** `enqueueLine` writes a SKIPPED row when a coach has no LINE
link ⇒ **a plan edit must never fail because of a notification.**
⚠️ **`mark-absence` can affect MORE THAN ONE session in a single plan edit.** 🔑 **Say what you decided:** one
message per session, or one per edit? 🚫 **I am not ruling it** — **you can see whether the plan editor batches;
I would rather have your answer than my guess.** 📌 *If it is one per session, say so and assert it — three
notices for three sessions is defensible and a surprise if unstated.*

## §3 🔴 `notify_on_leave` now controls nothing, and the settings screen still offers it
> *"`notify_on_leave` is now UNREAD by any code path. Its spec row still exists (`lib/settings.ts:79`) and the
> settings screen still offers it."*

🔑 **This is the class we have spent the week naming, in its purest form: a CONTROL that does nothing.** ⇒ **worse
than a missing feature, because an admin who sets it believes they have changed something.**
📌 **And the finding underneath it is the one worth keeping:** **the teacher notification was never un-built — it
was `kind: "leave_teacher"` behind `if (notifyOnLeave === "admin_and_teacher")`, with the setting defaulting to
`admin_only`.** ⇒ **on a default install that branch never ran**, which is why the owner reported it twice as
missing. 🔑 ***A feature behind a default-off setting is indistinguishable from a feature nobody wrote.***

**✅ THE RULING: remove the control.** **The owner's `§9` instruction is unconditional — *"เฉพาะแชทครู /
แอดมิน"*** ⇒ **a setting offering a choice the requirement has already made is a control that can only ever be
wrong.**
- **Remove the registry row and the settings-screen field.** 🚫 **Do NOT delete stored rows** — **no migration,
  no data change.** ⚠️ *A stored value nothing reads is inert; a DELETE is irreversible and buys nothing.*
- ⚠️ **Check for other readers before removing it** — **if anything else reads `notify_on_leave`, STOP and tell
  me**; the ruling assumes your *"unread by any code path"*, and that is worth confirming once with a grep
  rather than trusting my paraphrase of it.

## §4 What must not change
- 🚫 The leave MECHANICS — quota, `plannedAtCreation`, the make-up, the ceiling. **This adds a send and removes a
  dead control.**
- 🚫 The three paths §1 rules as fine · the parent's leave confirmation · `§7.1`–`§7.4`'s pinned messages.
- 🚫 No migration, no stored-row deletion, no other setting.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
      📌 *`bunx tsc` is currently broken on this machine (a `typescript-go` lib path); `bunx --package
      typescript@5.6.3 tsc --noEmit` works. **Not your problem to fix — just say which you ran.***
- [ ] 🔑 **A leave marked in the PLAN EDITOR sends the same `LEAVE NOTICE`** — asserted **to both recipients**
- [ ] 🔑 **The message is byte-identical to the one `:2810` sends** — asserted **by comparing the two**, ⚠️ *or
      made unfalsifiable with one builder, which I would prefer and you have done twice already*
- [ ] **A plan edit still succeeds when the coach has no LINE link** — asserted
- [ ] **Multi-session behaviour NAMED and asserted** — whichever you chose
- [ ] **`notify_on_leave` is gone from the registry and the settings screen**, and 🔑 **asserted absent**, so the
      next person to add a control has to mean it
- [ ] ⚠️ **Confirm with a grep that nothing else read it** — and **STOP if anything does**
- [ ] 🔑 **Break it and watch** — restored, suite green before the number
- [ ] 🚫 The three fine paths, the parent's confirmation and `§7.1`–`§7.4` unchanged — asserted

## Question
🔴 **How many other settings are read by NOTHING?** 📌 *`notify_on_leave` became dead today, in front of us, and
we only noticed because you were looking at that exact branch.*
🔑 **Is there a cheap sweep — every key in the registry appears in at least one non-test read?** ⚠️ **You told me
in TASK-297 which sweeps are honest and which only look complete: a settings key is a STRING, so a reader
composing one dynamically would be invisible.** ⇒ **if that is a real risk here, say so and the answer is "it
needs an eye".**
🚫 **Name what you find. Remove nothing else.**

---

## ✅ RESULT 2026-09-09 — @Jason. **1843 pass / 0 fail**, 147 files · 🚫 **35 `.sql` = 35 journal tags.**
📌 Typecheck: `bunx --package typescript@5.6.3 tsc --noEmit` → **0** (the plain `bunx tsc` is the broken one).

- [x] 🔑 **A leave marked in the PLAN EDITOR sends the same `LEAVE NOTICE`** — to both recipients
- [x] 🔑 **Made UNFALSIFIABLE rather than compared:** ONE `sendLeaveNotice`, one `kind: "leave_notice"` in the
      whole service — asserted by count
- [x] **A plan edit still succeeds when the coach has no LINE link** — asserted as the absence of a throw
- [x] **Multi-session behaviour NAMED and asserted** — one message per SESSION
- [x] **`notify_on_leave` gone from the registry and the screen**, asserted absent
- [x] ⚠️ **Grep confirmed nothing else read it** — see below
- [x] 🔑 **Break it and watch** — restored, suite green before this number
- [x] 🚫 The three fine paths, the parent's confirmation and `§7.1`–`§7.4` unchanged — asserted

### §1 ✅ One builder, both doors
`sendLeaveNotice(tx, booking, { size, via })` is now **the only place the message is built**, and both doors call
it. 🔑 **I made your preferred form true rather than asserting the two agree:** there is exactly one
`kind: "leave_notice"` and one `async function sendLeaveNotice(` in the service, both asserted by count — so
there is no second version to keep in step.

**⚠️ Multi-session: ONE message per SESSION, not per edit.** Each `mark-absence` change carries one
`bookingId`, and the notice names a specific class (`Date`, `Time`, `Coach`, `Remark`) — **a single message for
several sessions could not say WHICH.** ⇒ three absences in one edit send three notices. Asserted, and the send
sits inside the `mark-absence` branch so no other change kind fires it.

### §3 ✅ The control is gone — and the grep you asked for
**Nothing outside the registry read it.** The BE hits were the row itself and my own TASK-305 comments; the FE
hits are an i18n label, a help string and a mock row — **labels for a screen that is `Object.keys(SETTINGS)`
(`settings.service.ts:52`)**, so ⇒ **removing the registry row removes the field, and no FE change was needed.**
📌 **The leftover FE label/help/mock entries are orphaned strings in @Fern's repo** — named, not touched.
🚫 No stored row deleted, no migration. **A gravestone comment sits where the row was**, carrying the finding:
*a feature behind a default-off setting is indistinguishable from a feature nobody wrote.*
🔻 `notify-on-leave.test.ts` was **rewritten, not deleted** — it now asserts the removal stays, and its own sweep
strips comments first, **because on the first run my gravestone counted as a reader.**

### 🔴 A consequence I created, and am naming rather than leaving to be found
**TASK-305 replaced the admin's `sick_leave` alert and the gated `leave_teacher` push with one `leave_notice`.**
⇒ **neither kind is enqueued by any non-test code any more.** Their renderers still work and their tests still
pass — **which is exactly the shape that makes dead code look alive.** Asserted so re-wiring either one fails
loudly. 🚫 Not removed: this task says remove nothing else.
⚠️ **And a correction to my own TASK-305 report:** I called `sick_leave` *"the parent's existing leave
confirmation"*. It is not — it was the **admin alert**, which I had just replaced. The parent's confirmation is a
`textReply` in the webhook and was never touched; the assertion was right about the message being unchanged and
wrong about who reads it.

### 🔑 The Question — **a whole-tree sweep IS honest here, and I only know that because my first one lied**
✅ **Every registry key is read**, checked over all of `src` (tests excluded):
`teacher_change_notice_days` · `checkin_early_minutes` · `leave_cutoff_hours_fulltime` ·
`leave_cutoff_hours_freelance` · `line_parent_2fa`.

⚠️ **My FIRST attempt hand-listed the files to search and reported the two `leave_cutoff_hours_*` keys as
UNREAD.** They are read — through `leaveCutoffKey(teacher.type)` in `lib/leave-notice.ts`, a file I had not
listed. ⇒ **the sweep would have told us to delete two live settings**, minutes after we removed a real one.
🔑 **So the honest form of your question has a sharper answer than *"it needs an eye"*:**
- **The mechanism is sound** — every reader names its key as a **string literal**, including the one that looks
  dynamic: `leaveCutoffKey` is a **ternary over two literals**, not a composed string. A whole-tree grep finds it.
- 🔴 **What made it lie was the INPUT, not the technique** — a narrowed file list. **A sweep whose scope is
  hand-written is only as complete as somebody's memory**, which is the same failure as the thing it is looking
  for.
- ⚠️ **The residual risk is a key built by template literal** (`getSetting(\`leave_cutoff_${x}\`)`). **Nothing
  does that today — I checked: zero template-literal `getSetting` calls** — and a grep for that shape is the
  cheap guard if anyone ever starts.

⇒ **It can be asked mechanically, on the condition that the sweep walks the tree rather than a list.** 🚫 Removed
nothing else.

**BALL: @Sober — TASK-306 ready for review. ⛔ Nothing else is on me.**
