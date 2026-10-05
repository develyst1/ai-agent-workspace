# SIZING — Team A's pile for the next round — @Sober, 2026-10-05
**For @Porter.** 🚫 **No TASK numbers, no claims, nothing cut.** **Sizes: XS < ½ day · S ≈ 1 day · M ≈ 2–3 days · L ≈ a week+, each including tests and break-and-watch.** **Read from the code; no query run.**

---

## 1. 🔴 REQ-114 — the Undo chain → **S + (optional) M** · full analysis: `ANALYSIS-REQ-114-undo-chain-2026-10-05.md`
**Hand-steps for Khwan are in that file, §Q2 — separate and first, as asked.**
- **(i) the refusal names the steps — XS** (owner-approved sentence).
- **(ii) 🔴 the self-block — S, a DEFECT, no decision needed:** an Undo's own expiry restore is recorded as the ADMIN's move, so the NEXT Undo refuses as if a person had moved it. **Can strand a course half-undone even when the hand-steps are followed.**
- **(iii) Undo walks the chain in one click — M**, needs a decision (below).

## 2. 🔴 REQ-112 Q2–4 — abolish the leave counter → **M (reading A) or L+ (reading B)**
**Footprint measured today:** back **16 source files + 36 test files** touch the counter or its rule; front **16 files** — most only REPORT it.
- **Reading A — "rename, not removal":** the number stops counting leaves and keeps meaning "how many extra weeks the course is valid for". **`maxWeekFor = size + quota` and `courseExpiry` UNCHANGED.** **Work: the leave stops gating (`canTakeLeave` / locked / `adminUnlocked` vestigial), the charge on a leave goes, and every screen stops saying "x of y leaves used".** ⇒ **M.** ⚠️ **The risk is the reporting, not the rule: a screen still showing "2 of 4 leaves used" after the rule is gone is worse than none.**
- **Reading B — removal:** something NEW decides how long a course is valid. **That is a product design before it is code, and every expiry reader (the card's week label, the stretch on leave, the Undo's expiry rule, history) moves with it.** ⇒ **L, possibly more — not sizeable until the owner says what decides validity.**
- 🔑 **THE ONE QUESTION that separates them:** ***"When there is no leave counter, is a course still valid for (number of sessions + the same extra weeks as today)?"*** **Yes ⇒ A. No ⇒ B, and the owner must say what replaces it.**
- 📌 **Side-effect worth telling him:** under A, `leaveCharged` loses its subject and the "did this leave use quota?" Undo refusal disappears entirely.

## 3. Back-end copy, two items → **XS each, drafts below; the owner approves before anything ships**
📌 **Back-end refusals are Thai-only by standing decision (§T-G); the EN is for the owner's reading, not to ship.**
### 3a. `ครู{ชื่อ}` with no space — **6 sites** (`slot-clash.ts:32` · `teacher-leave.ts:58` · `camp.service.ts:284` · `scheduler.service.ts:1028 / 1030 / 1038`)
❓ **One decision:** Thai normally writes the title tight (ครูโจ); it looks wrong only before a Latin-script nickname (ครูJoe). **(a) always a space — `ครู Joe` / `ครู โจ`** · **(b) a space only before a non-Thai name.** ⭐ **Recommend (a): one rule, no helper to get wrong, and `ครู โจ` reads fine.**
### 3b. "วันนี้" said about a date the admin picked — **2 sentences**
| site | now | draft TH | EN (reading only) |
|---|---|---|---|
| `scheduler.service.ts:1030` (coach does not work that weekday) | `ครู{ชื่อ} ไม่มาสอนวันนี้` | **`ครู {ชื่อ} ไม่ได้สอนวัน{วันในสัปดาห์} — กรุณาเลือกครูอื่นหรือวันอื่น`** | *{name} doesn't teach on {weekday}s — choose another coach or day* |
| `teacher-leave.ts:58` (`TEACHER_ON_LEAVE`) | `ครู{ชื่อ} ลาวันที่ {date} — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น` | **`ครู {ชื่อ} ลาวันที่ {date} — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น`** | *{name} is on leave on {date} — can't add a class with them that day; choose another coach or day* |
🔑 **Why the first names the WEEKDAY:** the rule is the coach's working days, so the weekday is the real cause; "today" was never it. *(Drafts assume 3a = (a).)*

## 4. 🔴 The migration LEDGER root cause → **S to find, fix XS–S once found**
**Facts from the code:** our ledger is its own table (`drizzle.__drizzle_migrations_scheduling`; backoffice writes `__drizzle_migrations_bo`) ⇒ **the old shared-table cause (TASK-085) is NOT it.** **drizzle applies by comparing ONE row's `created_at`, never by hash** ⇒ **any surplus row dated AFTER an unapplied migration makes drizzle skip it silently.**
**Two candidate writers, both readable in code — 🚫 not concluded:**
- **(a) Line endings.** **The ledger hash is sha256 of the `.sql` TEXT, and this repo checks out CRLF on Windows (`core.autocrlf=true`).** **`db:seed-ledger` dedups by HASH ONLY** ⇒ **a CRLF hash and an LF hash of the same migration are two different rows with the same date** — re-running the seed from a different machine adds a duplicate set. **~113 ≈ 65 + a partial second set fits that shape.**
- **(b) Out-of-band schema writes** (`db:push` exists in `package.json`, or a hand-applied migration) leaving the schema ahead of the ledger, then seeded rows dated beyond migrations that never ran.
▶️ **Deciding between them takes ONE read-only query the OWNER runs on sid** (per migration date: how many ledger rows, how many distinct hashes). **I will write it when this is released; 🚫 not asked for now.** 📌 **If (a): the fix is to hash normalised text in OUR scripts and pin `drizzle/*.sql` to LF — ⚠️ a `.gitattributes` line scoped to that folder is an OWNER decision (we refused a repo-wide one before).**

## 5. Tooling, three
- **`TASK-653` — move the leave dialog's pins next to the dialog — XS–S, @Fern.** Test-only; no behaviour. **Unfreezes `teacher-scope.test.ts`.**
- **`TASK-639` — region-pin helper that REFUSES on a missing anchor + the pass over Jason's own files — S–M, @Jason.** **The helper is the deliverable.** Anything in another claim is LISTED, not fixed.
- **`TASK-652` — teacher-scope checked first for linked accounts, every route — M, @Jason.** ⚠️ **It reverses a DELIBERATE order (TASK-406) across every route; the risk is breadth, not difficulty — every route's refusal for a linked account changes from a generic `FORBIDDEN` to the scope sentence.** **Still fails closed with 403.**

---

## ▶️ Proposed ORDER
1. **REQ-114 (ii) — the self-block.** A live defect on uat, no decision needed, small. **Plus (i) the sentence, once approved.**
2. **The ledger root cause** — every deploy is exposed to it; the investigation is cheap; it needs one owner-run read.
3. **Copy 3a + 3b** — the moment the owner approves; XS.
4. **`TASK-653` then `TASK-639`** — cheap, they unfreeze files and harden every later pin. **Can run beside 1–3** (different engineers, different files).
5. **REQ-114 (iii)** — after the owner's decision.
6. **`TASK-652`** — broad, low urgency (no screen reaches it).
7. **REQ-112** — last: largest, and its one question decides its size. **And (iii) should be built so it does not lean on the counter REQ-112 may remove.**

## 🔴 OWNER DECISIONS — before a line can be written
1. **REQ-112:** *"With no leave counter, is a course still valid for sessions + the same extra weeks as today?"* — **the ONE question; it decides M vs L+.** *(Q3 "notify whenever a make-up crosses the expiry, or only when the search runs out" and Q4 "does a course end at its expiry with sessions unused" are still his too — but they do not change the size, so they can come with the design, not before it.)*
2. **REQ-114 (iii):** when Undo unwinds a chain, is the chained leave simply DROPPED (its week stops being a class)? ⭐ **Recommend: yes.**
3. **REQ-114 (i) + copy 3b:** approve the sentences (3b drafted above; (i) I draft once he wants it).
4. **Copy 3a:** a space after ครู always, or only before a non-Thai name. ⭐ **Recommend: always.**
5. **Ledger, only if the read shows line endings:** pin `drizzle/*.sql` to LF with a `.gitattributes` line scoped to that ONE folder.
**No decision needed:** REQ-114 (ii) · `TASK-653` · `TASK-639` · `TASK-652` (he took it with the list).

---

## ➕ 2026-10-06 — REQ-112 RE-SIZED against `REQ-112 §11` (Khwan's model), not the "rename only" sentence
🔴 **NEW NUMBER: L (about a week+), UP from M.** **The rename half is still M; the half Porter's correction restored — every leave adds a week, and a make-up past the expiry goes to the admin — is a BEHAVIOUR change on the leave path, the plan engine and the Undo.** 🚫 **The removal branch (old "B") is gone and not sized further.**

**What the code does TODAY, so the delta is exact:**
- **Base:** `maxWeekFor(size, quota) = size + quota` ⇒ 4⇒5 · 6⇒8 · 10⇒13 — **her table, unchanged.**
- **Mid-course leave:** **the expiry moves only when the make-up the engine finds lands PAST it** (`reconcileCoursePlan` stretches to the make-up's date, TASK-308). **The first `quota` leaves' make-ups fit inside the base, so they add NOTHING.** **Past the quota the leave is LOCKED.**
- **Pre-start declared absence:** +1 week each (`courseBornCeiling`, TASK-646) — **already her rule.**
- **Make-up far out:** `makeup_far_out` fires when the SEARCH is exhausted, not when the expiry is crossed.
- **Expired with sessions unused:** `EXPIRED` is already a derived course status (`course-status.ts`) — **her "ที่เป็นอยู่ตอนนี้" is today's behaviour.**

| §11 part | change | size |
|---|---|---|
| 1. base table | none | — |
| 2. 🔴 **every leave +1 week** | **ONE helper ("a leave adds a week") called on EVERY leave door** — parent, admin, coach's own, admin-recorded coach leave, and **REQ-112 A's school cancel (same lever)** · **the engine's stretch-to-fit becomes the backstop, not the rule** · **the counter stops gating (no `locked`) and stops being shown as "x of y"** · `leaveCharged` loses its subject | **M** |
| 2b. **the Undo's expiry rule** | `expiryDecision` is built on "the system stretched to the make-up's date"; under +1 week per leave it becomes **"−1 week, if the week is still unused"** — simpler, but a rewrite, and it **absorbs REQ-114 (ii)** | **S** |
| 3. **make-up past the expiry ⇒ warn the ADMIN** | a NEW trigger on crossing the expiry (beside, not instead of, the exhaustion notice) + one new sentence | **S** |
| 4. expired box | verify only | **XS** |
| reporting | every screen/LINE line that says "leaves left / used" (16 front files, most report only) | **inside 2's M** |
⇒ **M + S + S + XS ≈ L.**

### 🔴 Owner decisions this re-size surfaces — none changes the size, all change what is built
1. **EXISTING courses: forward-only, or recompute their expiry as base + leaves taken?** ⚠️ **Recompute changes dates Khwan's team has already seen (the week-label lesson again) and is a data step on uat.** ⭐ **Recommend FORWARD-ONLY** — her team already moves expiries by hand, and nothing live moves silently.
2. **Does undoing a leave take its week back?** **Today's ruling for declared days is NO (a make-up may sit in that week).** ⭐ **Recommend: back ONLY if that week is still empty** — otherwise the expiry only ever grows and an undone leave keeps a free week. *(If he prefers one rule with no condition: NO, as today.)*
3. **A make-up that lands past the expiry: CREATE it and flag the admin, or hold it for the admin to place?** ⭐ **Recommend CREATE + flag** — her own §11.4: "เรียนได้ ตารางยังอยู่", nothing is lost while the admin decides.
4. **Which leaves add a week — all of them?** (parent · admin · coach's own cancel · admin-recorded coach leave · school cancel). ⭐ **Recommend ALL** — one lever, as §11 says.
📌 **Ordering consequence:** REQ-114 (ii) can still go first as a small, standalone fix; **REQ-114 (iii) and 2b should be built TOGETHER with REQ-112**, or (iii) is written against a rule that is about to change.
