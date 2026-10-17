# SIZING — Khwan's answers 5–7: the voucher Remark field · D2 (camp confirm) · the P43/P44 locator — @Silver, 2026-10-12
For @Porter → the owner. Read-only analysis of back `d32bdc4` (+ the uncommitted 729/730). **Sizes include +10 %.** Fact vs belief is marked.

## 1. D1's Remark: "Remark เอามาจากตอนสร้างค่ะ" needs a NEW field ⇒ the owner's yes/no
- **Fact:** a voucher has **no note/remark column** today, and the sale form has no remark box. So the Remark line can never print.
- **Build if YES:**
  - **BE:** migration `0068`, one nullable `vouchers.note` text (max 200, the attendee-note rule); the `createVoucher` validator + write; TASK-730 prints it (omit when empty).
  - **FE:** the voucher SALE form gains one optional textarea. **Owner of that form: to be confirmed by claim check.** Reuse an existing "Remark / หมายเหตุ" label; if none fits, one copy line.
  - **Size: S ≈ 1.1 day** (BE ½ + FE ½ + migration/ledger entry). Ships with 730.
- **If NO:** the Remark line stays omitted. Nothing to build.

## 2. D2: a "CONFIRMED SCHEDULE" to the family when a CAMP is booked ⇒ size now, build when the half-day hours land
- **Her answers:** half-day prints its half-day hours (*"ใช่ค่ะ"*); an edit or a cancel **re-sends** (*"ส่งใหม่ค่ะ"*).
- **Fact:**
  - a camp day has ONE window (default 10:00–15:00); **there is NO morning / afternoon hours rule anywhere** (the same gap as P26);
  - the producers (book / edit / cancel a camp package) live in **`camp.service.ts`, Team A's file.**
- **Build:**
  - a new kind + her layout (row 46) in `line-message.ts`;
  - **three emits** (book · edit · cancel) in `camp.service.ts` (a claim from Porter);
  - the half-day lines read the half-day hours.
- **Size:**
  - **M ≈ 1.7–2.2 days** with the half-day hours as **fixed constants** (if Khwan gives one fixed AM/PM pair);
  - **+ ≈ 1.1 day** if the hours are **per camp week** (a column + migration + the camp-week form field), which is a front change too.
- **⇒ The size depends on item 10's answer:** "fixed AM/PM times for every camp" vs "set per camp week".
- 📌 Doing the hours model once also unblocks **P26** (727's held row), so both land together.

## 3. 🔴 P43/P44: Khwan's point kills the "time" locator. Options (analysis only, NO build)
**Her point, verbatim:** *"แต่เวลาผปคกดเมนูมา มันไม่เด้งแชทขึ้นมาข้างบนนะคะ เราจะหาไม่เจอ"*.

**What the code does today (FACT):**
- Every rich-menu cell is a bare **`postback`** with only `data` (`src/lib/line-rich-menu.ts:18, 43`); the admin cell is `action=admin` (`:99`, `:123`), on both menus.
- A postback puts **nothing visible in the chat**, which is consistent with her observation that the chat does not move.
- Menus are published by `scripts/line-publish-menus.ts` + a relink sweep (new menu ids ⇒ relink every linked user). 🚫 `line-remove-menus.ts` is never used.
- A **typed twin** exists: a user TYPING «คุยกับแอดมิน» reaches the same handler (`line-webhook.service.ts:1160`).

| | option | what changes | fact / belief | size |
|---|---|---|---|---|
| **A** ⭐ | **Keep the postback, add `displayText: "คุยกับแอดมิน"`** to the admin cell | LINE shows the button's text in the chat **as the user's own message**; the webhook still receives ONLY the postback ⇒ **the bot flow is unchanged** | **FACT** (LINE Messaging API, postback action): `displayText` is shown in the chat as sent by the user, and no separate message event is sent. **BELIEF:** a visible user message bumps the chat to the top of the OA Manager list. **To be PROVEN on sid with the owner's phone, step 0 first** (press today ⇒ no bump; press after ⇒ bump). | **XS code** (allow `displayText` on the cell type; set it on the admin cell, both menus; pins) **+ a republish + relink sweep** (the owner's hands, existing scripts). ≈ **½ day** + the owner's run. Words: the button's own label, nothing new. |
| B | Change the cell to a **`message` action** (text «คุยกับแอดมิน») | the chat gets a real user text; the webhook receives TEXT, so the **typed twin** handles it instead of the postback path | **FACT:** the twin exists. **RISK (belief, needs checking):** a text can be CONSUMED by a flow in progress (e.g. the registration asking for a phone) where a postback is not, so the button could fail mid-flow. | ≈ 1.1 day + the same republish. **Not recommended.** |
| C | No menu change; find another locator | OA Manager's chat search works on the display name, not on an id. With no name, there is no handle to search | belief (no API gives the admin a searchable handle) | — (no viable option found) |

**Recommendation: A.**
- It keeps the bot's behaviour byte for byte, adds the one thing she is missing (the chat surfaces at the moment of the press), and makes the **"ผู้ใช้ LINE" + time** fallback workable again: the time now points at a chat that is at the top.
- **Order:** reproduce her symptom on sid (OLD menus) ⇒ build A ⇒ republish on sid ⇒ the owner's phone confirms the bump ⇒ only then uat.
- 729 stays as built; only its DRAFT fallback becomes approvable once A is proven.
