# TASK-232: BE — Flow 1: the parent enters a phone, their children appear (2FA branch built, OFF)

- Source: SPEC-071 **Amendment #2** (2026-09-02) · REQ-079 **§2** — *"ฉันเอาแค่เบอร์ ก็สามารถใช้งานได้เลย"*
- Status: ✅ DONE — code (Sober 2026-09-02) · ⚠️ 2FA cannot be switched ON until the owner answers DELIVERY → @Porter. Was: REVIEW — ⚠️ 2FA code DELIVERY open (see §Questions)
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## 🔴 READ THIS FIRST — the invite is CUT. So is the code before it.

**Two mechanisms have now been deleted from this task.** If you started against the previous version, stop and
re-read: **there is no invite code, no generator, no alphabet, no TTL, no single-use redemption, no lockout, and
no admin "opens the door" step.** The 8-char base32 design I decided yesterday is dead — I decided the shape of
a thing the owner then removed, and that is on the record rather than quietly dropped.

**The flow is now:**

```
ผปค : 0812345678                    ← the phone. INBOUND, so this is ALSO what binds the chat
[ 2FA step — in the flow, OFF by default ]
บอท : พบข้อมูลของคุณแล้วค่ะ — น้องรดา, น้องต้น
```

## What to do

**1. Phone → family.** The phone lookup is now the **binding event**: it is the first inbound message that
identifies a family, so it is where `family_line_links` is written (TASK-230's accessor — `familyOfLineUser` /
`familyLineUserIds`; **one reader, nothing outside it**).
- 🔴 **The unique index still decides:** a `line_user_id` already bound to family A **cannot** be re-bound to
  family B. Assert the refusal, not just the index. *(Without it a parent sees another family's children — the
  one guarantee that survived all three entry designs.)*
- **Phone not found** → retry + `คุยกับแอดมิน`, and **no hint about whether that number is a customer.**

**2. 🆕 The 6-digit 2FA — built, shipped OFF.**
- A **per-session** verification step **between the phone and the children**.
- **Switched by `app_settings`** — REQ-031's mechanism (TASK-101/102), the same shape the retired weak-code check
  used.
- 🔴 **Turning it on must be a SETTING, never a rebuild.** The branch exists from day one. **A stub that would
  need this flow re-cut later is explicitly not what was asked for.** ⇒ **prove it with a test that flips the
  setting and gets different behaviour with no code change.** That test is the deliverable, not the branch.
- 🚫 **Do not choose its lifetime, attempt count or lockout.** Those return to the **owner** the day it is
  switched on, and are **not** inherited from the two deleted designs. Leave them as named constants with a
  comment saying exactly that.

**3. `parentChildrenNote` — the rule changed, and it must change deliberately, not by omission.**
`line-pairing.ts:19` (REQ-020 / TASK-047) answers a phone with **a count, never names**, because *"anyone who
types a phone number would otherwise be told that family's children's names."* **REQ-079 §2 overrides that on
this path, with the owner's eyes open and the customer's refusal on record.**
⇒ **Change it where the new flow needs it, and leave every other caller byte-identical** — assert both. 🚫 Do not
delete the function or its comment; **add the new path's reason beside the old one**, so the next reader sees a
decision rather than an erosion.

## 🔴 The accepted risk — do not harden it in this task

Anyone who knows a phone number can see that family's children and act for them. **The owner raised it with the
customer, explained the danger, and the customer refused.** `SYSTEM-FACTS.md` and REQ-079 §2 carry it in full.
🚫 **Do not add a "small extra check" because it feels safer.** That is the quiet hardening §2 forbids. If you
believe something is genuinely unsafe, **say so and stop** — the way you did on the invite code, which is the
reason this design is now the owner's choice rather than our assumption.

⚠️ **What bounds the risk is AC-20: LINE never unlocks anything that moves money.** The grep-guard test is now
load-bearing, not tidy — it is the reason this entry design is survivable.

## Definition of Done — the OUTCOME
- [ ] A known phone binds the chat and returns **the children by name**.
- [ ] A chat already bound to family A is **refused** a re-bind to family B (assert the refusal).
- [ ] Unknown phone → retry + admin, **no existence hint**.
- [ ] **2FA off (default):** phone → children, no extra step. **2FA on (setting flipped in the test, no code
      change):** the verification step appears and gates the children.
- [ ] `parentChildrenNote` is **byte-identical for every caller outside this flow** — asserted.
- [ ] AC-20's grep-guard still proves no money path is reachable from these modules.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. **No migration.** 🚫 Nothing sent, no DB run.
- [ ] 🚫 **`0030` is NOT edited** — `family_invites` ships dormant (SPEC-071 Amendment #2 explains why).

## Implementation Notes (Jason, 2026-09-02)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `03458a3` |

🔴 **No migration**, and **`0030` is not edited** — `family_invites` ships dormant, as Amendment #2 requires
(`git diff drizzle/` shows only the journal line `0030` itself added).

### What changed

| File | Change |
|---|---|
| `src/lib/family-link.ts` | **new** `bindFamilyLine` — the phone is the binding event |
| `src/lib/line-2fa.ts` **(new)** | the 6-digit step: code, match, placeholders, and a delivery seam that throws |
| `src/lib/settings.ts` | **new** `line_parent_2fa` enum key, default `off` |
| `src/lib/line-pairing.ts` | **new** `parentChildrenNames` **beside** the untouched count version |
| `src/lib/line-i18n.ts` | 4 new keys (names, other-family refusal, 2FA prompt + bad) |
| `src/lib/line-routing.ts` | `AWAIT_2FA` is a linking step |
| `src/services/line-webhook.service.ts` | the phone branch: bind → refuse cross-family → 2FA branch → names |
| `src/services/line-phone-entry.test.ts` **(new)** | 20 tests, incl. **the AC-20 grep-guard** |
| `src/lib/settings.test.ts`, `line-silence.test.ts` | two existing assertions widened — see below |

### The guarantee that survived all three entry designs
`bindFamilyLine` refuses a chat already bound to a **different** family, **before anything else is written** —
asserted, because if the bind were attempted after `linkParentLine` / `moveRosterLink`, a refused chat would
already have been re-pointed. The database would refuse it anyway via
`family_line_links_user_uq`; refusing here is what turns a `23505` into a sentence a parent can act on.
Re-binding the **same** family is a no-op — a parent who types their phone twice has done nothing wrong.

### `parentChildrenNote` — a decision beside the old one, not an erosion
The function and **its reason** are untouched. `parentChildrenNames` sits next to it with the new path's reason
written out: TASK-047's argument *was not refuted, it was accepted* — the owner put the danger to the customer
in those words and the customer chose the convenience.

📌 **And the two are not interchangeable.** With 2FA **on**, the parent sees the **count** before verifying and
the **names** after. So TASK-047's rule is still honoured wherever a gate exists — which is also why the old
function still has a live caller instead of becoming dead code the next reader deletes.

### 🔑 The deliverable you named: flipping the setting, no code change
`twoFaEnabled()` reads `app_settings` **on every use** — a cached flag would have made switch-on a restart, and
a test asserts there is no cache. The branch is a single `if` in the existing flow plus one `AWAIT_2FA` step:
**with the setting off, `needs2fa` is never set and the path is byte-identical to before.**

🚫 **Lifetime, attempts and lockout are named placeholders that say they are placeholders** and that the owner
decides on switch-on. They are explicitly **not** inherited from the family code or the invite code — both were
deleted, and their parameters went with them.

📌 **A wrong 2FA code reuses TASK-231's two-strikes rule** rather than getting a bespoke lockout. A wrong code
*is* an unrecognised in-flow reply; giving it its own counter would be the second definition that drifts.

### 🔴 The one thing I built to FAIL rather than guess
**How a parent receives the six digits is specified nowhere.** There is no SMS integration, and sending them to
the LINE chat being verified verifies nothing. So `deliver2faCode` **throws**, with a message naming the
decision. Switching the setting on without wiring delivery is then discovered immediately by whoever flips it —
rather than by a family who can no longer reach their children's schedule. A silent no-op would have been the
worst outcome: the feature on, and nobody able to pass it.

### AC-20's grep-guard — written, and it is what makes this door survivable
New: the four LINE entry modules are asserted to contain **no money symbol** (`recordSale`, `postBookingSale`,
`boMovement`, `boItem`, `applyHoldMove`, `reconcileBookingHolds`, `otherPriceMinor`, `discountKind`) **and to
import nothing that does** — a transitive reach would defeat a symbol check alone. If a money path ever became
reachable from here, the phone-alone door would stop being a convenience decision and become a financial one
**without anyone re-opening the question**.

### Two existing tests widened, both deliberately
- `settings.test.ts` — the registry key list gains `line_parent_2fa`.
- `line-silence.test.ts` — `strikeOrPrompt` now has **three** call sites, not two. **That the 2FA step is the
  third is the point**, and the test says so.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1159 pass / 0 fail (+20)
git diff drizzle/                               → journal only; 0030 not edited
```
🚫 Nothing sent, nothing run against any database.

## Questions
- 🔴 **The 2FA branch is complete except for one thing that is not decidable by me: how the parent RECEIVES the
  six digits.** There is no SMS integration in this system, and sending the code to the LINE chat that is being
  verified verifies nothing — the attacker in the accepted-risk scenario is already in that chat. So
  `deliver2faCode` **throws**, with a message naming the decision.

  **This is a transport, not a rebuild** — the flow, the step, the storage, the verification and the copy all
  ship — so it does not violate *"turning it on must be a setting"*. But it does mean **the setting cannot
  usefully be turned on until the owner answers "how does the code reach them?"**. I chose a loud throw over a
  silent no-op deliberately: the failure then lands on whoever flips the switch, not on a family who can no
  longer reach their children's schedule. **If you would rather it degrade to 2FA-off with a `console.error`,
  that is one line — but I think failing loudly is right and I want the choice recorded.**

- **`AWAIT_2FA` parks the code in `pending_role`.** That column already carries "what this step is waiting on",
  and the alternative was a migration for a branch that ships OFF — which `0030` was explicitly not to be
  reopened for. It is named and commented so nobody is surprised by a code in a column called `pending_role`.
  **Say the word and it becomes a proper column the next time a migration is open anyway.**

- ⚠️ **A consequence of the phone being the binding event, which I want confirmed rather than assumed.** The
  refusal *"this LINE account belongs to another family"* is now permanent from the bot's side: there is no
  unbind. A family that genuinely changes phones — or a parent who linked with the wrong number once — needs an
  **admin** to clear `family_line_links`, and **no admin surface for that exists** (TASK-235 was withdrawn). It
  is correct that the bot cannot unbind itself, but *"contact an admin"* currently points at a person with no
  button. **Not blocking; it is the first support call this design will generate.**

- **I did not add any check the task did not ask for.** §2's "do not harden it quietly" is respected: the phone
  alone opens the door, the names come back, and the only gate is the one that ships off. The AC-20 grep-guard
  is the sole thing I strengthened, and that is because you called it load-bearing rather than tidy.

- 🟢 **TASK-240** (`coursePackages` course search) is still mine, still after-the-release, still untouched.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-02: ✅ **PASS.** And your delivery question is the one that would have been discovered on the day it was switched on.

**Reproduced:** `tsc --noEmit` → **0** · `line-phone-entry` + `line-routing` → **26 pass / 0 fail** ·
`deliver2faCode` at `line-2fa.ts:48` · `parentChildrenNames` at `line-pairing.ts:35`, **beside** the untouched
count version · `0030` not edited.

📌 **`parentChildrenNote` handled exactly right.** The function and its reason are untouched, the new one sits
beside it with the new path's reason written out, and the framing is the true one: **TASK-047's argument was not
refuted, it was accepted** — the owner put the danger to the customer in those words and the customer chose the
convenience. **And the old function still has a live caller**, because with 2FA on the parent sees the *count*
before verifying and the *names* after. That is the difference between a rule that was superseded and one that
was deleted, and it is why the next reader will not remove it as dead code.

📌 **Refusing the cross-family bind BEFORE `linkParentLine` / `moveRosterLink`** is the detail that matters: after
them, a refused chat would already have been re-pointed. **The database would refuse it anyway; refusing here is
what turns a `23505` into a sentence a parent can act on.** Same instinct as `describeSlotClash`.

📌 **`twoFaEnabled()` reads `app_settings` on every use, with a test asserting no cache** — because a cached flag
makes switch-on a **restart**, which is a rebuild by another name. That test *is* the owner's requirement.

### ✅ Q1 — the 2FA delivery seam. **Your loud throw is right, and this goes to @Porter today.**

**You found the hole in the owner's instruction, not in the task.** *"Build it, ship it off, switch it on when
the customer cares"* assumes the only missing thing is a flag. It is not: **there is no SMS integration, and
sending the code into the LINE chat being verified verifies nothing — the attacker in §2's accepted-risk
scenario is already in that chat.**

- **Throw, not degrade.** A `console.error` + silent 2FA-off puts the failure on **a family who can no longer
  reach their children's schedule**; a throw puts it on **whoever flipped the switch**. The person who caused the
  failure should be the person who sees it. Recorded as your choice and I am endorsing it.
- **Your framing is also correct: this is a transport, not a rebuild.** The flow, the step, the storage, the
  verification and the copy all ship. So the owner's instruction is honoured.
- 🔴 **But it must not be discovered on the day he flips it.** ⇒ going to @Porter as a plain sentence:
  **"2FA is built and off. It cannot be usefully switched on until the owner answers how the six digits reach the
  parent — there is no SMS in this system, and LINE cannot verify LINE."** That belongs in REQ-079 §2 beside the
  2FA paragraph, not only in this task.

### ✅ Q2 — the code parked in `pending_role`. **Accepted, with one condition.**

Reusing the column rather than reopening `0030` for a branch that ships off is the right trade, and the risk is
contained (`AWAIT_CODE`'s role read is guarded by its own `step`). **Condition: put the comment on the COLUMN in
`schema.ts` as well**, not only at the use site — someone reading the schema sees `pending_role` and has no way
to know. And **add the assertion that no path reads `pendingRole` as a role while `step = AWAIT_2FA`**; that is
the property that keeps the overload safe rather than merely currently-safe.
📌 It becomes a proper column **the next time a migration is open anyway** — not before. Recorded so it is a
deferral, not an accident.

### 🔴 Q3 — no unbind, and *"contact an admin"* points at a person with no button. **You are right, and it is mine.**

*"It is correct that the bot cannot unbind itself"* — yes. But the design I wrote creates a **permanent** state
with a message that promises a remedy nobody can perform: a family that changes phones, or a parent who linked
with the wrong number once, is stuck. **TASK-235's withdrawal removed the only admin surface anywhere near
this**, and I withdrew it.

**That is a hole in my design, not new scope**, so I have cut **TASK-243** — an admin control to clear a family's
LINE link — and flagged it to @Porter as *following from the design* rather than added to it. He can strike it.
📌 **You called it "the first support call this design will generate."** That is the right test for whether
something is a gap or a nice-to-have, and it is worth more than the fix itself.

✅ **And you added no check the task did not ask for** — §2's "do not harden it quietly" respected, with the
AC-20 grep-guard the only thing strengthened, because I called it load-bearing.

**Status → DONE (code).** 🟢 TASK-240 still yours, still after the release.
