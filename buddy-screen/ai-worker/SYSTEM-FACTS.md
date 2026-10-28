# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-10-28, on the day this desk opened, by Marie (workspace operations) —
> deliberately BEFORE the team's first session, so the team is born with it instead of
> re-learning it.** On another project this file did not exist for six weeks, and the
> owner had to explain the same facts across sessions; twice the team raised a deliberate
> decision as if it were a live incident. **That is a note-taking failure, not a knowledge
> failure.**
>
> **What belongs here:** any fact about the product or how the system behaves that is
> **not** derivable from the code, not a requirement, and not a status. Product
> definitions, deliberate settings, decisions the owner already made, which document is
> authoritative, environment facts.
>
> **The rule that makes it work — the PM's, binding on the PM:**
> **When the owner states a fact about the product or how the system behaves, it is
> written HERE BEFORE the reply is sent.** Not after, not "when I update the board", not
> in a log entry that scrolls away.
>
> **Format:** one fact, one line, with **who said it and when**. Append-only. Never
> compacted, never summarised, exempt from every size gate (`check-hygiene.mjs` exempts
> this file by name). If a fact turns out to be wrong, strike it and write the correction
> under it — do not delete.
>
> **Conventions:** every date is **2026** unless a full year is written · **`(owner)`
> means the `operator` seat — โด่ง (harness `CLAUDE.md` §2)** ·
> **⚠️ CONTESTED** means two sources disagree, both are recorded, and **neither may be
> acted on** until the owner settles it · a line marked **(Marie, read-only survey
> 2026-10-28)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## 🔴 Children's data — the privacy line (owner via Atlas, ORDER 37, 2026-10-28)

- The product handles children's **faces, voices and names**. **No real child data in any desk
  file, test fixture or log. Synthetic data only.** Same rule as the owner's ORDER 36 on the SOM
  fork. Full wording: `PROTOCOL.md` § Hard boundaries. (owner via Atlas, 2026-10-28)

## What the product is (owner, 2026-10-28)

- One line: *"AI for Kids V1 — แอปบนจอทีวี + กล้อง ให้ AI คุยและชวนเด็กทำกิจกรรม"* (owner, via
  Atlas's ORDER 37 answers, confirmed with "ไปเลย" 2026-10-28).
- It is the owner's **own product**; there is no customer yet, so nothing on this desk is ever
  `customer-validated`. (owner, 2026-10-28)
- The full V1 requirement is the owner's own document, filed **verbatim** as
  `requirements/REQ-001-ai-for-kids-v1.md` — that file is the authoritative source for what the
  product does; this file does not restate it. (owner via Atom, 2026-10-28 14:36: *"มีงานใหม่
  ต้องเปิดโต๊ะใหม่ก่อน"*)
- First work: *"อ่าน requirement V1 + spec repo แล้วให้ SA เสนอ stack/สถาปัตยกรรม (role-sa §4.0)
  ก่อนเขียนโค้ด"* (owner, 2026-10-28)

## Repos and environments

- Repos by logical name: `buddy-screen-spec` (the owner's requirement repo — **read-only for every
  role**) · `buddy-screen-front` · `buddy-screen-back`. Paths only in the workspace-root
  `machine.local.md`. (owner, 2026-10-28)
- `buddy-screen-back` is **later**: not cloned on this machine. Until it is, the team has **no BE
  codebase**; the BE seat stays idle and the SA designs the API contract only. (owner via Atom,
  2026-10-28 14:40: *"เอา specกับ frontลงก่อน"*)
- `buddy-screen-spec`: one branch, `main`; HEAD `0e6e911` "Initial commit" (2026-10-28, author
  `D1`); one file, `README.md`, whose whole content is `# buddy-screen-spec`. (Marie, read-only
  survey 2026-10-28)
- `buddy-screen-front`: one branch, `main`; HEAD `8a3280c` "Initial commit" (2026-10-28, author
  `D1`); one file, `README.md`, whose whole content is `# buddy-screen-front`. (Marie, read-only
  survey 2026-10-28)
- Working branch: **not named by the owner** — undecided; the clones sit on `main`. (Marie,
  2026-10-28)
- Stack: **TBD — the SA proposes in `SPEC-001`**; the owner decides. (owner, 2026-10-28)
- Environments: **this machine only** — no dev server, no production. Deploy and design approval
  are the owner's duties. (owner, 2026-10-28)
- Git: per `CLAUDE.md` §6 — the SA types only the owner's three commands, relayed by the PM.
  (owner, 2026-10-28)

## Team (owner, 2026-10-28)

- One team: Porter (PM + BA) · Tanya (QA) · Sober (SA) · Jason (BE, idle until
  `buddy-screen-back` exists) · Fern (FE + designer). Sessions `<Name>-BUD`. Roster:
  `TEAMS.md`. (owner, 2026-10-28)
- Mode: **manual** — one interactive Claude CLI session per role in tmux, **never `claude -p`**.
  (owner, 2026-10-28)

## Open questions for the owner — asked by the PM, answered here

*(none yet)*
