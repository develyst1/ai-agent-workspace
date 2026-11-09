# Skill — Predict, then probe on the clock

**Who needs it:** SA (writes the predictions) · Tester (schedules and runs the probes) · PM (one
clause — §4).
**When:** a reported defect that depends on **time**: "slow in the afternoon", "logged out after a
while", "fails every morning", "only on Mondays". A one-shot test cannot see these. It runs at one
moment, and the symptom lives at another.
**This ADDS a method. It removes nothing.** `reproduce-first.md` still applies. When the situation
is a time of day or an elapsed time, this skill is how you reproduce it.

---

## The one line

**The SA turns each suspect into a dated prediction. The Tester schedules the same read-only probe
for the times that settle it. The numbers decide, not opinions.**

## What it taught us (smart-scheduler, REQ-128 / TEST-117, 2026-10-25)

A customer said: *"slow from about 15:00, and we get logged out now and then."*

- **The Tester took a night baseline:** login, the schedule page, a week change and the calendar
  API, 3 runs each, with the median.
- **She scheduled her own later passes** with the same recipe, so the "afternoon" claim got numbers.
- **She logged in once and kept the session alive.** She read the token's own expiry claim
  (login + exactly 12 h), which turned the SA's code-level suspect into a prediction with a time on
  it: *"if the 12 h token is the cause, the first logout comes at ≈ 14:00."*
- **In parallel,** the SA ranked suspects from code and fixed nothing before the evidence. The owner
  checked the server and found dev tools running on the customer's machine (CPU 30 % → 3 % once
  closed).

**Two things went wrong, and they are in the rules below:**
1. **A scheduled run fired late** (10:03 planned, 13:44 actual). It was reported under its real
   time. Labelling it "10:00" would have faked a data point.
2. **The watcher logged a "logout" at 09:33 that was really the owner's machine losing its
   internet.** The script read "could not ask" as "no session". A probe must tell **it failed** apart
   from **it observed**.

## §1 — SA: write the predictions before anyone probes

For each suspect, one line in the REQ's `## Questions` or the TEST file:

| Suspect | If this is the cause, we will see… | …at / after |
|---|---|---|
| L1: API token lives 12 h | first 401 / forced logout | login + 12 h (≈ 14:00 for a 02:00 login) |
| L2: afternoon load | median page time > 2× the night baseline | 15:00–17:00 |

- **Every prediction can come out false.** "It might be slow sometimes" is not a prediction.
- **No fix before the predictions are tested,** unless the owner says so. A fix shipped first leaves
  you unable to tell which suspect it was.

## §2 — Tester: baseline, schedule, record

1. **Baseline first,** at a quiet time: the exact recipe (steps, run count, median). Write the
   recipe down; every later pass uses it **unchanged**.
2. **Schedule the passes for the times the predictions name.** Use the app's scheduled-task or
   wake-up tools. **Never keep a session busy sleeping in a loop**: it blocks the desk for hours and
   burns the app's send cap.
3. **Label every pass by the time it actually ran,** not the time it was meant to run.
4. **Separate three outcomes in every check:** `ok` · `symptom` (what the prediction names: a 401,
   a slow page) · `probe-failed` (no network, a timeout before reaching the server, your own script
   error). **Only `symptom` counts as evidence.** A `probe-failed` is reported as a gap.
5. **Long-session watch:** log in once, read the session's own expiry claims (never print a token),
   write the predicted end time *before* it arrives, check every N minutes, and record the first
   real `symptom`.
6. **Report a table and a verdict per prediction:** `CONFIRMED` · `RULED OUT` · `NOT SETTLED (why)`.
   **Nothing about a cause beyond what the numbers show.** Causes are the SA's.

**Guard rails, all of them, every time:**
- **Read-only on the customer's system.** A probe that would write anything is a DATA REQUEST.
- **Normal-use load only:** a handful of runs per pass, never a load test.
- **No password typed on a non-local host** without a written, scoped owner exception in the TEST
  file.

## §3 — Check the box itself

When the symptom is "slow", one pass also records what else runs on the server and the CPU / RAM
before and after. That check is the owner's or Otto's, never the Tester's on the customer's machine.
**The biggest find of REQ-128 came from this, by accident. Make it deliberate.**

## §4 — PM: tell the customer numbers, not hopes

Nothing goes to the customer until a prediction is `CONFIRMED` or `RULED OUT`. A `NOT SETTLED` is
said as exactly that.

## Test before you send

- [ ] Every suspect has a prediction with a time on it, written **before** the probes ran.
- [ ] Every pass uses the baseline recipe unchanged and is labelled with its real run time.
- [ ] Every check separates `ok` / `symptom` / `probe-failed`, and no `probe-failed` is counted as
      a symptom.
- [ ] No session sat busy in a sleep loop; the passes were scheduled.
- [ ] Each prediction has a verdict: `CONFIRMED` / `RULED OUT` / `NOT SETTLED (why)`.
