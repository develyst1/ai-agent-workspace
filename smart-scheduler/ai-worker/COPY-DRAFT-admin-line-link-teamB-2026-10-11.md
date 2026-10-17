# COPY DRAFT — the admin LINE link tied to the web user (TASK-725 BE / TASK-726 FE) — @Silver, 2026-10-11
**For @Porter → the owner. 📋 DRAFT: nothing below ships until approved.** One set, as Sober's sizing asks.

## The LINE chat needs NO new words (checked in code, back `line-i18n.ts`)
- At the code step the person types the one-time code where they typed the shared code before.
- **Every refusal (wrong, expired, already used, too many tries) keeps the SAME reply** `verify_admin_bad` *"รหัสแอดมินไม่ถูกต้อง ลองใหม่อีกครั้ง"*. That is by design (TASK-534, SEC-1: the person typing may be the attacker).
- **Success keeps** `verify_admin_ok`.

## The web (new, for approval)
| where | TH | EN |
|---|---|---|
| header user menu item (next to Change password) | **ผูก LINE** | **Link LINE** |
| the dialog title | **ผูก LINE กับบัญชีนี้** | **Link LINE to this account** |
| the dialog's instruction (code shown big below it) | **เปิดแชท LINE ของร้าน พิมพ์ "สมัคร" → "แอดมิน" แล้วพิมพ์รหัสนี้** | **Open the shop's LINE chat, type "สมัคร" → "แอดมิน", then type this code** |
| under the code | **รหัสใช้ได้ครั้งเดียว หมดอายุใน {minutes} นาที** | **One use only. Expires in {minutes} minutes.** |
| the button to get a fresh code | **ขอรหัสใหม่** | **Get a new code** |
| the linked state (in the dialog) | **ผูก LINE แล้ว ✅ บัญชีนี้จะได้รับแจ้งเตือนของแอดมิน** | **LINE linked ✅ This account gets the admin notices** |
| Users page column header | **LINE** | **LINE** |
| Users page cell | **ผูกแล้ว** / **ยังไม่ผูก** | **Linked** / **Not linked** |
| Users page action | **ยกเลิกการผูก LINE** | **Unlink LINE** |
| its confirm | **ยกเลิกการผูก LINE ของ {name}? บัญชีนี้จะไม่ได้รับแจ้งเตือนของแอดมินอีก** | **Unlink {name}'s LINE? This account will stop getting admin notices.** |
| old "LINE admins" panel, an account linked the old way | **ผูกด้วยรหัสเดิม (ไม่ทราบชื่อ)** | **Linked with the old code (name unknown)** |

📌 Words I checked and **reused, not new:** the Unlink confirm's buttons (`common.cancel` / the existing confirm label), and the panel's existing Remove action.

## Revised 2026-10-11 (after Bob's contract)
- 🗑️ **Dropped the "coach account" line:** the «ผูก LINE» item is now HIDDEN for a coach account (TASK-726), so that sentence would never show.
- **Two server backstops, LISTED under the owner's rule (SYSTEM-FACTS 2026-10-07: "a refusal no screen can reach ships with engineer wording, listed, not approved"):**
  - `LINE_LINK_NOT_FOR_COACH` (403): no screen reaches it, because the item is hidden for a coach (pinned in TASK-726);
  - `USER_DISABLED` (403): no screen reaches it, because a disabled user is refused at sign-in first (401).
  - Their Thai is Bob's engineer wording, labelled LISTED in code. 🔴 If either ever becomes reachable, it returns to the approval queue.
