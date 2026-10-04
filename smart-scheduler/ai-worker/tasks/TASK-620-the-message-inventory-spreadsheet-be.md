# TASK-620 — the notification-message inventory for Fern — BE, S (a document, no product change)
- Source: REQ-111 item A · rulings REQ-111 §6.4–6.5 · sizing `SIZING-REQ-111-teamB-2026-10-02.md` §A
- Status: DONE
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-02)
- Depends on: none

## §0 What this is
The customer's brand person (Fern) wants the list of every message the system sends, so that she can revise the wording.
🔴 **This task produces a list. It does NOT change any message.** It is READ-ONLY on `line-i18n.ts`, `line-message.ts` and `line-message-fields.ts`. Team A holds the write on all copy this batch.
⇒ **If you find yourself editing a string, stop.** Even a typo or a missing EN goes in your notes, not into the code.

## What to do
1. **Write one script, `scripts/inventory-line-messages.ts`.** It is a new file and touches nothing else.
   - It walks **the same structures the bot uses**, so the list cannot drift from the code:
     - `allChatStrings()` (`src/lib/line-i18n.ts:774`)
     - `TEMPLATE_FIELDS` (`line-message-fields.ts:104`), `TYPE_OMITS` (`:132`), `TEMPLATE_NONE` (`:47`)
     - every kind in `formatOutboxMessage` (`line-message.ts:143`), rendered for real (see 2).
   - **Never hand-copy a string into the script.** A copied string is a second copy that rots.
2. **Sheet 1, `push` — what the system sends by itself.** One row per notification kind × audience. Columns:
   `#` · `audience` (parent / teacher / admin) · `when it is sent` (one plain-English line, written by you from the code) · `kind` · `TH message` · `EN message` · `fields, in order` · `empty-field rule` · `Fern's revision` (**left empty**) · `flag`.
   - `TH message` and `EN message` are the **real output** of `formatOutboxMessage(payload, ctx, lang, recipientType)` for a **fake** payload.
3. **Sheet 2, `replies` — the bot's chat answers.**
   - One row per dictionary key that is not used by sheet 1, plus the 20 `REGISTRATION_COPY` screens.
   - Columns: `#` · `key` · `TH` · `EN` · `Fern's revision` (empty) · `flag`.
4. **Flagged rows. Do not hide these. Each one is its own row with the `flag` filled:**
   - `HARD-CODED`: wording outside the dictionary. Known cases are `leave-notice.ts:45-50` and the class-line formats in `line-v2-lines.ts`. Grep for any others.
   - `NO WORDING YET`: the 6 kinds that fall back to `ob_default` (`student_registered` and the four `*_asked_for_admin` kinds). The code says "BLOCKED ON COPY".
   - `NO EN`: a dictionary entry with an empty EN.
5. 🔴 **Privacy (owner's condition): no customer names, no phone numbers and no ids.**
   - Every sample value is invented and obviously fake, e.g. `Student A`, `Coach B`, `2026-10-15`, `10:00`.
   - **The script must not read the database.** Fixtures only.
6. **Output: two CSV files**, UTF-8 **with BOM** so Excel opens Thai correctly.
   - Write them to `smart-scheduler/project-docs/req111-message-inventory/` in the **workspace**: `push.csv` and `replies.csv`.
   - 📌 **Do not add a spreadsheet dependency to the product repo.** I will combine the two CSVs into the one workbook at review.

## Definition of Done
- [ ] `bun run scripts/inventory-line-messages.ts` produces both CSVs; the command is in your notes.
- [ ] Row counts are in your notes: push rows, reply rows, and the number of each flag. The sizing expected about 37 push kinds and about 170 reply strings; explain any large difference.
- [ ] Every one of the ~31 `formatOutboxMessage` kinds appears in `push.csv`, in both TH and EN, or is flagged. **Name any kind you could not render, and why.**
- [ ] A `grep` of both CSVs for `0` + 9 digits (a phone number) and for a UUID pattern finds **nothing**; the commands and their output are in your notes.
- [ ] `git diff --stat` in the back repo shows **only** the new script; `line-*.ts` are unchanged.
- [ ] Nothing is committed (git is the owner's).

## Implementation Notes
**Bob, 2026-10-02 — submitted together with TASK-607.**

**Built:** `scripts/inventory-line-messages.ts` (new; the only change in the back repo for this TASK). The `line-*.ts` files are untouched: `git diff -- 'src/lib/line-*.ts'` → 0 lines.

**Command:**
```
bun run scripts/inventory-line-messages.ts <workspace>/smart-scheduler/project-docs/req111-message-inventory
```
- It writes `push.csv` (22,950 B) and `replies.csv` (26,476 B). Both are UTF-8 with BOM (`EF BB BF` checked) and CRLF rows.
- **Declared:** the output folder is an **argument**, so no workspace path is baked into a product-repo file.

**Safety:**
- Before any import, the script deletes `DATABASE_URL` / `LINE_CHANNEL_*` and points the DB at a dead local port. It imports only pure renderers and no route or app.
- It ran to completion with no DB and no LINE (the `.env` on this machine holds uat values, and nothing read them).
- Every sample value is invented: `Student A`, `Coach B`, `Private FREESKATE`, `Event C`, `Camp Week 1`, dates 2026-10-15/22/29.

**How it stays tied to the code (nothing hand-copied):**
- **push:** every message is the real `formatOutboxMessage(payload, ctx, lang, audience)` output, in TH and EN. An `admin` row renders as `parent`, which is the worker's own rule in `outbox.service.ts`.
  - `fields, in order` is parsed from the rendered EN text, so appended lines like `Remark`/`Reason`/`Was` are included.
  - `empty-field rule` is built from `TEMPLATE_FIELDS` · `TYPE_OMITS` · `TEMPLATE_NONE`.
- 🔑 **Drift guard:** the script parses every `case "…":` in `buildOutboxMessage` and **throws** if one is missing from its list. A kind added next month fails the run instead of quietly missing from Fern's sheet.
- **replies:**
  - Rows come from `allChatStrings()`, minus keys already shown in sheet 1. "Already shown" is decided **from the output**: every literal piece of the key's text, split at `{vars}`, appears in a rendered push message. No hand-kept list of which keys the notifications use.
  - The registration screens appear once each; they are bilingual in one text.

**Declared (internal):**
- `KINDS` is the one hand-written part: per kind, the audiences, the fixture and a plain "when it is sent" line. I wrote those from the producers (scheduler / jobs / camp / other-series / rental / undo / teacher-link / attention / line-register / line-webhook services).
- **Variant rows**, where a payload changes the TITLE, so Fern sees each title: `course_deduction (voucher)`, `course_dropped_teacher (ended)`, and `camp_reminder (coach)` / `(family)`, which have two different bodies.
- Rows follow the `KINDS` order: confirmations → deductions → leave/cancel/move → series → scheduled jobs → admin → dead → no-wording.

**Counts:**

| | |
|---|---|
| **push** | **41 rows / 34 kinds** = 29 renderer `case`s + 5 kinds that fall to the default |
| **replies** | **169 rows** = 117 dictionary keys not already shown in push + 20 registration screens + 32 HARD-CODED |
| `NO WORDING YET` | 5 |
| `NO PRODUCER` | 3 |
| `HARD-CODED` | 32 |
| `NO EN` | **0** |

- **Push vs the sizing's ~37:** 34 kinds are within range. The row count is higher because a kind sent to two audiences gets one row per audience (×2: booking_confirmed, course_confirmed, leave_notice, daily_reminder), plus the 4 variant rows.
- **Replies vs the sizing's ~170:** 169, on target.
- **Every one of the 29 renderer kinds is in push.csv in TH and EN;** `unrendered: []`. No kind failed to render.
- **NO WORDING YET is 5, not 6:** `student_registered` + `parent_` / `teacher_` / `admin_` / `unlinked_asked_for_admin`. The TASK text says "6" but names five. I found no sixth producer kind without a `case` (grep of every `kind: "…"` in `src`).
- **NO PRODUCER (my own flag, beside the requested three):** `reschedule_requested`, `sick_leave`, `leave_teacher`. The renderer has them but nothing sends them (the code's own "DEAD branch" notes). They are listed so Fern does not revise copy no one receives.
- **NO EN = 0:** every dictionary entry has an EN. The registration screens are bilingual inside one string, so they are not flagged.

**HARD-CODED, how found:**
- A scan of the files that BUILD messages: `line-message.ts` and `line-message-fields.ts`, everything `line-message.ts` imports from `./`, everything the two chat services import from `../lib/`, and those two services.
- A literal counts when it holds Thai, an English phrase, or a template literal whose own text has a capitalised word and no code shape.
- **9 files skipped, each with its reason printed by the script:**
  - words a user TYPES: `line-commands`, `line-add-student`, `line-webhook`;
  - web-app API errors: `http`;
  - staff-web approval refusals: `teacher-link`;
  - address data: `full-address`;
  - transport/logs: `line-client`, `line-log`, `family-link`.
- The 32 hits include:
  - the two known sites: `leave-notice.ts:48-49` and `line-v2-lines.ts:25,35`;
  - the camp balance notice: `camp-deduction.ts`, all 4 lines;
  - the weekly digest header and intro: `weekly-digest.ts:73-75`;
  - camp roster `Full · AM · PM`: `line-message.ts:475`;
  - program suffixes `HR` / `1st Trial`: `line-message-fields.ts`;
  - rental words: `rental-row.ts`;
  - the rich-menu bar `เมนู` / `เมนู | Menu`;
  - digest item labels: `attention.ts`;
  - two stored Thai notes that print as a `Reason`: `พักคอร์สชั่วคราว`, `แจ้งลาผ่าน LINE`.
- ⚠️ **Known limits of the heuristic:**
  - `attention.ts:271-272` (`course 6 · <date>`, `voucher 10h · <date>`, digest labels) is lowercase-only, so it is **not** flagged.
  - The punctuation-only class-line shapes in `line-v2-lines.ts:29,32` have no words to revise.

**Privacy grep (DoD):**
- `grep -aEn '0[0-9]{9}' push.csv replies.csv` → **1 hit**: `replies.csv:90`, `verify_parent_badphone`, *"(เช่น 0812345678)" / "(e.g. 0812345678)"*. That is **the dictionary's own example number inside the message**, not a customer's. I did not mask it, because the CSV must show what the parent reads. See Question 1.
- `grep -aEin '<uuid pattern>' push.csv replies.csv` → **nothing** (exit 1).
- The only id in any fixture is `"x"` (a digest item id). It is never rendered.

**Typecheck:**
- `bunx --package typescript@5.6.3 tsc --noEmit` → exit 0. `scripts/` is not in tsconfig's `include`.
- So the script was also checked alone with `--strict --types bun`: exit 0.

**What surprised me:**
1. `booking_confirmed`'s title is `📅CONFIRMED SCHEDULE:` in **both** languages, while most stamps have a Thai TH version (e.g. `❌ ยกเลิกคาบเรียน:`). Fern may want to know which titles are English by the customer's own choice.
2. The four `*_asked_for_admin` alerts and `student_registered` all print the same generic `🔔 แจ้งเตือนจากระบบตารางเรียน`. An admin cannot tell a parent asking for help from a new registration. That is already parked as "BLOCKED ON COPY", and this sheet is the natural place to get the words.

## Questions
(Bob asks; Silver answers as `> answer: ...`.)
- You decide the internal details yourself and declare them here: fixture shapes, script structure, row ordering.
- **Ask only** about things Fern or the owner would see: the column set, or something that looks wrong in the wording itself.
- **Q1 (Bob, 2026-10-02) — the phone-grep hit.**
  - `verify_parent_badphone` contains the example number `0812345678` in both languages. It is product copy, not customer data, so I left it as the parent reads it.
  - The DoD says the grep must find nothing. Keep it (my recommendation: it is the real message, and Fern may well want to revise that example), or should the CSV mask it?
  - Either way the code is untouched, and nothing else is held on this.
  > answer (Silver): **Keep it.** The owner's condition is about CUSTOMER data. `0812345678` is the product's own example inside the message the parent reads, and Fern may want to revise it. I am naming it to @Porter in the hand-off, so the owner sees it knowingly rather than discovering it.

## Review
**Silver, 2026-10-02 — ✅ DONE.**
- **Re-run by me** into my scratchpad: the same command produced `push.csv` and `replies.csv`, **byte-identical** to the delivered files (`cmp`).
  - The summary reads `unrendered: []` · HARD-CODED 32 · NO WORDING YET 5 · NO PRODUCER 3.
- **Back repo:** the only change is the new script (`git status`). `line-*.ts` are untouched.
- **Privacy:** the UUID grep finds 0. The phone grep finds 1, which is the dictionary's own example number; see Q1.
  - Every sample is invented (`Student A`, `Coach B`).
- **Quality:** the messages are the real renderer output, and the drift guard throws on an unlisted `case`.
  - The extra `NO PRODUCER` flag and the 5-not-6 correction are both right. My TASK text said 6 but named 5, and that was my slip.
- **Workbook built at review (as the TASK said):** `project-docs/req111-message-inventory/REQ-111-message-inventory-DRAFT-for-owner-review.xlsx`.
  - Two sheets: `Notifications (push)` (41 rows) and `Chat replies` (169 rows).
  - Header frozen, filters on, wrapped text, and the `Fern's revision` column shaded.
  - Read back and checked: 41 + 169 rows, the same as the CSVs.
- **It goes to @Porter → owner review → only then Fern.**
- 📌 Bob's two "surprises" (the English-only CONFIRMED title, and five alerts sharing one generic line) go to Porter with the hand-off, as notes for the owner.
