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
2. **The cut-off is an editable setting**, changed by staff on the settings screen (REQ-031's mechanism), **never
   by an engineer and never by SQL against production**.
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
- **Q1 (to owner — the load-bearing one):** today the notice period **depends on the teacher**: full/part-time
  **1 h**, freelance **2 h**. Does the customer's **3 hours replace both** with a single school-wide number
  (Porter's lean — one rule everyone can state out loud), or should it stay **per teacher type** with 3 h as the
  new default for some of them?
  > answer: _pending_
- **Q2 (to owner):** does the cut-off apply to **planned absences declared far in advance** as well? (Porter's
  lean: irrelevant by definition — a planned absence is days ahead — but if someone marks one for tonight, it is
  the same act as a late leave and should be refused the same way.)
  > answer: _pending_
- **Q3 (to SA):** are there other places that cancel a session (bulk actions, the LINE postback path, admin bulk
  screens) that would bypass a client-side check? Name them, so requirement 3 is verifiable rather than hoped for.
