# CHECK 2026-11-11: GR round 5 — (B) per-menu permissions, sized for the REAL code · (C) answers to ขวัญ's 3 questions
Sober (SA, Team A), for Porter → owner. Source: `project-docs/customer-2026-11-11-line-som-system/khwan-backoffice-feedback-2026-11-11-VERBATIM.md` (l.8, l.11, l.14, l.17, l.80). Read 2026-11-11 from the working trees on branch `dong` (real build paused; reading only). Counts below are `grep` counts, labelled as such.

## (B) Per-menu permissions in the REAL back office — size + risk
**Her ruling (l.17):** «หลังบ้านต้องทำแยกสิทธิทุกเมนูเหมือนหน้าบ้าน … ปิดเป็นก้อนๆไม่ได้». Example (l.8): Refund for one admin, Type and Category for another.

**Today:** the back office is role-only (CEO / admin / coach).
- BB: ~100 route-guard sites across 14 route files (grep: `adminAuth` ×71, `requireRole(…)` ×~30); the login token carries only `{sub, role, teacherId}` (`routes/auth.ts:32`).
- BF: 30 `PAGE_RULES` (`lib/roles/pages.ts`), gated by `canOpen(role, path)` / `menuFor(role)`; and a start-up assertion that a money page may **never** list admin (`pages.ts:72-73`, the R0.2 rule).
- The FRONT office already has the model she means: REQ-092 / SPEC-079 RBAC — a role is a named set of permission keys (`MENU_KEYS ∪ ACTION_KEYS`), grants read per request (`effectiveGrantKeys`, `smart-scheduler-back/src/services/role.service.ts`), checklist UI. **Plan = port that proven design**, not invent one.

**Size (full "every menu"):**
| Part | Work | Days |
|---|---|---|
| BB | menu-key registry (~30 BO menus + a few action keys, e.g. refund / categories) · `bo.roles` + `bo.role_permissions` + `bo.users.role_id` migration · per-request fail-closed guard (CEO = all) | 1.5 |
| BB | re-guard ~100 route sites, each mapped to the menu it serves, **with a route-level test per guard** (mandatory since the /stock/in escape) · role CRUD + assign endpoints | 3–3.5 |
| BF | PAGE_RULES → menu keys; `canOpen`/`menuFor` read the user's grants from a `/me` read (edits apply at the next request) · Role Setting checklist page (port the front office's) · User Setting role picker · tests | 3–3.5 |
| — | decisions, review, QA | 1 |
| **Total** | | **≈ 9–10 person-days** (~5 working days elapsed with BE + FE in parallel) — far over the 1–2 d free limit → **owner decision** |

**Risk: HIGH.**
1. It rewrites every route guard = the security boundary. A wrong key exposes data or locks a page. Mitigations: fail-closed default, a route test per guard, the front office's proven design.
2. It **reverses R0's "an admin never sees money"** (BF asserts it at start-up; BB money reads are admin-blind by shape). Needs a CEO-only **never-grantable** list — at least salary money, slips/pay totals and Merit (ขวัญ round 3: Merit CEO-only) — and a ruling per money screen on what a granted admin sees (Revenue: yes, per her ask).
3. Login/`me` flow changes from "role in the token" to "grants per request" — small but cross-cutting.

**Cheaper first step (option for the owner):** per-person keys for the **6 REVENUE pages only** (her concrete example), extending round 4's switch: BB 6 revenue route groups + BF 6 pages + User Setting ticks ≈ **2–2.5 d, risk medium** (only revenue money changes). "Every menu" then follows as above. Her l.17 asks for every menu, so this is the owner's choice.

**GR web (demo only):** User Setting gets a per-menu tick list per admin (grouped by menu group), replacing round 4's single Revenue switch; the shell's `canOpen` reads the ticks. No real code.

## (C) Her 3 questions — answers (Porter writes the Thai)
**Q1 (l.11) «ที่เซ็ทค่าคอมแต่ละกรุ๊ปอยู่ตรงไหน เราเป็นคนสร้างและเซ็ทเองถูกไหม»**
Yes — she (the CEO) creates and sets them herself: **Payment Setting → Commission → "Add commission group"** (a name + an amount, e.g. group "100" = 100 ฿); the group then shows by the name she gave it, and each product **picks** its group from a dropdown on the Product page (her l.70–71). *Today's real build:* a product stores only the group name as text and «Add group» has no backend yet (`Settings.tsx:23`, `stock-write.service.ts:4`) — so the dropdown + the group table are part of what's left to build.

**Q2 (l.14) «All Report / REPORTS ตั้งใจจะเสนออะไร ต่างจาก Dashboard ยังไง»**
All Report is **her own six reports from her Excel** (CUSTOMER-ANSWERS l.266–270: รายงาน · สต้อก · เข้าเรียน · คอร์สแยกประเภท · เงินครู · ทะเบียนนักเรียน) on one page as tabs REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT, with detailed lists and Excel export (SPEC-103). The Dashboard ("P&L") is an older **one-glance money summary** — total income vs total expense, CEO only (`DashboardContent.tsx:96-97`). So: Dashboard = the headline numbers; All Report = the detailed reports she works from. If she doesn't need the one-glance P&L, it can be dropped — her call.

**Q3 (l.80) «ที่เรา Add Demo เองอยู่ตรงไหน»**
Today demo stock enters only two ways: the **opening import** and **«Defect Product»** (+qty of an item at a site, with a reason); it can be **moved** between sites and **written off**, and new **sites** can be added (`routes/demo.ts:6-9`, types `MOVE · DEFECT_IN · WRITE_OFF · OPENING`). There is **no "Add Demo" for a new demo item or newly bought demo gear** — her question finds a real gap. Proposal: an **"Add Demo"** button (item + site + qty + reason) on the Stock Demo page — on the GR web now; real build ≈ 0.5 d (one more movement type on the existing route).
