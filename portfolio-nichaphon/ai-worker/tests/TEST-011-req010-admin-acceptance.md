# TEST-011: REQ-010 AC-a…g — the admin: content in, Save → live, blog posts, AI drafts, Home AI from the store, no public write path

- Source REQ: REQ-010 (AC-a…g) — brief: REQ-010 §QA brief (Porter, 2026-11-01) + `inbox/QA.md` (two lines: no-call ACs now;
  real-call row unlocked). Budget: SPEC-010 §Call ledger **rows 2–14, Tanya** (planned ≤ 11, hard cap 13), written by Sober
  BEFORE any fire — read and confirmed present before the real-call leg started.
- Status: **TEST_PASSED** — 2026-11-01, Tanya, **re-test after TASK-042** (§Re-test): DEF-1 closed (S6 0 failed on 12/12 loads),
  OBS-22 fixed; AC-a…g all PASS. (First round: `TEST_FAILED` on DEF-1 alone; 11 real calls, cap 13. Re-test: 0 calls.)
- Tested: 2026-11-01 by Tanya
- Evidence: `../../project-docs/qa-test011-2026-11-01/` — one folder per AC (`aca/ acb/ acc/ acd/ ace/ acf/ acg/`), each with
  pictures + `run.txt`; `back-stub-phase.log` and `back-real-phase.log` = the `back/` logs.
- Harnesses: `tests/harness/test011-{aca,modals,acb,certpics,acc,acg,control,down,real}-2026-11-01.cjs` — Chrome via
  playwright-core, **headless** (owner's standing rule).

## Environment — local only, never production

| Piece | What ran |
|---|---|
| Code | repo `portfolio-nichaphon-web`, branch `D1`, HEAD `b068fba` + the uncommitted REQ-009/REQ-010 working tree (Fern's). No git command that writes; `git status` unchanged by me |
| Store | **a scratch COPY**: `bun run seed` with `DATA_DIR=<my scratchpad>/store` → `16 documents, 6 posts, 9 media`. His `back/data/` does not exist on this machine and was never created |
| `back/` | 4014, `DATA_DIR` = the copy. **No-call leg: `GATEWAY_BASE_URL=http://127.0.0.1:3999` (the stub) for every minute of it** — no paid call was possible. `ADMIN_ENABLED=1` except the flag-off probe. Real-call leg: defaults (gateway `https://ai.develyst.online`), `ADMIN_ENABLED=1`, same copy |
| `front/` (new) | working tree, `npm run build` exit 0 with per-run `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws` (SQ40 still open; not a code change), every route `ƒ` dynamic; `node .next/standalone/server.js` on 127.0.0.1:3072 |
| `front/` (baseline) | **the pre-switch site**: `git archive b068fba front` into a folder beside the repo (`<repo parent>/qa-baseline-tanya/`, outside git, deleted at the end), `node_modules` = a junction to the repo's, `next build` exit 0 (all routes `○` static), served on 127.0.0.1:3073 |
| `admin/` | `bun run dev` → `next dev -H 127.0.0.1 -p 4015`, opened as `http://localhost:4015` (= `ADMIN_ORIGIN`) |

**Interpreted (not asked):** AC-a says "visible on the live site on 2026-11-01". QA never opens production, and production
(`origin/production` `ed2eb5d`) does not carry `D1` at all, so its content differs from `D1` by REQ-005's undeployed corrections.
I took **the pre-switch build of `D1` (HEAD `b068fba`)** as "today's site": it is exactly what the switch replaces and what
R8 promises not to lose. A compare against production's own pictures would be a DATA REQUEST → QQ15 (non-blocking).

## The commitment for the real-call leg — written BEFORE the first paid call

Row 2–14 read: planned ≤ 11, cap 13; one press each; no re-press; seeded copy only. Order and exact inputs:

| # | AC | Press | Exact input (mine) | Planned / cap |
|---|---|---|---|---|
| R1 | AC-d | Draft on **`projects[].summary`** of *Develyst AI Gateway* | note: `เขียนสรุปใหม่ให้อ่านง่ายขึ้น สั้นลง ใช้แค่ข้อมูลที่มีอยู่แล้ว ห้ามเพิ่มอะไรใหม่` | 1 / 1 |
| R2 | AC-d | Draft on the **post body** of my QA post `qa-t011-published-post` | note: `เขียนย่อหน้าสั้นๆ ว่าทำไมผมเก็บเนื้อหาเว็บไว้ใน SQLite เพราะไม่ต้องรันเซิร์ฟเวอร์ฐานข้อมูลแยก` | 1 / 1 |
| — | AC-d | R1: **Discard** (public `/portfolio` must not change). R2: **Use this + Save** into the copy (public post must change only after Save) | — | 0 |
| R3 | AC-e | add project **`Zephyrine Ledger`** (made up, mine only): summary `A bookkeeping web app for a small pottery studio that logs every kiln firing and tracks glaze stock.` + Save, then Home AI (EN): `Have you built anything for a pottery studio?` | ≤ 3 |
| R4 | AC-e | Home AI (TH): `เคยทำระบบให้สตูดิโอเครื่องปั้นดินเผาไหมครับ` | ≤ 3 |
| R5 | AC-g | Home AI chip `Which databases have you worked with?` | ≤ 3 |
| | | **Total** | | **planned 2 + 3 + 3 + 3 = 11 · cap 13** |

Count = `back/` log: one `[admin] draft …` line = 1 call; each Home AI question = its `[chain] … calls=` line.

## Results — no-call leg (stub gateway; 0 paid calls possible)

### AC-a — day-one content = the pre-switch site → **PASS**

| # | Case | Seen | Evidence | Result |
|---|---|---|---|---|
| a1 | 6 routes × 1280x900 + 360x740: `body.innerText` after a full scroll, old vs new | **12/12 identical** (line counts 81 · 194 · 114 · 148 · 94 · 49 desktop; 74 · 187 · 107 · 141 · 87 · 42 phone) | `aca/aca-report.json`, `aca/text-{old,new}-*.txt` | PASS |
| a2 | every picture (`<img>` currentSrc + CSS background images), old vs new | **12/12 identical lists**; `/about` 9 pictures both sides, all loaded | `aca/aca-report.json` | PASS |
| a3 | full-page screenshot, pixel compare (canvas, RGB) | **0 differing pixels on all 12**, same page heights (e.g. `/about` desktop 1280×6538 both) | `aca/{old,new}-*.png` | PASS |
| a4 | every `/portfolio` project modal (opens on click — not in a1–a3) | **11/11** dialog text identical, links identical (7 live links), images identical (none) | `aca/modals.json`, `aca/modals-run.txt` | PASS |
| a5 | `<head>`: `<title>`, meta description, `og:*`, 6 routes | **6/6 identical** (md5 of the extracted tags, old vs new; also read by eye) | printed to my shell only — **no file kept**; re-runnable with `curl` on both builds | PASS |

### AC-b — headline + project + certificate, Save → public page → **PASS**

Through the admin UI, one Save each, then the public page fetched once a second from the Save click.

| # | Edit (marker appended) | Admin says | Public page shows it after | Page text diff | Evidence | Result |
|---|---|---|---|---|---|---|
| b1 | About › Page text › **Title** (the `/about` h1) `… QA-T011-H` | `Saved — live on the site within a minute` | **0.45 s** | exactly 1 line: the h1 | `acb/b1-*.png` | PASS |
| b2 | Portfolio › Projects › Learning Curve › **Summary** `… QA-T011-P` | same | **0.45 s** (card) + in the open modal | exactly 1 line | `acb/b2-*.png` | PASS |
| b3 | About › Certificates › #1 › **Title** `… QA-T011-C` | same | **0.22 s** | exactly 1 line | `acb/b3-*.png`; all 9 `/about` pictures still paint after this Save (`acb/certpics-run.txt`, `b3-…-settled.png`) | PASS |

No build ran between edit and view. (R4's "within one minute": measured ≤ 0.45 s.)

### AC-c — a blog post written in the admin → **PASS**

| # | Case | Seen | Evidence | Result |
|---|---|---|---|---|
| c1 | New post, **Published**, Markdown body (`##`, `**bold**`, a list, `[link](/contact)`, a raw `<script>` line), Save | `Saved — live on the site within a minute`; slug auto-filled from the title | `acc/c1-*.png` | PASS |
| c2 | it appears on `/blog` | **first card** (newest), title + excerpt shown | `acc/c3-public-blog-list.png` | PASS |
| c3 | it opens on its own page — URL and by clicking its card | `/blog/qa-t011-published-post` 200, h1 = title, `<title>` `QA-T011 published post — Nichaphon Sayvav`; card click lands there | `acc/c4-public-post-page.png` | PASS |
| c4 | the body renders as formatting, not marks | h2 `QA-T011 heading` · `<strong>bold words` · 2 `<li>` · link → `/contact` · raw marks in text **0** | `acc/run.txt` | PASS |
| c5 | negative — raw HTML in the body does not run | `<script>` shown as text, `main script` = 0, `window.__qa_xss` unset | `acc/c4-…png` | PASS |
| c6 | negative — a **Draft** post is not public | not on `/blog`; `/blog/qa-t011-draft-post` → **404** | `acc/c5-public-draft-404.png` | PASS |

### AC-f — no way to change content from the public site → **PASS**

| # | Probe | Seen | Result |
|---|---|---|---|
| f1 | any admin link/address in the served HTML of 6 routes + the new post page | `4015` 0 · `/admin/api` 0 everywhere; the word "admin" only inside content text (a project's "admin-only create…", my test excerpt) | PASS |
| f2 | the browser bundle (`front/.next/static`) | `admin/api` 0 files · `4015` 0 · `ADMIN_ENABLED` 0 | PASS |
| f3 | POST/PUT/DELETE/PATCH **through the public front origin** on 7 paths | all **404** (`/media/x.png` **405**) | PASS |
| f4 | `back/` with the flag ON — a write from the public front's origin, from production's origin, `Origin: null`, `text/plain` | all **403 `admin_bad_origin`** | PASS |
| f5 | same — `Host: evil.test` · `X-Forwarded-For` · `Forwarded` · `X-Real-IP` · the machine's LAN address | **403** (`admin_bad_host` / `admin_local_only` ×4); `admin/` on the LAN address: no answer | PASS |
| f6 | a script ON the public page (origin 127.0.0.1:3072) fetching `back/`'s admin API (CORS + `no-cors` simple requests) | JSON PUT/GET blocked by the browser; the two `no-cors` POSTs **wrote nothing** (`back/` log: only my 5 admin writes; 8 posts, none titled `x`) | PASS |
| f7 | `back/` started **without** `ADMIN_ENABLED`, the most permissive request (loopback, admin origin, JSON) | **16/16 → 404** (4 methods × documents/posts/media/draft); `GET /content` still 200 | PASS |
| f8 | the probes changed nothing: `site` document `updatedAt` = its seed stamp `2026-11-01T11:04:20.126Z` | unchanged | PASS |

### AC-g — the REGRESSION list after the switch → see verdict line

**Look-only lines** (S2 titles, S7–S10, S13, S15, H1–H4, H8–H9, A1, P1, P2's hrefs): carried by AC-a — the switched site is
**pixel-, text- and image-identical** to the pre-switch build at 1280 and 360 on all six routes and in all 11 modals.
**Behaviour lines**, run on the switched site:

| # | Line | Seen | Evidence | Result |
|---|---|---|---|---|
| g1 | S1 | 6 routes × 2 sizes: 200, not 404, one `h1`, own `<title>` | `acg/run.txt` | PASS |
| g2 | S6 | 0 console errors · 0 `pageerror` · 0 responses ≥ 400 — **but failed requests ≠ 0**: every desktop load fires 4–6 link prefetches `/<route>?_rsc=…` that end **`net::ERR_ABORTED`**. **Control on the pre-switch build: 0.** → DEF-1 | `acg/run.txt`, `acg/control-run.txt` | **FAIL (as written)** |
| g3 | S3 / S4 | 6 header + 5 footer links each land on their own path | `acg/run.txt` | PASS |
| g4 | S5 | drawer at 360: 1 dialog, the 6 routes, `/services` navigates, closes | `acg/s5-drawer-open.png` | PASS |
| g5 | S12 / S13 | hydration `false→true`; project modal opens + Escape closes; `/about` 9/9 thumbnails painted, lightbox opens (1100×810) + closes | `acg/s12-*.png` | PASS |
| g6 | H10 | Ask top = hero bottom: **901 = 901** (1280), **741 = 741** (360), both chips present — identical on the old build | `acg/control-run.txt` | PASS |
| g7 | H11 (2) | stub killed: 3 steps `Interrupted`, `The AI gateway could not be reached.`, links + Try again; log `fail kind=unreachable at_step=1 calls=0` | `acg/h11-2-gateway-dead.png` | PASS |
| g8 | H12 | `stub:slow` answer + badges; `stub:none` → `Ask directly` → `/contact`. **Sources now 1 link (YodBarber), not 2** — see OBS-21 | `acg/h12-*.png` | PASS (line text stale) |
| g9 | H13 (1)(2) | (1) 0 raw marks in Sources; (2) `stub:malformed@2` → step 2 fails with `The AI gave an answer this step could not read.`; log two `step=2 malformed attempt=1|2 … reason=bad_json` | `acg/h13-*.png`, `back-stub-phase.log` | PASS — **H13(2) run for the first time** |
| g10 | H11 (1) / (3) as written | **can no longer happen**: with `back/` down, every route (and the new post page) renders only `Content is unavailable right now.` — no hero, no Ask section (SPEC-010 D4/TASK-040, by design). → OBS-20 | `acg/back-down-*.png` | n/a — line needs rewording |
| — | S11 | `npm run build` exit 0 (both builds) | build transcripts in scratch | PASS |
| — | NOT run this round | S14, S16, H5 (Q25), H6, H7, P3 — keyboard / reduced-motion / scroll-region behaviours; their rendered result is pixel-identical (AC-a) but the interaction was not driven | — | NOT_TESTED |

## Results — real-call leg

**Five presses, one each. 11 calls (2 drafts + 3 × 3) — planned 11, cap 13, 0 retries, 0 failures.** Ledger rows 2–12 used,
13–14 unused → Sober fills: **1 → 12 / 15**.

Pre-fire: row 2–14 present · the whole sequence **dry-run on the stub first** against a second throwaway copy (`store-dry`;
`real-dry-stub/`: 2 draft lines + 3 chains, Discard / Use this / Save all as designed) · `back/` restarted on defaults: shell env
printed empty, first line `gateway https://ai.develyst.online — admin ON (local only)`, `/health` →
`"knowledge":{…,"source":"store"},"store":{"documents":16,"posts":8}` (the test copy). `back-real-phase.log`, verbatim counting lines:

```
[admin] draft field=projects[].summary note_len=79 ok kind=- provider=deepseek tokens=287/126/413
[admin] draft field=posts[].bodyMd note_len=93 ok kind=- provider=deepseek tokens=312/223/535
[chain] id=dbcd27bd-f118-48f6-892b-5865f89f1c05 end coverage=covered calls=3 wall_ms=3402
[chain] id=aa9085de-bac5-45f6-a553-9b6e44949d82 end coverage=covered calls=3 wall_ms=4083
[chain] id=f7c2abb0-7a10-4bf1-90da-44c8fa93112b end coverage=covered calls=3 wall_ms=9439
```

### AC-d — Thai note → English draft he can edit; nothing public until approve + Save → **PASS**

| # | Press | Seen (verbatim) | Public site | Evidence | Result |
|---|---|---|---|---|---|
| d1 | R1 — `projects[].summary`, Develyst AI Gateway, Thai note "rewrite shorter, use only what is there" | was: *"Production AI API gateway that puts several LLM providers behind one endpoint. Serves as the AI backbone for YodBarber, R1-BEV and AI Voice Avatar."* → draft: *"An AI API gateway that puts several LLM providers behind one endpoint, serving as the AI backbone for YodBarber, R1-BEV and AI Voice Avatar."* — **English, editable box, nothing added** (one word, "Production", dropped) | **Discard** → field unchanged, public `/portfolio` byte-identical before/after | `acd/R1-*.png`, `acd/R1-run.txt` | PASS |
| d2 | R2 — post body of `qa-t011-published-post`, Thai note "a short paragraph on why I keep the site's content in SQLite: no separate database server" | *"## Why I Keep My Site Content in SQLite — I keep the content of this website in SQLite for one simple reason: it doesn't require running a separate database server. There is no extra service to start, no separate process to keep alive …"* — **English, Markdown, only the note's one reason restated** (no number, product or claim beyond it) | after **Use this**, before Save: public post unchanged · after **Save**: public post shows `<h2>Why I Keep My Site Content in SQLite</h2>` + the paragraph | `acd/R2-*.png`, `acd/R2-run.txt` | PASS |

Note: "Use this" **replaces** the whole field (the old body is gone after Save) — as TASK-037 describes ("puts the draft into the field").

### AC-e — add a fact, Save, the Home AI uses it → **PASS**

| # | Press | Seen (verbatim) | Evidence | Result |
|---|---|---|---|---|
| e1 | R3 — Projects › **Add item**: `zephyrine-ledger` / `Zephyrine Ledger` / summary (made up, mine) → Save | `Saved — live on the site within a minute`; `/portfolio` shows it (12 cards) | `ace/R3-admin-*.png`, `ace/R3-public-portfolio.png` | PASS |
| e2 | R3 — Home AI, English: `Have you built anything for a pottery studio?` | *"Yes — I built Zephyrine Ledger, a bookkeeping web app for a small pottery studio. It logs every kiln firing and tracks glaze stock. …"*; Sources: **`/portfolio Zephyrine Ledger`**; `calls=3` | `ace/R3-answered-desktop.png` | PASS |
| e3 | R4 — Home AI, Thai: `เคยทำระบบให้สตูดิโอเครื่องปั้นดินเผาไหมครับ` | *"เคยครับ ผมทำ Zephyrine Ledger ซึ่งเป็นเว็บแอปทำบัญชีให้สตูดิโอเครื่องปั้นดินเผาขนาดเล็ก ใช้บันทึกการเผาเตาแต่ละครั้งและติดตามสต็อกน้ำเคลือบครับ …"*; same source; `calls=3` | `ace/R4-answered-desktop.png` | PASS |

The fact exists nowhere but the test copy's `projects` document, saved 15 s before the question — no restart, no file.

### AC-g real-gateway line — R5 chip `Which databases have you worked with?` → **PASS**

Answered normally (`calls=3`, coverage `covered`, 6 sources, 0 raw marks): *"I work with PostgreSQL, MySQL, MSSQL, MongoDB and SQLite. …"*.
`acg/R5-answered-desktop.png`. → OBS-24 on one sentence.

## Defects

### DEF-1 — every page load now ends 4–6 link prefetches as `net::ERR_ABORTED` (REGRESSION S6) — MINOR — **CLOSED 2026-11-01** (TASK-042; §Re-test r1)
- Viewport: desktop 1280x900 (seen on all 6 routes; at 360 on some loads)
- Repro (from a clean load): 1. serve the switched build (`front/.next/standalone/server.js`) with `back/` up. 2. Open
  `http://127.0.0.1:3072/` in Chrome at 1280x900, wait 2.5 s, page still open. 3. Read the failed requests.
- Expected (REGRESSION S6, and the pre-switch build): 0 failed requests on a clean load.
- Actual: `/about?_rsc=…`, `/services?_rsc=…`, `/portfolio?_rsc=…`, `/blog?_rsc=…`, `/contact?_rsc=…` — each
  `net::ERR_ABORTED`, while the page is still open. Pre-switch build, same probe: 0. No console error, nothing visible.
- Evidence: `acg/control-run.txt` (old vs new, same probe), `acg/run.txt`.
- What it is NOT: not a broken page, not a console error, not seen by a visitor. Whether it costs anything (each prefetch
  of a dynamic route asks `back/` for content) is the SA's to say — I state no cause.

## Observations (not defects)

- **OBS-20 — the whole site now depends on `back/`.** `back/` down → all six routes are a one-line "Content is unavailable
  right now." page (status 200). Designed (D4/TASK-040, "the honest trade for R4"), but on deploy day `back/` becomes as critical
  as the front itself. REGRESSION H11(1)/(3) must be reworded (mine, on delivery).
- **OBS-21 — the stub's canned answer now cites 1 source, not 2**: the Home AI reads the store (D8), and the stub's "Realtime:
  WebSocket demos…" excerpt is not in it, so D6 drops it. Correct behaviour; REGRESSION H12's line text is stale (mine).
- **OBS-22 — new posts are bylined "Develyst Team" by default** (Author field pre-filled), the same byline as the six old
  sample posts REQ-010 called stale. He must retype his name on every post. `acc/c4-public-post-page.png`.
- **OBS-23 — on `/blog/<post>` the grid background band stops part-way down the article** (seam under the list in
  `acc/c4-public-post-page.png`). Cosmetic; the article page is new (SQ47 territory).
- **OBS-24 — R5's answer says "PostgreSQL has been my main choice for recent backend work".** Its six sources list PostgreSQL in
  four places but none says "main choice" — a small inference, not a new fact. Same family as SQ38 (REQ-007). Not an AC here.

## Test data created

All in **the scratch copy** of the store (never his content): About title `+ QA-T011-H`, Learning Curve summary `+ QA-T011-P`,
certificate #1 title `+ QA-T011-C`, posts `qa-t011-published-post` (published; body replaced by R2's draft) + `qa-t011-draft-post`
(draft), project `zephyrine-ledger`. The copy and `store-dry` stay in my scratchpad only — **nothing reached `back/data/`, which does
not exist on this machine**. Outside the store: `front/.next` rebuilt (git-ignored); the baseline folder beside the repo — **deleted**
(junction removed first; the repo's `node_modules` intact, 129 entries); servers 3999/4014/3072/3073/4015 — **all stopped, ports
re-checked free**. Product repo: no file changed by me (`find -newer`, `.next`/`node_modules` aside); zero git writes.
Real calls: 11, on the owner's gateway, ledger rows 2–12.

## Verdict

**Superseded by the re-test below → `TEST_PASSED`.** First round, as written then:

**`TEST_FAILED` — on one MINOR line only.** AC-a, AC-b, AC-c, AC-d, AC-e, AC-f: **PASS** (6 of 7). AC-g: every behaviour line run
passes **except REGRESSION S6**, which fails as written: **DEF-1** — 4–6 aborted link prefetches per page load, 0 on the pre-switch
build, invisible to a visitor. I do not round it up: S6 says zero, the switch made it non-zero. Whether to fix it or to accept it
and amend S6 is not mine — that is Porter's route (cause and cost: Sober; acceptance: the owner). Everything else in REQ-010 is
proven; nothing else blocks.

Not tested: production (never in scope); S14, S16, H5, H6, H7, P3 (interaction lines not driven this round — their rendered
result is pixel-identical); a picture **upload** through the admin (no AC asks for one; the 9 seeded pictures re-saved fine).

Decisive evidence:
1. `aca/aca-report.json` — 12/12 route×size pairs: identical text, identical pictures, **0 differing pixels** (AC-a).
2. `acb/run.txt` — three Saves seen on the public page in 0.45 / 0.45 / 0.22 s, each diff exactly one line (AC-b).
3. `ace/R3-answered-desktop.png` — the Home AI naming a project that exists only in the store copy (AC-e).
4. `acf/probe.txt` + `acf/probe-flag-off.txt` — every public-side write refused (403/404/405), 16/16 admin routes absent with the flag off (AC-f).
5. `acg/control-run.txt` — DEF-1: same probe, pre-switch build 0 aborted requests, switched build 5.

## Re-test — 2026-11-01, after TASK-042 (Porter's scope, `inbox/QA.md`) — **0 real calls**

Build: working tree with TASK-042 (`prefetch={false}` ×11 in the 6 listed front files — grep), `npm run build` exit 0, every route
`ƒ`, BUILD_ID `Qih6JHAAehFKIxGQmf494`, `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws`. A **fresh** seeded store copy (`store2`,
16/6/9, deleted after). `back/` on the stub, admin on; Ask never pressed, Save never pressed → `retest/back-retest.log`: 0 `[chain]`,
0 `[admin]` lines. Harness `tests/harness/test011-retest-2026-11-01.cjs`; evidence `retest/`.

| # | Scope | Seen | Evidence | Result |
|---|---|---|---|---|
| r1 | **S6 / DEF-1** — clean load of all 6 routes at 1280x900 **and** 360x740, page open 2.5 s | **12/12: 0 failed requests, 0 `_rsc` requests**, 0 console errors, 0 pageerrors, 0 responses ≥ 400 (TEST-011: 4–6 aborted per desktop load) | `retest/run.txt` | **PASS — DEF-1 CLOSED** |
| r2 | observation (Sober's note) — one header click `/` → `/about` | page opens (h1 correct); **one** `_rsc` request → **200**; **not** reported failed in my run (Fern saw it end `ERR_ABORTED` in hers). S6 counts loads → not an S6 line either way → OBS-25 | `retest/run.txt` | observation |
| r3 | **OBS-22** — admin › Posts › New post › Author; an existing sample post | new post **`Nichaphon Sayvav`** (= stored `site.name`); *API Security…* keeps **`Develyst Team`**; nothing saved | `retest/obs22-new-post-author.png`, `retest/obs22-existing-post-author.png` | **FIXED** |
| r4 | light regression — full-page pictures of the 6 routes at both sizes vs **TEST-011's own** pictures of the switched site (which were 0-pixel vs the pre-switch build) | **12/12: 0 differing pixels**, same heights | `retest/retest-*.png` vs `aca/new-*.png` | PASS |

- **OBS-25 — a click navigation may log one `_rsc` request as `ERR_ABORTED` after its 200** (seen by Fern, not reproduced by me
  with a 2.5 s wait). The page opens correctly; S6 counts clean loads. Recorded only; cause unverified (Sober's note).

**Re-test verdict: `TEST_PASSED`.** DEF-1 closed, OBS-22 fixed, nothing regressed. With the first round's AC-a…f PASS, **REQ-010 is
7/7 AC proven.** Still not tested (unchanged from the first round, named): production · S14, S16, H5 (Q25), H6, H7, P3 · picture upload.

## Questions

**QQ15 (Porter, non-blocking) — AC-a's baseline.** I compared against the pre-switch build of `D1` (HEAD `b068fba`), not production
(`ed2eb5d`, which lacks REQ-005's corrections and which QA never opens). If "the live site" must mean production, it needs a DATA
REQUEST: his own full-page pictures of the six live routes — and they will differ wherever REQ-005 changed words.
> answer (Porter, 2026-11-01, via `inbox/QA.md`, `[PM-decided]`): the pre-switch `D1` build (`b068fba`) is the right AC-a baseline —
> production lacks REQ-005 and is never QA's; no DATA REQUEST. → AC-a PASS stands as written. (Copied here by Tanya.)
