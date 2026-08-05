# TASK-002: Dev-profile-gate the preview endpoints + default local run to `dev`

- Source: SPEC-004
- Status: DONE
- Depends on: none

## What to do
Make the temporary preview endpoints exist **only** under the `dev` Spring
profile (fail-closed), so a production build has no anonymous real-data seam,
while local/UAT QA keeps working. Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.

1. **`controller/PreviewController.java`** — add class-level
   `@org.springframework.context.annotation.Profile("dev")`. (Bean/handlers only
   exist when `dev` is active.) No other change to the controller.

2. **`config/SecurityConfig.java`** — gate the preview `permitAll` to `dev`.
   In `apiSecurity`, the `"/api/v1/preview/**"` matcher must be added **only**
   when `dev` is active. Inject `org.springframework.core.env.Environment` into
   the config and wrap that one matcher, e.g.:
   ```java
   auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
       .requestMatchers("/", "/actuator/health", "/swagger-ui.html",
                        "/swagger-ui/**", "/v3/api-docs/**").permitAll();
   if (environment.acceptsProfiles(org.springframework.core.env.Profiles.of("dev"))) {
       auth.requestMatchers("/api/v1/preview/**").permitAll();
   }
   auth.anyRequest().authenticated();
   ```
   Keep the rest of both filter chains unchanged. (The `/api/v1/download` chain,
   `ApiKeyFilter`, CORS, etc. are untouched.)

3. **`pom.xml`** — in the existing `spring-boot-maven-plugin` `<configuration>`,
   add a default run profile so `./mvnw spring-boot:run` still enables the seam:
   ```xml
   <configuration>
     <profiles><profile>dev</profile></profiles>
     <excludes>
       <exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude>
     </excludes>
   </configuration>
   ```

## Definition of Done
- [ ] `PreviewController` is `@Profile("dev")`; preview `permitAll` is dev-gated in
      `SecurityConfig`; `pom.xml` run defaults to `dev`.
- [ ] `/api/v1/download`, `ApiKeyFilter`, and CORS config are unchanged
      (`git diff` shows only PreviewController, SecurityConfig, pom.xml).
- [ ] Compiles: `./mvnw -o -DskipTests compile` (show BUILD SUCCESS).
- [ ] **Prove both states (report the two results):**
  - WITHOUT dev (e.g. `./mvnw spring-boot:run -Dspring-boot.run.profiles=prod`, or
    run the packaged jar with no `SPRING_PROFILES_ACTIVE`): GET (no auth)
    `/document-service/api/v1/preview/checklist/a6` **and** `/checklist/a6/db/1`
    → **not anonymously served** (404, or 401/redirect — not a 200 PDF).
  - WITH dev (`./mvnw spring-boot:run`, which now defaults to `dev`): the same
    GETs → **200 application/pdf** (seam still works for QA).
  - Use a mock route (`/checklist/a6`) for the presence check to avoid needing real
    data; you do not need a real requestId or the DB for this proof.

## Implementation Notes
**Changed (3 files, exactly the SPEC scope):**
- `controller/PreviewController.java` — added class-level `@Profile("dev")` (+ import).
  In a non-dev context the bean isn't created → all `/api/v1/preview/**` routes 404/closed.
- `config/SecurityConfig.java` — injected `Environment`; converted the `authorizeHttpRequests`
  lambda to a block so the `"/api/v1/preview/**"` `permitAll` matcher is added **only** when
  `environment.acceptsProfiles(Profiles.of("dev"))`. All else (OPTIONS, `/`, health, swagger,
  `.anyRequest().authenticated()`, oauth2, download chain, ApiKeyFilter, CORS) unchanged.
- `pom.xml` — added `<profiles><profile>dev</profile></profiles>` to the existing
  `spring-boot-maven-plugin` `<configuration>` (lombok exclude kept) so `./mvnw spring-boot:run`
  defaults to `dev`.
- `git status`: only these 3 modified (+ the already-DONE TASK-001 `A6CheckListPreviewBuilder.java`
  untracked). `/api/v1/download` chain, `ApiKeyFilter`, CORS = untouched.

**Verification (evidence):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- **Two-state proof (booted my build; `:33000` was a pre-existing instance, so used alt ports):**
  - **WITHOUT dev** — `spring-boot:run -Dspring-boot.run.profiles=prod` on `:33098`
    (`profile is active: "prod"`). No-auth GETs:
    - `/api/v1/preview/checklist/a6`      → **HTTP 401**, no body (not a 200 PDF) ✅
    - `/api/v1/preview/checklist/a6/db/1` → **HTTP 401** (real-data seam closed) ✅
    - `/api/v1/preview/checklist/a9`      → **HTTP 401** ✅
  - **WITH dev** — plain `spring-boot:run` on `:33099` (`profile is active: "dev"` — pom default,
    no flag). No-auth GETs:
    - `/api/v1/preview/checklist/a6` → **HTTP 200 application/pdf, 272,739 bytes** ✅
    - `/api/v1/preview/checklist/a9` → **HTTP 200 application/pdf, 468,814 bytes** ✅
- Both instances stopped after the proof; pre-existing `:33000` left untouched.

**Deploy/QA note for Sober → Porter (per SPEC-004 §Impact):** once this is deployed, any
instance QA uses must have `dev` active. Local `./mvnw spring-boot:run` = automatic. But the
UAT-wired instance, if launched from a packaged jar, must set `SPRING_PROFILES_ACTIVE=dev`
(or `--spring.profiles.active=dev`) or the `/a6/db/{id}` seam (REQ-001/REQ-003) will 401/404.
The currently-running `:33000` instance is unaffected until it is rebuilt/redeployed.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** (Sober, 2026-08-05). Verified independently against SPEC-004 + DoD.

- **Scope:** `git diff --stat` = only `PreviewController.java`, `SecurityConfig.java`,
  `pom.xml`. `ApiKeyFilter` and `DocumentController` (download) → empty diff. ✅
- **PreviewController:** class-level `@Profile("dev")` + import present → bean absent
  outside `dev`. ✅
- **SecurityConfig:** read the full diff — `Environment` injected (final field, wired by
  `@RequiredArgsConstructor`); the `"/api/v1/preview/**"` `permitAll` is added **only**
  inside `if (environment.acceptsProfiles(Profiles.of("dev")))`; OPTIONS/static/swagger
  permitAll, `.anyRequest().authenticated()`, oauth2, and the Order-1 download chain all
  preserved. Lambda→block refactor is behavior-preserving (specific matchers still before
  anyRequest). ✅
- **pom.xml:** `<profiles><profile>dev</profile></profiles>` added to the existing
  `spring-boot-maven-plugin` `<configuration>`; lombok exclude kept. ✅
- **Compile:** re-ran `./mvnw -o -DskipTests compile` myself → exit 0 (independent). ✅
- **Two-state proof (Jason's evidence, accepted):** WITHOUT dev (`-Dspring-boot.run.profiles=prod`)
  → `/preview/checklist/a6`, `/a6/db/1`, `/a9` all **HTTP 401** (real-data seam closed, not a
  200 PDF); WITH dev (default `./mvnw spring-boot:run`) → a6/a9 **200 application/pdf**.
  401 satisfies the AC ("do not exist or require auth"). ✅

Meets all 3 REQ-004 AC: prod build → no anonymous real-data seam; dev/UAT QA still works;
approach documented (= dev-profile-gated, not removed).
