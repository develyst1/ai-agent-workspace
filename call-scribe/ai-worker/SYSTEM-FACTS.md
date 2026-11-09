# SYSTEM FACTS — what the owner has said, and how the system actually behaves

> **Created 2026-11-06, on the day this desk opened, by Marie (workspace operations) —
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
> 2026-11-06)** was read out of the repos on the day the desk opened and is evidence of what
> is *there* — not of any decision.

---

## What the product is (owner via Atom, 2026-11-06)

- The requirement, 12:43: *"อยากได้แอปที่บันทึกเสียงโทรเบอร์โทรไลน์โทรเฟสแล้วก็ส่งให้เอไอถอดทรานสคริปต์ออกมา แล้วก็ส่งให้เอไอวิเคราะห์บทสนทนาว่าคุยกันใครคนไหนพูดอะไรแล้วก็บทสรุปว่าเนื้อหาที่คุยกันคืออะไรบ้าง"*. All his words, verbatim: `../project-docs/requirements-from-owner-2026-11-06.md`. [operator 2026-11-06]
- **Device:** the owner alone, on an **Oppo Android phone**, no computer (12:48 *"ใช้เองคนเดียว"*, 13:11 *"ฉันไม่อยากใช้คอมเลย"*, 13:18). Capture = record in the app, or pick an audio file the phone already recorded and upload it. [operator 2026-11-06]
- **Known limit:** Android blocks third-party apps from capturing call audio; normal calls can be recorded by the phone's own dialer; **LINE / Messenger calls have no built-in recorder** (12:48 *"ไลน์อะดิมันไม่มีอัดเสียงอะ"*). Whether any route works on his Oppo is the team's first investigation, reported to him through the PM, **never promised**. [operator 2026-11-06; the Android wording is Atlas's, not yet tested on his phone]
- **LINE test, via Atom 16:15:** not run. The 15:59 words below were the bar only. [operator-delegated: Atom 16:15]
- **Capture standard, via Atom 15:59:** *"ควรจะ ชัดทั้งคู่"*, answering the PM's four-way LINE test question. The PM reads it as the bar (both voices must be clear), **not** as a test result; whether he ran the call is asked back. [operator 2026-11-06; the reading is the PM's]
- **Microphone needs HTTPS (Tanya and Sober, ran it on desktop Chrome 2026-11-06, not run on his Oppo) [team-proposed]:** over plain `http://` on a non-localhost address, `navigator.mediaDevices` is undefined.
- **Data:** call recordings are personal data. Test only with synthetic or self-made audio; **no real recording ever in git**, never in a log or FAILURES entry. [operator 2026-11-06, MARIE.md ORDER 56]

## Repos and environments

- ~~**Stack, front:** mobile-first web app, **never Flutter** (13:12). Atlas recommends an installable Next.js PWA; the SA decides in the first SPEC (`SPEC-101`). [operator 2026-11-06]~~
- **Stack, front (corrected by the PM 2026-11-06):** the owner's 13:12 words say only *"Front End ไม่ใช้ Futter นะ"*: **never Flutter** [operator 2026-11-06]. ⚠️ "Web app" is Atlas's lean (`ATLAS.md:1039`) [team-proposed], not his ruling, and he has not ruled on native Android. Not actionable until he settles it (REQ-101 Q1).
- **Stack, front (settled for now, via Atom 16:15):** never Flutter; start mobile web/PWA; native Android only if the upload path needs it. [operator-delegated: Atom 16:15, under *"ฝากตัดสินใจ แทนฉันไปก่อนนะ"*; the owner may overturn it]
- **Stack, back:** **Bun + Hono or Bun + Elysia only** (13:12). [operator 2026-11-06]
- **Postgres:** the owner's dev Postgres via the `DATABASE_URL` he gives; **never a local Postgres** (13:09; `CLAUDE.md` rule 4). [operator 2026-11-06]
- **AI:** through the owner's gateway (`llm-gateway` skill; 12:43). The gateway takes text only today; transcription + speaker separation needs a new audio endpoint in `develyst-ai` (Team B). ~~Analysis (who said what, summary) uses `/chat` as is.~~ Deploying the gateway is the owner's (or Otto's on his word). [operator 2026-11-06]
- **AI, correction (Silver's read and run at `develyst-ai` 790f63a, 2026-11-06; the PM checked `src/types/index.ts:10`, `src/routes/chat.ts:25`; the rest is Silver's) [team-proposed]:** "who said what" must come from the audio step, since a transcript carries no voices. `/chat` can silently cut long output (ran with a stub), so a summary needs explicit limits and a truncation check. Thai with speakers is not proven on any provider.
- **Secrets / env:** only in each repo's `.env`, never in git; every key listed in `.env.example` with one line; values come from the owner through the PM. [operator 2026-11-06]
- **Git:** branch `atom` in all 3 repos. Commit format `<type>: <summary> (REQ, TASK)`, author `develyst <develyst1@hotmail.com>`; git only by the SA on the owner's three commands relayed by the PM. [operator 2026-11-06]
- **Who made the branches:** the owner ruled at 13:36 that Atom may create them (*"ไม่ใช่ กฏ ห้าม agent สร้าง branchหมายถึง ทีม ไม่ใช่นายatomนายสร้างได้"*). That ruling covers Atom only; **the team still creates no branch.** Base: `develop`, `sit`, `production`, `atom` from `main` on both GitHub repos; on `develyst-ai`, `sit` from `main` and `atom` from the latest branch `D1` (2026-10-20). [operator 2026-11-06]
- `call-scribe-back`, `call-scribe-front` (GitHub): README only, one commit ("Initial commit"), greenfield. All branches at the same commit (72295b5 back, 82438f1 front); `atom` checked out. No `merge-workflow.sh` or `release-workflow.sh` yet. (Marie, read-only survey 2026-11-06)
- `develyst-ai` (GitLab): the live gateway's source, Bun + Hono, **brownfield**; **read its own `CLAUDE.md` first.** No test runner or linter configured (its `CLAUDE.md`). `atom` = `D1` = 790f63a, 17 commits ahead of `main` and 0 behind; `main` = `sit` = 8af3275; `develop` f9699aa; `production` baa91ef. Has `merge-workflow.sh` and `release-workflow.sh`. No UI. (Marie, read-only survey 2026-11-06)
- **The old `develyst-ai/` desk** in this workspace is the Windows-machine desk, dormant since 2026-07-21 and read-only on this box. Do not touch it; gateway work for this app is recorded on call-scribe. [operator 2026-11-06]
- **Environments:** local + the owner's dev Postgres (this project's database only). No dev server or production for this app yet. The deployed gateway and production anywhere are the owner's. [operator 2026-11-06]

## Team (owner via Atom, 2026-11-06)

- 12:41 *"ทีมเอาเหมือนเดิมเลย มีสอง ทีม SA แล้วก็ Tester สองคน"*. Names and split: `TEAMS.md`. [operator 2026-11-06]
- 13:34 *"ก"* = Atlas's option ก: **I-Space paused** in `ACTIVE.md`, and call-scribe may use 3 repos. [operator 2026-11-06]

## Open questions for the owner — asked by the PM, answered here

- Env values (`DATABASE_URL`, the gateway's URL and key): not received yet. 13:09 *"ฉันมีenv ให้ ค่อยมาเอา"*. The PM asks when the first TASK needs them, once `.env.example` lists the keys. `DATABASE_URL` asked 2026-11-06 (SPEC-102 Q2, TASK-104).
- **Env files seen 2026-11-06 17:26, by the PM and Tanya [team-proposed; the PM's check, not his words]:** `call-scribe-back`'s `.env` and the file named `call-scribe-qa-env` both appeared with `DATABASE_URL` set. Values not printed, no connection tried. Compared by script: both hosts remote and the same, different database names, both names mention the project, no "prod" in either. **Who placed them is not recorded**, and that each is this project's own database rests on the name only; the PM reads them as the owner's answer unless he says otherwise. The gateway keys are not there: `develyst-ai` has no `.env`.
- **Env files, settled (corrects "who placed them" above):** owner via Atom 17:25: *"อันนี้ ของ caw back นายก็ใช้ db_url เดียวกัน แค่เปลี่ยนเป็น database ของตัวเอง"*, and 17:26: *"ทำต่อไปนะ"*. Atom placed them: `call-scribe-back`'s `.env` uses database `call_scribe`; `call-scribe-qa-env` uses `call_scribe_test`; same host and user as caw-back's URL. Atom reports both exist and accept connections (the desk has not run this). `LLM_GATEWAY_*` still empty. caw-back's own database stays off-limits. [operator 2026-11-06, via Atom; the placing and the connection report are Atom's]
- **Gateway keys, owner via Atom 2026-11-07 01:37:** *"Q9 keys are in develyst-ai/.env now (GEMINI_API_KEY + XAI_API_KEY and the rest of the file I sent). File is gitignored. Do not print values. Do not commit .env."* PM's check, names only: 17 keys, including `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `TAVILY_API_KEY`, `DEFAULT_PROVIDER`, `AUTH_ENABLED`; no `AUDIO_*_PROVIDER`; ignored by git; mode 600. Live calls and spend: `DECISIONS.md`, 2026-11-07 lines. [operator, via Atom; the check is the PM's]
- **DeepSeek, owner via Atom 2026-11-07 03:49:** *"อย่าเพิ่งใช้ deepseek นะ ตอนนี้ขอใช้ก่อน นายสั่งให้ไปใช้ตัวอื่นแทน"*. The team uses other providers; no end date given. [operator, via Atom]
- **Test budget, owner via Atom 2026-11-07 03:49:** *"ใช้แค่โมเดลเล็กๆ เพื่อทดสอบ ไม่ถึง ครึ่งดอลหรอก ใช้ ครึ่งดอล พอ"*: small models, US$0.50, replacing US$1. Whether spending may start: `DECISIONS.md`. [operator, via Atom]
- **This box pauses, per Atom's diagnosis 2026-11-07 02:14 (not Otto's, not the owner's own):** a KVM guest, *"Evidence points to host/hypervisor pause, not an in-box crash"*: about 5.8 h overnight, about 280 s ~~at about 02:00~~ (**corrected by the PM:** Atom gave no time; "about 02:00" was mine. Known only: between 01:54:10 and 02:10:34, Tanya's measure; F-entry written), `systemd-journald` and `systemd-logind` failed with result watchdog at 00:35, no OOM lines. *"I cannot prevent host pauses from inside the guest; if it keeps happening, use Update Bot's Computer."* A pause can cut a live spend run. Timing measured on this box may include a pause. [Atom's diagnosis, inferred from evidence; not shown as the cause]
- **The pauses are frequent (measured by the PM 2026-11-07 10:32 from Tanya's `tests/harness/q11-watch-2026-11-07.jsonl`, wall clock against uptime):** 14 pauses between 02:11 and 10:32, 49 s to 9733 s, 23229 s in total, about 6.45 h of 8.35 h. `uptime -s` moved 23231 s, which agrees. On this box a process's `lstart` is unreliable: it reads about 08:38 for a process that began at 02:11. [team-proposed; measured] Tanya adds 15 more gaps over 20 s with no uptime lost (1428 s together), so the wall-against-uptime count undercounts stops (TEST-102 § Stub round 1; her inference).
- **The reset of 2026-11-06 17:17-17:18:** Atom, 18:00: it was Atom recovering broken git after the box reboot; Atom *"will not hard-reset away uncommitted work again"*. [Atom's own statement, not the owner's words]
