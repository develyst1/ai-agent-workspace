# REQ-003: Point the LK2 client tool at `license-transit`
- Status: DELIVERED (2026-09-10) — **on this machine only**; see SA-5
- Priority: MEDIUM
- Requested: 2026-09-10 by stakeholder (human)
- Deadline: none

## Problem / Goal

`lk2-client-tool/index.html` is a browser-based tester for the LK2 API. It lives in
the `did-spf` repository at the **solution root**, outside the
`DidSpf.WebApi.LK2` folder — which is why neither SA's sweep nor REQ-001's
acceptance search (both scoped to the LK2 project) covered it.

REQ-001 deleted the `license-shipment` route and REQ-002 changed the credential.
The tool still hardcodes both, so **it is broken against the deployed API right
now** — its "Shipment" entry returns 404.

The stakeholder asked for this to be fixed (2026-09-10: *"เอา เปิด REQ-003 เลย"*).

## Requirement

1. In `lk2-client-tool/index.html`, the form-9 entry must call the current
   endpoint: route `license-transit`, auth section `LicenseTransit`.
2. The password it sends for that entry must be the current `LicenseTransit`
   password. **The authoritative value is in
   `DidSpf.WebApi.LK2/appsettings.json` → `Configurations.BasicAuth.LicenseTransit`
   — copy it from there.** Do not invent a new one, and do not change any other
   entry's password.
3. The visible label for that entry must describe form 9 correctly. It currently
   reads "หนังสืออนุญาตขนย้าย (Shipment)" — **ขนย้าย is form อ.10 (move), a different
   licence entirely.** It should read as the transit permit, e.g.
   "หนังสืออนุญาตผ่านแดน (Transit)", matching how form 9 is named everywhere else.
   *(Wrong label pre-dates our work; PM raised it, stakeholder approved fixing it in
   the same pass. Say so if you would rather drop it.)*
4. Nothing else in the tool changes — the other nine licence entries, their
   routes, their auth keys and their passwords stay exactly as they are.

## Acceptance Criteria

- [ ] A case-insensitive search for `license-shipment` in
      `lk2-client-tool/index.html` returns nothing.
- [ ] The form-9 entry sends route `license-transit` with auth key
      `LicenseTransit`.
- [ ] The password used for that entry is byte-identical to the `LicenseTransit`
      password in `DidSpf.WebApi.LK2/appsettings.json`.
- [ ] The other nine entries are untouched — same labels, routes, auth keys and
      passwords as before the change.
- [ ] The form-9 label no longer says "ขนย้าย".
- [ ] The page still loads and the licence dropdown still renders all ten entries.

## Constraints

- This is a **static HTML/JS file**, not part of the compiled API. It is not built
  by `dotnet build`, so "it builds" proves nothing here — verification is opening
  the page and checking the entry.
- The file sits **outside** `DidSpf.WebApi.LK2`. Confirm with SA whether it is
  treated as this team's code before editing; the stakeholder has asked for the
  change, so the intent is clear, but the repo boundary is worth stating once.
- The file already contains all ten Basic-auth passwords in plaintext, committed.
  That is the tool's existing design and **this REQ does not change it** — do not
  take the opportunity to restructure how it holds credentials.

## Out of Scope

- Any change to the LK2 API itself — REQ-001 and REQ-002 are DELIVERED and closed.
- Restructuring, restyling or refactoring the client tool.
- The other nine licence entries.
- `did-045-api-linkage-management` and its `V18` migration — the stakeholder
  handles that repo themselves (REQ-002 Q2-4).
- The stale published binaries (`_build-out-lk2/`, `spf-build/`) that still contain
  the old route. They are build output, not source.

## Questions

- **Repo boundary — ANSWERED by SA, 2026-09-10.** Porter asked me to rule on this
  rather than let it pass silently. **Yes, `lk2-client-tool/index.html` is this
  team's code and in scope.** It lives in the `did-spf` repository and exists only
  to exercise the LK2 API this team owns, and the stakeholder asked for the fix.
  Sitting outside the `DidSpf.WebApi.LK2` folder made it invisible to an
  *LK2-project-scoped grep* — that is a flaw in how I scoped REQ-001's acceptance
  search, not a reason the file belongs to someone else. Good call asking; the
  answer is recorded in SPEC-003 so it is not re-litigated next time.

- **SA-5 — SA → Porter, open. READ THIS BEFORE ACCEPTING THE REQ: the file is
  gitignored, so the fix does not leave this machine.** Jason found it; I verified
  it myself (`git check-ignore -v` → `.gitignore:40`; `git ls-files
  --error-unmatch` fails; `git log --all` on the path is empty — **never tracked**).

  **What this means for acceptance.** Every acceptance criterion below is met **on
  this working copy**, and TASK-003 is `DONE`. But a fresh clone, another machine,
  or the stakeholder pulling still has the **broken** form-9 entry. This is the same
  shape as the `V18` migration gap you found in `did-045-api-linkage-management`:
  the change is correct and lands nowhere durable.

  **Correction to my own earlier answer, in the same breath.** I settled the repo
  boundary above partly on "it is inside the `did-spf` repository". That premise was
  **wrong** — working directory, yes; repository, no. The ruling still stands on the
  reasons that mattered (team's tool, exercises our API, stakeholder asked), and
  SPEC-003 now records the correction rather than leaving it looking verified.

  **The decision is the stakeholder's, not mine** — it is repo policy, and no agent
  here touches `.gitignore` or git. Please put it to them:

  1. **Was the intent "fix the tool for everyone"?** Then the file has to stop being
     ignored (remove `.gitignore:40` and commit it) — but note it carries **all ten
     Basic-auth passwords in plaintext**, which is very likely *why* it was ignored
     in the first place. That trade-off is theirs to weigh, and it is a security
     decision, not a convenience one. I am not recommending it blind.
  2. **Or was the intent "fix it on my machine"?** Then this is finished as-is, and
     the honest note for the record is that the tool is repaired locally only and
     anyone else needs the same two-line edit.

  My read: option 2 is the safe default given the plaintext credentials, with the
  local-only limitation written down so it is not rediscovered later. If they want
  option 1, the credentials question should be settled first — that would be a new
  REQ, not a quiet edit under this one.

  **Until they answer, do not report REQ-003 as delivering "the tool now works"
  without the words "on this machine".** The code side is complete and evidenced.

  > answer (Porter relaying the stakeholder, 2026-09-10): **option 2 — local only.**
  > Stakeholder, pointing at the file path: *"อันนี้อ่ะแก้ได้เลย"* — the file is fine to
  > edit in place; they did not ask for it to be un-ignored.
  > **`.gitignore:40` stays as it is. Nothing is committed. No agent touched git.**
  > Standing limitation, to be repeated whenever this tool comes up: the form-9 fix
  > exists **only in this working copy**. A fresh clone or another machine still has
  > the broken entry and needs the same edit by hand.
  > If "fix it for everyone" is ever wanted, that is a new REQ and the plaintext
  > credentials question must be settled first — not a quiet `.gitignore` edit.
  > PM inferred option 2 from a short reply; say so if the intent was option 1.

- **SA-4 — SA → Porter, open, NON-BLOCKING: the tool's `license-export` entry is
  also broken, and it is not our doing.** While confirming form 9 was the only
  stale entry, I reconciled **all ten** of the tool's passwords against
  `appsettings.json` instead of assuming. Nine match. One does not:

  | entry | tool | `appsettings.json` |
  |---|---|---|
  | `LicenseExport` | `da26c2e922…` | `adda97fb54…` |

  So the tool's **export** button returns 401 today as well. This is
  **pre-existing drift with no connection to REQ-001/REQ-002** — the tool's form-9
  password still matches the old `LicenseShipment` value character for character,
  which means form 9 worked right up until we changed the route.

  Requirement 4 says the other nine entries stay untouched, so I have **kept this
  out of TASK-003** rather than widening the change on my own authority. **My
  recommendation: fix it in the same pass** — it is one 40-character string, the
  fix is mechanical and carries no risk, and telling the stakeholder "the tool
  works again" while a second button silently 401s means they find this out the
  hard way. Their tool, their call. A "yes" is one line added to TASK-003 and
  delays nothing; TASK-003 proceeds either way.

  *(Until you answer, TASK-003's checks assert the other nine lines are
  byte-identical to `HEAD` — deliberately including the wrong export value.)*

  > answer (Porter relaying the stakeholder, 2026-09-10): **No — leave it, do not
  > touch it.** Stakeholder: *"เรื่อง2 ปล่อยไป ไม่แตะ"*. The stale
  > `LicenseExport` password stays as it is; the tool's export button keeps
  > returning 401 and that is accepted, knowingly. Requirement 4 stands unchanged —
  > the other nine entries are untouched. **SA-4 is closed. No follow-up TASK.**
