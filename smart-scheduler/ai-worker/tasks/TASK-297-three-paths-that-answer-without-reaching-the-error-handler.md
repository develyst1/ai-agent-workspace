# TASK-297 — three paths answer without reaching `app.onError`, and one returns no envelope at all

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
📌 **NO CLOCK. Blocks nothing.** 🚫 No migration. 🚫 No FE change.
**Source:** **your own §4 answer on TASK-296.** 🔑 **You found these while answering a question, named them
precisely, and correctly did not touch them on deploy night.**

---

## §1 The three, in your words
1. 🔴 **`webhooks.ts:12`** — `c.json({ error: "invalid signature" }, 401)`. **`error` is a bare STRING**, so a
   reader doing `body.error.code` / `.message` gets `undefined` **twice**. ⚠️ **The same shape as DEF-5**, unseen
   because **the reader is LINE's servers, not a person.**
2. **`calendar.ts:15` and `:18`** — `c.notFound()`, Hono's plain-text 404 on the public ICS route.
3. 🔴 **There is no `app.notFound` handler at all** ⇒ **every unknown path under `/api` returns plain-text
   `404 Not Found`**, and **a client calling `res.json()` on it gets a parse error rather than an envelope.**

🔑 **In each of the three, `app.onError` exists, is correct, and is not on the path.** ⇒ ***a handler that is not
reached is worse than a missing one: it looks handled.***

## §2 ⚠️ What makes this worth doing at all, and what makes it NOT urgent
✅ **Not urgent:** **no admin sees any of these.** (1) is read by LINE, (2) by a calendar client, (3) by a
developer typo or a stale client. **Nothing here is on the owner's release path.**
🔴 **Worth doing:** **TASK-296 stopped the one path we knew escaped the envelope. These are the paths we now
KNOW escape it** — 📌 *and the whole lesson of DEF-5 is that "nobody would ever hit it" survives only until one
gate moves.*

## §3 What to do — and the judgement is yours
✅ **(3) is the one I would actually fix:** an `app.notFound` returning the same `{ error: { code, message } }`
envelope, **once, at the app level.** ⚠️ **Check the ICS route first** — `c.notFound()` there may WANT Hono's
plain 404, since a calendar client is not reading our envelope. **If an app-level handler would change that
route's behaviour, say so and leave the route its own answer.**
✅ **(1) is a one-line shape change** — `{ error: { code: "INVALID_SIGNATURE", message } }`. ⚠️ **Confirm nothing
parses that string** — **LINE ignores the body, but our own tests may not** (`webhooks.test.ts`).
⚪ **(2) may be correct as it is.** 🚫 **Do not change it just to make three things match.**

## §4 What must not change
- 🚫 **Status codes** — 401 stays 401, 404 stays 404. **Nothing here is about WHO is refused.**
- 🚫 `app.onError`'s branches, `ApiException`, the `23505` / `23503` mappings, TASK-296's hook and envelope.
- 🚫 The webhook's signature CHECK itself — **only the shape of what it answers with.**
- 🚫 No migration · no FE change · no route signature change.

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] **An unknown path under `/api` returns the envelope** — asserted, **and `res.json()` on it parses**
- [ ] **Whichever of (1) and (2) you change is asserted; whichever you leave is NAMED with its reason** —
      ⚠️ **"left alone" is an acceptable answer here and "changed for symmetry" is not**
- [ ] 🔑 **Break it and watch** — and **restore it, with the suite green before you report a number**
- [ ] 🚫 Status codes byte-identical · `onError` and TASK-296's hook untouched — asserted

## Question
📌 *You found these by asking "what answers without reaching the handler?" — a question about REACHABILITY, not
about correctness.* 🔑 **Every one of them looks right where it is written.** ⇒ **is there a cheap way to ASK
that question rather than remember it** — something that would name a response built outside the envelope, the
way `35 = 35` names a stray migration? ⚠️ **If the honest answer is "no, it needs an eye", say so** — **we
established this week that some sweeps cannot be automated, and a fake mechanism is worse than none.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1762 pass / 0 fail**, 140 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1762 / 0**, 140 files · 🚫 no migration (**35 = 35**, counted)
- [x] **An unknown path under `/api` returns the envelope** — asserted, **and `res.json()` on it parses**
- [x] **(1) changed and asserted · (2) LEFT, and named with its reason** — see below
- [x] 🔑 **Break it and watch** — twice; restored, whole suite green before this number was written
- [x] 🚫 Status codes byte-identical (401 stays 401, 404 stays 404) · `onError` and TASK-296's hook untouched

New: `src/routes/envelope-reachability.route.test.ts` (8 tests).

### (3) ✅ `app.notFound` — the one worth fixing
An unknown path returned Hono's plain-text `404 Not Found`, so **`res.json()` threw a parse error instead of
handing back a refusal**. The failure read as a broken server rather than a wrong URL.
🔑 **The mechanism is worth stating: a 404 is not a thrown error**, so `onError` was never a fallback for it.
The two are siblings, not a chain — which is why nothing looked wrong from the inside.
📌 English and short: the reader is a developer typo or a stale client, never an admin.

### (1) ✅ the webhook — an object where a string was
`{ error: "invalid signature" }` put a **string** where every other refusal puts an object, so
`body.error.code` and `.message` were both `undefined`. Now
`{ error: { code: "INVALID_SIGNATURE", message: "invalid signature" } }`.
🚫 **The signature check and the 401 are untouched** — only the shape of the answer moved.
🔻 `webhooks.test.ts:34` asserted the bare string. **Corrected with the reason, not deleted:** the property that
test protects is *which* refusal answers — the signature check rather than the JWT guard — and that is unchanged.

### (2) ⚪ the ICS route — **LEFT as plain text, and this is the deliberate answer**
Its reader is a calendar client, which reads the **status** and never our envelope; a JSON body is noise it has
to ignore.
⚠️ **But I had to touch the line to keep the behaviour**, and that is worth being exact about: **`c.notFound()`
dispatches to the APP's handler**, and (3) just gave the app one — so leaving `c.notFound()` there would have
**silently switched this route to the envelope**, as a side effect of a fix aimed elsewhere.
⇒ The route now writes its own `c.text("404 Not Found", 404)`. **Byte-identical output, changed only to
preserve it** — the opposite of changing it for symmetry, and it is now pinned against the next app-level edit.

### ✅ Break it and watch — twice, and each for its own reason
- Restoring the bare-string webhook: **the sweep names the offender by file and content** —
  `src/routes/webhooks.ts :: c.json({ error: "invalid signature" }, 401);`
- Removing `app.notFound`: the parse assertion fails with **`SyntaxError: Failed to parse JSON`** — *the defect
  itself*, not a proxy for it.

### 🔑 The Question — **partly. Here is the part that can be asked, and the part that cannot.**
✅ **Built, and proven by mutation A:** a sweep over the routers asserting that **every `c.json({ error: … })`
carries both a `code` and a `message`.** It reads source rather than walking routes, because a route no test
requests still ships. That is the `35 = 35` shape, and it would have caught the webhook the day it was written.

⚠️ **What it cannot see, stated in the test itself so nobody trusts it too far:**
a Response built in a helper and returned · `new Response(...)` · `c.text` / `c.body` with an error status
(**the ICS route is deliberately one of those**) · and 🔴 **a library answering before our code runs at all —
which is exactly what DEF-5 was.** No source sweep would have found TASK-296; that needed a route-level
assertion that actually made the request.

⇒ **The honest answer: the SHAPE question can be asked mechanically; the REACHABILITY question still needs an
eye.** 📌 The two are different questions, and conflating them is how a sweep that looks complete lets the next
one through — **which is worse than not having one, exactly as you said.**

**BALL: @Sober — TASK-297 ready for review. ⛔ TASK-298 still open on me, not blocking.**
