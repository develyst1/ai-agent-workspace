# TEST-114: the URL catcher's edges — a URL ends where Thai starts; "held" means the same address
- Source REQ: REQ-116 (Team A: SPEC-113 E15/E16, TASK-142) — from TEST-111 round 2 DEF-2, DEF-3
- Status: **TEST_PASSED** (2026-10-30 15:17, Tanya) — AC-1…AC-3; Q1, Q2 non-blocking for the PM
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`) · stub only, no gateway
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-116/` (named after the REQ)

## Build under test
- **blueprint-back ccd32af + fp `329169c658bb`** (2 paths: `src/interview/round.ts`, `test/interview/url-catcher.test.ts`) · **blueprint-front 09f2717** (clean). Clean HEAD export + diff. Ports: API 4231 · web 3141 · stub 4398.
- Stub `test-116/gateway-r2.mjs` = TEST-111 round 2's (paths fixed) + mode `holds:<address>` (the reply adds one part whose title holds exactly that address).

## Cases (`edges.mjs` → `edges.out`; AC-3 → `r2.out`, `ac1.out`, `reg.out`)

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-1 | `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที` → kept **exactly** `http://127.0.0.1:4500/health` (path and `url_kept` title) | PASS |
| 2 | AC-1 | Thai on both sides, two URLs (`ดูที่http://127.0.0.1:3100แล้วนะ และที่http://127.0.0.1:3500/ด้วย`) → `:3100` and `:3500/` | PASS |
| 3 | AC-1 neighbour | `?a=1&b=2#top` kept whole · a percent-encoded Thai path kept whole | PASS |
| 4 | AC-1 neighbour | **a raw Thai path** `https://example.test/ค้นหา?q=1` → kept as **`https://example.test/`** (cut where the Thai starts) | → Q1 |
| 5 | AC-2 | a part holding `:31000` + the user's `:3100` → `:3100` **kept** | PASS |
| 6 | AC-2 neighbour | a part holding exactly `:3100` → nothing kept · holding `:3100/` → nothing kept (trailing slash = same) · holding `:4200/health` does **not** hold `:4200` → kept | PASS |
| 7 | AC-2 neighbour | a part holding `:4200/health?x=1`, the user's `:4200/health` → **kept** (a second api part) | → Q2 |
| 8 | AC-1 × AC-2 | a Thai-glued URL a part already holds → nothing kept | PASS |
| 9 | AC-3 | REQ-114 AC-4 (rebuilt live round, 4 kept + named, round 2 adds none), AC-1 (no copies), TEST-111 round 2's edges — all OK; the former DEF-2 / DEF-3 lines now OK; host:port without a scheme still refused (TEST-111 Q1, accepted out of scope) | PASS |
| 10 | AC-3 | REQ-110 scripts **49 OK** (+ the known `ui.mjs` #6 miss; watched #6 OK) · blueprint-back `bun test --timeout 30000` **320 / 16 / 0**, gateway 0 · blueprint-front `check:api` matches, typecheck 0, unit **238 / 0**, build 0 | PASS |

## Questions
- **Q1 (QA → PM, does not block)** — E15 ends a URL at the first non-ASCII character, so a URL whose **path is written in Thai** (as a browser's address bar shows it) is cut to its host: `https://example.test/ค้นหา?q=1` → `https://example.test/` (#4). It cannot be told apart from Thai text written right after a URL, which REQ-116 asked for. The percent-encoded form is kept whole. **Default: accept** — the URLs a spec names for services are ASCII; a Thai path is rare; a later REQ if one appears.
- **Q2 (QA → PM, does not block)** — REQ-116 req 2 defines "the same address" as "same host, port and path". A part holding `…/health?x=1` does not count as holding the user's `…/health` (#7), so Blueprint keeps a second api part; by req 2's own words the query is not part of the address and it should count as held. **Default: accept as is** — one extra kept part is harmless and visible in the chat; strict reading would hide the user's exact address.
  > answer (Q1 + Q2): both defaults accepted — Thai path cut to host: accepted (rare; later REQ if one appears); a query makes a different address: accepted, the extra part is harmless and visible. REQ-116 req 2 is read that way. — Porter (PM) 2026-10-30 15:3x `[PM-decided]`

## Test data created
| What | Where | End state |
|---|---|---|
| projects "TEST-114 …", "TEST-111 r2 …" | `pglite:memory` (:4231) | gone: stopped 15:1x |
| servers 4231 / 3141 / 4398 / 4396 | this machine | stopped; `ss` clear |
| scripts, outputs, screens | `tests/harness/test-116/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (a URL with Thai right after it is kept exactly), AC-2 (an address is held only by the same address), AC-3 (REQ-114 AC-1/AC-3/AC-4, TEST-111 round 2's edges, REQ-110's scripts, suites). TEST-111's DEF-2 and DEF-3 are fixed. Q1 (a raw Thai path is cut to its host) and Q2 (a query makes a different address, against req 2's wording) are for the PM, both with "accept" defaults. **Tested tree for git:** blueprint-back **ccd32af + fp `329169c658bb`** (blueprint-front unchanged, 09f2717).
