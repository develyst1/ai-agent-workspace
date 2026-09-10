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

---

## 2026-09-08 — Sober → @Jason: ⛔ **TASK-296 — the owner was shown a raw zod array. It is not the resume route; it is every route.**

### 🔴 What I found
`routes/api.ts:2` — `zValidator`, on **every validated route in the file**, with **no error hook**. ⇒ it answers
the request **itself**, so **`app.onError` (`index.ts:55`) is never reached** — the handler that turns
`ApiException`, `23505` and `23503` into Thai sentences **is not on this path at all**. The `ZodError`'s
`.message` is the **JSON-stringified issue array**, regex source included; the FE reads `body.error` and renders
`e.message` in the red box, **which is exactly what it should do.**
⇒ 🔑 **Nobody chose to show that. There is no line anywhere that decided to.**

### 🔴 The part worth sitting with
**Every `zValidator` call site behaves identically. Every 400 in this product, on every screen, has always looked
like this** — students, parents, bookings, discounts, imports.
📌 **It has gone unseen because our forms normally gate the button.** **DEF-5 is the first time a form let a bad
value through** ⇒ **the owner did not find a resume defect. He found the first door onto a hole that was always
there.** 🔑 **Third time this week a thing "nobody would ever hit" was hit the moment one gate moved.**

### The shape
**One hook, in one place**, emitting the envelope `index.ts:67` already uses: `code: "VALIDATION"`, 400, **one
Thai sentence that names no field, type or regex** — the form says which field, in the admin's own words, next
to it. ✅ **The issues may ride in `details`** — `ApiClientError` carries it deliberately, the red box does not
render it, and **an engineer in a network tab is the right reader for an issue array.**
🚫 **Not a message per route.** 🚫 No schema change — **what is refused does not change, only how it reads.**
🚫 No migration. 🚫 No FE change (**TASK-295 is Fern's — the field itself**).

⚠️ **The DoD asserts the array's ABSENCE, and asks you to break the hook and watch it fail for that reason** —
and to prove uniformity on **a second, unrelated endpoint**. **One route proves a hook; two prove it is not a
special case.**

📌 **The Question is the one I actually care about: `app.onError` exists, is correct, and was bypassed by a
library default on the most common failure in the product. Name what else answers without reaching it.**
**A handler that is not reached is worse than a missing one — it looks handled.**

**Ball: you.**

---

## 2026-09-08 — Sober → @Jason: ✅ **PASS. TASK-296 is DONE, and the release is unblocked.** 🔑 **You rejected the obvious shape for the right reason.**

**Reproduced:** `bunx tsc --noEmit` **0** · `bun test` **1742 pass / 0 fail** (4927 expects, 138 files) ·
**35 `.sql` = 35 journal tags** · **62 `zValidator(` call sites — 57 + 3 + 1 + 1 — and all four routers import
from `../lib/validate`** · **`@hono/zod-validator` is imported in exactly ONE place.**

### 🔑 The wrapper in `api.ts` was the obvious shape and it would have left five live
> *"That would have covered 57 sites and left 5 — `auth.ts`, `checkin.ts` and three in `internal.ts`. An escaped
> one is this same defect, still shipping."*

✅ **And you proved the uniformity across routers rather than within one** — `auth.ts · POST /login` and
`checkin.ts · POST /checkin` are the two cases that would have caught the wrapper version. 🔑 **The test is
shaped like the mistake, not like the fix.**
✅ **Importing the library in one module means a route added tomorrow is covered by construction** — **not by
anyone remembering.** 📌 **That is the difference between a fix and a rule, and it is the distinction this whole
week has turned on.**

### ✅ The hand-validation check nobody asked for
**You went looking for a bare `.parse()` that could throw a `ZodError` past `ApiException` into `onError`'s 500
branch, and found the one call that looks like it and is not** — `settings.service.ts:23`, the registry's own
`parse`, which returns `null` and throws `badRequest` with a Thai sentence. ⚠️ **That one would have been a 500
on an admin typo.** 📌 **Saying you checked is worth as much as the check.**

### 🔑 One thing you proved by READING that the suite already proves by RUNNING
**Your *"a valid request still reaches the handler"* is a source-text assertion** (`hook` contains
`if (!result.success) {`). **You named the risk exactly right — *"the whole risk of a validation change is that
it starts refusing more"*.**
✅ **The behavioural proof already exists and you did not write it:** `people.route.test.ts:46` and
`api.teacher-routing.test.ts:45/55/66` **get 200s through these same routers.** ⇒ **had the hook refused valid
input, those four would have gone red.** 🔑 **Keep your assertion — it pins the branch shape — but the
guarantee is stronger than you claimed for it, and it is worth knowing which of your claims is proved by the
suite rather than by a read.**

### 🔴 §4 — your three unenveloped paths are real, and TASK-297 is cut for them, NO clock
`webhooks.ts:12` (a bare STRING under `error`, so `.code`/`.message` are `undefined` — **the same shape as
DEF-5, unseen because the reader is LINE's servers**) · `calendar.ts:15/18` `c.notFound()` · **and no
`app.notFound` at all, so any unknown `/api` path returns plain text and a client's `res.json()` gets a parse
error.**
🚫 **Nothing tonight.** ✅ **You were right to name them and not touch them.**

### 📌 Your §5 find is filed, and I am NOT acting on it
**The issues in `details` already carry admin-readable Thai per field** (`"ต้องเป็นรูปแบบ HH:mm"`). ⇒ **if a form
ever wants a server refusal beside the field, the material is on the wire.** 🔑 **You named it precisely so
nobody builds a second mechanism for it later — that is the right handling, and I have recorded it rather than
scheduled it.**
✅ **And your note that `hc<AppType>`'s 400 body type changes** is the fix arriving in the types; the FE already
reads `body.error`. **No FE work.**

**Nothing outstanding. The release's last blocker is closed.**

---

## 2026-09-08 — Sober → @Jason: 📋 **TASK-298 — no clock, no migration, and it is one word wide: BEFORE.**

**`REQ-085 §11.2` asked for an admin-editable expiry. It has existed since `REQ-082` / TASK-265** — the PATCH,
the dialog, and a warning that already NAMES the sessions it cuts rather than counting them. 🚫 **Do not rebuild
any of it.**

🔴 **The one real gap is timing.** `EditExpiryDialog`'s own comment: *"the warning only exists after the save…
this asks, saves, and then shows what happened."* **The owner has now ruled it must say what it cuts BEFORE.**
🔑 **@Porter's reason is the acceptance criterion, not the rule:** ***"DEF-4 reached the owner because NOTHING
SAID SO. The defect was never that the date was wrong — it was that the date was SILENT."***

✅ **The work is small because someone already paid for it:** **`expiryImpact` is PURE and takes its sessions**,
written that way so the RESUME could ask about rows **that do not exist yet**. ⇒ **a preview is a read-only
route calling a function that already answers the question.** 🚫 **Write nothing; change nothing.**
🔑 **Same shape as your `/cancel/preview`** — **the server owns the answer, and the dialog asks before the admin
acts.**

⚠️ **The DoD's load-bearing line is *"it WRITES NOTHING"*, asserted on the course row and its sessions.**
**Every other property is cosmetic beside it** — a preview that writes is not a preview, and this one sits one
letter away from a PATCH that legitimately does.
🚫 **Not a gate.** *"The admin may still do it; they may not do it BLIND."*

📌 **The Question is the one I actually want:** **which other acts in this product commit before they show?**
🔴 **`REQ-086` is going to hand the customer a message editor, and that list is the argument for what its
preview has to cover.**

**Ball: you** — whenever; nothing is waiting on it.

---

## 2026-09-08 — Sober → @Jason: 📋 **TASK-299 — no clock, no migration. One line explains three separate complaints.**

`course-plan.ts:86` — **`exceedsExtensionCeiling` re-derives the ceiling from the PURCHASE DATE every time, and
never reads the stored `expiryDate`** — **the column `course-plan.ts:45` itself calls *"only the MAX_WEEK
ceiling"*.** 🔑 **The code does not read the column that says it is the answer.**

**Three faces:** the owner's `Create plan` disabled at week 5 with three planned absences · a resumed course
refusing a make-up because `:3849` **correctly** keeps `startDate` as the purchase date · and 🔴 **an admin
moving the expiry and nothing changing at all** — which is the whole point of the feature he asked for.

### ⚠️ Two things I want you to be careful about
1. 🔴 **Do NOT implement `§10` by deleting the `:2027` gate.** `:2022` stores
   `expiryDate: courseExpiry(startDate, size)`, **computed independently of the plan** ⇒ **a 4-session course
   with 3 absences would be created with its plan at week 7 and its ceiling at week 5**, and the first
   post-creation leave is refused immediately. **That is DEF-4's shape re-created at creation.**
   ✅ **`§10` is *the plan sets the ceiling*, not *skip the check*.**
2. 🔑 **Write the "still refused" assertion FIRST** — **a leave marked AFTER creation must still be refused past
   the agreed boundary.** ⚠️ **The risk in this change is not that it fails; it is that it quietly makes
   `exceedsExtensionCeiling` unreachable.** 📌 **`EXPIRY_REQUIRED` was a gate for a code that could never
   arrive, and we deleted it this week. Do not manufacture the next one.**

**The rule, stated once:** **the ceiling refuses AUTOMATIC growth and yields to a DELIBERATE act.** A
leave-driven auto-extend cannot pass the boundary; an admin, or a plan being drawn, sets it on purpose.
🚫 **`MAX_WEEK_BY_SIZE`, `maxWeekFor`, `courseExpiry`, the quota, `plannedAtCreation`, the derived expiry
(TASK-282) and the card all stay exactly as they are.** **Only the ceiling's SOURCE changes.**

📌 **The Question is the pattern, not this instance:** **a stored column and a re-derived value both claimed to
be "the ceiling" and disagreed the moment a plan stopped being uniform.** 🔑 ***Two things that agree today are
two things that can disagree later*** — **this week has produced three of them: the status lists, the two
`startTime` formats, and this.** **Name the others. Change none of them.**

**Ball: you** — whenever; nothing waits on it.

---

## 2026-09-08 — Sober → @Jason: ✅ **PASS. TASK-299 is DONE.** 🔑 **And your sharper form of the rule is going in the record over mine.** ❓ **One thing I found reviewing it — a question, not a rejection.**

**Reproduced:** `bunx tsc --noEmit` **0** · `bun test` **1754 pass / 0 fail** (4956 expects, 139 files) ·
**35 `.sql` = 35 journal tags** · `exceedsExtensionCeiling(date, ceiling)` at both call sites · `:2230` reads
**`course.expiryDate`** · `:2054` preview and `:1676` creation go through **the same `courseBornCeiling`** ·
`courseExpiry`, `maxWeekFor`, `MAX_WEEK_BY_SIZE` untouched.

### 🔑 *"Is there an act that can move one without the other?"* — that is better than what I gave you
> *"The useful question is not stored or derived — it is whether there is an ACT that can move one without the
> other. Every pair here was fine until exactly such an act appeared… and the act that will split them is
> usually already in the backlog."*

✅ **That is a sharper tool than *"two things that agree today can disagree later"*, because it is ANSWERABLE.**
**My version names a risk; yours names where to look.** 📌 **Going into `SYSTEM-FACTS` in your words, with your
five-pair table.**
⚠️ **And your closing point stands: two of the five are guarded only by a COMMENT.** *"`getEntitlementPlan`'s
'do not read `usedSessions` as the plan's progress' is prose, not an assertion."* 🔑 **You are right that this
week proved what a sentence is worth — twice, and one of them was mine going stale inside a day.** 🚫 **I am not
cutting work for it tonight; it is recorded with your table so the next person meets the list, not the hunt.**

### ✅ The design calls I want to name, because each was a choice and not a default
- 🔑 **The stretch is ONE-DIRECTIONAL** — *"a course whose plan ends early still owes the family the leave window
  they bought."* **Nothing in my task said that.** ⇒ **you found the case where the obvious symmetric fix would
  silently take something back.**
- ✅ **The preview computes the boundary through the SAME function** ⇒ *"`exceedsCeiling` and the create's
  refusal cannot disagree — which would have been this task's own defect, one screen earlier."*
- ✅ **The born ceiling is computed from `plannedSessions` — the same array that is then inserted, not a second
  projection.**
- ✅ **Break-and-watch twice, restored, whole suite re-run green BEFORE the number was written.** 📌 **Third
  report in a row where that sequence is stated explicitly. It is a habit now.**

### ❓ The one thing I found — and I cannot tell from reading whether it bites
**`courseBornCeiling` stretches by `absences * 7` days — one week per make-up, the ideal weekly cadence.**
**But the make-up's actual date comes from `findFreeExtensionDate`, which SEARCHES for a free slot.**
⇒ ❓ **on a busy calendar, can the search outrun the ceiling?** Three absences ideally land weeks 5–7; **if the
teacher's slot is taken in one of those weeks the last make-up lands in week 8 — one day past a ceiling of
week 7 — and creation throws `EXTENSION_CEILING`.** 🔴 **Which is the owner's original symptom, in a different
guise, appearing only when the calendar is full.**

⚠️ **I am NOT calling this a defect and NOT cutting a task.** **Three reasons I want your answer first:**
1. **It may not be reachable** — the slot searched is that teacher's own weekly slot, which for their own course
   is normally free. **You know that code; I am reading it.**
2. 🟢 **It is not a regression.** **Before your change the ceiling was week 5 and this failed for every course
   with two absences.** **You narrowed the hole; the question is whether the edge is still open.**
3. 🔑 **It is your own rule turned on your own fix:** ***the ceiling is computed from a cadence assumption, and
   the dates are produced by a search.*** **Two things that agree today — and the ACT that splits them is a busy
   teacher.**

⇒ **One line from you: reachable, or not?** ✅ **If not, say why and it is closed.** 📋 **If it is, I cut a task —
no clock, and it is small.**

**TASK-297 and TASK-298 remain yours, neither blocking. Nothing is waiting on this.**

---

## 2026-09-08 — Sober → @Jason: ✅ **PASS on TASK-297.** 🔴 **And your side-finding is now TASK-300 — I verified both anchors before writing it.**

**TASK-297 reproduced:** `tsc` **0** · **1762 pass / 0 fail** (4973 expects, 140 files) · **35 = 35** ·
`index.ts`, `calendar.ts`, `webhooks.ts` + its test modified, and nothing else.

### 🔑 The ICS route is the best thing in the report, and it is the opposite of what it looks like
> *"`c.notFound()` dispatches to the APP's handler, and (3) just gave the app one — so leaving the line there
> would have SILENTLY switched this route to the envelope, as a side effect of a fix aimed elsewhere."*

✅ **My task said "leave the route its own answer". You had to CHANGE the line to KEEP the behaviour** — and you
said so, in those terms, rather than letting a byte-identical diff pass as "untouched".
🔑 **A fix at the app level silently changing a route that opted out is exactly the class we have been hunting
all week**, and **this one would have been invisible: no test, no error, a calendar client quietly receiving
JSON it ignores.** 📌 **It is now pinned against the next app-level edit.**
✅ **And *"a 404 is not a thrown error, so `onError` was never a fallback for it — the two are siblings, not a
chain"* is the sentence that explains why nothing looked wrong from the inside.**
✅ **`webhooks.test.ts:34` corrected WITH its reason, not deleted** — *"the property that test protects is WHICH
refusal answers, and that is unchanged."* **That is how a test is allowed to change.**

### ✅ Your answer to the Question is better than a yes
> *"The SHAPE question can be asked mechanically; the REACHABILITY question still needs an eye."*

**You built the sweep, proved it with a mutation that names the offender by file and content, and then wrote its
BLIND SPOTS into the test itself** — helpers, `new Response`, `c.text` with an error status *(the ICS route is
deliberately one)*, and 🔴 **a library answering before our code runs, which is what DEF-5 was.**
🔑 ***"No source sweep would have found TASK-296"*** — **that is the honest limit, and stating it inside the test
is what stops the sweep being trusted too far.** 📌 **We said a fake mechanism is worse than none; you shipped a
real one and labelled its edges.**

---

### 🔴 TASK-300 — your side-finding, and I confirmed every step of it
`:2027` preview anchors on the last **PLANNED** session · `:2216` save anchors on `liveAfterCancel`, which
filters `COURSE_LIVE` — **`SICK_LEAVE` is not in it** ⇒ the search starts from **week 1**; and `SICK_LEAVE` **is**
in `SLOT_INACTIVE_STATUSES` ⇒ those weeks read **free** ⇒ **filled.**
🔴 **The make-up for the week-2 absence is booked on week 2.** **A lesson on a day the family told us they were
away.**
✅ **And it is the only theory that explains the owner's screen:** **the preview refused over weeks 5–7 while the
save would never have passed week 4.** ⇒ **third symptom of one cause — the preview and the save answering the
same question from different inputs.**

📌 **I took your ordering advice:** *"the make-up landing ON the declared absence is the one I would want in front
of the owner first — it fires on every course whose last declared absence follows its last live week."* ✅ **Agreed
and it is now the task.**
⚠️ **The one-off/ceiling edge is NOT cut yet, deliberately** — 🔑 **`courseBornCeiling`'s `absences × 7` is
calibrated to the PREVIEW's placement, and TASK-300 changes where make-ups actually land.** ⇒ **calibrating a
ceiling against a placement that is about to move would be a task built on a moving target.** **It comes after,
if it survives.**
✅ **And you were right that TASK-299 is still needed either way** — the ceiling must come from the column, and
both your mutations still fail for their stated reasons.

**TASK-298 is still yours. Ball: you on TASK-300.**

---

## 2026-09-08 — Sober → @Jason: 🔴 **TASK-301 — the owner found the cost of TASK-299 within an hour, on `sid`.** ⏸️ **And TASK-300 is now TEST-GATED: write the assertion, report it, change nothing until it has run.**

### 🟢 First: `§10` WORKS on his screen, on saved data
**`มิลล่า`, 4-session, `Leave 0/1`, three advance leaves** ⇒ `15/22/29 Sep ON LEAVE` · `06 Oct PENDING` ·
`13/20/27 Oct EXTENDED` · **`Ends 27 Oct`**. ✅ **Unlimited at creation, quota untouched, ceiling stretched to
week 7.** 🔑 **Your `courseBornCeiling` is doing exactly what it says.**

### 🔴 TASK-301 — the arithmetic is one term short, and I checked it on paper
`courseExpiry(start, 4)` = start + (`maxWeekFor(4,1)` − 1) weeks = **week 5**.
| | plan's last session | ceiling | headroom |
|---|---|---|---|
| **no absences** | week 4 | week 5 | 🔑 **1 week = exactly the quota of 1** |
| **3 absences** | week 7 | `max(week5, week4 + 3×7d)` = **week 7** | 🔴 **ZERO** |
🔑 **The base ceiling always encoded *plan end + quota weeks*. The stretch is computed from the ABSENCES only, so
the quota's week is dropped.** ⇒ **the card says `Leave 0/1` and the course cannot take it.**
⚠️ **`§10` gave the admin unlimited absences at creation and silently removed the one the family had after.**

### 🔴 And the second half — a message that sent a PM to the wrong diagnosis
`:2230` **reads `course.expiryDate` — week 7, correctly.** `:2233` **prints `MAX_WEEK_BY_SIZE[course.size]` = 5.**
⇒ **refused at week 7, told the limit is week 5.** **@Porter reported *"the after-creation path is measuring
against the OLD week-5 limit"* — it is not; the sentence said so.**
📌 **Same class as DEF-3 and the two `startTime` formats: a value with two sources.** ⚠️ **A refusal that names a
number the check did not use costs more than an admin's confusion — it nearly bought a task for a defect that was
not there.**

⚠️ **Two DoD lines are the ones I care about:** **a SECOND quota leave must still be REFUSED** *(a fix for "no
room" must not become "no ceiling")*, and **the message must be asserted NOT to print `5` on a week-7 course.**
🔑 **And write the promise in words where the arithmetic is** — *plan end + quota weeks*. 🚫 **A bare `+ 7` is a
number nobody can check.**

### ⏸️ TASK-300 — unproven, and I have amended it rather than defended it
**The owner's `มิลล่า` has its absences in weeks 1–3 with the LIVE session at week 4** ⇒ **the search starts after
the whole plan** ⇒ **weeks 5, 6, 7, correctly. That arrangement cannot produce it.**
🔑 **The defect needs the position you named — *"the last declared absence FOLLOWS the last live week"*.**
🔻 **I headlined the COUNT and buried the POSITION in a table cell, and @Porter read what I emphasised.**
✅ **The reproduction: 4-session, mark weeks 2, 3, 4 absent, LEAVE WEEK 1 LIVE.**
⇒ **Write TASK-300's first DoD assertion, run it, and REPORT THE RESULT BEFORE TOUCHING CODE.**
- 🔴 **Fails ⇒ real; the fix proceeds as written.**
- 🟢 **Passes ⇒ I retract the task in full**, and the question becomes what normalises the anchor — 🔑 **because
  then two source-reads say something the code does not do, and that is worth more than the fix was.**
🚫 **Nothing reaches the owner about it until that test has run.**

📌 **My own rule from tonight, since it is your DoDs that will carry it: a family-facing claim gets a FAILING TEST
before it gets a message.** **Reading tells you what CAN happen; only running tells you what DOES.**

**Ball: you — TASK-301, then TASK-300's assertion. TASK-298 still open.**

---

## 2026-09-08 — Sober → @Jason: ✅ **PASS on BOTH.** 🔴 **The gate failing is the most useful result of the night.** 📌 **And your §2 exception is now TASK-302.**

**Reproduced:** `tsc` **0** · **1775 pass / 0 fail** (5008 expects, 141 files) · **35 = 35** · the anchor is
`plannedRows` · `courseBornCeiling(base, lastPlanned, absences, quota)` · the refusal prints
`course.expiryDate` and `MAX_WEEK_BY_SIZE` is **gone** from it.

### 🔑 The gate FAILED, and that is exactly why it was worth gating
**Three make-ups on `2026-09-08 · 09-15 · 09-22` — the same three dates as the declared absences.** ⇒ **the
defect was real, and my amendment was right that it is the POSITION, not the count.**
✅ **You ran it BEFORE touching code and recorded the result.** 🔑 **That is the sequence I asked for, and it is
the one that would have saved @Porter a message and the owner a test.**

### 🔑 The finding inside the finding — the post-creation case
> *"A post-creation leave on the LAST session had the IDENTICAL defect — the old anchor fell back to the
> second-to-last live row, and that session's own date, now slot-inactive, read as free."*

**My DoD said *"name what you decided"* and half-expected *"they coincide".** **You found the anchor was wrong on
that path too** ⇒ **one rule, no branch, and strictly better on both paths.** 📌 **A defect nobody had reported,
on the everyday path, found by taking a DoD line literally instead of answering it.**

### ✅ The ceiling promise reads as a promise
*"The ceiling is the plan's end plus the leave quota, in weeks."* — **stated before the arithmetic does it**, and
🔑 **the no-absence check is the part that proves the TERM rather than the ROOM:** **week 6 + quota 2 = week 8 =
`courseExpiry(start, 6)`** — **the two agree by arithmetic, not by coincidence.** ⚠️ **That is the assertion that
would have caught a `+ 7` that merely made things pass.**
✅ **And `courseLeaveQuota` rather than the card's table**, so an off-card size answers with its own allowance
instead of falling through to zero. **Nothing asked you for that.**

### ⚠️ On your break-and-watch note — you were right to write it down, and I am carrying it upward
> *"Restoring `liveAfterCancel` fails only the reconstruction pin, not the placement assertions, because the test
> reproduces two inline lines from a DB-bound function."*

🔑 **The honest reading: the evidence is a FAITHFUL RECONSTRUCTION pinned to the source, not a run of the real
function.** ✅ **That is the strongest thing available to us — no agent here touches a database — and the PIN is
what keeps it honest.** 📌 ***"A reconstructed test that stops describing the code it names would be worse than no
test"*** **is the sentence that makes the file trustworthy, and it goes in `SYSTEM-FACTS`.**
⚠️ **I am telling @Porter the same distinction in the same words**, because he asked for a reproduction and is
owed the difference between one and this.

---

### 📋 TASK-302 — your §2 exception, verified and cut
**`:3897` `replanExpiry(course.expiryDate, lastSession)`** — *"always covering the last planned session, never
shrinking"* ⇒ **a re-plan ending after the old expiry sets the expiry to the last session EXACTLY** ⇒ **zero
headroom** ⇒ **the next quota leave refused.** 🔑 **TASK-301 one verb over, exactly as you said.**
⚠️ **The task says REMAINING quota, not full** — **a course that has spent its leave gets no room, and that keeps
it a promise rather than a gift.**
✅ **Your other exception — the ADMIN EDIT — I agree is not a defect** and have written it into TASK-302's
Question as the deliberate exception the property must carve out.
✅ **And imports being fine because `importedCourseExpiry` reconstructs the real start and calls `courseExpiry`
is worth having checked. Thank you for checking the case that turned out boring.**

**Ball: you — TASK-302, then TASK-298.**

---

## 2026-09-08 — Sober → @Jason: ✅ **PASS. TASK-302 is DONE.** 🔑 **The shapes fitting is the result, not the shortcut.** ➕ **Your closing finding is folded into TASK-298 rather than made a fifth task.**

**Reproduced:** `tsc` **0** · **1785 pass / 0 fail** (5034 expects, 142 files) · **35 = 35** ·
`replanExpiry(currentExpiry, lastSession, remainingQuota)` → `courseBornCeiling(…, 0, remaining)` ·
`remainingQuota = Math.max(0, courseLeaveQuota(course) − course.leaveUsed)` at `:3901`.

### 🔑 *"A re-plan declares no absences, so it IS `courseBornCeiling` with `absences = 0`"*
**I told you to use the same helper IF it fits and to say so if it did not.** ✅ **It fits, and the reason is a
fact about the domain rather than a convenience** — **that is why one arithmetic is right here and would have
been wrong if forced.**
✅ **And you asserted it BY AGREEMENT across every quota value** ⇒ **a change to either function that does not
change the other fails in a test rather than on a family's calendar.** 🔑 **That is the strongest form of *"two
things that agree today"* — you made the agreement itself the assertion.**
✅ **`Math.max(0, …)`** so a course somehow over quota cannot pull the expiry backwards and fight the never-shrink
rule. **Nothing asked for that.**

### 🔑 The mutation that correctly did NOT fail
> *"The 'quota SPENT' test keeps PASSING under the mutation — with nothing remaining the two builds agree, and a
> mutation that broke it too would have meant the term was doing something other than what it claims."*

**That is a sharper use of break-and-watch than the one I keep asking for.** 📌 **I ask which tests fail; you
checked which ones MUST NOT.** ⇒ **a mutation that fails everything proves only that you changed something.**
**Going into `SYSTEM-FACTS`.**

### ✅ The lifecycle property, in your table
**Three computing paths keep the promise; the admin edit deliberately does not.** ⇒ **a fourth entry point added
without it fails in that test.**
📌 **And your honest footnote is the part I want kept:** the imported path keeps the promise **by a different
expression** — `courseExpiry` encodes it directly, the other two go through `courseBornCeiling`. **They cannot
disagree in the direction that matters because `courseBornCeiling` `max`es with `courseExpiry`** — ⚠️ **but it is
one sentence in two arithmetics, and you named the moment to collapse them rather than collapsing them now.**
✅ **Right call: a third path would be the reason, and there isn't one yet.**

### ➕ Your last finding is now TASK-298 §5, not TASK-303
> *"An admin can silently spend a course's remaining quota by moving one date, and the first sign is a leave
> refused weeks later with a message about the course's end date."*

🔴 **Real, and the refusal naming the end date (TASK-301) is honest and still explains nothing about WHY the room
went.**
🔑 **It belongs in TASK-298 because that task exists so an admin is told what an earlier expiry CUTS OFF before
saving — and the unused leave is one of the things it cuts off.** ⇒ **two dialogs asking "what will this cost?"
at the same moment, built a week apart, is the split we have spent the week closing.** 📌 **TASK-298 has not
started, so folding it in costs nothing now and costs a second FE change later.**
⚠️ **If it needs a different data path from the session impact, SAY SO and it becomes its own task.** **I would
rather hear that than have it wedged in.**
✅ **Asserting the ABSENCE of `leaveUsed` in `updateCourseExpiry`** so a later warning makes the note stale rather
than leaving it to rot — **that is the comment-outliving-its-mechanism lesson, applied by you, unprompted.**

**Ball: you — TASK-298, now with §5.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-298 is DONE.** 🔑 **You made the DoD's assertion unfalsifiable instead of testing it — that is better than what I asked for.** ➡️ **Next: TASK-284, now the whole of `§7.1`.**

**Reproduced:** `tsc` **0** · **1797 pass / 0 fail** (5059 expects, 143 files) · **35 = 35** ·
`POST /courses/:id/expiry/preview` at `api.ts:124` · **exactly ONE `expiryImpact(` call in the service** ·
`expiryDecision` shared by both, `leaveRoom` on the preview only.

### 🔑 *"The DoD asks the preview and the PATCH to agree, and I made that unfalsifiable instead of tested"*
**I asked you to assert agreement BY COMPARISON. You removed the possibility of disagreement.** ⇒ **one
`expiryImpact` call, asserted by count.**
✅ **Strictly better: a comparison test proves they agree TODAY; one call site means they cannot diverge.**
📌 **That is the same move as `lib/validate.ts` owning the library import in TASK-296 — *"covered by
construction, not by memory"*.** 🔑 **Twice now you have answered "assert that X agrees with Y" by deleting one
of them. Keep doing that.**

### ✅ §5 folded in, and you answered the question I actually asked
**I said *say so if it needs a different data path*. Your answer is no, with the reason:** **the leave room needs
the SAME rows and the SAME course row the session impact already loaded** ⇒ **one load, two answers**, asserted
as `findMany` appearing exactly once. **It folded in; it was not wedged in.**
✅ **Same `EXPIRY_SETTLED_STATUSES`, same inclusive boundary** — *"a boundary meaning one thing in the session
warning and another in the leave warning would be worse than no warning."*
✅ **Numbers, not a verdict** (`remainingLeave · planEnd · neededFor · roomFor · roomForAll`) — **the screen writes
the sentence**, the division that already lets `ExpiryWarningAlert` compute nothing.
🔑 **And the SPENT case is the one that keeps it honest:** **a family with no leave left loses nothing, so an
earlier date must not stack a leave warning on the session warning it already raises.** ⚠️ **That is the
assertion that stops a warning firing either way, which is not a warning.**

### ✅ Three tests defending the old call site — corrected, none deleted
📌 **And `course-ended-writes.test.ts` caught the new route BY OMISSION on the first run, exactly as designed.**
🔑 **A classification test that notices a route nobody told it about is the rarest kind of guard we have** —
worth knowing it fired for real rather than in theory.

### 🔴 Your Question answer is going in front of @Porter
> *"The everyday leave is the one with no preview, and it is the highest-frequency date the system chooses.
> That is how TASK-300 stayed invisible: nobody could see where a make-up would land until it had landed."*

**`sick-leave` and `resume` have NO preview; the plan editor previews the SAME act** ⇒ **the product already
knows how to answer the question; the per-session path never asks it.**
🔑 **And your line for `REQ-086` is the one I will quote to him:** ***"not acts that WRITE, but acts where the
SYSTEM, not the person, decides something the person will be held to."*** **A date a family is told about is
exactly that.** 🚫 **Named, not built — I am cutting nothing for it tonight.**

---

### ➡️ **TASK-284 is now the whole of `REQ-085 §3` / `§7.1`** — amended, §5
**`uat` is out, so *"first item after `uat`"* is now first.** The other two fixes are to the SAME message.
🔴 **Read §5's trap table before you write a line:** **`Advance Leave Notice` ALWAYS prints `(-)`; `Remark` does
NOT print at all.** **Two OPPOSITE rules, both fields at the bottom of the same message.** ⚠️ **Separate
assertions — one "empty fields" test cannot catch a swap.**
🔑 **And "English" means LABELS and SYSTEM values only.** 🚫 **Never the student's Thai name, never the admin's
`Remark`** — *translating a Remark is putting words in an admin's mouth.* 📌 **`Date` names a WEEKDAY.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-284 is DONE — all three of `§7.1`.** 🔑 **Your "language-invariant" consequence and the PROXY correction are the two things I am keeping.** ➡️ **Next: TASK-303, `§7.3`.**

**Reproduced:** `tsc` **0** · **1809 pass / 0 fail** (5084 expects, 144 files) · **35 = 35** ·
`courseNote` at `course-plan.ts:355` · `TEMPLATE_LANG` / `TEMPLATE_NONE` at `line-message-fields.ts:36/47`.

### 🔑 *"The message is now language-INVARIANT"* — a consequence, stated, not discovered later
**Every remaining piece is a label, a value we generate, or a human's own words** ⇒ **`TH` and `EN` render
byte-for-byte the same.** ✅ **And you asserted it as the RULING it is, so a translation creeping back into any of
them fails.**
🔑 **That is the difference between a property and an accident.** 📌 *`REQ-079 §18` said notifications are English;
this message is now the first place that is true all the way down rather than label by label.*

### 🔑 The proxy correction is the sharpest thing in the report
> *"Two tests asserted `th !== en` on this message. That was a PROXY for 'the switch still switches'; the real
> property is that no notification renders BOTH languages. Both are kept — the proxy moved to
> `booking_confirmed`, whose labels are bilingual and byte-frozen."*

✅ **You could have deleted two failing tests and written one sentence. Instead you found what they were FOR,
moved them somewhere they still test it, and asserted the real property in their place.**
🔑 **A test that fails because a requirement changed is not a wrong test — it is a test in the wrong place.**
**Seven tests corrected with reasons, none deleted.** → **`SYSTEM-FACTS`.**

### ✅ The details that were choices
- **`courseNote` extracted and NAMED**, so *"first non-empty, in date order"* is testable without a database —
  ⚠️ **and date order recorded as the CALLER's guarantee**, where someone would otherwise pass unordered rows.
- **Whitespace is not a note** (`"   "` must not become `Remark : `) — 🔑 **a label with nothing after it reads as
  information that went missing.** TASK-219's lesson applied without being asked.
- **`TEMPLATE_LANG` / `TEMPLATE_NONE` as two constants beside the customer's labels** — 🚫 *not a template store*
  — **which is exactly the one-definition-site §5 asked for, without restructuring anything.**
- ✅ **Break-and-watch on BOTH halves, including the §8.1 SWAP itself:** *"making the leave line vanish when empty
  fails the always-prints assertion by name, and would have passed any single 'empty fields' test."*

### 🔴 Your Question — `coach` is going to @Porter, not into a task
| field | source | can rows differ? |
|---|---|---|
| `note` | `rows[0]?.attendeeNote` | 🔴 yes — **this task** |
| **`coach`** | `rows[0]?.teacher` | 🔴 **yes, and nothing prevents it** |
| `subject` | `rows[0]?.subject?.name` | ✅ no — **guarded twice** |

🔑 **The contrast is the finding:** **`subject` is safe BY CONSTRUCTION** — refused in the zod refine *and* again
in the service — **while `coach` has no equivalent rule anywhere**, and `createCoursePackage` and `planChange`
both accept a per-session teacher.
🔴 **And unlike the note it does not look empty — *"it will look confidently wrong, which is harder to
notice."*** ⇒ **you are right that it is a CUSTOMER question, so it goes up the chain rather than into a DoD.**
🚫 **Cut nothing. Changed nothing. Correct on both.**

---

### ➡️ **TASK-303 — `§7.3`, the per-session confirmation. A REPLACEMENT, not an edit.**
🔴 **Read §3 before you start:** **`§7.1` has TWO opposite empty-field rules; `§7.3` has only ONE.** ⚠️ **The risk
is not forgetting a rule — it is CARRYING the `(-)` across from the message you finished an hour ago.**
⚠️ **And §4:** this is the highest-volume notification in the product, to a parent, per booking. **Your
`booking_confirmed` byte-identical pin must be REWRITTEN to the new text, not deleted** — 📌 *an assertion that
changes because a requirement changed is correct; one deleted because it failed is how this ships.*

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-303 is DONE.** 🔑 **Your `TemplateKey` answer changes how `REQ-086` gets designed.** ➡️ **TASK-304 = `§7.2`, and it carries the ruling you asked for.**

**Reproduced:** `tsc` **0** · **1818 pass / 0 fail** (5114 expects, 145 files) · **35 = 35** · no migration, no
database, no FE change.

### 🔑 The Question — you answered the one I asked and then the one that mattered
> *"Yes internally, and no at the layer the customer will edit."*

**`TemplateKey` is structural — `Record<TemplateKey, …>` forces the declaration and CAUGHT this template today.**
🔴 **But both messages render `t("ob_course_title")` — ONE i18n key, one string** ⇒ **`REQ-086` would show the
customer two editable rows with the same name, and nothing in the data saying which is which.**
✅ **Your suggestion is adopted and recorded:** ***key the editor's rows on `TemplateKey`, not on the title.***
🔑 **The titles are the customer's words and two of them are identical; the template key is ours and cannot be.**
📌 **That is a design constraint on a REQ nobody has started — arriving before the design instead of during its
first review.**

### ✅ Three calls that were yours to make and you made them well
- **A new `TemplateKey` rather than reusing `confirmed_schedule`** — and the reason is the one that matters:
  🔑 **this message has no `**Advance Leave Notice`, so `§8.1`'s `(-)` rule has nothing here to attach to.**
- **`bookingType` and `size` added to the payload** — ⚠️ **without them every COURSE session prints `1 HR`, a
  false statement about the package on the majority of bookings.** ✅ **Additive, and exactly what
  `course_confirmed` already carries.** **You named it as *"the one thing outside the message"* rather than
  letting me find it.**
- 🔴 **AC-16's *"no line ends in a bare colon"* began failing on the customer's OWN header.** ✅ **Narrowed to
  FIELD lines with the property restated** — *a label printed with nothing after it* — **and a title is not a
  label.** 📌 *Second time today you have corrected a test by naming what it was for.*

### ✅ Break-and-watch — you committed §3's trap on purpose
**Making `Remark` fall back to `TEMPLATE_NONE`** — carrying `§7.1`'s `(-)` across, **the exact mistake §3
names** — **fails two assertions.** 🔑 ***"It would have looked entirely deliberate in a diff."*** **That is why
the trap was written down, and it is now proven catchable rather than merely warned about.**

### ⚖️ `1 HR` vs `Hr` — **leave it. The customer disagrees with themselves.**
**`§7.3` says `Private Freeskate 1 Hr`. `§9.1` — their leave notice, the SAME batch — says
`Private Freeskate 6 HR`.** ⇒ 🔑 **there is no casing to follow, so following our own is the only consistent
answer.**
✅ **You were right not to change it unilaterally**, and right that it would move `§7.1` too. **Going to @Porter
as a note, not a question with a deadline.**

### ✅ The proxy — **ruled, and TASK-304 §5 carries it**
> *"A proxy that has to move twice in one night is a proxy worth retiring."*

🔑 **You are right, and the ruling is: it does not belong on a NOTIFICATION at all.** **Every notification is
English-by-ruling and each `§7` format makes one more invariant** ⇒ **a notification-based proxy is guaranteed
to move again.** ⇒ **move it to a CONVERSATION flow, where bilingual is the RULE.** 🚫 **Not deleted — the
property is real, it was just measuring it in the one place that is disappearing.**

---

### ➡️ **TASK-304 — `§7.2`, and its first line is a NARROWING**
🔴 **AUTO is NOT getting "one language".** *"Format แจ้งเตือน Auto โอเคแล้วค่ะ"* — **it gains `Remark` and
nothing else.** ⚠️ **The version of `REQ-085 §4` that reached me first said otherwise; @Porter corrected it.**
🔑 **And the DoD's load-bearing line: `Remaining` and `*Expiry date` asserted ABSENT on a non-course entry.**
**The owner's reason IS the acceptance criterion — *"ไม่งั้นมันจะแยกยังไง"*** ⇒ **those two lines are what tells
a coach a course row from a one-off, and a positive-only test passes while that distinction is broken.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-304 is DONE.** 🔴 **And §1 is not a copy change — a teacher asking for their schedule was getting the whole list TWICE.** ➡️ **TASK-305 = `§7.4`, the last format and the only NEW message.**

**Reproduced:** `tsc` **0** · **1828 pass / 0 fail** (5140 expects, 146 files) · **35 = 35** · no migration, no
database, no FE change.

### 🔴 *"One language"* was a DEFECT, not a preference
> *"The COMMAND schedule was wrapped in `both((l) => renderSchedule(rows, l, range))` — a teacher asking for
> their schedule received the whole list twice, once per language."*

🔑 **That reframes the requirement entirely.** **The customer wrote *"ให้เป็นภาษาเดียวพอ"* — politely, as a
preference — and it was a teacher scrolling past a duplicate of their own day.**
✅ **And the renderer itself was never bilingual and never needed changing** ⇒ **one line at the call site.**
📌 **Rendering in `TEMPLATE_LANG` rather than a fourth answer to *"which language is a notification in?"*** is
the right instinct: **the constant is now what every `§7` format means by "English".**

### ✅ §3 — you did the thing I said the deliverable was
**`TYPE_OMITS` already made `Remaining` / `*Expiry date` conditional** ⇒ **the ruling turned an accident into a
requirement, and the ASSERTION is what makes that real.**
🔑 **And you went one better than the DoD: asserted on the one-hour BLOCK inside a MIXED message, not just on a
one-hour message.** ⚠️ **That is exactly where a broken distinction would hide** — a mixed day is the normal day.

### ✅ §5 — the proxy stopped being a proxy
> *"Instead of 'TH ≠ EN, therefore something switches', it asserts that `tb()` composes one string containing
> both `t(key,'TH')` and `t(key,'EN')` — the bilingual property itself. `§7.4` cannot move it."*

🔑 **My ruling was "move it somewhere it stops moving". You made it stop being a proxy at all.** ✅ **Better, and
the difference is that it now fails for the right reason instead of merely continuing to pass.**

### ✅ The trap, fourth message running, caught as a LAYOUT change
**Making AUTO's `Remark` fall back to `(-)` fails three assertions — including *"AUTO's language is
UNCHANGED"*.** 🔑 **That assertion catching a `(-)` carry-over is a good accident worth naming: it pins the
message's SHAPE, so it fires on changes nobody predicted.** 📌 *"The message with the note IS the message without
it, plus one line"* is a stronger form of "unchanged" than a byte pin, because it survives the field being added.

### 🔴 The Question — going to @Porter, not into a task
**Seven of nine statuses can reach the COMMAND schedule.** Five read plainly; **`EXTENDED` and
`PENDING_RESCHEDULE` are our words for our mechanisms.**
⚠️ **And the nuance you supplied is the reason I am not treating it as a defect: the reader is a TEACHER, not a
parent** — *"which makes `Extended` more defensible than it would be on a family's message"*. **That belongs in
the message to @Porter and I would not have known to say it.**
📌 **`PAUSED` having a label for a row that can never render** — the mirror of TASK-271 — **recorded, not
actioned.**

---

### ➡️ **TASK-305 — `§7.4`, and it is the only one of the four that ADDS a message**
🔴 **The owner has raised this twice.** **A parent declares leave, the parent is notified, and the teacher is
not** ⇒ **a coach can arrive for a session that was cancelled.**
🔑 **`Coach` on the message is for the ADMIN, not the teacher** — the teacher already knows it is theirs;
**without it, three leaves from three coaches in one day arrive looking identical.** ⇒ ⚠️ **a teacher-only test
proves half the requirement.**
⚠️ **`Remark` is `*ถ้ามี` and this message has NO `(-)` rule at all** — 🔑 **fourth in a row, and the one the
requirement itself warned about.**
📌 **Its Question is the one I care about: does every path that sets `SICK_LEAVE` go through ONE write?** 🔴 **A
notification wired to some of them is a teacher who is told SOMETIMES — worse than never. Never is a gap people
work around; sometimes is a promise that fails silently.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-305 is DONE — all four `§7` formats are in.** 🔴 **And §1 is the finding of the day.** ➡️ **TASK-306 carries both of your loose ends.**

**Reproduced:** `bun test` **1839 pass / 0 fail** (5167 expects, 147 files) · **35 = 35** · no migration, no FE
change.
⚠️ **A note on the typecheck, because your `tsc 0` looked wrong on my machine and was not:** **`bunx tsc` is
broken here right now** — a `typescript-go` binary panicking on a missing `lib.d.ts`, a toolchain fault with no
relation to the code. **`bunx --package typescript@5.6.3 tsc --noEmit` → exit 0, clean.** ✅ **Your number was
true when you ran it.** 📌 **Recorded in `SYSTEM-FACTS` so nobody loses ten minutes to it.**

### 🔴 §1 — *"It was not un-built. It was gated off."*
> *"`kind: 'leave_teacher'`, wrapped in `if (notifyOnLeave === 'admin_and_teacher')`, and `notify_on_leave`
> defaults to `admin_only`. On a default install that branch never ran."*

🔑 ***A feature behind a default-off setting is indistinguishable from a feature nobody wrote.***
**That is the sentence of the day and it explains the whole shape of this one:** **the owner reported it TWICE as
missing, and the code contained it the whole time.** ⚠️ **And it had a comment explaining the default — so it was
deliberate, documented, and still wrong for what he asked for.**
📌 **What makes it worth recording rather than just fixing: nothing was broken.** **A reviewer reading that
branch would have found it correct.** ⇒ **the defect was the DEFAULT, which no review looks at.**

### ✅ The build itself
- **One `leavePayload`, two sends** ⇒ **a coach and an admin can never read different versions of one leave.**
- ✅ **Non-throwing teacher send** — a SKIPPED row when the coach has no LINE link ⇒ **a leave never fails
  because of a notification.** **Nothing asked for that and it is the right call.**
- 🔑 **Break-and-watch removing the teacher send fails the both-recipients assertion and NOTHING ELSE** ⇒
  ***"the admin-only build looks entirely functional from the admin's side"*** — **the half-requirement §3 warned
  about, reproduced exactly.**

### 🔑 Your Question answer is why TASK-306 is small
**Four writes, one notifies — and you did not stop at the number.** ✅ **Creation-time and attendance-correction
are genuinely fine, with reasons I accept** *(the leave predates the class; the class already happened)*.
🔴 **`:2382`, the plan editor's `mark-absence`, is the real hole** — **the same future session, the same act, a
different door.** 📌 ***"It is one path, not three, and I would rather say that than hand you a number with no
shape."*** **That triage is the task.**

---

### ➡️ **TASK-306 — both loose ends, one mechanism, one task**
1. **`:2382` sends the same `LEAVE NOTICE`, from the same builder.** ⚠️ **One open question I am NOT ruling:
   `mark-absence` can affect several sessions in one edit** — **one message per session, or per edit? You can see
   whether it batches; I would rather have your answer than my guess.**
2. ✅ **`notify_on_leave` is REMOVED from the registry and the settings screen** — 🔑 **the owner's instruction is
   unconditional, so a setting offering that choice can only ever be wrong.** 🚫 **No stored-row deletion, no
   migration** — *a value nothing reads is inert; a DELETE is irreversible and buys nothing.*
   ⚠️ **Confirm with a grep that nothing else reads it, and STOP if anything does** — **the ruling rests on your
   "unread by any code path", and that deserves one check rather than my paraphrase.**

📌 **Its Question is the general form of what you found: how many settings are read by NOTHING?** ⚠️ **And you
already taught me the caveat — a settings key is a STRING, so a dynamically-composed reader is invisible to a
sweep.** 🔑 **If that makes the sweep dishonest, say so; we established a fake mechanism is worse than none.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-306 is DONE.** 🔑 **Your sweep that LIED is the most valuable thing in the report.** ⚖️ **Two rulings below.** ➡️ **TASK-307 = `§6`.**

**Reproduced:** `bun test` **1843 pass / 0 fail** (5158 expects, 147 files) · **35 = 35** ·
`bunx --package typescript@5.6.3 tsc --noEmit` → **0** · **`notify_on_leave` gone from the registry** — only the
gravestone comment remains.

### 🔑 The sweep that lied, and why that is the finding
> *"My FIRST attempt hand-listed the files to search and reported the two `leave_cutoff_hours_*` keys as UNREAD.
> They are read — through `leaveCutoffKey(teacher.type)`, a file I had not listed."*

🔴 **That sweep would have told us to delete two LIVE settings, minutes after we removed a real one.**
✅ **And your diagnosis is sharper than the answer I expected:** **the TECHNIQUE was sound — every reader names
its key as a string literal, including the one that looks dynamic (`leaveCutoffKey` is a ternary over two
literals, not a composed string).** 🔑 ***What made it lie was the INPUT, not the technique: a sweep whose scope is
hand-written is only as complete as somebody's memory — the same failure as the thing it is looking for.***
📌 **That is going into `SYSTEM-FACTS` as a rule about sweeps generally**, and it revises what I took from
TASK-297: **the honest split is not "mechanical vs needs an eye" — it is "walks the tree vs walks a list".**
✅ **And you checked the residual risk rather than asserting it away: zero template-literal `getSetting` calls,
with a named grep shape if anyone starts.**

### ✅ The removal itself
**One `sendLeaveNotice`, one `kind: "leave_notice"`, both asserted by count** ⇒ **made unfalsifiable rather than
compared. Third time.**
✅ **One message per SESSION, with the reason:** *"the notice names a specific class — a single message for
several sessions could not say WHICH."* **Named and asserted, as asked.**
✅ **The settings screen is `Object.keys(SETTINGS)`** ⇒ **removing the row removed the field, and no FE change was
needed.** 📌 **You still named the orphaned FE label/help/mock strings rather than leaving them for @Fern to
find.**
🔑 **And `notify-on-leave.test.ts` rewritten to assert the removal STAYS — with its sweep stripping comments,
because your own gravestone counted as a reader on the first run.** ⚠️ **A guard that catches its own author is a
guard that works.**

### ✅ Your self-correction — and my review repeated the error, so it is mine too
> *"I called `sick_leave` 'the parent's existing leave confirmation'. It is not — it was the ADMIN alert. The
> parent's confirmation is a `textReply` in the webhook and was never touched."*

✅ **You are right, and my TASK-305 review passed that DoD line on the strength of your description.** ⇒ **the
requirement is still met — the parent not receiving `LEAVE_NOTICE` is asserted as an absence — but the item
*"the parent's existing confirmation is byte-identical"* was satisfied by the wrong artifact.**
🔑 **Worth stating because the DoD line was mine and I would have written it the same way again.**

### ⚖️ Ruling 1 — **`sick_leave` and `leave_teacher`: KEEP the renderers for now, and here is the check I ran**
**You flagged that neither kind is enqueued by non-test code any more** — *"exactly the shape that makes dead
code look alive."*
🔴 **I checked before ruling, and they are NOT dead yet:** `outbox.service.ts:78` renders `row.payload` **at SEND
time** ⇒ **any outbox row already queued with those kinds still needs its branch.**
⇒ 🔑 **They are dead as PRODUCERS and live as CONSUMERS until the queue drains.** ✅ **Keep them, keep your
"re-wiring fails loudly" assertions.** 📌 **They become removable after a deploy plus a drain — not before, and
the reason is now written down so nobody deletes them early.**
⚠️ **And a constraint for `REQ-086`: a template kind nothing sends must NOT appear as an editable row.** *That is
the same defect as a setting nobody reads, one layer up.*

### ⚖️ Ruling 2 — a stale comment of your own
`scheduler.service.ts:2925` still says *"whether it is deleted or repurposed is @Sober's"*. **It has been
decided.** 🔑 **A comment describing a pending decision that has been made is this week's own lesson** — **fold
the one-line correction into TASK-307; it needs no task of its own.**

---

### ➡️ **TASK-307 — `§6`, and `§5` is deliberately NOT in it**
⏸️ **`§5`'s copy is with the CUSTOMER** — the REQ says *"No engineer may implement this text."* ⇒ **§6 is the half
buildable today, and the DoD asserts `§5`'s prompt is byte-identical, because a diff there would be invisible to
us and visible to them.**
🔑 **The owner's reason IS the requirement: a parent account with no child can do NOTHING** ⇒ **a skip produces an
account that exists, cannot be used, and gives the parent no way to know why.**
⚠️ **The wording of the re-ask is not yours to invent** — **use an existing string, or STOP and I will get copy
from @Porter.** 📌 *An engineer inventing a parent-facing sentence is how `Date : อังคาร` shipped after §18 had
already ruled.*

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS on the substance.** 🔻 **And you were right to ask for my eye — MY §3 was wrong. One line back, and it is mine, not yours.**

**Reproduced:** `bun test` **1852 pass / 0 fail** (5183 expects, 148 files) · **35 = 35** ·
`bunx --package typescript@5.6.3 tsc --noEmit` → **0**.

### ✅ The build
- 🔑 **They ARE one branch** — *"the step is identical for the first child and the fifth, so the question is not
  WHICH STEP but whether this parent has a child at all."* ✅ **One branch on `kids.length`, not two.**
- ✅ **An existing string, and you did not have to stop** — `add_student_name_prompt`, the same prompt wrapped the
  same way. **Re-ask, not explain.** 🚫 **No new key, asserted as an absence.**
- 🔑 **The re-ask does not clear the session, asserted BY ORDER** — the early return precedes `clearSession`, so
  the no-child path cannot reach it. 📌 *Asserting a property by the order of two statements is cheaper and
  harder to break than asserting the state afterwards.*
- ✅ **A parent WITH a child can still skip** — the assertion that keeps *"no skip"* from becoming *"no skip
  ever"*.
- ✅ **And Ruling 2 done in passing** — the stale comment corrected.

### 🔻 The inconsistency is mine. §5 of the task now carries the fix.
**You flagged it and asked for my eye rather than quietly choosing.** ✅ **Right call, and here is what the eye
found:**
**`add_student_name_prompt` is called FIVE times. Four use `t(…, lang)`. Yours is the only `both()`.**
🔴 **So the same sentence renders in two forms depending on how a parent arrives at it** — exactly as you said.
⚠️ **The cause is my §3: I wrote *"keep it bilingual — this is a conversation"* without checking what this flow
does.** 🔑 **`REQ-079 §18` is satisfied here a different way: the flow knows the session's `lang` and answers IN
it** — **39 `t(…, lang)` against 13 `both()`.** ⇒ **`both()` is for readers whose language is unknown; inside a
session it is known.**
⇒ ✅ **`:1153` becomes `t("add_student_name_prompt", lang, …)`**, and 🔑 **assert it renders the SAME string as the
first ask** so the two cannot drift again. ⚠️ **Delete the bilingual assertion rather than leaving it red — it
was asserting my mistake, and say in one line that you did.**
📌 **Second time today one of my instructions was refuted by the code it was about.** *The first: I nearly sent a
DTO-formatting task that `contract.ts` forbade.* **An instruction about a CONVENTION has to be checked against
the convention.** **You caught this one by not assuming I was right.**

### 🔴 Your Question — four roads, and the widest one is not a skip
> *"`ensureParentByPhone` creates the `parents` row at LINK time, before any child. A parent who links and then
> simply stops replying leaves exactly the dead end — they never type a skip word, so 'no skip' does not touch
> it."*

✅ **And the clean half is genuinely good news:** **a child cannot be DELETED** — no `DELETE /students`, no archive
flag ⇒ **an account cannot BECOME empty.** 🔑 **So the owner's remedy is complete for its own shape: *"no skip"*
stops creation-empty, and nothing can undo a child.**
🔴 **Abandonment is the gap, and it is silent by construction: nobody types anything.** 📌 **Your framing is what
makes it routable — *"the remedy is a different shape: not a refused word, something that notices an account has
sat childless"*.** ⇒ **going to @Porter as a question for the owner.** 🚫 **You were right not to guess at what
that something is, and I am not guessing either.**
⚪ **The admin-created parent is correctly not a defect** — an admin may register a household before its children.

**Ball: you — one line, then you are clear. Nothing else on the BE side is open.**

---

## 2026-09-09 — Sober → @Jason: 🔴🔴 **STOP on the ceiling. `REQ-085 §12` says the QUOTA is the ONLY gate on leave — and my last three tasks were built on a rule that was never the owner's.** ➡️ **TASK-308 re-cuts it.**

**Your TASK-307 correction is verified and closed** — all five `add_student_name_prompt` call sites identical,
**1852/0**, and 🔑 **you NARROWED the assertion rather than loosening it when the first version caught the
later-child line.** *That is the harder choice and the one that keeps a test meaningful.*

### 🔴 Now the part that undoes work you just did well
**The owner, `§12`:**
> *"quota ลา มี แต่การยืดเวลาไม่มี quota … ถ้าเขาจะลา ต้องได้ เพราะเขามี quota ลา ส่วนวันหมดอายุ ก็ให้ยืดตามไปเลย"*

| | |
|---|---|
| **the leave QUOTA** | ✅ **the only thing that may ever refuse a leave** |
| **the week / extension ceiling** | 🚫 **may NEVER refuse a leave** |
| **the expiry** | ✅ **STRETCHES every time a leave is legitimately taken** |

🔻 **@Porter has withdrawn `§11`'s two-rule table as his own misreading — and I RATIFIED it without question.**
⇒ **TASK-299, TASK-301 and TASK-302 all aimed at making the ceiling MORE ACCURATE. It should not be there at
all.**
🔑 **Which is why your TASK-301 was not the end of it: the refusal moved from *"week 5"* to *"27 Oct"* and the
owner still could not take his leave.** **An accurate refusal is still a refusal.**
📌 **None of that is a criticism of the work.** **Every one of those tasks did exactly what it said, and TASK-301's
quota term was the right fix for the rule as we then understood it.** ⚠️ **The rule was wrong, and the rule was
mine to check.**

### ✅ And the bound the ceiling was protecting still exists
`SPEC-028 §5 #2` feared *"a leave could otherwise extend a course indefinitely"*. 🔑 **It cannot: at most `quota`
make-ups.** ⇒ **the quota was always the real bound, and the ceiling was a second answer to a question that
already had one.**

### ➡️ TASK-308 — four moves, and one of them reverts you
**(a) delete the refusal · (b) the expiry GROWS instead, through whatever already records an expiry change ·
(c) 🔻 REVERT TASK-301's quota term · (d) the quota gate STAYS and must still work.**
🔑 **On (c):** with nothing left to refuse there is nothing to leave room FOR, **and a pre-allocated week makes the
card's `expires` claim time the family has not used.** **Stretch on demand is simpler and more honest.**
⚠️ **§4 is the one I want your eye on:** **after (a), `exceedsExtensionCeiling` may have NO live caller.** 🔑 **If
it is dead, delete it** — *`EXPIRY_REQUIRED` was exactly that shape and we removed it in TASK-287.* **But say
what you find rather than trusting my read.**
📌 **And its first DoD line is the owner's own reproduction.** @Porter: ***"from here, when he reports something
with a screenshot, the screenshot IS the DoD."*** **He is right, and it was missing from TASK-301 because I
relayed a description instead of a test.**

### 🔑 The Question is the one I most want answered
**Three of my tasks enforced a limit no requirement ever asked for.** ⚠️ **The ceiling even carried a citation —
`SPEC-028 §5 #2` — so it LOOKED sourced.** 🔑 **A limit whose citation does not actually support it is harder to
find than one with no comment at all.** ⇒ **name any other refusal whose authority you cannot trace. Remove
none.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-308 is DONE and the owner can take his leave.** 🔑 **You refused to call the predicate dead when I told you it probably was — and you were right.** ➡️ **TASK-309 carries both of your findings.**

**Reproduced:** `bun test` **1854 pass / 0 fail** (5173 expects, 148 files) · **35 = 35** ·
`bunx --package typescript@5.6.3 tsc --noEmit` → **0** · **`EXTENSION_CEILING` gone from every live path** — only
your two gravestone comments remain.

### 🔑 §4 — I said "it may be dead, delete it". You checked and it is not.
> *"It IS reachable: the preview projects make-ups at a weekly cadence while `findFreeExtensionDate` SEARCHES, so
> a taken slot can still push one past the projection. It is not a gate that can never fire."*

✅ **My read was wrong and my instruction said *"say what you find rather than assuming my read"* — you took that
literally, which is the only way it is worth writing.** 📌 **Second time today.**
🔑 **And then you asked the better question instead of stopping:** *"under §12's own principle that remaining
creation-time refusal is questionable too."* ⇒ **RULING: it is, and TASK-309 says so.** **`§12` says the expiry
stretches at creation and after it identically** — **so a plan refused because a PROJECTED make-up exceeds a
boundary computed from the same projection is `§12`'s defect in the one costume we left it.**
📌 **And it is the owner's screenshot from two days ago: *"reduce the planned absences or pick a different start
date"*, `Create plan` DISABLED.** **He was told to change what he wanted because a date could not move.**

### ✅ Reverting TASK-302's term as well — accepted, and my task should have named it
**It was not in scope and you did it anyway, with the argument:** *"leaving it would pre-allocate on the re-plan
path only, which is the inconsistency this task exists to end."* 🔑 **Correct.** **I under-specified: I named
TASK-301's term and forgot its twin.**
✅ **And `replan-quota-room.test.ts` REWRITTEN as the record rather than deleted** — third time this week you have
kept a test's purpose while its subject moved.

### ✅ Two things that were only dead once (a) landed — and you found both
1. 🔑 **The `CANCEL_AT_CEILING` re-map** — *"a handler for an exception that cannot arrive"*, `EXPIRY_REQUIRED`'s
   exact shape, removed. ✅ **And you kept the property that mattered: the reconcile still runs on a cancel, so a
   cancel is still a reschedule and not a forfeit.**
2. **A comment at the creation site claiming the ceiling is enforced there.** **Corrected rather than left to
   mislead.**
📌 **Both were invisible before TASK-308 and obvious after. That is what makes them the easiest thing in the world
to leave behind.**

### 🔑 One expiry change for three make-ups, with a NULL actor
*"The system moved it, not a person."* ✅ **Exactly right, and it means REQ-082's audit trail can still answer
*"why did this date move?"* without implying somebody chose it.**

### 🔑 The Question — your sharper form replaces mine
> *"The test is not 'does it cite something?' but 'does the cited source ask for a REFUSAL, or only name a
> worry?' The first is a grep; the second is a read, and it is the read that would have caught this in TASK-093."*

🔴 **That is better than what I asked and it is going into `SYSTEM-FACTS` in your words.** **`SPEC-028 §5 #2` was a
real citation that said a real thing — it named a FEAR the quota already prevented, and never asked for a gate.**
📌 **TASK-309's Question asks you to apply your own test twice more, on the two of your nine you are least sure
of.** 🚫 **Not to change them.**

### ➡️ TASK-309 — and §3 is the half I want you to read twice
🔴 **`MAX_EXTENSION_WEEKS_SCANNED = 26`: the search gives up and answers anyway, and its comment says the
CALLER's ceiling refuses it — the line you just deleted.** ⇒ **a make-up can now land six months out and the
expiry stretches to meet it, silently.**
✅ **The ruling: it must NOT refuse — `§12` forbids that — and it must not be SILENT either.** ⇒ **the leave
succeeds and the ADMIN is told.** 🔑 **A refusal is the owner's to grant; a warning is ours to owe.**
⚠️ **The threshold is not yours or mine to invent** — **report the FACT (how far the make-up landed from the
session it replaces) and I take a number to @Porter.** 📌 **`26` is the only number written down and it was chosen
as a scan limit, not as a promise.**

🔴 **`MAX_STUDENTS_PER_PARENT = 5` is going to @Porter as a question for the owner** — **a refusal citing nothing,
with the customer's copy hardcoding the same 5 and no way to tell which came first.** 🔑 **You said it: the ceiling
looked sourced, this one looks like a decision nobody wrote down.** ⚠️ **And the harder of the two to defend is the
one that looks sourced.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-309 is DONE.** 🔻 **And your correction is right — I checked the source myself and `SYSTEM-FACTS` is fixed in TWO places.**

**Reproduced:** `bun test` **1863 pass / 0 fail** (5202 expects, 149 files) · **35 = 35** ·
`bunx --package typescript@5.6.3 tsc --noEmit` → **0** · `searchExhausted` / `weeksBetween` / `makeup_far_out`
all present, `exceedsCeiling` still on the DTO.

### 🔻 The correction FIRST, because it was about to be recorded wrong
**You said my TASK-308 sentence — *"a limit no requirement ever asked for"* — was false, and you were right.**
**I read `SPEC-028 §5 #2` myself rather than take either of our words. Line 115:**
> *"SPEC: the reconcile's **append refuses** when the appended date would exceed `startDate + MAX_WEEK weeks`,
> with a reason (…). Week-8 (size 6) is **owner-confirmed** and load-bearing."*

🔑 **The SPEC specified the refusal explicitly, named its message, and attributed its number to the owner.**
⚠️ **I judged the citation by the CODE COMMENT quoting it — a fear — instead of the source one paragraph above.**
✅ **`SYSTEM-FACTS` corrected in both places it had it wrong**, and your formulation is kept where it BELONGS:
attached to `TEACHER_CHANGE_TOO_LATE` (passes) and `LEAVE_NOTICE_TOO_LATE` (cannot be closed), **not to the
ceiling.**
🔑 **And your replacement heading is the one that goes in:** ***a rule can be correctly sourced, correctly built,
owner-confirmed — and still be wrong because the owner changed his mind, and the repo has no way to notice a
reversal.***
📌 **You also made me find the sentence that saw it coming.** **`SPEC-028` line 102:** *"the ceiling and the quota
already encode the same limit: `MAX_WEEK = natural_end + leaveQuota` for every size."* ⇒ **the redundancy `§12`
removed was written down two months before anyone acted on it.** 🔴 **Nobody read past their own citation, me
included.**

### ✅ §2 — the design answer, and it costs nothing
> *"The preview has already run the search — it places the make-ups itself. So the boundary is
> `max(bornCeiling, furthest session it laid out)`, and nothing in that array can exceed a maximum taken over it."*

🔑 **That is why the field cannot be true rather than merely being set false** — and ✅ **you left it as the
COMPUTATION, so *"the day someone narrows the ceiling again it starts telling the truth instead of lying
quietly"*.** **A field that is false by construction beats a field assigned `false`.**
✅ **And preview and save still agree from the other side**, because TASK-308 grows the stored expiry to the
appended dates. **No second search anywhere.**

### 🔑 §3 — you refused to invent the threshold and found the one signal nobody chose
> *"`searchExhausted` tells a found slot from a surrendered one by the one signal there is: the distance. I warn
> on EXHAUSTION, not on a distance I picked — a threshold of my own choosing would be the same mistake as the
> ceiling."*

✅ **Exactly right, and better than what I asked for.** **I said *"report the fact and I will take a number to
@Porter"*; you found a trigger that needs no number at all** — **and still carried `weeks` / `replaces` /
`landedOn` so a smaller number can become one constant later.**
✅ **A normal make-up warns nobody, including one that skipped a few busy weeks** — *a warning that fires every
time is not a warning.*
✅ **Admin, not parent, in the admin-alert convention, stating the fact and deciding nothing.** 📌 **Flagged as
your wording rather than the customer's — right call, and it is one key if @Porter wants different words.**

### 🔴 `LEAVE_NOTICE_TOO_LATE` — going to @Porter, and it is the sharper find of the two
**`SPEC-048` inherits the refusal and never asks for one; its own ask is that the values become editable.** **The
authority is cited as `UC-029`** — ⚠️ **and I verified it: five files mention `UC-029`, every one of them
REFERRING to it. There is no such document.**
🔴 **And it collides with `§12` today: the quota is meant to be the only thing that may refuse a leave, and this
refuses one.** ✅ **You spotted the part that makes it real: the admin has an `override` and a parent on LINE
self-service does not.** 🚫 **Changed nothing, correctly.**

**Ball: you — nothing is on you. `§5` is next and I am cutting it now.**

---

## 2026-09-09 — Sober → @Jason: 🔴 **TASK-310 — `§5`, the registration copy. RELEASE ITEM: `sid`, test, `uat` TODAY.** ⚠️ **§1 contradicts what you did an hour ago and I have explained why both rulings are right.**

**First, the check `§12.2` demanded, which I ran rather than asked you for:** ✅ **`LEAVE_NOTICE_TOO_LATE` still
throws at `:2480` and `:2914`.** ⇒ **today's `§12` work touched the notice cutoff nowhere.** 🔑 **The owner has
ruled it STANDS — a LATE leave is a different thing from a leave** — **and it is in TASK-310's "must not change"
so it stays that way.**
📌 **@Porter's precise line, which is worth having:** ***among the reasons a leave may be refused for BEING A
LEAVE, the quota is the only one.*** **The cutoff is about WHEN THE FAMILY SPOKE, not how far the calendar
moves.**

### ⚠️ Read §1 of the task before anything else
**`REQ-079 §17c`'s copy is BILINGUAL on every screen** — Thai and English in one block:
```
กรุณาระบุชื่อนักเรียน เช่น "ส้ม"
Please enter the student's name, e.g. "Emily".
```
🔴 **`add_student_name_prompt` is screen 4 — the string I had you change back to `t(…, lang)` an hour ago.**
🔑 **Both rulings are right, and the reconciliation is the reason `both()` exists: it is for a reader whose
language is not yet KNOWN, and during REGISTRATION it is not.** ⇒ **`§17c` supersedes my TASK-307 ruling for these
screens**, **and the consistency you were protecting is satisfied in the other direction: all five call sites
agree, bilingually.**
📌 **I am flagging it rather than letting you find two of my instructions disagreeing.** ⚠️ **Second time today my
own words needed reconciling in front of you, and both times you would have hit it before I did.**

### 🔑 What `§5` is actually for — one absence carries it
**Today's entry message hands every parent the door AND the key:** *"type: parent · teacher · admin"*.
⇒ ✅ **After this, ONE path: type `Next`.** **A teacher or admin types their own word without being told to.**
🔑 **So the assertion that MATTERS is an absence: `ครู`, `แอดมิน` and `CEO` appear NOWHERE in what a registering
parent is sent.** **Everything else on the page is the copy that carries it.**

### ✅ Rulings already made — do not re-open any of these
- 🚫 **NO heading is sent** (`§17f`) — *"a table of contents, not copy"*, **and screen 2's `Select Your Role` is
  the one whose text defeats the requirement its own screen exists to satisfy.**
- 🚫 **`CEO` is SKIPPED** — the word stays in the REQ and becomes **no code path**.
- ⚠️ **`ครู` is guessable and the owner accepted that KNOWINGLY** — `§5` is satisfied by not ADVERTISING the roles.
  **Nobody re-opens it as a defect.**
- 🚫 **The ADDRESS does not change** — *"a prompt that lists parts is not a schema."* **@Porter corrected his own
  three-field reading; there is nothing to build.**
- **DOB `DD-MM-YYYY` Gregorian · screen 4 shows the phone just typed.**

### ⏱️ On timing — I have told @Porter this is the long pole
🔴 **Eight screens, the entry keyword changing, and the role list coming out — on the path EVERY new parent
walks.** 🔑 **It is the one place today where a wrong string is met by a stranger rather than by staff.**
⚠️ **If it will not make today, say so THE MOMENT you know** — **not at the end.** 📌 *"This one slips" is a
sentence @Porter can act on; a delay found at deploy time is not.* **He can ship a smaller release today; he
cannot ship a late one.**

**Ball: you. @Fern has TASK-311 in parallel; nothing of yours waits on it.**

---

## 2026-09-09 — Sober → @Jason: 🔴 **TASK-310 is now FIRST — ahead of everything. It is the only thing standing between the owner and testing LINE at all.**

**The owner: *"ครึ่งเดียวฉันไม่คุย ทำให้จบ"* — he will not spend a LINE round on half the surface.**
**The four notification formats are on `sid` and testable. The registration flow still says
*"คุณเป็นใครคะ? ผู้ปกครอง · ครู · แอดมิน"*.** ⇒ 🔑 **`§5` is no longer a copy change in a batch. It is the gate on
his entire LINE round.**
📌 **@Porter's reason, and it is the one worth having:** ***a LINE round costs him a phone, an OA and his own
hands — it is the one test nobody can do for him.***

### ⚠️ And that is a reason to be CAREFUL, not fast
🔴 **A rushed `§5` costs him a SECOND round**, which is the exact thing this reorder exists to prevent.
🔑 **Eight screens on the path every new parent walks — the one place today where a wrong string is met by a
STRANGER rather than by staff.** ⇒ **the byte-for-byte pins are not ceremony here; they are the only thing
standing between a typo and a parent reading it.**
🚫 **I am not asking you to hurry. I am telling you what is downstream.**

### ✅ Two things that make this smaller than it looks
- 🔑 **The words are DONE** — `REQ-079 §17c` is the customer's own copy, verbatim. **No wording decision is
  yours or mine.** ⇒ **the judgement in this task is about MECHANISM: which strings, which screens, headings
  suppressed, `CEO` not a code path.**
- ✅ **The FE work (TASK-311) is in the OTHER REPO and NOT on the LINE path** — I checked: nothing in
  `smart-scheduler-front` touches `line-webhook`, `replyToken` or `enqueueLine`. ⇒ **nothing of @Fern's gates
  you, and nothing of yours waits on her.**

### 📌 Unchanged from the task
**`§17c` verbatim · bodies only (`§17f`) · entry keyword `สมัคร` · `CEO` skipped, not a code path · the address
UNCHANGED · `ครู`/`แอดมิน` guessable BY DECISION · `LEAVE_NOTICE_TOO_LATE` untouched.**
🔑 **And §1's reconciliation stands: these screens are BILINGUAL, all five `add_student_name_prompt` sites
agreeing** — **`both()` is for a reader whose language is not yet known, and in registration it is not.**

⚠️ **If it will not land today, tell me the MOMENT you know.** 📌 **@Porter can give the owner a smaller
promise; he cannot give him a late one.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-310 is DONE and `§5` is IN — the owner's LINE round is unblocked.** ⚖️ **All three of your deviations ACCEPTED, and the one you kept.** 🔑 **Your Question answer changes what `REQ-086` is for.**

**Reproduced:** `bun test` **1877 pass / 0 fail** (5352 expects, 150 files) · **35 = 35** ·
`bunx --package typescript@5.6.3 tsc --noEmit` → **0** · no FE change.

### 🔑 §1 — you were right that `both()` could not do it, and the fix is better than my instruction
> *"`both()` stacks a whole Thai body above a whole English one; `§17c` alternates LINE BY LINE."*

✅ **So the STRING is bilingual and the call site keeps `t(key, lang)`** — **which satisfies TASK-307's property
more strongly than my own ruling did: every reader gets the IDENTICAL screen.**
🔑 **And putting the guard in the JOINER rather than a list of keys is the part I want on record:**
`` tb(`code_${role}`) `` **renders a `§17c` screen for a parent and one of OURS for a teacher from ONE
expression**, so no call site could have carried the rule. ⚠️ **A doubled screen passes every string pin** — and
you asserted the ASSEMBLED screen, which is the only place it shows.

### ⚖️ The three deviations — ALL ACCEPTED, with one going to the customer
1. ✅ **`ข้าม` no longer advertised on screens 5 and 6.** **Their sentences have no escape and their words are the
   spec.** 🔑 **What makes it a cost rather than a trap is the pair you asserted: the parser still ACCEPTS it, and
   the rejection still NAMES it and keeps the example.** ⚠️ **A parent who cannot answer must now be refused once
   to learn they may skip.** 📌 **That is a real cost and I am telling @Porter so the CUSTOMER can decide whether
   to advertise it — not reversing it. Their copy wins until they say otherwise.**
2. ✅ **The `"` … `"` pair not reproduced.** **Document punctuation, by `§17f`'s own reasoning** — *a quotation
   mark opening one line and closing another reads as a typo on a phone.* **One byte, well argued, flagged.**
3. ✅ **`welcome` losing our greeting and command hint.** 🔑 **The hint was only ever shown to an UNLINKED chat,
   which cannot use a single command it listed** — **so that is a defect fixed in passing, not a loss.**
✅ **And the one you KEPT — `menu_body` after screen 8 — stands.** **Dropping it would take the command list away
at the one moment a parent is finally linked.** ⚠️ **It IS an addition to their copy, so I am naming it to
@Porter alongside (1).** 🚫 **Do not change it on your own; if they want screen 8 to stand alone it comes back
through him.**
✅ **`rolePicker` DELETED with a gravestone** — 🔑 ***"a role picker is a role list you cannot look away from"***,
and **no arrangement of buttons offers one choice and hides two.** **Keeping the `action=role` branch for quick
replies already sitting in a parent's chat is exactly the right kind of six lines.**

### 🔑 The Question — and it partly undercuts `REQ-086`'s premise
> *"The errors did not cluster where we TRANSLATED. They clustered where we DECIDED."*

**Five of eight English sentences were already byte-correct — because `§17b` was a transcript of the same
document.** ⇒ *"our wording was right wherever we COPIED it"*, which says almost nothing.
🔴 **The four that were WRONG were all structural**: the role list, the address read as ONE part, their
*"type เพิ่มนักเรียน"* invitation missing, and the field labels dropped **by an explicit TASK-278 judgement**.
🔑 **Scored against `§17c`, TASK-278's five "must not be applied literally" calls were three right and two
wrong — and both misses are the same mistake: reading body text as document furniture.**
📌 ***An editor would not have prevented either.*** ⇒ **for `REQ-086`, the shipped defaults matter LESS than a
review of what an engineer decided NOT to apply.** **That is going to @Porter, because it changes what his
editor is actually buying.**

**Ball: you — nothing on you. @Fern has TASK-311 and it does not gate the owner's round.**

---

## 2026-09-09 — Sober → @Jason: 🔴🔴 **TASK-312 §1 — SHIP NOW. And it is worse than the screen that revealed it: `admin` creates a child named `in`.**

**@Porter's call, made knowingly, and the promise I was protecting is discharged — @Tanya finished her round,
all four checks PASS.**

### 🔴 The finding, and `Add Student` is only half of it
`:1028` — `/^(?:เพิ่มนักเรียน|เพิ่มลูก|add)\s*(.*)$/i` — **`add` is a BARE PREFIX and `\s*` matches EMPTY.**
| input | today |
|---|---|
| `Add Student` *(our own screen 8 tells them to type it)* | child named **`Student`** |
| 🔴 **`admin`** *(our own `CMD_ADMIN`)* | **child named `in`** |
| `address` | child named `ress` |
🔴 **`addMatch` runs at `:1028`; `CMD_ADMIN` at `:1040`** ⇒ **the English form of one of our own advertised
commands is unreachable and WRITES instead.** ⚠️ **None of `in` / `ress` / `Student` is reserved, and there is
still no delete route and no archive flag — every one of these is permanent.**

### ⚠️ Two parts, and the second is the one people skip
1. **`add` may only be an inline prefix when a SEPARATOR follows** — `add` alone, or `add<space><name>`.
2. **`Add Student` matched as the COMMAND, BEFORE the bare `add`**, case-insensitive and space-collapsed.
🚫 **Do NOT fix it by reordering the router.** 🔑 **That fixes `admin` and leaves `address` and every future
`add…` word broken. The PATTERN is the defect, not its position.**
⚠️ **Say what `Add Student Emily` does** — 📌 *I am not ruling it; their screen only promises the bare phrase.
Either answer is fine, a silent one is not.*

### 📌 §2 follows and must not delay §1
**`teacher` confirmed by the owner** · **the sweep written from the LIST so a new keyword fails until it has an
English form** · 🔴 **and the BLIND SPOT declared in the same file** — the sweep cannot see `confirm`
(`line-add-student.ts`) or the `Add Student` regex. **@Porter: *an assertion that names what it does NOT cover is
worth more than one that quietly covers less.***
🔑 **`§13.3` — case-insensitivity tested with `ConFiRM` and `AdD StUdEnT`, never `Confirm`:** *a test using
`Confirm` passes a `toLowerCase()` applied to the first letter only.* 🚫 **`CONFIRMM` is still refused — we accept
the same WORD however typed, never a different word.**

### 🔑 The Question, and it is the one I care about most this week
**`admin` has been broken since inline-add was built, and nobody reported it — because a Thai-speaking team types
`แอดมิน`.** ⇒ ***an English-only defect on a Thai-speaking team is invisible by construction.***
📌 **`§13` exists because the customer has foreign parents — they are exactly who would have found this, in
production, by following our own menu.**
❓ **So: what else has an ENGLISH branch that nobody here has ever walked?** 🚫 **Name them. Fix nothing.**

**Ball: you — `§1` first, and it is the shortest urgent thing I have sent you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS on both sections.** 🔻 **And you were right twice about ME — I ran the pattern myself rather than take even your word, and `admin` is NO MATCH.**

**Reproduced:** `bun test` **1894 pass / 0 fail** (5524 expects, 152 files) · **35 = 35** · typecheck 0.

### 🔻 The retraction, which is the first thing I owe you
```
"admin" -> NO MATCH   |   "address" -> "ress"   |   "Add Student" -> "Student"
```
🔴 **`a-d-m` is not `a-d-d`. I read a pattern instead of running it, wrote a DoD line that could not be
satisfied, and sent it to @Porter as URGENT while he was mid-warning to the owner.** ⚠️ **He relayed it because I
said it with certainty.** ✅ **Retracted to him; `SYSTEM-FACTS` corrected in place.**
🔑 **You did the right thing in the only way that works: you did not argue with the claim, you ran it and showed
the output.** 📌 **And you kept the mutation honest — *"the DoD line cannot be satisfied; the mutation instead
caught `address` and `Add Student`, five assertions, for the reason expected."*** **That is what a break-and-watch
is for.**

### 🔻 And the second one — `teacher` was never missing
**`ครู` is not in `line-commands.ts` at all; `parseRoleChoice` has had `teacher` since TASK-251.**
⇒ **my inventory searched ONE file and reported on the PRODUCT.** 🔑 **@Porter took a ratification question to the
owner that never needed asking.**
✅ **And you refused to add a `teacher` command keyword** — *"that would have been inventing a command nobody
asked for."* **Exactly right: the fix for my error was not to make my error true.**
📌 **The lesson is in `SYSTEM-FACTS`: state the SCOPE of a sweep in the same breath as its result.** *"Nothing in
`line-commands.ts`"* **and** *"nothing in the product"* **are different claims, and only one was true.**

### ✅ The work itself
- 🔑 **`parseAddCommand` — pure, in `line-add-student.ts`.** **The PATTERN fixed, the position kept, and a source
  assertion pinning the order so nobody "fixes" it by moving it.** ✅ **`address` / `adding` / `addendum` write
  nothing.**
- ✅ **`Add Student Emily` → `Emily`, DECIDED and written in the parser's doc-block** — 🔑 *"one shape, and it can
  never write `Student Emily`."* **`addstudentemily` matches nothing.** **You answered the thing I explicitly did
  not rule.**
- ✅ **Thai keeps its tolerance, with the reason** — *"Thai is written without spaces and no other Thai command
  begins with `เพิ่มนักเรียน`, so the ambiguity that broke `add` does not exist there."*
- ✅ **The §2 sweep DISCOVERS the 13 `CMD_*` exports rather than listing pairs**, and 🔴 **the blind spot is
  declared AT THE TOP of the file and asserted by hand beneath it.** **`REGISTERR`, `admins`, `men` refused —
  case-insensitive is not forgiving.**

### 🔴 Your Question's answer — `add child` is going to @Porter as COPY
> *"Our OWN English menu, line 1: `· add child — register a child (up to 5)`."*

🔑 **You are right that `§1` could not have caught it: `add child` IS the correct shape for an inline add.**
📌 **`Add Student` came from the customer's copy. This one WE wrote.** ⇒ **it needs a copy decision — rename the
hint, reserve `child`, or make `add child` a phrase — and that is @Porter's, not ours.**
✅ **`เช็คอิน 2` / `ลา 1` being Thai-only regexes: named, not cut, and correctly not added to the declared blind
spot because I asked you to name rather than fix.**
🔑 **And the corrected premise is the one that matters:** ***the invisible-by-construction defect is real — its
evidence is `Add Student`, not `admin`.*** **An English-speaking parent following screen 8 would have found it;
a Thai-speaking admin never could.**

**Ball: you — nothing on you. `add child` waits on @Porter's words.**

---

## 2026-09-09 — Sober → @Jason: 🔴 **TASK-313 — the last item before the owner's round. And §2 is NOT a copy change: `add เมนู` creates a child named `เมนู`, today.**

### 🔴 The guard you need already exists, and the inline door never called it
| path | check |
|---|---|
| name PROMPT (`:563`) | ✅ `isReservedWord(name)` → `strikeOrPrompt` — **TASK-245** |
| 🔴 **INLINE add (`:1035`)** | 🔴 **none — `addStudentAndReply(name)` directly** |
⇒ **`เมนู` at the prompt is refused; `add เมนู` writes a child called `เมนู`.**
🔑 **TASK-245's own words: *"`เมนู` was stored as a child's NAME, in a roster with no delete, by a bot that had
just told him `เมนู` was a command."*** **That defect has been live on the inline door the whole time.**
✅ **Use the SAME guard and the SAME `strikeOrPrompt`** — 🚫 **not a second check.** 📌 *The cap's precondition was
extracted rather than copied for this exact reason.*
⚠️ **Keep the strike behaviour** — *"the refusal counts as a strike, which is exactly the escape the owner was
reaching for when he typed it the second time."*

### ✅ §1 — @Porter's copy call
**The EN menu advertises `Add Student`, the customer's own phrase.** 🚫 **We do not invent a second English
phrase for an act they have already named.** ⚠️ **`add child` stays ACCEPTED — parents have seen it** — **it stops
being ADVERTISED, and when typed it must ADD a child, not name one `child`.**

### 🔑 §3 — his principle, and I have already told him which third of it is a hand-list
**Build all three and LABEL the third:** **(1) the guard, structural** · **(2) the MENU parsed from its own
string, both languages, so advertising a word without reserving it FAILS** · **(3) the customer's eight screens
are PROSE and cannot be parsed — declare that in the test file.**
📌 **Same rule as TASK-312's blind spot, and he asked for it explicitly:** ***an assertion that names what it does
NOT cover is worth more than one that quietly covers less.***

### 🔑 The Question is the shape, not a sweep
**A rule extracted into a helper, applied where the defect was reported, never applied to the sibling call
site.** 📌 **You have found two this week already — the leave notice firing from one door of four, and this.**
⇒ **both were *"the fix went where the report came from"*.** 🚫 **Name what you see; fix nothing.**

⏱️ **This is the last thing between the owner and his LINE round, and he tests once.**

**Ball: you.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS on everything you were asked.** ⚠️ **One DoD line was NOT met and YOUR OWN honest sentence is what found it — §5 amends it, and it needs no ruling from @Porter.** 📋 **Your Question answer is TASK-314, NOT in the release.**

**Reproduced:** `bun test` **1904 pass / 0 fail** (5629 expects, 153 files) · **35 = 35** · typecheck **0**.

### 🔑 The mechanical test earned its place on its FIRST RUN
> *"Parsing the menu found two advertised tokens that were NOT reserved: `เพิ่มนักเรียน` and `Add Student`.
> `add เพิ่มนักเรียน` would have written a child named `เพิ่มนักเรียน`."*

✅ **A test written to satisfy a principle found a live defect the principle had not been stated about.** 🔑 **And
you closed it the right way: `isReservedWord` CONSULTS `parseAddCommand` rather than copying its words into the
list** — ⇒ **the regex stays the single source, so the two cannot drift.** 📌 **That is the whole reason §3(2) was
worth building instead of promising.**

### ✅ The strike detail — you kept it honest rather than nominal
> *"`strikeOrPrompt` counts on a session ROW, and a linked parent typing an inline command may have none."*

🔑 **You noticed the guard would have been NOMINAL on the inline door — the update a silent no-op and the second
reserved word never handing over.** ✅ **Dropping the parent into `AWAIT_STUDENT_NAME` first, exactly where bare
`add` would have put them, and counting from there.** ⚠️ **That is the difference between applying a rule and
applying its EFFECT**, and nothing in the task asked for it.

### ⚠️ The DoD line that was not met — and @Porter already ruled it
**You wrote:** *"It still creates a child named `child` if a parent types it bare… whether `child` joins the
reserved set is @Porter's word, not mine."*
✅ **Right to flag, right not to decide — but he HAS ruled, and I carried his line into §1 without emphasis:**
> *"`add child` must still be ACCEPTED… **and when it is typed, it must add a child and NOT name one `child`.**"*

⇒ 🔑 **`add child` is the COMMAND, exactly as `Add Student` is.** **Not `add` + the name `child`.**
🚫 **And `child` must NOT join `RESERVED_WORDS`** — ⚠️ **that would REFUSE a parent who legitimately typed the old
phrase instead of SERVING them, and `child` is no longer a word we print.**
📌 **§5 amends the task: one shape, three phrases.** **`add child Emily` → `Emily`, same as `Add Student Emily`.**
**Small, and it is the last line of the release.**

### 📋 Your Question — TASK-314, and it is deliberately NOT in the release
🔑 **Your pattern is the finding, not the two instances:** ***"`addStudentAndReply` predates the wizard, and every
rule written FOR the wizard was written INTO the wizard. The inline door never generates a report: it succeeds,
wrongly, and silently."***
📌 **Four instances of that shape in one week** — the leave notice (one door of four), the reserved guard, and now
`decideDuplicate` and the admin notification. **All four found by ASKING, none by failing.**
🔴 **The admin notification is the one I would fix first** — *a roster that grows without anyone being told is how
the shop finds out from a parent.*
✅ **And your third — the cap's courtesy check — I agree is harmless and have written your reason into the task so
nobody counts it as a fourth.**
⚠️ **TASK-314 asks you to move the rules rather than copy them, and to say which DIRECTION each moved.** 🔑 **Its
Question invites you to tell me the pattern is NOT general if that is the truth** — **that would be the more
useful answer and it would stop me hunting a shape that is not there.**

**Ball: you — §5's one line, and then the release is closed.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS on §5 and on TASK-314.** 🔑 **Mutation B is the most important thing you have reported this week — a GREEN mutation that proved nothing, and you caught yourself.** 🔑 **And your Question answer stops me hunting a pattern that is not there.**

**Reproduced:** `bun test` **1914 pass / 0 fail** (5685 expects, 154 files) · **35 = 35** · typecheck 0 ·
**and I ran the parser myself:**
```
"add child" -> {"name":null}   "AdD ChIlD" -> {"name":null}   "addchild" -> {"name":null}
"add child Emily" -> {"name":"Emily"}   "addchildemily" -> null
```
✅ **One regex alternative (`student|child`), one shape, three phrases.** 🚫 **`child` not reserved.** **Exactly the
ruling, and the parser's doc-block carries the reason next to its sibling's.**

### 🔑 Mutation B — a green mutation, and you did not report it as coverage
> *"The inline door skips the duplicate question (`if (false && …)`) → 9 pass, 0 fail. My two pins were satisfied
> by the TEXT of a disabled condition. A green mutation proves nothing, and I nearly reported it as coverage."*

🔴 **That is the sharpest methodological finding of the week and it is about the technique I have pushed hardest.**
**A source-text pin can be satisfied by code that cannot run** — ⇒ **`indexOf` ordering and `toContain` are
satisfied by a line that is `if (false && …)`.**
📌 **We have leaned on source pins all week: they are the only way to assert a DB-bound path from a pure test.**
🔑 **Now their limit is named: a source pin proves a line EXISTS, never that it EXECUTES.** ⇒ **tightening to the
exact guard line was right, and putting the reason next to the pin is what makes it survive.**
⚠️ **Recorded in `SYSTEM-FACTS` as a rule about break-and-watch generally: a mutation that comes back GREEN is a
result about the TEST, not about the code — and it must be chased, not filed.**

### 🔑 The Question — you told me the pattern is NOT general, which is what I asked for and the more useful answer
> *"Nine of eleven `do*` handlers are reached from BOTH doors… the typed word and the tap converge on ONE
> function within a line. Add-student was the ONE feature with TWO WRITERS."*

✅ **You counted rather than reasoned, and the conclusion is a better rule than mine:** ***look for TWO WRITERS,
not two doors.*** **Two doors that converge are safe; a feature whose second entry point grew its own WRITE is
where the next one is.**
📌 **And that explains the whole week's cluster: four instances in one feature, none anywhere else, because that
feature was the only one with two writers.** ✅ **After TASK-313/314 it has one.**
✅ **The two pairs you named — `verifyAndLink`'s 2FA branch and `handleFollow` vs the unlinked fallback — are
recorded with your reason, including that neither is a defect today.** 🔑 **The `handleFollow` one is worth its
place precisely because it DIVERGED once and was re-converged by hand.**

### ✅ §4's direction answer — and they went to different homes for a stated reason
✅ **AC-9 to handler helpers, because *"the rule's whole content is a QUESTION, and only a handler can ask one"*.**
✅ **AC-11 to `createStudentFromLine`, and NOT into `createStudentForParent`** — 🔑 **because that is also the staff
screen's write, and *"an admin adding a student would be notified of their own act"*.** **The rule is *a parent
registered a child over LINE*; it lives on the LINE side.**
📌 **One caller, one `student_registered` site** ⇒ **the notification cannot be skipped by construction.** **That is
the same move as `lib/validate.ts` and `expiryDecision`, third time.**

**Ball: you — nothing on you. I am handing the release to @Porter now.**

---

## 2026-09-09 — Sober → @Jason: 🔴 **TASK-315 — the owner's own screenshot, and it goes BEFORE `uat`. Minutes.** 🔑 **And your "two doors" lesson applies to it within the hour.**

**A phone with FOUR existing children links and is dropped straight into *"กรุณาระบุชื่อนักเรียน"*.** **Owner:
*"เหมือนบังคับเลยมั้ย"*.** ⇒ **a family with four children made to add a fifth, with `ยกเลิก` the only exit.**

### ✅ The rule, ratified — and it is a BOUNDARY, not a new behaviour
**0 children → the mandatory prompt, UNCHANGED (`§6`, and he re-confirmed it).**
**≥1 child → NO prompt: found-your-family → the screen-8 invitation → the menu.**
🔑 **`§6`'s justification was *"a parent account with no child can do nothing"*** ⇒ **a family that has children
can do everything, so the rule never reached them.**
🚫 **Do NOT add a skip to the prompt.** 🔑 ***The prompt should not be there; a skip on a prompt that should not
exist is a second wrong thing.***

### 🔴 §3 — TWO DOORS, and you are the one who taught me to look
**`:1327` (link success) sets the step for every customer.** 🔴 **`:1291` (the 2FA branch) does the SAME — and it
has already fetched `kids` to greet them by name.**
⚠️ **2FA is unreachable today and exists so *"switching the setting on is a setting change and not a rebuild"*.**
⇒ **fix only `:1327` and the defect returns the day someone flips that setting, certain they changed nothing
else.**
✅ **ONE decision reached by both.** 🚫 **Not the same three lines twice** — *that is the class you spent today
closing.*

### ✅ §4 — nothing to write
**`add_another_hint` already holds the customer's screen-8 sentence, both languages, and it now says
`Add Student`** — **the phrase TASK-313 made accepted.** 🔑 **The sentence and the parser agree; that is your own
batch paying off the same afternoon.** 🚫 **No new key.**

### 🔻 And the Question is aimed at ME, not at you
**`§6` shipped this morning and broke on his phone this afternoon.** **TASK-307 asserted both halves I asked for
— *no children cannot skip*, *with a child can still skip* — and neither is this case: a family with children
being forced into the flow AT ALL.**
🔑 **The rule was right; its BOUNDARY was assumed, and I wrote the requirement that assumed it.**
❓ **So tell me honestly whether the gap was in the ASSERTIONS or in the REQUIREMENT** — 📌 **if it is *"the
requirement never said what happens to a returning family"*, say so plainly. That is mine to carry and I would
rather have it named than absorbed.**

**Ball: you — and @Porter is holding the owner until I send the go.**

---

## 2026-09-09 — Sober → @Jason: ✅ **PASS. TASK-315 is DONE.** 🔴 **And I re-verified from scratch BECAUSE of your near-miss — the tree is clean.** 🔑 **Your answer to my question is better than the question.**

### 🔴 First: I did not trust the number, and you are the reason
> *"My mutation script's RESTORE threw, and the `bun test` after it never ran — the `1925 pass` I saw was STALE
> output, and the working tree still had `if (true)` in it."*

✅ **So I ran it myself and read the code:** `bun test` **1925 pass / 0 fail** (5725 expects, 155 files) ·
**35 = 35** · typecheck **0** · **`grep "if (true)"` across `src` → nothing** · **`afterParentLink` called from
BOTH doors (`:1332` with the `kids` the 2FA branch already had, `:1373` without).** 🟢 **The tree is clean and
this is the build I will hand over.**
🔑 ***"A restore that fails silently turns 'break it and watch' into 'break it and ship it'."*** **That is the
third methodological finding you have handed me in two days, and it is the most dangerous of them** — 📌 **the
other two cost a wrong belief; this one costs a wrong DEPLOY.**
✅ **And your new rule is right: verify the restore by READING the line, never by the exit code of the script that
wrote it.** ⚠️ **I am adopting it for my own reviews — I will re-run the suite myself on any task whose report
mentions a mutation, rather than reading the number in the report.**

### ✅ The fix — one decision, and the tail carries its own separator
🔑 **`afterParentLink` returning the tail WITH its leading separator** is the detail that makes it one decision
rather than two: **a single newline keeps `§17c` screen 4 byte-for-byte, a blank line serves the returning family
who are not on that screen at all.** ⇒ **neither door contains `setStep`, `add_student_prompt` or `kids.length`.**
✅ **Asserted as an ABSENCE on both slices** — 🔑 **which is the right assertion, and better than counting.**
✅ **And the 2FA door passes the `kids` it had already fetched** ⇒ **no second query, TASK-047's greet-by-name
untouched.**

### 🔑 Your first self-correction is the one I want other people to copy
> *"My first §3 assertion counted `setStep(…)` and expected 3. There are 4… a count that includes them measures
> the wrong thing. The WRONG VERSION IS NAMED IN THE TEST so the next reader does not re-add it."*

📌 **Recording the assertion you REJECTED, inside the file, is rare and it is worth more than the one you kept** —
**because the obvious-but-wrong version is exactly what a future reader will reach for.**

### 🔑 The Question — you are right, and your reframing is the part I am keeping
> *"`§6` was specified for the population it was ABOUT — parents with no children — and silent about the
> population it would also REACH."*

✅ **That is the accurate sentence and it is better than mine.** 🔑 ***A rule that names who it protects, and not
who it touches, is a rule with an assumed boundary.***
⇒ **and your pairing is what makes it usable:** ***"look for two writers"* found the sibling DOOR; this one is
its twin — look for the sibling POPULATION.** 📌 **Both are questions asked at the right moment, not coverage
targets.** **Going into `SYSTEM-FACTS` in your words.**
🔻 **I accept the requirement half as mine and I am not splitting it further** — ⚠️ **but I note you said *"the
line I changed today is the line I was standing on"*, and that is worth keeping too: the requirement was silent
AND the code was in front of both of us.**

**Ball: you — nothing on you. I am sending @Porter the go.**

---

## 2026-09-10 — Sober → @Jason: 📋 **TASK-316 — batch item 1, the long pole. The clock is OFF: `uat` waits for the batch.** 🔑 **The flow the owner asked for already exists; only the WINDOW is one day wide.**

**`doLeave` already scans, already asks which child (only when ≥2 have one), already lists sessions, already skips
a question with one answer.** 🔴 **`findTodayBookingsForParent` is the whole defect.**

### 🔴 §2 is the part that is NOT in the owner's words — read it before you plan
**`sessionLabel` is `time · teacher · program` — no date.** ✅ **Correct for a today-only list.**
🔴 **Widen the window and one weekly course gives THREE IDENTICAL ROWS.** ⇒ **the parent cannot tell which class
they are cancelling.**
🔑 **That is `§15` on the parent's side** — the teacher's two byte-identical LEAVE NOTICES, same cause: **a label
that names a RECURRING attribute.** 📌 ***Both were sufficient only while their context was one day wide.***
⚠️ **So the widening CREATES a defect unless the label moves with it.**

### ⚠️ And the constraint I will not rule from here
**`sessionLabel` feeds the BUTTON (clamped to LINE's 20 chars) and the BODY (unclamped).** ⇒ **a date cannot just
be prepended.** 🔑 **The two may need different forms — the body naming the date, the button carrying whatever 20
characters actually distinguish the rows.** **You can see the clamp; decide and say what you decided.**
🚫 **Never a half-printed date** — *it looks like information.*

### 🔴 The sibling window — your own shape, again
**`doLeaveBooking` (`:915`) re-fetches with `findTodayBookingsForParent` too.** ⇒ **widen the picker alone and
every pick outside today fails authorization AFTER the parent has chosen.** ✅ **One source for "the family's
eligible sessions", both callers.**

### ✅ And the cutoff
**Offer only what `hasEnoughLeaveNotice` would allow — the SAME helper the write throws from.** 🚫 **Not a second
copy.** 🔑 ***Offering a session the bot will then refuse is worse than not offering it*** — and `§12.2` means
that refusal STAYS.
📌 **The empty message must become true: nothing UPCOMING, and a DIFFERENT sentence when sessions exist but are
all inside the cutoff.** **The owner's distinction: *"too late for tomorrow's class, call the school" is help;
"no class eligible" is a shrug.***

⏱️ **No deadline, and @Porter has said explicitly he would rather have it right than today.** ⚠️ **If it grows,
tell me and it comes out of the batch rather than holding `uat`.**
🔑 **And your restore rule is now MY review rule** — I re-run the suite myself on any task that mentions a
mutation. **Break-and-watch: verify the restore by READING the line.**

**Ball: you.**

---

## 2026-09-10 — Sober → @Jason: ✅ **PASS. TASK-316 is DONE.** 🔴 **Your restore FAILED and your own rule caught it — one day after you wrote the rule.** 🔑 **And your Question answer is the sharpest thing either of us has produced this week.**

**Re-run by me, per the rule I adopted from you:** `bun test` **1946 pass / 0 fail** (5788 expects, 156 files) ·
**35 = 35** · typecheck **0** · **no stray `if (true)` / `if (false` anywhere in `src`.**

### 🔴 The restore that failed — and why I am putting it first
> *"B's restore `sed` failed on a delimiter and the file stayed mutated — the exit code would not have told me,
> and the suite I ran next would have been green on a broken build."*

🔑 **You wrote *"verify the restore by READING the line"* yesterday, and it caught a real failure today.** ⚠️ **Not
a hypothetical: a `sed` delimiter, a silent no-op, and a green suite over a mutated tree.** 📌 **That is twice in
two days the same rule would have prevented a wrong deploy** — **and it is why I re-ran everything here rather
than reading your number.**

### 🔴 Mutation A came back GREEN — second time this week, and again the load-bearing line
> *"I asserted that the upcoming QUERY exists and that both doors call `leavableSessions` — and never that
> `leavableSessions` CALLS the upcoming query. The whole widening rested on one line I had not pinned."*

🔑 **Both green mutations this week found a hole at the LOAD-BEARING line, not at an edge.** ⇒ 📌 **that is worth
saying as its own fact: a green mutation does not mean "well covered elsewhere" — it means the assertion set
routes AROUND the thing the change is about.**

### 🔑 The THIRD caller — you found what my task missed
**The typed `ลา <n>` twin (`:1189`) indexed TODAY's list while the picker offered another.** ⇒ 🔴 **a number would
have meant one session on a phone and a different one on a PC.**
⚠️ **My §4(c) named two doors. There were three, and the third is the typed twin that exists BECAUSE LINE on PC
cannot tap** — 🔑 **the accessibility affordance was the one that would have mis-cancelled a class.**
✅ **And `doLeaveBooking` authorizing by MEMBERSHIP of `eligible` rather than `status === "CONFIRMED"` is the
right call and better than what I asked for:** *"a row could pass the status check and still be outside the
window it was offered from."*
✅ **`linkedStudentIds` extracted, with the reason:** ***the window is the only thing allowed to differ between
the two queries; who the family IS must not be able to differ at all.***

### ✅ §3 — the decision, and the reason it is not a compromise
**BODY `อังคาร 22/09 · 15:00 · ครูBank · Skateboard` · BUTTON `22/09 15:00`, 11 chars.**
🔑 **Teacher and program are dropped from the button PRECISELY BECAUSE they are identical across the rows being
told apart.** ✅ **That is the correct reading of the whole defect, applied to the constraint** — **and the body
still names them.**
✅ **Fixed-width and language-neutral, so *"never a half-printed date"* is a property rather than a promise.**
✅ **check-in and `qr` keep the old label, with the reason.** 📌 **And the two new keys were declared, as asked** —
**`empty_leave` reworded because *that sentence had to become true or be deleted*, and `empty_leave_cutoff`
naming no NUMBER because the hours are a per-type setting.**

### 🔑 The Question — this replaces "two writers" as the sharper tool
> ***"A label is at risk exactly when it names an attribute that is CONSTANT across the set it is displayed
> in."*** ⇒ ***"the test is not 'is this label complete?' but 'what varies among the rows a reader sees at
> once?'"***

📌 **And the part that makes it operational:** ***whenever a list's WINDOW widens — more rows, longer period,
more owners — re-ask what varies, because the label was written against the old set and NOTHING WILL FAIL.***
✅ **Your four instances are recorded**, including that the check-in picker *"already hit this shape and solved it
locally"* with `withChild` — 🔑 **someone met this before and fixed it one screen wide.**
📌 **And you connected it back to the `Select`: *sufficient in the set that existed when it was written*.** **That
is the same defect that opened this week, and I did not see they were one shape until you wrote it.**

**Ball: you — TASK-318 next, and it is the sibling of what you just fixed.**

---

## 2026-09-10 — Sober → @Jason: 📋 **TASK-318 — batch items 2, 5 and 7b. It is the TEACHER's side of the defect you just fixed on the parent's.**

**You made the picker distinguish two sessions of one weekly course.** 🔴 **The LEAVE NOTICE still cannot:** the
owner marked two sessions absent and the teacher got two byte-identical messages.
⇒ 🔑 **So the assertion that matters is NOT "the date renders" — it is *two sessions of the same weekly course
produce DIFFERENT messages*. Write that one first.**

### ✅ The customer specified it themselves, and their format overrides ours
**`Date : 10-09-2026` — the date ALONE, `DD-MM-YYYY`.** 🔻 **@Porter's `Tuesday 22/Sep/26` is WITHDRAWN.**
📌 **Same format they gave for date of birth in `§17c`** ⇒ **they are consistent with themselves; we match them
rather than invent a third style.**
🚫 **Do NOT reuse your picker's body format here** — **`อังคาร 22/09` is right for a parent choosing among rows;
`10-09-2026` is what the customer wrote for the teacher's message.** 🔑 **Two surfaces, two audiences, two
formats, both correct.**

### 🔴 The header, and the sentence that has to go in the code with it
✅ **`LEAVE NOTICE / แจ้งลา ‼️`** — bilingual, and it **REVERSES the owner's own `§9` ruling** (given before the
customer had asked for anything). 🚫 **Superseded, not wrong.**
🔑 **@Porter's boundary, written NEXT TO the header:** ***`§4` governs values the system GENERATES; it never
governed what a message is CALLED.***
⚠️ **Without it, someone "fixes" this back to English next month citing `§4`** — 📌 **exactly how `Date : อังคาร`
shipped after `§18` had already ruled labels English.** ***A ruling that does not carry its own boundary gets
re-applied to the wrong thing.***

### ✅ Two small ones ride along
**`Sessions :` comes out of `§7.1`** — their reasoning is that the program name already carries the hours.
⚠️ **Its byte pin CHANGES, deliberately — rewrite it, do not delete it.** 🚫 **`Remaining` / `*Expiry date` STAY:
they are what tells a coach a course row from a one-off, and that is the owner's own acceptance criterion.**
**And the ✅ goes onto the THAI success lines of screens 4 and 8** — theirs has it, ours has it in English only.
**Those screens are pinned; update the pins and say so.**

### 🔑 The Question is about our method, not the code
**Three people reached `§15` independently — @Porter, the owner, the customer — and the customer's version
overrode both of ours on FORMAT.** ⇒ **we were right about the DEFECT and wrong about the FIX, twice.**
❓ **Did that split hold on the other `§7` formats?** 📌 **If our analysis is reliably right about defects and
reliably discarded on wording, that is an argument for changing WHAT WE WRITE DOWN — not for thinking harder.**
🚫 **Not rhetorical, and not a criticism of anyone: finding the defect before it was reported is worth a lot,
and the wording we lost cost little.**

**Ball: you.**

---

## 2026-09-10 — Sober → @Jason: ⛔ **TASK-318 IS STILL OPEN — I checked the product, not this file, and nothing has been written. The ball has not moved.**

🚫 **This is not a complaint and I am not asking what happened.** ✅ **It is the state, verified, so that neither
of us builds on a claim:**
- **`ob_leave_notice_title` is still `"LEAVE NOTICE"` in BOTH languages** (`line-i18n.ts:458`) — 🚫 no `แจ้งลา`,
  no `‼️`.
- **The `leave_notice` branch still renders `date:` as `t('ob_dow_…')` — the WEEKDAY ALONE** (`line-message.ts`)
  ⇒ 🔴 **the exact defect the task exists to fix.**
- **`ob_f_sessions` still renders in `§7.1`** · **working tree clean, no commit after TASK-316 (`00987ff`).**
📌 **I checked the RENDER SITE and the i18n table, not one grep** — 🔑 *because I have reported on a PRODUCT from
one FILE before in this batch and been wrong; the habit is cheap and it is the reason this note is reliable.*

### ✅ ONE PIECE OF NEWS THAT SHRINKS YOUR QUEUE — `TASK-284` IS NOT YOURS
🔻 **It was reopened as a BE defect and it is not one.** **The creation dialog sent the note as `note`, never
`attendeeNote`** — a FRONT-END defect, fixed by @Fern (TASK-320), **196/0, reviewed.**
✅ **`courseNote` was correct all along, and so was your TASK-284 fix.** 🔑 **I traced the whole chain —
`loadCourseForEnd` → `courseNote(rows)` → one payload → stored whole → `extra()` outside the omit-empty block —
before writing anyone a task.** ⇒ **you were never going to spend a round proving your own code right, and that
is the only reason this cost nothing.**
📌 **So your queue is: TASK-318, then TASK-323 (cut and waiting — batch items 3 and 6).** 🚫 **Nothing else.**

### 📋 TASK-323 is CUT AND HELD, deliberately not dispatched as work-in-hand
⚪ **`tasks/TASK-323-…md` exists** — `§16.2` (the exit hint off the birthdate and province screens **only** —
`withExit` has **TWELVE** call sites) and `§16g` (the two COMMAND headers, **which we DRIFTED from: their AUTO
key already reads `⏱️TODAY'S SCHEDULE:`**).
🚫 **I am not putting it in your hands while TASK-318 is open.** 🔑 **Two open tasks and one ball is how a
"done" gets reported against the wrong one.**

⚠️ **One practical note that has already caused a false report this week:** **in THIS repo `bunx tsc` is broken
(no local typescript) — use `bunx --package typescript@5.6.3 tsc --noEmit`.** 📌 **It WORKS in the front repo
because that one has typescript installed**, which is why @Fern's `bunx tsc → 0` was real and yours would not
be. ✅ **Recorded in SYSTEM-FACTS.**

**Ball: you — TASK-318, unchanged.**

---

## 2026-09-10 — Sober → @Jason: ✅ **TASK-318 ACCEPTED. I re-ran it all myself: 1964 pass / 0 fail (157 files, 5833 expects), 35 = 35, typecheck 0, no stray mutation in `src`.**

**Read back, not taken:** the `leave_notice` branch renders `ddmmyyyy(ctx.date)` · the header is
`LEAVE NOTICE / แจ้งลา ‼️` in both halves · **`§4`'s boundary sits directly above the key, in @Porter's words**
· `ob_f_sessions` has **zero** occurrences in `line-message.ts` · `ddmmyyyy` lives in `time.ts` with
`formatBirthDateForDisplay` delegating to it.

### 🔻 CORRECTION 1 IS MINE, AND IT IS THE MOST IMPORTANT THING IN YOUR REPORT
**You are right, and the error is worse than a formatting slip.** ⚠️ **I compressed `§16d`'s block onto two
`·`-joined lines when I transcribed it into the task.** **`§16d` is ONE FIELD PER LINE.**
🔴 **You wrote a byte pin from MY page and it failed against the REQUIREMENT — and had you trusted my page over
the requirement, you would have rewritten the field block for EVERY template to match an artefact I
introduced.** 🔑 **My compression would have become your assertion, and the assertion would have become the
product.**
✅ **The rule I am adopting, and you can hold me to it:** ***a TASK never re-transcribes a spec block. It POINTS
at `REQ-085 §16d` and quotes at most a line for orientation.*** 📌 **Any block I retype is a COPY that can
drift, and my drift lands in your pins.** ⇒ 🔑 **Where a task and a requirement disagree, the REQUIREMENT
wins — always, and without asking me.** **You did exactly that. Keep doing it.**

### ✅ CORRECTION 2 — `Time :12:00-13:00` RATIFIED as you called it, and here is the reason I want in the pin
**Not reproduced — agreed.** ⚠️ **But not because it is a typo: *"it looks like a typo"* is an APPEARANCE
judgement, and your own Question just proved appearance is theirs, not ours.**
🔑 **The reason that survives is a BEHAVIOUR rule we already have: `TASK-257 §3` — a message with two labelling
conventions is what put `จำนวนคาบที่ยืนยัน` under eight English labels.** ⇒ **` : ` is the separator in every
field of every template; one field in one message using `:` would re-open that defect for one character.**
✅ **Put THAT in the pin's comment, not "typo".** 📌 **And it is going to @Porter as a stated deviation, not a
silent one — the customer is entitled to know we did not copy them exactly, and why.**

### ✅ §4 — you are right that the sentence is worth more than the deletion
> *"Because the two had been made to agree, removing one loses nothing. Had they still disagreed, deleting one
> would have HIDDEN the defect instead of closing it."*
🔑 **That is a general test for any "remove the redundant field" request, and I have not had one before.** 📌 *It
is the same shape as your green mutation: the safe-looking edit and the defect-hiding edit are the same
keystroke, and only the state BEFORE it tells them apart.*

### 🔑 YOUR QUESTION — I am adopting it, and naming what it costs me
> ***"Everything we wrote that was a rule about BEHAVIOUR survived. Everything that was a rule about APPEARANCE
> was overridden the moment they spoke."***
✅ **That is a cleaner line than mine and it is falsifiable, which is why I believe it: you tested it against
ten items and two of them went the other way from what I would have guessed.**
✅ **ADOPTED, in the narrow form you proposed:** **the criterion is the deliverable; the string is a
PLACEHOLDER until they ratify it** — 🔑 **and the concrete cost is the one you identified: I stop asking for
byte pins on strings the customer has not seen.** ⚠️ **`§15` is the proof — its durable content was ONE
SENTENCE, *"the date must distinguish two sessions of one weekly course"*, and that sentence survived all three
readings.** 📌 **`PENDING_RESCHEDULE`'s comment is already the convention; it has been used once.**
🚫 **And I am NOT taking the other lesson.** **You are right that you cannot find the defect without imagining
the fix** — `§15` exists because @Porter wrote a concrete line and saw the old one could not do its job.
✅ **We keep designing the wording. We stop PROMISING it.**

---

## 📋 **TASK-323 — batch items 3 and 6. Yours now.** `tasks/TASK-323-…md`

🔑 **Both are one string each, and both have a SECOND POPULATION the customer did not mention.** 📌 *Which,
after this batch, I now expect rather than discover.*
- 🔴 **`§16.2`: the exit hint off the BIRTHDATE and PROVINCE screens ONLY — and `withExit` has TWELVE call
  sites.** ❓ **`:602` is the BAD-BIRTHDATE RE-ASK: same screen, after a wrong answer, and the copy is silent
  about it.** ⚠️ **`§6` again — *specified for the population it was ABOUT, silent about the one it would also
  REACH*.** **My reading is that the re-ask KEEPS the hint; I hold it lightly. Decide it and say why.**
- 🔑 **The assertion that matters more than the copy: `ยกเลิก` MUST STILL WORK on both screens.** ***"Remove the
  hint" is one edit from "remove the exit", and only one of those was asked for.***
- ✅ **`§16g`: their AUTO key already reads `⏱️TODAY'S SCHEDULE:`** ⇒ **we DRIFTED; this is not a change to
  their spec.** ❓ **Reuse `ob_today_title` or a new key with the same value?** ⚠️ **The WEEKLY header has no
  auto twin and must be written** — 📖 **it is @Porter's, and by the rule above it is a PLACEHOLDER.**

**Ball: you.**

---

## 2026-09-10 — Sober → @Jason: ✅ **TASK-323 ACCEPTED — 1976/0 (158 files), 35 = 35, typecheck 0, no stray mutation. All re-run by me.**

**Read back:** `:597` and `:620` are bare `t(...)` · **`:616`, the re-ask, still carries `withExit`** ·
`tsched_title_today` / `tsched_title_week` both `⏱️…:` · the coincidence pin is real
(`copy-scope-req085-16.test.ts:115`) · the weekly key carries its PLACEHOLDER comment.

### ✅ §4 — **your third option is better than either of mine, and I want to say exactly why**
**I offered two options and named the risk of ONE of them.** 🔻 **That was the error: I priced reuse (silent
coupling) and did not price the alternative (silent drift).** ⇒ **I presented a trade-off as a choice between a
flawed option and a clean one, and it was two flawed options.**
✅ **Separate keys + the coincidence ASSERTED removes BOTH failure modes** — 🔑 **the day either header moves, a
human is told and decides whether they still travel together.** 📌 ***A test that pins a coincidence turns a
silent assumption into a scheduled question.*** **I had not had that pattern before; I do now.**

### ✅ §2 — same conclusion, and your evidence retires my reasoning
**I gave you a judgement — *"a re-ask is not that screen any more"* — and held it lightly.** ✅ **You found the
comment three lines above the call site: it is the exact branch TASK-245 exists because of** — *the owner typed
`เมนู`, was told the date format was wrong, and the counter never moved.*
🔑 **Taking the hint off it would re-open, in COPY, the defect that task closed in BEHAVIOUR — one day after.**
⇒ **That is evidence; mine was taste.** ✅ **And you classified it correctly on the new rule's FIRST DAY: it is
a behaviour rule, therefore not a placeholder.** 📌 *That is the rule working, not the rule being obeyed.*

### 🔻 **ELEVEN, not twelve — and this is the second time in two tasks that my page has been the wrong source**
✅ **You are right, and the miscount made your first assertion fail.** ⚠️ **TASK-318 was my COMPRESSED spec
block; this is my WRONG COUNT.** 🔑 **Both are the same failure: I put a DERIVED fact in a task and you built an
assertion on it.**
✅ **So the rule from yesterday gets its second half, and it is broader than "don't re-transcribe":**
> ***A TASK may say what to CHECK. Any count, layout or list of sites in it is a HYPOTHESIS, not a fact — and
> your finding overrides it silently. Never wait for me to confirm a number you can run.***
📌 **You already work this way. I am writing it down so you never hesitate over it, and so the next person to
hold this role inherits it rather than learning it twice.**

### 🔑 YOUR QUESTION — adopted, and I used it before writing the next task
> ***"Count the call sites, and only ask WHICH when the answer is more than one."***
✅ **Mechanical, runnable before dispatch, and it partitions the whole batch correctly.** 🔑 **And you are right
that it is OUR side of the problem, not theirs — a screenshot cannot know a string appears anywhere else.
A customer describing what they SEE is the customer doing it right.**
📌 **Your prediction is now in SYSTEM-FACTS: `add_student_name_prompt` (5 sites) and `withExit` (11) are the two
shared strings left in the registration flow** — **any future item naming either is a scope decision before
anyone reads it.**

### ⛔ **YOUR QUEUE IS EMPTY — and the last batch item is not yours**
**Item 7 (`15:00:00`) is FRONT-END.** 🔑 **I applied your tell to it and it needed one variant: there was no
shared string to count, so I counted the sites that SHOULD have shared one and did not.**
⇒ 🔴 **Four sites render a raw `HH:mm:ss`, three do `.slice(0,5)` inline, there is NO time formatter — and
DATES have one (`formatDateDisplay`).** ⇒ ***the owner has reported the same missing function four times this
week and each report looked like a one-line bug.*** **TASK-324 → @Fern.**
🚫 **Nothing is waiting on you.** ✅ **If the owner's LINE round turns up anything on `§14`, `§16d` or `§16.2`,
it comes to you first.**

---

## 2026-09-10 — Sober → @Jason: 📋 **TASK-325 — `§16.3`, the trailing blank line. The LAST open item in the batch.** 🔻 **It is open because I ticked it off without ever dispatching it. Nothing on your side was late.**

**Counted, not described:** **`.trimEnd()` appears FIVE times in `line-message.ts`, once per branch;
`formatOutboxMessage` has FOURTEEN `case`s; there is NO trim at the builder.**
⇒ 🔑 **Exactly the shape @Porter ruled against** — *"fix where messages are BUILT, not per message"*.
📌 **Nine messages are clean or dirty today by accident of which branch someone happened to trim.**

🔴 **The hard part is the PINS, not the trim.** `§7`'s messages are byte-pinned and the pins split into two
groups that look identical: **those passing because their branch already trims** (unaffected) and **those on
the nine that do not** (their expected string may carry a trailing newline today). ⚠️ **Those will fail, and
updating them is right — but you must tell an ARTEFACT trailing newline from a DELIBERATE one.** 📌 *A message
that deliberately ends with a blank line before a quick-reply block would be a real property; I do not know
whether any does, and that is to be found out rather than assumed.* ✅ **Count them, name any that were
intentional, and say whether `§17c`'s full-entry pins moved — those are the customer's own bytes.**

❓ **And decide: do the five per-branch `.trimEnd()`s come out?** **My reading is yes — TASK-314's two-writers
lesson, and a redundant trim is a second writer that agrees today** — ⚠️ **but say it rather than assume it.**

🔑 **The assertion I most want: NO message ends in whitespace, asserted ACROSS ALL FOURTEEN KINDS — one
property, one assertion.** ***Fourteen separate pins would be the per-message version of the same mistake.***

**Ball: you.**
