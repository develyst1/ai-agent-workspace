#!/usr/bin/env bash
# Run ON THE MAC while tunnel.sh is open. One request through the OpenAI-compatible API,
# the same endpoint any script or coding tool would use.
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:11435/v1}"
MODEL="${MODEL:-qwen3-coder:30b}"
curl -fsS "$BASE_URL/chat/completions" -H 'Content-Type: application/json' -d "{
  \"model\": \"$MODEL\",
  \"messages\": [{\"role\": \"user\", \"content\": \"Write a Python function is_prime(n). Code only.\"}]
}" | python3 -c 'import sys,json; r=json.load(sys.stdin); print(r["choices"][0]["message"]["content"]); print("--- tokens:", r.get("usage"))'
