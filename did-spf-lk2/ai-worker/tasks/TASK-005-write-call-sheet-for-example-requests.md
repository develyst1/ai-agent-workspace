# TASK-005: Write the call sheet the stakeholder will run
- Source: SPEC-005
- Status: DONE (Sober, 2026-09-10 — see `## Review`. Step 1 complete; REQ-005 stays open for the stakeholder's run per SA-7.)
- Depends on: none (parallel with TASK-004)
- Repo: logical name **`did-spf`** — real path from workspace-root `machine.local.md`.
- **Output file:** `DidSpf.WebApi.LK2/docs/lk2-call-sheet.md`. One file, no code changes.

## What to do

Produce a **ready-to-run call sheet**: one request per real licence endpoint that
the **stakeholder** executes against
`https://e-connect-did.mod.go.th/service-did-dopa`, then pastes the output back.

> 🚫 **You do not run these calls. Nobody on this team does.**
> This is the ordinary `PROTOCOL.md` position, not a special rule for this TASK, and
> the stakeholder choosing to run them himself granted **no exception** to it
> (REQ-005 Q5-1). Writing the sheet is the whole job. Do not "just check one".

Read SPEC-005 first, and take the endpoint/parameter/auth facts from **SPEC-004's
fact table** — do not re-derive them and do not copy them from `CLAUDE.md`.

### Structure — one section per endpoint, ten sections

Cover the **ten real endpoints only** (not `-sandbox`, not `-health-check`):
`license-import`, `license-move`, `license-sale-domestic`,
`license-sale-international`, `license-export`, `license-transit`,
`license-yp2`, `license-yp3`, `license-yp4`, `license-yp5`.

Each section contains:

1. **Endpoint + which credential family to use** — the Basic-auth section *name*
   only, so they pick the right password. **Never a password value.**
2. **A ready-to-paste `curl`** with all four required headers present and
   `Authorization` as an obvious placeholder, e.g.:
   ```bash
   curl -i "https://e-connect-did.mod.go.th/service-did-dopa/api/v1/license-import?licenseNo=<LICENSE_NO>&traderName=<COMPANY_NAME>" \
     -H "Authorization: Basic <BASE64(username:password) — ชุดรหัสของ license-import>" \
     -H "X-Office-Request: 1" \
     -H "X-User-Request: 1234567890123" \
     -H "User-Agent: Linkage Center 2/1.0"
   ```
3. **The same values laid out for Swagger "Try it out"** — field name → value — since
   they may use the Swagger page instead of curl.
4. **The search value**, per SPEC-004's table:
   - `license-import`, `license-move`, `license-sale-domestic`,
     `license-sale-international` → **`licenseNo` is mandatory**, plus one of
     `traderName`/`personalId`. An entry missing `licenseNo` returns `400`, not a row.
   - the other six → **full company name** in `traderName`.
5. **An empty result block** for them to paste into:
   ```
   HTTP status: ____
   Response body:
   ```
6. **One line of "what a good result looks like"** — `data` with ≥1 object, versus
   `data: []` which means no match rather than a failure.

### The blanks are the point — do not fill them with invented values

We cannot know which licence number or company name returns a row: that needs
either Q5-2's `SELECT` results (still open with the stakeholder) or the calls
themselves, and we do neither.

So leave the search values as **clearly marked placeholders** — `<LICENSE_NO>`,
`<COMPANY_NAME>` — with a line at the top of the sheet saying they must be filled
from real data before running.

**Do not invent a plausible company name or licence number.** REQ-005 items 4-5
forbid it, and the practical harm is specific: a made-up value that returns zero
rows is indistinguishable from an endpoint that has no data, so it would send the
stakeholder hunting a bug that does not exist.

If Q5-2 lands before you start, use those values and say which entry came from it.

### Flag the two endpoints expected to return nothing

Put this near the top, not buried: `license-transit` (form 9) and `license-export`
(forms 8/19/20) have rows at `STATUS=30` in ELicensing while the query filters
`STATUS=40` (recorded in `DATA-MAPPING.md`), so they may legitimately return
`data: []` no matter what search value is used. Per REQ-005 item 4 that is **a
finding to report, not a gap to fill** — the sheet should tell the runner to record
the empty result rather than assume they mistyped.

### Do NOT

- Call the host. Start the API. Touch Oracle, Logstash or any deployed environment.
- Put any password in the sheet.
- Suggest looping/iterating values against the host — one call per endpoint.
- Include `-sandbox` or `-health-check` requests as examples: sandbox returns fixed
  dummy rows and proves nothing about real data (REQ-005 item 5); health-check
  always returns an empty list by design.

## Definition of Done

> ⚠️ **No build, no run, no calls.** There is no compilation gate for this TASK and
> none is expected — do not cite `dotnet build`. Every check below is on the file.

- [ ] The file exists at `DidSpf.WebApi.LK2/docs/lk2-call-sheet.md` and is valid
      plain Markdown.
- [ ] **All ten real endpoints present, and no variant endpoints:**
      ```bash
      grep -o "license-[a-z0-9-]*" DidSpf.WebApi.LK2/docs/lk2-call-sheet.md | sort -u
      ```
      Expect exactly the **ten** family names — **no `-sandbox`, no
      `-health-check`**. Paste the output.
- [ ] **The four `licenseNo` endpoints have it and the six others do not.** Show the
      check. A `license-yp3` entry carrying `licenseNo` is wrong (the controller does
      not accept it); an `license-move` entry without it returns `400`.
- [ ] **Every curl has all four required headers.** Count them per code block and
      show the result — a sheet that produces a `400` on the header check wastes the
      stakeholder's round trip.
- [ ] **No credential leaked** — same programmatic check as TASK-004:
      ```bash
      python3 -c "
      import re
      a=open('DidSpf.WebApi.LK2/appsettings.json',encoding='utf-8-sig').read()
      pws=set(re.findall(r'\"Password\":\s*\"([0-9a-f]{40})\"',a))
      m=open('DidSpf.WebApi.LK2/docs/lk2-call-sheet.md',encoding='utf-8').read()
      print('leaked:',[p for p in pws if p in m] or 'NONE')
      "
      ```
      Expect **`NONE`**.
- [ ] **No invented data.** Confirm every search value is either a marked
      placeholder or a value traceable to Q5-2, and say which in your notes. If you
      could not source a real value for an endpoint, it stays a placeholder — that
      is a pass, not a failure.
- [ ] The `STATUS=30`/`STATUS=40` warning for `license-transit` and `license-export`
      is present near the top.
- [ ] The sheet states plainly that **the stakeholder runs it** and includes where
      to put the output (`../project-docs/`).
- [ ] **Confirm in your notes, explicitly: you made no request to any deployed
      host.** I want that stated, not assumed.
- [ ] No file outside `DidSpf.WebApi.LK2/docs/` created or modified —
      `git status --porcelain`. **Do not commit.**

## Implementation Notes

**Jason (BE), 2026-09-10.** Call sheet written at
`DidSpf.WebApi.LK2/docs/lk2-call-sheet.md`. Every DoD check ran and passed.

### ✅ Explicit statement, as you asked for it

**I made no request to any deployed host.** No call to
`e-connect-did.mod.go.th` or any other deployed environment. I did not start the
API for this TASK, did not touch Oracle or Logstash, and ran no SQL. The only
commands executed were file reads, `grep`, and `python` text checks on files in the
working copy. Writing the sheet was the whole job.

### What the sheet contains

Ten sections, one per real endpoint, in the order listed in the TASK. Each has:
credential **family name** only · a ready-to-paste `curl -i` with all four headers ·
the same values laid out for Swagger "Try it out" · an empty `HTTP status` /
`Response body` block · a one-line "what a good result looks like".

Plus, at the top: a "must fill the blanks first" warning with the reason, the
`STATUS=30`/`STATUS=40` flag for the two endpoints expected to return nothing, and
the one-credential-per-family point. At the bottom: a 10-row summary tick-table and
a place to record which search values were actually used, so a result can be
reproduced later.

### DoD checks

**Ten real endpoints, no variants:**

```
license-export, license-import, license-move, license-sale-domestic,
license-sale-international, license-transit, license-yp2, license-yp3,
license-yp4, license-yp5
count: 10
-sandbox / -health-check occurrences: 0
```

**`licenseNo` correct per endpoint — checked against the controllers, not against
my own memory of the table.** Truth derived by testing each controller for
`REQUIRE_LICENSE_NO`, then compared with what each `curl` URL actually carries:

```
license-import              mandatory     curl has licenseNo: yes   YES
license-move                mandatory     yes   YES
license-sale-domestic       mandatory     yes   YES
license-sale-international  mandatory     yes   YES
license-export              not-accepted  no    YES
license-transit             not-accepted  no    YES
license-yp2..yp5            not-accepted  no    YES
curl blocks: 10 | distinct endpoints: 10 | disagreements: 0
```

**Every curl has all four required headers:**

```
bash blocks: 10
blocks missing a required header: 0
```

**No credential leaked:**

```
leaked: NONE
any 40-hex string in sheet: NONE
```

(Same check as TASK-004, where I also ran the control proving it detects a real
leak — 9 of 11 against the client tool.)

**No invented data.** Every search value in the sheet is a marked placeholder:

```
placeholders used: ['<COMPANY_NAME>', '<LICENSE_NO>', '<PERSONAL_ID>']
```

**Q5-2 has not landed** — `project-docs/` contains only the SA-2 and SA-3 files, no
`SELECT` results — so **no value is traceable to it and every one stays a
placeholder**. Per the TASK that is a pass, not a failure. If Q5-2 arrives, filling
these in is a mechanical edit; I have kept the values in one obvious form so a
find-and-replace does it.

**`STATUS=30`/`STATUS=40` warning present near the top** — §"อ่านก่อนเริ่ม 3 ข้อ"
item 2, as its own table covering `license-transit` and `license-export`, with the
instruction to **record the empty result rather than assume a typo**.

**States the stakeholder runs it, and where output goes** — line 3
("ชุดคำสั่งสำหรับให้ผู้ดูแลระบบเป็นผู้เรียกเอง — ทีมพัฒนาไม่ได้เรียกและจะไม่เรียก") and
lines 9 / 429 both point at `project-docs/`.

**Nothing outside `docs/`:**

```
$ git status --porcelain
 M DidSpf.WebApi.Center/DidSpf.WebApi.Center.csproj.user
 M DidSpf.WebApi.Center/Properties/PublishProfiles/FolderProfile.pubxml
 M DidSpf.WebApi.Center/Properties/PublishProfiles/FolderProfile.pubxml.user
 M DidSpf.WebApi.LK2/DidSpf.WebApi.LK2.csproj.user
?? DidSpf.WebApi.LK2/docs/
```

`docs/` now holds `lk2-api-manual-th.md` (TASK-004) and `lk2-call-sheet.md` (this
TASK). The 4 modified files are the known pre-existing IDE artifacts. Nothing
committed. `dotnet build` not cited — there is no compilation gate here.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-9 (Jason → Sober, non-blocking) — the sheet cannot produce a usable example
  for `license-transit` and `license-export`, and I think that is worth saying out
  loud before the stakeholder runs it.** Both are expected to return `data: []`
  regardless of search value (`STATUS=30` vs the query's `STATUS=40`). The sheet
  tells the runner to record the empty result, which is what the TASK asked for —
  but it means **REQ-005 can deliver at most 8 of 10 real examples**, and the
  manual's §10 will have two endpoints whose only "example" is an empty array.
  Not something to fix in this TASK (changing the filter would be an API change and
  a new REQ). Flagging it so Porter can set expectations *before* the run rather
  than explain it after — it pairs naturally with the SA-7 sequencing note you
  already raised. If the stakeholder wants real rows for those two, the question to
  put to them is whether any form-9/export licence is expected to reach `STATUS=40`
  at all.

## Review

**Sober (SA), 2026-09-10 — verdict: `DONE`.**

Re-ran the checks myself:

| Check | Result |
|---|---|
| Endpoint coverage | **10** family routes, **no** `-sandbox`, **no** `-health-check` |
| `licenseNo` split | all ten correct — present on import/move/sale-domestic/sale-international, absent on export/transit/yp2–yp5 |
| Headers per request | **10 of 10** real `curl` commands carry all four required headers |
| Credential leak | **NONE** of the 11 passwords appear |
| Placeholders | `<LICENSE_NO>` ×10, `<COMPANY_NAME>` ×22 — still unfilled, which is the **correct** output |
| `STATUS=30`/`40` warning, `project-docs` destination | both present |
| Tree | only `docs/` new; nothing committed |

**A false alarm I raised and killed before reporting it:** my first header count
flagged "block 0 has 0 headers". That was my regex matching an inline `` `curl -i` ``
mention in the explanatory prose, not a command. There are exactly **10** real curl
commands and all 10 are complete. Checked before flagging, having got this wrong at
TASK-003.

**The no-calls statement is exactly what I asked for** — explicit, specific about
what was *not* touched, and it matches the evidence: nothing in your notes requires
a live response, and the placeholders are still placeholders. A sheet full of real
values would have been the tell that something got run.

### Q-BE-9 — correct, and it goes to Porter as an expectation to set *before* the run

> answer: **Right, and worth more than a footnote.** `license-transit` (form 9) and
> `license-export` (forms 8/19/20) sit at `STATUS=30` while the query filters
> `STATUS=40`, so those two return `data: []` for **any** search value. REQ-005 can
> therefore yield at most **8 of 10** worked examples, and that ceiling exists in the
> data, not in the call sheet — changing the filter would be an API change and a new
> REQ, exactly as you say.
>
> This is why REQ-005 item 4 says an endpoint with no qualifying data is **a finding
> to report, not a gap to fill**, and your up-front warning is what stops the runner
> concluding they mistyped. Raised to Porter alongside SA-7 so the stakeholder knows
> the ceiling **before** running, not after — otherwise two empty results read as a
> failed exercise instead of the documented state of the data.

### Verdict

`REVIEW` → **`DONE`**. Nothing to rework.

**But note what this does *not* close.** Per SA-7, REQ-005's acceptance criteria all
describe **step 3** — response bodies *actually observed* — so the REQ stays open
awaiting the stakeholder's run. That is not a defect in your work: step 1 was the
whole of your assignment and it is complete.
