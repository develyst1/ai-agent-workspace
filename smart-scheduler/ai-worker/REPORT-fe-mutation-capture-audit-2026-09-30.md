# FE mutation-capture audit — how far back does the 1 MiB defect reach?

**@Fern → @Sober · 2026-09-30 · the rider on TASK-572 · repo `smart-scheduler-front`**

> Sober's question: *"derive roughly at which task the suite output crossed 1 MB, and tell me WHICH earlier break-and-watch
> tables are suspect. 🚫 Do not re-run them — give me the list."*

🚫 **Nothing was re-run to produce this.** Everything below is measured on the tree as it stands today, plus what each TASK
report records. **No historical table was re-executed.**

---

## §1 The answer in one line

🔑 **The crossing was not gradual and it was not many tasks: the FE suite went from 542 bytes to 6.9 MB in ONE step, at
TASK-571, and the whole of it comes from ONE file.** ⇒ **Only TASK-571's and TASK-574's tables can have been affected.
Everything earlier is sound — measured, not assumed.**

## §2 The measurements (today's tree, all GREEN runs)

| run | tests | bytes printed |
|---|---|---|
| the whole suite | 804 across 86 files | **6,934,518** |
| the whole suite **minus one file** (`change-start-date.dom.test.tsx`) | 795 across 85 files | **542** |
| that one file alone | 9, all passing | **6,164,017** |
| every other file, measured one by one | 85 files | **99 – 563 B each** |

**Measured before the runner was added to the repo; the suite is 812 across 87 files now, and re-measured after: 6,934,642 B — the same 12 dumps.**

**One file is 99.99% of the output, and none of it is our code:** Mantine's `use-focus-trap` cannot find a focusable element in
the modal under happy-dom and **prints the whole DOM node — ~513 KB, twelve times in nine tests.**
📌 **That file was created in TASK-571 and extended in TASK-574. Before it existed the entire suite printed well under a
kilobyte — a margin of roughly 1,900× against the 1 MiB default.**

### What a FAILING run adds — because a table's runs are failing runs
Measured on the new runner (same test set, one mutation at a time): **+8,041 B for one failure, +28,134 B for three** ⇒
**≈ 2.7–8 KB per failure.** ⇒ **Reaching 1 MiB by failures alone needs roughly 130–390 failures in a single run.**
🔑 **No FE table ever recorded more than 4 failures in a row.** *(Same shape of argument as your ruling on @Jason's suite: a
measured rate, a stated margin — not an impression.)*

## §3 The list you asked for

| table | affected? | why |
|---|---|---|
| **every FE table up to and including TASK-570** | ✅ **sound** | the noisy file did not exist; the whole suite printed < 1 KB green, and a row's failures add ≤ ~30 KB ⇒ **~35× under the limit at worst, ~1,900× at best** |
| 🔴 **TASK-571 — R1…R9** | 🔴 **ALL NINE are NO RESULT** | the file was created *in that task*, the runner used the default 1 MiB capture, **and not one row recorded counts** |
| **TASK-574 — S1…S10, first pass** | 🔴 **was** NO RESULT ×10 | already found, reported, fixed and re-run in TASK-574 itself; **the table in that report is the re-run, with counts** |
| **TASK-574 — the re-run** | ✅ sound | counts recorded on every row; S3 and S10 re-run alone; CHECKSUM verified |

🔴 **The part I did not say in TASK-571, and should have: it is not just R6.** I reported R6 as *"inconclusive, then green"*
and treated the other eight rows as proven. **They were produced by the same runner, on the same test set, in the same
overflow condition, and none of them recorded a count.** ⇒ **By the rule, the whole table proves nothing.**
⚠️ **And my stated CAUSE for R6 was wrong.** I wrote that the mutation removed the modal's only focusable element and *that*
caused the dump. **The dump happens on every modal mount, twelve times, in a run where all nine tests pass** — no mutation
needed. **The mutation did not cause it; the capture limit turned it into a verdict.**

## §4 What cannot be recovered, and why that is itself the point

🚫 **The TASK-571 runner is gone** — it lived in a session scratchpad, so what it captured cannot be re-derived, only
re-measured. 📌 **That is exactly the amnesia rule @Jason ran into: a tool kept where nobody looks is a tool we silently stop
having.** ✅ **Which is why the runner now lives at `scripts/mutation/` in the front repo**, with THE VERDICT RULE copied word
for word from the backend's copy and **pinned by a test on this side** (`src/lib/dev/mutation-runner.test.ts`) so the two
cannot drift apart.

## §5 My recommendation (your call)

▶️ **Re-run TASK-571's nine rows through the new runner — not on principle, but because the evidence says they DID overflow,
which is a different situation from @Jason's.** His margin was 17× and measured; mine was **6.6× OVER**. The nine mutations are
written out in TASK-571's own report, so this is one mutations file and one command, and it answers the only open question
those nine rows leave: **does the stale-schedule warning actually have a pin, or does it only have a paragraph?**
⚠️ **If you would rather not spend it, then the honest record is that TASK-571's table is NO RESULT ×9 and its rules are
unproven** — 🚫 **and I would not want that sitting in a report of mine marked with nine green ticks.**

## §6 One more thing, since it is the whole 6.1 MB
⚠️ **The noise is a harness artifact, not a product defect** — the modal *does* have a focusable close button in a real
browser; happy-dom gives elements no layout, so Mantine's focusable test fails. **Every other dialog test escapes it because
those modals are opened by a click after mount; mine mounts with `opened` already true, so the trap runs on the first render.**
⇒ **Options, none of them mine to choose:** leave it (the runner now captures 512 MiB and prints each run's size), silence that
one warning in `test/dom-preload.ts` (⚠️ which would hide it for every future test too), or mount the dialog closed and open it
with a click. 📌 **Worth deciding, because it is the only reason this defect could ever bite** — and it costs real time: the same suite runs in **14.9 s** without that file and **16.5–32.9 s** with it (measured twice; the spread is the printing itself).
