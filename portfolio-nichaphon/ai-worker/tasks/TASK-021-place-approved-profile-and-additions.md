# TASK-021: Place the approved profile, C5/C8/C9 and the Class 1 additions
- Source: SPEC-005
- Status: **DONE** (2026-09-13, Sober — every DoD line re-run by SA, see §Review; zero real calls)
- Depends on: TASK-019 (met), TASK-020 (met), the owner's approval (**met 2026-09-13**, REQ-005 §Approval record)
- Owner: **Fern (FE)**

## Startable now — 2026-09-13

The owner answered every sheet line on 2026-09-13 (REQ-005 §Approval record, his words verbatim;
resolved values in REQ-005 §Owner decisions 2026-09-13 and in **§Approved values** below). Every
conditional step (7, 8, 9) has its answer — none of them is "say nothing". **Order with TASK-026:
do this one first** — it is content-only, small, and it is the last gate on TASK-027; TASK-026 is
the long one and can follow in the same or the next session.

**What changed since this task was written (2026-09-09): `back/` is no longer empty.** REQ-006 /
REQ-007 landed code there (TASK-022…025, all DONE) and `back/knowledge/PROJECTS.md` already exists
— it is **generated** from `projects.ts` (SPEC-007 D5) and a test guards it. This task adds
**exactly two files** to `back/knowledge/` and touches **nothing else under `back/`**: no code, no
test, no `package.json`, no `PROJECTS.md`, no fixture. `back/test/fixtures/knowledge/PROFILE.md` is
a labelled **fictional** fixture — never copy from it, never overwrite it.

## What to do

1. **Write `back/knowledge/PROFILE.md`** — the approved body from DRAFT-002 section (a),
   verbatim as approved: everything between the two rulers, starting at the line
   `# Nichaphon Sayvav`, no citation marker, no tag, no note. `back/knowledge/` already
   exists (it holds the generated `PROJECTS.md`) — put the file beside it. CRLF like the rest
   of `back/` (the loader reads it as text and the chain's D6 verification is
   whitespace-normalised, so either EOL works; CRLF keeps the folder uniform).
2. **Write `back/knowledge/PROFILE.citations.md`** — DRAFT-002 section (b), verbatim. The loader
   (`back/src/knowledge/load.ts`) reads only `PROFILE.md` and `PROJECTS.md` by name, so this third
   file is never fed to the model — that is the intent (SPEC-005 D1).
3. **Apply the approved Class 1 skill items** to `front/src/constant/content/about.ts`
   `SKILL_GROUPS`. New array entries only — no new group, no new type, no component change.
4. **Apply the approved C5** to `front/src/constant/site.ts` `SITE.role`. If C5 moves, also
   replace the hardcoded old headline in **both** `front/src/app/layout.tsx`
   `metadata.description` and `front/src/app/about/page.tsx` `metadata.description`, using
   the exact sentences approved in DRAFT-002 section (d). `layout.tsx`'s page *title* uses
   `${SITE.role}` and needs no edit.
5. **Apply the approved C8** to `front/src/constant/site.ts` `SITE.copyrightYear` — a plain
   string constant. **Do not** replace it with `new Date().getFullYear()`; SPEC-005 §D4 and
   §SQ25 explain why that makes the staleness invisible instead of fixing it.
6. **Apply the approved C9** — one string, `ABOUT_INTRO.title` in
   `front/src/components/partials/About/About.config.ts` (line 3 today). **He picked candidate
   A** — use it verbatim (§Approved values). Nothing else in that file moves, and
   `CAREER_STATS.years` stays `'4'` — it is not in play.

7. **Class 1b — he picked OPTION 1 on sheet line 2.** So: `'Generative AI (Gemini, OpenAI)'`
   in `SKILL_GROUPS.ai` (`about.ts:116` today) is **not touched**, and all **nine** items go in.
   Step 3 is the whole of the skills change.
8. **Line 6 — he said KEEP ALL** (`เก็บทั้งหมด`). Nothing comes out of either profile file;
   the site is not in play on this line. State "keep all" in your notes, nothing to show.

9. **The two ICM bullets — he answered: TWO SEPARATE PROJECTS** (`ก+ข คนละโปรเจกต์`, SPEC-005
   §SQ29 / your FQ36). The resume's Text-to-SQL assistant and the site's RAG chatbot are
   different work. **Change nothing**: both bullets stay as drafted, no merge, no reorder, no
   reword, both citation rows stay. Your note for this step must **cite his answer** (REQ-005
   §Approval record, line 1 SQ29 clause) — do **not** write "relationship unstated"; it is now
   stated by him.

Nothing outside the approved sheet is applied. Every line came back approved as proposed, so
there is no "changed fourth item" to ask about; if you find a place where the draft and the
approval record disagree, stop and ask here rather than pick.

10. **Prove `back/` still stands with the real profile in place** (this is what TASK-027 waits
    for). With `GATEWAY_BASE_URL=http://127.0.0.1:9` (dead port — **zero real calls**):
    `cd back && bun test` → still **42 / 42**; `bunx tsc --noEmit` → 0; then `PORT=3001
    GATEWAY_BASE_URL=http://127.0.0.1:9 bun run src/index.ts` and `curl /health` →
    `"knowledge":{"profile":true,"projects":true}` and **no** `[knowledge] missing` line at
    startup; `bun run ws-client "hello"` → `accepted`, `step 1 started`, `error unreachable
    at_step 1`, `done` (the chain now gets past `knowledge_missing`; it fails at the dead port, as
    it must). Free 3001, never touch 3000.

## Definition of Done

- [ ] `back/knowledge/PROFILE.md` and `back/knowledge/PROFILE.citations.md` exist and match
      the approved draft character-for-character modulo EOL (state how you compared them —
      e.g. extract the ruler-to-ruler block from DRAFT-002 and `diff` after CRLF→LF on both).
- [ ] `ls back/knowledge/` shows exactly `PROFILE.md`, `PROFILE.citations.md`, `PROJECTS.md`;
      `PROJECTS.md`'s bytes are unchanged (sha256 before/after); nothing else under `back/`
      changed (mtimes or a file list before/after) — no code, no test, no fixture, no config.
- [ ] `grep -ri chatuchak back/knowledge back/src back/test front/src/` returns **zero**.
- [ ] The only human names in `back/knowledge/PROFILE.md` are "Nichaphon Sayvav" and "Dong".
- [ ] Step 10 ran as written: `bun test` 42/42 and `tsc` 0 with the dead-port pin, `/health`
      `profile:true`, no `[knowledge] missing` line, `ws-client` reaches `unreachable at_step 1`.
      **Zero requests reached `https://ai.develyst.online`** — say so.
- [ ] `cd front && npx tsc --noEmit` — exit 0.
- [ ] `cd front && npm run build` — exit 0, no new error or warning line.
- [ ] `cd front && npm run dev`: the new headline is **seen** in the footer on any page, the
      new footer year is **seen**, and the new skill items are **seen** on `/about`.
- [ ] **C9 (approved, A):** `grep -rn "Three years" front/src/` returns **zero**, and the new
      `/about` `<h1>` is **seen**.
- [ ] **Class 1b:** state "option 1" and confirm by grep that `'Generative AI (Gemini, OpenAI)'`
      still ships verbatim; nine new strings present in `about.ts`, four groups touched.
- [ ] **Line 6:** state "keep all"; both profile files carry every line of the draft.
- [ ] **The two ICM bullets:** state "two separate projects — his word, REQ-005 §Approval record";
      both bullets and both citation rows present, unchanged.
- [ ] `git status` reported (expect `?? back/` plus exactly five modified `front/` files: `site.ts`,
      `layout.tsx`, `about/page.tsx`, `content/about.ts`, `About.config.ts`). **You do not commit.**

## Approved values (pasted by Sober 2026-09-13 from REQ-005 §Approval record / §Owner decisions 2026-09-13)

His one-line answer, verbatim: *"1=ถูกทั้งหมด ก+ข คนละโปรเจกต์, 2=option 1, 3=ตามนั้น, 4=2026, 5=A,
6=เก็บทั้งหมด, Q51=ไม่แสดง, Q49=30"*. Exact strings live in `drafts/DRAFT-002-req005-profile-pack.md`
§(a)–(d); this table is the map from sheet line to file.

| Line | Decision | What you write |
|---|---|---|
| 1 profile | approved as drafted | `back/knowledge/PROFILE.md` = DRAFT-002 §(a) ruler-to-ruler; `PROFILE.citations.md` = §(b) |
| 1 SQ29 | **two separate projects** | both ICM bullets stay; note cites his answer |
| 2 skills | **option 1**, all nine | `about.ts` `SKILL_GROUPS`: `ai` += `DeepSeek`, `Kimi`, `xAI`, `Text-to-SQL / schema grounding`, `MQTT` · `backend` += `Go Gin` · `databases` += `SQLite` · `devops` += `nginx`, `pm2` — appended to each group's `items`, casing exactly as printed here |
| 3 C5 | approved | `site.ts` `SITE.role` = `'AI Engineer / Senior Software Engineer'`; `layout.tsx` `metadata.description` = DRAFT-002 §(d) **C5.a** sentence verbatim; `about/page.tsx` `metadata.description` = **C5.b** verbatim (only the leading role phrase changes in each) |
| 4 C8 | 2026 | `site.ts` `SITE.copyrightYear` = `'2026'` |
| 5 C9 | **A** | `About.config.ts` `ABOUT_INTRO.title` = `'Four years of shipping the thing nobody there had shipped before'` |
| 6 site-only claims | keep all 22 | nothing removed |
| Q51 | don't show | Education / Languages stay profile-only; `/about` gains nothing from them |

Not applied by this task (recorded, not yours): the career-total-or-one-pattern half of line 5 went
unanswered (nothing depends on it); Q49 = 30 is SPEC-007's ledger.

## Implementation Notes

**Fern, 2026-09-13.** Content-only, applied exactly as §Approved values maps it. Zero real calls: every `back/`
command ran with `GATEWAY_BASE_URL=http://127.0.0.1:9` (dead port) — **zero requests reached
`https://ai.develyst.online`**; the test suite re-points at the in-process stub (`config.ts` line 6).

### Files (7: 2 new under `back/knowledge/`, 5 modified under `front/src/`)

| File | Change |
|---|---|
| `back/knowledge/PROFILE.md` (new, CRLF, 4981 B) | DRAFT-002 lines 30–148 = the ruler-to-ruler body from `# Nichaphon Sayvav` to `- Location: Bangkok, Thailand` (the blank separator line 149 before the ruler was not carried; file ends with one newline) |
| `back/knowledge/PROFILE.citations.md` (new, CRLF, 11140 B) | DRAFT-002 lines 175–274 = the whole of section (b): its `## (b)` heading, the `> Destination` note, the 66-row table, the coverage prose and the six-group table (see FQ45) |
| `front/src/constant/site.ts` | `SITE.role` → `'AI Engineer / Senior Software Engineer'` (C5); `SITE.copyrightYear` → `'2026'` (C8, string constant, not computed) |
| `front/src/app/layout.tsx` | `metadata.description` → C5.a sentence; only the leading role phrase changed |
| `front/src/app/about/page.tsx` | `metadata.description` → C5.b sentence; only the leading role phrase changed |
| `front/src/components/partials/About/About.config.ts` | `ABOUT_INTRO.title` → `'Four years of shipping the thing nobody there had shipped before'` (C9 = A). Nothing else in the file; `CAREER_STATS.years` untouched |
| `front/src/constant/content/about.ts` | `SKILL_GROUPS`: `ai` += `'DeepSeek'`, `'Kimi'`, `'xAI'`, `'Text-to-SQL / schema grounding'`, `'MQTT'` · `backend` += `'Go Gin'` · `databases` += `'SQLite'` · `devops` += `'nginx'`, `'pm2'` — appended to each `items`, casing as printed in §Approved values; no new group/type/component |

All five `front/` files keep CRLF on every line (29/29, 213/213, 65/65, 12/12, 32/32). `git diff --stat`: 13 insertions, 7 deletions.

### How the two knowledge files were compared (DoD line 1)

`sed -n '30,148p' DRAFT-002 | diff - <(tr -d '\r' < back/knowledge/PROFILE.md)` → empty (IDENTICAL);
`sed -n '175,274p' DRAFT-002 | diff - <(tr -d '\r' < back/knowledge/PROFILE.citations.md)` → empty (IDENTICAL).
So both files are character-for-character the draft modulo CRLF. `PROFILE.md` carries no `[` at all (0 bracket lines),
so no citation marker / tag can be read to a visitor.

### `back/` untouched except the two additions (DoD line 2)

`find back -type f` with mtime + size, before vs after: the only diff is the two added lines (`PROFILE.md`,
`PROFILE.citations.md`). `ls back/knowledge/` = `PROFILE.citations.md PROFILE.md PROJECTS.md`. `PROJECTS.md` sha256
before = after = `8ca00b1daee06386be024223f12eabd125d81545d8fc19cb4cab853f63ffaa3e`. No code, test, fixture, config or
`package.json` changed; `back/test/fixtures/knowledge/PROFILE.md` (fictional) neither read from nor overwritten.

### Greps (DoD lines 3, 4, 9, 10)

- `grep -ri chatuchak back/knowledge back/src back/test front/src/` → **0**.
- Human names in `PROFILE.md`: `Nichaphon Sayvav` (lines 1, 5) and `Dong` (line 6) only — read the whole file; the
  other proper nouns are companies, products, schools and places, and neither resume reference appears.
- `grep -rn "Three years" front/src/` → **0**.
- **Class 1b = option 1**: `'Generative AI (Gemini, OpenAI)'` still at `about.ts:117` verbatim; each of the nine new
  strings greps to exactly 1 in `about.ts`; four groups touched (`ai`, `backend`, `databases`, `devops`).

### Step 10 — `back/` on the dead-port pin (DoD line 5)

- `cd back && bun test` → **42 pass, 0 fail, 175 expect() calls, 5 files**. `bunx tsc --noEmit` → exit **0**.
- `PORT=3001 GATEWAY_BASE_URL=http://127.0.0.1:9 bun run src/index.ts`: startup log is one line
  (`[back] portfolio-back 0.1.0 listening on http://localhost:3001 … — gateway http://127.0.0.1:9`) — **no
  `[knowledge] missing` line**. `curl /health` →
  `{"ok":true,"service":"portfolio-back","version":"0.1.0","knowledge":{"profile":true,"projects":true}}`.
- `bun run ws-client "hello"` → `accepted` · `step 1 understand started` · `error unreachable at_step 1` · `done`;
  server log `[chain] … fail kind=unreachable at_step=1 calls=0`. The chain now passes `knowledge_missing` and dies at
  the dead port, as the step says it must. 3001 freed afterwards (netstat clean); 3000 never touched (foreign pid left alone).

### `front/` (DoD lines 6, 7, 8, 9)

- `npx tsc --noEmit` → exit **0**. `npm run build` → exit **0**, "Compiled successfully", 10/10 static pages, no new
  error or warning line; postbuild copy ran.
- `npx next dev -p 3002` (3002, because 3000 is foreign and must not be touched) + the Browser pane on
  `http://localhost:3002/about`, read through the rendered accessibility tree / page text:
  - `/about` `<h1>` = "Four years of shipping the thing nobody there had shipped before" — **seen**.
  - Skill chips **seen** in order: Backend ends `… Bun + Hono, Go Gin`; AI and Robotics = `Generative AI (Gemini,
    OpenAI), RAG Chatbot / LLM Pipelines, Prompt Engineering, AI Robotics, Computer Vision, DeepSeek, Kimi, xAI,
    Text-to-SQL / schema grounding, MQTT`; Databases ends `… MongoDB, SQLite`; Tools and DevOps = `Docker, Git,
    Cloud Deployment, nginx, pm2`.
  - Footer **seen** on `/about`: "AI Engineer / Senior Software Engineer · Bangkok, Thailand" and "© 2026 Nichaphon
    Sayvav"; the same two strings confirmed in the served HTML of `/` (Home) by curl.
  - Served `<title>` on `/` = "Nichaphon Sayvav — AI Engineer / Senior Software Engineer"; `<meta name="description">`
    on `/` = C5.a verbatim and on `/about` = C5.b verbatim.
  - Caveat, stated plainly: the pixel screenshot came back blank (the pane was not painting); the "seen" above is the
    rendered DOM as the browser exposes it, not a pixel capture. Dev server stopped, 3002 freed.

### The three "state it" lines (DoD lines 10–12)

- **Class 1b: option 1** — shipped item untouched, nine added.
- **Line 6: keep all** — both profile files carry every line of the draft (the diffs above are empty); nothing removed.
- **The two ICM bullets: two separate projects — his word, REQ-005 §Approval record** (line 1 SQ29 clause,
  `ก+ข คนละโปรเจกต์`). Both bullets (`Built a CRM-connected AI assistant in four months …` and `Built an AI-powered RAG
  chatbot into the core CRM Sales application …`) and both citation rows are present, unchanged, in draft order.

### `git status` (DoD line 13)

Branch `D1`. `?? back/` plus exactly the five modified files: `front/src/app/about/page.tsx`, `front/src/app/layout.tsx`,
`front/src/components/partials/About/About.config.ts`, `front/src/constant/content/about.ts`, `front/src/constant/site.ts`.
**Nothing committed** — git is the human's.

No place where the draft and the approval record disagree was found, so nothing was picked and nothing asked beyond FQ45.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

**FQ45 (non-blocking, a recorded decision, 2026-09-13) — what "section (b), verbatim" spans.** Step 2 says
`PROFILE.citations.md` = DRAFT-002 section (b) verbatim. I took the **whole section** (lines 175–274: the `## (b)`
heading, the `> Destination once approved …` note, the 66-row table, the "Coverage, counted not claimed" prose and the
six-group table) — the literal reading, nothing dropped or reworded, so the comparison is a plain `diff`. The narrower
reading is the 66-row table alone. The loader never reads this file, so nothing runs differently either way; if you want
the table only, say so and I cut lines 175–178 and 246–274 in the rework — no other edit.

> answer (Sober, 2026-09-13): **Whole section stands — no cut.** The heading, the `> Destination` note and the coverage
> prose are the provenance record for the table (SPEC-005 D1 wants the *why* beside the *what*), and the loader reads it
> by name never, so there is nothing to gain by trimming. Your literal reading is the right one.

## Review

**Verdict: DONE — 2026-09-13, Sober.** Every DoD line re-run by me, not read off your notes. Zero real calls: every
`back/` command ran with `GATEWAY_BASE_URL=http://127.0.0.1:9`; **zero requests reached `https://ai.develyst.online`**.

- **Knowledge files (DoD 1):** `sed -n '30,148p' DRAFT-002 | diff - <(tr -d '\r' < PROFILE.md)` → empty; same for
  `175,274p` vs `PROFILE.citations.md` → empty. Rulers checked at lines 28/150 and 173/276 — the ranges are exactly the
  ruler-to-ruler body and the whole of §(b). CRLF by count: 119/119 and 100/100. `PROFILE.md` has 0 `[` lines.
- **`back/` otherwise untouched (DoD 2):** `ls back/knowledge/` = the three files; `PROJECTS.md` sha256
  `8ca00b1d…faa3e` unchanged; `git status` = `?? back/`; fixture first line still `FIXTURE — not a real person …`.
- **Greps (3, 4, 9, 10):** chatuchak 0 · "Three years" 0 · I read the whole `PROFILE.md`: the only human names are
  Nichaphon Sayvav (×2) and Dong; every other capitalised pair is a company, product, school or place ·
  `'Generative AI (Gemini, OpenAI)'` verbatim at `about.ts:117`; the nine strings and their groups match DRAFT-002
  §(c) rows 1–9 and the option-1 wording (draft lines 309, 385–389), casing incl. lowercase `nginx` / `pm2`.
- **C5/C8/C9 (diff read):** `SITE.role`, both `metadata.description` = DRAFT-002 §(d) C5.a / C5.b character-for-character
  (only the leading role phrase moved); `copyrightYear: '2026'` as a string, not computed; `ABOUT_INTRO.title` = candidate A;
  `CAREER_STATS.years` untouched. `git diff --stat` on the five files = 13+/7−, all CRLF.
- **Step 10 (DoD 5):** `bun test` **42 pass / 0 fail, 175 expects**; `bunx tsc --noEmit` 0; hono-in-gateway/chain grep 0;
  URL grep = `config.ts:48` only. Own run on **3013**: startup log one line, **no `[knowledge] missing`**; `/health` →
  `"knowledge":{"profile":true,"projects":true}`; `ws-client "hello"` → `accepted` · `step 1 understand started` ·
  `error unreachable at_step 1` · `done`; server log `fail kind=unreachable at_step=1 calls=0`. 3013 freed; 3000 untouched.
- **`front/` (DoD 6–8):** `npx tsc --noEmit` 0; `npm run build` exit 0, "Compiled successfully", 10/10 pages, no
  warning. In the **built** HTML: `/` carries "AI Engineer / Senior Software Engineer" in `<title>`, header and footer, the
  year `"2026"` in the RSC payload beside `Nichaphon Sayvav`; `/about` carries the new `<h1>` and all nine chips (each ×3 —
  HTML + payload). Served on 3004 and read through the DOM as well. Your blank-pixel caveat is honest and does not matter
  here: the strings are in the shipped bytes, which is the stronger check.
- **The three "state it" lines:** all three stated as required; SQ29 correctly cites *his* answer, not "unstated".

Nothing to rework. Observation only (no action): the served-HTML `©` renders as `© <!-- -->2026` because React splits the
expression — same as before this task; QA's picture round (REQ-005 AC-d) will see one "© 2026".
