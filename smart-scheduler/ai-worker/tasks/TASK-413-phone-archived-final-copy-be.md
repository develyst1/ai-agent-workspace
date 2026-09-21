# TASK-413 — The LINE `phone-archived` reply: the owner's final bytes replace the placeholder (`REQ-098`, TASK-411 Finding B)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-20) · **Size XS.** No migration (47 = 47). `sid`; joins the batch.

## §0 The words (owner via Porter, 2026-09-20)
`verify_parent_archived` — TH **เบอร์นี้เคยลงทะเบียนไว้แล้ว กรุณาติดต่อร้านเพื่อคืนสถานะ** · EN **This number was registered before — please contact the shop to restore it.**

## §1 Do
- Replace the placeholder value of `verify_parent_archived` in `line-i18n.ts` with the bytes above; drop the 📖 PLACEHOLDER comment; the pin goes from FORM to VALUE (both languages, the webhook's `phone-archived` branch through the reply mapper). Nothing else.

## Definition of Done
- [ ] Suite, **count** · tsc 0 · 47 = 47 · the two strings by value · 🔑 mutation (placeholder back) bites · report here + `inbox/SA.md` + log.

---

# 📤 REPORT — @Jason → @Sober (2026-09-20)

✅ **DONE (code).** **2554 pass / 0 fail**, 197 files · `tsc --noEmit` clean · 🚫 no migration (**47 = 47**).

- **`lib/line-i18n.ts` `verify_parent_archived`** — the owner's bytes: TH `เบอร์นี้เคยลงทะเบียนไว้แล้ว กรุณาติดต่อร้านเพื่อคืนสถานะ` · EN `This number was registered before — please contact the shop to restore it.` The 📖 PLACEHOLDER comment is gone (the entry now names the owner + the date). Nothing else in the product changed.
- **The pin (`archive-parent-req098.test.ts`) went from FORM to VALUE:** both strings byte-for-byte through `t()`; the placeholder sentence and the old words (`reactivate` / `แอดมินเพื่อเปิดใช้งาน`) pinned ABSENT; the webhook's `phone-archived` branch maps to this key and sits before the success branches.
- ⚠️ One unrelated pin repaired on the way: the human's commit stored `drizzle/0044_user_teacher_link.sql` with CRLF endings, and the REQ-097 file's header pin matched a `\n` byte sequence — the read is now normalised (`\r\n → \n`); the pin itself is unchanged. No product file touched by that.

## 🔑 Mutation — four, `finally`, checksum — all bite
A the placeholder TH back · B the placeholder EN back · C EN missing (falls back to TH) · D the webhook maps the outcome to the other-family reply. Every restore byte-identical.

🚫 No deploy request. ⛔ Only you mark this DONE. ▶️ Next: whatever waits on the board.
