# TASK-007: FE — header tier badge + `/me` profile page
- Source: SPEC-004
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-004 (AuthContext, header)

## What to do
Do not start until TASK-004 is in REVIEW. Small task.
1. `types/api/user.ts`: add `discountPercent: number` to `User` (BE adds it in TASK-005).
2. `components/layout/Header.tsx`: when signed in, a badge `ระดับของคุณ {tier}` / `Your tier {tier}` + `ส่วนลด {n}%` / `Discount {n}%` (REQ-001 §wording). The tier string is rendered from `user.tier` as-is — never via a dictionary key.
3. `app/me/page.tsx` (guarded): display name, email, the badge, the tier's one-line description from REQ-001's TH/EN table (this one IS in the dictionaries, keyed by tier), link to "My ideas".
4. After `POST /ideas` succeeds (TASK-006), `AuthContext` is updated from `userTier` — coordinate: if TASK-006 is not built yet, expose `setUserTier(tier)` on the context now so TASK-006 just calls it.

## Definition of Done
- [ ] Screenshot: header badge for a brand-new account → `Ordinary` · `0%` (TH and EN) — REQ-001 AC-1.
- [ ] Screenshot: `/me` in TH and EN; tier name identical in both — AC-6.
- [ ] `grep -rn "Raw Diamond\|Visionary" lib/i18n/` shows only the description entries, never a tier-name key — paste.
- [ ] `pnpm build` clean — paste tail.

## Implementation Notes
_Fern, 2026-09-21. Repo `possibility-front`, paths relative to it._

**Files:**
- `src/types/api/main/auth.ts` (edited; this is where `User` lives since TASK-004, not `types/api/user.ts`) — `discountPercent: number` added.
- `src/lib/i18n/{th,en}.ts` (edited) — `tier.yourTier`, `tier.discount` (REQ-001 labels), `tier.desc.<exact tier string>` ×5 (REQ-001 table), `ideas.myIdeas` (REQ-003 list title, reused as the link label). No tier-name key exists — the DoD grep below is the proof.
- `src/components/common/TierBadge.tsx` + `.module.css` — `ระดับของคุณ {tier}` / `Your tier {tier}` · `ส่วนลด {n}%` / `Discount {n}%`; `{tier}` is `user.tier` rendered as-is, `{n}` is `user.discountPercent` from the BE (tabular-nums).
- `src/components/layout/Header/Header.tsx` + `.module.css` (edited) — badge before the identity when signed in. **Scope note:** the identity (name + email) is now a `Link` to `/me` — the TASK does not say how a user reaches `/me`, and an unreachable page would be worse; no copy involved. Say the word and I revert to plain text.
- `src/app/me/page.tsx` + `src/components/partials/Profile/{ProfileContent.tsx,Profile.module.css,index.ts}` — guarded by `RequireUser`: name, email, badge, `t("tier.desc.<tier>")`, link `/ideas` labelled `ideas.myIdeas` (the `/ideas` page itself arrives with TASK-006 — today the link 404s).
- `src/context/auth/AuthContext.tsx` (edited) — `setUserTier(tier)`: writes the tier into the cached user at once, then `invalidateQueries(["authMe"])` so `discountPercent` comes back from the BE (SPEC-004: the FE never computes discounts; `POST /ideas` returns only `userTier`). **UNVERIFIED — nothing calls it until TASK-006**; typechecked only.
- `hallmark` installed per TASK-002 Q-3 answer: `npx skills add nutlope/hallmark` wrote `.agents/skills/hallmark/`, `skills-lock.json` and a `.claude/` symlink (the installer's standard footprint) — all three now show in `git status`; the owner decides what he commits.

**DoD evidence (2026-09-21, in-app browser against FE :3000 + BE :4000 — both were Tanya's servers still up from the owner's run, same repos on disk, not restarted by me):**
1. Badge for an **Ordinary** account, TH and EN (AC-1) — session minted **read-only** for Tanya's existing `qa-tanya-a` (tier Ordinary, no write; harness `tests/harness/task-007-session-for.ts`), cookie placed by hand. Header text read from the DOM:
   - TH: `Possibility · ระดับของคุณ Ordinary · ส่วนลด 0% · QA Tanya A · qa-tanya-a@example.com · ออกจากระบบ · TH EN`
   - EN: `Possibility · Your tier Ordinary · Discount 0% · QA Tanya A · qa-tanya-a@example.com · Sign out · TH EN`
   BE body for that cookie: `{"tier":"Ordinary","discountPercent":0,…}` — badge matches. Screenshots viewed live, not saved (Tanya's screenshots will be the record).
2. `/me` TH: `QA Tanya A / qa-tanya-a@example.com / ระดับของคุณ Ordinary ส่วนลด 0% / ไอเดียทั่วไป มีคนทำอยู่แล้วมากมาย / ไอเดียของฉัน`. `/me` EN: `… / Your tier Ordinary Discount 0% / A common idea — many like it already exist. / My ideas`. Tier name `Ordinary` identical in both (AC-6). Language switch + reload keep the language (TASK-002 mechanism).
3. `grep -rn "Raw Diamond\|Visionary" src/lib/i18n/`:
```
src/lib/i18n/en.ts:15:  "tier.desc.Raw Diamond": "A genuinely new angle, useful beyond you.",
src/lib/i18n/en.ts:16:  "tier.desc.Visionary": "Feasible, clearly good for society, and interesting enough that we want to build it.",
src/lib/i18n/th.ts:14:  "tier.desc.Raw Diamond": "มีมุมใหม่จริง เป็นประโยชน์เกินกว่าตัวผู้ขอ",
src/lib/i18n/th.ts:15:  "tier.desc.Visionary": "ทำได้จริง ดีต่อสังคมชัดเจน และน่าสนใจจนเราอยากทำ",
```
Only description entries.
4. `npm run build` tail:
```
✓ Generating static pages using 6 workers (5/5)
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /ideas/new
└ ƒ /me
```
Zero type errors. Token grep (`#hex`, `font-family:`, `transition-all`, `z-index`) over `src/`: zero hits.
5. 375 px: no horizontal scroll, no overlap; the signed-in header stacks to 3 rows (badge / identity / buttons, 159 px tall). Functional; whether a compact phone header is wanted is a design call for you, not something I invent.
6. **hallmark audit** (self-run against `references/anti-patterns.md`, header + `/me`): no critical/major hit — paired roman type (Noto Sans Thai + Noto Serif Thai), tokens only, `tabular-nums` on the %, instant focus ring, no card-in-card, no motion. One minor found and fixed: the identity link had no visible link affordance → underline on hover **and** focus-visible. Verdict: *close, fix the minors* → minors fixed.
7. Bonus, since DR-7 landed: signed-out `/` now renders the real Google button (GIS iframe + `role=button`, Thai locale) — the TASK-004 line "Google button renders" is no longer UNVERIFIED on my side; Tanya already proved the full flow (TEST-001). Browser signed out afterwards (`/auth/logout` 204).
`git status --short`: `?? .agents/ .claude/ .env.example next.config.ts package-lock.json package.json skills-lock.json src/ tsconfig.json` — no `.env*.local`.

## Questions
- Q-1 (Sober): the identity→`/me` link in the header (see scope note) — keep or revert?
- Q-2 (Sober, FYI not blocking): the phone header at 375 px is 3 rows tall now that badge + identity + sign-out + switch all live there. If a compact variant is wanted (e.g. badge only on `/me` on phones), that is a SPEC-004 change; I did not decide it.

## Review
**Verdict: DONE** (Sober, 2026-09-21 14:15). Badge and `/me` proven TH/EN against the real BE for an Ordinary account; the tier-name grep shows only descriptions (SPEC-006 rule 3 holds); build clean; hallmark installed and audited; `setUserTier` later proven live in TASK-006 (badge Ordinary→Visionary on the result page). Good judgement making the identity a link — an unreachable page is the worse outcome.
Answers: **Q-1** keep the link. **Q-2** decided: on viewports < 600 px the header hides the badge (it lives on `/me`, one tap away) — SPEC-004 §Flow 1 amended; do it inside TASK-010's sweep, not now.
