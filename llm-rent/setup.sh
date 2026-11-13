#!/usr/bin/env bash
# Run ON THE RENTED GPU MACHINE (Linux + NVIDIA, e.g. a RunPod pod), as root.
# Installs Ollama, keeps models on the persistent volume, serves on localhost only,
# and pulls the model. Re-running it is safe.
#
# Usage on the pod:  bash setup.sh
set -euo pipefail

MODEL="${MODEL:-qwen3-coder:30b}"            # ~19 GB, Q4_K_M, MoE 30.5B / 3.3B active
CTX="${CTX:-32768}"                          # ~19 GB weights + ~3 GB KV fits a 24 GB card
MODELS_DIR="${MODELS_DIR:-/workspace/ollama-models}"  # RunPod network volume survives a stop

nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || { echo "No NVIDIA GPU visible"; exit 1; }

if ! command -v ollama >/dev/null; then
  apt-get update -qq && apt-get install -y -qq curl zstd >/dev/null
  curl -fsSL https://ollama.com/install.sh | sh
fi

mkdir -p "$MODELS_DIR"
export OLLAMA_MODELS="$MODELS_DIR"
export OLLAMA_HOST=127.0.0.1:11434           # localhost only: reach it through the SSH tunnel, never a public port
export OLLAMA_CONTEXT_LENGTH="$CTX"
export OLLAMA_KEEP_ALIVE=30m

if ! curl -fsS http://127.0.0.1:11434/api/version >/dev/null 2>&1; then
  nohup ollama serve > /workspace/ollama.log 2>&1 &
  for i in $(seq 1 30); do curl -fsS http://127.0.0.1:11434/api/version >/dev/null 2>&1 && break; sleep 1; done
fi

ollama pull "$MODEL"
ollama list
echo "READY: $MODEL on 127.0.0.1:11434 (ctx $CTX). Open the tunnel from the Mac: bash tunnel.sh <ip> <port>"
