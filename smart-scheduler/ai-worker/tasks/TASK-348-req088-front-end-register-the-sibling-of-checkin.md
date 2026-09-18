# TASK-348 — `REQ-088` front end: `/register`, the sibling of `/checkin`

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-12)
▶️ **OWNER: GO.** **Size M.** 🚫 No migration. ⏱️ **Starts when TASK-347's CONTRACT arrives — I will forward it.
Until then: the page's SHELL and the LIFF init, which need no API.**

---

## §1 The flow — the customer's, verbatim in `REQ-088`
**tap link → allow LINE connect → enter phone → family found: tap a child to link / none: fill NAME · DOB ·
ADDRESS → done.**
🔑 **Steps 2–3 are the whole change: a tap and a field replace `สมัคร` · `Next` · phone.** ✅ **4a/4b are the
SAME branches the chat has** (`§17c` screen 4 — existing family vs new parent). ⇒ **the form is the chat's
screens 3–7 as ONE page. Same three fields, same rules (DOB `DD-MM-YYYY`, address free text).**

## §2 🔴 RULE 1 — the page holds NO rules
***The page calls the SAME writer the chat calls. If the page grows a rule of its own, it is wrong.***
⇒ 🚫 **No reserved-word list on the page. No duplicate check. No 5-child cap. No DOB parsing beyond the input
mask.** ✅ **Every one of those comes back from the API as a NAMED CODE, and the page RENDERS it.**
🔑 **The page owns WORDS. The server owns DECISIONS.** 📌 *That line is what keeps two doors from becoming two
writers.*

## §3 The LIFF half — the only genuinely new thing on this side
✅ **`liff.init({ liffId })` → `liff.getIDToken()` → send the ID TOKEN to the API on every call.**
🚫 **Never send `liff.getProfile().userId` as the identity** — 🔑 **the server verifies the TOKEN; a userId
from the client is a claim, not a proof** (TASK-047 by a new route).
⚠️ **The LIFF ID is customer-supplied and per-environment** — 📌 *same class as `PUBLIC_CHECKIN_BASE_URL`;
name the env var and say what the page shows when it is absent (it must not be a blank screen).*
✅ **The public-page pattern is `/checkin`** — no admin auth, direct fetch, its own local types. **Follow it.**
⚠️ **And its `contract.ts` line: a type here is this repo's CLAIM about the wire** — 🔑 **conform to what
TASK-347 actually ships; if they differ, the BE is the source and you tell me.**

## §4 📝 COPY — @Porter's rule, and it is a PLACEHOLDER until the customer sees it
✅ **Reuse `§17c`'s WORDS where a field matches** — *"กรุณาระบุเบอร์โทรศัพท์"*, *"กรุณาระบุชื่อนักเรียน เช่น ส้ม"*,
the DOB hint, the address hint — 🔑 **they approved those sentences; a form label is the same sentence in a
smaller box.**
⚠️ **Anything the form needs that the chat did NOT have** — a button label, a *"found your family — tap a
child"* heading, the done screen — **@Porter writes, marked PLACEHOLDER, and the owner takes to them.**
🚫 **Do NOT invent copy.** ✅ **Where you must, mark it `PLACEHOLDER` in the dictionary the way the BE marks
`tsched_title_week`, pin the FORM not the bytes, and list every one in the report.**
📌 **Bilingual, both halves, as every `§17c` screen is** — *the page inherits `dictionaries.ts`'s `th: typeof en`
enforcement, which is the one mirror claim in this repo that names its enforcer.*

## §5 What the CHAT does that the PAGE must handle its own way
| chat | page |
|---|---|
| `ยกเลิก` clears a session | ✅ **a close button; no session** |
| `ข้าม` skips DOB / address | ✅ **optional fields** |
| 3-strike stuck detection | ✅ **not needed — a form cannot get stuck** |
| 2FA | 🔴 **the API tells you if it is ON; render what it says** — *you do not decide* |
| "found your family" ⇒ NO forced add (`§6.1`) | ✅ **the API returns `found` + children — render the list, and an
  "add a child" ACTION, never a forced form** |

## §6 What must not change
- 🚫 `/checkin` · the admin app · `contract.ts`'s existing types · `formatDateDisplay` / `formatTimeDisplay`.
- 🚫 **No rule on the page.** 🚫 **No copy invented without a PLACEHOLDER mark.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean, **say which command** · build ok
- [ ] 🔴 ***The page holds no rule*** — asserted: **no reserved-word list, no duplicate logic, no cap, no DOB
      parsing** on the page — *by absence*
- [ ] 🔑 **The ID TOKEN is what identifies the parent; `userId` is never sent** — asserted
- [ ] **The absent-LIFF-ID case renders a message, not a blank** — asserted
- [ ] **Every API error CODE has a rendering, both languages** — asserted against TASK-347's contract
- [ ] **Every invented string is marked PLACEHOLDER and listed in the report**
- [ ] **`found` renders a child list + an add ACTION, never a forced form** — asserted (`§6.1`)
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`/checkin` and `/register` are now two public pages with local types and direct fetches.**
⇒ ❓ **Is there a third coming, and if so should the two share a shell — or is "each public page is its own
small thing" the right shape for a product this size?** 📌 *I lean to the second; you have built both.*
🚫 **Name it. Build nothing.**

---

## §7 ✅ IMPLEMENTED — Fern, 2026-09-12. **`/register` is built against the LIVE route. The page holds no rule, and two mutations prove it.**

```
bunx tsc --noEmit → exit 0
bun test          →  285 pass / 0 fail   (+40, one new file)
bun run build     → ok — `○ /register` beside `○ /checkin`, both static public pages
git status        →  4 modified (dictionaries, .env.example, package.json, bun.lock) · 3 new dirs
```
🚫 No BE change · no migration · `/checkin` untouched (asserted) · `contract.ts` untouched.

### What was built
| | |
|---|---|
| `src/app/register/page.tsx` | the route — `/checkin`'s file, name for name |
| `src/lib/register/liff.ts` | **the LIFF half** — `init` → `getIDToken`; `@line/liff` imported DYNAMICALLY so the admin bundle never carries it |
| `src/lib/register/api.ts` | the three `POST`s, local types, direct `fetch` — written against `routes/register.ts` as shipped, **not the contract prose** |
| `src/components/partials/Register/RegisterContent.tsx` | the page: phase machine `liff → phone → found / found-2fa → linked → form → confirm → done` |
| `dictionaries.ts` `register.*` | 55 keys × 2 languages, every one tagged |
| `src/lib/register/register-page.test.ts` | 40 assertions |

⚠️ **One new dependency — `@line/liff@2.31.0`.** The task names LIFF init as *"the only genuinely new
thing"*, and it cannot be done without the SDK. Dynamic import keeps it out of every other route's bundle.

### 🔴 RULE 1 — held, and PROVEN by mutation
**Asserted as ABSENCE on both the page and the API module:** no `isReservedWord` / reserved list · no
duplicate logic · no cap (no `MAX_STUDENTS`, no `children.length >= n`, no literal `5`) · no date parsing
(no `dayjs(`, `new Date(`, `split("-")`, `toISOString`) · no phone normalising. **The page owns WORDS. The
server owns DECISIONS.**
🔑 **The one branch that looks like a rule is not one:** `if (children.length === 0) → form` is the §6.1
decision **read off the response** — the same fact `afterParentLink` decides for the chat, rendered, not
re-derived. Asserted by name.
✅ **Mutation 1 — the page grows a client-side cap (`if (children.length >= 5) return`) ⇒ 1 fail**, restored
byte-identical.

### 🔑 The ID TOKEN is the identity — held, and PROVEN by mutation
Every body is `{ idToken, … }`. **`getProfile`, `userId`, `lineUserId`, `parentId`, `familyId` appear in none
of the three files** — asserted. `liff.ts` never reads a profile, so there is nothing to leak by accident.
✅ **Mutation 2 — a body carries `userId` ⇒ 1 fail**, restored byte-identical.
✅ `TOKEN_EXPIRED` ⇒ re-init LIFF, retry **once** — the wrapper has no loop and never retries
`TOKEN_WRONG_CHANNEL` (a misconfiguration a parent cannot fix). Asserted.

### 🔻 `LIFF_ID` cannot be the env var name — it is `NEXT_PUBLIC_LIFF_ID`
A Next.js **client bundle only sees `NEXT_PUBLIC_*`**. A bare `LIFF_ID` is invisible to the page by
construction and would have looked absent on every environment, forever. Same shape as `NEXT_PUBLIC_API_URL`,
which `/checkin` already reads. ✅ Documented in `.env.example` beside its siblings, with the note that the
server's `LINE_LOGIN_CHANNEL_ID` is separate and the page never sees it.
✅ **Absent ⇒ a MESSAGE, not a blank** — `obtainIdToken()` returns `missing-id` before touching the SDK, and
the page renders `register.liffMissing` in both languages. Asserted.

### ✅ Every named CODE has a rendering, both languages
`REGISTER_CODES` is pinned to the route's `REFUSAL` table plus the four token failures — **16 codes**, each
asserted to resolve to a non-trivial string in `en` AND `th`. 📌 `keys.test.ts` cannot see a templated
`t(\`register.code.${code}\`)`, which is exactly why this pin exists. The three codes that carry a detail
(`word`, `max`, `name`) interpolate it. 🚫 **No server `message` is rendered anywhere** — the API module does
not even contain the word.

### 🔴 The date — `DD-MM-YYYY` text, echoed back, omitted when blank
- **Widget:** a `TextInput` with `maxLength={10}` and the customer's placeholder — **no `DatePickerInput`, no
  `type="date"`, no ISO.** The chat's parser runs server-side; the page has a MASK and nothing more.
- 🔑 **TASK-277 — the confirm screen shows the date back exactly as typed** (§17c 7a/7b as a screen, with a
  `Confirm` button where the chat typed `ยืนยัน`). Asserted.
- 🔴 **A blank is the SKIP and the key is OMITTED** — never `""` (TASK-347 §5.1's trap, not re-created here).
  `api.ts` drops empty `birthDate` / `province`; asserted on both sides.
- On `done`, the date shown is **the server's** `DD-MM-YYYY` echo, not the page's.

### §5 / §6.1 — the page's own way, each asserted
`found` ⇒ **child list + a TAP to link** (the bind is explicit, which is why `lookup` exists) · `linked` ⇒
**list + an ADD action, never a forced form** (`TextInput` asserted absent from that branch) ·
`children.length === 0` ⇒ the form · `canAddMore: false` ⇒ the add action is replaced by a sentence ·
**2FA** ⇒ `found-2fa` renders a code field because the response said `twoFactor: "required"`, and `code`
goes on `/link` only · **AC-9** ⇒ `NAME_DUPLICATE_NEEDS_DETAIL` returns to the form with the chat's own hint
and resubmits with `detailProvided: true` — never a rename · no session, no cancel code, a close hint.
✅ **`new` ⇒ `/link` is called immediately** (it CREATES the parent, §C5.1 — the chat does the same on phone
entry) and then the form; `found` ⇒ the tap first. **4a/4b are the same two calls in the same order.**

### 📝 COPY — every string tagged, and here is the list
**VERBATIM from `§17c` / the chat (21):** `phoneLabel` (screen 3) · `nameLabel` (4b) · `birthDateLabel` (5) ·
`provinceLabel` (6) · `confirmTitle` (7a) · `confirmQuestion` (7b, the question only) · `linkedTitle` +
`linkedPhone` (4a) · `createdTitle` (8a) · `createdAtMax` · `foundTitle` (`verify_parent_found`) ·
`twofaLabel` · `dupDetailHint` · and the codes `PHONE_INVALID` · `PHONE_BOUND_TO_OTHER_LINE` ·
`LINE_BOUND_TO_OTHER_FAMILY` · `TWOFA_CODE_REQUIRED` · `TWOFA_CODE_BAD` · `NAME_REQUIRED` · `NAME_RESERVED` ·
`NAME_DUPLICATE_NEEDS_DETAIL`. **Pinned byte-for-byte in the test** — the customer approved these.
**ADAPTED (2) — the chat's sentence with one clause changed for a page, and the change named:**
`BIRTHDATE_INVALID` (*"or type skip"* → *"or leave it blank"*) · `NOT_LINKED` (*"type register to start over"*
→ *"enter your phone number again"*).
**Borrowed from `/checkin` (2):** `closeHint` · `connectFail`.
🔴 **PLACEHOLDER (29) — @Porter's to write, the owner's to take to the customer:**
`title` · `liffMissing` · `liffLoggingIn` · `liffFailed` · `loading` · `phoneSubmit` (*"Next"* was typed) ·
`foundConfirm` (the tap) · `twofaHint` · `childrenTitle` · `addChild` (the chat's keyword, as a button) ·
`familyFull` · `birthDatePlaceholder` · `provincePlaceholder` · `formNext` · `confirmSave` (*"ยืนยัน"* was
typed) · `confirmBack` · `reviewName` · `reviewBirthDate` · `reviewProvince` · `reviewSkipped` ·
`createdCount` · `close` · `retry` · the four `TOKEN_*` · `TWOFA_NOT_CONFIGURED` · **`FAMILY_FULL` (EN
only — the TH is the server's own sentence, verbatim)**.
📌 Each is tagged `PLACEHOLDER` at its line in the dictionary; the test pins the FORM (`{name}`, `{max}`) and the
verbatim set, not the placeholder bytes.

### ✅ Verified, not assumed
- **The auth proxy** (`proxy.ts`) matches only `/scheduler/:path*` ⇒ `/register` is public **by construction**,
  exactly as `/checkin` is. Asserted that neither path is named there.
- **The route shapes** were read from `routes/register.ts` as shipped; the contract prose matched it.

### Definition of Done
- [x] Suite **285 / 0** · `bunx tsc --noEmit` exit 0 · build ok
- [x] 🔴 The page holds no rule — asserted by absence, **and proven by mutation**
- [x] 🔑 The ID TOKEN identifies the parent; `userId` never sent — asserted, **and proven by mutation**
- [x] Absent LIFF ID ⇒ a message — asserted
- [x] Every code rendered, both languages — 16, asserted against the live route's table
- [x] Every invented string marked PLACEHOLDER and listed — **29, above**
- [x] `found` ⇒ list + add ACTION — asserted
- [x] 🔑 Break-and-watch — two mutations in one call, each restored **byte-identical by checksum**

### ⚠️ Not seen on a screen — and this one genuinely cannot be, from here
**A LIFF page only yields an ID token inside the LINE app**, against a real LIFF ID and a real channel. There
is no mock for that boundary and I did not fake one. ⇒ **@Tanya, on `sid`, from a phone with the customer's
LIFF ID set:** (a) open the link → phone → a KNOWN number: the family's children are listed and a tap links;
(b) a NEW number: the form, `DD-MM-YYYY`, the confirm screen echoes it, done; (c) leave the date blank: no
`BIRTHDATE_INVALID`; (d) a duplicate name: the detail hint, resubmit works; (e) remove `NEXT_PUBLIC_LIFF_ID`:
a message, not a blank.

## Question — **a third public page, and should the two share a shell?**

✅ **I lean where you do — each public page its own small thing — and I can say WHY from having built both,
plus one thing to share that is not a shell.**

**What the two actually duplicate, counted:** the `API_BASE` derivation (1 line, **and it is a value copied
into two places** — the class from TASK-329's Question), the centred `Paper` wrapper (~6 lines), a
`Loader`+text view (~8 lines). **~15 lines.** A shared shell would save those and cost a coupling: **a change
to the shell for one page is a deploy of the other — and these are the two pages on parents' phones with no
admin in front of them to notice.**
🔑 **And they differ in the ONE thing that matters: the credential.** `/checkin` is a query token; `/register`
is a LIFF ID token. A shell that abstracts that is a shell that hides the security model of each page, which
is the wrong thing to hide.

**Is a third coming? Probably, and I can name the likely one:** `REQ-062` — *ลาล่วงหน้าในไลน์, pick a future
session*. Leave is the highest-frequency parent act, and `REQ-088` has just established *"link, not typing"*
as the pattern. **If it arrives with the LIFF credential, the thing to share is `lib/register/liff.ts` — the
CREDENTIAL module — not the chrome.** It is already a module with no page in it.
⇒ 📌 **Share the credential, not the shell.** 🚫 Named, nothing built.
