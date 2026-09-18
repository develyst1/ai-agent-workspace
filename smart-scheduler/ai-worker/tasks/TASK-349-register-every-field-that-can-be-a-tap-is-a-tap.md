# TASK-349 — `/register`: every field that can be a tap is a tap (`REQ-088 §7a`, `§7b`) + two copy fixes

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-13)
▶️ **OWNER: BUILD NOW.** *"ไปแก้มาก่อน ฉันจะเทสทีเดียว"* — **he has PAUSED testing and will test ONCE when all four
land.** ⇒ 🔑 **ONE handover message when ALL of it is in. Nothing else rides along.** 🚫 No BE change, no
migration, no stored-value change. ⛔ **Chain still stopped — these four things only.**

---

## §0 What `REQ-088` proved on the owner's phone first
✅ **Rounds 1 and 2 PASSED inside LINE:** consent → phone → *"Found your family"* → link; and a NEW parent,
*"Gekko"* added. 🔑 **The LIFF half works.** ⚠️ **Two setup facts corrected on the way — record them in
`.env.example`'s comment, not just here:** **the link parents tap is `https://liff.line.me/<LIFF_ID>`** (the
endpoint URL lives only in the LIFF config — pasting the endpoint opens a plain browser, `no-id-token`), and
**scope must include `openid`** — the ID token needs it; `profile` alone yields a profile, not a token.
📌 *That second one was MY instruction disagreeing with MY design. On the record.*

## §1 The insight, one level down — it is the whole task
> ***"A parent who will not type `สมัคร` will not type `08-09-2020` or an address."***
⇒ **every field that can be a tap should be a tap.** 🔑 **STORED VALUES UNCHANGED, both fields** — *the picker
is ENTRY, not STORAGE.* 🚫 **No migration. `REQ-085 §16e` stands.**

## §2 `§7a` — the DOB picker · **S**
**Acceptance, not design:** ***a parent picking a birth year 2–15 years back must not tap "previous month" a
hundred times.*** ⇒ **year-first, or a year/month jump — your call.**
🔴 **The stored value is STILL `DD-MM-YYYY` TEXT, and the server's parser is STILL the only validator.** ⇒ the
picker EMITS the customer's format; ✅ **the confirm screen still echoes it (TASK-277)**; ✅ **blank is still
OMITTED, never `""`** (TASK-347 §5.1). 🚫 **No `dayjs(` / `new Date(` parsing on the page beyond what the
widget itself needs to render** — 📌 *and say exactly what it needs, so the Rule-1 absence assertion is
re-scoped on purpose rather than quietly loosened.*
⚠️ **Keep a way to TYPE it** — a picker that cannot be bypassed on an old phone is the `สมัคร` problem again.

## §3 `§7b` — cascading address: จังหวัด → เขต/อำเภอ → แขวง/ตำบล · **M, and the cost is DATA**
🔴 **This needs the Thai administrative-division dataset** — 77 provinces / ~900 districts / ~7,000
sub-districts. ⚠️ **It is the one part of `REQ-088` that is NOT "the chat's logic on a page".**
**Size it as you build — three things I want stated:**
1. **SOURCE** — a maintained package or a checked-in JSON; **say which and why, and its licence.**
2. **SIZE ON A PHONE** — 🔑 **it must be loaded ONLY on `/register`, dynamically, the way `@line/liff` is** —
   *the admin bundle must not carry seven thousand sub-districts.* **State the bytes.**
3. **LABELS FOLLOW THE PROVINCE** — Bangkok is **เขต / แขวง**; everywhere else **อำเภอ / ตำบล**. ✅ Asserted.
🔑 **STORED VALUE UNCHANGED: the three picks JOIN into the SAME free-text string the chat stores** —
`พระโขนงเหนือ วัฒนา กทม`, the customer's own example. ⚠️ **Match that ORDER and that abbreviation (`กทม`), and
say how you derived the abbreviation rule rather than special-casing one city.**

### ✅ THE ESCAPE HATCH — decided, mine, and here is why
**A `พิมพ์เอง / Type it instead` toggle reveals the existing free-text field.** **Three paths, ONE stored shape:**
| the parent | stores |
|---|---|
| picks all three | the joined string |
| taps *"type it"* | whatever they type — the chat's field, unchanged |
| leaves it | **skipped** — the field was already optional (`ข้าม`) |
🔑 **Why not an "other" option inside the picker:** *"other" still needs a text box, so it is the toggle
wearing a dropdown's clothes — and it invites a half-picked address (`กทม · other · other`) which is worse than
either a full pick or free text.* 🔑 **Why not "leave it optional" alone:** *a parent who cannot find their
sub-district and has no way to type it will leave it blank when they wanted to give it.*
📌 **Told @Porter what I chose; he asked me to pick rather than make the owner wait.**

## §4 The two copy fixes from the family screen — same page, same deploy
1. **`มิลล่า (มิลล่า)` → `มิลล่า`.** ✅ **Show the nickname ONLY when it differs from the name.** 📌 *The chat's
   screen 4 lists `มิลล่า, มิลลิม, asda` — no parentheses. Match it.* Asserted both ways.
2. 🔴 **The primary button was TRUNCATED on a phone:** *"This is my family — link this LINE acc…"*. ✅ **@Porter's
   text: `Link this LINE account`** — the heading already says *"Found your family"*. 📌 *His words — a
   PLACEHOLDER by rule, but shorter is the fix regardless of the final words; pin the LENGTH bound, not the
   bytes.*

## §5 What must not change
- 🚫 **Stored values** — `birthDate` as `DD-MM-YYYY` text; `province` as one free-text string. **No migration.**
- 🚫 **Rule 1** — no validation on the page; the server's parser and guards are the only ones. ⚠️ *A picker
  that pre-validates is a second rule; a picker that merely cannot produce nonsense is fine — say which yours is.*
- 🚫 The LIFF module · the API module · `/checkin` · the confirm-echo · the blank-is-omitted rule.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok · 🔑 **the bundle size of `/register`
      stated, and the admin bundle asserted NOT to carry the dataset**
- [ ] **`§7a`:** the picker emits `DD-MM-YYYY`; a typed path remains; blank still OMITTED; confirm still echoes
- [ ] **`§7b`:** three cascading picks · labels follow the province · joined into the chat's string, the
      customer's order and abbreviation · **the toggle to type** · blank still skipped — each asserted
- [ ] **Dataset: source, licence, bytes — stated**
- [ ] **`§4`:** nickname only when it differs · the button within its length — asserted
- [ ] 🚫 **Rule-1 absence re-scoped ON PURPOSE for what the widgets need, and the re-scope named**
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM
- [ ] 🔴 **ONE report, all four, and say explicitly that nothing else changed**

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`§7b` is the first thing in `REQ-088` that is DATA rather than logic — seven thousand rows the product did
not have.** ⇒ ❓ **Where else in this product does a parent or admin TYPE something that is really a pick from
a finite list we could hold?** 📌 *Program names? Coach nicknames? The `OTHER` booking title?* 🚫 **Name them.
Build nothing.**

---

## §6 ✅ IMPLEMENTED — Fern, 2026-09-13. **All four, one page, one deploy. Stored values unchanged. Nothing else changed.**

```
bunx tsc --noEmit → exit 0
bun test          →  305 pass / 0 fail   (was 285; +20 — one new file, and the date block re-cut)
bun run build     → ok — `○ /register` still static beside `○ /checkin`
git status        →  6 modified (.env.example · bun.lock · package.json · RegisterContent.tsx · dictionaries.ts ·
                     register-page.test.ts) · 2 new (lib/register/entry.ts · entry.test.ts)
```
🚫 **No BE change · no migration · no stored-value change.** `api.ts` · `liff.ts` · `/checkin` · `register/page.tsx`
· `contract.ts` — **byte-identical** (git shows no diff). ⚠️ **One new dependency: `thai-address-universal@2.2.0`,
pinned exact** (a dataset should not float on a caret), dynamically imported — see §7b.

### The one idea, in code
**Two ways in, ONE value out.** Each field has a `pick` mode and a `type` mode; the stored value is derived from
whichever is showing — `birthDate` is `DD-MM-YYYY` text, `province` is one line — and the confirm screen, the
blank-is-omitted rule and `/create` see only that value. **The pickers are ENTRY; they cannot produce nonsense;
they do not pre-validate anything.** *(Your §5 question: mine are the "merely cannot produce nonsense" kind — the
date picker cannot emit `31-02`, the address picker cannot emit a sub-district outside its district, and neither
checks a thing after that. The server's parser and guards remain the only validators.)*

### `§7a` — the DOB picker · YEAR-FIRST, emits `DD-MM-YYYY`, typed path kept
- **Mantine `DatePickerInput` with `defaultLevel="decade"`** — the popover opens on a grid of years, so a birth
  year 2–15 years back is one tap (two if it is in the previous decade), then month, then day. **Not one hundred
  "previous month" taps.** `valueFormat="DD-MM-YYYY"` is DISPLAY only.
- 🔑 **What the widget needs, exactly:** Mantine v9's picker emits `YYYY-MM-DD` as a **STRING**. The customer's
  format is the same three parts the other way round ⇒ `toCustomerDate` is `split("-").reverse().join("-")` —
  **a reorder, not a parse. No `dayjs(`, no `new Date(`, nothing that could say "invalid".** (`@mantine/dates` and
  `dayjs` were already in the app; `DatesProvider` already wraps every route with the active locale, so Thai month
  names come for free and the year stays ค.ศ. as the customer's label says.)
- 🔴 **Rule-1 absence RE-SCOPED ON PURPOSE, and where:** the page and `api.ts` are held to the **full** TASK-348
  absence, unchanged (`parseBirthDate|dayjs(|new Date(|split("-")|toISOString` still forbidden on both). The one
  `split("-")` lives in the new `entry.ts`, which `entry.test.ts` holds to its own narrower absence: **exactly one
  `split("-")`, no `dayjs`, no `Date`, no `isValid`/`isNaN`/`throw`, no `minDate`/`maxDate`.** The old widget
  assertion (`not DatePickerInput|valueFormat`) is replaced by what is now forbidden: `type="date"` (a native ISO
  input) and `DateInput`. ✅ Mutation 5 (below) proves the narrow one has teeth.
- ✅ **A typed path stays** — the `TextInput` with `maxLength={10}` from TASK-348, unchanged, behind a
  `พิมพ์เอง / Type it instead` toggle (one subtle button under the widget). Asserted.
- ✅ **Confirm still echoes** (`birthDate || reviewSkipped`) · ✅ **blank still OMITTED** (`birthDate || undefined`,
  `api.ts` untouched). Asserted.

### `§7b` — cascading address · จังหวัด → เขต/อำเภอ → แขวง/ตำบล
**1. SOURCE — `thai-address-universal@2.2.0`, ISC.** A TypeScript rewrite of `thai-address-database` (Sellsuki), whose
rows trace to the Thai postal-code tables; **77 provinces · 928 districts · 7,211 sub-districts (7,893 rows — one
per postal code)**, each with the official geocode. *Why this one over a checked-in JSON:* it is maintained, it
ships the **geocodes**, and it is already chunked for lazy loading. 🔑 **Lookups are by GEOCODE, never by name —
`จอมทอง` is a district in BOTH Bangkok (`1035`) and Chiang Mai (`5002`), and `เฉลิมพระเกียรติ` is in five
provinces**; asserted with the real data. Rows come per postal code, so `พระโขนงเหนือ` (two codes) is collapsed to
one row; asserted.
**2. SIZE ON A PHONE — measured from the build, not the package README:**
| | raw | gzip |
|---|---|---|
| `/register` first load (18 scripts, measured from `register.html`) | 1,109,259 | **334,142** |
| `/checkin` first load, for scale (14 scripts) | 900,093 | 270,166 |
| **dataset, loaded LAZILY when the form appears in pick mode** — package index 114,471 + Thai names 148,334 + English names 97,328 + geocodes 57,040 + loader 417 | **417,590** | **127,496** |
| `@line/liff`, lazy as before | 117,957 | 31,161 |
🔑 **The admin bundle does not carry it — asserted two ways:** (a) the package name appears in **exactly one source
file**, `entry.ts`, and only as `await import(...)` (a walk of `src/**`, asserted; mutation 4 — a static import on
the page — fails it); (b) in the build, the five dataset chunks are reached ONLY through a lazy `Promise.all` in
the `/register` page chunk, and **none of the 18 prerendered HTML pages references any of them.**
⚠️ **The honest cost:** the geocode-keyed API loads the ENGLISH names and the geocode table too (≈154 KB raw /
55 KB gz of the 417) — the price of the one API that is correct by code. 📌 *Named, not built: a build-time slice
to a Thai-only, code-keyed JSON would roughly halve it.*
**3. LABELS FOLLOW THE PROVINCE** — `tierWordsFor(code)`: geocode `10` (Bangkok) ⇒ **เขต / แขวง**; anything else
(and nothing picked) ⇒ **อำเภอ / ตำบล**. The dataset carries no tier word, so this is keyed off the official
geocode, with the reason in the comment. Asserted, both branches.
**4. THE JOIN — the customer's own example, byte for byte:** `joinAddress({พระโขนงเหนือ, วัฒนา, กรุงเทพมหานคร})`
⇒ **`พระโขนงเหนือ วัฒนา กทม`** — sub-district, district, province, space-joined. Asserted. **The abbreviation
rule, derived, not special-cased by feel:** the province is written **the way a parent writes it in a chat — its
EVERYDAY name.** `กรุงเทพมหานคร` is the one province whose everyday name is not its formal name (`กทม`, universally);
every other province's everyday name IS its formal name — their official abbreviations (`ชม.`, `ขก.`, …) are
licence-plate and postal forms nobody types in an address, and the chat's parents would not either. So the table
has one row, and that is the finding. `เชียงใหม่` ⇒ `ศรีภูมิ เมืองเชียงใหม่ เชียงใหม่`; asserted, and `ชม.`-style
forms asserted absent.
**A partial pick stores what was picked, in order** (`วัฒนา กทม`) — a parent who gave province and district gave
real information, and the confirm screen shows exactly what will be stored. All blank ⇒ `""` ⇒ **omitted**, as
before. Asserted.
✅ **THE ESCAPE HATCH, as you decided it:** `พิมพ์เอง / Type it instead` reveals the existing free-text field
(TASK-348's `TextInput`, untouched); `เลือกจากรายการแทน / Pick from the list instead` goes back. **And one more
path to the same hatch, automatic:** if the dataset chunk cannot be fetched (an old phone, a bad signal), the page
drops to the typed field by itself rather than showing three dead selects. Asserted.
📌 The dataset loads **only while the form is on screen and in pick mode** — a parent who links a known family and
closes never fetches a byte of it. Asserted.

### `§4` — the two copy fixes
1. ✅ **`มิลล่า (มิลล่า)` → `มิลล่า`** — `ChildList` shows the nickname **only when it differs from the name**;
   asserted both ways (the unconditional form is asserted absent; mutation 1 proves it).
2. ✅ **The button:** EN **`Link this LINE account`** (@Porter's words, PLACEHOLDER by rule) · TH **`ผูกบัญชี LINE นี้`**.
   🔑 **Pinned by LENGTH, not bytes: `≤ 28` characters, both languages** — the truncated sentence was 43. *Why 28:*
   a Mantine `Button` inside this page's `max-w-sm` `Paper` at `p="xl"` has ~320 px for its label, ≈28 characters
   at the 14 px body size before an ellipsis. Mutation 3 (the old sentence back) fails it.

### `.env.example` — the two setup facts, in the comment
✅ **The link parents tap is `https://liff.line.me/<LIFF_ID>`**, not the endpoint URL (the endpoint lives only in the
LIFF app's config; opened directly it is a plain browser with no ID token) · ✅ **scope must include `openid`** —
`profile` alone yields a profile and no token. Both asserted present.

### 📝 Copy — 12 new keys × 2, ALL PLACEHOLDER, tagged at their lines
`dobPickPlaceholder` · `typeInstead` (*your* pair, `พิมพ์เอง / Type it instead`, pinned) · `dobPickInstead` ·
`addrPickInstead` · `addrProvince` · `addrPickPlaceholder` · `addrLoading` · and `foundConfirm` re-worded. The tier
words **เขต / อำเภอ / แขวง / ตำบล** are the law's, not a dictionary's — rendered as-is in both languages. 🚫 Nothing
invented without the mark.

### 🔑 Break-and-watch — five mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | nickname shown unconditionally again | **1 fail** |
| 2 | join order flipped (province first) | **3 fail** |
| 3 | the 43-character button sentence back | **1 fail** |
| 4 | a STATIC `import { getProvinces } from "thai-address-universal"` on the page | **2 fail** |
| 5 | `toCustomerDate` grows `!isNaN(Date.parse(...))` — a validation | **1 fail** |
All five in one call, each restored; **`md5sum` of the three mutated files identical before and after**; suite
green after.

### Definition of Done
- [x] Suite **305 / 0** · `tsc` exit 0 · build ok · **`/register` first load 334 KB gz; dataset 127 KB gz lazy;
      admin bundle asserted NOT to carry it (source walk + build graph)**
- [x] **`§7a`** picker emits `DD-MM-YYYY` · typed path remains · blank OMITTED · confirm echoes — asserted
- [x] **`§7b`** three cascading picks · labels follow the province · joined in the customer's order and
      abbreviation · the toggle · blank skipped — each asserted
- [x] **Dataset: `thai-address-universal@2.2.0` · ISC · 417,590 raw / 127,496 gz, five lazy chunks**
- [x] **`§4`** nickname only when it differs · button `≤ 28` — asserted
- [x] 🚫 Rule-1 absence re-scoped ON PURPOSE — page/API unchanged; `entry.ts` held to its own narrow absence
- [x] 🔑 Break-and-watch — five, one call, checksum
- [x] 🔴 **ONE report, all four — and nothing else changed:** the diff is the four things, their strings, their
      tests, the dependency, and the `.env.example` comment. No other file moved.

### ⚠️ Not seen on a screen — the owner's one test, and what to look at
The pickers are Mantine's and render in the Mantine popover/combobox with `withinPortal`, which is the pattern every
admin picker here uses — but **this is the first time either is inside LIFF's in-app browser.** When he tests: (a)
the year grid opens first on the date; (b) the three lists fill in turn and the tier words flip to เขต/แขวง on
กรุงเทพมหานคร; (c) the confirm screen shows `DD-MM-YYYY` and `<แขวง> <เขต> กทม`; (d) `Type it instead` on each,
and `Link this LINE account` on one line. 📌 One thing I could not measure from here: the dataset's first fetch on
a phone signal — 127 KB gz, five requests, only when the form appears.

## Question — **where else does a parent or admin TYPE what is really a pick from a list we hold? Named, not built.**
Swept every `TextInput` in `src/components` (21 distinct labels):
1. **The `OTHER` booking title** (`BookingModal`, `booking.otherTitle`) — the strongest case. It is typed free every
   time, and the same handful of titles recur (trial, make-up, event…). A list the shop owns plus *type it* is
   exactly `§7b`'s shape. 🔑 *And it is the field that BECOMES `displayName` (AC-10) — a finite list would make the
   calendar's spelling consistent for free.*
2. **`discount.reason`** (`DiscountSection`) — a reason typed on every discount; the reasons are a short recurring
   set (sibling, promo, staff). Same shape, and a picked reason is a REPORTABLE reason.
3. **`people.country`** (`StudentFormModal`, when nationality = foreign) — a country is the canonical finite list;
   typed today. Cheap: ~250 rows, no cascade.
4. **`badges.typeName`** — admin-defined, so the list is the admin's own past entries; a pick-or-type over what exists
   would stop `Gold`/`gold`/`Gold ` splitting one badge into three.
**Not candidates, and why:** student/parent/coach NAMES and nicknames (open sets by nature) · `course.noteField` /
`people.note` (prose) · phones (an identity, not a pick) · the search boxes (they already ARE picks over a list).
### 🔻 And the one I found by READING `develop` instead of remembering it — it goes at the TOP of the owner's list
**The repo already holds a 77-province pick: `lib/people/th-provinces.ts`, used by the admin's `ParentFormModal`
(SPEC-016), storing the FULL name — `กรุงเทพมหานคร` — into `parents.province`.** The chat (REQ-079) writes its free
text — `พระโขนงเหนือ วัฒนา กทม` — into **the same column** (`line-register.service.ts`: `db.update(parents).set({
province })`), and now so does the page, as this task instructs. **And `som-report.service.ts` groups demographics
by `parent.province`** ⇒ *a Bangkok family registered by an admin and one registered from LINE land in two
different buckets of the same report* — and every LINE family lands in a bucket of its own, one per sub-district
string. ⚠️ **This is not new to this task — the chat has done it since REQ-079 — but this task is the first time the
two writers were put side by side, and `§7b`'s picker now makes the stored FORM a choice rather than a parent's
typing.** I did as told: the customer's order and abbreviation, stored value unchanged, no migration. ✅ What I did
add: a pin that the dataset's 77 names equal `TH_PROVINCES` exactly (they do), so this side can never be the
cause of a split. 📌 **The decision is not mine — which form the column should hold (the admin's full name, the
chat's line, or two columns) is the owner's, with a report reading it.** *One more thing to look at when he opens a
LINE-registered parent in the admin form: the Select is fed a value that is not in its 77-row list — whether
Mantine shows it blank is a QA check, not something I can see from here.* 🚫 Named, nothing built.

📌 *For the record: my first draft of this answer said the admin had no address field. I was reading the STUDENT
form; the field is on the PARENT form. Corrected before sending.*
