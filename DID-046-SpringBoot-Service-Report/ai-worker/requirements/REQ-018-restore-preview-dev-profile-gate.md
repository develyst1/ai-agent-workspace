# REQ-018: Make the preview dev-gate work on the internal test server, then re-enable it

- Status: DEFERRED (by stakeholder) — re-activate before production
- Priority: HIGH (but **not now** — see Timing)
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: **before any production deploy**

## Context — the gate is OFF on purpose
REQ-004 (DELIVERED) put `@Profile("dev")` on `PreviewController` + a dev-gated `permitAll`, so a
non-dev build does not expose the unauthenticated real-data preview seams (`/a6/db/{id}`,
`/a9/db/{id}`).

The **stakeholder deliberately commented `@Profile("dev")` out** so the build can be deployed for
the **internal team to test**. Their words (Thai): *"ฉันเป็นคน comment ไว้เองแหละ ให้มันขึ้นไปแบบนี้
นั้นแหละ เดี๋ยวเราเทสกันผ่าน เราค่อยมาปิดกลับให้มันซ่อนก็ได้ เพราะฉันเคยลองใช้ config จาก appsetting
บลาๆ แล้ว มันไม่ได้ผล เลยขี้เกียจเสียเวลา แก้แบบนี้ขึ้นไปให้ทีมภายในเทสได้ไง"*

So this is **not an accidental regression** — it is a conscious, temporary trade-off. The team
must NOT "fix" it back while internal testing is running.

## Root problem worth solving (why the gate had to be commented out)
The stakeholder tried to enable the `dev` profile via configuration (application/appsettings-style)
and **it did not take effect**, so commenting the annotation was the pragmatic workaround. If
activating the profile on their deployed instance actually worked, they could keep the security
gate AND let the internal team test.

## Requirement
1. **Investigate why the `dev` profile does not activate** on the stakeholder's deployed instance
   (jar vs `mvnw spring-boot:run`, `SPRING_PROFILES_ACTIVE`, `spring.profiles.active` in the
   packaged config, container/service env, etc.) and provide a **verified, documented way** to run
   that instance with `dev` active — one the stakeholder can apply in one step.
2. Once (1) works and internal testing has passed, **restore `@Profile("dev")`** on
   `PreviewController` and re-verify the REQ-004 two-state proof
   (no `dev` → not served anonymously; `dev` → 200 PDF).
3. The gate **must be active before any production deploy**.

## Acceptance Criteria
- [ ] A documented, tested way to activate the `dev` profile on the stakeholder's deployment.
- [ ] `@Profile("dev")` restored on `PreviewController`; SecurityConfig gate intact.
- [ ] Two-state proof re-demonstrated; internal testers can still reach the preview seams (with
      `dev` on) — their workflow is not broken by re-enabling the gate.

## Timing (IMPORTANT — do not jump the gun)
- **Now:** leave the annotation commented out. Do not restore it; internal testing depends on it.
- **Step 1 can start immediately** — investigating the profile activation does not disturb testing.
- **After internal testing passes:** restore the gate (step 2) — Porter will trigger this.

## Accepted risk while deferred
While deployed with the gate off, **anyone who can reach that instance can download real permit
PDFs (containing applicant PII) with no authentication**, via `/api/v1/preview/checklist/...`.
Acceptable only while the instance is **internal/non-public**.
**CONFIRMED by the stakeholder 2026-08-05: the instance is reachable from INSIDE the organisation
only — not the public internet.** ⇒ risk contained; the deferral stands as planned. If that ever
changes (exposed externally), this REQ becomes immediate.

## Traceability
- Protects REQ-004 (DELIVERED). Flagged by Jason in TASK-008 §Q3; reframed after the stakeholder
  explained the intent.

## Questions
- ~~is the instance internal-only?~~ **ANSWERED 2026-08-05: yes, internal only.**
