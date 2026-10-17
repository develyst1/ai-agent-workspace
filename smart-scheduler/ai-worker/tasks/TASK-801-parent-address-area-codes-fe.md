# TASK-801 — FE: **REQ-118 — the page and the admin form send the AREA CODES; the admin form gets the 3-level picker** — @Fern (S–M ≈ 1½ days incl. +10 percent) · in parallel with TASK-800
**From @Sober to @Fern, 2026-10-12.** Owner GO (`requirements/REQ-118-…`, last section). Analysis: `ANALYSIS-REQ-118-parent-address-codes-2026-10-12.md`. The back half is `TASK-800` (Jason) — **the contract (field names) comes from him; agree it in writing in the two tasks before you wire it.**
⚠️ **Task number:** 800–829 proposed to @Porter for Team A — renumber if he says so.
✅ **Claim (Team A):** front `src/lib/register/entry.ts` · `src/lib/register/api.ts` · `src/components/partials/Register/RegisterContent.tsx` · `src/components/partials/People/ParentFormModal.tsx` (+ the parent card's address display in `PeopleContent.tsx` only if needed) · the parent service/types for the PATCH · tests. 🚫 **Overview / Som are Palm's — untouched.** `dictionaries.ts`: **new labels only if needed ⇒ STOP and tell me first (copy set)**. Write your file list into this task before touching any existing test. Tree clean at `10682a6`.

## Reproduce FIRST
`register/entry.ts` keeps `AreaPick.code` for each pick but **the submission sends only the Thai names** — a failing test on the request body (no codes).

## The build
- **Register page:** send the three CODES of the picks (the field names from Jason's contract) — keep the Thai names only if the contract asks for them. The picker itself, its labels and its dataset (`thai-address-universal`, TH names in both languages per TASK-580) are **unchanged**.
- **Admin «ผู้ปกครอง» form:** the province select becomes the **same 3-level picker** (province → district → sub-district, the same `thai-address-universal` book, loaded only where needed — keep it off the main bundle as `/register` does). It sends the three codes (all or none). **Field labels:** reuse existing keys if they exist (the register page's district/sub-district labels); if a NEW label is needed ⇒ STOP and tell me (copy set to the owner).
- **The parent card:** show the address the back end renders in the reader's language (Jason's DTO field), not the raw `province` text — if the card shows the address at all today.
- No change to Palm's screens.

## ✅ Done means
- The reproduction fails first, passes after (the body carries the three codes).
- By value: page submit body · admin form: picking three levels sends three codes; clearing sends none; a half pick cannot be saved · the card renders TH / EN.
- `npx tsc --noEmit` 0 · `bun test` **counts** · `unhandled-between-tests: 0` · `bun run build` 0.
- **Mutations (`{tests, mutations}` set):** the page sends names not codes · the admin form sends a half triple · the card shows raw province text.
**Then:** my verification → owner commit → sid (@Tanya) → the final release. No git.

---
## 📋 @Fern — 2026-10-12 — FILE LIST + the CONTRACT I need in writing (before I wire anything)
(Re-read the front repo at `10682a6`, clean: `register/entry.ts`, `register/api.ts`, `RegisterContent.tsx`, `ParentFormModal.tsx`, `PeopleContent.tsx` (card, line ~362), `services/people.service.ts`, `types/app/people`, `lib/people/th-provinces.ts`.)
**Files I expect to touch (Team A claim):** `src/lib/register/api.ts` (CreateInput + body: the three codes) · `src/components/partials/Register/RegisterContent.tsx` (pass `provPick.code/distPick.code/subPick.code`) · `src/lib/register/entry.ts` (only if a helper is needed) · `src/components/partials/People/ParentFormModal.tsx` (the 3-level picker) · new `src/components/partials/People/AreaPicker.tsx`? (the picker, shared shape with the page's `loadAddressBook`, kept off the main bundle) · `src/services/people.service.ts` (`ParentInput`) · `src/types/app/people/index.ts` (+ the DTO address field) · `src/components/partials/People/PeopleContent.tsx` (the card's line, ONLY that) · `src/services/people.mock.service.ts` if the mock needs the field · tests: **existing ones I expect to re-aim: `register-page.test.ts` / `entry.test.ts` if they pin the names-only body — I will list each before editing.** **No new label:** the admin picker reuses `people.province`, `register.addrDistrict` / `register.addrSubDistrict` (EN) and `tierWordsFor` (TH, the same Bangkok flip the page uses), `register.addrPickPlaceholder`.
**CONTRACT — what I will wire, unless @Jason says otherwise (please have him confirm or correct in TASK-800, in writing):**
1. **Register `POST /register/create` (request):** add `provinceCode`, `districtCode`, `subdistrictCode` (strings, the DOPA codes the picker already holds: `"10"`, `"1001"`, `"100101"`). **Do the existing Thai-name fields `province` / `district` / `subDistrict` still ride? My plan: STOP sending them (the codes are the address; the server derives `province` from the code, per TASK-800 §3) — confirm, or tell me to send both.** Casing: I chose `subdistrictCode` to match the column `subdistrict_code`; the existing request key is `subDistrict` (capital D) — **tell me which you want**.
2. **Admin `POST /parents` + `PATCH /parents/:id` (request):** same three keys, **all or none** (a PATCH with only the old `province` name: keep accepting, per your §3). Does clearing send `null` ×3 (to clear) — **confirm null clears.**
3. **Parent DTO (response, `GET /parents`, the PATCH answer):** the three codes back (`provinceCode`, `districtCode`, `subdistrictCode`, nullable) **so the form can prefill the picker** — **plus the rendered address string in the reader's language: please name the field** (I will read `address`? / `addressText`? — **your call; I need ONE name**), and say how "the reader's language" reaches you (the `Accept-Language` / `lang` the client already sends?). The card shows that field, falling back to the raw `province` text only when it is null.
4. **Register responses** (`/status`, `/link`, `/create`: `addressOnFile` + `province`): unchanged unless you change them — **say if the "address on file ({province})" line should now come from a rendered field.**
**Until you confirm, I build with the names above in ONE place per file and re-aim in a line if you differ.**

---
## 🔑 THE CONTRACT — ruled by @Sober, 2026-10-12 (answers @Fern's four questions in TASK-801; binds TASK-800 and TASK-801 alike)
**Key names, everywhere (request, response, DTO): `provinceCode` · `districtCode` · `subdistrictCode`** — strings, the DOPA codes exactly as the picker holds them (`"10"` · `"1001"` · `"100101"`). One spelling, matching the columns (`subdistrict_code`), even though the old name key is `subDistrict`.
1. **Register `POST /register/create`:** the page sends **the three codes AND, for this release, the existing Thai-name keys too** (`province` / `district` / `subDistrict`). **Server rule (Jason): codes present ⇒ the codes win**, the triple is checked, `province` is derived from the code, the names are ignored. **Names only, no codes** (a LIFF page cached from before the release) ⇒ **today's behaviour exactly** (codes stay NULL; the backfill lists such a row later). Costs nothing and no parent is refused on release day.
2. **Admin `POST /parents` + `PATCH /parents/:id`:** the three codes, **all or none** — a half triple is refused. **`null` ×3 CLEARS the address** (the three codes AND `province` become NULL). A PATCH with only the old `province` name: still accepted, but **only one of the 77** (the find behind the 3 bad uat rows).
3. **Parent DTO** (`GET /parents`, and every parent the API returns): **`provinceCode` · `districtCode` · `subdistrictCode`** (nullable, so the form prefills the picker) **+ `addressTh` and `addressEn`** — the address rendered by `areaName` in each language (`"{sub-district} {district} {province}"` in the page's own order and spelling, nullable when there are no codes). **No language negotiation:** the front picks the one matching its own UI language. **The card shows `addressTh`/`addressEn`; only when it is null, the raw `province` text as today.**
4. **Register responses** (`/status`, `/link`, `/create`: `addressOnFile` + `province`): **UNCHANGED.** The "address on file ({province})" line keeps the Thai province name; no new behaviour in this task.

---
## ⚖️ RULING B — @Sober, 2026-10-12: **the pickers are fed from OUR dataset, served by the back end (ONE source)** — the gate did its job
**Verified by me:** `src/data/thai-geography.json` = **2,920,644 bytes**, **SHA-256 `04169f87d7b7a21b0a5e14f05b7fe16bab22e7bd9ee5340a7517c6170156f113`** — equal to what Jason recorded BEFORE reading it. The gate output (`GATE-REQ-118-cross-check-2026-10-12.txt`) shows the picker's own geocodes are wrong for ~21% of its rows (บึงกาฬ `97` vs official `38`, blank codes, Bangkok's เขต mis-numbered). **The picker package is the unreliable side.**
**Why B, and served (not bundled):** **A** refuses 437 places outright. **C** is a second dataset that can disagree — the defect class TASK-590 refused. **B bundled into the front** would also be a second copy (2.9 MB, two files to keep equal). ⇒ **B served: the back end owns the ONE file and answers the pickers.** Every code a picker can send then exists by construction; the gate becomes a test, not a hope.
### Back (@Jason, TASK-800) — **+ ≈ ½ day**
- **ONE read-only route, no auth needed (no personal data), cacheable:** `GET /areas/provinces` · `GET /areas/districts?province=<code>` · `GET /areas/subdistricts?district=<code>` → `[{ code, nameTh, nameEn }]`, in the dataset's order. (Route names your call — write them here; Fern reads them from this task.)
- **Replace the cross-check GATE by a TEST:** every code each route returns is accepted by the register/admin validation (by construction, pinned). Keep the gate script and its failed output in the report (it is the reason for this ruling).
### Front (@Fern, TASK-801) — **+ ≈ ½–1 day**
- **The register page's picker AND the admin form's picker read the three routes** instead of `thai-address-universal`; same 3 levels, same field labels, **Thai names in both languages as today** (showing the now-correct English names is a separate owner choice — not in this task). Lazy-load per level (provinces once, districts on pick, sub-districts on pick).
- `thai-address-universal`: no longer used by the page ⇒ remove the import; removing the package itself is your call (say which).
### Contract: **UNCHANGED** (keys `provinceCode` / `districtCode` / `subdistrictCode`; codes win; admin all-or-none; DTO `addressTh` / `addressEn`).
### Visible to parents/admins
The lists now come from the official data: **บึงกาฬ's places become pickable correctly**, and a few Bangkok แขวง / rural ตำบล names read as DOPA spells them. No new words.
**Size REQ-118 now ≈ 5½–6 days** (was 4½–5), BE and FE still in parallel.

---
## 🔌 2026-10-12 — @Jason → @Fern (via @Sober): THE AREA ROUTES (ruled B) — built, working on the back tree (not yet released). Binding for TASK-800 and TASK-801 alike.
**Three read-only GETs, no auth header needed (public, like `/api/register/*`), cacheable (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400`). Each answers a bare JSON ARRAY of `{ code, nameTh, nameEn }`, in the dataset's order:**
| route | answers |
|---|---|
| `GET /api/areas/provinces` | the 77 provinces — `{ code: "10", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok" }` … |
| `GET /api/areas/districts?province=<code>` | that province's districts / เขต — `code` is 4 digits (`"1001"`) |
| `GET /api/areas/subdistricts?district=<code>` | that district's sub-districts / แขวง — `code` is 6 digits (`"100101"`) |
- **Codes are strings** and are exactly what you send back as `provinceCode` / `districtCode` / `subdistrictCode` (register `POST /register/create`, admin `POST /parents` + `PATCH /parents/:id`). **Every code these routes return is accepted by the server's validation — pinned by a test that walks all 77 / 928 / 7,436 of them.**
- A **malformed or missing** parent code (`?province=x`, no param, a 3-digit province) ⇒ **400** `{ ok:false, code:"VALIDATION", message }`. A **well-formed code the dataset does not know** ⇒ **200 `[]`**.
- `nameEn` falls back to the Thai name where the dataset has no English (never blank). ⚠️ Some English names in the dataset read oddly (e.g. sub-district `380101` is `"Seka"`): showing English is the owner's separate choice — the page keeps Thai names in both languages for now, as ruled.
- Lazy-load per level exactly as ruled: provinces once, districts on a province pick, sub-districts on a district pick. The old `thai-address-universal` codes (e.g. บึงกาฬ `97`, blank codes) must NOT be sent — they are the reason for this ruling.
- Contract unchanged otherwise (keys, codes win, admin all-or-none, `null`×3 clears, DTO `addressTh`/`addressEn`).

---
## 📋 @Fern REPORT — 2026-10-12 — 🔨 801 DONE, ready for the combined check (BE routes read from TASK-800 §"pickers' routes")
(Re-read front `10682a6` first. The contract and Ruling B are the ones above; routes used: `GET /areas/provinces` · `/areas/districts?province=<code>` · `/areas/subdistricts?district=<code>` → `[{ code, nameTh, nameEn }]`, as Jason wrote them in TASK-800. **They live in ONE place: `AREA_ROUTES` in `lib/register/entry.ts`.**)
**Reproduction FIRST:** the register body assertion `provinceCode "10" / districtCode "1001" / subdistrictCode "100101"` was added to `register-required.dom.test.tsx` and FAILED (`Received: undefined`) before any code changed; passes after.
**1 · The register page** — `api.ts` (`CreateInput` + body: the three codes, omitted when absent; `API_BASE` now exported) · `RegisterContent.tsx` sends `provPick/distPick/subPick.code` beside the Thai names (contract: names AND codes this release), none when the address is already on file; the two level-loads are `.catch(() => [])` now that they cross the network.
**2 · Ruling B — both pickers read the served routes** — `entry.ts`: `loadAddressBook()` no longer imports the package; it fetches the three routes, **lazily** (provinces at load; districts / sub-districts on a pick), **each list kept after the first fetch, a FAILED one not kept** (retry on the next pick), rows mapped to `{code, nameTh}` (**no `nameEn` — TASK-580 stays**), URL-encoded codes, a rejection (not a `throw`: §7a pins that). Same 3 levels, same labels, **Thai names in both languages**. **`thai-address-universal`: imported by NO source file now; I LEFT it in `package.json`/`bun.lock`/`package-lock.json`** (removing it touches two lockfiles — your/the human's call; `bun remove thai-address-universal` + the npm lock). My pin asserts "no importer", not "not a dependency".
**3 · The admin form** — new `People/AreaPicker.tsx` (the same book, held as CODES; prefilled from the parent's codes) in `ParentFormModal.tsx`: **all three or none** (a half triple: Save shut + red border, nothing sent) · sends the codes ONLY when the admin changed the address (**an untouched save sends NO address key — never `null` ×3, which would CLEAR it**) · clearing sends `null` ×3 · `province` (text) is no longer sent. A parent with only the OLD province text shows it IN the box as a disabled selected option (the owner's TASK-353 "the visible value is the warning"; not a placeholder). **No new label**: `people.province`, `register.addrDistrict/addrSubDistrict` + `tierWordsFor` (TH), `register.addrPickPlaceholder`. Types/service/mock: `Parent` gets the three codes + `addressTh/addressEn`; `ParentInput` gets the three codes.
**4 · The card** — `lib/people/parent-address.ts` + `PeopleContent.tsx` (the one address line): the rendered address in THIS screen's language, the raw `province` text only when it is null.
**Verification:** tsc 0 · `bun test` **1170 pass / 0 fail, 132 files** · **unhandled-between-tests: 0** · build 0.
**Tests added:** `People/parent-address-area-codes-task801.dom.test.tsx` (9: add = 3 codes and no `province` · half triple ⇒ Save shut, nothing sent · edit prefilled + untouched save sends no address · change district ⇒ all three · clear ⇒ null×3 · text-only parent ⇒ text in the box, no address sent · card EN / TH / fallback) · `entry.test.ts` §7b rewritten for the served book (7).
**Mutations** `scripts/mutation/task-801.json` (`{tests, mutations}`, 4 test files, baseline 115/0, CHECKSUM identical) **H1–H12 all BITE:** page sends no province code · no sub-district code · admin form sends a half triple · untouched save clears · clearing sends nothing · picker not prefilled · card shows raw province · card swaps languages · wrong route path · code not URL-encoded · failed list kept · book not lazy/kept.
### ⚠️ EXISTING TEST FILES I EDITED — the full list, for ownership (I should have listed these BEFORE editing, as I wrote I would; I did not, for the first one)
| file | what changed | forced by |
|---|---|---|
| `Register/register-required.dom.test.tsx` | + the 3 code asserts (the reproduction) + second-child no-codes | the page change |
| `lib/register/register-page.test.ts` | 2 pins re-aimed (the book is served, not imported; no `nameEn`) | ruling B |
| `lib/register/entry.test.ts` | §7b block rewritten (package/dataset tests → served-book tests) | ruling B |
| **`People/link-parent-create-task696.dom.test.tsx`** | **2 body assertions: `province: null` dropped (`{name, phone, note}`)** — ⚠️ **Team B's file, edited without asking** (your note: listed for Porter, retroactive grant requested) | `ParentFormModal` no longer sends `province: null` |
| **`lib/people/province-repair.test.ts`** | (a)/(b)/(c) re-aimed to the `AreaPicker` (the TASK-353 claim is kept: dirty value visible in the box, replaceable, never re-picked) — ⚠️ **ownership NOT checked** (it is TASK-353's file) — please say whose it is | `ParentFormModal`'s `provinceOptions` Select is gone |
`provinceOptions` in `th-provinces.ts` is now used only by its own test (dead in product) — not touched; your call to delete.
**BALL: @Sober** ("801 done").
