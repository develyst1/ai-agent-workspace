#!/usr/bin/env bash
# Run ON THE MAC. Forwards the pod's Ollama to this Mac's port 11435, so scripts here
# call http://localhost:11435 as if the model were local. (11435, not 11434, so it never
# collides with a local Ollama.) Ctrl-C closes it.
#
# Usage:  bash llm-rent/tunnel.sh <pod-public-ip> <pod-ssh-port>
#         (RunPod: Connect → "SSH over exposed TCP" shows both)
set -euo pipefail
IP="${1:?pod public ip}"
PORT="${2:?pod ssh port}"
KEY="${KEY:-$HOME/.ssh/id_ed25519}"
echo "Tunnel: localhost:11435 → pod 127.0.0.1:11434  (Ctrl-C to close)"
exec ssh -N -o ServerAliveInterval=30 -i "$KEY" -p "$PORT" -L 11435:127.0.0.1:11434 "root@$IP"
