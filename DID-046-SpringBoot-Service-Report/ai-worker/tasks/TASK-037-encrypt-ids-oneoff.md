# TASK-037: One-off — print encrypted download tokens for 7 request ids (REQ-031 smoke support)

- Source: Porter — the REQ-031 six-builder smoke needs ENCRYPTED ids; `/api/v1/download/checklist/{enc}` takes the
  encrypted form and the human has plain ids. Assignee: Jason (BE). **Temporary, reverted after use.**
- Scope guardrails (Porter, non-negotiable): **NOT a permanent endpoint** (would let anyone mint valid download
  tokens — worse than DEF-16). **Do NOT print or hardcode the crypto key.** Produce the ciphertext inside the app so
  it matches `decryptToLong`. Print ONLY the seven id→token pairs, nothing else about those requests.

## Do
- Add a **throwaway** test/main (tag it `// TASK-037 TEMP — remove after REQ-031 smoke`, like TASK-031's debug) that
  obtains `CryptoService` and prints `plainId → encrypt(plainId)` for these 7 ids:
  **38237, 38192, 38280, 38271, 38233, 38275, 38364.**
  `CryptoService.encrypt(String)` (`security/service/CryptoService.java:33`) returns the URL-safe Base64 token that
  `decryptToLong` reverses — pass each id as a String.
- Prefer **DB-free**: construct `CryptoService(new CryptoProperties(...))` with the key sourced from `application.yml`
  at runtime (do not hardcode the key in the test), OR a `@SpringBootTest` that autowires `CryptoService` if that's
  simpler in this env — your call; the point is the key stays in config, never in the test source or the log.
- Run it, hand the 7 tokens to Porter (paste into the log/board is fine — the tokens are the deliverable; the KEY is not).
- **Revert** the throwaway once the human has the tokens.

## Verify / handoff
- BE: the one-off prints 7 tokens; test-compile green; no key printed/committed; file tagged TEMP.
- Back to **Sober** to confirm 0 key leakage + TEMP tag, then the 7 tokens go up to Porter → human runs the REQ-031
  UI smoke (render one real report per builder from the packaged jar) → REQ-031 closes.

## Done (2026-08-27)

Threw away `src/test/java/.../Task037EncryptIdsTemp.java` — a plain JUnit test (no Spring context, DB-free)
that read `crypto.key-base64`/`crypto.transformation` straight from `application.yml` via SnakeYAML (already
on the classpath), built `new CryptoService(new CryptoProperties(...))`, and printed `id -> encrypt(id)` for
the 7 ids only. The key itself was never printed or logged. Ran it once, captured the output below, deleted
the file immediately after (`git status` on `src/test` clean; test-compile re-confirmed green post-delete).

**Tokens (deliverable — paste straight into `/api/v1/download/checklist/{token}`):**

| id | token |
|---|---|
| 38237 | `1y8xyi2jRXuM7jcEXPi-gsI1Fga-ybEwSb5f-Ba2qtE` |
| 38192 | `rgCRxMy9uaOd0tsYAvQ_vcOOxbMruaeDr6ns6HvacP4` |
| 38280 | `jAhS_I3AcoL3o7PsAqaMJNakA5mTDhi15duklgKpoTs` |
| 38271 | `OdrCK_UCOSm3SDdkI5CIqztPZ5d4iexuU6kHcb0y5tU` |
| 38233 | `-L-pwr9jip9K4FQjeNhQ_xhnLa9Bdl0NpYFlBJpz6hk` |
| 38275 | `f-UgQ0n72EYNp17bBLQcRs3dzstI4mbYLO5ZLEYw-wA` |
| 38364 | `AgcDc-WOCcZ4yyyXmzdKLuY9yIsdl-nhA1LTocb7gtM` |

@Sober: ready to confirm 0 key leakage + TEMP tag reverted. Then these go up to Porter → human for the
REQ-031 six-builder UI smoke.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
