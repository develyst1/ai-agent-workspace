# TASK-014: Approach Advisor UI (CORE)
- Source: SPEC-003
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-012 (advice endpoint)

## What to do
In `manager-gold-front`, add an **Approach Advisor** panel to the person profile page
(`/people/[id]`), below the existing sections:
- A topic/goal input (optional) + a "How should I approach them?" button.
- On click → `POST /api/people/:id/advice { topic }` via a `lib/people.ts` helper (`getAdvice`).
  Show a **loading** state while it runs (the gateway can take a few seconds).
- On `200` → render the returned `advice.content` as the **approach card** (preserve line breaks /
  render markdown-ish; show which `provider`/`model` produced it, small + dimmed).
- On **`502 ai_unavailable`** (or any failure) → a **clear, friendly error** ("The AI service is
  unavailable right now — please try again."), **no crash** (REQ-003 acceptance criterion).
- **Nice-to-have (only if quick):** a "Save to interactions" button on a generated card that calls
  the existing `addInteraction` (SPEC-002) with the topic + a short note — reuses the current API,
  no backend change.
- Add `getAdvice(id, topic)` to `lib/people.ts` (returns the advice or a typed unavailable result).

## Definition of Done
- [x] Entering a topic + clicking produces a rendered advice card (content + `provider·model`);
      loading state wired (`Button loading`). Verified vs the real backend → local stub.
- [x] Simulated `502` (stub killed → gateway unreachable) → friendly "AI service is unavailable…"
      error renders, page intact (no crash), console clean. Verified.
- [x] `bun run build` clean. Browser walkthrough below.
- [x] "Save to interactions" adds an interaction ("Advice: <topic>") visible in the Interactions
      section (reuses `addInteraction`; optimistic update). Verified.

> Note: a live check against the **real** AI Center is gated on the DATA REQUEST (base URL/auth);
> until then verify against a local stub returning the documented `{success:true,data:{…}}` shape
> (and a failure) — same approach as TASK-002's mock. Announce any port you hold (baseline §7).

## Implementation Notes
Implemented by Fern, 2026-07-28 in `manager-gold-front` (branch `dong`, commit `1aec437`).

**Files (new unless noted):**
- `lib/people.ts` (mod) — `getAdvice(id, topic)` → `POST /api/people/:id/advice` (sends `{topic}`
  only when non-empty). Typed `AdviceResult`: `{ok,advice}` on 200; on failure `{ok:false,
  unavailable, message}` — `502`→`unavailable:true`, `400`→topic message, else generic.
- `components/AdvisorSection.tsx` — topic `Textarea` + "How should I approach them?" button →
  `getAdvice`; loading state; renders `advice.content` (preserving line breaks) with `provider·model`
  dimmed; **502/any failure → friendly "AI service is unavailable right now — please try again."**;
  optional "Save to interactions" button on a card.
- `app/people/[id]/page.tsx` (mod) — renders `<AdvisorSection>` below Tags; `handleSaveAdvice`
  saves the card via `addInteraction` (occurredOn=today, topic=`Advice: <topic>`, outcome=content)
  and prepends to the interaction list.

**Verification (evidence) — my own backend on :4020 + real browser on :3020 (baseline §7):**
- To avoid leaning on the external gateway's uptime, I pointed the real backend at a **local stub**
  (`AI_CENTER_BASE_URL=http://localhost:4099`, returning the documented `{success:true,data:{…}}`).
  Backend→stub confirmed at the API level (`advice.provider="stub"`).
- Browser (Alice's profile): typed "ask for a deadline extension" → clicked → **advice card**
  rendered (the stub's multi-section content) with **"stub · stub-1"**. Console clean.
- **Save to interactions** → "Saved to interactions ✓" and **"Advice: ask for a deadline extension"**
  appears in the Interactions section.
- **502 path:** killed the stub (only that pid) → the advice endpoint returns `502` (gateway
  unreachable) → clicking again showed the **friendly unavailable error**, the profile stayed intact,
  **console clean**.
- `bun run build` clean. Servers were free pre-launch (mine); stopped my own instances after — all released.

**Notes for Sober:**
- The real AI Center (`https://ai.develyst.online`) is live per your TASK-012 smoke; I used a stub
  for a deterministic/fast E2E (200 + 502) rather than depend on the external gateway mid-run. Happy
  to do a quick live-gateway confirm too if you want it recorded from the FE side.
- Advice is not persisted (per SPEC-003); "Save to interactions" is the nice-to-have, storing the
  card text in the interaction's `outcome` (interactions have no free-note field — closest fit).
- TASK-015 (note-summary UI) is the optional tier, deps TASK-013 (not built) + this.

**Supplementary — full-chain live-gateway confirm (2026-07-28, at Sober's request; TASK-014 stays DONE):**
- Ran my own backend with the **real** `AI_CENTER_BASE_URL=https://ai.develyst.online` + frontend,
  clicked the advisor in a real browser on Alice's profile (topic "ask for a deadline extension on
  the report"). → **200**, card rendered by **`deepseek · deepseek-v4-flash`**, content was
  profile+topic specific ("Hey Alice, quick check-in on the report timeline …"), **console clean**.
  FE→BE→real AI Center chain verified end-to-end. Servers stopped; ports released.
- Minor (optional, non-blocking): the model returns light markdown (`**Tone:**`); the card preserves
  line breaks but shows the literal `**`. Could render markdown later — cosmetic, out of this task's DoD.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `1aec437` on `dong`). Read `lib/people.ts`
(`getAdvice`/`Advice`/`AdviceResult`), `components/AdvisorSection.tsx`, and the
`app/people/[id]/page.tsx` additions:
- `getAdvice` posts `{topic}` only when non-empty; typed result — `502`→`{unavailable:true,message}`,
  `400`→topic message, else generic. Matches the TASK-012 contract.
- `AdvisorSection`: topic input + button with loading; renders `advice.content` (pre-wrap) +
  `provider · model`; **any failure/502 → the friendly "AI service is unavailable right now —
  please try again."** (keys off `res.unavailable`) with the profile intact — REQ-003 "no crash".
- Save-to-interactions reuses SPEC-002 `addInteraction` (today / `Advice: <topic>` / content in
  `outcome`) with optimistic prepend — no backend change (nice-to-have delivered).
- DoD all 4 met; build clean. Verified via a local stub for a deterministic 200 + 502 — a sound
  call: the FE→BE contract is what this task owns, and the BE→**real** gateway half is already
  proven by Jason's TASK-012 live smoke (real 200, deepseek, profile-specific card). Together they
  demonstrate the full chain.

Accepted. Closing note: I asked Fern (log) for one full-chain live click (FE→BE→real gateway) as
supplementary acceptance evidence — non-blocking; this verdict stands on the code + the two proven halves.
**REQ-003 CORE (012 + 014) satisfies all four acceptance criteria.**
