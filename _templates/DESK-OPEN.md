# DESK-OPEN — how a new desk is opened

> **The questions live in one place:** `_templates/desk-open/questions.json`, answered on a local form.
> This page is how the flow works and how Atlas reads the answers. It holds no questions of its own (§9 — a
> second copy would drift).
>
> Why a form: the operator tested opening a desk as a new user would, from a fresh session, and answering a long
> Markdown page with `[ ]` defaults was too hard (2026-10-12: *"ใช้งานยากไป … ต้องตอบ md ตั้งเยอะ"*). The
> workspace will be handed to other people, so the form runs from a fresh clone: local files only, no accounts.
> `team-proposed` until a desk has been opened with it; cheap to change.

## The flow

1. **The person opening the desk** runs, from the workspace root:
   ```
   node scripts/desk-open.mjs
   ```
   The browser opens the form. They press **เริ่มโต๊ะใหม่**, name the desk folder, go through the three steps,
   **name every worker** on the team canvas, and press **ส่งให้ Atlas**. The answers are saved to `desk-open/<desk>.json`
   (git-ignored — it may hold names and customer notes). The page shows the line to paste next.
2. **They open a new session and paste it:**
   ```
   อ่าน ATLAS.md — เปิด desk ใหม่: <desk> (ตอบแบบฟอร์มแล้ว: desk-open/<desk>.json)
   ```
3. **Atlas** reads the file and checks it (below). If something needs changing, Atlas asks in **one** message,
   and the person fixes it on the form and presses ส่งให้ Atlas again. Otherwise Atlas writes Marie's order
   **and spawns Marie itself, in the same session** — the person does nothing between steps 2 and 5 (operator
   2026-10-14: a new user does not know Marie exists, so an Atlas that stops at "order written" strands them).
4. **Marie** (spawned by Atlas) runs `node scripts/install.mjs <desk>`, fills the desk files from the answers (`TEAMS.md` from the
   roster, `SEATS.md` from section C, the first lines of `DECISIONS.md` stamped `[operator <date>]`), proves it
   with `node scripts/check-harness.mjs` → `current` and `node check-hygiene.mjs <desk>` → PASS, then deletes
   `desk-open/<desk>.json` (its content now lives in the desk).
   Atlas reads her report, re-runs both checks itself, and ends with the exact next line for the person.
5. What the person types next depends on the **work mode** chosen on step 2 (`mode.v`; a file without it =
   `manual`). Marie writes the mode into the desk's `DECISIONS.md`; Atlas ends with the matching line:
   - `manual` — open the PM first, in a new session: `/desk <desk> <PM name>`, rename that session to
     `<PM name>-<short>`; the other workers the same way, one session each.
   - `dispatcher` — one session: `อ่าน DISPATCHER.md แล้วรัน <desk>`.
   - `long-run` — first a normal dispatcher run as above; a long run starts only from
     `scripts/run/run-long.sh <desk>` after the operator signs that day's hop budget in the desk's
     `RUN-PLAN.md` (DISPATCHER.md § Long run). The mode records that long runs are allowed; it signs nothing.

## For Atlas — reading `desk-open/<desk>.json`

Form v2 (2026-10-14) saves `project` (oneLine, forWhom, firstWork), `team` (`nodes` — kind `you` / `agent` /
`person`, role, `also` = roles it combines, name, `duties` — and `edges`, undirected "works with") and `code`
(repos, git, systems, secrets). `by: "template"` = the default was kept; `by: "operator"` = the person changed it.
On a file with `status: "answered"` both count as the operator's answer — stamp them `operator`. A v1 file has
`answers` / `roster` instead; read it the same way.

**Derive, never ask:** teams = each SA with the FE/BE wired under it, lettered in node order; session names =
`<name>-<short>`. Items 9–13 (SA-to-SA, cross-team review, PM nudging engineers, nudging each other, long run)
are the workspace defaults unless the person drew an SA-to-SA wire. Customer kit / coding standard (old item 23)
is asked by the PM at the start of work (`role-pm` 1b).

**Check before writing the order** — the form's checklist already enforces names, the short code, one AI card
wired to คุณ, engineers under an SA and the forbidden combinations. Ask only if:
- team shape: one SA team per repo worked at the same time (`code.repos`); two teams never share a repo;
- a person card says there is a real end user → name who relays their words to the desk.

**Person cards and คุณ's duties → `SEATS.md`** (v1 items 14–18 in brackets):

| answer | seat line |
|---|---|
| 14 = nobody | `customer` = `skipped` — and no `customer-validated` stamp ever exists on this desk |
| 14 = a person | `customer` = that person · their words reach the desk only through the operator, stamped `customer-asked` / `customer-validated (date + channel)` |
| 15 = the operator | `designer` = `→ operator` |
| 16 = nobody | `qa` (human) = `skipped` — AI QA still runs |
| 17 = the operator | `platform` = `→ operator` |
| 18 = a person | `dev` / `sa` = that person, marked "outside our team — reached only through the operator" |
| pm / sa / dev with no human | `→ operator` |
| a seat whose work is owed but nobody holds it yet | `— ยังไม่มี` — never filled by guessing |

Stack questions (language, framework, architecture, style) are **not** on the form: the SA reads the code and
brings them to the operator through the PM as the desk's first step — `role-sa` §4.0 / §4.10.
