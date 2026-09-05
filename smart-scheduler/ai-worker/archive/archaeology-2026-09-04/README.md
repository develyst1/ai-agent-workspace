# Archaeology — 2026-09-04 (parked, NOT merged)

A one-time extraction run of **2026-09-04**. All 30 of this project's log files (3.28 MB) were read in
full and their **durable facts** pulled out: what the owner decided, how the running system behaves,
product limits, terminology. One output file per log date, named for that date. Every line carries
**who said it and when**. ~1,819 fact bullets, ~247 contradiction lines, 30 files, 506 KB.

Parked here so it survives a session ending or a machine change — it existed only in a scratchpad.

## What this is NOT

- **Not merged into `SYSTEM-FACTS.md`, and it must not be merged from here.**
  **`ai-worker/SYSTEM-FACTS.md` remains the canonical knowledge file.** This directory is not.
- **Not authoritative and not curated.** It is raw extraction — unreviewed, unranked, unverified,
  with duplicates and overlaps intact.
- Not a status, a verdict, or a build report. Nothing here moves any REQ, TASK or TEST.

## 🔴 The blocker — why the merge is stopped

The merge is blocked on **who คุณฟีน is**. The July logs call คุณฟีน "the stakeholder", which the
extraction largely read as *the owner*. **The owner ruled on 2026-09-04 that คุณฟีน is the CUSTOMER —
a different person from the owner.** The logs argue with that ruling in at least three places, so
**nothing has been re-labelled**.

> **Until this is settled per-entry, treat every `(owner, …)` attribution in these files dated July
> as UNVERIFIED.**

If the ruling holds, much of what these files label "business rules the owner set" is really
**customer requirements**, and belongs in REQ files rather than in `SYSTEM-FACTS.md`.

## ⚠️ Three date tags are approximate

Three log files cover more than one day, so their filenames here are approximate:

| File | Really covers |
|---|---|
| `2026-07-20.md` | ~07-20 → 07-25 — and the entries are **not** in append order |
| `2026-08-04.md` | 08-04 → 08-10 |
| `2026-08-20.md` | 08-20 **or** 08-22 |

## ⚠️ The `CONTRADICTIONS` sections are unresolved ON PURPOSE

No agent resolved any contradiction — that was the instruction. They are recorded so the **owner** can
settle them one at a time. **Do not let anyone "tidy", merge or silently pick a side in them.**

## Where the analysis lives

`MARIE-REPORT-2026-09-04-smart-scheduler-archaeology.md`, at the workspace root.
</content>
</invoke>
