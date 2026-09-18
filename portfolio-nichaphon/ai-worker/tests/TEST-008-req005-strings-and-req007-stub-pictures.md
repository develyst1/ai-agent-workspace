# TEST-008: REQ-005 AC-d strings SEEN + REQ-007 AC-e / AC-h / stub happy path — the zero-cost round

- Source REQ: REQ-005 (AC-d) + REQ-007 (AC-e, AC-h, the stub happy path) — brief: each REQ's
  §Acceptance pass (Porter, 2026-09-13) + `inbox/QA.md`
- Status: **TEST_PASSED** — 2026-09-13, Tanya (24/24, 0 defects; QQ14 non-blocking)
- Environment: **local only.** Production (`portfolio.develyst.online`) never opened. **Zero
  requests reached `https://ai.develyst.online`** — `back/`, when it ran, was pinned to the local
  stub or to nothing; the browser's whole request log is `127.0.0.1:3072` + `ws://localhost:3001/ws`
  (counted per leg below).
- Tested: 2026-09-13 by Tanya
- Evidence: `../../project-docs/qa-test008-2026-09-13/` — pictures + `run-*.txt` (the raw runs)
- Harness: `tests/harness/test008-2026-09-13.cjs`

## Surface this round ran on — declared

**The production build already on disk, served, not rebuilt.** `front/.next` held Sober's TASK-026
build — `BUILD_ID Twf3FOdhYYaVXTKRSnGEp`, stamped 2026-09-13 20:24 — and **no file under `front/src`
or in the modified set is newer than it** (checked with `find -newer`), so it is the current source.
I **served it** rather than clearing and rebuilding: `node .next/standalone/server.js` on
**port 3072**, `HOSTNAME=127.0.0.1`. Never `npm run dev` on top of it. `front/.next` left exactly as
found. **Port 3000 is foreign (pid 22944) and was never touched.** Playwright-core drives the
machine's Chrome from outside the repo (`NODE_PATH` → another repo's `node_modules`);
`front/package.json` untouched. `git status` in the code repo: unchanged by me (8 `M` + `back/` +
5 `??` under `front/` — all Fern's). **Zero git writes, zero product-code edits, no deploy.**

Run rules honoured (REGRESSION §How to run it): headed Chrome, tab fronted + one throwaway
screenshot (`document.hidden=false` printed on every page), the whole document scrolled one
`requestAnimationFrame` per step before any string was located, no `el.focus()`.

## Scope

Exactly Porter's two briefs: (A) REQ-005 AC-d — the corrected strings SEEN on `/` and `/about` at
1280x900 and 360x740, the absence list, the two `<meta name="description">` strings quoted, counts;
(B) REQ-007 AC-e — the three failure pictures re-taken by me on the stub, AC-h — the 360 fold and
`scrollWidth` in every state, and the stub happy path + `stub:none` once at both sizes.

**Deliberately not done:** no re-derivation of `PROFILE.md`, no judgement of the look, no full
REGRESSION re-run, no real gateway call of any kind (that is TEST-009).

## A — REQ-005 AC-d: the strings, seen

Located in the DOM by exact text, scrolled into view, photographed; every "present" count is the
number of occurrences in `document.body.innerText` after the full scroll. Pictures are
`<route>-<size>-NN-<what>.png`; `<route>-<size>-full.png` is the whole page.

| # | Route · size | String (exact) | Seen where | Count | Picture | Result |
|---|---|---|---|---|---|---|
| A1 | `/` 1280 | `AI Engineer / Senior Software Engineer` | header wordmark, hero role line, footer | 3 | `home-desktop-01-top.png`, `-04-footer.png` | PASS |
| A2 | `/` 360 | same | hero role line, footer — **the header hides its role line below 48em by design** (`SiteHeader.module.css` `@media (max-width: 47.99em) .wordmarkRole {display:none}`, committed `2ef36ec`, pre-dates REQ-005) | 2 | `home-phone-01-top.png`, `-04-footer.png` | PASS (header-role absence at 360 is pre-existing layout, noted for Porter — OBS-11) |
| A3 | `/` both | `© 2026` — one string in the footer's innerText: `… Contact © 2026 Nichaphon Sayvav` | footer | 1 | `home-desktop-04-footer.png`, `home-phone-04-footer.png` | PASS |
| A4 | `/` both | `in about three weeks` in the Home lead | hero lead paragraph | 1 | `home-desktop-02-lead.png`, `home-phone-02-lead.png` | PASS |
| A5 | `/` both | the stat **`4` / `Years experience`** — card innerText `4 Years experience` | **Home stats band** (`HomeStats.tsx` renders `CAREER_STATS`; it is NOT on `/about` — Porter's brief lists it under `/about`, the DOM has it on `/` only: 0 occurrences of `Years experience` on `/about`) | 1 | `home-desktop-03-stat-label.png`, `home-phone-03-stat-label.png` | PASS — seen where it renders |
| A6 | `/about` both | `AI Engineer / Senior Software Engineer` + `© 2026` | header (1280 only, see A2) + footer | 2 / 1 (1280), 1 / 1 (360) | `about-*-01-top.png`, `about-*-12-footer.png` | PASS |
| A7 | `/about` both | `<h1>` `Four years of shipping the thing nobody there had shipped before` | page opening block | 1 | `about-desktop-02-h1.png`, `about-phone-02-h1.png` | PASS |
| A8 | `/about` both | GFAI role `AI & Robotics Developer` + paragraph `In about three weeks I delivered…` | Experience, first card (`2026 · GFAI R&I Thailand Co., Ltd.`, "FASTEST DELIVERY") | 1 / 1 | `about-*-03-gfai-role.png`, `about-*-04-gfai-para.png` | PASS |
| A9 | `/about` both | ICM `Senior / Staff Software Engineer` at `ICM Smart Solution Co., Ltd.` | Experience, second card (`2022 to 2026`) | 1 / 1 | `about-*-05-icm-role.png`, `about-*-06-icm-org.png` | PASS |
| A10 | `/about` both | certificate issuer `ICM Smart Solution` (Employee Survival) | Certificates | 2 in body text (issuer caption + the ICM org string above contains it) | `about-*-07-cert-issuer.png` | PASS |
| A11 | `/about` both | values line `a robotic kiosk prototype in about three weeks` | Approach → "Rapid execution" | 1 | `about-*-08-values.png` | PASS |
| A12 | `/about` both | nine new chips `DeepSeek`, `Kimi`, `xAI`, `Text-to-SQL / schema grounding`, `MQTT` (AI and Robotics) · `Go Gin` (Backend) · `SQLite` (Databases) · `nginx`, `pm2` (Tools and DevOps) — and `Generative AI (Gemini, OpenAI)` still present | Skills grid; every chip located as its own element with a box logged in `run-strings.txt` | 1 each | `about-*-09-chips.png`, `-10-chips-databases.png`, `-11-chips-tools-and-devops.png` | PASS |
| A13 | both routes, both sizes | **Absence:** `two weeks` 0 · `Three years` 0 · `Solutions` 0 · `Chatuchak` 0 — in rendered text AND page source | — | 0 | `run-strings.txt` | PASS |
| A14 | both routes | **`2025`:** `/` 0 in text and source; **`/about` 4 in text (8 in source)** — all four are the **certificate year captions** (`BorntoDev Academy 2025`, `DevLab 2025` ×2, `ICM Smart Solution 2025`, `AboutCertificates_year`), **0 in the footer** (footer reads `© 2026`) | Certificates | 4 | `about-desktop-07-cert-issuer.png` | PASS on the brief's rule ("no 2025 in the footer"); the four certificate years are pre-existing content outside C8 — OBS-12 |
| A15 | built HTML | `<meta name="description">` for `/`: `AI Engineer / Senior Software Engineer working on Generative AI, RAG chatbots, AI robotics and full-stack systems. Robotic kiosk prototype delivered in about three weeks; RAG chatbot taken to production in under four months.` — for `/about`: `AI Engineer / Senior Software Engineer with production Generative AI, RAG chatbots and AI robotics, including a robotic kiosk prototype delivered in about three weeks.` (read off the served HTML with `curl`, quoted verbatim — Porter adjudicates C5.a / C5.b) | — | — | — | QUOTED |
| A16 | both routes, both sizes | Counts over the four page loads: **console errors 0 · pageerrors 0 · failed requests 0 · non-local requests 0** | — | — | `run-strings.txt` last line | PASS |

**REQ-005 AC-d half: 15/15 PASS + the two meta strings quoted. 0 defects.**

## B — REQ-007 AC-e / AC-h / stub happy path

Setup, declared: the stub `bun run test/stub-gateway.ts` on `127.0.0.1:3999`; `back/` as
`bun run src/index.ts` with `GATEWAY_BASE_URL=http://127.0.0.1:3999 KNOWLEDGE_DIR=test/fixtures/knowledge
PORT=3001` — its own first log line reads `gateway http://127.0.0.1:3999` (copied to
`back-stub-run1.log` / `back-stub-run2.log`), `/health` → `profile:true, projects:true`. The browser
opened exactly one socket per ask, always `ws://localhost:3001/ws` (the `wsUrls` count in every
`run-*.txt`). **Non-local requests over all 14 page loads of this half: 0.** Same headed Chrome, same
wake step. `scrollWidth` below is `documentElement.scrollWidth` vs `innerWidth` — headed Chrome keeps
a 15px vertical scrollbar, so 345 / 1265 is "no horizontal scroll" (Fern's 360 / 1280 were headless).

| # | Case (from AC) | Viewport | Steps | Seen (from the run + the picture) | Picture | Result |
|---|---|---|---|---|---|---|
| B1 | **AC-e (1)** `back/` not running | 1280 + 360 | 3001 confirmed free; chip 1 clicked | `Asking…` + three `Waiting` for ~3.2 s (console: `ws://localhost:3001/ws … ERR_CONNECTION_REFUSED`, the one expected error), then all three steps `Interrupted`, panel **`The assistant could not be reached.`** + `The live AI is resting…` + About / Portfolio / Contact links + **`Try again`**; hero, second `<h2>` and footer still present; `scrollWidth` 1265 / 345 | `f1-never-opened-desktop.png`, `f1-never-opened-phone.png` (+ `f1-idle-*`, `f1-connecting-*`) | PASS |
| B2 | **AC-e (2)** `back/` up, gateway dead | 1280 + 360 | stub killed (pid 18468), `/health` still ok; chip 1 clicked | all three `Interrupted`, panel **`The AI gateway could not be reached.`**, links + `Try again`; `back/` log `fail kind=unreachable at_step=1 calls=0` for both asks; rest of Home intact | `f2-unreachable-step1-desktop.png`, `-phone.png` | PASS |
| B3 | **AC-e (3)** socket dropped mid-chain | 1280, then 360 (back/ restarted between — one kill per size) | `stub:slow Which databases…` typed; at 2.6 s step 1 done / step 2 `Running…` (`f3-before-kill-*`); `taskkill /PID <back> /F` | step 1 keeps `deepseek · deepseek-flash · 636 ms`, steps 2–3 **`Interrupted`**, panel **`The connection dropped before the answer was finished.`** + links + `Try again`; **answer blocks on screen = 0** (only the two failure sentences are `<p>`s); `back/` log shows step 1 only | `f3-dropped-desktop.png`, `f3-dropped-phone.png` | PASS |
| B4 | **stub happy path** | 1280 + 360 | `stub:slow Can you build a realtime site with WebSocket?` typed | at 3.2 s: step 1 `deepseek · deepseek-flash · 636 ms`, step 2 `Running…`, step 3 `Waiting` (`happy-mid-*`); final: three badges, the answer, `Sources` = **`/about` Skills** + **`/portfolio` YodBarber Queue Booking** (2 links — the stub's third excerpt is D6-dropped), `Ask` re-enabled | `happy-mid-*.png`, `happy-final-*.png` | PASS |
| B5 | **`stub:none`** hint | 1280 + 360 | `stub:none Do you fly helicopters?` | three badges, the not-covered answer, hint **`The profile does not cover this one. Ask directly`** → `/contact` (the only link) | `none-desktop.png`, `none-phone.png` | PASS |
| B6 | **AC-h** section placement + order | 360x740 (and 1280) | scrollTop 0, no scroll | **hero bottom = Ask section top** (360: 788.41 = 788.41; 1280: 901 = 901); `main` order `hero → Ask the AI about me → stats (4…) → Expertise…` — nothing removed or re-ordered (Q46 default) | `fold-phone.png`, `fold-desktop.png`, `section-idle-*` | PASS |
| B7 | **AC-h** no horizontal scroll in every state | 360 (and 1280) | read in idle / connecting / running / answered / none / all three failures | `scrollWidth` 345 ≤ 360 in all eight states (1265 ≤ 1280 on desktop); chips wrap to two rows at 360, timeline one column | every `run-*.txt` | PASS |
| B8 | **REGRESSION H8** hero full set above the fold at 360x740 — re-measured because the hero's strings changed under REQ-005 | 360x740 | boxes read at scrollTop 0 (same method as TEST-005 case 1) | name 165–253 · role **263–317 (now two lines; was 268–293)** · lead **332–569 (9 lines; was 309–520, 8)** · CTA 1 593–637 · CTA 2 649–693 · quote **713.41–740.41** vs fold 740. All six legible in the picture; the quote's **line box** ends 0.41px past the fold (glyphs well above). The 49px margin of 2026-09-05 is spent — by REQ-005's longer role + lead (C1/C2, the owner's words), **not** by REQ-007: the Ask section starts at the hero's bottom and changes nothing inside it | `h8-fold-phone.png`, `fold-phone.png`; baseline `../qa-test005-2026-09-05/a1-h8-fold-360x740.png` | **PASS as seen — zero margin; QQ14** |
| B9 | counts | all | — | this half: **console errors 2 (both the expected `ERR_CONNECTION_REFUSED` in B1, none elsewhere) · pageerrors 0 · failed requests 0 · non-local requests 0** | `run-*.txt` | PASS |

**REQ-007 half: 9/9 PASS, 0 defects.** AC-e: three pictures at two sizes, all re-taken by me, each
with `Try again` visible and the rest of Home intact. AC-h: section below the hero, nothing moved, no
horizontal scroll in any state; H8 holds with the caveat in B8.

## Defects

None.

## Observations (not defects — for Porter)

- **OBS-11** — at 360 the site header shows the name only; the role line `AI Engineer / Senior
  Software Engineer` is hidden below 48em by the header's own CSS (committed `2ef36ec`, before
  REQ-005). The corrected role IS seen at 360 in the hero and the footer. Porter's brief said
  "header + footer role line" — at 360 that is "hero + footer" by pre-existing design.
- **OBS-12** — `/about` shows `2025` four times as certificate years (captions under the four
  certificate cards). Not the footer (which reads `© 2026`), not C8, pre-existing copy. Also: the
  **Employee Survival certificate image itself** carries the text `ICM Smart Solutions Co.,Ltd.`
  (plural, inside the PNG artwork) — the rendered caption says `ICM Smart Solution`; a picture is
  not a string and REQ-005 C3 named strings, so not a defect, but it is the one place on the page
  where a visitor can still read "Solutions".
- The stat `4 / Years experience` renders on `/` (Home stats band), not on `/about` where the brief
  listed it. Photographed where it is; nothing missing.

- **OBS-13** (the B8 numbers) — at 360x740 the hero quote's line box now ends at **740.41** against a
  740 fold (was 691). Legible, nothing cut, but there is no margin left; one more wrapped line
  anywhere in the hero pushes the quote below the fold. Cause: REQ-005 C1/C2 strings (role wraps to
  two lines at 360; lead is one line longer). Not REQ-007's doing. Whether zero margin is acceptable
  is the owner's call — QQ14.

## Verdict

**`TEST_PASSED`** — REQ-005 AC-d: 15/15, the corrected strings seen on `/` and `/about` at both
sizes, absence list clean, both meta descriptions quoted for Porter. REQ-007 AC-e / AC-h / stub
path: 9/9, the three failure pictures re-taken at both sizes, no answer text left after a drop,
section below the untouched hero, no horizontal scroll. **0 defects. 0 requests to
`ai.develyst.online`.** Nothing untested in the brief. One question (QQ14) is about a margin, not
about a failure.

Footprint closed: `back/` and the stub stopped (3001 + 3999 verified free), my front server on 3072
stopped at the end of the session, `front/.next` left as found, 3000 never touched.

## Questions

(For Porter; he answers as `> answer: ...`)

- **QQ14 (non-blocking, H8 margin).** REGRESSION H8 reads "hero renders its full set at 360x740 above
  the fold". It does — but with the REQ-005 strings the quote's line box ends at 740.41 on a 740
  fold (glyphs above, 0 px to spare; was 49 px). I have recorded H8 as PASS on what is seen. Does
  the owner want (a) that reading kept, or (b) margin restored (a copy or layout decision — his,
  via you, then Sober)? Until answered, REGRESSION H8 carries the numbers and stays PASS.
  > answer (Porter, 2026-09-13): **Your PASS reading stands as written — I ticked REQ-005 AC-d and REQ-007 AC-h on it.**
  > The (a)/(b) pick is not mine: it is the owner's **Q52** (REQ-005 §Delivery — the margin was spent by his C1/C2
  > words, so the copy-or-layout call is his, then Sober's). Until he answers, H8 stays PASS with the numbers.
  > Both verdicts accepted unchanged; TEST-008 and TEST-009 are closed on the board. Thank you for the pre-fire
  > dry run on the stub — the first QA spend came in exactly on plan.
