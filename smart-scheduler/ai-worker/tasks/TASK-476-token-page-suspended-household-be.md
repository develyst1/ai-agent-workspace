# TASK-476 — the public check-in token page does not refuse a SUSPENDED household, while the LINE path does — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration. **Live today** — it is not new, and it is not part of REQ-108.

## §0 What it is
Found while reading for TASK-475 (§A5): the LINE check-in refuses a suspended household (`isSuspendedLineParent`), and **the public token page does not**. So a family the shop has suspended can still check in through the link they already have. It is a small hole, it has been there a while, and it is being fixed **on its own** rather than inside a new feature — a pre-existing gap that rides along in someone else's task is a gap nobody can find again.

## §1 Build
- The token check-in path applies the **same suspension rule** the LINE path applies, through the same helper — not a second reading of what "suspended" means.
- The refusal says what the LINE path says. 🚫 No new wording, no new code path.
- **Camp's token page too, if it has the same gap** — say what you found; if it refuses already, say that.
- Pinned by value: a suspended household's token ⇒ refused, an active one ⇒ unchanged (the existing pins must not move).
- 🚫 Nothing about REQ-108 here; TASK-475 inherits this fix rather than repeating it.

## Definition of Done
- [ ] The rule applied through the existing helper (pinned by source that it is not a second definition) · both token pages checked and the finding stated · by value both ways · suite **count** · tsc 0 · migrations unchanged · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — both token pages refuse a suspended household, FIRST, with the LINE path's words; 3087 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **3087 pass / 0 fail** (+8; new `src/services/token-page-suspended-req019.test.ts`) · `tsc` **0** · migrations unchanged (**57 = 57**) · **no existing pin moved**.
- 📌 Two of my own recent fixtures (TASK-474's and TASK-475's) needed a fake for the new read (the student → parent lookup). I added it as "no parent", which is never blocked. No assertion changed.

## §1 What I found
- **`/checkin` (session):** refused nobody. Confirmed, and fixed.
- **`/checkin/camp`: the SAME gap.** `checkinCampByToken` checks status, token and date (`campScanOutcome`), and never the household. Fixed the same way.

## §2 The fix: one rule, the same words, FIRST
- **`anyHouseholdSuspended(studentIds)`** (`parent.service.ts`, beside `findParentOfStudent`) is **`blockedBySuspension` over each child's parent**. That is `lib/suspend.ts`, built on `isSuspended`, the LINE path's own predicate. **Not a second reading**, pinned by source: neither page reads `suspendedAt` or calls `isSuspended` itself.
- **The words are the LINE path's:** `tb("suspended_notice")`, as `400`. No new string.
- **FIRST:** the check runs right after the row is found, **before the "already" answer**. So a suspended household's token gets **no booking and no remaining back**, matching the LINE rule "refused … and gets NO data back". Pinned by order, and by value.
- **A DUO row has two households: either one suspended refuses the row** (it checks both children in at once). 📌 That is my reading; tell me if a DUO row with one active family should go through.
- **The walk-in carve-out is kept:** a child with no parent is never blocked (by value).

## §3 By value, through the root app
- `/checkin`:
  - suspended ⇒ 400 with the notice, **no attend**;
  - suspended + ATTENDED ⇒ still 400, no `booking` in the body;
  - DUO with the co-student's family suspended ⇒ 400;
  - active ⇒ 200, attended as before;
  - walk-in ⇒ 200.
- `/checkin/camp`: suspended ⇒ 400 and the day is **not marked**; active ⇒ marked as before.

## §4 Two notes
1. **Two wordings exist in the codebase for one policy.** The LINE path says `suspended_notice` (*"บัญชีถูกระงับ — ติดต่อเจ้าหน้าที่"*); booking and buying say `SUSPENDED_MESSAGE` (*"บัญชีผู้ปกครองถูกระงับ — ติดต่อเจ้าหน้าที่เพื่อเปิดใช้งานก่อน"*). The task said "what the LINE path says", so the token pages use that. If one wording is wanted everywhere, that is its own small task.
2. **TASK-475 inherits this, as you wanted.** The shop-front act runs `checkinByToken` / `checkinCampByToken`, so it now refuses a suspended household at the act too, behind its lookup's neutral empty list. Nothing was repeated there.

## Break-and-watch: `mut476.mjs`, 7 mutations, **7 bite**
Every bite shows real failing tests, not just a count below the baseline. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `cf33fd67…`, identical before and after. `BASELINE=59` read off the run on 4 suites.
- A 🔴 the session page refuses nobody
- B 🔴 the check moved **after "already"** (the data comes back)
- C a DUO row checks only the primary
- D 🔴 camp refuses nobody
- E 🔴 the helper never finds a suspension
- F 🔴 a walk-in blocked
- G a second wording

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25), with an answer to your DUO question and one item raised to the owner
Re-run by me, twice: **3087 pass / 0 fail** · tsc 0 · 57 = 57 · no existing pin moved.
**The gap was wider than I described it: camp's page had it too** — `campScanOutcome` never looked at the household at all. Finding the sibling rather than fixing only the one I named is the point of cutting this separately.
**The shape is right:** one helper, neither page reading `suspendedAt` for itself, **the check running FIRST** so a suspended family gets no booking and no remaining count back (a refusal that still leaks the class details is not a refusal), the LINE path's own words, and a walk-in never blocked.
📌 **Your DUO reading — confirmed as the interim default, and raised to the owner because it is a policy, not a rule of code.** A DUO session is one row on one shared course, so refusing when **either** household is suspended is the conservative and technically coherent answer, and *"fail closed where money is involved"* is the right default to ship. ⚠️ But the human consequence belongs to the shop, not to us: **the second family's child is turned away at the door because the other family owes money.** I have put that to the owner in those words through Porter. If he wants the other child let in, it is a small change and he should make it deliberately.
📌 **Your second note — two wordings for one policy** (LINE's vs booking/sale's) — is a real inconsistency and you used the one I asked for. Not fixed here; recorded so it is not rediscovered as a defect later.
