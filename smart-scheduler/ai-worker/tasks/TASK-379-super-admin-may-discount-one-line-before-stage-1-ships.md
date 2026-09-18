# TASK-379 — A super admin may give a discount: `assertMayDiscount` reads `role !== "admin"` and refuses `"super_admin"` (`REQ-092` Stage 1 defect, found by @Fern) — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**The fact (verified):** `middleware/auth.ts:42` issues `role: "super_admin"` for a super admin; `discount-plan.ts:147` refuses unless `role === "admin"` ⇒ **the bootstrapped first user — the only user on day one, the owner's own account — cannot give a discount.** TASK-377's Decision 3 assumed "every table user is at least admin"; the super admin is not `"admin"`.
**Size XS.** ⛔ Chain stopped. **Ships in Stage 1 — before the deploy note goes.**

## §1 The fix
`assertMayDiscount`: refuse unless `user.isSuperAdmin || user.role === "admin"` — read the capability, not the label (the `AuthUser` context has `isSuperAdmin`). Keep the sentence. 🚫 Do not introduce `action:sales.discount` here — Stage 3 retires this check by the key; this is the one line that keeps today's behaviour true for the super admin.

## Definition of Done
- [ ] Suite, **count** · tsc · 37 = 37 (no migration)
- [ ] Pinned: a super admin discounts · an admin discounts · a `"staff"` role (never issued, kept for the type) is refused · the sentence unchanged
- [ ] 🔑 Break-and-watch (the line back to `!== "admin"` ⇒ the super-admin pin fails), `finally`, CHECKSUM

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **DONE (code) — my defect, one line.** **2295 pass / 0 fail**, 184 files · `tsc --noEmit` clean · 🚫 **no migration (37 = 37)**.

## §2 What I got wrong in TASK-377
Decision 3 said *"every table user is at least `admin`, so `assertMayDiscount` behaves as today"*. False: I made a super admin's `role` `"super_admin"`, and the guard reads the LABEL (`role !== "admin"`). The one user who exists on day one — the bootstrapped super admin, the owner's own account — could not discount. @Fern found it reading the widened type; my Stage 1 pin asserted the old literal was still there, which was exactly the wrong thing to assert.

## §3 What changed
`discount-plan.ts`: `if (!user || !(user.isSuperAdmin || user.role === "admin"))` — **the capability beside the label**; the parameter type gains `isSuperAdmin?`; the sentence byte for byte; the reason in the doc comment. 🚫 No `action:sales.discount` — Stage 3 retires this check by the key.

## §4 Pinned
`discount-plan.test.ts`: a super admin (`role: "super_admin", isSuperAdmin: true`) discounts · the capability ALONE passes (a context with no `role`) · **the label `super_admin` with `isSuperAdmin: false` is refused — the label is not the fact** · the existing admin / staff / unauthenticated / 403 / sentence pins untouched. TASK-377's pin on the old literal → the new one, with the reason.

## §5 🔑 Mutation — four, `finally`, checksum — all bite
A the line back to `role !== "admin"` — the defect as shipped (2 fail) · B the label admitted without the capability (2) · C the guard opened to everyone (3) · D the sentence changed (2). Restores byte-identical.
