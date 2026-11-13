# REQ-5011: the "Get Requirement web" (GR web), a clickable mock of the whole back office for the 17-Nov feedback round

**Status:** READY_FOR_SA · **Priority:** HIGHEST (all hands) · **Owner-approved:** 2026-11-10 (SYSTEM-FACTS § "Get Requirement web") · **Written by:** Porter (PM)

## Problem
The customer (ขวัญ, พี่ฟีน) keeps asking for things to be "clearer" on the final UI we sent as a ZIP on 10-21, and time has run out. The owner set a deadline: **all feedback by 17 Nov**, then a URS they sign, then the scope freezes. They need **one URL** where they can click the WHOLE intended back office, including parts not built yet, and give feedback fast. We update it and redeploy.

## What to build
- Start from the existing prototype `SOM-BALANCE-Backoffice-spec/final-ui` (Vite + React + Mantine, mock data). **Mock only**: no real API, no real DB, no real names of children, no LINE, no mail.
- **Bring it up to what we actually built and decided.** The list of out-of-date pages is in `CHECK-2026-11-10-final-ui-refresh.md` § A (about 25 of 36 pages). Apply the English back office (D2) and the approved words.
- **Add mock pages for what is asked but not built**, so they can react to it. That means the 7 REQ-5010 extras (TROLLEY-CARDS-PENDING.md), each marked visibly as **"Proposed: to confirm"**.
- **A visible version stamp + a "what changed" note** on the home page, so each redeploy tells them what to look at again.
- **Feedback path:** a simple per-page "send feedback" hint is optional. Default: they reply in LINE, naming the page.

## Order (each batch deploys as soon as it's green)
1. **Salary** (pay run, slip, lock, people/rates, entries, my slip, reports), with the most feedback. Target: first URL **12 Nov**.
2. **The 7 proposed extras** as "Proposed" pages.
3. **Revenue, Stock, the 2.1 reports, Users/login.**

## Hosting
- One static URL on the owner's deploy platform (Otto: the Vite build is static).
- The access gate is the owner's call. Default: Cloudflare Access with the customer's emails, which come from the owner.
- Each redeploy is noted in the log, along with its version stamp.

## Out of scope
The real apps (paused until 14 Nov) · the front office (its intake is separate) · any real data · uat.

## Acceptance
- One URL, reachable by the owner first. Every page in the menu opens with mock data and with no console error.
- The English labels match the real app's approved words.
- The proposed pages are clearly labelled "Proposed".
- Tanya clicks through every page as CEO / admin / coach (the prototype's role switcher) before each URL goes to the customer.
