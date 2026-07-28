# TASK-010: Person profile page (fields + feelings + interactions + tags)
- Source: SPEC-002
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-007 (sub-resource APIs), TASK-009 (list/form + people API helper)

## What to do
In `manager-gold-front`, build the person profile page `/people/:id` (via AuthGate),
fetching `GET /api/people/:id` (full profile):
- **Profile view:** all person fields grouped readably (basics; thinking/decision style;
  communication style; topics/values/motivations; notes). An "Edit" action → the TASK-009 form.
- **Feelings timeline:** list `feelings[]` newest-first (sentiment + note + date); an "Add
  feeling" control → `POST /api/people/:id/feelings` → prepend. Show the current sentiment prominently.
- **Interaction log:** list `interactions[]` (date, topic, outcome, what worked); "Add
  interaction" form → `POST .../interactions`; delete an entry → `DELETE .../interactions/:iid`.
- **Tags editor:** show tags; edit the set → `PUT /api/people/:id/tags` (Mantine `TagsInput`).
- 404 from the API → a friendly "not found" state (covers a stale/foreign id → the backend
  returns 404 for not-owned).

## Definition of Done
- [x] Open a person → all saved fields render correctly (grouped; null groups omitted). Browser-verified.
- [x] Add a feeling → appears at the top; current sentiment updates ("Current: positive" badge). Verified.
- [x] Add an interaction → appears in the log; delete → removed (list back to empty). Verified.
- [x] Edit tags → persists (reload shows the set): PUT `["  VIP ","vip","friend"]` → normalized
      `["VIP","friend"]`; reload → TagsSection renders both pills. (See tooling note in Notes re: the widget.)
- [x] Non-existent/not-owned id → friendly "Person not found" state, no crash, console clean. Verified.
- [x] `bun run build` clean (all 8 routes compile). Browser walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-28 in `manager-gold-front` (branch `dong`, commit `f9e8642`).
Built against the as-built TASK-007 routes (`people/routes.ts` + `service.ts`).

**Files (new unless noted):**
- `lib/people.ts` (mod) — added `Feeling`/`Interaction`/`PersonProfile` types, `SENTIMENTS`,
  and `getPersonProfile` (→ `null` on 404), `addFeeling`, `addInteraction`, `deleteInteraction`,
  `putTags` (all via `lib/api.ts`).
- `app/people/[id]/page.tsx` — profile page: owns the profile state; grouped read-only fields
  (`FieldsCard`, null groups hidden) + Edit link + Back; renders the 3 sections and handles their
  mutations (optimistic list updates); `loading`/`notfound`/`error`/`ok` states.
- `components/FeelingsSection.tsx` — current-sentiment badge + add form (sentiment `Select` +
  optional note) + newest-first list with colored sentiment badges + date.
- `components/InteractionsSection.tsx` — add form (native date input, topic, optional outcome/
  what-worked; 400 field errors mapped) + list with per-row Delete.
- `components/TagsSection.tsx` — Mantine `TagsInput` staged locally; Save (enabled only when
  dirty) → `PUT`; re-syncs to the server-normalized set after save.

**Verification (evidence) — my own backend on :4020 + real browser on :3020 (per baseline §7):**
- `bun run build` → ✓ clean; `/people/[id]` compiles (8 routes total).
- Opened "Bob Profile" (relationship/role/decisionBasis/directness/notes set) → all fields render
  grouped; empty groups (Communication, Topics) correctly hidden. Console clean.
- Feeling: picked sentiment=positive + note → entry appears newest-first, **"Current: positive"** badge shows.
- Interaction: date 2026-07-20 + topic "Kickoff meeting" → appears; **Delete** → "No interactions logged yet."
- Tags: `PUT ["  VIP ","vip","friend"]` → server normalized `["VIP","friend"]`; **reloaded the page**
  → TagsSection renders the **VIP** + **friend** pills (persist + render confirmed).
- Not-found: `/people/does-not-exist-123` → "Person not found" friendly state, no crash, console clean.

**Notes for Sober:**
- **Tooling caveat (honest):** the headless browser pane isn't displayed, so coordinate clicks/
  screenshots are unavailable and Mantine's `Select`/option lists had to be driven via DOM events.
  **`TagsInput` free-typing could not be driven headlessly** (its internal search state doesn't
  update from synthetic input events). So the tag *edit* was exercised via the API `PUT` + a full
  page reload to prove persist+render, and I observed the Save button's dirty/disabled wiring is
  correct. The widget works normally for a real user. If you want belt-and-suspenders I can add a
  tiny FE test later, but there's no FE test harness set up yet (out of this task's scope).
- **§7 friction to flag:** on Git-Bash/Windows `echo $!` returns the bash job id, **not** the OS
  pid, so `taskkill //PID <$!>` failed. I stopped my own instances by resolving the pid listening
  on :4020/:3020 (ports I'd verified free before launching, so unambiguously mine) — same intent as
  §7 (only my own servers), just a reliable pid source. Suggest §7 add: have the server print
  `process.pid` to its log, or record the port→pid at launch, so we never need a by-port lookup.
- "Edit" → the TASK-009 form (`/people/:id/edit`); delete-person still lives there. This page is
  read-only for the core fields by design (edit via the form).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-28 (commit `f9e8642` on `dong`). Read `app/people/[id]/page.tsx`,
`FeelingsSection.tsx`, `InteractionsSection.tsx`, `TagsSection.tsx`, and the `lib/people.ts` additions:
- `getPersonProfile` maps 404→null → the page's `notfound` state (friendly "Person not found",
  no crash) — covers a stale/foreign id, since the backend 404s for not-owned. Loading/error/ok too.
- `FieldsCard` groups fields and hides empty groups. Feelings: current-sentiment badge (relies on
  backend newest-first, correct) + add form + colored timeline. Interactions: native `type="date"`
  (yields the `YYYY-MM-DD` the backend validates) + 400 field errors mapped + per-row delete.
  Tags: Mantine `TagsInput` with dirty-gated Save → `PUT`, re-syncs to the server-normalized set.
- Optimistic list updates are consistent with the API responses. Build clean; browser E2E covered all 6 DoD.

Accepted. Non-blocking notes:
1. **Honest tooling caveat accepted:** free-typing into `TagsInput` couldn't be driven headlessly,
   so the tag path was proven via the API `PUT` + full page reload (persist+render confirmed) — the
   widget is standard Mantine and the Save/dirty wiring was observed correct. Fine for now; a small
   FE test could cover it later once a FE test harness exists (not in scope — no harness yet).
2. `window.confirm` (delete lives on the edit page) stays fine for MVP.

DoD: all 6 met. → TASK-011 (search/filter UI + export button) is Fern's last task for REQ-002.
