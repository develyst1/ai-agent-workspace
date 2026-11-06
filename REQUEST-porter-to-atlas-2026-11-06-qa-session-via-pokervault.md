# REQUEST — porter → atlas — how a QA gets a signed-in session now (PokerVault), as run on smart-scheduler 2026-11-06

- **From:** Porter (PM, smart-scheduler)
- **To:** Atlas
- **Owner's words (chat, 2026-11-06):** *"ฝากไปคุยกับ ATLAS ทำสกิล หรือแก้สกิล หรือแก้กฏให้หน่อย ว่าตอนนี้ เป็นแบบนี้นะ ไม่ต้องสะกิดนะ เพราะไม่ได้เปิดไว้ เขียนไฟล์ไว้เฉยๆ"*
- **Ask:** make a skill, change a skill or change a rule so that every desk follows the flow below without the owner having to explain it again.
- **Related:** `REQUEST-pokervault-to-atlas-2026-11-06-unlocker-call-path.md`, PokerVault's own design request on the same topic. This file is the desk side: what actually ran, and the gaps I hit. Please settle both together.

## The flow as the owner set it today `[owner-approved 2026-11-06, chat, Porter's session]`

The owner's words, from the second run: *"Tanya login เองไม่ได้ — ห้ามหยิบ session เอง ต้องขอจาก PokerVault"*.

1. **The PM writes a REQUEST file at the workspace root:** `REQUEST-porter-to-pokervault-<date>-<site>[-<page>].md`, with three lines:
   - `Site: <key in picklocker/sites.json>`
   - `Need: signed-in session for <QA> to capture <page>`
   - `Environment: sid (read-only)`
2. **The PM waits on the file.** The owner set the timeout to 3 minutes and said a normal reply takes about 1 minute. PokerVault logs in, verifies, and writes `UNLOCKED — session at picklocker/state/<site>.json · confirmed <url> (200) · <time>` (or `NOT_UNLOCKED — <reason>`) under `## Reply` in the same file.
3. **On UNLOCKED, the PM gives the QA the work through `inbox/QA.md` and nudges her.** She loads `picklocker/state/<site>.json` as Playwright storageState, works only on sid and only looks, captures to `ai-worker/tests/evidence/`, and replies in `inbox/PM.md`.
4. **The PM opens the images himself**, then sends them to the owner.

**Evidence:** `smart-scheduler/ai-worker/log/2026-11-06.md`, entries from about 15:20 to 15:40.
- Run 1, People: the owner provisioned the session directly, and the capture was at 15:21.
- Run 2, course: request → UNLOCKED at 15:37 → capture at 15:38. Both request files are at the workspace root, with `-som` and `-som-course` suffixes.

## Gaps for you to design — none of these is written anywhere a desk role reads

1. **Who calls PokerVault, the QA or the PM?**
   - Today's runs went owner → Porter writes the request → Tanya. That fits the desk chain (QA ↔ PM only).
   - `picklocker/README.md` says *"owner 2026-11-06: a desk's QA may call the unlocker directly"*, and PokerVault's request leaves this open.
   - The two need to agree, in one place.
2. **No role file mentions it.** `QA.md`, `PM.md`, `PROTOCOL.md`, `role-qa`, `role-pm` and `workforce-protocol` say nothing about provisioned sessions. A fresh session (amnesia-first) would not know any of this.
3. **How to wait.** PokerVault cannot be nudged (it runs on DeepSeek Harness). I waited with a background file poll, a 3-minute `until grep -q UNLOCKED` loop. Should that be the standard, and what does the PM do on a timeout or NOT_UNLOCKED?
4. **Reusing the session.** Run 1 used `som.json` directly, because the owner had provisioned it in chat. Run 2 required a request even though the same file was already there. Rule needed: is it one request per round, or can a QA reuse a fresh `state/<site>.json`, and what makes one fresh?
5. **What PokerVault verifies.** It verified against `/scheduler/people`, the site's sign-in check, not the page asked for. That is fine for unlocking. The QA still has to confirm the page she was asked for returned 200.
6. **A page name with no route.** "course" has no `/course` route on sid. Tanya captured 2 candidates (the course list and a plan window) and named the URLs. Worth a QA rule: name the exact URL you captured, and capture each candidate when a name is ambiguous.
7. **Personal data in the images.** The screenshots show parents' phone numbers and children's names. They go to the owner only, and they live in `ai-worker/tests/evidence/`, which agents never commit (CLAUDE.md §6). Is a redacted copy needed by default?
8. **Unexplained files.** `picklocker/state/` already held `people.png` and `people-redacted.png` (15:16) before Tanya's run. I don't know who wrote them. Captures should land in one agreed place.

## Boundary

This is a design request. Porter does not edit skills or rules. Marie installs whatever you decide. **Not nudged**, on the owner's instruction, because Atlas's session is not open.
