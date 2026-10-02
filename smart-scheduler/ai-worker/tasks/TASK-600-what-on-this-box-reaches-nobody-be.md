# TASK-600 — what on this box reaches NOBODY — BE, S ⏸️ **SIZED, not dispatched**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-10-01) · **My proposal, now with two instances behind it.**

## §0 Why — **two found by accident in two days**
1. **uat's Teacher role holds `menu:calendar` but not `action:calendar.teacher-leave`** ⇒ **21 linked coaches, and the advance-leave feature reaches nobody.**
2. **sid's admin notice is `SKIPPED — "no admin recipient configured"`** ⇒ **the admin LINE list is one box-level `app_settings` row, and when it is empty EVERY admin notice goes nowhere.**
🔑 **Same class: a feature that is deployed, green, and reaches nobody — because a PER-BOX LIST is empty.** ⇒ **Both were found by a tester trying to use the thing.** 📌 **That is not a testing strategy.**

## §1 The deliverable — ONE read
**An admin-visible answer to: *what on this box is configured such that a shipped feature reaches nobody?***
- **Action keys held by NO role** (and so grantable to nobody). 🔑 **Sixty keys; this is the first half.**
- **The admin LINE list being empty.**
- ⚠️ **And derive the rest rather than listing these two.** 🔑 **Every audience is a LINE link and every permission is a row — so the question generalises, and I want the generalisation, not two special cases.**
- ⚠️ **Per-person gaps are DIFFERENT and must not be mixed in:** **a teacher without a LINE link misses their OWN notice, which is visible per row and is not a box-wide blackout.** ✅ **Count them if it is cheap, but keep them separate.** 🔑 **One list is "nobody can ever receive this"; the other is "this person did not."**
- 🚫 **No fixing, no granting, no writing.** **A read.**

## §2 Not in scope
🚫 Granting anything · 🚫 the suppression trace (TASK-599) · 🚫 the FE's placement, until the read exists.

## Definition of Done
- [ ] One read answering the question · **the set of "reaches nobody" conditions DERIVED, not enumerated from the two known cases** · per-person gaps **kept separate and labelled** · 🚫 nothing written or granted · suite **count** normally **and DB-unreachable** · tsc · mutations incl. **a reachable key reported unreachable** · report + `inbox/SA.md` + log.
