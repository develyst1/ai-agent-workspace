# TASK-041: Admin polish — readable Save buttons, and "Draft with AI" only on fields that are prose
- Source: SPEC-010 (D7; TASK-037 review ⚠️ 1 + ⚠️ 2)
- Status: **DONE** (2026-11-01, Sober — after rework 1; see §Rework 1 — Review. Was REVIEW 2026-11-01, Fern)
- Depends on: TASK-037 `DONE` (met)
- Owner: Fern (FE)

**Zero real calls. No git write. `admin/` only:** `src/components/AdminApp.tsx`, `src/components/Posts.tsx`, `src/components/FieldInput.tsx`.

## What to do

1. **Save contrast** — the two Save buttons (`AdminApp.tsx:~227`, `Posts.tsx:~232`) use `variant="filled"`, measured ~2.5:1 (white on the
   theme's violet). Switch both to `variant="light"`, as you did for Draft. Do **not** change the theme (it is the public site's).
2. **Draft button placement** `[SA-decided]` — show "Draft with AI" on every `longtext` field and the post body, and on a `text` field
   **only when its key matches** `/(title|heading|eyebrow|lead|label|role|summary|excerpt|description|availability|quote|text|action)$/i`.
   Never on `id`, `slug`, e-mail, phone, URLs/images, years/periods/dates, `nickname`, `name`, `location`, `category`, `author`, `readTime`.
   Put the rule in one function in `FieldInput.tsx` with a comment pointing here.

## Definition of Done

- [ ] 1. `cd admin && bunx --package typescript@5 tsc --noEmit` → 0; `bun test` green.
- [ ] 2. Measured contrast of both enabled Save buttons ≥ 4.5:1 (paste the numbers).
- [ ] 3. Picture of the `site` editor and one `projects` item: Draft appears under availability / summary / title, not under id / email /
      phone / name / link. List which fields show it per document in your notes (one line per document).
- [ ] 4. `git status --short`: only the three files; zero real calls; servers stopped.

## Implementation Notes
Fern, 2026-11-01. `D1` @ `b068fba` (uncommitted tree as found). No git write. **Zero real calls** (no Draft pressed; back/'s gateway on
a closed port, 3998). Theme untouched.

**Files (the three named).** `AdminApp.tsx` and `Posts.tsx`: Save `variant="filled"` → `"light"`, one comment each saying why.
`FieldInput.tsx`: `PROSE_KEY` (your regex, verbatim) + `draftable(kind, path)`: `longtext` → yes; `text` → the key after the last `.`
matches `PROSE_KEY`; anything else → no. The comment points here. `withDraft` asks it, and `url` now goes through the same function
(always no), so the old url special case is gone. The post body button (Posts.tsx, TASK-037) is unchanged.

**DoD 1.** `cd admin && bunx --package typescript@5 tsc --noEmit` → exit 0; `bun test` → 13 pass / 0 fail.

**DoD 2.** Enabled Save, measured headless on the running admin (one keystroke to dirty the editor, never saved; translucent
backgrounds composited onto the panel). Document Save: `color rgb(242,238,255)` on `rgba(224,215,255,0.15)` → **12.60:1**. Post
editor Save: same → **12.60:1** (was ~2.5:1 filled). Pictures: `project-docs/fe-task041-2026-11-01/03-post-editor-save.png`.

**DoD 3.** Pictures `01-site-editor.png` (Draft under Role and Availability only) and `02-projects-item.png`. Every document walked by
`tests/harness/task-041/probe.mjs` (first list item opened); ✓ = carries "Draft with AI":
- site: role ✓ · availability ✓ (none on name, nickname, location, email, phone, phoneHref, copyrightYear)
- copy.home / about / services / portfolio / blog / contact: every eyebrow / title / lead / metadata.title / metadata.description ✓,
  plus HOME_LEAD, CAPABILITIES_*, SERVICES_CTA.title / body / action ✓. Not on `copy.portfolio.NO_PUBLIC_DEMO`
- capabilities, values: title ✓ · description ✓ (none on id)
- career_stats: label ✓ (none on id, value)
- quotes: th ✓ · en ✓ (longtext) (none on id)
- experience: role ✓ (none on id, organisation, period, body, tags, featured)
- skill_groups: label ✓ (none on id, items)
- certificates: title ✓ (none on id, issuer, year, imageUrl, credentialUrl)
- testimonials: label ✓ (none on id, image)
- services: description ✓ (none on id, service, techStack)
- process_steps: title ✓ · description ✓ (none on id, step)
- projects: title ✓ · summary ✓ (none on id, highlights, techStack, link)
- contact_channels: label ✓ (none on id, value, href, note)
- faq: answer ✓ (none on id, question)
- ai_profile: markdown ✓ · posts: body ✓ (TASK-037)

**DoD 4.** `git status --short admin .gitignore` = ` M .gitignore` + `?? admin/` (as before: admin/ is untracked since TASK-035; my
change is the three files inside). Ports 3998/4014/4015 free; scratch store deleted; no `back/data/`.

**Observations, not changed (all follow your rule as written; the owner sees each one):**
1. ⚠️ **quotes.th / quotes.en get the button** (longtext). They are real client quotes, which must stay verbatim (PROTOCOL: no
   invented testimonial). An AI "draft" of a client's words is the one place the button invites a wrong edit. Excluding `quotes[]`
   is one line.
2. `faq.question`, `experience.organisation`, `services.service` and `copy.portfolio.NO_PUBLIC_DEMO` are sentences or short labels
   with no button (their keys don't match). Fine by me, just so you know.
3. `experience.body` and `projects.highlights` are `lines` fields (one point per line), so they have no button either. Prose, but a
   kind the rule doesn't cover.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: REWORK 1** (Sober, 2026-11-01) — the build matches my rule exactly; the rule itself has one gap (mine, not yours). Zero real calls.
- Re-run: `admin bunx --package typescript@5 tsc --noEmit` → 0; `bun test` → 13 pass / 0 fail. Read `FieldInput.tsx:22-31`: `PROSE_KEY`
  verbatim, `draftable()` one function with the pointer comment, `url` folded in. Both Saves `variant="light"` (`AdminApp.tsx:228`,
  `Posts.tsx:233`), measured 12.60:1 (≥ 4.5 ✓), theme untouched. DoD 1–4 met.
- **Rework 1 `[SA-decided]` — your observation 1 accepted:** `quotes[]` are clients' own words and must stay verbatim (no invented
  testimonial), so **no "Draft with AI" anywhere under the `quotes` document** (th and en). In `draftable()`: if the path's first segment
  is `quotes` → `false`, before the `longtext` rule; extend the comment ("client quotes stay verbatim — TASK-041 rework 1").
  DoD for the rework: tsc 0, `bun test` green, the probe's `quotes` line shows no ✓, every other line unchanged (paste both lines).
- Observations 2 and 3 — **accepted as is** (no button on those keys or on `lines` fields); no change.

### Rework 1 — Implementation Notes
Fern, 2026-11-01. Zero real calls; no git write. One change in `admin/src/components/FieldInput.tsx`: the first line of `draftable()` is
`if (path.split(/[.[]/)[0] === 'quotes') return false;`, so it runs before the `longtext` rule. The doc comment now ends with "Never
anywhere under `quotes`: client quotes stay verbatim — TASK-041 rework 1."
- `cd admin && bunx --package typescript@5 tsc --noEmit` → exit 0; `bun test` → 13 pass / 0 fail.
- Probe re-run on a fresh seeded scratch store (full output: `project-docs/fe-task041-2026-11-01/rework1/probe-output.txt`):
  - before: `Client quotes (also About, Services): quotes[0].id · quotes[0].th ✓ · quotes[0].en ✓`
  - after:  `Client quotes (also About, Services): quotes[0].id · quotes[0].th · quotes[0].en`
  - Every other line is identical to the first run. That covers the 15 list/object documents as listed in §Implementation Notes, and the
    six "Page text" documents with 58 ✓ in total (6 + 20 + 11 + 5 + 5 + 11, as before). Both Saves still measure 12.60:1.
- Ports 3998/4014/4015 free; scratch store deleted; `git status --short admin .gitignore` unchanged (` M .gitignore`, `?? admin/`).

### Rework 1 — Review

**Verdict: DONE** (Sober, 2026-11-01). Zero real calls in review.
- Read `FieldInput.tsx:22-32`: `quotes` check is the first line of `draftable()`, before `longtext`; comment extended as asked.
- Re-run: `admin bunx --package typescript@5 tsc --noEmit` → 0; `bun test` → 13 pass / 0 fail.
- Probe before/after: `quotes[0].th` / `.en` lost the ✓, every other line identical (58 ✓ on the page-text documents, as before);
  Saves still 12.60:1. Rework DoD met.
