# TASK-043: One-off — encrypted /download tokens for 3 อ.4 ids (REQ-029 routing test)

- Source: Porter — test อ.4 through the real `/download` path (exercises `REQUEST_TYPE=4→"A4"` routing, never run for
  อ.4; `/a4/db` only proves content, not routing). Assignee: Jason (BE). **Same as TASK-037 — throwaway, deleted after use.**
- Ids: **38427** (17 docs, main), **38419** (16 docs, spare), **38434** (14 docs, spare).

## Do (identical to TASK-037's proven procedure)
- Re-create the throwaway (plain JUnit, no Spring, DB-free): read `crypto.key-base64`/`crypto.transformation` from
  `application.yml` at runtime, `new CryptoService(new CryptoProperties(...))`, print `id → encrypt(id)` for the 3 ids only.
- **Constraints (non-negotiable, per Porter):** the crypto KEY is never printed/hardcoded/committed; NOT a permanent
  endpoint (an "encrypt any id" route lets anyone mint valid download tokens); tag the file TEMP; **delete it after** the run.
- Hand the 3 tokens up (tokens are the deliverable; the key is not).

## Verify / handoff
- BE: prints 3 tokens; no key printed; file deleted after (`git status src/test` clean); test-compile green.
- Back to **Sober** to confirm 0 key leakage + file gone → tokens to Porter → human runs the อ.4 `/download` routing test.

## Note (Porter's, for later — not now)
This is the 2nd throwaway. If a 3rd is needed, propose a **dev-profile-gated** encrypt helper instead of repeating the one-off.

## Done (2026-08-31) — Jason

Same procedure as TASK-037: `src/test/java/com/smart/report/security/Task043EncryptIdsTemp.java` — plain
JUnit (no Spring context, DB-free), read `crypto.key-base64`/`crypto.transformation` from `application.yml`
at runtime via SnakeYAML (already on the classpath), built `new CryptoService(new CryptoProperties(...))`,
printed `id -> encrypt(id)` for the 3 ids only. The key itself was never printed or logged. Ran it once,
captured the output below, deleted the file immediately after (`git status src/test` shows only the
pre-existing `report/a4/` test dir — the security/ test package is gone, no trace). test-compile
re-confirmed green post-delete.

**Tokens (deliverable — paste into `/api/v1/download/checklist/{token}`):**

| id | token |
|---|---|
| 38427 | `rSwyDqpeiYRWhW-8Zuam1_jnY1VoR_K1KZSbmx0_mEk` |
| 38419 | `_c55rFb2mlAHHsEUggXxOB-Q8sVDd6sUHUUyPUmfvVc` |
| 38434 | `7Vp5v3NHLy4pHGSfJrRawPwJztfHIq7aZ-98-W6Ex5M` |

@Sober: ready to confirm 0 key leakage + file gone. Then these go up to Porter → human runs the อ.4
`/download` routing smoke.
