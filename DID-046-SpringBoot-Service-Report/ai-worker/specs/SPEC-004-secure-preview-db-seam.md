# SPEC-004: Secure the unauthenticated preview /db seam before production

- Source: REQ-004
- Status: ACTIVE

## Overview
Close the anonymous real-data hole: `GET /api/v1/preview/checklist/a6/db/{requestId}`
reads real DB data by a raw id with **no auth** (the whole `/api/v1/preview/**`
chain is `permitAll`). Fix = **fail-closed dev-profile gate**: the preview
endpoints exist **only** when the `dev` profile is explicitly active. Prod builds
run without `dev` → the endpoints don't exist and the open path isn't declared →
no anonymous access to real report data. QA keeps the seam because their local
`./mvnw spring-boot:run` is made to default to `dev`.

**Why fail-closed (positive `@Profile("dev")`, not `@Profile("!prod")`):** for a
security control, a forgotten/misconfigured profile must fail **closed** (seam
absent) rather than open. The project currently has **no profiles at all** (single
`application.yml`, no `spring.profiles.active`, no `@Profile` usage), so we
introduce `dev` as the explicit "temporary-preview-enabled" profile.

**Scope of gating — whole `PreviewController`:** only `previewA6Db` reads real
data, but the mock previews (`previewA6`, `previewA9`) are all self-marked
TEMPORARY and only used by dev/test QA. Gating the entire controller is simpler
and QA already runs under `dev`, so nothing is lost. (REQ-004 permits keeping the
mocks; SA judgment is to gate all — cleaner, no downside here.)

## Design
1. **`PreviewController`** → add `@Profile("dev")` (class level). In a non-dev
   (prod) context the bean isn't created → every `/api/v1/preview/**` route 404s.
   This alone closes the hole (no handler = no data).
2. **`SecurityConfig.apiSecurity`** (defense-in-depth) → the
   `"/api/v1/preview/**"` `permitAll` matcher must apply **only** under `dev`.
   Inject `org.springframework.core.env.Environment` and add that matcher
   conditionally (`environment.acceptsProfiles(Profiles.of("dev"))`). In prod the
   path is not declared open → falls to `.anyRequest().authenticated()` (and 404s
   anyway since the controller is gone).
3. **`pom.xml` `spring-boot-maven-plugin`** → add a default run profile so QA's
   existing local command keeps working unchanged:
   ```xml
   <configuration>
     <profiles><profile>dev</profile></profiles>
     <excludes> ... existing lombok exclude ... </excludes>
   </configuration>
   ```
   `./mvnw spring-boot:run` → `dev` active → seam present (QA unaffected).
   Packaged prod (`java -jar`, or any run without `SPRING_PROFILES_ACTIVE=dev`) →
   seam absent → secure.

## Impact on the QA workflow (must be communicated)
After this change is deployed, **any instance QA uses must have `dev` active**:
- Local `./mvnw spring-boot:run` → automatic (pom default). No change for Tanya.
- The UAT-wired `localhost:33000` instance, if started from a packaged jar, must
  set `SPRING_PROFILES_ACTIVE=dev` (or `--spring.profiles.active=dev`), or the
  `/a6/db/{id}` seam (REQ-001/REQ-003) will 404. Porter must relay this so the
  REQ-001 run isn't silently broken on the next redeploy. The currently-running
  instance is unaffected until rebuilt/redeployed.

## Acceptance Criteria mapping
- Prod-profile build → real-data preview seam absent/!anonymous. ✅ (controller
  `@Profile("dev")` + gated permitAll)
- Dev/UAT QA still works under `dev`. ✅ (pom default + documented env var)
- Short note of what was done. ✅ (= profile-gated, not removed)

## Data Model / Non-functional
No DB, entity, or endpoint-contract change. Behavior differs only by active
profile. No secret touched.

## Tasks
- TASK-002: Dev-profile-gate the preview endpoints + default local run to `dev`
  (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
