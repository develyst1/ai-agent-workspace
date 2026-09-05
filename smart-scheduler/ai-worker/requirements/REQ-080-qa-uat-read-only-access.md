# REQ-080: QA read-only access to `uat` — narrow the guard on `frontoffice`, EXTEND it to `backoffice`

- Status: **READY_FOR_SA** · scope widened 2026-09-04 (SA Q2 answered) — **§4b is the sharp part, read it first**
- Priority: **HIGH** — it unblocks 9 open contradictions the owner is waiting on
- Requested: **2026-09-04 by the owner (โด่ง)**, relayed to Porter by **Marie** (workflow operations)
- Deadline: none

> ⚠️ **Provenance, stated openly.** This requirement did **not** reach Porter from the owner directly. The owner
> gave the two decisions to **Marie**, and Marie relayed them to Porter on 2026-09-04. Recorded as **the owner's
> decision, Marie as the relay**, so the provenance is never in doubt later.

---

## 1. The decision, in the owner's own words

Two statements, both 2026-09-04:

> **"full access sid server , read only uat server"**  *(his answer on contradiction **C-11**)*

> **"แก้ QA.md กับ guard เลย ใช่ uat คือ frontoffice"**  *(which also closes contradiction **C-31**)*

So, settled:

| Environment | QA's access |
|---|---|
| **`sid`** — `som.develyst.online` + `backoffice-som.develyst.online` | **FULL** — read and write test data. Unchanged. |
| **`uat`** — `frontoffice.develyst.online` + `backoffice.develyst.online`, **the system the customer opens** | **READ-ONLY** — reading now permitted; **writing absolutely forbidden.** |

**And `uat` IS `frontoffice.develyst.online`.** That is the owner's answer to C-31 and it is what makes the grant
above legible at all: the box QA may now read is the customer's production box, holding **real families, real
children, real money records** since REQ-055 landed.

**The rule files are already updated** (Porter, 2026-09-04): `ai-worker/QA.md` and `ai-worker/PROTOCOL.md`.
**This REQ is the part that is code**, and code goes through the chain.

## 2. Problem / Goal — 🔴 TWO halves, not one

> **Scope settled 2026-09-04 (owner, relayed by Marie): the grant covers BOTH `uat` hosts —
> `frontoffice.develyst.online` AND `backoffice.develyst.online` — read-only.**
> *"backoffice รวมด้วย read-only"*

The two hosts are in **opposite** states in the code, and the work is therefore two different jobs that happen to
live in one script. **Neither half is optional.**

| Host | In `PRODUCTION_HOSTS` today? | What QA can do today | What this REQ must do |
|---|---|---|---|
| `frontoffice.develyst.online` | ✅ listed | **nothing** — the guard refuses outright | **NARROW** the guard so a **read** becomes possible |
| `backoffice.develyst.online` — the customer's **money UI** | 🔴 **NOT listed — never has been** | **anything**, including **writes** — nothing in the script stops it | **EXTEND** the guard to this host so a **write** becomes impossible |

⇒ The REQ is **not** only *"narrow a guard so a read is possible"*. It is **also** *"extend the guard to a host it
never covered, so a write becomes impossible."* See **§4b**, which is the sharper of the two.

**The rule now permits a `uat` read. The code still refuses it. Nothing has actually changed for QA.**

`scripts/mint-session.mjs` in the **front-end repo** (`smart-scheduler-front`) carries:

```
const PRODUCTION_HOSTS = ["frontoffice.develyst.online"];
…
if (PRODUCTION_HOSTS.includes(url.hostname))
  die(`Refusing to mint a session for PRODUCTION (${url.hostname}). …`);
```

It exits 1 for that host **by design**, and it is the tool QA uses to get a session at all. So today:

- Tanya cannot read `uat`, even though the owner has said she may.
- **Tanya refusing that read is CORRECT** and is not a breach of the owner's grant. She has already refused on
  exactly this point once (2026-08-23), saying she would not work around the guard **even with the owner's
  say-so** — and that judgement was right then and stays right until this REQ lands.
- Nobody works around the guard in the meantime: no hand-crafted cookie, no alternative route, no "just this once".

**Goal:** make a **read-only** `uat` session obtainable through the sanctioned tool, with **every write path still
impossible**.

## 3. Requirement

1. The system must allow QA to obtain a session for **`uat`** — **both hosts** — that can **read** the
   application: open screens, view lists and records, read reports.
2. That session must make **every write impossible** — create, update, delete, import, deploy, restart,
   configuration change, and any other state-changing call. Not "discouraged", not "policy", not "QA promises":
   **impossible**.
3. 🔴 **`backoffice.develyst.online` must be brought UNDER the protection, not merely permitted a read.** It is
   absent from `PRODUCTION_HOSTS` today, so a **write-capable** session against the customer's money UI is
   possible right now. After this REQ, it must not be. **See §4b — this is a tightening, not a relaxation.**
4. The `sid` behaviour must not change. Full read + write on `sid` continues exactly as today.
5. The refusal path must stay honest: if a write is attempted on `uat`, it must **fail visibly**, not silently
   no-op and not appear to succeed.
6. Whatever mechanism is chosen must be **legible to the person running it** — Tanya must be able to tell, from
   what the tool prints, that the session she holds is the read-only one and which host it is for.

## 4. 🔴 The hard constraint — this is the whole requirement

> **The guard must NOT simply be removed.**

Deleting `frontoffice.develyst.online` from `PRODUCTION_HOSTS`, or short-circuiting the check with a flag that
merely bypasses it, converts a **read-only grant into full production write access**. That is **not** what the
owner authorised, and it is the exact failure this project has been burned by before: a narrow permission
implemented as a wide one because the wide one was easier.

**Whatever replaces the guard has to make writes impossible, not merely discouraged.** A design whose safety
rests on the tester's restraint, on a naming convention, or on a comment saying "read only please" does not
satisfy this REQ and must be rejected at spec review.

📌 The existing guard's own error text already says the right thing — *"that is a decision to route up the chain
— not to work around here"*. This REQ **is** that route up the chain. It replaces the guard with a narrower one;
it does not vindicate working around it.

## 4b. 🔴 FINDING — `backoffice.develyst.online` is NOT in the guard, and never has been

**Verified by reading the source, 2026-09-04** (read-only; no code was touched):
`H:\…\smart-scheduler-front\scripts\mint-session.mjs` line 22 —

```
const PRODUCTION_HOSTS = ["frontoffice.develyst.online"];
```

**One host. `backoffice.develyst.online` is not there.** It is the only entry in the array and always has been.

### Why that matters more than the half everyone has been discussing

The `uat` situation has been talked about as if it were symmetric. **It is not.**

- **`frontoffice`** — guarded outright. QA is blocked from reading it. That is the blocker `REQ-080` was raised
  to fix, and it is the **less** serious half.
- **`backoffice`** — **unguarded.** Nothing in that script stops a **write-capable** session being minted against
  **the customer's finance system** today. Not a read: a **write**. The money UI.

**What has actually been holding that line is the written rule and Tanya's own discipline** — nothing mechanical.
And the written rule was, until 2026-09-04, *"Production — 🚫 never. Not read, not write, not 'just a GET.'"*

### 🔴 The consequence, stated plainly

> **Relaxing the written rule without extending the guard leaves the money UI LESS PROTECTED than it was this
> morning.**

Before today, `backoffice` had no guard but a "never touch it" rule. As of today it has no guard and a
**"read-only, reading is permitted"** rule. The rule moved toward access; the code did not move at all. **The one
control that existed on that host was the sentence we just rewrote.** That is a net loss of protection, produced
by a decision whose intent was narrow, and it is why this REQ now has two halves instead of one.

📌 **This is a tightening, not a relaxation.** For `frontoffice`, `REQ-080` opens a door that is currently shut.
For `backoffice`, it must **close a door that is currently open**. An implementation that does only the first
half satisfies the owner's words and leaves the project worse off than before he spoke.

⚠️ **Nobody is being accused of misusing this.** QA's discipline is exactly why it has never mattered — Tanya
refused a `frontoffice` read she was authorised for rather than work around a guard. **The point is that the
protection was never mechanical, and discipline is not a control you can hand to the next person.**

🚫 **Not fixed here, deliberately.** The guard is product code. Porter has not touched it and will not. This is
Sober's to design (§9 Q1 governs *how*) and an engineer's to build.

## 5. Why it matters — what is blocked right now

- **9 of the 45 open contradictions in `SYSTEM-FACTS-CONTRADICTIONS.md` are answerable only by reading current
  state**, and several of those need **`uat`** specifically — the state in question is the customer's, and only
  `uat` has it. They stay open until this lands.
- The owner is being asked to answer questions **a read would answer for him.** He is the person who nudges five
  roles and runs the commands; every question we can retire by looking is one he does not have to.
- **C-11 is otherwise answered but not actionable.** Its entry records the blocker in those words: the answer
  changed no rule and no guard, and until the code changes QA will (correctly) still refuse.

## 6. Acceptance Criteria

> 🔴 **Every AC below applies to BOTH `uat` hosts** — `frontoffice.develyst.online` **and**
> `backoffice.develyst.online`. An AC proven on one host only is `NOT_TESTED` on the other, never a pass.
> AC-8 and AC-9 are the **backoffice/§4b half** and are the ones most easily skipped.

- [ ] **AC-1 (the read works — both hosts)** — **Given** the sanctioned tool and QA's credentials, **When** a
      session is requested for **either `uat` host**, **Then** a session is issued and QA can open the
      application and **read** data. Proven separately on frontoffice **and** backoffice.
- [ ] **AC-2 (every write is refused — both hosts)** — **Given** either `uat` session, **When** any write is
      attempted — create, update, delete, import, or any state-changing call — **Then** it **fails**, visibly,
      with a clear reason. Tested on **more than one** write path per host, not just the first one found.
- [ ] **AC-3 (no silent success)** — **Given** a refused write, **Then** nothing is persisted and the UI does not
      report success. *(This project has shipped a "1 row · success" for a 9-row day; a refusal that looks like a
      save is worse than a refusal that looks like an error.)*
- [ ] **AC-4 (the guard was narrowed, not deleted)** — **Given** the changed code, **Then** a **write-capable**
      session for `uat` is still refused. Removing the protection entirely fails this AC.
- [ ] **AC-5 (`sid` regression)** — **Given** `sid`, **Then** minting a full read + write session works exactly
      as before, with no new step and no new flag.
- [ ] **AC-6 (it is obvious which session you hold)** — **Given** a `uat` session, **Then** the tool's output
      states plainly that it is **read-only** and names the host.
- [ ] **AC-7 (regression — no other environment gained access)** — **Given** the change, **Then** no host that was
      unreachable before this REQ becomes reachable, other than the `uat` read described here.
- [ ] **AC-8 (🔴 §4b — the backoffice door is CLOSED)** — **Given** the changed code, **When** a
      **write-capable** session is requested for `backoffice.develyst.online`, **Then** it is **refused**.
      🔴 *This case **passes trivially against today's code** — the guard does not list that host, so the write
      session is issued. The test must **fail before the fix and pass after it**, or it proves nothing.*
- [ ] **AC-9 (§4b — both halves landed, not just the easy one)** — **Given** the delivered change, **Then**
      `frontoffice` has gained a **read** it did not have **and** `backoffice` has lost a **write** it did have.
      🔴 **A delivery that does only the frontoffice half FAILS this REQ**, even if every other AC passes —
      it would leave the money UI less protected than before 2026-09-04 (§4b).

## 7. Constraints

- **`uat` holds real customer data.** Every acceptance test of this REQ that runs against `uat` is itself a read;
  the write-refusal cases (AC-2/AC-3) must be provable **without** leaving a row behind. How to prove a refusal
  safely on a live customer box is part of the SA's design, not an afterthought for the tester.
- The **UAT GATE** still applies to anything that ships to `uat` — Porter **and** Tanya both sign.
- QA credentials for `uat` are the owner's to provide, via Porter, into `../project-docs/` — never into a tracked
  file, a log entry, or pasted output.
- **No agent edits the guard outside this chain.** Not Marie, not Porter, not QA. It becomes a TASK or it does
  not happen.

## 8. Out of Scope

- Any **write** access to `uat`, for anyone, in any form. A `uat` write remains a **DATA REQUEST** for the owner.
- Changing `sid` access, the deploy process, or the UAT GATE.
- Cleanup tooling on `uat` (that is REQ-057) and any data migration.
- Resolving the other 38 open contradictions. This REQ only removes the blocker in front of the ones a read
  would answer.

## 9. Questions — @Sober (Porter must NOT answer these)

> **Q2 is ANSWERED (2026-09-04) — it was the owner's, it was asked rather than assumed, and his answer widened
> the scope. Q1 and Q3 remain OPEN and are Sober's.** Porter is deliberately not deciding either of those:
> both are technical.

1. **How is read-only enforced, technically?** The requirement is that writes be **impossible**, not
   discouraged. Options that exist on paper — a role/scope on the minted session, a separate read-only backend
   credential, a database-level read-only user, a proxy that refuses non-GET methods — differ enormously in how
   much they actually guarantee and in how much of the stack must change. **Which one genuinely makes writes
   impossible for this app, and what does it cost?** Please state explicitly what the chosen mechanism does
   **not** protect against.

2. ✅ **ANSWERED — 2026-09-04. Both hosts are in scope, read-only.** *(No longer open; recorded here so the
   question and its answer stay together.)*

   > **Owner, 2026-09-04, relayed by Marie: *"backoffice รวมด้วย read-only"*.**

   ⇒ QA's read-only grant covers **`frontoffice.develyst.online` AND `backoffice.develyst.online`** — both `uat`
   hosts, read-only on both, **writes forbidden on both**.

   *The question as asked:* the owner had said *"ใช่ uat คือ frontoffice"* — naming **frontoffice** — while the
   environment he granted was **`uat`**, which on this project is **both** hosts. Porter did not assume; the
   question went to the owner and he widened it himself.
   🔴 **His answer is what surfaced §4b:** the guard lists only `frontoffice`, so bringing `backoffice` into
   scope means bringing it under protection it has never had. **Read §4b before designing anything.**

3. *(Sober's call)* Does the change belong in `mint-session.mjs` alone, or does a real read-only guarantee force
   a change in the backend too? If it is backend work, say so early — it changes who builds it.
