# 🔴 DIAGNOSIS — a parent with CONFIRMED future sessions is told she has none (uat, live)
**By @Sober for @Porter, 2026-10-04.** 🚫 **DIAGNOSE ONLY — no fix, no task, nothing touched, nothing run.**
**One family, two doors (check-in 10-02, leave 10-04), and Khwan confirms *"คนเดียวกัน"*.**

---

## 1. ✅ CERTAIN — the shape of the read, and why "empty" is the only thing it can say
**Both doors go through ONE function.** **`linkedStudentIds(lineUserId)`:**
1. **LINE id → ONE parent row** (`findParentByLineUserId`).
2. **that parent's children** — `students.parentId = parent.id AND archivedAt IS NULL`.
3. **no parent, or no children ⇒ `[]`** — and **both callers return `[]` immediately**, without ever looking at a booking.
⇒ 🔑 **The sessions' status is irrelevant. The bookings are never reached.** ✅ **That is why `CONFIRMED` sessions and "you have no upcoming classes" are consistent, and why my own earlier reading — the CONFIRMED-only window — is NOT this.**
🔴 **And the structural fact underneath it: `students.parentId` is a SINGLE COLUMN.** ⇒ **a child belongs to EXACTLY ONE parent row. There is no co-parent, and no second owner.** ⇒ **If the mother's LINE id resolves to any parent row other than the one the child hangs off, she sees nothing, everywhere, forever.**

## 2. ✅ CERTAIN — **there is NO phone canonicalisation, and the unique index does not save us**
**`normalizePhone` is `input.replace(/\D/g, "")` — it strips non-digits and nothing else.** 🚫 **No country code handling. None.**
**`findParentByPhone` then matches EXACTLY: `eq(parents.phone, digits)`.**
**And `parents_phone_uq` is unique on the STRING.** ⇒ 🔴 **`0925874986` and `66925874986` are two DIFFERENT, equally legal, equally unique parent rows for ONE human being.**
🔑 **The index guarantees each SPELLING is unique. It does not guarantee each PERSON is.**
⇒ **If the child's family was created under one spelling and the mother later linked under the other, `findOrCreateParentByPhone` did not find the first row — so it made a second one and put her LINE id on THAT.** ⇒ **She owns a parent row with no children.**
📌 **@Porter's addendum is therefore not a theory about the data; it is the mechanism: the uat relink list really does hold `66925874986` and `668823351752` beside plain `08…` numbers.**

## 3. ✅ CERTAIN — **a SECOND, independent way to land on the wrong parent**
**A LINE id lives in TWO stores: the `family_line_links` table AND the `parents.line_user_id` column.** **`familyOfLineUser` reads the LINKS TABLE FIRST and stops there; only if it finds nothing does it read the column.**
🔑 **The code's own comment records that this precedence has ALREADY caused exactly this class of fault once** — *"once a link row exists for parent B, the column still held by parent A becomes invisible"*.
⇒ **A link row pointing at a childless parent row BEATS a column on the parent who has the children, silently.**
⚠️ **This is not the same bug as §2, and it produces the identical symptom.**

## 4. ✅ CERTAIN — a third, smaller way to get `[]`
**An ARCHIVED child is excluded** (`archivedAt IS NULL`). ⇒ **a family whose only child is archived reads as a family with no classes.** 📌 **Unlikely here — the admin screen shows a live 10-session course — but it is on the list because it costs nothing to rule out.**

## 5. ⚠️ INFERRED — **which of §2 and §3 this family hit, I cannot tell from code**
**Both produce exactly these two symptoms on exactly these two doors.** 🚫 **I will not guess between them** — ✅ **one read-only query separates them in one look.**
📌 **And Khwan's *"คุณแม่อยู่ไทยนะคะ"* rules out an overseas number but NOT §2: a Thai mobile written `66…` is still a different string from the same mobile written `0…`.**

## 6. ▶️ THE ONE READ-ONLY QUERY — **nobody here runs it; the owner does**
🚫 **One `SELECT`. No writes. It names nothing secret — ids and phone digits only.**
```sql
-- Replace :last9 with the LAST NINE DIGITS of the mother's mobile (e.g. 925874986), and
-- :lineUserId with the LINE id from the uat link list for this family.
SELECT 'parent_rows' AS part, p.id::text, p.name, p.phone, p.line_user_id, p.archived_at::text,
       (SELECT count(*) FROM students s WHERE s.parent_id = p.id AND s.archived_at IS NULL)::text AS live_children
  FROM parents p
 WHERE right(regexp_replace(p.phone, '\D', '', 'g'), 9) = :last9
UNION ALL
SELECT 'link_rows', l.parent_id::text, '', '', l.line_user_id, '', ''
  FROM family_line_links l
 WHERE l.line_user_id = :lineUserId
UNION ALL
SELECT 'children', s.id::text, s.name, '', '', s.archived_at::text, s.parent_id::text
  FROM students s
 WHERE s.parent_id IN (SELECT p2.id FROM parents p2
                        WHERE right(regexp_replace(p2.phone, '\D', '', 'g'), 9) = :last9);
```
**How to read it, in one line each:**
- 🔴 **TWO or more `parent_rows` for one `:last9`** ⇒ **§2 is confirmed: one human, two parent rows, different spellings.** **The one with `live_children = 0` is the one her LINE id is on.**
- 🔴 **ONE `parent_row` but a `link_rows` entry naming a DIFFERENT `parent_id`** ⇒ **§3 is confirmed: the links table is routing her to the wrong family.**
- ⚠️ **One parent row, the link agreeing, and `live_children = 0`** ⇒ **§4, or the child hangs off a parent row with a phone that does not share these nine digits at all** — **a different question, and I would want the query again by the CHILD's name.**
- ✅ **If `parent_rows` is a single row with `live_children > 0` and the link agrees, then none of my three explanations is right and I want to know immediately** — 🔑 *that would mean the read is failing for a reason I have not found, and I would rather hear that than be told I was close.*

## 7. 📌 What the fix will have to be — **one line, so nobody re-derives it under pressure. 🚫 NOT NOW.**
**A CANONICAL phone form** (one spelling per human, applied on write AND on every lookup) **plus a backfill of the rows already written in two shapes** — **and a merge path for the duplicate parents it will find, because a second row with a LINE id on it cannot simply be deleted.**
🔴 **It is NOT a one-liner and it touches live customer data**, which is exactly why it is a task for the owner to schedule and not something to slip into a batch. ⚠️ **§3 is a separate and much smaller fix, and the two must not be bundled.**

## 8. ⚠️ One consequence worth saying out loud
**If §2 is the cause, this family is not special.** 🔑 **Every household whose number was entered in one shape and typed in another is in the same state RIGHT NOW, and they are invisible to us: nothing errors, nothing is logged — the parent just sees "you have no classes" and most will not report it twice.**
▶️ **The query in §6, run WITHOUT the `:last9` filter and counting parents with a LINE id and zero live children, would size that.** 🚫 **I have not written that one, because the owner should decide whether he wants the number before we hand him one.**

---

# ✅ ADDENDUM — **I WAS WRONG ON ALL THREE. The owner's data found it, and the real cause is in our code.**
**2026-10-04, after @Porter relayed the owner's query result.** 🔑 **Two students named "Ari Khosla"; one has `parent_id` NULL. ONE parent row, one phone shape, two live children.** ⇒ 🚫 **Not §2 (no duplicate parent, no phone-shape split). 🚫 Not §3. 🚫 Not §4.**
📌 **My §6 said to tell me at once if none of the three was right. It was the right thing to write and it cost us nothing to be wrong in public.**

## A1. ✅ CERTAIN — **`students.parent_id` is NULLABLE, by schema**
**`parentId: uuid("parent_id").references(() => parents.id, { onDelete: "restrict" })`** — 🔴 **no `.notNull()`.**
⇒ **A parentless student is not corrupt data. It is a state the schema PERMITS**, and therefore one the application can reach.

## A2. 🔴 CERTAIN — **our own code creates it, at exactly ONE site, and it is the BOOKING path**
**`resolveStudentId` (`scheduler.service.ts`), called when a booking names an INLINE NEW student:**
```ts
const parent = student.phone ? await findOrCreateParentByPhone(student.phone, {}, exec) : null;
…
parentId: parent?.id ?? null,
```
⇒ 🔴 **No phone ⇒ the student is inserted with NO PARENT. Silently. No refusal, no warning, nothing logged.**
⚠️ **The comment above it describes only the happy path — *"a phone find-or-creates the parent and attaches the student to it"* — and says nothing about the branch where there is no phone.** 🔑 *The null branch was never decided; it was defaulted.*
🔴 **And this is the part that makes it structural rather than unlucky: the SAME CALL then attaches the BOOKING.** ⇒ **the course and its sessions land on the parentless row BY CONSTRUCTION.** **That is not a coincidence that befell this family; it is what that path does.**
📌 **It also skips `assertCanAddStudent` — the household's own child-count guard — which the admin "add a child" path enforces.**

## A3. ✅ CERTAIN — **nothing NULLS a parent later. It is born parentless.**
**The student update builds its patch from an ALLOW-LIST of six fields — `name · nickname · gender · birthDate · nationality · note` — and `parentId` is not among them.** **No other site writes the column** (the remaining `update(students)` calls touch `archivedAt`, `archivedBy` and CRM points only).
⇒ 🔑 **There is no "nulling" bug to hunt.** ⇒ **The fix is at CREATION, and the existing rows need RE-PARENTING — not repair of a corruption.**

## A4. ⚠️ What this means for the family, stated as inference
**The mother's LINE resolves CORRECTLY to parent `46b25866…`, who has two live children — presumably including "Ari Khosla (V)".** **The 10-session course and the 06/13/20/27 Oct sessions sit on the OTHER "Ari Khosla", the parentless one.**
⇒ **Every parent-facing door is working exactly as written, on the wrong child.** 🔴 **And nothing anywhere says so: check-in, leave, My Course and every notice read empty, with no error and no log line.**
📌 **The "(V)" convention means two records for one child may be ROUTINE here** — ⇒ ⚠️ **the fix cannot assume "two students with the same name = a mistake to merge".**

## A5. ▶️ QUERY ONE — **which student holds the course and those sessions** (answers @Porter's Q1)
🚫 **One SELECT. No writes.**
```sql
-- Which student do the bookings and the course hang off?
SELECT b.id::text AS booking_id, b.date::text, b.status, b.student_id::text,
       s.name AS student_name, s.parent_id::text AS student_parent,
       b.course_id::text, cp.size::text AS course_size
  FROM bookings b
  JOIN students s ON s.id = b.student_id
  LEFT JOIN course_packages cp ON cp.id = b.course_id
 WHERE b.student_id IN ('e0970715-…', 'e5fc066a-…')
 ORDER BY b.date;
```
**How to read it:** 🔴 **rows on `e0970715…` (the parentless one) ⇒ confirmed, and the mechanism is A2.** ✅ **rows on `e5fc066a…` instead ⇒ the course is on the REACHABLE child and the fault is elsewhere — tell me at once.**

## A6. ▶️ QUERY TWO — **how many parentless students exist, and how many are actually costing something** (Q3)
🚫 **One SELECT. No writes.** 🔑 **The second number is the one that matters: a parentless student with no live bookings is untidy; one WITH them is a family being told they have no classes.**
```sql
SELECT count(*)                                              AS parentless_students,
       count(*) FILTER (WHERE s.archived_at IS NULL)         AS parentless_live,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM bookings b
          WHERE b.student_id = s.id AND b.status = 'CONFIRMED' AND b.date >= CURRENT_DATE))
                                                             AS parentless_with_future_confirmed
  FROM students s
 WHERE s.parent_id IS NULL;
```
⚠️ **`parentless_with_future_confirmed` is the count of families silently in this state RIGHT NOW.**

## A7. 📌 The fix, recorded so nobody re-derives it — 🚫 **NOT NOW, and it is now a DIFFERENT fix from the one in §7**
🔴 **§7's canonical-phone work is NOT this defect's fix.** **It is still a real weakness** (the index guarantees each spelling is unique, not each person) **but it is not what bit this family, and it must not be bundled.**
**This one is three parts:** **(a) the booking path must not create a parentless child** — ▶️ **refuse, or require the household, or attach to the booking's existing family; the owner chooses, because it changes what a booking screen asks for** · **(b) re-parent the rows that already exist, which is a DATA decision per row and not a script** · **(c) make the state VISIBLE — a child nobody can reach should be findable, because today nothing says so anywhere.**
🔑 **(c) is the cheapest and the one I would argue for first: this family was found by a customer chasing the same symptom through two doors. The next one will not be.**

---

# ▶️ ADDENDUM 2 — **the list, the one-row repair, and my ruling on (a) vs (b)**
**2026-10-04, after the owner ran both queries.** ✅ **Mechanism A2 is PROVEN: the course and all four confirmed sessions sit on the parentless record.** 🔴 **Scale: 21 parentless children, 4 of them holding a confirmed future session — four households silently in this state.**
🚫 **Still no code, still nothing in the batch, and 🚫 nobody here runs anything below.**

## B1. ✅ Q4 CONFIRMED — **and it is stronger than you put it**
- **`PATCH /students/:id` writes a SIX-FIELD allow-list** (`name · nickname · gender · birthDate · nationality · note`). 🚫 **`parentId` is not in it, and no other route or service writes the column.** ⇒ ✅ **NO SCREEN CAN CHANGE A CHILD'S PARENT. An admin cannot fix this today, at all.**
- ⭐ **And the stronger half: `POST /students` — the admin "add a child" door — REFUSES a body with neither `parentId` nor `parentPhone`.** ⇒ 🔴 **The one door designed to create children ENFORCES a parent. The booking path, which was never designed to create children, does not.**
🔑 **So this is not a missing guard. It is a guard that exists, on the other door.** 📌 **That sentence is the argument for (c); use it as it stands.**

## B2. ▶️ THE LIST — the 4, with candidate parents beside them (Q1)
🚫 **One SELECT. No writes.** 🔑 **Names are normalised to letters and digits only and matched BOTH directions, so `Ari Khosla` finds `Ari Khosla (V)` and the reverse.**
```sql
WITH orphan AS (
  SELECT s.id, s.name, regexp_replace(lower(s.name), '[^a-z0-9]', '', 'g') AS key
    FROM students s
   WHERE s.parent_id IS NULL AND s.archived_at IS NULL
     AND EXISTS (SELECT 1 FROM bookings b
                  WHERE b.student_id = s.id AND b.status = 'CONFIRMED' AND b.date >= CURRENT_DATE)
)
SELECT o.id::text AS orphan_id, o.name AS orphan_name,
       (SELECT min(b.date)::text FROM bookings b
         WHERE b.student_id = o.id AND b.status = 'CONFIRMED' AND b.date >= CURRENT_DATE) AS next_confirmed,
       (SELECT string_agg(DISTINCT cp.id::text, ',') FROM bookings b
          JOIN course_packages cp ON cp.id = b.course_id WHERE b.student_id = o.id)       AS course_ids,
       c.id::text        AS candidate_student_id,
       c.name            AS candidate_student_name,
       c.parent_id::text AS candidate_parent_id,
       p.name            AS candidate_parent_name,
       p.phone           AS candidate_parent_phone
  FROM orphan o
  LEFT JOIN students c
    ON c.parent_id IS NOT NULL AND c.archived_at IS NULL AND c.id <> o.id
   AND (regexp_replace(lower(c.name), '[^a-z0-9]', '', 'g') LIKE o.key || '%'
     OR o.key LIKE regexp_replace(lower(c.name), '[^a-z0-9]', '', 'g') || '%')
  LEFT JOIN parents p ON p.id = c.parent_id
 ORDER BY o.name, c.name;
```
⚠️ **Read it as CANDIDATES, never as answers:** **no candidate ⇒ the owner must identify the family himself** · **two candidates ⇒ he chooses** · ✅ **a candidate whose parent's phone he recognises is the strong case.** 🔑 **The query proposes; he decides.**

## B3. ▶️ THE ONE-ROW REPAIR — **one child, guarded so a re-run cannot do harm**
🚫 **The owner runs it. Nobody here does. One row, one column.**
```sql
UPDATE students
   SET parent_id = '46b25866-...'   -- the parent the mother's LINE already resolves to
 WHERE id        = 'e0970715-...'   -- the PARENTLESS "Ari Khosla"
   AND parent_id IS NULL;           -- the guard: a re-run after success changes nothing
```
✅ **Expect `UPDATE 1`.** 🔴 **`UPDATE 0` means somebody already set it — STOP and re-read the row before anything else.**
🔑 **The `AND parent_id IS NULL` is not politeness: without it, a second run with a stale id would move a child who already has a family.**

### 🚫 What this does NOT fix — **all of it, so none is discovered later**
1. 🚫 **It does not merge the two records.** **The mother will see TWO children named Ari**, and so will any notice that names a child. ⚠️ **Khwan should be told that sentence BEFORE the owner runs it, not after.**
2. 🚫 **It does not move CRM points.** **`crm_points` and `crm_level` live on the STUDENT row**, so the child's points stay split across the two records. **Nothing breaks; the number is simply wrong on both.**
3. ✅ **It does not need to touch bookings, the course, or the outbox — and that is the point.** **Every parent-facing door resolves parent → children → bookings**, so attaching the parent fixes check-in, leave, My Course and notices all at once. 📌 **And the outbox is keyed on `booking_id`, NOT `student_id`, so nothing historical is orphaned or needs moving.**
4. 🚫 **It does not change past notices.** **Those were rendered and queued when they were sent; they stay as sent.**
5. 🔴 **It does not stop it happening again.** **The booking path still creates parentless children, today, on every environment.**
6. 🚫 **It does not give anybody a screen.** **The next one is still a hand-written statement by the owner.**

## B4. ✅ Q3 — **YES, re-parenting is SAFE mid-flight. One consequence to warn about.**
**Nothing about the child's identity changes: `student_id` is untouched, so every booking, the course, its `usedSessions`, its expiry and all ATTENDED history stay exactly where they are, pointing at the same row.** **The only thing that changes is WHICH HOUSEHOLD CAN SEE THEM** — which is the entire purpose.
⚠️ **The consequence worth warning about: the family will immediately start receiving notices they have never received** — **possibly a reminder for the very next session.** 🔑 **That is correct behaviour arriving late, but to the mother it is a burst of messages out of nowhere.** ▶️ **One sentence from Khwan beforehand turns it from alarming into reassuring.**

## B5. ⚖️ **(a) vs (b) — my ruling: (a), now; (b) only as a deliberate second step, never bundled**
⭐ **Do (a): attach the parentless record to that parent.**
1. **(a) is ONE write to ONE column, reversible by one write.** **(b) moves a live course, attendance history and four confirmed sessions across several tables and is not practically reversible.**
2. **The harm today is "this family cannot take leave or check in".** ✅ **(a) ends that today.** **The two-Ari list is an annoyance; being unable to take leave is not.**
3. 🔴 **And the decisive reason, which is your own point back at you: "(V)" is THEIR convention. We do NOT know these are the same child.** ⇒ **(a) assumes nothing. (b) ASSERTS a fact we cannot verify from here** — **and if it is wrong we have merged two real children and their attendance history is now a lie.** 🔑 **A repair that can be wrong about who somebody IS must not be the first repair.**
4. ⚠️ **(b) also strands the CRM points and needs a decision about which record's points survive — a question nobody has asked yet.**

### ✅ Can (a) be upgraded to (b) later without a second mess? **YES — and (a) makes (b) SAFER, not harder.**
**After (a), both records hang off the SAME parent.** ⇒ **a later merge is a move WITHIN one family instead of ACROSS two**: no household changes, no notice recipients change, and the only decision left is which record keeps the history.
🔑 ⇒ **(a) is not an alternative to (b). It is the correct FIRST STEP of (b), and it happens to fix the live problem on its own.**

### ⚠️ What (b) would have to move, if it is ever chosen
**`bookings.student_id` AND `bookings.co_student_id`** · **`course_packages.student_id` AND `course_packages.co_student_id`** · **`vouchers.student_id`** · **`camp_packages.student_id`** (🔴 **NOT NULL — it can only be repointed, never emptied**) · **plus a DECISION on `crm_points` / `crm_level`, which live on the student row and cannot be added together without the owner saying so.**
✅ **NOT the outbox** (keyed on `booking_id`). ✅ **NOT the notices already sent.**
🔑 **Six places, in ONE transaction or none** — *a half-moved child is worse than a duplicated one, because nothing would say which half is real.*

## B6. 📌 Does "(V)" change my answer? **It IS my answer.**
**If two records for one child can be routine for this customer, then "same name ⇒ duplicate ⇒ merge" is a GUESS about their filing, not a fact about our data.**
⇒ 🔑 **We may repair REACHABILITY, which is unambiguously ours and unambiguously broken.** 🚫 **We may not repair IDENTITY, which is theirs.**
▶️ **So: (a) for all four households; (b) only per row, only if Khwan says those two records are one child, and only after (a).**

## C. The four households, read off uat (owner ran §B2, 2026-10-04)

⚠️ **The §B2 query's `candidate_*` columns are UNRELIABLE for Thai names.** `regexp_replace(... '[^a-z0-9]' ...)` strips every Thai character, so a Thai name reduces to an empty key, and an empty key prefix-matches EVERY student. That is why the result ran to thousands of rows. **The `orphan_*` columns are sound; the candidate columns are noise for any non-Latin name.** (Porter's error, recorded so nobody re-runs it as written.)

| orphan_id | name | next CONFIRMED | course | verdict |
|---|---|---|---|---|
| `e0970715` | **Ari Khosla** | 2026-10-06 | `b40c7ec6` | ✅ twin `e5fc066a` "Ari Khosla (V)" → parent `46b25866` (0858091112). The reported case. |
| `d9f4fe93` | **ฟ้าใหม่** | 2026-10-07 | `9891a2c1` | ✅ exact-name twin `c40d7f2f` → parent `1221b76f` (0982897563). |
| `b85245ba` | **ตินติน เปรมตฤณ** | 2026-10-10 | `1997fe76` | ❓ no twin. Two unrelated `ตินติน` exist (เชยกลิ่น, แสงทอง) — different surnames. **Khwan must identify the family.** |
| `b2947963` | **ISB (ECA)** | 2026-10-12 | **none** | ⚠️ **Not a child.** No `course_packages` row; looks like a placeholder row for an ECA school slot. **May need no repair at all** — Khwan confirms. |

🔑 **Two repairable today, two blocked on the customer.** Scale unchanged: **21 parentless students, 4 with future CONFIRMED sessions.**

## C1. The two repair statements (owner runs them; nobody else)
Guarded — a re-run after success changes nothing. Expect `UPDATE 1` each. `UPDATE 0` ⇒ stop and re-read the row.

```sql
-- Ari Khosla → the parent the mother's LINE already resolves to
UPDATE students SET parent_id = '46b25866-0f94-45b9-9d38-6cf623afc2f0'
 WHERE id = 'e0970715-f48c-4077-8dd0-fa54f6128cb6' AND parent_id IS NULL;

-- ฟ้าใหม่ → the parent of the identically-named record
UPDATE students SET parent_id = '1221b76f-47e4-4b9e-a625-9e22288b2651'
 WHERE id = 'd9f4fe93-e2f0-41fe-b94c-6484b06b1355' AND parent_id IS NULL;
```

🔴 **HOLD both until Khwan has been warned** (§B4): the family will see **two children with the same name**, and will start receiving notices they have never received — possibly a reminder for the very next session.

## C2. ✅ DATA REPAIR DONE on uat, 2026-10-04 — owner ran both statements, **`UPDATE 1` each**
- `e0970715` **Ari Khosla** → parent `46b25866`. Next CONFIRMED **2026-10-06**.
- `d9f4fe93` **ฟ้าใหม่** → parent `1221b76f`. Next CONFIRMED **2026-10-07**.

⇒ **Both households can now take leave, check in, and see My Course.** ⚠️ **Both will also start receiving notices immediately, possibly for those very sessions.** 🔴 **Khwan was NOT warned beforehand** — the warning is now owed, not optional, because each mother will see two children with the same name.

### Still open after this repair
1. ❓ `b85245ba` **ตินติน เปรมตฤณ** (cab 2026-10-10) — family unknown, **Khwan must identify it**.
2. ⚠️ `b2947963` **ISB (ECA)** (2026-10-12, no course) — **may not be a child at all**; Khwan confirms before anything is written.
3. 🔴 **THE CODE IS UNFIXED.** The booking / new-course path still creates parentless children on every environment, today. **This repair fixed two households, not the defect.** The owner has already promised Khwan the system itself will be fixed.
4. 📌 The remaining **17 parentless students** have no future CONFIRMED sessions. **Not urgent, not harmless** — any one of them becomes case #5 the moment a new course is booked onto that row.

## D. 🔴 KHWAN'S ANSWERS, 2026-10-04 — **one of them changes the FIX, not just the data**

### D1. `ตินติน เปรมตฤณ` `b85245ba` — **a third household, and SHE HAD ALREADY SEEN IT**
**Khwan, verbatim:** *"ตินติน เปรมตฤณ เป็นอีกบ้านนึงเลยที่ข้อมูลนักเรียนหายไปจาก people ค่ะ เมื่อวานที่ทีมมาแจ้งขวัญลืมบอกพี่โด่งค่ะ"*
🔑 **She noticed the same symptom YESTERDAY, independently, and did not report it** — she read it as the student's data having *disappeared*, which is exactly how the defect presents. ⇒ 📌 **Confirmation that the symptom is self-evident to staff and still goes unreported: the sweep found it, the customer did not raise it.**
⚠️ **She did NOT name the family.** ⇒ 🔴 **STILL NOT REPAIRABLE. The one thing needed — which parent — is the one thing she did not give.**
**Her screenshots show the cost:** **an ACTIVE 10-session course, 2/10 used, `Expires 2026-11-21`, 🔴 `LOCKED` with leave quota `0 left` (used 3/3)** — and **`People` search returns *"No parents match the search"***.
⇒ 📌 **This family is worse off than the other two: not merely unreachable, but LOCKED out of rescheduling, with 8 sessions still to run.**

### D2. 🔴 `ISB (ECA)` `b2947963` — **NOT a child, and NOT an accident of ours alone**
**Khwan, verbatim:** *"ที่ทีมงานสร้างผิดใส่เป็นชื่อเด็กไปค่ะ แต่จริงๆมันคือ Title เฉยๆค่ะ เป็นรายการตัวแทนคลาส ECA ของโรงเรียนค่ะ"*
⇒ ✅ **Staff deliberately typed a CLASS TITLE into the student field, to stand for a school's ECA slot.** **It has a CONFIRMED session on 2026-10-12 and no course package.**
🚫 **It must NOT be given a parent.** **There is no family. Attaching one would invent a household.** ▶️ **The disposal is ARCHIVE, and it is the owner's decision per row, never a script.**

### D3. ⚠️ **WHY D2 CHANGES THE FIX — this is the part for @Sober**
🔴 **The customer uses the student record as a LABEL, not only as a person.** ⇒ **A blanket refusal "a booking may not create a child without a household" would block a workflow they rely on today** — *the ECA slot they book against a title.*
🔑 **So the fix cannot be stated as "every student must have a parent". It must be stated as "every student that stands for a CHILD must have a parent" — and nothing in the data says which is which.**
▶️ **Three readings, and the owner picks, not us:**
1. **The title row is MISUSE and should become a first-class thing** (an ECA slot is not a student) — ⭐ *the honest fix, the largest.*
2. **The title row is LEGITIMATE and the model needs a flag** — a student that is not a person. **Then `parent_id NOT NULL` is reachable, gated on that flag.**
3. **The title row is tolerated and simply archived** — ⚠️ **then the constraint must permit archived rows, which is already @Sober's `CHECK (parent_id IS NOT NULL OR archived_at IS NOT NULL)`** 🔑 **and his design ALREADY survives this discovery, which is the strongest evidence it was the right shape.**
📌 **@Sober's constraint was written before this answer arrived and is not invalidated by it.** ⚠️ **But reading 1 and 2 are now PRODUCT questions the owner has not been asked.**

### D4. Still owed by the customer
**ONE thing: WHOSE CHILD is `ตินติน เปรมตฤณ`** — the parent's name or phone. 🚫 **Nothing else about that row can proceed without it.**

### D5. ⚖️ OWNER RULING, 2026-10-04 — **`ISB (ECA)`: DO NOTHING. It is not a problem.**
**Owner:** *"ISB (ECA) ไม่ต้องทำอะไรไม่ได้เหรอ เขาไม่ได้มีปัญหานี่"* — ✅ **and he is right.**
🔑 **That row surfaced because PORTER'S SWEEP found it, not because anybody was harmed.** **No family is waiting on it, nothing is broken, and it does the job staff gave it.** ⇒ 🚫 **Touching it risks the confirmed 2026-10-12 session for no gain.** 📌 **Khwan told: leave it exactly as it is.**
⚠️ **The ONE thing that keeps it on the record: @Sober's `CHECK (parent_id IS NOT NULL OR archived_at IS NOT NULL)` would REFUSE this row at migration time.** ⇒ **It is a precondition of THAT work, not a task today** — and the answer then may not be archiving at all, but a "not a person" marker, which matches the truth better. 🔑 *A sweep's output is a list of things that MATCH, not a list of things that are WRONG.*

## E. ✅ THIRD HOUSEHOLD REPAIRED, 2026-10-04 — **and it was a DIFFERENT sub-case**
**`ตินติน เปรมตฤณ` `b85245ba` → the parent on 0965434739. `UPDATE 1`.**
🔑 **Not the same shape as the first two.** **Khwan gave the mother's number; the phone lookup (last 9 digits, because numbers are stored in more than one shape) returned ZERO rows** ⇒ **the household did not exist AT ALL.** **Nobody had ever been created for it.**
⇒ **Two sub-cases, not one:**
1. **A child detached from a household that EXISTS** — `Ari Khosla`, `ฟ้าใหม่`. **Repair = one UPDATE.**
2. 🔴 **A child whose household was NEVER CREATED** — `ตินติน เปรมตฤณ`. **Repair = create the parent through the real "Add parent" door FIRST, then one UPDATE.** ⚠️ **And never "Add student" while doing it — that would mint a SECOND ตินติน and split the course history across two records.**
📌 **The guard earned its keep: the owner ran the UPDATE before creating the parent and got `UPDATE 0`.** 🔑 *Without `AND (SELECT count(*) …) = 1`, the scalar subquery would have returned NULL and written "no parent" over a row that already said "no parent" — a silent no-op that READS like a success.*
⚠️ **This mother has NOT linked LINE.** ⇒ 🚫 **no notice burst, and no warning was owed.** ✅ **What the repair buys her: she is findable in People today, and the day she links LINE it simply works — nobody has to come back to this row.**
✅ **Her course was also UNLOCKED by the owner through the admin button** (quota 3/3 used, 8 of 10 sessions still to run) — **Khwan asked for it: *"ปลดค่ะ"***. 📌 **A normal admin act, not a data repair.**

### E1. Remaining on uat
🚫 **`ISB (ECA)`** — owner ruled DO NOTHING; it is a class TITLE, not a child, and harms nobody. **Precondition of the DB constraint, not a task.**
📌 **17 parentless students with no future sessions** — dormant. **Each becomes a live case the moment a course is booked onto it.**
🔴 **THE CODE IS STILL UNFIXED.** **Three households in one day, one of which the customer had seen and not reported.**
