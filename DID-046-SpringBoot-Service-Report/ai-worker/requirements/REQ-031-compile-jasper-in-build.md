# REQ-031: Compile `.jrxml` → `.jasper` as part of the build

- Status: READY_FOR_SA
- Priority: HIGH (deployment-safety; not urgent for any feature)
- Requested: 2026-08-24 by human (dev@smartalliance.co.th)
- Root cause of: DEF-7 (2026-08-05) and DEF-15 (2026-08-24) — the same failure, twice

## Problem
`.jasper` files are **precompiled binaries committed to git**, and Maven does not generate them.
`clean compile` / `clean package` merely **copies** whatever `.jasper` is in `src/main/resources`.

So a correct `.jrxml` fix can ship as a stale binary:
1. Someone edits a `.jrxml`.
2. They (or CI, or a teammate pulling the branch) build and deploy.
3. **The old layout renders.** No error, no warning, no failing test.
4. It is only discovered by a human reading a rendered form.

This is not hypothetical — it has now cost two full investigations:
- **DEF-7** — a corrupt `.jasper` repaired in `target/` only; `clean` restored the broken one.
- **DEF-15** — the destroy report's ticks printed on the wrong lines. Builder, code binding, master
  lookup, doc query and the emitted JSON were **all proven correct**; the deployed `.jasper` was
  simply older than its `.jrxml`. A full day was spent looking everywhere except at the binary.

Evidence that the two sources are already out of step in the repo: **52 `.jrxml` tracked, 28
`.jasper` tracked.** Nothing enforces that a committed `.jasper` matches its `.jrxml`.

## Requirement
1. Add a build step that compiles `.jrxml` → `.jasper` during the Maven build, so **`.jrxml` becomes
   the single source of truth**.
2. **Stop tracking `.jasper` in git** once the build generates them (remove the 28 tracked files and
   gitignore the pattern), so the two can no longer drift.
3. No change to how anyone builds or runs the project — the existing commands must keep working and
   simply produce correct templates.

## Acceptance Criteria
- [ ] A `.jrxml` edit reaches the rendered PDF through a normal build, with no manual regeneration.
- [ ] **Every existing report renders identically to today** — อ.6, อ.9 transport, อ.9 destroy, อ.14,
      อ.15, plus the other builders (a1/a3/open/expand/personChange/planChange). This is a build
      change, not a template change: output must not move.
- [ ] No `.jasper` tracked in git; none required at runtime beyond what the build produces.
- [ ] A deliberately edited `.jrxml` demonstrably changes the output after a plain build — i.e. prove
      the failure mode is actually closed, not just assumed.

## ⚠️ Constraints — the part that can break everything
- **The compiler must match JasperReports 7.0.4**, the version the app loads at runtime. A `.jasper`
  produced by a different major version may fail to load or render differently. **Verify the plugin's
  JasperReports dependency and pin it**; do not accept a plugin's transitive default.
- `.jasper` recompilation is **non-deterministic** — byte/md5 comparison is a broken oracle (already
  established under REQ-026). Verify equivalence by **rendered PDF content**: PyMuPDF text plus page
  count, not file hashes.
- The 52-vs-28 gap must be understood before deleting anything: confirm whether the 24 `.jrxml`
  without a committed `.jasper` are subreports compiled at runtime, unused, or genuinely missing.
  Report what they are rather than assuming.
- Build-time cost is acceptable; correctness is not negotiable for speed here.

## Out of scope
- Any change to template layout or report content.
- The DEF-15 fix itself (that is already resolved by the 17:32 regeneration; this REQ prevents the
  recurrence).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
