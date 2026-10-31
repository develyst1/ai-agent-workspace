# Memory-card pilot — one row per clear (ORDER 43)

> Porter, Sober and Silver on i-space only. A role is cleared only after
> `node scripts/memory/ready-to-clear.mjs i-space <Name>` prints READY; Atom then types `/clear` and
> `/desk i-space <Name>` in that tmux session, one role at a time, never the team at once.
> **Atom writes each row** (reads /usage before and after). Card size = `wc -c cards/<Name>.md` at the clear.
> Context size: what the session shows, if visible, else `—`. Atlas reports after one working day.

| Date time | Name | Card size (B) | /usage % before | /usage % after | Context before → after | Note |
|---|---|---|---|---|---|---|
| 2026-10-30 15:13 | Sober | 3479 | session 10%, week 25% | session 10%, week 25% | — | READY (distilled 15:00); /clear + /desk i-space Sober; session started startup reading |
| 2026-10-30 15:20 | Silver | 3427 | session 11%, week 25% | session 11%, week 25% | — | READY (distilled 15:11); /clear + /desk i-space Silver; session started startup reading |
| 2026-10-30 15:28 | Porter | 2871 | session 12%, week 25% | session 12%, week 25% | — | READY (distilled 15:24); /clear + /desk i-space Porter; session started startup reading |
| 2026-10-30 16:19 | Sober | 3628 | session 18%, week 27% | session 18%, week 27% | — | READY (distilled 16:11); 2nd clear; /clear + /desk i-space Sober; session started startup reading |
| 2026-10-30 16:22 | Silver | 4082 | session 18%, week 27% | session 18%, week 27% | — | READY (distilled 16:14); 2nd clear; /clear + /desk i-space Silver; session started startup reading |
| 2026-10-30 17:06 | Silver | 4047 | session 22%, week 28% | session 22%, week 28% | — | READY (distilled 17:01); 3rd clear; /clear + /desk i-space Silver; session started startup reading |
| 2026-10-30 17:16 | Sober | 3912 | session 23%, week 28% | session 23%, week 28% | — | READY (distilled 17:11); 3rd clear; /clear + /desk i-space Sober; session started startup reading |
| 2026-10-30 17:24 | Silver | 4082 | session 23%, week 28% | session 23%, week 28% | — | READY (distilled 17:14); 4th clear; /clear + /desk i-space Silver; session started startup reading |
| 2026-10-30 18:13 | Sober | 4094 | session 2%, week 29% | session 2%, week 29% | — | READY (distilled 18:08); 4th clear; /clear + /desk i-space Sober; session started startup reading |
| 2026-10-30 18:36 | Silver | 4087 | session 4%, week 30% | session 4%, week 30% | — | READY (distilled 18:29); 5th clear; /clear + /desk i-space Silver; session started startup reading |
| 2026-10-30 19:04 | Porter | 4066 | session 7%, week 31% | session 7%, week 31% | — | READY (distilled 18:57); /clear + /desk i-space Porter; session started startup reading |
| 2026-10-30 20:32 | Sober | 3981 | session 11%, week 32% | session 11%, week 32% | — | READY (distilled 20:26); /clear + /desk i-space Sober; session started startup reading (1 bg shell was open) |
| 2026-10-30 21:34 | Sober | 4061 | session 17%, week 33% | session 17%, week 33% | — | READY (distilled 21:29); /clear + /desk i-space Sober; session started startup reading (1 bg shell was open) |
| 2026-10-30 22:58 | Sober | 4080 | session 23%, week 34% | session 23%, week 34% | — | READY (distilled 22:34); /clear + /desk i-space Sober; session started startup reading (1 bg shell was open) |
| 2026-10-31 00:39 | Sober | 4095 | session 6%, week 36% | session 6%, week 36% | — | READY (distilled 00:34); /clear + /desk i-space Sober; session started startup reading (1 bg shell was open) |
| 2026-10-31 01:48 | Sober | 4082 B | /usage shows tips only (no %) | same (no %) | — | pilot clear after 01:42 distill (READY) |
| 2026-10-31 02:21 | Silver | 4081 | session 14%, week 38% | session 14%, week 38% | — | READY (distilled 02:17 --done, REQ-126 SPEC_DONE); /clear + /desk i-space Silver; session started startup reading (1 bg shell was open) |
| 2026-10-31 02:58 | Silver | 4095 | session 16%, week 38% | Current session: 16% used Current week (all models): 38% used  | — | READY (distilled 02:51 after REQ-126 commit); /clear + /desk i-space Silver; session started startup reading (1 bg shell was open) |
| 2026-10-31 03:08 | Porter | 4077 B | session 17% / week 39% | session 17% / week 39% | — | watch-run clear after 03:01 re-distill (READY); /desk restarted, reading; QA REQ-124 r2 live run in progress |
| 2026-10-31 03:43 | Sober | 4082 B | session 19% / week 39% | Current session: 19% used Current week (all models): 39% used  | — | watch-run clear (READY, distilled 01:47; prior 01:48 clear apparently didn't take, pane still held 134k ctx); /clear + /desk i-space Sober; session started reading (role-sa loaded) |
| 2026-10-31 04:14 | Porter | 4095 B | session 0% / week 40% | Current session: 0% used Current week (all models): 40% used  | — | clear after re-distill 04:08 (idle, PM inbox empty; ball with Team B) |
| 2026-10-31 04:3x | Silver | 4067 B | session 2% / week 40% | session 2% / week 40% | — | READY after REQ-126 r2 SPEC_DONE 04:29; idle, nothing pending; /desk reloaded |
