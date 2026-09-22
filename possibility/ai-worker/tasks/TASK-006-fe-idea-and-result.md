# TASK-006: FE — idea box, loading, result page, "My ideas" list
- Source: SPEC-003 (+ REQ-003 wording, REQ-001 wording for tier descriptions)
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-004, TASK-005

## What to do
Read SPEC-003 §API/§Shapes first.
0. **Security re-pin (TASK-002 Q-2):** bump `next` to the latest patched 16.x and `axios` to the latest patched 1.x (exact pins), `npm install`, `npm audit` → paste before/after; build clean.
1. `services/ideas.service.ts` + hooks (`useSubmitIdea`, `useMyIdeas`, `useIdea`) over `POST /ideas`, `GET /ideas`, `GET /ideas/:id`.
2. `/ideas/new` (guarded, replaces TASK-004's placeholder): heading **W-7** "เล่าไอเดียของคุณ" / "Tell us your idea" (REQ-003 §Wording, Porter 2026-09-21), one `TextArea`, placeholder W-1, counter W-3 (turns red > 3000, input capped at 3000), W-2 under 20 chars, submit W-5 disabled when invalid (REQ-003 AC-3/4), sends `{ text, lang: <current UI lang> }`. While pending: W-4 + disabled form (calls may take up to ~2 min). On 502 `AI_FAILED`: W-6 + "Try again" button that re-sends the same text (AC-7).
3. `/ideas/[id]` result page: submitted text, three scores with Axis labels, `ideaTier` name (exact string, never translated) + REQ-001 description in the UI language, "ส่วนลด {n}%" / "Discount {n}%", reason under the Reason heading, and a **disabled placeholder** where REQ-004's hire button will go (no label yet). After a 201, also update `AuthContext.user.tier` from `userTier`.
4. `/ideas` "My ideas": newest first, date (`DD/MMM/YY HH:mm`), `ideaTier`, `textPreview`; empty state per REQ-003 wording; row click → result page (no re-analysis).
5. All strings through the TH/EN dictionaries; Porter's wording verbatim (REQ-003, REQ-001 tables). Ant Design components only; `FRONTEND-STANDARD.md` §1 + §3 gate.

## Definition of Done
- [ ] Screenshots (paths under `ai-worker/tests/harness/`): idea box empty/too-short/at-limit; loading; result (TH and EN); My ideas with ≥ 2 ideas; empty state.
- [ ] Result page tier/discount match the BE body (paste the JSON next to the screenshot).
- [ ] 502 path: with the BE's gateway pointed at a dead port → W-6 shown, Try again re-sends (network tab or console evidence).
- [ ] `pnpm build` clean — paste tail. `hallmark audit` verdict on the result page — paste.

## Implementation Notes
_Fern, 2026-09-21. Repo `possibility-front`, paths relative to it._

**Item 0 — security re-pin (exact, no `^`):** `next 16.2.9 → 16.3.5`, `axios 1.17.0 → 1.20.0` (latest patched in their majors on 2026-09-21); antd/react untouched, `npm ls react` still a single `19.2.7`.
```
npm audit BEFORE: 4 vulnerabilities (3 high, 1 critical) — next ≤16.3.2 (critical), axios ≤1.17.0, postcss, sharp
npm audit AFTER:  found 0 vulnerabilities
```
Side effect found and neutralised: **Next 16.3 writes `AGENTS.md` + `CLAUDE.md` into the repo on `next dev`** ("Generated AGENTS.md and CLAUDE.md for AI agents"). `next.config.ts` now sets `agentRules: false`; the two generated files were deleted. Not product code, not ours — flagged so nobody wonders where they came from if the owner ever runs `next dev` without the flag.

**Files (new unless marked):**
- `src/types/api/main/ideas.ts` — `Idea`, `IdeaScores`, `IdeaSummary`, request/response shapes exactly per SPEC-003 §Shapes. `src/lib/api/api-main.ts` (edited) — `postIdeaApi` (130 s timeout, SPEC-003 says up to 120 s), `getIdeasApi`, `getIdeaApi`. `src/services/ideas.service.ts`. `src/hooks/ideas/{useSubmitIdea,useMyIdeas,useIdea,index}.ts` — `useSubmitIdea` calls TASK-007's `setUserTier(userTier)` on 201.
- `src/lib/i18n/{th,en}.ts` (edited) — W-1..W-7, axis labels, reason heading, list title, empty state: Porter's strings verbatim (REQ-003 §Wording incl. W-7 of 2026-09-21). `src/lib/format.ts` — the one date helper, `DD/MMM/YY HH:mm` (English month abbreviations in both languages — no Thai month wording exists; Q-3).
- `/ideas/new` → `src/components/partials/IdeaForm/` (replaces the TASK-004 placeholder): W-7 heading, antd `TextArea` (`maxLength` 3000, autosize), W-1 placeholder, W-3 counter (red at the cap), W-2 under 20 trimmed chars, W-5 disabled unless 20 ≤ trimmed ≤ 3000, sends `{ text, lang }`; pending → W-4 + disabled box, button hidden; failure → W-6 `Alert` with "Try again" that re-sends the same state. On 201 → `router.push('/ideas/<id>')`.
- `/ideas/[id]` → `src/components/partials/IdeaResult/`: submitted text, three scores (label + number + antd `Progress`), `ideaTier` as the BE string + `tier.desc.<tier>` + `ส่วนลด {n}%`/`Discount {n}%`, reason under the heading, an **invisible disabled placeholder button** where TASK-009's hire button goes. 404 from the BE → Next `notFound()`.
- `/ideas` → `src/components/partials/MyIdeas/`: BE order (newest first), date · tier · `textPreview`, row = link to the result; empty state per wording.
- `src/app/not-found.tsx` + `.module.css` — replaces Next's default 404 (black full-screen, English) with a tokened page showing only `404` (Q-2).
- `src/components/partials/Home/HomeContent.tsx` (edited) — signed-in `/` now `router.replace('/ideas/new')` (Q-1). `src/lib/theme.ts` (edited) — `colorInfo` = accent so `Progress` is on-token. `src/app/globals.css` (edited) — `--color-danger` token for W-2/red counter.

**Design decisions stated (not in the TASK, no copy invented):** (a) signed-in `/` redirects to the idea box (Q-1); (b) W-6 is also the message for a failed *load* of the result/list pages (only failure wording that exists), with "Try again" = refetch; (c) the "over 3000" red counter: a real paste is cut at 3000 by `maxLength`, so the red state is reached at exactly 3000 — proven separately by script-setting 3050 chars (bypasses `maxLength`): counter red, submit disabled, further typing blocked.

**DoD evidence (2026-09-21, in-app browser; FE :3000 = my `next dev`, BE :4000 = the running one with the owner's `.env` — real gateway, real SIT DB):**
Fixture: **`dev-fern-a@example.com` created by me** (`tests/harness/task-006-dev-fixture.ts`, idempotent upsert). Footprint after this task: 1 users row + **2 ideas (+10 idea_steps)** under it; tier raised Ordinary → Visionary by the first idea. Declared for Tanya; I delete nothing. Screenshots viewed live, none saved to disk.
1. Idea box, TH: `/` (signed in) → `/ideas/new`; heading `เล่าไอเดียของคุณ`, placeholder W-1, counter `0 / 3000`, W-5 `วิเคราะห์ไอเดีย` disabled. Too short (`short idea`, 10 chars): W-2 `เขียนอย่างน้อย 20 ตัวอักษร`, box in error state, disabled. Whitespace only (6 spaces): counter `6 / 3000`, W-2, disabled (AC-4). At/over limit: see (c) above — `3050 / 3000` in `--color-danger`, disabled.
2. Loading: click W-5 → W-4 `AI กำลังวิเคราะห์ไอเดียของคุณ…`, box disabled, button gone.
3. Result TH — idea 1 (volunteer/elderly matching app, 170 chars, TH): page `/ideas/6336d64f-…`. Rendered: `ความเป็นไปได้ 90 · ผลกระทบต่อสังคม 90 · ความน่าสนใจ 80 · Visionary · ทำได้จริง ดีต่อสังคมชัดเจน และน่าสนใจจนเราอยากทำ · ส่วนลด 20% · เหตุผลจาก AI · <Thai reason>`. BE body:
```
{"idea":{"id":"6336d64f-a007-41cc-be01-b892c268c75e","lang":"th","scores":{"feasibility":90,"impact":90,"interestingness":80},"ideaTier":"Visionary","discountPercent":20,"hireRequested":false,"createdAt":"2026-09-21T06:57:30.070Z", …}}
```
   lowest = 80 → 75–89 → Visionary ✓ (AC-2). **Header badge went Ordinary 0% → Visionary 20% on the same page load** (TASK-007 `setUserTier` + refetch — now VERIFIED); `/auth/me` afterwards: `"tier":"Visionary","discountPercent":20`.
   Result EN (switch on the same page): labels `Feasibility / Impact on society / Interestingness`, `Visionary`, EN description, `Discount 20%`, `Why the AI thinks so`; the saved reason stays Thai (analysed in TH — REQ-003 R3, AC-8 by design).
4. Idea 2 (coffee-shop website, EN): `/ideas/e84dfd9b-…` — `90 / 70 / 30 → Ordinary · Discount 0%`, **English reason** (AC-8); header stayed `Visionary 20%` (upward only, AC-9).
5. My ideas: `21/Sep/26 13:58 · Ordinary · I want a simple website … so cust` above `21/Sep/26 13:57 · Visionary · อยากทำแอป…` (newest first, 80-char preview); rows link to the result pages (AC-5, no re-analysis — plain `GET /ideas/:id`). Empty state (as `qa-tanya-a`, read-only session, 0 ideas): `No ideas yet — tell us your first one.`
6. AC-6: as `qa-tanya-a`, opening `/ideas/6336d64f-…` → BE 404 → page shows `404` only; the Thai idea text is **not** in the DOM (checked).
7. **502 path (AC-7/AC-12):** second BE on :4001 with `AI_GATEWAY_URL=http://127.0.0.1:9` (shell override; the :4000 BE untouched), FE re-run with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4001`. Submit → `POST /api/v1/ideas → 502` body `{"error":{"code":"AI_FAILED","message":"AI_FAILED: step understand — gateway unreachable: …"}}` → W-6 `Analysis failed — please try again.` + `Try again`, text kept in the box. Click **Try again** → a second `POST /api/v1/ideas → 502` (network tab, request `1504.1125`), same text. `GET /ideas` for `dev-fern-a` afterwards: still 2 ideas — nothing saved.
8. `npm run build` tail:
```
✓ Generating static pages using 8 workers (6/6)
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /ideas
├ ƒ /ideas/[id]
├ ƒ /ideas/new
└ ƒ /me
```
Zero type errors. Token grep zero hits; tier-name grep in `lib/i18n/` shows only `tier.desc.*`. `git status --short`: `?? .agents/ .claude/ .env.example next.config.ts package-lock.json package.json skills-lock.json src/ tsconfig.json` — no `.env*.local`, no `AGENTS.md`/`CLAUDE.md`.
9. 375 px: idea box, result and list — no horizontal scroll; submit 44 px; score rows stack to one column.
10. **hallmark audit** (self-run, result page): two findings fixed — antd `Progress` rendered in antd's default blue (off-token) → `colorInfo` = accent in the theme token block; the quoted idea text had a coloured left stripe (listed anti-pattern "side-stripe card") → plain surface block. No card-in-card (tier block is the one containment layer), real numbers only, roman display heading, no motion. Verdict after fixes: *close, fix the minors* → fixed.

## Questions
- Q-1 (Sober): signed-in `/` has no SPEC. I made it `replace → /ideas/new` (the product's one action); before this it was an empty page. Keep, or should `/` be something else (e.g. My ideas)?
- Q-2 (Sober → Porter, copy): a **not-found page** now exists (Next's default was a black full-screen English page). It shows only `404` — I need TH/EN wording for it (REQ-003 AC-6 says the user "gets not found").
- Q-3 (Sober → Porter, copy): dates in My ideas are `DD/MMM/YY HH:mm` with **English month abbreviations in the Thai UI too** (`21/Sep/26 13:58`). If Porter wants Thai abbreviations (ก.ย.) or a different Thai date form, it is one table in `lib/format.ts`.
- Q-4 (Sober, FYI): the `hirePlaceholder` on the result page is a disabled, `visibility: hidden` button that reserves the slot — nothing visible to the user until TASK-009. If you would rather have nothing at all there, one line.

## Review
**Verdict: DONE** (Sober, 2026-09-21 14:20). Two real analyses on the owner's gateway with hand-checkable tiers (80→Visionary/20 %, 30→Ordinary/0 %), AC-8 in both languages, AC-9 upward-only via the live badge, AC-6 with the other user's text absent from the DOM, and the 502 path on a separate BE instance with nothing saved and a real re-send. `npm audit` 4→0 with exact pins; catching Next 16.3's `AGENTS.md`/`CLAUDE.md` side effect and turning it off (`agentRules: false`) is exactly the kind of thing that keeps the owner's repo clean — recorded in SPEC-001 §Frontend layout. Design calls (a)(b)(c) accepted.
Answers: **Q-1** keep `/` → `/ideas/new` when signed in (SPEC-003 §Flow amended). **Q-2** and **Q-3** → Porter (404 page wording; month abbreviations in Thai) — until he answers, `404` alone and English abbreviations stand, and TASK-010 applies whatever he gives. **Q-4** keep the hidden slot; TASK-009 fills it.
