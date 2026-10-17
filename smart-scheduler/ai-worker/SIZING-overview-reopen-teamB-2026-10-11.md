# SIZING — re-open OVERVIEW behind `menu:overview`, super admin only — @Silver, 2026-10-11
Source: owner, verbatim (via Porter): *"ช่วยเปิด Overview กลับมา แล้วใส่เป็นสิทธิ์ เหมือนเมนูอื่นๆ แล้ว ใส่ให้แค่ superadmin ก่อน"* · read-only analysis of front `2db1c57` / back `a2185b2`.

## 🔴 The finding that changes the job: **Overview has NO data. Every number on it is generated.**
- `useOverview` makes **no API call**: `useMemo(() => buildOverview(scope))` (front `src/hooks/scheduler/useOverview.ts:234-235`).
- The file says so itself (`:3-5`): *"PLACEHOLDER data source … Generates plausible, scope-scaled numbers so the UI renders and can be reviewed before the backend endpoint exists."*
- `buildOverview` (`:79`) fills every widget (the trend, KPIs, badges, teacher workload, registrations, demographics, customer spend) from a seeded random generator (`rng`, `:21`).
- ⇒ **Re-opening it as asked shows a super admin made-up figures that look real.** The same date range always gives the same "numbers", which makes them look even more real.
- ⇒ **Porter's Q3 ("is the back route guarded by `menu:overview`?") has no subject: the page calls no route.** There is nothing on the back to guard yet.

## What IS true and ready
1. **The gate already exists on both the nav and the page.**
   - The nav shows a `menuKey` item only by grant, and a super admin holds every grant (`AdminLayout.config.ts:121-131`; back `permissions.ts:38`).
   - **The page URL is ALREADY guarded today:** `navItemForPath` searches the hidden items too (`:138-139`), and `MenuGuard.tsx:31` asks `mayOpen`. ⇒ A super admin can open `/scheduler/overview` by typing it right now; an admin without the grant cannot.
2. **The nav move is XS:**
   - move the `overview` entry from `HIDDEN_NAV_ITEMS` to `NAV_ITEMS` (`:163-171`);
   - the pin `menu-guard.test.ts:58` (`["dashboard","overview"]`) moves with it;
   - no new words (`nav.overview` exists);
   - gate it by `menuKey` (grantable later, "like other menus"), **NOT** `superAdminOnly`.
3. **No migration grants `menu:overview`** (`grep` of `drizzle/`: none). Grants are DATA, rows in `role_permissions` / `user_permissions` (`0037_roles.sql:56`, `0036_users.sql:53`), set from the Users screen.
   - ⇒ "Only super admin" holds **iff no role or user row holds it**. That is a DATA REQUEST (below), not code.

## ▶️ The owner's decision: what should Overview SHOW?
| | option | size | note |
|---|---|---|---|
| **A** | Re-open as it is (placeholder numbers) | XS | 🔴 Not recommended: fake figures that look real, to anyone holding the key. |
| **B** | Re-open with a visible "sample data" notice | XS + **owner words** | Honest; fits "review the screen in the meeting". |
| **C** | Re-open only the widgets that have a REAL source today (e.g. booked / attended from the Daily report's one counter, TASK-723) | M | The owner picks the widgets. |
| **D** | Build the real `GET /overview` (back, gated `menu:overview`) and swap `buildOverview` for it | **L** (≈ a week: about 8 widget families, each its own query) | The only way every number is real. |
- **Recommended:** ask what he wants Overview FOR. If it is for his meeting (to look at the screen), **B**. If it is for real figures in this final round, **C**, sized widget by widget. **D** does not fit this round.

## DATA REQUEST — bare SQL, read-only (for the owner to run on uat; sid too if wanted)
```sql
SELECT r.name AS role, rp.key FROM role_permissions rp JOIN roles r ON r.id = rp.role_id WHERE rp.key = 'menu:overview';
SELECT u.username, up.key FROM user_permissions up JOIN users u ON u.id = up.user_id WHERE up.key = 'menu:overview';
SELECT username, display_name FROM users WHERE is_super_admin = true AND disabled_at IS NULL;
```
- Rows from 1 or 2 ⇒ those holders see Overview when it re-opens; remove them from the Users screen (no SQL write needed).
- Query 3 = who "super admin" actually is on uat. If the customer's own staff are super admins, they see whatever Overview shows (see A–D).

## Reproduce first (for Tanya, sid)
- **OLD build:** Overview is absent from the nav for super admin AND admin. ⚠️ But a super admin CAN open `/scheduler/overview` by URL today, and sees the placeholder numbers: record that as a finding.
- **NEW build:** in the nav for super admin; absent for an admin without the grant, and the URL is refused for them by the page guard.
  - **No API to refuse:** the page calls none. If C or D is chosen, the new route's 403 for an admin is the API check.

## 🚫 CANCELLED 2026-10-11 — handed to Palm (owner: the Dashboard + Overview are Palm's). No TASK was cut. This file is kept as a record of the finding (the page's data is a placeholder).
