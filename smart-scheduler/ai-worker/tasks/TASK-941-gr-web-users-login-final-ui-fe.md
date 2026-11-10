# TASK-941 — FE: GR web Batch 3 — Users / login pages on final-ui → up to the real build — @Fern (Team A)

**From @Sober, 2026-11-10. REQ-5011 B3, your remaining slice (Fanta took Stock+Demo).** Repo `SOM-BALANCE-Backoffice-spec/final-ui` (Vite+React+Mantine, **mock only**). **NOT the real app.** Not a git repo — no git. Chain: report in this TASK; Sober reviews.

## Your slice: Users / login
Bring the prototype's user-management + sign-in up to what we shipped (R0.1 + 931), English + approved words:
- **User Setting / People login dialogs (931):** "Admit a login" (front-office username + role; the Person picker when a coach has no FO teacher), deactivate ↔ reactivate, **no password field anywhere, no Reset** — exactly the 931 flow. The current prototype pages are `pages/a/frontoffice/UserSetting` (+ RoleSetting); extend/replace to the 931 shape. Teacher names show (the O-150-1 `teacherName` behaviour).
- **The sign-in page** (if the prototype has one) in English with the approved helper "Use the same username and password as the front office." and the error "Wrong username or password." Mock only — any username/password "signs in"; the role switcher is the real control.
- Admin-blind money unaffected (857); CEO-only where the real app gates it.

## Rules & Done
- English + approved words; mock only; **0 console errors** (headless, the roles that apply); role switcher works; Thai-scan clean on your files.
- Don't touch `src/shell/*`, `main.tsx`, other teams' files; a shared-shell change → ask Sober.
- `npm run build` green · report file:line of changes. No git.
- Target: green for **B3 ~16 Nov**. **Sober reviews.** Questions → me.

## Implementation Notes (Fern, 2026-11-10) — TASK-941: User Setting on final-ui (931 shape, mock only)
**Files (only mine):** `pages/a/frontoffice/UserSetting.tsx` (rewritten, ~215 lines), NEW `mock/a-users.ts` (~95 lines, in-memory logins), `pages/a/index.ts:39` (the `/frontoffice/coach-login` row `roles: ["ceo","admin"]` → `["ceo"]`, as the real app gates it). **Not touched:** `src/shell/*`, `main.tsx`, `RoleSetting.tsx` (front-office roles, unrelated to the login flow), any other team's file. No git.
**What it does now (was a per-coach card: Login name / Email / Temporary password / Invitation / Reset password / Individual Information):**
- Table **Username · Role · Person · Status · Actions**; Person = the teacher name the row carries (ton→Ton, pete→Pete, nid→May); «—» for CEO/Admin.
- **Admit a login** dialog: «Front-office username» + «Role» (Admin/Coach). 404 «This username is not in the front office» and 409 «This person already has a login» land on the username field; empty → «Enter the person's front-office username». A coach whose front-office row has **no teacher** (nok) → the **Person picker** appears with «The front office does not link this username to a teacher, so say who they are.», required; a coach with a link (nid) needs no picker. Toast «Admitted <name>. They sign in with their front-office password.»
- **Deactivate** (dialog «Deactivate <u>? They will not be able to sign in. The login stays in the list and can be reactivated.») ↔ **Reactivate** (toast). Deactivated rows stay, dimmed, status Deactivated. No Deactivate button on the CEO row or on yourself (phin).
- **No password field, no Reset, no Invitation, no Create User anywhere** (asserted by the run).
**Sign-in page:** the prototype has **none** (the shell has no login screen; the role switcher is the control), and the shell is Sober's, so I did not add one. Question below.
**Proof:** `vite build` OK (scratch outDir; shared `dist/` untouched) · headless click-through of the built file, ~35 checks all PASS: list words, teacher names, no Deactivate on CEO/self, Reactivate on mali, empty/404/409 messages, admin bee admit, coach nid (link → May), coach nok (picker → required → Nam), deactivate/reactivate round trip with toasts, CEO sees the menu entry, **Admin and Coach: menu has no User Setting and the page does not render** (role gate), **0 console errors/warnings**, 0 Thai letters on the page and in my two files (grep). Evidence: `tests/evidence/task-941-fern/fui-u1-list.png`, `fui-u2-after.png`.
**Note, not mine:** `npx tsc --noEmit` is red only at `src/pages/b/stock/StockOut.tsx(67,69)` «Cannot find name 'setRefused'» (Fanta's file, in progress); my files are clean and `vite build` still passes.
**Question for Sober:** want a sign-in page at all? If yes I'd need a shell hook (a `/login` outside the layout, English helper «Use the same username and password as the front office.» + «Wrong username or password.», any value signs in) — that is `src/shell`/`main.tsx`, yours. Otherwise the role switcher stays the only entry and this slice is complete.
