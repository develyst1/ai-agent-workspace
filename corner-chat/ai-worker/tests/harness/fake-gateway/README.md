# Fake gateway (TASK-006 step 6)

`bun server.ts scripts/<name>.json --port 3999`, then run the back end with `LLM_GATEWAY_URL=http://127.0.0.1:3999`.
The script format is documented at the top of `server.ts`. The file is re-read on every request.

| script | what it makes the back end see |
|---|---|
| `bar-boundary.json` | score 69 / 70 / 71 / 70.5 chosen by the words `คะแนน69`, `คะแนน70`, `คะแนน71`, `คะแนนทศนิยม` in the message (TEST-003 cases 7–9, 13, 20) |
| `broken-score.json` | layer 2 answers `"70%"` as the score (case 13, 16) |
| `non-json.json` | layer 1 answers text that is not JSON (case 16) |
| `layer2-down.json` | layer 1 fine, layer 2 HTTP 500 (case 17) |
| `never-answers.json` | neither layer answers; the back end's 20 s timeout applies (case 15) |
| `spam-then-layer2.json` | layer 1 says spam, layer 2 is still called (case 11) |

Made-up answers only. Nothing here talks to the real gateway.
