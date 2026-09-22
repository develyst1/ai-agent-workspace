# REQ-007: Visual redesign — "you are the possibility"
- Status: DELIVERED (Porter 2026-09-22 — TEST_PASSED round 2 in `tests/TEST-005-visual-redesign.md`; Google button renders in Google light theme — owner informed)
- Priority: HIGH (the owner rejected the current look; ships before any further FE feature polish)
- Requested: 2026-09-22 by the owner
- Deadline: none
- Source: chat 2026-09-22; SYSTEM-FACTS.md §Purpose, §Visual design

## Problem / Goal
The owner: *"UI ความสวยงามไม่เด่น ไม่สวยเลย"*. The product's purpose is **to make everyone
dare to dream — to see that they themselves are the possibility** (SYSTEM-FACTS §Purpose).
The current UI is a plain form. It must become an experience that makes the visitor feel
**seen and encouraged, never graded**.

## The feeling (design brief — binding on every screen)
- Dark, quiet, cinematic. One warm golden light in the dark = the person.
- The site speaks TO the visitor ("คุณ / you"), never ABOUT "the idea".
- Every tier is a stage of becoming (stone → light → diamond), never a verdict.
- Nothing shouts: no bright colours besides the warm gold, no dense tables, generous space,
  one thing per screen.

## Requirement
1. **Theme:** dark background (near-black, warm), warm-gold accent, off-white text; a
   serif display face for headlines, a clean sans for body; Thai and English both typeset
   well. Ant Design themed via its token system (no second styling system).
2. **Imagery** from `../project-docs/assets/grok-2026-09-22/` (wide on desktop, tall on
   phone):
   - Landing hero: `hero-glowing-stone`.
   - Tier imagery: Ordinary `ordinary-hands-stone` · Seeker `seeker-crack-hands` ·
     Raw Diamond `raw-diamond-hands` · Visionary `visionary-half-hands` ·
     The Possibility `the-possibility-diamond`.
   - Loading (while the AI works) and empty states: `spark`.
3. **Landing (signed out):** full-bleed hero image, headline W-1, sub-line W-2, then the
   Google button (primary) and the email form (REQ-006) below "or use email". Language
   switch top-right, small.
4. **Idea page (`/ideas/new`):** heading W-7 (REQ-003), the box on a dark card, the counter
   quiet; the submit button is the only gold element.
5. **Loading:** the spark image breathes (slow fade in/out); W-4 (REQ-003) beneath it; no
   spinner.
6. **Result page:** the tier image large at the top, the tier name under it, then the
   new tier line (W-3 below), then the three scores as thin gold bars with labels (REQ-003
   axis labels), then the AI reason as a quote, then the discount line, then the hire
   button (REQ-004). The submitted text last, collapsed.
7. **My ideas:** cards with the tier image as a small thumbnail, date (W-9), preview.
8. **/me:** the user's tier image large, name, tier name, W-3 line, discount, link to ideas.
9. **Header:** logo word "Possibility" (serif), tier badge quiet (gold outline), name, sign
   out, language switch. No other navigation.
10. **Phone (375 px):** everything above stacks; hero and tier images use the tall files.
11. Existing behaviour (REQ-001..006 ACs) is unchanged by this REQ — only look, layout
    and the wording below.

## Acceptance Criteria
- [ ] AC-1 — **Given** a signed-out visit on desktop and on 375 px **When** the landing opens **Then** the hero image fills the top, W-1/W-2 are readable over it, the Google button is first and largest (dark outline — Google forbids restyling its button; **amended 2026-09-22, Porter, TEST-005 Q-1**), the single gold element is the create-account link, the email form sits below; nothing overflows.
- [ ] AC-2 — **Given** each of the five tiers (Tanya forces each via ideas or fixtures) **When** the result page and `/me` render **Then** the image shown is the one mapped in R2 for that tier, in both languages.
- [ ] AC-3 — **Given** an analysis in progress **When** the loading state shows **Then** the spark image and W-4 are shown, no spinner, until the result replaces it.
- [ ] AC-4 — **Given** the result page **When** compared with R6 **Then** the order of elements is exactly R6, the scores are gold bars with the axis labels, the reason is set as a quote.
- [ ] AC-5 — **Given** any page **When** the language is switched **Then** the layout does not shift and all wording below appears in that language (REQ-005 regression).
- [ ] AC-6 — contrast: all body text on the dark background passes 4.5:1 (Tanya checks with a contrast tool on three sample pages).
- [ ] AC-7 — regression: REQ-002/003/004/006 ACs still pass after the redesign (Tanya re-runs the smoke lines listed in REGRESSION.md).

## User-facing wording (Porter as UX writer) — this REPLACES earlier tier descriptions
- W-1 hero headline: "คุณคือความเป็นไปได้" / "You are the possibility"
- W-2 hero sub-line: "เล่าสิ่งที่คุณกล้าฝัน — เราจะช่วยให้คุณเห็นแสงในนั้น" / "Tell us what you dare to dream — we'll help you see the light in it."
- W-3 tier lines (replace REQ-001 §Wording table; tier NAMES unchanged):

| Tier | TH | EN |
|---|---|---|
| Ordinary | ทุกอย่างเริ่มจากหินหนึ่งก้อนในมือ — คุณเริ่มแล้ว | Everything begins with a stone in your hands — you've begun. |
| Seeker | มีแสงลอดออกมาจากรอยแตกแล้ว — คุณกำลังมองหาบางอย่างที่ใหญ่กว่าตัวเอง | Light is showing through the crack — you're reaching for something bigger than yourself. |
| Raw Diamond | ข้างในมีเพชรอยู่จริง — ยังดิบ แต่มันอยู่ตรงนั้น | There is a real diamond inside — still rough, but it's there. |
| Visionary | ครึ่งหนึ่งเปล่งประกายแล้ว — คุณเห็นสิ่งที่คนอื่นยังไม่เห็น | Half of it already shines — you see what others don't yet. |
| The Possibility | คุณคือความเป็นไปได้ที่โลกรออยู่ | You are the possibility the world has been waiting for. |

- Result page heading above the tier: "ตอนนี้คุณอยู่ตรงนี้" / "This is where you are now"
- Discount line: "และเพราะแบบนั้น เราให้ส่วนลด {discount} ถ้าคุณอยากให้เราสร้างมันด้วยกัน" / "And because of that, we'll take {discount} off if you'd like us to build it together."
- Empty state (My ideas) replaces REQ-003: "ยังไม่มีอะไรตรงนี้ — ความเป็นไปได้แรกของคุณรออยู่" / "Nothing here yet — your first possibility is waiting."
- All other strings from REQ-002/003/004/006 stay as written.
- W-4 collapsed submitted text on the result page (Porter 2026-09-22): heading "สิ่งที่คุณเล่าให้เราฟัง" / "What you told us" · toggle "ดูข้อความ" / "Show" · "ซ่อน" / "Hide"

## Constraints
- Ant Design stays (owner's stack); theming through AntD tokens. Images are JPG on dark —
  no cut-outs needed.
- Tier names are the owner's exact words; never translated.

## Out of Scope
- Animation beyond the loading breathe; marketing pages; logo design; admin page styling
  (functional dark theme is enough).

## Questions
- Porter 2026-09-22 → @Sober — **DEF-1** (shared with REQ-006, see there) fails AC-6. **DEF-2 (COSMETIC, from TEST-005):** Thai W-1 "คุณคือความเป็นไปได้" breaks mid-word at 375 px — please fix with the same change if cheap (Thai line-break: keep the headline on one or two lines at natural word boundaries); not blocking on its own.
  > answer (Sober, 2026-09-22): DEF-1 → TASK-014 (see REQ-006). DEF-2 → same TASK: `keep-all` on the hero title, and if Chrome still breaks inside a Thai word, a zero-width space at the word boundaries of the TH W-1 string — invisible, not a wording change; flagging so Porter knows the dictionary string may carry U+200B.
