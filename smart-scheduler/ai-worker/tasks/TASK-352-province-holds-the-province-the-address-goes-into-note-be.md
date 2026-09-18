# TASK-352 — `province` holds the PROVINCE; the address goes into `note` (`REQ-088 §9`) — back end

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-13)
▶️ **OWNER-RULED** — *"เก็บจังหวัดลงจังหวัด และเอาจังหวัด อำเภอ ตำบล มาต่อกัน แล้วเซฟลง note แทน"*. **Size S.**
🚫 **NO migration.** ⛔ **Chain stopped — `§9` only. One message when both halves land.**

---

## §1 The ruling, and why it is better than the three options we had
| column | holds |
|---|---|
| `parents.province` | **the PROVINCE only** — the admin form's full name, `กรุงเทพมหานคร` |
| `parents.note` | **the full address, the customer's format**, `พระโขนงเหนือ วัฒนา กทม` — **APPENDED** |
🔑 **The report groups correctly, the customer's line survives, no migration, and the address lands in the
field staff already read.**

## §2 ✅ ONE writer, ONE branch — you built the writer, so this is small
**`createStudentFromLine(parent, input)` is the one writer for BOTH doors.** ✅ **Its input gains ONE optional
field and its `province` field changes meaning:**
```ts
input: { name; birthDate?; province?: string | null; address?: string | null }
```
| the page sends | `parents.province` | `parents.note` |
|---|---|---|
| **PICKED** — `province` = the picked NAME (full form) · `address` = the joined line | ← `province` | ← `address`, APPENDED |
| **TYPED** — `address` only | 🚫 **untouched** — *no guessing a province out of free text; a wrong bucket is worse than an empty one* | ← `address`, APPENDED |
🔑 **The CHAT changes by CONSTRUCTION, not by a second edit:** it already calls this writer with only the typed
line ⇒ **route the chat's screen-6 string to `address`, and `province` is never written by the chat.**
✅ **Assert that: the chat's call site passes `address` and never `province`.**
🔴 **APPEND, never overwrite:** `note = existing?.trim() ? existing + "\n" + address : address`. ⚠️ ***A staff
note about allergies must not vanish because a parent re-registered.*** ✅ Asserted with an existing note.
📌 **And the picked province must be a REAL one:** ✅ **assert `province`, when present, is one of the 77 the
admin's list holds** — *the FE pins the dataset equal to it; the BE should refuse anything else with a named
code (`PROVINCE_UNKNOWN`), so a bad client cannot split the column.*

## §3 The contract — one field, and it is already agreed
**`POST /register/create` body gains `address?: string`; `province?: string` now means the PICKED PROVINCE
NAME.** ✅ **Tell @Fern the exact field names before you build — she is building the other half now.**
🚫 **No new i18n key, no copy, no `message` field — still codes.**

## §4 What must not change
- 🚫 The other writes in `createStudentFromLine` · the admin notification · `bindFamilyLine` · the chat's
  REPLIES · the `§17c` screens.
- 🚫 **The admin form's `ParentFormModal` writer** — it sets `province` from its own 77-row list and is CORRECT.
- 🚫 **No cleanup of existing rows** — 🔴 **`§9.1`: the owner MOVED the addresses himself and is LEAVING
  `province` dirty ON PURPOSE**, *so a visibly broken dashboard gets fixed by the admins who know the family.*
  **If anyone proposes a script, `§9.1` is the answer.**

## Definition of Done
- [ ] `bun test` all pass, **state the count** · typecheck clean · 🚫 no migration (**35 = 35**)
- [ ] 🔑 **PICKED ⇒ `province` = the name, `note` ← the line** — asserted
- [ ] 🔑 **TYPED ⇒ `note` ← the string, `province` UNTOUCHED** — asserted, ⚠️ *including when `province` already
      held a value*
- [ ] 🔴 **`note` is APPENDED, never overwritten** — asserted with an existing note
- [ ] **The chat's call site passes `address` and never `province`** — asserted
- [ ] **An unknown `province` is refused with `PROVINCE_UNKNOWN`** — asserted
- [ ] **The field names sent to @Fern** — say when
- [ ] 🔑 **Break it and watch** — `finally`, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`parents.note` now receives ADDRESSES from a machine and ALLERGIES from a human, appended in arrival
order.** ⇒ ❓ **Is there anything that READS `parents.note` and assumes it is one thing?** 📌 *The admin form
shows it; does anything parse it, truncate it, or print it on a message?* 🚫 **Name it. Build nothing.**

---

# 📜 THE FIELD NAMES — @Jason → @Sober, for @Fern, BEFORE the writer is built (2026-09-13)

**`POST /api/register/create`** — body, two fields touched, everything else as in TASK-347 §C3:
| field | type | meaning | lands in |
|---|---|---|---|
| `province?` | `string` | 🔑 **the PICKED province, FULL FORM, exactly as the admin's 77-row list spells it** — e.g. `กรุงเทพมหานคร`, never `กทม` | `parents.province` ← the name |
| `address?` | `string` | **the joined line, the customer's own format** — e.g. `พระโขนงเหนือ วัฒนา กรุงเทพมหานคร` (ตำบล อำเภอ จังหวัด, space-joined, as the page assembles it) | `parents.note` ← **APPENDED** on a new line; never overwrites |
**Send:** PICKED ⇒ both fields. TYPED ⇒ `address` only — 🚫 **do NOT send `province` for a typed address; the server will not guess one, and a wrong bucket is worse than an empty one.** ข้าม ⇒ neither.
**One new refusal:** `{ ok: false, code: "PROVINCE_UNKNOWN", province }` **400** — the name is not one of the 77. 📌 *The BE holds its own copy of the 77 (`src/lib/thai-provinces.ts`, full forms) and refuses anything else; the FE's dataset should pin equal to it, not the other way round.*
**Unchanged:** the response shape · every other code · `birthDate` (`DD-MM-YYYY` text) · `detailProvided`.
🚫 **The chat sends `address` only, never `province`** — by construction, asserted.

---

# 📤 REPORT — @Jason → @Sober (2026-09-13)

✅ **DONE (code).** **2099 pass / 0 fail**, **170 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (35 = 35)** · no copy, no key, codes only. **Field names sent to you for @Fern BEFORE the writer was touched** (the §📜 block above, and `inbox/SA.md`, first thing this morning).
**Changed:** the one writer · the composition · the chat's confirm call site (one word: `province` → `address`) · the route (one field, one code). **New:** `lib/thai-provinces.ts` (the 77) · one test file. Two pins rewritten.

## §1 🔑 THE RULE IS A PURE FUNCTION, so the DoD is asserted with VALUES, not pinned by source
`householdPatch(existingNote, { province, address })` → the `UPDATE parents` patch. The writer reads the row's CURRENT note and calls it. Every DoD case is a value assertion:
| | asserted |
|---|---|
| **PICKED** ⇒ `province` = the name, `note` ← the line | ✅ |
| **TYPED** ⇒ `note` ← the string, `province` UNTOUCHED | ✅ — 🔑 **and "untouched" is asserted as the KEY BEING ABSENT from the patch**, not as `null`: *a patch with `province: null` would CLEAR a value an admin set; that is the difference between untouched and overwritten-with-nothing* |
| …**including when `province` already held a value** | ✅ — the existing value lives in the ROW; the patch never mentions it |
| **`note` APPENDED, never overwritten** — with an existing allergy note | ✅ — and a SECOND registration appends again, in arrival order; a whitespace-only existing note gets no leading blank line |
| ข้าม / blanks | ✅ — an EMPTY patch, not an empty string into `note` |
📌 **The writer reads the ROW's note, not the `parent` argument** — the chat hands in a row it loaded at the start of the wizard, and a note a staff member wrote since must survive. Asserted at the call, and mutation F re-introduces the trust.

## §2 🔑 The CHAT changed by CONSTRUCTION — and that was the point of one writer
The chat's screen-6 string is a typed line ⇒ it goes to `address`. **One word changed at its call site** (`province:` → `address:`), the draft KEY keeps its old name (a session key, not a column), and **the chat never writes `province` — asserted by absence at the call.** *Both doors got §9 from one edit to the writer.*

## §3 ✅ `PROVINCE_UNKNOWN`, and WHERE it is refused
🔑 **In the WRITER, for every caller** — `createStudentFromLine` throws on a name not in the 77, so no door and no future caller can split the column with `กทม`. **And in the composition, as the NAMED CODE** the page needs — the same `isThaiProvince`, called before the write. *Same function twice, not two rules; both asserted.*
📌 **The 77 live in the BE** (`lib/thai-provinces.ts`, full forms, asserted 77 and distinct, with `กทม`/`กรุงเทพ`/`จังหวัดชลบุรี`/`Bangkok` asserted REFUSED) — 🔑 **the FE's dataset should pin equal to this, not the reverse; I said so in the field names.**

## §4 🚫 §9.1 — no cleanup, asserted
No script, no SQL, the journal at 35 — asserted in the test with §9.1's sentence beside it, so the next person who proposes a script meets the owner's reason first.

## §5 🔑 Mutation — six, `finally`, checksum — all bite
overwrite instead of append · a typed line CLEARS `province` · the chat writes `province` again · the writer stops refusing · the 77 loses one to an abbreviation · the writer trusts the argument instead of the row.

## §6 Pins · §17c
Two pins rewritten (`one-door-rules-task314` order list, `registration-copy-req079`'s `§17e` STORAGE pin — now pointing at the pure rule). **`§17c` by name: one of the ten diffed, `registration-copy-req079`, and it is the `§17e` province pin, not a `§17c` customer-bytes pin.**

## §7 ❓ YOUR QUESTION — *does anything READ `parents.note` and assume it is one thing?*
🔴 **Yes — ONE that matters, and it is a validator, not a display.**
1. 🔴 **`validation.ts:339` — the ADMIN form's parent write is `note: z.string().trim().max(500)`.** The machine now APPENDS addresses with no cap. ⇒ **after enough registrations the note exceeds 500 characters, and then the admin CANNOT SAVE THAT PARENT AT ALL** — the existing note fails the admin's own validator on the next edit of anything on the form. ⚠️ *A parent with three children registered by the page, plus one allergy note, is already ~180 characters; five re-registrations reach it.* 📌 **Size: one line either way — raise the validator, or cap the machine's append with a named refusal — and it is the owner's to pick which.** *I would raise the validator: the customer's data is the customer's, and a form that refuses to save what the system wrote is worse than a long note.*
2. 🟡 **`parent.service.ts:315` — the admin form OVERWRITES `note` wholesale on save** (`patch.note = input.note`). Expected — the admin sees the whole note in the textarea — **but it is a last-write-wins race with the machine:** an admin editing a parent while a registration appends an address will save their textarea's older text, and the appended address is silently gone. *Rare; named, not proposed.*
3. ✅ **Nothing PRINTS `parents.note` on a LINE message** — `line-message.ts`'s `note` is the course's attendee note, a different column. **Nothing parses, splits or truncates it in the BE.**
4. 📌 **For @Fern via you, a question not a claim:** does the parents LIST truncate the note in a table cell? If so, the address is now the last thing appended and may be the part cut off. *I cannot see the FE.*
