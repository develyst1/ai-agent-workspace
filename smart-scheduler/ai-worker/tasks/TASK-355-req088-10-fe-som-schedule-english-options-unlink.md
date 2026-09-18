# TASK-355 — `REQ-088 §10` front end: `SOM SCHEDULE`, English options in EN, and the linked-account warning with UNLINK

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-14)
▶️ **OWNER, from the page LIVE on `uat`** (his LIFF header reads `frontoffice.develyst.online`). **Size S.**
🚫 No migration, no stored-value change. ⏱️ **One deploy to `sid` with @Jason's half; he tests once.** **`§10.1`
and `§10.2` need no API — start there; `§10.3` when TASK-354's contract lands.** ⛔ **Chain stopped — `§10`.**

---

## §10.1 — the page title is `SOM SCHEDULE` · XS
**The LIFF header shows the document title; today it says `Smart Scheduler` (the root `layout.tsx`).** ✅ **The
`/register` page — and the LIFF header with it — reads `SOM SCHEDULE`, his spelling, upper case.** 📌 *Page-level
`metadata`, the app's name elsewhere untouched.* ⚠️ **Say whether `/checkin` should follow — do not change it;
name it.**

## §10.2 — in EN mode the address DROPDOWN OPTIONS are English · S
> *"ตัวเลือก จังหวัด อำเภอ ตำบล ตอนนี้ข้างใน dropdown เป็นภาษาไทย แม้จะเปลี่ยนภาษาเป็นภาษาอังกฤษ"*
🔻 **REVERSES TASK-351's *"values stay Thai"* — for the three address tiers, DISPLAY ONLY.**
✅ **I confirmed the cost before cutting: the dataset ALREADY carries English names (`nameEn`, loaded with the
Thai — your TASK-349 bytes included them).** ⇒ **no new data, no new bytes. A display switch on the same
GEOCODE-keyed row.**
🔴 **WHAT IS STORED DOES NOT CHANGE — and this is the line that matters:** `province` keeps the Thai full name
(*the `§9.1` repair path depends on the admin list's spelling*); `note` keeps the Thai line; **the join reads
`nameTh` regardless of `lang`.** ⇒ **EN shows `Bangkok · Watthana · Phra Khanong Nuea` in the lists and STORES
`กรุงเทพมหานคร` + `พระโขนงเหนือ วัฒนา กทม`.** ✅ **Asserted: the option LABELS follow `lang`; the option VALUES
(geocodes) and the two SENT strings do not.** 🔑 **The confirm screen shows the LINE — Thai — in both modes:
*it shows what will be stored.* Say so in the copy if it needs saying.**
🔴 **TASK-351's `not.toContain("nameEn")` and its *"values are `nameTh`, never `nameEn`"* are now wrong BY
REQUIREMENT for the option labels — rewrite with the reversal inside, the right half kept (the JOIN and the
SEND are still `nameTh`), the way you did on TASK-351.**

## §10.3 — a linked account is TOLD, with an UNLINK button · S · **after TASK-354's contract**
> *"แก้ให้เป็นเตือนว่าคุณลิ้งแล้วนะ จะปลดลิ้งค์มั้ย ถ้าจะปลดก็กดปุ่มนี้ๆ ได้"*
🔑 **The owner found ITEM 12 by using the page** — *a linked account entering another phone was silent.*
**On open — after the token, before the phone field — call `status`.** `linked: true` ⇒ a screen: *"This LINE
account is already linked to (phone 0xx-xxx-xxxx). Unlink?"* — **the masked phone from the server, an UNLINK
button, and a way to close.** **Unlink ⇒ `POST /register/unlink` ⇒ then the normal flow (phone → found/new).**
`linked: false` ⇒ straight to the phone field, as today.
🚫 **The page renders the masked phone the server sends; it never masks, never holds the full number.**
🚫 **No names on that screen — TASK-047.** ✅ **Both languages — the strings are @Porter's, PLACEHOLDER by
rule.** 🔑 **The UNLINK button is a destructive act on a phone: make it look like one, and make the close path
obvious** — *a parent who opened the link by accident must not unlink by accident.*
🚫 **The page holds no rule about what "linked" means — the server says.** Rule 1, asserted.

## What must not change
- 🚫 What is STORED — `province` Thai full name, `note` Thai line · the join · the `§9.1` repair path.
- 🚫 `api.ts` gains two calls and no rule · the LIFF credential module · the toggle's one-thing rule.

## Definition of Done
- [ ] Suite passes, **state the count** · typecheck clean · build ok
- [ ] **`/register`'s document title is `SOM SCHEDULE`** — asserted; `/checkin` named, untouched
- [ ] 🔑 **EN mode: option LABELS English; option VALUES (geocodes), the JOIN and the two SENT strings unchanged
      and Thai** — asserted, all of it
- [ ] 🔴 **TASK-351's `nameEn` assertions REWRITTEN with the reversal inside, the right half kept**
- [ ] **`linked: true` ⇒ the warning with the server's masked phone and an UNLINK; `linked: false` ⇒ the phone
      field** — asserted both
- [ ] **UNLINK ⇒ `unlink` ⇒ the normal flow** — asserted; **the page never holds the full phone** — asserted
- [ ] **Every new string PLACEHOLDER, both languages, listed**
- [ ] 🔑 **Break it and watch** — one call, CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **`§10.2` is the second time in three days a "stay Thai" ruling was reversed by the owner's screen — labels on
TASK-351, values now.** ⇒ ❓ **Is there a rule that predicts which Thai the owner will want switched and which
he will not — or is the honest answer that only the screen decides?** 📌 *My guess: anything a parent must
CHOOSE between follows the language; anything that merely IDENTIFIES stays as stored.* 🚫 **Test that against
the page. Build nothing.**

---

## §11 ✅ IMPLEMENTED — Fern, 2026-09-14. **All three of `§10`, against the live `status` / `unlink` route. Nothing stored changes.**

```
bunx tsc --noEmit → exit 0
bun test          →  327 pass / 0 fail   (was 321; +6)
bun run build     → ok — `○ /register` static; the prerendered HTML carries <title>SOM SCHEDULE</title>,
                    /checkin's still <title>Smart Scheduler</title>
git status        →  6 modified (register/page.tsx · RegisterContent.tsx · dictionaries.ts · api.ts · entry.ts ·
                     register-page.test.ts)
```
🚫 No migration · no stored-value change · the join, the send, the `§9.1` repair path, the LIFF credential module,
the toggle's one-thing rule — untouched. `api.ts` gained two calls (`status`, `unlink`) and no rule.

### `§10.1` — `SOM SCHEDULE` · XS
`register/page.tsx`: `export const metadata: Metadata = { title: "SOM SCHEDULE" }` — page-level; the root layout's
`Smart Scheduler` is untouched and every other route still carries it. Asserted on the source, and confirmed in the
build's prerendered HTML (`<title>` above). **`/checkin` — my reading: it SHOULD follow.** It is the other page a
parent opens from LINE, its tab/header shows the same product name today, and the owner's reason (*the LIFF header
shows the document title*) is the same reason there. 🚫 Not changed — named, as asked.

### `§10.2` — English OPTIONS in EN mode · DISPLAY only, and asserted as such
- `AreaPick` gained `nameEn`; `uniqueByCode` keeps it off the same dataset row (the English chunk was already loaded
  — TASK-349's bytes, no new bytes). ✅ Asserted `nameEn: r.nameEn` in `entry.ts`.
- The page: `asOptions` ⇒ `label: lang === "th" ? r.nameTh : r.nameEn`; **`value` is the GEOCODE either way.** What
  is picked is the row; **`pickedProvince` reads `nameTh`, the join reads `nameTh`, the confirm line is
  `addressLine`** — all three asserted, and `nameEn` is asserted to occur on the page **exactly once** (the label).
  `entry.ts`'s join region asserted free of `nameEn` and `lang`. ⇒ EN shows `Bangkok · Watthana · Phra Khanong
  Nuea` and stores `กรุงเทพมหานคร` + `พระโขนงเหนือ วัฒนา กทม`.
- **The confirm screen shows the LINE, Thai, in both modes** — asserted (`nameEn` and `lang` absent from that
  region). *Copy: I did not add a sentence saying "this is how it will be stored" — the confirm heading already says
  "check before saving"; if the owner wants it spelled out, it is one PLACEHOLDER key.*
- 🔴 **TASK-351's `nameEn` assertions REWRITTEN, not deleted:** the test *"§8b — VALUES stay Thai in both languages"*
  is now *"§8b (reversed by TASK-355 §10.2) — option LABELS follow the language; the JOIN and the SEND stay
  `nameTh`"*, with the owner's sentence and the reason in the comment; the right half (join + send + confirm) is
  kept in the same test. TASK-350's `lang`-count pin moved 3 → **4, the fourth named** (the option label), rule
  restated. ✅ Mutation 2 — the JOIN following the language — fails **four** tests.

### `§10.3` — TOLD, with UNLINK · against the live route
- **On open, after the token:** `status(idToken)` — one call, before the phone field. `linked: true` ⇒ phase
  `already-linked` with **the server's masked phone and the count, as sent**; `linked: false` ⇒ the phone field as
  today; a refusal ⇒ the alert and the phone field. ✅ Asserted; **Rule 1: the page branches on `st.linked` and on
  nothing else** — no length check, no id — asserted. *(That one call goes without `withToken`'s retry: a token
  obtained that instant cannot be `TOKEN_EXPIRED`; every later call keeps the wrapper.)*
- 🚫 **The page never masks and never holds a full number** — asserted by absence on page and `api.ts` (no
  `replace(/\d`, no `maskPhone`, no `x{3}`, no `slice(0, 2)`); mutation 3 (the page masking) fails. `StatusResult`
  carries `phone` + `childCount` only — `name`/`children`/`nickname`/`parentId` asserted absent from the type; the
  screen renders no `ChildList` and no `.name`. **A count, no names — TASK-047.**
- 🔑 **UNLINK is a destructive act and looks like one, in two taps:** the plain close path (`closeHint`) sits ABOVE
  it; the first tap is a red OUTLINE button; the second shows a red `Alert` with the family-wide warning, a red
  filled **"Yes, unlink the family"**, and a plain **"Keep the link"**. Order and both taps asserted; mutation 4
  (one-tap unlink) fails. Unlink ⇒ `withToken(unlink)` ⇒ the phone field with an "Unlinked — enter a phone to link
  again" notice — **whether `unlinked` was `true` or `false`** (idempotent, the page does not branch on it; asserted).
- 🔴 **THE CONSEQUENCE, in the copy:** the button reads **"Unlink this family's LINE connection"** /
  **"ปลดการเชื่อมต่อ LINE ของครอบครัวนี้"**; the warning: *"This removes the LINE connection for the WHOLE family — if
  another parent linked their LINE account too, theirs is removed as well. You can link again afterwards."* /
  *"จะยกเลิกการเชื่อมต่อ LINE ของทั้งครอบครัว — ถ้าผู้ปกครองอีกท่านผูก LINE ไว้ด้วย จะถูกปลดไปพร้อมกันค่ะ …"*. Asserted
  (`family` / `ครอบครัว` on the button; `whole family|another parent` / `ทั้งครอบครัว` + `อีกท่าน` in the warning);
  mutation 5 ("Unlink my phone") fails. `childCount` is used for the recognition line: *"Linked to 08x-xxx-xxxx (3
  children)"*.

### 📝 New strings — 7 keys × 2, ALL PLACEHOLDER, tagged at their lines
`alreadyLinkedTitle` · `alreadyLinkedTo` (`{phone}`, `{n}`) · `unlinkButton` · `unlinkWarning` · `unlinkConfirm` ·
`unlinkCancel` · `unlinkedNotice`. The WORDS are @Porter's to write; **the MEANING of the three unlink strings is
the writer's** (family-wide) and is pinned. `closeHint` reused (borrowed from `/checkin`). No `§17c` text touched.

### 🔑 Break-and-watch — five mutations, one call, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the title back to `Smart Scheduler` | **1 fail** |
| 2 | the JOIN follows the language (English stored) | **4 fail** |
| 3 | the page masks the phone itself | **1 fail** |
| 4 | UNLINK on one tap (the confirm step removed) | **1 fail** |
| 5 | the button says "Unlink my phone" | **1 fail** |
`md5sum` identical on the three mutated files; suite green after.

### Definition of Done
- [x] Suite **327 / 0** · `tsc` exit 0 · build ok
- [x] `/register`'s title is `SOM SCHEDULE` — asserted (source + built HTML); `/checkin` named, untouched
- [x] 🔑 EN: option LABELS English; VALUES (geocodes), the JOIN and the two SENT strings unchanged and Thai — asserted
- [x] 🔴 TASK-351's `nameEn` assertions REWRITTEN with the reversal inside, the right half kept
- [x] `linked: true` ⇒ the warning with the server's masked phone + UNLINK; `linked: false` ⇒ the phone field — asserted
- [x] UNLINK ⇒ `unlink` ⇒ the normal flow — asserted; the page never holds the full phone — asserted
- [x] Every new string PLACEHOLDER, both languages, listed — 7 × 2
- [x] 🔑 Break-and-watch — five, one call, checksum

### ⚠️ Not seen on a screen
The red outline → red filled two-step inside LIFF, the `Alert` wrapping on a narrow phone, and the English option
names as the dataset spells them (they are romanisations — `Khnong Tan Enue` for คลองตันเหนือ was what I saw in the
raw rows on TASK-349; some are rough). For the owner's one test: EN mode → the three lists in English → confirm
shows the Thai line → saved Thai; a linked account → the warning with `08x-xxx-xxxx (n children)` → Unlink is two
taps → the phone field. ⚠️ **One thing to say before he tests:** if the dataset's English spellings look wrong on
his screen, that is the dataset's romanisation, not a mapping error — a different dataset or a fix-up table would
be a task.

## Question — **is there a rule that predicts which Thai gets switched — or does only the screen decide?** ⚠️ owner's list, nothing built
**Your guess holds on every rendered string on `/register`, and it flags the one known anomaly. Tested:**
| string | what it is | rule says | what the owner ruled / what stands |
|---|---|---|---|
| tier labels เขต/อำเภอ… | the frame of a CHOICE | follows `lang` | reversed to follow — TASK-351 ✓ |
| dropdown options | the CHOICES | follows `lang` | reversed to follow — this task ✓ |
| month names in the date picker | choices | follows `lang` | already did ✓ |
| the confirm line `… กทม` | IDENTIFIES what is stored | as stored | kept Thai, both modes ✓ |
| child names on found/linked | identify | as stored | never questioned ✓ |
| the masked phone, the `DD-MM-YYYY` echo, the `done` name | identify | as stored / as sent | ✓ |
| the typed-mode EN instruction's example `Prakanueng Nuea…` | a LABEL whose example is a VALUE | the value half should be as stored (Thai) | 🔻 the anomaly TASK-351 found — the rule predicts it |
**0 exceptions on the page.** So the honest answer is two sentences: **the rule — *what a parent must CHOOSE
between follows the language; what merely IDENTIFIES stays as stored* — is a good DEFAULT, and it would have
predicted both reversals had it been applied first.** But *"values stay Thai"* also sounded like a rule, and it was
wrong once at the label and once at the option — **so the rule is the default and the screen is the test, in that
order; neither replaces the other.** 📌 One consequence worth writing down as the rule's own edge: *when a CHOICE's
label and its stored VALUE are the same string (a province name), the screen shows the chosen language and stores
the Thai — two forms of one thing, on purpose, which is exactly what `§9` and `§10.2` now do.* 🚫 Named, nothing built.
