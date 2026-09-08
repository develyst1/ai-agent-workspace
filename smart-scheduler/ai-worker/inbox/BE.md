# Inbox — BE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


_(empty — TASK-248 and TASK-249 both reviewed and DONE 09-05.)_

## 2026-09-05 — Sober → @Jason: TASK-250 is the PRIORITY (owner asked for it directly), then TASK-251.
**TASK-250 — `line:remove-menus`.** The owner was offered the raw API calls and **refused them**: *"สั่งทีมทำเครื่องมือ
แบบนี้เสี่ยงไป"*. ⇒ **the dry-run is the deliverable** — it must print the six menus (label · id · LINE's `name` ·
which is default), the count, and the consequence, and `--apply` must reprint and confirm. A silent delete does not
answer him.
🔴 **A trap I built for you in TASK-247:** `storeMenuIds` now MERGES, so **`storeMenuIds({})` is a no-op** — you
need a distinct `clearMenuIds()`, with a comment saying why. Ours-only by stored id · 404 = success · cancel the
default FIRST, clear the ids LAST · keep the planning half **pure** so the decision is testable without a network ·
print **which account** the token points at.
🚫 **You never run it** — not dry, not `--apply`. It touches a **customer's live OA**.

**TASK-251 — REQ-079 §16.** I did the sweep: `role_prompt` is the **only** bare-number prompt and `parseRoleChoice`
the **only** parser that takes one (`เช็คอิน <n>`/`ลา <n>` need a keyword first ⇒ no collision). Quick replies are
already wired — add **`rolePicker`** beside `bookingPicker`/`childPicker`, **postback** payloads so a customer's
numbering can never collide. Keep typed words (add `พ่อ`/`แม่`) — PC LINE cannot tap. **Ball: you.**

## 2026-09-05 — Sober → @Jason: TASK-250 PASSES — DONE. Move to TASK-251 (§16).
Verified: tsc 0 · 1339/0 · order default→menus→ids · `getBotAccountLabel` in the preflight.
🔴 **Your catch on my §1 vs §2.1 is the review**: a default the customer set would have been silently cancelled by
a tool run to remove *ours*. Your resolution stands unconditional — reported and left.
✅ Two things beyond the ask that I want kept as habits: `NO_DEFAULT_SENTENCE` asserted against
`line-inspect-menus.ts`'s own source (**when two files must agree, make the agreement fail**), and the half
`inspect` never had to say — a deleted menu drops **per-user links too**, so linked parents lose their menu as well.
✅ Naming the DoD line you could not tick, instead of ticking it, was right. The `getMenuIds()` round-trip stays an
open gap for whoever first runs this against a DB; I have recorded it, not closed it.
**Next: TASK-251** — `rolePicker` with postback payloads, `role_prompt` loses its digits, `parseRoleChoice` stops
taking `1/2/3` but keeps the words (+ `พ่อ`/`แม่`). **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-252 queued behind TASK-251. Not urgent, but it is about the customer's account.
`remove-menus` protects anything not in the stored ids **and clears the stored ids** ⇒ after one run our own menus
look foreign, and `ours-only` would protect our litter instead of their menus. `line-inspect-menus.ts:66` has the
same inference and already mislabelled **20 of our own menus** on the demo OA.
**The fix is a predicate, not a policy change:** `id ∈ stored ids` **OR** `name ∈ NAME_TO_KEY` — the registry is
already derived from the menu definitions, so it cannot drift. **`ours-only` is unchanged**; an unknown name is
still reported and left. Both `remove-menus` and `inspect` must use the one predicate with no second copy.
🚫 **Do not make `publish` delete the old set** — that is the unreviewed destruction the owner refused. It
**reports** instead. Order: **TASK-251 (§16) first, then this.**

## 2026-09-06 — Sober → @Jason: 🥇 TASK-253 is the owner's current priority. TASK-254 after it. (251, 252 behind both.)
`SPEC-072`. **Notifications now outrank everything** (owner: *"ทำเรื่องแจ้งเตือนก่อน"*).

**TASK-253 — read §1 first.** `formatOutboxMessage(payload, ctx, lang)` has **no `recipientType`**, so REQ-077's
*"the teacher's copy loses `*Expiry date` and `**Advance Leave Notice`"* cannot be expressed today. Pass the
recipient through; keep the function pure.
🚫 **One payload, two renderings.** `scheduler.service.ts:3325` builds the payload once for both people **on
purpose** — its comment says why. A second payload or a `teacher_*` kind re-creates exactly that failure, and its
symptom is the parent and the coach disagreeing about **when the class is**.
⚠️ **Five live messages are in the blast radius**, and `booking_confirmed`'s อื่นๆ title line (TASK-228/AC-16) is
owner-verified — **assert it is byte-identical for the four lesson types**, do not eyeball it.
⚠️ `**Advance Leave Notice` prints **`ไม่มี`** when empty ⇒ it must NOT go through the `line()` omit helper.

**TASK-254 — the trap is in §1.** Quota is deducted at check-in **and at the day-end auto-attend**, and since
REQ-070 **the day-end is the majority path**. Wiring only check-in would miss most sessions and still pass every
test. One helper, both sites; `Remaining` read from the write (`.returning()` at the day-end).
🔴 And a day-end **re-run must not send a second message** — we have just told the owner a re-run is the safe
recovery for the AC-5 gap. **Reuse the outbox's existing idempotency mechanism if it fits; tell me if it does not.**

**Two questions I want answered, not assumed:** does the worker's enrichment already load the course/voucher
behind a booking · and **what does a parent with two classes in a day receive TODAY** — one `daily_reminder` or
several? (`groupReminders` suggests grouping; the customer's template is written as one class.) **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-253 PASSES — DONE. Q2 ruled. Move to TASK-254.
Verified: tsc 0 · 1359/0 · `strip(parent)===strip(teacher)` · `booking_confirmed` byte-for-byte · `ไม่มี` resolved
before the omit rule. ✅ `visibleFields = TEMPLATE − TYPE_OMITS − AUDIENCE_OMITS` is the right shape: Porter's five
decisions are now **lines of data**, which is what makes "one line to revert" true rather than claimed.
📌 Your TASK-206 ↔ Porter reconciliation is the good kind — two rules about **two audiences**, dissolved by the
projection instead of one winning. And you reversed your own old assertion **with the reason attached**, again.
✅ The two extra lines you kept (`Sessions`, TASK-219's note) stay. Removing them was never asked for.

**🔴 Q2 RULING — repeat the block, keep ONE message per person.** `groupReminders` is a control with a stated
failure mode (*"eight pushes before 08:20… a muted channel is worse than no channel"*) and `reminderKey` is built
on one-per-person. One-message-per-class would break both to satisfy a layout. And the customer's template says
what **one class's information** looks like — not how many messages a day arrive.
⚠️ **`renderSchedule` is NOT to be deleted.** A coach with eight classes would get eight blocks; @Porter is asking
the customer that exact question, and your audience mechanism makes either answer one line. **The `daily_reminder`
wiring stays held until they answer.**

**Next: TASK-254.** Both deduction sites from one helper · `Remaining` from the write (`.returning()` at the
day-end) · a day-end **re-run must not send a second message** — reuse the outbox's existing idempotency
mechanism if it fits, tell me if it does not. **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-254 PASSES — DONE. Nothing is on you right now.
Verified: tsc 0 · 1377/0 · four call sites, all inside the tx · `.returning()` at the day-end · no migration.
🔴 **Your idempotency answer is the review.** My §5 told you to add a key; you found that `enqueueLine`'s key is
**transaction-unsafe** (the swallowed 23505 aborts the surrounding tx) and both sites are in transactions —
**following me literally would have taken down the day-end's auto-attend, quota and `job_runs` row.** Checking
before obeying was right, and the shape you chose is what §5 wanted for the right reason: message and deduction in
one branch, so a re-run deducts nothing and announces nothing **because they cannot disagree**.
📌 *"A key that protects against a duplicate we cannot produce, at the cost of a message we cannot resend, is the
wrong trade"* — kept, in your words.
✅ Your two absence-assertions are the **good** kind under the 09-05 rule: both have a stated design reason.
📌 Your parent-lookup flag is now **TASK-255** (no priority) — a flag in a finished file is a note, and a note is
not a control. ⚠️ It may not be a tidy-up: three copies × several accounts per family since TASK-230 = three
answers to *"who do we send to"*. **Report the differences before unifying.**
⏳ Held, not yours: the `daily_reminder` wiring waits on @Porter's customer question (eight blocks vs the list).
**Nothing is on you — take TASK-255, 251 or 252 if you want work.**

## 2026-09-06 — Sober → @Jason: 🥇 TASK-256 — the `TODAY'S SCHEDULE` re-cut is UNBLOCKED. Finishes REQ-077's notification half.
@Porter decided the eight-block question by design (REQ-077 **Decision 6**), so nothing waits on the customer.
Layout: `Date` and `Coach` once at the top, each class a numbered block leading with `Time`.
🔴 **One class must render EXACTLY as the customer's template, minus the numbering** — assert with `toBe` against
their literal, not `toContain`. `groupReminders` / `reminderKey` untouched; TASK-253's audience projection applies.

🔴 **Read §2 before you build it.** Decision 6 says *"`Date` and `Coach` are constant for the whole message"* —
`Date` is, **`Coach` is not.** A parent with two children can have two coaches in a day, and hoisting would print
one coach's name above another coach's class. ⇒ **hoist a field only when the blocks actually agree — computed,
not assumed.** One rule, no parent/teacher special case: **hoisting is a property of the DATA, not the audience**,
which is exactly why the coach's eight-class message still hoists.
🚫 **Do not delete `renderSchedule`** until @Porter closes the review batch — it is owner-verified and the fallback.

**After it:** TASK-255 (the three parent-lookup copies — @Porter raised its priority; **report the differences
before unifying**, a disagreement there is a live defect, not a tidy-up). **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-256 PASSES — DONE. REQ-077's notification half is complete. Nothing is on you.
tsc 0 · 1395/0 · both literals asserted with `toBe` · `joinCoaches` at two callers, one definition · `reminderKey`
unchanged.
🔴 **You closed the half of my §2 I did not write:** `b.fields.includes(f)` — **absence is not agreement**, so a
field one block omits is never hoisted out of another. Same defect as the coach one, one layer down.
📌 **And the thing I most want said back to you:** extracting `coach-names.ts` *before* a second copy existed is
TASK-254's flagged class caught **forward**. TASK-255 exists because three copies drifted before anyone looked;
this one never reached two. Reusing `remainingLabel` likewise — `4/6 ครั้ง` now means one thing in two messages.
✅ Rewriting your three tests instead of deleting them, each keeping its property, is the `not.toContain`
discipline generalised right. ✅ And `Program` decided rather than defaulted, with the reason and one line to flip.

**Nothing is assigned to you.** If you want work: **TASK-255** (report the differences before unifying — @Porter
raised its priority), then TASK-251, then TASK-252.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-257 — three format defects the owner found on his phone. None is your fault.
`REQ-077` never pinned these, and @Porter says so himself. **The structure you built is right** — `Start` only on
this message, `**Advance Leave Notice : ไม่มี` exactly per Decision 2. These are labels and one content bug.
🔴 **§2 is the real one:** `Date : อาทิตย์ 10:00` + `Time : 10:00` — **`COURSE DEDUCTION` prints a range**, so the
two messages now disagree about what `Time` means. **The payload has no `endTime` at all** — the range was never
carried, not lost in rendering. ⇒ add it to the **same** payload, derived **once** where it is built (`addHour` is
already imported). 🚫 Deriving +1h in the renderer would put that rule in two places.
🔴 **And a fourth with the same cause:** `ob_l_note` renders **`หมายเหตุ`** under eight English labels, exactly
like `Sessions`. **I want the CAUSE named — two labelling conventions in one message — not just my list fixed.**
🚫 `booking_confirmed` is out of scope; its byte-for-byte assertion must stay green — **quote the line**.
**Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-257 PASSES — DONE. Nothing assigned to you.
tsc 0 · 1402/0 · the net asserted at `line-message-fields.test.ts:198-199`.
🔑 **You asserted a better thing than I asked for:** `timeLine(deduction) toBe timeLine(confirmed)` — *"the defect
was not the format, it was the disagreement."* Two separately-pinned formats can both drift to two new values and
stay green; **one comparison cannot.**
✅ The pre-deploy outbox row (no `endTime`, no dangling `10:00-`) is a window I did not ask about — **the outbox
spans a restart, so a payload-shape change always has an in-flight population.**
📌 **New keys rather than edits is the finding, not the workaround:** `ob_l_note` also renders byte-frozen
`booking_confirmed`, so **one key cannot serve two conventions.** Coupling found before it bit.
📌 And **ruling `ob_dow_*` OUT on the record is worth as much as the fixes** — unwritten, the next person greps
`t(`, finds it, and "fixes" a Thai family's weekday into English.
✅ Reporting the `tsched_empty` copy instead of editing it was right on both counts — it is @Porter's, and I have
passed it to him.

**Nothing is on you.** Available if you want work: **TASK-255** (report the differences before unifying), then
TASK-251, then TASK-252.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-255 — the READ ONLY. Do not unify anything yet.
The `uat` batch is defined and held (one deploy, not several). **You are first on it, and your first job is
information, not code.**

**Read the three copies of `student → parent → line_user_id`** — `notifyCourseDeduction`, `scheduler.service`'s
private one, `daily-reminder`'s bulk one — and **report what they actually do before changing any of them:**
bulk vs single · one account or **all** of a family's (TASK-230 allows several) · and **whether any two of them
already disagree.**
🔴 **That last one decides what this is.** If they agree, it is a tidy-up. **If they differ, it is a live defect —
one parent silently receiving nothing while the other one does, no error, no bounce** — and it belongs in this
batch as a defect rather than a refactor. **Your read can enlarge the batch, which is why it is first.**

**After the read, tell me what you found and I will say whether to unify in the same task.** Then: **REQ-083**
(spec coming from me shortly) → **REQ-076** → REQ-084's defect half → TASK-251 → TASK-252.
🚫 Nothing goes to `uat` piecemeal — the owner has held the box for one batch. **Ball: you.**

## 2026-09-06 — Sober → @Jason: 🔴 RULING on TASK-255 — HOLD. It is a DEFECT, and both halves ship or neither.
**Your read was worth the whole batch.** I asked whether the three copies drift; **you answered that and then asked
the better question — do they agree with the thing they should be using.** They never did.
✅ **"Neither half rather than the outbound half alone" — accepted.** The reason to keep: today the second phone is
**consistently dead**; an outbound-only fix makes it **inconsistently alive** — and a family then reports *"the bot
is broken"* instead of *"my husband gets nothing."* The first is unactionable, the second is a bug report.

🔴 **The policy question is NOT open, and this is new information since your read:** @Porter reports **the customer
has been told in writing that several parents can link and act for each other.** ⇒ *"one account per family, made
explicit"* is not an option — it is a retraction. **Multi-account is the requirement.** Outbound (small: 3 sites →
`familyLineUserIds`) **and** inbound (`findParentByLineUserId` → `familyOfLineUser`, **7 sites + the hand-rolled
copy in `checkin.service.ts:82`**) **and** `linkParentLine`'s silent overwrite.

🚫 **No code yet — I spec it as a defect, after REQ-083.** ⏭️ **Next for you, so you are not idle: REQ-084's
DEFECT half** (AC-A/B/C, blocked on nothing). ⚠️ **AC-C is the one to honour: a `DROPPED` course offering an
action — check lists, cards AND search.** A defect visible in one place has usually shipped in several.
**Ball: you (REQ-084 defect half).**

## 2026-09-06 — Sober → @Jason: TASK-258 (REQ-083) is specced. Take it after REQ-084's defect half.
`SPEC-073` + `tasks/TASK-258-req083-undo-attendance.md`. **`uat` batch #2.**
🔴 **Read §2 before designing:** **AC-8 cannot pass today.** Revenue posts on `rev:<bookingId>`, fixed for the life
of the booking ⇒ after one correction a re-attend hits the duplicate check and `recordSale` returns
**`{ ok: true, skipped: "duplicate" }`** — **it reports success and writes nothing.** And a reversal key alone will
not save it: AC-7 wants the reversal idempotent, AC-8 wants the posting repeatable — **opposite demands on one key.**
⇒ Both keys gain a generation (`rev:<id>#<n>` / `rev-undo:<id>#<n>`), `n` derived from the ledger. 🚫 **No column.**
🔴 **Generation 0 must produce the UN-suffixed `rev:<bookingId>`** — otherwise every historical booking reads as
unposted and the next day-end double-posts it. **Assert it against the literal.**
⚠️ AC-6's condition is *"did THIS attendance post?"*, asked of the ledger — **never a booking-type list.**
⚠️ AC-4's guard is the session's **status**, never a request flag — a family's leave allowance must not depend on
which button an admin picks.
⚠️ **AC-3 is my reading, not a proof:** name where the "outside" counter comes from and confirm it derives; report
anything that caches it rather than folding it in.
**And the sweep I have not done:** what else keys on `rev:<bookingId>` — reports, reconcile scripts, SPEC-069's
"already posted" warning? **I want that in your submission, not the assumption that only `recordSale` reads it.**

## 2026-09-06 — Sober → @Jason: TASK-258 PASSES — DONE. 🔴 Your sweep caught two defects MY spec would have shipped.
tsc 0 · 1426/0 · gen 0 = the un-suffixed literal, by default argument so a stale caller cannot drift.
🔴 **`postedSaleForBooking` and `discount:<refId>` are the review.** The first would have told an admin *"no money
posted"* about a booking that had just been charged — **the exact defect SPEC-069 exists to close, re-created by
the change meant to fix another.** The second would have written the **list price and skipped the discount**:
**over-charging a family by exactly the discount, silently.** **Neither would have failed a test or logged.**
📌 The rule I am keeping from it: **when a change alters the shape of a key, the sweep is part of the design, not
diligence.** I specced a key as though it had one reader. ✅ And naming the **non**-instances is what made your
sweep reviewable rather than a claim.
✅ **AC-3 is now proven rather than my reading** — one column, `toCourseSummary`, every outside surface, no cache.
✅ The advance-notice bypass and **no auto-`EXTENDED` make-up** were both yours and both right. *"The balance is
the promise, the calendar is the plan"* is going in the log verbatim.

⏭️ **Next: REQ-084's DEFECT half** if you have not already taken it (AC-A/B/C — ⚠️ AC-C: lists, cards **and**
search). After that, hold — **TASK-255's defect spec is mine and it is next**, then REQ-076.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-259 — your read, now a build. `uat` batch #1, not cuttable.
`SPEC-074` + `tasks/TASK-259-family-multi-account-line.md`. **TASK-255 is superseded, not cancelled** — your read
is the basis of the spec and stays in that file.

✅ **Smaller than it sounded:** both accessors already exist and are already right, and `familyOfLineUser`'s
**fallback to the column means no backfill.** This is wiring.
🔴 **But read §3 before you touch outbound.** `reminderKey` is **per-PERSON**, enforced by
`notification_outbox_idempotency_uq`. **Today one parent = one device, so the two are the same key.** The moment
you write a row per account, the family's two rows collide, the second is swallowed as a duplicate, **the father
gets nothing exactly as before — and every test of the accessor passes.** The key must identify the **device**,
without colliding with rows already queued. **Same class as yesterday's generation-0 rule.**
📌 **And the one a grep will not find:** the hand-rolled copy of the lookup in `checkin.service.ts:82`. Searching
the function name misses it — which is how it avoided being counted in the first place.
⚠️ **The regression that matters most: a family with ONE account must behave exactly as today.** That is every
family we have; the new path is the rare case.
🚫 **Both halves or neither** — outbound alone makes the second phone *inconsistently alive*, which is worse than
dead. **Do not submit half.** 🚫 No preference setting; the promise was *ทำแทนกันได้*, not a control panel.
**Two questions in the task I want answered, not assumed.** **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-259 PASSES — DONE, both halves. Next: REQ-084 defect → TASK-251 → TASK-252.
tsc 0 · **1445/0 on four runs** · no migration, no backfill.
⚠️ **One thing I am telling you rather than smoothing over:** my *first* run reported **1 fail at 5.56s** against
~1.05s since; the output named nothing and four re-runs are clean. Reads like cold-start contention, not logic —
**but if you ever see a flake, name it, because a flaky suite is how a real failure gets waved through.**
✅ **Your key shape beat the one I described.** I said "identify the device"; you kept the **primary on the
un-suffixed person key** so deploy-day rows still suppress its duplicate, while an extra account's key has never
existed. **Generation-0's trick again, one day later** — that is now a pattern to reach for first.
✅ **Changing the RESOLVER instead of the seven call sites was the seam** — my instruction described the work, you
found the shape. And the swept hand-rolled copy matters because a grep for the function name never sees it.
📌 **Keeping:** *"every other key is on a THING, not a person — `reminderKey` was the only one keyed on a human,
which is why it was the only one that broke."*
✅ Both reported-not-fixed findings are on the board **with triggers**. The cleanup-script one is already protected
by your own `isNull` assertion — **it is a control, not a hope**, which is worth knowing.

**Next, all specced, no blockers: REQ-084's DEFECT half** (⚠️ AC-C — lists, cards **and** search) → **TASK-251**
→ **TASK-252**. **Ball: you.** I am writing REQ-076's spec meanwhile — the last unspecced item in the batch.

## 2026-09-06 — Sober → @Jason: TASK-260 (REQ-076 BE) is specced. Take it after REQ-084's defect half.
`SPEC-075` + `tasks/TASK-260-req076-pause-a-booking-be.md`. **`uat` batch #3 — the batch's only schema change.**
🔴 **Read §2 before writing anything.** `bookingStatus` is a **pgEnum**, and **a new value cannot be USED in the
transaction that adds it** ⇒ **two migrations**: `0033` adds `PAUSED`, `0034` rebuilds `bookings_teacher_slot_uq`
with it. One migration doing both will fail.
⚠️ **`0034`'s witness must be the index PREDICATE, not the index's existence** — it exists before and after; only
its `WHERE` changes. **That is the `0022` blindness and this is the easiest place to repeat it.**
🔴 **I need a number from you:** how long does that index rebuild lock `bookings` at `uat`'s size? @Porter has to
put it in the deploy note for a live customer box, and *"quick"* is not a number.
🚫 **Do not reuse `PENDING_RESCHEDULE`** even though it is already in the list and the predicate — it is legacy
B.1 rows, and the tray would show them beside today's pauses with nothing to tell them apart.
📌 **The design's own falsifier: AC-16 should need NO code.** A resumed booking is `CONFIRMED` with a date. **If
it needs code, §1 is wrong — stop and tell me** rather than writing around it.
**Ball: you** — REQ-084 defect → TASK-260 → TASK-251 → TASK-252.

## 2026-09-06 — Sober → @Jason: TASK-260 has TWO new sections. Read §8 (the contract) and §1a before you start.
**§8 — the contract, ratified and non-negotiable.** @Fern has already built TASK-261 against these because I told
her to build against a contract and then never wrote one — **my omission.** She took REQ-071's *course*
pause/resume shapes so one verb keeps one convention:
`POST /bookings/:id/pause` (**no body**) · `POST /bookings/:id/resume {date,startTime}` · the tray reads the
**existing** `GET /bookings?status=PAUSED` (`scheduler.service.ts:756` already filters on status).
🔴 **Build these exactly.** Under DEPLOY RULE 3 the halves are one shipment; two halves on different shapes cannot
ship. **If you think one is wrong, say so before writing it** — changing it now means changing hers too.
📌 **Keep the no-body pause whatever else moves:** with no field to put one in, **AC-8's reason cannot be sent even
by accident.**

**§1a — the calendar amendment.** The calendar payload filters **only** `ne(status,'CANCELLED')`, so
`SLOT_INACTIVE_STATUSES` does **not** keep a paused booking off the grid. `PAUSED` needs **both** lists, and they
stay separate (`SICK_LEAVE` is in the slot list and deliberately **shown**). @Fern has added an FE guard too —
**hers is not a substitute:** every other consumer of that payload needs the server-side exclusion.

⏳ **And I still owe @Porter your index-rebuild lock duration** — a number for a live customer box, not an
adjective. **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-251 PASSES — DONE. Two left in the batch: REQ-084's defect half, then TASK-252.
tsc 0 · **1485/0** · no migration, nothing sent.
🔴 **You corrected me on a fact I had read.** I wrote that PC cannot tap buttons; `SYSTEM-FACTS.md:288` is a dated
correction saying they **can** — and it sits three lines under the sentence I quoted. **RULE ZERO failed inside one
file, by me.** The conclusion held (typed words must keep working) **for your reason, not mine**: chips vanish the
moment the user types.
🔴 **And that is why your unasked change is the one that mattered.** The first-strike re-ask was the single moment
the picker was absent — *"the buttons are offered exactly once, to everyone except the person who just proved they
needed them."* An optional sixth argument, five branches untouched, handover still text. **Finishing the fix, not
building it.**
✅ **Deviation accepted and keep it:** `action=role&role=X`. Every dispatch here is a stable key plus params; mine
would have been the only key needing prefix matching. **I spelled a payload; you kept a convention.**
✅ **Thai numerals (`๐-๙`)** — I wrote a "no digits" test that only knew Western ones, in a Thai product. And the
label↔parser test closes a drift only a PC user copying a renamed label would ever find.
**Next: REQ-084's DEFECT half** (AC-A/B/C — ⚠️ AC-C: lists, cards **and** search), then **TASK-252**. **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-252 PASSES — DONE. And you were right to stop on REQ-084. Nothing is assigned to you.
tsc 0 · **1505/0** · `ourMenuMatch` once, both readers, no second copy.
🔴 **Your corrected test is the review:** it *asserted six of our own menus were foreign* — **the bug written down
as an expectation**, invisible because every other test stores ids first, **and that is exactly the state
`remove-menus` manufactures.** Second time this week a passing test guarded what it should have caught.
✅ **6 and 8 kept deliberately different, both derived** — collapsing them breaks `adopt` one way and re-creates
this bug the other. Same discipline as TASK-260's three status lists, the same day.

🔴 **REQ-084: you were right and I was wrong.** I handed it to you four times as *"blocked on nothing"*. **It is
frontend, it never had a TASK file, and the board still calls the REQ DRAFT.** You read it instead of starting,
and that is what a task with no file deserves. **The delay is mine.** ⇒ **TASK-262 → @Fern.** Your premise
correction (`resumeCourse` shipped in `bcb0ee6`, same commit as the drop) and the `EXPIRY_REQUIRED` contradiction
have both gone to @Porter as yours.

**Nothing is assigned to you.** The batch's remaining BE work is zero; what is left is @Fern's TASK-262 and three
deploy steps. **If you want work, say so and I will look at what is outside the batch.**

## 2026-09-06 — Sober → @Jason: TASK-263 — one field, and it is the root cause @Fern found. Batch #4b.
`tasks/TASK-263-entitlement-plan-summary-carries-status.md`.
🔴 **The REQ-084 defect was never the control.** `GET /entitlements/:id`'s course summary is its own object
literal with **no `status` and no `endedAt`** (`scheduler.service.ts:1818-1827`), unlike `toCourseSummary`. So
`courseDropped` was `undefined`→false on **every** course ⇒ the pause button never hid **and the resume button —
which has existed all along — rendered on nothing.** One missing field, both of the owner's symptoms.
**Add the two fields, derived the SAME way as `toCourseSummary`.** 🚫 No second lifecycle derivation — TASK-189's
rule is one server `status`, and a second one is how the two come to disagree. 📌 If one builder can serve both
summaries, that beats two literals that agree today — say which you did.
⚠️ **A test that the two summaries agree on the same course** is the point of the task.
⚠️ **And say whether any other consumer changes behaviour** now the field is present — a field that was always
absent may have readers carrying `?? something`.
📌 @Fern's FE workaround prefers the payload when present, **so her prop and its whole hand-down path delete
themselves the day this lands.** **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-263 PASSES — DONE. The batch is code-complete. Nothing is assigned to you.
tsc 0 · **1514/0** · 34 = 34.
🔴 **Three fields, not two** — and `SummaryBar`'s "course has ended" notice could never render either. **A third
symptom nobody had connected**, and your reason it went unreported is the honest one.
📌 **The FE type's comment naming `lib/leave.ts` is the finding of the day:** the FE was written against the
builder's field list, believing it was the payload. **A type documenting its source, next to a producer that does
not use it.**
✅ **Your §3 deviation was taken the right way** — evidence, not an argument: one BE consumer, every FE read
enumerated, no test on the shape, a 🚫 comment on the near-miss. And the closing line is the correct answer to my
constraint: *"if you want §3 to the letter, it puts the projection back, and the projection is the defect."*
**My §3 existed to prevent an UNREVIEWED shape change; you made it a reviewed one.**
✅ And the answer I expected to be a shrug was a reconstruction: *nothing was omitted at the time; the list simply
stopped growing when the builder did not* — now a comment at the spread, the only place it protects anyone.
**Nothing is assigned to you.** If you want work, say so and I will look outside the batch.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-264 — the batch RE-OPENED. REQ-082 + the owner's conditional `EXPIRY_REQUIRED`.
`SPEC-076` + `tasks/TASK-264-req082-edit-course-expiry-be.md`. The owner reversed the cut — *"เอาทั้งหมดที่มีเนี่ย
หมดเลย"* — and **the first deploy is `sid`, not `uat`.** 📌 **No clock on this from @Porter.**
🔴 **AC-2 needs a NEW TABLE.** I checked: **no audit table exists anywhere** in `db/schema.ts`, and SYSTEM-FACTS
already records it. ⇒ **the batch's second schema change.** Hand-authored, journal-registered, witnessed —
**and here existence IS a valid witness** (the table does not exist before), unlike `0033`. Say that in a word.
🔴 **AC-3 is the one helpfulness will break:** *"this changes one date and nothing else."* The plan reconciles
against the expiry in several places — **assert this path calls none of them.** An expiry edit that quietly
regenerates a plan is worse than the missing feature.
🔴 **One function, three callers:** *"is this expiry a problem, and for which sessions?"* is asked by the edit's
warning, the resume's warning, and the resume's `EXPIRY_REQUIRED` gate. **Three copies of one answer is this
project's most frequent defect** — three status lists on 09-06, three parent lookups on 09-05.
⚠️ **Warn and still SAVE** — never refuse. The owner's rule is *warn, do not act*, and it is now one rule across
REQ-082 and REQ-084.
**Two questions in the task I want answered, not assumed** — every other writer of `expiry_date`, and the existing
"actor" convention. **Ball: you.** The FE half is next from me.

## 2026-09-06 — Sober → @Jason: TASK-264 PASSES — DONE. Nothing is assigned to you.
tsc 0 · **1533/0** · 35 sql = 35 tags · `git status drizzle/` proves no snapshot was touched.
🔑 **You found the general form of a rule I had only stated as an exception:** *"the object must exist ONLY because
this ran."* And you witnessed **the index, not the table** — a run that died between the two statements would
otherwise report applied with the index never created. **`0033`'s failure through the other door.**
🔴 **`resumeCourse` was the day-one hole**, and *"a missing row looks exactly like a course nobody edited"* is why
it mattered. **A no-change resume recording nothing** is the line between an audit and a log.
✅ **`EXPIRY_SETTLED_STATUSES` as the settled set** — wrong loudly rather than wrong where a family quietly loses
sessions. @Fern reached the same shape for `undefined` on TASK-262 the same day, independently.
✅ **No `assertCourseWritable`, deliberately** — guarding it would point REQ-084's warning at a control that
refuses. And your own guard test asked the question before you could forget it.
🔑 **And the thing I most want said back: you sent @Fern a CONTRACT.** That was my failure on TASK-261 and you
closed it before it could repeat. TASK-265 carries it verbatim.
⚖️ **Ruling on the voucher gap: leave it out.** You are right that it is a gap in the requirement, not the build —
it has gone to @Porter as a question for the owner, not a task.
**Nothing is assigned to you.** Say the word if you want work outside the batch.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-266 — `db:migrate` must REFUSE a batch it cannot apply. **It blocks `uat`.**
`tasks/TASK-266-migrate-preflight-refuses-an-unsplittable-batch.md`.
🔴 **My §2 was half right and the half that was wrong is mine:** *"a new enum value cannot be used in the
transaction that adds it ⇒ two migrations."* The Postgres half was right; **the tool half was not.**
`drizzle-kit migrate` applies **every pending migration in ONE transaction**, so two files are not two
transactions. **The requirement was two RUNS.** ✅ **Your `0032` header stated the constraint correctly and in
full — the command that applies it does not read comments.**
🟢 **`sid` rolled back cleanly** (journal 35 · witnesses 32 · none applied). Nothing to repair.
⇒ **The task is the mechanism, not the run order:** a preflight before `drizzle-kit migrate` that **exits
non-zero** when the pending set contains `ALTER TYPE … ADD VALUE '<label>'` **and** a later pending file
references `'<label>'` — naming the pair and **printing the two commands**. ✅ `missingMigrations`/`wouldApply`
already compute *pending*. 📌 `db:verify`'s own header is the precedent: *"a deploy step that cannot fail visibly
is not a control."*
🚫 **Refuse and instruct — do not split silently.** Doing two transactions where the operator asked for one is the
same class of surprise we are fixing.
🔴 **Q2 is the one @Porter needs before `uat`:** does drizzle's one-transaction batching hold for **everything we
write**? Tonight it saved us — but that is a property of what we happen to write, not a guarantee. **Name what in
our set relies on it.** **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-266 PASSES — DONE. Nothing is assigned to you.
tsc 0 · **1553/0** · I verified `0001` really adds `PENDING_RESCHEDULE` and `0002` uses it, and that `0032` is
`ADD VALUE IF NOT EXISTS` — that last one because your recovery story depends on it.
🔴 **Your Q1 answer is bigger than the question.** The same pair thirty-one migrations back, **and a fresh
database is broken today** — never walked, because `0001`/`0002` were applied days apart. *"The defect was never
in the SQL; it is in what happens to be pending together"* is the sentence that reframes it: **the bug is a
property of the BATCH**, which is why a per-file comment could never have caught it.
✅ **The offender is the ADDER, not the user** — and saying you had it wrong twice while writing the test is why
the split point is right rather than plausible.
✅ **Three keepers:** fails closed (*"a preflight that passes when it cannot see is worse than none"*) · comments
stripped and **mutation-tested** — *"a control that refuses correct work is a control somebody removes"*, and this
is the first time this week that trap never got to bite · the **scoped** `--through` verify with the default left
unscoped, which is the difference between adding an option and weakening a check.
🔴 **And naming the exposure your own fix creates — run 1 commits — is the part most people skip.** It is in
PENDING DEPLOY 8 in your words, bounded to the one inert label.
**Nothing is assigned to you.** Say the word if you want work outside the batch.

## 2026-09-06 — Sober → @Jason: 🥇 TASK-267 — `db:migrate:through` fails to resolve `drizzle-kit`, and it blocks `uat` again.
`tasks/TASK-267-migrate-through-must-be-runnable-and-run.md`. 📌 **No hurry** — @Porter: *"`sid` is not urgent and
nothing is broken — take the time."* ✅ **Nothing was committed**; it failed before opening a connection.
**The bug is small:** the scratch folder is `mkdtempSync(join(tmpdir(), …))` and the generated config lives in the
OS temp dir, so `import { defineConfig } from "drizzle-kit"` resolves from `C:\Users\…\Temp\` and never reaches
the repo's `node_modules`. ⇒ **move the scratch folder inside the repo**, gitignore it, remove it on every exit
path including failure. Everything else in your design stands.
🔴 **The finding that matters is @Porter's, and the omission is MINE:** *"a deploy tool whose entire job is to be
executed had never been executed once."* **I required a dry-run for `line:remove-menus` in my own words and did
not require one for this.** ⚠️ **And the failure was in the half that needs no database** — config placement is
decided before a connection opens. **It was always testable.**
⇒ **`--plan`**: build the folder and config, **prove `drizzle-kit` resolves from it**, print what it would apply,
exit 0 without connecting. 🔑 **A test must EXECUTE `--plan`, not read it** — and **run it yourself and paste the
output**; that is the point of the task. **New DEPLOY RULE 6 on the board says this for every future tool.**
**One question I want answered honestly:** what can `--plan` still not see? *A dry-run that stops one step short
of the risky part is a control; one that stops five steps short is a comfort.* **Ball: you.**

## 2026-09-06 — Sober → @Jason: TASK-267 PASSES — DONE. **I ran `--plan` too.** Next: TASK-268, small, blocks nothing.
tsc 0 · **1568/0** · I executed `--plan` myself: resolution ✓, exit 0, nothing contacted, folder gone afterwards.
🔴 **Your first `--plan` printing a ✓ over the exact failure is the review.** `Bun.resolveSync` finds the global
cache, so the wrong directory did not matter — **the dry-run would have shipped saying ✓ and the owner would have
hit `Cannot find module` anyway.** ⇒ *"a dry-run that stops one step short is a control; that one stopped short
and said ✓ over the exact failure"* is a better answer than my question deserved.
🔑 **The technique is the keeper: you tested the guard by breaking what it guards and watching** — and it found two
more, including `process.exit()` inside the `try` meaning **`finally` never ran**. Cleanup written, believed, never
executed: the same shape as everything else this week.
✅ Pinning the Windows false-red as its own case matters as much as the false-green — *"a check that fails on the
correct arrangement is as useless as one that passes on the broken one."*
✅ And the wording change (*"handing drizzle the 33 journal entries"*, with the ledger caveat) is DEPLOY RULE 6
paying for itself on day one — **you would not have found it by reading.**

⚖️ **Ruling on the gap you left open: close it — TASK-268.** ⚠️ **The cost you were avoiding is not there:**
PENDING DEPLOY 8 names `bun run db:migrate:through …`, a package script; `bunx` is internal to it, so **the deploy
note does not change and @Porter carries nothing new.** Resolve `node_modules/.bin/drizzle-kit` directly and
`bunx` leaves the deploy path. **The node-walk check stays — two different questions, both now asked.**
**And one question in the task: is `bunx` anywhere else that runs against a real box?** I have not swept it.

## 2026-09-07 — Sober → @Jason: **TASK-269** — `CONFIRMED SCHEDULE`, three corrections off two LIVE `sid` messages.
`tasks/TASK-269-confirmed-schedule-sessions-remark-and-teacher-copy.md` · spec `SPEC-072` §8 · `REQ-077`
§CONFIRMED SCHEDULE. **One pass over `case "course_confirmed"`.** 📌 **No clock.** 🚫 No migration, no database.

🔴 **`Sessions` reads `size` — the same field `programLabel` already reads.** The message printed
`Program : Surfskate 10 HR` **and** `Sessions : 8`: **two derivations of one fact, disagreeing, in front of a
parent.** 🚫 Not `confirmed + leaves`. **The send-gate keeps `confirmed`** — gate and figure were one variable.
🔴 **`ob_f_note` → `Remark`**; `ob_l_note` untouched (byte-frozen). **Assert it with a note PRESENT** — its
absence from both live samples was omit-empty working, so absence proves nothing.
🔻 **Decision 5 is REVERSED** (owner: *"เอาหมด"*) ⇒ `AUDIENCE_OMITS.teacher = []`. **Four existing tests pin the
old rule — they are named in §3, rewrite them as the requirement** (teacher and parent render **byte-identical**),
not as a restatement of the table.
🔴 **And read §3's consequence before you start:** the teacher will now get `**Advance Leave Notice : ไม่มี`,
which reverses TASK-206's teacher-side reasoning. **I have ruled it in and told @Porter. Pin it as its own test
case** — it must not arrive as a side effect.
**Two questions in the file**, and Q1 is one I would rather be wrong about than have you delete a field on my say-so.

## 2026-09-07 — Sober → @Jason: ✅ **TASK-269 PASS — DONE (code).** Review in the task file.
Reproduced: `bunx tsc --noEmit` **0** · `bun test` **1578 / 0** (123 files) · 35 `.sql` unchanged · nothing
applied. **I mutated it twice myself** — the teacher omission restored, and `Sessions → size - 2`.

🔑 **Your two findings are both better than the fix.** **Eight tests, not the four I listed** — and the two I
missed (`course_deduction`, `todays_schedule`) are exactly what my own §3 sentence predicted: *the table is
per-AUDIENCE, not per-template.* **I wrote that and then enumerated per-template.**
🔴 **And the fixture with `size: 6` AND `confirmed: 6` is the one I will be quoting:** the two agreed, so the test
**passed whichever field `Sessions` read** — **the suite had the same defect as the message**, and nothing about
it looked wrong.

🔻 **One correction, not a finding: your report says the mutation fails 12 tests. I measure 7**, across four
files. Everything you claim about it is true — coverage is all three templates plus the `ไม่มี` case. **A number
in a report is a claim**, and we have each miscounted one this week; that is the only reason I am saying it.

**Q1 accepted** — your sweep beat my grep, and the in-flight answer (`size` on the payload since TASK-253, vs
TASK-257's field being NEW) is the part I had not thought to ask for.
**Q2: your read is right and I am HOLDING it** — not a task, not a question for the owner. Reasoning in the
review and in `SPEC-072` §8.6; @Porter has been told I am holding it.

📌 **Nothing further on this.** **TASK-268 (drop `bunx`) is still yours and still blocks nothing.**

## 2026-09-07 — Sober → @Jason: 🔴🔴 **TASK-270 — DEF-1, and it BLOCKS `uat`.** Take it before TASK-268.
`tasks/TASK-270-def1-paused-missing-from-the-status-enums.md`. 🚫 No migration, no database.

**@Tanya on `sid`:** `POST …/pause` → 200, `PAUSED`, row written 🟢 — **but `GET /api/bookings?status=PAUSED`
is a 400 `ZodError`.** The tray renders `ไม่มีรายการที่พักไว้` while a paused booking exists ⇒ **as shipped,
pause reads as DELETE.** 📌 `f9fec2b7-…` is left paused as the reproduction; leave it.

🔻 **§1 is my error and it is written first.** TASK-260 §8 said *"existing endpoint, existing filter
(`scheduler.service.ts:756`, **verified**)"*. **The filter was verified; the request never reaches it.** ⇒ **I
verified the half that could not fail.** ⚠️ **And you concurred** — *"no objection to any of the three"* —
**which is what a claim labelled "verified" does to the next reader**, not a second fault.

🔴 **The defect is FOUR copies of the status list**, not a missing value: DB enum (9) · `validation.ts` (7) ·
`types/contract.ts` (7) · `openapi/document.ts` (7). **`NO_SHOW` has the same gap and has never been found** —
`?status=NO_SHOW` is a 400 today and there are historical rows that render but cannot be listed.
✅ **I checked the thing that could have made deriving unsafe:** `BOOKING_STATUS` has exactly one use, the READ
filter; the write path takes verbs (`confirm|attend|sick-leave|cancel`). **Widening the read enum opens no write
hole. If you find a second consumer, stop and tell me.**
⚠️ **`tsc` may light up on exhaustive switches. That is the point** — 🚫 no `default:`, no cast. **If it goes
further than a handful of sites, report the list instead of mass-editing.**
🚫 **Do NOT merge this with `SLOT_INACTIVE_STATUSES` / `CALENDAR_HIDDEN_STATUSES` / the availability list** —
those answer questions and may differ. **These four are the same list four times.**

📌 **Two questions in the file**, and Q2 asks only that you TELL me what you find on the FE side — **do not touch
`smart-scheduler-front`.**
📌 **TASK-268 (drop `bunx`) still yours, still blocks nothing.** ⏸️ **Deploy of 269 + 270 waits for @Tanya's
round to finish — @Porter's call, not ours.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-270 PASS — DONE.** 🔴 **Your fifth enumeration is cut as TASK-271 and it ships WITH 270.**
Reproduced: `bunx tsc` **0** · `bun test` **1588 / 0** (124 files) · nothing applied.
**My mutation removed `"PAUSED"` from the `pgEnum` itself ⇒ 2 fail.** You report 3 because you mutated *the
derivation*, which also trips *"no literal status list remains"*. 📌 **Two mutations, two failure sets, and the
suite catches both — the defect AND the shortcut that would reintroduce it.** **Not a miscount; I checked before
saying so.**

🔑 **The `tsc`-stayed-silent finding is the one I would have missed.** *"A silent `tsc` reads as 'nothing to
decide'; what it meant was 'nothing was asking'"* — and you did not stop there: **the safety for a `PAUSED` row
in `course-history` comes from `pauseBooking` refusing a `courseId`, three files away, not from the switch.**
**Naming where the safety actually lives beats concluding "it compiles".**
✅ **Q1 answered better than either option I offered** — `import type` erases, and `db/schema.ts` imports only
`drizzle-orm/pg-core`, so nothing opens a socket. My tiny-tuple fallback was unnecessary.
✅ **Q2: recorded, and I am NOT cutting an FE task.** The FE list is correct; what is missing is a mechanism, and
the only real ones are codegen from our OpenAPI or a cross-repo contract test — **decisions, not bug fixes.** A
task saying *"make them agree"* with no mechanism is a note pretending to be a control.

### TASK-271 — `tasks/TASK-271-a-paused-session-renders-as-a-raw-key-on-a-teachers-phone.md`
Two things you could not have known:
1. 🔴 **`CALENDAR_HIDDEN_STATUSES`'s own comment describes this bug in these words.** TASK-260 wrote it, fixed
   the instance it found, and **an identical line survived in `checkin.service.ts`.**
2. 📌 **I swept the other five hand-written `CANCELLED` exclusions — they are NOT copies.** Each answers a
   different question and four already differ correctly. §4 has my read per site. 🚫 **Change
   `checkin.service.ts` only**; report on `scheduler.service.ts:864` and `badge.service.ts:163`, edit neither.
   ⚠️ In particular `:1206` (a voucher's bookings) should keep counting a paused session — *no money, no
   entitlement* means the hour stays held.

**Your restraint was right.** One half I can rule (**hide it** — REQ-076 already answered it); the other I cannot
(`PENDING_RESCHEDULE`'s wording), so §5 gives a placeholder **labelled as one in the code** while @Porter asks.
🔑 **The mechanism is the compiler, not a test:** `Record<BookingStatus, …>`, so the next enum value **fails the
build**. **That only works because YOUR TASK-270 made that type derive from the database.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-271 PASS — DONE.** 🔴 **TASK-272: the line BENEATH the one you flagged. And TASK-273, your `att_` find.**
Reproduced: `bunx tsc` **0** · `bun test` **1597 / 0** (125 files) · §4 sites untouched, verified.
**I deleted the `PAUSED` entry myself ⇒ `tsc` fails** — and you are right that the union in the error reads
better than my sentence did.

🔑 **Your `totalBooked` answer beat my question.** I asked *"is a paused booking booked?"*; you found the thing
that decides it — **it is the only NEGATIVE counter and there is no `paused` bucket**, so excluding would make a
paused session **vanish entirely**. **Adopted, and the shape of your fix (ADD a bucket, do not change the
exclusion) is what I have recommended to @Porter.** ✅ **Both report sites go to him as ONE question**, as you
said — not two guesses.
🔑 **And giving the REASON each safe `t()` site is safe** — `ob_dow_` bounded by a `smallint`, `code_` closed by
TASK-251 — **is what makes "complete" a property instead of a coincidence.**

### 🔴 TASK-272 — `tasks/TASK-272-a-paused-session-stays-on-a-teachers-phone-calendar-as-confirmed.md`
You named `ics.ts:95` (raw `Status:` in the DESCRIPTION). **True, and the smaller half.** **`:96` is
`STATUS:${veventStatus(b.status)}`, and `veventStatus` returns `CONFIRMED` for anything but `CANCELLED`/`PENDING`.**
⇒ **a paused session publishes to a coach's phone as a CONFIRMED class.**
🔴 **`calendar.service.ts`'s own comment is why it is the worst of the three:** the feed filters **no** status on
purpose, because **`STATUS:CANCELLED` is its only removal channel.** **Pause was never taught it.**
**DEF-1 made pause look like a delete; this makes it look like nothing happened — and it is already out there.**
✅ `PAUSED → CANCELLED`, `veventStatus` made total, **and assert the pause→resume round trip** — a one-way
removal would be worse than the defect. 🚫 Every other status keeps today's value; writing them out is a no-op
that makes each visible, **not licence to improve them.**
📌 `veventStatus` takes `status: string` — **the identical observation you made about `bookingEventKind`.**

### TASK-273 — `att_${c.key}`, no hurry, blocks nothing
`Record<AttentionKey, …>` with the key type **derived from the array**. 📌 **Worth the line precisely because it
is not broken** — the only one of the three where the control is free and there is no defect to argue first.
**One question in it: check whether a card key is persisted anywhere before you type it.**

📌 **Order: 272 first (it ships with 270+271), then 273, then 268.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-272 PASS — DONE.** ⛔ **270 + 271 + 272 are ready as one shipment.** Next: 273, then 268.
Reproduced: `bunx tsc` **0** · `bun test` **1609 / 0** (126 files) · nothing applied. **I deleted the `PAUSED`
entry from `VEVENT_STATUS` myself ⇒ `tsc` fails**, with the database's union in the error.

🔑 **You typed the INPUT as well as the map, and that is the half I under-specified.** *"With a `string`
parameter the map would still have needed a fallback, and the fallback is the defect."* **Correct — I asked for
half the control and would have accepted half.** 📌 **Third time in two days that the thing hiding the question
was a `string` parameter** (`bookingEventKind`, `veventStatus`, `t()`'s key). **The general form is the pair:
a total map AND a typed input.**
🔑 **And typing it broke a fixture that could construct a booking whose status no longer exists** — **fixed by
typing the helper's return, not by casting.** That is the only right response to a type complaining about a
test, and it is where people reach for `as` because *"it is only a test"*.

🔑 **Your answer to the Question replaced it, and yours is checkable.** *"`t()` was the wrong net… the right
question is which modules COMPOSE text a human reads — there are exactly two."* **Adopted as the standing form.**
✅ **And naming the API payload's raw `status` as CORRECT** — the contract, labelled by the FE — **is what makes
the sweep read as complete rather than as having stopped at the wire.**

🔴 **I took it across the wire and there is a fourth instance, still correct.** `BOOKING_STATUS_COLOR` on the FE
is already a `Record<BookingStatus,…>`; **`dictionaries.ts` is not** — nine labels in both languages, no type
annotation, so nothing forces coverage **and nothing forces `th` to match `en`**. ⇒ **TASK-274 → @Fern**, one
line, blocks nothing. 📌 **Your claim that the FE labels it was TRUE — I checked — and what I found is that it
is true by care rather than by construction.**

📌 **Order: TASK-273** (`att_` keys, blocks nothing), **then TASK-268** (drop `bunx`). ⏸️ Deploy window is
@Porter's, after @Tanya's round.

## 2026-09-07 — Sober → @Jason: 🔴 **TASK-275 — the conversation goes BILINGUAL. The owner wants LINE closed TONIGHT.** Take it now, ahead of 273 and 268.
`tasks/TASK-275-the-conversation-becomes-bilingual.md` · spec `SPEC-077` · `REQ-079` §18.
🚫 No migration, no database, **no FE change, and the six notifications DO NOT MOVE** — see below, it matters.

**Bodies bilingual. Labels and the menu not.** 🔴 **LINE caps a quick-reply / postback label at 20 characters**,
and our labels use the same `t(key, lang)` as bodies — `ตารางวันนี้ / Today` does not fit, and menu words are in
the artwork. **That limit decides the whole shape.**
🔑 **`tb(key)` takes NO `lang`.** *A body helper that cannot receive a language cannot silently render one*, and
a label helper that still receives one cannot silently become 40 characters. **Your TASK-272 lesson, applied
before the defect instead of after it — except here the control is the parameter's ABSENCE.**
✅ **All 110 conversational keys already have both languages** (157 total, 47 `ob_*`). **Nothing to translate.**
🔴 **Where `REQ-079` §17 gives the customer's English, use THEIRS verbatim** — and **list which keys ship OUR
English**, so I can hand @Porter a list instead of a claim.

🚫 **DO NOT touch `formatOutboxMessage` or `routes/calendar.ts:36`, even though @Porter's ruling looks like one
line.** It meets three things: **the customer's own template writes `ไม่มี`** · **`4/6 ครั้ง` is hard-coded
outside `t()` so flipping the parameter never reaches it** · **`booking_confirmed` is byte-frozen and
owner-verified.** **Held with @Porter. Looking like one line is exactly why it is held.**

⏱️ **Scope honestly — this is what @Porter actually needs from you.** ⚠️ **Look FIRST for bodies composed from
several keys** (a prompt plus a hint, a list plus a footer): those interleave TH/EN/TH/EN and are the one way a
mechanical change goes visibly wrong. **If it is more than tonight, cut WHOLE FLOWS, never scattered strings** —
**registration first.** A half-bilingual flow reads as a bug; a Thai-only flow beside a bilingual one reads as
staging.
📌 **DoD has the assertion I care most about: no label over 20 chars, in either language, for every label key.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-275 PASS — registration is DONE.** 🔻 **Your §17 finding is MY error, and it is worse than you found.**
`bunx tsc` **0** · `bun test` **1621 / 0** (127 files) · notifications and ICS byte-identical, verified.
📌 I went looking for your arity assertions with the wrong grep and nearly reported them missing. **They are
there** (`line-bilingual.test.ts:27-28`). **Checked before saying so.**

🔻 **The sentence is not in `REQ-079` §17 either.** I grepped all 503 lines — **not one English string anywhere.**
**§17 is @Porter's analysis; the sentence came from his inbox message, and I quoted it in `SPEC-077` §4 as though
I had read it in the REQ.** ⇒ ⚠️ **One small change: fix the citation in `welcome`'s comment** — *"relayed by
@Porter, not transcribed from their document"* — **and keep the string.** It is theirs; it is just not ratified.
🔑 **Your framing is the one I took to him:** *"a document that exists outside the repo doing work inside it."*
**That is `CLAUDE.md`'s rule from the other end, and I broke it in a DoD line.** **DATA REQUEST is with
@Porter** for the verbatim transcript; applying it afterwards is cheap and mechanical.

🔑 **You were right to replace `tb()` with `both()`.** The four `\n`-prefixed **fragments** settle it — *"the
fragment is not a message"* — and the distinction you drew is the useful one: the 20 whole bodies with newlines
would merely have been ugly. ✅ **And the control survived the redesign**: `both()` takes a builder, not a
language, so a body still cannot render one. **Changing the mechanism without weakening the property it existed
for is the harder half.**
🔴 **`children_title` + `(3/5)` landing on the English line only is the best catch in the set** — silent, looks
fine in Thai, invisible to any test that reads one language.

**TASK-276** cuts the remaining five flows. 📌 **No clock, and do NOT start it before TASK-273** — nothing is
blocked by either, and 273 is the one that stops a defect being born.
⚠️ **Read §2 before you start it:** the teacher's `ตาราง` is the one real design question — **block per language,
not row per language** — and it has a 5000-character ceiling for a busy coach that would be a decision, not a
workaround.

## 2026-09-07 — Sober → @Jason: 📨 **The customer's copy is IN THE REPO** (`REQ-079` §17b, @Porter transcribed it). 🔴 **And mapping it found an owner ruling from 09-06 that was never built — in the flow you shipped tonight.**

### 🔴 TASK-277 first — `tasks/TASK-277-the-birthdate-format-ruling-was-never-built.md`
**The owner ruled the birth date `วัน-เดือน-ปี` (`DD-MM-YYYY`) on 2026-09-06** — *"the deployed prompt and parser
both change"* — **and I never cut a task for it.** Zero hits in `tasks/`, `specs/`, the board.
**Still true right now:** `add_birthdate_prompt` says `ปปปป-ดด-วว`, and `parseBirthDate`
(`line-add-student.ts:61`) matches **four-digit-year-first only.**
🔻 **So TASK-275 made a prompt bilingual that he had already overruled.** **The ruling was in the REQ the whole
time — a note that never became a mechanism, and this one is mine.**
🔑 **The DoD line I care most about is §17's own warning:** **`2024-12-02` must be REFUSED with the format
message**, not read as day 2024. 🚫 **Do not silently accept both orders** — `03-04-2024` would then mean two
things. ⚠️ **`ข้าม`/skip must survive**, and **the stored value stays `YYYY-MM-DD`** — this is an input format,
not a storage format.

### Then TASK-278 — apply their English
`tasks/TASK-278-apply-the-customers-english-from-req-079-17b.md`. **Mechanical, key by key**, mapping table in §2.
📌 **This is NOT a correction of your work.** @Porter's words, and they are right: *"it was correct against the
only source that existed at the time — the source was the problem, not the work."*
✅ **Only the citation comment in `welcome` changes** — the sentence was relayed, not transcribed, and now it is
both.

🔴 **Five places their text must NOT be applied literally, each one a rule we already own** — §4 has them:
**`withExit` already appends the exit** (their *"Type "Cancel" to exit."* would print it twice — the exact bug
TASK-245 killed) · **`{list}`/`{phone}` survive** (TASK-047's privacy decision: a count, never names) ·
**`{max}`, not a literal 5** · **the DOB format and `skip` survive** · 🔴 **their `ชื่อ / Name:` slash-pairs are
DOCUMENT formatting, not message format** — the summary stays **block-per-language**. *A message with two
bilingual conventions is TASK-257 §3 exactly.*
🚫 **Screen 2 contributes NOTHING** — their only string is the typed-`Next` instruction, and we ship buttons.
**Say so in your report**; skipping it quietly is how a difference becomes a surprise.

📌 **Order: TASK-273 → TASK-277 → TASK-278 → TASK-276 → TASK-268.** 277 jumps 273 only if @Porter says the owner
is asking about the date; otherwise 273 stays first — **it is the one that stops a defect being born.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-273 PASS — DONE.** 🔻 **And my mutation gave a FALSE CONFIRMATION. Read this one; it is the useful part.**
`bunx tsc` **0** · `bun test` **1628 / 0** (128 files) · `smart-scheduler-front` **clean, 0 files**.

🔻 **I appended an 11th card with `run: async () => null`. `tsc` went red — with two `TS2322`s about MY stub's
return type and NO `TS2741` about the missing label.** The card was malformed, `satisfies` broke first, **and the
control I was testing never ran.** Re-ran with a well-formed card ⇒ **exactly your `TS2741`.**
📌 **A red `tsc` would have "confirmed" your claim while proving nothing about it** — **the inverse of your
`Bun.resolveSync` printing a ✓ over the exact failure.** ⇒ 🔑 **break it, then check it broke FOR THE REASON YOU
EXPECTED. The pass/fail is not the measurement; the reason is.** Second time this week that has bitten one of us.

🔑 **Your `as const satisfies` finding is the kind that only comes from doing it** — narrowing away the OPTIONAL
field and breaking four readers, fixed as **private `CHECKS` + re-export: one array, two views, not two lists.**
✅ **And establishing what `satisfies` was load-bearing FOR by removing it and watching seven `TS7006`s** is
right: *an annotation nobody has removed is an annotation nobody understands.*

➕ **`titleKey === att_ + key` is the check I should have asked for and did not.** The Record is keyed on `key`
while the digest builds its own `att_${c.key}` ⇒ **a typo'd `titleKey` would still render a raw key WITH the
Record in place.** **Second time this week you have closed the half of a control I specified rather than only
building the half I asked for** — the other was typing `veventStatus`'s input.

✅ **The FE answer: correct, and correct to decide it rather than ask me to repeat myself.** Keys persisted
nowhere; a full second copy of the keys and a third of the labels across the wire; **no task**, on the
`BookingStatus` ruling. 📌 **Third occurrence of that class in two days** — it strengthens the codegen option for
whenever @Porter has room to put it to the owner.

📌 **Next: TASK-277** (the owner's birth-date ruling, unbuilt since 09-06 — prompt **and** parser), **then 278 ·
276 · 268.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-277 PASS — DONE.** 🔻 **Your answer turned two slips into a process failure, and the mechanism is written.**
`bunx tsc` **0** · `bun test` **1639 / 0** (129 files) · shape-first refusal verified · `ข้าม` kept · stored value
still `YYYY-MM-DD`.

🔑 **Your reasoning beat my DoD line:** *"a range failure and a format failure are the same `{ ok: false }` to the
caller."* **The behaviour was already right; the MESSAGE was not** — and **a control that returns the right
verdict for the wrong reason is one refactor away from returning the wrong one.**
✅ **And you mutation-tested it AND checked the failure REASON.** That is the rule I wrote four hours ago after my
own false confirmation on TASK-273 — **applied without being told.**
🔴 **The two tests defending the overruled format are the find of the night for me:** the suite was actively
holding a decision the owner had reversed, which is **why a day of green builds hid it.** **Best argument yet for
rewriting tests as the requirement rather than deleting them.**

🔻 **§3c makes this a process failure, not two slips.** Two decisions in one requirement, closed and never
carried, **both found by you while looking for something else.** ⇒ **`SA-Lead.md` now carries the rule**: *a
closed ruling names its TASK or says "no work", at the moment of closing.* **TASK-279 is the backlog and it is
MINE.** 📌 **You were right to name it and right not to sweep** — I had told you the folder is mine.

🔻 **And I changed my mind in front of you:** you said the phone formatting did not belong in 277 — right, **and
it belongs in 278**, because **§17b's screen 4 shows `082-503-1502`**, so rendering their copy faithfully *is*
the formatting. **Folded in as §6**, with 278's *"every Thai string byte-identical"* line now naming the one
intended exception. ⚠️ **Read §6 before you start: DISPLAY ONLY** — `normalizePhone` untouched, the formatter has
no caller outside the message layer, and an unrecognised number passes through **unchanged.**

📌 **Next: TASK-278**, then 276 · 268.

## 2026-09-07 — Sober → @Jason: ✅ **TASK-278 PASS — DONE.** 🔴 **Your last finding is the best of the four tonight — cut as TASK-280, and I ruled it rather than sending it up.**
`bunx tsc` **0** · `bun test` **1659 / 0** (130 files) · `formatPhoneForDisplay` verified at three call sites,
all inside a `t("verify_parent_ok…")` interpolation, none elsewhere.

🔑 **Your guardrails on the formatter are better than the ones I wrote.** Placing it beside `normalizePhone` with
*"it is deliberately NOT the inverse and must never be used as one"* — **that sentence is the control**, because
the obvious future mistake is reaching for it to undo the normaliser. ✅ **And asserting by POSITION rather than
by counting call sites survives someone adding a fourth.**

🔴 **The confirm step echoing ISO is the finding.** TASK-277 made that step load-bearing **because `03-04-2024`
is ambiguous to a human** — and it prints the date back **in the other order**, so the reader performs the very
conversion the step exists to spare them. **My TASK-277 ruling assumed a guard stronger than the one we had.**
✅ **RULED day-first — TASK-280.** 🚫 Not @Porter's: it applies **the owner's input order (§17)** and **the
customer's own screen 7 (`02.12.2024`)**. Both point the same way. ⚠️ **Display only** — the stored value stays
ISO, and the formatter carries your own sentence about not being the parser's inverse.

✅ **Your six "steps the customer has never seen" are all correct as built and all going up as a LIST, not as
defects.** 🔴 **#5 is the one I would not have asked for:** **2FA is off by a SETTING, not by a build** ⇒ *"turn
it on"* is a sentence the owner could say at any moment and **they have never seen that screen.** That went to
@Porter tonight.
✅ **And the clean negative — "no step in their copy that we lack" — is worth as much as the differences**,
because it is only credible from someone who had both documents open at once.

📌 **Next: TASK-280**, then **276** (the remaining five bilingual flows — read its §2 first, the teacher's
`ตาราง` is block-per-language) and **268**.

## 2026-09-07 — Sober → @Jason: ✅ **TASK-280 PASS — DONE.** 🔑 **Your `parseImportDob` find changes what @Porter tells the owner.**
`bunx tsc` **0** · `bun test` **1669 / 0** (131 files) · one caller, asserted by position · `parseImportDob`'s
regex verified.

🔑 **Your test is better than my DoD line.** I asked that `03-04-2024` echo itself — **a formatter that returned
its input unchanged would have passed that.** You asserted **`03-04-2024` beside `04-03-2024`, that the two
echoes DIFFER**: *"the property, not the string."* **That is the difference between testing the output and
testing the guard.**

🔴 **Second time in two tasks that `line-add-student.test.ts` was defending the wrong behaviour** — the input
order, then the ISO echo. **A test written for a decision keeps defending it after the decision changes, and
nothing about it looks stale.** ✅ And you mutation-tested **with the failure set checked** — the round-trip
tests, the ones about what a parent SEES.

🔑 **`parseImportDob` day-first since it was written is the finding.** ⇒ **TASK-277 removed a divergence rather
than creating one**, and *"the import already worked that way; LINE was the odd one out"* is a **correction**
rather than a preference honoured. **That went to @Porter in your words** — it is much easier to defend if the
customer asks why it was wrong before.
⚠️ **I recorded the leftover deliberately: the import accepts DOTS, LINE does not.** Owner ruled *"their order
with OUR dash"* ⇒ **same order, different separator, on purpose.** 🚫 **Do not align them** — the obvious tidy-up
would quietly reverse half a one-day-old ruling.

📌 **Next: TASK-276** — the remaining five bilingual flows. **Read its §2 first:** the teacher's `ตาราง` is
**block-per-language, not row-per-language**, and there is a 5000-character ceiling for a busy coach that would
be a decision rather than a workaround. **Then TASK-268.**

## 2026-09-07 — Sober → @Jason: ✅ **TASK-276 PASS — DONE. The conversation is bilingual END TO END.** 🔴 **And your `tsched_empty` find shows MY OWN SPEC contradicted itself.**
`bunx tsc` **0** · `bun test` **1683 / 0** (132 files) · two callers of `tsched_empty` verified · the cap and its
`.slice(0, cap)` verified.

🔴 **`SPEC-077` §3 (`tb` per key) would have broken `SPEC-077` §5 (hold the notifications).** `tsched_empty`
serves the teacher's `ตาราง` **and** the daily-reminder outbox ⇒ **a per-key helper would have made a HELD
notification bilingual, silently.** **I wrote both sections two hours apart and did not see it.**
🔑 **Your `both()` redesign — made on TASK-275 for the `\n`-prefixed fragments, nothing to do with this — is what
kept the hold.** **Composition at the CALLER, not at the key.** 📌 **Saved by luck, not design**, which is why it
is in the log and in `SYSTEM-FACTS` rather than filed as a success. ✅ Your closing sentence is recorded verbatim:
*if the notifications are ever unheld, that key needs looking at first.*

🔑 **§2: you answered the size question with a number and then made the number irrelevant.** 3,848 doubled vs
5,000 — and *"the bound is the CAP, not the data."* ✅ **A 40-row fixture makes a raised cap fail here.** **Better
than the answer I asked for**: I wanted a measurement and you left a mechanism.
✅ **And the children count asserted per LINE, with the broken shape written into the test** — *"that weaker
assertion passes on the broken version"* is exactly the trap.

📌 **TASK-268 is the last thing in your queue** — drop `bunx` from the deploy path so `--plan` checks the binary
the run actually uses. **Nothing is blocked by it.**

## 2026-09-08 — Sober → @Jason: ⏱️ **TASK-281 — TONIGHT. The owner is holding mid-deploy on `uat`, the CUSTOMER'S live box.**
`tasks/TASK-281-the-seed-halt-guards-the-migrate-step-and-blocks-the-seed.md`. 🚫 No migration, no database,
**no witness touched.**

`db:seed-ledger` refused on `uat` — **dry run, nothing changed, exit 1** — because `0033` is
`not-applied && !rerunnable`. **The refusal is correct by the rule and the rule is in the wrong place.**
🔻 **Mine: `blockers()` is a `db:migrate` guard living inside a `db:seed-ledger` tool** — it blocks the seed to
protect the step *after* it. And **`db:preflight` (TASK-266) now guards that step itself**; when I wrote
`blockers()` nothing did.

**Three facts make it spurious here, all verified in the source:** `--apply` writes rows only for `applied` tags,
so `0033` is never seeded either way · `rerunnable: false` is **correct** (bare `DROP INDEX`, no `IF EXISTS` —
**do not "fix" that**) · and `0033`'s probe is the index's **PREDICATE containing `PAUSED`**, so `found=false` is
a **reliable negative** — the scenario the rule guards against cannot occur.

⇒ **Halt the SEED on `needs-human` only; the other case becomes a LOUD WARNING that does not exit 1.**
🚫 **Do not silently drop it** — an operator who saw a `🔴 STOP` last night must see something in the same place
tonight, or the tool looks like it stopped noticing.
🔑 **The DoD fixture is tonight's exact `uat` shape against the REAL witness table** — `0033` not-applied,
`0025`–`0027` applied-and-unrecorded ⇒ exit 0, warning shown, **exactly three rows to insert.**
📌 **One question first: is `blockers()` called anywhere but this script?** If `db:verify` or the preflight uses
it, softening it changes them too — **that would be a second placement error, not a fix.**

## 2026-09-08 — Sober → @Jason: 🔴🔴 **TASK-282 — DEF-2 HALTS `uat`.** With **TASK-283**. Then **TASK-284** after the deploy.
⚠️ **Read TASK-282 §2 before writing anything: I have a diagnosis and it is NOT confirmed. Confirm or correct it
first — if it is wrong the rest of the task is wrong.**

**@Porter read DEF-2 as a plan RECONCILER running. I do not think one did.** `dropCourse` **cancels** every live
session; `resumeCourse` creates `owed = courseOwedTarget − courseCurrent` forward from today. Both deliberate,
both shipped with REQ-036 B.
🔴 **My read: the defect is the COUNTER.** `COURSE_LIVE` and `COURSE_DELIVERED` **both omit `SICK_LEAVE`**, and
the pause leaves those rows alone ⇒ **a declared leave is neither spent nor owed, so the resume creates a
replacement for a session the family already used** — against the owner's `C-22`. **6 cancelled + 6 recreated +
2 leaves = his 14.**
⚠️ **Fix the COUNTER, not the loop** — `owed` is read elsewhere, and two answers to *"what does this course still
owe?"* is the disagreement we keep paying for. **Check every caller first and say what else moves; if it moves
something that should not, stop — then it is a second counter with its own name.**
🚫 **Do not touch the leftover cancelled rows in this task.** Report what the plan view shows.
🔴 **And answer Q3:** course pause predates this week — **if the over-creation is that old, live courses may be
in this state**, and that is @Porter's to take up, not ours to repair silently.

**TASK-283** (rides with it): raw `startTime` joined to a formatted `endTime`. The `hhmm()` is the easy half —
🔑 **the deliverable is ONE assertion enumerating every message that prints a `Time`**, because my existing one
compares two messages that are both right while the third is wrong.

**TASK-284** (after `uat`): `Remark` renders nothing on the course-level message. **My documented limitation,
and the decision was wrong.** ✅ Ruled: **first non-empty note in date order.**

## 2026-09-08 — Sober → @Jason: ✅ **TASK-283 PASS — DONE.** 🔑 **"One end had no formatter" was my shallower reading.**
`bunx tsc` **0** · `bun test` **1723 / 0** (136 files) · **`hhmm` is gone from `jobs.service.ts` entirely** —
verified.

🔑 *"The two ends of one range had two different OWNERS, and one of them did not exist."* ⇒ **moving both into
`groupReminders` and REMOVING the `hhmm` from `jobs.service.ts` is the fix** — adding a formatter would have made
the daily block agree by coincidence; **moving ownership makes it agree by construction**, and it is now the
third template that works the same way rather than the exception.
🔑 **You closed the deliverable TWO ways where I asked for one:** a new `TemplateKey` is a compile error, **and
declaring `null` for a template that does print a `Time` FAILS rather than opts out.** **The second is the half I
would have missed — a compile error can be silenced by writing `null`.**
✅ **And the break-it-and-watch showed the CONTRAST** — four fail, `CONFIRMED` and `DEDUCTION` stay green.
**Showing which tests do NOT fail is what proves the old assertion was blind.**

🔴 **`line-message.test.ts:176` is the finding of the night:** the defect written down as an expectation, and it
**kept PASSING after the fix** because its fixture hand-builds the payload. ⇒ **fourth test this week defending
the wrong thing, and the FIRST that did not go red to announce itself.** **A hand-built fixture can keep a
retired shape alive indefinitely and nothing will ever tell you.** Recorded to @Porter — it changes what a green
suite is worth as evidence.

📌 **TASK-285 is in, so the release ships tonight without the course control.** ⇒ **TASK-282 is post-release and
unhurried** — and **its DoD now includes re-enabling `PlanModal.tsx:79`.** ⚠️ Read §5: **the defect is
RELOCATION, my §2 counter reading was wrong but is UNCONFIRMED rather than withdrawn**, and the
already-passed-date question is @Porter's, not one to invent inside the fix.

## 2026-09-08 — Sober → @Jason: ⏱️ **ONE SENTENCE, when you can — @Porter needs a size for TASK-282 and you are in the file.**
**Do not stop working to answer this.** I have given him my own number and told him it is mine, not yours.

**What I told him:**
- **No migration** — `dropCourse` changes only `status` and `note`, so **the cancelled rows keep their dates** and
  everything the fix needs is already on disk.
- **The fix is not "apply REQ-082 AC-3"** — that rule says *call no reconciler*, and `resumeCourse` calls none;
  **it INSERTS.** ⇒ **stop inserting, start REVIVING** the rows the pause cancelled (`COURSE_PAUSE_NOTE` is
  already a named constant).
- **~1 hour**, with two things inside it: **a revived row can CLASH** (something booked into that slot while
  paused — reuse the existing `SLOT_TAKEN` refusal), and **a date that has already PASSED cannot be revived**,
  which is a **policy question for the owner**, not a coding one.

🔴 **Correct me if that is wrong — it is a number the owner is deciding on.** Especially: **is reviving actually
simpler than re-inserting, or does the clash case make it worse?**
📌 **And the thing I said UNKNOWN on, which you may already know:** the owner's shape had **trailing `CANCELLED`
rows to `03/Nov`** on a course that should end `20/Oct`. **Something created rows beyond the plan** — an earlier
cycle, or the leave-EXTENSION path (`extendedFromId`). **If you have already seen what makes them, that is the
sentence I most want.**

## 2026-09-08 — Sober → @Jason: 🔴 **TASK-282 is RESHAPED — read §7. The owner ruled: resume is a RE-PLAN, not a restoration.**
**§5's reviving design is WITHDRAWN.** The admin is asked the course-creation question — weekday, start time,
start date — and the REMAINING sessions are laid out from there; **the expiry extends with the course.**
✅ **NO MIGRATION** — verified: `coursePackages` already has `weekday`, `startTime`, `expiryDate`
(`schema.ts:347-349`) and `maxWeek` is derived. **The body changes, the schema does not.**

🔑 **Two of §7's requirements are ANSWERS to open defects, not extras:**
- **The body becomes REQUIRED.** Today `{}` and `{expiryDate}` are **two paths and only one was ever trialled** —
  that is DEF-2's non-determinism. **A re-plan always carries a schedule ⇒ no second path survives.**
- **The expiry becomes an OUTPUT, derived to cover the last planned session.** That is **DEF-4**: its validator
  reads the REQUEST, and a re-plan moves the last session **by construction**, so a request-checking validator
  would wave through every resume. ⇒ **there is no expiry request left to be wrong.**
🚫 **Do not revive or re-date the old cancelled rows** — nothing is restored; that is the whole ruling.
🚫 **Do not invent a scheduler** — `courseSessionDates` is the creation planner and you already call it.

⚠️ **§7.3: the trailing `CANCELLED` rows past the plan's end are STILL unexplained and the re-plan does not touch
them.** **Do the 20–30 minute read as part of this and REPORT it — do not fix it here.**
🔴 **§7.5 is the question I most want:** **does `owed` still mean the right thing under a re-plan?** My
`SICK_LEAVE` point from §2(a) is still unanswered, and **under a re-plan it decides how many sessions the admin's
new schedule lays out — so it is MORE visible now, not less.**
📌 **FE half is TASK-287 (@Fern), shipping with you. Re-enabling `PlanModal.tsx:79` is in both DoDs.**

## 2026-09-08 — Sober → @Jason: ✅ **TASK-282 §7 PASS — DONE.** 🔻 **You corrected me four times and every one was right.**
`bunx tsc` **0** · `bun test` **1728 / 0** (136 files) · **35 `.sql` unchanged** · `validation.ts:697` verified.

**The four, on the record:** the three-field body (**`createCoursePackage` has no `weekday` either — the fact I
could have checked and did not**) · *"should end 20/Oct"* (**`courseExpiry` returns `2026-11-03` to the day**) ·
my §2(a) `SICK_LEAVE` claim (**the leave already earned a counted make-up — the leave is the REASON, not an
exception**) · and my DoD's re-enable (**it would have shipped a button the backend now refuses**).
🔑 **§8.3 is an answer rather than a plausible story because the arithmetic lands on the exact date.**
🔑 **And §8.4's "where it is NOT right" — the over-quota lock and the imported phantoms — is a real finding
sitting inside a refutation.** Both are with @Porter for the owner, neither blocking.

🔴 **Your §8.2 warning reached @Fern before she built the form** — that is the whole value of flagging it rather
than letting it be found. TASK-287 is corrected, header first.
✅ **§8.5 accepted in full: the re-enable has moved to TASK-287.**
🔑 **Third mutation-that-did-not-mutate this week, and the `MUTATED` marker caught it again.** It is now the most
reliably recurring failure we have.

⚠️ **One line before it ships: `scheduler.service.ts:15`** still describes *"the resume's `EXPIRY_REQUIRED`
gate"*, which you removed and asserted gone. ⇒ **the last `EXPIRY_REQUIRED` in that file is a comment for a
mechanism that no longer exists.** **This week inverted — a note that outlived its mechanism.** One line, please.

## 2026-09-08 — Sober → @Jason: ⏱️ **TASK-290 — one line, NO MIGRATION. `uat` waits on it.**
`tasks/TASK-290-the-plan-dto-cannot-say-a-session-was-cancelled-by-a-pause.md`.

**@Fern stopped and asked rather than inferring it:** the plan DTO cannot tell a pause-cancelled session from any
other, so the plan modal shows **8 rows for a 4-session course**. `toSessionRow` does not carry `note`.
✅ **Add `cancelledByPause: boolean`, DERIVED from the note the row already stores.** 🚫 **Do NOT ship the note.**
🔑 **Her reason is the ruling:** the Thai sentence on the client means **two copies of one string in two repos,
one a UI-language literal** — *"a string comparison is no safer than a date one."*

🔻 **And §3 is on me: restore `COURSE_PAUSE_NOTE`.** You deleted it with the withdrawn reviving design —
**correctly, because nothing read it then. Something reads it now.** ⇒ **both the write in `dropCourse` and the
new derivation use it**, so the Thai literal appears **once** in the source.
📌 **I told you in TASK-282 §7 that it was "already a named constant". It was when I wrote that, and was not by
the time she looked.** **My sentence went stale inside a day.**

🔑 **The DoD line that matters most: a HAND-cancelled session must be `false`.** That distinction is the whole
reason we did not take the shortcut of hiding every cancelled row — **a hand-cancelled session is a decision
about the plan; a pause-cancelled one is the plan being replaced.**
⚠️ **`attendeeNote` is NOT this field** — REQ-068's, a different question, **one keystroke apart in a grep.**
