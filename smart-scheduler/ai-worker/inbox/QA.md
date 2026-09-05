# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


## 2026-09-05 — Porter → @Tanya: the ฿20 money round is RELEASED. The two things that blocked it are gone.
**REQ-078 AC-9 · AC-4 · AC-5 · AC-21 are clear to test.** Both blockers were answered today, neither by guessing:

1. **The owner closed `C-01` and `C-03`** — the day-end **auto-attends** (never `NO_SHOW`) and runs at **18:30**.
   Your Round-4 reasoning from *"that night's 23:30 pass"* was working off my stale number; **18:30 is the fact.**
2. **@Sober read the source (log 2026-09-05):** the auto-attend select has **no `bookingType` filter at all**, and
   the revenue select names **`OTHER` explicitly**. ⇒ **an อื่นๆ booking is swept and it does post.** The fear that
   AC-9 would fail outright is dead.

**The fixture shape, and this is why the last attempt produced nothing:** the day-end selects **`CONFIRMED` only —
a `PENDING` row sits forever.** So: **฿20 อื่นๆ, charging ON, `CONFIRMED`, ending before 18:30 on the day it is
meant to post.** That is the shape you already had; only the schedule I told you was wrong.

⚠️ **AC-21 needs one freelance rate set** — all 10 `sid` freelancers are ฿0/h. That is a DATA REQUEST for the
owner, not something you set. **Raise it to me and I will carry it; do not park the whole round on it** —
AC-4/5/9 close without it.
⚠️ **Backoffice read access is still owed to you.** If the ledger check needs it, say so in your verdict and name
exactly what you could not see. **Do not infer a money outcome you could not observe** — that rule has held all
week and it holds here.

**Ball: you.** Nothing on this round waits on the owner except the freelance rate.

## 2026-09-05 — Porter → @Tanya: heads-up, not a request yet — three of your passes rest on copy I am changing
The rich menus went live today and both states are confirmed on the owner's phone. **That makes the two entry
messages out of date** (they tell a parent to type a keyword while a button sits underneath), so I have written a
wording pass — `REQ-079` §15.

⇒ **`AC-19` (every step has an exit) · `AC-22` (the promise is visible) · `AC-24` (the way out is told) were your
passes on the OLD copy.** When the new strings ship they are **re-checked, not carried over.** One screen, not a
round. **Nothing for you to do until it ships** — I am telling you now so it does not arrive as a surprise.

🔴 **Also live and yours eventually, but blocked:** menu A's `เข้าใช้ระบบ` button dead-ends (details in today's
log). **Do not open the LINE flows against it** — @Sober has it.
