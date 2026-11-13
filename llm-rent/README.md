# llm-rent — Qwen3-Coder-30B-A3B on a rented RTX 4090

Scripts live on the Mac; only the model runs on the rented machine. Scripts call
`BASE_URL=http://localhost:11435/v1` (OpenAI-compatible), so moving between a local Ollama
(`:11434`) and the rented one is one variable.

## Once (the operator — account, payment and key are his)
1. Sign up at runpod.io and add credit.
2. Settings → SSH Public Keys → paste the contents of `~/.ssh/id_ed25519.pub` (the **.pub** file only).
3. Storage → create a Network Volume (~50 GB) in a region that has RTX 4090. Models stay there across rentals.

## Each time
1. Deploy a Pod: **RTX 4090**, template *RunPod PyTorch* (Ubuntu + CUDA), attach the volume at `/workspace`.
2. Copy the setup script up and run it (first run downloads ~19 GB; later runs reuse the volume):
   `scp -P <port> llm-rent/setup.sh root@<ip>:/workspace/` then `ssh -p <port> root@<ip> 'bash /workspace/setup.sh'`
3. On the Mac: `bash llm-rent/tunnel.sh <ip> <port>` (leave it open)
4. On the Mac: `bash llm-rent/test.sh`
5. **Stop the pod when done** — it bills by the hour while running, idle or not.

## Rules
- Ollama listens on the pod's localhost only; never expose port 11434 publicly.
- Nothing secret goes to the pod: no `picklocker/` files, no customer data, no `*.local.txt`.
- Model + context: `qwen3-coder:30b` (~19 GB) at 32K context fits 24 GB. Larger context → `CTX=` smaller model or a bigger card.
