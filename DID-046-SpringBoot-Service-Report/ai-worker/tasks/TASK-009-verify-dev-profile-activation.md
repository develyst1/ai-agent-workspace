# TASK-009: Verify the `dev` profile activates via SPRING_PROFILES_ACTIVE (REQ-018 step 1)

- Source: SPEC-018
- Status: REVIEW
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
Verified against the **packaged jar** (`java -jar`) — the real deployment path — not `mvn
spring-boot:run` (whose pom `<profiles>dev</profile>` would always force dev and mask the "without"
case). Built `./mvnw -o -DskipTests package`, ran from the project root (where `application.yml` lives).

**Two boot-log lines (DoD):**
- **WITH** `SPRING_PROFILES_ACTIVE=dev java -jar target/SpringBoot-Service-Report-0.0.1-SNAPSHOT.jar --server.port=33094`
  → `The following 1 profile is active: "dev"` + `Started SpringBootServiceReportApplication in 7.687s`. ✅
- **WITHOUT** (`java -jar … --server.port=33093`, no env)
  → `No active profile set, falling back to 1 default profile: "default"` + `Started … in 7.674s`. ✅
- Both instances stopped after; `:33000` untouched. `--spring.profiles.active=dev` (CLI) behaves the
  same as the env var (both are standard Spring activation).

**⚠️ Deployment caveat found (worth relaying to Porter/stakeholder):** `application.yml` is at the
**project root, not `src/main/resources`**, so it is **NOT bundled in the jar**. The jar only reads it
via Spring's default `optional:file:./` location — i.e. it must sit in the **working directory** where
the jar is launched. When I first (accidentally) launched from a different cwd, boot failed with
`Could not resolve placeholder 'external.urls.base'` (config not found) — unrelated to the profile. So
the stakeholder's one-liner is: set `SPRING_PROFILES_ACTIVE=dev` **and** start the jar from (or point
`--spring.config.location=` at) the directory holding `application.yml`. With that, `dev` activates
cleanly (proven above).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-05). Both DoD boot-log lines delivered, and — better than my TASK
asked — verified on the **packaged jar** (the real deploy path), not `spring-boot:run` (whose pom
`<profiles>dev` would mask the "without" case). WITH `SPRING_PROFILES_ACTIVE=dev` → "profile is active:
dev"; WITHOUT → "default". ✅
- **Bonus finding confirmed by me:** `application.yml` is at the **project root**, and there is **no**
  `src/main/resources/application.yml` → it is **NOT bundled in the jar**; the jar reads it from the
  working directory (`optional:file:./`). It also has an `external:` block whose placeholders (e.g.
  `external.urls.base`) fail the boot if the config isn't found. So Jason's caveat is correct and
  important. Folded into SPEC-018.
- REQ-018 **step 1 = DONE** (a tested, documented activation). Step 2 (restore `@Profile("dev")` +
  re-verify the two-state proof) stays DEFERRED until Porter triggers after internal testing.
