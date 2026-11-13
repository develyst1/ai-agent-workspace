#!/usr/bin/env bash
# som-gr-gate.sh: put ONE shared password (nginx Basic Auth) on https://som-gr.develyst.online.
# Run by the OWNER, as root:  sudo bash ~/som-gr-gate.sh
# It asks for the password twice. The value is never printed, logged or seen by any agent;
# only its apr1 hash is stored, in /etc/nginx/htpasswd-som-gr (root:www-data 640).
# Login name for everyone: som  (change USER_NAME below before running if the owner wants another).
# Re-run any time to change the password. Roll back: restore the .bak file it prints, then nginx -t && systemctl reload nginx.
set -euo pipefail
USER_NAME=som
SITE=/etc/nginx/sites-available/som-gr.conf
PWFILE=/etc/nginx/htpasswd-som-gr

[ "$(id -u)" = 0 ] || { echo "run with sudo"; exit 1; }
[ -f "$SITE" ] || { echo "missing $SITE"; exit 1; }

# 1. the password (asked twice, hidden)
read -rsp "Shared password for som-gr: " P1; echo
read -rsp "Again: " P2; echo
[ -n "$P1" ] || { echo "empty password, nothing changed"; exit 1; }
[ "$P1" = "$P2" ] || { echo "the two did not match, nothing changed"; exit 1; }
HASH=$(printf '%s' "$P1" | openssl passwd -apr1 -stdin)
unset P1 P2
install -o root -g www-data -m 640 /dev/null "$PWFILE.new"
printf '%s:%s\n' "$USER_NAME" "$HASH" > "$PWFILE.new"
mv "$PWFILE.new" "$PWFILE"
echo "1/3 password hash written to $PWFILE (login name: $USER_NAME)"

# 2. the two auth lines in the HTTPS server block (only once)
if grep -q 'auth_basic_user_file' "$SITE"; then
  echo "2/3 site already has the gate, kept as is"
else
  BAK="$SITE.bak-$(date +%Y%m%d-%H%M%S)"
  cp -p "$SITE" "$BAK"
  [ "$(grep -c '^    index index.html;$' "$SITE")" = 1 ] || { echo "unexpected site layout, nothing changed"; exit 1; }
  awk -v f="$PWFILE" '{print} /^    index index.html;$/{print "    auth_basic \"SOM requirement\";"; print "    auth_basic_user_file " f ";"}' "$BAK" > "$SITE"
  echo "2/3 gate lines added (backup: $BAK)"
fi

# 3. check and reload; put the old site back if the check fails
if nginx -t 2>/dev/null; then
  systemctl reload nginx
  echo "3/3 nginx reloaded. Done: the site now asks for a login."
else
  [ -n "${BAK:-}" ] && cp -p "$BAK" "$SITE"
  nginx -t || true
  echo "3/3 nginx check FAILED, old site restored. Nothing is live. Tell Otto."
  exit 1
fi
