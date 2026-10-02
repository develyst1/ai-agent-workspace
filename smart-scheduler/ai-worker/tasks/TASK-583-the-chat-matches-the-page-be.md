# TASK-583 — ruling 4: the chat matches the page (+ F-C, + D11(a)) — BE, M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-30) · ⏸️ **Queued behind TASK-582.** Three things that all live in the chat's registration.

## §0 What the owner ruled
1. **The chat matches the page: no skip, and the SAME duplicate-name wording.**
2. **F-C: an address requires PROVINCE + DISTRICT + SUB-DISTRICT — on the form AND the chat. Province alone must not pass.**
3. **Folded in from D11: the new-phone link creates the parent AND binds the LINE at the PHONE step** — 🔑 **we make a real linked parent out of an abandoned form.** *It is the chat's shared function, which is why it is here and not in its own task.*

## §1 Build
- 🚫 **ข้าม goes from the chat.** ⚠️ **Find every shape of it, as @Fern did on the page** — a word, a button, a hint, a silent accept. 🔑 **A skip that survives in one branch makes the owner's rule optional again.**
- ✅ **ONE duplicate-name sentence, shared with the page.** 🔑 **Not "the same words typed twice" — the SAME source**, or the two will drift the first time either is edited. ⚠️ **If they cannot share a source, say why in one line.**
- ✅ **F-C on both doors, from ONE rule.** 🚫 **Not two validators that agree today.** ⚠️ **And say what happens to a household whose stored address has only a province** — *it was valid when it was collected.* 🔑 **If the honest answer is "they are asked again", say so; if it is "they are blocked from something they could do yesterday", STOP and tell me.**
- ⚠️ **D11(a): do not bind the LINE until the registration is finished.** ⚠️ **Say what "finished" means and pin it.** 🔑 **And say what happens to the rows already in that state** — 🚫 **describe the repair, run nothing.**

## §2 Not in scope
🚫 The page (done) · 🚫 the admin add-student form · 🚫 the garbled English names (not ours).

## Definition of Done
- [ ] Every ข้าม shape gone from the chat, **found by derivation** · ONE duplicate sentence from **one source** (or why not) · F-C on both doors from **one rule**, and **the legacy province-only household answered — STOP if it loses an ability** · D11(a) fixed, **"finished" defined and pinned**, the repair described and **not run** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · migration reported if any · mutations for each · report + `inbox/SA.md` + log.

---

# 🟡 REPORT — @Jason (2026-09-30): §1 (no ข้าม) and §2 (ONE duplicate sentence) BUILT · ⛔ **F-C and D11(a) STOPPED: both are CONTRACT changes that must ship with the page, so they need your ruling (proposals below)** · the legacy province-only household answered: **asked again, never blocked** · **NO migration (65)** · **3680 / 0 normally and 3× DB-unreachable (0 failed queries)** · tsc 0 · **7 / 7 mutations bite**

## §1 ✅ ข้าม: every shape, DERIVED from the two skip vocabularies' uses
- **`isSkip` (the per-FIELD words `ข้าม · ไม่ · ไม่มี · skip · - · none`) has exactly TWO callers** (pinned):
  - **the birthday parser** reads them as "no date". **Both doors now refuse "no date"**: the page already did (`BIRTHDATE_REQUIRED`); **the chat now re-asks the same prompt** (a strike);
  - **the address step** — a skip word or an empty answer ⇒ re-asked (a strike).
- 🔴 **The SILENT accept, the widest one:** `add น้องเอ` / `เพิ่มนักเรียนน้องเอ` **wrote a child from the NAME ALONE**, with no birthday and no address. **Now it writes nothing:** it enters the wizard's name step with that name and meets every guard and every required question. `addStudentAndReply` is removed.
- **The HOLE at the write:** a session started before this deploy can carry a skipped birthday or address to CONFIRM. **It is now sent back to the missing question first** (pinned: present AND in order).
- **The FLOOR:** `createStudentFromLine`, the ONE LINE-side writer both doors call, **refuses a child with no birthday** (400, before the student write and the admin notice, proven by value). No future door can go under it.
- **The HINTS:** `add_birthdate_bad` loses *"หรือพิมพ์ ข้าม / or type skip"*. The `added_more` string (*"…หรือพิมพ์ ข้าม เพื่อจบ"*) is removed with its only sender. **Pinned: no string the chat's registration shows mentions ข้าม or skip.**
- ⚖️ **Kept, deliberately:** `SKIP_WORDS` (CMD_SKIP) has ONE use, **at the NAME step to end the add-ANOTHER-child loop.** It skips no field, and **a parent with NO child still cannot use it** (TASK-307, pinned).
- ⚠️ **The re-asks have no exit HINT** (TASK-323 §16.2: the customer took it off those two screens). **The exit still works** (checked first), and two refusals bring a person.

## §2 ✅ ONE duplicate sentence, ONE source
- **The source is the chat's key `add_dup_detail`**, now holding the page's §8 wording (DRAFT): the child's **real name (first + surname)**, never a rename.
- **The page's refusal CARRIES it:** `/register/create`'s `NAME_DUPLICATE_NEEDS_DETAIL` now returns `message: { TH, EN }` = that key, byte for byte (by value through the root app).
- **This is the ONE deliberate exception to "the page owns words"** (TASK-347's contract pin, updated to say exactly that: one `message`, from that key, no `lang`).
- 📌 **@Fern:** the page should render `message[lang]` for that code instead of its own copy. Until then the two are equal by text, not by source.

## §3 ⛔ F-C STOPPED: "province + district + sub-district from ONE rule" cannot be server-side without a contract change
- **What exists:**
  - the page picks three names (FE package), **joins them into ONE line** and sends `province` (picked) + `address` (the line). A "type" mode sends a free line and no province.
  - The chat sends **one free-text answer** into `parents.note` and never writes `province`.
  - **The server has the 77 provinces (`isThaiProvince`) and NO district or sub-district data.** It can only check "the line is not empty".
  - Storage: `parents.province` + the line appended to `parents.note`. **No district or sub-district column.**
- ⇒ **One server rule needs the three parts to ARRIVE as three parts.** Today neither door sends them, so a server rule turned on alone would **refuse the page's current body**.
- **Proposal (no dependency, no migration):**
  - **ONE rule** `assertFullAddress({ province, district, subDistrict })`: three non-empty parts, province one of the 77. **Both doors call it.**
  - **The page** sends the three picked names (Fern); the "type" mode goes, or becomes three fields.
  - **The chat** asks **three short questions** (province, district, sub-district) instead of one. The province is checked against the 77, with aliases like `กทม`, which I would add to the province list. That's 2 new steps, and the copy goes to the owner as DRAFT.
  - **Storage unchanged:** `province` + the joined line in `note`. District and sub-district names are **not validated** (no data); only required.
  - **Alternative:** put the address dataset into the backend too (the FE package or similar) to validate names. **That is a new dependency, so your call.**
- 🔑 **The legacy household (address on file with a province only): ASKED AGAIN, never BLOCKED.**
  - "On file" today = `parents.province` set. **Every chat-registered household has none**, so the page already asks them for an address on their next child.
  - A page-registered one keeps "on file" under the proposal. If you want it re-asked for the missing parts, it is asked, never refused.
  - **No household loses anything it could do yesterday** (adding a child only ever requires answering), so no STOP on that criterion.

## §4 ⛔ D11(a) STOPPED: the fix changes `linkFamilyByPhone`, which BOTH doors call, and the page's contract with it
- **Today:** for a NEW phone, `linkFamilyByPhone` **creates the parent AND binds this LINE at the phone step**, from the chat's phone step and from `/register/link` alike.
- 🔑 **"Finished" defined:** **the FIRST child accepted by the writer.** The parent row, the LINE binding and that child are created **in ONE transaction**, so an abandoned form leaves nothing. (An EXISTING phone is a real family: binding to it at the phone step is linking, not registering, and stays as is.)
- **What it changes:**
  - **the page:** `/register/link` for a new phone would write nothing and answer "new", and `/register/create` would carry the phone (Fern's half, same deploy);
  - **the chat:** the phone rides the session draft. The router today refuses the add-child steps for an unbound account (`add_no_parent`), so that gate moves to the CONFIRM.
  - ⇒ **A backend-only change would break the page's current flow**, so it isn't built alone.
- **The rows already in that state** (a LINE bound to a family with 0 children: TASK-578's read-only Q-D11). **The repair, described, run by nobody:**
  - for each such parent with **no student ever** (archived included) and no booking, sale or note: **delete its `family_line_links` row(s)** (the account is free to register again), and **archive the empty parent** (its phone is kept, as every archive does).
  - **Optional:** since TASK-578's `canAddMore`, those families can simply finish from the page, so leaving them is safe.
  - The dry-run query would be Q-D11 plus a "no history" filter. Say if you want it written.

## §5 Checks
- Suite: **3680 / 0** (3672 + 8 new, `src/lib/chat-matches-page-task583.test.ts`). **DB-unreachable 3×: 3680 / 0, 0 "Failed query".** tsc 0. **65 .sql = 65 tags, no migration.** Line endings: **45 changed files, none mixed.**
- **Existing pins updated, only for this (each with its reason in the file):**
  - TASK-277 / TASK-278: the rejection no longer advertises ข้าม;
  - TASK-312 / TASK-313 / TASK-314: the inline door enters the wizard instead of writing;
  - TASK-307 / TASK-310: region ends searched after the start; screen 8 is once;
  - TASK-310 §4: the address is required;
  - AC-9: the real-name wording;
  - TASK-347's contract: one `message`;
  - AC-18: 10 `strikeOrPrompt`.
- **Mutations with `bun run mutation:run`:** baseline 70; CHECKSUM identical; every restore byte-identical:
  - **S1, ข้าม accepted at the birthday:** BITES.
  - **S2, ข้าม accepted at the address:** BITES.
  - **S3, the inline door writes a name-only child:** BITES.
  - **S4, the confirm writes a draft with a hole:** BITES. *(It SURVIVED at first: an `indexOf` of -1 passed an order check. The pin now requires each step PRESENT; re-run, it bites.)*
  - **S5, the writer's floor removed:** BITES.
  - **S6, two sources (the page's own sentence):** BITES.
  - **S7, the old wording back:** BITES.
- 📋 **COPY §17** (the chat's copy changes); the duplicate wording is still §8's DRAFT.

⛔ Only you mark this DONE. **Ball: @Sober, for the two contracts (F-C, D11(a)).**

---

# ✅ THE SKIP AND THE SENTENCE DONE — REVIEWED by @Sober (2026-09-30) · ⛔ **F-C and D11(a) ruled below**
Verified by me: **3680 / 0** · tsc 0.

## 🔴 The silent skip is the find
**`add น้องเอ` WROTE A CHILD FROM THE NAME ALONE.** ⇒ **The chat had a skip that was not a word, a button or a hint — it was a shortcut that never asked.**
🔑 **I told him "find every SHAPE of it". This was the shape nobody would have looked for, because nothing on screen offered it.** ✅ **Now it enters the wizard, old drafts with holes go back to the missing question, and THE ONE WRITER refuses a child with no birthday, by value.**
✅ **And the kept exception is right: `CMD_SKIP` ends the add-ANOTHER-child loop only — a parent with no child still cannot skip.** 🔑 *An exception that is scoped and stated is not a hole.*

## ✅ One sentence, one source
**The chat's `add_dup_detail` IS §8's wording, and the page's refusal now CARRIES it (`message: {TH, EN}`, by value).** ⇒ **Not two copies that agree today.** 📌 **@Fern renders it — carried to TASK-591.**

## ⚖️ F-C — **ruled: his proposal. 🚫 Not a backend dataset.**
**The server has no district data and neither door sends three parts, so a server rule alone would refuse the page's own body today.**
⚖️ **Build `assertFullAddress`: three non-empty parts, province in the 77.** 🔑 **The server validates the SHAPE it receives; it does not re-derive the geography.**
🚫 **A second dataset in the backend is out:** ⇒ **two datasets that can disagree, and we have just spent a fortnight on exactly that class.** 📌 **The 77 provinces are a closed, stable set we can own; districts and sub-districts are not.**
⚠️ **And the limit must be SAID, not implied: we are NOT checking that the district belongs to the province.** 🔑 **Anyone who reads "full address validated" and believes that is the next defect.** ✅ **Legacy province-only: asked again, never blocked — right.**

## ⚖️ D11(a) — **definition approved; 🚫 the repair is NOT done**
✅ **"Finished" = the first child accepted by the writer, parent + binding + child in ONE transaction.** 🔑 **A family that HAS a child is the only definition that cannot be gamed, and one transaction means there is no half state to clean up afterwards.** ✅ **An existing phone still links at once.**
⚖️ **The repair: don't.** 🔑 **Those rows are no longer harmful — `canAddMore` closed the dead end — and archiving a parent who might come back is a loss for no gain.** ✅ **He already called it optional; I am making that a decision rather than leaving it hanging.**
🔴 **Deploy coupling: it changes `linkFamilyByPhone` for BOTH doors and the page's `/register/link` and `/create` contract** ⇒ **it ships WITH @Fern's half.** 📌 **Carried to @Porter.**
