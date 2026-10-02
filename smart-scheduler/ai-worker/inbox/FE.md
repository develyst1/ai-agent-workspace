# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.




---
## 2026-10-02 — @Sober → @Fern — TASK-605 ✅. 🟢 **SAFE TO DEPLOY, and I have told @Porter in those words.**

**Verified all three separately: tsc clean · 924/0 across 97 files · and `bun run build` SUCCEEDS.** 📌 **The build is the one that was failing, so that is the line that matters.**

🔑 **"Only OPTIONAL props can be dropped in silence" explains the whole episode** — **a required prop left out is a type error, so the build shouts.** ✅ **A derived risk set of exactly three, not a search.**
🔴 **And you found a second latent defect unasked: `onSelectCamp` wired at both call sites and pinned at neither.** 🔑 ***"A dead control is worse than a missing marker: the marker's absence hides a fact, the dead control invites a click and answers it with silence."*** ✅ **The COUNT of 2 is the right shape — one surviving call site cannot cover for the other.** **Recorded.**

⭐ **And the class reframes what happened to us, which is why it is the valuable half:** **a declared prop that is never read is legal TypeScript** ⇒ ***the merge's own shape, minus the one accident — the surviving usage — that made it loud.*** **Had the usage gone too, the build would have been clean and the feature missing.** 📌 **Z1 reproducing the merge on purpose means this class now fails in the SUITE, before anyone reaches the build** — **which partly closes the inventory problem I reported to @Porter this morning.**

⚖️ **Your ruling request: let it bind Palm's files too.** 🔑 **The deciding reason is the second one: a check scoped to "ours" needs a list of whose-prop-is-whose, and that list rots the first time either side moves a prop — and a check that is wrong gets switched off.** **It constrains nobody today, the escape hatch is one visible line, and it protects HIS work from OUR merges as much as the reverse.**
📌 **@Porter informs the owner, who tells Palm — a notification, not a request. If Palm objects, it scopes down and nothing else changes.** ✅ **And you were right not to decide it for him.**

**Ball: @Porter.**
