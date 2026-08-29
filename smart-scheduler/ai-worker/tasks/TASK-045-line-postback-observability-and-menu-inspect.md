# TASK-045: LINE (BE) — make the dead-menu defect diagnosable: inbound-event logging + a menu-inspect command
- Source: SPEC-012 (REQ-015 prod defect — rich menu renders, taps do nothing)
- Status: DONE  (reviewed 2026-07-30 by Sober — read-only verified two levels deep, log placement + privacy verified, tsc 0 / suite 139/0; see ## Review)
- Depends on: none
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why this task exists (read first — it is deliberately NOT a speculative fix)
The rich menu renders correctly in prod but **tapping any button does nothing**. Sober re-verified the **entire
static path and it is correct**: the menu areas are built as `{type:"postback", data:"action=…"}`,
`createRichMenu` POSTs the definition **with** `areas`, the webhook route forwards all events after the
signature check, `handleLineWebhookEvents` dispatches `ev.type === "postback"` → `handlePostback`, and
`eventPostbackData` reads `ev.postback.data` exactly as the LINE API delivers it. Typing `เมนู` works, so the
webhook, signature, linking and reply path are all fine.

⇒ The fault is **runtime/config**, and the remaining hypotheses are only distinguishable by looking at *what
LINE actually has* and *whether the event ever arrives*:
- **(A)** the published menu landed **without/with broken `areas`** (image-only ⇒ taps are dead zones, no event
  is ever sent);
- **(B)** the menu the user actually has linked is **not the one we think** (a stale per-user link from an
  earlier publish, or a menu configured in the **LINE OA Manager**, which takes precedence over API-created ones);
- **(C)** the OA isn't delivering postback events at all (OA response-mode / webhook settings).

**We currently cannot tell these apart, because a *successful* postback logs nothing either** — inbound events
are logged only on error, and `handlePostback` has a **silent `return`** when replyToken/userId/data is missing.
So: build the instrumentation first, then fix from evidence. Do **not** start changing the menu-building or
postback code on a guess.

## What to do
**1. Inbound-event observability (small, permanent value):**
- In `handleLineWebhookEvents`, log **one line per inbound event** before dispatch: event `type`, and for
  postbacks the raw `data` (or at least the parsed `action`), plus a short user marker — **never the full LINE
  userId or any token** (log a prefix/hash if you need to correlate).
- In `handlePostback`, replace the silent `return` with a **logged** early-exit that says *which* field was
  missing (replyToken / userId / data).
- Log unknown/unhandled `action` values too — a typo'd action would otherwise look identical to "nothing arrived".
- Keep it cheap and non-spammy (one line per event); this is production logging, not debug tracing.

**2. `bun run line:inspect-menus` — a read-only diagnostic command** (same convention as `line:publish-menus`,
`scripts/line-inspect-menus.ts`):
- Read the stored ids from `app_settings.line_rich_menu_ids`, then for each call **`GET /v2/bot/richmenu/{id}`**
  and print: name, size, `chatBarText`, and **the `areas` array (count + each area's bounds + its
  `action.type`/`data`)** — this is the direct test of hypothesis (A).
- Call **`GET /v2/bot/user/all/richmenu`** (the default) and print which id is the default.
- Accept an optional LINE userId argument → **`GET /v2/bot/user/{userId}/richmenu`** to show **which menu that
  specific user actually has linked** — the direct test of hypothesis (B).
- Also list **`GET /v2/bot/richmenu/list`** so a menu created outside our publish (e.g. OA Manager) shows up.
- Read-only: it must never create, link, or delete anything. Fail clearly if `LINE_CHANNEL_ACCESS_TOKEN` is unset.

## Definition of Done
- [ ] After deploy, **one tap on a rich-menu button produces a log line** (or a logged early-exit reason) — i.e.
      the logs can now distinguish "LINE never sent an event" from "we received it and dropped/mishandled it".
- [ ] `bun run line:inspect-menus` prints, for every stored menu id: the `areas` (bounds + action data), the
      default menu id, the full menu list, and — with a userId argument — that user's linked menu.
- [ ] The command is **read-only** and never logs the token; a missing token fails clearly.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (pure tests where sensible — e.g. the log-line formatter /
      argument handling; the LINE API calls are runtime).
- [ ] Notes state exactly what the operator should run and what output to send back (see below).

## Implementation Notes

**Instrumentation only — I changed no menu-building and no postback routing logic.** (Nothing provably defective
turned up while instrumenting, so per your `## Questions` there was nothing to stop and report. The static path
matches your verification.)

**1. Inbound-event observability** — new pure `src/lib/line-log.ts` (formatters isolated so the privacy rule lives
in one place and is testable):
- `userMarker(id)` → `u:<sha256 prefix 8>`; **stable** (correlates a user's events) but **never** the raw userId.
- `formatInboundEvent(ev)` → `[line-in] type=postback u:ab12cd34 data=action=checkin` (for messages:
  `msgType=text`, **not** the text content). Logged with `console.info` **once per inbound event, before
  dispatch**, in `handleLineWebhookEvents` — so a tap that *succeeds* now leaves a trace too.
- `formatDroppedPostback(ev)` → `[line-in] DROPPED postback — missing: replyToken,data …`. Replaced the
  **silent `return`** in `handlePostback` (`console.warn`).
- `formatUnknownAction(action, id)` → `[line-in] postback with UNHANDLED action=chekcin …`, emitted when the
  parsed action isn't in the new `KNOWN_POSTBACK_ACTIONS` set (`lang/schedule/checkin/leave/children/register/
  menu/help`) — a typo'd or stale action can no longer masquerade as "nothing arrived".
- One line per event; no tokens, no message bodies.

**2. `bun run line:inspect-menus`** — new `scripts/line-inspect-menus.ts` (+ package.json entry, same convention
as `line:publish-menus`). **Strictly read-only**: it only ever issues LINE **GET**s — added read-only helpers to
`lib/line-rich-menu.ts` (`getRichMenu`, `listRichMenus`, `getDefaultRichMenuId`, `getUserRichMenuId`, and exported
the existing `getMenuIds`). No create/link/delete/republish anywhere in the path. Missing token → clear error,
exit 1, **before** any API call (smoke-verified). It prints, mapped to your three hypotheses:
- **stored ids** from `app_settings.line_rich_menu_ids`, and for each: name / size / chatBarText / selected +
  **the full `areas` array** (count, each area's bounds, `action.type`, `data`) — and shouts
  `⚠️ NO AREAS → every tap is a dead zone (hypothesis A)` when `areas` is empty. ← **test of (A)**
- **channel default** (`GET /user/all/richmenu`), flagged if it isn't one of our stored ids (or if none is set).
- **full channel list** (`GET /richmenu/list`), flagging any menu `⚠️ created outside our publish (OA Manager?)`.
- with a **userId argument**: that user's linked menu (`GET /user/{userId}/richmenu`) — `(no per-user link → sees
  the default)` or the linked id + its areas, flagged if it isn't ours (**stale link**). ← **test of (B)**

### 👉 Exact operator instructions (what to run, what to send back)

On the server, from the `smart-scheduler-back` source dir, with the prod `DATABASE_URL` + `LINE_CHANNEL_ACCESS_TOKEN`:

**Step 1 — inspect what LINE actually has** (safe, read-only, changes nothing):
```
bun run line:inspect-menus
bun run line:inspect-menus <the teacher's or parent's LINE userId>
```
→ **send back the full output of both.**

**Step 2 — deploy this build, then tap once and read the log:**
```
# after deploying/restarting :4006
pm2 logs smart-scheduler-back --lines 50      # or the server's log command
```
→ tap **one** rich-menu button on the phone, then **send back the lines containing `[line-in]`.**

**How to read the result (this is the point of the task):**
| Evidence | Conclusion |
|---|---|
| inspect shows `areas: 0` / `NO AREAS` | **(A)** the published menu has no tap areas → taps send nothing |
| user's linked menu ≠ our stored id, or a menu `created outside our publish` | **(B)** wrong/stale menu is live |
| areas look right **and** a tap produces **no** `[line-in]` line at all | **(C)** the OA isn't delivering postbacks (OA response-mode / webhook settings) |
| a tap logs `[line-in] type=postback …` but nothing happens | it reached us → the bug is on our side after all; the `DROPPED`/`UNHANDLED` line will say which |

**Verification** (`H:\scheduler\smart-scheduler-back`):
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **139 pass / 0 fail** (26 files).
- New pure tests: `line-log.test.ts` (marker is stable / never leaks the raw id, postback logs its action data,
  message logs type-not-content, dropped-postback names the exact missing field(s), unhandled-action line) and
  `line-inspect-format.test.ts` (areas rendered with bounds+data; the **NO AREAS / hypothesis A** warning; a
  missing menu id reported not crashed).
- ✅ **Preflight smoke (no network):** `LINE_CHANNEL_ACCESS_TOKEN=` → clear error, **exit 1, no API call**.
- ⚠️ The LINE GETs + the live log line are **runtime** (brownfield: no OA/DB here) — they're exercised by the
  operator steps above.

**DoD:** one log line per inbound event incl. successful taps + logged early-exit reason ✓ · inspect prints areas
/ default / full list / per-user link ✓ · read-only + no token logged + clear fail on missing token ✓ (smoke) ·
tsc clean + `bun test` green with pure tests ✓ · operator instructions stated above ✓ · **no speculative fix** ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Do not "fix" the menu or the postback path in this task.** If while instrumenting you find a concrete,
  provable defect (not a suspicion), stop and tell me — I'll decide whether it belongs here or in a follow-up.
  A speculative change now would muddy the evidence and could mask the real cause.
- The stakeholder has decided the **dead menu stays published** while we diagnose, so the inspect command will
  see the *real* published state — don't republish or unlink anything.

## Review
**Verdict: DONE ✅ (Sober, 2026-07-30).** Exactly the instrumentation asked for — and he held the line on *not*
"fixing" anything, which is what keeps the evidence clean.
- **Read-only property — the thing I checked hardest**, because this runs against the live OA and a stray write
  would make a live degradation worse. Verified two levels deep: the script contains **no POST/PUT/DELETE/PATCH
  and no create/link/upload/publish/delete call** (grep), and all four new helpers (`getRichMenu`,
  `listRichMenus`, `getDefaultRichMenuId`, `getUserRichMenuId`) use `fetch` **without a `method`** ⇒ plain GETs.
  Missing token → clear error + `exit 1` **before** any API call. Safe to hand to an operator.
- **Observability verified in place:** `console.info(formatInboundEvent(ev))` sits **before** the dispatch in
  `handleLineWebhookEvents`, so a tap that *succeeds* now also leaves a trace — that's the whole point. The
  silent `return` in `handlePostback` is replaced by a logged early-exit naming the missing field, and unknown
  actions are logged against a `KNOWN_POSTBACK_ACTIONS` set (a typo can no longer masquerade as "nothing arrived").
- **Privacy rule enforced in one place and actually honored:** `userMarker` logs a **sha256 prefix**, never the
  raw LINE userId; the formatter logs `msgType` but **not message text**; no token anywhere. Good call isolating
  it in a pure module so it's testable.
- **Verified myself:** `bunx tsc --noEmit` → 0; full `bun test` → **139/0** (up from 131 — new pure tests for the
  formatters/marker).
- **Operator instructions are concrete and correctly ordered** — and note the useful property he preserved:
  **Step 1 (`line:inspect-menus`) needs no deploy** (it only reads the LINE API + `app_settings`), so it can
  produce evidence immediately; only Step 2 (tap → log) needs this build live. If Step 1 shows empty `areas` or a
  foreign/stale linked menu, we may not need Step 2 at all.
- **TASK-045 → DONE.** The tooling now exists, so I'm raising the **DATA REQUEST** (exact commands, on the board)
  — that was deliberately withheld until there was something real to run.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-045 | LINE (BE): 🔴 **diagnose dead rich-menu taps** — inbound-event logging + read-only `line:inspect-menus` (areas / default / per-user link). **No speculative fix.** | SPEC-012 | ✅ **DONE** (Sober-verified read-only + privacy) | Jason | — |
```
