# REQ-105 — Khwan fix-list round 2 (2026-09-23) — UNDERSTAND FIRST, do not rush to build

**Source:** customer (Khwan) via owner, 2026-09-23 (arrived just before the batch went to uat). **Owner's lesson to Porter: don't drive the team to build without TRULY understanding — especially Group, which was never crystal-clear (the customer herself is still finding the words).** Status: RECORDED · analysis (not build) requested · Porter to confirm understanding before any dispatch-to-build.

## §1 — Camp: per-COACH time within one day
"แยกเวลาครูในแต่ละคน ใน 1 วัน — ครูคนบนอาจจะเวลานึง ครูอีกคนอาจจะอีกเวลานึง."
⇒ Camp today has ONE shared window per day (10:00–15:00, editable per week). The customer wants **each coach on a camp day to have their OWN time window** (coach A 10:00–12:00, coach B 13:00–15:00, etc.), not one block covering all coaches. GAP vs what we built (§11 = one window/day for all).

## §2 — Cancel Voucher: separate the cancelled ones in the UI
"ถ้า cancel แล้ว รบกวนแยกหน้าออกไป เหมือนคอร์สที่ cancel ได้ หรือเอาไปอยู่ข้างล่างสุด."
⇒ A cancelled voucher should be visually SEPARATED — its own section/page like a cancelled course, or moved to the BOTTOM of the list — not mixed in with active vouchers. UX refinement on top of REQ-103.

## §3 — GROUP: the TRUE model (customer still formulating; Porter under-specified this before)
Khwan's own words: a **group schedule that RUNS CONTINUOUSLY even with NO students**. The slot can change coach but is normally **pinned to the Head Coach**. Example: every Sat/Sun 15:00 (today only Sunday has students, Saturday none). It runs forever; kids enroll/renew or not, the slot never disappears. If no one is enrolled, the coach can still take **Private students in that slot ⇒ it must allow OVERBOOK**.
- ⚠️ This DIVERGES from what was built (Group = courses sold into a group object). The persistent-standing-slot + head-coach-pin + overbook-with-Private is the part we never locked.
- **Porter action:** confirm this understanding with the owner/customer, and have @Sober read the CURRENT group model against it, BEFORE any build. Do NOT assume.

## §3.1 — GROUP definitive spec (customer infographic "Group Class Schedule", 2026-09-23) — LOCKED
The customer sent a full infographic (archived image 27). It confirms Porter's read exactly. Definitive spec:
- **A recurring "group class round" (รอบคลาสกลุ่ม) that is OPEN PERMANENTLY and runs continuously** — the slot stays on the calendar every week **even on weeks with ZERO students**. "Same time, Different people, Still our group."
- **Coach-swappable, normally PINNED to the Head Coach.**
- **Two visual states on the calendar** (different colours): `Group Class (มีนักเรียน)` vs `Group Class (ไม่มีนักเรียน)`; enrolled students' names show on the block.
- Students enroll per week freely — renew / don't / change people / someone buys a single class (1 ครั้ง) — the headcount changes weekly but the group slot keeps running.
- **If the group is empty, the coach can take Private students in that slot ⇒ OVERBOOK is allowed** ("ถ้าต้องการรับนักเรียนเพิ่ม สามารถสอนเป็น Private ได้ (Overbook ได้)").
- Summary (customer's): **Group Schedule = the standing recurring time-slot; Student = whoever books/attends that week.** The count varies; the Group slot runs on regardless.
- Example (customer): Sat/Sun 15:00 exists; today only Sunday has students, Saturday runs empty. Wk1 ซุปซุป+ราร่า · Wk2 ราร่า alone · Wk3 ราร่า+ซุปซุป+เมแก้น(1 ครั้ง) · … runs on.
⇒ Understanding LOCKED (no more intent questions). @Sober's gap read measures the CURRENT courses-into-group object against THIS: the persistent empty slot (does a group slot exist with 0 enrolments today? likely not), the two has/no-student states, the head-coach pin, and overbook-with-Private. Then owner rules on the build.

## §4 — OPEN QUESTIONS sent to the customer (2026-09-23, via owner) — answers PENDING, no build until answered
1. Group overbook-with-Private: only when the group is EMPTY, or also on top of enrolled group kids?
2. Group seat cap: keep a cap, or unlimited?
3. Group slot runs forever until an admin closes it (no end date)?
4. An EMPTY group slot: does it BLOCK the coach's time (no other booking), or free the coach?
5. Camp per-coach time: only for the coach's calendar block + pay — not tied to which kids (AM/PM) go with which coach?
6. Cancelled vouchers: move to the BOTTOM + faded (Porter's rec) vs a separate tab/page?

## §5 — CUSTOMER ANSWERS 2026-09-23 (verbatim intent) — requirement LOCKED
1. Private in the group slot: **ONLY when the group has NO students.** With group kids enrolled ⇒ NO Private.
2. Seat cap: **NONE (unlimited kids)** — but must be able to **ADD A COACH to that specific session** when there are many kids.
3. Group slot runs **forever until an admin closes it** (no end date). ✅
4. Empty week ⇒ the coach is **FREE** (can be booked for other work). A group slot with students blocks the coach.
5. Camp per-coach time = the coach's calendar block + pay ONLY; **do NOT tie kids to coaches — just show the kid COUNT** on the block. ✅
6. Cancelled vouchers ⇒ **bottom of the list + faded**, like cancelled courses. ✅
### Porter's derived rules (for Sober to verify, not new asks)
- (1)+(4) are one rule: an EMPTY group slot does not occupy the coach ⇒ a Private (or anything) can be booked then; the moment ≥1 group kid is enrolled for that date, the slot occupies the coach and refuses other bookings (and a Private already there must block enrolment — or conflict — Sober to flag).
- "Overbook" therefore = the empty slot is soft; it is NOT two classes stacked on a busy slot.
- (2) per-DATE extra coach on a group session (exists as add-coach-from-a-date on the series? Sober to confirm per-session).

## §6 — DEFECT: Khwan still sees the OLD rich menu on the demo OA (2026-09-23)
Same OA (SOM-Balance-Demo, sid). Khwan's phone (iOS, Language=EN): OLD blue menu — Check-in · Leave · My children · Add child · Language · Help. Owner's phone (Android, Thai): NEW orange menu — แจ้งลา · เช็คอิน · คอร์สของฉัน · เพิ่มนักเรียน · ภาษา/ช่วยเหลือ · คุยกับแอดมิน. Different BUTTONS, not just colour ⇒ not an image cache.
- Porter hypothesis: rich menus are per-LANGUAGE (and/or per-user linked). The EN menu was never replaced with the new set; Khwan (EN) is linked to it. Alt: her user is individually linked to a stale menu id (the REQ-042 class).
- Discriminating test (asked of the owner/customer): switch Language → Thai. Orange ⇒ stale EN menu; still blue ⇒ stale per-user link.
- **§6 RESOLVED (workaround) 2026-09-23:** owner had Khwan BLOCK then UNBLOCK the OA ⇒ she now gets the new orange menu (unregistered state: เข้าใช้ระบบ / คุยกับแอดมิน). ⇒ cause = a stale PER-USER rich-menu link (REQ-042 class), not a stale EN menu. Sober may still propose a proper relink-on-menu-change fix.

## §7 — DEFECT: the bot IGNORES Khwan's input (only her; owner fine) — 2026-09-23
After the unblock, the bot asks "type your registered phone"; she types 0924912848 at 7:16 ⇒ bot sends the follow greeting + asks again; she types it again at 7:18 ⇒ NO reply. Owner: the bot "often ignores Khwan's commands, many things" — user-specific.
Hypotheses: (a) her number isn't a parent on `sid` (but then the bot should say not-found, not stay silent); (b) a stuck link session / draft for her LINE user swallowing input; (c) her chat switched to manual-chat on the OA manager.
- **§7 narrowed (OA Manager screenshots, owner 2026-09-23):** NOT manual chat (auto-response active). Owner's LINE (Dong_08) is a LINKED parent — commands answer. Khwan's LINE ("kn") was NEVER linked: every text ⇒ the phone prompt; her two phone replies (`0924912848`, 19:16 & 19:18) ⇒ NO reply at all (neither success nor not-found). ⇒ the phone-link step fails SILENTLY; "ignores her commands" is a consequence of never being linked. Suspects: (1) number belongs to a family already linked to another LINE ⇒ a pending link request (REQ-020 approval) created without telling her; (2) number absent/archived on sid but the not-found reply doesn't fire.
- **§7 CORRECTION (2026-09-23 20:11):** Porter's "one digit off (…858)" theory is WRONG. Khwan sent the sid People screen: `0924912848` IS a parent on sid (Pak Nam; children KKTEST · ส้ม · เหมียว · ส้มตำ · ปลาทู) — and KKTEST is Tanya's QA test child, so this is a family shared with QA fixtures. The number IS found, yet the bot is silent ⇒ most likely the family is ALREADY linked to another LINE (QA's demo device), so Khwan's new LINE hits the collision/approval path (REQ-020) which replies nothing to her.
- **§7 ROOT CAUSE — PROVEN by sid log (owner, `pm2 logs som-back`, 2026-09-23):** at 12:16:58Z, 12:18:07Z, 13:07:03Z (= 19:16/19:18/20:07 BKK, exactly her 3 phone entries) the link path ran `update parents set line_user_id=Uf6ca16e9… where id=d8238b86… and line_user_id is null` ⇒ **23505 duplicate key on `parents_line_user_id_uq` — her LINE userId already sits on ANOTHER parent row.** The exception bubbled to `[line-webhook] event error` and was swallowed ⇒ no reply. Data was fine; the family was found. Two defects: (a) linking must handle a LINE id already on another parent (stale legacy `parents.line_user_id`, likely left behind — note the out-log `[family-link] CLEARED parent=d8238b86 … by=line:Uf6ca16e9…` shows her self-clear earlier; the clear path may not null the legacy column on the OTHER row); (b) ANY webhook exception must still reply to the user (generic "system error — contact admin"), never silence.
- Also seen in the same log (separate defects): **outbox `sent=0 failed=N` repeatedly on sid** — pushes failing (suspect: demo OA monthly message quota; explains Tanya's "push-render ceiling"); **camp lookups with id `"undefined"`** (22P02 on camp_weeks / camp_days by id) — a caller passes an undefined id.

## §8 — Customer ruling on the edge (2026-09-23): "สลับครูค่ะ" — SWAP THE COACH
Case: a Private is already booked on an EMPTY group date, then a kid enrolls in the group for that date. Customer: **swap the teacher** — neither refuse the kid nor let one coach teach two classes at once.
- Porter's working default (owner may correct): the enrolment is ALLOWED; the group session for that date is flagged **"coach clash — swap the coach"** and the admin assigns ANOTHER coach to the GROUP session for that date (per-session swap, which exists); the Private keeps its coach. Until swapped, the grid shows the clash visibly — never a silent double-booking.
- **§8 CORRECTED by the customer (2026-09-23 22:54):** "ให้ครูกรุ๊ปสอนกรุ๊ปเหมือนเดิม แล้วสลับไพรเวทออกค่ะ หรือหาครูคนอื่นมาสอนกรุ๊ปแทน." ⇒ **Default: the group coach KEEPS the group; the PRIVATE is moved out** (reassigned to another coach / moved). **Alternative: another coach takes the group session.** Admin chooses either on the clash; the clash stays visible until one is done. Porter's earlier default (swap the group's coach) was the SECONDARY option — superseded.
- **§8.1 OWNER ruling (2026-09-23) — unresolved clash handling (Porter's option):** a clash may stay unresolved (nothing FORCES the admin); BUT (1) it appears on the admin's daily "ต้องจัดการ"/attention list every day until resolved; (2) the coach's messages (daily reminder, weekly digest) show BOTH classes with a "CLASH — awaiting admin" note, so the coach is never surprised on the day; (3) the day-end job never silently resolves it. Model per SPEC-091 §5 (group slot yields its hour; CLASH state; ① move the Private [default] / ② swap the group coach).
- **§9 OWNER rulings 2026-09-24 ("ตามแนะนำ"):** (1) CLASH line bytes APPROVED in English — daily reminder `⚠️ CLASH : awaiting admin`, weekly digest suffix `⚠️ CLASH — awaiting admin` (matches the customer's English appended lines); (2) camp kid COUNT stays on every calendar block (day total, repeats per block — customer asked for it on the block); (3) a cancelled Private leaves the clash card showing "PRIVATE CANCELLED" (one-click resolve), NO auto-clear.
