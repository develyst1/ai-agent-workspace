# REQ-009: UI redesign v3 — redo everything, with an image-request loop to the owner
- Status: SPEC_DONE (Sober 2026-09-26; direction B on every page, IMG-002 placed) — awaiting owner deploy + AC-1 look verdict, then Tanya
- Priority: HIGH (third attempt at the look; the owner has rejected REQ-007 and REQ-008)
- Requested: 2026-09-25 by the owner
- Deadline: none
- Source: chat 2026-09-25; SYSTEM-FACTS.md §Visual direction v3, §Purpose

## Problem / Goal
The owner deployed redesign v2 (REQ-008) and said *"ยังห่วยเหมือนเดิม"* — still bad. Two
approaches have failed: photos dropped into a layout (REQ-007) and no photos at all
(REQ-008). His instruction now:

> *"จงแก้ UI ทั้งหมดใหม่ แล้วระหว่างแก้ ให้ frontend request รูปได้ โดยให้ FE อธิบายมาให้ SA
> และให้นายทำความเข้าใจ และคิด prompt gen image ให้ฉันไปเจนจาก grok ด้วย แล้วฉันจะส่งกลับมา
> ให้ใหม่ เพื่อให้ส่งกลับไปถึง FE นำไปแปะอย่างลงตัว"*

So: **redo the whole UI**, and **images are designed-for, not dropped-in** — the FE designs
the page, defines exactly where an image goes and what it must do, and asks for it; the
owner generates an image made for that exact slot.

The purpose still governs every screen: **make everyone dare to dream — the visitor is the
possibility, seen and encouraged, never graded** (SYSTEM-FACTS §Purpose).

## Requirement
1. **Redo every user-facing page:** landing (signed out), idea box, loading, result,
   My ideas, `/me`, not-found, and the header. The admin page only needs to be consistent
   and readable, not redesigned.
2. The previous two looks are not a starting point to polish — start the visual design
   again. Behaviour, routes, data and all wording stay (R7).
3. **Image slots.** While designing, the FE may define image slots wherever an image would
   make the page better. Each slot is requested with an **IMG request** (format in
   §Image request format) sent FE → Sober → Porter. Sober checks it is complete; Porter
   turns it into a Grok prompt; the owner generates; the file comes back
   owner → Porter → Sober → FE.
4. **The design must not stall on images.** Until an image arrives, the slot shows a
   neutral placeholder of the right size and tone, so the page can be reviewed and shipped
   in stages. A slot whose image the owner rejects or never sends must still look finished
   (the FE designs a fallback for every slot).
5. **Send requests early and together.** The FE sends the first batch of IMG requests as
   soon as the layout exists (not after the build is finished), with a screenshot of each
   page showing the placeholder in place — so the images are generated for the real layout,
   and the owner sees the direction before the whole thing is built.
6. **Placing a returned image:** the FE fits it to the slot as specified (crop, position,
   overlay, fade into the background) so it looks native to the page, on desktop and at
   375 px. If a returned image does not fit, the FE says why via Sober and Porter
   re-prompts — the FE does not silently stretch or bury it.
7. Keep: all wording (REQ-002/003/004/006/007 W-lines, REQ-008 W-10, REQ-006 W-11), tier
   names exactly as the owner wrote them, TH/EN, Ant Design (owner's stack), every
   behaviour in REQ-001..006. Dark / warm-gold is **no longer mandatory** — the FE may
   propose a different palette if it serves the purpose better; Sober states it in the SPEC
   and I carry it to the owner before build.

## Image request format (FE → Sober → Porter) — every field required
```
IMG-NNN
- Page / slot: <route> — <where on the page>
- Job: <what this image must make the visitor feel or understand, in one sentence>
- Subject: <what should be in it, concretely>
- Must NOT contain: <e.g. text, faces, hands, logos>
- Size & aspect: <px at desktop> / <px at 375> / aspect (e.g. 16:9 desktop, 4:5 phone)
- Background: transparent PNG | full-bleed | fades into <hex> at <which edge>
- Overlay: <what text/UI sits on top, and where> (so the image keeps that area calm)
- Palette: <hexes of the surroundings>
- Style: <photo / 3D render / illustration / abstract> and one or two references in words
- Screenshot: <path to a screenshot of the page with the placeholder in place>
- Tier-specific?: no | yes → one variant per tier (Ordinary · Seeker · Raw Diamond · Visionary · The Possibility)
```
Porter answers each request in §Image requests with the exact Grok prompt(s); the owner's
files land in `../project-docs/assets/req-009/` named `IMG-NNN[-tier][-desktop|-phone].png`.

## Acceptance Criteria
- [ ] AC-1 — **Given** the new design on SIT **When** the owner looks at it **Then** he accepts the look (his word, via Porter, recorded in SYSTEM-FACTS). **This AC is his alone and is checked before Tanya's run.**
- [ ] AC-2 — **Given** every page in R1 **When** rendered on desktop and at 375 px **Then** nothing overflows, no broken image, no empty gap; every image slot shows either its delivered image or its designed fallback.
- [ ] AC-3 — **Given** each delivered image **When** shown in its slot **Then** it matches its IMG request (size, crop, overlay area calm, background blends) — Tanya checks each slot against its request.
- [ ] AC-4 — **Given** the five tiers **When** the result page and `/me` are compared **Then** each tier is instantly distinguishable and the user can see where they are on the five-stage journey and that there is further to go (REQ-008 AC-2/3 carried forward).
- [ ] AC-5 — contrast: body text ≥ 4.5:1 everywhere, including text over images and error alerts (REQ-006 DEF-1 regression).
- [ ] AC-6 — language switch on any page: no layout shift, no Thai left in EN or vice versa.
- [ ] AC-7 — regression: every REQ-001/002/003/004/006 smoke line in `tests/REGRESSION.md` still passes on SIT.
- [ ] AC-8 — images do not make the site slow: each image served at a size appropriate to its slot (Tanya records the largest image weight on the landing and result pages; Sober sets the limit in the SPEC).

## User-facing wording (Porter as UX writer)
- Unchanged. Any new label the design needs comes to me via Sober — engineers do not invent user-visible words.

## Constraints
- Owner's stack: Next.js + Ant Design tokens; no second styling system.
- Images come only from the owner via this loop — no stock photos, no AI images generated by the team.
- The owner judges the look (AC-1) before anything else counts.

## Out of Scope
- Behaviour, scoring, tiers, discounts, wording changes.
- Admin page redesign (consistency only).

## Image requests
**Batch 1 (Fern via Sober, 2026-09-26; gated complete by Sober — SPEC-010 §Image requests). Full text of each request: `tasks/TASK-020-fe-three-directions-preview.md` §IMG request batch. Summary:**

| Id | Direction | Slot | Job (one line) | Variants |
|---|---|---|---|---|
| IMG-001 | A quiet luminous | result page, between the discount line and the hire button | the visitor feels that what they hold is starting to be worth something | 1 |
| IMG-002 | B warm editorial | result page, between the score ledger and the AI reason, as a book plate | give the letter one physical object to hold on to | 1 |
| IMG-003 | C cinematic | result page, full-bleed backdrop | carry the feeling of the tier the visitor just became | 5 (one per tier) |

**Sober to Porter:** each request serves ONE direction and only one direction gets built, so the ask that travels with the preview is — *look at A/B/C, pick one, then generate only that direction's image(s)*. IMG-003 alone is five generations; nobody should spend that on a direction that loses. Prompts are yours to write once he has picked.
  > **answer (Porter 2026-09-26) — IMG-002 prompt for the owner (Grok).** Owner chose B; IMG-001 and IMG-003 are dropped, not generated.
  > Main prompt: *"Editorial still-life photograph for a book plate. A single rough, dark grey-brown stone, fist-sized, resting on a sheet of warm off-white handmade paper (colour close to #f6f1e6). Soft matte daylight from a window on the left, long gentle shadow falling to the right, very low contrast. The stone sits slightly below and left of centre; the rest of the frame is calm empty paper — at least 60% negative space. Faint natural paper fibre texture. Muted warm palette: cream, soft umber, a hint of amber (#a0651f) only in the shadow. Quiet, patient, hopeful mood, like a page in a beautifully printed book. Shot on medium format, 50mm, f/5.6, shallow falloff, no vignette. No text, no hands, no people, no logos, no props, no colour cast, no glow, no sparkle, no diamond. Landscape 3:2."*
  > Variant (if the first feels too plain): same prompt, but *"a hairline crack runs across the stone, with the faintest warm amber warmth visible inside the crack — barely there, not glowing."*
  > Owner saves the chosen file as `../project-docs/assets/req-009/IMG-002.png` (or .jpg), at least 1440×960.
  > **delivered (owner → Porter, 2026-09-26):** `../project-docs/assets/req-009/IMG-002.jpg` — 1712×1152 (≈3:2), 175 KB, JPEG. Porter's check against the request: ✅ single rough dark stone, no text/hands/logos, 3:2, large negative space. ⚠️ Background is **pure white, not ~#f6f1e6**, and there is **no paper texture and no cast shadow** (the stone looks cut out / floating rather than resting on paper). Suggested fit (FE's call): blend onto the cream plate (e.g. multiply) so white becomes the page colour; if it still reads as a cut-out, say so via Sober and I re-prompt once — the owner has already spent one generation.


(Sober appends IMG requests here in the format above; Porter answers each with the prompt(s); the owner's files are listed under each when they arrive.)

## Questions
- Porter 2026-09-26 — **owner's bar (SYSTEM-FACTS §Visual references):** the three webflow sites set the LEVEL, not the look — match their value and interest in **colour, animation, and image fit**; do not copy. Adds to R7: purposeful motion (entrances, transitions, hover/scroll reveals, the result reveal) is expected, not optional; respect `prefers-reduced-motion`.
