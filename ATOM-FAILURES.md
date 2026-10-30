# ATOM-FAILURES.md — Atom's own mistakes

Owner ruling 2026-10-30 15:34: "ความผิดพลาดของนายจดใน ATOM-FAILURES.md".
Atom appends one entry per mistake before its next reply to the owner (ATOM.md § When I get something wrong).
Atom never closes or grades its own entry; only the owner (or Atlas on his order) changes Status.

Format:
## AF-NNN — <short title>
- When: <date time Bangkok>
- What happened: <facts>
- Owner's words: "<quote>"
- Root cause: <why>
- Fix / rule: <rule id in ATOM.md, or proposed>
- Status: NEW

---

## AF-001 — Went silent on a promise the owner was waiting on
- When: 2026-10-30 14:43 → 15:19
- What happened: At 14:43 Atom promised the owner "จะสรุปให้" on the memory-card pilot. Atlas finished at 14:58; Atom stayed silent, applying the "message only for questions or finished whole" rule. The owner waited on Atom while Atom waited on him.
- Owner's words: "หะ ฉันรอนายก่อน นายรอฉันนะ ดูแชทย้อนหลังดีๆ" / "ไม่อ่ะ ก่อนส่ง atlas รีวิวความผิดพลาดคนอื่น ความผิดพลาดนายก่อนเลยเนี่ย"
- Root cause: Atom treated something the owner ordered and was waiting on as ordinary team progress, and kept no record of the promise.
- Fix / rule: ATOM.md A1 (report as soon as the result exists; record every promise in /workspace/.atom-watch-state.json "promises"), A2 (own mistakes first); the watch routine hands back due promises.
- Status: NEW
