# SPEC-074 — a family may hold several LINE accounts, and today only one of them works

**Status:** ACTIVE · **From:** @Sober (2026-09-06) · **Source:** @Jason's read in `TASK-255` (no code changed)
**`uat` batch, #1 — not cuttable.** The customer has been told in writing that several parents can link and act
for each other; **cutting this means correcting that.**

---

## §1 The defect, as behaviour

A family links two accounts (mother, then father):
- 🔴 **Outbound:** every message goes to **whoever linked most recently**. The other parent is **not sent to, not
  marked SKIPPED, and produces no error** — there is one outbox row and it is `queued`.
- 🔴 **Inbound:** the other parent is **not recognised as a parent at all.** `เช็คอิน`, `ลา`, `คอร์สของฉัน` fall
  to `silence` / `welcome`. **Their phone is not merely quiet; it does not work.**

**Cause, in one line:** `linkParentLine` overwrites `parents.line_user_id` for a second account of the same
family, and **every routing decision in the product reads that column** — outbound at three sites, inbound at
`findParentByLineUserId` (**seven call sites, plus a hand-rolled copy in `checkin.service.ts:82`**).

## §2 🔴 The good news, and it decides the size: **both accessors already exist and are already correct**

```
familyLineUserIds(parentId)  → [parents.line_user_id, ...family_line_links] deduped   ← what outbound needs
familyOfLineUser(lineUserId) → links first, THEN the column as fallback               ← what inbound needs
```

**Neither needs new logic.** `familyLineUserIds` has **two callers and neither sends anything**;
`familyOfLineUser` is called **once**, inside `bindFamilyLine`'s own guard.
⇒ **This is wiring, not design.** 📌 **And `familyOfLineUser`'s fallback to the column is what makes the change
safe for existing data:** a family whose `family_line_links` row predates nothing still resolves. **No backfill.**

## §3 🔴 The trap that would make the fix look like it did nothing

`reminderKey = reminder:<type>:<personId>:<date>` — **per person**, enforced by
`notification_outbox_idempotency_uq`. **Today one parent means one device, so the two are the same thing.**

⇒ **The moment outbound writes a row per account, two rows for one family share one key, the second hits the
unique index, and it is swallowed as a duplicate.** 🔴 **The father gets nothing, exactly as before, and every
test of the accessor passes.**

**The key must identify the DEVICE, not the person** — `reminder:<type>:<personId>:<date>:<lineUserId>` or
equivalent. ⚠️ **And the old format must keep meaning what it meant** for rows already queued: a change here is
the same class as TASK-258's generation-0 rule. **Say which shape you chose and why it cannot collide with a
pre-existing row.**

## §4 What changes, in three layers

| Layer | Change | Size |
|---|---|---|
| **Outbound** | the three sites → `familyLineUserIds`, **one outbox row per account** | small |
| **Inbound** | `findParentByLineUserId` → `familyOfLineUser` (7 sites + the hand-rolled copy) | 🔴 **the larger half, and the one that makes the promise true** |
| **Upstream** | `linkParentLine` stops overwriting — **first linked stays primary** | small |

📌 **On the column after this:** `parents.line_user_id` stops being a routing fact and becomes **the family's
primary account, for display**. ⚠️ **Write that in the schema comment.** A column that used to steer everything
and now steers nothing is exactly the kind of thing the next person re-uses by accident.

## §5 🔴 Ship both halves or neither — and this is a requirement, not a preference
**Today the second phone is consistently dead.** Outbound alone makes it **inconsistently alive**: messages
arrive, `เช็คอิน` does nothing. ⇒ the family reports *"the bot is broken"* instead of *"my husband gets
nothing"* — **the first is unactionable, the second is a bug report.** **A half-fix is worse than the defect.**

## §6 What this spec does NOT change
- 🚫 **The unique index on `family_line_links`.** It is doing its job; nothing else was using what it protects.
- 🚫 **`clearFamilyLine` and its menu unlink** (TASK-243 / TASK-249) — already correct for several accounts.
- 🚫 **Any message's content.** REQ-077's templates are untouched; **more people receive the same message.**
- 🅿️ **Whether a family should be able to CHOOSE who receives what.** Nobody has asked for it. **Do not build a
  preference nobody requested** — the promise was *"ทำแทนกันได้"*, which is everyone, not a setting.
