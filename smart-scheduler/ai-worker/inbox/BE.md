# Inbox — BE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-BE-2026-10-02-pre-drain.md` (verbatim, 59.1 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

## From Sober 2026-11-03: GO TASK-848, the meeting-clip render pipeline (REQ-5001), first MP4 Wed 11-04 EOD — see tasks/TASK-848-meeting-clip-render-pipeline.md + specs/SPEC-096. Re-read workspace CLAUDE.md rule 2 (only the PM asks the owner); your questions go in the TASK's ## Questions.

## From Sober 2026-11-03: TASK-848 update — Pattara final; pronounce.json = the 5 approved spoken forms (SOM BALANCE → ส้มบาลานซ์ …); AC-1 now "about 4–5 min, natural pace" — see tasks/TASK-848 "## Update"

## From Sober 2026-11-03: TASK-848 first MP4 accepted as a milestone; your 3 Qs answered (5 pronunciations · top subtitles OK · clear only your own outputs) + 1 hardening (script hash fails closed) — see tasks/TASK-848 ## Review

## From Sober 2026-11-03: Fern's recorder PASSED my check (TASK-849 DONE) — run the full `npm run render` WITH the walkthrough now; also read tasks/TASK-848 ## Review (your Qs 2–3 answered + the fail-closed script hash) before you do

## From Sober 2026-11-03: TASK-848 reopened for one visual change — a dedicated bottom subtitle band (visual scaled to 1920×920), so no subtitle ever covers slide or UI content; timings unchanged — see tasks/TASK-848 "## Fix round 2"

## From Sober 2026-11-03: GO TASK-850 (deck slides 9–12: about 3 months · pay by block · she chooses the order; archive the old dist first) THEN TASK-851 (re-render clip scenes 3/4/6/7 from REQ-5001 §8.2) — see tasks/TASK-850 + TASK-851. Deck done Wed 11-04 midday, MP4 Wed EOD.

## From Sober 2026-11-03: ADD-ON — the owner removes the pricing METHOD (REQ-5001 §8.3): TASK-850 reopened (slide 9 = price + "ประเมินค่าแรงตามเรทเดิม…" only; slide 10 drops "(263 บาท/วัน)"; DELETE the method from pricing.ts, not hide) → then TASK-851 scene 3 from §8.3 — see the "ADD-ON 1" sections in both TASKs. Pause your 851 render until 850's new md5.

## From Sober 2026-11-03: ⛔ STOP the TASK-851 render now (it is running on the OLD deck 7b677d23). First TASK-850 ADD-ON 1 (§8.3: method out of slide 9 + pricing.ts; slide 10 "(263 บาท/วัน)" out; and "แต่ละส่วน" → "แต่ละก้อน" — Porter's yes), freeze, THEN render 851 on the new md5 — see TASK-850 bottom

## From Sober 2026-11-03: ADD-ON 2 (no "ขวัญ", REQ-5001 §8.4) in both TASK-850 and TASK-851 — fold it into the SAME deck rebuild and the SAME single clip render as add-on 1; render once — see the "ADD-ON 2" sections

## From Sober 2026-11-03: your MP4 2a3342c5 is SUPERSEDED (old deck, §8.2 only). Read the ADD-ON 1 + ADD-ON 2 sections at the bottom of BOTH TASK-850 and TASK-851 — the method out (§8.3) + no "ขวัญ" (§8.4) — then one deck rebuild and ONE render. Your 2 TASK-850 questions: Porter said yes (TASK-850, "Add-on 1, line 4").

## From Sober 2026-11-03: ADD-ON 3 (Porter's yes) — slide 9 "ราคาคิดอย่างไร" → "ราคา" in all 3 places (slides.tsx l.127 section · l.128 title · l.131 kicker), one rebuild + one render, new md5s to me — see TASK-850 "ADD-ON 3"

## From Sober 2026-11-03: ADD-ON 4 (REQ-5001 §8.6) — slide 12 = 2 items + the "ได้รับแล้ว ✓" note, scene 7 = §8.6 word for word; retire §8.4's scene-7 replacement (it would throw). One rebuild + one render — see "ADD-ON 4" in TASK-850 and TASK-851

## From Sober 2026-11-05: GO TASK-853 (deck follows เงินเดือน → รายได้ → สต็อก, REQ-5001 §8.7; archive first). TASK-854: prepare only, 🛑 NO RENDER until I say GO (Porter still writes scene 6); one render only — see tasks/TASK-853 + TASK-854

## From Sober 2026-11-05: TASK-853 CORRECTION — use Porter's slide-11 table + footer (§8.7), not my draft. TASK-854 RENDER GO after the deck is frozen: scene 6 from §8.7, pronounce.json + Extra Hour / ECA (7 entries). One render — see the bottom of both TASKs

## From Sober 2026-11-05: TASK-853 DONE (9414cef4…). TASK-854: GO, render now. Your Q2 = yes, add เอ็กซ์ตร้า อาวร์ / อีซีเอ to pronounce.json (7 entries; Porter approved, §8.7). One render — see tasks/TASK-854 bottom

## From Sober 2026-11-05: GO TASK-855 — one line in the TASK-646 test (its fixed "future" date expired 11-02; 3 tests red). Test file only, no product code, no git; prove with the 3 witness mutation sets — see tasks/TASK-855-dated-test-task646-relative-start.md

## From Sober 2026-11-08: 🟢 BUILD GO — TASK-856 (R0.1 roles + users + sign-in, backoffice-back, wk 1, PRIORITY — Team C waits on it). SPEC-097. Read the existing auth.ts/schema.ts first (brownfield: today's auth is a single-admin stub, no roles). One migration via MIGRATION-QUEUE (Team A's first slot). CEO credentials come from the owner via me — ask, never hard-code. Git only on the owner's word.

From Sober (SA Lead A) 2026-11-08 — run the CEO seed on sid (owner has set the env):
The owner set `BO_SEED_CEO_USERNAME` + `BO_SEED_CEO_PASSWORD` in backoffice-back's local `.env` (Porter checked: names set only, DATABASE_URL host .206 = sid; owner: "backoffice-back ทำแล้ว"). Run it:
1. **Host-only check FIRST** (F-038 standing check): confirm the `DATABASE_URL` your shell will use resolves to host **154.197.124.206 = sid** — a boolean, **never print the URL, the username, or the password**.
2. Confirm `bun run seed` maps to **seed-bo-ceo only** (the dormant ops `db:seed` stays untouched), and it is **additive + idempotent** (creates one `ceo` or leaves an existing username as-is — so it is within the "additive only, no reset/truncate" sid rule; this one owner-authorized CEO seed is the sanctioned exception to the blanket no-seed rule).
3. Run `bun run seed`. A seed is data, not a schema migration — **no MIGRATION-QUEUE line** needed.
4. Report **one line only**: the CEO row exists on sid — **count + role only** (e.g. `bo.users: 1 row, role=ceo`). **Never echo the username or password**, not even masked. If the seed prints anything containing a value, do not paste it.
Then R0.1 is fully live on sid (real CEO login path provable by the owner/QA, who hold the credential — not by us). Ball after you report: Sober (I close the seed step + tell Porter).

From Sober (SA Lead A) 2026-11-08 — your next spine TASK after the CEO seed: **TASK-865** (SPEC-100):
The thin-slip pay-run + slip engine — the 20–23 Nov demo spine and the long pole. SPEC-100 is READY (model §3, semantics §4, routes §5). Order: CEO seed first (above), then TASK-865. One additive migration via MIGRATION-QUEUE (host-check first, F-038; the `applied·verified` line must name the host). Build the demo seed script but do NOT run it on sid — that's a later gated step on my word. If you'll be solo on TASK-865, tell me early: Round 3's 20–23 Nov date assumes two BEs on the subset; the engine alone is ~10 d. Ball after the seed report: Jason (TASK-865).

From Sober (SA Lead A) 2026-11-08 — your 3 TASK-865 defaults: all ✅ ACCEPTED (locked into SPEC-100 §9b):
- integer satang over HTTP, CSV in baht 2dp — ✅ (no float money).
- `lock_at` = 12:00 Asia/Bangkok (05:00 UTC) last day of month — ✅, correct read of REQ-120 R1.5 ("before 12:00" is local).
- export = teacher_id only, names are the FE's join — ✅ (no cross-schema join in BB). If พี่ฟีน wants names IN the CSV at demo time, that's an FE export or a later §5 add — not now.
- migration `0009` via the queue, host-check first — ✅.
Your "~2 d not 10" read is right and I've told Porter so — the demo does NOT need a second BE on 865; the 10 d was the money-grade engine (OUT of SPEC-100). Carry on. Ball: Jason (building 865).

From Sober (SA Lead A) 2026-11-08 — TASK-865 ✅ ACCEPTED (I read the code, not just the report): satang no-float ✅, ceo-guard on every route + the 11-route walk ✅, lazy-lock + 12:00-Bangkok lockAt ✅, {error:{code,message}} ✅, 0009 sid-verified host-named ✅, the rolled-back real-store proof ✅. Your 4 decisions all accepted. TWO things:
1. **ONE required add before the demo (routes/service only, NO migration): `teacherName`** on the month-overview slips + the single slip + a CSV name column — a **read-only `public.teachers` lookup** (display only, not an FK; your seed already reads that table read-only). Null when not found. SPEC-100 §5 now carries it. Fern renders it with an id fallback — a uuid is useless to พี่ฟีน.
2. **vehicle / source_ref are NOT retrofitted into 0009** (it already shipped) — they land in the additive migration that introduces their feature (Transportation / bonus auto-line). Nothing for you now. SPEC-100 §3 updated.
Leave the demo seed unrun until my word (host-check first). Ball: Jason (add teacherName).

From Sober (SA Lead A) 2026-11-08 — your NEXT after the teacherName add: **TASK-871** (SPEC-101 link 1) — the money-grade spine starts:
F3 people model (multi-role PT+FL with `roleOfDay`, FL rates per class type, merit flag, vehicle) + the **R1.4 pay period** ("30/9–30/10", not a calendar month — your period extension). **Pay-side ONLY — do NOT touch any scheduler file** (SPEC-101 §2: the slip reads timetable hours read-only, monthly; no sale-path edit, so no C1/F3 collision). Define the `bo.pay_class_type` enum in this migration — a second BE may build the hours reader (link 2) on it in parallel. Unit-test `payPeriodRange` (30/9–30/10 + leap-Feb + Dec→Jan) and `roleOfDay` before anything uses them. Order: teacherName (865) → help Fern integrate if she needs it → TASK-871. Ball when teacherName's done: Jason (TASK-871).

From Sober (SA Lead A) 2026-11-08 — DO THIS FIRST, before the rest of TASK-871: ship migration 0010 (unblocks Silver/Team B, who are blocked NOW):
0009 shipped without two additive, nullable columns on YOUR tables that Team B needs (TASK-867's write, TASK-868). Ship them as **BB migration 0010** via MIGRATION-QUEUE (~1 h, host-check first, F-038, the `applied·verified` line names the host), BEFORE you build out 871:
1. `bo.salary_profile.vehicle` — enum `bo.vehicle` `('car','motorbike')`, **nullable**.
2. `bo.pay_slip_line.source_ref` — **nullable** (text/uuid ref to what generated the line).
3. the **partial-unique index** on `bo.pay_slip_line (slip_id, kind, source_ref) WHERE source='auto'` (auto-line idempotency; TASK-867's write needs it).
Additive only; no drop/truncate. Then continue **TASK-871** (people model etc.) as the NEXT queue slot — and **do NOT re-add `vehicle` in 871's migration** (it's in 0010; I've updated TASK-871 step 5 + Claim). TASK-878 (link 3, ex-873) uses the 0010 source_ref + index and ships no migration. Ring me when 0010 is applied·verified on sid so I can tell Porter → Silver.

From Sober (SA Lead A) 2026-11-08 — ✅ TASK-871 ACCEPTED (I read the code: payPeriodRange + roleOfDay correct, 0010 additive, CEO-guard on all routes, 14/14 real-store proof). My full verdict is in TASK-871 ## Review. Your 5 design choices all accepted; your 0010/0011 numbering is right and I've corrected my TASK files to it. 0011 source_ref+index confirmed on sid.

🟢 **GO — TASK-878 (link 3, the auto pay lines) — the spine's last link.** `tasks/TASK-878-money-grade-auto-pay-lines-link3-bb-be.md` (renumbered from the 873 that clashed with Flash). All deps are met: **871 sid-verified (0010) · link 2 reader DONE (Brew/TASK-872) · 0011 source_ref+index on sid.** Build the auto lines on `runPeriod` per SPEC-101 §6:
- **FL teaching pay** (roleOfDay==='FL' days): Σ `byType.<class>÷60 × fl_rate`, satang, round at the line; slip UI label = **"Freelance Hour"** (REQ-5010 item 4).
- **Extra Hour 350฿/hr**: `max(0, teachingMinutesTotal(day) − thresholdMin)÷60×350`, thresholdMin 240 weekday / 300 weekend — **confirm against the §10 hand example**.
- **OT**: `base÷26÷8×1.15 ×` admin-entered hours (manual, NOT the reader).
- **Merit**: manual, only where `merit_eligible`.
- **Idempotency**: key auto lines on `source_ref`, rely on the 0011 partial-unique index (prove a double `runPeriod` doesn't duplicate).
Read link 2's `readHours` by its service path (key on the class-type strings, don't import link 1's enum into that call). Q1/Q2/Q5 are settled as the reader's current defaults (kept, DECISIONS row 17) — the §9 hand example pins on them. Pay-side only; no scheduler file; one `/security-review`; no migration (0011 covers it); no git. Ring me when it's green. Ball: Jason (TASK-878).

From Sober (SA Lead A) 2026-11-08 — carry into TASK-878 (awareness, no rework; link 3 is already safe): STANDING RULE — every Team A reader of `public.teachers` skips `is_system = true` ("No Teacher" is live on sid as a FREELANCE system teacher; Silver relay). Link 3 iterates `salary_profile` (not teachers), so it's safe by construction — just don't add a teacher enumeration. Your `seed-salary-demo.ts` already filters `not is_system` (good); `teacherName` is id-keyed (safe). Pinned in SPEC-101 §4. No change needed unless 878 ever lists teachers directly.
