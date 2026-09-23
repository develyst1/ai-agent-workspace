# TASK-015: FE — redesign v2: remove photographs, build the stage system
- Source: SPEC-009 (REQ-008)
- Owner: FE (Fern)
- Status: IN_PROGRESS (2026-09-23, Fern)
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

## Questions

## Review

## Added 2026-09-23 (Porter's copy landed — do these inside this task)
7. **StageScale caption W-10** (REQ-008 §Questions): "ตอนนี้คุณอยู่ขั้นที่ {n} จาก 5 — ยังมีต่อ" / "You're at stage {n} of 5 — there's further to go."; for `The Possibility` (n = 5) instead "คุณมาถึงขั้นสุดท้ายแล้ว" / "You've reached the last stage." Dictionary keys, `{n}` via `translate()`.
8. **Admin page copy** (REQ-004 §Questions) — replace TASK-009's PROVISIONAL keys with Porter's: table headers Date/Name/Email/Idea/Tier/Discount/Status; "ดูทั้งหมด"/"Show all" · "ย่อ"/"Collapse"; drawer title "ขั้นตอนที่ AI วิเคราะห์"/"How the AI analysed this"; the five step labels; meta "โมเดล {provider}/{model} · {latencyMs} มิลลิวินาที"/"Model {provider}/{model} · {latencyMs} ms"; close "ปิด"/"Close". No `admin.*` key may remain marked provisional.
- Extra DoD lines: screenshot of a result page showing the caption (a non-final tier **and** `The Possibility` variant if a fixture allows); `grep -rn "PROVISIONAL" src/lib/i18n/` → nothing.
