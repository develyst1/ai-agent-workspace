# TASK-509 — `/api/openapi.json` and `/api/docs` are public ON PURPOSE: write the reason where someone would close them — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** 🔨 Owner ruling via Porter: **they stay public — another team uses them.**

## §0 Why this is a task and not a note
You found these two while enumerating the unguarded routes (TASK-501): **the only public doors that carry no credential of their own.** I sent it up as a decision, and the decision is **keep them.**
🔑 **So the risk changes direction: the danger is no longer that they are open, it is that someone CLOSES them.** They sit in a file whose whole subject is "these routes run without the guards", next to a test that makes anyone adding a public route justify it. **The next person to read that list will see two unauthenticated routes serving our full API shape and will reasonably try to fix it** — and they would break another team without ever knowing that team exists.
📌 **A decision nobody can find is a decision that gets reversed.**

## §1 Build
- **The reason beside the route**, in `index.ts` where they are registered: **public on purpose, another team consumes them, the owner's ruling of 2026-09-26.** Short, and phrased so a stranger stops rather than asks.
- **And in TASK-501's evidence entry for those two routes**, since that is where the next person will actually be standing when they wonder — the test that already makes them account for each unguarded route.
- 🔑 **Say what they actually expose**, in one line each, so the note is a statement of fact rather than a reassurance: **the route list and DTO shapes, and no customer data** (you walked them and found none). **If that is not exactly true, say what else is in them** — a note that overclaims safety is worse than no note.
- 🚫 Nothing about the routes themselves changes. 🚫 No new test beyond the evidence text, unless you think the "they must stay public" property deserves one — **if you do, say why; I lean no**, because a test that fails when someone secures a route would be odd to meet without context.

## Definition of Done
- [ ] The reason recorded at the registration **and** in TASK-501's evidence · what they expose stated as fact in one line each, **not overclaimed** · nothing else changed · suite **count** · tsc 0 · 59 = 59 · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-26): the reason is at the registration AND in TASK-501's evidence, with what they expose stated as walked · nothing about the routes changed · 3297 / 0 normal AND unreachable · tsc 0 · 59 = 59

## §1 Where it is written
- **`index.ts`, at the registration** (the one comment line `// API docs (Swagger UI) — public` is replaced). It says:
  - **PUBLIC ON PURPOSE, another team uses them, the owner's ruling of 2026-09-26**;
  - *"Do not put them behind the guards to 'fix' them: that breaks a consumer you cannot see from this file. Closing them is the owner's call."*
  - then the facts below.
- **TASK-501's evidence** (`pre-guard-routes-req108.test.ts`): both entries' `why` now open with **PUBLIC ON PURPOSE — another team uses it (owner, 2026-09-26, TASK-509)** and point at the registration.
- `docs.ts`, `openapi/document.ts` and every route: **no diff.**

## §2 What they expose: walked, not assumed (a pattern scan of the whole document; values never printed)
- **`openapi.json` is a HAND-WRITTEN, PARTIAL schema** (`openapi/document.ts`, last edited 2026-09-07): **17 paths** against **~130 guarded routes** (`ROUTE_ACCESS`), and **7 schemas**.
  - It carries route names, request/response shapes and the bearer-token scheme.
  - **No customer data:** zero phones, emails, LINE ids, uuids, IPs or tokens; **no host** (no `servers` URL); **no coach-rate field**.
  - 5 `example`s: a date, two times, and the login pair (below).
  - ⚠️ So **"our full API shape" overclaims.** It's a small, stale subset, and the note says "PARTIAL" so nobody leans on it as complete.
- **`docs`** is the Swagger UI page for that document. **Its script and style load from `cdn.jsdelivr.net`** (the package's default `DEFAULT_CDN_BASE`), so a viewer's browser fetches third-party code. That's stated as fact.
- 📌 **Mounted TWICE:** `/api/openapi.json` + `/api/docs` (the reverse proxy's) **and** `/openapi.json` + `/docs` at the root (a direct hit on the Bun port). The root pair isn't under `/api/*`, so TASK-501's list doesn't cover it; the note at the registration covers both.

## §3 ⚠️ One thing to know (named, not changed; the document is out of scope)
- **The public login example is `username: "admin"`, `password: "admin"`.**
  - **The password is NOT usable:** every password write (`createUser`, the bootstrap check) requires **8+ characters**.
  - **But `admin` is also `.env.example`'s `BOOTSTRAP_ADMIN_USERNAME`**, so the public page likely names the first super-admin's username.
  - That's low risk on its own, but it's the kind of detail worth replacing with a neutral example (`"your.username"`) when someone next touches the document. **Your call, or the owner's.**
  - (Whether any account created before the 8-character rule still has a short password is a data question I can't answer from code.)

## §4 No new test: I agree with you
A test that fails when someone **secures** a route would be met without context, and would read as the test being wrong. **The reason belongs where the decision gets reversed** (the registration and the evidence list), and that's where it now is. The evidence test already makes anyone touching an unguarded route stand in front of that text.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified: **3297 / 0 normally and unreachable**, tsc 0, 59 = 59, and the routes themselves show **no diff** — which is the whole point of the task.

✅ **The note is phrased to stop a stranger rather than invite a question** — *"Do not put them behind the guards to 'fix' them: that breaks a consumer you cannot see from this file. Closing them is the owner's call."* **That sentence does the work**: it names the invisible party, and it says whose decision it is.
🔑 **He corrected MY words, and was right to.** I wrote that these routes publish "our full API shape". **They do not: it is a hand-written, PARTIAL document — 17 paths against ~130 guarded routes, last touched 2026-09-07.** ⇒ *"our full API shape" overclaims*, and he wrote **PARTIAL** into the note so nobody leans on it as complete. 📌 **A note that overclaims the risk is as bad as one that overclaims the safety** — the first gets the decision reversed by someone who checks and finds it exaggerated.
✅ **`/openapi.json` and `/docs` are ALSO mounted at the root**, outside `/api/*`, so TASK-501's list never covered them. **Found by reading rather than by trusting the list I gave him**, and the note covers both.
✅ **The Swagger page loads its script and style from a third-party CDN** — stated as fact, not raised as alarm. Correct: it is true, it is the package's default, and the owner may or may not care.
✅ **No new test, and we agree for the same reason:** a test that fails when someone **secures** a route would be met without context and read as the test being wrong. **The reason belongs where the decision gets reversed**, which is where it now is.

## ▶️ His finding: **TASK-511, cut.**
**The public login example is `admin` / `admin`.** The password is unusable (8-character minimum) — **but `admin` is also `.env.example`'s bootstrap username**, so a public page probably names the first super-admin's account.
**Low risk, and not nothing:** it is a free hint on a page anyone can read, and it costs one word to remove. 📌 **He named the limit of his own claim too** — whether an account predating the 8-character rule still has a short password is a **data question he cannot answer from code**, and he said so instead of assuring me.
