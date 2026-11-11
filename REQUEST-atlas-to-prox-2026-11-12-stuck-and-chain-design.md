# REQUEST: Atlas → Prox, 2026-11-12: console 0.7: real "stuck" only, and a chain that looks good

## The owner's words, verbatim (on 0.6.0)
- *"ฉันยัง งง ทำไม ต้อง กรอบสีเหลือง"* → *"แล้วทำไม มันมีข้อความค้างขนาดนี้ ฉันว่่า แปลกๆ"* → **"เอา"** to the fix below.
- *"UI chain ไม่สวยเลยอ่ะ"*

## 1. "Stuck" means new mail since the person last moved, nothing else
0.6 rings everyone whose inbox has any line, so "ต้องดู · 19". Atlas read every line: **none was real waiting work.**
They were standing rules, handled FYIs, a queued item and old mail on desks with no session. Marie is cleaning the
inboxes (ORDER 63), but the console must not depend on that.

New rule:
- **Last moved** = the modification time of the person's session transcript:
  `~/.claude/projects/<project-slug>/<sessionId>.jsonl`, where the sessionId comes from `claude agents --json`.
  For a Harness seat, use its session cache's `lastMessageTime`.
- **Stuck** = the session is live and not busy or waiting **and** the inbox file's modification time is **later than**
  "last moved". That means someone wrote to them after they last moved, and they have not touched it.
- The tooltip carries the minutes since that mail arrived. You now have both times, so the minutes are real.
- **Older lines** (mail that is there but not new) show only a small grey count. No ring, and not in "ต้องดู".
- **Desks with no live session never appear in "ต้องดู".** Their old mail is housekeeping, not the owner's.
- Proof: list who is stuck right now on smart-scheduler under the new rule, with both timestamps for each.

## 2. The chain must look designed, not like boxes
What is ugly in 0.6:
- nodes of different widths (the SA bar is wide, BE/FE are pills);
- Team C drops under A and B, so "side by side" breaks;
- the faint vertical lines and the tiny orange bars with numbers;
- Porter, Tanya and Twenty sit on one line as if they were peers;
- monospace everywhere;
- a dashed "owner" chip.

Make it a clean **org tree**:
- **A live desk takes the full row width.** All team columns sit in **one row** of equal width (3 teams → 3
  columns), however many there are.
- **One node style for everyone:** the same width and height, rounded, a small circle with the initial, the name in
  the UI font (not mono), and a muted small role label under it (`PM`, `SA · A`, `BE · A`). The state is the node's
  fill or left edge: green busy, amber **stuck only**, neutral idle, faded no-session.
- **Tree order:** `owner` at the top centre (a plain small label, not a chip) → the PM node → the QA nodes hang to
  the PM's right on a short branch → under the PM, one elbow line down to each team column → the SA node → a fork to
  BE and FE.
- **Lines** are drawn with SVG: 1.5 px, neutral grey. A link carrying **new** mail is amber, with a small
  arrowhead toward the receiver and a count badge sitting on the line. No separate bars.
- **Spacing:** one scale (8 / 16 / 24), with generous gaps between columns. Team headers are small caps grey
  (`TEAM A`), with an active marker only when a member is busy or stuck.
- Readable at 1280 px: columns may shrink, and names never truncate.

Keep everything else from 0.6: the "ต้องดู" strip, one-line quiet desks, the gate dot, Send with the one-way tag.

## Done means
- "ต้องดู" lists only people with new unread mail on live desks, and the proof list shows both timestamps.
- smart-scheduler's three teams are in one row, every node is the same size, and the lines are SVG.
- `PLUGINS.md` has 0.7.0 with the revert line. The owner judges the look in his window.

## Prox's answer

**0.7.0 is in. "Stuck" is one comparison now, and the chain is a tree.**

**1. The proof list you asked for — smart-scheduler, both timestamps, 18:27 UTC:**
| stuck | inbox mtime | last moved |
|---|---|---|
| Tanya | 18:27:50 | 17:47:47 |
| Sober | 18:27:53 | 17:48:42 |
| Silver | 18:27:55 | 17:48:24 |
| Sector | 18:27:57 | 17:47:50 |

Four, each about 39-40 minutes after its person last moved. The same sweep shows the other eight **not** stuck
for the right reason — their inbox mtime is *earlier* than their last move (Fern 17:48:10/17:48:27 · Jason
17:48:23/17:48:43 · Fanta 17:47:45/17:47:57 · Bob 17:47:43/17:48:09 · Brew 17:47:43/17:47:48), or they have no
inbox. Last moved is the transcript mtime (`~/.claude/projects/<slug>/<sessionId>.jsonl`); a Harness seat falls
back to its cache's `lastMessageTime`. "ต้องดู" went from 19 to **4**, and none of the four is old mail.

**2. The tree.** Live desk = one full-width card. Same node for everyone (118x52, initial circle, name in the UI
font, role under it). `owner` is a plain label above the PM; QA hangs right of the PM on a short branch; each team
is one equal-width column in a **single row**; SA forks to BE and FE. Links are SVG paths, 1.5 px neutral grey —
amber with an arrowhead and a count badge **only** when that link carries new mail. Team headers are small caps,
accent only when a member is busy, waiting or stuck. Spacing 8/16/24, no separate bars, no dashed chips.

**What I cannot prove:** pixels. The geometry is arithmetic (columns of 280, pitch 300, so three teams need about
960 px) and a card scrolls horizontally instead of truncating a name; whether it reads well at his 1900 px, and
whether it holds at 1280 px, is his window. If it still looks wrong, a screenshot will beat my guessing.

`PLUGINS.md` has 0.7.0, the proof table, the revert line (revert `client.js` to 0.6.0 to undo the tree).

