# ANALYSIS — REQ-118: the parent's address stored as AREA CODES — @Sober, 2026-10-12
**For @Porter → the owner. Analysis + size only — 🚫 NOT cut, nothing built.** Read in code: back `881c9a1`, front `0730275`.

## 1 · TODAY — the owner's guess is half right
**Storage (`parents`, `schema.ts:140`):**
- **`province`** — the **Thai full name**, and it must be **one of our 77** (`lib/thai-provinces.ts`; anything else is refused `PROVINCE_UNKNOWN`). **No code, no English.**
- **District and sub-district have NO column.** They are written **only as text appended into `parents.note`** — one line, `"{ตำบล} {อำเภอ} {จังหวัด or กทม}"` (`addressLine`, `lib/full-address.ts`), **mixed with the staff's own free-text notes** (`householdPatch`, `line-register.service.ts:297`).
- ⇒ **Province: a clean Thai name. District / sub-district: NOT stored as data at all** — only as a sentence inside a notes field.

**The three doors that capture it:**
| door | how | what reaches the server |
|---|---|---|
| **LINE registration PAGE** (LIFF, `RegisterContent.tsx`) | a 3-level PICKER from `thai-address-universal@2.2.0` (ISC; 77 / 928 / 7,211) | the picker **knows the official geocode of each pick** (`AreaPick.code`) **but sends only the Thai names** — the code is thrown away (`register/entry.ts`) |
| **LINE CHAT** (the bot's add-a-child flow, `line-webhook.service.ts`) | the parent **TYPES** each part | free text; only the province is checked against the 77 — **a typed district/sub-district is never checked against anything** (by ruling, TASK-590 §1) |
| **Admin «ผู้ปกครอง» form** (`ParentFormModal.tsx`) | a **province** select + the free-text **note** | province name; district/sub-district only if staff type them into the note |
**Where it is printed/read:** the parent card (People) · the LINE "address on file ({province})" line (TASK-566) · the attention list (a student whose parent has no province) · **Som report + Overview group by `province`** — ⚠️ **both are Palm's (owner ruling 2026-10-11) ⇒ we must NOT break `parents.province`; the plan keeps it.**
⚠️ **English today:** the package's English names are **garbled** (*"Khnong Tntnai"* for คลองตันเหนือ) — that is why TASK-580 removed English from the picker. ⇒ **"correct English" needs a DIFFERENT dataset.**

## 2 · THE CODE SET — recommendation, with what is and is not verified
**Codes: the official DOPA (กรมการปกครอง) administrative codes** — 2-digit province, 4-digit district, 6-digit sub-district (e.g. กรุงเทพมหานคร `10` → พระนคร `1001` → พระบรมมหาราชวัง `100101`). **The same numbering the page's picker already uses as its geocode** ⇒ the picker needs no new data to send codes.
**Names TH + EN: `thailand-geography-json`** (github.com/thailand-geography-data/thailand-geography-json) — **MIT**, static JSON, per row `provinceCode / districtCode / subdistrictCode` + `…NameTh` / `…NameEn` + `postalCode`. **77 / 928 / 7,436.** Its English reads correctly on the sample (*Phra Borom Maha Ratchawang*). The counts reconcile with DOPA's own (76 provinces · 878 districts · 7,255 sub-districts **plus Bangkok's 50 เขต and 180 แขวง** ⇒ 77 / 928 / ~7,435).
⚠️ **NOT verified — the owner decides:** **the repo does not state its upstream** (nor a date). Two choices:
- **(a) take it** (MIT; codes cross-checked against the picker's geocodes for all 7,4xx rows by script BEFORE use — any mismatch listed); or
- **(b) the owner obtains DOPA's own published code file** and we use that (names in English may then be absent or need a romanisation source).
**SA recommendation: (a), with the machine cross-check as a gate.** **Into the repo as a static, versioned JSON file read by the back end** (no seed table: it never changes at runtime, and a table is one more thing to migrate). 🚫 No hand-made list, no fuzzy matching.

## 3 · EXISTING DATA on uat — DATA REQUEST (owner, read-only, bare SQL, one at a time)
```sql
SELECT inet_server_addr();
```
```sql
SELECT count(*) AS parents, count(province) AS with_province FROM parents WHERE archived_at IS NULL;
```
```sql
SELECT province, count(*) AS n FROM parents WHERE archived_at IS NULL GROUP BY province ORDER BY n DESC;
```
```sql
SELECT count(*) AS notes_with_an_address_line FROM parents WHERE archived_at IS NULL AND note IS NOT NULL AND note ~ '(ตำบล|แขวง|อำเภอ|เขต|กทม|จังหวัด)';
```
*(First line: uat answers its INTERNAL address `172.17.172.29` — not the public `154.197.124.29` I first wrote (corrected 2026-10-12). No names, no phones, no note text leaves the database — counts and province names only.)*
**The matching plan (built as a script with a DRY RUN; the owner runs it on uat):**
1. **Province → code:** exact match of `parents.province` (always one of our 77) ⇒ **deterministic, expected 100%**; any miss LISTED.
2. **District + sub-district → codes:** ONLY from a note line that is **exactly** the format our own doors wrote (`addressLine`: three parts, the province matching `parents.province`) **AND** whose (province, district, sub-district) names resolve to **exactly ONE** code triple in the dataset ⇒ stored. **Anything else — no such line, two lines that disagree, a name not in the dataset, two triples possible — LEFT NULL and LISTED** (parent id + the reason, no personal text). 🚫 Never guessed.
3. The dry run prints: matched / unmatched counts by reason. The owner reads it, then runs the apply. **The note text is never changed.** Unmatched parents get their codes when staff open the parent and pick (§4) or the family re-registers.

### 3b · ✅ The owner's reads on uat, 2026-10-12 (via @Porter; counts only, personal text redacted)
- **Active parents 394:** **288 with a province · 106 NULL.**
- **By province:** กรุงเทพมหานคร 251 · นนทบุรี 11 · สมุทรปราการ 10 · ชลบุรี 3 · one each: เชียงใหม่, ภูเก็ต, สงขลา, กระบี่, นครราชสีมา, กาญจนบุรี, ราชบุรี, ลำปาง, ลพบุรี, ปทุมธานี.
- 🔴 **3 rows hold NON-province text in `province`:** two Thai district/sub-district strings (one with a typo) and one full English street address with a house number. **They break the 77-name rule** ⇒ older than the rule, or written by a door that does not check it (the admin PATCH is to be read for that in the build). **The backfill LISTS these 3 for a human (parent id + "province is not one of the 77"); it never parses them.**
- **Notes with an address-like line: 94.**
**⇒ What the backfill can be expected to do:** province codes for **285** (288 − 3) by exact name · **3 listed** (bad province text) · **106 stay NULL** (no province — nothing to convert; they fill in when the family or staff next enter an address) · district/sub-district only from the **≤ 94** notes, and only where the line is exactly our doors' format and resolves to one code triple — the rest listed. **The dry run reports the real numbers before anything is written.**

## 4 · CAPTURE AFTER THE CHANGE
- **Storage:** three NEW nullable columns on `parents` — `province_code`, `district_code`, `subdistrict_code` (one migration). **`province` (the Thai name) STAYS, written from the code**, so Palm's reports and every reader keep working unchanged. The server checks the triple is CONSISTENT (the district inside the province, the sub-district inside the district) — the check TASK-590 could not do without a dataset.
- **Rendering:** one helper `areaName(code, lang)` ⇒ TH or EN from the dataset, used by the parent card and the LINE "address on file" line.
- **Registration page:** **sends the three codes it already has** (tiny change); EN labels from the new dataset (the page's option labels can become bilingual again).
- **Admin parent form:** the province select becomes the **same 3-level picker** (province → district → sub-district), codes saved. New field labels ⇒ **a small copy set**.
- **LINE chat:** typed district/sub-district cannot become codes reliably. ❓ **Owner decision:** **(i) the chat sends the parent to the registration PAGE for the address** (the existing link, `liff_add_student`) — SA recommendation, no new matching rules; or (ii) the chat matches typed names EXACTLY against the dataset inside the picked province and re-asks on a miss (new words, and parents mistype).

## 5 · SIZE (SA estimate, +10% inside) — and Path B
| part | who | size |
|---|---|---|
| dataset file + cross-check script · migration (3 columns) · consistency check · register route + chat door (i) · admin PATCH · `areaName` helper · backfill script (dry run / apply, unmatched listed) · tests + mutation set | **@Jason (BE)** | **M ≈ 3 d** |
| register page sends codes + bilingual labels · admin parent form 3-level picker · parent card renders by language | **@Fern (FE)** | **S–M ≈ 1½ d**, in parallel once the contract is fixed |
| copy set (admin form labels; chat line if (ii)) | owner via Porter | — |
| **uat data:** the §3 reads, then the backfill dry run → apply | **the owner** | ≈ ½ h |
**≈ 4½–5 working days of build** + my verification + a sid gate (@Tanya: register by page, by chat, admin edit, EN/TH render, backfill dry run on sid).
**Path B: does NOT fit.** Path B waits only on Team B's answered rows (nearly done) and the camp has started; REQ-118 adds a migration, a data backfill on the live system and a capture change on three doors. ⇒ **SA recommendation: its OWN release right after Path B.** Nothing in it blocks or changes Path B.

## 6 · Decisions for the owner (each with a recommendation)
1. **Dataset:** (a) `thailand-geography-json` with the cross-check gate ⭐ / (b) DOPA's own file.
2. **LINE chat address:** (i) send to the page ⭐ / (ii) exact match + re-ask.
3. **Release:** after Path B, on its own ⭐.
