# REQ-098 — Archive a PARENT (leftover duplicate phone) — 2026-09-19

**Source:** customer via owner, 2026-09-19 (follow-on to REQ-093). **Status: DISCUSSION — PM proposal + owner confirm; Sober read. Nothing dispatched.**
> ถึงจะจัดเก็บนักเรียนไปได้ แต่การที่พ่อแม่ใช้อีกเบอร์สร้างเข้ามา มันทำให้กลายเป็น 2 เบอร์ ทีนี้เรามีปุ่มลบ/จัดเก็บนักเรียน แต่ไม่มีที่ลบเบอร์ ทำให้เบอร์ที่ไม่ใช้ค้างอยู่ เรามีวิธีแก้อย่างไร

## §1 — the gap
REQ-093 archives a STUDENT. But when a family re-registers on a NEW phone, a duplicate PARENT record is created; there is no way to remove/hide the leftover parent. Today a parent can only be SUSPENDED — and a suspended parent is STILL LISTED (SYSTEM-FACTS: "a parent only suspended, both still listed"), so the clutter remains.

## §2 — PM proposal (extend REQ-093's archive one level up)
**Archive a PARENT** — hide it (and its students) from every working list/picker/search; history + ledger kept; un-archive restores; NO hard delete (history/money). Archivable when the parent has no LIVE future sessions (like the student rule). Mirrors REQ-093 exactly at the parent level.

## §3 — read from @Sober
What does parent SUSPEND do today (flag only? still listed? blocks anything)? Is a parent ARCHIVE (a `parents.archived_at`, hidden from every parent read incl. LINE/registration lookups + pickers) feasible, and should archiving a parent CASCADE-archive its students? Where must the scope bite? Reuse REQ-093's shape? Size it.

## §4 — owner
Confirm archive-parent (mirrors student archive). Customer reply drafted (archive parent hides the leftover phone + its children from lists, history kept, restorable).

## §5 — @Sober read (SPEC-084): archive fits REQ-093's shape
Suspend is a STATE (bot + new bookings blocked, still listed); archive HIDES. `parents.archived_at/by` (migration `0045`), one `activeParents` predicate at ~8 reads incl. LINE lookups + `familyLineUserIdsBulk` (a ghost is never messaged), a restore view, key 56. Recommended edges: KEEP the phone (history); **CLEAR the LINE id on archive** (so the family can re-link to the surviving row); **CASCADE** to its students (restore restores only those); suspend + archive coexist. BE S+ · FE S. Five §3 decisions pending owner.

## §6 — OWNER 2026-09-19: GO, as Sober recommended ("ถ้าคิดมาดีแล้วจริงๆ เอาตามนั้น")
Build archive-parent per SPEC-084: `parents.archived_at/by` (mig 0045), hidden from all active-parent reads incl. LINE lookups + `familyLineUserIdsBulk`, restore view, key 56; KEEP the phone; CLEAR the LINE id on archive (family re-links to the surviving row); CASCADE-archive its students (restore restores only those); coexist with suspend.

## §7 — OWNER 2026-09-20: phone-archived bot reply APPROVED
"เบอร์นี้เคยลงทะเบียนไว้แล้ว กรุณาติดต่อร้านเพื่อคืนสถานะ" / "This number was registered before — please contact the shop to restore it." Admin path: `PARENT_ARCHIVED — restore instead`. §disable-frees-link: still open (list), not blocking.
