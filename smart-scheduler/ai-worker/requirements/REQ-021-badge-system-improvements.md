# REQ-021: Badge/tagging system — fix the gaps found in the 2026-07-31 audit
- Status: BACKLOG (**LOWEST priority — parked by the stakeholder 2026-07-31: "ลูกค้าไม่รีบใช้"**)
- Priority: LOW
- Requested: 2026-07-31 by stakeholder (คุณฟีน) — she asked for a weakness review of the badge system
- Deadline: none
- Source: Porter's read-only audit 2026-07-31. **Do not start without the stakeholder raising it.**

## Why this exists
Badges are the customer's intended **general-purpose tagging mechanism** — today used for sample `สาขา` /
`จังหวัด`, and meant later for things like **onsite vs online**, or any category she wants to **count and see
totals by**. She asked what's weak in it. This REQ records the findings so the audit doesn't have to be redone.

She has explicitly **parked it as last priority**. It is written up now purely so the analysis isn't lost.

## Findings (prioritized; evidence captured 2026-07-31 against the then-current code)

### 🟢 Cheap wins — the backend already supports these, only the UI is missing
1. **No rename / recolor / reorder in the UI.** `PATCH /badges/types/:id` and `/badges/values/:id` already accept
   `name`, `label`, `color` and `sortOrder`, but the Badges screen renders the name as plain text and never sends
   `sortOrder`. **A typo'd badge name or wrong colour is permanent today**, and ordering is effectively random
   (everything is `sortOrder = 0`, so it falls back to creation time).
2. **🐛 Deactivating a value freezes badge editing on every booking that uses it.** The booking modal lists only
   *active* values, so a deactivated one renders as an empty picker but its id is still submitted → the API
   rejects the whole update (400). Net effect: **the only removal path we have (deactivate) breaks editing** on
   exactly the bookings it touches. This is a genuine defect, not a missing feature.
   - Related: an inactive type disappears from the editor but its chip **still shows on the calendar**, with no
     way to remove it.
3. **Course packages can't be badged at registration.** Registering a 4/6/10-session course generates all its
   bookings with **no badge**, so staff must open and tag each session individually; auto-extension sessions also
   lose the badge their parent had. For a tag meant to drive reporting, this is where completeness dies in practice.

### 🟡 Reporting integrity — the numbers look authoritative but silently aren't
4. **No "untagged" bucket.** The badge report inner-joins on the tag link, so **bookings with no badge simply
   vanish from the totals**. Combined with badges being optional and never required, the customer can see
   "onsite 40 / online 25" without ever learning there were another 80 untagged. **Wrong decisions, confidently
   presented** — this is the one I'd fix first if the ranking were mine.
5. **No real badge filtering.** The calendar's badge filter is **client-side over the already-loaded day/week**,
   and the bookings list has no badge filter at all. "Show me all onsite bookings this quarter" is unanswerable.
6. **Renaming a value rewrites history.** Labels are referenced, not snapshotted, so renaming "สาขา A" → "สาขา B"
   changes what *past* bookings appear to have been tagged as. No effective-dating, no audit trail.
7. Missing report basics: totals/percentages, cross-tab of two badge types (branch × channel), month-over-month
   trend, export.

### 🔴 Structural — these two are why the customer's bigger idea doesn't work yet
8. **There are TWO independent tagging systems that share nothing.** The frontoffice has badges (on **bookings**);
   the backoffice has its own tag groups/values (on **`bo` items**, built in REQ-006). Different tables, APIs,
   screens and databases-of-record; **the same rule re-implemented twice**. A "สาขา" created in one is invisible
   in the other, so it will be created twice and drift. This is precisely the "one flexible tagging mechanism"
   the customer described — built twice, incompatibly.
9. **Badges can never show money.** The frontoffice has **no price field at all**; revenue is posted into the
   backoffice movement ledger, which has **no badge/tag link**. So **"revenue by branch / onsite vs online" is
   structurally impossible**, not merely unbuilt — and that is exactly what "อยากดูยอด" implies.
   ⇒ **This overlaps REQ-014** (revenue by activity). If both are ever done, they should be designed together.

### Smaller notes
10. Duplicate type/value names are accepted (no unique constraint) and there is no merge operation — duplicates
    are permanent and show as separate rows in the report.
11. No limits/pagination/search: the booking modal renders **one picker per active badge type**, so past roughly
    4–6 types the booking form and the calendar chips degrade. Nothing warns.
12. Badges attach to **bookings only** — not students, teachers, courses or vouchers. "Which branch does this
    student/teacher belong to" cannot be asked.
13. A schema trap for any future delete: the link table cascades on badge **type** but restricts on badge
    **value**, so a type delete would silently strip history while the value delete is blocked.
14. Backoffice tags are **create-only** — they have an `active` column but no update route and no toggle, so
    they're strictly worse off than frontoffice badges.

## Suggested shape if/when this is picked up
- **Phase 1 (small, immediate value):** #1 rename/recolor/reorder UI · #2 the deactivate defect · #3 badge on
  course registration.
- **Phase 2:** #4 untagged bucket + totals · #5 real server-side badge filtering.
- **Phase 3 (decide, don't drift into it):** #8 unify the two tagging systems and #9 the money dimension —
  **these are architectural and should be decided alongside REQ-014**, not bolted on.

## Questions
(For when this is un-parked. Porter answers as `> answer: ...`; business calls → `@Porter`.)
- Should badges become **required** for some types (e.g. a mandatory "channel" tag), or stay fully optional and
  accept an untagged bucket in reporting?
- Is a **hard delete** actually wanted, or is a working **deactivate** (with the defect fixed) enough?
- Should badges extend beyond bookings (students / teachers) — that's what makes "which branch is this student"
  answerable?

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-021 | Badge/tagging system — gaps from the 2026-07-31 audit | **LOW** | 🅿️ **BACKLOG — parked, LOWEST priority** | **Do not start** — stakeholder 2026-07-31: "ลูกค้าไม่รีบใช้". Written up only so the audit isn't redone. Findings: 🟢 **rename/recolor/reorder have no UI** though the API already supports them (a typo'd badge is permanent) · 🐛 **deactivating a value freezes badge editing on every booking using it** (400) — our only removal path is defective · 🟢 course registration can't badge its generated sessions. 🟡 the report **silently drops untagged bookings** (numbers look authoritative but exclude the untagged pile) · no real server-side badge filter · renaming rewrites history. 🔴 **TWO independent tagging systems** (FO badges on bookings vs BO `bo` tags on items — same idea built twice, invisible to each other) and **badges can never show money** (no price in FO; the money ledger has no tag link) ⇒ **"revenue by branch / onsite-vs-online" is structurally impossible** — decide together with **REQ-014**, not separately. |
```
