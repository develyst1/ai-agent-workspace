# Environment lessons — read only when the desk authorises you to touch a non-local environment

Default: you do **not** deploy, push, tag, ssh or run SQL anywhere but your own machine. This file
applies only when the desk's BE file explicitly authorises a specific action. The authorisation is
per action; it does not generalise to the next one. Environment facts (hosts, ports, paths,
process names, database names) come from the desk — never from memory or another project.

Generic lessons learned on shared servers:

1. **Assume the server is shared.** One host often runs many unrelated apps, one reverse proxy and
   one database server with many databases. Your blast radius is everyone on it.
2. **Validate shared config before reloading it.** A syntax error in one reverse-proxy site file,
   reloaded, can take *every* site on the host down at once. Always run the proxy's config test
   (e.g. `nginx -t`) and see it pass before any reload. Never edit the global/shared block for one
   app's need without the desk's explicit go.
3. **Stop → delete → unpack → restart means downtime.** The app is down for the whole unpack. Prefer
   unpack-beside-then-switch (new directory, then swap/symlink/restart) and keep the previous
   build to roll back to.
4. **Keep a rollback before you change anything**: the previous build, the process-manager dump,
   a DB backup if a migration runs. If none exists, say so before proceeding.
5. **Check the port is free** before assigning one; a collision fails the new app or breaks the
   old one.
6. **Connection strings are the most dangerous line in the config.** Confirm the database name and
   host point at *your* app's database; on a shared DB server a wrong name writes into someone
   else's data.
7. **Placeholders are not secrets.** Generate real values for placeholder secrets at setup; never
   copy one environment's secret into another; never paste them into a log or TASK.
8. **Persist process-manager state in the right home.** Saving to the wrong user/home means apps
   vanish after a reboot. Verify where the boot-time service reads from.
9. **Verify from the outside** after any change: the public URL responds, TLS is valid, the logs
   are clean — paste the evidence.
10. **Read-only survey first.** When unsure of the state, look (list processes, ports, configs)
    without changing anything, write down what you found, then propose the change.

For the actual deploy recipe on a supported stack, use `anthropic-skills:develyst-deploy` — still
only under the desk's explicit authorisation.
