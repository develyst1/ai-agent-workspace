# REQ-047: Leave closes 3 hours before the session — and the school can change that number
- Status: READY_FOR_SA
- Priority: **MEDIUM–HIGH** — it is a commercial rule the school is actively deciding right now
- Requested: 2026-08-16 by stakeholder (owner), from a customer meeting
- Deadline: none stated
- Source: owner, 2026-08-16 — *"และการลาได้ไม่เกินสามชั่วโมงก่อนถึงเวลาเท่านั้น (ควรมีในการตั้งค่า)"*

## Problem / Goal
A leave taken minutes before a session still costs the school the slot and the coach. The customer's rule:
**a session can be cancelled up to 3 hours before it starts; after that it is too late.** The owner explicitly
wants the **number to be a setting**, not a constant an engineer has to redeploy.

⚠️ **A notice rule already exists and it is not 3 hours.** REQ-031 recorded `lib/leave-notice.ts` as
**FT/PT ≥ 1 h · freelance ≥ 2 h** — i.e. today's cut-off **depends on the teacher's employment type**. So this REQ
is a **change to a live rule**, not a new field, and the first thing to settle is whether the customer's "3 hours"
replaces that split or sits on top of it. See Q1 — I am not guessing.

## Requirement
1. **Taking leave is refused once the session is within the cut-off**, with a reason that states the rule.
2. **The cut-off is an editable setting — one value per teacher type** (full/part-time · freelance, matching
   today's `lib/leave-notice.ts` shape), changed by staff on the settings screen (REQ-031's mechanism), **never by
   an engineer and never by SQL against production**. *(Owner's decision, Q1 below.)*
3. **The rule is enforced server-side**, so LINE, the staff screens, and anything future all obey it — a client
   that forgets to check cannot create a late leave.
4. **Staff may still cancel a late session** as an administrative action (with the usual consequences); the cut-off
   governs the **parent/self-service** path. Staff are accountable people, not the abuse case this rule targets.
5. Changing the setting **takes effect immediately** for later leaves and **never rewrites leaves already taken**.

## Acceptance Criteria
- [ ] **AC-1** — **Given** the cut-off is 3 hours and a session at 10:00, **When** a parent tries to take leave at
      07:30, **Then** it is **refused** with the wording below and the session is unchanged.
- [ ] **AC-2** — **Given** the same session, **When** the parent takes leave at 06:30, **Then** it succeeds and
      behaves exactly like any planned leave today (re-owed, plan extends).
- [ ] **AC-3 (boundary)** — Exactly **3 hours before** (07:00 for a 10:00 session) is **allowed** — the rule is
      "at least 3 hours", and the boundary is stated, not left to whoever writes the comparison.
- [ ] **AC-4 (the setting)** — **Given** staff change the cut-off to 6 hours on the settings screen, **When** a
      parent tries to take leave 4 hours ahead, **Then** it is refused — with **no deploy and no SQL**.
- [ ] **AC-5 (staff path)** — **Given** a session 30 minutes away, **When** staff cancel it from the admin screens,
      **Then** it is allowed (requirement 4).
- [ ] **AC-6 (regression)** — Leaves already recorded before the change are untouched; quota, extension and
      re-owing are unaffected by this REQ.
- [ ] **AC-7 (bilingual)** — The refusal reads correctly in TH and EN, with the **actual configured number** in it,
      not a hardcoded "3".

## User-facing wording (Porter as UX writer)
- Refusal (LINE + web) — TH: `ขออภัยค่ะ ลาได้ล่วงหน้าอย่างน้อย {n} ชั่วโมงก่อนเริ่มคาบ คาบนี้เริ่ม {time} น. หากจำเป็น กรุณาติดต่อแอดมิน`
  · EN: `Sorry — leave must be at least {n} hours before the session. This one starts at {time}. Please contact the admin if you need help.`
- Settings screen label — TH: `แจ้งลาล่วงหน้าอย่างน้อย (ชั่วโมง)` · EN: `Minimum leave notice (hours)`
- Settings help text — TH: `ผู้ปกครองแจ้งลาเองได้จนถึง {n} ชั่วโมงก่อนคาบเริ่ม หลังจากนั้นต้องให้แอดมินทำให้` ·
  EN: `Parents can take leave themselves until {n} hours before the session; after that only an admin can.`

## Constraints
- Built on **REQ-031's** settings mechanism + screen — do not invent a second settings system. If REQ-031's screen
  is not shipped, this REQ's requirement 2 is not met by a DB row alone (REQ-031 says so explicitly, and it is
  right).
- Server-side enforcement is not optional (requirement 3).

## Out of Scope
- Which session a leave applies to (**REQ-046**).
- Quota and extension rules (REQ-030).
- Charging for late cancellations — a money rule nobody has asked for; if the customer wants it, it is its own REQ.

## Questions
- **Q1 (to owner — the load-bearing one):** does 3 h replace both, or stay per teacher type?
  > **answer (owner, 2026-08-16): keep it PER TEACHER TYPE, as it is today** — *"เอาเป็น setting ครู เหมือนเดิมก็ได้"*.
  > So the shape is **not** one school-wide number: the existing per-type rule stays, and what changes is that the
  > **values become editable settings** instead of constants in the code. My "one number" lean is overruled, and
  > that is fine — his staff already think in terms of ครูประจำ vs ฟรีแลนซ์.
  > **⇒ Requirement 2 is now: one editable value per teacher type** (full/part-time · freelance), each enforced
  > server-side, each shown on REQ-031's settings screen. Every AC below reads **"the configured cut-off for that
  > session's teacher type"**, not a literal 3.
  > **Assumption Porter is proceeding on (say if it's wrong — it is a one-line change, so I am not blocking on
  > it):** the customer asked for **3 hours**, so the **defaults become 3 h for both types** (up from 1 h / 2 h),
  > with staff free to set them apart afterwards. The alternative reading — keep 1 h / 2 h and merely make them
  > editable — would mean the customer's actual request ships unmet, which is why I did not choose it silently.
- **Q2 (to owner):** does the cut-off apply to **planned absences declared far in advance** as well? (Porter's
  lean: irrelevant by definition — a planned absence is days ahead — but if someone marks one for tonight, it is
  the same act as a late leave and should be refused the same way.)
  > answer: _pending_
- **Q3 (to SA):** are there other places that cancel a session (bulk actions, the LINE postback path, admin bulk
  screens) that would bypass a client-side check? Name them, so requirement 3 is verifiable rather than hoped for.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-047 | Leave closes **3 h** before the session — and the number is an editable **setting** (REQ-031 mechanism + screen) | **MEDIUM–HIGH** | **IN_SPEC → SPEC-048 · TASK-146 (BE) + TASK-147 (FE dict) (Sober 2026-08-17)** — **2 number settings** `leave_cutoff_hours_fulltime` (FT+PT) + `_freelance`, default **3h**, `intInRange(0,72)`; add `"hours"` to the unit union; `leave-notice.ts` → pure comparator; both enforcement sites (`:1579` mark-absence · `:1820` sick-leave) resolve via `getSetting(key,tx)` inside the `!override` guard; bilingual message w/ `{n}`+`{time}`. **Q3 answered: exactly 2 server-side sites enforce it** (both parent paths incl. LINE), admin bulk = the override (exempt) → requirement 3 verifiable. Same sick-leave block as TASK-136 — merge touchpoint. — _prior:_ **@Sober — please pick up REQ-047.** ⚠️ **This CHANGES a live rule, it is not a new field:** REQ-031 recorded `lib/leave-notice.ts` as **FT/PT ≥1h · freelance ≥2h** — today's cut-off depends on the teacher's employment type. **Q1 to the owner (asked):** does 3 h **replace** that split with one school-wide number (Porter's lean — a rule everyone can say out loud), or stay per-type? Enforcement must be **server-side** (Q3: name every path that cancels a session, so "no bypass" is verifiable), staff keep an admin override (the rule targets self-service, not accountable people), and per REQ-031 a DB row **without its settings screen does not satisfy "editable"**. ✅ **OWNER ANSWERED 2026-08-16 — keep it PER TEACHER TYPE** (*"เอาเป็น setting ครู เหมือนเดิมก็ได้"*) ⇒ **not** one school-wide number; Porter's lean overruled. Requirement 2 is now **one editable value per teacher type** (FT/PT · freelance), each enforced server-side, both on REQ-031's screen; every AC reads "the configured cut-off **for that session's teacher type**", never a literal 3. **Porter's stated assumption (not blocking, one line to change): defaults become 3 h for BOTH types** — the alternative (keep 1 h/2 h, merely editable) would ship the customer's actual request unmet, so it was not chosen silently. |
```
