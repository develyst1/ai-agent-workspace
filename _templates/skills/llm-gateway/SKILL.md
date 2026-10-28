---
name: llm-gateway
description: "Load when any desk's code (or a role's design, test or probe) must call an LLM — chat, Thai text generation, comparing models — through the owner's own gateway 'AI Develyst' (prod https://ai.develyst.online, local http://localhost:3009). Covers the three endpoints (GET / info, GET /models, POST /chat, POST /chat/multi), the request and normalized AIResponse shapes, the provider/model list, the default fallback chain deepseek→xai→gemini→openai, errors, how to wire it into an app (base URL from env, never a key in git), and the Bruno collection in references/. Do NOT use for the gateway's own source code (that is the gateway desk's work), or for calling Anthropic/OpenAI SDKs directly."
---

# llm-gateway — calling the owner's LLM gateway from any project

> **Owner, 2026-10-28 (via Atom):** *"ช่วยทำเป็น all knowledge หรืออะไรก็ได้ที่นำความรู้นี้ไปใช้ในโปรเจคไหนก็ได้
> เพราะใช้บ่อย"*. Source: his Bruno collection, copied verbatim into `references/bruno/` (open it in Bruno to try
> every call; each request carries its expected response and tests). If a desk's own files disagree with this
> skill, the desk wins. Report the difference to your PM.

## 1. Where it runs

| env | base URL |
|---|---|
| production | `https://ai.develyst.online` |
| local (the gateway running on your machine) | `http://localhost:3009` |

**Your app reads the base URL from config/env**, e.g. `LLM_GATEWAY_URL`. Never hard-code it.

## 2. Endpoints

| call | does |
|---|---|
| `GET /` | service info: `name` (`"AI Develyst"`), `version`, `supported_models`, `endpoints` |
| `GET /models` | `{ openai: [...], gemini: [...], xai: [...], deepseek: [...] }`, the models each provider accepts |
| `POST /chat` | one model |
| `POST /chat/multi` | several models in parallel. Answers come back in the order of `configs` |

Models listed in the collection (2026-10-28). **`GET /models` is the truth, so call it rather than trusting this list:**
- openai: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`, `gpt-4.1-nano`
- gemini: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-flash`, `gemini-1.5-pro`
- xai: `grok-4-latest`, `grok-3`, `grok-3-mini`, `grok-2-1212`
- deepseek: `deepseek-v4-flash`, `deepseek-chat`, `deepseek-reasoner`

## 3. Request

`POST /chat`, JSON:
```json
{
  "provider": "deepseek",            // optional: openai | gemini | xai | deepseek
  "model": "deepseek-v4-flash",      // optional
  "temperature": 0.7,                // optional
  "max_tokens": 512,                 // optional
  "messages": [
    { "role": "system", "content": "คุณคือผู้ช่วย AI ที่ตอบภาษาไทยสั้น ๆ และชัดเจน" },
    { "role": "user",   "content": "สวัสดี! คุณคือใคร?" }
  ]
}
```
- **No `provider` ⇒ fallback chain `deepseek → xai → gemini → openai`.** The first provider that succeeds answers,
  so `data.provider` tells you which one it was.
- `POST /chat/multi` takes `{ "configs": [ <one /chat body per model> ] }`.

## 4. Response (always normalized)

```json
{ "success": true,
  "data": { "provider": "deepseek", "model": "deepseek-v4-flash", "content": "…",
            "usage": { "prompt_tokens": 13, "completion_tokens": 331, "total_tokens": 344 },
            "latency_ms": 4576 } }
```
- `/chat/multi` ⇒ `data` is an **array** of those objects, one per config, in order. **One provider failing does
  not fail the others.** Its entry carries its own error, so check each entry.
- `usage` **may be missing** when a provider doesn't return it. Code must not assume it.
- Failure ⇒ HTTP **500** `{ "success": false, "error": "<message>" }`. With no provider given, you get this only
  when every provider in the chain failed.

## 5. Rules when a desk uses it

- **No key is needed, for now.** Owner, 2026-10-28: *"เกตเวย์ไม่ต้องใช้คีย์ ณ ตอนนี้"*. Send no auth header.
  **It may need one later.** So keep the client's auth pluggable: one optional env value, unset today. If the
  gateway starts answering **401/403**, ask for the key and its header name by DATA REQUEST through your chain, and
  keep the key in a git-ignored `.env`. Never invent a header name, and never put a key in git.
- **Tests never call production.** Unit tests mock the HTTP call with the shapes in §4. A live call is a probe
  (QA/SA, on a test environment, small `max_tokens`), and its cost is real money.
- **Personal data:** the gateway forwards prompts to third-party providers. Never send real customer or child data
  unless the desk's own rules allow it in writing. Use synthetic text in probes.
- Set timeouts and handle the 500 / empty `content` case visibly. Never fall back silently to a made-up answer.
- Record which provider/model a feature depends on in the desk's `SYSTEM-FACTS.md`. Models get retired, and
  `GET /models` will tell you when one has gone.
