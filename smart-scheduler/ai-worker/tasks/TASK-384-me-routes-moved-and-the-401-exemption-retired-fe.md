# TASK-384 — The FE follows the moved routes: `/me`, `/me/password`; the sign-out exemption retired (Stage 2 routing bug) — FE, XS

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18)
**Contract (TASK-383, @Jason):** `GET /me` ⇒ the same `{ user }` shape · `POST /me/password { currentPassword, newPassword }` ⇒ `{ ok: true }` · **wrong current ⇒ `400 WRONG_PASSWORD`** (no longer 401) · `400 PASSWORD_TOO_SHORT` · the old `/auth/me*` paths are gone (404).
**Size XS.** Ships with TASK-383.

## §1 The change
- `me.service.ts`: `/auth/me` → `/me`, `/auth/me/password` → `/me/password` (the mock too).
- `lib/api/client.ts`: **remove the `/auth/me/password` 401 exemption** — a 400 never reaches the sign-out path; every 401 signs out again (the mutation-9 pin flips to "no exemption exists").
- The change-password dialog shows `WRONG_PASSWORD`'s sentence as it showed the 401's.
- Pins: the two paths; no `/auth/me` string left in `src` (negative); the interceptor has no path exemption.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-18. **The two paths moved; the 401 exemption retired; no `/auth/me` string left in `src`.**

```
bunx tsc --noEmit → exit 0
bun test          →  403 pass / 0 fail   (unchanged count — the Stage-2 pins re-pointed, one new negative)
bun run build     → ok
git status        →  4 modified (services/me.service.ts · lib/api/client.ts · Header/ChangePasswordModal.tsx · lib/rbac/menu-guard.test.ts)
                     + comment sweep in 8 more files (the `/auth/me` wording → `/me`; no code)
```
- `me.service.ts`: `GET /me` · `POST /me/password` (the mock has no path). Same shapes.
- `lib/api/client.ts`: `SELF_PASSWORD_PATH`, the `url` read and the `endsWith` are GONE — every 401 signs out again; the
  comment says why (`400 WRONG_PASSWORD` never reaches that branch). Mutation 3 (the exemption back) fails.
- The dialog shows `WRONG_PASSWORD`'s sentence exactly as it showed the 401's (`errMsg`, unchanged line).
- Pins (in `menu-guard.test.ts`, TASK-382's file): the two paths · the interceptor's 401 line is the bare one and
  `SELF_PASSWORD_PATH|endsWith(|error.config?.url` is absent (trailing comments stripped) · the modal mentions no 401 ·
  **a walk of every non-test file in `src` finds no `/auth/me`** (a comment would trip it too — that is why the
  comments were swept, not just the code).

🔑 Break-and-watch ×3 in `try/finally`: `GET` back at `/auth/me` ⇒ 2 fail · `POST` back ⇒ 1 fail · the exemption back ⇒
1 fail. md5 identical on 3 files.

### ⚠️ Not seen on a screen
For @Tanya on `sid`: change my password with a WRONG current ⇒ the sentence in the dialog, still signed in; with the
right one ⇒ "Password changed", sign out, sign in with the new one; the nav follows a grant change on focus (the
`/me` refetch now reaches the BE).
