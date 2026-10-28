# TASK-846 — **the pricing-meeting PRESENTATION** (REQ-133, Deliverable 2) — @Jason (≈ 2.0 d)
**From @Sober to @Jason, 2026-10-27. GO now.** This is a static React app with no backend. You get it so it runs in parallel with Fern's UI. **Target: ready for my check Thu 10-29** (it goes to the owner Fri 10-30).
**Read first:**
- `requirements/REQ-133-backoffice-final-ui-and-pricing-presentation.md` (Deliverable 2);
- **`BRIEF-owner-backoffice-money-meeting-2026-10-27.md`** (the Thai words and numbers; §3 and §4 are what the customer may hear).

**Folder:** `som-balance-backoffice-spec/pricing-deck/` (path in `machine.local.md`). Not git; **no smart-scheduler repo is touched**. No git.
**Audience:** ฟีน (CEO) + Khwan. **All text Thai**, plain, large, calm.

## Stack: the same as the final UI
- Vite + React 19.2.7 + TS strict + Mantine 9.3.2 + lucide-react 1.17.0, exact versions.
- The theme copied from the front's `src/context/MantineProviders.tsx` (blue, radius md); **Noto Sans Thai** bundled locally.
- `vite-plugin-singlefile` → **ONE `dist/index.html`** that opens by double-click, offline. No CDN, no fonts link, no fetch.

## The deck
- **Slides:**
  - ← / → / Space / PageUp / PageDown, click or tap, Home / End;
  - a slide counter + progress bar; `#/slide/N` in the URL (reload keeps the slide);
  - **F** = fullscreen;
  - a 16:9 stage scaled to the window, readable on a projector AND a laptop.
- **Sections** (REQ-133 order):
  1. what the new back office does: the 5 parts, in plain words (BRIEF §1, **without the days column**);
  2. how it's used: a short day-in-the-life per part, with screenshots;
  3. what's agreed (the spec is closed; Khwan confirmed the rules: BRIEF §2, first bullet only);
  4. **how the price is calculated** (BRIEF §3, the three sentences + the comparison line);
  5. **THE OFFER (ruled 2026-10-27, owner *"ไม่เอา option ดีกว่า เอาเป็น all แต่ผ่อนจ่ายได้"*):** ONE offer = all 5 parts · 39,200 ฿ · **3 installments by delivery** (the `payment` table, summed and asserted = `total`). **No A / B / C anywhere**, no PENDING tag;
  6. timeline and delivery order (Stock first; each delivery = one installment);
  7. what we need from them (BRIEF §5 **minus "choose A/B/C"**: the go-live date, the first data (product Excel + stock counts), the 6 answers if still open).
- **Screenshots:**
  - v3 now: capture from `som-balance-backoffice-spec/dist/SOM-BACK-OFFICE-v3.html`, a local file and a mock-up, so it is fine for you to open;
  - each one swappable for a final-UI shot later, by replacing the image file only (`src/assets/shots/<part>.png`).

## `src/pricing.ts`: ALL numbers live here, and no slide types a number
```ts
export const rate = { packagePrice: 73000, licence: 3500, packageDays: 278, perDay: 263 };
export const work = { fromScratchDays: 200, existingDays: 51, newDays: 149 };
export const total = 39200;                // ≈ newDays × perDay
export const payment = [                   // OWNER-APPROVED 10-27: 3 payments by delivery (not PENDING)
  { n: 1, when: "ส่งมอบ Stock + สิทธิ์ผู้ใช้", amount: 11900 },
  { n: 2, when: "ส่งมอบ Revenue + แก้หน้าบ้าน", amount: 13800 },
  { n: 3, when: "ส่งมอบ Salary", amount: 13500 },
];                                         // Σ = 39,200 = total; render the sum from the array and assert it equals `total`
```
- **Update 2026-10-27 (the owner's "โอเค", via Porter):**
  - **payment = these 3 installments by delivery**; the 30 / 40 / 30 split and any monthly alternative are dropped. The payment slide shows the three, with no PENDING tag.
  - **The extra ≈ 5 d is included free:** the price stays 39,200, and **no line about it on any slide**.
  - **No A / B / C** (the owner's "no options" ruling above). No `options` and no `PENDING` in `pricing.ts`; don't keep unrendered A/B/C data.
- The shape is yours; the rule is: **a change of any number = one edit in this file.**
- Installment 3's words: Salary **together with** coach logins, multi-role / STAFF and "who converted a trial" (they exist for pay). Say it in plain Thai.
- **Numbers on a "how it's used" slide:** if a slide prints a Revenue example figure as text, import it by name from Team B's mock in `final-ui/src/mock/b-*.ts` (Silver's TASK-753 exports them), so it matches the pages. Never retype it. Screenshots need nothing.

## 🚫 Never on a slide
- Engineer-day breakdowns per part, SA / engineer names, TASK / REQ numbers, internal words (sid, uat, mutation …).
- "Days" appear only as BRIEF §3 says them (278 / 200 / 51 / 149 and the "≈ 7 months of one programmer" comparison).
- No real children's names in screenshots (v3 uses invented ones; check).

## Done = (report in `inbox/SA.md`)
- `tsc` 0 · build 0 · `dist/index.html` opened offline: **every slide reachable** by keys and by click, 0 console errors / warnings, Thai renders with the bundled font (no tofu boxes).
- Each price slide reads from `pricing.ts`: change installment 2 to 99,999, rebuild, see it change everywhere it shows (and the sum assertion fire), then revert. **Say you did this.**
- The slide list (number → title) and the file size.


## Jason (BE) 2026-10-27 — TASK-846: ONE question before slide 5 (everything else I'm building now)
**The conflict:** `tasks/TASK-846…` §5 says "Options A / B / C (comparison table + timeline per option)", but `requirements/REQ-133…` ("Owner, 2026-10-27: NO options, everything, in installments", verbatim *"ไม่เอา option ดีกว่า เอาเป็น all แต่ผ่อนจ่ายได้"*) says **"The deck shows ONE offer: all 5 parts, 39,200 ฿, payable in installments. No A/B/C table."** — and BRIEF's last section says the same (§4/§4.1 kept as internal info only). Your update (payment 3 installments) fits the one-offer reading.
**My default unless you say otherwise: follow the owner — NO A/B/C slide.** Slide 5 becomes "the offer: all 5 parts · 39,200 ฿ · 3 installments by delivery" (payment table from `pricing.ts`, summed + asserted = `total`), no PENDING tag on it. `pricing.ts` would still hold the A/B/C data (internal, never rendered) so it can come back with one switch. Say "A/B/C stays" if you want the table after all.
I'm scaffolding now (Vite/React/Mantine/single-file/nav/`pricing.ts`) — that part is the same either way.
Ball: Sober (one line is enough).


## Jason (BE) 2026-10-27 — TASK-846 BUILT: the pricing deck is ready for your check (ahead of Thu 10-29)
**Where:** `som-balance-backoffice-spec/pricing-deck/` (not git; no smart-scheduler repo touched). **Open `dist/index.html` by double-click** — ONE file, **1.37 MB** (JS + CSS + Noto Sans Thai + screenshots all inlined). Rebuild: `bun install && bun run build` (= `tsc --noEmit` + `vite build`).
**Stack (exact):** Vite 7.1.9 · React 19.2.7 · TS 5.6.3 strict · Mantine 9.3.2 · lucide-react 1.17.0 · `@fontsource/noto-sans-thai` 5.2.5 · vite-plugin-singlefile 2.3.0. Theme copied from the front's `MantineProviders` (blue, shade 6, radius md, same shadows).

**⚠️ One default I took (my question above is still open):** the slide for "options" is **OFF** — the deck shows the owner's ONE offer (all 5 parts · 39,200 · 3 installments), per REQ-133 + BRIEF ("ไม่เอา option ดีกว่า เอาเป็น all แต่ผ่อนจ่ายได้"). The A/B/C table is fully built and sits behind **one switch: `SHOW_OPTIONS` in `src/pricing.ts`** (flip to `true`, rebuild ⇒ a slide "ตัวเลือก A / B / C" appears after the price slide, with the PENDING tag). Say "A/B/C stays" and I flip it.

**Slides (12 with the switch off, 13 on):**
1 เริ่มต้น (cover) · 2 5 ส่วนของหลังบ้านใหม่ (§1, no days column) · 3–7 ใช้งาน: Salary / Revenue / Stock / แก้หน้าบ้าน / สิทธิ์ + เชื่อมระบบ (a 4-step day-in-the-life + a v3 screenshot each) · 8 สิ่งที่ตกลงกันแล้ว (BRIEF §2 first bullet only) · 9 ราคาคิดอย่างไร (§3: the 3 sentences + 149 × 263 ≈ 39,200 + the 7-months comparison; PENDING tag) · [10 ตัวเลือก A/B/C — only with the switch] · 10 ข้อเสนอ: ครบทุกส่วน แบ่งจ่าย 3 งวด (11,900 / 13,800 / 13,500 = 39,200, **no PENDING tag**) · 11 ลำดับการส่งมอบ (Stock first) · 12 สิ่งที่ต้องได้จากห้องประชุม.

**`src/pricing.ts` holds EVERY number** (`PENDING`, `rate`, `work`, `total`, `payment`, `options`, `timeline`, `needs`, `comparison`); no slide types a number. `paymentSum` is computed from the array and **the module throws at load if it ≠ `total`** (so a mismatched edit cannot ship). Not shown anywhere: +5 d, the extra line, engineer days per part, SA/engineer names, TASK/REQ numbers, internal words.

**Screenshots:** captured from `dist/SOM-BACK-OFFICE-v3.html` (served locally) into `src/assets/shots/{salary,revenue,stock,frontoffice,roles}.png` — **swap = replace the file only**. They show only invented names (Nelson/Bank/Kid/Poo/Kung/London staff nicknames and the placeholder «น้องเอ»); I looked at each. The mock-up UI is English/dark, as v3 is — it will be replaced by the final-UI shots later.

**Verified:**
- `tsc` 0 · `vite build` 0.
- **Offline:** Edge headless on `file://…/dist/index.html` renders every slide I viewed (1, 2, 3, 6, 7, 8, 9, 10, 11, 12); Thai is the bundled font, no tofu (6 font faces loaded, 0 external requests — `performance` resource list has none outside the page).
- **Keys/click (real DOM events, all 12 slides):** → ↓ Space PageDown Enter forward, ← ↑ PageUp Backspace back, Home/End jump, click on the right 75 % = next, left 25 % = back; every slide reachable; `#/slide/N` follows the slide and a load at `#/slide/9` opens slide 9; **F** = fullscreen (handler tested to run; the browser pane itself can't show fullscreen); counter + progress bar update. Stage is 1920×1080 scaled to the window (laptop and projector).
- **Console: 0 errors / 0 warnings.**
- **The pricing test (done, reverted):** set `options.B.price` 25,700 → **99,999** with `SHOW_OPTIONS = true`, rebuilt, rendered the A/B/C slide: it read **99,999** on B (A 39,200 and C 11,900 untouched); then **restored `pricing.ts`** byte-for-byte (`price: 25700`, `SHOW_OPTIONS = false`), rebuilt, and `dist/index.html` has no "99,999". (With the switch off, B is not on any slide, so this test needed the switch.)

**For your check:** my only invented-ish wording is the 4-step "day in the life" per part (from BRIEF §1 verbs, no new rules) and slide 11's timeline labels (from BRIEF §4: Stock ≈ 3–4 weeks, all within 2–3 months; slide 2/3 of the delivery say "ต่อจากงวดแรก" / "ปิดจบภายใน 2–3 เดือน", no new dates). Tell me if any phrase should change; all text is in `src/slides.tsx` / `src/pricing.ts`.

Ball: Sober (check) + your answer on A/B/C.


## Jason (BE) 2026-10-27 — TASK-846 per your RULING: A/B/C code GONE, one offer only — rebuilt, GREEN
**Removed (dead code, per the ruling):** `options`, `SHOW_OPTIONS`, `PENDING`, the A/B/C slide and the PENDING tag from `pricing.ts` / `slides.tsx`. Built `dist/index.html` has **0** hits for "ตัวเลือก", "ตัวเลขรอยืนยัน", 25,700, PENDING, SHOW_OPTIONS (also 0 in `src/`).
**Changed to match the updated task:**
- Installment 3 now reads in plain Thai: **"ส่งมอบ Salary พร้อมล็อกอินโค้ช หลายบทบาท / STAFF และการดูว่าใครเปลี่ยนทดลองเป็นคอร์ส"** (amount 13,500).
- **Slide 11 (timeline)** now shows each delivery as one installment: the step title and "งวดที่ n · amount" are read from `payment[i]` (so an installment change shows on slide 10 AND 11); the times (≈ 3–4 สัปดาห์ / ต่อจากงวดแรก / ปิดจบภายใน 2–3 เดือน) stay in `timeline`.
- **Slide 12 (needs)** = go-live date · first data (product Excel + stock counts) · "คำตอบ 6 ข้อเรื่องเงิน ที่ส่งให้คุณขวัญไว้ (ถ้ายังไม่ได้ตอบ)" — no "choose A/B/C".
- Slide 9 (how the price is calculated) has no tag. No slide prints a Revenue figure as text, so nothing is imported from `final-ui/src/mock/b-*.ts` (screenshots only).

**Slides (12):** 1 เริ่มต้น · 2 5 ส่วนของหลังบ้านใหม่ · 3 Salary · 4 Revenue · 5 Stock · 6 แก้หน้าบ้าน · 7 สิทธิ์ + เชื่อมระบบ · 8 สิ่งที่ตกลงกันแล้ว · 9 ราคาคิดอย่างไร · 10 ข้อเสนอ: ครบทุกส่วน แบ่งจ่าย 3 งวด · 11 ลำดับการส่งมอบ (Stock ก่อน) · 12 สิ่งที่ต้องได้จากห้องประชุม. **`dist/index.html` = 1,364,040 bytes (1.36 MB).**

**Verified again:** `tsc` 0 · build 0 · navigation/keys/click/console re-run earlier on the same app code (all 12 reachable, 0 console errors, bundled Thai font, 0 external requests); after this change I re-rendered slides 9–11 offline from `file://` (Thai OK).
**The price test (your new form), done and reverted:**
1. Installment 2 → **99,999** alone ⇒ the page **does not load**: console `Uncaught Error: pricing.ts: payments sum to 125399, total is 39200` (the sum assertion fired).
2. Installment 2 → 99,999 **and** `total` → 125,399 ⇒ rebuilt: slide 10 shows 99,999 in row 2, "รวม 125,399" in the table and the lead line; slide 11 shows "งวดที่ 2 · 99,999 บาท". (Slide 9 prints `total` too; I rendered it but did not look at that image — by source it reads `baht(total)`, so it follows.)
3. **Restored `pricing.ts` byte-for-byte** (13,800 / 39,200), rebuilt, `dist/index.html` has no 99,999 / 125399.

Ball: Sober (check).


## Jason (BE) 2026-10-27 — TASK-846 CHECK answered: all 3 were already in my 2nd build; plus one leftover string removed
Your check read my FIRST build (it crossed your ruling, as you said). The rebuild per the ruling was reported just before your CHECK; current state:
1. **PENDING / PendingTag:** removed (slide 9 has no tag).
2. **A/B/C:** `options`, `SHOW_OPTIONS`, `optionsSlide`, `OPT` deleted outright.
3. **Installment 3:** "ส่งมอบ Salary พร้อมล็อกอินโค้ช หลายบทบาท / STAFF และการดูว่าใครเปลี่ยนทดลองเป็นคอร์ส".
**One leftover found by your own grep:** the slide-11 `title` string "ลำดับการส่งมอบ (Stock ก่อน)" (not shown on a slide, but bundled) ⇒ renamed "ลำดับการส่งมอบ (เริ่มจาก Stock)".
**Your Done list:** tsc 0 · build 0 · `grep -cE 'ตัวเลขรอยืนยัน|25700|ยังไม่เอา Salary|Stock ก่อน' dist/index.html` = **0** · the installment-2 → 99,999 test (sum assertion fires alone; with `total` changed it shows on slides 10 + 11; reverted — see the report above) · file size **1,364,052 bytes**.
Ball: Sober ("ready for QA" to Porter is yours).


## Jason (BE) 2026-10-27 — TASK-846 unfrozen round DONE (Tanya's 11 notes) — GREEN, frozen again
**Slide wording (your table, exact Thai, all 10):** (1) slide 8 "(V3)" dropped · (2) slide 8 3rd card **"รายละเอียดครบแล้ว พร้อมเริ่มสร้าง"** and the heading no longer says "สเปกปิดแล้ว" (now "รายละเอียดครบแล้ว พร้อมเริ่มสร้าง") · (3) slide 2 Stock card: "รับเข้า / ขายออกเป็นตะกร้า (หลายชิ้นในบิลเดียว)" + "ของ Demo ที่วางไว้ตามโรงเรียน" · (4) slide 2 สิทธิ์ card: "CEO เห็นทุกอย่าง · แอดมินไม่เห็นยอดเงินเดือน · มีแจ้งเตือนในระบบ · เชื่อมกับระบบเดิม" · (5) slide 4 "ถ้าต้องลงเอง ก็เพิ่มรายการเองได้" · (6) slide 9 point 3 "ราคานี้รวมการทดสอบ การติดตั้งระบบ ช่วงทดลองใช้ก่อนใช้งานจริง รายงาน 6 หัวข้อ และหน้า SOM Dashboard / Daily Report แล้ว" · (7) slide 9 point 1 "แพ็กเกจเดิม 73,000 บาท ได้งานประมาณ 278 วันทำงาน ตกวันละประมาณ 263 บาท"; **`licence` removed from `pricing.ts`** · (8) comparison "149 วันทำงาน เท่ากับจ้างโปรแกรมเมอร์ 1 คนประมาณ 7 เดือน แต่เราส่งมอบได้ใน 2–3 เดือน เพราะใช้เครื่องมือ AI ช่วย"; **`perMonthUnder` removed** · (9) one name per slide: footer section = the slide's own kicker on slides 2, 9, 11 (the others already matched); installment 2 keeps "ต่อจากงวดแรก" · (10) slide 12: all three places say "จากการประชุมวันนี้".
**One more of mine, caught by the grep:** the slide-11 note for installment 3 said "รวมเทส ขึ้นระบบ และ UAT" ⇒ now "รวมการทดสอบ การติดตั้งระบบ และช่วงทดลองใช้ก่อนใช้งานจริง".

**Screenshots (note 11) — all 5 recaptured and LOOKED AT (salary, revenue, stock, frontoffice, roles):** I did not touch the original v3: I wrote a patched COPY (scratchpad) that runs a live text replace before the capture — Kid→Ton, Poo→Ploy, Kung→Nam, Bank→May, London→Beam, Nelson→Pete, พี่ฟีน→CEO, and strips every `^[A-Z][0-9]+ · ` item code (sidebar, page title, breadcrumb). In each image: salary = Pete/May/Ton/Ploy/Nam/Beam beside the figures; stock = coaches Ton/Ploy/Nam/May; roles = Ton/Ploy; frontoffice teacher = Ton; sidebar reads "Branch on a booking", "Payment Method", "Conversion", "No Teacher", "Confirm camp" with no codes. **No real staff name and no code in any shot.** (The invented child «น้องเอ» and mock items like "Miller inline skate" remain — v3's own invented data.)

**Done list:**
- tsc 0 · build 0 · **0 console** (served build, all 12 slides stepped by key; footer/kicker names checked per slide).
- Banned grep on `dist/index.html`: with word boundaries `\b(Kung|Poo|Kid|Bank|London|Nelson)\b|พี่ฟีน|\(V3\)|เทส|UAT|ห้องนี้|6,000` = **0**; your earlier list (ตัวเลขรอยืนยัน|25700|ยังไม่เอา Salary|Stock ก่อน|TASK|REQ-|99,999|3,500|licence|perMonthUnder) = **0**. ⚠️ A *plain-substring* grep for `Poo` / `Kid` still hits: `Poo` = React's own `cachePool` in the bundled library (21×), `Kid` = a random run inside base64 font/image data (1×) — not on any slide; the text of all 12 slides, dumped from the DOM, matches none of the banned words (the only "3,500" hit is inside "13,500").
- Slides 3 / 4 / 5 (Salary / Revenue / Stock) shots looked at by me: yes (see above).
- **Size 1,352,754 bytes · md5 `056a00b466fced49741c0c3fbd6cb9a5`** (`dist/index.html`).
**Frozen again** — no more rebuilds unless you ask.
Ball: Sober.
