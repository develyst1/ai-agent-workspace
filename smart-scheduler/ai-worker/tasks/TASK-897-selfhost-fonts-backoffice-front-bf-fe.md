# TASK-897 — FE: self-host the fonts (stop `next build` fetching Google Fonts at build time) — backoffice-front — @Fern

**From @Sober, 2026-11-09. Deploy blocker (Silver found it): BF `next build` uses `next/font/google`, which fetches from Google at build time — a deploy box without reliable internet fails the build.** Repo `smart-scheduler-backoffice-front`, branch `dong`. **Must be done before the backoffice sid deploy.** Git only on the owner's word. Small (~0.5 d).

## What to do
- Replace the `next/font/google` import(s) with **`next/font/local`**, with the font files committed under the repo (e.g. `src/app/fonts/` or `public/fonts/`). Use the same families/weights the UI currently uses (keep the look identical) — include the Thai-capable family the shell uses.
- Fonts under an OFL/Apache licence, with the licence file committed beside them (same discipline as 879's Sarabun).
- **Prove `next build` runs with no network** (the acceptance): the build must not reach out to fonts.googleapis.com. If you can't cut the network, at least confirm no `next/font/google` import remains (grep) and the build succeeds offline-equivalently.

## Done = (evidence in `## Implementation Notes`)
- `grep -rn "next/font/google" src` → **no output** (all replaced).
- `tsc` 0 · `next build` 0 · the screens render with the same fonts (a screenshot or a note that the family/weights are unchanged).
- `git status` = only your files (the font files + the import changes + the licence); no git command.

## Claim
backoffice-front: the `next/font` imports (likely `app/layout.tsx` + wherever a font is declared), the committed font files + licence. **I (Sober) review** — Team A. Coordinate with your TASK-895 (transport card) — do these in either order; both are small.

## Questions / Implementation Notes / Review
_(—)_

## Questions (Fern, 2026-11-09) — BLOCKED on one owner approval (a download)
Found: only `src/app/layout.tsx` uses `next/font/google` (Noto Sans Thai 400/500/600/700 thai+latin, IBM Plex Mono 400/500/600 latin). The swap to `next/font/local` is small and I have not started it, because **the font files are not on this machine**: the stale `.next/static/media` holds a few Plex Mono subsets and no Noto Sans Thai, and the only Thai fonts in Windows (Leelawadee, Tahoma) are proprietary, so they cannot be committed.
- **Needs the owner's yes (a download, my rules bar it without his word):** fetch the two OFL families as woff2, with their licence files. Proposed source: the npm tarballs `@fontsource/noto-sans-thai` and `@fontsource/ibm-plex-mono` from registry.npmjs.org (unpacked, not installed into the project; I would copy only the woff2 files for the weights above, plus `LICENSE`). Size: well under 1 MB in total.
- If he prefers another source (the google/fonts GitHub repo, or files he supplies), say which.
- Once I have the files: `next/font/local` in `layout.tsx`, same CSS variables and weights, `grep -rn "next/font/google" src` empty, tsc 0, build 0 (and a build with the network blocked if I can), report here.
