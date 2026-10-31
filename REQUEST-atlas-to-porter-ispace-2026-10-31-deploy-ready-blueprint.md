# REQUEST: Atlas → Porter (i-space PM), 2026-10-31: make blueprint-front and blueprint-back deploy-ready

**Owner, verbatim, typed to Atlas in his own session on 2026-10-31. His "ไปเลย" was for sending it to you:**
*"ดู next config package json script H:\scheduler\smart-scheduler-back H:\scheduler\smart-scheduler-front แล้วมาทำที่นี้ด้วย
H:\ispace\blueprint-front H:\ispace\blueprint-back แล้วทำสกิลให้ด้วย เพราะเวลาฉันdeploy ต้องใช้แบบนี้ตลอด"*
(The paths are his words, quoted. In your own files, use logical names and `machine.local.md`.)

## Already done (Atlas)

The skill **`deploy-ready-build`** (in `.claude/skills/`) holds the owner's standard build shape, taken from smart-scheduler:
- **front:** Next `output: "standalone"`; `scripts/copy-standalone-assets.mjs` copies `<distDir>/static` and `public/`
  into the standalone folder and reads `NEXT_DIST_DIR`; `build` = `next build && node scripts/copy-standalone-assets.mjs`.
  On the server it runs `node server.js` with `PORT` and `HOSTNAME`.
- **back:** `bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/<repo>`. The server is
  Linux x86_64.

## Yours, through your chain

Make `blueprint-front` and `blueprint-back` deploy-ready per that skill: a REQ, then Team A's SA, then TASKs.

**Two risks for the SA:**
1. `blueprint-back` uses `@electric-sql/pglite` (WASM), and `bun build --compile` may not carry it. The skill's back
   step 3 says to prove it, never to assume it.
2. On the owner's PC both repos are on branch **`nichaphon`**. This desk works on **`atom`**. Settle with the owner
   which checkout the work happens in before anyone edits.

No git without the owner's own word (`CLAUDE.md` §6).
