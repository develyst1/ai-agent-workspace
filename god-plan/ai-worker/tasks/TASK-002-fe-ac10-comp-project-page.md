# TASK-002: AC-10 comp — one static page of the project screen
- Source: SPEC-002 (§Front — pages, row `/projects/[id]`) · REQ-001 AC-10
- Owner: FE (Fern)
- Status: REVIEW (2026-11-08, Fern — was IN_PROGRESS, TODO before; Q-S2 answered. Strings are in REQ-001 §User-facing wording, both tables. The delete confirm says the comments go too.)
- Depends on: none now
- Git: **none.** The comp lives in the workspace, not in `god-plan-front` (not cloned yet).

## What to do
Build **one self-contained HTML file**, `god-plan/ai-worker/specs/comps/AC-10-project-page.html`: inline CSS, no external JS, and one Google Fonts
link (IBM Plex Sans Thai) allowed. It must open by double-click. It is the owner's look at the project page before the full
build, so it must look like the real thing, not a wireframe.

Show, with **synthetic data only** (REQ-001 Req 9):
1. Header: project name "ปรับปรุงบ้านแม่" and a two-line description. Links: summary, members (owner view), back to projects.
2. Six tasks across all four statuses (ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว). **Two are ติดอยู่**, each with a visible reason. Each
   task shows its comment count.
3. One task selected, its comment thread open: three comments by synthetic people ("พี่เอ", "น้องบี", the owner) with Thai
   times (Asia/Bangkok, e.g. "8 พ.ย. 14:05"), plus the comment box and send button.
4. The owner's controls: add task, change status, the AI button "ให้ AI ช่วยแตกงาน" (static; nothing needs to work).
5. Two widths in the same file are fine (CSS media query): phone 390 px and desktop 1280 px. Both must read well. The
   owner's people will often open it on a phone from a LINE link.

Rules: every visible word comes from REQ-001 §User-facing wording or the PM's Q-S2 answer, never invented. Status must be
recognisable without colour alone (text label always shown). Contrast ≥ 4.5:1 for body text.

## Definition of Done
- [ ] File exists and opens offline except for the font. Proof: `ls -l` + `grep -c '<script' <file>` → `0`.
- [ ] Screenshots at 390 px and 1280 px, saved next to it as `AC-10-project-page-390.png` and `AC-10-project-page-1280.png`
      (any headless browser). Proof: the command used + `ls -l` of both PNGs.
- [ ] Every Thai string is traceable: list in Implementation Notes each string → its row in the REQ table or Q-S2.
- [ ] No real names, emails or phone numbers. Proof: your read of the file, stated.

## Implementation Notes
**Fern, 2026-11-08.** Files, all in `specs/comps/` (no repo, no git): `AC-10-project-page.html`, `AC-10-project-page-390.png`, `AC-10-project-page-1280.png`.

**Proof (command-verified)**
- `ls -l`: html 15114 B · 390.png 118671 B · 1280.png 126656 B. `grep -c '<script' AC-10-project-page.html` → `0`. The only external request is the Google Fonts link.
- Screenshots: `google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=390,2250 --screenshot=…-390.png file://…/AC-10-project-page.html` and the same at `1280,1480`. I opened both PNGs and looked at them: no clipped text, no horizontal scroll visible. On 390 the thread sits directly under its task; on 1280 it is a second column.
- Contrast, computed (WCAG formula, python): body ink/bg 14.50 · grey text/surface 7.42 · status text on its tint 7.14 (to do) / 7.52 (doing) / 7.57 (stuck) / 6.33 (done) · white on the button 7.38 · placeholder 5.29 · input border vs white 3.25 (needs 3.0). All ≥ 4.5 for text.
- Status is never colour alone: each of the four shows its Thai label and its own icon shape (ring · half ring · triangle · tick).

**Strings, each → its row** (REQ-001 §User-facing wording; "T1" = first table, "T2" = the "Added 2026-11-08 for SPEC-002 Q-S2" table)
- ยังไม่เริ่ม · กำลังทำ · ติดอยู่ · เสร็จแล้ว → T1 Status
- ให้ AI ช่วยแตกงาน → T1 AI tasks button
- สถานะ (select label, screen-reader only) · ติดเพราะอะไร → T2 Status control · Stuck reason
- ชื่องาน · เพิ่มงาน → T2 Add task
- แก้ชื่องาน · ลบงาน → T2 Rename task · delete task
- คอมเมนต์ · เขียนคอมเมนต์ · ส่ง · "<n> คอมเมนต์" → T2 Comments heading · placeholder · send · count
- สรุปงาน · คนในโปรเจกต์ → T2 Link to summary · to members
- กลับไปหน้าโปรเจกต์ → T2 Back to project list. ออกจากระบบ → T2 Sign out. (The "‹" before the back link is a glyph, not a word.)
- **Not strings from the PM — synthetic sample data the TASK itself asks for:** project name and two-line description, six task titles, the two stuck reasons, the three comments, the names พี่เอ / น้องบี / โอ (the owner), the times. None is real. "โอ" is my invention for the synthetic owner (TEST-001 calls the owner "O"). Nothing here is UI copy; if the owner wants other sample words, only this data changes.
- Not shown, on purpose: the delete confirm and the "ยังไม่มีคอมเมนต์" empty state are in the REQ table but not on this one static screen.

**Decisions I made (internal, one line each)**
- The status control is a real `<select>` styled as the status badge, so one element is both the label and the owner's control (no duplicate badge + dropdown).
- Thread and tasks share one CSS grid, so on a phone the thread opens right under the selected task (via `order`), and on desktop it is a sticky right column. No JS.
- Owner controls (status, rename, delete) are shown on every task because this is the owner's view; "ลบงาน" is plain text, not red, so it does not draw the eye.
- Colour: neutral warm paper, one deep-teal accent (primary buttons, selected-task outline, count), status tints are low-saturation. No gradient, no side stripe, no hover-scale.
- Selected task has a full 2 px accent outline instead of a stripe.

**Not done / UNVERIFIED**
- `UNVERIFIED — /impeccable audit`: my session lists no `impeccable` skill, so the mandatory audit was not run. Would settle it: someone runs `/impeccable audit` on `specs/comps/AC-10-project-page.html`, or the SA waives it for a comp.
- `UNVERIFIED — IBM Plex Sans Thai`: this box has no Plex Sans Thai installed and fonts.googleapis.com may not have loaded in headless Chrome, so the screenshots may show the fallback Thai font. Would settle it: the owner opens the file with internet.
- `UNVERIFIED — real phone`: 390 px was checked only as a headless Chrome window, not on a phone. Hover, focus and the 8 interaction states were not clicked through (static comp; the select/buttons have hover, active and `:focus-visible` rules in the CSS, not exercised).
- Hit targets: buttons, links and the select are `min-height: 44px` in CSS; not measured in the running page.
- AC-10 is the owner's alone to tick. Nothing here claims it.

## Questions

## Review
**DONE — Sober (SA), 2026-11-08.** Checked against the DoD, re-run where cheap:
- Re-ran: `ls -l` (html 15114 B, PNGs 118671 / 126656 B) · `grep -c '<script'` → `0` · the only URLs in the file are fonts.googleapis.com /
  fonts.gstatic.com · `grep` for email/phone shapes and `dangerously` → `0`.
- I opened both screenshots myself. 390: the thread opens right under the selected task, no clipping, no horizontal scroll. 1280: two
  columns, with the thread sticky on the right. Both ติดอยู่ tasks show their reason. Every status shows a text label + icon, not
  colour alone. The owner's controls (add, status, rename, delete, AI) are all present. It matches SPEC-002's `/projects/[id]` row.
- Strings: each traced to REQ-001's tables in Implementation Notes. The sample data is synthetic, as the TASK asks.
- **Waived for this comp (SA):** the `/impeccable` audit. The gate for a comp is the owner's own eyes (AC-10). The audit
  applies to the real page in TASK-007. The font, real-phone and interaction-state items stay `UNVERIFIED` as Fern wrote them. The
  owner opening the file will show the font.
- Not claimed: AC-10. It is the owner's alone, via the PM.
