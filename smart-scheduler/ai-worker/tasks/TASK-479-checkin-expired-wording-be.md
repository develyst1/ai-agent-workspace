# TASK-479 — a parent is told "โทเคนเซ็คอินหมดอายุแล้ว": no parent should ever read "token", and it is misspelled — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS.** No migration. This release.

## §0 What Tanya saw (TEST-073, late = 0)
Checking in for a class that has ended answers **`โทเคนเซ็คอินหมดอายุแล้ว`**. Two things wrong in one short line:
1. **"โทเคน" / token is OUR word, not a parent's.** A parent knows they are late; they do not know what a token is, and being told one expired reads as a fault in the app rather than a closed door. Every other refusal on these surfaces speaks in the parent's terms.
2. **`เซ็คอิน` is misspelled** — it is `เช็คอิน` everywhere else, including the menu she is looking at while she reads it.

## §1 Build
- The line reads, in the parent's terms and **following the chat's language**: `เลยเวลาเช็คอินแล้ว` / `Check-in time has passed.` — Porter's wording; if you find a nearby refusal already phrased better, use that one and say so, because **one voice matters more than my draft**.
- **Find every sibling:** the same token-expiry line may reach a parent from more than one surface (the session page, camp, the in-chat reply). Say how many you found; if the word "token" reaches a parent anywhere else, fix those in the same pass and list them. 🔑 **Pin that no parent-facing string in `src` contains "โทเคน" or "token"** — that is the rule this defect is an instance of, and it is worth more than the one line.
- Keep the internal wording wherever it is genuinely internal (logs, an admin tool, an API code) — this is about what a parent reads.
- 🚫 No change to WHEN the refusal fires (that is TASK-474's rule, already settled and tested).

## Definition of Done
- [ ] The line by value in both languages · every parent-facing sibling found and listed · **the scan pin (no "token"/"โทเคน" in parent-facing copy)** · the spelling right everywhere · the refusal's timing untouched (its pins unmoved) · suite **count** · tsc 0 · migrations unchanged · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — no parent reads "token"; 4 lines fixed across 3 surfaces; THE RULE pinned by a scan; 3106 pass / 0 fail; 7/7 mutations bite

**Numbers:** `bun test` **3106 pass / 0 fail** (+9; new `src/services/no-token-in-parent-copy-req107.test.ts`) · `tsc` **0** · migrations unchanged (**57 = 57**) · **WHEN the refusal fires is untouched**: TASK-474's window and timing assertions are unchanged; only the words they compare moved (below).

## §0 📌 The spelling: there is NO misspelling in the code
The source said `โทเคนเช็คอินหมดอายุแล้ว`, with **เช็ค**, spelled correctly. `เซ็คอิน` appears nowhere in `src` or in the front. Looking at Tanya's own shot (`qa-2026-09-25/req107-K5-toolate-late0.png`), the LINE font draws ช very close to ซ, which is most likely where the reading came from. So nothing needed a spelling fix. The real faults were the word **"token"**, and 👇 **the language**.

## §1 The siblings: 4 parent-facing lines, 3 surfaces
| # | Where | Was | Now |
|---|---|---|---|
| 1 | `checkin.service.ts`: session link **expired** | `โทเคนเช็คอินหมดอายุแล้ว` (400) | `tb("checkin_too_late")`, 400, **code `CHECKIN_TOO_LATE`** |
| 2 | `checkin.service.ts`: session link **unknown** | `โทเคนเช็คอินไม่ถูกต้อง` (404) | `tb("checkin_bad_link")` |
| 3 | `lib/camp.ts`: camp link **expired** | `โทเคนเช็คอินหมดอายุแล้ว` (410) | `tb("checkin_too_late")`; the 410 and its internal code `CAMP_TOKEN_EXPIRED` are kept |
| 4 | `camp.service.ts`: camp link **unknown** | `โทเคนเช็คอินไม่ถูกต้อง` (404) | `tb("checkin_bad_link")` |
- 🔴 **The third surface is the LINE chat, and it is where Tanya saw it.** The bot's check-in catches the error and replied with its raw `message`, so **line 1 reached the chat, in Thai, even in an English chat.**
  - It now answers `t("checkin_too_late", lang)`, **the chat's language only**, keyed on the new code.
  - The two web pages have no chat language, so they get both languages.
- **Wording:** `checkin_too_late` is Porter's: `เลยเวลาเช็คอินแล้ว` / `Check-in time has passed.`
  - For the bad link I **used a nearby line that was already better**, as you invited: the check-in PAGE already tells families `ลิงก์เช็คอินไม่ถูกต้อง` (front, `invalidLink`). The server now says the same words, for one voice. EN: `This check-in link is not valid.`
- **Kept on purpose (not parent-facing):** `middleware/auth.ts`'s `โทเคนไม่ถูกต้องหรือหมดอายุ` (×3) is the STAFF login. The public check-in routes are mounted before `authMiddleware`, so a parent never passes through it (pinned). API codes (`CAMP_TOKEN_EXPIRED`), OpenAPI docs and log lines are also internal.

## §2 🔑 THE RULE, pinned
`PARENT_FACING` names the 13 files whose strings a parent can read: the i18n table, the bot's replies and handler, the LIFF link, the check-in lib and token lib, camp, both public check-in services, the shop-front, the register service, and the two public routers.
- A scan takes every **human-text** literal in them (Thai, or two words with a space; outside comments and log lines) and asserts that **none mentions "token" or "โทเคน"**. Today: zero.
- **It is not vacuous:** it reads more than 200 strings from the i18n file alone, **and it catches a planted line** in Thai and in English. It does not trip on identifiers, a `?token=` URL, a log line or a comment.
- 📌 **If a new parent-facing file appears, it belongs in `PARENT_FACING`.** The list is explicit on purpose, so it can be read.

## §3 By value
- `/api/checkin` expired ⇒ `400 { error: { code: "CHECKIN_TOO_LATE", message: "เลยเวลาเช็คอินแล้ว\nCheck-in time has passed." } }`.
- Both pages, unknown link ⇒ `404` with `ลิงก์เช็คอินไม่ถูกต้อง` + EN.
- Camp expired ⇒ `410 CAMP_TOKEN_EXPIRED` with the new words.
- **LINE, TH chat ⇒ `เลยเวลาเช็คอินแล้ว` alone; EN chat ⇒ `Check-in time has passed.` alone.**
- Pins moved (words only): TASK-474's two "refused" values and camp's three.

## Break-and-watch: `mut479.mjs`, 7 mutations, **7 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `ee81dd0f…`, identical before and after. `BASELINE=39` read off a real run on 3 suites.
- A 🔴 the session page says "token" again
- B 🔴 camp's expiry says "token"
- C camp's bad link
- D 🔴 the chat ignores its language
- E 🔴 **a NEW parent string mentions a token**: the rule, not the line
- F the expiry loses its code
- G 🔴 the session's bad link

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3106 pass / 0 fail** both times · tsc 0 · 57 = 57 · `CHECKIN_TOO_LATE` in place · WHEN it fires untouched.
📌 **He corrected the report, and he is right: there is no misspelling.** The code says `เช็คอิน`; in Tanya's screenshot LINE's font draws ช close to ซ. **I passed that on as fact without checking the code** — Porter read a screenshot, I repeated it, and Jason was the first person in the chain to look. Worth remembering: a character in a screenshot is not evidence about a string in a file.
Three things I am keeping:
1. 🔴 **The third surface is the one nobody had noticed:** the bot was relaying the raw Thai error **into English chats**. A wording task turned up a language defect, because he looked for siblings instead of editing the line he was given. That is the whole reason the task said "find every sibling".
2. **For the bad-link line he used the check-in page's OWN existing words** rather than my draft — I invited that and he took it. One voice across the surfaces beats a fresh phrasing that is only better in isolation.
3. **The staff login's "โทเคน" is kept, and the reason is pinned:** it is not parent-facing, and the public routes come before auth. Knowing which "token" to leave alone is the harder half of the rule.
🔑 **The rule is a scan over the 13 parent-facing files, proven non-vacuous and shown to catch a planted line** — so the next person who writes "token" into something a parent reads is told at build time. That is the deliverable; the four lines were the instance.
