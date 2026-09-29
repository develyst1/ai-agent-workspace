# TASK-477 — Tanya's two leftovers: the un-mute reply follows the chat's language with a blank line · the quick-reply chips speak the menu's vocabulary — BE, XS–S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-25) · **Size XS–S.** No migration. Folds into the REQ-108 round.

## §0 From Tanya's TEST-071 (PASS otherwise), via Porter
Her shot `req107r2-K4-checkin-pick.png` — the reply to `reopen`:
1. The un-mute reply prints the TH list, then `Available Commands:` **with no blank line between the blocks**, and it prints **both languages at once** while every other reply follows the chat's language. Make it consistent with K1: **the chat's language, blank line after the heading.**
2. The quick-reply chips beneath still say **`นักเรียนของฉัน`** while the menu says `คอร์สของฉัน / My Course`.

## §1 🔴 Item 2 has a trap — read this before changing a label
The chip is `btn_children` firing **`action=children`** (`line-webhook.service.ts:830`) — *list my children*. The menu's cell is **`mycourses`** — *My Course*. **They are different commands.** Renaming the chip's label to "My Course" would put a true-sounding word on the wrong action, which is worse than the inconsistency Tanya found: a parent taps "My Course" and gets a list of their children.
**My ruling: change what the chip DOES, not only what it says.** The quick replies should offer **the same four commands the new menu and K1's list advertise** — Add Student · My Course · Check-in · Request Leave — so a parent meets one vocabulary everywhere. `children` keeps working for anyone who types it (TASK-470's rule: retired from the advertisement, not from the code).
⚠️ **That is a behaviour change, so say it plainly in your report** — the chip that listed children now opens the course view. It belongs in Tanya's re-check list, not in a diff nobody reads.

## §2 Build
- The un-mute reply: **the chat's language** (not `both()`), a blank line after the heading — the same shape K1 settled for the toggle. Pinned by value in both languages.
- The chips: the four commands above, **wherever they appear** — say how many places you found; if it is more than one, they should be one list rather than several.
- 🚫 Nothing else about the mute, the menu, or the commands changes.

## §3 Porter's question — answered, and it IS intended
*"A rich-menu tap is still answered during the mute; only free text is silenced."* **That is the design and it stays.** A tap is an unambiguous request from the parent — "check me in", "show my course" — and refusing it would leave the buttons dead with no explanation. Free text is exactly what an admin is in the middle of answering, which is why that is the thing silenced. **Do not change it**; pin both halves (a tap answers, free text does not) so the rule is written down rather than remembered.

## Definition of Done
- [ ] The un-mute reply by value (chat's language, blank line) · the chips' four commands, in one place, by value in both languages · **the behaviour change stated for Tanya** · §3 pinned both ways · suite **count** · tsc 0 · migrations unchanged · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-25) — the un-mute in the chat's language; the chips are the menu's four commands (one list); §3 pinned both ways; 3097 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **3097 pass / 0 fail** (+10; new `src/services/unmute-and-chips-req107.test.ts`, through the real dispatcher) · `tsc` **0** · migrations unchanged (**57 = 57**).

## §1 The un-mute reply (item 1)
`เปิดเมนู` / `reopen` now answers with `t("menu_body", lang)`: **the chat's language only**, with the list's own blank line after the heading (K1's shape).
- By value, TH: `คำสั่งที่ใช้ได้:\n\n· เพิ่มนักเรียน — สูงสุด 5 คน\n· คอร์สของฉัน — คอร์สเรียนที่มี\n· เช็คอิน — ลงทะเบียนเข้าเรียน\n· แจ้งลา`.
- By value, EN: `Available Commands:\n\n· Add Student — Up to 5\n…`.
- 🚫 **Nothing else moved:** `doMenu` takes a body that DEFAULTS to the bilingual list, so typed `เมนู` / `menu` and the Help tap are unchanged (pinned by value).

## §2 The chips (item 2): what they DO, not only what they say
- **Found in ONE place:** `parentActionItems`, called only by `doMenu` (the menu / Help / un-mute replies). It is now built from **`PARENT_CHIPS`, the single list**, in K1's order.
- TH, as label → action: `เพิ่มนักเรียน` → `register` · `คอร์สของฉัน` → `mycourses` · `เช็คอิน` → `checkin` · `แจ้งลา` → `leave`.
- EN: `Add Student` · `My Course` · `Check-in` · `Request Leave`. All are ≤ 20 characters, pinned.
- The two EN labels moved to the menu's words: `Add child` → `Add Student` and `Leave` → `Request Leave`. Both keys are used only by these chips.
- A new key `btn_mycourses` was added. `btn_children` stays defined (typed `children` still works) and is no longer a chip.

## ⚠️ §3 THE BEHAVIOUR CHANGE — for Tanya's re-check list
**The third chip under the menu reply used to be `นักเરียนของฉัน / My children` and LISTED THE CHILDREN (`action=children`). It is now `คอร์สของฉัน / My Course` and OPENS THE COURSE VIEW (`action=mycourses`).** Typing `children` / `นักเรียน` still lists the children.
- Tanya should tap the new chip: it should show the My Course reply, not the children list.
- Mutation B is your trap, "My Course" on the `children` action, and it bites.

## §4 Porter's question: pinned both ways as the RULE
- **Muted + a TAP** (`action=menu`) ⇒ answered.
- **Muted + free text** ⇒ **nothing**.
- By source: `handlePostback` has no mute gate, and the gate lives only on the message path (`route === "muted"`).
- Mutation F (a gate on taps) and mutation G (free text answered during a mute) both bite.

## §5 Pins moved
- `bilingual-flows`: the menu body is now `body: string = tb("menu_body")`, still the bilingual default.
- `line-mute-exit`: the un-mute passes `t("menu_body", lang)`.

## Break-and-watch: `mut477.mjs`, 8 mutations, **8 bite**
Every bite shows real failing tests. `finally` + sha-256 restore, byte-identical each time. CHECKSUM over `git diff` + untracked files, `aa54561f…`, identical before and after. `BASELINE=62` read off a real run on 4 suites.
- A 🔴 the un-mute prints both languages again
- B 🔴 **the trap**: "My Course" on `children`
- C the old chip back
- D an EN chip off-vocabulary (`Leave`)
- E the chips out of the menu's order
- F 🔴 a mute gate on taps
- G 🔴 free text answered during a mute
- H the un-mute always in English

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-25)
Re-run by me, twice: **3097 pass / 0 fail** both times · tsc 0 · 57 = 57 · `PARENT_CHIPS` is one list with one caller.
Three things worth keeping:
1. **The chips were found in exactly ONE place and are now one list.** I asked "how many places — if more than one, make it one", and the honest answer was one, said plainly rather than padded. The list is now the thing that defines the vocabulary, so the next person who changes the menu's words has somewhere obvious to change them too.
2. ✅ **The trap is a mutation now.** "My Course" sitting on the `children` action is mutation B, and it bites — so the exact mistake this task existed to prevent cannot be made again by someone reading Tanya's screenshot and doing what it seems to ask.
3. **`doMenu`'s body DEFAULTS to the bilingual list**, so only the un-mute reply changed language and the typed `เมนู` / `menu` and the Help tap are byte-identical. Narrowing a change to the one caller that needed it, rather than changing the function for everybody, is the right shape.
**§4 is the part I will point at later:** Porter's question is now a **rule with two pins** — a tap answers during a mute, free text does not — and it is pinned **by source** as well (no mute gate on the postback path, the gate living only on the message path). An answer given in an inbox is a memory; this is a rule.
⚠️ **The behaviour change is written up for Tanya in her own terms** — the third chip used to list the children and now opens the course view, and typing `children` still lists them. That belongs in her round, which is where it now is.
