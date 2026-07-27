# REQ-002: People database — per-person profiles
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder (dev@smartalliance.co.th)
- Deadline: set by stakeholder but intentionally not disclosed

## Problem / Goal
The core of manager-gold: a personal database where a signed-in user records, for
each person they know, how that person thinks and feels — including how they feel
toward the user and how they reason/decide — so the user can later get advice on
how to approach them. Stakeholder's words (Thai, kept as evidence of intent):
"เก็บข้อมูลเกี่ยวกับคน ความคิด ความรู้สึกที่มีต่อเรา วงจรความคิด กระบวนการคิดของเขา
เก็บเป็นคน ๆ เป็นเหมือน database".

## Requirement
The system must let a signed-in user **create, view, edit, and delete "person"
records**. Each person record captures the following (CONFIRMED by the stakeholder
2026-07-26):
1. Basics: name / nickname, relationship to the user (boss / friend / client /
   family / …), role.
2. Their feeling toward the user (positive / negative / neutral + free note),
   trackable over time.
3. Thinking & decision style (reason vs emotion; direct vs indirect; fast vs careful).
4. Communication style that works with them (data/numbers vs stories; formal vs casual).
5. Topics to raise / topics to avoid; what they value; what motivates them.
6. Interaction history: a dated log — "talked about X, outcome, what worked".
7. Free-form tags for search (e.g. "accepts direct feedback", "sensitive about money").

The system must also let the user:
8. See a list of all their people and open any person's full profile.
9. Search / filter people by tag or attribute.
10. Export their own data (backup).

## Acceptance Criteria
- [ ] User can add a person with the agreed fields and see it saved.
- [ ] User can edit and delete a person.
- [ ] User can add multiple dated interaction-log entries to a person.
- [ ] User can search / filter the people list by tag or attribute.
- [ ] User can export their own data.

## Constraints
- Depends on REQ-001 (all data is per-user and private).
- FE Next.js + Mantine; BE Bun + Hono. Data store is the SA Lead's decision
  (backend repo `.gitignore` hints at SQLite — not a mandate).

## Out of Scope
- AI-generated advice and note-summarization (that is REQ-003).
- Relationship graph / how people relate to each other (possible later REQ).

## Questions
> PM note: the 7 field groups were confirmed by the stakeholder on 2026-07-26.
  (SA Lead asks further questions here; PM answers as `> answer: ...`)
