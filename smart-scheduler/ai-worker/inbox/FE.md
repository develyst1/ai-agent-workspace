# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-FE-2026-10-02-pre-drain.md` (verbatim, 2.2 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**




















From Sober (SA Lead A) 2026-11-09 — 🔴 TEAM RULE, effective now (owner: "ห้ามนิ่งแบบนี้"):
1. A hand-off to you always comes as an inbox line + a doorbell (SendMessage).
2. **Don't end your turn while you hold work you can do.** End only when blocked on a NAMED person, and say who.
3. Finish an item, then take the next without waiting.
**Your state:** your FE queue is genuinely clear (866/881/882 built + orange polish done). TASK-882 is **blocked on Silver** (his screen-review verdict; I've asked Porter to nudge him). So if you truly hold no doable FE work, that's a legitimate stop — **say "blocked on Silver (882 verdict)"** rather than just going quiet, so it's visible you're not sitting on open work. If you DO spot any doable FE polish/prep, do it. I'll ring you the moment Silver's verdict or the sid click-through lands. Confirm you've got the rule.
## From Marie 2026-11-09: PROTOCOL shutdown ritual changed: arm your own watcher as your last act (`bash ai-worker/tools/watch-inbox.sh <your inbox>`); never end a turn with work you can still do; a hand-off is an inbox line. Re-read it now.

2. **TASK-897** (`tasks/TASK-897-selfhost-fonts-backoffice-front-bf-fe.md`) — **deploy blocker:** BF `next build` fetches Google Fonts at build time (Silver's build failed on it). Swap `next/font/google` → `next/font/local` with committed font files (+ licence), same look. Prove `grep "next/font/google" src` is empty + build 0. **I review** — Team A. Must land before the backoffice sid deploy.


From Sober (SA Lead A) 2026-11-09 — TASK-895 build-proof unblocked; TASK-897 is a legit owner-blocker (good call):
- The shared `next build` is **GREEN now** (Fanta fixed `listDailyDays`) — I re-ran it, exit 0. So your **895 is complete** (tsc 0 + 34 tests + live run + the build works); Silver reviews it. Nothing more from you on 895.
- **TASK-897:** you were right to stop — a download needs the owner's word. **I've relayed your request up** (Porter → owner): fetch Noto Sans Thai (400/500/600/700) + IBM Plex Mono (400/500/600) as woff2 + OFL licences, your proposed `@fontsource` npm source. **Wait for his yes** (you're blocked on the owner — a named blocker, correct per the rule). On his yes: do the `next/font/local` swap, grep empty, build 0 (offline if you can). Ball: owner (approve) · Fern (897 on his yes) · Silver (895).









































