# PLAN — the round, finished by WED 14 OCT 2026 — @Porter
⚖️ **OWNER, 2026-10-06: "ขยายเวลาให้ เป็นวันพุธ สัปดาห์ถัดไป ทำความเข้าใจ และทำงานให้รัดกุม ไม่รั่วเหมือนที่ผ่านมาซะ."**
🔴 **SUPERSEDES `PLAN-round-to-2026-10-11.md`** (kept; its gates and reasoning carry over unchanged).

## 🔑 THE RULE THAT GOVERNS THIS PLAN — read before changing a line of it
**He did not buy three more days of SCOPE. He bought three more days of RIGOUR.** ⇒ **the slack is spent on understanding and on checking, never on refilling the list.**
🚫 **Nothing slid out comes back in just because there is room:** `REQ-114 (iii)` stays out · `TASK-639` and `TASK-652` stay out.
🔑 ***If the extra days end up holding extra items, they were not extra days.***

## 🔴 FIRST, AND IT IS NOT A BUILD ITEM — the customer holds a date that is now WRONG
**At 02:34 the owner told Khwan: "ตั้งใจให้เสร็จภายในวันอาทิตย์ที่ 11 นี้ครับ." That date moved tonight.**
⇒ **A promise nobody corrects is exactly the leak he just told us to stop.** 🔑 *We have the `REQ-101/102` lesson in writing: **a status nobody updates is read as the truth long after it stops being one** — and this one was read by the customer, not by us.*
▶️ **The owner decides whether and when to tell her. Porter does not promise or move dates with the customer.** **Draft ready below; 🚫 nothing sent without his word.**

## The schedule — 7 build days, 3 sid batches, 3 QA passes, one uat release
| when | Team A (@Sober) | Team B (@Silver) | gate |
|---|---|---|---|
| **WED 7** | `656` core (@Jason) · `658` inventory + the DRAFTS table (@Fern) | `624`+1b (@Fanta) · `668` (@Bob) | — |
| **THU 8** | `656` continues · `658` build on approved words | `669` (needs Bob's route) · `671` | ▶️ **sid batch #1** |
| **FRI 9** | `657` (ruling 2 · absorbs REQ-114 (ii) · the admin flag) · `659` copy | `670` · `665`+`667` ride | ▶️ **@Tanya QA #1** |
| **SAT 10** | fix round | fix round | ▶️ **sid batch #2 (REQ-112 core)** |
| **SUN 11** | — | — | ▶️ **@Tanya QA #2 — 🔴 the expiry checked BY HAND on 4 / 6 / 10** |
| **MON 12** | **option (c) build** — the question at the leave moment | **option (c)'s screen half, if it has one** | — |
| **TUE 13** | fix round | fix round | ▶️ **sid batch #3 → @Tanya QA #3** |
| **WED 14** | — | — | ▶️ **uat release → @Tanya QA on uat → DONE** |

## What the three extra days actually buy — name it, so it is spent on purpose
1. 🔴 **Option (c) gets DESIGNED instead of squeezed.** The owner's own shape — ask at the moment of leave; `extended-confirm` vs `extended-waiting`. **Its open holes get answered before a line is written:** which doors can even ask the question (the parent's LINE door cannot confirm a class) · is the make-up's DATE known at the click · what a `waiting` make-up does on its own day.
2. 🔴 **A THIRD sid batch and a THIRD QA pass.** The old plan had REQ-112 passing QA **once**, the day before shipping to real families. **Now it is seen twice on a box with a fix round between.**
3. 🔴 **The hand-check of the expiry on 4 / 6 / 10 gets a whole day (Sun), not an hour at the end of one.** 🔑 *It decides when a course the customer PAID FOR stops being valid.*
4. 🔴 **The live-data read on uat** (how many make-ups are already sitting unconfirmed) can be run and **understood** before the design is frozen, instead of after.

## 🚫 Unchanged, and not negotiable by anyone
- No QA step is cut · no uat deploy without a sid pass · **no team reported green alone** (ORDER 14.3).
- **`TASK-668` + `669` ship together · `665` + `667` ship together · `656`+`657`+`658` are ONE ship-set.**
- 🚫 `scheduler.service.ts` is Team A's all week. 🚫 `routes/api.ts` is one line for Team B.
- **REQ-112 ships only on a hand-checked expiry for one course of EACH size.**

## ▶️ Open with the owner
1. **Does Khwan get told the date moved, and when?** (draft below)
2. **The read-only count of unconfirmed make-ups on uat — go or not?** *(asked twice, still unanswered; it is the number that should inform option (c))*
3. **Option (c)'s one ruling, once @Sober's costs land:** when a leave comes from the PARENT's LINE door, does the make-up default to `waiting` — **and if so, the surfacing stops being optional, because it becomes the only path to confirmation.**
