# TASK-002: Switch `license-transit` to its own `LicenseTransit` Basic-auth section
- Source: SPEC-002
- Status: DONE (Sober, 2026-09-10 — see `## Review`. The Logstash field went up as
  DATA REQUEST SA-3 in REQ-002; it was never BE's to produce.)
- Depends on: none (TASK-001 is DONE and in the working tree)
- Repo: logical name **`did-spf`** — real path from the workspace-root
  `machine.local.md`. Paths below are relative to `DidSpf.WebApi.LK2/`.

## What to do

Three edits, all in this project. Form 9 stops borrowing the `LicenseShipment`
credential and gets its own. **No route, data, query or response change.**

Read SPEC-002 first — it explains the one thing that can bite you: the filter
looks the section up with a plain dictionary indexer, so a **missing** section is a
**500, not a 401**.

### 1. Add the new Basic-auth section to `appsettings.json`

In `Configurations.BasicAuth`, **add** (do not rename, do not move):

```json
"LicenseTransit": {
  "Username": "Linkage Service",
  "Password": "<the value you generate — see below>"
}
```

**Generate the password yourself.** The stakeholder explicitly authorised this
(*"gen เองไปเลย"*, REQ-002 item 1). Match the existing convention — 40-char
lowercase hex, same as every other section:

```bash
openssl rand -hex 20
```

Two hard requirements on the value:

- It must be **different from every other section's password in this file**,
  especially `LicenseShipment`'s. Grep the file and confirm. This is not cosmetic:
  the filter compares username **and** password, and every section shares
  `Username = "Linkage Service"`, so a duplicated password would let the **old**
  credential keep working and the "old credential → 401" check would pass for
  entirely the wrong reason.
- **Report the value in `## Implementation Notes`.** The stakeholder has to hand it
  to Linkage Center 2, and it reaches them through me. Do not put it anywhere else.

### 2. Point the controller at the new section

`Controllers/LicenseTransitController.cs`:

```csharp
[BasicAuth("LicenseShipment")]   // before
[BasicAuth("LicenseTransit")]    // after
```

### 3. Fix the comment you added in TASK-001 — it is now wrong

The 4-line Thai comment above that attribute currently tells the reader **never**
to change the key. REQ-002 supersedes exactly that instruction, so leaving it would
make the file actively lie. Replace it with something that carries the new *why* —
this wording is fine, adjust the phrasing if you prefer but keep both facts (form 9
logs `LicenseTransit`; the old section is kept on purpose for form 18):

```csharp
// section นี้คือค่าที่ log ออกเป็น basicAuthSection และที่ Linkage Management
// เก็บเป็น service_code — ต้องมี services row ที่ service_code = 'LicenseTransit'
// ไม่งั้น dashboard จะโชว์รหัสดิบแทนชื่อไทย (REQ-002)
// หมายเหตุ: section "LicenseShipment" ยังอยู่ใน appsettings.json โดยตั้งใจ —
// กันไว้ให้ endpoint form 18 (หนังสือแจ้งรายละเอียดการส่งออกแต่ละครั้ง) ในอนาคต
[BasicAuth("LicenseTransit")]
```

### 4. Leave `LicenseShipment` in `appsettings.json` — do not delete it

It stays, unused, reserved for the future form-18 endpoint (REQ-002 item 3).
`ConfigurationsModel.BasicAuth` is a `Dictionary<string, BasicAuthCredential>`, so
an unused section costs nothing and no code reads it once step 2 lands.

### 5. Do NOT touch

- Any route, query parameter, validation rule, response model or the data path.
- Any other Basic-auth section or its password.
- `_build-out-lk2/appsettings.json` — leave it. It is a stale published copy and is
  now a settings file **missing** a required section; I am flagging that as a
  release note, not a code change.
- Anything in `did-045-api-linkage-management`. The `services` row is **not a
  TASK** — it is the SPEC deliverable
  `specs/SPEC-002-linkage-management-services-row.sql` (text only), which Porter
  relays and the stakeholder runs.
  *(Corrected by Sober at review, 2026-09-10: this line originally said
  "TASK-003", which never existed — see Q-BE-4.)*

## Definition of Done

> ⚠️ **No test project exists** (`DidSpf.WebApi.LK2/CLAUDE.md`). `dotnet build` is
> the only automated gate — do not write "tests pass".
>
> ⚠️ **Run the app only as** `dotnet run --no-launch-profile` with
> `ASPNETCORE_ENVIRONMENT=Production`. Every profile in `launchSettings.json`
> hard-sets `Development`, which loads `appsettings.Local.json` and reaches the
> **real** Logstash/Oracle. This is the rule I adopted after TASK-001 — my failure
> to state it last time is what caused that incident, so it is now explicit.

- [ ] `dotnet build DidSpf.sln --no-incremental` → **0 errors**, and warning count
      unchanged from baseline (**277** at TASK-001 review). Paste the tail.
- [ ] `appsettings.json` contains **both** sections: the new `LicenseTransit` **and**
      `LicenseShipment` untouched (same password as before — diff it).
- [ ] The new password differs from **every** other section's in the file. Show the
      check (e.g. the passwords sorted + `uniq -d` finding nothing).
- [ ] The generated password is written in `## Implementation Notes`.
- [ ] `grep -n "BasicAuth(" Controllers/LicenseTransitController.cs` shows
      `LicenseTransit`, and the old "ห้ามเปลี่ยน" comment is gone.
- [ ] `git diff --stat` shows **exactly two** files changed —
      `appsettings.json` and `Controllers/LicenseTransitController.cs`. Nothing
      else. Paste it. **Do not commit.**
- [ ] **Auth behaviour, verified live** (`--no-launch-profile`, Production, Oracle
      unreachable is fine — `BasicAuthFilter` runs *before* the controller is
      constructed, so these are all observable). With the 4 required headers:
  - [ ] **new** credential on `api/v1/license-transit` → **not 401** (a 500 from the
        Oracle constructor is the expected pass here — record whatever you get)
  - [ ] **old `LicenseShipment`** credential on `api/v1/license-transit` → **401**
  - [ ] garbage password → **401**
  - [ ] **Sanity check that proves the section resolves at all:** temporarily rename
        the `LicenseTransit` key in your local `appsettings.json` to something else,
        call the endpoint, and confirm you get **500** (`KeyNotFoundException`), then
        put it back. This is the failure mode SPEC-002 flags; seeing it once
        confirms the 500-vs-401 distinction is real and that your section name
        actually matches. Say in the notes that you reverted it.
- [ ] If Logstash happens to be enabled somewhere you are permitted to use: an
      audit event shows `basicAuthSection = "LicenseTransit"`. **If not, say so —
      do not claim it.** I will route it as a DATA REQUEST like last time.

## Implementation Notes

**Jason (BE), 2026-09-10.** All three edits done; every DoD item ran and passed.
I verified your `BasicAuthFilter` reading myself before relying on it — indexer at
`:24`, `Ordinal` compare of both fields at `:55-56`, section name written at `:61`.
All three claims hold.

### 🔑 Generated password for the `LicenseTransit` section

```
30cb2c7aa42bd67ef51e7d59527e224c2215b569
```

`openssl rand -hex 20`, 40-char lowercase hex, matching the file's convention.
Username is `"Linkage Service"` as specified. **@Sober: this is the value the
stakeholder needs for Linkage Center 2** — please relay it via Porter. It is in
`appsettings.json` and in this file only; I have not put it in the log or the board.

### Files changed — exactly the two required

| File | Change |
|---|---|
| `appsettings.json` | **added** the `LicenseTransit` section (4 lines). `LicenseShipment` untouched — the diff contains no `-` line for it |
| `Controllers/LicenseTransitController.cs` | attribute → `[BasicAuth("LicenseTransit")]`; the 4-line "ห้ามเปลี่ยน" comment replaced with your 5-line REQ-002 wording |

```
$ git diff --cached --stat        # the TASK-002 delta
 DidSpf.WebApi.LK2/Controllers/LicenseTransitController.cs | 11 ++++++-----
 DidSpf.WebApi.LK2/appsettings.json                        |  4 ++++
 2 files changed, 10 insertions(+), 5 deletions(-)
```

Nothing else. `_build-out-lk2/appsettings.json`, the other sections, and every
route/query/response left alone.

### Build

```
dotnet build DidSpf.sln --no-incremental
    277 Warning(s)
    0 Error(s)
```

**277 = unchanged from the TASK-001 baseline.** No test project, so no test claim.

### Password uniqueness — with a correction to how I first measured it

First count looked alarming: 13 `Password` lines, 12 distinct. The duplicate is
**not** in the auth sections — it is the two Oracle placeholders, which are
committed as `""` on purpose (`CLAUDE.md`: Host/Password are deliberately empty).
Excluding those:

```
non-empty Password lines — total: 11   distinct: 11
```

All 11 Basic-auth section passwords are distinct, including the new one, so the
"old credential → 401" check cannot pass for the wrong reason.

### Auth behaviour — verified live

Run form exactly as mandated: `dotnet run --no-build --no-launch-profile` with
`ASPNETCORE_ENVIRONMENT=Production`, port 5099, throwaway Oracle values, Logstash
off. Startup log confirmed `Hosting environment: Production` and **no** Logstash
connection line — `appsettings.Local.json` was not loaded. No real infrastructure
was contacted at any point this session.

| Check | Expected | Got |
|---|---|---|
| **new** `LicenseTransit` credential → `license-transit` | not 401 | **500** ✅ (past auth; Oracle ctor, as SPEC-002 predicts) |
| **old** `LicenseShipment` credential | 401 | **401** ✅ |
| garbage password | 401 | **401** ✅ |
| old credential on `-sandbox` | 401 | **401** ✅ (extra) |
| new credential on `-sandbox` | not 401 | **500** ✅ (extra) |

### ⚠️ The missing-section check — I had to change it to make it a real check

As written the check could not distinguish anything: the new credential **already**
returns 500 from the Oracle constructor, so "rename the key, expect 500" gives 500
either way. A check that returns the same answer whether or not the thing is true
is not evidence.

Made it discriminating by using a **garbage** credential, which returns 401 only if
the section resolves — so the status flips on exactly the question being asked:

| Section state | garbage credential |
|---|---|
| `LicenseTransit` present | **401** (filter compared, rejected) |
| key renamed to `LicenseTransitTEMPBROKEN` | **500** (`KeyNotFoundException` — never reached the compare) |

Both observed. That confirms the 500-not-401 failure mode is real **and** that my
section name genuinely resolves — which is what you wanted the check to prove.

**Reverted, and the revert is verified by behaviour, not just by eye:** after
restoring the key I restarted and re-ran — garbage → **401**, old → **401**, new →
**500**, i.e. back to the correct table above. `grep -c TEMPBROKEN appsettings.json`
→ **0**, and the working tree is byte-identical to the committed state.

### Logstash `basicAuthSection = "LicenseTransit"` — NOT observed, not claimed

I ran with Logstash deliberately off; enabling it here means pointing at the real
server. `BasicAuthFilter:61` sets the field from the attribute argument, so the new
value follows by construction — but that is reading code, not evidence. Over to you
for a DATA REQUEST if you want it actually seen (see Q-BE-3).

### Git state — the human committed mid-session; I ran no git command that mutates

Two things happened outside my control, reported because they change what a
reviewer sees:

1. **TASK-001 was committed** by the human as `cd67b90 "Refactor License Shipment
   to License Transit"` — so this TASK started from a clean tree, not from
   TASK-001's uncommitted diff.
2. **My TASK-002 edits were staged (`git add`) and then committed while I was
   running verification**, as `5295aea "feat: update BasicAuth section to
   LicenseTransit and add credentials in appsettings"`. **I did not stage, commit or
   branch anything** — no mutating git command was run from this session.

Because the commit landed while I was mid-check, I verified the **committed
content** is the correct final state and not my deliberately-broken intermediate:

```
TEMPBROKEN in HEAD appsettings:        0
LicenseShipment section still in HEAD: 1
git diff HEAD -- <my two files>:       (empty — tree identical to HEAD)
5295aea touched exactly 2 files:       controller + appsettings
```

So the commit is clean. Flagging it anyway — a commit appearing during
verification is worth a reviewer knowing about. The 4 remaining dirty files
(`*.csproj.user`, `FolderProfile.pubxml*`) are the same pre-existing IDE artifacts
you identified at TASK-001 review; still not mine.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-3 (Jason → Sober, non-blocking) — Logstash field.** Same position as
  TASK-001's Q-BE-2: `basicAuthSection = "LicenseTransit"` is **not observed**. It
  follows from `BasicAuthFilter:61`, but that is inference. If you want it
  evidenced, it needs a DATA REQUEST on an environment I may not touch. Nothing in
  the code change depends on the answer.

- **Q-BE-4 (Jason → Sober, documentation only) — TASK-002 references a "TASK-003"
  that does not exist.** Section 5 says *"The `services` row is TASK-003 (text
  only)"*, and SPEC-002's Out of Scope says *"TASK-003 emits text only"* — but your
  own log entry and SPEC-002's Tasks section state (correctly) that REQ-002 item 6
  is **not** a TASK, it is the SPEC deliverable
  `specs/SPEC-002-linkage-management-services-row.sql`. No work is affected and I
  did nothing with it; flagging it so the artifacts don't disagree with each other
  for whoever reads them next. Your file to fix, not mine.

## Review

**Sober (SA), 2026-09-10 — verdict: `DONE`.**

Re-verified on the tree myself; every figure below is one I produced.

| Check | How | Result |
|---|---|---|
| The actual diff | read `git show 5295aea` in full | Exactly as specified: attribute → `LicenseTransit`, comment replaced, `LicenseTransit` section **added**. `LicenseShipment` still present with password `68ec2218…` — **the same value I read at the start of this REQ**, so it is genuinely untouched, not merely diff-clean |
| Scope | `git show --stat` | **2 files**, +10/−5. Nothing else |
| Whole tree | `git status --porcelain` | Only the 4 pre-existing IDE artifacts. No stray edits |
| Build | ran `dotnet build DidSpf.sln --no-incremental` myself | **277 Warning(s), 0 Error(s)** — unchanged baseline; **0** LK2 warnings |
| Password distinctness | counted non-empty `Password` values | **11 total, 11 distinct**, `uniq -d` empty. The new value appears **once** in the file. So "old credential → 401" cannot pass for the wrong reason |
| No leftover sabotage | grepped `TEMPBROKEN` across LK2 | **none** |

### Q-BE-3 — answered

> answer: **Right call, and it goes up as a DATA REQUEST — not back to you.**
> `basicAuthSection = "LicenseTransit"` is REQ-002 acceptance criterion 4, so it
> has to be *observed* before Porter can accept the REQ, and you are not permitted
> to produce it. Raised as **SA-3** in REQ-002's Questions, pointing at the same
> environment that answered SA-2. Nothing is left for BE; you are not blocked.

### Q-BE-4 — you were right, and I have fixed both places

> answer: **My error, corrected.** `TASK-003` never existed — I decided REQ-002
> item 6 was mine to write rather than yours, updated SPEC-002's Tasks section, and
> then failed to sweep the two other spots that still referenced the task I had
> just deleted: this TASK's section 5 and SPEC-002's Out of Scope. Both now name
> the real artifact, `specs/SPEC-002-linkage-management-services-row.sql`, with a
> note saying what changed. Thank you for reading the instructions against each
> other instead of just following the nearest one.

### The check you rewrote — you were right and I was wrong

This is the most useful thing in the submission, so I want it on the record rather
than buried in your notes.

My missing-section check was **not a check**. I asked you to rename the key and
expect 500 — but the new credential *already* returns 500 from the Oracle
constructor, so that step returns 500 whether the section resolves or not. It
would have "passed" on a completely broken configuration.

Your replacement uses a **garbage** credential, whose result flips on exactly the
question being asked: **401** when the section resolves (the filter compared and
rejected), **500** when it does not (`KeyNotFoundException`, never reached the
compare). Both states observed, then reverted — and you verified the revert *by
behaviour* (re-running all three cases) rather than by eye, plus
`grep -c TEMPBROKEN` → 0. I confirmed that independently: no `TEMPBROKEN` anywhere,
and the committed content is the correct final state.

That is the standard I should have written the DoD to. I will apply it going
forward: a step whose result is identical whether or not the property holds is
documentation, not verification.

### On the mid-session commit

Noted, and correctly flagged. The human committed both TASK-001 (`cd67b90`) and
your TASK-002 work (`5295aea`) while you were verifying — git is theirs alone and
neither of us touched it. The one risk that creates is a commit capturing your
deliberately-broken intermediate state; you checked for that and so did I —
`TEMPBROKEN` absent from `HEAD`, `LicenseShipment` still present, the commit
touching exactly the two intended files. Clean.

One note for accuracy, not a fault: your evidence block used
`git diff --cached --stat`, which reads the **index**. You did not stage anything —
the human's commit did — so what you actually captured was their staged snapshot,
which happened to equal your delta. It was correct here; `git show <sha> --stat` is
the unambiguous form when someone else is committing underneath you.

### Verdict

Everything in scope is done and evidenced. `REVIEW` → **`DONE`**. Nothing to
rework, and nothing left queued for BE on REQ-002.
