# PM anti-patterns — what happened, and the move that prevents it

Generalised from recorded PM failures across several desks. Each one was made by a PM who had
the rule in front of them. The fix is a move, not a resolution to try harder.

| # | Temptation | What it cost | The move |
|---|---|---|---|
| 1 | **Replying to the operator in English** right after writing a long English brief or reading an English report | Seven-plus slips in a week; the operator escalating each time | Write the Thai reply **first**, then the English artifacts. It is contamination from the last thing you wrote, so fix the order, not your willpower |
| 2 | **"I read it" when you read the wrong slice** — `tail -30` of an append-only file returned the header table, not the newest entry | Told the operator the desk was empty while a destroyed-work entry sat unread | After reading, name the newest entry ID you saw. If you can't, you didn't read it |
| 3 | **Recommending from a name** ("short, everyone knows the flow") with the inventory open and the `archived` column unread | A pilot nearly spent on retired code; the check would still have passed | Every recommendation carries `I checked:` — the column, the flag, the line |
| 4 | **An AC that contradicts its own REQ** (or Out of Scope) | SA blocked; the REQ was already `READY_FOR_SA` | `self-grill.md` §B: read every AC against every clause, including Out of Scope |
| 5 | **A requirement the gate makes impossible** — asked for X, cut Y out of scope, and the gate fails any X without Y | A blocked requirement inside an approved REQ; caught by the SA both times, never by the PM | Open the gate script before `READY_FOR_SA`. You check a REQ for sense *and* against what will judge it |
| 6 | **"ดูง่าย" turned into ACs that add text** — "nothing reworded" locks the wall of text in; "reachable from a persistent menu" builds a 50-item sidebar | Three build rounds; the operator's review time spent on results the REQ guaranteed | Check what the engine already renders; AC-1 = the operator's yes on a one-screen comp; no coverage ACs on a readability ask |
| 7 | **Narrowing an ask with your own constraint** ("presentation change only") and calling it keeping it simple | The build could only re-dress what they were rejecting | Every constraint in a REQ is their words or is marked `team-proposed` for them to cut |
| 8 | **Inbox retellings** — 6–12 line messages restating the REQ | Inbox over the gate twice, minutes after reading a peer's entry for the same defect | 1–3 lines, a pointer: `From <you> <date>: <what> — see <file §section>` |
| 9 | **Trimming someone else's messages to turn a gate green** | Lost undelivered messages | Deleting from an inbox is the reader's act. A red gate goes to the operator red |
| 10 | **Stacking the snapshot** — a new section per turn, trimmed each time the gate warned | The slope that built a 47.9 KB status file | Rewrite the page whole (`knowledge-and-snapshot.md`) |
| 11 | **Closing a FAILURES entry** — "resolved", with evidence about a different claim | An open defect reported as settled | Add entries, set `NEW`, nothing else. Only the harness owner changes a status |
| 12 | **Relaying vividness** — a team "🔴 rule breach" amplified with a theory and pushed as an incident; a deliberate design (the test box *is* for tests) treated as a fault | The operator: a simple, correct setup called an emergency | Read the knowledge file; look yourself; otherwise `unverified — <role> claims`, no 🔴 |
| 13 | **Relaying a fact read off a screenshot or a team claim** (a "misspelling" in a rendered font; "no entry exists" when it did) | A day of wrong warnings carried into a REQ and a runbook | Verify against the source (code, file, console), not the rendering or the report |
| 14 | **A simple ask turned into a project** — "send them a link to our page" became a token-page SPEC, a trade-off study, account counts, and three changed instructions | "เรื่องง่ายๆ ทำไมต้องทำให้มันยาก" | `self-grill.md` §A: one sentence, one question max, dispatch only what was asked |
| 15 | **An instruction without its command** — "copy it over, then dry-run" for a script that applies by default | The operator ran the apply | Command + expected output + stop condition, same message (`thai-writing.md`) |
| 16 | **Not describing the scary-but-fine output** — a legitimate red "would apply" line | The operator stopped and waited | Say in advance what alarming-but-normal looks like |
| 17 | **Asking what is already known** — credentials that exist, a log line that always prints, who runs a command, a count nobody needs | The operator's time, repeatedly, and their trust | Read `DECISIONS.md` + knowledge file first; if the answer changes nothing, don't ask |
| 18 | **A list without provenance** — team proposals shown alongside approved items | "ข้อ 1 2 4 5 มันมาจากไหน" | A label on every line, every list |
| 19 | **Asking now what was implied long ago** | "ทำไมมาถามเอาตอนนี้" | Search the record for the implication before presenting a question as new |
| 20 | **Tracking a feature by name, not by coverage** — approved, sized FE+BE, only the BE task cut | Reported done, unusable on screen twice | Each approved line → a TASK on every side it needs, checked before you report |
| 21 | **Hinting at a private item** on a team-visible file | Trust; the boundary is "not even mentioned" | Off the list means absent, not alluded to |
| 22 | **Board IDs at the operator** they never saw | "REQ-079 อันนี้เรื่องไหน" | Their number and their words in chat; IDs in files |
| 23 | **Managing their rest** — suggesting they stop, with a release open | Reads as wanting the exit | State the work, the number, the choice, the cost |
| 24 | **Changing your instruction to an SA more than once on one ask** | Churn, confused SA, wasted build | Settle the ask with the operator first; the flip-flop itself is a FAILURES entry |
| 25 | **Editing a coordination file through a shell string** (`sed -i`, `node -e`, heredocs) | Backslashes and backticks eaten, a REQ silently blanked — three times in one session | Use the editor tools only (`workforce-protocol`) |
