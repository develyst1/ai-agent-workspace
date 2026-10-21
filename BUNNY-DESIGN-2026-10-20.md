# Design — Bunny and the memory web: memory that works like a person's (2026-10-20)

> **This workspace's copy** — taken 2026-10-21 by Marie from the sibling workspace `ai-agent-workspace-entronica`,
> where this file is the design of record (`MARIE.md` ORDER 29.2). Real people's names and logins are replaced by
> role words in §2, §4 and §10, as the source's own rule requires for any copy outside it (sibling
> `MARIE-ORDER-2026-10-20-memory-web-full-build.md` §4); every other line is verbatim. The full original stays in the
> sibling. ⚠️ The night time (23:00), pilot desk and test (§7–§10) are the sibling's; here Bunny's schedule is
> 05:00 (`MARIE.md` ORDER 27).

> Status: **approved by the operator 2026-10-20** (*"ผ่าน 23:00 ได้ PM ใส่ talks ได้ด้วย ลองแบบเล็กเลย"*) — night run
> 23:00; the operator and the PM may both drop talk files; next step: the small test (§7).
> Earlier status: draft for the operator's review. Brainstormed with the operator on 2026-10-20 (Atlas session), from
> `REPORT-porter-2026-10-20-memory-like-a-human-for-atlas.md`. Revised the same day to the operator's model —
> *"ทำป้ายบอกทาง … ชี้ๆ ทางไป เหมือนความจำแบบใยแมงมุม"*. Nothing is built until he approves this file.

## 1. Why

The operator: *"มนุษย์ … เหลือไว้แค่จุดเชื่อมต่อสำคัญของเรื่องนั้นๆ … แล้วค่อยนำไปย้อนนึกถึงข้อมูลในอดีต … ฉันไม่อยากให้นาย
หรือทีมนายลืมอะไรในการทำงาน"*. In every recent miss the knowledge already existed — in a chat, a recording, a file.
What was missing was the path to it: a mock user asked for twice, a lead's message style forgotten, a nickname
replaced by an English name, a deploy chain re-derived mid-task.

**Success:** the operator stops re-explaining things he already said, and a fresh session acts as if it remembered.

## 2. The principle — a web, not a pile of notes

A person does not search a pile of notes. They think of **one thing** — *the lead* — and what is tied to it comes along:
he likes short messages, he already gave a mock user, he reviews our PRs. Memory is **knots tied by threads**.

- **Knot (ปม)** — one thing with a name: a person, a repo, an environment, a module (JE, MJ), a procedure (deploy
  LOADTEST), a recurring question. One short page.
- **Thread (เส้นใย)** — a link from one knot to another: `[[mock user]]` inside `lead.md`.
- **Signpost (ป้ายบอกทาง)** — `MAP.md`: every knot's name and the other names people use for it, so any of those words
  leads to the knot.
- **The full record** — chats, talks, desk files — stays where it is; each line on a knot points into it.

```
                 [lead]────────────[mock user]
              (lead, terse)        (given 10-19)
                    │
[usb-oda] ────── [PR & review] ──── [reviewer]
 (many repos)         │
    │            [git: operator commits & pushes in VS Code]
  [JE] ── [MJ]
    │
 [deploy LOADTEST] ── [AppRat CI/CD] ── [helm] ── [argo]
```

## 3. Decisions taken with the operator (2026-10-20) `[operator 2026-10-20]`

| # | question | answer |
|---|---|---|
| 1 | Which moment matters most | **B** about to act (message a person, git, deploy, ask an owner) → **C** meeting something seen before → **A** a new session |
| 2 | What counts as the full record | **chat history** of the role sessions → **talks with outside people** (recordings, NotebookLM, chat screenshots) → **desk files**. Not Hive. |
| 3 | How memory is built and used | a **web of knots and threads** (this file, §2), woven nightly; signposts lead in; a `recall` tool digs into the full record |
| 4 | Who weaves, when | an automatic **nightly run** by a separate librarian session; the operator can trigger it any time |
| 5 | Approval of what she writes | **used at once, checked after**: every line cites its source; a wrong line is struck and never re-made |
| 6 | When the web is offered | **A** every operator prompt · **B** before writing a draft to an outside person · **C** before git · **D** before touching an environment. Not before messages between roles. |
| 7 | The weaver | **Bunny (บันนี่)**, a librarian; she/her |

## 4. How it works, step by step

1. **Boot (moment A).** Every role reads `CORE.md` (unchanged) — its first line points at `memory/MAP.md`, the centre
   of the web.
2. **A name appears** — in the operator's prompt, in a draft to an outside person, in a git or environment command.
   A hook looks the words up in `MAP.md`. Names and their aliases are matched **exactly** (a known word, not a
   guess), so *"<nickname>"*, *"<GitHub login>"* or *"lead"* all reach the same knot.
3. **The knot comes to the role.** The hook adds to the turn: the knot's first lines and the names of its threads —
   `จำได้ [lead]: lead · ชอบสั้น ทำเลยแจ้งทีหลัง · ให้ mock user แล้ว → [[mock user]] · รีวิว PR → [[PR & review]]`.
   At most 3 knots per turn; no name found → nothing added.
4. **The role follows threads when it needs more** — opens `memory/mock user.md`, or runs
   `recall <desk> <knot> --deep` to read the chat or talk a line points to.
5. **Each night Bunny weaves.** She reads the day's record and: adds new facts to existing knots, makes a knot for a
   new name, ties threads between knots that came up together, adds aliases to `MAP.md`, and strikes what changed.

## 5. Components

**5.1 Bunny — a workspace role** (`BUNNY.md` at the workspace root, written by Atlas; like Marie, not a desk role).
She writes only `<desk>/ai-worker/memory/` and one line per suggestion in `<desk>/ai-worker/inbox/PM.md`. Never another
file, never git, product repos or environments. Started by the schedule or by the operator:
`อ่าน BUNNY.md — ถักความจำ <desk | ทุกโต๊ะ> <date | วันนี้>`.

**5.2 The web — `<desk>/ai-worker/memory/`**
- `MAP.md` — one line per knot: `[[name]] · aliases: a, b, c · kind (person | repo | env | module | procedure | question)`.
  Cap 12 KB.
- `<name>.md` — one knot: line 1 = what it is in one sentence; then one fact per line, each with its source
  (`file:line` or `chat <session> <date time>` or `talk <file>`) and date; threads as `[[other knot]]`. Cap 4 KB —
  longer splits into child knots. A fact that changed is struck, the new line under it.
- Plain Markdown with `[[links]]`: the folder opens as a graph in Obsidian, so the operator can *see* the web.
- Never written: passwords, tokens, customer numbers, personal talk unrelated to work — a knot names the file that
  holds a secret instead. A gate regex refuses lines that look like one.

**5.3 The full record (read-only)**
- *Chats:* `scripts/memory/extract-day.mjs` turns one day of Claude session transcripts into a **digest per desk** —
  only the operator's messages, the role's replies to him, cross-session messages, questions and answers; no tool
  output. `<desk>/ai-worker/memory/digest/YYYY-MM-DD.md`, **git-ignored**: chat text stays on this machine.
- *Talks:* `<desk>/ai-worker/talks/YYYY-MM-DD-<who>-<topic>.md` — transcripts, NotebookLM notes, screenshot text.
- *Desk files:* as today.

**5.4 Recall — `scripts/memory/recall.mjs`**
- `recall <desk> <words…>` → the knots those words reach through `MAP.md`, with their threads.
- `--deep` → also the digest / talk / file lines the knot's sources point to.
- `--hook` → the short form for hooks (≤ 3 knots, first lines + thread names), or nothing.
- Every hook hit is logged to `memory/hits.log`; a knot reached on most days → Bunny suggests a CORE.md line to the PM.

**5.5 Hooks for the four moments**
- Which desk a session belongs to: the `/desk` skill writes `.claude/session-desk/<session_id>` →
  `<desk> <Name> <ROLE>` at handshake; a session without it (Atlas, Marie, Bunny) gets nothing.
- **A** `UserPromptSubmit` on the prompt · **B** `PreToolUse` Write/Edit of outside-message drafts
  (`project-docs/**/owner-notes/**`, `**/pr-bodies/**`, `**/drafts/**`) on the file's text · **C** `PreToolUse` Bash
  `git …` / `gh pr …` on repo and branch names · **D** `PreToolUse` Bash with environment tools or hosts on their names.
- Adds context only; never blocks.

**5.6 Schedule** — a local scheduled task each night at 23:00: `อ่าน BUNNY.md — ถักความจำ ทุกโต๊ะ วันนี้`. Created only
with the operator's yes. A missed night is caught up next time (every day since her last digest).

## 6. What can go wrong, and the answer

| risk | answer |
|---|---|
| A thing new today has no knot yet | Bunny makes it tonight; until then `recall --deep` searches the record |
| A knot holds an old fact | Bunny strikes it and writes the new one under it, with its source |
| The operator calls something by a new word | Bunny adds the word to that knot's aliases in MAP.md |
| Bunny writes something wrong | anyone strikes it; she keeps `memory/struck.md` and never writes it again |
| The web grows messy | knots ≤ 4 KB, MAP ≤ 12 KB, gate-checked; a long knot splits into children |
| A role ignores the knot it was shown | it is in the turn, not in a file to open — the same way the wake-by-id hook worked |
| Text a role types only in chat is not seen by hooks | outside messages are drafted in files (humble-team-messages), so moment B fires |

## 7. How we know it works — a small test first

1. Bunny weaves usb-oda from the 2026-10-19/20 record only.
2. Replay five real misses from Porter's report: the mock user, the lead's style, the nickname, the deploy chain, the
   reviewer login — as the operator's prompt or the draft/command that went wrong.
3. **Pass = the right knot reaches the turn in at least 4 of 5.** Then build fully. Below that, we know where it breaks
   before investing more.
4. After rollout, two weeks: count the operator's re-explanations and FAILURES of the kind "the answer was already
   recorded". Both should fall.

## 8. Rollout and who builds

1. The small test (§7) on usb-oda. 2. One week pilot on usb-oda. 3. intelligence-space and the template (v1 gets the
tools and an empty `memory/`, never a digest or a name).

Atlas writes `BUNNY.md` and the skill lines; Marie builds `extract-day.mjs`, `recall.mjs`, the hooks, the `/desk`
session map, the gate checks and folders through orders; the schedule is created with the operator's yes.

## 9. Open for the operator

- Night run time (23:00 proposed).
- Who may drop talk files: only you, or the PM too?

## 10. Small test result (2026-10-20, Atlas)

Bunny's first weave of usb-oda 2026-10-19/20: 45 knots, 328 aliases, MAP 6.5 KB, largest knot 2.5 KB, no secrets.
Five cases written **before** the web existed (scratch file), replayed through `recall.mjs --hook`:

*(This copy: the case table names real people, so it is reduced to counts — the full table is in the sibling's
original.)* 5 cases: case 1 (asking the lead for a test user, in the operator's own wording) **partial** — the lead's
knot and a related one were reached, the mock-user knot was not, because the operator's words were not an alias;
cases 2–5 (a draft to the lead, a review request by a reviewer's English name, a deploy-and-sync command, a
`gh pr create --reviewer` command) **yes**.

**4 of 5 full + 1 partial → passes the bar (≥ 4).** Lesson: aliases decide recall — case 1 failed on the operator's
own wording. Bunny's next run adds the words people used for a thing (test user / user ทดสอบ / บัญชีทดสอบ).
Bunny's own note: very common aliases (operator, Sync) may crowd the top 3 — watch hits.log in the pilot.

## 11. Feeling-weighted memory (operator, 2026-10-20) `[operator 2026-10-20]`

*"สิ่งที่เอไอที่ดีควรมี ไม่เพียงแต่ความจำที่ครอบคลุม แต่เป็นความจำที่เกี่ยวข้องกับความรู้สึกผู้ใช้ต่างหาก"*. Bunny reads each
operator message for its feeling (💚 glad: praise, thanks, success accepted · 🔴 upset: rebuke, "งง", repeated asks,
frustration), ties it to what caused it, and writes it on that knot with the mark and his words; a repeat strengthens
the line (×N). `recall.mjs --hook` shows marked lines before plain ones; marked lines are never struck for age, only
when he changes his mind. Rules: BUNNY.md § "Remember what the operator felt".
