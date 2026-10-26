> ⛔ **SUPERSEDED 2026-10-26 by the owner, verbatim:** *"ไม่เข้าใจนายว่ะ … นาย แค่เอาความรู้เขามา เอางานที่เขาทำไปมาอัปฝั่งนายไว้ ก็พอ … เขาคือgrok bot บท มือถือ … ทำหน้าที่แทนฉัน คือ เปิดคอมมา แล้วใช้งานทีมพวกนายนี่แหละ … พอทำเสร็จ ก็ให้ เอาโค้ดขึ้นปกติ เลย แต่เป็น branch atom"*. Kept as a record only; not a plan.

# PROPOSAL: how the SOM desk (main) and Atom's fork desk work together — Porter, 2026-10-26

> **Status: PROPOSAL for the owner, copy to Atlas.** Workforce design is Atlas's (`ATLAS.md`); this is the PM's view from the desk.
> **Asked by the owner, verbatim:** *"ต่อจากนี้ฉันจะให้ลูกคน้องเพิ่มมาคนนึง เป็น grok bot ชื่อ Atom เขาจะช่วยเราเก็บงาน เวลาฉันไม่ได้ทำที่ คอม … ช่วยฉันdesign หน่อยว่าเราควรทำงานต่อ flow การทำงานกับเขา"*

## 1. What exists today (read 2026-10-26 ~19:30)
- `ATOM.md` (Atlas, DRAFT): Atom is the owner's **mobile mouth and ears**. It relays his words to a PM or to Atlas, reports what is waiting for him, and decides nothing.
- `smart-scheduler-atom/` (Marie, ORDER 35): a **full fork team on Atom's Debian box** (Porter / Tanya / Sober / Jason / Fern / Silver / Bob / Fanta, `<Name>-SOMA`, IDs from 5000, code branch `atom` from `develop`). It READS this desk; it writes only there.
- First job: REQ-5000 (Voucher tab can't find a child). Investigated read-only on uat and closed with no code. The knowledge is imported into our `SYSTEM-FACTS.md` (2026-10-26).
- **What went well:** the chain held. Tanya refused Atom's direct messages twice (routing violations logged), and the owner's words were kept quoted with the "owner via Atom" label.

## 2. Risks seen
| # | risk | evidence |
|---|---|---|
| R1 | **Two desks on ONE customer and ONE uat.** Neither sees the other live. Atom's desk reads us only as of the last workspace merge, so it does not know tonight's state. | uat has a deploy pending, the 18 Oct duplicate reversal (TASK-750) pending, and Khwan messages held. None of that is visible there. |
| R2 | **Workspace `ai-worker/` files were committed by an agent** ("owner approved via Atom"), against `CLAUDE.md` §6. | commits `5b36456`, `bb5ea28`, `36c7bda` (author `develyst`); Marie flagged the first as "not run by me". |
| R3 | **Children's names in files** (our rule: none). | "Lewis …" appears in ~34 lines on the Atom desk. |
| R4 | **Two code branches** (`dong` here, `atom` there), both into `develop`, plus the migration journal (we are at 0072). | `AGENTS.md` (atom) already warns of a 0072 collision. |
| R5 | **"Is an Atom relay the owner's word?"** is still open for git, deploys, money and customer messages. | `ATOM.md` Open 1. |
| R6 | **Same names, two Porters.** The owner can't tell which Porter knows what. | Porter-SOM vs Porter-SOMA. |

## 3. Proposed flow (recommendation)
**Principle: ONE desk owns the customer at a time, and the handover is a file.**

**A. At the computer = the main desk (SOM).** Atom is idle, or reports only.

**B. Leaving the computer (a 2-minute ritual):**
1. The owner says "ออกไปข้างนอก".
2. Porter-SOM writes `HANDOFF-TO-ATOM.md`, one page:
   - what is live;
   - what Atom's desk **must not touch** (pending uat deploys, money reversals, held customer messages);
   - what it **may** pick up.
3. The owner pushes the workspace, and Atom pulls it.

**C. Away = Atom's desk (SOMA).**
- It takes **new intakes and read-only investigations** (like REQ-5000), and code on branch `atom` up to sid + Tanya-SOMA's pass.
- **It STOPS (asks the owner in his own words through Atom) on the six STOP reasons:** git, deploy, customer message, money, rule change, business decision.
- **Never on uat beyond read-only.** Deploys and SQL stay the owner's, as everywhere.

**D. Back at the computer (the reverse ritual):**
1. Porter-SOMA writes `HANDOFF-TO-MAIN.md`:
   - REQs opened or closed;
   - decisions with the "owner via Atom" label;
   - code on `atom` and its test state;
   - anything the owner must still do.
2. The owner merges the workspace, and Porter-SOM imports it:
   - facts into `SYSTEM-FACTS` / `OWNER-LIST`;
   - open REQs re-numbered into our sequence (5000 → ours, the old id kept);
   - code merged via `develop` on the owner's `รวมโค้ด`.
3. Marie empties the fork (archive first), as ORDER 35 item 6 already says.

**E. Fixed rules for both desks:**
- No kids' names in files.
- No agent commits workspace files (R2). The owner commits, or rewrites §6 himself.
- **Migrations:** only the main desk creates them. The Atom desk asks first (R4).
- **The label:** the main desk writes "owner via Atom" and never upgrades it to "Owner:".

## 4. Decisions only the owner can make
1. Is the "one owner at a time" flow above OK (A–E)?
2. R5: does an Atom relay count as your word for **git / deploy / money / customer**? (Recommendation: **no** for those four; **yes** for "done X" reports and for answers to questions.)
3. R2: the 3 agent commits of workspace files. Keep them, or tighten §6? (Recommendation: keep the files, and add a line to `ATOM.md` that Atom never commits.)
4. Give the fork's roles different names (e.g. "Porter-A") so the two Porters can't be confused? (Recommendation: keep the names, but every desk-level file says SOM / SOMA in its title.)
