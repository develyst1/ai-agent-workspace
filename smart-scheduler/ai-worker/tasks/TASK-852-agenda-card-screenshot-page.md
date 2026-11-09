# TASK-852 — the AGENDA CARD: a pretty Vite page the owner screenshots for LINE (REQ-5001 §8.5) — @Fern (≈ 0.3 d)
**From @Sober, 2026-11-03. GO now. Urgent: the owner is waiting, so today if you can.** REQ: `requirements/REQ-5001-meeting-clip-presenter-video-for-11-07.md` §8.5 (owner: *"ทำเป็น vite preview สวยๆ ดูง่ายๆ มี UI ฉันจะเข้าไปแคปเป็นรูป"*).
**Folder:** new `som-balance-backoffice-spec/agenda-card/` (path in `machine.local.md`). Not git, no deploy, nothing else touched. **Rule 2:** you never ask the owner; questions go below, to me.

## The text: word for word, never retyped
- **Source:** `smart-scheduler/ai-worker/COPY-DRAFT-khwan-meeting-agenda-2026-11-07.md` (md5 `8118a042e30df88d73db9762e8a6ace5`, Tanya TEST-132 PASS).
- **The message body is lines 16–39:** from **"สวัสดีครับ …"** to **"เจอกันวันเสาร์ครับ 🙏"**. Nothing else in that file (its title, the "ข้อความถึงทีมลูกค้า" line, the Owner notes) goes on the card.
- **Copy it with a script that reads those lines** into `src/agenda.ts` (a structured object: intro, the 6 topics, the ข้อ 4 heading, the 3 blocks × {name, มีอะไรบ้าง, ถ้าเลือกเป็นก้อนแรก}, the 4 notes, the closing).
  - The `**bold**` marks become real bold.
  - **Add a check:** joining the object's text back equals the source body with the markdown marks stripped. A mismatch ⇒ throw. (Same idea as the clip's word-for-word check.)
- **Must hold (from §8.5; already true of the body, checked by me):** no prices, and no "ขวัญ". `grep` of the built page for `ขวัญ|8,300|13,800|13,500|3,600|39,200` = 0.

## The look
- **The same family as the pricing deck:** Noto Sans Thai (`@fontsource/noto-sans-thai`, the deck's version), the deck's colours:
  - stage `#f8fafc`, text `#0f172a`, accent blue `#1c7ed6`, muted `#334155`;
  - cards white with a soft border + shadow, as the deck's cards.
  - Read `pricing-deck/src/styles.css` + `slides.tsx`.
- **Width 1080 px,** portrait, made to be read **on a phone in LINE** after the image shrinks:
  - body ≥ 30 px, headings bigger;
  - generous spacing, no table: the 3 blocks are **3 cards**, each with its name as a heading, "มีอะไรบ้าง" as a short list (split on " · "), and "ถ้าเลือกเป็นก้อนแรก ได้ใช้ประมาณ" as a highlighted line;
  - the 6 topics as a numbered list with topic 4 emphasised, as the source bolds it;
  - the 4 notes below the cards.
- **Split it if it's too tall:** if one page would be over ≈ 1,920 px tall (≈ 16:9 portrait), make **2 screens**, `#/1` (greeting + 6 topics) and `#/2` (the blocks + notes + closing), each a clean, self-contained screenshot. Show a small "1/2", "2/2" marker; put the greeting only on 1 and the closing only on 2. A quiet toggle at the top, **outside** the 1080 frame, so it never appears in the screenshot.
- **Light background** (the deck's slides are light). No dark mode.

## Run
- `npm install` (pinned, no `^`) → `npm run build` → **`npm run preview`** opens it.
  - The owner uses preview, so it must work from a clean folder.
- No network at run time: the font is bundled.

## Done = (evidence in `## Implementation Notes`)
1. The word-for-word check passes, and is shown failing once (one character changed in a copy).
2. tsc 0 · build 0 · `npm run preview` from a fresh `npm ci` works (paste the URL line) · 0 console errors.
3. The grep above = 0.
4. **Screenshots at 1080 px wide** (each screen), saved in `agenda-card/shots/`, looked at by you: no clipped Thai marks, nothing cut off at the edges, readable when shrunk to 360 px wide (look at a 360-px copy too).
5. Nothing outside `agenda-card/` changed (the deck / UI / clip dists' md5s unchanged).

## Questions
_(none yet)_

## Implementation Notes
**Fern, 2026-11-03.** Built in `agenda-card/` (new; nothing outside it touched). Source md5 re-checked = `8118a042…`.
- **Text:** `scripts/gen-agenda.mjs <COPY-DRAFT path>` reads lines 16–39 → `src/source-body.txt` (verbatim) + `src/agenda.ts` (generated, structured: intro, 6 topics, ข้อ 4 heading, 3 blocks × {name, items, first}, 4 notes, closing). `**bold**` → real bold. The "first" cell is split only at " · ครบ…" (two lines: the first-part time, then the whole-block time); the " · " inside a sentence stays.
- **Check 1 (word-for-word):** `npm run build` runs `scripts/check-agenda.mjs` first: passes (1476 chars). **Shown failing once:** on a copy with "ประมาณ 3 เดือน"→"4 เดือน": `word-for-word check FAILED at char 1234 … exit=1`.
- **Check 2:** tsc 0 · build 0 · from a clean `rm -rf node_modules dist && npm ci` then build, `npm run preview` serves `http://localhost:4173/` (4174 when 4173 is taken) · console errors/warnings 0 on both screens.
- **Check 3:** grep `ขวัญ|8,300|13,800|13,500|3,600|39,200` over the page DOM and over `dist/` = 0.
- **Check 4:** `shots/agenda-1-1080.png` (1080×1259), `agenda-2-1080.png` (1080×2468), plus `-360.png` copies; all four looked at: no clipped Thai marks, nothing cut at the edges, readable at 360 px.
- **Check 5:** `pricing-deck/dist/index.html` md5 `ac0d60da…` and `final-ui/dist/index.html` md5 `1d0ce1f6…` (unchanged); only `agenda-card/` written.
- **Look:** deck family (Noto Sans Thai bundled, #f8fafc / #0f172a / #1c7ed6 / #334155, white cards). `#/1` greeting + 6 topics (topic 4 a solid blue bar, as the source bolds it); `#/2` the heading, 3 cards (name heading, "มีอะไรบ้าง" as chips, "ถ้าเลือกเป็นก้อนแรก…" as a blue highlight), the 4 notes, the closing. "1/2" / "2/2" marker inside the frame; the toggle sits above it, outside the screenshot target (`#frame`).
- **⚠ For Sober:** screen 2 is **2468 px tall**, over your ≈1920 guide (it was 3322 before I turned the item lists into chips). Still one clean image in LINE (long phone screen). If you want it under 1920, the only way is a third screen (`#/3` = notes + closing); I did NOT do that without your word.
- Not committed (git is the owner's).

## Review
_(Sober)_

**Sober, 2026-11-03: DONE.**
- **Re-run by me:**
  - `node scripts/check-agenda.mjs` → "word-for-word check ok (1476 chars)";
  - the built `dist/` greps 0 for `ขวัญ|8,300|13,800|13,500|3,600|39,200`;
  - final-ui md5 unchanged. The deck md5 moved, but that's Jason's TASK-850 add-on 3, not this TASK.
- **Looked at** `agenda-1-1080.png` and `agenda-2-360.png`: clean Thai, topic 4 emphasised, the cards readable at 360 px.
- **Your flag (screen 2 = 2468 px): accepted, keep 2 screens.**
  - 1080 × 2468 ≈ 2.3 : 1 is a normal tall phone image in LINE.
  - A third screen would split the notes from the blocks they explain.
