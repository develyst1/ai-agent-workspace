# TASK-021: Place the approved profile, C5/C8 and the Class 1 additions
- Source: SPEC-005
- Status: **BLOCKED (waiting: Human via Porter — approval of TASK-020's sheet)**
- Depends on: TASK-019, TASK-020, **and the owner's approval**
- Owner: **Fern (FE)**

## Do not start this task yet

It is written now so it is ready the moment the answer lands, and so nobody has to
reconstruct the intent later. **Sober will move it to `TODO` and paste the approved values
in below when Porter reports the owner's answer** — exactly as TASK-017 was unblocked on
2026-09-05. If you find it still says `BLOCKED`, the answer has not arrived; work something
else.

## What to do (once unblocked)

1. **Write `back/knowledge/PROFILE.md`** — the approved body from DRAFT-002 section (a),
   verbatim as approved. `back/` exists at the repo root and is empty; create `knowledge/`
   inside it. **No other file is added to `back/` by this task** — no `package.json`, no
   source, no dependency. That is REQ-006's job, not this one.
2. **Write `back/knowledge/PROFILE.citations.md`** — DRAFT-002 section (b), verbatim.
3. **Apply the approved Class 1 skill items** to `front/src/constant/content/about.ts`
   `SKILL_GROUPS`. New array entries only — no new group, no new type, no component change.
4. **Apply the approved C5** to `front/src/constant/site.ts` `SITE.role`. If C5 moves, also
   replace the hardcoded old headline in **both** `front/src/app/layout.tsx`
   `metadata.description` and `front/src/app/about/page.tsx` `metadata.description`, using
   the exact sentences approved in DRAFT-002 section (d). `layout.tsx`'s page *title* uses
   `${SITE.role}` and needs no edit.
5. **Apply the approved C8** to `front/src/constant/site.ts` `SITE.copyrightYear` — a plain
   string constant. **Do not** replace it with `new Date().getFullYear()`; SPEC-005 §D4 and
   §SQ25 explain why that makes the staleness invisible instead of fixing it.
6. **Apply the approved C9** — one string, `ABOUT_INTRO.title` in
   `front/src/components/partials/About/About.config.ts`. Use the owner's chosen wording
   **verbatim**, whether that is candidate A, candidate B or words of his own. Nothing else
   in that file moves, and `CAREER_STATS.years` stays `'4'` — it is not in play.
   **If he did not answer C9**, leave the line exactly as it is and say so in your notes:
   the site then ships "4 Years experience" on `/` and "Three years…" on `/about`, which is
   a known, recorded state (SPEC-005 §SQ27), not a defect you introduced.

7. **Class 1b — only if he picked option 2 on sheet line 2** (SPEC-005 §D3 as amended
   2026-09-09). Option 2 replaces the one existing `SKILL_GROUPS.ai` item
   `'Generative AI (Gemini, OpenAI)'` with `'Generative AI (Gemini, OpenAI, xAI, DeepSeek,
   Kimi)'` **and** drops `DeepSeek`, `Kimi` and `xAI` from the add-list, so six items are
   added, not nine. If he picked option 1, or said nothing, **that string is not touched** and
   all nine items go in. This is the only shipped string this task may edit outside C5/C8/C9.
8. **Line 6 — only if he named claims to take out.** Sheet line 6 asks whether to keep the
   statements that come from his site rather than his resume. If he names any, **delete** those
   lines from `back/knowledge/PROFILE.md` and their rows from `PROFILE.citations.md`. A
   deletion, never a rewrite: do not reword a claim to make it survive, and do not touch the
   matching string on the site — the site is not in play on line 6. If he said keep, keep all.

9. **The two ICM bullets — only if he answered Porter's line-1 clause** (SPEC-005 §SQ29,
   from your own FQ36). Two adjacent bullets under ICM each describe a CRM AI build of about
   four months: the resume's Text-to-SQL assistant and the site's RAG chatbot. **If he says
   they are ONE project**, merge them into a single bullet using **his** words — not a wording
   you construct — and delete the now-dead row from `PROFILE.citations.md`. **If he says two,
   or says nothing at all, change nothing** and write one line in your notes saying the
   relationship is unstated and was left that way on purpose. Do not merge, split, reorder or
   reword these two bullets on your own judgement in any other case: every such edit asserts
   *same* or *different*, and no allowed source states either.

Nothing outside the approved sheet is applied. If the owner approved three of the four
items and changed the fourth, apply the three and ask here about the fourth.

## Definition of Done

- [ ] `back/knowledge/PROFILE.md` and `back/knowledge/PROFILE.citations.md` exist and match
      the approved draft character-for-character (state how you compared them).
- [ ] `ls back/` shows only `knowledge/` — no code, no config, no `node_modules`.
- [ ] `grep -ri chatuchak back/ front/src/` returns **zero**.
- [ ] The only human names in `back/knowledge/PROFILE.md` are "Nichaphon Sayvav" and "Dong".
- [ ] `cd front && npx tsc --noEmit` — exit 0.
- [ ] `cd front && npm run build` — exit 0, no new error or warning line.
- [ ] `cd front && npm run dev`: the new headline is **seen** in the footer on any page, the
      new footer year is **seen**, and the new skill items are **seen** on `/about`.
- [ ] **If C9 was approved:** `grep -rn "Three years" front/src/` returns **zero**, and the
      new `/about` `<h1>` is **seen**. If it was not approved, state that and leave it.
- [ ] **Class 1b stated either way:** say which option he picked on line 2, and confirm by grep
      whether `'Generative AI (Gemini, OpenAI)'` still ships verbatim or was replaced.
- [ ] **Line 6 stated either way:** list what he asked removed (or "keep all"), and show that
      each removed claim is gone from **both** profile files — and that nothing else moved with
      it (`git diff` on `front/` unchanged by this step).
- [ ] **The two ICM bullets stated either way:** say whether he called them one project or two
      (or did not answer), and if merged, show that the wording used is **his** and that exactly
      one citation row was removed with it.
- [ ] `git status` reported. **You do not commit.**

## Approved values (Sober pastes these in when the answer lands)

_(empty — nothing approved yet)_

## Implementation Notes

(Fern fills this in.)

## Questions

(Fern asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
