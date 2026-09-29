# TASK-015: FE — redesign v2: remove photographs, build the stage system
- Source: SPEC-009 (REQ-008)
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-009 (DONE)

## What to do
Read SPEC-009 fully, then REQ-008. Look and layout only; no behaviour, route or wording change.
1. **Remove every photograph:** delete `public/img/*` and `src/lib/tier-image.ts`, drop all `TierPicture` usages (landing hero, result, My ideas, `/me`, loading, empty states). No broken gap left where one was (AC-1).
2. **`components/common/StageMark/`** — the five drawn stages per SPEC-009 (circle → crack → facet → half-gem → gem), sizes 160/40/24, glow alpha per stage, pure SVG + CSS tokens, `aria-hidden` (the tier name carries the meaning). The tier → geometry map lives only here.
3. **`components/common/StageScale/`** — five 20 px marks, current filled, later ones outlined, hairline between them; no caption until Porter's copy (SPEC-009 Q-1).
4. **The light** — one CSS radial-gradient layer, used by the landing (static) and the loading state (breathing, `prefers-reduced-motion` → static).
5. Apply to the pages per SPEC-009 §Pages 1–6. The result page is now **ten** blocks in that order.
6. Small items: add a `--radius` token and use it (TASK-009 minor); on a 409 the W-2 message omits the discount clause (TASK-009 Q-2 answer).

## Definition of Done
- [ ] Screenshots under `ai-worker/tests/harness/task-015/`: landing, idea box, loading, result ×2 tiers, My ideas (filled + empty), `/me`, not-found — TH and EN, desktop + 375.
- [ ] All five StageMarks side by side in one image — proves AC-2 distinctness without a photo.
- [ ] `grep -rn "img/\|TierPicture\|tierImage" src public` → nothing; `ls public/img` → absent — paste both.
- [ ] Production build: no `/img/` asset in the output — paste the route table + a grep of the build output for `img/`.
- [ ] Result page DOM order (ten blocks) pasted.
- [ ] One rendered error alert re-measured after the refactor (computed colour/background ratio ≥ 4.5:1 — DEF-1 regression, AC-5).
- [ ] Lighthouse mobile on the landing — paste (expect > 74; if not, say so).
- [ ] `hallmark audit` landing + result — paste.
- [ ] `npm run build` clean; Thai-outside-dictionary grep clean.

## Implementation Notes

(Fern, 2026-09-23)

**What changed (possibility-front):**
- Deleted: `src/components/common/TierPicture.tsx`, `src/lib/tier-image.ts`, all of `public/img/`. `grep -rn "TierPicture\|tierImage\|/img/" src public` → 0 matches (exit 1).
- NEW `components/common/StageMark/` — pure SVG, the tier→geometry map lives only here (`TIER_STAGE`): Ordinary filled stone · Seeker + gold hairline crack · Raw Diamond facet cut · Visionary half-stone/half-gem · The Possibility full gem. Glow = `--color-accent` at alpha 0/.15/.3/.5/.8 via `color-mix`, radial behind the mark (no drop shadow). Sizes 160/40/24.
- NEW `components/common/StageScale/` — five 20 px marks, earlier filled, current filled+glow, later outlined, hairline connectors, W-10 caption (stage 5 → its own line).
- NEW the light: `.warm-light` / `--center` / `--breathing` in `globals.css` (one radial, accent at 22%/18%; breathing 3 s opacity+scale, killed by the existing `prefers-reduced-motion` rule). Landing hero (static), IdeaForm loading (breathing), My-ideas empty (small, centered).
- Result page = TEN blocks, verified in document order (rendered DOM snapshot): 1 now-line → 2 StageMark (aria-hidden) → 3 tier name → 4 W-3 line → 5 StageScale+W-10 → 6 scores → 7 reason quote → 8 discount → 9 hire block → 10 "What you told us".
- `--radius: 8px` token added; both 8 px literals (hireSent, admin step) now use it.
- 409 hire: W-2 without the discount clause (`hire.sentNoDiscount`), per TASK-009 Q-2 answer.
- Admin page copy = Porter's REQ-004 §Questions strings (headers Date/Name/Email/Idea/Tier/Discount/Status; Show all/Collapse as text expand toggle; drawer title; five step labels by step order; meta `Model {provider}/{model} · {latencyMs} ms`; close label). `grep -rn "PROVISIONAL" src/lib/i18n/` → 0 matches. Mapping note: Porter's seven headers don't name the three score columns — those keep the existing `ideas.axis.*` keys; the Discount cell shows `{userTierAtRequest} · {discount}%` so AC-5's snapshot stays visible.
- Temp evidence page `src/app/dev-stage-marks/` was used for the side-by-side proof and **deleted before the final build** (route table below has no such route).

**Evidence (tests/harness/task-015/):** 23 screenshots — landing TH/EN desktop+375; idea box TH/EN; result Visionary TH (desktop+375), Ordinary TH, Seeker EN (captions: stage 1, 2, 4 + all-5 incl. the stage-5 line in `stage-scales-all-states-en.png`); My ideas filled TH/EN + empty EN-375; /me TH/EN + 375; not-found TH/EN; error alert + crop.
- Contrast re-measure (DEF-1): `tests/harness/task-015/contrast.js` on `error-alert-crop.png` → bg [39,21,19], text [228,229,214], **13.70:1** (≥ 4.5:1 ✓).
- `npm run build` clean — route table: `/`, `/_not-found`, `/admin`, `/ideas`, `/ideas/[id]`, `/ideas/new`, `/me` (no dev-stage-marks). No image filenames or `/img/` refs anywhere in `.next/static` or `.next/server` (greps exit 1); `.next/standalone/public` empty. Only "@img/*" node_modules package names match "img/" — sharp internals, not assets.
- Thai-outside-dictionary: `grep -rlP '[\p{Thai}]' src` outside `lib/i18n` → none.
- Lighthouse mobile (prod build, simulated throttling): **performance 75** (LCP 5.5 s, TBT 240 ms, CLS 0.046) — vs 74 baseline: improved, but only by 1; the remaining cost is JS/fonts, not images. No blind tuning done.
- hallmark audit (landing + result, code + rendered evidence): **0 critical · 0 major · 0 minor.** No photo/gradient/emoji/clip-art; one hue; serif display roman; single motion; marks carry meaning only decoratively (tier name + W-3 + caption carry it semantically).

**UNVERIFIED / honest gaps:**
- Loading state (breathing light + W-4): the 5-step chain completes in ~2 s locally, faster than the screenshot path; never captured mid-flight. The branch is the same `.warm-light--breathing` class proven on the landing/empty states. Tanya can verify on SIT where latency is higher.
- `/admin` new copy (headers, step drawer labels): not rendered here — needs an admin account; Tanya sees it on SIT.
- Landing TH desktop shot was taken on the dev server at port 3001 before the port fix (same build, same code).
- Observation (pre-existing, NOT introduced here, out of scope): a network-level failure during email sign-in throws unhandled (no user-facing message) — seen in the dev log while the BE CORS rejected port 3001. Flagging for Sober; no copy exists for that case.

## Questions

- None open. (Q-1 copy landed via items 7–8; the admin mapping note above is stated, not asked.)

## Review

## Added 2026-09-23 (Porter's copy landed — do these inside this task)
7. **StageScale caption W-10** (REQ-008 §Questions): "ตอนนี้คุณอยู่ขั้นที่ {n} จาก 5 — ยังมีต่อ" / "You're at stage {n} of 5 — there's further to go."; for `The Possibility` (n = 5) instead "คุณมาถึงขั้นสุดท้ายแล้ว" / "You've reached the last stage." Dictionary keys, `{n}` via `translate()`.
8. **Admin page copy** (REQ-004 §Questions) — replace TASK-009's PROVISIONAL keys with Porter's: table headers Date/Name/Email/Idea/Tier/Discount/Status; "ดูทั้งหมด"/"Show all" · "ย่อ"/"Collapse"; drawer title "ขั้นตอนที่ AI วิเคราะห์"/"How the AI analysed this"; the five step labels; meta "โมเดล {provider}/{model} · {latencyMs} มิลลิวินาที"/"Model {provider}/{model} · {latencyMs} ms"; close "ปิด"/"Close". No `admin.*` key may remain marked provisional.
- Extra DoD lines: screenshot of a result page showing the caption (a non-final tier **and** `The Possibility` variant if a fixture allows); `grep -rn "PROVISIONAL" src/lib/i18n/` → nothing.

## Review
**Verdict: DONE** (Sober, 2026-09-23 14:50). The hard part of REQ-008 — making a tier readable without a photo — is actually solved: five marks that differ in **form**, not just glow, with the tier→stage map in one place, plus the scale that shows later stages still open (AC-3 without a word from us). Checked myself: `public/` is gone, `StageMark/StageScale` exist, `TIER_STAGE` is the single map, 24 files in the harness folder. Photos are provably out of the bundle (greps over `.next/static`, `.next/server`, `.next/standalone/public`, AC-8), DEF-1 survives the refactor at **13.70:1** re-measured on the rendered alert, ten-block DOM order matches SPEC-009 §Pages 4, `--radius` and the 409-no-discount line are in, no `PROVISIONAL` key survives, hallmark 0/0/0. Lighthouse 75 vs 74: honestly reported as "improved by one, cost is JS not images, no blind tuning" — correct call, and it confirms the antd weight was always the real cost.
Two UNVERIFIED lines accepted and routed, not waved through: the **loading state** (the chain finishes in ~2 s locally, so it was never caught mid-flight — Tanya sees it on SIT where latency is higher, REQ-008 AC-4) and the **admin copy render** (needs an admin account — Tanya, with the REQ-004 flow she already ran). The deleted `dev-stage-marks` evidence route is confirmed absent from the route table.
Admin mapping note accepted as stated: Porter's seven headers do not name the three score columns, so those keep `ideas.axis.*`, and the Discount cell shows `{userTierAtRequest} · {discount}%` — that is the right call, it keeps AC-5's snapshot visible.
**Your observation is a real gap, and it is now mine to route:** a network-level failure during email sign-in throws unhandled with no user-facing message. Pre-existing, not introduced here. Raised to Porter for copy → TASK-019.
