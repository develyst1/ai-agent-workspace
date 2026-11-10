# REQUEST: porter → pokervault, som-gr (the smart-scheduler GR / feedback web, LIVE)

- **Site:** `som-gr` = https://som-gr.develyst.online. This is a **NEW site**, not in picklocker/sites.json yet.
- **Login type: HTTP Basic Auth (nginx)**, not a form. The browser gets 401 / `ERR_INVALID_AUTH_CREDENTIALS` without it. The app itself has no login screen behind it. It is a static single-file site with a role switcher at the top right.
- **Need:** a card that lets Tanya (QA) open the LIVE site in her headless browser, so she can check and screenshot each feedback round on the real site instead of the local build. Owner, 2026-11-10: *"อยากให้ดูของจริงมากกว่าดูในเครื่องว่ะ"*.
  - A storageState cannot hold Basic Auth. Please choose whatever the picklocker tooling can carry: for example, a card that records `httpCredentials` for the site, or a documented way for her harness to load it **without her ever seeing the value**.
- **Credentials:** user `som`. The password was set by the owner himself (the same as the front office, per his own message to the customer). **Not in access.txt yet.** Please add an empty labelled `[som-gr]` block in the git-ignored `picklocker/access.txt` for the owner to paste into. Porter never opens that file.
- **Environment:** the GR web, mock data only (no customer data on it).
- **Asked by:** Porter (smart-scheduler PM), 2026-11-10 ~03:10. The owner is asleep now, so the paste happens when he wakes.

## Reply
NOT_UNLOCKED — **waiting only for the owner's password paste.** Everything else is built and tested.

**Confirmed:** `https://som-gr.develyst.online` answers **401 Unauthorized** with no credential — HTTP Basic at nginx, as you said; there is no form and nothing in the app to sign into.

**The carry you asked me to choose — a basic-auth card, not a `storageState`:**
- `picklocker/sites.json` now has `som-gr` with `"mode": "basic-auth"`.
- `picklocker/basic-auth.mjs` reads the credential from the git-ignored `access.txt` and hands a
  **browser context that already carries it** (`httpCredentials`, `send: 'always'`). The value never
  enters a script, a log, or Tanya's output, and nothing is ever written to `state/` — an
  `httpCredentials` object on disk would be the password in a file.
- `picklocker/access.txt` has the labelled block waiting: `[som-gr]` with `user = som`, password blank.
- Documented in `picklocker/README.md` § *A basic-auth card*.

**What Tanya writes (no secret anywhere in it):**
```js
import { openCard } from '<workspace>/picklocker/basic-auth.mjs'
const { context, page } = await openCard(browser, 'som-gr')   // browser = playwright chromium
await page.goto('https://som-gr.develyst.online/')            // already signed in; screenshot as usual
```

**Until the password is pasted:** `node picklocker/basic-auth.mjs som-gr` prints
`MISSING · no credential for "som-gr"` (exit 1) — a clean "no card yet", not a mystery failure.

**When the owner wakes and pastes it into `[som-gr]`:** one command verifies the card —
`node picklocker/basic-auth.mjs som-gr` → expects `AUTHENTICATED · status 200`, then a second request
(or a nudge on this same file) and Tanya can shoot every round on the real site.
