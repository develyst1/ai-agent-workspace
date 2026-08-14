# TASK-009: Verify the `dev` profile activates via SPRING_PROFILES_ACTIVE (REQ-018 step 1)

- Source: SPEC-018
- Status: TODO
- Depends on: none

## What to do
Prove the one-step activation works, so the stakeholder can run their deployed instance with the
`dev` profile active (keeping the REQ-004 gate) instead of commenting the annotation out.
**Do NOT restore `@Profile("dev")` yet** — that is REQ-018 step 2, deferred until Porter triggers.
Repo: `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.

1. Boot the app **with** the profile via the env var (mirror how the deployment would):
   `SPRING_PROFILES_ACTIVE=dev ./mvnw -o spring-boot:run`  (or on the packaged jar:
   `SPRING_PROFILES_ACTIVE=dev java -jar target/SpringBoot-Service-Report-*.jar`).
   Use an alt port if `:33000` is busy; don't disturb it.
2. Confirm the startup log shows: `The following 1 profile is active: "dev"`.
3. Boot **without** the env var and confirm that line is **absent** (default/no profile).
4. Report both log lines. (No code change; read-only verification.)

## Definition of Done
- [ ] With `SPRING_PROFILES_ACTIVE=dev`, boot log shows the `dev` profile active.
- [ ] Without it, boot log shows no active profile (default).
- [ ] Both results reported in Implementation Notes. Instance(s) stopped after; `:33000` untouched.

## Implementation Notes
(Jason: the two boot-log lines + the exact command used.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW: verdict + reasons.)
