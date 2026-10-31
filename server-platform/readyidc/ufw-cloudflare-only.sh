#!/bin/sh
# Close the Cloudflare-Access bypass: web ports 80/443 accept only Cloudflare's IP ranges.
# SSH (22) is not touched. Run as root, once. Otto, 2026-11-01 (SECURITY-REVIEW gap 1).
# Ranges copied from https://www.cloudflare.com/ips-v4 and /ips-v6 on 2026-11-01. They change rarely; re-check monthly.
set -eu

CF4="173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22"
CF6="2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32"

echo "== BEFORE"
ufw status numbered

echo "== 1/3 allow 80,443 from each Cloudflare range (added first, so the web never goes dark)"
for n in $CF4 $CF6; do
  ufw allow proto tcp from "$n" to any port 80,443 comment cloudflare >/dev/null
done

echo "== 2/3 remove the old 'from anywhere' rules for 80 and 443 (IPv4 + IPv6)"
ufw --force delete allow 80/tcp
ufw --force delete allow 443/tcp

echo "== 3/3 check"
ufw status verbose
ufw status | grep -qE "^22/tcp +ALLOW" || { echo "SSH RULE MISSING: re-adding 22/tcp"; ufw allow 22/tcp; }
echo UFW-CLOUDFLARE-OK
