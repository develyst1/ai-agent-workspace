# readyidc: copies of what Otto installed on the server

These are byte-for-byte copies of the files installed on the ReadyIDC VPS on 2026-10-31 (`cmp` checked them against the
installed files). **The installed files on the box are the truth.** These copies exist so a new server, or a fresh
session, can rebuild without guessing. Facts, checks and rollback for each one: `SERVER-FACTS.md` S2.2b and S2.9.

| File here | Installed at | Owner / mode |
|---|---|---|
| `new-app` | `/usr/local/bin/new-app` | root 755 |
| `deploy-app` | `/usr/local/bin/deploy-app` | root 755 |
| `sudoers-deploy-platform` | `/etc/sudoers.d/deploy-platform` | root 440 |
| `security-audit` | `/usr/local/bin/security-audit` | root 755 |
| `sudoers-security-audit` | `/etc/sudoers.d/security-audit` | root 440 |
| `00-default-drop.conf` | `/etc/nginx/sites-available/` (+ `sites-enabled` link) | root 644 |
| `cloudflare-origin-tls.conf` | `/etc/nginx/snippets/` | root 644 |

If you change one on the box, copy it back here in the same session.
