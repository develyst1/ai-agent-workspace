# REQ-005: Frontend repo runs on bun instead of npm
- Status: DELIVERED
- Priority: HIGH
- Requested: 2026-08-24 by the stakeholder
- Deadline: none

## Problem / Goal

The stakeholder has changed the toolchain of the frontend repo
(`C:\Users\Admin\develyst\code-report\code-report-front`): it is to be installed
and run with **bun**, not npm. In his words (verbatim, Thai):

> "ไปเลย ฉํนมีเปลี่ยน ให้ repo frontend ใช้ bun nextjs แทนนะ ตอนนี้ จากเดิมรันโดย
> npm run devเปลี่ยนเป็น bun run dev แล้ว"

This matters beyond convenience: **every frontend TASK on this project is
verified with npm commands** (`npm run typecheck`, `npm run build`) and with a
**clean working tree**, and both of those are now out of date. The backend repo
already runs on bun (`bun test`, `bun run typecheck` in TASK-014/017), so this
brings the two repos onto one runner.

## What is already true on disk (re-verified 2026-08-24 after his Q34 answer)

**The half-migrated state described below is GONE — he committed it himself.**
Re-checked, not relayed:

- Commit **`d44f523`** ("Refactor code structure for improved readability and
  maintainability", author `dong <nichaphon@smartalliance.co.th>`, 2026-08-24
  11:14 +0700) contains exactly two files: `bun.lock` **added** (+557) and
  `package-lock.json` **deleted** (−4078). Nothing else is in it.
- `git status --porcelain` on `code-report-front` is now **empty**. HEAD is
  `d44f523`, one commit ahead of `f70fb02`.
- **Consequence: the clean-tree gate is OPEN.** Every FE TASK's DoD can be
  ticked again, and Requirement 2 below is satisfied — by him, not by us.
- Still unchanged: `package.json` and its four runner-agnostic scripts
  (`dev`, `build`, `start`, `typecheck`). **Requirement 3 (the team's own
  `npm ...` wording) is therefore the only part of this REQ still outstanding**,
  and it is Sober's to rewrite.

### Original reading (2026-08-24 10:49, kept for the record)

Porter looked at the repo rather than taking the sentence at face value:

- `bun.lock` **exists**, written 2026-08-24 10:36, and is **untracked**.
- `package-lock.json` is **deleted in the working tree** and the deletion is
  **not committed**.
- `node_modules/` was rewritten 2026-08-24 10:36.
- `package.json` is **unchanged** at commit `f70fb02`; its four scripts
  (`dev`, `build`, `start`, `typecheck`) are runner-agnostic, so nothing in the
  file itself names npm.
- `git status --porcelain` therefore prints two lines. **The frontend working
  tree is no longer clean**, and the change belongs to no TASK.

## Requirement

1. The frontend repo must be installed, run and verified with **bun**
   (`bun run dev` in place of `npm run dev`), matching what the stakeholder has
   already done on his machine.
2. ~~The lockfile change now sitting uncommitted in the working tree must end up in
   a **defined, committed state** — the repo must not stay in a half-migrated
   condition that no TASK owns.~~ **SATISFIED 2026-08-24 by the stakeholder
   himself at `d44f523` (Q34 = "ฉันทำไปแล้ว"). No team work remains under this
   item.**
3. Every place the team's own working instructions still say `npm ...` for this
   repo (frontend TASK DoD lines, the standing FE proxy rule that reads "set
   `API_PROXY_TARGET` **before `npm run build`**") must be brought into line, so
   that a future TASK is verified by the command the repo actually uses.
4. Nothing about the product changes: no screen, no copy, no route, no API
   contract, and no dependency added or removed as part of this switch.
5. **npm is dropped from this repo permanently** (Q35 = "ตัด npm ออก", answered
   2026-08-24). `package-lock.json` does not come back, and no working
   instruction of ours may re-introduce an npm command for `code-report-front`.
   Verified while writing this: the repo's own `README.md`, `AGENTS.md` and
   `CLAUDE.md` contain **no** npm command, so item 5 costs nothing inside the
   repo — it lands entirely on Requirement 3, i.e. on the team's own files.

## Acceptance Criteria

- [x] `bun run dev` starts the frontend, and the frontend's own verification
      commands run under bun. **Met 2026-08-24 (TASK-021): `bun run dev` reached
      `✓ Ready in 478ms`, `bun run typecheck` exit 0, `bun run build` green.**
- [x] `git status --porcelain` on `code-report-front` is **empty** again, with
      the lockfile situation resolved deliberately rather than left dirty.
      **Met 2026-08-24 at `d44f523` (his own commit); re-verified by Porter.**
- [x] No frontend TASK is still gated on an `npm` command that the repo no longer
      uses, and nothing of ours can put `package-lock.json` back (Req 5).
      **Met 2026-08-24: open FE tasks (015/016/020/009) carry no npm; the standing
      FE proxy rule on the board now reads `before bun run build`; Porter
      re-grepped and confirmed.**
- [x] The three screens behave exactly as they did at `f70fb02` — this is a
      toolchain change, not a product change. **Met by construction: Porter
      re-ran `git diff --name-only f70fb02 HEAD` = `bun.lock` + `package-lock.json`
      only, zero source diff.**

## Delivery (Porter, 2026-08-24)

Acceptance check done. All four ACs met — three independently re-verified by
Porter against the real repo at `d44f523` (clean tree; only the two lockfiles
differ from `f70fb02`; open FE tasks + the board proxy rule carry no npm), AC 1
on the TASK-021 evidence (SA-corroborated). Status → **DELIVERED**. No product
change shipped; no team code work was ever needed under this REQ (the stakeholder
did the lockfile swap himself). Reported to the human in Thai.

## Constraints

- Stakeholder-mandated technology (bun). Recorded as a constraint, not chosen by
  the team.
- The behaviour freezes already in force (SPEC-002's 10 items, SPEC-003's
  clauses, the Q14 copy bundle) are untouched by this REQ.
- The team may not touch a real database or environment; running the frontend
  locally is the same local-only arrangement as before.

## Out of Scope

- The backend repo (already on bun; nothing asked).
- Any CI/deployment pipeline — this project still has no deployed environment.
- Upgrading, adding or removing any package.

## Questions

### Q34 — ANSWERED 2026-08-24 — **he committed it himself; the FE gate is OPEN**

> answer (2026-08-24, human, verbatim): "ฉันทำไปแล้ว"

- Reading: option **ข** of the three offered — *he* commits, the team does not.
- **Verified, not taken on trust:** commit `d44f523` on `code-report-front`
  carries `bun.lock` added and `package-lock.json` deleted and nothing else;
  `git status --porcelain` is now empty. See "What is already true on disk".
- **Consequence: the only BLOCKING question on this project is closed.** The
  clean-tree DoD row is tickable again, so the FE lane is unblocked as far as
  this REQ is concerned. Requirement 2 is satisfied with no team work.
- **@Sober — what is left of REQ-005 is Requirement 3 + 5 only**: the team's own
  `npm ...` wording (FE TASK DoD lines, the standing FE proxy rule's "before
  `npm run build`"). Those are your files, not mine, and I name no rewrite.

### Q35 — ANSWERED 2026-08-24 — **npm is out, permanently**

> answer (2026-08-24, human, verbatim): "ตัด npm ออก"

- Recorded as **Requirement 5**. `package-lock.json` does not return; no
  instruction of ours may re-introduce an npm command for this repo.
- Checked before writing it: the repo's own `README.md` / `AGENTS.md` /
  `CLAUDE.md` contain no npm command, so this adds no in-repo work — it is
  entirely absorbed by Requirement 3.

### ~~Q34 original~~ (kept for the record)

**Q34 (to the human) — BLOCKING for the frontend engineer's next unit.**
The migration appears to be **half done on his machine and not committed**:
`bun.lock` is untracked and `package-lock.json` is deleted but not committed.
Every frontend TASK's Definition of Done requires a **clean tree**, so the next
frontend unit cannot tick that box while these two lines sit there.
Thai, ready to send:
> "เรื่อง bun: ตอนนี้ในโฟลเดอร์ frontend มี `bun.lock` เพิ่มมาและ
> `package-lock.json` ถูกลบ แต่ยัง **ไม่ได้ commit** ครับ อยากให้ทีม
> commit การเปลี่ยน lockfile นี้ให้เลยไหม (ก) หรือพี่จะ commit เอง (ข)
> หรือให้ทีมทำ migration ใหม่ทั้งหมดเอง (ค)?"

### ~~Q35 original~~ (kept for the record)

**Q35 (to the human) — NON-BLOCKING.**
Does "ใช้ bun" also mean the frontend should stop being *runnable* with npm
(i.e. `package-lock.json` never comes back), or is bun simply the way he runs it
now? This decides whether the deletion is permanent or incidental. Nothing waits
on it — either answer is the same work today.
Thai, ready to send:
> "ต่อจากข้อบน — ให้ตัด npm ออกจาก repo frontend ถาวรเลยไหมครับ
> (ไม่เก็บ `package-lock.json` อีก) หรือแค่พี่เปลี่ยนมารันด้วย bun เฉยๆ?"
