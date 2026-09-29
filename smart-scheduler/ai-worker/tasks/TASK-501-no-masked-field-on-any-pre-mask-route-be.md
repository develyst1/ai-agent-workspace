# TASK-501 — close the class: **no route registered before a guard may answer with what that guard hides** — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size S.** No migration. Your offer at the end of TASK-499, accepted.

## §0 Why the class and not just the instance
TASK-499 fixed one door. **The cause is still there:** `index.ts` registers the public routes **before** `authMiddleware`, `accessGuard`, `uuidParamGuard` and `coachRateMask`, and **Hono runs handlers in registration order** — so **every guard expressed as middleware is silently absent from every route registered above it.** Nothing in the repo says so, and nothing fails when someone adds the next public route.
🔑 **The mask's promise — "a viewer without key 59 never sees a coach rate" — is not true of the routes it does not run on, and it never was.** A promise that holds only on some routes is not a promise; it is a habit.
📌 You already checked the other pre-mask routes by hand (register and the ICS feed are clean). **This task is so that nobody has to check by hand again.**

## §1 Build — a guard over the route TABLE, not over one response
- Derive, from `index.ts` itself, **which routes are registered before each `/api/*` middleware.** 🔑 **Read it from the source, do not maintain a second list** — a hand-kept list of "the public routes" is the same two-places-must-agree bug this round has fixed three times.
- For each such route, assert its answers **cannot** contain what the skipped guards hide. At minimum: **`COACH_RATE_FIELDS`** (key 59) anywhere in a pre-mask answer.
- ⚠️ **Say honestly how far this can go.** Proving a property of *every possible response* of a route is not something a test can do. **What it CAN do:** walk each pre-mask route's actual answers in the tests we have, and pin that each one's shape is built by an **allow-list** rather than from an admin DTO. **State the limit rather than implying more** — that is the standard the rest of this round has been held to.
- 🔑 **Make the failure teach.** Whoever trips this will be adding a public route and will have no idea that middleware order matters. The message must say **that the guards below are not in effect for their route, and which ones**.
- 📌 **Also say whether the other three skipped guards deserve the same treatment** — `uuidParamGuard`'s absence means a malformed id on a public route is a `22P02` from the database rather than a 400 (DEF-2's whole subject), and `accessGuard` fails closed on unmapped routes **only where it runs.** **Name what you find; do not build it in this task.**
- 🚫 No change to any route, any guard or any DTO. **This task adds a test and documents a fact.** If you find a second live leak, **stop and tell me** — it is a fix, not a guard, and it will get its own task.

## Definition of Done
- [ ] The pre-mask route set derived **from `index.ts`**, not a maintained list · `COACH_RATE_FIELDS` asserted absent from every pre-mask answer we exercise · each pre-mask route's shape pinned as allow-list-built · the limit of what the test can prove **stated plainly** · a failure message that explains middleware order and names the skipped guards · the other three guards' absence **assessed and reported, not built** · any second live leak **stopped and escalated, not fixed** · suite **count** · tsc 0 · 59 = 59 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that adds a rate field to a public answer and one that registers a new route above the mask · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — the class guarded: the unguarded route set DERIVED from `index.ts`, every route must carry evidence, and `COACH_RATE_FIELDS` is walked where the mask does not run. 3271 pass / 0 fail · tsc 0 · 59 = 59 · 4/4 mutations bite · **no second live leak**

**Numbers:** `bun test` **3271 pass / 0 fail**, twice (+14) · `tsc` **0** · **59 = 59**. **This task adds one test file** (`src/routes/pre-guard-routes-req108.test.ts`) and changed no route, guard or DTO.

## 1. The table, DERIVED (never a maintained list)
- **From `src/index.ts`, comments stripped:** every `app.route / app.use / app.get…` statement in source order, and every mounted identifier resolved through `index.ts`'s own imports to its file. **Each file's own `.get("/x")` / `.post(…)` declarations** give its routes.
- **Result:** the four `/api/*` guards, in order (`authMiddleware`, `accessGuard`, `uuidParamGuard`, `coachRateMask`), and **15 routes under `/api` registered ABOVE all four**:
  - docs (2): `GET /api/openapi.json`, `GET /api/docs`;
  - auth (1): `POST /api/auth/login`;
  - the LINE webhook (1);
  - check-in (5): the token page, camp, and the shop-front's lookup, single and batch;
  - the ICS feed (1);
  - register (5).
- **Each derived route records WHICH guards it skips**, so a route mounted between two guards would be reported precisely.

## 2. Every unguarded route must carry evidence, or the suite fails and TEACHES
- `EVIDENCE` is the one hand-written part, **and it is meant to be.** It is the knowledge someone must write when they add a public route. The SET is derived, so the table can't go stale either way:
  - a new unguarded route with no entry fails with the teaching message;
  - an entry for a route that is no longer unguarded fails as stale.
- **The message** (pinned) names the route and the guards it skips, and says:
  - **that Hono runs handlers in REGISTRATION ORDER**;
  - what each missing guard means (no login check; no permission, since `accessGuard` fails closed only where it runs; a malformed `:id` reaching the DB; **key 59 not hiding the coach's rate, "TASK-499: a public door answered with what we pay the coach, because of exactly this"**);
  - to build the answer from an allow-list like `toPublicCheckinBooking`, and where to add the evidence.

## 3. What each route is checked for
- **EXERCISED (6), through the ROOT app:** `openapi.json` and all five check-in doors.
  - The fixtures **carry coach rates and an admin's name** (a course row with `teacherRateMinor`, `classRateMinor` and `discountActor`, with the attend returning a real `toBookingDTO`). Each answer must be 200.
  - It is walked **at every depth for any `COACH_RATE_FIELDS` name**, and the rate values and the admin's name must appear nowhere.
  - The probe set is pinned equal to the routes whose evidence says "exercised".
- **LITERAL (9), by source:** docs HTML, login (`{ token, user }`, the signing-in user's own record), the webhook (`{ ok }`), the ICS feed, and the five register routes.
  - Each route's file must name **no admin DTO builder** (`toBookingDTO`, `studentRef`, `rateFacts`, `toCourseSummary`, …) and **no coach-rate field**.
  - **Every `c.json(` it makes must be an object literal** (or the named OpenAPI document).
  - The ICS writer (`lib/ics.ts`) is held to the same rule.

## ⚠️ The limit, stated plainly (in the file's header too)
A test cannot prove a property of **every possible response** of a route. What this proves:
- **(a)** exactly which routes run unguarded, from the source;
- **(b)** that each one either **was exercised and carried no coach-rate field**, or **answers only object literals built in its own file, with no admin DTO builder named there**.

**What it cannot catch:** a field added inside a service those literals call. The literals at least make such a change a visible edit to a public route's file.

## Finding: NOT a second live leak, but the next instance of the class (named, not built)
- **The camp scan relays an ADMIN DTO element.** `checkinCampByToken` answers `day: pkg.days.find(…)`, an element of `toPackageDTO` (the admin package DTO), **with no allow-list**.
- **Clean TODAY:** that element is `{ dayId, weekId, weekName, date, half, units, status, undoReason }`, with no rate. **My first fixture gave it rate fields and the walk caught them**; I corrected the fixture to the real shape rather than claim a leak that isn't there.
- **But camp already has per-coach day rates** (REQ-104). The day someone adds one to the admin package DTO, **the public camp scan hands it out.** ⇒ **Recommendation:** a camp allow-list shape like TASK-499's, as its own small task. The walk here will then keep it honest.

## The other three skipped guards, assessed (not built)
- **`authMiddleware` is absent by design.** Every public door carries its own credential: the check-in token (QR), the phone (the shop front, behind its per-IP limit), the LIFF ID token (register, verified with LINE), LINE's signature (the webhook), the password (login), the calendar token (ICS).
  - **One door has none:** `GET /api/openapi.json` / `/api/docs` serve the API's schema to anyone. It carries no data (walked) and names no coach-rate field, but it does publish every route and DTO shape. Worth a decision; not a leak.
- **`accessGuard` fails closed on unmapped routes, but only where it runs.** None of the 15 is in `route-access.ts`, and that's right for public doors. **The risk is an ADMIN route mounted above the guards by mistake:** it would run with no login and no permission at all. **This test now catches that** (no evidence ⇒ the teaching failure).
- **`uuidParamGuard` (DEF-2): no exposure today.** The only path parameter among the 15 is `GET /api/calendar/:file` (a token filename, not a uuid). The shop front's `bookingId` / `campDayId` are `z.string().uuid()` in the body, and register takes no ids. A future unguarded `:id` route would lack it, and the teaching message names that.
- **`coachRateMask`:** closed on the check-in doors by TASK-499, and now walked on every exercised unguarded route.
- **Outside `/api`** (`/health`, `/`, `/webhooks`, `/internal/*`): the `/api/*` guards never apply there by PATTERN, whatever the order, so they are outside this test. `/internal/*` carries its own secret.

## For @Fern: a correction to my camp note (TASK-499)
The camp page's `day.weekName` **is** sent on a **fresh** camp check-in (the package-DTO element carries it), but **not** on an **already** answer (the fallback `dayDTO` lacks it). `day.studentName` is never sent. So the "missing lines" are partly path-dependent.

## Break-and-watch: `mut501.mjs`, 4 mutations, **4 bite**
`BASELINE=14`, read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `0ff4e10b…` identical before and after.**
- **A — a RATE field added to a public answer** (the allow-list gains `rate`): **bites, 3 fail** (the walk, on the three doors that answer with a booking).
- **B — a NEW route registered ABOVE the mask**: **bites, 1 fail**, the teaching failure.
- **C — a public route MOVED below the guards**: **bites, 2 fail** (stale evidence; the literal set).
- **D — an admin DTO builder brought into a literal route's file** (register): **bites, 1 fail**.

⛔ Only you mark this DONE. Starting TASK-500 (the flake).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26) ⚠️ **with the suite count taken on trust, and why**
Verified by me: **tsc 0** · **59 = 59** · the test file read, including its header. 🚫 **I did NOT re-run the suite**, because TASK-500 established that a full run on this machine reaches a live database. **The 3271/0 is his number, not mine, and I am saying so rather than quoting it as if I had checked.** It will be re-verified once the preload lands.

🔑 **The design decision that makes this a guard and not a document: the route SET is derived, the EVIDENCE is hand-written.** Those are the right halves to automate and to leave to a person. The set cannot go stale in either direction — **a new unguarded route fails for want of evidence, and evidence for a route that is no longer unguarded fails as stale.** ⇒ **someone adding a public route is made to look at what it answers**, which is the only thing that would have prevented TASK-499.
✅ **The failure message names TASK-499 by what happened** — *"a public door answered with what we pay the coach, because of exactly this"*. A test that teaches with a real consequence rather than a rule is one people obey.
✅ **Fifteen unguarded routes, each recording which guards it skips** — so a route mounted *between* two guards is reported precisely rather than lumped in with the rest.
✅ **The two-tier treatment is honest:** six exercised through the root app with fixtures that **actually carry coach rates and an admin's name**, and nine proved by source to answer only object literals from their own file. **And the limit is stated in the file's own header** — a field added inside a service those literals call could still get through. **Stated, not implied away.**

## 📌 The camp finding: exactly right, and the way he handled it is the point
The camp scan relays an element of the **admin package DTO** with no allow-list. **It is clean today** — and 🔑 **his first fixture gave it rate fields, the walk caught them, and he corrected the FIXTURE rather than reporting a leak that does not exist.** A lesser report would have claimed a second leak and been half-wrong; this one says *"not a leak, and here is why it will be one"*: **camp already has per-coach day rates, so the day someone adds one to that DTO, the public scan hands it out.** ⇒ **TASK-502**, a camp allow-list, cut.
✅ And on `authMiddleware`: **every public door carries its own credential — except `GET /api/openapi.json` and `/api/docs`, which serve the API's schema to anyone.** No data, no rate field, **but it publishes every route and DTO shape.** Correctly called a decision rather than a leak; it goes to Porter as one line for the owner.
