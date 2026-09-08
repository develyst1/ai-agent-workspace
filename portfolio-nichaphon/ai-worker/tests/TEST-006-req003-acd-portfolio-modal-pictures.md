# TEST-006: REQ-003 AC-d — `/portfolio` and the two new modals, SEEN as pictures

- Source REQ: **REQ-003**, acceptance criterion **AC-d** (the only one Porter
  left open). Round requested by Porter 2026-09-05 via `inbox/QA.md`.
- Status: **TEST_PASSED**
- Environment: **local only.** Production (`portfolio.develyst.online`) was not
  contacted, not even a GET. Neither live product URL
  (`learning.develyst.online`, `ong.develyst.online`) was opened either — the ask
  was to **report the href**, and the anchor was read from the DOM, never clicked.
- Tested: 2026-09-05 by Tanya
- Harness: `tests/harness/test006-2026-09-05.cjs` (+ `test006b-2026-09-05.cjs`,
  the mobile follow-up). Playwright, real Chromium via `channel: 'chrome'`,
  **headed**; playwright installed OUTSIDE the repo and reached via `NODE_PATH`;
  `front/package.json` untouched.
- Evidence folder: `../project-docs/qa-test006-2026-09-05/`

## The surface this round ran on — declared, per the standing rule

- `front/.next` held a **partial** build output when I arrived: only
  `standalone/`, no `BUILD_ID` and no top-level `static/`. `next start` cannot
  serve that, so I **deleted `front/.next`** and built fresh rather than serve a
  half-directory or run `npm run dev` on top of it.
- `cd front && npm run build` → **exit 0**, `✓ Compiled successfully in 14.9s`,
  `✓ Generating static pages (10/10)`, all 7 app routes `○ (Static)`, then
  `[postbuild] copied .next/static + public/ into .next/standalone`. **Zero error
  and zero warning lines** in the transcript
  (`../project-docs/qa-test006-2026-09-05/build-transcript.txt`).
- Served on **one** surface: `node .next/standalone/server.js` on **port 3061**
  (`PORT=3061 HOSTNAME=127.0.0.1`) — the shape the repo's own build script
  prepares assets for. TEST-003 already showed the two surfaces agree, and Q26
  (which one the droplet uses) is still the owner's; this round did not re-fork.
- **Port 3000 was free this time** — the orphan `next` (PID 8508) that had held
  it since 2026-09-03 is gone. I still did not take port 3000.
- **What the tree held:** branch `D1`, **working tree clean**, HEAD `ca5c097`
  *"feat: update portfolio intro title and add new projects…"*. The two edited
  files the board records as *unstaged on `D1`* are **committed** at that SHA. No
  role did that and QA asserts nothing about who did or which branch is right —
  it is recorded because it changes what "the tree I tested" means. See
  **§Questions QQ11**.
- Footprint: my server was stopped and `front/.next` **deleted again** at the
  end, so the next `npm run dev` starts clean. No product file touched.

## Scope

**Covers exactly what Porter asked for, and nothing else:**

1. `/portfolio` **as a picture** — the intro line and the 11 cards.
2. **Each new card's modal opened and captured as a picture** — Learning Curve
   and Ong Match — with the "Open live project" `href` read off the live DOM in
   the same round and reported beside the picture.

Both were run at **desktop 1280x900** and again at **mobile 360x740**.

**Does NOT cover** — stated so silence is not read as a pass:

- **No re-run of the 24/24 string comparison** and **no re-audit of the DRAFT-001
  citations** — Porter excluded both on purpose; Sober's independent parser did
  the first and the second is document inspection.
- **No full REGRESSION re-run.** S1–S16 / H1–H8 last ran 2026-09-05 (TEST-004 /
  TEST-005 / TEST-003) and this change is two content files.
- **No judgement on whether the copy is accurate or reads well.** That is the
  owner's, through the R7 record — QA reports what rendered.
- **No visit to either live product URL**, and no click on the anchor.
- **Firefox**, and any browser other than the machine's Chrome.

## Cases

| # | Case (from AC-d) | Type | Viewport | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 1 | `/portfolio` loads and shows the intro line | happy | desktop 1280x900 | serve build on :3061, load `/portfolio`, front the tab + wake shot, scroll whole doc | 200, intro line present | **200.** Heading reads **`Eleven projects, and what each one had to solve`** — character-exact to the approved line. Seen in `p1-portfolio-top-desktop-1280.png`, sub-line "Platforms, gateways, chatbots and robots. Select any project to see the detail behind it." below it | **PASS** |
| 2 | **11 cards**, the two new ones first | happy | desktop | count `button[aria-label^="Open project detail for"]`, read them in order, full-page shot | 11 cards, Learning Curve + Ong Match present | **11 triggers**, in order: **Learning Curve (01), Ong Match (02)**, DTE Platform, Develyst Company Website, Laichill, RAG Chatbot for CRM Sales, Enterprise Backend Optimisation, YodBarber Queue Booking, AI Voice Avatar, Develyst AI Gateway, R1-BEV Voice Command Robot (11). All eleven **seen** with their ordinals in `p1-portfolio-fullpage-desktop-1280.png`; the nine pre-existing entries are still there (Q28 default held) | **PASS** |
| 3 | **Learning Curve modal opens and PAINTS** | happy | desktop | click card 1's "Project detail" | a modal mounts, paints, and is readable | `[role=dialog]`=1, `.mantine-Modal-content`=1, overlay=1, `body[data-scroll-locked]="1"`, overflow `hidden`. Dialog box **760x707 at (260,96)**, background `rgb(21,17,34)`, opacity 1, visibility visible. **Seen in the picture** (`m-learning-curve-modal-desktop-1280.png`): title "Learning Curve", the full summary paragraph, **"What it does" with its 5 bullets**, **"Stack" with 11 chips**, and the button | **PASS** |
| 4 | **Learning Curve — the live-URL link** | happy | desktop | read the anchor inside the dialog (never click) | an "Open live project" link to `https://learning.develyst.online/` | text **`Open live project`**; **`href="https://learning.develyst.online/"`**; `target="_blank"`, `rel="noopener noreferrer"`; box 165x44 at (285,735), **inside the viewport**, and legible in the shot as a filled violet button with an external-link glyph | **PASS** |
| 5 | **Ong Match modal opens and PAINTS** | happy | desktop | click card 2's "Project detail" | as case 3 | dialog=1, content=1, overlay=1, scroll-locked; box **760x758 at (260,71)**. **Seen** (`m-ong-match-modal-desktop-1280.png`): title "Ong Match", full summary — **the Thai glyphs `(ไทป์)` render, they are not tofu boxes** — "What it does" with 5 bullets, "Stack" with 9 chips | **PASS** |
| 6 | **Ong Match — the live-URL link** | happy | desktop | read the anchor (never click) | link to `https://ong.develyst.online/` | text **`Open live project`**; **`href="https://ong.develyst.online/"`**; `target="_blank"`, `rel="noopener noreferrer"`; box 165x44 at (285,760), in viewport, legible in the shot | **PASS** |
| 7 | Both modals close again | happy | desktop | `Escape` after each | unmounts, scroll lock released | after each: dialogs 0, content 0, overlay 0, `data-scroll-locked` null, overflow `visible` | **PASS** |
| 8 | The same, at **360x740** | happy | mobile 360x740 | repeat cases 1–7 at 360 | same content, reachable | 200; same intro line; same **11** cards in the same order (`p1-portfolio-fullpage-mobile-360.png`). Both modals open (dialog 324x666 at (18,37)) and both close on Escape. Hrefs identical to desktop | **PASS** |
| 9 | **The link is reachable on a phone** | edge | mobile 360x740 | open each modal, scroll it the way a visitor does (wheel over the modal), measure + shoot | the button can be brought on screen and is not covered | On open the button sits at y**=1255** (LC) / y**=1293** (OM) — **below the modal's own fold**; the modal body is a scroll region with a visible scrollbar. After ordinary scrolling both land at **y=634, in the viewport**, `elementFromPoint` at their centre returns the button's own label (**nothing covers them**), and both are **seen** in `m-*-modal-foot-wheel-mobile-360.png`. Not a defect — see **OBS-8** | **PASS** |
| 10 | Console on this round | regression | both | collect errors / pageerrors / failed requests / HTTP ≥400 across the whole run | 0 errors | **0 errors, 0 pageerrors, 0 failed requests, 0 responses ≥400.** 15 warnings, all one already-accepted string: the `_next/static/css/<hash>.css was preloaded … but not used` build-mode warning (REGRESSION §Known and accepted, TEST-003 OBS-7). Nothing new | **PASS** |

## Defects

**None.** No defect was found in this round.

## Observations (not defects, not blocking)

- **OBS-8 — on a 360px phone the "Open live project" button starts below the
  modal's fold.** Both modals open scrolled to the top with the button ~600px
  further down inside a scrollable modal body; the visitor has to scroll the
  modal to reach it. It **is** reachable, uncovered and hit-testable once
  scrolled (case 9), and the modal shows a scrollbar, so this is reported as a
  fact for the owner, not as a failure. It rides beside **SQ13 / OBS-5** as the
  same class of question (phone-height layout), and QA does not decide it.

## Verdict

**`TEST_PASSED`** — 10 of 10 cases pass, 0 defects. **AC-d's second half is now
seen, not inferred:** both new cards' modals were opened and captured as
pictures at desktop and mobile, and each one's live link reads
`https://learning.develyst.online/` and `https://ong.develyst.online/`
respectively, `target="_blank" rel="noopener noreferrer"`. `/portfolio` itself is
captured as a picture with the intro line `Eleven projects, and what each one had
to solve` and **11** cards, the two new ones first.

**What this verdict does NOT do:** it does not tick AC-d — the tick is Porter's —
and it does not say the copy is right, only that it renders. The round ran on a
**production build served from `node .next/standalone/server.js`**, built by me
from branch `D1` at `ca5c097`; anything about a different branch or a deploy is
outside it.

## Questions

> For Porter. He answers as `> answer: ...`.

- **QQ11 — the tree I tested is not the tree the board describes, and QA will not
  guess which is correct.** REQ-003 §Acceptance pass and board §Blocked both say
  the 2 edited files "sit unstaged on `D1`". On 2026-09-05 at test time the
  working tree on `D1` is **clean** and the content is **committed** as
  `ca5c097`. My verdict is unaffected — the strings I saw are the approved ones
  either way — but **SQ17 (branch choice) was asked on the premise of an unstaged
  file, and that premise no longer holds.** Is SQ17 to be re-put to the owner
  against the new state? QA states the fact and stops: git is the human's.
- **QQ12 — does OBS-8 go to the owner, or ride with SQ13?** QQ9 ruled that OBS-5
  rides with SQ13 as one fact / one owner / one question. OBS-8 is the same
  class (a phone-height consequence, not a defect) but it lands on the two
  entries he has just approved, so it may be worth showing him with the picture.
  Your call, not mine.
