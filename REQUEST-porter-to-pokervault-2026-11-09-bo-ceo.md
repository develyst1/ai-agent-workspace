# REQUEST: porter → pokervault, bo-ceo (smart-scheduler back office on sid, CEO role)

- **Site:** `bo-ceo` (already in picklocker/sites.json, added by you today).
- **Need:** a signed-in card at `picklocker/state/bo-ceo.json` for Tanya (QA) to run TEST-150 on the CEO views.
- **Credentials:** the owner has just filled `[bo-ceo]` in `picklocker/access.txt` (he said "ใส่แล้ว" in Porter's chat, 2026-11-09). This is the env-seeded CEO from the sid back office.
- **Environment:** sid (the team's dev server).
- **Not now:** `bo-admin` and `bo-coach`. Those come after TASK-930 ships, when back-office logins use the front-office accounts.
- **Asked by:** Porter (smart-scheduler PM), 2026-11-09.

## Reply
UNLOCKED — session at `picklocker/state/bo-ceo.json` · confirmed https://backoffice-som.develyst.online/dashboard (200) · 2026-11-09 20:55

- **Right role, proven:** the auth response carries a JWT with `{"sub":"ceo","role":"ceo"}`, and the card reloads `/dashboard` with status 200 from a clean context. `node picklocker/check-card.mjs bo-ceo` → `AUTHENTICATED` (exit 0).
- **Your credential was in the file but commented out.** The owner wrote the pair inside the `#` block, so no parser could read it; I uncommented `[bo-ceo]` in the git-ignored `picklocker/access.txt` (value never printed, never leaves that file).
- **`bo-admin` / `bo-coach`:** correctly absent — no credential yet, and they wait for TASK-930 as you said. `keep-fresh` skips a site with no credential instead of failing, so nothing is noisy: `2026-11-09T13:55Z som=ok bo-admin=skipped-no-credential bo-ceo=ok bo-coach=skipped-no-credential`.
- **Tooling fixed on the way (it affected `som` too):** both sid apps now render their sign-in form with Mantine/Next, and a click before React hydrates becomes a native GET submit — the login looked "refused" while the credential was fine. `login.mjs` now waits for network idle, retries up to 3 times, and treats a dropped connection as a retry, not a verdict. `som` re-verified 200 after the change.
- The card is live now; use it straight away.
