---
name: deploy-ready-build
description: "Load when a desk's Next.js front or Bun back must produce a build the owner can deploy — setting up or checking next.config, package.json build/start scripts, the standalone asset copy, or the Bun single-binary compile — e.g. 'ทำให้ deploy ได้', a new repo's first build, or a repo that builds but won't run on the server. The owner's standard shape, proven in production: front = Next `output: standalone` + a copy of static/public into it; back = `bun build --compile` to one binary for the Linux server. Do NOT use for running a deploy (that is the owner's or the platform role's), for server setup, or for stacks other than Next.js / Bun."
---

# deploy-ready-build — the owner's standard build shape

The owner deploys every project the same way (`SERVER-FACTS.md` S2.4): CI builds an **artifact**, ships it, and the
server runs it with pm2 behind nginx on `127.0.0.1:<PORT>`. A repo is "deploy-ready" when its own `build` script
produces that artifact with nothing done by hand. Proven shape: the owner's longest-running production front and back.

**This skill changes build configuration only, inside a TASK, by the engineer who owns the repo.** It never runs a
deploy, never touches a server, and never runs git (git is the owner's word: `CLAUDE.md` §6).

## Front — Next.js

1. **`next.config.ts`:** add `output: "standalone"`. Keep everything else, including a `distDir` override such as
   `distDir: process.env.NEXT_DIST_DIR || ".next"`. Dev-only lists (`allowedDevOrigins`) are not needed for deploy.
2. **Copy script:** add `scripts/copy-standalone-assets.mjs` from this skill's
   `references/copy-standalone-assets.mjs`. Standalone output leaves out `<distDir>/static` and `public/`, and without
   them the pages load with no CSS or JS. The script reads the same `NEXT_DIST_DIR` as the config.
3. **`package.json` scripts:**
   - `"build": "next build && node scripts/copy-standalone-assets.mjs"`. Keep an existing `prebuild` as it is.
   - Leave `dev` and `start` (`next start`) for local use. **On the server the start command is
     `node server.js` inside the standalone folder**, with `PORT` and `HOSTNAME=127.0.0.1` from the environment.
     A hard-coded `-p` in `start` does not reach the server.
4. **Artifact:** the folder `<distDir>/standalone/`. Nothing else is shipped.
5. **Check, with output pasted into the TASK:** run `bun run build`, then look for `<distDir>/standalone/server.js`,
   `<distDir>/standalone/<distDir>/static/` and, where the repo has `public/`, `standalone/public/`. Then run
   `PORT=<free port> HOSTNAME=127.0.0.1 node <distDir>/standalone/server.js` and confirm with `curl -I` that the page
   and one `/_next/static/...` file both return 200.

## Back — Bun

1. **`package.json` `build`:**
   `"build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/<repo-name>"`.
   - **`--target=bun-linux-x64` is required:** the server is Linux x86_64, and a build made on Windows or a Mac
     without it will not run there. (An older back end built for a Windows box has no target. Do not copy that part.)
   - The entry point is the file that calls `Bun.serve` (check it; it is not always `src/index.ts`).
2. **The entry reads its settings from the environment:** `PORT`, `HOST` (default `127.0.0.1`), and the database URL.
   A compiled Bun binary loads `.env` from its working directory, and the server links `shared/.env` there.
   Never put a secret in the build.
3. **Check what `--compile` cannot carry.** WASM, native addons, or files read from disk at runtime (migrations,
   templates, `assets/`) are not bundled automatically. Look for them, for example `@electric-sql/pglite`, `*.wasm`,
   `readFileSync(` on a repo path, or the migrations folder. Each one is shipped beside the binary and its path set
   from an env var, or the TASK says why it is not needed in production. **Never assume it is bundled: prove it**
   (step 5).
4. **Artifact:** `dist/<repo-name>`, plus any folder from step 3.
5. **Check, with output pasted:** run `bun run build`, then `file dist/<repo-name>`, which must say ELF x86-64. If you
   can run Linux (WSL, CI, a Linux box), start it with `PORT=<free> ./dist/<repo-name>` and `curl` one real route.
   If you cannot, write `UNVERIFIED — the binary was not run on Linux; settles in CI's first run`.

## Before you hand back

- `typecheck` / `lint` / tests still pass, if the repo has them: CI runs them before the build (S2.4 #12).
- `.gitignore` covers `dist/`, `.next*/` and `*.zip`, so build output is never committed.
- One line in the TASK: the artifact path, and the start command the server will use.
