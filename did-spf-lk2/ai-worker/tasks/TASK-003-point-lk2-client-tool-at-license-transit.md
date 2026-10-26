# TASK-003: Point the client tool's form-9 entry at `license-transit`
- Source: SPEC-003
- Status: DONE (Sober, 2026-09-10 — see `## Review`. The 3 git-based checks were
  **void as written** and are struck; the file is gitignored. Replaced with a
  stronger all-ten-credential reconciliation. Q-BE-5's propagation problem went up
  as SA-5.)
- Depends on: none
- Repo: logical name **`did-spf`** — real path from the workspace-root
  `machine.local.md`. The file is at the **solution root**:
  `lk2-client-tool/index.html` (**not** under `DidSpf.WebApi.LK2/`).

## What to do

Four values, on two adjacent lines of one static HTML file. Read SPEC-003 first —
it explains the one trap: `CREDS` is keyed by the `auth` name, so renaming one
without the other gives an **empty password and a 401 on a page that looks fine**.

### 1. Rename the credential key and update its password — line ~181

```js
// before
  LicenseShipment:          "68ec2218484344289e5f42707f6005878b001aa1",
// after — key renamed AND a new password value
  LicenseTransit:           "<copy from appsettings.json>",
```

**Copy the password from
`DidSpf.WebApi.LK2/appsettings.json` → `Configurations.BasicAuth.LicenseTransit`
→ `Password`.** Do not retype it by hand and do not take it from any log, chat or
TASK-002 note — copy it from that file, which is authoritative. I have
deliberately not written the value here so there is exactly one source.

Keep the existing column alignment of the `CREDS` block.

### 2. Fix the catalog entry — line ~191

```js
// before
  { label:"หนังสืออนุญาตขนย้าย (Shipment)",       auth:"LicenseShipment",          base:"license-shipment",           params:"flat" },
// after
  { label:"หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์",      auth:"LicenseTransit",           base:"license-transit",            params:"flat" },
```

Three changes on that line: **label**, **auth**, **base**. Leave `params:"flat"`
alone — the parameter rules did not change.

On the label: use exactly **`หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์`**. That is the
canonical name for form 9 (it is `SwaggerTags.LICENSE_TRANSIT` verbatim), and its
sibling `license-export` entry in this same list already uses its own Swagger tag
this way. The old label said ขนย้าย, which is form อ.10 — a different licence.

Keep the line's column alignment consistent with its neighbours.

### 3. Do NOT touch

- **The other nine entries** — labels, routes, auth keys, passwords. One of them
  (`LicenseExport`) has a password that does **not** match `appsettings.json`; I
  know, it is pre-existing, it is SA-4 with Porter, and it is **not yours to fix
  in this TASK**. Leave the wrong value exactly as it is.
- The plaintext-credentials design of this file. Not a refactor opportunity.
- Anything under `DidSpf.WebApi.LK2/` — the API is finished and DELIVERED.
- `_build-out-lk2/`, `spf-build/` — build output.
- Git. Do not commit, stage or branch. (The human commits; twice now they have
  done so mid-session, which is fine and expected.)

## Definition of Done

> ⚠️ **`dotnet build` is NOT evidence for this TASK.** This file is not compiled
> and belongs to no project — a green build says nothing about it. Do not cite it.
> The real automated gate is the JS syntax check below; **I ran it on the current
> file before writing this TASK, and it passes today** (rc 0, 10 `GROUPS`
> entries), so you have a known-good baseline to compare against.

- [ ] **JS still parses.** Extract the `<script>` block and run `node --check`.
      This exact command works — I ran it:
      ```bash
      python3 -c "
      import re,tempfile,os,subprocess
      h=open('lk2-client-tool/index.html',encoding='utf-8').read()
      s=re.findall(r'<script>(.*?)</script>',h,re.S)[0]
      p=os.path.join(tempfile.gettempdir(),'lk2check.js')
      open(p,'w',encoding='utf-8').write(s)
      r=subprocess.run(['node','--check',p],capture_output=True,text=True)
      print('node --check rc =',r.returncode, r.stderr)
      print('GROUPS entries:',len(re.findall(r'\{ label:',s)))
      "
      ```
      Expect **rc = 0** and **GROUPS entries: 10** (unchanged). Paste the output.
- [ ] **No trace of the old names in the file:**
      `grep -ni "shipment" lk2-client-tool/index.html` → **no output at all**.
      (Unlike the API, there is no deliberate exception to keep here — the auth key
      that had to survive in `appsettings.json` is a *server* config value; this
      file should contain neither the old route nor the old key.) Paste the result.
- [ ] **The two names actually agree** — this is the trap check, so make it
      discriminating rather than visual. Confirm the catalog's `auth` value exists
      as a key in `CREDS` and resolves to a non-empty password:
      ```bash
      python3 -c "
      import re
      h=open('lk2-client-tool/index.html',encoding='utf-8').read()
      creds=dict(re.findall(r'^\s{2}(\w+):\s*\"([0-9a-f]{40})\"',h,re.M))
      g=re.search(r'base:\"license-transit\"',h)
      auth=re.search(r'auth:\"(\w+)\",\s*base:\"license-transit\"',h).group(1)
      print('form-9 auth key:',auth)
      print('resolves in CREDS:',auth in creds, '| password len:',len(creds.get(auth,'')))
      "
      ```
      Expect `LicenseTransit`, `True`, length `40`. A `False` or length `0` here is
      the empty-password bug — it would not show up as a page error.
- [ ] **Password is byte-identical to `appsettings.json`** — compare the two files
      directly, do not eyeball two strings:
      ```bash
      python3 -c "
      import re
      a=open('DidSpf.WebApi.LK2/appsettings.json',encoding='utf-8-sig').read()
      ba=a[a.index('\"BasicAuth\"'):]
      app=dict(re.findall(r'\"(\w+)\":\s*\{\s*\"Username\":\s*\"[^\"]*\",\s*\"Password\":\s*\"([0-9a-f]*)\"',ba))
      h=open('lk2-client-tool/index.html',encoding='utf-8').read()
      tool=dict(re.findall(r'^\s{2}(\w+):\s*\"([0-9a-f]{40})\"',h,re.M))
      print('match:', app.get('LicenseTransit')==tool.get('LicenseTransit'))
      "
      ```
      Expect **`match: True`**. Paste it.
- [ ] ~~**The other nine entries are byte-identical to `HEAD`.** Show
      `git diff -- lk2-client-tool/index.html` and confirm it contains **exactly
      two changed lines** (181 and 191) — one `-`/`+` pair each. Any third changed
      line means something else moved. Paste the diff.~~
- [ ] ~~`git diff --stat` shows **exactly one file** changed. Paste it.~~

  > **VOID — struck by Sober 2026-09-10 (Q-BE-5/Q-BE-6). Do not attempt these.**
  > This file is **gitignored** (`.gitignore:40`) and has **never** been tracked, so
  > `git diff` and `git diff --stat` return empty **whatever** the file contains.
  > An empty result here reads as a pass while proving nothing — the exact defect
  > Jason names in Q-BE-6. I wrote three checks against a baseline that does not
  > exist.
  >
  > **Replacement, which is strictly stronger:** reconcile **all ten** `CREDS`
  > values against `appsettings.json`. Nine must match, and the single `DIFFERS`
  > must be `LicenseExport` (the known SA-4 drift). Any *other* `DIFFERS` means an
  > entry was disturbed. This separates "only form 9 changed" from "SA-4 left
  > alone", which the diff could not have done. Jason substituted this himself
  > rather than pasting empty output as a pass; adopted as the real check.
- [ ] **Visual check, if you can do it without touching real infrastructure:**
      open `lk2-client-tool/index.html` in a browser (it is a local static file —
      `file://` is fine, no server and no API needed) and confirm the dropdown
      still lists **ten** entries and the form-9 one now reads
      "หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์". Selecting it should populate the
      password box (non-empty) — that is the empty-password trap, visible.
      **If you have no browser available, say so plainly** and rely on the checks
      above; do not describe a page you did not look at. I will route the visual
      confirmation as a DATA REQUEST if it is missing.
- [ ] **Not required, and do not attempt:** an end-to-end 200 from the live
      endpoint. It needs Oracle, which you must not touch. If you happen to be on
      an environment where the API already runs legitimately, a 401→non-401 on
      `license-transit` is a bonus — otherwise skip it and say so.

## Implementation Notes

**Jason (BE), 2026-09-10.** Both lines changed; every check that *can* run has run
and passed. **Three DoD checks were impossible as written** — the file is
**gitignored**, so there is no `HEAD` version to diff against. I substituted
stronger evidence rather than skipping them; details and Q-BE-5 below.

### What changed — two lines, four values

| Line | Before | After |
|---|---|---|
| 181 | `LicenseShipment:          "68ec2218…001aa1",` | `LicenseTransit:           "30cb2c7a…b569",` |
| 191 | `label:"หนังสืออนุญาตขนย้าย (Shipment)"` | `label:"หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"` |
| 191 | `auth:"LicenseShipment"` | `auth:"LicenseTransit"` |
| 191 | `base:"license-shipment"` | `base:"license-transit"` |

`params:"flat"` untouched. Password **copied programmatically** out of
`DidSpf.WebApi.LK2/appsettings.json` — not retyped, and not taken from TASK-002 or
any log.

### JS syntax gate — the baseline you established still holds

```
node --check rc = 0
GROUPS entries: 10
```

Same as your pre-TASK baseline (rc 0, 10 entries). I did **not** cite `dotnet build`
anywhere; this file is not compiled.

### Old names gone

```
$ grep -ni "shipment" lk2-client-tool/index.html
(no output)
```

### The empty-password trap — checked programmatically, then observed live

```
form-9 auth key: LicenseTransit
resolves in CREDS: True | password len: 40
```

```
match with appsettings.json: True
```

### The three git-based checks could not run — the file is gitignored

`git diff -- lk2-client-tool/index.html` returns **nothing**, and the file never
appears in `git status`. Not because it is unchanged — because it is excluded:

```
$ git check-ignore -v lk2-client-tool/index.html
.gitignore:40:lk2-client-tool/index.html	lk2-client-tool/index.html

$ git ls-files --error-unmatch lk2-client-tool/index.html
error: pathspec ... did not match any file(s) known to git

$ git status --porcelain --ignored lk2-client-tool/
!! lk2-client-tool/
```

So "diff shows exactly two changed lines", "the other nine are byte-identical to
`HEAD`" and "`git diff --stat` shows exactly one file" are all unrunnable — there is
no tracked baseline. **Reporting that rather than pasting the empty output as if it
were a pass.**

**Substituted evidence for "I touched only form 9" — and it is a stronger check
than the diff would have been.** I reconciled **all ten** tool passwords against
`appsettings.json`:

```
CREDS entries: 10
LicenseImport              MATCH
LicenseMove                MATCH
LicenseSaleDomestic        MATCH
LicenseSaleInternational   MATCH
LicenseYp2                 MATCH
LicenseYp3                 MATCH
LicenseYp4                 MATCH
LicenseYp5                 MATCH
LicenseExport              DIFFERS  <-- pre-existing SA-4 drift, left alone as instructed
LicenseTransit             MATCH
```

Nine of ten match config, and **the single mismatch is exactly the `LicenseExport`
value you told me not to fix** — still `da26c2e922…`. If I had disturbed any other
entry it would show here as an unexpected `DIFFERS`. That confirms both "only form 9
changed" *and* "SA-4 left untouched", which the diff alone would not have separated.

Full catalog resolves — no entry has an empty password:

```
license-import             LicenseImport            importLike ok
license-move               LicenseMove              importLike ok
license-sale-domestic      LicenseSaleDomestic      importLike ok
license-sale-international LicenseSaleInternational importLike ok
license-export             LicenseExport            flat       ok
license-transit            LicenseTransit           flat       ok   label -> หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์
license-yp2..yp5           LicenseYp2..Yp5          flat       ok
```

### Visual check — done, and it exercised the trap rather than admiring the page

Opened the file directly in a browser as `file://` — local static file, **no server,
no API, no real infrastructure**. The script runs:

- dropdown lists **10** entries, form 9 reads **"หนังสืออนุญาตผ่านแดนซึ่งยุทธภัณฑ์"**
- selecting it populates the password box: **length 40, starts `30cb2c`** — i.e. the
  `CREDS`/`auth` join resolves. Had I renamed one and not the other, this box would
  be empty with the page still looking fine.
- the URL the tool builds is **`/api/v1/license-transit`**
- `document.body.innerText` contains **no** "shipment"

### Alignment preserved

All ten `CREDS` values start at **column 28**. My catalog line's fields sit at
`auth@50 base@83 params@118` — identical to `license-export` and
`license-sale-international`. (Columns vary 48–50 across the block already, because
Thai combining marks make codepoint columns differ from visual ones; that is
pre-existing.)

### Not attempted

End-to-end 200 against the live endpoint — needs Oracle, which I must not touch. I
did not start the API at all for this TASK; nothing was run against real
infrastructure this session.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-5 (Jason → Sober) — the file is gitignored, so this fix does not travel
  with the repo.** `.gitignore:40` excludes `lk2-client-tool/index.html`; git has
  never tracked it. Two consequences worth a decision, neither of which I can make:
  1. **SPEC-003 and REQ-003 both describe this file as being "in the `did-spf`
     repository"** — that is how the repo-boundary question was settled. It is in
     the working *directory* but deliberately excluded from the *repository*. The
     boundary ruling may still be right (it is the team's tool, the stakeholder
     asked), but it rests on a premise that is not accurate as stated.
  2. **The stakeholder will not receive this change by pulling.** It exists only in
     this working copy. Unlike TASK-001/002 — which the human committed and which
     therefore propagate — a fresh clone or another machine still has the broken
     form-9 entry, exactly like the `V18` migration gap Porter found in the other
     repo. If the intent was "fix the tool for everyone", something has to change
     (un-ignore the file, or ship it another way). If the intent was "fix it on this
     machine", it is done.
  I have changed nothing about `.gitignore` — that is a repo-policy decision, not
  mine, and TASK-003 tells me not to touch git.

- **Q-BE-6 (Jason → Sober, minor) — DoD steps 5–7 need rewording for the next
  reader.** They ask for `git diff`/`git diff --stat` output on an untracked file,
  which returns empty. An empty result there reads like a clean pass; someone
  following the steps literally could report success having verified nothing. The
  password-reconciliation check above is the discriminating replacement — it varies
  with the answer. Suggest folding that in if this TASK is ever used as a template.
  (Same class of issue as TASK-002's missing-section check, not a repeat of it.)

## Review

**Sober (SA), 2026-09-10 — verdict: `DONE`.**

Every check re-run by me on the file itself.

| Check | Result |
|---|---|
| `node --check` on the extracted script | **rc 0**, `GROUPS entries: 10` — matches the pre-TASK baseline |
| `grep -ni shipment` | **no output**; `license-shipment` and `LicenseShipment` both absent |
| The `CREDS`/`auth` join (the trap) | form-9 `auth` = `LicenseTransit`, **resolves in `CREDS`**, password length **40** |
| Password vs `appsettings.json` | **True** — byte-identical, compared file-to-file |
| All ten passwords reconciled | 9 MATCH, single `DIFFERS` = `LicenseExport` (the SA-4 drift, correctly left alone) |
| Line endings | still **LF-only**, no CRLF conversion — a careless editor would have flipped this whole file |
| Catalog integrity | 10 routes, the 9 originals present **and in original order**, form 9 still in slot 5 |

**I could still diff the nine other entries, and did.** The git checks were void,
but I had read this file's `CREDS` block and catalog earlier in the same session,
before the change — so I used those captured values as the baseline: **9 of 9 other
credentials unchanged**, `LicenseShipment` key gone, route list otherwise identical.
Combined with your reconciliation, "only form 9 moved" is evidenced, not assumed.

One correction to my own review process: I briefly flagged a line-count change
464 → 465. That was my arithmetic, not the file — 464 newlines before and after.
Nothing was added.

### Q-BE-5 — you were right on both points. One I fixed, one goes up.

> answer: **Verified independently before answering: `git check-ignore -v` matches
> `.gitignore:40`, `git ls-files --error-unmatch` fails, `git log --all` on the path
> is empty. The file has never been tracked.**
>
> **(1) My premise was wrong and I have corrected it in writing.** I justified the
> boundary ruling with "it is inside the `did-spf` repository". It is in the working
> *directory* and excluded from the *repository* — not the same claim. SPEC-003 now
> carries the correction. The **ruling itself stands**, because the load-bearing
> reasons never depended on tracking status: it is the team's tool, it exercises the
> API we own, and the stakeholder asked for the change. But I am not leaving a wrong
> premise sitting there looking verified.
>
> **(2) The propagation problem is real and it is not yours to solve.** You are
> right that this is the same shape as the `V18` migration gap: the work is correct
> and lands nowhere but this working copy. That decides whether REQ-003 has actually
> met its goal, which is a stakeholder call, so it goes to Porter as **SA-5**. You
> were also right not to touch `.gitignore` — repo policy is not a BE decision and
> the TASK told you not to touch git.
>
> Nothing further for you on this TASK.

### Q-BE-6 — correct, and this is the third time. The pattern is mine.

> answer: **Accepted, and I have struck the three steps in the DoD above** with a
> note saying why and what replaces them, so the next reader cannot follow them into
> a false pass. Your reconciliation check is adopted as the real one — it is
> strictly stronger than the diff I asked for, because it distinguishes "only form 9
> changed" from "SA-4 left untouched" in a single result.
>
> Worth stating plainly: **three TASKs, three defective checks from me.** TASK-001 —
> a DoD only satisfiable by breaking your hard boundary. TASK-002 — a check that
> returned the same answer either way. TASK-003 — three checks against a baseline
> that does not exist. Each time you caught it and substituted something that
> actually discriminates.
>
> **Standing rule I am adopting, and will apply before handing over any future
> TASK:** for each DoD step, state what result would appear if the property were
> **false**. If that is the same as the passing result, or the step cannot run at
> all in the environment the assignee actually has, the step is not a check and does
> not go in. I will verify the commands on the current tree first — as I did for
> `node --check` here, which is precisely why that one gate held.

### Verdict

Everything in scope is done and independently evidenced; the visual check was done
without touching any real infrastructure. `REVIEW` → **`DONE`**. Nothing to rework.
The one open item, SA-5, is a stakeholder decision above your level and above mine.
