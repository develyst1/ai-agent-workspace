# gateway-stub — stand-in for the AI gateway (TASK-006, SPEC-002 P1/P2)

Never calls a real gateway. Synthetic data only.

- Start: `bun god-plan/ai-worker/tests/harness/gateway-stub/server.ts` (127.0.0.1:4399). Point the back at it with
  `LLM_GATEWAY_URL=http://127.0.0.1:4399`.
- `POST /chat` answers in the gateway's shape. The answer follows `mode.txt` in this folder, read on every request;
  a missing file means `ok`. Switch with `echo hang > mode.txt`, no restart:
  `ok` (JSON array of 5 Thai titles if the system prompt contains "JSON", else 3 Thai sentences) · `500` (HTTP 500
  `{success:false,error:"stub 500"}`) · `hang` (answers after 40 s) · `empty` (`content: ""`) · `malformed`
  (HTTP 200 whose body is not valid JSON: `{"success":true,"data":`). Any other value: HTTP 500 `stub: unknown mode`.
- Every `POST /chat` is appended to `calls.jsonl` as `{"at": ISO, "body": <request JSON>}`.
  `GET /calls` → `{"count", "calls"}`; `DELETE /calls` empties it.
- `mode.txt` and `calls.jsonl` are scratch files. Delete them when you are done.
