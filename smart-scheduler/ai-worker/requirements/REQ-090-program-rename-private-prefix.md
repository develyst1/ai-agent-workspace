# REQ-090 — Customer renames the activities: "Private" prefix on most programs (2026-09-16)

**Source:** the customer, via the owner, 2026-09-16, as a CSV of the programs table with a "แก้เป็น" (change-to) column. Raw file archived verbatim: `REQ-090-program-rename-private.source.csv`. **Status: RECORDED — clarifications with the owner; mechanism question with @Sober; nothing dispatched.**

🔗 **This ANSWERS `REQ-085 §16.1`** (which was LAST, blocked on "is `Private` a name or a category, and are there group classes?"). The CSV settles both: **`Private` is part of the NAME (a prefix)**, not a category; and **group classes exist and do NOT get `Private`** (`Balance Play (Group)` is unchanged). §16.1 is folded into this REQ.

## §1 — the rename map, verbatim from the customer (current `name` → new `name`)
| current `name` | → new `name` | price_group |
|---|---|---|
| Surfskate | Private SURFSKATE | bike-skate |
| Freeskate | Private FREESKATE | bike-skate |
| Skateboard | Private SKATEBOARD | bike-skate |
| Inline Skate | Private INLINE SKATE | bike-skate |
| Onewheel E-Skate | Private ONEWHEEL E-SKATE | onewheel |
| Bike | Private BIKE | bike-skate |
| Balance Cruiser | Private CRUISER | bike-skate |
| Balance Bike | Private BALANCE BIKE | bike-skate |
| Scooter | Private SCOOTER | bike-skate |
| Inline Skate & Bike | Private INLINE SKATE & BIKE | bike-skate |
| Surfskate & Bike | Private SURFSKATE & BIKE | bike-skate |
| Surfskate & Inline Skate | Private SURFSKATE & INLINESKATE | bike-skate |
| Bike & Scooter | Private BIKE & SCOOTER | bike-skate |
| Surfskate & Freeskate | Private SURFSKATE & FREESKATE | bike-skate |
| Baby Skate | Private BABY SKATE | bike-skate |
| Surfskate & Skateboard | Private SURFSKATE & SKATEBOARD | bike-skate |

## §2 — LEFT UNCHANGED (blank "แก้เป็น"): 
`Bike / Scooter / Balance Cruiser` · `Balance Play (Private)` · `Balance Play (Group)` · `1st Trial` (also `active=FALSE`).

## §3 — PM flags, to settle before it lands (⚠️ = needs the owner; 🔧 = mechanism, @Sober)
- ⚠️ **A rename of a program ROW changes the name on EVERY course that uses it — existing/active courses included, and every future message.** That is almost certainly the intent (they want `Private` everywhere), but it is a change to live customer-facing data on `uat`, so it is stated, not assumed. **Confirm: existing courses should read the new name too.**
- ⚠️ **One spelling inconsistency in the customer's own text:** `Private SURFSKATE & INLINESKATE` (INLINESKATE one word) while the standalone is `Private INLINE SKATE`. Verbatim as given, or normalise to `INLINE SKATE`? The house rule is "เอาตามเขา" — verbatim unless the owner says fix.
- 🔧 **Trailing spaces** in the source (`…E-SKATE `, `…BALANCE BIKE `, `…& SCOOTER `, `…& FREESKATE `, `…& SKATEBOARD `) will be TRIMMED — a stored trailing space is a defect, never a name. (PM decision, not a question.)
- 🔧 **@Sober: is a program NAME editable in the admin UI?** If YES, this is pure DATA ENTRY — the owner (or an admin) renames each row, no engineering, no deploy. If NO, it is a one-time change the owner applies (agents never touch the real DB) and Sober says exactly how the owner does it. **This decides whether REQ-090 is a task at all.**
- ⚠️ **`price_group` does not change** — only the display name. The rename must not move any pricing.

## §4 — OWNER, 2026-09-16
1. ✅ **Existing courses take the new name too** — *"1.ใช่"*. The rename is on the row; every existing/active course and every future message shows the new name. Intended.
2. ✅ **VERBATIM — keep the customer's spelling exactly**, including `Private SURFSKATE & INLINESKATE` (one word). *"2.เอาตามลูกค้าเป๊ะ"*. No normalisation. (Trailing spaces still trimmed — a space is not spelling.)

## §6 — 🔴 DATA REQUEST for the HUMAN (the SQL) (written by @Sober, 2026-09-17; agents NEVER run this)
**Mechanism (from the code):** a program's `name` is not editable in the admin UI and there is no API for it — the only writer of `subjects` is the dev seed (which truncates). ⇒ **the owner applies this by SQL, on `uat` (the customer's live box) and on `sid` so the two match.** `subjects.name` is `UNIQUE`; every new name is distinct from every old one, so the 16 updates cannot collide. Every display reads `subject.name` from the row at read time (calendar, course cards, and LINE — the outbox worker joins `subject` at SEND time), so the change is immediate everywhere; **`price_group` is a separate column and is NOT touched.** The seed's suffix-style `Balance Play (Private)`, `Balance Play (Group)`, `Bike / Scooter / Balance Cruiser` and `1st Trial` are left alone (§2). Names are TRIMMED and VERBATIM per §4 — `INLINESKATE` stays one word.

**Run once per box, inside the transaction. Expect the first `SELECT` to show the 16 OLD names, `UPDATE 1` sixteen times, and the second `SELECT` the 16 NEW names with the same `price_group` values. If any `UPDATE` reports `0` rows (a name on the box differs from the CSV), `ROLLBACK` and report the name — do not commit a partial rename.**

```sql
BEGIN;

SELECT name, price_group FROM subjects ORDER BY name;

UPDATE subjects SET name = 'Private SURFSKATE'               WHERE name = 'Surfskate';
UPDATE subjects SET name = 'Private FREESKATE'               WHERE name = 'Freeskate';
UPDATE subjects SET name = 'Private SKATEBOARD'              WHERE name = 'Skateboard';
UPDATE subjects SET name = 'Private INLINE SKATE'            WHERE name = 'Inline Skate';
UPDATE subjects SET name = 'Private ONEWHEEL E-SKATE'        WHERE name = 'Onewheel E-Skate';
UPDATE subjects SET name = 'Private BIKE'                    WHERE name = 'Bike';
UPDATE subjects SET name = 'Private CRUISER'                 WHERE name = 'Balance Cruiser';
UPDATE subjects SET name = 'Private BALANCE BIKE'            WHERE name = 'Balance Bike';
UPDATE subjects SET name = 'Private SCOOTER'                 WHERE name = 'Scooter';
UPDATE subjects SET name = 'Private INLINE SKATE & BIKE'     WHERE name = 'Inline Skate & Bike';
UPDATE subjects SET name = 'Private SURFSKATE & BIKE'        WHERE name = 'Surfskate & Bike';
UPDATE subjects SET name = 'Private SURFSKATE & INLINESKATE' WHERE name = 'Surfskate & Inline Skate';
UPDATE subjects SET name = 'Private BIKE & SCOOTER'          WHERE name = 'Bike & Scooter';
UPDATE subjects SET name = 'Private SURFSKATE & FREESKATE'   WHERE name = 'Surfskate & Freeskate';
UPDATE subjects SET name = 'Private BABY SKATE'              WHERE name = 'Baby Skate';
UPDATE subjects SET name = 'Private SURFSKATE & SKATEBOARD'  WHERE name = 'Surfskate & Skateboard';

SELECT name, price_group FROM subjects ORDER BY name;

COMMIT;   -- or ROLLBACK; if any UPDATE above touched 0 rows
```

📌 **After it lands:** a course card that showed `Surfskate 6 HR` shows `Private SURFSKATE 6 HR`; the daily reminder and every outbox message not yet sent print the new name; sent history keeps its bytes. Nothing in the code changes. **Follow-ups with the owner (Porter, optional): update the dev seed so `sid` matches by seed; an admin "rename program" screen so the next rename is data entry.**

## §5 — OWNER, 2026-09-17, on the two follow-ups
1. ✅ **DO the dev-seed update** so `sid` matches by seed (item (a)). *"1 ก่อน"*
2. 🚫 **NO admin rename-program screen in THIS project.** *"2 มันควรไปทำที่ backoffice… backoffice เกิดมาเพื่อ scalable… ต่อกับแอปอื่นๆ… ต่อ api เพื่อสั่งสร้างรายได้ หักรายจ่ายได้เลย"* — program/subject management (and revenue/expense side effects) belong in the **backoffice**, the system built to be the scalable hub other apps hook into. **smart-scheduler does NOT grow a program editor.** A standing scope boundary, not a deferral.

## §7 — APPLIED, 2026-09-17 (owner ran the SQL)
✅ **The after-`SELECT` returned 20 rows: all 16 renamed to the `Private …` names VERBATIM** (incl. `Private SURFSKATE & INLINESKATE` one word), **the 4 §2 rows unchanged, every `price_group` intact**. No collision, no partial. ✅ **BOTH boxes run 2026-09-17: `sid` and `uat` — identical 20-row result. REQ-090 CLOSED.** Open thread only: the dev-seed update (item a) with @Sober.
