# CHECK 2026-11-10: refresh the final-UI prototype and host it at one URL (step 0, no build)
Sector (SA, Team C), for Porter. Goal (SYSTEM-FACTS § Scope freeze): the customer clicks one URL by **≈ 11 Nov**, sees what we actually built and decided, gives all feedback by **17 Nov**, and signs the URS.
Read, 2026-11-10:
- the prototype `SOM-BALANCE-Backoffice-spec/final-ui` (Vite + React + Mantine; 36 pages under `src/pages/{a,b}`; Team B's pages dated **2026-10-27**);
- the real BF routes (`src/app/(admin)/**`, 37 pages) + `src/lib/roles/pages.ts`;
- the board's done FE TASKs (857 … 933);
- BB seeds (`src/db/seed-demo-stock.ts`, `seed-salary-demo.ts`, `seed-bo-ceo.ts`).

## Recommendation: don't re-draw the prototype. Host the REAL apps on a DEMO database.
The prototype is a hand-drawn copy. Since 10-27, about **30 FE TASKs** have changed the real screens (list below). Re-drawing it means chasing them a second time, and it drifts again with every TASK until 17 Nov. If we host **the real BF + BB build** against a **separate demo database full of mock data**:
- what they click **is** what we built (English, real flows: pay run / slip / lock, logins, the stock import diff, Demo, reports…);
- every fix we ship shows up there with the next demo redeploy, so there's no second copy;
- the URS can point at real screens.

| | **B (recommended): real apps on a demo DB** | A: re-draw the Vite prototype |
|---|---|---|
| Matches the build | exactly (it *is* the build) | only on the day it's finished |
| Work | **≈ 3–3.5 d**, about 2 days elapsed with 2 people | **≈ 7–9 d**, about 3–4 days elapsed with 3 people |
| Who | Brew (demo seed, BE) + Bob (SB demo seed) + Otto (host) + me (review) | Flash + Fanta + Fern (FE), me |
| Ready by 11 Nov | yes, if started 10 Nov | tight to impossible |
| Risk | the demo must never reach real systems (see guards) | drift; double work |

## B: what it takes
1. **Demo database** on the owner's Postgres server: a NEW database, e.g. `smart_scheduler_demo`. Never sid, never uat, never a local Postgres (CLAUDE.md rule 4).
   - Run SB's migrations, then BB's, the normal way (`db:migrate`).
   - **The owner creates the database and gives the URL** (env values come from him).
2. **Mock data, about 1.5 d.**
   - **Brew (BB, ≈ 1 d):** extend the existing seeds (`seed-demo-stock`, `seed-salary-demo`, `seed-bo-ceo`) into one `seed-demo-all.ts`:
     - staff (FT/PT/FL) with rates;
     - a pay period with a run, slips, one locked and one confirmed;
     - transport trips;
     - revenue lines for 3 months (course, voucher, ECA, refund, manual);
     - categories as her list;
     - products, stock in/out, a Demo matrix, low-stock items;
     - notifications.
   - **Bob (SB, ≈ 0.5 d):** students, parents, courses (Private/Duo, Bravo/Other, one pending), vouchers, trials, camps (one confirmed) and bookings, so REPORT · COURSE · STUDENT, Refund and Confirm camp have data.
   - Rules for both:
     - Thai mock names, **no real child's name**;
     - totals that add up;
     - idempotent (safe to re-run);
     - **refuses to run unless the host and database are the demo one** (a hard check on the URL, as our scripts check `.206`).
3. **Hosting, Otto, ≈ 0.5–1 d.** Two apps on the owner's Linux deploy platform (`platform-deploy-app`): `bo-demo` (BF) + `bo-demo-api` (BB), plus SB if Refund and the front-office pages should work.
   - **The gate:** Cloudflare Access (an email allow-list: Khwan, พี่ฟีน, พี่กุ้ง), which the platform already supports for "apps with no login". The app's own login stays, with demo accounts (CEO / admin / coach) whose passwords the owner hands over.
   - **Otto's choice:** one gate or both. My default is both.
4. **Hard guards, in the demo env (owner's values):**
   - **no LINE token** (sends fail closed);
   - `SCHEDULER_API_URL` points only at the demo SB, never sid/uat;
   - no real mail;
   - `SKIP_ADMIN_AUTH=false`.

   Before the URL goes out, I check that each one is there.
5. **The front office (F1 Branch, F2 Payment card, D3 Confirm camp, conversion, park rent): optional.** Deploying the demo SF too costs about +0.5 d (Otto) on the same demo DB. My default: **yes**, because the URS covers both sides. The owner decides.
6. **Gaps to say out loud in the URS mail:**
   - screens not built yet show their current state (e.g. labels marked PENDING (Khwan));
   - the omakase rule still applies, so the owner chooses what the mail calls "built" vs "to confirm".

**Size B:**
- Brew 1 d + Bob 0.5 d;
- Otto 0.5–1 d (+0.5 for SF);
- me 0.5 d (reviewing seeds and guards, a click-through checklist);
- Tanya 0.5 d (a click-through of every page as CEO / admin / coach on the demo).

**Total ≈ 3–3.5 person-days, about 2 days elapsed.** Started 10 Nov, the URL is ready **11 Nov evening**.
**Owner decisions B needs:**
1. the demo database (his server; he creates it and gives the URL);
2. Otto to host it;
3. who's on the Access allow-list;
4. include the front office (default yes).

## A (only if the owner wants the clickable prototype, not the real app): what's out of date
Prototype pages are from 10-21 / 10-27. The real screens have since changed (each line names the TASKs):
- **Shell / roles:**
  - real sign-in, 3 roles, admin-blind money (857);
  - English labels (933 / R0.5);
  - User Setting + People login dialogs: create / reset / deactivate (931).
- **Salary:**
  - pay period R1.4 + pay run with auto lines (FL pay, Extra Hour, OT, Merit), re-run display + missing-rate warnings (866 / 878 / 881);
  - bonus 50/100 lines (867);
  - transport trips (868 / 895);
  - FL rate per class type (899);
  - coach "Confirm this slip" + CEO remind list (887 / 902);
  - Daily Training Report (885);
  - Salary Report R1.8, 2 tabs + Excel (922 / 923);
  - Payment Detail Excel/PDF export (879).
- **Revenue:**
  - REQ-5010 wording ("Summary", "Add", "Course Fee", "Not confirmed yet", "Cancelled", "Save") (873);
  - ECA Payment + history (891);
  - Refund with the confirm step and the session box (894).
- **Reports:** the real REPORT · COURSE · STUDENT pages + Excel export (925). The prototype has only placeholders.
- **Stock:**
  - Product list + category filter (907);
  - Stock IN (912);
  - Stock OUT cart with per-item discount / commission (905 / 910);
  - Import git-style diff → confirm (908);
  - Low Stock thresholds per type (913);
  - Stock Report Movement / Sales History / Balance (906 / 929);
  - Demo matrix (918).
- **Notifications:** the recipient list + web feed (914).
- **Front office (pages/a/frontoffice):** Branch select (898), Payment card + installments (876), Confirm camp (901), "No Teacher" (861), voucher counting (870).

**Size A:** about 25 of the 36 pages need real changes, at ≈ 0.25–0.5 d each, plus mock data and a hosting step: **≈ 7–9 FE days**, with the same hosting work as B (static site + Access gate, ≈ 0.5 d Otto).

## Who is free (Porter's list) and the plan for B
- **Brew:** demo seed (BB). TASK-935 waits for the bundle commit anyway.
- **Bob:** SB demo seed (via Silver).
- **Otto:** hosting (the owner reaches him directly).
- **Flash / Fanta:** not needed for B. Flash could write Tanya's click-through checklist with me.
- **Me:** cut the 2 seed TASKs the moment the owner says B, and review the guards before the URL goes out.
