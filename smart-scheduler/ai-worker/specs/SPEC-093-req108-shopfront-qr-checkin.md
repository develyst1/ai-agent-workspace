# SPEC-093 — `REQ-108` a fixed QR on the shop front for self check-in — ANALYSIS, sizes, and the credential decision (Sober, 2026-09-25). **No build; the owner rules the guard first.**

---
## §1 🔴 The credential — the decision this REQ turns on
**What a false check-in actually costs, so the owner rules on facts rather than a feeling:** a check-in does not merely tick a box. It marks the session ATTENDED, **consumes the family's credit**, and **sends the parent a deduction message**. So a stranger who knows a phone number can, today's design unchanged: **see the family's children by name**, **burn a paid session**, and **make the parent's phone buzz with a notice about a class their child never attended.** That is not a privacy nuisance; it is money and trust.
And the number is not a secret: it is written on forms, shared in group chats, and known to every parent who has ever arranged a lift home.

### The options
| | what it is | strength | cost |
|---|---|---|---|
| **A** | phone alone, as the sheet describes | 🔴 none — the QR is on a wall, so the page is public | 0 |
| **B** | phone + today/window/no-PII-before-match limits | reduces the blast radius, does not stop it | S |
| **C** | phone + a 6-digit code sent to the family's LINE | strong — a stranger with the number cannot receive the code | S–M (the plumbing exists: `line_parent_2fa`, `generate2faCode`; only delivery is unimplemented, deliberately) |
| **D** ⭐ | **the QR opens LINE (a LIFF), so the parent is identified by LINE itself — no phone typed at all** | strongest, and **simplest for the parent** | BE S + FE M, and it reuses `/register`'s id-token verification wholesale |
| **E** | a QR that rotates daily on a counter screen | makes the QR itself a secret | defeats the point — the customer wants one printed sheet on the wall |

### ⭐ My recommendation: **D, with B as the floor, and C only as a fallback**
**The parent scans the wall QR, LINE opens, and we know who they are — cryptographically, with nothing typed.** No phone box, no child names shown to a stranger, no code to wait for. It is *less* work for the parent than the customer's own flow, and it removes the credential problem instead of managing it.
📌 **It also answers "does the phone need to be LINE-linked?" — with D the question dissolves:** the customer's own words are *"the phone registered in the LINE system"*, so the family is expected to be linked already. A family that is not linked is exactly the family the shop front should point at the sign-up QR instead (REQ-107's own new flow, one screen away).
**Keep B regardless of which option wins:** today's sessions only, inside the check-in window (including K5's late minutes), and **nothing about a family shown until they are identified**. Those limits are cheap and they bound every remaining option.
**C is the fallback if the owner insists on a phone box** (for a parent whose LINE is on another phone, say). ⚠️ Two honest costs: the code is a **push**, and pushes are quota'd — we hit that ceiling on the demo OA this week; and code delivery has never been implemented, deliberately (`line-2fa.ts` throws with a note saying the owner must choose how it is delivered). So C is not "switch it on" — it is a small build plus a quota conversation.
🚫 **A is not an option I will build silently.** If the owner chooses it knowing the three consequences above, that is his call and I will record it in the task — but it must be a decision he takes in words, not one we make by shipping the sheet as written.

---
## §2 The rest of the answers
- **Today's sessions only, inside the window — yes**, and the window is the one K5 (TASK-474) is widening, including its late minutes. Same rule, one place: a shop-front check-in must not be able to do something the LINE check-in cannot.
- **Camp days — yes, included.** Camp already has its own scan path and its own credit rules (REQ-104); the shop QR lists a camp day exactly as it lists a class, and consumption follows the camp rules, not the session ones.
- **The ATTENDED state and the parent's notice are the SAME as every other path** — this is a new door onto the existing act, not a second implementation. That is the single most important build constraint here, and the thing I will refuse to see forked.
- **Where the admin gets the printable QR:** a small panel on the **Settings** page (it is a shop-wide, one-off artefact, not a per-session one) with the QR and a print button. `QrDialog` / `qrcode.react` already exist from the camp work — this is reuse, not new.

---
## §3 Sizes
| piece | BE | FE |
|---|---|---|
| The shop-front page: who am I → my children's sessions today, in window → check in | **S** (one read + reuse of the existing attend path) | **M** (the page and its three steps) |
| Option D's identity (LIFF id-token, reusing `verifyLiffIdToken`) | **S** | included above |
| Camp days in the same list | **S** | S |
| The printable QR panel in Settings | 0 | **S** |
| Option C instead of D (phone + LINE code) | **S–M** + a quota conversation | S |
**Total with the recommendation: BE M · FE M.** No migration. 📌 If the owner picks A, it is BE S · FE M — **cheaper today and the reason we will be writing an incident report later**; I would rather spend the extra day.

---
## §4 Timing — and the useful answer for Porter's planning
🔑 **REQ-108 changes no menu, no artwork and no LINE message.** It is a new page and new endpoints. ⇒ **The REQ-107 demo republish should go ahead NOW, without waiting for REQ-108.** Tanya can check the menus, the collapsed panel, the new wordings and K5 on the demo OA while this is still being built, and nothing she checks will move underneath her.
**What that buys:** the menu round gets its screenshots and its fixes early, and REQ-108 joins the same `uat` release later as pure additional code — which is exactly what the owner asked for ("they must go together") without the menus waiting on it.
⚠️ **The one sequencing rule:** REQ-108 uses K5's window (TASK-474), so it builds **after** that lands — not a blocker, just an order.

---
## §5 — OWNER'S RULING, 2026-09-25: phone-based. **My recommendation was wrong on its premise.**
The owner rejected LINE identity, and the reason is one I did not consider: **the person at the counter is often a NANNY or a DRIVER**, with no access to the parent's LINE. My §1 recommendation (⭐ D) assumed the parent is the one scanning — it would have locked out exactly the people who most often do the drop-off, and the pushed-code fallback (C) fails for the same reason. **Read §1 with that correction: D and C are not available, and it is not a matter of appetite for risk.**
**What survives from §1, and it is the part that mattered:** the floor (B) is now the build — today's sessions only, inside the window including K5's late minutes and the settle rule; **only children with a check-in-able session right now, never the whole family; no names at all when there is none**; the parent's notice firing at once so misuse is visible; and a rate limit on lookups.
⚠️ **The gap that remains, stated so nobody has to rediscover it:** guard 3 is a LINE notice, so **a family with no linked LINE has no safety net** — for them the phone is the only credential and nothing tells them it was used. That is why TASK-475 records **where a check-in came from**: an admin can then see it arrived from the wall QR rather than from staff, which is the only evidence an unlinked family will ever have.
