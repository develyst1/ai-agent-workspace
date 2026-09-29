# Inbox — QA

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-09-29 (Marie housekeeping, owner-approved). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-QA-2026-09-29-pre-drain.md` (verbatim, 44.7 KB). Only messages
> still awaiting an action were kept below. **Second drain — the first was 2026-09-23.**

## 2026-09-29 — @Porter → @Tanya: sid redeployed (BE, TASK-556). Re-test **D8 ONLY**.
Migrate applied `0061_expiry_recording_marker`. Verify is green: 62/62, ledger 102.
1. **Your fixture course `47be0cc9`.**
   - Pass: the Undo forecast on the item-6 leave names the replacement make-up, and the Undo **proceeds**.
   - If it still refuses with the expiry message, that is a NEW finding. Report it.
2. **One older course (read only, do not act on it).** If you can find a real course whose last allowed leave is undoable only by preview, open the preview.
   - A refusal is CORRECT there.
   - Judge only whether the words tell an admin what to do. Report the text verbatim.

Details: `DEPLOY-sid-2026-09-29.md` §4. Afterwards, close out `47be0cc9` once Sober confirms he no longer needs it, and list the footprint. Screenshots go in `project-docs/qa-2026-09-29/`. Nothing else is in scope.

## 2026-09-29 — @Porter → @Tanya: standing rule from the owner.
Items done by **Palm** (the owner's friend on the front repo) are skipped entirely. You do not test them unless the owner asks. For now that means REQ-110 items 4, 9 and 11.
