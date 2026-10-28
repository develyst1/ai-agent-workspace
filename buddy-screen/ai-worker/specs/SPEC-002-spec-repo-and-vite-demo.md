# SPEC-002: V1 requirement + diagrams in buddy-screen-spec, and a Vite mock demo
- Source: REQ-002 (AC-1..AC-9)
- Status: DONE (2026-10-28, the SA — TASK-001..006 DONE; REQ-002 SPEC_DONE)
- 🔴 Children's data: synthetic only. Every name, face and voice in the demo is invented or a placeholder.

## 0. What I read (evidence)
- `requirements/REQ-002-spec-repo-and-vite-demo.md` (49 lines) and `../project-docs/requirements-v1.md` (199 lines, the PM's), 2026-10-28.
- `DECISIONS.md` 2026-10-28 19:57–19:58. The read-only rule on `buddy-screen-spec` is lifted **for this work only** (PM-interpreted from the owner's words quoted in REQ-002 §Problem). `PROTOCOL.md` still says read-only; the PM has reported that to the owner for Marie to fix.
- `buddy-screen-spec`: `main`, HEAD `0e6e911`, clean, one file `README.md` (`# buddy-screen-spec`). `buddy-screen-front`: `main`, HEAD `8a3280c`, clean. Read 2026-10-28.
- Toolchain on this machine, checked 2026-10-28: node v24.22.1 · npm 11.21.1 · the npm registry is reachable (`npm view vite version` → 8.3.5) · Chrome is on PATH as `google-chrome`.
- **Proof command run on a sample diagram first** (DoD of TASK-001): `@mermaid-js/mermaid-cli@11` with Chrome and `--no-sandbox` printed `Found 1 mermaid charts in Markdown input · ✅ ./out-1.svg`.

## 1. Decisions (`[SA-decided]` — not architecture of the product, nothing the owner sees differently)
- **Where things live: all in `buddy-screen-spec`.** The repo would hold the requirement, the diagrams and the demo, so a fresh clone is self-contained. `buddy-screen-front` is **not touched** and stays for the Next.js product (D3; AC-9).
  ```
  buddy-screen-spec/
    README.md                 ← points to the three below
    REQUIREMENTS-V1.md        ← §1–§16 of project-docs/requirements-v1.md
    diagrams/
      01-system-context.md  02-engagement-states.md  03-overtime-borrowing.md  04-childrens-data.md
    demo/                     ← Vite + React + TypeScript mock (its own package.json)
  ```
- **Write access:** the FE writes in `buddy-screen-spec` for TASK-001..003 **only**, under DECISIONS 19:58. No other file there is touched. **Nobody commits or pushes** (owner's word needed; `git-command` skill).
- **Demo stack:** Vite + React + TypeScript (React, so screens are close to the Next.js product), plain CSS, **no UI library, no router library** (screens chosen from an in-app index, hash-based), **Vitest** for the state logic. No web fonts or images from the internet; system Thai fonts only. Placeholder art = CSS shapes or emoji, never photos.
- **One documented command** (AC-3): `cd demo && npm install && npm run dev`, which opens `http://localhost:5173`. It is written in the README.
- **Synthetic fixture data** (one file, `demo/src/fixtures.ts`): Buddy nickname **มะลิ** · AI names **ปุยฝ้าย / ดาว / โบ๊ะ** (the requirement's examples) · Friend nickname **ต้นกล้า** · numbers taken from the requirement (40 h, 5 h 43 min, 12.50 THB, 99 THB, 500 THB gifts, ≥ 70 %).

## 2. The one piece of logic — engagement states (AC-6), `demo/src/engagement.ts`
A pure module, so it is tested without a browser:
```ts
export type EngState = 'active' | 'idle_present' | 'idle_absent' | 'sleep';
export interface EngSignals { buddyInFrame: boolean; responding: boolean } // set by the simulation panel
export interface EngSnapshot { state: EngState; countedSeconds: number; secondsInState: number }
export const T1_SECONDS = 10, T2_SECONDS = 20;               // requirement §6
export function startActivity(): EngSnapshot;                // → active, countedSeconds 0
export function tick(s: EngSnapshot, sig: EngSignals): EngSnapshot; // advances exactly 1 second
```
Rules (requirement §6; must match exactly):
| From | Condition, per 1-second tick | To | This second counted? |
|---|---|---|---|
| active | `!buddyInFrame` | idle_absent | no |
| active | in frame, `!responding` for 10 consecutive s | idle_present | yes |
| active | in frame and responding | active | yes |
| idle_present | responding again | active | yes |
| idle_present | not responding; 20 s in idle | sleep | yes until the switch |
| idle_present | `!buddyInFrame` | idle_absent | no |
| idle_absent | back in frame and responding | active | yes |
| idle_absent | back in frame, not responding | idle_present (idle clock keeps running) | yes |
| idle_absent | 20 s in idle (present + absent together) | sleep | no |
| sleep | anything | sleep (counting stopped) | no |

"In idle" = time since leaving active. A drift-off therefore costs at most 10 s + 20 s = 30 s (R-T-4). The TV demo drives `tick` with a 1-second `setInterval` and shows state + counter. A simulation panel has two toggles, **Buddy in frame** and **Buddy responding**, plus **End activity** (→ sleep).

## 3. Screens (AC-4, AC-5, AC-8) — one index page lists every screen
Each screen is a component under `demo/src/screens/tv/` or `demo/src/screens/parent/`. The parent screens are drawn in a phone-sized frame: LINE chat bubbles with buttons, and LIFF pages.
- TV: `FirstNaming` · `FaceGestureRegistration` (placeholder, no camera) · `Sleep` · `NameCall` (*เรียกฉันรึเปล่า*) · `Invitation` (×4 activities) · `ActivityInProgress` (counter + simulation panel) · `OffTask` · `GoingToSleep` · `QuotaZero` (AC-8).
- Parent: `LineOvertimeRequest` (อนุมัติ / ไม่อนุมัติ; ไม่อนุมัติ → shows the session ended) · `LineBorrowed` · `LiffConsent` · `LiffQuotaSettings` (quota, daily limit, overtime on/off; Sunday used up → only a paid extension offered) · `LiffSessionTimeline` · `LiffGoals` (§12 topics) · `LiffReportChoice` · `LiffGiftChoice` (big / small / none + carry-over) · `LiffRename` (99 THB) · `LiffFriendConsent` (+ delete).

## 4. User-facing words
- Every string in requirement §13 is used **verbatim** (17 rows since the PM's 2026-10-28 20:10 addition; all 22 check-strings in TASK-002/003 were grepped against §13 by the SA → 22 × OK). `{placeholders}` are filled from `fixtures.ts`; nothing else in the sentence changes (AC-7).
- **All visible text lives in one file, `demo/src/strings.ts`**, each entry `{ th: string, source: '§13' | 'draft' }`. Strings not in §13 (titles, button labels, field names) are needed but not provided. They are marked `draft` and shown with a small **ร่าง** badge in the demo, and the PM reviews the file. The question is in `REQ-002 § Questions` (Q-A); this default applies until the PM answers.

## 5. Network & data guard (AC-9)
No `fetch`/XHR/WebSocket in demo code. No external URLs in HTML, CSS or JS; Vite's own dev-server connection to localhost is the only traffic. Check: `grep -rnE "https?://" demo/src demo/index.html` → only allowed in comments, and the FE pastes the output.

## Tasks
- TASK-001: Requirement md + 4 diagrams + README in buddy-screen-spec — owner FE (depends on: —)
- TASK-002: Vite demo scaffold + engagement logic (tested) + TV screens — owner FE (depends on: —)
- TASK-003: Parent LINE/LIFF screens + screen index completeness + network check — owner FE (depends on: TASK-002)
- TASK-004: Apply the PM's wording review (REQ-002 Q-A, 20:40): 11 replacements, all other drafts → source `'pm'`, no ร่าง badge left — owner FE (depends on: TASK-003)
- TASK-005: TEST-001 round 2 — DEF-1 TV `OvertimeDeclined` screen + link from ไม่อนุมัติ · DEF-2 diagrams 02/03/04 · DEF-3 buy-back block on LIFF quota + link from LINE borrowed · DEF-4 no face emoji (R-AI-1). New labels are drafts for the PM — owner FE (depends on: TASK-004)
- TASK-006: Apply the PM's review of the TASK-005 labels (3 replacements, the other 5 → `'pm'`, no ร่าง left) — owner FE (depends on: TASK-005)

AC map: AC-1, AC-2 → TASK-001 · AC-3, AC-4, AC-6 → TASK-002 · AC-5, AC-8 (parent half), AC-9 → TASK-003 · AC-7 → TASK-002 + TASK-003 (strings file) · AC-8 (TV half: quota zero) → TASK-002.

## Questions
- Q-A (for the PM) — in `REQ-002 § Questions`.
