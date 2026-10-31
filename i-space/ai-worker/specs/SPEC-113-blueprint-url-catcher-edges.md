# SPEC-113: Blueprint's URL catcher — an address ends where non-URL text starts, and "held" means the same address
- Source: REQ-116 (Team A) · from TEST-111 round 2 DEF-2 / DEF-3
- Status: DONE (2026-10-30 16:31, Sober — REQ-116 DELIVERED + committed blueprint-back f10f8cb; was ACTIVE 13:2x)
- Repo read: `blueprint-back` on `atom`, HEAD `2da175e` (REQ-114 r2 committed), read 2026-10-30 13:2x by Sober.

## What I read
- `src/interview/round.ts:253` `URL_RE = /https?:\/\/[^\s<>"'()[\]{}]+/g`. It is a negated class, so any non-space character continues a URL, Thai included (DEF-2).
- `:258` strips trailing `.,;:!?`, then `isApiPath`, dedupe, cap 20.
- `:268` "held" = `text.includes(noSlash(url))` over the joined title + body JSON of the non-question parts (live and kept entries). That is a substring test, so `…:3100` is inside `…:31000` (DEF-3). It is also how `:3900` was held in TEST-111: WRK-001's goal says `…บน http://127.0.0.1:3900 เพื่อดู…`.
- Measured on QA's two repro strings with the current and the proposed rule, in node (scratch only):
  - DEF-2 message: current → `["http://127.0.0.1:4500/healthทุก"]` · proposed → `["http://127.0.0.1:4500/health"]`.
  - DEF-3 (`:3100` vs a part with `:31000`): current substring test → held (wrong) · proposed exact-address test → not held.
  - `ดู http://h.example/a?x=1&y=2#f, และ (http://127.0.0.1:3500).` → proposed `["http://h.example/a?x=1&y=2#f", "http://127.0.0.1:3500"]`.

## Design `[SA-decided]` (cheap to reverse)
- **E15: an address is ASCII URL characters only.** `URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#@!$&*+,;=%]+/g`. This is RFC 3986's unreserved + reserved set, minus `'()[]` (already excluded in REQ-114 so a URL in brackets or quotes stops at the bracket). Thai, any other non-ASCII character, space, `<>"{}|\^` and backtick end the address. The trailing `.,;:!?` strip, `isApiPath`, dedupe and the cap of 20 stay.
  - An address with a non-ASCII path (`http://h/ภาษาไทย`) is cut at the first Thai letter, keeping `http://h/`. That is the price of DEF-2's case, which is the common one. Written to the user exactly as cut. It is named in Risks, not designed for.
- **E16: "held" means the same address.** Build one function `addressesIn(text)` = the E15 matches with the same trailing strip, each without a trailing `/`. The message's addresses and the held text both go through it. A message address is held when `addressesIn(<held text>)` contains it (set membership on the `noSlash` form), not when it is a substring.
  - So `:3100` is not held by `:31000`, and `http://h:3900` is not held by `http://h:3900/api` (REQ-116 req 2: same host, port and path). This reverses TASK-136's decision (2), which was `[team-proposed]` and accepted by me, now overruled by the REQ.
  - `:3900` in TEST-111 stays held: WRK-001's text holds exactly `http://127.0.0.1:3900` followed by a space.
  - Comparison is literal on the `noSlash` form: no case folding, no default-port or `%`-encoding normalisation. Two spellings of one address count as two (Risks).
- Nothing else changes: same entry shape, same `url_kept` record, no contract change. `openapi.json` does not move, so the front's `check:api` stays green and **no front TASK is needed** (checked against F-036: nothing in `openapi.json` changes).

**Consumers** (`grep -rn "URL_RE\|noSlash\|uncaughtUrls" src test` on `2da175e`): `src/interview/round.ts:253,255,256,258,268,610,670`. Tests: `test/interview/url-catcher.test.ts` (TASK-136). Its prefix case, if any, changes meaning. TASK-142 lists that.

## AC → work
| AC | Covered by |
|---|---|
| AC-1 Thai right after a URL | TASK-142: E15 + test with QA's exact message |
| AC-2 `:31000` does not hide `:3100` | TASK-142: E16 + test with QA's `holds31000` shape |
| AC-3 regression | TASK-142: `url-catcher.test.ts` (REQ-114 AC-4 replay, edge cases) + `service-urls.test.ts` (REQ-114 AC-1) + full suite + tsc |

## Order
blueprint-back topic order (F-013): TASK-117 (REQ-112) committed first, then TASK-142. Then REQ-115 (TASK-134/135).

## Risks
- A non-ASCII path or IDN host is cut at its first non-ASCII character (E15). Low: service addresses here are `127.0.0.1:<port>/…`. If a user hits it, the part is editable.
- Literal comparison (E16): `HTTP://H:80/x` and `http://h/x` count as different, so a second part could be kept. Low, same reason.
