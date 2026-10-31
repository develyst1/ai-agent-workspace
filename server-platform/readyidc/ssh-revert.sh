#!/bin/sh
# Dead-man switch: if deploy did not confirm a working SSH login, put the old sshd drop-ins back.
B="$1"
[ -f /home/deploy/.ssh-guard-ok ] && { echo "guard: confirmed, nothing to do"; exit 0; }
cp -a "$B"/sshd_config.d/. /etc/ssh/sshd_config.d/
rm -f /etc/ssh/sshd_config.d/00-hardening.conf.new
sshd -t && systemctl reload ssh
echo "guard: NOT confirmed in time, old sshd drop-ins restored"
