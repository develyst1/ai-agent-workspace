# SPEC-084 — `REQ-098` Archive a PARENT (the leftover duplicate) — feasibility read + sizes (Sober, 2026-09-19) — NOT cut

**The ask (Porter):** a duplicate leftover parent row (a family re-registered with a new phone) cannot be removed; suspend still lists it. Extend REQ-093's archive to parents: hidden from every parent read, history + ledger kept, restorable, archivable only when no live future sessions.

## §0 What exists (the read)
1. **Suspend** (`parents.suspended_at`, `lib/suspend.ts`, 5 + 4 + 3 + 1 sites): blocks the bot and NEW bookings for the household, students drop out of the booking picker, entitlements untouched — **and the row stays listed everywhere** (by design, REQ-0xx: "suspended, not gone"). It is a state, not a hiding.
2. **REQ-093's archive shape is reusable one-for-one:** `students.archived_at/by` (0039), `assertStudentActive` at the create sites, `archivedIds()` excluded from every working read, `archivedStudents` on the parent detail, the People page's `archived=true` restore view, key `action:people.student-archive`. The parent needs the same four things: two columns, one `assertParentActive`, the exclusions, a restore view.
3. **Two uniques that decide the edge cases:** `parents_phone_uq` and `parents_line_user_id_uq`. A leftover row still OWNS its phone and (often) the family's LINE id — hiding it does not free them. ⚠ §3.1 / §3.2.
4. **Every parent read that would need the exclusion (the bite points, from the code):** the People list + search (`parent.service.ts`, 3 sites) · the parent detail (by id: archived ⇒ 404 unless `?archived`) · the student pickers (already exclude archived STUDENTS — a cascade covers them, §3.3) · the LINE registration / phone lookup (`line-register.service.ts`) · the webhook's parent resolution by `line_user_id` (`line-webhook.service.ts`) · **`familyLineUserIdsBulk`** (every notice: an archived parent's devices must not be messaged) · the attention queries · the SOM report's family counts. ~8 sites; ONE `activeParents` predicate, pinned by source as REQ-093 did.

## §1 The design
- **`0045_parent_archive`:** `parents.archived_at timestamptz NULL`, `archived_by text NULL` (catalog-only; witness = `archived_by`).
- **`POST /parents/:id/archive`** (key `action:people.parent-archive`, 56th) — refused with the count when ANY of its students has a live future session (`409 PARENT_HAS_SESSIONS`); **cascades**: every non-archived student of the parent is archived in the same tx with `archived_by = "parent:<id>"` (§3.3); **clears `line_user_id`** so the family's LINE can re-link to the surviving row (§3.2) — the cleared id is kept in `archived_line_user_id` for the audit (a third column) or in the note; the phone stays (§3.1). `POST /parents/:id/unarchive` restores the parent AND the students the same act archived (by the `archived_by` marker), never a student archived on its own.
- **Reads:** the ONE predicate at the ~8 sites; the People page gains the parents' restore view (the students' shape); the parent detail shows `archivedAt` + a `Restore` door.
- **Guards:** `assertParentActive` at the household create sites (a new student under an archived parent, a booking for its student — the student guard already refuses by the cascade), the LINE link (an archived parent cannot be re-linked — restore first).

## §2 Sizes
**BE S+ (one migration, ~8 bite points, the cascade, two routes, the LINE clear) · FE S** (archive/restore doors on the parent detail, the restore view on People, the archived badge). Ships alone or with the next batch; `db:migrate` ⇒ 46.

## §3 Decisions for the OWNER
1. **The phone:** an archived parent keeps its phone (unique stays) — a re-registration with the OLD phone is refused until the row is restored or the phone edited. *Recommend: keep* (history is truthful); the leftover's phone is the old one by definition.
2. **The LINE id:** archiving CLEARS the leftover's `line_user_id` so the family's LINE can link to the surviving row (else the bot keeps answering as the ghost). *Recommend: clear, keep a copy for the audit.*
3. **Cascade to students:** archiving a parent archives its students (recommend — a hidden parent with visible students is a half-state); restoring restores only those the same act archived.
4. **Suspend vs archive:** a suspended parent may also be archived (recommend yes — suspend is a state, archive a hiding); archive does not clear the suspension.
5. **Ledger/money:** untouched — a posted sale keeps its `refId`; the backoffice is not told (the REQ-093 rule).

## §4 Non-goals
No merge of two parents (REQ-093's option c stays listed); no hard delete; no change to suspend.
