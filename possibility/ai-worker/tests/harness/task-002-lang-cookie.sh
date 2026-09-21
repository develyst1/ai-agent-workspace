#!/usr/bin/env bash
# TASK-002 evidence: the `lang` cookie drives <html lang> server-side (REQ-005 R3/R5).
# Run with the FE dev server up on http://localhost:3000 (npm run dev in possibility-front).
set -e
echo -n "no cookie   -> "; curl -s http://localhost:3000/ | grep -o '<html[^>]*lang="[a-z]*"'
echo -n "lang=en     -> "; curl -s -b "lang=en" http://localhost:3000/ | grep -o '<html[^>]*lang="[a-z]*"'
echo -n "lang=th     -> "; curl -s -b "lang=th" http://localhost:3000/ | grep -o '<html[^>]*lang="[a-z]*"'
echo -n "lang=bogus  -> "; curl -s -b "lang=xx" http://localhost:3000/ | grep -o '<html[^>]*lang="[a-z]*"'
