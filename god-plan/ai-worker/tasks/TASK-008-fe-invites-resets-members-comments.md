# TASK-008: Front — comments, members, invite and reset pages
- Source: SPEC-002 (§API rows C1–C2, I1–I3, M1, R1–R3; §Front — pages rows `/projects/[id]` comments, `/projects/[id]/members`, `/invite/[token]`, `/reset/[token]`; §Interpreted AC-18)
- Owner: FE (Fern)
- Status: DONE (2026-11-08, SA review; 31/31 against the real back; Q-F5 → TASK-012). Earlier: TODO (2026-11-08: TASK-005 DONE; TASK-007 front side accepted). Build in layout B's drawer and look. Prove it as TASK-007 did:
  the browser run now, then the run against the real back when TASK-011 lands (both pasted).
- Depends on: TASK-005, TASK-007
- Git: none by you.

## What to do
1. Comment thread on the project page (C1/C2): author name, time in Asia/Bangkok, text rendered as text. Empty → "พิมพ์คอมเมนต์ก่อนส่ง". Over 2000 → the too-long message.
2. `/projects/[id]/members` (owner only; an invitee gets the Thai not-found page): members with emails, pending invites, "make invite" with the
   invitee's name → the URL + "คัดลอกลิงก์เชิญ" (clipboard) → "คัดลอกแล้ว ส่งให้คนที่เชิญได้เลย". Per member: make a reset link + copy.
3. `/invite/[token]`: I2 shows the project name. Form: name (pre-filled), email, password; the hint for existing accounts.
   409 → the AC-18 string · 410 → the invite-link string · 401 → the wrong sign-in string · short password → its string. On 200 → `/projects/<projectId>`.
4. `/reset/[token]`: R2 → new password → R3 → the "password changed" string + link to sign in. 410 → the invite-link string's reset twin (Q-S2).
Strings only from `strings.th.ts`.

## Definition of Done
- [ ] Browser walk (dev back, synthetic people only), with screenshots in `tests/harness/shots/TASK-008/`:
      owner makes an invite for "ทดสอบเอ" → a signed-out private window opens it → sets a password → lands on the project (AC-3a) ·
      the same link again → the invite-link message (AC-13) · the owner signed in opens a fresh link → the AC-18 message, then
      it still works signed out · A comments `<b>hi</b>` → the owner sees the literal text, A's name and the Thai time (AC-5, AC-16) ·
      reset for A → the old password fails, the new one works (AC-15). Paste the steps + file list.
- [ ] `bun run build` passes. Paste the last lines.

## Implementation Notes
**Fern, 2026-11-08.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me). Built on TASK-007; same Q-F3 rule (a failure shows the PM's string and the form keeps what was typed).

**What was built**
- **Comments (C1/C2)** in layout B's drawer: `src/components/thread.tsx`. Author name, time in Asia/Bangkok (`8 พ.ย. 19:43`, `src/lib/format.ts`), text rendered as text (`whitespace-pre-wrap`, never `dangerouslySetInnerHTML`). Empty → `พิมพ์คอมเมนต์ก่อนส่ง` (checked in the front; the back's `required` maps to the same string). Over 2000 → the too-long string. Sending updates the count on the board card.
- **`/projects/[id]/members`** (owner only; a 403 or 404 from M1 shows `ไม่พบหน้านี้`): the invite form (name → I1 → the link in a read-only box + `คัดลอกลิงก์เชิญ` → `คัดลอกแล้ว ส่งให้คนที่เชิญได้เลย`), the pending-invites list (names only, no label string exists for the expiry), the members with their emails, and per member `สร้างลิงก์ตั้งรหัสผ่านใหม่` (R1), which **copies as soon as it is made** and shows `คัดลอกแล้ว ส่งให้เจ้าตัวได้เลย` (the PM's table has no separate "copy reset link" label). The "copied" words show **only if the clipboard write succeeded**; if the browser refuses, the link stays selected in its box for copying by hand. The board now has the owner-only link `คนในโปรเจกต์` to this page.
- **`/invite/[token]`** (public): I2 → heading, name pre-filled, email, password, the existing-account hint. A signed-in person gets the AC-18 message at once and the form is not shown (nothing is consumed; I added this check on load rather than waiting for the 409; the 409 from I3 is still handled). 410/404 → the invite-link string; 401 → the wrong-sign-in string; short password → its string; success → `/projects/<projectId>`.
- **`/reset/[token]`** (public): R2 → new password → R3 → `เปลี่ยนรหัสผ่านแล้ว เข้าสู่ระบบใหม่ได้เลย` + a `เข้าสู่ระบบ` link to `/sign-in`. 410 → the same string as an invite link (the PM's Q-S2 row for reset reads identically).
- `api.ts` gained C1, C2, M1, I1–I3, R1–R3 with SPEC-002 field names; the public calls do not redirect to `/sign-in` on 401.

**Evidence (all run by me; passwords were random command-line values, never written down)**
- **Real back:** `DATA=real node ai-worker/tests/harness/task-008.mjs` → **31/31 passed**, against my own copy of `tests/harness/back-pglite/serve.ts` on port 4311 (port 4310 was taken by another session's instance; I changed only the port in a scratch copy, which still imports the real back from the repo) with the front on :4300 pointed at it by `BACK_ORIGIN`. The script drives headless Chrome with real clicks/typing and walks the DoD: owner makes an invite for "ทดสอบเอ" → the copy button → pending list · **AC-18**: the signed-in owner opens the link and sees the signed-in message, no form · signed out, the same link: name pre-filled, a 3-character password refused with `รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร`, then **AC-3a** the person lands on the project and sees its tasks · they comment `<b>hi</b> จากคนที่ถูกเชิญ` · the owner sees it with the author's name and a Thai time, as plain text, 0 `<b>` elements (**AC-5, AC-16**) · the used link → the invite-link message (**AC-13**) · reset for that person → copied string · short password refused · new password set → `เปลี่ยนรหัสผ่านแล้ว…` · **AC-15**: the old password fails, the new one works, the used reset link shows the link message · **AC-14**: an existing account (invitee A) uses a link for the other project with its old password, lands on it, and the list shows both · an invitee opening the members page gets `ไม่พบหน้านี้` and sees no members link and no add-task box · empty comment, a 2001-character comment, and `<b>hi</b>` by the owner · an unknown invite token → the link message · 390 px: 0 px of sideways page scroll on the members and invite pages. The walk uses the real seed (P1 "ย้ายบ้านใหม่", P2 "งานสวนหลังบ้าน"); the first earlier attempt failed only because the back builds links with `127.0.0.1` while the browser used `localhost` (cookies and Next's dev server are per host), so the script swaps the host part of a link to `localhost`; path and token are untouched.
- Shots: `ai-worker/tests/harness/shots/TASK-008-real/` (`ls -l`, bytes): `thread-1280.png 91926` · `thread-390.png 44882` · `members-1280.png 49965` · `members-390.png 45189` · `invite-1280.png 26780` · `invite-390.png 22507` · `invite-signed-in-1280.png 15421` · `invite-used-1280.png 13718` · `invite-used-390.png 11205` · `reset-1280.png 15188`. I opened `thread-1280`, `invite-1280` and `members-1280`. All synthetic (`*@godplan.test`, `*@example.test`).
- `bun run build` → `✓ Compiled successfully`; routes `/ · /_not-found · /invite/[token] · /projects/[id] · /projects/[id]/members · /reset/[token] · /sign-in`; `[postbuild] copied .next/static into .next/standalone`. `ls -l .next/standalone/server.js` → `6940 B`; `ls .next/standalone/.next/static` → `chunks  media  O-nqLVH-Xo1504e-7U7Kf`. `bunx tsc --noEmit` → `TSC_OK` (also after the build).
- `grep -rn dangerouslySetInnerHTML src` → none. `grep -rnP "[\x{0E00}-\x{0E7F}]" src --include=*.tsx` → none (one Thai word in a comment was removed to get there). No `#hex` in `src`. `bun pm ls | grep -E "react@|react-dom@|@heroui/react@|next@"` → `@heroui/react@3.1.0 · next@16.2.9 · react@19.2.7 · react-dom@19.2.7`. `git check-ignore -v .env.local` → `.gitignore:5:.env*.local`. `git status --short` → ` M README.md`, `?? .env.example .gitignore bun.lock next.config.ts package.json postcss.config.mjs scripts/ src/ tsconfig.json`; branch `atom`, HEAD `a41cbd0`.
- All my servers are stopped (my back by pid, my front dev by pid; I did not touch the other session's back on 4310).

**Decisions I made (internal)**
- Avatars show a person icon, not an initial (a Thai name's first character is often a leading vowel and reads wrongly).
- The reset link is copied automatically (see above); the invite link has a button, as the PM's table implies.
- Pending invites show the invitee's name only.
- `Link`s to internal pages use `next/link`; the invite page asks `/api/me` quietly (a 401 there is an answer, not a redirect).

**UNVERIFIED**
- `UNVERIFIED — /impeccable audit`, real phone, keyboard-only / screen-reader pass, hit targets measured in the page (classes are `min-h-11`). Same as TASK-007.
- The 28 s timeout, and a 500 from the back on these pages, were not exercised here (TASK-007 proved the failure strings through the same `messageFor`).
- The clipboard `permission denied` branch (link stays selected, no "copied" words) was not exercised: headless Chrome was granted clipboard access.

## Questions
- **Q-F5 (SA → PM: copy and contract): the invite heading needs the owner's name, but I2 does not return it.** The PM's string is `<ชื่อเจ้าของ> ชวนคุณเข้าโปรเจกต์ "<ชื่อโปรเจกต์>"`. SPEC-002's I2 row returns `projectName`, `inviteeName`, `expiresAt` only. Against the real back the heading therefore reads `ชวนคุณเข้าโปรเจกต์ "ย้ายบ้านใหม่"` with no owner's name (shown in the walk output). I will not invent a name or change the string. Options: (a) the SA adds `ownerName` to I2 (and the BE returns the owner's `displayName`); the front already reads an optional `ownerName` and will show it with no further change; (b) the PM accepts the heading without the name. Until decided the screen shows (b).

## Review
**DONE — Sober (SA), 2026-11-08.**
- Re-checked: `git status` = the scaffold + these pages · `dangerouslySetInnerHTML` → 0 · Thai in `.tsx` → 0 · routes
  `/invite/[token]`, `/reset/[token]`, `/projects/[id]/members` exist. Your **31/31 run against the real back** (the TASK-011 harness on
  :4311, a scratch port copy, which is fine) covers AC-3a, AC-5, AC-13, AC-14, AC-15, AC-16 and AC-18, and the invitee's no-access to members.
  Accepted. So are the shots and build.
- Your decisions are accepted, including copying the reset link at once with "copied" only on a real clipboard success, and checking
  AC-18 on load while still handling the 409. The localhost/127.0.0.1 host swap in the script is a test detail and fine.
- **Q-F5 answered (SA, a contract change):** option (a). SPEC-002 I2 now returns `ownerName`, and **TASK-012** (BE) adds it. Your front
  already reads it, so nothing to change on your side. The heading is complete once TASK-012 lands. QA will see it then.
- `UNVERIFIED`, carried to the release gate: `/impeccable`, real phone, keyboard / screen reader, and the clipboard-refused branch.
