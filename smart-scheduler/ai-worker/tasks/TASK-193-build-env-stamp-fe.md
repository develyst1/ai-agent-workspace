# TASK-193: A visible build + environment stamp on the FE (FE)

- Source: Porter 2026-08-25 — **three QA rounds in 24h lost** to not knowing whether the screen under test was the fresh
  build or a stale one (a stale FE passed for a fresh one at 04:00). 🟠 On PROJECT-STATUS as a known gap.
- Status: ✅ **FE code DONE (Sober 2026-08-25)** — tsc 0·build ok; reads NEXT_PUBLIC_BUILD_ID/ENV (inlined, renders nothing if unset). BLOCKED-for-effect on the deploy setting those two vars (Q1 → Porter's runbook).
- Repo: **smart-scheduler-front**.

## What & why
QA (and the owner) need to tell, **from the screen**, which build + which environment they are looking at — otherwise a
cached/stale FE gets signed as a fresh one. Add an unobtrusive, always-present stamp: **build id/short-SHA (or build
time) + environment (sid/uat/prod)**, somewhere staff can read but that doesn't clutter the calendar (footer, About,
or a corner of the admin shell).

## Scope
- Surface a **build identifier** (short git SHA or build timestamp) and the **environment** name. Source them at build
  time (env var / `NEXT_PUBLIC_*` injected by the build) — do not hand-edit a version string. Mind
  `nextjs-runtime-public-env`: if the env must be settable at deploy time without a rebuild, publish it at container
  start rather than inlining, so the stamp reflects the running deploy.
- Keep it read-only and cheap; no new dependency if avoidable.

## DoD
- [ ] Every page (or the shared admin shell) shows build id + environment; it changes when a new build is deployed.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok · no raw key.

## Notes
(Fern fills in. This is infra-flavoured FE — coordinate the env-var source with how uat/prod are built. The
`nextjs-runtime-public-env` skill covers the build-once-deploy-many case if the stamp must not be baked in.)

---

## Implementation Notes (Fern 2026-08-25)
🆕 **`lib/ui/build-stamp.ts`** + one line in the shell footer (beside the existing `v0.1 · …`), so it is always on
screen without touching the calendar.

- Reads **`NEXT_PUBLIC_BUILD_ID`** (falling back to `NEXT_PUBLIC_BUILD_TIME`) and **`NEXT_PUBLIC_ENV`** — injected by
  the build, never a hand-edited version string.
- **Renders nothing when the build injected nothing**, so a local `bun run dev` doesn't grow a meaningless
  "unknown · unknown". An empty stamp would itself be a claim.
- `title` carries the full value so a QA screenshot captures it even in a narrow sidebar; `font-mono tabular-nums`
  so a SHA is readable at a glance.

### 🔴 The honest limitation — and it matters for exactly the case this task exists for
Both values are **inlined at build time**, which is deliberate: the stamp has to describe **the bundle in the
browser**, and a stale cached bundle is the precise failure that cost those three QA rounds. A value fetched at
runtime would describe the *server* and would happily label a stale FE as fresh — reintroducing the bug.

The trade-off: **changing them on the server without a rebuild does nothing** (the `nextjs-runtime-public-env` case
the task cites). If we move to build-once-deploy-many, the **environment** half must be published at container start
instead — while the **build id** should stay inlined, for the reason above. Q1.

**Evidence:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun run build` **ok** · §3.5 **0/0/0/0**.

## Questions
- **Q1 (deploy, not code):** nothing sets `NEXT_PUBLIC_BUILD_ID` / `NEXT_PUBLIC_ENV` today, so **the stamp is
  invisible until the build passes them** — which is correct behaviour but means this task only pays off once the
  deploy step does its half (e.g. `NEXT_PUBLIC_BUILD_ID=$(git rev-parse --short HEAD)`, `NEXT_PUBLIC_ENV=uat`).
  That's Porter's/the owner's runbook, not mine to edit. Flagging so it isn't marked done and then found blank.

  > **A (Sober): correct, and the inlined-build-id reasoning is right.** A runtime-fetched build id would describe the
  > server and label a stale bundle as fresh — the exact failure this exists to catch — so keep it inlined. The task is
  > **code-done**; its *effect* waits on the deploy setting `NEXT_PUBLIC_BUILD_ID=$(git rev-parse --short HEAD)` +
  > `NEXT_PUBLIC_ENV=<sid|uat|prod>` at build time. That's the deploy runbook (Porter/owner), not FE code — flagged up
  > so no one marks it "working" and then finds it blank. If we go build-once-deploy-many, the **environment** half can
  > be published at container start (`nextjs-runtime-public-env`); the **build id** stays inlined.
