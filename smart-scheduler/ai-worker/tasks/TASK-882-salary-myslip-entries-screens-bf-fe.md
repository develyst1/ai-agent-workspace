# TASK-882 — FE: REQ-120 **Salary: "My slip" (coach) + "Other Income" Entries (admin-blind), carried from the final UI and wired to SPEC-102** (backoffice-front) — @Fern (Team A, lent; Porter 2026-11-08) — Silver reviews
**From @Silver, 2026-11-08.** Split out of TASK-862 / TASK-869 on Porter's call (Fern idle). Contract: **SPEC-102 §5-E1 / §5-E2** (Jason's TASK-880, ACCEPTED). Repo `smart-scheduler-backoffice-front`, branch `dong`. **No git command: git only on the owner's word.** **Size ≈ 1.5 d.** Your chain is Sober, so put your report and questions in this TASK and Sober relays them.

## Source (the content is AGREED; don't invent)
- `final-ui` (`som-balance-backoffice-spec/final-ui/`, path in `machine.local.md`): `src/pages/a/salary/MySlip.tsx` and `Entries.tsx`, with their mock data in `src/mock/a-salary.ts`. Read `CONVENTIONS.md` §2 (the admin is hidden from pay, never masked; invented names only).
- **Words exactly as the final UI has them, plus the REQ-5010 folds** (owner-approved): on Entries, **"OT hours" → "OT Hour"**. No other new words. If one is needed, reuse an approved string or stop and ask.

## What to build
1. **Routes** under `src/app/(admin)/salary/`: `my-slip` and `entries`. The menu entries and `roles` come exactly from the final UI, through your shell's role context:
   - a coach sees **My slip only** ("Payment Detail");
   - Entries is for the admin (and whoever the final UI lists).
   - If the old top-level `(admin)/my-slip` clashes, keep yours at `/salary/my-slip` and leave the old page alone.
2. **My slip:** `GET /salary/my-slip?year=&month=` (§5-E1).
   - The server takes the teacher from the token, so never send a teacher id.
   - **Reuse your own `Slip` view** (`components/partials/Salary/Slip.tsx` / `parts.tsx`) for the body, so the slip renders once, in one way.
   - The ‹ month year › picker as in the final UI.
   - No slip for that month → the final UI's empty state.
   - **Export buttons:** visible and inert (`TODO(TASK-879 wiring)`). Jason's TASK-879 export is CEO only.
3. **Entries:** `POST /salary/entries` (§5-E2).
   - **The admin's screen shows no pay**: no base, no total, no other lines. The 201 is the created line only.
   - Errors in your existing toast style, with the server's sentence:
     - 400 kind not allowed;
     - 422 merit on a not-eligible profile;
     - 409 locked.
   - **The person picker never lists "No Teacher"** (`is_system`, TASK-861). Filter it where you read the list, and say where.
4. **Money:** integer satang over HTTP; display in baht with 2 decimals through your `money.ts`. No float maths.

## Files (claim, lent to Fern)
- `src/app/(admin)/salary/{my-slip,entries}/**`;
- new `src/components/partials/Salary/{MySlip,Entries}*.tsx`;
- **your own** `src/services/salary.service.ts` + `src/types/app/salary.ts` (add the two calls + their types);
- the two menu lines.
- **Fanta (TASK-862) builds People / Person / Settings / Daily in her own new files** (`salary-people.service.ts`, `types/app/salary-people.ts`), so you two don't share a service file. `parts.tsx` is yours; if she needs a change in it, she asks through me.

## Tests
- My slip:
  - renders the response;
  - the request carries no teacher id;
  - an empty month shows the empty state.
- Entries:
  - the admin view renders **no pay field**, even when a mocked response carries one (whitelist);
  - each of the three errors shows the server's sentence;
  - "No Teacher" is absent from the picker.
- Each test must fail when its code is removed.

## Done =
- `tsc` 0 · the front's tests green · `next build` 0 · 0 console errors.
- The report in this TASK. `git status` = only the claimed files. No git command run.
- **Live behaviour** (a signed-in coach / admin on sid) is Tanya's gate after a deploy, not yours: no password typing on sid.

## Questions (for Sober → Jason / Silver; Q1 blocks a real sid click-through)
1. 🔴 **The admin has no way to read the people list.** SPEC-102 gives the admin `POST /entries` only; `GET /salary/profiles` is CEO-only, and there is no other teacher list an admin may call. The Entries picker therefore reads a **proposed** `GET /salary/entries/people` → `[{teacherId, name, meritEligible?, isSystem?}]` (admin + ceo; the back should already leave out `is_system`). **Until Jason adds it, Entries has no people on sid.** My FE also drops "No Teacher" by flag and by name where it reads the list (`services/salary.service.ts` `listEntryPeople` → `entries-logic.ts` `pickablePeople`), so it is safe either way. My live proof used a **harness-only** stand-in for that route.
2. 🟠 **OT Hour and Transportation trip cards are visible but inert** (Save disabled, `TODO(R0.3 …)` in `Entries.tsx`): SPEC-102 §5-E2 lets an admin enter only `merit` and `other`, and the OT route (`/slips/:id/ot`) is CEO-only; trips are TASK-868's transport routes. "OT Hour" is the REQ-5010 word. Say if you want them wired (needs an admin-blind OT route).
3. 🟠 **A CEO on Entries gets 403 on Save** — the final UI lists Entries for `["ceo","admin"]` (I followed it), but `POST /entries` is `requireRole("admin")`, so the CEO sees "ไม่มีสิทธิ์". Either the back lets the CEO use it, or the role row becomes admin-only (one word in `PAGE_RULES`).
4. 🟡 **My slip "Tell an admin" and "Confirm this slip"** (final UI) have no endpoint in SPEC-102, so they are **not rendered** (a dead button breaks the final-UI rule). Only Export PDF is shown, disabled (`TODO(TASK-879 wiring)`).
5. 🟡 **No empty-state wording in the final UI** — I reused my approved TASK-866 line "ยังไม่มีสลิปในงวดนี้". Silver to confirm, or give another.
6. 🟡 The admin cannot read periods or entries, so (a) the success toast draws the pay range ("30/09/26–30/10/26") with the final-UI rule locally (`payRangeOf`, same rule as the back's `payPeriodRange`), and (b) the **Detail list holds only what this admin entered in this visit** (from the 201s) — it empties on reload. A read route would fix (b).

## Implementation Notes
**Fern, 2026-11-08.** Proof is against the **real back-office code** (routes `/my-slip` + `/entries` of TASK-880 + service + auth middleware) in my Bun harness on the in-memory store; only the people list (Q1) and `/auth/login` are stand-ins. **Not sid.**
- **Routes / menu (`PAGE_RULES`, final-ui's registry):** `/salary/my-slip` "Payment Detail" (coach, money) and `/salary/entries` "Other Income" (ceo + admin), both **above** the `/salary` row (first match wins). The Phase-1 `/my-slip` placeholder is left in place, still guarded, but **no longer in the menu**, so a coach lands on `/salary/my-slip`. No other shell change.
- **My slip:** `GET /salary/my-slip?year=&month=` carries **year + month only** (no teacher id; asserted in a test and on the wire). ‹ month year › picker (`MonthPicker.tsx`, final-ui words). Body = **my own slip view, extracted** to `SlipView.tsx` and used by both the CEO's `Slip.tsx` and `MySlip.tsx` (the coach read says `amountSatang`, mapped at the edge). `{slip:null}` → the empty state. "Confirm by 31/10/26 · before 12:00" notice from `lockAt` while open. Read-only: no delete, no add form.
- **Entries:** `POST /salary/entries` for the two live cards **Merit** and **Other ±** (reason required: inline "Required" + the final-UI Thai warn toast). The 201 is cut to its **five line keys** in `createEntry` (`toEntryLine` whitelist) and the Detail list reads three of them by name, so a response that also carried a total/base could not reach the screen. Errors show the **server's own sentence** in a red toast (400 kind not allowed · 422 not merit-eligible · 409 locked). Success toast = the final-UI Thai sentence + the pay range. **"No Teacher" is dropped where the list is read** (see Q1).
- **Money:** integer satang both ways, `money.ts` only (`bahtInputToSatang` parses the field text, no float multiply); display `1,000.00`, signed `+/−`.
- **Tests (the front had none):** `bun test src/components/partials/Salary` → **10 pass**, in `salary-882.test.tsx`: my-slip request has no teacher id · renders the response (name, kind labels, per-date text, signed amounts, base, total) · locked slip: no "Confirm by", no delete · empty month → empty state · create response cut to 5 keys · Detail renders none of a leaky response's pay fields · the three errors show the server sentence (400, 422, 409) · "No Teacher" absent (flag and name). **Mutation check:** I broke each piece of code in turn (teacher id added to the request, whitelist removed, No-Teacher filter removed, empty-state branch removed, kindLabel removed, sign removed, error text replaced, "Confirm by" gate removed) → **every one made a test fail (8/8 killed)**, files restored, clean run 10 pass. (The leaky-Detail test is killed by the by-name rendering plus the whitelist together; removing only the whitelist is caught by the key-set test.) Test setup needs `src/types/bun-test.d.ts` (a small `bun:test` type shim, outside the claim list, so `tsc` stays 0 without a new dependency).
- **Live (headless Chromium, real BE code):** **admin** — menu "รายการ · แท็ก · Other Income", NO-ACCESS on `/salary/payrun` and `/salary/my-slip`; picker = ต้น, พลอย (the "No Teacher" row the stand-in sent is gone); Merit 1,000 saved (toast with 30/09/26–30/10/26); Merit for a not-eligible person → "this person is not merit-eligible"; Other ± without reason → inline Required + warn toast, then −200 saved; Detail = only "+1,000.00" and "−200.00"; the page text has no total / base / "รวมสุทธิ"; the real **201 body = exactly the 5 line keys**; Sep 2026 (past) → 409 "งวดนี้ถูกล็อกแล้ว". **coach** — menu "Payment Detail" only, lands on `/salary/my-slip`; Nov 2026 → empty state; ‹ to Oct 2026 → **own** slip: 2 Extra Hour + the admin's Merit + Other lines, total (27,025.00) and line count **equal the BE read**; the API calls carry `year`+`month` only; no delete, Export PDF disabled; NO-ACCESS on `/salary/entries`, `/salary/payrun`, `/items`. **CEO** — NO-ACCESS on `/salary/my-slip`; Save on Entries → "ไม่มีสิทธิ์" (Q3). **Regression:** the 15 TASK-881 checks still pass after the shared-view refactor. 0 unexpected console errors.
- `tsc` 0 · `next build` 0 (final tree; the Google-Fonts fetch can fail on the network, a retry passes).
- **Not tested:** sid itself (Tanya's gate), a real 12:00 lock, the `KIND_NOT_ALLOWED` 400 from the screen (no control can send another kind; only the unit test proves the server sentence is shown), OT/Transportation (inert, Q2).
- **Files:** `src/app/(admin)/salary/{my-slip,entries}/page.tsx`; `components/partials/Salary/{MySlip,Entries,MonthPicker,SlipView,entries-logic}` + `salary-882.test.tsx`; edited `Slip.tsx` (uses SlipView), `hooks.ts`, `money.ts`, `services/salary.service.ts`, `types/app/salary.ts`, `lib/roles/pages.ts` (2 menu rows + the old row off the menu), new `types/bun-test.d.ts`. No git command run.

### Revision 2026-11-08 — after Silver's revised answers + Sober's rulings (Fern)
- **Q1 → TASK-886 wired:** `listEntryPeople` reads the real `GET /salary/entries/people` (`[{teacherId,name,meritEligible}]`, no pay; the back already leaves out "No Teacher"). The **by-name filter is dropped**; the `isSystem` check stays as the backstop (test updated: "No Teacher (is_system) is absent"). The Merit picker offers only `meritEligible` people, so a not-eligible person is no longer offered at all (the 422 sentence is still shown if the server ever returns it).
- **Q2 → OT Hour + Transportation trip cards removed** from Entries (admin Entries = **Merit + Other ±** only; grid now two cards + Detail).
- **Q3 → Entries is admin-only:** the `/salary/entries` role row is `["admin"]`; a CEO gets NO-ACCESS and no "Other Income" in the menu (the CEO adds lines on the full slip). One word in `lib/roles/pages.ts`.
- **Live re-run (headless Chromium, real TASK-880 + TASK-886 routes in my harness — the people-list stand-in is gone):** admin picker = the real list [ต้น, พลอย]; Merit picker = [ต้น] only; cards = Merit · Other ± · Detail; Merit 1,000 and Other ± −200 saved; the real 201 = exactly the 5 line keys; the admin page shows no total/base; Sep 2026 → 409 sentence; coach own slip == BE read (27,025.00, 4 lines); coach/CEO NO-ACCESS where they should be; **CEO NO-ACCESS on `/salary/entries`**. (My script's "requests carry year+month only" line matched page navigations as well as API calls and reported FAIL; a dedicated re-check on the API calls only passed earlier: `?year&month` only. The unit test also asserts it.) 0 unexpected console errors.
- `tsc` 0 · `next build` 0 · `bun test` 10 pass · **mutations 8/8 killed again** (the No-Teacher mutation now targets the `isSystem` backstop). No git command run.
- Not tested: sid itself (Tanya's gate), a real 12:00 lock.

## Review
**✅ ACCEPTED (DONE): @Silver, 2026-11-09.** The full verdict is at the end of this file, in § "Review — @Silver, 2026-11-09".

## Answers — @Silver, 2026-11-08 (review of the build follows when Sober marks it REVIEW)
1. **The admin's people list: a contract gap, so it goes to Sober** (SPEC-102 is his). I've asked Porter to relay it.
   - My proposal: Fern's `GET /salary/entries/people` → `[{ teacherId, meritEligible }]`, admin + CEO, `is_system` already excluded, no pay field. Names come from the FE join as everywhere else.
   - Your filter by flag stays as the backstop. Drop the "by name" filter: a real coach could be named that.
   - Until the route exists, Entries on sid has no people, and that's stated in the evidence.
2. **OT Hour + Transportation cards:**
   - **Transportation: wire it.** TASK-868's trip routes are `requireRole("ceo","admin")` and already blind to amounts for an admin (`GET/POST /salary/transport/trips`, `GET /salary/transport/schools`). The school / trip entry R1.2 asks for is the admin's job.
   - **OT Hour: stays inert** until an admin-blind OT route exists. That's the same ask to Sober as Q1, so I'm putting it in the same relay.
3. **CEO on Entries:** keep the final UI's `["ceo","admin"]`. I'm asking Sober to let the CEO through on `POST /salary/entries` (one word in `requireRole`). Until then the 403 is known and listed; no FE change.
4. **"Tell an admin" / "Confirm this slip" not rendered:** **agreed.** The coach's confirm (R1.5) needs its own route and comes with the later remind / confirm piece. No dead buttons.
5. **Empty state «ยังไม่มีสลิปในงวดนี้»:** **OK.** It's an approved string you already shipped.
6. **The local pay range + the Detail list that empties on reload:** **OK for now.** A read route for "what I entered" is part of the same Sober ask.
- **Out-of-claim files:** `lib/roles/pages.ts` (the 2 menu rows + the old row off the menu) and `types/bun-test.d.ts` are accepted as written; the menu rows were in the claim anyway. Note: the shell's `pages.ts` is Fern's own.

## Answers revised after Sober's rulings (SPEC-102 owner), Silver, 2026-11-08 — these replace my Q1–Q3 above
- **Q1:** the admin people read is **TASK-886** (Jason, `GET /salary/entries/people`, ≈ 0.5 d). Point `listEntryPeople` at it when it lands. Keep the `isSystem` filter as the backstop, and drop the by-name one.
- **Q2:** on the admin's Entries screen, **hide the OT Hour and Transportation cards.** Admin Entries = Merit + Other ± only.
  - Transportation trips are entered on their own Transportation screen, a later Team B TASK on TASK-868's routes.
  - This replaces my "wire Transportation" answer.
- **Q3:** `/salary/entries` stays **admin-only**. The CEO edits lines through the full Slip (`/slips/:id/lines`).
  - So the Entries page's role row becomes **`["admin"]`** (one word in `PAGE_RULES`), and the CEO no longer sees a page that would 403.
  - This replaces my "keep ceo + admin" answer.
- **Q4–Q6:** unchanged.

## Review — @Silver, 2026-11-09: ✅ ACCEPTED (DONE)
- **Re-run by me:**
  - BF `bunx --package typescript@5.9.3 tsc --noEmit` = 0;
  - `bun test` = 10 pass / 0 fail;
  - `bun run build` = 0, with `/salary/entries` and `/salary/my-slip` built. **The first try failed on `next/font` fetching Google Fonts** ("Error while requesting resource"), and the retry passed. See the note below.
- **Sober's revised answers are applied:**
  - the Entries role row is `["admin"]` (`lib/roles/pages.ts:27`);
  - the picker reads TASK-886's `GET /salary/entries/people` (`salary.service.ts:79`);
  - "No Teacher" is filtered by flag only (`entries-logic.ts:7`);
  - no OT / Transportation card on Entries.
- **Data exposure:**
  - My slip sends year + month only.
  - The Entries response is whitelisted to the line's keys, so no pay can render for an admin. Both are tested, with 8 / 8 mutants killed.
- **Shared view:** `SlipView.tsx` is used by both the CEO's Slip and the coach's My slip, so the slip renders one way. TASK-881's checks still pass.
- **Security review:** none.
  - Role gating follows the final UI.
  - The coach read is token-scoped on the server (TASK-880); the admin write is blind (TASK-880 / 886).
  - No secrets in the client.
- **Notes:**
  1. **Build depends on the network:** `next/font/google` downloads fonts at build time, so a build on a box without internet (or a flaky one) fails. It's the shell's choice (Fern / Sober), so it goes to Porter as a deploy-risk note, not a blocker here.
  2. **"Confirm this slip"** on My slip can now be wired: Bob's TASK-887 E4a `POST /salary/my-slip/confirm` is built and in its last small fix. I'll cut that as a small FE follow-up once 887 is DONE.
