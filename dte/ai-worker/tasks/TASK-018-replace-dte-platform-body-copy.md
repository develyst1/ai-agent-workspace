# TASK-018: Replace `DTE Platform` with `DTE` on 5 body-copy lines in 4 files
- Source: SPEC-005
- Owner: **FE (Fern)**
- Status: **DONE** — reviewed 2026-09-09 by Sober; verdict + re-run evidence in §Review
- Depends on: none

## What to do

Five lines of **visible page copy** in `front/` still read `DTE Platform`. The owner has stated the
replacement himself — the short **`DTE`** (`SYSTEM-FACTS.md` **A38**) — and has **excluded** the
`src/services/api.ts:1` source comment (**A39**). Change exactly these five lines and nothing else.

**The edit, defined precisely:** on each line below, replace the 12-byte ASCII substring
`DTE Platform` with the 3-byte ASCII `DTE`. **Every other byte on that line stays as it is**, and no
other line in any file changes. Two of the lines carry long Thai product copy — do not retype them,
do not re-indent, do not "tidy" the JSX. Each edited line ends up exactly **9 bytes shorter**.

| # | File (under `front/`) | Line | What is there today |
|---|------------------------|------|---------------------|
| 1 | `src/app/about/page.tsx` | 45 | `description="DTE Platform คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI …"` — 409 bytes → 400 |
| 2 | `src/app/about/page.tsx` | 128 | `<th className="text-left p-6 text-sky-600 font-bold">DTE Platform</th>` — 88 bytes → 79 |
| 3 | `src/app/login/page.tsx` | 86 | the text node inside the page `<h1>` — 26 bytes → 17 |
| 4 | `src/app/register/page.tsx` | 193 | the text node inside the same-shaped `<h1>` — 26 bytes → 17 |
| 5 | `src/app/teach/page.tsx` | 104 | `<span>สอนกับ DTE Platform</span>` — 56 bytes → 47 |

(Byte counts are the current values I measured on `develop`; if a line's current count differs, the
file moved under me — **stop and ask in §Questions** rather than editing a line number that drifted.)

🔴 **Three things that are NOT yours to touch, and touching one is a defect, not initiative:**

- **`src/services/api.ts:1`** — `// API Service Layer for DTE Platform`. The owner excluded it in
  his own words (**A39**). It keeps `DTE Platform`. Not even "while I was in there".
- **The two stray About files** — `src/app/about/page-new.tsx` and `src/app/about/page.tsx.backup`.
  They sit in the same folder as file #1 and hold **8** more `DTE Platform` lines between them. They
  are not routes; Porter carries them as housekeeping. A glob or folder-wide `sed` **will** hit
  them. Their mtimes must still read `2026-09-06 20:50` when you are done.
- **Every page title REQ-005 settled.** `about/page.tsx` line 13 is
  `title: 'เกี่ยวกับเรา'` — in the *same file* you are editing. `/login` `/register` `/teach` get
  their titles from the pass-through `layout.tsx` files you added in TASK-016; do not open them.

**No layout, component, routing, styling, dependency or metadata change is authorised**
(REQ-006 **C1**). Five text substrings, four files.

**Expected visual consequence, deliberately not "fixed":** on `/login` and `/register` the `<h1>`
wordmark goes from 12 characters to 3 inside a `text-4xl` gradient heading. That is the owner's own
choice (A38) and it is his to look at (REQ-006 AC 6). **Do not add words, do not change the class
list to compensate.** If you think a sentence genuinely does not read right with `DTE` in it, that
is a `## Questions` item for me to carry to Porter — never a rewrite.

## Definition of Done

Run each command from `front/` unless stated. Paste the **actual output**, not a claim.

- [ ] **1. Enumerate first, edit second.** Before touching anything, run
      `grep -rn "DTE Platform" . --exclude-dir=node_modules --exclude-dir=.next | sort` and confirm
      **14** lines split exactly as the table above says (5 in scope, `api.ts:1`, 8 in the 2 strays).
      If the split differs, **stop and ask** — do not edit from my list.
- [ ] **2.** Exactly **4 files modified, 0 added, 0 deleted.** Prove it with mtimes:
      `ls -l --time-style=long-iso src/app/about/ src/app/login/page.tsx src/app/register/page.tsx src/app/teach/page.tsx src/services/api.ts`
      — `page-new.tsx` and `page.tsx.backup` must still read **2026-09-06 20:50**, and `api.ts` must
      keep its pre-existing mtime.
- [ ] **3. Byte-length proof, per line** (this is how you show the Thai did not drift): for each of
      the 5 lines, `sed -n '<N>p' <file> | tr -d '\n' | wc -c` gives **400 / 79 / 17 / 17 / 47**
      respectively. Any other number means something besides the 12 bytes changed.
- [ ] **4. Scoped grep is empty:**
      `grep -rn "DTE Platform" src/app/about/page.tsx src/app/login/page.tsx src/app/register/page.tsx src/app/teach/page.tsx`
      → no output, **exit code 1**.
- [ ] **5. Repo-wide grep returns exactly 9:**
      `grep -rn "DTE Platform" src | wc -l` → **9** (8 stray lines + `api.ts:1`). This is REQ-006
      AC 3: the survivors are known and deliberate, **not** a miss. Paste the 9 lines.
- [ ] **6.** `npm run build` → **exit 0**, same **9 routes** as before, none added or lost.
- [ ] **7.** `npx tsc --noEmit` → **exit 0**.
- [ ] **8.** On **your own** dev server (pick a free port, say so, and **stop it afterwards** —
      never production, never a GET to `dte.develyst.online`): `/about` `/login` `/register`
      `/teach` all return **HTTP 200**, and each rendered HTML body contains **no** `DTE Platform`.
- [ ] **9.** In that same rendered HTML, show the replacement actually landed on screen: `/about`
      contains `>DTE</th>` and `DTE คือการเรียนรู้`, `/login` and `/register` each contain `DTE`
      inside the `<h1>`, `/teach` contains `สอนกับ DTE`.
- [ ] **10. REQ-005 is unharmed — all 8 titles, re-read live**, character-exact:
      `/`=`DTE — Develyst The Education` (one part) · `/about`=`เกี่ยวกับเรา | …` ·
      `/courses`=`ทักษะทั้งหมด | …` · `/login`=`เข้าสู่ระบบ | …` · `/register`=`สมัครสมาชิก | …` ·
      `/teach`=`สอน | …` · `/verify-email`=`ยืนยันอีเมล | …` · `/classroom/<id>`=`ห้องเรียน | …`.
- [ ] **11.** `/`'s rendered title has a **pipe count of `0`** (A31 — the one failure that is
      silent; TASK-015/016/017 all checked it and so does this one).
- [ ] **12.** `grep -rn "Disrupt Thai" src | wc -l` → **0**. REQ-004 stays closed (REQ-006 **C3**);
      the superseded name must not reappear.
- [ ] **13.** Emoji harness, run from `front/` with `src` as its argument and the script invoked by
      its **workspace** path (`<workspace>/dte/ai-worker/tests/harness/check-no-emoji.mjs src`):
      **124 occurrences** = the baseline, unchanged. **The exit code is not the signal** — the
      harness exits 1 whenever the baseline is non-empty; the count is what matters.
- [ ] **14.** Open the four pages in a real browser and say what you saw, including the `/login` and
      `/register` headings at their new length. An automated browser is **not** the owner's eyes —
      write that as `UNVERIFIED` (REQ-006 AC 6).

## Implementation Notes

Fern, 2026-09-09. All commands run from `front/` in the `dte` repo unless stated. Output pasted as
produced.

**What changed — 5 lines, 4 files, literal `DTE Platform` → `DTE`, nothing else:**
`src/app/about/page.tsx` 45 + 128 · `src/app/login/page.tsx` 86 · `src/app/register/page.tsx` 193 ·
`src/app/teach/page.tsx` 104. Applied as 5 line-addressed `sed -i '<N>s/DTE Platform/DTE/'` calls.

🔴 **Deviation found and repaired — read this first (DoD 2/3 depended on it).**
The `sed -i` calls silently rewrote all four files from **CRLF to LF** (`core.autocrlf=true` here, no
`.gitattributes`). Content was correct, but every line's bytes had changed, which the TASK forbids.
Caught by comparing file sizes: `login` fell 245 bytes, not 9 (= 236 lines × `\r` + 9). Repaired with
`perl -i -pe 's/\n/\r\n/'` on exactly those 4 files. Post-repair sizes are the originals **minus
exactly 9** (about: 18, two lines): `about` 13017→**12999** · `login` 11869→**11860** ·
`register` 16523→**16514** · `teach` 20626→**20617**, and `tr -cd '\r' | wc -c` == `wc -l` on all
four (211/236/342/415), i.e. CRLF is fully restored. The 4 protected files were never opened.

**1. Enumerate first (`grep -rn "DTE Platform" . --exclude-dir=node_modules --exclude-dir=.next | sort`)**
→ **14** lines, split exactly as the table says: 5 in scope · `src/services/api.ts:1` ·
8 stray (`about/page-new.tsx` 13/45/128 = 3, `about/page.tsx.backup` 15/65/126/240/309 = 5).

**2. Files touched — 4 modified, 0 added, 0 deleted.** `ls -l --time-style=long-iso` after the work:
```
-rw-r--r-- 13032 2026-09-06 20:50 src/app/about/page-new.tsx      <- untouched
-rw-r--r-- 12999 2026-09-09 08:14 src/app/about/page.tsx
-rw-r--r-- 24659 2026-09-06 20:50 src/app/about/page.tsx.backup   <- untouched
-rw-r--r-- 11860 2026-09-09 08:14 src/app/login/page.tsx
-rw-r--r-- 16514 2026-09-09 08:14 src/app/register/page.tsx
-rw-r--r-- 20617 2026-09-09 08:14 src/app/teach/page.tsx
-rw-r--r-- 11244 2026-09-06 20:54 src/services/api.ts             <- untouched
```
Both strays still read **2026-09-06 20:50**; `api.ts` keeps its **2026-09-06 20:54**.
Corroborated by `git diff --numstat` (read-only, no git writes): `about/page.tsx` `3 3` (my 2 lines +
the pre-existing TASK-015 title line), `login` `1 1`, `register` `1 1`, `teach` `1 1` — one changed
line each, no line-ending noise.

**3. Byte-length proof** — `sed -n '<N>p' <file> | tr -d '\n' | wc -c`, pre → post:
`about:45` 409→**400** · `about:128` 88→**79** · `login:86` 26→**17** · `register:193` 26→**17** ·
`teach:104` 56→**47**. Every one is exactly 9 shorter; the pre-values matched your measurements, so
no line had drifted. Resulting lines:
```
              description="DTE คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI คุณไม่ได้แค่ดูวิดีโอเดี่ยว แต่มี AI ครูส่วนตัวคอยช่วยตลอดเวลา ถามอะไรก็ได้ ได้คำตอบทันที"
                  <th className="text-left p-6 text-sky-600 font-bold">DTE</th>
              DTE
              DTE
            <span>สอนกับ DTE</span>
```

**4. Scoped grep over the 4 files** → no output, `exit=1`. ✅

**5. `grep -rn "DTE Platform" src | wc -l` → 9.** The 9 survivors, all deliberate:
```
src/app/about/page-new.tsx:13    title: 'เกี่ยวกับเรา | DTE Platform',
src/app/about/page-new.tsx:45    description="DTE Platform คือการเรียนรู้ส่วนตัว…"
src/app/about/page-new.tsx:128   <th …>DTE Platform</th>
src/app/about/page.tsx.backup:15    title: 'เกี่ยวกับเรา | DTE Platform',
src/app/about/page.tsx.backup:65    description="DTE Platform คือการเรียนรู้ส่วนตัว…"
src/app/about/page.tsx.backup:126   <th …>DTE Platform</th>
src/app/about/page.tsx.backup:240   DTE Platform คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI
src/app/about/page.tsx.backup:309   <th …>DTE Platform</th>
src/services/api.ts:1            // API Service Layer for DTE Platform
```

**6. `npm run build` → exit 0**, `✓ Compiled successfully in 2.6s`, **9 route rows**, unchanged:
`/ · /_not-found · /about · /classroom/[id] · /courses · /login · /register · /teach · /verify-email`.

**7. `npx tsc --noEmit` → exit 0** (no output).

**8/9. Local dev server, my own, port 3111** (`npm run dev -- -p 3111`, bound `127.0.0.1`, **stopped
afterwards** — `taskkill /PID 4908 /T /F`, port no longer LISTENING). Nothing was sent to
`dte.develyst.online`.
- `/about` `/login` `/register` `/teach` all **HTTP 200**; `grep -c "DTE Platform"` on each rendered
  body → **0 / 0 / 0 / 0**.
- `/about` body contains `>DTE</th>` and `DTE คือการเรียนรู้` ✅
- `/login` and `/register` each render
  `<h1 class="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">DTE</h1>` ✅
- 🔶 **`/teach` — `สอนกับ DTE` is NOT in the rendered HTML, and this is not a defect of the edit.**
  `teach/page.tsx` is `'use client'` wrapped in `withAuth`, so an unauthenticated request renders only
  the spinner shell (`<main class="flex-grow"><div …><div class="animate-spin …"></div></div></main>`);
  the edited `<span>` lives past the auth guard. Same guard shape as the classroom tab in TASK-017.
  `UNVERIFIED — that `สอนกับ DTE` renders on /teach; settled by loading /teach while logged in. I have
  no credentials and will not invent an account.` The source line itself is proven at 47 bytes (DoD 3).

**10. All 8 titles, re-read live, character-exact:** `/`=`DTE — Develyst The Education` ·
`/about`=`เกี่ยวกับเรา | DTE — Develyst The Education` · `/courses`=`ทักษะทั้งหมด | …` ·
`/login`=`เข้าสู่ระบบ | …` · `/register`=`สมัครสมาชิก | …` · `/teach`=`สอน | …` ·
`/verify-email`=`ยืนยันอีเมล | …` · `/classroom/1`=`ห้องเรียน | …`. REQ-005 unharmed.

**11. `/`'s rendered `<title>` pipe count = 0.** ✅ (all other 7 = 1)

**12. `grep -rn "Disrupt Thai" src | wc -l` → 0.** ✅

**13. Emoji harness**, `node <workspace>/dte/ai-worker/tests/harness/check-no-emoji.mjs src` from
`front/` → `124 occurrence(s) in 44 file(s) scanned.` — baseline unchanged. Exit code 1 as expected
(non-empty baseline), which per the DoD is not the signal.

**14. Browser look (automated Chrome on 127.0.0.1:3111, then closed).** What I saw:
- `/login` and `/register`: the wordmark heading is now a short **`DTE`**, centred, in the same
  `text-4xl` sky→cyan gradient, with the Thai subtitle unchanged underneath. It reads as a small
  three-letter word in a heading sized for a longer one — visibly airier than before. **No class or
  wording was changed to compensate** (A38 / REQ-006 AC 6).
- `/about`: accessibility tree shows `DTE คือการเรียนรู้ส่วนตัวที่ขับเคลื่อนด้วย AI …` and the
  comparison-table header cell as plain `DTE`. Surrounding Thai copy is untouched.
- `/teach`: spinner only (auth guard, see 8/9).
- `UNVERIFIED — the owner's own eyes. An automated browser is not the owner's eyes (REQ-006 AC 6);
  the /login and /register headings at their new length still need his look, and DONE ≠ deployed.`

## Questions

**Q1 (not blocking — for your review call).** DoD 9 asks me to show `สอนกับ DTE` in `/teach`'s
rendered HTML, but `/teach` is behind `withAuth` and serves only a spinner to an unauthenticated
request, so that half of DoD 9 is unreachable by any evidence I am allowed to produce. I have marked
it `UNVERIFIED` rather than claim it. Is the source-line proof (47 bytes, DoD 3) + `HTTP 200` +
`0 × "DTE Platform"` enough for you, or do you want it carried up as a fourth owner-eyes item
alongside the three from REQ-005?

> **answer (Sober, 2026-09-09): both — and the DoD was mine to get wrong.** The evidence you *can*
> produce is enough for me, and I re-confirmed every piece of it myself: DoD 3's 47-byte source line,
> HTTP 200, `0 × "DTE Platform"` in the body, and the structural reason (`'use client'` line 1 +
> `export default withAuth(TeachPage)` line 415, the `<span>` at 104 inside the guarded tree).
> **You were right to mark it `UNVERIFIED` rather than claim it, and it costs you nothing here.**
> It does go up as a **fourth owner-eyes item** beside REQ-005's three, because REQ-006 **AC 6** is
> his eyes and not a command: `สอนกับ DTE` is only visible to a logged-in teacher. DoD 9 should
> never have asked an unauthenticated fetch to prove a string behind an auth guard — my defect, and
> **SPEC-005 §Flow (a) is corrected in place**. Future TASKs of mine name the auth boundary in the
> DoD itself instead of leaving you to discover it.

**Q2 (tooling, may affect future TASKs).** `sed -i` in this environment converts CRLF→LF
whole-file (`core.autocrlf=true`, no `.gitattributes`). I detected and repaired it this time — see
the 🔴 block in §Implementation Notes — but any future byte-exact TASK will hit the same trap, and
`git diff` hides it. Worth a line in `SYSTEM-FACTS.md` via Porter? Your call; I have not written
anything outside my TASK.

> **answer (Sober, 2026-09-09): yes — worth recording, and you did the right thing by not writing it
> yourself.** It is an environment fact about this machine, which is what `SYSTEM-FACTS.md` exists
> for, but that file is **Porter's alone** and neither of us writes in it — so I am routing it to him
> as a recommendation in your own words, not as a fact I assert. Two things meanwhile: (1) it is
> recorded in **SPEC-005 §Decision 3** so it survives even if Porter declines; (2) **I am changing my
> own TASK-writing**, which is the part that actually protects the next byte-exact job — from here a
> DoD that pins per-line byte lengths also pins **file size** and **`tr -cd '' | wc -c` ==
> `wc -l`**. Your instinct caught this one; the checklist should have.

## Review

**Verdict: `DONE` — no rework. Reviewed 2026-09-09 by Sober (SA Lead).**

I re-ran all 14 DoD myself against the real repo rather than reading your paste, and varied what I
could so it is not a replay: my **own** dev server on **3041** (started and **stopped** by me, port
re-checked free) and classroom id **42**, not your `1`.

- **1 / 5 — enumeration.** `grep -rn "DTE Platform" . --exclude-dir=node_modules --exclude-dir=.next`
  now returns **9** lines, and they are exactly the 9 you listed: 3 in `about/page-new.tsx`, 5 in
  `about/page.tsx.backup`, 1 in `src/services/api.ts:1`. 14 before, 9 after, 5 gone. ✔
- **2 — scope, proved by full-ISO mtimes, not by claim.** `find front/src -newermt "2026-09-09 00:00"`
  plus `ls --time-style=full-iso`: **exactly four** files carry `08:14:49` (about / login / register /
  teach `page.tsx`). Everything else modified today is **earlier work** — TASK-015 at `00:11`,
  TASK-016 at `00:34`, TASK-017 at `03:55`. The two strays still read **2026-09-06 20:50** and
  `api.ts` **2026-09-06 20:54**: **A39 is intact**. ✔
- **3 — byte lengths per line: 400 / 79 / 17 / 17 / 47**, my own measurement, exactly yours. The long
  Thai on lines 45 and 104 did not drift. ✔
- **The CRLF repair holds.** On all four files `tr -cd '\r' | wc -c` == `tr -cd '\n' | wc -c`
  (211 / 236 / 342 / 415) and sizes are 12999 / 11860 / 16514 / 20617. Read-only `git diff --numstat`
  shows **one changed line each** (`about` `3 3` = your 2 lines + TASK-015's pre-existing title line).
  Your self-caught deviation is genuinely repaired, not papered over — and catching it yourself, by
  file-size delta, is the reason this review is short.
- **4** scoped grep over the 4 files → no output, **exit 1** ✔ · **12** `Disrupt Thai` → **0** ✔
- **6** `npm run build` **exit 0**, `✓ Compiled successfully`, the **same 9 routes**
  (`/classroom/[id]` still `ƒ`) · **7** `npx tsc --noEmit` **exit 0** ✔
- **8 / 9** on my server: `/about` `/login` `/register` `/teach` all **HTTP 200**, `DTE Platform`
  count **0 / 0 / 0 / 0** in the rendered bodies; `/about` renders `>DTE</th>` and
  `DTE คือการเรียนรู้`; `/login` and `/register` each render
  `<h1 class="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-2">DTE</h1>`
  — the class list is byte-identical to before, nothing was re-classed to compensate. ✔
- **10 / 11 — REQ-005 unharmed.** All **8** titles re-read live and character-exact, including
  `/classroom/42` = `ห้องเรียน | DTE — Develyst The Education`; `/`'s rendered title has a pipe count
  of **0** (**A31**, the one failure that is silent). SPEC-005 §Decision 4's trap did not fire:
  `about/page.tsx` kept `title: 'เกี่ยวกับเรา'` while two of its lines changed. ✔
- **13** emoji harness from `front/` with `src`: **124 occurrence(s) in 44 file(s) scanned** =
  baseline, unchanged. ✔

🔴 **DoD 9's `/teach` half was MY defect, not yours.** It asked for rendered evidence of a string
that sits **past** an auth guard. I confirmed the structure myself: `teach/page.tsx` is `'use client'`
(line 1) and `export default withAuth(TeachPage)` (line 415), with the edited `<span>` at line 104
inside the guarded tree; an unauthenticated body renders only the `animate-spin` shell and
`grep "สอนกับ DTE"` on it exits 1. Your `UNVERIFIED` is **structural and correct**. I have
**corrected SPEC-005 §Flow (a) in place** — it wrongly said the pill "is readable on arrival", which
is true of the *title* (a server `layout.tsx` from TASK-016) and false of the *pill*.

**Accepted `UNVERIFIED`, carried up rather than laundered:**
1. The live site is unchanged — **`DONE` ≠ deployed**.
2. Only an automated browser has looked. REQ-006 **AC 6** is the owner's own eyes — specifically the
   `/login` and `/register` wordmark, now **3 characters inside a `text-4xl` gradient heading**. That
   shortening is his own choice (**A38**); you correctly added no words and changed no class.
3. `สอนกับ DTE` on `/teach` has never been seen rendered, and cannot be without a session. This is a
   **fourth** owner-eyes item, added to the existing Blocked row.

**Out of scope stayed out**, for both of us: no `back/`, no schema, no database, no production
contact, no git write, and no implementation code written by me.
