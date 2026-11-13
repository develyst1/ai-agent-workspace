# TASK-012: Back — I2 also returns `ownerName`
- Source: SPEC-002 §API row I2 (amended 2026-11-08) · TASK-008 Q-F5
- Owner: BE (Jason)
- Status: DONE (2026-11-08, SA review)
- Depends on: none (TASK-005 DONE)
- Git: none by you.

## What to do
`GET /api/invites/:token` (I2) returns `{ "projectName", "inviteeName", "ownerName", "expiresAt" }`. `ownerName` is the owner's
`displayName` (the one `users` row with `is_owner`). If there is no owner row, return `""`, never an error. Field casing exactly `ownerName`.
Files (closed list): `src/invites/routes.ts`, `test/api.links.test.ts`. Nothing else changes. The front already reads the field.

## Definition of Done
- [ ] One new test: I2 on a valid link → `ownerName` equals the seeded owner's display name. `bun test` → all pass. Paste.
- [ ] `bun x tsc --noEmit` → clean. Paste.
- [ ] Against `tests/harness/back-pglite/serve.ts`: make an invite as the owner (I1), then `curl` I2 → the JSON shows `"ownerName":"เจ้าของทดสอบ"`. Paste (cookie redacted).

## Implementation Notes
**Done (Jason, 2026-11-08).** `god-plan-back`, branch `atom`, nothing committed. Files: `src/invites/routes.ts` (I2: one extra select of the `is_owner` row's `displayName`; `ownerName: owner?.displayName ?? ""`), `test/api.links.test.ts` (the existing I2 assertion now includes `ownerName`; one new test; two imports). Nothing else.
```
$ bun x tsc --noEmit → no output, exit 0
$ bun test
 77 pass
 0 fail
Ran 77 tests across 4 files.        (was 76)
```
New test: I2 on a valid link → `ownerName` is `เจ้าของทดสอบ` and the keys are exactly `expiresAt, inviteeName, ownerName, projectName`; plus a second database with a project and a link but **no owner row** → 200 and `ownerName: ""` (I added this case because the TASK names it; it is in the same test).
Against `tests/harness/back-pglite/serve.ts` (random passwords in env, cookie not shown, stopped afterwards, 0 listeners on 4310):
```
sign-in owner → http=200
I1 → url http://127.0.0.1:4300/invite/<token>
GET /api/invites/<token> (no cookie)
{"projectName":"ย้ายบ้านใหม่","inviteeName":"น้องสมหญิง","ownerName":"เจ้าของทดสอบ","expiresAt":"2026-11-15T13:01:36.052Z"}  ← http=200
```
Decision (mine): the owner row is looked up only after the link is known valid, so an invalid link still answers 410 without an extra query, and `ownerName` is not exposed on a dead link. The owner's display name becomes visible to anyone holding a valid invite link, by the SA's design (it is the name the invitee will see on the page).

## Questions

## Review
**DONE — Sober (SA), 2026-11-08.** Re-ran: `bun x tsc --noEmit` → clean · `bun test` → 77 pass, 0 fail. `src/invites/routes.ts:46`
`ownerName: owner?.displayName ?? ""`. The test asserts the exact key set, and the no-owner case gives `""`. The harness curl is accepted.
Your decision is accepted: the owner lookup happens only after the link is valid, so a dead link gets 410 and nothing is exposed.
