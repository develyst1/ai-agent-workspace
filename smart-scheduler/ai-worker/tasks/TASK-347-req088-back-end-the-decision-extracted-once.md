# TASK-347 — `REQ-088` back end: the link/create DECISION extracted once, and a page that can prove who it is

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-12)
▶️ **OWNER: GO.** **Size M.** 🚫 **NO migration** — same three fields, same rules, same storage.
⏱️ **AFTER TASK-346.** 🔑 **This task defines the API the page (TASK-348, @Fern) builds against — write the
contract FIRST and tell me, so she can start in parallel.**

---

## §1 The finding, and the rule that follows from it
**The customer's parents do not TYPE `สมัคร`.** ⇒ **the 8-screen chat flow has a failure mode no copy fixes.**
✅ **The LOGIC exists — the SURFACE does not.** `verifyAndLink` (the customer's "code" IS the phone) ·
`bindFamilyLine` · `createStudentFromLine` (the ONE writer) · `afterParentLink` · TASK-313/314's guards.
🔴 **RULE 1, and it goes in the DoD verbatim:** ***the page calls the SAME writer the chat calls. If the page
grows a rule of its own, it is wrong.*** 📌 **The chat stays as a SECOND DOOR. Two doors, one decision.**

## §2 🔴 THE REAL WORK — the DECISION without the REPLIES
**`verifyAndLink` and the wizard steps live inside `line-webhook.service.ts`, wrapped in reply-tokens and
session steps (`AWAIT_CODE`, `AWAIT_STUDENT_NAME`…).** ⇒ **the page needs the decision and not the replies.**
🔑 **This is TASK-315's `afterParentLink` shape, once more, for the whole link/create sequence:**
| the page needs | today it is | extract as |
|---|---|---|
| phone → **family found (children) / new parent** | inside `verifyAndLink`'s customer branch | a pure-ish function returning the outcome, no reply |
| bind this `lineUserId` to that family | `bindFamilyLine` | ✅ already separable |
| create child: name · DOB · address | `createStudentFromLine` + the `province` write at `:678` | ✅ the writer exists; **the address write must join it or be called beside it — say which** |
| family has children ⇒ **no forced add** | `afterParentLink` | ✅ already the one decision |
| reserved word · duplicate → more detail · 5-child cap | TASK-313/314 | ✅ on the writer |
⚠️ **After extraction the CHAT calls the same functions** — 🔑 **assert it: the chat's behaviour is
BYTE-IDENTICAL and it no longer contains a second copy of any decision.** *(TASK-315's DoD, again.)*
🚫 **Do not move the chat's REPLIES. Only the decisions.**

## §3 🔴 RULE 2 — the page must PROVE who it is
**Zero LIFF / LINE Login code exists.** ⇒ **new: verify the LIFF ID TOKEN SERVER-SIDE against the customer's
Login channel ID** (LINE's `oauth2/v2.1/verify` — `id_token` + `client_id` ⇒ `sub` is the `lineUserId`).
🚫 **A page that trusts the client's claim of who it is, is TASK-047's failure by a new route.**
📌 **Two new env values — the LIFF ID and the Login CHANNEL ID — and both come from the customer's console.**
⚠️ **Say what happens when the token is invalid, expired, or from the WRONG channel** — *each is a different
reply, and the third is the interesting one.*

## §4 Rules 3–6, from @Porter — each one is an assertion
3. **2FA: READ `line_parent_2fa`.** Off today ⇒ nothing renders — ⚠️ **but the page must read the setting, or it
   is a second door that ignores it.** 🔑 *Assert the read exists, and assert what the page does when it is ON
   (even if that is "refuse with a message", say so).*
4. **On success, NO chat session step is left DANGLING** — a parent may have half-started the chat wizard
   before an admin sent the link. ✅ **Clear it. Assert it.**
5. **`ข้าม` = optional DOB and address.** 🚫 **No `ยกเลิก` — a page has a close button.**
6. **One STABLE public URL — the page is `/register`, sibling of `/checkin`. No per-parent token.** ⇒ the API
   is a public route family beside `routes/checkin.ts`: 📌 **the token IS the credential, exactly as
   `/checkin?token=` and `/calendar/<token>.ics` already work.**

## §5 THE CONTRACT — write it FIRST, before the extraction, and send it to me
**@Fern builds against it. Propose the shape; I will not dictate it, but it must cover:**
`POST /register/lookup` `{ idToken, phone }` ⇒ **found** `{ family, children[] }` | **new** | **bound-to-other-family** ·
`POST /register/link` `{ idToken, childId }` · `POST /register/create` `{ idToken, name, birthDate?, address? }` ⇒
the same outcomes the chat's screens 4 / 8 produce.
🔑 **Every error the chat can produce (reserved word, duplicate, cap, bad DOB) must come back as a NAMED code
the page can render** — 🚫 *not a Thai sentence in `message`; the page owns its copy.*

## §6 What must not change
- 🚫 **The chat flow's behaviour** — byte-identical, asserted. **It stays as a second door.**
- 🚫 `bindFamilyLine`'s guarantee (*never re-bind to another family*) · TASK-313/314's guards · `§17c`'s ten
  pinned files · the webhook routes.
- 🚫 **No migration.** 🚫 **No copy on this side** — the API returns CODES; the page renders words.

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 **35 = 35**
- [ ] 🔑 **THE CONTRACT sent to me BEFORE the extraction** — so TASK-348 can start
- [ ] 🔴 ***The page calls the SAME writer the chat calls. If the page grows a rule of its own, it is wrong***
      — asserted: **no decision exists in two places**, by absence on both doors
- [ ] **The chat is BYTE-IDENTICAL after the extraction** — asserted
- [ ] 🔴 **The ID token is verified server-side against the channel ID** — asserted, ⚠️ **and the wrong-channel
      case asserted separately**
- [ ] **`line_parent_2fa` is READ by the page path** — asserted, with the ON behaviour stated
- [ ] **No chat session step left dangling on success** — asserted
- [ ] **Every chat-side error reaches the page as a NAMED code** — asserted
- [ ] 🔑 **Break it and watch** — `finally`, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **This is the SECOND door built onto a writer that was extracted for ONE (TASK-315).** ⇒ ❓ **After this
extraction, what is left in `line-webhook.service.ts` that is still a DECISION rather than a REPLY?**
📌 *If the honest answer is "the webhook is now replies only", that is the shape we wanted and worth
recording. If not, name what remains.* 🚫 **Build nothing.**

---

# 📜 THE CONTRACT — @Jason → @Sober (2026-09-12), BEFORE the extraction, for @Fern via you

🔑 **Three principles, and every line below follows from them:**
1. **The server returns CODES; the page renders words.** There is NO `message` field anywhere. *(§5.)*
2. **The page never says who it is.** Every call carries `idToken`; `sub` is the `lineUserId`; **no request
   body contains a `lineUserId`, `parentId` or `familyId`.** The server re-derives the family from the phone
   or from `sub`, every time. *(Rule 2 — a page that trusts the client's claim is TASK-047 by a new route.)*
3. **Every decision below already exists in the chat and is called, not copied.** Where a decision is named,
   the chat function that owns it is named beside it. *(Rule 1.)*

## §C0 — Envelope, auth, and the three token failures
**Every endpoint:** `POST`, JSON body, public (mounted beside `publicCheckin`, Rule 6). **Success** `200`
`{ ok: true, … }`. **Refusal** `{ ok: false, code: "<NAMED_CODE>", …details }` with the status listed.
**Auth, on every call, before anything else:**
| code | status | when |
|---|---|---|
| `TOKEN_MISSING` | 400 | no `idToken` in the body |
| `TOKEN_WRONG_CHANNEL` | 401 | 🔴 **the token's `aud` ≠ `LINE_LOGIN_CHANNEL_ID`** — decoded LOCALLY from the JWT payload and compared BEFORE calling LINE, so it is distinguishable from "invalid". ⚠️ **This is a page built on ANOTHER channel pointed at our API — a misconfiguration or an impersonation — and it is logged LOUDLY as such, not folded into "invalid".** |
| `TOKEN_INVALID` | 401 | LINE's `oauth2/v2.1/verify` (`id_token` + `client_id`) refuses it: bad signature, malformed, not ours |
| `TOKEN_EXPIRED` | 401 | LINE says expired (`exp` past) — the page re-inits LIFF and retries; nothing else |
📌 **Two new env values, both from the customer's console:** `LINE_LOGIN_CHANNEL_ID` (the server verifies
against it) and `LIFF_ID` (the page needs it; the server does not read it). 🚫 **Neither is optional** — an
absent `LINE_LOGIN_CHANNEL_ID` makes every call `TOKEN_WRONG_CHANNEL`, never "skip verification".
🚫 **No `lang` parameter.** The page owns its language; the server has nothing to translate.

## §C1 — `POST /register/lookup` — *"is this phone a family we know?"* 🚫 WRITES NOTHING
**Body:** `{ idToken, phone }` — `phone` as typed; the server normalises to digits (TASK-278 §6: digits are
the key).
| outcome | shape |
|---|---|
| `{ ok: true, outcome: "found", phone: "<display>", children: [{ id, name, nickname }] }` | a parent exists with this phone and is free to bind to this LINE account — `verifyAndLink`'s existing-branch, **without the bind** |
| `{ ok: true, outcome: "found", phone, twoFactor: "required", childCount: n }` | 🔀 **`line_parent_2fa` is ON** (Rule 3): names are GATED behind the code (TASK-047's rule wherever a gate exists — the chat's exact behaviour); the code is sent by `deliver2faCode` and `/link` must carry it |
| `{ ok: true, outcome: "new", phone }` | no parent with this phone — the page shows the new-family form and calls `/link` then `/create` |
| `{ ok: false, code: "PHONE_INVALID" }` 400 | fewer than 9 digits after normalising — `verify_parent_badphone`'s rule |
| `{ ok: false, code: "PHONE_BOUND_TO_OTHER_LINE" }` 409 | the parent exists and `lineUserId` is set to a DIFFERENT account — `verify_parent_other`'s rule |
| `{ ok: false, code: "LINE_BOUND_TO_OTHER_FAMILY" }` 409 | THIS LINE account already belongs to a different family — `bindFamilyLine`'s refusal, **pre-checked read-only here** so the page can say it before anyone taps a child |
| `{ ok: false, code: "TWOFA_NOT_CONFIGURED" }` 500 | 2FA is ON but delivery is not configured — the chat throws here too (`lib/line-2fa.ts`), loudly, on purpose |
⚠️ **`lookup` is idempotent and side-effect-free EXCEPT the 2FA send when ON**, which is the chat's behaviour
at the same point.

## §C2 — `POST /register/link` — *"bind this LINE account to that family"* ✍️ THE WRITE
**Body:** `{ idToken, phone, code? }` — 🔑 **`phone` again, not a family id: the server re-looks it up.**
`code` only when `lookup` said `twoFactor: "required"`.
**Does, in order — the chat's `verifyAndLink` customer branch plus what the chat handler does AFTER it,
minus every reply:** find-or-create the parent by phone (with `sub`) · `bindFamilyLine` · `linkParentLine` ·
`moveRosterLink(sub, "customer")` · seed `lineLang` · **`linkRoleRichMenu` + `linkKnownRichMenu`** *(the chat
does these after `verifyAndLink` — a page-registered parent must not be left without a menu)* ·
🔴 **`clearSession(sub)` — Rule 4: any half-started chat wizard is dropped.**
| outcome | shape |
|---|---|
| `{ ok: true, outcome: "linked", isNew: false, children: [{ id, name, nickname }], canAddMore: boolean }` | existing family, now bound |
| `{ ok: true, outcome: "linked", isNew: true, children: [], canAddMore: true }` | 🔑 **a NEW family: the parent row is created here, by phone, exactly as `findOrCreateParentByPhone` does for the chat** — the page then calls `/create` for the child. *(`afterParentLink`'s decision — children ⇒ no forced add; none ⇒ add one — is the page's to render from `children.length`, and it is the same decision.)* |
| `PHONE_INVALID` 400 · `PHONE_BOUND_TO_OTHER_LINE` 409 · `LINE_BOUND_TO_OTHER_FAMILY` 409 | as in `lookup` — 🔑 **re-checked at the write, never trusted from the lookup** |
| `{ ok: false, code: "TWOFA_CODE_REQUIRED" }` 428 | 2FA ON and no `code` |
| `{ ok: false, code: "TWOFA_CODE_BAD" }` 401 | wrong code — `matches2faCode`, the chat's `twofa_bad` |
📌 **Re-binding the SAME family is a no-op success** (`alreadyBound`), as `bindFamilyLine` already guarantees —
a parent who reloads the page has done nothing wrong.

## §C3 — `POST /register/create` — *"add a child to MY family"* ✍️ THE ONE WRITER
**Body:** `{ idToken, name, birthDate?, province?, detailProvided? }`. **The family is `sub`'s** — resolved by
`findParentByLineUserId`; **no `phone`, no id.**
🔴 **`birthDate` is the CUSTOMER'S day-first text, `DD-MM-YYYY`, or absent** — validated by the chat's own
`parseBirthDate`, **which refuses `YYYY-MM-DD` on purpose.** *The page formats its date widget to the customer's
format; the server runs the same parser the chat runs. Same strictness, same refusal, one parser.* ⚠️ *This
is the one place the contract could have grown a second rule (an ISO validator) and does not.*
📌 **`province`** is the storage name (`parents.province`, a HOUSEHOLD field — the chat writes it beside the
student, and so does this). `REQ-088`'s "address" is the page's word for it.
**Does, in order — the chat's `AWAIT_STUDENT_NAME` → `AWAIT_STUDENT_CONFIRM` decisions, minus every reply:**
`isReservedWord` · `assertCanAddStudent` *(the cap, asked FIRST — the chat's own ordering, so nobody fills a
form and is refused at the end)* · `duplicateOutcomeFor` *(skipped when `detailProvided`, exactly as the chat
skips it at `AWAIT_STUDENT_DETAIL`)* · `parseBirthDate` · **`createStudentFromLine`** *(the ONE LINE-side
creator: the write AND the admin notification, TASK-314)* · the `province` write · `clearSession(sub)`.
| outcome | shape |
|---|---|
| `{ ok: true, outcome: "created", student: { id, name }, birthDate: "<DD-MM-YYYY or null>", count, atMax, canAddMore }` | screen 8's facts, without screen 8's words |
| `{ ok: false, code: "NOT_LINKED" }` 403 | `sub` has no family — the page must `/link` first |
| `{ ok: false, code: "NAME_REQUIRED" }` 400 | empty after trim |
| `{ ok: false, code: "NAME_RESERVED", word }` 400 | TASK-245: a word the bot advertises can never be a name |
| `{ ok: false, code: "FAMILY_FULL", max }` 409 | TASK-313: the cap, `MAX_STUDENTS_PER_PARENT` — asked first |
| `{ ok: false, code: "NAME_DUPLICATE_NEEDS_DETAIL", name }` 409 | TASK-314 / AC-9: **ask for MORE DETAIL, never demand a rename** — the page re-asks for a surname/nickname and resubmits the fuller name with `detailProvided: true` |
| `{ ok: false, code: "BIRTHDATE_INVALID" }` 400 | `parseBirthDate` refused — same rule, same strictness |
🚫 **No `ยกเลิก` code exists** (Rule 5): a page has a close button, and nothing is written until `/create`
returns. 📌 **`ข้าม` = simply omit `birthDate` / `province`.**
⚠️ **For @Fern, not for the server: TASK-277 made the CONFIRM step load-bearing** — `03-04-2024` is ambiguous
to a human. **The page must show the date back in `DD-MM-YYYY` before submitting.** The server cannot do that
for it and will not try.

## §C4 — What is deliberately NOT in the contract
- 🚫 **No `GET`** — nothing is read without a token, and a token is a body.
- 🚫 **No per-parent token, no `/register/<id>`** — Rule 6: one stable `/register`.
- 🚫 **No `message`, no `lang`** — the page owns words.
- 🚫 **No way to unbind, rebind, or change phone** — that is `clearFamilyLine`, an admin's audited act.
- 🚫 **No teacher / admin role** — this door is for parents only; `verifyAndLink`'s other branches stay in
  the chat.

## §C5 — Two decisions in the contract I want you to look at before I extract
1. 🔑 **`/link` CREATES the parent for a new phone** (`isNew: true`) rather than `/create` doing both. ⇒
   `/create` is always *"add a child to MY family"*, and the page's 4a/4b are the SAME two calls in the same
   order. *Alternative: `/create` accepts `phone` and creates the parent too — one call for a new family, but
   then `/create` has two meanings and the chat's `afterParentLink` decision is duplicated.* **I prefer the
   first and will build it unless you say otherwise.**
2. 🔑 **`birthDate` is `DD-MM-YYYY` text, through the chat's parser.** The alternative — accept ISO from a
   date input — needs a second validator, and that is a second rule. **I will build the first.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-12) · THE EXTRACTION

✅ **DONE (code).** **2086 pass / 0 fail**, **169 files** (+2 test files) · `tsc --noEmit` clean · 🚫 **no
migration (35 = 35)** · no FE change · **no copy on this side — the API returns CODES.**
**New:** `services/line-register.service.ts` (the one home) · `lib/line-id-token.ts` (Rule 2) ·
`routes/register.ts` (§C1–§C3) · two test files · two `.env.example` lines. **Changed:** the webhook (decisions
out, replies stay) · `index.ts` (one mount line) · seven test files (14 pins followed the decisions).

## §1 🔑 RULE 1, held by ABSENCE on both doors — and one exception, named
**`line-register.service.ts` holds every registration decision, once:** `lookupFamilyByPhone` (read-only) ·
`linkFamilyByPhone` (the bind, in `verifyAndLink`'s exact order) · `settleLinkedRole` (lang → menus, the chat's
post-link sequence) · `duplicateOutcomeFor` · `createStudentFromLine` (+ the `province` write, joined) ·
`addChildForLineParent` (the page's composition of the chat's guards, in the chat's order) · `twoFaEnabled` ·
`setTwoFaChallenge` / `twoFaCodeOf` / `parkedTwoFaCode` · `clearLinkSession`.
✅ **Asserted as ABSENCE:** thirteen decision strings (`findParentByPhone(`, `bindFamilyLine(`,
`findOrCreateParentByPhone(`, `linkParentLine(`, `moveRosterLink(`, `createStudentForParent(`,
`decideDuplicate(`, `kind: "student_registered"`, `getSetting("line_parent_2fa")`, `draft: { twoFaCode }`,
`linkKnownRichMenu(`, …) are **in the home, NOT in the chat, NOT in the page.** Plus the page has no
`parseBirthDate(`, `normalizePhone(`, `listStudentsOfParent(`, no literal `5`, no hand-rolled date reverse.
⚠️ **THE EXCEPTION, in the test by name rather than hidden:** `isReservedWord` and `assertCanAddStudent` are
still CALLED from the chat's name step — **the same functions, not copies** — because the chat asks one step at
a time and cannot call the page's composition. 🔑 **What is asserted instead is the ORDER:** reserved → cap →
duplicate → birthdate → write, **equal in both sources.** *Held by assertion, not by construction — see §7.*

## §2 ✅ The chat is BYTE-IDENTICAL — every reply pin passed unchanged
🔑 **Not one reply key, string, or `t()` call moved.** `verifyAndLink`'s customer branch is now
`const r = await linkFamilyByPhone(...)` and five one-line maps from outcome → the SAME key each always
produced; the 2FA block and the two success bodies are the original lines. **Every pre-existing reply pin
(`line-phone-entry`, `line-enter-button`, `returning-family`, `line-stuck-exit`, the bilingual set) is green
unmodified — that is the byte-identity assertion, and I added a five-key pin on top.**
📌 **Two non-reply differences, declared:** (a) the log prefix on the seed/menu best-effort catch reads
`[line-register]` not `[line-webhook]`; (b) in the confirm step the `province` update now runs BEFORE
`notifyAdmins` instead of after — same rows, same values, no reader depends on the order.

## §3 🔴 RULE 2 — the page proves who it is, and the wrong-channel case is its own reply
`verifyLiffIdToken(idToken, fetch)`: `TOKEN_MISSING` 400 · **`TOKEN_WRONG_CHANNEL` 401 — `aud` decoded
LOCALLY, compared to `LINE_LOGIN_CHANNEL_ID` BEFORE calling LINE, logged loudly** · `TOKEN_INVALID` 401 ·
`TOKEN_EXPIRED` 401. Your one-line comment is in the code verbatim: *the local decode is trusted for NOTHING
but choosing the error code; verification still happens.* ✅ **Nine unit tests with an injected fake LINE**,
including: **a token with OUR `aud` that LINE refuses is INVALID** (the assertion that keeps `decodeAud` from
ever becoming the verifier) · **no channel configured ⇒ every token WRONG_CHANNEL, LINE never called** ·
a 200 whose claims name another channel is still INVALID (belt and braces) · a network failure is INVALID,
not a pass.

## §4 ✅ Rules 3–6, each an assertion (and each a mutation, §6)
- **3 · 2FA:** `twoFaEnabled()` read in BOTH `lookup` and `link`. ON ⇒ lookup returns the COUNT (names gated,
  TASK-047), parks the code through the chat's own `setTwoFaChallenge`, and delivery-not-configured surfaces as
  `TWOFA_NOT_CONFIGURED` 500 exactly where the chat throws; link demands `code` (428) and checks it with the
  chat's `matches2faCode` **BEFORE the write** (401 on a bad one).
- **4 · No dangling step:** `clearLinkSession` on `link` AND `create`, **after `settleLinkedRole`** — 🔑 *I
  checked the chat's order as you asked: lang → menus → session; the page matches it and the test pins both.*
- **5 · `ข้าม`:** absent `birthDate` / `province`; no cancel code exists.
- **6 · One `/register`**, mounted beside `publicCheckin`; three `POST`s, no `GET`, no `/register/:id`.

## §5 🔻 TWO THINGS THE TESTS CAUGHT BEFORE THE MUTATION STAGE, and one gap I mirrored rather than fixed
1. 🔴 **`parseBirthDate("")` is a REFUSAL, not a skip — only the WORD `ข้าม` is.** My first composition passed
   the absent field straight to the parser ⇒ every page create without a birthdate would have been
   `BIRTHDATE_INVALID`. ✅ **Fixed: a blank is the skip BEFORE the parser; every provided value goes through the
   one parser.** *The test that found it is in the file, with the trap named.*
2. 🔴 **My first `linkFamilyByPhone` added a guard the chat does not have** — on a NEW phone it refused an
   account already bound elsewhere and called `bindFamilyLine`. **The chat does neither**: it creates the parent
   with `parents.line_user_id` set and moves the roster link — two lines. ✅ **Mirrored exactly, Rule 1.**
   ⚠️ **AND NAMED AS A GAP, in the code and here:** an account already bound to family A that enters a NEW
   phone creates an orphan parent B carrying its id, and `familyOfLineUser` keeps answering A. **That is the
   chat's behaviour today; fixing it in the home would give it to both doors — and change the chat, which this
   task forbids.** *Size if wanted: one `familyOfLineUser` check in `linkFamilyByPhone`, and the chat gains a
   refusal it never had.* **Yours to cut.**
3. 📌 The `province` write JOINED the writer (you asked me to say which): the chat wrote it beside the student
   in its confirm step; a page would otherwise need a second call. One writer, one place.

## §6 🔑 Mutation — SEVEN, `finally` restore, checksum-verified
| | |
|---|---|
| **A** the CHAT grows a second copy (`findParentByPhone` back in `verifyAndLink`) | ✅ 1 fail — the absence |
| **B** the PAGE grows a rule (the cap becomes a literal `5`) | ✅ 1 fail |
| **C** `/link` TRUSTS the client (no token verification) | ✅ 1 fail — *"verifies FIRST"* |
| **D** `WRONG_CHANNEL` collapsed into `INVALID` | ✅ 3 fail |
| **E** the page's guard ORDER drifts (cap after duplicate) | ✅ 1 fail |
| **F** Rule 4 dropped on `/create` | ✅ 1 fail |
| **G** absent birthDate through the parser again (§5.1 re-introduced) | ✅ 1 fail |

## §7 🔑 THE PINS — 14 tests in 7 files followed the decisions, **ALL REWRITTEN, NONE DELETED**
Each now reads `line-register.service.ts` for the moved function and the webhook for its call site, with the
same claim. **`§17c` re-checked by name:** ten files, **two show a diff, neither is a `§17c` pin** —
`registration-copy-req079`'s `§17e` PROVINCE-STORAGE pin (the write moved into the writer) and
`line-bilingual`'s `welcome` pin (TASK-346, already accepted). **No customer registration bytes moved.**

## §8 ❓ YOUR QUESTION — *what is left in the webhook that is a DECISION rather than a REPLY?*
🔴 **The honest answer is NOT "replies only", and I would rather list it than round it.** After this task
the webhook still DECIDES:
1. **The admin verify code** — `code.trim() !== expected` against `LINE_ADMIN_VERIFY_CODE`, inline in
   `verifyAndLink`'s admin branch. *A decision with one door, so it did not move; it is still a decision.*
2. **The teacher claim path** — `requestTeacherLink` is called from the same branch; the decision is in
   `teacher-link.service`, the *routing to it* is here.
3. **The two-strikes rule** (`strikeOrPrompt`, AC-19) — *how many wrong answers before a human* is decided in
   the webhook, per step. **The page has no strikes at all** — a page can be retried forever. 📌 *That is a
   real difference between the doors and I have not papered over it: a chat that hands over to a human after
   two failures is a property of the CHAT surface.*
4. 🔑 **`afterParentLink` — *children ⇒ no forced add; none ⇒ add one.*** The chat decides it and advances the
   session; **the page renders it from `children.length`.** ⚠️ **This is the softest point in the whole
   extraction: it is ONE fact rendered on two sides, not two copies of code — but nothing asserts they agree
   beyond the type.** *If you want it hard, `linkFamilyByPhone` returns `mustAddChild: boolean` and both doors
   read that.* One line; yours to cut.
5. **The wizard's guard ORDER** — held EQUAL to the page's by assertion (§1), not by construction, because the
   chat asks one step at a time. *The assertion is the seam; the seam is visible.*
6. **The suspended-household refusal** and **`detectLinkedRole`** — decisions about WHO is talking, in the
   webhook because the page has a different answer to that question (the token).
📌 **So the shape we got is: every decision that BOTH doors need is in one place; every decision that is a
property of the CHAT SURFACE (strikes, steps, who-is-talking) is still in the webhook.** 🔑 ***That is the
right line, and it is worth recording that it is a LINE and not "replies only" — because the next door will
be asked the same question, and the answer should be "does the new surface need this decision?", not "is it in
the webhook?"***
