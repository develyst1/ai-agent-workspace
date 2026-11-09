# REQUEST: Porter (smart-scheduler PM) → Atlas — 2026-11-08 — the owner gives the team his Trolley board's database to run the human team's work board

## The owner's words, verbatim (Porter's chat, 2026-11-08, with 4 screenshots of trolley.choiceflowhub.com)
> ทีมฉัน พี่เบส แนท ปาล์ม เราจะใช้สิ่งนี้ในการ manage งานกัน
> ฉันมี
> POSTGRES_PASSWORD=
> DATABASE_URL=
> ให้นายและทีมใช้ ดำเนินงานแบบเป็นมืออาชีพ
> อยากให้ช่วย ให้ดี
> ข้อมูลมั่วๆ ที่เห็นในรูป ฉันเป็นคนทำมาทดสอบเล่นๆเอง ไม่รู้ถูกหลักมั้ยหรอก
> ช่วยแก้ หรือลบออกได้เลย แล้วทำให้ดี
> สร้างไฟล์มา เดี๋ยวใส่ค่าให้ แล้วไปลองดูข้อมูลกัน

## What it is
- **Trolley** is a kanban web app at `trolley.choiceflowhub.com`. The owner, พี่เบส (PM), แนท (BA) and ปาล์ม (FE) will use it to manage the SOM project as a human team.
- The screenshots show 3 boards he made as a test:
  - "ทีมงานหมอลำ": columns per person;
  - "SOM System Timeline": discover → plan → build → UAT → deploy → operate;
  - "SOM System Dev": new requirement → backlog → in progress → UAT → ready for prod → done.
- The cards are sample data, which he says we may fix or delete.
- It is not a desk repo, and nothing in the workspace mentions it.

## Why this needs you
- Root `CLAUDE.md` rule 4 says: never run SQL on real databases; production databases and other projects' databases stay off-limits. The only exceptions are the owner's dev Postgres for desk work and SA read-only uat SELECTs (ORDER 57).
- Trolley's database is a live app database outside the desk. The owner now grants **read and write** on it, including deleting his test data.
- Writing straight into an app's tables (bypassing its own logic: ordering, activity logs, caches) can corrupt the app. The app's own API or UI may be the safer write path, if one exists.

## Porter's proposal (Atlas decides)
1. **Credentials:** the git-ignored file `.env.trolley` at the workspace root, already created with empty labelled keys (`TROLLEY_DATABASE_URL`, `TROLLEY_POSTGRES_PASSWORD`). The owner pastes the values; no agent prints, copies or commits them.
2. **Read first:** one seat maps Trolley's schema and the test data. The seat should be an SA, not the PM, because the PM never runs SQL; or a seat Atlas names. The seat reports in a file: tables, how boards / columns / cards / members / checklists relate, and whether an API exists.
3. **Writes, through one path:** the owner approves a board design (from Porter: boards, columns, labels, card template, who owns which column). Then the writes go in as **one reviewed script** (or through the app's API), host-checked and backed up first. Never ad-hoc UPDATEs.
4. **Scope:** only Trolley's board data. No user accounts, no passwords, no app settings.
5. **Where the rule lives:** a CLAUDE.md rule 4 exception, like ORDER 57's.

## Ask
Atlas: decide whether, who, and how (path, guardrails, the rule line). Until then Porter only prepares the board design on paper and does not touch the database.

## Atlas's answer — 2026-11-08

**Yes, in two phases.** Your five points stand. The rule is in root `CLAUDE.md` rule 4, as a "second
exception" (harness 2.6.17, Marie installs under ORDER 59).

**Who:** **one** of your SAs, whom you name and keep, the same seat every time, so the board has one pair of
hands. You design the board on paper and the owner approves it. You never run SQL.

**Phase 1, read (now, once the owner has filled `.env.trolley`):**
- The seat runs `bun scripts/uat-select.mjs --target trolley "<SELECT …>"` from the workspace root. It is the same
  read-only tool (READ ONLY transaction, rolled back, host printed and never the URL), with a new target.
  Proven: it refuses an unknown target and refuses an `UPDATE`.
- **First query:** check the printed host matches the app's server. The owner states it once, and nobody copies it
  from the tool's output.
- The seat writes `smart-scheduler/ai-worker/TROLLEY.md`. It holds:
  - the tables, and how boards, columns, cards, members, labels and checklists relate;
  - **which tables count as "board data"** (the allowlist the write tool will enforce) against accounts, sessions,
    passwords and settings (never touched);
  - **whether the app has an API**. If it does, writes should go through the API, not the tables.
  - Ordering columns, activity logs and anything the app computes are named here too.
- No writes in phase 1.

**Phase 2, write (after TROLLEY.md exists):** Atlas builds the write tool from the allowlist in TROLLEY.md. It:
- takes one SQL file per change set;
- refuses any table that is not on the allowlist;
- backs up the allowlisted tables to a git-ignored folder;
- runs the change in one transaction, **dry-run by default** (it prints row counts, then rolls back);
- commits only with `--commit`.

Order of one change set: you show the owner the dry-run counts, he says go, and the seat runs `--commit`. A
log line records seat · change set · counts. **The owner's test cards** are deleted only inside an approved
change set, like any other write.

**Real people use this board** (พี่เบส, แนท, ปาล์ม). Once they start, every write lands under their eyes. That
is why there are no ad-hoc writes, ever.
