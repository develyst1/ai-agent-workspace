#!/bin/sh
# Otto 2026-11-01: SECURITY-REVIEW gaps 2,3,4,5,7,8 in one sitting. Run as root, once.
# Every file it changes is copied to $B first. Nothing here touches the firewall, nginx, the apps or qemu-guest-agent.
set -u
TS=$(date +%Y%m%d-%H%M)
B=/root/otto-backup-$TS
S=/home/deploy/harden-stage
mkdir -p "$B/sshd_config.d"
echo "backups -> $B"

echo "== 0/6 (read-only) why was the owner's PC banned on 2026-10-31?"
grep -hE "Ban|Unban|Found" /var/log/fail2ban.log* 2>/dev/null | grep "223\.24\." | tail -6
journalctl -u ssh --since "2026-10-31 15:00" --no-pager -o cat 2>/dev/null | grep "223\.24\." \
  | grep -vE "^Accepted|session (opened|closed)|Received disconnect|Disconnected from user" \
  | sed -E "s/port [0-9]+/port N/" | sort | uniq -c | sort -rn | head -6

echo "== 1/6 fail2ban: never ban the admin machines"
cp -a /etc/fail2ban/jail.local "$B/"
install -o root -g root -m 644 "$S/jail.local" /etc/fail2ban/jail.local
if fail2ban-client -t >/dev/null 2>&1; then
  systemctl restart fail2ban; sleep 2
  for ip in 223.24.156.113 223.24.171.7 202.129.207.248; do fail2ban-client set sshd unbanip "$ip" >/dev/null 2>&1 || true; done
  fail2ban-client get sshd ignoreip
else
  cp -a "$B/jail.local" /etc/fail2ban/jail.local; echo "STOP: fail2ban config test failed, old jail.local restored"; exit 1
fi

echo "== 2/6 + 3/6 SSH: hardened 00- file, provider's 99-custom.conf (root+password ON) removed"
cp -a /etc/ssh/sshd_config.d/. "$B/sshd_config.d/"
install -o root -g root -m 644 "$S/00-hardening.conf" /etc/ssh/sshd_config.d/00-hardening.conf
rm -f /etc/ssh/sshd_config.d/99-custom.conf
if ! sshd -t; then
  cp -a "$B/sshd_config.d/." /etc/ssh/sshd_config.d/
  echo "STOP: sshd -t failed, old sshd drop-ins restored"; exit 1
fi
systemctl reload ssh
sshd -T | grep -E "^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|allowusers|maxauthtries|logingracetime|x11forwarding|allowtcpforwarding|allowagentforwarding) "
install -o root -g root -m 700 "$S/ssh-revert.sh" "$B/ssh-revert.sh"
rm -f /home/deploy/.ssh-guard-ok
systemd-run --unit="otto-ssh-guard-$TS" --on-active=10m /bin/sh "$B/ssh-revert.sh" "$B"
echo "SSH GUARD ARMED: restores the old SSH config in 10 min unless deploy confirms a new login"

echo "== 4/6 clock: provider blocks UDP 123, so take time from the KVM host clock (ptp_kvm)"
if modprobe ptp_kvm 2>/dev/null && [ -e /dev/ptp0 ]; then
  echo ptp_kvm > /etc/modules-load.d/ptp_kvm.conf
  cp -a /etc/chrony/chrony.conf "$B/"
  grep -q "refclock PHC /dev/ptp0" /etc/chrony/chrony.conf || echo "refclock PHC /dev/ptp0 poll 2 stratum 2  # KVM host clock (Otto 2026-11-01)" >> /etc/chrony/chrony.conf
  systemctl restart chrony; sleep 12
  if ! systemctl is-active -q chrony; then cp -a "$B/chrony.conf" /etc/chrony/chrony.conf; systemctl restart chrony; echo "chrony failed with the PHC line: old chrony.conf restored"; fi
  chronyc -n sources | tail -3; chronyc tracking | grep -E "Reference|Leap"
else
  echo "skip: ptp_kvm not available on this host; clock stays on kvm-clock (no change made)"
fi

echo "== 5/6 kernel: small sysctl hardening"
install -o root -g root -m 644 "$S/90-hardening.conf" /etc/sysctl.d/90-hardening.conf
sysctl -q --system
for k in net.ipv4.conf.all.send_redirects net.ipv4.conf.all.log_martians fs.suid_dumpable; do echo "$k = $(sysctl -n $k)"; done

echo "== 6/6 services a VPS never uses (disabled, not masked: reversible with systemctl enable --now)"
for u in ModemManager.service multipathd.service multipathd.socket udisks2.service apport.service snapd.service snapd.socket lxd-installer.socket iscsid.socket open-iscsi.service open-vm-tools.service; do
  systemctl disable --now "$u" >/dev/null 2>&1 || true
  printf "%-24s %s\n" "$u" "$(systemctl is-enabled "$u" 2>/dev/null)"
done
echo "qemu-guest-agent (provider's tool, untouched): $(systemctl is-active qemu-guest-agent)"

echo HARDEN-OK
