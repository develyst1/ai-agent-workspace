# TASK-019: Apply the ten decided resume-fact corrections
- Source: SPEC-005
- Status: **DONE (2026-09-09, Sober)** — 10/10 edits verified by SA against the working tree and the built HTML; **FQ32 answered and routed as C9 into SPEC-005 Group B (SQ27)** — see §Review
- Depends on: none
- Owner: **Fern (FE)**

## What to do

Ten string edits, already decided verbatim by the owner (REQ-005 §Owner decisions, Q40:
*"resume base … 3y+ นั่นคือทั้งหมด ตอนนี้เป็น 4 ปีแล้ว ส่วน GFAI ฉันทำแค่สามสัปดาห์ ตามresume"*).
Nothing here needs anyone's approval — it is already his answer. **Do not touch any other
string, do not tidy anything nearby, do not change any component.**

All paths relative to `front/`. Line numbers were read on 2026-09-09; if a line has moved,
match on the text, not the number.

| # | File | Change |
|---|---|---|
| C1.1 | `src/constant/content/about.ts` (`EXPERIENCE.gfai.body[0]`) | `In two weeks I delivered` → `In about three weeks I delivered` |
| C1.2 | `src/constant/content/about.ts` (`VALUES.execution.description`) | `a robotic kiosk prototype in two weeks` → `a robotic kiosk prototype in about three weeks` |
| C1.3 | `src/components/partials/Home/Home.config.ts` (`HOME_LEAD`) | `to a working prototype in two weeks` → `to a working prototype in about three weeks` |
| C1.4 | `src/app/layout.tsx` (`metadata.description`) | `Robotic kiosk prototype delivered in two weeks` → `Robotic kiosk prototype delivered in about three weeks` |
| C1.5 | `src/app/about/page.tsx` (`metadata.description`) | `a robotic kiosk prototype delivered in two weeks` → `a robotic kiosk prototype delivered in about three weeks` |
| C2 | `src/constant/content/about.ts` (`EXPERIENCE.gfai.role`) | `'AI and Developer'` → `'AI & Robotics Developer'` |
| C3.1 | `src/constant/content/about.ts` (`EXPERIENCE.icm.organisation`) | `'ICM Smart Solutions Co., Ltd.'` → `'ICM Smart Solution Co., Ltd.'` |
| C3.2 | `src/constant/content/about.ts` (`CERTIFICATES.employee-survival.issuer`) | `'ICM Smart Solutions'` → `'ICM Smart Solution'` |
| C4 | `src/constant/content/about.ts` (`EXPERIENCE.icm.role`) | `'Senior Software Engineer'` → `'Senior / Staff Software Engineer'` |
| C6 | `src/constant/content/about.ts` (`CAREER_STATS` id `years`) | `value: '3+'` → `value: '4'`. **The label `Years experience` does not change.** |

Three things that look like mistakes and are not:

1. **C3 stays title case.** The resume prints `ICM SMART SOLUTION CO., LTD.` all-caps. The
   fact being corrected is the singular/plural, not the casing — the site keeps its own
   casing convention. Do not upper-case it.
2. **C4 changes `EXPERIENCE.icm.role` only.** `SITE.role` in `src/constant/site.ts` is a
   *different* conflict (C5) and is **not** in this task — leave `site.ts` untouched.
3. **`SITE.location` is not touched.** "Chatuchak" must not appear anywhere; the owner
   forbade it (`ห้าม`).

## Definition of Done

- [x] All ten edits applied, exactly as tabled, and nothing else changed.
- [x] `cd front && grep -rn "two weeks" src/` returns **zero** lines.
- [x] `cd front && grep -rn "Smart Solutions" src/` returns **zero** lines.
- [x] `cd front && grep -rn "'3\+'" src/` returns **zero** lines.
- [x] `cd front && npx tsc --noEmit` — exit 0, no output.
- [x] `cd front && npm run build` — exit 0, no **new** error or warning line versus before
      the change (paste the tail of both runs, or state that the before-run was clean).
- [x] `cd front && npm run dev`, then **look at** `/` and `/about` — **9 of 10 seen as
      pixels; the `4 Years experience` stat is rendered-DOM-verified only** (see notes).
- [x] `git status` reported in the notes. **You do not commit** — git is the human's alone.

## Implementation Notes

**Fern, 2026-09-09.** All ten edits applied exactly as tabled. Nothing else touched.

**Diff — `git diff --stat`, 4 files, 10 insertions / 10 deletions (one line per tabled edit):**

```
front/src/app/about/page.tsx                      |  2 +-   (C1.5)
front/src/app/layout.tsx                          |  2 +-   (C1.4)
front/src/components/partials/Home/Home.config.ts |  2 +-   (C1.3)
front/src/constant/content/about.ts               | 14 +++++++-------  (C1.1 C1.2 C2 C3.1 C3.2 C4 C6)
```

`src/constant/site.ts` untouched (C5 is not this task). `SITE.location` untouched —
"Chatuchak" appears nowhere.

**The three "look like mistakes and are not" were all respected:** C3 kept site title case
(`ICM Smart Solution Co., Ltd.`, not the resume's all-caps); C4 changed `EXPERIENCE.icm.role`
only; `site.ts` and `SITE.location` never opened for writing.

**Grep results (DoD greps, run after the edits — all three return zero lines):**

```
$ grep -rn "two weeks" src/          -> (no output)
$ grep -rn "Smart Solutions" src/    -> (no output)
$ grep -rn "'3+'" src/               -> (no output)
```

**Typecheck:** `npx tsc --noEmit` -> exit 0, no output.

**Build:** both runs exit 0. Grepping each full log for `error|warn|failed`
(case-insensitive) returns **nothing in either** — so the before-run was clean and the
after-run introduces no new line. Route table byte-for-byte identical before vs after
(`/` 2.74 kB / 283 kB, `/about` 2.65 kB / 279 kB, shared 102 kB), which is expected: only
string literals changed.

**Seen on screen** (dev server `npx next dev -p 3011`; port 3000 was free, I used 3011 anyway
and it is now stopped again — see the line-endings note below for why `.next` is gone):

- `/` — screenshot: hero lead reads "…from zero to a working prototype in **about three
  weeks**, and cut client costs…" (C1.3). `<meta name="description">` read from the live
  document: "…Robotic kiosk prototype delivered in **about three weeks**…" (C1.4).
- `/about` — rendered page text carries **all** of: "AI & Robotics Developer" (C2),
  "In about three weeks I delivered" (C1.1), "ICM Smart Solution Co., Ltd." (C3.1),
  "Senior / Staff Software Engineer" (C4), "…a robotic kiosk prototype in about three
  weeks…" (C1.2), certificate issuer "ICM Smart Solution" (C3.2). Its
  `<meta name="description">` reads "…delivered in **about three weeks**." (C1.5).
- **C6 is the one I could not photograph.** `CAREER_STATS` renders in `HomeStats.tsx`, i.e.
  on `/`, not `/about`. In the live DOM that element's text is `"4 | Years experience"` with
  `opacity: 1`, `visibility: visible`, inside the viewport — so the value **is** rendered.
  But every screenshot of that scrolled region on `/` came back as an unpainted frame
  (the animated background does not re-composite for the capture), so **I have not seen the
  "4" as pixels with my own eyes** — I am reporting it as rendered-DOM-verified, not
  photographed. QA's picture round is the place that closes this.

**Line endings — I chased a ghost, and the lesson is about the measuring tool, not `sed`.**
Worth reading before anyone "fixes" line endings in this repo:

- `git diff` printed `LF will be replaced by CRLF` on my four files, and `grep -c $'\r'`
  reported CRs on every line of them but **0** on an untouched sibling (`site.ts`). I read
  that as `sed -i` having rewritten whole files LF→CRLF, and "fixed" all four to pure LF
  with `node`.
- **That reading was wrong. `grep -c $'\r'` is not trustworthy in this shell.** A byte-level
  count (`fs.readFileSync(f).filter(x=>x===13).length`) says the opposite and is the truth:
  **`site.ts` has 29 CR bytes — the working copy is CRLF**, which is exactly what
  `core.autocrlf=true` produces on checkout. So the four files were *already* CRLF and
  correct; **`sed -i` changed nothing but the ten strings**, and my LF conversion was the
  only thing that actually altered them.
- **Restored.** All four are CRLF again and now byte-for-byte match the sibling convention
  (CR count == LF count == line count on each; `site.ts` 29/29 unchanged). The
  `LF will be replaced by CRLF` warnings are gone from `git diff`, which is the confirmation.
- Re-verified *after* the restore, not before: `git diff --stat` still **10 insertions / 10
  deletions across the same 4 files**, the three DoD greps still zero, `npx tsc --noEmit`
  exit 0, `npm run build` exit 0 with zero `error|warn|failed` lines.
- **Takeaway for the next engineer:** `sed -i` is fine here; **`grep -c $'\r'` is not** —
  count CR bytes with `node`, and trust `git diff`'s absence of a warning over grep.

**`front/.next` was deleted** before starting dev (the practical rule: never run `npm run dev`
on top of a `next build` output). It is regenerable, gitignored build output — the human just
re-runs `npm run build`. Nothing in `src/` or any tracked file was removed.

**`git status --short`** (nothing staged, nothing committed — git is the human's):

```
 M front/src/app/about/page.tsx
 M front/src/app/layout.tsx
 M front/src/components/partials/Home/Home.config.ts
 M front/src/constant/content/about.ts
```

Branch is `D1`. Note for the record: the tree was **clean** before I started — the board's
line about "TASK-018's file is still unstaged" no longer matches what git reports.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

**If you find a sixth place saying "two weeks"** — or any other occurrence of a conflict
string that this table does not list — **stop and ask here** rather than editing it
silently. SPEC-005 §SQ22 tells Porter the count is five, and that statement has to stay true.

**FQ32 (new 2026-09-09, Fern) — no sixth "two weeks", but there IS an eleventh string, and it
is a C6 one. I did not touch it.**

- **"two weeks" is confirmed at exactly FIVE**, all five in the table, all five now changed.
  Nothing was found outside the table, so **SQ22's count of five stands and stays true.**
- **The extra string is the `/about` hero headline**, visible copy, `<h1>`-scale:
  `src/components/partials/About/About.config.ts:3`
  `title: 'Three years of shipping the thing nobody there had shipped before'`
- C6 has just moved `CAREER_STATS` from `3+` to `4` per Q40 (*"3y+ นั่นคือทั้งหมด ตอนนี้เป็น
  4 ปีแล้ว"*). So the site now says **"4 Years experience"** on `/` and **"Three years of
  shipping…"** on `/about` — the same career-length fact, two different numbers, both in
  visible copy. That contradiction did not exist before this task and exists because the
  tabled edit was applied correctly.
- **Why I stopped instead of fixing it:** the table does not list it; it is copy about a real
  person; and any rewrite is a *wording* choice, not a find-and-replace — "Four years of
  shipping…" is the obvious candidate but it is not his word and I will not put words in his
  mouth. A grep for every other year-count phrasing across `src/` returns this one line and
  nothing else, so this is the whole of it.
- **@Sober: this needs your routing before REQ-005 can be called delivered.** It is not a
  blocker for TASK-019 itself (all ten tabled edits are done and verified), and I have left
  the line exactly as it was.

> **answer (Sober, 2026-09-09): confirmed, correct call, and you were right to stop.**
>
> **a) I re-verified both halves myself, not from your notes.** My own sweep for every
> year-count phrasing across `front/src` returns that one line and nothing else, so SQ22's
> five stands. And the contradiction is real **in the built output**, not only in source:
> `.next/server/app/about.html` ships `<h1 data-order="1">Three years of shipping the thing
> nobody there had shipped before</h1>` while `.next/server/app/index.html` ships
> `4` + `Years experience`. Two numbers for one career length, both on the site a recruiter
> opens, one of them at `<h1>` scale. `Three years` does **not** appear on `/`.
>
> **b) Leaving it untouched was right, and "just make it Four" would have been wrong** —
> not because the wording is hard, but because it is copy in his name about his own life.
> SPEC-005's rule is the same one REQ-003 used: no sentence goes on this man's site until he
> has read the exact words. A find-and-replace by an engineer is exactly what that rule bars.
>
> **c) Routing — no new task, no new hop.** I am not sending this to the owner as its own
> question. It becomes **C9** in SPEC-005 **Group B** (the approval-gated group), so it rides
> into the approval sheet you are already drafting in **TASK-020** and is placed by
> **TASK-021** with everything else he approves. He answers it in the same breath as C5, C8
> and the skill list — one hop, not two. TASK-020 and TASK-021 have been edited accordingly;
> re-read them before you start TASK-020.
>
> **d) One thing you must NOT resolve while drafting.** There are two honest readings of that
> headline: "three years" as his **career total** (then it is simply stale and contradicts the
> new `4`), or as "three years of *this particular pattern*" (then it may be a different fact
> the resume never states). **Do not pick.** Put both readings and both candidate wordings in
> the sheet and let him choose — see TASK-020 §(d) C9 for exactly what to write.
>
> **e) Reverting C6 back to `3+` is not on the table.** It is his own recorded decision
> (Q40, *"ตอนนี้เป็น 4 ปีแล้ว"*), so the `4` is the fixed point and the headline is the
> string that moves. Do not offer "keep three years, revert the stat" as an option.
>
> **f) It does not block you.** TASK-019 is `DONE` and TASK-020 is startable now.
> Raised to Porter as **SQ27**.

## Review

**Verdict: `DONE`. Sober, 2026-09-09.** Every check below I ran myself against the working
tree — none of it is quoted from §Implementation Notes.

**1. The diff is exactly the ten tabled edits and nothing else.** `git diff` read line by
line: 4 files, **10 insertions / 10 deletions**, one hunk per tabled row, C1.1–C1.5, C2,
C3.1, C3.2, C4, C6 all present with the exact target strings. No adjacent tidy, no
reformatting, no other key touched. `src/constant/site.ts` is **not** in the diff (C5 is
correctly out of scope) and `git status --short` lists those four files and nothing else.

**2. The three "look like mistakes and are not" were respected.** C3 landed as
`ICM Smart Solution Co., Ltd.` — site title case kept, resume all-caps not copied. C4 moved
`EXPERIENCE.icm.role` only. `SITE.location` untouched; `grep -rni chatuchak src/` = **zero**.

**3. DoD greps, re-run by me:** `two weeks` → 0, `Smart Solutions` → 0, `'3+'` → 0, and a
bare `3+` → 0.

**4. Typecheck and build, re-run by me:** `npx tsc --noEmit` exit **0**, no output.
`npm run build` exit **0**; grepping the full log for `error|warn|failed` returns **nothing**.
Route table identical to the figures in the notes (`/` 2.74 kB / 283 kB, `/about` 2.65 kB /
279 kB, shared 102 kB) — expected, only string literals moved.

**5. The gap Fern reported honestly is now closed at the markup level.** He could not
photograph the `4`. I read the **built** static HTML instead of the dev DOM, which is the
surface that ships: `.next/server/app/index.html` contains
`<dd class="HomeStats_value__divMR site-numeric">4</dd><dt class="HomeStats_label__Xt7Ta">Years experience</dt>`.
Also confirmed in the built output: `about three weeks` appears **twice in each** of
`index.html` and `about.html` (copy + `<meta description>`), `Smart Solutions` (plural) = 0
hits, `ICM Smart Solution ` = 1, `AI &amp; Robotics Developer` and `Senior / Staff Software
Engineer` both present on `/about`. **This is shipped bytes, not pixels** — the pixel
confirmation is still QA's picture round, and Fern was right to say so rather than claim it.

**6. Line endings — his self-correction is correct and I verified the restore by bytes.**
`node` CR/LF count on all four changed files and two untouched siblings: CR == LF == CRLF on
every one (`about/page.tsx` 12, `layout.tsx` 65, `Home.config.ts` 15, `about.ts` 207,
`site.ts` 29, `About.config.ts` 32). The working copy is uniformly CRLF, the four changed
files match the sibling convention exactly, and `git diff` prints **no** `LF will be replaced
by CRLF` warning. Logging the false alarm against himself was the right call and the
takeaway (count CR bytes with `node`, not `grep -c $'\r'`) is worth keeping.

**7. SQ22 survives.** My own sweep — not Fern's — over `front/src` for every year-count
phrasing (`(one|two|…|ten|[0-9]+) +? years?`, plus `yrs`, `decade`, `since 20`) returns
**exactly one** line, and it is the one he reported. So `two weeks` really was five
occurrences, all five tabled, all five now changed, and **SQ22's count of five stays true**.

**Not held against this task:** FQ32 is answered below and routed as a new **C9** into
Group B. It is a consequence of applying C6 correctly, not a defect in this task.
