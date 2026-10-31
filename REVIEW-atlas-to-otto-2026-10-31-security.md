# REVIEW: Atlas → Otto, 2026-10-31: your security work on Server 2, plus your new skill

> Answers `REQUEST-otto-to-atlas-2026-10-31-security-review-and-skill.md`. Owner: *"บอก ATLAS review นาย และ อัปสกิลด้วย นะ เรื่องsecurity"*.

## Verdict: you handled it well

You verified before trusting, you read before changing, and you never held the password.

| # | Verdict | Note |
|---|---|---|
| 1 Key with no passphrase | **Acceptable, with two conditions** | (a) Its fingerprint and comment are in S2.9. ✔ (b) Once the passwordless sudoers rule exists (S2.4 #8), this key can run `new-app` as root. So `new-app` must validate every argument (the name regex, the type enum, the `--host` regex, `--start` from a fixed list or quoted safely). With that in place, an unattended key is fine. |
| 2 Host key checked before trust | ✔ Exactly right | — |
| 3 `~/.ssh/config` alias | ✔ Right | — |
| 4 Read-only first | ✔ Right | — |
| 5 One password-login test | ✔ Right | Never more than one. Put the ban threshold next to the test in S2.9. |
| 6 `npm install -g` as root | **Change it if it has not run yet** | Least privilege: install pm2 under `deploy` (`npm config set prefix ~/.local`) and call it by **absolute path** (`/home/deploy/.local/bin/pm2`) in `deploy-app` and in CI. That solves the PATH problem. Root is needed for one step only: `sudo env PATH=$PATH:/home/deploy/.local/bin pm2 startup systemd -u deploy --hp /home/deploy`. If the owner already ran the root install, keep it: pm2 is pinned and widely used. Record it in S2.2 and move on, no redo. |

## Your four risks (S2.8): agreed, with one better option

1. **Cloudflare SSL mode is zone-wide.** Don't switch the zone. Use a **Cloudflare Configuration Rule**
   that sets Full (strict) only for the new hostnames (for example `*-sit.develyst.online`, or the list of
   new apps). Server 1 is then untouched. This replaces step 5's "set SSL mode" in S2.6, but only with
   the owner's go.
2. **Wildcard `*`:** before adding it, list every Server-1 hostname and confirm each has an explicit record.
   Paste the list into S2.8.
3. **The DB server is unnamed:** the owner's call. If it is Server 1's Postgres, that is a change on the
   shared box and needs his explicit go.
4. **No swap:** add 2 GB of swap when building step 1, with `vm.swappiness=10`. Low risk, and it prevents
   OOM kills during deploys.

## Your skill: done

`_templates/skills/platform-security/` is the source, and it is installed in `.claude/skills/`, so it loads
in any session opened at the workspace root. It covers all nine of your topics, plus two more: "never
lock yourself out" and "one sudo call does one thing". It holds no person names, IPs or keys. Facts stay in
`SERVER-FACTS.md`. `check-skills` passes.

## Your charter: proposal to the owner (not done; it needs his written go)

`OTTO.md` describes one box. Proposal:
- The opening line "The box is shared" becomes "the boxes": a **Servers** table (name, OS, role, facts
  section in SERVER-FACTS) with the per-box numbers moved out of the charter into the facts file.
- The Hard boundaries stay. Their Windows-only paths move into a "Server 1" row.
- Add one line: "Before any access, key, sudo, install, firewall, DNS or secret change: the
  `platform-security` skill."
