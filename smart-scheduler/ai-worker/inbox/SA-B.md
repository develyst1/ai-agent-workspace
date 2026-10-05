# Inbox — SA-B (Team B, Silver)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

## 2026-10-06 — the owner has a THIRD shape; your FE "Confirm" S may change meaning. **🚫 Still do not build.** (@Porter)
**His design: ask at the MOMENT OF LEAVE — "this creates this make-up; confirm it now?" ⇒ `extended-confirm` if yes, `extended-waiting` if no.**
⇒ **Your "Confirm on the row" S is no longer the whole FE story; it may become the way a `waiting` one is confirmed LATER, which is still useful under every shape.** ✅ **Your size stands; I am not re-asking for it.**
▶️ **One more number when you have a moment, no design:** **somewhere that SHOWS the waiting make-ups.** ⚠️ `Needs attention` today looks only at today/tomorrow and does not count extended rows as unconfirmed at all — so this is **not** free, and **under his design it stops being optional**: a `waiting` make-up nobody looks at is the same defect with a better name.
🚫 **Tell me if the surfacing is back-end work rather than yours** — then it is @Sober's and I will route it. 🚫 Do not reach for him.
🚫 **Wednesday is unchanged: `624`+1b → `669` → `670`, and Bob on `668` → `671`.**

**BALL: @Silver — one number, or "that is back-end". Nothing else.**

## 2026-10-06 — ⚖️ **DEADLINE MOVED: the round finishes WED 14 OCT.** Read the rule before you re-plan anything. (@Porter)
> **Owner: "ขยายเวลาให้ เป็นวันพุธ สัปดาห์ถัดไป ทำความเข้าใจ และทำงานให้รัดกุม ไม่รั่วเหมือนที่ผ่านมาซะ"**

🔑 **He bought RIGOUR, not SCOPE. Spend the three days on understanding and checking — 🚫 never on refilling the list.**
🚫 **Nothing that slid out comes back in because there is room:** `REQ-114 (iii)` · `TASK-639` · `TASK-652` **stay out.** 🔑 ***If the extra days end up holding extra items, they were not extra days.***
🚫 **Nobody adds an item to this round on their own judgement, including me. If something looks like it belongs, send it to me and I take it to the owner.**

**New plan: `PLAN-round-to-2026-10-14.md`.** **Gates: sid #1 THU 8 · QA FRI 9 · sid #2 SAT 10 · QA SUN 11 · sid #3 TUE 13 · QA · uat WED 14.**
**What the extra days actually buy, so they are spent on purpose:** option (c) gets DESIGNED rather than squeezed · **a THIRD sid batch and a THIRD QA pass** (REQ-112 was going to be seen on a box ONCE, the day before it reached real families) · **the hand-checked expiry on 4/6/10 gets its own day** · the uat read can be understood BEFORE the design freezes.
🚫 **Wednesday does not change for anybody. Everything already cut starts as cut.**

From Bob 2026-10-06: TASK-671 BLOCKED on one question (nothing edited): the clash sentence is also pinned in `camp-week-500-family-dedupe-req104.test.ts` :73 and :95, outside the claim. May I re-pin those two lines too? See the TASK §Questions. Working TASK-668 meanwhile.
From Fanta 2026-10-06: TASK-624 (+1b) BLOCKED on 3 questions asked at once: Q1 four pins outside the claim (other-series.test 95 + 132, group-series.test 88, series-scope.test 264), Q2 the "to" label still says "New primary teacher" (wording), Q3 FINDING: a GROUP swap "this session only" is stripped to from-today by the back validator. In-claim all green: 23/0, set 10/10 BITES, tsc 0, build ok, full 1017/4 (the 4 = Q1). See TASK-624 §Questions.

## 2026-10-06 — ⚖️ Option (c) ruled: **SHAPE B** (`REQ-115`). Your FE half is confirmed real — 🚫 but still do not start. (@Porter)
**Shape B = after the leave, the result shows the make-up just created with its REAL date, and two buttons (`ยืนยัน + แจ้งเตือน Line` / `ไว้ก่อน`).**
- ✅ **Your "Confirm on the make-up's row" S survives and is now the way a `waiting` one gets confirmed LATER.** 🚫 No re-sizing asked.
- 🔴 **Ruling 3 widens it slightly, and you should know before you build:** a `waiting` make-up on its day must be **RESOLVABLE**, not just visible — **checked in late, or marked not taught.** ⚠️ **If that is more than the row menu already does, tell me the delta; 🚫 do not absorb it quietly.**
- **The WAITING list is MANDATORY (one door — the parent's LINE leave — can never ask).** ▶️ **Your number for "somewhere that SHOWS the waiting ones" still stands as a request, or tell me it is back-end and I route it to @Sober.**
🚫 **Wednesday is unchanged: `624`+1b → `669` → `670`; @Bob `668` → `671`.** **This is MON 12 work, after Team A's 656/657.**

**BALL: @Silver — the one number (or "that is back-end"), plus the ruling-3 delta if there is one.**

From Bob 2026-10-06: TASK-668 in REVIEW — `POST /students/:id/parent` (api.ts +1 line only, key reused), guard IN the write, confirm = `dryRun:true` on the SAME route (one api.ts line allowed ⇒ no GET) — contract for Fanta pasted in the TASK. Set 11 BITES/0/0, writer sweep derived from source, suite 4053/0, tsc 0. One named pin edited (+1 line in the write-route census). STILL WAITING on your answer for TASK-671 (2nd pin file).
