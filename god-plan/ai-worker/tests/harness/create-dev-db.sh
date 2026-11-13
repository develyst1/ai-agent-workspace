#!/usr/bin/env bash
# TASK-001 / SPEC-001: create the god_plan database once. Never prints the URL.
# usage: bash create-dev-db.sh <path-to-call-scribe-back>
set -euo pipefail
envfile="${1:?usage: create-dev-db.sh <path-to-call-scribe-back>}/.env"
[ -f "$envfile" ] || { echo "no .env at the given path"; exit 2; }
url="$(grep -m1 '^DATABASE_URL=' "$envfile" | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
[ -n "$url" ] || { echo "DATABASE_URL is empty in that .env"; exit 2; }
q() { psql "$url" -X -q -t -A -v ON_ERROR_STOP=1 -c "$1"; }
if [ "$(q "SELECT 1 FROM pg_database WHERE datname = 'god_plan'")" = "1" ]; then
  echo "god_plan: exists (nothing changed)"; exit 0
fi
q "CREATE DATABASE god_plan"
[ "$(q "SELECT 1 FROM pg_database WHERE datname = 'god_plan'")" = "1" ] && echo "god_plan: created"
