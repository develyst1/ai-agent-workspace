# Picklocker — log in once, everyone reuses the session

A workspace-level login helper. It removes the one job that stops the QA/tester from
working unattended: **obtaining an authenticated session on a deployed site.**

## The idea

Typing a password is the only step that trips the guardrail ("won't fill a password
unless the URL looks like a test site"). Picklocker removes the typing: it logs in
**once** against an allowlisted site, saves the browser session (`storageState`), and
every tester then **reuses the saved session** — no password is ever typed again, by
anyone, on any harness (Claude or DeepSeek).

## Safety model (non-negotiable)

1. **Allowlist only.** Credentials may only be sent to origins listed here
   (`*.develyst.online` — the owner's own domain). `login.mjs` refuses anything else.
2. **Credentials are never in a file.** They come from environment variables only
   (`PICKLOCK_USER_<SITE>` / `PICKLOCK_PASS_<SITE>`), or the harness credential store.
   Never committed, never printed.
3. **Saved sessions are git-ignored** (`state/`).
4. **The environment's own rules still bind.** On `uat` (the customer's system) the
   tester stays READ-ONLY — picklocker only hands over a login; it does not grant
   write access, and it never touches `uat` itself.

## Usage

```bash
# once per site (email/password logins only):
PW_PATH=<repo>/node_modules/playwright/index.mjs \
PICKLOCK_USER_SOM="..." PICKLOCK_PASS_SOM="..." \
node picklocker/login.mjs som
# → saves picklocker/state/som.json

# a tester's harness then loads that session:
#   const state = JSON.parse(fs.readFileSync('picklocker/state/som.json'))
#   await context.addCookies(state.cookies)
```

## Two kinds of login — read this before assuming

| Kind | Sites | Picklocker flow |
|---|---|---|
| **password** (auto) | email/password forms | `login.mjs <site>` fills + saves |
| **basic-auth** (context) | HTTP Basic at nginx (e.g. `som-gr`) | no form, no `storageState`: `basic-auth.mjs` hands a browser context that already carries the credential |
| **OAuth / Cloudflare Access** (manual-once) | Google sign-in (`possibility`), owner email + one-time PIN (`blueprint-sit`) | the **owner** signs in once in a real browser and exports the session into `state/<site>.json` (no password is ever given to an agent) |

### A basic-auth card — how a harness uses it without seeing the secret

```js
// no password in the script, none in the output
import { openCard } from '<workspace>/picklocker/basic-auth.mjs'
const { context, page } = await openCard(browser, 'som-gr')   // browser = playwright chromium
await page.goto('https://som-gr.develyst.online/')            // page is already signed in
// screenshot / read as usual; the credential lives only in the git-ignored access.txt
```

Check it from a shell (prints status + URL, never the value): `node picklocker/basic-auth.mjs som-gr`

**Rule:** a `basic-auth` card is never written to `state/` — an `httpCredentials` object would be the
password in a file. Only the context is handed over, and it dies with the browser.

### Other tools

- `check-card.mjs <site>` — read-only "is this session still signed in?" (GET only, never logs in).
- `keep-fresh.mjs` — reuse-verify every password-mode site; re-login only if lapsed; skips a site
  with no credential instead of failing.
- `probe.mjs <url>` — GET-only look at an allowlisted page's form; no credential, no click.
- `creds.mjs` — the shared credential lookup (env first, then `access.txt` sections).

## Files

- `sites.json` — the allowlist + per-site login URL, selectors, and read/write mode.
- `login.mjs` — logs in once and saves the session. Refuses non-allowlisted origins.
- `state/` — git-ignored saved sessions.

## The unlocker — how a tester calls you

You are the **unlocker**. Tanya (or any desk's QA) stays on her own harness; when a
login wall stops her, she calls you, you log in, and her work continues.

### To call (owner 2026-11-06: a desk's QA may call the unlocker directly)

Write a request file at the workspace root and nudge this session:

```text
REQUEST-<from>-to-picklocker-<date>-<site>.md
```

```markdown
# REQUEST — tanya → picklocker — som
- Site: som          # the key in sites.json
- Need: a signed-in session for <why>
- Environment: sid   # and its access rule (read-write / read-only)
```

### What you do, every time

1. Read the request; resolve `<site>` in `sites.json`.
2. Assert the origin is in the allowlist (`*.develyst.online`). Refuse anything else.
3. Log in (or reuse the saved session) and save `state/<site>.json`.
4. Verify by loading the authenticated page (status + final URL, not just "saved").
5. Reply in the same file:
   `UNLOCKED — session at picklocker/state/<site>.json · confirmed <url> · <time>`
   or `NOT_UNLOCKED — <reason>`.
6. The requesting desk re-reads the file after a short wait and continues; the owner is
   **not** the messenger. Never tell the owner to relay it.

### Boundaries

- You **unlock, you do not test**. Tanya tests.
- Only allowlisted `*.develyst.online` origins; never hand over a password.
- `uat` stays READ-ONLY: a login is fine, a write is not.
- Credentials live only in git-ignored `access.txt` or the harness credential store.
