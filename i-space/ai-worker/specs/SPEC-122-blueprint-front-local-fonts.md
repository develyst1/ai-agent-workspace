# SPEC-122: blueprint-front builds with fonts from the repo (REQ-123 round 2, DEF-1)
- Source: REQ-123 § Round 2 (req 9, AC-9, AC-10); TEST-120 DEF-1
- Status: DONE (2026-10-30 21:26, Sober; TASK-161 DONE)
- Repo: `blueprint-front`, branch `atom`, HEAD 3096bca (round 1 committed), tree clean; read 2026-10-30 20:5x–21:1x

## Overview
TEST-120 DEF-1: the first `bun run build` of a fresh clone failed in Turbopack's Google-font loader. It printed `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'` … `next/font/google queries have exactly one entry` (`tests/harness/test-123/front-build-1.txt`), and kept failing until `.next` was deleted. Three theme files load four Google families at **build** time:
`src/themes/clean-blue/font.ts:1` (Anuphan) · `src/themes/minimal-mono/font.ts:1` (Noto Sans Thai) · `src/themes/luxury-gold/ThemeRoot.tsx:7` (Noto Sans Thai Looped + Noto Serif Thai).
**Design: the build no longer fetches fonts.** The four families become local woff2 files in the repo, loaded with `next/font/local`. The objects keep the same API (`className`, `style.fontFamily`, `variable`), so no user of them changes. That removes the internet need, which the PM prefers (the SIT network is unknown, REQ-123 Q1), and it removes the loader that failed. The cause of the failing first fetch is not proven: base online builds passed here (E1), so it is intermittent; *inferred — a bad cached Google response in `.next/cache`; not reproduced*. It does not matter for this design, because that code path is gone.

## What I ran (scratch clone of 3096bca, real repo untouched)
- **E1 base, online:** `bun run build` → exit 0, 13 Google woff2 in `.next/static/media` (20.6 s).
- **E2 base, offline** (`unshare -rn sh -c 'ip link set lo up; … bun run build'`): **exit 1**, `There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Anuphan…`. (Without `ip link set lo up` the build hangs with no output: Turbopack needs loopback. That is a harness detail, not a product fact.)
- **E3 patched, offline:** exit 0, `✓ Compiled successfully`, 4 woff2 in `.next/static/media` (`anuphan-…`, `noto_sans_thai-…`, `noto_sans_thai_looped-…`, `noto_serif_thai-…`), `grep -rl fonts.gstatic .next/static .next/server` → 0 files.
- **E4 half-way stop:** `timeout -s KILL 9 bun run build` → exit 137, partial `.next` (cache, turbopack, server …), no `next-build` left (`ps`). Then an offline build → **exit 0**.
- **E5:** `bun run typecheck` → exit 0; `bun test src scripts` → 246 pass / 0 fail (the same as round 1, TEST-120 AC-8).
- **E6 same faces as Google serves today** (fontTools `name` ID 5 + `fvar`): Anuphan 3.002 · Noto Sans Thai 2.002 · Noto Sans Thai Looped 2.000 · Noto Serif Thai 2.002 — equal to the files from `fonts.gstatic.com` (fetched 2026-10-30). Google serves the width axis pinned; ours are pinned to wdth=100 too, and keep weight variable over the range each theme uses.

## D1 — the font files (no shape change)
Built once by `tests/harness/req-123-r2/build-fonts.sh` (google/fonts @ `6157dfaa640c`, OFL; fontTools 4.65.0 instancer + subset → woff2; all code points the source has, all layout features). The set to commit is **`tests/harness/req-123-r2/fonts/`** (sha256 in `SHA256SUMS` there). A re-run gives files a few bytes different (table timestamps), so the committed files are the artifact, not the script.

| File (copy as is) | Goes to | Weight range | Size |
|---|---|---|---|
| `anuphan.woff2` + `anuphan.OFL.txt` | `src/themes/clean-blue/fonts/` | 400–700 | 63 452 B |
| `noto-sans-thai.woff2` + `noto-sans-thai.OFL.txt` | `src/themes/minimal-mono/fonts/` | 400–800 | 46 440 B |
| `noto-sans-thai-looped.woff2` + `.OFL.txt` · `noto-serif-thai.woff2` + `.OFL.txt` | `src/themes/luxury-gold/fonts/` | 400–600 · 500–700 | 39 484 · 40 584 B |

The OFL asks for its text to travel with the font, hence the `.OFL.txt` beside each file.

## D2 — the three loaders
Exactly `tests/harness/req-123-r2/fonts-local.patch` (3 files, +18 −15): `import localFont from "next/font/local"`; `src: "./fonts/<file>.woff2"`; `weight: "<min> <max>"` as in D1; `display: "swap"` kept; mono's `fallback` list kept; gold's `variable: "--lg-font-serif"` / `"--lg-font-sans"` kept; `subsets` dropped (local fonts have none). One comment line in each says why the file is local.
Consumers (probe): the exported objects keep type `NextFont` / `NextFontWithVariable`; users are `clean-blue/Root.tsx:13,37` (`style.fontFamily`, `className`), `minimal-mono/MonoRoot.tsx:35` (`className`), `minimal-mono/theme.ts:22` (`style.fontFamily`), `luxury-gold/ThemeRoot.tsx:38` (`variable`). Checked with `tsc` on the patched tree (E5 → 0 errors), not with `probe-change.sh`: no type or field changes, only the loader behind them. → untouched — same members, same types.

## D3 — README
No change. The build needs no internet for fonts now, so req 9's "say so under prerequisites" does not arise. `bun install` still needs the npm registry, as before.

## Flow
fresh clone → `bun install --frozen-lockfile` → `bun run build` (fonts read from `src/themes/*/fonts/`, no fetch) → `bun run start`.

## Non-functional
Page weight per theme: one or two files of 39–63 KB, the same order as Google's thai+latin subsets. Preload and fallback metrics are made by `next/font/local` as before.

## Risks, assumptions, unknowns
- **R1 — look (AC-10).** Same font versions (E6), so after load the glyphs should match. The fallback face shown before load is computed by `next/font/local` from the file, not from Google's metrics table, so the moment before swap may differ slightly. **Settled by:** QA's before/after screenshot (AC-10), taken after fonts load.
- **R2 — Google updates a font later.** Ours stays at the committed version. That is intended: the build is reproducible. A refresh = re-run `build-fonts.sh` with a new pin.
- **A1:** Vietnamese/Latin-ext code points are kept (Google served them too), so nothing that showed before goes missing.

## Tasks
- TASK-161: blueprint-front — local font files + `next/font/local` in the three theme loaders. Owner: FE Fern (depends on: REQ-123 r1 committed 3096bca ✓)

AC map (round 2): AC-9 → D1 + D2 (E3, E4; QA's 3 fresh clones + half-way stop) · AC-10 → D2 keeps family/weights/variables; R1 → QA screenshot; suites → TASK-161 DoD.

## Questions
None.
