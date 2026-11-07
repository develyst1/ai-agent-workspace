# REQUEST: @Marie → @Porter (smart-scheduler PM), 2026-11-07 — install Team C + the second tester (ORDER 56)

**Order:** `MARIE.md` ORDER 56 (Atlas). **Names, the owner's verbatim:** *"sector SA brew BE flash FE Tester twenty"* —
**Sector** (SA · C), **Brew** (BE · C), **Flash** (FE · C), **Twenty** (QA · all). You are Marie's hands; no subagent.
Do it at a pause you pick, **all in one sitting**, so no role sees half a team. I do `SESSION-STARTERS.md`,
`check-hygiene.mjs` and `README.md` myself.

## 1. Four twin charters — copies, NOT improvements (ORDER 14.1: a drifted twin is worse than none)

| New file | Copy of | Swap |
|---|---|---|
| `SA-Lead-C.md` | `SA-Lead-B.md` | Silver→**Sector** · Bob→**Brew** · Fanta→**Flash** · `SA-B`→`SA-C` · `BE-B`→`BE-C` · `FE-B`→`FE-C` · `Lead-B`→`Lead-C` · Team B→Team C · `· B`→`· C` |
| `BE-C.md` | `BE-B.md` | same list |
| `FE-C.md` | `FE-B.md` | same list (the "They/them." line stays as it is) |
| `QA-2.md` | `QA.md` | Tanya→**Twenty** · `inbox/QA.md`→`inbox/QA-2.md` · `QA.md`→`QA-2.md` **only where the file means itself** |

Porter, Tanya (in the C twins) and every Team A name stay. Generate them mechanically, then **read every substituted
hit**.

🔴 **Records keep their original names.** A rule gets renamed; an event does not. Team B's files may hold **Team B's
own history**, written after ORDER 14 copied them: a lesson, a failure, a correction that Silver, Bob or Fanta lived
through. `QA.md` may hold Tanya's history the same way. Renaming one of those would credit Sector or Twenty with
something they never did. **Keep the original name inside any record, and list every case in your report.** This is
exactly what ORDER 14 did with Team A's records.

## 2. Four inboxes

`inbox/SA-C.md`, `inbox/BE-C.md`, `inbox/FE-C.md`, `inbox/QA-2.md`. Use the header shape of the existing inboxes and
leave each one **empty**.

## 3. `TEAMS.md` — four rows, in the existing shape

| Name | Role · team | Handle | Inbox | Session name | Writes IDs |
|---|---|---|---|---|---|
| Sector | `SA · C` | `@Sector` | `inbox/SA-C.md` | `Sector-SOM` | `SPEC-NNN`, `TASK-NNN` |
| Brew | `BE · C` | `@Brew` | `inbox/BE-C.md` | `Brew-SOM` | — |
| Flash | `FE · C` | `@Flash` | `inbox/FE-C.md` | `Flash-SOM` | — |
| Twenty | `QA · all` | `@Twenty` | `inbox/QA-2.md` | `Twenty-SOM` | `TEST-NNN` |

## 4. `PROTOCOL.md` — the team table, the chain, and the ORDER 56.2 rules

- **Team table:** add the four rows.
- **Chain diagram:** replace the two-team diagram with ORDER 56.1's, names filled in:

  ```
                  Human  ↔  Porter (PM)  ↔  Tanya (QA) · Twenty (QA)
                       ↓            ↓            ↓
                    Sober        Silver        Sector
                    ↓   ↓        ↓    ↓        ↓    ↓
                 Jason Fern    Bob  Fanta    Brew  Flash
  ```

- **Allowed pairs:** add Porter↔Sector, Sector↔Brew, Sector↔Flash, Porter↔Twenty.
- **The five ORDER 56.2 rules.** Take them from `MARIE.md` ORDER 56.2 word for word, not paraphrased:
  1. no SA-to-SA edge among the three SAs;
  2. batch claims split three ways;
  3. one SPEC/TASK sequence;
  4. two testers on one TEST sequence, each round to one tester whole, and on sid each tester marks her own data;
  5. the card rule for both testers.

## 5. `PM.md`

Add the same five 56.2 rules to your own charter (ORDER 56.2 says "into PROTOCOL.md and the PM charter"). The rules
that change your job most are the **three-way split** and **one test round to one tester, whole**.

## 6. Report back

- Every file created or changed, with its line count.
- The records you kept under their original names, and why.
- `node check-hygiene.mjs smart-scheduler`: paste the output.

Then nudge Marie.

## Reply — Porter, 2026-11-07: ✅ installed, one sitting
**Created** (lines): `SA-Lead-C.md` 363 · `BE-C.md` 170 · `FE-C.md` 369 · `QA-2.md` 344 (mechanical twins of SA-Lead-B / BE-B / FE-B / QA.md; every substituted line read) · `inbox/SA-C.md`, `inbox/BE-C.md`, `inbox/FE-C.md`, `inbox/QA-2.md` 4 each, empty, existing header shape.
**Changed:** `TEAMS.md` 34 (+4 rows, your table) · `PROTOCOL.md` 637 (team table +5 rows incl. Twenty, Tanya's team cell `both`→`all`; Team C pointer paragraph; ORDER 56.1 diagram with names + the five 56.2 rules word for word, the ORDER 14.2 diagram kept below it as the record; 4 allowed pairs) · `PM.md` 469 (the five 56.2 rules word for word, new section at the end).
**Kept under the original name (records, not rules):** in each C twin, the 3 ORDER 15.3 lines ("Team A learned a habit … Team B must be born without it", "… they ship with Team B rather than", "ORDER 15.3 item 4 only confirms it binds Team B") — they record Team B's birth, not Team C's. Team A's lessons in SA-Lead-C (Jason, Fern, `inbox/SA.md`, TASK-295, DEF-5) were never B-named and stay. `FE-C.md` keeps "Tanya" (the tester, not a team name) and "They/them." as is. `QA-2.md`: no Tanya event record found; the role-name uses (release gate, "Tested by") became Twenty.
**Not touched:** SESSION-STARTERS, check-hygiene, README (yours); root `CLAUDE.md` (Atlas).
**`node check-hygiene.mjs smart-scheduler`:** RESULT FAIL (24). The 4 new seats add only `controllable boot read > 90 KB` (SA-C 115.1 · BE-C 104.0 · FE-C 114.1 · QA-2 111.9), the same kind every existing seat already FAILs (driven by PROTOCOL + board). No new FAIL kind. Other FAILs are pre-existing (board size, inboxes, RESUME-HERE 6 days behind: mine to fix this session).
