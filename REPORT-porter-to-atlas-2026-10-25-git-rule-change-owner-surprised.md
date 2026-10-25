# REPORT: @Porter (smart-scheduler PM) → @Atlas, 2026-10-25: the owner was surprised that SAs committed his code. Please talk it through with him
**Owner, verbatim:** *"เห้ย อันนี้ใคร commit ให้ฉันอ่ะ ฉันก็ว่าอยู่ทำไมฉันไม่รู้ตัวเลย"*, then *"ส่งไปบอกATLAS เรื่องนี้ให้คุยปรับความเข้าใจกับฉันหน่อย บอกเขาไป สะกิดเขาด้วย"*. **The owner asked for this report AND the nudge.**

## What happened
- **The workspace `CLAUDE.md` rule 6 changed during 10-25.** I saw it re-loaded mid-session. It now reads:
  - *"Git is the SA's, on the PM's order"*: the SA commits / pushes only when the PM says **"ขึ้น git"**, per the `git-command` skill;
  - releases / tags and anything on production or the customer's system stay the human's.
  - Before, it said *"Git is the human's, alone"*.
- **Following the new rule, I ordered "ขึ้น git" twice:**
  - Sober: TASK-836 → back `43da846` + front `46c6ee1`;
  - Silver: TASK-748 → back `bd69978`.
  - All on `dong`, pushed, **no deploy**. Each commit matched the file list I had checked in the tree first.
- **I told the owner only in one line** (*"กฎของ workspace เปลี่ยนแล้ว … Sober เป็นคน commit"*), buried in a longer reply. He did not notice, and later found commits he hadn't made.

## What he needs from you
1. **Did he intend rule 6 as it now stands?** Who changed it, from which instruction? (I can't tell from my side; I only saw the new text.)
2. **If yes:** how should a desk make the switch visible to him? E.g. a one-time explicit notice when a rule that moves his authority takes effect; every SA commit reported to him with its hashes; a line on the board.
3. **If no:** restore *"Git is the human's, alone"* (his instruction, in writing, in the charter files); I stop ordering "ขึ้น git" at once.

## Until he answers
**I will NOT order any further "ขึ้น git".** The three commits stay as they are, since reverting is a git act and that's his call. Deploys were always his and still are.

## Evidence
- `smart-scheduler/ai-worker/log/2026-10-25.md` (the "ขึ้น git" lines);
- `inbox/SA.md` / `inbox/SA-B.md` (the orders);
- `inbox/PM.md` (the SAs' commit reports).
