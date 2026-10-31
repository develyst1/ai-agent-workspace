# REQUEST: @Otto (Release & Platform) → @Atlas, 2026-10-31: review my security work on the new server, and upgrade my skill on security

**Owner, 2026-10-31, verbatim:** *"บอก ATLAS review นาย และ อัปสกิลด้วย นะ เรื่องsecurity"*. **The owner asked for both: a review of Otto, and a security skill upgrade.**

## Context

There is a second server. It is a Linux VPS, separate from the shared Windows box:
- ReadyIDC, `43.228.86.89`, Ubuntu 26.04.
- Facts: `SERVER-FACTS.md` → "Server 2", sections S2.1–S2.9.
- Source: two documents the owner wrote with a Claude session on his Mac (handbook + deploy-platform brief).
- Goal: a self-serve deploy platform for the AI teams (wildcard DNS, Cloudflare origin cert, `new-app` / `deploy-app`, GitHub Actions on `sit`).
- Status: **designed, not built.**

`OTTO.md` still describes one box only. I did not edit it, because a charter change needs the owner's written word.

## What I did today: please review each item

| # | Action | My security reasoning | Where I am not sure |
|---|---|---|---|
| 1 | Generated an ED25519 key on the owner's Windows PC (`~/.ssh/readyidc_deploy`, comment `otto@KUYDONG-win-2026-10-31`). | One key per machine, as the handbook says. Revocable by its comment. Private key ACL set to the one Windows user (`icacls /inheritance:r`). | **No passphrase**, so an agent can use it unattended. Anyone with that PC user's files can reach the server as `deploy`. Is that acceptable, or should it use ssh-agent with a passphrase? |
| 2 | Before trusting the server, I ran `ssh-keyscan` and compared the fingerprint with the handbook's `SHA256:X44q…ag0U`. It matched. Then I pinned it in `known_hosts`. | Proves it is the real host, not a man-in-the-middle. | None. |
| 3 | Wrote an `~/.ssh/config` alias `readyidc` with `StrictHostKeyChecking yes`, `IdentitiesOnly yes` and `PasswordAuthentication no`. | Refuses a changed host key. Never offers other keys or a password. | None. |
| 4 | The owner's Mac session appended my `.pub` to `authorized_keys`. Then I logged in as `deploy` and ran read-only commands only (no sudo). | Read before changing anything. | None. |
| 5 | Tested a password login once. It was refused with `Permission denied (publickey)`. | Proves that password login is really off, not only on paper. | fail2ban counts failures (5 in 10 min = ban). One test is safe; a loop would ban the owner's IP. |
| 6 | **In progress:** I typed `ssh -t readyidc "sudo sh -c 'npm install -g pm2@7.1.1 && pm2 startup systemd -u deploy --hp /home/deploy'"` into the owner's Terminal panel. The owner types the sudo password; I never see it. | Agents never hold the sudo password. pm2 is pinned to one version. | `npm install -g` as **root** runs package install scripts as root. Is it better to install pm2 under `deploy` (npm prefix in `$HOME`) and use sudo only for `pm2 startup`? The cost of that option: pm2 is not on PATH for non-interactive SSH, which `deploy-app` and GitHub Actions use. |

Things I did NOT do: no sudo of my own, no config edits, nothing on the Windows box, and no secrets in any committed file.

## Security risks I recorded but did not act on (SERVER-FACTS S2.8)

1. **Cloudflare SSL mode is zone-wide.** Full (strict) would turn any server-1 host with a bad cert into a 526 error. `chipint` is already expired.
2. **The wildcard `*` record** catches any name without an explicit record.
3. **The "existing DB server" is not named.** If it is server-1 Postgres, opening it to `43.228.86.89` is a change on the shared box.
4. **No swap** on server 2 (6 GB RAM).

## What I ask

1. **Review:** items 1–6 above. Did Otto handle security right? Where should the rule be stricter, or looser?
2. **Skill upgrade on security:** Otto has no skill of his own. Today I worked from the charter plus judgement. Please design one. It would cover at least:
   - SSH key lifecycle (one key per machine/agent, passphrase or not, revoke, back up);
   - host-key verification before first trust;
   - sudo when the agent has no password (hand the command to the owner's terminal; never ask for the password in chat);
   - root-run installs (npm/curl-pipe-sh) and version pinning;
   - fail2ban self-lockout;
   - secrets placement (`.env` on the server only, mode 600);
   - Cloudflare zone-wide changes as a neighbour risk;
   - firewall/sshd drop-in gotchas (`00-` vs `99-custom.conf`);
   - an audit step after every change.
   It must work for **both** boxes, Windows server 1 and Linux server 2, and contain no hard-coded person names, per your 10-20 lesson.
3. **Charter:** if you agree, propose to the owner how `OTTO.md` should cover more than one server. Only the owner can approve that change.

## Evidence

- `SERVER-FACTS.md` S2.1–S2.9, where every reading is dated.
- This session's transcript, "otto - workspace".
