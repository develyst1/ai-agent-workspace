# TASK-296 — 🔴 every validation refusal in the product reaches the admin as a raw zod array

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-08)
⛔ **DEF-5's other half.** 🚫 No migration. 🚫 No FE change *(TASK-295 is the field itself, and it is Fern's)*.
🔑 **@Porter calls this *"the worse half: even after the field is fixed, the next validation failure looks like
this."* He is right, and it is bigger than he knew — it is EVERY endpoint, not the resume one.**

---

## §1 What the owner saw, and why
`routes/api.ts:2` — `zValidator` from `@hono/zod-validator`, used on **every validated route in the file**, with
**no error hook**. ⇒ on a refusal it returns **the `ZodError` itself**, whose `.message` is **the
JSON-stringified issue array** — including the `TIME` regex source.
`app.onError` (`index.ts:55`) **never runs**: the validator responds directly, so the handler that turns
`ApiException`, `23505` and `23503` into sentences **is not on this path at all.**
The FE then does exactly what it should: `client.ts:65` reads `body.error`, and
`DropResumeDialog.tsx:175` renders `e.message` in the red box.
⇒ 🔴 **the array is the message.** ⚠️ **Nobody chose to show it. There is no line anywhere that decided to.**

## §2 🔴 The scope is the part to sit with
**This is not the resume dialog's bug.** Every `zValidator("json" | "query", …)` on `routes/api.ts` behaves
identically. ⇒ **every 400 in this product, on every screen, has always looked like this** — students, parents,
bookings, discounts, imports.
📌 **It has gone unseen because our forms usually gate the button correctly.** **DEF-5 is the first time a form
let a bad value through** — ⇒ **the owner did not find a resume defect, he found the first door onto a hole that
was always there.**
🔑 **This is the third time this week that a thing "nobody would ever hit" was hit the moment one gate moved.**

## §3 What to do
✅ **Give `zValidator` an error hook, in ONE place**, so a validation refusal becomes the same envelope every
other refusal already uses: `{ error: { code: "VALIDATION", message: <a sentence>, details: … } }`.
- 🔑 **`code: "VALIDATION"` and a 400** — the shape `index.ts:67` already emits for `23503`. **We are not
  inventing an envelope; we are stopping one path from escaping the existing one.**
- ⚠️ **The message is read by an admin, in Thai, like every other message in `onError`.** **One sentence. It does
  NOT name fields, types or regexes** — the form is what says which field is wrong, and it says it in the
  admin's own words, next to the field.
- ✅ **The issues may ride in `details`** — `ApiClientError` already carries `details` deliberately
  (`client.ts:10`), the red box does not render it, and **an engineer reading a network tab is the right reader
  for an issue array.** 🚫 **Do not put them in `message`.**
- 🚫 **One hook, applied uniformly. Do NOT hand-write a message per route** — a per-route message is the thing
  that rots on the route nobody edits.

## §4 What must not change
- 🚫 The schemas in `validation.ts` — **nothing about WHAT is refused changes**, only how the refusal reads.
- 🚫 `app.onError`'s existing branches, `ApiException`, the `23505` / `23503` mappings, any status code.
- 🚫 No migration · 🚫 no FE change · 🚫 no route signature change (**the FE's `hc<AppType>` types come from here**).

## Definition of Done
- [ ] `tsc --noEmit` → **0** · `bun test` → all pass, **state the count** · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **A refusal on `POST /courses/:id/resume` with `startTime: ""`** returns **400** and
      **`error.code === "VALIDATION"`** — asserted **through the real route**, not against the hook in isolation
- [ ] 🔑 **`error.message` contains no `regex`, no `[`, no field path** — asserted **as an absence**, because that
      is precisely what the owner saw
- [ ] 🔑 **Break it and watch:** remove the hook and show the assertion fails **because the array came back**
- [ ] ✅ **A refusal on a SECOND, unrelated endpoint** gets the same envelope — **one route proves a hook, two
      prove it is uniform**
- [ ] **Say how many `zValidator` call sites are now covered**, and **name any validated route that is NOT** (a
      different router, a different validator) — ⚠️ **an escaped one is exactly this defect, still live**
- [ ] 🚫 Status codes and existing `onError` messages byte-identical — asserted

## Question
📌 *`app.onError` exists, is correct, and was bypassed — by a library default, on the most common failure in the
product.* 🔴 **What ELSE responds without reaching it?** **Name every place that returns a response directly** —
middleware, the auth guard, the webhook router, `/internal`. ⚠️ **I am not asking you to change them.**
**A handler that is not reached is worse than a missing one: it looks handled.** ⇒ **say which paths reach it.**

---

## ✅ RESULT 2026-09-08 — @Jason. tsc **0** · **1742 pass / 0 fail**, 138 files · 🚫 **35 `.sql` = 35 journal tags.**

- [x] `tsc --noEmit` → **0** · `bun test` → **1742 / 0**, 138 files · 🚫 no migration (**35 = 35**, counted)
- [x] 🔑 `POST /courses/:id/resume` with `startTime: ""` → **400**, `error.code === "VALIDATION"` — asserted
      **through the real router**, not against the hook
- [x] 🔑 **`error.message` carries no regex, no bracket, no field path** — asserted as an ABSENCE, and equal to
      the one sentence
- [x] 🔑 **Break it and watch** — see below; it fails *because the array came back*
- [x] ✅ **Three endpoints, in THREE routers** — one proves a hook, these prove it is uniform
- [x] **62 of 62 `zValidator` call sites covered. None escaped.**
- [x] 🚫 Status codes and `onError`'s branches untouched — 400, the code `index.ts:67` already emits

New: `src/lib/validate.ts`, `src/routes/validation-envelope.route.test.ts` (8 tests).

### §1 The shape — one module, so the fix cannot be forgotten on the next route
`src/lib/validate.ts` exports `zValidator`; **all four routers import it instead of the library**, and the
library is now imported in exactly **one place**. A route added tomorrow with the same two arguments everyone
already writes is covered **by construction**.
🔴 **This is why it is not a wrapper inside `api.ts`.** That was the obvious shape and it would have covered
**57 sites and left 5 live** — `auth.ts`, `checkin.ts` and three in `internal.ts`. **An escaped one is this same
defect, still shipping**, and the DoD says so.
🚫 **And not a hook per call site**: 62 chances to forget, on the route nobody edits.

### §2 Coverage — **62 call sites, 0 escaped**
| router | call sites |
|---|---|
| `routes/api.ts` | **57** |
| `routes/internal.ts` | **3** |
| `routes/auth.ts` | **1** |
| `routes/checkin.ts` | **1** |

✅ **No route validates by hand.** I checked for a bare `.parse()` that could throw a `ZodError` past
`ApiException` into `onError`'s 500 branch — **there is one call that looks like it and is not**:
`settings.service.ts:23` is the settings **registry's** own `parse`, which returns `null` and then throws
`badRequest` with a Thai sentence naming the setting. **It reaches `onError` correctly.** 📌 Worth saying I
checked, because that one would have been a 500 on an admin typo.

### §3 ✅ Break it and watch — and the REASON
Removing the hook returns **exactly the owner's screen**:
`"code": "invalid_format"` · `"Invalid input: expected string, received undefined"` — the serialised issue
array, with `TIME`'s rule in it. **Six assertions fail, and the message assertion fails on the array's
PRESENCE**, which is the reason I wanted rather than "something went red".
📌 The mutation was applied through a script that throws if its anchor is missing and prints `MUTATED` — the
fourth mutation-that-did-not-mutate this week was caught that way, so it is now how I run them.

### §4 🔑 The Question — what else answers without reaching `app.onError`
**Reaches it, correctly:** `authMiddleware` and `requireRole` (they **throw `ApiException`** rather than
responding) · every service throw, `settings.service` included · pg `23505` / `23503`.

**Answers directly, already in the envelope:** `internal.ts:23` (503, secret unset) and `:28` (401, wrong
secret) — hand-written but the same `{ error: { code, message } }`. ⚠️ **English messages**, which is right: the
reader is an ops script, not an admin.

🔴 **Answers directly and NOT in the envelope — three, none of them changed:**
1. **`webhooks.ts:12`** — `c.json({ error: "invalid signature" }, 401)`. **`error` is a bare STRING**, so
   `body.error.code` and `.message` are both `undefined`. Same defect shape as DEF-5; unseen because the reader
   is LINE's servers.
2. **`calendar.ts:15` and `:18`** — `c.notFound()`, Hono's plain-text 404 on the public ICS route.
3. **There is no `app.notFound` handler at all.** Every unknown path under `/api` returns plain-text
   `404 Not Found` ⇒ **a client calling `res.json()` on it gets a parse error, not an envelope.**
(And CORS answers `OPTIONS` directly, by design.)

⇒ 🔑 **Your sentence generalises exactly:** in each of the three, `onError` **exists, is correct, and is not on
the path** — and nothing looks wrong from the inside. **A handler that is not reached is worse than a missing
one.**

### §5 ⚠️ One consequence to know before the FE reads it
The library types the failure response from the hook, so **`hc<AppType>`'s 400 body type changes from the zod
issue array to our envelope** — `{ error: { code, message, details } }`, status 400. **That is the fix arriving
in the types, not a signature change**, and it is what the FE already assumes (`client.ts:65` reads
`body.error`). Nothing on the request side moved.
📌 **And a small find for TASK-295, no BE work:** the issues now in `details` already carry **admin-readable
Thai per field** (`"ต้องเป็นรูปแบบ HH:mm"` for `TIME`) — so if the form ever wants to place a server refusal
next to the field, the material is on the wire already. **Not doing it; naming it so nobody adds a second
mechanism for it later.**

**BALL: @Sober — TASK-296 ready for review.**
