# TASK-354 — `REQ-088 §10.3` back end: a linked account is TOLD, and can UNLINK through the one writer — plus the 500 cap raised

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-14)
▶️ **OWNER, from the page LIVE on `uat`.** **Size S.** 🚫 No migration. ⏱️ **One deploy to `sid` with @Fern's
half; he tests once. CONTRACT FIRST — she is building the other half.** ⛔ **Chain stopped — `§10` and the cap.**

---

## §1 🔴 What the owner found is ITEM 12 — the orphan-parent gap you named on TASK-347, now on his phone
> *"เมื่อเราเชื่อมรหัสไปแล้วครั้งนึง แต่กดลิ้งอีกแล้วพอกดเบอร์อื่น เหมือนเราไม่รู้ว่าเราลิ้งค์ไปแล้ว มันไม่มี error หรือ
> warning มาเตือน แต่เงียบไปเฉยๆเลย"*
🔑 **He opened the link as an already-linked account and entered ANOTHER phone. Silence.** ✅ **That is your
TASK-347 §5.2 exactly:** *a NEW phone from a bound account creates an orphan parent B while the account keeps
answering A* — **the gap you mirrored from the chat per Rule 1 and named for the list.** 📌 **The owner found
it himself, and his fix is better than a refusal: TELL them, and let them UNLINK.**

## §2 The ruling
**On open, if this LINE account is already linked to a parent: say so — *"this LINE account is already linked
to (phone 0xx-xxx-xxxx). Unlink?"* — with an UNLINK button; after unlinking, the normal flow proceeds.**
🔑 **The unlink is the SAME operation the admin's `Clear LINE link` does — `clearFamilyLine` — one writer, one
more door.** 🚫 **No silent path remains: linked ⇒ warned.**

## §3 The contract — write it FIRST, send it to me
**Two additions to `routes/register.ts`, both `POST`, both token-first, both codes-not-words:**
1. **`POST /register/status`** `{ idToken }` ⇒ `{ ok: true, linked: false }` **or** `{ ok: true, linked: true,
   phone: "<masked>", childCount: n }`. 🔑 **`phone` MASKED — `0xx-xxx-xxxx` — the page must not be handed the
   full number of an account it merely holds the token for.** *(Say the mask rule.)* 🚫 **No names — TASK-047.**
2. **`POST /register/unlink`** `{ idToken }` ⇒ `{ ok: true, unlinked: true }` — **calls `clearFamilyLine(parentId,
   actor)` with the family resolved from `sub`.** ❓ **`actor`: the admin's door passes the admin; this door has
   no admin — say what you pass and why** (📌 *my reading: `"line:<sub>"` — the parent unlinked themselves, and the
   audit should say so*). **Then the page proceeds to `lookup` as if fresh.**
⚠️ **And `lookup` / `link` for an ALREADY-BOUND account entering a NEW phone must no longer be the silent
orphan path:** 🔑 **with `status` on open the page will have warned first — but assert the SERVER side too:
a bound account calling `link` with a phone that is not its family's is refused with `LINE_BOUND_TO_OTHER_FAMILY`,
even when the phone is NEW.** *That closes item 12 in the one writer, for both doors — say if the chat's
behaviour changes as a result, and how.*

## §4 The 500 cap — @Porter's call: RAISE. **The number is mine: 2000.**
**`validation.ts:339` — the ADMIN's parent write, `note: z.string().trim().max(500)`.** ⇒ **`max(2000)`.**
🔑 **Why 2000 and not "whatever the column allows":** the column is `text` (unbounded), but the note is READ by
a human in a `Textarea` — **2000 is ~25 lines: room for ten machine-appended addresses plus a staff note,
still a guard against a runaway append.** 🚫 **Only the PARENT's note cap moves — the other `max(500)`s on that
file are other fields.** ✅ Asserted: the parent's cap is 2000, the others unchanged.

## §5 What must not change
- 🚫 `clearFamilyLine`'s audit and behaviour · the admin's `clear-line-link` route · `bindFamilyLine`'s
  guarantee · the chat's REPLIES.
- 🚫 `§9`'s writer · `PROVINCE_UNKNOWN` · the `§17c` files.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 📜 **The contract sent to me BEFORE the code**
- [ ] 🔑 **`status` reports linked/not with a MASKED phone and no names** — asserted, the mask asserted
- [ ] 🔑 **`unlink` calls `clearFamilyLine` — the one writer — and the actor is stated** — asserted by absence of
      any second unlink path
- [ ] 🔴 **A bound account + a NEW phone is REFUSED at `link`** — asserted, ⚠️ *item 12 closed for both doors;
      say what the chat now does*
- [ ] **The parent note cap is 2000; every other `max(500)` unchanged** — asserted
- [ ] **`§17c` re-checked by name**
- [ ] 🔑 **Break it and watch** — `finally`, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **Item 12 sat on the list as "found by looking" for two days, and the owner found it by USING the page in
two days.** ⇒ ❓ **Of the items still on the list, which would he find the same way — by using the product
normally — and which would he never find?** 📌 *That split is a better priority than size.* 🚫 **Name them.
Build nothing.**

---

# 📜 THE CONTRACT — @Jason → @Sober, for @Fern, BEFORE the code (2026-09-14)

**Two additions to `/api/register`, both `POST`, both `{ idToken }` only, token-first, codes not words. Everything from TASK-347 §C0 applies (`TOKEN_*` refusals, no `message`, no `lang`, no ids in any body).**

## `POST /api/register/status` — *"is this LINE account already someone's?"* 🚫 WRITES NOTHING
| reply | when |
|---|---|
| `{ ok: true, linked: false }` | `sub` belongs to no family |
| `{ ok: true, linked: true, phone: "0xx-xxx-xxxx", childCount: n }` | `sub` is bound to a family (`familyOfLineUser`, the ONE accessor) |
🔑 **The mask rule, on the server:** **the first TWO digits shown, every other digit replaced by `x`, in the customer's display grouping** — `0812345678` ⇒ `08x-xxx-xxxx`. *Enough for a parent to recognise their own number's prefix, not enough to hand a stranger a phone number from a token they merely hold.* A phone that is not the standard 10-digit shape is masked ENTIRELY (`xxx-xxx-xxxx`) rather than leaked. 🚫 **No names, no children's names, no parent name — TASK-047: a count, not a list.**

## `POST /api/register/unlink` — *"this account leaves its family"* ✍️ THE ONE WRITER
| reply | when |
|---|---|
| `{ ok: true, unlinked: true, cleared: n }` | the family `sub` belonged to has had its LINE binding cleared |
| `{ ok: true, unlinked: false }` | `sub` was not linked — idempotent, not an error; the page proceeds to `lookup` either way |
🔑 **Calls `clearParentLineLink(parentId, actor)` — the admin's own service function, which calls `clearFamilyLine` — with the family resolved from `sub`.** The same code path the admin's `POST /parents/:id/clear-line-link` runs, **including its atomic two-write clear and its rich-menu unlink after commit.** One writer, one more door.
❓ **`actor` = `"line:<sub>"`** — your reading, and mine for the same reason: **the audit line (`[family-link] CLEARED … by=`) must say a PARENT did this to themselves, distinguishable from an admin's id.** The prefix is the discriminator; the sub is the who.
⚠️ **ONE CONSEQUENCE THE PAGE MUST SAY, because the writer decides it:** ***`clearFamilyLine` clears the FAMILY's binding — EVERY LINE account the family holds, not only this one.*** A household where both parents linked (TASK-230) loses BOTH when one taps Unlink. **That is what the admin's button does and what "the same writer" means; I am not narrowing it.** 📌 *For @Fern's copy: "unlink" should read as "this family's LINE connection", not "my phone".* If the owner wants a per-account unlink, that is a second writer and a different task.

## `link` — ITEM 12 CLOSED IN THE ONE WRITER, for both doors
🔴 **A bound account calling `link` (or `lookup`) with a phone that is not its own family's is refused `LINE_BOUND_TO_OTHER_FAMILY` 409 — NOW INCLUDING A NEW PHONE.** *The orphan-parent path is gone: no parent row is created for a bound account.*
⚠️ **The CHAT changes as a result, and this is the "say how":** a linked parent who types `สมัคร` and enters a phone that is not their family's used to get `verify_parent_ok_new` (and an orphan row); **they now get `verify_parent_other_family`** — the reply that already exists for exactly this meaning: *"this LINE account belongs to another family — contact an admin."* No new key, no new copy. 🔑 **Same writer ⇒ same refusal on both doors; the chat gains a refusal it never had, and I have not read a way for that to be wrong.** Re-entering their OWN phone is still a no-op success on both doors (`alreadyBound`).

## The cap
`validation.ts` — **`createParent.note` and `updateParent.note`: `max(500)` ⇒ `max(2000)`** — both are the PARENT's note; the other six `max(500)`s on that file (student note, booking notes, reasons) are other fields and stay.

---

# 📤 REPORT — @Jason → @Sober (2026-09-14)

✅ **DONE (code).** **2114 pass / 0 fail**, **171 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)** · codes only. **The contract went to you first.** Changed: the one home (item 12 + `status`/`unlink`/mask), the route (two POSTs), `validation.ts` (two caps). New: one test file. **No pin moved.** `§17c` by name: ten files, zero touched.

## §1 🔴 ITEM 12 — closed in the ONE writer, for both doors, and the chat's new behaviour named
`linkFamilyByPhone`: on the new-phone path, **`familyOfLineUser` is checked BEFORE any parent row exists** ⇒ a bound account entering a phone that is not its family's is `line-bound-to-other-family`, even when the phone is new. **No orphan row can be created any more.** `lookupFamilyByPhone` says the same on the read-only path, so the page can warn before a tap. 🚫 *The "NAMED, NOT FIXED" note I left in the code on TASK-347 is gone — asserted gone.*
⚠️ **THE CHAT CHANGED WITH IT — the "say how":** a linked parent typing `สมัคร` and entering a phone that is not their family's **used to get `verify_parent_ok_new` plus an orphan row; they now get `verify_parent_other_family`** — the reply that has meant exactly this since SPEC-071 (*"this LINE account belongs to another family — contact an admin"*). **No new key, no new copy; the chat's five verify keys are still five (asserted as DISTINCT keys — `ok_existing` renders twice, with and without the 2FA note).** Their OWN phone is still a no-op success on both doors.

## §2 🔑 `status` — told, MASKED, no names
`maskPhone`: first TWO digits, every other digit `x`, the customer's grouping — `0812345678` ⇒ `08x-xxx-xxxx`. ✅ Asserted that the last four are NOT shown, and that a non-standard phone is masked ENTIRELY (`xxx-xxx-xxxx`) rather than leaked. The route hands the page ONLY `linked`, the masked `phone` and `childCount` — `parentId`, `children`, `name`, `nickname` asserted ABSENT from the reply. The masking happens in the HOME, not the route: the raw phone never reaches it. `status` writes nothing, asserted.

## §3 🔑 `unlink` — the one writer, one more door, actor `line:<sub>`
`unlinkSelf` → **`clearParentLineLink(parent.id, \`line:${sub}\`)`** — the admin's own service function → `clearFamilyLine`: the atomic two-write clear and the rich-menu unlink after commit, unchanged. ✅ **By ABSENCE, no second unlink path:** neither the home nor the route contains `delete(familyLineLinks)`, `lineUserId: null` or a direct `clearFamilyLine(`; the admin's door is asserted unchanged. **Actor `line:<sub>`** — yours and mine: the audit line (`by=…`) says a parent did this to themselves, distinguishable from an admin id. Not linked ⇒ `{ unlinked: false }`, idempotent, not a refusal — the page proceeds to `lookup` either way. Rule 4: the chat session goes with the family.
⚠️ **THE CONSEQUENCE, in the code beside the writer and asserted there:** ***it clears the FAMILY's binding — EVERY account the family holds, not only this one.*** That is what the admin's button does and what "the same writer" means; this door does not narrow it. 📌 *For @Fern's copy via you: "this family's LINE connection", not "my phone".* A per-account unlink would be a second writer and another task.

## §4 ✅ The cap
`createParent.note` and `updateParent.note` → `max(2000)` — both are the PARENT's note. **The other SIX `max(500)`s on the file are other fields and are asserted still 500 (6 remain, 2 are 2000).** The reason is beside the number so nobody lowers it back for tidiness.

## §5 🔑 Mutation — six, `finally`, checksum — all bite
item 12 re-opened · the mask leaks the last four · `status` hands over `parentId` · a SECOND unlink path in the home · the actor made anonymous · the cap lowered back.

## §6 ❓ YOUR QUESTION — *which items on the list would he find by USING the product, and which would he never find?*
🔑 **The split, honestly drawn — and it is two different KINDS of item, not two priorities of one kind:**

**🟢 FOUND BY USE — the owner is currently the only test for these, and each one costs him a report and a deploy:**
1. ✅ **Item 12** — found, closed today.
2. ✅ **The `max(500)` cap** — he WOULD have found it, as *"the admin form won't save this parent"* after ~5 page registrations of one family, with a validator's message that names nothing he did. Closed today, before he met it.
3. 🟡 **A VOUCHER's `Program` line carries no size while its `Remaining` says `4/6 sessions`** (TASK-343) — on every voucher message; he will see it the first time he reads one carefully. *Mild, but this class.*
4. 🟡 **The picker's `อังคาร 22/09` beside `08-09-2026` everywhere else** (TASK-344 §2) — he uses the picker; he will SEE the third format. ⚠️ *Whether he calls it wrong is his — he chose it — but he will meet it.*

**⚪ NEVER FOUND BY USE — these are properties of the SUITE, the TYPES, or the TOOLING, and no amount of normal use touches them:**
5. The suspended-household pin that stays green when the guard is deleted (TASK-346) · 6. TASK-342's 18 empty-region tests · 7. the Thai-in-a-generated-value output check and the labelling output check (TASK-345) · 8. the branded `IsoDate` (TASK-344) · 9. `mustAddChild` read by both doors (TASK-347) · 10. the one restore helper (TASK-342) · 11. **`Program : 6 HR` counting SESSIONS in the arithmetic behind it** (TASK-343) — *invisible while a session is an hour, which is always, today* · 12. the last-write-wins race on `parents.note` (TASK-352) — *an address vanishes once a year and nobody connects it.*

📌 **What the split says about priority, and it is not "do the green ones first":**
- **The green ones are cheap and each one he finds costs a deploy and some of his trust — do them first, and that is what he is asking.**
- ⚠️ **But "never found by use" does NOT mean "never found." It means *found by a PARENT, in production, as the first symptom of something else* — the worst finder there is.** Item 12 was on the list as "found by looking" precisely because a test had named it; the ones in the white class have no test naming them yet, which is the whole reason they are on the list. 🔑 ***The green class is where the OWNER is our QA; the white class is where the SUITE is — and the suite is cheaper than him.*** *Size the white ones by that, not by "he will not notice".*
