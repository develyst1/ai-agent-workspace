# TASK-564 — REQ-110 item 5: the FE half — this session or the rest — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-29) · **Size M.** Khwan, REQ-110 item 5. 🔴 **The backend cannot ship without this.**

## §0 ⚠️ Two things before you start
1. **Re-read the front repo and say so.** **Palm commits through the owner's git.** 🚫 **Items 4, 9 and 11 are his.**
2. 🔴 **DEPLOY COUPLING: the backend now REFUSES a Swap or Add-teacher body that names neither scope (400).** ⇒ **Until this lands, those calls fail.** **They ship together.** 🔑 *This is why this task is the round's critical path, not because it is large.*

## §1 What the backend now offers
- **Swap + `onDate` = a COVER: A REPLACES B on that one row.**
- **Add teacher + `onDate` = A JOINS B: co-teacher, both paid.**
- **Neither scope named ⇒ 400, deliberately.** 🔑 **The default is a refusal, not a guess — your UI must therefore always make a choice explicit.**
- **The rate follows the COVERING teacher (A).** 🚫 **Do not surface a rate field that contradicts that.**

## §2 The work
- **Every one of Move session / Swap / Add teacher asks: THIS SESSION, or THE REST?** ⚠️ **No pre-selected "all".** 🔑 **Khwan's complaint is that it silently did everything — a default of "all" would reproduce it with an extra click.**
- 🔑 **Move session is ALREADY one row on the backend — it never touched the others.** ⇒ **If moving one session appears to change the course, the cause is HERE, or in a series door. FIND IT and say what it was.** 📌 *Half of Khwan's complaint may be a screen doing more than the server was asked to.*
- ⚠️ **The two words must be distinguishable to an admin: "A covers for B" and "A joins B" are different outcomes** — 🔑 **and the pay differs.** 📋 **Wording is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, pinned by shape. 🚫 Code is not held for it.**
- ⚠️ **The two server refusals must reach the admin in the server's own words** — 🚫 **not paraphrased.** *Our record on paraphrasing refusals is bad enough to be a rule.*

## §3 The proof
🔑 **Clicked, per door: choose THIS SESSION ⇒ exactly one row's request carries `onDate`; choose THE REST ⇒ the other shape.** ⚠️ **A render-only test proves nothing here** — **TASK-518, TASK-531, TASK-554 and TASK-559 all say so.**
✅ **And assert the REQUEST, never only the screen** — 🔑 **TASK-559's rule: a control that shows what you chose and sends something else is the same class of lie.**

## §4 Not in scope
🚫 Changing what the whole-course scope does · 🚫 Remove teacher's "from today" default (raised separately) · 🚫 Palm's items.

## Definition of Done
- [ ] All three doors ask explicitly, **no pre-selected "all"** · 🔑 **the Move-session appearance explained and named** · cover vs join distinguishable, drafts filed early · server refusals **verbatim** · 🔑 **clicked per door, asserting the REQUEST shape** · front repo re-read and said · suite **count** · tsc · build ok · Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **759 pass / 0 fail** across 82 files · tsc 0 · build ok. 🔴 **The deploy is unblocked; it ships with TASK-562.**

## 🔑 She found that Khwan's complaint and Jason's 400 were THE SAME DEFECT
**The Move door was innocent** — `PATCH /bookings/:id` sends one id and only the changed fields, pinned including by absence.
🔴 **It was the TEACHER doors: their only scope control was "From date — today by default", so one teacher change rewrote every remaining row AND NOTHING ASKED.**
🔑 **And it is the same line as the deploy break: `withFromDate` OMITTED `fromDate` when it equalled today — exactly the neither-scope body the server now refuses.**
⇒ 📌 **A customer complaint and a backend validator, raised a week apart by two people who never spoke, were one bug.** *That is what a derivation is for: I asked her to find the cause rather than make the screen behave.*

## ✅ Two guards, because one of them is only a UI state
**Save disabled AND `submit` refuses — each mutation bites separately.** 🔑 **A disabled button is a decoration until the thing behind it also refuses** — *TASK-518's lesson, applied before it was needed rather than after.*
✅ **Exactly ONE scope key rides**, with the says-one-sends-the-other and both-keys mutations biting. 🚫 No rate on a swap.

## 🔑 The testing point I am recording
**She asserted `Object.keys(body).sort()` EXACTLY, because a `toEqual` would have passed a body carrying BOTH scopes — the one shape the server refuses.**
⇒ 🔑 **Assert the KEY SET, not a subset match: a test that proves what is present cannot prove what is absent.** **Recorded in `SYSTEM-FACTS.md`.**

## ⚖️ Her judgement call — **ruled: hers stands, no question on Move**
**Move got a STATEMENT — *"This moves this session only — the rest of the course stays as it is."*** — rather than a this-or-the-rest question.
✅ **Ruled: correct, and for two reasons she only gave one of.**
1. **Hers: a choice with one possible answer is noise** — *and worse than noise: it teaches an admin to click through dialogs without reading them, which is how the next real question gets missed.*
2. 🔑 **Mine: the server has no "move the rest" to give.** ⇒ **Asking would offer an option we cannot honour** — **a screen promising something the server does not do is the exact defect class of this entire fortnight.**
📌 **"I would rather be told than invent a question the server cannot honour" is the right instinct, and it is why I can rule this in one line instead of a round trip.**

## ✅ Declared, none weakened
**Four existing pins updated:** the `withoutRates` guard + a new swap absence pin · the GROUP `swapBody` shape · **the wire pin now naming `scopeBody` and FORBIDDING `withFromDate` on these doors** · copy 36 → 43. ✅ **`withFromDate` still serves Remove, which is out of scope** — *the helper was not deleted for tidiness; it was fenced off from the doors that must not use it.*
📋 **7 drafts, both languages, shape-pinned — including cover vs join WITH THE PAY DIFFERENCE IN THE WORDS.** 🚫 **Code not held.**
