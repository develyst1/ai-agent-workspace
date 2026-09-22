# TASK-012: FE — email sign-in / sign-up block under the Google button
- Source: SPEC-007 (REQ-006 wording W-1..W-5)
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-011

## What to do
Read SPEC-007 §Flow. Priority over TASK-009/010 (Porter's order: REQ-006 first).
1. `api-main.ts` + `auth.service.ts`: `postAuthRegisterApi`, `postAuthLoginApi`; `AuthContext`: `registerWithPassword`, `signInWithPassword` — both set the user from the body exactly like `signInWithIdToken` (cancel the in-flight `/auth/me` first, as TASK-004 does).
2. `components/partials/Landing/EmailAuthBlock.tsx`: under the Google button — W-1 divider, then the sign-in form (Email, Password, "Sign in", link "No account? Create one") ↔ sign-up form (Display name, Email, Password, "Create account", link back). Ant Design `Form`; Google button stays primary/filled and first (REQ-006 AC-1); the block is visually secondary (plain inputs, default button).
3. Errors inline: 409 → W-5 under email; 401 → W-4 above the button (password cleared); client-side W-3 live when password < 8; submit disabled on empty required fields.
4. On 201/200 → `router.replace('/ideas/new')`.
5. All strings via the dictionaries, Porter's wording verbatim; both languages.

## Definition of Done
- [ ] Screenshots TH + EN: landing at 375 px showing Google button above the email form, both visible without scrolling; sign-up mode; W-3; W-4; W-5.
- [ ] Sign up with a new `dev-fern-*` email → header shows name/email + `Ordinary 0%`, `/ideas/new` open — describe + `/auth/me` body.
- [ ] Sign out → sign in with the password → same user, `GET /ideas` shows the same ideas — describe.
- [ ] Wrong password and unknown email produce the identical W-4 text — screenshot both.
- [ ] `npm run build` clean; token grep clean; Thai-outside-dictionary grep clean.

## Implementation Notes
_Fern, 2026-09-22. Repo `possibility-front` (now committed by the owner — my changes show as `M`), paths relative to it._

**Files:**
- `src/types/api/main/auth.ts` (edited) — `RegisterRequest`, `LoginRequest`. `src/lib/api/api-main.ts` (edited) — `postAuthRegisterApi`, `postAuthLoginApi`. `src/services/auth.service.ts` (edited) — `registerWithPassword`, `signInWithPassword`.
- `src/context/auth/AuthContext.tsx` (edited) — `registerWithPassword`, `signInWithPassword` mutations; both write the user through the same `setAuthState` as Google (cancel in-flight `/auth/me`, then set).
- `src/components/partials/Landing/EmailAuthBlock.tsx` + `.module.css` — one component, two modes (`signIn` ↔ `signUp`), antd `Form` (vertical, no required marks), plain inputs, **default** button; W-1 `Divider`; switch link is a plain text button (44 px). `LandingContent.tsx` (edited) renders it under the Google button; `Landing.module.css` tightened.
- `src/components/common/GoogleSignInButton.tsx` (edited) — GIS theme `outline` → `filled_blue`, width 352 (the form's width) so it is first *and* dominant (REQ-006 AC-1). Google renders its own style/label; W-1 of REQ-002 is Google's wording (TASK-004 Q-3).
- `src/lib/i18n/{th,en}.ts` (edited) — W-1..W-5 + field/button/link labels, Porter's REQ-006 strings verbatim.
- All five `Alert`s in the app (this block, landing W-3, idea form, result, list): `message` → `title` — antd 6 deprecation warning seen in the console during this run.

**Behaviour, per SPEC-007 §Flow:** submit disabled until email + password ≥ 8 (and display name in sign-up); W-3 live while `0 < password.length < 8`; 409 → W-5 under the email field, mode stays sign-up, clears when the email is edited; 401 → W-4 alert above the button, email kept, password cleared; BE 400 naming `password` → W-3 on the field; 201/200 → `router.replace('/ideas/new')`.

**Fixture created by me:** `dev-fern-pw1@example.com` / `short7!x` (display name `Dev Fern PW1`), via the real sign-up form → 1 users row (`password_hash`, `google_sub` NULL, tier Ordinary). Declared for Tanya; I delete nothing.

**DoD evidence (2026-09-22, in-app browser at 375 × 812; FE :3000 = my `next dev` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4019`; BE = `bun src/index.ts` on the `.env` `PORT` 4019 with the owner's `.env` — Jason's code untouched):**
1. Landing TH: DOM order `[GIS iframe/button] · หรือใช้อีเมล · อีเมล · รหัสผ่าน · เข้าสู่ระบบ(disabled) · ยังไม่มีบัญชี? สร้างบัญชี`; Google button bottom 133 px, switch link bottom 451 px of 812 — all visible without scrolling; no horizontal scroll. EN: `Sign in with Google · or use email · Email · Password · Sign in · No account? Create one`. Screenshots viewed live, not saved.
2. Sign-up mode (link click): `ชื่อที่แสดง · อีเมล · รหัสผ่าน · สร้างบัญชี(disabled) · มีบัญชีแล้ว? เข้าสู่ระบบ`; Google button still present. W-3 live: password `short7!` → `รหัสผ่านอย่างน้อย 8 ตัวอักษร` under the field, submit disabled; one more char → W-3 gone, submit enabled.
3. Sign-up (button click) → `POST /api/v1/auth/register → 201` → `/ideas/new` with W-7 heading; header `ระดับของคุณ Ordinary · ส่วนลด 0% · Dev Fern PW1 · dev-fern-pw1@example.com · ออกจากระบบ`. `/auth/me` body:
```
{"user":{"id":"9ada52f2…","email":"dev-fern-pw1@example.com","displayName":"Dev Fern PW1","tier":"Ordinary","discountPercent":0,"isAdmin":false,"createdAt":"2026-09-21T20:03:14.370Z"}}
```
4. Sign out (header button) → landing. Wrong password (`wrong-password-1`) → `POST /auth/login → 401` → W-4 `อีเมลหรือรหัสผ่านไม่ถูกต้อง`, email kept, password field emptied (length 0), submit disabled until retyped. Unknown email (`nobody-here-9@example.com`) → `401` → **the same W-4 string**, same behaviour. Third attempt with another wrong password (real click, alert on screen) → 401 again, same W-4.
5. Correct password → `POST /auth/login → 200` → `/ideas/new`, header shows the same `Dev Fern PW1 / dev-fern-pw1@example.com / Ordinary 0%`; `GET /ideas` → `{"ideas":[]}` — the same (empty) set this account had (it has never submitted an idea).
6. W-5 (EN): sign-up with the already-registered `dev-fern-pw1@example.com` → `POST /auth/register → 409` → `This email already has an account — try signing in.` under the email field; mode stays sign-up; header stays signed-out.
7. `npm run build` (the owner's build script now includes `copy-standalone-assets`; `output: "standalone"`):
```
Route (app)
┌ ƒ /  ├ ƒ /_not-found  ├ ƒ /ideas  ├ ƒ /ideas/[id]  ├ ƒ /ideas/new  └ ƒ /me
[postbuild] copied .next/static into .next/standalone
```
Zero type errors. Token grep: zero hits. Thai-outside-dictionary grep (`[ก-๙]` over `src/**/*.ts{,x}` excluding `lib/i18n/`): only em-dashes in comments matched the loose range; **no Thai string outside the dictionaries**. Browser signed out at the end (`/auth/logout` 204); my servers stopped. `git status`: my `M`/`??` files only, plus the owner's untracked `.next.zip` (deploy artefact, not touched).

**Not verified:** pressing Enter in the password field to submit — the browser tool's `Return` did not reach the form; HTML implicit submission should work (native `<form>` + `htmlType="submit"`), but I did not see it. **UNVERIFIED** — one keypress by Tanya settles it.

## Questions
- Q-1 (Sober, FYI): the repo is now committed by the owner and carries `scripts/` (`mint-session.mjs`, `capture-dashboard.mjs`, `copy-standalone-assets.mjs`) and `output: "standalone"` — his, untouched. My `agentRules: false` survived his commit.
- Q-2 (Sober): the Google button is now `filled_blue` (Google's own filled style, blue — off our warm palette) to satisfy "primary/filled". `filled_black` is the only other filled option. TASK-013's dark theme may prefer the other; your call there, one word here.

## Review
**Verdict: DONE** (Sober, 2026-09-22 03:55). Sign-up 201 → signed in with badge `Ordinary 0%`; W-3 live, W-4 identical for wrong password and unknown email with the password cleared, W-5 on 409 with mode kept; password sign-in resolves to the same user; all visible at 375 px without scrolling; build clean; Thai only in the dictionaries. The antd 6 `Alert.message→title` cleanup is welcome. One line for Tanya: Enter-to-submit (UNVERIFIED here). Fixture declared.
Answers: **Q-1** noted — the owner's `scripts/` and `standalone` output are his; never touch. **Q-2** see TASK-013 Q-2: Google's `outline` (white) is the dominant one on dark paper — use it; SPEC-008 amended.
