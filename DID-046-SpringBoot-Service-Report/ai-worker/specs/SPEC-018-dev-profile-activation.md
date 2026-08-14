# SPEC-018: Make the `dev` profile actually activate on a deployment (REQ-018 step 1)

- Source: REQ-018 (step 1 only — step 2 "restore the gate" is DEFERRED until Porter triggers)
- Status: ACTIVE (investigation) — gate stays OFF meanwhile (deliberate, internal-only, per REQ-018)

## Root cause — why the `dev` profile didn't take effect
The `dev` profile was only ever wired for **local `mvn spring-boot:run`**, never for a packaged/
deployed jar:
- `pom.xml` → `spring-boot-maven-plugin` has `<configuration><profiles><profile>dev</profile></profiles>`.
  **This applies ONLY to the plugin's `run` goal** (`mvn spring-boot:run`). It is **NOT baked into the
  built jar** and has **no effect** on `java -jar ...` or a container/service start.
- `application.yml` has **no `spring.profiles.active`**. So a packaged jar boots with the **default
  (no) profile** → `@Profile("dev")` beans are absent → the preview gate is closed on the deployment.
- ⇒ The stakeholder's deployed build ran with no `dev` profile; with the gate ON that meant the
  preview seams 404/401'd, so they commented `@Profile("dev")` out to let internal testers in. The
  "config from appsettings didn't work" = they edited config but the jar still had no active profile.

**Nothing is wrong with the annotation or SecurityConfig** — the profile just was never activated at
runtime on the deployment. Fix = activate it at run time (below), NOT change the code.

## The one-step activation (pick the one matching how they deploy)
Any ONE of these makes `dev` active on the deployed instance (no code change):
1. **CLI flag** (running the jar directly):
   `java -jar SpringBoot-Service-Report.jar --spring.profiles.active=dev`
2. **Environment variable** (jar, systemd service, Docker, most CI/CD — the most portable):
   `SPRING_PROFILES_ACTIVE=dev`  (set in the service/container env, then start normally)
3. **JVM property**: `java -Dspring.profiles.active=dev -jar SpringBoot-Service-Report.jar`

**Recommend #2 (`SPRING_PROFILES_ACTIVE=dev`)** — it survives repackaging and works the same for a
bare jar, a Windows service, or a container. Whoever owns the deploy sets it once.

> Do NOT put `spring.profiles.active: dev` in `application.yml` — that would make `dev` the default
> **everywhere including production**, defeating the fail-closed gate. Keep it a per-instance runtime flag.

## Verify it activated (TASK-009 — BE, read-only)
On boot, Spring logs `The following 1 profile is active: "dev"`. Confirm that line appears when started
with the flag/env, and is **absent** without it. (This is the "tested way" REQ-018 AC #1 asks for.)

## Step 2 (DEFERRED — do NOT do now; Porter triggers after internal testing)
Once #2 works on their instance and internal testing passes: **restore `@Profile("dev")` on
`PreviewController`** and un-comment the SecurityConfig dev-gate (`if (environment.acceptsProfiles(
Profiles.of("dev"))) auth.requestMatchers("/api/v1/preview/**").permitAll();`), then re-run the REQ-004
two-state proof (no dev → not served anonymously; dev → 200). That is a separate TASK when triggered.

## Deliverable to the stakeholder (via Porter)
The one-line activation (`SPRING_PROFILES_ACTIVE=dev`) + the root-cause note above, so they can keep
the security gate AND let internal testers in — no need to comment the annotation out anymore, once
they set the env var on the instance.

## Tasks
- TASK-009: BE verifies `dev` activates via `SPRING_PROFILES_ACTIVE=dev` (boot log shows the profile).
  Step 2 (restore gate) is NOT tasked yet — deferred.

## Questions
- **@Porter:** how is the stakeholder's internal instance started (bare `java -jar`, a Windows
  service, or a container)? That picks the exact place to set `SPRING_PROFILES_ACTIVE=dev`. Not a
  blocker for the recommendation, but lets me give them the precise one-liner.
