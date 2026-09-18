# TASK-350 — `/register`: one language at a time, and a prominent TH/EN toggle (`REQ-088 §8`) + two nits

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-13)
▶️ **OWNER** — *"ทำปุ่มเด่นๆ ให้เปลี่ยนภาษาได้ ให้เหมาะสำหรับคนไทย และชาวต่างชาติ"*. **Size S.** 🚫 No BE change, no
migration, no stored-value change. ⛔ **Chain stopped — `§8` and the two nits only. One report.**

---

## §1 Why a toggle and not the chat's stacked bilingual
🔑 **A chat bubble can be tall; a form that doubles every label doubles the page.** ⇒ **ONE language at a time,
with a VISIBLE TH/EN control at the TOP, before the first field.** ⚠️ ***"เด่นๆ" — not a footer link, not a
settings icon.*** 📌 *A `SegmentedControl` at the head of the `Paper` is the obvious shape; yours to choose, but
it must be seen before the phone field is.*

## §2 ✅ It is a SWITCH over a dictionary that already exists
**`I18nProvider` already carries `lang` + `setLang` with a saved preference, and `dictionaries.ts` is already
`th: typeof en`** ⇒ **every key has both halves by construction.** ✅ **The toggle calls `setLang`. That is the
mechanism, and it is why this is S.**
📖 **DEFAULT — @Porter's reading, and I agree: the LINE app's language.** `liff.getLanguage()` on init, mapped
`th-*` ⇒ `th`, else `en`, **applied only when no saved preference exists** — 🔑 *a parent who toggled last time
keeps their choice; a first-time parent gets their phone's.* ⚠️ **`liff.ts` stays the CREDENTIAL module — say
where the language read lives so it does not become "the LIFF module does two things".**
🚫 **Stored data does not change with the toggle** — labels, hints, buttons, errors only. ✅ Asserted: toggling
mid-form changes no state but `lang`.

## §3 The tier words — DECIDED, and it is the same answer as @Porter's
**เขต / แขวง / อำเภอ / ตำบล STAY THAI in both languages.** 🔑 **They are proper nouns a foreign parent sees on
their own mail, and they are what the law calls them** — *an English "District" would make a parent look for a
word that is not on their envelope.* ✅ **You already render them as-is; assert that the toggle does not touch
them.**

## §4 The two nits
1. **`Province` → `จังหวัด` in Thai mode.** ✅ *The key is already bilingual; this is the toggle working — assert
   it as a named case.*
2. **The typing instruction shows in TYPED mode only.** 🔑 **In pick mode the tier labels ARE the instruction —
   owner confirmed.** ✅ Asserted both modes.

## §5 📝 The 29 placeholders become 29 PAIRS — and the split is exact
**The customer sees the THAI half; the ENGLISH half reuses THEIR `§17c` English wherever a field matches.**
✅ **Every key already has both halves — what this task does is make each half VISIBLE on its own**, which is
what turns a placeholder into something a customer can read and approve. 📌 **List, in the report, which
English halves are the customer's `§17c` words and which are @Porter's** — *so his single visit carries the
right question for each.*

## §6 What must not change
- 🚫 Stored values · the LIFF credential module's job · `api.ts` · the pickers · the join · the length bound.
- 🚫 The admin app's language behaviour — *`setLang` is shared; the toggle must not change what the admin sees.*
  ⚠️ **Check whether the saved preference is one key for the whole origin — if so, say whether a parent's
  toggle on `/register` would flip an admin's screen on the same phone, and what you did about it.**

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok
- [ ] 🔑 **A visible TH/EN control ABOVE the first field** — asserted present and positioned
- [ ] **Default = LIFF language when no preference is saved; saved preference wins** — asserted both
- [ ] **Toggling changes `lang` and nothing else** — asserted
- [ ] **Tier words unchanged by the toggle** — asserted
- [ ] **The two nits** — asserted as named cases
- [ ] **`§6`'s shared-preference question answered**
- [ ] **The report lists which English halves are the customer's and which are @Porter's**
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`/register` now has a toggle and `/checkin` does not.** ⇒ ❓ **Does `/checkin` need one — or is it fine
because it is one screen a parent already reached from a message in their own language?** 🚫 **Name your
reading. Build nothing.**

---

## §7 ✅ IMPLEMENTED — Fern, 2026-09-13. **One language at a time; the toggle is the first thing on the page; it changes `lang` and nothing else.**

```
bunx tsc --noEmit → exit 0
bun test          →  312 pass / 0 fail   (was 305; +7, all in register-page.test.ts §8)
bun run build     → ok — `○ /register` still static
git status        →  6 modified (register/page.tsx · RegisterContent.tsx · I18nProvider.tsx · LanguageToggle.tsx ·
                     liff.ts · register-page.test.ts) · 1 new (lib/register/locale.ts)
```
🚫 No BE · no migration · no stored-value change · **no new dictionary key** (every string the toggle shows already
had both halves) · `api.ts` · `entry.ts` · the pickers · the join · the length bound — untouched.

### `§1` / `§2` — the toggle: the app's own, at the head of the `Paper`, every phase
`<LanguageToggle size="md" fullWidth />` is the **first child of the page's `Stack`** — above the title, above the
LIFF loading text, above the phone field, and it stays while the form, the confirm and the done screen show.
`LanguageToggle` is the admin header's own `SegmentedControl` (`EN | ไทย`); it grew two props with the old defaults
(`size`, `fullWidth`) so the header is unchanged and `/register` gets it "เด่นๆ". ✅ Asserted: position (before
`register.title` and before the first phase), and that nothing guards it on a phase.
🔑 **It calls `setLang`. That is all it does** — asserted on the component (no `setPhase`/`localStorage`/`fetch`),
and on the page: `lang` appears **exactly twice** — the destructure and the `DatesProvider` locale — with no
`[lang]` effect and no `lang ===` branch. **No field, no pick, no draft, no phase moves with the toggle.**

### `§2` — DEFAULT: the LINE app's language on a FIRST visit; a saved choice wins — and where the read lives
- **`src/lib/register/locale.ts`** (new, 20 lines) — `phoneLanguage()`: `liff.getLanguage()` → `th`/`th-TH`… ⇒ `th`,
  anything else ⇒ `en` (the two languages the dictionary has). 🔑 **`liff.ts` stays the CREDENTIAL module**: it
  gained one export, `loadLiff` (the SDK object, loaded once, so the two modules share ONE `liff`), and it **never
  calls `getLanguage`** — asserted. `getLanguage()` is valid after `init`, which `obtainIdToken` has already done by
  the time the page asks; the page calls `phoneLanguage()` right after the token is in hand.
- **`I18nProvider.setLangIfUnset(lang)`** (new, additive) — reads storage **at call time** (the LIFF answer arrives
  well after mount), returns if a saved `en`/`th` exists, otherwise sets the state **without saving** — a device
  default is never written; only a tap is. ✅ Asserted both halves; mutation 2 (the `return` removed ⇒ the phone
  overrides a parent's saved choice) fails.
- 🚫 The page never calls `setLang` directly — asserted.

### `§6` — the shared-preference question: **YES it was one key for the whole origin, and it no longer is**
**`ss.lang` in `localStorage` is per ORIGIN.** Before this task, a TH/EN tap on `/register` would have written the
admin's `ss.lang` and an admin's choice would have been the parent's default — on the same browser. In practice a
parent is inside LINE's in-app browser (its own storage), but *the owner testing the LIFF URL in Chrome on a phone
he also runs the back office on* is exactly the same browser. ✅ **What I did:** `I18nProvider` takes an optional
`storageKey` (default unchanged, `ss.lang`), and `register/page.tsx` mounts a NESTED provider with
**`ss.lang.register`** around `RegisterContent` — React context resolves to the nearest provider, so the page has its
own language and its own saved preference, and the admin's `ss.lang` is never read or written from `/register`.
Asserted: the key, the nesting, that `setItem` uses the prop and never the constant, and that the admin header still
mounts the toggle with no key of its own. Mutation 3 (the key removed) fails.
📌 One consequence handled: the root `DatesProvider` follows the ADMIN's language, so the page wraps its own
`DatesProvider` with the page's `lang` — the date picker's month names follow the toggle, not the admin's setting.

### `§3` — the tier words stay Thai in both languages
`tierWordsFor` returns the four literals with **no `t(` and no `lang`** in its region — asserted; the page renders
`label={tier.district}` / `{tier.subDistrict}` straight from it. Mutation 4 (`"เขต"` → `"District"`) fails two
tests. *They are what is printed on the envelope; an English "District" would send a parent looking for a word that
is not there.*

### `§4` — the two nits
1. ✅ **`Province` ⇒ `จังหวัด`** — the same key `addrProvince`, both halves, asserted as a named case.
2. ✅ **The typing instruction (`provinceLabel`, the customer's screen-6 sentence) shows in TYPED mode only** — in
   pick mode the three tier labels ARE the instruction. The `Text` above the selects is gone; asserted that the pick
   region has no `provinceLabel` and the form has it exactly once (the typed field's label). Mutation 5 fails.

### 📝 The placeholders as PAIRS — which English half is whose
**Every `register.*` key has both halves by construction (`th: typeof en`).** The split, by key:
- **21 VERBATIM — BOTH halves the customer's `§17c` / chat words** (`phoneLabel` · `nameLabel` · `birthDateLabel` ·
  `provinceLabel` · `foundTitle` · `twofaLabel` · `linkedTitle` · `linkedPhone` · `dupDetailHint` · `confirmTitle` ·
  `confirmQuestion` · `createdTitle` · `createdAtMax` · `PHONE_INVALID` · `PHONE_BOUND_TO_OTHER_LINE` ·
  `LINE_BOUND_TO_OTHER_FAMILY` · `TWOFA_CODE_REQUIRED` · `TWOFA_CODE_BAD` · `NAME_REQUIRED` · `NAME_RESERVED` ·
  `NAME_DUPLICATE_NEEDS_DETAIL`). **Nothing to ask the customer here.**
- **2 ADAPTED — the customer's sentence, one clause changed, both halves** (`NOT_LINKED` · `BIRTHDATE_INVALID`).
  *One question each: "we changed 'type skip' to 'leave it blank' — fine?"*
- **2 BORROWED from `/checkin`** (`closeHint` · `connectFail`) — already on a customer-facing page.
- **36 PLACEHOLDER pairs — both halves @Porter's, with three exceptions:**
  - `FAMILY_FULL` — **TH is the server's own sentence, verbatim; EN is @Porter's.**
  - `foundConfirm` — **EN is @Porter's `Link this LINE account` (from `§4` of TASK-349); TH `ผูกบัญชี LINE นี้` is
    mine, marked.**
  - `typeInstead` — **@Sober's pair `พิมพ์เอง / Type it instead`, pinned.**
  The other 33: `title` · `liffMissing` · `liffLoggingIn` · `liffFailed` · `loading` · `phoneSubmit` · `twofaHint` ·
  `childrenTitle` · `addChild` · `familyFull` · `birthDatePlaceholder` · `dobPickPlaceholder` · `dobPickInstead` ·
  `addrPickInstead` · `addrProvince` · `addrPickPlaceholder` · `addrLoading` · `provincePlaceholder` · `formNext` ·
  `confirmSave` · `confirmBack` · `reviewName` · `reviewBirthDate` · `reviewProvince` · `reviewSkipped` ·
  `createdCount` · `close` · `retry` · `TOKEN_MISSING` · `TOKEN_WRONG_CHANNEL` · `TOKEN_INVALID` · `TOKEN_EXPIRED` ·
  `TWOFA_NOT_CONFIGURED`. *(29 from TASK-348 + 7 from TASK-349 = 36; the customer sees the Thai half of each in
  Thai mode and the English half in English mode — one visit, one list, each pair readable on its own.)*

### 🔑 Break-and-watch — five mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the toggle moved BELOW the title | **1 fail** |
| 2 | `setLangIfUnset` no longer returns on a saved value (the phone overrides a choice) | **1 fail** |
| 3 | `storageKey` removed — `/register` back on the admin's `ss.lang` | **1 fail** |
| 4 | tier words `"เขต"` → `"District"` | **2 fail** |
| 5 | the typing instruction shown in pick mode again | **1 fail** |
Each restored; **`md5sum` identical** on all four mutated files before and after; suite green after.

### Definition of Done
- [x] Suite **312 / 0** · `tsc` exit 0 · build ok
- [x] 🔑 Visible TH/EN control ABOVE the first field — asserted present and positioned
- [x] Default = LIFF language when nothing saved; saved wins — asserted both; the read lives in `locale.ts`
- [x] Toggling changes `lang` and nothing else — asserted (component + page)
- [x] Tier words unchanged by the toggle — asserted
- [x] The two nits — asserted as named cases
- [x] `§6` answered: it WAS one key per origin; `/register` now has `ss.lang.register`
- [x] The pairs listed with whose each English half is
- [x] 🔑 Break-and-watch — five, one call, checksum

### ⚠️ Not seen on a screen
The `SegmentedControl` at `size="md" fullWidth` inside the `max-w-sm` `Paper`, inside LIFF's browser — the shape is
the admin header's, the size is new. When the owner tests: the toggle is the first thing; a Thai phone opens in
Thai on first visit; a tap sticks across a reload; `จังหวัด` in Thai mode; no instruction sentence above the three
selects; the tier words Thai in both modes; and — the `§6` check — his back office on the same phone keeps its
own language after he toggles `/register`.

## Question — **does `/checkin` need a toggle?** ⚠️ owner's list, nothing built
**My reading: `/checkin` does not need a TOGGLE — but it has the DEFAULT problem, and that one is real.**
`/checkin` is one screen a parent reached from a message in their own language; a language control there is a
control on a page with one sentence and one button. **But it mounts under the ROOT provider: `DEFAULT_LANG = "en"`,
`ss.lang`.** ⇒ *a Thai parent tapping the check-in link sees ENGLISH unless that browser happens to hold a saved
`ss.lang` — and the only thing that writes `ss.lang` is the admin header.* `/checkin` is not LIFF, so `getLanguage`
is not available there; the phone's `navigator.language` is. 📌 **If it is fixed, it is the same 10 lines as here:
a nested provider with its own key and a device default — the credential module and the page untouched.** And the
same `§6` shape applies to it today: `/checkin` reads the admin's `ss.lang` on a shared browser. 🚫 Named, not built.
